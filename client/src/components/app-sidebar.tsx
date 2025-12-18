import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  FolderOpen, 
  LayoutTemplate, 
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
    { title: language === "ar" ? "بيئة التطوير" : "Cloud IDE", url: "/ide", icon: Terminal, testId: "nav-cloud-ide" },
    { title: language === "ar" ? "منشئ التطبيقات" : "AI App Builder", url: "/ai-builder", icon: Sparkles, testId: "nav-ai-builder" },
    { title: language === "ar" ? "مولّد المنصات" : "Platform Generator", url: "/platform-generator", icon: TrendingUp, testId: "nav-platform-generator" },
    { title: language === "ar" ? "القوالب" : "Templates", url: "/templates", icon: LayoutTemplate, testId: "nav-templates" },
    { title: language === "ar" ? "منشئ الروبوتات" : "Chatbot Builder", url: "/chatbot-builder", icon: Bot, testId: "nav-chatbot" },
  ];

  const managementItems = [
    { title: language === "ar" ? "المشاريع" : "Projects", url: "/projects", icon: FolderOpen, testId: "nav-projects" },
    { title: language === "ar" ? "النطاقات" : "Domains", url: "/domains", icon: Globe, testId: "nav-domains", requiresAuth: true },
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
                        <SidebarMenuButton asChild isActive={location === "/payments"}>
                          <Link href="/payments" data-testid="nav-payments">
                            <CreditCard className="h-4 w-4 text-green-500" />
                            <span>{language === "ar" ? "لوحة الدفع" : "Payments"}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </>
                  )}
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
