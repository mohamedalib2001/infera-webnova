/**
 * INFERA WebNova - Architectural Knowledge Management API Routes
 * مسارات API لنظام إدارة المعرفة المعمارية
 */

import { Router, Request, Response } from "express";
import { architecturalKnowledgeEngine, ArchitecturalDecision, ComparedDesign, ComparisonCriterion, ConstraintSet } from "../lib/architectural-knowledge-engine";

const router = Router();

const OWNER_EMAIL = "mohamed.ali.b2001@gmail.com";

const requireAuth = (req: Request, res: Response, next: Function) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      error: "Authentication required | يجب تسجيل الدخول"
    });
  }
  next();
};

const requireOwner = (req: Request, res: Response, next: Function) => {
  const user = req.user as any;
  if (!user || user.email !== OWNER_EMAIL) {
    return res.status(403).json({
      success: false,
      error: "Owner access required | مطلوب صلاحية المالك"
    });
  }
  next();
};

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 60;
const RATE_WINDOW = 60000;

const rateLimit = (req: Request, res: Response, next: Function) => {
  const user = req.user as any;
  const key = user?.email || req.ip || 'anonymous';
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_WINDOW });
    return next();
  }

  if (entry.count >= RATE_LIMIT) {
    return res.status(429).json({
      success: false,
      error: "Rate limit exceeded | تم تجاوز حد الطلبات"
    });
  }

  entry.count++;
  next();
};

router.post("/decisions", requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const decisionData = req.body;

    if (!decisionData.title || !decisionData.decision || !decisionData.rationale) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: title, decision, rationale | حقول مطلوبة"
      });
    }

    const decision = architecturalKnowledgeEngine.recordDecision({
      ...decisionData,
      createdBy: user.email,
      status: decisionData.status || 'proposed',
      category: decisionData.category || 'api',
      alternatives: decisionData.alternatives || [],
      constraints: decisionData.constraints || [],
      constraintsAr: decisionData.constraintsAr || [],
      consequences: decisionData.consequences || [],
      consequencesAr: decisionData.consequencesAr || [],
      relatedDecisions: decisionData.relatedDecisions || [],
      tags: decisionData.tags || [],
      priority: decisionData.priority || 'medium'
    });

    res.json({
      success: true,
      data: decision,
      message: `Decision recorded: ${decision.title} | تم تسجيل القرار: ${decision.titleAr}`
    });
  } catch (error: any) {
    console.error("[ArchitecturalKnowledge] Record decision error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/decisions", requireAuth, rateLimit, (req: Request, res: Response) => {
  try {
    const { category, status, tag } = req.query;
    
    const decisions = architecturalKnowledgeEngine.getAllDecisions({
      category: category as any,
      status: status as any,
      tag: tag as string
    });

    res.json({
      success: true,
      data: decisions,
      count: decisions.length,
      message: `Found ${decisions.length} decisions | تم العثور على ${decisions.length} قرار`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/decisions/:id", requireAuth, rateLimit, (req: Request, res: Response) => {
  try {
    const decision = architecturalKnowledgeEngine.getDecision(req.params.id);

    if (!decision) {
      return res.status(404).json({
        success: false,
        error: "Decision not found | القرار غير موجود"
      });
    }

    const related = architecturalKnowledgeEngine.getRelatedDecisions(req.params.id);

    res.json({
      success: true,
      data: { decision, related },
      message: "Decision loaded | تم تحميل القرار"
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.patch("/decisions/:id", requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  try {
    const updated = architecturalKnowledgeEngine.updateDecision(req.params.id, req.body);

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: "Decision not found | القرار غير موجود"
      });
    }

    res.json({
      success: true,
      data: updated,
      message: `Decision updated: ${updated.title} | تم تحديث القرار: ${updated.titleAr}`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/decisions/:id/supersede", requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const newDecisionData = req.body;

    if (!newDecisionData.title || !newDecisionData.decision || !newDecisionData.rationale) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields for new decision | حقول مطلوبة للقرار الجديد"
      });
    }

    const newDecision = architecturalKnowledgeEngine.supersedeDecision(req.params.id, {
      ...newDecisionData,
      createdBy: user.email,
      status: 'accepted',
      category: newDecisionData.category || 'api',
      alternatives: newDecisionData.alternatives || [],
      constraints: newDecisionData.constraints || [],
      constraintsAr: newDecisionData.constraintsAr || [],
      consequences: newDecisionData.consequences || [],
      consequencesAr: newDecisionData.consequencesAr || [],
      relatedDecisions: newDecisionData.relatedDecisions || [],
      tags: newDecisionData.tags || [],
      priority: newDecisionData.priority || 'medium'
    });

    if (!newDecision) {
      return res.status(404).json({
        success: false,
        error: "Original decision not found | القرار الأصلي غير موجود"
      });
    }

    res.json({
      success: true,
      data: newDecision,
      message: `Decision superseded with: ${newDecision.title} | تم استبدال القرار بـ: ${newDecision.titleAr}`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/decisions/:id/history", requireAuth, rateLimit, (req: Request, res: Response) => {
  try {
    const history = architecturalKnowledgeEngine.getDecisionHistory(req.params.id);

    res.json({
      success: true,
      data: history,
      message: `Found ${history.length} decisions in history | تم العثور على ${history.length} قرار في السجل`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/decisions/search", requireAuth, rateLimit, (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: "Search query required | مطلوب نص البحث"
      });
    }

    const results = architecturalKnowledgeEngine.searchDecisions(query);

    res.json({
      success: true,
      data: results,
      count: results.length,
      message: `Found ${results.length} matching decisions | تم العثور على ${results.length} قرار مطابق`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/compare", requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { title, titleAr, designs, criteria, scores } = req.body;

    if (!title || !designs || !criteria || !scores) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: title, designs, criteria, scores | حقول مطلوبة"
      });
    }

    if (designs.length < 2) {
      return res.status(400).json({
        success: false,
        error: "At least 2 designs required for comparison | مطلوب تصميمان على الأقل للمقارنة"
      });
    }

    const comparison = architecturalKnowledgeEngine.compareDesigns(
      title,
      titleAr || title,
      designs as ComparedDesign[],
      criteria as ComparisonCriterion[],
      scores,
      user.email
    );

    res.json({
      success: true,
      data: comparison,
      message: `Comparison complete: ${comparison.recommendation} | المقارنة مكتملة: ${comparison.recommendationAr}`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/comparisons", requireAuth, rateLimit, (req: Request, res: Response) => {
  try {
    const comparisons = architecturalKnowledgeEngine.getAllComparisons();

    res.json({
      success: true,
      data: comparisons,
      count: comparisons.length,
      message: `Found ${comparisons.length} comparisons | تم العثور على ${comparisons.length} مقارنة`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/comparisons/:id", requireAuth, rateLimit, (req: Request, res: Response) => {
  try {
    const comparison = architecturalKnowledgeEngine.getComparison(req.params.id);

    if (!comparison) {
      return res.status(404).json({
        success: false,
        error: "Comparison not found | المقارنة غير موجودة"
      });
    }

    res.json({
      success: true,
      data: comparison,
      message: "Comparison loaded | تم تحميل المقارنة"
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/suggest", requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  try {
    const constraints = req.body as ConstraintSet;

    const suggestions = architecturalKnowledgeEngine.suggestAlternatives(constraints);

    res.json({
      success: true,
      data: suggestions,
      count: suggestions.length,
      message: `Generated ${suggestions.length} suggestions | تم توليد ${suggestions.length} اقتراح`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/patterns", requireAuth, rateLimit, (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    const patterns = category
      ? architecturalKnowledgeEngine.getPatternsByCategory(category as any)
      : architecturalKnowledgeEngine.getAllPatterns();

    res.json({
      success: true,
      data: patterns,
      count: patterns.length,
      message: `Found ${patterns.length} patterns | تم العثور على ${patterns.length} نمط`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/patterns/:id", requireAuth, rateLimit, (req: Request, res: Response) => {
  try {
    const pattern = architecturalKnowledgeEngine.getPattern(req.params.id);

    if (!pattern) {
      return res.status(404).json({
        success: false,
        error: "Pattern not found | النمط غير موجود"
      });
    }

    res.json({
      success: true,
      data: pattern,
      message: "Pattern loaded | تم تحميل النمط"
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/config", requireAuth, rateLimit, (req: Request, res: Response) => {
  try {
    const categories = architecturalKnowledgeEngine.getCategories();

    res.json({
      success: true,
      data: {
        categories,
        statuses: [
          { id: 'proposed', name: 'Proposed', nameAr: 'مقترح' },
          { id: 'accepted', name: 'Accepted', nameAr: 'مقبول' },
          { id: 'rejected', name: 'Rejected', nameAr: 'مرفوض' },
          { id: 'superseded', name: 'Superseded', nameAr: 'مستبدل' },
          { id: 'deprecated', name: 'Deprecated', nameAr: 'متقادم' }
        ],
        priorities: [
          { id: 'low', name: 'Low', nameAr: 'منخفض' },
          { id: 'medium', name: 'Medium', nameAr: 'متوسط' },
          { id: 'high', name: 'High', nameAr: 'عالي' },
          { id: 'critical', name: 'Critical', nameAr: 'حرج' }
        ]
      },
      message: "Configuration loaded | تم تحميل الإعدادات"
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/export", requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  try {
    const data = architecturalKnowledgeEngine.exportKnowledgeBase();

    res.json({
      success: true,
      data,
      message: "Knowledge base exported | تم تصدير قاعدة المعرفة"
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

console.log("[ArchitecturalKnowledge] Routes initialized | تم تهيئة مسارات المعرفة المعمارية");
