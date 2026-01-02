import { useState, useEffect, lazy, Suspense } from "react";
import { Link, useLocation } from "wouter";
import ownerDefaultAvatar from "@assets/unnamed_1766659248817.jpg";
import { 
  Home, 
  FolderOpen, 
  LayoutTemplate, 
  LayoutDashboard,
  Settings, 
  Plus, 
  LogIn, 
  LogOut, 
  Crown, 
  CreditCard, 
  Bot, 
  BarChart3, 
  Search, 
  Paintbrush, 
  Globe,
  TrendingUp,
  Megaphone,
  Shield,
  Wrench,
  ChevronDown,
  ChevronRight,
  Key,
  Receipt,
  Plug,
  Server,
  Link2,
  Bell,
  Brain,
  Lightbulb,
  Rocket,
  TestTube2,
  Store,
  Users,
  ShieldCheck,
  Mail,
  Headphones,
  Scale,
  Gavel,
  LineChart,
  Landmark,
  Package,
  Trash2,
  Code,
  MessageSquare,
  Lock,
  Building2,
  ListTodo,
  Briefcase,
  Smartphone,
  Monitor,
  Workflow,
  Cpu,
  MapPin,
  Network,
  Github,
  Blocks,
  GraduationCap,
  Clock,
  FileText,
  Hotel,
  Eye,
  FileUser,
  Award,
  Presentation,
  UserCircle,
  Hammer,
  UserCheck,
  UsersRound,
  BadgeDollarSign,
  Hexagon,
  Activity,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { SidebarItemBadge } from "@/components/sovereign-view";
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
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { NewPlatformModal, useNewPlatformModal } from "@/components/new-platform-modal";

// Lazy load heartbeat components for better initial load performance
const PlatformHeartbeat = lazy(() => import("@/components/platform-heartbeat").then(m => ({ default: m.PlatformHeartbeat })));
const AIIntelligenceHeartbeat = lazy(() => import("@/components/ai-intelligence-heartbeat").then(m => ({ default: m.AIIntelligenceHeartbeat })));

type AudienceTab = "all" | "owner" | "visitors" | "employees" | "managers" | "subscribers" | "development";

interface AppSidebarProps {
  side?: "left" | "right";
}

export function AppSidebar({ side = "left" }: AppSidebarProps) {
  const [location, navigate] = useLocation();
  const { user, isAuthenticated, logout, isLoggingOut, isSovereign } = useAuth();
  const { t, language } = useLanguage();
  const { isOpen, setIsOpen, openModal } = useNewPlatformModal();
  const isOwner = user?.role === "owner";
  
  // Default to "owner" filter for owners, "all" for others
  const [activeTab, setActiveTab] = useState<AudienceTab>(isOwner ? "owner" : "all");
  const [showZoneWarning, setShowZoneWarning] = useState(false);
  const [currentZone, setCurrentZone] = useState<string>("");
  const isAdvancedUser = user?.role === "enterprise" || user?.role === "sovereign" || isOwner;
  
  // Zone warning toggle - stored in localStorage
  const [zoneWarningEnabled, setZoneWarningEnabled] = useState(() => {
    const stored = localStorage.getItem("sovereignZoneWarningEnabled");
    return stored === null ? true : stored === "true";
  });
  
  const toggleZoneWarning = () => {
    const newValue = !zoneWarningEnabled;
    setZoneWarningEnabled(newValue);
    localStorage.setItem("sovereignZoneWarningEnabled", String(newValue));
  };

  // Define sovereign safe zone routes - الصفحات السيادية المحمية
  const sovereignSafeZoneRoutes = [
    "/owner", "/sovereign", "/sovereign-workspace", "/isds",
    "/owner/spom", "/owner/dynamic-control", "/owner/nova-permissions",
    "/owner/ai-capability-control", "/owner/assistant-governance", "/owner/github-import",
    "/api-keys", "/ssh-vault", "/github-sync", "/hetzner-cloud"
  ];

  // Check if current route is in sovereign safe zone
  const isInSovereignZone = sovereignSafeZoneRoutes.some(route => location.startsWith(route));

  // Get zone name for display
  const getZoneName = (path: string) => {
    if (path === "/" || path === "/builder") return language === "ar" ? "بناء منصة" : "Build Platform";
    if (path === "/command") return language === "ar" ? "مركز القيادة" : "Command Center";
    if (path.startsWith("/console")) return language === "ar" ? "وحدة التحكم" : "Console";
    if (path.startsWith("/ide")) return language === "ar" ? "بيئة التطوير" : "Cloud IDE";
    if (path.startsWith("/ai-builder")) return language === "ar" ? "منشئ التطبيقات" : "AI App Builder";
    if (path.startsWith("/projects")) return language === "ar" ? "المشاريع" : "Projects";
    if (path.startsWith("/templates")) return language === "ar" ? "القوالب" : "Templates";
    if (path.startsWith("/settings")) return language === "ar" ? "الإعدادات" : "Settings";
        if (path.startsWith("/pricing")) return language === "ar" ? "الأسعار" : "Pricing";
    return path.split("/").pop()?.replace(/-/g, " ") || path;
  };

  // Monitor route changes and show warning when leaving sovereign zone
  // Warning triggers for owner regardless of active tab selection
  const [hasSeenWarning, setHasSeenWarning] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    if (zoneWarningEnabled && isOwner && !isInSovereignZone && !hasSeenWarning.has(location)) {
      setCurrentZone(getZoneName(location));
      setShowZoneWarning(true);
      setHasSeenWarning(prev => new Set(prev).add(location));
    }
  }, [location, isOwner, isInSovereignZone, zoneWarningEnabled]);

  const audienceTabs = [
    { id: "all" as AudienceTab, label: language === "ar" ? "الكل" : "All", icon: LayoutDashboard },
    { id: "owner" as AudienceTab, label: language === "ar" ? "المالك" : "Owner", icon: Crown },
    { id: "visitors" as AudienceTab, label: language === "ar" ? "الزوار" : "Visitors", icon: UserCircle },
    { id: "employees" as AudienceTab, label: language === "ar" ? "الموظفين" : "Employees", icon: UserCheck },
    { id: "managers" as AudienceTab, label: language === "ar" ? "المديرين" : "Managers", icon: UsersRound },
    { id: "subscribers" as AudienceTab, label: language === "ar" ? "المشتركين" : "Subscribers", icon: BadgeDollarSign },
    { id: "development" as AudienceTab, label: language === "ar" ? "التطوير" : "Development", icon: Hammer },
  ];

  // Helper to check if a section should be shown based on audience filter
  const shouldShowSection = (sectionAudience: AudienceTab[]) => {
    if (activeTab === "all") return true;
    if (activeTab === "development") return false; // Development has its own section
    return sectionAudience.includes(activeTab);
  };

  // Owner avatar URL - use real avatar or fallback
  const ownerAvatarUrl = user?.avatar || "https://api.dicebear.com/7.x/initials/svg?seed=" + encodeURIComponent(user?.fullName || user?.username || "Owner");

  const developmentPages = [
    { title: language === "ar" ? "منشئ الروبوتات" : "Chatbot Builder", url: "/chatbot-builder", icon: Bot, testId: "nav-dev-chatbot" },
    { title: language === "ar" ? "القوالب" : "Templates", url: "/templates", icon: LayoutTemplate, testId: "nav-dev-templates" },
    { title: language === "ar" ? "لوحة Nova AI" : "Nova AI Dashboard", url: "/nova/dashboard", icon: Brain, testId: "nav-dev-nova-dashboard" },
  ];

  const buildItems = [
    { title: language === "ar" ? "بناء منصة" : "Build Platform", url: "/", icon: Sparkles, testId: "nav-builder", highlight: true },
    { title: language === "ar" ? "مركز القيادة" : "Command Center", url: "/command", icon: Home, testId: "nav-command" },
    { title: language === "ar" ? "النشر بنقرة" : "One-Click Deploy", url: "/deploy", icon: Rocket, testId: "nav-deploy" },
    { title: language === "ar" ? "القوالب" : "Templates", url: "/templates", icon: LayoutTemplate, testId: "nav-templates" },
    { title: language === "ar" ? "منشئ الروبوتات" : "Chatbot Builder", url: "/chatbot-builder", icon: Bot, testId: "nav-chatbot" },
  ];

  const managementItems = [
    { title: language === "ar" ? "المشاريع" : "Projects", url: "/projects", icon: FolderOpen, testId: "nav-projects" },
        { title: language === "ar" ? "الدعم" : "Support", url: "/support", icon: Headphones, testId: "nav-support", requiresAuth: true },
    { title: language === "ar" ? "الإعدادات" : "Settings", url: "/settings", icon: Settings, testId: "nav-settings", requiresAuth: true },
  ];

  
  
  const roleLabels: Record<string, { ar: string; en: string; color: "secondary" | "default" | "destructive" }> = {
    free: { ar: "مجاني", en: "Free", color: "secondary" },
    basic: { ar: "أساسي", en: "Basic", color: "secondary" },
    pro: { ar: "احترافي", en: "Pro", color: "default" },
    enterprise: { ar: "مؤسسي", en: "Enterprise", color: "default" },
    sovereign: { ar: "سيادي", en: "Sovereign", color: "destructive" },
    owner: { ar: "المالك", en: "Owner", color: "destructive" },
  };

  const getInitials = (name?: string | null, email?: string) => {
    if (name) return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    if (email) return email.slice(0, 2).toUpperCase();
    return "U";
  };

  const getRoleLabel = (role: string) => {
    const label = roleLabels[role];
    if (!label) return role;
    return language === "ar" ? label.ar : label.en;
  };

  const handleNewPlatform = () => {
    const shouldShow = openModal();
    if (!shouldShow) {
      navigate("/");
    }
  };

  const handleConfirmNewPlatform = () => {
    navigate("/");
  };

  const renderNavItems = (items: typeof buildItems) => (
    <SidebarMenu>
      {items.map((item) => {
        if ('requiresAuth' in item && item.requiresAuth && !isAuthenticated) return null;
        return (
          <SidebarMenuItem key={item.url}>
            <SidebarMenuButton asChild isActive={location === item.url}>
              <Link href={item.url} data-testid={item.testId}>
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );

  return (
    <>
      <Sidebar side={side}>
        <SidebarHeader className="p-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 via-purple-600 to-amber-500 shadow-lg">
              <Hexagon className="w-5 h-5 text-white fill-white/20" />
              <span className="absolute text-[8px] font-bold text-white">N</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight">INFERA</span>
              <span className="text-xs text-muted-foreground leading-tight">WebNova</span>
            </div>
          </Link>
        </SidebarHeader>
        
        <SidebarContent>
          {isOwner && (
            <div className="px-3 py-3 mb-2 bg-gradient-to-br from-amber-500/10 via-purple-500/10 to-cyan-500/10 border-b border-amber-500/20" data-testid="owner-sovereign-header">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-12 w-12 ring-2 ring-amber-500 ring-offset-2 ring-offset-background">
                    <AvatarImage 
                      src={user?.profileImageUrl || ownerDefaultAvatar} 
                      alt={user?.fullName || "Owner"} 
                    />
                    <AvatarFallback className="bg-gradient-to-br from-amber-500 to-purple-600 text-white font-bold text-lg">
                      {getInitials(user?.fullName, user?.email || undefined)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-0.5">
                    <Crown className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm truncate">{user?.fullName || user?.username}</span>
                    <Shield className="h-3.5 w-3.5 text-amber-500" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0 bg-gradient-to-r from-amber-600 to-purple-600 border-0">
                      {language === "ar" ? "مساحة العمل السيادية" : "Sovereign Workspace"}
                    </Badge>
                    {isInSovereignZone && (
                      <Badge variant="outline" className="text-[9px] px-1 py-0 border-emerald-500 text-emerald-600 dark:text-emerald-400">
                        {language === "ar" ? "آمن" : "Safe"}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Suspense fallback={null}>
                <div className="mt-3 flex flex-col items-center gap-2">
                  <PlatformHeartbeat />
                  <AIIntelligenceHeartbeat />
                </div>
              </Suspense>
            </div>
          )}
          
          {(isOwner || isSovereign) && (
            <div className="px-3 py-2 border-b" data-testid="audience-filter-container">
              <Select value={activeTab} onValueChange={(v) => setActiveTab(v as AudienceTab)}>
                <SelectTrigger className="w-full h-9" data-testid="select-audience-filter">
                  <SelectValue placeholder={language === "ar" ? "اختر العرض" : "Select View"} />
                </SelectTrigger>
                <SelectContent>
                  {audienceTabs.map((tab) => (
                    <SelectItem key={tab.id} value={tab.id} data-testid={`option-${tab.id}`}>
                      <div className="flex items-center gap-2">
                        <tab.icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                        {tab.id === "development" && (
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 ml-2 bg-orange-500/20 text-orange-600 dark:text-orange-400">
                            {developmentPages.length}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {activeTab === "development" && (
            <SidebarGroup>
              <SidebarGroupLabel className="text-orange-600 dark:text-orange-400 flex items-center gap-1">
                <Hammer className="h-3 w-3" />
                {language === "ar" ? "قيد التطوير" : "Under Development"}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {developmentPages.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild isActive={location === item.url}>
                        <Link href={item.url} data-testid={item.testId}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          <Badge variant="secondary" className="ml-auto text-[9px] px-1.5 py-0 bg-orange-500/20 text-orange-600 dark:text-orange-400">
                            {language === "ar" ? "تطوير" : "Dev"}
                          </Badge>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {activeTab !== "development" && (
            <>
              {/* Visitors Section - Limited access for non-subscribers */}
              {activeTab === "visitors" && (
                <SidebarGroup>
                  <SidebarGroupLabel className="flex items-center gap-1">
                    <UserCircle className="h-3 w-3" />
                    {language === "ar" ? "استكشاف" : "Explore"}
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={location === "/"}>
                          <Link href="/" data-testid="nav-visitor-home">
                            <Home className="h-4 w-4" />
                            <span>{language === "ar" ? "الرئيسية" : "Home"}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={location === "/templates"}>
                          <Link href="/templates" data-testid="nav-visitor-templates">
                            <LayoutTemplate className="h-4 w-4" />
                            <span>{language === "ar" ? "معرض القوالب" : "Templates Gallery"}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={location === "/pricing"}>
                          <Link href="/pricing" data-testid="nav-visitor-pricing">
                            <CreditCard className="h-4 w-4" />
                            <span>{language === "ar" ? "الباقات والأسعار" : "Pricing Plans"}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={location === "/support"}>
                          <Link href="/support" data-testid="nav-visitor-support">
                            <Headphones className="h-4 w-4" />
                            <span>{language === "ar" ? "الدعم" : "Support"}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              )}

              {/* New Platform Button - for subscribers and owner only (not visitors) */}
              {shouldShowSection(["all", "subscribers", "owner"]) && activeTab !== "visitors" && (
                <SidebarGroup>
                  <div className="px-4 mb-4">
                    <Button 
                      className="w-full gap-2" 
                      onClick={handleNewPlatform}
                      data-testid="button-new-platform"
                    >
                      <Plus className="h-4 w-4" />
                      {language === "ar" ? "منصة جديدة" : "New Platform"}
                    </Button>
                  </div>
                </SidebarGroup>
              )}

              {/* Build Section - for subscribers and owner only (not visitors) */}
              {shouldShowSection(["all", "subscribers", "owner"]) && activeTab !== "visitors" && (
                <SidebarGroup>
                  <SidebarGroupLabel className="flex items-center gap-1">
                    <Wrench className="h-3 w-3" />
                    {language === "ar" ? "البناء" : "Build"}
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    {renderNavItems(buildItems)}
                  </SidebarGroupContent>
                </SidebarGroup>
              )}

              {/* Management Section - for employees, managers, subscribers and owner (not visitors) */}
              {shouldShowSection(["all", "employees", "managers", "subscribers", "owner"]) && activeTab !== "visitors" && (
                <SidebarGroup>
                  <SidebarGroupLabel className="flex items-center gap-1">
                    <Settings className="h-3 w-3" />
                    {language === "ar" ? "الإدارة" : "Management"}
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    {renderNavItems(managementItems)}
                  </SidebarGroupContent>
                </SidebarGroup>
              )}

              {/* Pricing Section - for subscribers and owner */}
              {shouldShowSection(["all", "subscribers", "owner"]) && (
                <SidebarGroup>
                  <SidebarGroupLabel className="flex items-center gap-1">
                    <CreditCard className="h-3 w-3" />
                    {language === "ar" ? "الباقات" : "Pricing"}
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={location === "/pricing"}>
                          <Link href="/pricing" data-testid="nav-pricing">
                            <CreditCard className="h-4 w-4" />
                            <span>{language === "ar" ? "الأسعار" : "Pricing"}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={location === "/invoices"}>
                          <Link href="/invoices" data-testid="nav-invoices">
                            <Receipt className="h-4 w-4" />
                            <span>{language === "ar" ? "الفواتير" : "Invoices"}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={location === "/subscription"}>
                          <Link href="/subscription" data-testid="nav-subscription">
                            <Crown className="h-4 w-4" />
                            <span>{language === "ar" ? "اشتراكي" : "My Subscription"}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              )}

              {/* Advanced Tools - for owner only */}
              {shouldShowSection(["all", "owner"]) && isAdvancedUser && (
                <SidebarGroup>
                  <SidebarGroupLabel className="text-pink-600 dark:text-pink-400 flex items-center gap-1">
                    <Paintbrush className="h-3 w-3" />
                    {language === "ar" ? "أدوات متقدمة" : "Advanced Tools"}
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={location === "/white-label"}>
                          <Link href="/white-label" data-testid="nav-whitelabel">
                            <Paintbrush className="h-4 w-4" />
                            <span>{language === "ar" ? "العلامة البيضاء" : "White Label"}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              )}

              {/* System Section - for owner only */}
              {shouldShowSection(["all", "owner"]) && (isSovereign || isOwner) && (
                <SidebarGroup>
                  <SidebarGroupLabel className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    {language === "ar" ? "النظام" : "System"}
                  </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {isSovereign && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location === "/sovereign"}>
                        <Link href="/sovereign" data-testid="nav-sovereign">
                          <Settings className="h-4 w-4" />
                          <span>{language === "ar" ? "إدارة المنظومة" : "System Management"}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  {isOwner && (
                    <>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={location === "/sovereign-workspace"}>
                          <Link href="/sovereign-workspace" data-testid="nav-sovereign-workspace">
                            <Shield className="h-4 w-4 text-purple-600" />
                            <span>{language === "ar" ? "مساحة العمل السيادية" : "Sovereign Workspace"}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={location === "/owner"}>
                          <Link href="/owner" data-testid="nav-owner">
                            <Crown className="h-4 w-4 text-amber-500" />
                            <span>{language === "ar" ? "لوحة تحكم المالك" : "Owner Dashboard"}</span>
                            <SidebarItemBadge roles={["owner"]} />
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={location === "/api-keys"}>
                          <Link href="/api-keys" data-testid="nav-api-keys">
                            <Key className="h-4 w-4 text-violet-500" />
                            <span>{language === "ar" ? "مفاتيح API" : "API Keys"}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={location === "/ssh-vault"}>
                          <Link href="/ssh-vault" data-testid="nav-ssh-vault">
                            <Lock className="h-4 w-4 text-amber-500" />
                            <span>{language === "ar" ? "خزنة SSH" : "SSH Vault"}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={location === "/github-sync"}>
                          <Link href="/github-sync" data-testid="nav-github-sync">
                            <Github className="h-4 w-4" />
                            <span>{language === "ar" ? "مزامنة GitHub" : "GitHub Sync"}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={location === "/integrations"}>
                          <Link href="/integrations" data-testid="nav-integrations">
                            <Plug className="h-4 w-4 text-cyan-500" />
                            <span>{language === "ar" ? "التكاملات" : "Integrations"}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={location === "/technical-docs"}>
                          <Link href="/technical-docs" data-testid="nav-technical-docs">
                            <FileText className="h-4 w-4 text-indigo-500" />
                            <span>{language === "ar" ? "التوثيق التقني" : "Technical Docs"}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={location === "/hetzner-cloud"}>
                          <Link href="/hetzner-cloud" data-testid="nav-hetzner-cloud">
                            <Server className="h-4 w-4 text-blue-500" />
                            <span>{language === "ar" ? "سحابة Hetzner" : "Hetzner Cloud"}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={location === "/owner/ai-capability-control"}>
                          <Link href="/owner/ai-capability-control" data-testid="nav-owner-ai-capability-control">
                            <Cpu className="h-4 w-4 text-indigo-500" />
                            <span>{language === "ar" ? "تحكم قدرات AI" : "AI Capability Control"}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={location === "/owner/assistant-governance"}>
                          <Link href="/owner/assistant-governance" data-testid="nav-owner-assistant-governance">
                            <Users className="h-4 w-4 text-cyan-500" />
                            <span>{language === "ar" ? "حوكمة المساعدين" : "Assistant Governance"}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
              )}

              {/* Sovereign Command - for owner only */}
              {shouldShowSection(["all", "owner"]) && (isOwner || isSovereign) && (
                <SidebarGroup>
                  <SidebarGroupLabel className="text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    {language === "ar" ? "القيادة السيادية" : "Sovereign Command"}
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location === "/isds"}>
                      <Link href="/isds" data-testid="nav-isds">
                        <Code className="h-4 w-4 text-emerald-500" />
                        <span>{language === "ar" ? "استوديو التطوير" : "Dev Studio (ISDS)"}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location === "/owner/spom"}>
                      <Link href="/owner/spom" data-testid="nav-owner-spom">
                        <Shield className="h-4 w-4 text-red-500" />
                        <span>{language === "ar" ? "العمليات السيادية" : "SPOM Control"}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
              )}
            </>
          )}
        </SidebarContent>
        
        <SidebarFooter className="p-4">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-pink-500 text-white text-sm">
                  {getInitials(user.fullName, user.email || undefined)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.fullName || user.username}</p>
                <Badge variant={roleLabels[user.role]?.color || "secondary"} className="text-xs">
                  {getRoleLabel(user.role)}
                </Badge>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => logout()}
                disabled={isLoggingOut}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Link href="/auth">
              <Button variant="outline" className="w-full gap-2" data-testid="button-login">
                <LogIn className="h-4 w-4" />
                {t("auth.login")}
              </Button>
            </Link>
          )}
        </SidebarFooter>
      </Sidebar>

      <NewPlatformModal
        open={isOpen}
        onOpenChange={setIsOpen}
        onConfirm={handleConfirmNewPlatform}
        language={language}
      />

      {/* Sovereign Zone Warning Dialog */}
      <AlertDialog open={showZoneWarning} onOpenChange={setShowZoneWarning}>
        <AlertDialogContent className="max-w-md border-amber-500/50 bg-gradient-to-br from-background via-background to-amber-500/5">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-amber-500/20">
                <Shield className="h-6 w-6 text-amber-500" />
              </div>
              <AlertDialogTitle className="text-lg">
                {language === "ar" ? "خارج المنطقة السيادية" : "Outside Sovereign Zone"}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <span className="block text-foreground/80">
                  {language === "ar" 
                    ? `أنت الآن في منطقة "${currentZone}" وهي خارج المساحة السيادية الآمنة المخصصة لك.`
                    : `You are now in the "${currentZone}" zone, which is outside your secure sovereign workspace.`
                  }
                </span>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <Crown className="h-5 w-5 text-amber-500 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    {language === "ar" 
                      ? "للعودة إلى المنطقة الآمنة، انتقل إلى لوحة تحكم المالك أو أي صفحة سيادية."
                      : "To return to the safe zone, navigate to the Owner Dashboard or any sovereign page."
                    }
                  </span>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {/* Toggle to enable/disable zone warnings */}
          <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {language === "ar" ? "تنبيهات خروج المنطقة السيادية" : "Sovereign zone exit alerts"}
              </span>
            </div>
            <Switch 
              checked={zoneWarningEnabled}
              onCheckedChange={toggleZoneWarning}
              data-testid="switch-zone-warning"
            />
          </div>
          
          <AlertDialogFooter className="flex-row gap-2 sm:justify-between">
            <Button 
              variant="outline" 
              onClick={() => setShowZoneWarning(false)}
              className="flex-1"
            >
              {language === "ar" ? "فهمت، استمر" : "Got it, continue"}
            </Button>
            <Button 
              onClick={() => {
                navigate("/owner");
                setShowZoneWarning(false);
              }}
              className="flex-1 bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700"
            >
              <Shield className="h-4 w-4 mr-2" />
              {language === "ar" ? "العودة للمنطقة الآمنة" : "Return to Safe Zone"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
