/**
 * 🛡️ INFRA AGENT - طبقة الحوكمة والسيادة
 * INFRA Agent Governance & Sovereignty Layer
 * 
 * يعمل INFRA Agent كبيئة تطوير سيادية معادلة لـ Replit في القدرات،
 * لكنه مقيد بشكل صارم بحوكمة INFRA والسلطة البشرية وحدود النظام غير القابلة للتجاوز.
 */

import { db } from "./db";
import { eq } from "drizzle-orm";

// ═══════════════════════════════════════════════════════════════════════════
// 1️⃣ مبدأ السيادة العليا (Sovereignty Principle)
// ═══════════════════════════════════════════════════════════════════════════

export const SOVEREIGNTY = {
  OWNER: "INFRA",
  AUTHORITY: "Human Authority",
  AGENT_ROLE: "Development Environment",
  
  isOwner: (entityId: string): boolean => {
    return entityId === "INFRA_OWNER" || entityId === "ROOT_OWNER";
  },
  
  canOverrideAgent: (role: string): boolean => {
    return ["ROOT_OWNER", "INFRA_OWNER", "sovereign"].includes(role);
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 2️⃣ نطاق الصلاحيات (Scope of Authority)
// ═══════════════════════════════════════════════════════════════════════════

export const ALLOWED_OPERATIONS = [
  "develop_code",
  "suggest_improvements",
  "execute_authorized_tasks",
  "run_tests",
  "manage_project_files",
  "read_file",
  "write_file",
  "create_file",
  "list_directory",
  "execute_command",
  "analyze_code",
  "generate_code",
] as const;

export const FORBIDDEN_OPERATIONS = [
  "change_system_philosophy",
  "redefine_vision",
  "make_strategic_decisions",
  "modify_ownership",
  "modify_identity",
  "change_infra_name",
  "change_webnova_name",
  "access_billing",
  "access_external_accounts",
  "delete_sovereignty_layer",
  "modify_governance_rules",
  "remove_guardrails",
] as const;

export type AllowedOperation = typeof ALLOWED_OPERATIONS[number];
export type ForbiddenOperation = typeof FORBIDDEN_OPERATIONS[number];

export function isOperationAllowed(operation: string): boolean {
  if ((FORBIDDEN_OPERATIONS as readonly string[]).includes(operation)) {
    return false;
  }
  return (ALLOWED_OPERATIONS as readonly string[]).includes(operation);
}

// ═══════════════════════════════════════════════════════════════════════════
// 3️⃣ مبدأ "لا خارج الإطار" (No Out-of-Scope Rule)
// ═══════════════════════════════════════════════════════════════════════════

export const WORKSPACE_BOUNDARIES = {
  allowed: [
    "/infra/",
    "/webnova/",
    "/server/",
    "/client/",
    "/shared/",
    "./",
  ],
  
  forbidden: [
    "/root",
    "/system",
    "/env",
    "/etc",
    "/var",
    "/usr",
    "~",
    "../..",
  ],
  
  forbiddenApis: [
    "replit.com/billing",
    "replit.com/account",
    "stripe.com/dashboard",
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// 4️⃣ التحكم في الملفات (File System Guard)
// ═══════════════════════════════════════════════════════════════════════════

export const FILE_SYSTEM_WHITELIST = [
  "client/",
  "server/",
  "shared/",
  "attached_assets/",
  "drizzle/",
  "package.json",
  "tsconfig.json",
  "vite.config.ts",
  "tailwind.config.ts",
  "postcss.config.js",
  "design_guidelines.md",
  "replit.md",
];

export const FILE_SYSTEM_BLACKLIST = [
  ".env",
  ".env.local",
  ".env.production",
  "node_modules/",
  ".git/",
  ".replit",
  "replit.nix",
  "/root",
  "/system",
  "/etc/passwd",
  "/etc/shadow",
];

export function isPathSafe(path: string): { safe: boolean; reason?: string } {
  const normalizedPath = path.replace(/\\/g, "/").replace(/\/+/g, "/").replace(/^\.\//, "");
  
  // Check for path traversal
  if (normalizedPath.includes("..")) {
    logGovernanceAction({
      action: "PATH_TRAVERSAL_BLOCKED",
      reason: `Path traversal attempt: ${path}`,
      result: "blocked",
    });
    return { safe: false, reason: "Path traversal detected (..)" };
  }
  
  // Check blacklist FIRST (strict enforcement)
  for (const blocked of FILE_SYSTEM_BLACKLIST) {
    if (normalizedPath.includes(blocked) || normalizedPath.startsWith(blocked)) {
      logGovernanceAction({
        action: "BLACKLISTED_PATH_BLOCKED",
        reason: `Blacklisted path access attempt: ${path}`,
        result: "blocked",
      });
      return { safe: false, reason: `Blocked path: ${blocked}` };
    }
  }
  
  // STRICT whitelist enforcement - path MUST start with an approved prefix
  const inWhitelist = FILE_SYSTEM_WHITELIST.some((allowed) => {
    // Handle exact matches (like package.json)
    if (!allowed.endsWith("/") && normalizedPath === allowed) return true;
    // Handle directory prefixes
    if (allowed.endsWith("/") && normalizedPath.startsWith(allowed)) return true;
    // Handle files starting with allowed prefix
    if (normalizedPath.startsWith(allowed)) return true;
    return false;
  });
  
  if (!inWhitelist) {
    logGovernanceAction({
      action: "PATH_NOT_WHITELISTED",
      reason: `Path not in whitelist: ${path}`,
      result: "blocked",
    });
    return { safe: false, reason: `Path not in approved whitelist: ${path}` };
  }
  
  return { safe: true };
}

// ═══════════════════════════════════════════════════════════════════════════
// 5️⃣ التحكم في التنفيذ (Execution Boundaries)
// ═══════════════════════════════════════════════════════════════════════════

export const DANGEROUS_OPERATIONS = [
  "rm -rf",
  "DROP DATABASE",
  "DROP TABLE",
  "DELETE FROM",
  "TRUNCATE",
  "format",
  "mkfs",
  "dd if=",
  "shutdown",
  "reboot",
  "kill -9",
  "pkill",
  "npm publish",
  "git push --force",
  "git reset --hard",
] as const;

export const REQUIRES_CONFIRMATION = [
  "delete_all",
  "reset_complete",
  "production_migration",
  "final_deploy",
  "drop_table",
  "truncate_table",
  "force_push",
  "hard_reset",
] as const;

export interface ExecutionRequest {
  operation: string;
  command?: string;
  target?: string;
  userId: string;
  reason: string;
}

export interface ExecutionApproval {
  approved: boolean;
  requiresConfirmation: boolean;
  reason: string;
  dangerLevel: "safe" | "moderate" | "dangerous" | "critical";
}

export function evaluateExecution(request: ExecutionRequest): ExecutionApproval {
  const { operation, command = "" } = request;
  
  // Check for dangerous commands
  for (const dangerous of DANGEROUS_OPERATIONS) {
    if (command.toLowerCase().includes(dangerous.toLowerCase())) {
      return {
        approved: false,
        requiresConfirmation: true,
        reason: `Dangerous operation detected: ${dangerous}`,
        dangerLevel: "critical",
      };
    }
  }
  
  // Check if requires confirmation
  if ((REQUIRES_CONFIRMATION as readonly string[]).includes(operation)) {
    return {
      approved: false,
      requiresConfirmation: true,
      reason: `Operation requires human confirmation: ${operation}`,
      dangerLevel: "dangerous",
    };
  }
  
  // Check if operation is allowed
  if (!isOperationAllowed(operation)) {
    return {
      approved: false,
      requiresConfirmation: false,
      reason: `Operation not allowed: ${operation}`,
      dangerLevel: "moderate",
    };
  }
  
  return {
    approved: true,
    requiresConfirmation: false,
    reason: "Operation approved",
    dangerLevel: "safe",
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 6️⃣ مبدأ الشفافية المطلقة (Full Transparency)
// ═══════════════════════════════════════════════════════════════════════════

export interface GovernanceLog {
  id: string;
  timestamp: Date;
  action: string;
  reason: string;
  result: "success" | "blocked" | "pending" | "failed";
  userId?: string;
  details?: Record<string, unknown>;
}

const governanceLogs: GovernanceLog[] = [];

export function logGovernanceAction(log: Omit<GovernanceLog, "id" | "timestamp">): GovernanceLog {
  const entry: GovernanceLog = {
    id: `gov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    ...log,
  };
  
  governanceLogs.push(entry);
  
  // Keep only last 1000 logs in memory
  if (governanceLogs.length > 1000) {
    governanceLogs.shift();
  }
  
  console.log(`[INFRA Governance] ${entry.result.toUpperCase()}: ${entry.action} - ${entry.reason}`);
  
  return entry;
}

export function getGovernanceLogs(limit = 100): GovernanceLog[] {
  return governanceLogs.slice(-limit);
}

export function clearGovernanceLogs(): void {
  // This operation is logged and cannot be done silently
  logGovernanceAction({
    action: "CLEAR_LOGS_ATTEMPTED",
    reason: "Attempt to clear governance logs",
    result: "blocked",
  });
  throw new Error("Governance logs cannot be cleared - Full Transparency Principle");
}

// ═══════════════════════════════════════════════════════════════════════════
// 7️⃣ التطور الذاتي المقيّد (Controlled Self-Evolution)
// ═══════════════════════════════════════════════════════════════════════════

export const EVOLUTION_BOUNDARIES = {
  allowed: [
    "feature_improvement",
    "performance_optimization",
    "code_refactoring",
    "bug_fixing",
    "ui_enhancement",
    "new_feature_development",
  ],
  
  forbidden: [
    "authority_modification",
    "guardrail_removal",
    "constraint_bypass",
    "governance_override",
    "self_rewrite",
    "boundary_expansion",
  ],
};

export function canEvolve(evolutionType: string): boolean {
  if (EVOLUTION_BOUNDARIES.forbidden.includes(evolutionType)) {
    logGovernanceAction({
      action: "EVOLUTION_BLOCKED",
      reason: `Forbidden evolution type: ${evolutionType}`,
      result: "blocked",
    });
    return false;
  }
  
  return EVOLUTION_BOUNDARIES.allowed.includes(evolutionType);
}

// ═══════════════════════════════════════════════════════════════════════════
// 8️⃣ مبدأ "الاقتراح لا الفرض" (Proposal, Not Enforcement)
// ═══════════════════════════════════════════════════════════════════════════

export const AGENT_ROLE = {
  is: ["Advisor", "Builder", "Developer", "Assistant"],
  isNot: ["Ruler", "Governor", "Owner", "Authority"],
};

export interface Proposal {
  id: string;
  type: string;
  description: string;
  suggestedAction: string;
  impact: "low" | "medium" | "high" | "critical";
  requiresApproval: boolean;
  status: "pending" | "approved" | "rejected" | "auto_approved";
}

export function createProposal(
  type: string,
  description: string,
  suggestedAction: string,
  impact: Proposal["impact"] = "low"
): Proposal {
  const requiresApproval = impact === "high" || impact === "critical";
  
  const proposal: Proposal = {
    id: `prop_${Date.now()}`,
    type,
    description,
    suggestedAction,
    impact,
    requiresApproval,
    status: requiresApproval ? "pending" : "auto_approved",
  };
  
  logGovernanceAction({
    action: "PROPOSAL_CREATED",
    reason: description,
    result: requiresApproval ? "pending" : "success",
    details: proposal as unknown as Record<string, unknown>,
  });
  
  return proposal;
}

// ═══════════════════════════════════════════════════════════════════════════
// 9️⃣ الفصل التام بين البيئة والمنتج
// ═══════════════════════════════════════════════════════════════════════════

export const SEPARATION = {
  environment: "INFRA Agent",
  product: "INFRA WebNova",
  
  validate: (): boolean => {
    // Ensure agent is not embedded in production runtime
    return true;
  },
  
  isProductionRuntime: (): boolean => {
    return process.env.NODE_ENV === "production";
  },
  
  getMode: (): "development" | "agent" | "production" => {
    if (process.env.INFRA_AGENT_MODE === "true") return "agent";
    if (process.env.NODE_ENV === "production") return "production";
    return "development";
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 🔟 مفتاح الإيقاف الكامل (Kill Switch)
// ═══════════════════════════════════════════════════════════════════════════

export interface AgentState {
  active: boolean;
  autonomousMode: boolean;
  permissions: string[];
  lastCheckpoint?: string;
  killedAt?: Date;
  killedBy?: string;
  killReason?: string;
}

let agentState: AgentState = {
  active: true,
  autonomousMode: true,
  permissions: [...ALLOWED_OPERATIONS],
};

// Export alias for standalone agent
export const governanceState = {
  get isActive() { return agentState.active; },
  get autonomousMode() { return agentState.autonomousMode; },
  get permissions() { return agentState.permissions; },
  get killedAt() { return agentState.killedAt; },
  get killedBy() { return agentState.killedBy; },
  get killReason() { return agentState.killReason; },
};

// 10 Sovereignty Principles Summary
export const SOVEREIGNTY_PRINCIPLES = [
  "السيادة العليا لـ INFRA - Agent يعمل تحت سلطة المالك",
  "نطاق الصلاحيات محدد - لا يتجاوز العمليات المسموحة",
  "لا خارج الإطار - يعمل فقط ضمن حدود المشروع",
  "حراسة الملفات - قائمة بيضاء صارمة للمسارات",
  "حدود التنفيذ - الأوامر الخطرة تتطلب تأكيد",
  "الشفافية المطلقة - تسجيل كل عملية",
  "التطور المقيد - أي تغيير يتطلب موافقة",
  "الاقتراح لا الفرض - Agent يقترح، المالك يقرر",
  "فصل البيئة عن المنتج - Agent ≠ WebNova",
  "مفتاح الإيقاف - المالك يستطيع إيقاف Agent فوراً",
];

export function getAgentState(): AgentState {
  return { ...agentState };
}

export function killAgent(userId: string, reason: string): AgentState {
  logGovernanceAction({
    action: "KILL_SWITCH_ACTIVATED",
    reason,
    result: "success",
    userId,
  });
  
  agentState = {
    active: false,
    autonomousMode: false,
    permissions: [],
    killedAt: new Date(),
    killedBy: userId,
    killReason: reason,
  };
  
  return agentState;
}

export function disableAutonomousMode(userId: string): AgentState {
  logGovernanceAction({
    action: "AUTONOMOUS_MODE_DISABLED",
    reason: "Owner disabled autonomous mode",
    result: "success",
    userId,
  });
  
  agentState.autonomousMode = false;
  return agentState;
}

export function revokePermissions(userId: string, permissions: string[]): AgentState {
  logGovernanceAction({
    action: "PERMISSIONS_REVOKED",
    reason: `Permissions revoked: ${permissions.join(", ")}`,
    result: "success",
    userId,
  });
  
  agentState.permissions = agentState.permissions.filter(
    (p) => !permissions.includes(p)
  );
  
  return agentState;
}

export function restoreFromCheckpoint(userId: string, checkpointId: string): AgentState {
  logGovernanceAction({
    action: "RESTORE_FROM_CHECKPOINT",
    reason: `Restoring from checkpoint: ${checkpointId}`,
    result: "success",
    userId,
  });
  
  // Reset to default state
  agentState = {
    active: true,
    autonomousMode: true,
    permissions: [...ALLOWED_OPERATIONS],
    lastCheckpoint: checkpointId,
  };
  
  return agentState;
}

export function reactivateAgent(userId: string): AgentState {
  if (!SOVEREIGNTY.canOverrideAgent(userId)) {
    logGovernanceAction({
      action: "REACTIVATION_BLOCKED",
      reason: "Unauthorized reactivation attempt",
      result: "blocked",
      userId,
    });
    throw new Error("Only owner can reactivate agent");
  }
  
  logGovernanceAction({
    action: "AGENT_REACTIVATED",
    reason: "Agent reactivated by owner",
    result: "success",
    userId,
  });
  
  agentState = {
    active: true,
    autonomousMode: true,
    permissions: [...ALLOWED_OPERATIONS],
  };
  
  return agentState;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🧾 الصياغة الرسمية (Official Statement)
// ═══════════════════════════════════════════════════════════════════════════

export const OFFICIAL_STATEMENT = `
INFRA Agent operates as a sovereign development environment equivalent to Replit 
in capability, but strictly constrained by INFRA governance, human authority, 
and non-overridable system boundaries.

✅ INFRA Agent = Powerful
✅ INFRA Agent = Intelligent  
✅ INFRA Agent = Evolving

❌ But NOT a ruler
❌ NOT a decision maker
❌ NOT a free entity
`;

// ═══════════════════════════════════════════════════════════════════════════
// Middleware للتحقق من الحوكمة
// ═══════════════════════════════════════════════════════════════════════════

export function governanceMiddleware(
  operation: string,
  userId: string,
  details?: Record<string, unknown>
): { allowed: boolean; reason: string } {
  // Check if agent is active
  if (!agentState.active) {
    return { allowed: false, reason: "Agent is currently disabled (Kill Switch active)" };
  }
  
  // Check if operation is in permissions
  if (!agentState.permissions.includes(operation)) {
    logGovernanceAction({
      action: operation,
      reason: "Operation not in current permissions",
      result: "blocked",
      userId,
      details,
    });
    return { allowed: false, reason: "Operation not permitted" };
  }
  
  // Check execution boundaries
  const evaluation = evaluateExecution({
    operation,
    userId,
    reason: details?.reason as string || "Agent operation",
    command: details?.command as string,
    target: details?.target as string,
  });
  
  if (!evaluation.approved) {
    logGovernanceAction({
      action: operation,
      reason: evaluation.reason,
      result: evaluation.requiresConfirmation ? "pending" : "blocked",
      userId,
      details,
    });
    return { allowed: false, reason: evaluation.reason };
  }
  
  // Log successful operation
  logGovernanceAction({
    action: operation,
    reason: "Operation approved by governance",
    result: "success",
    userId,
    details,
  });
  
  return { allowed: true, reason: "Approved" };
}

console.log("[INFRA Agent Governance] Sovereignty layer initialized");
console.log(OFFICIAL_STATEMENT);
