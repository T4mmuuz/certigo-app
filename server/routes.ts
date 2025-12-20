import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { insertUserSchema, users } from "@shared/schema";
import pgSession from "connect-pg-simple";
import { pool } from "./db";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { registerObjectStorageRoutes, ObjectStorageService } from "./replit_integrations/object_storage";

const PLATFORM_COMMISSION_RATE = 0.15; // 15% commission
const PREMIUM_PRICE_CENTS = 2700; // $27/month premium subscription

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth Setup
  const PGStore = pgSession(session);
  
  app.use(session({
    store: new PGStore({ pool, createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) return done(null, false, { message: "Incorrect username." });
      // In a real app, compare hashed passwords. For MVP, simple comparison (NOT SECURE for production)
      if (user.password !== password) return done(null, false, { message: "Incorrect password." });
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Auth Routes
  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const { referralCode } = req.body;
      const existing = await storage.getUserByUsername(input.username);
      if (existing) return res.status(400).json({ message: "Username already exists" });
      
      // Check if referral code is valid
      let referrerId: number | undefined;
      if (referralCode) {
        const referrer = await storage.getUserByReferralCode(referralCode);
        if (referrer) {
          referrerId = referrer.id;
        }
      }
      
      const user = await storage.createUser({
        ...input,
        referredBy: referrerId,
      });
      
      // Create referral record if valid referrer
      if (referrerId) {
        await storage.createReferral({
          referrerId,
          referredId: user.id,
          status: "pending",
          rewardAmount: 500, // $5 reward
        });
      }
      
      req.login(user, (err) => {
        if (err) return res.status(500).json({ message: "Login failed after registration" });
        res.status(201).json(user);
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        console.error("Registration error:", err);
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  app.post(api.auth.login.path, passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.logout(() => {
      res.status(200).send();
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).send();
    }
  });

  // Register object storage routes
  registerObjectStorageRoutes(app);
  const objectStorageService = new ObjectStorageService();

  // Profile picture update
  app.patch("/api/users/profile-picture", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const { objectPath } = req.body;
      if (!objectPath) return res.status(400).json({ message: "objectPath is required" });
      
      // Set ACL policy for the uploaded image to be public
      const normalizedPath = await objectStorageService.trySetObjectEntityAclPolicy(objectPath, {
        owner: String((req.user as any).id),
        visibility: "public",
      });
      
      // Update user profile picture
      const updatedUser = await storage.updateUserProfilePicture((req.user as any).id, normalizedPath);
      res.json(updatedUser);
    } catch (err) {
      console.error("Profile picture update error:", err);
      res.status(500).json({ message: "Failed to update profile picture" });
    }
  });

  // Generate referral code for user
  app.post("/api/users/generate-referral-code", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const user = req.user as any;
      if (user.referralCode) {
        return res.json({ referralCode: user.referralCode });
      }
      const code = `CERTI${user.id}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const updatedUser = await storage.updateUserReferralCode(user.id, code);
      res.json({ referralCode: updatedUser.referralCode });
    } catch (err) {
      console.error("Generate referral code error:", err);
      res.status(500).json({ message: "Failed to generate referral code" });
    }
  });

  // Get referral stats
  app.get("/api/users/referral-stats", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const userId = (req.user as any).id;
      const referrals = await storage.getReferralsByReferrer(userId);
      const completed = referrals.filter(r => r.status === "completed" || r.status === "rewarded");
      const totalRewards = referrals
        .filter(r => r.status === "rewarded")
        .reduce((sum, r) => sum + r.rewardAmount, 0);
      res.json({
        totalReferrals: referrals.length,
        completedReferrals: completed.length,
        pendingReferrals: referrals.filter(r => r.status === "pending").length,
        totalRewardsEarned: totalRewards,
      });
    } catch (err) {
      console.error("Get referral stats error:", err);
      res.status(500).json({ message: "Failed to get referral stats" });
    }
  });

  // Service Packages Routes
  app.get("/api/service-packages", async (req, res) => {
    const providerId = typeof req.query.providerId === 'string' ? parseInt(req.query.providerId) : undefined;
    if (!providerId) return res.status(400).json({ message: "providerId required" });
    const packages = await storage.getServicePackagesByProvider(providerId);
    res.json(packages);
  });

  app.post("/api/service-packages", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const user = req.user as any;
    if (user.role !== "provider") return res.status(403).json({ message: "Only providers can create packages" });
    try {
      const { title, description, serviceIds, totalPrice } = req.body;
      if (!title || !description || !serviceIds || !totalPrice) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Parse service IDs and validate provider owns all services
      let serviceIdArray: number[];
      try {
        serviceIdArray = JSON.parse(serviceIds);
        if (!Array.isArray(serviceIdArray) || serviceIdArray.length === 0) {
          return res.status(400).json({ message: "serviceIds must be a non-empty array" });
        }
      } catch {
        return res.status(400).json({ message: "Invalid serviceIds format" });
      }
      
      // Verify provider owns all services and calculate original price
      let originalPrice = 0;
      for (const id of serviceIdArray) {
        const service = await storage.getService(id);
        if (!service) {
          return res.status(400).json({ message: `Service ${id} not found` });
        }
        if (service.providerId !== user.id) {
          return res.status(403).json({ message: "You can only bundle your own services" });
        }
        originalPrice += service.price * 100; // Convert to cents
      }
      
      const pkg = await storage.createServicePackage({
        providerId: user.id,
        title,
        description,
        serviceIds,
        totalPrice: parseInt(totalPrice),
        originalPrice,
        isActive: true,
      });
      res.status(201).json(pkg);
    } catch (err) {
      console.error("Create package error:", err);
      res.status(500).json({ message: "Failed to create package" });
    }
  });

  app.delete("/api/service-packages/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const pkg = await storage.getServicePackage(parseInt(req.params.id));
      if (!pkg) return res.status(404).json({ message: "Package not found" });
      if (pkg.providerId !== (req.user as any).id) {
        return res.status(403).json({ message: "You can only delete your own packages" });
      }
      await storage.deleteServicePackage(parseInt(req.params.id));
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Failed to delete package" });
    }
  });

  // Services Routes
  app.get(api.services.list.path, async (req, res) => {
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const services = await storage.getServices({ category, search });
    res.json(services);
  });

  app.get(api.services.get.path, async (req, res) => {
    const service = await storage.getService(Number(req.params.id));
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json(service);
  });

  app.post(api.services.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const input = api.services.create.input.parse(req.body);
      const service = await storage.createService(input);
      res.status(201).json(service);
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json(err);
      else res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // Bookings Routes
  app.post(api.bookings.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const user = req.user as any;
      const input = api.bookings.create.input.parse({
        ...req.body,
        customerId: user.id, // Always use authenticated user's ID
        date: new Date(req.body.date)
      });
      const booking = await storage.createBooking(input);
      
      // Get service and customer info for notification
      const service = await storage.getService(booking.serviceId);
      const customer = await storage.getUser(booking.customerId);
      
      if (service && customer) {
        // Notify provider of new booking
        await storage.createNotification({
          userId: service.providerId,
          type: "booking_new",
          title: "New Booking Request!",
          body: `${customer.name} wants to book ${service.title} on ${new Date(booking.date).toLocaleDateString()}`,
          metadata: JSON.stringify({ bookingId: booking.id, serviceId: service.id }),
        });
        
        // Confirm to customer
        await storage.createNotification({
          userId: booking.customerId,
          type: "booking_confirmed",
          title: "Booking Confirmed",
          body: `Your booking for ${service.title} has been submitted. The provider will contact you soon.`,
          metadata: JSON.stringify({ bookingId: booking.id, serviceId: service.id }),
        });
      }
      
      res.status(201).json(booking);
    } catch (err) {
       if (err instanceof z.ZodError) res.status(400).json(err);
       else res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.get(api.bookings.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    // @ts-ignore
    const userRole = req.user.role as 'customer' | 'provider';
    // @ts-ignore
    const userId = req.user.id;
    const bookings = await storage.getBookings(userId, userRole);
    res.json(bookings);
  });

  // Reviews
  app.post(api.reviews.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const input = api.reviews.create.input.parse(req.body);
      const review = await storage.createReview(input);
      
      // Notify provider of new review
      const service = await storage.getService(input.serviceId);
      const customer = await storage.getUser(input.customerId);
      if (service && customer) {
        await storage.createNotification({
          userId: service.providerId,
          type: "review_received",
          title: "New Review Received!",
          body: `${customer.name} left a ${input.rating}-star review for ${service.title}`,
          metadata: JSON.stringify({ reviewId: review.id, serviceId: service.id }),
        });
      }
      
      res.status(201).json(review);
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json(err);
      else res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // Payment Routes
  
  // Get Stripe publishable key
  app.get("/api/stripe/config", async (req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (err) {
      console.error('Error getting Stripe config:', err);
      res.status(500).json({ message: "Failed to get Stripe configuration" });
    }
  });

  // Create checkout session for a booking
  app.post("/api/checkout", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const { serviceId, bookingId, hours = 1 } = req.body;
      
      // Get the service details
      const service = await storage.getService(serviceId);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      // Calculate amounts (in cents)
      const totalAmount = service.price * hours * 100; // Convert to cents
      const platformFee = Math.round(totalAmount * PLATFORM_COMMISSION_RATE);
      const providerPayout = totalAmount - platformFee;

      // Create the booking if not provided
      let finalBookingId = bookingId;
      if (!bookingId) {
        const booking = await storage.createBooking({
          customerId: (req.user as any).id,
          serviceId,
          date: new Date(),
          status: "pending",
        });
        finalBookingId = booking.id;
      }

      // Create transaction record
      const transaction = await storage.createTransaction({
        bookingId: finalBookingId,
        customerId: (req.user as any).id,
        providerId: service.providerId,
        serviceId,
        amount: totalAmount,
        platformFee,
        providerPayout,
        status: "pending",
      });

      // Create Stripe checkout session
      const stripe = await getUncachableStripeClient();
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: service.title,
                description: `${hours} hour(s) of ${service.category} service by ${service.provider.name}`,
              },
              unit_amount: totalAmount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/payment/cancel`,
        metadata: {
          transactionId: transaction.id.toString(),
          bookingId: finalBookingId.toString(),
        },
      });

      // Update transaction with checkout session ID
      await storage.updateTransactionStatus(transaction.id, "pending", undefined);
      
      // Store the session ID in a way we can reference
      await pool.query(
        'UPDATE transactions SET stripe_checkout_session_id = $1 WHERE id = $2',
        [session.id, transaction.id]
      );

      res.json({ url: session.url, sessionId: session.id });
    } catch (err) {
      console.error('Checkout error:', err);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  // Handle successful payment
  app.post("/api/payment/confirm", async (req, res) => {
    try {
      const { sessionId } = req.body;
      
      const stripe = await getUncachableStripeClient();
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (session.payment_status === 'paid') {
        // Update transaction status
        const transaction = await storage.getTransactionByCheckoutSession(sessionId);
        if (transaction) {
          await storage.updateTransactionStatus(
            transaction.id, 
            'completed', 
            session.payment_intent as string
          );
          await storage.updateBookingDepositPaid(transaction.bookingId);
          
          // Get service and booking details
          const service = await storage.getService(transaction.serviceId);
          const booking = await storage.getBooking(transaction.bookingId);
          
          // Only update booking status to accepted if it's currently pending
          // This prevents overwriting completed/cancelled bookings
          if (booking && booking.status === "pending") {
            await storage.updateBookingStatus(transaction.bookingId, "accepted");
          }
          
          if (service && booking) {
            const customer = await storage.getUser(booking.customerId);
            const customerName = customer?.name || "A customer";
            const formattedDate = new Date(booking.date).toLocaleDateString();
            
            // Send payment received notification to provider
            // Keep amount in cents for consistency with transaction schema
            await storage.createNotification({
              userId: service.providerId,
              type: "payment_received",
              title: "Payment Received!",
              body: `${customerName} has paid for ${service.title} on ${formattedDate}. You can start the job!`,
              metadata: JSON.stringify({
                bookingId: transaction.bookingId,
                serviceId: transaction.serviceId,
                customerId: booking.customerId,
                amountCents: transaction.amount
              }),
            });
          }
        }
        
        res.json({ success: true, status: 'paid' });
      } else {
        res.json({ success: false, status: session.payment_status });
      }
    } catch (err) {
      console.error('Payment confirmation error:', err);
      res.status(500).json({ message: "Failed to confirm payment" });
    }
  });

  // Get platform earnings (admin only - simplified for MVP)
  app.get("/api/admin/earnings", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const earnings = await storage.getPlatformEarnings();
      res.json({
        totalEarnings: earnings.totalEarnings / 100, // Convert to dollars
        totalTransactions: earnings.totalTransactions,
        recentTransactions: earnings.recentTransactions.map(t => ({
          ...t,
          amount: t.amount / 100,
          platformFee: t.platformFee / 100,
          providerPayout: t.providerPayout / 100,
        })),
        commissionRate: PLATFORM_COMMISSION_RATE * 100, // 15%
      });
    } catch (err) {
      console.error('Error fetching earnings:', err);
      res.status(500).json({ message: "Failed to fetch earnings" });
    }
  });

  // Get provider earnings (shows provider's net payout, not platform commission)
  app.get("/api/provider/earnings", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const userId = (req.user as any).id;
      const { totalEarnings, transactions: allTransactions } = await storage.getProviderEarnings(userId);
      
      const completedTransactions = allTransactions.filter(t => t.status === "completed");
      const pendingTransactions = allTransactions.filter(t => t.status === "pending");
      const pendingPayouts = pendingTransactions.reduce((sum, t) => sum + t.providerPayout, 0);
      
      res.json({
        totalEarnings: totalEarnings / 100,
        totalJobs: completedTransactions.length,
        pendingPayouts: pendingPayouts / 100,
        recentTransactions: allTransactions.slice(0, 10).map(t => ({
          ...t,
          amount: t.amount / 100,
          platformFee: t.platformFee / 100,
          providerPayout: t.providerPayout / 100,
        })),
      });
    } catch (err) {
      console.error('Provider earnings error:', err);
      res.status(500).json({ message: "Failed to fetch earnings" });
    }
  });

  // Cancel booking (with refund rules)
  app.post("/api/bookings/:id/cancel", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const bookingId = Number(req.params.id);
      const { cancelledBy } = req.body;
      const userId = (req.user as any).id;
      
      const booking = await storage.getBooking(bookingId);
      if (!booking) return res.status(404).json({ message: "Booking not found" });
      
      // Verify the user is authorized to cancel
      const service = await storage.getService(booking.serviceId);
      if (!service) return res.status(404).json({ message: "Service not found" });
      
      const isCustomer = booking.customerId === userId;
      const isProvider = service.providerId === userId;
      
      if (!isCustomer && !isProvider) {
        return res.status(403).json({ message: "Not authorized to cancel this booking" });
      }
      
      // Calculate time until booking
      const hoursUntilBooking = (new Date(booking.date).getTime() - Date.now()) / (1000 * 60 * 60);
      
      // Get transaction for this booking
      const transaction = await storage.getTransactionByBookingId(bookingId);
      
      let refundEligible = false;
      let refundReason = "";
      
      if (cancelledBy === "provider" || isProvider) {
        // Provider cancels or no-shows → Full refund to customer
        refundEligible = true;
        refundReason = "Provider cancelled - full refund";
      } else if (isCustomer) {
        // Customer cancels → No refund regardless of timing
        // Only provider cancellations/no-shows result in refunds
        refundEligible = false;
        if (hoursUntilBooking < 24) {
          refundReason = "Customer cancelled within 24 hours - no refund";
        } else {
          refundReason = "Customer cancelled - no refund per policy";
        }
      }
      
      // Update booking status
      await storage.cancelBooking(bookingId, cancelledBy || (isProvider ? "provider" : "customer"));
      
      // Process refund if eligible and payment was made via app
      if (refundEligible && transaction && transaction.status === "completed" && booking.paymentMethod === "app") {
        try {
          const stripe = await getUncachableStripeClient();
          
          if (transaction.stripePaymentIntentId) {
            const refund = await stripe.refunds.create({
              payment_intent: transaction.stripePaymentIntentId,
            });
            
            await storage.updateTransactionRefund(transaction.id, refund.id, refundReason);
          }
          
          return res.json({ 
            success: true, 
            refunded: true, 
            message: "Booking cancelled and refund processed" 
          });
        } catch (refundErr) {
          console.error('Refund error:', refundErr);
          return res.json({ 
            success: true, 
            refunded: false, 
            message: "Booking cancelled but refund failed - please contact support" 
          });
        }
      }
      
      res.json({ 
        success: true, 
        refunded: false, 
        message: refundEligible ? "Booking cancelled" : `Booking cancelled - ${refundReason}` 
      });
    } catch (err) {
      console.error('Cancel booking error:', err);
      res.status(500).json({ message: "Failed to cancel booking" });
    }
  });

  // Mark provider no-show (customer reports)
  app.post("/api/bookings/:id/provider-noshow", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const bookingId = Number(req.params.id);
      const userId = (req.user as any).id;
      
      const booking = await storage.getBooking(bookingId);
      if (!booking) return res.status(404).json({ message: "Booking not found" });
      
      if (booking.customerId !== userId) {
        return res.status(403).json({ message: "Only the customer can report provider no-show" });
      }
      
      // Update booking status to provider_noshow
      await storage.updateBookingStatus(bookingId, "provider_noshow");
      
      // Process full refund only for app payments
      if (booking.paymentMethod === "app") {
        const transaction = await storage.getTransactionByBookingId(bookingId);
        if (transaction && transaction.status === "completed" && transaction.stripePaymentIntentId) {
          try {
            const stripe = await getUncachableStripeClient();
            const refund = await stripe.refunds.create({
              payment_intent: transaction.stripePaymentIntentId,
            });
            await storage.updateTransactionRefund(transaction.id, refund.id, "Provider no-show - full refund");
            return res.json({ success: true, message: "Provider no-show reported - full refund processed" });
          } catch (refundErr) {
            console.error('Refund error:', refundErr);
            return res.json({ success: true, message: "Provider no-show reported - refund pending, contact support" });
          }
        }
      }
      
      // For cash payments, no refund needed (no payment was made through the app)
      res.json({ 
        success: true, 
        message: booking.paymentMethod === "cash" 
          ? "Provider no-show reported - no app payment was made" 
          : "Provider no-show reported"
      });
    } catch (err) {
      console.error('Provider no-show error:', err);
      res.status(500).json({ message: "Failed to process no-show report" });
    }
  });

  // Mark customer no-show (provider reports)
  app.post("/api/bookings/:id/customer-noshow", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const bookingId = Number(req.params.id);
      const userId = (req.user as any).id;
      
      const booking = await storage.getBooking(bookingId);
      if (!booking) return res.status(404).json({ message: "Booking not found" });
      
      const service = await storage.getService(booking.serviceId);
      if (!service || service.providerId !== userId) {
        return res.status(403).json({ message: "Only the provider can report customer no-show" });
      }
      
      // Update booking status - customer no-shows don't get refunds
      await storage.updateBookingStatus(bookingId, "customer_noshow");
      
      res.json({ success: true, message: "Customer no-show recorded - no refund issued per policy" });
    } catch (err) {
      console.error('Customer no-show error:', err);
      res.status(500).json({ message: "Failed to process no-show report" });
    }
  });

  // Mark booking as completed (provider action)
  app.post("/api/bookings/:id/complete", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const bookingId = Number(req.params.id);
      const userId = (req.user as any).id;
      
      const booking = await storage.getBooking(bookingId);
      if (!booking) return res.status(404).json({ message: "Booking not found" });
      
      const service = await storage.getService(booking.serviceId);
      if (!service || service.providerId !== userId) {
        return res.status(403).json({ message: "Only the provider can mark booking as complete" });
      }
      
      if (booking.status !== "accepted") {
        return res.status(400).json({ message: "Only accepted bookings can be marked as complete" });
      }
      
      await storage.updateBookingStatus(bookingId, "completed");
      
      // Check if this is the customer's first completed booking and process referral
      const customer = await storage.getUser(booking.customerId);
      if (customer && customer.referredBy) {
        // Check if customer has a pending referral
        const referrer = await storage.getUserByReferralCode(customer.referredBy);
        if (referrer) {
          const referrals = await storage.getReferralsByReferrer(referrer.id);
          const pendingReferral = referrals.find(
            r => r.referredId === booking.customerId && r.status === "pending"
          );
          
          if (pendingReferral) {
            // Mark referral as completed and award bonus
            await storage.updateReferralStatus(pendingReferral.id, "rewarded");
            
            // Notify referrer of reward
            await storage.createNotification({
              userId: referrer.id,
              type: "referral_reward",
              title: "Referral Reward Earned!",
              body: `You earned $5.00 for referring ${customer.name}! They completed their first booking.`,
              metadata: JSON.stringify({ referralId: pendingReferral.id, amount: 500 }),
            });
          }
        }
      }
      
      // Notify customer
      await storage.createNotification({
        userId: booking.customerId,
        type: "booking_completed",
        title: "Service Completed",
        body: `Your booking for ${service.title} has been marked as completed. Please leave a review!`,
        metadata: JSON.stringify({ bookingId: booking.id, serviceId: service.id }),
      });
      
      res.json({ success: true, message: "Booking marked as completed" });
    } catch (err) {
      console.error('Complete booking error:', err);
      res.status(500).json({ message: "Failed to complete booking" });
    }
  });

  // Premium subscription - create checkout
  app.post("/api/premium/subscribe", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if ((req.user as any).role !== 'provider') {
      return res.status(403).json({ message: "Only providers can subscribe to premium" });
    }
    
    try {
      const stripe = await getUncachableStripeClient();
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'CertiGo Premium',
                description: 'Verified Pro badge, higher ranking, advanced analytics, and more!',
              },
              unit_amount: PREMIUM_PRICE_CENTS,
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${baseUrl}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/premium`,
        metadata: {
          userId: (req.user as any).id.toString(),
          type: 'premium_subscription',
        },
      });
      
      res.json({ url: session.url, sessionId: session.id });
    } catch (err) {
      console.error('Premium subscription error:', err);
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  // Confirm premium subscription
  app.post("/api/premium/confirm", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const { sessionId } = req.body;
      const stripe = await getUncachableStripeClient();
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (session.payment_status === 'paid' && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const premiumExpiresAt = new Date((subscription as any).current_period_end * 1000);
        
        await storage.updateUserPremium(
          (req.user as any).id,
          true,
          premiumExpiresAt,
          subscription.id
        );
        
        res.json({ success: true, premiumExpiresAt });
      } else {
        res.json({ success: false, message: "Subscription not active" });
      }
    } catch (err) {
      console.error('Premium confirmation error:', err);
      res.status(500).json({ message: "Failed to confirm subscription" });
    }
  });

  // Get premium status
  app.get("/api/premium/status", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    const user = req.user as any;
    res.json({
      isPremium: user.isPremium,
      premiumExpiresAt: user.premiumExpiresAt,
    });
  });

  // === NOTIFICATIONS ===
  
  // Get user notifications
  app.get("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const userId = (req.user as any).id;
      const notifications = await storage.getNotifications(userId);
      const unreadCount = await storage.getUnreadNotificationCount(userId);
      res.json({ notifications, unreadCount });
    } catch (err) {
      console.error('Notifications error:', err);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Mark notification as read
  app.post("/api/notifications/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const notification = await storage.markNotificationRead(Number(req.params.id));
      res.json(notification);
    } catch (err) {
      console.error('Mark notification read error:', err);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Mark all notifications as read
  app.post("/api/notifications/read-all", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const userId = (req.user as any).id;
      await storage.markAllNotificationsRead(userId);
      res.json({ success: true });
    } catch (err) {
      console.error('Mark all notifications read error:', err);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  // Update user location
  app.post("/api/user/location", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const { lat, lng } = req.body;
      if (typeof lat !== 'number' || typeof lng !== 'number') {
        return res.status(400).json({ message: "Invalid location" });
      }
      const updated = await storage.updateUserLocation((req.user as any).id, lat, lng);
      res.json({ success: true, lat: updated.lat, lng: updated.lng });
    } catch (err) {
      console.error('Update location error:', err);
      res.status(500).json({ message: "Failed to update location" });
    }
  });

  // Provider signals arrival at customer location
  app.post("/api/bookings/:id/arrived", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const bookingId = Number(req.params.id);
      const userId = (req.user as any).id;
      
      const booking = await storage.getBooking(bookingId);
      if (!booking) return res.status(404).json({ message: "Booking not found" });
      
      const service = await storage.getService(booking.serviceId);
      if (!service || service.providerId !== userId) {
        return res.status(403).json({ message: "Only the provider can mark arrival" });
      }
      
      // Notify customer that provider has arrived
      await storage.createNotification({
        userId: booking.customerId,
        type: "provider_arrived",
        title: "Your provider has arrived!",
        body: `${service.provider.name} is at your location for ${service.title}`,
        metadata: JSON.stringify({ bookingId, serviceId: service.id }),
      });
      
      res.json({ success: true, message: "Customer has been notified of your arrival" });
    } catch (err) {
      console.error('Provider arrival error:', err);
      res.status(500).json({ message: "Failed to notify arrival" });
    }
  });

  // === CHAT ROUTES ===

  // Get user's conversations
  app.get("/api/conversations", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const userId = (req.user as any).id;
      const conversations = await storage.getUserConversations(userId);
      res.json(conversations);
    } catch (err) {
      console.error('Get conversations error:', err);
      res.status(500).json({ message: "Failed to get conversations" });
    }
  });

  // Get or create conversation for a booking
  app.post("/api/bookings/:id/chat", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const bookingId = Number(req.params.id);
      const userId = (req.user as any).id;
      
      const booking = await storage.getBooking(bookingId);
      if (!booking) return res.status(404).json({ message: "Booking not found" });
      
      const service = await storage.getService(booking.serviceId);
      if (!service) return res.status(404).json({ message: "Service not found" });
      
      // Only customer or provider can access the chat
      if (booking.customerId !== userId && service.providerId !== userId) {
        return res.status(403).json({ message: "You don't have access to this chat" });
      }
      
      const conversation = await storage.getOrCreateConversation(
        bookingId,
        booking.customerId,
        service.providerId
      );
      
      res.json(conversation);
    } catch (err) {
      console.error('Get/create chat error:', err);
      res.status(500).json({ message: "Failed to access chat" });
    }
  });

  // Get messages in a conversation
  app.get("/api/conversations/:id/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const conversationId = Number(req.params.id);
      const userId = (req.user as any).id;
      
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) return res.status(404).json({ message: "Conversation not found" });
      
      // Only participants can access
      if (conversation.customerId !== userId && conversation.providerId !== userId) {
        return res.status(403).json({ message: "You don't have access to this chat" });
      }
      
      // Mark messages as read
      await storage.markMessagesRead(conversationId, userId);
      
      const messages = await storage.getMessages(conversationId);
      res.json(messages);
    } catch (err) {
      console.error('Get messages error:', err);
      res.status(500).json({ message: "Failed to get messages" });
    }
  });

  // Send a message
  app.post("/api/conversations/:id/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const conversationId = Number(req.params.id);
      const userId = (req.user as any).id;
      const { content } = req.body;
      
      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return res.status(400).json({ message: "Message content is required" });
      }
      
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) return res.status(404).json({ message: "Conversation not found" });
      
      // Only participants can send messages
      if (conversation.customerId !== userId && conversation.providerId !== userId) {
        return res.status(403).json({ message: "You don't have access to this chat" });
      }
      
      const message = await storage.createMessage({
        conversationId,
        senderId: userId,
        content: content.trim(),
      });
      
      // Notify the other user
      const recipientId = conversation.customerId === userId ? conversation.providerId : conversation.customerId;
      const sender = await storage.getUser(userId);
      
      await storage.createNotification({
        userId: recipientId,
        type: "new_message",
        title: "New Message",
        body: `${sender?.name || 'Someone'} sent you a message`,
        metadata: JSON.stringify({ conversationId, bookingId: conversation.bookingId }),
      });
      
      res.status(201).json(message);
    } catch (err) {
      console.error('Send message error:', err);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingUsers = await storage.getUserByUsername("plumber_john");
  if (!existingUsers) {
    const provider = await storage.createUser({
      username: "plumber_john",
      password: "password123",
      name: "John the Plumber",
      role: "provider",
      bio: "20 years of experience in fixing leaks and pipes.",
      lat: 40.7128,
      lng: -74.0060
    });

    const customer = await storage.createUser({
      username: "customer_jane",
      password: "password123",
      name: "Jane Doe",
      role: "customer",
      bio: "Just moved to the city.",
      lat: 40.7138,
      lng: -74.0070
    });

    const service = await storage.createService({
      providerId: provider.id,
      title: "Emergency Plumbing",
      description: "Available 24/7 for any plumbing emergency.",
      category: "Plumbing",
      price: 100,
      lat: 40.7128,
      lng: -74.0060
    });

    await storage.createReview({
      serviceId: service.id,
      customerId: customer.id,
      rating: 5,
      comment: "John saved my basement from flooding! Highly recommended."
    });
  }
}
