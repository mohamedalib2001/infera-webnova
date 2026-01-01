import { DEFAULT_ANTHROPIC_MODEL, getAnthropicClientAsync } from "./ai-config";
import { storage } from "./storage";
import type { InsertProject, Project } from "@shared/schema";

export interface FullStackProjectSpec {
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  industry: "government" | "commercial" | "healthcare" | "education" | "financial" | "hr" | "ecommerce" | "other";
  features: string[];
  hasAuth: boolean;
  hasPayments: boolean;
  language: "ar" | "en" | "bilingual";
}

export interface GeneratedFullStackProject {
  projectId: string;
  files: GeneratedFile[];
  databaseSchema: string;
  apiEndpoints: APIEndpoint[];
  documentation: {
    ar: string;
    en: string;
  };
  deploymentConfig: DeploymentConfig;
}

export interface GeneratedFile {
  path: string;
  content: string;
  type: "schema" | "route" | "component" | "page" | "hook" | "util" | "config" | "style";
  language: "typescript" | "ts" | "tsx" | "css" | "json" | "sql" | "env";
}

export interface APIEndpoint {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  description: string;
  descriptionAr: string;
  requestBody?: object;
  responseType?: string;
}

export interface DeploymentConfig {
  environment: Record<string, string>;
  dependencies: string[];
  devDependencies: string[];
  scripts: Record<string, string>;
  port: number;
}

const FULL_STACK_SYSTEM_PROMPT = `أنت INFERA Nova - نظام ذكاء اصطناعي متقدم لبناء منصات رقمية متكاملة.

You are INFERA Nova - an advanced AI system for building complete digital platforms.

## Your Capabilities:
1. Generate complete database schemas with Drizzle ORM
2. Create Express.js API routes with full CRUD operations
3. Build React components with TypeScript and Shadcn UI
4. Implement authentication with session management
5. Create bilingual interfaces (Arabic RTL / English LTR)
6. Generate professional, production-ready code

## Tech Stack (ALWAYS use this):
- Database: PostgreSQL with Drizzle ORM
- Backend: Express.js + TypeScript
- Frontend: React + TypeScript + Vite
- Styling: Tailwind CSS + Shadcn UI
- State: TanStack Query
- Routing: Wouter
- Auth: Passport.js with sessions

## Code Quality Standards:
1. TypeScript strict mode compliant
2. Proper error handling with bilingual messages
3. Input validation with Zod schemas
4. Responsive design (mobile-first)
5. RTL support for Arabic
6. data-testid on all interactive elements
7. Proper loading and error states
8. Accessibility (ARIA labels)

## Industry Templates:

### Government Platforms:
- Official colors (dark green, gold, white)
- Service request forms
- Citizen portal
- Document management
- Announcements section

### Healthcare Platforms:
- Appointment booking
- Patient records
- Doctor profiles
- Prescription management
- Medical history

### E-commerce Platforms:
- Product catalog
- Shopping cart
- Checkout flow
- Order management
- Customer reviews

### HR Platforms:
- Employee management
- Leave requests
- Attendance tracking
- Payroll
- Performance reviews

### Financial Platforms:
- Transaction history
- Account management
- Reports and analytics
- Budget tracking
- Invoicing

### Education Platforms:
- Course management
- Student enrollment
- Grade tracking
- Assignment submission
- Progress reports

IMPORTANT: Generate COMPLETE, WORKING code. Not stubs or placeholders.
Include all necessary imports, types, and implementations.`;

const FILE_GENERATION_PROMPT = `Generate complete file content based on the specification.

RULES:
1. Generate ONLY the file content, no explanations
2. Include ALL imports at the top
3. Export all necessary types and functions
4. Use TypeScript strict types
5. Include bilingual text (Arabic/English)
6. Add data-testid attributes
7. Handle loading and error states
8. Use existing Shadcn components from @/components/ui/

For React components, use this structure:
- Imports
- Types/Interfaces
- Component function
- Export

For API routes, use this structure:
- Imports
- Route handler functions
- Export router`;

export class FullStackGenerator {
  async generateProject(spec: FullStackProjectSpec, onProgress?: (step: string, progress: number) => void): Promise<GeneratedFullStackProject> {
    const anthropic = await getAnthropicClientAsync();
    if (!anthropic) {
      throw new Error("AI provider not configured / مزود الذكاء الاصطناعي غير مهيأ");
    }

    onProgress?.("planning", 5);

    // Create project in storage (using existing schema fields)
    const project = await storage.createProject({
      name: spec.name,
      description: spec.description,
      industry: spec.industry,
    });

    const files: GeneratedFile[] = [];
    const endpoints: APIEndpoint[] = [];

    try {
      // Step 1: Generate Database Schema
      onProgress?.("database", 15);
      const schemaFile = await this.generateDatabaseSchema(anthropic, spec);
      files.push(schemaFile);

      // Step 2: Generate Storage Interface
      onProgress?.("storage", 25);
      const storageFile = await this.generateStorageInterface(anthropic, spec, schemaFile.content);
      files.push(storageFile);

      // Step 3: Generate API Routes
      onProgress?.("api", 40);
      const { routeFile, generatedEndpoints } = await this.generateAPIRoutes(anthropic, spec, schemaFile.content);
      files.push(routeFile);
      endpoints.push(...generatedEndpoints);

      // Step 4: Generate React Pages
      onProgress?.("pages", 55);
      const pageFiles = await this.generatePages(anthropic, spec, endpoints);
      files.push(...pageFiles);

      // Step 5: Generate Components
      onProgress?.("components", 70);
      const componentFiles = await this.generateComponents(anthropic, spec);
      files.push(...componentFiles);

      // Step 6: Generate Styles
      onProgress?.("styling", 85);
      const styleFiles = await this.generateStyles(anthropic, spec);
      files.push(...styleFiles);

      // Step 7: Generate Config Files
      onProgress?.("config", 95);
      const configFiles = this.generateConfigFiles(spec);
      files.push(...configFiles);

      onProgress?.("complete", 100);

      // Persist all generated files to storage
      for (const file of files) {
        await storage.createProjectFile({
          projectId: project.id,
          filePath: file.path,
          fileName: file.path.split('/').pop() || file.path,
          content: file.content,
          fileType: file.language,
        });
      }

      // Store summary in project HTML for reference
      await storage.updateProject(project.id, {
        htmlCode: `<!-- Generated Full-Stack Project: ${spec.name} -->\n<!-- Files: ${files.length} -->\n<!-- Endpoints: ${endpoints.length} -->`,
        isPublished: false,
      });

      return {
        projectId: project.id,
        files, // Return actual files to client
        databaseSchema: schemaFile.content,
        apiEndpoints: endpoints,
        documentation: this.generateDocumentation(spec, files, endpoints),
        deploymentConfig: this.generateDeploymentConfig(spec),
      };

    } catch (error) {
      // Log error but don't try to update non-existent fields
      console.error(`[FullStackGenerator] Error generating project ${project.id}:`, error);
      throw error;
    }
  }

  private async generateDatabaseSchema(anthropic: any, spec: FullStackProjectSpec): Promise<GeneratedFile> {
    const prompt = `Generate a complete Drizzle ORM database schema for a ${spec.industry} platform.

Platform: ${spec.name}
Features: ${spec.features.join(", ")}
Has Auth: ${spec.hasAuth}
Has Payments: ${spec.hasPayments}

Requirements:
1. Use pgTable from drizzle-orm/pg-core
2. Include id (varchar with gen_random_uuid), createdAt, updatedAt
3. Create insert schemas with createInsertSchema
4. Export types with z.infer and $inferSelect
5. Add proper relations between tables
6. Include all necessary tables for the features

Generate ONLY the TypeScript code, no explanations.`;

    const response = await anthropic.messages.create({
      model: DEFAULT_ANTHROPIC_MODEL,
      max_tokens: 8000,
      system: FULL_STACK_SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });

    const content = this.extractCodeFromResponse(response);
    
    return {
      path: "src/db/schema.ts",
      content,
      type: "schema",
      language: "ts",
    };
  }

  private async generateStorageInterface(anthropic: any, spec: FullStackProjectSpec, schema: string): Promise<GeneratedFile> {
    const prompt = `Generate a complete storage interface and implementation based on this schema:

${schema}

CRITICAL: This is a STANDALONE project. The file will be at src/server/storage.ts
You MUST import schema types from '../db/schema' (relative path within the generated project)

Requirements:
1. Interface IStorage with all CRUD methods
2. MemStorage class implementing IStorage
3. Proper TypeScript types from schema
4. Async methods returning Promises
5. Support for filtering and pagination
6. Export a storage instance: export const storage = new MemStorage()

Example structure:
\`\`\`
import type { User, InsertUser } from '../db/schema'

interface IStorage {
  getUsers(): Promise<User[]>
  createUser(data: InsertUser): Promise<User>
  // etc...
}

class MemStorage implements IStorage {
  private users = new Map<number, User>()
  private currentId = 1
  
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values())
  }
  // etc...
}

export const storage = new MemStorage()
\`\`\`

Generate ONLY the TypeScript code, no explanations.`;

    const response = await anthropic.messages.create({
      model: DEFAULT_ANTHROPIC_MODEL,
      max_tokens: 8000,
      system: FULL_STACK_SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });

    const content = this.extractCodeFromResponse(response);
    
    return {
      path: "src/server/storage.ts",
      content,
      type: "util",
      language: "ts",
    };
  }

  private async generateAPIRoutes(anthropic: any, spec: FullStackProjectSpec, schema: string): Promise<{ routeFile: GeneratedFile; generatedEndpoints: APIEndpoint[] }> {
    const prompt = `Generate complete Express.js API routes for a ${spec.industry} platform.

Schema:
${schema}

Features: ${spec.features.join(", ")}
Has Auth: ${spec.hasAuth}

CRITICAL: This is a STANDALONE project. The file will be at src/server/routes.ts
You MUST import storage from './storage' (relative path within the generated project)

Requirements:
1. Export a function: export function registerRoutes(app: Express) { ... }
2. Import storage from './storage' NOT from any external path
3. Use Express app directly (not Router)
4. Validate input with Zod schemas
5. Use storage interface for CRUD
6. Include proper error handling
7. Add bilingual error messages
8. Protect routes if hasAuth is true

Example structure:
\`\`\`
import { Express } from 'express'
import { storage } from './storage'

export function registerRoutes(app: Express) {
  app.get('/api/items', async (req, res) => {
    const items = await storage.getAllItems()
    res.json(items)
  })
  // more routes...
}
\`\`\`

Generate ONLY the TypeScript code, no explanations.
At the end, include a JSON comment with the endpoint list:
// ENDPOINTS: [{"method": "GET", "path": "/api/...", "description": "...", "descriptionAr": "..."}]`;

    const response = await anthropic.messages.create({
      model: DEFAULT_ANTHROPIC_MODEL,
      max_tokens: 10000,
      system: FULL_STACK_SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });

    const content = this.extractCodeFromResponse(response);
    
    // Extract endpoints from comment
    const endpointMatch = content.match(/\/\/ ENDPOINTS: (\[[\s\S]*?\])/);
    let generatedEndpoints: APIEndpoint[] = [];
    if (endpointMatch) {
      try {
        generatedEndpoints = JSON.parse(endpointMatch[1]);
      } catch (e) {
        // Fallback endpoints
        generatedEndpoints = [];
      }
    }

    return {
      routeFile: {
        path: "src/server/routes.ts",
        content: content.replace(/\/\/ ENDPOINTS:.*$/m, ""),
        type: "route",
        language: "ts",
      },
      generatedEndpoints,
    };
  }

  private async generatePages(anthropic: any, spec: FullStackProjectSpec, endpoints: APIEndpoint[]): Promise<GeneratedFile[]> {
    const pages: GeneratedFile[] = [];
    
    // Determine which pages to generate based on industry
    const pageSpecs = this.getPageSpecsForIndustry(spec.industry, spec.features);

    for (const pageSpec of pageSpecs) {
      const prompt = `Generate a complete React page component for: ${pageSpec.name}

Platform: ${spec.name} (${spec.industry})
Language: ${spec.language}
Page Purpose: ${pageSpec.description}

Available API Endpoints:
${endpoints.map(e => `${e.method} ${e.path} - ${e.description}`).join("\n")}

Requirements:
1. Use TanStack Query for data fetching
2. Use Shadcn UI components
3. Include loading and error states
4. Support RTL for Arabic
5. Add data-testid attributes
6. Use proper TypeScript types
7. Include bilingual text

Generate ONLY the TSX code, no explanations.`;

      const response = await anthropic.messages.create({
        model: DEFAULT_ANTHROPIC_MODEL,
        max_tokens: 6000,
        system: FULL_STACK_SYSTEM_PROMPT,
        messages: [{ role: "user", content: prompt }],
      });

      pages.push({
        path: `src/client/pages/${pageSpec.fileName}.tsx`,
        content: this.extractCodeFromResponse(response),
        type: "page",
        language: "tsx",
      });
    }

    return pages;
  }

  private async generateComponents(anthropic: any, spec: FullStackProjectSpec): Promise<GeneratedFile[]> {
    const components: GeneratedFile[] = [];
    
    const componentSpecs = this.getComponentSpecsForIndustry(spec.industry);

    for (const compSpec of componentSpecs) {
      const prompt = `Generate a reusable React component: ${compSpec.name}

Purpose: ${compSpec.description}
Platform: ${spec.name} (${spec.industry})
Language: ${spec.language}

Requirements:
1. TypeScript with proper props interface
2. Use Shadcn UI base components
3. Support dark/light mode
4. RTL support for Arabic
5. Responsive design
6. Add data-testid attributes

Generate ONLY the TSX code, no explanations.`;

      const response = await anthropic.messages.create({
        model: DEFAULT_ANTHROPIC_MODEL,
        max_tokens: 4000,
        system: FULL_STACK_SYSTEM_PROMPT,
        messages: [{ role: "user", content: prompt }],
      });

      components.push({
        path: `src/client/components/${compSpec.fileName}.tsx`,
        content: this.extractCodeFromResponse(response),
        type: "component",
        language: "tsx",
      });
    }

    return components;
  }

  private async generateStyles(anthropic: any, spec: FullStackProjectSpec): Promise<GeneratedFile[]> {
    const colors = this.getColorsForIndustry(spec.industry);
    
    const cssContent = `/* Generated styles for ${spec.name} */
/* Industry: ${spec.industry} */

:root {
  --primary: ${colors.primary};
  --primary-foreground: ${colors.primaryForeground};
  --secondary: ${colors.secondary};
  --secondary-foreground: ${colors.secondaryForeground};
  --accent: ${colors.accent};
  --accent-foreground: ${colors.accentForeground};
  --background: ${colors.background};
  --foreground: ${colors.foreground};
  --muted: ${colors.muted};
  --muted-foreground: ${colors.mutedForeground};
  --card: ${colors.card};
  --card-foreground: ${colors.cardForeground};
  --border: ${colors.border};
  --input: ${colors.input};
  --ring: ${colors.ring};
}

.dark {
  --primary: ${colors.darkPrimary};
  --primary-foreground: ${colors.darkPrimaryForeground};
  --secondary: ${colors.darkSecondary};
  --secondary-foreground: ${colors.darkSecondaryForeground};
  --accent: ${colors.darkAccent};
  --accent-foreground: ${colors.darkAccentForeground};
  --background: ${colors.darkBackground};
  --foreground: ${colors.darkForeground};
  --muted: ${colors.darkMuted};
  --muted-foreground: ${colors.darkMutedForeground};
  --card: ${colors.darkCard};
  --card-foreground: ${colors.darkCardForeground};
  --border: ${colors.darkBorder};
  --input: ${colors.darkInput};
  --ring: ${colors.darkRing};
}

/* RTL Support */
[dir="rtl"] {
  font-family: 'Tajawal', 'Cairo', sans-serif;
}

/* Platform-specific styles */
.platform-header {
  background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%);
}

.service-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.service-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1);
}
`;

    return [{
      path: "src/client/styles/theme.css",
      content: cssContent,
      type: "style",
      language: "css",
    }];
  }

  private generateConfigFiles(spec: FullStackProjectSpec): GeneratedFile[] {
    const projectSlug = spec.name.toLowerCase().replace(/\s+/g, "-");
    
    // Environment file
    const envContent = `# ${spec.name} Environment Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/${spec.name.toLowerCase().replace(/\s+/g, "_")}
SESSION_SECRET=your-session-secret-here
NODE_ENV=development
PORT=5000
${spec.hasPayments ? "STRIPE_SECRET_KEY=your-stripe-key\n" : ""}`;

    // Package.json
    const packageJson = {
      name: projectSlug,
      version: "1.0.0",
      description: spec.description,
      type: "module",
      scripts: {
        dev: "tsx watch src/server/index.ts",
        build: "tsc && vite build",
        start: "node dist/server/index.js",
        "db:push": "drizzle-kit push",
        "db:generate": "drizzle-kit generate",
      },
      dependencies: {
        express: "^4.18.2",
        "drizzle-orm": "^0.29.0",
        pg: "^8.11.3",
        "@neondatabase/serverless": "^0.6.0",
        zod: "^3.22.4",
        "express-session": "^1.17.3",
        passport: "^0.7.0",
        "passport-local": "^1.0.0",
        bcryptjs: "^2.4.3",
        dotenv: "^16.3.1",
        react: "^18.2.0",
        "react-dom": "^18.2.0",
        "@tanstack/react-query": "^5.0.0",
        wouter: "^3.0.0",
      },
      devDependencies: {
        typescript: "^5.3.0",
        "@types/express": "^4.17.21",
        "@types/node": "^20.10.0",
        "@types/react": "^18.2.0",
        "@types/react-dom": "^18.2.0",
        "@types/bcryptjs": "^2.4.6",
        "@types/passport": "^1.0.16",
        "@types/passport-local": "^1.0.38",
        "@types/express-session": "^1.17.10",
        "drizzle-kit": "^0.20.0",
        tsx: "^4.7.0",
        vite: "^5.0.0",
        "@vitejs/plugin-react": "^4.2.0",
        tailwindcss: "^3.4.0",
        autoprefixer: "^10.4.0",
        postcss: "^8.4.0",
      },
    };

    // TypeScript config
    const tsConfig = {
      compilerOptions: {
        target: "ES2020",
        useDefineForClassFields: true,
        lib: ["ES2020", "DOM", "DOM.Iterable"],
        module: "ESNext",
        skipLibCheck: true,
        moduleResolution: "bundler",
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: "react-jsx",
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
        baseUrl: ".",
        paths: {
          "@/*": ["./src/client/*"],
          "@shared/*": ["./src/shared/*"],
        },
      },
      include: ["src"],
    };

    // Vite config
    const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/client'),
      '@shared': path.resolve(__dirname, './src/shared'),
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})`;

    // Tailwind config
    const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
    },
  },
  plugins: [],
}`;

    // PostCSS config
    const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;

    // Drizzle config
    const drizzleConfig = `import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})`;

    // Server entry point
    const serverIndex = `import express from 'express'
import session from 'express-session'
import { registerRoutes } from './routes'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}))

registerRoutes(app)

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`)
})`;

    // Index HTML
    const indexHtml = `<!DOCTYPE html>
<html lang="${spec.language === "ar" ? "ar" : "en"}" dir="${spec.language === "ar" ? "rtl" : "ltr"}">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${spec.name}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/client/main.tsx"></script>
  </body>
</html>`;

    // Client entry point
    const clientMain = `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './styles/theme.css'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)`;

    // App component
    const appComponent = `import { Route, Switch } from 'wouter'
import Dashboard from './pages/dashboard'

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route>404 - Not Found</Route>
      </Switch>
    </div>
  )
}`;

    // README
    const readme = `# ${spec.name}

${spec.description}

## Quick Start

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Set up environment:
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your database URL
   \`\`\`

3. Push database schema:
   \`\`\`bash
   npm run db:push
   \`\`\`

4. Start development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Tech Stack

- **Backend**: Express.js + TypeScript
- **Frontend**: React + TypeScript + Vite
- **Database**: PostgreSQL + Drizzle ORM
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query

## Generated by INFERA WebNova
`;

    return [
      { path: ".env.example", content: envContent, type: "config", language: "env" },
      { path: "package.json", content: JSON.stringify(packageJson, null, 2), type: "config", language: "json" },
      { path: "tsconfig.json", content: JSON.stringify(tsConfig, null, 2), type: "config", language: "json" },
      { path: "vite.config.ts", content: viteConfig, type: "config", language: "ts" },
      { path: "tailwind.config.js", content: tailwindConfig, type: "config", language: "ts" },
      { path: "postcss.config.js", content: postcssConfig, type: "config", language: "ts" },
      { path: "drizzle.config.ts", content: drizzleConfig, type: "config", language: "ts" },
      { path: "src/server/index.ts", content: serverIndex, type: "config", language: "ts" },
      { path: "index.html", content: indexHtml, type: "config", language: "typescript" },
      { path: "src/client/main.tsx", content: clientMain, type: "config", language: "tsx" },
      { path: "src/client/App.tsx", content: appComponent, type: "component", language: "tsx" },
      { path: "README.md", content: readme, type: "config", language: "typescript" },
    ];
  }

  private generateDocumentation(spec: FullStackProjectSpec, files: GeneratedFile[], endpoints: APIEndpoint[]): { ar: string; en: string } {
    const ar = `# ${spec.nameAr}

## نظرة عامة
${spec.descriptionAr}

## الملفات المولدة
${files.map(f => `- \`${f.path}\`: ${this.getFileTypeAr(f.type)}`).join("\n")}

## نقاط النهاية API
${endpoints.map(e => `- ${e.method} ${e.path}: ${e.descriptionAr}`).join("\n")}

## كيفية التشغيل
1. تثبيت التبعيات: \`npm install\`
2. إعداد قاعدة البيانات: \`npm run db:push\`
3. تشغيل الخادم: \`npm run dev\`
`;

    const en = `# ${spec.name}

## Overview
${spec.description}

## Generated Files
${files.map(f => `- \`${f.path}\`: ${this.getFileTypeEn(f.type)}`).join("\n")}

## API Endpoints
${endpoints.map(e => `- ${e.method} ${e.path}: ${e.description}`).join("\n")}

## How to Run
1. Install dependencies: \`npm install\`
2. Setup database: \`npm run db:push\`
3. Start server: \`npm run dev\`
`;

    return { ar, en };
  }

  private generateDeploymentConfig(spec: FullStackProjectSpec): DeploymentConfig {
    return {
      environment: {
        NODE_ENV: "production",
        DATABASE_URL: "${DATABASE_URL}",
        SESSION_SECRET: "${SESSION_SECRET}",
      },
      dependencies: [
        "express",
        "drizzle-orm",
        "pg",
        "@neondatabase/serverless",
        "zod",
        "express-session",
        "passport",
        "passport-local",
        "bcryptjs",
      ],
      devDependencies: [
        "typescript",
        "@types/express",
        "@types/node",
        "drizzle-kit",
        "tsx",
      ],
      scripts: {
        dev: "tsx watch server/index.ts",
        build: "tsc",
        start: "node dist/server/index.js",
        "db:push": "drizzle-kit push",
        "db:generate": "drizzle-kit generate",
      },
      port: 5000,
    };
  }

  private getPageSpecsForIndustry(industry: string, features: string[]): Array<{ name: string; fileName: string; description: string }> {
    const basePages = [
      { name: "Dashboard", fileName: "dashboard", description: "Main dashboard with overview and statistics" },
      { name: "Settings", fileName: "settings", description: "User and platform settings" },
    ];

    const industryPages: Record<string, Array<{ name: string; fileName: string; description: string }>> = {
      government: [
        { name: "Services", fileName: "services", description: "Electronic government services listing" },
        { name: "Requests", fileName: "requests", description: "Service requests management" },
        { name: "Announcements", fileName: "announcements", description: "Official announcements and news" },
      ],
      healthcare: [
        { name: "Appointments", fileName: "appointments", description: "Appointment booking and management" },
        { name: "Patients", fileName: "patients", description: "Patient records management" },
        { name: "Doctors", fileName: "doctors", description: "Doctor profiles and schedules" },
      ],
      ecommerce: [
        { name: "Products", fileName: "products", description: "Product catalog management" },
        { name: "Orders", fileName: "orders", description: "Order processing and tracking" },
        { name: "Cart", fileName: "cart", description: "Shopping cart and checkout" },
      ],
      hr: [
        { name: "Employees", fileName: "employees", description: "Employee directory and management" },
        { name: "Leaves", fileName: "leaves", description: "Leave requests and approvals" },
        { name: "Attendance", fileName: "attendance", description: "Attendance tracking" },
      ],
      education: [
        { name: "Courses", fileName: "courses", description: "Course catalog and enrollment" },
        { name: "Students", fileName: "students", description: "Student management" },
        { name: "Grades", fileName: "grades", description: "Grade tracking and reports" },
      ],
      financial: [
        { name: "Transactions", fileName: "transactions", description: "Transaction history and management" },
        { name: "Accounts", fileName: "accounts", description: "Account management" },
        { name: "Reports", fileName: "reports", description: "Financial reports and analytics" },
      ],
    };

    return [...basePages, ...(industryPages[industry] || [])];
  }

  private getComponentSpecsForIndustry(industry: string): Array<{ name: string; fileName: string; description: string }> {
    return [
      { name: "DataTable", fileName: "data-table", description: "Reusable data table with sorting and filtering" },
      { name: "StatCard", fileName: "stat-card", description: "Statistics display card" },
      { name: "SearchBar", fileName: "search-bar", description: "Search input with filters" },
      { name: "StatusBadge", fileName: "status-badge", description: "Status indicator badge" },
    ];
  }

  private getColorsForIndustry(industry: string): Record<string, string> {
    const colorSchemes: Record<string, Record<string, string>> = {
      government: {
        primary: "142 76% 36%", // Dark green
        primaryForeground: "0 0% 100%",
        secondary: "45 93% 47%", // Gold
        secondaryForeground: "0 0% 0%",
        accent: "142 76% 36%",
        accentForeground: "0 0% 100%",
        background: "0 0% 100%",
        foreground: "222 47% 11%",
        muted: "210 40% 96%",
        mutedForeground: "215 16% 47%",
        card: "0 0% 100%",
        cardForeground: "222 47% 11%",
        border: "214 32% 91%",
        input: "214 32% 91%",
        ring: "142 76% 36%",
        // Dark mode
        darkPrimary: "142 76% 46%",
        darkPrimaryForeground: "0 0% 100%",
        darkSecondary: "45 93% 47%",
        darkSecondaryForeground: "0 0% 0%",
        darkAccent: "142 76% 36%",
        darkAccentForeground: "0 0% 100%",
        darkBackground: "222 47% 11%",
        darkForeground: "210 40% 98%",
        darkMuted: "217 33% 17%",
        darkMutedForeground: "215 20% 65%",
        darkCard: "222 47% 11%",
        darkCardForeground: "210 40% 98%",
        darkBorder: "217 33% 17%",
        darkInput: "217 33% 17%",
        darkRing: "142 76% 46%",
      },
      healthcare: {
        primary: "199 89% 48%", // Medical blue
        primaryForeground: "0 0% 100%",
        secondary: "168 76% 42%", // Teal
        secondaryForeground: "0 0% 100%",
        accent: "199 89% 48%",
        accentForeground: "0 0% 100%",
        background: "0 0% 100%",
        foreground: "222 47% 11%",
        muted: "210 40% 96%",
        mutedForeground: "215 16% 47%",
        card: "0 0% 100%",
        cardForeground: "222 47% 11%",
        border: "214 32% 91%",
        input: "214 32% 91%",
        ring: "199 89% 48%",
        darkPrimary: "199 89% 58%",
        darkPrimaryForeground: "0 0% 100%",
        darkSecondary: "168 76% 52%",
        darkSecondaryForeground: "0 0% 100%",
        darkAccent: "199 89% 48%",
        darkAccentForeground: "0 0% 100%",
        darkBackground: "222 47% 11%",
        darkForeground: "210 40% 98%",
        darkMuted: "217 33% 17%",
        darkMutedForeground: "215 20% 65%",
        darkCard: "222 47% 11%",
        darkCardForeground: "210 40% 98%",
        darkBorder: "217 33% 17%",
        darkInput: "217 33% 17%",
        darkRing: "199 89% 58%",
      },
      ecommerce: {
        primary: "262 83% 58%", // Purple
        primaryForeground: "0 0% 100%",
        secondary: "316 70% 50%", // Pink
        secondaryForeground: "0 0% 100%",
        accent: "262 83% 58%",
        accentForeground: "0 0% 100%",
        background: "0 0% 100%",
        foreground: "222 47% 11%",
        muted: "210 40% 96%",
        mutedForeground: "215 16% 47%",
        card: "0 0% 100%",
        cardForeground: "222 47% 11%",
        border: "214 32% 91%",
        input: "214 32% 91%",
        ring: "262 83% 58%",
        darkPrimary: "262 83% 68%",
        darkPrimaryForeground: "0 0% 100%",
        darkSecondary: "316 70% 60%",
        darkSecondaryForeground: "0 0% 100%",
        darkAccent: "262 83% 58%",
        darkAccentForeground: "0 0% 100%",
        darkBackground: "222 47% 11%",
        darkForeground: "210 40% 98%",
        darkMuted: "217 33% 17%",
        darkMutedForeground: "215 20% 65%",
        darkCard: "222 47% 11%",
        darkCardForeground: "210 40% 98%",
        darkBorder: "217 33% 17%",
        darkInput: "217 33% 17%",
        darkRing: "262 83% 68%",
      },
    };

    // Default colors for other industries
    const defaultColors = {
      primary: "221 83% 53%",
      primaryForeground: "0 0% 100%",
      secondary: "210 40% 96%",
      secondaryForeground: "222 47% 11%",
      accent: "221 83% 53%",
      accentForeground: "0 0% 100%",
      background: "0 0% 100%",
      foreground: "222 47% 11%",
      muted: "210 40% 96%",
      mutedForeground: "215 16% 47%",
      card: "0 0% 100%",
      cardForeground: "222 47% 11%",
      border: "214 32% 91%",
      input: "214 32% 91%",
      ring: "221 83% 53%",
      darkPrimary: "221 83% 63%",
      darkPrimaryForeground: "0 0% 100%",
      darkSecondary: "217 33% 17%",
      darkSecondaryForeground: "210 40% 98%",
      darkAccent: "221 83% 53%",
      darkAccentForeground: "0 0% 100%",
      darkBackground: "222 47% 11%",
      darkForeground: "210 40% 98%",
      darkMuted: "217 33% 17%",
      darkMutedForeground: "215 20% 65%",
      darkCard: "222 47% 11%",
      darkCardForeground: "210 40% 98%",
      darkBorder: "217 33% 17%",
      darkInput: "217 33% 17%",
      darkRing: "221 83% 63%",
    };

    return colorSchemes[industry] || defaultColors;
  }

  private extractCodeFromResponse(response: any): string {
    const textContent = response.content.find((c: any) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No content generated");
    }

    let code = textContent.text.trim();
    
    // Remove markdown code blocks
    const codeBlockMatch = code.match(/```(?:typescript|tsx|ts|javascript|jsx|css|json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      code = codeBlockMatch[1].trim();
    }

    return code;
  }

  private getFileTypeAr(type: string): string {
    const types: Record<string, string> = {
      schema: "مخطط قاعدة البيانات",
      route: "مسارات API",
      component: "مكون React",
      page: "صفحة",
      hook: "React Hook",
      util: "أدوات مساعدة",
      config: "إعدادات",
      style: "أنماط CSS",
    };
    return types[type] || type;
  }

  private getFileTypeEn(type: string): string {
    const types: Record<string, string> = {
      schema: "Database Schema",
      route: "API Routes",
      component: "React Component",
      page: "Page",
      hook: "React Hook",
      util: "Utilities",
      config: "Configuration",
      style: "CSS Styles",
    };
    return types[type] || type;
  }
}

export const fullStackGenerator = new FullStackGenerator();
