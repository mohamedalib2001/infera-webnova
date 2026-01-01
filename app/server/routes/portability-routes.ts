/**
 * Portability & Independence Routes | مسارات قابلية النقل والاستقلال
 */

import { Router, Request, Response } from "express";
import { portabilityEngine, ExportFormat, CloudProvider, NetworkMode } from "../lib/portability-engine";

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

// ============ Export Package API | واجهة حزم التصدير ============

// Get statistics
router.get("/stats", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'default';
    const stats = await portabilityEngine.getStats(tenantId);

    res.json({
      success: true,
      message: "Statistics retrieved | تم استرجاع الإحصائيات",
      data: stats
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get export formats
router.get("/formats", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const formats = portabilityEngine.getExportFormats();
    res.json({
      success: true,
      message: "Formats retrieved | تم استرجاع التنسيقات",
      data: formats
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all exports
router.get("/exports", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'default';
    const exports = await portabilityEngine.getExports(tenantId);

    res.json({
      success: true,
      message: "Exports retrieved | تم استرجاع التصديرات",
      data: exports
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single export
router.get("/exports/:id", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const exportPkg = await portabilityEngine.getExport(req.params.id);
    
    if (!exportPkg) {
      return res.status(404).json({
        success: false,
        message: "Export not found | التصدير غير موجود"
      });
    }

    res.json({ success: true, data: exportPkg });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create export package (Owner only)
router.post("/exports", requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'default';
    const { platformId, platformName, version, format, targetProvider, networkMode, configuration } = req.body;

    if (!platformId || !format || !targetProvider) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields | الحقول المطلوبة ناقصة"
      });
    }

    const exportPkg = await portabilityEngine.createExportPackage(tenantId, {
      platformId,
      platformName: platformName || 'Platform Export',
      version: version || '1.0.0',
      format: format as ExportFormat,
      targetProvider: targetProvider as CloudProvider,
      networkMode: networkMode as NetworkMode || 'online',
      configuration: configuration || {
        includeData: true,
        includeSecrets: false,
        includeConfigs: true,
        includeLogs: false,
        includeBackups: false,
        compression: 'gzip',
        encryption: 'aes-256-gcm'
      }
    });

    res.status(201).json({
      success: true,
      message: "Export package created | تم إنشاء حزمة التصدير",
      data: exportPkg
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Download export (simulated)
router.get("/exports/:id/download", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const exportPkg = await portabilityEngine.getExport(req.params.id);
    
    if (!exportPkg || exportPkg.status !== 'completed') {
      return res.status(404).json({
        success: false,
        message: "Export not available | التصدير غير متاح"
      });
    }

    // In production, this would stream the actual file
    res.json({
      success: true,
      message: "Download initiated | بدأ التنزيل",
      data: {
        filename: `${exportPkg.platformName}-${exportPkg.version}-${exportPkg.format}.tar.gz`,
        size: exportPkg.size,
        checksum: exportPkg.checksum,
        expiresAt: exportPkg.expiresAt
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ Provider API | واجهة المزودين ============

// Get all providers
router.get("/providers", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const providers = portabilityEngine.getProviders();
    res.json({
      success: true,
      message: "Providers retrieved | تم استرجاع المزودين",
      data: providers
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single provider
router.get("/providers/:type", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const provider = portabilityEngine.getProvider(req.params.type as CloudProvider);
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found | المزود غير موجود"
      });
    }

    res.json({ success: true, data: provider });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Compare providers
router.post("/providers/compare", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const { providers } = req.body;
    
    if (!providers || !Array.isArray(providers) || providers.length < 2) {
      return res.status(400).json({
        success: false,
        message: "At least 2 providers required | مطلوب مزودين على الأقل"
      });
    }

    const comparison = await portabilityEngine.comparProviders(providers as CloudProvider[]);

    res.json({
      success: true,
      message: "Comparison completed | تمت المقارنة",
      data: comparison
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ Air-Gapped API | واجهة الوضع المعزول ============

// Get air-gapped configurations
router.get("/air-gapped", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'default';
    const configs = await portabilityEngine.getAirGappedConfigs(tenantId);

    res.json({
      success: true,
      message: "Configurations retrieved | تم استرجاع الإعدادات",
      data: configs
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single air-gapped config
router.get("/air-gapped/:id", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const config = await portabilityEngine.getAirGappedConfig(req.params.id);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: "Configuration not found | الإعداد غير موجود"
      });
    }

    res.json({ success: true, data: config });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create air-gapped configuration (Owner only)
router.post("/air-gapped", requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'default';
    const { platformId, mode, securityLevel, dataRetention, syncSchedule } = req.body;

    if (!platformId || !mode || !securityLevel) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields | الحقول المطلوبة ناقصة"
      });
    }

    const config = await portabilityEngine.createAirGappedConfig(tenantId, {
      platformId,
      mode,
      securityLevel,
      dataRetention: dataRetention || 365,
      syncSchedule
    });

    res.status(201).json({
      success: true,
      message: "Air-gapped configuration created | تم إنشاء إعداد الوضع المعزول",
      data: config
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Enable air-gapped mode (Owner only)
router.post("/air-gapped/:id/enable", requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const config = await portabilityEngine.enableAirGappedMode(req.params.id);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: "Configuration not found | الإعداد غير موجود"
      });
    }

    res.json({
      success: true,
      message: "Air-gapped mode enabled | تم تفعيل الوضع المعزول",
      data: config
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Disable air-gapped mode (Owner only)
router.post("/air-gapped/:id/disable", requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const config = await portabilityEngine.disableAirGappedMode(req.params.id);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: "Configuration not found | الإعداد غير موجود"
      });
    }

    res.json({
      success: true,
      message: "Air-gapped mode disabled | تم تعطيل الوضع المعزول",
      data: config
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Sync air-gapped data (Owner only)
router.post("/air-gapped/:id/sync", requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const result = await portabilityEngine.syncAirGappedData(req.params.id);

    res.json({
      success: true,
      message: "Sync completed | تمت المزامنة",
      data: result
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ Migration API | واجهة الترحيل ============

// Get migration plans
router.get("/migrations", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'default';
    const plans = await portabilityEngine.getMigrationPlans(tenantId);

    res.json({
      success: true,
      message: "Migration plans retrieved | تم استرجاع خطط الترحيل",
      data: plans
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single migration plan
router.get("/migrations/:id", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const plan = await portabilityEngine.getMigrationPlan(req.params.id);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Migration plan not found | خطة الترحيل غير موجودة"
      });
    }

    res.json({ success: true, data: plan });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create migration plan (Owner only)
router.post("/migrations", requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'default';
    const { platformId, sourceProvider, targetProvider } = req.body;

    if (!platformId || !sourceProvider || !targetProvider) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields | الحقول المطلوبة ناقصة"
      });
    }

    const plan = await portabilityEngine.createMigrationPlan(tenantId, {
      platformId,
      sourceProvider: sourceProvider as CloudProvider,
      targetProvider: targetProvider as CloudProvider
    });

    res.status(201).json({
      success: true,
      message: "Migration plan created | تم إنشاء خطة الترحيل",
      data: plan
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Approve migration plan (Owner only)
router.post("/migrations/:id/approve", requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const plan = await portabilityEngine.approveMigrationPlan(req.params.id);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Migration plan not found | خطة الترحيل غير موجودة"
      });
    }

    res.json({
      success: true,
      message: "Migration plan approved | تمت الموافقة على خطة الترحيل",
      data: plan
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

console.log("[Portability] Routes initialized | تم تهيئة مسارات قابلية النقل والاستقلال");

export default router;
