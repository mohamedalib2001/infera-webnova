/**
 * INFERA WebNova - Module Registry (سجل الوحدات)
 * Layer 1: Core Engine - Everything is a Plugin
 * 
 * Core لا يعرف شيئًا عن: نوع DB، نوع UI، نوع Cloud، نوع AI
 * كل شيء Plugin حتى Auth و DB
 */

import { z } from 'zod';
import { PermissionLevels, type PermissionLevel } from './sovereign-kernel';

// ==================== MODULE TYPES ====================
export const ModuleTypes = {
  CORE: 'CORE',             // Essential system modules
  SERVICE: 'SERVICE',       // Business services
  ADAPTER: 'ADAPTER',       // External integrations
  PLUGIN: 'PLUGIN',         // Third-party extensions
  RUNTIME: 'RUNTIME',       // Language runtimes
} as const;

export type ModuleType = typeof ModuleTypes[keyof typeof ModuleTypes];

// ==================== MODULE STATES ====================
export const ModuleStates = {
  REGISTERED: 'REGISTERED',
  INITIALIZING: 'INITIALIZING',
  READY: 'READY',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  ERROR: 'ERROR',
  UNLOADED: 'UNLOADED',
} as const;

export type ModuleState = typeof ModuleStates[keyof typeof ModuleStates];

// ==================== MODULE MANIFEST SCHEMA ====================
export const ModuleManifestSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  type: z.enum(['CORE', 'SERVICE', 'ADAPTER', 'PLUGIN', 'RUNTIME']),
  description: z.string().optional(),
  
  dependencies: z.array(z.object({
    moduleId: z.string(),
    version: z.string().optional(),
    optional: z.boolean().default(false),
  })),
  
  provides: z.array(z.object({
    contract: z.string(),
    version: z.string(),
  })),
  
  requires: z.array(z.object({
    contract: z.string(),
    version: z.string().optional(),
  })),
  
  permissions: z.array(z.string()),
  permissionLevel: z.number().min(0).max(6),
  
  config: z.object({
    schema: z.record(z.unknown()).optional(),
    defaults: z.record(z.unknown()).optional(),
  }).optional(),
  
  lifecycle: z.object({
    singleton: z.boolean().default(true),
    lazyLoad: z.boolean().default(false),
    priority: z.number().default(100),
  }).optional(),
});

export type ModuleManifest = z.infer<typeof ModuleManifestSchema>;

// ==================== MODULE INSTANCE ====================
export interface ModuleInstance {
  manifest: ModuleManifest;
  state: ModuleState;
  instance: unknown;
  config: Record<string, unknown>;
  activatedAt?: Date;
  error?: string;
}

// ==================== MODULE CONTRACTS ====================
export interface IModule {
  readonly manifest: ModuleManifest;
  
  initialize(config: Record<string, unknown>): Promise<void>;
  activate(): Promise<void>;
  deactivate(): Promise<void>;
  destroy(): Promise<void>;
  
  getHealth(): ModuleHealth;
}

export interface ModuleHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Date;
  metrics: Record<string, number>;
  details?: string;
}

// ==================== DEPENDENCY GRAPH ====================
export interface DependencyNode {
  moduleId: string;
  dependencies: string[];
  dependents: string[];
  level: number;
}

export interface DependencyGraph {
  nodes: Map<string, DependencyNode>;
  topologicalOrder: string[];
  hasCycles: boolean;
  cycles?: string[][];
}

// ==================== MODULE REGISTRY CONTRACT ====================
export interface IModuleRegistry {
  register(module: IModule): Promise<void>;
  unregister(moduleId: string): Promise<void>;
  
  get<T>(moduleId: string): T | undefined;
  getByContract<T>(contract: string): T | undefined;
  getAll(): ModuleInstance[];
  
  activate(moduleId: string): Promise<void>;
  deactivate(moduleId: string): Promise<void>;
  
  getDependencyGraph(): DependencyGraph;
  getLoadOrder(): string[];
  
  configure(moduleId: string, config: Record<string, unknown>): Promise<void>;
  getConfig(moduleId: string): Record<string, unknown> | undefined;
}

// ==================== MODULE REGISTRY IMPLEMENTATION ====================
class ModuleRegistryImpl implements IModuleRegistry {
  private modules: Map<string, ModuleInstance> = new Map();
  private contractProviders: Map<string, string> = new Map();

  async register(module: IModule): Promise<void> {
    const manifest = module.manifest;
    
    if (this.modules.has(manifest.id)) {
      throw new Error(`Module ${manifest.id} already registered`);
    }
    
    const validation = ModuleManifestSchema.safeParse(manifest);
    if (!validation.success) {
      throw new Error(`Invalid manifest: ${validation.error.message}`);
    }
    
    for (const dep of manifest.dependencies.filter(d => !d.optional)) {
      if (!this.modules.has(dep.moduleId)) {
        throw new Error(`Missing required dependency: ${dep.moduleId}`);
      }
    }
    
    for (const contract of manifest.provides) {
      if (this.contractProviders.has(contract.contract)) {
        const existing = this.contractProviders.get(contract.contract);
        console.warn(`[ModuleRegistry] Contract ${contract.contract} override: ${existing} -> ${manifest.id}`);
      }
      this.contractProviders.set(contract.contract, manifest.id);
    }
    
    this.modules.set(manifest.id, {
      manifest,
      state: ModuleStates.REGISTERED,
      instance: module,
      config: manifest.config?.defaults ?? {},
    });

    console.log(`[ModuleRegistry] Registered: ${manifest.id} (${manifest.type})`);
  }

  async unregister(moduleId: string): Promise<void> {
    const mod = this.modules.get(moduleId);
    if (!mod) return;
    
    const dependents = this.getDependents(moduleId);
    if (dependents.length > 0) {
      throw new Error(`Cannot unregister: ${dependents.join(', ')} depend on ${moduleId}`);
    }
    
    if (mod.state === ModuleStates.ACTIVE) {
      await this.deactivate(moduleId);
    }
    
    for (const contract of mod.manifest.provides) {
      if (this.contractProviders.get(contract.contract) === moduleId) {
        this.contractProviders.delete(contract.contract);
      }
    }
    
    this.modules.delete(moduleId);
    console.log(`[ModuleRegistry] Unregistered: ${moduleId}`);
  }

  get<T>(moduleId: string): T | undefined {
    const mod = this.modules.get(moduleId);
    return mod?.instance as T | undefined;
  }

  getByContract<T>(contract: string): T | undefined {
    const moduleId = this.contractProviders.get(contract);
    if (!moduleId) return undefined;
    return this.get<T>(moduleId);
  }

  getAll(): ModuleInstance[] {
    return Array.from(this.modules.values());
  }

  async activate(moduleId: string): Promise<void> {
    const mod = this.modules.get(moduleId);
    if (!mod) throw new Error(`Module not found: ${moduleId}`);
    
    if (mod.state === ModuleStates.ACTIVE) return;
    
    for (const dep of mod.manifest.dependencies.filter(d => !d.optional)) {
      const depMod = this.modules.get(dep.moduleId);
      if (depMod?.state !== ModuleStates.ACTIVE) {
        await this.activate(dep.moduleId);
      }
    }
    
    mod.state = ModuleStates.INITIALIZING;
    
    try {
      const instance = mod.instance as IModule;
      await instance.initialize(mod.config);
      await instance.activate();
      
      mod.state = ModuleStates.ACTIVE;
      mod.activatedAt = new Date();
      
      console.log(`[ModuleRegistry] Activated: ${moduleId}`);
    } catch (error) {
      mod.state = ModuleStates.ERROR;
      mod.error = error instanceof Error ? error.message : String(error);
      throw error;
    }
  }

  async deactivate(moduleId: string): Promise<void> {
    const mod = this.modules.get(moduleId);
    if (!mod) return;
    
    const dependents = this.getDependents(moduleId).filter(d => {
      const depMod = this.modules.get(d);
      return depMod?.state === ModuleStates.ACTIVE;
    });
    
    for (const dep of dependents) {
      await this.deactivate(dep);
    }
    
    try {
      const instance = mod.instance as IModule;
      await instance.deactivate();
      mod.state = ModuleStates.SUSPENDED;
      console.log(`[ModuleRegistry] Deactivated: ${moduleId}`);
    } catch (error) {
      mod.state = ModuleStates.ERROR;
      mod.error = error instanceof Error ? error.message : String(error);
      throw error;
    }
  }

  getDependencyGraph(): DependencyGraph {
    const nodes = new Map<string, DependencyNode>();
    
    for (const [id, mod] of this.modules) {
      nodes.set(id, {
        moduleId: id,
        dependencies: mod.manifest.dependencies.map(d => d.moduleId),
        dependents: [],
        level: 0,
      });
    }
    
    for (const [id, node] of nodes) {
      for (const dep of node.dependencies) {
        const depNode = nodes.get(dep);
        if (depNode) {
          depNode.dependents.push(id);
        }
      }
    }
    
    const { order, hasCycles, cycles } = this.topologicalSort(nodes);
    
    return {
      nodes,
      topologicalOrder: order,
      hasCycles,
      cycles,
    };
  }

  getLoadOrder(): string[] {
    const graph = this.getDependencyGraph();
    return graph.topologicalOrder;
  }

  async configure(moduleId: string, config: Record<string, unknown>): Promise<void> {
    const mod = this.modules.get(moduleId);
    if (!mod) throw new Error(`Module not found: ${moduleId}`);
    
    mod.config = { ...mod.config, ...config };
    
    if (mod.state === ModuleStates.ACTIVE) {
      const instance = mod.instance as IModule;
      await instance.deactivate();
      await instance.initialize(mod.config);
      await instance.activate();
    }
  }

  getConfig(moduleId: string): Record<string, unknown> | undefined {
    return this.modules.get(moduleId)?.config;
  }

  private getDependents(moduleId: string): string[] {
    return Array.from(this.modules.values())
      .filter(m => m.manifest.dependencies.some(d => d.moduleId === moduleId))
      .map(m => m.manifest.id);
  }

  private topologicalSort(nodes: Map<string, DependencyNode>): {
    order: string[];
    hasCycles: boolean;
    cycles?: string[][];
  } {
    const visited = new Set<string>();
    const stack = new Set<string>();
    const order: string[] = [];
    const cycles: string[][] = [];

    const visit = (id: string, path: string[]): boolean => {
      if (stack.has(id)) {
        cycles.push([...path, id]);
        return false;
      }
      if (visited.has(id)) return true;

      stack.add(id);
      const node = nodes.get(id);
      
      if (node) {
        for (const dep of node.dependencies) {
          if (!visit(dep, [...path, id])) {
            return false;
          }
        }
      }

      stack.delete(id);
      visited.add(id);
      order.push(id);
      return true;
    };

    for (const id of nodes.keys()) {
      if (!visited.has(id)) {
        visit(id, []);
      }
    }

    return {
      order,
      hasCycles: cycles.length > 0,
      cycles: cycles.length > 0 ? cycles : undefined,
    };
  }
}

// ==================== SINGLETON EXPORT ====================
export const moduleRegistry: IModuleRegistry = new ModuleRegistryImpl();

export default moduleRegistry;
