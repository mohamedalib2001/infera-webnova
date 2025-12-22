import type { Express } from "express";
import { storage } from "./storage";
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
      
      // Get recent messages for context
      const recentMessages = await storage.getSessionMessages(req.params.sessionId, 10);
      
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

  // Get project context
  app.get("/api/nova/projects/:projectId/context", requireAuth, async (req, res) => {
    try {
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
