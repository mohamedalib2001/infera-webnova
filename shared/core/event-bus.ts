/**
 * INFERA WebNova - Event Bus System
 * Core event-driven communication layer for modular architecture
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
}

export interface DomainEvent<T = unknown> {
  metadata: EventMetadata;
  payload: T;
}

export type EventHandler<T = unknown> = (event: DomainEvent<T>) => Promise<void>;

export interface EventSubscription {
  eventType: string;
  handler: EventHandler;
  unsubscribe: () => void;
}

export interface IEventBus {
  publish<T>(event: DomainEvent<T>): Promise<void>;
  subscribe<T>(eventType: string, handler: EventHandler<T>): EventSubscription;
  subscribeAll(handler: EventHandler): EventSubscription;
  getEventHistory(eventType?: string, limit?: number): DomainEvent[];
}

class EventBusImpl implements IEventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private globalHandlers: Set<EventHandler> = new Set();
  private eventHistory: DomainEvent[] = [];
  private maxHistorySize = 1000;

  async publish<T>(event: DomainEvent<T>): Promise<void> {
    this.eventHistory.push(event as DomainEvent);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    const typeHandlers = this.handlers.get(event.metadata.eventType) || new Set();
    
    const allHandlers = [...Array.from(typeHandlers), ...Array.from(this.globalHandlers)];
    
    await Promise.all(
      allHandlers.map(handler => 
        handler(event as DomainEvent).catch((err: Error) => 
          console.error(`Event handler error for ${event.metadata.eventType}:`, err)
        )
      )
    );
  }

  subscribe<T>(eventType: string, handler: EventHandler<T>): EventSubscription {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    
    const handlers = this.handlers.get(eventType)!;
    handlers.add(handler as EventHandler);

    return {
      eventType,
      handler: handler as EventHandler,
      unsubscribe: () => handlers.delete(handler as EventHandler)
    };
  }

  subscribeAll(handler: EventHandler): EventSubscription {
    this.globalHandlers.add(handler);
    
    return {
      eventType: '*',
      handler,
      unsubscribe: () => this.globalHandlers.delete(handler)
    };
  }

  getEventHistory(eventType?: string, limit = 100): DomainEvent[] {
    let events = this.eventHistory;
    if (eventType) {
      events = events.filter(e => e.metadata.eventType === eventType);
    }
    return events.slice(-limit);
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
      source: 'infera-webnova',
      ...options
    },
    payload
  };
}

export const EventTypes = {
  BLUEPRINT_DRAFTED: 'blueprint.drafted',
  BLUEPRINT_APPROVED: 'blueprint.approved',
  BLUEPRINT_REJECTED: 'blueprint.rejected',
  
  GENERATION_STARTED: 'generation.started',
  GENERATION_PROGRESS: 'generation.progress',
  GENERATION_COMPLETED: 'generation.completed',
  GENERATION_FAILED: 'generation.failed',
  
  ARTIFACTS_READY: 'artifacts.ready',
  VALIDATION_ISSUED: 'validation.issued',
  
  RUNTIME_STARTED: 'runtime.started',
  RUNTIME_STOPPED: 'runtime.stopped',
  RUNTIME_ERROR: 'runtime.error',
  
  TASK_QUEUED: 'ai.task.queued',
  TASK_STARTED: 'ai.task.started',
  TASK_COMPLETED: 'ai.task.completed',
  TASK_FAILED: 'ai.task.failed',
  
  VERSION_COMMITTED: 'versioning.committed',
  VERSION_RESTORED: 'versioning.restored',
  
  TENANT_CREATED: 'tenant.created',
  TENANT_UPDATED: 'tenant.updated',
  TENANT_SUSPENDED: 'tenant.suspended',
  
  DEPLOYMENT_REQUESTED: 'deployment.requested',
  DEPLOYMENT_STARTED: 'deployment.started',
  DEPLOYMENT_COMPLETED: 'deployment.completed',
  DEPLOYMENT_FAILED: 'deployment.failed',
  
  PLUGIN_REGISTERED: 'plugin.registered',
  PLUGIN_ACTIVATED: 'plugin.activated',
  PLUGIN_DEACTIVATED: 'plugin.deactivated',
  
  DATA_INGESTED: 'datalake.ingested',
  DATA_READY: 'datalake.ready',
  
  SECURITY_ALERT: 'security.alert',
  COMPLIANCE_CHECK: 'compliance.check',
  
  ACTION_LOGGED: 'audit.action.logged',
} as const;
