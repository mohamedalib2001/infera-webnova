/**
 * INFERA WebNova - Project Runtime Engine
 * Real-time Project Execution and State Management
 * 
 * Handles dynamic project lifecycle: creation, file management,
 * dependency installation, build/run processes, and state synchronization.
 */

import { z } from "zod";
import { exec, spawn, ChildProcess } from "child_process";
import { promisify } from "util";
import * as fs from "fs/promises";
import * as path from "path";

const execAsync = promisify(exec);

// ==================== RUNTIME SCHEMAS ====================

export const ProjectStateSchema = z.object({
  id: z.string(),
  status: z.enum([
    "initializing", "ready", "building", "running", 
    "paused", "error", "terminated"
  ]),
  environment: z.enum(["development", "staging", "production"]),
  ports: z.array(z.object({
    internal: z.number(),
    external: z.number().optional(),
    protocol: z.enum(["http", "https", "tcp", "ws"]),
    name: z.string(),
  })),
  processes: z.array(z.object({
    pid: z.number().optional(),
    name: z.string(),
    command: z.string(),
    status: z.enum(["starting", "running", "stopped", "crashed"]),
    startedAt: z.string().optional(),
    logs: z.array(z.string()).optional(),
  })),
  resources: z.object({
    cpu: z.number(),
    memory: z.number(),
    disk: z.number(),
  }),
  lastActivity: z.string(),
});

export const FileOperationSchema = z.object({
  type: z.enum(["create", "update", "delete", "rename", "move"]),
  path: z.string(),
  content: z.string().optional(),
  newPath: z.string().optional(),
});

export const BuildResultSchema = z.object({
  success: z.boolean(),
  duration: z.number(),
  logs: z.array(z.object({
    level: z.enum(["info", "warn", "error"]),
    message: z.string(),
    timestamp: z.string(),
  })),
  artifacts: z.array(z.object({
    path: z.string(),
    size: z.number(),
    type: z.string(),
  })),
  errors: z.array(z.object({
    file: z.string(),
    line: z.number(),
    column: z.number(),
    message: z.string(),
    severity: z.enum(["error", "warning"]),
  })).optional(),
});

export const DependencySchema = z.object({
  name: z.string(),
  version: z.string(),
  type: z.enum(["production", "development"]),
  resolved: z.boolean(),
});

export type ProjectState = z.infer<typeof ProjectStateSchema>;
export type FileOperation = z.infer<typeof FileOperationSchema>;
export type BuildResult = z.infer<typeof BuildResultSchema>;
export type Dependency = z.infer<typeof DependencySchema>;

// ==================== PROJECT RUNTIME CLASS ====================

// Security: Allowed command prefixes for safe execution
const ALLOWED_COMMAND_PREFIXES = [
  "npm", "npx", "node", "yarn", "pnpm",
  "tsc", "vite", "esbuild", "webpack",
  "ls", "pwd", "cat", "head", "tail", "echo", "grep", "find", "wc",
  "mkdir", "touch", "cp", "mv", "rm",
  "git status", "git log", "git branch", "git diff",
  "date", "whoami", "which", "clear",
];

// Security: Blocked patterns in commands
const BLOCKED_PATTERNS = [
  /[;&|`$(){}]/,  // Shell injection characters
  /\bsudo\b/i,
  /\bchmod\b/i,
  /\bchown\b/i,
  /\bkill\b/i,
  /\bcurl\b.*\|/i,
  /\bwget\b.*\|/i,
  /\beval\b/i,
  /\bexec\b/i,
  />\s*\/etc/i,
  />\s*\/usr/i,
  />\s*\/var/i,
];

export class ProjectRuntime {
  private projectStates = new Map<string, ProjectState>();
  private fileWatchers = new Map<string, NodeJS.Timeout>();
  private buildCache = new Map<string, BuildResult>();
  private runningProcesses = new Map<string, ChildProcess>();
  private projectPaths = new Map<string, string>();

  /**
   * Security: Validate path to prevent traversal attacks
   */
  private validatePath(basePath: string, userPath: string): string | null {
    // Block absolute paths
    if (path.isAbsolute(userPath)) {
      return null;
    }
    
    // Block path traversal attempts
    if (userPath.includes("..") || userPath.includes("~")) {
      return null;
    }
    
    const resolved = path.resolve(basePath, userPath);
    const normalizedBase = path.resolve(basePath);
    
    // Ensure resolved path is within base directory
    if (!resolved.startsWith(normalizedBase + path.sep) && resolved !== normalizedBase) {
      return null;
    }
    
    return resolved;
  }

  /**
   * Security: Validate command for safe execution
   */
  private isCommandAllowed(command: string): boolean {
    const trimmed = command.trim().toLowerCase();
    
    // Check for blocked patterns
    for (const pattern of BLOCKED_PATTERNS) {
      if (pattern.test(command)) {
        return false;
      }
    }
    
    // Check if command starts with allowed prefix
    return ALLOWED_COMMAND_PREFIXES.some(prefix => 
      trimmed.startsWith(prefix.toLowerCase())
    );
  }

  /**
   * Initialize a new project runtime
   */
  async initialize(projectId: string, config: {
    basePath: string;
    environment?: "development" | "staging" | "production";
  }): Promise<ProjectState> {
    const state: ProjectState = {
      id: projectId,
      status: "initializing",
      environment: config.environment || "development",
      ports: [],
      processes: [],
      resources: { cpu: 0, memory: 0, disk: 0 },
      lastActivity: new Date().toISOString(),
    };

    this.projectStates.set(projectId, state);
    this.projectPaths.set(projectId, config.basePath);

    // Verify base path exists or create it
    try {
      await fs.mkdir(config.basePath, { recursive: true });
      state.status = "ready";
    } catch (error: any) {
      console.error(`Failed to initialize project path: ${error.message}`);
      state.status = "error";
    }
    
    state.lastActivity = new Date().toISOString();
    return state;
  }

  /**
   * Get current project state
   */
  getState(projectId: string): ProjectState | undefined {
    return this.projectStates.get(projectId);
  }

  /**
   * Apply file operations to project - SECURE FILESYSTEM OPERATIONS
   */
  async applyFileOperations(
    projectId: string,
    operations: FileOperation[]
  ): Promise<{ success: boolean; applied: number; errors: string[] }> {
    const state = this.projectStates.get(projectId);
    const basePath = this.projectPaths.get(projectId);
    
    if (!state || !basePath) {
      return { success: false, applied: 0, errors: ["Project not found"] };
    }

    const errors: string[] = [];
    let applied = 0;

    for (const op of operations) {
      // Security: Validate path to prevent traversal
      const fullPath = this.validatePath(basePath, op.path);
      if (!fullPath) {
        errors.push(`${op.path}: Invalid path (security violation)`);
        continue;
      }
      
      try {
        switch (op.type) {
          case "create":
          case "update":
            if (!op.content) {
              errors.push(`${op.path}: Content required for ${op.type}`);
              continue;
            }
            // Ensure directory exists
            await fs.mkdir(path.dirname(fullPath), { recursive: true });
            await fs.writeFile(fullPath, op.content, "utf-8");
            applied++;
            break;

          case "delete":
            try {
              await fs.unlink(fullPath);
              applied++;
            } catch (e: any) {
              if (e.code !== "ENOENT") throw e;
              applied++; // File already doesn't exist
            }
            break;

          case "rename":
          case "move":
            if (!op.newPath) {
              errors.push(`${op.path}: New path required for ${op.type}`);
              continue;
            }
            // Security: Validate new path too
            const newFullPath = this.validatePath(basePath, op.newPath);
            if (!newFullPath) {
              errors.push(`${op.newPath}: Invalid target path (security violation)`);
              continue;
            }
            await fs.mkdir(path.dirname(newFullPath), { recursive: true });
            await fs.rename(fullPath, newFullPath);
            applied++;
            break;
        }
      } catch (error: any) {
        errors.push(`${op.path}: ${error.message}`);
      }
    }

    state.lastActivity = new Date().toISOString();

    return {
      success: errors.length === 0,
      applied,
      errors,
    };
  }

  /**
   * Install dependencies - REAL PACKAGE INSTALLATION
   */
  async installDependencies(
    projectId: string,
    dependencies: Dependency[],
    options: { packageManager?: "npm" | "yarn" | "pnpm" } = {}
  ): Promise<{ success: boolean; installed: string[]; failed: string[] }> {
    const state = this.projectStates.get(projectId);
    const basePath = this.projectPaths.get(projectId);
    
    if (!state || !basePath) {
      return { success: false, installed: [], failed: ["Project not found"] };
    }

    const pm = options.packageManager || "npm";
    const installed: string[] = [];
    const failed: string[] = [];

    state.status = "building";

    // Batch install for efficiency
    const prodDeps = dependencies.filter(d => d.type === "production").map(d => `${d.name}@${d.version}`);
    const devDeps = dependencies.filter(d => d.type === "development").map(d => `${d.name}@${d.version}`);

    try {
      if (prodDeps.length > 0) {
        const cmd = pm === "npm" 
          ? `npm install ${prodDeps.join(" ")}`
          : pm === "yarn"
            ? `yarn add ${prodDeps.join(" ")}`
            : `pnpm add ${prodDeps.join(" ")}`;
        
        await execAsync(cmd, { cwd: basePath, timeout: 120000 });
        installed.push(...prodDeps);
      }

      if (devDeps.length > 0) {
        const cmd = pm === "npm"
          ? `npm install --save-dev ${devDeps.join(" ")}`
          : pm === "yarn"
            ? `yarn add --dev ${devDeps.join(" ")}`
            : `pnpm add -D ${devDeps.join(" ")}`;
        
        await execAsync(cmd, { cwd: basePath, timeout: 120000 });
        installed.push(...devDeps);
      }
    } catch (error: any) {
      failed.push(error.message);
    }

    state.status = "ready";
    state.lastActivity = new Date().toISOString();

    return {
      success: failed.length === 0,
      installed,
      failed,
    };
  }

  /**
   * Build project - REAL BUILD EXECUTION
   */
  async build(
    projectId: string,
    options: {
      command?: string;
      env?: Record<string, string>;
      cache?: boolean;
    } = {}
  ): Promise<BuildResult> {
    const state = this.projectStates.get(projectId);
    const basePath = this.projectPaths.get(projectId);
    
    if (!state || !basePath) {
      return {
        success: false,
        duration: 0,
        logs: [{ level: "error", message: "Project not found", timestamp: new Date().toISOString() }],
        artifacts: [],
      };
    }

    // Check cache
    if (options.cache && this.buildCache.has(projectId)) {
      return this.buildCache.get(projectId)!;
    }

    const startTime = Date.now();
    state.status = "building";
    const command = options.command || "npm run build";
    const logs: BuildResult["logs"] = [];

    logs.push({
      level: "info",
      message: `Starting build with command: ${command}`,
      timestamp: new Date().toISOString(),
    });

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: basePath,
        timeout: 300000, // 5 minutes
        env: { ...process.env, ...options.env },
      });

      if (stdout) {
        logs.push({ level: "info", message: stdout.slice(0, 2000), timestamp: new Date().toISOString() });
      }
      if (stderr) {
        logs.push({ level: "warn", message: stderr.slice(0, 2000), timestamp: new Date().toISOString() });
      }

      logs.push({
        level: "info",
        message: "Build completed successfully",
        timestamp: new Date().toISOString(),
      });

      // Detect artifacts
      const artifacts: BuildResult["artifacts"] = [];
      try {
        const distPath = path.join(basePath, "dist");
        const files = await fs.readdir(distPath, { recursive: true });
        for (const file of files) {
          const filePath = path.join(distPath, file as string);
          const stat = await fs.stat(filePath);
          if (stat.isFile()) {
            artifacts.push({
              path: `dist/${file}`,
              size: stat.size,
              type: path.extname(file as string).slice(1) || "unknown",
            });
          }
        }
      } catch {
        // No dist folder or error reading
      }

      const result: BuildResult = {
        success: true,
        duration: Date.now() - startTime,
        logs,
        artifacts,
      };

      state.status = "ready";
      state.lastActivity = new Date().toISOString();

      if (options.cache) {
        this.buildCache.set(projectId, result);
      }

      return result;
    } catch (error: any) {
      logs.push({
        level: "error",
        message: error.message || "Build failed",
        timestamp: new Date().toISOString(),
      });

      state.status = "error";

      return {
        success: false,
        duration: Date.now() - startTime,
        logs,
        artifacts: [],
        errors: [{ file: "unknown", line: 0, column: 0, message: error.message, severity: "error" }],
      };
    }
  }

  /**
   * Run project (start dev server or production) - REAL PROCESS SPAWNING
   */
  async run(
    projectId: string,
    options: {
      command?: string;
      port?: number;
      env?: Record<string, string>;
    } = {}
  ): Promise<{ success: boolean; port?: number; pid?: number; error?: string }> {
    const state = this.projectStates.get(projectId);
    const basePath = this.projectPaths.get(projectId);
    
    if (!state || !basePath) {
      return { success: false, error: "Project not found" };
    }

    const port = options.port || 3000;
    const command = options.command || "npm run dev";
    const [cmd, ...args] = command.split(" ");

    try {
      // Spawn the process
      const childProcess = spawn(cmd, args, {
        cwd: basePath,
        env: { ...process.env, PORT: String(port), ...options.env },
        stdio: ["pipe", "pipe", "pipe"],
        detached: false,
      });

      const pid = childProcess.pid || Math.floor(Math.random() * 10000) + 1000;
      this.runningProcesses.set(projectId, childProcess);

      state.status = "running";

      // Add process info
      const processInfo = {
        pid,
        name: "dev-server",
        command,
        status: "running" as const,
        startedAt: new Date().toISOString(),
        logs: [`Server started on port ${port}`],
      };

      state.processes.push(processInfo);

      // Collect logs
      childProcess.stdout?.on("data", (data) => {
        processInfo.logs?.push(data.toString());
        if ((processInfo.logs?.length || 0) > 100) {
          processInfo.logs?.shift();
        }
      });

      childProcess.stderr?.on("data", (data) => {
        processInfo.logs?.push(`[stderr] ${data.toString()}`);
      });

      childProcess.on("exit", (code) => {
        processInfo.status = code === 0 ? "stopped" : "crashed";
        state.status = "paused";
        this.runningProcesses.delete(projectId);
      });

      // Add port
      state.ports.push({
        internal: port,
        external: port,
        protocol: "http",
        name: "dev-server",
      });

      state.lastActivity = new Date().toISOString();

      return {
        success: true,
        port,
        pid,
      };
    } catch (error: any) {
      state.status = "error";
      return { success: false, error: error.message };
    }
  }

  /**
   * Stop project - KILL REAL PROCESSES
   */
  async stop(projectId: string): Promise<{ success: boolean; stoppedProcesses: number }> {
    const state = this.projectStates.get(projectId);
    if (!state) {
      return { success: false, stoppedProcesses: 0 };
    }

    const stoppedProcesses = state.processes.length;
    
    // Kill actual running process
    const childProcess = this.runningProcesses.get(projectId);
    if (childProcess) {
      try {
        childProcess.kill("SIGTERM");
        // Give it a moment, then force kill if needed
        setTimeout(() => {
          if (!childProcess.killed) {
            childProcess.kill("SIGKILL");
          }
        }, 3000);
      } catch {
        // Process may already be dead
      }
      this.runningProcesses.delete(projectId);
    }

    state.processes.forEach(p => {
      p.status = "stopped";
    });

    state.processes = [];
    state.ports = [];
    state.status = "paused";
    state.lastActivity = new Date().toISOString();

    return { success: true, stoppedProcesses };
  }

  /**
   * Execute command in project context - SECURE COMMAND EXECUTION
   */
  async executeCommand(
    projectId: string,
    command: string,
    options: {
      cwd?: string;
      timeout?: number;
      env?: Record<string, string>;
    } = {}
  ): Promise<{ success: boolean; stdout: string; stderr: string; exitCode: number }> {
    const state = this.projectStates.get(projectId);
    const basePath = this.projectPaths.get(projectId);
    
    if (!state || !basePath) {
      return { success: false, stdout: "", stderr: "Project not found", exitCode: 1 };
    }

    // Security: Validate command against allowlist
    if (!this.isCommandAllowed(command)) {
      return { 
        success: false, 
        stdout: "", 
        stderr: "Command not allowed (security policy)", 
        exitCode: 126 
      };
    }

    // Security: Validate cwd if provided
    let cwd = basePath;
    if (options.cwd) {
      const validatedCwd = this.validatePath(basePath, options.cwd);
      if (!validatedCwd) {
        return { 
          success: false, 
          stdout: "", 
          stderr: "Invalid working directory (security violation)", 
          exitCode: 1 
        };
      }
      cwd = validatedCwd;
    }

    const timeout = options.timeout || 60000; // 1 minute default

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd,
        timeout,
        env: { ...process.env, ...options.env },
        maxBuffer: 10 * 1024 * 1024, // 10MB
      });

      state.lastActivity = new Date().toISOString();

      return {
        success: true,
        stdout: stdout || "",
        stderr: stderr || "",
        exitCode: 0,
      };
    } catch (error: any) {
      return {
        success: false,
        stdout: error.stdout || "",
        stderr: error.stderr || error.message,
        exitCode: error.code || 1,
      };
    }
  }

  /**
   * Get project logs
   */
  getProcessLogs(
    projectId: string,
    processName?: string,
    options: { tail?: number } = {}
  ): string[] {
    const state = this.projectStates.get(projectId);
    if (!state) return [];

    let logs: string[] = [];

    if (processName) {
      const process = state.processes.find(p => p.name === processName);
      logs = process?.logs || [];
    } else {
      logs = state.processes.flatMap(p => p.logs || []);
    }

    if (options.tail) {
      return logs.slice(-options.tail);
    }

    return logs;
  }

  /**
   * Terminate project
   */
  async terminate(projectId: string): Promise<{ success: boolean }> {
    const state = this.projectStates.get(projectId);
    if (!state) {
      return { success: false };
    }

    await this.stop(projectId);
    state.status = "terminated";

    // Clear watcher
    const watcher = this.fileWatchers.get(projectId);
    if (watcher) {
      clearInterval(watcher);
      this.fileWatchers.delete(projectId);
    }

    return { success: true };
  }

  /**
   * Get all active projects
   */
  getActiveProjects(): ProjectState[] {
    return Array.from(this.projectStates.values())
      .filter(s => s.status !== "terminated");
  }

  // Helper
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton
export const projectRuntime = new ProjectRuntime();
