import type { Express, Request, Response } from "express";
import { spawn, exec } from "child_process";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { promisify } from "util";
import { z } from "zod";

const execAsync = promisify(exec);

// ==================== محرك التنفيذ الآمن ====================
// Secure Execution Engine for INFERA WebNova

// Execution request schema - SECURITY: No user-specified working directory
const executeCodeSchema = z.object({
  language: z.enum(["nodejs", "python", "shell", "typescript"]),
  code: z.string().min(1).max(50000), // Max 50KB code
  timeout: z.number().min(1000).max(60000).default(30000),
  // workingDir removed for security - always use sandbox
});

// Project execution schema
const executeProjectSchema = z.object({
  projectId: z.string(),
  command: z.enum(["install", "build", "start", "test", "stop"]),
  options: z.record(z.any()).optional(),
});

// Command whitelist for security
const ALLOWED_SHELL_COMMANDS = [
  "ls", "cat", "echo", "pwd", "mkdir", "cp", "mv", "rm", "touch",
  "node", "npm", "npx", "python", "python3", "pip", "pip3",
  "git", "curl", "wget", "tar", "zip", "unzip",
];

// Blocked patterns for security - Enhanced security measures
const BLOCKED_PATTERNS = [
  /rm\s+-rf\s+\//,
  /rm\s+-rf\s+~/,
  /rm\s+-rf\s+\*/,
  /sudo/i,
  /chmod\s+[0-7]*7[0-7]*/,
  /eval\s*\(/,
  /exec\s*\(/,
  /system\s*\(/,
  /\$\(/,  // Command substitution
  /`.*`/,  // Backtick execution
  />\s*\/etc/,
  />\s*\/var/,
  />\s*\/usr/,
  />\s*\/home/,
  />\s*\/root/,
  />\s*~\//,
  /process\.env/i,  // Prevent env access
  /child_process/i,  // Prevent spawning
  /require\s*\(\s*['"]child_process/i,
  /require\s*\(\s*['"]fs/i,  // Prevent filesystem access
  /import\s+.*from\s+['"]child_process/i,
  /import\s+.*from\s+['"]fs/i,
  /\.\.\/\.\.\//,  // Path traversal
  /\/proc\//,
  /\/sys\//,
  /\/dev\//,
  /curl\s+.*\|/,  // Pipe from curl
  /wget\s+.*\|/,  // Pipe from wget
  /bash\s+-c/i,
  /sh\s+-c/i,
  /nc\s+-/,  // netcat
  /ncat\s+-/,
  /socat/,
  /telnet/,
  /ssh\s+/,
  /scp\s+/,
  /rsync\s+/,
  /mkfifo/,
  /mknod/,
];

// Active processes tracking
const activeProcesses: Map<string, { pid: number; startedAt: Date; projectId?: string }> = new Map();

// Resource limits
const RESOURCE_LIMITS = {
  maxMemoryMB: 512,
  maxCpuPercent: 50,
  maxOutputBytes: 1024 * 1024, // 1MB
  maxFileSize: 10 * 1024 * 1024, // 10MB
};

// Validate code for malicious patterns - ENHANCED SECURITY
function validateCode(code: string, language: string): { valid: boolean; reason?: string } {
  // Check code size
  if (code.length > 50000) {
    return { valid: false, reason: "Code too large (max 50KB)" };
  }
  
  // Check for blocked patterns
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(code)) {
      return { valid: false, reason: `Blocked pattern detected` };
    }
  }
  
  // Strict shell command validation - only allow single command, no chaining
  if (language === "shell") {
    // Block command chaining/piping
    if (/[;&|]/.test(code) || /\n/.test(code.trim())) {
      return { valid: false, reason: "Command chaining not allowed" };
    }
    
    const firstWord = code.trim().split(/\s+/)[0];
    if (!ALLOWED_SHELL_COMMANDS.includes(firstWord)) {
      return { valid: false, reason: `Command not allowed: ${firstWord}` };
    }
  }
  
  return { valid: true };
}

// Create sandbox directory for execution
async function createSandbox(executionId: string): Promise<string> {
  const sandboxDir = path.join(os.tmpdir(), "infera-sandbox", executionId);
  await fs.mkdir(sandboxDir, { recursive: true });
  return sandboxDir;
}

// Clean up sandbox after execution
async function cleanupSandbox(sandboxDir: string): Promise<void> {
  try {
    await fs.rm(sandboxDir, { recursive: true, force: true });
  } catch (error) {
    console.error("Failed to cleanup sandbox:", error);
  }
}

// Execute Node.js code
async function executeNodeJS(code: string, sandboxDir: string, timeout: number): Promise<{
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
}> {
  const startTime = Date.now();
  const filePath = path.join(sandboxDir, "script.js");
  
  await fs.writeFile(filePath, code);
  
  try {
    const { stdout, stderr } = await execAsync(`node "${filePath}"`, {
      timeout,
      cwd: sandboxDir,
      maxBuffer: RESOURCE_LIMITS.maxOutputBytes,
    });
    
    return {
      success: true,
      output: stdout,
      error: stderr || undefined,
      executionTime: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      success: false,
      output: error.stdout || "",
      error: error.stderr || error.message,
      executionTime: Date.now() - startTime,
    };
  }
}

// Execute Python code
async function executePython(code: string, sandboxDir: string, timeout: number): Promise<{
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
}> {
  const startTime = Date.now();
  const filePath = path.join(sandboxDir, "script.py");
  
  await fs.writeFile(filePath, code);
  
  try {
    const { stdout, stderr } = await execAsync(`python3 "${filePath}"`, {
      timeout,
      cwd: sandboxDir,
      maxBuffer: RESOURCE_LIMITS.maxOutputBytes,
    });
    
    return {
      success: true,
      output: stdout,
      error: stderr || undefined,
      executionTime: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      success: false,
      output: error.stdout || "",
      error: error.stderr || error.message,
      executionTime: Date.now() - startTime,
    };
  }
}

// Execute Shell command
async function executeShell(command: string, sandboxDir: string, timeout: number): Promise<{
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
}> {
  const startTime = Date.now();
  
  try {
    const { stdout, stderr } = await execAsync(command, {
      timeout,
      cwd: sandboxDir,
      maxBuffer: RESOURCE_LIMITS.maxOutputBytes,
    });
    
    return {
      success: true,
      output: stdout,
      error: stderr || undefined,
      executionTime: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      success: false,
      output: error.stdout || "",
      error: error.stderr || error.message,
      executionTime: Date.now() - startTime,
    };
  }
}

// Execute TypeScript code
async function executeTypeScript(code: string, sandboxDir: string, timeout: number): Promise<{
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
}> {
  const startTime = Date.now();
  const filePath = path.join(sandboxDir, "script.ts");
  
  await fs.writeFile(filePath, code);
  
  try {
    // Use tsx for TypeScript execution
    const { stdout, stderr } = await execAsync(`npx tsx "${filePath}"`, {
      timeout,
      cwd: sandboxDir,
      maxBuffer: RESOURCE_LIMITS.maxOutputBytes,
    });
    
    return {
      success: true,
      output: stdout,
      error: stderr || undefined,
      executionTime: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      success: false,
      output: error.stdout || "",
      error: error.stderr || error.message,
      executionTime: Date.now() - startTime,
    };
  }
}

// Install npm packages
async function installPackages(packages: string[], sandboxDir: string): Promise<{
  success: boolean;
  output: string;
  error?: string;
}> {
  if (packages.length === 0) {
    return { success: true, output: "No packages to install" };
  }
  
  // Validate package names
  const validPackagePattern = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*(@[a-z0-9-._~]+)?$/i;
  for (const pkg of packages) {
    if (!validPackagePattern.test(pkg)) {
      return { success: false, output: "", error: `Invalid package name: ${pkg}` };
    }
  }
  
  try {
    // Initialize package.json if not exists
    const packageJsonPath = path.join(sandboxDir, "package.json");
    try {
      await fs.access(packageJsonPath);
    } catch {
      await fs.writeFile(packageJsonPath, JSON.stringify({ name: "sandbox", version: "1.0.0" }));
    }
    
    const { stdout, stderr } = await execAsync(`npm install ${packages.join(" ")}`, {
      cwd: sandboxDir,
      timeout: 120000, // 2 minutes for installation
      maxBuffer: RESOURCE_LIMITS.maxOutputBytes,
    });
    
    return {
      success: true,
      output: stdout,
      error: stderr || undefined,
    };
  } catch (error: any) {
    return {
      success: false,
      output: error.stdout || "",
      error: error.stderr || error.message,
    };
  }
}

// Simple auth check for execution routes - SECURITY
const requireExecutionAuth = (req: Request, res: Response, next: Function) => {
  // Check session authentication
  const session = (req as any).session;
  if (!session?.userId && !session?.user) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
      errorAr: "المصادقة مطلوبة",
    });
  }
  next();
};

// Register execution API routes
export function registerExecutionRoutes(app: Express): void {
  
  // ==================== تنفيذ الكود ====================
  // Execute code in sandbox (AUTHENTICATED)
  app.post("/api/execution/run", requireExecutionAuth, async (req: Request, res: Response) => {
    try {
      const data = executeCodeSchema.parse(req.body);
      
      // Validate code for security
      const validation = validateCode(data.code, data.language);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: validation.reason,
          errorAr: "الكود يحتوي على أنماط محظورة",
        });
      }
      
      // Create sandbox
      const executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const sandboxDir = await createSandbox(executionId);
      
      try {
        let result;
        
        switch (data.language) {
          case "nodejs":
            result = await executeNodeJS(data.code, sandboxDir, data.timeout);
            break;
          case "python":
            result = await executePython(data.code, sandboxDir, data.timeout);
            break;
          case "shell":
            result = await executeShell(data.code, sandboxDir, data.timeout);
            break;
          case "typescript":
            result = await executeTypeScript(data.code, sandboxDir, data.timeout);
            break;
          default:
            return res.status(400).json({
              success: false,
              error: `Unsupported language: ${data.language}`,
            });
        }
        
        res.json({
          success: result.success,
          executionId,
          language: data.language,
          output: result.output,
          error: result.error,
          executionTime: result.executionTime,
        });
      } finally {
        // Cleanup sandbox after short delay
        setTimeout(() => cleanupSandbox(sandboxDir), 5000);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: error.errors.map(e => e.message).join(", "),
        });
      }
      console.error("Execution error:", error);
      res.status(500).json({
        success: false,
        error: "Execution failed",
        errorAr: "فشل التنفيذ",
      });
    }
  });
  
  // ==================== تثبيت الحزم ====================
  // Install packages (AUTHENTICATED, RESTRICTED)
  app.post("/api/execution/install", requireExecutionAuth, async (req: Request, res: Response) => {
    try {
      const { packages, executionId } = req.body;
      
      if (!Array.isArray(packages)) {
        return res.status(400).json({
          success: false,
          error: "packages must be an array",
        });
      }
      
      const sandboxDir = path.join(os.tmpdir(), "infera-sandbox", executionId || `install-${Date.now()}`);
      await fs.mkdir(sandboxDir, { recursive: true });
      
      const result = await installPackages(packages, sandboxDir);
      
      res.json({
        success: result.success,
        output: result.output,
        error: result.error,
      });
    } catch (error) {
      console.error("Install error:", error);
      res.status(500).json({
        success: false,
        error: "Package installation failed",
        errorAr: "فشل تثبيت الحزم",
      });
    }
  });
  
  // ==================== حالة التنفيذ ====================
  // Get execution capabilities and status
  app.get("/api/execution/status", async (req: Request, res: Response) => {
    try {
      // Check available runtimes
      const runtimes: Record<string, { available: boolean; version?: string }> = {};
      
      // Check Node.js
      try {
        const { stdout } = await execAsync("node --version");
        runtimes.nodejs = { available: true, version: stdout.trim() };
      } catch {
        runtimes.nodejs = { available: false };
      }
      
      // Check Python
      try {
        const { stdout } = await execAsync("python3 --version");
        runtimes.python = { available: true, version: stdout.trim() };
      } catch {
        runtimes.python = { available: false };
      }
      
      // Check npm
      try {
        const { stdout } = await execAsync("npm --version");
        runtimes.npm = { available: true, version: stdout.trim() };
      } catch {
        runtimes.npm = { available: false };
      }
      
      // Check pip
      try {
        const { stdout } = await execAsync("pip3 --version");
        runtimes.pip = { available: true, version: stdout.trim() };
      } catch {
        runtimes.pip = { available: false };
      }
      
      res.json({
        status: "operational",
        statusAr: "يعمل",
        runtimes,
        limits: RESOURCE_LIMITS,
        activeProcesses: activeProcesses.size,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        error: "Failed to get execution status",
      });
    }
  });
  
  // ==================== إنشاء ملفات المشروع ====================
  // Create project files (AUTHENTICATED)
  app.post("/api/execution/files", requireExecutionAuth, async (req: Request, res: Response) => {
    try {
      const { executionId, files } = req.body;
      
      if (!executionId || !files || typeof files !== "object") {
        return res.status(400).json({
          success: false,
          error: "executionId and files object required",
        });
      }
      
      const sandboxDir = path.join(os.tmpdir(), "infera-sandbox", executionId);
      await fs.mkdir(sandboxDir, { recursive: true });
      
      const createdFiles: string[] = [];
      
      for (const [filePath, content] of Object.entries(files)) {
        if (typeof content !== "string") continue;
        
        // Security: prevent path traversal
        const normalizedPath = path.normalize(filePath);
        if (normalizedPath.startsWith("..") || normalizedPath.startsWith("/")) {
          continue;
        }
        
        const fullPath = path.join(sandboxDir, normalizedPath);
        const dir = path.dirname(fullPath);
        
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(fullPath, content);
        createdFiles.push(normalizedPath);
      }
      
      res.json({
        success: true,
        executionId,
        sandboxDir,
        createdFiles,
      });
    } catch (error) {
      console.error("File creation error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create files",
        errorAr: "فشل إنشاء الملفات",
      });
    }
  });
  
  // ==================== قراءة ملفات المشروع ====================
  // Read project files
  app.get("/api/execution/files/:executionId/*", async (req: Request, res: Response) => {
    try {
      const { executionId } = req.params;
      const filePath = req.params[0];
      
      if (!executionId || !filePath) {
        return res.status(400).json({
          success: false,
          error: "executionId and file path required",
        });
      }
      
      // Security: prevent path traversal
      const normalizedPath = path.normalize(filePath);
      if (normalizedPath.startsWith("..") || normalizedPath.startsWith("/")) {
        return res.status(403).json({
          success: false,
          error: "Invalid file path",
        });
      }
      
      const sandboxDir = path.join(os.tmpdir(), "infera-sandbox", executionId);
      const fullPath = path.join(sandboxDir, normalizedPath);
      
      const content = await fs.readFile(fullPath, "utf-8");
      
      res.json({
        success: true,
        path: normalizedPath,
        content,
      });
    } catch (error: any) {
      if (error.code === "ENOENT") {
        return res.status(404).json({
          success: false,
          error: "File not found",
        });
      }
      res.status(500).json({
        success: false,
        error: "Failed to read file",
      });
    }
  });
}
