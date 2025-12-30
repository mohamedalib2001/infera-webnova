/**
 * Deployment Routes - مسارات النشر
 * 
 * API endpoints for external deployment, monitoring, and self-updates.
 * واجهة برمجة التطبيقات للنشر الخارجي والمراقبة والتحديثات الذاتية
 */

import { Router, Request, Response } from 'express';
import { externalDeploymentService } from '../services/external-deployment-service';
import { performanceMonitoringService } from '../services/performance-monitoring-service';
import { selfUpdateService } from '../services/self-update-service';

const router = Router();

// Middleware to check authentication
const requireAuth = (req: Request, res: Response, next: Function) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  next();
};

// ========================================
// Provider Routes
// ========================================

router.get('/providers', requireAuth, async (_req: Request, res: Response) => {
  try {
    const providers = externalDeploymentService.getProviders();
    res.json({ success: true, providers });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/cost-estimate/:provider/:serverType', requireAuth, async (req: Request, res: Response) => {
  try {
    const { provider, serverType } = req.params;
    const estimate = externalDeploymentService.estimateCost(provider, serverType);
    res.json({ success: true, estimate });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/recommendations', requireAuth, async (req: Request, res: Response) => {
  try {
    const { expectedTraffic, region, budget } = req.body;
    const recommendations = externalDeploymentService.getRecommendations({
      expectedTraffic,
      region,
      budget
    });
    res.json({ success: true, recommendations });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// Target Routes
// ========================================

router.get('/targets', requireAuth, async (_req: Request, res: Response) => {
  try {
    const targets = await externalDeploymentService.getTargets();
    res.json({ success: true, targets });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/targets/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const target = await externalDeploymentService.getTarget(req.params.id);
    if (!target) {
      return res.status(404).json({ success: false, error: 'Target not found' });
    }
    res.json({ success: true, target });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/targets', requireAuth, async (req: Request, res: Response) => {
  try {
    const { provider, name, region, serverType, image, sshKeys, userData } = req.body;
    
    if (!provider || !name || !region || !serverType) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: provider, name, region, serverType' 
      });
    }
    
    const target = await externalDeploymentService.createTarget({
      provider,
      name,
      region,
      serverType,
      image: image || 'ubuntu-22.04',
      sshKeys,
      userData
    });
    
    res.json({ success: true, target });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/targets/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const success = await externalDeploymentService.deleteTarget(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Target not found' });
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// Deployment Job Routes
// ========================================

router.post('/deploy', requireAuth, async (req: Request, res: Response) => {
  try {
    const { repositoryId, targetId } = req.body;
    
    if (!repositoryId || !targetId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: repositoryId, targetId' 
      });
    }
    
    const job = await externalDeploymentService.deployToTarget(repositoryId, targetId);
    res.json({ success: true, job });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/jobs/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const job = await externalDeploymentService.getJob(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    res.json({ success: true, job });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/jobs/repository/:repositoryId', requireAuth, async (req: Request, res: Response) => {
  try {
    const jobs = await externalDeploymentService.getJobsForRepository(req.params.repositoryId);
    res.json({ success: true, jobs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// Health Check Routes
// ========================================

router.get('/health/:targetId', requireAuth, async (req: Request, res: Response) => {
  try {
    const check = await externalDeploymentService.performHealthCheck(req.params.targetId);
    res.json({ success: true, health: check });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/health-history/:targetId', requireAuth, async (req: Request, res: Response) => {
  try {
    const check = await externalDeploymentService.getHealthCheck(req.params.targetId);
    res.json({ success: true, health: check });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// Monitoring Routes
// ========================================

router.get('/metrics/system/:targetId', requireAuth, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const metrics = await performanceMonitoringService.getSystemMetrics(req.params.targetId, limit);
    res.json({ success: true, metrics });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/metrics/application/:targetId', requireAuth, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const metrics = await performanceMonitoringService.getApplicationMetrics(req.params.targetId, limit);
    res.json({ success: true, metrics });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/metrics/current/:targetId', requireAuth, async (req: Request, res: Response) => {
  try {
    const metrics = await performanceMonitoringService.getCurrentMetrics(req.params.targetId);
    res.json({ success: true, metrics });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/status/:targetId', requireAuth, async (req: Request, res: Response) => {
  try {
    const status = await performanceMonitoringService.getHealthStatus(req.params.targetId);
    res.json({ success: true, status });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/metrics/start/:targetId', requireAuth, async (req: Request, res: Response) => {
  try {
    const interval = parseInt(req.body.interval) || 5000;
    performanceMonitoringService.startCollection(req.params.targetId, interval);
    res.json({ success: true, message: 'Metrics collection started' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/metrics/stop', requireAuth, async (_req: Request, res: Response) => {
  try {
    performanceMonitoringService.stopCollection();
    res.json({ success: true, message: 'Metrics collection stopped' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// Alert Routes
// ========================================

router.get('/alerts', requireAuth, async (req: Request, res: Response) => {
  try {
    const includeResolved = req.query.includeResolved === 'true';
    const alerts = await performanceMonitoringService.getAlerts(includeResolved);
    res.json({ success: true, alerts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/alerts/:alertId/acknowledge', requireAuth, async (req: Request, res: Response) => {
  try {
    const success = await performanceMonitoringService.acknowledgeAlert(req.params.alertId);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/alert-rules', requireAuth, async (_req: Request, res: Response) => {
  try {
    const rules = await performanceMonitoringService.getAlertRules();
    res.json({ success: true, rules });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.patch('/alert-rules/:ruleId', requireAuth, async (req: Request, res: Response) => {
  try {
    const rule = await performanceMonitoringService.updateAlertRule(req.params.ruleId, req.body);
    if (!rule) {
      return res.status(404).json({ success: false, error: 'Rule not found' });
    }
    res.json({ success: true, rule });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// Self-Update Routes
// ========================================

router.post('/updates/package', requireAuth, async (req: Request, res: Response) => {
  try {
    const { repositoryId, version, changelog } = req.body;
    
    if (!repositoryId || !version) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: repositoryId, version' 
      });
    }
    
    const pkg = await selfUpdateService.createUpdatePackage(
      repositoryId, 
      version, 
      changelog || ''
    );
    res.json({ success: true, package: pkg });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/updates/packages/:repositoryId', requireAuth, async (req: Request, res: Response) => {
  try {
    const packages = await selfUpdateService.getPackages(req.params.repositoryId);
    res.json({ success: true, packages });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/updates/package/:packageId', requireAuth, async (req: Request, res: Response) => {
  try {
    const pkg = await selfUpdateService.getPackage(req.params.packageId);
    if (!pkg) {
      return res.status(404).json({ success: false, error: 'Package not found' });
    }
    res.json({ success: true, package: pkg });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/updates/deploy', requireAuth, async (req: Request, res: Response) => {
  try {
    const { packageId, targetId } = req.body;
    
    if (!packageId || !targetId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: packageId, targetId' 
      });
    }
    
    const job = await selfUpdateService.deployUpdate(packageId, targetId);
    res.json({ success: true, job });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/updates/job/:jobId', requireAuth, async (req: Request, res: Response) => {
  try {
    const job = await selfUpdateService.getJob(req.params.jobId);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    res.json({ success: true, job });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/updates/jobs/:targetId', requireAuth, async (req: Request, res: Response) => {
  try {
    const jobs = await selfUpdateService.getJobsForTarget(req.params.targetId);
    res.json({ success: true, jobs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/updates/check/:repositoryId/:targetId', requireAuth, async (req: Request, res: Response) => {
  try {
    const check = await selfUpdateService.checkForUpdates(
      req.params.repositoryId, 
      req.params.targetId
    );
    res.json({ success: true, ...check });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// Rollback Routes
// ========================================

router.get('/updates/rollback-points/:targetId', requireAuth, async (req: Request, res: Response) => {
  try {
    const points = await selfUpdateService.getRollbackPoints(req.params.targetId);
    res.json({ success: true, points });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/updates/rollback', requireAuth, async (req: Request, res: Response) => {
  try {
    const { targetId, pointId } = req.body;
    
    if (!targetId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required field: targetId' 
      });
    }
    
    const job = await selfUpdateService.rollback(targetId, pointId);
    res.json({ success: true, job });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// Schedule Routes
// ========================================

router.get('/updates/schedule/:repositoryId/:targetId', requireAuth, async (req: Request, res: Response) => {
  try {
    const schedule = await selfUpdateService.getSchedule(
      req.params.repositoryId, 
      req.params.targetId
    );
    res.json({ success: true, schedule });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/updates/schedule', requireAuth, async (req: Request, res: Response) => {
  try {
    const { repositoryId, targetId, ...settings } = req.body;
    
    if (!repositoryId || !targetId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: repositoryId, targetId' 
      });
    }
    
    const schedule = await selfUpdateService.configureSchedule(repositoryId, targetId, settings);
    res.json({ success: true, schedule });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/updates/schedules', requireAuth, async (_req: Request, res: Response) => {
  try {
    const schedules = await selfUpdateService.getAllSchedules();
    res.json({ success: true, schedules });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
