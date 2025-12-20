import { db } from "./db";
import { users, services, bookings, reviews, transactions, type User, type InsertUser, type Service, type InsertService, type Booking, type InsertBooking, type Review, type InsertReview, type Transaction, type InsertTransaction } from "@shared/schema";
import { eq, ilike, or, sql, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
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
  cancelBooking(id: number, cancelledBy: string): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking>;
  
  // Premium
  updateUserPremium(userId: number, isPremium: boolean, premiumExpiresAt: Date | null, stripeSubscriptionId: string | null): Promise<User>;
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

  async cancelBooking(id: number, cancelledBy: string): Promise<Booking> {
    const [updated] = await db.update(bookings).set({ 
      status: 'cancelled',
      cancelledBy: cancelledBy as any,
      cancelledAt: new Date(),
    }).where(eq(bookings.id, id)).returning();
    return updated;
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking> {
    const [updated] = await db.update(bookings).set({ status: status as any }).where(eq(bookings.id, id)).returning();
    return updated;
  }

  async updateUserPremium(userId: number, isPremium: boolean, premiumExpiresAt: Date | null, stripeSubscriptionId: string | null): Promise<User> {
    const [updated] = await db.update(users).set({ 
      isPremium,
      premiumExpiresAt,
      stripeSubscriptionId,
    }).where(eq(users.id, userId)).returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
