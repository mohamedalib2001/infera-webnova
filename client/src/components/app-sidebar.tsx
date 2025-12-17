import { Link, useLocation } from "wouter";
import { Home, FolderOpen, LayoutTemplate, Settings, Plus, Sparkles, LogIn, LogOut, Crown } from "lucide-react";
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
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";

interface AppSidebarProps {
  side?: "left" | "right";
}

export function AppSidebar({ side = "left" }: AppSidebarProps) {
  const [location] = useLocation();
  const { user, isAuthenticated, logout, isLoggingOut, isSovereign } = useAuth();
  const { t, language } = useLanguage();

  const navItems = [
    { title: t("nav.home"), url: "/", icon: Home, testId: "nav-home" },
    { title: t("nav.projects"), url: "/projects", icon: FolderOpen, testId: "nav-projects" },
    { title: t("nav.templates"), url: "/templates", icon: LayoutTemplate, testId: "nav-templates" },
  ];

  const roleLabels: Record<string, { ar: string; en: string; color: "secondary" | "default" | "destructive" }> = {
    free: { ar: "مجاني", en: "Free", color: "secondary" },
    basic: { ar: "أساسي", en: "Basic", color: "secondary" },
    pro: { ar: "احترافي", en: "Pro", color: "default" },
    enterprise: { ar: "مؤسسي", en: "Enterprise", color: "default" },
    sovereign: { ar: "سيادي", en: "Sovereign", color: "destructive" },
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

  return (
    <Sidebar side={side}>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight">INFERA</span>
            <span className="text-xs text-muted-foreground leading-tight">WebNova</span>
          </div>
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <div className="px-4 mb-4">
            <Link href="/builder">
              <Button className="w-full gap-2" data-testid="button-new-project">
                <Plus className="h-4 w-4" />
                {t("nav.newProject")}
              </Button>
            </Link>
          </div>
          
          <SidebarGroupLabel>
            {language === "ar" ? "التنقل" : "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                  >
                    <Link href={item.url} data-testid={item.testId}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isSovereign && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-amber-600 dark:text-amber-400">
              <Crown className="h-3 w-3 me-1" />
              {language === "ar" ? "لوحة التحكم السيادية" : "Sovereign Dashboard"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/sovereign" data-testid="nav-sovereign">
                      <Settings className="h-4 w-4" />
                      <span>{language === "ar" ? "إدارة المنظومة" : "System Management"}</span>
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
                {getInitials(user.fullName, user.email)}
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
  );
}
