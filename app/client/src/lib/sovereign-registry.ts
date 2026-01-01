/**
 * INFERA WebNova - Sovereign Registry System
 * Dynamic Capability-based Menu & Workspace Registry
 * 
 * This is the central registry that powers the dynamic sidebar.
 * All menus, workspaces, and capabilities are defined here.
 * Adding a new plan or feature only requires updating this registry.
 */

import { 
  Crown, Shield, Building2, Users, Cpu, Code2, Globe, Rocket,
  BarChart3, Settings, Terminal, Bot, Zap, Database, Lock,
  Palette, FileCode, GitBranch, Server, Cloud, Wallet, CreditCard,
  Bell, MessageSquare, HelpCircle, Layers, Package, Gauge,
  LayoutDashboard, MonitorPlay, Workflow, BookOpen, Briefcase,
  ShieldCheck, KeyRound, Eye, Activity, Target, TrendingUp,
  Boxes, Network, Radio, Webhook, Blocks, Sparkles, Brain,
  type LucideIcon
} from "lucide-react";

// ==================== TYPES ====================

export type WorkspaceType = "owner" | "plan" | "org" | "public";

export type CapabilityId = 
  // Sovereign/Owner Only
  | "sovereign_access"
  | "platform_governance"
  | "ai_governance"
  | "system_config"
  | "financial_control"
  | "user_management"
  | "security_center"
  | "audit_logs"
  | "emergency_controls"
  // Plan-based Capabilities
  | "projects"
  | "ai_copilot"
  | "ai_assistant"
  | "code_editor"
  | "api_access"
  | "deployments"
  | "analytics"
  | "team_management"
  | "custom_domains"
  | "webhooks"
  | "version_control"
  | "performance_monitoring"
  | "white_label"
  | "multi_tenant"
  | "sandbox"
  // Public/Basic
  | "documentation"
  | "support"
  | "settings";

export interface RoleConfig {
  id: string;
  priority: number;
  canViewAll: boolean;
  labelEn: string;
  labelAr: string;
  color: string;
  icon: LucideIcon;
}

export interface PlanConfig {
  id: string;
  name: string;
  nameAr: string;
  level: number;
  type: "free" | "paid" | "sovereign";
  workspace: boolean;
  capabilities: CapabilityId[];
  color: string;
  icon: LucideIcon;
}

export interface MenuItemConfig {
  id: string;
  labelEn: string;
  labelAr: string;
  icon: LucideIcon;
  route: string;
  capability: CapabilityId;
  workspace: WorkspaceType;
  badge?: {
    textEn: string;
    textAr: string;
    variant: "default" | "new" | "pro" | "sovereign" | "beta";
  };
  children?: Omit<MenuItemConfig, "workspace" | "children">[];
}

export interface WorkspaceConfig {
  id: string;
  type: WorkspaceType;
  labelEn: string;
  labelAr: string;
  icon: LucideIcon;
  color: string;
  gradient: string;
  planId?: string;
}

// ==================== ROLE REGISTRY ====================

export const ROLES_REGISTRY: Record<string, RoleConfig> = {
  owner: {
    id: "owner",
    priority: 100,
    canViewAll: true,
    labelEn: "Platform Owner",
    labelAr: "مالك المنصة",
    color: "amber",
    icon: Crown,
  },
  sovereign: {
    id: "sovereign",
    priority: 90,
    canViewAll: false,
    labelEn: "Sovereign",
    labelAr: "السيادي",
    color: "violet",
    icon: Shield,
  },
  enterprise: {
    id: "enterprise",
    priority: 70,
    canViewAll: false,
    labelEn: "Enterprise",
    labelAr: "المؤسسي",
    color: "blue",
    icon: Building2,
  },
  pro: {
    id: "pro",
    priority: 50,
    canViewAll: false,
    labelEn: "Professional",
    labelAr: "المحترف",
    color: "emerald",
    icon: Briefcase,
  },
  basic: {
    id: "basic",
    priority: 30,
    canViewAll: false,
    labelEn: "Basic",
    labelAr: "الأساسي",
    color: "slate",
    icon: Users,
  },
  free: {
    id: "free",
    priority: 10,
    canViewAll: false,
    labelEn: "Free",
    labelAr: "المجاني",
    color: "gray",
    icon: Users,
  },
};

// ==================== PLANS REGISTRY ====================

export const PLANS_REGISTRY: Record<string, PlanConfig> = {
  free: {
    id: "free",
    name: "Discovery",
    nameAr: "الاستكشاف",
    level: 0,
    type: "free",
    workspace: false,
    capabilities: ["sandbox", "documentation", "support", "settings"],
    color: "gray",
    icon: Users,
  },
  basic: {
    id: "basic",
    name: "Builder",
    nameAr: "البناء",
    level: 1,
    type: "paid",
    workspace: true,
    capabilities: [
      "projects", "code_editor", "ai_assistant", "version_control",
      "documentation", "support", "settings"
    ],
    color: "slate",
    icon: Code2,
  },
  pro: {
    id: "pro",
    name: "Professional",
    nameAr: "المحترف",
    level: 2,
    type: "paid",
    workspace: true,
    capabilities: [
      "projects", "ai_copilot", "code_editor", "api_access",
      "deployments", "analytics", "custom_domains", "webhooks",
      "version_control", "documentation", "support", "settings"
    ],
    color: "emerald",
    icon: Briefcase,
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    nameAr: "المؤسسي",
    level: 3,
    type: "paid",
    workspace: true,
    capabilities: [
      "projects", "ai_copilot", "ai_assistant", "code_editor", "api_access",
      "deployments", "analytics", "team_management", "custom_domains",
      "webhooks", "version_control", "performance_monitoring",
      "white_label", "multi_tenant", "documentation", "support", "settings"
    ],
    color: "blue",
    icon: Building2,
  },
  sovereign: {
    id: "sovereign",
    name: "Sovereign",
    nameAr: "السيادي",
    level: 4,
    type: "sovereign",
    workspace: true,
    capabilities: [
      "sovereign_access", "platform_governance", "ai_governance",
      "projects", "ai_copilot", "ai_assistant", "code_editor", "api_access",
      "deployments", "analytics", "team_management", "custom_domains",
      "webhooks", "version_control", "performance_monitoring",
      "white_label", "multi_tenant", "documentation", "support", "settings"
    ],
    color: "violet",
    icon: Shield,
  },
};

// ==================== WORKSPACES REGISTRY ====================

export const WORKSPACES_REGISTRY: WorkspaceConfig[] = [
  {
    id: "owner",
    type: "owner",
    labelEn: "Owner Control",
    labelAr: "تحكم المالك",
    icon: Crown,
    color: "amber",
    gradient: "from-amber-600 via-orange-500 to-red-500",
  },
  {
    id: "sovereign",
    type: "plan",
    labelEn: "Sovereign Workspace",
    labelAr: "مساحة السيادي",
    icon: Shield,
    color: "violet",
    gradient: "from-violet-600 via-purple-500 to-fuchsia-500",
    planId: "sovereign",
  },
  {
    id: "enterprise",
    type: "plan",
    labelEn: "Enterprise Hub",
    labelAr: "مركز المؤسسة",
    icon: Building2,
    color: "blue",
    gradient: "from-blue-600 via-indigo-500 to-purple-500",
    planId: "enterprise",
  },
  {
    id: "pro",
    type: "plan",
    labelEn: "Pro Studio",
    labelAr: "استوديو المحترف",
    icon: Briefcase,
    color: "emerald",
    gradient: "from-emerald-600 via-teal-500 to-cyan-500",
    planId: "pro",
  },
  {
    id: "basic",
    type: "plan",
    labelEn: "Builder Space",
    labelAr: "مساحة البناء",
    icon: Code2,
    color: "slate",
    gradient: "from-slate-600 via-gray-500 to-zinc-500",
    planId: "basic",
  },
  {
    id: "public",
    type: "public",
    labelEn: "Public Access",
    labelAr: "الوصول العام",
    icon: Globe,
    color: "gray",
    gradient: "from-gray-600 via-slate-500 to-zinc-500",
  },
];

// ==================== MENU REGISTRY ====================

export const MENU_REGISTRY: MenuItemConfig[] = [
  // ========== OWNER WORKSPACE ==========
  {
    id: "sovereign_command",
    labelEn: "Sovereign Command",
    labelAr: "القيادة السيادية",
    icon: Crown,
    route: "/owner/command",
    capability: "sovereign_access",
    workspace: "owner",
    badge: { textEn: "Owner", textAr: "المالك", variant: "sovereign" },
  },
  {
    id: "platform_governance",
    labelEn: "Platform Governance",
    labelAr: "حوكمة المنصة",
    icon: Shield,
    route: "/owner/governance",
    capability: "platform_governance",
    workspace: "owner",
  },
  {
    id: "ai_governance",
    labelEn: "AI Governance",
    labelAr: "حوكمة الذكاء",
    icon: Brain,
    route: "/owner/ai-governance",
    capability: "ai_governance",
    workspace: "owner",
  },
  {
    id: "financial_control",
    labelEn: "Financial Control",
    labelAr: "التحكم المالي",
    icon: Wallet,
    route: "/owner/finance",
    capability: "financial_control",
    workspace: "owner",
  },
  {
    id: "user_management",
    labelEn: "User Management",
    labelAr: "إدارة المستخدمين",
    icon: Users,
    route: "/owner/users",
    capability: "user_management",
    workspace: "owner",
  },
  {
    id: "security_center",
    labelEn: "Security Center",
    labelAr: "مركز الأمان",
    icon: ShieldCheck,
    route: "/owner/security",
    capability: "security_center",
    workspace: "owner",
  },
  {
    id: "audit_logs",
    labelEn: "Audit Logs",
    labelAr: "سجلات المراجعة",
    icon: Eye,
    route: "/owner/audit",
    capability: "audit_logs",
    workspace: "owner",
  },
  {
    id: "system_config",
    labelEn: "System Configuration",
    labelAr: "تكوين النظام",
    icon: Settings,
    route: "/owner/config",
    capability: "system_config",
    workspace: "owner",
  },
  {
    id: "emergency_controls",
    labelEn: "Emergency Controls",
    labelAr: "التحكم الطارئ",
    icon: Radio,
    route: "/owner/emergency",
    capability: "emergency_controls",
    workspace: "owner",
    badge: { textEn: "Critical", textAr: "حرج", variant: "sovereign" },
  },

  // ========== PLAN WORKSPACE ITEMS ==========
  {
    id: "dashboard",
    labelEn: "Dashboard",
    labelAr: "لوحة التحكم",
    icon: LayoutDashboard,
    route: "/workspace/dashboard",
    capability: "projects",
    workspace: "plan",
  },
  {
    id: "projects",
    labelEn: "Projects",
    labelAr: "المشاريع",
    icon: Boxes,
    route: "/workspace/projects",
    capability: "projects",
    workspace: "plan",
  },
  {
    id: "code_editor",
    labelEn: "Code Editor",
    labelAr: "محرر الكود",
    icon: Code2,
    route: "/workspace/editor",
    capability: "code_editor",
    workspace: "plan",
  },
  {
    id: "ai_copilot",
    labelEn: "AI Copilot",
    labelAr: "مساعد الذكاء",
    icon: Sparkles,
    route: "/workspace/ai-copilot",
    capability: "ai_copilot",
    workspace: "plan",
    badge: { textEn: "AI", textAr: "ذكاء", variant: "pro" },
  },
  {
    id: "ai_assistant",
    labelEn: "AI Assistant",
    labelAr: "المساعد الذكي",
    icon: Bot,
    route: "/workspace/assistant",
    capability: "ai_assistant",
    workspace: "plan",
  },
  {
    id: "deployments",
    labelEn: "Deployments",
    labelAr: "النشر",
    icon: Rocket,
    route: "/workspace/deployments",
    capability: "deployments",
    workspace: "plan",
  },
  {
    id: "api_gateway",
    labelEn: "API Gateway",
    labelAr: "بوابة API",
    icon: Network,
    route: "/workspace/api",
    capability: "api_access",
    workspace: "plan",
  },
  {
    id: "analytics",
    labelEn: "Analytics",
    labelAr: "التحليلات",
    icon: BarChart3,
    route: "/workspace/analytics",
    capability: "analytics",
    workspace: "plan",
  },
  {
    id: "team",
    labelEn: "Team",
    labelAr: "الفريق",
    icon: Users,
    route: "/workspace/team",
    capability: "team_management",
    workspace: "plan",
  },
  {
    id: "domains",
    labelEn: "Domains",
    labelAr: "النطاقات",
    icon: Globe,
    route: "/workspace/domains",
    capability: "custom_domains",
    workspace: "plan",
  },
  {
    id: "webhooks",
    labelEn: "Webhooks",
    labelAr: "الخطافات",
    icon: Webhook,
    route: "/workspace/webhooks",
    capability: "webhooks",
    workspace: "plan",
  },
  {
    id: "version_control",
    labelEn: "Version Control",
    labelAr: "التحكم بالإصدار",
    icon: GitBranch,
    route: "/workspace/git",
    capability: "version_control",
    workspace: "plan",
  },
  {
    id: "monitoring",
    labelEn: "Monitoring",
    labelAr: "المراقبة",
    icon: Activity,
    route: "/workspace/monitoring",
    capability: "performance_monitoring",
    workspace: "plan",
  },

  // ========== PUBLIC/BASIC ITEMS ==========
  {
    id: "sandbox",
    labelEn: "Sandbox",
    labelAr: "صندوق الرمل",
    icon: Terminal,
    route: "/sandbox",
    capability: "sandbox",
    workspace: "public",
  },
  {
    id: "documentation",
    labelEn: "Documentation",
    labelAr: "التوثيق",
    icon: BookOpen,
    route: "/docs",
    capability: "documentation",
    workspace: "public",
  },
  {
    id: "support",
    labelEn: "Support",
    labelAr: "الدعم",
    icon: HelpCircle,
    route: "/support",
    capability: "support",
    workspace: "public",
  },
  {
    id: "settings",
    labelEn: "Settings",
    labelAr: "الإعدادات",
    icon: Settings,
    route: "/settings",
    capability: "settings",
    workspace: "public",
  },
];

// ==================== DYNAMIC ENGINE ====================

export interface UserContext {
  id: string;
  role: string;
  planId: string;
  capabilities: CapabilityId[];
  isOwner: boolean;
}

export interface SidebarSection {
  workspace: WorkspaceConfig;
  items: MenuItemConfig[];
}

export interface BuildSidebarResult {
  activeWorkspace: WorkspaceConfig;
  availableWorkspaces: WorkspaceConfig[];
  sections: SidebarSection[];
  canSwitchContext: boolean;
}

/**
 * Build the sidebar dynamically based on user context
 * This is the core algorithm that powers the dynamic sidebar
 */
export function buildSidebar(user: UserContext): BuildSidebarResult {
  const roleConfig = ROLES_REGISTRY[user.role] || ROLES_REGISTRY.free;
  const planConfig = PLANS_REGISTRY[user.planId] || PLANS_REGISTRY.free;
  
  // Owner sees everything
  if (user.isOwner || roleConfig.canViewAll) {
    const ownerWorkspace = WORKSPACES_REGISTRY.find(w => w.type === "owner")!;
    const allPlanWorkspaces = WORKSPACES_REGISTRY.filter(w => w.type === "plan");
    const publicWorkspace = WORKSPACES_REGISTRY.find(w => w.type === "public");
    
    const sections: SidebarSection[] = [
      {
        workspace: ownerWorkspace,
        items: MENU_REGISTRY.filter(m => m.workspace === "owner"),
      },
      ...allPlanWorkspaces.map(ws => ({
        workspace: ws,
        items: MENU_REGISTRY.filter(m => 
          m.workspace === "plan" && 
          (ws.planId ? PLANS_REGISTRY[ws.planId]?.capabilities.includes(m.capability) : true)
        ),
      })),
    ];
    
    if (publicWorkspace) {
      sections.push({
        workspace: publicWorkspace,
        items: MENU_REGISTRY.filter(m => m.workspace === "public"),
      });
    }
    
    return {
      activeWorkspace: ownerWorkspace,
      availableWorkspaces: [ownerWorkspace, ...allPlanWorkspaces],
      sections,
      canSwitchContext: true,
    };
  }
  
  // Regular users see their plan workspace only
  const planWorkspace = WORKSPACES_REGISTRY.find(w => w.planId === user.planId);
  const publicWorkspace = WORKSPACES_REGISTRY.find(w => w.type === "public");
  
  const userCapabilities = new Set([...planConfig.capabilities, ...user.capabilities]);
  
  const planItems = MENU_REGISTRY.filter(m => 
    m.workspace === "plan" && userCapabilities.has(m.capability)
  );
  
  const publicItems = MENU_REGISTRY.filter(m => 
    m.workspace === "public" && userCapabilities.has(m.capability)
  );
  
  const sections: SidebarSection[] = [];
  
  if (planWorkspace && planItems.length > 0) {
    sections.push({
      workspace: planWorkspace,
      items: planItems,
    });
  }
  
  if (publicWorkspace && publicItems.length > 0) {
    sections.push({
      workspace: publicWorkspace,
      items: publicItems,
    });
  }
  
  return {
    activeWorkspace: planWorkspace || publicWorkspace!,
    availableWorkspaces: planWorkspace ? [planWorkspace] : [],
    sections,
    canSwitchContext: false,
  };
}

/**
 * Check if user has a specific capability
 */
export function hasCapability(user: UserContext, capability: CapabilityId): boolean {
  if (user.isOwner) return true;
  
  const planConfig = PLANS_REGISTRY[user.planId];
  if (!planConfig) return false;
  
  return planConfig.capabilities.includes(capability) || user.capabilities.includes(capability);
}

/**
 * Get workspace for a specific plan
 */
export function getWorkspaceForPlan(planId: string): WorkspaceConfig | undefined {
  return WORKSPACES_REGISTRY.find(w => w.planId === planId);
}

/**
 * Get all menus for a capability
 */
export function getMenusForCapability(capability: CapabilityId): MenuItemConfig[] {
  return MENU_REGISTRY.filter(m => m.capability === capability);
}

/**
 * Get badge variant color
 */
export function getBadgeColor(variant: string): string {
  switch (variant) {
    case "sovereign": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    case "pro": return "bg-violet-500/20 text-violet-400 border-violet-500/30";
    case "new": return "bg-green-500/20 text-green-400 border-green-500/30";
    case "beta": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    default: return "bg-muted text-muted-foreground border-muted";
  }
}
