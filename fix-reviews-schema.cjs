const fs = require('fs');
let s = fs.readFileSync('shared/schema.ts', 'utf8');

s = s.replace(
  'reviews = pgTable("reviews", {\n  id: serial("id").primaryKey(),\n  serviceId: integer("service_id").notNull(),\n  customerId: integer("customer_id").notNull(),\n  rating: integer("rating").notNull(),\n  comment: text("comment").notNull(),\n  createdAt: timestamp("created_at").defaultNow(),\n});',
  'reviews = pgTable("reviews", {\n  id: serial("id").primaryKey(),\n  bookingId: integer("booking_id"),\n  serviceId: integer("service_id").notNull(),\n  customerId: integer("customer_id").notNull(),\n  rating: integer("rating").notNull(),\n  comment: text("comment").notNull(),\n  createdAt: timestamp("created_at").defaultNow(),\n});'
);

fs.writeFileSync('shared/schema.ts', s);
console.log('Listo');
