/**
 * INFERA WebNova - AI Orchestrator
 * Core module for intelligent task routing and execution
 */

import { eventBus, createEvent, EventTypes, type DomainEvent } from '../event-bus';
import { type AITask, AITaskSchema } from '../contracts';

export interface IAIOrchestrator {
  queueTask(task: Omit<AITask, 'id' | 'status' | 'createdAt'>): Promise<AITask>;
  getTask(taskId: string): Promise<AITask | null>;
  cancelTask(taskId: string): Promise<void>;
  listTasks(filter?: TaskFilter): Promise<AITask[]>;
  getQueueStatus(): QueueStatus;
}

export interface TaskFilter {
  status?: AITask['status'];
  type?: AITask['type'];
  priority?: AITask['priority'];
  limit?: number;
}

export interface QueueStatus {
  queued: number;
  running: number;
  completed: number;
  failed: number;
  averageWaitTime: number;
  averageExecutionTime: number;
}

export interface ModelProvider {
  id: string;
  name: string;
  capabilities: AITask['type'][];
  maxConcurrent: number;
  currentLoad: number;
  priority: number;
}

const DEFAULT_PROVIDERS: ModelProvider[] = [
  {
    id: 'anthropic-claude',
    name: 'Anthropic Claude',
    capabilities: ['generation', 'analysis', 'review', 'transformation'],
    maxConcurrent: 5,
    currentLoad: 0,
    priority: 1,
  },
  {
    id: 'openai-gpt',
    name: 'OpenAI GPT',
    capabilities: ['generation', 'analysis', 'optimization'],
    maxConcurrent: 5,
    currentLoad: 0,
    priority: 2,
  },
];

class AIOrchestorImpl implements IAIOrchestrator {
  private tasks: Map<string, AITask> = new Map();
  private queue: string[] = [];
  private providers: ModelProvider[] = [...DEFAULT_PROVIDERS];
  private processing = false;
  private stats = {
    totalCompleted: 0,
    totalFailed: 0,
    totalWaitTime: 0,
    totalExecutionTime: 0,
  };

  constructor() {
    this.startProcessing();
  }

  async queueTask(taskData: Omit<AITask, 'id' | 'status' | 'createdAt'>): Promise<AITask> {
    const task: AITask = {
      ...taskData,
      id: crypto.randomUUID(),
      status: 'queued',
      createdAt: new Date(),
    };

    const validation = AITaskSchema.safeParse(task);
    if (!validation.success) {
      throw new Error(`Invalid task data: ${validation.error.message}`);
    }

    this.tasks.set(task.id, task);
    
    this.insertByPriority(task.id, task.priority);

    await eventBus.publish(createEvent(EventTypes.TASK_QUEUED, {
      taskId: task.id,
      type: task.type,
      priority: task.priority,
      queuePosition: this.queue.indexOf(task.id) + 1,
    }));

    return task;
  }

  async getTask(taskId: string): Promise<AITask | null> {
    return this.tasks.get(taskId) || null;
  }

  async cancelTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) return;

    if (task.status === 'queued') {
      const index = this.queue.indexOf(taskId);
      if (index > -1) {
        this.queue.splice(index, 1);
      }
    }

    task.status = 'cancelled';
  }

  async listTasks(filter?: TaskFilter): Promise<AITask[]> {
    let tasks = Array.from(this.tasks.values());

    if (filter?.status) {
      tasks = tasks.filter(t => t.status === filter.status);
    }
    if (filter?.type) {
      tasks = tasks.filter(t => t.type === filter.type);
    }
    if (filter?.priority) {
      tasks = tasks.filter(t => t.priority === filter.priority);
    }
    if (filter?.limit) {
      tasks = tasks.slice(0, filter.limit);
    }

    return tasks;
  }

  getQueueStatus(): QueueStatus {
    const tasks = Array.from(this.tasks.values());
    const queued = tasks.filter(t => t.status === 'queued').length;
    const running = tasks.filter(t => t.status === 'running').length;
    const completed = this.stats.totalCompleted;
    const failed = this.stats.totalFailed;

    return {
      queued,
      running,
      completed,
      failed,
      averageWaitTime: completed > 0 ? this.stats.totalWaitTime / completed : 0,
      averageExecutionTime: completed > 0 ? this.stats.totalExecutionTime / completed : 0,
    };
  }

  private insertByPriority(taskId: string, priority: AITask['priority']): void {
    const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
    const taskPriority = priorityOrder[priority];

    let insertIndex = this.queue.length;
    for (let i = 0; i < this.queue.length; i++) {
      const existingTask = this.tasks.get(this.queue[i]);
      if (existingTask) {
        const existingPriority = priorityOrder[existingTask.priority];
        if (taskPriority < existingPriority) {
          insertIndex = i;
          break;
        }
      }
    }

    this.queue.splice(insertIndex, 0, taskId);
  }

  private selectProvider(taskType: AITask['type']): ModelProvider | null {
    const available = this.providers
      .filter(p => p.capabilities.includes(taskType) && p.currentLoad < p.maxConcurrent)
      .sort((a, b) => a.priority - b.priority);

    return available[0] || null;
  }

  private async processTask(task: AITask): Promise<void> {
    const provider = this.selectProvider(task.type);
    if (!provider) {
      task.retryCount++;
      if (task.retryCount >= task.maxRetries) {
        task.status = 'failed';
        this.stats.totalFailed++;
        await eventBus.publish(createEvent(EventTypes.TASK_FAILED, {
          taskId: task.id,
          error: 'No available provider',
        }));
      } else {
        this.queue.push(task.id);
      }
      return;
    }

    task.status = 'running';
    task.assignedModel = provider.id;
    provider.currentLoad++;

    const startTime = Date.now();
    const waitTime = startTime - task.createdAt.getTime();

    await eventBus.publish(createEvent(EventTypes.TASK_STARTED, {
      taskId: task.id,
      provider: provider.id,
      waitTime,
    }));

    try {
      await new Promise(r => setTimeout(r, 1000 + Math.random() * 2000));

      task.status = 'completed';
      task.completedAt = new Date();
      task.output = {
        result: { success: true, message: `Task ${task.type} completed` },
        tokens: { input: 100, output: 200 },
        duration: Date.now() - startTime,
      };

      this.stats.totalCompleted++;
      this.stats.totalWaitTime += waitTime;
      this.stats.totalExecutionTime += task.output.duration || 0;

      await eventBus.publish(createEvent(EventTypes.TASK_COMPLETED, {
        taskId: task.id,
        provider: provider.id,
        duration: task.output.duration,
        tokens: task.output.tokens,
      }));
    } catch (error) {
      task.status = 'failed';
      this.stats.totalFailed++;

      await eventBus.publish(createEvent(EventTypes.TASK_FAILED, {
        taskId: task.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    } finally {
      provider.currentLoad--;
    }
  }

  private startProcessing(): void {
    setInterval(async () => {
      if (this.processing || this.queue.length === 0) return;

      this.processing = true;
      
      const taskId = this.queue.shift();
      if (taskId) {
        const task = this.tasks.get(taskId);
        if (task && task.status === 'queued') {
          await this.processTask(task);
        }
      }

      this.processing = false;
    }, 100);
  }
}

export const aiOrchestrator: IAIOrchestrator = new AIOrchestorImpl();
