import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { LanguageProvider, useLanguage } from "@/hooks/use-language";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Home from "@/pages/home";
import Auth from "@/pages/auth";
import Builder from "@/pages/builder";
import Projects from "@/pages/projects";
import Templates from "@/pages/templates";
import Preview from "@/pages/preview";
import Pricing from "@/pages/pricing";
import Sovereign from "@/pages/sovereign";
import ChatbotBuilder from "@/pages/chatbot-builder";
import Analytics from "@/pages/analytics";
import SEOOptimizer from "@/pages/seo-optimizer";
import WhiteLabel from "@/pages/white-label";
import OwnerDashboard from "@/pages/owner-dashboard";
import AiAppBuilder from "@/pages/ai-app-builder";
import IDEProjects from "@/pages/ide-projects";
import CloudIDE from "@/pages/cloud-ide";
import SovereignControlCenter from "@/pages/sovereign-control-center";
import Domains from "@/pages/domains";
import Settings from "@/pages/settings";
import PlatformGenerator from "@/pages/platform-generator";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/builder" component={Builder} />
      <Route path="/builder/:id" component={Builder} />
      <Route path="/projects" component={Projects} />
      <Route path="/templates" component={Templates} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/sovereign" component={Sovereign} />
      <Route path="/chatbot-builder" component={ChatbotBuilder} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/seo-optimizer" component={SEOOptimizer} />
      <Route path="/white-label" component={WhiteLabel} />
      <Route path="/owner" component={OwnerDashboard} />
      <Route path="/ai-builder" component={AiAppBuilder} />
      <Route path="/ide" component={IDEProjects} />
      <Route path="/ide/:id" component={CloudIDE} />
      <Route path="/sovereign-control" component={SovereignControlCenter} />
      <Route path="/domains" component={Domains} />
      <Route path="/settings" component={Settings} />
      <Route path="/platform-generator" component={PlatformGenerator} />
      <Route path="/preview/:shareCode" component={Preview} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { isRtl } = useLanguage();
  
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AppSidebar side={isRtl ? "right" : "left"} />
          <div className="flex flex-col flex-1 min-w-0">
            <header className="flex items-center justify-between gap-2 p-3 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div className="flex items-center gap-2">
                <LanguageToggle />
                <ThemeToggle />
              </div>
            </header>
            <main className="flex-1 overflow-auto">
              <Router />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <TooltipProvider>
            <AppContent />
            <Toaster />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
