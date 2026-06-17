import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: ["customer", "provider"] }).default("customer").notNull(),
  bio: text("bio"),
  profilePicture: text("profile_picture"),
  lat: real("lat"),
  lng: real("lng"),
  isPremium: boolean("is_premium").default(false).notNull(),
  premiumExpiresAt: timestamp("premium_expires_at"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  referralCode: text("referral_code").unique(),
  referredBy: integer("referred_by"),
  stripeConnectAccountId: text("stripe_connect_account_id"),
  referralBalance: integer("referral_balance").default(0).notNull(), // Available balance in cents
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull(),
  title: text("title").notNull(), // e.g., "Experienced Plumber"
  description: text("description").notNull(),
  category: text("category").notNull(), // e.g., "plumbing", "welding"
  price: integer("price").notNull(), // Base price or starting rate
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  pricingType: text("pricing_type", { enum: ["fixed", "negotiable", "hourly", "free_estimate"] }).default("negotiable"),
  responseTime: text("response_time"), // e.g., "Within 1 hour", "Same day"
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  serviceId: integer("service_id").notNull(),
  status: text("status", { enum: ["pending", "accepted", "completed", "cancelled", "provider_noshow", "customer_noshow"] }).default("pending").notNull(),
  date: timestamp("date").notNull(),
  depositPaid: boolean("deposit_paid").default(false).notNull(),
  paymentMethod: text("payment_method", { enum: ["app", "cash"] }).default("app").notNull(),
  cancelledBy: text("cancelled_by", { enum: ["customer", "provider"] }),
  cancelledAt: timestamp("cancelled_at"),
  hours: integer("hours"), // Optional, kept for backward compat
  // New per-job fields
  estimatedBudget: text("estimated_budget"), // e.g. "$80-$150" or "80"
  jobSize: text("job_size", { enum: ["small", "medium", "large", "emergency"] }),
  estimatedDuration: text("estimated_duration"), // e.g. "1-3 hours", "half day"
  urgencyLevel: text("urgency_level", { enum: ["flexible", "today", "asap", "emergency"] }).default("flexible"),
  jobDescription: text("job_description"), // Customer's description of the problem
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").notNull(),
  customerId: integer("customer_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull(),
  customerId: integer("customer_id").notNull(),
  providerId: integer("provider_id").notNull(),
  serviceId: integer("service_id").notNull(),
  amount: integer("amount").notNull(),
  platformFee: integer("platform_fee").notNull(),
  providerPayout: integer("provider_payout").notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeCheckoutSessionId: text("stripe_checkout_session_id"),
  status: text("status", { enum: ["pending", "completed", "refunded", "failed"] }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  refundedAt: timestamp("refunded_at"),
  refundReason: text("refund_reason"),
  stripeRefundId: text("stripe_refund_id"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  services: many(services),
  bookings: many(bookings),
  reviews: many(reviews),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  provider: one(users, {
    fields: [services.providerId],
    references: [users.id],
  }),
  bookings: many(bookings),
  reviews: many(reviews),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  customer: one(users, {
    fields: [bookings.customerId],
    references: [users.id],
  }),
  service: one(services, {
    fields: [bookings.serviceId],
    references: [services.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  customer: one(users, {
    fields: [reviews.customerId],
    references: [users.id],
  }),
  service: one(services, {
    fields: [reviews.serviceId],
    references: [services.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  booking: one(bookings, {
    fields: [transactions.bookingId],
    references: [bookings.id],
  }),
  customer: one(users, {
    fields: [transactions.customerId],
    references: [users.id],
  }),
  provider: one(users, {
    fields: [transactions.providerId],
    references: [users.id],
  }),
  service: one(services, {
    fields: [transactions.serviceId],
    references: [services.id],
  }),
}));

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type", { 
    enum: ["booking_new", "booking_confirmed", "booking_cancelled", "booking_completed", "provider_arriving", "provider_arrived", "payment_received", "review_received", "new_message", "referral_reward", "payout_completed"] 
  }).notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  metadata: text("metadata"), // JSON string for extra data like bookingId, serviceId
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Conversations for chat between customer and provider
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().unique(),
  customerId: integer("customer_id").notNull(),
  providerId: integer("provider_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  senderId: integer("sender_id").notNull(),
  content: text("content").notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  booking: one(bookings, {
    fields: [conversations.bookingId],
    references: [bookings.id],
  }),
  customer: one(users, {
    fields: [conversations.customerId],
    references: [users.id],
  }),
  provider: one(users, {
    fields: [conversations.providerId],
    references: [users.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

// Service packages (bundles of services at discounted rates)
export const servicePackages = pgTable("service_packages", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  serviceIds: text("service_ids").notNull(), // JSON array of service IDs
  totalPrice: integer("total_price").notNull(), // Discounted bundle price in cents
  originalPrice: integer("original_price").notNull(), // Sum of individual prices
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const servicePackagesRelations = relations(servicePackages, ({ one }) => ({
  provider: one(users, {
    fields: [servicePackages.providerId],
    references: [users.id],
  }),
}));

// Referrals tracking
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").notNull(),
  referredId: integer("referred_id").notNull(),
  status: text("status", { enum: ["pending", "completed", "rewarded"] }).default("pending").notNull(),
  rewardAmount: integer("reward_amount").default(500).notNull(), // $5 reward in cents
  completedAt: timestamp("completed_at"),
  rewardedAt: timestamp("rewarded_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, {
    fields: [referrals.referrerId],
    references: [users.id],
  }),
  referred: one(users, {
    fields: [referrals.referredId],
    references: [users.id],
  }),
}));

// Payouts tracking
export const payouts = pgTable("payouts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: integer("amount").notNull(), // Amount in cents
  status: text("status", { enum: ["pending", "processing", "completed", "failed"] }).default("pending").notNull(),
  stripeTransferId: text("stripe_transfer_id"),
  failureReason: text("failure_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const payoutsRelations = relations(payouts, ({ one }) => ({
  user: one(users, {
    fields: [payouts.userId],
    references: [users.id],
  }),
}));

// Ads for monetization
export const ads = pgTable("ads", {
  id: serial("id").primaryKey(),
  placement: text("placement", { enum: ["home_sidebar", "home_feed", "booking_confirmation", "profile"] }).notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  ctaText: text("cta_text"),
  ctaUrl: text("cta_url"),
  imagePath: text("image_path"),
  isActive: boolean("is_active").default(true).notNull(),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Customer feedback (vendor reviews of customers)
export const customerFeedback = pgTable("customer_feedback", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().unique(),
  providerId: integer("provider_id").notNull(),
  customerId: integer("customer_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  noShow: boolean("no_show").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customerFeedbackRelations = relations(customerFeedback, ({ one }) => ({
  booking: one(bookings, {
    fields: [customerFeedback.bookingId],
    references: [bookings.id],
  }),
  provider: one(users, {
    fields: [customerFeedback.providerId],
    references: [users.id],
  }),
  customer: one(users, {
    fields: [customerFeedback.customerId],
    references: [users.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertServiceSchema = createInsertSchema(services).omit({ id: true });
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, depositPaid: true, cancelledAt: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true, readAt: true });
export const insertConversationSchema = createInsertSchema(conversations).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true, readAt: true });
export const insertServicePackageSchema = createInsertSchema(servicePackages).omit({ id: true, createdAt: true });
export const insertReferralSchema = createInsertSchema(referrals).omit({ id: true, createdAt: true, completedAt: true, rewardedAt: true });
export const insertPayoutSchema = createInsertSchema(payouts).omit({ id: true, createdAt: true, completedAt: true });
export const insertAdSchema = createInsertSchema(ads).omit({ id: true, createdAt: true });
export const insertCustomerFeedbackSchema = createInsertSchema(customerFeedback).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type ServicePackage = typeof servicePackages.$inferSelect;
export type InsertServicePackage = z.infer<typeof insertServicePackageSchema>;
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Payout = typeof payouts.$inferSelect;
export type InsertPayout = z.infer<typeof insertPayoutSchema>;
export type Ad = typeof ads.$inferSelect;
export type InsertAd = z.infer<typeof insertAdSchema>;
export type CustomerFeedback = typeof customerFeedback.$inferSelect;
export type InsertCustomerFeedback = z.infer<typeof insertCustomerFeedbackSchema>;
