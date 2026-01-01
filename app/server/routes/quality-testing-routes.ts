import { Router, Request, Response } from 'express';
import { qualityTestingSystem } from '../lib/quality-testing-system';

const router = Router();

const ROOT_OWNER_EMAIL = 'mohamed.ali.b2001@gmail.com';
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 25;
const RATE_WINDOW = 60 * 1000;

function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated?.() || !req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required | المصادقة مطلوبة' });
  }
  next();
}

function requireOwner(req: Request, res: Response, next: Function) {
  const user = req.user as any;
  if (user?.email !== ROOT_OWNER_EMAIL) {
    return res.status(403).json({ success: false, error: 'Owner access only | وصول المالك فقط' });
  }
  next();
}

function rateLimit(req: Request, res: Response, next: Function) {
  const user = req.user as any;
  const key = user?.email || req.ip;
  const now = Date.now();
  
  for (const [k, v] of rateLimitMap.entries()) {
    if (now > v.resetAt) rateLimitMap.delete(k);
  }
  
  let entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    entry = { count: 1, resetAt: now + RATE_WINDOW };
    rateLimitMap.set(key, entry);
  } else {
    entry.count++;
  }
  
  if (entry.count > RATE_LIMIT) {
    return res.status(429).json({ 
      success: false, 
      error: 'Rate limit exceeded | تم تجاوز الحد المسموح',
      retryAfter: Math.ceil((entry.resetAt - now) / 1000)
    });
  }
  next();
}

router.use(requireAuth);
router.use(requireOwner);
router.use(rateLimit);

router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const stats = qualityTestingSystem.getStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/tests', async (_req: Request, res: Response) => {
  try {
    const tests = qualityTestingSystem.getTests();
    res.json({ success: true, data: tests });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/tests/:id', async (req: Request, res: Response) => {
  try {
    const test = qualityTestingSystem.getTest(req.params.id);
    if (!test) {
      return res.status(404).json({ success: false, error: 'Test not found' });
    }
    res.json({ success: true, data: test });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/tests', async (req: Request, res: Response) => {
  try {
    const { name, nameAr, description, descriptionAr, category, target, assertions } = req.body;
    if (!name || !category || !target) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    const test = qualityTestingSystem.addTest({
      name,
      nameAr: nameAr || name,
      description: description || '',
      descriptionAr: descriptionAr || description || '',
      category,
      target,
      assertions: assertions || []
    });
    res.json({ success: true, data: test });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/tests/:id/run', async (req: Request, res: Response) => {
  try {
    const result = await qualityTestingSystem.runTest(req.params.id);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/suites', async (_req: Request, res: Response) => {
  try {
    const suites = qualityTestingSystem.getSuites();
    res.json({ success: true, data: suites });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/suites/:id/run', async (req: Request, res: Response) => {
  try {
    const result = await qualityTestingSystem.runSuite(req.params.id);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/vulnerabilities', async (req: Request, res: Response) => {
  try {
    const status = req.query.status as any;
    const vulnerabilities = qualityTestingSystem.getVulnerabilities(status);
    res.json({ success: true, data: vulnerabilities });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/scan', async (req: Request, res: Response) => {
  try {
    const { targetPath } = req.body;
    const vulnerabilities = await qualityTestingSystem.scanForVulnerabilities(targetPath);
    res.json({ 
      success: true, 
      data: vulnerabilities,
      message: `Scan complete. Found ${vulnerabilities.length} potential vulnerabilities.`,
      messageAr: `اكتمل الفحص. تم العثور على ${vulnerabilities.length} ثغرات محتملة.`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/vulnerabilities/:id/remediate', async (req: Request, res: Response) => {
  try {
    const result = await qualityTestingSystem.remediateVulnerability(req.params.id);
    res.json({ 
      success: true, 
      data: result,
      message: 'Vulnerability remediated successfully',
      messageAr: 'تم معالجة الثغرة بنجاح'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.patch('/vulnerabilities/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!['open', 'in_progress', 'resolved', 'ignored'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }
    const result = qualityTestingSystem.updateVulnerabilityStatus(req.params.id, status);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/reports', async (_req: Request, res: Response) => {
  try {
    const reports = qualityTestingSystem.getReports();
    res.json({ success: true, data: reports });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/reports/:id', async (req: Request, res: Response) => {
  try {
    const report = qualityTestingSystem.getReport(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }
    res.json({ success: true, data: report });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/reports/generate', async (req: Request, res: Response) => {
  try {
    const { platformId, platformName } = req.body;
    if (!platformId || !platformName) {
      return res.status(400).json({ success: false, error: 'Missing platformId or platformName' });
    }
    const report = await qualityTestingSystem.generateReadinessReport(platformId, platformName);
    res.json({ 
      success: true, 
      data: report,
      message: `Readiness report generated. Overall score: ${report.overallScore}%`,
      messageAr: `تم إنشاء تقرير الجاهزية. الدرجة الإجمالية: ${report.overallScore}%`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
