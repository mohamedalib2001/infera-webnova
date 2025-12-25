/**
 * INFERA WebNova - Sovereign Dynamic Sidebar
 * Professional dynamic sidebar with Context Switcher
 * Capability-based menu rendering
 */

import { useState, useMemo } from "react";
import { useLocation, Link } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Crown, ChevronDown, ChevronRight, Lock, Sparkles,
  LogOut, Settings, Bell, Moon, Sun, Globe2,
  type LucideIcon
} from "lucide-react";
import {
  buildSidebar,
  hasCapability,
  getBadgeColor,
  ROLES_REGISTRY,
  PLANS_REGISTRY,
  type UserContext,
  type WorkspaceConfig,
  type MenuItemConfig,
  type SidebarSection,
  type CapabilityId,
} from "@/lib/sovereign-registry";

interface SovereignSidebarProps {
  user: UserContext & {
    fullName?: string;
    avatar?: string;
    email?: string;
  };
  isRtl?: boolean;
  onLogout?: () => void;
  onThemeToggle?: () => void;
  isDark?: boolean;
}

export function SovereignSidebar({
  user,
  isRtl = false,
  onLogout,
  onThemeToggle,
  isDark = false,
}: SovereignSidebarProps) {
  const [location] = useLocation();
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["owner", user.planId]));

  const sidebarData = useMemo(() => buildSidebar(user), [user]);
  
  const activeWorkspace = useMemo(() => {
    if (activeWorkspaceId) {
      return sidebarData.availableWorkspaces.find(w => w.id === activeWorkspaceId) || sidebarData.activeWorkspace;
    }
    return sidebarData.activeWorkspace;
  }, [activeWorkspaceId, sidebarData]);

  const roleConfig = ROLES_REGISTRY[user.role] || ROLES_REGISTRY.free;
  const planConfig = PLANS_REGISTRY[user.planId] || PLANS_REGISTRY.free;

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const isActiveRoute = (route: string) => {
    return location === route || location.startsWith(route + "/");
  };

  const renderMenuItem = (item: MenuItemConfig, locked: boolean = false) => {
    const IconComponent = item.icon;
    const isActive = isActiveRoute(item.route);
    const label = isRtl ? item.labelAr : item.labelEn;

    return (
      <SidebarMenuItem key={item.id}>
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarMenuButton
              asChild={!locked}
              isActive={isActive}
              className={`relative group ${locked ? "opacity-50 cursor-not-allowed" : ""}`}
              data-testid={`sidebar-item-${item.id}`}
            >
              {locked ? (
                <div className="flex items-center gap-3 w-full">
                  <IconComponent className="h-4 w-4 shrink-0" />
                  <span className="truncate flex-1">{label}</span>
                  <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
                </div>
              ) : (
                <Link href={item.route}>
                  <IconComponent className="h-4 w-4 shrink-0" />
                  <span className="truncate flex-1">{label}</span>
                  {item.badge && (
                    <Badge
                      variant="outline"
                      className={`text-[9px] h-4 shrink-0 ${getBadgeColor(item.badge.variant)}`}
                    >
                      {isRtl ? item.badge.textAr : item.badge.textEn}
                    </Badge>
                  )}
                </Link>
              )}
            </SidebarMenuButton>
          </TooltipTrigger>
          {locked && (
            <TooltipContent side={isRtl ? "left" : "right"}>
              <p className="text-xs">
                {isRtl ? "قم بالترقية للوصول" : "Upgrade to access"}
              </p>
            </TooltipContent>
          )}
        </Tooltip>
      </SidebarMenuItem>
    );
  };

  const renderSection = (section: SidebarSection) => {
    const { workspace, items } = section;
    const isExpanded = expandedGroups.has(workspace.id);
    const WorkspaceIcon = workspace.icon;

    return (
      <SidebarGroup key={workspace.id} className="py-2">
        <SidebarGroupLabel
          onClick={() => toggleGroup(workspace.id)}
          className={`flex items-center justify-between gap-2 cursor-pointer hover:bg-muted/50 rounded-md px-2 py-1.5 transition-colors`}
          data-testid={`sidebar-group-${workspace.id}`}
        >
          <div className="flex items-center gap-2">
            <div className={`p-1 rounded bg-gradient-to-br ${workspace.gradient}`}>
              <WorkspaceIcon className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs font-semibold">
              {isRtl ? workspace.labelAr : workspace.labelEn}
            </span>
          </div>
          {isExpanded ? (
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
          )}
        </SidebarGroupLabel>
        
        {isExpanded && (
          <SidebarGroupContent className="mt-1">
            <SidebarMenu>
              {items.map(item => {
                const hasAccess = hasCapability(user, item.capability);
                return renderMenuItem(item, !hasAccess);
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        )}
      </SidebarGroup>
    );
  };

  return (
    <Sidebar
      side={isRtl ? "right" : "left"}
      className="border-r border-border/50"
    >
      {/* Header with User Profile & Context Switcher */}
      <SidebarHeader className="border-b border-border/50 p-4">
        {/* User Profile */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <Avatar className="h-10 w-10 border-2 border-amber-400/50">
              <AvatarImage src={user.avatar} alt={user.fullName} />
              <AvatarFallback className="bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white text-sm font-bold">
                {user.fullName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            {user.isOwner && (
              <div className="absolute -top-1 -right-1 p-0.5 rounded-full bg-amber-500">
                <Crown className="h-2.5 w-2.5 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user.fullName || "User"}</p>
            <div className="flex items-center gap-1.5">
              <Badge
                variant="outline"
                className={`text-[9px] h-4 ${
                  user.isOwner
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                    : `bg-${roleConfig.color}-500/20 text-${roleConfig.color}-400 border-${roleConfig.color}-500/30`
                }`}
              >
                {user.isOwner ? (
                  <>
                    <Crown className="h-2.5 w-2.5 mr-0.5" />
                    {isRtl ? "المالك" : "Owner"}
                  </>
                ) : (
                  isRtl ? roleConfig.labelAr : roleConfig.labelEn
                )}
              </Badge>
              <Badge
                variant="outline"
                className={`text-[9px] h-4 bg-${planConfig.color}-500/20 text-${planConfig.color}-400 border-${planConfig.color}-500/30`}
              >
                {isRtl ? planConfig.nameAr : planConfig.name}
              </Badge>
            </div>
          </div>
        </div>

        {/* Context Switcher - Only for users who can switch */}
        {sidebarData.canSwitchContext && sidebarData.availableWorkspaces.length > 1 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between h-9 px-3 bg-gradient-to-r from-muted/50 to-muted/30 border-border/50"
                data-testid="context-switcher"
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded bg-gradient-to-br ${activeWorkspace.gradient}`}>
                    <activeWorkspace.icon className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-xs font-medium truncate">
                    {isRtl ? activeWorkspace.labelAr : activeWorkspace.labelEn}
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRtl ? "end" : "start"} className="w-56">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                {isRtl ? "تبديل مساحة العمل" : "Switch Workspace"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {sidebarData.availableWorkspaces.map(ws => (
                <DropdownMenuItem
                  key={ws.id}
                  onClick={() => setActiveWorkspaceId(ws.id)}
                  className={`flex items-center gap-2 ${activeWorkspace.id === ws.id ? "bg-accent" : ""}`}
                  data-testid={`switch-workspace-${ws.id}`}
                >
                  <div className={`p-1 rounded bg-gradient-to-br ${ws.gradient}`}>
                    <ws.icon className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm">
                    {isRtl ? ws.labelAr : ws.labelEn}
                  </span>
                  {activeWorkspace.id === ws.id && (
                    <Sparkles className="h-3 w-3 text-amber-400 ml-auto" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarHeader>

      {/* Main Content - Dynamic Sections */}
      <SidebarContent>
        <ScrollArea className="h-full px-2">
          {sidebarData.sections.map(renderSection)}
        </ScrollArea>
      </SidebarContent>

      {/* Footer with Quick Actions */}
      <SidebarFooter className="border-t border-border/50 p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onThemeToggle}
                  className="h-8 w-8"
                  data-testid="theme-toggle"
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isRtl ? (isDark ? "الوضع الفاتح" : "الوضع الداكن") : (isDark ? "Light Mode" : "Dark Mode")}
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 relative"
                  data-testid="notifications-btn"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isRtl ? "الإشعارات" : "Notifications"}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  data-testid="language-btn"
                >
                  <Globe2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isRtl ? "اللغة" : "Language"}
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  asChild
                  data-testid="settings-btn"
                >
                  <Link href="/settings">
                    <Settings className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isRtl ? "الإعدادات" : "Settings"}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onLogout}
                  className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  data-testid="logout-btn"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isRtl ? "تسجيل الخروج" : "Logout"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

// ==================== BREADCRUMB COMPONENT ====================

interface BreadcrumbProps {
  workspace: WorkspaceConfig;
  currentPath: string;
  isRtl?: boolean;
}

export function SovereignBreadcrumb({ workspace, currentPath, isRtl = false }: BreadcrumbProps) {
  const pathSegments = currentPath.split("/").filter(Boolean);
  
  return (
    <nav className="flex items-center gap-2 text-sm" data-testid="breadcrumb">
      <div className="flex items-center gap-1.5">
        <div className={`p-1 rounded bg-gradient-to-br ${workspace.gradient}`}>
          <workspace.icon className="h-3 w-3 text-white" />
        </div>
        <span className="font-medium text-muted-foreground">
          {isRtl ? workspace.labelAr : workspace.labelEn}
        </span>
      </div>
      {pathSegments.map((segment, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
          <span className={idx === pathSegments.length - 1 ? "font-medium" : "text-muted-foreground"}>
            {segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")}
          </span>
        </div>
      ))}
    </nav>
  );
}

// ==================== UPGRADE CTA COMPONENT ====================

interface UpgradeCtaProps {
  feature: string;
  requiredPlan: string;
  isRtl?: boolean;
  onUpgrade?: () => void;
}

export function UpgradeCta({ feature, requiredPlan, isRtl = false, onUpgrade }: UpgradeCtaProps) {
  const planConfig = PLANS_REGISTRY[requiredPlan] || PLANS_REGISTRY.pro;
  
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20">
      <div className="flex items-center gap-2">
        <Lock className="h-4 w-4 text-violet-400" />
        <div>
          <p className="text-sm font-medium">
            {isRtl ? `${feature} - ميزة مقفلة` : `${feature} - Locked Feature`}
          </p>
          <p className="text-xs text-muted-foreground">
            {isRtl
              ? `مطلوب باقة ${planConfig.nameAr}`
              : `Requires ${planConfig.name} plan`}
          </p>
        </div>
      </div>
      <Button
        size="sm"
        onClick={onUpgrade}
        className="bg-gradient-to-r from-violet-600 to-fuchsia-600"
        data-testid="upgrade-cta"
      >
        {isRtl ? "ترقية" : "Upgrade"}
      </Button>
    </div>
  );
}
