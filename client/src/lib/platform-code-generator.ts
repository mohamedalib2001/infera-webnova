import type { LucideIcon } from "lucide-react";

export interface PlatformSpec {
  name: string;
  nameAr: string;
  type: 'ecommerce' | 'education' | 'social' | 'saas' | 'marketplace' | 'custom';
  features: string[];
  hasAuth: boolean;
  hasSubscriptions: boolean;
  hasPayments: boolean;
  hasDashboard: boolean;
  databases: DatabaseSpec[];
  microservices: MicroserviceSpec[];
}

export interface DatabaseSpec {
  name: string;
  type: 'postgresql' | 'mongodb' | 'redis';
  tables: TableSpec[];
}

export interface TableSpec {
  name: string;
  columns: ColumnSpec[];
}

export interface ColumnSpec {
  name: string;
  type: string;
  nullable?: boolean;
  unique?: boolean;
  references?: string;
}

export interface MicroserviceSpec {
  id: string;
  name: string;
  type: string;
  port: number;
  endpoints: EndpointSpec[];
}

export interface EndpointSpec {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
}

export interface GeneratedCode {
  fileName: string;
  filePath: string;
  language: 'typescript' | 'tsx' | 'sql' | 'yaml' | 'dockerfile' | 'json';
  content: string;
  category: 'frontend' | 'backend' | 'database' | 'infrastructure' | 'config';
}

export function generatePlatformCode(spec: PlatformSpec): GeneratedCode[] {
  const files: GeneratedCode[] = [];
  
  files.push(...generateDatabaseSchemas(spec));
  files.push(...generateAuthSystem(spec));
  files.push(...generateLandingPage(spec));
  files.push(...generateDashboard(spec));
  if (spec.hasSubscriptions) {
    files.push(...generateSubscriptionSystem(spec));
  }
  if (spec.hasPayments) {
    files.push(...generatePaymentSystem(spec));
  }
  files.push(...generateAPIRoutes(spec));
  files.push(...generateDockerFiles(spec));
  files.push(...generateKubernetesManifests(spec));
  
  return files;
}

function generateDatabaseSchemas(spec: PlatformSpec): GeneratedCode[] {
  const files: GeneratedCode[] = [];
  
  const unifiedSchema = `
import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, decimal, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// ============================================
// USERS & AUTHENTICATION
// ============================================
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: text("password").notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  avatar: text("avatar"),
  phone: varchar("phone", { length: 20 }),
  role: varchar("role", { length: 50 }).default("subscriber").notNull(),
  emailVerified: boolean("email_verified").default(false),
  phoneVerified: boolean("phone_verified").default(false),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  emailIdx: index("users_email_idx").on(table.email),
  roleIdx: index("users_role_idx").on(table.role),
}));

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  token: text("token").unique().notNull(),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address", { length: 45 }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("sessions_user_id_idx").on(table.userId),
  tokenIdx: index("sessions_token_idx").on(table.token),
}));

// ============================================
// SUBSCRIPTION & BILLING
// ============================================
export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }),
  description: text("description"),
  descriptionAr: text("description_ar"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  interval: varchar("interval", { length: 20 }).default("monthly").notNull(),
  intervalCount: integer("interval_count").default(1).notNull(),
  trialDays: integer("trial_days").default(0),
  features: jsonb("features").$type<string[]>().default([]),
  limits: jsonb("limits").$type<Record<string, number>>(),
  stripeProductId: text("stripe_product_id"),
  stripePriceId: text("stripe_price_id"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  planId: integer("plan_id").references(() => plans.id).notNull(),
  status: varchar("status", { length: 20 }).default("active").notNull(),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripeCustomerId: text("stripe_customer_id"),
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  canceledAt: timestamp("canceled_at"),
  trialStart: timestamp("trial_start"),
  trialEnd: timestamp("trial_end"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("subscriptions_user_id_idx").on(table.userId),
  statusIdx: index("subscriptions_status_idx").on(table.status),
}));

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  subscriptionId: integer("subscription_id").references(() => subscriptions.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeInvoiceId: text("stripe_invoice_id"),
  receiptUrl: text("receipt_url"),
  failureReason: text("failure_reason"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("payments_user_id_idx").on(table.userId),
  statusIdx: index("payments_status_idx").on(table.status),
}));

// ============================================
// CONTENT MANAGEMENT
// ============================================
export const content = pgTable("content", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("title_ar", { length: 255 }),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  type: varchar("type", { length: 50 }).default("page").notNull(),
  body: text("body"),
  bodyAr: text("body_ar"),
  excerpt: text("excerpt"),
  excerptAr: text("excerpt_ar"),
  featuredImage: text("featured_image"),
  authorId: integer("author_id").references(() => users.id),
  status: varchar("status", { length: 20 }).default("draft").notNull(),
  publishedAt: timestamp("published_at"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  seo: jsonb("seo").$type<{ title?: string; description?: string; keywords?: string[] }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  slugIdx: index("content_slug_idx").on(table.slug),
  typeIdx: index("content_type_idx").on(table.type),
  statusIdx: index("content_status_idx").on(table.status),
}));

// ============================================
// PLATFORM SETTINGS
// ============================================
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).unique().notNull(),
  value: jsonb("value").notNull(),
  category: varchar("category", { length: 50 }).default("general"),
  description: text("description"),
  isPublic: boolean("is_public").default(false),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// RELATIONS
// ============================================
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  subscriptions: many(subscriptions),
  payments: many(payments),
  content: many(content),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
  plan: one(plans, { fields: [subscriptions.planId], references: [plans.id] }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, { fields: [payments.userId], references: [users.id] }),
  subscription: one(subscriptions, { fields: [payments.subscriptionId], references: [subscriptions.id] }),
}));

export const contentRelations = relations(content, ({ one }) => ({
  author: one(users, { fields: [content.authorId], references: [users.id] }),
}));

// ============================================
// ZOD SCHEMAS & TYPES
// ============================================
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, createdAt: true, updatedAt: true, lastLoginAt: true 
});
export const insertSessionSchema = createInsertSchema(sessions).omit({ id: true, createdAt: true });
export const insertPlanSchema = createInsertSchema(plans).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true });
export const insertContentSchema = createInsertSchema(content).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSettingSchema = createInsertSchema(settings).omit({ id: true, updatedAt: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Session = typeof sessions.$inferSelect;
export type Plan = typeof plans.$inferSelect;
export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Content = typeof content.$inferSelect;
export type InsertContent = z.infer<typeof insertContentSchema>;
export type Setting = typeof settings.$inferSelect;
`;

  files.push({
    fileName: 'schema.ts',
    filePath: 'shared/schema.ts',
    language: 'typescript',
    content: unifiedSchema,
    category: 'database'
  });
  
  const dbConnection = `
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@shared/schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on("error", (err) => {
  console.error("Unexpected database pool error:", err);
});

export const db = drizzle(pool, { schema });

export async function testConnection() {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    console.log("Database connected successfully");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}
`;

  files.push({
    fileName: 'db.ts',
    filePath: 'server/db.ts',
    language: 'typescript',
    content: dbConnection,
    category: 'database'
  });
  
  const migrations = `
-- Migration: Initial Schema
-- Generated for: ${spec.name}

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar TEXT,
  phone VARCHAR(20),
  role VARCHAR(50) DEFAULT 'subscriber' NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMP,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  token TEXT UNIQUE NOT NULL,
  user_agent TEXT,
  ip_address VARCHAR(45),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_ar VARCHAR(100),
  description TEXT,
  description_ar TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD' NOT NULL,
  interval VARCHAR(20) DEFAULT 'monthly' NOT NULL,
  interval_count INTEGER DEFAULT 1 NOT NULL,
  trial_days INTEGER DEFAULT 0,
  features JSONB DEFAULT '[]',
  limits JSONB,
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  plan_id INTEGER REFERENCES plans(id) NOT NULL,
  status VARCHAR(20) DEFAULT 'active' NOT NULL,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP,
  trial_start TIMESTAMP,
  trial_end TIMESTAMP,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  subscription_id INTEGER REFERENCES subscriptions(id),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD' NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' NOT NULL,
  payment_method VARCHAR(50),
  stripe_payment_intent_id TEXT,
  stripe_invoice_id TEXT,
  receipt_url TEXT,
  failure_reason TEXT,
  metadata JSONB,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS content (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255),
  slug VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(50) DEFAULT 'page' NOT NULL,
  body TEXT,
  body_ar TEXT,
  excerpt TEXT,
  excerpt_ar TEXT,
  featured_image TEXT,
  author_id INTEGER REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'draft' NOT NULL,
  published_at TIMESTAMP,
  metadata JSONB,
  seo JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  category VARCHAR(50) DEFAULT 'general',
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_token_idx ON sessions(token);
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON subscriptions(status);
CREATE INDEX IF NOT EXISTS payments_user_id_idx ON payments(user_id);
CREATE INDEX IF NOT EXISTS payments_status_idx ON payments(status);
CREATE INDEX IF NOT EXISTS content_slug_idx ON content(slug);
CREATE INDEX IF NOT EXISTS content_type_idx ON content(type);
CREATE INDEX IF NOT EXISTS content_status_idx ON content(status);

-- Seed initial plans
INSERT INTO plans (name, name_ar, description, price, interval, features) VALUES
  ('Free', 'مجاني', 'Basic features for getting started', 0, 'monthly', '["5 projects", "Basic support", "1GB storage"]'),
  ('Pro', 'احترافي', 'Advanced features for professionals', 29.99, 'monthly', '["Unlimited projects", "Priority support", "50GB storage", "API access"]'),
  ('Enterprise', 'مؤسسات', 'Full features for large organizations', 99.99, 'monthly', '["Unlimited everything", "24/7 support", "Unlimited storage", "Custom integrations", "SLA"]')
ON CONFLICT DO NOTHING;
`;

  files.push({
    fileName: '001_initial_schema.sql',
    filePath: 'migrations/001_initial_schema.sql',
    language: 'sql',
    content: migrations,
    category: 'database'
  });


  if (spec.type === 'ecommerce') {
    const ecommerceSchema = `
import { pgTable, text, serial, integer, boolean, timestamp, varchar, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./schema-users";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  description: text("description"),
  image: text("image"),
  parentId: integer("parent_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  comparePrice: numeric("compare_price", { precision: 10, scale: 2 }),
  sku: varchar("sku", { length: 100 }).unique(),
  stock: integer("stock").default(0),
  images: text("images").array(),
  categoryId: integer("category_id").references(() => categories.id),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("order_number", { length: 50 }).unique().notNull(),
  userId: integer("user_id").references(() => users.id),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: numeric("tax", { precision: 10, scale: 2 }).default("0"),
  shipping: numeric("shipping", { precision: 10, scale: 2 }).default("0"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  shippingAddress: jsonb("shipping_address"),
  billingAddress: jsonb("billing_address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cart = pgTable("cart", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  sessionId: varchar("session_id", { length: 255 }),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Cart = typeof cart.$inferSelect;
`;

    files.push({
      fileName: 'schema-ecommerce.ts',
      filePath: 'shared/schema-ecommerce.ts',
      language: 'typescript',
      content: ecommerceSchema,
      category: 'database'
    });
  }

  if (spec.type === 'education') {
    const educationSchema = `
import { pgTable, text, serial, integer, boolean, timestamp, varchar, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./schema-users";

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("title_ar", { length: 255 }),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  description: text("description"),
  thumbnail: text("thumbnail"),
  instructorId: integer("instructor_id").references(() => users.id),
  price: numeric("price", { precision: 10, scale: 2 }).default("0"),
  duration: integer("duration"),
  level: varchar("level", { length: 50 }).default("beginner"),
  category: varchar("category", { length: 100 }),
  isPublished: boolean("is_published").default(false),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("title_ar", { length: 255 }),
  content: text("content"),
  videoUrl: text("video_url"),
  duration: integer("duration"),
  orderIndex: integer("order_index").default(0),
  isFree: boolean("is_free").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  progress: integer("progress").default(0),
  completedLessons: integer("completed_lessons").array(),
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Course = typeof courses.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type Enrollment = typeof enrollments.$inferSelect;
export type Review = typeof reviews.$inferSelect;
`;

    files.push({
      fileName: 'schema-education.ts',
      filePath: 'shared/schema-education.ts',
      language: 'typescript',
      content: educationSchema,
      category: 'database'
    });
  }

  return files;
}

function generateAuthSystem(spec: PlatformSpec): GeneratedCode[] {
  const files: GeneratedCode[] = [];

  const loginPage = `
import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const res = await apiRequest("POST", "/api/auth/login", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Login failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/me"], data.user);
      toast({ title: "Welcome back!", description: "You have been logged in successfully." });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-purple-100 dark:from-zinc-900 dark:to-zinc-800 p-4" data-testid="page-login">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl" data-testid="text-login-title">Welcome Back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => loginMutation.mutate(data))} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input {...field} type="email" placeholder="you@example.com" className="pl-10" data-testid="input-email" />
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input {...field} type={showPassword ? "text" : "password"} placeholder="Enter your password" className="pl-10 pr-10" data-testid="input-password" />
                        <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loginMutation.isPending} data-testid="button-login">
                {loginMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...</> : "Sign In"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 text-center text-sm text-muted-foreground">
          <a href="/forgot-password" className="hover:text-primary">Forgot your password?</a>
          <p>Don't have an account? <a href="/register" className="text-primary hover:underline">Sign up</a></p>
        </CardFooter>
      </Card>
    </div>
  );
}
`;

  files.push({
    fileName: 'login.tsx',
    filePath: 'client/src/pages/auth/login.tsx',
    language: 'tsx',
    content: loginPage,
    category: 'frontend'
  });

  const registerPage = `
import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, User, Eye, EyeOff, Check } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "", confirmPassword: "" },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterForm) => {
      const res = await apiRequest("POST", "/api/auth/register", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Registration failed");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Account created!", description: "Please check your email to verify your account." });
      setLocation("/login");
    },
    onError: (error: Error) => {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-purple-100 dark:from-zinc-900 dark:to-zinc-800 p-4" data-testid="page-register">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl" data-testid="text-register-title">Create Account</CardTitle>
          <CardDescription>Join us and start your journey</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => registerMutation.mutate(data))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="John" data-testid="input-firstname" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Doe" data-testid="input-lastname" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input {...field} type="email" placeholder="you@example.com" className="pl-10" data-testid="input-email" />
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input {...field} type={showPassword ? "text" : "password"} placeholder="Create a strong password" className="pl-10 pr-10" data-testid="input-password" />
                        <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="Confirm your password" data-testid="input-confirm-password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={registerMutation.isPending} data-testid="button-register">
                {registerMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating account...</> : "Create Account"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground">
          <p className="w-full">Already have an account? <a href="/login" className="text-primary hover:underline">Sign in</a></p>
        </CardFooter>
      </Card>
    </div>
  );
}
`;

  files.push({
    fileName: 'register.tsx',
    filePath: 'client/src/pages/auth/register.tsx',
    language: 'tsx',
    content: registerPage,
    category: 'frontend'
  });

  const authRoutes = `
import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { db } from "./db";
import { users, sessions, insertUserSchema } from "@shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = insertUserSchema.extend({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

router.post("/register", async (req: Request, res: Response) => {
  try {
    const validated = registerSchema.safeParse(req.body);
    if (!validated.success) {
      return res.status(400).json({ error: validated.error.errors[0].message });
    }

    const { email, password, firstName, lastName } = validated.data;

    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const [newUser] = await db.insert(users).values({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    }).returning();

    res.status(201).json({ message: "Account created successfully", userId: newUser.id });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Failed to create account" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const validated = loginSchema.safeParse(req.body);
    if (!validated.success) {
      return res.status(400).json({ error: "Invalid email or password format" });
    }

    const { email, password } = validated.data;

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.insert(sessions).values({
      userId: user.id,
      token,
      expiresAt,
    });

    res.cookie("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
    });

    res.json({
      message: "Login successful",
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

router.post("/logout", async (req: Request, res: Response) => {
  try {
    const token = req.cookies.session_token;
    if (token) {
      await db.delete(sessions).where(eq(sessions.token, token));
    }
    res.clearCookie("session_token");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to logout" });
  }
});

router.get("/me", async (req: Request, res: Response) => {
  try {
    const token = req.cookies.session_token;
    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const [session] = await db.select().from(sessions).where(eq(sessions.token, token)).limit(1);
    if (!session || new Date(session.expiresAt) < new Date()) {
      return res.status(401).json({ error: "Session expired" });
    }

    const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatar: user.avatar,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to get user" });
  }
});

export default router;
`;

  files.push({
    fileName: 'auth.ts',
    filePath: 'server/routes/auth.ts',
    language: 'typescript',
    content: authRoutes,
    category: 'backend'
  });

  return files;
}

function generateLandingPage(spec: PlatformSpec): GeneratedCode[] {
  const files: GeneratedCode[] = [];

  const landingPage = `
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Check, Star, Users, Zap, Shield, Globe, Sparkles } from "lucide-react";

const features = [
  { icon: Zap, title: "Lightning Fast", description: "Optimized for speed and performance" },
  { icon: Shield, title: "Secure by Default", description: "Enterprise-grade security built-in" },
  { icon: Globe, title: "Global Scale", description: "Deploy anywhere in the world" },
  { icon: Users, title: "Team Collaboration", description: "Built for teams of any size" },
];

const plans = [
  { name: "Starter", price: 0, features: ["5 Projects", "Basic Analytics", "Community Support", "1GB Storage"] },
  { name: "Pro", price: 29, popular: true, features: ["Unlimited Projects", "Advanced Analytics", "Priority Support", "100GB Storage", "Custom Domain", "API Access"] },
  { name: "Enterprise", price: 99, features: ["Everything in Pro", "Dedicated Support", "SLA Guarantee", "Unlimited Storage", "Custom Integrations", "On-premise Option"] },
];

const testimonials = [
  { name: "Sarah Johnson", role: "CEO, TechStart", content: "This platform transformed how we build products. Highly recommended!", rating: 5 },
  { name: "Michael Chen", role: "CTO, InnovateCo", content: "The best investment we made this year. Our team productivity doubled.", rating: 5 },
  { name: "Emily Davis", role: "Product Lead, GrowthLabs", content: "Incredible features and amazing support. Couldn't ask for more.", rating: 5 },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">${spec.name}</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="hover:text-primary">Features</a>
            <a href="#pricing" className="hover:text-primary">Pricing</a>
            <a href="#testimonials" className="hover:text-primary">Testimonials</a>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild><a href="/login">Sign In</a></Button>
            <Button asChild><a href="/register">Get Started</a></Button>
          </div>
        </div>
      </nav>

      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-4">Launching Soon</Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Build Something Amazing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            The all-in-one platform to create, deploy, and scale your digital products with unprecedented speed and reliability.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button size="lg" className="gap-2" asChild>
              <a href="/register">Start Free Trial <ArrowRight className="w-4 h-4" /></a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#features">Learn More</a>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">No credit card required. 14-day free trial.</p>
        </div>
      </section>

      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Everything you need to build and grow your business</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <Card key={i} className="text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-muted-foreground">Choose the plan that works for you</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <Card key={i} className={\`relative \${plan.popular ? 'border-violet-500 shadow-lg' : ''}\`}>
                {plan.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>}
                <CardContent className="pt-8">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">\${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={plan.popular ? "default" : "outline"}>Get Started</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-muted-foreground">Join thousands of satisfied customers</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm mb-4">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of teams already using our platform to build amazing products.
          </p>
          <Button size="lg" className="gap-2" asChild>
            <a href="/register">Start Your Free Trial <ArrowRight className="w-4 h-4" /></a>
          </Button>
        </div>
      </section>

      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-500" />
              <span className="font-semibold">${spec.name}</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 ${spec.name}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
`;

  files.push({
    fileName: 'landing.tsx',
    filePath: 'client/src/pages/landing.tsx',
    language: 'tsx',
    content: landingPage,
    category: 'frontend'
  });

  return files;
}

function generateDashboard(spec: PlatformSpec): GeneratedCode[] {
  const files: GeneratedCode[] = [];

  const dashboard = `
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Users, DollarSign, Activity, TrendingUp, ArrowUpRight, ArrowDownRight, BarChart3, Calendar, Settings, Bell } from "lucide-react";

const stats = [
  { title: "Total Users", value: "12,543", change: "+12%", up: true, icon: Users },
  { title: "Revenue", value: "$45,231", change: "+8%", up: true, icon: DollarSign },
  { title: "Active Sessions", value: "2,345", change: "-3%", up: false, icon: Activity },
  { title: "Growth Rate", value: "23%", change: "+5%", up: true, icon: TrendingUp },
];

const recentActivity = [
  { user: "John Doe", action: "Created new project", time: "2 min ago" },
  { user: "Jane Smith", action: "Upgraded to Pro", time: "15 min ago" },
  { user: "Bob Johnson", action: "Invited 3 team members", time: "1 hour ago" },
  { user: "Alice Brown", action: "Published new app", time: "2 hours ago" },
];

export default function DashboardPage() {
  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" data-testid="button-notifications">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" data-testid="button-settings">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Welcome back{user?.firstName ? \`, \${user.firstName}\` : ''}!</h2>
          <p className="text-muted-foreground">Here's what's happening with your platform today.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <Badge variant="outline" className={\`gap-1 \${stat.up ? 'text-green-600' : 'text-red-600'}\`}>
                    {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {stat.change}
                  </Badge>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.title}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Analytics Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">Chart placeholder - integrate with Recharts</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{activity.user}</div>
                      <div className="text-xs text-muted-foreground">{activity.action}</div>
                      <div className="text-xs text-muted-foreground">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
`;

  files.push({
    fileName: 'dashboard.tsx',
    filePath: 'client/src/pages/dashboard/index.tsx',
    language: 'tsx',
    content: dashboard,
    category: 'frontend'
  });

  return files;
}

function generateSubscriptionSystem(spec: PlatformSpec): GeneratedCode[] {
  const files: GeneratedCode[] = [];

  const subscriptionRoutes = `
import { Router, Request, Response } from "express";
import Stripe from "stripe";
import { db } from "./db";
import { plans, subscriptions } from "@shared/schema-subscriptions";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });
const router = Router();

router.get("/plans", async (req: Request, res: Response) => {
  try {
    const allPlans = await db.select().from(plans).where(eq(plans.isActive, true));
    res.json(allPlans);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch plans" });
  }
});

router.post("/create-checkout", async (req: Request, res: Response) => {
  try {
    const { planId, userId } = req.body;
    const [plan] = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);
    
    if (!plan || !plan.stripePriceId) {
      return res.status(404).json({ error: "Plan not found" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      success_url: \`\${process.env.BASE_URL}/dashboard?subscription=success\`,
      cancel_url: \`\${process.env.BASE_URL}/pricing?subscription=cancelled\`,
      metadata: { userId: userId.toString(), planId: planId.toString() },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

router.post("/webhook", async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"]!;
  
  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const { userId, planId } = session.metadata!;
      
      await db.insert(subscriptions).values({
        userId: parseInt(userId),
        planId: parseInt(planId),
        stripeSubscriptionId: session.subscription as string,
        status: "active",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      await db.update(subscriptions)
        .set({ status: "cancelled", canceledAt: new Date() })
        .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(400).json({ error: "Webhook error" });
  }
});

router.get("/my-subscription", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const [subscription] = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(subscriptions.createdAt)
      .limit(1);

    res.json(subscription || null);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch subscription" });
  }
});

router.post("/cancel", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const [subscription] = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);

    if (!subscription?.stripeSubscriptionId) {
      return res.status(404).json({ error: "No active subscription" });
    }

    await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    await db.update(subscriptions)
      .set({ status: "cancelled", canceledAt: new Date() })
      .where(eq(subscriptions.id, subscription.id));

    res.json({ message: "Subscription cancelled" });
  } catch (error) {
    res.status(500).json({ error: "Failed to cancel subscription" });
  }
});

export default router;
`;

  files.push({
    fileName: 'subscriptions.ts',
    filePath: 'server/routes/subscriptions.ts',
    language: 'typescript',
    content: subscriptionRoutes,
    category: 'backend'
  });

  return files;
}

function generatePaymentSystem(spec: PlatformSpec): GeneratedCode[] {
  const files: GeneratedCode[] = [];
  
  if (!spec.hasPayments) return files;
  
  const stripeWebhook = `
import { Router } from "express";
import Stripe from "stripe";
import { db } from "../db";
import { payments, subscriptions, users } from "@shared/schema";
import { eq } from "drizzle-orm";

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-12-18.acacia" });
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

router.post("/stripe", async (req, res) => {
  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return res.status(400).send("Webhook Error: Invalid signature");
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = parseInt(session.metadata?.userId || "0");
        const planId = parseInt(session.metadata?.planId || "0");
        
        if (userId && planId) {
          await db.insert(subscriptions).values({
            userId,
            planId,
            status: "active",
            stripeSubscriptionId: session.subscription as string,
            stripeCustomerId: session.customer as string,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          });
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        
        const [subscription] = await db.select().from(subscriptions)
          .where(eq(subscriptions.stripeCustomerId, customerId));
        
        if (subscription) {
          await db.insert(payments).values({
            userId: subscription.userId,
            subscriptionId: subscription.id,
            amount: (invoice.amount_paid / 100).toFixed(2),
            currency: invoice.currency.toUpperCase(),
            status: "completed",
            stripeInvoiceId: invoice.id,
            receiptUrl: invoice.hosted_invoice_url || undefined,
            paidAt: new Date(),
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await db.update(subscriptions)
          .set({ status: "cancelled", canceledAt: new Date() })
          .where(eq(subscriptions.stripeSubscriptionId, sub.id));
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

export default router;
`;

  files.push({
    fileName: 'webhooks.ts',
    filePath: 'server/routes/webhooks.ts',
    language: 'typescript',
    content: stripeWebhook,
    category: 'backend'
  });

  return files;
}

function generateAPIRoutes(spec: PlatformSpec): GeneratedCode[] {
  const files: GeneratedCode[] = [];

  const mainRoutes = `
import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import authRoutes from "./routes/auth";
${spec.hasSubscriptions ? 'import subscriptionRoutes from "./routes/subscriptions";' : ''}
${spec.hasPayments ? 'import webhookRoutes from "./routes/webhooks";' : ''}

const router = Router();

router.use("/auth", authRoutes);
${spec.hasSubscriptions ? 'router.use("/subscriptions", subscriptionRoutes);' : ''}
${spec.hasPayments ? 'router.use("/webhooks", webhookRoutes);' : ''}

router.get("/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development"
  });
});

router.get("/platform/branding", async (req, res) => {
  try {
    const { db } = await import("../db");
    const { settings } = await import("@shared/schema");
    const { eq, or } = await import("drizzle-orm");
    
    const brandingSettings = await db.select().from(settings)
      .where(or(
        eq(settings.key, "platform_name"),
        eq(settings.key, "platform_logo"),
        eq(settings.key, "primary_color"),
        eq(settings.key, "secondary_color")
      ));
    
    const branding = brandingSettings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, unknown>);
    
    res.json(branding);
  } catch (error) {
    res.status(500).json({ error: "Failed to load branding" });
  }
});

function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error("API Error:", err);
  
  if (err instanceof z.ZodError) {
    return res.status(400).json({ 
      error: "Validation failed", 
      details: err.errors.map(e => ({ path: e.path.join("."), message: e.message }))
    });
  }
  
  res.status(500).json({ error: "Internal server error" });
}

router.use(errorHandler);

export default router;
`;

  files.push({
    fileName: 'index.ts',
    filePath: 'server/routes/index.ts',
    language: 'typescript',
    content: mainRoutes,
    category: 'backend'
  });
  
  const serverIndex = `
import express from "express";
import cors from "cors";
import session from "express-session";
import routes from "./routes";
import { testConnection } from "./db";

const app = express();
const PORT = parseInt(process.env.PORT || "5000");

app.use(cors({
  origin: process.env.NODE_ENV === "production" 
    ? process.env.ALLOWED_ORIGINS?.split(",") 
    : ["http://localhost:5173", "http://localhost:5000"],
  credentials: true,
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || "change-me-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: "lax",
  },
}));

app.use("/api", routes);

async function start() {
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error("Failed to connect to database. Exiting...");
    process.exit(1);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(\`Server running on http://0.0.0.0:\${PORT}\`);
  });
}

start();
`;

  files.push({
    fileName: 'index.ts',
    filePath: 'server/index.ts',
    language: 'typescript',
    content: serverIndex,
    category: 'backend'
  });

  return files;
}

function generateDockerFiles(spec: PlatformSpec): GeneratedCode[] {
  const files: GeneratedCode[] = [];

  const dockerfile = `
FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production

FROM base AS builder
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

EXPOSE 5000
CMD ["node", "dist/server/index.js"]
`;

  files.push({
    fileName: 'Dockerfile',
    filePath: 'Dockerfile',
    language: 'dockerfile',
    content: dockerfile,
    category: 'infrastructure'
  });

  const dockerCompose = `
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=\${DATABASE_URL}
      - SESSION_SECRET=\${SESSION_SECRET}
      ${spec.hasSubscriptions ? '- STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}' : ''}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=\${POSTGRES_USER:-app}
      - POSTGRES_PASSWORD=\${POSTGRES_PASSWORD:-secret}
      - POSTGRES_DB=\${POSTGRES_DB:-${spec.name.toLowerCase().replace(/\s+/g, '_')}}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
`;

  files.push({
    fileName: 'docker-compose.yml',
    filePath: 'docker-compose.yml',
    language: 'yaml',
    content: dockerCompose,
    category: 'infrastructure'
  });

  return files;
}

function generateKubernetesManifests(spec: PlatformSpec): GeneratedCode[] {
  const files: GeneratedCode[] = [];

  const deployment = `
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${spec.name.toLowerCase().replace(/\s+/g, '-')}-app
  labels:
    app: ${spec.name.toLowerCase().replace(/\s+/g, '-')}
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ${spec.name.toLowerCase().replace(/\s+/g, '-')}
  template:
    metadata:
      labels:
        app: ${spec.name.toLowerCase().replace(/\s+/g, '-')}
    spec:
      containers:
      - name: app
        image: ${spec.name.toLowerCase().replace(/\s+/g, '-')}:latest
        ports:
        - containerPort: 5000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: ${spec.name.toLowerCase().replace(/\s+/g, '-')}-secrets
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        readinessProbe:
          httpGet:
            path: /api/health
            port: 5000
          initialDelaySeconds: 5
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /api/health
            port: 5000
          initialDelaySeconds: 15
          periodSeconds: 20
---
apiVersion: v1
kind: Service
metadata:
  name: ${spec.name.toLowerCase().replace(/\s+/g, '-')}-service
spec:
  type: ClusterIP
  ports:
  - port: 80
    targetPort: 5000
  selector:
    app: ${spec.name.toLowerCase().replace(/\s+/g, '-')}
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ${spec.name.toLowerCase().replace(/\s+/g, '-')}-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - ${spec.name.toLowerCase().replace(/\s+/g, '-')}.example.com
    secretName: ${spec.name.toLowerCase().replace(/\s+/g, '-')}-tls
  rules:
  - host: ${spec.name.toLowerCase().replace(/\s+/g, '-')}.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: ${spec.name.toLowerCase().replace(/\s+/g, '-')}-service
            port:
              number: 80
`;

  files.push({
    fileName: 'k8s-deployment.yaml',
    filePath: 'k8s/deployment.yaml',
    language: 'yaml',
    content: deployment,
    category: 'infrastructure'
  });

  return files;
}

export function generatePackageJson(spec: PlatformSpec): string {
  return JSON.stringify({
    name: spec.name.toLowerCase().replace(/\s+/g, '-'),
    version: "1.0.0",
    private: true,
    scripts: {
      dev: "tsx watch server/index.ts",
      build: "vite build && tsc",
      start: "node dist/server/index.js",
      "db:push": "drizzle-kit push",
      "db:migrate": "drizzle-kit migrate"
    },
    dependencies: {
      "express": "^4.18.2",
      "drizzle-orm": "^0.29.0",
      "postgres": "^3.4.0",
      "bcryptjs": "^2.4.3",
      "zod": "^3.22.4",
      "@tanstack/react-query": "^5.0.0",
      "react": "^18.2.0",
      "react-dom": "^18.2.0",
      "wouter": "^3.0.0",
      ...(spec.hasSubscriptions ? { "stripe": "^14.0.0" } : {}),
    },
    devDependencies: {
      "typescript": "^5.3.0",
      "vite": "^5.0.0",
      "@vitejs/plugin-react": "^4.2.0",
      "drizzle-kit": "^0.20.0",
      "tsx": "^4.7.0",
      "@types/express": "^4.17.21",
      "@types/bcryptjs": "^2.4.6",
    }
  }, null, 2);
}
