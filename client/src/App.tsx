/**
 * INFERA WebNova - Main Application
 * Governance Compliant: All pages use React.lazy() loading
 */
import { Suspense, useEffect } from "react";
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
import { Bell, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { usePlatformBranding } from "@/hooks/use-platform-branding";
import { SovereignIndicator } from "@/components/sovereign-indicator";
import { CommandPalette } from "@/components/command-palette";
import { NovaAssistantMenu } from "@/components/nova-assistant-menu";
import { NovaFloatingButton } from "@/components/nova-floating-button";
import { SovereignHeaderButton } from "@/components/sovereign-header-button";
import { AIProviderTopbar } from "@/components/ai-provider-topbar";
import { PerformanceTracker } from "@/hooks/use-performance-tracker";

// Lazy loaded pages - Governance Compliant
import * as Pages from "@/lib/lazy-pages";

function PageLoadingSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    </div>
  );
}

function RedirectToAuth() {
  const [, setLocation] = useLocation();
  const currentPath = window.location.pathname;
  const shouldRedirect = currentPath !== "/" && currentPath !== "/auth" && currentPath !== "/pricing" && currentPath !== "/support" && !currentPath.startsWith("/preview/");
  
  useEffect(() => {
    if (shouldRedirect) {
      setLocation(`/auth?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [shouldRedirect, currentPath, setLocation]);
  
  if (shouldRedirect) {
    return <PageLoadingSkeleton />;
  }
  
  return (
    <Suspense fallback={<PageLoadingSkeleton />}>
      <Pages.Landing />
    </Suspense>
  );
}

function GuestRouter() {
  return (
    <Suspense fallback={<PageLoadingSkeleton />}>
      <Switch>
        <Route path="/" component={Pages.Landing} />
        <Route path="/auth" component={Pages.Auth} />
        <Route path="/pricing" component={Pages.Pricing} />
        <Route path="/support" component={Pages.Support} />
        <Route path="/preview/:shareCode" component={Pages.Preview} />
        <Route component={RedirectToAuth} />
      </Switch>
    </Suspense>
  );
}

function AuthenticatedRouter() {
  return (
    <Suspense fallback={<PageLoadingSkeleton />}>
      <Switch>
        <Route path="/" component={Pages.Home} />
        <Route path="/infera-group" component={Pages.InferaLanding} />
        <Route path="/engine-control" component={Pages.EngineControlLanding} />
        <Route path="/engine" component={Pages.EngineLanding} />
        <Route path="/finance" component={Pages.FinanceLanding} />
        <Route path="/humaniq" component={Pages.HumanIQLanding} />
        <Route path="/legal" component={Pages.LegalLanding} />
        <Route path="/appforge" component={Pages.AppForgeLanding} />
        <Route path="/marketing" component={Pages.MarketingLanding} />
        <Route path="/marketplace" component={Pages.MarketplaceLanding} />
        <Route path="/education" component={Pages.EducationLanding} />
        <Route path="/attend" component={Pages.AttendLanding} />
        <Route path="/smartdocs" component={Pages.SmartDocsLanding} />
        <Route path="/hospitality" component={Pages.HospitalityLanding} />
        <Route path="/feasibility" component={Pages.FeasibilityLanding} />
        <Route path="/cvbuilder" component={Pages.CVBuilderLanding} />
        <Route path="/jobs" component={Pages.JobsLanding} />
        <Route path="/trainai" component={Pages.TrainAILanding} />
        <Route path="/globalcloud" component={Pages.GlobalCloudLanding} />
        <Route path="/shieldgrid" component={Pages.ShieldGridLanding} />
        <Route path="/smartremote" component={Pages.SmartRemoteLanding} />
        <Route path="/pitch-deck" component={Pages.PitchDeck} />
        <Route path="/pitch-deck/engine" component={Pages.PitchDeckEngine} />
        <Route path="/pitch-deck/finance" component={Pages.PitchDeckFinance} />
        <Route path="/pitch-deck/humaniq" component={Pages.PitchDeckHumanIQ} />
        <Route path="/pitch-deck/legal" component={Pages.PitchDeckLegal} />
        <Route path="/pitch-deck/appforge" component={Pages.PitchDeckAppForge} />
        <Route path="/pitch-deck/marketing" component={Pages.PitchDeckMarketing} />
        <Route path="/pitch-deck/marketplace" component={Pages.PitchDeckMarketplace} />
        <Route path="/pitch-deck/education" component={Pages.PitchDeckEducation} />
        <Route path="/pitch-deck/attend" component={Pages.PitchDeckAttend} />
        <Route path="/pitch-deck/smartdocs" component={Pages.PitchDeckSmartDocs} />
        <Route path="/pitch-deck/hospitality" component={Pages.PitchDeckHospitality} />
        <Route path="/pitch-deck/smartmemory" component={Pages.PitchDeckSmartMemory} />
        <Route path="/pitch-deck/visionfeasibility" component={Pages.PitchDeckVisionFeasibility} />
        <Route path="/pitch-deck/cvbuilder" component={Pages.PitchDeckCVBuilder} />
        <Route path="/pitch-deck/jobsai" component={Pages.PitchDeckJobsAI} />
        <Route path="/pitch-deck/trainai" component={Pages.PitchDeckTrainAI} />
        <Route path="/pitch-deck/sovereignfinance" component={Pages.PitchDeckSovereignFinance} />
        <Route path="/pitch-deck/globalcloud" component={Pages.PitchDeckGlobalCloud} />
        <Route path="/pitch-deck/shieldgrid" component={Pages.PitchDeckShieldGrid} />
        <Route path="/pitch-deck/smartremote" component={Pages.PitchDeckSmartRemote} />
        <Route path="/pitch-deck/master" component={Pages.PitchDeckMaster} />
        <Route path="/pitch-deck/vision" component={Pages.PitchDeck} />
        <Route path="/pitch-deck/solution" component={Pages.PitchDeck} />
        <Route path="/pitch-deck/business" component={Pages.PitchDeck} />
        <Route path="/pitch-deck/financials" component={Pages.PitchDeck} />
        <Route path="/pitch-deck/team" component={Pages.PitchDeck} />
        <Route path="/pitch-deck/roadmap" component={Pages.PitchDeck} />
        <Route path="/pitch-deck/investors" component={Pages.PitchDeck} />
        <Route path="/pitch-deck/export" component={Pages.PitchDeck} />
        <Route path="/investor-narrative" component={Pages.InvestorNarrative} />
        <Route path="/executive-summaries" component={Pages.ExecutiveSummaries} />
        <Route path="/demo-storyboards" component={Pages.DemoStoryboards} />
        <Route path="/sovereign-narrative" component={Pages.SovereignNarrative} />
        <Route path="/competitive-kill-map" component={Pages.CompetitiveKillMap} />
        <Route path="/sovereign-readiness" component={Pages.SovereignReadiness} />
        <Route path="/investor-objections" component={Pages.InvestorObjections} />
        <Route path="/exit-strategy" component={Pages.ExitStrategy} />
        <Route path="/government-adoption" component={Pages.GovernmentAdoption} />
        <Route path="/economic-engine" component={Pages.EconomicEngine} />
        <Route path="/gtm-playbook" component={Pages.GTMPlaybook} />
        <Route path="/trust-proof" component={Pages.TrustProof} />
        <Route path="/founder-narrative" component={Pages.FounderNarrative} />
        <Route path="/red-line-rules" component={Pages.RedLineRules} />
        <Route path="/time-dominance" component={Pages.TimeDominance} />
        <Route path="/crisis-playbook" component={Pages.CrisisPlaybook} />
        <Route path="/irreplaceability-proof" component={Pages.IrreplaceabilityProof} />
        <Route path="/board-documents" component={Pages.BoardDocuments} />
        <Route path="/government-pack" component={Pages.GovernmentPack} />
        <Route path="/document-governance" component={Pages.DocumentGovernance} />
        <Route path="/launch-sequencing" component={Pages.LaunchSequencing} />
        <Route path="/stakeholder-access" component={Pages.StakeholderAccess} />
        <Route path="/launch-checklist" component={Pages.LaunchChecklist} />
        <Route path="/crisis-communication" component={Pages.CrisisCommunication} />
        <Route path="/war-room" component={Pages.WarRoom} />
        <Route path="/founder-framework" component={Pages.FounderFramework} />
        <Route path="/about" component={Pages.About} />
        <Route path="/terms" component={Pages.Terms} />
        <Route path="/privacy" component={Pages.Privacy} />
        <Route path="/refund" component={Pages.Refund} />
        <Route path="/ai-policy" component={Pages.AIPolicy} />
        <Route path="/performance-policy" component={Pages.PerformancePolicy} />
        <Route path="/multi-app-policy" component={Pages.MultiAppPolicy} />
        <Route path="/visual-identity" component={Pages.VisualIdentity} />
        <Route path="/icon-management" component={Pages.IconManagement} />
        <Route path="/contact" component={Pages.Contact} />
        <Route path="/auth" component={Pages.Auth} />
        <Route path="/builder" component={Pages.Builder} />
        <Route path="/builder/:id" component={Pages.Builder} />
        <Route path="/conversations" component={Pages.ConversationHistory} />
        <Route path="/projects" component={Pages.Projects} />
        <Route path="/templates" component={Pages.Templates} />
        <Route path="/pricing" component={Pages.Pricing} />
        <Route path="/sovereign" component={Pages.Sovereign} />
        <Route path="/chatbot-builder" component={Pages.ChatbotBuilder} />
        <Route path="/analytics" component={Pages.Analytics} />
        <Route path="/seo-optimizer" component={Pages.SEOOptimizer} />
        <Route path="/white-label" component={Pages.WhiteLabel} />
        <Route path="/owner" component={Pages.OwnerDashboard} />
        <Route path="/owner/command" component={Pages.OwnerCommand} />
        <Route path="/owner/nova-sovereign" component={Pages.NovaSovereignDashboard} />
        <Route path="/owner/notifications" component={Pages.OwnerNotifications} />
        <Route path="/owner/infrastructure" component={Pages.OwnerInfrastructure} />
        <Route path="/owner/integrations" component={Pages.OwnerIntegrations} />
        <Route path="/owner/ai-sovereignty" component={Pages.OwnerAISovereignty} />
        <Route path="/owner/ai-capability-control" component={Pages.OwnerAICapabilityControl} />
        <Route path="/owner/assistant-governance" component={Pages.AssistantGovernancePage} />
        <Route path="/owner/dynamic-control" component={Pages.DynamicControlPage} />
        <Route path="/owner/nova-permissions" component={Pages.NovaPermissionsPage} />
        <Route path="/owner/email-settings" component={Pages.OwnerEmailSettings} />
        <Route path="/owner/ai-settings" component={Pages.AISettings} />
        <Route path="/owner/ai-model-registry" component={Pages.AIModelRegistry} />
        <Route path="/owner/infera-intelligence" component={Pages.InferaIntelligenceModels} />
        <Route path="/owner/infera-agent" component={Pages.InferaAgent} />
        <Route path="/ai-builder" component={Pages.AiAppBuilder} />
        <Route path="/ide" component={Pages.IDEProjects} />
        <Route path="/ide/:id" component={Pages.CloudIDE} />
        <Route path="/sovereign-control" component={Pages.SovereignControlCenter} />
        <Route path="/sovereign/command-center" component={Pages.SovereignCommandCenter} />
        <Route path="/sovereign/ai-governance" component={Pages.AIGovernanceEngine} />
        <Route path="/sovereign/digital-borders" component={Pages.DigitalBorders} />
        <Route path="/sovereign/policy-engine" component={Pages.PolicyEngine} />
        <Route path="/sovereign/trust-compliance" component={Pages.TrustCompliance} />
        <Route path="/sovereign/strategic-forecast" component={Pages.StrategicForecast} />
        <Route path="/domains" component={Pages.Domains} />
        <Route path="/domain-search" component={Pages.DomainSearch} />
        <Route path="/settings" component={Pages.Settings} />
        <Route path="/platform-generator" component={Pages.PlatformGenerator} />
        <Route path="/api-keys" component={Pages.ApiKeys} />
        <Route path="/payments" component={Pages.PaymentsDashboard} />
        <Route path="/payment/success" component={Pages.PaymentSuccess} />
        <Route path="/payment/cancel" component={Pages.PaymentCancel} />
        <Route path="/subscription" component={Pages.Subscription} />
        <Route path="/notifications" component={Pages.Notifications} />
        <Route path="/marketing" component={Pages.Marketing} />
        <Route path="/invoices" component={Pages.Invoices} />
        <Route path="/integrations" component={Pages.Integrations} />
        <Route path="/smart-suggestions" component={Pages.SmartSuggestions} />
        <Route path="/deploy" component={Pages.OneClickDeploy} />
        <Route path="/ssl" component={Pages.SSLCertificates} />
        <Route path="/ssl-certificates" component={Pages.SSLCertificates} />
        <Route path="/ssh-vault" component={Pages.SSHVault} />
        <Route path="/github" component={Pages.GitHubManager} />
        <Route path="/sovereign-plans" component={Pages.SovereignPlans} />
        <Route path="/sovereign-workspace" component={Pages.SovereignWorkspaceShell} />
        <Route path="/logo-factory" component={Pages.LogoFactory} />
        <Route path="/government-compliance" component={Pages.GovernmentCompliance} />
        <Route path="/owner/policies" component={Pages.OwnerPolicies} />
        <Route path="/departments" component={Pages.DepartmentsPage} />
        <Route path="/tasks" component={Pages.TasksPage} />
        <Route path="/employee-dashboard" component={Pages.EmployeeDashboard} />
        <Route path="/backend-generator" component={Pages.BackendGenerator} />
        <Route path="/git" component={Pages.GitControl} />
        <Route path="/ai-copilot" component={Pages.AICopilot} />
        <Route path="/infera-agent" component={Pages.InferaAgentV2} />
        <Route path="/infera-agent-old" component={Pages.InferaAgent} />
        <Route path="/agent" component={Pages.AgentStandalone} />
        <Route path="/testing" component={Pages.TestingGenerator} />
        <Route path="/marketplace" component={Pages.Marketplace} />
        <Route path="/extensions" component={Pages.Marketplace} />
        <Route path="/collaboration" component={Pages.Collaboration} />
        <Route path="/console" component={Pages.ConsolePage} />
        <Route path="/support" component={Pages.Support} />
        <Route path="/support/agent" component={Pages.SupportAgentDashboard} />
        <Route path="/support/command-center" component={Pages.AgentCommandCenter} />
        <Route path="/admin/subscriptions" component={Pages.AdminSubscriptions} />
        <Route path="/owner/deletion-management" component={Pages.DeletionManagement} />
        <Route path="/owner/isds" component={Pages.ISDSPage} />
        <Route path="/owner/spom" component={Pages.SpomPage} />
        <Route path="/owner/quality" component={Pages.QualityDashboard} />
        <Route path="/owner/sidebar-manager" component={Pages.SidebarManager} />
        <Route path="/owner/platform-maps" component={Pages.PlatformMaps} />
        <Route path="/sovereign-chat" component={Pages.SovereignChat} />
        <Route path="/owner/platform-registry" component={Pages.PlatformRegistry} />
        <Route path="/nova" component={Pages.NovaChat} />
        <Route path="/nova/operations" component={Pages.OperationsDashboard} />
        <Route path="/nova/builds" component={Pages.BuildManager} />
        <Route path="/mobile-builder" component={Pages.MobileAppBuilder} />
        <Route path="/desktop-builder" component={Pages.DesktopAppBuilder} />
        <Route path="/maps" component={Pages.MapsPage} />
        <Route path="/cicd" component={Pages.CICDPipeline} />
        <Route path="/military-security" component={Pages.MilitarySecurity} />
        <Route path="/device-testing" component={Pages.DeviceTesting} />
        <Route path="/permission-control" component={Pages.PermissionControl} />
        <Route path="/sovereign-compliance" component={Pages.SovereignCompliance} />
        <Route path="/staff-management" component={Pages.StaffManagement} />
        <Route path="/sovereign-permissions" component={Pages.SovereignPermissions} />
        <Route path="/content-moderation" component={Pages.ContentModeration} />
        <Route path="/owner/control-center" component={Pages.OwnerControlCenter} />
        <Route path="/preview/:shareCode" component={Pages.Preview} />
        <Route component={Pages.NotFound} />
      </Switch>
    </Suspense>
  );
}

function NotificationBell() {
  const { data: notifications } = useQuery<any[]>({
    queryKey: ["/api/notifications"],
  });
  
  const unreadCount = notifications?.filter((n: any) => !n.isRead).length || 0;
  
  return (
    <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
      <Bell className="h-4 w-4" />
      {unreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      )}
    </Button>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();
  const { language } = useLanguage();
  const { branding, isLoading: brandingLoading } = usePlatformBranding();
  
  if (isLoading || brandingLoading) {
    return <PageLoadingSkeleton />;
  }
  
  const isRTL = language === "ar";
  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3.5rem",
  } as React.CSSProperties;
  
  if (!user) {
    return (
      <SidebarProvider style={sidebarStyle}>
        <div className="flex h-screen w-full">
          <GuestSidebar />
          <div className="flex flex-col flex-1 overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
            <header className="flex items-center justify-between gap-2 p-2 border-b h-14 shrink-0">
              <div className="flex items-center gap-2">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
              </div>
              <div className="flex items-center gap-2">
                <LanguageToggle />
                <ThemeToggle />
              </div>
            </header>
            <main className="flex-1 overflow-auto">
              <GuestRouter />
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }
  
  const isOwner = user?.role === "owner" || user?.role === "sovereign" || user?.id === 1;
  
  return (
    <InspectorProvider>
      <SovereignViewProvider>
        <SidebarProvider style={sidebarStyle}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1 overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
              <header className="flex items-center justify-between gap-2 p-2 border-b h-14 shrink-0">
                <div className="flex items-center gap-2">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  {isOwner && <SovereignHeaderButton />}
                </div>
                <div className="flex items-center gap-2">
                  {isOwner && <AIProviderTopbar />}
                  {isOwner && <NovaAssistantMenu />}
                  <NotificationBell />
                  {isOwner && <InspectorToggle />}
                  {isOwner && <SovereignViewToggle />}
                  <LanguageToggle />
                  <ThemeToggle />
                </div>
              </header>
              <main className="flex-1 overflow-auto">
                <AuthenticatedRouter />
              </main>
            </div>
          </div>
          <CommandPalette />
          <SovereignIndicator />
          <NovaFloatingButton />
          {isOwner && <SovereignAccessSummary />}
        </SidebarProvider>
      </SovereignViewProvider>
    </InspectorProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <WorkspaceProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <PerformanceTracker />
              <AppContent />
              <Toaster />
            </TooltipProvider>
          </QueryClientProvider>
        </WorkspaceProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
