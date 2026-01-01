/**
 * Failure Management & Recovery Routes | مسارات إدارة الفشل والتعافي
 */

import { Router, Request, Response } from "express";
import { failureRecoveryEngine, FailureCategory, SeverityLevel } from "../lib/failure-recovery-engine";

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

// ============ Scenarios API | واجهة السيناريوهات ============

// Get all failure scenarios
router.get("/scenarios", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'default';
    const { category, severity, status } = req.query;
    
    const scenarios = await failureRecoveryEngine.getScenarios(tenantId, {
      category: category as FailureCategory,
      severity: severity as SeverityLevel,
      status: status as any
    });

    res.json({
      success: true,
      message: "Scenarios retrieved | تم استرجاع السيناريوهات",
      data: scenarios
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get single scenario
router.get("/scenarios/:id", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const scenario = await failureRecoveryEngine.getScenario(req.params.id);
    
    if (!scenario) {
      return res.status(404).json({
        success: false,
        message: "Scenario not found | السيناريو غير موجود"
      });
    }

    res.json({
      success: true,
      data: scenario
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create new failure scenario (Owner only)
router.post("/scenarios", requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'default';
    const { category, name, nameAr, description, descriptionAr, severity, triggers, affectedComponents } = req.body;

    if (!category || !name || !severity) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields | حقول مطلوبة مفقودة"
      });
    }

    const scenario = await failureRecoveryEngine.generateScenario(tenantId, {
      category,
      name,
      nameAr: nameAr || name,
      description: description || '',
      descriptionAr: descriptionAr || description || '',
      severity,
      triggers: triggers || [],
      affectedComponents: affectedComponents || []
    });

    res.status(201).json({
      success: true,
      message: "Scenario created with recovery plan | تم إنشاء السيناريو مع خطة التعافي",
      data: scenario
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============ Recovery Plans API | واجهة خطط التعافي ============

// Get recovery plans
router.get("/plans", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'default';
    const { scenarioId } = req.query;
    
    const plans = await failureRecoveryEngine.getRecoveryPlans(tenantId, scenarioId as string);

    res.json({
      success: true,
      message: "Recovery plans retrieved | تم استرجاع خطط التعافي",
      data: plans
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get single recovery plan
router.get("/plans/:id", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const plan = await failureRecoveryEngine.getRecoveryPlan(req.params.id);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Recovery plan not found | خطة التعافي غير موجودة"
      });
    }

    res.json({
      success: true,
      data: plan
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Execute recovery plan (Owner only)
router.post("/plans/:id/execute", requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const executedBy = req.session?.user?.email || 'system';
    const result = await failureRecoveryEngine.executeRecoveryPlan(req.params.id, executedBy);

    res.json({
      success: result.success,
      message: result.success 
        ? "Recovery plan executed successfully | تم تنفيذ خطة التعافي بنجاح"
        : "Recovery plan execution failed | فشل تنفيذ خطة التعافي",
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============ Emergency Tests API | واجهة اختبارات الطوارئ ============

// Get emergency tests
router.get("/tests", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'default';
    const { planId } = req.query;
    
    const tests = await failureRecoveryEngine.getEmergencyTests(tenantId, planId as string);

    res.json({
      success: true,
      message: "Emergency tests retrieved | تم استرجاع اختبارات الطوارئ",
      data: tests
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Schedule emergency test (Owner only)
router.post("/tests/schedule", requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'default';
    const { planId, scheduledAt } = req.body;

    if (!planId || !scheduledAt) {
      return res.status(400).json({
        success: false,
        message: "Plan ID and scheduled time required | معرف الخطة ووقت الجدولة مطلوبان"
      });
    }

    const test = await failureRecoveryEngine.scheduleEmergencyTest(
      tenantId,
      planId,
      new Date(scheduledAt)
    );

    res.status(201).json({
      success: true,
      message: "Emergency test scheduled | تم جدولة اختبار الطوارئ",
      data: test
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Run emergency test now (Owner only)
router.post("/tests/:id/run", requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const testedBy = req.session?.user?.email;
    const test = await failureRecoveryEngine.runEmergencyTest(req.params.id, testedBy);

    res.json({
      success: true,
      message: test.status === 'passed' 
        ? "Emergency test passed | اجتاز اختبار الطوارئ"
        : "Emergency test completed with issues | اكتمل اختبار الطوارئ مع مشكلات",
      data: test
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============ Incidents API | واجهة الحوادث ============

// Get incidents
router.get("/incidents", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'default';
    const { status, severity } = req.query;
    
    const incidents = await failureRecoveryEngine.getIncidents(tenantId, {
      status: status as any,
      severity: severity as SeverityLevel
    });

    res.json({
      success: true,
      message: "Incidents retrieved | تم استرجاع الحوادث",
      data: incidents
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create incident
router.post("/incidents", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'default';
    const { title, titleAr, description, severity, scenarioId, affectedServices } = req.body;

    if (!title || !severity) {
      return res.status(400).json({
        success: false,
        message: "Title and severity required | العنوان والخطورة مطلوبان"
      });
    }

    const incident = await failureRecoveryEngine.createIncident(tenantId, {
      title,
      titleAr: titleAr || title,
      description: description || '',
      severity,
      scenarioId,
      affectedServices: affectedServices || []
    });

    res.status(201).json({
      success: true,
      message: "Incident created | تم إنشاء الحادثة",
      data: incident
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update incident status
router.patch("/incidents/:id/status", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const { status, description, resolution, rootCause, lessonsLearned } = req.body;
    const actor = req.session?.user?.email;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status required | الحالة مطلوبة"
      });
    }

    const incident = await failureRecoveryEngine.updateIncidentStatus(req.params.id, status, {
      description,
      actor,
      resolution,
      rootCause,
      lessonsLearned
    });

    res.json({
      success: true,
      message: "Incident updated | تم تحديث الحادثة",
      data: incident
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============ Health & Stats API | واجهة الصحة والإحصائيات ============

// Get health status
router.get("/health", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const health = await failureRecoveryEngine.getHealthStatus();

    res.json({
      success: true,
      message: "Health status retrieved | تم استرجاع حالة الصحة",
      data: health
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get statistics
router.get("/stats", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'default';
    const stats = await failureRecoveryEngine.getStats(tenantId);

    res.json({
      success: true,
      message: "Statistics retrieved | تم استرجاع الإحصائيات",
      data: stats
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

console.log("[FailureRecovery] Routes initialized | تم تهيئة مسارات إدارة الفشل والتعافي");

export default router;
