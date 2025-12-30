/**
 * Blueprint Compiler API Routes - مسارات مترجم المخططات البنائية
 * 
 * API endpoints for the Blueprint Compiler system.
 * Allows building complete digital platforms from requirements.
 */

import { Router, Request, Response } from 'express';
import { buildOrchestrator, blueprintParser, Blueprint, BlueprintSector } from '../services/blueprint-compiler';

const router = Router();

// Helper: Require authentication
function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.session?.userId) {
    return res.status(401).json({ 
      success: false, 
      error: 'Authentication required',
      errorAr: 'يجب تسجيل الدخول'
    });
  }
  next();
}

// Helper: Require owner role (ROOT_OWNER or sovereign roles)
function requireOwner(req: Request, res: Response, next: Function) {
  if (!req.session?.userId) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  
  // Check for owner roles - no hardcoded emails
  const ownerRoles = ['ROOT_OWNER', 'sovereign', 'owner'];
  if (!ownerRoles.includes(req.session.role || '')) {
    return res.status(403).json({ 
      success: false, 
      error: 'Owner access required',
      errorAr: 'يتطلب صلاحيات المالك'
    });
  }
  next();
}

/**
 * POST /api/blueprint/build
 * Start a new build from natural language requirements
 */
router.post('/build', requireAuth, async (req: Request, res: Response) => {
  try {
    const { requirements, sector, locale, deployTarget } = req.body;
    
    if (!requirements || typeof requirements !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Requirements text is required',
        errorAr: 'يجب تقديم نص المتطلبات'
      });
    }
    
    const result = await buildOrchestrator.startBuildFromRequirements(requirements, {
      sector,
      locale: locale || 'ar',
      userId: req.session.userId,
      deployTarget
    });
    
    res.json({
      success: true,
      blueprintId: result.blueprintId,
      buildState: result.buildState,
      message: 'Build started successfully',
      messageAr: 'بدأ البناء بنجاح'
    });
  } catch (error: any) {
    console.error('[BlueprintCompiler] Build error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      errorAr: 'فشل بدء البناء'
    });
  }
});

/**
 * POST /api/blueprint/parse
 * Parse requirements into a Blueprint without building
 */
router.post('/parse', requireAuth, async (req: Request, res: Response) => {
  try {
    const { requirements, sector, locale } = req.body;
    
    if (!requirements || typeof requirements !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Requirements text is required'
      });
    }
    
    const blueprint = await blueprintParser.parseFromNaturalLanguage(
      requirements,
      sector as BlueprintSector,
      locale || 'ar'
    );
    
    res.json({
      success: true,
      blueprint,
      message: 'Requirements parsed successfully',
      messageAr: 'تم تحليل المتطلبات بنجاح'
    });
  } catch (error: any) {
    console.error('[BlueprintCompiler] Parse error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/blueprint/:id
 * Get blueprint by ID
 */
router.get('/:id', requireAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const blueprint = buildOrchestrator.getBlueprint(id);
    if (!blueprint) {
      return res.status(404).json({
        success: false,
        error: 'Blueprint not found',
        errorAr: 'المخطط غير موجود'
      });
    }
    
    res.json({
      success: true,
      blueprint
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/blueprint/:id/status
 * Get build status for a blueprint
 */
router.get('/:id/status', requireAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const buildState = buildOrchestrator.getBuildState(id);
    if (!buildState) {
      return res.status(404).json({
        success: false,
        error: 'Build state not found'
      });
    }
    
    res.json({
      success: true,
      buildState
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/blueprint/:id/artifacts
 * Get generated artifacts for a blueprint
 */
router.get('/:id/artifacts', requireAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const artifacts = buildOrchestrator.getArtifacts(id);
    if (!artifacts) {
      return res.status(404).json({
        success: false,
        error: 'Artifacts not found'
      });
    }
    
    // Return file list without content for efficiency
    const fileList = {
      schema: artifacts.schema.map(f => ({ path: f.path, type: f.type })),
      backend: artifacts.backend.map(f => ({ path: f.path, type: f.type })),
      frontend: artifacts.frontend.map(f => ({ path: f.path, type: f.type })),
      infrastructure: artifacts.infrastructure.map(f => ({ path: f.path, type: f.type })),
      tests: artifacts.tests.map(f => ({ path: f.path, type: f.type })),
      documentation: artifacts.documentation.map(f => ({ path: f.path, type: f.type }))
    };
    
    res.json({
      success: true,
      artifacts: fileList,
      totalFiles: 
        artifacts.schema.length +
        artifacts.backend.length +
        artifacts.frontend.length +
        artifacts.infrastructure.length +
        artifacts.tests.length +
        artifacts.documentation.length
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/blueprint/:id/artifact/:path
 * Get specific artifact content
 */
router.get('/:id/artifact/*', requireAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const filePath = req.params[0]; // Get the wildcard path
    
    const content = buildOrchestrator.getArtifactContent(id, filePath);
    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Artifact not found'
      });
    }
    
    res.json({
      success: true,
      path: filePath,
      content
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/blueprint/list
 * List all blueprints
 */
router.get('/', requireAuth, (req: Request, res: Response) => {
  try {
    const blueprints = buildOrchestrator.getAllBlueprints();
    
    // Return summary without full data model
    const summary = blueprints.map(bp => ({
      id: bp.id,
      name: bp.name,
      nameAr: bp.nameAr,
      sector: bp.sector,
      status: bp.status,
      createdAt: bp.createdAt,
      entityCount: bp.dataModel?.entities?.length || 0,
      hasArtifacts: !!bp.artifacts
    }));
    
    res.json({
      success: true,
      blueprints: summary,
      total: blueprints.length
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/blueprint/:id/deploy
 * Deploy a blueprint to a target
 */
router.post('/:id/deploy', requireOwner, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { targetId } = req.body;
    
    const blueprint = buildOrchestrator.getBlueprint(id);
    if (!blueprint) {
      return res.status(404).json({
        success: false,
        error: 'Blueprint not found'
      });
    }
    
    if (!blueprint.artifacts) {
      return res.status(400).json({
        success: false,
        error: 'Blueprint has not been built yet',
        errorAr: 'لم يتم بناء المخطط بعد'
      });
    }
    
    // Start deployment
    const result = await buildOrchestrator.startBuildFromBlueprint(blueprint, targetId);
    
    res.json({
      success: true,
      message: 'Deployment started',
      messageAr: 'بدأ النشر',
      buildState: result.buildState
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/blueprint/sectors
 * Get available sectors
 */
router.get('/meta/sectors', (req: Request, res: Response) => {
  res.json({
    success: true,
    sectors: [
      { id: 'financial', name: 'Financial', nameAr: 'مالي', icon: 'DollarSign' },
      { id: 'healthcare', name: 'Healthcare', nameAr: 'صحي', icon: 'Heart' },
      { id: 'government', name: 'Government', nameAr: 'حكومي', icon: 'Building' },
      { id: 'education', name: 'Education', nameAr: 'تعليمي', icon: 'GraduationCap' },
      { id: 'enterprise', name: 'Enterprise', nameAr: 'مؤسسات', icon: 'Briefcase' },
      { id: 'ecommerce', name: 'E-Commerce', nameAr: 'تجارة إلكترونية', icon: 'ShoppingCart' },
      { id: 'social', name: 'Social', nameAr: 'اجتماعي', icon: 'Users' },
      { id: 'custom', name: 'Custom', nameAr: 'مخصص', icon: 'Settings' }
    ]
  });
});

export default router;
