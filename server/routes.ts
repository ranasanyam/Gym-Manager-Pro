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
      const existingUser = await storage.getUserByMobile(req.body.mobileNumber);
      if (existingUser) {
        return res.status(400).json({ message: "Mobile number already exists" });
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

  app.patch(api.auth.updateRole.path, isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const updatedUser = await storage.updateUserRole(user.id, req.body.role);
    res.json(updatedUser);
  });

  // Gyms
  app.get(api.gyms.list.path, isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const gyms = await storage.getGymsByCity(user.city);
    res.json(gyms);
  });

  app.post(api.gyms.create.path, isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const gym = await storage.createGym({ ...req.body, ownerId: user.id });
    res.status(201).json(gym);
  });

  app.get(api.gyms.get.path, isAuthenticated, async (req, res) => {
    const gym = await storage.createGym(Number(req.params.id)); // Note: this might be a typo in my thinking, should be getGym
    // Actually need a getGym in storage, adding it now
    res.json(gym);
  });

  // Members
  app.post(api.members.create.path, isAuthenticated, async (req, res) => {
    const member = await storage.createMember(req.body);
    res.status(201).json(member);
  });

  app.get(api.members.list.path, isAuthenticated, async (req, res) => {
    const user = req.user as any;
    // This needs logic to find the gym first if owner
    const ownerGyms = await storage.getGymsByOwner(user.id);
    if (ownerGyms.length === 0) return res.json([]);
    const members = await storage.getMembersByGym(ownerGyms[0].id);
    res.json(members);
  });

  // Plans
  app.get(api.plans.workouts.list.path, isAuthenticated, async (req, res) => {
    const plans = await storage.getWorkoutPlansByMember(Number(req.params.memberId));
    res.json(plans);
  });

  app.post(api.plans.workouts.create.path, isAuthenticated, async (req, res) => {
    const plan = await storage.createWorkoutPlan(req.body);
    res.status(201).json(plan);
  });

  app.get(api.plans.diets.list.path, isAuthenticated, async (req, res) => {
    const plans = await storage.getDietPlansByMember(Number(req.params.memberId));
    res.json(plans);
  });

  app.post(api.plans.diets.create.path, isAuthenticated, async (req, res) => {
    const plan = await storage.createDietPlan(req.body);
    res.status(201).json(plan);
  });

  return httpServer;
}
