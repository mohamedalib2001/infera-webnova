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
import { EventEmitter } from "events";

const execAsync = promisify(exec);

interface FileChange {
  type: "add" | "change" | "unlink";
  path: string;
  timestamp: Date;
}

interface EvolutionGoal {
  id: string;
  description: string;
  priority: number;
  status: "pending" | "analyzing" | "planning" | "executing" | "completed" | "failed";
  createdAt: Date;
}

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

export class InferaAgentController extends EventEmitter {
  private taskId: string | null = null;
  private projectRoot: string = process.cwd();
  private fileWatchers: Map<string, fs.FSWatcher> = new Map();
  private fileChanges: FileChange[] = [];
  private evolutionGoals: EvolutionGoal[] = [];
  private isWatching: boolean = false;

  constructor() {
    super();
  }

  private isPathSafe(targetPath: string): boolean {
    const resolved = path.resolve(this.projectRoot, targetPath);
    return resolved.startsWith(this.projectRoot) && !targetPath.includes("..");
  }

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

  // File Watcher System
  private allowedWatchDirs = ["client/src", "server", "shared"];

  startFileWatcher(directories: string[] = ["client/src", "server", "shared"]): { success: boolean; error?: string } {
    if (this.isWatching) return { success: true };
    
    const safeDirs = directories.filter(dir => 
      this.allowedWatchDirs.includes(dir) && this.isPathSafe(dir)
    );

    if (safeDirs.length === 0) {
      return { success: false, error: "No valid directories to watch" };
    }

    this.isWatching = true;
    
    safeDirs.forEach(dir => {
      const fullPath = path.resolve(this.projectRoot, dir);
      if (!fs.existsSync(fullPath)) return;
      
      try {
        const watcher = fs.watch(fullPath, { recursive: true }, (eventType, filename) => {
          if (!filename || filename.includes("node_modules") || filename.startsWith(".")) return;
          
          const change: FileChange = {
            type: eventType === "rename" ? "add" : "change",
            path: path.join(dir, filename),
            timestamp: new Date(),
          };
          
          this.fileChanges.push(change);
          if (this.fileChanges.length > 100) this.fileChanges.shift();
          
          this.emit("fileChange", change);
          this.log("debug", `File ${eventType}: ${filename}`, { dir, filename });
        });
        
        this.fileWatchers.set(fullPath, watcher);
        this.log("info", `Watching directory: ${dir}`);
      } catch (error) {
        this.log("error", `Failed to watch ${dir}`, { error: String(error) });
      }
    });

    return { success: true };
  }

  stopFileWatcher(): void {
    this.fileWatchers.forEach((watcher, path) => {
      try {
        watcher.close();
      } catch (e) {
        this.log("error", `Failed to close watcher for ${path}`, { error: String(e) });
      }
    });
    this.fileWatchers.clear();
    this.isWatching = false;
    this.log("info", "File watcher stopped");
  }

  getRecentFileChanges(limit: number = 50): FileChange[] {
    return this.fileChanges.slice(-Math.min(limit, 100));
  }

  getWatcherStatus(): { isWatching: boolean; watchedPaths: string[]; changeCount: number } {
    return {
      isWatching: this.isWatching,
      watchedPaths: Array.from(this.fileWatchers.keys()).map(p => path.relative(this.projectRoot, p)),
      changeCount: this.fileChanges.length,
    };
  }

  // Self-Evolution System
  async analyzeForEvolution(): Promise<{ suggestions: string[]; score: number }> {
    await this.log("info", "Analyzing platform for evolution opportunities...");
    
    const codebaseInfo = await this.executeTool("search", { pattern: "TODO|FIXME|HACK", path: "." });
    const packageJson = await this.executeTool("file_read", { path: "package.json" });
    
    const systemPrompt = `أنت محلل التطور الذاتي لنظام INFERA WebNova.
مهمتك تحليل النظام واقتراح تحسينات ذكية.

قم بتحليل:
1. جودة الكود والأنماط
2. الأمان والثغرات المحتملة
3. الأداء والتحسينات
4. الميزات الناقصة
5. فرص الأتمتة

أجب بـ JSON:
{
  "score": 0-100,
  "suggestions": ["اقتراح 1", "اقتراح 2"],
  "priorities": [{ "description": "...", "priority": 1-10 }]
}`;

    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{
          role: "user",
          content: `معلومات النظام:
- نتائج البحث: ${JSON.stringify(codebaseInfo.output).slice(0, 2000)}
- Package.json: ${JSON.stringify(packageJson.output).slice(0, 1000)}

قم بتحليل النظام واقتراح تحسينات.`,
        }],
      });

      const content = response.content[0];
      if (content.type === "text") {
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          await this.log("info", "Evolution analysis complete", result);
          return { suggestions: result.suggestions || [], score: result.score || 0 };
        }
      }
    } catch (error) {
      await this.log("error", "Evolution analysis failed", { error: String(error) });
    }

    return { suggestions: [], score: 0 };
  }

  async createEvolutionGoal(description: string, priority: number = 5): Promise<EvolutionGoal> {
    const goal: EvolutionGoal = {
      id: `evo-${Date.now()}`,
      description,
      priority,
      status: "pending",
      createdAt: new Date(),
    };
    
    this.evolutionGoals.push(goal);
    await this.log("info", `Evolution goal created: ${description}`, { priority });
    
    return goal;
  }

  async executeEvolution(goalId: string): Promise<{ success: boolean; result?: any }> {
    const goal = this.evolutionGoals.find(g => g.id === goalId);
    if (!goal) return { success: false };

    goal.status = "analyzing";
    await this.log("info", `Starting evolution: ${goal.description}`);

    try {
      const task = await this.createTask({
        title: `[Evolution] ${goal.description}`,
        prompt: `نفذ هدف التطور التالي بشكل مستقل: ${goal.description}`,
        priority: goal.priority,
      });

      await this.planTask(task.id);
      const result = await this.executeTask(task.id);
      
      goal.status = result ? "completed" : "failed";
      return { success: !!result, result };
    } catch (error) {
      goal.status = "failed";
      await this.log("error", "Evolution failed", { error: String(error) });
      return { success: false };
    }
  }

  getEvolutionGoals(): EvolutionGoal[] {
    return this.evolutionGoals;
  }

  async selfImprove(): Promise<{ improved: boolean; changes: string[] }> {
    await this.log("info", "Starting self-improvement cycle...");
    
    const analysis = await this.analyzeForEvolution();
    const changes: string[] = [];

    if (analysis.suggestions.length > 0 && analysis.score < 80) {
      const topSuggestion = analysis.suggestions[0];
      const goal = await this.createEvolutionGoal(topSuggestion, 8);
      const result = await this.executeEvolution(goal.id);
      
      if (result.success) {
        changes.push(topSuggestion);
      }
    }

    await this.log("info", "Self-improvement cycle complete", { changes });
    return { improved: changes.length > 0, changes };
  }

  // Git Integration
  async gitStatus(): Promise<{ branch: string; changes: { file: string; status: string }[]; ahead: number; behind: number }> {
    try {
      const { stdout: branchOut } = await execAsync("git rev-parse --abbrev-ref HEAD", { cwd: this.projectRoot });
      const { stdout: statusOut } = await execAsync("git status --porcelain", { cwd: this.projectRoot });
      
      const changes = statusOut.trim().split("\n").filter(Boolean).map(line => ({
        status: line.substring(0, 2).trim(),
        file: line.substring(3),
      }));

      return {
        branch: branchOut.trim(),
        changes,
        ahead: 0,
        behind: 0,
      };
    } catch (error) {
      await this.log("error", "Git status failed", { error: String(error) });
      return { branch: "unknown", changes: [], ahead: 0, behind: 0 };
    }
  }

  async gitCommit(message: string): Promise<{ success: boolean; hash?: string; error?: string }> {
    if (!message || message.length < 3) {
      return { success: false, error: "Commit message too short" };
    }
    
    // Sanitize message: only allow alphanumeric, spaces, and basic punctuation
    const sanitizedMessage = message.replace(/[^a-zA-Z0-9\u0600-\u06FF\s.,!?:\-_()]/g, "").substring(0, 200);
    if (sanitizedMessage.length < 3) {
      return { success: false, error: "Commit message contains invalid characters" };
    }
    
    try {
      const { spawn } = await import("child_process");
      
      // Use spawn with argument array to prevent injection
      await new Promise<void>((resolve, reject) => {
        const proc = spawn("git", ["add", "-A"], { cwd: this.projectRoot });
        proc.on("close", code => code === 0 ? resolve() : reject(new Error("git add failed")));
        proc.on("error", reject);
      });
      
      const stdout = await new Promise<string>((resolve, reject) => {
        let output = "";
        const proc = spawn("git", ["commit", "-m", sanitizedMessage], { cwd: this.projectRoot });
        proc.stdout.on("data", d => output += d.toString());
        proc.stderr.on("data", d => output += d.toString());
        proc.on("close", code => code === 0 ? resolve(output) : reject(new Error(output)));
        proc.on("error", reject);
      });
      
      const hashMatch = stdout.match(/\[[\w-]+ ([a-f0-9]+)\]/);
      await this.log("info", `Git commit: ${sanitizedMessage}`, { hash: hashMatch?.[1] });
      return { success: true, hash: hashMatch?.[1] };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async gitLog(limit: number = 10): Promise<{ hash: string; message: string; date: string; author: string }[]> {
    try {
      const { stdout } = await execAsync(
        `git log --oneline -${Math.min(limit, 50)} --format="%H|%s|%ar|%an"`,
        { cwd: this.projectRoot }
      );
      
      return stdout.trim().split("\n").filter(Boolean).map(line => {
        const [hash, message, date, author] = line.split("|");
        return { hash: hash.substring(0, 7), message, date, author };
      });
    } catch (error) {
      return [];
    }
  }

  // Project Explorer
  async getProjectStructure(dir: string = "."): Promise<{ name: string; path: string; type: "file" | "folder"; children?: any[] }[]> {
    // Normalize and validate path
    const normalizedDir = path.normalize(dir).replace(/^(\.\.(\/|\\|$))+/, "");
    
    if (!this.isPathSafe(normalizedDir)) {
      await this.log("warn", "Path traversal attempt blocked", { dir });
      return [];
    }

    const fullPath = path.resolve(this.projectRoot, normalizedDir);
    
    // Double-check resolved path is within project
    if (!fullPath.startsWith(this.projectRoot)) {
      return [];
    }
    const items: any[] = [];
    
    try {
      const entries = fs.readdirSync(fullPath, { withFileTypes: true });
      const ignoreDirs = ["node_modules", ".git", "dist", ".next", ".cache", "__pycache__"];
      
      for (const entry of entries) {
        if (entry.name.startsWith(".") || ignoreDirs.includes(entry.name)) continue;
        
        const itemPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          items.push({
            name: entry.name,
            path: itemPath,
            type: "folder",
          });
        } else {
          items.push({
            name: entry.name,
            path: itemPath,
            type: "file",
          });
        }
      }
      
      return items.sort((a, b) => {
        if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      return [];
    }
  }

  // Dependency Management
  async getDependencies(): Promise<{ dependencies: Record<string, string>; devDependencies: Record<string, string> }> {
    try {
      const pkgPath = path.join(this.projectRoot, "package.json");
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      
      return {
        dependencies: pkg.dependencies || {},
        devDependencies: pkg.devDependencies || {},
      };
    } catch {
      return { dependencies: {}, devDependencies: {} };
    }
  }

  async installDependency(name: string, dev: boolean = false): Promise<{ success: boolean; error?: string }> {
    // Strict npm package name validation: @scope/name or name format
    if (!name || !/^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/i.test(name)) {
      return { success: false, error: "Invalid package name format" };
    }

    // Additional safety: no shell metacharacters
    if (/[;&|`$(){}[\]<>\\'"!#%^*?]/.test(name)) {
      return { success: false, error: "Package name contains forbidden characters" };
    }

    try {
      const { spawn } = await import("child_process");
      
      const args = ["install", dev ? "--save-dev" : "--save", name];
      
      const output = await new Promise<string>((resolve, reject) => {
        let out = "";
        const proc = spawn("npm", args, { cwd: this.projectRoot, timeout: 120000 });
        proc.stdout.on("data", d => out += d.toString());
        proc.stderr.on("data", d => out += d.toString());
        proc.on("close", code => code === 0 ? resolve(out) : reject(new Error(out)));
        proc.on("error", reject);
      });

      await this.log("info", `Installed dependency: ${name}`, { dev });
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  // Autonomous Loop
  private autonomousLoopActive: boolean = false;
  private autonomousInterval: NodeJS.Timeout | null = null;

  async startAutonomousLoop(intervalMs: number = 30000): Promise<{ success: boolean }> {
    if (this.autonomousLoopActive) return { success: true };
    
    this.autonomousLoopActive = true;
    await this.log("info", "Starting autonomous development loop...");

    this.autonomousInterval = setInterval(async () => {
      if (!this.autonomousLoopActive) return;
      
      try {
        // Check for pending evolution goals
        const pendingGoals = this.evolutionGoals.filter(g => g.status === "pending");
        if (pendingGoals.length > 0) {
          const goal = pendingGoals.sort((a, b) => b.priority - a.priority)[0];
          await this.executeEvolution(goal.id);
        } else {
          // Run self-improvement if no pending goals
          await this.selfImprove();
        }
      } catch (error) {
        await this.log("error", "Autonomous loop error", { error: String(error) });
      }
    }, intervalMs);

    return { success: true };
  }

  stopAutonomousLoop(): void {
    this.autonomousLoopActive = false;
    if (this.autonomousInterval) {
      clearInterval(this.autonomousInterval);
      this.autonomousInterval = null;
    }
    this.log("info", "Autonomous loop stopped");
  }

  getAutonomousStatus(): { active: boolean; pendingGoals: number } {
    return {
      active: this.autonomousLoopActive,
      pendingGoals: this.evolutionGoals.filter(g => g.status === "pending").length,
    };
  }

  // Chat with AI - main interaction method
  async chat(prompt: string): Promise<{
    response: string;
    tasks?: { id: string; content: string; status: string }[];
    actions?: { id: string; type: string; description: string; status: string }[];
    filesModified?: string[];
  }> {
    await this.log("info", "Chat received", { prompt: prompt.substring(0, 100) });
    
    const actions: { id: string; type: string; description: string; status: string }[] = [];
    const filesModified: string[] = [];

    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: `أنت INFRA Agent - بيئة تطوير ذكية مستقلة داخل INFRA WebNova.
        
مهمتك:
- تحليل طلبات المستخدم
- كتابة وتعديل الكود
- إدارة الملفات
- تنفيذ الأوامر
- التطور الذاتي

عند الرد:
1. اشرح ما ستفعله باختصار
2. حدد الخطوات المطلوبة
3. نفذ الخطوات
4. أبلغ عن النتيجة

أجب باللغة العربية دائماً.`,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      // Safely extract response content
      let aiResponse = "";
      if (response.content && response.content.length > 0) {
        const firstContent = response.content[0];
        if (firstContent && firstContent.type === "text") {
          aiResponse = firstContent.text;
        }
      }
      
      if (!aiResponse) {
        aiResponse = "لم أتمكن من معالجة الطلب. حاول مرة أخرى.";
      }
      
      // Parse AI response for actions
      const taskMatches = aiResponse.match(/(?:خطوة|مهمة|سأقوم بـ)\s*\d*[:.]\s*([^\n]+)/g);
      const tasks = taskMatches?.map((match, i) => ({
        id: `task-${Date.now()}-${i}`,
        content: match.replace(/(?:خطوة|مهمة|سأقوم بـ)\s*\d*[:.]\s*/, "").trim(),
        status: "pending",
      })) || [];

      await this.log("info", "Chat response generated", { 
        responseLength: aiResponse.length,
        tasksCount: tasks.length 
      });

      return {
        response: aiResponse,
        tasks,
        actions,
        filesModified,
      };
    } catch (error: any) {
      await this.log("error", "Chat failed", { error: error.message });
      return {
        response: `حدث خطأ: ${error.message}`,
        tasks: [],
        actions: [],
        filesModified: [],
      };
    }
  }

  // Get workflow status
  getWorkflowStatus(): { running: boolean; uptime: number } {
    return {
      running: true, // Will be replaced with actual workflow monitoring
      uptime: process.uptime(),
    };
  }
}

export const inferaAgent = new InferaAgentController();
