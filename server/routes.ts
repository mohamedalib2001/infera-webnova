import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateWebsiteCode, refineWebsiteCode } from "./anthropic";
import { insertProjectSchema, insertMessageSchema, insertProjectVersionSchema, insertShareLinkSchema, insertUserSchema, type User } from "@shared/schema";
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

// Auth middleware
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "يجب تسجيل الدخول أولاً / Authentication required" });
  }
  next();
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
  app.get("/api/auth/me", (req, res) => {
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
      const projects = await storage.getProjects();
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

  // Create project
  app.post("/api/projects", async (req, res) => {
    try {
      const data = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(data);
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

  // Delete project
  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteProject(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Project not found" });
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

  return httpServer;
}
