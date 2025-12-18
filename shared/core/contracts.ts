/**
 * INFERA WebNova - Core Contracts & Schemas
 * Contract-First Design for all modules
 */

import { z } from 'zod';

export const BlueprintSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  version: z.string().default('1.0.0'),
  status: z.enum(['draft', 'approved', 'rejected', 'archived']),
  context: z.object({
    domain: z.string(),
    industry: z.string().optional(),
    targetPlatform: z.enum(['web', 'mobile', 'desktop', 'api', 'fullstack']),
    language: z.enum(['ar', 'en', 'both']).default('both'),
  }),
  intents: z.array(z.object({
    id: z.string(),
    type: z.enum(['feature', 'page', 'component', 'integration', 'workflow']),
    description: z.string(),
    priority: z.enum(['critical', 'high', 'medium', 'low']),
    dependencies: z.array(z.string()).optional(),
  })),
  constraints: z.array(z.object({
    type: z.enum(['technical', 'business', 'security', 'compliance', 'performance']),
    description: z.string(),
    enforcementLevel: z.enum(['strict', 'preferred', 'optional']),
  })).optional(),
  outputs: z.array(z.object({
    type: z.enum(['code', 'documentation', 'api', 'database', 'deployment']),
    format: z.string(),
    destination: z.string().optional(),
  })),
  metadata: z.object({
    createdAt: z.date(),
    updatedAt: z.date(),
    createdBy: z.string(),
    approvedBy: z.string().optional(),
  }),
});

export type Blueprint = z.infer<typeof BlueprintSchema>;

export const GenerationJobSchema = z.object({
  id: z.string().uuid(),
  blueprintId: z.string().uuid(),
  tenantId: z.string(),
  status: z.enum(['queued', 'processing', 'validating', 'completed', 'failed']),
  progress: z.number().min(0).max(100),
  currentStep: z.string().optional(),
  steps: z.array(z.object({
    name: z.string(),
    status: z.enum(['pending', 'running', 'completed', 'failed', 'skipped']),
    duration: z.number().optional(),
    output: z.string().optional(),
  })),
  artifacts: z.array(z.object({
    type: z.enum(['html', 'css', 'javascript', 'typescript', 'json', 'sql', 'markdown']),
    filename: z.string(),
    content: z.string(),
    hash: z.string().optional(),
  })).optional(),
  errors: z.array(z.object({
    code: z.string(),
    message: z.string(),
    severity: z.enum(['error', 'warning', 'info']),
    location: z.string().optional(),
  })).optional(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
});

export type GenerationJob = z.infer<typeof GenerationJobSchema>;

export const RuntimeInstanceSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  tenantId: z.string(),
  status: z.enum(['starting', 'running', 'stopping', 'stopped', 'error']),
  type: z.enum(['preview', 'development', 'staging', 'production']),
  resources: z.object({
    cpu: z.number(),
    memory: z.number(),
    storage: z.number(),
  }),
  endpoints: z.array(z.object({
    type: z.enum(['http', 'websocket', 'grpc']),
    url: z.string().url(),
    port: z.number(),
  })),
  logs: z.array(z.object({
    timestamp: z.date(),
    level: z.enum(['debug', 'info', 'warn', 'error']),
    message: z.string(),
  })).optional(),
  startedAt: z.date().optional(),
  stoppedAt: z.date().optional(),
});

export type RuntimeInstance = z.infer<typeof RuntimeInstanceSchema>;

export const AITaskSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['generation', 'analysis', 'optimization', 'review', 'transformation']),
  priority: z.enum(['critical', 'high', 'normal', 'low']),
  status: z.enum(['queued', 'assigned', 'running', 'completed', 'failed', 'cancelled']),
  input: z.object({
    prompt: z.string(),
    context: z.record(z.unknown()).optional(),
    constraints: z.array(z.string()).optional(),
  }),
  output: z.object({
    result: z.unknown().optional(),
    tokens: z.object({
      input: z.number(),
      output: z.number(),
    }).optional(),
    duration: z.number().optional(),
  }).optional(),
  assignedModel: z.string().optional(),
  retryCount: z.number().default(0),
  maxRetries: z.number().default(3),
  createdAt: z.date(),
  completedAt: z.date().optional(),
});

export type AITask = z.infer<typeof AITaskSchema>;

export const VersionSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  tenantId: z.string(),
  version: z.string(),
  tag: z.string().optional(),
  description: z.string().optional(),
  changes: z.array(z.object({
    type: z.enum(['create', 'update', 'delete']),
    file: z.string(),
    diff: z.string().optional(),
  })),
  snapshot: z.object({
    files: z.record(z.string()),
    metadata: z.record(z.unknown()),
  }),
  createdAt: z.date(),
  createdBy: z.string(),
});

export type Version = z.infer<typeof VersionSchema>;

export const TenantSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  status: z.enum(['active', 'suspended', 'pending', 'archived']),
  tier: z.enum(['free', 'basic', 'pro', 'enterprise', 'sovereign']),
  settings: z.object({
    language: z.enum(['ar', 'en', 'both']),
    timezone: z.string(),
    features: z.array(z.string()),
  }),
  quotas: z.object({
    projects: z.number(),
    storage: z.number(),
    aiTokens: z.number(),
    deployments: z.number(),
  }),
  usage: z.object({
    projects: z.number(),
    storage: z.number(),
    aiTokens: z.number(),
    deployments: z.number(),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Tenant = z.infer<typeof TenantSchema>;

export const PluginManifestSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  description: z.string().optional(),
  author: z.string().optional(),
  capabilities: z.array(z.enum([
    'code-generation',
    'code-analysis',
    'deployment',
    'monitoring',
    'security',
    'data-processing',
    'ui-extension',
    'api-extension'
  ])),
  requiredEvents: z.array(z.string()),
  emittedEvents: z.array(z.string()),
  permissions: z.array(z.string()),
  sandboxPolicy: z.object({
    network: z.boolean().default(false),
    filesystem: z.enum(['none', 'read', 'write']).default('none'),
    maxMemory: z.number().default(128),
    maxCpu: z.number().default(0.5),
  }),
  entryPoint: z.string(),
  config: z.record(z.unknown()).optional(),
});

export type PluginManifest = z.infer<typeof PluginManifestSchema>;
