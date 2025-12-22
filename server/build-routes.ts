/**
 * INFERA WebNova - Build API Routes
 * REST API for Build Orchestrator and CI/CD Pipeline
 */

import { Router } from 'express';
import { buildOrchestrator, BuildConfig, BuildJob } from './build-orchestrator';
import { cicdPipelineManager, pipelineTemplates, PipelineConfig } from './cicd-pipeline';
import { z } from 'zod';

const router = Router();

// ==================== VALIDATION SCHEMAS ====================
const buildConfigSchema = z.object({
  projectId: z.string(),
  projectName: z.string(),
  type: z.enum(['mobile', 'desktop']),
  platform: z.enum(['android', 'ios', 'windows', 'macos', 'linux', 'all']),
  framework: z.enum(['react-native', 'expo', 'electron', 'tauri']),
  sourceFiles: z.array(z.object({
    path: z.string(),
    content: z.string(),
  })).optional().default([]),
  environment: z.enum(['development', 'staging', 'production']).default('development'),
  buildOptions: z.object({
    releaseMode: z.boolean().optional(),
    bundleId: z.string().optional(),
    versionCode: z.number().optional(),
    versionName: z.string().optional(),
  }).optional(),
});

const pipelineConfigSchema = z.object({
  projectId: z.string(),
  projectName: z.string(),
  type: z.enum(['mobile', 'desktop', 'web', 'fullstack']),
  template: z.enum(['mobileApp', 'desktopApp', 'custom']).optional(),
  triggers: z.array(z.object({
    type: z.enum(['push', 'pull_request', 'tag', 'schedule', 'manual']),
    branches: z.array(z.string()).optional(),
    schedule: z.string().optional(),
  })).optional(),
  stages: z.array(z.object({
    name: z.string(),
    nameAr: z.string(),
    type: z.enum(['build', 'test', 'deploy', 'notify', 'approval', 'custom']),
    enabled: z.boolean(),
    config: z.record(z.any()),
  })).optional(),
  environment: z.enum(['development', 'staging', 'production']).default('development'),
});

// ==================== BUILD ROUTES ====================

/**
 * Create a new build job
 * POST /api/builds
 */
router.post('/builds', async (req, res) => {
  try {
    const config = buildConfigSchema.parse(req.body) as BuildConfig;
    const job = await buildOrchestrator.createBuildJob(config);
    
    res.status(201).json({
      success: true,
      message: 'Build job created / تم إنشاء مهمة البناء',
      job: {
        id: job.id,
        status: job.status,
        progress: job.progress,
        currentStep: job.currentStep,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Invalid build configuration / تكوين بناء غير صالح',
        details: error.errors,
      });
    } else {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
});

/**
 * Get all build jobs
 * GET /api/builds
 */
router.get('/builds', (req, res) => {
  const { projectId, status } = req.query;
  
  let jobs = buildOrchestrator.getAllJobs();
  
  if (projectId) {
    jobs = jobs.filter(j => j.projectId === projectId);
  }
  
  if (status) {
    jobs = jobs.filter(j => j.status === status);
  }
  
  res.json({
    success: true,
    jobs: jobs.map(job => ({
      id: job.id,
      projectId: job.projectId,
      status: job.status,
      progress: job.progress,
      currentStep: job.currentStep,
      artifactCount: job.artifacts.length,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
    })),
  });
});

/**
 * Get build job details
 * GET /api/builds/:jobId
 */
router.get('/builds/:jobId', (req, res) => {
  const job = buildOrchestrator.getJob(req.params.jobId);
  
  if (!job) {
    return res.status(404).json({
      success: false,
      error: 'Build job not found / مهمة البناء غير موجودة',
    });
  }
  
  res.json({
    success: true,
    job,
  });
});

/**
 * Get build job logs
 * GET /api/builds/:jobId/logs
 */
router.get('/builds/:jobId/logs', (req, res) => {
  const job = buildOrchestrator.getJob(req.params.jobId);
  
  if (!job) {
    return res.status(404).json({
      success: false,
      error: 'Build job not found / مهمة البناء غير موجودة',
    });
  }
  
  const { since } = req.query;
  let logs = job.logs;
  
  if (since) {
    const sinceIndex = parseInt(since as string) || 0;
    logs = logs.slice(sinceIndex);
  }
  
  res.json({
    success: true,
    logs,
    totalLogs: job.logs.length,
  });
});

/**
 * Cancel a build job
 * POST /api/builds/:jobId/cancel
 */
router.post('/builds/:jobId/cancel', async (req, res) => {
  const cancelled = await buildOrchestrator.cancelBuild(req.params.jobId);
  
  if (cancelled) {
    res.json({
      success: true,
      message: 'Build cancelled / تم إلغاء البناء',
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'Cannot cancel this build / لا يمكن إلغاء هذا البناء',
    });
  }
});

/**
 * Download build artifact
 * GET /api/builds/:jobId/download/:artifactName
 */
router.get('/builds/:jobId/download/:artifactName', async (req, res) => {
  const job = buildOrchestrator.getJob(req.params.jobId);
  
  if (!job) {
    return res.status(404).json({
      success: false,
      error: 'Build job not found / مهمة البناء غير موجودة',
    });
  }
  
  const artifact = job.artifacts.find(a => a.name === req.params.artifactName);
  
  if (!artifact) {
    return res.status(404).json({
      success: false,
      error: 'Artifact not found / الملف غير موجود',
    });
  }
  
  // In production, stream the file
  res.json({
    success: true,
    artifact: {
      name: artifact.name,
      platform: artifact.platform,
      size: artifact.size,
      downloadReady: true,
    },
    message: 'Artifact ready for download / الملف جاهز للتنزيل',
  });
});

// ==================== CI/CD PIPELINE ROUTES ====================

/**
 * Create a new pipeline
 * POST /api/pipelines
 */
router.post('/pipelines', async (req, res) => {
  try {
    const data = pipelineConfigSchema.parse(req.body);
    
    let config: PipelineConfig;
    
    if (data.template === 'mobileApp') {
      config = pipelineTemplates.mobileApp(data.projectId, data.projectName);
    } else if (data.template === 'desktopApp') {
      config = pipelineTemplates.desktopApp(data.projectId, data.projectName);
    } else {
      config = {
        projectId: data.projectId,
        projectName: data.projectName,
        type: data.type,
        triggers: data.triggers || [{ type: 'manual' }],
        stages: data.stages || [],
        environment: data.environment,
      };
    }
    
    const pipeline = await cicdPipelineManager.createPipeline(config);
    
    res.status(201).json({
      success: true,
      message: 'Pipeline created / تم إنشاء خط الأنابيب',
      pipeline: {
        id: pipeline.id,
        name: pipeline.name,
        status: pipeline.status,
        stages: pipeline.config.stages.map(s => ({ name: s.name, nameAr: s.nameAr })),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Invalid pipeline configuration / تكوين خط أنابيب غير صالح',
        details: error.errors,
      });
    } else {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
});

/**
 * Get all pipelines
 * GET /api/pipelines
 */
router.get('/pipelines', (req, res) => {
  const { projectId } = req.query;
  
  let pipelines = cicdPipelineManager.getAllPipelines();
  
  if (projectId) {
    pipelines = pipelines.filter(p => p.projectId === projectId);
  }
  
  res.json({
    success: true,
    pipelines: pipelines.map(pipeline => ({
      id: pipeline.id,
      projectId: pipeline.projectId,
      name: pipeline.name,
      status: pipeline.status,
      stageCount: pipeline.config.stages.length,
      lastRun: pipeline.lastRun ? {
        id: pipeline.lastRun.id,
        status: pipeline.lastRun.status,
        startedAt: pipeline.lastRun.startedAt,
      } : null,
    })),
  });
});

/**
 * Get pipeline details
 * GET /api/pipelines/:pipelineId
 */
router.get('/pipelines/:pipelineId', (req, res) => {
  const pipeline = cicdPipelineManager.getPipeline(req.params.pipelineId);
  
  if (!pipeline) {
    return res.status(404).json({
      success: false,
      error: 'Pipeline not found / خط الأنابيب غير موجود',
    });
  }
  
  res.json({
    success: true,
    pipeline,
  });
});

/**
 * Trigger a pipeline run
 * POST /api/pipelines/:pipelineId/trigger
 */
router.post('/pipelines/:pipelineId/trigger', async (req, res) => {
  try {
    const { branch, commit, user } = req.body;
    
    const run = await cicdPipelineManager.triggerPipeline(
      req.params.pipelineId,
      {
        type: 'manual',
        user,
        branch,
        commit,
      }
    );
    
    res.status(201).json({
      success: true,
      message: 'Pipeline triggered / تم تشغيل خط الأنابيب',
      run: {
        id: run.id,
        status: run.status,
        stages: run.stages.map(s => ({ name: s.name, status: s.status })),
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to trigger pipeline',
    });
  }
});

/**
 * Get pipeline runs
 * GET /api/pipelines/:pipelineId/runs
 */
router.get('/pipelines/:pipelineId/runs', (req, res) => {
  const runs = cicdPipelineManager.getPipelineRuns(req.params.pipelineId);
  
  res.json({
    success: true,
    runs: runs.map(run => ({
      id: run.id,
      status: run.status,
      progress: run.progress,
      trigger: run.trigger,
      startedAt: run.startedAt,
      completedAt: run.completedAt,
      duration: run.duration,
    })),
  });
});

/**
 * Get run details
 * GET /api/pipelines/:pipelineId/runs/:runId
 */
router.get('/pipelines/:pipelineId/runs/:runId', (req, res) => {
  const run = cicdPipelineManager.getRun(req.params.runId);
  
  if (!run || run.pipelineId !== req.params.pipelineId) {
    return res.status(404).json({
      success: false,
      error: 'Run not found / التشغيل غير موجود',
    });
  }
  
  res.json({
    success: true,
    run,
  });
});

/**
 * Cancel a pipeline run
 * POST /api/pipelines/:pipelineId/runs/:runId/cancel
 */
router.post('/pipelines/:pipelineId/runs/:runId/cancel', async (req, res) => {
  const cancelled = await cicdPipelineManager.cancelRun(req.params.runId);
  
  if (cancelled) {
    res.json({
      success: true,
      message: 'Run cancelled / تم إلغاء التشغيل',
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'Cannot cancel this run / لا يمكن إلغاء هذا التشغيل',
    });
  }
});

/**
 * Pause a pipeline
 * POST /api/pipelines/:pipelineId/pause
 */
router.post('/pipelines/:pipelineId/pause', async (req, res) => {
  const paused = await cicdPipelineManager.pausePipeline(req.params.pipelineId);
  
  if (paused) {
    res.json({
      success: true,
      message: 'Pipeline paused / تم إيقاف خط الأنابيب مؤقتاً',
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'Cannot pause this pipeline / لا يمكن إيقاف خط الأنابيب هذا',
    });
  }
});

/**
 * Resume a pipeline
 * POST /api/pipelines/:pipelineId/resume
 */
router.post('/pipelines/:pipelineId/resume', async (req, res) => {
  const resumed = await cicdPipelineManager.resumePipeline(req.params.pipelineId);
  
  if (resumed) {
    res.json({
      success: true,
      message: 'Pipeline resumed / تم استئناف خط الأنابيب',
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'Cannot resume this pipeline / لا يمكن استئناف خط الأنابيب هذا',
    });
  }
});

// ==================== SSE ENDPOINTS FOR REAL-TIME UPDATES ====================

/**
 * Stream build job updates
 * GET /api/builds/:jobId/stream
 */
router.get('/builds/:jobId/stream', (req, res) => {
  const jobId = req.params.jobId;
  
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  const onLog = (data: { jobId: string; message: string }) => {
    if (data.jobId === jobId) {
      res.write(`data: ${JSON.stringify({ type: 'log', message: data.message })}\n\n`);
    }
  };
  
  const onProgress = (data: { jobId: string; progress: number }) => {
    if (data.jobId === jobId) {
      res.write(`data: ${JSON.stringify({ type: 'progress', progress: data.progress })}\n\n`);
    }
  };
  
  const onStatus = (data: { jobId: string; status: string }) => {
    if (data.jobId === jobId) {
      res.write(`data: ${JSON.stringify({ type: 'status', status: data.status })}\n\n`);
    }
  };
  
  buildOrchestrator.on('log', onLog);
  buildOrchestrator.on('progressChanged', onProgress);
  buildOrchestrator.on('statusChanged', onStatus);
  
  req.on('close', () => {
    buildOrchestrator.off('log', onLog);
    buildOrchestrator.off('progressChanged', onProgress);
    buildOrchestrator.off('statusChanged', onStatus);
  });
});

/**
 * Stream pipeline run updates
 * GET /api/pipelines/:pipelineId/runs/:runId/stream
 */
router.get('/pipelines/:pipelineId/runs/:runId/stream', (req, res) => {
  const runId = req.params.runId;
  
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  const onStageStarted = (data: any) => {
    if (data.run?.id === runId) {
      res.write(`data: ${JSON.stringify({ type: 'stageStarted', stage: data.stage })}\n\n`);
    }
  };
  
  const onStageCompleted = (data: any) => {
    if (data.run?.id === runId) {
      res.write(`data: ${JSON.stringify({ type: 'stageCompleted', stage: data.stage })}\n\n`);
    }
  };
  
  const onPipelineCompleted = (data: any) => {
    if (data.run?.id === runId) {
      res.write(`data: ${JSON.stringify({ type: 'pipelineCompleted', run: data.run })}\n\n`);
    }
  };
  
  cicdPipelineManager.on('stageStarted', onStageStarted);
  cicdPipelineManager.on('stageCompleted', onStageCompleted);
  cicdPipelineManager.on('pipelineCompleted', onPipelineCompleted);
  
  req.on('close', () => {
    cicdPipelineManager.off('stageStarted', onStageStarted);
    cicdPipelineManager.off('stageCompleted', onStageCompleted);
    cicdPipelineManager.off('pipelineCompleted', onPipelineCompleted);
  });
});

export { router as buildRoutes };
