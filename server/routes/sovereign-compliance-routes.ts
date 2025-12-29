/**
 * Sovereign Legal Compliance API Routes | مسارات التوافق القانوني السيادي
 */

import { Router, Request, Response } from 'express';
import { sovereignComplianceEngine, SectorMode } from '../lib/sovereign-compliance-engine';

const router = Router();
const OWNER_EMAIL = "mohamed.ali.b2001@gmail.com";

const requireAuth = (req: Request, res: Response, next: Function) => {
  const user = req.user as any;
  if (!user) {
    return res.status(401).json({
      success: false,
      error: "Authentication required | المصادقة مطلوبة"
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

router.post("/check", requireAuth, rateLimit, (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { tenantId, operation, sourceCountry, targetCountry, dataTypes, sectorMode } = req.body;

    if (!tenantId || !operation || !sourceCountry || !dataTypes || !sectorMode) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields | الحقول المطلوبة مفقودة"
      });
    }

    const result = sovereignComplianceEngine.checkCompliance(
      tenantId,
      operation,
      sourceCountry,
      targetCountry,
      dataTypes,
      sectorMode as SectorMode,
      user.email
    );

    res.json({
      success: true,
      data: result,
      message: result.result === 'allowed' 
        ? 'Compliance check passed | تم اجتياز فحص الامتثال'
        : result.result === 'denied'
        ? 'Compliance check failed | فشل فحص الامتثال'
        : 'Compliance check requires conditions | فحص الامتثال يتطلب شروط'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/policies", requireAuth, rateLimit, (req: Request, res: Response) => {
  try {
    const policies = sovereignComplianceEngine.getResidencyPolicies();

    res.json({
      success: true,
      data: policies,
      count: policies.length,
      message: `Found ${policies.length} residency policies | تم العثور على ${policies.length} سياسات إقامة البيانات`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/policies", requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  try {
    const { name, nameAr, description, descriptionAr, region, allowedCountries, blockedCountries, dataTypes, encryptionRequired, localStorageOnly, crossBorderTransferAllowed, crossBorderConditions, frameworks, enabled } = req.body;

    if (!name || !region) {
      return res.status(400).json({
        success: false,
        error: "Name and region required | الاسم والمنطقة مطلوبان"
      });
    }

    const policy = sovereignComplianceEngine.createResidencyPolicy({
      name,
      nameAr: nameAr || name,
      description: description || '',
      descriptionAr: descriptionAr || description || '',
      region,
      allowedCountries: allowedCountries || [],
      blockedCountries: blockedCountries || [],
      dataTypes: dataTypes || [],
      encryptionRequired: encryptionRequired !== false,
      localStorageOnly: localStorageOnly || false,
      crossBorderTransferAllowed: crossBorderTransferAllowed !== false,
      crossBorderConditions: crossBorderConditions || [],
      frameworks: frameworks || [],
      enabled: enabled !== false
    });

    res.json({
      success: true,
      data: policy,
      message: `Created policy: ${name} | تم إنشاء السياسة: ${nameAr || name}`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.patch("/policies/:id", requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  try {
    const policy = sovereignComplianceEngine.updateResidencyPolicy(req.params.id, req.body);

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

router.get("/geo-restrictions", requireAuth, rateLimit, (req: Request, res: Response) => {
  try {
    const restrictions = sovereignComplianceEngine.getGeoRestrictions();

    res.json({
      success: true,
      data: restrictions,
      count: restrictions.length,
      message: `Found ${restrictions.length} geo restrictions | تم العثور على ${restrictions.length} قيود جغرافية`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/geo-restrictions", requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  try {
    const { name, nameAr, countryCode, countryName, countryNameAr, restrictionLevel, allowedOperations, blockedOperations, requiresApproval, sectorModes, specialConditions, specialConditionsAr, enabled } = req.body;

    if (!countryCode || !countryName) {
      return res.status(400).json({
        success: false,
        error: "Country code and name required | رمز واسم الدولة مطلوبان"
      });
    }

    const restriction = sovereignComplianceEngine.createGeoRestriction({
      name: name || countryName,
      nameAr: nameAr || countryNameAr || countryName,
      countryCode,
      countryName,
      countryNameAr: countryNameAr || countryName,
      restrictionLevel: restrictionLevel || 'none',
      allowedOperations: allowedOperations || ['all'],
      blockedOperations: blockedOperations || [],
      requiresApproval: requiresApproval || [],
      sectorModes: sectorModes || ['civilian'],
      specialConditions: specialConditions || [],
      specialConditionsAr: specialConditionsAr || [],
      enabled: enabled !== false
    });

    res.json({
      success: true,
      data: restriction,
      message: `Created geo restriction: ${countryName} | تم إنشاء القيد الجغرافي: ${countryNameAr || countryName}`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/sector-modes", requireAuth, rateLimit, (req: Request, res: Response) => {
  try {
    const modes = sovereignComplianceEngine.getSectorModes();

    res.json({
      success: true,
      data: modes,
      count: modes.length,
      message: `Found ${modes.length} sector modes | تم العثور على ${modes.length} أوضاع قطاعية`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.patch("/sector-modes/:id", requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  try {
    const mode = sovereignComplianceEngine.updateSectorMode(req.params.id, req.body);

    if (!mode) {
      return res.status(404).json({
        success: false,
        error: "Sector mode not found | الوضع القطاعي غير موجود"
      });
    }

    res.json({
      success: true,
      data: mode,
      message: `Updated sector mode | تم تحديث الوضع القطاعي`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/checks", requireAuth, rateLimit, (req: Request, res: Response) => {
  try {
    const tenantId = req.query.tenantId as string | undefined;
    const checks = sovereignComplianceEngine.getComplianceChecks(tenantId);

    res.json({
      success: true,
      data: checks.slice(0, 100),
      count: checks.length,
      message: `Found ${checks.length} compliance checks | تم العثور على ${checks.length} فحوصات امتثال`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/audit-logs", requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  try {
    const tenantId = req.query.tenantId as string | undefined;
    const logs = sovereignComplianceEngine.getAuditLogs(tenantId);

    res.json({
      success: true,
      data: logs.slice(0, 100),
      count: logs.length,
      message: `Found ${logs.length} audit logs | تم العثور على ${logs.length} سجلات تدقيق`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/stats", requireAuth, rateLimit, (req: Request, res: Response) => {
  try {
    const stats = sovereignComplianceEngine.getStats();

    res.json({
      success: true,
      data: stats,
      message: `Compliance statistics | إحصائيات الامتثال`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

console.log('[SovereignCompliance] Routes initialized | تم تهيئة مسارات التوافق السيادي');
