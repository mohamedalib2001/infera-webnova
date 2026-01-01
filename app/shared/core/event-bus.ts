/**
 * INFERA WebNova - Core Event Bus (محور الأحداث)
 * Event-Driven Architecture with Message Queue + Event Sourcing + CQRS
 * 
 * Central nervous system for all module communication
 * No direct coupling allowed between modules
 */

export interface EventMetadata {
  eventId: string;
  eventType: string;
  version: string;
  timestamp: Date;
  tenantId?: string;
  correlationId?: string;
  causationId?: string;
  source: string;
  sequence?: number;
  aggregateId?: string;
  aggregateType?: string;
}

export interface DomainEvent<T = unknown> {
  metadata: EventMetadata;
  payload: T;
}

export type EventHandler<T = unknown> = (event: DomainEvent<T>) => Promise<void>;

export interface EventSubscription {
  id: string;
  eventType: string;
  handler: EventHandler;
  filter?: (event: DomainEvent) => boolean;
  unsubscribe: () => void;
}

export interface IEventBus {
  publish<T>(event: DomainEvent<T>): Promise<void>;
  publishBatch<T>(events: DomainEvent<T>[]): Promise<void>;
  subscribe<T>(eventType: string, handler: EventHandler<T>, filter?: (event: DomainEvent<T>) => boolean): EventSubscription;
  subscribeAll(handler: EventHandler): EventSubscription;
  unsubscribe(subscriptionId: string): void;
  
  getEventHistory(query: EventQuery): DomainEvent[];
  replayEvents(query: EventQuery, handler: EventHandler): Promise<void>;
  
  getEventStore(): EventStore;
  getQueryStore(): QueryStore;
}

export interface EventQuery {
  eventType?: string;
  tenantId?: string;
  aggregateId?: string;
  aggregateType?: string;
  fromSequence?: number;
  toSequence?: number;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
}

export interface EventStore {
  append(event: DomainEvent): Promise<number>;
  getEvents(query: EventQuery): Promise<DomainEvent[]>;
  getLastSequence(): number;
  getSnapshot(aggregateId: string): Promise<AggregateSnapshot | null>;
  saveSnapshot(snapshot: AggregateSnapshot): Promise<void>;
}

export interface QueryStore {
  update(projection: string, data: unknown): Promise<void>;
  get<T>(projection: string, id: string): Promise<T | null>;
  query<T>(projection: string, filter: Record<string, unknown>): Promise<T[]>;
}

export interface AggregateSnapshot {
  aggregateId: string;
  aggregateType: string;
  version: number;
  state: unknown;
  timestamp: Date;
}

class InMemoryEventStore implements EventStore {
  private events: DomainEvent[] = [];
  private sequence = 0;
  private snapshots: Map<string, AggregateSnapshot> = new Map();

  async append(event: DomainEvent): Promise<number> {
    this.sequence++;
    event.metadata.sequence = this.sequence;
    this.events.push(event);
    
    if (this.events.length > 10000) {
      this.events = this.events.slice(-5000);
    }
    
    return this.sequence;
  }

  getEventsSync(query: EventQuery): DomainEvent[] {
    return this.filterEvents(query);
  }

  async getEvents(query: EventQuery): Promise<DomainEvent[]> {
    return this.filterEvents(query);
  }

  private filterEvents(query: EventQuery): DomainEvent[] {
    let results = [...this.events];

    if (query.eventType) {
      results = results.filter(e => e.metadata.eventType === query.eventType);
    }
    if (query.tenantId) {
      results = results.filter(e => e.metadata.tenantId === query.tenantId);
    }
    if (query.aggregateId) {
      results = results.filter(e => e.metadata.aggregateId === query.aggregateId);
    }
    if (query.aggregateType) {
      results = results.filter(e => e.metadata.aggregateType === query.aggregateType);
    }
    if (query.fromSequence !== undefined) {
      results = results.filter(e => (e.metadata.sequence || 0) >= query.fromSequence!);
    }
    if (query.toSequence !== undefined) {
      results = results.filter(e => (e.metadata.sequence || 0) <= query.toSequence!);
    }
    if (query.fromDate) {
      results = results.filter(e => e.metadata.timestamp >= query.fromDate!);
    }
    if (query.toDate) {
      results = results.filter(e => e.metadata.timestamp <= query.toDate!);
    }
    if (query.limit) {
      results = results.slice(-query.limit);
    }

    return results;
  }

  getDeadLetterQueue(): DomainEvent[] {
    return [];
  }

  getLastSequence(): number {
    return this.sequence;
  }

  async getSnapshot(aggregateId: string): Promise<AggregateSnapshot | null> {
    return this.snapshots.get(aggregateId) || null;
  }

  async saveSnapshot(snapshot: AggregateSnapshot): Promise<void> {
    this.snapshots.set(snapshot.aggregateId, snapshot);
  }
}

class InMemoryQueryStore implements QueryStore {
  private projections: Map<string, Map<string, unknown>> = new Map();

  async update(projection: string, data: unknown): Promise<void> {
    if (!this.projections.has(projection)) {
      this.projections.set(projection, new Map());
    }
    const store = this.projections.get(projection)!;
    const record = data as { id?: string };
    if (record.id) {
      store.set(record.id, data);
    }
  }

  async get<T>(projection: string, id: string): Promise<T | null> {
    const store = this.projections.get(projection);
    if (!store) return null;
    return (store.get(id) as T) || null;
  }

  async query<T>(projection: string, filter: Record<string, unknown>): Promise<T[]> {
    const store = this.projections.get(projection);
    if (!store) return [];
    
    let results = Array.from(store.values()) as T[];
    
    for (const [key, value] of Object.entries(filter)) {
      results = results.filter(item => (item as Record<string, unknown>)[key] === value);
    }
    
    return results;
  }
}

class EventBusImpl implements IEventBus {
  private handlers: Map<string, Map<string, { handler: EventHandler; filter?: (event: DomainEvent) => boolean }>> = new Map();
  private globalHandlers: Map<string, EventHandler> = new Map();
  private eventStore: EventStore;
  private queryStore: QueryStore;
  private deadLetterQueue: DomainEvent[] = [];
  private processingQueue: DomainEvent[] = [];
  private isProcessing = false;

  constructor() {
    this.eventStore = new InMemoryEventStore();
    this.queryStore = new InMemoryQueryStore();
    this.startQueueProcessor();
  }

  async publish<T>(event: DomainEvent<T>): Promise<void> {
    this.processingQueue.push(event as DomainEvent);
  }

  async publishBatch<T>(events: DomainEvent<T>[]): Promise<void> {
    for (const event of events) {
      this.processingQueue.push(event as DomainEvent);
    }
  }

  subscribe<T>(
    eventType: string,
    handler: EventHandler<T>,
    filter?: (event: DomainEvent<T>) => boolean
  ): EventSubscription {
    const subscriptionId = crypto.randomUUID();
    
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Map());
    }
    
    const typeHandlers = this.handlers.get(eventType)!;
    typeHandlers.set(subscriptionId, { 
      handler: handler as EventHandler, 
      filter: filter as ((event: DomainEvent) => boolean) | undefined
    });

    return {
      id: subscriptionId,
      eventType,
      handler: handler as EventHandler,
      filter: filter as ((event: DomainEvent) => boolean) | undefined,
      unsubscribe: () => {
        typeHandlers.delete(subscriptionId);
      }
    };
  }

  subscribeAll(handler: EventHandler): EventSubscription {
    const subscriptionId = crypto.randomUUID();
    this.globalHandlers.set(subscriptionId, handler);
    
    return {
      id: subscriptionId,
      eventType: '*',
      handler,
      unsubscribe: () => {
        this.globalHandlers.delete(subscriptionId);
      }
    };
  }

  unsubscribe(subscriptionId: string): void {
    for (const [_, typeHandlers] of Array.from(this.handlers)) {
      if (typeHandlers.has(subscriptionId)) {
        typeHandlers.delete(subscriptionId);
        return;
      }
    }
    this.globalHandlers.delete(subscriptionId);
  }

  getEventHistory(query: EventQuery): DomainEvent[] {
    const events = (this.eventStore as InMemoryEventStore).getEventsSync(query);
    return events;
  }

  async replayEvents(query: EventQuery, handler: EventHandler): Promise<void> {
    const events = await this.eventStore.getEvents(query);
    for (const event of events) {
      await handler(event);
    }
  }

  getEventStore(): EventStore {
    return this.eventStore;
  }

  getQueryStore(): QueryStore {
    return this.queryStore;
  }

  private async processEvent(event: DomainEvent): Promise<void> {
    await this.eventStore.append(event);

    const typeHandlers = this.handlers.get(event.metadata.eventType);
    const handlersToCall: EventHandler[] = [];

    if (typeHandlers) {
      for (const [_, { handler, filter }] of Array.from(typeHandlers)) {
        if (!filter || filter(event)) {
          handlersToCall.push(handler);
        }
      }
    }

    for (const handler of Array.from(this.globalHandlers.values())) {
      handlersToCall.push(handler);
    }

    const results = await Promise.allSettled(
      handlersToCall.map(handler => handler(event))
    );

    const failures = results.filter(r => r.status === 'rejected');
    if (failures.length > 0) {
      console.error(`[EventBus] ${failures.length} handlers failed for ${event.metadata.eventType}`);
      
      if (failures.length === handlersToCall.length) {
        this.deadLetterQueue.push(event);
        if (this.deadLetterQueue.length > 1000) {
          this.deadLetterQueue.shift();
        }
      }
    }
  }

  private startQueueProcessor(): void {
    setInterval(async () => {
      if (this.isProcessing || this.processingQueue.length === 0) return;

      this.isProcessing = true;
      
      const batch = this.processingQueue.splice(0, 10);
      
      for (const event of batch) {
        try {
          await this.processEvent(event);
        } catch (error) {
          console.error(`[EventBus] Failed to process event:`, error);
          this.deadLetterQueue.push(event);
        }
      }

      this.isProcessing = false;
    }, 10);
  }
}

export const eventBus: IEventBus = new EventBusImpl();

export function createEvent<T>(
  eventType: string,
  payload: T,
  options: Partial<EventMetadata> = {}
): DomainEvent<T> {
  return {
    metadata: {
      eventId: crypto.randomUUID(),
      eventType,
      version: '1.0',
      timestamp: new Date(),
      source: options.source || 'infera-webnova',
      correlationId: options.correlationId || crypto.randomUUID(),
      ...options
    },
    payload
  };
}

export function createCommand<T>(
  commandType: string,
  payload: T,
  options: Partial<EventMetadata> = {}
): DomainEvent<T> {
  return createEvent(`command.${commandType}`, payload, {
    ...options,
    source: options.source || 'command-handler',
  });
}

export function createQuery<T>(
  queryType: string,
  payload: T,
  options: Partial<EventMetadata> = {}
): DomainEvent<T> {
  return createEvent(`query.${queryType}`, payload, {
    ...options,
    source: options.source || 'query-handler',
  });
}

export const EventTypes = {
  BLUEPRINT_DRAFTED: 'blueprint.drafted',
  BLUEPRINT_APPROVED: 'blueprint.approved',
  BLUEPRINT_REJECTED: 'blueprint.rejected',
  BLUEPRINT_UPDATED: 'blueprint.updated',
  
  GENERATION_STARTED: 'generation.started',
  GENERATION_PROGRESS: 'generation.progress',
  GENERATION_COMPLETED: 'generation.completed',
  GENERATION_FAILED: 'generation.failed',
  
  ARTIFACTS_READY: 'artifacts.ready',
  VALIDATION_ISSUED: 'validation.issued',
  
  RUNTIME_STARTED: 'runtime.started',
  RUNTIME_STOPPED: 'runtime.stopped',
  RUNTIME_ERROR: 'runtime.error',
  RUNTIME_METRICS: 'runtime.metrics',
  
  TASK_QUEUED: 'ai.task.queued',
  TASK_STARTED: 'ai.task.started',
  TASK_COMPLETED: 'ai.task.completed',
  TASK_FAILED: 'ai.task.failed',
  
  VERSION_COMMITTED: 'versioning.committed',
  VERSION_RESTORED: 'versioning.restored',
  VERSION_TAGGED: 'versioning.tagged',
  
  TENANT_CREATED: 'tenant.created',
  TENANT_UPDATED: 'tenant.updated',
  TENANT_SUSPENDED: 'tenant.suspended',
  TENANT_QUOTA_EXCEEDED: 'tenant.quota.exceeded',
  
  DEPLOYMENT_REQUESTED: 'deployment.requested',
  DEPLOYMENT_STARTED: 'deployment.started',
  DEPLOYMENT_COMPLETED: 'deployment.completed',
  DEPLOYMENT_FAILED: 'deployment.failed',
  DEPLOYMENT_ROLLED_BACK: 'deployment.rolledback',
  
  PLUGIN_REGISTERED: 'plugin.registered',
  PLUGIN_ACTIVATED: 'plugin.activated',
  PLUGIN_DEACTIVATED: 'plugin.deactivated',
  PLUGIN_ERROR: 'plugin.error',
  
  DATA_INGESTED: 'datalake.ingested',
  DATA_READY: 'datalake.ready',
  
  SECURITY_ALERT: 'security.alert',
  SECURITY_SCAN_COMPLETED: 'security.scan.completed',
  
  COMPLIANCE_CHECK: 'compliance.check',
  COMPLIANCE_VIOLATION: 'compliance.violation',
  
  ACTION_LOGGED: 'audit.action.logged',
  
  SYSTEM_HEALTH_CHANGED: 'system.health.changed',
  SYSTEM_MAINTENANCE: 'system.maintenance',
  
  AI_ANALYSIS_COMPLETED: 'ai.analysis.completed',
  AI_PLAN_CREATED: 'ai.plan.created',
  AI_EXECUTION_STARTED: 'ai.execution.started',
  AI_EXECUTION_COMPLETED: 'ai.execution.completed',
  AI_EXECUTION_FAILED: 'ai.execution.failed',
  AI_OPTIMIZATION_PROPOSED: 'ai.optimization.proposed',
} as const;

export type EventTypeKey = keyof typeof EventTypes;
export type EventTypeValue = typeof EventTypes[EventTypeKey];
