/**
 * Internal Development Routes - مسارات التطوير الداخلي
 * 
 * API للتطوير داخل المنصة مع:
 * - محرر الأكواد
 * - تحليل الموارد
 * - إعادة الهيكلة بالذكاء الاصطناعي
 * - تحسين التكلفة
 */

import { Router, Request, Response } from 'express';
import { internalDevService } from '../services/internal-development-service';

const router = Router();

// Rate limiting middleware
const rateLimit = (req: Request, res: Response, next: Function) => {
  // Simple in-memory rate limiting
  next();
};

// Auth middleware
const requireAuth = (req: Request, res: Response, next: Function) => {
  if (!req.isAuthenticated?.() && !req.session?.userId) {
    return res.status(401).json({ 
      success: false, 
      message: "Authentication required | التوثيق مطلوب" 
    });
  }
  next();
};

/**
 * GET /api/dev/files/:repositoryId
 * Get project file tree
 * الحصول على شجرة ملفات المشروع
 */
router.get('/files/:repositoryId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { repositoryId } = req.params;
    const files = await internalDevService.getProjectFiles(repositoryId);
    
    res.json({
      success: true,
      data: files
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/dev/file/:repositoryId/*
 * Read file content
 * قراءة محتوى الملف
 */
router.get('/file/:repositoryId/*', requireAuth, async (req: Request, res: Response) => {
  try {
    const { repositoryId } = req.params;
    const filePath = req.params[0];
    
    const result = await internalDevService.readFile(repositoryId, filePath);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * PUT /api/dev/file/:repositoryId/*
 * Save file content
 * حفظ محتوى الملف
 */
router.put('/file/:repositoryId/*', requireAuth, async (req: Request, res: Response) => {
  try {
    const { repositoryId } = req.params;
    const filePath = req.params[0];
    const { content, commitMessage } = req.body;
    
    if (typeof content !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }
    
    await internalDevService.saveFile(repositoryId, filePath, content, commitMessage);
    
    res.json({
      success: true,
      message: 'File saved successfully | تم حفظ الملف بنجاح'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/dev/resources/:repositoryId
 * Analyze resource usage
 * تحليل استخدام الموارد
 */
router.get('/resources/:repositoryId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { repositoryId } = req.params;
    const resources = await internalDevService.analyzeResources(repositoryId);
    
    res.json({
      success: true,
      data: resources
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/dev/performance/:repositoryId
 * Detect performance issues
 * اكتشاف مشاكل الأداء
 */
router.get('/performance/:repositoryId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { repositoryId } = req.params;
    const issues = await internalDevService.detectPerformanceIssues(repositoryId);
    
    res.json({
      success: true,
      data: {
        issues,
        summary: {
          total: issues.length,
          critical: issues.filter(i => i.severity === 'critical').length,
          high: issues.filter(i => i.severity === 'high').length,
          medium: issues.filter(i => i.severity === 'medium').length,
          low: issues.filter(i => i.severity === 'low').length,
          autoFixable: issues.filter(i => i.autoFixAvailable).length
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/dev/refactor
 * AI-powered code refactoring
 * إعادة هيكلة الكود بالذكاء الاصطناعي
 */
router.post('/refactor', requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const { code, language, goals } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Code and language are required'
      });
    }
    
    const validGoals = ['performance', 'readability', 'memory', 'security'];
    const selectedGoals = (goals || ['performance', 'readability']).filter(
      (g: string) => validGoals.includes(g)
    );
    
    const result = await internalDevService.refactorCode(code, language, selectedGoals);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/dev/suggestions
 * Get AI code suggestions
 * الحصول على اقتراحات الكود
 */
router.post('/suggestions', requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const { code, cursorPosition, language } = req.body;
    
    if (!code || !cursorPosition || !language) {
      return res.status(400).json({
        success: false,
        message: 'Code, cursor position, and language are required'
      });
    }
    
    const suggestions = await internalDevService.getCodeSuggestions(code, cursorPosition, language);
    
    res.json({
      success: true,
      data: suggestions
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/dev/costs/:repositoryId
 * Analyze and estimate costs
 * تحليل وتقدير التكاليف
 */
router.get('/costs/:repositoryId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { repositoryId } = req.params;
    const costs = await internalDevService.analyzeCosts(repositoryId);
    
    res.json({
      success: true,
      data: costs
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/dev/autofix/:repositoryId
 * Apply auto-fix for an issue
 * تطبيق إصلاح تلقائي
 */
router.post('/autofix/:repositoryId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { repositoryId } = req.params;
    const { issue } = req.body;
    
    if (!issue) {
      return res.status(400).json({
        success: false,
        message: 'Issue data is required'
      });
    }
    
    const result = await internalDevService.applyAutoFix(repositoryId, issue);
    
    res.json({
      success: result.success,
      message: result.message
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/dev/fix-all/:repositoryId
 * Apply all available auto-fixes
 * تطبيق جميع الإصلاحات التلقائية المتاحة
 */
router.post('/fix-all/:repositoryId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { repositoryId } = req.params;
    
    const issues = await internalDevService.detectPerformanceIssues(repositoryId);
    const fixableIssues = issues.filter(i => i.autoFixAvailable);
    
    const results = [];
    for (const issue of fixableIssues) {
      const result = await internalDevService.applyAutoFix(repositoryId, issue);
      results.push({
        issue: issue.description,
        ...result
      });
    }
    
    res.json({
      success: true,
      data: {
        fixed: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        details: results
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

console.log("[InternalDev] Routes initialized | تم تهيئة مسارات التطوير الداخلي");

export default router;
