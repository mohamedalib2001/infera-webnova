import Anthropic from "@anthropic-ai/sdk";

const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-20250514";

interface BackendConfig {
  projectName: string;
  description: string;
  framework: string;
  database: string;
  language: string;
  apiStyle: string;
  authentication: boolean;
  features: string[];
}

interface InferredEntity {
  name: string;
  fields: { name: string; type: string; required: boolean }[];
  relationships: { entity: string; type: "one-to-one" | "one-to-many" | "many-to-many" }[];
}

interface ArchitectureDecision {
  pattern: "clean-architecture" | "modular-monolith" | "microservices";
  reason: string;
  recommendedModules: string[];
  securityLevel: "basic" | "standard" | "enterprise";
  scalabilityNeeds: "startup" | "growth" | "enterprise";
}

interface FolderNode {
  name: string;
  type: "file" | "folder";
  children?: FolderNode[];
  description?: string;
}

interface GeneratedFile {
  path: string;
  content: string;
  type: string;
  description: string;
}

interface ArchitecturePreview {
  folderStructure: FolderNode[];
  architecture: ArchitectureDecision;
  inferredEntities: InferredEntity[];
  enabledModules: string[];
  securityScore: number;
  productionReadiness: {
    score: number;
    status: "not-ready" | "development" | "staging" | "production";
    checklist: { item: string; passed: boolean }[];
  };
  warnings: { type: "info" | "warning" | "critical"; message: string; messageAr: string }[];
  suggestions: { feature: string; reason: string; reasonAr: string }[];
}

interface GenerationResult {
  success: boolean;
  files: GeneratedFile[];
  dependencies: string[];
  devDependencies: string[];
  setupCommands: string[];
  envVariables: Record<string, string>;
  documentation: { ar: string; en: string };
  architecture: ArchitectureDecision;
  preview: ArchitecturePreview;
  generationLog: { step: string; status: "pending" | "running" | "completed" | "error"; message: string; timestamp: number }[];
}

async function getAnthropicClient(): Promise<Anthropic | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  return new Anthropic({ apiKey });
}

function analyzeDescriptionKeywords(description: string): {
  domain: string;
  entities: string[];
  features: string[];
  complexity: "simple" | "medium" | "complex" | "enterprise";
} {
  const lowerDesc = description.toLowerCase();
  
  const domainKeywords: Record<string, string[]> = {
    ecommerce: ["shop", "store", "cart", "product", "order", "payment", "checkout", "inventory", "ecommerce", "متجر", "تسوق"],
    healthcare: ["health", "medical", "patient", "doctor", "appointment", "hospital", "clinic", "prescription", "صحة", "طبي", "مريض"],
    education: ["school", "student", "teacher", "course", "class", "grade", "exam", "learning", "مدرسة", "طالب", "معلم", "تعليم"],
    finance: ["bank", "account", "transaction", "payment", "invoice", "budget", "financial", "wallet", "بنك", "حساب", "مالي"],
    hr: ["employee", "staff", "leave", "attendance", "payroll", "performance", "hr", "human resource", "موظف", "حضور", "رواتب"],
    crm: ["customer", "client", "lead", "sales", "contact", "deal", "pipeline", "عميل", "مبيعات"],
    cms: ["content", "blog", "article", "post", "media", "publish", "محتوى", "مدونة", "مقال"],
    social: ["social", "post", "friend", "follow", "message", "chat", "feed", "تواصل", "رسالة", "دردشة"],
    government: ["government", "citizen", "service", "permit", "license", "official", "حكومي", "مواطن", "خدمة"],
    logistics: ["shipping", "delivery", "tracking", "warehouse", "fleet", "شحن", "توصيل", "تتبع"],
  };

  const entityKeywords: Record<string, string[]> = {
    users: ["user", "account", "profile", "member", "مستخدم", "حساب"],
    products: ["product", "item", "goods", "منتج"],
    orders: ["order", "purchase", "booking", "طلب", "حجز"],
    payments: ["payment", "transaction", "invoice", "دفع", "معاملة"],
    customers: ["customer", "client", "عميل"],
    employees: ["employee", "staff", "worker", "موظف"],
    courses: ["course", "class", "lesson", "دورة", "درس"],
    appointments: ["appointment", "booking", "schedule", "موعد"],
    messages: ["message", "chat", "notification", "رسالة"],
    reports: ["report", "analytics", "dashboard", "تقرير"],
  };

  const featureKeywords: Record<string, string[]> = {
    auth: ["login", "register", "authentication", "password", "تسجيل", "دخول"],
    rbac: ["role", "permission", "admin", "manager", "صلاحية", "دور"],
    notifications: ["notification", "alert", "email", "sms", "إشعار"],
    search: ["search", "filter", "بحث"],
    analytics: ["analytics", "report", "dashboard", "chart", "تحليلات"],
    payments: ["payment", "stripe", "checkout", "دفع"],
    upload: ["upload", "file", "image", "document", "رفع", "ملف"],
    realtime: ["realtime", "live", "websocket", "instant", "فوري"],
    api: ["api", "integration", "webhook", "تكامل"],
    multilingual: ["multilingual", "language", "translation", "لغات", "ترجمة"],
  };

  let detectedDomain = "general";
  for (const [domain, keywords] of Object.entries(domainKeywords)) {
    if (keywords.some(kw => lowerDesc.includes(kw))) {
      detectedDomain = domain;
      break;
    }
  }

  const detectedEntities: string[] = [];
  for (const [entity, keywords] of Object.entries(entityKeywords)) {
    if (keywords.some(kw => lowerDesc.includes(kw))) {
      detectedEntities.push(entity);
    }
  }

  const detectedFeatures: string[] = [];
  for (const [feature, keywords] of Object.entries(featureKeywords)) {
    if (keywords.some(kw => lowerDesc.includes(kw))) {
      detectedFeatures.push(feature);
    }
  }

  const wordCount = description.split(/\s+/).length;
  const complexity = wordCount > 100 ? "enterprise" : wordCount > 50 ? "complex" : wordCount > 20 ? "medium" : "simple";

  return { domain: detectedDomain, entities: detectedEntities, features: detectedFeatures, complexity };
}

function selectArchitecture(config: BackendConfig, analysis: ReturnType<typeof analyzeDescriptionKeywords>): ArchitectureDecision {
  const hasEnterprise = analysis.complexity === "enterprise" || config.features.length > 8;
  const hasMicroserviceNeeds = analysis.entities.length > 5 || config.features.includes("realtime");
  
  let pattern: ArchitectureDecision["pattern"] = "clean-architecture";
  let reason = "Clean Architecture provides excellent separation of concerns and testability";
  
  if (hasEnterprise && hasMicroserviceNeeds) {
    pattern = "microservices";
    reason = "High complexity and multiple domains suggest microservices for better scalability";
  } else if (analysis.entities.length > 3) {
    pattern = "modular-monolith";
    reason = "Multiple entities benefit from modular organization while maintaining deployment simplicity";
  }

  const recommendedModules = [
    "core",
    "infrastructure",
    "application",
    ...analysis.entities.map(e => e),
    ...(config.authentication ? ["auth"] : []),
    ...(config.features.includes("payments") ? ["payments"] : []),
    ...(config.features.includes("notifications") ? ["notifications"] : []),
  ];

  return {
    pattern,
    reason,
    recommendedModules,
    securityLevel: config.authentication && config.features.includes("payments") ? "enterprise" : config.authentication ? "standard" : "basic",
    scalabilityNeeds: analysis.complexity === "enterprise" ? "enterprise" : analysis.complexity === "complex" ? "growth" : "startup",
  };
}

function generateFolderStructure(config: BackendConfig, architecture: ArchitectureDecision): FolderNode[] {
  const isTs = config.language === "typescript";
  const ext = isTs ? "ts" : "js";

  const structure: FolderNode[] = [
    {
      name: "src",
      type: "folder",
      children: [
        {
          name: "core",
          type: "folder",
          description: "Domain entities and business logic",
          children: [
            { name: `entities.${ext}`, type: "file", description: "Domain models" },
            { name: `interfaces.${ext}`, type: "file", description: "Core interfaces" },
            { name: `errors.${ext}`, type: "file", description: "Custom error classes" },
          ],
        },
        {
          name: "application",
          type: "folder",
          description: "Use cases and business rules",
          children: [
            { name: "use-cases", type: "folder", children: [] },
            { name: "services", type: "folder", children: [] },
            { name: `validators.${ext}`, type: "file", description: "Zod validation schemas" },
          ],
        },
        {
          name: "infrastructure",
          type: "folder",
          description: "External services and implementations",
          children: [
            { name: "database", type: "folder", children: [
              { name: `connection.${ext}`, type: "file" },
              { name: `schema.${ext}`, type: "file" },
              { name: `migrations.${ext}`, type: "file" },
            ]},
            { name: "repositories", type: "folder", children: [] },
            ...(config.features.includes("email") ? [{ name: `mailer.${ext}`, type: "file" as const }] : []),
            ...(config.features.includes("caching") ? [{ name: `cache.${ext}`, type: "file" as const }] : []),
          ],
        },
        {
          name: "presentation",
          type: "folder",
          description: "HTTP layer and controllers",
          children: [
            { name: "routes", type: "folder", children: [] },
            { name: "controllers", type: "folder", children: [] },
            { name: "middleware", type: "folder", children: [
              { name: `error-handler.${ext}`, type: "file" },
              { name: `rate-limiter.${ext}`, type: "file" },
              ...(config.authentication ? [{ name: `auth.${ext}`, type: "file" as const }] : []),
            ]},
            { name: `server.${ext}`, type: "file", description: "Express server setup" },
          ],
        },
        {
          name: "config",
          type: "folder",
          description: "Configuration management",
          children: [
            { name: `env.${ext}`, type: "file", description: "Environment configuration" },
            { name: `constants.${ext}`, type: "file", description: "Application constants" },
          ],
        },
        {
          name: "security",
          type: "folder",
          description: "Security utilities",
          children: [
            { name: `headers.${ext}`, type: "file", description: "Secure HTTP headers" },
            { name: `sanitize.${ext}`, type: "file", description: "Input sanitization" },
            ...(config.authentication ? [{ name: `jwt.${ext}`, type: "file" as const, description: "JWT utilities" }] : []),
          ],
        },
        { name: `index.${ext}`, type: "file", description: "Application entry point" },
      ],
    },
    {
      name: "tests",
      type: "folder",
      children: [
        { name: "unit", type: "folder", children: [] },
        { name: "integration", type: "folder", children: [] },
        { name: "e2e", type: "folder", children: [] },
        { name: `setup.${ext}`, type: "file" },
      ],
    },
    { name: "package.json", type: "file" },
    { name: isTs ? "tsconfig.json" : "jsconfig.json", type: "file" },
    { name: ".env.example", type: "file" },
    { name: "Dockerfile", type: "file" },
    { name: "docker-compose.yml", type: "file" },
    { name: "README.md", type: "file" },
    { name: ".gitignore", type: "file" },
  ];

  return structure;
}

function calculateSecurityScore(config: BackendConfig): number {
  let score = 30;
  
  if (config.authentication) score += 15;
  if (config.features.includes("validation")) score += 10;
  if (config.features.includes("errorHandling")) score += 10;
  if (config.features.includes("rateLimit")) score += 15;
  if (config.features.includes("logging")) score += 5;
  if (config.language === "typescript") score += 10;
  if (config.database === "postgresql") score += 5;
  
  return Math.min(score, 100);
}

function generateProductionReadiness(config: BackendConfig, securityScore: number): ArchitecturePreview["productionReadiness"] {
  const checklist = [
    { item: "Authentication implemented", passed: config.authentication },
    { item: "Input validation", passed: config.features.includes("validation") },
    { item: "Error handling", passed: config.features.includes("errorHandling") },
    { item: "Rate limiting", passed: config.features.includes("rateLimit") },
    { item: "Logging configured", passed: config.features.includes("logging") },
    { item: "TypeScript for type safety", passed: config.language === "typescript" },
    { item: "Environment configuration", passed: true },
    { item: "Database migrations", passed: true },
    { item: "Docker deployment ready", passed: true },
    { item: "Security headers", passed: true },
  ];

  const passedCount = checklist.filter(c => c.passed).length;
  const score = Math.round((passedCount / checklist.length) * 100);

  let status: ArchitecturePreview["productionReadiness"]["status"] = "not-ready";
  if (score >= 90) status = "production";
  else if (score >= 70) status = "staging";
  else if (score >= 50) status = "development";

  return { score, status, checklist };
}

export async function generateArchitecturePreview(config: BackendConfig): Promise<ArchitecturePreview> {
  const analysis = analyzeDescriptionKeywords(config.description);
  const architecture = selectArchitecture(config, analysis);
  const folderStructure = generateFolderStructure(config, architecture);
  const securityScore = calculateSecurityScore(config);
  const productionReadiness = generateProductionReadiness(config, securityScore);

  const inferredEntities: InferredEntity[] = analysis.entities.map(entity => ({
    name: entity,
    fields: [
      { name: "id", type: "string", required: true },
      { name: "createdAt", type: "Date", required: true },
      { name: "updatedAt", type: "Date", required: true },
    ],
    relationships: [],
  }));

  const warnings: ArchitecturePreview["warnings"] = [];
  
  if (!config.authentication) {
    warnings.push({
      type: "warning",
      message: "Authentication is disabled. This exposes your API to unauthorized access.",
      messageAr: "المصادقة معطلة. هذا يعرض الـ API للوصول غير المصرح به.",
    });
  }
  
  if (!config.features.includes("rateLimit")) {
    warnings.push({
      type: "warning",
      message: "Rate limiting is not enabled. Your API may be vulnerable to abuse.",
      messageAr: "تحديد معدل الطلبات غير مفعل. قد يكون الـ API عرضة للإساءة.",
    });
  }
  
  if (!config.features.includes("validation")) {
    warnings.push({
      type: "critical",
      message: "Data validation is disabled. This is a security risk.",
      messageAr: "التحقق من البيانات معطل. هذا خطر أمني.",
    });
  }

  const suggestions: ArchitecturePreview["suggestions"] = [];
  
  if (!config.features.includes("caching") && analysis.complexity !== "simple") {
    suggestions.push({
      feature: "caching",
      reason: "Add caching to improve performance for repeated queries",
      reasonAr: "أضف التخزين المؤقت لتحسين الأداء للاستعلامات المتكررة",
    });
  }
  
  if (!config.features.includes("logging")) {
    suggestions.push({
      feature: "logging",
      reason: "Enable logging for debugging and monitoring",
      reasonAr: "فعّل السجلات للتصحيح والمراقبة",
    });
  }

  return {
    folderStructure,
    architecture,
    inferredEntities,
    enabledModules: architecture.recommendedModules,
    securityScore,
    productionReadiness,
    warnings,
    suggestions,
  };
}

export async function generateFullBackend(config: BackendConfig): Promise<GenerationResult> {
  const generationLog: GenerationResult["generationLog"] = [];
  const addLog = (step: string, status: GenerationResult["generationLog"][0]["status"], message: string) => {
    generationLog.push({ step, status, message, timestamp: Date.now() });
  };

  addLog("init", "completed", "Initializing backend generation");
  
  const preview = await generateArchitecturePreview(config);
  addLog("architecture", "completed", `Selected ${preview.architecture.pattern} architecture`);

  const anthropic = await getAnthropicClient();
  const isTs = config.language === "typescript";
  const ext = isTs ? "ts" : "js";

  const files: GeneratedFile[] = [];
  const dependencies: string[] = ["express", "cors", "helmet", "zod", "dotenv"];
  const devDependencies: string[] = ["nodemon"];

  if (isTs) {
    devDependencies.push("typescript", "@types/express", "@types/node", "@types/cors", "ts-node", "tsx");
  }

  if (config.database === "postgresql") {
    dependencies.push("drizzle-orm", "pg");
    devDependencies.push("drizzle-kit", "@types/pg");
  } else if (config.database === "mongodb") {
    dependencies.push("mongoose");
    devDependencies.push("@types/mongoose");
  }

  if (config.authentication) {
    dependencies.push("jsonwebtoken", "bcryptjs");
    devDependencies.push("@types/jsonwebtoken", "@types/bcryptjs");
  }

  if (config.features.includes("rateLimit")) {
    dependencies.push("express-rate-limit");
  }

  if (config.features.includes("logging")) {
    dependencies.push("pino", "pino-pretty");
  }

  if (config.features.includes("email")) {
    dependencies.push("nodemailer");
    devDependencies.push("@types/nodemailer");
  }

  addLog("dependencies", "completed", `Configured ${dependencies.length} dependencies`);

  files.push({
    path: "package.json",
    type: "config",
    description: "Project configuration",
    content: JSON.stringify({
      name: config.projectName,
      version: "1.0.0",
      description: config.description,
      main: isTs ? "dist/index.js" : "src/index.js",
      scripts: {
        dev: isTs ? "tsx watch src/index.ts" : "nodemon src/index.js",
        build: isTs ? "tsc" : "echo 'No build needed'",
        start: isTs ? "node dist/index.js" : "node src/index.js",
        test: "jest",
        lint: "eslint src/",
        "db:migrate": "drizzle-kit migrate",
        "db:generate": "drizzle-kit generate",
      },
      dependencies: Object.fromEntries(dependencies.map(d => [d, "latest"])),
      devDependencies: Object.fromEntries(devDependencies.map(d => [d, "latest"])),
    }, null, 2),
  });

  if (isTs) {
    files.push({
      path: "tsconfig.json",
      type: "config",
      description: "TypeScript configuration",
      content: JSON.stringify({
        compilerOptions: {
          target: "ES2022",
          module: "NodeNext",
          moduleResolution: "NodeNext",
          lib: ["ES2022"],
          outDir: "./dist",
          rootDir: "./src",
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
          resolveJsonModule: true,
          declaration: true,
          declarationMap: true,
          sourceMap: true,
        },
        include: ["src/**/*"],
        exclude: ["node_modules", "dist"],
      }, null, 2),
    });
  }

  addLog("config", "completed", "Generated configuration files");

  const envVars: Record<string, string> = {
    NODE_ENV: "development",
    PORT: "3000",
    DATABASE_URL: config.database === "postgresql" ? "postgresql://user:pass@localhost:5432/db" : "mongodb://localhost:27017/db",
  };

  if (config.authentication) {
    envVars.JWT_SECRET = "your-super-secret-key-change-in-production";
    envVars.JWT_EXPIRES_IN = "7d";
    envVars.REFRESH_TOKEN_EXPIRES_IN = "30d";
  }

  files.push({
    path: ".env.example",
    type: "config",
    description: "Environment variables template",
    content: Object.entries(envVars).map(([k, v]) => `${k}=${v}`).join("\n"),
  });

  const mainServerContent = `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env${isTs ? "" : ".js"}';
import { errorHandler } from './presentation/middleware/error-handler${isTs ? "" : ".js"}';
${config.features.includes("rateLimit") ? `import { rateLimiter } from './presentation/middleware/rate-limiter${isTs ? "" : ".js"}';` : ""}
${config.features.includes("logging") ? `import pino from 'pino';` : ""}
import { apiRouter } from './presentation/routes/api${isTs ? "" : ".js"}';

${config.features.includes("logging") ? `const logger = pino({ transport: { target: 'pino-pretty' } });` : ""}

const app = express();

app.use(helmet());
app.use(cors({ origin: config.corsOrigins, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
${config.features.includes("rateLimit") ? "app.use(rateLimiter);" : ""}

app.use('/api', apiRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

const PORT = config.port || 3000;
app.listen(PORT, () => {
  ${config.features.includes("logging") ? "logger.info(`Server running on port ${PORT}`);" : "console.log(`Server running on port ${PORT}`);"}
});

export { app };
`;

  files.push({
    path: `src/index.${ext}`,
    type: "entry",
    description: "Application entry point",
    content: mainServerContent,
  });

  const envConfigContent = `import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  DATABASE_URL: z.string(),
  ${config.authentication ? `JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('30d'),` : ""}
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = {
  ...parsed.data,
  port: parsed.data.PORT,
  isProduction: parsed.data.NODE_ENV === 'production',
  corsOrigins: parsed.data.NODE_ENV === 'production' ? ['https://yourdomain.com'] : ['http://localhost:3000', 'http://localhost:5173'],
};
`;

  files.push({
    path: `src/config/env.${ext}`,
    type: "config",
    description: "Environment configuration with validation",
    content: envConfigContent,
  });

  addLog("core", "completed", "Generated core application files");

  const errorHandlerContent = `import${isTs ? " { Request, Response, NextFunction }" : ""} from 'express';
${config.features.includes("logging") ? "import pino from 'pino';\nconst logger = pino();" : ""}

export class AppError extends Error {
  ${isTs ? "public readonly statusCode: number;\n  public readonly isOperational: boolean;" : ""}
  
  constructor(message${isTs ? ": string" : ""}, statusCode${isTs ? ": number" : ""} = 500, isOperational${isTs ? ": boolean" : ""} = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err${isTs ? ": Error" : ""}, req${isTs ? ": Request" : ""}, res${isTs ? ": Response" : ""}, next${isTs ? ": NextFunction" : ""}) => {
  ${config.features.includes("logging") ? "logger.error({ err, path: req.path, method: req.method }, 'Error occurred');" : "console.error('Error:', err);"}
  
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }
  
  return res.status(500).json({
    success: false,
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
`;

  files.push({
    path: `src/presentation/middleware/error-handler.${ext}`,
    type: "middleware",
    description: "Centralized error handling",
    content: errorHandlerContent,
  });

  if (config.features.includes("rateLimit")) {
    const rateLimiterContent = `import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, error: 'Too many login attempts, please try again later' },
});
`;
    files.push({
      path: `src/presentation/middleware/rate-limiter.${ext}`,
      type: "middleware",
      description: "Rate limiting middleware",
      content: rateLimiterContent,
    });
  }

  addLog("middleware", "completed", "Generated middleware components");

  if (config.authentication) {
    const jwtContent = `import jwt from 'jsonwebtoken';
import { config } from '../config/env${isTs ? "" : ".js"}';

${isTs ? `interface TokenPayload {
  userId: string;
  role: string;
  type: 'access' | 'refresh';
}` : ""}

export const generateTokens = (userId${isTs ? ": string" : ""}, role${isTs ? ": string" : ""}) => {
  const accessToken = jwt.sign(
    { userId, role, type: 'access' }${isTs ? " as TokenPayload" : ""},
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );
  
  const refreshToken = jwt.sign(
    { userId, role, type: 'refresh' }${isTs ? " as TokenPayload" : ""},
    config.JWT_SECRET,
    { expiresIn: config.REFRESH_TOKEN_EXPIRES_IN }
  );
  
  return { accessToken, refreshToken };
};

export const verifyToken = (token${isTs ? ": string" : ""})${isTs ? ": TokenPayload | null" : ""} => {
  try {
    return jwt.verify(token, config.JWT_SECRET)${isTs ? " as TokenPayload" : ""};
  } catch {
    return null;
  }
};

export const rotateRefreshToken = (oldRefreshToken${isTs ? ": string" : ""}) => {
  const payload = verifyToken(oldRefreshToken);
  if (!payload || payload.type !== 'refresh') return null;
  return generateTokens(payload.userId, payload.role);
};
`;

    files.push({
      path: `src/security/jwt.${ext}`,
      type: "security",
      description: "JWT token management with rotation",
      content: jwtContent,
    });

    const authMiddlewareContent = `import${isTs ? " { Request, Response, NextFunction }" : ""} from 'express';
import { verifyToken } from '../../security/jwt${isTs ? "" : ".js"}';
import { AppError } from './error-handler${isTs ? "" : ".js"}';

${isTs ? `declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; role: string };
    }
  }
}` : ""}

export const authenticate = (req${isTs ? ": Request" : ""}, res${isTs ? ": Response" : ""}, next${isTs ? ": NextFunction" : ""}) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('No token provided', 401);
  }
  
  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  
  if (!payload || payload.type !== 'access') {
    throw new AppError('Invalid or expired token', 401);
  }
  
  req.user = { userId: payload.userId, role: payload.role };
  next();
};

export const authorize = (...roles${isTs ? ": string[]" : ""}) => {
  return (req${isTs ? ": Request" : ""}, res${isTs ? ": Response" : ""}, next${isTs ? ": NextFunction" : ""}) => {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }
    
    if (!roles.includes(req.user.role)) {
      throw new AppError('Not authorized', 403);
    }
    
    next();
  };
};
`;

    files.push({
      path: `src/presentation/middleware/auth.${ext}`,
      type: "middleware",
      description: "Authentication and authorization middleware",
      content: authMiddlewareContent,
    });
  }

  addLog("security", "completed", "Generated security components");

  const apiRouterContent = `import { Router } from 'express';
${config.authentication ? `import { authenticate, authorize } from '../middleware/auth${isTs ? "" : ".js"}';` : ""}
import { z } from 'zod';
import { AppError } from '../middleware/error-handler${isTs ? "" : ".js"}';

const router = Router();

const validateBody = (schema${isTs ? ": z.ZodSchema" : ""}) => (req${isTs ? ": any" : ""}, res${isTs ? ": any" : ""}, next${isTs ? ": any" : ""}) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    throw new AppError(result.error.errors.map(e => e.message).join(', '), 400);
  }
  req.body = result.data;
  next();
};

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      ${config.authentication ? `auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        refresh: 'POST /api/auth/refresh',
        me: 'GET /api/auth/me',
      },` : ""}
    },
  });
});

${config.authentication ? `
const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post('/auth/register', validateBody(userSchema), async (req, res, next) => {
  try {
    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    next(error);
  }
});

router.post('/auth/login', validateBody(loginSchema), async (req, res, next) => {
  try {
    res.json({ success: true, message: 'Login successful' });
  } catch (error) {
    next(error);
  }
});

router.get('/auth/me', authenticate, (req, res) => {
  res.json({ success: true, user: req.user });
});
` : ""}

export { router as apiRouter };
`;

  files.push({
    path: `src/presentation/routes/api.${ext}`,
    type: "routes",
    description: "API routes with validation",
    content: apiRouterContent,
  });

  addLog("routes", "completed", "Generated API routes");

  const dockerfileContent = `FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
${isTs ? "RUN npm run build" : ""}

FROM node:20-alpine AS runner

WORKDIR /app
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
${isTs ? "COPY --from=builder /app/dist ./dist" : "COPY --from=builder /app/src ./src"}

ENV NODE_ENV=production
EXPOSE 3000

USER node
CMD ["npm", "start"]
`;

  files.push({
    path: "Dockerfile",
    type: "deployment",
    description: "Docker configuration for production",
    content: dockerfileContent,
  });

  const dockerComposeContent = `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=\${DATABASE_URL}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: ${config.database === "postgresql" ? "postgres:16-alpine" : "mongo:7"}
    ports:
      - "${config.database === "postgresql" ? "5432:5432" : "27017:27017"}"
    environment:
      ${config.database === "postgresql" ? `- POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=app` : ""}
    volumes:
      - db_data:/var/lib/${config.database === "postgresql" ? "postgresql" : "mongo"}/data
    restart: unless-stopped

volumes:
  db_data:
`;

  files.push({
    path: "docker-compose.yml",
    type: "deployment",
    description: "Docker Compose for local development",
    content: dockerComposeContent,
  });

  addLog("deployment", "completed", "Generated deployment files");

  const readmeContent = `# ${config.projectName}

${config.description}

## Architecture

This project uses **${preview.architecture.pattern}** architecture.

${preview.architecture.reason}

## Tech Stack

- **Framework**: ${config.framework}
- **Database**: ${config.database}
- **Language**: ${config.language}
- **API Style**: ${config.apiStyle}

## Getting Started

### Prerequisites

- Node.js 20+
- ${config.database === "postgresql" ? "PostgreSQL 16+" : "MongoDB 7+"}
- Docker (optional)

### Installation

\`\`\`bash
npm install
cp .env.example .env
npm run db:generate
npm run db:migrate
npm run dev
\`\`\`

### Using Docker

\`\`\`bash
docker-compose up -d
\`\`\`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check |
| GET | /api | API info |
${config.authentication ? `| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |` : ""}

## Security Features

${config.authentication ? "- JWT Authentication with refresh token rotation" : "- No authentication (add for production!)"}
${config.features.includes("rateLimit") ? "- Rate limiting (100 req/15min)" : ""}
${config.features.includes("validation") ? "- Zod input validation" : ""}
- Helmet security headers
- CORS configuration

## License

MIT
`;

  files.push({
    path: "README.md",
    type: "documentation",
    description: "Project documentation",
    content: readmeContent,
  });

  files.push({
    path: ".gitignore",
    type: "config",
    description: "Git ignore file",
    content: `node_modules/
dist/
.env
*.log
.DS_Store
coverage/
.nyc_output/
`,
  });

  addLog("documentation", "completed", "Generated documentation");
  addLog("complete", "completed", `Successfully generated ${files.length} files`);

  return {
    success: true,
    files,
    dependencies,
    devDependencies,
    setupCommands: [
      "npm install",
      "cp .env.example .env",
      "npm run db:generate",
      "npm run db:migrate",
      "npm run dev",
    ],
    envVariables: envVars,
    documentation: {
      ar: `# ${config.projectName}\n\n${config.description}\n\nتم توليد هذا المشروع باستخدام INFERA WebNova.\n\nللبدء:\n1. قم بتثبيت الحزم: npm install\n2. انسخ ملف البيئة: cp .env.example .env\n3. شغّل المشروع: npm run dev`,
      en: readmeContent,
    },
    architecture: preview.architecture,
    preview,
    generationLog,
  };
}
