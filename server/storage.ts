import { users, classes, bookings, subscriptions, type User, type InsertUser, type Class, type InsertClass, type Booking, type Subscription } from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  // Users & Auth
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Classes
  getClasses(): Promise<(Class & { trainer: User | null })[]>;
  getClass(id: number): Promise<Class | undefined>;
  createClass(cls: InsertClass): Promise<Class>;
  deleteClass(id: number): Promise<void>;
  
  // Bookings
  getBookings(): Promise<(Booking & { class: Class | null })[]>;
  getBookingsByUser(userId: number): Promise<(Booking & { class: Class | null })[]>;
  createBooking(booking: { userId: number; classId: number; status: string }): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking>;
  
  // Stats
  getStats(): Promise<{ totalMembers: number; activeClasses: number; totalBookings: number; revenue: number }>;
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

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getClasses(): Promise<(Class & { trainer: User | null })[]> {
    // Join with trainer
    const result = await db.select({
      class: classes,
      trainer: users,
    })
    .from(classes)
    .leftJoin(users, eq(classes.trainerId, users.id));
    
    return result.map(row => ({ ...row.class, trainer: row.trainer }));
  }

  async getClass(id: number): Promise<Class | undefined> {
    const [cls] = await db.select().from(classes).where(eq(classes.id, id));
    return cls;
  }

  async createClass(cls: InsertClass): Promise<Class> {
    const [newClass] = await db.insert(classes).values(cls).returning();
    return newClass;
  }

  async deleteClass(id: number): Promise<void> {
    await db.delete(classes).where(eq(classes.id, id));
  }

  async getBookings(): Promise<(Booking & { class: Class | null })[]> {
    const result = await db.select({
      booking: bookings,
      class: classes
    })
    .from(bookings)
    .leftJoin(classes, eq(bookings.classId, classes.id));

    return result.map(row => ({ ...row.booking, class: row.class }));
  }

  async getBookingsByUser(userId: number): Promise<(Booking & { class: Class | null })[]> {
    const result = await db.select({
      booking: bookings,
      class: classes
    })
    .from(bookings)
    .leftJoin(classes, eq(bookings.classId, classes.id))
    .where(eq(bookings.userId, userId));

    return result.map(row => ({ ...row.booking, class: row.class }));
  }

  async createBooking(booking: { userId: number; classId: number; status: string }): Promise<Booking> {
    // Cast status to correct type as defined in schema enum
    const [newBooking] = await db.insert(bookings).values({
      userId: booking.userId,
      classId: booking.classId,
      status: booking.status as "confirmed" | "cancelled"
    }).returning();
    return newBooking;
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking> {
     const [updated] = await db.update(bookings)
       .set({ status: status as "confirmed" | "cancelled" })
       .where(eq(bookings.id, id))
       .returning();
     return updated;
  }

  async getStats(): Promise<{ totalMembers: number; activeClasses: number; totalBookings: number; revenue: number }> {
    const [memberCount] = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.role, 'member'));
    const [classCount] = await db.select({ count: sql<number>`count(*)` }).from(classes);
    const [bookingCount] = await db.select({ count: sql<number>`count(*)` }).from(bookings);
    
    return {
      totalMembers: Number(memberCount.count),
      activeClasses: Number(classCount.count),
      totalBookings: Number(bookingCount.count),
      revenue: Number(memberCount.count) * 50 // Mock revenue: $50 per member
    };
  }
}

export const storage = new DatabaseStorage();
