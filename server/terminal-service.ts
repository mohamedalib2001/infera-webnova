import { WebSocketServer, WebSocket } from "ws";
import { spawn, ChildProcess } from "child_process";
import { Server, IncomingMessage } from "http";
import path from "path";
import fs from "fs";
import crypto from "crypto";

// Secure token store for WebSocket authentication
const wsTokenStore = new Map<string, { projectId: string; userId: string; expiresAt: number }>();

// Generate a secure token for WebSocket connection
export function generateWsToken(projectId: string, userId: string): string {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minute expiry
  wsTokenStore.set(token, { projectId, userId, expiresAt });
  
  // Cleanup expired tokens
  for (const [key, value] of wsTokenStore.entries()) {
    if (value.expiresAt < Date.now()) {
      wsTokenStore.delete(key);
    }
  }
  
  return token;
}

// Validate token and return associated data (checks both projectId and userId)
function validateWsToken(token: string, projectId: string): { valid: boolean; userId?: string } {
  const data = wsTokenStore.get(token);
  if (!data) return { valid: false };
  if (data.expiresAt < Date.now()) {
    wsTokenStore.delete(token);
    return { valid: false };
  }
  if (data.projectId !== projectId) return { valid: false };
  
  // Token is valid, consume it (one-time use)
  wsTokenStore.delete(token);
  return { valid: true, userId: data.userId };
}

const ALLOWED_COMMANDS = [
  "ls", "pwd", "cat", "head", "tail", "echo", "grep", "find",
  "node", "npm", "npx", "python", "python3", "pip", "pip3",
  "git", "clear", "help", "mkdir", "touch", "mv", "cp"
];

const BLOCKED_PATTERNS = [
  /rm\s+-rf/, /rm\s+\//, /sudo/, /chmod\s+777/, /shutdown/, /reboot/,
  /curl.*\|.*sh/, /wget.*\|.*sh/, /eval/, /exec\s*\(/,
  /etc\/passwd/, /etc\/shadow/, /\.ssh/, /id_rsa/
];

function isCommandSafe(command: string): boolean {
  const cmd = command.trim().toLowerCase();
  
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(cmd)) return false;
  }
  
  const firstWord = cmd.split(/\s+/)[0];
  if (ALLOWED_COMMANDS.some(allowed => firstWord === allowed || firstWord.endsWith("/" + allowed))) {
    return true;
  }
  
  return false;
}

interface TerminalSession {
  id: string;
  projectId: string;
  process: ChildProcess;
  ws: WebSocket;
}

interface RuntimeSession {
  id: string;
  projectId: string;
  process: ChildProcess;
  type: "node" | "python" | "shell";
  port?: number;
}

const terminals = new Map<string, TerminalSession>();
const runtimes = new Map<string, RuntimeSession>();

const PROJECT_BASE_DIR = "/tmp/infera-projects";

function ensureProjectDir(projectId: string): string {
  const projectDir = path.join(PROJECT_BASE_DIR, projectId);
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true });
  }
  return projectDir;
}

export function initializeTerminalService(server: Server): void {
  const wss = new WebSocketServer({ 
    server,
    path: "/ws/terminal"
  });

  console.log("[Terminal] Secure WebSocket service initialized on /ws/terminal");

  wss.on("connection", (ws, req) => {
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const projectId = url.searchParams.get("projectId");
    const token = url.searchParams.get("token");
    const sessionId = `terminal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    if (!projectId) {
      ws.send(JSON.stringify({ type: "error", message: "Missing projectId" }));
      ws.close();
      return;
    }
    
    // Validate authentication token (checks projectId and returns userId)
    const tokenResult = token ? validateWsToken(token, projectId) : { valid: false };
    if (!tokenResult.valid) {
      ws.send(JSON.stringify({ type: "error", message: "Authentication required / مطلوب تسجيل الدخول" }));
      ws.close();
      return;
    }

    console.log(`[Terminal] Authenticated connection for project ${projectId}, user ${tokenResult.userId}`);
    const projectDir = ensureProjectDir(projectId);

    const session: TerminalSession = {
      id: sessionId,
      projectId,
      process: null as any,
      ws,
    };
    terminals.set(sessionId, session);

    ws.send(JSON.stringify({ 
      type: "connected", 
      sessionId,
      message: `INFERA Cloud Terminal - Project ${projectId}\nRestricted mode: Only safe commands allowed.\nType 'help' for available commands.\n`
    }));

    ws.on("message", async (message: Buffer) => {
      try {
        const msg = JSON.parse(message.toString());
        
        if (msg.type === "command" && msg.data) {
          const command = msg.data.trim();
          
          if (command === "clear") {
            ws.send(JSON.stringify({ type: "clear" }));
            return;
          }
          
          if (command === "help") {
            ws.send(JSON.stringify({ 
              type: "output", 
              data: `Available commands:\n  ${ALLOWED_COMMANDS.join(", ")}\n  clear, help` 
            }));
            return;
          }
          
          const result = await executeCommand(projectId, command);
          
          if (result.stdout) {
            ws.send(JSON.stringify({ type: "output", data: result.stdout }));
          }
          if (result.stderr) {
            ws.send(JSON.stringify({ type: "error", data: result.stderr }));
          }
          ws.send(JSON.stringify({ type: "done", code: result.code }));
        }
      } catch (e) {
        ws.send(JSON.stringify({ type: "error", data: "Invalid message format" }));
      }
    });

    ws.on("close", () => {
      console.log(`[Terminal] Connection closed for session ${sessionId}`);
      terminals.delete(sessionId);
    });

    ws.on("error", (err) => {
      console.error(`[Terminal] WebSocket error:`, err);
      terminals.delete(sessionId);
    });
  });
}

export function initializeRuntimeService(server: Server): void {
  const wss = new WebSocketServer({ 
    server,
    path: "/ws/runtime"
  });

  console.log("[Runtime] Secure WebSocket service initialized on /ws/runtime");

  wss.on("connection", (ws, req) => {
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const projectId = url.searchParams.get("projectId");
    const token = url.searchParams.get("token");
    const type = (url.searchParams.get("type") || "node") as "node" | "python" | "shell";
    const entryFile = url.searchParams.get("entry") || "index.js";

    if (!projectId) {
      ws.send(JSON.stringify({ type: "error", message: "Missing projectId" }));
      ws.close();
      return;
    }
    
    // Validate authentication token (checks projectId and returns userId)
    const tokenResult = token ? validateWsToken(token, projectId) : { valid: false };
    if (!tokenResult.valid) {
      ws.send(JSON.stringify({ type: "error", message: "Authentication required / مطلوب تسجيل الدخول" }));
      ws.close();
      return;
    }

    console.log(`[Runtime] Authenticated runtime request for project ${projectId}, user ${tokenResult.userId}`);
    const sessionId = `runtime-${projectId}`;
    const projectDir = ensureProjectDir(projectId);
    const entryPath = path.join(projectDir, entryFile);

    if (runtimes.has(sessionId)) {
      const existing = runtimes.get(sessionId);
      existing?.process.kill();
      runtimes.delete(sessionId);
    }

    console.log(`[Runtime] Starting ${type} runtime for project ${projectId}`);

    let cmd: string;
    let args: string[];

    switch (type) {
      case "python":
        cmd = "python3";
        args = [entryPath];
        break;
      case "node":
      default:
        cmd = "node";
        args = [entryPath];
        break;
    }

    const runtimeProcess = spawn(cmd, args, {
      cwd: projectDir,
      env: {
        ...process.env,
        NODE_ENV: "development",
        PORT: "3000",
      },
    });

    const session: RuntimeSession = {
      id: sessionId,
      projectId,
      process: runtimeProcess,
      type,
    };
    runtimes.set(sessionId, session);

    ws.send(JSON.stringify({ 
      type: "started", 
      sessionId,
      message: `Starting ${type} runtime...`
    }));

    runtimeProcess.stdout?.on("data", (data: Buffer) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "stdout", data: data.toString() }));
      }
    });

    runtimeProcess.stderr?.on("data", (data: Buffer) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "stderr", data: data.toString() }));
      }
    });

    runtimeProcess.on("close", (code) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "exit", code }));
      }
      runtimes.delete(sessionId);
    });

    ws.on("message", (message: Buffer) => {
      try {
        const msg = JSON.parse(message.toString());
        
        if (msg.type === "stop") {
          runtimeProcess.kill();
          ws.send(JSON.stringify({ type: "stopped" }));
        } else if (msg.type === "input" && msg.data) {
          runtimeProcess.stdin?.write(msg.data + "\n");
        }
      } catch (e) {
        console.error("[Runtime] Message parse error:", e);
      }
    });

    ws.on("close", () => {
      console.log(`[Runtime] Connection closed for session ${sessionId}`);
      runtimeProcess.kill();
      runtimes.delete(sessionId);
    });
  });
}

export function writeProjectFile(projectId: string, filePath: string, content: string): void {
  const projectDir = ensureProjectDir(projectId);
  const fullPath = path.join(projectDir, filePath);
  const dir = path.dirname(fullPath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(fullPath, content, "utf-8");
}

export function readProjectFile(projectId: string, filePath: string): string | null {
  const projectDir = ensureProjectDir(projectId);
  const fullPath = path.join(projectDir, filePath);
  
  if (fs.existsSync(fullPath)) {
    return fs.readFileSync(fullPath, "utf-8");
  }
  return null;
}

export function listProjectFiles(projectId: string): string[] {
  const projectDir = ensureProjectDir(projectId);
  
  function walkDir(dir: string, prefix = ""): string[] {
    const files: string[] = [];
    if (!fs.existsSync(dir)) return files;
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        files.push(...walkDir(path.join(dir, entry.name), relativePath));
      } else {
        files.push(relativePath);
      }
    }
    return files;
  }
  
  return walkDir(projectDir);
}

export function executeCommand(projectId: string, command: string): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve) => {
    if (!isCommandSafe(command)) {
      resolve({ 
        stdout: "", 
        stderr: "Command not allowed for security reasons / الأمر غير مسموح به لأسباب أمنية", 
        code: 126 
      });
      return;
    }
    
    const projectDir = ensureProjectDir(projectId);
    
    const child = spawn("bash", ["-c", command], {
      cwd: projectDir,
      env: {
        ...process.env,
        HOME: projectDir,
        PATH: process.env.PATH,
      },
      timeout: 30000,
    });

    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (data) => { stdout += data.toString(); });
    child.stderr?.on("data", (data) => { stderr += data.toString(); });

    child.on("close", (code) => {
      resolve({ stdout, stderr, code: code || 0 });
    });

    child.on("error", (err) => {
      resolve({ stdout, stderr: err.message, code: 1 });
    });

    setTimeout(() => {
      child.kill("SIGKILL");
      resolve({ stdout, stderr: stderr + "\nCommand timed out (30s limit)", code: 124 });
    }, 30000);
  });
}

export function syncFilesToDisk(projectId: string, files: Array<{ path: string; content: string }>): void {
  for (const file of files) {
    writeProjectFile(projectId, file.path, file.content);
  }
}
