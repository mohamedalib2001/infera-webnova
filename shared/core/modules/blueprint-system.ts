/**
 * INFERA WebNova - Blueprint Architecture System
 * Core module for capturing product intents and domain blueprints
 */

import { eventBus, createEvent, EventTypes, type DomainEvent } from '../event-bus';
import { BlueprintSchema, type Blueprint } from '../contracts';

export interface IBlueprintSystem {
  createBlueprint(data: Omit<Blueprint, 'id' | 'metadata'>): Promise<Blueprint>;
  updateBlueprint(id: string, data: Partial<Blueprint>): Promise<Blueprint>;
  getBlueprint(id: string): Promise<Blueprint | null>;
  listBlueprints(tenantId: string): Promise<Blueprint[]>;
  approveBlueprint(id: string, approvedBy: string): Promise<Blueprint>;
  rejectBlueprint(id: string, reason: string): Promise<Blueprint>;
  archiveBlueprint(id: string): Promise<void>;
}

export interface BlueprintDraftedPayload {
  blueprintId: string;
  tenantId: string;
  name: string;
  domain: string;
  intentsCount: number;
}

export interface BlueprintApprovedPayload {
  blueprintId: string;
  tenantId: string;
  approvedBy: string;
  intents: Array<{ id: string; type: string; description: string }>;
}

class BlueprintSystemImpl implements IBlueprintSystem {
  private blueprints: Map<string, Blueprint> = new Map();

  async createBlueprint(data: Omit<Blueprint, 'id' | 'metadata'>): Promise<Blueprint> {
    const blueprint: Blueprint = {
      ...data,
      id: crypto.randomUUID(),
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: data.tenantId,
      },
    };

    const validation = BlueprintSchema.safeParse(blueprint);
    if (!validation.success) {
      throw new Error(`Invalid blueprint data: ${validation.error.message}`);
    }

    this.blueprints.set(blueprint.id, blueprint);

    await eventBus.publish(createEvent<BlueprintDraftedPayload>(
      EventTypes.BLUEPRINT_DRAFTED,
      {
        blueprintId: blueprint.id,
        tenantId: blueprint.tenantId,
        name: blueprint.name,
        domain: blueprint.context.domain,
        intentsCount: blueprint.intents.length,
      },
      { tenantId: blueprint.tenantId }
    ));

    return blueprint;
  }

  async updateBlueprint(id: string, data: Partial<Blueprint>): Promise<Blueprint> {
    const existing = this.blueprints.get(id);
    if (!existing) {
      throw new Error(`Blueprint ${id} not found`);
    }

    const updated: Blueprint = {
      ...existing,
      ...data,
      id: existing.id,
      metadata: {
        ...existing.metadata,
        updatedAt: new Date(),
      },
    };

    this.blueprints.set(id, updated);
    return updated;
  }

  async getBlueprint(id: string): Promise<Blueprint | null> {
    return this.blueprints.get(id) || null;
  }

  async listBlueprints(tenantId: string): Promise<Blueprint[]> {
    return Array.from(this.blueprints.values())
      .filter(b => b.tenantId === tenantId);
  }

  async approveBlueprint(id: string, approvedBy: string): Promise<Blueprint> {
    const blueprint = await this.updateBlueprint(id, {
      status: 'approved',
    });
    
    blueprint.metadata.approvedBy = approvedBy;

    await eventBus.publish(createEvent<BlueprintApprovedPayload>(
      EventTypes.BLUEPRINT_APPROVED,
      {
        blueprintId: blueprint.id,
        tenantId: blueprint.tenantId,
        approvedBy,
        intents: blueprint.intents.map(i => ({
          id: i.id,
          type: i.type,
          description: i.description,
        })),
      },
      { tenantId: blueprint.tenantId }
    ));

    return blueprint;
  }

  async rejectBlueprint(id: string, reason: string): Promise<Blueprint> {
    const blueprint = await this.updateBlueprint(id, {
      status: 'rejected',
    });

    await eventBus.publish(createEvent(
      EventTypes.BLUEPRINT_REJECTED,
      {
        blueprintId: blueprint.id,
        tenantId: blueprint.tenantId,
        reason,
      },
      { tenantId: blueprint.tenantId }
    ));

    return blueprint;
  }

  async archiveBlueprint(id: string): Promise<void> {
    await this.updateBlueprint(id, { status: 'archived' });
  }
}

export const blueprintSystem: IBlueprintSystem = new BlueprintSystemImpl();

eventBus.subscribe(EventTypes.BLUEPRINT_APPROVED, async (event: DomainEvent<BlueprintApprovedPayload>) => {
  console.log(`[BlueprintSystem] Blueprint ${event.payload.blueprintId} approved, triggering generation...`);
});
