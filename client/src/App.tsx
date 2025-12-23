import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
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
import Home from "@/pages/home";
import Landing from "@/pages/landing";
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
import OwnerNotifications from "@/pages/owner-notifications";
import OwnerInfrastructure from "@/pages/owner-infrastructure";
import OwnerIntegrations from "@/pages/owner-integrations";
import OwnerAISovereignty from "@/pages/owner-ai-sovereignty";
import OwnerEmailSettings from "@/pages/owner-email-settings";
import AISettings from "@/pages/ai-settings";
import AIModelRegistry from "@/pages/ai-model-registry";
import AiAppBuilder from "@/pages/ai-app-builder";
import IDEProjects from "@/pages/ide-projects";
import CloudIDE from "@/pages/cloud-ide";
import SovereignControlCenter from "@/pages/sovereign-control-center";
import SovereignCommandCenter from "@/pages/sovereign-command-center";
import AIGovernanceEngine from "@/pages/ai-governance-engine";
import DigitalBorders from "@/pages/digital-borders";
import PolicyEngine from "@/pages/policy-engine";
import TrustCompliance from "@/pages/trust-compliance";
import StrategicForecast from "@/pages/strategic-forecast";
import Domains from "@/pages/domains";
import Settings from "@/pages/settings";
import PlatformGenerator from "@/pages/platform-generator";
import ApiKeys from "@/pages/api-keys";
import PaymentsDashboard from "@/pages/payments-dashboard";
import PaymentSuccess from "@/pages/payment-success";
import PaymentCancel from "@/pages/payment-cancel";
import Subscription from "@/pages/subscription";
import Notifications from "@/pages/notifications";
import Marketing from "@/pages/marketing";
import Invoices from "@/pages/invoices";
import Integrations from "@/pages/integrations";
import SmartSuggestions from "@/pages/smart-suggestions";
import OneClickDeploy from "@/pages/one-click-deploy";
import BackendGenerator from "@/pages/backend-generator";
import GitControl from "@/pages/git-control";
import AICopilot from "@/pages/ai-copilot";
import TestingGenerator from "@/pages/testing-generator";
import Marketplace from "@/pages/marketplace";
import Collaboration from "@/pages/collaboration";
import SSLCertificates from "@/pages/ssl-certificates";
import SSHVault from "@/pages/ssh-vault";
import DepartmentsPage from "@/pages/departments";
import TasksPage from "@/pages/tasks";
import EmployeeDashboard from "@/pages/employee-dashboard";
import ConsolePage from "@/pages/console";
import Support from "@/pages/support";
import SupportAgentDashboard from "@/pages/support-agent-dashboard";
import AgentCommandCenter from "@/pages/agent-command-center";
import AdminSubscriptions from "@/pages/admin-subscriptions";
import DeletionManagement from "@/pages/deletion-management";
import ISDSPage from "@/pages/isds";
import SpomPage from "@/pages/owner/spom";
import QualityDashboard from "@/pages/quality-dashboard";
import SidebarManager from "@/pages/sidebar-manager";
import SovereignChat from "@/pages/sovereign-chat";
import PlatformRegistry from "@/pages/platform-registry";
import NovaChat from "@/pages/nova-chat";
import OperationsDashboard from "@/pages/operations-dashboard";
import BuildManager from "@/pages/build-manager";
import MobileAppBuilder from "@/pages/mobile-app-builder";
import DesktopAppBuilder from "@/pages/desktop-app-builder";
import ConversationHistory from "@/pages/conversation-history";
import CICDPipeline from "@/pages/cicd-pipeline";
import DeviceTesting from "@/pages/device-testing";
import PermissionControl from "@/pages/permission-control";
import SovereignCompliance from "@/pages/sovereign-compliance";
import StaffManagement from "@/pages/staff-management";
import SovereignPermissions from "@/pages/sovereign-permissions";
import OwnerAICapabilityControl from "@/pages/owner/ai-capability-control";
import AssistantGovernancePage from "@/pages/owner/assistant-governance";
import DynamicControlPage from "@/pages/owner/dynamic-control";
import NovaPermissionsPage from "@/pages/owner/nova-permissions";
import NotFound from "@/pages/not-found";
import { usePlatformBranding } from "@/hooks/use-platform-branding";
import { SovereignIndicator } from "@/components/sovereign-indicator";
import { CommandPalette } from "@/components/command-palette";
import { NovaAssistantMenu } from "@/components/nova-assistant-menu";
import { SovereignHeaderButton } from "@/components/sovereign-header-button";
import { AIProviderTopbar } from "@/components/ai-provider-topbar";
import { PerformanceTracker } from "@/hooks/use-performance-tracker";

function RedirectToAuth() {
  const [, setLocation] = useLocation();
  const currentPath = window.location.pathname;
  
  // Redirect to auth with return URL
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
      <Route path="/support" component={Support} />
      <Route path="/preview/:shareCode" component={Preview} />
      <Route component={RedirectToAuth} />
    </Switch>
  );
}

function AuthenticatedRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/builder" component={Builder} />
      <Route path="/builder/:id" component={Builder} />
      <Route path="/conversations" component={ConversationHistory} />
      <Route path="/projects" component={Projects} />
      <Route path="/templates" component={Templates} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/sovereign" component={Sovereign} />
      <Route path="/chatbot-builder" component={ChatbotBuilder} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/seo-optimizer" component={SEOOptimizer} />
      <Route path="/white-label" component={WhiteLabel} />
      <Route path="/owner" component={OwnerDashboard} />
      <Route path="/owner/notifications" component={OwnerNotifications} />
      <Route path="/owner/infrastructure" component={OwnerInfrastructure} />
      <Route path="/owner/integrations" component={OwnerIntegrations} />
      <Route path="/owner/ai-sovereignty" component={OwnerAISovereignty} />
      <Route path="/owner/ai-capability-control" component={OwnerAICapabilityControl} />
      <Route path="/owner/assistant-governance" component={AssistantGovernancePage} />
      <Route path="/owner/dynamic-control" component={DynamicControlPage} />
      <Route path="/owner/nova-permissions" component={NovaPermissionsPage} />
      <Route path="/owner/email-settings" component={OwnerEmailSettings} />
      <Route path="/owner/ai-settings" component={AISettings} />
      <Route path="/owner/ai-model-registry" component={AIModelRegistry} />
      <Route path="/ai-builder" component={AiAppBuilder} />
      <Route path="/ide" component={IDEProjects} />
      <Route path="/ide/:id" component={CloudIDE} />
      <Route path="/sovereign-control" component={SovereignControlCenter} />
      <Route path="/sovereign/command-center" component={SovereignCommandCenter} />
      <Route path="/sovereign/ai-governance" component={AIGovernanceEngine} />
      <Route path="/sovereign/digital-borders" component={DigitalBorders} />
      <Route path="/sovereign/policy-engine" component={PolicyEngine} />
      <Route path="/sovereign/trust-compliance" component={TrustCompliance} />
      <Route path="/sovereign/strategic-forecast" component={StrategicForecast} />
      <Route path="/domains" component={Domains} />
      <Route path="/settings" component={Settings} />
      <Route path="/platform-generator" component={PlatformGenerator} />
      <Route path="/api-keys" component={ApiKeys} />
      <Route path="/payments" component={PaymentsDashboard} />
      <Route path="/payment/success" component={PaymentSuccess} />
      <Route path="/payment/cancel" component={PaymentCancel} />
      <Route path="/subscription" component={Subscription} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/marketing" component={Marketing} />
      <Route path="/invoices" component={Invoices} />
      <Route path="/integrations" component={Integrations} />
      <Route path="/smart-suggestions" component={SmartSuggestions} />
      <Route path="/deploy" component={OneClickDeploy} />
      <Route path="/ssl" component={SSLCertificates} />
      <Route path="/ssl-certificates" component={SSLCertificates} />
      <Route path="/ssh-vault" component={SSHVault} />
      <Route path="/departments" component={DepartmentsPage} />
      <Route path="/tasks" component={TasksPage} />
      <Route path="/employee-dashboard" component={EmployeeDashboard} />
      <Route path="/backend-generator" component={BackendGenerator} />
      <Route path="/git" component={GitControl} />
      <Route path="/ai-copilot" component={AICopilot} />
      <Route path="/testing" component={TestingGenerator} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/collaboration" component={Collaboration} />
      <Route path="/console" component={ConsolePage} />
      <Route path="/support" component={Support} />
      <Route path="/support/agent" component={SupportAgentDashboard} />
      <Route path="/support/command-center" component={AgentCommandCenter} />
      <Route path="/admin/subscriptions" component={AdminSubscriptions} />
      <Route path="/owner/deletion-management" component={DeletionManagement} />
      <Route path="/owner/isds" component={ISDSPage} />
      <Route path="/owner/spom" component={SpomPage} />
      <Route path="/owner/quality" component={QualityDashboard} />
      <Route path="/owner/sidebar-manager" component={SidebarManager} />
      <Route path="/sovereign-chat" component={SovereignChat} />
      <Route path="/owner/platform-registry" component={PlatformRegistry} />
      <Route path="/nova" component={NovaChat} />
      <Route path="/nova/operations" component={OperationsDashboard} />
      <Route path="/nova/builds" component={BuildManager} />
      <Route path="/mobile-builder" component={MobileAppBuilder} />
      <Route path="/desktop-builder" component={DesktopAppBuilder} />
      <Route path="/cicd" component={CICDPipeline} />
      <Route path="/device-testing" component={DeviceTesting} />
      <Route path="/permissions" component={PermissionControl} />
      <Route path="/sovereign/compliance" component={SovereignCompliance} />
      <Route path="/owner/staff" component={StaffManagement} />
      <Route path="/owner/sovereign-permissions" component={SovereignPermissions} />
      <Route path="/preview/:shareCode" component={Preview} />
      <Route component={NotFound} />
    </Switch>
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
      onClick={() => setLocation("/notifications")}
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
  const { isAuthenticated } = useAuth();
  
  // Load and apply platform branding dynamically
  usePlatformBranding();
  
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
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
      
      {/* Sovereign Analytics Panel - لوحة التحليلات السيادية */}
      <SovereignIndicator />
      
      {/* Real Performance Tracking - تتبع الأداء الحقيقي */}
      <PerformanceTracker />
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
