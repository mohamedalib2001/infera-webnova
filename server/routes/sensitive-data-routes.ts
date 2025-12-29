/**
 * Sensitive Data Management API Routes | مسارات إدارة البيانات الحساسة
 */

import { Router, Request, Response } from 'express';
import { sensitiveDataEngine } from '../lib/sensitive-data-engine';

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

router.post("/classify", requireAuth, rateLimit, (req: Request, res: Response) => {
  try {
    const { data, tenantId, dataType } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        error: "Data required | البيانات مطلوبة"
      });
    }

    const result = sensitiveDataEngine.classifyData(data, { tenantId, dataType });

    res.json({
      success: true,
      data: result,
      message: `Classified as ${result.classification} | تم التصنيف كـ ${result.classification}`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/rules", requireAuth, rateLimit, (req: Request, res: Response) => {
  try {
    const rules = sensitiveDataEngine.getClassificationRules();

    res.json({
      success: true,
      data: rules,
      count: rules.length,
      message: `Found ${rules.length} classification rules | تم العثور على ${rules.length} قواعد تصنيف`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/rules", requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { name, nameAr, description, descriptionAr, patterns, keywords, category, classification, enabled } = req.body;

    if (!name || !category || !classification) {
      return res.status(400).json({
        success: false,
        error: "Name, category, and classification required | الاسم والفئة والتصنيف مطلوبة"
      });
    }

    const rule = sensitiveDataEngine.createClassificationRule({
      name,
      nameAr: nameAr || name,
      description: description || '',
      descriptionAr: descriptionAr || description || '',
      patterns: patterns || [],
      keywords: keywords || [],
      category,
      classification,
      enabled: enabled !== false,
      createdBy: user.email
    }, user.email);

    res.json({
      success: true,
      data: rule,
      message: `Created rule: ${name} | تم إنشاء القاعدة: ${nameAr || name}`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/policies", requireAuth, rateLimit, (req: Request, res: Response) => {
  try {
    const policies = sensitiveDataEngine.getPolicies();

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
    const policy = sensitiveDataEngine.updatePolicy(req.params.id, req.body);

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

router.get("/tenants", requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  try {
    const tenants = sensitiveDataEngine.getTenantIsolations();

    res.json({
      success: true,
      data: tenants,
      count: tenants.length,
      message: `Found ${tenants.length} tenant isolations | تم العثور على ${tenants.length} عزل منصات`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/tenants", requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  try {
    const { tenantId, tenantName, tenantNameAr } = req.body;

    if (!tenantId || !tenantName) {
      return res.status(400).json({
        success: false,
        error: "Tenant ID and name required | معرف واسم المنصة مطلوبان"
      });
    }

    const tenant = sensitiveDataEngine.createTenantIsolation(tenantId, tenantName, tenantNameAr || tenantName);

    res.json({
      success: true,
      data: { ...tenant, encryptionKey: '***CREATED***' },
      message: `Created tenant isolation: ${tenantName} | تم إنشاء عزل المنصة: ${tenantNameAr || tenantName}`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/store", requireAuth, rateLimit, (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { tenantId, dataType, data } = req.body;

    if (!tenantId || !dataType || !data) {
      return res.status(400).json({
        success: false,
        error: "Tenant ID, data type, and data required | معرف المنصة ونوع البيانات والبيانات مطلوبة"
      });
    }

    const record = sensitiveDataEngine.storeData(
      tenantId,
      dataType,
      data,
      user.id || 'unknown',
      user.email
    );

    res.json({
      success: true,
      data: { ...record, encryptedData: record.encryptedData ? '***ENCRYPTED***' : undefined },
      message: `Stored data record | تم تخزين سجل البيانات`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/records", requireAuth, rateLimit, (req: Request, res: Response) => {
  try {
    const tenantId = req.query.tenantId as string | undefined;
    const records = sensitiveDataEngine.getDataRecords(tenantId);

    const sanitized = records.map(r => ({
      ...r,
      encryptedData: r.encryptedData ? '***ENCRYPTED***' : undefined
    }));

    res.json({
      success: true,
      data: sanitized,
      count: records.length,
      message: `Found ${records.length} records | تم العثور على ${records.length} سجلات`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/retrieve/:id", requireAuth, rateLimit, (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { tenantId } = req.body;
    const userRoles = user.roles || ['user'];

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        error: "Tenant ID required | معرف المنصة مطلوب"
      });
    }

    const result = sensitiveDataEngine.retrieveData(
      req.params.id,
      tenantId,
      user.id || 'unknown',
      user.email,
      userRoles
    );

    if (!result.success) {
      return res.status(403).json({
        success: false,
        error: result.error,
        errorAr: result.errorAr
      });
    }

    res.json({
      success: true,
      data: result.data,
      message: `Retrieved data | تم استرجاع البيانات`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete("/records/:id", requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const deleted = sensitiveDataEngine.deleteDataRecord(
      req.params.id,
      user.id || 'unknown',
      user.email
    );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Record not found | السجل غير موجود"
      });
    }

    res.json({
      success: true,
      message: `Deleted record | تم حذف السجل`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/logs", requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  try {
    const recordId = req.query.recordId as string | undefined;
    const logs = sensitiveDataEngine.getAccessLogs(recordId);

    res.json({
      success: true,
      data: logs.slice(0, 100),
      count: logs.length,
      message: `Found ${logs.length} access logs | تم العثور على ${logs.length} سجلات وصول`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/stats", requireAuth, rateLimit, (req: Request, res: Response) => {
  try {
    const stats = sensitiveDataEngine.getStats();

    res.json({
      success: true,
      data: stats,
      message: `Data statistics | إحصائيات البيانات`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

console.log('[SensitiveData] Routes initialized | تم تهيئة مسارات البيانات الحساسة');
