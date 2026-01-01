/**
 * Smart Versioning API Routes | مسارات نظام الإصدارات الذكية
 */

import { Router, Request, Response } from 'express';
import { smartVersioningEngine, VersionType } from '../lib/smart-versioning-engine';

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

router.post("/versions", requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { tenantId, type, title, titleAr, snapshot, changes, metadata, tags, parentVersionId } = req.body;

    if (!type || !title || !snapshot) {
      return res.status(400).json({
        success: false,
        error: "Type, title, and snapshot required | النوع والعنوان واللقطة مطلوبة"
      });
    }

    const version = await smartVersioningEngine.createVersion(
      tenantId || 'default',
      type as VersionType,
      title,
      titleAr || title,
      snapshot,
      changes || [],
      user.email,
      user.email,
      metadata || {},
      tags || [],
      parentVersionId
    );

    res.json({
      success: true,
      data: version,
      message: `Created version ${version.versionNumber} | تم إنشاء الإصدار ${version.versionNumber}`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/versions", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const tenantId = (req.query.tenantId as string) || 'default';
    const type = req.query.type as VersionType | undefined;
    const limit = parseInt(req.query.limit as string) || 50;

    const versions = await smartVersioningEngine.getVersions(tenantId, type, limit);

    res.json({
      success: true,
      data: versions,
      count: versions.length,
      message: `Found ${versions.length} versions | تم العثور على ${versions.length} إصدارات`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/versions/:id", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const version = await smartVersioningEngine.getVersion(req.params.id);

    if (!version) {
      return res.status(404).json({
        success: false,
        error: "Version not found | الإصدار غير موجود"
      });
    }

    res.json({
      success: true,
      data: version
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/compare", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { tenantId, sourceVersionId, targetVersionId } = req.body;

    if (!sourceVersionId || !targetVersionId) {
      return res.status(400).json({
        success: false,
        error: "Source and target version IDs required | معرفات الإصدارات المصدر والهدف مطلوبة"
      });
    }

    const comparison = await smartVersioningEngine.compareVersions(
      tenantId || 'default',
      sourceVersionId,
      targetVersionId,
      user.email
    );

    res.json({
      success: true,
      data: comparison,
      message: `Comparison completed | تمت المقارنة`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/comparisons", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const tenantId = (req.query.tenantId as string) || 'default';
    const limit = parseInt(req.query.limit as string) || 50;

    const comparisons = await smartVersioningEngine.getComparisons(tenantId, limit);

    res.json({
      success: true,
      data: comparisons,
      count: comparisons.length,
      message: `Found ${comparisons.length} comparisons | تم العثور على ${comparisons.length} مقارنات`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/rollback", requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { tenantId, fromVersionId, toVersionId, reason, reasonAr, rollbackType, affectedComponents } = req.body;

    if (!fromVersionId || !toVersionId) {
      return res.status(400).json({
        success: false,
        error: "From and to version IDs required | معرفات الإصدارات المصدر والهدف مطلوبة"
      });
    }

    const rollback = await smartVersioningEngine.rollback(
      tenantId || 'default',
      fromVersionId,
      toVersionId,
      reason || 'Manual rollback',
      reasonAr || 'تراجع يدوي',
      user.email,
      user.email,
      rollbackType || 'full',
      affectedComponents || []
    );

    res.json({
      success: true,
      data: rollback,
      message: `Rollback completed | تم التراجع بنجاح`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/rollbacks", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const tenantId = (req.query.tenantId as string) || 'default';
    const limit = parseInt(req.query.limit as string) || 50;

    const rollbacks = await smartVersioningEngine.getRollbackHistory(tenantId, limit);

    res.json({
      success: true,
      data: rollbacks,
      count: rollbacks.length,
      message: `Found ${rollbacks.length} rollbacks | تم العثور على ${rollbacks.length} عمليات تراجع`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/decisions", requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { tenantId, decisionId, decisionType, title, titleAr, input, output, reasoning, reasoningAr, confidence } = req.body;

    if (!decisionId || !decisionType || !title) {
      return res.status(400).json({
        success: false,
        error: "Decision ID, type, and title required | معرف القرار والنوع والعنوان مطلوبة"
      });
    }

    const decision = await smartVersioningEngine.createDecisionVersion(
      tenantId || 'default',
      decisionId,
      decisionType,
      title,
      titleAr || title,
      input || {},
      output || {},
      reasoning || '',
      reasoningAr || '',
      confidence || 0,
      user.email
    );

    res.json({
      success: true,
      data: decision,
      message: `Created decision version ${decision.versionNumber} | تم إنشاء إصدار القرار ${decision.versionNumber}`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/decisions", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const tenantId = (req.query.tenantId as string) || 'default';
    const decisionId = req.query.decisionId as string | undefined;
    const limit = parseInt(req.query.limit as string) || 50;

    const decisions = await smartVersioningEngine.getDecisionVersions(tenantId, decisionId, limit);

    res.json({
      success: true,
      data: decisions,
      count: decisions.length,
      message: `Found ${decisions.length} decision versions | تم العثور على ${decisions.length} إصدارات قرارات`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/decisions/:id/approve", requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const decision = await smartVersioningEngine.approveDecision(req.params.id, user.email);

    if (!decision) {
      return res.status(404).json({
        success: false,
        error: "Decision not found | القرار غير موجود"
      });
    }

    res.json({
      success: true,
      data: decision,
      message: `Decision approved | تمت الموافقة على القرار`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/decisions/:id/reject", requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const decision = await smartVersioningEngine.rejectDecision(req.params.id, user.email);

    if (!decision) {
      return res.status(404).json({
        success: false,
        error: "Decision not found | القرار غير موجود"
      });
    }

    res.json({
      success: true,
      data: decision,
      message: `Decision rejected | تم رفض القرار`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/stats", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const tenantId = (req.query.tenantId as string) || 'default';
    const stats = await smartVersioningEngine.getStats(tenantId);

    res.json({
      success: true,
      data: stats,
      message: `Versioning statistics | إحصائيات الإصدارات`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

console.log('[SmartVersioning] Routes initialized | تم تهيئة مسارات الإصدارات الذكية');
