/**
 * INFERA WebNova - Full-Stack Project Generator
 * AI-Powered Complete Application Generation Engine
 * 
 * Generates complete digital platforms from natural language descriptions
 */

import { z } from 'zod';

// ==================== PROJECT TEMPLATES ====================
export const ProjectTemplates = {
  REACT_EXPRESS: 'react-express',
  NEXTJS_FULLSTACK: 'nextjs-fullstack',
  VUE_FASTIFY: 'vue-fastify',
  SVELTE_EXPRESS: 'svelte-express',
  STATIC_SITE: 'static-site',
  API_ONLY: 'api-only',
  MOBILE_PWA: 'mobile-pwa',
  ECOMMERCE: 'ecommerce',
  SAAS_STARTER: 'saas-starter',
  BLOG_CMS: 'blog-cms',
  DASHBOARD: 'dashboard',
  LANDING_PAGE: 'landing-page',
} as const;

export type ProjectTemplate = typeof ProjectTemplates[keyof typeof ProjectTemplates];

// ==================== TECH STACK OPTIONS ====================
export const FrontendFrameworks = {
  REACT: 'react',
  NEXTJS: 'nextjs',
  VUE: 'vue',
  NUXT: 'nuxt',
  SVELTE: 'svelte',
  SVELTEKIT: 'sveltekit',
  ANGULAR: 'angular',
  ASTRO: 'astro',
  VANILLA: 'vanilla',
} as const;

export const BackendFrameworks = {
  EXPRESS: 'express',
  FASTIFY: 'fastify',
  NESTJS: 'nestjs',
  HONO: 'hono',
  KOA: 'koa',
  NEXTJS_API: 'nextjs-api',
  DJANGO: 'django',
  FASTAPI: 'fastapi',
  FLASK: 'flask',
} as const;

export const DatabaseTypes = {
  POSTGRESQL: 'postgresql',
  MYSQL: 'mysql',
  MONGODB: 'mongodb',
  SQLITE: 'sqlite',
  SUPABASE: 'supabase',
  PLANETSCALE: 'planetscale',
  NEON: 'neon',
} as const;

export const ORMTypes = {
  DRIZZLE: 'drizzle',
  PRISMA: 'prisma',
  TYPEORM: 'typeorm',
  MONGOOSE: 'mongoose',
  KNEX: 'knex',
} as const;

export const UILibraries = {
  TAILWIND: 'tailwind',
  SHADCN: 'shadcn',
  MATERIAL_UI: 'material-ui',
  CHAKRA_UI: 'chakra-ui',
  ANT_DESIGN: 'ant-design',
  BOOTSTRAP: 'bootstrap',
  DAISY_UI: 'daisy-ui',
} as const;

export const AuthMethods = {
  JWT: 'jwt',
  SESSION: 'session',
  OAUTH: 'oauth',
  CLERK: 'clerk',
  AUTH0: 'auth0',
  FIREBASE: 'firebase',
  SUPABASE_AUTH: 'supabase-auth',
} as const;

// ==================== PROJECT SPECIFICATION SCHEMA ====================
export const ProjectSpecSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  language: z.enum(['ar', 'en']).default('ar'),
  
  // Template and tech stack
  template: z.enum([
    'react-express', 'nextjs-fullstack', 'vue-fastify', 'svelte-express',
    'static-site', 'api-only', 'mobile-pwa', 'ecommerce', 'saas-starter',
    'blog-cms', 'dashboard', 'landing-page'
  ]).default('nextjs-fullstack'),
  
  techStack: z.object({
    frontend: z.enum(['react', 'nextjs', 'vue', 'nuxt', 'svelte', 'sveltekit', 'angular', 'astro', 'vanilla']).default('react'),
    backend: z.enum(['express', 'fastify', 'nestjs', 'hono', 'koa', 'nextjs-api', 'django', 'fastapi', 'flask']).optional(),
    database: z.enum(['postgresql', 'mysql', 'mongodb', 'sqlite', 'supabase', 'planetscale', 'neon']).default('postgresql'),
    orm: z.enum(['drizzle', 'prisma', 'typeorm', 'mongoose', 'knex']).default('drizzle'),
    ui: z.enum(['tailwind', 'shadcn', 'material-ui', 'chakra-ui', 'ant-design', 'bootstrap', 'daisy-ui']).default('tailwind'),
    auth: z.enum(['jwt', 'session', 'oauth', 'clerk', 'auth0', 'firebase', 'supabase-auth']).default('jwt'),
  }),
  
  // Features
  features: z.object({
    authentication: z.boolean().default(true),
    authorization: z.boolean().default(true),
    api: z.boolean().default(true),
    database: z.boolean().default(true),
    fileUpload: z.boolean().default(false),
    realtime: z.boolean().default(false),
    i18n: z.boolean().default(true),
    darkMode: z.boolean().default(true),
    seo: z.boolean().default(true),
    analytics: z.boolean().default(false),
    payments: z.boolean().default(false),
    notifications: z.boolean().default(false),
    search: z.boolean().default(false),
  }),
  
  // Data models
  entities: z.array(z.object({
    name: z.string(),
    nameAr: z.string().optional(),
    fields: z.array(z.object({
      name: z.string(),
      type: z.enum(['string', 'number', 'boolean', 'date', 'json', 'array', 'relation']),
      required: z.boolean().default(true),
      unique: z.boolean().default(false),
      relation: z.object({
        to: z.string(),
        type: z.enum(['oneToOne', 'oneToMany', 'manyToMany']),
      }).optional(),
    })),
  })).default([]),
  
  // Pages
  pages: z.array(z.object({
    name: z.string(),
    nameAr: z.string().optional(),
    path: z.string(),
    type: z.enum(['public', 'protected', 'admin']).default('public'),
    layout: z.enum(['default', 'dashboard', 'auth', 'landing', 'minimal']).default('default'),
    components: z.array(z.string()).default([]),
  })).default([]),
  
  // Deployment target
  deployment: z.object({
    provider: z.enum(['vercel', 'netlify', 'railway', 'render', 'fly', 'hetzner', 'aws', 'gcp', 'azure']).default('vercel'),
    region: z.string().default('auto'),
    customDomain: z.string().optional(),
  }).optional(),
});

export type ProjectSpec = z.infer<typeof ProjectSpecSchema>;

// ==================== GENERATED FILE ====================
export interface GeneratedFile {
  path: string;
  content: string;
  type: 'text' | 'binary';
  language?: string;
  isEntryPoint?: boolean;
  isConfig?: boolean;
}

// ==================== GENERATION RESULT ====================
export interface GenerationResult {
  success: boolean;
  projectId: string;
  spec: ProjectSpec;
  files: GeneratedFile[];
  dependencies: {
    production: Record<string, string>;
    development: Record<string, string>;
  };
  scripts: Record<string, string>;
  envVars: Record<string, string>;
  instructions: string[];
  errors: string[];
  generatedAt: Date;
  aiTokensUsed: number;
}

// ==================== GENERATOR INTERFACE ====================
export interface IFullStackGenerator {
  generate(spec: ProjectSpec): Promise<GenerationResult>;
  generateFromPrompt(prompt: string, language: 'ar' | 'en'): Promise<GenerationResult>;
  getAvailableTemplates(): ProjectTemplate[];
  previewSpec(spec: ProjectSpec): Promise<{ fileTree: string[]; estimatedTime: number }>;
}

// ==================== TEMPLATE CONFIGURATIONS ====================
export const TEMPLATE_CONFIGS: Record<ProjectTemplate, Partial<ProjectSpec>> = {
  'react-express': {
    techStack: {
      frontend: 'react',
      backend: 'express',
      database: 'postgresql',
      orm: 'drizzle',
      ui: 'tailwind',
      auth: 'jwt',
    },
    features: {
      authentication: true,
      authorization: true,
      api: true,
      database: true,
      fileUpload: false,
      realtime: false,
      i18n: true,
      darkMode: true,
      seo: true,
      analytics: false,
      payments: false,
      notifications: false,
      search: false,
    },
  },
  'nextjs-fullstack': {
    techStack: {
      frontend: 'nextjs',
      backend: 'nextjs-api',
      database: 'postgresql',
      orm: 'drizzle',
      ui: 'shadcn',
      auth: 'jwt',
    },
    features: {
      authentication: true,
      authorization: true,
      api: true,
      database: true,
      fileUpload: false,
      realtime: false,
      i18n: true,
      darkMode: true,
      seo: true,
      analytics: false,
      payments: false,
      notifications: false,
      search: false,
    },
  },
  'vue-fastify': {
    techStack: {
      frontend: 'vue',
      backend: 'fastify',
      database: 'postgresql',
      orm: 'prisma',
      ui: 'tailwind',
      auth: 'jwt',
    },
  },
  'svelte-express': {
    techStack: {
      frontend: 'svelte',
      backend: 'express',
      database: 'postgresql',
      orm: 'drizzle',
      ui: 'tailwind',
      auth: 'jwt',
    },
  },
  'static-site': {
    techStack: {
      frontend: 'astro',
      database: 'sqlite',
      orm: 'drizzle',
      ui: 'tailwind',
      auth: 'jwt',
    },
    features: {
      authentication: false,
      authorization: false,
      api: false,
      database: false,
      fileUpload: false,
      realtime: false,
      i18n: true,
      darkMode: true,
      seo: true,
      analytics: false,
      payments: false,
      notifications: false,
      search: false,
    },
  },
  'api-only': {
    techStack: {
      frontend: 'vanilla',
      backend: 'express',
      database: 'postgresql',
      orm: 'drizzle',
      ui: 'tailwind',
      auth: 'jwt',
    },
    features: {
      authentication: true,
      authorization: true,
      api: true,
      database: true,
      fileUpload: false,
      realtime: false,
      i18n: false,
      darkMode: false,
      seo: false,
      analytics: false,
      payments: false,
      notifications: false,
      search: false,
    },
  },
  'mobile-pwa': {
    techStack: {
      frontend: 'react',
      backend: 'express',
      database: 'postgresql',
      orm: 'drizzle',
      ui: 'tailwind',
      auth: 'jwt',
    },
  },
  'ecommerce': {
    techStack: {
      frontend: 'nextjs',
      backend: 'nextjs-api',
      database: 'postgresql',
      orm: 'drizzle',
      ui: 'shadcn',
      auth: 'jwt',
    },
    features: {
      authentication: true,
      authorization: true,
      api: true,
      database: true,
      fileUpload: true,
      realtime: false,
      i18n: true,
      darkMode: true,
      seo: true,
      analytics: true,
      payments: true,
      notifications: true,
      search: true,
    },
    entities: [
      {
        name: 'products',
        nameAr: 'المنتجات',
        fields: [
          { name: 'name', type: 'string', required: true, unique: false },
          { name: 'price', type: 'number', required: true, unique: false },
          { name: 'description', type: 'string', required: false, unique: false },
          { name: 'stock', type: 'number', required: true, unique: false },
          { name: 'images', type: 'array', required: false, unique: false },
        ],
      },
      {
        name: 'orders',
        nameAr: 'الطلبات',
        fields: [
          { name: 'status', type: 'string', required: true, unique: false },
          { name: 'total', type: 'number', required: true, unique: false },
          { name: 'items', type: 'json', required: true, unique: false },
        ],
      },
      {
        name: 'categories',
        nameAr: 'التصنيفات',
        fields: [
          { name: 'name', type: 'string', required: true, unique: true },
          { name: 'slug', type: 'string', required: true, unique: true },
        ],
      },
    ],
  },
  'saas-starter': {
    techStack: {
      frontend: 'nextjs',
      backend: 'nextjs-api',
      database: 'postgresql',
      orm: 'drizzle',
      ui: 'shadcn',
      auth: 'jwt',
    },
    features: {
      authentication: true,
      authorization: true,
      api: true,
      database: true,
      fileUpload: false,
      realtime: false,
      i18n: true,
      darkMode: true,
      seo: true,
      analytics: true,
      payments: true,
      notifications: true,
      search: false,
    },
    pages: [
      { name: 'Home', nameAr: 'الرئيسية', path: '/', type: 'public', layout: 'landing', components: ['Hero', 'Features', 'Pricing'] },
      { name: 'Dashboard', nameAr: 'لوحة التحكم', path: '/dashboard', type: 'protected', layout: 'dashboard', components: ['Stats', 'Charts'] },
      { name: 'Settings', nameAr: 'الإعدادات', path: '/settings', type: 'protected', layout: 'dashboard', components: ['ProfileForm', 'BillingInfo'] },
    ],
  },
  'blog-cms': {
    techStack: {
      frontend: 'nextjs',
      backend: 'nextjs-api',
      database: 'postgresql',
      orm: 'drizzle',
      ui: 'tailwind',
      auth: 'jwt',
    },
    entities: [
      {
        name: 'posts',
        nameAr: 'المقالات',
        fields: [
          { name: 'title', type: 'string', required: true, unique: false },
          { name: 'content', type: 'string', required: true, unique: false },
          { name: 'slug', type: 'string', required: true, unique: true },
          { name: 'published', type: 'boolean', required: true, unique: false },
        ],
      },
      {
        name: 'categories',
        nameAr: 'التصنيفات',
        fields: [
          { name: 'name', type: 'string', required: true, unique: true },
          { name: 'slug', type: 'string', required: true, unique: true },
        ],
      },
    ],
  },
  'dashboard': {
    techStack: {
      frontend: 'react',
      backend: 'express',
      database: 'postgresql',
      orm: 'drizzle',
      ui: 'shadcn',
      auth: 'jwt',
    },
    features: {
      authentication: true,
      authorization: true,
      api: true,
      database: true,
      fileUpload: false,
      realtime: true,
      i18n: true,
      darkMode: true,
      seo: false,
      analytics: true,
      payments: false,
      notifications: true,
      search: true,
    },
  },
  'landing-page': {
    techStack: {
      frontend: 'nextjs',
      database: 'sqlite',
      orm: 'drizzle',
      ui: 'tailwind',
      auth: 'jwt',
    },
    features: {
      authentication: false,
      authorization: false,
      api: false,
      database: false,
      fileUpload: false,
      realtime: false,
      i18n: true,
      darkMode: true,
      seo: true,
      analytics: true,
      payments: false,
      notifications: false,
      search: false,
    },
  },
};

// ==================== FILE GENERATORS ====================
export function generatePackageJson(spec: ProjectSpec): GeneratedFile {
  const isNextJS = spec.techStack.frontend === 'nextjs';
  
  const pkg = {
    name: spec.name.toLowerCase().replace(/\s+/g, '-'),
    version: '1.0.0',
    private: true,
    scripts: {
      dev: isNextJS ? 'next dev' : 'vite',
      build: isNextJS ? 'next build' : 'vite build',
      start: isNextJS ? 'next start' : 'node dist/index.js',
      lint: 'eslint . --ext .ts,.tsx',
      'db:push': 'drizzle-kit push',
      'db:studio': 'drizzle-kit studio',
    },
    dependencies: {
      ...(isNextJS ? { next: '^14.0.0', react: '^18.2.0', 'react-dom': '^18.2.0' } : { react: '^18.2.0', 'react-dom': '^18.2.0', vite: '^5.0.0' }),
      ...(spec.techStack.backend === 'express' ? { express: '^4.18.0' } : {}),
      ...(spec.techStack.orm === 'drizzle' ? { 'drizzle-orm': '^0.29.0', pg: '^8.11.0' } : {}),
      ...(spec.techStack.orm === 'prisma' ? { '@prisma/client': '^5.0.0' } : {}),
      ...(spec.techStack.ui === 'tailwind' ? { tailwindcss: '^3.4.0', autoprefixer: '^10.4.0', postcss: '^8.4.0' } : {}),
      ...(spec.features.authentication ? { bcryptjs: '^2.4.3', jsonwebtoken: '^9.0.0' } : {}),
      zod: '^3.22.0',
    },
    devDependencies: {
      typescript: '^5.3.0',
      '@types/node': '^20.0.0',
      '@types/react': '^18.2.0',
      ...(spec.techStack.backend === 'express' ? { '@types/express': '^4.17.0' } : {}),
      ...(spec.techStack.orm === 'drizzle' ? { 'drizzle-kit': '^0.20.0' } : {}),
      ...(spec.techStack.orm === 'prisma' ? { prisma: '^5.0.0' } : {}),
    },
  };

  return {
    path: 'package.json',
    content: JSON.stringify(pkg, null, 2),
    type: 'text',
    language: 'json',
    isConfig: true,
  };
}

export function generateTsConfig(spec: ProjectSpec): GeneratedFile {
  const config = {
    compilerOptions: {
      target: 'ES2022',
      lib: ['dom', 'dom.iterable', 'ES2022'],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: 'esnext',
      moduleResolution: 'bundler',
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: 'preserve',
      incremental: true,
      paths: {
        '@/*': ['./src/*'],
        '@shared/*': ['./shared/*'],
      },
    },
    include: ['**/*.ts', '**/*.tsx'],
    exclude: ['node_modules'],
  };

  return {
    path: 'tsconfig.json',
    content: JSON.stringify(config, null, 2),
    type: 'text',
    language: 'json',
    isConfig: true,
  };
}

export function generateEnvExample(spec: ProjectSpec): GeneratedFile {
  const vars = [
    '# Database',
    'DATABASE_URL=postgresql://user:password@localhost:5432/dbname',
    '',
    '# Authentication',
    ...(spec.features.authentication ? [
      'JWT_SECRET=your-super-secret-key',
      'SESSION_SECRET=your-session-secret',
    ] : []),
    '',
    '# Application',
    'NODE_ENV=development',
    'PORT=3000',
    ...(spec.deployment?.customDomain ? [`NEXT_PUBLIC_APP_URL=https://${spec.deployment.customDomain}`] : ['NEXT_PUBLIC_APP_URL=http://localhost:3000']),
    '',
    ...(spec.features.payments ? [
      '# Stripe',
      'STRIPE_SECRET_KEY=sk_test_xxx',
      'STRIPE_PUBLISHABLE_KEY=pk_test_xxx',
      'STRIPE_WEBHOOK_SECRET=whsec_xxx',
      '',
    ] : []),
    ...(spec.features.analytics ? [
      '# Analytics',
      'NEXT_PUBLIC_GA_ID=G-XXXXXXX',
      '',
    ] : []),
  ];

  return {
    path: '.env.example',
    content: vars.join('\n'),
    type: 'text',
    isConfig: true,
  };
}

export function generateReadme(spec: ProjectSpec): GeneratedFile {
  const isArabic = spec.language === 'ar';
  
  const content = isArabic ? `# ${spec.name}

${spec.description || 'مشروع تم إنشاؤه بواسطة INFERA WebNova'}

## البدء

\`\`\`bash
# تثبيت الحزم
npm install

# إعداد قاعدة البيانات
npm run db:push

# تشغيل التطوير
npm run dev
\`\`\`

## التقنيات المستخدمة

- الواجهة: ${spec.techStack.frontend}
- الخادم: ${spec.techStack.backend || 'لا يوجد'}
- قاعدة البيانات: ${spec.techStack.database}
- ORM: ${spec.techStack.orm}
- واجهة المستخدم: ${spec.techStack.ui}
- المصادقة: ${spec.techStack.auth}

## الميزات

${Object.entries(spec.features).filter(([_, v]) => v).map(([k]) => `- ${k}`).join('\n')}

---
تم إنشاؤه بواسطة [INFERA WebNova](https://inferawebnova.com)
` : `# ${spec.name}

${spec.description || 'Project generated by INFERA WebNova'}

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Setup database
npm run db:push

# Run development server
npm run dev
\`\`\`

## Tech Stack

- Frontend: ${spec.techStack.frontend}
- Backend: ${spec.techStack.backend || 'N/A'}
- Database: ${spec.techStack.database}
- ORM: ${spec.techStack.orm}
- UI: ${spec.techStack.ui}
- Auth: ${spec.techStack.auth}

## Features

${Object.entries(spec.features).filter(([_, v]) => v).map(([k]) => `- ${k}`).join('\n')}

---
Generated by [INFERA WebNova](https://inferawebnova.com)
`;

  return {
    path: 'README.md',
    content,
    type: 'text',
    language: 'markdown',
  };
}

// ==================== GENERATOR IMPLEMENTATION ====================
class FullStackGeneratorImpl implements IFullStackGenerator {
  async generate(spec: ProjectSpec): Promise<GenerationResult> {
    const startTime = Date.now();
    const projectId = `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const files: GeneratedFile[] = [];
    const errors: string[] = [];
    
    try {
      // Generate core config files
      files.push(generatePackageJson(spec));
      files.push(generateTsConfig(spec));
      files.push(generateEnvExample(spec));
      files.push(generateReadme(spec));
      
      // Generate structure based on template
      files.push(...this.generateProjectStructure(spec));
      
      // Generate database schema if needed
      if (spec.features.database && spec.entities.length > 0) {
        files.push(...this.generateDatabaseSchema(spec));
      }
      
      // Generate API routes if needed
      if (spec.features.api && spec.techStack.backend) {
        files.push(...this.generateAPIRoutes(spec));
      }
      
      // Generate pages
      if (spec.pages.length > 0) {
        files.push(...this.generatePages(spec));
      }
      
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown generation error');
    }
    
    return {
      success: errors.length === 0,
      projectId,
      spec,
      files,
      dependencies: {
        production: {},
        development: {},
      },
      scripts: {
        dev: 'npm run dev',
        build: 'npm run build',
        start: 'npm run start',
      },
      envVars: {
        DATABASE_URL: 'postgresql://...',
        JWT_SECRET: 'generated-secret',
      },
      instructions: [
        'npm install',
        'cp .env.example .env',
        'npm run db:push',
        'npm run dev',
      ],
      errors,
      generatedAt: new Date(),
      aiTokensUsed: 0,
    };
  }

  async generateFromPrompt(prompt: string, language: 'ar' | 'en'): Promise<GenerationResult> {
    // This would integrate with Claude AI to parse the prompt
    // For now, return a default spec
    const defaultSpec: ProjectSpec = {
      name: 'My Project',
      description: prompt,
      language,
      template: 'nextjs-fullstack',
      techStack: {
        frontend: 'nextjs',
        backend: 'nextjs-api',
        database: 'postgresql',
        orm: 'drizzle',
        ui: 'shadcn',
        auth: 'jwt',
      },
      features: {
        authentication: true,
        authorization: true,
        api: true,
        database: true,
        fileUpload: false,
        realtime: false,
        i18n: true,
        darkMode: true,
        seo: true,
        analytics: false,
        payments: false,
        notifications: false,
        search: false,
      },
      entities: [],
      pages: [],
    };
    
    return this.generate(defaultSpec);
  }

  getAvailableTemplates(): ProjectTemplate[] {
    return Object.values(ProjectTemplates);
  }

  async previewSpec(spec: ProjectSpec): Promise<{ fileTree: string[]; estimatedTime: number }> {
    const files = [
      'package.json',
      'tsconfig.json',
      '.env.example',
      'README.md',
      'src/',
      'src/app/',
      'src/components/',
      'src/lib/',
    ];
    
    if (spec.features.database) {
      files.push('src/db/', 'src/db/schema.ts', 'drizzle.config.ts');
    }
    
    if (spec.features.api) {
      files.push('src/app/api/', 'src/app/api/[...route]/route.ts');
    }
    
    return {
      fileTree: files,
      estimatedTime: 30, // seconds
    };
  }

  private generateProjectStructure(spec: ProjectSpec): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    const isNextJS = spec.techStack.frontend === 'nextjs';
    
    if (isNextJS) {
      files.push({
        path: 'next.config.js',
        content: `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
`,
        type: 'text',
        language: 'javascript',
        isConfig: true,
      });
      
      files.push({
        path: 'src/app/layout.tsx',
        content: `import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '${spec.name}',
  description: '${spec.description || 'Generated by INFERA WebNova'}',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="${spec.language}" dir="${spec.language === 'ar' ? 'rtl' : 'ltr'}">
      <body>{children}</body>
    </html>
  );
}
`,
        type: 'text',
        language: 'tsx',
      });
      
      files.push({
        path: 'src/app/page.tsx',
        content: `export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold">${spec.language === 'ar' ? 'مرحباً بك في' : 'Welcome to'} ${spec.name}</h1>
    </main>
  );
}
`,
        type: 'text',
        language: 'tsx',
        isEntryPoint: true,
      });
      
      files.push({
        path: 'src/app/globals.css',
        content: `@tailwind base;
@tailwind components;
@tailwind utilities;
`,
        type: 'text',
        language: 'css',
      });
    }
    
    return files;
  }

  private generateDatabaseSchema(spec: ProjectSpec): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    
    const schemaContent = `import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

${spec.entities.map(entity => `
// ${entity.nameAr || entity.name}
export const ${entity.name} = pgTable("${entity.name}", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
${entity.fields.map(field => {
  const typeMap: Record<string, string> = {
    string: 'text',
    number: 'integer',
    boolean: 'boolean',
    date: 'timestamp',
    json: 'jsonb',
    array: 'jsonb',
  };
  const drizzleType = typeMap[field.type] || 'text';
  let line = `  ${field.name}: ${drizzleType}("${field.name}")`;
  if (field.required) line += '.notNull()';
  if (field.unique) line += '.unique()';
  return line + ',';
}).join('\n')}
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insert${entity.name.charAt(0).toUpperCase() + entity.name.slice(1)}Schema = createInsertSchema(${entity.name}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Insert${entity.name.charAt(0).toUpperCase() + entity.name.slice(1)} = z.infer<typeof insert${entity.name.charAt(0).toUpperCase() + entity.name.slice(1)}Schema>;
export type ${entity.name.charAt(0).toUpperCase() + entity.name.slice(1)} = typeof ${entity.name}.$inferSelect;
`).join('\n')}
`;

    files.push({
      path: 'src/db/schema.ts',
      content: schemaContent,
      type: 'text',
      language: 'typescript',
    });
    
    files.push({
      path: 'drizzle.config.ts',
      content: `import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
`,
      type: 'text',
      language: 'typescript',
      isConfig: true,
    });
    
    return files;
  }

  private generateAPIRoutes(spec: ProjectSpec): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    const isNextJS = spec.techStack.frontend === 'nextjs';
    
    if (isNextJS) {
      spec.entities.forEach(entity => {
        files.push({
          path: `src/app/api/${entity.name}/route.ts`,
          content: `import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // TODO: Implement ${entity.name} list
  return NextResponse.json({ ${entity.name}: [] });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  // TODO: Implement ${entity.name} creation
  return NextResponse.json({ success: true, data: body });
}
`,
          type: 'text',
          language: 'typescript',
        });
      });
    }
    
    return files;
  }

  private generatePages(spec: ProjectSpec): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    const isNextJS = spec.techStack.frontend === 'nextjs';
    
    if (isNextJS) {
      spec.pages.forEach(page => {
        const pagePath = page.path === '/' ? '' : page.path;
        files.push({
          path: `src/app${pagePath}/page.tsx`,
          content: `export default function ${page.name.replace(/\s+/g, '')}Page() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold">${page.nameAr || page.name}</h1>
    </div>
  );
}
`,
          type: 'text',
          language: 'tsx',
        });
      });
    }
    
    return files;
  }
}

// ==================== SINGLETON EXPORT ====================
export const fullStackGenerator: IFullStackGenerator = new FullStackGeneratorImpl();

export default fullStackGenerator;
