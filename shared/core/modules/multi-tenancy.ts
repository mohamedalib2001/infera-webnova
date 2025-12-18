/**
 * INFERA WebNova - Multi-Tenancy Core
 * Core module for tenant isolation and management
 */

import { eventBus, createEvent, EventTypes } from '../event-bus';
import { type Tenant, TenantSchema } from '../contracts';

export interface IMultiTenancyCore {
  createTenant(data: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tenant>;
  getTenant(tenantId: string): Promise<Tenant | null>;
  updateTenant(tenantId: string, data: Partial<Tenant>): Promise<Tenant>;
  suspendTenant(tenantId: string, reason: string): Promise<void>;
  activateTenant(tenantId: string): Promise<void>;
  deleteTenant(tenantId: string): Promise<void>;
  listTenants(filter?: TenantFilter): Promise<Tenant[]>;
  checkQuota(tenantId: string, resource: QuotaResource): Promise<QuotaCheck>;
  incrementUsage(tenantId: string, resource: QuotaResource, amount: number): Promise<void>;
}

export interface TenantFilter {
  status?: Tenant['status'];
  tier?: Tenant['tier'];
}

export type QuotaResource = 'projects' | 'storage' | 'aiTokens' | 'deployments';

export interface QuotaCheck {
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
}

const TIER_QUOTAS: Record<Tenant['tier'], Tenant['quotas']> = {
  free: { projects: 3, storage: 100, aiTokens: 10000, deployments: 1 },
  basic: { projects: 10, storage: 1000, aiTokens: 100000, deployments: 5 },
  pro: { projects: 50, storage: 10000, aiTokens: 1000000, deployments: 20 },
  enterprise: { projects: 500, storage: 100000, aiTokens: 10000000, deployments: 100 },
  sovereign: { projects: -1, storage: -1, aiTokens: -1, deployments: -1 },
};

class MultiTenancyCoreImpl implements IMultiTenancyCore {
  private tenants: Map<string, Tenant> = new Map();

  async createTenant(data: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tenant> {
    const tenant: Tenant = {
      ...data,
      id: crypto.randomUUID(),
      quotas: TIER_QUOTAS[data.tier],
      usage: { projects: 0, storage: 0, aiTokens: 0, deployments: 0 },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const validation = TenantSchema.safeParse(tenant);
    if (!validation.success) {
      throw new Error(`Invalid tenant data: ${validation.error.message}`);
    }

    this.tenants.set(tenant.id, tenant);

    await eventBus.publish(createEvent(EventTypes.TENANT_CREATED, {
      tenantId: tenant.id,
      name: tenant.name,
      tier: tenant.tier,
    }, { tenantId: tenant.id }));

    return tenant;
  }

  async getTenant(tenantId: string): Promise<Tenant | null> {
    return this.tenants.get(tenantId) || null;
  }

  async updateTenant(tenantId: string, data: Partial<Tenant>): Promise<Tenant> {
    const existing = this.tenants.get(tenantId);
    if (!existing) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    const updated: Tenant = {
      ...existing,
      ...data,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    };

    if (data.tier && data.tier !== existing.tier) {
      updated.quotas = TIER_QUOTAS[data.tier];
    }

    this.tenants.set(tenantId, updated);

    await eventBus.publish(createEvent(EventTypes.TENANT_UPDATED, {
      tenantId,
      changes: Object.keys(data),
    }, { tenantId }));

    return updated;
  }

  async suspendTenant(tenantId: string, reason: string): Promise<void> {
    await this.updateTenant(tenantId, { status: 'suspended' });

    await eventBus.publish(createEvent(EventTypes.TENANT_SUSPENDED, {
      tenantId,
      reason,
    }, { tenantId }));
  }

  async activateTenant(tenantId: string): Promise<void> {
    await this.updateTenant(tenantId, { status: 'active' });
  }

  async deleteTenant(tenantId: string): Promise<void> {
    await this.updateTenant(tenantId, { status: 'archived' });
  }

  async listTenants(filter?: TenantFilter): Promise<Tenant[]> {
    let tenants = Array.from(this.tenants.values());

    if (filter?.status) {
      tenants = tenants.filter(t => t.status === filter.status);
    }
    if (filter?.tier) {
      tenants = tenants.filter(t => t.tier === filter.tier);
    }

    return tenants;
  }

  async checkQuota(tenantId: string, resource: QuotaResource): Promise<QuotaCheck> {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    const limit = tenant.quotas[resource];
    const current = tenant.usage[resource];

    if (limit === -1) {
      return { allowed: true, current, limit: Infinity, remaining: Infinity };
    }

    return {
      allowed: current < limit,
      current,
      limit,
      remaining: Math.max(0, limit - current),
    };
  }

  async incrementUsage(tenantId: string, resource: QuotaResource, amount: number): Promise<void> {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    tenant.usage[resource] += amount;
    tenant.updatedAt = new Date();
  }
}

export const multiTenancyCore: IMultiTenancyCore = new MultiTenancyCoreImpl();
