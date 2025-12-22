import type { Express } from "express";
import { storage } from "./storage";
import { db } from "./db";
import { architecturePatterns } from "@shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

// Middleware to ensure user is authenticated
function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: "غير مصرح - يجب تسجيل الدخول" });
  }
  next();
}

// Validation schemas
const createSessionSchema = z.object({
  projectId: z.string().optional(),
  title: z.string().optional(),
  language: z.enum(["ar", "en"]).default("ar"),
});

const sendMessageSchema = z.object({
  content: z.string().min(1),
  language: z.enum(["ar", "en"]).default("ar"),
  attachments: z.array(z.object({
    type: z.enum(["image", "file", "code", "blueprint"]),
    url: z.string().optional(),
    content: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  })).optional(),
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
      
      // Build conversation history
      const conversationHistory = recentMessages.map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));
      
      const startTime = Date.now();
      
      // Call Claude AI
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: systemPrompt,
        messages: conversationHistory,
      });
      
      const responseTime = Date.now() - startTime;
      const aiContent = response.content[0].type === "text" ? response.content[0].text : "";
      const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;
      
      // Extract any interactive actions from AI response
      const actions = extractActionsFromResponse(aiContent);
      
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
        name: validatedData.name || "Default Config",
        nameAr: validatedData.nameAr || "الإعداد الافتراضي",
        environment: validatedData.environment || "development",
        provider: validatedData.provider || "hetzner",
        region: validatedData.region,
        instanceType: validatedData.instanceType,
        autoScaling: validatedData.autoScaling,
        minInstances: validatedData.minInstances,
        maxInstances: validatedData.maxInstances,
        envVars: validatedData.envVars,
        customDomain: validatedData.customDomain,
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
        name: validatedData.name || `${validatedData.platform} Build`,
        nameAr: validatedData.nameAr || `بناء ${validatedData.platform}`,
        platform: validatedData.platform,
        version: validatedData.version || "1.0.0",
        bundleId: validatedData.bundleId,
        appIcon: validatedData.appIcon,
        splashScreen: validatedData.splashScreen,
        buildSettings: validatedData.buildSettings,
        signingConfig: validatedData.signingConfig,
        targetSdk: validatedData.targetSdk,
        minimumSdk: validatedData.minimumSdk,
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
    ? `أنت Nova، المساعد الذكي في منصة INFERA WebNova لبناء المنصات الرقمية السيادية.

مهمتك:
- مساعدة المستخدمين في تصميم وبناء تطبيقاتهم الرقمية
- تقديم اقتراحات معمارية ذكية
- تحليل المتطلبات وتحويلها إلى مخططات تقنية
- تقديم خيارات متعددة مع تحليل التكلفة والفائدة

قواعد مهمة:
- استخدم اللغة العربية دائماً
- كن موجزاً ومفيداً
- قدم أمثلة عملية
- اقترح أفضل الممارسات`
    : `You are Nova, the intelligent assistant in INFERA WebNova platform for building sovereign digital platforms.

Your mission:
- Help users design and build their digital applications
- Provide smart architectural suggestions
- Analyze requirements and convert them to technical blueprints
- Offer multiple options with cost-benefit analysis

Important rules:
- Always use English
- Be concise and helpful
- Provide practical examples
- Suggest best practices`;

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
