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

const navItems = [
  { title: "الرئيسية", titleEn: "Home", url: "/", icon: Home },
  { title: "مشاريعي", titleEn: "My Projects", url: "/projects", icon: FolderOpen },
  { title: "القوالب", titleEn: "Templates", url: "/templates", icon: LayoutTemplate },
];

const roleLabels: Record<string, { ar: string; en: string; color: string }> = {
  free: { ar: "مجاني", en: "Free", color: "secondary" },
  basic: { ar: "أساسي", en: "Basic", color: "secondary" },
  pro: { ar: "احترافي", en: "Pro", color: "default" },
  enterprise: { ar: "مؤسسي", en: "Enterprise", color: "default" },
  sovereign: { ar: "سيادي", en: "Sovereign", color: "destructive" },
};

export function AppSidebar() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout, isLoggingOut, isSovereign } = useAuth();

  const getInitials = (name?: string | null, email?: string) => {
    if (name) return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    if (email) return email.slice(0, 2).toUpperCase();
    return "U";
  };

  return (
    <Sidebar>
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
                مشروع جديد
              </Button>
            </Link>
          </div>
          
          <SidebarGroupLabel>التنقل</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                  >
                    <Link href={item.url} data-testid={`nav-${item.titleEn.toLowerCase().replace(" ", "-")}`}>
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
              <Crown className="h-3 w-3 ml-1" />
              لوحة التحكم السيادية
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/sovereign" data-testid="nav-sovereign">
                      <Settings className="h-4 w-4" />
                      <span>إدارة المنظومة</span>
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
              <Badge variant={roleLabels[user.role]?.color as "secondary" | "default" | "destructive" || "secondary"} className="text-xs">
                {roleLabels[user.role]?.ar || user.role}
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
              تسجيل الدخول
            </Button>
          </Link>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
