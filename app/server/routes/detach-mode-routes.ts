/**
 * Detach Mode API Routes - مسارات واجهة وضع الاستقلال
 * 
 * Endpoints for analyzing and executing Replit detachment
 */

import { Router, Request, Response, NextFunction } from 'express';
import { detachModeService } from '../services/detach-mode-service';

const router = Router();

// Authentication middleware
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated?.() || !req.user) {
    return res.status(401).json({ error: 'Authentication required | المصادقة مطلوبة' });
  }
  next();
};

/**
 * POST /api/detach/analyze
 * Analyze repository for Replit dependencies
 * تحليل المستودع لتبعيات Replit
 */
router.post('/analyze', requireAuth, async (req: Request, res: Response) => {
  try {
    const { repositoryId } = req.body;
    
    if (!repositoryId) {
      return res.status(400).json({ error: 'Repository ID required | معرف المستودع مطلوب' });
    }
    
    const analysis = await detachModeService.analyzeReplitDependencies(repositoryId);
    
    res.json({
      success: true,
      analysis
    });
  } catch (error: any) {
    console.error('[DetachMode] Analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/detach/execute
 * Execute detachment from Replit
 * تنفيذ الفصل عن Replit
 * 
 * SECURITY: Re-analyze server-side to prevent client-supplied analysis injection
 */
router.post('/execute', requireAuth, async (req: Request, res: Response) => {
  try {
    const { repositoryId } = req.body;
    const user = req.user as any;
    
    if (!repositoryId) {
      return res.status(400).json({ 
        error: 'Repository ID required | معرف المستودع مطلوب' 
      });
    }
    
    // SECURITY: Always re-analyze server-side to prevent injection attacks
    // Never trust client-supplied analysis data
    const freshAnalysis = await detachModeService.analyzeReplitDependencies(repositoryId);
    
    const result = await detachModeService.executeDetach(
      repositoryId,
      freshAnalysis,
      user.email || 'system'
    );
    
    res.json({
      success: true,
      result
    });
  } catch (error: any) {
    console.error('[DetachMode] Execute error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/detach/deployment-package/:repositoryId
 * Generate deployment package files
 * توليد ملفات حزمة النشر
 */
router.get('/deployment-package/:repositoryId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { repositoryId } = req.params;
    
    const package_ = await detachModeService.generateDeploymentPackage(repositoryId);
    
    res.json({
      success: true,
      package: package_
    });
  } catch (error: any) {
    console.error('[DetachMode] Package generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/detach/status/:repositoryId
 * Check if repository is already detached
 * التحقق من حالة الفصل
 */
router.get('/status/:repositoryId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { repositoryId } = req.params;
    
    const analysis = await detachModeService.analyzeReplitDependencies(repositoryId);
    
    res.json({
      success: true,
      isDetached: analysis.totalDependencies === 0,
      dependencyCount: analysis.totalDependencies,
      criticalCount: analysis.criticalCount
    });
  } catch (error: any) {
    console.error('[DetachMode] Status error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
