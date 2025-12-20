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

const PLATFORM_COMMISSION_RATE = 0.15; // 15% commission

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
      const existing = await storage.getUserByUsername(input.username);
      if (existing) return res.status(400).json({ message: "Username already exists" });
      const user = await storage.createUser(input);
      req.login(user, (err) => {
        if (err) return res.status(500).json({ message: "Login failed after registration" });
        res.status(201).json(user);
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
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
      const input = api.bookings.create.input.parse({
        ...req.body,
        date: new Date(req.body.date) // Ensure date is Date object
      });
      const booking = await storage.createBooking(input);
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

  // Get provider earnings
  app.get("/api/provider/earnings", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if ((req.user as any).role !== 'provider') {
      return res.status(403).json({ message: "Only providers can view their earnings" });
    }
    
    try {
      const earnings = await storage.getProviderEarnings((req.user as any).id);
      res.json({
        totalEarnings: earnings.totalEarnings / 100, // Convert to dollars
        transactions: earnings.transactions.map(t => ({
          ...t,
          amount: t.amount / 100,
          platformFee: t.platformFee / 100,
          providerPayout: t.providerPayout / 100,
        })),
      });
    } catch (err) {
      console.error('Error fetching provider earnings:', err);
      res.status(500).json({ message: "Failed to fetch earnings" });
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
