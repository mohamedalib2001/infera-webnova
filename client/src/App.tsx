import { Switch, Route, useLocation } from "wouter";
import { lazy, Suspense } from "react";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import NovaCommand from "@/pages/nova-command";
import Landing from "@/pages/landing";
import Auth from "@/pages/auth";

// Legacy home page for fallback
const LegacyHome = lazy(() => import("@/pages/home"));

// Lazy load secondary pages for better performance
const Preview = lazy(() => import("@/pages/preview"));
const Pricing = lazy(() => import("@/pages/pricing"));
const Sovereign = lazy(() => import("@/pages/sovereign"));
const PaymentSuccess = lazy(() => import("@/pages/payment-success"));
const PaymentCancel = lazy(() => import("@/pages/payment-cancel"));
const Projects = lazy(() => import("@/pages/projects"));
const Templates = lazy(() => import("@/pages/templates"));
const Deploy = lazy(() => import("@/pages/deploy"));
const ChatbotBuilder = lazy(() => import("@/pages/chatbot-builder"));
const Invoices = lazy(() => import("@/pages/invoices"));
const ApiKeys = lazy(() => import("@/pages/api-keys"));
const SshVault = lazy(() => import("@/pages/ssh-vault"));
const PlatformBuilder = lazy(() => import("@/pages/platform-builder"));
const GitHubSync = lazy(() => import("@/pages/github-sync"));
import {
  LazySettings,
  LazySovereignWorkspace,
  LazyUserBuilder,
  LazyNovaAIDashboard,
  LazyNovaChat,
  LazySupport,
  LazySubscription,
  LazyWhiteLabel,
  LazyAbout,
  LazyContact,
  LazyTerms,
  LazyPrivacy,
  LazyRefund,
} from "@/lib/lazy-routes";
import { usePlatformBranding } from "@/hooks/use-platform-branding";

const CommandPalette = lazy(() => import("@/components/command-palette").then(m => ({ default: m.CommandPalette })));
const NovaAssistantMenu = lazy(() => import("@/components/nova-assistant-menu").then(m => ({ default: m.NovaAssistantMenu })));
const NovaFloatingButton = lazy(() => import("@/components/nova-floating-button").then(m => ({ default: m.NovaFloatingButton })));
const SovereignHeaderButton = lazy(() => import("@/components/sovereign-header-button").then(m => ({ default: m.SovereignHeaderButton })));
const AIProviderTopbar = lazy(() => import("@/components/ai-provider-topbar").then(m => ({ default: m.AIProviderTopbar })));
const PerformanceTracker = lazy(() => import("@/hooks/use-performance-tracker").then(m => ({ default: m.PerformanceTracker })));
const InspectorProvider = lazy(() => import("@/components/owner-inspector").then(m => ({ default: m.InspectorProvider })));
const InspectorToggle = lazy(() => import("@/components/owner-inspector").then(m => ({ default: m.InspectorToggle })));
const SovereignViewProvider = lazy(() => import("@/components/sovereign-view").then(m => ({ default: m.SovereignViewProvider })));
const SovereignViewToggle = lazy(() => import("@/components/sovereign-view").then(m => ({ default: m.SovereignViewToggle })));
const SovereignAccessSummary = lazy(() => import("@/components/sovereign-view").then(m => ({ default: m.SovereignAccessSummary })));

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
      <Route path="/" component={PlatformBuilder} />
      <Route path="/command" component={NovaCommand} />
      <Route path="/home-legacy" component={LegacyHome} />
      
      {/* Core Pages */}
      <Route path="/auth" component={Auth} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/sovereign" component={Sovereign} />
      <Route path="/sovereign-workspace" component={LazySovereignWorkspace} />
      
      {/* Owner Pages - Sovereign Access */}
      <Route path="/owner" component={Sovereign} />
      <Route path="/owner/:page*" component={Sovereign} />
      <Route path="/api-keys" component={ApiKeys} />
      <Route path="/ssh-vault" component={SshVault} />
      <Route path="/github-sync" component={GitHubSync} />
      <Route path="/user-builder" component={LazyUserBuilder} />
      <Route path="/settings" component={LazySettings} />
      <Route path="/subscription" component={LazySubscription} />
      <Route path="/support" component={LazySupport} />
      
      {/* Build Pages */}
      <Route path="/projects" component={Projects} />
      <Route path="/templates" component={Templates} />
      <Route path="/deploy" component={Deploy} />
      <Route path="/one-click-deploy" component={Deploy} />
      <Route path="/chatbot-builder" component={ChatbotBuilder} />
      <Route path="/builder" component={PlatformBuilder} />
      <Route path="/invoices" component={Invoices} />
      
      {/* Nova AI */}
      <Route path="/nova" component={LazyNovaChat} />
      <Route path="/nova/dashboard" component={LazyNovaAIDashboard} />
      
      {/* Payments */}
      <Route path="/payment/success" component={PaymentSuccess} />
      <Route path="/payment/cancel" component={PaymentCancel} />
      
      {/* Business Pages */}
      <Route path="/white-label" component={LazyWhiteLabel} />
      
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
  return (
    <Suspense fallback={null}>
      <SovereignAccessSummary currentRoute={location} />
    </Suspense>
  );
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

function DeferredComponents() {
  const { isAuthenticated } = useAuth();
  const { isRtl } = useLanguage();
  
  if (!isAuthenticated) return null;
  
  return (
    <Suspense fallback={null}>
      <SovereignAccessSummaryWrapper />
      <NovaFloatingButton />
      <PerformanceTracker />
    </Suspense>
  );
}

function HeaderControls() {
  const { isAuthenticated } = useAuth();
  const { isRtl } = useLanguage();
  
  return (
    <>
      <Suspense fallback={null}>
        {isAuthenticated && (
          <>
            <AIProviderTopbar />
            <NovaAssistantMenu />
            <SovereignHeaderButton />
            <SovereignViewToggle />
            <InspectorToggle />
          </>
        )}
      </Suspense>
      <NotificationBell />
      <LanguageToggle />
      <ThemeToggle />
    </>
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

  const MainContent = (
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
                {isAuthenticated && (
                  <Suspense fallback={null}>
                    <CommandPalette language={isRtl ? "ar" : "en"} />
                  </Suspense>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <HeaderControls />
              </div>
            </header>
            <main className="flex-1 overflow-auto">
              <Suspense fallback={<div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
                {isAuthenticated ? <AuthenticatedRouter /> : <GuestRouter />}
              </Suspense>
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
      
      <DeferredComponents />
    </div>
  );

  if (!isAuthenticated) {
    return (
      <WorkspaceProvider authUser={user} initialRtl={isRtl}>
        {MainContent}
      </WorkspaceProvider>
    );
  }

  return (
    <WorkspaceProvider authUser={user} initialRtl={isRtl}>
      <Suspense fallback={MainContent}>
        <SovereignViewProvider>
          <InspectorProvider>
            {MainContent}
          </InspectorProvider>
        </SovereignViewProvider>
      </Suspense>
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
