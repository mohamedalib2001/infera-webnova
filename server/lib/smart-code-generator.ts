import Anthropic from "@anthropic-ai/sdk";

export interface DatabaseSchema {
  tables: TableDefinition[];
  relationships: Relationship[];
  indexes: IndexDefinition[];
}

export interface TableDefinition {
  name: string;
  nameAr: string;
  columns: ColumnDefinition[];
  primaryKey: string;
  timestamps: boolean;
}

export interface ColumnDefinition {
  name: string;
  type: "string" | "number" | "boolean" | "date" | "json" | "uuid" | "text" | "decimal";
  nullable: boolean;
  unique: boolean;
  defaultValue?: string;
  references?: { table: string; column: string };
}

export interface Relationship {
  type: "one-to-one" | "one-to-many" | "many-to-many";
  from: { table: string; column: string };
  to: { table: string; column: string };
}

export interface IndexDefinition {
  table: string;
  columns: string[];
  unique: boolean;
}

export interface APIEndpoint {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  description: string;
  descriptionAr: string;
  auth: boolean;
  roles?: string[];
  requestBody?: Record<string, any>;
  responseSchema?: Record<string, any>;
  rateLimit?: number;
}

export interface BusinessLogic {
  name: string;
  nameAr: string;
  type: "validation" | "calculation" | "workflow" | "automation" | "notification";
  trigger: string;
  conditions: string[];
  actions: string[];
  code: string;
}

export interface BackendSpec {
  database: DatabaseSchema;
  apis: APIEndpoint[];
  businessLogic: BusinessLogic[];
  middleware: string[];
  services: string[];
}

export interface UIComponent {
  name: string;
  nameAr: string;
  type: "page" | "form" | "table" | "card" | "modal" | "sidebar" | "header" | "chart";
  props: Record<string, any>;
  children?: UIComponent[];
  events?: string[];
  dataBinding?: string;
}

export interface Interaction {
  trigger: string;
  action: string;
  target: string;
  animation?: string;
}

export interface FrontendSpec {
  pages: PageSpec[];
  components: UIComponent[];
  navigation: NavigationItem[];
  theme: ThemeSpec;
  interactions: Interaction[];
}

export interface PageSpec {
  path: string;
  name: string;
  nameAr: string;
  layout: "dashboard" | "form" | "list" | "detail" | "landing" | "auth";
  components: string[];
  permissions?: string[];
}

export interface NavigationItem {
  id: string;
  label: string;
  labelAr: string;
  icon: string;
  path: string;
  children?: NavigationItem[];
  roles?: string[];
}

export interface ThemeSpec {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  borderRadius: string;
  spacing: string;
}

export interface IntegrationConfig {
  id: string;
  name: string;
  nameAr: string;
  type: "payment" | "auth" | "notification" | "storage" | "analytics" | "ai";
  provider: string;
  config: Record<string, any>;
  endpoints: string[];
  webhooks?: string[];
}

export interface GeneratedCode {
  backend: {
    schema: string;
    migrations: string[];
    routes: string;
    services: string[];
    middleware: string[];
  };
  frontend: {
    pages: { path: string; code: string }[];
    components: { name: string; code: string }[];
    hooks: { name: string; code: string }[];
    styles: string;
  };
  integrations: {
    config: string;
    handlers: string[];
  };
  documentation: {
    api: string;
    setup: string;
    usage: string;
  };
}

class SmartCodeGenerator {
  private anthropic: Anthropic | null = null;

  constructor() {
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
  }

  async generateBackend(requirements: string, sector: string): Promise<BackendSpec> {
    const prompt = `You are an expert backend architect. Generate a complete backend specification based on these requirements.

Requirements: ${requirements}
Sector: ${sector}

Generate a JSON response with:
1. database: Complete database schema with tables, relationships, indexes
2. apis: RESTful API endpoints with authentication, validation, rate limiting
3. businessLogic: Business rules, validations, workflows, automations
4. middleware: Required middleware (auth, logging, validation, etc.)
5. services: Service layer components

Consider sector-specific requirements:
- Healthcare: HIPAA compliance, audit logging, encryption
- Military: Top-secret classification, zero-trust, MFA
- Government: GDPR, accessibility, multi-language
- Financial: PCI-DSS, transaction logging, fraud detection
- Education: FERPA, role-based access, content management
- Commercial: Scalability, analytics, multi-tenant

Return valid JSON only.`;

    if (this.anthropic) {
      try {
        const response = await this.anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          messages: [{ role: "user", content: prompt }]
        });

        const text = response.content[0].type === "text" ? response.content[0].text : "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]) as BackendSpec;
        }
      } catch (error) {
        console.error("[Smart Code Generator] Backend generation error:", error);
      }
    }

    return this.generateFallbackBackend(requirements, sector);
  }

  async generateFrontend(requirements: string, backendSpec: BackendSpec): Promise<FrontendSpec> {
    const prompt = `You are an expert frontend architect. Generate a complete frontend specification.

Requirements: ${requirements}
Backend APIs: ${JSON.stringify(backendSpec.apis.slice(0, 10))}
Database Tables: ${backendSpec.database.tables.map(t => t.name).join(", ")}

Generate a JSON response with:
1. pages: Page specifications with layouts, components, permissions
2. components: Reusable UI components with props, events, data binding
3. navigation: Sidebar/header navigation structure
4. theme: Color scheme, typography, spacing
5. interactions: User interactions, animations, state changes

Follow modern UX principles:
- Responsive design (mobile-first)
- Accessibility (WCAG 2.1 AA)
- Dark/light mode support
- RTL support for Arabic
- Loading states and error handling
- Form validation and feedback

Return valid JSON only.`;

    if (this.anthropic) {
      try {
        const response = await this.anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          messages: [{ role: "user", content: prompt }]
        });

        const text = response.content[0].type === "text" ? response.content[0].text : "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]) as FrontendSpec;
        }
      } catch (error) {
        console.error("[Smart Code Generator] Frontend generation error:", error);
      }
    }

    return this.generateFallbackFrontend(requirements, backendSpec);
  }

  generateIntegrations(requirements: string, sector: string): IntegrationConfig[] {
    const integrations: IntegrationConfig[] = [];
    const lowerReq = requirements.toLowerCase();

    if (lowerReq.includes("دفع") || lowerReq.includes("payment") || lowerReq.includes("شراء")) {
      integrations.push({
        id: "payment-gateway",
        name: "Payment Gateway",
        nameAr: "بوابة الدفع",
        type: "payment",
        provider: sector === "financial" ? "stripe" : "unified",
        config: {
          supportedMethods: ["card", "apple_pay", "google_pay", "bank_transfer"],
          currencies: ["SAR", "AED", "EGP", "USD"],
          webhookEndpoint: "/api/webhooks/payment"
        },
        endpoints: ["/api/payments/create", "/api/payments/confirm", "/api/payments/refund"],
        webhooks: ["payment.success", "payment.failed", "refund.completed"]
      });
    }

    if (lowerReq.includes("تسجيل") || lowerReq.includes("auth") || lowerReq.includes("مستخدم")) {
      integrations.push({
        id: "authentication",
        name: "Authentication System",
        nameAr: "نظام التوثيق",
        type: "auth",
        provider: "internal",
        config: {
          methods: ["email", "phone", "social", "mfa"],
          sessionDuration: 86400,
          refreshTokenEnabled: true,
          passwordPolicy: sector === "military" ? "military-grade" : "strong"
        },
        endpoints: ["/api/auth/login", "/api/auth/register", "/api/auth/refresh", "/api/auth/logout"]
      });
    }

    if (lowerReq.includes("إشعار") || lowerReq.includes("notification") || lowerReq.includes("تنبيه")) {
      integrations.push({
        id: "notifications",
        name: "Notification Service",
        nameAr: "خدمة الإشعارات",
        type: "notification",
        provider: "multi-channel",
        config: {
          channels: ["email", "sms", "push", "in-app"],
          templates: true,
          scheduling: true,
          analytics: true
        },
        endpoints: ["/api/notifications/send", "/api/notifications/template", "/api/notifications/schedule"]
      });
    }

    if (lowerReq.includes("ملف") || lowerReq.includes("storage") || lowerReq.includes("رفع")) {
      integrations.push({
        id: "storage",
        name: "Object Storage",
        nameAr: "تخزين الملفات",
        type: "storage",
        provider: "gcs",
        config: {
          maxFileSize: "50MB",
          allowedTypes: ["image/*", "application/pdf", "video/*"],
          encryption: true,
          cdnEnabled: true
        },
        endpoints: ["/api/storage/upload", "/api/storage/download", "/api/storage/delete"]
      });
    }

    if (lowerReq.includes("ذكاء") || lowerReq.includes("ai") || lowerReq.includes("تحليل")) {
      integrations.push({
        id: "ai-services",
        name: "AI Services",
        nameAr: "خدمات الذكاء الاصطناعي",
        type: "ai",
        provider: "anthropic",
        config: {
          models: ["claude-sonnet-4-20250514"],
          capabilities: ["chat", "analysis", "generation"],
          rateLimit: 100
        },
        endpoints: ["/api/ai/chat", "/api/ai/analyze", "/api/ai/generate"]
      });
    }

    return integrations;
  }

  async generateCode(
    requirements: string,
    sector: string,
    options?: { language?: string; framework?: string }
  ): Promise<GeneratedCode> {
    const backendSpec = await this.generateBackend(requirements, sector);
    const frontendSpec = await this.generateFrontend(requirements, backendSpec);
    const integrations = this.generateIntegrations(requirements, sector);

    return {
      backend: {
        schema: this.generateDrizzleSchema(backendSpec.database),
        migrations: this.generateMigrations(backendSpec.database),
        routes: this.generateExpressRoutes(backendSpec.apis),
        services: this.generateServices(backendSpec.businessLogic),
        middleware: this.generateMiddleware(backendSpec.middleware)
      },
      frontend: {
        pages: this.generateReactPages(frontendSpec.pages),
        components: this.generateReactComponents(frontendSpec.components),
        hooks: this.generateReactHooks(backendSpec.apis),
        styles: this.generateTailwindStyles(frontendSpec.theme)
      },
      integrations: {
        config: this.generateIntegrationConfig(integrations),
        handlers: this.generateIntegrationHandlers(integrations)
      },
      documentation: {
        api: this.generateAPIDocumentation(backendSpec.apis),
        setup: this.generateSetupGuide(backendSpec, frontendSpec, integrations),
        usage: this.generateUsageGuide(backendSpec, frontendSpec)
      }
    };
  }

  private generateDrizzleSchema(database: DatabaseSchema): string {
    let schema = `import { pgTable, text, integer, boolean, timestamp, uuid, decimal, json } from "drizzle-orm/pg-core";\nimport { createInsertSchema } from "drizzle-zod";\nimport { z } from "zod";\n\n`;

    for (const table of database.tables) {
      schema += `// ${table.nameAr}\nexport const ${table.name} = pgTable("${table.name}", {\n`;
      for (const col of table.columns) {
        const typeMap: Record<string, string> = {
          string: "text", number: "integer", boolean: "boolean",
          date: "timestamp", json: "json", uuid: "uuid", text: "text", decimal: "decimal"
        };
        schema += `  ${col.name}: ${typeMap[col.type]}("${col.name}")`;
        if (col.name === table.primaryKey) schema += `.primaryKey()`;
        if (!col.nullable) schema += `.notNull()`;
        if (col.unique) schema += `.unique()`;
        if (col.defaultValue) schema += `.default(${col.defaultValue})`;
        schema += `,\n`;
      }
      if (table.timestamps) {
        schema += `  createdAt: timestamp("created_at").defaultNow(),\n`;
        schema += `  updatedAt: timestamp("updated_at").defaultNow(),\n`;
      }
      schema += `});\n\n`;
      schema += `export const insert${this.capitalize(table.name)}Schema = createInsertSchema(${table.name});\n`;
      schema += `export type ${this.capitalize(table.name)} = typeof ${table.name}.$inferSelect;\n`;
      schema += `export type New${this.capitalize(table.name)} = z.infer<typeof insert${this.capitalize(table.name)}Schema>;\n\n`;
    }

    return schema;
  }

  private generateMigrations(database: DatabaseSchema): string[] {
    return database.tables.map(table => {
      let migration = `-- Migration: Create ${table.name}\nCREATE TABLE IF NOT EXISTS ${table.name} (\n`;
      const cols = table.columns.map(col => {
        const typeMap: Record<string, string> = {
          string: "VARCHAR(255)", number: "INTEGER", boolean: "BOOLEAN",
          date: "TIMESTAMP", json: "JSONB", uuid: "UUID", text: "TEXT", decimal: "DECIMAL(10,2)"
        };
        let def = `  ${col.name} ${typeMap[col.type]}`;
        if (col.name === table.primaryKey) def += " PRIMARY KEY";
        if (!col.nullable) def += " NOT NULL";
        if (col.unique) def += " UNIQUE";
        return def;
      });
      if (table.timestamps) {
        cols.push("  created_at TIMESTAMP DEFAULT NOW()");
        cols.push("  updated_at TIMESTAMP DEFAULT NOW()");
      }
      migration += cols.join(",\n") + "\n);";
      return migration;
    });
  }

  private generateExpressRoutes(apis: APIEndpoint[]): string {
    let routes = `import { Router, Request, Response } from "express";\nimport { authMiddleware, roleMiddleware } from "./middleware";\nimport { z } from "zod";\n\nconst router = Router();\n\n`;

    for (const api of apis) {
      const method = api.method.toLowerCase();
      const middlewares: string[] = [];
      if (api.auth) middlewares.push("authMiddleware");
      if (api.roles?.length) middlewares.push(`roleMiddleware(${JSON.stringify(api.roles)})`);
      
      const middlewareStr = middlewares.length ? middlewares.join(", ") + ", " : "";
      
      routes += `// ${api.descriptionAr}\nrouter.${method}("${api.path}", ${middlewareStr}async (req: Request, res: Response) => {\n`;
      routes += `  try {\n`;
      routes += `    // TODO: Implement ${api.description}\n`;
      routes += `    res.json({ success: true, message: "${api.descriptionAr}" });\n`;
      routes += `  } catch (error) {\n`;
      routes += `    res.status(500).json({ success: false, error: "Internal server error" });\n`;
      routes += `  }\n});\n\n`;
    }

    routes += `export default router;\n`;
    return routes;
  }

  private generateServices(businessLogic: BusinessLogic[]): string[] {
    return businessLogic.map(logic => {
      return `// ${logic.nameAr}\nexport class ${this.capitalize(logic.name)}Service {\n  // Type: ${logic.type}\n  // Trigger: ${logic.trigger}\n\n  async execute(data: any): Promise<any> {\n    // Conditions: ${logic.conditions.join(", ")}\n    // Actions: ${logic.actions.join(", ")}\n    ${logic.code || "// TODO: Implement business logic"}\n  }\n}\n`;
    });
  }

  private generateMiddleware(middlewareNames: string[]): string[] {
    return middlewareNames.map(name => {
      return `import { Request, Response, NextFunction } from "express";\n\nexport const ${name}Middleware = (req: Request, res: Response, next: NextFunction) => {\n  // TODO: Implement ${name} middleware\n  next();\n};\n`;
    });
  }

  private generateReactPages(pages: PageSpec[]): { path: string; code: string }[] {
    return pages.map(page => ({
      path: `${page.path}.tsx`,
      code: `import { useQuery } from "@tanstack/react-query";\n\nexport default function ${this.capitalize(page.name)}Page() {\n  return (\n    <div className="h-full overflow-y-auto pb-24">\n      <div className="p-6">\n        <h1 className="text-2xl font-bold mb-4">${page.nameAr}</h1>\n        {/* Layout: ${page.layout} */}\n        {/* Components: ${page.components.join(", ")} */}\n      </div>\n    </div>\n  );\n}\n`
    }));
  }

  private generateReactComponents(components: UIComponent[]): { name: string; code: string }[] {
    return components.map(comp => ({
      name: `${comp.name}.tsx`,
      code: `interface ${this.capitalize(comp.name)}Props {\n  ${Object.entries(comp.props || {}).map(([k, v]) => `${k}: ${typeof v};`).join("\n  ")}\n}\n\nexport function ${this.capitalize(comp.name)}({ ${Object.keys(comp.props || {}).join(", ")} }: ${this.capitalize(comp.name)}Props) {\n  return (\n    <div data-testid="component-${comp.name}">\n      {/* ${comp.nameAr} - Type: ${comp.type} */}\n    </div>\n  );\n}\n`
    }));
  }

  private generateReactHooks(apis: APIEndpoint[]): { name: string; code: string }[] {
    const hooks: { name: string; code: string }[] = [];
    const getApis = apis.filter(a => a.method === "GET");
    
    for (const api of getApis.slice(0, 10)) {
      const hookName = `use${this.capitalize(api.path.split("/").pop() || "Data")}`;
      hooks.push({
        name: `${hookName}.ts`,
        code: `import { useQuery } from "@tanstack/react-query";\n\nexport function ${hookName}() {\n  return useQuery({\n    queryKey: ["${api.path}"],\n  });\n}\n`
      });
    }

    return hooks;
  }

  private generateTailwindStyles(theme: ThemeSpec): string {
    return `/* Theme: Generated by Smart Code Generator */\n:root {\n  --primary: ${theme.primaryColor};\n  --secondary: ${theme.secondaryColor};\n  --accent: ${theme.accentColor};\n  --font-family: ${theme.fontFamily};\n  --border-radius: ${theme.borderRadius};\n  --spacing: ${theme.spacing};\n}\n`;
  }

  private generateIntegrationConfig(integrations: IntegrationConfig[]): string {
    return `// Integration Configurations\nexport const integrations = ${JSON.stringify(integrations, null, 2)};\n`;
  }

  private generateIntegrationHandlers(integrations: IntegrationConfig[]): string[] {
    return integrations.map(int => {
      return `// ${int.nameAr} Handler\nexport class ${this.capitalize(int.id.replace(/-/g, ""))}Handler {\n  private config = ${JSON.stringify(int.config, null, 2)};\n\n  async initialize(): Promise<void> {\n    // TODO: Initialize ${int.name}\n  }\n\n  async handleWebhook(payload: any): Promise<void> {\n    // Webhooks: ${int.webhooks?.join(", ") || "none"}\n  }\n}\n`;
    });
  }

  private generateAPIDocumentation(apis: APIEndpoint[]): string {
    let doc = `# API Documentation\n\n`;
    for (const api of apis) {
      doc += `## ${api.method} ${api.path}\n`;
      doc += `**${api.descriptionAr}** / ${api.description}\n\n`;
      doc += `- Authentication: ${api.auth ? "Required" : "Not required"}\n`;
      if (api.roles?.length) doc += `- Roles: ${api.roles.join(", ")}\n`;
      if (api.rateLimit) doc += `- Rate Limit: ${api.rateLimit} requests/minute\n`;
      doc += `\n`;
    }
    return doc;
  }

  private generateSetupGuide(backend: BackendSpec, frontend: FrontendSpec, integrations: IntegrationConfig[]): string {
    return `# Setup Guide / دليل التثبيت\n\n## Prerequisites\n- Node.js 18+\n- PostgreSQL 14+\n- npm or yarn\n\n## Installation\n1. Clone the repository\n2. Run \`npm install\`\n3. Configure environment variables\n4. Run migrations: \`npm run db:migrate\`\n5. Start development: \`npm run dev\`\n\n## Database Tables\n${backend.database.tables.map(t => `- ${t.name}: ${t.nameAr}`).join("\n")}\n\n## Integrations\n${integrations.map(i => `- ${i.name}: ${i.nameAr}`).join("\n")}\n`;
  }

  private generateUsageGuide(backend: BackendSpec, frontend: FrontendSpec): string {
    return `# Usage Guide / دليل الاستخدام\n\n## Pages\n${frontend.pages.map(p => `- ${p.path}: ${p.nameAr}`).join("\n")}\n\n## API Endpoints\n${backend.apis.slice(0, 10).map(a => `- ${a.method} ${a.path}: ${a.descriptionAr}`).join("\n")}\n`;
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private generateFallbackBackend(requirements: string, sector: string): BackendSpec {
    return {
      database: {
        tables: [
          {
            name: "users",
            nameAr: "المستخدمين",
            columns: [
              { name: "id", type: "uuid", nullable: false, unique: true },
              { name: "email", type: "string", nullable: false, unique: true },
              { name: "name", type: "string", nullable: false, unique: false },
              { name: "role", type: "string", nullable: false, unique: false }
            ],
            primaryKey: "id",
            timestamps: true
          }
        ],
        relationships: [],
        indexes: [{ table: "users", columns: ["email"], unique: true }]
      },
      apis: [
        { method: "GET", path: "/api/users", description: "Get all users", descriptionAr: "جلب المستخدمين", auth: true },
        { method: "POST", path: "/api/users", description: "Create user", descriptionAr: "إنشاء مستخدم", auth: true }
      ],
      businessLogic: [],
      middleware: ["auth", "logging", "validation"],
      services: ["UserService", "AuthService"]
    };
  }

  private generateFallbackFrontend(requirements: string, backend: BackendSpec): FrontendSpec {
    return {
      pages: [
        { path: "/", name: "home", nameAr: "الرئيسية", layout: "dashboard", components: ["Header", "Sidebar", "MainContent"] },
        { path: "/users", name: "users", nameAr: "المستخدمين", layout: "list", components: ["UserTable", "UserFilters"] }
      ],
      components: [
        { name: "Header", nameAr: "الهيدر", type: "header", props: {} },
        { name: "Sidebar", nameAr: "الشريط الجانبي", type: "sidebar", props: {} }
      ],
      navigation: [
        { id: "home", label: "Home", labelAr: "الرئيسية", icon: "Home", path: "/" },
        { id: "users", label: "Users", labelAr: "المستخدمين", icon: "Users", path: "/users" }
      ],
      theme: {
        primaryColor: "220 90% 56%",
        secondaryColor: "260 84% 60%",
        accentColor: "173 58% 39%",
        fontFamily: "Inter, system-ui",
        borderRadius: "0.5rem",
        spacing: "1rem"
      },
      interactions: []
    };
  }
}

export const smartCodeGenerator = new SmartCodeGenerator();
