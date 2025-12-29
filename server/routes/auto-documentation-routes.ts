/**
 * INFERA WebNova - Auto Documentation Routes
 * مسارات منصة التوثيق التلقائي
 * 
 * Owner-only endpoints for documentation generation
 * Rate limit: 20 req/min
 */

import { Router, Request, Response } from 'express';
import { autoDocumentationSystem } from '../lib/auto-documentation-system';

const router = Router();

const ROOT_OWNER_EMAIL = 'mohamed.ali.b2001@gmail.com';
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
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
    const stats = autoDocumentationSystem.getStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/docs', async (_req: Request, res: Response) => {
  try {
    const docs = autoDocumentationSystem.getDocs();
    res.json({ success: true, data: docs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/docs/:id', async (req: Request, res: Response) => {
  try {
    const doc = autoDocumentationSystem.getDoc(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document not found | الوثيقة غير موجودة' });
    }
    res.json({ success: true, data: doc });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/docs/generate/technical', async (req: Request, res: Response) => {
  try {
    const { name, nameAr, description, descriptionAr, features, featuresAr, techStack, endpoints, entities } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({ success: false, error: 'Platform name and description required | الاسم والوصف مطلوبان' });
    }
    
    const doc = await autoDocumentationSystem.generateTechnicalDoc({
      name,
      nameAr: nameAr || name,
      description,
      descriptionAr: descriptionAr || description,
      features: features || [],
      featuresAr: featuresAr || features || [],
      techStack: techStack || [],
      endpoints,
      entities
    });
    
    res.json({ 
      success: true, 
      data: doc,
      message: 'Technical documentation generated | تم إنشاء التوثيق الفني'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/docs/generate/operational', async (req: Request, res: Response) => {
  try {
    const { name, nameAr, description, descriptionAr, features, featuresAr, techStack } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({ success: false, error: 'Platform name and description required | الاسم والوصف مطلوبان' });
    }
    
    const doc = await autoDocumentationSystem.generateOperationalDoc({
      name,
      nameAr: nameAr || name,
      description,
      descriptionAr: descriptionAr || description,
      features: features || [],
      featuresAr: featuresAr || features || [],
      techStack: techStack || []
    });
    
    res.json({ 
      success: true, 
      data: doc,
      message: 'Operational documentation generated | تم إنشاء التوثيق التشغيلي'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.patch('/docs/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status | حالة غير صالحة' });
    }
    
    const doc = autoDocumentationSystem.updateDocStatus(req.params.id, status);
    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document not found | الوثيقة غير موجودة' });
    }
    
    res.json({ success: true, data: doc, message: 'Status updated | تم تحديث الحالة' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/docs/:id', async (req: Request, res: Response) => {
  try {
    const result = autoDocumentationSystem.deleteDoc(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Document not found | الوثيقة غير موجودة' });
    }
    res.json({ success: true, message: 'Document deleted | تم حذف الوثيقة' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/guides', async (_req: Request, res: Response) => {
  try {
    const guides = autoDocumentationSystem.getGuides();
    res.json({ success: true, data: guides });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/guides/:id', async (req: Request, res: Response) => {
  try {
    const guide = autoDocumentationSystem.getGuide(req.params.id);
    if (!guide) {
      return res.status(404).json({ success: false, error: 'Guide not found | الدليل غير موجود' });
    }
    res.json({ success: true, data: guide });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/guides/generate', async (req: Request, res: Response) => {
  try {
    const { name, nameAr, description, descriptionAr, features, featuresAr, techStack, targetAudience } = req.body;
    
    if (!name || !description || !targetAudience) {
      return res.status(400).json({ success: false, error: 'Platform info and target audience required | معلومات المنصة والجمهور المستهدف مطلوبة' });
    }
    
    if (!['admin', 'user', 'developer', 'operator'].includes(targetAudience)) {
      return res.status(400).json({ success: false, error: 'Invalid target audience | جمهور مستهدف غير صالح' });
    }
    
    const guide = await autoDocumentationSystem.generateUserGuide({
      name,
      nameAr: nameAr || name,
      description,
      descriptionAr: descriptionAr || description,
      features: features || [],
      featuresAr: featuresAr || features || [],
      techStack: techStack || []
    }, targetAudience);
    
    res.json({ 
      success: true, 
      data: guide,
      message: 'User guide generated | تم إنشاء دليل المستخدم'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/guides/:id', async (req: Request, res: Response) => {
  try {
    const result = autoDocumentationSystem.deleteGuide(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Guide not found | الدليل غير موجود' });
    }
    res.json({ success: true, message: 'Guide deleted | تم حذف الدليل' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/tutorials', async (_req: Request, res: Response) => {
  try {
    const tutorials = autoDocumentationSystem.getTutorials();
    res.json({ success: true, data: tutorials });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/tutorials/:id', async (req: Request, res: Response) => {
  try {
    const tutorial = autoDocumentationSystem.getTutorial(req.params.id);
    if (!tutorial) {
      return res.status(404).json({ success: false, error: 'Tutorial not found | الدرس غير موجود' });
    }
    res.json({ success: true, data: tutorial });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/tutorials/generate', async (req: Request, res: Response) => {
  try {
    const { name, nameAr, description, descriptionAr, features, featuresAr, techStack, type } = req.body;
    
    if (!name || !description || !type) {
      return res.status(400).json({ success: false, error: 'Platform info and tutorial type required | معلومات المنصة ونوع الدرس مطلوبة' });
    }
    
    if (!['video_script', 'slide_deck', 'walkthrough', 'quick_start'].includes(type)) {
      return res.status(400).json({ success: false, error: 'Invalid tutorial type | نوع درس غير صالح' });
    }
    
    const tutorial = await autoDocumentationSystem.generateTutorialContent({
      name,
      nameAr: nameAr || name,
      description,
      descriptionAr: descriptionAr || description,
      features: features || [],
      featuresAr: featuresAr || features || [],
      techStack: techStack || []
    }, type);
    
    res.json({ 
      success: true, 
      data: tutorial,
      message: 'Tutorial content generated | تم إنشاء محتوى الدرس'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/tutorials/:id', async (req: Request, res: Response) => {
  try {
    const result = autoDocumentationSystem.deleteTutorial(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Tutorial not found | الدرس غير موجود' });
    }
    res.json({ success: true, message: 'Tutorial deleted | تم حذف الدرس' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/platform/:platformId', async (req: Request, res: Response) => {
  try {
    const { platformId } = req.params;
    const docs = autoDocumentationSystem.getDocsByPlatform(platformId);
    const guides = autoDocumentationSystem.getGuidesByPlatform(platformId);
    const tutorials = autoDocumentationSystem.getTutorialsByPlatform(platformId);
    
    res.json({ 
      success: true, 
      data: { docs, guides, tutorials },
      message: 'Platform documentation retrieved | تم استرجاع توثيق المنصة'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
