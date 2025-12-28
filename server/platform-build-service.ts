import { promises as fs } from 'fs';
import path from 'path';
import archiver from 'archiver';
import { Writable } from 'stream';

export interface PlatformSpec {
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  sector: string;
  features: string[];
  hasAuth?: boolean;
  hasPayments?: boolean;
  hasSubscriptions?: boolean;
  hasCMS?: boolean;
  hasAnalytics?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface GeneratedFile {
  fileName: string;
  filePath: string;
  content: string;
  language: string;
  category: string;
}

export interface BuildResult {
  id: string;
  status: 'building' | 'complete' | 'error';
  platform: PlatformSpec;
  files: GeneratedFile[];
  downloadUrl?: string;
  error?: string;
  createdAt: Date;
}

const builds = new Map<string, BuildResult>();

export async function buildPlatform(spec: PlatformSpec): Promise<BuildResult> {
  const buildId = `build_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  const result: BuildResult = {
    id: buildId,
    status: 'building',
    platform: spec,
    files: [],
    createdAt: new Date()
  };
  
  builds.set(buildId, result);
  
  try {
    const files = generateAllPlatformCode(spec);
    result.files = files;
    result.status = 'complete';
    result.downloadUrl = `/api/platforms/download/${buildId}`;
    builds.set(buildId, result);
    
    return result;
  } catch (error) {
    result.status = 'error';
    result.error = error instanceof Error ? error.message : 'Unknown error';
    builds.set(buildId, result);
    return result;
  }
}

export function getBuild(buildId: string): BuildResult | undefined {
  return builds.get(buildId);
}

export async function createZipBuffer(build: BuildResult): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    const writableStream = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(Buffer.from(chunk));
        callback();
      }
    });
    
    writableStream.on('finish', () => {
      resolve(Buffer.concat(chunks));
    });
    
    archive.on('error', reject);
    archive.pipe(writableStream);
    
    for (const file of build.files) {
      archive.append(file.content, { name: file.filePath });
    }
    
    archive.finalize();
  });
}

function generateAllPlatformCode(spec: PlatformSpec): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  
  files.push(...generatePackageJson(spec));
  files.push(...generateSchema(spec));
  files.push(...generateAuthRoutes(spec));
  files.push(...generateMainServer(spec));
  files.push(...generateEnvTemplate(spec));
  files.push(...generateDockerFiles(spec));
  files.push(...generateFrontendApp(spec));
  files.push(...generateReadme(spec));
  
  if (spec.hasSubscriptions) {
    files.push(...generateSubscriptionRoutes(spec));
  }
  
  if (spec.hasPayments) {
    files.push(...generatePaymentWebhooks(spec));
  }
  
  return files;
}

function generatePackageJson(spec: PlatformSpec): GeneratedFile[] {
  const content = `{
  "name": "${spec.name.toLowerCase().replace(/\s+/g, '-')}",
  "version": "1.0.0",
  "description": "${spec.description}",
  "type": "module",
  "scripts": {
    "dev": "tsx watch server/index.ts",
    "build": "vite build && tsc -p tsconfig.server.json",
    "start": "node dist/server/index.js",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.9.0",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-select": "^2.1.2",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-toast": "^1.2.2",
    "@tanstack/react-query": "^5.56.2",
    "bcryptjs": "^2.4.3",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "cookie-parser": "^1.4.6",
    "drizzle-orm": "^0.33.0",
    "drizzle-zod": "^0.5.1",
    "express": "^4.21.0",
    "lucide-react": "^0.441.0",
    "pg": "^8.13.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.53.0",
    "tailwind-merge": "^2.5.2",
    "tailwindcss-animate": "^1.0.7",
    "wouter": "^3.3.5",
    "zod": "^3.23.8"${spec.hasPayments ? ',\n    "stripe": "^14.0.0"' : ''}
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/cookie-parser": "^1.4.7",
    "@types/express": "^4.17.21",
    "@types/node": "^22.5.5",
    "@types/pg": "^8.11.10",
    "@types/react": "^18.3.8",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.20",
    "drizzle-kit": "^0.24.2",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.12",
    "tsx": "^4.19.1",
    "typescript": "^5.6.2",
    "vite": "^5.4.6"
  }
}`;

  return [{
    fileName: 'package.json',
    filePath: 'package.json',
    content,
    language: 'json',
    category: 'config'
  }];
}

function generateSchema(spec: PlatformSpec): GeneratedFile[] {
  const content = `import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar, index, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").default("user").notNull(),
  avatar: text("avatar"),
  emailVerified: boolean("email_verified").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  emailIdx: uniqueIndex("users_email_idx").on(table.email),
}));

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  tokenIdx: uniqueIndex("sessions_token_idx").on(table.token),
  userIdx: index("sessions_user_idx").on(table.userId),
}));

${spec.hasSubscriptions ? `
export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  interval: text("interval").default("month"),
  features: text("features").array(),
  stripePriceId: text("stripe_price_id"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  planId: integer("plan_id").references(() => plans.id).notNull(),
  status: text("status").default("active").notNull(),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripeCustomerId: text("stripe_customer_id"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  canceledAt: timestamp("canceled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("subscriptions_user_idx").on(table.userId),
  stripeIdx: index("subscriptions_stripe_idx").on(table.stripeSubscriptionId),
}));
` : ''}

${spec.hasPayments ? `
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  subscriptionId: integer("subscription_id"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  status: text("status").default("pending").notNull(),
  stripeInvoiceId: text("stripe_invoice_id"),
  receiptUrl: text("receipt_url"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("payments_user_idx").on(table.userId),
}));
` : ''}

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value"),
  category: text("category").default("general"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  ${spec.hasSubscriptions ? 'subscriptions: many(subscriptions),' : ''}
  ${spec.hasPayments ? 'payments: many(payments),' : ''}
}));

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertSessionSchema = createInsertSchema(sessions).omit({ id: true, createdAt: true });
${spec.hasSubscriptions ? 'export const insertPlanSchema = createInsertSchema(plans).omit({ id: true });' : ''}
${spec.hasSubscriptions ? 'export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ id: true, createdAt: true });' : ''}
${spec.hasPayments ? 'export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true });' : ''}

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Session = typeof sessions.$inferSelect;
${spec.hasSubscriptions ? 'export type Plan = typeof plans.$inferSelect;' : ''}
${spec.hasSubscriptions ? 'export type Subscription = typeof subscriptions.$inferSelect;' : ''}
${spec.hasPayments ? 'export type Payment = typeof payments.$inferSelect;' : ''}
`;

  return [{
    fileName: 'schema.ts',
    filePath: 'shared/schema.ts',
    content,
    language: 'typescript',
    category: 'shared'
  }];
}

function generateAuthRoutes(spec: PlatformSpec): GeneratedFile[] {
  const content = `import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "../db";
import { users, sessions } from "@shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post("/register", async (req: Request, res: Response) => {
  try {
    const validated = registerSchema.safeParse(req.body);
    if (!validated.success) {
      return res.status(400).json({ error: "Invalid input data" });
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

  return [{
    fileName: 'auth.ts',
    filePath: 'server/routes/auth.ts',
    content,
    language: 'typescript',
    category: 'backend'
  }];
}

function generateMainServer(spec: PlatformSpec): GeneratedFile[] {
  const content = `import express from "express";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import authRoutes from "./routes/auth";
${spec.hasSubscriptions ? 'import subscriptionRoutes from "./routes/subscriptions";' : ''}
${spec.hasPayments ? 'import webhookRoutes from "./routes/webhooks";' : ''}

const app = express();

${spec.hasPayments ? '// Stripe webhooks need raw body - must be before json parser\napp.use("/api/webhooks/stripe", express.raw({ type: "application/json" }));' : ''}

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
${spec.hasSubscriptions ? 'app.use("/api/subscriptions", subscriptionRoutes);' : ''}
${spec.hasPayments ? 'app.use("/api/webhooks", webhookRoutes);' : ''}

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    platform: "${spec.name}"
  });
});

const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(\`${spec.name} server running on port \${PORT}\`);
});

export default app;
`;

  return [{
    fileName: 'index.ts',
    filePath: 'server/index.ts',
    content,
    language: 'typescript',
    category: 'backend'
  }];
}

function generateSubscriptionRoutes(spec: PlatformSpec): GeneratedFile[] {
  const content = `import { Router, Request, Response } from "express";
import { db } from "../db";
import { plans, subscriptions } from "@shared/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2024-12-18.acacia" });

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
    
    const [plan] = await db.select().from(plans).where(eq(plans.id, planId));
    if (!plan || !plan.stripePriceId) {
      return res.status(404).json({ error: "Plan not found" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      mode: "subscription",
      success_url: \`\${process.env.APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}\`,
      cancel_url: \`\${process.env.APP_URL}/pricing\`,
      metadata: { userId: String(userId), planId: String(planId) },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

router.get("/my-subscription", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const [subscription] = await db.select().from(subscriptions)
      .where(eq(subscriptions.userId, userId));
    
    res.json(subscription || null);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch subscription" });
  }
});

export default router;
`;

  return [{
    fileName: 'subscriptions.ts',
    filePath: 'server/routes/subscriptions.ts',
    content,
    language: 'typescript',
    category: 'backend'
  }];
}

function generatePaymentWebhooks(spec: PlatformSpec): GeneratedFile[] {
  const content = `import { Router } from "express";
import Stripe from "stripe";
import { db } from "../db";
import { payments, subscriptions } from "@shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("STRIPE_SECRET_KEY not set - webhooks will not work");
}
if (!process.env.STRIPE_WEBHOOK_SECRET) {
  console.warn("STRIPE_WEBHOOK_SECRET not set - webhooks will not work");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2024-12-18.acacia" });
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

router.post("/stripe", async (req, res) => {
  const sig = req.headers["stripe-signature"] as string;
  
  if (!sig) {
    return res.status(400).send("Missing stripe-signature header");
  }
  
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return res.status(400).send(\`Webhook Error: \${message}\`);
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

  return [{
    fileName: 'webhooks.ts',
    filePath: 'server/routes/webhooks.ts',
    content,
    language: 'typescript',
    category: 'backend'
  }];
}

function generateEnvTemplate(spec: PlatformSpec): GeneratedFile[] {
  const content = `# Database
DATABASE_URL=postgresql://user:password@localhost:5432/${spec.name.toLowerCase().replace(/\s+/g, '_')}

# Application
NODE_ENV=development
PORT=5000
APP_URL=http://localhost:5000
SESSION_SECRET=your-session-secret-here

${spec.hasPayments ? `# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
` : ''}
`;

  return [{
    fileName: '.env.example',
    filePath: '.env.example',
    content,
    language: 'plaintext',
    category: 'config'
  }];
}

function generateDockerFiles(spec: PlatformSpec): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  
  const dockerfile = `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 5000
CMD ["node", "dist/server/index.js"]
`;

  files.push({
    fileName: 'Dockerfile',
    filePath: 'Dockerfile',
    content: dockerfile,
    language: 'dockerfile',
    category: 'infrastructure'
  });

  const dockerCompose = `version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=\${DATABASE_URL}
      ${spec.hasPayments ? '- STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}\n      - STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}' : ''}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=app
      - POSTGRES_PASSWORD=\${DB_PASSWORD}
      - POSTGRES_DB=${spec.name.toLowerCase().replace(/\s+/g, '_')}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
`;

  files.push({
    fileName: 'docker-compose.yml',
    filePath: 'docker-compose.yml',
    content: dockerCompose,
    language: 'yaml',
    category: 'infrastructure'
  });

  return files;
}

function generateFrontendApp(spec: PlatformSpec): GeneratedFile[] {
  const files: GeneratedFile[] = [];

  const appTsx = `import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard" component={Dashboard} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}
`;

  files.push({
    fileName: 'App.tsx',
    filePath: 'client/src/App.tsx',
    content: appTsx,
    language: 'typescript',
    category: 'frontend'
  });

  const homePage = `import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">${spec.name}</h1>
        <nav className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost" data-testid="button-login">Login</Button>
          </Link>
          <Link href="/register">
            <Button data-testid="button-register">Get Started</Button>
          </Link>
        </nav>
      </header>
      
      <main className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6" data-testid="text-hero-title">
          ${spec.description}
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Built with modern technology for scale, security, and speed.
        </p>
        <Link href="/register">
          <Button size="lg" data-testid="button-cta">
            Start Free Trial
          </Button>
        </Link>
      </main>
    </div>
  );
}
`;

  files.push({
    fileName: 'Home.tsx',
    filePath: 'client/src/pages/Home.tsx',
    content: homePage,
    language: 'typescript',
    category: 'frontend'
  });

  return files;
}

function generateReadme(spec: PlatformSpec): GeneratedFile[] {
  const content = `# ${spec.name}

${spec.description}

## Features

${spec.features.map(f => `- ${f}`).join('\n')}

## Quick Start

\`\`\`bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your values

# Push database schema
npm run db:push

# Start development server
npm run dev
\`\`\`

## Production Deployment

\`\`\`bash
# Build for production
npm run build

# Start production server
npm start
\`\`\`

## Docker Deployment

\`\`\`bash
# Build and run with Docker Compose
docker-compose up -d
\`\`\`

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
${spec.hasPayments ? '- **Payments**: Stripe' : ''}

## Generated by INFERA WebNova

This platform was generated by [INFERA WebNova](https://infera.dev) - The Sovereign Digital Platform Factory.
`;

  return [{
    fileName: 'README.md',
    filePath: 'README.md',
    content,
    language: 'markdown',
    category: 'docs'
  }];
}
