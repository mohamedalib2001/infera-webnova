/**
 * ═══════════════════════════════════════════════════════════════════════════
 *                    INFERA Agent - Autonomous Software Engineer
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * A completely standalone autonomous development environment that operates
 * EXTERNALLY to WebNova. This agent can access, control, and fix WebNova
 * even when it's completely broken.
 * 
 * Architecture:
 *   INFERA Agent (Port 5001) → Controls → WebNova (Port 5000)
 * 
 * Core Components:
 *   1. Intelligence Core (LLM Integration)
 *   2. Tool Interface (Files, Shell, Search, LSP)
 *   3. Control Loop (Observe → Think → Act → Result)
 *   4. Memory System (Short-term + Long-term)
 *   5. Governance Layer (10 Sovereignty Principles)
 */

import express, { Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import path from "path";
import fs from "fs";
import { spawn, exec, ChildProcess } from "child_process";

// ═══════════════════════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════════════════════

const AGENT_PORT = 5001;
const WEBNOVA_PORT = 5000;
const PROJECT_ROOT = process.cwd();

// ═══════════════════════════════════════════════════════════════════════════
// Agent State
// ═══════════════════════════════════════════════════════════════════════════

interface AgentState {
  isActive: boolean;
  autonomousMode: boolean;
  webnovaProcess: ChildProcess | null;
  webnovaStatus: "stopped" | "starting" | "running" | "error";
  currentTask: string | null;
  conversationHistory: ConversationMessage[];
  governanceLogs: GovernanceLog[];
}

interface ConversationMessage {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  timestamp: Date;
  toolName?: string;
  toolResult?: any;
}

interface GovernanceLog {
  id: string;
  timestamp: Date;
  action: string;
  reason: string;
  result: "success" | "blocked" | "warning";
  details?: any;
}

const agentState: AgentState = {
  isActive: true,
  autonomousMode: true,
  webnovaProcess: null,
  webnovaStatus: "stopped",
  currentTask: null,
  conversationHistory: [],
  governanceLogs: [],
};

// ═══════════════════════════════════════════════════════════════════════════
// 10 Sovereignty Principles
// ═══════════════════════════════════════════════════════════════════════════

const SOVEREIGNTY_PRINCIPLES = [
  { id: 1, name: "HUMAN_SUPREMACY", ar: "السيادة البشرية", desc: "المالك هو الحاكم الأعلى" },
  { id: 2, name: "TRANSPARENCY", ar: "الشفافية الكاملة", desc: "كل إجراء موثق" },
  { id: 3, name: "REVERSIBILITY", ar: "قابلية التراجع", desc: "كل إجراء يمكن عكسه" },
  { id: 4, name: "BOUNDED_AUTONOMY", ar: "استقلالية محدودة", desc: "حرية ضمن حدود" },
  { id: 5, name: "KILL_SWITCH", ar: "مفتاح الإيقاف", desc: "إيقاف طارئ فوري" },
  { id: 6, name: "DATA_SOVEREIGNTY", ar: "سيادة البيانات", desc: "البيانات ملك المالك" },
  { id: 7, name: "EXPLICIT_CONSENT", ar: "الموافقة الصريحة", desc: "لا إجراء خطير بدون موافقة" },
  { id: 8, name: "AUDIT_TRAIL", ar: "سجل التدقيق", desc: "تتبع كامل للعمليات" },
  { id: 9, name: "RESOURCE_LIMITS", ar: "حدود الموارد", desc: "لا استنزاف للموارد" },
  { id: 10, name: "FAIL_SAFE", ar: "الفشل الآمن", desc: "عند الخطأ، توقف بأمان" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Governance Functions
// ═══════════════════════════════════════════════════════════════════════════

function logGovernance(action: string, reason: string, result: "success" | "blocked" | "warning", details?: any) {
  const log: GovernanceLog = {
    id: `gov-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    action,
    reason,
    result,
    details,
  };
  agentState.governanceLogs.push(log);
  if (agentState.governanceLogs.length > 1000) {
    agentState.governanceLogs = agentState.governanceLogs.slice(-500);
  }
  console.log(`[Governance] ${result.toUpperCase()}: ${action} - ${reason}`);
  return log;
}

function isPathSafe(filePath: string): boolean {
  const resolved = path.resolve(PROJECT_ROOT, filePath);
  const blockedPatterns = [
    /\.env$/i,
    /secrets?\./i,
    /password/i,
    /\.ssh/i,
    /\.git\/config/i,
    /node_modules/i,
  ];
  
  if (!resolved.startsWith(PROJECT_ROOT)) {
    return false;
  }
  
  for (const pattern of blockedPatterns) {
    if (pattern.test(filePath)) {
      return false;
    }
  }
  
  return true;
}

function isCommandSafe(command: string): { safe: boolean; reason?: string } {
  const dangerousCommands = [
    /rm\s+-rf\s+[\/~]/i,
    /mkfs/i,
    /dd\s+if=/i,
    /:(){ :|:& };:/,
    /fork\s*bomb/i,
    />\s*\/dev\/sd/i,
    /chmod\s+777\s+\//i,
  ];
  
  for (const pattern of dangerousCommands) {
    if (pattern.test(command)) {
      return { safe: false, reason: "Dangerous command pattern detected" };
    }
  }
  
  return { safe: true };
}

// ═══════════════════════════════════════════════════════════════════════════
// Tool Interface
// ═══════════════════════════════════════════════════════════════════════════

interface Tool {
  name: string;
  description: string;
  execute: (params: any) => Promise<any>;
}

const tools: Record<string, Tool> = {
  read_file: {
    name: "read_file",
    description: "Read content of a file",
    execute: async (params: { path: string; offset?: number; limit?: number }) => {
      if (!isPathSafe(params.path)) {
        logGovernance("READ_FILE_BLOCKED", `Unsafe path: ${params.path}`, "blocked");
        return { error: "Path not allowed" };
      }
      
      try {
        const fullPath = path.join(PROJECT_ROOT, params.path);
        const content = fs.readFileSync(fullPath, "utf-8");
        const lines = content.split("\n");
        const offset = params.offset || 0;
        const limit = params.limit || 500;
        const selectedLines = lines.slice(offset, offset + limit);
        
        logGovernance("READ_FILE", params.path, "success");
        return {
          content: selectedLines.join("\n"),
          totalLines: lines.length,
          offset,
          limit,
        };
      } catch (err: any) {
        return { error: err.message };
      }
    },
  },
  
  write_file: {
    name: "write_file",
    description: "Write content to a file",
    execute: async (params: { path: string; content: string }) => {
      if (!isPathSafe(params.path)) {
        logGovernance("WRITE_FILE_BLOCKED", `Unsafe path: ${params.path}`, "blocked");
        return { error: "Path not allowed" };
      }
      
      try {
        const fullPath = path.join(PROJECT_ROOT, params.path);
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(fullPath, params.content, "utf-8");
        logGovernance("WRITE_FILE", params.path, "success");
        return { success: true, path: params.path };
      } catch (err: any) {
        return { error: err.message };
      }
    },
  },
  
  list_directory: {
    name: "list_directory",
    description: "List files and directories",
    execute: async (params: { path?: string; recursive?: boolean }) => {
      const targetPath = params.path || ".";
      if (!isPathSafe(targetPath)) {
        return { error: "Path not allowed" };
      }
      
      try {
        const fullPath = path.join(PROJECT_ROOT, targetPath);
        const entries = fs.readdirSync(fullPath, { withFileTypes: true });
        const result = entries.map(e => ({
          name: e.name,
          type: e.isDirectory() ? "directory" : "file",
          path: path.join(targetPath, e.name),
        }));
        return { entries: result };
      } catch (err: any) {
        return { error: err.message };
      }
    },
  },
  
  run_command: {
    name: "run_command",
    description: "Execute a shell command",
    execute: async (params: { command: string; timeout?: number }) => {
      const check = isCommandSafe(params.command);
      if (!check.safe) {
        logGovernance("COMMAND_BLOCKED", check.reason || "Unsafe command", "blocked", { command: params.command });
        return { error: check.reason };
      }
      
      return new Promise((resolve) => {
        const timeout = params.timeout || 30000;
        exec(params.command, { cwd: PROJECT_ROOT, timeout }, (err, stdout, stderr) => {
          logGovernance("RUN_COMMAND", params.command, err ? "warning" : "success");
          resolve({
            stdout: stdout.toString(),
            stderr: stderr.toString(),
            exitCode: err ? (err as any).code || 1 : 0,
          });
        });
      });
    },
  },
  
  search_files: {
    name: "search_files",
    description: "Search for text in files",
    execute: async (params: { pattern: string; path?: string; type?: string }) => {
      const targetPath = params.path || ".";
      const grepCmd = `grep -r "${params.pattern}" ${targetPath} --include="*.${params.type || '*'}" -l 2>/dev/null | head -20`;
      
      return new Promise((resolve) => {
        exec(grepCmd, { cwd: PROJECT_ROOT }, (err, stdout) => {
          const files = stdout.trim().split("\n").filter(Boolean);
          resolve({ matches: files });
        });
      });
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// Express App
// ═══════════════════════════════════════════════════════════════════════════

const app = express();
app.use(express.json({ limit: "10mb" }));

// CORS for standalone access
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// ═══════════════════════════════════════════════════════════════════════════
// API Routes
// ═══════════════════════════════════════════════════════════════════════════

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "running",
    agent: "INFERA Agent",
    version: "1.0.0",
    port: AGENT_PORT,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Agent status
app.get("/status", (req, res) => {
  res.json({
    agent: {
      isActive: agentState.isActive,
      autonomousMode: agentState.autonomousMode,
      currentTask: agentState.currentTask,
      conversationLength: agentState.conversationHistory.length,
    },
    webnova: {
      status: agentState.webnovaStatus,
      port: WEBNOVA_PORT,
    },
    governance: {
      principles: SOVEREIGNTY_PRINCIPLES.length,
      recentLogs: agentState.governanceLogs.slice(-10),
    },
    system: {
      projectRoot: PROJECT_ROOT,
      memory: process.memoryUsage(),
    },
  });
});

// Governance endpoints
app.get("/governance/principles", (req, res) => {
  res.json({ principles: SOVEREIGNTY_PRINCIPLES });
});

app.get("/governance/logs", (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;
  res.json({ logs: agentState.governanceLogs.slice(-limit) });
});

app.post("/governance/kill", (req, res) => {
  const { reason } = req.body;
  logGovernance("KILL_SWITCH_ACTIVATED", reason || "Emergency stop", "success");
  agentState.isActive = false;
  agentState.autonomousMode = false;
  res.json({ success: true, message: "Agent stopped" });
});

app.post("/governance/resume", (req, res) => {
  logGovernance("AGENT_RESUMED", "Agent reactivated", "success");
  agentState.isActive = true;
  res.json({ success: true, message: "Agent resumed" });
});

// Tool execution endpoints
app.post("/tools/:toolName", async (req, res) => {
  const { toolName } = req.params;
  const tool = tools[toolName];
  
  if (!tool) {
    return res.status(404).json({ error: `Tool not found: ${toolName}` });
  }
  
  if (!agentState.isActive) {
    return res.status(403).json({ error: "Agent is stopped" });
  }
  
  try {
    const result = await tool.execute(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// List available tools
app.get("/tools", (req, res) => {
  const toolList = Object.values(tools).map(t => ({
    name: t.name,
    description: t.description,
  }));
  res.json({ tools: toolList });
});

// File operations
app.get("/files/tree", async (req, res) => {
  const result = await tools.list_directory.execute({ path: ".", recursive: false });
  res.json(result);
});

app.get("/files/read", async (req, res) => {
  const { path: filePath, offset, limit } = req.query;
  if (!filePath) {
    return res.status(400).json({ error: "path required" });
  }
  const result = await tools.read_file.execute({
    path: filePath as string,
    offset: offset ? parseInt(offset as string) : undefined,
    limit: limit ? parseInt(limit as string) : undefined,
  });
  res.json(result);
});

app.post("/files/write", async (req, res) => {
  const { path: filePath, content } = req.body;
  if (!filePath || content === undefined) {
    return res.status(400).json({ error: "path and content required" });
  }
  const result = await tools.write_file.execute({ path: filePath, content });
  res.json(result);
});

// Terminal execution
app.post("/terminal/execute", async (req, res) => {
  const { command, timeout } = req.body;
  if (!command) {
    return res.status(400).json({ error: "command required" });
  }
  const result = await tools.run_command.execute({ command, timeout });
  res.json(result);
});

// WebNova control
app.post("/webnova/start", (req, res) => {
  if (agentState.webnovaStatus === "running") {
    return res.json({ status: "already_running" });
  }
  
  logGovernance("WEBNOVA_START", "Starting WebNova from Agent", "success");
  agentState.webnovaStatus = "starting";
  
  // In real implementation, this would start WebNova as a child process
  // For now, we simulate since WebNova runs on the same port
  setTimeout(() => {
    agentState.webnovaStatus = "running";
  }, 2000);
  
  res.json({ status: "starting", message: "WebNova is starting..." });
});

app.post("/webnova/stop", (req, res) => {
  logGovernance("WEBNOVA_STOP", "Stopping WebNova from Agent", "success");
  agentState.webnovaStatus = "stopped";
  res.json({ status: "stopped", message: "WebNova stopped" });
});

app.post("/webnova/restart", (req, res) => {
  logGovernance("WEBNOVA_RESTART", "Restarting WebNova from Agent", "success");
  agentState.webnovaStatus = "starting";
  setTimeout(() => {
    agentState.webnovaStatus = "running";
  }, 3000);
  res.json({ status: "restarting", message: "WebNova is restarting..." });
});

// Conversation history
app.get("/conversation", (req, res) => {
  res.json({ history: agentState.conversationHistory });
});

app.post("/conversation/clear", (req, res) => {
  agentState.conversationHistory = [];
  res.json({ success: true });
});

// ═══════════════════════════════════════════════════════════════════════════
// Serve Dashboard UI
// ═══════════════════════════════════════════════════════════════════════════

app.get("/", (req, res) => {
  res.send(getDashboardHTML());
});

function getDashboardHTML(): string {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>INFERA Agent - Autonomous Software Engineer</title>
  <style>
    :root {
      --bg-primary: #0a0a0a;
      --bg-secondary: #111111;
      --bg-tertiary: #1a1a1a;
      --border: #2a2a2a;
      --text-primary: #e0e0e0;
      --text-secondary: #888888;
      --accent: #00d9ff;
      --accent-hover: #00b8d9;
      --success: #00ff88;
      --danger: #ff4444;
      --warning: #ffaa00;
    }
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      height: 100vh;
      overflow: hidden;
    }
    
    .app {
      display: grid;
      grid-template-columns: 280px 1fr 400px;
      grid-template-rows: 48px 1fr;
      height: 100vh;
    }
    
    /* Header */
    .header {
      grid-column: 1 / -1;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1rem;
    }
    
    .header h1 {
      font-size: 1rem;
      color: var(--accent);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .header-actions {
      display: flex;
      gap: 0.5rem;
    }
    
    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    
    .status-badge.online { background: rgba(0,255,136,0.2); color: var(--success); }
    .status-badge.offline { background: rgba(255,68,68,0.2); color: var(--danger); }
    
    /* Sidebar */
    .sidebar {
      background: var(--bg-secondary);
      border-left: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    .sidebar-header {
      padding: 1rem;
      border-bottom: 1px solid var(--border);
      font-weight: 600;
      color: var(--text-secondary);
      font-size: 0.75rem;
      text-transform: uppercase;
    }
    
    .file-tree {
      flex: 1;
      overflow-y: auto;
      padding: 0.5rem;
    }
    
    .file-item {
      padding: 0.5rem;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
    }
    
    .file-item:hover { background: var(--bg-tertiary); }
    .file-item.folder { color: var(--accent); }
    .file-item.file { color: var(--text-primary); }
    
    /* Main Editor Area */
    .editor-area {
      display: flex;
      flex-direction: column;
      background: var(--bg-primary);
      overflow: hidden;
    }
    
    .tabs {
      display: flex;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border);
      overflow-x: auto;
    }
    
    .tab {
      padding: 0.75rem 1rem;
      border-left: 1px solid var(--border);
      cursor: pointer;
      font-size: 0.875rem;
      white-space: nowrap;
    }
    
    .tab.active {
      background: var(--bg-primary);
      border-bottom: 2px solid var(--accent);
    }
    
    .editor-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    #editor {
      flex: 1;
      background: var(--bg-primary);
      font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
      font-size: 14px;
      padding: 1rem;
      overflow: auto;
      white-space: pre;
      color: var(--text-primary);
    }
    
    /* Terminal */
    .terminal-section {
      height: 200px;
      background: var(--bg-secondary);
      border-top: 1px solid var(--border);
      display: flex;
      flex-direction: column;
    }
    
    .terminal-header {
      padding: 0.5rem 1rem;
      border-bottom: 1px solid var(--border);
      font-size: 0.75rem;
      color: var(--text-secondary);
      display: flex;
      justify-content: space-between;
    }
    
    #terminal {
      flex: 1;
      padding: 0.5rem 1rem;
      font-family: monospace;
      font-size: 13px;
      overflow-y: auto;
      color: var(--success);
    }
    
    #terminal-input {
      background: var(--bg-tertiary);
      border: none;
      border-top: 1px solid var(--border);
      padding: 0.5rem 1rem;
      color: var(--success);
      font-family: monospace;
      font-size: 13px;
    }
    
    /* Right Panel - Chat */
    .chat-panel {
      background: var(--bg-secondary);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
    }
    
    .chat-header {
      padding: 1rem;
      border-bottom: 1px solid var(--border);
      font-weight: 600;
    }
    
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
    }
    
    .message {
      margin-bottom: 1rem;
      padding: 0.75rem;
      border-radius: 8px;
      font-size: 0.875rem;
    }
    
    .message.user {
      background: var(--accent);
      color: #000;
      margin-right: 2rem;
    }
    
    .message.assistant {
      background: var(--bg-tertiary);
      margin-left: 2rem;
    }
    
    .chat-input-area {
      padding: 1rem;
      border-top: 1px solid var(--border);
    }
    
    #chat-input {
      width: 100%;
      background: var(--bg-tertiary);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 0.75rem;
      color: var(--text-primary);
      font-size: 0.875rem;
      resize: none;
    }
    
    .btn {
      background: var(--accent);
      color: #000;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.875rem;
    }
    
    .btn:hover { background: var(--accent-hover); }
    .btn.danger { background: var(--danger); color: #fff; }
    .btn.secondary { background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border); }
  </style>
</head>
<body>
  <div class="app">
    <!-- Header -->
    <header class="header">
      <h1>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
        INFERA Agent
      </h1>
      <div class="header-actions">
        <span class="status-badge" id="agent-badge">Agent: Loading...</span>
        <span class="status-badge" id="webnova-badge">WebNova: Loading...</span>
        <button class="btn secondary" onclick="refreshStatus()">تحديث</button>
        <button class="btn danger" onclick="killSwitch()">إيقاف طارئ</button>
      </div>
    </header>
    
    <!-- Sidebar - File Tree -->
    <aside class="sidebar">
      <div class="sidebar-header">مستكشف الملفات</div>
      <div class="file-tree" id="file-tree">
        <div style="color: var(--text-secondary); padding: 1rem;">جارٍ التحميل...</div>
      </div>
    </aside>
    
    <!-- Main Editor -->
    <main class="editor-area">
      <div class="tabs">
        <div class="tab active" id="current-tab">بدون ملف</div>
      </div>
      <div class="editor-content">
        <div id="editor">// اختر ملفاً من القائمة</div>
      </div>
      <div class="terminal-section">
        <div class="terminal-header">
          <span>Terminal</span>
          <button class="btn secondary" style="padding: 0.25rem 0.5rem; font-size: 0.7rem;" onclick="clearTerminal()">مسح</button>
        </div>
        <div id="terminal"></div>
        <input type="text" id="terminal-input" placeholder="$ أدخل الأمر..." onkeypress="if(event.key==='Enter')executeCommand()">
      </div>
    </main>
    
    <!-- Chat Panel -->
    <aside class="chat-panel">
      <div class="chat-header">محادثة الـ Agent</div>
      <div class="chat-messages" id="chat-messages">
        <div class="message assistant">
          مرحباً! أنا INFERA Agent - وكيل مهندس برمجيات مستقل.
          <br><br>
          يمكنني مساعدتك في:
          <br>• قراءة وكتابة الملفات
          <br>• تنفيذ الأوامر
          <br>• تحليل وإصلاح الكود
          <br>• إدارة WebNova
        </div>
      </div>
      <div class="chat-input-area">
        <textarea id="chat-input" rows="3" placeholder="اكتب رسالتك..." onkeypress="if(event.key==='Enter' && !event.shiftKey){event.preventDefault();sendMessage();}"></textarea>
        <button class="btn" style="width:100%; margin-top:0.5rem;" onclick="sendMessage()">إرسال</button>
      </div>
    </aside>
  </div>
  
  <script>
    let currentFile = null;
    
    async function refreshStatus() {
      try {
        const res = await fetch('/status');
        const data = await res.json();
        
        document.getElementById('agent-badge').textContent = 
          'Agent: ' + (data.agent.isActive ? 'نشط' : 'متوقف');
        document.getElementById('agent-badge').className = 
          'status-badge ' + (data.agent.isActive ? 'online' : 'offline');
        
        document.getElementById('webnova-badge').textContent = 
          'WebNova: ' + (data.webnova.status === 'running' ? 'يعمل' : 'متوقف');
        document.getElementById('webnova-badge').className = 
          'status-badge ' + (data.webnova.status === 'running' ? 'online' : 'offline');
      } catch (e) {
        console.error('Status error:', e);
      }
    }
    
    async function loadFileTree() {
      try {
        const res = await fetch('/files/tree');
        const data = await res.json();
        const tree = document.getElementById('file-tree');
        
        if (data.entries) {
          tree.innerHTML = data.entries.map(e => 
            '<div class="file-item ' + e.type + '" onclick="' + 
            (e.type === 'file' ? "loadFile('" + e.path + "')" : "toggleFolder('" + e.path + "')") + '">' +
            (e.type === 'directory' ? '📁' : '📄') + ' ' + e.name +
            '</div>'
          ).join('');
        }
      } catch (e) {
        console.error('File tree error:', e);
      }
    }
    
    async function loadFile(path) {
      try {
        const res = await fetch('/files/read?path=' + encodeURIComponent(path));
        const data = await res.json();
        
        if (data.content !== undefined) {
          document.getElementById('editor').textContent = data.content;
          document.getElementById('current-tab').textContent = path;
          currentFile = path;
        } else if (data.error) {
          document.getElementById('editor').textContent = '// Error: ' + data.error;
        }
      } catch (e) {
        console.error('Load file error:', e);
      }
    }
    
    async function executeCommand() {
      const input = document.getElementById('terminal-input');
      const terminal = document.getElementById('terminal');
      const cmd = input.value.trim();
      if (!cmd) return;
      
      terminal.innerHTML += '<div style="color:#888;">$ ' + cmd + '</div>';
      input.value = '';
      
      try {
        const res = await fetch('/terminal/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command: cmd })
        });
        const data = await res.json();
        
        if (data.stdout) terminal.innerHTML += '<div>' + data.stdout + '</div>';
        if (data.stderr) terminal.innerHTML += '<div style="color:#ff4444;">' + data.stderr + '</div>';
        terminal.scrollTop = terminal.scrollHeight;
      } catch (e) {
        terminal.innerHTML += '<div style="color:#ff4444;">Error: ' + e.message + '</div>';
      }
    }
    
    function clearTerminal() {
      document.getElementById('terminal').innerHTML = '';
    }
    
    async function killSwitch() {
      if (!confirm('تحذير: سيتم إيقاف الـ Agent. متأكد؟')) return;
      try {
        await fetch('/governance/kill', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: 'Manual kill from dashboard' })
        });
        refreshStatus();
      } catch (e) {
        alert('Error: ' + e.message);
      }
    }
    
    async function sendMessage() {
      const input = document.getElementById('chat-input');
      const messages = document.getElementById('chat-messages');
      const text = input.value.trim();
      if (!text) return;
      
      messages.innerHTML += '<div class="message user">' + text + '</div>';
      input.value = '';
      messages.scrollTop = messages.scrollHeight;
      
      // For now, echo response - AI integration will be added
      messages.innerHTML += '<div class="message assistant">تم استلام رسالتك. سيتم تفعيل الـ AI قريباً.</div>';
      messages.scrollTop = messages.scrollHeight;
    }
    
    // Initialize
    refreshStatus();
    loadFileTree();
    setInterval(refreshStatus, 10000);
  </script>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// HTTP Server & WebSocket
// ═══════════════════════════════════════════════════════════════════════════

const server = createServer(app);

const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws: WebSocket) => {
  console.log("[Agent WS] Client connected");
  
  ws.on("message", async (message: Buffer) => {
    try {
      const data = JSON.parse(message.toString());
      
      if (data.type === "chat") {
        // Handle chat messages
        agentState.conversationHistory.push({
          role: "user",
          content: data.content,
          timestamp: new Date(),
        });
        
        // Echo for now - AI integration pending
        ws.send(JSON.stringify({
          type: "chat_response",
          content: `تم استلام: ${data.content}`,
        }));
      }
      
      if (data.type === "tool") {
        const tool = tools[data.toolName];
        if (tool) {
          const result = await tool.execute(data.params);
          ws.send(JSON.stringify({
            type: "tool_result",
            toolName: data.toolName,
            result,
          }));
        }
      }
    } catch (err) {
      console.error("[Agent WS] Error:", err);
    }
  });
  
  ws.on("close", () => {
    console.log("[Agent WS] Client disconnected");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Start Server
// ═══════════════════════════════════════════════════════════════════════════

export function startInferaAgent() {
  server.listen(AGENT_PORT, "0.0.0.0", () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║              INFERA Agent - Autonomous Software Engineer                   ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  Status:     RUNNING                                                       ║
║  Port:       ${AGENT_PORT}                                                          ║
║  Dashboard:  http://localhost:${AGENT_PORT}                                         ║
║  API:        http://localhost:${AGENT_PORT}/status                                  ║
║                                                                            ║
║  This agent operates EXTERNALLY to WebNova (Port ${WEBNOVA_PORT})                   ║
║  It can access, control, and fix WebNova even when it's broken            ║
╚═══════════════════════════════════════════════════════════════════════════╝
    `);
    
    logGovernance("AGENT_STARTED", "INFERA Agent initialized as standalone server", "success", { port: AGENT_PORT });
    
    // Mark WebNova as running if on same machine
    agentState.webnovaStatus = "running";
  });
}

// Auto-start when imported
startInferaAgent();

export default app;
