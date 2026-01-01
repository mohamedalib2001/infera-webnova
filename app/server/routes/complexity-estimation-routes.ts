/**
 * INFERA WebNova - Complexity Estimation API Routes
 * مسارات API لتقدير التعقيد والتكلفة
 */

import { Router, Request, Response } from "express";
import { complexityEngine, PlatformSpec } from "../lib/complexity-estimation-engine";

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
const RATE_LIMIT = 30;
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

router.post("/estimate", requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const spec = req.body as PlatformSpec;

    if (!spec.name || !spec.sector || !spec.type) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: name, sector, type | حقول مطلوبة: الاسم، القطاع، النوع"
      });
    }

    const defaults: Partial<PlatformSpec> = {
      securityLevel: 'standard',
      features: [],
      integrations: [],
      dataModels: [],
      userRoles: 3,
      expectedUsers: 1000,
      multiLanguage: false,
      multiTenant: false,
      complianceRequirements: []
    };

    const fullSpec: PlatformSpec = { ...defaults, ...spec } as PlatformSpec;
    const result = complexityEngine.estimatePlatform(fullSpec);

    res.json({
      success: true,
      data: result,
      message: `Estimation complete: ${result.complexity.level} | التقدير مكتمل: ${result.complexity.levelAr}`
    });
  } catch (error: any) {
    console.error("[ComplexityAPI] Estimation error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/quick-estimate", requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  try {
    const { features = 5, integrations = 2, sector = 'general', securityLevel = 'standard' } = req.body;

    const result = complexityEngine.quickEstimate(
      Number(features),
      Number(integrations),
      sector,
      securityLevel
    );

    res.json({
      success: true,
      data: result,
      message: "Quick estimate complete | التقدير السريع مكتمل"
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/templates/features", requireAuth, rateLimit, (req: Request, res: Response) => {
  try {
    const templates = complexityEngine.getFeatureTemplates();
    res.json({
      success: true,
      data: templates,
      message: "Feature templates loaded | تم تحميل قوالب الميزات"
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/templates/integrations", requireAuth, rateLimit, (req: Request, res: Response) => {
  try {
    const templates = complexityEngine.getIntegrationTemplates();
    res.json({
      success: true,
      data: templates,
      message: "Integration templates loaded | تم تحميل قوالب التكاملات"
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/config", requireAuth, rateLimit, (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      sectors: [
        { id: 'financial', name: 'Financial', nameAr: 'مالي' },
        { id: 'healthcare', name: 'Healthcare', nameAr: 'رعاية صحية' },
        { id: 'government', name: 'Government', nameAr: 'حكومي' },
        { id: 'education', name: 'Education', nameAr: 'تعليم' },
        { id: 'enterprise', name: 'Enterprise', nameAr: 'مؤسسي' },
        { id: 'general', name: 'General', nameAr: 'عام' }
      ],
      platformTypes: [
        { id: 'web', name: 'Web Application', nameAr: 'تطبيق ويب' },
        { id: 'mobile', name: 'Mobile App', nameAr: 'تطبيق جوال' },
        { id: 'desktop', name: 'Desktop App', nameAr: 'تطبيق سطح مكتب' },
        { id: 'hybrid', name: 'Hybrid', nameAr: 'هجين' },
        { id: 'api', name: 'API Only', nameAr: 'API فقط' }
      ],
      securityLevels: [
        { id: 'basic', name: 'Basic', nameAr: 'أساسي', description: 'Standard web security' },
        { id: 'standard', name: 'Standard', nameAr: 'قياسي', description: 'Enhanced security with encryption' },
        { id: 'high', name: 'High', nameAr: 'عالي', description: 'Enterprise-grade security' },
        { id: 'military', name: 'Military Grade', nameAr: 'عسكري', description: 'FIPS 140-3 compliant' }
      ],
      complexityLevels: [
        { id: 'simple', name: 'Simple', nameAr: 'بسيط', points: 1 },
        { id: 'medium', name: 'Medium', nameAr: 'متوسط', points: 3 },
        { id: 'complex', name: 'Complex', nameAr: 'معقد', points: 7 },
        { id: 'very_complex', name: 'Very Complex', nameAr: 'معقد جداً', points: 15 }
      ],
      complianceOptions: [
        { id: 'GDPR', name: 'GDPR', region: 'EU' },
        { id: 'HIPAA', name: 'HIPAA', region: 'US Healthcare' },
        { id: 'PCI-DSS', name: 'PCI-DSS', region: 'Payments' },
        { id: 'SOC2', name: 'SOC 2', region: 'Enterprise' },
        { id: 'FIPS-140-3', name: 'FIPS 140-3', region: 'Government/Military' },
        { id: 'ISO-27001', name: 'ISO 27001', region: 'International' }
      ]
    },
    message: "Configuration loaded | تم تحميل الإعدادات"
  });
});

export default router;

console.log("[ComplexityEstimation] Engine initialized | تم تهيئة محرك تقدير التعقيد");
