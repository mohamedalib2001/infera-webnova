/**
 * Reverse Sync API Routes - مسارات واجهة المزامنة العكسية
 * 
 * Endpoints for managing bidirectional sync with Replit
 */

import { Router, Request, Response, NextFunction } from 'express';
import { reverseSyncService } from '../services/reverse-sync-service';

const router = Router();

// Authentication middleware
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated?.() || !req.user) {
    return res.status(401).json({ error: 'Authentication required | المصادقة مطلوبة' });
  }
  next();
};

/**
 * GET /api/sync/status/:repositoryId
 * Get sync status for a repository
 * الحصول على حالة المزامنة للمستودع
 */
router.get('/status/:repositoryId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { repositoryId } = req.params;
    const status = await reverseSyncService.getSyncStatus(repositoryId);
    
    res.json({
      success: true,
      status
    });
  } catch (error: any) {
    console.error('[ReverseSync] Status error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/sync/config/:repositoryId
 * Get sync configuration
 * الحصول على تكوين المزامنة
 */
router.get('/config/:repositoryId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { repositoryId } = req.params;
    const config = await reverseSyncService.getSyncConfig(repositoryId);
    
    res.json({
      success: true,
      config
    });
  } catch (error: any) {
    console.error('[ReverseSync] Config error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/sync/configure
 * Configure sync settings
 * تكوين إعدادات المزامنة
 */
router.post('/configure', requireAuth, async (req: Request, res: Response) => {
  try {
    const { repositoryId, replitProjectUrl, syncMode, autoSyncInterval } = req.body;
    
    if (!repositoryId) {
      return res.status(400).json({ error: 'Repository ID required | معرف المستودع مطلوب' });
    }
    
    const config = await reverseSyncService.configureSyncSettings(repositoryId, {
      replitProjectUrl: replitProjectUrl || '',
      syncMode: syncMode || 'manual',
      autoSyncInterval
    });
    
    res.json({
      success: true,
      config
    });
  } catch (error: any) {
    console.error('[ReverseSync] Configure error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/sync/preview
 * Preview changes before syncing to Replit
 * معاينة التغييرات قبل المزامنة
 */
router.post('/preview', requireAuth, async (req: Request, res: Response) => {
  try {
    const { repositoryId } = req.body;
    
    if (!repositoryId) {
      return res.status(400).json({ error: 'Repository ID required | معرف المستودع مطلوب' });
    }
    
    const preview = await reverseSyncService.previewSyncToReplit(repositoryId);
    
    res.json({
      success: true,
      preview
    });
  } catch (error: any) {
    console.error('[ReverseSync] Preview error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/sync/push
 * Push changes to Replit
 * دفع التغييرات إلى Replit
 */
router.post('/push', requireAuth, async (req: Request, res: Response) => {
  try {
    const { repositoryId, selectedFiles } = req.body;
    const user = req.user as any;
    
    if (!repositoryId) {
      return res.status(400).json({ error: 'Repository ID required | معرف المستودع مطلوب' });
    }
    
    const event = await reverseSyncService.pushToReplit(
      repositoryId,
      user.email || 'system',
      selectedFiles
    );
    
    res.json({
      success: true,
      event
    });
  } catch (error: any) {
    console.error('[ReverseSync] Push error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/sync/pull
 * Pull changes from Replit
 * سحب التغييرات من Replit
 */
router.post('/pull', requireAuth, async (req: Request, res: Response) => {
  try {
    const { repositoryId } = req.body;
    const user = req.user as any;
    
    if (!repositoryId) {
      return res.status(400).json({ error: 'Repository ID required | معرف المستودع مطلوب' });
    }
    
    const event = await reverseSyncService.pullFromReplit(
      repositoryId,
      user.email || 'system'
    );
    
    res.json({
      success: true,
      event
    });
  } catch (error: any) {
    console.error('[ReverseSync] Pull error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/sync/deprecate
 * Deprecate Replit connection completely
 * إهمال اتصال Replit بالكامل
 */
router.post('/deprecate', requireAuth, async (req: Request, res: Response) => {
  try {
    const { repositoryId } = req.body;
    const user = req.user as any;
    
    if (!repositoryId) {
      return res.status(400).json({ error: 'Repository ID required | معرف المستودع مطلوب' });
    }
    
    const result = await reverseSyncService.deprecateReplitConnection(
      repositoryId,
      user.email || 'system'
    );
    
    res.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('[ReverseSync] Deprecate error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/sync/history/:repositoryId
 * Get sync history
 * الحصول على سجل المزامنة
 */
router.get('/history/:repositoryId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { repositoryId } = req.params;
    const history = await reverseSyncService.getSyncHistory(repositoryId);
    
    res.json({
      success: true,
      history
    });
  } catch (error: any) {
    console.error('[ReverseSync] History error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
