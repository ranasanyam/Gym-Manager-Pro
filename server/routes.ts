import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { setupAuth, isAuthenticated } from "./auth";
import { pool } from "./db";
import { z } from "zod";
import multer from "multer";  
import path from "path";
import fs from "fs";

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const { registerUser } = setupAuth(app, pool);

  // Ensure uploads directory exists and setup multer
  const uploadDir = path.resolve(__dirname, "public", "uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const storageEngine = multer.diskStorage({
    destination: (_req: any, _file: any, cb: any) => cb(null, uploadDir),
    filename: (_req: any, file: any, cb: any) => {
      const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const ext = path.extname(file.originalname);
      cb(null, `${unique}${ext}`);
    },
  });
  const upload = multer({ storage: storageEngine, limits: { fileSize: 5 * 1024 * 1024 } });

  // Uploads
  app.post('/api/uploads', isAuthenticated, upload.array('images', 6), async (req, res) => {
    try {
      const files = (req as any).files || [];
      const urls = files.map((f: any) => `/uploads/${f.filename}`);
      res.json({ urls });
    } catch (err) {
      console.error('Failed to upload files', err);
      res.status(500).json({ message: 'Failed to upload files' });
    }
  });

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

  app.get('/api/user/member', isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const member = await storage.getMemberByUserId(user.id);
    if (!member) return res.status(404).json({ message: 'Member record not found' });
    res.json(member);
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

  // Return gyms owned by the authenticated user
  app.get(`${api.gyms.list.path}/owner`, isAuthenticated, async (req, res) => {
    const user = req.user as any;
    try {
      if (!user?.id) {
        console.error('No authenticated user for /api/gyms/owner');
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const ownerId = Number(user.id);
      console.log('Fetching gyms for owner id', ownerId);
      if (Number.isNaN(ownerId)) {
        console.error('Invalid authenticated user id for /api/gyms/owner', user.id);
        return res.status(400).json({ message: 'Invalid user id' });
      }

      let gyms;
      try {
        gyms = await storage.getGymsByOwner(ownerId);
      } catch (err: any) {
        console.error('Error in storage.getGymsByOwner', { ownerId, error: err?.message, detail: err?.detail, stack: err?.stack });
        // detect null owner_id constraint errors specifically
        if (err && (err.code === '23502' || (err.message && err.message.includes('owner_id')))) {
          return res.status(500).json({ message: 'Data integrity error while fetching gyms. Please check gyms table for missing owner references.' });
        }
        return res.status(500).json({ message: 'Failed to fetch gyms for owner' });
      }

      // Filter out any invalid records just in case
      const validGyms = Array.isArray(gyms) ? gyms.filter(g => g && g.ownerId != null) : [];
      res.json(validGyms);
    } catch (err) {
      console.error('Error fetching gyms for owner', err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  app.post(api.gyms.create.path, isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const gym = await storage.createGym({ ...req.body, ownerId: user.id });
    res.status(201).json(gym);
  });

  app.get(`${api.gyms.get.path}/members`, isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const gymId = Number(req.params.id);
    try {
      const gym = await storage.getGym(gymId);
      if (!gym) return res.status(404).json({ message: 'Gym not found' });
      // Allow the owner of the gym to see members
      if (gym.ownerId !== user.id) return res.status(403).json({ message: 'Forbidden' });
      const members = await storage.getMembersByGym(gymId);
      res.json(members);
    } catch (err) {
      console.error('Failed to fetch gym members', err);
      res.status(500).json({ message: 'Failed to fetch members' });
    }
  });

  app.get(api.gyms.get.path, isAuthenticated, async (req, res) => {
    const gym = await storage.getGym(Number(req.params.id));
    res.json(gym);
  });

  // Members
  app.post(api.members.create.path, isAuthenticated, async (req, res) => {
    try {
      const authUser = req.user as any;
      if (!authUser?.id) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Accept either an object describing the member or minimal mobileNumber/fullName
      const {
        mobileNumber,
        fullName,
        email,
        gender,
        ageOrDob,
        address,
        city,
        membershipType,
        membershipPlan,
        goals,
        startDate,
        endDate,
        gymId: requestedGymId,
      } = req.body as any;

      // Ensure we can determine the gym to attach the member to
      let gymId = requestedGymId;
      if (!gymId) {
        let ownerGyms;
        try {
          ownerGyms = await storage.getGymsByOwner(authUser.id);
        } catch (err) {
          console.error('Failed to fetch owner gyms', err);
          return res.status(500).json({ message: 'Failed to fetch owner gyms' });
        }

        if (!ownerGyms || ownerGyms.length === 0) {
          return res.status(400).json({ message: 'No gym available to add member to' });
        }
        gymId = ownerGyms[0].id;
      }

      if (!mobileNumber) {
        return res.status(400).json({ message: 'mobileNumber is required' });
      }

      // find or create user by mobile number
      let user = await storage.getUserByMobile(mobileNumber);
      if (!user) {
        // create a basic user record for the member. generate username/password
        const baseUsername = `m${mobileNumber}`.slice(0, 30);
        let username = baseUsername;
        let attempt = 0;
        while (await storage.getUserByUsername(username)) {
          attempt++;
          username = `${baseUsername}${attempt}`.slice(0, 30);
        }
        const randomPassword = Math.random().toString(36).slice(2, 10) || 'changeme';
        const insertUser: any = {
          fullName: fullName || 'Member',
          mobileNumber,
          email: email || undefined,
          gender: gender || undefined,
          ageOrDob: ageOrDob || undefined,
          city: city || authUser.city || 'unknown',
          role: 'member',
          password: randomPassword,
          username,
        };
        try {
          user = await storage.createUser(insertUser);
        } catch (err) {
          // If insert failed because user already exists due to race, try to fetch again
          // eslint-disable-next-line no-console
          console.error('Error creating user, attempting to re-fetch by mobile', err);
          user = await storage.getUserByMobile(mobileNumber);
        }
      }

      // ensure user has an id
      if (!user || !user.id) {
        // eslint-disable-next-line no-console
        console.error('User is missing id after create/fetch', user);
        return res.status(500).json({ message: 'Failed to resolve user for member' });
      }

      // verify gym exists
      try {
        const gym = await storage.getGym(Number(gymId));
        if (!gym) {
          return res.status(400).json({ message: 'Specified gym not found' });
        }
      } catch (err) {
        console.error('Failed to fetch gym by id', gymId, err);
        return res.status(500).json({ message: 'Failed to resolve gym' });
      }

      // membership defaults
      const mType = membershipType || 'PAID';
      const sd = startDate ? new Date(startDate) : new Date();
      const ed = endDate ? new Date(endDate) : undefined;

      const memberInsert: any = {
        userId: user.id,
        gymId,
        membershipType: mType,
        startDate: sd,
        endDate: ed,
      };

      if (!memberInsert.userId || !memberInsert.gymId) {
        console.error('Invalid member insert payload', memberInsert);
        return res.status(500).json({ message: 'Invalid member data' });
      }

      let newMember;
      try {
        newMember = await storage.createMember(memberInsert);
      } catch (err) {
        console.error('Error inserting gym member', err, memberInsert);
        return res.status(500).json({ message: 'Failed to create gym member' });
      }

      res.status(201).json({ member: newMember, user });
    } catch (err) {
      console.error('Error creating member', err);
      res.status(500).json({ message: 'Failed to create member' });
    }
  });

  app.get(`${api.members.list.path}/:id`, isAuthenticated, async (req, res) => {
    try {
      const memberId = Number(req.params.id);
      const member = await storage.getMemberWithUser(memberId);
      if (!member) return res.status(404).json({ message: 'Member not found' });
      
      const [attendance, payments, workoutPlans, dietPlans] = await Promise.all([
        storage.getAttendanceByMember(memberId),
        storage.getPaymentsByMember(memberId),
        storage.getWorkoutPlansByMember(memberId),
        storage.getDietPlansByMember(memberId)
      ]);

      res.json({
        ...member,
        attendance,
        payments,
        workoutPlans,
        dietPlans
      });
    } catch (err) {
      console.error('Error fetching member details', err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
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
    try {
      const memberId = Number(req.params.memberId);
      const plans = await storage.getWorkoutPlansByMember(memberId);
      res.json(plans);
    } catch (err) {
      console.error('Failed to fetch workout plans', err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  app.post(api.plans.workouts.create.path, isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const plan = await storage.createWorkoutPlan({ ...req.body, createdBy: user.id });
      res.status(201).json(plan);
    } catch (err) {
      console.error('Failed to create workout plan', err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  app.get(api.plans.diets.list.path, isAuthenticated, async (req, res) => {
    try {
      const memberId = Number(req.params.memberId);
      const plans = await storage.getDietPlansByMember(memberId);
      res.json(plans);
    } catch (err) {
      console.error('Failed to fetch diet plans', err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  app.post(api.plans.diets.create.path, isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const plan = await storage.createDietPlan({ ...req.body, createdBy: user.id });
      res.status(201).json(plan);
    } catch (err) {
      console.error('Failed to create diet plan', err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  return httpServer;
}
