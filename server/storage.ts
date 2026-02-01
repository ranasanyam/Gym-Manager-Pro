import { 
  users, gyms, gymTrainers, gymMembers, attendance, payments, workoutPlans, dietPlans, notifications, classes,
  type User, type InsertUser, type Gym, type GymMember, type WorkoutPlan, type DietPlan, type Class
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByMobile(mobileNumber: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserRole(id: number, role: "owner" | "trainer" | "member"): Promise<User>;
  
  createGym(gym: any): Promise<Gym>;
  getGym(id: number): Promise<Gym | undefined>;
  getGymsByCity(city: string): Promise<Gym[]>;
  getGymsByOwner(ownerId: number): Promise<Gym[]>;
  
  createClass(cls: any): Promise<Class>;
  getClassesByGym(gymId: number): Promise<Class[]>;
  getClass(id: number): Promise<Class | undefined>;
  deleteClass(id: number): Promise<void>;
  
  createMember(member: any): Promise<GymMember>;
  getMembersByGym(gymId: number): Promise<any[]>;
  getMemberByUserId(userId: number): Promise<GymMember | undefined>;
  getMemberWithUser(id: number): Promise<any | undefined>;
  getAttendanceByMember(memberId: number): Promise<any[]>;
  getPaymentsByMember(memberId: number): Promise<any[]>;
  
  createWorkoutPlan(plan: any): Promise<WorkoutPlan>;
  getWorkoutPlansByMember(memberId: number): Promise<WorkoutPlan[]>;
  
  createDietPlan(plan: any): Promise<DietPlan>;
  getDietPlansByMember(memberId: number): Promise<DietPlan[]>;
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
  async getUserByMobile(mobileNumber: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.mobileNumber, mobileNumber));
    return user;
  }
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async updateUserRole(id: number, role: "owner" | "trainer" | "member"): Promise<User> {
    const [user] = await db.update(users).set({ role }).where(eq(users.id, id)).returning();
    return user;
  }
  async createGym(gym: any): Promise<Gym> {
    const [newGym] = await db.insert(gyms).values({
      ownerId: gym.ownerId,
      name: gym.name,
      address: gym.address,
      city: gym.city,
      contactNumber: gym.contactNumber,
      gymImages: gym.gymImages,
      gpayQr: gym.gpayQr,
      phonepeQr: gym.phonepeQr,
      facilities: gym.facilities,
      services: gym.services,
      membershipPlans: gym.membershipPlans,
      isActive: gym.isActive ?? true,
    }).returning();
    return newGym;
  }
  async getGym(id: number): Promise<Gym | undefined> {
    const [gym] = await db.select().from(gyms).where(eq(gyms.id, id));
    return gym;
  }
  async getGymsByCity(city: string): Promise<Gym[]> {
    return await db.select().from(gyms).where(eq(gyms.city, city));
  }
  async getGymsByOwner(ownerId: number): Promise<Gym[]> {
    return await db.select().from(gyms).where(eq(gyms.ownerId, ownerId));
  }
  async createClass(cls: any): Promise<Class> {
    const [newClass] = await db.insert(classes).values(cls).returning();
    return newClass;
  }
  async getClassesByGym(gymId: number): Promise<Class[]> {
    return await db.select().from(classes).where(eq(classes.gymId, gymId));
  }
  async getClass(id: number): Promise<Class | undefined> {
    const [c] = await db.select().from(classes).where(eq(classes.id, id));
    return c;
  }
  async deleteClass(id: number): Promise<void> {
    await db.delete(classes).where(eq(classes.id, id));
  }
  async createMember(member: any): Promise<GymMember> {
    const [newMember] = await db.insert(gymMembers).values(member).returning();
    return newMember;
  }
  async getMembersByGym(gymId: number): Promise<any[]> {
    return await db.select({
      member: gymMembers,
      user: users,
      gym: gyms
    }).from(gymMembers).leftJoin(users, eq(gymMembers.userId, users.id)).leftJoin(gyms, eq(gymMembers.gymId, gyms.id)).where(eq(gymMembers.gymId, gymId));
  }
  async getMemberByUserId(userId: number): Promise<GymMember | undefined> {
    const [member] = await db.select().from(gymMembers).where(eq(gymMembers.userId, userId));
    return member;
  }
  async getMemberWithUser(id: number): Promise<any | undefined> {
    const [result] = await db.select({
      member: gymMembers,
      user: users,
      gym: gyms
    }).from(gymMembers).leftJoin(users, eq(gymMembers.userId, users.id)).leftJoin(gyms, eq(gymMembers.gymId, gyms.id)).where(eq(gymMembers.id, id));
    return result;
  }

  async updateGym(id: number, update: any): Promise<Gym> {
    const [g] = await db.update(gyms).set(update).where(eq(gyms.id, id)).returning();
    return g;
  }

  async deleteMember(id: number): Promise<void> {
    await db.delete(gymMembers).where(eq(gymMembers.id, id));
  }
  async getAttendanceByMember(memberId: number): Promise<any[]> {
    return await db.select().from(attendance).where(eq(attendance.memberId, memberId));
  }
  async getPaymentsByMember(memberId: number): Promise<any[]> {
    return await db.select().from(payments).where(eq(payments.memberId, memberId));
  }
  async createWorkoutPlan(plan: any): Promise<WorkoutPlan> {
    const [newPlan] = await db.insert(workoutPlans).values(plan).returning();
    return newPlan;
  }
  async getWorkoutPlansByMember(memberId: number): Promise<WorkoutPlan[]> {
    return await db.select().from(workoutPlans).where(eq(workoutPlans.memberId, memberId));
  }
  async createDietPlan(plan: any): Promise<DietPlan> {
    const [newPlan] = await db.insert(dietPlans).values(plan).returning();
    return newPlan;
  }
  async getDietPlansByMember(memberId: number): Promise<DietPlan[]> {
    return await db.select().from(dietPlans).where(eq(dietPlans.memberId, memberId));
  }
}

export const storage = new DatabaseStorage();
