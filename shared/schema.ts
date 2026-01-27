import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["owner", "trainer", "member"] }).notNull().default("member"),
  fullName: text("full_name").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  trainerId: integer("trainer_id").references(() => users.id),
  capacity: integer("capacity").notNull(),
  schedule: timestamp("schedule").notNull(),
  duration: integer("duration").notNull(), // in minutes
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  classId: integer("class_id").notNull().references(() => classes.id),
  status: text("status", { enum: ["confirmed", "cancelled"] }).notNull().default("confirmed"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  planType: text("plan_type", { enum: ["basic", "premium", "family"] }).notNull(),
  active: boolean("active").default(true),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
});

// Relations
export const classesRelations = relations(classes, ({ one, many }) => ({
  trainer: one(users, {
    fields: [classes.trainerId],
    references: [users.id],
  }),
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  class: one(classes, {
    fields: [bookings.classId],
    references: [classes.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  classes: many(classes), // classes they teach
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertClassSchema = createInsertSchema(classes).omit({ id: true });
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true });
export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ id: true, startDate: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Class = typeof classes.$inferSelect;
export type InsertClass = z.infer<typeof insertClassSchema>;
export type Booking = typeof bookings.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;

export type CreateClassRequest = InsertClass;
export type CreateBookingRequest = InsertBookingSchema; 
type InsertBookingSchema = z.infer<typeof insertBookingSchema>;
