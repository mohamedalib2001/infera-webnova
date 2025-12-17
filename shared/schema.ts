import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ==================== USERS & AUTH ====================

// User roles enum - owner is platform owner (highest level)
export const userRoles = ['free', 'basic', 'pro', 'enterprise', 'sovereign', 'owner'] as const;
export type UserRole = typeof userRoles[number];

// Users table - Extended with roles and subscription info
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  avatar: text("avatar"),
  role: text("role").notNull().default("free"), // free, basic, pro, enterprise, sovereign
  isActive: boolean("is_active").notNull().default(true),
  emailVerified: boolean("email_verified").notNull().default(false),
  language: text("language").notNull().default("ar"), // ar, en
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
