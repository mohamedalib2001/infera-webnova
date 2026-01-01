/**
 * INFERA WebNova - Pre-Build Simulation API Routes
 * مسارات API لمحرك المحاكاة قبل البناء
 */

import { Router, Request, Response } from "express";
import { preBuildSimulationEngine, PlatformSpec, SimulationType } from "../lib/pre-build-simulation-engine";

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
const RATE_LIMIT = 20;
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

router.post("/run", requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { platformSpec, simulationType } = req.body;

    if (!platformSpec || !platformSpec.name) {
      return res.status(400).json({
        success: false,
        error: "Platform specification required | مواصفات المنصة مطلوبة"
      });
    }

    const type: SimulationType = simulationType || 'comprehensive';

    const result = await preBuildSimulationEngine.runSimulation(
      platformSpec as PlatformSpec,
      type,
      user.email
    );

    res.json({
      success: true,
      data: result,
      message: result.status === 'completed'
        ? `Simulation completed with score ${result.overallScore}/100 | المحاكاة مكتملة بدرجة ${result.overallScore}/100`
        : result.status === 'warning'
        ? `Simulation completed with warnings, score ${result.overallScore}/100 | المحاكاة مكتملة مع تحذيرات`
        : `Simulation detected critical issues, score ${result.overallScore}/100 | المحاكاة اكتشفت مشاكل حرجة`
    });
  } catch (error: any) {
    console.error("[PreBuildSimulation] Run simulation error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/quick-estimate", requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  try {
    const { featureCount, integrationCount, expectedUsers, tier, sector } = req.body;

    if (featureCount === undefined || expectedUsers === undefined) {
      return res.status(400).json({
        success: false,
        error: "Feature count and expected users required | عدد الميزات والمستخدمين المتوقعين مطلوب"
      });
    }

    const estimate = preBuildSimulationEngine.getQuickEstimate({
      featureCount: featureCount || 5,
      integrationCount: integrationCount || 2,
      expectedUsers: expectedUsers || 1000,
      tier: tier || 'professional',
      sector: sector || 'enterprise'
    });

    res.json({
      success: true,
      data: estimate,
      message: estimate.warnings.length > 0
        ? `Quick estimate completed with ${estimate.warnings.length} warnings | التقدير السريع مكتمل مع ${estimate.warnings.length} تحذيرات`
        : `Quick estimate completed | التقدير السريع مكتمل`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/simulations", requireAuth, rateLimit, (req: Request, res: Response) => {
  try {
    const simulations = preBuildSimulationEngine.getAllSimulations();

    res.json({
      success: true,
      data: simulations,
      count: simulations.length,
      message: `Found ${simulations.length} simulations | تم العثور على ${simulations.length} محاكاة`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/simulations/:id", requireAuth, rateLimit, (req: Request, res: Response) => {
  try {
    const simulation = preBuildSimulationEngine.getSimulation(req.params.id);

    if (!simulation) {
      return res.status(404).json({
        success: false,
        error: "Simulation not found | المحاكاة غير موجودة"
      });
    }

    res.json({
      success: true,
      data: simulation,
      message: "Simulation loaded | تم تحميل المحاكاة"
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/config/sectors", requireAuth, rateLimit, (req: Request, res: Response) => {
  try {
    const sectors = preBuildSimulationEngine.getSectorPresets();

    res.json({
      success: true,
      data: sectors,
      message: "Sector presets loaded | تم تحميل القطاعات"
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/config/feature-types", requireAuth, rateLimit, (req: Request, res: Response) => {
  try {
    const featureTypes = preBuildSimulationEngine.getFeatureTypes();

    res.json({
      success: true,
      data: featureTypes,
      message: "Feature types loaded | تم تحميل أنواع الميزات"
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/config/integration-types", requireAuth, rateLimit, (req: Request, res: Response) => {
  try {
    const integrationTypes = preBuildSimulationEngine.getIntegrationTypes();

    res.json({
      success: true,
      data: integrationTypes,
      message: "Integration types loaded | تم تحميل أنواع التكامل"
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/config/infrastructure", requireAuth, rateLimit, (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        tiers: [
          { id: 'starter', name: 'Starter', nameAr: 'مبتدئ', maxUsers: 100, description: 'Basic infrastructure' },
          { id: 'professional', name: 'Professional', nameAr: 'احترافي', maxUsers: 500, description: 'Enhanced performance' },
          { id: 'enterprise', name: 'Enterprise', nameAr: 'مؤسسي', maxUsers: 2000, description: 'High availability' },
          { id: 'dedicated', name: 'Dedicated', nameAr: 'مخصص', maxUsers: 10000, description: 'Maximum performance' }
        ],
        dataVolumes: [
          { id: 'small', name: 'Small', nameAr: 'صغير', description: '<1GB' },
          { id: 'medium', name: 'Medium', nameAr: 'متوسط', description: '1-10GB' },
          { id: 'large', name: 'Large', nameAr: 'كبير', description: '10-100GB' },
          { id: 'massive', name: 'Massive', nameAr: 'ضخم', description: '>100GB' }
        ],
        securityLevels: [
          { id: 'standard', name: 'Standard', nameAr: 'عادي' },
          { id: 'enhanced', name: 'Enhanced', nameAr: 'محسّن' },
          { id: 'military', name: 'Military Grade', nameAr: 'عسكري' }
        ]
      },
      message: "Infrastructure config loaded | تم تحميل إعدادات البنية التحتية"
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

console.log("[PreBuildSimulation] Routes initialized | تم تهيئة مسارات المحاكاة قبل البناء");
