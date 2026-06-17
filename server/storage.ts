import { db } from "./db";
import { users, services, bookings, reviews, transactions, notifications, conversations, messages, servicePackages, referrals, payouts, ads, customerFeedback, type User, type InsertUser, type Service, type InsertService, type Booking, type InsertBooking, type Review, type InsertReview, type Transaction, type InsertTransaction, type Notification, type InsertNotification, type Conversation, type InsertConversation, type Message, type InsertMessage, type ServicePackage, type InsertServicePackage, type Referral, type InsertReferral, type Payout, type InsertPayout, type Ad, type InsertAd, type CustomerFeedback, type InsertCustomerFeedback } from "@shared/schema";
import { eq, ilike, or, sql, desc, isNull, and, lte, gte } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Services
  getServices(query?: { category?: string; search?: string }): Promise<(Service & { provider: User })[]>;
  getService(id: number): Promise<(Service & { provider: User; reviews: Review[] }) | undefined>;
  createService(service: InsertService): Promise<Service>;

  // Bookings
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookings(userId: number, role: 'customer' | 'provider'): Promise<(Booking & { service: Service })[]>;

  // Reviews
  createReview(review: InsertReview): Promise<Review>;
  getReviews(serviceId: number): Promise<Review[]>;

  // Transactions
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionByCheckoutSession(sessionId: string): Promise<Transaction | undefined>;
  getTransactionByBookingId(bookingId: number): Promise<Transaction | undefined>;
  updateTransactionStatus(id: number, status: string, paymentIntentId?: string): Promise<Transaction>;
  updateTransactionRefund(id: number, stripeRefundId: string, reason: string): Promise<Transaction>;
  getPlatformEarnings(): Promise<{ totalEarnings: number; totalTransactions: number; recentTransactions: Transaction[] }>;
  getProviderEarnings(providerId: number): Promise<{ totalEarnings: number; transactions: Transaction[] }>;
  updateBookingDepositPaid(bookingId: number): Promise<Booking>;
  
  // Booking management
  getBooking(id: number): Promise<Booking | undefined>;
  cancelBooking(id: number, cancelledBy: string, cancelReason?: string): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking>;
  updateBookingPausedReason(id: number, reason: string): Promise<void>;
  
  // Premium
  updateUserPremium(userId: number, isPremium: boolean, premiumExpiresAt: Date | null, stripeSubscriptionId: string | null): Promise<User>;
  
  // Notifications
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotifications(userId: number): Promise<Notification[]>;
  getUnreadNotificationCount(userId: number): Promise<number>;
  markNotificationRead(id: number): Promise<Notification>;
  markAllNotificationsRead(userId: number): Promise<void>;
  
  // Location
  updateUser(userId: number, data: { name?: string; username?: string; password?: string; city?: string }): Promise<User>;
  updateUserLocation(userId: number, lat: number, lng: number): Promise<User>;
  
  // Chat
  getOrCreateConversation(bookingId: number, customerId: number, providerId: number): Promise<Conversation>;
  getConversation(id: number): Promise<Conversation | undefined>;
  getConversationByBooking(bookingId: number): Promise<Conversation | undefined>;
  getUserConversations(userId: number): Promise<(Conversation & { otherUser: User; lastMessage: Message | null; unreadCount: number })[]>;
  getMessages(conversationId: number): Promise<(Message & { sender: User })[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesRead(conversationId: number, userId: number): Promise<void>;
  
  // Profile
  updateUserProfilePicture(userId: number, profilePicture: string): Promise<User>;
  updateUserReferralCode(userId: number, referralCode: string): Promise<User>;
  
  // Referrals
  createReferral(referral: InsertReferral): Promise<Referral>;
  getReferralsByReferrer(referrerId: number): Promise<Referral[]>;
  getReferralByReferred(referredId: number): Promise<Referral | undefined>;
  updateReferralStatus(id: number, status: string): Promise<Referral>;
  
  // Service Packages
  createServicePackage(pkg: InsertServicePackage): Promise<ServicePackage>;
  getServicePackagesByProvider(providerId: number): Promise<ServicePackage[]>;
  getServicePackage(id: number): Promise<ServicePackage | undefined>;
  updateServicePackage(id: number, data: Partial<InsertServicePackage>): Promise<ServicePackage>;
  deleteServicePackage(id: number): Promise<void>;
  
  // Payout methods
  addToReferralBalance(userId: number, amount: number): Promise<User>;
  deductFromReferralBalance(userId: number, amount: number): Promise<User | null>;
  updateStripeConnectAccount(userId: number, accountId: string): Promise<User>;
  createPayout(payout: InsertPayout): Promise<Payout>;
  getUserPayouts(userId: number): Promise<Payout[]>;
  updatePayoutStatus(id: number, status: string, transferId?: string, failureReason?: string): Promise<Payout>;
  
  // Ads
  createAd(ad: InsertAd): Promise<Ad>;
  getActiveAds(placement?: string): Promise<Ad[]>;
  getAllAds(): Promise<Ad[]>;
  updateAd(id: number, data: Partial<InsertAd>): Promise<Ad>;
  deleteAd(id: number): Promise<void>;
  
  // Customer Feedback (vendor reviews of customers)
  createCustomerFeedback(feedback: InsertCustomerFeedback): Promise<CustomerFeedback>;
  getCustomerFeedback(bookingId: number): Promise<CustomerFeedback | undefined>;
  getCustomerRating(customerId: number): Promise<{ averageRating: number; totalReviews: number }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.referralCode, referralCode));
    return user;
  }
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getServices(query?: { category?: string; search?: string }): Promise<(Service & { provider: User })[]> {
    let q = db.select({
      service: services,
      provider: users,
    })
    .from(services)
    .innerJoin(users, eq(services.providerId, users.id));

    if (query?.category) {
      q.where(eq(services.category, query.category));
    }

    // Simple search implementation
    if (query?.search) {
       q.where(
         or(
           ilike(services.title, `%${query.search}%`),
           ilike(services.description, `%${query.search}%`),
           ilike(services.category, `%${query.search}%`)
         )
       );
    }

    const results = await q;
    return results.map(r => ({ ...r.service, provider: r.provider }));
  }

  async getService(id: number): Promise<(Service & { provider: User; reviews: Review[] }) | undefined> {
    const [result] = await db.select({
      service: services,
      provider: users,
    })
    .from(services)
    .innerJoin(users, eq(services.providerId, users.id))
    .where(eq(services.id, id));

    if (!result) return undefined;

    const serviceReviews = await db.select().from(reviews).where(eq(reviews.serviceId, id));

    return { ...result.service, provider: result.provider, reviews: serviceReviews };
  }

  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db.insert(services).values(service).returning();
    return newService;
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async getBookings(userId: number, role: 'customer' | 'provider'): Promise<(Booking & { service: Service })[]> {
    if (role === 'customer') {
      const results = await db.select({
        booking: bookings,
        service: services,
      })
      .from(bookings)
      .innerJoin(services, eq(bookings.serviceId, services.id))
      .where(eq(bookings.customerId, userId));
      return results.map(r => ({ ...r.booking, service: r.service }));
    } else {
      // For provider, we need to join bookings -> services -> users(provider)
      // Actually simpler: bookings -> services. where services.providerId = userId
      const results = await db.select({
        booking: bookings,
        service: services,
      })
      .from(bookings)
      .innerJoin(services, eq(bookings.serviceId, services.id))
      .where(eq(services.providerId, userId));
      return results.map(r => ({ ...r.booking, service: r.service }));
    }
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async getReviews(serviceId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.serviceId, serviceId));
  }

  // Transaction methods
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async getTransactionByCheckoutSession(sessionId: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.stripeCheckoutSessionId, sessionId));
    return transaction;
  }

  async updateTransactionStatus(id: number, status: string, paymentIntentId?: string): Promise<Transaction> {
    const updateData: any = { status };
    if (paymentIntentId) {
      updateData.stripePaymentIntentId = paymentIntentId;
    }
    const [updated] = await db.update(transactions).set(updateData).where(eq(transactions.id, id)).returning();
    return updated;
  }

  async getPlatformEarnings(): Promise<{ totalEarnings: number; totalTransactions: number; recentTransactions: Transaction[] }> {
    const completedTransactions = await db.select().from(transactions).where(eq(transactions.status, 'completed')).orderBy(desc(transactions.createdAt));
    
    const totalEarnings = completedTransactions.reduce((acc, t) => acc + t.platformFee, 0);
    
    return {
      totalEarnings,
      totalTransactions: completedTransactions.length,
      recentTransactions: completedTransactions.slice(0, 20),
    };
  }

  async getProviderEarnings(providerId: number): Promise<{ totalEarnings: number; transactions: Transaction[] }> {
    const providerTransactions = await db.select().from(transactions)
      .where(eq(transactions.providerId, providerId))
      .orderBy(desc(transactions.createdAt));
    
    const completedTransactions = providerTransactions.filter(t => t.status === 'completed');
    const totalEarnings = completedTransactions.reduce((acc, t) => acc + t.providerPayout, 0);
    
    return {
      totalEarnings,
      transactions: providerTransactions,
    };
  }

  async updateBookingDepositPaid(bookingId: number): Promise<Booking> {
    const [updated] = await db.update(bookings).set({ depositPaid: true }).where(eq(bookings.id, bookingId)).returning();
    return updated;
  }

  async getTransactionByBookingId(bookingId: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.bookingId, bookingId));
    return transaction;
  }

  async updateTransactionRefund(id: number, stripeRefundId: string, reason: string): Promise<Transaction> {
    const [updated] = await db.update(transactions).set({ 
      status: 'refunded',
      stripeRefundId,
      refundReason: reason,
      refundedAt: new Date(),
    }).where(eq(transactions.id, id)).returning();
    return updated;
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async cancelBooking(id: number, cancelledBy: string, cancelReason?: string): Promise<Booking> {
    const [updated] = await db.update(bookings).set({
      status: 'cancelled',
      cancelledBy: cancelledBy as any,
      cancelledAt: new Date(),
      cancelReason: cancelReason || null,
    }).where(eq(bookings.id, id)).returning();
    return updated;
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking> {
    const [updated] = await db.update(bookings).set({ status: status as any }).where(eq(bookings.id, id)).returning();
    return updated;
  }
  async updateBookingPausedReason(id: number, reason: string): Promise<void> {
    await db.update(bookings).set({ pausedReason: reason }).where(eq(bookings.id, id));
  }

  async updateUserPremium(userId: number, isPremium: boolean, premiumExpiresAt: Date | null, stripeSubscriptionId: string | null): Promise<User> {
    const [updated] = await db.update(users).set({ 
      isPremium,
      premiumExpiresAt,
      stripeSubscriptionId,
    }).where(eq(users.id, userId)).returning();
    return updated;
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [created] = await db.insert(notifications).values(notification).returning();
    return created;
  }

  async getNotifications(userId: number): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
    return Number(result[0]?.count || 0);
  }

  async markNotificationRead(id: number): Promise<Notification> {
    const [updated] = await db.update(notifications)
      .set({ readAt: new Date() })
      .where(eq(notifications.id, id))
      .returning();
    return updated;
  }

  async markAllNotificationsRead(userId: number): Promise<void> {
    await db.update(notifications)
      .set({ readAt: new Date() })
      .where(eq(notifications.userId, userId));
  }

  async updateUser(userId: number, data: { name?: string; username?: string; password?: string; city?: string }): Promise<User> {
    const [updated] = await db.update(users)
      .set(data)
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async updateUserLocation(userId: number, lat: number, lng: number): Promise<User> {
    const [updated] = await db.update(users)
      .set({ lat, lng })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  // Chat methods
  async getOrCreateConversation(bookingId: number, customerId: number, providerId: number): Promise<Conversation> {
    const existing = await db.select().from(conversations).where(eq(conversations.bookingId, bookingId));
    if (existing.length > 0) return existing[0];
    
    const [created] = await db.insert(conversations).values({
      bookingId,
      customerId,
      providerId,
    }).returning();
    return created;
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conv;
  }

  async getConversationByBooking(bookingId: number): Promise<Conversation | undefined> {
    const [conv] = await db.select().from(conversations).where(eq(conversations.bookingId, bookingId));
    return conv;
  }

  async getUserConversations(userId: number): Promise<(Conversation & { otherUser: User; lastMessage: Message | null; unreadCount: number })[]> {
    const convs = await db.select().from(conversations)
      .where(or(eq(conversations.customerId, userId), eq(conversations.providerId, userId)))
      .orderBy(desc(conversations.createdAt));
    
    const results = await Promise.all(convs.map(async (conv) => {
      const otherUserId = conv.customerId === userId ? conv.providerId : conv.customerId;
      const [otherUser] = await db.select().from(users).where(eq(users.id, otherUserId));
      
      const msgs = await db.select().from(messages)
        .where(eq(messages.conversationId, conv.id))
        .orderBy(desc(messages.createdAt))
        .limit(1);
      
      const unreadResult = await db.select({ count: sql<number>`count(*)` })
        .from(messages)
        .where(and(
          eq(messages.conversationId, conv.id),
          isNull(messages.readAt),
          sql`${messages.senderId} != ${userId}`
        ));
      
      return {
        ...conv,
        otherUser,
        lastMessage: msgs[0] || null,
        unreadCount: Number(unreadResult[0]?.count || 0),
      };
    }));
    
    return results;
  }

  async getMessages(conversationId: number): Promise<(Message & { sender: User })[]> {
    const msgs = await db.select({
      message: messages,
      sender: users,
    })
    .from(messages)
    .innerJoin(users, eq(messages.senderId, users.id))
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt);
    
    return msgs.map(m => ({ ...m.message, sender: m.sender }));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [created] = await db.insert(messages).values(message).returning();
    return created;
  }

  async markMessagesRead(conversationId: number, userId: number): Promise<void> {
    await db.update(messages)
      .set({ readAt: new Date() })
      .where(and(
        eq(messages.conversationId, conversationId),
        sql`${messages.senderId} != ${userId}`,
        isNull(messages.readAt)
      ));
  }

  // Profile methods
  async updateUserProfilePicture(userId: number, profilePicture: string): Promise<User> {
    const [updated] = await db.update(users)
      .set({ profilePicture })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async updateUserReferralCode(userId: number, referralCode: string): Promise<User> {
    const [updated] = await db.update(users)
      .set({ referralCode })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  // Referral methods
  async createReferral(referral: InsertReferral): Promise<Referral> {
    const [created] = await db.insert(referrals).values(referral).returning();
    return created;
  }

  async getReferralsByReferrer(referrerId: number): Promise<Referral[]> {
    return db.select().from(referrals).where(eq(referrals.referrerId, referrerId));
  }

  async getReferralByReferred(referredId: number): Promise<Referral | undefined> {
    const [referral] = await db.select().from(referrals).where(eq(referrals.referredId, referredId));
    return referral;
  }

  async updateReferralStatus(id: number, status: string): Promise<Referral> {
    const updates: any = { status };
    if (status === "completed") updates.completedAt = new Date();
    if (status === "rewarded") updates.rewardedAt = new Date();
    const [updated] = await db.update(referrals).set(updates).where(eq(referrals.id, id)).returning();
    return updated;
  }

  // Service Package methods
  async createServicePackage(pkg: InsertServicePackage): Promise<ServicePackage> {
    const [created] = await db.insert(servicePackages).values(pkg).returning();
    return created;
  }

  async getServicePackagesByProvider(providerId: number): Promise<ServicePackage[]> {
    return db.select().from(servicePackages)
      .where(and(eq(servicePackages.providerId, providerId), eq(servicePackages.isActive, true)));
  }

  async getServicePackage(id: number): Promise<ServicePackage | undefined> {
    const [pkg] = await db.select().from(servicePackages).where(eq(servicePackages.id, id));
    return pkg;
  }

  async updateService(id: number, data: { title?: string; description?: string; price?: number; category?: string }): Promise<any> {
    const [updated] = await db.update(services).set(data).where(eq(services.id, id)).returning();
    return updated;
  }
  async updateServicePackage(id: number, data: Partial<InsertServicePackage>): Promise<ServicePackage> {
    const [updated] = await db.update(servicePackages).set(data).where(eq(servicePackages.id, id)).returning();
    return updated;
  }

  async deleteServicePackage(id: number): Promise<void> {
    await db.update(servicePackages).set({ isActive: false }).where(eq(servicePackages.id, id));
  }

  // Payout methods
  async addToReferralBalance(userId: number, amount: number): Promise<User> {
    const [updated] = await db.update(users)
      .set({ referralBalance: sql`${users.referralBalance} + ${amount}` })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async deductFromReferralBalance(userId: number, amount: number): Promise<User | null> {
    // Atomic deduction with balance check to prevent race conditions and negative balance
    const [updated] = await db.update(users)
      .set({ referralBalance: sql`${users.referralBalance} - ${amount}` })
      .where(and(eq(users.id, userId), sql`${users.referralBalance} >= ${amount}`))
      .returning();
    return updated || null; // Returns null if balance was insufficient
  }

  async updateStripeConnectAccount(userId: number, accountId: string): Promise<User> {
    const [updated] = await db.update(users)
      .set({ stripeConnectAccountId: accountId })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async createPayout(payout: InsertPayout): Promise<Payout> {
    const [created] = await db.insert(payouts).values(payout).returning();
    return created;
  }

  async getUserPayouts(userId: number): Promise<Payout[]> {
    return db.select().from(payouts)
      .where(eq(payouts.userId, userId))
      .orderBy(desc(payouts.createdAt));
  }

  async updatePayoutStatus(id: number, status: string, transferId?: string, failureReason?: string): Promise<Payout> {
    const updates: any = { status };
    if (transferId) updates.stripeTransferId = transferId;
    if (failureReason) updates.failureReason = failureReason;
    if (status === 'completed') updates.completedAt = new Date();
    const [updated] = await db.update(payouts).set(updates).where(eq(payouts.id, id)).returning();
    return updated;
  }

  // Ads methods
  async createAd(ad: InsertAd): Promise<Ad> {
    const [created] = await db.insert(ads).values(ad).returning();
    return created;
  }

  async getActiveAds(placement?: string): Promise<Ad[]> {
    const now = new Date();
    let query = db.select().from(ads).where(
      and(
        eq(ads.isActive, true),
        or(isNull(ads.startsAt), lte(ads.startsAt, now)),
        or(isNull(ads.endsAt), gte(ads.endsAt, now))
      )
    );
    
    const result = await query;
    if (placement) {
      return result.filter(ad => ad.placement === placement);
    }
    return result;
  }

  async getAllAds(): Promise<Ad[]> {
    return db.select().from(ads).orderBy(desc(ads.createdAt));
  }

  async updateAd(id: number, data: Partial<InsertAd>): Promise<Ad> {
    const [updated] = await db.update(ads).set(data).where(eq(ads.id, id)).returning();
    return updated;
  }

  async deleteAd(id: number): Promise<void> {
    await db.update(ads).set({ isActive: false }).where(eq(ads.id, id));
  }

  // Customer Feedback methods
  async createCustomerFeedback(feedback: InsertCustomerFeedback): Promise<CustomerFeedback> {
    const [created] = await db.insert(customerFeedback).values(feedback).returning();
    return created;
  }

  async getCustomerFeedback(bookingId: number): Promise<CustomerFeedback | undefined> {
    const [feedback] = await db.select().from(customerFeedback).where(eq(customerFeedback.bookingId, bookingId));
    return feedback;
  }

  async getCustomerRating(customerId: number): Promise<{ averageRating: number; totalReviews: number }> {
    const result = await db.select({
      avgRating: sql<number>`COALESCE(AVG(${customerFeedback.rating}), 0)`,
      count: sql<number>`COUNT(*)`,
    }).from(customerFeedback).where(eq(customerFeedback.customerId, customerId));
    
    return {
      averageRating: Number(result[0]?.avgRating) || 0,
      totalReviews: Number(result[0]?.count) || 0,
    };
  }
}

export const storage = new DatabaseStorage();




