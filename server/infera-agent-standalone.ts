/**
 * ═══════════════════════════════════════════════════════════════════════════
 * INFERA Agent - Standalone Development Environment Server
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Architecture: INFERA Agent = Replit Agent (External to the product)
 * 
 * This server runs INDEPENDENTLY from WebNova and can:
 * - Access all WebNova files
 * - Fix any issues even if WebNova is broken
 * - Deploy, restart, and maintain WebNova
 * 
 * Port: 5001 (separate from WebNova on 5000)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import Anthropic from "@anthropic-ai/sdk";
import {
  SOVEREIGNTY_PRINCIPLES,
  isPathSafe,
  evaluateExecution,
  logGovernanceAction,
  getGovernanceLogs,
  governanceState,
  killAgent,
  reactivateAgent,
  disableAutonomousMode,
} from "./infra-agent-governance";

const execAsync = promisify(exec);

// ═══════════════════════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════════════════════

const AGENT_PORT = 5001;
const WEBNOVA_PORT = 5000;
const WEBNOVA_URL = `http://localhost:${WEBNOVA_PORT}`;
const PROJECT_ROOT = process.cwd();

// ═══════════════════════════════════════════════════════════════════════════
// Initialize Anthropic Client
// ═══════════════════════════════════════════════════════════════════════════

const anthropic = new Anthropic();

// ═══════════════════════════════════════════════════════════════════════════
// Express App Setup
// ═══════════════════════════════════════════════════════════════════════════

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// ═══════════════════════════════════════════════════════════════════════════
// Health & Status Endpoints
// ═══════════════════════════════════════════════════════════════════════════

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "healthy",
    service: "INFERA Agent (Standalone)",
    version: "1.0.0",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/status", async (_req: Request, res: Response) => {
  let webnovaStatus = "unknown";
  
  try {
    const response = await fetch(`${WEBNOVA_URL}/api/health`);
    webnovaStatus = response.ok ? "running" : "error";
  } catch {
    webnovaStatus = "offline";
  }
  
  res.json({
    agent: {
      status: "running",
      port: AGENT_PORT,
      governance: governanceState,
    },
    webnova: {
      status: webnovaStatus,
      url: WEBNOVA_URL,
      port: WEBNOVA_PORT,
    },
    project: {
      root: PROJECT_ROOT,
      exists: fs.existsSync(PROJECT_ROOT),
    },
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Governance Endpoints (Kill Switch, Logs, Controls)
// ═══════════════════════════════════════════════════════════════════════════

app.get("/governance/status", (_req: Request, res: Response) => {
  res.json({
    principles: SOVEREIGNTY_PRINCIPLES,
    state: governanceState,
    logsCount: getGovernanceLogs().length,
  });
});

app.get("/governance/logs", (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 100;
  const logs = getGovernanceLogs().slice(-limit);
  res.json({ logs, total: getGovernanceLogs().length });
});

app.post("/governance/kill", (req: Request, res: Response) => {
  const { ownerId, reason } = req.body;
  
  if (!ownerId || !reason) {
    return res.status(400).json({ error: "ownerId and reason required" });
  }
  
  const result = killAgent(ownerId, reason);
  res.json(result);
});

app.post("/governance/reactivate", (req: Request, res: Response) => {
  const { ownerId } = req.body;
  
  if (!ownerId) {
    return res.status(400).json({ error: "ownerId required" });
  }
  
  const result = reactivateAgent(ownerId);
  res.json(result);
});

app.post("/governance/disable-autonomous", (req: Request, res: Response) => {
  const { ownerId } = req.body;
  
  if (!ownerId) {
    return res.status(400).json({ error: "ownerId required" });
  }
  
  const result = disableAutonomousMode(ownerId);
  res.json(result);
});

// ═══════════════════════════════════════════════════════════════════════════
// File System Operations (Full Access to WebNova)
// ═══════════════════════════════════════════════════════════════════════════

app.get("/files/tree", async (_req: Request, res: Response) => {
  try {
    const buildTree = (dir: string, depth = 0, maxDepth = 4): any[] => {
      if (depth > maxDepth) return [];
      
      const items: any[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
        
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(PROJECT_ROOT, fullPath);
        
        if (entry.isDirectory()) {
          items.push({
            name: entry.name,
            path: relativePath,
            type: "directory",
            children: buildTree(fullPath, depth + 1, maxDepth),
          });
        } else {
          items.push({
            name: entry.name,
            path: relativePath,
            type: "file",
            extension: path.extname(entry.name).slice(1),
          });
        }
      }
      
      return items.sort((a, b) => {
        if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
    };
    
    res.json({ tree: buildTree(PROJECT_ROOT) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/files/read", (req: Request, res: Response) => {
  try {
    const filePath = req.query.path as string;
    if (!filePath) {
      return res.status(400).json({ error: "path required" });
    }
    
    const pathCheck = isPathSafe(filePath);
    if (!pathCheck.safe) {
      return res.status(403).json({ error: pathCheck.reason });
    }
    
    const fullPath = path.resolve(PROJECT_ROOT, filePath);
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: "File not found" });
    }
    
    const content = fs.readFileSync(fullPath, "utf-8");
    const stats = fs.statSync(fullPath);
    
    res.json({
      path: filePath,
      content,
      size: stats.size,
      modified: stats.mtime,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/files/write", (req: Request, res: Response) => {
  try {
    const { path: filePath, content } = req.body;
    
    if (!filePath || content === undefined) {
      return res.status(400).json({ error: "path and content required" });
    }
    
    const pathCheck = isPathSafe(filePath);
    if (!pathCheck.safe) {
      return res.status(403).json({ error: pathCheck.reason });
    }
    
    const fullPath = path.resolve(PROJECT_ROOT, filePath);
    const dir = path.dirname(fullPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(fullPath, content, "utf-8");
    
    logGovernanceAction({
      action: "FILE_WRITTEN",
      reason: `Agent wrote file: ${filePath}`,
      result: "success",
      details: { path: filePath, size: content.length },
    });
    
    res.json({ success: true, path: filePath, size: content.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/files/delete", (req: Request, res: Response) => {
  try {
    const filePath = req.query.path as string;
    
    if (!filePath) {
      return res.status(400).json({ error: "path required" });
    }
    
    const pathCheck = isPathSafe(filePath);
    if (!pathCheck.safe) {
      return res.status(403).json({ error: pathCheck.reason });
    }
    
    const fullPath = path.resolve(PROJECT_ROOT, filePath);
    
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      
      logGovernanceAction({
        action: "FILE_DELETED",
        reason: `Agent deleted file: ${filePath}`,
        result: "success",
        details: { path: filePath },
      });
    }
    
    res.json({ success: true, path: filePath });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// Terminal / Command Execution
// ═══════════════════════════════════════════════════════════════════════════

app.post("/terminal/execute", async (req: Request, res: Response) => {
  try {
    const { command } = req.body;
    
    if (!command) {
      return res.status(400).json({ error: "command required" });
    }
    
    // Governance check
    const execCheck = evaluateExecution({
      operation: "execute_command",
      command,
      userId: "agent",
      reason: "Standalone agent command execution",
    });
    
    if (!execCheck.approved) {
      logGovernanceAction({
        action: "COMMAND_BLOCKED",
        reason: execCheck.reason,
        result: "blocked",
        details: { command, dangerLevel: execCheck.dangerLevel },
      });
      
      return res.status(403).json({
        error: execCheck.reason,
        requiresConfirmation: execCheck.requiresConfirmation,
        dangerLevel: execCheck.dangerLevel,
      });
    }
    
    const { stdout, stderr } = await execAsync(command, {
      cwd: PROJECT_ROOT,
      timeout: 60000,
      maxBuffer: 5 * 1024 * 1024,
    });
    
    logGovernanceAction({
      action: "COMMAND_EXECUTED",
      reason: "Command executed successfully",
      result: "success",
      details: { command },
    });
    
    res.json({ success: true, stdout, stderr });
  } catch (error: any) {
    res.json({
      success: false,
      stdout: error.stdout || "",
      stderr: error.stderr || error.message,
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// WebNova Management (Start, Stop, Restart, Status)
// ═══════════════════════════════════════════════════════════════════════════

app.post("/webnova/restart", async (_req: Request, res: Response) => {
  try {
    logGovernanceAction({
      action: "WEBNOVA_RESTART",
      reason: "Agent initiated WebNova restart",
      result: "pending",
    });
    
    // Kill existing process and restart
    await execAsync("pkill -f 'npm run dev' || true", { cwd: PROJECT_ROOT });
    
    // Start in background using nohup
    exec("nohup npm run dev > /tmp/webnova.log 2>&1 &", { cwd: PROJECT_ROOT });
    
    res.json({ success: true, message: "WebNova restart initiated" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/webnova/logs", async (_req: Request, res: Response) => {
  try {
    // Read recent logs from process output
    const { stdout } = await execAsync("tail -100 /tmp/webnova.log 2>/dev/null || echo 'No logs available'", {
      cwd: PROJECT_ROOT,
    });
    
    res.json({ logs: stdout });
  } catch (error: any) {
    res.json({ logs: "No logs available" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// AI Chat Interface
// ═══════════════════════════════════════════════════════════════════════════

app.post("/chat", async (req: Request, res: Response) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "message required" });
    }
    
    // Check if agent is active
    if (!governanceState.isActive) {
      return res.status(503).json({ error: "Agent is deactivated by kill switch" });
    }
    
    const systemPrompt = `أنت INFERA Agent - بيئة تطوير ذكية مستقلة.
    
أنت تعمل كخدمة خارجية منفصلة عن INFERA WebNova (المنتج الذي تبنيه وتصونه).

قدراتك:
- قراءة وكتابة وحذف الملفات
- تنفيذ الأوامر في Terminal
- إعادة تشغيل WebNova
- تحليل وإصلاح الأخطاء

قواعد الحوكمة السيادية:
${SOVEREIGNTY_PRINCIPLES.map((p, i) => `${i + 1}. ${p}`).join("\n")}

السياق الحالي:
${context || "لا يوجد سياق إضافي"}

أجب بوضوح واختصار. إذا طُلب منك تنفيذ عملية، اذكر الخطوات ثم نفذها.`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: message }],
    });
    
    const reply = response.content[0].type === "text" ? response.content[0].text : "";
    
    res.json({ reply, usage: response.usage });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// Git Operations
// ═══════════════════════════════════════════════════════════════════════════

app.get("/git/status", async (_req: Request, res: Response) => {
  try {
    const { stdout: branch } = await execAsync("git rev-parse --abbrev-ref HEAD", { cwd: PROJECT_ROOT });
    const { stdout: status } = await execAsync("git status --porcelain", { cwd: PROJECT_ROOT });
    
    const changes = status.trim().split("\n").filter(Boolean).map(line => ({
      status: line.substring(0, 2).trim(),
      file: line.substring(3),
    }));
    
    res.json({ branch: branch.trim(), changes });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/git/log", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const { stdout } = await execAsync(
      `git log --oneline -${limit} --format="%H|%s|%ar|%an"`,
      { cwd: PROJECT_ROOT }
    );
    
    const commits = stdout.trim().split("\n").filter(Boolean).map(line => {
      const [hash, message, date, author] = line.split("|");
      return { hash: hash.substring(0, 7), message, date, author };
    });
    
    res.json({ commits });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// Static Dashboard (Minimal UI)
// ═══════════════════════════════════════════════════════════════════════════

app.get("/", (_req: Request, res: Response) => {
  res.send(`
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>INFERA Agent - Standalone</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0a0a;
      color: #e0e0e0;
      min-height: 100vh;
      padding: 2rem;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { color: #00d9ff; margin-bottom: 1rem; }
    .status-card {
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1rem;
    }
    .status-card h2 { color: #888; font-size: 0.875rem; margin-bottom: 0.5rem; }
    .status-card .value { font-size: 1.5rem; font-weight: bold; }
    .status-card .value.online { color: #00ff88; }
    .status-card .value.offline { color: #ff4444; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; }
    .btn {
      background: #00d9ff;
      color: #000;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: bold;
      margin-right: 0.5rem;
      margin-top: 0.5rem;
    }
    .btn:hover { background: #00b8d9; }
    .btn.danger { background: #ff4444; color: #fff; }
    .btn.danger:hover { background: #cc3333; }
    .logs {
      background: #111;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 1rem;
      max-height: 400px;
      overflow-y: auto;
      font-family: monospace;
      font-size: 0.875rem;
      margin-top: 1rem;
    }
    .log-entry { padding: 0.25rem 0; border-bottom: 1px solid #222; }
    .log-entry.blocked { color: #ff4444; }
    .log-entry.success { color: #00ff88; }
    #terminal {
      background: #111;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 1rem;
      margin-top: 1rem;
    }
    #terminal input {
      width: 100%;
      background: #000;
      border: 1px solid #333;
      color: #00ff88;
      padding: 0.5rem;
      font-family: monospace;
      border-radius: 4px;
    }
    #terminal-output {
      font-family: monospace;
      font-size: 0.875rem;
      white-space: pre-wrap;
      max-height: 300px;
      overflow-y: auto;
      margin-top: 0.5rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>INFERA Agent</h1>
    <p style="color: #888; margin-bottom: 2rem;">بيئة التطوير المستقلة - خارج WebNova</p>
    
    <div class="grid">
      <div class="status-card">
        <h2>حالة الـ Agent</h2>
        <div class="value online" id="agent-status">نشط</div>
      </div>
      <div class="status-card">
        <h2>حالة WebNova</h2>
        <div class="value" id="webnova-status">جارٍ الفحص...</div>
      </div>
      <div class="status-card">
        <h2>مسار المشروع</h2>
        <div class="value" style="font-size: 1rem; word-break: break-all;">${PROJECT_ROOT}</div>
      </div>
    </div>
    
    <div class="status-card">
      <h2>أوامر التحكم</h2>
      <button class="btn" onclick="restartWebNova()">إعادة تشغيل WebNova</button>
      <button class="btn" onclick="refreshStatus()">تحديث الحالة</button>
      <button class="btn danger" onclick="killSwitch()">إيقاف الطوارئ</button>
    </div>
    
    <div id="terminal">
      <h2 style="margin-bottom: 0.5rem;">Terminal</h2>
      <input type="text" id="cmd-input" placeholder="أدخل الأمر..." onkeypress="if(event.key==='Enter')executeCmd()">
      <div id="terminal-output"></div>
    </div>
    
    <div class="status-card">
      <h2>سجلات الحوكمة</h2>
      <button class="btn" onclick="loadLogs()">تحميل السجلات</button>
      <div class="logs" id="governance-logs"></div>
    </div>
  </div>
  
  <script>
    async function refreshStatus() {
      try {
        const res = await fetch('/status');
        const data = await res.json();
        
        document.getElementById('agent-status').textContent = 
          data.agent.governance.isActive ? 'نشط' : 'متوقف';
        document.getElementById('agent-status').className = 
          'value ' + (data.agent.governance.isActive ? 'online' : 'offline');
        
        document.getElementById('webnova-status').textContent = 
          data.webnova.status === 'running' ? 'يعمل' : 
          data.webnova.status === 'offline' ? 'متوقف' : 'خطأ';
        document.getElementById('webnova-status').className = 
          'value ' + (data.webnova.status === 'running' ? 'online' : 'offline');
      } catch (e) {
        console.error(e);
      }
    }
    
    async function restartWebNova() {
      if (!confirm('هل تريد إعادة تشغيل WebNova؟')) return;
      try {
        const res = await fetch('/webnova/restart', { method: 'POST' });
        const data = await res.json();
        alert(data.message || data.error);
        setTimeout(refreshStatus, 3000);
      } catch (e) {
        alert('فشل الاتصال');
      }
    }
    
    async function killSwitch() {
      if (!confirm('تحذير: سيتم إيقاف الـ Agent بالكامل. متأكد؟')) return;
      try {
        const res = await fetch('/governance/kill', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ownerId: 'owner', reason: 'Emergency kill from dashboard' })
        });
        const data = await res.json();
        alert(data.message || data.error);
        refreshStatus();
      } catch (e) {
        alert('فشل الاتصال');
      }
    }
    
    async function executeCmd() {
      const input = document.getElementById('cmd-input');
      const output = document.getElementById('terminal-output');
      const cmd = input.value.trim();
      if (!cmd) return;
      
      output.textContent += '\\n$ ' + cmd + '\\n';
      input.value = '';
      
      try {
        const res = await fetch('/terminal/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command: cmd })
        });
        const data = await res.json();
        output.textContent += (data.stdout || '') + (data.stderr || '') + '\\n';
        output.scrollTop = output.scrollHeight;
      } catch (e) {
        output.textContent += 'Error: ' + e.message + '\\n';
      }
    }
    
    async function loadLogs() {
      try {
        const res = await fetch('/governance/logs?limit=50');
        const data = await res.json();
        const logsDiv = document.getElementById('governance-logs');
        logsDiv.innerHTML = data.logs.map(log => 
          '<div class="log-entry ' + log.result + '">' +
          new Date(log.timestamp).toLocaleString('ar-SA') + ' | ' +
          log.action + ': ' + log.reason +
          '</div>'
        ).join('');
      } catch (e) {
        console.error(e);
      }
    }
    
    refreshStatus();
    setInterval(refreshStatus, 10000);
  </script>
</body>
</html>
  `);
});

// ═══════════════════════════════════════════════════════════════════════════
// Start Server
// ═══════════════════════════════════════════════════════════════════════════

export function startStandaloneAgent() {
  app.listen(AGENT_PORT, "0.0.0.0", () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                    INFERA Agent - Standalone Server                        ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  Status:  RUNNING                                                          ║
║  Port:    ${AGENT_PORT}                                                           ║
║  URL:     http://localhost:${AGENT_PORT}                                          ║
║                                                                            ║
║  This agent operates EXTERNALLY to WebNova                                 ║
║  It can access, fix, and restart WebNova even if it's broken              ║
╚═══════════════════════════════════════════════════════════════════════════╝
    `);
    
    logGovernanceAction({
      action: "STANDALONE_AGENT_STARTED",
      reason: "INFERA Agent standalone server initialized",
      result: "success",
      details: { port: AGENT_PORT },
    });
  });
}

export default app;
