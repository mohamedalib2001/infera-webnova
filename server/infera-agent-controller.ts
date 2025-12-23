import Anthropic from "@anthropic-ai/sdk";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import {
  inferaAgentTasks,
  inferaAgentExecutions,
  inferaAgentFiles,
  inferaAgentLogs,
  inferaAgentConfig,
  type AgentTask,
  type AgentExecution,
} from "@shared/schema";
import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const anthropic = new Anthropic();

type AgentTool = "file_read" | "file_write" | "file_delete" | "terminal" | "search" | "analyze" | "generate" | "preview" | "git";

interface ToolResult {
  success: boolean;
  output: any;
  error?: string;
}

interface PlanStep {
  id: string;
  action: string;
  tool: AgentTool;
  params: Record<string, any>;
  status: "pending" | "executing" | "completed" | "failed";
  result?: any;
  error?: string;
}

interface TaskPlan {
  steps: PlanStep[];
  reasoning: string;
}

export class InferaAgentController {
  private taskId: string | null = null;
  private projectRoot: string = process.cwd();

  async log(level: string, message: string, details?: any) {
    await db.insert(inferaAgentLogs).values({
      taskId: this.taskId,
      level,
      message,
      details,
      source: "agent",
    });
    console.log(`[INFERA Agent] [${level.toUpperCase()}] ${message}`);
  }

  async createTask(data: {
    title: string;
    description?: string;
    prompt: string;
    userId?: string;
    projectId?: string;
    priority?: number;
  }): Promise<AgentTask> {
    const [task] = await db.insert(inferaAgentTasks).values({
      title: data.title,
      description: data.description,
      prompt: data.prompt,
      userId: data.userId,
      projectId: data.projectId,
      priority: data.priority || 5,
      status: "pending",
    }).returning();

    this.taskId = task.id;
    await this.log("info", `Task created: ${data.title}`);
    return task;
  }

  async planTask(taskId: string): Promise<TaskPlan> {
    this.taskId = taskId;
    
    const task = await db.query.inferaAgentTasks.findFirst({
      where: eq(inferaAgentTasks.id, taskId),
    });

    if (!task) throw new Error("Task not found");

    await db.update(inferaAgentTasks)
      .set({ status: "planning", startedAt: new Date() })
      .where(eq(inferaAgentTasks.id, taskId));

    await this.log("info", "Planning task...");

    const systemPrompt = `أنت INFERA Agent - عقل نظام التطوير الذكي.
مهمتك تخطيط وتنفيذ المهام التطويرية بشكل مستقل.

الأدوات المتاحة:
- file_read: قراءة ملف (params: { path: string })
- file_write: كتابة ملف (params: { path: string, content: string })
- file_delete: حذف ملف (params: { path: string })
- terminal: تنفيذ أمر (params: { command: string })
- search: بحث في الملفات (params: { pattern: string, path?: string })
- analyze: تحليل كود (params: { path: string })
- generate: توليد كود (params: { description: string, type: string })
- git: عمليات Git (params: { action: string, message?: string })

أجب بـ JSON فقط بالشكل التالي:
{
  "reasoning": "شرح الخطة",
  "steps": [
    { "id": "1", "action": "وصف الخطوة", "tool": "file_read", "params": { "path": "..." }, "status": "pending" }
  ]
}`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `المهمة: ${task.prompt}\n\nالوصف: ${task.description || "لا يوجد وصف إضافي"}\n\nقم بإنشاء خطة تنفيذ مفصلة.`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") throw new Error("Invalid response");

    let plan: TaskPlan;
    try {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      plan = JSON.parse(jsonMatch[0]);
    } catch (e) {
      await this.log("error", "Failed to parse plan", { response: content.text });
      throw new Error("Failed to parse plan");
    }

    await db.update(inferaAgentTasks)
      .set({ 
        plan: plan as any,
        totalSteps: plan.steps.length,
        status: "planned"
      })
      .where(eq(inferaAgentTasks.id, taskId));

    await this.log("info", `Plan created with ${plan.steps.length} steps`, { reasoning: plan.reasoning });

    return plan;
  }

  async executeStep(taskId: string, stepIndex: number): Promise<ToolResult> {
    this.taskId = taskId;

    const task = await db.query.inferaAgentTasks.findFirst({
      where: eq(inferaAgentTasks.id, taskId),
    });

    if (!task || !task.plan) throw new Error("Task or plan not found");

    const plan = task.plan as TaskPlan;
    const step = plan.steps[stepIndex];

    if (!step) throw new Error("Step not found");

    await this.log("info", `Executing step ${stepIndex + 1}: ${step.action}`);

    const [execution] = await db.insert(inferaAgentExecutions).values({
      taskId,
      stepIndex,
      tool: step.tool,
      params: step.params,
      status: "executing",
      startedAt: new Date(),
    }).returning();

    const startTime = Date.now();
    let result: ToolResult;

    try {
      result = await this.executeTool(step.tool, step.params);

      plan.steps[stepIndex].status = result.success ? "completed" : "failed";
      plan.steps[stepIndex].result = result.output;
      if (!result.success) plan.steps[stepIndex].error = result.error;

      await db.update(inferaAgentExecutions)
        .set({
          status: result.success ? "completed" : "failed",
          output: result.output,
          error: result.error,
          durationMs: Date.now() - startTime,
          completedAt: new Date(),
        })
        .where(eq(inferaAgentExecutions.id, execution.id));

      await db.update(inferaAgentTasks)
        .set({
          plan: plan as any,
          currentStep: stepIndex + 1,
        })
        .where(eq(inferaAgentTasks.id, taskId));

      await this.log(result.success ? "info" : "error", `Step ${stepIndex + 1} ${result.success ? "completed" : "failed"}`, result);

    } catch (error: any) {
      result = { success: false, output: null, error: error.message };

      await db.update(inferaAgentExecutions)
        .set({
          status: "failed",
          error: error.message,
          durationMs: Date.now() - startTime,
          completedAt: new Date(),
        })
        .where(eq(inferaAgentExecutions.id, execution.id));

      await this.log("error", `Step ${stepIndex + 1} failed with error`, { error: error.message });
    }

    return result;
  }

  async executeTool(tool: AgentTool, params: Record<string, any>): Promise<ToolResult> {
    switch (tool) {
      case "file_read":
        return this.toolFileRead(params.path);
      case "file_write":
        return this.toolFileWrite(params.path, params.content);
      case "file_delete":
        return this.toolFileDelete(params.path);
      case "terminal":
        return this.toolTerminal(params.command);
      case "search":
        return this.toolSearch(params.pattern, params.path);
      case "analyze":
        return this.toolAnalyze(params.path);
      case "generate":
        return this.toolGenerate(params.description, params.type);
      case "git":
        return this.toolGit(params.action, params.message);
      default:
        return { success: false, output: null, error: `Unknown tool: ${tool}` };
    }
  }

  private async toolFileRead(filePath: string): Promise<ToolResult> {
    try {
      const fullPath = path.resolve(this.projectRoot, filePath);
      const content = fs.readFileSync(fullPath, "utf-8");
      return { success: true, output: { path: filePath, content, size: content.length } };
    } catch (error: any) {
      return { success: false, output: null, error: error.message };
    }
  }

  private async toolFileWrite(filePath: string, content: string): Promise<ToolResult> {
    try {
      const fullPath = path.resolve(this.projectRoot, filePath);
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(fullPath, content, "utf-8");

      await db.insert(inferaAgentFiles).values({
        path: filePath,
        name: path.basename(filePath),
        extension: path.extname(filePath).slice(1),
        content,
        size: content.length,
        createdBy: "agent",
      });

      return { success: true, output: { path: filePath, size: content.length } };
    } catch (error: any) {
      return { success: false, output: null, error: error.message };
    }
  }

  private async toolFileDelete(filePath: string): Promise<ToolResult> {
    try {
      const fullPath = path.resolve(this.projectRoot, filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
      return { success: true, output: { path: filePath, deleted: true } };
    } catch (error: any) {
      return { success: false, output: null, error: error.message };
    }
  }

  private async toolTerminal(command: string): Promise<ToolResult> {
    const blockedCommands = ["rm -rf /", "sudo rm", ":(){ :|:& };:", "mkfs", "dd if="];
    const isBlocked = blockedCommands.some(bc => command.includes(bc));
    if (isBlocked) {
      return { success: false, output: null, error: "Command blocked for security" };
    }

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.projectRoot,
        timeout: 30000,
        maxBuffer: 1024 * 1024,
      });
      return { success: true, output: { stdout, stderr } };
    } catch (error: any) {
      return { success: false, output: { stdout: error.stdout, stderr: error.stderr }, error: error.message };
    }
  }

  private async toolSearch(pattern: string, searchPath?: string): Promise<ToolResult> {
    try {
      const targetPath = searchPath || ".";
      const { stdout } = await execAsync(`grep -rn "${pattern}" ${targetPath} --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" | head -50`, {
        cwd: this.projectRoot,
        timeout: 30000,
      });
      const matches = stdout.split("\n").filter(Boolean).map(line => {
        const [file, lineNum, ...content] = line.split(":");
        return { file, line: lineNum, content: content.join(":") };
      });
      return { success: true, output: { pattern, matches } };
    } catch (error: any) {
      if (error.code === 1) {
        return { success: true, output: { pattern, matches: [] } };
      }
      return { success: false, output: null, error: error.message };
    }
  }

  private async toolAnalyze(filePath: string): Promise<ToolResult> {
    try {
      const fullPath = path.resolve(this.projectRoot, filePath);
      const content = fs.readFileSync(fullPath, "utf-8");
      
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: `حلل هذا الكود وأعطني ملخص مختصر:\n\n${content.slice(0, 10000)}`,
          },
        ],
      });

      const analysis = response.content[0].type === "text" ? response.content[0].text : "";
      return { success: true, output: { path: filePath, analysis } };
    } catch (error: any) {
      return { success: false, output: null, error: error.message };
    }
  }

  private async toolGenerate(description: string, type: string): Promise<ToolResult> {
    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: `أنشئ كود ${type} للمتطلب التالي:\n${description}\n\nأرجع الكود فقط بدون شرح.`,
          },
        ],
      });

      const code = response.content[0].type === "text" ? response.content[0].text : "";
      return { success: true, output: { description, type, code } };
    } catch (error: any) {
      return { success: false, output: null, error: error.message };
    }
  }

  private async toolGit(action: string, message?: string): Promise<ToolResult> {
    const allowedActions = ["status", "log", "diff", "branch"];
    if (!allowedActions.includes(action)) {
      return { success: false, output: null, error: `Git action "${action}" not allowed` };
    }

    try {
      let command = `git ${action}`;
      if (action === "log") command += " --oneline -10";
      
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.projectRoot,
        timeout: 10000,
      });
      return { success: true, output: { action, stdout, stderr } };
    } catch (error: any) {
      return { success: false, output: null, error: error.message };
    }
  }

  async executeTask(taskId: string): Promise<AgentTask> {
    this.taskId = taskId;
    
    const plan = await this.planTask(taskId);
    
    await db.update(inferaAgentTasks)
      .set({ status: "executing" })
      .where(eq(inferaAgentTasks.id, taskId));

    await this.log("info", "Starting task execution...");
    
    const filesModified: string[] = [];
    const errors: string[] = [];

    for (let i = 0; i < plan.steps.length; i++) {
      const result = await this.executeStep(taskId, i);
      
      if (result.output?.path) {
        filesModified.push(result.output.path);
      }
      
      if (!result.success && result.error) {
        errors.push(`Step ${i + 1}: ${result.error}`);
      }
    }

    const success = errors.length === 0;
    
    const [updatedTask] = await db.update(inferaAgentTasks)
      .set({
        status: success ? "completed" : "failed",
        completedAt: new Date(),
        result: {
          success,
          summary: success ? "Task completed successfully" : `Task failed with ${errors.length} errors`,
          filesModified,
          errors,
        },
      })
      .where(eq(inferaAgentTasks.id, taskId))
      .returning();

    await this.log(success ? "info" : "error", `Task ${success ? "completed" : "failed"}`);

    return updatedTask;
  }

  async getTasks(userId?: string, limit = 20): Promise<AgentTask[]> {
    if (userId) {
      return db.query.inferaAgentTasks.findMany({
        where: eq(inferaAgentTasks.userId, userId),
        orderBy: [desc(inferaAgentTasks.createdAt)],
        limit,
      });
    }
    return db.query.inferaAgentTasks.findMany({
      orderBy: [desc(inferaAgentTasks.createdAt)],
      limit,
    });
  }

  async getTask(taskId: string): Promise<AgentTask | undefined> {
    return db.query.inferaAgentTasks.findFirst({
      where: eq(inferaAgentTasks.id, taskId),
    });
  }

  async getTaskExecutions(taskId: string): Promise<AgentExecution[]> {
    return db.query.inferaAgentExecutions.findMany({
      where: eq(inferaAgentExecutions.taskId, taskId),
      orderBy: [inferaAgentExecutions.stepIndex],
    });
  }

  async getTaskLogs(taskId: string) {
    return db.query.inferaAgentLogs.findMany({
      where: eq(inferaAgentLogs.taskId, taskId),
      orderBy: [desc(inferaAgentLogs.createdAt)],
    });
  }

  async getConfig(key: string): Promise<any> {
    const config = await db.query.inferaAgentConfig.findFirst({
      where: eq(inferaAgentConfig.key, key),
    });
    return config?.value;
  }

  async setConfig(key: string, value: any, description?: string, category?: string): Promise<void> {
    await db.insert(inferaAgentConfig)
      .values({ key, value, description, category })
      .onConflictDoUpdate({
        target: inferaAgentConfig.key,
        set: { value, description, category, updatedAt: new Date() },
      });
  }
}

export const inferaAgent = new InferaAgentController();
