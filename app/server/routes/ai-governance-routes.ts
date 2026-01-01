/**
 * INFERA WebNova - AI Governance API Routes
 * مسارات API للتحكم في الذكاء الاصطناعي
 */

import { Router, Request, Response } from "express";
import { aiGovernanceEngine, GuardrailCategory, DecisionStatus, InterventionType } from "../lib/ai-governance-engine";

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

router.get("/guardrails", requireAuth, rateLimit, (req: Request, res: Response) => {
  try {
    const category = req.query.category as GuardrailCategory | undefined;
    const guardrails = aiGovernanceEngine.getGuardrails(category);

    res.json({
      success: true,
      data: guardrails,
      count: guardrails.length,
      message: `Found ${guardrails.length} guardrails | تم العثور على ${guardrails.length} حواجز`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/guardrails", requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { name, nameAr, category, description, descriptionAr, condition, conditionAr, severity, enabled, predicate } = req.body;

    if (!name || !category || !severity) {
      return res.status(400).json({
        success: false,
        error: "Name, category, and severity required | الاسم والفئة والشدة مطلوبة"
      });
    }

    const guardrail = aiGovernanceEngine.createGuardrail({
      name,
      nameAr: nameAr || name,
      category,
      description: description || '',
      descriptionAr: descriptionAr || description || '',
      condition: condition || '',
      conditionAr: conditionAr || condition || '',
      predicate: predicate || undefined,
      severity,
      enabled: enabled !== false,
      createdBy: user.email
    }, user.email);

    res.json({
      success: true,
      data: guardrail,
      message: `Created guardrail: ${name} | تم إنشاء الحاجز: ${nameAr || name}`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.patch("/guardrails/:id", requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  try {
    const guardrail = aiGovernanceEngine.updateGuardrail(req.params.id, req.body);

    if (!guardrail) {
      return res.status(404).json({
        success: false,
        error: "Guardrail not found | الحاجز غير موجود"
      });
    }

    res.json({
      success: true,
      data: guardrail,
      message: `Updated guardrail | تم تحديث الحاجز`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete("/guardrails/:id", requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  try {
    const deleted = aiGovernanceEngine.deleteGuardrail(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Guardrail not found | الحاجز غير موجود"
      });
    }

    res.json({
      success: true,
      message: "Guardrail deleted | تم حذف الحاجز"
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/decisions", requireAuth, rateLimit, (req: Request, res: Response) => {
  try {
    const { userId, status, fromDate, toDate } = req.query;
    
    const decisions = aiGovernanceEngine.getDecisions({
      userId: userId as string,
      status: status as DecisionStatus,
      fromDate: fromDate as string,
      toDate: toDate as string
    });

    res.json({
      success: true,
      data: decisions,
      count: decisions.length,
      message: `Found ${decisions.length} decisions | تم العثور على ${decisions.length} قرارات`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/decisions/:id", requireAuth, rateLimit, (req: Request, res: Response) => {
  try {
    const decision = aiGovernanceEngine.getDecision(req.params.id);

    if (!decision) {
      return res.status(404).json({
        success: false,
        error: "Decision not found | القرار غير موجود"
      });
    }

    res.json({
      success: true,
      data: decision,
      message: "Decision loaded | تم تحميل القرار"
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/decisions/log", requireAuth, rateLimit, (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { sessionId, action, actionAr, context, reasoning, reasoningAr, outcome } = req.body;

    if (!action || !context) {
      return res.status(400).json({
        success: false,
        error: "Action and context required | العملية والسياق مطلوبين"
      });
    }

    const decision = aiGovernanceEngine.logDecision({
      sessionId: sessionId || `session-${Date.now()}`,
      userId: user.email,
      action,
      actionAr: actionAr || action,
      context,
      reasoning: reasoning || '',
      reasoningAr: reasoningAr || reasoning || '',
      outcome: outcome || { success: true }
    });

    res.json({
      success: true,
      data: decision,
      message: decision.status === 'auto-approved'
        ? `Decision auto-approved | تمت الموافقة التلقائية على القرار`
        : decision.status === 'escalated'
        ? `Decision escalated for review | تم تصعيد القرار للمراجعة`
        : `Decision logged | تم تسجيل القرار`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/interventions", requireAuth, rateLimit, (req: Request, res: Response) => {
  try {
    const status = req.query.status as 'pending' | 'resolved' | 'expired' | undefined;
    const interventions = aiGovernanceEngine.getInterventions(status);

    res.json({
      success: true,
      data: interventions,
      count: interventions.length,
      message: `Found ${interventions.length} interventions | تم العثور على ${interventions.length} تدخلات`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/interventions/:id", requireAuth, rateLimit, (req: Request, res: Response) => {
  try {
    const intervention = aiGovernanceEngine.getIntervention(req.params.id);

    if (!intervention) {
      return res.status(404).json({
        success: false,
        error: "Intervention not found | التدخل غير موجود"
      });
    }

    res.json({
      success: true,
      data: intervention,
      message: "Intervention loaded | تم تحميل التدخل"
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/interventions/:id/resolve", requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { type, notes, modifiedAction } = req.body;

    if (!type) {
      return res.status(400).json({
        success: false,
        error: "Resolution type required | نوع الحل مطلوب"
      });
    }

    const intervention = aiGovernanceEngine.resolveIntervention(
      req.params.id,
      user.email,
      type as InterventionType,
      notes,
      modifiedAction
    );

    if (!intervention) {
      return res.status(404).json({
        success: false,
        error: "Intervention not found | التدخل غير موجود"
      });
    }

    res.json({
      success: true,
      data: intervention,
      message: type === 'approval'
        ? `Approved by ${user.email} | تمت الموافقة من ${user.email}`
        : type === 'rejection'
        ? `Rejected by ${user.email} | تم الرفض من ${user.email}`
        : `Resolved by ${user.email} | تم الحل من ${user.email}`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/policies", requireAuth, rateLimit, (req: Request, res: Response) => {
  try {
    const policies = aiGovernanceEngine.getPolicies();

    res.json({
      success: true,
      data: policies,
      count: policies.length,
      message: `Found ${policies.length} policies | تم العثور على ${policies.length} سياسات`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.patch("/policies/:id", requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  try {
    const policy = aiGovernanceEngine.updatePolicy(req.params.id, req.body);

    if (!policy) {
      return res.status(404).json({
        success: false,
        error: "Policy not found | السياسة غير موجودة"
      });
    }

    res.json({
      success: true,
      data: policy,
      message: `Updated policy | تم تحديث السياسة`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/stats", requireAuth, rateLimit, (req: Request, res: Response) => {
  try {
    const stats = aiGovernanceEngine.getStats();

    res.json({
      success: true,
      data: stats,
      message: "Stats loaded | تم تحميل الإحصائيات"
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/config/categories", requireAuth, rateLimit, (req: Request, res: Response) => {
  try {
    const categories = aiGovernanceEngine.getGuardrailCategories();

    res.json({
      success: true,
      data: categories,
      message: "Categories loaded | تم تحميل الفئات"
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/config/severities", requireAuth, rateLimit, (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: [
        { id: 'block', name: 'Block', nameAr: 'حظر', description: 'Completely blocks the action' },
        { id: 'warn', name: 'Warn', nameAr: 'تحذير', description: 'Warns but allows the action' },
        { id: 'log', name: 'Log', nameAr: 'تسجيل', description: 'Logs the action silently' }
      ],
      message: "Severities loaded | تم تحميل مستويات الشدة"
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

console.log("[AIGovernance] Routes initialized | تم تهيئة مسارات حوكمة الذكاء الاصطناعي");
