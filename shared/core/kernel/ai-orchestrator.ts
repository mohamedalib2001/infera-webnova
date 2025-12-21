/**
 * INFERA WebNova - AI Orchestrator Pipeline
 * Sovereign AI-Powered Development Engine
 * 
 * Transforms natural language into complete, executable applications
 * through intelligent planning, generation, and validation cycles.
 */

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { fullStackGenerator, ProjectSpecSchema as FullStackSpec, TEMPLATE_CONFIGS } from "./fullstack-generator";

// ==================== ORCHESTRATOR SCHEMAS ====================

export const IntentAnalysisSchema = z.object({
  projectType: z.enum([
    "web-app", "api", "mobile-pwa", "ecommerce", "saas", 
    "blog-cms", "dashboard", "landing-page", "custom"
  ]),
  complexity: z.enum(["simple", "moderate", "complex", "enterprise"]),
  primaryFeatures: z.array(z.string()),
  technicalRequirements: z.object({
    frontend: z.string().optional(),
    backend: z.string().optional(),
    database: z.string().optional(),
    authentication: z.boolean(),
    realtime: z.boolean(),
    fileStorage: z.boolean(),
    payments: z.boolean(),
    analytics: z.boolean(),
    i18n: z.boolean(),
  }),
  suggestedStack: z.object({
    frontend: z.string(),
    backend: z.string(),
    database: z.string(),
    orm: z.string(),
    ui: z.string(),
    auth: z.string(),
  }),
  estimatedFiles: z.number(),
  estimatedTime: z.string(),
  language: z.enum(["ar", "en"]),
});

export const BlueprintSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  version: z.string(),
  createdAt: z.string(),
  
  architecture: z.object({
    pattern: z.enum(["monolith", "modular", "microservices", "serverless"]),
    layers: z.array(z.object({
      name: z.string(),
      type: z.enum(["presentation", "business", "data", "infrastructure"]),
      components: z.array(z.string()),
    })),
  }),
  
  dataModel: z.array(z.object({
    entity: z.string(),
    fields: z.array(z.object({
      name: z.string(),
      type: z.string(),
      required: z.boolean(),
      unique: z.boolean().optional(),
      references: z.string().optional(),
    })),
    relations: z.array(z.object({
      type: z.enum(["one-to-one", "one-to-many", "many-to-many"]),
      target: z.string(),
      through: z.string().optional(),
    })).optional(),
  })),
  
  apiSpec: z.array(z.object({
    method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
    path: z.string(),
    description: z.string(),
    auth: z.boolean(),
    requestBody: z.record(z.any()).optional(),
    responseSchema: z.record(z.any()).optional(),
  })),
  
  pages: z.array(z.object({
    path: z.string(),
    name: z.string(),
    components: z.array(z.string()),
    auth: z.boolean(),
    layout: z.string().optional(),
  })),
  
  components: z.array(z.object({
    name: z.string(),
    type: z.enum(["layout", "page", "feature", "ui", "form", "data-display"]),
    props: z.array(z.object({
      name: z.string(),
      type: z.string(),
      required: z.boolean(),
    })).optional(),
    dependencies: z.array(z.string()).optional(),
  })),
});

export const GeneratedFileSchema = z.object({
  path: z.string(),
  content: z.string(),
  type: z.enum(["config", "schema", "route", "component", "page", "util", "style", "test"]),
  language: z.enum(["typescript", "javascript", "json", "css", "html", "markdown"]),
});

export const OrchestrationResultSchema = z.object({
  success: z.boolean(),
  projectId: z.string().optional(),
  blueprint: BlueprintSchema.optional(),
  files: z.array(GeneratedFileSchema),
  executionPlan: z.array(z.object({
    step: z.number(),
    action: z.string(),
    status: z.enum(["pending", "running", "completed", "failed"]),
    output: z.string().optional(),
  })),
  validationResults: z.array(z.object({
    type: z.enum(["syntax", "type", "lint", "test"]),
    passed: z.boolean(),
    errors: z.array(z.string()).optional(),
  })),
  deploymentReady: z.boolean(),
  errors: z.array(z.string()).optional(),
});

export type IntentAnalysis = z.infer<typeof IntentAnalysisSchema>;
export type Blueprint = z.infer<typeof BlueprintSchema>;
export type GeneratedFile = z.infer<typeof GeneratedFileSchema>;
export type OrchestrationResult = z.infer<typeof OrchestrationResultSchema>;

// ==================== AI ORCHESTRATOR CLASS ====================

export class AIOrchestrator {
  private anthropic: Anthropic | null = null;
  private modelId = "claude-sonnet-4-20250514";
  
  constructor() {
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic();
    }
  }

  /**
   * Analyze user intent from natural language description
   */
  async analyzeIntent(prompt: string, language: "ar" | "en" = "ar"): Promise<IntentAnalysis> {
    if (!this.anthropic) {
      return this.getDefaultIntentAnalysis(prompt, language);
    }

    const systemPrompt = language === "ar" ? `
أنت محلل ذكي لمتطلبات التطبيقات. قم بتحليل وصف المستخدم واستخرج:
1. نوع المشروع المطلوب
2. الميزات الأساسية
3. المتطلبات التقنية
4. التقنيات المقترحة

أجب بصيغة JSON فقط.
` : `
You are an intelligent application requirements analyzer. Analyze the user's description and extract:
1. Required project type
2. Core features
3. Technical requirements
4. Suggested technologies

Respond in JSON format only.
`;

    try {
      const response = await this.anthropic.messages.create({
        model: this.modelId,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{
          role: "user",
          content: `${language === "ar" ? "حلل هذا الوصف:" : "Analyze this description:"}\n\n${prompt}`,
        }],
      });

      // Handle multiple content blocks
      const textContent = response.content
        .filter(c => c.type === "text")
        .map(c => (c as { type: "text"; text: string }).text)
        .join("\n");
      
      if (textContent) {
        // Try multiple JSON extraction patterns
        const jsonMatch = textContent.match(/```json\s*([\s\S]*?)\s*```/) 
          || textContent.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          const jsonStr = jsonMatch[1] || jsonMatch[0];
          try {
            const parsed = JSON.parse(jsonStr);
            return IntentAnalysisSchema.parse({
              ...this.getDefaultIntentAnalysis(prompt, language),
              ...parsed,
            });
          } catch (parseError) {
            console.warn("JSON parse error, using defaults:", parseError);
          }
        }
      }
    } catch (error: any) {
      // Handle specific API errors
      if (error?.status === 429) {
        console.warn("Rate limited, using default analysis");
      } else if (error?.status === 401) {
        console.error("Invalid API key");
      } else {
        console.error("Intent analysis error:", error?.message || error);
      }
    }

    return this.getDefaultIntentAnalysis(prompt, language);
  }

  /**
   * Generate Blueprint from intent analysis
   */
  async generateBlueprint(intent: IntentAnalysis, customization?: Partial<Blueprint>): Promise<Blueprint> {
    const blueprintId = `bp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    
    if (!this.anthropic) {
      return this.getDefaultBlueprint(blueprintId, intent);
    }

    const systemPrompt = intent.language === "ar" ? `
أنت مهندس معماري للتطبيقات. قم بإنشاء مخطط تفصيلي للتطبيق يتضمن:
1. هيكل البيانات (entities وعلاقاتها)
2. واجهات API
3. الصفحات والمكونات
4. طبقات التطبيق

أجب بصيغة JSON فقط مع الالتزام بالمخطط المطلوب.
` : `
You are an application architect. Create a detailed blueprint including:
1. Data model (entities and relations)
2. API endpoints
3. Pages and components
4. Application layers

Respond in JSON format only, following the required schema.
`;

    try {
      const response = await this.anthropic.messages.create({
        model: this.modelId,
        max_tokens: 8192,
        system: systemPrompt,
        messages: [{
          role: "user",
          content: JSON.stringify({
            intent,
            requirements: {
              projectType: intent.projectType,
              features: intent.primaryFeatures,
              stack: intent.suggestedStack,
            },
          }),
        }],
      });

      const content = response.content[0];
      if (content.type === "text") {
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const defaultBlueprint = this.getDefaultBlueprint(blueprintId, intent);
          return BlueprintSchema.parse({
            ...defaultBlueprint,
            ...parsed,
            ...customization,
            id: blueprintId,
            version: parsed.version || defaultBlueprint.version,
            createdAt: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error("Blueprint generation error:", error);
    }

    return { ...this.getDefaultBlueprint(blueprintId, intent), ...customization };
  }

  /**
   * Generate actual code files from Blueprint
   * Uses fullStackGenerator for production-ready code
   */
  async generateCode(blueprint: Blueprint, intent: IntentAnalysis): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];

    // Map intent to fullStackGenerator spec
    const templateId = this.mapIntentToTemplate(intent);
    
    try {
      // Build minimal spec for fullStackGenerator  
      const templateConfig = TEMPLATE_CONFIGS[templateId as keyof typeof TEMPLATE_CONFIGS];
      
      if (templateConfig) {
        const spec = {
          name: blueprint.name,
          description: blueprint.description || "",
          language: intent.language,
          template: templateId,
          pages: blueprint.pages.map(p => ({
            path: p.path,
            name: p.name,
            type: p.auth ? "protected" as const : "public" as const,
            components: p.components,
            layout: "default" as const,
          })),
          entities: blueprint.dataModel.map(e => ({
            name: e.entity,
            fields: e.fields.map(f => ({
              name: f.name,
              type: f.type,
              required: f.required,
              unique: f.unique || false,
            })),
            relations: e.relations || [],
          })),
          techStack: {
            frontend: intent.suggestedStack.frontend,
            backend: intent.suggestedStack.backend,
            database: intent.suggestedStack.database,
            orm: intent.suggestedStack.orm,
            ui: intent.suggestedStack.ui,
            auth: intent.suggestedStack.auth,
          },
          features: {
            authentication: intent.technicalRequirements.authentication,
            authorization: true,
            api: true,
            database: true,
            fileUpload: intent.technicalRequirements.fileStorage,
            realtime: intent.technicalRequirements.realtime,
            i18n: intent.technicalRequirements.i18n,
            darkMode: true,
            seo: true,
            analytics: intent.technicalRequirements.analytics,
            payments: intent.technicalRequirements.payments,
          },
        };

        const result = await fullStackGenerator.generate(spec as any);
        
        if (result.success && result.files) {
          // Convert fullStackGenerator output to GeneratedFile format
          for (const [path, content] of Object.entries(result.files)) {
            if (typeof content === 'string') {
              files.push({
                path,
                content,
                type: this.inferFileType(path),
                language: this.inferLanguage(path),
              });
            }
          }
        }
      }
    } catch (error) {
      console.warn("fullStackGenerator failed, using fallback generation:", error);
    }

    // Fallback: Generate essential files if fullStackGenerator didn't produce enough
    if (files.length < 5) {
      files.push(this.generatePackageJson(blueprint, intent));
      files.push(this.generateTsConfig());
      files.push(this.generateDatabaseSchema(blueprint));
      files.push(...this.generateApiRoutes(blueprint));
      files.push(...this.generatePages(blueprint, intent));
      files.push(...this.generateComponents(blueprint));
      files.push(this.generateEnvTemplate(intent));
      files.push(this.generateReadme(blueprint, intent));
    }

    // AI-powered code enhancement for key files
    if (this.anthropic && files.length > 0) {
      const enhancedFiles = await this.enhanceCodeWithAI(files, blueprint, intent);
      return enhancedFiles;
    }

    return files;
  }

  private mapIntentToTemplate(intent: IntentAnalysis): string {
    switch (intent.projectType) {
      case "ecommerce": return "ecommerce";
      case "saas": return "saas-starter";
      case "blog-cms": return "blog-cms";
      case "dashboard": return "dashboard";
      case "landing-page": return "landing-page";
      case "api": return "api-only";
      case "mobile-pwa": return "mobile-pwa";
      default: return "react-express";
    }
  }

  private inferFileType(path: string): GeneratedFile["type"] {
    if (path.includes("config") || path.endsWith(".json")) return "config";
    if (path.includes("schema")) return "schema";
    if (path.includes("route") || path.includes("api")) return "route";
    if (path.includes("component")) return "component";
    if (path.includes("page")) return "page";
    if (path.includes("util") || path.includes("lib")) return "util";
    if (path.endsWith(".css") || path.endsWith(".scss")) return "style";
    if (path.includes("test") || path.includes("spec")) return "test";
    return "component";
  }

  private inferLanguage(path: string): GeneratedFile["language"] {
    if (path.endsWith(".ts") || path.endsWith(".tsx")) return "typescript";
    if (path.endsWith(".js") || path.endsWith(".jsx")) return "javascript";
    if (path.endsWith(".json")) return "json";
    if (path.endsWith(".css")) return "css";
    if (path.endsWith(".html")) return "html";
    if (path.endsWith(".md")) return "markdown";
    return "typescript";
  }

  /**
   * Full orchestration pipeline
   */
  async orchestrate(
    prompt: string,
    options: {
      language?: "ar" | "en";
      customStack?: Partial<IntentAnalysis["suggestedStack"]>;
      validateCode?: boolean;
      generateTests?: boolean;
    } = {}
  ): Promise<OrchestrationResult> {
    const language = options.language || "ar";
    const executionPlan: OrchestrationResult["executionPlan"] = [];
    const validationResults: OrchestrationResult["validationResults"] = [];
    const errors: string[] = [];

    try {
      // Step 1: Analyze Intent
      executionPlan.push({
        step: 1,
        action: language === "ar" ? "تحليل المتطلبات" : "Analyzing requirements",
        status: "running",
      });
      
      const intent = await this.analyzeIntent(prompt, language);
      if (options.customStack) {
        Object.assign(intent.suggestedStack, options.customStack);
      }
      
      executionPlan[0].status = "completed";
      executionPlan[0].output = language === "ar" 
        ? `تم تحديد نوع المشروع: ${intent.projectType}` 
        : `Project type identified: ${intent.projectType}`;

      // Step 2: Generate Blueprint
      executionPlan.push({
        step: 2,
        action: language === "ar" ? "إنشاء المخطط المعماري" : "Creating architecture blueprint",
        status: "running",
      });
      
      const blueprint = await this.generateBlueprint(intent);
      
      executionPlan[1].status = "completed";
      executionPlan[1].output = language === "ar"
        ? `تم إنشاء ${blueprint.dataModel.length} كيانات و${blueprint.apiSpec.length} نقاط API`
        : `Created ${blueprint.dataModel.length} entities and ${blueprint.apiSpec.length} API endpoints`;

      // Step 3: Generate Code
      executionPlan.push({
        step: 3,
        action: language === "ar" ? "توليد الكود البرمجي" : "Generating code",
        status: "running",
      });
      
      const files = await this.generateCode(blueprint, intent);
      
      executionPlan[2].status = "completed";
      executionPlan[2].output = language === "ar"
        ? `تم توليد ${files.length} ملف`
        : `Generated ${files.length} files`;

      // Step 4: Validate (optional)
      if (options.validateCode) {
        executionPlan.push({
          step: 4,
          action: language === "ar" ? "التحقق من صحة الكود" : "Validating code",
          status: "running",
        });
        
        const syntaxValid = this.validateSyntax(files);
        validationResults.push(syntaxValid);
        
        executionPlan[3].status = syntaxValid.passed ? "completed" : "failed";
        executionPlan[3].output = syntaxValid.passed 
          ? (language === "ar" ? "الكود صالح" : "Code is valid")
          : (language === "ar" ? "أخطاء في الكود" : "Code errors found");
      }

      // Step 5: Generate Tests (optional)
      if (options.generateTests) {
        executionPlan.push({
          step: executionPlan.length + 1,
          action: language === "ar" ? "توليد الاختبارات" : "Generating tests",
          status: "running",
        });
        
        const testFiles = await this.generateTests(blueprint, files);
        files.push(...testFiles);
        
        executionPlan[executionPlan.length - 1].status = "completed";
        executionPlan[executionPlan.length - 1].output = language === "ar"
          ? `تم توليد ${testFiles.length} ملف اختبار`
          : `Generated ${testFiles.length} test files`;
      }

      return {
        success: true,
        projectId: `proj_${Date.now()}`,
        blueprint,
        files,
        executionPlan,
        validationResults,
        deploymentReady: validationResults.every(v => v.passed),
      };

    } catch (error: any) {
      errors.push(error.message);
      return {
        success: false,
        files: [],
        executionPlan,
        validationResults,
        deploymentReady: false,
        errors,
      };
    }
  }

  // ==================== HELPER METHODS ====================

  private getDefaultIntentAnalysis(prompt: string, language: "ar" | "en"): IntentAnalysis {
    const hasEcommerce = /متجر|shop|store|ecommerce|cart/i.test(prompt);
    const hasSaas = /saas|subscription|dashboard/i.test(prompt);
    const hasBlog = /blog|مقال|article|cms/i.test(prompt);
    const hasApi = /api|واجهة|endpoint/i.test(prompt);
    
    let projectType: IntentAnalysis["projectType"] = "web-app";
    if (hasEcommerce) projectType = "ecommerce";
    else if (hasSaas) projectType = "saas";
    else if (hasBlog) projectType = "blog-cms";
    else if (hasApi) projectType = "api";

    return {
      projectType,
      complexity: "moderate",
      primaryFeatures: [
        "User authentication",
        "CRUD operations",
        "Responsive design",
        "Dark mode",
      ],
      technicalRequirements: {
        frontend: "react",
        backend: "express",
        database: "postgresql",
        authentication: true,
        realtime: false,
        fileStorage: false,
        payments: hasEcommerce,
        analytics: false,
        i18n: true,
      },
      suggestedStack: {
        frontend: "react",
        backend: "express",
        database: "postgresql",
        orm: "drizzle",
        ui: "tailwind",
        auth: "jwt",
      },
      estimatedFiles: 25,
      estimatedTime: "15 minutes",
      language,
    };
  }

  private getDefaultBlueprint(id: string, intent: IntentAnalysis): Blueprint {
    return {
      id,
      name: "Generated Project",
      description: "AI-generated application",
      version: "1.0.0",
      createdAt: new Date().toISOString(),
      architecture: {
        pattern: "modular",
        layers: [
          { name: "Presentation", type: "presentation", components: ["pages", "components"] },
          { name: "Business", type: "business", components: ["services", "hooks"] },
          { name: "Data", type: "data", components: ["api", "schema"] },
        ],
      },
      dataModel: [
        {
          entity: "User",
          fields: [
            { name: "id", type: "uuid", required: true, unique: true },
            { name: "email", type: "string", required: true, unique: true },
            { name: "name", type: "string", required: true },
            { name: "role", type: "enum", required: true },
            { name: "createdAt", type: "timestamp", required: true },
          ],
        },
      ],
      apiSpec: [
        { method: "GET", path: "/api/users", description: "List users", auth: true },
        { method: "POST", path: "/api/users", description: "Create user", auth: true },
        { method: "GET", path: "/api/users/:id", description: "Get user", auth: true },
        { method: "PATCH", path: "/api/users/:id", description: "Update user", auth: true },
        { method: "DELETE", path: "/api/users/:id", description: "Delete user", auth: true },
      ],
      pages: [
        { path: "/", name: "Home", components: ["Hero", "Features"], auth: false },
        { path: "/dashboard", name: "Dashboard", components: ["Stats", "Chart"], auth: true },
        { path: "/login", name: "Login", components: ["LoginForm"], auth: false },
      ],
      components: [
        { name: "Header", type: "layout", props: [] },
        { name: "Footer", type: "layout", props: [] },
        { name: "Hero", type: "feature", props: [] },
        { name: "LoginForm", type: "form", props: [] },
      ],
    };
  }

  private generatePackageJson(blueprint: Blueprint, intent: IntentAnalysis): GeneratedFile {
    const pkg = {
      name: blueprint.name.toLowerCase().replace(/\s+/g, "-"),
      version: "1.0.0",
      private: true,
      scripts: {
        dev: "vite",
        build: "tsc && vite build",
        preview: "vite preview",
        start: "node dist/server.js",
      },
      dependencies: {
        react: "^18.2.0",
        "react-dom": "^18.2.0",
        "react-router-dom": "^6.20.0",
        "@tanstack/react-query": "^5.0.0",
        axios: "^1.6.0",
        zod: "^3.22.0",
        "drizzle-orm": "^0.29.0",
        express: "^4.18.0",
        pg: "^8.11.0",
        "dotenv": "^16.3.0",
      },
      devDependencies: {
        typescript: "^5.3.0",
        vite: "^5.0.0",
        "@vitejs/plugin-react": "^4.2.0",
        "@types/react": "^18.2.0",
        "@types/react-dom": "^18.2.0",
        "@types/express": "^4.17.0",
        "@types/node": "^20.10.0",
        tailwindcss: "^3.4.0",
        postcss: "^8.4.0",
        autoprefixer: "^10.4.0",
        "drizzle-kit": "^0.20.0",
      },
    };

    return {
      path: "package.json",
      content: JSON.stringify(pkg, null, 2),
      type: "config",
      language: "json",
    };
  }

  private generateTsConfig(): GeneratedFile {
    const config = {
      compilerOptions: {
        target: "ES2022",
        useDefineForClassFields: true,
        lib: ["ES2022", "DOM", "DOM.Iterable"],
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
          "@/*": ["./src/*"],
          "@shared/*": ["./shared/*"],
        },
      },
      include: ["src"],
    };

    return {
      path: "tsconfig.json",
      content: JSON.stringify(config, null, 2),
      type: "config",
      language: "json",
    };
  }

  private generateDatabaseSchema(blueprint: Blueprint): GeneratedFile {
    const imports = `import { pgTable, uuid, text, timestamp, varchar, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
`;

    const entities = blueprint.dataModel.map(entity => {
      const fields = entity.fields.map(field => {
        let drizzleType = "text";
        switch (field.type) {
          case "uuid": drizzleType = "uuid"; break;
          case "string": drizzleType = "text"; break;
          case "timestamp": drizzleType = "timestamp"; break;
          case "boolean": drizzleType = "boolean"; break;
          case "enum": drizzleType = "text"; break;
        }
        
        let line = `  ${field.name}: ${drizzleType}("${field.name}")`;
        if (field.name === "id") line += ".primaryKey().defaultRandom()";
        if (field.required && field.name !== "id") line += ".notNull()";
        if (field.unique && field.name !== "id") line += ".unique()";
        if (field.name === "createdAt") line += ".defaultNow()";
        
        return line;
      }).join(",\n");

      return `export const ${entity.entity.toLowerCase()}s = pgTable("${entity.entity.toLowerCase()}s", {
${fields}
});

export const insert${entity.entity}Schema = createInsertSchema(${entity.entity.toLowerCase()}s).omit({ id: true, createdAt: true });
export type Insert${entity.entity} = z.infer<typeof insert${entity.entity}Schema>;
export type ${entity.entity} = typeof ${entity.entity.toLowerCase()}s.$inferSelect;
`;
    }).join("\n");

    return {
      path: "src/db/schema.ts",
      content: imports + "\n" + entities,
      type: "schema",
      language: "typescript",
    };
  }

  private generateApiRoutes(blueprint: Blueprint): GeneratedFile[] {
    const routeGroups = new Map<string, typeof blueprint.apiSpec>();
    
    blueprint.apiSpec.forEach(endpoint => {
      const resource = endpoint.path.split("/")[2] || "main";
      if (!routeGroups.has(resource)) {
        routeGroups.set(resource, []);
      }
      routeGroups.get(resource)!.push(endpoint);
    });

    const files: GeneratedFile[] = [];

    routeGroups.forEach((endpoints, resource) => {
      const handlers = endpoints.map(ep => {
        const handlerName = `${ep.method.toLowerCase()}${resource.charAt(0).toUpperCase() + resource.slice(1)}`;
        return `
export async function ${handlerName}(req: Request, res: Response) {
  try {
    // ${ep.description}
    ${ep.auth ? "// Requires authentication" : ""}
    res.json({ success: true, message: "${ep.description}" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}`;
      }).join("\n");

      files.push({
        path: `src/api/${resource}.ts`,
        content: `import { Request, Response } from "express";
${handlers}
`,
        type: "route",
        language: "typescript",
      });
    });

    return files;
  }

  private generatePages(blueprint: Blueprint, intent: IntentAnalysis): GeneratedFile[] {
    return blueprint.pages.map(page => {
      const componentImports = page.components.map(c => 
        `import { ${c} } from "@/components/${c}";`
      ).join("\n");

      const componentUsage = page.components.map(c => 
        `      <${c} />`
      ).join("\n");

      const content = `${componentImports}

export default function ${page.name.replace(/\s+/g, "")}Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">${page.name}</h1>
${componentUsage}
    </div>
  );
}
`;

      return {
        path: `src/pages/${page.name.toLowerCase().replace(/\s+/g, "-")}.tsx`,
        content,
        type: "page",
        language: "typescript",
      };
    });
  }

  private generateComponents(blueprint: Blueprint): GeneratedFile[] {
    return blueprint.components.map(comp => {
      const content = `export function ${comp.name}() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold">${comp.name}</h2>
      {/* ${comp.type} component */}
    </div>
  );
}
`;

      return {
        path: `src/components/${comp.name}.tsx`,
        content,
        type: "component",
        language: "typescript",
      };
    });
  }

  private generateEnvTemplate(intent: IntentAnalysis): GeneratedFile {
    let content = `# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Authentication
JWT_SECRET=your-secret-key
SESSION_SECRET=your-session-secret

# Server
PORT=3000
NODE_ENV=development
`;

    if (intent.technicalRequirements.payments) {
      content += `
# Payments
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
`;
    }

    if (intent.technicalRequirements.analytics) {
      content += `
# Analytics
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
`;
    }

    return {
      path: ".env.example",
      content,
      type: "config",
      language: "markdown",
    };
  }

  private generateReadme(blueprint: Blueprint, intent: IntentAnalysis): GeneratedFile {
    const isAr = intent.language === "ar";
    const content = isAr ? `# ${blueprint.name}

${blueprint.description}

## المتطلبات
- Node.js 18+
- PostgreSQL 15+

## التثبيت
\`\`\`bash
npm install
cp .env.example .env
npm run db:push
npm run dev
\`\`\`

## الميزات
${intent.primaryFeatures.map(f => `- ${f}`).join("\n")}

## التقنيات المستخدمة
- Frontend: ${intent.suggestedStack.frontend}
- Backend: ${intent.suggestedStack.backend}
- Database: ${intent.suggestedStack.database}
- ORM: ${intent.suggestedStack.orm}
- UI: ${intent.suggestedStack.ui}
` : `# ${blueprint.name}

${blueprint.description}

## Requirements
- Node.js 18+
- PostgreSQL 15+

## Installation
\`\`\`bash
npm install
cp .env.example .env
npm run db:push
npm run dev
\`\`\`

## Features
${intent.primaryFeatures.map(f => `- ${f}`).join("\n")}

## Tech Stack
- Frontend: ${intent.suggestedStack.frontend}
- Backend: ${intent.suggestedStack.backend}
- Database: ${intent.suggestedStack.database}
- ORM: ${intent.suggestedStack.orm}
- UI: ${intent.suggestedStack.ui}
`;

    return {
      path: "README.md",
      content,
      type: "config",
      language: "markdown",
    };
  }

  private async enhanceCodeWithAI(
    files: GeneratedFile[], 
    blueprint: Blueprint, 
    intent: IntentAnalysis
  ): Promise<GeneratedFile[]> {
    if (!this.anthropic) return files;

    const enhancedFiles = [...files];

    // Enhance key files with AI
    for (let i = 0; i < enhancedFiles.length; i++) {
      const file = enhancedFiles[i];
      if (file.type === "component" || file.type === "page") {
        try {
          const response = await this.anthropic.messages.create({
            model: this.modelId,
            max_tokens: 4096,
            system: "You are an expert React/TypeScript developer. Enhance the provided code to be more complete, professional, and production-ready. Include proper styling, error handling, and accessibility. Return only the enhanced code, no explanations.",
            messages: [{
              role: "user",
              content: `Enhance this ${file.type}:\n\n${file.content}`,
            }],
          });

          const content = response.content[0];
          if (content.type === "text") {
            const codeMatch = content.text.match(/```(?:tsx?|jsx?)?\n?([\s\S]*?)```/);
            if (codeMatch) {
              enhancedFiles[i] = { ...file, content: codeMatch[1].trim() };
            }
          }
        } catch (error) {
          console.error(`Failed to enhance ${file.path}:`, error);
        }
      }
    }

    return enhancedFiles;
  }

  private validateSyntax(files: GeneratedFile[]): OrchestrationResult["validationResults"][0] {
    const errors: string[] = [];
    
    for (const file of files) {
      if (file.language === "typescript" || file.language === "javascript") {
        // Basic syntax checks
        const openBraces = (file.content.match(/\{/g) || []).length;
        const closeBraces = (file.content.match(/\}/g) || []).length;
        if (openBraces !== closeBraces) {
          errors.push(`${file.path}: Mismatched braces`);
        }

        const openParens = (file.content.match(/\(/g) || []).length;
        const closeParens = (file.content.match(/\)/g) || []).length;
        if (openParens !== closeParens) {
          errors.push(`${file.path}: Mismatched parentheses`);
        }
      }

      if (file.language === "json") {
        try {
          JSON.parse(file.content);
        } catch {
          errors.push(`${file.path}: Invalid JSON`);
        }
      }
    }

    return {
      type: "syntax",
      passed: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  private async generateTests(blueprint: Blueprint, files: GeneratedFile[]): Promise<GeneratedFile[]> {
    const testFiles: GeneratedFile[] = [];

    // Generate component tests
    const components = files.filter(f => f.type === "component");
    for (const comp of components) {
      const compName = comp.path.split("/").pop()?.replace(".tsx", "") || "Component";
      testFiles.push({
        path: comp.path.replace(".tsx", ".test.tsx"),
        content: `import { render, screen } from "@testing-library/react";
import { ${compName} } from "./${compName}";

describe("${compName}", () => {
  it("renders without crashing", () => {
    render(<${compName} />);
    expect(screen.getByRole("heading")).toBeInTheDocument();
  });
});
`,
        type: "test",
        language: "typescript",
      });
    }

    return testFiles;
  }
}

// Export singleton instance
export const aiOrchestrator = new AIOrchestrator();
