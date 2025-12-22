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

// ==================== AI ORCHESTRATOR ROUTES ====================
// Import AI Orchestrator
const getAIOrchestrator = async () => {
  const { aiOrchestrator } = await import('@shared/core/kernel/ai-orchestrator');
  return aiOrchestrator;
};

/**
 * POST /api/platform/ai/orchestrate
 * Full AI orchestration pipeline - from natural language to complete project
 */
router.post('/ai/orchestrate', requireAuth, async (req: Request, res: Response) => {
  try {
    const { prompt, language = 'ar', customStack, validateCode = true, generateTests = false } = req.body;
    
    if (!prompt || typeof prompt !== 'string' || prompt.length < 10) {
      return res.status(400).json({ 
        error: language === 'ar' ? 'يرجى تقديم وصف كافٍ للمشروع' : 'Please provide a sufficient project description' 
      });
    }
    
    console.log(`[AI Orchestrator] Starting orchestration for: ${prompt.substring(0, 50)}...`);
    
    const orchestrator = await getAIOrchestrator();
    const result = await orchestrator.orchestrate(prompt, {
      language,
      customStack,
      validateCode,
      generateTests,
    });
    
    console.log(`[AI Orchestrator] Result: ${result.success ? 'Success' : 'Failed'}, Files: ${result.files.length}`);
    
    res.json(result);
  } catch (error: any) {
    console.error('[AI Orchestrator] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/platform/ai/analyze-intent
 * Analyze user intent from natural language
 */
router.post('/ai/analyze-intent', requireAuth, async (req: Request, res: Response) => {
  try {
    const { prompt, language = 'ar' } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt required' });
    }
    
    const orchestrator = await getAIOrchestrator();
    const intent = await orchestrator.analyzeIntent(prompt, language);
    res.json({ intent });
  } catch (error: any) {
    console.error('[AI Orchestrator] Intent analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/platform/ai/generate-blueprint
 * Generate architecture blueprint from intent
 */
router.post('/ai/generate-blueprint', requireAuth, async (req: Request, res: Response) => {
  try {
    const { intent, customization } = req.body;
    
    if (!intent) {
      return res.status(400).json({ error: 'Intent required' });
    }
    
    const orchestrator = await getAIOrchestrator();
    const blueprint = await orchestrator.generateBlueprint(intent, customization);
    res.json({ blueprint });
  } catch (error: any) {
    console.error('[AI Orchestrator] Blueprint generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/platform/ai/generate-code
 * Generate code files from blueprint
 */
router.post('/ai/generate-code', requireAuth, async (req: Request, res: Response) => {
  try {
    const { blueprint, intent } = req.body;
    
    if (!blueprint || !intent) {
      return res.status(400).json({ error: 'Blueprint and intent required' });
    }
    
    const orchestrator = await getAIOrchestrator();
    const files = await orchestrator.generateCode(blueprint, intent);
    res.json({ files });
  } catch (error: any) {
    console.error('[AI Orchestrator] Code generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== PROJECT RUNTIME ROUTES ====================
const getProjectRuntime = async () => {
  const { projectRuntime } = await import('@shared/core/kernel/project-runtime');
  return projectRuntime;
};

/**
 * POST /api/platform/runtime/initialize
 * Initialize a project runtime
 */
router.post('/runtime/initialize', requireAuth, async (req: Request, res: Response) => {
  try {
    const { projectId, basePath, environment } = req.body;
    if (!projectId || !basePath) {
      return res.status(400).json({ error: 'projectId and basePath required' });
    }
    
    const runtime = await getProjectRuntime();
    const state = await runtime.initialize(projectId, { basePath, environment });
    res.json({ state });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/platform/runtime/:projectId/state
 * Get project runtime state
 */
router.get('/runtime/:projectId/state', requireAuth, async (req: Request, res: Response) => {
  try {
    const runtime = await getProjectRuntime();
    const state = runtime.getState(req.params.projectId);
    if (!state) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ state });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/platform/runtime/:projectId/build
 * Build project
 */
router.post('/runtime/:projectId/build', requireAuth, async (req: Request, res: Response) => {
  try {
    const runtime = await getProjectRuntime();
    const result = await runtime.build(req.params.projectId, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/platform/runtime/:projectId/run
 * Run project
 */
router.post('/runtime/:projectId/run', requireAuth, async (req: Request, res: Response) => {
  try {
    const runtime = await getProjectRuntime();
    const result = await runtime.run(req.params.projectId, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/platform/runtime/:projectId/stop
 * Stop project
 */
router.post('/runtime/:projectId/stop', requireAuth, async (req: Request, res: Response) => {
  try {
    const runtime = await getProjectRuntime();
    const result = await runtime.stop(req.params.projectId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/platform/runtime/:projectId/execute
 * Execute command in project context
 */
router.post('/runtime/:projectId/execute', requireAuth, async (req: Request, res: Response) => {
  try {
    const { command, cwd, timeout, env } = req.body;
    if (!command) {
      return res.status(400).json({ error: 'Command required' });
    }
    
    const runtime = await getProjectRuntime();
    const result = await runtime.executeCommand(req.params.projectId, command, { cwd, timeout, env });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/platform/runtime/active
 * Get all active project runtimes
 */
router.get('/runtime/active', requireAuth, async (req: Request, res: Response) => {
  try {
    const runtime = await getProjectRuntime();
    const projects = runtime.getActiveProjects();
    res.json({ projects });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== AI COPILOT ROUTES ====================

/**
 * POST /api/platform/copilot/analyze
 * Analyze code and provide suggestions
 */
router.post('/copilot/analyze', requireAuth, async (req: Request, res: Response) => {
  try {
    const { aiCopilot } = await import('@shared/core/kernel/ai-copilot');
    const { code, language, filename, projectContext } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }
    
    const analysis = await aiCopilot.analyzeCode({ code, language, filename, projectContext });
    res.json(analysis);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/platform/copilot/explain
 * Explain code in detail
 */
router.post('/copilot/explain', requireAuth, async (req: Request, res: Response) => {
  try {
    const { aiCopilot } = await import('@shared/core/kernel/ai-copilot');
    const { code, language, selectedCode } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }
    
    const explanation = await aiCopilot.explainCode({ code, language, selectedCode });
    res.json(explanation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/platform/copilot/fix
 * Fix code errors
 */
router.post('/copilot/fix', requireAuth, async (req: Request, res: Response) => {
  try {
    const { aiCopilot } = await import('@shared/core/kernel/ai-copilot');
    const { code, language, errorMessage } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }
    
    const fix = await aiCopilot.fixCode({ code, language }, errorMessage);
    res.json(fix);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/platform/copilot/autocomplete
 * Get intelligent autocomplete suggestions
 */
router.post('/copilot/autocomplete', requireAuth, async (req: Request, res: Response) => {
  try {
    const { aiCopilot } = await import('@shared/core/kernel/ai-copilot');
    const { code, language, cursorPosition } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }
    
    const completions = await aiCopilot.getAutocomplete({ code, language, cursorPosition });
    res.json(completions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/platform/copilot/generate
 * Generate code from description
 */
router.post('/copilot/generate', requireAuth, async (req: Request, res: Response) => {
  try {
    const { aiCopilot } = await import('@shared/core/kernel/ai-copilot');
    const { description, language, context } = req.body;
    
    if (!description || !language) {
      return res.status(400).json({ error: 'Description and language are required' });
    }
    
    const generated = await aiCopilot.generateCode(description, language, context);
    res.json(generated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/platform/copilot/refactor
 * Refactor code for better quality
 */
router.post('/copilot/refactor', requireAuth, async (req: Request, res: Response) => {
  try {
    const { aiCopilot } = await import('@shared/core/kernel/ai-copilot');
    const { code, language, goal } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }
    
    const refactored = await aiCopilot.refactorCode(
      { code, language }, 
      goal || 'all'
    );
    res.json(refactored);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/platform/copilot/security
 * Scan code for security vulnerabilities
 */
router.post('/copilot/security', requireAuth, async (req: Request, res: Response) => {
  try {
    const { aiCopilot } = await import('@shared/core/kernel/ai-copilot');
    const { code, language } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }
    
    const scan = await aiCopilot.scanSecurity({ code, language });
    res.json(scan);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/platform/copilot/tests
 * Generate unit tests for code
 */
router.post('/copilot/tests', requireAuth, async (req: Request, res: Response) => {
  try {
    const { aiCopilot } = await import('@shared/core/kernel/ai-copilot');
    const { code, language, framework } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }
    
    const tests = await aiCopilot.generateTests({ code, language }, framework || 'jest');
    res.json(tests);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/platform/copilot/chat
 * Chat with AI about code
 */
router.post('/copilot/chat', requireAuth, async (req: Request, res: Response) => {
  try {
    const { aiCopilot } = await import('@shared/core/kernel/ai-copilot');
    const { message, code, language, history } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const context = code && language ? { code, language } : undefined;
    const response = await aiCopilot.chat(message, context, history || []);
    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/platform/copilot/contextual-chat
 * Advanced contextual chat with memory and coherent responses
 */
router.post('/copilot/contextual-chat', requireAuth, async (req: Request, res: Response) => {
  try {
    const { aiCopilot } = await import('@shared/core/kernel/ai-copilot');
    const { 
      message, 
      projectContext, 
      conversationHistory, 
      codeContext, 
      userPreferences, 
      sessionMemory 
    } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const response = await aiCopilot.contextualChat(message, {
      projectContext,
      conversationHistory,
      codeContext,
      userPreferences,
      sessionMemory,
    });
    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/platform/copilot/summarize
 * Summarize conversation for context retention
 */
router.post('/copilot/summarize', requireAuth, async (req: Request, res: Response) => {
  try {
    const { aiCopilot } = await import('@shared/core/kernel/ai-copilot');
    const { history } = req.body;
    
    if (!history || !Array.isArray(history)) {
      return res.status(400).json({ error: 'History array is required' });
    }
    
    const summary = await aiCopilot.summarizeConversation(history);
    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== HETZNER DEPLOYMENT ROUTES ====================

// Helper to sanitize Hetzner errors - never expose internal API details
function sanitizeHetznerError(error: any): string {
  const msg = (typeof error === 'string' ? error : error?.message || '').toLowerCase();
  if (msg.includes('token') || msg.includes('auth')) return 'Cloud API authentication error';
  if (msg.includes('not found') || msg.includes('404')) return 'Resource not found';
  if (msg.includes('rate') || msg.includes('limit')) return 'Rate limit exceeded. Try again later.';
  if (msg.includes('timeout')) return 'Request timed out. Try again.';
  return 'Cloud operation failed. Please try again.';
}

// Helper to sanitize ALL Hetzner responses - not just errors
function sanitizeHetznerResponse(result: any): any {
  if (!result) return result;
  // If result contains an error field, sanitize it
  if (result.error && typeof result.error === 'string') {
    return { ...result, error: sanitizeHetznerError(result.error) };
  }
  // Remove any sensitive fields that might leak
  if (result.rootPassword) {
    const { rootPassword, ...safe } = result;
    return safe;
  }
  return result;
}

// In-memory cache for deployment registry (backed by database)
// Maps serverId → { projectId, ownerId } for fast ownership verification
interface DeploymentOwnership {
  serverId: number;
  projectId: string;
  ownerId: string;
}
const deploymentCache = new Map<number, DeploymentOwnership>();

// Load deployment ownership from database into cache
async function loadDeploymentOwnershipFromDB(serverId: number): Promise<DeploymentOwnership | null> {
  try {
    const { db } = await import('./db');
    const { hetznerDeployments } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    const deployment = await db.select()
      .from(hetznerDeployments)
      .where(eq(hetznerDeployments.serverId, serverId))
      .limit(1);
    
    if (deployment.length === 0) {
      return null;
    }
    
    const ownership: DeploymentOwnership = {
      serverId: deployment[0].serverId,
      projectId: deployment[0].projectId,
      ownerId: deployment[0].ownerId,
    };
    
    // Cache for future lookups
    deploymentCache.set(serverId, ownership);
    return ownership;
  } catch (error) {
    console.error('[Hetzner] Failed to load deployment from DB:', error);
    return null;
  }
}

// Save deployment ownership to database
async function saveDeploymentOwnershipToDB(serverId: number, projectId: string, ownerId: string, serverName?: string, serverType?: string, location?: string): Promise<boolean> {
  try {
    const { db } = await import('./db');
    const { hetznerDeployments } = await import('@shared/schema');
    
    await db.insert(hetznerDeployments).values({
      serverId,
      projectId,
      ownerId,
      serverName,
      serverType,
      location,
      status: 'active',
    });
    
    // Also cache locally
    deploymentCache.set(serverId, { serverId, projectId, ownerId });
    return true;
  } catch (error) {
    console.error('[Hetzner] Failed to save deployment to DB:', error);
    return false;
  }
}

// Delete deployment ownership from database
async function deleteDeploymentOwnershipFromDB(serverId: number): Promise<boolean> {
  try {
    const { db } = await import('./db');
    const { hetznerDeployments } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    await db.delete(hetznerDeployments).where(eq(hetznerDeployments.serverId, serverId));
    deploymentCache.delete(serverId);
    return true;
  } catch (error) {
    console.error('[Hetzner] Failed to delete deployment from DB:', error);
    return false;
  }
}

// Verify project ownership via database (isdsProjects + devWorkspaces)
async function verifyProjectOwnershipFromDB(projectId: string, userId: string): Promise<boolean> {
  try {
    const { db } = await import('./db');
    const { isdsProjects, devWorkspaces } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    // Find project and its workspace
    const project = await db.select()
      .from(isdsProjects)
      .where(eq(isdsProjects.id, projectId))
      .limit(1);
    
    if (project.length === 0) {
      // Project doesn't exist in database
      return false;
    }
    
    // Get workspace to check ownership
    const workspace = await db.select()
      .from(devWorkspaces)
      .where(eq(devWorkspaces.id, project[0].workspaceId))
      .limit(1);
    
    if (workspace.length === 0) {
      return false;
    }
    
    // Check if user owns the workspace
    return workspace[0].ownerId === userId;
  } catch (error) {
    console.error('[Hetzner] Database ownership check failed:', error);
    return false;
  }
}

// Check if user can deploy to this project (database-backed)
async function canDeployToProject(projectId: string, userId: string): Promise<boolean> {
  // Always verify against authoritative source (database)
  return await verifyProjectOwnershipFromDB(projectId, userId);
}

// Helper to get authenticated user ID from request
function getAuthenticatedUserId(req: Request): string | null {
  // Try session first, then passport user claims
  const sessionUserId = (req.session as any)?.userId;
  if (sessionUserId) return String(sessionUserId);
  
  const passportUser = (req as any).user;
  if (passportUser?.id) return String(passportUser.id);
  if (passportUser?.claims?.sub) return String(passportUser.claims.sub);
  
  return null;
}


// Verify server ownership - checks cache then database
async function verifyServerOwnership(serverId: number, userId: string): Promise<boolean> {
  // Check cache first
  let ownership = deploymentCache.get(serverId);
  
  // If not in cache, load from database
  if (!ownership) {
    ownership = await loadDeploymentOwnershipFromDB(serverId) || undefined;
  }
  
  if (!ownership) {
    // Not found in cache or database - deny access
    return false;
  }
  
  return ownership.ownerId === userId;
}

// Verify project ownership - async version using database
async function verifyProjectOwnership(projectId: string, userId: string): Promise<boolean> {
  // Always verify against authoritative source (database)
  return await verifyProjectOwnershipFromDB(projectId, userId);
}

/**
 * GET /api/platform/hetzner/status
 * Check if Hetzner API is configured
 */
router.get('/hetzner/status', requireAuth, async (req: Request, res: Response) => {
  try {
    const { hetznerDeployment } = await import('@shared/core/kernel/hetzner-deployment');
    res.json({ 
      configured: hetznerDeployment.isConfigured(),
      serverTypes: hetznerDeployment.getServerTypes(),
      locations: hetznerDeployment.getLocations()
    });
  } catch (error: any) {
    res.status(500).json({ error: sanitizeHetznerError(error) });
  }
});

/**
 * POST /api/platform/hetzner/deploy
 * Deploy a project to Hetzner Cloud
 */
router.post('/hetzner/deploy', requireAuth, async (req: Request, res: Response) => {
  try {
    const { hetznerDeployment } = await import('@shared/core/kernel/hetzner-deployment');
    const { projectId, projectName, serverType, location, image } = req.body;
    
    if (!projectId || !projectName) {
      return res.status(400).json({ error: 'Project ID and name are required' });
    }
    
    // Get authenticated user for ownership
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Validate serverType
    const validServerTypes = ['cx11', 'cx21', 'cx31', 'cx41', 'cx51', 'cpx11', 'cpx21', 'cpx31', 'cpx41', 'cpx51'];
    if (serverType && !validServerTypes.includes(serverType)) {
      return res.status(400).json({ error: 'Invalid server type' });
    }
    
    // Validate location
    const validLocations = ['fsn1', 'nbg1', 'hel1', 'ash', 'hil'];
    if (location && !validLocations.includes(location)) {
      return res.status(400).json({ error: 'Invalid location' });
    }
    
    // Validate image
    const validImages = ['ubuntu-22.04', 'ubuntu-20.04', 'debian-12', 'debian-11', 'rocky-9', 'fedora-39'];
    if (image && !validImages.includes(image)) {
      return res.status(400).json({ error: 'Invalid image' });
    }
    
    // CRITICAL: Verify user can deploy to this project BEFORE making API call
    if (!(await canDeployToProject(projectId, userId))) {
      return res.status(403).json({ error: 'Access denied - project belongs to another user' });
    }
    
    const result = await hetznerDeployment.deploy(projectId, projectName, {
      serverType,
      location,
      image
    });
    
    // Persist deployment ownership to database for tenant isolation
    if (result.success && result.serverId) {
      await saveDeploymentOwnershipToDB(result.serverId, projectId, userId, projectName, serverType, location);
    }
    
    res.json(sanitizeHetznerResponse(result));
  } catch (error: any) {
    res.status(500).json({ error: 'Deployment failed. Please try again.' });
  }
});

/**
 * GET /api/platform/hetzner/deployments/:projectId
 * List all deployments for a project
 */
router.get('/hetzner/deployments/:projectId', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Verify project ownership
    if (!(await verifyProjectOwnership(req.params.projectId, userId))) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { hetznerDeployment } = await import('@shared/core/kernel/hetzner-deployment');
    const servers = await hetznerDeployment.listDeployments(req.params.projectId);
    res.json(sanitizeHetznerResponse({ servers }));
  } catch (error: any) {
    res.status(500).json({ error: sanitizeHetznerError(error) });
  }
});

/**
 * GET /api/platform/hetzner/server/:serverId
 * Get server status
 */
router.get('/hetzner/server/:serverId', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const serverId = parseInt(req.params.serverId);
    // Verify server ownership
    if (!(await verifyServerOwnership(serverId, userId))) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { hetznerDeployment } = await import('@shared/core/kernel/hetzner-deployment');
    const status = await hetznerDeployment.getStatus(serverId);
    res.json(sanitizeHetznerResponse(status));
  } catch (error: any) {
    res.status(500).json({ error: sanitizeHetznerError(error) });
  }
});

/**
 * POST /api/platform/hetzner/server/:serverId/restart
 * Restart a server
 */
router.post('/hetzner/server/:serverId/restart', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const serverId = parseInt(req.params.serverId);
    if (!(await verifyServerOwnership(serverId, userId))) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { hetznerDeployment } = await import('@shared/core/kernel/hetzner-deployment');
    const result = await hetznerDeployment.restartDeployment(serverId);
    res.json(sanitizeHetznerResponse(result));
  } catch (error: any) {
    res.status(500).json({ error: sanitizeHetznerError(error) });
  }
});

/**
 * POST /api/platform/hetzner/server/:serverId/stop
 * Stop a server
 */
router.post('/hetzner/server/:serverId/stop', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const serverId = parseInt(req.params.serverId);
    if (!(await verifyServerOwnership(serverId, userId))) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { hetznerDeployment } = await import('@shared/core/kernel/hetzner-deployment');
    const result = await hetznerDeployment.stopDeployment(serverId);
    res.json(sanitizeHetznerResponse(result));
  } catch (error: any) {
    res.status(500).json({ error: sanitizeHetznerError(error) });
  }
});

/**
 * POST /api/platform/hetzner/server/:serverId/start
 * Start a server
 */
router.post('/hetzner/server/:serverId/start', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const serverId = parseInt(req.params.serverId);
    if (!(await verifyServerOwnership(serverId, userId))) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { hetznerDeployment } = await import('@shared/core/kernel/hetzner-deployment');
    const result = await hetznerDeployment.startDeployment(serverId);
    res.json(sanitizeHetznerResponse(result));
  } catch (error: any) {
    res.status(500).json({ error: sanitizeHetznerError(error) });
  }
});

/**
 * DELETE /api/platform/hetzner/server/:serverId
 * Delete a server
 */
router.delete('/hetzner/server/:serverId', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const serverId = parseInt(req.params.serverId);
    if (!(await verifyServerOwnership(serverId, userId))) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { hetznerDeployment } = await import('@shared/core/kernel/hetzner-deployment');
    const result = await hetznerDeployment.deleteDeployment(serverId);
    
    // Delete from ownership database on successful deletion
    if (result.success) {
      await deleteDeploymentOwnershipFromDB(serverId);
    }
    
    res.json(sanitizeHetznerResponse(result));
  } catch (error: any) {
    res.status(500).json({ error: sanitizeHetznerError(error) });
  }
});

/**
 * GET /api/platform/hetzner/cost/:serverType
 * Get cost estimate for a server type
 */
router.get('/hetzner/cost/:serverType', async (req: Request, res: Response) => {
  try {
    const { hetznerDeployment } = await import('@shared/core/kernel/hetzner-deployment');
    const cost = hetznerDeployment.getCostEstimate(req.params.serverType);
    res.json(cost);
  } catch (error: any) {
    res.status(500).json({ error: sanitizeHetznerError(error) });
  }
});

// ==================== MONITORING ROUTES ====================

/**
 * GET /api/platform/monitoring/dashboard
 * Get monitoring dashboard data
 */
router.get('/monitoring/dashboard', requireAuth, async (req: Request, res: Response) => {
  try {
    const { monitoringSystem } = await import('@shared/core/kernel/monitoring-system');
    const dashboard = monitoringSystem.getDashboard();
    res.json(dashboard);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/platform/monitoring/system
 * Get system metrics
 */
router.get('/monitoring/system', requireAuth, async (req: Request, res: Response) => {
  try {
    const { monitoringSystem } = await import('@shared/core/kernel/monitoring-system');
    const metrics = monitoringSystem.metrics.getSystemMetrics();
    res.json(metrics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/platform/monitoring/application
 * Get application metrics
 */
router.get('/monitoring/application', requireAuth, async (req: Request, res: Response) => {
  try {
    const { monitoringSystem } = await import('@shared/core/kernel/monitoring-system');
    const metrics = monitoringSystem.metrics.getApplicationMetrics();
    res.json(metrics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/platform/monitoring/health
 * Get health check results
 */
router.get('/monitoring/health', async (req: Request, res: Response) => {
  try {
    const { monitoringSystem } = await import('@shared/core/kernel/monitoring-system');
    const health = await monitoringSystem.health.runAll();
    const overall = monitoringSystem.health.getOverallStatus();
    res.json({ status: overall, checks: health });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/platform/monitoring/alerts
 * Get alerts
 */
router.get('/monitoring/alerts', requireAuth, async (req: Request, res: Response) => {
  try {
    const { monitoringSystem } = await import('@shared/core/kernel/monitoring-system');
    const unacknowledgedOnly = req.query.unacknowledged === 'true';
    const severity = req.query.severity as any;
    const alerts = monitoringSystem.alerts.getAlerts({ unacknowledgedOnly, severity });
    res.json({ alerts });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/platform/monitoring/alerts/:id/acknowledge
 * Acknowledge an alert
 */
router.post('/monitoring/alerts/:id/acknowledge', requireAuth, async (req: Request, res: Response) => {
  try {
    const { monitoringSystem } = await import('@shared/core/kernel/monitoring-system');
    const success = monitoringSystem.alerts.acknowledge(req.params.id);
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/platform/monitoring/record
 * Record a request metric
 */
router.post('/monitoring/record', async (req: Request, res: Response) => {
  try {
    const { monitoringSystem } = await import('@shared/core/kernel/monitoring-system');
    const { latency, isError } = req.body;
    monitoringSystem.metrics.recordRequest(latency || 0, isError || false);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SECURE TERMINAL ROUTES ====================

/**
 * POST /api/platform/terminal/token
 * Generate a secure terminal token
 */
router.post('/terminal/token', requireAuth, async (req: Request, res: Response) => {
  try {
    const { secureTerminal } = await import('@shared/core/kernel/secure-terminal');
    const userId = req.session?.userId || (req.user as any)?.claims?.sub;
    const { workspaceId, projectId } = req.body;
    
    const token = secureTerminal.generateToken(userId, { workspaceId, projectId });
    res.json(token);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/platform/terminal/session
 * Create a new terminal session
 */
router.post('/terminal/session', requireAuth, async (req: Request, res: Response) => {
  try {
    const { secureTerminal } = await import('@shared/core/kernel/secure-terminal');
    const userId = req.session?.userId || (req.user as any)?.claims?.sub;
    const { workspaceId, projectId, cwd } = req.body;
    
    const session = secureTerminal.createSession(userId, { workspaceId, projectId, cwd });
    res.json({ 
      id: session.id,
      cwd: session.cwd,
      created: session.created 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/platform/terminal/:sessionId/execute
 * Execute a command in a terminal session
 */
router.post('/terminal/:sessionId/execute', requireAuth, async (req: Request, res: Response) => {
  try {
    const { secureTerminal } = await import('@shared/core/kernel/secure-terminal');
    const userId = req.session?.userId || (req.user as any)?.claims?.sub;
    const { command } = req.body;
    
    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }
    
    // Pass userId for ownership verification
    const result = await secureTerminal.executeCommand(req.params.sessionId, command, userId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: 'Command execution failed' });
  }
});

/**
 * POST /api/platform/terminal/:sessionId/cd
 * Change directory in a terminal session
 */
router.post('/terminal/:sessionId/cd', requireAuth, async (req: Request, res: Response) => {
  try {
    const { secureTerminal } = await import('@shared/core/kernel/secure-terminal');
    const userId = req.session?.userId || (req.user as any)?.claims?.sub;
    const { path } = req.body;
    
    if (!path) {
      return res.status(400).json({ error: 'Path is required' });
    }
    
    // Verify session ownership
    const session = secureTerminal.getSession(req.params.sessionId);
    if (!session || session.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const result = secureTerminal.changeDirectory(req.params.sessionId, path);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: 'Operation failed' });
  }
});

/**
 * GET /api/platform/terminal/:sessionId/history
 * Get command history for a session
 */
router.get('/terminal/:sessionId/history', requireAuth, async (req: Request, res: Response) => {
  try {
    const { secureTerminal } = await import('@shared/core/kernel/secure-terminal');
    const userId = req.session?.userId || (req.user as any)?.claims?.sub;
    
    // Verify session ownership
    const session = secureTerminal.getSession(req.params.sessionId);
    if (!session || session.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const history = secureTerminal.getHistory(req.params.sessionId);
    res.json({ history });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve history' });
  }
});

/**
 * DELETE /api/platform/terminal/:sessionId
 * Destroy a terminal session
 */
router.delete('/terminal/:sessionId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { secureTerminal } = await import('@shared/core/kernel/secure-terminal');
    const userId = req.session?.userId || (req.user as any)?.claims?.sub;
    
    // Verify session ownership before deletion
    const session = secureTerminal.getSession(req.params.sessionId);
    if (!session || session.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    secureTerminal.destroySession(req.params.sessionId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to destroy session' });
  }
});

/**
 * GET /api/platform/terminal/sessions
 * List all sessions for the current user
 */
router.get('/terminal/sessions', requireAuth, async (req: Request, res: Response) => {
  try {
    const { secureTerminal } = await import('@shared/core/kernel/secure-terminal');
    const userId = req.session?.userId || (req.user as any)?.claims?.sub;
    const sessions = secureTerminal.listUserSessions(userId);
    res.json({ sessions });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/platform/terminal/stats
 * Get terminal statistics
 */
router.get('/terminal/stats', requireAuth, async (req: Request, res: Response) => {
  try {
    const { secureTerminal } = await import('@shared/core/kernel/secure-terminal');
    const stats = secureTerminal.getStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== PHASE 0: SOVEREIGNTY LAYER ENDPOINTS ====================

/**
 * POST /api/platform/sovereignty/conversations
 * Create a new conversation
 */
router.post('/sovereignty/conversations', requireAuth, async (req: Request, res: Response) => {
  try {
    const { sovereigntyLayer } = await import('@shared/core/kernel/sovereignty-layer');
    const userId = req.session?.userId || (req.user as any)?.claims?.sub;
    const { projectId, title, titleAr, metadata } = req.body;
    
    const result = await sovereigntyLayer.conversations.create({
      userId,
      projectId,
      title,
      titleAr,
      metadata,
    });
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/platform/sovereignty/conversations
 * List user's conversations
 */
router.get('/sovereignty/conversations', requireAuth, async (req: Request, res: Response) => {
  try {
    const { sovereigntyLayer } = await import('@shared/core/kernel/sovereignty-layer');
    const userId = req.session?.userId || (req.user as any)?.claims?.sub;
    const status = (req.query.status as string) || 'active';
    
    const conversations = await sovereigntyLayer.conversations.listConversations(userId, status);
    res.json({ conversations });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/platform/sovereignty/conversations/:id
 * Get conversation with messages
 */
router.get('/sovereignty/conversations/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { sovereigntyLayer } = await import('@shared/core/kernel/sovereignty-layer');
    const userId = req.session?.userId || (req.user as any)?.claims?.sub;
    
    const conversation = await sovereigntyLayer.conversations.getConversation(req.params.id, userId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    res.json(conversation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/platform/sovereignty/conversations/:id/messages
 * Add message to conversation
 */
router.post('/sovereignty/conversations/:id/messages', requireAuth, async (req: Request, res: Response) => {
  try {
    const { sovereigntyLayer } = await import('@shared/core/kernel/sovereignty-layer');
    const { role, content, contentAr, tokenCount, modelUsed, generationTime, metadata } = req.body;
    
    const result = await sovereigntyLayer.conversations.addMessage({
      conversationId: req.params.id,
      role,
      content,
      contentAr,
      tokenCount,
      modelUsed,
      generationTime,
      metadata,
    });
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/platform/sovereignty/conversations/:id
 * Soft delete conversation
 */
router.delete('/sovereignty/conversations/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { sovereigntyLayer } = await import('@shared/core/kernel/sovereignty-layer');
    const userId = req.session?.userId || (req.user as any)?.claims?.sub;
    
    await sovereigntyLayer.conversations.softDeleteConversation(req.params.id, userId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/platform/sovereignty/conversations/:id/restore
 * Restore soft-deleted conversation
 */
router.post('/sovereignty/conversations/:id/restore', requireAuth, async (req: Request, res: Response) => {
  try {
    const { sovereigntyLayer } = await import('@shared/core/kernel/sovereignty-layer');
    const userId = req.session?.userId || (req.user as any)?.claims?.sub;
    
    await sovereigntyLayer.conversations.restoreConversation(req.params.id, userId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/platform/sovereignty/conversations/:id/export
 * Export conversation
 */
router.get('/sovereignty/conversations/:id/export', requireAuth, async (req: Request, res: Response) => {
  try {
    const { sovereigntyLayer } = await import('@shared/core/kernel/sovereignty-layer');
    const userId = req.session?.userId || (req.user as any)?.claims?.sub;
    
    const exported = await sovereigntyLayer.conversations.exportConversation(req.params.id, userId);
    if (!exported) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    res.json(exported);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/platform/sovereignty/restore-points
 * Create manual restore point
 */
router.post('/sovereignty/restore-points', requireAuth, async (req: Request, res: Response) => {
  try {
    const { sovereigntyLayer } = await import('@shared/core/kernel/sovereignty-layer');
    const userId = req.session?.userId || (req.user as any)?.claims?.sub;
    const { projectId, name, description } = req.body;
    
    const result = await sovereigntyLayer.restorePoints.createManual(projectId, userId, name, description);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/platform/sovereignty/restore-points/:projectId
 * List restore points for project
 */
router.get('/sovereignty/restore-points/:projectId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { sovereigntyLayer } = await import('@shared/core/kernel/sovereignty-layer');
    const userId = req.session?.userId || (req.user as any)?.claims?.sub;
    
    const points = await sovereigntyLayer.restorePoints.list(req.params.projectId, userId);
    res.json({ restorePoints: points });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/platform/sovereignty/restore-points/:id/restore
 * Restore from restore point
 */
router.post('/sovereignty/restore-points/:id/restore', requireAuth, async (req: Request, res: Response) => {
  try {
    const { sovereigntyLayer } = await import('@shared/core/kernel/sovereignty-layer');
    const userId = req.session?.userId || (req.user as any)?.claims?.sub;
    const { filesOnly, contextOnly, full } = req.body;
    
    const result = await sovereigntyLayer.restorePoints.restore(req.params.id, userId, { filesOnly, contextOnly, full });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/platform/sovereignty/restore-points/:id/immutable
 * Mark restore point as immutable milestone
 */
router.post('/sovereignty/restore-points/:id/immutable', requireAuth, async (req: Request, res: Response) => {
  try {
    const { sovereigntyLayer } = await import('@shared/core/kernel/sovereignty-layer');
    const userId = req.session?.userId || (req.user as any)?.claims?.sub;
    
    await sovereigntyLayer.restorePoints.markAsImmutable(req.params.id, userId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/platform/sovereignty/delete/initiate
 * Initiate sovereign delete workflow
 */
router.post('/sovereignty/delete/initiate', requireAuth, async (req: Request, res: Response) => {
  try {
    const { sovereigntyLayer } = await import('@shared/core/kernel/sovereignty-layer');
    const userId = req.session?.userId || (req.user as any)?.claims?.sub;
    const { originalId, originalType, name, nameAr } = req.body;
    
    const result = await sovereigntyLayer.delete.initiateDelete(originalId, originalType, userId, name, nameAr);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/platform/sovereignty/delete/confirm
 * Confirm deletion
 */
router.post('/sovereignty/delete/confirm', requireAuth, async (req: Request, res: Response) => {
  try {
    const { sovereigntyLayer } = await import('@shared/core/kernel/sovereignty-layer');
    const userId = req.session?.userId || (req.user as any)?.claims?.sub;
    const { originalId } = req.body;
    
    const result = await sovereigntyLayer.delete.confirmDelete(originalId, userId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/platform/sovereignty/delete/verify-password
 * Verify password for deletion
 */
router.post('/sovereignty/delete/verify-password', requireAuth, async (req: Request, res: Response) => {
  try {
    const { sovereigntyLayer } = await import('@shared/core/kernel/sovereignty-layer');
    const userId = req.session?.userId || (req.user as any)?.claims?.sub;
    const { originalId, passwordHash } = req.body;
    
    const result = await sovereigntyLayer.delete.verifyPassword(originalId, userId, passwordHash);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/platform/sovereignty/delete/execute
 * Execute soft delete
 */
router.post('/sovereignty/delete/execute', requireAuth, async (req: Request, res: Response) => {
  try {
    const { sovereigntyLayer } = await import('@shared/core/kernel/sovereignty-layer');
    const userId = req.session?.userId || (req.user as any)?.claims?.sub;
    const { originalId, fullBackup } = req.body;
    
    const result = await sovereigntyLayer.delete.executeSoftDelete(originalId, userId, fullBackup);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/platform/sovereignty/deleted
 * List deleted platforms
 */
router.get('/sovereignty/deleted', requireAuth, async (req: Request, res: Response) => {
  try {
    const { sovereigntyLayer } = await import('@shared/core/kernel/sovereignty-layer');
    const userId = req.session?.userId || (req.user as any)?.claims?.sub;
    
    const deleted = await sovereigntyLayer.delete.listDeleted(userId);
    res.json({ deleted });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/platform/sovereignty/deleted/:id/restore
 * Restore deleted platform
 */
router.post('/sovereignty/deleted/:id/restore', requireAuth, async (req: Request, res: Response) => {
  try {
    const { sovereigntyLayer } = await import('@shared/core/kernel/sovereignty-layer');
    const userId = req.session?.userId || (req.user as any)?.claims?.sub;
    
    const success = await sovereigntyLayer.delete.restore(req.params.id, userId);
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/platform/sovereignty/audit
 * Query audit log
 */
router.get('/sovereignty/audit', requireAuth, async (req: Request, res: Response) => {
  try {
    const { sovereigntyLayer } = await import('@shared/core/kernel/sovereignty-layer');
    const userId = req.session?.userId || (req.user as any)?.claims?.sub;
    const { projectId, category, criticalOnly, limit } = req.query;
    
    const logs = await sovereigntyLayer.audit.query(userId, {
      projectId: projectId as string,
      category: category as string,
      criticalOnly: criticalOnly === 'true',
      limit: limit ? parseInt(limit as string) : 100,
    });
    
    res.json({ logs });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/platform/sovereignty/audit/verify
 * Verify audit log integrity
 */
router.get('/sovereignty/audit/verify', requireAuth, async (req: Request, res: Response) => {
  try {
    const { sovereigntyLayer } = await import('@shared/core/kernel/sovereignty-layer');
    const userId = req.session?.userId || (req.user as any)?.claims?.sub;
    
    const result = await sovereigntyLayer.audit.verifyIntegrity(userId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/platform/sovereignty/ai-decisions/:projectId
 * Get AI decision memory for project
 */
router.get('/sovereignty/ai-decisions/:projectId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { sovereigntyLayer } = await import('@shared/core/kernel/sovereignty-layer');
    const userId = req.session?.userId || (req.user as any)?.claims?.sub;
    
    const decisions = await sovereigntyLayer.aiMemory.getProjectDecisions(req.params.projectId, userId);
    res.json({ decisions });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/platform/sovereignty/ai-decisions/:projectId/narrative
 * Get AI decision narrative for project
 */
router.get('/sovereignty/ai-decisions/:projectId/narrative', requireAuth, async (req: Request, res: Response) => {
  try {
    const { sovereigntyLayer } = await import('@shared/core/kernel/sovereignty-layer');
    const userId = req.session?.userId || (req.user as any)?.claims?.sub;
    
    const narrative = await sovereigntyLayer.aiMemory.getDecisionNarrative(req.params.projectId, userId);
    res.json({ narrative });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/platform/sovereignty/project-brain/:projectId
 * Get project brain
 */
router.get('/sovereignty/project-brain/:projectId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { sovereigntyLayer } = await import('@shared/core/kernel/sovereignty-layer');
    const userId = req.session?.userId || (req.user as any)?.claims?.sub;
    
    const brain = await sovereigntyLayer.projectBrain.get(req.params.projectId, userId);
    res.json({ brain });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/platform/sovereignty/project-brain/:projectId/analyze
 * Analyze project with Project Brain
 */
router.post('/sovereignty/project-brain/:projectId/analyze', requireAuth, async (req: Request, res: Response) => {
  try {
    const { sovereigntyLayer } = await import('@shared/core/kernel/sovereignty-layer');
    const userId = req.session?.userId || (req.user as any)?.claims?.sub;
    
    const analysis = await sovereigntyLayer.projectBrain.analyze(req.params.projectId, userId);
    res.json(analysis);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== QUALITY ASSURANCE ROUTES ====================

/**
 * GET /api/platform/quality/report
 * Generate full platform quality report
 */
router.get('/quality/report', requireAuth, async (req: Request, res: Response) => {
  try {
    const { qualityAssuranceEngine } = await import('@shared/core/kernel/quality-assurance-engine');
    const report = await qualityAssuranceEngine.generatePlatformReport();
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/platform/quality/pages
 * Get all platform pages with their quality info
 */
router.get('/quality/pages', async (req: Request, res: Response) => {
  try {
    const { qualityAssuranceEngine } = await import('@shared/core/kernel/quality-assurance-engine');
    const pages = qualityAssuranceEngine.getAllPages();
    res.json({ pages });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/platform/quality/services
 * Get all platform services with their status
 */
router.get('/quality/services', async (req: Request, res: Response) => {
  try {
    const { qualityAssuranceEngine } = await import('@shared/core/kernel/quality-assurance-engine');
    const services = qualityAssuranceEngine.getAllServices();
    res.json({ services });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/platform/quality/page/:path
 * Analyze specific page quality
 */
router.get('/quality/page/*', requireAuth, async (req: Request, res: Response) => {
  try {
    const { qualityAssuranceEngine } = await import('@shared/core/kernel/quality-assurance-engine');
    const pagePath = '/' + (req.params[0] || '');
    const metrics = await qualityAssuranceEngine.analyzePageQuality(pagePath);
    res.json(metrics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/platform/quality/service/:id
 * Check specific service health
 */
router.get('/quality/service/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { qualityAssuranceEngine } = await import('@shared/core/kernel/quality-assurance-engine');
    const health = await qualityAssuranceEngine.checkServiceHealth(req.params.id);
    res.json(health);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/platform/quality/analyze
 * AI-powered quality analysis
 */
router.post('/quality/analyze', requireAuth, async (req: Request, res: Response) => {
  try {
    const { qualityAssuranceEngine } = await import('@shared/core/kernel/quality-assurance-engine');
    const { context, question } = req.body;
    const analysis = await qualityAssuranceEngine.analyzeWithAI(context, question);
    res.json({ analysis });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== EXPORT ROUTER ====================
export function registerPlatformApiRoutes(app: any) {
  app.use('/api/platform', router);
  console.log('[Platform API] Routes registered at /api/platform');
  console.log('[AI Orchestrator] AI endpoints ready at /api/platform/ai/*');
  console.log('[AI Copilot] Copilot endpoints ready at /api/platform/copilot/*');
  console.log('[Project Runtime] Runtime endpoints ready at /api/platform/runtime/*');
  console.log('[Hetzner Deployment] Cloud endpoints ready at /api/platform/hetzner/*');
  console.log('[Monitoring] Metrics endpoints ready at /api/platform/monitoring/*');
  console.log('[Secure Terminal] Terminal endpoints ready at /api/platform/terminal/*');
  console.log('[Sovereignty Layer] Phase 0 endpoints ready at /api/platform/sovereignty/*');
  console.log('[Quality Assurance] Quality endpoints ready at /api/platform/quality/*');
}

export default router;
