/**
 * Command & Control Routes | مسارات القيادة والتحكم
 */

import { Router, Request, Response } from "express";
import { commandControlEngine, PlatformStatus, RiskLevel } from "../lib/command-control-engine";

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
  
  if (limit.count >= 60) {
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

// ============ Dashboard API | واجهة لوحة التحكم ============

// Get executive summary
router.get("/summary", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'default';
    const summary = await commandControlEngine.getExecutiveSummary(tenantId);

    res.json({
      success: true,
      message: "Executive summary retrieved | تم استرجاع الملخص التنفيذي",
      data: summary
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get full statistics
router.get("/stats", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'default';
    const stats = await commandControlEngine.getStats(tenantId);

    res.json({
      success: true,
      message: "Statistics retrieved | تم استرجاع الإحصائيات",
      data: stats
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get sectors list
router.get("/sectors", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const sectors = commandControlEngine.getSectors();
    res.json({ success: true, data: sectors });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ Platforms API | واجهة المنصات ============

// Get all platforms
router.get("/platforms", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'default';
    const { status, sector, riskLevel } = req.query;
    
    const platforms = await commandControlEngine.getPlatforms(tenantId, {
      status: status as PlatformStatus,
      sector: sector as string,
      riskLevel: riskLevel as RiskLevel
    });

    res.json({
      success: true,
      message: "Platforms retrieved | تم استرجاع المنصات",
      data: platforms
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single platform
router.get("/platforms/:id", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const platform = await commandControlEngine.getPlatform(req.params.id);
    
    if (!platform) {
      return res.status(404).json({
        success: false,
        message: "Platform not found | المنصة غير موجودة"
      });
    }

    res.json({ success: true, data: platform });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create platform (Owner only)
router.post("/platforms", requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'default';
    const platform = await commandControlEngine.createPlatform(tenantId, req.body);

    res.status(201).json({
      success: true,
      message: "Platform created | تم إنشاء المنصة",
      data: platform
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update platform (Owner only)
router.patch("/platforms/:id", requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const platform = await commandControlEngine.updatePlatform(req.params.id, req.body);
    
    if (!platform) {
      return res.status(404).json({
        success: false,
        message: "Platform not found | المنصة غير موجودة"
      });
    }

    res.json({
      success: true,
      message: "Platform updated | تم تحديث المنصة",
      data: platform
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Assess platform maturity
router.post("/platforms/:id/assess-maturity", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const assessment = await commandControlEngine.assessMaturity(req.params.id);

    res.json({
      success: true,
      message: "Maturity assessment completed | تم تقييم النضج",
      data: assessment
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Assess platform risk
router.post("/platforms/:id/assess-risk", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const assessment = await commandControlEngine.assessRisk(req.params.id);

    res.json({
      success: true,
      message: "Risk assessment completed | تم تقييم المخاطر",
      data: assessment
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ Alerts API | واجهة التنبيهات ============

// Get alerts
router.get("/alerts", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'default';
    const { severity, acknowledged } = req.query;
    
    const alerts = await commandControlEngine.getAlerts(tenantId, {
      severity: severity as any,
      acknowledged: acknowledged === 'true' ? true : acknowledged === 'false' ? false : undefined
    });

    res.json({
      success: true,
      message: "Alerts retrieved | تم استرجاع التنبيهات",
      data: alerts
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Acknowledge alert
router.post("/alerts/:id/acknowledge", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const alert = await commandControlEngine.acknowledgeAlert(req.params.id);
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found | التنبيه غير موجود"
      });
    }

    res.json({
      success: true,
      message: "Alert acknowledged | تم الإقرار بالتنبيه",
      data: alert
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ Goals API | واجهة الأهداف ============

// Get strategic goals
router.get("/goals", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'default';
    const goals = await commandControlEngine.getGoals(tenantId);

    res.json({
      success: true,
      message: "Goals retrieved | تم استرجاع الأهداف",
      data: goals
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create strategic goal (Owner only)
router.post("/goals", requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'default';
    const goal = await commandControlEngine.createGoal(tenantId, {
      ...req.body,
      tenantId,
      deadline: new Date(req.body.deadline),
      linkedPlatforms: req.body.linkedPlatforms || []
    });

    res.status(201).json({
      success: true,
      message: "Goal created | تم إنشاء الهدف",
      data: goal
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update goal progress
router.patch("/goals/:id/progress", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const { current } = req.body;
    const goal = await commandControlEngine.updateGoalProgress(req.params.id, current);
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found | الهدف غير موجود"
      });
    }

    res.json({
      success: true,
      message: "Goal progress updated | تم تحديث تقدم الهدف",
      data: goal
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ Reports API | واجهة التقارير ============

// Generate executive report
router.post("/reports/generate", requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'default';
    const { type } = req.body;
    
    const report = await commandControlEngine.generateExecutiveReport(tenantId, type || 'weekly');

    res.json({
      success: true,
      message: "Executive report generated | تم إنشاء التقرير التنفيذي",
      data: report
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

console.log("[CommandControl] Routes initialized | تم تهيئة مسارات القيادة والتحكم");

export default router;
