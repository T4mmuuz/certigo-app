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
