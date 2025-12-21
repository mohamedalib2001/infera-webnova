/**
 * INFERA WebNova - Platform API Routes
 * Full-Stack Generation, Deployment, and Execution APIs
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db } from './db';
import { storage } from './storage';
import { 
  fullStackGenerator, 
  ProjectSpecSchema, 
  ProjectTemplates, 
  TEMPLATE_CONFIGS 
} from '@shared/core/kernel/fullstack-generator';
import { 
  unifiedDeploymentService, 
  DeploymentProviderFactory 
} from '@shared/core/kernel/cloud-deploy-adapters';
import { 
  sandboxExecutor, 
  ExecutionConfigSchema, 
  ExecutionLanguages 
} from '@shared/core/kernel/sandbox-executor';
import { 
  isdsProjects, 
  devFiles, 
  devDeployRuns, 
  devBuildRuns,
  devWorkspaces 
} from '@shared/schema';
import { eq, desc, and } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

const router = Router();

// ==================== AUTH MIDDLEWARE ====================
const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  if (req.session?.userId) {
    return next();
  }
  if (req.isAuthenticated?.() && req.user) {
    return next();
  }
  return res.status(401).json({ error: 'Authentication required' });
};

// ==================== PROJECT GENERATION ROUTES ====================

/**
 * GET /api/platform/templates
 * Get all available project templates
 */
router.get('/templates', async (req: Request, res: Response) => {
  try {
    const templates = Object.entries(ProjectTemplates).map(([key, value]) => ({
      id: value,
      name: key.replace(/_/g, ' ').toLowerCase(),
      config: TEMPLATE_CONFIGS[value],
    }));
    
    res.json({ templates });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

/**
 * POST /api/platform/generate
 * Generate a new full-stack project from specification
 */
router.post('/generate', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.session?.userId || (req.user as any)?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Validate request body
    const spec = ProjectSpecSchema.parse(req.body);
    
    // Generate project
    const result = await fullStackGenerator.generate(spec);
    
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Generation failed',
        errors: result.errors 
      });
    }
    
    // Create workspace if not exists
    let workspace = await db.query.devWorkspaces.findFirst({
      where: eq(devWorkspaces.ownerId, userId)
    });
    
    if (!workspace) {
      const workspaceInsert = await db.insert(devWorkspaces).values({
        name: 'My Workspace',
        slug: `workspace-${userId.slice(0, 8)}`,
        ownerId: userId,
        status: 'active',
        visibility: 'private',
      }).returning();
      workspace = workspaceInsert[0];
    }
    
    // Create project in database
    const [project] = await db.insert(isdsProjects).values({
      name: spec.name,
      slug: spec.name.toLowerCase().replace(/\s+/g, '-'),
      description: spec.description,
      workspaceId: workspace.id,
      projectType: 'fullstack',
      framework: spec.techStack.frontend,
      language: 'typescript',
      status: 'active',
      buildConfig: {
        buildCommand: result.scripts.build || 'npm run build',
        outputDirectory: '.next',
        installCommand: 'npm install',
        devCommand: result.scripts.dev || 'npm run dev',
        envVars: result.envVars,
      },
      dependencies: result.dependencies,
    }).returning();
    
    // Save generated files
    for (const file of result.files) {
      await db.insert(devFiles).values({
        name: file.path.split('/').pop() || file.path,
        path: file.path,
        projectId: project.id,
        fileType: file.path.includes('.') ? 'file' : 'directory',
        content: file.content,
        sizeBytes: Buffer.byteLength(file.content, 'utf8'),
      });
    }
    
    res.json({
      success: true,
      projectId: project.id,
      project: {
        id: project.id,
        name: project.name,
        slug: project.slug,
        framework: project.framework,
      },
      files: result.files.map(f => ({
        path: f.path,
        type: f.type,
        language: f.language,
      })),
      instructions: result.instructions,
    });
  } catch (error) {
    console.error('[Platform API] Generation error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid specification', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to generate project' });
  }
});

/**
 * POST /api/platform/generate-from-prompt
 * Generate project from natural language description
 */
router.post('/generate-from-prompt', requireAuth, async (req: Request, res: Response) => {
  try {
    const { prompt, language = 'ar' } = req.body;
    
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const result = await fullStackGenerator.generateFromPrompt(prompt, language as 'ar' | 'en');
    
    res.json({
      success: result.success,
      projectId: result.projectId,
      spec: result.spec,
      fileCount: result.files.length,
      errors: result.errors,
    });
  } catch (error) {
    console.error('[Platform API] Generate from prompt error:', error);
    res.status(500).json({ error: 'Failed to generate from prompt' });
  }
});

/**
 * POST /api/platform/preview-spec
 * Preview what will be generated for a specification
 */
router.post('/preview-spec', async (req: Request, res: Response) => {
  try {
    const spec = ProjectSpecSchema.parse(req.body);
    const preview = await fullStackGenerator.previewSpec(spec);
    
    res.json(preview);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid specification', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to preview specification' });
  }
});

// ==================== DEPLOYMENT ROUTES ====================

/**
 * GET /api/platform/deployment/providers
 * Get list of supported deployment providers
 */
router.get('/deployment/providers', async (req: Request, res: Response) => {
  try {
    const providers = DeploymentProviderFactory.getSupportedProviders();
    const registered = unifiedDeploymentService.getRegisteredProviders();
    
    res.json({
      providers: providers.map(p => ({
        id: p,
        name: p.charAt(0).toUpperCase() + p.slice(1),
        isRegistered: registered.includes(p),
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch providers' });
  }
});

/**
 * POST /api/platform/deployment/register-provider
 * Register a deployment provider with credentials
 */
router.post('/deployment/register-provider', requireAuth, async (req: Request, res: Response) => {
  try {
    const { provider, credentials } = req.body;
    
    if (!provider || !credentials) {
      return res.status(400).json({ error: 'Provider and credentials are required' });
    }
    
    await unifiedDeploymentService.registerProvider(provider, credentials);
    
    res.json({ 
      success: true, 
      message: `Provider ${provider} registered successfully` 
    });
  } catch (error) {
    console.error('[Platform API] Register provider error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to register provider' 
    });
  }
});

/**
 * POST /api/platform/deployment/deploy
 * Deploy a project to a provider
 */
router.post('/deployment/deploy', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.session?.userId || (req.user as any)?.claims?.sub;
    const { projectId, provider, environment = 'production', customDomain } = req.body;
    
    if (!projectId || !provider) {
      return res.status(400).json({ error: 'Project ID and provider are required' });
    }
    
    // Get project and files
    const project = await db.query.isdsProjects.findFirst({
      where: eq(isdsProjects.id, projectId)
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const files = await db.query.devFiles.findMany({
      where: eq(devFiles.projectId, projectId)
    });
    
    // Create build run record
    const [buildRun] = await db.insert(devBuildRuns).values({
      buildNumber: Date.now(),
      buildCommand: project.buildConfig?.buildCommand || 'npm run build',
      projectId,
      workspaceId: project.workspaceId,
      triggeredBy: userId,
      trigger: 'manual',
      status: 'running',
      startedAt: new Date(),
    }).returning();
    
    // Deploy
    const result = await unifiedDeploymentService.deploy({
      projectId,
      projectName: project.name,
      provider,
      environment,
      buildArtifacts: files.map(f => ({
        path: f.path,
        content: f.content || '',
      })),
      envVars: project.buildConfig?.envVars || {},
      customDomain,
    });
    
    // Update build run
    await db.update(devBuildRuns)
      .set({
        status: result.success ? 'success' : 'failed',
        completedAt: new Date(),
        durationMs: result.duration,
      })
      .where(eq(devBuildRuns.id, buildRun.id));
    
    // Create deploy run record
    await db.insert(devDeployRuns).values({
      deployNumber: Date.now(),
      projectId,
      workspaceId: project.workspaceId,
      buildRunId: buildRun.id,
      triggeredBy: userId,
      provider,
      environment,
      status: result.success ? 'success' : 'failed',
      deployUrl: result.url,
      startedAt: new Date(),
      completedAt: new Date(),
      durationMs: result.duration,
    });
    
    // Update project with deploy config
    await db.update(isdsProjects)
      .set({
        deployConfig: {
          provider,
          region: 'auto',
          domain: result.url,
          customDomains: customDomain ? [customDomain] : [],
          ssl: true,
          autoDeployBranch: 'main',
        },
        lastDeployAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(isdsProjects.id, projectId));
    
    res.json({
      success: result.success,
      deploymentId: result.deploymentId,
      url: result.url,
      environment,
      duration: result.duration,
      errors: result.errors,
    });
  } catch (error) {
    console.error('[Platform API] Deploy error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Deployment failed' 
    });
  }
});

/**
 * POST /api/platform/deployment/rollback
 * Rollback a deployment
 */
router.post('/deployment/rollback', requireAuth, async (req: Request, res: Response) => {
  try {
    const { provider, deploymentId } = req.body;
    
    if (!provider || !deploymentId) {
      return res.status(400).json({ error: 'Provider and deployment ID are required' });
    }
    
    const result = await unifiedDeploymentService.rollback(provider, deploymentId);
    
    res.json({
      success: result.success,
      message: result.success ? 'Rollback successful' : 'Rollback failed',
      errors: result.errors,
    });
  } catch (error) {
    console.error('[Platform API] Rollback error:', error);
    res.status(500).json({ error: 'Rollback failed' });
  }
});

/**
 * GET /api/platform/deployment/status/:provider/:deploymentId
 * Get deployment status
 */
router.get('/deployment/status/:provider/:deploymentId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { provider, deploymentId } = req.params;
    
    const status = await unifiedDeploymentService.getStatus(provider, deploymentId);
    
    res.json(status);
  } catch (error) {
    console.error('[Platform API] Status error:', error);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

// ==================== CODE EXECUTION ROUTES ====================

/**
 * GET /api/platform/execution/languages
 * Get supported execution languages
 */
router.get('/execution/languages', async (req: Request, res: Response) => {
  try {
    const languages = sandboxExecutor.getAvailableLanguages();
    const packageManagers = sandboxExecutor.getSupportedPackageManagers();
    
    res.json({ languages, packageManagers });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch languages' });
  }
});

/**
 * POST /api/platform/execution/run
 * Execute code in sandbox
 */
router.post('/execution/run', requireAuth, async (req: Request, res: Response) => {
  try {
    const config = ExecutionConfigSchema.parse(req.body);
    
    const result = await sandboxExecutor.execute(config);
    
    res.json(result);
  } catch (error) {
    console.error('[Platform API] Execution error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid configuration', details: error.errors });
    }
    res.status(500).json({ error: 'Execution failed' });
  }
});

/**
 * POST /api/platform/execution/run-file
 * Execute a file from project
 */
router.post('/execution/run-file', requireAuth, async (req: Request, res: Response) => {
  try {
    const { projectId, filePath, options } = req.body;
    
    if (!projectId || !filePath) {
      return res.status(400).json({ error: 'Project ID and file path are required' });
    }
    
    // Get file content
    const file = await db.query.devFiles.findFirst({
      where: and(
        eq(devFiles.projectId, projectId),
        eq(devFiles.path, filePath)
      )
    });
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Set file in executor
    (sandboxExecutor as any).setProjectFile?.(projectId, filePath, file.content || '');
    
    const result = await sandboxExecutor.executeFile(projectId, filePath, options);
    
    res.json(result);
  } catch (error) {
    console.error('[Platform API] Run file error:', error);
    res.status(500).json({ error: 'Execution failed' });
  }
});

/**
 * POST /api/platform/execution/command
 * Run a shell command
 */
router.post('/execution/command', requireAuth, async (req: Request, res: Response) => {
  try {
    const { projectId, command, cwd } = req.body;
    
    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }
    
    const result = await sandboxExecutor.runCommand(projectId, command, cwd);
    
    res.json(result);
  } catch (error) {
    console.error('[Platform API] Command error:', error);
    res.status(500).json({ error: 'Command execution failed' });
  }
});

/**
 * POST /api/platform/execution/install-package
 * Install a package for a project
 */
router.post('/execution/install-package', requireAuth, async (req: Request, res: Response) => {
  try {
    const { projectId, packageName, language = 'nodejs' } = req.body;
    
    if (!projectId || !packageName) {
      return res.status(400).json({ error: 'Project ID and package name are required' });
    }
    
    const result = await sandboxExecutor.installPackage(
      projectId, 
      packageName, 
      language as 'nodejs' | 'python' | 'php' | 'bash' | 'typescript' | 'go' | 'rust'
    );
    
    res.json(result);
  } catch (error) {
    console.error('[Platform API] Install package error:', error);
    res.status(500).json({ error: 'Package installation failed' });
  }
});

// ==================== PROJECT MANAGEMENT ROUTES ====================

/**
 * GET /api/platform/projects
 * Get user's projects
 */
router.get('/projects', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.session?.userId || (req.user as any)?.claims?.sub;
    
    // Get user's workspaces
    const workspaces = await db.query.devWorkspaces.findMany({
      where: eq(devWorkspaces.ownerId, userId)
    });
    
    if (workspaces.length === 0) {
      return res.json({ projects: [] });
    }
    
    // Get projects from all workspaces
    const workspaceIds = workspaces.map(w => w.id);
    const projects = await db.query.isdsProjects.findMany({
      where: sql`${isdsProjects.workspaceId} = ANY(${workspaceIds})`,
      orderBy: desc(isdsProjects.updatedAt),
    });
    
    res.json({ projects });
  } catch (error) {
    console.error('[Platform API] Get projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

/**
 * GET /api/platform/projects/:id
 * Get project details
 */
router.get('/projects/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const project = await db.query.isdsProjects.findFirst({
      where: eq(isdsProjects.id, id)
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const files = await db.query.devFiles.findMany({
      where: eq(devFiles.projectId, id)
    });
    
    res.json({ project, files });
  } catch (error) {
    console.error('[Platform API] Get project error:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

/**
 * GET /api/platform/projects/:id/deployments
 * Get project deployment history
 */
router.get('/projects/:id/deployments', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const deployments = await db.query.devDeployRuns.findMany({
      where: eq(devDeployRuns.projectId, id),
      orderBy: desc(devDeployRuns.createdAt),
      limit: 20,
    });
    
    res.json({ deployments });
  } catch (error) {
    console.error('[Platform API] Get deployments error:', error);
    res.status(500).json({ error: 'Failed to fetch deployments' });
  }
});

/**
 * GET /api/platform/projects/:id/builds
 * Get project build history
 */
router.get('/projects/:id/builds', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const builds = await db.query.devBuildRuns.findMany({
      where: eq(devBuildRuns.projectId, id),
      orderBy: desc(devBuildRuns.createdAt),
      limit: 20,
    });
    
    res.json({ builds });
  } catch (error) {
    console.error('[Platform API] Get builds error:', error);
    res.status(500).json({ error: 'Failed to fetch builds' });
  }
});

// ==================== EXPORT ROUTER ====================
export function registerPlatformApiRoutes(app: any) {
  app.use('/api/platform', router);
  console.log('[Platform API] Routes registered at /api/platform');
}

export default router;
