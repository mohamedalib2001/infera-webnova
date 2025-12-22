import { Link, useLocation } from "wouter";
import { 
  Home, 
  LogIn, 
  CreditCard,
  Headphones,
  Sparkles,
  Cpu,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/use-language";

interface GuestSidebarProps {
  side?: "left" | "right";
}

export function GuestSidebar({ side = "left" }: GuestSidebarProps) {
  const [location] = useLocation();
  const { language } = useLanguage();

  const navItems = [
    { 
      title: language === "ar" ? "الرئيسية" : "Home", 
      url: "/", 
      icon: Home, 
      testId: "nav-home" 
    },
    { 
      title: language === "ar" ? "الميزات" : "Features", 
      url: "/#features", 
      icon: Sparkles, 
      testId: "nav-features" 
    },
    { 
      title: language === "ar" ? "الأسعار" : "Pricing", 
      url: "/pricing", 
      icon: CreditCard, 
      testId: "nav-pricing" 
    },
    { 
      title: language === "ar" ? "الدعم" : "Support", 
      url: "/support", 
      icon: Headphones, 
      testId: "nav-support" 
    },
  ];

  return (
    <Sidebar side={side}>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-white" />
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
            <Link href="/auth">
              <Button className="w-full gap-2" data-testid="button-guest-login">
                <LogIn className="h-4 w-4" />
                {language === "ar" ? "تسجيل الدخول" : "Sign In"}
              </Button>
            </Link>
          </div>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
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
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="rounded-lg bg-gradient-to-r from-violet-600/10 to-cyan-600/10 p-4 border border-violet-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-violet-500" />
            <span className="font-medium text-sm">
              {language === "ar" ? "تجربة مجانية" : "Free Trial"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            {language === "ar" 
              ? "ابدأ ببناء منصتك الرقمية اليوم مجاناً"
              : "Start building your digital platform today for free"}
          </p>
          <Link href="/auth">
            <Button size="sm" className="w-full gap-1" variant="default" data-testid="button-start-trial">
              {language === "ar" ? "ابدأ الآن" : "Get Started"}
            </Button>
          </Link>
        </div>
        
        <div className="mt-4 text-center">
          <Badge variant="outline" className="text-xs">
            {language === "ar" ? "14 يوم تجربة مجانية" : "14-day free trial"}
          </Badge>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
