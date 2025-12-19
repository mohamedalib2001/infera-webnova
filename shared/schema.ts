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
export const userRoles = ['free', 'basic', 'pro', 'enterprise', 'sovereign', 'owner'] as const;
export type UserRole = typeof userRoles[number];

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

// ==================== SUBSCRIPTION PLANS ====================

// Subscription plans table
export const subscriptionPlans = pgTable("subscription_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // Free, Basic, Pro, Enterprise, Sovereign
  nameAr: text("name_ar").notNull(), // الاسم بالعربي
  description: text("description"),
  descriptionAr: text("description_ar"),
  role: text("role").notNull(), // maps to user role
  priceMonthly: integer("price_monthly").notNull().default(0), // in cents/smallest unit
  priceQuarterly: integer("price_quarterly").notNull().default(0),
  priceSemiAnnual: integer("price_semi_annual").notNull().default(0),
  priceYearly: integer("price_yearly").notNull().default(0),
  currency: text("currency").notNull().default("USD"),
  features: jsonb("features").$type<string[]>().notNull().default([]),
  featuresAr: jsonb("features_ar").$type<string[]>().notNull().default([]),
  maxProjects: integer("max_projects").notNull().default(1),
  maxPagesPerProject: integer("max_pages_per_project").notNull().default(5),
  aiGenerationsPerMonth: integer("ai_generations_per_month").notNull().default(10),
  customDomain: boolean("custom_domain").notNull().default(false),
  whiteLabel: boolean("white_label").notNull().default(false),
  prioritySupport: boolean("priority_support").notNull().default(false),
  analyticsAccess: boolean("analytics_access").notNull().default(false),
  chatbotBuilder: boolean("chatbot_builder").notNull().default(false),
  teamMembers: integer("team_members").notNull().default(1),
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
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords"),
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

// Templates table
export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  category: text("category").notNull(),
  industry: text("industry"), // e-commerce, services, education, legal, etc.
  htmlCode: text("html_code").notNull(),
  cssCode: text("css_code").notNull(),
  jsCode: text("js_code").notNull(),
  thumbnail: text("thumbnail"),
  isPremium: boolean("is_premium").notNull().default(false),
  requiredPlan: text("required_plan").notNull().default("free"),
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
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

// Development Project Types
export const devProjectTypes = ['nodejs', 'python', 'html', 'react', 'fullstack'] as const;
export type DevProjectType = typeof devProjectTypes[number];

// Development Projects - Cloud IDE projects with multi-file support
export const devProjects = pgTable("dev_projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  // Project info
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  projectType: text("project_type").notNull().default("nodejs"), // nodejs, python, html, react, fullstack
  language: text("language").notNull().default("ar"), // UI language
  // Runtime config
  entryFile: text("entry_file").default("index.js"),
  port: integer("port").default(3000),
  envVariables: jsonb("env_variables").$type<Record<string, string>>().default({}),
  // Status
  status: text("status").notNull().default("stopped"), // stopped, starting, running, error
  lastRunAt: timestamp("last_run_at"),
  // Deployment
  isPublished: boolean("is_published").notNull().default(false),
  publishedUrl: text("published_url"),
  subdomain: text("subdomain"),
  // Metadata
  thumbnail: text("thumbnail"),
  tags: jsonb("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDevProjectSchema = createInsertSchema(devProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDevProject = z.infer<typeof insertDevProjectSchema>;
export type DevProject = typeof devProjects.$inferSelect;

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

// Custom Domains table - النطاقات المخصصة
export const customDomains = pgTable("custom_domains", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(), // المستأجر/المشترك
  projectId: varchar("project_id"), // المشروع المرتبط (اختياري)
  hostname: text("hostname").notNull().unique(), // النطاق الكامل مثل www.example.com
  rootDomain: text("root_domain").notNull(), // النطاق الجذر مثل example.com
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
  const perms = infrastructureRolePermissions[role];
  return perms.includes('*') || perms.includes(permission as any);
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
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_server_provider").on(table.providerId),
  index("IDX_server_status").on(table.status),
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
// بوابة التكامل الخارجي (Replit وغيرها)

export const externalIntegrationSessions = pgTable("external_integration_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // معلومات الجلسة
  partnerName: text("partner_name").notNull(), // replit, github_copilot, etc.
  partnerDisplayName: text("partner_display_name").notNull(),
  
  // الغرض
  purpose: text("purpose").notNull(), // development_support, diagnostic, emergency, testing
  purposeDescription: text("purpose_description").notNull(),
  purposeDescriptionAr: text("purpose_description_ar"),
  
  // الصلاحيات
  permissions: jsonb("permissions").$type<{
    type: string; // read, write, execute
    scope: string; // code, logs, config, database
    resources: string[];
  }[]>().notNull(),
  
  // القيود
  restrictions: jsonb("restrictions").$type<{
    noAccessTo: string[];
    maxDuration: number; // minutes
    requireApproval: boolean;
    sandboxOnly: boolean;
  }>().notNull(),
  
  // الحالة
  status: text("status").notNull().default("inactive"), // inactive, pending_activation, active, expired, revoked
  
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

