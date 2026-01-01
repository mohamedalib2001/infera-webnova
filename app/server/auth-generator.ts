import { GeneratedFile } from "./full-stack-generator";
import crypto from "crypto";

export interface AuthConfig {
  authType: "jwt" | "session" | "both";
  providers: ("local" | "google" | "github" | "oauth2")[];
  roleBasedAccess: boolean;
  roles?: string[];
  twoFactorAuth?: boolean;
  passwordPolicy?: {
    minLength: number;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
  };
}

export interface GeneratedAuthSystem {
  files: GeneratedFile[];
  envVariables: Record<string, string>;
  documentation: {
    ar: string;
    en: string;
  };
}

export class AuthSystemGenerator {
  
  generateAuthSystem(config: AuthConfig): GeneratedAuthSystem {
    const files: GeneratedFile[] = [];
    
    files.push(this.generateUserSchema(config));
    files.push(this.generateAuthMiddleware(config));
    files.push(this.generateAuthRoutes(config));
    files.push(this.generateAuthService(config));
    
    if (config.authType === "jwt" || config.authType === "both") {
      files.push(this.generateJwtUtils());
    }
    
    files.push(this.generateLoginPage(config));
    files.push(this.generateRegisterPage(config));
    files.push(this.generateAuthContext());
    
    if (config.roleBasedAccess) {
      files.push(this.generateRoleGuard(config));
    }
    
    if (config.twoFactorAuth) {
      files.push(this.generate2FAComponent());
    }

    return {
      files,
      envVariables: this.getRequiredEnvVariables(config),
      documentation: this.generateAuthDocumentation(config),
    };
  }

  private generateUserSchema(config: AuthConfig): GeneratedFile {
    const roles = config.roles?.length ? config.roles : ["user", "admin"];
    
    return {
      path: "src/db/auth-schema.ts",
      content: `import { pgTable, varchar, text, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { randomUUID } from "crypto";

export const userRoleEnum = pgEnum("user_role", [${roles.map(r => `"${r}"`).join(", ")}]);

export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  email: varchar("email", { length: 255 }).notNull().unique(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default("user"),
  isActive: boolean("is_active").notNull().default(true),
  isVerified: boolean("is_verified").notNull().default(false),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  avatar: text("avatar"),
  phone: varchar("phone", { length: 20 }),
  ${config.twoFactorAuth ? 'twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),' : ''}
  ${config.twoFactorAuth ? 'twoFactorSecret: text("two_factor_secret"),' : ''}
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address", { length: 45 }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const passwordResets = pgTable("password_resets", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true,
});

export const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح / Invalid email"),
  password: z.string().min(${config.passwordPolicy?.minLength || 8}, "كلمة المرور قصيرة جداً / Password too short"),
});

export const registerSchema = insertUserSchema.extend({
  password: z.string()
    .min(${config.passwordPolicy?.minLength || 8}, "كلمة المرور يجب أن تكون ${config.passwordPolicy?.minLength || 8} أحرف على الأقل")
    ${config.passwordPolicy?.requireUppercase ? '.regex(/[A-Z]/, "يجب أن تحتوي على حرف كبير")' : ''}
    ${config.passwordPolicy?.requireNumbers ? '.regex(/[0-9]/, "يجب أن تحتوي على رقم")' : ''}
    ${config.passwordPolicy?.requireSymbols ? '.regex(/[!@#$%^&*]/, "يجب أن تحتوي على رمز خاص")' : ''},
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة / Passwords don't match",
  path: ["confirmPassword"],
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type Session = typeof sessions.$inferSelect;
`,
      type: "schema",
      language: "ts",
    };
  }

  private generateAuthMiddleware(config: AuthConfig): GeneratedFile {
    return {
      path: "src/server/auth-middleware.ts",
      content: `import { Request, Response, NextFunction } from "express";
import { verifyToken } from "./jwt-utils";
import { authService } from "./auth-service";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
        role: string;
      };
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    ${config.authType === "jwt" || config.authType === "both" ? `
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const payload = verifyToken(token);
      if (payload) {
        req.user = payload;
        return next();
      }
    }` : ''}
    
    ${config.authType === "session" || config.authType === "both" ? `
    if (req.session?.userId) {
      const user = await authService.getUserById(req.session.userId);
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        };
        return next();
      }
    }` : ''}

    return res.status(401).json({
      error: "غير مصرح / Unauthorized",
      messageAr: "يجب تسجيل الدخول للوصول إلى هذا المورد",
      messageEn: "You must be logged in to access this resource",
    });
  } catch (error) {
    return res.status(401).json({
      error: "خطأ في المصادقة / Authentication error",
    });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "غير مصرح / Unauthorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "غير مسموح / Forbidden",
        messageAr: "ليس لديك صلاحية للوصول إلى هذا المورد",
        messageEn: "You don't have permission to access this resource",
      });
    }

    next();
  };
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    if (payload) {
      req.user = payload;
    }
  }
  next();
}
`,
      type: "util",
      language: "ts",
    };
  }

  private generateAuthRoutes(config: AuthConfig): GeneratedFile {
    return {
      path: "src/server/auth-routes.ts",
      content: `import { Express, Request, Response } from "express";
import { authService } from "./auth-service";
import { authMiddleware, requireRole } from "./auth-middleware";
import { loginSchema, registerSchema } from "../db/auth-schema";
import { z } from "zod";

export function registerAuthRoutes(app: Express) {
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      const result = await authService.register(validatedData);
      
      if (!result.success) {
        return res.status(400).json({
          error: result.error,
          messageAr: result.messageAr,
          messageEn: result.messageEn,
        });
      }

      res.status(201).json({
        success: true,
        user: result.user,
        ${config.authType === "jwt" || config.authType === "both" ? 'token: result.token,' : ''}
        messageAr: "تم إنشاء الحساب بنجاح",
        messageEn: "Account created successfully",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "خطأ في البيانات / Validation error",
          details: error.errors,
        });
      }
      console.error("[Auth] Register error:", error);
      res.status(500).json({ error: "خطأ في الخادم / Server error" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await authService.login(validatedData.email, validatedData.password);
      
      if (!result.success) {
        return res.status(401).json({
          error: result.error,
          messageAr: result.messageAr,
          messageEn: result.messageEn,
        });
      }

      ${config.authType === "session" || config.authType === "both" ? `
      req.session.userId = result.user!.id;
      ` : ''}

      res.json({
        success: true,
        user: result.user,
        ${config.authType === "jwt" || config.authType === "both" ? 'token: result.token,' : ''}
        messageAr: "تم تسجيل الدخول بنجاح",
        messageEn: "Logged in successfully",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "بيانات غير صحيحة / Invalid data",
          details: error.errors,
        });
      }
      console.error("[Auth] Login error:", error);
      res.status(500).json({ error: "خطأ في الخادم / Server error" });
    }
  });

  app.post("/api/auth/logout", authMiddleware, async (req: Request, res: Response) => {
    try {
      ${config.authType === "session" || config.authType === "both" ? `
      req.session.destroy((err) => {
        if (err) {
          console.error("[Auth] Logout error:", err);
        }
      });
      ` : ''}
      
      await authService.logout(req.user!.id);
      
      res.json({
        success: true,
        messageAr: "تم تسجيل الخروج بنجاح",
        messageEn: "Logged out successfully",
      });
    } catch (error) {
      console.error("[Auth] Logout error:", error);
      res.status(500).json({ error: "خطأ في الخادم / Server error" });
    }
  });

  app.get("/api/auth/me", authMiddleware, async (req: Request, res: Response) => {
    try {
      const user = await authService.getUserById(req.user!.id);
      if (!user) {
        return res.status(404).json({ error: "المستخدم غير موجود / User not found" });
      }
      
      const { password, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (error) {
      console.error("[Auth] Get user error:", error);
      res.status(500).json({ error: "خطأ في الخادم / Server error" });
    }
  });

  app.put("/api/auth/profile", authMiddleware, async (req: Request, res: Response) => {
    try {
      const updatedUser = await authService.updateProfile(req.user!.id, req.body);
      res.json({
        success: true,
        user: updatedUser,
        messageAr: "تم تحديث الملف الشخصي",
        messageEn: "Profile updated successfully",
      });
    } catch (error) {
      console.error("[Auth] Update profile error:", error);
      res.status(500).json({ error: "خطأ في الخادم / Server error" });
    }
  });

  app.post("/api/auth/change-password", authMiddleware, async (req: Request, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await authService.changePassword(req.user!.id, currentPassword, newPassword);
      
      if (!result.success) {
        return res.status(400).json({
          error: result.error,
          messageAr: result.messageAr,
          messageEn: result.messageEn,
        });
      }
      
      res.json({
        success: true,
        messageAr: "تم تغيير كلمة المرور",
        messageEn: "Password changed successfully",
      });
    } catch (error) {
      console.error("[Auth] Change password error:", error);
      res.status(500).json({ error: "خطأ في الخادم / Server error" });
    }
  });

  app.post("/api/auth/forgot-password", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      await authService.sendPasswordResetEmail(email);
      
      res.json({
        success: true,
        messageAr: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني",
        messageEn: "Password reset link sent to your email",
      });
    } catch (error) {
      console.error("[Auth] Forgot password error:", error);
      res.json({
        success: true,
        messageAr: "إذا كان البريد مسجلاً، سيتم إرسال رابط إعادة التعيين",
        messageEn: "If the email exists, a reset link will be sent",
      });
    }
  });

  ${config.roleBasedAccess ? `
  app.get("/api/admin/users", authMiddleware, requireRole("admin"), async (req: Request, res: Response) => {
    try {
      const users = await authService.getAllUsers();
      res.json({ users });
    } catch (error) {
      console.error("[Admin] Get users error:", error);
      res.status(500).json({ error: "خطأ في الخادم / Server error" });
    }
  });

  app.put("/api/admin/users/:id/role", authMiddleware, requireRole("admin"), async (req: Request, res: Response) => {
    try {
      const { role } = req.body;
      const updatedUser = await authService.updateUserRole(req.params.id, role);
      res.json({
        success: true,
        user: updatedUser,
        messageAr: "تم تحديث صلاحية المستخدم",
        messageEn: "User role updated",
      });
    } catch (error) {
      console.error("[Admin] Update role error:", error);
      res.status(500).json({ error: "خطأ في الخادم / Server error" });
    }
  });

  app.delete("/api/admin/users/:id", authMiddleware, requireRole("admin"), async (req: Request, res: Response) => {
    try {
      await authService.deleteUser(req.params.id);
      res.json({
        success: true,
        messageAr: "تم حذف المستخدم",
        messageEn: "User deleted",
      });
    } catch (error) {
      console.error("[Admin] Delete user error:", error);
      res.status(500).json({ error: "خطأ في الخادم / Server error" });
    }
  });
  ` : ''}
}
`,
      type: "route",
      language: "ts",
    };
  }

  private generateAuthService(config: AuthConfig): GeneratedFile {
    return {
      path: "src/server/auth-service.ts",
      content: `import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { User, InsertUser, RegisterInput } from "../db/auth-schema";
${config.authType === "jwt" || config.authType === "both" ? 'import { generateToken } from "./jwt-utils";' : ''}

interface AuthResult {
  success: boolean;
  user?: Omit<User, "password">;
  token?: string;
  error?: string;
  messageAr?: string;
  messageEn?: string;
}

class AuthService {
  private users = new Map<string, User>();
  private sessions = new Map<string, { userId: string; expiresAt: Date }>();
  private passwordResets = new Map<string, { userId: string; expiresAt: Date; used: boolean }>();

  async register(data: RegisterInput): Promise<AuthResult> {
    const existingEmail = Array.from(this.users.values()).find(u => u.email === data.email);
    if (existingEmail) {
      return {
        success: false,
        error: "البريد الإلكتروني مستخدم / Email already exists",
        messageAr: "البريد الإلكتروني مستخدم بالفعل",
        messageEn: "Email is already registered",
      };
    }

    const existingUsername = Array.from(this.users.values()).find(u => u.username === data.username);
    if (existingUsername) {
      return {
        success: false,
        error: "اسم المستخدم مستخدم / Username already exists",
        messageAr: "اسم المستخدم مستخدم بالفعل",
        messageEn: "Username is already taken",
      };
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    
    const user: User = {
      id: randomUUID(),
      email: data.email,
      username: data.username,
      password: hashedPassword,
      role: "user",
      isActive: true,
      isVerified: false,
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      avatar: null,
      phone: null,
      lastLogin: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(user.id, user);

    const { password, ...safeUser } = user;
    
    ${config.authType === "jwt" || config.authType === "both" ? `
    const token = generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });
    
    return { success: true, user: safeUser, token };
    ` : 'return { success: true, user: safeUser };'}
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const user = Array.from(this.users.values()).find(u => u.email === email);
    
    if (!user) {
      return {
        success: false,
        error: "بيانات غير صحيحة / Invalid credentials",
        messageAr: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
        messageEn: "Invalid email or password",
      };
    }

    if (!user.isActive) {
      return {
        success: false,
        error: "الحساب معطل / Account disabled",
        messageAr: "حسابك معطل، تواصل مع الدعم",
        messageEn: "Your account is disabled, contact support",
      };
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return {
        success: false,
        error: "بيانات غير صحيحة / Invalid credentials",
        messageAr: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
        messageEn: "Invalid email or password",
      };
    }

    user.lastLogin = new Date();
    this.users.set(user.id, user);

    const { password: _, ...safeUser } = user;
    
    ${config.authType === "jwt" || config.authType === "both" ? `
    const token = generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });
    
    return { success: true, user: safeUser, token };
    ` : 'return { success: true, user: safeUser };'}
  }

  async logout(userId: string): Promise<void> {
    const sessionsToDelete = Array.from(this.sessions.entries())
      .filter(([_, session]) => session.userId === userId)
      .map(([id]) => id);
    
    sessionsToDelete.forEach(id => this.sessions.delete(id));
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async updateProfile(userId: string, data: Partial<User>): Promise<Omit<User, "password"> | null> {
    const user = this.users.get(userId);
    if (!user) return null;

    const updatedUser = {
      ...user,
      ...data,
      password: user.password,
      updatedAt: new Date(),
    };

    this.users.set(userId, updatedUser);
    
    const { password, ...safeUser } = updatedUser;
    return safeUser;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<AuthResult> {
    const user = this.users.get(userId);
    if (!user) {
      return {
        success: false,
        error: "المستخدم غير موجود / User not found",
      };
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return {
        success: false,
        error: "كلمة المرور الحالية غير صحيحة / Current password is incorrect",
        messageAr: "كلمة المرور الحالية غير صحيحة",
        messageEn: "Current password is incorrect",
      };
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.updatedAt = new Date();
    this.users.set(userId, user);

    return { success: true };
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    const user = Array.from(this.users.values()).find(u => u.email === email);
    if (!user) return;

    const token = randomUUID();
    this.passwordResets.set(token, {
      userId: user.id,
      expiresAt: new Date(Date.now() + 3600000),
      used: false,
    });

    console.log("[Auth] Password reset token generated for:", email, "Token:", token);
  }

  async getAllUsers(): Promise<Omit<User, "password">[]> {
    return Array.from(this.users.values()).map(({ password, ...user }) => user);
  }

  async updateUserRole(userId: string, role: string): Promise<Omit<User, "password"> | null> {
    const user = this.users.get(userId);
    if (!user) return null;

    user.role = role as any;
    user.updatedAt = new Date();
    this.users.set(userId, user);

    const { password, ...safeUser } = user;
    return safeUser;
  }

  async deleteUser(userId: string): Promise<boolean> {
    return this.users.delete(userId);
  }
}

export const authService = new AuthService();
`,
      type: "util",
      language: "ts",
    };
  }

  private generateJwtUtils(): GeneratedFile {
    return {
      path: "src/server/jwt-utils.ts",
      content: `import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";

export interface TokenPayload {
  id: string;
  email: string;
  username: string;
  role: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch (error) {
    return null;
  }
}
`,
      type: "util",
      language: "ts",
    };
  }

  private generateLoginPage(config: AuthConfig): GeneratedFile {
    return {
      path: "src/client/pages/login.tsx",
      content: `import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح / Invalid email"),
  password: z.string().min(1, "كلمة المرور مطلوبة / Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.messageEn || error.error);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      login(data.user, data.token);
      toast({
        title: "مرحباً بك / Welcome back",
        description: data.messageAr,
      });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في تسجيل الدخول / Login Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">تسجيل الدخول</CardTitle>
          <CardDescription>Login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني / Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          type="email"
                          placeholder="example@domain.com"
                          className="pr-10"
                          data-testid="input-email"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>كلمة المرور / Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pr-10 pl-10"
                          data-testid="input-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute left-1 top-1 h-7 w-7"
                          onClick={() => setShowPassword(!showPassword)}
                          data-testid="button-toggle-password"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between items-center text-sm">
                <Link href="/forgot-password" className="text-primary hover:underline" data-testid="link-forgot-password">
                  نسيت كلمة المرور؟
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري تسجيل الدخول...
                  </>
                ) : (
                  "تسجيل الدخول / Login"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            ليس لديك حساب؟{" "}
            <Link href="/register" className="text-primary hover:underline" data-testid="link-register">
              إنشاء حساب جديد
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
`,
      type: "page",
      language: "tsx",
    };
  }

  private generateRegisterPage(config: AuthConfig): GeneratedFile {
    return {
      path: "src/client/pages/register.tsx",
      content: `import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

const registerSchema = z.object({
  username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(${config.passwordPolicy?.minLength || 8}, "كلمة المرور يجب أن تكون ${config.passwordPolicy?.minLength || 8} أحرف على الأقل"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterForm) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.messageEn || error.error);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      login(data.user, data.token);
      toast({
        title: "تم إنشاء الحساب / Account Created",
        description: data.messageAr,
      });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في إنشاء الحساب / Registration Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterForm) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">إنشاء حساب جديد</CardTitle>
          <CardDescription>Create a new account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم المستخدم / Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          placeholder="اسم المستخدم"
                          className="pr-10"
                          data-testid="input-username"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني / Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          type="email"
                          placeholder="example@domain.com"
                          className="pr-10"
                          data-testid="input-email"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>كلمة المرور / Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pr-10 pl-10"
                          data-testid="input-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute left-1 top-1 h-7 w-7"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تأكيد كلمة المرور / Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pr-10"
                          data-testid="input-confirm-password"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={registerMutation.isPending}
                data-testid="button-register"
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري إنشاء الحساب...
                  </>
                ) : (
                  "إنشاء حساب / Register"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            لديك حساب بالفعل؟{" "}
            <Link href="/login" className="text-primary hover:underline" data-testid="link-login">
              تسجيل الدخول
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
`,
      type: "page",
      language: "tsx",
    };
  }

  private generateAuthContext(): GeneratedFile {
    return {
      path: "src/client/contexts/auth-context.tsx",
      content: `import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token?: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = (user: User, token?: string) => {
    setUser(user);
    if (token) {
      setToken(token);
      localStorage.setItem("auth_token", token);
    }
    localStorage.setItem("auth_user", JSON.stringify(user));
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: token ? { Authorization: \`Bearer \${token}\` } : {},
      });
    } catch (error) {
      console.error("Logout error:", error);
    }

    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem("auth_user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
`,
      type: "util",
      language: "tsx",
    };
  }

  private generateRoleGuard(config: AuthConfig): GeneratedFile {
    return {
      path: "src/client/components/role-guard.tsx",
      content: `import { ReactNode } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Redirect } from "wouter";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: ReactNode;
  redirectTo?: string;
}

export function RoleGuard({ children, allowedRoles, fallback, redirectTo = "/unauthorized" }: RoleGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Redirect to={redirectTo} />;
  }

  return <>{children}</>;
}

interface AuthGuardProps {
  children: ReactNode;
  redirectTo?: string;
}

export function AuthGuard({ children, redirectTo = "/login" }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to={redirectTo} />;
  }

  return <>{children}</>;
}
`,
      type: "component",
      language: "tsx",
    };
  }

  private generate2FAComponent(): GeneratedFile {
    return {
      path: "src/client/components/two-factor-auth.tsx",
      content: `import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield, Smartphone } from "lucide-react";

interface TwoFactorAuthProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function TwoFactorAuth({ onSuccess, onCancel }: TwoFactorAuthProps) {
  const [code, setCode] = useState("");
  const { toast } = useToast();

  const verifyMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.messageEn || error.error);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم التحقق / Verified",
        description: "تم التحقق من الرمز بنجاح",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في التحقق / Verification Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      verifyMutation.mutate(code);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>التحقق بخطوتين</CardTitle>
        <CardDescription>
          أدخل الرمز من تطبيق المصادقة
          <br />
          Enter the code from your authenticator app
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-muted-foreground" />
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="text-center text-2xl tracking-widest"
              maxLength={6}
              data-testid="input-2fa-code"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onCancel}
              data-testid="button-2fa-cancel"
            >
              إلغاء / Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={code.length !== 6 || verifyMutation.isPending}
              data-testid="button-2fa-verify"
            >
              {verifyMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "تحقق / Verify"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
`,
      type: "component",
      language: "tsx",
    };
  }

  private getRequiredEnvVariables(config: AuthConfig): Record<string, string> {
    const env: Record<string, string> = {
      SESSION_SECRET: "your-session-secret-change-in-production",
    };

    if (config.authType === "jwt" || config.authType === "both") {
      env.JWT_SECRET = "your-jwt-secret-change-in-production";
    }

    if (config.providers.includes("google")) {
      env.GOOGLE_CLIENT_ID = "";
      env.GOOGLE_CLIENT_SECRET = "";
    }

    if (config.providers.includes("github")) {
      env.GITHUB_CLIENT_ID = "";
      env.GITHUB_CLIENT_SECRET = "";
    }

    return env;
  }

  private generateAuthDocumentation(config: AuthConfig): { ar: string; en: string } {
    const ar = `# نظام المصادقة

## نوع المصادقة
${config.authType === "jwt" ? "JWT (JSON Web Tokens)" : config.authType === "session" ? "جلسات الخادم" : "JWT + جلسات"}

## المزودين
${config.providers.map(p => `- ${p}`).join("\n")}

## نقاط النهاية
- POST /api/auth/register - تسجيل حساب جديد
- POST /api/auth/login - تسجيل الدخول
- POST /api/auth/logout - تسجيل الخروج
- GET /api/auth/me - بيانات المستخدم الحالي
- PUT /api/auth/profile - تحديث الملف الشخصي
- POST /api/auth/change-password - تغيير كلمة المرور
${config.roleBasedAccess ? `
## إدارة المستخدمين (للمشرفين)
- GET /api/admin/users - قائمة المستخدمين
- PUT /api/admin/users/:id/role - تغيير صلاحية مستخدم
- DELETE /api/admin/users/:id - حذف مستخدم
` : ""}
`;

    const en = `# Authentication System

## Auth Type
${config.authType === "jwt" ? "JWT (JSON Web Tokens)" : config.authType === "session" ? "Server Sessions" : "JWT + Sessions"}

## Providers
${config.providers.map(p => `- ${p}`).join("\n")}

## Endpoints
- POST /api/auth/register - Register new account
- POST /api/auth/login - Login
- POST /api/auth/logout - Logout
- GET /api/auth/me - Get current user
- PUT /api/auth/profile - Update profile
- POST /api/auth/change-password - Change password
${config.roleBasedAccess ? `
## User Management (Admin only)
- GET /api/admin/users - List users
- PUT /api/admin/users/:id/role - Update user role
- DELETE /api/admin/users/:id - Delete user
` : ""}
`;

    return { ar, en };
  }
}

export const authGenerator = new AuthSystemGenerator();
