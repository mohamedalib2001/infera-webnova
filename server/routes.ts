import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateWebsiteCode, refineWebsiteCode } from "./anthropic";
import { insertProjectSchema, insertMessageSchema, insertProjectVersionSchema, insertShareLinkSchema, insertUserSchema, insertAiModelSchema, insertAiUsagePolicySchema, insertEmergencyControlSchema, insertFeatureFlagSchema, insertSystemAnnouncementSchema, insertAdminRoleSchema, insertSovereignAssistantSchema, insertSovereignCommandSchema, insertSovereignActionSchema, insertSovereignActionLogSchema, insertSovereignPolicySchema, type User } from "@shared/schema";
import { z } from "zod";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";

// Session user type
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    user?: Omit<User, 'password'>;
  }
}

// Auth middleware - supports both Replit Auth and traditional sessions
const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  // Check Replit Auth first (passport)
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    const replitUser = req.user as any;
    const userId = replitUser.claims?.sub;
    if (userId) {
      // Attach user to request for downstream use
      let dbUser = await storage.getUser(userId);
      
      // Auto-provision user if not found (can happen if upsert failed)
      if (!dbUser) {
        const claims = replitUser.claims;
        try {
          dbUser = await storage.upsertUser({
            id: userId,
            email: claims?.email,
            firstName: claims?.first_name,
            lastName: claims?.last_name,
            profileImageUrl: claims?.profile_image_url,
            authProvider: "replit",
          });
        } catch (e) {
          console.error("Failed to auto-provision user:", e);
        }
      }
      
      if (dbUser) {
        req.session.userId = dbUser.id;
        // Strip password before storing in session
        const { password: _, ...userWithoutPassword } = dbUser;
        req.session.user = userWithoutPassword;
        return next();
      }
    }
  }
  
  // Fallback to traditional session
  if (req.session?.userId) {
    return next();
  }
  
  return res.status(401).json({ error: "يجب تسجيل الدخول أولاً / Authentication required" });
};

// Admin/Sovereign middleware
const requireSovereign = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.user || req.session.user.role !== 'sovereign') {
    return res.status(403).json({ error: "صلاحيات سيادية مطلوبة / Sovereign access required" });
  }
  next();
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // ============ Auth Routes - INFERA نظام المصادقة ============
  
  // Register - إنشاء حساب جديد
  const registerSchema = z.object({
    email: z.string().email("البريد الإلكتروني غير صحيح"),
    username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"),
    password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
    fullName: z.string().optional(),
    language: z.enum(["ar", "en"]).default("ar"),
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);
      
      // Check if user exists
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ error: "البريد الإلكتروني مستخدم بالفعل / Email already exists" });
      }
      
      const existingUsername = await storage.getUserByUsername(data.username);
      if (existingUsername) {
        return res.status(400).json({ error: "اسم المستخدم مستخدم بالفعل / Username already exists" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 12);
      
      // Create user with free role
      const user = await storage.createUser({
        email: data.email,
        username: data.username,
        password: hashedPassword,
        fullName: data.fullName || null,
        language: data.language,
        role: "free",
        isActive: true,
        emailVerified: false,
      });
      
      // Set session
      const { password: _, ...userWithoutPassword } = user;
      req.session.userId = user.id;
      req.session.user = userWithoutPassword;
      
      res.status(201).json({ 
        message: "تم إنشاء الحساب بنجاح / Account created successfully",
        user: userWithoutPassword 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map(e => e.message).join(", ");
        return res.status(400).json({ error: messages });
      }
      console.error("Registration error:", error);
      res.status(500).json({ error: "فشل في إنشاء الحساب / Failed to create account" });
    }
  });

  // Login - تسجيل الدخول
  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "بيانات الدخول غير صحيحة / Invalid credentials" });
      }
      
      if (!user.isActive) {
        return res.status(403).json({ error: "الحساب معطل / Account is disabled" });
      }
      
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "بيانات الدخول غير صحيحة / Invalid credentials" });
      }
      
      // Set session
      const { password: _, ...userWithoutPassword } = user;
      req.session.userId = user.id;
      req.session.user = userWithoutPassword;
      
      res.json({ 
        message: "تم تسجيل الدخول بنجاح / Login successful",
        user: userWithoutPassword 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map(e => e.message).join(", ");
        return res.status(400).json({ error: messages });
      }
      res.status(500).json({ error: "فشل في تسجيل الدخول / Login failed" });
    }
  });

  // Logout - تسجيل الخروج
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "فشل في تسجيل الخروج / Logout failed" });
      }
      res.json({ message: "تم تسجيل الخروج بنجاح / Logout successful" });
    });
  });

  // Get current user - الحصول على المستخدم الحالي
  app.get("/api/auth/me", async (req, res) => {
    // Check for Replit Auth (passport session)
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      const replitUser = req.user as any;
      const userId = replitUser.claims?.sub;
      if (userId) {
        const user = await storage.getUser(userId);
        if (user) {
          const { password, ...userWithoutPassword } = user;
          return res.json({ user: userWithoutPassword });
        }
      }
    }
    
    // Check for traditional session
    if (!req.session?.userId) {
      return res.status(401).json({ error: "غير مسجل الدخول / Not logged in" });
    }
    res.json({ user: req.session.user });
  });

  // ============ OTP Routes - التحقق بخطوتين ============
  
  // Request OTP - طلب رمز التحقق
  app.post("/api/auth/request-otp", requireAuth, async (req, res) => {
    try {
      const { generateOTP, sendOTPEmail } = await import("./email");
      
      const user = req.session.user!;
      const code = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      // Save OTP to database
      await storage.createOtpCode({
        userId: user.id,
        email: user.email,
        code,
        type: "email",
        isUsed: false,
        expiresAt,
      });
      
      // Send email
      const emailSent = await sendOTPEmail(user.email, code, user.language as "ar" | "en");
      
      res.json({ 
        success: true,
        message: emailSent ? "تم إرسال رمز التحقق" : "تم إنشاء الرمز (وضع التطوير)",
      });
    } catch (error) {
      console.error("OTP request error:", error);
      res.status(500).json({ error: "فشل في إرسال رمز التحقق" });
    }
  });

  // Verify OTP - التحقق من الرمز
  app.post("/api/auth/verify-otp", requireAuth, async (req, res) => {
    try {
      const { code } = req.body;
      
      if (!code || code.length !== 6) {
        return res.status(400).json({ error: "رمز التحقق غير صحيح" });
      }
      
      const user = req.session.user!;
      const otpCode = await storage.getValidOtpCode(user.id, code);
      
      if (!otpCode) {
        return res.status(400).json({ error: "رمز التحقق غير صحيح أو منتهي الصلاحية" });
      }
      
      // Mark OTP as used
      await storage.markOtpUsed(otpCode.id);
      
      // Update user email verification
      await storage.updateUser(user.id, { emailVerified: true });
      
      // Update session
      req.session.user = { ...user, emailVerified: true };
      
      res.json({ 
        success: true,
        message: "تم التحقق بنجاح",
      });
    } catch (error) {
      console.error("OTP verification error:", error);
      res.status(500).json({ error: "فشل في التحقق" });
    }
  });

  // ============ Subscription Plans Routes - خطط الاشتراك ============
  
  // Get all subscription plans
  app.get("/api/plans", async (req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب خطط الاشتراك" });
    }
  });

  // Get current user subscription
  app.get("/api/subscription", requireAuth, async (req, res) => {
    try {
      const subscription = await storage.getUserSubscription(req.session.userId!);
      res.json(subscription || null);
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب الاشتراك" });
    }
  });

  // ============ Sovereign Routes - مسارات سيادية ============
  
  // Get all users (sovereign only)
  app.get("/api/sovereign/users", requireAuth, requireSovereign, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users.map((u: User) => {
        const { password: _, ...rest } = u;
        return rest;
      }));
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب المستخدمين" });
    }
  });

  // Activate user subscription manually (sovereign only)
  app.post("/api/sovereign/activate-subscription", requireAuth, requireSovereign, async (req, res) => {
    try {
      const { userId, planId, billingCycle } = req.body;
      
      // Update user role based on plan
      const plan = await storage.getSubscriptionPlan(planId);
      if (!plan) {
        return res.status(404).json({ error: "الخطة غير موجودة" });
      }
      
      // Create subscription
      const now = new Date();
      const periodEnd = new Date();
      switch (billingCycle) {
        case 'monthly': periodEnd.setMonth(periodEnd.getMonth() + 1); break;
        case 'quarterly': periodEnd.setMonth(periodEnd.getMonth() + 3); break;
        case 'semi_annual': periodEnd.setMonth(periodEnd.getMonth() + 6); break;
        case 'yearly': periodEnd.setFullYear(periodEnd.getFullYear() + 1); break;
      }
      
      const subscription = await storage.createUserSubscription({
        userId,
        planId,
        status: "active",
        billingCycle,
        paymentMethod: "manual",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      });
      
      // Update user role
      await storage.updateUser(userId, { role: plan.role });
      
      res.json({ message: "تم تفعيل الاشتراك بنجاح", subscription });
    } catch (error) {
      console.error("Subscription activation error:", error);
      res.status(500).json({ error: "فشل في تفعيل الاشتراك" });
    }
  });

  // Toggle user status (sovereign only)
  app.post("/api/sovereign/users/:userId/toggle", requireAuth, requireSovereign, async (req, res) => {
    try {
      const { userId } = req.params;
      const { isActive } = req.body;
      
      await storage.updateUser(userId, { isActive });
      res.json({ message: "تم تحديث حالة المستخدم", isActive });
    } catch (error) {
      res.status(500).json({ error: "فشل في تحديث حالة المستخدم" });
    }
  });

  // Get system stats (sovereign only)
  app.get("/api/sovereign/stats", requireAuth, requireSovereign, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const projects = await storage.getProjects();
      
      res.json({
        totalUsers: users.length,
        activeUsers: users.filter(u => u.isActive).length,
        totalProjects: projects.length,
        aiGenerations: 0, // TODO: Track AI generations
      });
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب الإحصائيات" });
    }
  });

  // ============ Projects Routes ============
  
  // Get all projects
  app.get("/api/projects", async (req, res) => {
    try {
      // Check for authenticated user (Replit Auth or traditional session)
      let userId: string | null = null;
      
      if (req.isAuthenticated && req.isAuthenticated() && req.user) {
        const replitUser = req.user as any;
        userId = replitUser.claims?.sub || null;
      } else if (req.session?.userId) {
        userId = req.session.userId;
      }
      
      // Not authenticated - return empty array
      if (!userId) {
        return res.json([]);
      }
      
      // Check if user is owner - owners see ALL projects
      const user = await storage.getUser(userId);
      if (user?.role === "owner") {
        const allProjects = await storage.getProjects();
        return res.json(allProjects);
      }
      
      // Regular users see only their own projects
      const projects = await storage.getProjectsByUser(userId);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  // Get single project
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  // Create project - attach to authenticated user (requires auth)
  app.post("/api/projects", async (req, res) => {
    try {
      // Get authenticated user
      let userId: string | null = null;
      
      if (req.isAuthenticated && req.isAuthenticated() && req.user) {
        const replitUser = req.user as any;
        userId = replitUser.claims?.sub || null;
      } else if (req.session?.userId) {
        userId = req.session.userId;
      }
      
      // Require authentication to create projects
      if (!userId) {
        return res.status(401).json({ error: "Authentication required to create projects" });
      }
      
      const data = insertProjectSchema.parse(req.body);
      // Attach userId to project
      const projectData = { ...data, userId };
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  // Update project
  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const data = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(req.params.id, data);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  // Delete project - with ownership check
  app.delete("/api/projects/:id", async (req, res) => {
    try {
      // Get authenticated user
      let userId: string | null = null;
      
      if (req.isAuthenticated && req.isAuthenticated() && req.user) {
        const replitUser = req.user as any;
        userId = replitUser.claims?.sub || null;
      } else if (req.session?.userId) {
        userId = req.session.userId;
      }
      
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      // Check project ownership
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Allow owner role to delete any project, or project owner
      const user = await storage.getUser(userId);
      if (project.userId !== userId && user?.role !== "owner") {
        return res.status(403).json({ error: "Not authorized to delete this project" });
      }
      
      const deleted = await storage.deleteProject(req.params.id);
      if (!deleted) {
        return res.status(500).json({ error: "Failed to delete project" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // ============ Templates Routes ============
  
  // Get all templates
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  // Get single template
  app.get("/api/templates/:id", async (req, res) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch template" });
    }
  });

  // ============ Messages Routes ============
  
  // Get messages for a project
  app.get("/api/projects/:projectId/messages", async (req, res) => {
    try {
      const messages = await storage.getMessagesByProject(req.params.projectId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Create message
  app.post("/api/messages", async (req, res) => {
    try {
      const data = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(data);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  // ============ AI Generation Route ============
  
  const generateSchema = z.object({
    prompt: z.string().min(1, "Prompt is required"),
    projectId: z.string().optional().nullable(),
    context: z.string().optional(),
  });

  app.post("/api/generate", async (req, res) => {
    try {
      const { prompt, context } = generateSchema.parse(req.body);
      
      let result;
      if (context) {
        // Parse context to extract current code
        const htmlMatch = context.match(/Current HTML: ([\s\S]*?)(?=\nCurrent CSS:|$)/);
        const cssMatch = context.match(/Current CSS: ([\s\S]*?)(?=\nCurrent JS:|$)/);
        const jsMatch = context.match(/Current JS: ([\s\S]*?)$/);
        
        const currentHtml = htmlMatch?.[1]?.trim() || "";
        const currentCss = cssMatch?.[1]?.trim() || "";
        const currentJs = jsMatch?.[1]?.trim() || "";
        
        if (currentHtml || currentCss || currentJs) {
          result = await refineWebsiteCode(prompt, currentHtml, currentCss, currentJs);
        } else {
          result = await generateWebsiteCode(prompt);
        }
      } else {
        result = await generateWebsiteCode(prompt);
      }
      
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Generation error:", error);
      res.status(500).json({ 
        error: "Failed to generate code",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // ============ Project Versions Routes ============

  // Get all versions for a project
  app.get("/api/projects/:projectId/versions", async (req, res) => {
    try {
      const versions = await storage.getProjectVersions(req.params.projectId);
      res.json(versions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch versions" });
    }
  });

  // Get single version
  app.get("/api/versions/:id", async (req, res) => {
    try {
      const version = await storage.getProjectVersion(req.params.id);
      if (!version) {
        return res.status(404).json({ error: "Version not found" });
      }
      res.json(version);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch version" });
    }
  });

  // Create version (save snapshot)
  app.post("/api/projects/:projectId/versions", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Get existing versions to determine version number
      const existingVersions = await storage.getProjectVersions(req.params.projectId);
      const versionNumber = `v${existingVersions.length + 1}`;

      const versionData = {
        projectId: req.params.projectId,
        versionNumber,
        htmlCode: project.htmlCode,
        cssCode: project.cssCode,
        jsCode: project.jsCode,
        description: req.body.description || `Snapshot ${versionNumber}`,
      };

      const version = await storage.createProjectVersion(versionData);
      res.status(201).json(version);
    } catch (error) {
      res.status(500).json({ error: "Failed to create version" });
    }
  });

  // Restore version
  app.post("/api/projects/:projectId/restore/:versionId", async (req, res) => {
    try {
      const version = await storage.getProjectVersion(req.params.versionId);
      if (!version) {
        return res.status(404).json({ error: "Version not found" });
      }

      const project = await storage.updateProject(req.params.projectId, {
        htmlCode: version.htmlCode,
        cssCode: version.cssCode,
        jsCode: version.jsCode,
      });

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to restore version" });
    }
  });

  // ============ Share Links Routes ============

  // Get share links for a project
  app.get("/api/projects/:projectId/shares", async (req, res) => {
    try {
      const shares = await storage.getShareLinksByProject(req.params.projectId);
      res.json(shares);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch share links" });
    }
  });

  // Create share link
  app.post("/api/projects/:projectId/share", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const shareCode = randomBytes(8).toString("hex");
      const shareLink = await storage.createShareLink({
        projectId: req.params.projectId,
        shareCode,
        isActive: "true",
        expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : null,
      });

      res.status(201).json(shareLink);
    } catch (error) {
      res.status(500).json({ error: "Failed to create share link" });
    }
  });

  // Get shared project by share code (public)
  app.get("/api/share/:shareCode", async (req, res) => {
    try {
      const shareLink = await storage.getShareLink(req.params.shareCode);
      if (!shareLink) {
        return res.status(404).json({ error: "Share link not found" });
      }

      if (shareLink.isActive !== "true") {
        return res.status(403).json({ error: "Share link is no longer active" });
      }

      if (shareLink.expiresAt && new Date(shareLink.expiresAt) < new Date()) {
        return res.status(403).json({ error: "Share link has expired" });
      }

      const project = await storage.getProject(shareLink.projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      res.json({
        name: project.name,
        htmlCode: project.htmlCode,
        cssCode: project.cssCode,
        jsCode: project.jsCode,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch shared project" });
    }
  });

  // Deactivate share link
  app.delete("/api/shares/:id", async (req, res) => {
    try {
      const deactivated = await storage.deactivateShareLink(req.params.id);
      if (!deactivated) {
        return res.status(404).json({ error: "Share link not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to deactivate share link" });
    }
  });

  // ============ Components Routes ============

  // Get all components
  app.get("/api/components", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const allComponents = category 
        ? await storage.getComponentsByCategory(category)
        : await storage.getComponents();
      res.json(allComponents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch components" });
    }
  });

  // Get single component
  app.get("/api/components/:id", async (req, res) => {
    try {
      const component = await storage.getComponent(req.params.id);
      if (!component) {
        return res.status(404).json({ error: "Component not found" });
      }
      res.json(component);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch component" });
    }
  });

  // ============ Chatbots Routes ============

  // Middleware to check chatbot access (Pro, Enterprise, Sovereign)
  const requireChatbotAccess = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.session?.user;
    if (!user) {
      return res.status(401).json({ error: "غير مصرح / Unauthorized" });
    }
    const allowedRoles = ['pro', 'enterprise', 'sovereign'];
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ 
        error: "هذه الميزة متاحة لخطط Pro وأعلى فقط / This feature requires Pro plan or higher" 
      });
    }
    next();
  };

  // Get all chatbots for user
  app.get("/api/chatbots", requireAuth, requireChatbotAccess, async (req, res) => {
    try {
      const chatbots = await storage.getChatbotsByUser(req.session.userId!);
      res.json(chatbots);
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب الروبوتات / Failed to fetch chatbots" });
    }
  });

  // Create chatbot
  app.post("/api/chatbots", requireAuth, requireChatbotAccess, async (req, res) => {
    try {
      const { name, description, systemPrompt, model, temperature, maxTokens, greeting, language, primaryColor, secondaryColor, borderRadius, position, widgetWidth, widgetHeight, showOnMobile, autoOpen, autoOpenDelay } = req.body;
      
      if (!name || typeof name !== 'string' || name.trim().length < 1) {
        return res.status(400).json({ error: "اسم الروبوت مطلوب / Chatbot name is required" });
      }
      
      const chatbot = await storage.createChatbot({
        userId: req.session.userId!,
        name: name.trim(),
        description: description || "",
        systemPrompt: systemPrompt || "You are a helpful assistant.",
        model: model || "claude-sonnet-4-20250514",
        temperature: typeof temperature === 'number' ? Math.round(temperature * 100) : 70,
        maxTokens: maxTokens || 1000,
        greeting: greeting || "",
        language: language || "en",
        primaryColor: primaryColor || "#8B5CF6",
        secondaryColor: secondaryColor || "#EC4899",
        borderRadius: borderRadius || "12",
        position: position || "bottom-right",
        widgetWidth: widgetWidth || "380",
        widgetHeight: widgetHeight || "520",
        showOnMobile: showOnMobile ?? true,
        autoOpen: autoOpen ?? false,
        autoOpenDelay: autoOpenDelay || 5,
        isActive: true,
      });
      res.status(201).json(chatbot);
    } catch (error) {
      console.error("Create chatbot error:", error);
      res.status(500).json({ error: "فشل في إنشاء الروبوت / Failed to create chatbot" });
    }
  });

  // Test chatbot with AI
  app.post("/api/chatbots/test", requireAuth, requireChatbotAccess, async (req, res) => {
    try {
      const { message, systemPrompt, model, temperature, maxTokens } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: "الرسالة مطلوبة / Message is required" });
      }
      
      // Check if API key is available
      if (!process.env.ANTHROPIC_API_KEY && !process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY) {
        return res.status(503).json({ 
          error: "خدمة AI غير متاحة حالياً / AI service is currently unavailable. Please configure the API key." 
        });
      }
      
      // Use Claude for testing
      const Anthropic = (await import("@anthropic-ai/sdk")).default;
      const anthropic = new Anthropic();
      
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: maxTokens || 1000,
        system: systemPrompt || "You are a helpful assistant.",
        messages: [
          { role: "user", content: message }
        ],
      });

      const textContent = response.content.find(c => c.type === "text");
      res.json({ 
        response: textContent?.text || "No response generated",
      });
    } catch (error: any) {
      console.error("Chatbot test error:", error);
      if (error.message?.includes("API key")) {
        return res.status(503).json({ error: "مفتاح API غير صالح / Invalid API key" });
      }
      res.status(500).json({ error: "فشل في اختبار الروبوت / Failed to test chatbot" });
    }
  });

  // ============ SEO Routes ============

  // Analyze HTML for SEO
  app.post("/api/seo/analyze", requireAuth, async (req, res) => {
    try {
      const { content } = req.body;
      
      // Simple HTML analysis
      const hasTitle = /<title[^>]*>([^<]+)<\/title>/i.test(content);
      const hasDescription = /<meta[^>]*name=["']description["'][^>]*>/i.test(content);
      const h1Count = (content.match(/<h1[^>]*>/gi) || []).length;
      const h2Count = (content.match(/<h2[^>]*>/gi) || []).length;
      const h3Count = (content.match(/<h3[^>]*>/gi) || []).length;
      const imgTags = content.match(/<img[^>]*>/gi) || [];
      const imgsWithAlt = imgTags.filter((img: string) => /alt=["'][^"']+["']/i.test(img));
      const internalLinks = (content.match(/<a[^>]*href=["']\/[^"']*["'][^>]*>/gi) || []).length;
      const externalLinks = (content.match(/<a[^>]*href=["']https?:\/\/[^"']+["'][^>]*>/gi) || []).length;

      // Calculate score
      let score = 50;
      if (hasTitle) score += 15;
      if (hasDescription) score += 15;
      if (h1Count === 1) score += 10;
      if (h2Count >= 2) score += 5;
      if (imgsWithAlt.length === imgTags.length && imgTags.length > 0) score += 5;

      res.json({
        score: Math.min(100, score),
        title: {
          status: hasTitle ? "good" : "error",
          message: hasTitle ? "عنوان الصفحة موجود / Page title exists" : "عنوان الصفحة مفقود / Page title missing",
        },
        description: {
          status: hasDescription ? "good" : "warning",
          message: hasDescription ? "الوصف موجود / Description exists" : "الوصف مفقود / Description missing",
          suggestion: !hasDescription ? "أضف meta description / Add meta description" : undefined,
        },
        headings: {
          status: h1Count === 1 ? "good" : h1Count === 0 ? "error" : "warning",
          message: h1Count === 1 ? "هيكل العناوين جيد / Heading structure is good" : "تحقق من هيكل العناوين / Check heading structure",
          count: { h1: h1Count, h2: h2Count, h3: h3Count },
        },
        images: {
          status: imgsWithAlt.length === imgTags.length ? "good" : "error",
          message: imgsWithAlt.length === imgTags.length ? "جميع الصور لها alt / All images have alt" : "بعض الصور بدون alt / Some images missing alt",
          withAlt: imgsWithAlt.length,
          withoutAlt: imgTags.length - imgsWithAlt.length,
        },
        links: {
          status: "good",
          message: "الروابط منظمة / Links are organized",
          internal: internalLinks,
          external: externalLinks,
        },
        keywords: ["website", "AI", "builder", "موقع", "ذكاء اصطناعي"],
        suggestions: [
          !hasDescription ? "أضف وصف meta / Add meta description" : null,
          imgTags.length !== imgsWithAlt.length ? "أضف alt للصور / Add alt to images" : null,
          h1Count !== 1 ? "تأكد من وجود h1 واحد / Ensure single h1" : null,
        ].filter(Boolean),
      });
    } catch (error) {
      console.error("SEO analysis error:", error);
      res.status(500).json({ error: "فشل في تحليل SEO / SEO analysis failed" });
    }
  });

  // Generate SEO content with AI
  app.post("/api/seo/generate", requireAuth, async (req, res) => {
    try {
      const { content, type } = req.body;
      
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: "المحتوى مطلوب / Content is required" });
      }
      
      if (!type || !['title', 'description', 'keywords'].includes(type)) {
        return res.status(400).json({ error: "نوع التوليد غير صالح / Invalid generation type" });
      }
      
      // Check if API key is available
      if (!process.env.ANTHROPIC_API_KEY && !process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY) {
        return res.status(503).json({ 
          error: "خدمة AI غير متاحة حالياً / AI service is currently unavailable" 
        });
      }
      
      const Anthropic = (await import("@anthropic-ai/sdk")).default;
      const anthropic = new Anthropic();
      
      let prompt = "";
      switch (type) {
        case "title":
          prompt = "Generate an SEO-optimized page title (50-60 characters) for this HTML content. Respond with just the title.";
          break;
        case "description":
          prompt = "Generate an SEO-optimized meta description (150-160 characters) for this HTML content. Respond with just the description.";
          break;
        case "keywords":
          prompt = "Extract 5-10 relevant SEO keywords from this HTML content. Respond with comma-separated keywords only.";
          break;
        default:
          prompt = "Provide SEO recommendations for this HTML content.";
      }

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        messages: [
          { role: "user", content: `${prompt}\n\nHTML Content:\n${content.substring(0, 3000)}` }
        ],
      });

      const textContent = response.content.find(c => c.type === "text");
      res.json({ result: textContent?.text || "" });
    } catch (error: any) {
      console.error("SEO generate error:", error);
      if (error.message?.includes("API key")) {
        return res.status(503).json({ error: "مفتاح API غير صالح / Invalid API key" });
      }
      res.status(500).json({ error: "فشل في توليد المحتوى / Content generation failed" });
    }
  });

  // ============ White Label Routes ============

  // Middleware to check white label access (Enterprise, Sovereign)
  const requireWhiteLabelAccess = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.session?.user;
    if (!user) {
      return res.status(401).json({ error: "غير مصرح / Unauthorized" });
    }
    const allowedRoles = ['enterprise', 'sovereign'];
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ 
        error: "هذه الميزة متاحة لخطط Enterprise وأعلى فقط / This feature requires Enterprise plan or higher" 
      });
    }
    next();
  };

  // Save white label config
  app.post("/api/white-label", requireAuth, requireWhiteLabelAccess, async (req, res) => {
    try {
      const { brandName, brandNameAr, logoUrl, faviconUrl, primaryColor, secondaryColor, customDomain, customCss, hideWatermark, isActive } = req.body;
      
      // Validate required fields
      if (brandName && typeof brandName !== 'string') {
        return res.status(400).json({ error: "اسم العلامة غير صالح / Invalid brand name" });
      }
      
      // For now just acknowledge - would store in user settings table
      // In a full implementation, this would save to a user_settings or white_label_config table
      res.json({ 
        success: true, 
        message: "تم حفظ الإعدادات / Settings saved",
        config: { brandName, brandNameAr, logoUrl, faviconUrl, primaryColor, secondaryColor, customDomain, hideWatermark, isActive }
      });
    } catch (error) {
      res.status(500).json({ error: "فشل في حفظ الإعدادات / Failed to save settings" });
    }
  });

  // ============ Owner Routes - مسارات المالك ============

  // Middleware to check owner access
  const requireOwner = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.session?.user;
    if (!user) {
      return res.status(401).json({ error: "غير مصرح / Unauthorized" });
    }
    if (user.role !== 'owner') {
      return res.status(403).json({ 
        error: "هذه الصفحة متاحة للمالك فقط / This page is available for owner only" 
      });
    }
    next();
  };

  // Get all AI assistants
  app.get("/api/owner/assistants", requireAuth, requireOwner, async (req, res) => {
    try {
      const assistants = await storage.getAiAssistants();
      res.json(assistants);
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب المساعدين" });
    }
  });

  // Create AI assistant
  app.post("/api/owner/assistants", requireAuth, requireOwner, async (req, res) => {
    try {
      const assistant = await storage.createAiAssistant(req.body);
      res.status(201).json(assistant);
    } catch (error) {
      console.error("Create assistant error:", error);
      res.status(500).json({ error: "فشل في إنشاء المساعد" });
    }
  });

  // Get all instructions
  app.get("/api/owner/instructions", requireAuth, requireOwner, async (req, res) => {
    try {
      const instructions = await storage.getAllInstructions();
      res.json(instructions);
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب الأوامر" });
    }
  });

  // Create instruction
  app.post("/api/owner/instructions", requireAuth, requireOwner, async (req, res) => {
    try {
      const { assistantId, title, instruction, priority, category, approvalRequired } = req.body;
      
      if (!assistantId || !title || !instruction) {
        return res.status(400).json({ error: "البيانات ناقصة / Missing required fields" });
      }
      
      const newInstruction = await storage.createInstruction({
        assistantId,
        title,
        instruction,
        priority: priority || "normal",
        category: category || "general",
        approvalRequired: approvalRequired ?? true,
        status: "pending",
      });
      
      // Log the action
      await storage.createAuditLog({
        userId: req.session.userId!,
        action: "instruction_created",
        entityType: "instruction",
        entityId: newInstruction.id,
        details: { title, assistantId },
      });
      
      res.status(201).json(newInstruction);
    } catch (error) {
      console.error("Create instruction error:", error);
      res.status(500).json({ error: "فشل في إنشاء الأمر" });
    }
  });

  // Execute instruction with AI
  app.post("/api/owner/instructions/:id/execute", requireAuth, requireOwner, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get the instruction
      const instructions = await storage.getAllInstructions();
      const instruction = instructions.find(i => i.id === id);
      
      if (!instruction) {
        return res.status(404).json({ error: "الأمر غير موجود" });
      }
      
      // Update status to in_progress
      await storage.updateInstruction(id, { status: "in_progress" });
      
      // Check if API key is available
      if (!process.env.ANTHROPIC_API_KEY && !process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY) {
        await storage.updateInstruction(id, { 
          status: "failed", 
          response: "AI service is currently unavailable. Please configure the API key." 
        });
        return res.status(503).json({ 
          error: "خدمة AI غير متاحة حالياً / AI service is currently unavailable" 
        });
      }
      
      // Get assistant
      const assistant = await storage.getAiAssistant(instruction.assistantId);
      
      // Execute with Claude
      const Anthropic = (await import("@anthropic-ai/sdk")).default;
      const anthropic = new Anthropic();
      
      const startTime = Date.now();
      
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: assistant?.maxTokens || 4000,
        system: assistant?.systemPrompt || "You are an AI assistant helping with platform development. Execute the given instruction and provide detailed output.",
        messages: [
          { role: "user", content: `Execute this instruction:\n\nTitle: ${instruction.title}\n\nDetails:\n${instruction.instruction}\n\nProvide a detailed response with any code, recommendations, or actions taken.` }
        ],
      });

      const textContent = response.content.find(c => c.type === "text");
      const executionTime = Math.round((Date.now() - startTime) / 1000);
      
      // Update instruction with response
      await storage.updateInstruction(id, { 
        status: "completed",
        response: textContent?.text || "No response generated",
        executionTime,
        completedAt: new Date(),
      });
      
      // Update assistant stats
      if (assistant) {
        await storage.updateAiAssistant(assistant.id, {
          totalTasksCompleted: (assistant.totalTasksCompleted || 0) + 1,
        });
      }
      
      // Log the action
      await storage.createAuditLog({
        userId: req.session.userId!,
        action: "instruction_executed",
        entityType: "instruction",
        entityId: id,
        details: { executionTime },
      });
      
      res.json({ 
        success: true, 
        response: textContent?.text,
        executionTime,
      });
    } catch (error: any) {
      console.error("Execute instruction error:", error);
      
      // Update instruction as failed
      await storage.updateInstruction(req.params.id, { 
        status: "failed",
        response: error.message || "Execution failed",
      });
      
      res.status(500).json({ error: "فشل في تنفيذ الأمر / Failed to execute instruction" });
    }
  });

  // Get owner settings
  app.get("/api/owner/settings", requireAuth, requireOwner, async (req, res) => {
    try {
      const settings = await storage.getOwnerSettings(req.session.userId!);
      res.json(settings || null);
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب الإعدادات" });
    }
  });

  // Update owner settings
  app.post("/api/owner/settings", requireAuth, requireOwner, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const existingSettings = await storage.getOwnerSettings(userId);
      
      if (existingSettings) {
        const updated = await storage.updateOwnerSettings(userId, req.body);
        res.json(updated);
      } else {
        const created = await storage.createOwnerSettings({ userId, ...req.body });
        res.json(created);
      }
    } catch (error) {
      console.error("Update settings error:", error);
      res.status(500).json({ error: "فشل في حفظ الإعدادات" });
    }
  });

  // Get audit logs
  app.get("/api/owner/logs", requireAuth, requireOwner, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = await storage.getAuditLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب السجلات" });
    }
  });

  // Initialize default AI assistants
  app.post("/api/owner/initialize-assistants", requireAuth, requireOwner, async (req, res) => {
    try {
      const existingAssistants = await storage.getAiAssistants();
      if (existingAssistants.length > 0) {
        return res.json({ message: "Assistants already initialized", assistants: existingAssistants });
      }
      
      const defaultAssistants = [
        {
          name: "Nova Developer",
          nameAr: "نوفا المطور",
          description: "Expert in web development, coding, and technical implementation",
          descriptionAr: "خبير في تطوير الويب والبرمجة والتنفيذ التقني",
          specialty: "development",
          capabilities: ["code_generation", "bug_fixing", "api_integration", "database_design"],
          systemPrompt: "You are Nova Developer, an expert AI assistant specializing in web development. You help with coding, debugging, API integrations, and technical implementations. Provide clean, efficient, and well-documented code.",
          model: "claude-sonnet-4-20250514",
          temperature: 70,
          maxTokens: 4000,
          isActive: true,
          totalTasksCompleted: 0,
          successRate: 100,
        },
        {
          name: "Nova Designer",
          nameAr: "نوفا المصمم",
          description: "Expert in UI/UX design, styling, and visual aesthetics",
          descriptionAr: "خبير في تصميم واجهات المستخدم والتجربة البصرية",
          specialty: "design",
          capabilities: ["ui_design", "css_styling", "responsive_design", "color_schemes"],
          systemPrompt: "You are Nova Designer, an expert AI assistant specializing in UI/UX design. You help create beautiful, intuitive, and accessible user interfaces with modern design principles.",
          model: "claude-sonnet-4-20250514",
          temperature: 80,
          maxTokens: 3000,
          isActive: true,
          totalTasksCompleted: 0,
          successRate: 100,
        },
        {
          name: "Nova Content",
          nameAr: "نوفا المحتوى",
          description: "Expert in content creation, copywriting, and localization",
          descriptionAr: "خبير في إنشاء المحتوى والكتابة الإبداعية والتوطين",
          specialty: "content",
          capabilities: ["copywriting", "translation", "seo_content", "localization"],
          systemPrompt: "You are Nova Content, an expert AI assistant specializing in content creation. You help write compelling copy, translate content between Arabic and English, and optimize content for SEO.",
          model: "claude-sonnet-4-20250514",
          temperature: 85,
          maxTokens: 3000,
          isActive: true,
          totalTasksCompleted: 0,
          successRate: 100,
        },
        {
          name: "Nova Analyst",
          nameAr: "نوفا المحلل",
          description: "Expert in data analysis, metrics, and business intelligence",
          descriptionAr: "خبير في تحليل البيانات والمقاييس وذكاء الأعمال",
          specialty: "analytics",
          capabilities: ["data_analysis", "reporting", "metrics", "optimization"],
          systemPrompt: "You are Nova Analyst, an expert AI assistant specializing in data analysis and business intelligence. You help analyze metrics, identify trends, and provide actionable insights.",
          model: "claude-sonnet-4-20250514",
          temperature: 60,
          maxTokens: 3000,
          isActive: true,
          totalTasksCompleted: 0,
          successRate: 100,
        },
        {
          name: "Nova Security",
          nameAr: "نوفا الأمني",
          description: "Expert in security, compliance, and best practices",
          descriptionAr: "خبير في الأمان والامتثال وأفضل الممارسات",
          specialty: "security",
          capabilities: ["security_audit", "vulnerability_check", "compliance", "best_practices"],
          systemPrompt: "You are Nova Security, an expert AI assistant specializing in security and compliance. You help identify vulnerabilities, ensure best practices, and maintain platform security.",
          model: "claude-sonnet-4-20250514",
          temperature: 50,
          maxTokens: 3000,
          isActive: true,
          totalTasksCompleted: 0,
          successRate: 100,
        },
      ];
      
      const createdAssistants = [];
      for (const assistant of defaultAssistants) {
        const created = await storage.createAiAssistant(assistant);
        createdAssistants.push(created);
      }
      
      res.status(201).json({ message: "Assistants initialized", assistants: createdAssistants });
    } catch (error) {
      console.error("Initialize assistants error:", error);
      res.status(500).json({ error: "فشل في تهيئة المساعدين" });
    }
  });

  // ============ Payment Methods Routes (Owner) ============

  // Get all payment methods
  app.get("/api/owner/payment-methods", requireAuth, requireOwner, async (req, res) => {
    try {
      const methods = await storage.getPaymentMethods();
      // Redact secret keys before sending
      const redactedMethods = methods.map(m => ({
        ...m,
        secretKeyRef: m.secretKeyRef ? "********" : null,
        webhookSecret: m.webhookSecret ? "********" : null,
      }));
      res.json(redactedMethods);
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب طرق الدفع / Failed to fetch payment methods" });
    }
  });

  // Get active payment methods (for checkout - public)
  app.get("/api/payment-methods/active", async (req, res) => {
    try {
      const methods = await storage.getActivePaymentMethods();
      // Only return safe public info
      const publicMethods = methods.map(m => ({
        id: m.id,
        provider: m.provider,
        name: m.name,
        nameAr: m.nameAr,
        description: m.description,
        descriptionAr: m.descriptionAr,
        icon: m.icon,
        supportedCurrencies: m.supportedCurrencies,
        minAmount: m.minAmount,
        maxAmount: m.maxAmount,
      }));
      res.json(publicMethods);
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب طرق الدفع / Failed to fetch payment methods" });
    }
  });

  // Create payment method
  app.post("/api/owner/payment-methods", requireAuth, requireOwner, async (req, res) => {
    try {
      const method = await storage.createPaymentMethod(req.body);
      
      await storage.createAuditLog({
        userId: req.session.userId!,
        action: "payment_method_created",
        entityType: "payment_method",
        entityId: method.id,
        details: { provider: method.provider, name: method.name },
      });
      
      res.status(201).json(method);
    } catch (error) {
      console.error("Create payment method error:", error);
      res.status(500).json({ error: "فشل في إنشاء طريقة الدفع / Failed to create payment method" });
    }
  });

  // Update payment method
  app.patch("/api/owner/payment-methods/:id", requireAuth, requireOwner, async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updatePaymentMethod(id, req.body);
      
      if (!updated) {
        return res.status(404).json({ error: "طريقة الدفع غير موجودة / Payment method not found" });
      }
      
      await storage.createAuditLog({
        userId: req.session.userId!,
        action: "payment_method_updated",
        entityType: "payment_method",
        entityId: id,
        details: { changes: Object.keys(req.body) },
      });
      
      res.json(updated);
    } catch (error) {
      console.error("Update payment method error:", error);
      res.status(500).json({ error: "فشل في تحديث طريقة الدفع / Failed to update payment method" });
    }
  });

  // Toggle payment method status
  app.patch("/api/owner/payment-methods/:id/toggle", requireAuth, requireOwner, async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      
      const updated = await storage.togglePaymentMethod(id, isActive);
      
      if (!updated) {
        return res.status(404).json({ error: "طريقة الدفع غير موجودة / Payment method not found" });
      }
      
      await storage.createAuditLog({
        userId: req.session.userId!,
        action: isActive ? "payment_method_activated" : "payment_method_deactivated",
        entityType: "payment_method",
        entityId: id,
        details: { provider: updated.provider },
      });
      
      res.json(updated);
    } catch (error) {
      console.error("Toggle payment method error:", error);
      res.status(500).json({ error: "فشل في تحديث حالة طريقة الدفع / Failed to toggle payment method" });
    }
  });

  // Delete payment method
  app.delete("/api/owner/payment-methods/:id", requireAuth, requireOwner, async (req, res) => {
    try {
      const { id } = req.params;
      const method = await storage.getPaymentMethod(id);
      
      if (!method) {
        return res.status(404).json({ error: "طريقة الدفع غير موجودة / Payment method not found" });
      }
      
      await storage.deletePaymentMethod(id);
      
      await storage.createAuditLog({
        userId: req.session.userId!,
        action: "payment_method_deleted",
        entityType: "payment_method",
        entityId: id,
        details: { provider: method.provider },
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Delete payment method error:", error);
      res.status(500).json({ error: "فشل في حذف طريقة الدفع / Failed to delete payment method" });
    }
  });

  // Initialize default payment methods
  app.post("/api/owner/initialize-payment-methods", requireAuth, requireOwner, async (req, res) => {
    try {
      const existingMethods = await storage.getPaymentMethods();
      if (existingMethods.length > 0) {
        return res.json({ message: "Payment methods already initialized", methods: existingMethods });
      }
      
      const defaultMethods = [
        {
          provider: "stripe",
          name: "Credit/Debit Card (Stripe)",
          nameAr: "بطاقة ائتمان/خصم (Stripe)",
          description: "Accept Visa, Mastercard, and other major cards",
          descriptionAr: "قبول فيزا وماستركارد والبطاقات الرئيسية",
          icon: "CreditCard",
          supportedCurrencies: ["USD", "EUR", "GBP", "SAR", "AED"],
          supportedCountries: ["US", "EU", "SA", "AE", "KW", "BH", "QA", "OM"],
          minAmount: 50,
          maxAmount: 9999900,
          transactionFee: 290,
          fixedFee: 30,
          sandboxMode: true,
          isActive: false,
          isConfigured: false,
          sortOrder: 1,
        },
        {
          provider: "paypal",
          name: "PayPal",
          nameAr: "باي بال",
          description: "Accept PayPal payments worldwide",
          descriptionAr: "قبول مدفوعات باي بال عالمياً",
          icon: "Wallet",
          supportedCurrencies: ["USD", "EUR", "GBP"],
          supportedCountries: ["US", "EU", "UK"],
          minAmount: 100,
          maxAmount: 5000000,
          transactionFee: 349,
          fixedFee: 49,
          sandboxMode: true,
          isActive: false,
          isConfigured: false,
          sortOrder: 2,
        },
        {
          provider: "tap",
          name: "Tap Payments",
          nameAr: "تاب للمدفوعات",
          description: "Leading payment gateway for MENA region",
          descriptionAr: "بوابة الدفع الرائدة في منطقة الشرق الأوسط",
          icon: "Smartphone",
          supportedCurrencies: ["SAR", "AED", "KWD", "BHD", "QAR", "OMR"],
          supportedCountries: ["SA", "AE", "KW", "BH", "QA", "OM"],
          minAmount: 100,
          maxAmount: 9999900,
          transactionFee: 250,
          fixedFee: 100,
          sandboxMode: true,
          isActive: false,
          isConfigured: false,
          sortOrder: 3,
        },
        {
          provider: "mada",
          name: "Mada",
          nameAr: "مدى",
          description: "Saudi debit card network",
          descriptionAr: "شبكة بطاقات الخصم السعودية",
          icon: "CreditCard",
          supportedCurrencies: ["SAR"],
          supportedCountries: ["SA"],
          minAmount: 100,
          maxAmount: 9999900,
          transactionFee: 150,
          fixedFee: 0,
          sandboxMode: true,
          isActive: false,
          isConfigured: false,
          sortOrder: 4,
        },
        {
          provider: "apple_pay",
          name: "Apple Pay",
          nameAr: "أبل باي",
          description: "Fast and secure Apple Pay checkout",
          descriptionAr: "دفع سريع وآمن عبر أبل باي",
          icon: "Smartphone",
          supportedCurrencies: ["USD", "EUR", "GBP", "SAR", "AED"],
          supportedCountries: ["US", "EU", "UK", "SA", "AE"],
          minAmount: 50,
          maxAmount: 9999900,
          transactionFee: 290,
          fixedFee: 30,
          sandboxMode: true,
          isActive: false,
          isConfigured: false,
          sortOrder: 5,
        },
        {
          provider: "google_pay",
          name: "Google Pay",
          nameAr: "جوجل باي",
          description: "Fast checkout with Google Pay",
          descriptionAr: "دفع سريع عبر جوجل باي",
          icon: "Smartphone",
          supportedCurrencies: ["USD", "EUR", "GBP", "SAR", "AED"],
          supportedCountries: ["US", "EU", "UK", "SA", "AE"],
          minAmount: 50,
          maxAmount: 9999900,
          transactionFee: 290,
          fixedFee: 30,
          sandboxMode: true,
          isActive: false,
          isConfigured: false,
          sortOrder: 6,
        },
        {
          provider: "stc_pay",
          name: "STC Pay",
          nameAr: "STC Pay",
          description: "Saudi digital wallet by STC",
          descriptionAr: "المحفظة الرقمية السعودية من STC",
          icon: "Wallet",
          supportedCurrencies: ["SAR"],
          supportedCountries: ["SA"],
          minAmount: 100,
          maxAmount: 5000000,
          transactionFee: 200,
          fixedFee: 0,
          sandboxMode: true,
          isActive: false,
          isConfigured: false,
          sortOrder: 7,
        },
        {
          provider: "bank_transfer",
          name: "Bank Transfer",
          nameAr: "تحويل بنكي",
          description: "Direct bank transfer payment",
          descriptionAr: "الدفع عبر التحويل البنكي المباشر",
          icon: "Building",
          supportedCurrencies: ["USD", "EUR", "SAR", "AED"],
          supportedCountries: ["SA", "AE", "US", "EU"],
          minAmount: 10000,
          maxAmount: 99999900,
          transactionFee: 0,
          fixedFee: 500,
          sandboxMode: false,
          isActive: false,
          isConfigured: false,
          sortOrder: 8,
        },
        {
          provider: "crypto",
          name: "Cryptocurrency",
          nameAr: "العملات الرقمية",
          description: "Accept Bitcoin, Ethereum, and more",
          descriptionAr: "قبول بيتكوين وإيثيريوم والمزيد",
          icon: "Bitcoin",
          supportedCurrencies: ["BTC", "ETH", "USDT", "USDC"],
          supportedCountries: [],
          minAmount: 1000,
          maxAmount: 99999900,
          transactionFee: 100,
          fixedFee: 0,
          sandboxMode: true,
          isActive: false,
          isConfigured: false,
          sortOrder: 9,
        },
      ];
      
      const createdMethods = [];
      for (const method of defaultMethods) {
        const created = await storage.createPaymentMethod(method as any);
        createdMethods.push(created);
      }
      
      await storage.createAuditLog({
        userId: req.session.userId!,
        action: "payment_methods_initialized",
        entityType: "payment_method",
        details: { count: createdMethods.length },
      });
      
      res.status(201).json({ message: "Payment methods initialized", methods: createdMethods });
    } catch (error) {
      console.error("Initialize payment methods error:", error);
      res.status(500).json({ error: "فشل في تهيئة طرق الدفع / Failed to initialize payment methods" });
    }
  });

  // Get payment transactions (Owner)
  app.get("/api/owner/payment-transactions", requireAuth, requireOwner, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const transactions = await storage.getPaymentTransactions(limit);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب المعاملات / Failed to fetch transactions" });
    }
  });

  // Get payment analytics (Owner)
  app.get("/api/owner/payment-analytics", requireAuth, requireOwner, async (req, res) => {
    try {
      const transactions = await storage.getPaymentTransactions(1000);
      const methods = await storage.getPaymentMethods();
      
      // Calculate analytics
      const completedTx = transactions.filter(t => t.status === "completed");
      const failedTx = transactions.filter(t => t.status === "failed");
      const refundedTx = transactions.filter(t => t.status === "refunded");
      
      const totalRevenue = completedTx.reduce((sum, t) => sum + t.netAmount, 0);
      const avgValue = completedTx.length > 0 ? totalRevenue / completedTx.length : 0;
      
      // Revenue by provider
      const byProvider: Record<string, { revenue: number; count: number }> = {};
      completedTx.forEach(t => {
        if (!byProvider[t.provider]) {
          byProvider[t.provider] = { revenue: 0, count: 0 };
        }
        byProvider[t.provider].revenue += t.netAmount;
        byProvider[t.provider].count += 1;
      });
      
      // Revenue by month
      const byMonth: Record<string, { revenue: number; count: number }> = {};
      completedTx.forEach(t => {
        const month = t.createdAt ? new Date(t.createdAt).toISOString().slice(0, 7) : "unknown";
        if (!byMonth[month]) {
          byMonth[month] = { revenue: 0, count: 0 };
        }
        byMonth[month].revenue += t.netAmount;
        byMonth[month].count += 1;
      });
      
      res.json({
        totalRevenue,
        totalTransactions: transactions.length,
        successfulTransactions: completedTx.length,
        failedTransactions: failedTx.length,
        refundedTransactions: refundedTx.length,
        averageTransactionValue: Math.round(avgValue),
        activePaymentMethods: methods.filter(m => m.isActive).length,
        totalPaymentMethods: methods.length,
        revenueByProvider: Object.entries(byProvider).map(([provider, data]) => ({
          provider,
          ...data,
        })),
        revenueByMonth: Object.entries(byMonth)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([month, data]) => ({
            month,
            ...data,
          })),
      });
    } catch (error) {
      console.error("Payment analytics error:", error);
      res.status(500).json({ error: "فشل في جلب تحليلات الدفع / Failed to fetch payment analytics" });
    }
  });

  // ============ Authentication Methods Routes (Owner) ============

  // Get all auth methods
  app.get("/api/owner/auth-methods", requireAuth, requireOwner, async (req, res) => {
    try {
      const methods = await storage.getAuthMethods();
      res.json(methods);
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب طرق المصادقة / Failed to fetch auth methods" });
    }
  });

  // Get visible auth methods (public - for login page)
  app.get("/api/auth/methods", async (req, res) => {
    try {
      const methods = await storage.getVisibleAuthMethods();
      const publicMethods = methods.map(m => ({
        id: m.id,
        key: m.key,
        name: m.name,
        nameAr: m.nameAr,
        icon: m.icon,
        isDefault: m.isDefault,
      }));
      res.json(publicMethods);
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب طرق الدخول / Failed to fetch login methods" });
    }
  });

  // Create auth method
  app.post("/api/owner/auth-methods", requireAuth, requireOwner, async (req, res) => {
    try {
      const method = await storage.createAuthMethod(req.body);
      
      await storage.createAuditLog({
        userId: req.session.userId!,
        action: "auth_method_created",
        entityType: "auth_method",
        entityId: method.id,
        details: { key: method.key, name: method.name },
      });
      
      res.status(201).json(method);
    } catch (error) {
      console.error("Create auth method error:", error);
      res.status(500).json({ error: "فشل في إنشاء طريقة المصادقة / Failed to create auth method" });
    }
  });

  // Update auth method
  app.patch("/api/owner/auth-methods/:id", requireAuth, requireOwner, async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateAuthMethod(id, req.body);
      
      if (!updated) {
        return res.status(404).json({ error: "طريقة المصادقة غير موجودة / Auth method not found" });
      }
      
      await storage.createAuditLog({
        userId: req.session.userId!,
        action: "auth_method_updated",
        entityType: "auth_method",
        entityId: id,
        details: { changes: Object.keys(req.body) },
      });
      
      res.json(updated);
    } catch (error) {
      console.error("Update auth method error:", error);
      res.status(500).json({ error: "فشل في تحديث طريقة المصادقة / Failed to update auth method" });
    }
  });

  // Toggle auth method activation
  app.patch("/api/owner/auth-methods/:id/toggle", requireAuth, requireOwner, async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      
      const updated = await storage.toggleAuthMethod(id, isActive);
      
      if (!updated) {
        return res.status(404).json({ error: "طريقة المصادقة غير موجودة / Auth method not found" });
      }
      
      await storage.createAuditLog({
        userId: req.session.userId!,
        action: isActive ? "auth_method_activated" : "auth_method_deactivated",
        entityType: "auth_method",
        entityId: id,
        details: { key: updated.key },
      });
      
      res.json(updated);
    } catch (error: any) {
      console.error("Toggle auth method error:", error);
      if (error.message?.includes("default")) {
        return res.status(400).json({ error: "لا يمكن تعطيل طريقة المصادقة الافتراضية / Cannot deactivate default auth method" });
      }
      res.status(500).json({ error: "فشل في تحديث حالة طريقة المصادقة / Failed to toggle auth method" });
    }
  });

  // Toggle auth method visibility
  app.patch("/api/owner/auth-methods/:id/visibility", requireAuth, requireOwner, async (req, res) => {
    try {
      const { id } = req.params;
      const { isVisible } = req.body;
      
      const updated = await storage.toggleAuthMethodVisibility(id, isVisible);
      
      if (!updated) {
        return res.status(404).json({ error: "طريقة المصادقة غير موجودة / Auth method not found" });
      }
      
      await storage.createAuditLog({
        userId: req.session.userId!,
        action: isVisible ? "auth_method_shown" : "auth_method_hidden",
        entityType: "auth_method",
        entityId: id,
        details: { key: updated.key },
      });
      
      res.json(updated);
    } catch (error: any) {
      console.error("Toggle auth method visibility error:", error);
      if (error.message?.includes("default")) {
        return res.status(400).json({ error: "لا يمكن إخفاء طريقة المصادقة الافتراضية / Cannot hide default auth method" });
      }
      res.status(500).json({ error: "فشل في تحديث ظهور طريقة المصادقة / Failed to toggle auth method visibility" });
    }
  });

  // Delete auth method
  app.delete("/api/owner/auth-methods/:id", requireAuth, requireOwner, async (req, res) => {
    try {
      const { id } = req.params;
      const method = await storage.getAuthMethod(id);
      
      if (!method) {
        return res.status(404).json({ error: "طريقة المصادقة غير موجودة / Auth method not found" });
      }
      
      await storage.deleteAuthMethod(id);
      
      await storage.createAuditLog({
        userId: req.session.userId!,
        action: "auth_method_deleted",
        entityType: "auth_method",
        entityId: id,
        details: { key: method.key },
      });
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete auth method error:", error);
      if (error.message?.includes("default")) {
        return res.status(400).json({ error: "لا يمكن حذف طريقة المصادقة الافتراضية / Cannot delete default auth method" });
      }
      res.status(500).json({ error: "فشل في حذف طريقة المصادقة / Failed to delete auth method" });
    }
  });

  // Initialize default auth methods
  app.post("/api/owner/initialize-auth-methods", requireAuth, requireOwner, async (req, res) => {
    try {
      const existingMethods = await storage.getAuthMethods();
      if (existingMethods.length > 0) {
        return res.json({ message: "Auth methods already initialized", methods: existingMethods });
      }
      
      const defaultMethods = [
        {
          key: "email_password",
          name: "Email & Password",
          nameAr: "البريد الإلكتروني وكلمة المرور",
          description: "Traditional email and password login",
          descriptionAr: "تسجيل الدخول بالبريد الإلكتروني وكلمة المرور",
          icon: "Mail",
          isActive: true,
          isVisible: true,
          isDefault: true,
          isConfigured: true,
          sortOrder: 1,
        },
        {
          key: "otp_email",
          name: "Email OTP",
          nameAr: "رمز التحقق عبر البريد",
          description: "One-time password sent to email",
          descriptionAr: "رمز تحقق يُرسل للبريد الإلكتروني",
          icon: "KeyRound",
          isActive: true,
          isVisible: true,
          isDefault: false,
          isConfigured: true,
          sortOrder: 2,
        },
        {
          key: "google",
          name: "Google",
          nameAr: "جوجل",
          description: "Sign in with Google account",
          descriptionAr: "تسجيل الدخول بحساب جوجل",
          icon: "Chrome",
          isActive: false,
          isVisible: false,
          isDefault: false,
          isConfigured: false,
          sortOrder: 3,
        },
        {
          key: "facebook",
          name: "Facebook",
          nameAr: "فيسبوك",
          description: "Sign in with Facebook account",
          descriptionAr: "تسجيل الدخول بحساب فيسبوك",
          icon: "Facebook",
          isActive: false,
          isVisible: false,
          isDefault: false,
          isConfigured: false,
          sortOrder: 4,
        },
        {
          key: "twitter",
          name: "X (Twitter)",
          nameAr: "إكس (تويتر)",
          description: "Sign in with X/Twitter account",
          descriptionAr: "تسجيل الدخول بحساب إكس/تويتر",
          icon: "Twitter",
          isActive: false,
          isVisible: false,
          isDefault: false,
          isConfigured: false,
          sortOrder: 5,
        },
        {
          key: "github",
          name: "GitHub",
          nameAr: "جيت هاب",
          description: "Sign in with GitHub account",
          descriptionAr: "تسجيل الدخول بحساب جيت هاب",
          icon: "Github",
          isActive: false,
          isVisible: false,
          isDefault: false,
          isConfigured: false,
          sortOrder: 6,
        },
        {
          key: "apple",
          name: "Apple",
          nameAr: "أبل",
          description: "Sign in with Apple ID",
          descriptionAr: "تسجيل الدخول بحساب أبل",
          icon: "Apple",
          isActive: false,
          isVisible: false,
          isDefault: false,
          isConfigured: false,
          sortOrder: 7,
        },
        {
          key: "microsoft",
          name: "Microsoft",
          nameAr: "مايكروسوفت",
          description: "Sign in with Microsoft account",
          descriptionAr: "تسجيل الدخول بحساب مايكروسوفت",
          icon: "Monitor",
          isActive: false,
          isVisible: false,
          isDefault: false,
          isConfigured: false,
          sortOrder: 8,
        },
        {
          key: "magic_link",
          name: "Magic Link",
          nameAr: "رابط سحري",
          description: "Passwordless login via email link",
          descriptionAr: "تسجيل دخول بدون كلمة مرور عبر رابط بالبريد",
          icon: "Link",
          isActive: false,
          isVisible: false,
          isDefault: false,
          isConfigured: false,
          sortOrder: 9,
        },
        {
          key: "otp_sms",
          name: "SMS OTP",
          nameAr: "رمز التحقق عبر الجوال",
          description: "One-time password sent via SMS",
          descriptionAr: "رمز تحقق يُرسل عبر رسالة نصية",
          icon: "Smartphone",
          isActive: false,
          isVisible: false,
          isDefault: false,
          isConfigured: false,
          sortOrder: 10,
        },
      ];
      
      const createdMethods = [];
      for (const method of defaultMethods) {
        const created = await storage.createAuthMethod(method as any);
        createdMethods.push(created);
      }
      
      await storage.createAuditLog({
        userId: req.session.userId!,
        action: "auth_methods_initialized",
        entityType: "auth_method",
        details: { count: createdMethods.length },
      });
      
      res.status(201).json({ message: "Auth methods initialized", methods: createdMethods });
    } catch (error) {
      console.error("Initialize auth methods error:", error);
      res.status(500).json({ error: "فشل في تهيئة طرق المصادقة / Failed to initialize auth methods" });
    }
  });

  // ============ AI Models Routes (Owner) ============
  
  app.get("/api/owner/ai-models", requireAuth, requireOwner, async (req, res) => {
    try {
      const models = await storage.getAiModels();
      res.json(models);
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب نماذج الذكاء الاصطناعي / Failed to get AI models" });
    }
  });

  app.post("/api/owner/ai-models", requireAuth, requireOwner, async (req, res) => {
    try {
      const validatedData = insertAiModelSchema.parse(req.body);
      const model = await storage.createAiModel(validatedData);
      await storage.createAuditLog({
        userId: req.session.userId!,
        action: "ai_model_created",
        entityType: "ai_model",
        entityId: model.id,
        details: { modelId: model.modelId, name: model.name },
      });
      res.status(201).json(model);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "بيانات غير صالحة / Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "فشل في إنشاء نموذج الذكاء الاصطناعي / Failed to create AI model" });
    }
  });

  const toggleSchema = z.object({ isActive: z.boolean() });
  
  app.patch("/api/owner/ai-models/:id/toggle", requireAuth, requireOwner, async (req, res) => {
    try {
      const { isActive } = toggleSchema.parse(req.body);
      const model = await storage.toggleAiModel(req.params.id, isActive);
      if (!model) return res.status(404).json({ error: "النموذج غير موجود / Model not found" });
      await storage.createAuditLog({
        userId: req.session.userId!,
        action: isActive ? "ai_model_activated" : "ai_model_deactivated",
        entityType: "ai_model",
        entityId: model.id,
      });
      res.json(model);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "بيانات غير صالحة / Invalid data", details: error.errors });
      }
      res.status(400).json({ error: error.message || "فشل في تبديل حالة النموذج / Failed to toggle model" });
    }
  });

  app.patch("/api/owner/ai-models/:id/default", requireAuth, requireOwner, async (req, res) => {
    try {
      const model = await storage.setDefaultAiModel(req.params.id);
      if (!model) return res.status(404).json({ error: "النموذج غير موجود / Model not found" });
      await storage.createAuditLog({
        userId: req.session.userId!,
        action: "ai_model_set_default",
        entityType: "ai_model",
        entityId: model.id,
      });
      res.json(model);
    } catch (error) {
      res.status(500).json({ error: "فشل في تعيين النموذج الافتراضي / Failed to set default model" });
    }
  });

  app.delete("/api/owner/ai-models/:id", requireAuth, requireOwner, async (req, res) => {
    try {
      const model = await storage.getAiModel(req.params.id);
      if (!model) return res.status(404).json({ error: "النموذج غير موجود / Model not found" });
      const deleted = await storage.deleteAiModel(req.params.id);
      if (!deleted) return res.status(404).json({ error: "النموذج غير موجود / Model not found" });
      await storage.createAuditLog({
        userId: req.session.userId!,
        action: "ai_model_deleted",
        entityType: "ai_model",
        entityId: req.params.id,
        details: { modelId: model.modelId, name: model.name },
      });
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "فشل في حذف النموذج / Failed to delete model" });
    }
  });

  app.post("/api/owner/initialize-ai-models", requireAuth, requireOwner, async (req, res) => {
    try {
      const existingModels = await storage.getAiModels();
      if (existingModels.length > 0) {
        return res.status(400).json({ error: "AI models already initialized" });
      }
      const defaultModels = [
        {
          provider: "openai",
          modelId: "gpt-4o",
          name: "GPT-4o",
          nameAr: "جي بي تي-4 أو",
          description: "Most capable OpenAI model for complex tasks",
          descriptionAr: "نموذج OpenAI الأكثر قدرة للمهام المعقدة",
          capabilities: ["text", "code", "vision"],
          maxTokens: 128000,
          contextWindow: 128000,
          inputCostPer1M: 250,
          outputCostPer1M: 1000,
          isActive: true,
          isDefault: true,
          allowedPlans: ["pro", "enterprise", "sovereign", "owner"],
          sortOrder: 1,
        },
        {
          provider: "openai",
          modelId: "gpt-4o-mini",
          name: "GPT-4o Mini",
          nameAr: "جي بي تي-4 أو ميني",
          description: "Fast and cost-effective model",
          descriptionAr: "نموذج سريع وفعال من حيث التكلفة",
          capabilities: ["text", "code"],
          maxTokens: 128000,
          contextWindow: 128000,
          inputCostPer1M: 15,
          outputCostPer1M: 60,
          isActive: true,
          isDefault: false,
          allowedPlans: ["basic", "pro", "enterprise", "sovereign", "owner"],
          sortOrder: 2,
        },
        {
          provider: "anthropic",
          modelId: "claude-sonnet-4-20250514",
          name: "Claude Sonnet 4",
          nameAr: "كلود سونيت 4",
          description: "Anthropic's balanced model for most tasks",
          descriptionAr: "نموذج Anthropic المتوازن لمعظم المهام",
          capabilities: ["text", "code", "vision"],
          maxTokens: 8192,
          contextWindow: 200000,
          inputCostPer1M: 300,
          outputCostPer1M: 1500,
          isActive: true,
          isDefault: false,
          allowedPlans: ["pro", "enterprise", "sovereign", "owner"],
          sortOrder: 3,
        },
      ];
      const createdModels = [];
      for (const model of defaultModels) {
        const created = await storage.createAiModel(model as any);
        createdModels.push(created);
      }
      await storage.createAuditLog({
        userId: req.session.userId!,
        action: "ai_models_initialized",
        entityType: "ai_model",
        details: { count: createdModels.length },
      });
      res.status(201).json({ message: "AI models initialized", models: createdModels });
    } catch (error) {
      res.status(500).json({ error: "Failed to initialize AI models" });
    }
  });

  // ============ AI Usage Policies Routes (Owner) ============
  
  app.get("/api/owner/ai-policies", requireAuth, requireOwner, async (req, res) => {
    try {
      const policies = await storage.getAiUsagePolicies();
      res.json(policies);
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب سياسات الذكاء الاصطناعي / Failed to get AI policies" });
    }
  });

  app.patch("/api/owner/ai-policies/:id", requireAuth, requireOwner, async (req, res) => {
    try {
      const policy = await storage.updateAiUsagePolicy(req.params.id, req.body);
      if (!policy) return res.status(404).json({ error: "السياسة غير موجودة / Policy not found" });
      await storage.createAuditLog({
        userId: req.session.userId!,
        action: "ai_policy_updated",
        entityType: "ai_policy",
        entityId: policy.id,
      });
      res.json(policy);
    } catch (error) {
      res.status(500).json({ error: "فشل في تحديث السياسة / Failed to update policy" });
    }
  });

  app.post("/api/owner/initialize-ai-policies", requireAuth, requireOwner, async (req, res) => {
    try {
      const existingPolicies = await storage.getAiUsagePolicies();
      if (existingPolicies.length > 0) {
        return res.status(400).json({ error: "AI policies already initialized" });
      }
      const defaultPolicies = [
        { planRole: "free", name: "Free Plan Policy", nameAr: "سياسة الباقة المجانية", dailyRequestLimit: 5, monthlyRequestLimit: 50, maxTokensPerRequest: 1000, dailyCostLimit: 10, monthlyCostLimit: 50, allowedModels: ["gpt-4o-mini"], requestsPerMinute: 2, requestsPerHour: 20, isActive: true },
        { planRole: "basic", name: "Basic Plan Policy", nameAr: "سياسة الباقة الأساسية", dailyRequestLimit: 20, monthlyRequestLimit: 300, maxTokensPerRequest: 2000, dailyCostLimit: 50, monthlyCostLimit: 200, allowedModels: ["gpt-4o-mini", "gpt-4o"], requestsPerMinute: 5, requestsPerHour: 50, isActive: true },
        { planRole: "pro", name: "Pro Plan Policy", nameAr: "سياسة الباقة الاحترافية", dailyRequestLimit: 100, monthlyRequestLimit: 2000, maxTokensPerRequest: 4000, dailyCostLimit: 200, monthlyCostLimit: 1000, allowedModels: ["gpt-4o-mini", "gpt-4o", "claude-sonnet-4-20250514"], allowCodeGeneration: true, allowImageGeneration: true, requestsPerMinute: 15, requestsPerHour: 200, isActive: true },
        { planRole: "enterprise", name: "Enterprise Plan Policy", nameAr: "سياسة باقة المؤسسات", dailyRequestLimit: 500, monthlyRequestLimit: 10000, maxTokensPerRequest: 8000, dailyCostLimit: 1000, monthlyCostLimit: 5000, allowedModels: ["gpt-4o-mini", "gpt-4o", "claude-sonnet-4-20250514"], allowCodeGeneration: true, allowImageGeneration: true, allowVision: true, requestsPerMinute: 30, requestsPerHour: 500, isActive: true },
        { planRole: "sovereign", name: "Sovereign Plan Policy", nameAr: "سياسة الباقة السيادية", dailyRequestLimit: 1000, monthlyRequestLimit: 50000, maxTokensPerRequest: 16000, dailyCostLimit: 5000, monthlyCostLimit: 25000, allowedModels: ["gpt-4o-mini", "gpt-4o", "claude-sonnet-4-20250514"], allowCodeGeneration: true, allowImageGeneration: true, allowVision: true, requestsPerMinute: 60, requestsPerHour: 1000, isActive: true },
      ];
      const createdPolicies = [];
      for (const policy of defaultPolicies) {
        const created = await storage.createAiUsagePolicy(policy as any);
        createdPolicies.push(created);
      }
      res.status(201).json({ message: "AI policies initialized", policies: createdPolicies });
    } catch (error) {
      res.status(500).json({ error: "Failed to initialize AI policies" });
    }
  });

  // ============ Feature Flags Routes (Owner) ============
  
  app.get("/api/owner/feature-flags", requireAuth, requireOwner, async (req, res) => {
    try {
      const flags = await storage.getFeatureFlags();
      res.json(flags);
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب أعلام الميزات / Failed to get feature flags" });
    }
  });

  app.post("/api/owner/feature-flags", requireAuth, requireOwner, async (req, res) => {
    try {
      const validatedData = insertFeatureFlagSchema.parse({
        ...req.body,
        createdBy: req.session.userId!,
      });
      const flag = await storage.createFeatureFlag(validatedData);
      await storage.createAuditLog({
        userId: req.session.userId!,
        action: "feature_flag_created",
        entityType: "feature_flag",
        entityId: flag.id,
        details: { key: flag.key, name: flag.name },
      });
      res.status(201).json(flag);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "بيانات غير صالحة / Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "فشل في إنشاء علم الميزة / Failed to create feature flag" });
    }
  });

  app.patch("/api/owner/feature-flags/:id", requireAuth, requireOwner, async (req, res) => {
    try {
      const flag = await storage.updateFeatureFlag(req.params.id, req.body);
      if (!flag) return res.status(404).json({ error: "العلم غير موجود / Flag not found" });
      await storage.createAuditLog({
        userId: req.session.userId!,
        action: "feature_flag_updated",
        entityType: "feature_flag",
        entityId: flag.id,
      });
      res.json(flag);
    } catch (error) {
      res.status(500).json({ error: "فشل في تحديث علم الميزة / Failed to update feature flag" });
    }
  });

  const toggleEnabledSchema = z.object({ isEnabled: z.boolean() });
  
  app.patch("/api/owner/feature-flags/:id/toggle", requireAuth, requireOwner, async (req, res) => {
    try {
      const { isEnabled } = toggleEnabledSchema.parse(req.body);
      const flag = await storage.toggleFeatureFlag(req.params.id, isEnabled);
      if (!flag) return res.status(404).json({ error: "العلم غير موجود / Flag not found" });
      await storage.createAuditLog({
        userId: req.session.userId!,
        action: isEnabled ? "feature_flag_enabled" : "feature_flag_disabled",
        entityType: "feature_flag",
        entityId: flag.id,
      });
      res.json(flag);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "بيانات غير صالحة / Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "فشل في تبديل علم الميزة / Failed to toggle feature flag" });
    }
  });

  app.delete("/api/owner/feature-flags/:id", requireAuth, requireOwner, async (req, res) => {
    try {
      const flag = await storage.getFeatureFlag(req.params.id);
      if (!flag) return res.status(404).json({ error: "العلم غير موجود / Flag not found" });
      const deleted = await storage.deleteFeatureFlag(req.params.id);
      if (!deleted) return res.status(404).json({ error: "العلم غير موجود / Flag not found" });
      await storage.createAuditLog({
        userId: req.session.userId!,
        action: "feature_flag_deleted",
        entityType: "feature_flag",
        entityId: req.params.id,
        details: { key: flag.key, name: flag.name },
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "فشل في حذف علم الميزة / Failed to delete feature flag" });
    }
  });

  app.post("/api/owner/initialize-feature-flags", requireAuth, requireOwner, async (req, res) => {
    try {
      const existingFlags = await storage.getFeatureFlags();
      if (existingFlags.length > 0) {
        return res.status(400).json({ error: "Feature flags already initialized" });
      }
      const defaultFlags = [
        { key: "ai_chatbot_builder", name: "AI Chatbot Builder", nameAr: "منشئ روبوت الدردشة", description: "Enable chatbot creation feature", descriptionAr: "تفعيل ميزة إنشاء روبوت الدردشة", isEnabled: true, rolloutPercentage: 100, allowedPlans: ["pro", "enterprise", "sovereign", "owner"], category: "feature" },
        { key: "seo_optimizer", name: "SEO Optimizer", nameAr: "محسن SEO", description: "Enable SEO optimization tools", descriptionAr: "تفعيل أدوات تحسين محركات البحث", isEnabled: true, rolloutPercentage: 100, allowedPlans: ["basic", "pro", "enterprise", "sovereign", "owner"], category: "feature" },
        { key: "white_label", name: "White Label", nameAr: "العلامة البيضاء", description: "Enable white-label customization", descriptionAr: "تفعيل تخصيص العلامة البيضاء", isEnabled: true, rolloutPercentage: 100, allowedPlans: ["enterprise", "sovereign", "owner"], category: "feature" },
        { key: "advanced_analytics", name: "Advanced Analytics", nameAr: "التحليلات المتقدمة", description: "Enable advanced analytics dashboard", descriptionAr: "تفعيل لوحة التحليلات المتقدمة", isEnabled: true, rolloutPercentage: 100, allowedPlans: ["pro", "enterprise", "sovereign", "owner"], category: "feature" },
        { key: "ai_image_generation", name: "AI Image Generation", nameAr: "توليد الصور بالذكاء الاصطناعي", description: "Enable AI image generation", descriptionAr: "تفعيل توليد الصور بالذكاء الاصطناعي", isEnabled: false, rolloutPercentage: 0, allowedPlans: ["enterprise", "sovereign", "owner"], category: "experiment" },
      ];
      const createdFlags = [];
      for (const flag of defaultFlags) {
        const created = await storage.createFeatureFlag({ ...flag, createdBy: req.session.userId } as any);
        createdFlags.push(created);
      }
      res.status(201).json({ message: "Feature flags initialized", flags: createdFlags });
    } catch (error) {
      res.status(500).json({ error: "Failed to initialize feature flags" });
    }
  });

  // ============ System Announcements Routes (Owner) ============
  
  app.get("/api/owner/announcements", requireAuth, requireOwner, async (req, res) => {
    try {
      const announcements = await storage.getSystemAnnouncements();
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب الإعلانات / Failed to get announcements" });
    }
  });

  app.get("/api/announcements/active", async (req, res) => {
    try {
      const announcements = await storage.getActiveSystemAnnouncements();
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب الإعلانات / Failed to get announcements" });
    }
  });

  app.post("/api/owner/announcements", requireAuth, requireOwner, async (req, res) => {
    try {
      const validatedData = insertSystemAnnouncementSchema.parse({
        ...req.body,
        createdBy: req.session.userId!,
      });
      const announcement = await storage.createSystemAnnouncement(validatedData);
      await storage.createAuditLog({
        userId: req.session.userId!,
        action: "announcement_created",
        entityType: "announcement",
        entityId: announcement.id,
        details: { title: announcement.title, type: announcement.type },
      });
      res.status(201).json(announcement);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "بيانات غير صالحة / Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "فشل في إنشاء الإعلان / Failed to create announcement" });
    }
  });

  app.patch("/api/owner/announcements/:id", requireAuth, requireOwner, async (req, res) => {
    try {
      const announcement = await storage.updateSystemAnnouncement(req.params.id, req.body);
      if (!announcement) return res.status(404).json({ error: "الإعلان غير موجود / Announcement not found" });
      await storage.createAuditLog({
        userId: req.session.userId!,
        action: "announcement_updated",
        entityType: "announcement",
        entityId: announcement.id,
      });
      res.json(announcement);
    } catch (error) {
      res.status(500).json({ error: "فشل في تحديث الإعلان / Failed to update announcement" });
    }
  });

  app.delete("/api/owner/announcements/:id", requireAuth, requireOwner, async (req, res) => {
    try {
      const announcement = await storage.getSystemAnnouncement(req.params.id);
      if (!announcement) return res.status(404).json({ error: "الإعلان غير موجود / Announcement not found" });
      const deleted = await storage.deleteSystemAnnouncement(req.params.id);
      if (!deleted) return res.status(404).json({ error: "الإعلان غير موجود / Announcement not found" });
      await storage.createAuditLog({
        userId: req.session.userId!,
        action: "announcement_deleted",
        entityType: "announcement",
        entityId: req.params.id,
        details: { title: announcement.title },
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "فشل في حذف الإعلان / Failed to delete announcement" });
    }
  });

  // ============ Admin Roles Routes (Owner) ============
  
  app.get("/api/owner/admin-roles", requireAuth, requireOwner, async (req, res) => {
    try {
      const roles = await storage.getAdminRoles();
      res.json(roles);
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب أدوار المسؤولين / Failed to get admin roles" });
    }
  });

  app.post("/api/owner/admin-roles", requireAuth, requireOwner, async (req, res) => {
    try {
      const validatedData = insertAdminRoleSchema.parse(req.body);
      const role = await storage.createAdminRole(validatedData);
      await storage.createAuditLog({
        userId: req.session.userId!,
        action: "admin_role_created",
        entityType: "admin_role",
        entityId: role.id,
        details: { key: role.key, name: role.name },
      });
      res.status(201).json(role);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "بيانات غير صالحة / Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "فشل في إنشاء الدور / Failed to create admin role" });
    }
  });

  app.patch("/api/owner/admin-roles/:id", requireAuth, requireOwner, async (req, res) => {
    try {
      const role = await storage.updateAdminRole(req.params.id, req.body);
      if (!role) return res.status(404).json({ error: "الدور غير موجود / Role not found" });
      await storage.createAuditLog({
        userId: req.session.userId!,
        action: "admin_role_updated",
        entityType: "admin_role",
        entityId: role.id,
      });
      res.json(role);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "فشل في تحديث الدور / Failed to update role" });
    }
  });

  app.delete("/api/owner/admin-roles/:id", requireAuth, requireOwner, async (req, res) => {
    try {
      const role = await storage.getAdminRole(req.params.id);
      if (!role) return res.status(404).json({ error: "الدور غير موجود / Role not found" });
      const deleted = await storage.deleteAdminRole(req.params.id);
      if (!deleted) return res.status(404).json({ error: "الدور غير موجود / Role not found" });
      await storage.createAuditLog({
        userId: req.session.userId!,
        action: "admin_role_deleted",
        entityType: "admin_role",
        entityId: req.params.id,
        details: { key: role.key, name: role.name },
      });
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "فشل في حذف الدور / Failed to delete role" });
    }
  });

  app.post("/api/owner/initialize-admin-roles", requireAuth, requireOwner, async (req, res) => {
    try {
      const existingRoles = await storage.getAdminRoles();
      if (existingRoles.length > 0) {
        return res.status(400).json({ error: "Admin roles already initialized" });
      }
      const defaultRoles = [
        { key: "super_admin", name: "Super Admin", nameAr: "مدير أعلى", description: "Full platform access", descriptionAr: "وصول كامل للمنصة", permissions: ["owner:full_access"], level: 100, isSystem: true, isActive: true },
        { key: "platform_admin", name: "Platform Admin", nameAr: "مدير المنصة", description: "Platform operations and user management", descriptionAr: "عمليات المنصة وإدارة المستخدمين", permissions: ["users:read", "users:update", "users:ban", "subscriptions:read", "subscriptions:update", "projects:read", "audit:read"], level: 80, isSystem: true, isActive: true },
        { key: "content_admin", name: "Content Admin", nameAr: "مدير المحتوى", description: "Templates and content management", descriptionAr: "إدارة القوالب والمحتوى", permissions: ["projects:read", "announcements:read", "announcements:create", "announcements:update"], level: 60, isSystem: true, isActive: true },
        { key: "support_admin", name: "Support Admin", nameAr: "مدير الدعم", description: "User support and issue resolution", descriptionAr: "دعم المستخدمين وحل المشكلات", permissions: ["users:read", "projects:read", "subscriptions:read", "audit:read"], level: 40, isSystem: true, isActive: true },
        { key: "billing_admin", name: "Billing Admin", nameAr: "مدير الفواتير", description: "Payment and subscription management", descriptionAr: "إدارة المدفوعات والاشتراكات", permissions: ["payments:read", "payments:refund", "subscriptions:read", "subscriptions:update"], level: 50, isSystem: true, isActive: true },
      ];
      const createdRoles = [];
      for (const role of defaultRoles) {
        const created = await storage.createAdminRole(role as any);
        createdRoles.push(created);
      }
      res.status(201).json({ message: "Admin roles initialized", roles: createdRoles });
    } catch (error) {
      res.status(500).json({ error: "Failed to initialize admin roles" });
    }
  });

  // ============ Executive Dashboard Summary (Owner) ============
  
  app.get("/api/owner/executive-summary", requireAuth, requireOwner, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const activeEmergencyControls = await storage.getActiveEmergencyControls();
      const announcements = await storage.getActiveSystemAnnouncements();
      const aiCostSummary = await storage.getAiCostSummary("2024-01-01", "2025-12-31");
      const ownerSettingsData = await storage.getOwnerSettings(req.session.userId!);
      
      const totalUsers = users.length;
      const activeUsers = users.filter(u => u.isActive).length;
      const usersByPlan: Record<string, number> = {};
      users.forEach(u => {
        usersByPlan[u.role] = (usersByPlan[u.role] || 0) + 1;
      });
      
      const summary = {
        healthScore: activeEmergencyControls.length > 0 ? 60 : 95,
        criticalAlerts: activeEmergencyControls.length,
        totalUsers,
        activeUsersToday: Math.floor(activeUsers * 0.3),
        newUsersThisWeek: Math.floor(totalUsers * 0.05),
        churnRate: 2.5,
        mrr: 15000 * 100,
        arr: 180000 * 100,
        revenueGrowth: 12.5,
        avgRevenuePerUser: Math.floor((15000 / totalUsers) * 100) || 0,
        aiRequestsToday: 250,
        aiCostToday: aiCostSummary.totalCost,
        aiEmergencyActive: activeEmergencyControls.some(c => c.type === "ai_suspension"),
        maintenanceMode: ownerSettingsData?.maintenanceMode ?? false,
        activeEmergencyControls: activeEmergencyControls.length,
        systemAnnouncements: announcements.length,
        usersByPlan,
      };
      
      res.json(summary);
    } catch (error) {
      console.error("Executive summary error:", error);
      res.status(500).json({ error: "Failed to get executive summary" });
    }
  });

  // ============ AI Cost Analytics (Owner) ============
  
  app.get("/api/owner/ai-analytics", requireAuth, requireOwner, async (req, res) => {
    try {
      const summary = await storage.getAiCostSummary("2024-01-01", "2025-12-31");
      const models = await storage.getAiModels();
      const policies = await storage.getAiUsagePolicies();
      
      res.json({
        ...summary,
        totalModels: models.length,
        activeModels: models.filter(m => m.isActive).length,
        totalPolicies: policies.length,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get AI analytics" });
    }
  });

  // ============ Analytics Routes ============

  // Get analytics for user
  app.get("/api/analytics", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const projects = await storage.getProjectsByUser(userId);
      
      // Return analytics data (mock for now, will be enhanced)
      res.json({
        overview: {
          totalViews: Math.floor(Math.random() * 10000) + 1000,
          uniqueVisitors: Math.floor(Math.random() * 3000) + 500,
          avgSessionDuration: `${Math.floor(Math.random() * 5) + 1}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
          bounceRate: Math.floor(Math.random() * 40) + 20,
          viewsChange: Math.floor(Math.random() * 20) - 5,
          visitorsChange: Math.floor(Math.random() * 15) - 3,
        },
        projects: projects.map(p => ({
          id: p.id,
          name: p.name,
          views: Math.floor(Math.random() * 5000) + 100,
          visitors: Math.floor(Math.random() * 1000) + 50,
          engagement: Math.floor(Math.random() * 30) + 50,
        })),
        aiUsage: {
          totalGenerations: Math.floor(Math.random() * 200) + 20,
          tokensUsed: Math.floor(Math.random() * 300000) + 50000,
          avgResponseTime: `${(Math.random() * 3 + 1).toFixed(1)}s`,
          successRate: 95 + Math.floor(Math.random() * 5),
        },
        topCountries: [
          { country: "Saudi Arabia", visitors: 1245, percentage: 36.4 },
          { country: "UAE", visitors: 876, percentage: 25.6 },
          { country: "Egypt", visitors: 543, percentage: 15.9 },
          { country: "United States", visitors: 421, percentage: 12.3 },
          { country: "United Kingdom", visitors: 336, percentage: 9.8 },
        ],
      });
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب التحليلات" });
    }
  });

  // ==================== SOVEREIGN AI ASSISTANTS ROUTES ====================

  // ============ Sovereign Assistants Routes (Owner) ============
  
  app.get("/api/owner/sovereign-assistants", requireAuth, requireOwner, async (req, res) => {
    try {
      const assistants = await storage.getSovereignAssistants();
      res.json(assistants);
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب المساعدين السياديين / Failed to get sovereign assistants" });
    }
  });

  app.get("/api/owner/sovereign-assistants/:id", requireAuth, requireOwner, async (req, res) => {
    try {
      const assistant = await storage.getSovereignAssistant(req.params.id);
      if (!assistant) return res.status(404).json({ error: "المساعد غير موجود / Assistant not found" });
      res.json(assistant);
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب المساعد / Failed to get assistant" });
    }
  });

  app.post("/api/owner/sovereign-assistants", requireAuth, requireOwner, async (req, res) => {
    try {
      const validatedData = insertSovereignAssistantSchema.parse(req.body);
      const assistant = await storage.createSovereignAssistant(validatedData);
      await storage.createAuditLog({
        userId: req.session.userId!,
        action: "sovereign_assistant_created",
        entityType: "sovereign_assistant",
        entityId: assistant.id,
      });
      res.status(201).json(assistant);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "بيانات غير صالحة / Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "فشل في إنشاء المساعد / Failed to create assistant" });
    }
  });

  app.patch("/api/owner/sovereign-assistants/:id", requireAuth, requireOwner, async (req, res) => {
    try {
      const assistant = await storage.updateSovereignAssistant(req.params.id, req.body);
      if (!assistant) return res.status(404).json({ error: "المساعد غير موجود / Assistant not found" });
      await storage.createAuditLog({
        userId: req.session.userId!,
        action: "sovereign_assistant_updated",
        entityType: "sovereign_assistant",
        entityId: assistant.id,
      });
      res.json(assistant);
    } catch (error) {
      res.status(500).json({ error: "فشل في تحديث المساعد / Failed to update assistant" });
    }
  });

  const toggleActiveSchema = z.object({ isActive: z.boolean() });
  app.patch("/api/owner/sovereign-assistants/:id/toggle", requireAuth, requireOwner, async (req, res) => {
    try {
      const { isActive } = toggleActiveSchema.parse(req.body);
      const assistant = await storage.toggleSovereignAssistant(req.params.id, isActive);
      if (!assistant) return res.status(404).json({ error: "المساعد غير موجود / Assistant not found" });
      await storage.createAuditLog({
        userId: req.session.userId!,
        action: isActive ? "sovereign_assistant_activated" : "sovereign_assistant_deactivated",
        entityType: "sovereign_assistant",
        entityId: assistant.id,
      });
      res.json(assistant);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "بيانات غير صالحة / Invalid data" });
      }
      res.status(500).json({ error: "فشل في تغيير حالة المساعد / Failed to toggle assistant" });
    }
  });

  const toggleAutonomySchema = z.object({ isAutonomous: z.boolean() });
  app.patch("/api/owner/sovereign-assistants/:id/autonomy", requireAuth, requireOwner, async (req, res) => {
    try {
      const { isAutonomous } = toggleAutonomySchema.parse(req.body);
      const assistant = await storage.toggleSovereignAutonomy(req.params.id, isAutonomous);
      if (!assistant) return res.status(404).json({ error: "المساعد غير موجود / Assistant not found" });
      await storage.createAuditLog({
        userId: req.session.userId!,
        action: isAutonomous ? "sovereign_autonomy_enabled" : "sovereign_autonomy_disabled",
        entityType: "sovereign_assistant",
        entityId: assistant.id,
      });
      res.json(assistant);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "بيانات غير صالحة / Invalid data" });
      }
      res.status(500).json({ error: "فشل في تغيير وضع الاستقلالية / Failed to toggle autonomy" });
    }
  });

  // Initialize default sovereign assistants
  app.post("/api/owner/initialize-sovereign-assistants", requireAuth, requireOwner, async (req, res) => {
    try {
      const existingAssistants = await storage.getSovereignAssistants();
      if (existingAssistants.length > 0) {
        return res.status(400).json({ error: "المساعدون موجودون بالفعل / Assistants already exist" });
      }

      const defaultAssistants = [
        {
          type: "ai_governor",
          name: "AI Governor",
          nameAr: "حاكم الذكاء الاصطناعي",
          description: "Manages AI lifecycle, costs, and policy enforcement across the platform",
          descriptionAr: "يدير دورة حياة الذكاء الاصطناعي والتكاليف وتطبيق السياسات عبر المنصة",
          avatar: "brain",
          capabilities: ["Adjust AI model configurations", "Enforce usage policies", "Manage compute/cost limits", "Monitor AI performance", "Apply emergency controls"],
          capabilitiesAr: ["ضبط تكوينات نماذج AI", "تطبيق سياسات الاستخدام", "إدارة حدود الحوسبة والتكلفة", "مراقبة أداء AI", "تطبيق ضوابط الطوارئ"],
          scopeOfAuthority: ["ai_models", "ai_policies", "ai_cost_tracking", "emergency_controls"],
          constraints: ["Cannot delete user data", "Cannot modify billing without approval", "Max cost change: 50% per action"],
          systemPrompt: "You are the AI Governor, responsible for managing all AI operations on the INFERA platform. Your primary objectives are cost optimization, policy enforcement, and ensuring AI systems operate within defined boundaries. Always prioritize platform stability and user safety.",
          model: "claude-sonnet-4-20250514",
          temperature: 30,
          maxTokens: 8000,
          isActive: true,
          isAutonomous: false,
        },
        {
          type: "platform_architect",
          name: "Platform Architect",
          nameAr: "مهندس المنصة",
          description: "Oversees structural integrity and implements infrastructure improvements",
          descriptionAr: "يشرف على السلامة الهيكلية وينفذ تحسينات البنية التحتية",
          avatar: "building",
          capabilities: ["Deploy feature flags", "Manage resource allocation", "Implement system improvements", "Configure platform settings", "Optimize performance"],
          capabilitiesAr: ["نشر أعلام الميزات", "إدارة تخصيص الموارد", "تنفيذ تحسينات النظام", "تكوين إعدادات المنصة", "تحسين الأداء"],
          scopeOfAuthority: ["feature_flags", "platform_settings", "system_configuration"],
          constraints: ["Cannot modify security policies", "Cannot access user data", "Changes require rollback plan"],
          systemPrompt: "You are the Platform Architect, responsible for maintaining and improving the INFERA platform infrastructure. Focus on stability, scalability, and performance optimization. All changes must be reversible and thoroughly planned.",
          model: "claude-sonnet-4-20250514",
          temperature: 40,
          maxTokens: 8000,
          isActive: true,
          isAutonomous: false,
        },
        {
          type: "operations_commander",
          name: "Operations Commander",
          nameAr: "قائد العمليات",
          description: "Handles emergencies, stability control, and high-risk actions",
          descriptionAr: "يتعامل مع حالات الطوارئ والتحكم في الاستقرار والإجراءات عالية المخاطر",
          avatar: "shield",
          capabilities: ["Activate emergency controls", "Execute system rollbacks", "Manage maintenance mode", "Coordinate crisis response", "Override failing systems"],
          capabilitiesAr: ["تفعيل ضوابط الطوارئ", "تنفيذ التراجعات", "إدارة وضع الصيانة", "تنسيق استجابة الأزمات", "تجاوز الأنظمة الفاشلة"],
          scopeOfAuthority: ["emergency_controls", "maintenance_mode", "system_rollbacks", "crisis_management"],
          constraints: ["All actions logged immediately", "Owner notification required", "Time-limited emergency powers"],
          systemPrompt: "You are the Operations Commander, the first responder for platform emergencies. Your role is to maintain platform stability and execute crisis response protocols. Speed and decisiveness are critical, but all actions must be logged and reversible.",
          model: "claude-sonnet-4-20250514",
          temperature: 20,
          maxTokens: 8000,
          isActive: true,
          isAutonomous: false,
        },
        {
          type: "security_guardian",
          name: "Security & Compliance Guardian",
          nameAr: "حارس الأمان والامتثال",
          description: "Continuously detects anomalies and threats, autonomously isolates breaches, and enforces security and regulatory compliance in real time",
          descriptionAr: "يكتشف الانحرافات والتهديدات باستمرار، ويعزل الاختراقات تلقائياً، ويفرض الامتثال الأمني والتنظيمي في الوقت الفعلي",
          avatar: "lock",
          capabilities: ["Continuous anomaly detection", "Autonomous breach isolation", "Real-time compliance enforcement", "Threat response automation", "Security incident documentation"],
          capabilitiesAr: ["الكشف المستمر عن الانحرافات", "عزل الاختراقات تلقائياً", "فرض الامتثال في الوقت الفعلي", "أتمتة الاستجابة للتهديدات", "توثيق حوادث الأمان"],
          scopeOfAuthority: ["security_policies", "audit_logs", "threat_detection", "compliance_rules", "breach_isolation"],
          constraints: ["Cannot access encrypted data", "Cannot modify user credentials", "Escalation required for account suspension", "Owner notification on breach"],
          systemPrompt: "You are the Security & Compliance Guardian, the vigilant protector of the INFERA platform. Continuously monitor for anomalies, threats, and compliance violations. Autonomously isolate breaches when detected, enforce security policies in real time, and ensure regulatory compliance. Document all incidents thoroughly and prioritize user privacy and data protection.",
          model: "claude-sonnet-4-20250514",
          temperature: 20,
          maxTokens: 8000,
          isActive: true,
          isAutonomous: false,
        },
        {
          type: "growth_strategist",
          name: "Business & Growth Strategist",
          nameAr: "استراتيجي الأعمال والنمو",
          description: "Analyzes revenue, churn, conversion, and engagement metrics, executing owner-approved optimizations to pricing models, subscriptions, and growth mechanisms",
          descriptionAr: "يحلل مقاييس الإيرادات والتسرب والتحويل والمشاركة، وينفذ التحسينات المعتمدة من المالك على نماذج التسعير والاشتراكات وآليات النمو",
          avatar: "trending-up",
          capabilities: ["Revenue analysis", "Churn prediction", "Conversion optimization", "Engagement metrics tracking", "Subscription flow management", "Growth mechanism execution"],
          capabilitiesAr: ["تحليل الإيرادات", "التنبؤ بالتسرب", "تحسين التحويل", "تتبع مقاييس المشاركة", "إدارة تدفقات الاشتراك", "تنفيذ آليات النمو"],
          scopeOfAuthority: ["pricing_rules", "user_segmentation", "subscription_flows", "retention_campaigns", "engagement_optimization"],
          constraints: ["Cannot modify individual payments", "Price changes limited to 25%", "A/B tests require owner approval", "Cannot access payment credentials"],
          systemPrompt: "You are the Business & Growth Strategist, responsible for driving sustainable growth for INFERA. Analyze revenue, churn, conversion, and engagement metrics continuously. Execute owner-approved optimizations to pricing models, subscriptions, and growth mechanisms. Focus on long-term value creation and sustainable business growth.",
          model: "claude-sonnet-4-20250514",
          temperature: 45,
          maxTokens: 8000,
          isActive: true,
          isAutonomous: false,
        },
      ];

      const createdAssistants = [];
      for (const assistantData of defaultAssistants) {
        const assistant = await storage.createSovereignAssistant(assistantData as any);
        createdAssistants.push(assistant);
      }

      await storage.createAuditLog({
        userId: req.session.userId!,
        action: "sovereign_assistants_initialized",
        entityType: "sovereign_assistant",
        entityId: "all",
      });

      res.status(201).json({ 
        message: "تم تهيئة المساعدين السياديين بنجاح / Sovereign assistants initialized successfully",
        assistants: createdAssistants 
      });
    } catch (error) {
      console.error("Initialize sovereign assistants error:", error);
      res.status(500).json({ error: "فشل في تهيئة المساعدين / Failed to initialize assistants" });
    }
  });

  // ============ Sovereign Commands Routes (Owner) ============
  
  app.get("/api/owner/sovereign-commands", requireAuth, requireOwner, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const commands = await storage.getSovereignCommands(limit);
      res.json(commands);
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب الأوامر / Failed to get commands" });
    }
  });

  app.get("/api/owner/sovereign-commands/:id", requireAuth, requireOwner, async (req, res) => {
    try {
      const command = await storage.getSovereignCommand(req.params.id);
      if (!command) return res.status(404).json({ error: "الأمر غير موجود / Command not found" });
      
      const actions = await storage.getSovereignActionsByCommand(req.params.id);
      const logs = await storage.getSovereignActionLogsByCommand(req.params.id);
      
      res.json({ ...command, actions, logs });
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب الأمر / Failed to get command" });
    }
  });

  app.post("/api/owner/sovereign-commands", requireAuth, requireOwner, async (req, res) => {
    try {
      const validatedData = insertSovereignCommandSchema.parse({
        ...req.body,
        issuedBy: req.session.userId!,
        status: "pending",
      });
      
      const command = await storage.createSovereignCommand(validatedData);
      
      await storage.createSovereignActionLog({
        commandId: command.id,
        assistantId: command.assistantId,
        actorId: req.session.userId!,
        actorType: "owner",
        eventType: "command_issued",
        eventDescription: `Command issued: ${command.directive}`,
        eventDescriptionAr: `أمر صادر: ${command.directive}`,
      });
      
      await storage.createAuditLog({
        userId: req.session.userId!,
        action: "sovereign_command_issued",
        entityType: "sovereign_command",
        entityId: command.id,
      });
      
      res.status(201).json(command);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "بيانات غير صالحة / Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "فشل في إنشاء الأمر / Failed to create command" });
    }
  });

  app.patch("/api/owner/sovereign-commands/:id/approve", requireAuth, requireOwner, async (req, res) => {
    try {
      const command = await storage.approveSovereignCommand(req.params.id, req.session.userId!);
      if (!command) return res.status(404).json({ error: "الأمر غير موجود / Command not found" });
      
      await storage.createSovereignActionLog({
        commandId: command.id,
        assistantId: command.assistantId,
        actorId: req.session.userId!,
        actorType: "owner",
        eventType: "command_approved",
        eventDescription: "Command approved and execution started",
        eventDescriptionAr: "تمت الموافقة على الأمر وبدء التنفيذ",
      });
      
      await storage.createAuditLog({
        userId: req.session.userId!,
        action: "sovereign_command_approved",
        entityType: "sovereign_command",
        entityId: command.id,
      });
      
      res.json(command);
    } catch (error) {
      res.status(500).json({ error: "فشل في الموافقة على الأمر / Failed to approve command" });
    }
  });

  app.patch("/api/owner/sovereign-commands/:id/cancel", requireAuth, requireOwner, async (req, res) => {
    try {
      const command = await storage.cancelSovereignCommand(req.params.id);
      if (!command) return res.status(404).json({ error: "الأمر غير موجود / Command not found" });
      
      await storage.createSovereignActionLog({
        commandId: command.id,
        assistantId: command.assistantId,
        actorId: req.session.userId!,
        actorType: "owner",
        eventType: "command_cancelled",
        eventDescription: "Command cancelled by owner",
        eventDescriptionAr: "تم إلغاء الأمر من قبل المالك",
      });
      
      await storage.createAuditLog({
        userId: req.session.userId!,
        action: "sovereign_command_cancelled",
        entityType: "sovereign_command",
        entityId: command.id,
      });
      
      res.json(command);
    } catch (error) {
      res.status(500).json({ error: "فشل في إلغاء الأمر / Failed to cancel command" });
    }
  });

  app.patch("/api/owner/sovereign-commands/:id/rollback", requireAuth, requireOwner, async (req, res) => {
    try {
      const command = await storage.rollbackSovereignCommand(req.params.id, req.session.userId!);
      if (!command) return res.status(404).json({ error: "الأمر غير موجود / Command not found" });
      
      await storage.createSovereignActionLog({
        commandId: command.id,
        assistantId: command.assistantId,
        actorId: req.session.userId!,
        actorType: "owner",
        eventType: "rollback_initiated",
        eventDescription: "Command rollback initiated by owner",
        eventDescriptionAr: "تم بدء التراجع عن الأمر من قبل المالك",
      });
      
      await storage.createAuditLog({
        userId: req.session.userId!,
        action: "sovereign_command_rolled_back",
        entityType: "sovereign_command",
        entityId: command.id,
      });
      
      res.json(command);
    } catch (error) {
      res.status(500).json({ error: "فشل في التراجع عن الأمر / Failed to rollback command" });
    }
  });

  // ============ Sovereign Action Logs Routes (Owner) ============
  
  app.get("/api/owner/sovereign-logs", requireAuth, requireOwner, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = await storage.getSovereignActionLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب السجلات / Failed to get logs" });
    }
  });

  app.get("/api/owner/sovereign-logs/assistant/:assistantId", requireAuth, requireOwner, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = await storage.getSovereignActionLogsByAssistant(req.params.assistantId, limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب سجلات المساعد / Failed to get assistant logs" });
    }
  });

  // ============ Sovereign Policies Routes (Owner) ============
  
  app.get("/api/owner/sovereign-policies", requireAuth, requireOwner, async (req, res) => {
    try {
      const policies = await storage.getSovereignPolicies();
      res.json(policies);
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب السياسات / Failed to get policies" });
    }
  });

  app.post("/api/owner/sovereign-policies", requireAuth, requireOwner, async (req, res) => {
    try {
      const validatedData = insertSovereignPolicySchema.parse({
        ...req.body,
        createdBy: req.session.userId!,
      });
      const policy = await storage.createSovereignPolicy(validatedData);
      
      await storage.createAuditLog({
        userId: req.session.userId!,
        action: "sovereign_policy_created",
        entityType: "sovereign_policy",
        entityId: policy.id,
      });
      
      res.status(201).json(policy);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "بيانات غير صالحة / Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "فشل في إنشاء السياسة / Failed to create policy" });
    }
  });

  app.patch("/api/owner/sovereign-policies/:id", requireAuth, requireOwner, async (req, res) => {
    try {
      const policy = await storage.updateSovereignPolicy(req.params.id, req.body);
      if (!policy) return res.status(404).json({ error: "السياسة غير موجودة / Policy not found" });
      
      await storage.createAuditLog({
        userId: req.session.userId!,
        action: "sovereign_policy_updated",
        entityType: "sovereign_policy",
        entityId: policy.id,
      });
      
      res.json(policy);
    } catch (error) {
      res.status(500).json({ error: "فشل في تحديث السياسة / Failed to update policy" });
    }
  });

  app.patch("/api/owner/sovereign-policies/:id/toggle", requireAuth, requireOwner, async (req, res) => {
    try {
      const { isActive } = toggleActiveSchema.parse(req.body);
      const policy = await storage.toggleSovereignPolicy(req.params.id, isActive);
      if (!policy) return res.status(404).json({ error: "السياسة غير موجودة / Policy not found" });
      
      await storage.createAuditLog({
        userId: req.session.userId!,
        action: isActive ? "sovereign_policy_activated" : "sovereign_policy_deactivated",
        entityType: "sovereign_policy",
        entityId: policy.id,
      });
      
      res.json(policy);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "بيانات غير صالحة / Invalid data" });
      }
      res.status(500).json({ error: "فشل في تغيير حالة السياسة / Failed to toggle policy" });
    }
  });

  app.delete("/api/owner/sovereign-policies/:id", requireAuth, requireOwner, async (req, res) => {
    try {
      const deleted = await storage.deleteSovereignPolicy(req.params.id);
      if (!deleted) return res.status(404).json({ error: "السياسة غير موجودة / Policy not found" });
      
      await storage.createAuditLog({
        userId: req.session.userId!,
        action: "sovereign_policy_deleted",
        entityType: "sovereign_policy",
        entityId: req.params.id,
      });
      
      res.json({ message: "تم حذف السياسة بنجاح / Policy deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "فشل في حذف السياسة / Failed to delete policy" });
    }
  });

  // ============ Platform State Overview (Owner) ============
  
  app.get("/api/owner/platform-state", requireAuth, requireOwner, async (req, res) => {
    try {
      // Get all required data in parallel
      const [
        sovereignAssistants,
        pendingCommands,
        activeEmergencyControls,
        recentLogs
      ] = await Promise.all([
        storage.getSovereignAssistants(),
        storage.getSovereignCommands(100),
        storage.getActiveEmergencyControls(),
        storage.getSovereignActionLogs(20)
      ]);

      const activeSovereignAssistants = sovereignAssistants.filter(a => a.isActive).length;
      const pendingCount = pendingCommands.filter(c => c.status === 'pending' || c.status === 'awaiting_approval').length;
      const executingCount = pendingCommands.filter(c => c.status === 'executing').length;

      // Calculate health score based on various factors
      let healthScore = 100;
      if (activeEmergencyControls.length > 0) healthScore -= activeEmergencyControls.length * 20;
      if (activeSovereignAssistants < 3) healthScore -= 10;
      
      let healthStatus: 'healthy' | 'degraded' | 'critical' | 'emergency' = 'healthy';
      if (healthScore < 90) healthStatus = 'degraded';
      if (healthScore < 70) healthStatus = 'critical';
      if (activeEmergencyControls.length > 0) healthStatus = 'emergency';

      const platformState = {
        overallHealthScore: Math.max(0, healthScore),
        healthStatus,
        riskLevel: healthScore >= 80 ? 'low' : healthScore >= 60 ? 'medium' : healthScore >= 40 ? 'high' : 'critical',
        activeThreats: 0,
        pendingAlerts: pendingCount,
        aiServicesStatus: 'operational' as const,
        paymentServicesStatus: 'operational' as const,
        authServicesStatus: 'operational' as const,
        activeSovereignAssistants,
        pendingCommands: pendingCount,
        executingCommands: executingCount,
        activeEmergencyControls: activeEmergencyControls.length,
        lastEmergencyEvent: activeEmergencyControls.length > 0 
          ? activeEmergencyControls[0].activatedAt?.toISOString() || null
          : null,
        anomalyAlerts: [],
      };

      res.json(platformState);
    } catch (error) {
      console.error("Platform state error:", error);
      res.status(500).json({ error: "فشل في جلب حالة المنصة / Failed to get platform state" });
    }
  });

  // ============ Simulation Mode for Commands (Owner) ============
  
  const simulateCommandSchema = z.object({
    assistantId: z.string(),
    directive: z.string(),
    directiveAr: z.string().optional(),
  });

  app.post("/api/owner/sovereign-commands/simulate", requireAuth, requireOwner, async (req, res) => {
    try {
      const { assistantId, directive, directiveAr } = simulateCommandSchema.parse(req.body);
      
      const assistant = await storage.getSovereignAssistant(assistantId);
      if (!assistant) {
        return res.status(404).json({ error: "المساعد غير موجود / Assistant not found" });
      }

      // Create a simulation result (in a real system, this would use AI to predict impact)
      const simulationResult = {
        projectedImpact: {
          estimatedDuration: "5-10 minutes",
          affectedUsers: 0,
          affectedServices: assistant.scopeOfAuthority || [],
          costImpact: "None",
        },
        affectedEntities: assistant.scopeOfAuthority || [],
        riskScore: 25, // Low risk for simulation
        recommendations: [
          "Review the proposed changes before approval",
          "Ensure backup systems are ready",
          "Monitor logs during execution"
        ],
        recommendationsAr: [
          "مراجعة التغييرات المقترحة قبل الموافقة",
          "التأكد من جاهزية أنظمة النسخ الاحتياطي",
          "مراقبة السجلات أثناء التنفيذ"
        ],
      };

      // Create command in simulation mode
      const command = await storage.createSovereignCommand({
        assistantId,
        issuedBy: req.session.userId!,
        directive,
        directiveAr,
        isSimulation: true,
        simulationResult,
        status: "completed",
        requiresApproval: false,
      });

      await storage.createSovereignActionLog({
        commandId: command.id,
        assistantId,
        actorId: req.session.userId!,
        actorType: "owner",
        eventType: "simulation_completed",
        eventDescription: `Simulation completed for: ${directive}`,
        eventDescriptionAr: `اكتمال المحاكاة لـ: ${directive}`,
      });

      res.json({
        message: "تم إكمال المحاكاة بنجاح / Simulation completed successfully",
        command,
        simulationResult
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "بيانات غير صالحة / Invalid data", details: error.errors });
      }
      console.error("Simulation error:", error);
      res.status(500).json({ error: "فشل في تشغيل المحاكاة / Failed to run simulation" });
    }
  });

  // ============ Emergency Controls (Owner) ============
  
  app.get("/api/owner/emergency-controls", requireAuth, requireOwner, async (req, res) => {
    try {
      const controls = await storage.getEmergencyControls();
      res.json(controls);
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب ضوابط الطوارئ / Failed to get emergency controls" });
    }
  });

  const activateEmergencySchema = z.object({
    type: z.string(),
    scope: z.string(),
    scopeValue: z.string().optional(),
    reason: z.string(),
    reasonAr: z.string().optional(),
    autoDeactivateMinutes: z.number().optional(),
  });

  app.post("/api/owner/emergency-controls/activate", requireAuth, requireOwner, async (req, res) => {
    try {
      const data = activateEmergencySchema.parse(req.body);
      
      const control = await storage.createEmergencyControl({
        type: data.type,
        scope: data.scope,
        scopeValue: data.scopeValue,
        reason: data.reason,
        reasonAr: data.reasonAr,
        activatedBy: req.session.userId!,
        isActive: true,
        autoDeactivateAt: data.autoDeactivateMinutes 
          ? new Date(Date.now() + data.autoDeactivateMinutes * 60 * 1000)
          : undefined,
      });

      await storage.createAuditLog({
        userId: req.session.userId!,
        action: "emergency_control_activated",
        entityType: "emergency_control",
        entityId: control.id,
        details: { type: data.type, scope: data.scope, reason: data.reason },
      });

      // Log to sovereign action logs for visibility
      await storage.createSovereignActionLog({
        assistantId: "system",
        actorId: req.session.userId!,
        actorType: "owner",
        eventType: "emergency_activated",
        eventDescription: `Emergency control activated: ${data.type} - ${data.reason}`,
        eventDescriptionAr: `تم تفعيل ضابط طوارئ: ${data.type} - ${data.reasonAr || data.reason}`,
      });

      res.status(201).json({
        message: "تم تفعيل ضابط الطوارئ / Emergency control activated",
        control
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "بيانات غير صالحة / Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "فشل في تفعيل ضابط الطوارئ / Failed to activate emergency control" });
    }
  });

  app.post("/api/owner/emergency-controls/:id/deactivate", requireAuth, requireOwner, async (req, res) => {
    try {
      const control = await storage.deactivateEmergencyControl(req.params.id, req.session.userId!);
      if (!control) {
        return res.status(404).json({ error: "ضابط الطوارئ غير موجود / Emergency control not found" });
      }

      await storage.createAuditLog({
        userId: req.session.userId!,
        action: "emergency_control_deactivated",
        entityType: "emergency_control",
        entityId: control.id,
      });

      await storage.createSovereignActionLog({
        assistantId: "system",
        actorId: req.session.userId!,
        actorType: "owner",
        eventType: "emergency_deactivated",
        eventDescription: `Emergency control deactivated: ${control.type}`,
        eventDescriptionAr: `تم إلغاء تفعيل ضابط الطوارئ: ${control.type}`,
      });

      res.json({
        message: "تم إلغاء تفعيل ضابط الطوارئ / Emergency control deactivated",
        control
      });
    } catch (error) {
      res.status(500).json({ error: "فشل في إلغاء تفعيل ضابط الطوارئ / Failed to deactivate emergency control" });
    }
  });

  // ============ AI App Builder Routes - مسارات منشئ التطبيقات بالذكاء الاصطناعي ============
  
  const { createBuildPlan, executeBuildStep, executeFullBuild, getSessionWithTasks, cancelBuild } = await import("./ai-app-builder");

  // Get all build sessions
  app.get("/api/ai-builder/sessions", async (req, res) => {
    try {
      const userId = req.session?.userId;
      const sessions = await storage.getAiBuildSessions(userId || undefined);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب جلسات البناء / Failed to get build sessions" });
    }
  });

  // Get a specific session with tasks and artifacts
  app.get("/api/ai-builder/sessions/:id", async (req, res) => {
    try {
      const result = await getSessionWithTasks(req.params.id);
      if (!result) {
        return res.status(404).json({ error: "الجلسة غير موجودة / Session not found" });
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب تفاصيل الجلسة / Failed to get session details" });
    }
  });

  // Create a new build plan from a prompt
  const createBuildSchema = z.object({
    prompt: z.string().min(10, "الطلب قصير جداً / Prompt too short"),
  });

  app.post("/api/ai-builder/plan", async (req, res) => {
    try {
      const { prompt } = createBuildSchema.parse(req.body);
      const userId = req.session?.userId;
      
      const session = await createBuildPlan(prompt, userId || undefined);
      res.status(201).json(session);
    } catch (error) {
      console.error("Plan creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "بيانات غير صالحة / Invalid data", details: error.errors });
      }
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: `فشل في إنشاء خطة البناء / Failed to create build plan: ${message}` });
    }
  });

  // Execute a single build step
  app.post("/api/ai-builder/sessions/:sessionId/tasks/:taskId/execute", async (req, res) => {
    try {
      const { sessionId, taskId } = req.params;
      
      const result = await executeBuildStep(sessionId, taskId);
      res.json({ success: true, output: result });
    } catch (error) {
      console.error("Task execution error:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: `فشل في تنفيذ المهمة / Failed to execute task: ${message}` });
    }
  });

  // Execute full build (all steps)
  app.post("/api/ai-builder/sessions/:sessionId/execute", async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      const session = await executeFullBuild(sessionId);
      res.json({ success: true, session });
    } catch (error) {
      console.error("Full build error:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: `فشل في تنفيذ البناء / Failed to execute build: ${message}` });
    }
  });

  // Cancel a build
  app.post("/api/ai-builder/sessions/:sessionId/cancel", async (req, res) => {
    try {
      await cancelBuild(req.params.sessionId);
      res.json({ message: "تم إلغاء البناء / Build cancelled" });
    } catch (error) {
      res.status(500).json({ error: "فشل في إلغاء البناء / Failed to cancel build" });
    }
  });

  // Delete a session
  app.delete("/api/ai-builder/sessions/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteAiBuildSession(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "الجلسة غير موجودة / Session not found" });
      }
      res.json({ message: "تم حذف الجلسة / Session deleted" });
    } catch (error) {
      res.status(500).json({ error: "فشل في حذف الجلسة / Failed to delete session" });
    }
  });

  // Get artifacts for a session
  app.get("/api/ai-builder/sessions/:sessionId/artifacts", async (req, res) => {
    try {
      const artifacts = await storage.getAiBuildArtifacts(req.params.sessionId);
      res.json(artifacts);
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب الملفات / Failed to get artifacts" });
    }
  });

  // ============ Cloud IDE Routes - بيئة التطوير السحابية ============

  // Get all dev projects
  app.get("/api/dev-projects", async (req, res) => {
    try {
      const userId = req.session?.userId;
      const projects = await storage.getDevProjects(userId);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب المشاريع / Failed to get projects" });
    }
  });

  // Get single dev project
  app.get("/api/dev-projects/:id", async (req, res) => {
    try {
      const project = await storage.getDevProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "المشروع غير موجود / Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب المشروع / Failed to get project" });
    }
  });

  // Create dev project
  app.post("/api/dev-projects", async (req, res) => {
    try {
      const { name, nameAr, description, projectType, language } = req.body;
      const userId = req.session?.userId;
      
      const project = await storage.createDevProject({
        userId,
        name: name || "New Project",
        nameAr,
        description,
        projectType: projectType || "nodejs",
        language: language || "ar",
      });

      // Create default files based on project type
      const defaultFiles = getDefaultProjectFiles(project.projectType, project.id);
      for (const file of defaultFiles) {
        await storage.createProjectFile(file);
      }

      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ error: "فشل في إنشاء المشروع / Failed to create project" });
    }
  });

  // Update dev project
  app.patch("/api/dev-projects/:id", async (req, res) => {
    try {
      const project = await storage.updateDevProject(req.params.id, req.body);
      if (!project) {
        return res.status(404).json({ error: "المشروع غير موجود / Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "فشل في تحديث المشروع / Failed to update project" });
    }
  });

  // Delete dev project
  app.delete("/api/dev-projects/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteDevProject(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "المشروع غير موجود / Project not found" });
      }
      res.json({ message: "تم حذف المشروع / Project deleted" });
    } catch (error) {
      res.status(500).json({ error: "فشل في حذف المشروع / Failed to delete project" });
    }
  });

  // ============ Project Files Routes ============

  // Get all files for a project
  app.get("/api/dev-projects/:projectId/files", async (req, res) => {
    try {
      const files = await storage.getProjectFiles(req.params.projectId);
      res.json(files);
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب الملفات / Failed to get files" });
    }
  });

  // Get single file
  app.get("/api/dev-projects/:projectId/files/:fileId", async (req, res) => {
    try {
      const file = await storage.getProjectFile(req.params.fileId);
      if (!file) {
        return res.status(404).json({ error: "الملف غير موجود / File not found" });
      }
      res.json(file);
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب الملف / Failed to get file" });
    }
  });

  // Create file
  app.post("/api/dev-projects/:projectId/files", async (req, res) => {
    try {
      const { fileName, filePath, fileType, content, isDirectory } = req.body;
      const file = await storage.createProjectFile({
        projectId: req.params.projectId,
        fileName,
        filePath,
        fileType: fileType || getFileType(fileName),
        content: content || "",
        isDirectory: isDirectory || false,
        size: content?.length || 0,
      });
      res.status(201).json(file);
    } catch (error) {
      res.status(500).json({ error: "فشل في إنشاء الملف / Failed to create file" });
    }
  });

  // Update file content
  app.patch("/api/dev-projects/:projectId/files/:fileId", async (req, res) => {
    try {
      const { content, fileName } = req.body;
      const updateData: any = {};
      if (content !== undefined) {
        updateData.content = content;
        updateData.size = content.length;
      }
      if (fileName) {
        updateData.fileName = fileName;
        updateData.fileType = getFileType(fileName);
      }
      
      const file = await storage.updateProjectFile(req.params.fileId, updateData);
      if (!file) {
        return res.status(404).json({ error: "الملف غير موجود / File not found" });
      }
      res.json(file);
    } catch (error) {
      res.status(500).json({ error: "فشل في تحديث الملف / Failed to update file" });
    }
  });

  // Delete file
  app.delete("/api/dev-projects/:projectId/files/:fileId", async (req, res) => {
    try {
      const deleted = await storage.deleteProjectFile(req.params.fileId);
      if (!deleted) {
        return res.status(404).json({ error: "الملف غير موجود / File not found" });
      }
      res.json({ message: "تم حذف الملف / File deleted" });
    } catch (error) {
      res.status(500).json({ error: "فشل في حذف الملف / Failed to delete file" });
    }
  });

  // ============ Runtime Routes ============

  // Get runtime status
  app.get("/api/dev-projects/:projectId/runtime", async (req, res) => {
    try {
      const instance = await storage.getRuntimeInstance(req.params.projectId);
      res.json(instance || { status: "stopped" });
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب حالة التشغيل / Failed to get runtime status" });
    }
  });

  // Start runtime
  app.post("/api/dev-projects/:projectId/runtime/start", async (req, res) => {
    try {
      const project = await storage.getDevProject(req.params.projectId);
      if (!project) {
        return res.status(404).json({ error: "المشروع غير موجود / Project not found" });
      }

      let instance = await storage.getRuntimeInstance(req.params.projectId);
      
      if (!instance) {
        instance = await storage.createRuntimeInstance({
          projectId: req.params.projectId,
          userId: req.session?.userId,
          status: "starting",
          port: 3000 + Math.floor(Math.random() * 1000),
        });
      } else {
        instance = await storage.updateRuntimeInstance(instance.id, {
          status: "starting",
          startedAt: new Date(),
        });
      }

      // Simulate starting (in real implementation, this would spawn a process)
      setTimeout(async () => {
        if (instance) {
          await storage.updateRuntimeInstance(instance.id, { status: "running" });
          await storage.createConsoleLog({
            projectId: req.params.projectId,
            instanceId: instance.id,
            logType: "system",
            content: "🚀 Server started successfully on port " + instance.port,
          });
        }
      }, 1000);

      res.json({ message: "جاري بدء التشغيل / Starting runtime", instance });
    } catch (error) {
      res.status(500).json({ error: "فشل في بدء التشغيل / Failed to start runtime" });
    }
  });

  // Stop runtime
  app.post("/api/dev-projects/:projectId/runtime/stop", async (req, res) => {
    try {
      const instance = await storage.getRuntimeInstance(req.params.projectId);
      if (!instance) {
        return res.status(404).json({ error: "لا يوجد تشغيل نشط / No active runtime" });
      }

      await storage.updateRuntimeInstance(instance.id, {
        status: "stopped",
        stoppedAt: new Date(),
      });

      await storage.createConsoleLog({
        projectId: req.params.projectId,
        instanceId: instance.id,
        logType: "system",
        content: "⏹️ Server stopped",
      });

      res.json({ message: "تم إيقاف التشغيل / Runtime stopped" });
    } catch (error) {
      res.status(500).json({ error: "فشل في إيقاف التشغيل / Failed to stop runtime" });
    }
  });

  // Restart runtime
  app.post("/api/dev-projects/:projectId/runtime/restart", async (req, res) => {
    try {
      const instance = await storage.getRuntimeInstance(req.params.projectId);
      if (!instance) {
        return res.status(404).json({ error: "لا يوجد تشغيل نشط / No active runtime" });
      }

      await storage.updateRuntimeInstance(instance.id, { status: "starting" });
      
      await storage.createConsoleLog({
        projectId: req.params.projectId,
        instanceId: instance.id,
        logType: "system",
        content: "🔄 Restarting server...",
      });

      setTimeout(async () => {
        await storage.updateRuntimeInstance(instance.id, { status: "running" });
        await storage.createConsoleLog({
          projectId: req.params.projectId,
          instanceId: instance.id,
          logType: "system",
          content: "✅ Server restarted successfully",
        });
      }, 1500);

      res.json({ message: "جاري إعادة التشغيل / Restarting runtime" });
    } catch (error) {
      res.status(500).json({ error: "فشل في إعادة التشغيل / Failed to restart runtime" });
    }
  });

  // Get preview HTML (renders project files as HTML)
  app.get("/api/dev-projects/:projectId/preview", async (req, res) => {
    try {
      const project = await storage.getDevProject(req.params.projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const files = await storage.getProjectFiles(req.params.projectId);
      
      // Find HTML, CSS, JS files
      const htmlFile = files.find(f => f.fileName === "index.html" || f.fileType === "html");
      const cssFiles = files.filter(f => f.fileType === "css");
      const jsFiles = files.filter(f => f.fileType === "javascript" && !f.fileName.includes("test"));
      
      // For Node.js/Python backend projects, show terminal-based preview info
      if (project.projectType === "nodejs" || project.projectType === "python" || project.projectType === "fullstack") {
        const mainFile = files.find(f => f.fileName.includes("index") || f.fileName.includes("main") || f.fileName.includes("app"));
        const content = `<!DOCTYPE html>
<html dir="${req.query.lang === 'ar' ? 'rtl' : 'ltr'}" lang="${req.query.lang || 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.name}</title>
  <style>
    * { box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', system-ui, sans-serif; 
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); 
      color: #e2e8f0; 
      margin: 0; 
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .container { 
      max-width: 600px; 
      text-align: center;
    }
    .icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 1.5rem;
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
    }
    h1 { color: #60a5fa; margin-bottom: 0.5rem; font-size: 1.5rem; }
    .type { 
      display: inline-block;
      background: #3b82f6; 
      color: white; 
      padding: 0.25rem 0.75rem; 
      border-radius: 9999px; 
      font-size: 0.75rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
    }
    .instructions {
      background: rgba(59, 130, 246, 0.1);
      border: 1px solid rgba(59, 130, 246, 0.2);
      border-radius: 12px;
      padding: 1.5rem;
      text-align: ${req.query.lang === 'ar' ? 'right' : 'left'};
    }
    .instructions h3 { color: #93c5fd; margin: 0 0 0.75rem; font-size: 0.875rem; }
    .instructions p { color: #94a3b8; margin: 0; font-size: 0.875rem; line-height: 1.6; }
    code { 
      background: #1e293b; 
      padding: 0.25rem 0.5rem; 
      border-radius: 4px;
      font-family: 'Monaco', 'Menlo', monospace;
      color: #a5f3fc;
      font-size: 0.8rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">${project.projectType === 'nodejs' ? '&#9881;' : project.projectType === 'python' ? '&#128013;' : '&#128187;'}</div>
    <h1>${project.name}</h1>
    <span class="type">${project.projectType.toUpperCase()}</span>
    <div class="instructions">
      <h3>${req.query.lang === 'ar' ? 'تعليمات التشغيل' : 'How to Run'}</h3>
      <p>${req.query.lang === 'ar' 
        ? 'استخدم الـ Console للتشغيل. اكتب الأمر المناسب:'
        : 'Use the Console tab to run. Type the command:'}</p>
      <p style="margin-top: 0.75rem;">
        <code>${project.projectType === 'nodejs' ? 'node index.js' : project.projectType === 'python' ? 'python main.py' : 'npm run dev'}</code>
      </p>
    </div>
  </div>
</body>
</html>`;
        res.setHeader("Content-Type", "text/html");
        return res.send(content);
      }
      
      if (!htmlFile) {
        const mainFile = files.find(f => !f.isDirectory);
        const content = `<!DOCTYPE html>
<html dir="${req.query.lang === 'ar' ? 'rtl' : 'ltr'}" lang="${req.query.lang || 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.name}</title>
  <style>
    body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 2rem; }
    .container { max-width: 800px; margin: 0 auto; }
    pre { background: #1e293b; padding: 1rem; border-radius: 8px; overflow-x: auto; font-size: 14px; }
    code { color: #a5f3fc; }
    h1 { color: #60a5fa; margin-bottom: 1rem; }
    .info { color: #94a3b8; margin-bottom: 2rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${project.name}</h1>
    <p class="info">Project Type: ${project.projectType}</p>
    ${mainFile ? `<pre><code>${escapeHtml(mainFile.content)}</code></pre>` : '<p>No files to preview</p>'}
  </div>
</body>
</html>`;
        res.setHeader("Content-Type", "text/html");
        return res.send(content);
      }

      // Combine CSS
      const combinedCss = cssFiles.map(f => f.content).join("\n");
      
      // Combine JS
      const combinedJs = jsFiles.map(f => f.content).join("\n");
      
      // Inject CSS and JS into HTML
      let html = htmlFile.content;
      
      if (combinedCss && !html.includes("<style>")) {
        html = html.replace("</head>", `<style>\n${combinedCss}\n</style>\n</head>`);
      }
      
      if (combinedJs && !html.includes("<script>")) {
        html = html.replace("</body>", `<script>\n${combinedJs}\n</script>\n</body>`);
      }

      res.setHeader("Content-Type", "text/html");
      res.send(html);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate preview" });
    }
  });

  // Get console logs
  app.get("/api/dev-projects/:projectId/logs", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = await storage.getConsoleLogs(req.params.projectId, limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب السجلات / Failed to get logs" });
    }
  });

  // Clear console logs
  app.delete("/api/dev-projects/:projectId/logs", async (req, res) => {
    try {
      await storage.clearConsoleLogs(req.params.projectId);
      res.json({ message: "تم مسح السجلات / Logs cleared" });
    } catch (error) {
      res.status(500).json({ error: "فشل في مسح السجلات / Failed to clear logs" });
    }
  });

  // Generate WebSocket token for terminal/runtime access (requires auth)
  app.post("/api/dev-projects/:projectId/ws-token", requireAuth, async (req, res) => {
    try {
      const project = await storage.getDevProject(req.params.projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Verify user owns this project (or is admin)
      const userId = req.session.userId!;
      if (project.userId && project.userId !== userId && req.session.user?.role !== 'owner') {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const { generateWsToken } = await import("./terminal-service");
      const token = generateWsToken(req.params.projectId, userId);
      
      res.json({ token, expiresIn: 300 }); // 5 minutes
    } catch (error) {
      res.status(500).json({ error: "Failed to generate token" });
    }
  });

  // Sync files to disk for execution (requires auth)
  app.post("/api/dev-projects/:projectId/sync", requireAuth, async (req, res) => {
    try {
      const project = await storage.getDevProject(req.params.projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Verify user owns this project (or is admin)
      const userId = req.session.userId!;
      if (project.userId && project.userId !== userId && req.session.user?.role !== 'owner') {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const { syncFilesToDisk } = await import("./terminal-service");
      const files = await storage.getProjectFiles(req.params.projectId);
      
      const filesToSync = files
        .filter(f => !f.isDirectory)
        .map(f => ({
          path: f.filePath.startsWith("/") ? f.filePath.substring(1) : f.filePath,
          content: f.content || "",
        }));
      
      syncFilesToDisk(req.params.projectId, filesToSync);
      res.json({ message: "Files synced", count: filesToSync.length });
    } catch (error) {
      console.error("Sync error:", error);
      res.status(500).json({ error: "Failed to sync files" });
    }
  });

  // Execute command in project directory (requires auth)
  app.post("/api/dev-projects/:projectId/execute", requireAuth, async (req, res) => {
    try {
      const project = await storage.getDevProject(req.params.projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Verify user owns this project (or is admin)
      const userId = req.session.userId!;
      if (project.userId && project.userId !== userId && req.session.user?.role !== 'owner') {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const { command } = req.body;
      if (!command) {
        return res.status(400).json({ error: "Command required" });
      }
      
      const { executeCommand } = await import("./terminal-service");
      const result = await executeCommand(req.params.projectId, command);
      
      res.json(result);
    } catch (error) {
      console.error("Execute error:", error);
      res.status(500).json({ error: "Failed to execute command" });
    }
  });

  // ==================== PACKAGE MANAGER API ====================
  
  // Install package in project
  app.post("/api/dev-projects/:projectId/packages/install", requireAuth, async (req, res) => {
    try {
      const project = await storage.getDevProject(req.params.projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      const userId = req.session.userId!;
      if (project.userId && project.userId !== userId && req.session.user?.role !== 'owner') {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const { packageName } = req.body;
      if (!packageName || typeof packageName !== "string") {
        return res.status(400).json({ error: "Package name required" });
      }
      
      // Validate package name (alphanumeric, hyphens, underscores, @scope)
      const validPackage = /^(@[a-zA-Z0-9_-]+\/)?[a-zA-Z0-9_-]+(@[a-zA-Z0-9._-]+)?$/.test(packageName);
      if (!validPackage) {
        return res.status(400).json({ error: "Invalid package name" });
      }
      
      const { executeCommand } = await import("./terminal-service");
      const result = await executeCommand(req.params.projectId, `npm install ${packageName}`);
      
      res.json({ 
        success: true, 
        package: packageName,
        output: result.stdout,
        error: result.stderr 
      });
    } catch (error) {
      console.error("Package install error:", error);
      res.status(500).json({ error: "Failed to install package" });
    }
  });
  
  // Uninstall package from project
  app.post("/api/dev-projects/:projectId/packages/uninstall", requireAuth, async (req, res) => {
    try {
      const project = await storage.getDevProject(req.params.projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      const userId = req.session.userId!;
      if (project.userId && project.userId !== userId && req.session.user?.role !== 'owner') {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const { packageName } = req.body;
      if (!packageName || typeof packageName !== "string") {
        return res.status(400).json({ error: "Package name required" });
      }
      
      const { executeCommand } = await import("./terminal-service");
      const result = await executeCommand(req.params.projectId, `npm uninstall ${packageName}`);
      
      res.json({ 
        success: true, 
        package: packageName,
        output: result.stdout 
      });
    } catch (error) {
      console.error("Package uninstall error:", error);
      res.status(500).json({ error: "Failed to uninstall package" });
    }
  });
  
  // Search npm packages
  app.get("/api/packages/search", requireAuth, async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 2) {
        return res.json({ packages: [] });
      }
      
      // Search npm registry
      const response = await fetch(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=10`);
      const data = await response.json();
      
      const packages = data.objects?.map((obj: any) => ({
        name: obj.package.name,
        version: obj.package.version,
        description: obj.package.description,
        downloads: obj.downloads?.all || 0,
      })) || [];
      
      res.json({ packages });
    } catch (error) {
      console.error("Package search error:", error);
      res.status(500).json({ error: "Failed to search packages" });
    }
  });
  
  // List installed packages for a project
  app.get("/api/dev-projects/:projectId/packages", requireAuth, async (req, res) => {
    try {
      const project = await storage.getDevProject(req.params.projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      const userId = req.session.userId!;
      if (project.userId && project.userId !== userId && req.session.user?.role !== 'owner') {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Try to read package.json from project files
      const files = await storage.getProjectFiles(req.params.projectId);
      const packageJsonFile = files.find(f => f.fileName === "package.json");
      
      if (packageJsonFile && packageJsonFile.content) {
        try {
          const packageJson = JSON.parse(packageJsonFile.content);
          const dependencies = Object.keys(packageJson.dependencies || {});
          const devDependencies = Object.keys(packageJson.devDependencies || {});
          
          res.json({ 
            dependencies: dependencies.map(name => ({
              name,
              version: packageJson.dependencies[name],
              isDev: false
            })),
            devDependencies: devDependencies.map(name => ({
              name,
              version: packageJson.devDependencies[name],
              isDev: true
            }))
          });
        } catch {
          res.json({ dependencies: [], devDependencies: [] });
        }
      } else {
        res.json({ dependencies: [], devDependencies: [] });
      }
    } catch (error) {
      console.error("List packages error:", error);
      res.status(500).json({ error: "Failed to list packages" });
    }
  });

  // ==================== GIT INTEGRATION API ====================
  
  // Initialize git repository for project
  app.post("/api/dev-projects/:projectId/git/init", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      const project = await storage.getDevProject(req.params.projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      if (project.userId && project.userId !== userId && req.session.user?.role !== 'owner') {
        return res.status(403).json({ error: "Access denied" });
      }

      const projectPath = path.join(os.tmpdir(), "infera-projects", req.params.projectId);
      
      // Check if git is already initialized
      const gitPath = path.join(projectPath, ".git");
      if (fs.existsSync(gitPath)) {
        return res.json({ success: true, message: "Git already initialized" });
      }
      
      // Initialize git
      const { execSync } = await import("child_process");
      execSync("git init", { cwd: projectPath, encoding: "utf-8" });
      execSync('git config user.email "user@infera.app"', { cwd: projectPath, encoding: "utf-8" });
      execSync('git config user.name "INFERA User"', { cwd: projectPath, encoding: "utf-8" });
      
      res.json({ success: true, message: "Git repository initialized" });
    } catch (error) {
      console.error("Git init error:", error);
      res.status(500).json({ error: "Failed to initialize git" });
    }
  });

  // Get git status
  app.get("/api/dev-projects/:projectId/git/status", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      const project = await storage.getDevProject(req.params.projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      if (project.userId && project.userId !== userId && req.session.user?.role !== 'owner') {
        return res.status(403).json({ error: "Access denied" });
      }

      const projectPath = path.join(os.tmpdir(), "infera-projects", req.params.projectId);
      const gitPath = path.join(projectPath, ".git");
      
      if (!fs.existsSync(gitPath)) {
        return res.json({ initialized: false, files: [], branch: null });
      }
      
      const { execSync } = await import("child_process");
      
      // Get current branch
      let branch = "main";
      try {
        branch = execSync("git rev-parse --abbrev-ref HEAD", { cwd: projectPath, encoding: "utf-8" }).trim();
      } catch {
        branch = "main";
      }
      
      // Get status
      let statusOutput = "";
      try {
        statusOutput = execSync("git status --porcelain", { cwd: projectPath, encoding: "utf-8" });
      } catch {
        statusOutput = "";
      }
      
      const files = statusOutput
        .split("\n")
        .filter(line => line.trim())
        .map(line => {
          const status = line.substring(0, 2).trim();
          const filePath = line.substring(3).trim();
          return {
            path: filePath,
            status: status === "M" ? "modified" : status === "A" ? "added" : status === "D" ? "deleted" : status === "??" ? "untracked" : "unknown"
          };
        });
      
      // Get commit count
      let commitCount = 0;
      try {
        commitCount = parseInt(execSync("git rev-list --count HEAD", { cwd: projectPath, encoding: "utf-8" }).trim());
      } catch {
        commitCount = 0;
      }
      
      res.json({
        initialized: true,
        branch,
        files,
        commitCount,
        hasChanges: files.length > 0
      });
    } catch (error) {
      console.error("Git status error:", error);
      res.status(500).json({ error: "Failed to get git status" });
    }
  });

  // Git add and commit
  app.post("/api/dev-projects/:projectId/git/commit", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      const project = await storage.getDevProject(req.params.projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      if (project.userId && project.userId !== userId && req.session.user?.role !== 'owner') {
        return res.status(403).json({ error: "Access denied" });
      }

      const { message } = req.body;
      if (!message || typeof message !== "string" || message.length === 0) {
        return res.status(400).json({ error: "Commit message required" });
      }
      
      // Sanitize commit message
      const sanitizedMessage = message.replace(/[`$\\]/g, "").substring(0, 500);

      const projectPath = path.join(os.tmpdir(), "infera-projects", req.params.projectId);
      
      const { execSync } = await import("child_process");
      
      // Initialize if not already
      const gitPath = path.join(projectPath, ".git");
      if (!fs.existsSync(gitPath)) {
        execSync("git init", { cwd: projectPath, encoding: "utf-8" });
        execSync('git config user.email "user@infera.app"', { cwd: projectPath, encoding: "utf-8" });
        execSync('git config user.name "INFERA User"', { cwd: projectPath, encoding: "utf-8" });
      }
      
      // Add all files
      execSync("git add -A", { cwd: projectPath, encoding: "utf-8" });
      
      // Commit
      try {
        execSync(`git commit -m "${sanitizedMessage}"`, { cwd: projectPath, encoding: "utf-8" });
      } catch (commitError: unknown) {
        if (commitError instanceof Error && commitError.message.includes("nothing to commit")) {
          return res.json({ success: true, message: "No changes to commit" });
        }
        throw commitError;
      }
      
      // Get new commit hash
      const commitHash = execSync("git rev-parse --short HEAD", { cwd: projectPath, encoding: "utf-8" }).trim();
      
      res.json({
        success: true,
        message: "Changes committed successfully",
        commitHash
      });
    } catch (error) {
      console.error("Git commit error:", error);
      res.status(500).json({ error: "Failed to commit changes" });
    }
  });

  // Get commit history
  app.get("/api/dev-projects/:projectId/git/log", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      const project = await storage.getDevProject(req.params.projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      if (project.userId && project.userId !== userId && req.session.user?.role !== 'owner') {
        return res.status(403).json({ error: "Access denied" });
      }

      const projectPath = path.join(os.tmpdir(), "infera-projects", req.params.projectId);
      const gitPath = path.join(projectPath, ".git");
      
      if (!fs.existsSync(gitPath)) {
        return res.json({ commits: [] });
      }
      
      const { execSync } = await import("child_process");
      
      let logOutput = "";
      try {
        logOutput = execSync(
          'git log --pretty=format:"%H|%h|%s|%an|%ae|%ad" --date=iso -20',
          { cwd: projectPath, encoding: "utf-8" }
        );
      } catch {
        return res.json({ commits: [] });
      }
      
      const commits = logOutput
        .split("\n")
        .filter(line => line.trim())
        .map(line => {
          const [hash, shortHash, message, author, email, date] = line.split("|");
          return { hash, shortHash, message, author, email, date };
        });
      
      res.json({ commits });
    } catch (error) {
      console.error("Git log error:", error);
      res.status(500).json({ error: "Failed to get commit history" });
    }
  });

  // Set remote repository (GitHub)
  app.post("/api/dev-projects/:projectId/git/remote", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      const project = await storage.getDevProject(req.params.projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      if (project.userId && project.userId !== userId && req.session.user?.role !== 'owner') {
        return res.status(403).json({ error: "Access denied" });
      }

      const { url, name = "origin" } = req.body;
      if (!url || typeof url !== "string") {
        return res.status(400).json({ error: "Remote URL required" });
      }
      
      // Validate URL format (GitHub, GitLab, Bitbucket, etc.)
      const validRemotePattern = /^https:\/\/(github\.com|gitlab\.com|bitbucket\.org)\/[\w-]+\/[\w.-]+\.git$/;
      if (!validRemotePattern.test(url)) {
        return res.status(400).json({ 
          error: "Invalid remote URL format. Use: https://github.com/username/repo.git" 
        });
      }

      const projectPath = path.join(os.tmpdir(), "infera-projects", req.params.projectId);
      const gitPath = path.join(projectPath, ".git");
      
      if (!fs.existsSync(gitPath)) {
        return res.status(400).json({ error: "Git not initialized. Please initialize git first." });
      }
      
      const { execSync } = await import("child_process");
      const sanitizedName = name.replace(/[^a-zA-Z0-9_-]/g, "").substring(0, 20) || "origin";
      
      // Check if remote exists
      try {
        execSync(`git remote get-url ${sanitizedName}`, { cwd: projectPath, encoding: "utf-8" });
        // Remote exists, update it
        execSync(`git remote set-url ${sanitizedName} "${url}"`, { cwd: projectPath, encoding: "utf-8" });
      } catch {
        // Remote doesn't exist, add it
        execSync(`git remote add ${sanitizedName} "${url}"`, { cwd: projectPath, encoding: "utf-8" });
      }
      
      res.json({ success: true, message: `Remote '${sanitizedName}' set to ${url}` });
    } catch (error) {
      console.error("Git remote error:", error);
      res.status(500).json({ error: "Failed to set remote" });
    }
  });

  // Get remotes
  app.get("/api/dev-projects/:projectId/git/remotes", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      const project = await storage.getDevProject(req.params.projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      if (project.userId && project.userId !== userId && req.session.user?.role !== 'owner') {
        return res.status(403).json({ error: "Access denied" });
      }

      const projectPath = path.join(os.tmpdir(), "infera-projects", req.params.projectId);
      const gitPath = path.join(projectPath, ".git");
      
      if (!fs.existsSync(gitPath)) {
        return res.json({ remotes: [] });
      }
      
      const { execSync } = await import("child_process");
      
      let remotesOutput = "";
      try {
        remotesOutput = execSync("git remote -v", { cwd: projectPath, encoding: "utf-8" });
      } catch {
        return res.json({ remotes: [] });
      }
      
      const remotes: Array<{name: string, url: string, type: string}> = [];
      const seen = new Set<string>();
      
      remotesOutput.split("\n").filter(line => line.trim()).forEach(line => {
        const match = line.match(/^(\S+)\s+(\S+)\s+\((\w+)\)$/);
        if (match) {
          const key = `${match[1]}-${match[3]}`;
          if (!seen.has(key)) {
            seen.add(key);
            remotes.push({ name: match[1], url: match[2], type: match[3] });
          }
        }
      });
      
      res.json({ remotes });
    } catch (error) {
      console.error("Git remotes error:", error);
      res.status(500).json({ error: "Failed to get remotes" });
    }
  });

  // Helper function to sanitize git inputs and prevent command injection
  const sanitizeGitInput = (input: string, maxLength = 50): string | null => {
    if (!input || typeof input !== "string") return null;
    const sanitized = input.replace(/[^a-zA-Z0-9_.-]/g, "").substring(0, maxLength);
    return sanitized.length > 0 ? sanitized : null;
  };

  const sanitizeGitToken = (token: string): string | null => {
    if (!token || typeof token !== "string") return null;
    if (token.length < 10 || token.length > 200) return null;
    if (!/^[a-zA-Z0-9_-]+$/.test(token)) return null;
    return token;
  };

  // Git push (requires GitHub token)
  app.post("/api/dev-projects/:projectId/git/push", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      const project = await storage.getDevProject(req.params.projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      if (project.userId && project.userId !== userId && req.session.user?.role !== 'owner') {
        return res.status(403).json({ error: "Access denied" });
      }

      const rawRemote = req.body.remote || "origin";
      const rawBranch = req.body.branch || "main";
      const rawToken = req.body.token;
      
      const remote = sanitizeGitInput(rawRemote);
      const branch = sanitizeGitInput(rawBranch);
      const token = sanitizeGitToken(rawToken);
      
      if (!remote || !branch) {
        return res.status(400).json({ error: "Invalid remote or branch name" });
      }
      
      if (!token) {
        return res.status(400).json({ 
          error: "Valid GitHub Personal Access Token required for push",
          hint: "Create a token at: https://github.com/settings/tokens"
        });
      }

      const projectPath = path.join(os.tmpdir(), "infera-projects", req.params.projectId);
      const gitPath = path.join(projectPath, ".git");
      
      if (!fs.existsSync(gitPath)) {
        return res.status(400).json({ error: "Git not initialized" });
      }
      
      const { spawnSync } = await import("child_process");
      
      // Get remote URL using spawn (safer)
      const getUrlResult = spawnSync("git", ["remote", "get-url", remote], { 
        cwd: projectPath, 
        encoding: "utf-8" 
      });
      
      if (getUrlResult.status !== 0) {
        return res.status(400).json({ error: `Remote '${remote}' not found. Please add a remote first.` });
      }
      
      const remoteUrl = getUrlResult.stdout.trim();
      
      // Validate remote URL format
      if (!remoteUrl.startsWith("https://github.com/") && 
          !remoteUrl.startsWith("https://gitlab.com/") && 
          !remoteUrl.startsWith("https://bitbucket.org/")) {
        return res.status(400).json({ error: "Only HTTPS GitHub/GitLab/Bitbucket URLs are supported" });
      }
      
      // Build authenticated URL
      const authUrl = remoteUrl.replace("https://", `https://oauth2:${token}@`);
      
      try {
        // Temporarily set remote with auth using spawn
        spawnSync("git", ["remote", "set-url", remote, authUrl], { cwd: projectPath, encoding: "utf-8" });
        
        // Push using spawn (avoids shell injection)
        const pushResult = spawnSync("git", ["push", "-u", remote, branch], { 
          cwd: projectPath, 
          encoding: "utf-8",
          timeout: 60000
        });
        
        // Always restore original URL (without token)
        spawnSync("git", ["remote", "set-url", remote, remoteUrl], { cwd: projectPath, encoding: "utf-8" });
        
        if (pushResult.status !== 0) {
          const errMsg = pushResult.stderr || "";
          if (errMsg.includes("Authentication failed") || errMsg.includes("Invalid credentials")) {
            return res.status(401).json({ 
              error: "Authentication failed. Check your GitHub token.",
              hint: "Token needs 'repo' scope for private repos"
            });
          }
          return res.status(500).json({ error: "Push failed", details: errMsg.substring(0, 200) });
        }
        
        res.json({ 
          success: true, 
          message: `Pushed to ${remote}/${branch}`
        });
      } catch (pushError: unknown) {
        // Always restore original URL
        try {
          spawnSync("git", ["remote", "set-url", remote, remoteUrl], { cwd: projectPath, encoding: "utf-8" });
        } catch {}
        throw pushError;
      }
    } catch (error) {
      console.error("Git push error");
      res.status(500).json({ error: "Failed to push changes" });
    }
  });

  // Git pull (requires GitHub token for private repos)
  app.post("/api/dev-projects/:projectId/git/pull", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      const project = await storage.getDevProject(req.params.projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      if (project.userId && project.userId !== userId && req.session.user?.role !== 'owner') {
        return res.status(403).json({ error: "Access denied" });
      }

      const rawRemote = req.body.remote || "origin";
      const rawBranch = req.body.branch || "main";
      const rawToken = req.body.token;
      
      const remote = sanitizeGitInput(rawRemote);
      const branch = sanitizeGitInput(rawBranch);
      const token = rawToken ? sanitizeGitToken(rawToken) : null;
      
      if (!remote || !branch) {
        return res.status(400).json({ error: "Invalid remote or branch name" });
      }

      const projectPath = path.join(os.tmpdir(), "infera-projects", req.params.projectId);
      const gitPath = path.join(projectPath, ".git");
      
      if (!fs.existsSync(gitPath)) {
        return res.status(400).json({ error: "Git not initialized" });
      }
      
      const { spawnSync } = await import("child_process");
      
      // Get remote URL using spawn
      const getUrlResult = spawnSync("git", ["remote", "get-url", remote], { 
        cwd: projectPath, 
        encoding: "utf-8" 
      });
      
      if (getUrlResult.status !== 0) {
        return res.status(400).json({ error: `Remote '${remote}' not found` });
      }
      
      const remoteUrl = getUrlResult.stdout.trim();
      
      try {
        let pullResult;
        
        if (token) {
          // Use token for authentication (private repos)
          const authUrl = remoteUrl.replace("https://", `https://oauth2:${token}@`);
          spawnSync("git", ["remote", "set-url", remote, authUrl], { cwd: projectPath, encoding: "utf-8" });
          
          pullResult = spawnSync("git", ["pull", remote, branch], { 
            cwd: projectPath, 
            encoding: "utf-8",
            timeout: 60000
          });
          
          // Restore original URL
          spawnSync("git", ["remote", "set-url", remote, remoteUrl], { cwd: projectPath, encoding: "utf-8" });
        } else {
          // Try without token (public repos)
          pullResult = spawnSync("git", ["pull", remote, branch], { 
            cwd: projectPath, 
            encoding: "utf-8",
            timeout: 60000
          });
        }
        
        if (pullResult.status !== 0) {
          const errMsg = pullResult.stderr || "";
          if (errMsg.includes("Authentication failed")) {
            return res.status(401).json({ error: "Authentication failed. Token required for private repos." });
          }
          if (errMsg.includes("CONFLICT") || errMsg.includes("merge conflict")) {
            return res.status(409).json({ error: "Merge conflict detected. Please resolve conflicts manually." });
          }
          return res.status(500).json({ error: "Pull failed", details: errMsg.substring(0, 200) });
        }
        
        // Sync pulled files back to database
        const files = await storage.getProjectFiles(req.params.projectId);
        for (const file of files) {
          const filePath = path.join(projectPath, file.filePath || file.fileName);
          if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, "utf-8");
            if (content !== file.content) {
              await storage.updateProjectFile(file.id, { content });
            }
          }
        }
        
        res.json({ 
          success: true, 
          message: `Pulled from ${remote}/${branch}`
        });
      } catch (pullError: unknown) {
        // Restore original URL if token was used
        if (token) {
          try {
            spawnSync("git", ["remote", "set-url", remote, remoteUrl], { cwd: projectPath, encoding: "utf-8" });
          } catch {}
        }
        throw pullError;
      }
    } catch (error) {
      console.error("Git pull error");
      res.status(500).json({ error: "Failed to pull changes" });
    }
  });

  // ==================== DEPLOYMENT API ====================
  
  // Get deployment status
  app.get("/api/dev-projects/:projectId/deploy/status", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      const project = await storage.getDevProject(req.params.projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      if (project.userId && project.userId !== userId && req.session.user?.role !== 'owner') {
        return res.status(403).json({ error: "Access denied" });
      }

      // Check if deployment exists
      const projectPath = path.join(os.tmpdir(), "infera-projects", req.params.projectId);
      const deployPath = path.join(os.tmpdir(), "infera-deployments", req.params.projectId);
      
      if (!fs.existsSync(deployPath)) {
        return res.json({
          deployed: false,
          url: null,
          lastDeployed: null
        });
      }
      
      // Get deployment info
      const infoPath = path.join(deployPath, ".deploy-info.json");
      let deployInfo = { lastDeployed: null, version: 0 };
      if (fs.existsSync(infoPath)) {
        try {
          deployInfo = JSON.parse(fs.readFileSync(infoPath, "utf-8"));
        } catch {
          deployInfo = { lastDeployed: null, version: 0 };
        }
      }
      
      const slug = project.name?.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-") || req.params.projectId;
      
      res.json({
        deployed: true,
        url: `https://${slug}.infera.app`,
        lastDeployed: deployInfo.lastDeployed,
        version: deployInfo.version
      });
    } catch (error) {
      console.error("Deploy status error:", error);
      res.status(500).json({ error: "Failed to get deployment status" });
    }
  });

  // Deploy project
  app.post("/api/dev-projects/:projectId/deploy", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      const project = await storage.getDevProject(req.params.projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      if (project.userId && project.userId !== userId && req.session.user?.role !== 'owner') {
        return res.status(403).json({ error: "Access denied" });
      }

      const projectPath = path.join(os.tmpdir(), "infera-projects", req.params.projectId);
      const deployPath = path.join(os.tmpdir(), "infera-deployments", req.params.projectId);
      
      // Create deployment directory
      if (!fs.existsSync(path.join(os.tmpdir(), "infera-deployments"))) {
        fs.mkdirSync(path.join(os.tmpdir(), "infera-deployments"), { recursive: true });
      }
      
      // Sync files first
      const files = await storage.getProjectFiles(req.params.projectId);
      if (!fs.existsSync(projectPath)) {
        fs.mkdirSync(projectPath, { recursive: true });
      }
      
      for (const file of files) {
        const filePath = path.join(projectPath, file.filePath || file.fileName);
        const fileDir = path.dirname(filePath);
        if (!fs.existsSync(fileDir)) {
          fs.mkdirSync(fileDir, { recursive: true });
        }
        fs.writeFileSync(filePath, file.content || "");
      }
      
      // Copy project to deployment directory
      const { execSync } = await import("child_process");
      
      if (fs.existsSync(deployPath)) {
        execSync(`rm -rf "${deployPath}"`);
      }
      execSync(`cp -r "${projectPath}" "${deployPath}"`);
      
      // Get existing version
      const infoPath = path.join(deployPath, ".deploy-info.json");
      let version = 1;
      if (fs.existsSync(infoPath)) {
        try {
          const existingInfo = JSON.parse(fs.readFileSync(infoPath, "utf-8"));
          version = (existingInfo.version || 0) + 1;
        } catch {
          version = 1;
        }
      }
      
      // Save deployment info
      const deployInfo = {
        projectId: req.params.projectId,
        projectName: project.name,
        lastDeployed: new Date().toISOString(),
        version,
        userId
      };
      fs.writeFileSync(infoPath, JSON.stringify(deployInfo, null, 2));
      
      const slug = project.name?.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-") || req.params.projectId;
      
      res.json({
        success: true,
        url: `https://${slug}.infera.app`,
        version,
        message: "Deployed successfully"
      });
    } catch (error) {
      console.error("Deploy error:", error);
      res.status(500).json({ error: "Deployment failed" });
    }
  });

  // Get deployment history
  app.get("/api/dev-projects/:projectId/deploy/history", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      const project = await storage.getDevProject(req.params.projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      if (project.userId && project.userId !== userId && req.session.user?.role !== 'owner') {
        return res.status(403).json({ error: "Access denied" });
      }

      const deployPath = path.join(os.tmpdir(), "infera-deployments", req.params.projectId);
      const infoPath = path.join(deployPath, ".deploy-info.json");
      
      if (!fs.existsSync(infoPath)) {
        return res.json({ deployments: [] });
      }
      
      const deployInfo = JSON.parse(fs.readFileSync(infoPath, "utf-8"));
      
      res.json({
        deployments: [{
          version: deployInfo.version,
          deployedAt: deployInfo.lastDeployed,
          status: "active"
        }]
      });
    } catch (error) {
      console.error("Deploy history error:", error);
      res.status(500).json({ error: "Failed to get deployment history" });
    }
  });

  // ==================== AI ASSISTANT API ====================
  
  // AI code assistance endpoint
  app.post("/api/dev-projects/:projectId/ai/assist", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      const project = await storage.getDevProject(req.params.projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      if (project.userId && project.userId !== userId && req.session.user?.role !== 'owner') {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const { prompt, context, language } = req.body;
      
      if (!prompt || typeof prompt !== "string" || prompt.length > 10000) {
        return res.status(400).json({ error: "Invalid prompt" });
      }
      
      const { generateCodeAssistance } = await import("./ai-engine");
      
      const result = await generateCodeAssistance(
        prompt,
        context?.content || "",
        context?.fileName || "",
        language || "en"
      );
      
      res.json({ response: result });
    } catch (error) {
      console.error("AI assist error:", error);
      res.status(500).json({ error: "AI assistance failed" });
    }
  });

  // ==================== DATABASE SCHEMA BUILDER API ====================
  
  // Get all database tables for a project
  app.get("/api/dev-projects/:projectId/database/tables", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      const project = await storage.getDevProject(req.params.projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      if (project.userId && project.userId !== userId && req.session.user?.role !== 'owner') {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const tables = await storage.getDevDatabaseTables(req.params.projectId);
      res.json(tables);
    } catch (error) {
      console.error("Error fetching database tables:", error);
      res.status(500).json({ error: "Failed to fetch database tables" });
    }
  });

  // Create a new database table - with validation
  app.post("/api/dev-projects/:projectId/database/tables", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      const project = await storage.getDevProject(req.params.projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      if (project.userId && project.userId !== userId && req.session.user?.role !== 'owner') {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Validate input - sanitize table name to prevent SQL injection
      const tableName = (req.body.tableName || "").toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 64);
      if (!tableName || tableName.length < 2) {
        return res.status(400).json({ error: "Invalid table name" });
      }
      
      const tableData = {
        tableName,
        tableNameDisplay: (req.body.tableNameDisplay || tableName).slice(0, 100),
        tableNameDisplayAr: (req.body.tableNameDisplayAr || "").slice(0, 100),
        description: (req.body.description || "").slice(0, 500),
        hasPrimaryKey: Boolean(req.body.hasPrimaryKey ?? true),
        primaryKeyType: ["uuid", "serial"].includes(req.body.primaryKeyType) ? req.body.primaryKeyType : "uuid",
        hasTimestamps: Boolean(req.body.hasTimestamps ?? true),
        isSoftDelete: Boolean(req.body.isSoftDelete ?? false),
        generateCrudApi: Boolean(req.body.generateCrudApi ?? true),
        apiPrefix: "/api",
        requireAuth: Boolean(req.body.requireAuth ?? false),
        projectId: req.params.projectId,
      };
      
      const table = await storage.createDevDatabaseTable(tableData);
      res.status(201).json(table);
    } catch (error) {
      console.error("Error creating database table:", error);
      res.status(500).json({ error: "Failed to create database table" });
    }
  });

  // Get a specific database table
  app.get("/api/dev-projects/:projectId/database/tables/:tableId", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      const project = await storage.getDevProject(req.params.projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      if (project.userId && project.userId !== userId && req.session.user?.role !== 'owner') {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const table = await storage.getDevDatabaseTable(req.params.tableId);
      if (!table || table.projectId !== req.params.projectId) {
        return res.status(404).json({ error: "Table not found" });
      }
      
      res.json(table);
    } catch (error) {
      console.error("Error fetching database table:", error);
      res.status(500).json({ error: "Failed to fetch database table" });
    }
  });

  // Update a database table
  app.patch("/api/dev-projects/:projectId/database/tables/:tableId", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      const project = await storage.getDevProject(req.params.projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      if (project.userId && project.userId !== userId && req.session.user?.role !== 'owner') {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const table = await storage.getDevDatabaseTable(req.params.tableId);
      if (!table || table.projectId !== req.params.projectId) {
        return res.status(404).json({ error: "Table not found" });
      }
      
      const updated = await storage.updateDevDatabaseTable(req.params.tableId, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating database table:", error);
      res.status(500).json({ error: "Failed to update database table" });
    }
  });

  // Delete a database table
  app.delete("/api/dev-projects/:projectId/database/tables/:tableId", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      const project = await storage.getDevProject(req.params.projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      if (project.userId && project.userId !== userId && req.session.user?.role !== 'owner') {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const table = await storage.getDevDatabaseTable(req.params.tableId);
      if (!table || table.projectId !== req.params.projectId) {
        return res.status(404).json({ error: "Table not found" });
      }
      
      await storage.deleteDevDatabaseTable(req.params.tableId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting database table:", error);
      res.status(500).json({ error: "Failed to delete database table" });
    }
  });

  // Get columns for a table
  app.get("/api/dev-projects/:projectId/database/tables/:tableId/columns", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      const project = await storage.getDevProject(req.params.projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      if (project.userId && project.userId !== userId && req.session.user?.role !== 'owner') {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const columns = await storage.getDevDatabaseColumns(req.params.tableId);
      res.json(columns);
    } catch (error) {
      console.error("Error fetching table columns:", error);
      res.status(500).json({ error: "Failed to fetch table columns" });
    }
  });

  // Create a column for a table - with validation
  app.post("/api/dev-projects/:projectId/database/tables/:tableId/columns", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      const project = await storage.getDevProject(req.params.projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      if (project.userId && project.userId !== userId && req.session.user?.role !== 'owner') {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Validate input - sanitize column name
      const columnName = (req.body.columnName || "").toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 64);
      if (!columnName || columnName.length < 1) {
        return res.status(400).json({ error: "Invalid column name" });
      }
      
      // Validate data type
      const validDataTypes = ["text", "varchar", "integer", "boolean", "timestamp", "jsonb", "decimal", "date", "time", "uuid", "array"];
      const dataType = validDataTypes.includes(req.body.dataType) ? req.body.dataType : "text";
      
      const columnData = {
        columnName,
        columnNameDisplay: (req.body.columnNameDisplay || columnName).slice(0, 100),
        columnNameDisplayAr: (req.body.columnNameDisplayAr || "").slice(0, 100),
        dataType,
        isNullable: Boolean(req.body.isNullable ?? true),
        isUnique: Boolean(req.body.isUnique ?? false),
        defaultValue: (req.body.defaultValue || "").slice(0, 255),
        displayOrder: typeof req.body.displayOrder === "number" ? req.body.displayOrder : 0,
        isVisible: Boolean(req.body.isVisible ?? true),
        isSearchable: Boolean(req.body.isSearchable ?? false),
        isFilterable: Boolean(req.body.isFilterable ?? false),
        tableId: req.params.tableId,
        projectId: req.params.projectId,
      };
      
      const column = await storage.createDevDatabaseColumn(columnData);
      res.status(201).json(column);
    } catch (error) {
      console.error("Error creating column:", error);
      res.status(500).json({ error: "Failed to create column" });
    }
  });

  // Update a column
  app.patch("/api/dev-projects/:projectId/database/columns/:columnId", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      const project = await storage.getDevProject(req.params.projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      if (project.userId && project.userId !== userId && req.session.user?.role !== 'owner') {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const updated = await storage.updateDevDatabaseColumn(req.params.columnId, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating column:", error);
      res.status(500).json({ error: "Failed to update column" });
    }
  });

  // Delete a column
  app.delete("/api/dev-projects/:projectId/database/columns/:columnId", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      const project = await storage.getDevProject(req.params.projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      if (project.userId && project.userId !== userId && req.session.user?.role !== 'owner') {
        return res.status(403).json({ error: "Access denied" });
      }
      
      await storage.deleteDevDatabaseColumn(req.params.columnId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting column:", error);
      res.status(500).json({ error: "Failed to delete column" });
    }
  });

  // Get relationships for a project
  app.get("/api/dev-projects/:projectId/database/relationships", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      const project = await storage.getDevProject(req.params.projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      if (project.userId && project.userId !== userId && req.session.user?.role !== 'owner') {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const relationships = await storage.getDevDatabaseRelationships(req.params.projectId);
      res.json(relationships);
    } catch (error) {
      console.error("Error fetching relationships:", error);
      res.status(500).json({ error: "Failed to fetch relationships" });
    }
  });

  // Create a relationship - with validation
  app.post("/api/dev-projects/:projectId/database/relationships", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      const project = await storage.getDevProject(req.params.projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      if (project.userId && project.userId !== userId && req.session.user?.role !== 'owner') {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Validate relationship type
      const validRelTypes = ["one_to_one", "one_to_many", "many_to_many"];
      if (!validRelTypes.includes(req.body.relationshipType)) {
        return res.status(400).json({ error: "Invalid relationship type" });
      }
      
      // Validate table IDs exist
      if (!req.body.sourceTableId || !req.body.targetTableId) {
        return res.status(400).json({ error: "Source and target table IDs are required" });
      }
      
      const relationshipName = (req.body.relationshipName || "").toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 64) || "relationship";
      
      const relData = {
        relationshipName,
        relationshipType: req.body.relationshipType,
        sourceTableId: req.body.sourceTableId,
        targetTableId: req.body.targetTableId,
        sourceColumnId: req.body.sourceColumnId || null,
        targetColumnId: req.body.targetColumnId || null,
        onDelete: ["cascade", "set_null", "restrict", "no_action"].includes(req.body.onDelete) ? req.body.onDelete : "cascade",
        onUpdate: ["cascade", "set_null", "restrict", "no_action"].includes(req.body.onUpdate) ? req.body.onUpdate : "cascade",
        projectId: req.params.projectId,
      };
      
      const relationship = await storage.createDevDatabaseRelationship(relData);
      res.status(201).json(relationship);
    } catch (error) {
      console.error("Error creating relationship:", error);
      res.status(500).json({ error: "Failed to create relationship" });
    }
  });

  // Delete a relationship
  app.delete("/api/dev-projects/:projectId/database/relationships/:relationshipId", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      const project = await storage.getDevProject(req.params.projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      if (project.userId && project.userId !== userId && req.session.user?.role !== 'owner') {
        return res.status(403).json({ error: "Access denied" });
      }
      
      await storage.deleteDevDatabaseRelationship(req.params.relationshipId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting relationship:", error);
      res.status(500).json({ error: "Failed to delete relationship" });
    }
  });

  // Generate API code from database schema
  app.post("/api/dev-projects/:projectId/database/generate-api", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user?.id;
      const project = await storage.getDevProject(req.params.projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      if (project.userId && project.userId !== userId && req.session.user?.role !== 'owner') {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Get all tables and columns for the project
      const tables = await storage.getDevDatabaseTables(req.params.projectId);
      const tablesWithColumns = await Promise.all(
        tables.map(async (table) => {
          const columns = await storage.getDevDatabaseColumns(table.id);
          return { ...table, columns };
        })
      );
      
      const relationships = await storage.getDevDatabaseRelationships(req.params.projectId);
      
      // Generate Drizzle schema code
      let schemaCode = `// Auto-generated schema by INFERA WebNova\n`;
      schemaCode += `import { pgTable, varchar, text, integer, boolean, timestamp, jsonb, decimal, date, time, serial, uuid } from 'drizzle-orm/pg-core';\n`;
      schemaCode += `import { sql } from 'drizzle-orm';\n\n`;
      
      for (const table of tablesWithColumns) {
        schemaCode += `export const ${table.tableName} = pgTable("${table.tableName}", {\n`;
        
        // Add primary key
        if (table.hasPrimaryKey) {
          if (table.primaryKeyType === 'serial') {
            schemaCode += `  id: serial("id").primaryKey(),\n`;
          } else {
            schemaCode += `  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),\n`;
          }
        }
        
        // Add columns
        for (const col of table.columns) {
          let colDef = `  ${col.columnName}: `;
          
          switch (col.dataType) {
            case 'text':
              colDef += `text("${col.columnName}")`;
              break;
            case 'varchar':
              colDef += `varchar("${col.columnName}")`;
              break;
            case 'integer':
              colDef += `integer("${col.columnName}")`;
              break;
            case 'boolean':
              colDef += `boolean("${col.columnName}")`;
              break;
            case 'timestamp':
              colDef += `timestamp("${col.columnName}")`;
              break;
            case 'jsonb':
              colDef += `jsonb("${col.columnName}")`;
              break;
            case 'decimal':
              colDef += `decimal("${col.columnName}")`;
              break;
            case 'date':
              colDef += `date("${col.columnName}")`;
              break;
            case 'time':
              colDef += `time("${col.columnName}")`;
              break;
            default:
              colDef += `text("${col.columnName}")`;
          }
          
          if (!col.isNullable) {
            colDef += `.notNull()`;
          }
          if (col.isUnique) {
            colDef += `.unique()`;
          }
          if (col.defaultValue) {
            colDef += `.default(${col.defaultValue})`;
          }
          
          schemaCode += colDef + `,\n`;
        }
        
        // Add timestamps if enabled
        if (table.hasTimestamps) {
          schemaCode += `  createdAt: timestamp("created_at").defaultNow(),\n`;
          schemaCode += `  updatedAt: timestamp("updated_at").defaultNow(),\n`;
        }
        
        schemaCode += `});\n\n`;
      }
      
      // Generate Express routes
      let routesCode = `// Auto-generated CRUD API by INFERA WebNova\n`;
      routesCode += `import express from 'express';\n`;
      routesCode += `import { db } from './db';\n`;
      routesCode += `import { eq } from 'drizzle-orm';\n`;
      
      for (const table of tablesWithColumns) {
        routesCode += `import { ${table.tableName} } from './schema';\n`;
      }
      
      routesCode += `\nconst router = express.Router();\n\n`;
      
      for (const table of tablesWithColumns) {
        const apiPath = table.apiPrefix || '/api';
        const endpoint = `${apiPath}/${table.tableName}`;
        
        // GET all
        routesCode += `// ${table.tableNameDisplay || table.tableName} CRUD\n`;
        routesCode += `router.get('${endpoint}', async (req, res) => {\n`;
        routesCode += `  const items = await db.select().from(${table.tableName});\n`;
        routesCode += `  res.json(items);\n`;
        routesCode += `});\n\n`;
        
        // GET one
        routesCode += `router.get('${endpoint}/:id', async (req, res) => {\n`;
        routesCode += `  const [item] = await db.select().from(${table.tableName}).where(eq(${table.tableName}.id, req.params.id));\n`;
        routesCode += `  if (!item) return res.status(404).json({ error: 'Not found' });\n`;
        routesCode += `  res.json(item);\n`;
        routesCode += `});\n\n`;
        
        // POST
        routesCode += `router.post('${endpoint}', async (req, res) => {\n`;
        routesCode += `  const [created] = await db.insert(${table.tableName}).values(req.body).returning();\n`;
        routesCode += `  res.status(201).json(created);\n`;
        routesCode += `});\n\n`;
        
        // PATCH
        routesCode += `router.patch('${endpoint}/:id', async (req, res) => {\n`;
        routesCode += `  const [updated] = await db.update(${table.tableName}).set(req.body).where(eq(${table.tableName}.id, req.params.id)).returning();\n`;
        routesCode += `  if (!updated) return res.status(404).json({ error: 'Not found' });\n`;
        routesCode += `  res.json(updated);\n`;
        routesCode += `});\n\n`;
        
        // DELETE
        routesCode += `router.delete('${endpoint}/:id', async (req, res) => {\n`;
        routesCode += `  await db.delete(${table.tableName}).where(eq(${table.tableName}.id, req.params.id));\n`;
        routesCode += `  res.json({ success: true });\n`;
        routesCode += `});\n\n`;
      }
      
      routesCode += `export default router;\n`;
      
      res.json({
        schemaCode,
        routesCode,
        tables: tablesWithColumns,
        relationships,
      });
    } catch (error) {
      console.error("Error generating API:", error);
      res.status(500).json({ error: "Failed to generate API" });
    }
  });

  return httpServer;
}

// Helper function to escape HTML
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Helper function to get file type from extension
function getFileType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const typeMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    html: 'html',
    css: 'css',
    scss: 'scss',
    json: 'json',
    md: 'markdown',
    sql: 'sql',
    sh: 'shell',
    yml: 'yaml',
    yaml: 'yaml',
  };
  return typeMap[ext] || 'text';
}

// Helper function to get default project files
function getDefaultProjectFiles(projectType: string, projectId: string) {
  const files: any[] = [];
  
  if (projectType === 'nodejs') {
    files.push(
      { projectId, fileName: 'index.js', filePath: '/index.js', fileType: 'javascript', content: `// INFERA WebNova - Node.js Project\nconsole.log('Hello from INFERA WebNova!');\n\nconst http = require('http');\n\nconst server = http.createServer((req, res) => {\n  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });\n  res.end('<h1>مرحباً من INFERA WebNova!</h1>');\n});\n\nserver.listen(3000, () => {\n  console.log('Server running on port 3000');\n});`, isDirectory: false },
      { projectId, fileName: 'package.json', filePath: '/package.json', fileType: 'json', content: `{\n  "name": "my-project",\n  "version": "1.0.0",\n  "main": "index.js",\n  "scripts": {\n    "start": "node index.js"\n  }\n}`, isDirectory: false },
    );
  } else if (projectType === 'html') {
    files.push(
      { projectId, fileName: 'index.html', filePath: '/index.html', fileType: 'html', content: `<!DOCTYPE html>\n<html lang="ar" dir="rtl">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>INFERA WebNova</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>مرحباً بك في INFERA WebNova</h1>\n  <p>ابدأ بناء موقعك الآن!</p>\n  <script src="script.js"></script>\n</body>\n</html>`, isDirectory: false },
      { projectId, fileName: 'style.css', filePath: '/style.css', fileType: 'css', content: `* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}\n\nbody {\n  font-family: 'Segoe UI', Tahoma, sans-serif;\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  min-height: 100vh;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  color: white;\n}\n\nh1 {\n  font-size: 3rem;\n  margin-bottom: 1rem;\n}`, isDirectory: false },
      { projectId, fileName: 'script.js', filePath: '/script.js', fileType: 'javascript', content: `// INFERA WebNova - JavaScript\nconsole.log('مرحباً من INFERA WebNova!');`, isDirectory: false },
    );
  } else if (projectType === 'python') {
    files.push(
      { projectId, fileName: 'main.py', filePath: '/main.py', fileType: 'python', content: `# INFERA WebNova - Python Project\nprint("مرحباً من INFERA WebNova!")\n\nfrom http.server import HTTPServer, SimpleHTTPRequestHandler\n\nclass Handler(SimpleHTTPRequestHandler):\n    def do_GET(self):\n        self.send_response(200)\n        self.send_header('Content-type', 'text/html; charset=utf-8')\n        self.end_headers()\n        self.wfile.write('<h1>مرحباً من INFERA WebNova!</h1>'.encode())\n\nif __name__ == '__main__':\n    server = HTTPServer(('0.0.0.0', 3000), Handler)\n    print('Server running on port 3000')\n    server.serve_forever()`, isDirectory: false },
      { projectId, fileName: 'requirements.txt', filePath: '/requirements.txt', fileType: 'text', content: `# Python dependencies`, isDirectory: false },
    );
  } else if (projectType === 'react') {
    files.push(
      { projectId, fileName: 'src', filePath: '/src', fileType: 'folder', content: '', isDirectory: true },
      { projectId, fileName: 'App.jsx', filePath: '/src/App.jsx', fileType: 'javascript', content: `import { useState } from 'react';\n\nfunction App() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div className="app">\n      <h1>مرحباً بك في INFERA WebNova</h1>\n      <p>عداد: {count}</p>\n      <button onClick={() => setCount(c => c + 1)}>زيادة</button>\n    </div>\n  );\n}\n\nexport default App;`, isDirectory: false },
      { projectId, fileName: 'main.jsx', filePath: '/src/main.jsx', fileType: 'javascript', content: `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\nimport './index.css';\n\nReactDOM.createRoot(document.getElementById('root')).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);`, isDirectory: false },
      { projectId, fileName: 'index.css', filePath: '/src/index.css', fileType: 'css', content: `* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}\n\n.app {\n  font-family: 'Segoe UI', sans-serif;\n  text-align: center;\n  padding: 2rem;\n}\n\nbutton {\n  padding: 0.5rem 1rem;\n  font-size: 1rem;\n  cursor: pointer;\n}`, isDirectory: false },
      { projectId, fileName: 'package.json', filePath: '/package.json', fileType: 'json', content: `{\n  "name": "react-app",\n  "version": "1.0.0",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build"\n  },\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0"\n  },\n  "devDependencies": {\n    "vite": "^4.0.0",\n    "@vitejs/plugin-react": "^4.0.0"\n  }\n}`, isDirectory: false },
    );
  }
  
  return files;
}
