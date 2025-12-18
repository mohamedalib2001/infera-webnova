/**
 * INFERA WebNova - PostgreSQL Event Store
 * Durable event storage implementation for Event Sourcing
 */

import { db } from '../../../server/db';
import { eventStore, queryStore, deadLetterQueue, aggregateSnapshots } from '../../schema';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import type { DomainEvent, EventQuery, EventStore, QueryStore, AggregateSnapshot } from '../event-bus';

export class PostgresEventStore implements EventStore {
  private sequenceCache: number = 0;
  private initialized: boolean = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    const result = await db
      .select({ maxSeq: sql<number>`COALESCE(MAX(sequence), 0)` })
      .from(eventStore);
    this.sequenceCache = result[0]?.maxSeq || 0;
    this.initialized = true;
    console.log(`[PostgresEventStore] Initialized with sequence: ${this.sequenceCache}`);
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async append(event: DomainEvent): Promise<number> {
    this.sequenceCache++;
    const sequence = this.sequenceCache;

    await db.insert(eventStore).values({
      eventId: event.metadata.eventId,
      eventType: event.metadata.eventType,
      aggregateId: event.metadata.aggregateId,
      aggregateType: event.metadata.aggregateType,
      tenantId: event.metadata.tenantId,
      correlationId: event.metadata.correlationId,
      causationId: event.metadata.causationId,
      sequence,
      version: event.metadata.version,
      payload: event.payload as Record<string, unknown>,
      metadata: event.metadata as unknown as Record<string, unknown>,
      source: event.metadata.source,
    });

    event.metadata.sequence = sequence;
    return sequence;
  }

  async getEvents(query: EventQuery): Promise<DomainEvent[]> {
    let baseQuery = db.select().from(eventStore);
    const conditions = [];

    if (query.eventType) {
      conditions.push(eq(eventStore.eventType, query.eventType));
    }
    if (query.tenantId) {
      conditions.push(eq(eventStore.tenantId, query.tenantId));
    }
    if (query.aggregateId) {
      conditions.push(eq(eventStore.aggregateId, query.aggregateId));
    }
    if (query.aggregateType) {
      conditions.push(eq(eventStore.aggregateType, query.aggregateType));
    }
    if (query.fromSequence !== undefined) {
      conditions.push(gte(eventStore.sequence, query.fromSequence));
    }
    if (query.toSequence !== undefined) {
      conditions.push(lte(eventStore.sequence, query.toSequence));
    }
    if (query.fromDate) {
      conditions.push(gte(eventStore.createdAt, query.fromDate));
    }
    if (query.toDate) {
      conditions.push(lte(eventStore.createdAt, query.toDate));
    }

    const results = await db
      .select()
      .from(eventStore)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(eventStore.sequence)
      .limit(query.limit || 1000);

    return results.map(row => ({
      metadata: {
        eventId: row.eventId,
        eventType: row.eventType,
        version: row.version,
        timestamp: row.createdAt || new Date(),
        tenantId: row.tenantId || undefined,
        correlationId: row.correlationId || undefined,
        causationId: row.causationId || undefined,
        source: row.source,
        sequence: row.sequence,
        aggregateId: row.aggregateId || undefined,
        aggregateType: row.aggregateType || undefined,
      },
      payload: row.payload,
    }));
  }

  getLastSequence(): number {
    return this.sequenceCache;
  }

  async getSnapshot(aggregateId: string): Promise<AggregateSnapshot | null> {
    const result = await db
      .select()
      .from(aggregateSnapshots)
      .where(eq(aggregateSnapshots.aggregateId, aggregateId))
      .orderBy(desc(aggregateSnapshots.version))
      .limit(1);

    if (result.length === 0) return null;

    const row = result[0];
    return {
      aggregateId: row.aggregateId,
      aggregateType: row.aggregateType,
      version: row.version,
      state: row.state,
      timestamp: row.createdAt || new Date(),
    };
  }

  async saveSnapshot(snapshot: AggregateSnapshot, tenantId?: string): Promise<void> {
    await db.insert(aggregateSnapshots).values({
      aggregateId: snapshot.aggregateId,
      aggregateType: snapshot.aggregateType,
      version: snapshot.version,
      state: snapshot.state as Record<string, unknown>,
      lastEventSequence: this.sequenceCache,
      tenantId: tenantId,
    });
    console.log(`[PostgresEventStore] Snapshot saved for aggregate: ${snapshot.aggregateId}, tenant: ${tenantId || 'global'}`);
  }

  async getSnapshotForTenant(aggregateId: string, tenantId: string): Promise<AggregateSnapshot | null> {
    const result = await db
      .select()
      .from(aggregateSnapshots)
      .where(
        and(
          eq(aggregateSnapshots.aggregateId, aggregateId),
          eq(aggregateSnapshots.tenantId, tenantId)
        )
      )
      .orderBy(desc(aggregateSnapshots.version))
      .limit(1);

    if (result.length === 0) return null;

    const row = result[0];
    return {
      aggregateId: row.aggregateId,
      aggregateType: row.aggregateType,
      version: row.version,
      state: row.state,
      timestamp: row.createdAt || new Date(),
    };
  }
}

export class PostgresQueryStore implements QueryStore {
  async update(projection: string, data: unknown, tenantId?: string): Promise<void> {
    const record = data as { id?: string };
    if (!record.id) {
      console.error('[PostgresQueryStore] Cannot update projection without id');
      return;
    }

    const conditions = [
      eq(queryStore.projectionName, projection),
      eq(queryStore.projectionId, record.id),
    ];
    if (tenantId) {
      conditions.push(eq(queryStore.tenantId, tenantId));
    }

    const existing = await db
      .select()
      .from(queryStore)
      .where(and(...conditions))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(queryStore)
        .set({
          data: data as Record<string, unknown>,
          version: existing[0].version + 1,
          updatedAt: new Date(),
        })
        .where(eq(queryStore.id, existing[0].id));
    } else {
      await db.insert(queryStore).values({
        projectionName: projection,
        projectionId: record.id,
        tenantId: tenantId,
        data: data as Record<string, unknown>,
        version: 1,
      });
    }
    console.log(`[PostgresQueryStore] Updated projection: ${projection}/${record.id}, tenant: ${tenantId || 'global'}`);
  }

  async get<T>(projection: string, id: string, tenantId?: string): Promise<T | null> {
    const conditions = [
      eq(queryStore.projectionName, projection),
      eq(queryStore.projectionId, id),
    ];
    if (tenantId) {
      conditions.push(eq(queryStore.tenantId, tenantId));
    }

    const result = await db
      .select()
      .from(queryStore)
      .where(and(...conditions))
      .limit(1);

    if (result.length === 0) return null;
    return result[0].data as T;
  }

  async query<T>(projection: string, filter: Record<string, unknown>, tenantId?: string): Promise<T[]> {
    const conditions = [eq(queryStore.projectionName, projection)];
    if (tenantId) {
      conditions.push(eq(queryStore.tenantId, tenantId));
    }

    const results = await db
      .select()
      .from(queryStore)
      .where(and(...conditions));

    let filteredResults = results.map(r => r.data as T);

    for (const [key, value] of Object.entries(filter)) {
      filteredResults = filteredResults.filter(
        item => (item as Record<string, unknown>)[key] === value
      );
    }

    return filteredResults;
  }

  async deleteProjection(projection: string, id: string, tenantId?: string): Promise<void> {
    const conditions = [
      eq(queryStore.projectionName, projection),
      eq(queryStore.projectionId, id),
    ];
    if (tenantId) {
      conditions.push(eq(queryStore.tenantId, tenantId));
    }

    await db.delete(queryStore).where(and(...conditions));
  }
}

export class PostgresDeadLetterQueue {
  async add(event: DomainEvent, error: Error): Promise<void> {
    await db.insert(deadLetterQueue).values({
      eventId: event.metadata.eventId,
      eventType: event.metadata.eventType,
      payload: event.payload as Record<string, unknown>,
      errorMessage: error.message,
      errorStack: error.stack,
      retryCount: 0,
      maxRetries: 3,
      status: 'pending',
    });
  }

  async getPending(limit: number = 100): Promise<Array<{ id: string; event: DomainEvent; retryCount: number }>> {
    const results = await db
      .select()
      .from(deadLetterQueue)
      .where(eq(deadLetterQueue.status, 'pending'))
      .orderBy(deadLetterQueue.createdAt)
      .limit(limit);

    return results.map(row => ({
      id: row.id,
      event: {
        metadata: {
          eventId: row.eventId,
          eventType: row.eventType,
          version: '1.0',
          timestamp: row.createdAt || new Date(),
          source: 'dead-letter-queue',
        },
        payload: row.payload,
      },
      retryCount: row.retryCount,
    }));
  }

  async markRetrying(id: string): Promise<void> {
    await db
      .update(deadLetterQueue)
      .set({
        status: 'retrying',
        retryCount: sql`retry_count + 1`,
        lastRetryAt: new Date(),
      })
      .where(eq(deadLetterQueue.id, id));
  }

  async markResolved(id: string): Promise<void> {
    await db
      .update(deadLetterQueue)
      .set({
        status: 'resolved',
        resolvedAt: new Date(),
      })
      .where(eq(deadLetterQueue.id, id));
  }

  async markFailed(id: string): Promise<void> {
    await db
      .update(deadLetterQueue)
      .set({ status: 'failed' })
      .where(eq(deadLetterQueue.id, id));
  }

  async getStats(): Promise<{ pending: number; retrying: number; failed: number; resolved: number }> {
    const stats = await db
      .select({
        status: deadLetterQueue.status,
        count: sql<number>`COUNT(*)`,
      })
      .from(deadLetterQueue)
      .groupBy(deadLetterQueue.status);

    const result = { pending: 0, retrying: 0, failed: 0, resolved: 0 };
    for (const row of stats) {
      result[row.status as keyof typeof result] = row.count;
    }
    return result;
  }
}

export const postgresEventStore = new PostgresEventStore();
export const postgresQueryStore = new PostgresQueryStore();
export const postgresDeadLetterQueue = new PostgresDeadLetterQueue();
