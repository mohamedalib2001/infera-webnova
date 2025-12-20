/**
 * INFERA WebNova - Data Fabric System (نسيج البيانات)
 * Layer 4: Unified Data Abstraction Layer
 * 
 * لا يوجد DB مباشر في الكود
 * كل شيء عبر: Data Contracts + Storage Adapters
 * 
 * اليوم: SQL / NoSQL / Vector
 * غدًا: Quantum DB - بدون تعديل كود
 */

import { z } from 'zod';

// ==================== DATA SOURCE TYPES ====================
export const DataSourceTypes = {
  SQL: 'SQL',
  NOSQL: 'NOSQL',
  VECTOR: 'VECTOR',
  GRAPH: 'GRAPH',
  TIMESERIES: 'TIMESERIES',
  OBJECT_STORAGE: 'OBJECT_STORAGE',
  CACHE: 'CACHE',
  SEARCH: 'SEARCH',
  QUANTUM: 'QUANTUM',
} as const;

export type DataSourceType = typeof DataSourceTypes[keyof typeof DataSourceTypes];

// ==================== DATA CONTRACT SCHEMA ====================
export const DataContractSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  
  entity: z.object({
    name: z.string(),
    primaryKey: z.string(),
    fields: z.array(z.object({
      name: z.string(),
      type: z.string(),
      nullable: z.boolean().default(false),
      indexed: z.boolean().default(false),
      unique: z.boolean().default(false),
      default: z.unknown().optional(),
      validation: z.object({
        min: z.number().optional(),
        max: z.number().optional(),
        pattern: z.string().optional(),
        enum: z.array(z.string()).optional(),
      }).optional(),
    })),
    relations: z.array(z.object({
      name: z.string(),
      target: z.string(),
      type: z.enum(['one-to-one', 'one-to-many', 'many-to-one', 'many-to-many']),
      foreignKey: z.string(),
    })).optional(),
  }),
  
  capabilities: z.array(z.enum([
    'create', 'read', 'update', 'delete',
    'query', 'aggregate', 'stream', 'subscribe'
  ])),
  
  constraints: z.array(z.object({
    type: z.enum(['unique', 'check', 'foreign_key', 'index']),
    fields: z.array(z.string()),
    condition: z.string().optional(),
  })).optional(),
  
  metadata: z.object({
    createdAt: z.date(),
    updatedAt: z.date(),
    owner: z.string(),
    tags: z.array(z.string()).optional(),
  }),
});

export type DataContract = z.infer<typeof DataContractSchema>;

// ==================== STORAGE ADAPTER SCHEMA ====================
export const StorageAdapterSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum([
    'SQL', 'NOSQL', 'VECTOR', 'GRAPH', 
    'TIMESERIES', 'OBJECT_STORAGE', 'CACHE', 'SEARCH', 'QUANTUM'
  ]),
  
  connection: z.object({
    host: z.string().optional(),
    port: z.number().optional(),
    database: z.string().optional(),
    credentials: z.string().optional(),
    options: z.record(z.unknown()).optional(),
  }),
  
  capabilities: z.array(z.string()),
  
  pooling: z.object({
    enabled: z.boolean().default(true),
    min: z.number().default(2),
    max: z.number().default(10),
    idleTimeout: z.number().default(30000),
  }).optional(),
  
  health: z.object({
    checkInterval: z.number().default(30000),
    timeout: z.number().default(5000),
  }).optional(),
});

export type StorageAdapter = z.infer<typeof StorageAdapterSchema>;

// ==================== QUERY SCHEMA ====================
export const QuerySchema = z.object({
  contract: z.string(),
  operation: z.enum(['find', 'findOne', 'create', 'update', 'delete', 'aggregate', 'raw']),
  
  filters: z.array(z.object({
    field: z.string(),
    operator: z.enum(['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'nin', 'like', 'regex', 'between', 'null', 'notnull']),
    value: z.unknown(),
  })).optional(),
  
  sort: z.array(z.object({
    field: z.string(),
    direction: z.enum(['asc', 'desc']),
  })).optional(),
  
  pagination: z.object({
    limit: z.number(),
    offset: z.number().optional(),
    cursor: z.string().optional(),
  }).optional(),
  
  select: z.array(z.string()).optional(),
  include: z.array(z.string()).optional(),
  
  transaction: z.string().optional(),
});

export type Query = z.infer<typeof QuerySchema>;

// ==================== QUERY RESULT ====================
export interface QueryResult<T = unknown> {
  success: boolean;
  data: T | T[] | null;
  count?: number;
  cursor?: string;
  affected?: number;
  error?: string;
  metadata?: {
    duration: number;
    cached: boolean;
    adapter: string;
  };
}

// ==================== STORAGE ADAPTER INTERFACE ====================
export interface IStorageAdapter {
  readonly id: string;
  readonly type: DataSourceType;
  
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  getHealth(): AdapterHealth;
  
  execute<T>(query: Query): Promise<QueryResult<T>>;
  executeRaw<T>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;
  
  beginTransaction(): Promise<string>;
  commitTransaction(txId: string): Promise<void>;
  rollbackTransaction(txId: string): Promise<void>;
}

export interface AdapterHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency: number;
  lastCheck: Date;
  error?: string;
}

// ==================== DATA FABRIC INTERFACE ====================
export interface IDataFabric {
  registerContract(contract: DataContract): Promise<void>;
  unregisterContract(contractId: string): Promise<void>;
  getContract(contractId: string): DataContract | undefined;
  getAllContracts(): DataContract[];
  
  registerAdapter(adapter: IStorageAdapter): Promise<void>;
  unregisterAdapter(adapterId: string): Promise<void>;
  getAdapter(adapterId: string): IStorageAdapter | undefined;
  getAllAdapters(): IStorageAdapter[];
  
  bindContractToAdapter(contractId: string, adapterId: string): void;
  
  query<T>(query: Query): Promise<QueryResult<T>>;
  
  migrate(contractId: string): Promise<MigrationResult>;
  getMigrationStatus(): MigrationStatus[];
}

export interface MigrationResult {
  success: boolean;
  contractId: string;
  appliedMigrations: string[];
  errors: string[];
}

export interface MigrationStatus {
  contractId: string;
  version: string;
  appliedAt: Date;
  status: 'applied' | 'pending' | 'failed';
}

// ==================== VIRTUAL QUERY LAYER ====================
export interface IQueryVirtualizer {
  virtualize(query: Query): VirtualizedQuery;
  execute<T>(vQuery: VirtualizedQuery): Promise<QueryResult<T>>;
  optimize(query: Query): Query;
  explain(query: Query): QueryPlan;
}

export interface VirtualizedQuery {
  originalQuery: Query;
  optimizedQuery: Query;
  targetAdapter: string;
  transformations: QueryTransformation[];
}

export interface QueryTransformation {
  type: 'rewrite' | 'split' | 'merge' | 'cache' | 'index';
  before: string;
  after: string;
  reason: string;
}

export interface QueryPlan {
  steps: QueryPlanStep[];
  estimatedCost: number;
  indexes: string[];
  warnings: string[];
}

export interface QueryPlanStep {
  type: string;
  operation: string;
  cost: number;
  rows: number;
}

// ==================== DATA FABRIC IMPLEMENTATION ====================
class DataFabricImpl implements IDataFabric {
  private contracts: Map<string, DataContract> = new Map();
  private adapters: Map<string, IStorageAdapter> = new Map();
  private bindings: Map<string, string> = new Map();

  async registerContract(contract: DataContract): Promise<void> {
    const validation = DataContractSchema.safeParse(contract);
    if (!validation.success) {
      throw new Error(`Invalid contract: ${validation.error.message}`);
    }
    this.contracts.set(contract.id, contract);
    console.log(`[DataFabric] Contract registered: ${contract.id}`);
  }

  async unregisterContract(contractId: string): Promise<void> {
    this.contracts.delete(contractId);
    this.bindings.delete(contractId);
  }

  getContract(contractId: string): DataContract | undefined {
    return this.contracts.get(contractId);
  }

  getAllContracts(): DataContract[] {
    return Array.from(this.contracts.values());
  }

  async registerAdapter(adapter: IStorageAdapter): Promise<void> {
    this.adapters.set(adapter.id, adapter);
    console.log(`[DataFabric] Adapter registered: ${adapter.id} (${adapter.type})`);
  }

  async unregisterAdapter(adapterId: string): Promise<void> {
    const adapter = this.adapters.get(adapterId);
    if (adapter?.isConnected()) {
      await adapter.disconnect();
    }
    this.adapters.delete(adapterId);
    
    for (const [contractId, boundAdapter] of this.bindings) {
      if (boundAdapter === adapterId) {
        this.bindings.delete(contractId);
      }
    }
  }

  getAdapter(adapterId: string): IStorageAdapter | undefined {
    return this.adapters.get(adapterId);
  }

  getAllAdapters(): IStorageAdapter[] {
    return Array.from(this.adapters.values());
  }

  bindContractToAdapter(contractId: string, adapterId: string): void {
    if (!this.contracts.has(contractId)) {
      throw new Error(`Contract not found: ${contractId}`);
    }
    if (!this.adapters.has(adapterId)) {
      throw new Error(`Adapter not found: ${adapterId}`);
    }
    this.bindings.set(contractId, adapterId);
    console.log(`[DataFabric] Bound ${contractId} -> ${adapterId}`);
  }

  async query<T>(query: Query): Promise<QueryResult<T>> {
    const adapterId = this.bindings.get(query.contract);
    if (!adapterId) {
      return {
        success: false,
        data: null,
        error: `No adapter bound for contract: ${query.contract}`,
      };
    }

    const adapter = this.adapters.get(adapterId);
    if (!adapter) {
      return {
        success: false,
        data: null,
        error: `Adapter not found: ${adapterId}`,
      };
    }

    if (!adapter.isConnected()) {
      await adapter.connect();
    }

    return adapter.execute<T>(query);
  }

  async migrate(contractId: string): Promise<MigrationResult> {
    const contract = this.contracts.get(contractId);
    if (!contract) {
      return {
        success: false,
        contractId,
        appliedMigrations: [],
        errors: [`Contract not found: ${contractId}`],
      };
    }

    return {
      success: true,
      contractId,
      appliedMigrations: ['initial'],
      errors: [],
    };
  }

  getMigrationStatus(): MigrationStatus[] {
    return Array.from(this.contracts.values()).map(c => ({
      contractId: c.id,
      version: c.version,
      appliedAt: c.metadata.updatedAt,
      status: 'applied' as const,
    }));
  }
}

// ==================== SINGLETON EXPORT ====================
export const dataFabric: IDataFabric = new DataFabricImpl();

export default dataFabric;
