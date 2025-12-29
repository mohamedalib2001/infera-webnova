/**
 * INFERA WebNova - Smart Template Bank Routes
 * مسارات حافظة القوالب الذكية
 * 
 * Owner-only endpoints for template management
 * Rate limit: 30 req/min
 */

import { Router, Request, Response, NextFunction } from 'express';
import { smartTemplateBank } from '../lib/smart-template-bank';
import { z } from 'zod';

const router = Router();
const ROOT_OWNER_EMAIL = "mohamed.ali.b2001@gmail.com";

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ 
      error: 'Authentication required | المصادقة مطلوبة',
      code: 'AUTH_REQUIRED'
    });
  }
  next();
}

function requireOwner(req: Request, res: Response, next: NextFunction) {
  const user = req.user as any;
  if (!user || user.email !== ROOT_OWNER_EMAIL) {
    return res.status(403).json({ 
      error: 'Owner access required | صلاحية المالك مطلوبة',
      code: 'OWNER_REQUIRED'
    });
  }
  next();
}

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30;
const RATE_WINDOW = 60000;

function rateLimit(req: Request, res: Response, next: NextFunction) {
  const user = req.user as any;
  const key = user?.id || req.ip;
  const now = Date.now();
  
  let entry = rateLimitMap.get(key);
  if (!entry || entry.resetAt < now) {
    entry = { count: 0, resetAt: now + RATE_WINDOW };
    rateLimitMap.set(key, entry);
  }
  
  entry.count++;
  if (entry.count > RATE_LIMIT) {
    return res.status(429).json({
      error: 'Rate limit exceeded | تم تجاوز حد الطلبات',
      retryAfter: Math.ceil((entry.resetAt - now) / 1000)
    });
  }
  next();
}

router.get('/stats', requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const stats = smartTemplateBank.getStats();
    res.json({
      success: true,
      message: 'Template bank statistics | إحصائيات حافظة القوالب',
      data: stats
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const searchSchema = z.object({
  query: z.string().min(1),
  limit: z.number().optional().default(10)
});

router.post('/patterns/search', requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const { query, limit } = searchSchema.parse(req.body);
    const matches = await smartTemplateBank.findMatchingPatterns(query, limit);
    res.json({
      success: true,
      message: 'Pattern search results | نتائج البحث عن الأنماط',
      data: matches
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/components/search', requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const { query, type, limit } = req.body;
    const matches = await smartTemplateBank.findMatchingComponents(query, type);
    res.json({
      success: true,
      message: 'Component search results | نتائج البحث عن المكونات',
      data: matches.slice(0, limit || 10)
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/patterns', requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const { sector } = req.query;
    const patterns = smartTemplateBank.listPatterns(sector as string);
    res.json({
      success: true,
      message: 'Available patterns | الأنماط المتاحة',
      data: patterns
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/patterns/:id', requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const pattern = smartTemplateBank.getPattern(req.params.id);
    if (!pattern) {
      return res.status(404).json({ success: false, error: 'Pattern not found | النمط غير موجود' });
    }
    res.json({ success: true, data: pattern });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const patternSchema = z.object({
  name: z.string().min(1),
  nameAr: z.string().min(1),
  description: z.string().min(1),
  descriptionAr: z.string().min(1),
  sector: z.string().min(1),
  sectorAr: z.string().min(1),
  components: z.array(z.string()).default([]),
  structure: z.record(z.any()).default({}),
  examples: z.array(z.string()).default([]),
  matchKeywords: z.array(z.string()).default([]),
  matchKeywordsAr: z.array(z.string()).default([])
});

router.post('/patterns', requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const data = patternSchema.parse(req.body);
    const pattern = smartTemplateBank.addPattern(data);
    res.status(201).json({
      success: true,
      message: 'Pattern created | تم إنشاء النمط',
      data: pattern
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/components', requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const { type } = req.query;
    const components = smartTemplateBank.listComponents(type as any);
    res.json({
      success: true,
      message: 'Available components | المكونات المتاحة',
      data: components
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/components/:id', requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const component = smartTemplateBank.getComponent(req.params.id);
    if (!component) {
      return res.status(404).json({ success: false, error: 'Component not found | المكون غير موجود' });
    }
    res.json({ success: true, data: component });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const componentSchema = z.object({
  name: z.string().min(1),
  nameAr: z.string().min(1),
  type: z.enum(['ui', 'logic', 'api', 'database', 'integration', 'workflow']),
  category: z.string().min(1),
  categoryAr: z.string().min(1),
  code: z.string().min(1),
  language: z.enum(['typescript', 'javascript', 'sql', 'css', 'html', 'json']),
  dependencies: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  tagsAr: z.array(z.string()).default([]),
  projectSource: z.string().optional()
});

router.post('/components', requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const data = componentSchema.parse(req.body);
    const component = smartTemplateBank.addComponent(data);
    res.status(201).json({
      success: true,
      message: 'Component added | تم إضافة المكون',
      data: component
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/templates', requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const { sector } = req.query;
    const templates = smartTemplateBank.listTemplates(sector as string);
    res.json({
      success: true,
      message: 'Available templates | القوالب المتاحة',
      data: templates
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/templates/:id', requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const template = smartTemplateBank.getTemplate(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found | القالب غير موجود' });
    }
    res.json({ success: true, data: template });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const adaptSchema = z.object({
  templateId: z.string().min(1),
  sector: z.string().min(1),
  requirements: z.string().min(1),
  customizations: z.record(z.any()).optional()
});

router.post('/adapt', requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const { templateId, sector, requirements, customizations } = adaptSchema.parse(req.body);
    const adapted = await smartTemplateBank.adaptTemplateToContext(templateId, {
      sector,
      requirements,
      customizations
    });
    
    if (!adapted) {
      return res.status(404).json({ success: false, error: 'Template not found | القالب غير موجود' });
    }
    
    res.json({
      success: true,
      message: 'Template adapted | تم تكييف القالب',
      data: adapted
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

const assembleSchema = z.object({
  projectIds: z.array(z.string()).default([]),
  name: z.string().min(1),
  sector: z.string().min(1),
  features: z.array(z.string()).min(1)
});

router.post('/assemble', requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const { projectIds, name, sector, features } = assembleSchema.parse(req.body);
    const result = await smartTemplateBank.assembleFromProjects(projectIds, { name, sector, features });
    res.json({
      success: true,
      message: 'Components assembled | تم تجميع المكونات',
      data: result
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/usage/:id', requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const { type } = req.body as { type: 'component' | 'pattern' | 'template' };
    if (!type) {
      return res.status(400).json({ success: false, error: 'Type required | النوع مطلوب' });
    }
    smartTemplateBank.recordUsage(req.params.id, type);
    res.json({
      success: true,
      message: 'Usage recorded | تم تسجيل الاستخدام'
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export function registerTemplateBankRoutes(app: any): void {
  app.use('/api/template-bank', router);
  console.log('Smart Template Bank routes registered | تم تسجيل مسارات حافظة القوالب الذكية');
}

export default router;
