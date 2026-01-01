/**
 * INFERA WebNova - Extension Points Registry
 * Central registry for all extensibility points
 * 
 * Allows adding new capabilities without modifying core modules
 */

import { eventBus, createEvent, type DomainEvent } from './event-bus';

export interface ExtensionPoint<TInput = unknown, TOutput = unknown> {
  id: string;
  name: string;
  description: string;
  version: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  hooks: ExtensionHook[];
}

export interface ExtensionHook {
  type: 'before' | 'after' | 'around' | 'replace';
  priority: number;
  handler: (input: unknown, next?: () => Promise<unknown>) => Promise<unknown>;
}

export interface Extension {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  extensionPoints: string[];
  hooks: Map<string, ExtensionHook[]>;
  config?: Record<string, unknown>;
  enabled: boolean;
  scope?: ExtensionScope;
}

export interface ExtensionScope {
  type: 'global' | 'tenant' | 'project';
  tenantId?: string;
  projectId?: string;
}

export interface ScopedExtensionContext {
  tenantId?: string;
  projectId?: string;
  userId?: string;
  permissions: string[];
}

export interface IExtensionRegistry {
  registerExtensionPoint<TInput, TOutput>(point: ExtensionPoint<TInput, TOutput>): void;
  unregisterExtensionPoint(pointId: string): void;
  getExtensionPoint(pointId: string): ExtensionPoint | undefined;
  listExtensionPoints(): ExtensionPoint[];
  
  registerExtension(extension: Extension): Promise<void>;
  unregisterExtension(extensionId: string): Promise<void>;
  enableExtension(extensionId: string): Promise<void>;
  disableExtension(extensionId: string): Promise<void>;
  getExtension(extensionId: string): Extension | undefined;
  listExtensions(filter?: { enabled?: boolean; extensionPoint?: string; tenantId?: string }): Extension[];
  
  executeHooks<TInput, TOutput>(
    pointId: string,
    input: TInput,
    defaultHandler: (input: TInput) => Promise<TOutput>,
    context?: ScopedExtensionContext
  ): Promise<TOutput>;
  
  createScopedContext(tenantId: string, options?: { projectId?: string; userId?: string }): ScopedExtensionContext;
  getExtensionsForScope(scope: ExtensionScope): Extension[];
}

export const CORE_EXTENSION_POINTS = {
  BLUEPRINT_VALIDATION: 'core.blueprint.validation',
  BLUEPRINT_TRANSFORMATION: 'core.blueprint.transformation',
  CODE_GENERATION_PRE: 'core.codegen.pre',
  CODE_GENERATION_POST: 'core.codegen.post',
  CODE_OPTIMIZATION: 'core.codegen.optimization',
  RUNTIME_INITIALIZATION: 'core.runtime.init',
  RUNTIME_EXECUTION: 'core.runtime.execute',
  DEPLOYMENT_PRE: 'core.deployment.pre',
  DEPLOYMENT_POST: 'core.deployment.post',
  SECURITY_SCAN: 'core.security.scan',
  ANALYTICS_COLLECTION: 'core.analytics.collect',
  NOTIFICATION_DISPATCH: 'core.notification.dispatch',
} as const;

class ExtensionRegistryImpl implements IExtensionRegistry {
  private extensionPoints: Map<string, ExtensionPoint> = new Map();
  private extensions: Map<string, Extension> = new Map();
  private scopedHooks: Map<string, Map<string, ExtensionHook[]>> = new Map();

  constructor() {
    this.registerCoreExtensionPoints();
  }

  createScopedContext(tenantId: string, options?: { projectId?: string; userId?: string }): ScopedExtensionContext {
    return {
      tenantId,
      projectId: options?.projectId,
      userId: options?.userId,
      permissions: ['read', 'write', 'execute'],
    };
  }

  getExtensionsForScope(scope: ExtensionScope): Extension[] {
    return Array.from(this.extensions.values()).filter(ext => {
      if (!ext.scope) return scope.type === 'global';
      if (ext.scope.type === 'global') return true;
      if (ext.scope.type === 'tenant' && scope.tenantId) {
        return ext.scope.tenantId === scope.tenantId;
      }
      if (ext.scope.type === 'project' && scope.projectId) {
        return ext.scope.projectId === scope.projectId;
      }
      return false;
    });
  }

  registerExtensionPoint<TInput, TOutput>(point: ExtensionPoint<TInput, TOutput>): void {
    if (this.extensionPoints.has(point.id)) {
      throw new Error(`Extension point ${point.id} already registered`);
    }
    
    this.extensionPoints.set(point.id, point as ExtensionPoint);
    
    eventBus.publish(createEvent('extension.point.registered', {
      pointId: point.id,
      name: point.name,
      version: point.version,
    }));
  }

  unregisterExtensionPoint(pointId: string): void {
    this.extensionPoints.delete(pointId);
    
    for (const extension of Array.from(this.extensions.values())) {
      extension.hooks.delete(pointId);
    }
  }

  getExtensionPoint(pointId: string): ExtensionPoint | undefined {
    return this.extensionPoints.get(pointId);
  }

  listExtensionPoints(): ExtensionPoint[] {
    return Array.from(this.extensionPoints.values());
  }

  async registerExtension(extension: Extension): Promise<void> {
    if (this.extensions.has(extension.id)) {
      throw new Error(`Extension ${extension.id} already registered`);
    }

    for (const pointId of extension.extensionPoints) {
      if (!this.extensionPoints.has(pointId)) {
        throw new Error(`Extension point ${pointId} not found`);
      }
    }

    this.extensions.set(extension.id, extension);

    await eventBus.publish(createEvent('extension.registered', {
      extensionId: extension.id,
      name: extension.name,
      version: extension.version,
      extensionPoints: extension.extensionPoints,
    }));
  }

  async unregisterExtension(extensionId: string): Promise<void> {
    const extension = this.extensions.get(extensionId);
    if (!extension) return;

    if (extension.enabled) {
      await this.disableExtension(extensionId);
    }

    this.extensions.delete(extensionId);

    await eventBus.publish(createEvent('extension.unregistered', {
      extensionId,
    }));
  }

  async enableExtension(extensionId: string): Promise<void> {
    const extension = this.extensions.get(extensionId);
    if (!extension) {
      throw new Error(`Extension ${extensionId} not found`);
    }

    extension.enabled = true;

    for (const [pointId, hooks] of Array.from(extension.hooks)) {
      const point = this.extensionPoints.get(pointId);
      if (point) {
        point.hooks.push(...hooks);
        point.hooks.sort((a, b) => a.priority - b.priority);
      }
    }

    await eventBus.publish(createEvent('extension.enabled', {
      extensionId,
    }));
  }

  async disableExtension(extensionId: string): Promise<void> {
    const extension = this.extensions.get(extensionId);
    if (!extension) {
      throw new Error(`Extension ${extensionId} not found`);
    }

    extension.enabled = false;

    for (const [pointId, hooks] of Array.from(extension.hooks)) {
      const point = this.extensionPoints.get(pointId);
      if (point) {
        point.hooks = point.hooks.filter(h => !hooks.includes(h));
      }
    }

    await eventBus.publish(createEvent('extension.disabled', {
      extensionId,
    }));
  }

  getExtension(extensionId: string): Extension | undefined {
    return this.extensions.get(extensionId);
  }

  listExtensions(filter?: { enabled?: boolean; extensionPoint?: string; tenantId?: string }): Extension[] {
    let extensions = Array.from(this.extensions.values());

    if (filter?.enabled !== undefined) {
      extensions = extensions.filter(e => e.enabled === filter.enabled);
    }
    if (filter?.extensionPoint) {
      extensions = extensions.filter(e => e.extensionPoints.includes(filter.extensionPoint!));
    }
    if (filter?.tenantId) {
      extensions = extensions.filter(e => 
        !e.scope || 
        e.scope.type === 'global' || 
        (e.scope.type === 'tenant' && e.scope.tenantId === filter.tenantId)
      );
    }

    return extensions;
  }

  async executeHooks<TInput, TOutput>(
    pointId: string,
    input: TInput,
    defaultHandler: (input: TInput) => Promise<TOutput>,
    context?: ScopedExtensionContext
  ): Promise<TOutput> {
    const point = this.extensionPoints.get(pointId);
    let allHooks = point ? [...point.hooks] : [];

    if (context?.tenantId) {
      const scopeKey = `${pointId}:${context.tenantId}`;
      const scopedHooks = this.scopedHooks.get(scopeKey);
      if (scopedHooks) {
        for (const hooks of Array.from(scopedHooks.values())) {
          allHooks.push(...hooks);
        }
      }
    }

    if (allHooks.length === 0) {
      return defaultHandler(input);
    }

    const sortedHooks = allHooks.sort((a, b) => a.priority - b.priority);
    
    const beforeHooks = sortedHooks.filter(h => h.type === 'before');
    const afterHooks = sortedHooks.filter(h => h.type === 'after');
    const aroundHooks = sortedHooks.filter(h => h.type === 'around');
    const replaceHooks = sortedHooks.filter(h => h.type === 'replace');

    let currentInput = input as unknown;

    for (const hook of beforeHooks) {
      currentInput = await hook.handler(currentInput);
    }

    let result: unknown;

    if (replaceHooks.length > 0) {
      result = await replaceHooks[replaceHooks.length - 1].handler(currentInput);
    } else if (aroundHooks.length > 0) {
      let chain = async () => defaultHandler(currentInput as TInput) as Promise<unknown>;
      
      for (let i = aroundHooks.length - 1; i >= 0; i--) {
        const hook = aroundHooks[i];
        const next = chain;
        chain = async () => hook.handler(currentInput, next);
      }
      
      result = await chain();
    } else {
      result = await defaultHandler(currentInput as TInput);
    }

    for (const hook of afterHooks) {
      result = await hook.handler(result);
    }

    return result as TOutput;
  }

  private registerCoreExtensionPoints(): void {
    this.registerExtensionPoint({
      id: CORE_EXTENSION_POINTS.BLUEPRINT_VALIDATION,
      name: 'Blueprint Validation',
      description: 'Validates blueprint before processing',
      version: '1.0',
      inputSchema: { type: 'object', properties: { blueprint: { type: 'object' } } },
      outputSchema: { type: 'object', properties: { valid: { type: 'boolean' }, errors: { type: 'array' } } },
      hooks: [],
    });

    this.registerExtensionPoint({
      id: CORE_EXTENSION_POINTS.BLUEPRINT_TRANSFORMATION,
      name: 'Blueprint Transformation',
      description: 'Transforms blueprint before code generation',
      version: '1.0',
      inputSchema: { type: 'object', properties: { blueprint: { type: 'object' } } },
      outputSchema: { type: 'object', properties: { blueprint: { type: 'object' } } },
      hooks: [],
    });

    this.registerExtensionPoint({
      id: CORE_EXTENSION_POINTS.CODE_GENERATION_PRE,
      name: 'Pre-Code Generation',
      description: 'Hook before code generation starts',
      version: '1.0',
      inputSchema: { type: 'object', properties: { context: { type: 'object' } } },
      outputSchema: { type: 'object', properties: { context: { type: 'object' } } },
      hooks: [],
    });

    this.registerExtensionPoint({
      id: CORE_EXTENSION_POINTS.CODE_GENERATION_POST,
      name: 'Post-Code Generation',
      description: 'Hook after code generation completes',
      version: '1.0',
      inputSchema: { type: 'object', properties: { artifacts: { type: 'array' } } },
      outputSchema: { type: 'object', properties: { artifacts: { type: 'array' } } },
      hooks: [],
    });

    this.registerExtensionPoint({
      id: CORE_EXTENSION_POINTS.CODE_OPTIMIZATION,
      name: 'Code Optimization',
      description: 'Optimizes generated code',
      version: '1.0',
      inputSchema: { type: 'object', properties: { code: { type: 'string' }, language: { type: 'string' } } },
      outputSchema: { type: 'object', properties: { code: { type: 'string' }, optimizations: { type: 'array' } } },
      hooks: [],
    });

    this.registerExtensionPoint({
      id: CORE_EXTENSION_POINTS.SECURITY_SCAN,
      name: 'Security Scan',
      description: 'Scans code for security vulnerabilities',
      version: '1.0',
      inputSchema: { type: 'object', properties: { artifacts: { type: 'array' } } },
      outputSchema: { type: 'object', properties: { vulnerabilities: { type: 'array' }, score: { type: 'number' } } },
      hooks: [],
    });

    this.registerExtensionPoint({
      id: CORE_EXTENSION_POINTS.DEPLOYMENT_PRE,
      name: 'Pre-Deployment',
      description: 'Hook before deployment starts',
      version: '1.0',
      inputSchema: { type: 'object', properties: { deployment: { type: 'object' } } },
      outputSchema: { type: 'object', properties: { deployment: { type: 'object' }, approved: { type: 'boolean' } } },
      hooks: [],
    });

    this.registerExtensionPoint({
      id: CORE_EXTENSION_POINTS.DEPLOYMENT_POST,
      name: 'Post-Deployment',
      description: 'Hook after deployment completes',
      version: '1.0',
      inputSchema: { type: 'object', properties: { deployment: { type: 'object' }, result: { type: 'object' } } },
      outputSchema: { type: 'object', properties: { notifications: { type: 'array' } } },
      hooks: [],
    });

    this.registerExtensionPoint({
      id: CORE_EXTENSION_POINTS.ANALYTICS_COLLECTION,
      name: 'Analytics Collection',
      description: 'Collects and processes analytics data',
      version: '1.0',
      inputSchema: { type: 'object', properties: { event: { type: 'object' } } },
      outputSchema: { type: 'object', properties: { processed: { type: 'boolean' } } },
      hooks: [],
    });

    this.registerExtensionPoint({
      id: CORE_EXTENSION_POINTS.NOTIFICATION_DISPATCH,
      name: 'Notification Dispatch',
      description: 'Dispatches notifications to users',
      version: '1.0',
      inputSchema: { type: 'object', properties: { notification: { type: 'object' } } },
      outputSchema: { type: 'object', properties: { sent: { type: 'boolean' }, channels: { type: 'array' } } },
      hooks: [],
    });
  }
}

export const extensionRegistry: IExtensionRegistry = new ExtensionRegistryImpl();

export function createExtension(
  id: string,
  name: string,
  version: string,
  extensionPoints: string[],
  hooks: Array<{ pointId: string; hook: ExtensionHook }>
): Extension {
  const hooksMap = new Map<string, ExtensionHook[]>();
  
  for (const { pointId, hook } of hooks) {
    if (!hooksMap.has(pointId)) {
      hooksMap.set(pointId, []);
    }
    hooksMap.get(pointId)!.push(hook);
  }

  return {
    id,
    name,
    version,
    extensionPoints,
    hooks: hooksMap,
    enabled: false,
  };
}
