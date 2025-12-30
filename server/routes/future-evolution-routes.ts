/**
 * Future Evolution Routes | مسارات التطور المستقبلي
 */

import { Router, Request, Response } from "express";
import { futureEvolutionEngine, FeatureStatus } from "../lib/future-evolution-engine";

const router = Router();

// Middleware: Rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const rateLimit = (req: Request, res: Response, next: Function) => {
  const key = req.session?.user?.email || req.ip || 'anonymous';
  const now = Date.now();
  const limit = rateLimitMap.get(key);
  
  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + 60000 });
    return next();
  }
  
  if (limit.count >= 30) {
    return res.status(429).json({
      success: false,
      message: "Rate limit exceeded | تم تجاوز حد الطلبات",
      retryAfter: Math.ceil((limit.resetAt - now) / 1000)
    });
  }
  
  limit.count++;
  next();
};

// Middleware: Auth check
const requireAuth = (req: Request, res: Response, next: Function) => {
  if (!req.session?.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required | المصادقة مطلوبة"
    });
  }
  next();
};

// Middleware: Owner only
const requireOwner = (req: Request, res: Response, next: Function) => {
  const ownerEmail = "mohamed.ali.b2001@gmail.com";
  if (req.session?.user?.email !== ownerEmail) {
    return res.status(403).json({
      success: false,
      message: "Owner access required | يتطلب وصول المالك"
    });
  }
  next();
};

// ============ Statistics ============

router.get("/stats", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'default';
    const stats = await futureEvolutionEngine.getStats(tenantId);

    res.json({
      success: true,
      message: "Statistics retrieved | تم استرجاع الإحصائيات",
      data: stats
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ Usage Patterns ============

router.get("/usage", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'default';
    const platformId = req.query.platformId as string | undefined;
    const patterns = await futureEvolutionEngine.getUsagePatterns(tenantId, platformId);

    res.json({
      success: true,
      message: "Usage patterns retrieved | تم استرجاع أنماط الاستخدام",
      data: patterns
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/usage/analyze", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'default';
    const { platformId } = req.body;

    if (!platformId) {
      return res.status(400).json({
        success: false,
        message: "Platform ID required | معرف المنصة مطلوب"
      });
    }

    const analysis = await futureEvolutionEngine.analyzeUsage(tenantId, platformId);

    res.json({
      success: true,
      message: "Usage analysis completed | تم تحليل الاستخدام",
      data: analysis
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ Future Requirements ============

router.get("/requirements", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'default';
    const platformId = req.query.platformId as string | undefined;
    const requirements = await futureEvolutionEngine.getRequirements(tenantId, platformId);

    res.json({
      success: true,
      message: "Requirements retrieved | تم استرجاع المتطلبات",
      data: requirements
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/requirements/discover", requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'default';
    const { platformId } = req.body;

    if (!platformId) {
      return res.status(400).json({
        success: false,
        message: "Platform ID required | معرف المنصة مطلوب"
      });
    }

    const newRequirements = await futureEvolutionEngine.discoverRequirements(tenantId, platformId);

    res.json({
      success: true,
      message: `Discovered ${newRequirements.length} new requirements | تم اكتشاف ${newRequirements.length} متطلبات جديدة`,
      data: newRequirements
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/requirements/:id/vote", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const { direction } = req.body;

    if (!direction || !['up', 'down'].includes(direction)) {
      return res.status(400).json({
        success: false,
        message: "Vote direction required (up/down) | اتجاه التصويت مطلوب"
      });
    }

    const requirement = await futureEvolutionEngine.voteRequirement(req.params.id, direction);

    if (!requirement) {
      return res.status(404).json({
        success: false,
        message: "Requirement not found | المتطلب غير موجود"
      });
    }

    res.json({
      success: true,
      message: "Vote recorded | تم تسجيل التصويت",
      data: requirement
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch("/requirements/:id/status", requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    const validStatuses: FeatureStatus[] = ['proposed', 'approved', 'in_progress', 'completed', 'rejected', 'deferred'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid status required | الحالة الصالحة مطلوبة"
      });
    }

    const requirement = await futureEvolutionEngine.updateRequirementStatus(req.params.id, status);

    if (!requirement) {
      return res.status(404).json({
        success: false,
        message: "Requirement not found | المتطلب غير موجود"
      });
    }

    res.json({
      success: true,
      message: "Status updated | تم تحديث الحالة",
      data: requirement
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ Expansion Suggestions ============

router.get("/suggestions", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'default';
    const platformId = req.query.platformId as string | undefined;
    const suggestions = await futureEvolutionEngine.getSuggestions(tenantId, platformId);

    res.json({
      success: true,
      message: "Suggestions retrieved | تم استرجاع الاقتراحات",
      data: suggestions
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/suggestions/generate", requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'default';
    const { platformId } = req.body;

    if (!platformId) {
      return res.status(400).json({
        success: false,
        message: "Platform ID required | معرف المنصة مطلوب"
      });
    }

    const newSuggestions = await futureEvolutionEngine.generateSuggestions(tenantId, platformId);

    res.json({
      success: true,
      message: `Generated ${newSuggestions.length} new suggestions | تم توليد ${newSuggestions.length} اقتراحات جديدة`,
      data: newSuggestions
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/suggestions/:id/accept", requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const suggestion = await futureEvolutionEngine.acceptSuggestion(req.params.id);

    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: "Suggestion not found | الاقتراح غير موجود"
      });
    }

    res.json({
      success: true,
      message: "Suggestion accepted | تم قبول الاقتراح",
      data: suggestion
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/suggestions/:id/reject", requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const suggestion = await futureEvolutionEngine.rejectSuggestion(req.params.id);

    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: "Suggestion not found | الاقتراح غير موجود"
      });
    }

    res.json({
      success: true,
      message: "Suggestion rejected | تم رفض الاقتراح",
      data: suggestion
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ Smart Roadmaps ============

router.get("/roadmaps", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'default';
    const roadmaps = await futureEvolutionEngine.getRoadmaps(tenantId);

    res.json({
      success: true,
      message: "Roadmaps retrieved | تم استرجاع خرائط الطريق",
      data: roadmaps
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/roadmaps/:id", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const roadmap = await futureEvolutionEngine.getRoadmap(req.params.id);

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: "Roadmap not found | خارطة الطريق غير موجودة"
      });
    }

    res.json({ success: true, data: roadmap });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/roadmaps", requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'default';
    const { platformId, platformName, vision, visionAr } = req.body;

    if (!platformId || !platformName || !vision) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields | الحقول المطلوبة ناقصة"
      });
    }

    const roadmap = await futureEvolutionEngine.createRoadmap(tenantId, {
      platformId,
      platformName,
      vision,
      visionAr: visionAr || vision
    });

    res.status(201).json({
      success: true,
      message: "Roadmap created | تم إنشاء خارطة الطريق",
      data: roadmap
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/roadmaps/:id/items", requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const { title, titleAr, description, quarter, year, category, estimatedEffort } = req.body;

    if (!title || !quarter || !year) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields | الحقول المطلوبة ناقصة"
      });
    }

    const roadmap = await futureEvolutionEngine.addRoadmapItem(req.params.id, {
      title,
      titleAr: titleAr || title,
      description: description || '',
      quarter,
      year,
      category: category || 'General',
      status: 'proposed',
      progress: 0,
      dependencies: [],
      estimatedEffort: estimatedEffort || 40
    });

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: "Roadmap not found | خارطة الطريق غير موجودة"
      });
    }

    res.json({
      success: true,
      message: "Item added to roadmap | تمت إضافة العنصر لخارطة الطريق",
      data: roadmap
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch("/roadmaps/:id/items/:itemId", requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    const roadmap = await futureEvolutionEngine.updateRoadmapItem(req.params.id, req.params.itemId, updates);

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: "Roadmap or item not found | خارطة الطريق أو العنصر غير موجود"
      });
    }

    res.json({
      success: true,
      message: "Item updated | تم تحديث العنصر",
      data: roadmap
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ Technology Trends ============

router.get("/trends", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const trends = category 
      ? futureEvolutionEngine.getTrendsByCategory(category)
      : futureEvolutionEngine.getTrends();

    res.json({
      success: true,
      message: "Trends retrieved | تم استرجاع الاتجاهات",
      data: trends
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ Evolution Insights ============

router.get("/insights", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'default';
    const platformId = req.query.platformId as string | undefined;
    const insights = await futureEvolutionEngine.getInsights(tenantId, platformId);

    res.json({
      success: true,
      message: "Insights retrieved | تم استرجاع الرؤى",
      data: insights
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/insights/generate", requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'default';
    const { platformId } = req.body;

    if (!platformId) {
      return res.status(400).json({
        success: false,
        message: "Platform ID required | معرف المنصة مطلوب"
      });
    }

    const newInsights = await futureEvolutionEngine.generateInsights(tenantId, platformId);

    res.json({
      success: true,
      message: `Generated ${newInsights.length} new insights | تم توليد ${newInsights.length} رؤى جديدة`,
      data: newInsights
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

console.log("[FutureEvolution] Routes initialized | تم تهيئة مسارات التطور المستقبلي");

export default router;
