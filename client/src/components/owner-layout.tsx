/**
 * INFERA WebNova - Owner Layout Component
 * Professional layout for Owner with dynamic sidebar and breadcrumb
 */

import { type ReactNode } from "react";
import { useLocation } from "wouter";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { SovereignSidebar, SovereignBreadcrumb } from "@/components/sovereign-sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { CommandPalette } from "@/components/command-palette";
import {
  Crown, Shield, Bell, Sparkles, Activity, Zap,
  ChevronRight, Search, AlertTriangle
} from "lucide-react";
import {
  WORKSPACES_REGISTRY,
  PLANS_REGISTRY,
  ROLES_REGISTRY,
  type UserContext,
  type WorkspaceConfig,
} from "@/lib/sovereign-registry";
import { useWorkspace } from "@/lib/workspace-context";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";

interface OwnerLayoutProps {
  children: ReactNode;
}

export function OwnerLayout({ children }: OwnerLayoutProps) {
  const { isRtl } = useLanguage();
  const { user: authUser, logout } = useAuth();
  const [location] = useLocation();
  
  const { user: workspaceUser, activeWorkspace: contextWorkspace, sidebarData } = useWorkspace();

  const userContext: UserContext & { fullName?: string; avatar?: string } = workspaceUser ? {
    ...workspaceUser,
    fullName: authUser?.fullName || authUser?.firstName || "Mohamed Ali",
    avatar: authUser?.profileImageUrl || authUser?.avatar,
  } : {
    id: authUser?.id || "owner",
    role: authUser?.role || "owner",
    planId: "sovereign",
    capabilities: [],
    isOwner: authUser?.role === "owner",
    fullName: authUser?.fullName || authUser?.firstName || "Mohamed Ali",
    avatar: authUser?.profileImageUrl || authUser?.avatar,
  };

  const activeWorkspace = contextWorkspace || WORKSPACES_REGISTRY.find(w => 
    location.startsWith("/owner") ? w.id === "owner" : w.planId === userContext.planId
  ) || WORKSPACES_REGISTRY[0];

  const style = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full bg-background" dir={isRtl ? "rtl" : "ltr"}>
        <SovereignSidebar
          user={userContext}
          isRtl={isRtl}
          onLogout={logout}
          onThemeToggle={() => {}}
        />
        
        <SidebarInset className="flex flex-col flex-1 min-w-0">
          {/* Professional Header with Breadcrumb */}
          <header className="sticky top-0 z-40 flex items-center justify-between gap-4 px-4 py-3 bg-gradient-to-r from-background via-background/95 to-background border-b backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="sidebar-trigger" />
              <Separator orientation="vertical" className="h-6" />
              <SovereignBreadcrumb 
                workspace={activeWorkspace} 
                currentPath={location}
                isRtl={isRtl}
              />
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              {/* System Status Indicators */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                <Activity className="h-3 w-3 text-green-400 animate-pulse" />
                <span className="text-[10px] font-medium text-green-400">
                  {isRtl ? "جميع الأنظمة تعمل" : "All Systems Operational"}
                </span>
              </div>

              {/* AI Status */}
              <Badge variant="outline" className="bg-violet-500/10 border-violet-500/30 text-violet-400 text-[10px]">
                <Sparkles className="h-2.5 w-2.5 mr-1" />
                Nova AI {isRtl ? "نشط" : "Active"}
              </Badge>

              <Separator orientation="vertical" className="h-6" />

              {/* Command Palette */}
              <CommandPalette language={isRtl ? "ar" : "en"} />

              {/* Notifications */}
              <Button
                size="icon"
                variant="ghost"
                className="relative"
                data-testid="header-notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
              </Button>

              {/* Quick Actions */}
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </header>

          {/* Owner Status Bar - Only for Owner */}
          {userContext.isOwner && (
            <div className="flex items-center justify-between gap-4 px-4 py-2 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-red-500/5 border-b border-amber-500/20">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-400">
                    {isRtl ? "وضع المالك السيادي" : "Sovereign Owner Mode"}
                  </span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-green-400" />
                  <span className="text-[10px] text-muted-foreground">
                    {isRtl ? "جميع الصلاحيات مفعلة" : "All Permissions Active"}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[9px] h-5 bg-amber-500/10 border-amber-500/30 text-amber-400">
                  <Zap className="h-2.5 w-2.5 mr-1" />
                  {isRtl ? "تحكم كامل" : "Full Control"}
                </Badge>
              </div>
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="p-6">
              {children}
            </div>
          </main>

          {/* Professional Footer */}
          <footer className="border-t bg-gradient-to-r from-muted/30 via-background to-muted/30 py-2 px-4">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>INFERA WebNova v2.0</span>
                <Separator orientation="vertical" className="h-3" />
                <span>{isRtl ? "النظام السيادي الرقمي" : "Sovereign Digital OS"}</span>
              </div>
              <div className="flex items-center gap-4">
                <span>{isRtl ? "آخر تحديث: الآن" : "Last sync: Just now"}</span>
                <Separator orientation="vertical" className="h-3" />
                <span>© {new Date().getFullYear()} INFERA Engine</span>
              </div>
            </div>
          </footer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

// ==================== OWNER DASHBOARD HEADER ====================

interface OwnerDashboardHeaderProps {
  title: string;
  titleAr: string;
  description?: string;
  descriptionAr?: string;
  badge?: {
    text: string;
    textAr: string;
    variant: "default" | "owner" | "warning" | "success";
  };
  actions?: ReactNode;
}

export function OwnerDashboardHeader({
  title,
  titleAr,
  description,
  descriptionAr,
  badge,
  actions,
}: OwnerDashboardHeaderProps) {
  const { isRtl } = useLanguage();

  const getBadgeClass = (variant: string) => {
    switch (variant) {
      case "owner": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "warning": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "success": return "bg-green-500/20 text-green-400 border-green-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">
            {isRtl ? titleAr : title}
          </h1>
          {badge && (
            <Badge variant="outline" className={getBadgeClass(badge.variant)}>
              {isRtl ? badge.textAr : badge.text}
            </Badge>
          )}
        </div>
        {(description || descriptionAr) && (
          <p className="text-sm text-muted-foreground">
            {isRtl ? descriptionAr : description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

// ==================== OWNER STAT CARD ====================

interface OwnerStatCardProps {
  title: string;
  titleAr: string;
  value: string | number;
  change?: {
    value: string;
    type: "increase" | "decrease" | "neutral";
  };
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}

export function OwnerStatCard({
  title,
  titleAr,
  value,
  change,
  icon: Icon,
  gradient,
}: OwnerStatCardProps) {
  const { isRtl } = useLanguage();

  const getChangeColor = (type: string) => {
    switch (type) {
      case "increase": return "text-green-400";
      case "decrease": return "text-red-400";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className={`p-4 rounded-xl bg-gradient-to-br ${gradient} border border-border/50`}>
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-lg bg-background/50">
          <Icon className="h-5 w-5" />
        </div>
        {change && (
          <span className={`text-xs font-medium ${getChangeColor(change.type)}`}>
            {change.value}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">
          {isRtl ? titleAr : title}
        </p>
      </div>
    </div>
  );
}
