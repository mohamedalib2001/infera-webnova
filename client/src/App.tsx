import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import { WorkspaceProvider } from "@/lib/workspace-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { LanguageProvider, useLanguage } from "@/hooks/use-language";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { GuestSidebar } from "@/components/guest-sidebar";
import { InspectorProvider, InspectorToggle } from "@/components/owner-inspector";
import { SovereignViewProvider, SovereignViewToggle, SovereignAccessSummary } from "@/components/sovereign-view";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import Home from "@/pages/home";
import Landing from "@/pages/landing";
import Auth from "@/pages/auth";
import Preview from "@/pages/preview";
import Pricing from "@/pages/pricing";
import Sovereign from "@/pages/sovereign";
import NotFound from "@/pages/not-found";
import PaymentSuccess from "@/pages/payment-success";
import PaymentCancel from "@/pages/payment-cancel";
import {
  LazySettings,
  LazySovereignWorkspace,
  LazyNovaAIDashboard,
  LazyNovaChat,
  LazySupport,
  LazySubscription,
  LazyInferaLanding,
  LazyEngineControlLanding,
  LazyEngineLanding,
  LazyFinanceLanding,
  LazyHumanIQLanding,
  LazyLegalLanding,
  LazyAppForgeLanding,
  LazyMarketingLanding,
  LazyMarketplaceLanding,
  LazyEducationLanding,
  LazyAttendLanding,
  LazySmartDocsLanding,
  LazyHospitalityLanding,
  LazyFeasibilityLanding,
  LazyCVBuilderLanding,
  LazyJobsLanding,
  LazyTrainAILanding,
  LazyGlobalCloudLanding,
  LazyShieldGridLanding,
  LazySmartRemoteLanding,
  LazyAbout,
  LazyContact,
  LazyTerms,
  LazyPrivacy,
  LazyRefund,
} from "@/lib/lazy-routes";
import { usePlatformBranding } from "@/hooks/use-platform-branding";
import { CommandPalette } from "@/components/command-palette";
import { NovaAssistantMenu } from "@/components/nova-assistant-menu";
import { NovaFloatingButton } from "@/components/nova-floating-button";
import { SovereignHeaderButton } from "@/components/sovereign-header-button";
import { AIProviderTopbar } from "@/components/ai-provider-topbar";
import { PerformanceTracker } from "@/hooks/use-performance-tracker";

function RedirectToAuth() {
  const [, setLocation] = useLocation();
  const currentPath = window.location.pathname;
  
  if (currentPath !== "/" && currentPath !== "/auth" && currentPath !== "/pricing" && currentPath !== "/support" && !currentPath.startsWith("/preview/")) {
    setLocation(`/auth?redirect=${encodeURIComponent(currentPath)}`);
    return null;
  }
  
  return <Landing />;
}

function GuestRouter() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/auth" component={Auth} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/support" component={LazySupport} />
      <Route path="/preview/:shareCode" component={Preview} />
      <Route component={RedirectToAuth} />
    </Switch>
  );
}

function AuthenticatedRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      
      {/* Platform Landings */}
      <Route path="/infera-group" component={LazyInferaLanding} />
      <Route path="/engine-control" component={LazyEngineControlLanding} />
      <Route path="/engine" component={LazyEngineLanding} />
      <Route path="/finance" component={LazyFinanceLanding} />
      <Route path="/humaniq" component={LazyHumanIQLanding} />
      <Route path="/legal" component={LazyLegalLanding} />
      <Route path="/appforge" component={LazyAppForgeLanding} />
      <Route path="/marketing" component={LazyMarketingLanding} />
      <Route path="/marketplace" component={LazyMarketplaceLanding} />
      <Route path="/education" component={LazyEducationLanding} />
      <Route path="/attend" component={LazyAttendLanding} />
      <Route path="/smartdocs" component={LazySmartDocsLanding} />
      <Route path="/hospitality" component={LazyHospitalityLanding} />
      <Route path="/feasibility" component={LazyFeasibilityLanding} />
      <Route path="/cvbuilder" component={LazyCVBuilderLanding} />
      <Route path="/jobs" component={LazyJobsLanding} />
      <Route path="/trainai" component={LazyTrainAILanding} />
      <Route path="/globalcloud" component={LazyGlobalCloudLanding} />
      <Route path="/shieldgrid" component={LazyShieldGridLanding} />
      <Route path="/smartremote" component={LazySmartRemoteLanding} />
      
      {/* Core Pages */}
      <Route path="/auth" component={Auth} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/sovereign" component={Sovereign} />
      <Route path="/sovereign-workspace" component={LazySovereignWorkspace} />
      <Route path="/settings" component={LazySettings} />
      <Route path="/subscription" component={LazySubscription} />
      <Route path="/support" component={LazySupport} />
      
      {/* Nova AI */}
      <Route path="/nova" component={LazyNovaChat} />
      <Route path="/nova/dashboard" component={LazyNovaAIDashboard} />
      
      {/* Payments */}
      <Route path="/payment/success" component={PaymentSuccess} />
      <Route path="/payment/cancel" component={PaymentCancel} />
      
      {/* Legal Pages */}
      <Route path="/about" component={LazyAbout} />
      <Route path="/contact" component={LazyContact} />
      <Route path="/terms" component={LazyTerms} />
      <Route path="/privacy" component={LazyPrivacy} />
      <Route path="/refund" component={LazyRefund} />
      
      <Route path="/preview/:shareCode" component={Preview} />
      <Route component={NotFound} />
    </Switch>
  );
}

function SovereignAccessSummaryWrapper() {
  const [location] = useLocation();
  return <SovereignAccessSummary currentRoute={location} />;
}

function NotificationBell() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  
  const { data: countData } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/unread-count"],
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  if (!isAuthenticated) return null;

  const unreadCount = countData?.count || 0;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setLocation("/settings")}
      className="relative"
      data-testid="button-notifications"
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </Badge>
      )}
    </Button>
  );
}


function AppContent() {
  const { isRtl } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  
  usePlatformBranding();
  
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <WorkspaceProvider authUser={user} initialRtl={isRtl}>
    <SovereignViewProvider>
    <InspectorProvider>
    <div dir={isRtl ? "rtl" : "ltr"}>
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          {isAuthenticated ? (
            <AppSidebar side={isRtl ? "right" : "left"} />
          ) : (
            <GuestSidebar side={isRtl ? "right" : "left"} />
          )}
          <div className="flex flex-col flex-1 min-w-0">
            <header className="flex items-center justify-between gap-2 p-3 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
              <div className="flex items-center gap-2">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                {isAuthenticated && <CommandPalette language={isRtl ? "ar" : "en"} />}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <AIProviderTopbar />
                <NovaAssistantMenu />
                <SovereignHeaderButton />
                <SovereignViewToggle />
                <InspectorToggle />
                <NotificationBell />
                <LanguageToggle />
                <ThemeToggle />
              </div>
            </header>
            <main className="flex-1 overflow-auto">
              {isAuthenticated ? <AuthenticatedRouter /> : <GuestRouter />}
            </main>
            {isAuthenticated && (
              <footer className="border-t bg-gradient-to-r from-background via-muted/30 to-background py-3 px-4">
                <div className="flex items-center justify-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 blur-md rounded-full" />
                      <div className="relative w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary-foreground">IE</span>
                      </div>
                    </div>
                    <span className="text-sm font-medium bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      INFERA Engine
                    </span>
                  </div>
                  <span className="text-muted-foreground/50">|</span>
                  <span className="text-xs text-muted-foreground">
                    {isRtl 
                      ? 'تقنيات مبتكرة لعالم رقمي متطور' 
                      : 'Innovative Technology for an Evolving Digital World'
                    }
                  </span>
                  <span className="text-muted-foreground/50">|</span>
                  <span className="text-xs text-muted-foreground/70">
                    © {new Date().getFullYear()} INFERA Engine
                  </span>
                </div>
              </footer>
            )}
          </div>
        </div>
      </SidebarProvider>
      
      <SovereignAccessSummaryWrapper />
      <NovaFloatingButton />
      <PerformanceTracker />
    </div>
    </InspectorProvider>
    </SovereignViewProvider>
    </WorkspaceProvider>
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
