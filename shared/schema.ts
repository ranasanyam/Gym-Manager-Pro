import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  mobileNumber: text("mobile_number").notNull().unique(),
  email: text("email"),
  gender: text("gender"),
  ageOrDob: text("age_or_dob"),
  city: text("city").notNull(),
  role: text("role", { enum: ["owner", "trainer", "member"] }), // NULL = not set
  password: text("password").notNull(),
  username: text("username").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const gyms = pgTable("gyms", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  contactNumber: text("contact_number").notNull(),
  gymImages: jsonb("gym_images"),
  gpayQr: text("gpay_qr"),
  phonepeQr: text("phonepe_qr"),
  facilities: jsonb("facilities"),
  services: jsonb("services"),
  membershipPlans: jsonb("membership_plans"),
  isActive: boolean("is_active").default(true),
});

export const gymTrainers = pgTable("gym_trainers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  gymId: integer("gym_id").notNull().references(() => gyms.id),
  specialization: text("specialization"),
});

export const gymMembers = pgTable("gym_members", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  gymId: integer("gym_id").notNull().references(() => gyms.id),
  membershipType: text("membership_type").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  assignedTrainerId: integer("assigned_trainer_id").references(() => users.id),
});

export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  gymId: integer("gym_id").notNull().references(() => gyms.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  trainerId: integer("trainer_id").references(() => users.id),
  capacity: integer("capacity").notNull(),
  schedule: timestamp("schedule").notNull(),
  duration: integer("duration").notNull(), // in minutes
});

export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull().references(() => gymMembers.id),
  gymId: integer("gym_id").notNull().references(() => gyms.id),
  checkInTime: timestamp("check_in_time").defaultNow(),
  method: text("method", { enum: ["QR", "MANUAL"] }).notNull(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull().references(() => gymMembers.id),
  gymId: integer("gym_id").notNull().references(() => gyms.id),
  amount: integer("amount").notNull(),
  paymentMethod: text("payment_method", { enum: ["GPAY", "PHONEPE", "CASH"] }).notNull(),
  paymentDate: timestamp("payment_date").defaultNow(),
  status: text("status", { enum: ["PENDING", "COMPLETED", "FAILED"] }).notNull(),
});

export const workoutPlans = pgTable("workout_plans", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull().references(() => gymMembers.id),
  gymId: integer("gym_id").notNull().references(() => gyms.id),
  createdBy: integer("created_by").notNull().references(() => users.id),
  weekDay: text("week_day", { enum: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"] }).notNull(),
  exercises: jsonb("exercises").notNull(), // Array of { name, sets, reps, notes }
  createdAt: timestamp("created_at").defaultNow(),
});

export const dietPlans = pgTable("diet_plans", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull().references(() => gymMembers.id),
  gymId: integer("gym_id").notNull().references(() => gyms.id),
  createdBy: integer("created_by").notNull().references(() => users.id),
  weekDay: text("week_day", { enum: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"] }).notNull(),
  meals: jsonb("meals").notNull(), // { breakfast, lunch, snacks, dinner }
  isFree: boolean("is_free").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  gymId: integer("gym_id").references(() => gyms.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  gyms: many(gyms),
  memberships: many(gymMembers),
  trainings: many(gymTrainers),
  notifications: many(notifications),
}));

export const gymsRelations = relations(gyms, ({ one, many }) => ({
  owner: one(users, { fields: [gyms.ownerId], references: [users.id] }),
  trainers: many(gymTrainers),
  members: many(gymMembers),
  payments: many(payments),
  attendance: many(attendance),
  classes: many(classes),
}));

export const gymMembersRelations = relations(gymMembers, ({ one, many }) => ({
  user: one(users, { fields: [gymMembers.userId], references: [users.id] }),
  gym: one(gyms, { fields: [gymMembers.gymId], references: [gyms.id] }),
  trainer: one(users, { fields: [gymMembers.assignedTrainerId], references: [users.id] }),
  attendance: many(attendance),
  payments: many(payments),
  workoutPlans: many(workoutPlans),
  dietPlans: many(dietPlans),
}));

// Base Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertGymSchema = createInsertSchema(gyms).omit({ id: true }).extend({
  facilities: z.array(z.string()).optional(),
  services: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    price: z.string(),
    description: z.string().optional()
  })).optional(),
  membershipPlans: z.array(z.object({
    name: z.string(),
    price: z.string(),
    duration: z.string(),
    features: z.string().optional()
  })).optional()
});
export type InsertGym = z.infer<typeof insertGymSchema>; 
export const insertGymTrainerSchema = createInsertSchema(gymTrainers).omit({ id: true });
export const insertGymMemberSchema = createInsertSchema(gymMembers).omit({ id: true });
export const insertClassSchema = createInsertSchema(classes).omit({ id: true });
export type InsertClass = z.infer<typeof insertClassSchema>;
export const insertAttendanceSchema = createInsertSchema(attendance).omit({ id: true, checkInTime: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, paymentDate: true });
export const insertWorkoutPlanSchema = createInsertSchema(workoutPlans).omit({ id: true, createdAt: true });
export const insertDietPlanSchema = createInsertSchema(dietPlans).omit({ id: true, createdAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Gym = typeof gyms.$inferSelect;
export type GymMember = typeof gymMembers.$inferSelect;
export type Class = typeof classes.$inferSelect;
export type WorkoutPlan = typeof workoutPlans.$inferSelect;
export type DietPlan = typeof dietPlans.$inferSelect;
