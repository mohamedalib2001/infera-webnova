/**
 * 🖥️ Secure Terminal System
 * نظام الطرفية الآمن
 * 
 * Provides:
 * - Secure command execution with whitelist
 * - WebSocket-based real-time terminal
 * - Session management
 * - Command history tracking
 * - Output streaming
 */

import { exec, spawn, ChildProcess } from 'child_process';
import { promisify } from 'util';
import * as crypto from 'crypto';

const execAsync = promisify(exec);

// ==================== TYPES ====================

export interface TerminalSession {
  id: string;
  userId: string;
  workspaceId?: string;
  projectId?: string;
  created: Date;
  lastActivity: Date;
  cwd: string;
  env: Record<string, string>;
  history: CommandHistoryEntry[];
  process?: ChildProcess;
}

export interface CommandHistoryEntry {
  id: string;
  command: string;
  output: string;
  exitCode: number;
  executedAt: Date;
  duration: number; // ms
}

export interface CommandResult {
  success: boolean;
  output: string;
  error?: string;
  exitCode: number;
  duration: number;
}

export interface TerminalToken {
  token: string;
  sessionId: string;
  userId: string;
  workspaceId?: string;
  projectId?: string;
  expiresAt: Date;
}

// ==================== SECURITY CONFIG ====================

const ALLOWED_COMMAND_PREFIXES = [
  'ls', 'pwd', 'cat', 'head', 'tail', 'echo', 'grep', 'find', 'wc',
  'npm', 'npx', 'node', 'yarn', 'pnpm',
  'python', 'python3', 'pip', 'pip3',
  'git status', 'git log', 'git branch', 'git diff', 'git show',
  'clear', 'help', 'mkdir', 'touch', 'cp', 'mv',
  'date', 'whoami', 'which', 'env', 'printenv',
  'curl', 'wget',
];

const BLOCKED_PATTERNS = [
  /[;&|`$(){}\\]/,          // Shell injection (added backslash)
  /\.\./,                    // Path traversal (any ..)
  /~\//,                     // Home directory access
  /^\/(?!tmp)/,              // Absolute paths (only /tmp allowed)
  /rm\s+-rf?\s+/i,           // Destructive rm
  /sudo/i,                   // Privilege escalation
  /chmod/i,                  // Permission changes
  /chown/i,                  // Ownership changes
  />\s*/,                    // Any output redirect
  /<\s*/,                    // Any input redirect
  /eval\s*\(/,               // Eval injection
  /base64\s+-d/,             // Base64 decode
  /\|\s*sh\b/,               // Pipe to shell
  /\|\s*bash\b/,             // Pipe to bash
  /&&/,                      // Command chaining
  /\|\|/,                    // OR command chaining
  /\n/,                      // Newline injection
  /\r/,                      // Carriage return injection
  /postinstall/i,            // npm postinstall hooks
  /preinstall/i,             // npm preinstall hooks
  /curl.*\|/,                // Pipe from curl
  /wget.*\|/,                // Pipe from wget
];

// ==================== TERMINAL MANAGER ====================

class SecureTerminalManager {
  private sessions: Map<string, TerminalSession> = new Map();
  private tokens: Map<string, TerminalToken> = new Map();
  private maxSessionsPerUser = 5;
  private sessionTimeout = 30 * 60 * 1000; // 30 minutes
  private tokenExpiry = 5 * 60 * 1000; // 5 minutes
  private maxCommandLength = 1000;
  private maxOutputLength = 100000;
  private commandTimeout = 30000; // 30 seconds

  /**
   * Generate a secure terminal token
   */
  generateToken(
    userId: string,
    options: { workspaceId?: string; projectId?: string } = {}
  ): TerminalToken {
    const sessionId = this.generateId();
    const token = crypto.randomBytes(32).toString('hex');
    
    const terminalToken: TerminalToken = {
      token,
      sessionId,
      userId,
      workspaceId: options.workspaceId,
      projectId: options.projectId,
      expiresAt: new Date(Date.now() + this.tokenExpiry),
    };
    
    this.tokens.set(token, terminalToken);
    
    // Clean up expired tokens
    this.cleanupExpiredTokens();
    
    return terminalToken;
  }

  /**
   * Validate and consume a token
   */
  validateToken(token: string): TerminalToken | null {
    const terminalToken = this.tokens.get(token);
    
    if (!terminalToken) {
      return null;
    }
    
    if (terminalToken.expiresAt < new Date()) {
      this.tokens.delete(token);
      return null;
    }
    
    // Token is valid, consume it
    this.tokens.delete(token);
    return terminalToken;
  }

  /**
   * Create a new terminal session
   */
  createSession(
    userId: string,
    options: { workspaceId?: string; projectId?: string; cwd?: string } = {}
  ): TerminalSession {
    // Check session limit
    const userSessions = Array.from(this.sessions.values())
      .filter(s => s.userId === userId);
    
    if (userSessions.length >= this.maxSessionsPerUser) {
      // Remove oldest session
      const oldest = userSessions.sort((a, b) => 
        a.lastActivity.getTime() - b.lastActivity.getTime()
      )[0];
      this.destroySession(oldest.id);
    }
    
    const session: TerminalSession = {
      id: this.generateId(),
      userId,
      workspaceId: options.workspaceId,
      projectId: options.projectId,
      created: new Date(),
      lastActivity: new Date(),
      cwd: options.cwd || '/tmp',
      env: {},
      history: [],
    };
    
    this.sessions.set(session.id, session);
    return session;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): TerminalSession | null {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }
    
    // Check if session expired
    if (Date.now() - session.lastActivity.getTime() > this.sessionTimeout) {
      this.destroySession(sessionId);
      return null;
    }
    
    return session;
  }

  /**
   * Destroy a session
   */
  destroySession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session?.process) {
      session.process.kill('SIGTERM');
    }
    this.sessions.delete(sessionId);
  }

  /**
   * Validate command against security rules (strict whitelist)
   */
  validateCommand(command: string): { valid: boolean; reason?: string } {
    // Check length
    if (command.length > this.maxCommandLength) {
      return { valid: false, reason: 'Command too long' };
    }
    
    // Check blocked patterns FIRST
    for (const pattern of BLOCKED_PATTERNS) {
      if (pattern.test(command)) {
        return { valid: false, reason: 'Command contains blocked pattern' };
      }
    }
    
    // Extract the base command (first word only)
    const trimmedCommand = command.trim();
    const baseCommand = trimmedCommand.split(/\s+/)[0].toLowerCase();
    
    // SECURITY: Only allow safe read-only commands (no interpreters)
    const EXACT_ALLOWED_COMMANDS = [
      'ls', 'pwd', 'cat', 'head', 'tail', 'echo', 'grep', 'find', 'wc',
      'git', 'clear', 'help', 'mkdir', 'touch', 'cp', 'mv',
      'date', 'whoami', 'which',
      // npm/pip for listing only, not execution
      'npm', 'pip', 'pip3',
    ];
    
    // BLOCKED: Interpreters that can execute arbitrary code
    const BLOCKED_INTERPRETERS = ['node', 'python', 'python3', 'npx', 'yarn', 'pnpm', 'sh', 'bash', 'zsh', 'perl', 'ruby', 'php'];
    if (BLOCKED_INTERPRETERS.includes(baseCommand)) {
      return { valid: false, reason: 'Script interpreters are blocked for security' };
    }
    
    if (!EXACT_ALLOWED_COMMANDS.includes(baseCommand)) {
      return { valid: false, reason: `Command '${baseCommand}' not in whitelist` };
    }
    
    // Additional git subcommand restrictions (read-only operations only)
    if (baseCommand === 'git') {
      const gitSubcommand = trimmedCommand.split(/\s+/)[1]?.toLowerCase();
      const allowedGitCommands = ['status', 'log', 'branch', 'diff', 'show', 'remote'];
      if (gitSubcommand && !allowedGitCommands.includes(gitSubcommand)) {
        return { valid: false, reason: `Git subcommand '${gitSubcommand}' not allowed` };
      }
    }
    
    // npm/pip: Only allow safe list/info commands
    if (['npm', 'pip', 'pip3'].includes(baseCommand)) {
      const subcommand = trimmedCommand.split(/\s+/)[1]?.toLowerCase();
      const allowedSubcommands = ['list', 'ls', 'show', 'view', 'info', 'search', 'help', 'version', '--version', '-v'];
      if (subcommand && !allowedSubcommands.includes(subcommand)) {
        return { valid: false, reason: 'Only info/list operations allowed for package managers' };
      }
    }
    
    // CRITICAL: Block dangerous flags that allow command execution
    const dangerousFlags = ['-exec', '-execdir', '-ok', '-okdir', '--exec'];
    const args = trimmedCommand.split(/\s+/).slice(1);
    const blockedInterpreters = ['sh', 'bash', 'zsh', 'node', 'python', 'python3', 'perl', 'ruby', 'php', 'eval', 'npx', 'yarn', 'pnpm'];
    for (const arg of args) {
      // Block execution flags (especially in find command)
      if (dangerousFlags.some(flag => arg.toLowerCase().includes(flag))) {
        return { valid: false, reason: 'Execution flags are not allowed' };
      }
      // Block interpreter names appearing ANYWHERE in arguments - even as substrings
      const argLower = arg.toLowerCase();
      for (const interp of blockedInterpreters) {
        // Block if interpreter name appears anywhere in the argument (substring match)
        if (argLower.includes(interp)) {
          return { valid: false, reason: 'Interpreter references in arguments are blocked' };
        }
      }
    }
    
    // Block cp/mv commands entirely in secure mode - too risky for file staging
    if (['cp', 'mv'].includes(baseCommand)) {
      return { valid: false, reason: 'File copy/move operations are disabled for security' };
    }
    
    // Block filesystem commands that access absolute paths outside /tmp
    const filesystemCommands = ['cat', 'head', 'tail', 'find', 'cp', 'mv', 'touch', 'mkdir', 'ls', 'grep'];
    if (filesystemCommands.includes(baseCommand)) {
      for (const arg of args) {
        // Skip flags (start with -)
        if (arg.startsWith('-')) continue;
        // Block absolute paths outside /tmp
        if (arg.startsWith('/') && !arg.startsWith('/tmp')) {
          return { valid: false, reason: 'Only /tmp paths are accessible' };
        }
        // Block any path traversal in arguments
        if (arg.includes('..')) {
          return { valid: false, reason: 'Path traversal not allowed' };
        }
      }
    }
    
    return { valid: true };
  }

  /**
   * Execute a command in a session (with ownership verification)
   */
  async executeCommand(
    sessionId: string,
    command: string,
    userId?: string // Required for ownership verification
  ): Promise<CommandResult> {
    const session = this.getSession(sessionId);
    
    if (!session) {
      return {
        success: false,
        output: '',
        error: 'Session not found or expired',
        exitCode: 1,
        duration: 0,
      };
    }
    
    // Verify ownership if userId provided
    if (userId && session.userId !== userId) {
      return {
        success: false,
        output: '',
        error: 'Session does not belong to current user',
        exitCode: 1,
        duration: 0,
      };
    }
    
    // Validate command
    const validation = this.validateCommand(command);
    if (!validation.valid) {
      return {
        success: false,
        output: '',
        error: validation.reason,
        exitCode: 1,
        duration: 0,
      };
    }
    
    const startTime = Date.now();
    
    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: session.cwd,
        timeout: this.commandTimeout,
        maxBuffer: this.maxOutputLength,
        env: { ...process.env, ...session.env },
      });
      
      const duration = Date.now() - startTime;
      const output = (stdout + stderr).slice(0, this.maxOutputLength);
      
      // Update session
      session.lastActivity = new Date();
      
      // Add to history
      const historyEntry: CommandHistoryEntry = {
        id: this.generateId(),
        command,
        output,
        exitCode: 0,
        executedAt: new Date(),
        duration,
      };
      session.history.push(historyEntry);
      
      // Keep only last 100 commands
      if (session.history.length > 100) {
        session.history = session.history.slice(-100);
      }
      
      return {
        success: true,
        output,
        exitCode: 0,
        duration,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const output = (error.stdout || '') + (error.stderr || error.message || '');
      
      // Update session
      session.lastActivity = new Date();
      
      // Add to history
      const historyEntry: CommandHistoryEntry = {
        id: this.generateId(),
        command,
        output: output.slice(0, this.maxOutputLength),
        exitCode: error.code || 1,
        executedAt: new Date(),
        duration,
      };
      session.history.push(historyEntry);
      
      return {
        success: false,
        output: output.slice(0, this.maxOutputLength),
        error: error.message,
        exitCode: error.code || 1,
        duration,
      };
    }
  }

  /**
   * Change working directory (restricted to /tmp sandbox only)
   */
  changeDirectory(sessionId: string, path: string): { success: boolean; cwd: string; error?: string } {
    const session = this.getSession(sessionId);
    
    if (!session) {
      return { success: false, cwd: '', error: 'Session not found' };
    }
    
    // Block any path traversal attempts
    if (path.includes('..') || path.includes('~') || path.includes('\\')) {
      return { success: false, cwd: session.cwd, error: 'Path traversal not allowed' };
    }
    
    // Resolve path
    let newPath: string;
    if (path.startsWith('/')) {
      newPath = path;
    } else {
      newPath = `${session.cwd}/${path}`.replace(/\/+/g, '/');
    }
    
    // Normalize path to prevent tricks like /tmp/../etc
    const normalizedPath = newPath.split('/').filter(Boolean).reduce((acc: string[], part) => {
      if (part === '..') {
        acc.pop();
      } else if (part !== '.') {
        acc.push(part);
      }
      return acc;
    }, []);
    newPath = '/' + normalizedPath.join('/');
    
    // STRICT: Only allow /tmp directory - no exceptions
    if (!newPath.startsWith('/tmp')) {
      return { success: false, cwd: session.cwd, error: 'Only /tmp directory is accessible' };
    }
    
    session.cwd = newPath;
    session.lastActivity = new Date();
    
    return { success: true, cwd: newPath };
  }

  /**
   * Get command history for a session
   */
  getHistory(sessionId: string): CommandHistoryEntry[] {
    const session = this.getSession(sessionId);
    return session?.history || [];
  }

  /**
   * Set environment variable
   */
  setEnv(sessionId: string, key: string, value: string): boolean {
    const session = this.getSession(sessionId);
    if (!session) return false;
    
    // Sanitize key
    if (!/^[A-Z_][A-Z0-9_]*$/i.test(key)) {
      return false;
    }
    
    session.env[key] = value;
    session.lastActivity = new Date();
    return true;
  }

  /**
   * List all sessions for a user
   */
  listUserSessions(userId: string): TerminalSession[] {
    return Array.from(this.sessions.values())
      .filter(s => s.userId === userId)
      .map(s => ({
        ...s,
        process: undefined, // Don't expose process
      }));
  }

  /**
   * Cleanup expired tokens
   */
  private cleanupExpiredTokens(): void {
    const now = new Date();
    const entries = Array.from(this.tokens.entries());
    for (const [token, data] of entries) {
      if (data.expiresAt < now) {
        this.tokens.delete(token);
      }
    }
  }

  /**
   * Cleanup expired sessions
   */
  cleanupExpiredSessions(): number {
    let cleaned = 0;
    const now = Date.now();
    
    const entries = Array.from(this.sessions.entries());
    for (const [id, session] of entries) {
      if (now - session.lastActivity.getTime() > this.sessionTimeout) {
        this.destroySession(id);
        cleaned++;
      }
    }
    
    return cleaned;
  }

  /**
   * Get terminal statistics
   */
  getStats(): {
    activeSessions: number;
    activeTokens: number;
    totalCommands: number;
  } {
    let totalCommands = 0;
    const sessions = Array.from(this.sessions.values());
    for (const session of sessions) {
      totalCommands += session.history.length;
    }
    
    return {
      activeSessions: this.sessions.size,
      activeTokens: this.tokens.size,
      totalCommands,
    };
  }

  private generateId(): string {
    return `term-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton
export const secureTerminal = new SecureTerminalManager();

// Export allowed commands for documentation
export { ALLOWED_COMMAND_PREFIXES };
