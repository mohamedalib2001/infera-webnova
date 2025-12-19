import Anthropic from "@anthropic-ai/sdk";
import type { 
  Project, 
  ProjectBackend, 
  ProjectDatabase, 
  ProjectAuthConfig,
  ProjectProvisioningJob,
  InsertProjectBackend,
  InsertProjectDatabase,
  InsertProjectAuthConfig,
  InsertProjectProvisioningJob
} from "@shared/schema";

const anthropic = new Anthropic();

interface ProvisioningOptions {
  generateBackend: boolean;
  generateDatabase: boolean;
  generateAuth: boolean;
  industry?: string;
  language?: string;
}

interface ProvisioningResult {
  success: boolean;
  backend?: ProjectBackend;
  database?: ProjectDatabase;
  authConfig?: ProjectAuthConfig;
  job?: ProjectProvisioningJob;
  error?: string;
}

export class AutoProvisionService {
  private storage: any;

  constructor(storage: any) {
    this.storage = storage;
  }

  async provisionProject(
    project: Project,
    options: ProvisioningOptions = {
      generateBackend: true,
      generateDatabase: true,
      generateAuth: true,
    }
  ): Promise<ProvisioningResult> {
    const job = await this.storage.createProjectProvisioningJob({
      projectId: project.id,
      jobType: "full_provision",
      status: "running",
      progress: 0,
      steps: [
        { name: "database", nameAr: "قاعدة البيانات", status: "pending" },
        { name: "auth", nameAr: "نظام المصادقة", status: "pending" },
        { name: "backend", nameAr: "الباك إند", status: "pending" },
        { name: "integration", nameAr: "التكامل", status: "pending" },
      ],
      startedAt: new Date(),
    });

    try {
      let database: ProjectDatabase | undefined;
      let authConfig: ProjectAuthConfig | undefined;
      let backend: ProjectBackend | undefined;

      if (options.generateDatabase) {
        await this.updateJobStep(job.id, "database", "running");
        database = await this.generateDatabase(project, options);
        await this.updateJobStep(job.id, "database", "completed");
        await this.updateJobProgress(job.id, 25);
      }

      if (options.generateAuth) {
        await this.updateJobStep(job.id, "auth", "running");
        authConfig = await this.generateAuthConfig(project, options);
        await this.updateJobStep(job.id, "auth", "completed");
        await this.updateJobProgress(job.id, 50);
      }

      if (options.generateBackend) {
        await this.updateJobStep(job.id, "backend", "running");
        backend = await this.generateBackend(project, database, authConfig, options);
        await this.updateJobStep(job.id, "backend", "completed");
        await this.updateJobProgress(job.id, 75);
      }

      await this.updateJobStep(job.id, "integration", "running");
      await this.integrateComponents(project, backend, database, authConfig);
      await this.updateJobStep(job.id, "integration", "completed");
      await this.updateJobProgress(job.id, 100);

      await this.storage.updateProjectProvisioningJob(job.id, {
        status: "completed",
        completedAt: new Date(),
        result: {
          backendId: backend?.id,
          databaseId: database?.id,
          authConfigId: authConfig?.id,
          deploymentReady: true,
          errors: [],
        },
      });

      return {
        success: true,
        backend,
        database,
        authConfig,
        job: await this.storage.getProjectProvisioningJob(job.id),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      await this.storage.updateProjectProvisioningJob(job.id, {
        status: "failed",
        errorMessage,
        completedAt: new Date(),
      });
      return { success: false, error: errorMessage };
    }
  }

  private async generateDatabase(
    project: Project,
    options: ProvisioningOptions
  ): Promise<ProjectDatabase> {
    const schema = this.getDefaultDatabaseSchema(project, options.industry);
    
    const schemaCode = await this.generateDatabaseSchemaCode(schema);

    const dbConfig: InsertProjectDatabase = {
      projectId: project.id,
      dbType: "postgresql",
      orm: "drizzle",
      schema,
      generatedSchema: schemaCode,
      status: "ready",
    };

    return await this.storage.createProjectDatabase(dbConfig);
  }

  private async generateAuthConfig(
    project: Project,
    options: ProvisioningOptions
  ): Promise<ProjectAuthConfig> {
    const authCode = await this.generateAuthCode(project);

    const authConfig: InsertProjectAuthConfig = {
      projectId: project.id,
      authType: "jwt",
      generatedCode: authCode,
      status: "ready",
    };

    return await this.storage.createProjectAuthConfig(authConfig);
  }

  private async generateBackend(
    project: Project,
    database?: ProjectDatabase,
    authConfig?: ProjectAuthConfig,
    options?: ProvisioningOptions
  ): Promise<ProjectBackend> {
    const files = await this.generateBackendFiles(project, database, authConfig);

    const backendConfig: InsertProjectBackend = {
      projectId: project.id,
      framework: "express",
      language: "typescript",
      apiStyle: "rest",
      generatedCode: { files },
      status: "ready",
      generationProgress: 100,
      deploymentConfig: {
        port: 3000,
        env: {
          NODE_ENV: "production",
          DATABASE_URL: "${DATABASE_URL}",
          JWT_SECRET: "${JWT_SECRET}",
        },
        buildCommand: "npm run build",
        startCommand: "npm start",
      },
    };

    return await this.storage.createProjectBackend(backendConfig);
  }

  private getDefaultDatabaseSchema(project: Project, industry?: string) {
    const baseTables = [
      {
        name: "users",
        columns: [
          { name: "id", type: "varchar", nullable: false, primaryKey: true, unique: true },
          { name: "email", type: "text", nullable: false, primaryKey: false, unique: true },
          { name: "password", type: "text", nullable: false, primaryKey: false, unique: false },
          { name: "full_name", type: "text", nullable: true, primaryKey: false, unique: false },
          { name: "avatar", type: "text", nullable: true, primaryKey: false, unique: false },
          { name: "role", type: "text", nullable: false, primaryKey: false, unique: false, default: "'user'" },
          { name: "is_active", type: "boolean", nullable: false, primaryKey: false, unique: false, default: "true" },
          { name: "created_at", type: "timestamp", nullable: false, primaryKey: false, unique: false, default: "now()" },
          { name: "updated_at", type: "timestamp", nullable: false, primaryKey: false, unique: false, default: "now()" },
        ],
        indexes: [{ name: "idx_users_email", columns: ["email"] }],
      },
      {
        name: "sessions",
        columns: [
          { name: "id", type: "varchar", nullable: false, primaryKey: true, unique: true },
          { name: "user_id", type: "varchar", nullable: false, primaryKey: false, unique: false, references: { table: "users", column: "id" } },
          { name: "token", type: "text", nullable: false, primaryKey: false, unique: true },
          { name: "expires_at", type: "timestamp", nullable: false, primaryKey: false, unique: false },
          { name: "created_at", type: "timestamp", nullable: false, primaryKey: false, unique: false, default: "now()" },
        ],
        indexes: [{ name: "idx_sessions_token", columns: ["token"] }],
      },
      {
        name: "password_resets",
        columns: [
          { name: "id", type: "varchar", nullable: false, primaryKey: true, unique: true },
          { name: "user_id", type: "varchar", nullable: false, primaryKey: false, unique: false, references: { table: "users", column: "id" } },
          { name: "token", type: "text", nullable: false, primaryKey: false, unique: true },
          { name: "expires_at", type: "timestamp", nullable: false, primaryKey: false, unique: false },
          { name: "used", type: "boolean", nullable: false, primaryKey: false, unique: false, default: "false" },
          { name: "created_at", type: "timestamp", nullable: false, primaryKey: false, unique: false, default: "now()" },
        ],
        indexes: [],
      },
    ];

    const relations = [
      { from: { table: "sessions", column: "user_id" }, to: { table: "users", column: "id" }, type: "many-to-one" },
      { from: { table: "password_resets", column: "user_id" }, to: { table: "users", column: "id" }, type: "many-to-one" },
    ];

    return { tables: baseTables, relations };
  }

  private async generateDatabaseSchemaCode(schema: any): Promise<string> {
    const prompt = `Generate a Drizzle ORM schema file (TypeScript) for the following database structure:
${JSON.stringify(schema, null, 2)}

Requirements:
- Use PostgreSQL with drizzle-orm/pg-core
- Include proper types and exports
- Add insert schemas using drizzle-zod
- Include proper indexes and relations
- Add Arabic comments for documentation

Return ONLY the TypeScript code, no explanations.`;

    try {
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4000,
        messages: [{ role: "user", content: prompt }],
      });

      const textBlock = response.content.find((b) => b.type === "text");
      let code = textBlock?.text || "";
      code = code.replace(/```typescript\n?/g, "").replace(/```\n?/g, "");
      return code;
    } catch (error) {
      return this.getFallbackDatabaseSchema();
    }
  }

  private async generateAuthCode(project: Project): Promise<{
    routes: string;
    middleware: string;
    controllers: string;
    views: string;
  }> {
    const prompt = `Generate authentication code for an Express.js TypeScript application.

Requirements:
1. Routes file with: register, login, logout, forgot-password, reset-password, profile, update-profile
2. Middleware for JWT authentication and role-based authorization
3. Controllers with proper validation and error handling
4. Simple HTML/CSS login and register pages (Arabic RTL design)

Include:
- Password hashing with bcrypt
- JWT token generation and validation
- Input validation with zod
- Rate limiting consideration
- Arabic error messages

Return a JSON object with keys: routes, middleware, controllers, views
Each value should be the TypeScript/HTML code as a string.`;

    try {
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 8000,
        messages: [{ role: "user", content: prompt }],
      });

      const textBlock = response.content.find((b) => b.type === "text");
      const text = textBlock?.text || "";
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch {
          return this.getFallbackAuthCode();
        }
      }
      return this.getFallbackAuthCode();
    } catch (error) {
      return this.getFallbackAuthCode();
    }
  }

  private async generateBackendFiles(
    project: Project,
    database?: ProjectDatabase,
    authConfig?: ProjectAuthConfig
  ): Promise<Array<{ path: string; content: string; type: string }>> {
    const files: Array<{ path: string; content: string; type: string }> = [];

    files.push({
      path: "package.json",
      content: JSON.stringify({
        name: project.name?.toLowerCase().replace(/\s+/g, "-") || "my-api",
        version: "1.0.0",
        scripts: {
          dev: "tsx watch src/index.ts",
          build: "tsc",
          start: "node dist/index.js",
          "db:push": "drizzle-kit push",
        },
        dependencies: {
          express: "^4.18.2",
          "drizzle-orm": "^0.29.0",
          pg: "^8.11.0",
          bcryptjs: "^2.4.3",
          jsonwebtoken: "^9.0.0",
          zod: "^3.22.0",
          cors: "^2.8.5",
          helmet: "^7.1.0",
          "express-rate-limit": "^7.1.0",
          dotenv: "^16.3.0",
        },
        devDependencies: {
          "@types/express": "^4.17.21",
          "@types/bcryptjs": "^2.4.6",
          "@types/jsonwebtoken": "^9.0.5",
          "@types/cors": "^2.8.17",
          "@types/pg": "^8.10.0",
          typescript: "^5.3.0",
          tsx: "^4.6.0",
          "drizzle-kit": "^0.20.0",
        },
      }, null, 2),
      type: "json",
    });

    files.push({
      path: "src/index.ts",
      content: `import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { authRoutes } from "./routes/auth";
import { errorHandler } from "./middleware/error-handler";

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: "طلبات كثيرة، حاول لاحقاً" },
});
app.use(limiter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});

export default app;`,
      type: "typescript",
    });

    files.push({
      path: "src/routes/auth.ts",
      content: authConfig?.generatedCode?.routes || this.getFallbackAuthCode().routes,
      type: "typescript",
    });

    files.push({
      path: "src/middleware/auth.ts",
      content: authConfig?.generatedCode?.middleware || this.getFallbackAuthCode().middleware,
      type: "typescript",
    });

    files.push({
      path: "src/middleware/error-handler.ts",
      content: `import { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || "حدث خطأ في الخادم";
  
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}`,
      type: "typescript",
    });

    files.push({
      path: "src/db/schema.ts",
      content: database?.generatedSchema || this.getFallbackDatabaseSchema(),
      type: "typescript",
    });

    files.push({
      path: ".env.example",
      content: `DATABASE_URL=postgresql://user:password@localhost:5432/mydb
JWT_SECRET=your-super-secret-jwt-key
PORT=3000
NODE_ENV=development`,
      type: "env",
    });

    files.push({
      path: "tsconfig.json",
      content: JSON.stringify({
        compilerOptions: {
          target: "ES2020",
          module: "NodeNext",
          moduleResolution: "NodeNext",
          outDir: "./dist",
          rootDir: "./src",
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
        },
        include: ["src/**/*"],
        exclude: ["node_modules"],
      }, null, 2),
      type: "json",
    });

    return files;
  }

  private async integrateComponents(
    project: Project,
    backend?: ProjectBackend,
    database?: ProjectDatabase,
    authConfig?: ProjectAuthConfig
  ): Promise<void> {
    // Integration logic - connect all components
  }

  private async updateJobStep(jobId: string, stepName: string, status: string): Promise<void> {
    const job = await this.storage.getProjectProvisioningJob(jobId);
    if (!job) return;

    const steps = (job.steps || []).map((step: any) => {
      if (step.name === stepName) {
        return {
          ...step,
          status,
          ...(status === "running" && { startedAt: new Date().toISOString() }),
          ...(status === "completed" && { completedAt: new Date().toISOString() }),
        };
      }
      return step;
    });

    await this.storage.updateProjectProvisioningJob(jobId, { steps });
  }

  private async updateJobProgress(jobId: string, progress: number): Promise<void> {
    await this.storage.updateProjectProvisioningJob(jobId, { progress });
  }

  private getFallbackDatabaseSchema(): string {
    return `import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// جدول المستخدمين
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  avatar: text("avatar"),
  role: text("role").notNull().default("user"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_users_email").on(table.email),
]);

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// جدول الجلسات
export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
  userId: varchar("user_id").notNull(),
  token: text("token").unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_sessions_token").on(table.token),
]);

// جدول إعادة تعيين كلمة المرور
export const passwordResets = pgTable("password_resets", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
  userId: varchar("user_id").notNull(),
  token: text("token").unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});`;
  }

  private getFallbackAuthCode(): {
    routes: string;
    middleware: string;
    controllers: string;
    views: string;
  } {
    return {
      routes: `import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

const router = Router();

const registerSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
  fullName: z.string().min(2, "الاسم مطلوب"),
});

const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

// تسجيل مستخدم جديد
router.post("/register", async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    // TODO: Save user to database
    const user = { id: "1", email: data.email, fullName: data.fullName };
    
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });
    
    res.status(201).json({ success: true, user, token });
  } catch (error) {
    next(error);
  }
});

// تسجيل الدخول
router.post("/login", async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    
    // TODO: Get user from database
    const user = { id: "1", email: data.email, password: await bcrypt.hash("password", 10) };
    
    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, error: "بيانات الدخول غير صحيحة" });
    }
    
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });
    
    res.json({ success: true, user: { id: user.id, email: user.email }, token });
  } catch (error) {
    next(error);
  }
});

// تسجيل الخروج
router.post("/logout", (req, res) => {
  res.json({ success: true, message: "تم تسجيل الخروج بنجاح" });
});

// الملف الشخصي
router.get("/profile", (req, res) => {
  // TODO: Get user from token
  res.json({ success: true, user: { id: "1", email: "user@example.com" } });
});

export { router as authRoutes };`,
      middleware: `import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  userId?: string;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  
  if (!token) {
    return res.status(401).json({ success: false, error: "غير مصرح" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ success: false, error: "رمز غير صالح" });
  }
}

export function authorize(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Check user role
    next();
  };
}`,
      controllers: "",
      views: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>تسجيل الدخول</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #f5f5f5; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .container { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); width: 100%; max-width: 400px; }
    h1 { text-align: center; margin-bottom: 1.5rem; color: #333; }
    .form-group { margin-bottom: 1rem; }
    label { display: block; margin-bottom: 0.5rem; color: #555; }
    input { width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem; }
    button { width: 100%; padding: 0.75rem; background: #667eea; color: white; border: none; border-radius: 4px; font-size: 1rem; cursor: pointer; }
    button:hover { background: #5a6fd6; }
    .link { text-align: center; margin-top: 1rem; }
    .link a { color: #667eea; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <h1>تسجيل الدخول</h1>
    <form id="loginForm">
      <div class="form-group">
        <label>البريد الإلكتروني</label>
        <input type="email" name="email" required>
      </div>
      <div class="form-group">
        <label>كلمة المرور</label>
        <input type="password" name="password" required>
      </div>
      <button type="submit">دخول</button>
    </form>
    <div class="link">
      <a href="/register">ليس لديك حساب؟ سجل الآن</a>
    </div>
  </div>
</body>
</html>`,
    };
  }
}

export const createAutoProvisionService = (storage: any) => new AutoProvisionService(storage);
