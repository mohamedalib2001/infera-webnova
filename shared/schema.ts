import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ==================== USERS & AUTH ====================

// User roles enum
export const userRoles = ['free', 'basic', 'pro', 'enterprise', 'sovereign'] as const;
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
