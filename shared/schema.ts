import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer, boolean, index, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ==================== SESSION STORAGE (for Replit Auth) ====================

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// ==================== USERS & AUTH ====================

// User roles enum - owner is platform owner (highest level)
// Added: finance_admin, finance_manager, accountant for financial management
// Added: admin for platform administration
export const userRoles = [
  'free', 'basic', 'pro', 'enterprise', 'sovereign', 'owner',
  'admin', 'finance_admin', 'finance_manager', 'accountant', 'support_agent'
] as const;
export type UserRole = typeof userRoles[number];

// Financial employee types
export const financeRoles = ['finance_admin', 'finance_manager', 'accountant'] as const;
export type FinanceRole = typeof financeRoles[number];

// User status enum for governance
export const userStatuses = ['ACTIVE', 'SUSPENDED', 'BANNED', 'PENDING', 'DEACTIVATED'] as const;
export type UserStatus = typeof userStatuses[number];

// Auth provider types for social login
export const authProviders = ['email', 'google', 'github', 'apple', 'replit'] as const;
export type AuthProvider = typeof authProviders[number];

// Users table - Extended with roles and subscription info
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").unique(), // nullable for OAuth without email
  username: text("username").unique(), // nullable for OAuth
  password: text("password"), // nullable for OAuth users
  fullName: text("full_name"),
  firstName: text("first_name"), // for OAuth profile
  lastName: text("last_name"), // for OAuth profile
  avatar: text("avatar"),
  profileImageUrl: text("profile_image_url"), // for OAuth profile image
  authProvider: text("auth_provider").notNull().default("email"), // email, google, github, apple, replit
  role: text("role").notNull().default("free"), // free, basic, pro, enterprise, sovereign
  status: text("status").notNull().default("ACTIVE"), // ACTIVE, SUSPENDED, BANNED, PENDING, DEACTIVATED
  isActive: boolean("is_active").notNull().default(true),
  emailVerified: boolean("email_verified").notNull().default(false),
  language: text("language").notNull().default("ar"), // ar, en
  permissions: jsonb("permissions").$type<string[]>().default([]), // User-specific permissions
  stripeCustomerId: text("stripe_customer_id"), // Stripe customer ID
  stripeSubscriptionId: text("stripe_subscription_id"), // Active Stripe subscription ID
  // Governance audit fields
  statusChangedAt: timestamp("status_changed_at"),
  statusChangedBy: varchar("status_changed_by"), // User ID of who changed status
  statusReason: text("status_reason"), // Reason for status change
  // Activity tracking
  lastLoginAt: timestamp("last_login_at"),
  lastLoginIP: text("last_login_ip"),
  failedLoginAttempts: integer("failed_login_attempts").default(0),
  // Two-Factor Authentication (TOTP)
  twoFactorSecret: text("two_factor_secret"), // Encrypted TOTP secret
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
  twoFactorRecoveryCodes: jsonb("two_factor_recovery_codes").$type<string[]>(), // Hashed backup codes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Upsert user type for OAuth - Replit Auth compatible
export type UpsertUser = {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  authProvider?: string;
};

// ==================== OTP TOKENS ====================

export const otpTokens = pgTable("otp_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  code: text("code").notNull(),
  type: text("type").notNull().default("email"), // email, authenticator
  expiresAt: timestamp("expires_at").notNull(),
  verified: boolean("verified").notNull().default(false),
  attempts: integer("attempts").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_otp_email").on(table.email),
  index("idx_otp_code").on(table.code),
]);

export const insertOtpTokenSchema = createInsertSchema(otpTokens).omit({
  id: true,
  createdAt: true,
});

export type InsertOtpToken = z.infer<typeof insertOtpTokenSchema>;
export type OtpToken = typeof otpTokens.$inferSelect;

// ==================== LOGIN SESSIONS (تتبع جلسات تسجيل الدخول) ====================

export const loginSessions = pgTable("login_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  // Session info
  sessionId: text("session_id").notNull(), // Express session ID
  isActive: boolean("is_active").notNull().default(true),
  // Geolocation
  ipAddress: text("ip_address"),
  country: text("country"),
  countryCode: text("country_code"),
  city: text("city"),
  region: text("region"),
  timezone: text("timezone"),
  isp: text("isp"),
  // Device info
  deviceType: text("device_type"), // desktop, mobile, tablet
  browser: text("browser"),
  browserVersion: text("browser_version"),
  os: text("os"),
  osVersion: text("os_version"),
  userAgent: text("user_agent"),
  // Activity tracking
  loginAt: timestamp("login_at").defaultNow(),
  logoutAt: timestamp("logout_at"),
  lastActivityAt: timestamp("last_activity_at").defaultNow(),
  // Session activities log
  activities: jsonb("activities").$type<Array<{
    action: string;
    timestamp: string;
    details?: string;
    ipAddress?: string;
  }>>().default([]),
  // Notification status
  loginNotificationSent: boolean("login_notification_sent").default(false),
  logoutNotificationSent: boolean("logout_notification_sent").default(false),
  // Auth method used
  authMethod: text("auth_method").default("password"), // password, google, github, 2fa, recovery
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_login_sessions_user").on(table.userId),
  index("idx_login_sessions_active").on(table.isActive),
]);

export const insertLoginSessionSchema = createInsertSchema(loginSessions).omit({
  id: true,
  createdAt: true,
});

export type InsertLoginSession = z.infer<typeof insertLoginSessionSchema>;
export type LoginSession = typeof loginSessions.$inferSelect;

// ==================== SUBSCRIPTION PLANS ====================

// AI Operation Modes - defines how AI functions in each plan
export const aiModes = ['sandbox', 'assistant', 'copilot', 'operator', 'sovereign'] as const;
export type AIMode = typeof aiModes[number];

// Plan tier identifiers
export const planTiers = ['discovery', 'builder', 'professional', 'organizational', 'sovereign'] as const;
export type PlanTier = typeof planTiers[number];

// Plan operational capabilities type
export interface PlanCapabilities {
  // AI Capabilities
  aiMode: AIMode;
  aiAutonomy: number; // 0-100
  smartSuggestions: boolean;
  aiCodeGeneration: boolean;
  aiCopilot: boolean;
  aiOperator: boolean;
  aiGovernance: boolean;
  
  // Builder Capabilities
  backendGenerator: boolean;
  frontendGenerator: boolean;
  fullStackGenerator: boolean;
  chatbotBuilder: boolean;
  
  // Deployment & Infrastructure
  activeDeployments: number;
  customDomains: number;
  cdnAccess: boolean;
  sslCertificates: boolean;
  
  // Automation & CI/CD
  automationPipelines: boolean;
  cicdIntegration: boolean;
  webhooks: boolean;
  scheduledTasks: boolean;
  
  // Version Control
  versionControl: boolean;
  branchManagement: boolean;
  rollbackEnabled: boolean;
  
  // Analytics & Monitoring
  basicAnalytics: boolean;
  advancedAnalytics: boolean;
  performanceMonitoring: boolean;
  slaMonitoring: boolean;
  
  // Team & Access
  teamRoles: boolean;
  customPermissions: boolean;
  apiGateway: boolean;
  externalIntegrations: boolean;
  
  // Enterprise Features
  whiteLabel: boolean;
  multiTenant: boolean;
  complianceModes: boolean;
  auditLogs: boolean;
  
  // Sovereign Features
  sovereignDashboard: boolean;
  dataResidencyControl: boolean;
  policyEnforcement: boolean;
  emergencyKillSwitch: boolean;
  isolatedInfrastructure: boolean;
  strategicSimulation: boolean;
}

// Plan limits type
export interface PlanLimits {
  maxProjects: number; // -1 = unlimited
  maxPagesPerProject: number;
  aiGenerationsPerMonth: number;
  storageGB: number;
  bandwidthGB: number;
  apiRequestsPerMonth: number;
  teamMembers: number;
  activeDeployments: number;
  customDomains: number;
}

// Plan restrictions type
export interface PlanRestrictions {
  watermark: boolean;
  noRealDeployment: boolean;
  limitedTemplates: boolean;
  exportCodeDisabled: boolean;
  sandboxMode: boolean;
}

// Subscription plans table - Extended with operational capabilities
export const subscriptionPlans = pgTable("subscription_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // Free, Basic, Pro, Enterprise, Sovereign
  nameAr: text("name_ar").notNull(), // الاسم بالعربي
  description: text("description"),
  descriptionAr: text("description_ar"),
  tagline: text("tagline"), // Short marketing tagline
  taglineAr: text("tagline_ar"),
  role: text("role").notNull(), // maps to user role
  tier: text("tier").notNull().default("discovery"), // discovery, builder, professional, organizational, sovereign
  
  // Pricing
  priceMonthly: integer("price_monthly").notNull().default(0), // in cents/smallest unit
  priceQuarterly: integer("price_quarterly").notNull().default(0),
  priceSemiAnnual: integer("price_semi_annual").notNull().default(0),
  priceYearly: integer("price_yearly").notNull().default(0),
  currency: text("currency").notNull().default("USD"),
  
  // Features display
  features: jsonb("features").$type<string[]>().notNull().default([]),
  featuresAr: jsonb("features_ar").$type<string[]>().notNull().default([]),
  
  // Operational Capabilities (JSON for flexibility)
  capabilities: jsonb("capabilities").$type<PlanCapabilities>(),
  limits: jsonb("limits").$type<PlanLimits>(),
  restrictions: jsonb("restrictions").$type<PlanRestrictions>(),
  
  // Legacy fields (kept for backward compatibility)
  maxProjects: integer("max_projects").notNull().default(1),
  maxPagesPerProject: integer("max_pages_per_project").notNull().default(5),
  aiGenerationsPerMonth: integer("ai_generations_per_month").notNull().default(10),
  customDomain: boolean("custom_domain").notNull().default(false),
  whiteLabel: boolean("white_label").notNull().default(false),
  prioritySupport: boolean("priority_support").notNull().default(false),
  analyticsAccess: boolean("analytics_access").notNull().default(false),
  chatbotBuilder: boolean("chatbot_builder").notNull().default(false),
  teamMembers: integer("team_members").notNull().default(1),
  
  // UI/Display
  iconName: text("icon_name").default("Zap"),
  accentColor: text("accent_color").default("#6366f1"),
  gradientFrom: text("gradient_from").default("#6366f1"),
  gradientTo: text("gradient_to").default("#8b5cf6"),
  isPopular: boolean("is_popular").notNull().default(false),
  isContactSales: boolean("is_contact_sales").notNull().default(false),
  
  // Status
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
});

export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;

// ==================== USER SUBSCRIPTIONS ====================

// User subscriptions table
export const userSubscriptions = pgTable("user_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  planId: varchar("plan_id").notNull(),
  status: text("status").notNull().default("pending"), // pending, active, cancelled, expired
  billingCycle: text("billing_cycle").notNull().default("monthly"), // monthly, quarterly, semi_annual, yearly
  paymentMethod: text("payment_method").notNull().default("manual"), // manual, stripe, paypal
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripeCustomerId: text("stripe_customer_id"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUserSubscription = z.infer<typeof insertUserSubscriptionSchema>;
export type UserSubscription = typeof userSubscriptions.$inferSelect;

// ==================== PAYMENT HISTORY ====================

// Payment history table
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  subscriptionId: varchar("subscription_id"),
  amount: integer("amount").notNull(), // in cents
  currency: text("currency").notNull().default("USD"),
  status: text("status").notNull().default("pending"), // pending, completed, failed, refunded
  paymentMethod: text("payment_method").notNull(), // manual, stripe, paypal
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  description: text("description"),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

// ==================== PROJECTS ====================

// Projects table - Extended with user ownership
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"), // Owner of the project
  name: text("name").notNull(),
  description: text("description"),
  industry: text("industry"), // e-commerce, services, education, legal, etc.
  language: text("language").notNull().default("ar"),
  htmlCode: text("html_code").notNull().default(""),
  cssCode: text("css_code").notNull().default(""),
  jsCode: text("js_code").notNull().default(""),
  thumbnail: text("thumbnail"),
  customDomain: text("custom_domain"),
  isPublished: boolean("is_published").notNull().default(false),
  isSystemProject: boolean("is_system_project").notNull().default(false), // True for INFERA WebNova core
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords"),
  status: text("status").default("draft"), // draft, published, archived
  deletedAt: timestamp("deleted_at"), // For soft delete (recycle bin)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// ==================== PROJECT INFRASTRUCTURE (Auto-Provisioning) ====================

// Project Backend Configuration - الباك إند المولّد تلقائياً
export const projectBackends = pgTable("project_backends", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  
  // إعدادات الباك إند
  framework: text("framework").notNull().default("express"), // express, fastify, nestjs
  language: text("language").notNull().default("typescript"), // typescript, javascript
  apiStyle: text("api_style").notNull().default("rest"), // rest, graphql
  
  // الكود المولّد
  generatedCode: jsonb("generated_code").$type<{
    files: Array<{
      path: string;
      content: string;
      type: string;
    }>;
  }>(),
  
  // حالة التوليد
  status: text("status").notNull().default("pending"), // pending, generating, ready, error
  generationProgress: integer("generation_progress").default(0),
  
  // الميزات المُفعّلة
  features: jsonb("features").$type<{
    authentication: boolean;
    crud: boolean;
    validation: boolean;
    rateLimiting: boolean;
    errorHandling: boolean;
    logging: boolean;
    fileUpload: boolean;
    email: boolean;
  }>().default({
    authentication: true,
    crud: true,
    validation: true,
    rateLimiting: true,
    errorHandling: true,
    logging: true,
    fileUpload: false,
    email: false,
  }),
  
  // بيانات النشر
  deploymentConfig: jsonb("deployment_config").$type<{
    port: number;
    env: Record<string, string>;
    buildCommand: string;
    startCommand: string;
  }>(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_project_backend_project").on(table.projectId),
]);

export const insertProjectBackendSchema = createInsertSchema(projectBackends).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProjectBackend = z.infer<typeof insertProjectBackendSchema>;
export type ProjectBackend = typeof projectBackends.$inferSelect;

// Project Database Configuration - قاعدة البيانات المولّدة تلقائياً
export const projectDatabases = pgTable("project_databases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  
  // نوع قاعدة البيانات
  dbType: text("db_type").notNull().default("postgresql"), // postgresql, mysql, sqlite, mongodb
  orm: text("orm").notNull().default("drizzle"), // drizzle, prisma, typeorm, mongoose
  
  // الجداول والعلاقات
  schema: jsonb("schema").$type<{
    tables: Array<{
      name: string;
      columns: Array<{
        name: string;
        type: string;
        nullable: boolean;
        primaryKey: boolean;
        unique: boolean;
        default?: string;
        references?: { table: string; column: string };
      }>;
      indexes: Array<{ name: string; columns: string[] }>;
    }>;
    relations: Array<{
      from: { table: string; column: string };
      to: { table: string; column: string };
      type: string; // one-to-one, one-to-many, many-to-many
    }>;
  }>(),
  
  // الكود المولّد
  generatedSchema: text("generated_schema"), // كود schema الفعلي
  generatedMigrations: jsonb("generated_migrations").$type<string[]>(),
  
  // حالة التوليد
  status: text("status").notNull().default("pending"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_project_database_project").on(table.projectId),
]);

export const insertProjectDatabaseSchema = createInsertSchema(projectDatabases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProjectDatabase = z.infer<typeof insertProjectDatabaseSchema>;
export type ProjectDatabase = typeof projectDatabases.$inferSelect;

// Project Auth Configuration - نظام المصادقة المولّد تلقائياً
export const projectAuthConfigs = pgTable("project_auth_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  
  // نوع المصادقة
  authType: text("auth_type").notNull().default("jwt"), // jwt, session, oauth
  
  // إعدادات المستخدمين
  userRoles: jsonb("user_roles").$type<Array<{
    name: string;
    nameAr: string;
    permissions: string[];
    isDefault: boolean;
  }>>().default([
    { name: "admin", nameAr: "مدير", permissions: ["*"], isDefault: false },
    { name: "user", nameAr: "مستخدم", permissions: ["read", "write"], isDefault: true },
    { name: "guest", nameAr: "زائر", permissions: ["read"], isDefault: false },
  ]),
  
  // ميزات المصادقة
  features: jsonb("features").$type<{
    registration: boolean;
    login: boolean;
    logout: boolean;
    passwordReset: boolean;
    emailVerification: boolean;
    twoFactorAuth: boolean;
    socialLogin: boolean;
    profileManagement: boolean;
  }>().default({
    registration: true,
    login: true,
    logout: true,
    passwordReset: true,
    emailVerification: false,
    twoFactorAuth: false,
    socialLogin: false,
    profileManagement: true,
  }),
  
  // الكود المولّد
  generatedCode: jsonb("generated_code").$type<{
    routes: string;
    middleware: string;
    controllers: string;
    views: string;
  }>(),
  
  // حالة التوليد
  status: text("status").notNull().default("pending"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_project_auth_project").on(table.projectId),
]);

export const insertProjectAuthConfigSchema = createInsertSchema(projectAuthConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProjectAuthConfig = z.infer<typeof insertProjectAuthConfigSchema>;
export type ProjectAuthConfig = typeof projectAuthConfigs.$inferSelect;

// Project Provisioning Jobs - وظائف التوليد التلقائي
export const projectProvisioningJobs = pgTable("project_provisioning_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  
  // نوع الوظيفة
  jobType: text("job_type").notNull(), // full_provision, backend_only, database_only, auth_only
  
  // الحالة
  status: text("status").notNull().default("queued"), // queued, running, completed, failed
  progress: integer("progress").default(0), // 0-100
  
  // الخطوات
  steps: jsonb("steps").$type<Array<{
    name: string;
    nameAr: string;
    status: string; // pending, running, completed, failed
    startedAt?: string;
    completedAt?: string;
    error?: string;
  }>>().default([]),
  
  // النتائج
  result: jsonb("result").$type<{
    backendId?: string;
    databaseId?: string;
    authConfigId?: string;
    deploymentReady: boolean;
    errors: string[];
  }>(),
  
  // الأخطاء
  errorMessage: text("error_message"),
  
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_provisioning_job_project").on(table.projectId),
  index("IDX_provisioning_job_status").on(table.status),
]);

export const insertProjectProvisioningJobSchema = createInsertSchema(projectProvisioningJobs).omit({
  id: true,
  createdAt: true,
});

export type InsertProjectProvisioningJob = z.infer<typeof insertProjectProvisioningJobSchema>;
export type ProjectProvisioningJob = typeof projectProvisioningJobs.$inferSelect;

// ==================== CHAT MESSAGES ====================

// Chat messages table
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id"),
  userId: varchar("user_id"),
  role: text("role").notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// ==================== TEMPLATES ====================

// Intelligence levels for templates
export const templateIntelligenceLevels = ["basic", "smart", "ai-native"] as const;
export type TemplateIntelligenceLevel = typeof templateIntelligenceLevels[number];

// Monetization types
export const templateMonetizationTypes = ["free", "paid", "enterprise"] as const;
export type TemplateMonetizationType = typeof templateMonetizationTypes[number];

// Target audience types
export const templateTargetAudiences = ["individual", "startup", "enterprise", "government"] as const;
export type TemplateTargetAudience = typeof templateTargetAudiences[number];

// Platform types
export const templatePlatformTypes = ["marketing", "saas", "e-commerce", "internal", "ai-service", "fintech", "government"] as const;
export type TemplatePlatformType = typeof templatePlatformTypes[number];

// Template categories
export const templateCategories = ["business-saas", "government-enterprise", "ai-native", "e-commerce-fintech", "internal-tools"] as const;
export type TemplateCategory = typeof templateCategories[number];

// Templates table with rich metadata
export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  category: text("category").notNull(),
  industry: text("industry"),
  
  // Intelligence & Classification
  intelligenceLevel: text("intelligence_level").notNull().default("basic"), // basic, smart, ai-native
  monetizationType: text("monetization_type").notNull().default("free"), // free, paid, enterprise
  targetAudience: text("target_audience").notNull().default("startup"), // individual, startup, enterprise, government
  platformType: text("platform_type").notNull().default("marketing"), // marketing, saas, e-commerce, internal, ai-service
  
  // Setup & Capabilities
  setupTimeMinutes: integer("setup_time_minutes").notNull().default(15),
  frontendCapabilities: jsonb("frontend_capabilities").$type<string[]>().default([]),
  businessLogicModules: jsonb("business_logic_modules").$type<string[]>().default([]),
  extensibilityHooks: jsonb("extensibility_hooks").$type<string[]>().default([]),
  supportedIntegrations: jsonb("supported_integrations").$type<string[]>().default([]),
  
  // Visual & Branding
  accentColor: text("accent_color").default("#6366f1"),
  iconName: text("icon_name").default("Sparkles"),
  previewImages: jsonb("preview_images").$type<string[]>().default([]),
  
  // Code
  htmlCode: text("html_code").notNull(),
  cssCode: text("css_code").notNull(),
  jsCode: text("js_code").notNull(),
  thumbnail: text("thumbnail"),
  
  // Monetization
  isPremium: boolean("is_premium").notNull().default(false),
  requiredPlan: text("required_plan").notNull().default("free"),
  freeFeatures: jsonb("free_features").$type<string[]>().default([]),
  paidFeatures: jsonb("paid_features").$type<string[]>().default([]),
  
  // Metadata
  usageCount: integer("usage_count").notNull().default(0),
  rating: real("rating").default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  usageCount: true,
  rating: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templates.$inferSelect;

// ==================== PROJECT VERSIONS ====================

// Project Versions table - for version history
export const projectVersions = pgTable("project_versions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  versionNumber: text("version_number").notNull(),
  htmlCode: text("html_code").notNull(),
  cssCode: text("css_code").notNull(),
  jsCode: text("js_code").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProjectVersionSchema = createInsertSchema(projectVersions).omit({
  id: true,
  createdAt: true,
});

export type InsertProjectVersion = z.infer<typeof insertProjectVersionSchema>;
export type ProjectVersion = typeof projectVersions.$inferSelect;

// ==================== SHARE LINKS ====================

// Share Links table - for sharing projects
export const shareLinks = pgTable("share_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  shareCode: varchar("share_code").notNull().unique(),
  isActive: text("is_active").notNull().default("true"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertShareLinkSchema = createInsertSchema(shareLinks).omit({
  id: true,
  createdAt: true,
});

export type InsertShareLink = z.infer<typeof insertShareLinkSchema>;
export type ShareLink = typeof shareLinks.$inferSelect;

// ==================== COMPONENT LIBRARY ====================

// Component Library table - for reusable components (Smart Sections)
export const components = pgTable("components", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  category: text("category").notNull(), // Hero, Features, Pricing, Testimonials, Footer, etc.
  industry: text("industry"), // All, E-commerce, Services, Education, Legal, etc.
  htmlCode: text("html_code").notNull(),
  cssCode: text("css_code").notNull(),
  jsCode: text("js_code").notNull().default(""),
  thumbnail: text("thumbnail"),
  framework: text("framework").notNull().default("vanilla"), // vanilla, tailwind, bootstrap
  isPremium: boolean("is_premium").notNull().default(false),
  requiredPlan: text("required_plan").notNull().default("free"),
});

export const insertComponentSchema = createInsertSchema(components).omit({
  id: true,
});

export type InsertComponent = z.infer<typeof insertComponentSchema>;
export type Component = typeof components.$inferSelect;

// ==================== NOTIFICATIONS ====================

// Notifications table - for user notifications
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(), // system, payment, project, collaboration, ai, security
  title: text("title").notNull(),
  titleAr: text("title_ar"),
  message: text("message").notNull(),
  messageAr: text("message_ar"),
  isRead: boolean("is_read").notNull().default(false),
  link: text("link"), // Optional link to navigate to
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// ==================== COLLABORATORS ====================

// Collaborators table - for project collaboration
export const collaborators = pgTable("collaborators", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  userId: varchar("user_id").notNull(),
  invitedBy: varchar("invited_by").notNull(),
  role: text("role").notNull().default("viewer"), // owner, editor, viewer
  status: text("status").notNull().default("pending"), // pending, accepted, rejected
  inviteEmail: text("invite_email"),
  createdAt: timestamp("created_at").defaultNow(),
  acceptedAt: timestamp("accepted_at"),
});

export const insertCollaboratorSchema = createInsertSchema(collaborators).omit({
  id: true,
  createdAt: true,
});

export type InsertCollaborator = z.infer<typeof insertCollaboratorSchema>;
export type Collaborator = typeof collaborators.$inferSelect;

// ==================== AI USAGE TRACKING ====================

// AI Usage tracking for rate limiting
export const aiUsage = pgTable("ai_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  generationType: text("generation_type").notNull(), // website, content, chatbot
  tokensUsed: integer("tokens_used").notNull().default(0),
  requestCount: integer("request_count").notNull().default(1),
  month: text("month").notNull(), // YYYY-MM format
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAiUsageSchema = createInsertSchema(aiUsage).omit({
  id: true,
  createdAt: true,
});

export type InsertAiUsage = z.infer<typeof insertAiUsageSchema>;
export type AiUsage = typeof aiUsage.$inferSelect;

// ==================== OTP VERIFICATION ====================

// OTP codes for 2FA and email verification
export const otpCodes = pgTable("otp_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  email: text("email").notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  type: text("type").notNull().default("email"), // email, authenticator
  isUsed: boolean("is_used").notNull().default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOtpCodeSchema = createInsertSchema(otpCodes).omit({
  id: true,
  createdAt: true,
});

export type InsertOtpCode = z.infer<typeof insertOtpCodeSchema>;
export type OtpCode = typeof otpCodes.$inferSelect;

// ==================== API TYPES ====================

export interface GenerateCodeRequest {
  prompt: string;
  projectId?: string;
  context?: string;
  framework?: 'vanilla' | 'tailwind' | 'bootstrap';
  industry?: string;
  language?: 'ar' | 'en';
}

export interface GenerateCodeResponse {
  html: string;
  css: string;
  js: string;
  message: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'queued' | 'done';
  suggestions?: string[];
  modelInfo?: {
    name: string;
    provider: string;
  };
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  fullName?: string;
  language?: 'ar' | 'en';
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token?: string;
}

// ==================== AI CHATBOTS ====================

// Chatbots table for custom AI assistants
export const chatbots = pgTable("chatbots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  welcomeMessage: text("welcome_message"),
  welcomeMessageAr: text("welcome_message_ar"),
  systemPrompt: text("system_prompt").notNull(),
  primaryColor: varchar("primary_color", { length: 7 }).notNull().default("#8B5CF6"),
  position: text("position").notNull().default("bottom-right"), // bottom-right, bottom-left
  model: text("model").notNull().default("gpt-4o"),
  temperature: integer("temperature").notNull().default(70), // stored as 70 = 0.7
  maxTokens: integer("max_tokens").notNull().default(1000),
  suggestedQuestions: jsonb("suggested_questions").$type<string[]>().notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertChatbotSchema = createInsertSchema(chatbots).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertChatbot = z.infer<typeof insertChatbotSchema>;
export type Chatbot = typeof chatbots.$inferSelect;

// ==================== WHITE LABEL SETTINGS ====================

// White label configuration for enterprise/sovereign users
export const whiteLabelSettings = pgTable("white_label_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  brandName: text("brand_name").notNull(),
  brandNameAr: text("brand_name_ar"),
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),
  primaryColor: varchar("primary_color", { length: 7 }).notNull().default("#8B5CF6"),
  secondaryColor: varchar("secondary_color", { length: 7 }),
  customDomain: text("custom_domain"),
  customCss: text("custom_css"),
  hideWatermark: boolean("hide_watermark").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertWhiteLabelSettingsSchema = createInsertSchema(whiteLabelSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertWhiteLabelSettings = z.infer<typeof insertWhiteLabelSettingsSchema>;
export type WhiteLabelSettings = typeof whiteLabelSettings.$inferSelect;

// ==================== OWNER AI ASSISTANTS ====================

// AI Development Assistants for platform owner
export const aiAssistants = pgTable("ai_assistants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  description: text("description"),
  descriptionAr: text("description_ar"),
  avatar: text("avatar"), // Avatar/icon for the assistant
  specialty: text("specialty").notNull(), // development, design, content, analytics, security
  capabilities: jsonb("capabilities").$type<string[]>().notNull().default([]),
  systemPrompt: text("system_prompt").notNull(),
  model: text("model").notNull().default("claude-sonnet-4-20250514"),
  temperature: integer("temperature").notNull().default(70),
  maxTokens: integer("max_tokens").notNull().default(4000),
  isActive: boolean("is_active").notNull().default(true),
  totalTasksCompleted: integer("total_tasks_completed").notNull().default(0),
  successRate: integer("success_rate").notNull().default(100), // percentage
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAiAssistantSchema = createInsertSchema(aiAssistants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAiAssistant = z.infer<typeof insertAiAssistantSchema>;
export type AiAssistant = typeof aiAssistants.$inferSelect;

// AI Assistant Instructions/Commands from owner
export const assistantInstructions = pgTable("assistant_instructions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assistantId: varchar("assistant_id").notNull(),
  title: text("title").notNull(),
  titleAr: text("title_ar"),
  instruction: text("instruction").notNull(), // The command/directive from owner
  priority: text("priority").notNull().default("normal"), // low, normal, high, urgent
  status: text("status").notNull().default("pending"), // pending, in_progress, completed, failed, cancelled
  category: text("category").notNull().default("general"), // development, design, content, fix, improvement
  response: text("response"), // AI assistant's response/output
  codeGenerated: text("code_generated"), // Any code generated
  filesAffected: jsonb("files_affected").$type<string[]>().default([]),
  executionTime: integer("execution_time"), // in seconds
  approvalRequired: boolean("approval_required").notNull().default(true),
  isApproved: boolean("is_approved").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAssistantInstructionSchema = createInsertSchema(assistantInstructions).omit({
  id: true,
  createdAt: true,
});

export type InsertAssistantInstruction = z.infer<typeof insertAssistantInstructionSchema>;
export type AssistantInstruction = typeof assistantInstructions.$inferSelect;

// AI Task Executions - Real execution log for AI tasks
export const aiTaskExecutions = pgTable("ai_task_executions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  instructionId: varchar("instruction_id").notNull(),
  assistantId: varchar("assistant_id").notNull(),
  userId: varchar("user_id").notNull(),
  
  // Execution details
  model: text("model").notNull(), // gpt-4, claude-3-opus, gemini-pro, etc.
  provider: text("provider").notNull(), // openai, anthropic, google, deepseek
  executionMode: text("execution_mode").notNull().default("AUTO"), // AUTO, MANUAL
  
  // Input/Output
  inputPrompt: text("input_prompt").notNull(),
  systemPrompt: text("system_prompt"),
  outputResponse: text("output_response"),
  
  // Tokens & Cost
  inputTokens: integer("input_tokens").default(0),
  outputTokens: integer("output_tokens").default(0),
  totalTokens: integer("total_tokens").default(0),
  realCostUSD: real("real_cost_usd").default(0), // Actual cost to owner
  billedCostUSD: real("billed_cost_usd").default(0), // Charged to user
  
  // Status
  status: text("status").notNull().default("pending"), // pending, running, completed, failed, cancelled, killed
  errorMessage: text("error_message"),
  
  // Timing
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  executionTimeMs: integer("execution_time_ms"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAiTaskExecutionSchema = createInsertSchema(aiTaskExecutions).omit({
  id: true,
  createdAt: true,
});

export type InsertAiTaskExecution = z.infer<typeof insertAiTaskExecutionSchema>;
export type AiTaskExecution = typeof aiTaskExecutions.$inferSelect;

// AI Kill Switch - Global and per-agent kill switch
export const aiKillSwitch = pgTable("ai_kill_switch", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  scope: text("scope").notNull(), // global, agent, provider
  targetId: varchar("target_id"), // assistantId or provider name (null for global)
  
  isActive: boolean("is_active").notNull().default(false),
  reason: text("reason"),
  reasonAr: text("reason_ar"),
  
  activatedBy: varchar("activated_by").notNull(),
  activatedAt: timestamp("activated_at").defaultNow(),
  deactivatedAt: timestamp("deactivated_at"),
  deactivatedBy: varchar("deactivated_by"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAiKillSwitchSchema = createInsertSchema(aiKillSwitch).omit({
  id: true,
  createdAt: true,
});

export type InsertAiKillSwitch = z.infer<typeof insertAiKillSwitchSchema>;
export type AiKillSwitch = typeof aiKillSwitch.$inferSelect;

// AI Model Configuration - Supported models with pricing
export const aiModelConfigs = pgTable("ai_model_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  modelId: text("model_id").notNull().unique(), // gpt-4, claude-3-opus, etc.
  provider: text("provider").notNull(), // openai, anthropic, google, deepseek
  displayName: text("display_name").notNull(),
  displayNameAr: text("display_name_ar"),
  
  // Pricing per 1M tokens
  inputPricePer1M: real("input_price_per_1m").notNull().default(0),
  outputPricePer1M: real("output_price_per_1m").notNull().default(0),
  
  // Markup for billing users
  markupPercentage: real("markup_percentage").notNull().default(50), // 50% markup
  
  // Capabilities
  maxTokens: integer("max_tokens").notNull().default(4096),
  supportsVision: boolean("supports_vision").notNull().default(false),
  supportsTools: boolean("supports_tools").notNull().default(false),
  
  // Task type recommendations
  recommendedFor: jsonb("recommended_for").$type<string[]>().default([]), // analysis, coding, long_context, cheap_bulk
  
  isActive: boolean("is_active").notNull().default(true),
  priority: integer("priority").notNull().default(0), // Higher = preferred in auto-routing
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAiModelConfigSchema = createInsertSchema(aiModelConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAiModelConfig = z.infer<typeof insertAiModelConfigSchema>;
export type AiModelConfig = typeof aiModelConfigs.$inferSelect;

// Owner Platform Settings
export const ownerSettings = pgTable("owner_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  platformName: text("platform_name").notNull().default("INFERA WebNova"),
  platformNameAr: text("platform_name_ar").notNull().default("إنفيرا ويب نوفا"),
  primaryDomain: text("primary_domain"),
  supportEmail: text("support_email"),
  defaultLanguage: text("default_language").notNull().default("ar"),
  maintenanceMode: boolean("maintenance_mode").notNull().default(false),
  registrationEnabled: boolean("registration_enabled").notNull().default(true),
  globalAnnouncement: text("global_announcement"),
  globalAnnouncementAr: text("global_announcement_ar"),
  analyticsEnabled: boolean("analytics_enabled").notNull().default(true),
  aiAssistantsEnabled: boolean("ai_assistants_enabled").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertOwnerSettingsSchema = createInsertSchema(ownerSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertOwnerSettings = z.infer<typeof insertOwnerSettingsSchema>;
export type OwnerSettings = typeof ownerSettings.$inferSelect;

// Audit Log for owner actions
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  action: text("action").notNull(), // user_created, subscription_activated, assistant_command, etc
  entityType: text("entity_type"), // user, subscription, assistant, project
  entityId: varchar("entity_id"),
  details: jsonb("details").$type<Record<string, any>>(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

// ==================== PAYMENT METHODS ====================

// Available payment provider types
export const paymentProviders = [
  'stripe', 'paypal', 'tap', 'mada', 'apple_pay', 'google_pay', 
  'stc_pay', 'bank_transfer', 'cash_on_delivery', 'crypto'
] as const;
export type PaymentProvider = typeof paymentProviders[number];

// Payment methods configuration (owner-controlled)
export const paymentMethods = pgTable("payment_methods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  provider: text("provider").notNull(), // stripe, paypal, tap, mada, apple_pay, google_pay, stc_pay, bank_transfer, cash_on_delivery, crypto
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  description: text("description"),
  descriptionAr: text("description_ar"),
  icon: text("icon"), // Icon name or URL
  // Configuration (API keys stored as secret references)
  publicKey: text("public_key"), // Public/publishable key (safe to expose)
  secretKeyRef: text("secret_key_ref"), // Reference to secret in vault (never exposed)
  webhookSecret: text("webhook_secret"), // Webhook signing secret reference
  sandboxMode: boolean("sandbox_mode").notNull().default(true),
  // Settings
  supportedCurrencies: jsonb("supported_currencies").$type<string[]>().notNull().default(["USD", "SAR", "AED"]),
  minAmount: integer("min_amount").notNull().default(100), // in cents
  maxAmount: integer("max_amount").notNull().default(1000000), // in cents
  transactionFee: integer("transaction_fee").notNull().default(0), // percentage * 100 (e.g., 250 = 2.5%)
  fixedFee: integer("fixed_fee").notNull().default(0), // fixed fee in cents
  // Regional settings
  supportedCountries: jsonb("supported_countries").$type<string[]>().notNull().default([]),
  // Status
  isActive: boolean("is_active").notNull().default(false),
  isConfigured: boolean("is_configured").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  // Metadata
  settings: jsonb("settings").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;
export type PaymentMethod = typeof paymentMethods.$inferSelect;

// ==================== PAYMENT TRANSACTIONS ====================

// Detailed payment transactions log
export const paymentTransactions = pgTable("payment_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  paymentMethodId: varchar("payment_method_id").notNull(),
  subscriptionId: varchar("subscription_id"),
  // Transaction details
  provider: text("provider").notNull(),
  providerTransactionId: text("provider_transaction_id"), // ID from payment provider
  amount: integer("amount").notNull(), // in cents
  currency: text("currency").notNull().default("USD"),
  fee: integer("fee").notNull().default(0), // transaction fee in cents
  netAmount: integer("net_amount").notNull(), // amount after fees
  // Status
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed, refunded, cancelled
  failureReason: text("failure_reason"),
  failureCode: text("failure_code"),
  // Customer info
  customerEmail: text("customer_email"),
  customerName: text("customer_name"),
  // Billing
  billingCycle: text("billing_cycle"), // monthly, quarterly, semi_annual, yearly
  planName: text("plan_name"),
  // Metadata
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  // Timestamps
  processedAt: timestamp("processed_at"),
  refundedAt: timestamp("refunded_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPaymentTransactionSchema = createInsertSchema(paymentTransactions).omit({
  id: true,
  createdAt: true,
});

export type InsertPaymentTransaction = z.infer<typeof insertPaymentTransactionSchema>;
export type PaymentTransaction = typeof paymentTransactions.$inferSelect;

// Payment Analytics type for dashboard
export interface PaymentAnalytics {
  totalRevenue: number;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  refundedTransactions: number;
  averageTransactionValue: number;
  revenueByProvider: { provider: string; revenue: number; count: number }[];
  revenueByMonth: { month: string; revenue: number; count: number }[];
  topCountries: { country: string; revenue: number; count: number }[];
}

// ==================== AUTHENTICATION METHODS ====================

// Available authentication method types
export const authMethodTypes = [
  'email_password', 'google', 'facebook', 'twitter', 'github', 
  'apple', 'microsoft', 'otp_email', 'otp_sms', 'magic_link'
] as const;
export type AuthMethodType = typeof authMethodTypes[number];

// Authentication methods configuration (owner-controlled)
export const authMethods = pgTable("auth_methods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(), // email_password, google, facebook, etc.
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  description: text("description"),
  descriptionAr: text("description_ar"),
  icon: text("icon"), // Icon name from lucide-react
  // Configuration
  clientId: text("client_id"), // OAuth client ID
  clientSecretRef: text("client_secret_ref"), // Reference to secret in vault
  redirectUri: text("redirect_uri"),
  scopes: jsonb("scopes").$type<string[]>().default([]),
  // Status controls
  isActive: boolean("is_active").notNull().default(false),
  isVisible: boolean("is_visible").notNull().default(true),
  isDefault: boolean("is_default").notNull().default(false), // Default method cannot be disabled
  isConfigured: boolean("is_configured").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  // Additional settings
  settings: jsonb("settings").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAuthMethodSchema = createInsertSchema(authMethods).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAuthMethod = z.infer<typeof insertAuthMethodSchema>;
export type AuthMethod = typeof authMethods.$inferSelect;

// ==================== AI GOVERNANCE ====================

// AI Models configuration (owner-controlled)
export const aiModels = pgTable("ai_models", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  provider: text("provider").notNull(), // openai, anthropic, google, local
  modelId: text("model_id").notNull().unique(), // gpt-4, claude-3, gemini-pro
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  description: text("description"),
  descriptionAr: text("description_ar"),
  // Capabilities
  capabilities: jsonb("capabilities").$type<string[]>().notNull().default([]), // text, code, vision, embedding
  maxTokens: integer("max_tokens").notNull().default(4096),
  contextWindow: integer("context_window").notNull().default(128000),
  // Cost tracking (per 1M tokens)
  inputCostPer1M: integer("input_cost_per_1m").notNull().default(0), // in cents
  outputCostPer1M: integer("output_cost_per_1m").notNull().default(0), // in cents
  // Status
  isActive: boolean("is_active").notNull().default(true),
  isDefault: boolean("is_default").notNull().default(false),
  allowedPlans: jsonb("allowed_plans").$type<string[]>().notNull().default(["pro", "enterprise", "sovereign", "owner"]),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAiModelSchema = createInsertSchema(aiModels).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAiModel = z.infer<typeof insertAiModelSchema>;
export type AiModel = typeof aiModels.$inferSelect;

// AI Usage Policies by Plan (owner-controlled limits)
export const aiUsagePolicies = pgTable("ai_usage_policies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  planRole: text("plan_role").notNull().unique(), // free, basic, pro, enterprise, sovereign
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  // Request limits
  dailyRequestLimit: integer("daily_request_limit").notNull().default(10),
  monthlyRequestLimit: integer("monthly_request_limit").notNull().default(100),
  maxTokensPerRequest: integer("max_tokens_per_request").notNull().default(2000),
  // Cost limits
  dailyCostLimit: integer("daily_cost_limit").notNull().default(100), // in cents
  monthlyCostLimit: integer("monthly_cost_limit").notNull().default(1000), // in cents
  // Feature access
  allowedModels: jsonb("allowed_models").$type<string[]>().notNull().default([]),
  allowCodeGeneration: boolean("allow_code_generation").notNull().default(true),
  allowImageGeneration: boolean("allow_image_generation").notNull().default(false),
  allowVision: boolean("allow_vision").notNull().default(false),
  // Rate limiting
  requestsPerMinute: integer("requests_per_minute").notNull().default(5),
  requestsPerHour: integer("requests_per_hour").notNull().default(50),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAiUsagePolicySchema = createInsertSchema(aiUsagePolicies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAiUsagePolicy = z.infer<typeof insertAiUsagePolicySchema>;
export type AiUsagePolicy = typeof aiUsagePolicies.$inferSelect;

// AI Cost Tracking (real-time cost monitoring)
export const aiCostTracking = pgTable("ai_cost_tracking", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  modelId: varchar("model_id").notNull(),
  // Usage metrics
  inputTokens: integer("input_tokens").notNull().default(0),
  outputTokens: integer("output_tokens").notNull().default(0),
  totalTokens: integer("total_tokens").notNull().default(0),
  // Cost calculation
  inputCost: integer("input_cost").notNull().default(0), // in cents
  outputCost: integer("output_cost").notNull().default(0), // in cents
  totalCost: integer("total_cost").notNull().default(0), // in cents
  // Context
  feature: text("feature").notNull().default("chat"), // chat, code_gen, image_gen, seo, chatbot
  projectId: varchar("project_id"),
  sessionId: varchar("session_id"),
  // Timestamps
  date: text("date").notNull(), // YYYY-MM-DD for daily aggregation
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAiCostTrackingSchema = createInsertSchema(aiCostTracking).omit({
  id: true,
  createdAt: true,
});

export type InsertAiCostTracking = z.infer<typeof insertAiCostTrackingSchema>;
export type AiCostTracking = typeof aiCostTracking.$inferSelect;

// Emergency AI Controls
export const emergencyControls = pgTable("emergency_controls", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // ai_suspension, platform_lockdown, feature_disable
  scope: text("scope").notNull().default("global"), // global, feature, plan, user
  scopeValue: text("scope_value"), // feature name, plan role, or user id
  reason: text("reason").notNull(),
  reasonAr: text("reason_ar"),
  activatedBy: varchar("activated_by").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  activatedAt: timestamp("activated_at").defaultNow(),
  deactivatedAt: timestamp("deactivated_at"),
  deactivatedBy: varchar("deactivated_by"),
  autoDeactivateAt: timestamp("auto_deactivate_at"), // Optional auto-deactivation
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEmergencyControlSchema = createInsertSchema(emergencyControls).omit({
  id: true,
  createdAt: true,
});

export type InsertEmergencyControl = z.infer<typeof insertEmergencyControlSchema>;
export type EmergencyControl = typeof emergencyControls.$inferSelect;

// ==================== FEATURE FLAGS ====================

// Feature flags for controlled rollout
export const featureFlags = pgTable("feature_flags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(), // feature_chatbot, feature_seo, etc.
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  description: text("description"),
  descriptionAr: text("description_ar"),
  // Rollout configuration
  isEnabled: boolean("is_enabled").notNull().default(false),
  rolloutPercentage: integer("rollout_percentage").notNull().default(0), // 0-100
  allowedPlans: jsonb("allowed_plans").$type<string[]>().notNull().default([]),
  allowedUserIds: jsonb("allowed_user_ids").$type<string[]>().default([]), // Beta users
  // A/B testing
  isABTest: boolean("is_ab_test").notNull().default(false),
  variants: jsonb("variants").$type<{ name: string; weight: number }[]>().default([]),
  // Scheduling
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  // Metadata
  category: text("category").notNull().default("feature"), // feature, experiment, operational
  tags: jsonb("tags").$type<string[]>().default([]),
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFeatureFlagSchema = createInsertSchema(featureFlags).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertFeatureFlag = z.infer<typeof insertFeatureFlagSchema>;
export type FeatureFlag = typeof featureFlags.$inferSelect;

// System Announcements
export const systemAnnouncements = pgTable("system_announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  titleAr: text("title_ar").notNull(),
  message: text("message").notNull(),
  messageAr: text("message_ar").notNull(),
  type: text("type").notNull().default("info"), // info, warning, error, success, maintenance
  priority: text("priority").notNull().default("normal"), // low, normal, high, critical
  // Targeting
  targetPlans: jsonb("target_plans").$type<string[]>().default([]), // Empty = all plans
  targetUserIds: jsonb("target_user_ids").$type<string[]>().default([]), // Specific users
  // Display settings
  isDismissible: boolean("is_dismissible").notNull().default(true),
  showOnDashboard: boolean("show_on_dashboard").notNull().default(true),
  showOnLogin: boolean("show_on_login").notNull().default(false),
  showAsBanner: boolean("show_as_banner").notNull().default(false),
  // Scheduling
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").notNull().default(true),
  // Tracking
  viewCount: integer("view_count").notNull().default(0),
  dismissCount: integer("dismiss_count").notNull().default(0),
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSystemAnnouncementSchema = createInsertSchema(systemAnnouncements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSystemAnnouncement = z.infer<typeof insertSystemAnnouncementSchema>;
export type SystemAnnouncement = typeof systemAnnouncements.$inferSelect;

// ==================== RBAC & PERMISSIONS ====================

// Admin Roles (granular permissions)
export const adminRoles = pgTable("admin_roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(), // super_admin, content_admin, support_admin
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  description: text("description"),
  descriptionAr: text("description_ar"),
  // Permissions (bitfield or array)
  permissions: jsonb("permissions").$type<string[]>().notNull().default([]),
  // Hierarchy
  level: integer("level").notNull().default(0), // Higher = more authority
  parentRoleId: varchar("parent_role_id"),
  isSystem: boolean("is_system").notNull().default(false), // Cannot be deleted
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAdminRoleSchema = createInsertSchema(adminRoles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAdminRole = z.infer<typeof insertAdminRoleSchema>;
export type AdminRole = typeof adminRoles.$inferSelect;

// User-Role assignments
export const userAdminRoles = pgTable("user_admin_roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  roleId: varchar("role_id").notNull(),
  assignedBy: varchar("assigned_by").notNull(),
  expiresAt: timestamp("expires_at"), // Optional expiration
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserAdminRoleSchema = createInsertSchema(userAdminRoles).omit({
  id: true,
  createdAt: true,
});

export type InsertUserAdminRole = z.infer<typeof insertUserAdminRoleSchema>;
export type UserAdminRole = typeof userAdminRoles.$inferSelect;

// Permission definitions
export const permissions = [
  // User management
  "users:read", "users:create", "users:update", "users:delete", "users:ban",
  // Subscriptions
  "subscriptions:read", "subscriptions:create", "subscriptions:update", "subscriptions:cancel",
  // Projects
  "projects:read", "projects:create", "projects:update", "projects:delete", "projects:publish",
  // AI
  "ai:read", "ai:configure", "ai:suspend", "ai:manage_models",
  // Platform
  "platform:read", "platform:configure", "platform:maintenance",
  // Payments
  "payments:read", "payments:refund", "payments:configure",
  // Features
  "features:read", "features:create", "features:update", "features:delete",
  // Announcements
  "announcements:read", "announcements:create", "announcements:update", "announcements:delete",
  // Audit
  "audit:read", "audit:export",
  // Owner
  "owner:full_access"
] as const;
export type Permission = typeof permissions[number];

// ==================== PLATFORM INTELLIGENCE ====================

// Platform metrics snapshot (daily aggregation)
export const platformMetrics = pgTable("platform_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull(), // YYYY-MM-DD
  // User metrics
  totalUsers: integer("total_users").notNull().default(0),
  activeUsers: integer("active_users").notNull().default(0),
  newUsers: integer("new_users").notNull().default(0),
  churnedUsers: integer("churned_users").notNull().default(0),
  // Subscription metrics
  usersByPlan: jsonb("users_by_plan").$type<Record<string, number>>().default({}),
  newSubscriptions: integer("new_subscriptions").notNull().default(0),
  cancelledSubscriptions: integer("cancelled_subscriptions").notNull().default(0),
  upgrades: integer("upgrades").notNull().default(0),
  downgrades: integer("downgrades").notNull().default(0),
  // Revenue metrics
  dailyRevenue: integer("daily_revenue").notNull().default(0), // in cents
  mrr: integer("mrr").notNull().default(0), // Monthly recurring revenue
  arr: integer("arr").notNull().default(0), // Annual recurring revenue
  // AI metrics
  aiRequests: integer("ai_requests").notNull().default(0),
  aiTokensUsed: integer("ai_tokens_used").notNull().default(0),
  aiCost: integer("ai_cost").notNull().default(0), // in cents
  // Project metrics
  totalProjects: integer("total_projects").notNull().default(0),
  newProjects: integer("new_projects").notNull().default(0),
  publishedProjects: integer("published_projects").notNull().default(0),
  // System metrics
  pageViews: integer("page_views").notNull().default(0),
  apiCalls: integer("api_calls").notNull().default(0),
  errorRate: integer("error_rate").notNull().default(0), // percentage * 100
  avgResponseTime: integer("avg_response_time").notNull().default(0), // ms
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPlatformMetricsSchema = createInsertSchema(platformMetrics).omit({
  id: true,
  createdAt: true,
});

export type InsertPlatformMetrics = z.infer<typeof insertPlatformMetricsSchema>;
export type PlatformMetrics = typeof platformMetrics.$inferSelect;

// Revenue Intelligence (subscription events)
export const subscriptionEvents = pgTable("subscription_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  subscriptionId: varchar("subscription_id"),
  eventType: text("event_type").notNull(), // created, activated, upgraded, downgraded, cancelled, expired, renewed
  previousPlan: text("previous_plan"),
  newPlan: text("new_plan"),
  previousPrice: integer("previous_price"), // in cents
  newPrice: integer("new_price"), // in cents
  reason: text("reason"), // churn reason for cancellations
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSubscriptionEventSchema = createInsertSchema(subscriptionEvents).omit({
  id: true,
  createdAt: true,
});

export type InsertSubscriptionEvent = z.infer<typeof insertSubscriptionEventSchema>;
export type SubscriptionEvent = typeof subscriptionEvents.$inferSelect;

// Executive Dashboard Summary Types
export interface ExecutiveDashboardSummary {
  // Overview
  healthScore: number; // 0-100
  criticalAlerts: number;
  // User metrics
  totalUsers: number;
  activeUsersToday: number;
  newUsersThisWeek: number;
  churnRate: number;
  // Revenue metrics
  mrr: number;
  arr: number;
  revenueGrowth: number;
  avgRevenuePerUser: number;
  // AI metrics
  aiRequestsToday: number;
  aiCostToday: number;
  aiEmergencyActive: boolean;
  // Platform status
  maintenanceMode: boolean;
  activeEmergencyControls: number;
  systemAnnouncements: number;
}

// ==================== SOVEREIGN AI ASSISTANTS ====================

// Sovereign Assistant Types
export const sovereignAssistantTypes = [
  'ai_governor',        // Manages AI lifecycle, costs, usage ceilings, behavioral integrity
  'platform_architect', // Oversees system architecture, scalability, feature flags, phased deployments
  'operations_commander', // Maintains system health, incident response, emergency protocols
  'security_guardian',  // Security & Compliance Guardian - detects anomalies, isolates breaches, enforces compliance
  'growth_strategist'   // Business & Growth Strategist - revenue, churn, conversion, engagement optimization
] as const;
export type SovereignAssistantType = typeof sovereignAssistantTypes[number];

// Sovereign AI Assistants - Platform-level autonomous AI agents
export const sovereignAssistants = pgTable("sovereign_assistants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // ai_governor, platform_architect, operations_commander, security_guardian, growth_strategist
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  description: text("description").notNull(),
  descriptionAr: text("description_ar").notNull(),
  avatar: text("avatar"),
  // Capabilities and scope
  capabilities: jsonb("capabilities").$type<string[]>().notNull().default([]),
  capabilitiesAr: jsonb("capabilities_ar").$type<string[]>().default([]),
  scopeOfAuthority: jsonb("scope_of_authority").$type<string[]>().notNull().default([]),
  constraints: jsonb("constraints").$type<string[]>().notNull().default([]),
  // AI configuration
  systemPrompt: text("system_prompt").notNull(),
  model: text("model").notNull().default("claude-sonnet-4-20250514"),
  temperature: integer("temperature").notNull().default(50), // Lower for more deterministic actions
  maxTokens: integer("max_tokens").notNull().default(8000),
  // Status and metrics
  isActive: boolean("is_active").notNull().default(true),
  isAutonomous: boolean("is_autonomous").notNull().default(false), // Can execute without approval
  totalCommandsExecuted: integer("total_commands_executed").notNull().default(0),
  totalActionsExecuted: integer("total_actions_executed").notNull().default(0),
  successRate: integer("success_rate").notNull().default(100),
  lastActiveAt: timestamp("last_active_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSovereignAssistantSchema = createInsertSchema(sovereignAssistants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSovereignAssistant = z.infer<typeof insertSovereignAssistantSchema>;
export type SovereignAssistant = typeof sovereignAssistants.$inferSelect;

// Sovereign Commands - High-level directives from Owner
export const sovereignCommands = pgTable("sovereign_commands", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assistantId: varchar("assistant_id").notNull(),
  issuedBy: varchar("issued_by").notNull(), // Owner user ID
  // Command details
  directive: text("directive").notNull(), // The high-level command (e.g., "reduce AI costs by 20%")
  directiveAr: text("directive_ar"),
  category: text("category").notNull().default("general"), // governance, operations, security, revenue, infrastructure
  priority: text("priority").notNull().default("normal"), // low, normal, high, critical
  // Interpretation and planning
  interpretation: text("interpretation"), // AI's understanding of the directive
  proposedPlan: jsonb("proposed_plan").$type<{
    steps: Array<{
      order: number;
      action: string;
      target: string;
      parameters: Record<string, any>;
      riskLevel: string;
      reversible: boolean;
    }>;
    estimatedDuration: number;
    riskAssessment: string;
  }>(),
  // Simulation mode - preview impact without execution
  isSimulation: boolean("is_simulation").notNull().default(false),
  simulationResult: jsonb("simulation_result").$type<{
    projectedImpact: Record<string, any>;
    affectedEntities: string[];
    riskScore: number;
    recommendations: string[];
  }>(),
  // Approval workflow
  requiresApproval: boolean("requires_approval").notNull().default(true),
  isApproved: boolean("is_approved").default(false),
  approvedBy: varchar("approved_by"),
  approvedAt: timestamp("approved_at"),
  // Execution status
  status: text("status").notNull().default("pending"), // pending, planning, awaiting_approval, executing, completed, failed, cancelled, rolled_back
  progress: integer("progress").notNull().default(0), // 0-100
  currentStep: integer("current_step").notNull().default(0),
  totalSteps: integer("total_steps").notNull().default(0),
  // Results
  result: text("result"),
  resultAr: text("result_ar"),
  metrics: jsonb("metrics").$type<Record<string, any>>(), // Command-specific metrics
  errors: jsonb("errors").$type<Array<{ step: number; error: string; timestamp: string }>>().default([]),
  // Reversibility
  isReversible: boolean("is_reversible").notNull().default(true),
  rollbackPlan: jsonb("rollback_plan").$type<Array<{ action: string; target: string; parameters: Record<string, any> }>>(),
  rolledBackAt: timestamp("rolled_back_at"),
  rolledBackBy: varchar("rolled_back_by"),
  // Timestamps
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSovereignCommandSchema = createInsertSchema(sovereignCommands).omit({
  id: true,
  createdAt: true,
});

export type InsertSovereignCommand = z.infer<typeof insertSovereignCommandSchema>;
export type SovereignCommand = typeof sovereignCommands.$inferSelect;

// Sovereign Actions - Individual actions within a command execution
export const sovereignActions = pgTable("sovereign_actions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  commandId: varchar("command_id").notNull(),
  assistantId: varchar("assistant_id").notNull(),
  // Action details
  stepNumber: integer("step_number").notNull(),
  actionType: text("action_type").notNull(), // adjust_model, update_policy, toggle_feature, allocate_resource, send_alert, etc.
  target: text("target").notNull(), // What is being acted upon
  targetId: varchar("target_id"), // ID of the target entity
  parameters: jsonb("parameters").$type<Record<string, any>>().default({}),
  // Before/after state for reversibility
  previousState: jsonb("previous_state").$type<Record<string, any>>(),
  newState: jsonb("new_state").$type<Record<string, any>>(),
  // Execution
  status: text("status").notNull().default("pending"), // pending, executing, completed, failed, skipped, rolled_back
  result: text("result"),
  errorMessage: text("error_message"),
  // Risk assessment
  riskLevel: text("risk_level").notNull().default("low"), // low, medium, high, critical
  isReversible: boolean("is_reversible").notNull().default(true),
  // Timestamps
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSovereignActionSchema = createInsertSchema(sovereignActions).omit({
  id: true,
  createdAt: true,
});

export type InsertSovereignAction = z.infer<typeof insertSovereignActionSchema>;
export type SovereignAction = typeof sovereignActions.$inferSelect;

// Sovereign Action Logs - Immutable audit trail
export const sovereignActionLogs = pgTable("sovereign_action_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  commandId: varchar("command_id"),
  actionId: varchar("action_id"),
  assistantId: varchar("assistant_id").notNull(),
  actorId: varchar("actor_id").notNull(), // User or assistant that triggered
  actorType: text("actor_type").notNull().default("assistant"), // assistant, owner, system
  // Log details
  eventType: text("event_type").notNull(), // command_issued, plan_created, approval_requested, action_started, action_completed, action_failed, rollback_initiated, override_applied
  eventDescription: text("event_description").notNull(),
  eventDescriptionAr: text("event_description_ar"),
  // Context
  targetEntity: text("target_entity"),
  targetId: varchar("target_id"),
  previousValue: jsonb("previous_value").$type<Record<string, any>>(),
  newValue: jsonb("new_value").$type<Record<string, any>>(),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  // Immutability
  checksum: text("checksum"), // SHA-256 of log entry for integrity verification
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSovereignActionLogSchema = createInsertSchema(sovereignActionLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertSovereignActionLog = z.infer<typeof insertSovereignActionLogSchema>;
export type SovereignActionLog = typeof sovereignActionLogs.$inferSelect;

// Sovereign Governance Policies - Rules and constraints for assistants
export const sovereignPolicies = pgTable("sovereign_policies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assistantType: text("assistant_type").notNull(), // Which assistant type this applies to
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  description: text("description"),
  descriptionAr: text("description_ar"),
  // Policy rules
  ruleType: text("rule_type").notNull(), // limit, threshold, approval_required, forbidden, allowed
  target: text("target").notNull(), // What the policy affects (e.g., "ai_model_changes", "feature_flags")
  conditions: jsonb("conditions").$type<Record<string, any>>().default({}), // Conditions for the rule
  value: jsonb("value").$type<any>(), // The limit/threshold value
  // Enforcement
  isActive: boolean("is_active").notNull().default(true),
  enforcementLevel: text("enforcement_level").notNull().default("strict"), // strict, warn, log_only
  violationAction: text("violation_action").notNull().default("block"), // block, notify, escalate, log
  // Metadata
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSovereignPolicySchema = createInsertSchema(sovereignPolicies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSovereignPolicy = z.infer<typeof insertSovereignPolicySchema>;
export type SovereignPolicy = typeof sovereignPolicies.$inferSelect;

// ==================== AI APP BUILDER ====================

// AI App Builder Sessions - Tracks complete app generation sessions
export const aiBuildSessions = pgTable("ai_build_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"), // Can be null for anonymous users
  // Request details
  prompt: text("prompt").notNull(), // Original user prompt
  promptAr: text("prompt_ar"), // Arabic version of prompt
  appType: text("app_type"), // Detected app type (hr_platform, ecommerce, blog, etc.)
  appName: text("app_name").notNull().default("New Application"),
  appNameAr: text("app_name_ar"),
  // Planning
  plan: jsonb("plan").$type<{
    summary: string;
    summaryAr: string;
    estimatedTime: number; // in minutes
    steps: Array<{
      order: number;
      type: 'database' | 'backend' | 'frontend' | 'auth' | 'styling' | 'integration';
      title: string;
      titleAr: string;
      description: string;
      descriptionAr: string;
      estimatedTime: number;
    }>;
    features: string[];
    featuresAr: string[];
    techStack: {
      database: string;
      backend: string;
      frontend: string;
      styling: string;
    };
  }>(),
  // Progress
  status: text("status").notNull().default("planning"), // planning, building, completed, failed, cancelled
  progress: integer("progress").notNull().default(0), // 0-100
  currentStep: integer("current_step").notNull().default(0),
  totalSteps: integer("total_steps").notNull().default(0),
  // Generated output
  projectId: varchar("project_id"), // Links to generated project
  generatedSchema: text("generated_schema"), // Database schema
  generatedBackend: text("generated_backend"), // Backend code
  generatedFrontend: text("generated_frontend"), // Frontend code
  generatedStyles: text("generated_styles"), // CSS/styling
  // Metadata
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAiBuildSessionSchema = createInsertSchema(aiBuildSessions).omit({
  id: true,
  createdAt: true,
});

export type InsertAiBuildSession = z.infer<typeof insertAiBuildSessionSchema>;
export type AiBuildSession = typeof aiBuildSessions.$inferSelect;

// AI Build Tasks - Individual tasks within a build session
export const aiBuildTasks = pgTable("ai_build_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  // Task details
  stepNumber: integer("step_number").notNull(),
  taskType: text("task_type").notNull(), // database, backend, frontend, auth, styling, integration
  title: text("title").notNull(),
  titleAr: text("title_ar"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  // Execution
  status: text("status").notNull().default("pending"), // pending, running, completed, failed, skipped
  progress: integer("progress").notNull().default(0), // 0-100
  // Input/Output
  input: jsonb("input").$type<Record<string, any>>().default({}),
  output: text("output"), // Generated code or result
  outputType: text("output_type"), // code, schema, config, etc.
  // AI interaction
  aiPrompt: text("ai_prompt"),
  aiResponse: text("ai_response"),
  tokensUsed: integer("tokens_used").default(0),
  // Timing
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAiBuildTaskSchema = createInsertSchema(aiBuildTasks).omit({
  id: true,
  createdAt: true,
});

export type InsertAiBuildTask = z.infer<typeof insertAiBuildTaskSchema>;
export type AiBuildTask = typeof aiBuildTasks.$inferSelect;

// AI Build Artifacts - Generated files and assets
export const aiBuildArtifacts = pgTable("ai_build_artifacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  taskId: varchar("task_id"),
  // Artifact details
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileType: text("file_type").notNull(), // ts, tsx, sql, css, json, etc.
  category: text("category").notNull(), // schema, route, component, style, config
  // Content
  content: text("content").notNull(),
  contentHash: text("content_hash"), // For detecting changes
  // Metadata
  version: integer("version").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAiBuildArtifactSchema = createInsertSchema(aiBuildArtifacts).omit({
  id: true,
  createdAt: true,
});

export type InsertAiBuildArtifact = z.infer<typeof insertAiBuildArtifactSchema>;
export type AiBuildArtifact = typeof aiBuildArtifacts.$inferSelect;

// ==================== CLOUD DEVELOPMENT ENVIRONMENT ====================
// Note: devProjects and related tables are defined in ISDS section below

// Project Files - Multi-file storage for development projects
export const projectFiles = pgTable("project_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  // File info
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(), // e.g., /src/components/Button.tsx
  fileType: text("file_type").notNull(), // js, ts, tsx, css, html, json, md, etc.
  isDirectory: boolean("is_directory").notNull().default(false),
  // Content
  content: text("content").notNull().default(""),
  // Metadata
  size: integer("size").default(0),
  isLocked: boolean("is_locked").notNull().default(false),
  lastModifiedBy: varchar("last_modified_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProjectFileSchema = createInsertSchema(projectFiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProjectFile = z.infer<typeof insertProjectFileSchema>;
export type ProjectFile = typeof projectFiles.$inferSelect;

// Runtime Instances - Sandboxed execution environments
export const runtimeInstances = pgTable("runtime_instances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  userId: varchar("user_id"),
  // Instance info
  status: text("status").notNull().default("stopped"), // stopped, starting, running, stopping, error
  port: integer("port"),
  pid: integer("pid"),
  // Resources
  cpuLimit: integer("cpu_limit").default(50), // percentage
  memoryLimit: integer("memory_limit").default(256), // MB
  networkEnabled: boolean("network_enabled").notNull().default(true),
  // Logs
  lastOutput: text("last_output"),
  lastError: text("last_error"),
  // Timing
  startedAt: timestamp("started_at"),
  stoppedAt: timestamp("stopped_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRuntimeInstanceSchema = createInsertSchema(runtimeInstances).omit({
  id: true,
  createdAt: true,
});

export type InsertRuntimeInstance = z.infer<typeof insertRuntimeInstanceSchema>;
export type RuntimeInstance = typeof runtimeInstances.$inferSelect;

// Console Logs - Runtime output history
export const consoleLogs = pgTable("console_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  instanceId: varchar("instance_id"),
  // Log info
  logType: text("log_type").notNull().default("stdout"), // stdout, stderr, system
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertConsoleLogSchema = createInsertSchema(consoleLogs).omit({
  id: true,
  timestamp: true,
});

export type InsertConsoleLog = z.infer<typeof insertConsoleLogSchema>;
export type ConsoleLog = typeof consoleLogs.$inferSelect;

// ==================== CLOUD IDE DATABASE MANAGEMENT ====================

// Column Types supported in Schema Builder
export const columnDataTypes = ['text', 'integer', 'boolean', 'timestamp', 'jsonb', 'varchar', 'uuid', 'decimal', 'date', 'time', 'array'] as const;
export type ColumnDataType = typeof columnDataTypes[number];

// Dev Database Tables - User-defined tables in Cloud IDE projects
export const devDatabaseTables = pgTable("dev_database_tables", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  // Table info
  tableName: text("table_name").notNull(), // e.g., users, products
  tableNameDisplay: text("table_name_display"), // Human-readable name
  tableNameDisplayAr: text("table_name_display_ar"), // Arabic display name
  description: text("description"),
  descriptionAr: text("description_ar"),
  // Schema config
  hasPrimaryKey: boolean("has_primary_key").notNull().default(true),
  primaryKeyType: text("primary_key_type").default("uuid"), // uuid, serial, custom
  hasTimestamps: boolean("has_timestamps").notNull().default(true), // createdAt, updatedAt
  isSoftDelete: boolean("is_soft_delete").notNull().default(false), // deletedAt column
  // API config
  generateCrudApi: boolean("generate_crud_api").notNull().default(true),
  apiPrefix: text("api_prefix").default("/api"),
  requireAuth: boolean("require_auth").notNull().default(false),
  // Status
  isActive: boolean("is_active").notNull().default(true),
  isMigrated: boolean("is_migrated").notNull().default(false),
  migrationError: text("migration_error"),
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDevDatabaseTableSchema = createInsertSchema(devDatabaseTables).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDevDatabaseTable = z.infer<typeof insertDevDatabaseTableSchema>;
export type DevDatabaseTable = typeof devDatabaseTables.$inferSelect;

// Dev Database Columns - Columns for user-defined tables
export const devDatabaseColumns = pgTable("dev_database_columns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tableId: varchar("table_id").notNull(),
  projectId: varchar("project_id").notNull(),
  // Column info
  columnName: text("column_name").notNull(),
  columnNameDisplay: text("column_name_display"),
  columnNameDisplayAr: text("column_name_display_ar"),
  dataType: text("data_type").notNull(), // text, integer, boolean, timestamp, jsonb, etc.
  // Constraints
  isNullable: boolean("is_nullable").notNull().default(true),
  isUnique: boolean("is_unique").notNull().default(false),
  defaultValue: text("default_value"),
  // Validation
  minLength: integer("min_length"),
  maxLength: integer("max_length"),
  minValue: text("min_value"),
  maxValue: text("max_value"),
  pattern: text("pattern"), // Regex pattern for validation
  // References (Foreign Keys)
  referencesTable: varchar("references_table"),
  referencesColumn: varchar("references_column"),
  onDelete: text("on_delete").default("CASCADE"), // CASCADE, SET NULL, RESTRICT
  // Display
  displayOrder: integer("display_order").notNull().default(0),
  isVisible: boolean("is_visible").notNull().default(true),
  isSearchable: boolean("is_searchable").notNull().default(false),
  isFilterable: boolean("is_filterable").notNull().default(false),
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDevDatabaseColumnSchema = createInsertSchema(devDatabaseColumns).omit({
  id: true,
  createdAt: true,
});

export type InsertDevDatabaseColumn = z.infer<typeof insertDevDatabaseColumnSchema>;
export type DevDatabaseColumn = typeof devDatabaseColumns.$inferSelect;

// Dev Database Relationships - Table relationships
export const devDatabaseRelationships = pgTable("dev_database_relationships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  // Relationship info
  relationshipName: text("relationship_name").notNull(),
  relationshipType: text("relationship_type").notNull(), // oneToOne, oneToMany, manyToMany
  // Source
  sourceTableId: varchar("source_table_id").notNull(),
  sourceColumnId: varchar("source_column_id"),
  // Target
  targetTableId: varchar("target_table_id").notNull(),
  targetColumnId: varchar("target_column_id"),
  // For many-to-many relationships
  junctionTableName: text("junction_table_name"),
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDevDatabaseRelationshipSchema = createInsertSchema(devDatabaseRelationships).omit({
  id: true,
  createdAt: true,
});

export type InsertDevDatabaseRelationship = z.infer<typeof insertDevDatabaseRelationshipSchema>;
export type DevDatabaseRelationship = typeof devDatabaseRelationships.$inferSelect;

// ==================== CORE EVENT STORE ====================

// Event Store - Durable event storage for Event Sourcing
export const eventStore = pgTable("event_store", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().unique(),
  eventType: text("event_type").notNull(),
  aggregateId: varchar("aggregate_id"),
  aggregateType: text("aggregate_type"),
  tenantId: varchar("tenant_id"),
  correlationId: varchar("correlation_id"),
  causationId: varchar("causation_id"),
  sequence: integer("sequence").notNull(),
  version: text("version").notNull().default("1.0"),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  source: text("source").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEventStoreSchema = createInsertSchema(eventStore).omit({
  id: true,
  createdAt: true,
});

export type InsertEventStore = z.infer<typeof insertEventStoreSchema>;
export type EventStoreRecord = typeof eventStore.$inferSelect;

// Query Store - Projections for CQRS pattern
export const queryStore = pgTable("query_store", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectionName: text("projection_name").notNull(),
  projectionId: varchar("projection_id").notNull(),
  tenantId: varchar("tenant_id"),
  data: jsonb("data").$type<Record<string, unknown>>().notNull(),
  version: integer("version").notNull().default(1),
  lastEventSequence: integer("last_event_sequence"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertQueryStoreSchema = createInsertSchema(queryStore).omit({
  id: true,
  updatedAt: true,
});

export type InsertQueryStore = z.infer<typeof insertQueryStoreSchema>;
export type QueryStoreRecord = typeof queryStore.$inferSelect;

// Dead Letter Queue - Failed events for retry/investigation
export const deadLetterQueue = pgTable("dead_letter_queue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull(),
  eventType: text("event_type").notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  errorMessage: text("error_message").notNull(),
  errorStack: text("error_stack"),
  retryCount: integer("retry_count").notNull().default(0),
  maxRetries: integer("max_retries").notNull().default(3),
  status: text("status").notNull().default("pending"), // pending, retrying, failed, resolved
  lastRetryAt: timestamp("last_retry_at"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDeadLetterQueueSchema = createInsertSchema(deadLetterQueue).omit({
  id: true,
  createdAt: true,
});

export type InsertDeadLetterQueue = z.infer<typeof insertDeadLetterQueueSchema>;
export type DeadLetterQueueRecord = typeof deadLetterQueue.$inferSelect;

// Aggregate Snapshots - Performance optimization for event replay
export const aggregateSnapshots = pgTable("aggregate_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  aggregateId: varchar("aggregate_id").notNull(),
  aggregateType: text("aggregate_type").notNull(),
  tenantId: varchar("tenant_id"),
  version: integer("version").notNull(),
  state: jsonb("state").$type<Record<string, unknown>>().notNull(),
  lastEventSequence: integer("last_event_sequence").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAggregateSnapshotSchema = createInsertSchema(aggregateSnapshots).omit({
  id: true,
  createdAt: true,
});

export type InsertAggregateSnapshot = z.infer<typeof insertAggregateSnapshotSchema>;
export type AggregateSnapshotRecord = typeof aggregateSnapshots.$inferSelect;

// AI Task Queue - Durable AI task storage
export const aiTaskQueue = pgTable("ai_task_queue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id"),
  type: text("type").notNull(), // generation, analysis, review, optimization, transformation
  priority: text("priority").notNull().default("normal"), // critical, high, normal, low
  status: text("status").notNull().default("queued"), // queued, running, completed, failed, cancelled
  input: jsonb("input").$type<Record<string, unknown>>().notNull(),
  output: jsonb("output").$type<Record<string, unknown>>(),
  assignedModel: text("assigned_model"),
  retryCount: integer("retry_count").notNull().default(0),
  maxRetries: integer("max_retries").notNull().default(3),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  error: text("error"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAiTaskQueueSchema = createInsertSchema(aiTaskQueue).omit({
  id: true,
  createdAt: true,
});

export type InsertAiTaskQueue = z.infer<typeof insertAiTaskQueueSchema>;
export type AiTaskQueueRecord = typeof aiTaskQueue.$inferSelect;

// Extension Registrations - Durable extension storage
export const extensionRegistrations = pgTable("extension_registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  extensionId: varchar("extension_id").notNull().unique(),
  name: text("name").notNull(),
  version: text("version").notNull(),
  description: text("description"),
  author: text("author"),
  extensionPoints: jsonb("extension_points").$type<string[]>().notNull().default([]),
  hooks: jsonb("hooks").$type<Record<string, unknown>>(),
  config: jsonb("config").$type<Record<string, unknown>>(),
  tenantId: varchar("tenant_id"), // null for global extensions
  enabled: boolean("enabled").notNull().default(false),
  installedAt: timestamp("installed_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertExtensionRegistrationSchema = createInsertSchema(extensionRegistrations).omit({
  id: true,
  installedAt: true,
  updatedAt: true,
});

export type InsertExtensionRegistration = z.infer<typeof insertExtensionRegistrationSchema>;
export type ExtensionRegistrationRecord = typeof extensionRegistrations.$inferSelect;

// Blueprints - Product intent storage
export const blueprints = pgTable("blueprints", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("draft"), // draft, approved, rejected, generating, completed, archived
  contextDomain: text("context_domain"),
  contextPlatform: text("context_platform").default("web"),
  contextRequirements: jsonb("context_requirements").$type<string[]>(),
  intents: jsonb("intents").$type<Array<{
    id: string;
    type: string;
    description: string;
    priority: string;
    dependencies?: string[];
    acceptanceCriteria?: string[];
  }>>().notNull().default([]),
  constraints: jsonb("constraints").$type<Array<{
    type: string;
    description: string;
    enforcementLevel: string;
  }>>(),
  outputs: jsonb("outputs").$type<Array<{
    type: string;
    format: string;
    destination: string;
  }>>(),
  metadata: jsonb("metadata").$type<{
    createdBy?: string;
    approvedBy?: string;
    version?: number;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBlueprintSchema = createInsertSchema(blueprints).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBlueprint = z.infer<typeof insertBlueprintSchema>;
export type BlueprintRecord = typeof blueprints.$inferSelect;

// Execution Plans - AI planning storage
export const executionPlans = pgTable("execution_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  blueprintId: varchar("blueprint_id"),
  tenantId: varchar("tenant_id"),
  objective: text("objective").notNull(),
  goalType: text("goal_type").notNull(), // generation, optimization, migration, scaling, recovery
  priority: text("priority").notNull().default("normal"),
  status: text("status").notNull().default("pending"), // pending, executing, completed, failed, cancelled
  steps: jsonb("steps").$type<Array<{
    id: string;
    name: string;
    type: string;
    actions: Array<{ module: string; command: string; params: Record<string, unknown> }>;
    dependencies: string[];
    status?: string;
  }>>().notNull().default([]),
  estimatedDuration: integer("estimated_duration"),
  resourceRequirements: jsonb("resource_requirements").$type<{
    cpu: number;
    memory: number;
    aiTokens: number;
  }>(),
  completedSteps: jsonb("completed_steps").$type<string[]>().default([]),
  failedStep: text("failed_step"),
  outputs: jsonb("outputs").$type<Record<string, unknown>>(),
  metrics: jsonb("metrics").$type<{
    duration?: number;
    resourcesUsed?: { cpu: number; memory: number; aiTokens: number };
    successRate?: number;
  }>(),
  logs: jsonb("logs").$type<Array<{
    timestamp: string;
    level: string;
    message: string;
  }>>().default([]),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertExecutionPlanSchema = createInsertSchema(executionPlans).omit({
  id: true,
  createdAt: true,
});

export type InsertExecutionPlan = z.infer<typeof insertExecutionPlanSchema>;
export type ExecutionPlanRecord = typeof executionPlans.$inferSelect;

// ==================== PLATFORM STATE OVERVIEW ====================

// Platform State - Real-time health and risk monitoring
export interface PlatformStateOverview {
  // Health metrics
  overallHealthScore: number; // 0-100
  healthStatus: 'healthy' | 'degraded' | 'critical' | 'emergency';
  // Risk indicators
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  activeThreats: number;
  pendingAlerts: number;
  // System status
  aiServicesStatus: 'operational' | 'limited' | 'down';
  paymentServicesStatus: 'operational' | 'limited' | 'down';
  authServicesStatus: 'operational' | 'limited' | 'down';
  // Sovereign assistants
  activeSovereignAssistants: number;
  pendingCommands: number;
  executingCommands: number;
  // Emergency controls
  activeEmergencyControls: number;
  lastEmergencyEvent: string | null;
  // Anomalies
  anomalyAlerts: Array<{
    type: string;
    severity: string;
    message: string;
    messageAr: string;
    timestamp: string;
  }>;
}

// ==================== SOVEREIGN SYSTEM TABLES ====================

// Authority levels for sovereign system
export const authorityLevels = [
  'ABSOLUTE_SOVEREIGNTY',
  'SOVEREIGN_DELEGATE', 
  'ENTERPRISE_ACCESS',
  'PROFESSIONAL_ACCESS',
  'BASIC_ACCESS',
  'FREE_ACCESS'
] as const;
export type AuthorityLevel = typeof authorityLevels[number];

// Identity states for immutability classification
export const identityStates = ['IMMUTABLE', 'PROTECTED', 'STANDARD'] as const;
export type IdentityState = typeof identityStates[number];

// Origin types for account creation source
export const originTypes = ['SYSTEM_FOUNDATION', 'OWNER_CREATED', 'SELF_REGISTERED'] as const;
export type OriginType = typeof originTypes[number];

// Operational modes
export const operationalModes = ['OWNER_SOVEREIGN_MODE', 'SUBSCRIBER_RESTRICTED_MODE'] as const;
export type OperationalMode = typeof operationalModes[number];

// Platform types for Sovereign Platform Factory
export const platformTypes = [
  'INTERNAL_INFRA',
  'SUBSCRIBER_COMMERCIAL',
  'GOVERNMENT_SOVEREIGN',
  'CUSTOM_SOVEREIGN'
] as const;
export type PlatformType = typeof platformTypes[number];

// Sovereignty levels for platforms
export const sovereigntyLevels = ['FULL_SOVEREIGN', 'DELEGATED_SOVEREIGN', 'RESTRICTED', 'MANAGED'] as const;
export type SovereigntyLevel = typeof sovereigntyLevels[number];

// Emergency action types
export const emergencyActions = [
  'HALT_ALL_PLATFORMS',
  'FREEZE_ALL_SUBSCRIPTIONS',
  'STOP_ALL_OPERATIONS',
  'LOCKDOWN_SYSTEM',
  'RESTORE_NORMAL'
] as const;
export type EmergencyAction = typeof emergencyActions[number];

// Sovereign Audit Log - Hidden from subscribers, visible only to ROOT_OWNER
export const sovereignAuditLogs = pgTable("sovereign_audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  action: text("action").notNull(),
  performedBy: varchar("performed_by").notNull(),
  performerRole: text("performer_role").notNull(),
  targetType: text("target_type").notNull(), // user, platform, subscription, system, emergency
  targetId: varchar("target_id"),
  details: jsonb("details").$type<Record<string, unknown>>(),
  timestamp: timestamp("timestamp").defaultNow(),
  visibleToSubscribers: boolean("visible_to_subscribers").notNull().default(false),
});

export const insertSovereignAuditLogSchema = createInsertSchema(sovereignAuditLogs).omit({
  id: true,
  timestamp: true,
});

export type InsertSovereignAuditLog = z.infer<typeof insertSovereignAuditLogSchema>;
export type SovereignAuditLog = typeof sovereignAuditLogs.$inferSelect;

// Note: emergencyControls table is already defined above (line 812)
// Using existing EmergencyControl type for sovereign operations

// Sovereign Platforms - Platform factory for ROOT_OWNER
export const sovereignPlatforms = pgTable("sovereign_platforms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  description: text("description"),
  descriptionAr: text("description_ar"),
  type: text("type").notNull(), // INTERNAL_INFRA, SUBSCRIBER_COMMERCIAL, GOVERNMENT_SOVEREIGN, CUSTOM_SOVEREIGN
  sovereigntyLevel: text("sovereignty_level").notNull().default("MANAGED"), // FULL_SOVEREIGN, DELEGATED_SOVEREIGN, RESTRICTED, MANAGED
  subjectToSubscription: boolean("subject_to_subscription").notNull().default(true),
  defaultRestrictions: jsonb("default_restrictions").$type<Record<string, unknown>>(),
  evolutionCapability: boolean("evolution_capability").notNull().default(false),
  crossPlatformLinking: boolean("cross_platform_linking").notNull().default(false),
  complianceRequirements: jsonb("compliance_requirements").$type<string[]>().default([]),
  status: text("status").notNull().default("pending"), // active, suspended, archived, pending
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSovereignPlatformSchema = createInsertSchema(sovereignPlatforms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSovereignPlatform = z.infer<typeof insertSovereignPlatformSchema>;
export type SovereignPlatformRecord = typeof sovereignPlatforms.$inferSelect;

// System Settings - Global system configuration controlled by ROOT_OWNER
export const systemSettings = pgTable("system_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: jsonb("value").$type<unknown>().notNull(),
  category: text("category").notNull(), // auth, billing, platforms, emergency, ai
  description: text("description"),
  descriptionAr: text("description_ar"),
  modifiableBySubscribers: boolean("modifiable_by_subscribers").notNull().default(false),
  lastModifiedBy: varchar("last_modified_by"),
  lastModifiedAt: timestamp("last_modified_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  createdAt: true,
  lastModifiedAt: true,
});

export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;
export type SystemSettingRecord = typeof systemSettings.$inferSelect;

// ============ AI SOVEREIGNTY LAYER ============
// طبقة سيادة الذكاء - حصرية للمالك

// AI Layer Types
export const AI_LAYER_TYPES = ['INTERNAL_SOVEREIGN', 'EXTERNAL_MANAGED', 'HYBRID', 'SUBSCRIBER_RESTRICTED'] as const;
export type AILayerType = typeof AI_LAYER_TYPES[number];

// AI Layer Status
export const AI_LAYER_STATUS = ['active', 'suspended', 'disabled', 'emergency_stopped'] as const;
export type AILayerStatus = typeof AI_LAYER_STATUS[number];

// AI Layers - طبقات الذكاء (OWNER ONLY)
export const aiLayers = pgTable("ai_layers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  purpose: text("purpose").notNull(),
  purposeAr: text("purpose_ar"),
  type: text("type").notNull(), // INTERNAL_SOVEREIGN, EXTERNAL_MANAGED, HYBRID, SUBSCRIBER_RESTRICTED
  status: text("status").notNull().default("active"), // active, suspended, disabled, emergency_stopped
  priority: integer("priority").notNull().default(1), // 1-10, higher = more priority
  allowedForSubscribers: boolean("allowed_for_subscribers").notNull().default(false),
  subscriberVisibility: text("subscriber_visibility").notNull().default("hidden"), // hidden, limited, full
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAILayerSchema = createInsertSchema(aiLayers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAILayer = z.infer<typeof insertAILayerSchema>;
export type AILayerRecord = typeof aiLayers.$inferSelect;

// AI Power Config - تكوين قوة الذكاء لكل طبقة (OWNER ONLY)
export const aiPowerConfigs = pgTable("ai_power_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  layerId: varchar("layer_id").notNull().references(() => aiLayers.id, { onDelete: 'cascade' }),
  powerLevel: integer("power_level").notNull().default(5), // 1-10
  maxTokensPerRequest: integer("max_tokens_per_request").notNull().default(4096),
  maxRequestsPerMinute: integer("max_requests_per_minute").notNull().default(60),
  maxConcurrentRequests: integer("max_concurrent_requests").notNull().default(10),
  cpuAllocation: text("cpu_allocation").notNull().default("standard"), // minimal, standard, high, maximum
  memoryAllocation: text("memory_allocation").notNull().default("standard"), // minimal, standard, high, maximum
  costPerRequest: real("cost_per_request").notNull().default(0),
  monthlyBudgetLimit: real("monthly_budget_limit"), // null = unlimited
  currentMonthUsage: real("current_month_usage").notNull().default(0),
  ownerCanSeeRealCost: boolean("owner_can_see_real_cost").notNull().default(true),
  subscriberCanSeeCost: boolean("subscriber_can_see_cost").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAIPowerConfigSchema = createInsertSchema(aiPowerConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAIPowerConfig = z.infer<typeof insertAIPowerConfigSchema>;
export type AIPowerConfigRecord = typeof aiPowerConfigs.$inferSelect;

// External AI Providers - مزودي الذكاء الخارجيين (OWNER ONLY)
export const externalAIProviders = pgTable("external_ai_providers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  provider: text("provider").notNull(), // openai, anthropic, google, azure, custom
  apiEndpoint: text("api_endpoint"),
  apiKeySecretName: text("api_key_secret_name"), // reference to secret, not the actual key
  isActive: boolean("is_active").notNull().default(true),
  allowedForSubscribers: boolean("allowed_for_subscribers").notNull().default(false),
  requiresOwnerApproval: boolean("requires_owner_approval").notNull().default(true),
  linkedLayerIds: jsonb("linked_layer_ids").$type<string[]>().default([]),
  rateLimit: integer("rate_limit").default(100), // requests per minute
  monthlyBudget: real("monthly_budget"),
  currentMonthSpend: real("current_month_spend").notNull().default(0),
  addedBy: varchar("added_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertExternalAIProviderSchema = createInsertSchema(externalAIProviders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertExternalAIProvider = z.infer<typeof insertExternalAIProviderSchema>;
export type ExternalAIProviderRecord = typeof externalAIProviders.$inferSelect;

// Subscriber AI Limits - حدود المشتركين للذكاء (OWNER ONLY configurable)
export const subscriberAILimits = pgTable("subscriber_ai_limits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  role: text("role").notNull(), // free, basic, pro, enterprise, sovereign
  maxPowerLevel: integer("max_power_level").notNull().default(3), // 1-10
  maxTokensPerRequest: integer("max_tokens_per_request").notNull().default(2048),
  maxRequestsPerDay: integer("max_requests_per_day").notNull().default(100),
  maxRequestsPerMinute: integer("max_requests_per_minute").notNull().default(10),
  allowedTaskTypes: jsonb("allowed_task_types").$type<string[]>().default([]),
  blockedTaskTypes: jsonb("blocked_task_types").$type<string[]>().default([]),
  canAccessExternalAI: boolean("can_access_external_ai").notNull().default(false),
  canSeeAILayers: boolean("can_see_ai_layers").notNull().default(false),
  enforcementAction: text("enforcement_action").notNull().default("block"), // block, log, auto_suspend
  isActive: boolean("is_active").notNull().default(true),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSubscriberAILimitSchema = createInsertSchema(subscriberAILimits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSubscriberAILimit = z.infer<typeof insertSubscriberAILimitSchema>;
export type SubscriberAILimitRecord = typeof subscriberAILimits.$inferSelect;

// Sovereign AI Agents - وكلاء الذكاء السيادي (MUST have Layer)
export const sovereignAIAgents = pgTable("sovereign_ai_agents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  layerId: varchar("layer_id").notNull().references(() => aiLayers.id, { onDelete: 'cascade' }), // MANDATORY - no AI without Layer
  description: text("description"),
  descriptionAr: text("description_ar"),
  model: text("model").notNull().default("claude-sonnet-4-20250514"),
  systemPrompt: text("system_prompt"),
  temperature: real("temperature").notNull().default(0.7),
  maxTokens: integer("max_tokens").notNull().default(4096),
  isActive: boolean("is_active").notNull().default(true),
  availableToSubscribers: boolean("available_to_subscribers").notNull().default(false),
  requiresSovereignApproval: boolean("requires_sovereign_approval").notNull().default(true),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSovereignAIAgentSchema = createInsertSchema(sovereignAIAgents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSovereignAIAgent = z.infer<typeof insertSovereignAIAgentSchema>;
export type SovereignAIAgentRecord = typeof sovereignAIAgents.$inferSelect;

// AI Kill Switch State - حالة زر الطوارئ (OWNER ONLY)
export const aiKillSwitchState = pgTable("ai_kill_switch_state", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scope: text("scope").notNull(), // global, layer, external_only, specific_layer
  targetLayerId: varchar("target_layer_id"), // null for global/external_only
  isActivated: boolean("is_activated").notNull().default(false),
  activatedBy: varchar("activated_by"),
  activatedAt: timestamp("activated_at"),
  reason: text("reason"),
  reasonAr: text("reason_ar"),
  autoReactivateAt: timestamp("auto_reactivate_at"), // null = manual reactivation only
  canSubscriberDeactivate: boolean("can_subscriber_deactivate").notNull().default(false), // always false for owner actions
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAIKillSwitchStateSchema = createInsertSchema(aiKillSwitchState).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAIKillSwitchState = z.infer<typeof insertAIKillSwitchStateSchema>;
export type AIKillSwitchStateRecord = typeof aiKillSwitchState.$inferSelect;

// AI Sovereignty Audit Logs - سجل سيادة الذكاء (IMMUTABLE, OWNER ONLY)
export const aiSovereigntyAuditLogs = pgTable("ai_sovereignty_audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  action: text("action").notNull(), // LAYER_CREATED, POWER_CHANGED, EXTERNAL_LINKED, LIMIT_EXCEEDED, KILL_SWITCH_ACTIVATED
  performedBy: varchar("performed_by").notNull(),
  performerRole: text("performer_role").notNull(),
  targetType: text("target_type").notNull(), // layer, power_config, external_provider, subscriber_limit, assistant, kill_switch
  targetId: varchar("target_id"),
  previousState: jsonb("previous_state").$type<Record<string, unknown>>(),
  newState: jsonb("new_state").$type<Record<string, unknown>>(),
  details: jsonb("details").$type<Record<string, unknown>>(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow(),
  checksum: text("checksum"), // cryptographic seal for immutability verification
  isExportable: boolean("is_exportable").notNull().default(true),
});

export const insertAISovereigntyAuditLogSchema = createInsertSchema(aiSovereigntyAuditLogs).omit({
  id: true,
  timestamp: true,
});

export type InsertAISovereigntyAuditLog = z.infer<typeof insertAISovereigntyAuditLogSchema>;
export type AISovereigntyAuditLogRecord = typeof aiSovereigntyAuditLogs.$inferSelect;

// AI Constitution - دستور الذكاء (OWNER ONLY)
export const aiConstitution = pgTable("ai_constitution", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  version: text("version").notNull().default("1.0.0"),
  rules: jsonb("rules").$type<{
    noAIWithoutLayer: boolean;
    noAIWithoutLimits: boolean;
    noUndefinedPower: boolean;
    noExternalWithoutApproval: boolean;
    noSubscriberAccessWithoutDecision: boolean;
  }>().notNull(),
  enforcementLevel: text("enforcement_level").notNull().default("strict"), // strict, warning, permissive
  isActive: boolean("is_active").notNull().default(true),
  lastModifiedBy: varchar("last_modified_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAIConstitutionSchema = createInsertSchema(aiConstitution).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAIConstitution = z.infer<typeof insertAIConstitutionSchema>;
export type AIConstitutionRecord = typeof aiConstitution.$inferSelect;

// ==================== CUSTOM DOMAINS SYSTEM ====================

// Domain status enum
export const domainStatuses = ['pending', 'verifying', 'verified', 'ssl_pending', 'ssl_issued', 'active', 'error', 'suspended'] as const;
export type DomainStatus = typeof domainStatuses[number];

// Verification method enum
export const verificationMethods = ['dns_txt', 'html_file', 'meta_tag'] as const;
export type VerificationMethod = typeof verificationMethods[number];

// SSL challenge type enum
export const sslChallengeTypes = ['dns-01', 'http-01'] as const;
export type SSLChallengeType = typeof sslChallengeTypes[number];

// Domain visibility enum - مستوى الرؤية
export const domainVisibility = ['system', 'owner', 'tenant', 'public'] as const;
export type DomainVisibility = typeof domainVisibility[number];

// Custom Domains table - النطاقات المخصصة
export const customDomains = pgTable("custom_domains", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(), // المستأجر/المشترك
  ownerUserId: varchar("owner_user_id"), // المالك الفعلي للدومين
  projectId: varchar("project_id"), // المشروع المرتبط (اختياري)
  hostname: text("hostname").notNull().unique(), // النطاق الكامل مثل www.example.com
  rootDomain: text("root_domain").notNull(), // النطاق الجذر مثل example.com
  
  // Domain ownership and visibility - ملكية الدومين ورؤيته
  isSystemDomain: boolean("is_system_domain").notNull().default(false), // دومين تابع لـ INFERA Engine
  visibility: text("visibility").notNull().default("tenant"), // system, owner, tenant, public
  registrarProvider: text("registrar_provider"), // namecheap, godaddy, etc.
  purchasedAt: timestamp("purchased_at"), // تاريخ الشراء
  purchasePrice: integer("purchase_price"), // سعر الشراء بالسنتات
  purchaseCurrency: text("purchase_currency").default("USD"),
  renewalPrice: integer("renewal_price"), // سعر التجديد
  expiresAt: timestamp("expires_at"), // تاريخ انتهاء الصلاحية
  autoRenew: boolean("auto_renew").notNull().default(true), // تجديد تلقائي
  
  status: text("status").notNull().default("pending"), // pending, verifying, verified, ssl_pending, ssl_issued, active, error, suspended
  statusMessage: text("status_message"), // رسالة الحالة
  statusMessageAr: text("status_message_ar"), // رسالة الحالة بالعربي
  verificationMethod: text("verification_method").notNull().default("dns_txt"), // dns_txt, html_file, meta_tag
  verificationToken: text("verification_token").notNull(), // توكن التحقق الفريد
  verificationExpiresAt: timestamp("verification_expires_at"), // انتهاء صلاحية التحقق
  isVerified: boolean("is_verified").notNull().default(false),
  verifiedAt: timestamp("verified_at"),
  isPrimary: boolean("is_primary").notNull().default(false), // هل هو النطاق الرئيسي
  dnsProvider: text("dns_provider"), // cloudflare, route53, gcloud, generic
  sslStatus: text("ssl_status").notNull().default("none"), // none, pending, issued, expired, error
  sslIssuedAt: timestamp("ssl_issued_at"),
  sslExpiresAt: timestamp("ssl_expires_at"),
  sslAutoRenew: boolean("ssl_auto_renew").notNull().default(true),
  lastCheckAt: timestamp("last_check_at"),
  checkAttempts: integer("check_attempts").notNull().default(0),
  maxCheckAttempts: integer("max_check_attempts").notNull().default(10),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_custom_domains_tenant").on(table.tenantId),
  index("IDX_custom_domains_owner").on(table.ownerUserId),
  index("IDX_custom_domains_system").on(table.isSystemDomain),
  index("IDX_custom_domains_status").on(table.status),
]);

export const insertCustomDomainSchema = createInsertSchema(customDomains).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCustomDomain = z.infer<typeof insertCustomDomainSchema>;
export type CustomDomainRecord = typeof customDomains.$inferSelect;

// Domain Verifications table - سجل محاولات التحقق
export const domainVerifications = pgTable("domain_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  domainId: varchar("domain_id").notNull(), // FK to customDomains
  method: text("method").notNull(), // dns_txt, html_file, meta_tag
  token: text("token").notNull(),
  expectedValue: text("expected_value").notNull(), // القيمة المتوقعة
  actualValue: text("actual_value"), // القيمة الفعلية عند التحقق
  status: text("status").notNull().default("pending"), // pending, checking, success, failed, expired
  attemptCount: integer("attempt_count").notNull().default(0),
  lastAttemptAt: timestamp("last_attempt_at"),
  nextAttemptAt: timestamp("next_attempt_at"),
  verifiedAt: timestamp("verified_at"),
  expiresAt: timestamp("expires_at"),
  errorMessage: text("error_message"),
  errorMessageAr: text("error_message_ar"),
  verifiedBy: varchar("verified_by"), // النظام أو المستخدم
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_domain_verifications_domain").on(table.domainId),
  index("IDX_domain_verifications_status").on(table.status),
]);

export const insertDomainVerificationSchema = createInsertSchema(domainVerifications).omit({
  id: true,
  createdAt: true,
});

export type InsertDomainVerification = z.infer<typeof insertDomainVerificationSchema>;
export type DomainVerificationRecord = typeof domainVerifications.$inferSelect;

// SSL Certificates table - شهادات SSL
export const sslCertificates = pgTable("ssl_certificates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  domainId: varchar("domain_id").notNull().unique(), // FK to customDomains
  hostname: text("hostname").notNull(),
  provider: text("provider").notNull().default("letsencrypt"), // letsencrypt, custom
  challengeType: text("challenge_type").notNull().default("dns-01"), // dns-01, http-01
  status: text("status").notNull().default("pending"), // pending, issuing, issued, renewing, expired, error
  certificateChain: text("certificate_chain"), // سلسلة الشهادة (مشفرة)
  privateKeyRef: text("private_key_ref"), // مرجع للمفتاح الخاص (مخزن بشكل آمن)
  issuedAt: timestamp("issued_at"),
  expiresAt: timestamp("expires_at"),
  renewAfter: timestamp("renew_after"), // تاريخ بدء التجديد (عادة 30 يوم قبل الانتهاء)
  lastRenewalAt: timestamp("last_renewal_at"),
  renewalAttempts: integer("renewal_attempts").notNull().default(0),
  autoRenew: boolean("auto_renew").notNull().default(true),
  lastError: text("last_error"),
  lastErrorAr: text("last_error_ar"),
  acmeOrderUrl: text("acme_order_url"), // رابط طلب ACME
  acmeChallengeToken: text("acme_challenge_token"),
  acmeChallengeResponse: text("acme_challenge_response"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_ssl_certificates_domain").on(table.domainId),
  index("IDX_ssl_certificates_expires").on(table.expiresAt),
]);

export const insertSSLCertificateSchema = createInsertSchema(sslCertificates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSSLCertificate = z.infer<typeof insertSSLCertificateSchema>;
export type SSLCertificateRecord = typeof sslCertificates.$inferSelect;

// CSR Requests table - طلبات توقيع الشهادات
export const csrRequests = pgTable("csr_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(), // المستخدم الذي أنشأ الطلب
  domain: text("domain").notNull(), // النطاق
  organization: text("organization"), // اسم المؤسسة
  organizationUnit: text("organization_unit"), // القسم
  city: text("city"), // المدينة
  state: text("state"), // المنطقة
  country: text("country").notNull().default("SA"), // رمز الدولة
  email: text("email"), // البريد الإلكتروني
  csrContent: text("csr_content").notNull(), // محتوى CSR
  privateKeyEncrypted: text("private_key_encrypted").notNull(), // المفتاح الخاص (مشفر)
  status: text("status").notNull().default("generated"), // generated, submitted, issued, expired, revoked
  provider: text("provider").notNull().default("namecheap"), // namecheap, comodo, digicert, etc
  certificateId: varchar("certificate_id"), // ربط بشهادة SSL بعد الإصدار
  submittedAt: timestamp("submitted_at"), // تاريخ الإرسال للمزود
  issuedAt: timestamp("issued_at"), // تاريخ إصدار الشهادة
  expiresAt: timestamp("expires_at"), // تاريخ انتهاء الشهادة
  notes: text("notes"), // ملاحظات
  notesAr: text("notes_ar"), // ملاحظات بالعربي
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_csr_requests_user").on(table.userId),
  index("IDX_csr_requests_domain").on(table.domain),
  index("IDX_csr_requests_status").on(table.status),
]);

export const insertCSRRequestSchema = createInsertSchema(csrRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCSRRequest = z.infer<typeof insertCSRRequestSchema>;
export type CSRRequestRecord = typeof csrRequests.$inferSelect;

// Domain Audit Logs table - سجل تدقيق النطاقات
export const domainAuditLogs = pgTable("domain_audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  domainId: varchar("domain_id").notNull(),
  tenantId: varchar("tenant_id").notNull(),
  action: text("action").notNull(), // DOMAIN_ADDED, VERIFICATION_STARTED, VERIFICATION_SUCCESS, SSL_ISSUED, DOMAIN_ACTIVATED, DOMAIN_REMOVED
  actionAr: text("action_ar"),
  performedBy: varchar("performed_by").notNull(),
  previousState: jsonb("previous_state").$type<Record<string, unknown>>(),
  newState: jsonb("new_state").$type<Record<string, unknown>>(),
  details: jsonb("details").$type<Record<string, unknown>>(),
  ipAddress: text("ip_address"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertDomainAuditLogSchema = createInsertSchema(domainAuditLogs).omit({
  id: true,
  timestamp: true,
});

export type InsertDomainAuditLog = z.infer<typeof insertDomainAuditLogSchema>;
export type DomainAuditLogRecord = typeof domainAuditLogs.$inferSelect;

// Tenant Domain Quotas - حصص النطاقات لكل مستأجر
export const tenantDomainQuotas = pgTable("tenant_domain_quotas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().unique(),
  maxDomains: integer("max_domains").notNull().default(1),
  usedDomains: integer("used_domains").notNull().default(0),
  maxVerificationAttempts: integer("max_verification_attempts").notNull().default(10),
  canUseWildcard: boolean("can_use_wildcard").notNull().default(false),
  tier: text("tier").notNull().default("free"), // free, basic, pro, enterprise, sovereign
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTenantDomainQuotaSchema = createInsertSchema(tenantDomainQuotas).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTenantDomainQuota = z.infer<typeof insertTenantDomainQuotaSchema>;
export type TenantDomainQuotaRecord = typeof tenantDomainQuotas.$inferSelect;

// Helper function to generate verification token
export function generateVerificationToken(): string {
  return `infera-verify-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

// Helper function to get domain quota by tier
export function getDomainQuotaByTier(tier: string): number {
  switch (tier) {
    case 'owner': return 999;
    case 'sovereign': return 50;
    case 'enterprise': return 20;
    case 'pro': return 5;
    case 'basic': return 2;
    default: return 1;
  }
}

// Helper functions for sovereign system
export function isRootOwner(role: string): boolean {
  return role === 'owner';
}

export function getOperationalMode(role: string): OperationalMode {
  return isRootOwner(role) ? 'OWNER_SOVEREIGN_MODE' : 'SUBSCRIBER_RESTRICTED_MODE';
}

export function getAuthorityLevel(role: string): AuthorityLevel {
  switch (role) {
    case 'owner': return 'ABSOLUTE_SOVEREIGNTY';
    case 'sovereign': return 'SOVEREIGN_DELEGATE';
    case 'enterprise': return 'ENTERPRISE_ACCESS';
    case 'pro': return 'PROFESSIONAL_ACCESS';
    case 'basic': return 'BASIC_ACCESS';
    default: return 'FREE_ACCESS';
  }
}

export function getIdentityState(role: string): IdentityState {
  if (role === 'owner') return 'IMMUTABLE';
  if (role === 'sovereign' || role === 'enterprise') return 'PROTECTED';
  return 'STANDARD';
}

export function getOriginType(role: string, createdByOwner: boolean): OriginType {
  if (role === 'owner') return 'SYSTEM_FOUNDATION';
  if (createdByOwner) return 'OWNER_CREATED';
  return 'SELF_REGISTERED';
}

// ==================== SOVEREIGN API KEYS SYSTEM ====================

// API Key statuses
export const apiKeyStatuses = ['active', 'revoked', 'expired', 'suspended'] as const;
export type ApiKeyStatus = typeof apiKeyStatuses[number];

// Available API scopes - granular permissions
export const apiScopes = [
  'platform.read', 'platform.write', 'platform.delete',
  'domains.read', 'domains.manage',
  'ai.invoke', 'ai.manage',
  'billing.read', 'billing.manage',
  'api_keys.read', 'api_keys.manage',
  'webhooks.read', 'webhooks.manage', 'webhooks.send',
  'users.read', 'users.manage',
  'projects.read', 'projects.write', 'projects.delete',
  'analytics.read', 'analytics.export',
  'settings.read', 'settings.write',
] as const;
export type ApiScope = typeof apiScopes[number];

// API Keys table - مفاتيح API السيادية
export const apiKeys = pgTable("api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(), // المنصة المرتبطة
  userId: varchar("user_id").notNull(), // المستخدم الذي أنشأ المفتاح
  name: text("name").notNull(), // اسم المفتاح
  description: text("description"),
  prefix: text("prefix").notNull(), // البادئة التعريفية (مثل: infk_live_)
  keyHash: text("key_hash").notNull(), // Hash للمفتاح (لا يُخزن النص الصريح أبداً)
  lastFourChars: text("last_four_chars").notNull(), // آخر 4 أحرف للعرض
  scopes: jsonb("scopes").$type<string[]>().notNull().default([]), // الصلاحيات
  status: text("status").notNull().default("active"), // active, revoked, expired, suspended
  rateLimitTier: text("rate_limit_tier").notNull().default("standard"), // standard, premium, unlimited
  rateLimitPerMinute: integer("rate_limit_per_minute").notNull().default(60),
  rateLimitPerHour: integer("rate_limit_per_hour").notNull().default(1000),
  rateLimitPerDay: integer("rate_limit_per_day").notNull().default(10000),
  lastUsedAt: timestamp("last_used_at"),
  lastUsedIp: text("last_used_ip"),
  usageCount: integer("usage_count").notNull().default(0),
  expiresAt: timestamp("expires_at"), // null = لا ينتهي
  revokedAt: timestamp("revoked_at"),
  revokedBy: varchar("revoked_by"),
  revokedReason: text("revoked_reason"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_api_keys_tenant").on(table.tenantId),
  index("IDX_api_keys_user").on(table.userId),
  index("IDX_api_keys_status").on(table.status),
  index("IDX_api_keys_prefix").on(table.prefix),
]);

export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof apiKeys.$inferSelect;

// API Key Usage Logs - سجل استخدام المفاتيح
export const apiKeyUsageLogs = pgTable("api_key_usage_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  apiKeyId: varchar("api_key_id").notNull(),
  tenantId: varchar("tenant_id").notNull(),
  endpoint: text("endpoint").notNull(),
  method: text("method").notNull(), // GET, POST, PUT, DELETE
  statusCode: integer("status_code").notNull(),
  requestSize: integer("request_size"),
  responseSize: integer("response_size"),
  responseTimeMs: integer("response_time_ms"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  scopeUsed: text("scope_used"),
  isRateLimited: boolean("is_rate_limited").notNull().default(false),
  errorMessage: text("error_message"),
  timestamp: timestamp("timestamp").defaultNow(),
}, (table) => [
  index("IDX_api_usage_key").on(table.apiKeyId),
  index("IDX_api_usage_tenant").on(table.tenantId),
  index("IDX_api_usage_timestamp").on(table.timestamp),
]);

export const insertApiKeyUsageLogSchema = createInsertSchema(apiKeyUsageLogs).omit({
  id: true,
  timestamp: true,
});

export type InsertApiKeyUsageLog = z.infer<typeof insertApiKeyUsageLogSchema>;
export type ApiKeyUsageLog = typeof apiKeyUsageLogs.$inferSelect;

// Rate Limit Policies - سياسات الحد من الاستخدام
export const rateLimitPolicies = pgTable("rate_limit_policies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  tier: text("tier").notNull().unique(), // standard, premium, unlimited, custom
  requestsPerMinute: integer("requests_per_minute").notNull().default(60),
  requestsPerHour: integer("requests_per_hour").notNull().default(1000),
  requestsPerDay: integer("requests_per_day").notNull().default(10000),
  burstLimit: integer("burst_limit").notNull().default(10), // الحد الأقصى للطلبات المتتالية
  burstWindowSeconds: integer("burst_window_seconds").notNull().default(1),
  warningThreshold: real("warning_threshold").notNull().default(0.8), // 80%
  blockDurationMinutes: integer("block_duration_minutes").notNull().default(15),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertRateLimitPolicySchema = createInsertSchema(rateLimitPolicies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertRateLimitPolicy = z.infer<typeof insertRateLimitPolicySchema>;
export type RateLimitPolicy = typeof rateLimitPolicies.$inferSelect;

// Webhook Endpoints - نقاط الـ Webhook
export const webhookEndpoints = pgTable("webhook_endpoints", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  secretHash: text("secret_hash").notNull(), // Hash for HMAC signing
  events: jsonb("events").$type<string[]>().notNull().default([]), // الأحداث المشتركة
  isActive: boolean("is_active").notNull().default(true),
  failureCount: integer("failure_count").notNull().default(0),
  lastDeliveryAt: timestamp("last_delivery_at"),
  lastDeliveryStatus: text("last_delivery_status"), // success, failed
  lastDeliveryError: text("last_delivery_error"),
  retryPolicy: jsonb("retry_policy").$type<{
    maxRetries: number;
    retryIntervalSeconds: number;
  }>().default({ maxRetries: 3, retryIntervalSeconds: 60 }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_webhook_endpoints_tenant").on(table.tenantId),
  index("IDX_webhook_endpoints_active").on(table.isActive),
]);

export const insertWebhookEndpointSchema = createInsertSchema(webhookEndpoints).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertWebhookEndpoint = z.infer<typeof insertWebhookEndpointSchema>;
export type WebhookEndpoint = typeof webhookEndpoints.$inferSelect;

// Webhook event types
export const webhookEventTypes = [
  'DOMAIN_VERIFIED', 'DOMAIN_FAILED', 'DOMAIN_REMOVED',
  'SSL_ISSUED', 'SSL_RENEWED', 'SSL_EXPIRED',
  'PLATFORM_STATUS_CHANGED', 'PLATFORM_DEPLOYED',
  'API_KEY_CREATED', 'API_KEY_REVOKED', 'API_KEY_ROTATED',
  'USER_CREATED', 'USER_UPDATED', 'USER_DELETED',
  'SUBSCRIPTION_CREATED', 'SUBSCRIPTION_UPDATED', 'SUBSCRIPTION_CANCELLED',
  'PAYMENT_RECEIVED', 'PAYMENT_FAILED',
  'RATE_LIMIT_WARNING', 'RATE_LIMIT_EXCEEDED',
] as const;
export type WebhookEventType = typeof webhookEventTypes[number];

// Webhook Deliveries - تسليمات الـ Webhook
export const webhookDeliveries = pgTable("webhook_deliveries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  endpointId: varchar("endpoint_id").notNull(),
  tenantId: varchar("tenant_id").notNull(),
  eventType: text("event_type").notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  signature: text("signature").notNull(), // HMAC signature
  status: text("status").notNull().default("pending"), // pending, delivered, failed
  statusCode: integer("status_code"),
  responseBody: text("response_body"),
  attempts: integer("attempts").notNull().default(0),
  nextRetryAt: timestamp("next_retry_at"),
  deliveredAt: timestamp("delivered_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_webhook_deliveries_endpoint").on(table.endpointId),
  index("IDX_webhook_deliveries_status").on(table.status),
  index("IDX_webhook_deliveries_created").on(table.createdAt),
]);

export const insertWebhookDeliverySchema = createInsertSchema(webhookDeliveries).omit({
  id: true,
  createdAt: true,
});

export type InsertWebhookDelivery = z.infer<typeof insertWebhookDeliverySchema>;
export type WebhookDelivery = typeof webhookDeliveries.$inferSelect;

// API Audit Logs - سجلات التدقيق (غير قابلة للتعديل)
export const apiAuditLogs = pgTable("api_audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  apiKeyId: varchar("api_key_id"),
  userId: varchar("user_id"),
  action: text("action").notNull(), // API_KEY_CREATED, API_KEY_REVOKED, API_KEY_ROTATED, AUTH_FAILED, RATE_LIMIT_EXCEEDED, etc.
  actionAr: text("action_ar"),
  resourceType: text("resource_type"), // api_key, webhook, domain, etc.
  resourceId: varchar("resource_id"),
  previousState: jsonb("previous_state").$type<Record<string, unknown>>(),
  newState: jsonb("new_state").$type<Record<string, unknown>>(),
  details: jsonb("details").$type<Record<string, unknown>>(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  geoLocation: jsonb("geo_location").$type<{
    country?: string;
    city?: string;
    region?: string;
  }>(),
  severity: text("severity").notNull().default("info"), // info, warning, critical
  checksum: text("checksum").notNull(), // SHA-256 للتحقق من عدم التعديل
  timestamp: timestamp("timestamp").defaultNow(),
}, (table) => [
  index("IDX_api_audit_tenant").on(table.tenantId),
  index("IDX_api_audit_api_key").on(table.apiKeyId),
  index("IDX_api_audit_action").on(table.action),
  index("IDX_api_audit_timestamp").on(table.timestamp),
  index("IDX_api_audit_severity").on(table.severity),
]);

export const insertApiAuditLogSchema = createInsertSchema(apiAuditLogs).omit({
  id: true,
  timestamp: true,
});

export type InsertApiAuditLog = z.infer<typeof insertApiAuditLogSchema>;
export type ApiAuditLog = typeof apiAuditLogs.$inferSelect;

// API Configuration - إعدادات API قابلة للتعديل من UI
export const apiConfiguration = pgTable("api_configuration", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().unique(),
  isApiEnabled: boolean("is_api_enabled").notNull().default(true),
  defaultRateLimitTier: text("default_rate_limit_tier").notNull().default("standard"),
  maxKeysPerTenant: integer("max_keys_per_tenant").notNull().default(10),
  keyExpirationDays: integer("key_expiration_days"), // null = لا ينتهي
  requireScopeSelection: boolean("require_scope_selection").notNull().default(true),
  allowedIpRanges: jsonb("allowed_ip_ranges").$type<string[]>(),
  blockedIpRanges: jsonb("blocked_ip_ranges").$type<string[]>(),
  corsOrigins: jsonb("cors_origins").$type<string[]>(),
  webhooksEnabled: boolean("webhooks_enabled").notNull().default(true),
  maxWebhooksPerTenant: integer("max_webhooks_per_tenant").notNull().default(5),
  auditRetentionDays: integer("audit_retention_days").notNull().default(365),
  customSettings: jsonb("custom_settings").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertApiConfigurationSchema = createInsertSchema(apiConfiguration).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertApiConfiguration = z.infer<typeof insertApiConfigurationSchema>;
export type ApiConfiguration = typeof apiConfiguration.$inferSelect;

// ==================== WEBHOOK LOGS ====================

export const webhookLogs = pgTable("webhook_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: text("event_id").notNull().unique(), // Stripe event ID for idempotency
  eventType: text("event_type").notNull(), // checkout.session.completed, invoice.paid, etc.
  provider: text("provider").notNull().default("stripe"), // stripe, paypal, etc.
  payloadHash: text("payload_hash").notNull(), // For deduplication
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  processed: boolean("processed").notNull().default(false),
  processedAt: timestamp("processed_at"),
  attempts: integer("attempts").notNull().default(0),
  lastAttemptAt: timestamp("last_attempt_at"),
  errorMessage: text("error_message"),
  relatedUserId: varchar("related_user_id"),
  relatedSubscriptionId: varchar("related_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_webhook_logs_event_id").on(table.eventId),
  index("IDX_webhook_logs_event_type").on(table.eventType),
  index("IDX_webhook_logs_processed").on(table.processed),
  index("IDX_webhook_logs_created").on(table.createdAt),
]);

export const insertWebhookLogSchema = createInsertSchema(webhookLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertWebhookLog = z.infer<typeof insertWebhookLogSchema>;
export type WebhookLog = typeof webhookLogs.$inferSelect;

// ==================== BILLING PROFILES ====================

export const billingProfiles = pgTable("billing_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  profileName: text("profile_name").notNull().default("Default"),
  isDefault: boolean("is_default").notNull().default(true),
  // Business Information
  companyName: text("company_name"),
  companyNameAr: text("company_name_ar"),
  taxId: text("tax_id"), // VAT number, Commercial Registration, etc.
  taxIdType: text("tax_id_type"), // vat, cr, tin, etc.
  // Contact Information
  billingEmail: text("billing_email"),
  billingPhone: text("billing_phone"),
  // Address
  addressLine1: text("address_line1"),
  addressLine2: text("address_line2"),
  city: text("city"),
  state: text("state"),
  postalCode: text("postal_code"),
  country: text("country").notNull().default("SA"),
  // Payment Preferences
  preferredCurrency: text("preferred_currency").notNull().default("SAR"),
  preferredPaymentMethod: text("preferred_payment_method"), // stripe, paypal, bank_transfer
  defaultPaymentMethodId: varchar("default_payment_method_id"),
  // Settings
  autoPayEnabled: boolean("auto_pay_enabled").notNull().default(true),
  invoiceNotes: text("invoice_notes"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_billing_profiles_user").on(table.userId),
  index("IDX_billing_profiles_default").on(table.isDefault),
]);

export const insertBillingProfileSchema = createInsertSchema(billingProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBillingProfile = z.infer<typeof insertBillingProfileSchema>;
export type BillingProfile = typeof billingProfiles.$inferSelect;

// ==================== AI BILLING INSIGHTS ====================

export const aiBillingInsights = pgTable("ai_billing_insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  subscriptionId: varchar("subscription_id"),
  insightType: text("insight_type").notNull(), // churn_risk, upgrade_suggestion, fraud_alert, payment_recovery
  severity: text("severity").notNull().default("info"), // info, warning, critical
  // Scores and Predictions
  churnProbability: integer("churn_probability"), // 0-100
  upgradeRecommendation: text("upgrade_recommendation"), // suggested plan
  fraudScore: integer("fraud_score"), // 0-100
  // Messages (Bilingual)
  title: text("title").notNull(),
  titleAr: text("title_ar"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  recommendedAction: text("recommended_action"),
  recommendedActionAr: text("recommended_action_ar"),
  // Status
  status: text("status").notNull().default("active"), // active, dismissed, resolved
  acknowledgedAt: timestamp("acknowledged_at"),
  acknowledgedBy: varchar("acknowledged_by"),
  // Analysis Data
  analysisFactors: jsonb("analysis_factors").$type<{
    factor: string;
    weight: number;
    value: string;
  }[]>(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_ai_billing_insights_user").on(table.userId),
  index("IDX_ai_billing_insights_type").on(table.insightType),
  index("IDX_ai_billing_insights_status").on(table.status),
  index("IDX_ai_billing_insights_severity").on(table.severity),
]);

export const insertAiBillingInsightSchema = createInsertSchema(aiBillingInsights).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAiBillingInsight = z.infer<typeof insertAiBillingInsightSchema>;
export type AiBillingInsight = typeof aiBillingInsights.$inferSelect;

// ==================== REFUNDS ====================

export const refunds = pgTable("refunds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  paymentId: varchar("payment_id").notNull(),
  userId: varchar("user_id").notNull(),
  amount: integer("amount").notNull(), // in cents
  currency: text("currency").notNull().default("USD"),
  reason: text("reason").notNull(), // duplicate, fraudulent, requested_by_customer, other
  reasonDetails: text("reason_details"),
  status: text("status").notNull().default("pending"), // pending, processing, succeeded, failed
  stripeRefundId: text("stripe_refund_id"),
  processedAt: timestamp("processed_at"),
  processedBy: varchar("processed_by"), // admin who processed
  failureReason: text("failure_reason"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_refunds_payment").on(table.paymentId),
  index("IDX_refunds_user").on(table.userId),
  index("IDX_refunds_status").on(table.status),
]);

export const insertRefundSchema = createInsertSchema(refunds).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertRefund = z.infer<typeof insertRefundSchema>;
export type Refund = typeof refunds.$inferSelect;

// ==================== PAYMENT RETRY QUEUE ====================

export const paymentRetryQueue = pgTable("payment_retry_queue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  subscriptionId: varchar("subscription_id").notNull(),
  originalPaymentId: varchar("original_payment_id"),
  stripeInvoiceId: text("stripe_invoice_id"),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("USD"),
  attemptNumber: integer("attempt_number").notNull().default(1),
  maxAttempts: integer("max_attempts").notNull().default(4),
  nextRetryAt: timestamp("next_retry_at").notNull(),
  lastAttemptAt: timestamp("last_attempt_at"),
  lastFailureReason: text("last_failure_reason"),
  status: text("status").notNull().default("pending"), // pending, processing, succeeded, failed_final, cancelled
  gracePeriodEnd: timestamp("grace_period_end"),
  notificationsSent: jsonb("notifications_sent").$type<{
    type: string;
    sentAt: string;
  }[]>().default([]),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_payment_retry_user").on(table.userId),
  index("IDX_payment_retry_subscription").on(table.subscriptionId),
  index("IDX_payment_retry_status").on(table.status),
  index("IDX_payment_retry_next").on(table.nextRetryAt),
]);

export const insertPaymentRetrySchema = createInsertSchema(paymentRetryQueue).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPaymentRetry = z.infer<typeof insertPaymentRetrySchema>;
export type PaymentRetry = typeof paymentRetryQueue.$inferSelect;

// ==================== INVOICES ====================

export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  number: text("number").notNull().unique(),
  date: timestamp("date").notNull().defaultNow(),
  dueDate: timestamp("due_date").notNull(),
  amount: integer("amount").notNull(), // in cents
  currency: text("currency").notNull().default("USD"),
  status: text("status").notNull().default("pending"), // pending, paid, overdue, cancelled
  items: jsonb("items").$type<{ description: string; quantity: number; unitPrice: number; total: number }[]>().notNull().default([]),
  paymentMethod: text("payment_method"),
  paidAt: timestamp("paid_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_invoices_user").on(table.userId),
  index("IDX_invoices_status").on(table.status),
]);

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

// ==================== MARKETING CAMPAIGNS ====================

export const marketingCampaigns = pgTable("marketing_campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  type: text("type").notNull().default("email"), // email, social, ads, sms
  status: text("status").notNull().default("draft"), // draft, scheduled, active, paused, completed
  audience: integer("audience").notNull().default(0),
  reached: integer("reached").notNull().default(0),
  clicked: integer("clicked").notNull().default(0),
  converted: integer("converted").notNull().default(0),
  budget: integer("budget").notNull().default(0), // in cents
  spent: integer("spent").notNull().default(0),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  tags: jsonb("tags").$type<string[]>().default([]),
  settings: jsonb("settings").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_campaigns_user").on(table.userId),
  index("IDX_campaigns_status").on(table.status),
]);

export const insertMarketingCampaignSchema = createInsertSchema(marketingCampaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMarketingCampaign = z.infer<typeof insertMarketingCampaignSchema>;
export type MarketingCampaign = typeof marketingCampaigns.$inferSelect;

// ==================== ANALYTICS ====================

export const analyticsEvents = pgTable("analytics_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  projectId: varchar("project_id"),
  eventType: text("event_type").notNull(), // page_view, click, signup, conversion
  eventData: jsonb("event_data").$type<Record<string, unknown>>(),
  sessionId: text("session_id"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  country: text("country"),
  city: text("city"),
  referrer: text("referrer"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_analytics_user").on(table.userId),
  index("IDX_analytics_project").on(table.projectId),
  index("IDX_analytics_type").on(table.eventType),
  index("IDX_analytics_date").on(table.createdAt),
]);

export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents).omit({
  id: true,
  createdAt: true,
});

export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;

// Helper: Generate API Key with prefix
export function generateApiKeyPrefix(environment: 'live' | 'test' = 'live'): string {
  return environment === 'live' ? 'infk_live_' : 'infk_test_';
}

// Helper: Generate secure API key
export function generateSecureApiKey(prefix: string): string {
  const randomPart = Array.from({ length: 32 }, () => 
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 62)]
  ).join('');
  return `${prefix}${randomPart}`;
}

// Helper: Calculate audit checksum
export function calculateAuditChecksum(data: Record<string, unknown>): string {
  const crypto = require('crypto');
  const content = JSON.stringify(data);
  return crypto.createHash('sha256').update(content).digest('hex');
}

// ==================== SERVICE PROVIDER INTEGRATIONS ====================

// Provider categories
export const providerCategories = ['ai', 'cloud', 'communication', 'payment', 'analytics', 'search', 'media', 'maps', 'custom'] as const;
export type ProviderCategory = typeof providerCategories[number];

// Provider status
export const providerStatuses = ['active', 'inactive', 'error', 'maintenance', 'pending'] as const;
export type ProviderStatus = typeof providerStatuses[number];

// Service Providers Registry
export const serviceProviders = pgTable("service_providers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  slug: text("slug").notNull().unique(), // openai, anthropic, stripe, etc.
  category: text("category").notNull(), // ai, cloud, communication, payment, analytics, search, media, maps, custom
  description: text("description"),
  descriptionAr: text("description_ar"),
  logo: text("logo"), // URL or icon name
  website: text("website"),
  docsUrl: text("docs_url"),
  status: text("status").notNull().default("inactive"), // active, inactive, error, maintenance
  isBuiltIn: boolean("is_built_in").notNull().default(false), // Pre-configured providers
  isPrimary: boolean("is_primary").notNull().default(false), // Primary provider in category
  priority: integer("priority").notNull().default(0), // For failover ordering
  healthScore: real("health_score").default(100), // 0-100 health percentage
  lastHealthCheck: timestamp("last_health_check"),
  avgResponseTime: integer("avg_response_time"), // in ms
  successRate: real("success_rate").default(100), // percentage
  totalRequests: integer("total_requests").notNull().default(0),
  totalErrors: integer("total_errors").notNull().default(0),
  totalCost: integer("total_cost").notNull().default(0), // in cents
  monthlyBudget: integer("monthly_budget"), // in cents
  monthlySpent: integer("monthly_spent").notNull().default(0),
  rateLimitPerMinute: integer("rate_limit_per_minute"),
  rateLimitPerDay: integer("rate_limit_per_day"),
  settings: jsonb("settings").$type<Record<string, unknown>>().default({}),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_providers_category").on(table.category),
  index("IDX_providers_status").on(table.status),
  index("IDX_providers_slug").on(table.slug),
]);

export const insertServiceProviderSchema = createInsertSchema(serviceProviders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertServiceProvider = z.infer<typeof insertServiceProviderSchema>;
export type ServiceProvider = typeof serviceProviders.$inferSelect;

// Provider API Keys (Encrypted)
export const providerApiKeys = pgTable("provider_api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").notNull().references(() => serviceProviders.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // Key identifier
  keyHash: text("key_hash").notNull(), // SHA-256 hash for verification
  encryptedKey: text("encrypted_key").notNull(), // AES-256-GCM encrypted
  keyPrefix: text("key_prefix"), // First 8 chars for display (sk-xxx...)
  environment: text("environment").notNull().default("production"), // production, development, test
  isActive: boolean("is_active").notNull().default(true),
  isDefault: boolean("is_default").notNull().default(false),
  expiresAt: timestamp("expires_at"),
  lastUsedAt: timestamp("last_used_at"),
  lastRotatedAt: timestamp("last_rotated_at"),
  rotationDays: integer("rotation_days").default(90), // Auto-rotate after N days
  usageCount: integer("usage_count").notNull().default(0),
  permissions: jsonb("permissions").$type<string[]>().default([]),
  ipWhitelist: jsonb("ip_whitelist").$type<string[]>().default([]),
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_api_keys_provider").on(table.providerId),
  index("IDX_api_keys_environment").on(table.environment),
]);

export const insertProviderApiKeySchema = createInsertSchema(providerApiKeys).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProviderApiKey = z.infer<typeof insertProviderApiKeySchema>;
export type ProviderApiKey = typeof providerApiKeys.$inferSelect;

// Provider Services (Sub-services of each provider)
export const providerServices = pgTable("provider_services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").notNull().references(() => serviceProviders.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // GPT-4, Whisper, DALL-E
  nameAr: text("name_ar"),
  slug: text("slug").notNull(),
  description: text("description"),
  descriptionAr: text("description_ar"),
  type: text("type").notNull(), // model, api, webhook, etc.
  isActive: boolean("is_active").notNull().default(true),
  costPerUnit: integer("cost_per_unit").default(0), // Cost in micro-cents
  unitType: text("unit_type"), // token, request, message, minute, etc.
  settings: jsonb("settings").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_services_provider").on(table.providerId),
]);

export const insertProviderServiceSchema = createInsertSchema(providerServices).omit({
  id: true,
  createdAt: true,
});

export type InsertProviderService = z.infer<typeof insertProviderServiceSchema>;
export type ProviderService = typeof providerServices.$inferSelect;

// Provider Usage Analytics
export const providerUsage = pgTable("provider_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").notNull().references(() => serviceProviders.id, { onDelete: "cascade" }),
  serviceId: varchar("service_id").references(() => providerServices.id),
  apiKeyId: varchar("api_key_id").references(() => providerApiKeys.id),
  userId: varchar("user_id"),
  requestCount: integer("request_count").notNull().default(0),
  successCount: integer("success_count").notNull().default(0),
  errorCount: integer("error_count").notNull().default(0),
  totalTokens: integer("total_tokens").notNull().default(0),
  totalCost: integer("total_cost").notNull().default(0), // in micro-cents
  avgResponseTime: integer("avg_response_time"), // in ms
  date: timestamp("date").notNull(), // For daily aggregation
  hour: integer("hour"), // 0-23 for hourly granularity
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_usage_provider").on(table.providerId),
  index("IDX_usage_date").on(table.date),
  index("IDX_usage_service").on(table.serviceId),
]);

export const insertProviderUsageSchema = createInsertSchema(providerUsage).omit({
  id: true,
  createdAt: true,
});

export type InsertProviderUsage = z.infer<typeof insertProviderUsageSchema>;
export type ProviderUsage = typeof providerUsage.$inferSelect;

// Provider Alerts
export const providerAlerts = pgTable("provider_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").references(() => serviceProviders.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // error_rate, response_time, cost, quota, health
  severity: text("severity").notNull().default("warning"), // info, warning, error, critical
  title: text("title").notNull(),
  titleAr: text("title_ar"),
  message: text("message").notNull(),
  messageAr: text("message_ar"),
  threshold: real("threshold"), // The threshold that was exceeded
  currentValue: real("current_value"), // Current value that triggered alert
  isAcknowledged: boolean("is_acknowledged").notNull().default(false),
  acknowledgedBy: varchar("acknowledged_by"),
  acknowledgedAt: timestamp("acknowledged_at"),
  resolvedAt: timestamp("resolved_at"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_alerts_provider").on(table.providerId),
  index("IDX_alerts_severity").on(table.severity),
  index("IDX_alerts_acknowledged").on(table.isAcknowledged),
]);

export const insertProviderAlertSchema = createInsertSchema(providerAlerts).omit({
  id: true,
  createdAt: true,
});

export type InsertProviderAlert = z.infer<typeof insertProviderAlertSchema>;
export type ProviderAlert = typeof providerAlerts.$inferSelect;

// Failover Groups (For automatic provider switching)
export const failoverGroups = pgTable("failover_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  category: text("category").notNull(), // ai, payment, etc.
  isActive: boolean("is_active").notNull().default(true),
  primaryProviderId: varchar("primary_provider_id").references(() => serviceProviders.id),
  fallbackProviderIds: jsonb("fallback_provider_ids").$type<string[]>().default([]),
  triggerConditions: jsonb("trigger_conditions").$type<{
    errorRate?: number;
    responseTime?: number;
    healthScore?: number;
  }>().default({}),
  autoFailover: boolean("auto_failover").notNull().default(true),
  lastFailoverAt: timestamp("last_failover_at"),
  failoverCount: integer("failover_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_failover_category").on(table.category),
]);

export const insertFailoverGroupSchema = createInsertSchema(failoverGroups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertFailoverGroup = z.infer<typeof insertFailoverGroupSchema>;
export type FailoverGroup = typeof failoverGroups.$inferSelect;

// Integration Audit Logs
export const integrationAuditLogs = pgTable("integration_audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").references(() => serviceProviders.id),
  apiKeyId: varchar("api_key_id").references(() => providerApiKeys.id),
  userId: varchar("user_id"),
  action: text("action").notNull(), // create, update, delete, rotate, activate, deactivate, failover
  resource: text("resource").notNull(), // provider, api_key, service, etc.
  resourceId: text("resource_id"),
  previousValue: jsonb("previous_value").$type<Record<string, unknown>>(),
  newValue: jsonb("new_value").$type<Record<string, unknown>>(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  isSuccess: boolean("is_success").notNull().default(true),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_int_audit_provider").on(table.providerId),
  index("IDX_int_audit_action").on(table.action),
  index("IDX_int_audit_date").on(table.createdAt),
]);

export const insertIntegrationAuditLogSchema = createInsertSchema(integrationAuditLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertIntegrationAuditLog = z.infer<typeof insertIntegrationAuditLogSchema>;
export type IntegrationAuditLog = typeof integrationAuditLogs.$inferSelect;

// ==================== RESOURCE USAGE & COST TRACKING ====================

// Resource types enum
export const resourceTypes = [
  'AI_TOKENS',
  'API_REQUEST', 
  'STORAGE_MB',
  'COMPUTE_SECONDS',
  'PAYMENT_TX',
  'BANDWIDTH_MB'
] as const;
export type ResourceType = typeof resourceTypes[number];

// Pricing models enum
export const pricingModels = ['FREE', 'FIXED', 'MARKUP', 'SUBSIDIZED'] as const;
export type PricingModel = typeof pricingModels[number];

// User Location Tracking
export const userLocations = pgTable("user_locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  countryCode: text("country_code").notNull(), // ISO 3166-1 alpha-2 (SA, AE, US, etc.)
  countryName: text("country_name").notNull(),
  countryNameAr: text("country_name_ar"),
  regionCode: text("region_code"), // State/Province
  regionName: text("region_name"),
  city: text("city"),
  timezone: text("timezone"),
  ipAddress: text("ip_address"),
  isVpn: boolean("is_vpn").default(false),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_location_user").on(table.userId),
  index("IDX_location_country").on(table.countryCode),
]);

export const insertUserLocationSchema = createInsertSchema(userLocations).omit({
  id: true,
  createdAt: true,
});

export type InsertUserLocation = z.infer<typeof insertUserLocationSchema>;
export type UserLocation = typeof userLocations.$inferSelect;

// Resource Usage Ledger - Main tracking table
export const resourceUsage = pgTable("resource_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  platformId: varchar("platform_id"), // For multi-tenant platforms
  
  resourceType: text("resource_type").notNull(), // AI_TOKENS, API_REQUEST, STORAGE_MB, etc.
  provider: text("provider").notNull(), // openai, claude, stripe, etc.
  service: text("service").notNull(), // gpt-4, embeddings, webhook, etc.
  
  quantity: real("quantity").notNull().default(0), // Number of units
  unitCostUSD: real("unit_cost_usd").notNull().default(0), // Actual cost per unit
  realCostUSD: real("real_cost_usd").notNull().default(0), // Real cost to owner
  billedCostUSD: real("billed_cost_usd").notNull().default(0), // Billed cost to user
  pricingModel: text("pricing_model").notNull().default("FREE"), // FREE, FIXED, MARKUP, SUBSIDIZED
  markupFactor: real("markup_factor").default(1.0), // Markup multiplier
  
  requestId: varchar("request_id"), // For tracking specific requests
  isSuccess: boolean("is_success").notNull().default(true),
  errorMessage: text("error_message"),
  
  // Location info at time of request
  countryCode: text("country_code"),
  ipAddress: text("ip_address"),
  
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  timestamp: timestamp("timestamp").defaultNow(),
}, (table) => [
  index("IDX_res_usage_user").on(table.userId),
  index("IDX_res_usage_type").on(table.resourceType),
  index("IDX_res_usage_provider").on(table.provider),
  index("IDX_res_usage_timestamp").on(table.timestamp),
  index("IDX_res_usage_country").on(table.countryCode),
]);

export const insertResourceUsageSchema = createInsertSchema(resourceUsage).omit({
  id: true,
});

export type InsertResourceUsage = z.infer<typeof insertResourceUsageSchema>;
export type ResourceUsage = typeof resourceUsage.$inferSelect;

// User Usage Limits - Per-user spending/usage limits
export const userUsageLimits = pgTable("user_usage_limits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  monthlyLimitUSD: real("monthly_limit_usd").default(50), // Monthly spending limit
  dailyLimitUSD: real("daily_limit_usd"), // Daily spending limit
  
  autoSuspend: boolean("auto_suspend").notNull().default(true), // Auto-suspend when limit reached
  notifyAtPercent: integer("notify_at_percent").default(80), // Notify at this % of limit
  
  // Resource-specific limits
  aiTokensLimit: integer("ai_tokens_limit"), // Max AI tokens per month
  apiRequestsLimit: integer("api_requests_limit"), // Max API requests per month
  storageLimitMB: integer("storage_limit_mb"), // Max storage in MB
  
  // Current usage tracking (aggregated for performance)
  currentMonthUsageUSD: real("current_month_usage_usd").default(0),
  currentDayUsageUSD: real("current_day_usage_usd").default(0),
  lastResetDate: timestamp("last_reset_date").defaultNow(),
  
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_limits_user").on(table.userId),
]);

export const insertUserUsageLimitSchema = createInsertSchema(userUsageLimits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUserUsageLimit = z.infer<typeof insertUserUsageLimitSchema>;
export type UserUsageLimit = typeof userUsageLimits.$inferSelect;

// Pricing Configuration - Per-resource pricing rules
export const pricingConfig = pgTable("pricing_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  resourceType: text("resource_type").notNull(),
  provider: text("provider").notNull(),
  service: text("service"),
  
  baseCostUSD: real("base_cost_usd").notNull(), // Owner's actual cost
  markupFactor: real("markup_factor").notNull().default(1.5), // Default 50% markup
  pricingModel: text("pricing_model").notNull().default("MARKUP"),
  
  // Regional pricing overrides
  regionPricing: jsonb("region_pricing").$type<{
    [countryCode: string]: {
      markupFactor?: number;
      pricingModel?: string;
      currency?: string;
      exchangeRate?: number;
    };
  }>().default({}),
  
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_pricing_type").on(table.resourceType),
  index("IDX_pricing_provider").on(table.provider),
]);

export const insertPricingConfigSchema = createInsertSchema(pricingConfig).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPricingConfig = z.infer<typeof insertPricingConfigSchema>;
export type PricingConfig = typeof pricingConfig.$inferSelect;

// Usage Alerts - For notifications when limits are approached
export const usageAlerts = pgTable("usage_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // limit_warning, limit_reached, unusual_activity, budget_alert
  severity: text("severity").notNull().default("warning"), // info, warning, error, critical
  
  title: text("title").notNull(),
  titleAr: text("title_ar"),
  message: text("message").notNull(),
  messageAr: text("message_ar"),
  
  thresholdValue: real("threshold_value"), // The threshold that triggered alert
  currentValue: real("current_value"), // Current usage value
  percentOfLimit: real("percent_of_limit"), // Current % of limit
  
  isRead: boolean("is_read").notNull().default(false),
  isAcknowledged: boolean("is_acknowledged").notNull().default(false),
  acknowledgedAt: timestamp("acknowledged_at"),
  
  actionTaken: text("action_taken"), // suspended, downgraded, notified
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_alerts_user").on(table.userId),
  index("IDX_alerts_type").on(table.type),
  index("IDX_alerts_read").on(table.isRead),
]);

export const insertUsageAlertSchema = createInsertSchema(usageAlerts).omit({
  id: true,
  createdAt: true,
});

export type InsertUsageAlert = z.infer<typeof insertUsageAlertSchema>;
export type UsageAlert = typeof usageAlerts.$inferSelect;

// Daily Usage Aggregates - For fast dashboard queries
export const dailyUsageAggregates = pgTable("daily_usage_aggregates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(), // Truncated to day
  
  totalRequests: integer("total_requests").notNull().default(0),
  successfulRequests: integer("successful_requests").notNull().default(0),
  failedRequests: integer("failed_requests").notNull().default(0),
  
  totalAiTokens: integer("total_ai_tokens").notNull().default(0),
  totalApiRequests: integer("total_api_requests").notNull().default(0),
  totalStorageMB: real("total_storage_mb").notNull().default(0),
  totalBandwidthMB: real("total_bandwidth_mb").notNull().default(0),
  
  realCostUSD: real("real_cost_usd").notNull().default(0),
  billedCostUSD: real("billed_cost_usd").notNull().default(0),
  marginUSD: real("margin_usd").notNull().default(0), // billedCost - realCost
  
  countryCode: text("country_code"),
  
  // Breakdown by provider
  costByProvider: jsonb("cost_by_provider").$type<{
    [provider: string]: {
      realCost: number;
      billedCost: number;
      requests: number;
    };
  }>().default({}),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_daily_user").on(table.userId),
  index("IDX_daily_date").on(table.date),
  index("IDX_daily_country").on(table.countryCode),
]);

export const insertDailyUsageAggregateSchema = createInsertSchema(dailyUsageAggregates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDailyUsageAggregate = z.infer<typeof insertDailyUsageAggregateSchema>;
export type DailyUsageAggregate = typeof dailyUsageAggregates.$inferSelect;

// Monthly Usage Summary - For billing and reports
export const monthlyUsageSummary = pgTable("monthly_usage_summary", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  year: integer("year").notNull(),
  month: integer("month").notNull(), // 1-12
  
  totalRequests: integer("total_requests").notNull().default(0),
  totalAiTokens: integer("total_ai_tokens").notNull().default(0),
  totalApiRequests: integer("total_api_requests").notNull().default(0),
  totalStorageMB: real("total_storage_mb").notNull().default(0),
  
  realCostUSD: real("real_cost_usd").notNull().default(0),
  billedCostUSD: real("billed_cost_usd").notNull().default(0),
  marginUSD: real("margin_usd").notNull().default(0),
  marginPercent: real("margin_percent").notNull().default(0),
  
  // Cost breakdown
  aiCostUSD: real("ai_cost_usd").notNull().default(0),
  apiCostUSD: real("api_cost_usd").notNull().default(0),
  storageCostUSD: real("storage_cost_usd").notNull().default(0),
  otherCostUSD: real("other_cost_usd").notNull().default(0),
  
  // User billing status
  isPaid: boolean("is_paid").notNull().default(false),
  invoiceId: varchar("invoice_id"),
  
  countryCode: text("country_code"),
  currency: text("currency").default("USD"),
  exchangeRate: real("exchange_rate").default(1),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_monthly_user").on(table.userId),
  index("IDX_monthly_period").on(table.year, table.month),
]);

export const insertMonthlyUsageSummarySchema = createInsertSchema(monthlyUsageSummary).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMonthlyUsageSummary = z.infer<typeof insertMonthlyUsageSummarySchema>;
export type MonthlyUsageSummary = typeof monthlyUsageSummary.$inferSelect;

// ============ SOVEREIGN OWNER CONTROL PANEL ============
// لوحة التحكم السيادية للمالك - التوجيه التنفيذي النهائي

// ==================== Ownership States Machine ====================
// نظام حالات الملكية السيادية
export const ownershipStates = ['ACTIVE_OWNER', 'PENDING_TRANSFER', 'FROZEN', 'LICENSED', 'ARCHIVED'] as const;
export type OwnershipState = typeof ownershipStates[number];

export const sovereignOwnerProfile = pgTable("sovereign_owner_profile", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: "restrict" }),
  
  // الهوية القانونية
  legalName: text("legal_name").notNull(),
  legalNameAr: text("legal_name_ar"),
  nationalId: text("national_id"), // مشفر
  passportNumber: text("passport_number"), // مشفر
  country: text("country").notNull(),
  
  // حالة الملكية
  ownershipState: text("ownership_state").notNull().default("ACTIVE_OWNER"),
  ownershipSince: timestamp("ownership_since").defaultNow(),
  
  // DID - Decentralized Identifier
  ownerDID: text("owner_did"), // للتحقق المستقبلي
  
  // الأمان المتقدم
  mfaEnabled: boolean("mfa_enabled").notNull().default(true),
  hardwareKeyRequired: boolean("hardware_key_required").notNull().default(true),
  biometricEnabled: boolean("biometric_enabled").notNull().default(false),
  allowedIPs: jsonb("allowed_ips").$type<string[]>().default([]),
  deviceFingerprints: jsonb("device_fingerprints").$type<string[]>().default([]),
  
  // جلسة واحدة فقط
  singleSessionOnly: boolean("single_session_only").notNull().default(true),
  currentSessionId: varchar("current_session_id"),
  lastSessionAt: timestamp("last_session_at"),
  
  // البصمة السلوكية
  behavioralProfile: jsonb("behavioral_profile").$type<Record<string, unknown>>(),
  
  // حد التكلفة اليومي
  dailyCostLimit: real("daily_cost_limit"),
  monthlyCostLimit: real("monthly_cost_limit"),
  
  // سجل غير قابل للتعديل
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSovereignOwnerProfileSchema = createInsertSchema(sovereignOwnerProfile).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSovereignOwnerProfile = z.infer<typeof insertSovereignOwnerProfileSchema>;
export type SovereignOwnerProfile = typeof sovereignOwnerProfile.$inferSelect;

// ==================== Ownership Transfer Records ====================
// سجل نقل الملكية
export const ownershipTransfers = pgTable("ownership_transfers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromOwnerId: varchar("from_owner_id").notNull(),
  toOwnerId: varchar("to_owner_id"),
  
  transferType: text("transfer_type").notNull(), // SALE, LICENSE, INHERITANCE, LEGAL_TRANSFER
  status: text("status").notNull().default("PENDING"), // PENDING, APPROVED, COMPLETED, REJECTED, CANCELLED
  
  // التفاصيل القانونية
  legalDocumentRef: text("legal_document_ref"),
  notaryRef: text("notary_ref"),
  valuationUSD: real("valuation_usd"),
  
  // التوقيعات
  fromOwnerSignature: text("from_owner_signature"), // Hash
  toOwnerSignature: text("to_owner_signature"), // Hash
  witnessSignatures: jsonb("witness_signatures").$type<string[]>().default([]),
  
  // الجدول الزمني
  initiatedAt: timestamp("initiated_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
  completedAt: timestamp("completed_at"),
  expiresAt: timestamp("expires_at"),
  
  // السبب
  reason: text("reason"),
  reasonAr: text("reason_ar"),
  
  // Checksum للسجل
  checksum: text("checksum"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOwnershipTransferSchema = createInsertSchema(ownershipTransfers).omit({
  id: true,
  createdAt: true,
});

export type InsertOwnershipTransfer = z.infer<typeof insertOwnershipTransferSchema>;
export type OwnershipTransfer = typeof ownershipTransfers.$inferSelect;

// ==================== AI Sovereignty Policy Engine ====================
// محرك سياسات سيادة الذكاء الاصطناعي
export const aiPolicies = pgTable("ai_policies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  
  // نوع السياسة
  policyType: text("policy_type").notNull(), // ALLOW, DENY, REVIEW_REQUIRED, CONDITIONAL
  
  // النطاق
  scope: text("scope").notNull(), // GLOBAL, USER_ROLE, COUNTRY, DATA_TYPE, MODEL
  scopeValue: text("scope_value"), // القيمة المحددة (مثل: 'SA' للسعودية)
  
  // القواعد (Policy-as-Code)
  rules: jsonb("rules").$type<{
    condition: string;
    action: string;
    parameters?: Record<string, unknown>;
  }[]>().default([]),
  
  // الأولوية
  priority: integer("priority").notNull().default(50), // 1-100, أعلى = أولوية أكبر
  
  // الحالة
  isActive: boolean("is_active").notNull().default(true),
  
  // المراجعة
  requiresHumanReview: boolean("requires_human_review").notNull().default(false),
  reviewerRoles: jsonb("reviewer_roles").$type<string[]>().default([]),
  
  // السجل
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAIPolicySchema = createInsertSchema(aiPolicies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAIPolicy = z.infer<typeof insertAIPolicySchema>;
export type AIPolicy = typeof aiPolicies.$inferSelect;

// ==================== Cost Attribution Engine ====================
// محرك إسناد التكلفة
export const costAttributions = pgTable("cost_attributions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // المصدر
  sourceType: text("source_type").notNull(), // USER, ASSISTANT, SERVICE, MODEL, SYSTEM
  sourceId: varchar("source_id").notNull(),
  sourceName: text("source_name"),
  
  // نوع التكلفة
  costType: text("cost_type").notNull(), // AI_INFERENCE, API_CALL, STORAGE, COMPUTE, BANDWIDTH, RISK, SCALING
  
  // التكاليف
  realCostUSD: real("real_cost_usd").notNull().default(0),
  hiddenCostUSD: real("hidden_cost_usd").notNull().default(0), // Infra + Risk + Scaling
  totalCostUSD: real("total_cost_usd").notNull().default(0),
  billedCostUSD: real("billed_cost_usd").notNull().default(0),
  marginUSD: real("margin_usd").notNull().default(0),
  marginPercent: real("margin_percent").notNull().default(0),
  
  // التفاصيل
  units: integer("units").notNull().default(1), // عدد الوحدات (tokens, requests, MB)
  unitType: text("unit_type"), // tokens, requests, mb, hours
  unitCost: real("unit_cost").notNull().default(0),
  
  // الفترة
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  
  // البيانات الوصفية
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_cost_source").on(table.sourceType, table.sourceId),
  index("IDX_cost_period").on(table.periodStart, table.periodEnd),
]);

export const insertCostAttributionSchema = createInsertSchema(costAttributions).omit({
  id: true,
  createdAt: true,
});

export type InsertCostAttribution = z.infer<typeof insertCostAttributionSchema>;
export type CostAttribution = typeof costAttributions.$inferSelect;

// ==================== Owner Margin Guard ====================
// حارس هامش المالك
export const marginGuardConfigs = pgTable("margin_guard_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // الحد الأدنى للهامش
  minimumMarginPercent: real("minimum_margin_percent").notNull().default(20),
  
  // تنبيهات
  warningThresholdPercent: real("warning_threshold_percent").notNull().default(25),
  criticalThresholdPercent: real("critical_threshold_percent").notNull().default(15),
  
  // الإجراءات التلقائية
  autoSuspendOnNegativeMargin: boolean("auto_suspend_on_negative_margin").notNull().default(false),
  autoNotifyOnWarning: boolean("auto_notify_on_warning").notNull().default(true),
  
  // القنوات
  notificationChannels: jsonb("notification_channels").$type<string[]>().default(['email', 'dashboard']),
  
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMarginGuardConfigSchema = createInsertSchema(marginGuardConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMarginGuardConfig = z.infer<typeof insertMarginGuardConfigSchema>;
export type MarginGuardConfig = typeof marginGuardConfigs.$inferSelect;

// ==================== Immutable Audit Trail ====================
// سجل التدقيق غير القابل للتعديل
export const immutableAuditTrail = pgTable("immutable_audit_trail", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // سلسلة Hash
  previousHash: text("previous_hash"), // Hash السجل السابق
  currentHash: text("current_hash").notNull(), // Hash هذا السجل
  
  // البيانات
  eventType: text("event_type").notNull(),
  eventData: jsonb("event_data").$type<Record<string, unknown>>().notNull(),
  
  // الطابع الزمني المعتمد (RFC 3161)
  timestamp: timestamp("timestamp").defaultNow(),
  timestampAuthority: text("timestamp_authority"), // مرجع الطابع الزمني
  timestampSignature: text("timestamp_signature"), // توقيع الطابع
  
  // Merkle Tree
  merkleRoot: text("merkle_root"),
  merkleProof: jsonb("merkle_proof").$type<string[]>(),
  blockNumber: integer("block_number"), // رقم الكتلة في Merkle Tree
  
  // المصدر
  actorId: varchar("actor_id"),
  actorType: text("actor_type"), // OWNER, SYSTEM, AI_ASSISTANT
  actorIP: text("actor_ip"),
  actorDevice: text("actor_device"),
  
  // التحقق
  verified: boolean("verified").notNull().default(false),
  verifiedAt: timestamp("verified_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_audit_hash").on(table.currentHash),
  index("IDX_audit_merkle").on(table.merkleRoot),
  index("IDX_audit_block").on(table.blockNumber),
]);

export const insertImmutableAuditTrailSchema = createInsertSchema(immutableAuditTrail).omit({
  id: true,
  createdAt: true,
});

export type InsertImmutableAuditTrail = z.infer<typeof insertImmutableAuditTrailSchema>;
export type ImmutableAuditTrail = typeof immutableAuditTrail.$inferSelect;

// ==================== Post-Mortem Reports ====================
// تقارير ما بعد الحوادث
export const postMortemReports = pgTable("post_mortem_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // ربط بالطوارئ
  emergencyControlId: varchar("emergency_control_id"),
  
  // معلومات الحادث
  incidentTitle: text("incident_title").notNull(),
  incidentTitleAr: text("incident_title_ar"),
  incidentSeverity: text("incident_severity").notNull(), // LOW, MEDIUM, HIGH, CRITICAL
  
  // الجدول الزمني
  incidentStartedAt: timestamp("incident_started_at").notNull(),
  incidentResolvedAt: timestamp("incident_resolved_at"),
  totalDowntimeMinutes: integer("total_downtime_minutes"),
  
  // التحليل
  rootCause: text("root_cause").notNull(),
  rootCauseAr: text("root_cause_ar"),
  impactSummary: text("impact_summary").notNull(),
  impactSummaryAr: text("impact_summary_ar"),
  
  // الإجراءات المتخذة
  actionsTaken: jsonb("actions_taken").$type<{
    action: string;
    actionAr?: string;
    timestamp: string;
    performer: string;
  }[]>().default([]),
  
  // الدروس المستفادة
  lessonsLearned: jsonb("lessons_learned").$type<string[]>().default([]),
  lessonsLearnedAr: jsonb("lessons_learned_ar").$type<string[]>().default([]),
  
  // إجراءات المتابعة
  followUpActions: jsonb("follow_up_actions").$type<{
    action: string;
    deadline: string;
    assignee: string;
    status: string;
  }[]>().default([]),
  
  // التوقيع
  status: text("status").notNull().default("DRAFT"), // DRAFT, PENDING_REVIEW, SIGNED, CLOSED
  ownerSignature: text("owner_signature"), // Hash توقيع المالك
  signedAt: timestamp("signed_at"),
  
  // الكاتب
  authorId: varchar("author_id").notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPostMortemReportSchema = createInsertSchema(postMortemReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPostMortemReport = z.infer<typeof insertPostMortemReportSchema>;
export type PostMortemReport = typeof postMortemReports.$inferSelect;

// ==================== Security Incidents ====================
// سجل الحوادث الأمنية
export const securityIncidents = pgTable("security_incidents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // نوع الحادث
  incidentType: text("incident_type").notNull(), // UNAUTHORIZED_ACCESS, BRUTE_FORCE, DATA_BREACH, POLICY_VIOLATION
  severity: text("severity").notNull(), // LOW, MEDIUM, HIGH, CRITICAL
  
  // المصدر
  sourceIP: text("source_ip"),
  sourceDevice: text("source_device"),
  sourceUserId: varchar("source_user_id"),
  
  // الهدف
  targetResource: text("target_resource").notNull(),
  targetResourceId: varchar("target_resource_id"),
  
  // التفاصيل
  description: text("description").notNull(),
  descriptionAr: text("description_ar"),
  evidence: jsonb("evidence").$type<Record<string, unknown>>(),
  
  // الاستجابة
  autoResponseTaken: jsonb("auto_response_taken").$type<string[]>().default([]),
  manualResponseRequired: boolean("manual_response_required").notNull().default(false),
  
  // الحالة
  status: text("status").notNull().default("OPEN"), // OPEN, INVESTIGATING, RESOLVED, FALSE_POSITIVE
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: varchar("resolved_by"),
  resolution: text("resolution"),
  
  // ربط بتقرير Post-Mortem
  postMortemId: varchar("post_mortem_id"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_security_severity").on(table.severity),
  index("IDX_security_status").on(table.status),
]);

export const insertSecurityIncidentSchema = createInsertSchema(securityIncidents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSecurityIncident = z.infer<typeof insertSecurityIncidentSchema>;
export type SecurityIncident = typeof securityIncidents.$inferSelect;

// ==================== SOVEREIGN INFRASTRUCTURE ====================
// البنية التحتية السيادية

// Infrastructure Roles for MCP (Owner/Admin/Viewer)
export const infrastructureRoles = ['owner', 'admin', 'viewer'] as const;
export type InfrastructureRole = typeof infrastructureRoles[number];

// Infrastructure role permissions mapping
export const infrastructureRolePermissions = {
  owner: ['*'], // Full access
  admin: ['servers:read', 'servers:control', 'providers:read', 'logs:read'], // No token access
  viewer: ['servers:read', 'providers:read'], // Read only
} as const;

// Check infrastructure permission
export function hasInfraPermission(role: InfrastructureRole, permission: string): boolean {
  const perms = infrastructureRolePermissions[role] as readonly string[];
  return perms.includes('*') || perms.includes(permission);
}

// Immutable Audit Log for Infrastructure Actions
export const infrastructureAuditLogs = pgTable("infrastructure_audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Who performed the action
  userId: varchar("user_id").notNull(),
  userEmail: text("user_email"),
  userRole: text("user_role").notNull(), // owner, admin, viewer
  userIp: text("user_ip"),
  
  // What action was performed
  action: text("action").notNull(), // server:start, server:stop, server:reboot, provider:create, etc.
  actionCategory: text("action_category").notNull(), // server, provider, sync, auth
  
  // Target of the action
  targetType: text("target_type").notNull(), // server, provider, credentials
  targetId: varchar("target_id"),
  targetName: text("target_name"),
  
  // Before/After state (for auditing)
  stateBefore: jsonb("state_before").$type<Record<string, any>>(),
  stateAfter: jsonb("state_after").$type<Record<string, any>>(),
  
  // Result
  success: boolean("success").notNull(),
  errorMessage: text("error_message"),
  errorCode: text("error_code"),
  
  // Provider-specific
  providerId: varchar("provider_id"),
  providerType: text("provider_type"), // hetzner, aws, gcp, etc.
  externalRequestId: text("external_request_id"), // Provider's request ID
  
  // Metadata
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  requestDuration: integer("request_duration"), // ms
  
  // Immutable timestamp
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_audit_user").on(table.userId),
  index("idx_audit_action").on(table.action),
  index("idx_audit_target").on(table.targetType, table.targetId),
  index("idx_audit_created").on(table.createdAt),
  index("idx_audit_provider").on(table.providerId),
]);

export const insertInfrastructureAuditLogSchema = createInsertSchema(infrastructureAuditLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertInfrastructureAuditLog = z.infer<typeof insertInfrastructureAuditLogSchema>;
export type InfrastructureAuditLog = typeof infrastructureAuditLogs.$inferSelect;

// Provider Error Logs (API errors, rate limits, etc.)
export const providerErrorLogs = pgTable("provider_error_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  providerId: varchar("provider_id").notNull(),
  providerType: text("provider_type").notNull(),
  
  // Error details
  errorType: text("error_type").notNull(), // api_error, rate_limit, invalid_token, network_failure, timeout
  errorCode: text("error_code"),
  errorMessage: text("error_message").notNull(),
  httpStatus: integer("http_status"),
  
  // Request context
  endpoint: text("endpoint"),
  method: text("method"),
  requestPayload: jsonb("request_payload").$type<Record<string, any>>(),
  responseBody: jsonb("response_body").$type<Record<string, any>>(),
  
  // Resolution
  resolved: boolean("resolved").notNull().default(false),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: varchar("resolved_by"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_provider_error_provider").on(table.providerId),
  index("idx_provider_error_type").on(table.errorType),
  index("idx_provider_error_created").on(table.createdAt),
]);

export const insertProviderErrorLogSchema = createInsertSchema(providerErrorLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertProviderErrorLog = z.infer<typeof insertProviderErrorLogSchema>;
export type ProviderErrorLog = typeof providerErrorLogs.$inferSelect;

// مزودي البنية التحتية (Hetzner, AWS, GCP, etc.)
export const infrastructureProviders = pgTable("infrastructure_providers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // معلومات المزود
  name: text("name").notNull(), // hetzner, aws, gcp, azure, digitalocean
  displayName: text("display_name").notNull(),
  displayNameAr: text("display_name_ar"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  
  // التكوين
  type: text("type").notNull().default("primary"), // primary, secondary, backup, staging
  isEnabled: boolean("is_enabled").notNull().default(false),
  isPrimary: boolean("is_primary").notNull().default(false),
  
  // المناطق المدعومة
  regions: jsonb("regions").$type<{
    id: string;
    name: string;
    location: string;
    isActive: boolean;
  }[]>().default([]),
  
  // أنواع السيرفرات المدعومة
  serverTypes: jsonb("server_types").$type<{
    id: string;
    name: string;
    cpu: number;
    ram: number; // GB
    storage: number; // GB
    priceHourly: number;
    priceMonthly: number;
    currency: string;
  }[]>().default([]),
  
  // بيانات الاعتماد (مشفرة)
  credentialsRef: text("credentials_ref"), // مرجع للمفتاح المشفر
  apiEndpoint: text("api_endpoint"),
  
  // الحالة
  connectionStatus: text("connection_status").notNull().default("disconnected"), // connected, disconnected, error
  lastHealthCheck: timestamp("last_health_check"),
  healthScore: integer("health_score").default(100),
  
  // الإحصائيات
  activeServers: integer("active_servers").default(0),
  totalCostThisMonth: real("total_cost_this_month").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertInfrastructureProviderSchema = createInsertSchema(infrastructureProviders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertInfrastructureProvider = z.infer<typeof insertInfrastructureProviderSchema>;
export type InfrastructureProvider = typeof infrastructureProviders.$inferSelect;

// بيانات اعتماد المزودين (مشفرة)
export const providerCredentials = pgTable("provider_credentials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // ربط بالمزود
  providerId: varchar("provider_id").notNull(),
  
  // نوع الاعتماد
  credentialType: text("credential_type").notNull().default("api_token"), // api_token, api_key, oauth
  
  // البيانات المشفرة
  encryptedToken: text("encrypted_token").notNull(),
  tokenIv: text("token_iv").notNull(), // Initialization Vector
  tokenAuthTag: text("token_auth_tag"), // Authentication Tag for GCM
  tokenSalt: text("token_salt"), // Salt for key derivation
  
  // معلومات للعرض (غير حساسة)
  lastFourChars: text("last_four_chars"), // آخر 4 أحرف للعرض
  tokenHash: text("token_hash"), // Hash للتحقق من التكرار
  
  // الحالة
  isActive: boolean("is_active").notNull().default(true),
  lastUsedAt: timestamp("last_used_at"),
  lastVerifiedAt: timestamp("last_verified_at"),
  
  // التدقيق
  createdBy: varchar("created_by"),
  updatedBy: varchar("updated_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_provider_credentials_provider").on(table.providerId),
]);

export const insertProviderCredentialSchema = createInsertSchema(providerCredentials).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProviderCredential = z.infer<typeof insertProviderCredentialSchema>;
export type ProviderCredential = typeof providerCredentials.$inferSelect;

// السيرفرات
export const infrastructureServers = pgTable("infrastructure_servers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // ربط بالمزود
  providerId: varchar("provider_id").notNull(),
  externalId: text("external_id"), // ID من المزود
  
  // معلومات السيرفر
  name: text("name").notNull(),
  description: text("description"),
  
  // التكوين
  serverType: text("server_type").notNull(),
  region: text("region").notNull(),
  ipv4: text("ipv4"),
  ipv6: text("ipv6"),
  
  // الموارد
  cpu: integer("cpu").notNull(),
  ram: integer("ram").notNull(), // GB
  storage: integer("storage").notNull(), // GB
  
  // الحالة
  status: text("status").notNull().default("provisioning"), // provisioning, running, stopped, error, terminated
  powerStatus: text("power_status").default("off"), // on, off
  
  // النظام
  os: text("os").default("ubuntu-22.04"),
  osVersion: text("os_version"),
  
  // الغرض
  purpose: text("purpose").notNull().default("production"), // production, staging, development, backup
  workloads: jsonb("workloads").$type<string[]>().default([]), // api, web, database, cache
  
  // التكلفة
  costPerHour: real("cost_per_hour").default(0),
  costPerMonth: real("cost_per_month").default(0),
  totalCostToDate: real("total_cost_to_date").default(0),
  
  // المراقبة
  cpuUsage: real("cpu_usage").default(0),
  ramUsage: real("ram_usage").default(0),
  storageUsage: real("storage_usage").default(0),
  networkIn: real("network_in").default(0),
  networkOut: real("network_out").default(0),
  lastMetricsAt: timestamp("last_metrics_at"),
  
  // الصيانة
  maintenanceMode: boolean("maintenance_mode").notNull().default(false),
  lastBackupAt: timestamp("last_backup_at"),
  
  // Metadata (MCP Phase 4)
  tags: jsonb("tags").$type<string[]>().default(sql`'[]'::jsonb`),
  notes: text("notes"),
  projectId: varchar("project_id"),
  ownerNotes: text("owner_notes"),
  labels: jsonb("labels").$type<Record<string, string>>().default(sql`'{}'::jsonb`),
  
  // Sync metadata
  lastSyncAt: timestamp("last_sync_at"),
  syncError: text("sync_error"),
  syncStatus: text("sync_status").default("synced"), // synced, pending, error
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_server_provider").on(table.providerId),
  index("IDX_server_status").on(table.status),
  index("IDX_server_project").on(table.projectId),
]);

export const insertInfrastructureServerSchema = createInsertSchema(infrastructureServers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertInfrastructureServer = z.infer<typeof insertInfrastructureServerSchema>;
export type InfrastructureServer = typeof infrastructureServers.$inferSelect;

// قوالب النشر
export const deploymentTemplates = pgTable("deployment_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // معلومات القالب
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  icon: text("icon").default("box"),
  
  // النوع
  type: text("type").notNull(), // nodejs, python, wordpress, api, static, custom
  category: text("category").notNull().default("web"), // web, api, database, cache, custom
  
  // المتطلبات
  minCpu: integer("min_cpu").default(1),
  minRam: integer("min_ram").default(1), // GB
  minStorage: integer("min_storage").default(10), // GB
  recommendedServerType: text("recommended_server_type"),
  
  // التكوين
  dockerImage: text("docker_image"),
  dockerCompose: text("docker_compose"),
  environmentVariables: jsonb("environment_variables").$type<{
    key: string;
    defaultValue: string;
    required: boolean;
    secret: boolean;
  }[]>().default([]),
  
  // البناء
  buildCommand: text("build_command"),
  startCommand: text("start_command"),
  healthCheckPath: text("health_check_path").default("/health"),
  
  // الإعدادات
  isActive: boolean("is_active").notNull().default(true),
  isPublic: boolean("is_public").notNull().default(false),
  usageCount: integer("usage_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDeploymentTemplateSchema = createInsertSchema(deploymentTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDeploymentTemplate = z.infer<typeof insertDeploymentTemplateSchema>;
export type DeploymentTemplate = typeof deploymentTemplates.$inferSelect;

// عمليات النشر
export const deploymentRuns = pgTable("deployment_runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // المصدر
  projectId: varchar("project_id"),
  templateId: varchar("template_id"),
  serverId: varchar("server_id").notNull(),
  
  // معلومات النشر
  name: text("name").notNull(),
  version: text("version").notNull().default("1.0.0"),
  environment: text("environment").notNull().default("production"), // production, staging, development
  
  // المستودع
  gitRepo: text("git_repo"),
  gitBranch: text("git_branch").default("main"),
  gitCommit: text("git_commit"),
  
  // الحالة
  status: text("status").notNull().default("pending"), // pending, building, deploying, running, failed, rolled_back
  progress: integer("progress").default(0), // 0-100
  
  // الخطوات
  steps: jsonb("steps").$type<{
    name: string;
    status: string; // pending, running, success, failed
    startedAt?: string;
    completedAt?: string;
    error?: string;
  }[]>().default([]),
  
  // النتيجة
  deployedUrl: text("deployed_url"),
  healthStatus: text("health_status").default("unknown"), // healthy, unhealthy, unknown
  
  // الأخطاء
  errorMessage: text("error_message"),
  errorDetails: jsonb("error_details").$type<Record<string, unknown>>(),
  
  // الوضع
  deploymentMode: text("deployment_mode").notNull().default("auto"), // auto, manual_approve, emergency
  approvedBy: varchar("approved_by"),
  approvedAt: timestamp("approved_at"),
  
  // التراجع
  canRollback: boolean("can_rollback").notNull().default(false),
  previousVersion: text("previous_version"),
  rolledBackAt: timestamp("rolled_back_at"),
  rolledBackBy: varchar("rolled_back_by"),
  
  // المنفذ
  initiatedBy: varchar("initiated_by").notNull(),
  
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_deployment_server").on(table.serverId),
  index("IDX_deployment_status").on(table.status),
]);

export const insertDeploymentRunSchema = createInsertSchema(deploymentRuns).omit({
  id: true,
  createdAt: true,
});

export type InsertDeploymentRun = z.infer<typeof insertDeploymentRunSchema>;
export type DeploymentRun = typeof deploymentRuns.$inferSelect;

// النسخ الاحتياطية
export const infrastructureBackups = pgTable("infrastructure_backups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // المصدر
  serverId: varchar("server_id").notNull(),
  providerId: varchar("provider_id").notNull(),
  externalId: text("external_id"), // ID من المزود
  
  // معلومات النسخة
  name: text("name").notNull(),
  type: text("type").notNull().default("snapshot"), // snapshot, backup, export
  
  // الحجم
  sizeGb: real("size_gb").default(0),
  
  // الحالة
  status: text("status").notNull().default("creating"), // creating, available, restoring, deleting, error
  
  // الجدولة
  isAutomatic: boolean("is_automatic").notNull().default(false),
  scheduleType: text("schedule_type"), // hourly, daily, weekly
  retentionDays: integer("retention_days").default(30),
  
  // التكلفة
  costPerMonth: real("cost_per_month").default(0),
  
  // الاستعادة
  restoredAt: timestamp("restored_at"),
  restoredBy: varchar("restored_by"),
  
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_backup_server").on(table.serverId),
  index("IDX_backup_status").on(table.status),
]);

export const insertInfrastructureBackupSchema = createInsertSchema(infrastructureBackups).omit({
  id: true,
  createdAt: true,
});

export type InsertInfrastructureBackup = z.infer<typeof insertInfrastructureBackupSchema>;
export type InfrastructureBackup = typeof infrastructureBackups.$inferSelect;

// ==================== EXTERNAL INTEGRATION GATEWAY ====================
// بوابة التكامل الخارجي (Replit، Hetzner، وغيرها)

// أنواع الأغراض المتاحة للجلسات
export const sessionPurposes = [
  'development',        // تطوير وبناء
  'maintenance',        // صيانة دورية
  'technical_support',  // دعم فني
  'diagnostic',         // فحص وتشخيص
  'emergency',          // حالة طوارئ
  'update',             // تحديثات
  'security_audit',     // تدقيق أمني
  'performance_tuning', // تحسين الأداء
  'data_migration',     // نقل بيانات
  'backup_restore',     // نسخ احتياطي واستعادة
  'testing',            // اختبار
  'training',           // تدريب
] as const;
export type SessionPurpose = typeof sessionPurposes[number];

// أنواع المزودين
export const integrationProviders = [
  'replit',           // Replit
  'hetzner',          // Hetzner Cloud
  'aws',              // Amazon Web Services
  'azure',            // Microsoft Azure
  'gcp',              // Google Cloud Platform
  'digitalocean',     // DigitalOcean
  'cloudflare',       // Cloudflare
  'github',           // GitHub
  'gitlab',           // GitLab
  'custom',           // مزود مخصص
] as const;
export type IntegrationProvider = typeof integrationProviders[number];

// أنواع الوصول للجلسات
export const accessLevels = [
  'read_only',        // قراءة فقط
  'read_write',       // قراءة وكتابة
  'full_access',      // وصول كامل
  'admin',            // صلاحيات إدارية
  'root',             // صلاحيات جذرية (للطوارئ فقط)
] as const;
export type AccessLevel = typeof accessLevels[number];

export const externalIntegrationSessions = pgTable("external_integration_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // معلومات الجلسة
  partnerName: text("partner_name").notNull(), // replit, hetzner, aws, etc.
  partnerDisplayName: text("partner_display_name").notNull(),
  providerType: text("provider_type").default("custom"), // development, hosting, cloud, security
  
  // الغرض - موسّع
  purpose: text("purpose").notNull(), // development, maintenance, technical_support, diagnostic, etc.
  purposeDescription: text("purpose_description").notNull(),
  purposeDescriptionAr: text("purpose_description_ar"),
  
  // تصنيف الجلسة
  sessionType: text("session_type").default("standard"), // standard, priority, emergency, scheduled
  priority: text("priority").default("normal"), // low, normal, high, critical
  
  // معلومات الاتصال بالسيرفر
  serverConnection: jsonb("server_connection").$type<{
    serverId?: string;
    serverName?: string;
    serverIp?: string;
    sshPort?: number;
    connectionMethod?: string; // ssh, api, console, vpn
    credentials?: {
      type: string; // key, password, token
      keyFingerprint?: string;
    };
  }>(),
  
  // مستوى الوصول
  accessLevel: text("access_level").default("read_only"), // read_only, read_write, full_access, admin, root
  
  // الصلاحيات التفصيلية
  permissions: jsonb("permissions").$type<{
    type: string; // read, write, execute, delete, admin
    scope: string; // code, logs, config, database, files, system, network
    resources: string[];
    actions?: string[]; // specific allowed actions
  }[]>().notNull(),
  
  // القيود
  restrictions: jsonb("restrictions").$type<{
    noAccessTo: string[];
    maxDuration: number; // minutes
    requireApproval: boolean;
    sandboxOnly: boolean;
    allowedCommands?: string[];
    blockedCommands?: string[];
    allowedPaths?: string[];
    blockedPaths?: string[];
    maxFileSize?: number; // bytes
    noDeleteData?: boolean;
    noModifyConfig?: boolean;
  }>().notNull(),
  
  // معلومات التواصل
  contactInfo: jsonb("contact_info").$type<{
    technician?: string;
    technicianEmail?: string;
    technicianPhone?: string;
    ticketNumber?: string;
    referenceNumber?: string;
  }>(),
  
  // الجدولة
  scheduledStart: timestamp("scheduled_start"),
  scheduledEnd: timestamp("scheduled_end"),
  
  // الحالة
  status: text("status").notNull().default("inactive"), // inactive, pending_activation, active, paused, expired, revoked, completed
  
  // التفعيل
  activatedAt: timestamp("activated_at"),
  activatedBy: varchar("activated_by"),
  activationReason: text("activation_reason"),
  
  // المصادقة
  mfaRequired: boolean("mfa_required").notNull().default(true),
  mfaVerifiedAt: timestamp("mfa_verified_at"),
  ownerSignature: text("owner_signature"), // توقيع المالك الرقمي
  
  // الانتهاء
  expiresAt: timestamp("expires_at"),
  autoCloseAfterTask: boolean("auto_close_after_task").notNull().default(true),
  
  // الإغلاق
  deactivatedAt: timestamp("deactivated_at"),
  deactivatedBy: varchar("deactivated_by"),
  deactivationReason: text("deactivation_reason"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_integration_partner").on(table.partnerName),
  index("IDX_integration_status").on(table.status),
]);

export const insertExternalIntegrationSessionSchema = createInsertSchema(externalIntegrationSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertExternalIntegrationSession = z.infer<typeof insertExternalIntegrationSessionSchema>;
export type ExternalIntegrationSession = typeof externalIntegrationSessions.$inferSelect;

// سجل عمليات التكامل الخارجي
export const externalIntegrationLogs = pgTable("external_integration_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // ربط بالجلسة
  sessionId: varchar("session_id").notNull(),
  
  // معلومات العملية
  operationType: text("operation_type").notNull(), // request, response, action, error
  operationName: text("operation_name").notNull(),
  operationDescription: text("operation_description"),
  
  // التفاصيل
  requestData: jsonb("request_data").$type<Record<string, unknown>>(),
  responseData: jsonb("response_data").$type<Record<string, unknown>>(),
  
  // الموارد المتأثرة
  affectedResources: jsonb("affected_resources").$type<{
    type: string;
    id: string;
    action: string;
  }[]>().default([]),
  
  // النتيجة
  status: text("status").notNull(), // success, failed, blocked, pending
  errorMessage: text("error_message"),
  
  // التتبع
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  
  // التوقيع
  checksum: text("checksum"), // hash للتحقق من السلامة
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_integration_log_session").on(table.sessionId),
  index("IDX_integration_log_type").on(table.operationType),
]);

export const insertExternalIntegrationLogSchema = createInsertSchema(externalIntegrationLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertExternalIntegrationLog = z.infer<typeof insertExternalIntegrationLogSchema>;
export type ExternalIntegrationLog = typeof externalIntegrationLogs.$inferSelect;

// ==================== COST INTELLIGENCE ====================
// ذكاء التكلفة

export const infrastructureCostAlerts = pgTable("infrastructure_cost_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // النوع
  alertType: text("alert_type").notNull(), // budget_warning, budget_exceeded, anomaly, optimization
  severity: text("severity").notNull().default("medium"), // low, medium, high, critical
  
  // المصدر
  providerId: varchar("provider_id"),
  serverId: varchar("server_id"),
  
  // التفاصيل
  title: text("title").notNull(),
  titleAr: text("title_ar"),
  message: text("message").notNull(),
  messageAr: text("message_ar"),
  
  // القيم
  currentValue: real("current_value"),
  thresholdValue: real("threshold_value"),
  currency: text("currency").default("USD"),
  
  // الاقتراح
  recommendation: text("recommendation"),
  recommendationAr: text("recommendation_ar"),
  potentialSavings: real("potential_savings"),
  
  // الحالة
  status: text("status").notNull().default("active"), // active, acknowledged, resolved, dismissed
  acknowledgedAt: timestamp("acknowledged_at"),
  acknowledgedBy: varchar("acknowledged_by"),
  resolvedAt: timestamp("resolved_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_cost_alert_type").on(table.alertType),
  index("IDX_cost_alert_status").on(table.status),
]);

export const insertInfrastructureCostAlertSchema = createInsertSchema(infrastructureCostAlerts).omit({
  id: true,
  createdAt: true,
});

export type InsertInfrastructureCostAlert = z.infer<typeof insertInfrastructureCostAlertSchema>;
export type InfrastructureCostAlert = typeof infrastructureCostAlerts.$inferSelect;

// إعدادات ميزانية البنية التحتية
export const infrastructureBudgets = pgTable("infrastructure_budgets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // النطاق
  scope: text("scope").notNull().default("global"), // global, provider, server
  scopeId: varchar("scope_id"), // provider_id or server_id
  
  // الميزانية
  monthlyBudget: real("monthly_budget").notNull(),
  currency: text("currency").notNull().default("USD"),
  
  // التنبيهات
  alertAt70: boolean("alert_at_70").notNull().default(true),
  alertAt85: boolean("alert_at_85").notNull().default(true),
  alertAt95: boolean("alert_at_95").notNull().default(true),
  alertAt100: boolean("alert_at_100").notNull().default(true),
  
  // الإجراءات التلقائية
  autoStopAt100: boolean("auto_stop_at_100").notNull().default(false),
  autoScaleDown: boolean("auto_scale_down").notNull().default(false),
  
  // الحالة الحالية
  currentSpend: real("current_spend").default(0),
  forecastedSpend: real("forecasted_spend").default(0),
  lastUpdated: timestamp("last_updated"),
  
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertInfrastructureBudgetSchema = createInsertSchema(infrastructureBudgets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertInfrastructureBudget = z.infer<typeof insertInfrastructureBudgetSchema>;
export type InfrastructureBudget = typeof infrastructureBudgets.$inferSelect;

// ==================== SOVEREIGN REAL-TIME NOTIFICATION SYSTEM (SRINS) ====================
// نظام الإشعارات اللحظية الذكية السيادي

// أنواع الإشعارات
export const notificationTypes = [
  'SECURITY', 'PAYMENT', 'AI', 'INFRASTRUCTURE', 'USER', 'SOVEREIGNTY', 
  'EMERGENCY', 'SYSTEM', 'PERFORMANCE', 'COMPLIANCE', 'INTEGRATION'
] as const;
export type NotificationType = typeof notificationTypes[number];

// مستويات الأهمية
export const notificationPriorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'EMERGENCY'] as const;
export type NotificationPriority = typeof notificationPriorities[number];

// قنوات التوصيل
export const notificationChannels = ['DASHBOARD', 'EMAIL', 'SMS', 'PUSH', 'WEBHOOK', 'ENCRYPTED'] as const;
export type NotificationChannel = typeof notificationChannels[number];

// الإشعارات الذكية السيادية
export const sovereignNotifications = pgTable("sovereign_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // معلومات أساسية
  title: text("title").notNull(),
  titleAr: text("title_ar"),
  message: text("message").notNull(),
  messageAr: text("message_ar"),
  
  // التصنيف
  type: text("type").notNull(), // SECURITY, PAYMENT, AI, INFRASTRUCTURE, etc.
  category: text("category"), // subcategory
  
  // الأهمية والذكاء
  priority: text("priority").notNull().default("MEDIUM"), // LOW, MEDIUM, HIGH, CRITICAL, EMERGENCY
  priorityScore: integer("priority_score").default(50), // 0-100 AI-calculated
  
  // تحليل السياق (AI-powered)
  contextAnalysis: jsonb("context_analysis").$type<{
    eventSeverity: number;
    userImpact: string;
    financialImpact?: number;
    repeatFrequency: number;
    riskLevel: string;
    suggestedActions: string[];
  }>(),
  
  // المستهدف
  targetType: text("target_type").notNull().default("user"), // user, owner, system, all
  targetUserId: varchar("target_user_id"),
  isOwnerOnly: boolean("is_owner_only").notNull().default(false),
  
  // القنوات
  channels: jsonb("channels").$type<string[]>().default(['DASHBOARD']),
  channelDeliveryStatus: jsonb("channel_delivery_status").$type<{
    channel: string;
    status: string; // pending, sent, delivered, failed
    sentAt?: string;
    deliveredAt?: string;
    error?: string;
  }[]>().default([]),
  
  // التوقيت الذكي
  scheduledFor: timestamp("scheduled_for"),
  expiresAt: timestamp("expires_at"),
  smartTiming: jsonb("smart_timing").$type<{
    timezone: string;
    preferredTime?: string;
    delayMinutes?: number;
    batchGroup?: string;
  }>(),
  
  // الحالة
  status: text("status").notNull().default("pending"), // pending, sent, delivered, read, acknowledged, expired, failed
  readAt: timestamp("read_at"),
  acknowledgedAt: timestamp("acknowledged_at"),
  acknowledgedBy: varchar("acknowledged_by"),
  
  // التصعيد
  requiresAcknowledgment: boolean("requires_acknowledgment").notNull().default(false),
  escalationLevel: integer("escalation_level").default(0),
  escalationHistory: jsonb("escalation_history").$type<{
    level: number;
    channel: string;
    timestamp: string;
    reason: string;
  }[]>().default([]),
  autoActionOnNoResponse: text("auto_action_on_no_response"),
  
  // البيانات المرفقة
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  sourceSystem: text("source_system"), // security, payment, ai, infrastructure
  sourceEventId: varchar("source_event_id"),
  
  // الروابط
  actionUrl: text("action_url"),
  actionLabel: text("action_label"),
  actionLabelAr: text("action_label_ar"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_notification_target").on(table.targetUserId),
  index("IDX_notification_priority").on(table.priority),
  index("IDX_notification_status").on(table.status),
  index("IDX_notification_type").on(table.type),
  index("IDX_notification_owner").on(table.isOwnerOnly),
]);

export const insertSovereignNotificationSchema = createInsertSchema(sovereignNotifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSovereignNotification = z.infer<typeof insertSovereignNotificationSchema>;
export type SovereignNotification = typeof sovereignNotifications.$inferSelect;

// قوالب الإشعارات
export const notificationTemplates = pgTable("notification_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // معلومات القالب
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  description: text("description"),
  
  // النوع
  type: text("type").notNull(),
  eventTrigger: text("event_trigger").notNull(), // الحدث الذي يطلق الإشعار
  
  // المحتوى
  titleTemplate: text("title_template").notNull(),
  titleTemplateAr: text("title_template_ar"),
  messageTemplate: text("message_template").notNull(),
  messageTemplateAr: text("message_template_ar"),
  
  // الإعدادات الافتراضية
  defaultPriority: text("default_priority").notNull().default("MEDIUM"),
  defaultChannels: jsonb("default_channels").$type<string[]>().default(['DASHBOARD']),
  requiresAcknowledgment: boolean("requires_acknowledgment").notNull().default(false),
  
  // التصعيد
  escalationRules: jsonb("escalation_rules").$type<{
    afterMinutes: number;
    escalateToChannel: string;
    maxEscalations: number;
  }[]>().default([]),
  
  // الإجراء التلقائي
  autoActionConfig: jsonb("auto_action_config").$type<{
    action: string;
    afterMinutes: number;
    condition: string;
  }>(),
  
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertNotificationTemplateSchema = createInsertSchema(notificationTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertNotificationTemplate = z.infer<typeof insertNotificationTemplateSchema>;
export type NotificationTemplate = typeof notificationTemplates.$inferSelect;

// تفضيلات إشعارات المستخدم
export const userNotificationPreferences = pgTable("user_notification_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  userId: varchar("user_id").notNull(),
  
  // القنوات المفضلة
  enabledChannels: jsonb("enabled_channels").$type<string[]>().default(['DASHBOARD', 'EMAIL']),
  
  // تفضيلات التوقيت
  timezone: text("timezone").default("UTC"),
  quietHoursStart: text("quiet_hours_start"), // "22:00"
  quietHoursEnd: text("quiet_hours_end"), // "08:00"
  respectQuietHours: boolean("respect_quiet_hours").notNull().default(true),
  
  // تفضيلات الأنواع
  typePreferences: jsonb("type_preferences").$type<{
    type: string;
    enabled: boolean;
    channels: string[];
    minPriority: string;
  }[]>().default([]),
  
  // تجميع الإشعارات
  enableBatching: boolean("enable_batching").notNull().default(true),
  batchIntervalMinutes: integer("batch_interval_minutes").default(30),
  
  // البريد الإلكتروني
  emailDigest: text("email_digest").default("instant"), // instant, daily, weekly, none
  
  // الهاتف (SMS/Push)
  phoneNumber: text("phone_number"),
  enableSms: boolean("enable_sms").notNull().default(false),
  enablePush: boolean("enable_push").notNull().default(true),
  pushSubscription: jsonb("push_subscription").$type<Record<string, unknown>>(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_notification_pref_user").on(table.userId),
]);

export const insertUserNotificationPreferencesSchema = createInsertSchema(userNotificationPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUserNotificationPreferences = z.infer<typeof insertUserNotificationPreferencesSchema>;
export type UserNotificationPreferences = typeof userNotificationPreferences.$inferSelect;

// سجل تصعيد الإشعارات
export const notificationEscalations = pgTable("notification_escalations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  notificationId: varchar("notification_id").notNull(),
  
  // مستوى التصعيد
  escalationLevel: integer("escalation_level").notNull(),
  previousChannel: text("previous_channel"),
  newChannel: text("new_channel").notNull(),
  
  // السبب
  reason: text("reason").notNull(), // no_response, failed_delivery, manual
  
  // النتيجة
  status: text("status").notNull().default("pending"), // pending, sent, acknowledged, failed
  responseReceivedAt: timestamp("response_received_at"),
  
  // الإجراء التلقائي
  autoActionTriggered: boolean("auto_action_triggered").notNull().default(false),
  autoActionDetails: jsonb("auto_action_details").$type<Record<string, unknown>>(),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_escalation_notification").on(table.notificationId),
]);

export const insertNotificationEscalationSchema = createInsertSchema(notificationEscalations).omit({
  id: true,
  createdAt: true,
});

export type InsertNotificationEscalation = z.infer<typeof insertNotificationEscalationSchema>;
export type NotificationEscalation = typeof notificationEscalations.$inferSelect;

// إحصائيات الإشعارات
export const notificationAnalytics = pgTable("notification_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // الفترة
  periodType: text("period_type").notNull(), // hourly, daily, weekly, monthly
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  
  // الإحصائيات العامة
  totalSent: integer("total_sent").default(0),
  totalDelivered: integer("total_delivered").default(0),
  totalRead: integer("total_read").default(0),
  totalAcknowledged: integer("total_acknowledged").default(0),
  totalFailed: integer("total_failed").default(0),
  totalEscalated: integer("total_escalated").default(0),
  
  // متوسط الأوقات
  avgDeliveryTimeMs: integer("avg_delivery_time_ms").default(0),
  avgReadTimeMinutes: integer("avg_read_time_minutes").default(0),
  avgAcknowledgeTimeMinutes: integer("avg_acknowledge_time_minutes").default(0),
  
  // حسب النوع
  byType: jsonb("by_type").$type<Record<string, number>>().default({}),
  byPriority: jsonb("by_priority").$type<Record<string, number>>().default({}),
  byChannel: jsonb("by_channel").$type<Record<string, number>>().default({}),
  
  // معدلات النجاح
  deliveryRate: real("delivery_rate").default(0),
  readRate: real("read_rate").default(0),
  acknowledgmentRate: real("acknowledgment_rate").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_analytics_period").on(table.periodType, table.periodStart),
]);

export const insertNotificationAnalyticsSchema = createInsertSchema(notificationAnalytics).omit({
  id: true,
  createdAt: true,
});

export type InsertNotificationAnalytics = z.infer<typeof insertNotificationAnalyticsSchema>;
export type NotificationAnalytics = typeof notificationAnalytics.$inferSelect;

// ==================== AI SMART SUGGESTIONS SYSTEM ====================
// نظام الاقتراحات الذكية - يحلل الكود ويقترح تحسينات

// أنواع الاقتراحات
export const suggestionTypes = ['performance', 'security', 'accessibility', 'seo', 'best_practice', 'code_quality', 'ux', 'optimization'] as const;
export type SuggestionType = typeof suggestionTypes[number];

// مستويات الأهمية
export const suggestionPriorities = ['critical', 'high', 'medium', 'low', 'info'] as const;
export type SuggestionPriority = typeof suggestionPriorities[number];

// حالة الاقتراح
export const suggestionStatuses = ['pending', 'accepted', 'rejected', 'applied', 'deferred'] as const;
export type SuggestionStatus = typeof suggestionStatuses[number];

// جلسات تحليل الكود
export const codeAnalysisSessions = pgTable("code_analysis_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  projectId: varchar("project_id").notNull(),
  userId: varchar("user_id").notNull(),
  
  // تفاصيل التحليل
  analysisType: text("analysis_type").notNull().default("full"), // full, quick, security, performance
  codeSnapshot: jsonb("code_snapshot").$type<{
    html?: string;
    css?: string;
    js?: string;
    backend?: string;
  }>(),
  
  // إحصائيات
  totalSuggestions: integer("total_suggestions").default(0),
  criticalIssues: integer("critical_issues").default(0),
  appliedSuggestions: integer("applied_suggestions").default(0),
  
  // نتائج التحليل
  overallScore: integer("overall_score").default(0), // 0-100
  performanceScore: integer("performance_score").default(0),
  securityScore: integer("security_score").default(0),
  accessibilityScore: integer("accessibility_score").default(0),
  seoScore: integer("seo_score").default(0),
  codeQualityScore: integer("code_quality_score").default(0),
  
  // الحالة
  status: text("status").notNull().default("pending"), // pending, analyzing, completed, failed
  completedAt: timestamp("completed_at"),
  errorMessage: text("error_message"),
  
  // التكلفة
  tokensUsed: integer("tokens_used").default(0),
  costUsd: real("cost_usd").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_analysis_project").on(table.projectId),
  index("IDX_analysis_user").on(table.userId),
]);

export const insertCodeAnalysisSessionSchema = createInsertSchema(codeAnalysisSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCodeAnalysisSession = z.infer<typeof insertCodeAnalysisSessionSchema>;
export type CodeAnalysisSession = typeof codeAnalysisSessions.$inferSelect;

// الاقتراحات الذكية
export const smartSuggestions = pgTable("smart_suggestions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  sessionId: varchar("session_id").notNull(),
  projectId: varchar("project_id").notNull(),
  userId: varchar("user_id").notNull(),
  
  // نوع الاقتراح
  type: text("type").notNull(), // performance, security, accessibility, seo, best_practice, code_quality, ux, optimization
  priority: text("priority").notNull().default("medium"), // critical, high, medium, low, info
  
  // تفاصيل الاقتراح
  title: text("title").notNull(),
  titleAr: text("title_ar").notNull(),
  description: text("description").notNull(),
  descriptionAr: text("description_ar").notNull(),
  
  // الكود المتأثر
  affectedFile: text("affected_file"), // html, css, js, backend
  affectedCode: text("affected_code"), // snippet of affected code
  lineNumber: integer("line_number"),
  
  // الحل المقترح
  suggestedFix: text("suggested_fix"),
  suggestedFixAr: text("suggested_fix_ar"),
  codeBeforefix: text("code_before_fix"),
  codeAfterFix: text("code_after_fix"),
  
  // التطبيق التلقائي
  canAutoApply: boolean("can_auto_apply").notNull().default(false),
  autoApplyScript: text("auto_apply_script"), // JSON with transformation instructions
  
  // التأثير المتوقع
  expectedImpact: text("expected_impact"),
  expectedImpactAr: text("expected_impact_ar"),
  estimatedEffort: text("estimated_effort"), // minutes, hours, days
  
  // مصادر ومراجع
  references: jsonb("references").$type<{
    url: string;
    title: string;
  }[]>().default([]),
  
  // الحالة
  status: text("status").notNull().default("pending"), // pending, accepted, rejected, applied, deferred
  appliedAt: timestamp("applied_at"),
  appliedBy: varchar("applied_by"),
  rejectedReason: text("rejected_reason"),
  
  // تقييم المستخدم
  userRating: integer("user_rating"), // 1-5
  userFeedback: text("user_feedback"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_suggestion_session").on(table.sessionId),
  index("IDX_suggestion_project").on(table.projectId),
  index("IDX_suggestion_type").on(table.type),
  index("IDX_suggestion_priority").on(table.priority),
  index("IDX_suggestion_status").on(table.status),
]);

export const insertSmartSuggestionSchema = createInsertSchema(smartSuggestions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSmartSuggestion = z.infer<typeof insertSmartSuggestionSchema>;
export type SmartSuggestion = typeof smartSuggestions.$inferSelect;

// قواعد التحليل المخصصة (للمالك)
export const analysisRules = pgTable("analysis_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // معلومات القاعدة
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  description: text("description"),
  descriptionAr: text("description_ar"),
  
  // النوع والأولوية
  type: text("type").notNull(), // performance, security, etc.
  priority: text("priority").notNull().default("medium"),
  
  // نمط البحث
  pattern: text("pattern").notNull(), // regex or code pattern
  patternType: text("pattern_type").notNull().default("regex"), // regex, ast, literal
  targetFiles: jsonb("target_files").$type<string[]>().default(['html', 'css', 'js']),
  
  // رسالة الاقتراح
  suggestionTitle: text("suggestion_title").notNull(),
  suggestionTitleAr: text("suggestion_title_ar").notNull(),
  suggestionDescription: text("suggestion_description").notNull(),
  suggestionDescriptionAr: text("suggestion_description_ar").notNull(),
  suggestedFix: text("suggested_fix"),
  suggestedFixAr: text("suggested_fix_ar"),
  
  // الحالة
  isActive: boolean("is_active").notNull().default(true),
  isBuiltIn: boolean("is_built_in").notNull().default(false),
  
  // الإنشاء
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_rule_type").on(table.type),
  index("IDX_rule_active").on(table.isActive),
]);

export const insertAnalysisRuleSchema = createInsertSchema(analysisRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAnalysisRule = z.infer<typeof insertAnalysisRuleSchema>;
export type AnalysisRule = typeof analysisRules.$inferSelect;

// تاريخ تحسينات المشروع
export const projectImprovementHistory = pgTable("project_improvement_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  projectId: varchar("project_id").notNull(),
  userId: varchar("user_id").notNull(),
  suggestionId: varchar("suggestion_id"),
  
  // نوع التحسين
  improvementType: text("improvement_type").notNull(),
  
  // التغييرات
  changeDescription: text("change_description").notNull(),
  changeDescriptionAr: text("change_description_ar").notNull(),
  
  // الكود
  filePath: text("file_path"),
  codeBefore: text("code_before"),
  codeAfter: text("code_after"),
  
  // النتائج
  scoreImprovement: integer("score_improvement").default(0),
  impactMetrics: jsonb("impact_metrics").$type<{
    performanceGain?: number;
    securityScore?: number;
    accessibilityScore?: number;
  }>(),
  
  // الحالة
  wasAutoApplied: boolean("was_auto_applied").notNull().default(false),
  canRevert: boolean("can_revert").notNull().default(true),
  revertedAt: timestamp("reverted_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_improvement_project").on(table.projectId),
  index("IDX_improvement_type").on(table.improvementType),
]);

export const insertProjectImprovementHistorySchema = createInsertSchema(projectImprovementHistory).omit({
  id: true,
  createdAt: true,
});

export type InsertProjectImprovementHistory = z.infer<typeof insertProjectImprovementHistorySchema>;
export type ProjectImprovementHistory = typeof projectImprovementHistory.$inferSelect;

// ==================== NAMECHEAP EXTENDED DOMAINS ====================

// DNS record types for Namecheap
export const namecheapDnsRecordTypes = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'URL', 'URL301', 'FRAME'] as const;
export type NamecheapDnsRecordType = typeof namecheapDnsRecordTypes[number];

// Namecheap Domains table - Extended for full Namecheap integration
export const namecheapDomains = pgTable("namecheap_domains", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  namecheapId: text("namecheap_id"),
  domainName: text("domain_name").notNull().unique(),
  sld: text("sld").notNull(),
  tld: text("tld").notNull(),
  
  ownerId: varchar("owner_id").references(() => users.id, { onDelete: "set null" }),
  
  status: text("status").notNull().default("pending"),
  isLocked: boolean("is_locked").notNull().default(false),
  isAutoRenew: boolean("is_auto_renew").notNull().default(true),
  isPremium: boolean("is_premium").notNull().default(false),
  whoisGuard: boolean("whois_guard").notNull().default(true),
  
  expiresAt: timestamp("expires_at"),
  registeredAt: timestamp("registered_at"),
  
  nameservers: jsonb("nameservers").$type<string[]>().default(sql`'[]'::jsonb`),
  useCustomNameservers: boolean("use_custom_nameservers").notNull().default(false),
  
  registrationPrice: real("registration_price"),
  renewalPrice: real("renewal_price"),
  currency: text("currency").default("USD"),
  
  lastSyncAt: timestamp("last_sync_at"),
  syncError: text("sync_error"),
  notes: text("notes"),
  tags: jsonb("tags").$type<string[]>().default(sql`'[]'::jsonb`),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_nc_domain_owner").on(table.ownerId),
  index("IDX_nc_domain_status").on(table.status),
  index("IDX_nc_domain_expires").on(table.expiresAt),
]);

export const insertNamecheapDomainSchema = createInsertSchema(namecheapDomains).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertNamecheapDomain = z.infer<typeof insertNamecheapDomainSchema>;
export type NamecheapDomain = typeof namecheapDomains.$inferSelect;

// Namecheap DNS Records table
export const namecheapDnsRecords = pgTable("namecheap_dns_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  domainId: varchar("domain_id").references(() => namecheapDomains.id, { onDelete: "cascade" }).notNull(),
  
  hostName: text("host_name").notNull(),
  recordType: text("record_type").notNull(),
  address: text("address").notNull(),
  
  mxPref: integer("mx_pref"),
  ttl: integer("ttl").notNull().default(1800),
  
  isActive: boolean("is_active").notNull().default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_nc_dns_domain").on(table.domainId),
  index("IDX_nc_dns_type").on(table.recordType),
]);

export const insertNamecheapDnsRecordSchema = createInsertSchema(namecheapDnsRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertNamecheapDnsRecord = z.infer<typeof insertNamecheapDnsRecordSchema>;
export type NamecheapDnsRecord = typeof namecheapDnsRecords.$inferSelect;

// Platforms table - stores all platforms in the system
export const platforms = pgTable("platforms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  descriptionAr: text("description_ar"),
  
  // Platform type: app, website, api, service
  platformType: text("platform_type").notNull().default("app"),
  
  // Owner/Creator
  ownerId: varchar("owner_id").references(() => users.id, { onDelete: "set null" }),
  
  // Status: active, inactive, maintenance, archived
  status: text("status").notNull().default("active"),
  
  // URL/Domain info
  primaryUrl: text("primary_url"),
  
  // Settings
  isPublic: boolean("is_public").notNull().default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_platforms_owner").on(table.ownerId),
  index("IDX_platforms_status").on(table.status),
  index("IDX_platforms_slug").on(table.slug),
]);

export const insertPlatformSchema = createInsertSchema(platforms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPlatform = z.infer<typeof insertPlatformSchema>;
export type Platform = typeof platforms.$inferSelect;

// Domain-Platform linkage table
export const domainPlatformLinks = pgTable("domain_platform_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  domainId: varchar("domain_id").references(() => namecheapDomains.id, { onDelete: "cascade" }).notNull(),
  platformId: varchar("platform_id").notNull(),
  
  subdomain: text("subdomain"),
  
  targetType: text("target_type").notNull().default("server"),
  targetAddress: text("target_address").notNull(),
  targetPort: integer("target_port"),
  
  sslEnabled: boolean("ssl_enabled").notNull().default(true),
  sslCertificateId: varchar("ssl_certificate_id"),
  sslExpiresAt: timestamp("ssl_expires_at"),
  
  isActive: boolean("is_active").notNull().default(true),
  verificationStatus: text("verification_status").notNull().default("pending"),
  verifiedAt: timestamp("verified_at"),
  
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_dpl_domain").on(table.domainId),
  index("IDX_dpl_platform").on(table.platformId),
]);

export const insertDomainPlatformLinkSchema = createInsertSchema(domainPlatformLinks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDomainPlatformLink = z.infer<typeof insertDomainPlatformLinkSchema>;
export type DomainPlatformLink = typeof domainPlatformLinks.$inferSelect;

// Namecheap Domain contacts table
export const namecheapContacts = pgTable("namecheap_contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  ownerId: varchar("owner_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  contactType: text("contact_type").notNull().default("registrant"),
  isDefault: boolean("is_default").notNull().default(false),
  
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  organization: text("organization"),
  jobTitle: text("job_title"),
  
  address1: text("address1").notNull(),
  address2: text("address2"),
  city: text("city").notNull(),
  stateProvince: text("state_province").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull(),
  
  phone: text("phone").notNull(),
  fax: text("fax"),
  email: text("email").notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_nc_contact_owner").on(table.ownerId),
]);

export const insertNamecheapContactSchema = createInsertSchema(namecheapContacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertNamecheapContact = z.infer<typeof insertNamecheapContactSchema>;
export type NamecheapContact = typeof namecheapContacts.$inferSelect;

// Namecheap operation logs
export const namecheapOperationLogs = pgTable("namecheap_operation_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  domainId: varchar("domain_id").references(() => namecheapDomains.id, { onDelete: "set null" }),
  domainName: text("domain_name").notNull(),
  
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  userEmail: text("user_email"),
  
  operation: text("operation").notNull(),
  operationDetails: jsonb("operation_details").$type<Record<string, unknown>>(),
  
  success: boolean("success").notNull().default(true),
  errorMessage: text("error_message"),
  
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_nc_log_domain").on(table.domainId),
  index("IDX_nc_log_user").on(table.userId),
  index("IDX_nc_log_operation").on(table.operation),
  index("IDX_nc_log_created").on(table.createdAt),
]);

export const insertNamecheapOperationLogSchema = createInsertSchema(namecheapOperationLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertNamecheapOperationLog = z.infer<typeof insertNamecheapOperationLogSchema>;
export type NamecheapOperationLog = typeof namecheapOperationLogs.$inferSelect;

// ==================== MARKETPLACE ====================

// Marketplace items - templates and extensions
export const marketplaceItems = pgTable("marketplace_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  description: text("description").notNull(),
  descriptionAr: text("description_ar"),
  
  author: text("author").notNull(),
  authorId: varchar("author_id").references(() => users.id, { onDelete: "set null" }),
  
  type: text("type").notNull().default("template"), // template, extension
  category: text("category").notNull(), // ecommerce, admin, auth, payment, blog, ai, etc.
  
  isPremium: boolean("is_premium").notNull().default(false),
  price: integer("price").default(0), // in cents
  
  downloads: integer("downloads").notNull().default(0),
  rating: real("rating").default(0),
  ratingCount: integer("rating_count").default(0),
  
  icon: text("icon").default("package"),
  previewImage: text("preview_image"),
  sourceUrl: text("source_url"), // GitHub repo or source
  
  version: text("version").default("1.0.0"),
  features: jsonb("features").$type<string[]>().default([]),
  featuresAr: jsonb("features_ar").$type<string[]>().default([]),
  
  isActive: boolean("is_active").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_marketplace_type").on(table.type),
  index("IDX_marketplace_category").on(table.category),
  index("IDX_marketplace_featured").on(table.isFeatured),
]);

export const insertMarketplaceItemSchema = createInsertSchema(marketplaceItems).omit({
  id: true,
  downloads: true,
  rating: true,
  ratingCount: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMarketplaceItem = z.infer<typeof insertMarketplaceItemSchema>;
export type MarketplaceItem = typeof marketplaceItems.$inferSelect;

// Marketplace installations - tracks which items users have installed
export const marketplaceInstallations = pgTable("marketplace_installations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  itemId: varchar("item_id").references(() => marketplaceItems.id, { onDelete: "cascade" }).notNull(),
  
  platformId: varchar("platform_id").references(() => platforms.id, { onDelete: "set null" }),
  
  installedVersion: text("installed_version").default("1.0.0"),
  
  rating: integer("rating"), // User's rating 1-5
  review: text("review"),
  
  isActive: boolean("is_active").notNull().default(true),
  
  installedAt: timestamp("installed_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_installation_user").on(table.userId),
  index("IDX_installation_item").on(table.itemId),
]);

export const insertMarketplaceInstallationSchema = createInsertSchema(marketplaceInstallations).omit({
  id: true,
  installedAt: true,
  updatedAt: true,
});

export type InsertMarketplaceInstallation = z.infer<typeof insertMarketplaceInstallationSchema>;
export type MarketplaceInstallation = typeof marketplaceInstallations.$inferSelect;


// ==================== AI PROVIDER CONFIGURATIONS (Owner Only) ====================

// AI providers supported
export const aiProviders = ['anthropic', 'openai', 'google', 'meta', 'replit'] as const;
export type AIProvider = typeof aiProviders[number];

// AI provider status types
export const aiProviderStatuses = ['active', 'paused', 'disabled'] as const;
export type AiProviderStatus = typeof aiProviderStatuses[number];

// AI provider capability types
export const aiCapabilities = ['chat', 'coding', 'image', 'embedding', 'tooling'] as const;
export type AiCapability = typeof aiCapabilities[number];

// Secure AI provider configurations - only accessible by owner
export const aiProviderConfigs = pgTable("ai_provider_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  provider: text("provider").notNull(), // anthropic, openai, google, replit, etc.
  displayName: text("display_name").notNull(), // User-friendly name
  
  // Encrypted API key - never exposed to client
  encryptedApiKey: text("encrypted_api_key"),
  apiKeyPrefix: text("api_key_prefix"), // First 8 chars for display (sk-ant-***)
  
  // Configuration
  isActive: boolean("is_active").notNull().default(false),
  status: text("status").notNull().default("disabled"), // active, paused, disabled
  priority: integer("priority").notNull().default(100), // Lower = higher priority (1 = highest)
  capabilities: jsonb("capabilities").$type<string[]>().default(['chat', 'coding']), // chat, coding, image, embedding
  defaultModel: text("default_model"), // claude-sonnet-4-5, gpt-4o, etc.
  baseUrl: text("base_url"), // Custom base URL if needed
  
  // Health tracking
  lastFailureAt: timestamp("last_failure_at"),
  failureCount: integer("failure_count").notNull().default(0),
  consecutiveFailures: integer("consecutive_failures").notNull().default(0),
  isHealthy: boolean("is_healthy").notNull().default(true),
  
  // Metadata
  lastTestedAt: timestamp("last_tested_at"),
  lastTestResult: text("last_test_result"), // success, failed
  lastTestError: text("last_test_error"),
  
  // Balance tracking
  currentBalance: real("current_balance"), // Current credit balance in USD
  lowBalanceThreshold: real("low_balance_threshold").default(10), // Alert when balance below this
  lastBalanceCheckAt: timestamp("last_balance_check_at"),
  balanceCheckError: text("balance_check_error"),
  
  // Audit
  createdBy: varchar("created_by").references(() => users.id),
  updatedBy: varchar("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_ai_provider").on(table.provider),
]);

export const insertAiProviderConfigSchema = createInsertSchema(aiProviderConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAiProviderConfig = z.infer<typeof insertAiProviderConfigSchema>;
export type AiProviderConfig = typeof aiProviderConfigs.$inferSelect;

// ==================== AI USAGE TRACKING ====================

// Track AI usage per provider for cost estimation
export const aiUsageLogs = pgTable("ai_usage_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  provider: text("provider").notNull(), // anthropic, openai, google, meta, replit
  model: text("model").notNull(), // claude-sonnet-4-5, gpt-4o, etc.
  
  // Usage metrics
  requestCount: integer("request_count").notNull().default(1),
  inputTokens: integer("input_tokens").notNull().default(0),
  outputTokens: integer("output_tokens").notNull().default(0),
  totalTokens: integer("total_tokens").notNull().default(0),
  
  // Cost estimation (in USD)
  estimatedCost: real("estimated_cost").notNull().default(0),
  
  // Request details
  requestType: text("request_type").notNull().default("chat"), // chat, completion, embedding, image
  success: boolean("success").notNull().default(true),
  errorMessage: text("error_message"),
  latencyMs: integer("latency_ms"), // Response time in milliseconds
  
  // User context
  userId: varchar("user_id").references(() => users.id),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_ai_usage_provider").on(table.provider),
  index("IDX_ai_usage_created").on(table.createdAt),
  index("IDX_ai_usage_user").on(table.userId),
]);

export const insertAiUsageLogSchema = createInsertSchema(aiUsageLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertAiUsageLog = z.infer<typeof insertAiUsageLogSchema>;
export type AiUsageLog = typeof aiUsageLogs.$inferSelect;

// Aggregated usage statistics per provider per day
export const aiUsageStats = pgTable("ai_usage_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  provider: text("provider").notNull(),
  date: timestamp("date").notNull(), // Day for aggregation
  
  // Aggregated metrics
  totalRequests: integer("total_requests").notNull().default(0),
  successfulRequests: integer("successful_requests").notNull().default(0),
  failedRequests: integer("failed_requests").notNull().default(0),
  totalInputTokens: integer("total_input_tokens").notNull().default(0),
  totalOutputTokens: integer("total_output_tokens").notNull().default(0),
  totalTokens: integer("total_tokens").notNull().default(0),
  totalEstimatedCost: real("total_estimated_cost").notNull().default(0),
  avgLatencyMs: integer("avg_latency_ms"),
  
  // Timestamps
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_ai_stats_provider_date").on(table.provider, table.date),
]);

export const insertAiUsageStatsSchema = createInsertSchema(aiUsageStats).omit({
  id: true,
  updatedAt: true,
});

export type InsertAiUsageStats = z.infer<typeof insertAiUsageStatsSchema>;
export type AiUsageStats = typeof aiUsageStats.$inferSelect;

// ==================== DYNAMIC AI MODELS REGISTRY V2 (Owner Controlled) ====================
// Enhanced model registry with provider abstraction and service mapping
// Works alongside existing aiModels table for backward compatibility

// Extended model capabilities enum
export const aiModelCapabilitiesV2 = ['chat', 'code', 'reasoning', 'image', 'embedding', 'vision', 'function_calling', 'json_mode'] as const;
export type AIModelCapabilityV2 = typeof aiModelCapabilitiesV2[number];

// Provider types - extensible for future providers
export const aiModelProvidersV2 = ['replit', 'anthropic', 'openai', 'google', 'meta', 'mistral', 'cohere', 'custom'] as const;
export type AIModelProviderV2 = typeof aiModelProvidersV2[number];

// ==================== AI SERVICE CONFIGURATIONS (Dynamic Service Registry) ====================
// Maps internal services to AI models with fallback logic
// References the existing aiModels table for model assignments
// DYNAMIC EXECUTION LAYER: Every sidebar item, page, or chat is a "Service Unit"

// Service type enum for categorizing services
export const aiServiceTypes = ['chat', 'assistant', 'analysis', 'automation', 'system'] as const;
export type AIServiceType = typeof aiServiceTypes[number];

// AI execution modes - how AI routing is handled
export const aiExecutionModes = ['auto', 'manual', 'disabled'] as const;
export type AIExecutionMode = typeof aiExecutionModes[number];

export const aiServiceConfigs = pgTable("ai_service_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Service identification
  serviceName: text("service_name").notNull().unique(), // e.g., "chat", "code_generation", "translation"
  displayName: text("display_name").notNull(),
  displayNameAr: text("display_name_ar"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  
  // Dynamic Service Registry fields
  serviceType: text("service_type").notNull().default("chat"), // chat, assistant, analysis, automation, system
  aiMode: text("ai_mode").notNull().default("auto"), // auto, manual, disabled
  
  // Sidebar/Page linking
  sidebarPath: text("sidebar_path"), // e.g., "/chat", "/code-editor", "/analytics"
  icon: text("icon"), // lucide icon name for sidebar
  sortOrder: integer("sort_order").default(50),
  
  // Model assignment (references existing aiModels table by modelId)
  primaryModelId: text("primary_model_id"), // References aiModels.modelId (used in manual mode)
  fallbackModelId: text("fallback_model_id"), // References aiModels.modelId
  
  // Auto mode configuration
  preferredCapabilities: jsonb("preferred_capabilities").$type<string[]>().default([]), // Used in auto mode for smart selection
  requiredCapabilities: jsonb("required_capabilities").$type<string[]>().default([]),
  performanceMode: text("performance_mode").default("balanced"), // speed, balanced, quality
  costSensitivity: text("cost_sensitivity").default("medium"), // low, medium, high
  
  // Token limits for this service
  maxInputTokens: integer("max_input_tokens").default(50000),
  maxOutputTokens: integer("max_output_tokens").default(4096),
  
  // System prompt / behavior customization
  systemPrompt: text("system_prompt"),
  systemPromptAr: text("system_prompt_ar"),
  temperature: real("temperature").default(0.7),
  
  // Rate limiting
  rateLimit: integer("rate_limit").default(100), // Requests per minute
  rateLimitWindow: integer("rate_limit_window").default(60), // Window in seconds
  
  // Status
  isEnabled: boolean("is_enabled").notNull().default(true),
  isVisible: boolean("is_visible").notNull().default(true), // Show in sidebar
  
  // Audit
  updatedBy: varchar("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_ai_service_name").on(table.serviceName),
  index("IDX_ai_service_type").on(table.serviceType),
  index("IDX_ai_service_mode").on(table.aiMode),
  index("IDX_ai_service_sidebar").on(table.sidebarPath),
]);

export const insertAiServiceConfigSchema = createInsertSchema(aiServiceConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAiServiceConfig = z.infer<typeof insertAiServiceConfigSchema>;
export type AiServiceConfig = typeof aiServiceConfigs.$inferSelect;

// ==================== AI GLOBAL SETTINGS ====================
// Platform-wide AI settings managed by owner

export const aiGlobalSettings = pgTable("ai_global_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Emergency controls
  emergencyKillSwitch: boolean("emergency_kill_switch").notNull().default(false),
  killSwitchReason: text("kill_switch_reason"),
  killSwitchActivatedAt: timestamp("kill_switch_activated_at"),
  killSwitchActivatedBy: varchar("kill_switch_activated_by").references(() => users.id),
  
  // Default model (references aiModels.modelId)
  globalDefaultModelId: text("global_default_model_id"),
  
  // Token limits (global caps)
  globalMaxInputTokens: integer("global_max_input_tokens").default(100000),
  globalMaxOutputTokens: integer("global_max_output_tokens").default(8192),
  
  // Rate limiting (global)
  globalRateLimitPerMinute: integer("global_rate_limit_per_minute").default(60),
  globalRateLimitPerHour: integer("global_rate_limit_per_hour").default(1000),
  globalRateLimitPerDay: integer("global_rate_limit_per_day").default(10000),
  
  // Cost controls
  dailyCostLimitUsd: real("daily_cost_limit_usd").default(100),
  monthlyCostLimitUsd: real("monthly_cost_limit_usd").default(2000),
  costAlertThreshold: real("cost_alert_threshold").default(0.8), // Alert at 80% of limit
  
  // Fallback behavior
  enableAutoFallback: boolean("enable_auto_fallback").notNull().default(true),
  maxFallbackAttempts: integer("max_fallback_attempts").default(3),
  
  // Logging & Monitoring
  enableDetailedLogging: boolean("enable_detailed_logging").notNull().default(true),
  logRetentionDays: integer("log_retention_days").default(90),
  
  // Health check settings
  healthCheckIntervalMinutes: integer("health_check_interval_minutes").default(5),
  unhealthyAfterFailures: integer("unhealthy_after_failures").default(3),
  
  // Audit
  updatedBy: varchar("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAiGlobalSettingsSchema = createInsertSchema(aiGlobalSettings).omit({
  id: true,
  updatedAt: true,
});

export type InsertAiGlobalSettings = z.infer<typeof insertAiGlobalSettingsSchema>;
export type AiGlobalSettings = typeof aiGlobalSettings.$inferSelect;

// ==================== AI PROVIDER ADAPTERS ====================
// Provider adapter configurations for abstraction layer

export const aiProviderAdapters = pgTable("ai_provider_adapters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Provider identification
  providerKey: text("provider_key").notNull().unique(), // replit, anthropic, openai, etc.
  displayName: text("display_name").notNull(),
  displayNameAr: text("display_name_ar"),
  
  // Connection details (encrypted API keys stored separately in ai_provider_configs)
  baseUrl: text("base_url"), // API endpoint
  apiVersion: text("api_version"), // API version if applicable
  
  // Adapter settings
  isEnabled: boolean("is_enabled").notNull().default(true),
  priority: integer("priority").notNull().default(50), // Lower = higher priority (1-100)
  
  // Capabilities this provider supports
  supportedCapabilities: jsonb("supported_capabilities").$type<string[]>().default([]),
  
  // Rate limiting (provider-level)
  rateLimitPerMinute: integer("rate_limit_per_minute").default(100),
  
  // Health status
  isHealthy: boolean("is_healthy").notNull().default(true),
  lastHealthCheck: timestamp("last_health_check"),
  consecutiveFailures: integer("consecutive_failures").notNull().default(0),
  
  // Audit
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_ai_adapter_provider").on(table.providerKey),
  index("IDX_ai_adapter_enabled").on(table.isEnabled),
]);

export const insertAiProviderAdapterSchema = createInsertSchema(aiProviderAdapters).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastHealthCheck: true,
  consecutiveFailures: true,
});

export type InsertAiProviderAdapter = z.infer<typeof insertAiProviderAdapterSchema>;
export type AiProviderAdapter = typeof aiProviderAdapters.$inferSelect;

// ==================== INTELLIGENT SUPPORT SYSTEM ====================

// Support channel types
export const supportChannels = ['live_chat', 'ai_chat', 'ticket', 'system_alert', 'internal_note'] as const;
export type SupportChannel = typeof supportChannels[number];

// Support session status
export const supportSessionStatuses = ['open', 'pending', 'in_progress', 'escalated', 'resolved', 'closed'] as const;
export type SupportSessionStatus = typeof supportSessionStatuses[number];

// Support priority levels
export const supportPriorities = ['low', 'medium', 'high', 'urgent', 'critical'] as const;
export type SupportPriority = typeof supportPriorities[number];

// Support issue categories
export const supportCategories = [
  'billing', 'ai', 'api', 'security', 'ui', 'account', 'integration', 
  'performance', 'feature_request', 'bug_report', 'general', 'other'
] as const;
export type SupportCategory = typeof supportCategories[number];

// Support agent status
export const agentStatuses = ['available', 'busy', 'away', 'offline'] as const;
export type AgentStatus = typeof agentStatuses[number];

// ==================== SUPPORT SESSIONS ====================
// Unified model for all support interactions

export const supportSessions = pgTable("support_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Session identification
  ticketNumber: text("ticket_number").notNull().unique(), // Human-readable ticket number: SUP-20231219-0001
  
  // User context
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  organizationId: varchar("organization_id"),
  userEmail: text("user_email"),
  userName: text("user_name"),
  
  // Channel & type
  channel: text("channel").notNull().default("ai_chat"), // live_chat, ai_chat, ticket, system_alert
  category: text("category").notNull().default("general"),
  subcategory: text("subcategory"),
  
  // Subject & summary
  subject: text("subject").notNull(),
  subjectAr: text("subject_ar"),
  summary: text("summary"), // AI-generated summary
  summaryAr: text("summary_ar"),
  
  // Status & priority
  status: text("status").notNull().default("open"),
  priority: text("priority").notNull().default("medium"),
  
  // AI handling
  aiHandled: boolean("ai_handled").notNull().default(false),
  aiConfidence: real("ai_confidence").default(0), // 0-1 confidence score
  aiModelUsed: text("ai_model_used"), // Model ID used for this session
  aiResolutionAttempted: boolean("ai_resolution_attempted").notNull().default(false),
  aiEscalationReason: text("ai_escalation_reason"),
  
  // Agent assignment
  assignedAgentId: varchar("assigned_agent_id").references(() => users.id),
  assignedAt: timestamp("assigned_at"),
  lastAgentActivity: timestamp("last_agent_activity"),
  
  // SLA tracking
  slaId: varchar("sla_id"),
  slaFirstResponseDue: timestamp("sla_first_response_due"),
  slaResolutionDue: timestamp("sla_resolution_due"),
  slaFirstResponseMet: boolean("sla_first_response_met"),
  slaResolutionMet: boolean("sla_resolution_met"),
  
  // Platform context (captured at session start)
  platformContext: jsonb("platform_context").$type<{
    currentPage?: string;
    currentService?: string;
    errorLogs?: string[];
    browserInfo?: string;
    platformVersion?: string;
  }>().default({}),
  
  // AI Agent Intelligence (Command Center fields)
  aiIntent: text("ai_intent"), // Detected intent from AI
  aiSentiment: text("ai_sentiment"), // positive, neutral, negative, frustrated, urgent
  riskLevel: text("risk_level").default("low"), // low, medium, high, critical
  
  // User context for agent
  userContext: jsonb("user_context").$type<{
    subscriptionTier?: string;
    accountAge?: number;
    totalTickets?: number;
    lastLogin?: string;
    recentActions?: string[];
    lifetimeValue?: number;
  }>().default({}),
  
  // AI Copilot data
  aiCopilotSummary: text("ai_copilot_summary"), // 1-2 line issue summary
  aiCopilotSummaryAr: text("ai_copilot_summary_ar"),
  aiSuggestedResponses: jsonb("ai_suggested_responses").$type<Array<{
    id: string;
    content: string;
    contentAr?: string;
    confidence: number;
    type: 'quick_reply' | 'detailed' | 'escalation';
  }>>().default([]),
  aiRecommendedActions: jsonb("ai_recommended_actions").$type<Array<{
    id: string;
    action: string;
    actionAr?: string;
    type: 'restart' | 'rollback' | 'config_fix' | 'deep_analysis' | 'escalate';
    risk: 'safe' | 'moderate' | 'risky';
    requiresConfirmation: boolean;
  }>>().default([]),
  
  // Similar cases for knowledge engine
  similarCaseIds: jsonb("similar_case_ids").$type<string[]>().default([]),
  linkedArticleIds: jsonb("linked_article_ids").$type<string[]>().default([]),
  
  // State flow tracking
  stateHistory: jsonb("state_history").$type<Array<{
    state: string;
    timestamp: string;
    changedBy?: string;
    reason?: string;
  }>>().default([]),
  
  // Resolution
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: varchar("resolved_by").references(() => users.id),
  resolutionType: text("resolution_type"), // ai_resolved, agent_resolved, user_closed, auto_closed
  resolutionNotes: text("resolution_notes"),
  
  // Feedback
  satisfactionRating: integer("satisfaction_rating"), // 1-5
  satisfactionFeedback: text("satisfaction_feedback"),
  
  // Tags for categorization
  tags: jsonb("tags").$type<string[]>().default([]),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  closedAt: timestamp("closed_at"),
}, (table) => [
  index("IDX_support_session_user").on(table.userId),
  index("IDX_support_session_agent").on(table.assignedAgentId),
  index("IDX_support_session_status").on(table.status),
  index("IDX_support_session_priority").on(table.priority),
  index("IDX_support_session_channel").on(table.channel),
  index("IDX_support_session_created").on(table.createdAt),
]);

export const insertSupportSessionSchema = createInsertSchema(supportSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSupportSession = z.infer<typeof insertSupportSessionSchema>;
export type SupportSession = typeof supportSessions.$inferSelect;

// ==================== SUPPORT MESSAGES ====================
// All messages within a support session

export const supportMessages = pgTable("support_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Session reference
  sessionId: varchar("session_id").notNull().references(() => supportSessions.id, { onDelete: "cascade" }),
  
  // Sender identification
  senderType: text("sender_type").notNull(), // user, agent, ai, system
  senderId: varchar("sender_id"), // User ID if applicable
  senderName: text("sender_name"),
  
  // Message content
  content: text("content").notNull(),
  contentAr: text("content_ar"),
  contentType: text("content_type").notNull().default("text"), // text, image, file, code, system
  
  // AI context
  isAiGenerated: boolean("is_ai_generated").notNull().default(false),
  aiConfidence: real("ai_confidence"), // Confidence score for AI responses
  aiSuggested: boolean("ai_suggested").notNull().default(false), // Suggested by AI for agent
  aiModelUsed: text("ai_model_used"), // Model that generated this
  
  // Agent interaction
  isInternal: boolean("is_internal").notNull().default(false), // Internal note (not visible to user)
  usedAsSuggestion: boolean("used_as_suggestion").notNull().default(false), // Agent used AI suggestion
  
  // Attachments
  attachments: jsonb("attachments").$type<Array<{
    type: string;
    url: string;
    name: string;
    size?: number;
  }>>().default([]),
  
  // Delivery status
  deliveredAt: timestamp("delivered_at"),
  readAt: timestamp("read_at"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_support_message_session").on(table.sessionId),
  index("IDX_support_message_sender").on(table.senderId),
  index("IDX_support_message_created").on(table.createdAt),
]);

export const insertSupportMessageSchema = createInsertSchema(supportMessages).omit({
  id: true,
  createdAt: true,
});

export type InsertSupportMessage = z.infer<typeof insertSupportMessageSchema>;
export type SupportMessage = typeof supportMessages.$inferSelect;

// ==================== SUPPORT KNOWLEDGE BASE ====================
// Self-improving knowledge base for AI and agents

export const supportKnowledgeBase = pgTable("support_knowledge_base", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Article identification
  slug: text("slug").notNull().unique(), // URL-friendly identifier
  
  // Content
  title: text("title").notNull(),
  titleAr: text("title_ar"),
  content: text("content").notNull(), // Markdown content
  contentAr: text("content_ar"),
  
  // Categorization
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  tags: jsonb("tags").$type<string[]>().default([]),
  
  // AI integration
  embedding: jsonb("embedding").$type<number[]>(), // Vector embedding for semantic search
  aiRelevanceScore: real("ai_relevance_score").default(0), // How often AI uses this
  
  // Versioning
  version: integer("version").notNull().default(1),
  previousVersionId: varchar("previous_version_id"),
  
  // Publishing
  isPublished: boolean("is_published").notNull().default(false),
  isInternal: boolean("is_internal").notNull().default(false), // Only for agents/AI
  
  // Usage tracking
  viewCount: integer("view_count").notNull().default(0),
  helpfulCount: integer("helpful_count").notNull().default(0),
  notHelpfulCount: integer("not_helpful_count").notNull().default(0),
  
  // AI learning
  derivedFromSessionId: varchar("derived_from_session_id"), // If auto-generated from resolved ticket
  lastAiReview: timestamp("last_ai_review"),
  aiSuggestedUpdates: text("ai_suggested_updates"),
  
  // Audit
  createdBy: varchar("created_by").references(() => users.id),
  updatedBy: varchar("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_kb_category").on(table.category),
  index("IDX_kb_published").on(table.isPublished),
  index("IDX_kb_slug").on(table.slug),
]);

export const insertSupportKnowledgeBaseSchema = createInsertSchema(supportKnowledgeBase).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
  helpfulCount: true,
  notHelpfulCount: true,
});

export type InsertSupportKnowledgeBase = z.infer<typeof insertSupportKnowledgeBaseSchema>;
export type SupportKnowledgeBase = typeof supportKnowledgeBase.$inferSelect;

// ==================== SUPPORT AGENTS ====================
// Agent configurations and status

export const supportAgents = pgTable("support_agents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // User reference
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  
  // Agent profile
  displayName: text("display_name").notNull(),
  displayNameAr: text("display_name_ar"),
  avatar: text("avatar"),
  
  // Status
  status: text("status").notNull().default("offline"), // available, busy, away, offline
  statusMessage: text("status_message"),
  lastActiveAt: timestamp("last_active_at"),
  
  // Skills & specializations
  skills: jsonb("skills").$type<string[]>().default([]), // billing, technical, security, etc.
  languages: jsonb("languages").$type<string[]>().default(["en", "ar"]),
  maxConcurrentChats: integer("max_concurrent_chats").notNull().default(5),
  currentChatCount: integer("current_chat_count").notNull().default(0),
  
  // Performance metrics
  totalSessionsHandled: integer("total_sessions_handled").notNull().default(0),
  averageRating: real("average_rating").default(0),
  totalRatings: integer("total_ratings").notNull().default(0),
  averageResponseTime: integer("average_response_time").default(0), // seconds
  averageResolutionTime: integer("average_resolution_time").default(0), // minutes
  
  // AI Copilot settings
  aiCopilotEnabled: boolean("ai_copilot_enabled").notNull().default(true),
  aiSuggestionsEnabled: boolean("ai_suggestions_enabled").notNull().default(true),
  aiAutoTranslate: boolean("ai_auto_translate").notNull().default(false),
  
  // Supervisor assignment
  supervisorId: varchar("supervisor_id").references(() => users.id),
  
  // Audit
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_agent_user").on(table.userId),
  index("IDX_agent_status").on(table.status),
]);

export const insertSupportAgentSchema = createInsertSchema(supportAgents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  totalSessionsHandled: true,
  totalRatings: true,
  currentChatCount: true,
});

export type InsertSupportAgent = z.infer<typeof insertSupportAgentSchema>;
export type SupportAgent = typeof supportAgents.$inferSelect;

// ==================== SUPPORT SLA POLICIES ====================
// SLA policies for different customer tiers

export const supportSlaPolicies = pgTable("support_sla_policies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Policy identification
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  description: text("description"),
  
  // Target plan/tier
  targetRole: text("target_role").notNull(), // free, basic, pro, enterprise, sovereign
  targetPriority: text("target_priority"), // If specific to priority level
  
  // Response times (in minutes)
  firstResponseTime: integer("first_response_time").notNull(), // Minutes
  resolutionTime: integer("resolution_time").notNull(), // Minutes
  
  // Business hours consideration
  businessHoursOnly: boolean("business_hours_only").notNull().default(true),
  businessHoursStart: text("business_hours_start").default("09:00"), // HH:MM
  businessHoursEnd: text("business_hours_end").default("18:00"),
  businessDays: jsonb("business_days").$type<number[]>().default([1, 2, 3, 4, 5]), // 0=Sunday, 6=Saturday
  timezone: text("timezone").default("UTC"),
  
  // Escalation rules
  autoEscalateAfter: integer("auto_escalate_after"), // Minutes before auto-escalation
  escalationLevel: text("escalation_level"), // supervisor, owner
  
  // Status
  isActive: boolean("is_active").notNull().default(true),
  priority: integer("priority").notNull().default(50), // Lower = higher priority
  
  // Audit
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSupportSlaPolicySchema = createInsertSchema(supportSlaPolicies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSupportSlaPolicy = z.infer<typeof insertSupportSlaPolicySchema>;
export type SupportSlaPolicy = typeof supportSlaPolicies.$inferSelect;

// ==================== SUPPORT ROUTING RULES ====================
// Intelligent routing rules for ticket assignment

export const supportRoutingRules = pgTable("support_routing_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Rule identification
  name: text("name").notNull(),
  description: text("description"),
  
  // Matching conditions
  matchCategory: text("match_category"),
  matchPriority: text("match_priority"),
  matchChannel: text("match_channel"),
  matchUserRole: text("match_user_role"),
  matchKeywords: jsonb("match_keywords").$type<string[]>().default([]),
  
  // Routing action
  routeToAgentId: varchar("route_to_agent_id").references(() => supportAgents.id),
  routeToSkill: text("route_to_skill"), // Route to agent with this skill
  routeToQueue: text("route_to_queue"), // Route to specific queue
  
  // AI behavior
  aiFirst: boolean("ai_first").notNull().default(true), // Try AI first
  aiConfidenceThreshold: real("ai_confidence_threshold").default(0.7), // Below this, escalate
  
  // Priority adjustment
  priorityOverride: text("priority_override"), // Override priority
  
  // Status
  isActive: boolean("is_active").notNull().default(true),
  priority: integer("priority").notNull().default(50), // Rule priority (lower = checked first)
  
  // Audit
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSupportRoutingRuleSchema = createInsertSchema(supportRoutingRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSupportRoutingRule = z.infer<typeof insertSupportRoutingRuleSchema>;
export type SupportRoutingRule = typeof supportRoutingRules.$inferSelect;

// ==================== SUPPORT ANALYTICS ====================
// Aggregated analytics for support performance

export const supportAnalytics = pgTable("support_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Time period
  periodType: text("period_type").notNull(), // hourly, daily, weekly, monthly
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  
  // Volume metrics
  totalSessions: integer("total_sessions").notNull().default(0),
  newSessions: integer("new_sessions").notNull().default(0),
  resolvedSessions: integer("resolved_sessions").notNull().default(0),
  escalatedSessions: integer("escalated_sessions").notNull().default(0),
  
  // Channel breakdown
  sessionsByChannel: jsonb("sessions_by_channel").$type<Record<string, number>>().default({}),
  sessionsByCategory: jsonb("sessions_by_category").$type<Record<string, number>>().default({}),
  sessionsByPriority: jsonb("sessions_by_priority").$type<Record<string, number>>().default({}),
  
  // AI metrics
  aiHandledCount: integer("ai_handled_count").notNull().default(0),
  aiResolvedCount: integer("ai_resolved_count").notNull().default(0),
  aiEscalatedCount: integer("ai_escalated_count").notNull().default(0),
  averageAiConfidence: real("average_ai_confidence").default(0),
  
  // Response time metrics (in seconds)
  averageFirstResponseTime: integer("average_first_response_time").default(0),
  averageResolutionTime: integer("average_resolution_time").default(0),
  
  // SLA metrics
  slaFirstResponseMet: integer("sla_first_response_met").notNull().default(0),
  slaFirstResponseBreached: integer("sla_first_response_breached").notNull().default(0),
  slaResolutionMet: integer("sla_resolution_met").notNull().default(0),
  slaResolutionBreached: integer("sla_resolution_breached").notNull().default(0),
  
  // Satisfaction metrics
  totalRatings: integer("total_ratings").notNull().default(0),
  averageSatisfaction: real("average_satisfaction").default(0),
  satisfactionBreakdown: jsonb("satisfaction_breakdown").$type<Record<string, number>>().default({}),
  
  // Agent performance
  agentMetrics: jsonb("agent_metrics").$type<Array<{
    agentId: string;
    sessionsHandled: number;
    averageRating: number;
    averageResponseTime: number;
  }>>().default([]),
  
  // Timestamps
  calculatedAt: timestamp("calculated_at").defaultNow(),
}, (table) => [
  index("IDX_support_analytics_period").on(table.periodType, table.periodStart),
]);

export const insertSupportAnalyticsSchema = createInsertSchema(supportAnalytics).omit({
  id: true,
  calculatedAt: true,
});

export type InsertSupportAnalytics = z.infer<typeof insertSupportAnalyticsSchema>;
export type SupportAnalytics = typeof supportAnalytics.$inferSelect;

// ==================== AI SUPPORT DIAGNOSTICS ====================
// System diagnostics captured by AI during support

export const supportDiagnostics = pgTable("support_diagnostics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Session reference
  sessionId: varchar("session_id").notNull().references(() => supportSessions.id, { onDelete: "cascade" }),
  
  // Diagnostic type
  diagnosticType: text("diagnostic_type").notNull(), // error_log, performance, config, api, database
  
  // Captured data
  capturedData: jsonb("captured_data").$type<{
    logs?: string[];
    errors?: Array<{ message: string; stack?: string; timestamp: string }>;
    metrics?: Record<string, number>;
    config?: Record<string, unknown>;
    apiCalls?: Array<{ endpoint: string; status: number; latency: number }>;
  }>().default({}),
  
  // AI analysis
  aiAnalysis: text("ai_analysis"),
  aiAnalysisAr: text("ai_analysis_ar"),
  aiSuggestedFixes: jsonb("ai_suggested_fixes").$type<string[]>().default([]),
  aiConfidence: real("ai_confidence").default(0),
  
  // Status
  isResolved: boolean("is_resolved").notNull().default(false),
  resolvedBy: varchar("resolved_by").references(() => users.id),
  resolutionNotes: text("resolution_notes"),
  
  // Timestamps
  capturedAt: timestamp("captured_at").defaultNow(),
  analyzedAt: timestamp("analyzed_at"),
}, (table) => [
  index("IDX_diagnostics_session").on(table.sessionId),
  index("IDX_diagnostics_type").on(table.diagnosticType),
]);

export const insertSupportDiagnosticsSchema = createInsertSchema(supportDiagnostics).omit({
  id: true,
  capturedAt: true,
});

export type InsertSupportDiagnostics = z.infer<typeof insertSupportDiagnosticsSchema>;
export type SupportDiagnostics = typeof supportDiagnostics.$inferSelect;

// ==================== DELETION ATTEMPTS (Security Audit) ====================
// Tracks all deletion attempts for security and audit purposes

export const deletionAttempts = pgTable("deletion_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // User who attempted deletion
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Entity being deleted
  entityType: text("entity_type").notNull(), // project, platform, user, etc.
  entityId: varchar("entity_id").notNull(),
  entityName: text("entity_name"),
  entityDetails: jsonb("entity_details").$type<{
    name?: string;
    description?: string;
    createdAt?: string;
    type?: string;
    status?: string;
  }>().default({}),
  
  // Attempt details
  attemptedAt: timestamp("attempted_at").defaultNow(),
  outcome: text("outcome").notNull(), // success, failed_password, failed_auth, cancelled
  failureReason: text("failure_reason"),
  
  // Security context
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  browser: text("browser"),
  operatingSystem: text("operating_system"),
  device: text("device"),
  location: jsonb("location").$type<{
    country?: string;
    city?: string;
    region?: string;
    timezone?: string;
  }>().default({}),
  
  // Email notification
  emailSent: boolean("email_sent").notNull().default(false),
  emailSentAt: timestamp("email_sent_at"),
}, (table) => [
  index("IDX_deletion_user").on(table.userId),
  index("IDX_deletion_entity").on(table.entityType, table.entityId),
  index("IDX_deletion_time").on(table.attemptedAt),
]);

export const insertDeletionAttemptSchema = createInsertSchema(deletionAttempts).omit({
  id: true,
  attemptedAt: true,
});

export type InsertDeletionAttempt = z.infer<typeof insertDeletionAttemptSchema>;
export type DeletionAttempt = typeof deletionAttempts.$inferSelect;

// ==================== DELETED ITEMS MODULE (وحدة المحذوفات) ====================
// Complete deletion lifecycle management with full audit trail

export const deletionTypes = ['manual', 'automatic', 'ai', 'policy', 'system'] as const;
export type DeletionType = typeof deletionTypes[number];

export const deletedItemStatuses = ['recoverable', 'expired', 'locked', 'permanently_deleted'] as const;
export type DeletedItemStatus = typeof deletedItemStatuses[number];

export const deletedItems = pgTable("deleted_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Original Entity Data
  entityType: text("entity_type").notNull(), // platform, project, user, file, etc.
  entityId: varchar("entity_id").notNull(),
  entityName: text("entity_name").notNull(),
  entityData: jsonb("entity_data").$type<Record<string, unknown>>().default({}), // Complete backup
  
  // User who deleted
  deletedBy: varchar("deleted_by").notNull().references(() => users.id),
  deletedByRole: text("deleted_by_role").notNull(), // Owner, Admin, Moderator, User
  deletedByEmail: text("deleted_by_email"),
  deletedByFullName: text("deleted_by_full_name"),
  deletedByAccountStatus: text("deleted_by_account_status"),
  
  // Deletion Details
  deletedAt: timestamp("deleted_at").defaultNow(),
  deletedAtLocal: text("deleted_at_local"), // Local timezone string
  deletionType: text("deletion_type").notNull().default("manual"), // manual, automatic, ai, policy, system
  deletionReason: text("deletion_reason"),
  retentionDays: integer("retention_days").notNull().default(30), // Days before permanent deletion
  expiresAt: timestamp("expires_at"), // Auto-calculated expiry
  
  // Device Information
  deviceType: text("device_type"), // Desktop, Mobile, Tablet
  operatingSystem: text("operating_system"),
  browser: text("browser"),
  appVersion: text("app_version"),
  ipAddress: text("ip_address"),
  country: text("country"),
  region: text("region"),
  sessionId: varchar("session_id"),
  
  // Platform/Entity Metadata
  platformType: text("platform_type"), // SaaS, Government, Healthcare, Custom
  platformDomain: text("platform_domain"),
  dataSize: text("data_size"), // Size in bytes/KB/MB
  userCount: integer("user_count"), // Number of users (for platforms)
  deploymentStatus: text("deployment_status"), // Status before deletion
  
  // Recovery Status
  status: text("status").notNull().default("recoverable"), // recoverable, expired, locked, permanently_deleted
  recoveredAt: timestamp("recovered_at"),
  recoveredBy: varchar("recovered_by").references(() => users.id),
  recoveryType: text("recovery_type"), // same_user, different_user, partial, recycle_only
  
  // Audit
  auditTrail: jsonb("audit_trail").$type<Array<{
    action: string;
    timestamp: string;
    userId: string;
    details?: string;
  }>>().default([]),
}, (table) => [
  index("IDX_deleted_entity").on(table.entityType, table.entityId),
  index("IDX_deleted_by").on(table.deletedBy),
  index("IDX_deleted_at").on(table.deletedAt),
  index("IDX_deleted_status").on(table.status),
  index("IDX_deleted_expires").on(table.expiresAt),
]);

export const insertDeletedItemSchema = createInsertSchema(deletedItems).omit({
  id: true,
  deletedAt: true,
});

export type InsertDeletedItem = z.infer<typeof insertDeletedItemSchema>;
export type DeletedItem = typeof deletedItems.$inferSelect;

// ==================== RECYCLE BIN (سلة إعادة التدوير) ====================

export const recycleBin = pgTable("recycle_bin", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Reference to deleted item
  deletedItemId: varchar("deleted_item_id").notNull().references(() => deletedItems.id, { onDelete: "cascade" }),
  
  // Owner of the item
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  
  // Quick access fields (denormalized for performance)
  entityType: text("entity_type").notNull(),
  entityName: text("entity_name").notNull(),
  
  // Recycle bin specific
  movedToRecycleAt: timestamp("moved_to_recycle_at").defaultNow(),
  scheduledPurgeAt: timestamp("scheduled_purge_at"),
  
  // Priority and flags
  priority: text("priority").notNull().default("normal"), // critical, high, normal, low
  isProtected: boolean("is_protected").notNull().default(false), // Cannot be auto-purged
  protectionReason: text("protection_reason"),
  
  // Quick stats
  estimatedRecoveryTime: integer("estimated_recovery_time"), // seconds
  dependenciesCount: integer("dependencies_count").default(0),
  
  // Metadata
  tags: jsonb("tags").$type<string[]>().default([]),
}, (table) => [
  index("IDX_recycle_owner").on(table.ownerId),
  index("IDX_recycle_deleted_item").on(table.deletedItemId),
  index("IDX_recycle_purge").on(table.scheduledPurgeAt),
]);

export const insertRecycleBinSchema = createInsertSchema(recycleBin).omit({
  id: true,
  movedToRecycleAt: true,
});

export type InsertRecycleBin = z.infer<typeof insertRecycleBinSchema>;
export type RecycleBinItem = typeof recycleBin.$inferSelect;

// ==================== DELETION AUDIT LOGS (سجلات تدقيق الحذف) ====================

export const deletionAuditLogs = pgTable("deletion_audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Action details
  action: text("action").notNull(), // delete, restore, purge, protect, unprotect, transfer
  actionBy: varchar("action_by").notNull().references(() => users.id),
  actionByRole: text("action_by_role").notNull(),
  
  // Target
  targetType: text("target_type").notNull(), // deleted_item, recycle_bin
  targetId: varchar("target_id").notNull(),
  targetName: text("target_name"),
  
  // Before/After state
  previousState: jsonb("previous_state").$type<Record<string, unknown>>().default({}),
  newState: jsonb("new_state").$type<Record<string, unknown>>().default({}),
  
  // Context
  reason: text("reason"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  sessionId: varchar("session_id"),
  
  // Compliance
  isGdprRelated: boolean("is_gdpr_related").notNull().default(false),
  complianceNotes: text("compliance_notes"),
  
  // Immutable timestamp
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_audit_action").on(table.action),
  index("IDX_audit_by").on(table.actionBy),
  index("IDX_audit_target").on(table.targetType, table.targetId),
  index("IDX_audit_time").on(table.createdAt),
]);

export const insertDeletionAuditLogSchema = createInsertSchema(deletionAuditLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertDeletionAuditLog = z.infer<typeof insertDeletionAuditLogSchema>;
export type DeletionAuditLog = typeof deletionAuditLogs.$inferSelect;

// ==================== COLLABORATION CONTEXTS (سياقات التعاون) ====================
// Every collaboration must be bound to a specific context

export const contextTypes = ['file', 'module', 'task', 'decision', 'issue', 'feature', 'review'] as const;
export type ContextType = typeof contextTypes[number];

export const collaborationContexts = pgTable("collaboration_contexts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Context binding
  contextType: text("context_type").notNull(), // file, module, task, decision, issue
  contextPath: text("context_path"), // File path or module path
  contextTitle: text("context_title").notNull(),
  contextDescription: text("context_description"),
  
  // Project binding
  projectId: varchar("project_id"),
  
  // Owner
  createdBy: varchar("created_by").notNull().references(() => users.id),
  
  // Status
  status: text("status").notNull().default("active"), // active, resolved, archived
  priority: text("priority").notNull().default("normal"), // critical, high, normal, low
  
  // Metrics
  messageCount: integer("message_count").notNull().default(0),
  participantCount: integer("participant_count").notNull().default(0),
  actionsTaken: integer("actions_taken").notNull().default(0),
  
  // AI involvement
  aiInterventionsActive: integer("ai_interventions_active").notNull().default(0),
  
  // Real-time state
  lastActivityAt: timestamp("last_activity_at").defaultNow(),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
}, (table) => [
  index("IDX_context_type").on(table.contextType),
  index("IDX_context_project").on(table.projectId),
  index("IDX_context_status").on(table.status),
  index("IDX_context_activity").on(table.lastActivityAt),
]);

export const insertCollaborationContextSchema = createInsertSchema(collaborationContexts).omit({
  id: true,
  createdAt: true,
  lastActivityAt: true,
});

export type InsertCollaborationContext = z.infer<typeof insertCollaborationContextSchema>;
export type CollaborationContext = typeof collaborationContexts.$inferSelect;

// ==================== COLLABORATION MESSAGES (رسائل التعاون) ====================
// Every message must be context-bound and action-oriented

export const messageActionTypes = ['create_task', 'create_fix', 'apply_patch', 'open_pr', 'assign_ai', 'rollback', 'approve', 'reject', 'comment'] as const;
export type MessageActionType = typeof messageActionTypes[number];

export const collaborationMessages = pgTable("collaboration_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Context binding (mandatory)
  contextId: varchar("context_id").notNull().references(() => collaborationContexts.id, { onDelete: "cascade" }),
  
  // Sender (user or AI)
  senderId: varchar("sender_id").notNull(), // User ID or AI collaborator ID
  senderType: text("sender_type").notNull().default("user"), // user, ai
  senderName: text("sender_name").notNull(),
  senderAvatar: text("sender_avatar"),
  
  // Message content
  content: text("content").notNull(),
  contentType: text("content_type").notNull().default("text"), // text, code, diff, suggestion
  
  // Code reference (optional)
  codeReference: jsonb("code_reference").$type<{
    filePath?: string;
    startLine?: number;
    endLine?: number;
    language?: string;
    snippet?: string;
  }>(),
  
  // Action pipeline
  actionType: text("action_type"), // create_task, create_fix, apply_patch, etc.
  actionExecuted: boolean("action_executed").notNull().default(false),
  actionResult: jsonb("action_result").$type<{
    success: boolean;
    output?: string;
    error?: string;
    entityCreated?: string;
  }>(),
  
  // Reply chain
  replyToId: varchar("reply_to_id"),
  
  // Reactions/Approvals
  approvals: jsonb("approvals").$type<Array<{ userId: string; timestamp: string }>>().default([]),
  rejections: jsonb("rejections").$type<Array<{ userId: string; reason: string; timestamp: string }>>().default([]),
  
  // Metrics
  aiConfidenceScore: real("ai_confidence_score"), // For AI messages
  executionTimeMs: integer("execution_time_ms"), // Time to execute action
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  editedAt: timestamp("edited_at"),
}, (table) => [
  index("IDX_message_context").on(table.contextId),
  index("IDX_message_sender").on(table.senderId),
  index("IDX_message_action").on(table.actionType),
  index("IDX_message_time").on(table.createdAt),
]);

export const insertCollaborationMessageSchema = createInsertSchema(collaborationMessages).omit({
  id: true,
  createdAt: true,
});

export type InsertCollaborationMessage = z.infer<typeof insertCollaborationMessageSchema>;
export type CollaborationMessage = typeof collaborationMessages.$inferSelect;

// ==================== AI COLLABORATORS (المتعاونون AI) ====================
// AI as first-class collaborators with accountability

export const aiCollaboratorRoles = ['code_generator', 'reviewer', 'fixer', 'optimizer', 'mediator', 'resolver'] as const;
export type AICollaboratorRole = typeof aiCollaboratorRoles[number];

export const aiCollaborators = pgTable("ai_collaborators", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Identity
  name: text("name").notNull(), // e.g., "Code Generator", "Conflict Resolver"
  nameAr: text("name_ar").notNull(),
  role: text("role").notNull(), // code_generator, reviewer, fixer, optimizer, mediator, resolver
  avatar: text("avatar"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  
  // Capabilities
  capabilities: jsonb("capabilities").$type<string[]>().default([]),
  modelId: text("model_id").notNull().default("claude-sonnet-4-20250514"), // AI model used
  
  // Permissions
  canExecuteCode: boolean("can_execute_code").notNull().default(false),
  canModifyFiles: boolean("can_modify_files").notNull().default(false),
  canCreateTasks: boolean("can_create_tasks").notNull().default(true),
  canApproveChanges: boolean("can_approve_changes").notNull().default(false),
  maxAutonomyLevel: integer("max_autonomy_level").notNull().default(50), // 0-100
  
  // Performance metrics
  tasksCompleted: integer("tasks_completed").notNull().default(0),
  changesApplied: integer("changes_applied").notNull().default(0),
  bugsFixed: integer("bugs_fixed").notNull().default(0),
  decisionsExecuted: integer("decisions_executed").notNull().default(0),
  timeSavedMinutes: integer("time_saved_minutes").notNull().default(0),
  
  // Comparison with humans
  averageResponseTimeMs: integer("average_response_time_ms").notNull().default(0),
  successRate: real("success_rate").notNull().default(0), // 0-100%
  
  // Status
  isActive: boolean("is_active").notNull().default(true),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_ai_role").on(table.role),
  index("IDX_ai_active").on(table.isActive),
]);

export const insertAICollaboratorSchema = createInsertSchema(aiCollaborators).omit({
  id: true,
  createdAt: true,
  lastActiveAt: true,
});

export type InsertAICollaborator = z.infer<typeof insertAICollaboratorSchema>;
export type AICollaborator = typeof aiCollaborators.$inferSelect;

// ==================== COLLABORATION DECISIONS (سجل القرارات) ====================
// Decision ledger - every decision tracked with full audit

export const collaborationDecisions = pgTable("collaboration_decisions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Context
  contextId: varchar("context_id").notNull().references(() => collaborationContexts.id, { onDelete: "cascade" }),
  
  // Decision details
  title: text("title").notNull(),
  description: text("description"),
  decisionType: text("decision_type").notNull(), // code_change, architecture, feature, security, deployment
  
  // Proposal
  proposedBy: varchar("proposed_by").notNull(), // User or AI ID
  proposedByType: text("proposed_by_type").notNull().default("user"), // user, ai
  proposedAt: timestamp("proposed_at").defaultNow(),
  
  // Voting
  approvers: jsonb("approvers").$type<Array<{
    id: string;
    name: string;
    type: 'user' | 'ai';
    timestamp: string;
    comment?: string;
  }>>().default([]),
  rejectors: jsonb("rejectors").$type<Array<{
    id: string;
    name: string;
    type: 'user' | 'ai';
    timestamp: string;
    reason?: string;
  }>>().default([]),
  
  // Status
  status: text("status").notNull().default("pending"), // pending, approved, rejected, executed, reverted
  
  // Execution
  executedAt: timestamp("executed_at"),
  executedBy: varchar("executed_by"),
  executionResult: jsonb("execution_result").$type<{
    success: boolean;
    changesApplied?: string[];
    output?: string;
    error?: string;
  }>(),
  
  // Impact tracking
  impactScore: integer("impact_score"), // 1-10
  impactDescription: text("impact_description"),
  affectedFiles: jsonb("affected_files").$type<string[]>().default([]),
  
  // Audit
  auditTrail: jsonb("audit_trail").$type<Array<{
    action: string;
    timestamp: string;
    actorId: string;
    actorType: string;
    details?: string;
  }>>().default([]),
}, (table) => [
  index("IDX_decision_context").on(table.contextId),
  index("IDX_decision_status").on(table.status),
  index("IDX_decision_proposed").on(table.proposedAt),
]);

export const insertCollaborationDecisionSchema = createInsertSchema(collaborationDecisions).omit({
  id: true,
  proposedAt: true,
});

export type InsertCollaborationDecision = z.infer<typeof insertCollaborationDecisionSchema>;
export type CollaborationDecision = typeof collaborationDecisions.$inferSelect;

// ==================== ACTIVE CONTRIBUTORS (المساهمون النشطون) ====================
// Real-time tracking of who is working on what

export const activeContributors = pgTable("active_contributors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Contributor (user or AI)
  contributorId: varchar("contributor_id").notNull(),
  contributorType: text("contributor_type").notNull().default("user"), // user, ai
  contributorName: text("contributor_name").notNull(),
  contributorAvatar: text("contributor_avatar"),
  contributorRole: text("contributor_role"),
  
  // What they're working on
  contextId: varchar("context_id").references(() => collaborationContexts.id, { onDelete: "set null" }),
  currentTask: text("current_task"),
  currentFile: text("current_file"),
  
  // Status
  status: text("status").notNull().default("active"), // active, idle, waiting, blocked
  statusReason: text("status_reason"),
  
  // Performance metrics (real-time)
  changesApplied: integer("changes_applied").notNull().default(0),
  tasksCompleted: integer("tasks_completed").notNull().default(0),
  pendingActions: integer("pending_actions").notNull().default(0),
  failedActions: integer("failed_actions").notNull().default(0),
  averageResponseTimeMs: integer("average_response_time_ms").notNull().default(0),
  
  // Impact
  projectImpactScore: real("project_impact_score").notNull().default(0), // 0-100
  
  // Timing
  joinedAt: timestamp("joined_at").defaultNow(),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
  sessionDurationMinutes: integer("session_duration_minutes").notNull().default(0),
}, (table) => [
  index("IDX_contributor_id").on(table.contributorId),
  index("IDX_contributor_context").on(table.contextId),
  index("IDX_contributor_status").on(table.status),
  index("IDX_contributor_active").on(table.lastActiveAt),
]);

export const insertActiveContributorSchema = createInsertSchema(activeContributors).omit({
  id: true,
  joinedAt: true,
  lastActiveAt: true,
});

export type InsertActiveContributor = z.infer<typeof insertActiveContributorSchema>;
export type ActiveContributor = typeof activeContributors.$inferSelect;

// ==================== SOVEREIGN AUDIT SYSTEM (نظام الفحص السيادي) ====================

// Audit run status
export const auditRunStatuses = ['pending', 'running', 'completed', 'failed', 'cancelled'] as const;
export type AuditRunStatus = typeof auditRunStatuses[number];

// Audit target types
export const auditTargetTypes = ['page', 'service', 'button', 'icon', 'form', 'table', 'card', 'widget', 'toggle', 'modal', 'api', 'cell'] as const;
export type AuditTargetType = typeof auditTargetTypes[number];

// Audit finding classifications
export const auditClassifications = ['FULLY_OPERATIONAL', 'PARTIALLY_OPERATIONAL', 'NON_OPERATIONAL'] as const;
export type AuditClassification = typeof auditClassifications[number];

// Audit test types
export const auditTestTypes = ['ui_presence', 'functional_action', 'backend_binding', 'business_logic', 'data_integrity', 'error_handling'] as const;
export type AuditTestType = typeof auditTestTypes[number];

// Audit Runs - جولات الفحص
export const auditRuns = pgTable("audit_runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Run metadata
  runNumber: integer("run_number").notNull(),
  runType: text("run_type").notNull().default("full"), // full, page, service, quick
  scope: text("scope"), // specific page/service if not full
  
  // Status
  status: text("status").notNull().default("pending"),
  
  // Initiator (owner only)
  initiatedBy: varchar("initiated_by").references(() => users.id),
  
  // Timing
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  durationMs: integer("duration_ms"),
  
  // Results summary
  totalTargets: integer("total_targets").notNull().default(0),
  testedTargets: integer("tested_targets").notNull().default(0),
  passedTargets: integer("passed_targets").notNull().default(0),
  failedTargets: integer("failed_targets").notNull().default(0),
  partialTargets: integer("partial_targets").notNull().default(0),
  
  // Readiness score
  readinessScore: real("readiness_score").notNull().default(0), // 0-100%
  
  // Breakdown by type
  breakdown: jsonb("breakdown").$type<{
    pages: { total: number; passed: number; failed: number; partial: number };
    services: { total: number; passed: number; failed: number; partial: number };
    buttons: { total: number; passed: number; failed: number; partial: number };
    icons: { total: number; passed: number; failed: number; partial: number };
    apis: { total: number; passed: number; failed: number; partial: number };
    forms: { total: number; passed: number; failed: number; partial: number };
  }>(),
  
  // Error info
  errorMessage: text("error_message"),
  
  // Comparison data
  previousRunId: varchar("previous_run_id"),
  changeFromPrevious: real("change_from_previous"), // +/- percentage
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_audit_run_status").on(table.status),
  index("IDX_audit_run_initiated").on(table.initiatedBy),
  index("IDX_audit_run_created").on(table.createdAt),
]);

export const insertAuditRunSchema = createInsertSchema(auditRuns).omit({
  id: true,
  createdAt: true,
});

export type InsertAuditRun = z.infer<typeof insertAuditRunSchema>;
export type AuditRun = typeof auditRuns.$inferSelect;

// Audit Targets - الأهداف المفحوصة
export const auditTargets = pgTable("audit_targets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Target identification
  testId: text("test_id").notNull(), // Unique test ID like "page-dashboard" or "btn-submit-login"
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  
  // Target details
  type: text("type").notNull(), // page, service, button, icon, etc.
  path: text("path"), // Route path or file path
  selector: text("selector"), // CSS selector or data-testid
  parentId: varchar("parent_id"), // Parent target for hierarchy
  
  // API binding info (if applicable)
  apiEndpoint: text("api_endpoint"),
  apiMethod: text("api_method"), // GET, POST, PUT, DELETE
  
  // Discovery metadata
  discoveredAt: timestamp("discovered_at").defaultNow(),
  lastTestedAt: timestamp("last_tested_at"),
  
  // Current status (from last run)
  currentClassification: text("current_classification").default("NON_OPERATIONAL"),
  currentScore: real("current_score").default(0),
  
  // History
  testHistory: jsonb("test_history").$type<Array<{
    runId: string;
    classification: string;
    score: number;
    timestamp: string;
  }>>().default([]),
  
  isActive: boolean("is_active").notNull().default(true),
}, (table) => [
  index("IDX_audit_target_testid").on(table.testId),
  index("IDX_audit_target_type").on(table.type),
  index("IDX_audit_target_path").on(table.path),
]);

export const insertAuditTargetSchema = createInsertSchema(auditTargets).omit({
  id: true,
  discoveredAt: true,
});

export type InsertAuditTarget = z.infer<typeof insertAuditTargetSchema>;
export type AuditTarget = typeof auditTargets.$inferSelect;

// Audit Findings - نتائج الفحص التفصيلية
export const auditFindings = pgTable("audit_findings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Relationships
  runId: varchar("run_id").references(() => auditRuns.id, { onDelete: "cascade" }).notNull(),
  targetId: varchar("target_id").references(() => auditTargets.id, { onDelete: "cascade" }).notNull(),
  
  // Classification
  classification: text("classification").notNull(), // FULLY_OPERATIONAL, PARTIALLY_OPERATIONAL, NON_OPERATIONAL
  score: real("score").notNull().default(0), // 0-100
  
  // Test results by type
  testResults: jsonb("test_results").$type<{
    uiPresence: { passed: boolean; details: string };
    functionalAction: { passed: boolean; details: string };
    backendBinding: { passed: boolean; details: string; apiStatus?: number };
    businessLogic: { passed: boolean; details: string };
    dataIntegrity: { passed: boolean; details: string };
    errorHandling: { passed: boolean; details: string };
  }>(),
  
  // Failure details
  failureReason: text("failure_reason"),
  failureReasonAr: text("failure_reason_ar"),
  
  // Recommendations
  recommendation: text("recommendation"),
  recommendationAr: text("recommendation_ar"),
  recommendationType: text("recommendation_type"), // fix, bind, remove, improve
  
  // Priority
  priority: text("priority").notNull().default("medium"), // critical, high, medium, low
  
  // Fix status
  fixStatus: text("fix_status").default("pending"), // pending, in_progress, fixed, wont_fix
  fixedAt: timestamp("fixed_at"),
  fixedBy: varchar("fixed_by"),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_audit_finding_run").on(table.runId),
  index("IDX_audit_finding_target").on(table.targetId),
  index("IDX_audit_finding_classification").on(table.classification),
  index("IDX_audit_finding_priority").on(table.priority),
]);

export const insertAuditFindingSchema = createInsertSchema(auditFindings).omit({
  id: true,
  createdAt: true,
});

export type InsertAuditFinding = z.infer<typeof insertAuditFindingSchema>;
export type AuditFinding = typeof auditFindings.$inferSelect;

// Audit Report type for exports
export interface AuditReportSummary {
  runId: string;
  runNumber: number;
  timestamp: string;
  readinessScore: number;
  totalTargets: number;
  passed: number;
  failed: number;
  partial: number;
  breakdown: {
    pages: { total: number; passed: number; failed: number; partial: number };
    services: { total: number; passed: number; failed: number; partial: number };
    buttons: { total: number; passed: number; failed: number; partial: number };
    icons: { total: number; passed: number; failed: number; partial: number };
    apis: { total: number; passed: number; failed: number; partial: number };
    forms: { total: number; passed: number; failed: number; partial: number };
  };
  findings: Array<{
    testId: string;
    name: string;
    type: string;
    path: string;
    classification: string;
    score: number;
    failureReason?: string;
    recommendation?: string;
    priority: string;
  }>;
}

// ==================== FINANCIAL MANAGEMENT SYSTEM ====================

// Finance team statuses
export const financeTeamStatuses = ['active', 'inactive', 'suspended'] as const;
export type FinanceTeamStatus = typeof financeTeamStatuses[number];

// Finance Teams - Finance department teams
export const financeTeams = pgTable("finance_teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Team identity
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  code: varchar("code", { length: 20 }).unique().notNull(),
  description: text("description"),
  descriptionAr: text("description_ar"),
  
  // Team structure
  departmentId: varchar("department_id"),
  parentTeamId: varchar("parent_team_id"),
  managerId: varchar("manager_id").references(() => users.id),
  
  // Team configuration
  permissions: jsonb("permissions").$type<string[]>().default([]),
  budgetLimit: integer("budget_limit"), // Monthly budget limit in cents
  approvalThreshold: integer("approval_threshold"), // Amount above which requires higher approval
  
  // Status
  status: text("status").notNull().default("active"),
  
  // Metadata
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_finance_team_code").on(table.code),
  index("IDX_finance_team_manager").on(table.managerId),
  index("IDX_finance_team_status").on(table.status),
]);

export const insertFinanceTeamSchema = createInsertSchema(financeTeams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertFinanceTeam = z.infer<typeof insertFinanceTeamSchema>;
export type FinanceTeam = typeof financeTeams.$inferSelect;

// Ledger entry types
export const ledgerEntryTypes = ['income', 'expense', 'transfer', 'adjustment', 'refund'] as const;
export type LedgerEntryType = typeof ledgerEntryTypes[number];

// Ledger entry statuses
export const ledgerStatuses = ['pending', 'approved', 'rejected', 'posted', 'voided'] as const;
export type LedgerStatus = typeof ledgerStatuses[number];

// Finance Ledger - Financial ledger entries (income/expense tracking)
export const financeLedger = pgTable("finance_ledger", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Entry identification
  entryNumber: varchar("entry_number", { length: 50 }).unique().notNull(),
  referenceNumber: varchar("reference_number", { length: 100 }),
  
  // Entry classification
  entryType: text("entry_type").notNull(), // income, expense, transfer, adjustment, refund
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  
  // Financial data
  amount: integer("amount").notNull(), // Amount in cents
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  exchangeRate: real("exchange_rate").default(1),
  amountInBaseCurrency: integer("amount_in_base_currency"),
  
  // Account references
  debitAccountId: varchar("debit_account_id"),
  creditAccountId: varchar("credit_account_id"),
  
  // Associated entities
  userId: varchar("user_id").references(() => users.id),
  teamId: varchar("team_id").references(() => financeTeams.id),
  projectId: varchar("project_id").references(() => projects.id),
  invoiceId: varchar("invoice_id"),
  
  // Description
  description: text("description").notNull(),
  descriptionAr: text("description_ar"),
  notes: text("notes"),
  
  // Approval workflow
  status: text("status").notNull().default("pending"),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  
  // Transaction date (can differ from created date)
  transactionDate: timestamp("transaction_date").notNull().defaultNow(),
  postingDate: timestamp("posting_date"),
  
  // Reconciliation
  isReconciled: boolean("is_reconciled").notNull().default(false),
  reconciledAt: timestamp("reconciled_at"),
  reconciledBy: varchar("reconciled_by").references(() => users.id),
  
  // Attachments and metadata
  attachments: jsonb("attachments").$type<Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>>().default([]),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  
  // Audit trail
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_ledger_entry_number").on(table.entryNumber),
  index("IDX_ledger_entry_type").on(table.entryType),
  index("IDX_ledger_status").on(table.status),
  index("IDX_ledger_user").on(table.userId),
  index("IDX_ledger_team").on(table.teamId),
  index("IDX_ledger_transaction_date").on(table.transactionDate),
  index("IDX_ledger_reconciled").on(table.isReconciled),
]);

export const insertFinanceLedgerSchema = createInsertSchema(financeLedger).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertFinanceLedger = z.infer<typeof insertFinanceLedgerSchema>;
export type FinanceLedger = typeof financeLedger.$inferSelect;

// Invoice statuses
export const invoiceStatuses = ['draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled', 'refunded'] as const;
export type InvoiceStatus = typeof invoiceStatuses[number];

// Invoice types
export const invoiceTypes = ['invoice', 'credit_note', 'debit_note', 'proforma', 'recurring'] as const;
export type InvoiceType = typeof invoiceTypes[number];

// Finance Invoices - Invoice management
export const financeInvoices = pgTable("finance_invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Invoice identification
  invoiceNumber: varchar("invoice_number", { length: 50 }).unique().notNull(),
  invoiceType: text("invoice_type").notNull().default("invoice"),
  
  // Client/Customer
  customerId: varchar("customer_id").references(() => users.id),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  customerAddress: text("customer_address"),
  customerTaxId: varchar("customer_tax_id", { length: 50 }),
  
  // Billing details
  billingAddress: jsonb("billing_address").$type<{
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  }>(),
  
  // Line items
  lineItems: jsonb("line_items").$type<Array<{
    id: string;
    description: string;
    descriptionAr?: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    discountType?: 'percentage' | 'fixed';
    taxRate?: number;
    total: number;
  }>>().notNull().default([]),
  
  // Amounts
  subtotal: integer("subtotal").notNull().default(0), // in cents
  discountTotal: integer("discount_total").default(0),
  taxTotal: integer("tax_total").default(0),
  total: integer("total").notNull().default(0),
  amountPaid: integer("amount_paid").default(0),
  amountDue: integer("amount_due").notNull().default(0),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  
  // Dates
  issueDate: timestamp("issue_date").notNull().defaultNow(),
  dueDate: timestamp("due_date").notNull(),
  paidDate: timestamp("paid_date"),
  
  // Status and workflow
  status: text("status").notNull().default("draft"),
  sentAt: timestamp("sent_at"),
  viewedAt: timestamp("viewed_at"),
  
  // Payment terms
  paymentTerms: text("payment_terms"), // Net 30, Net 60, etc.
  paymentInstructions: text("payment_instructions"),
  
  // Notes
  notes: text("notes"),
  notesAr: text("notes_ar"),
  internalNotes: text("internal_notes"),
  
  // Associated data
  projectId: varchar("project_id").references(() => projects.id),
  subscriptionId: varchar("subscription_id").references(() => userSubscriptions.id),
  
  // Recurring settings
  isRecurring: boolean("is_recurring").notNull().default(false),
  recurringInterval: text("recurring_interval"), // monthly, quarterly, yearly
  nextRecurringDate: timestamp("next_recurring_date"),
  
  // Attachments and metadata
  attachments: jsonb("attachments").$type<Array<{
    id: string;
    name: string;
    url: string;
    type: string;
  }>>().default([]),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  
  // Audit
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_invoice_number").on(table.invoiceNumber),
  index("IDX_invoice_customer").on(table.customerId),
  index("IDX_invoice_status").on(table.status),
  index("IDX_invoice_issue_date").on(table.issueDate),
  index("IDX_invoice_due_date").on(table.dueDate),
  index("IDX_invoice_recurring").on(table.isRecurring),
]);

export const insertFinanceInvoiceSchema = createInsertSchema(financeInvoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertFinanceInvoice = z.infer<typeof insertFinanceInvoiceSchema>;
export type FinanceInvoice = typeof financeInvoices.$inferSelect;

// Budget statuses
export const budgetStatuses = ['draft', 'active', 'frozen', 'closed', 'exceeded'] as const;
export type BudgetStatus = typeof budgetStatuses[number];

// Budget period types
export const budgetPeriods = ['monthly', 'quarterly', 'semi_annual', 'annual', 'custom'] as const;
export type BudgetPeriod = typeof budgetPeriods[number];

// Finance Budgets - Budget allocation and tracking
export const financeBudgets = pgTable("finance_budgets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Budget identification
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  code: varchar("code", { length: 30 }).unique().notNull(),
  description: text("description"),
  
  // Period
  periodType: text("period_type").notNull().default("monthly"),
  fiscalYear: integer("fiscal_year").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  
  // Allocation
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  
  // Amounts
  allocatedAmount: integer("allocated_amount").notNull(), // in cents
  spentAmount: integer("spent_amount").notNull().default(0),
  committedAmount: integer("committed_amount").notNull().default(0), // Reserved but not spent
  remainingAmount: integer("remaining_amount").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  
  // Thresholds
  warningThreshold: integer("warning_threshold").default(80), // Percentage
  criticalThreshold: integer("critical_threshold").default(95),
  
  // Ownership
  ownerId: varchar("owner_id").references(() => users.id),
  teamId: varchar("team_id").references(() => financeTeams.id),
  projectId: varchar("project_id").references(() => projects.id),
  
  // Status
  status: text("status").notNull().default("draft"),
  
  // Carryover settings
  allowCarryover: boolean("allow_carryover").notNull().default(false),
  carryoverAmount: integer("carryover_amount").default(0),
  carryoverFromId: varchar("carryover_from_id"),
  
  // Approval
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  
  // Notes
  notes: text("notes"),
  
  // Metadata
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_budget_code").on(table.code),
  index("IDX_budget_fiscal_year").on(table.fiscalYear),
  index("IDX_budget_category").on(table.category),
  index("IDX_budget_status").on(table.status),
  index("IDX_budget_team").on(table.teamId),
  index("IDX_budget_owner").on(table.ownerId),
  index("IDX_budget_period").on(table.startDate, table.endDate),
]);

export const insertFinanceBudgetSchema = createInsertSchema(financeBudgets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertFinanceBudget = z.infer<typeof insertFinanceBudgetSchema>;
export type FinanceBudget = typeof financeBudgets.$inferSelect;

// Reconciliation statuses
export const reconciliationStatuses = ['pending', 'in_progress', 'matched', 'unmatched', 'disputed', 'resolved'] as const;
export type ReconciliationStatus = typeof reconciliationStatuses[number];

// Reconciliation types
export const reconciliationTypes = ['bank', 'payment_gateway', 'inter_account', 'vendor', 'customer'] as const;
export type ReconciliationType = typeof reconciliationTypes[number];

// Finance Reconciliations - Payment reconciliation records
export const financeReconciliations = pgTable("finance_reconciliations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Reconciliation identification
  reconciliationNumber: varchar("reconciliation_number", { length: 50 }).unique().notNull(),
  reconciliationType: text("reconciliation_type").notNull(),
  
  // Period
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  
  // Source and target
  sourceType: text("source_type").notNull(), // bank_statement, payment_gateway, ledger
  sourceReference: varchar("source_reference", { length: 100 }),
  targetType: text("target_type").notNull(), // ledger, invoice, payment
  targetReference: varchar("target_reference", { length: 100 }),
  
  // Amounts
  expectedAmount: integer("expected_amount").notNull(),
  actualAmount: integer("actual_amount").notNull(),
  differenceAmount: integer("difference_amount").notNull().default(0),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  
  // Matching details
  matchedItems: jsonb("matched_items").$type<Array<{
    sourceId: string;
    targetId: string;
    amount: number;
    matchedAt: string;
    matchType: string; // exact, partial, manual
  }>>().default([]),
  
  unmatchedItems: jsonb("unmatched_items").$type<Array<{
    id: string;
    type: string;
    amount: number;
    date: string;
    description: string;
  }>>().default([]),
  
  // Status
  status: text("status").notNull().default("pending"),
  
  // Workflow
  assignedTo: varchar("assigned_to").references(() => users.id),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  
  // Resolution
  resolutionNotes: text("resolution_notes"),
  adjustmentLedgerId: varchar("adjustment_ledger_id").references(() => financeLedger.id),
  
  // Notes and attachments
  notes: text("notes"),
  attachments: jsonb("attachments").$type<Array<{
    id: string;
    name: string;
    url: string;
    type: string;
  }>>().default([]),
  
  // Metadata
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_reconciliation_number").on(table.reconciliationNumber),
  index("IDX_reconciliation_type").on(table.reconciliationType),
  index("IDX_reconciliation_status").on(table.status),
  index("IDX_reconciliation_period").on(table.periodStart, table.periodEnd),
  index("IDX_reconciliation_assigned").on(table.assignedTo),
]);

export const insertFinanceReconciliationSchema = createInsertSchema(financeReconciliations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertFinanceReconciliation = z.infer<typeof insertFinanceReconciliationSchema>;
export type FinanceReconciliation = typeof financeReconciliations.$inferSelect;

// ==================== ISDS - INFRA SOVEREIGN DEV STUDIO ====================

// Workspace visibility types
export const workspaceVisibilities = ['private', 'team', 'organization', 'public'] as const;
export type WorkspaceVisibility = typeof workspaceVisibilities[number];

// Workspace statuses
export const workspaceStatuses = ['active', 'archived', 'suspended', 'deleted'] as const;
export type WorkspaceStatus = typeof workspaceStatuses[number];

// Dev Workspaces - Development workspaces for owner
export const devWorkspaces = pgTable("dev_workspaces", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Workspace identity
  name: text("name").notNull(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  description: text("description"),
  descriptionAr: text("description_ar"),
  
  // Ownership
  ownerId: varchar("owner_id").references(() => users.id).notNull(),
  organizationId: varchar("organization_id"),
  
  // Configuration
  visibility: text("visibility").notNull().default("private"),
  status: text("status").notNull().default("active"),
  
  // Settings
  settings: jsonb("settings").$type<{
    defaultBranch: string;
    autoSave: boolean;
    autoFormat: boolean;
    theme: string;
    fontSize: number;
    tabSize: number;
    enableAI: boolean;
    aiModel: string;
  }>().default({
    defaultBranch: "main",
    autoSave: true,
    autoFormat: true,
    theme: "dark",
    fontSize: 14,
    tabSize: 2,
    enableAI: true,
    aiModel: "claude-3-5-sonnet",
  }),
  
  // Resource limits
  limits: jsonb("limits").$type<{
    maxProjects: number;
    maxStorageGB: number;
    maxBuildMinutes: number;
    maxDeployments: number;
  }>(),
  
  // Usage tracking
  usage: jsonb("usage").$type<{
    projectCount: number;
    storageUsedMB: number;
    buildMinutesUsed: number;
    deploymentCount: number;
  }>().default({
    projectCount: 0,
    storageUsedMB: 0,
    buildMinutesUsed: 0,
    deploymentCount: 0,
  }),
  
  // Metadata
  icon: text("icon"),
  color: varchar("color", { length: 7 }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  
  // Timestamps
  lastAccessedAt: timestamp("last_accessed_at"),
  archivedAt: timestamp("archived_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_workspace_slug").on(table.slug),
  index("IDX_workspace_owner").on(table.ownerId),
  index("IDX_workspace_status").on(table.status),
  index("IDX_workspace_visibility").on(table.visibility),
]);

export const insertDevWorkspaceSchema = createInsertSchema(devWorkspaces).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDevWorkspace = z.infer<typeof insertDevWorkspaceSchema>;
export type DevWorkspace = typeof devWorkspaces.$inferSelect;

// Project types
export const devProjectTypes = ['web', 'api', 'mobile', 'library', 'fullstack', 'microservice'] as const;
export type DevProjectType = typeof devProjectTypes[number];

// Project statuses
export const devProjectStatuses = ['initializing', 'active', 'building', 'deploying', 'error', 'archived'] as const;
export type DevProjectStatus = typeof devProjectStatuses[number];

// ISDS Projects - Projects within workspaces (different from legacy dev_projects)
export const isdsProjects = pgTable("isds_projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Project identity
  name: text("name").notNull(),
  slug: varchar("slug", { length: 100 }).notNull(),
  description: text("description"),
  
  // Relationships
  workspaceId: varchar("workspace_id").references(() => devWorkspaces.id, { onDelete: "cascade" }).notNull(),
  templateId: varchar("template_id").references(() => templates.id),
  
  // Project type and framework
  projectType: text("project_type").notNull().default("web"),
  framework: text("framework"), // react, vue, nextjs, express, etc.
  language: text("language").notNull().default("typescript"),
  
  // Status
  status: text("status").notNull().default("initializing"),
  
  // Git configuration
  gitConfig: jsonb("git_config").$type<{
    repository?: string;
    branch: string;
    remoteUrl?: string;
    lastCommitHash?: string;
    lastCommitMessage?: string;
    lastCommitAt?: string;
  }>().default({
    branch: "main",
  }),
  
  // Build configuration
  buildConfig: jsonb("build_config").$type<{
    buildCommand: string;
    outputDirectory: string;
    installCommand: string;
    devCommand: string;
    envVars: Record<string, string>;
  }>(),
  
  // Deploy configuration
  deployConfig: jsonb("deploy_config").$type<{
    provider: string;
    region: string;
    domain?: string;
    customDomains?: string[];
    ssl: boolean;
    autoDeployBranch?: string;
  }>(),
  
  // Dependencies
  dependencies: jsonb("dependencies").$type<{
    production: Record<string, string>;
    development: Record<string, string>;
  }>().default({
    production: {},
    development: {},
  }),
  
  // Metrics
  metrics: jsonb("metrics").$type<{
    fileCount: number;
    totalSizeKB: number;
    lastBuildDurationMs: number;
    lastDeployDurationMs: number;
  }>(),
  
  // Metadata
  icon: text("icon"),
  color: varchar("color", { length: 7 }),
  tags: jsonb("tags").$type<string[]>().default([]),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  
  // Activity tracking
  lastActivityAt: timestamp("last_activity_at"),
  lastBuildAt: timestamp("last_build_at"),
  lastDeployAt: timestamp("last_deploy_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_dev_project_workspace").on(table.workspaceId),
  index("IDX_dev_project_slug").on(table.workspaceId, table.slug),
  index("IDX_dev_project_status").on(table.status),
  index("IDX_dev_project_type").on(table.projectType),
]);

export const insertIsdsProjectSchema = createInsertSchema(isdsProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertIsdsProject = z.infer<typeof insertIsdsProjectSchema>;
export type IsdsProject = typeof isdsProjects.$inferSelect;

// Backward compatibility aliases for legacy code
export const devProjects = isdsProjects;
export const insertDevProjectSchema = insertIsdsProjectSchema;
export type InsertDevProject = InsertIsdsProject;
export type DevProject = IsdsProject;

// File types
export const devFileTypes = ['file', 'directory', 'symlink'] as const;
export type DevFileType = typeof devFileTypes[number];

// Dev Files - File storage for projects
export const devFiles = pgTable("dev_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // File identity
  name: text("name").notNull(),
  path: text("path").notNull(), // Full path from project root
  
  // Relationships
  projectId: varchar("project_id").references(() => isdsProjects.id, { onDelete: "cascade" }).notNull(),
  parentId: varchar("parent_id"), // For directory structure
  
  // File type and content
  fileType: text("file_type").notNull().default("file"),
  mimeType: varchar("mime_type", { length: 100 }),
  content: text("content"), // For text files
  binaryUrl: text("binary_url"), // For binary files stored externally
  
  // File metadata
  sizeBytes: integer("size_bytes").notNull().default(0),
  encoding: varchar("encoding", { length: 20 }).default("utf-8"),
  lineCount: integer("line_count"),
  
  // Git tracking
  gitStatus: text("git_status"), // modified, added, deleted, untracked
  lastCommitHash: varchar("last_commit_hash", { length: 40 }),
  
  // Versioning
  version: integer("version").notNull().default(1),
  checksum: varchar("checksum", { length: 64 }), // SHA-256
  
  // Permissions
  isReadOnly: boolean("is_read_only").notNull().default(false),
  isHidden: boolean("is_hidden").notNull().default(false),
  
  // Metadata
  metadata: jsonb("metadata").$type<{
    language?: string;
    generatedBy?: string;
    lastEditor?: string;
  }>(),
  
  // Timestamps
  lastModifiedBy: varchar("last_modified_by").references(() => users.id),
  lastModifiedAt: timestamp("last_modified_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_dev_file_project").on(table.projectId),
  index("IDX_dev_file_path").on(table.projectId, table.path),
  index("IDX_dev_file_parent").on(table.parentId),
  index("IDX_dev_file_type").on(table.fileType),
]);

export const insertDevFileSchema = createInsertSchema(devFiles).omit({
  id: true,
  createdAt: true,
});

export type InsertDevFile = z.infer<typeof insertDevFileSchema>;
export type DevFile = typeof devFiles.$inferSelect;

// Command types
export const devCommandTypes = ['terminal', 'build', 'deploy', 'ai', 'git', 'system'] as const;
export type DevCommandType = typeof devCommandTypes[number];

// Command statuses
export const devCommandStatuses = ['pending', 'running', 'completed', 'failed', 'cancelled', 'timeout'] as const;
export type DevCommandStatus = typeof devCommandStatuses[number];

// Dev Commands - Sovereign command execution logs (immutable)
export const devCommands = pgTable("dev_commands", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Command identification
  commandNumber: integer("command_number").notNull(),
  
  // Relationships
  projectId: varchar("project_id").references(() => isdsProjects.id, { onDelete: "cascade" }).notNull(),
  workspaceId: varchar("workspace_id").references(() => devWorkspaces.id).notNull(),
  executedBy: varchar("executed_by").references(() => users.id).notNull(),
  
  // Command details
  commandType: text("command_type").notNull(),
  command: text("command").notNull(),
  arguments: jsonb("arguments").$type<string[]>().default([]),
  workingDirectory: text("working_directory").notNull().default("/"),
  
  // Environment
  environment: jsonb("environment").$type<Record<string, string>>().default({}),
  
  // Execution details
  status: text("status").notNull().default("pending"),
  exitCode: integer("exit_code"),
  
  // Output
  stdout: text("stdout"),
  stderr: text("stderr"),
  combinedOutput: text("combined_output"),
  outputTruncated: boolean("output_truncated").notNull().default(false),
  
  // Timing
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  durationMs: integer("duration_ms"),
  
  // Resource usage
  resourceUsage: jsonb("resource_usage").$type<{
    cpuPercent?: number;
    memoryMB?: number;
    diskReadMB?: number;
    diskWriteMB?: number;
  }>(),
  
  // Error details
  errorMessage: text("error_message"),
  errorStack: text("error_stack"),
  
  // Immutability hash (for audit trail)
  integrityHash: varchar("integrity_hash", { length: 64 }).notNull(),
  previousCommandHash: varchar("previous_command_hash", { length: 64 }),
  
  // Metadata
  metadata: jsonb("metadata").$type<{
    triggeredBy?: string; // manual, webhook, schedule, ai
    correlationId?: string;
    tags?: string[];
  }>(),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_dev_command_project").on(table.projectId),
  index("IDX_dev_command_workspace").on(table.workspaceId),
  index("IDX_dev_command_user").on(table.executedBy),
  index("IDX_dev_command_type").on(table.commandType),
  index("IDX_dev_command_status").on(table.status),
  index("IDX_dev_command_created").on(table.createdAt),
]);

export const insertDevCommandSchema = createInsertSchema(devCommands).omit({
  id: true,
  createdAt: true,
});

export type InsertDevCommand = z.infer<typeof insertDevCommandSchema>;
export type DevCommand = typeof devCommands.$inferSelect;

// Build statuses
export const buildStatuses = ['queued', 'running', 'success', 'failed', 'cancelled'] as const;
export type BuildStatus = typeof buildStatuses[number];

// Build trigger types
export const buildTriggers = ['manual', 'push', 'pull_request', 'schedule', 'api', 'webhook'] as const;
export type BuildTrigger = typeof buildTriggers[number];

// Dev Build Runs - Build execution history
export const devBuildRuns = pgTable("dev_build_runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Build identification
  buildNumber: integer("build_number").notNull(),
  
  // Relationships
  projectId: varchar("project_id").references(() => isdsProjects.id, { onDelete: "cascade" }).notNull(),
  workspaceId: varchar("workspace_id").references(() => devWorkspaces.id).notNull(),
  triggeredBy: varchar("triggered_by").references(() => users.id),
  
  // Trigger information
  trigger: text("trigger").notNull().default("manual"),
  triggerRef: varchar("trigger_ref", { length: 255 }), // Branch, tag, or commit
  commitHash: varchar("commit_hash", { length: 40 }),
  commitMessage: text("commit_message"),
  
  // Build configuration
  buildCommand: text("build_command").notNull(),
  outputDirectory: text("output_directory"),
  nodeVersion: varchar("node_version", { length: 20 }),
  
  // Status
  status: text("status").notNull().default("queued"),
  
  // Steps
  steps: jsonb("steps").$type<Array<{
    name: string;
    status: string;
    startedAt?: string;
    completedAt?: string;
    durationMs?: number;
    output?: string;
    error?: string;
  }>>().default([]),
  
  // Output
  logs: text("logs"),
  logUrl: text("log_url"), // For large logs stored externally
  
  // Artifacts
  artifacts: jsonb("artifacts").$type<Array<{
    name: string;
    path: string;
    sizeBytes: number;
    url: string;
    checksum: string;
  }>>().default([]),
  
  // Metrics
  metrics: jsonb("metrics").$type<{
    bundleSizeKB?: number;
    bundleSizeGzipKB?: number;
    assetCount?: number;
    warningCount?: number;
    errorCount?: number;
  }>(),
  
  // Timing
  queuedAt: timestamp("queued_at").defaultNow(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  durationMs: integer("duration_ms"),
  
  // Error handling
  errorMessage: text("error_message"),
  errorStep: text("error_step"),
  
  // Environment
  environment: jsonb("environment").$type<Record<string, string>>().default({}),
  
  // Metadata
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_build_run_project").on(table.projectId),
  index("IDX_build_run_workspace").on(table.workspaceId),
  index("IDX_build_run_status").on(table.status),
  index("IDX_build_run_trigger").on(table.trigger),
  index("IDX_build_run_created").on(table.createdAt),
  index("IDX_build_run_number").on(table.projectId, table.buildNumber),
]);

export const insertDevBuildRunSchema = createInsertSchema(devBuildRuns).omit({
  id: true,
  createdAt: true,
});

export type InsertDevBuildRun = z.infer<typeof insertDevBuildRunSchema>;
export type DevBuildRun = typeof devBuildRuns.$inferSelect;

// Deploy statuses
export const deployStatuses = ['queued', 'building', 'deploying', 'success', 'failed', 'cancelled', 'rolled_back'] as const;
export type DeployStatus = typeof deployStatuses[number];

// Deploy environments
export const deployEnvironments = ['development', 'staging', 'preview', 'production'] as const;
export type DeployEnvironment = typeof deployEnvironments[number];

// Dev Deploy Runs - Deployment history
export const devDeployRuns = pgTable("dev_deploy_runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Deploy identification
  deployNumber: integer("deploy_number").notNull(),
  
  // Relationships
  projectId: varchar("project_id").references(() => isdsProjects.id, { onDelete: "cascade" }).notNull(),
  workspaceId: varchar("workspace_id").references(() => devWorkspaces.id).notNull(),
  buildRunId: varchar("build_run_id").references(() => devBuildRuns.id),
  triggeredBy: varchar("triggered_by").references(() => users.id),
  
  // Environment
  environment: text("environment").notNull().default("production"),
  
  // Source information
  commitHash: varchar("commit_hash", { length: 40 }),
  commitMessage: text("commit_message"),
  branch: varchar("branch", { length: 255 }),
  
  // Status
  status: text("status").notNull().default("queued"),
  
  // Deployment target
  provider: text("provider").notNull(), // vercel, netlify, cloudflare, custom
  region: varchar("region", { length: 50 }),
  
  // URLs
  url: text("url"), // Primary URL
  previewUrl: text("preview_url"),
  aliasUrls: jsonb("alias_urls").$type<string[]>().default([]),
  
  // Domain configuration
  domains: jsonb("domains").$type<Array<{
    domain: string;
    type: string; // primary, alias, preview
    ssl: boolean;
    verified: boolean;
  }>>().default([]),
  
  // Deployment details
  deploymentId: varchar("deployment_id", { length: 255 }), // Provider's deployment ID
  
  // Steps
  steps: jsonb("steps").$type<Array<{
    name: string;
    status: string;
    startedAt?: string;
    completedAt?: string;
    durationMs?: number;
    details?: string;
  }>>().default([]),
  
  // Logs
  logs: text("logs"),
  logUrl: text("log_url"),
  
  // Metrics
  metrics: jsonb("metrics").$type<{
    deployedFileCount?: number;
    totalSizeKB?: number;
    firstByteTimeMs?: number;
    coldStartTimeMs?: number;
  }>(),
  
  // Timing
  queuedAt: timestamp("queued_at").defaultNow(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  durationMs: integer("duration_ms"),
  
  // Rollback information
  isRollback: boolean("is_rollback").notNull().default(false),
  rolledBackFromId: varchar("rolled_back_from_id"),
  rolledBackAt: timestamp("rolled_back_at"),
  rolledBackBy: varchar("rolled_back_by").references(() => users.id),
  
  // Error handling
  errorMessage: text("error_message"),
  errorCode: varchar("error_code", { length: 50 }),
  
  // Metadata
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_deploy_run_project").on(table.projectId),
  index("IDX_deploy_run_workspace").on(table.workspaceId),
  index("IDX_deploy_run_status").on(table.status),
  index("IDX_deploy_run_environment").on(table.environment),
  index("IDX_deploy_run_created").on(table.createdAt),
  index("IDX_deploy_run_number").on(table.projectId, table.deployNumber),
  index("IDX_deploy_run_build").on(table.buildRunId),
]);


// ==================== SPOM - Sensitive Sessions ====================

export const spomSessionStatuses = ['pending', 'password_verified', 'otp_sent', 'active', 'expired', 'cancelled'] as const;
export type SpomSessionStatus = typeof spomSessionStatuses[number];

export const sensitiveOperationTypes = [
  'system_maintenance', 'debug_fix', 'refactor_restructure', 'read_access',
  'edit_modify', 'save_changes', 'rollback_undo', 'restore_version',
  'restart_services', 'live_tests', 'delete_data', 'config_change', 'security_update'
] as const;
export type SensitiveOperationType = typeof sensitiveOperationTypes[number];

export const sovereignSensitiveSessions = pgTable("sovereign_sensitive_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  status: text("status").notNull().default("pending"),
  operationType: text("operation_type").notNull(),
  operationDescription: text("operation_description"),
  targetResource: text("target_resource"),
  passwordVerifiedAt: timestamp("password_verified_at"),
  otpCode: varchar("otp_code", { length: 6 }),
  otpSentAt: timestamp("otp_sent_at"),
  otpSentTo: text("otp_sent_to"),
  otpVerifiedAt: timestamp("otp_verified_at"),
  otpAttempts: integer("otp_attempts").notNull().default(0),
  activatedAt: timestamp("activated_at"),
  expiresAt: timestamp("expires_at"),
  lastActivityAt: timestamp("last_activity_at"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  deviceInfo: jsonb("device_info"),
  completedAt: timestamp("completed_at"),
  result: text("result"),
  resultMessage: text("result_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_spom_sess_owner").on(table.ownerId),
  index("IDX_spom_sess_status").on(table.status),
]);

export const insertSovereignSensitiveSessionSchema = createInsertSchema(sovereignSensitiveSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSovereignSensitiveSession = z.infer<typeof insertSovereignSensitiveSessionSchema>;
export type SovereignSensitiveSession = typeof sovereignSensitiveSessions.$inferSelect;

// SPOM Operations Configuration
export const spomOperations = pgTable("spom_operations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 50 }).unique().notNull(),
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  description: text("description"),
  descriptionAr: text("description_ar"),
  category: text("category").notNull(),
  riskLevel: text("risk_level").notNull().default("medium"),
  requiresPassword: boolean("requires_password").notNull().default(true),
  requiresOtp: boolean("requires_otp").notNull().default(true),
  sessionDurationMinutes: integer("session_duration_minutes").notNull().default(15),
  warningMessage: text("warning_message"),
  warningMessageAr: text("warning_message_ar"),
  potentialRisks: jsonb("potential_risks").$type<string[]>().default([]),
  potentialRisksAr: jsonb("potential_risks_ar").$type<string[]>().default([]),
  isEnabled: boolean("is_enabled").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_spom_op_code").on(table.code),
  index("IDX_spom_op_category").on(table.category),
]);

export type SpomOperation = typeof spomOperations.$inferSelect;

// SPOM Immutable Audit Log - Extended version for sensitive operations
export const spomAuditLog = pgTable("spom_audit_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").references(() => users.id).notNull(),
  ownerEmail: text("owner_email").notNull(),
  ownerName: text("owner_name"),
  sessionId: varchar("session_id").references(() => sovereignSensitiveSessions.id),
  operationType: text("operation_type").notNull(),
  operationCategory: text("operation_category").notNull(),
  actionTaken: text("action_taken").notNull(),
  targetResource: text("target_resource"),
  targetPath: text("target_path"),
  affectedPage: text("affected_page"),
  result: text("result").notNull(),
  resultDetails: text("result_details"),
  errorMessage: text("error_message"),
  previousState: jsonb("previous_state"),
  newState: jsonb("new_state"),
  canRollback: boolean("can_rollback").notNull().default(false),
  rollbackData: jsonb("rollback_data"),
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent"),
  browserName: text("browser_name"),
  osName: text("os_name"),
  deviceType: text("device_type"),
  executedAt: timestamp("executed_at").defaultNow().notNull(),
  integrityHash: text("integrity_hash"),
  previousLogId: varchar("previous_log_id"),
}, (table) => [
  index("IDX_spom_audit_owner").on(table.ownerId),
  index("IDX_spom_audit_session").on(table.sessionId),
  index("IDX_spom_audit_operation").on(table.operationType),
  index("IDX_spom_audit_executed").on(table.executedAt),
]);

export const insertSpomAuditLogSchema = createInsertSchema(spomAuditLog).omit({
  id: true,
});

export type InsertSpomAuditLog = z.infer<typeof insertSpomAuditLogSchema>;
export type SpomAuditLogRecord = typeof spomAuditLog.$inferSelect;

// ==================== HETZNER DEPLOYMENTS (Tenant Isolation) ====================

// Persistent storage for Hetzner deployment ownership
// Used to verify tenant isolation after server restarts
export const hetznerDeployments = pgTable("hetzner_deployments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: integer("server_id").notNull().unique(), // Hetzner server ID
  projectId: varchar("project_id").references(() => isdsProjects.id, { onDelete: "cascade" }).notNull(),
  ownerId: varchar("owner_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  serverName: text("server_name"),
  serverType: varchar("server_type", { length: 20 }),
  location: varchar("location", { length: 20 }),
  status: text("status").notNull().default("active"), // active, stopped, deleted
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_hetzner_server_id").on(table.serverId),
  index("IDX_hetzner_project_id").on(table.projectId),
  index("IDX_hetzner_owner_id").on(table.ownerId),
]);

export const insertHetznerDeploymentSchema = createInsertSchema(hetznerDeployments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertHetznerDeployment = z.infer<typeof insertHetznerDeploymentSchema>;
export type HetznerDeployment = typeof hetznerDeployments.$inferSelect;

// ==================== PHASE 0: MEMORY, STATE & SOVEREIGNTY LAYER ====================

// ==================== 0.1 CONVERSATION LEDGER (سجل المحادثات الدائم) ====================

// Conversations table - encrypted, user-scoped
export const sovereignConversations = pgTable("sovereign_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  projectId: varchar("project_id").references(() => isdsProjects.id, { onDelete: "set null" }),
  platformId: varchar("platform_id"), // For future platform linking
  title: text("title").notNull(),
  titleAr: text("title_ar"),
  status: text("status").notNull().default("active"), // active, archived, soft_deleted, permanently_deleted
  isEncrypted: boolean("is_encrypted").notNull().default(true),
  encryptionKeyId: varchar("encryption_key_id"),
  messageCount: integer("message_count").notNull().default(0),
  lastMessageAt: timestamp("last_message_at"),
  deletedAt: timestamp("deleted_at"),
  deletedBy: varchar("deleted_by").references(() => users.id),
  canRestore: boolean("can_restore").notNull().default(true),
  restoreDeadline: timestamp("restore_deadline"), // After this, permanent delete allowed
  metadata: jsonb("metadata").$type<{
    context?: string;
    tags?: string[];
    linkedProjects?: string[];
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("IDX_conv_user_id").on(table.userId),
  index("IDX_conv_project_id").on(table.projectId),
  index("IDX_conv_status").on(table.status),
  index("IDX_conv_created_at").on(table.createdAt),
]);

export const insertSovereignConversationSchema = createInsertSchema(sovereignConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSovereignConversation = z.infer<typeof insertSovereignConversationSchema>;
export type SovereignConversation = typeof sovereignConversations.$inferSelect;

// Conversation messages - encrypted content
export const conversationMessages = pgTable("conversation_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").references(() => sovereignConversations.id, { onDelete: "cascade" }).notNull(),
  role: text("role").notNull(), // user, assistant, system
  content: text("content").notNull(), // Encrypted content
  contentAr: text("content_ar"), // Arabic translation if available
  isEncrypted: boolean("is_encrypted").notNull().default(true),
  tokenCount: integer("token_count"),
  modelUsed: varchar("model_used", { length: 50 }),
  generationTime: integer("generation_time"), // milliseconds
  metadata: jsonb("metadata").$type<{
    codeBlocks?: { language: string; code: string }[];
    filesModified?: string[];
    commandsExecuted?: string[];
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("IDX_msg_conversation_id").on(table.conversationId),
  index("IDX_msg_role").on(table.role),
  index("IDX_msg_created_at").on(table.createdAt),
]);

export const insertConversationMessageSchema = createInsertSchema(conversationMessages).omit({
  id: true,
  createdAt: true,
});
export type InsertConversationMessage = z.infer<typeof insertConversationMessageSchema>;
export type ConversationMessage = typeof conversationMessages.$inferSelect;

// ==================== 0.2 RESTORE POINTS (نقاط الاستعادة) ====================

export const restorePoints = pgTable("restore_points", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => isdsProjects.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  type: text("type").notNull(), // auto_pre_install, auto_pre_push, auto_pre_structure, manual
  triggerEvent: text("trigger_event"), // What triggered this snapshot
  
  // Snapshot data
  filesSnapshot: jsonb("files_snapshot").$type<{
    files: { path: string; content: string; size: number }[];
    totalSize: number;
    fileCount: number;
  }>(),
  contextSnapshot: jsonb("context_snapshot").$type<{
    conversationId?: string;
    lastMessageId?: string;
    aiState?: Record<string, unknown>;
  }>(),
  configSnapshot: jsonb("config_snapshot").$type<{
    dependencies?: Record<string, string>;
    envVars?: string[]; // Names only, not values
    settings?: Record<string, unknown>;
  }>(),
  gitSnapshot: jsonb("git_snapshot").$type<{
    branch?: string;
    commitHash?: string;
    uncommittedChanges?: string[];
  }>(),
  
  // Metadata
  sizeBytes: integer("size_bytes").notNull().default(0),
  isImmutable: boolean("is_immutable").notNull().default(false), // Milestone - cannot be modified
  isLocked: boolean("is_locked").notNull().default(false),
  expiresAt: timestamp("expires_at"), // Auto-cleanup for old snapshots
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("IDX_rp_project_id").on(table.projectId),
  index("IDX_rp_user_id").on(table.userId),
  index("IDX_rp_type").on(table.type),
  index("IDX_rp_created_at").on(table.createdAt),
]);

export const insertRestorePointSchema = createInsertSchema(restorePoints).omit({
  id: true,
  createdAt: true,
});
export type InsertRestorePoint = z.infer<typeof insertRestorePointSchema>;
export type RestorePoint = typeof restorePoints.$inferSelect;

// ==================== 0.3 PLATFORM ISOLATION & SECURITY (العزل والحماية) ====================

// Platform-scoped tokens for isolation
export const platformTokens = pgTable("platform_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  platformId: varchar("platform_id").notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  organizationId: varchar("organization_id"),
  tokenHash: text("token_hash").notNull(), // Hashed token
  tokenType: text("token_type").notNull(), // api, session, service
  role: text("role").notNull().default("user"), // user, admin, sovereign
  scopes: jsonb("scopes").$type<string[]>().default([]),
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"),
  isRevoked: boolean("is_revoked").notNull().default(false),
  revokedAt: timestamp("revoked_at"),
  revokedBy: varchar("revoked_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("IDX_pt_platform_id").on(table.platformId),
  index("IDX_pt_user_id").on(table.userId),
  index("IDX_pt_token_type").on(table.tokenType),
]);

export const insertPlatformTokenSchema = createInsertSchema(platformTokens).omit({
  id: true,
  createdAt: true,
});
export type InsertPlatformToken = z.infer<typeof insertPlatformTokenSchema>;
export type PlatformToken = typeof platformTokens.$inferSelect;

// ==================== 0.4 SOVEREIGN DELETE SYSTEM (نظام الحذف السيادي) ====================

// Deleted platforms ledger - soft delete registry
export const deletedPlatformsLedger = pgTable("deleted_platforms_ledger", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  originalId: varchar("original_id").notNull(), // Original platform/project ID
  originalType: text("original_type").notNull(), // platform, project, workspace
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  description: text("description"),
  
  // Deletion workflow tracking
  deletionPhase: text("deletion_phase").notNull().default("warning_shown"),
  // Phases: warning_shown, confirmed, password_verified, soft_deleted, scheduled_permanent, permanently_deleted
  warningShownAt: timestamp("warning_shown_at"),
  confirmedAt: timestamp("confirmed_at"),
  passwordVerifiedAt: timestamp("password_verified_at"),
  softDeletedAt: timestamp("soft_deleted_at"),
  permanentDeleteScheduledAt: timestamp("permanent_delete_scheduled_at"),
  permanentlyDeletedAt: timestamp("permanently_deleted_at"),
  
  // Full backup for restoration
  fullBackup: jsonb("full_backup").$type<{
    files?: unknown;
    config?: unknown;
    metadata?: unknown;
  }>(),
  backupSizeBytes: integer("backup_size_bytes"),
  
  // Restoration
  canRestore: boolean("can_restore").notNull().default(true),
  restoreDeadline: timestamp("restore_deadline").notNull(), // After this, can be permanently deleted
  restoredAt: timestamp("restored_at"),
  restoredBy: varchar("restored_by").references(() => users.id),
  
  // Permanent deletion (sovereign only)
  permanentDeletedBy: varchar("permanent_deleted_by").references(() => users.id),
  permanentDeleteReason: text("permanent_delete_reason"),
  sovereignToken: text("sovereign_token"), // Required for permanent delete
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("IDX_dpl_user_id").on(table.userId),
  index("IDX_dpl_original_id").on(table.originalId),
  index("IDX_dpl_deletion_phase").on(table.deletionPhase),
  index("IDX_dpl_restore_deadline").on(table.restoreDeadline),
]);

export const insertDeletedPlatformSchema = createInsertSchema(deletedPlatformsLedger).omit({
  id: true,
  createdAt: true,
});
export type InsertDeletedPlatform = z.infer<typeof insertDeletedPlatformSchema>;
export type DeletedPlatform = typeof deletedPlatformsLedger.$inferSelect;

// ==================== 0.5 IMMUTABLE AUDIT LOG (سجل التدقيق غير القابل للتعديل) ====================

export const sovereignAuditLog = pgTable("sovereign_audit_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  projectId: varchar("project_id"),
  platformId: varchar("platform_id"),
  
  // Action details
  category: text("category").notNull(), // terminal, file, ai_decision, delete, restore, git, security
  action: text("action").notNull(), // e.g., "execute_command", "modify_file", "ai_generate"
  actionAr: text("action_ar"),
  target: text("target"), // What was affected
  targetPath: text("target_path"), // File path if applicable
  
  // Before/After state
  previousValue: jsonb("previous_value"),
  newValue: jsonb("new_value"),
  
  // AI-specific
  aiModel: varchar("ai_model", { length: 50 }),
  aiPrompt: text("ai_prompt"),
  aiResponse: text("ai_response"),
  aiDecisionReason: text("ai_decision_reason"), // Why AI made this choice
  aiDecisionReasonAr: text("ai_decision_reason_ar"),
  aiAlternativesConsidered: jsonb("ai_alternatives_considered").$type<{
    option: string;
    reason: string;
    rejected: boolean;
  }[]>(),
  
  // Terminal-specific
  command: text("command"),
  commandOutput: text("command_output"),
  exitCode: integer("exit_code"),
  
  // Git-specific
  gitOperation: text("git_operation"),
  gitBranch: text("git_branch"),
  gitCommitHash: text("git_commit_hash"),
  
  // Security & Integrity
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  sessionId: varchar("session_id"),
  integrityHash: text("integrity_hash").notNull(), // SHA-256 of log content
  previousLogHash: text("previous_log_hash"), // Chain link for tamper detection
  
  // Flags
  isCritical: boolean("is_critical").notNull().default(false),
  isReversible: boolean("is_reversible").notNull().default(true),
  wasBlocked: boolean("was_blocked").notNull().default(false), // AI Guardian blocked this
  blockedReason: text("blocked_reason"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("IDX_sal_user_id").on(table.userId),
  index("IDX_sal_project_id").on(table.projectId),
  index("IDX_sal_category").on(table.category),
  index("IDX_sal_action").on(table.action),
  index("IDX_sal_created_at").on(table.createdAt),
  index("IDX_sal_is_critical").on(table.isCritical),
]);

export const insertSovereignAuditLogEntrySchema = createInsertSchema(sovereignAuditLog).omit({
  id: true,
  createdAt: true,
});
export type InsertSovereignAuditLogEntry = z.infer<typeof insertSovereignAuditLogEntrySchema>;
export type SovereignAuditLogEntry = typeof sovereignAuditLog.$inferSelect;

// ==================== AI DECISION MEMORY (ذاكرة قرارات AI) ====================

export const aiDecisionMemory = pgTable("ai_decision_memory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => isdsProjects.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  conversationId: varchar("conversation_id").references(() => sovereignConversations.id, { onDelete: "set null" }),
  
  // Decision details
  decisionType: text("decision_type").notNull(), // technology_choice, architecture, pattern, library, approach
  question: text("question").notNull(), // What was being decided
  questionAr: text("question_ar"),
  chosenOption: text("chosen_option").notNull(),
  chosenOptionAr: text("chosen_option_ar"),
  reasoning: text("reasoning").notNull(), // Why this was chosen
  reasoningAr: text("reasoning_ar"),
  
  // Alternatives
  alternativesConsidered: jsonb("alternatives_considered").$type<{
    option: string;
    optionAr?: string;
    pros: string[];
    cons: string[];
    rejectionReason: string;
    rejectionReasonAr?: string;
  }[]>().default([]),
  
  // Context
  contextAtDecision: jsonb("context_at_decision").$type<{
    projectState?: string;
    existingStack?: string[];
    constraints?: string[];
    userPreferences?: string[];
  }>(),
  
  // Impact tracking
  impactLevel: text("impact_level").notNull().default("medium"), // low, medium, high, critical
  affectedAreas: jsonb("affected_areas").$type<string[]>().default([]),
  
  // Validation
  wasReversed: boolean("was_reversed").notNull().default(false),
  reversedAt: timestamp("reversed_at"),
  reversedReason: text("reversed_reason"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("IDX_adm_project_id").on(table.projectId),
  index("IDX_adm_user_id").on(table.userId),
  index("IDX_adm_decision_type").on(table.decisionType),
  index("IDX_adm_impact_level").on(table.impactLevel),
]);

export const insertAIDecisionMemorySchema = createInsertSchema(aiDecisionMemory).omit({
  id: true,
  createdAt: true,
});
export type InsertAIDecisionMemory = z.infer<typeof insertAIDecisionMemorySchema>;
export type AIDecisionMemory = typeof aiDecisionMemory.$inferSelect;

// ==================== PROJECT BRAIN (ملخص حي للمشروع) ====================

export const projectBrain = pgTable("project_brain", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => isdsProjects.id, { onDelete: "cascade" }).notNull().unique(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // Live summary
  stack: jsonb("stack").$type<{
    frontend?: string[];
    backend?: string[];
    database?: string[];
    devops?: string[];
    other?: string[];
  }>().default({}),
  
  status: jsonb("status").$type<{
    overall: "healthy" | "warning" | "critical" | "unknown";
    lastBuildSuccess?: boolean;
    lastDeploySuccess?: boolean;
    testsPassingPercent?: number;
    activeIssues?: number;
  }>().default({ overall: "unknown" }),
  
  risks: jsonb("risks").$type<{
    security?: { level: string; items: string[] };
    performance?: { level: string; items: string[] };
    maintainability?: { level: string; items: string[] };
    dependencies?: { level: string; items: string[] };
  }>().default({}),
  
  nextSteps: jsonb("next_steps").$type<{
    priority: "high" | "medium" | "low";
    task: string;
    taskAr?: string;
    estimatedTime?: string;
    blockedBy?: string[];
  }[]>().default([]),
  
  insights: jsonb("insights").$type<{
    recentActivity?: string;
    performanceTrend?: string;
    securityScore?: number;
    codeQualityScore?: number;
  }>().default({}),
  
  lastAnalyzedAt: timestamp("last_analyzed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("IDX_pb_project_id").on(table.projectId),
  index("IDX_pb_user_id").on(table.userId),
]);

export const insertProjectBrainSchema = createInsertSchema(projectBrain).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertProjectBrain = z.infer<typeof insertProjectBrainSchema>;
export type ProjectBrain = typeof projectBrain.$inferSelect;

// ==================== INFERA ENGINE PLATFORM LINKING UNIT ====================
// وحدة ربط منصات مجموعة انفرا انجن - للربط بين 30+ منصة رقمية

// Platform types in INFERA Engine ecosystem
export const inferaPlatformTypes = [
  'central',      // المنصة المركزية - Central Hub
  'sovereign',    // منصة سيادية - Owner's Sovereign Platform
  'builder',      // منصة بناء - WebNova Builder
  'commercial',   // منصة تجارية - Commercial Platform
  'enterprise',   // منصة مؤسسية - Enterprise Platform
  'government',   // منصة حكومية - Government Platform
  'healthcare',   // منصة صحية - Healthcare Platform
  'education',    // منصة تعليمية - Education Platform
  'financial',    // منصة مالية - Financial Platform
  'ecommerce',    // منصة تجارة إلكترونية - E-commerce Platform
] as const;
export type InferaPlatformType = typeof inferaPlatformTypes[number];

// Platform sovereignty tiers
export const sovereigntyTiers = [
  'root',         // مستوى الجذر - Root Owner Level (INFERA Engine)
  'platform',     // مستوى المنصة - Platform Level
  'tenant',       // مستوى المستأجر - Tenant Level
  'user',         // مستوى المستخدم - User Level
] as const;
export type SovereigntyTier = typeof sovereigntyTiers[number];

// INFERA Engine Platform Registry - سجل منصات مجموعة انفرا انجن
export const inferaPlatforms = pgTable("infera_platforms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Platform identification
  code: varchar("code", { length: 50 }).unique().notNull(), // e.g., "INFERA-WEBNOVA-001"
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  
  // Platform classification
  platformType: text("platform_type").notNull().default("commercial"), // central, sovereign, builder, commercial...
  sovereigntyTier: text("sovereignty_tier").notNull().default("platform"), // root, platform, tenant, user
  category: text("category").notNull().default("commercial"), // commercial, sovereign
  version: varchar("version", { length: 20 }).default("1.0.0"),
  
  // Technical details
  baseUrl: text("base_url"),
  apiEndpoint: text("api_endpoint"),
  webhookUrl: text("webhook_url"),
  healthCheckUrl: text("health_check_url"),
  
  // Capabilities
  capabilities: jsonb("capabilities").$type<{
    canBuildPlatforms?: boolean;    // قدرة بناء المنصات
    canManageDomains?: boolean;     // إدارة النطاقات
    canDeployServices?: boolean;    // نشر الخدمات
    canProcessPayments?: boolean;   // معالجة المدفوعات
    canManageUsers?: boolean;       // إدارة المستخدمين
    canAccessAI?: boolean;          // الوصول للذكاء الاصطناعي
    customCapabilities?: string[];  // قدرات مخصصة
  }>().default({}),
  
  // Service configuration
  serviceConfig: jsonb("service_config").$type<{
    maxUsers?: number;
    maxStorage?: number; // GB
    maxBandwidth?: number; // GB/month
    allowedRegions?: string[];
    complianceStandards?: string[]; // GDPR, HIPAA, PCI-DSS
  }>(),
  
  // Status
  status: text("status").notNull().default("draft"), // draft, active, maintenance, suspended, decommissioned
  isPublished: boolean("is_published").notNull().default(false),
  isSystemPlatform: boolean("is_system_platform").notNull().default(false), // WebNova, Central Platform
  
  // Ownership
  ownerId: varchar("owner_id").references(() => users.id),
  tenantId: varchar("tenant_id"),
  
  // Timestamps
  launchedAt: timestamp("launched_at"),
  lastHealthCheckAt: timestamp("last_health_check_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("IDX_ip_code").on(table.code),
  index("IDX_ip_platform_type").on(table.platformType),
  index("IDX_ip_status").on(table.status),
  index("IDX_ip_owner_id").on(table.ownerId),
]);

export const insertInferaPlatformSchema = createInsertSchema(inferaPlatforms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertInferaPlatform = z.infer<typeof insertInferaPlatformSchema>;
export type InferaPlatform = typeof inferaPlatforms.$inferSelect;

// Platform Link Types
export const platformLinkTypes = [
  'parent_child',      // علاقة أب-ابن
  'peer',              // علاقة نظير
  'service_provider',  // مزود خدمة
  'service_consumer',  // مستهلك خدمة
  'federation',        // اتحاد فيدرالي
  'mirror',            // نسخة مرآة
] as const;
export type PlatformLinkType = typeof platformLinkTypes[number];

// Platform Links - روابط المنصات
export const platformLinks = pgTable("platform_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Link endpoints
  sourcePlatformId: varchar("source_platform_id").references(() => inferaPlatforms.id, { onDelete: "cascade" }).notNull(),
  targetPlatformId: varchar("target_platform_id").references(() => inferaPlatforms.id, { onDelete: "cascade" }).notNull(),
  
  // Link configuration
  linkType: text("link_type").notNull().default("peer"), // parent_child, peer, service_provider...
  linkDirection: text("link_direction").notNull().default("bidirectional"), // unidirectional, bidirectional
  trustLevel: integer("trust_level").notNull().default(5), // 1-10 scale
  
  // Sync policies
  syncPolicies: jsonb("sync_policies").$type<{
    syncUsers?: boolean;
    syncProjects?: boolean;
    syncConfigs?: boolean;
    syncFrequency?: string; // realtime, hourly, daily
    conflictResolution?: string; // source_wins, target_wins, manual
  }>().default({}),
  
  // Access control
  allowedOperations: jsonb("allowed_operations").$type<string[]>().default([]),
  restrictedOperations: jsonb("restricted_operations").$type<string[]>().default([]),
  
  // Status
  status: text("status").notNull().default("pending"), // pending, active, suspended, revoked
  isActive: boolean("is_active").notNull().default(false),
  
  // Audit
  establishedAt: timestamp("established_at"),
  lastSyncAt: timestamp("last_sync_at"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("IDX_pl_source").on(table.sourcePlatformId),
  index("IDX_pl_target").on(table.targetPlatformId),
  index("IDX_pl_status").on(table.status),
]);

export const insertPlatformLinkSchema = createInsertSchema(platformLinks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPlatformLink = z.infer<typeof insertPlatformLinkSchema>;
export type PlatformLink = typeof platformLinks.$inferSelect;

// Platform Services - خدمات المنصات (للتطوير والصيانة المستمرة)
export const platformServices = pgTable("platform_services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  platformId: varchar("platform_id").references(() => inferaPlatforms.id, { onDelete: "cascade" }).notNull(),
  
  // Service identification
  serviceName: text("service_name").notNull(),
  serviceNameAr: text("service_name_ar"),
  serviceKind: text("service_kind").notNull(), // development, maintenance, monitoring, security, backup
  
  // Service contract
  serviceContract: jsonb("service_contract").$type<{
    slaLevel?: string; // basic, standard, premium, enterprise
    responseTime?: string; // 24h, 8h, 4h, 1h
    uptimeGuarantee?: number; // percentage
    includedHours?: number; // hours/month
    features?: string[];
  }>(),
  
  // Lifecycle hooks - for continuous development
  lifecycleHooks: jsonb("lifecycle_hooks").$type<{
    onDeploy?: string[];  // commands to run on deploy
    onUpdate?: string[];  // commands to run on update
    onScale?: string[];   // commands to run on scaling
    onBackup?: string[];  // commands for backup
    onRestore?: string[]; // commands for restore
  }>(),
  
  // Maintenance obligations
  maintenanceSchedule: jsonb("maintenance_schedule").$type<{
    frequency?: string; // daily, weekly, monthly
    preferredWindow?: string; // e.g., "02:00-06:00 UTC"
    notifyBefore?: number; // hours
    autoApplyPatches?: boolean;
  }>(),
  
  // Status
  status: text("status").notNull().default("active"), // active, paused, terminated
  lastServiceAt: timestamp("last_service_at"),
  nextServiceAt: timestamp("next_service_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("IDX_ps_platform_id").on(table.platformId),
  index("IDX_ps_service_kind").on(table.serviceKind),
  index("IDX_ps_status").on(table.status),
]);

export const insertPlatformServiceSchema = createInsertSchema(platformServices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPlatformService = z.infer<typeof insertPlatformServiceSchema>;
export type PlatformService = typeof platformServices.$inferSelect;

// Certificate Hierarchy Roles
export const certificateHierarchyRoles = [
  'root_ca',           // شهادة الجذر - Owner Root CA
  'platform_ca',       // شهادة المنصة - Platform Intermediate CA
  'service_cert',      // شهادة الخدمة - Service Certificate
  'user_cert',         // شهادة المستخدم - User Certificate
  'device_cert',       // شهادة الجهاز - Device Certificate
] as const;
export type CertificateHierarchyRole = typeof certificateHierarchyRoles[number];

// Platform Certificates - شهادات المنصات (هرمية الأمان)
export const platformCertificates = pgTable("platform_certificates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  platformId: varchar("platform_id").references(() => inferaPlatforms.id, { onDelete: "cascade" }),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  
  // Certificate identification
  serialNumber: varchar("serial_number", { length: 100 }).unique().notNull(),
  commonName: text("common_name").notNull(),
  
  // Hierarchy
  hierarchyRole: text("hierarchy_role").notNull().default("user_cert"), // root_ca, platform_ca, service_cert, user_cert
  parentCertId: varchar("parent_cert_id").references((): any => platformCertificates.id),
  
  // Certificate details
  publicKeyFingerprint: text("public_key_fingerprint").notNull(),
  signatureAlgorithm: varchar("signature_algorithm", { length: 50 }).default("SHA256withRSA"),
  keySize: integer("key_size").default(2048),
  
  // Scope & Permissions
  scope: jsonb("scope").$type<{
    allowedPlatforms?: string[];
    allowedServices?: string[];
    allowedOperations?: string[];
    ipRestrictions?: string[];
    domainRestrictions?: string[];
  }>().default({}),
  
  // Validity
  validFrom: timestamp("valid_from").notNull(),
  validUntil: timestamp("valid_until").notNull(),
  isRevoked: boolean("is_revoked").notNull().default(false),
  revokedAt: timestamp("revoked_at"),
  revokedReason: text("revoked_reason"),
  
  // Security flags
  isHardwareBacked: boolean("is_hardware_backed").notNull().default(false), // TPM/HSM
  isOwnerCertificate: boolean("is_owner_certificate").notNull().default(false),
  canSignOthers: boolean("can_sign_others").notNull().default(false), // CA capability
  
  // Rotation
  rotationPolicy: jsonb("rotation_policy").$type<{
    autoRotate?: boolean;
    rotateBeforeDays?: number;
    notifyBeforeDays?: number;
    maxRenewals?: number;
    currentRenewals?: number;
  }>(),
  
  // Audit
  issuedBy: varchar("issued_by").references(() => users.id),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
  lastUsedAt: timestamp("last_used_at"),
  usageCount: integer("usage_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("IDX_pc_platform_id").on(table.platformId),
  index("IDX_pc_user_id").on(table.userId),
  index("IDX_pc_hierarchy_role").on(table.hierarchyRole),
  index("IDX_pc_is_revoked").on(table.isRevoked),
  index("IDX_pc_valid_until").on(table.validUntil),
]);

export const insertPlatformCertificateSchema = createInsertSchema(platformCertificates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPlatformCertificate = z.infer<typeof insertPlatformCertificateSchema>;
export type PlatformCertificate = typeof platformCertificates.$inferSelect;

// ==================== NOVA CONVERSATION ENGINE - PERSISTENT MEMORY ====================

// Nova Conversation sessions - جلسات محادثة نوفا
export const novaSessions = pgTable("nova_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  projectId: varchar("project_id"), // optional: linked project
  
  // Session metadata
  title: text("title"),
  summary: text("summary"), // AI-generated summary
  language: text("language").notNull().default("ar"), // ar, en
  
  // Session state
  status: text("status").notNull().default("active"), // active, archived, deleted
  messageCount: integer("message_count").notNull().default(0),
  
  // Context preservation
  contextSnapshot: jsonb("context_snapshot").$type<{
    currentProject?: string;
    activeBlueprint?: string;
    recentDecisions?: string[];
    preferences?: Record<string, any>;
  }>(),
  
  // Timestamps
  lastMessageAt: timestamp("last_message_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("IDX_ns_user_id").on(table.userId),
  index("IDX_ns_project_id").on(table.projectId),
  index("IDX_ns_status").on(table.status),
  index("IDX_ns_last_message").on(table.lastMessageAt),
]);

export const insertNovaSessionSchema = createInsertSchema(novaSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertNovaSession = z.infer<typeof insertNovaSessionSchema>;
export type NovaSession = typeof novaSessions.$inferSelect;

// Nova messages - رسائل نوفا
export const novaMessages = pgTable("nova_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => novaSessions.id, { onDelete: "cascade" }).notNull(),
  
  // Message content
  role: text("role").notNull(), // user, assistant, system
  content: text("content").notNull(),
  language: text("language").notNull().default("ar"),
  
  // Rich content
  attachments: jsonb("attachments").$type<{
    type: 'image' | 'file' | 'code' | 'blueprint';
    url?: string;
    content?: string;
    metadata?: Record<string, any>;
  }[]>(),
  
  // AI metadata
  modelUsed: text("model_used"),
  tokensUsed: integer("tokens_used"),
  responseTime: integer("response_time"), // ms
  
  // Interactive elements
  actions: jsonb("actions").$type<{
    id: string;
    type: 'confirm' | 'apply' | 'preview' | 'compare' | 'rollback';
    label: string;
    labelAr?: string;
    status: 'pending' | 'executed' | 'cancelled';
    executedAt?: string;
    result?: any;
  }[]>(),
  
  // Message flags
  isEdited: boolean("is_edited").notNull().default(false),
  isPinned: boolean("is_pinned").notNull().default(false),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("IDX_nm_session_id").on(table.sessionId),
  index("IDX_nm_role").on(table.role),
  index("IDX_nm_created").on(table.createdAt),
]);

export const insertNovaMessageSchema = createInsertSchema(novaMessages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertNovaMessage = z.infer<typeof insertNovaMessageSchema>;
export type NovaMessage = typeof novaMessages.$inferSelect;

// Nova User decisions - قرارات المستخدم
export const novaDecisions = pgTable("nova_decisions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  sessionId: varchar("session_id").references(() => novaSessions.id, { onDelete: "set null" }),
  messageId: varchar("message_id").references(() => novaMessages.id, { onDelete: "set null" }),
  
  // Decision details
  category: text("category").notNull(), // architecture, security, deployment, database, ui, integration
  decisionType: text("decision_type").notNull(), // choice, configuration, approval, rejection
  
  // What was decided
  question: text("question").notNull(), // The question/prompt that led to decision
  selectedOption: text("selected_option").notNull(), // What user chose
  alternatives: jsonb("alternatives").$type<string[]>(), // Other options that were available
  
  // Context
  context: jsonb("context").$type<{
    projectId?: string;
    blueprintId?: string;
    affectedComponents?: string[];
    dependencies?: string[];
    costImpact?: { estimate: number; currency: string };
    riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  }>(),
  
  // Reasoning
  reasoning: text("reasoning"), // AI explanation for recommendation
  userNotes: text("user_notes"), // User's own notes
  
  // Status
  status: text("status").notNull().default("active"), // active, superseded, reverted
  supersededBy: varchar("superseded_by").references((): any => novaDecisions.id),
  
  // Impact tracking
  wasApplied: boolean("was_applied").notNull().default(false),
  appliedAt: timestamp("applied_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("IDX_nd_user_id").on(table.userId),
  index("IDX_nd_session_id").on(table.sessionId),
  index("IDX_nd_category").on(table.category),
  index("IDX_nd_status").on(table.status),
]);

export const insertNovaDecisionSchema = createInsertSchema(novaDecisions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertNovaDecision = z.infer<typeof insertNovaDecisionSchema>;
export type NovaDecision = typeof novaDecisions.$inferSelect;

// Nova User preferences - تفضيلات المستخدم المتعلمة
export const novaPreferences = pgTable("nova_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  
  // Learned preferences
  preferredLanguage: text("preferred_language").default("ar"),
  preferredFramework: text("preferred_framework"),
  preferredDatabase: text("preferred_database"),
  preferredCloudProvider: text("preferred_cloud_provider"),
  preferredUIStyle: text("preferred_ui_style"),
  
  // Communication style
  detailLevel: text("detail_level").default("balanced"), // brief, balanced, detailed
  codeExplanations: boolean("code_explanations").default(true),
  showAlternatives: boolean("show_alternatives").default(true),
  
  // Architecture preferences
  architecturePatterns: jsonb("architecture_patterns").$type<{
    pattern: string;
    usageCount: number;
    lastUsed: string;
  }[]>(),
  
  // Common configurations
  defaultConfigs: jsonb("default_configs").$type<Record<string, any>>(),
  
  // Learning data
  interactionCount: integer("interaction_count").default(0),
  lastInteraction: timestamp("last_interaction"),
  learningScore: real("learning_score").default(0), // How well system knows user
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("IDX_np_user_id").on(table.userId),
]);

export const insertNovaPreferencesSchema = createInsertSchema(novaPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertNovaPreferences = z.infer<typeof insertNovaPreferencesSchema>;
export type NovaPreferences = typeof novaPreferences.$inferSelect;

// Nova Project context - سياق المشروع للذكاء الاصطناعي
export const novaProjectContexts = pgTable("nova_project_contexts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().unique(), // From projects table
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // Project understanding
  projectType: text("project_type"), // web, mobile, api, microservice, monolith
  techStack: jsonb("tech_stack").$type<{
    frontend?: string[];
    backend?: string[];
    database?: string[];
    infrastructure?: string[];
  }>(),
  
  // Current state
  activeBlueprint: jsonb("active_blueprint").$type<Record<string, any>>(),
  generatedModels: jsonb("generated_models").$type<{ name: string; fields: any[] }[]>(),
  generatedServices: jsonb("generated_services").$type<{ name: string; endpoints: any[] }[]>(),
  
  // Configuration history
  configHistory: jsonb("config_history").$type<{
    timestamp: string;
    change: string;
    previousValue: any;
    newValue: any;
  }[]>(),
  
  // Conflict detection
  detectedConflicts: jsonb("detected_conflicts").$type<{
    id: string;
    type: string;
    description: string;
    severity: 'warning' | 'error';
    suggestedResolution?: string;
    resolved: boolean;
  }[]>(),
  
  // Cost tracking
  estimatedCosts: jsonb("estimated_costs").$type<{
    component: string;
    monthlyCost: number;
    currency: string;
    provider: string;
  }[]>(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("IDX_npc_project_id").on(table.projectId),
  index("IDX_npc_user_id").on(table.userId),
]);

export const insertNovaProjectContextSchema = createInsertSchema(novaProjectContexts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertNovaProjectContext = z.infer<typeof insertNovaProjectContextSchema>;
export type NovaProjectContext = typeof novaProjectContexts.$inferSelect;

// ==================== PROJECT KNOWLEDGE GRAPH ====================

// Knowledge node types for system understanding
export const knowledgeNodeTypes = [
  'decision', 'component', 'requirement', 'constraint', 'pattern',
  'entity', 'service', 'api', 'database', 'integration', 'concept'
] as const;
export type KnowledgeNodeType = typeof knowledgeNodeTypes[number];

// Knowledge edge types for relationships
export const knowledgeEdgeTypes = [
  'depends_on', 'implements', 'uses', 'extends', 'conflicts_with',
  'supersedes', 'relates_to', 'contains', 'triggers', 'validates'
] as const;
export type KnowledgeEdgeType = typeof knowledgeEdgeTypes[number];

// Project Knowledge Nodes - nodes in the knowledge graph
export const projectKnowledgeNodes = pgTable("project_knowledge_nodes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  userId: varchar("user_id").notNull(),
  
  // Node content
  nodeType: text("node_type").notNull(), // decision, component, requirement, etc.
  name: text("name").notNull(),
  nameAr: text("name_ar"), // Arabic name
  description: text("description"),
  descriptionAr: text("description_ar"), // Arabic description
  
  // Metadata for understanding
  businessIntent: text("business_intent"), // What business goal this serves
  technicalDetails: jsonb("technical_details").$type<{
    technology?: string;
    version?: string;
    configuration?: Record<string, any>;
    dependencies?: string[];
  }>(),
  
  // Embeddings for semantic search (vector representation)
  embedding: jsonb("embedding").$type<number[]>(), // Vector for similarity search
  
  // Context and evolution tracking
  createdBySession: varchar("created_by_session"), // Nova session that created this
  createdByMessage: varchar("created_by_message"), // Message that led to this
  confidence: real("confidence").default(1.0), // AI confidence in this knowledge
  isActive: boolean("is_active").notNull().default(true),
  supersededBy: varchar("superseded_by"), // If replaced by another node
  
  // Tags and categorization
  tags: jsonb("tags").$type<string[]>().default([]),
  category: text("category"), // High-level category
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("IDX_pkn_project").on(table.projectId),
  index("IDX_pkn_type").on(table.nodeType),
  index("IDX_pkn_active").on(table.isActive),
]);

export const insertProjectKnowledgeNodeSchema = createInsertSchema(projectKnowledgeNodes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertProjectKnowledgeNode = z.infer<typeof insertProjectKnowledgeNodeSchema>;
export type ProjectKnowledgeNode = typeof projectKnowledgeNodes.$inferSelect;

// Project Knowledge Edges - relationships between nodes
export const projectKnowledgeEdges = pgTable("project_knowledge_edges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  
  // Edge definition
  sourceNodeId: varchar("source_node_id").notNull(),
  targetNodeId: varchar("target_node_id").notNull(),
  edgeType: text("edge_type").notNull(), // depends_on, implements, uses, etc.
  
  // Edge metadata
  label: text("label"),
  labelAr: text("label_ar"),
  weight: real("weight").default(1.0), // Strength of relationship
  
  // Context
  reasoning: text("reasoning"), // Why this relationship exists
  createdBySession: varchar("created_by_session"),
  
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("IDX_pke_project").on(table.projectId),
  index("IDX_pke_source").on(table.sourceNodeId),
  index("IDX_pke_target").on(table.targetNodeId),
]);

export const insertProjectKnowledgeEdgeSchema = createInsertSchema(projectKnowledgeEdges).omit({
  id: true,
  createdAt: true,
});
export type InsertProjectKnowledgeEdge = z.infer<typeof insertProjectKnowledgeEdgeSchema>;
export type ProjectKnowledgeEdge = typeof projectKnowledgeEdges.$inferSelect;

// Project Event Log - Event sourcing for complete history
export const projectEventLog = pgTable("project_event_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  userId: varchar("user_id").notNull(),
  
  // Event details
  eventType: text("event_type").notNull(), // decision_made, component_added, config_changed, etc.
  eventName: text("event_name").notNull(),
  eventNameAr: text("event_name_ar"),
  
  // Event payload
  payload: jsonb("payload").$type<{
    before?: Record<string, any>;
    after?: Record<string, any>;
    changes?: Record<string, any>;
    metadata?: Record<string, any>;
  }>().notNull(),
  
  // Context tracking
  sessionId: varchar("session_id"), // Nova session
  messageId: varchar("message_id"), // Message that triggered this
  decisionId: varchar("decision_id"), // Related decision
  
  // Impact assessment
  impactLevel: text("impact_level").default("low"), // low, medium, high, critical
  affectedComponents: jsonb("affected_components").$type<string[]>().default([]),
  
  // Rollback support
  isReversible: boolean("is_reversible").notNull().default(true),
  rolledBackAt: timestamp("rolled_back_at"),
  rolledBackBy: varchar("rolled_back_by"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("IDX_pel_project").on(table.projectId),
  index("IDX_pel_type").on(table.eventType),
  index("IDX_pel_time").on(table.createdAt),
]);

export const insertProjectEventLogSchema = createInsertSchema(projectEventLog).omit({
  id: true,
  createdAt: true,
});
export type InsertProjectEventLog = z.infer<typeof insertProjectEventLogSchema>;
export type ProjectEventLog = typeof projectEventLog.$inferSelect;

// Architecture Patterns - detected and suggested patterns
export const architecturePatterns = pgTable("architecture_patterns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  
  // Pattern identification
  patternType: text("pattern_type").notNull(), // microservices, monolith, event-driven, etc.
  patternName: text("pattern_name").notNull(),
  patternNameAr: text("pattern_name_ar"),
  
  // Detection details
  isDetected: boolean("is_detected").notNull().default(true), // Auto-detected vs suggested
  isSuggested: boolean("is_suggested").notNull().default(false),
  confidence: real("confidence").default(1.0),
  
  // Pattern analysis
  description: text("description"),
  descriptionAr: text("description_ar"),
  benefits: jsonb("benefits").$type<string[]>().default([]),
  drawbacks: jsonb("drawbacks").$type<string[]>().default([]),
  
  // Anti-pattern detection
  isAntiPattern: boolean("is_anti_pattern").notNull().default(false),
  antiPatternReason: text("anti_pattern_reason"),
  suggestedFix: text("suggested_fix"),
  
  // Impact assessment
  performanceImpact: text("performance_impact"), // positive, negative, neutral
  scalabilityImpact: text("scalability_impact"),
  costImpact: text("cost_impact"),
  securityImpact: text("security_impact"),
  
  // Related components
  affectedNodes: jsonb("affected_nodes").$type<string[]>().default([]),
  
  // Status
  status: text("status").notNull().default("detected"), // detected, acknowledged, resolved, ignored
  resolvedAt: timestamp("resolved_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("IDX_ap_project").on(table.projectId),
  index("IDX_ap_type").on(table.patternType),
  index("IDX_ap_anti").on(table.isAntiPattern),
]);

export const insertArchitecturePatternSchema = createInsertSchema(architecturePatterns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertArchitecturePattern = z.infer<typeof insertArchitecturePatternSchema>;
export type ArchitecturePattern = typeof architecturePatterns.$inferSelect;

// ==================== OPERATIONS PLATFORM ====================

// Deployment configurations for projects
export const deploymentConfigs = pgTable("deployment_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  userId: varchar("user_id").notNull(),
  
  // Environment settings
  environment: text("environment").notNull().default("production"), // development, staging, production
  provider: text("provider").notNull(), // hetzner, aws, vercel, netlify, railway
  
  // Configuration
  domain: text("domain"),
  customDomain: text("custom_domain"),
  sslEnabled: boolean("ssl_enabled").notNull().default(true),
  cdnEnabled: boolean("cdn_enabled").notNull().default(false),
  
  // Auto-scaling
  autoScale: boolean("auto_scale").notNull().default(false),
  minInstances: integer("min_instances").default(1),
  maxInstances: integer("max_instances").default(5),
  
  // Health checks
  healthCheckPath: text("health_check_path").default("/health"),
  healthCheckInterval: integer("health_check_interval").default(30), // seconds
  
  // Environment variables (encrypted reference)
  envVarsRef: varchar("env_vars_ref"),
  
  // Deployment settings
  autoDeploy: boolean("auto_deploy").notNull().default(true),
  deployBranch: text("deploy_branch").default("main"),
  
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("IDX_dc_project").on(table.projectId),
  index("IDX_dc_env").on(table.environment),
]);

export const insertDeploymentConfigSchema = createInsertSchema(deploymentConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertDeploymentConfig = z.infer<typeof insertDeploymentConfigSchema>;
export type DeploymentConfig = typeof deploymentConfigs.$inferSelect;

// Deployment history
export const deployments = pgTable("deployments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  configId: varchar("config_id").notNull(),
  userId: varchar("user_id").notNull(),
  
  // Deployment details
  version: text("version").notNull(),
  commitHash: text("commit_hash"),
  commitMessage: text("commit_message"),
  
  // Status
  status: text("status").notNull().default("pending"), // pending, building, deploying, live, failed, rolled_back
  buildLogs: text("build_logs"),
  deploymentUrl: text("deployment_url"),
  
  // Timing
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  duration: integer("duration"), // seconds
  
  // Rollback info
  isRollback: boolean("is_rollback").notNull().default(false),
  rolledBackFrom: varchar("rolled_back_from"),
  
  // Metrics
  buildSize: integer("build_size"), // bytes
  assetsCount: integer("assets_count"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("IDX_dep_project").on(table.projectId),
  index("IDX_dep_status").on(table.status),
  index("IDX_dep_started").on(table.startedAt),
]);

export const insertDeploymentSchema = createInsertSchema(deployments).omit({
  id: true,
  createdAt: true,
});
export type InsertDeployment = z.infer<typeof insertDeploymentSchema>;
export type Deployment = typeof deployments.$inferSelect;

// Health monitoring alerts
export const healthAlerts = pgTable("health_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  deploymentId: varchar("deployment_id"),
  
  // Alert details
  alertType: text("alert_type").notNull(), // downtime, high_latency, high_error_rate, ssl_expiry, resource_limit
  severity: text("severity").notNull().default("warning"), // info, warning, critical
  
  // Content
  title: text("title").notNull(),
  titleAr: text("title_ar"),
  message: text("message").notNull(),
  messageAr: text("message_ar"),
  
  // Status
  status: text("status").notNull().default("active"), // active, acknowledged, resolved, auto_healed
  acknowledgedAt: timestamp("acknowledged_at"),
  acknowledgedBy: varchar("acknowledged_by"),
  resolvedAt: timestamp("resolved_at"),
  
  // Auto-healing
  autoHealAttempted: boolean("auto_heal_attempted").notNull().default(false),
  autoHealSuccess: boolean("auto_heal_success"),
  autoHealAction: text("auto_heal_action"),
  
  // Metrics at time of alert
  metrics: jsonb("metrics").$type<{
    responseTime?: number;
    errorRate?: number;
    cpuUsage?: number;
    memoryUsage?: number;
    requestCount?: number;
  }>(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("IDX_ha_project").on(table.projectId),
  index("IDX_ha_status").on(table.status),
  index("IDX_ha_severity").on(table.severity),
]);

export const insertHealthAlertSchema = createInsertSchema(healthAlerts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertHealthAlert = z.infer<typeof insertHealthAlertSchema>;
export type HealthAlert = typeof healthAlerts.$inferSelect;

// Real-time metrics snapshots
export const metricsSnapshots = pgTable("metrics_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  deploymentId: varchar("deployment_id"),
  
  // Metrics
  responseTimeAvg: real("response_time_avg"), // ms
  responseTimeP95: real("response_time_p95"),
  responseTimeP99: real("response_time_p99"),
  errorRate: real("error_rate"), // percentage
  successRate: real("success_rate"),
  requestsPerMinute: integer("requests_per_minute"),
  
  // Resources
  cpuUsage: real("cpu_usage"), // percentage
  memoryUsage: real("memory_usage"),
  diskUsage: real("disk_usage"),
  networkIn: integer("network_in"), // bytes
  networkOut: integer("network_out"),
  
  // Status
  isHealthy: boolean("is_healthy").notNull().default(true),
  activeInstances: integer("active_instances").default(1),
  
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => [
  index("IDX_ms_project").on(table.projectId),
  index("IDX_ms_timestamp").on(table.timestamp),
]);

// ==================== MULTI-SURFACE GENERATOR ====================

// Build configurations for different platforms
export const buildConfigs = pgTable("build_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  userId: varchar("user_id").notNull(),
  
  // Platform target
  platform: text("platform").notNull(), // web, android, ios, windows, macos, linux
  platformVersion: text("platform_version"), // e.g., "Android 14", "iOS 17"
  
  // Build settings
  buildType: text("build_type").notNull().default("release"), // debug, release, production
  bundleId: text("bundle_id"), // com.company.app
  appName: text("app_name").notNull(),
  appNameAr: text("app_name_ar"),
  version: text("version").default("1.0.0"),
  versionCode: integer("version_code").default(1),
  
  // Signing & Certificates
  signingConfigRef: varchar("signing_config_ref"), // Reference to secure storage
  certificateType: text("certificate_type"), // development, distribution, adhoc
  
  // Platform-specific configs
  androidConfig: jsonb("android_config").$type<{
    minSdk?: number;
    targetSdk?: number;
    permissions?: string[];
    features?: string[];
    proguard?: boolean;
  }>(),
  
  iosConfig: jsonb("ios_config").$type<{
    minimumOsVersion?: string;
    capabilities?: string[];
    entitlements?: string[];
    provisioningProfile?: string;
  }>(),
  
  desktopConfig: jsonb("desktop_config").$type<{
    architecture?: string[];
    installer?: string;
    autoUpdate?: boolean;
    deepLink?: string;
  }>(),
  
  // Resources
  iconPath: text("icon_path"),
  splashPath: text("splash_path"),
  
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("IDX_bc_project").on(table.projectId),
  index("IDX_bc_platform").on(table.platform),
]);

export const insertBuildConfigSchema = createInsertSchema(buildConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertBuildConfig = z.infer<typeof insertBuildConfigSchema>;
export type BuildConfig = typeof buildConfigs.$inferSelect;

// Build jobs for artifact generation
export const buildJobs = pgTable("build_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  configId: varchar("config_id").notNull(),
  userId: varchar("user_id").notNull(),
  
  // Build info
  platform: text("platform").notNull(),
  version: text("version").notNull(),
  
  // Status
  status: text("status").notNull().default("queued"), // queued, building, packaging, signing, completed, failed
  progress: integer("progress").default(0), // 0-100
  currentStep: text("current_step"),
  currentStepAr: text("current_step_ar"),
  
  // Logs
  buildLogs: text("build_logs"),
  errorMessage: text("error_message"),
  
  // Artifacts
  artifacts: jsonb("artifacts").$type<{
    type: string; // apk, aab, ipa, exe, dmg, appimage, deb
    url: string;
    size: number;
    checksum: string;
  }[]>().default([]),
  
  // Timing
  queuedAt: timestamp("queued_at").defaultNow().notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  duration: integer("duration"), // seconds
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("IDX_bj_project").on(table.projectId),
  index("IDX_bj_status").on(table.status),
  index("IDX_bj_platform").on(table.platform),
]);

export const insertBuildJobSchema = createInsertSchema(buildJobs).omit({
  id: true,
  createdAt: true,
});
export type InsertBuildJob = z.infer<typeof insertBuildJobSchema>;
export type BuildJob = typeof buildJobs.$inferSelect;

// ==================== UNIFIED BLUEPRINT SYSTEM ====================

// Unified blueprints that generate all surfaces
export const unifiedBlueprints = pgTable("unified_blueprints", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  userId: varchar("user_id").notNull(),
  
  // Blueprint identity
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  version: text("version").default("1.0.0"),
  
  // Source of truth - the unified definition
  definition: jsonb("definition").$type<{
    entities: {
      name: string;
      fields: { name: string; type: string; required?: boolean; }[];
      relationships?: { entity: string; type: string; }[];
    }[];
    screens: {
      name: string;
      type: string; // list, detail, form, dashboard
      entity?: string;
      components?: { type: string; props?: Record<string, any>; }[];
    }[];
    navigation: {
      type: string; // tabs, drawer, stack
      routes: { name: string; screen: string; icon?: string; }[];
    };
    theme?: {
      primaryColor: string;
      secondaryColor: string;
      fontFamily?: string;
    };
    features?: string[]; // auth, push_notifications, offline, analytics
  }>().notNull(),
  
  // Generation status per surface
  generatedSurfaces: jsonb("generated_surfaces").$type<{
    web?: { status: string; lastGenerated?: string; };
    android?: { status: string; lastGenerated?: string; };
    ios?: { status: string; lastGenerated?: string; };
    windows?: { status: string; lastGenerated?: string; };
    macos?: { status: string; lastGenerated?: string; };
  }>().default({}),
  
  // Validation
  isValid: boolean("is_valid").notNull().default(false),
  validationErrors: jsonb("validation_errors").$type<string[]>().default([]),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("IDX_ub_project").on(table.projectId),
  index("IDX_ub_version").on(table.version),
]);

export const insertUnifiedBlueprintSchema = createInsertSchema(unifiedBlueprints).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertUnifiedBlueprint = z.infer<typeof insertUnifiedBlueprintSchema>;
export type UnifiedBlueprint = typeof unifiedBlueprints.$inferSelect;

// ==================== SOVEREIGN SSH VAULT ====================
// Enterprise-grade encrypted SSH key management with triple authentication

// Vault access levels
export const vaultAccessLevels = ['view', 'use', 'manage', 'admin'] as const;
export type VaultAccessLevel = typeof vaultAccessLevels[number];

// SSH Key types
export const sshKeyTypes = ['rsa', 'ed25519', 'ecdsa', 'dsa'] as const;
export type SSHKeyType = typeof sshKeyTypes[number];

// SSH Keys Vault - Encrypted storage with AES-256-GCM
export const sshVault = pgTable("ssh_vault", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Key identification
  name: text("name").notNull(),
  description: text("description"),
  serverHost: text("server_host"), // hostname or IP
  serverPort: integer("server_port").default(22),
  serverUsername: text("server_username"),
  keyType: text("key_type").notNull().default("ed25519"), // rsa, ed25519, ecdsa
  keyFingerprint: text("key_fingerprint"), // SHA256 fingerprint
  
  // Encrypted key data (AES-256-GCM encrypted)
  encryptedPrivateKey: text("encrypted_private_key").notNull(), // Base64 encrypted
  encryptedPublicKey: text("encrypted_public_key"), // Base64 encrypted
  encryptedPassphrase: text("encrypted_passphrase"), // If key has passphrase
  
  // Encryption metadata
  encryptionVersion: integer("encryption_version").notNull().default(1),
  encryptionSalt: text("encryption_salt").notNull(), // For key derivation
  encryptionIV: text("encryption_iv").notNull(), // Initialization vector
  
  // Access control
  accessLevel: text("access_level").notNull().default("manage"),
  allowedIPs: jsonb("allowed_ips").$type<string[]>().default([]), // IP whitelist
  allowedOperations: jsonb("allowed_operations").$type<string[]>().default(['connect', 'deploy', 'manage']),
  
  // Usage tracking
  lastUsedAt: timestamp("last_used_at"),
  usageCount: integer("usage_count").default(0),
  
  // Expiry and rotation
  expiresAt: timestamp("expires_at"),
  rotatedAt: timestamp("rotated_at"),
  rotationReminder: boolean("rotation_reminder").default(true),
  
  // Status
  isActive: boolean("is_active").notNull().default(true),
  isRevoked: boolean("is_revoked").notNull().default(false),
  revokedAt: timestamp("revoked_at"),
  revokedBy: varchar("revoked_by"),
  revokedReason: text("revoked_reason"),
  
  // Tags for organization
  tags: jsonb("tags").$type<string[]>().default([]),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("IDX_sshv_user").on(table.userId),
  index("IDX_sshv_fingerprint").on(table.keyFingerprint),
  index("IDX_sshv_host").on(table.serverHost),
]);

export const insertSSHVaultSchema = createInsertSchema(sshVault).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSSHVault = z.infer<typeof insertSSHVaultSchema>;
export type SSHVault = typeof sshVault.$inferSelect;

// Vault Access Sessions - Triple authentication tracking
export const vaultAccessSessions = pgTable("vault_access_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Session identification
  sessionToken: text("session_token").notNull().unique(), // Hashed session token
  
  // Triple authentication status
  passwordVerified: boolean("password_verified").notNull().default(false),
  passwordVerifiedAt: timestamp("password_verified_at"),
  
  totpVerified: boolean("totp_verified").notNull().default(false),
  totpVerifiedAt: timestamp("totp_verified_at"),
  
  emailCodeVerified: boolean("email_code_verified").notNull().default(false),
  emailCodeVerifiedAt: timestamp("email_code_verified_at"),
  emailCode: text("email_code"), // Hashed email verification code
  emailCodeExpiresAt: timestamp("email_code_expires_at"),
  
  // Session metadata
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  deviceFingerprint: text("device_fingerprint"),
  
  // Session status
  isFullyAuthenticated: boolean("is_fully_authenticated").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastActivityAt: timestamp("last_activity_at").defaultNow().notNull(),
}, (table) => [
  index("IDX_vas_user").on(table.userId),
  index("IDX_vas_token").on(table.sessionToken),
  index("IDX_vas_active").on(table.isActive),
]);

export const insertVaultAccessSessionSchema = createInsertSchema(vaultAccessSessions).omit({
  id: true,
  createdAt: true,
});
export type InsertVaultAccessSession = z.infer<typeof insertVaultAccessSessionSchema>;
export type VaultAccessSession = typeof vaultAccessSessions.$inferSelect;

// Vault Audit Log - Immutable audit trail
export const vaultAuditLog = pgTable("vault_audit_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  keyId: varchar("key_id"),
  sessionId: varchar("session_id"),
  
  // Action details
  action: text("action").notNull(), // create, view, use, update, delete, export, revoke
  actionDetail: text("action_detail"),
  
  // Security context
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  geoLocation: text("geo_location"),
  
  // Result
  success: boolean("success").notNull(),
  errorMessage: text("error_message"),
  
  // Immutable timestamp
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("IDX_val_user").on(table.userId),
  index("IDX_val_key").on(table.keyId),
  index("IDX_val_action").on(table.action),
  index("IDX_val_created").on(table.createdAt),
]);

export const insertVaultAuditLogSchema = createInsertSchema(vaultAuditLog).omit({
  id: true,
  createdAt: true,
});
export type InsertVaultAuditLog = z.infer<typeof insertVaultAuditLogSchema>;
export type VaultAuditLog = typeof vaultAuditLog.$inferSelect;
