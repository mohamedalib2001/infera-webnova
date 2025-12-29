/**
 * Auto-Deployment Gateway Routes
 * مسارات بوابة النشر التلقائي
 * 
 * Owner-only endpoints for deployment management
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { autoDeploymentGateway } from '../lib/auto-deployment-gateway';

const router = Router();

const ROOT_OWNER_EMAIL = 'mohamed.ali.b2001@gmail.com';

// Rate limiting state
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 25;
const RATE_WINDOW = 60 * 1000;

// ==================== MIDDLEWARE ====================

function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated?.() || !req.user) {
    return res.status(401).json({
      error: 'Authentication required | المصادقة مطلوبة',
      code: 'AUTH_REQUIRED'
    });
  }
  next();
}

function requireOwner(req: Request, res: Response, next: Function) {
  const user = req.user as any;
  if (user?.email !== ROOT_OWNER_EMAIL) {
    return res.status(403).json({
      error: 'Owner access only | وصول المالك فقط',
      code: 'OWNER_ONLY'
    });
  }
  next();
}

function rateLimit(req: Request, res: Response, next: Function) {
  const user = req.user as any;
  const key = user?.email || req.ip;
  const now = Date.now();

  let entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + RATE_WINDOW };
  }

  entry.count++;
  rateLimitMap.set(key, entry);

  if (entry.count > RATE_LIMIT) {
    return res.status(429).json({
      error: 'Rate limit exceeded | تم تجاوز حد الطلبات',
      code: 'RATE_LIMITED',
      retryAfter: Math.ceil((entry.resetAt - now) / 1000)
    });
  }

  next();
}

// ==================== ENVIRONMENT ROUTES ====================

// Create environment
router.post('/environments', requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      name: z.string().min(1),
      nameAr: z.string().min(1),
      type: z.enum(['development', 'staging', 'production']),
      configTemplate: z.string().default('config_standard'),
      domain: z.string().optional(),
      sslEnabled: z.boolean().optional()
    });

    const data = schema.parse(req.body);
    const environment = await autoDeploymentGateway.createEnvironment(data);

    res.json({
      success: true,
      environment,
      message: 'Environment created successfully',
      messageAr: 'تم إنشاء البيئة بنجاح'
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// List environments
router.get('/environments', requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  const environments = autoDeploymentGateway.listEnvironments();
  res.json({ environments });
});

// Get environment
router.get('/environments/:id', requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  const environment = autoDeploymentGateway.getEnvironment(req.params.id);
  if (!environment) {
    return res.status(404).json({ error: 'Environment not found | البيئة غير موجودة' });
  }
  res.json({ environment });
});

// Update environment config
router.patch('/environments/:id/config', requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const environment = await autoDeploymentGateway.updateEnvironmentConfig(
      req.params.id,
      req.body
    );

    if (!environment) {
      return res.status(404).json({ error: 'Environment not found | البيئة غير موجودة' });
    }

    res.json({
      success: true,
      environment,
      message: 'Configuration updated',
      messageAr: 'تم تحديث التكوين'
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== DEPLOYMENT ROUTES ====================

// Deploy to environment
router.post('/deploy', requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      environmentId: z.string(),
      projectId: z.string(),
      version: z.string(),
      gitCommit: z.string().optional(),
      config: z.record(z.string()).optional()
    });

    const data = schema.parse(req.body);
    const user = req.user as any;

    const deployment = await autoDeploymentGateway.deployToEnvironment({
      ...data,
      deployedBy: user.email
    });

    res.json({
      success: true,
      deployment,
      message: 'Deployment started',
      messageAr: 'بدأ النشر'
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get deployment
router.get('/deployments/:id', requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  const deployment = autoDeploymentGateway.getDeployment(req.params.id);
  if (!deployment) {
    return res.status(404).json({ error: 'Deployment not found | النشر غير موجود' });
  }
  res.json({ deployment });
});

// List deployments
router.get('/deployments', requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  const { environmentId } = req.query;
  const deployments = autoDeploymentGateway.listDeployments(environmentId as string);
  res.json({ deployments });
});

// Rollback deployment
router.post('/deployments/:environmentId/rollback', requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const { targetVersion } = req.body;
    const user = req.user as any;

    const deployment = await autoDeploymentGateway.rollbackDeployment(
      req.params.environmentId,
      targetVersion,
      user.email
    );

    if (!deployment) {
      return res.status(404).json({ error: 'Environment not found or no deployment to rollback' });
    }

    res.json({
      success: true,
      deployment,
      message: 'Rollback initiated',
      messageAr: 'بدأ التراجع'
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== SERVER CONFIG ROUTES ====================

// List server configs
router.get('/configs', requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  const configs = autoDeploymentGateway.getServerConfigs();
  res.json({ configs });
});

// Get server config
router.get('/configs/:id', requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  const config = autoDeploymentGateway.getServerConfig(req.params.id);
  if (!config) {
    return res.status(404).json({ error: 'Config not found | التكوين غير موجود' });
  }
  res.json({ config });
});

// Create custom config
router.post('/configs', requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const config = await autoDeploymentGateway.createCustomConfig(req.body);
    res.json({
      success: true,
      config,
      message: 'Custom config created',
      messageAr: 'تم إنشاء التكوين المخصص'
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Generate optimal config with AI
router.post('/configs/generate', requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      expectedTraffic: z.enum(['low', 'medium', 'high', 'very_high']),
      sector: z.string(),
      compliance: z.array(z.string()),
      budget: z.enum(['low', 'medium', 'high'])
    });

    const requirements = schema.parse(req.body);
    const result = await autoDeploymentGateway.generateOptimalConfig(requirements);

    res.json({
      success: true,
      ...result,
      message: 'Config generated by AI',
      messageAr: 'تم إنشاء التكوين بالذكاء الاصطناعي'
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== HEALTH & MONITORING ROUTES ====================

// Run health check
router.post('/environments/:id/health-check', requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const result = await autoDeploymentGateway.runHealthCheck(req.params.id);
    res.json({
      success: true,
      result,
      message: 'Health check completed',
      messageAr: 'اكتمل فحص الصحة'
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get health history
router.get('/environments/:id/health-history', requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 24;
  const history = autoDeploymentGateway.getHealthHistory(req.params.id, limit);
  res.json({ history });
});

// ==================== MAINTENANCE ROUTES ====================

// Schedule maintenance
router.post('/maintenance', requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      environmentId: z.string(),
      type: z.enum(['backup', 'update', 'cleanup', 'optimization', 'security_scan', 'restart']),
      scheduledAt: z.string().transform(s => new Date(s))
    });

    const data = schema.parse(req.body);
    const task = await autoDeploymentGateway.scheduleMaintenance(data);

    res.json({
      success: true,
      task,
      message: 'Maintenance scheduled',
      messageAr: 'تمت جدولة الصيانة'
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Execute maintenance task
router.post('/maintenance/:id/execute', requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const task = await autoDeploymentGateway.executeMaintenanceTask(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found | المهمة غير موجودة' });
    }

    res.json({
      success: true,
      task,
      message: 'Maintenance executed',
      messageAr: 'تم تنفيذ الصيانة'
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// List maintenance tasks
router.get('/maintenance', requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  const { environmentId } = req.query;
  const tasks = autoDeploymentGateway.listMaintenanceTasks(environmentId as string);
  res.json({ tasks });
});

// ==================== ALERTS ROUTES ====================

// List alerts
router.get('/alerts', requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  const { environmentId, unacknowledgedOnly } = req.query;
  const alerts = autoDeploymentGateway.listAlerts(
    environmentId as string,
    unacknowledgedOnly === 'true'
  );
  res.json({ alerts });
});

// Acknowledge alert
router.post('/alerts/:id/acknowledge', requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  const success = autoDeploymentGateway.acknowledgeAlert(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Alert not found | التنبيه غير موجود' });
  }
  res.json({ success: true, message: 'Alert acknowledged', messageAr: 'تم الإقرار بالتنبيه' });
});

// Resolve alert
router.post('/alerts/:id/resolve', requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  const success = autoDeploymentGateway.resolveAlert(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Alert not found | التنبيه غير موجود' });
  }
  res.json({ success: true, message: 'Alert resolved', messageAr: 'تم حل التنبيه' });
});

// ==================== STATISTICS ====================

// Get deployment statistics
router.get('/stats', requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  const stats = autoDeploymentGateway.getDeploymentStats();
  res.json({ stats });
});

export default router;
