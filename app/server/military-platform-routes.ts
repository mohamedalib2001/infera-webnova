/**
 * INFERA WebNova - Military Platform API Routes
 * ===============================================
 * Complete API for military-grade platform building capabilities
 */

import { Router, Request, Response } from 'express';
import { militarySecurity, fipsCrypto, pkiManager, sbomGenerator, incidentResponse, zeroTrust } from './military-security-layer';
import { smartAnalysisTools, codeAnalyzer, securityScanner, performanceProfiler, testingAutomation } from './smart-analysis-tools';
import { cicdEngine, pipelineManager, dockerManager, cloudDeployment, githubAutomation, realTimeMonitor } from './cicd-automation-engine';
import { contextEngine, databaseAnalyzer, projectAnalyzer, historyTracker, architectureAnalyzer } from './context-understanding-engine';
import { requireAuthenticatedUser, requireRole, rateLimitSovereign, payloadSizeLimit, logAudit, AuthenticatedRequest } from './sovereign-security-middleware';

const router = Router();

// ==================== MILITARY SECURITY ENDPOINTS ====================

// Get FIPS compliance status (requires auth)
router.get('/security/fips/status',
  requireAuthenticatedUser,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const status = fipsCrypto.getComplianceStatus();
      res.json({ success: true, data: status });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Encrypt data (FIPS-compliant)
router.post('/security/encrypt',
  payloadSizeLimit,
  rateLimitSovereign,
  requireAuthenticatedUser,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { plaintext, associatedData } = req.body;
      if (!plaintext) {
        return res.status(400).json({ success: false, error: 'Plaintext required' });
      }
      const encrypted = fipsCrypto.encrypt(plaintext, associatedData);
      logAudit(req, 'FIPS_ENCRYPT', 'security', null, req.sovereignAuth?.userId, 'success');
      res.json({ success: true, data: encrypted });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Decrypt data (FIPS-compliant)
router.post('/security/decrypt',
  payloadSizeLimit,
  rateLimitSovereign,
  requireAuthenticatedUser,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { ciphertext, iv, tag, associatedData } = req.body;
      if (!ciphertext || !iv || !tag) {
        return res.status(400).json({ success: false, error: 'Ciphertext, IV, and tag required' });
      }
      const decrypted = fipsCrypto.decrypt(ciphertext, iv, tag, associatedData);
      logAudit(req, 'FIPS_DECRYPT', 'security', null, req.sovereignAuth?.userId, 'success');
      res.json({ success: true, data: { plaintext: decrypted } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Decryption failed - invalid data or key' });
    }
  }
);

// Get PKI certificates (requires sovereign role)
router.get('/security/pki/certificates',
  requireAuthenticatedUser,
  requireRole('sovereign'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const crlStatus = pkiManager.getCRLStatus();
      res.json({ success: true, data: crlStatus });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Issue certificate
router.post('/security/pki/issue',
  payloadSizeLimit,
  rateLimitSovereign,
  requireAuthenticatedUser,
  requireRole('sovereign'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { subject, usageTypes, validityDays } = req.body;
      if (!subject || !usageTypes) {
        return res.status(400).json({ success: false, error: 'Subject and usageTypes required' });
      }
      const cert = pkiManager.issueCertificate(subject, usageTypes, validityDays);
      logAudit(req, 'PKI_ISSUE_CERT', 'security', cert.id, req.sovereignAuth?.userId, 'success');
      res.json({ success: true, data: cert });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Validate certificate
router.get('/security/pki/validate/:certId', async (req: Request, res: Response) => {
  try {
    const result = pkiManager.validateCertificate(req.params.certId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Revoke certificate
router.post('/security/pki/revoke/:certId',
  payloadSizeLimit,
  rateLimitSovereign,
  requireAuthenticatedUser,
  requireRole('owner'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { reason } = req.body;
      const result = pkiManager.revokeCertificate(req.params.certId, reason || 'Manual revocation');
      logAudit(req, 'PKI_REVOKE_CERT', 'security', req.params.certId, req.sovereignAuth?.userId, result ? 'success' : 'failure');
      res.json({ success: result, message: result ? 'Certificate revoked' : 'Certificate not found' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Generate SBOM
router.post('/security/sbom/generate', async (req: Request, res: Response) => {
  try {
    const { packageJsonPath } = req.body;
    const sbom = await sbomGenerator.generateFromPackageJson(packageJsonPath);
    res.json({ success: true, data: sbom });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all SBOMs
router.get('/security/sbom', async (req: Request, res: Response) => {
  try {
    const sboms = sbomGenerator.getAllSBOMs();
    res.json({ success: true, data: sboms });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export SBOM as CycloneDX
router.get('/security/sbom/:id/export', async (req: Request, res: Response) => {
  try {
    const exported = sbomGenerator.exportToCycloneDX(req.params.id);
    res.json(exported);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Zero Trust status
router.get('/security/zero-trust/status', async (req: Request, res: Response) => {
  try {
    const policies = zeroTrust.getPolicies();
    res.json({ success: true, data: { policies } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Calculate trust score
router.post('/security/zero-trust/score',
  payloadSizeLimit,
  rateLimitSovereign,
  requireAuthenticatedUser,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const context = {
        userId: req.sovereignAuth!.userId,
        ipAddress: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        sessionAge: 0,
        failedAttempts: 0,
        mfaVerified: false,
        ...req.body
      };
      const score = zeroTrust.calculateTrustScore(context);
      res.json({ success: true, data: { score, context } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Get full compliance report (requires sovereign)
router.get('/security/compliance/report',
  requireAuthenticatedUser,
  requireRole('sovereign'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const report = militarySecurity.getComplianceReport();
      res.json({ success: true, data: report });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// ==================== INCIDENT RESPONSE ENDPOINTS ====================

// Create incident
router.post('/incidents',
  payloadSizeLimit,
  rateLimitSovereign,
  requireAuthenticatedUser,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const incident = incidentResponse.createIncident({
        ...req.body,
        detectedBy: req.sovereignAuth!.userId
      });
      logAudit(req, 'INCIDENT_CREATE', 'incidents', incident.id, req.sovereignAuth?.userId, 'success');
      res.json({ success: true, data: incident });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Get all incidents (requires admin)
router.get('/incidents',
  requireAuthenticatedUser,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const incidents = incidentResponse.getAllIncidents();
      res.json({ success: true, data: incidents });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Get active incidents
router.get('/incidents/active', async (req: Request, res: Response) => {
  try {
    const incidents = incidentResponse.getActiveIncidents();
    res.json({ success: true, data: incidents });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get incident metrics
router.get('/incidents/metrics', async (req: Request, res: Response) => {
  try {
    const metrics = incidentResponse.getMetrics();
    res.json({ success: true, data: metrics });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get incident by ID
router.get('/incidents/:id', async (req: Request, res: Response) => {
  try {
    const incident = incidentResponse.getIncident(req.params.id);
    if (!incident) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }
    res.json({ success: true, data: incident });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update incident status
router.patch('/incidents/:id/status',
  payloadSizeLimit,
  rateLimitSovereign,
  requireAuthenticatedUser,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { status, notes } = req.body;
      const incident = incidentResponse.updateStatus(
        req.params.id,
        status,
        req.sovereignAuth!.userId,
        notes
      );
      if (!incident) {
        return res.status(404).json({ success: false, error: 'Incident not found' });
      }
      logAudit(req, 'INCIDENT_STATUS_UPDATE', 'incidents', req.params.id, req.sovereignAuth?.userId, 'success');
      res.json({ success: true, data: incident });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Check 72-hour reporting deadline
router.get('/incidents/:id/deadline', async (req: Request, res: Response) => {
  try {
    const deadline = incidentResponse.checkReportingDeadline(req.params.id);
    res.json({ success: true, data: deadline });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Submit incident report
router.post('/incidents/:id/report',
  payloadSizeLimit,
  rateLimitSovereign,
  requireAuthenticatedUser,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = incidentResponse.submitReport(req.params.id, req.sovereignAuth!.userId);
      logAudit(req, 'INCIDENT_REPORT_SUBMIT', 'incidents', req.params.id, req.sovereignAuth?.userId, result ? 'success' : 'failure');
      res.json({ success: result, message: result ? 'Report submitted' : 'Incident not found' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// ==================== CODE ANALYSIS ENDPOINTS ====================

// Analyze project
router.post('/analysis/code/project', async (req: Request, res: Response) => {
  try {
    const { projectPath } = req.body;
    const result = await codeAnalyzer.analyzeProject(projectPath || '.');
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Analyze code snippet
router.post('/analysis/code/snippet', async (req: Request, res: Response) => {
  try {
    const { code, fileName } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, error: 'Code required' });
    }
    const issues = await codeAnalyzer.analyzeCode(code, fileName || 'snippet.ts');
    const complexity = codeAnalyzer.calculateComplexity(code);
    res.json({ success: true, data: { issues, complexity } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all analyses
router.get('/analysis/code', async (req: Request, res: Response) => {
  try {
    const analyses = codeAnalyzer.getAllAnalyses();
    res.json({ success: true, data: analyses });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== SECURITY SCANNING ENDPOINTS ====================

// Run SAST scan
router.post('/analysis/security/sast', async (req: Request, res: Response) => {
  try {
    const { projectPath } = req.body;
    const result = await securityScanner.performSAST(projectPath || '.');
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all security scans
router.get('/analysis/security/scans', async (req: Request, res: Response) => {
  try {
    const scans = securityScanner.getAllScans();
    res.json({ success: true, data: scans });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get scan by ID
router.get('/analysis/security/scans/:id', async (req: Request, res: Response) => {
  try {
    const scan = securityScanner.getScan(req.params.id);
    if (!scan) {
      return res.status(404).json({ success: false, error: 'Scan not found' });
    }
    res.json({ success: true, data: scan });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== PERFORMANCE PROFILING ENDPOINTS ====================

// Start profiling
router.post('/analysis/performance/start', async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const profileId = performanceProfiler.startProfile(name || 'Default Profile');
    res.json({ success: true, data: { profileId } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// End profiling
router.post('/analysis/performance/end/:id', async (req: Request, res: Response) => {
  try {
    const profile = performanceProfiler.endProfile(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }
    res.json({ success: true, data: profile });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get current metrics
router.get('/analysis/performance/metrics', async (req: Request, res: Response) => {
  try {
    const metrics = performanceProfiler.getCurrentMetrics();
    res.json({ success: true, data: metrics });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all profiles
router.get('/analysis/performance/profiles', async (req: Request, res: Response) => {
  try {
    const profiles = performanceProfiler.getAllProfiles();
    res.json({ success: true, data: profiles });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== TESTING AUTOMATION ENDPOINTS ====================

// Create test suite
router.post('/testing/suites', async (req: Request, res: Response) => {
  try {
    const suite = testingAutomation.createSuite(req.body);
    res.json({ success: true, data: suite });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all test suites
router.get('/testing/suites', async (req: Request, res: Response) => {
  try {
    const suites = testingAutomation.getAllSuites();
    res.json({ success: true, data: suites });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Run test suite
router.post('/testing/suites/:id/run', async (req: Request, res: Response) => {
  try {
    const result = await testingAutomation.runSuite(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Suite not found' });
    }
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate tests from code
router.post('/testing/generate', async (req: Request, res: Response) => {
  try {
    const { code, language } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, error: 'Code required' });
    }
    const tests = testingAutomation.generateTestsFromCode(code, language || 'typescript');
    res.json({ success: true, data: tests });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get recent test results
router.get('/testing/results', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const results = testingAutomation.getRecentResults(limit);
    res.json({ success: true, data: results });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== CI/CD PIPELINE ENDPOINTS ====================

// Create pipeline
router.post('/cicd/pipelines',
  payloadSizeLimit,
  rateLimitSovereign,
  requireAuthenticatedUser,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const pipeline = pipelineManager.createPipeline(req.body);
      logAudit(req, 'PIPELINE_CREATE', 'cicd', pipeline.id, req.sovereignAuth?.userId, 'success');
      res.json({ success: true, data: pipeline });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Get all pipelines
router.get('/cicd/pipelines', async (req: Request, res: Response) => {
  try {
    const projectId = req.query.projectId as string;
    const pipelines = projectId 
      ? pipelineManager.getPipelinesByProject(projectId)
      : pipelineManager.getAllPipelines();
    res.json({ success: true, data: pipelines });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Trigger pipeline
router.post('/cicd/pipelines/:id/trigger',
  payloadSizeLimit,
  rateLimitSovereign,
  requireAuthenticatedUser,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { triggerType, commit } = req.body;
      const run = await pipelineManager.triggerPipeline(
        req.params.id,
        req.sovereignAuth!.userId,
        triggerType || 'manual',
        commit
      );
      if (!run) {
        return res.status(404).json({ success: false, error: 'Pipeline not found or already running' });
      }
      logAudit(req, 'PIPELINE_TRIGGER', 'cicd', req.params.id, req.sovereignAuth?.userId, 'success');
      res.json({ success: true, data: run });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Cancel pipeline
router.post('/cicd/pipelines/:id/cancel',
  payloadSizeLimit,
  rateLimitSovereign,
  requireAuthenticatedUser,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = pipelineManager.cancelPipeline(req.params.id);
      logAudit(req, 'PIPELINE_CANCEL', 'cicd', req.params.id, req.sovereignAuth?.userId, result ? 'success' : 'failure');
      res.json({ success: result, message: result ? 'Pipeline cancelled' : 'Pipeline not found' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// ==================== DOCKER ENDPOINTS ====================

// Build Docker image
router.post('/cicd/docker/build',
  payloadSizeLimit,
  rateLimitSovereign,
  requireAuthenticatedUser,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const image = await dockerManager.buildImage(req.body);
      logAudit(req, 'DOCKER_BUILD', 'docker', image.id, req.sovereignAuth?.userId, 'success');
      res.json({ success: true, data: image });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Get all Docker images
router.get('/cicd/docker/images', async (req: Request, res: Response) => {
  try {
    const images = dockerManager.getAllImages();
    res.json({ success: true, data: images });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create container
router.post('/cicd/docker/containers', async (req: Request, res: Response) => {
  try {
    const container = await dockerManager.createContainer(req.body);
    res.json({ success: true, data: container });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all containers
router.get('/cicd/docker/containers', async (req: Request, res: Response) => {
  try {
    const containers = dockerManager.getAllContainers();
    res.json({ success: true, data: containers });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start container
router.post('/cicd/docker/containers/:id/start', async (req: Request, res: Response) => {
  try {
    const result = await dockerManager.startContainer(req.params.id);
    res.json({ success: result, message: result ? 'Container started' : 'Container not found' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Stop container
router.post('/cicd/docker/containers/:id/stop', async (req: Request, res: Response) => {
  try {
    const result = await dockerManager.stopContainer(req.params.id);
    res.json({ success: result, message: result ? 'Container stopped' : 'Container not found' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== CLOUD DEPLOYMENT ENDPOINTS ====================

// Get cloud providers
router.get('/cicd/cloud/providers', async (req: Request, res: Response) => {
  try {
    const providers = cloudDeployment.getProviders();
    res.json({ success: true, data: providers });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create deployment
router.post('/cicd/cloud/deployments',
  payloadSizeLimit,
  rateLimitSovereign,
  requireAuthenticatedUser,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const deployment = await cloudDeployment.createDeployment(req.body);
      logAudit(req, 'DEPLOYMENT_CREATE', 'cloud', deployment.id, req.sovereignAuth?.userId, 'success');
      res.json({ success: true, data: deployment });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Get all deployments
router.get('/cicd/cloud/deployments', async (req: Request, res: Response) => {
  try {
    const projectId = req.query.projectId as string;
    const deployments = projectId
      ? cloudDeployment.getDeploymentsByProject(projectId)
      : cloudDeployment.getAllDeployments();
    res.json({ success: true, data: deployments });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Deploy
router.post('/cicd/cloud/deployments/:id/deploy',
  payloadSizeLimit,
  rateLimitSovereign,
  requireAuthenticatedUser,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = await cloudDeployment.deploy(req.params.id);
      logAudit(req, 'DEPLOYMENT_EXECUTE', 'cloud', req.params.id, req.sovereignAuth?.userId, result ? 'success' : 'failure');
      res.json({ success: result, message: result ? 'Deployment successful' : 'Deployment failed' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Rollback
router.post('/cicd/cloud/deployments/:id/rollback',
  payloadSizeLimit,
  rateLimitSovereign,
  requireAuthenticatedUser,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { targetVersion } = req.body;
      const result = await cloudDeployment.rollback(req.params.id, targetVersion);
      logAudit(req, 'DEPLOYMENT_ROLLBACK', 'cloud', req.params.id, req.sovereignAuth?.userId, result ? 'success' : 'failure');
      res.json({ success: result, message: result ? 'Rollback successful' : 'Rollback failed' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Scale deployment
router.post('/cicd/cloud/deployments/:id/scale', async (req: Request, res: Response) => {
  try {
    const { replicas } = req.body;
    const result = await cloudDeployment.scale(req.params.id, replicas);
    res.json({ success: result, message: result ? 'Scaling successful' : 'Deployment not found' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Quick deploy
router.post('/cicd/cloud/quick-deploy',
  payloadSizeLimit,
  rateLimitSovereign,
  requireAuthenticatedUser,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { projectId, environment } = req.body;
      const deployment = await cicdEngine.quickDeploy(projectId, environment);
      logAudit(req, 'QUICK_DEPLOY', 'cloud', deployment.id, req.sovereignAuth?.userId, 'success');
      res.json({ success: true, data: deployment });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// ==================== MONITORING ENDPOINTS ====================

// Get monitoring status
router.get('/monitoring/status', async (req: Request, res: Response) => {
  try {
    const status = realTimeMonitor.getCurrentStatus();
    res.json({ success: true, data: status });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get alerts
router.get('/monitoring/alerts', async (req: Request, res: Response) => {
  try {
    const alerts = realTimeMonitor.getAlerts();
    res.json({ success: true, data: alerts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get firing alerts
router.get('/monitoring/alerts/firing', async (req: Request, res: Response) => {
  try {
    const alerts = realTimeMonitor.getFiringAlerts();
    res.json({ success: true, data: alerts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create alert
router.post('/monitoring/alerts', async (req: Request, res: Response) => {
  try {
    const alert = realTimeMonitor.createAlert(req.body);
    res.json({ success: true, data: alert });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== CONTEXT ANALYSIS ENDPOINTS ====================

// Analyze database schema
router.get('/context/database/schema', async (req: Request, res: Response) => {
  try {
    const schema = await databaseAnalyzer.analyzeSchema();
    res.json({ success: true, data: schema });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get ERD data
router.get('/context/database/erd', async (req: Request, res: Response) => {
  try {
    const erd = databaseAnalyzer.generateERD();
    res.json({ success: true, data: erd });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get database optimizations
router.get('/context/database/optimizations', async (req: Request, res: Response) => {
  try {
    const suggestions = databaseAnalyzer.suggestOptimizations();
    res.json({ success: true, data: suggestions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Analyze project structure
router.post('/context/project/analyze', async (req: Request, res: Response) => {
  try {
    const { projectPath } = req.body;
    const structure = await projectAnalyzer.analyzeProject(projectPath || '.');
    res.json({ success: true, data: structure });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get cached project structure
router.get('/context/project/structure', async (req: Request, res: Response) => {
  try {
    const structure = projectAnalyzer.getCachedStructure();
    if (!structure) {
      return res.status(404).json({ success: false, error: 'No cached structure. Run analysis first.' });
    }
    res.json({ success: true, data: structure });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Analyze git history
router.post('/context/history/analyze', async (req: Request, res: Response) => {
  try {
    const { projectId, repoPath } = req.body;
    const timeline = await historyTracker.analyzeGitHistory(projectId || 'default', repoPath || '.');
    res.json({ success: true, data: timeline });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get development timeline
router.get('/context/history/:projectId', async (req: Request, res: Response) => {
  try {
    const timeline = historyTracker.getTimeline(req.params.projectId);
    if (!timeline) {
      return res.status(404).json({ success: false, error: 'Timeline not found' });
    }
    res.json({ success: true, data: timeline });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Record development event
router.post('/context/history/:projectId/events', async (req: Request, res: Response) => {
  try {
    const event = historyTracker.recordEvent(req.params.projectId, req.body);
    res.json({ success: true, data: event });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Analyze architecture patterns
router.post('/context/architecture/analyze', async (req: Request, res: Response) => {
  try {
    const structure = projectAnalyzer.getCachedStructure();
    if (!structure) {
      return res.status(400).json({ success: false, error: 'Run project analysis first' });
    }
    const analysis = architectureAnalyzer.analyzePatterns(structure);
    res.json({ success: true, data: analysis });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Full context analysis
router.post('/context/full-analysis', async (req: Request, res: Response) => {
  try {
    const { projectPath } = req.body;
    const fullContext = await contextEngine.analyzeFullContext(projectPath || '.');
    res.json({ success: true, data: fullContext });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== QUICK ANALYSIS ENDPOINT ====================

// Full platform analysis (code + security + context)
router.post('/analyze/full', async (req: Request, res: Response) => {
  try {
    const { projectPath } = req.body;
    const path = projectPath || '.';

    const [quickAnalysis, fullContext] = await Promise.all([
      smartAnalysisTools.quickAnalysis(path),
      contextEngine.analyzeFullContext(path)
    ]);

    res.json({
      success: true,
      data: {
        code: quickAnalysis.code,
        security: quickAnalysis.security,
        context: fullContext,
        overallHealth: Math.round((quickAnalysis.overallHealth + fullContext.summary.healthScore) / 2)
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
