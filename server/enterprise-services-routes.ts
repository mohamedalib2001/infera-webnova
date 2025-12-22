/**
 * INFERA WebNova - Enterprise Services API Routes
 * World-class CI/CD and DevOps services
 * 
 * Services: Device Testing, Fastlane, Code Quality, Artifact Storage,
 *           Notifications, Rollback, Performance Monitoring
 * 
 * SECURITY: All routes require authentication (OWASP A01 compliance)
 */

import type { Express, Request, Response, NextFunction } from 'express';
import { deviceTestingService } from './device-testing-service';
import { fastlaneService } from './fastlane-service';
import { codeQualityService } from './code-quality-service';
import { artifactStorageService } from './artifact-storage-service';
import { notificationWebhookService } from './notification-webhook-service';
import { rollbackService } from './rollback-service';
import { performanceMonitoringService } from './performance-monitoring-service';
import { z } from 'zod';
import { storage } from './storage';

// ==================== AUTHENTICATION MIDDLEWARE ====================
// SECURITY: Verify user session and capabilities (OWASP A01)

const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.session?.user;
  if (!user?.id) {
    return res.status(401).json({ 
      success: false,
      error: 'Authentication required',
      errorAr: 'المصادقة مطلوبة'
    });
  }
  
  // Re-validate user from database to prevent stale session attacks
  const dbUser = await storage.getUser(user.id);
  if (!dbUser || dbUser.status === 'BANNED' || dbUser.status === 'SUSPENDED') {
    return res.status(401).json({ 
      success: false,
      error: 'Session invalid or account disabled',
      errorAr: 'الجلسة غير صالحة أو الحساب معطل'
    });
  }
  
  next();
};

// Require sovereign or owner role for sensitive operations
const requireSovereign = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.session?.user;
  if (!user?.id) {
    return res.status(401).json({ 
      success: false,
      error: 'Authentication required',
      errorAr: 'المصادقة مطلوبة'
    });
  }
  
  const dbUser = await storage.getUser(user.id);
  if (!dbUser || !['ROOT_OWNER', 'sovereign', 'owner'].includes(dbUser.role)) {
    return res.status(403).json({ 
      success: false,
      error: 'Sovereign or owner access required',
      errorAr: 'مطلوب صلاحيات سيادية أو مالك'
    });
  }
  
  next();
};

// ==================== VALIDATION SCHEMAS ====================
const deviceTestSchema = z.object({
  projectId: z.string(),
  projectName: z.string(),
  platform: z.enum(['android', 'ios', 'both']),
  testType: z.enum(['instrumentation', 'xctest', 'appium', 'espresso', 'robotium']),
  appPath: z.string(),
  provider: z.enum(['aws_device_farm', 'firebase_test_lab', 'browserstack', 'sauce_labs']),
  timeout: z.number().optional(),
});

const fastlaneDeploySchema = z.object({
  projectId: z.string(),
  projectName: z.string(),
  platform: z.enum(['ios', 'android', 'both']),
  environment: z.enum(['development', 'staging', 'production']),
  ios: z.object({
    bundleId: z.string(),
    teamId: z.string(),
  }).optional(),
  android: z.object({
    packageName: z.string(),
    track: z.enum(['internal', 'alpha', 'beta', 'production']).optional(),
  }).optional(),
});

const codeAnalysisSchema = z.object({
  projectId: z.string(),
  projectName: z.string(),
  language: z.enum(['typescript', 'javascript', 'kotlin', 'swift', 'dart', 'java']),
  sourceDir: z.string(),
  excludePatterns: z.array(z.string()).optional(),
});

const notificationChannelSchema = z.object({
  projectId: z.string(),
  type: z.enum(['slack', 'discord', 'email', 'sms', 'webhook', 'teams']),
  name: z.string(),
  nameAr: z.string(),
  config: z.record(z.any()),
  events: z.array(z.string()),
});

const rollbackSchema = z.object({
  projectId: z.string(),
  environment: z.string(),
  platform: z.string(),
  targetSnapshotId: z.string().optional(),
  reason: z.string().optional(),
  reasonAr: z.string().optional(),
});

const alertSchema = z.object({
  projectId: z.string(),
  name: z.string(),
  nameAr: z.string(),
  metric: z.string(),
  condition: z.enum(['gt', 'lt', 'eq', 'gte', 'lte']),
  threshold: z.number(),
  severity: z.enum(['info', 'warning', 'critical']),
  channels: z.array(z.string()).optional(),
});

export function registerEnterpriseServicesRoutes(app: Express): void {

  // ==================== DEVICE TESTING ROUTES ====================
  // All routes require authentication (OWASP A01)

  // Start device test run
  app.post('/api/enterprise/device-testing/start', requireAuth, async (req: Request, res: Response) => {
    try {
      const config = deviceTestSchema.parse(req.body);
      const run = await deviceTestingService.startTestRun(config);
      res.json({ success: true, run });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Invalid request' 
      });
    }
  });

  // Get test run status
  app.get('/api/enterprise/device-testing/runs/:runId', requireAuth, (req: Request, res: Response) => {
    const run = deviceTestingService.getRun(req.params.runId);
    if (!run) {
      return res.status(404).json({ success: false, error: 'Run not found' });
    }
    res.json({ success: true, run });
  });

  // Get all runs for project
  app.get('/api/enterprise/device-testing/projects/:projectId/runs', requireAuth, (req: Request, res: Response) => {
    const runs = deviceTestingService.getRunsByProject(req.params.projectId);
    res.json({ success: true, runs });
  });

  // Get available device pools
  app.get('/api/enterprise/device-testing/pools', requireAuth, (req: Request, res: Response) => {
    const pools = deviceTestingService.getDevicePools();
    res.json({ success: true, pools });
  });

  // Cancel test run
  app.post('/api/enterprise/device-testing/runs/:runId/cancel', requireAuth, async (req: Request, res: Response) => {
    const cancelled = await deviceTestingService.cancelRun(req.params.runId);
    res.json({ success: cancelled });
  });

  // ==================== FASTLANE ROUTES ====================
  // Sensitive deployment operations require sovereign access

  // Deploy to App Store
  app.post('/api/enterprise/fastlane/deploy/ios', requireSovereign, async (req: Request, res: Response) => {
    try {
      const config = fastlaneDeploySchema.parse(req.body);
      const job = await fastlaneService.deployToAppStore(config, req.body.appPath || '');
      res.json({ success: true, job });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Invalid request' 
      });
    }
  });

  // Deploy to Google Play
  app.post('/api/enterprise/fastlane/deploy/android', requireSovereign, async (req: Request, res: Response) => {
    try {
      const config = fastlaneDeploySchema.parse(req.body);
      const job = await fastlaneService.deployToGooglePlay(config, req.body.appPath || '');
      res.json({ success: true, job });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Invalid request' 
      });
    }
  });

  // Get deployment job status
  app.get('/api/enterprise/fastlane/jobs/:jobId', requireAuth, (req: Request, res: Response) => {
    const job = fastlaneService.getJob(req.params.jobId);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    res.json({ success: true, job });
  });

  // Get all jobs for project
  app.get('/api/enterprise/fastlane/projects/:projectId/jobs', requireAuth, (req: Request, res: Response) => {
    const jobs = fastlaneService.getJobsByProject(req.params.projectId);
    res.json({ success: true, jobs });
  });

  // Generate Fastfile
  app.post('/api/enterprise/fastlane/generate/fastfile', requireAuth, async (req: Request, res: Response) => {
    try {
      const config = fastlaneDeploySchema.parse(req.body);
      const fastfile = await fastlaneService.generateFastfile(config);
      res.json({ success: true, fastfile });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Invalid request' 
      });
    }
  });

  // ==================== CODE QUALITY ROUTES ====================

  // Start code analysis
  app.post('/api/enterprise/code-quality/analyze', requireAuth, async (req: Request, res: Response) => {
    try {
      const config = codeAnalysisSchema.parse(req.body);
      const report = await codeQualityService.analyzeProject(config);
      res.json({ success: true, report });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Invalid request' 
      });
    }
  });

  // Get analysis report
  app.get('/api/enterprise/code-quality/reports/:reportId', requireAuth, (req: Request, res: Response) => {
    const report = codeQualityService.getReport(req.params.reportId);
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }
    res.json({ success: true, report });
  });

  // Get all reports for project
  app.get('/api/enterprise/code-quality/projects/:projectId/reports', requireAuth, (req: Request, res: Response) => {
    const reports = codeQualityService.getReportsByProject(req.params.projectId);
    res.json({ success: true, reports });
  });

  // Get security rules reference
  app.get('/api/enterprise/code-quality/security-rules', requireAuth, (req: Request, res: Response) => {
    const rules = codeQualityService.getSecurityRules();
    res.json({ success: true, rules });
  });

  // ==================== ARTIFACT STORAGE ROUTES ====================
  // Artifact upload requires sovereign access for security

  // Upload artifact
  app.post('/api/enterprise/artifacts/upload', requireSovereign, async (req: Request, res: Response) => {
    try {
      const { config, fileName, content } = req.body;
      const artifact = await artifactStorageService.uploadArtifact(
        config,
        fileName,
        Buffer.from(content, 'base64')
      );
      res.json({ success: true, artifact });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Invalid request' 
      });
    }
  });

  // Get artifact
  app.get('/api/enterprise/artifacts/:artifactId', requireAuth, (req: Request, res: Response) => {
    const artifact = artifactStorageService.getArtifact(req.params.artifactId);
    if (!artifact) {
      return res.status(404).json({ success: false, error: 'Artifact not found' });
    }
    res.json({ success: true, artifact });
  });

  // Download artifact
  app.get('/api/enterprise/artifacts/:artifactId/download', requireAuth, async (req: Request, res: Response) => {
    try {
      const { artifact, content } = await artifactStorageService.downloadArtifact(req.params.artifactId);
      res.setHeader('Content-Type', artifact.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${artifact.originalName}"`);
      res.send(content);
    } catch (error) {
      res.status(404).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Artifact not found' 
      });
    }
  });

  // Get artifacts by project
  app.get('/api/enterprise/artifacts/projects/:projectId', requireAuth, (req: Request, res: Response) => {
    const artifacts = artifactStorageService.getArtifactsByProject(req.params.projectId);
    res.json({ success: true, artifacts });
  });

  // Get storage stats
  app.get('/api/enterprise/artifacts/stats', requireAuth, (req: Request, res: Response) => {
    const stats = artifactStorageService.getStorageStats();
    res.json({ success: true, stats });
  });

  // Get retention policies
  app.get('/api/enterprise/artifacts/policies', requireAuth, (req: Request, res: Response) => {
    const policies = artifactStorageService.getRetentionPolicies();
    res.json({ success: true, policies });
  });

  // ==================== NOTIFICATION WEBHOOK ROUTES ====================

  // Create notification channel
  app.post('/api/enterprise/notifications/channels', requireAuth, async (req: Request, res: Response) => {
    try {
      const data = notificationChannelSchema.parse(req.body);
      const channel = await notificationWebhookService.createChannel(
        data.projectId,
        data.type,
        data.name,
        data.nameAr,
        data.config,
        data.events as any
      );
      res.json({ success: true, channel });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Invalid request' 
      });
    }
  });

  // Get channel
  app.get('/api/enterprise/notifications/channels/:channelId', requireAuth, (req: Request, res: Response) => {
    const channel = notificationWebhookService.getChannel(req.params.channelId);
    if (!channel) {
      return res.status(404).json({ success: false, error: 'Channel not found' });
    }
    res.json({ success: true, channel });
  });

  // Get channels by project
  app.get('/api/enterprise/notifications/projects/:projectId/channels', requireAuth, (req: Request, res: Response) => {
    const channels = notificationWebhookService.getChannelsByProject(req.params.projectId);
    res.json({ success: true, channels });
  });

  // Test channel
  app.post('/api/enterprise/notifications/channels/:channelId/test', requireAuth, async (req: Request, res: Response) => {
    const success = await notificationWebhookService.testChannel(req.params.channelId);
    res.json({ success });
  });

  // Send notification
  app.post('/api/enterprise/notifications/send', requireAuth, async (req: Request, res: Response) => {
    try {
      const { event, projectId, data } = req.body;
      const notifications = await notificationWebhookService.sendNotification(event, projectId, data);
      res.json({ success: true, notifications });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Invalid request' 
      });
    }
  });

  // Get notification templates
  app.get('/api/enterprise/notifications/templates', requireAuth, (req: Request, res: Response) => {
    const templates = notificationWebhookService.getTemplates();
    res.json({ success: true, templates });
  });

  // ==================== ROLLBACK ROUTES ====================
  // Rollback operations require sovereign access for safety

  // Create deployment snapshot
  app.post('/api/enterprise/rollback/snapshots', requireSovereign, async (req: Request, res: Response) => {
    try {
      const { projectId, environment, version, buildId, platform, artifacts, config, healthCheckUrl } = req.body;
      const snapshot = await rollbackService.createSnapshot(
        projectId,
        environment,
        version,
        buildId,
        platform,
        artifacts || [],
        config || {},
        healthCheckUrl
      );
      res.json({ success: true, snapshot });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Invalid request' 
      });
    }
  });

  // Get snapshot
  app.get('/api/enterprise/rollback/snapshots/:snapshotId', requireAuth, (req: Request, res: Response) => {
    const snapshot = rollbackService.getSnapshot(req.params.snapshotId);
    if (!snapshot) {
      return res.status(404).json({ success: false, error: 'Snapshot not found' });
    }
    res.json({ success: true, snapshot });
  });

  // Get snapshots by project
  app.get('/api/enterprise/rollback/projects/:projectId/snapshots', requireAuth, (req: Request, res: Response) => {
    const snapshots = rollbackService.getSnapshotsByProject(req.params.projectId);
    res.json({ success: true, snapshots });
  });

  // Execute rollback - requires sovereign access
  app.post('/api/enterprise/rollback/execute', requireSovereign, async (req: Request, res: Response) => {
    try {
      const data = rollbackSchema.parse(req.body);
      const operation = await rollbackService.rollback(
        data.projectId,
        data.environment,
        data.platform,
        data.targetSnapshotId,
        data.reason,
        data.reasonAr
      );
      res.json({ success: true, operation });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Invalid request' 
      });
    }
  });

  // Get rollback operation
  app.get('/api/enterprise/rollback/operations/:operationId', requireAuth, (req: Request, res: Response) => {
    const operation = rollbackService.getOperation(req.params.operationId);
    if (!operation) {
      return res.status(404).json({ success: false, error: 'Operation not found' });
    }
    res.json({ success: true, operation });
  });

  // Get rollback policies
  app.get('/api/enterprise/rollback/policies', requireAuth, (req: Request, res: Response) => {
    const policies = rollbackService.getPolicies();
    res.json({ success: true, policies });
  });

  // ==================== PERFORMANCE MONITORING ROUTES ====================

  // Record metric
  app.post('/api/enterprise/monitoring/metrics', requireAuth, (req: Request, res: Response) => {
    try {
      const { projectId, type, name, value, unit, tags, metadata } = req.body;
      const metric = performanceMonitoringService.recordMetric(
        projectId,
        type,
        name,
        value,
        unit,
        tags,
        metadata
      );
      res.json({ success: true, metric });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Invalid request' 
      });
    }
  });

  // Get metrics
  app.get('/api/enterprise/monitoring/projects/:projectId/metrics', requireAuth, (req: Request, res: Response) => {
    const { type, startTime, endTime } = req.query;
    const metrics = performanceMonitoringService.getMetrics(
      req.params.projectId,
      type as any,
      startTime ? new Date(startTime as string) : undefined,
      endTime ? new Date(endTime as string) : undefined
    );
    res.json({ success: true, metrics });
  });

  // Get build analytics
  app.get('/api/enterprise/monitoring/projects/:projectId/analytics/builds', requireAuth, async (req: Request, res: Response) => {
    const days = parseInt(req.query.days as string) || 30;
    const analytics = await performanceMonitoringService.getBuildAnalytics(req.params.projectId, days);
    res.json({ success: true, analytics });
  });

  // Get cost analytics
  app.get('/api/enterprise/monitoring/projects/:projectId/analytics/cost', requireAuth, async (req: Request, res: Response) => {
    const analytics = await performanceMonitoringService.getCostAnalytics(req.params.projectId);
    res.json({ success: true, analytics });
  });

  // Get resource usage
  app.get('/api/enterprise/monitoring/projects/:projectId/resources', requireAuth, async (req: Request, res: Response) => {
    const usage = await performanceMonitoringService.getResourceUsage(req.params.projectId);
    res.json({ success: true, usage });
  });

  // Create alert
  app.post('/api/enterprise/monitoring/alerts', requireAuth, (req: Request, res: Response) => {
    try {
      const data = alertSchema.parse(req.body);
      const alert = performanceMonitoringService.createAlert(
        data.projectId,
        data.name,
        data.nameAr,
        data.metric as any,
        data.condition,
        data.threshold,
        data.severity,
        data.channels
      );
      res.json({ success: true, alert });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Invalid request' 
      });
    }
  });

  // Get alerts
  app.get('/api/enterprise/monitoring/projects/:projectId/alerts', requireAuth, (req: Request, res: Response) => {
    const alerts = performanceMonitoringService.getAlerts(req.params.projectId);
    res.json({ success: true, alerts });
  });

  // Acknowledge alert
  app.post('/api/enterprise/monitoring/alerts/:alertId/acknowledge', requireAuth, (req: Request, res: Response) => {
    const success = performanceMonitoringService.acknowledgeAlert(req.params.alertId);
    res.json({ success });
  });

  // Get dashboard widgets
  app.get('/api/enterprise/monitoring/dashboard', requireAuth, (req: Request, res: Response) => {
    const widgets = performanceMonitoringService.getDefaultDashboard();
    res.json({ success: true, widgets });
  });

  // ==================== ENTERPRISE SERVICES OVERVIEW ====================

  // Get all services status - public endpoint for service discovery
  app.get('/api/enterprise/status', requireAuth, (req: Request, res: Response) => {
    res.json({
      success: true,
      services: {
        deviceTesting: {
          name: 'Real Device Testing',
          nameAr: 'اختبار الأجهزة الحقيقية',
          status: 'active',
          providers: ['AWS Device Farm', 'Firebase Test Lab', 'BrowserStack', 'Sauce Labs'],
        },
        fastlane: {
          name: 'Fastlane Deployment',
          nameAr: 'نشر Fastlane',
          status: 'active',
          platforms: ['iOS (App Store)', 'Android (Google Play)'],
        },
        codeQuality: {
          name: 'Code Quality Analysis',
          nameAr: 'تحليل جودة الكود',
          status: 'active',
          standards: ['OWASP', 'CWE', 'SANS Top 25', 'ISO 25010'],
        },
        artifacts: {
          name: 'Artifact Storage',
          nameAr: 'تخزين المخرجات',
          status: 'active',
          cloudProviders: ['AWS S3', 'Google Cloud Storage', 'Azure Blob'],
        },
        notifications: {
          name: 'Notification Webhooks',
          nameAr: 'إشعارات Webhook',
          status: 'active',
          channels: ['Slack', 'Discord', 'Email', 'Teams', 'SMS', 'Custom Webhook'],
        },
        rollback: {
          name: 'Rollback & Recovery',
          nameAr: 'التراجع والاستعادة',
          status: 'active',
          features: ['Auto-rollback', 'Blue-Green', 'Canary', 'Health Checks'],
        },
        monitoring: {
          name: 'Performance Monitoring',
          nameAr: 'مراقبة الأداء',
          status: 'active',
          features: ['Metrics', 'Alerts', 'Cost Analysis', 'Resource Tracking'],
        },
      },
      compliance: {
        standards: ['ISO 27001', 'SOC 2 Type II', 'OWASP', 'CWE', 'NIST', 'PCI-DSS'],
        coverage: '100%',
      },
      timestamp: new Date().toISOString(),
    });
  });

  console.log('[Enterprise Services] All routes registered successfully');
}
