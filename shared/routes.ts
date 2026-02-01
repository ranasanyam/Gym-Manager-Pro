import { z } from 'zod';
import { 
  insertUserSchema, 
  insertGymSchema, 
  insertGymMemberSchema, 
  insertClassSchema,
  insertWorkoutPlanSchema, 
  insertDietPlanSchema,
  users, 
  gyms, 
  gymMembers, 
  classes, 
  attendance, 
  payments, 
  workoutPlans, 
  dietPlans 
} from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/register',
      input: insertUserSchema,
      responses: { 201: z.custom<typeof users.$inferSelect>(), 400: errorSchemas.validation },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({ mobileNumber: z.string(), password: z.string() }),
      responses: { 200: z.custom<typeof users.$inferSelect>(), 401: errorSchemas.unauthorized },
    },
    logout: { method: 'POST' as const, path: '/api/logout', responses: { 200: z.void() } },
    me: { method: 'GET' as const, path: '/api/user', responses: { 200: z.custom<typeof users.$inferSelect>(), 401: errorSchemas.unauthorized } },
    updateRole: {
      method: 'PATCH' as const,
      path: '/api/user/role',
      input: z.object({ role: z.enum(['owner', 'member']) }),
      responses: { 200: z.custom<typeof users.$inferSelect>() },
    },
  },
  gyms: {
    list: { method: 'GET' as const, path: '/api/gyms', responses: { 200: z.array(z.custom<typeof gyms.$inferSelect>()) } },
    create: { method: 'POST' as const, path: '/api/gyms', input: insertGymSchema, responses: { 201: z.custom<typeof gyms.$inferSelect>() } },
    get: { method: 'GET' as const, path: '/api/gyms/:id', responses: { 200: z.custom<typeof gyms.$inferSelect>(), 404: errorSchemas.notFound } },
    members: { method: 'GET' as const, path: '/api/gyms/:id/members', responses: { 200: z.array(z.custom<typeof gymMembers.$inferSelect & { user: typeof users.$inferSelect, gym: typeof gyms.$inferSelect }>()) } },
    update: { method: 'PATCH' as const, path: '/api/gyms/:id', input: insertGymSchema.partial(), responses: { 200: z.custom<typeof gyms.$inferSelect>() } },
  },
  classes: {
    list: { method: 'GET' as const, path: '/api/classes', responses: { 200: z.array(z.custom<typeof classes.$inferSelect>()) } },
    create: { method: 'POST' as const, path: '/api/classes', input: insertClassSchema, responses: { 201: z.custom<typeof classes.$inferSelect>() } },
    delete: { method: 'DELETE' as const, path: '/api/classes/:id', responses: { 200: z.void() } },
  },
  members: {
    list: { method: 'GET' as const, path: '/api/members', responses: { 200: z.array(z.custom<typeof gymMembers.$inferSelect & { user: typeof users.$inferSelect, gym: typeof gyms.$inferSelect }>()) } },
    create: { method: 'POST' as const, path: '/api/members', input: insertGymMemberSchema, responses: { 201: z.custom<typeof gymMembers.$inferSelect>() } },
    delete: { method: 'DELETE' as const, path: '/api/members/:id', responses: { 200: z.void() } },
  },
  bookings: {
    list: { method: 'GET' as const, path: '/api/bookings', responses: { 200: z.array(z.any()) } },
    create: { method: 'POST' as const, path: '/api/bookings', input: z.any(), responses: { 201: z.any() } },
    cancel: { method: 'POST' as const, path: '/api/bookings/:id/cancel', responses: { 200: z.any() } },
  },
  plans: {
    workouts: { 
      list: { method: 'GET' as const, path: '/api/members/:memberId/workouts', responses: { 200: z.array(z.custom<typeof workoutPlans.$inferSelect>()) } },
      create: { method: 'POST' as const, path: '/api/workouts', input: insertWorkoutPlanSchema, responses: { 201: z.custom<typeof workoutPlans.$inferSelect>() } },
    },
    diets: {
      list: { method: 'GET' as const, path: '/api/members/:memberId/diets', responses: { 200: z.array(z.custom<typeof dietPlans.$inferSelect>()) } },
      create: { method: 'POST' as const, path: '/api/diets', input: insertDietPlanSchema, responses: { 201: z.custom<typeof dietPlans.$inferSelect>() } },
    }
  },
  stats: {
    owner: { method: 'GET' as const, path: '/api/stats/owner', responses: { 200: z.object({ totalRevenue: z.number(), activeMembers: z.number() }) } },
  },

  uploads: {
    upload: { method: 'POST' as const, path: '/api/uploads', responses: { 200: z.object({ urls: z.array(z.string()) }) } }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
  }
  return url;
}
