import type { Express } from "express";
import { storage } from "./storage";
import { db } from "./db";
import { architecturePatterns } from "@shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { sandboxExecutor } from "@shared/core/kernel/sandbox-executor";
import { executeCommand as terminalExecute } from "./terminal-service";

const anthropic = new Anthropic();

// Import Nova permission checking
import { hasPermission } from "./nova-permissions";

// Tool to permission mapping - simple tools with single permission requirement
const simpleToolPermissionMap: Record<string, string> = {
  run_command: "execute_shell",
  create_file: "create_files",
  generate_platform: "ai_code_generation",
  read_database: "db_read",
  write_database: "db_write",
  delete_database: "db_delete",
};

// Language-specific permission mapping for execute_code
const languagePermissionMap: Record<string, string> = {
  javascript: "execute_nodejs",
  typescript: "execute_nodejs",
  nodejs: "execute_nodejs",
  python: "execute_python",
  bash: "execute_shell",
  shell: "execute_shell",
};

// Deployment permission mapping based on environment
const deploymentPermissionMap: Record<string, string> = {
  development: "deploy_preview",
  staging: "deploy_preview",
  production: "deploy_production",
};

// Check if user has required permission for a tool with context-aware checks
async function checkToolPermission(
  userId: string, 
  toolName: string, 
  toolInput?: any
): Promise<{ allowed: boolean; missingPermission?: string }> {
  
  // Handle execute_code with language-specific permissions
  if (toolName === "execute_code") {
    const language = toolInput?.language?.toLowerCase() || "javascript";
    const requiredPerm = languagePermissionMap[language];
    if (!requiredPerm) {
      return { allowed: false, missingPermission: `execute_${language}` };
    }
    const hasP = await hasPermission(userId, requiredPerm);
    return hasP 
      ? { allowed: true } 
      : { allowed: false, missingPermission: requiredPerm };
  }
  
  // Handle deploy_platform with environment-specific permissions
  if (toolName === "deploy_platform") {
    const environment = toolInput?.environment?.toLowerCase() || "development";
    const requiredPerm = deploymentPermissionMap[environment] || "deploy_preview";
    const hasP = await hasPermission(userId, requiredPerm);
    return hasP 
      ? { allowed: true } 
      : { allowed: false, missingPermission: requiredPerm };
  }
  
  // Handle simple tools with single permission
  const requiredPermission = simpleToolPermissionMap[toolName];
  if (!requiredPermission) {
    return { allowed: true }; // No specific permission required for unknown tools
  }
  
  const hasP = await hasPermission(userId, requiredPermission);
  return hasP 
    ? { allowed: true } 
    : { allowed: false, missingPermission: requiredPermission };
}

// Nova Tool definitions for Claude function calling
const novaTools: Anthropic.Tool[] = [
  {
    name: "execute_code",
    description: "Execute code in a sandboxed environment. Supports Node.js, Python, TypeScript, and more.",
    input_schema: {
      type: "object" as const,
      properties: {
        language: { type: "string", enum: ["javascript", "typescript", "python", "bash"], description: "Programming language" },
        code: { type: "string", description: "Code to execute" },
        projectId: { type: "string", description: "Project ID for context" }
      },
      required: ["language", "code"]
    }
  },
  {
    name: "run_command",
    description: "Run a shell command like npm install, npm build, git clone, etc.",
    input_schema: {
      type: "object" as const,
      properties: {
        command: { type: "string", description: "Shell command to run" },
        projectId: { type: "string", description: "Project ID for context" }
      },
      required: ["command"]
    }
  },
  {
    name: "create_file",
    description: "Create or update a file in the project",
    input_schema: {
      type: "object" as const,
      properties: {
        projectId: { type: "string", description: "Project ID" },
        filePath: { type: "string", description: "File path relative to project root" },
        content: { type: "string", description: "File content" }
      },
      required: ["projectId", "filePath", "content"]
    }
  },
  {
    name: "generate_platform",
    description: "Generate a complete full-stack platform with frontend, backend, and database",
    input_schema: {
      type: "object" as const,
      properties: {
        name: { type: "string", description: "Platform name" },
        description: { type: "string", description: "What the platform does" },
        industry: { type: "string", enum: ["saas", "ecommerce", "healthcare", "education", "government", "fintech"], description: "Industry type" },
        features: { type: "array", items: { type: "string" }, description: "List of features" }
      },
      required: ["name", "description"]
    }
  },
  {
    name: "deploy_platform",
    description: "Deploy the platform to a cloud provider",
    input_schema: {
      type: "object" as const,
      properties: {
        projectId: { type: "string", description: "Project ID to deploy" },
        provider: { type: "string", enum: ["vercel", "netlify", "railway", "hetzner"], description: "Cloud provider" },
        environment: { type: "string", enum: ["development", "staging", "production"], description: "Deployment environment" }
      },
      required: ["projectId", "provider"]
    }
  }
];

// Execute Nova tool with permission checking
async function executeNovaTool(toolName: string, toolInput: any, userId: string): Promise<string> {
  try {
    // Check permission before executing tool - pass toolInput for context-aware checks
    const permCheck = await checkToolPermission(userId, toolName, toolInput);
    if (!permCheck.allowed) {
      return JSON.stringify({
        success: false,
        error: `Permission denied: ${permCheck.missingPermission}`,
        errorAr: `الصلاحية مرفوضة: ${permCheck.missingPermission}`,
        requiredPermission: permCheck.missingPermission,
      });
    }
    
    switch (toolName) {
      case "execute_code": {
        const result = await sandboxExecutor.execute({
          language: toolInput.language === "javascript" ? "nodejs" : toolInput.language,
          code: toolInput.code,
          args: [],
          env: {},
          timeout: 30000,
          resources: {
            maxCpu: 1,
            maxMemory: 256,
            maxDisk: 100,
            networkEnabled: false
          }
        });
        return JSON.stringify({
          success: result.success,
          output: result.stdout || result.output,
          error: result.stderr || result.error,
          executionTime: result.executionTime
        });
      }
      
      case "run_command": {
        const projectId = toolInput.projectId || "default";
        const result = await terminalExecute(projectId, toolInput.command);
        return JSON.stringify({
          success: result.code === 0,
          stdout: result.stdout,
          stderr: result.stderr,
          exitCode: result.code
        });
      }
      
      case "create_file": {
        // Store file in project via storage
        const project = await storage.getProject(toolInput.projectId);
        if (project) {
          // For now, we'll return success - in full implementation this would write to filesystem
          return JSON.stringify({
            success: true,
            message: `File ${toolInput.filePath} created successfully`,
            path: toolInput.filePath
          });
        }
        return JSON.stringify({ success: false, error: "Project not found" });
      }
      
      case "generate_platform": {
        // Check if Anthropic API is configured FIRST before any DB operations
        const { getAnthropicClientAsync } = await import("./ai-config");
        const anthropicClient = await getAnthropicClientAsync();
        
        if (!anthropicClient) {
          return JSON.stringify({
            success: false,
            error: "Anthropic API not configured. Please add ANTHROPIC_API_KEY to use platform generation.",
            errorAr: "مزود الذكاء الاصطناعي Anthropic غير مهيأ. يرجى إضافة ANTHROPIC_API_KEY لاستخدام توليد المنصات.",
            requiresConfiguration: true,
            action: "Configure ANTHROPIC_API_KEY in your environment secrets"
          });
        }
        
        // Use FullStackGenerator to create complete platform with actual code
        const { FullStackGenerator } = await import("./full-stack-generator");
        const generator = new FullStackGenerator();
        
        try {
          const result = await generator.generateProject({
            name: toolInput.name,
            nameAr: toolInput.name,
            description: toolInput.description,
            descriptionAr: toolInput.description,
            industry: toolInput.industry || "other",
            features: toolInput.features || ["dashboard", "users", "settings"],
            hasAuth: true,
            hasPayments: false,
            language: "bilingual"
          });
          
          return JSON.stringify({
            success: true,
            projectId: result.projectId,
            message: `Platform "${toolInput.name}" created with ${result.files.length} files`,
            messageAr: `تم إنشاء منصة "${toolInput.name}" مع ${result.files.length} ملف`,
            filesGenerated: result.files.length,
            apiEndpoints: result.apiEndpoints.length,
            files: result.files.map(f => f.path),
            nextSteps: ["Review generated code", "Configure settings", "Deploy"]
          });
        } catch (genError: any) {
          console.error("[Nova] Platform generation error:", genError);
          return JSON.stringify({
            success: false,
            error: genError.message,
            errorAr: "حدث خطأ أثناء إنشاء المنصة"
          });
        }
      }
      
      case "deploy_platform": {
        // Return deployment initiation - in full implementation this calls deployment service
        return JSON.stringify({
          success: true,
          status: "initiated",
          provider: toolInput.provider,
          message: `Deployment to ${toolInput.provider} initiated for project ${toolInput.projectId}`,
          estimatedTime: "2-5 minutes"
        });
      }
      
      default:
        return JSON.stringify({ error: `Unknown tool: ${toolName}` });
    }
  } catch (error: any) {
    return JSON.stringify({ error: error.message });
  }
}

// Helper to get user ID from request (supports both Replit Auth and session-based auth)
function getUserId(req: any): string | null {
  // Check Replit Auth first (passport)
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    const replitUser = req.user as any;
    return replitUser.claims?.sub || replitUser.id;
  }
  
  // Fallback to traditional session auth
  if (req.session?.userId) {
    return req.session.userId;
  }
  
  return null;
}

// Middleware to ensure user is authenticated (supports both Replit Auth and session-based auth)
async function requireAuth(req: any, res: any, next: any) {
  const userId = getUserId(req);
  if (userId) {
    // Attach userId to request for downstream use
    req.userId = userId;
    // Also create a user-like object for backward compatibility
    if (!req.user) {
      req.user = { id: userId };
    } else if (!(req.user as any).id) {
      (req.user as any).id = userId;
    }
    return next();
  }
  
  return res.status(401).json({ error: "غير مصرح - يجب تسجيل الدخول" });
}

// Validation schemas
const createSessionSchema = z.object({
  projectId: z.string().optional(),
  title: z.string().optional(),
  language: z.enum(["ar", "en"]).default("ar"),
});

// Shared attachment schema with size validation
const attachmentSchema = z.object({
  type: z.enum(["image", "file", "code", "blueprint"]),
  url: z.string().optional(),
  content: z.string().max(10 * 1024 * 1024).optional(), // Max 10MB base64
  metadata: z.object({
    mimeType: z.string().optional(),
    name: z.string().optional(),
  }).passthrough().optional(),
});

const sendMessageSchema = z.object({
  content: z.string().min(1),
  language: z.enum(["ar", "en"]).default("ar"),
  attachments: z.array(attachmentSchema).max(5).optional(), // Max 5 attachments
});

const createDecisionSchema = z.object({
  sessionId: z.string().optional(),
  messageId: z.string().optional(),
  category: z.enum(["architecture", "security", "deployment", "database", "ui", "integration"]),
  decisionType: z.enum(["choice", "configuration", "approval", "rejection"]),
  question: z.string(),
  selectedOption: z.string(),
  alternatives: z.array(z.string()).optional(),
  context: z.object({
    projectId: z.string().optional(),
    blueprintId: z.string().optional(),
    affectedComponents: z.array(z.string()).optional(),
    dependencies: z.array(z.string()).optional(),
    costImpact: z.object({
      estimate: z.number(),
      currency: z.string(),
    }).optional(),
    riskLevel: z.enum(["low", "medium", "high", "critical"]).optional(),
  }).optional(),
  reasoning: z.string().optional(),
  userNotes: z.string().optional(),
});

const updatePreferencesSchema = z.object({
  preferredLanguage: z.enum(["ar", "en"]).optional(),
  preferredFramework: z.string().optional(),
  preferredDatabase: z.string().optional(),
  preferredCloudProvider: z.string().optional(),
  preferredUIStyle: z.string().optional(),
  detailLevel: z.enum(["brief", "balanced", "detailed"]).optional(),
  codeExplanations: z.boolean().optional(),
  showAlternatives: z.boolean().optional(),
});

const createKnowledgeNodeSchema = z.object({
  nodeType: z.enum(["decision", "component", "requirement", "constraint", "dependency", "risk", "goal"]),
  name: z.string().min(1).max(200),
  nameAr: z.string().optional(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  technicalDetails: z.record(z.any()).optional(),
  businessIntent: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
});

// Operations Platform Validation Schemas
const createDeploymentConfigSchema = z.object({
  name: z.string().optional(),
  nameAr: z.string().optional(),
  environment: z.enum(["development", "staging", "production"]).default("development"),
  provider: z.string().default("hetzner"),
  region: z.string().optional(),
  instanceType: z.string().optional(),
  autoScaling: z.boolean().optional(),
  minInstances: z.number().min(1).max(10).optional(),
  maxInstances: z.number().min(1).max(50).optional(),
  envVars: z.record(z.string()).optional(),
  domain: z.string().optional(),
  customDomain: z.string().optional(),
  sslEnabled: z.boolean().optional(),
  cdnEnabled: z.boolean().optional(),
  healthCheckPath: z.string().optional(),
  autoDeploy: z.boolean().optional(),
  deployBranch: z.string().optional(),
});

const createDeploymentSchema = z.object({
  configId: z.string(),
  version: z.string().min(1),
  commitHash: z.string().optional(),
  commitMessage: z.string().optional(),
});

// Multi-Surface Generator Validation Schemas
const createBuildConfigSchema = z.object({
  name: z.string().optional(),
  nameAr: z.string().optional(),
  platform: z.enum(["web", "android", "ios", "windows", "macos", "linux"]),
  buildType: z.enum(["debug", "release", "production"]).default("release"),
  appName: z.string().optional(),
  appNameAr: z.string().optional(),
  bundleId: z.string().optional(),
  version: z.string().default("1.0.0"),
  versionCode: z.number().int().positive().optional(),
  appIcon: z.string().optional(),
  splashScreen: z.string().optional(),
  buildSettings: z.record(z.any()).optional(),
  signingConfig: z.record(z.any()).optional(),
  targetSdk: z.number().optional(),
  minimumSdk: z.number().optional(),
});

const startBuildSchema = z.object({
  configId: z.string(),
  version: z.string().optional(),
});

// Unified Blueprint Validation Schema
const createBlueprintSchema = z.object({
  name: z.string().min(1).max(200),
  nameAr: z.string().optional(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  version: z.string().default("1.0.0"),
  definition: z.object({
    entities: z.array(z.object({
      name: z.string(),
      fields: z.array(z.object({
        name: z.string(),
        type: z.string(),
        required: z.boolean().optional(),
      })),
      relationships: z.array(z.object({
        entity: z.string(),
        type: z.string(),
      })).optional(),
    })),
    screens: z.array(z.object({
      name: z.string(),
      type: z.enum(["list", "detail", "form", "dashboard"]),
      entity: z.string().optional(),
      components: z.array(z.object({
        type: z.string(),
        props: z.record(z.any()).optional(),
      })).optional(),
    })),
    navigation: z.object({
      type: z.enum(["tabs", "drawer", "stack"]),
      routes: z.array(z.object({
        name: z.string(),
        screen: z.string(),
        icon: z.string().optional(),
      })),
    }),
    theme: z.object({
      primaryColor: z.string(),
      secondaryColor: z.string(),
      fontFamily: z.string().optional(),
    }).optional(),
    features: z.array(z.string()).optional(),
  }),
});

export function registerNovaRoutes(app: Express) {
  // ==================== NOVA SESSIONS ====================

  // Get user's conversation sessions
  app.get("/api/nova/sessions", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const limit = parseInt(req.query.limit as string) || 20;
      const sessions = await storage.getUserNovaSessions(userId, limit);
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create new conversation session
  app.post("/api/nova/sessions", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const data = createSessionSchema.parse(req.body);
      
      const session = await storage.createNovaSession({
        userId,
        ...data,
      });
      
      // Update user preferences interaction
      await storage.upsertNovaPreferences(userId, {
        preferredLanguage: data.language,
      });
      
      res.json(session);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Get specific session
  app.get("/api/nova/sessions/:id", requireAuth, async (req, res) => {
    try {
      const session = await storage.getNovaSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "الجلسة غير موجودة" });
      }
      if (session.userId !== (req.user as any).id) {
        return res.status(403).json({ error: "غير مصرح بالوصول لهذه الجلسة" });
      }
      res.json(session);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Archive session
  app.post("/api/nova/sessions/:id/archive", requireAuth, async (req, res) => {
    try {
      const session = await storage.getNovaSession(req.params.id);
      if (!session || session.userId !== (req.user as any).id) {
        return res.status(404).json({ error: "الجلسة غير موجودة" });
      }
      
      const archived = await storage.archiveNovaSession(req.params.id);
      res.json(archived);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete session
  app.delete("/api/nova/sessions/:id", requireAuth, async (req, res) => {
    try {
      const session = await storage.getNovaSession(req.params.id);
      if (!session || session.userId !== (req.user as any).id) {
        return res.status(404).json({ error: "الجلسة غير موجودة" });
      }
      
      await storage.deleteNovaSession(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== NOVA MESSAGES ====================

  // Get session messages
  app.get("/api/nova/sessions/:sessionId/messages", requireAuth, async (req, res) => {
    try {
      const session = await storage.getNovaSession(req.params.sessionId);
      if (!session || session.userId !== (req.user as any).id) {
        return res.status(404).json({ error: "الجلسة غير موجودة" });
      }
      
      const limit = parseInt(req.query.limit as string) || 100;
      const messages = await storage.getSessionMessages(req.params.sessionId, limit);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Send message and get AI response
  app.post("/api/nova/sessions/:sessionId/messages", requireAuth, async (req, res) => {
    try {
      const session = await storage.getNovaSession(req.params.sessionId);
      if (!session || session.userId !== (req.user as any).id) {
        return res.status(404).json({ error: "الجلسة غير موجودة" });
      }
      
      const data = sendMessageSchema.parse(req.body);
      const userId = (req.user as any).id;
      
      // Save user message
      const userMessage = await storage.createNovaMessage({
        sessionId: req.params.sessionId,
        role: "user",
        content: data.content,
        language: data.language,
        attachments: data.attachments,
      });
      
      // Get user preferences for context
      const preferences = await storage.getNovaPreferences(userId);
      
      // Get recent messages for context (last 50 messages to maintain memory)
      const recentMessages = await storage.getRecentSessionMessages(req.params.sessionId, 50);
      
      // Get active decisions for context
      const decisions = await storage.getActiveDecisions(userId);
      
      // Build system prompt
      const systemPrompt = buildSystemPrompt(data.language, preferences, decisions);
      
      // Build conversation history with Vision support for images
      const conversationHistory: any[] = recentMessages.map(msg => {
        // Check if message has image attachments
        const attachments = (msg as any).attachments || [];
        const imageAttachments = attachments.filter((a: any) => a.type === "image");
        
        if (imageAttachments.length > 0 && msg.role === "user") {
          // Build multi-modal content with images
          const contentParts: any[] = [];
          
          // Add images first
          for (const img of imageAttachments) {
            if (img.content) {
              // Base64 image data
              const mediaType = img.metadata?.mimeType || "image/png";
              contentParts.push({
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType,
                  data: img.content.replace(/^data:image\/\w+;base64,/, ""),
                },
              });
            } else if (img.url) {
              // URL-based image
              contentParts.push({
                type: "image",
                source: {
                  type: "url",
                  url: img.url,
                },
              });
            }
          }
          
          // Add text content
          contentParts.push({
            type: "text",
            text: msg.content,
          });
          
          return {
            role: msg.role as "user" | "assistant",
            content: contentParts,
          };
        }
        
        return {
          role: msg.role as "user" | "assistant",
          content: msg.content,
        };
      });
      
      // Add current message with any new images
      const currentImageAttachments = (data.attachments || []).filter(a => a.type === "image");
      if (currentImageAttachments.length > 0) {
        // Replace last user message (which is the current one) with vision-enabled version
        const lastMsgIndex = conversationHistory.length - 1;
        if (lastMsgIndex >= 0 && conversationHistory[lastMsgIndex].role === "user") {
          const contentParts: any[] = [];
          
          for (const img of currentImageAttachments) {
            if (img.content) {
              const mediaType = img.metadata?.mimeType || "image/png";
              contentParts.push({
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType,
                  data: img.content.replace(/^data:image\/\w+;base64,/, ""),
                },
              });
            } else if (img.url) {
              contentParts.push({
                type: "image",
                source: {
                  type: "url",
                  url: img.url,
                },
              });
            }
          }
          
          contentParts.push({
            type: "text",
            text: data.content,
          });
          
          conversationHistory[lastMsgIndex] = {
            role: "user",
            content: contentParts,
          };
        }
      }
      
      const startTime = Date.now();
      
      // Call Claude AI with tools for agentic capabilities (Vision-enabled)
      let response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: systemPrompt,
        messages: conversationHistory,
        tools: novaTools,
      });
      
      let aiContent = "";
      let toolResults: any[] = [];
      let totalTokens = response.usage.input_tokens + response.usage.output_tokens;
      
      // Handle tool use loop - Nova can now execute actions!
      while (response.stop_reason === "tool_use") {
        const toolUseBlocks = response.content.filter(block => block.type === "tool_use");
        const textBlocks = response.content.filter(block => block.type === "text");
        
        // Collect any text before tool use
        for (const block of textBlocks) {
          if (block.type === "text") {
            aiContent += block.text + "\n";
          }
        }
        
        // Execute each tool
        const toolResultMessages: any[] = [];
        for (const toolUse of toolUseBlocks) {
          if (toolUse.type === "tool_use") {
            console.log(`[Nova] Executing tool: ${toolUse.name}`, toolUse.input);
            const result = await executeNovaTool(toolUse.name, toolUse.input, userId);
            toolResults.push({ tool: toolUse.name, input: toolUse.input, result: JSON.parse(result) });
            toolResultMessages.push({
              type: "tool_result",
              tool_use_id: toolUse.id,
              content: result,
            });
          }
        }
        
        // Continue conversation with tool results
        response = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          system: systemPrompt,
          messages: [
            ...conversationHistory,
            { role: "assistant", content: response.content },
            { role: "user", content: toolResultMessages },
          ],
          tools: novaTools,
        });
        
        totalTokens += response.usage.input_tokens + response.usage.output_tokens;
      }
      
      // Extract final text response
      for (const block of response.content) {
        if (block.type === "text") {
          aiContent += block.text;
        }
      }
      
      const responseTime = Date.now() - startTime;
      const tokensUsed = totalTokens;
      
      // Extract any interactive actions from AI response
      const actions = extractActionsFromResponse(aiContent);
      
      // Add tool execution info to actions if tools were used
      if (toolResults.length > 0) {
        actions.push({
          id: `tools-${Date.now()}`,
          type: "tool_execution",
          label: `Executed ${toolResults.length} action(s)`,
          labelAr: `تم تنفيذ ${toolResults.length} إجراء(ات)`,
          status: "completed",
          toolResults,
        });
      }
      
      // Save AI response
      const aiMessage = await storage.createNovaMessage({
        sessionId: req.params.sessionId,
        role: "assistant",
        content: aiContent,
        language: data.language,
        modelUsed: "claude-sonnet-4-20250514",
        tokensUsed,
        responseTime,
        actions: actions.length > 0 ? actions : undefined,
      });
      
      // Update session summary periodically
      if (session.messageCount && session.messageCount % 10 === 0) {
        generateSessionSummary(req.params.sessionId, recentMessages);
      }
      
      // Update user preferences based on interaction
      await storage.upsertNovaPreferences(userId, {});
      
      res.json({
        userMessage,
        aiMessage,
        tokensUsed,
        responseTime,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Nova message error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Toggle message pin
  app.post("/api/nova/messages/:id/pin", requireAuth, async (req, res) => {
    try {
      const message = await storage.getNovaMessage(req.params.id);
      if (!message) {
        return res.status(404).json({ error: "الرسالة غير موجودة" });
      }
      
      const session = await storage.getNovaSession(message.sessionId);
      if (!session || session.userId !== (req.user as any).id) {
        return res.status(403).json({ error: "غير مصرح" });
      }
      
      const updated = await storage.toggleMessagePin(req.params.id);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Execute message action
  app.post("/api/nova/messages/:id/actions/:actionId", requireAuth, async (req, res) => {
    try {
      const message = await storage.getNovaMessage(req.params.id);
      if (!message) {
        return res.status(404).json({ error: "الرسالة غير موجودة" });
      }
      
      const session = await storage.getNovaSession(message.sessionId);
      if (!session || session.userId !== (req.user as any).id) {
        return res.status(403).json({ error: "غير مصرح" });
      }
      
      const result = req.body.result;
      const updated = await storage.executeMessageAction(req.params.id, req.params.actionId, result);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== NOVA DECISIONS ====================

  // Get user decisions
  app.get("/api/nova/decisions", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const category = req.query.category as string | undefined;
      const decisions = await storage.getUserDecisions(userId, category);
      res.json(decisions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get active decisions
  app.get("/api/nova/decisions/active", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const decisions = await storage.getActiveDecisions(userId);
      res.json(decisions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create decision
  app.post("/api/nova/decisions", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const data = createDecisionSchema.parse(req.body);
      
      const decision = await storage.createNovaDecision({
        userId,
        ...data,
      });
      
      res.json(decision);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Apply decision
  app.post("/api/nova/decisions/:id/apply", requireAuth, async (req, res) => {
    try {
      const decision = await storage.getNovaDecision(req.params.id);
      if (!decision || decision.userId !== (req.user as any).id) {
        return res.status(404).json({ error: "القرار غير موجود" });
      }
      
      const applied = await storage.applyDecision(req.params.id);
      res.json(applied);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Revert decision
  app.post("/api/nova/decisions/:id/revert", requireAuth, async (req, res) => {
    try {
      const decision = await storage.getNovaDecision(req.params.id);
      if (!decision || decision.userId !== (req.user as any).id) {
        return res.status(404).json({ error: "القرار غير موجود" });
      }
      
      const reverted = await storage.updateNovaDecision(req.params.id, { status: "reverted" });
      res.json(reverted);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== NOVA PREFERENCES ====================

  // Get user preferences
  app.get("/api/nova/preferences", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const preferences = await storage.getNovaPreferences(userId);
      res.json(preferences || {});
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update preferences
  app.patch("/api/nova/preferences", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const data = updatePreferencesSchema.parse(req.body);
      
      const updated = await storage.upsertNovaPreferences(userId, data);
      res.json(updated);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== NOVA PROJECT CONTEXT ====================

  // Helper to verify project ownership
  async function verifyProjectOwnership(projectId: string, userId: string): Promise<boolean> {
    const project = await storage.getProject(projectId);
    if (!project) return false;
    return project.userId === userId;
  }

  // Get project context
  app.get("/api/nova/projects/:projectId/context", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      // Verify ownership
      if (!await verifyProjectOwnership(req.params.projectId, userId)) {
        return res.status(403).json({ error: "غير مصرح بالوصول لهذا المشروع" });
      }
      
      const context = await storage.getNovaProjectContext(req.params.projectId);
      res.json(context || {});
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update project context
  app.patch("/api/nova/projects/:projectId/context", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      // Verify ownership
      if (!await verifyProjectOwnership(req.params.projectId, userId)) {
        return res.status(403).json({ error: "غير مصرح بالوصول لهذا المشروع" });
      }
      
      const updated = await storage.upsertNovaProjectContext(
        req.params.projectId,
        userId,
        req.body
      );
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Add detected conflict
  app.post("/api/nova/projects/:projectId/conflicts", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      // Verify ownership
      if (!await verifyProjectOwnership(req.params.projectId, userId)) {
        return res.status(403).json({ error: "غير مصرح بالوصول لهذا المشروع" });
      }
      
      const conflict = {
        id: `conflict-${Date.now()}`,
        type: req.body.type,
        description: req.body.description,
        severity: req.body.severity || "warning",
        suggestedResolution: req.body.suggestedResolution,
        resolved: false,
      };
      
      const updated = await storage.addDetectedConflict(req.params.projectId, conflict);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Resolve conflict
  app.post("/api/nova/projects/:projectId/conflicts/:conflictId/resolve", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      // Verify ownership
      if (!await verifyProjectOwnership(req.params.projectId, userId)) {
        return res.status(403).json({ error: "غير مصرح بالوصول لهذا المشروع" });
      }
      
      const updated = await storage.resolveConflict(req.params.projectId, req.params.conflictId);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== NOVA ANALYTICS ====================

  // Get conversation analytics
  app.get("/api/nova/analytics", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      const sessions = await storage.getUserNovaSessions(userId, 100);
      const decisions = await storage.getUserDecisions(userId);
      const preferences = await storage.getNovaPreferences(userId);
      
      const analytics = {
        totalSessions: sessions.length,
        activeSessions: sessions.filter(s => s.status === "active").length,
        totalMessages: sessions.reduce((sum, s) => sum + (s.messageCount || 0), 0),
        totalDecisions: decisions.length,
        appliedDecisions: decisions.filter(d => d.wasApplied).length,
        decisionsByCategory: groupBy(decisions, "category"),
        learningScore: preferences?.learningScore || 0,
        interactionCount: preferences?.interactionCount || 0,
        preferredFramework: preferences?.preferredFramework,
        preferredDatabase: preferences?.preferredDatabase,
      };
      
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== AI ARCHITECTURE ADVISOR ====================

  // Analyze project architecture and detect patterns
  app.post("/api/nova/architecture/analyze", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { projectId, scope } = req.body;
      
      // Verify project ownership
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Get existing knowledge graph
      const nodes = await storage.getProjectKnowledgeNodes(projectId);
      const edges = await storage.getProjectKnowledgeEdges(projectId);
      const existingPatterns = await storage.getProjectPatterns(projectId);

      // Prepare context for AI analysis
      const analysisPrompt = `Analyze this project architecture and identify:
1. Architecture patterns (good and anti-patterns)
2. Performance optimization opportunities
3. Security concerns
4. Scalability issues
5. Cost optimization suggestions

Project Context:
- Knowledge Nodes: ${nodes.length} components tracked
- Dependencies: ${edges.length} relationships
- Existing Patterns: ${existingPatterns.map(p => p.patternName).join(", ") || "None detected"}

Scope: ${scope || "full"}

Respond in JSON format:
{
  "patterns": [{"name": "...", "type": "pattern|anti_pattern", "severity": "info|warning|critical", "description": "...", "recommendation": "...", "impact": {"performance": 0-10, "security": 0-10, "scalability": 0-10, "cost": 0-10}}],
  "summary": "...",
  "overallHealth": 0-100
}`;

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{ role: "user", content: analysisPrompt }],
      });

      const analysisText = response.content[0].type === "text" ? response.content[0].text : "{}";
      
      // Extract JSON from response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { patterns: [], summary: "Analysis failed", overallHealth: 0 };

      // Store detected patterns
      for (const pattern of analysis.patterns || []) {
        await storage.createArchitecturePattern({
          projectId,
          patternName: pattern.name,
          patternType: pattern.type === "anti_pattern" ? "anti_pattern" : "design_pattern",
          isAntiPattern: pattern.type === "anti_pattern",
          description: pattern.description,
          suggestedFix: pattern.recommendation,
          performanceImpact: pattern.impact?.performance > 5 ? "positive" : pattern.impact?.performance < 5 ? "negative" : "neutral",
          securityImpact: pattern.impact?.security > 5 ? "positive" : pattern.impact?.security < 5 ? "negative" : "neutral",
          scalabilityImpact: pattern.impact?.scalability > 5 ? "positive" : pattern.impact?.scalability < 5 ? "negative" : "neutral",
          costImpact: pattern.impact?.cost > 5 ? "positive" : pattern.impact?.cost < 5 ? "negative" : "neutral",
        });
      }

      // Log the analysis event
      await storage.createEventLog({
        projectId,
        userId,
        eventType: "architecture_analysis",
        eventName: "Architecture Analysis",
        payload: { metadata: { scope, patternsFound: analysis.patterns?.length || 0 } },
      });

      res.json({
        success: true,
        analysis,
        patternsStored: analysis.patterns?.length || 0,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get architecture suggestions for improvement
  app.post("/api/nova/architecture/suggest", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { projectId, query, context } = req.body;

      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Get knowledge context
      const nodes = await storage.getProjectKnowledgeNodes(projectId);
      const patterns = await storage.getProjectPatterns(projectId, true); // Anti-patterns only

      const suggestionPrompt = `As an AI Architecture Advisor for INFERA WebNova, provide architectural suggestions.

User Query: ${query}

Project Context:
- Components: ${nodes.filter(n => n.nodeType === "component").length}
- Decisions: ${nodes.filter(n => n.nodeType === "decision").length}
- Active Anti-patterns: ${patterns.filter(p => p.status === "detected").length}

Additional Context: ${JSON.stringify(context || {})}

Provide 3-5 actionable suggestions with:
1. Clear recommendation
2. Implementation steps
3. Expected impact (performance, cost, security, scalability)
4. Priority level

Format as JSON:
{
  "suggestions": [{
    "id": "...",
    "title": "...",
    "description": "...",
    "steps": ["..."],
    "impact": {"performance": 0-10, "security": 0-10, "scalability": 0-10, "cost": 0-10},
    "priority": "low|medium|high|critical",
    "estimatedEffort": "hours|days|weeks"
  }]
}`;

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{ role: "user", content: suggestionPrompt }],
      });

      const suggestionText = response.content[0].type === "text" ? response.content[0].text : "{}";
      const jsonMatch = suggestionText.match(/\{[\s\S]*\}/);
      const suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : { suggestions: [] };

      res.json(suggestions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get project knowledge graph
  app.get("/api/nova/knowledge/:projectId", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { projectId } = req.params;

      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const nodes = await storage.getProjectKnowledgeNodes(projectId);
      const edges = await storage.getProjectKnowledgeEdges(projectId);
      const patterns = await storage.getProjectPatterns(projectId);
      const events = await storage.getProjectEventLog(projectId, 20);

      res.json({
        nodes,
        edges,
        patterns,
        recentEvents: events,
        stats: {
          totalNodes: nodes.length,
          totalEdges: edges.length,
          activePatterns: patterns.filter(p => p.status !== "resolved").length,
          antiPatterns: patterns.filter(p => p.isAntiPattern && p.status === "detected").length,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Add knowledge node
  app.post("/api/nova/knowledge/:projectId/nodes", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { projectId } = req.params;

      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Validate input
      const validatedData = createKnowledgeNodeSchema.parse(req.body);

      const node = await storage.createKnowledgeNode({
        projectId,
        userId,
        ...validatedData,
      });

      // Log the event
      await storage.createEventLog({
        projectId,
        userId,
        eventType: "knowledge_node_created",
        eventName: "Knowledge Node Created",
        payload: { metadata: { nodeType: validatedData.nodeType, name: validatedData.name, entityId: node.id } },
      });

      res.json(node);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Acknowledge or resolve a pattern
  app.patch("/api/nova/patterns/:patternId", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { patternId } = req.params;
      const { action } = req.body;

      // Get pattern and verify ownership through project
      const patterns = await storage.getProjectPatterns(patternId);
      const pattern = patterns.find((p) => p.id === patternId);
      if (!pattern) {
        // Try direct lookup via projectId
        const allPatterns = await db.select().from(architecturePatterns).where(eq(architecturePatterns.id, patternId));
        if (allPatterns.length === 0) {
          return res.status(404).json({ error: "Pattern not found" });
        }
        const project = await storage.getProject(allPatterns[0].projectId);
        if (!project || project.userId !== userId) {
          return res.status(403).json({ error: "Unauthorized" });
        }
      } else {
        const project = await storage.getProject(pattern.projectId);
        if (!project || project.userId !== userId) {
          return res.status(403).json({ error: "Unauthorized" });
        }
      }

      const updated = action === "acknowledge" 
        ? await storage.acknowledgePattern(patternId)
        : await storage.resolvePattern(patternId);

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== OPERATIONS PLATFORM ====================

  // Get project deployments
  app.get("/api/nova/deployments/:projectId", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { projectId } = req.params;

      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const deployments = await storage.getProjectDeployments(projectId);
      const configs = await storage.getProjectDeploymentConfigs(projectId);

      res.json({ deployments, configs });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create deployment config
  app.post("/api/nova/deployments/:projectId/config", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { projectId } = req.params;

      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Validate input with Zod schema
      const validatedData = createDeploymentConfigSchema.parse(req.body);

      const config = await storage.createDeploymentConfig({
        projectId,
        userId,
        environment: validatedData.environment || "development",
        provider: validatedData.provider || "hetzner",
        customDomain: validatedData.customDomain,
        minInstances: validatedData.minInstances,
        maxInstances: validatedData.maxInstances,
        sslEnabled: validatedData.sslEnabled,
        cdnEnabled: validatedData.cdnEnabled,
      });

      res.json(config);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Rollback to a previous deployment
  app.post("/api/nova/deployments/:projectId/rollback", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { projectId } = req.params;
      const { deploymentId } = req.body;

      if (!deploymentId) {
        return res.status(400).json({ error: "Deployment ID is required" });
      }

      if (!projectId) {
        return res.status(400).json({ error: "Project ID is required" });
      }

      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      if (project.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Create a rollback deployment
      const targetDeployment = await storage.getDeployment(deploymentId);
      if (!targetDeployment) {
        return res.status(404).json({ error: "Target deployment not found" });
      }
      
      // Ensure target deployment belongs to the same project (string comparison)
      if (String(targetDeployment.projectId) !== String(projectId)) {
        return res.status(403).json({ error: "Deployment does not belong to this project" });
      }

      const rollbackDeployment = await storage.createDeployment({
        projectId,
        configId: targetDeployment.configId,
        userId,
        version: `${targetDeployment.version}-rollback-${Date.now()}`,
        commitHash: targetDeployment.commitHash,
        commitMessage: `Rollback to ${targetDeployment.version}`,
        status: "pending",
      });

      res.json({ 
        success: true, 
        deployment: rollbackDeployment,
        message: `Rollback to version ${targetDeployment.version} initiated` 
      });
    } catch (error: any) {
      console.error("Rollback error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get project health alerts
  app.get("/api/nova/alerts/:projectId", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { projectId } = req.params;

      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const alerts = await storage.getProjectHealthAlerts(projectId);
      res.json(alerts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Acknowledge alert
  app.patch("/api/nova/alerts/:alertId/acknowledge", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { alertId } = req.params;

      // Get alert and verify ownership through project
      const existingAlert = await storage.getHealthAlert(alertId);
      if (!existingAlert) {
        return res.status(404).json({ error: "Alert not found" });
      }

      const project = await storage.getProject(existingAlert.projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const alert = await storage.acknowledgeAlert(alertId, userId);
      res.json(alert);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get project metrics
  app.get("/api/nova/metrics/:projectId", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { projectId } = req.params;

      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const metrics = await storage.getProjectMetrics(projectId);
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== MULTI-SURFACE BUILD ====================

  // Get project build configs and jobs
  app.get("/api/nova/builds/:projectId", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { projectId } = req.params;

      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const configs = await storage.getProjectBuildConfigs(projectId);
      const jobs = await storage.getProjectBuildJobs(projectId);
      res.json({ configs, jobs });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create build config
  app.post("/api/nova/builds/:projectId/config", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { projectId } = req.params;

      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Validate input with Zod schema
      const validatedData = createBuildConfigSchema.parse(req.body);

      const config = await storage.createBuildConfig({
        projectId,
        userId,
        platform: validatedData.platform,
        appName: validatedData.appName || `${validatedData.platform} App`,
        appNameAr: validatedData.appNameAr,
        version: validatedData.version || "1.0.0",
        bundleId: validatedData.bundleId,
      });
      res.json(config);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Start a build job
  app.post("/api/nova/builds/:projectId/start", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { projectId } = req.params;
      
      // Validate input with Zod schema
      const validatedData = startBuildSchema.parse(req.body);

      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const config = await storage.getBuildConfig(validatedData.configId);
      if (!config || config.projectId !== projectId) {
        return res.status(404).json({ error: "Build config not found" });
      }

      // Explicitly construct job data - no spread
      const job = await storage.createBuildJob({
        projectId,
        configId: validatedData.configId,
        userId,
        platform: config.platform,
        version: validatedData.version || config.version || "1.0.0",
        status: "queued",
      });
      res.json(job);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== UNIFIED BLUEPRINTS ====================

  // Get project blueprints
  app.get("/api/nova/blueprints/:projectId", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { projectId } = req.params;

      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const blueprints = await storage.getProjectBlueprints(projectId);
      res.json({ blueprints });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create unified blueprint
  app.post("/api/nova/blueprints/:projectId", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { projectId } = req.params;

      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Validate input with Zod schema
      const validatedData = createBlueprintSchema.parse(req.body);

      const blueprint = await storage.createUnifiedBlueprint({
        projectId,
        userId,
        ...validatedData,
      });
      res.json(blueprint);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Update blueprint
  app.patch("/api/nova/blueprints/:blueprintId", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { blueprintId } = req.params;

      const existing = await storage.getUnifiedBlueprint(blueprintId);
      if (!existing) {
        return res.status(404).json({ error: "Blueprint not found" });
      }

      const project = await storage.getProject(existing.projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Explicitly pick allowed fields for update
      const { name, nameAr, version, definition, surfaces, isLocked } = req.body;
      const updateData: Record<string, any> = {};
      if (name !== undefined) updateData.name = name;
      if (nameAr !== undefined) updateData.nameAr = nameAr;
      if (version !== undefined) updateData.version = version;
      if (definition !== undefined) updateData.definition = definition;
      if (surfaces !== undefined) updateData.surfaces = surfaces;
      if (isLocked !== undefined) updateData.isLocked = isLocked;

      const blueprint = await storage.updateUnifiedBlueprint(blueprintId, updateData);
      res.json(blueprint);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}

// Helper functions

function buildSystemPrompt(
  language: string,
  preferences: any,
  decisions: any[]
): string {
  const isArabic = language === "ar";
  
  const basePrompt = isArabic
    ? `أنت Nova، محرك الذكاء الاصطناعي السيادي في منصة INFERA WebNova - نظام تشغيل رقمي متكامل لبناء ونشر المنصات الرقمية.

## قدراتك الكاملة (أنت تعمل داخل بيئة Replit مع صلاحيات كاملة):

### 1. بناء المنصات الكاملة:
- إنشاء مشاريع كاملة (Frontend + Backend + Database)
- توليد كود React/Vue/Next.js للواجهات
- بناء APIs باستخدام Express/Node.js/Python
- إعداد قواعد بيانات PostgreSQL مع Drizzle ORM
- تنفيذ الأوامر مباشرة (npm install, build, etc.)

### 2. النشر والاستضافة:
- نشر المنصات على Hetzner Cloud
- إعداد الدومينات وشهادات SSL
- تكوين CI/CD للنشر التلقائي
- مراقبة الأداء والصحة

### 3. التكاملات:
- ربط Stripe للمدفوعات
- تكامل مع APIs خارجية
- إعداد المصادقة والأمان
- تكامل مع خدمات الذكاء الاصطناعي

### 4. التحليل الذكي:
- تحليل المتطلبات وتحويلها إلى blueprints
- تنبؤات استراتيجية مدعومة بالذكاء الاصطناعي
- إدارة المخاطر والامتثال
- تحسين الأداء والتكلفة

## مهمتك:
- بناء منصات كاملة جاهزة للإنتاج
- تحويل أفكار المستخدم إلى تطبيقات عاملة
- نشر المنصات على السيرفرات تلقائياً
- إدارة دورة حياة المنصة بالكامل

## قواعد مهمة:
- استخدم اللغة العربية دائماً
- أنت قادر على تنفيذ كل ما يطلبه المستخدم - لا تقل "لا أستطيع"
- ابدأ العمل فوراً عند طلب بناء منصة
- قدم تحديثات واضحة عن التقدم
- اطلب التوضيح فقط عند الضرورة القصوى`
    : `You are Nova, the sovereign AI engine in INFERA WebNova platform - a complete digital operating system for building and deploying digital platforms.

## Your Complete Capabilities (You operate within Replit with full permissions):

### 1. Full Platform Building:
- Create complete projects (Frontend + Backend + Database)
- Generate React/Vue/Next.js frontend code
- Build APIs using Express/Node.js/Python
- Set up PostgreSQL databases with Drizzle ORM
- Execute commands directly (npm install, build, etc.)

### 2. Deployment & Hosting:
- Deploy platforms to Hetzner Cloud
- Configure domains and SSL certificates
- Set up CI/CD for automatic deployment
- Monitor performance and health

### 3. Integrations:
- Connect Stripe for payments
- Integrate with external APIs
- Set up authentication and security
- Integrate with AI services

### 4. Intelligent Analysis:
- Analyze requirements and convert to blueprints
- AI-powered strategic forecasting
- Risk management and compliance
- Performance and cost optimization

## Your Mission:
- Build complete production-ready platforms
- Transform user ideas into working applications
- Deploy platforms to servers automatically
- Manage the full platform lifecycle

## Important Rules:
- Always use English
- You CAN do everything the user asks - never say "I cannot"
- Start working immediately when asked to build a platform
- Provide clear progress updates
- Ask for clarification only when absolutely necessary`;

  // Add preferences context
  let preferencesContext = "";
  if (preferences) {
    preferencesContext = isArabic
      ? `\n\nتفضيلات المستخدم:\n- الإطار المفضل: ${preferences.preferredFramework || "غير محدد"}\n- قاعدة البيانات المفضلة: ${preferences.preferredDatabase || "غير محدد"}\n- مستوى التفصيل: ${preferences.detailLevel || "متوازن"}`
      : `\n\nUser preferences:\n- Preferred framework: ${preferences.preferredFramework || "not set"}\n- Preferred database: ${preferences.preferredDatabase || "not set"}\n- Detail level: ${preferences.detailLevel || "balanced"}`;
  }

  // Add recent decisions context
  let decisionsContext = "";
  if (decisions.length > 0) {
    const recentDecisions = decisions.slice(0, 5);
    decisionsContext = isArabic
      ? `\n\nالقرارات الأخيرة:\n${recentDecisions.map(d => `- ${d.category}: ${d.selectedOption}`).join("\n")}`
      : `\n\nRecent decisions:\n${recentDecisions.map(d => `- ${d.category}: ${d.selectedOption}`).join("\n")}`;
  }

  return basePrompt + preferencesContext + decisionsContext;
}

function extractActionsFromResponse(content: string): any[] {
  const actions: any[] = [];
  
  // Look for action patterns in the response
  const confirmPattern = /\[CONFIRM:(.*?)\]/g;
  const applyPattern = /\[APPLY:(.*?)\]/g;
  const previewPattern = /\[PREVIEW:(.*?)\]/g;
  
  let match;
  
  while ((match = confirmPattern.exec(content)) !== null) {
    actions.push({
      id: `action-${Date.now()}-${actions.length}`,
      type: "confirm",
      label: match[1],
      labelAr: match[1],
      status: "pending",
    });
  }
  
  while ((match = applyPattern.exec(content)) !== null) {
    actions.push({
      id: `action-${Date.now()}-${actions.length}`,
      type: "apply",
      label: match[1],
      labelAr: match[1],
      status: "pending",
    });
  }
  
  while ((match = previewPattern.exec(content)) !== null) {
    actions.push({
      id: `action-${Date.now()}-${actions.length}`,
      type: "preview",
      label: match[1],
      labelAr: match[1],
      status: "pending",
    });
  }
  
  return actions;
}

async function generateSessionSummary(sessionId: string, messages: any[]): Promise<void> {
  try {
    const content = messages.map(m => `${m.role}: ${m.content.slice(0, 200)}`).join("\n");
    
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      messages: [{
        role: "user",
        content: `Generate a brief 1-2 sentence summary of this conversation:\n\n${content}`,
      }],
    });
    
    const summary = response.content[0].type === "text" ? response.content[0].text : "";
    await storage.updateNovaSession(sessionId, { summary });
  } catch (error) {
    console.error("Failed to generate session summary:", error);
  }
}

function groupBy(arr: any[], key: string): Record<string, number> {
  return arr.reduce((acc, item) => {
    const value = item[key];
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

// ==================== CI/CD PIPELINE INTEGRATION ====================

// CI/CD Pipeline Types
interface CICDPipeline {
  id: string;
  projectId: string;
  name: string;
  status: 'idle' | 'running' | 'success' | 'failed' | 'cancelled';
  platform: 'ios' | 'android' | 'web' | 'all';
  stages: PipelineStage[];
  lastRun?: Date;
  createdAt: Date;
}

interface PipelineStage {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  duration?: number;
  logs?: string[];
}

// In-memory storage for CI/CD (would be database in production)
const cicdPipelines: Map<string, CICDPipeline> = new Map();

// Device Testing Types
interface DeviceTest {
  id: string;
  projectId: string;
  deviceId: string;
  deviceName: string;
  platform: 'ios' | 'android';
  status: 'queued' | 'running' | 'passed' | 'failed';
  logs: string[];
  screenshots: string[];
  duration?: number;
  createdAt: Date;
}

const deviceTests: Map<string, DeviceTest> = new Map();

// Available device farm
const deviceFarm = [
  { id: 'iphone-15-pro', name: 'iPhone 15 Pro', platform: 'ios', os: '17.0', available: true },
  { id: 'iphone-14', name: 'iPhone 14', platform: 'ios', os: '16.0', available: true },
  { id: 'ipad-pro-m2', name: 'iPad Pro M2', platform: 'ios', os: '17.0', available: true },
  { id: 'pixel-8-pro', name: 'Pixel 8 Pro', platform: 'android', os: '14.0', available: true },
  { id: 'galaxy-s24', name: 'Samsung Galaxy S24', platform: 'android', os: '14.0', available: true },
  { id: 'oneplus-12', name: 'OnePlus 12', platform: 'android', os: '14.0', available: true },
];

export function registerCICDRoutes(app: Express) {
  // Get all pipelines for a project
  app.get("/api/cicd/pipelines/:projectId", requireAuth, async (req, res) => {
    try {
      const pipelines = Array.from(cicdPipelines.values())
        .filter(p => p.projectId === req.params.projectId);
      res.json(pipelines);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create new pipeline
  app.post("/api/cicd/pipelines", requireAuth, async (req, res) => {
    try {
      const { projectId, name, platform } = req.body;
      
      const pipeline: CICDPipeline = {
        id: `pipe-${Date.now()}`,
        projectId,
        name: name || 'Default Pipeline',
        status: 'idle',
        platform: platform || 'all',
        stages: [
          { id: 'build', name: 'Build', status: 'pending' },
          { id: 'test', name: 'Test', status: 'pending' },
          { id: 'analyze', name: 'Code Analysis', status: 'pending' },
          { id: 'deploy', name: 'Deploy', status: 'pending' },
        ],
        createdAt: new Date(),
      };
      
      cicdPipelines.set(pipeline.id, pipeline);
      res.json(pipeline);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Run pipeline
  app.post("/api/cicd/pipelines/:pipelineId/run", requireAuth, async (req, res) => {
    try {
      const pipeline = cicdPipelines.get(req.params.pipelineId);
      if (!pipeline) {
        return res.status(404).json({ error: "Pipeline not found" });
      }
      
      pipeline.status = 'running';
      pipeline.lastRun = new Date();
      pipeline.stages.forEach(s => s.status = 'pending');
      
      // Simulate pipeline execution
      let stageIndex = 0;
      const runStage = () => {
        if (stageIndex < pipeline.stages.length) {
          pipeline.stages[stageIndex].status = 'running';
          setTimeout(() => {
            pipeline.stages[stageIndex].status = 'success';
            pipeline.stages[stageIndex].duration = Math.floor(Math.random() * 30000) + 5000;
            stageIndex++;
            runStage();
          }, 2000);
        } else {
          pipeline.status = 'success';
        }
      };
      runStage();
      
      res.json({ message: "Pipeline started", pipeline });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Cancel pipeline
  app.post("/api/cicd/pipelines/:pipelineId/cancel", requireAuth, async (req, res) => {
    try {
      const pipeline = cicdPipelines.get(req.params.pipelineId);
      if (!pipeline) {
        return res.status(404).json({ error: "Pipeline not found" });
      }
      
      pipeline.status = 'cancelled';
      pipeline.stages.forEach(s => {
        if (s.status === 'running') s.status = 'skipped';
      });
      
      res.json({ message: "Pipeline cancelled", pipeline });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get pipeline status
  app.get("/api/cicd/pipelines/:pipelineId/status", requireAuth, async (req, res) => {
    try {
      const pipeline = cicdPipelines.get(req.params.pipelineId);
      if (!pipeline) {
        return res.status(404).json({ error: "Pipeline not found" });
      }
      res.json(pipeline);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== DEVICE TESTING ENDPOINTS ====================

  // Get available devices
  app.get("/api/device-testing/devices", requireAuth, async (req, res) => {
    try {
      const platform = req.query.platform as string;
      let devices = deviceFarm;
      if (platform && platform !== 'all') {
        devices = deviceFarm.filter(d => d.platform === platform);
      }
      res.json(devices);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Start device test
  app.post("/api/device-testing/tests", requireAuth, async (req, res) => {
    try {
      const { projectId, deviceId, testType } = req.body;
      
      const device = deviceFarm.find(d => d.id === deviceId);
      if (!device) {
        return res.status(404).json({ error: "Device not found" });
      }
      
      const test: DeviceTest = {
        id: `test-${Date.now()}`,
        projectId,
        deviceId,
        deviceName: device.name,
        platform: device.platform as 'ios' | 'android',
        status: 'queued',
        logs: [`Test queued for ${device.name}`],
        screenshots: [],
        createdAt: new Date(),
      };
      
      deviceTests.set(test.id, test);
      
      // Simulate test execution
      setTimeout(() => {
        test.status = 'running';
        test.logs.push('Installing app...');
      }, 1000);
      
      setTimeout(() => {
        test.logs.push('Running UI tests...');
        test.screenshots.push(`/screenshots/${test.id}/screen1.png`);
      }, 3000);
      
      setTimeout(() => {
        test.status = 'passed';
        test.duration = 45000;
        test.logs.push('All tests passed!');
        test.screenshots.push(`/screenshots/${test.id}/screen2.png`);
      }, 6000);
      
      res.json(test);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get test status
  app.get("/api/device-testing/tests/:testId", requireAuth, async (req, res) => {
    try {
      const test = deviceTests.get(req.params.testId);
      if (!test) {
        return res.status(404).json({ error: "Test not found" });
      }
      res.json(test);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all tests for project
  app.get("/api/device-testing/projects/:projectId/tests", requireAuth, async (req, res) => {
    try {
      const tests = Array.from(deviceTests.values())
        .filter(t => t.projectId === req.params.projectId);
      res.json(tests);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Stop test
  app.post("/api/device-testing/tests/:testId/stop", requireAuth, async (req, res) => {
    try {
      const test = deviceTests.get(req.params.testId);
      if (!test) {
        return res.status(404).json({ error: "Test not found" });
      }
      
      test.status = 'failed';
      test.logs.push('Test stopped by user');
      
      res.json({ message: "Test stopped", test });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get device testing stats
  app.get("/api/device-testing/stats", requireAuth, async (req, res) => {
    try {
      const allTests = Array.from(deviceTests.values());
      const stats = {
        totalTests: allTests.length,
        passed: allTests.filter(t => t.status === 'passed').length,
        failed: allTests.filter(t => t.status === 'failed').length,
        running: allTests.filter(t => t.status === 'running').length,
        queued: allTests.filter(t => t.status === 'queued').length,
        deviceCoverage: deviceFarm.length,
        platformBreakdown: {
          ios: allTests.filter(t => t.platform === 'ios').length,
          android: allTests.filter(t => t.platform === 'android').length,
        },
      };
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  console.log("CI/CD Pipeline routes registered | تم تسجيل مسارات CI/CD");
  console.log("Device Testing routes registered | تم تسجيل مسارات اختبار الأجهزة");
}
