import { useState } from "react";
import { Link, useLocation } from "wouter";
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
  Sparkles, 
  Terminal,
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
  ServerCog,
  GitBranch,
  TestTube2,
  Store,
  Users,
  ShieldCheck,
  Mail,
  SquareTerminal,
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
} from "lucide-react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { NewPlatformModal, useNewPlatformModal } from "@/components/new-platform-modal";

interface AppSidebarProps {
  side?: "left" | "right";
}

export function AppSidebar({ side = "left" }: AppSidebarProps) {
  const [location, navigate] = useLocation();
  const { user, isAuthenticated, logout, isLoggingOut, isSovereign } = useAuth();
  const { t, language } = useLanguage();
  const { isOpen, setIsOpen, openModal } = useNewPlatformModal();
  const [growthExpanded, setGrowthExpanded] = useState(false);

  const isOwner = user?.role === "owner";
  const isAdvancedUser = user?.role === "enterprise" || user?.role === "sovereign" || isOwner;

  const buildItems = [
    { title: language === "ar" ? "الرئيسية" : "Home", url: "/", icon: Home, testId: "nav-home" },
    { title: language === "ar" ? "وحدة التحكم" : "Console", url: "/console", icon: SquareTerminal, testId: "nav-console" },
    { title: language === "ar" ? "بيئة التطوير" : "Cloud IDE", url: "/ide", icon: Terminal, testId: "nav-cloud-ide" },
    { title: language === "ar" ? "منشئ التطبيقات" : "AI App Builder", url: "/ai-builder", icon: Sparkles, testId: "nav-ai-builder" },
    { title: language === "ar" ? "الاقتراحات الذكية" : "Smart Suggestions", url: "/smart-suggestions", icon: Lightbulb, testId: "nav-smart-suggestions" },
    { title: language === "ar" ? "النشر بنقرة" : "One-Click Deploy", url: "/deploy", icon: Rocket, testId: "nav-deploy" },
    { title: language === "ar" ? "شهادات SSL" : "SSL Certificates", url: "/ssl", icon: ShieldCheck, testId: "nav-ssl" },
    { title: language === "ar" ? "مولّد الباك إند" : "Backend Generator", url: "/backend-generator", icon: ServerCog, testId: "nav-backend-generator" },
    { title: language === "ar" ? "التحكم بالإصدارات" : "Version Control", url: "/git", icon: GitBranch, testId: "nav-git" },
    { title: language === "ar" ? "مساعد AI Copilot" : "AI Copilot", url: "/ai-copilot", icon: Brain, testId: "nav-copilot" },
    { title: language === "ar" ? "مولّد الاختبارات" : "Testing Generator", url: "/testing", icon: TestTube2, testId: "nav-testing" },
    { title: language === "ar" ? "سوق الإضافات" : "Marketplace", url: "/marketplace", icon: Store, testId: "nav-marketplace" },
    { title: language === "ar" ? "التعاون الجماعي" : "Collaboration", url: "/collaboration", icon: Users, testId: "nav-collaboration" },
    { title: language === "ar" ? "مولّد المنصات" : "Platform Generator", url: "/platform-generator", icon: TrendingUp, testId: "nav-platform-generator" },
    { title: language === "ar" ? "القوالب" : "Templates", url: "/templates", icon: LayoutTemplate, testId: "nav-templates" },
    { title: language === "ar" ? "منشئ الروبوتات" : "Chatbot Builder", url: "/chatbot-builder", icon: Bot, testId: "nav-chatbot" },
  ];

  const managementItems = [
    { title: language === "ar" ? "المشاريع" : "Projects", url: "/projects", icon: FolderOpen, testId: "nav-projects" },
    { title: language === "ar" ? "مهامي" : "My Tasks", url: "/employee-dashboard", icon: Briefcase, testId: "nav-employee-dashboard", requiresAuth: true },
    { title: language === "ar" ? "النطاقات" : "Domains", url: "/domains", icon: Globe, testId: "nav-domains", requiresAuth: true },
    { title: language === "ar" ? "الدعم" : "Support", url: "/support", icon: Headphones, testId: "nav-support", requiresAuth: true },
    { title: language === "ar" ? "الإعدادات" : "Settings", url: "/settings", icon: Settings, testId: "nav-settings", requiresAuth: true },
  ];

  const growthItems = [
    { title: language === "ar" ? "محسّن SEO" : "SEO Optimizer", url: "/seo-optimizer", icon: Search, testId: "nav-seo" },
    { title: language === "ar" ? "التحليلات" : "Analytics", url: "/analytics", icon: BarChart3, testId: "nav-analytics" },
    { title: language === "ar" ? "التسويق" : "Marketing", url: "/marketing", icon: Megaphone, testId: "nav-marketing" },
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
      navigate("/builder");
    }
  };

  const handleConfirmNewPlatform = () => {
    navigate("/builder");
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
            <img 
              src="/assets/infera-logo.png" 
              alt="INFERA WebNova" 
              className="w-8 h-8 object-contain"
            />
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight">INFERA</span>
              <span className="text-xs text-muted-foreground leading-tight">WebNova</span>
            </div>
          </Link>
        </SidebarHeader>
        
        <SidebarContent>
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

          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-1">
              <Wrench className="h-3 w-3" />
              {language === "ar" ? "البناء" : "Build"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {renderNavItems(buildItems)}
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-1">
              <Settings className="h-3 w-3" />
              {language === "ar" ? "الإدارة" : "Management"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {renderNavItems(managementItems)}
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <Collapsible open={growthExpanded} onOpenChange={setGrowthExpanded}>
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="flex items-center gap-1 cursor-pointer w-full justify-between pr-2">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {language === "ar" ? "النمو" : "Growth"}
                  </span>
                  {growthExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  {renderNavItems(growthItems)}
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>

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

          {isAdvancedUser && (
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

          {(isSovereign || isOwner) && (
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
                        <SidebarMenuButton asChild isActive={location === "/owner"}>
                          <Link href="/owner" data-testid="nav-owner">
                            <Crown className="h-4 w-4 text-amber-500" />
                            <span>{language === "ar" ? "لوحة تحكم المالك" : "Owner Dashboard"}</span>
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
                        <SidebarMenuButton asChild isActive={location === "/departments"}>
                          <Link href="/departments" data-testid="nav-departments">
                            <Building2 className="h-4 w-4 text-blue-500" />
                            <span>{language === "ar" ? "الأقسام" : "Departments"}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={location === "/tasks"}>
                          <Link href="/tasks" data-testid="nav-tasks">
                            <ListTodo className="h-4 w-4 text-green-500" />
                            <span>{language === "ar" ? "المهام" : "Tasks"}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={location === "/payments"}>
                          <Link href="/payments" data-testid="nav-payments">
                            <CreditCard className="h-4 w-4 text-green-500" />
                            <span>{language === "ar" ? "لوحة الدفع" : "Payments"}</span>
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
                        <SidebarMenuButton asChild isActive={location === "/owner/infrastructure"}>
                          <Link href="/owner/infrastructure" data-testid="nav-owner-infrastructure">
                            <Server className="h-4 w-4 text-blue-500" />
                            <span>{language === "ar" ? "البنية التحتية" : "Infrastructure"}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={location === "/owner/integrations"}>
                          <Link href="/owner/integrations" data-testid="nav-owner-integrations">
                            <Link2 className="h-4 w-4 text-orange-500" />
                            <span>{language === "ar" ? "بوابة التكامل" : "Integration Gateway"}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={location === "/owner/notifications"}>
                          <Link href="/owner/notifications" data-testid="nav-owner-notifications">
                            <Bell className="h-4 w-4 text-yellow-500" />
                            <span>{language === "ar" ? "الإشعارات" : "Notifications"}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={location === "/owner/ai-sovereignty"}>
                          <Link href="/owner/ai-sovereignty" data-testid="nav-owner-ai-sovereignty">
                            <Brain className="h-4 w-4 text-purple-500" />
                            <span>{language === "ar" ? "سيادة الذكاء" : "AI Sovereignty"}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={location === "/owner/ai-settings"}>
                          <Link href="/owner/ai-settings" data-testid="nav-owner-ai-settings">
                            <Key className="h-4 w-4 text-amber-500" />
                            <span>{language === "ar" ? "مفاتيح AI" : "AI Keys"}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={location === "/owner/ai-model-registry"}>
                          <Link href="/owner/ai-model-registry" data-testid="nav-owner-ai-model-registry">
                            <Bot className="h-4 w-4 text-violet-500" />
                            <span>{language === "ar" ? "سجل النماذج" : "Model Registry"}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={location === "/admin/subscriptions"}>
                          <Link href="/admin/subscriptions" data-testid="nav-admin-subscriptions">
                            <Package className="h-4 w-4 text-blue-500" />
                            <span>{language === "ar" ? "إدارة الاشتراكات" : "Subscriptions Manager"}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={location === "/owner/email-settings"}>
                          <Link href="/owner/email-settings" data-testid="nav-owner-email-settings">
                            <Mail className="h-4 w-4 text-teal-500" />
                            <span>{language === "ar" ? "إعدادات البريد" : "Email Settings"}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={location === "/owner/deletion-management"}>
                          <Link href="/owner/deletion-management" data-testid="nav-owner-deletion-management">
                            <Trash2 className="h-4 w-4 text-red-500" />
                            <span>{language === "ar" ? "إدارة المحذوفات" : "Deletion Management"}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={location === "/support/agent"}>
                          <Link href="/support/agent" data-testid="nav-support-agent">
                            <Headphones className="h-4 w-4 text-green-500" />
                            <span>{language === "ar" ? "لوحة الدعم" : "Support Dashboard"}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={location === "/support/command-center"}>
                          <Link href="/support/command-center" data-testid="nav-command-center">
                            <Headphones className="h-4 w-4 text-cyan-500" />
                            <span>{language === "ar" ? "مركز القيادة" : "Command Center"}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {(isOwner || isSovereign) && (
            <SidebarGroup>
              <SidebarGroupLabel className="text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                <Crown className="h-3 w-3" />
                {language === "ar" ? "القيادة السيادية" : "Sovereign Command"}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location === "/owner/isds"}>
                      <Link href="/owner/isds" data-testid="nav-owner-isds">
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
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location === "/owner/quality"}>
                      <Link href="/owner/quality" data-testid="nav-owner-quality">
                        <Scale className="h-4 w-4 text-green-500" />
                        <span>{language === "ar" ? "ضمان الجودة" : "Quality Assurance"}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location === "/owner/sidebar-manager"}>
                      <Link href="/owner/sidebar-manager" data-testid="nav-sidebar-manager">
                        <LayoutDashboard className="h-4 w-4 text-cyan-500" />
                        <span>{language === "ar" ? "إدارة الصفحات" : "Sidebar Manager"}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location === "/sovereign-chat"}>
                      <Link href="/sovereign-chat" data-testid="nav-sovereign-chat">
                        <MessageSquare className="h-4 w-4 text-violet-500" />
                        <span>{language === "ar" ? "المساعدون السياديون" : "Sovereign Chat"}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location === "/sovereign/command-center"}>
                      <Link href="/sovereign/command-center" data-testid="nav-sovereign-command">
                        <Crown className="h-4 w-4 text-amber-500" />
                        <span>{language === "ar" ? "مركز القيادة" : "Command Center"}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location === "/sovereign/ai-governance"}>
                      <Link href="/sovereign/ai-governance" data-testid="nav-ai-governance">
                        <Brain className="h-4 w-4 text-violet-500" />
                        <span>{language === "ar" ? "حوكمة AI" : "AI Governance"}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location === "/sovereign/digital-borders"}>
                      <Link href="/sovereign/digital-borders" data-testid="nav-digital-borders">
                        <Globe className="h-4 w-4 text-cyan-500" />
                        <span>{language === "ar" ? "الحدود الرقمية" : "Digital Borders"}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location === "/sovereign/policy-engine"}>
                      <Link href="/sovereign/policy-engine" data-testid="nav-policy-engine">
                        <Gavel className="h-4 w-4 text-amber-500" />
                        <span>{language === "ar" ? "محرك السياسات" : "Policy Engine"}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location === "/sovereign/trust-compliance"}>
                      <Link href="/sovereign/trust-compliance" data-testid="nav-trust-compliance">
                        <Scale className="h-4 w-4 text-emerald-500" />
                        <span>{language === "ar" ? "الثقة والامتثال" : "Trust & Compliance"}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location === "/sovereign/strategic-forecast"}>
                      <Link href="/sovereign/strategic-forecast" data-testid="nav-strategic-forecast">
                        <LineChart className="h-4 w-4 text-purple-500" />
                        <span>{language === "ar" ? "التنبؤ الاستراتيجي" : "Strategic Forecast"}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {isOwner && (
            <SidebarGroup>
              <SidebarGroupLabel className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Users className="h-3 w-3" />
                {language === "ar" ? "الموارد البشرية" : "Human Resources"}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location === "/departments"}>
                      <Link href="/departments" data-testid="nav-departments">
                        <Building2 className="h-4 w-4 text-blue-500" />
                        <span>{language === "ar" ? "الأقسام" : "Departments"}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location === "/tasks"}>
                      <Link href="/tasks" data-testid="nav-tasks">
                        <ListTodo className="h-4 w-4 text-green-500" />
                        <span>{language === "ar" ? "المهام" : "Tasks"}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
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
    </>
  );
}
