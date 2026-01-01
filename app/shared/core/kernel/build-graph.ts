/**
 * INFERA WebNova - Build Graph System (نظام رسم البناء)
 * Layer 2: Unified Build System
 * 
 * ليس CI/CD فقط، بل:
 * - Dependency Graph
 * - Capability Graph  
 * - Permission Graph
 * - Multi-Language Runtime Slots
 */

import { z } from 'zod';

// ==================== RUNTIME SLOT TYPES ====================
export const RuntimeSlotTypes = {
  JAVASCRIPT: 'JAVASCRIPT',
  TYPESCRIPT: 'TYPESCRIPT',
  RUST: 'RUST',
  PYTHON: 'PYTHON',
  GO: 'GO',
  WASM: 'WASM',
  RESERVED_1: 'RESERVED_1',
  RESERVED_2: 'RESERVED_2',
  RESERVED_3: 'RESERVED_3',
  FUTURE: 'FUTURE',
} as const;

export type RuntimeSlotType = typeof RuntimeSlotTypes[keyof typeof RuntimeSlotTypes];

// ==================== RUNTIME SLOT SCHEMA ====================
export const RuntimeSlotSchema = z.object({
  id: z.string(),
  type: z.enum([
    'JAVASCRIPT', 'TYPESCRIPT', 'RUST', 'PYTHON', 'GO', 
    'WASM', 'RESERVED_1', 'RESERVED_2', 'RESERVED_3', 'FUTURE'
  ]),
  version: z.string(),
  installed: z.boolean(),
  capabilities: z.array(z.string()),
  
  compiler: z.object({
    name: z.string(),
    version: z.string(),
    command: z.string().optional(),
  }).optional(),
  
  runtime: z.object({
    name: z.string(),
    version: z.string(),
    command: z.string().optional(),
  }).optional(),
  
  packageManager: z.object({
    name: z.string(),
    command: z.string(),
    lockFile: z.string().optional(),
  }).optional(),
  
  extensions: z.array(z.string()),
  buildTargets: z.array(z.string()),
});

export type RuntimeSlot = z.infer<typeof RuntimeSlotSchema>;

// ==================== BUILD NODE TYPES ====================
export const BuildNodeTypes = {
  SOURCE: 'SOURCE',
  TRANSFORM: 'TRANSFORM',
  BUNDLE: 'BUNDLE',
  ARTIFACT: 'ARTIFACT',
  DEPENDENCY: 'DEPENDENCY',
  CONFIG: 'CONFIG',
  ASSET: 'ASSET',
} as const;

export type BuildNodeType = typeof BuildNodeTypes[keyof typeof BuildNodeTypes];

// ==================== BUILD NODE SCHEMA ====================
export const BuildNodeSchema = z.object({
  id: z.string(),
  type: z.enum(['SOURCE', 'TRANSFORM', 'BUNDLE', 'ARTIFACT', 'DEPENDENCY', 'CONFIG', 'ASSET']),
  name: z.string(),
  path: z.string().optional(),
  
  runtime: z.string().optional(),
  
  inputs: z.array(z.string()),
  outputs: z.array(z.string()),
  
  transform: z.object({
    type: z.string(),
    config: z.record(z.unknown()),
  }).optional(),
  
  metadata: z.object({
    hash: z.string().optional(),
    size: z.number().optional(),
    lastModified: z.date().optional(),
    dependencies: z.array(z.string()).optional(),
  }).optional(),
  
  cache: z.object({
    enabled: z.boolean(),
    key: z.string().optional(),
    ttl: z.number().optional(),
  }).optional(),
});

export type BuildNode = z.infer<typeof BuildNodeSchema>;

// ==================== BUILD EDGE SCHEMA ====================
export const BuildEdgeSchema = z.object({
  id: z.string(),
  from: z.string(),
  to: z.string(),
  type: z.enum(['depends', 'produces', 'transforms', 'includes']),
  metadata: z.record(z.unknown()).optional(),
});

export type BuildEdge = z.infer<typeof BuildEdgeSchema>;

// ==================== BUILD GRAPH SCHEMA ====================
export const BuildGraphSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  
  nodes: z.array(BuildNodeSchema),
  edges: z.array(BuildEdgeSchema),
  
  runtimes: z.array(z.string()),
  targets: z.array(z.string()),
  
  config: z.object({
    parallelism: z.number().default(4),
    cacheEnabled: z.boolean().default(true),
    incrementalBuild: z.boolean().default(true),
    sourceMaps: z.boolean().default(true),
  }),
  
  provenance: z.object({
    createdAt: z.date(),
    createdBy: z.string(),
    buildId: z.string(),
    commitHash: z.string().optional(),
  }),
});

export type BuildGraph = z.infer<typeof BuildGraphSchema>;

// ==================== BUILD ARTIFACT SCHEMA ====================
export const BuildArtifactSchema = z.object({
  id: z.string(),
  graphId: z.string(),
  nodeId: z.string(),
  
  type: z.enum(['binary', 'bundle', 'archive', 'image', 'config', 'manifest']),
  path: z.string(),
  
  metadata: z.object({
    size: z.number(),
    hash: z.string(),
    mimeType: z.string().optional(),
    platform: z.string().optional(),
    architecture: z.string().optional(),
  }),
  
  provenance: z.object({
    builtAt: z.date(),
    buildDuration: z.number(),
    inputs: z.array(z.string()),
    runtimeVersion: z.string(),
  }),
  
  signature: z.string().optional(),
});

export type BuildArtifact = z.infer<typeof BuildArtifactSchema>;

// ==================== BUILD RESULT ====================
export interface BuildResult {
  success: boolean;
  graphId: string;
  duration: number;
  artifacts: BuildArtifact[];
  errors: BuildError[];
  warnings: BuildWarning[];
  stats: BuildStats;
}

export interface BuildError {
  nodeId: string;
  code: string;
  message: string;
  file?: string;
  line?: number;
  column?: number;
}

export interface BuildWarning {
  nodeId: string;
  code: string;
  message: string;
  file?: string;
}

export interface BuildStats {
  nodesProcessed: number;
  nodesSkipped: number;
  cacheHits: number;
  cacheMisses: number;
  totalSize: number;
}

// ==================== RUNTIME SLOT REGISTRY ====================
export interface IRuntimeSlotRegistry {
  register(slot: RuntimeSlot): Promise<void>;
  unregister(slotId: string): Promise<void>;
  get(slotId: string): RuntimeSlot | undefined;
  getByType(type: RuntimeSlotType): RuntimeSlot | undefined;
  getAll(): RuntimeSlot[];
  isInstalled(slotId: string): boolean;
}

// ==================== BUILD GRAPH ENGINE ====================
export interface IBuildGraphEngine {
  createGraph(name: string, config?: Partial<BuildGraph['config']>): BuildGraph;
  
  addNode(graphId: string, node: BuildNode): void;
  removeNode(graphId: string, nodeId: string): void;
  addEdge(graphId: string, edge: BuildEdge): void;
  removeEdge(graphId: string, edgeId: string): void;
  
  build(graphId: string): Promise<BuildResult>;
  incrementalBuild(graphId: string, changedNodes: string[]): Promise<BuildResult>;
  
  validate(graphId: string): ValidationResult;
  getGraph(graphId: string): BuildGraph | undefined;
  
  getTopologicalOrder(graphId: string): string[];
  getAffectedNodes(graphId: string, changedNodes: string[]): string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ==================== RUNTIME SLOT REGISTRY IMPLEMENTATION ====================
class RuntimeSlotRegistryImpl implements IRuntimeSlotRegistry {
  private slots: Map<string, RuntimeSlot> = new Map();
  
  constructor() {
    this.registerDefaultSlots();
  }
  
  private registerDefaultSlots(): void {
    const jsSlot: RuntimeSlot = {
      id: 'js-runtime',
      type: RuntimeSlotTypes.JAVASCRIPT,
      version: '1.0.0',
      installed: true,
      capabilities: ['async', 'modules', 'workers'],
      runtime: { name: 'Node.js', version: '20.x', command: 'node' },
      packageManager: { name: 'npm', command: 'npm', lockFile: 'package-lock.json' },
      extensions: ['.js', '.mjs', '.cjs'],
      buildTargets: ['browser', 'node', 'edge'],
    };
    
    const tsSlot: RuntimeSlot = {
      id: 'ts-runtime',
      type: RuntimeSlotTypes.TYPESCRIPT,
      version: '1.0.0',
      installed: true,
      capabilities: ['types', 'async', 'modules', 'decorators'],
      compiler: { name: 'tsc', version: '5.x', command: 'tsc' },
      runtime: { name: 'Node.js', version: '20.x', command: 'node' },
      packageManager: { name: 'npm', command: 'npm', lockFile: 'package-lock.json' },
      extensions: ['.ts', '.tsx', '.mts', '.cts'],
      buildTargets: ['browser', 'node', 'edge'],
    };
    
    const pythonSlot: RuntimeSlot = {
      id: 'python-runtime',
      type: RuntimeSlotTypes.PYTHON,
      version: '1.0.0',
      installed: false,
      capabilities: ['async', 'typing', 'multiprocessing'],
      runtime: { name: 'Python', version: '3.11', command: 'python3' },
      packageManager: { name: 'pip', command: 'pip', lockFile: 'requirements.txt' },
      extensions: ['.py', '.pyw'],
      buildTargets: ['native', 'container', 'serverless'],
    };
    
    const rustSlot: RuntimeSlot = {
      id: 'rust-runtime',
      type: RuntimeSlotTypes.RUST,
      version: '1.0.0',
      installed: false,
      capabilities: ['systems', 'async', 'wasm', 'ffi'],
      compiler: { name: 'rustc', version: '1.75', command: 'rustc' },
      packageManager: { name: 'cargo', command: 'cargo', lockFile: 'Cargo.lock' },
      extensions: ['.rs'],
      buildTargets: ['native', 'wasm', 'embedded'],
    };
    
    const goSlot: RuntimeSlot = {
      id: 'go-runtime',
      type: RuntimeSlotTypes.GO,
      version: '1.0.0',
      installed: false,
      capabilities: ['concurrency', 'networking', 'cross-compile'],
      compiler: { name: 'go', version: '1.21', command: 'go build' },
      runtime: { name: 'Go', version: '1.21', command: 'go run' },
      packageManager: { name: 'go mod', command: 'go mod', lockFile: 'go.sum' },
      extensions: ['.go'],
      buildTargets: ['native', 'container', 'serverless'],
    };
    
    const wasmSlot: RuntimeSlot = {
      id: 'wasm-runtime',
      type: RuntimeSlotTypes.WASM,
      version: '1.0.0',
      installed: false,
      capabilities: ['sandboxed', 'portable', 'performance'],
      extensions: ['.wasm', '.wat'],
      buildTargets: ['browser', 'edge', 'embedded'],
    };
    
    const futureSlot: RuntimeSlot = {
      id: 'future-runtime',
      type: RuntimeSlotTypes.FUTURE,
      version: '0.0.0',
      installed: false,
      capabilities: [],
      extensions: [],
      buildTargets: [],
    };
    
    this.slots.set(jsSlot.id, jsSlot);
    this.slots.set(tsSlot.id, tsSlot);
    this.slots.set(pythonSlot.id, pythonSlot);
    this.slots.set(rustSlot.id, rustSlot);
    this.slots.set(goSlot.id, goSlot);
    this.slots.set(wasmSlot.id, wasmSlot);
    this.slots.set(futureSlot.id, futureSlot);
  }

  async register(slot: RuntimeSlot): Promise<void> {
    this.slots.set(slot.id, slot);
    console.log(`[RuntimeSlots] Registered: ${slot.id} (${slot.type})`);
  }

  async unregister(slotId: string): Promise<void> {
    this.slots.delete(slotId);
  }

  get(slotId: string): RuntimeSlot | undefined {
    return this.slots.get(slotId);
  }

  getByType(type: RuntimeSlotType): RuntimeSlot | undefined {
    return Array.from(this.slots.values()).find(s => s.type === type);
  }

  getAll(): RuntimeSlot[] {
    return Array.from(this.slots.values());
  }

  isInstalled(slotId: string): boolean {
    return this.slots.get(slotId)?.installed ?? false;
  }
}

// ==================== BUILD GRAPH ENGINE IMPLEMENTATION ====================
class BuildGraphEngineImpl implements IBuildGraphEngine {
  private graphs: Map<string, BuildGraph> = new Map();
  private buildCounter = 0;

  createGraph(name: string, config?: Partial<BuildGraph['config']>): BuildGraph {
    const id = `graph-${Date.now()}-${++this.buildCounter}`;
    
    const graph: BuildGraph = {
      id,
      name,
      version: '1.0.0',
      nodes: [],
      edges: [],
      runtimes: [],
      targets: [],
      config: {
        parallelism: config?.parallelism ?? 4,
        cacheEnabled: config?.cacheEnabled ?? true,
        incrementalBuild: config?.incrementalBuild ?? true,
        sourceMaps: config?.sourceMaps ?? true,
      },
      provenance: {
        createdAt: new Date(),
        createdBy: 'system',
        buildId: id,
      },
    };
    
    this.graphs.set(id, graph);
    return graph;
  }

  addNode(graphId: string, node: BuildNode): void {
    const graph = this.graphs.get(graphId);
    if (!graph) throw new Error(`Graph not found: ${graphId}`);
    graph.nodes.push(node);
  }

  removeNode(graphId: string, nodeId: string): void {
    const graph = this.graphs.get(graphId);
    if (!graph) return;
    
    graph.nodes = graph.nodes.filter(n => n.id !== nodeId);
    graph.edges = graph.edges.filter(e => e.from !== nodeId && e.to !== nodeId);
  }

  addEdge(graphId: string, edge: BuildEdge): void {
    const graph = this.graphs.get(graphId);
    if (!graph) throw new Error(`Graph not found: ${graphId}`);
    graph.edges.push(edge);
  }

  removeEdge(graphId: string, edgeId: string): void {
    const graph = this.graphs.get(graphId);
    if (!graph) return;
    graph.edges = graph.edges.filter(e => e.id !== edgeId);
  }

  async build(graphId: string): Promise<BuildResult> {
    const graph = this.graphs.get(graphId);
    if (!graph) {
      return {
        success: false,
        graphId,
        duration: 0,
        artifacts: [],
        errors: [{ nodeId: '', code: 'GRAPH_NOT_FOUND', message: `Graph not found: ${graphId}` }],
        warnings: [],
        stats: { nodesProcessed: 0, nodesSkipped: 0, cacheHits: 0, cacheMisses: 0, totalSize: 0 },
      };
    }

    const startTime = Date.now();
    const order = this.getTopologicalOrder(graphId);
    const artifacts: BuildArtifact[] = [];
    const errors: BuildError[] = [];
    const warnings: BuildWarning[] = [];
    let nodesProcessed = 0;

    for (const nodeId of order) {
      const node = graph.nodes.find(n => n.id === nodeId);
      if (!node) continue;
      
      try {
        nodesProcessed++;
        
        if (node.type === BuildNodeTypes.ARTIFACT) {
          artifacts.push({
            id: `artifact-${node.id}`,
            graphId,
            nodeId: node.id,
            type: 'bundle',
            path: node.path ?? `/dist/${node.name}`,
            metadata: {
              size: 0,
              hash: `hash-${Date.now()}`,
            },
            provenance: {
              builtAt: new Date(),
              buildDuration: Date.now() - startTime,
              inputs: node.inputs,
              runtimeVersion: '1.0.0',
            },
          });
        }
      } catch (error) {
        errors.push({
          nodeId: node.id,
          code: 'BUILD_ERROR',
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return {
      success: errors.length === 0,
      graphId,
      duration: Date.now() - startTime,
      artifacts,
      errors,
      warnings,
      stats: {
        nodesProcessed,
        nodesSkipped: 0,
        cacheHits: 0,
        cacheMisses: nodesProcessed,
        totalSize: artifacts.reduce((sum, a) => sum + a.metadata.size, 0),
      },
    };
  }

  async incrementalBuild(graphId: string, changedNodes: string[]): Promise<BuildResult> {
    const affected = this.getAffectedNodes(graphId, changedNodes);
    console.log(`[BuildGraph] Incremental build: ${affected.length} nodes affected`);
    return this.build(graphId);
  }

  validate(graphId: string): ValidationResult {
    const graph = this.graphs.get(graphId);
    if (!graph) {
      return { valid: false, errors: [`Graph not found: ${graphId}`], warnings: [] };
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    
    const nodeIds = new Set(graph.nodes.map(n => n.id));
    
    for (const edge of graph.edges) {
      if (!nodeIds.has(edge.from)) {
        errors.push(`Edge references missing node: ${edge.from}`);
      }
      if (!nodeIds.has(edge.to)) {
        errors.push(`Edge references missing node: ${edge.to}`);
      }
    }
    
    return { valid: errors.length === 0, errors, warnings };
  }

  getGraph(graphId: string): BuildGraph | undefined {
    return this.graphs.get(graphId);
  }

  getTopologicalOrder(graphId: string): string[] {
    const graph = this.graphs.get(graphId);
    if (!graph) return [];

    const inDegree = new Map<string, number>();
    const adjacency = new Map<string, string[]>();
    
    for (const node of graph.nodes) {
      inDegree.set(node.id, 0);
      adjacency.set(node.id, []);
    }
    
    for (const edge of graph.edges) {
      if (edge.type === 'depends') {
        adjacency.get(edge.from)?.push(edge.to);
        inDegree.set(edge.to, (inDegree.get(edge.to) ?? 0) + 1);
      }
    }
    
    const queue = Array.from(inDegree.entries())
      .filter(([_, deg]) => deg === 0)
      .map(([id]) => id);
    
    const result: string[] = [];
    
    while (queue.length > 0) {
      const node = queue.shift()!;
      result.push(node);
      
      for (const neighbor of adjacency.get(node) ?? []) {
        const newDegree = (inDegree.get(neighbor) ?? 0) - 1;
        inDegree.set(neighbor, newDegree);
        if (newDegree === 0) {
          queue.push(neighbor);
        }
      }
    }
    
    return result;
  }

  getAffectedNodes(graphId: string, changedNodes: string[]): string[] {
    const graph = this.graphs.get(graphId);
    if (!graph) return [];

    const affected = new Set<string>(changedNodes);
    const adjacency = new Map<string, string[]>();
    
    for (const node of graph.nodes) {
      adjacency.set(node.id, []);
    }
    
    for (const edge of graph.edges) {
      if (edge.type === 'depends') {
        adjacency.get(edge.from)?.push(edge.to);
      }
    }
    
    const queue = [...changedNodes];
    while (queue.length > 0) {
      const node = queue.shift()!;
      for (const dependent of adjacency.get(node) ?? []) {
        if (!affected.has(dependent)) {
          affected.add(dependent);
          queue.push(dependent);
        }
      }
    }
    
    return Array.from(affected);
  }
}

// ==================== SINGLETON EXPORTS ====================
export const runtimeSlotRegistry: IRuntimeSlotRegistry = new RuntimeSlotRegistryImpl();
export const buildGraphEngine: IBuildGraphEngine = new BuildGraphEngineImpl();

export default { runtimeSlotRegistry, buildGraphEngine };
