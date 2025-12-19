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
  maxProjects: integer("max_projects").default(1),
  maxStorage: integer("max_storage").default(100), // in MB
  maxBandwidth: integer("max_bandwidth").default(1000), // in MB
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;

// ==================== NAMECHEAP DOMAINS ====================

// Domain status types
export const domainStatuses = ['active', 'expired', 'pending', 'locked', 'redemption', 'deleted'] as const;
export type DomainStatus = typeof domainStatuses[number];

// DNS record types
export const dnsRecordTypes = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'URL', 'URL301', 'FRAME'] as const;
export type DnsRecordType = typeof dnsRecordTypes[number];

// Domains table - Synced with Namecheap
export const domains = pgTable("domains", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Namecheap identifiers
  namecheapId: text("namecheap_id"), // ID from Namecheap
  domainName: text("domain_name").notNull().unique(),
  sld: text("sld").notNull(), // Second Level Domain (e.g., "example")
  tld: text("tld").notNull(), // Top Level Domain (e.g., "com")
  
  // Ownership
  ownerId: varchar("owner_id").references(() => users.id, { onDelete: "set null" }),
  
  // Status
  status: text("status").notNull().default("pending"), // active, expired, pending, locked, redemption, deleted
  isLocked: boolean("is_locked").notNull().default(false),
  isAutoRenew: boolean("is_auto_renew").notNull().default(true),
  isPremium: boolean("is_premium").notNull().default(false),
  whoisGuard: boolean("whois_guard").notNull().default(true),
  
  // Dates
  expiresAt: timestamp("expires_at"),
  registeredAt: timestamp("registered_at"),
  
  // Nameservers
  nameservers: jsonb("nameservers").$type<string[]>().default(sql`'[]'::jsonb`),
  useCustomNameservers: boolean("use_custom_nameservers").notNull().default(false),
  
  // Contact info (stored encrypted reference)
  registrantContactId: varchar("registrant_contact_id"),
  adminContactId: varchar("admin_contact_id"),
  techContactId: varchar("tech_contact_id"),
  billingContactId: varchar("billing_contact_id"),
  
  // Pricing
  registrationPrice: real("registration_price"),
  renewalPrice: real("renewal_price"),
  currency: text("currency").default("USD"),
  
  // Sync metadata
  lastSyncAt: timestamp("last_sync_at"),
  syncError: text("sync_error"),
  
  // Notes
  notes: text("notes"),
  tags: jsonb("tags").$type<string[]>().default(sql`'[]'::jsonb`),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_domain_owner").on(table.ownerId),
  index("IDX_domain_status").on(table.status),
  index("IDX_domain_expires").on(table.expiresAt),
]);

export const insertDomainSchema = createInsertSchema(domains).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDomain = z.infer<typeof insertDomainSchema>;
export type Domain = typeof domains.$inferSelect;

// DNS Records table
export const dnsRecords = pgTable("dns_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  domainId: varchar("domain_id").references(() => domains.id, { onDelete: "cascade" }).notNull(),
  
  // Record details
  hostName: text("host_name").notNull(), // @ for root, subdomain name, or *
  recordType: text("record_type").notNull(), // A, AAAA, CNAME, MX, TXT, NS, URL, URL301, FRAME
  address: text("address").notNull(), // IP address, hostname, or value
  
  // Optional fields
  mxPref: integer("mx_pref"), // Priority for MX records (1-100)
  ttl: integer("ttl").notNull().default(1800), // Time to live in seconds
  
  // For URL redirects
  isActive: boolean("is_active").notNull().default(true),
  
  // Tracking
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_dns_domain").on(table.domainId),
  index("IDX_dns_type").on(table.recordType),
]);

export const insertDnsRecordSchema = createInsertSchema(dnsRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDnsRecord = z.infer<typeof insertDnsRecordSchema>;
export type DnsRecord = typeof dnsRecords.$inferSelect;

// Domain-Platform linkage table
export const domainPlatforms = pgTable("domain_platforms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  domainId: varchar("domain_id").references(() => domains.id, { onDelete: "cascade" }).notNull(),
  platformId: varchar("platform_id").notNull(), // Reference to sovereign platform
  
  // Subdomain config (null = root domain)
  subdomain: text("subdomain"), // www, api, app, etc.
  
  // Target configuration
  targetType: text("target_type").notNull().default("server"), // server, cname, redirect
  targetAddress: text("target_address").notNull(), // IP or hostname
  targetPort: integer("target_port"), // Optional port
  
  // SSL
  sslEnabled: boolean("ssl_enabled").notNull().default(true),
  sslCertificateId: varchar("ssl_certificate_id"),
  sslExpiresAt: timestamp("ssl_expires_at"),
  
  // Status
  isActive: boolean("is_active").notNull().default(true),
  verificationStatus: text("verification_status").notNull().default("pending"), // pending, verified, failed
  verifiedAt: timestamp("verified_at"),
  
  // Notes
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_dp_domain").on(table.domainId),
  index("IDX_dp_platform").on(table.platformId),
]);

export const insertDomainPlatformSchema = createInsertSchema(domainPlatforms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDomainPlatform = z.infer<typeof insertDomainPlatformSchema>;
export type DomainPlatform = typeof domainPlatforms.$inferSelect;

// Domain contacts table (encrypted storage)
export const domainContacts = pgTable("domain_contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  ownerId: varchar("owner_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // Contact type
  contactType: text("contact_type").notNull().default("registrant"), // registrant, admin, tech, billing
  isDefault: boolean("is_default").notNull().default(false),
  
  // Contact details (should be encrypted in production)
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  organization: text("organization"),
  jobTitle: text("job_title"),
  
  address1: text("address1").notNull(),
  address2: text("address2"),
  city: text("city").notNull(),
  stateProvince: text("state_province").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull(), // ISO 2-letter code
  
  phone: text("phone").notNull(), // Format: +1.1234567890
  fax: text("fax"),
  email: text("email").notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_contact_owner").on(table.ownerId),
]);

export const insertDomainContactSchema = createInsertSchema(domainContacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDomainContact = z.infer<typeof insertDomainContactSchema>;
export type DomainContact = typeof domainContacts.$inferSelect;

// Domain audit logs
export const domainAuditLogs = pgTable("domain_audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  domainId: varchar("domain_id").references(() => domains.id, { onDelete: "set null" }),
  domainName: text("domain_name").notNull(), // Store name in case domain is deleted
  
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  userEmail: text("user_email"),
  
  action: text("action").notNull(), // register, renew, transfer, dns_update, nameserver_change, etc.
  actionDetails: jsonb("action_details").$type<Record<string, unknown>>(),
  
  // Result
  success: boolean("success").notNull().default(true),
  errorMessage: text("error_message"),
  
  // Request metadata
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_domain_audit_domain").on(table.domainId),
  index("IDX_domain_audit_user").on(table.userId),
  index("IDX_domain_audit_action").on(table.action),
  index("IDX_domain_audit_created").on(table.createdAt),
]);

export const insertDomainAuditLogSchema = createInsertSchema(domainAuditLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertDomainAuditLog = z.infer<typeof insertDomainAuditLogSchema>;
export type DomainAuditLog = typeof domainAuditLogs.$inferSelect;

// ==================== PROJECTS ====================

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull().default("website"), // website, webapp, api, mobile
  framework: text("framework"), // react, vue, angular, etc.
  isPublic: boolean("is_public").notNull().default(false),
  status: text("status").notNull().default("draft"), // draft, active, published, archived
  thumbnail: text("thumbnail"),
  settings: jsonb("settings").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_project_user").on(table.userId),
  index("IDX_project_status").on(table.status),
]);

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// ==================== FILES ====================

export const files = pgTable("files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  path: text("path").notNull(),
  type: text("type").notNull(), // file, folder
  mimeType: text("mime_type"),
  content: text("content"),
  size: integer("size").default(0),
  parentId: varchar("parent_id"),
  isDirectory: boolean("is_directory").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_file_project").on(table.projectId),
  index("IDX_file_parent").on(table.parentId),
]);

export const insertFileSchema = createInsertSchema(files).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertFile = z.infer<typeof insertFileSchema>;
export type File = typeof files.$inferSelect;

// ==================== AI CONVERSATIONS ====================

export const aiConversations = pgTable("ai_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: text("title"),
  messages: jsonb("messages").$type<Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>>().default([]),
  context: jsonb("context").$type<{
    currentFile?: string;
    selectedCode?: string;
    language?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_conversation_project").on(table.projectId),
  index("IDX_conversation_user").on(table.userId),
]);

export const insertAiConversationSchema = createInsertSchema(aiConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAiConversation = z.infer<typeof insertAiConversationSchema>;
export type AiConversation = typeof aiConversations.$inferSelect;

// ==================== TEMPLATES ====================

export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  category: text("category").notNull(), // landing, portfolio, ecommerce, blog, admin, etc.
  type: text("type").notNull().default("website"), // website, component, section
  thumbnail: text("thumbnail"),
  previewUrl: text("preview_url"),
  files: jsonb("files").$type<Array<{
    name: string;
    path: string;
    content: string;
    type: string;
  }>>().default([]),
  tags: jsonb("tags").$type<string[]>().default([]),
  framework: text("framework"), // react, vue, html, etc.
  isPublic: boolean("is_public").notNull().default(true),
  isPremium: boolean("is_premium").notNull().default(false),
  downloads: integer("downloads").default(0),
  rating: real("rating").default(0),
  createdBy: varchar("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_template_category").on(table.category),
  index("IDX_template_type").on(table.type),
]);

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templates.$inferSelect;

// ==================== COMPONENTS ====================

export const components = pgTable("components", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  category: text("category").notNull(), // navigation, hero, features, footer, forms, cards, etc.
  code: text("code").notNull(),
  preview: text("preview"), // HTML preview or screenshot URL
  props: jsonb("props").$type<Array<{
    name: string;
    type: string;
    default?: unknown;
    description?: string;
  }>>().default([]),
  tags: jsonb("tags").$type<string[]>().default([]),
  framework: text("framework").notNull().default("react"),
  isPublic: boolean("is_public").notNull().default(true),
  isPremium: boolean("is_premium").notNull().default(false),
  downloads: integer("downloads").default(0),
  createdBy: varchar("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_component_category").on(table.category),
]);

export const insertComponentSchema = createInsertSchema(components).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertComponent = z.infer<typeof insertComponentSchema>;
export type Component = typeof components.$inferSelect;

// ==================== DEPLOYMENTS ====================

export const deployments = pgTable("deployments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  environment: text("environment").notNull().default("production"), // production, staging, preview
  status: text("status").notNull().default("pending"), // pending, building, deploying, success, failed
  url: text("url"),
  customDomain: text("custom_domain"),
  buildLogs: text("build_logs"),
  errorMessage: text("error_message"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_deployment_project").on(table.projectId),
  index("IDX_deployment_status").on(table.status),
]);

export const insertDeploymentSchema = createInsertSchema(deployments).omit({
  id: true,
  createdAt: true,
});

export type InsertDeployment = z.infer<typeof insertDeploymentSchema>;
export type Deployment = typeof deployments.$inferSelect;

// ==================== SERVICE PROVIDERS ====================

// External service providers table
export const serviceProviders = pgTable("service_providers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Provider identification
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  slug: text("slug").notNull().unique(), // openai, stripe, twilio, etc.
  
  // Category
  category: text("category").notNull(), // ai, payment, communication, cloud, analytics, search, media, maps
  categoryAr: text("category_ar").notNull(),
  
  // Display info
  description: text("description"),
  descriptionAr: text("description_ar"),
  icon: text("icon"), // Icon name or URL
  website: text("website"),
  docsUrl: text("docs_url"),
  
  // Configuration schema
  configSchema: jsonb("config_schema").$type<{
    apiKeyRequired: boolean;
    fields: Array<{
      name: string;
      type: 'text' | 'password' | 'select' | 'boolean';
      label: string;
      labelAr: string;
      required: boolean;
      options?: string[];
    }>;
  }>(),
  
  // Status
  isActive: boolean("is_active").notNull().default(true),
  isBuiltIn: boolean("is_built_in").notNull().default(false),
  
  // Pricing info
  hasFreesTier: boolean("has_free_tier").notNull().default(false),
  pricingUrl: text("pricing_url"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_provider_category").on(table.category),
  index("IDX_provider_slug").on(table.slug),
]);

export const insertServiceProviderSchema = createInsertSchema(serviceProviders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertServiceProvider = z.infer<typeof insertServiceProviderSchema>;
export type ServiceProvider = typeof serviceProviders.$inferSelect;

// User provider configurations
export const userProviderConfigs = pgTable("user_provider_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  providerId: varchar("provider_id").references(() => serviceProviders.id, { onDelete: "cascade" }).notNull(),
  
  // Encrypted API key (use crypto service)
  encryptedApiKey: text("encrypted_api_key"),
  
  // Additional config
  config: jsonb("config").$type<Record<string, unknown>>().default({}),
  
  // Status
  isActive: boolean("is_active").notNull().default(true),
  lastUsedAt: timestamp("last_used_at"),
  
  // Usage tracking
  totalRequests: integer("total_requests").default(0),
  totalCost: real("total_cost").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_upc_user").on(table.userId),
  index("IDX_upc_provider").on(table.providerId),
]);

export const insertUserProviderConfigSchema = createInsertSchema(userProviderConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUserProviderConfig = z.infer<typeof insertUserProviderConfigSchema>;
export type UserProviderConfig = typeof userProviderConfigs.$inferSelect;

// ==================== RESOURCE USAGE ====================

export const resourceUsage = pgTable("resource_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  projectId: varchar("project_id").references(() => projects.id, { onDelete: "set null" }),
  
  // Resource type
  resourceType: text("resource_type").notNull(), // storage, bandwidth, ai_tokens, api_calls, etc.
  
  // Usage
  quantity: real("quantity").notNull(),
  unit: text("unit").notNull(), // MB, GB, tokens, requests, etc.
  
  // Cost (if applicable)
  cost: real("cost").default(0),
  currency: text("currency").default("USD"),
  
  // Period
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  
  // Provider (if external)
  providerId: varchar("provider_id").references(() => serviceProviders.id, { onDelete: "set null" }),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_usage_user").on(table.userId),
  index("IDX_usage_type").on(table.resourceType),
  index("IDX_usage_period").on(table.periodStart, table.periodEnd),
]);

export const insertResourceUsageSchema = createInsertSchema(resourceUsage).omit({
  id: true,
  createdAt: true,
});

export type InsertResourceUsage = z.infer<typeof insertResourceUsageSchema>;
export type ResourceUsage = typeof resourceUsage.$inferSelect;

// ==================== COLLABORATION ====================

export const projectCollaborators = pgTable("project_collaborators", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  projectId: varchar("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // Role in project
  role: text("role").notNull().default("viewer"), // owner, editor, viewer
  
  // Permissions
  canEdit: boolean("can_edit").notNull().default(false),
  canDeploy: boolean("can_deploy").notNull().default(false),
  canInvite: boolean("can_invite").notNull().default(false),
  canDelete: boolean("can_delete").notNull().default(false),
  
  // Invitation
  invitedBy: varchar("invited_by").references(() => users.id, { onDelete: "set null" }),
  invitedAt: timestamp("invited_at").defaultNow(),
  acceptedAt: timestamp("accepted_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_collab_project").on(table.projectId),
  index("IDX_collab_user").on(table.userId),
]);

export const insertProjectCollaboratorSchema = createInsertSchema(projectCollaborators).omit({
  id: true,
  createdAt: true,
});

export type InsertProjectCollaborator = z.infer<typeof insertProjectCollaboratorSchema>;
export type ProjectCollaborator = typeof projectCollaborators.$inferSelect;

// ==================== NOTIFICATIONS ====================

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // Notification content
  title: text("title").notNull(),
  titleAr: text("title_ar"),
  message: text("message").notNull(),
  messageAr: text("message_ar"),
  
  // Type and priority
  type: text("type").notNull().default("info"), // info, success, warning, error
  category: text("category").notNull().default("system"), // system, project, billing, security
  
  // Action
  actionUrl: text("action_url"),
  actionLabel: text("action_label"),
  
  // Status
  isRead: boolean("is_read").notNull().default(false),
  readAt: timestamp("read_at"),
  
  // Related entities
  projectId: varchar("project_id").references(() => projects.id, { onDelete: "set null" }),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_notif_user").on(table.userId),
  index("IDX_notif_read").on(table.isRead),
]);

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// ==================== AUDIT LOGS ====================

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Actor
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  userEmail: text("user_email"),
  userRole: text("user_role"),
  
  // Action
  action: text("action").notNull(), // create, update, delete, login, logout, etc.
  resource: text("resource").notNull(), // project, file, user, deployment, etc.
  resourceId: varchar("resource_id"),
  
  // Details
  details: jsonb("details").$type<Record<string, unknown>>(),
  previousState: jsonb("previous_state").$type<Record<string, unknown>>(),
  newState: jsonb("new_state").$type<Record<string, unknown>>(),
  
  // Metadata
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_audit_user").on(table.userId),
  index("IDX_audit_action").on(table.action),
  index("IDX_audit_resource").on(table.resource),
  index("IDX_audit_created").on(table.createdAt),
]);

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

// ==================== AI ANALYSIS ====================

export const aiAnalyses = pgTable("ai_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  projectId: varchar("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // Analysis type
  type: text("type").notNull(), // code_review, performance, security, accessibility, seo
  
  // Results
  score: integer("score"), // 0-100
  issues: jsonb("issues").$type<Array<{
    severity: 'error' | 'warning' | 'info';
    message: string;
    messageAr?: string;
    file?: string;
    line?: number;
    suggestion?: string;
    suggestioAr?: string;
  }>>().default([]),
  
  summary: text("summary"),
  summaryAr: text("summary_ar"),
  
  // Metadata
  filesAnalyzed: integer("files_analyzed").default(0),
  tokensUsed: integer("tokens_used").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_analysis_project").on(table.projectId),
  index("IDX_analysis_type").on(table.type),
]);

export const insertAiAnalysisSchema = createInsertSchema(aiAnalyses).omit({
  id: true,
  createdAt: true,
});

export type InsertAiAnalysis = z.infer<typeof insertAiAnalysisSchema>;
export type AiAnalysis = typeof aiAnalyses.$inferSelect;

// ==================== PLATFORM SETTINGS ====================

export const platformSettings = pgTable("platform_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  key: text("key").notNull().unique(),
  value: jsonb("value"),
  
  // Metadata
  category: text("category").notNull().default("general"), // general, security, email, ai, billing
  description: text("description"),
  descriptionAr: text("description_ar"),
  
  // Access control
  isPublic: boolean("is_public").notNull().default(false), // Can be read by non-owners
  
  updatedBy: varchar("updated_by").references(() => users.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_settings_key").on(table.key),
  index("IDX_settings_category").on(table.category),
]);

export const insertPlatformSettingSchema = createInsertSchema(platformSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPlatformSetting = z.infer<typeof insertPlatformSettingSchema>;
export type PlatformSetting = typeof platformSettings.$inferSelect;

// ==================== FEEDBACK ====================

export const feedback = pgTable("feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  userEmail: text("user_email"),
  
  // Feedback content
  type: text("type").notNull(), // bug, feature, improvement, other
  category: text("category"), // ui, performance, ai, deployment, etc.
  
  title: text("title").notNull(),
  description: text("description").notNull(),
  
  // Rating (optional)
  rating: integer("rating"), // 1-5
  
  // Status
  status: text("status").notNull().default("new"), // new, reviewed, in_progress, resolved, closed
  
  // Response
  response: text("response"),
  respondedBy: varchar("responded_by").references(() => users.id, { onDelete: "set null" }),
  respondedAt: timestamp("responded_at"),
  
  // Attachments
  attachments: jsonb("attachments").$type<string[]>().default([]),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_feedback_user").on(table.userId),
  index("IDX_feedback_type").on(table.type),
  index("IDX_feedback_status").on(table.status),
]);

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
});

export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedback.$inferSelect;

// ==================== INFRASTRUCTURE - PROVIDERS ====================

// Supported cloud provider types
export const cloudProviderTypes = ['hetzner', 'aws', 'gcp', 'azure', 'digitalocean'] as const;
export type CloudProviderType = typeof cloudProviderTypes[number];

// Infrastructure provider credentials table
export const infrastructureProviders = pgTable("infrastructure_providers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Provider identification
  name: text("name").notNull(),
  provider: text("provider").notNull(), // hetzner, aws, gcp, azure, digitalocean
  
  // Encrypted credentials
  encryptedApiToken: text("encrypted_api_token"), // For simple API token auth
  encryptedCredentials: jsonb("encrypted_credentials").$type<Record<string, string>>(), // For complex auth
  
  // Status
  isActive: boolean("is_active").notNull().default(true),
  lastVerifiedAt: timestamp("last_verified_at"),
  verificationError: text("verification_error"),
  
  // Owner
  ownerId: varchar("owner_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // Metadata
  region: text("region"),
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_infra_provider_owner").on(table.ownerId),
  index("IDX_infra_provider_type").on(table.provider),
]);

export const insertInfrastructureProviderSchema = createInsertSchema(infrastructureProviders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertInfrastructureProvider = z.infer<typeof insertInfrastructureProviderSchema>;
export type InfrastructureProvider = typeof infrastructureProviders.$inferSelect;

// ==================== INFRASTRUCTURE - SERVERS ====================

// Server status types
export const serverStatuses = ['running', 'stopped', 'starting', 'stopping', 'rebuilding', 'migrating', 'error', 'unknown'] as const;
export type ServerStatus = typeof serverStatuses[number];

// Infrastructure servers table - synced from providers
export const infrastructureServers = pgTable("infrastructure_servers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Provider link
  providerId: varchar("provider_id").references(() => infrastructureProviders.id, { onDelete: "cascade" }).notNull(),
  
  // External ID from provider
  externalId: text("external_id").notNull(),
  
  // Server info
  name: text("name").notNull(),
  status: text("status").notNull().default("unknown"),
  
  // Specs
  serverType: text("server_type"), // e.g., cx11, cx21 for Hetzner
  cores: integer("cores"),
  memory: integer("memory"), // in MB
  disk: integer("disk"), // in GB
  
  // Network
  publicIpv4: text("public_ipv4"),
  publicIpv6: text("public_ipv6"),
  privateIpv4: text("private_ipv4"),
  
  // Location
  datacenter: text("datacenter"),
  location: text("location"),
  country: text("country"),
  
  // Image
  osImage: text("os_image"),
  osVersion: text("os_version"),
  
  // Costs
  hourlyPrice: real("hourly_price"),
  monthlyPrice: real("monthly_price"),
  currency: text("currency").default("EUR"),
  
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
  syncStatus: text("sync_status").default("synced"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_infra_server_provider").on(table.providerId),
  index("IDX_infra_server_status").on(table.status),
  index("IDX_infra_server_external").on(table.externalId),
]);

export const insertInfrastructureServerSchema = createInsertSchema(infrastructureServers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertInfrastructureServer = z.infer<typeof insertInfrastructureServerSchema>;
export type InfrastructureServer = typeof infrastructureServers.$inferSelect;

// ==================== INFRASTRUCTURE - AUDIT LOGS ====================

// Infrastructure audit log for tracking all operations
export const infrastructureAuditLogs = pgTable("infrastructure_audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // User who performed the action
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  userEmail: text("user_email"),
  userRole: text("user_role"),
  
  // Target
  providerId: varchar("provider_id").references(() => infrastructureProviders.id, { onDelete: "set null" }),
  serverId: varchar("server_id").references(() => infrastructureServers.id, { onDelete: "set null" }),
  
  // Action details
  action: text("action").notNull(), // create_server, delete_server, start, stop, reboot, etc.
  actionCategory: text("action_category").notNull().default("server"), // server, provider, network, backup
  
  // Request/Response
  requestPayload: jsonb("request_payload").$type<Record<string, unknown>>(),
  responsePayload: jsonb("response_payload").$type<Record<string, unknown>>(),
  
  // Result
  success: boolean("success").notNull().default(true),
  errorMessage: text("error_message"),
  errorCode: text("error_code"),
  
  // Metadata
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  duration: integer("duration"), // in milliseconds
  
  // Immutable - created only, never updated
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_infra_audit_user").on(table.userId),
  index("IDX_infra_audit_provider").on(table.providerId),
  index("IDX_infra_audit_server").on(table.serverId),
  index("IDX_infra_audit_action").on(table.action),
  index("IDX_infra_audit_created").on(table.createdAt),
]);

export const insertInfrastructureAuditLogSchema = createInsertSchema(infrastructureAuditLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertInfrastructureAuditLog = z.infer<typeof insertInfrastructureAuditLogSchema>;
export type InfrastructureAuditLog = typeof infrastructureAuditLogs.$inferSelect;

// ==================== INFRASTRUCTURE - PROVIDER ERROR LOGS ====================

// Provider-specific error logging for debugging and monitoring
export const providerErrorLogs = pgTable("provider_error_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  providerId: varchar("provider_id").references(() => infrastructureProviders.id, { onDelete: "cascade" }).notNull(),
  
  // Error details
  operation: text("operation").notNull(), // sync, create_server, api_call, etc.
  errorType: text("error_type").notNull(), // api_error, timeout, auth_failed, rate_limit, etc.
  errorMessage: text("error_message").notNull(),
  errorCode: text("error_code"),
  
  // Context
  requestUrl: text("request_url"),
  requestMethod: text("request_method"),
  requestPayload: jsonb("request_payload").$type<Record<string, unknown>>(),
  responseStatus: integer("response_status"),
  responseBody: text("response_body"),
  
  // Retry info
  retryCount: integer("retry_count").default(0),
  willRetry: boolean("will_retry").default(false),
  
  // Severity
  severity: text("severity").notNull().default("error"), // warning, error, critical
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_provider_error_provider").on(table.providerId),
  index("IDX_provider_error_type").on(table.errorType),
  index("IDX_provider_error_severity").on(table.severity),
  index("IDX_provider_error_created").on(table.createdAt),
]);

export const insertProviderErrorLogSchema = createInsertSchema(providerErrorLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertProviderErrorLog = z.infer<typeof insertProviderErrorLogSchema>;
export type ProviderErrorLog = typeof providerErrorLogs.$inferSelect;

// ==================== AI SMART SUGGESTIONS ====================

// نظام الاقتراحات الذكية - AI-powered code analysis suggestions
export const aiSuggestions = pgTable("ai_suggestions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // المشروع والمستخدم
  projectId: varchar("project_id").notNull(),
  userId: varchar("user_id").notNull(),
  
  // تفاصيل الاقتراح
  category: text("category").notNull(), // performance, security, best_practice, accessibility, seo
  title: text("title").notNull(),
  titleAr: text("title_ar").notNull(),
  description: text("description").notNull(),
  descriptionAr: text("description_ar").notNull(),
  
  // الموقع في الكود
  filePath: text("file_path").notNull(),
  lineStart: integer("line_start"),
  lineEnd: integer("line_end"),
  codeSnippet: text("code_snippet"),
  
  // الإصلاح المقترح
  suggestedFix: text("suggested_fix"),
  suggestedFixAr: text("suggested_fix_ar"),
  fixCode: text("fix_code"),
  
  // التقييم
  priority: text("priority").notNull().default("medium"), // low, medium, high, critical
  confidence: real("confidence").default(0.8), // 0-1
  impact: text("impact"), // وصف التأثير
  impactAr: text("impact_ar"),
  
  // الحالة
  status: text("status").notNull().default("pending"), // pending, applied, dismissed, deferred
  appliedAt: timestamp("applied_at"),
  appliedBy: varchar("applied_by"),
  dismissedAt: timestamp("dismissed_at"),
  dismissReason: text("dismiss_reason"),
  
  // التحليل
  analysisId: varchar("analysis_id"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_suggestion_project").on(table.projectId),
  index("IDX_suggestion_category").on(table.category),
  index("IDX_suggestion_status").on(table.status),
  index("IDX_suggestion_priority").on(table.priority),
]);

export const insertAiSuggestionSchema = createInsertSchema(aiSuggestions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAiSuggestion = z.infer<typeof insertAiSuggestionSchema>;
export type AiSuggestion = typeof aiSuggestions.$inferSelect;

// قواعد التحليل المخصصة
export const analysisRules = pgTable("analysis_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // تعريف القاعدة
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
