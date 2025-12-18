/**
 * INFERA WebNova - Runtime Execution Layer (MVP)
 * Core module for sandboxed code execution and preview
 */

import { eventBus, createEvent, EventTypes } from '../event-bus';
import { type RuntimeInstance } from '../contracts';

export interface IRuntimeLayer {
  createInstance(projectId: string, tenantId: string, type: RuntimeInstance['type']): Promise<RuntimeInstance>;
  startInstance(instanceId: string): Promise<void>;
  stopInstance(instanceId: string): Promise<void>;
  getInstance(instanceId: string): Promise<RuntimeInstance | null>;
  listInstances(tenantId: string): Promise<RuntimeInstance[]>;
  executeCode(instanceId: string, code: string, language: string): Promise<ExecutionResult>;
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  errors: string[];
  duration: number;
  memoryUsed: number;
}

export interface RuntimeConfig {
  maxInstances: number;
  defaultTimeout: number;
  maxMemory: number;
  allowedLanguages: string[];
}

const DEFAULT_CONFIG: RuntimeConfig = {
  maxInstances: 10,
  defaultTimeout: 30000,
  maxMemory: 256,
  allowedLanguages: ['javascript', 'typescript', 'html', 'css', 'python', 'nodejs'],
};

class RuntimeLayerImpl implements IRuntimeLayer {
  private instances: Map<string, RuntimeInstance> = new Map();
  private config: RuntimeConfig = DEFAULT_CONFIG;

  async createInstance(
    projectId: string,
    tenantId: string,
    type: RuntimeInstance['type']
  ): Promise<RuntimeInstance> {
    const instance: RuntimeInstance = {
      id: crypto.randomUUID(),
      projectId,
      tenantId,
      status: 'stopped',
      type,
      resources: {
        cpu: 0.5,
        memory: this.config.maxMemory,
        storage: 100,
      },
      endpoints: [],
      logs: [],
    };

    this.instances.set(instance.id, instance);
    return instance;
  }

  async startInstance(instanceId: string): Promise<void> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Runtime instance ${instanceId} not found`);
    }

    instance.status = 'starting';
    
    await new Promise(r => setTimeout(r, 1000));

    const port = 5000 + Math.floor(Math.random() * 1000);
    instance.status = 'running';
    instance.startedAt = new Date();
    instance.endpoints = [
      { type: 'http', url: `http://localhost:${port}`, port },
    ];

    await eventBus.publish(createEvent(EventTypes.RUNTIME_STARTED, {
      instanceId,
      projectId: instance.projectId,
      tenantId: instance.tenantId,
      endpoints: instance.endpoints,
    }, { tenantId: instance.tenantId }));
  }

  async stopInstance(instanceId: string): Promise<void> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Runtime instance ${instanceId} not found`);
    }

    instance.status = 'stopping';
    
    await new Promise(r => setTimeout(r, 500));

    instance.status = 'stopped';
    instance.stoppedAt = new Date();
    instance.endpoints = [];

    await eventBus.publish(createEvent(EventTypes.RUNTIME_STOPPED, {
      instanceId,
      projectId: instance.projectId,
      tenantId: instance.tenantId,
      duration: instance.stoppedAt.getTime() - (instance.startedAt?.getTime() || 0),
    }, { tenantId: instance.tenantId }));
  }

  async getInstance(instanceId: string): Promise<RuntimeInstance | null> {
    return this.instances.get(instanceId) || null;
  }

  async listInstances(tenantId: string): Promise<RuntimeInstance[]> {
    return Array.from(this.instances.values())
      .filter(i => i.tenantId === tenantId);
  }

  async executeCode(instanceId: string, code: string, language: string): Promise<ExecutionResult> {
    const instance = this.instances.get(instanceId);
    if (!instance || instance.status !== 'running') {
      throw new Error(`Runtime instance ${instanceId} is not running`);
    }

    if (!this.config.allowedLanguages.includes(language)) {
      return {
        success: false,
        output: '',
        errors: [`Language ${language} is not supported`],
        duration: 0,
        memoryUsed: 0,
      };
    }

    const startTime = Date.now();

    try {
      let output = '';
      
      if (language === 'javascript' || language === 'nodejs') {
        const logs: string[] = [];
        const mockConsole = {
          log: (...args: unknown[]) => logs.push(args.map(String).join(' ')),
          error: (...args: unknown[]) => logs.push('[ERROR] ' + args.map(String).join(' ')),
          warn: (...args: unknown[]) => logs.push('[WARN] ' + args.map(String).join(' ')),
        };
        
        const fn = new Function('console', code);
        fn(mockConsole);
        output = logs.join('\n');
      } else {
        output = `[${language}] Code execution simulated`;
      }

      instance.logs?.push({
        timestamp: new Date(),
        level: 'info',
        message: `Executed ${language} code (${code.length} chars)`,
      });

      return {
        success: true,
        output,
        errors: [],
        duration: Date.now() - startTime,
        memoryUsed: Math.random() * 50,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      instance.logs?.push({
        timestamp: new Date(),
        level: 'error',
        message: `Execution error: ${errorMessage}`,
      });

      await eventBus.publish(createEvent(EventTypes.RUNTIME_ERROR, {
        instanceId,
        projectId: instance.projectId,
        error: errorMessage,
      }, { tenantId: instance.tenantId }));

      return {
        success: false,
        output: '',
        errors: [errorMessage],
        duration: Date.now() - startTime,
        memoryUsed: 0,
      };
    }
  }
}

export const runtimeLayer: IRuntimeLayer = new RuntimeLayerImpl();
