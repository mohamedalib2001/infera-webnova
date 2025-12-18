/**
 * INFERA WebNova - Plugin System
 * Extensible architecture for third-party integrations
 */

import { eventBus, createEvent, EventTypes, type DomainEvent } from './event-bus';
import { type PluginManifest, PluginManifestSchema } from './contracts';

export interface PluginContext {
  tenantId: string;
  config: Record<string, unknown>;
  emit: <T>(eventType: string, payload: T) => Promise<void>;
  subscribe: <T>(eventType: string, handler: (event: DomainEvent<T>) => Promise<void>) => void;
  log: (level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: unknown) => void;
}

export interface PluginLifecycle {
  onActivate?: (context: PluginContext) => Promise<void>;
  onDeactivate?: (context: PluginContext) => Promise<void>;
  onEvent?: (event: DomainEvent) => Promise<void>;
}

export interface Plugin extends PluginLifecycle {
  manifest: PluginManifest;
}

export interface IPluginHost {
  register(plugin: Plugin): Promise<void>;
  unregister(pluginId: string): Promise<void>;
  activate(pluginId: string, tenantId: string): Promise<void>;
  deactivate(pluginId: string, tenantId: string): Promise<void>;
  getPlugin(pluginId: string): Plugin | undefined;
  listPlugins(): Plugin[];
  listActivePlugins(tenantId: string): Plugin[];
}

class PluginHostImpl implements IPluginHost {
  private plugins: Map<string, Plugin> = new Map();
  private activePlugins: Map<string, Set<string>> = new Map();
  private pluginContexts: Map<string, PluginContext> = new Map();

  async register(plugin: Plugin): Promise<void> {
    const validation = PluginManifestSchema.safeParse(plugin.manifest);
    if (!validation.success) {
      throw new Error(`Invalid plugin manifest: ${validation.error.message}`);
    }

    if (this.plugins.has(plugin.manifest.id)) {
      throw new Error(`Plugin ${plugin.manifest.id} is already registered`);
    }

    this.plugins.set(plugin.manifest.id, plugin);

    await eventBus.publish(createEvent(EventTypes.PLUGIN_REGISTERED, {
      pluginId: plugin.manifest.id,
      name: plugin.manifest.name,
      version: plugin.manifest.version,
      capabilities: plugin.manifest.capabilities,
    }));
  }

  async unregister(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    const activeTenants = this.activePlugins.get(pluginId);
    if (activeTenants && activeTenants.size > 0) {
      for (const tenantId of Array.from(activeTenants)) {
        await this.deactivate(pluginId, tenantId);
      }
    }

    this.plugins.delete(pluginId);
  }

  async activate(pluginId: string, tenantId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    if (!this.activePlugins.has(pluginId)) {
      this.activePlugins.set(pluginId, new Set());
    }

    const activeTenants = this.activePlugins.get(pluginId)!;
    if (activeTenants.has(tenantId)) {
      return;
    }

    const context = this.createPluginContext(plugin, tenantId);
    this.pluginContexts.set(`${pluginId}:${tenantId}`, context);

    if (plugin.onActivate) {
      await plugin.onActivate(context);
    }

    activeTenants.add(tenantId);

    await eventBus.publish(createEvent(EventTypes.PLUGIN_ACTIVATED, {
      pluginId,
      tenantId,
    }, { tenantId }));
  }

  async deactivate(pluginId: string, tenantId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    const activeTenants = this.activePlugins.get(pluginId);
    if (!activeTenants || !activeTenants.has(tenantId)) {
      return;
    }

    const context = this.pluginContexts.get(`${pluginId}:${tenantId}`);
    if (context && plugin.onDeactivate) {
      await plugin.onDeactivate(context);
    }

    activeTenants.delete(tenantId);
    this.pluginContexts.delete(`${pluginId}:${tenantId}`);

    await eventBus.publish(createEvent(EventTypes.PLUGIN_DEACTIVATED, {
      pluginId,
      tenantId,
    }, { tenantId }));
  }

  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  listPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  listActivePlugins(tenantId: string): Plugin[] {
    const activePlugins: Plugin[] = [];
    
    for (const [pluginId, tenants] of Array.from(this.activePlugins)) {
      if (tenants.has(tenantId)) {
        const plugin = this.plugins.get(pluginId);
        if (plugin) {
          activePlugins.push(plugin);
        }
      }
    }
    
    return activePlugins;
  }

  private createPluginContext(plugin: Plugin, tenantId: string): PluginContext {
    return {
      tenantId,
      config: plugin.manifest.config || {},
      emit: async <T>(eventType: string, payload: T) => {
        if (!plugin.manifest.emittedEvents.includes(eventType)) {
          throw new Error(`Plugin ${plugin.manifest.id} is not allowed to emit ${eventType}`);
        }
        await eventBus.publish(createEvent(eventType, payload, {
          tenantId,
          source: `plugin:${plugin.manifest.id}`,
        }));
      },
      subscribe: <T>(eventType: string, handler: (event: DomainEvent<T>) => Promise<void>) => {
        if (!plugin.manifest.requiredEvents.includes(eventType) && eventType !== '*') {
          throw new Error(`Plugin ${plugin.manifest.id} is not subscribed to ${eventType}`);
        }
        eventBus.subscribe(eventType, handler);
      },
      log: (level, message, data) => {
        console[level](`[Plugin:${plugin.manifest.id}] ${message}`, data || '');
      },
    };
  }
}

export const pluginHost: IPluginHost = new PluginHostImpl();
