/**
 * Replit Import Routes | مسارات استيراد Replit
 * 
 * API endpoints for:
 * 1. Connecting to Replit (OAuth/Token)
 * 2. Listing user's Repls
 * 3. Importing Repls to sovereign storage
 */

import { Router, Request, Response } from 'express';
import { replitImportService } from '../services/replit-import-service';

const router = Router();

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const rateLimit = (req: Request, res: Response, next: Function) => {
  const key = req.session?.user?.email || req.ip || 'anonymous';
  const now = Date.now();
  const limit = rateLimitMap.get(key);
  
  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + 60000 });
    return next();
  }
  
  if (limit.count >= 30) {
    return res.status(429).json({
      success: false,
      message: "Rate limit exceeded | تم تجاوز حد الطلبات"
    });
  }
  
  limit.count++;
  next();
};

// Auth check
const requireAuth = (req: Request, res: Response, next: Function) => {
  if (!req.session?.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required | المصادقة مطلوبة"
    });
  }
  next();
};

// ============ Connection Endpoints ============

/**
 * GET /api/replit/status
 * Check connection status
 */
router.get('/status', requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const userId = req.session?.user?.id;
    const connection = await replitImportService.getConnection(userId);
    
    res.json({
      success: true,
      data: {
        connected: !!connection && connection.isActive,
        username: connection?.replitUsername,
        connectedAt: connection?.connectedAt
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/replit/oauth/url
 * Get OAuth authorization URL
 */
router.get('/oauth/url', requireAuth, rateLimit, (req: Request, res: Response) => {
  try {
    const redirectUri = req.query.redirect_uri as string || `${req.protocol}://${req.get('host')}/api/replit/oauth/callback`;
    const state = Buffer.from(JSON.stringify({
      userId: req.session?.user?.id,
      timestamp: Date.now()
    })).toString('base64');

    const url = replitImportService.getOAuthUrl(redirectUri, state);
    
    res.json({
      success: true,
      data: { url, state }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/replit/oauth/callback
 * OAuth callback handler
 */
router.get('/oauth/callback', rateLimit, async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    
    if (!code || !state) {
      return res.status(400).json({
        success: false,
        message: "Missing code or state"
      });
    }

    // Decode state
    let stateData;
    try {
      stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid state"
      });
    }

    const redirectUri = `${req.protocol}://${req.get('host')}/api/replit/oauth/callback`;
    const tokens = await replitImportService.exchangeOAuthCode(code as string, redirectUri);
    
    if (!tokens) {
      return res.status(400).json({
        success: false,
        message: "Failed to exchange code for token"
      });
    }

    // Connect with the token
    const result = await replitImportService.connectWithToken(stateData.userId, tokens.accessToken);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    // Redirect to frontend with success
    res.redirect('/sovereign-core?replit=connected');
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/replit/connect
 * Connect using access token (manual input)
 */
router.post('/connect', requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const { accessToken } = req.body;
    const userId = req.session?.user?.id;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: "Access token required | رمز الوصول مطلوب"
      });
    }

    const result = await replitImportService.connectWithToken(userId, accessToken);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || "Connection failed | فشل الاتصال"
      });
    }

    res.json({
      success: true,
      message: "Connected to Replit | تم الاتصال بـ Replit",
      data: {
        username: result.connection?.replitUsername,
        connectedAt: result.connection?.connectedAt
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
 * POST /api/replit/disconnect
 * Disconnect from Replit
 */
router.post('/disconnect', requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const userId = req.session?.user?.id;
    await replitImportService.disconnect(userId);
    
    res.json({
      success: true,
      message: "Disconnected from Replit | تم قطع الاتصال عن Replit"
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ Repls Browsing ============

/**
 * GET /api/replit/repls
 * List user's Repls
 */
router.get('/repls', requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const userId = req.session?.user?.id;
    const limit = parseInt(req.query.limit as string) || 50;
    const search = req.query.search as string | undefined;

    const repls = await replitImportService.listRepls(userId, { limit, search });
    
    res.json({
      success: true,
      message: `Found ${repls.length} Repls | تم العثور على ${repls.length} مشروع`,
      data: repls
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/replit/repls/:id
 * Get Repl details
 */
router.get('/repls/:id', requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const userId = req.session?.user?.id;
    const replId = req.params.id;

    const repl = await replitImportService.getReplDetails(userId, replId);
    
    if (!repl) {
      return res.status(404).json({
        success: false,
        message: "Repl not found | المشروع غير موجود"
      });
    }

    res.json({
      success: true,
      data: repl
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============ Import Operations ============

/**
 * POST /api/replit/import
 * Import a Repl to sovereign storage
 */
router.post('/import', requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const userId = req.session?.user?.id;
    const userEmail = req.session?.user?.email || 'import@infera.io';
    const { replId, newName, preserveHistory } = req.body;

    if (!replId) {
      return res.status(400).json({
        success: false,
        message: "Repl ID required | معرف المشروع مطلوب"
      });
    }

    const result = await replitImportService.importRepl(userId, userEmail, replId, {
      newName,
      preserveHistory
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
        messageAr: result.messageAr,
        errors: result.errors
      });
    }

    res.json({
      success: true,
      message: result.message,
      messageAr: result.messageAr,
      data: {
        repositoryId: result.repositoryId,
        internalId: result.internalId,
        sovereignId: result.sovereignId,
        filesImported: result.filesImported,
        breakdown: result.breakdown,
        analysis: result.analysis,
        sovereignty: result.sovereignty
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
 * POST /api/replit/sync/:repositoryId
 * Pull latest changes from Replit
 */
router.post('/sync/:repositoryId', requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const userId = req.session?.user?.id;
    const { repositoryId } = req.params;

    const result = await replitImportService.pullFromReplit(userId, repositoryId);
    
    res.json({
      success: result.success,
      message: result.message,
      data: {
        filesUpdated: result.filesUpdated,
        filesAdded: result.filesAdded,
        filesDeleted: result.filesDeleted
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
 * GET /api/replit/history
 * Get import history
 */
router.get('/history', requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'default';
    const history = await replitImportService.getImportHistory(tenantId);
    
    res.json({
      success: true,
      data: history
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============ Independence Engine Endpoints ============

/**
 * POST /api/replit/independence/:repositoryId
 * Apply independent runtime configuration to repository
 * تطبيق إعدادات التشغيل المستقل على المستودع
 */
router.post('/independence/:repositoryId', requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const userId = req.session?.user?.id;
    const userEmail = req.session?.user?.email || 'independence@infera.io';
    const { repositoryId } = req.params;

    if (!repositoryId) {
      return res.status(400).json({
        success: false,
        message: "Repository ID required | معرف المستودع مطلوب"
      });
    }

    const result = await replitImportService.applyIndependentRuntime(userId, userEmail, repositoryId);

    res.json({
      success: result.success,
      message: result.message,
      messageAr: result.messageAr,
      data: {
        filesCreated: result.filesCreated,
        replacements: result.replacements
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
 * GET /api/replit/independence/preview/:repositoryId
 * Preview independent runtime configuration without applying
 * معاينة إعدادات التشغيل المستقل بدون تطبيق
 */
router.get('/independence/preview/:repositoryId', requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const { repositoryId } = req.params;

    // Import sovereign git engine
    const { sovereignGitEngine } = await import('../lib/sovereign-git-engine');

    const repo = await sovereignGitEngine.getRepository(repositoryId);
    if (!repo) {
      return res.status(404).json({
        success: false,
        message: "Repository not found | المستودع غير موجود"
      });
    }

    // Get files and analyze with real analysis
    const repoFiles = await sovereignGitEngine.getRepositoryFiles(repositoryId, 'main');
    const files = repoFiles.map((f: any) => ({
      path: f.path,
      content: f.content || '',
      type: f.type === 'tree' ? 'directory' as const : 'file' as const,
      size: f.size
    }));

    // Perform full project analysis
    const analysis = replitImportService.analyzeProject(files, {
      id: repo.id,
      slug: repo.name,
      title: repo.name,
      language: repo.language || 'javascript',
      isPrivate: repo.visibility === 'private',
      url: '',
      createdAt: repo.createdAt?.toISOString() || '',
      updatedAt: repo.updatedAt?.toISOString() || ''
    });

    // Generate runtime config with real analysis
    const runtimeConfig = replitImportService.generateIndependentRuntime(files, analysis);

    res.json({
      success: true,
      data: {
        runtimeType: runtimeConfig.runtimeType,
        portConfig: runtimeConfig.portConfig,
        filesToCreate: [
          'Dockerfile',
          'docker-compose.yml',
          'start.sh',
          '.env.template',
          '.dockerignore',
          'INDEPENDENCE_GUIDE.md'
        ],
        envVariables: runtimeConfig.envConfig.variables,
        replacementsNeeded: runtimeConfig.replacements,
        analysis: {
          languages: analysis.languages,
          frameworks: analysis.frameworks,
          technologies: analysis.technologies,
          securityScore: analysis.security.score,
          portabilityScore: analysis.portability.score
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

console.log("[ReplitImport] Routes initialized | تم تهيئة مسارات استيراد Replit");

export default router;
