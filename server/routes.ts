import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { setupAuth, isAuthenticated } from "./auth";
import { pool } from "./db";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const { registerUser } = setupAuth(app, pool);

  // Auth Routes
  app.post(api.auth.register.path, async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const user = await registerUser(req.body);
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (err) {
      next(err);
    }
  });

  app.post(api.auth.login.path, (req, res, next) => {
    // @ts-ignore
    import("passport").then((passport) => {
       passport.default.authenticate("local", (err: any, user: any, info: any) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ message: "Invalid credentials" });
        req.login(user, (err) => {
          if (err) return next(err);
          res.status(200).json(user);
        });
      })(req, res, next);
    });
  });

  app.post(api.auth.logout.path, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  // API Routes
  
  // Classes
  app.get(api.classes.list.path, isAuthenticated, async (req, res) => {
    const classes = await storage.getClasses();
    res.json(classes);
  });

  app.post(api.classes.create.path, isAuthenticated, async (req, res) => {
    // Only owner/trainer should create classes (simplified for now)
    const cls = await storage.createClass(req.body);
    res.status(201).json(cls);
  });

  app.get(api.classes.get.path, isAuthenticated, async (req, res) => {
    const cls = await storage.getClass(Number(req.params.id));
    if (!cls) return res.sendStatus(404);
    res.json(cls);
  });
  
  app.delete(api.classes.delete.path, isAuthenticated, async (req, res) => {
    await storage.deleteClass(Number(req.params.id));
    res.sendStatus(200);
  });

  // Bookings
  app.get(api.bookings.list.path, isAuthenticated, async (req, res) => {
    // If owner/trainer, show all? For now showing user's own bookings if member
    // Using a simpler approach: return all bookings for owner, user's own for member
    const user = req.user as any;
    if (user.role === 'owner' || user.role === 'trainer') {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } else {
      const bookings = await storage.getBookingsByUser(user.id);
      res.json(bookings);
    }
  });

  app.post(api.bookings.create.path, isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const booking = await storage.createBooking({
      userId: user.id,
      classId: req.body.classId,
      status: 'confirmed'
    });
    res.status(201).json(booking);
  });

  app.post(api.bookings.cancel.path, isAuthenticated, async (req, res) => {
    const booking = await storage.updateBookingStatus(Number(req.params.id), 'cancelled');
    res.json(booking);
  });

  // Users & Stats
  app.get(api.users.list.path, isAuthenticated, async (req, res) => {
    const user = req.user as any;
    if (user.role !== 'owner') return res.sendStatus(403);
    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.get(api.users.stats.path, isAuthenticated, async (req, res) => {
    const user = req.user as any;
    if (user.role !== 'owner') return res.sendStatus(403);
    const stats = await storage.getStats();
    res.json(stats);
  });
  
  // Seed data function (simple check)
  seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const users = await storage.getAllUsers();
  if (users.length === 0) {
    const { registerUser } = await import("./auth");
    
    // Create Owner
    await registerUser({
      username: "owner",
      password: "password123",
      role: "owner",
      fullName: "Gym Owner",
      email: "owner@gym.com"
    });

    // Create Trainer
    const trainer = await registerUser({
      username: "trainer",
      password: "password123",
      role: "trainer",
      fullName: "John Trainer",
      email: "john@gym.com"
    });

    // Create Member
    const member = await registerUser({
      username: "member",
      password: "password123",
      role: "member",
      fullName: "Alice Member",
      email: "alice@gym.com"
    });

    // Create Class
    await storage.createClass({
      name: "Morning Yoga",
      description: "Start your day with zen.",
      trainerId: trainer.id,
      capacity: 20,
      schedule: new Date(Date.now() + 86400000), // Tomorrow
      duration: 60
    });
    
     await storage.createClass({
      name: "HIIT Blast",
      description: "High intensity interval training.",
      trainerId: trainer.id,
      capacity: 15,
      schedule: new Date(Date.now() + 172800000), // Day after tomorrow
      duration: 45
    });
  }
}
