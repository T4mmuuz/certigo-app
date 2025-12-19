import { db } from "./db";
import { users, services, bookings, reviews, type User, type InsertUser, type Service, type InsertService, type Booking, type InsertBooking, type Review, type InsertReview } from "@shared/schema";
import { eq, ilike, or } from "drizzle-orm";

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
}

export const storage = new DatabaseStorage();
