export interface SovereignConversation {
  id: string;
  title: string;
  titleAr?: string;
  status: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

export interface CodeFile {
  name: string;
  path: string;
  content: string;
  language: string;
}

export interface GroupPlatform {
  id: string;
  name: string;
  nameAr?: string;
  slug: string;
  platformType: string;
  status: string;
}

export interface SovereignCoreIDEProps {
  workspaceId: string;
  isOwner: boolean;
}

export interface SystemMapSummary {
  success: boolean;
  version: string;
  lastUpdated: string;
  sections: {
    architecture: any;
    database: any;
    components: any;
    apiRoutes: any;
    infrastructure: any;
    relationships: any;
  };
  stats: {
    totalTables: number;
    totalComponents: number;
    totalRoutes: number;
    totalServices: number;
  };
}

export type SecurityPosture = "secure" | "elevated" | "restricted";
export type SovereignPhase = "analysis" | "planning" | "execution";
export type NovaTheme = "violet" | "emerald" | "amber" | "rose" | "cyan";
export type Viewport = "desktop" | "tablet" | "mobile";
export type BottomTab = "terminal" | "problems" | "output";
export type RightTab = "tools" | "files" | "database" | "backend" | "packages" | "testing" | "git" | "deploy" | "debugger" | "copilot" | "compliance" | "tenants" | "rules" | "observability" | "marketplace" | "billing" | "ai-arch" | "export" | "env" | "team" | "system-map" | "template-gen" | "erd" | "ai-review" | "kubernetes" | "docker" | "microservices" | "distributed-db" | "ai-ml" | "blockchain" | "event-driven" | "api-gateway" | "cloud-infra" | "permissions";

export interface AuditLogEntry {
  timestamp: Date;
  action: string;
  phase: SovereignPhase;
  actor: string;
  metadata?: Record<string, unknown>;
}

export interface NovaThemeColors {
  primary: string;
  border: string;
  text: string;
}

export const NOVA_THEME_COLORS: Record<NovaTheme, NovaThemeColors> = {
  violet: { primary: "from-violet-600 to-fuchsia-600", border: "border-violet-500/30", text: "text-violet-300" },
  emerald: { primary: "from-emerald-600 to-teal-600", border: "border-emerald-500/30", text: "text-emerald-300" },
  amber: { primary: "from-amber-600 to-orange-600", border: "border-amber-500/30", text: "text-amber-300" },
  rose: { primary: "from-rose-600 to-pink-600", border: "border-rose-500/30", text: "text-rose-300" },
  cyan: { primary: "from-cyan-600 to-blue-600", border: "border-cyan-500/30", text: "text-cyan-300" },
};
