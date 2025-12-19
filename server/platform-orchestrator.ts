import { FullStackGenerator, fullStackGenerator, FullStackProjectSpec, GeneratedFullStackProject } from "./full-stack-generator";
import { AuthSystemGenerator, authGenerator, AuthConfig, GeneratedAuthSystem } from "./auth-generator";
import { PlatformDeployer, platformDeployer, PlatformDeploymentSpec, DeploymentResult, HetznerServerConfig } from "./platform-deployment";
import { 
  AIExecutionGovernance, 
  generateSystemDirective, 
  generateHandshake, 
  formatHandshakeMessage,
  FIXED_TECHNICAL_STACK,
  ZERO_TOLERANCE_RULES,
  type ExecutionPhase,
  type HandshakeResponse
} from "./ai-execution-governance";

export interface CompletePlatformSpec {
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  industry: "government" | "commercial" | "healthcare" | "education" | "financial" | "hr" | "ecommerce" | "other";
  features: string[];
  language: "ar" | "en" | "bilingual";
  
  auth: AuthConfig;
  
  database: {
    type: "postgresql" | "mysql";
    includeSeeding?: boolean;
  };
  
  deployment?: {
    provider: "hetzner" | "aws" | "local";
    serverConfig?: HetznerServerConfig;
    domain?: string;
    enableSsl?: boolean;
    autoScale?: boolean;
  };
  
  integrations?: {
    payments?: ("stripe" | "paypal" | "tap")[];
    email?: "sendgrid" | "smtp";
    storage?: "cloudinary" | "s3";
    analytics?: boolean;
  };
}

export interface PlatformGenerationResult {
  success: boolean;
  projectId: string;
  project?: GeneratedFullStackProject;
  authSystem?: GeneratedAuthSystem;
  deployment?: DeploymentResult;
  summary: {
    totalFiles: number;
    totalEndpoints: number;
    hasAuth: boolean;
    hasDeployment: boolean;
    generationTimeMs: number;
  };
  logs: string[];
  error?: string;
}

export interface GenerationProgress {
  phase: "planning" | "database" | "auth" | "api" | "frontend" | "styling" | "deployment" | "complete";
  phaseAr: string;
  phaseEn: string;
  progress: number;
  details?: string;
}

export class PlatformOrchestrator {
  private progressCallbacks: Map<string, (progress: GenerationProgress) => void> = new Map();

  async generateCompletePlatform(
    spec: CompletePlatformSpec,
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<PlatformGenerationResult> {
    const startTime = Date.now();
    const logs: string[] = [];
    const sessionId = crypto.randomUUID();

    if (onProgress) {
      this.progressCallbacks.set(sessionId, onProgress);
    }

    try {
      logs.push(`[${new Date().toISOString()}] Starting platform generation: ${spec.name}`);
      
      this.emitProgress(sessionId, {
        phase: "planning",
        phaseAr: "التخطيط والتحليل",
        phaseEn: "Planning & Analysis",
        progress: 5,
        details: `Analyzing requirements for ${spec.industry} platform`,
      });

      const fullStackSpec: FullStackProjectSpec = {
        name: spec.name,
        nameAr: spec.nameAr,
        description: spec.description,
        descriptionAr: spec.descriptionAr,
        industry: spec.industry,
        features: spec.features,
        hasAuth: true,
        hasPayments: !!spec.integrations?.payments?.length,
        language: spec.language,
      };

      logs.push(`[${new Date().toISOString()}] Generating full-stack project structure...`);
      
      const project = await fullStackGenerator.generateProject(fullStackSpec, (step, progress) => {
        const phaseMap: Record<string, { ar: string; en: string }> = {
          planning: { ar: "التخطيط", en: "Planning" },
          database: { ar: "قاعدة البيانات", en: "Database Schema" },
          storage: { ar: "طبقة التخزين", en: "Storage Layer" },
          api: { ar: "واجهات API", en: "API Routes" },
          pages: { ar: "صفحات الواجهة", en: "Frontend Pages" },
          components: { ar: "المكونات", en: "Components" },
          styling: { ar: "الأنماط", en: "Styling" },
          config: { ar: "الإعدادات", en: "Configuration" },
          complete: { ar: "اكتمال", en: "Complete" },
        };

        const phase = phaseMap[step] || { ar: step, en: step };
        
        this.emitProgress(sessionId, {
          phase: step as GenerationProgress["phase"],
          phaseAr: phase.ar,
          phaseEn: phase.en,
          progress: Math.min(progress * 0.6, 60),
        });
      });

      logs.push(`[${new Date().toISOString()}] Generated ${project.files.length} files`);
      logs.push(`[${new Date().toISOString()}] Generated ${project.apiEndpoints.length} API endpoints`);

      this.emitProgress(sessionId, {
        phase: "auth",
        phaseAr: "نظام المصادقة",
        phaseEn: "Authentication System",
        progress: 65,
        details: `Generating ${spec.auth.authType} authentication`,
      });

      logs.push(`[${new Date().toISOString()}] Generating authentication system...`);
      const authSystem = authGenerator.generateAuthSystem(spec.auth);
      
      project.files.push(...authSystem.files);
      logs.push(`[${new Date().toISOString()}] Added ${authSystem.files.length} auth files`);

      if (spec.integrations?.payments?.length) {
        this.emitProgress(sessionId, {
          phase: "api",
          phaseAr: "تكامل الدفع",
          phaseEn: "Payment Integration",
          progress: 75,
        });

        logs.push(`[${new Date().toISOString()}] Adding payment integrations: ${spec.integrations.payments.join(", ")}`);
        const paymentFiles = this.generatePaymentIntegration(spec.integrations.payments);
        project.files.push(...paymentFiles);
      }

      let deploymentResult: DeploymentResult | undefined;

      if (spec.deployment && spec.deployment.provider === "hetzner" && spec.deployment.serverConfig) {
        this.emitProgress(sessionId, {
          phase: "deployment",
          phaseAr: "النشر والتوزيع",
          phaseEn: "Deployment",
          progress: 85,
          details: "Deploying to Hetzner Cloud",
        });

        logs.push(`[${new Date().toISOString()}] Starting deployment to Hetzner...`);

        if (platformDeployer.isConfigured()) {
          const deploySpec: PlatformDeploymentSpec = {
            project,
            serverConfig: spec.deployment.serverConfig,
            domain: spec.deployment.domain,
            enableSsl: spec.deployment.enableSsl,
            databaseType: spec.database.type,
            environment: "production",
          };

          deploymentResult = await platformDeployer.deployPlatform(deploySpec);
          logs.push(...deploymentResult.logs);
        } else {
          logs.push(`[${new Date().toISOString()}] Hetzner API not configured, skipping deployment`);
          deploymentResult = {
            success: false,
            logs: ["Hetzner API token not configured"],
            error: "HETZNER_API_TOKEN not set",
          };
        }
      }

      this.emitProgress(sessionId, {
        phase: "complete",
        phaseAr: "اكتمل بنجاح",
        phaseEn: "Complete",
        progress: 100,
      });

      const generationTimeMs = Date.now() - startTime;
      logs.push(`[${new Date().toISOString()}] Platform generation completed in ${generationTimeMs}ms`);

      return {
        success: true,
        projectId: project.projectId,
        project,
        authSystem,
        deployment: deploymentResult,
        summary: {
          totalFiles: project.files.length,
          totalEndpoints: project.apiEndpoints.length,
          hasAuth: true,
          hasDeployment: !!deploymentResult?.success,
          generationTimeMs,
        },
        logs,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logs.push(`[${new Date().toISOString()}] ERROR: ${errorMessage}`);

      return {
        success: false,
        projectId: "",
        summary: {
          totalFiles: 0,
          totalEndpoints: 0,
          hasAuth: false,
          hasDeployment: false,
          generationTimeMs: Date.now() - startTime,
        },
        logs,
        error: errorMessage,
      };
    } finally {
      this.progressCallbacks.delete(sessionId);
    }
  }

  private emitProgress(sessionId: string, progress: GenerationProgress) {
    const callback = this.progressCallbacks.get(sessionId);
    if (callback) {
      callback(progress);
    }
  }

  private generatePaymentIntegration(providers: string[]): any[] {
    const files: any[] = [];

    if (providers.includes("stripe")) {
      files.push({
        path: "src/server/payments/stripe.ts",
        content: `import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function createPaymentIntent(amount: number, currency: string = "usd") {
  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
  });
}

export async function createCheckoutSession(items: any[], successUrl: string, cancelUrl: string) {
  return stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: items.map(item => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          description: item.description,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    })),
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}

export async function handleWebhook(payload: Buffer, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
`,
        type: "util",
        language: "ts",
      });

      files.push({
        path: "src/server/payments/payment-routes.ts",
        content: `import { Express, Request, Response } from "express";
import { createPaymentIntent, createCheckoutSession, handleWebhook } from "./stripe";
import { authMiddleware } from "../auth-middleware";

export function registerPaymentRoutes(app: Express) {
  app.post("/api/payments/create-intent", authMiddleware, async (req: Request, res: Response) => {
    try {
      const { amount, currency } = req.body;
      const intent = await createPaymentIntent(amount, currency);
      res.json({ clientSecret: intent.client_secret });
    } catch (error) {
      console.error("[Payments] Create intent error:", error);
      res.status(500).json({ error: "Payment error" });
    }
  });

  app.post("/api/payments/create-checkout", authMiddleware, async (req: Request, res: Response) => {
    try {
      const { items, successUrl, cancelUrl } = req.body;
      const session = await createCheckoutSession(items, successUrl, cancelUrl);
      res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
      console.error("[Payments] Create checkout error:", error);
      res.status(500).json({ error: "Checkout error" });
    }
  });

  app.post("/api/webhooks/stripe", async (req: Request, res: Response) => {
    try {
      const signature = req.headers["stripe-signature"] as string;
      const event = await handleWebhook(req.body, signature);

      switch (event.type) {
        case "payment_intent.succeeded":
          console.log("[Stripe] Payment succeeded:", event.data.object);
          break;
        case "checkout.session.completed":
          console.log("[Stripe] Checkout completed:", event.data.object);
          break;
      }

      res.json({ received: true });
    } catch (error) {
      console.error("[Stripe Webhook] Error:", error);
      res.status(400).json({ error: "Webhook error" });
    }
  });
}
`,
        type: "route",
        language: "ts",
      });
    }

    return files;
  }

  getDeployerStatus(): { configured: boolean; provider: string } {
    return {
      configured: platformDeployer.isConfigured(),
      provider: "hetzner",
    };
  }

  async listDeployedPlatforms(): Promise<any[]> {
    return platformDeployer.listServers();
  }

  async deletePlatform(serverId: string): Promise<boolean> {
    return platformDeployer.deleteServer(serverId);
  }

  // ==================== GOVERNANCE INTEGRATION ====================

  private governanceSessions: Map<string, AIExecutionGovernance> = new Map();

  initializeGovernanceSession(projectId: string, sessionId: string): HandshakeResponse {
    const governance = new AIExecutionGovernance(projectId, sessionId);
    this.governanceSessions.set(sessionId, governance);
    
    console.log(`[Governance] Session initialized: ${sessionId}`);
    return generateHandshake(governance);
  }

  getGovernanceSession(sessionId: string): AIExecutionGovernance | undefined {
    return this.governanceSessions.get(sessionId);
  }

  getSystemDirective(sessionId: string): string {
    const governance = this.governanceSessions.get(sessionId);
    if (!governance) {
      throw new Error(`Governance session not found: ${sessionId}`);
    }
    return generateSystemDirective(governance);
  }

  startPhase(sessionId: string, phase: ExecutionPhase): { success: boolean; error?: string } {
    const governance = this.governanceSessions.get(sessionId);
    if (!governance) {
      return { success: false, error: `Governance session not found: ${sessionId}` };
    }
    return governance.startPhase(phase);
  }

  approvePhase(sessionId: string, phase: ExecutionPhase): { success: boolean; error?: string } {
    const governance = this.governanceSessions.get(sessionId);
    if (!governance) {
      return { success: false, error: `Governance session not found: ${sessionId}` };
    }
    return governance.approvePhase(phase);
  }

  getHandshakeMessage(sessionId: string, language: 'en' | 'ar' = 'en'): string {
    const governance = this.governanceSessions.get(sessionId);
    if (!governance) {
      throw new Error(`Governance session not found: ${sessionId}`);
    }
    return formatHandshakeMessage(generateHandshake(governance), language);
  }

  getTechnicalStack() {
    return FIXED_TECHNICAL_STACK;
  }

  getQualityRules() {
    return ZERO_TOLERANCE_RULES;
  }

  cleanupGovernanceSession(sessionId: string): void {
    this.governanceSessions.delete(sessionId);
    console.log(`[Governance] Session cleaned up: ${sessionId}`);
  }
}

export const platformOrchestrator = new PlatformOrchestrator();
