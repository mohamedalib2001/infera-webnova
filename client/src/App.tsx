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
import Landing from "@/pages/landing";
import Auth from "@/pages/auth";
import Preview from "@/pages/preview";
import Pricing from "@/pages/pricing";
import Sovereign from "@/pages/sovereign";
import NotFound from "@/pages/not-found";
import {
  LazyHome, LazyBuilder, LazyCloudIDE, LazyAiAppBuilder, LazyMobileAppBuilder, LazyDesktopAppBuilder,
  LazyTestingGenerator, LazyBackendGenerator, LazyGitControl, LazyAICopilot, LazyMarketplace,
  LazyCollaboration, LazyMilitarySecurity, LazyNovaAIDashboard, LazyNovaSovereignDashboard,
  LazyOwnerDashboard, LazyOwnerControlCenter, LazySovereignWorkspace, LazySovereignPermissions,
  LazyPagePerformanceMonitor, LazyPagesCompletionTracker, LazyAnalytics, LazyTemplates, LazyProjects,
  LazyInferaAgent, LazyInferaAgentV2, LazyAgentStandalone, LazyChatbotBuilder, LazySEOOptimizer,
  LazyWhiteLabel, LazyOwnerCommand, LazyOwnerNotifications, LazyOwnerInfrastructure,
  LazyOwnerIntegrations, LazyOwnerAISovereignty, LazyOwnerEmailSettings, LazyAISettings,
  LazyAIModelRegistry, LazyInferaIntelligenceModels, LazyIDEProjects, LazySovereignControlCenter,
  LazySovereignCommandCenter, LazyAIGovernanceEngine, LazyDigitalBorders, LazyPolicyEngine,
  LazyTrustCompliance, LazyStrategicForecast, LazyDomains, LazyDomainSearch, LazySettings,
  LazyPlatformGenerator, LazyApiKeys, LazyPaymentsDashboard, LazySubscription, LazyNotifications,
  LazyMarketing, LazyInvoices, LazyIntegrations, LazySmartSuggestions, LazyOneClickDeploy,
  LazySSLCertificates, LazySSHVault, LazyGitHubManager, LazySovereignPlans, LazyLogoFactory,
  LazyGovernmentCompliance, LazyOwnerPolicies, LazyDepartmentsPage, LazyTasksPage,
  LazyEmployeeDashboard, LazyConsolePage, LazySupport, LazySupportAgentDashboard,
  LazyAgentCommandCenter, LazyAdminSubscriptions, LazyDeletionManagement, LazyISDSPage,
  LazySpomPage, LazyQualityDashboard, LazySidebarManager, LazySovereignChat, LazyPlatformRegistry,
  LazyNovaChat, LazyOperationsDashboard, LazyBuildManager, LazyMapsPage, LazyConversationHistory,
  LazyCICDPipeline, LazyDeviceTesting, LazyPermissionControl, LazySovereignCompliance,
  LazyStaffManagement, LazyContentModeration, LazyOwnerAICapabilityControl,
  LazyAssistantGovernancePage, LazyDynamicControlPage, LazyNovaPermissionsPage,
  LazyFinanceLanding, LazyHumanIQLanding, LazyLegalLanding, LazyAppForgeLanding,
  LazyMarketingLanding, LazyMarketplaceLanding, LazyEducationLanding, LazyAttendLanding,
  LazySmartDocsLanding, LazyHospitalityLanding, LazyFeasibilityLanding, LazyCVBuilderLanding,
  LazyJobsLanding, LazyTrainAILanding, LazyGlobalCloudLanding, LazyShieldGridLanding,
  LazySmartRemoteLanding, LazyInferaLanding, LazyEngineControlLanding, LazyEngineLanding,
  LazyPitchDeck, LazyPitchDeckEngine, LazyPitchDeckFinance, LazyPitchDeckHumanIQ,
  LazyPitchDeckLegal, LazyPitchDeckAppForge, LazyPitchDeckMarketing, LazyPitchDeckMarketplace,
  LazyPitchDeckEducation, LazyPitchDeckAttend, LazyPitchDeckSmartDocs, LazyPitchDeckHospitality,
  LazyPitchDeckSmartMemory, LazyPitchDeckVisionFeasibility, LazyPitchDeckCVBuilder,
  LazyPitchDeckJobsAI, LazyPitchDeckTrainAI, LazyPitchDeckSovereignFinance, LazyPitchDeckGlobalCloud,
  LazyPitchDeckShieldGrid, LazyPitchDeckSmartRemote, LazyPitchDeckMaster, LazyPlatformMaps,
  LazyInvestorNarrative, LazyExecutiveSummaries, LazyDemoStoryboards, LazySovereignNarrative,
  LazyCompetitiveKillMap, LazySovereignReadiness, LazyInvestorObjections, LazyExitStrategy,
  LazyGovernmentAdoption, LazyEconomicEngine, LazyGTMPlaybook, LazyTrustProof, LazyFounderNarrative,
  LazyRedLineRules, LazyTimeDominance, LazyCrisisPlaybook, LazyIrreplaceabilityProof,
  LazyBoardDocuments, LazyGovernmentPack, LazyDocumentGovernance, LazyLaunchSequencing,
  LazyStakeholderAccess, LazyLaunchChecklist, LazyCrisisCommunication, LazyWarRoom,
  LazyFounderFramework, LazyAbout, LazyTerms, LazyPrivacy, LazyRefund, LazyAIPolicy,
  LazyPerformancePolicy, LazyMultiAppPolicy, LazyVisualIdentity, LazyIconManagement, LazyContact
} from "@/lib/lazy-routes";
import PaymentSuccess from "@/pages/payment-success";
import PaymentCancel from "@/pages/payment-cancel";
import { usePlatformBranding } from "@/hooks/use-platform-branding";
import { lazy, Suspense } from "react";
const LazySovereignIndicator = lazy(() => import("@/components/sovereign-indicator"));
import { CommandPalette } from "@/components/command-palette";
import { NovaAssistantMenu } from "@/components/nova-assistant-menu";
import { NovaFloatingButton } from "@/components/nova-floating-button";
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
      <Route path="/support" component={LazySupport} />
      <Route path="/preview/:shareCode" component={Preview} />
      <Route component={RedirectToAuth} />
    </Switch>
  );
}

function AuthenticatedRouter() {
  return (
    <Switch>
      <Route path="/" component={LazyHome} />
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
      <Route path="/pitch-deck" component={LazyPitchDeck} />
      <Route path="/pitch-deck/engine" component={LazyPitchDeckEngine} />
      <Route path="/pitch-deck/finance" component={LazyPitchDeckFinance} />
      <Route path="/pitch-deck/humaniq" component={LazyPitchDeckHumanIQ} />
      <Route path="/pitch-deck/legal" component={LazyPitchDeckLegal} />
      <Route path="/pitch-deck/appforge" component={LazyPitchDeckAppForge} />
      <Route path="/pitch-deck/marketing" component={LazyPitchDeckMarketing} />
      <Route path="/pitch-deck/marketplace" component={LazyPitchDeckMarketplace} />
      <Route path="/pitch-deck/education" component={LazyPitchDeckEducation} />
      <Route path="/pitch-deck/attend" component={LazyPitchDeckAttend} />
      <Route path="/pitch-deck/smartdocs" component={LazyPitchDeckSmartDocs} />
      <Route path="/pitch-deck/hospitality" component={LazyPitchDeckHospitality} />
      <Route path="/pitch-deck/smartmemory" component={LazyPitchDeckSmartMemory} />
      <Route path="/pitch-deck/visionfeasibility" component={LazyPitchDeckVisionFeasibility} />
      <Route path="/pitch-deck/cvbuilder" component={LazyPitchDeckCVBuilder} />
      <Route path="/pitch-deck/jobsai" component={LazyPitchDeckJobsAI} />
      <Route path="/pitch-deck/trainai" component={LazyPitchDeckTrainAI} />
      <Route path="/pitch-deck/sovereignfinance" component={LazyPitchDeckSovereignFinance} />
      <Route path="/pitch-deck/globalcloud" component={LazyPitchDeckGlobalCloud} />
      <Route path="/pitch-deck/shieldgrid" component={LazyPitchDeckShieldGrid} />
      <Route path="/pitch-deck/smartremote" component={LazyPitchDeckSmartRemote} />
      <Route path="/pitch-deck/master" component={LazyPitchDeckMaster} />
      <Route path="/pitch-deck/vision" component={LazyPitchDeck} />
      <Route path="/pitch-deck/solution" component={LazyPitchDeck} />
      <Route path="/pitch-deck/business" component={LazyPitchDeck} />
      <Route path="/pitch-deck/financials" component={LazyPitchDeck} />
      <Route path="/pitch-deck/team" component={LazyPitchDeck} />
      <Route path="/pitch-deck/roadmap" component={LazyPitchDeck} />
      <Route path="/pitch-deck/investors" component={LazyPitchDeck} />
      <Route path="/pitch-deck/export" component={LazyPitchDeck} />
      <Route path="/investor-narrative" component={LazyInvestorNarrative} />
      <Route path="/executive-summaries" component={LazyExecutiveSummaries} />
      <Route path="/demo-storyboards" component={LazyDemoStoryboards} />
      <Route path="/sovereign-narrative" component={LazySovereignNarrative} />
      <Route path="/competitive-kill-map" component={LazyCompetitiveKillMap} />
      <Route path="/sovereign-readiness" component={LazySovereignReadiness} />
      <Route path="/investor-objections" component={LazyInvestorObjections} />
      <Route path="/exit-strategy" component={LazyExitStrategy} />
      <Route path="/government-adoption" component={LazyGovernmentAdoption} />
      <Route path="/economic-engine" component={LazyEconomicEngine} />
      <Route path="/gtm-playbook" component={LazyGTMPlaybook} />
      <Route path="/trust-proof" component={LazyTrustProof} />
      <Route path="/founder-narrative" component={LazyFounderNarrative} />
      <Route path="/red-line-rules" component={LazyRedLineRules} />
      <Route path="/time-dominance" component={LazyTimeDominance} />
      <Route path="/crisis-playbook" component={LazyCrisisPlaybook} />
      <Route path="/irreplaceability-proof" component={LazyIrreplaceabilityProof} />
      <Route path="/board-documents" component={LazyBoardDocuments} />
      <Route path="/government-pack" component={LazyGovernmentPack} />
      <Route path="/document-governance" component={LazyDocumentGovernance} />
      <Route path="/launch-sequencing" component={LazyLaunchSequencing} />
      <Route path="/stakeholder-access" component={LazyStakeholderAccess} />
      <Route path="/launch-checklist" component={LazyLaunchChecklist} />
      <Route path="/crisis-communication" component={LazyCrisisCommunication} />
      <Route path="/war-room" component={LazyWarRoom} />
      <Route path="/founder-framework" component={LazyFounderFramework} />
      <Route path="/about" component={LazyAbout} />
      <Route path="/terms" component={LazyTerms} />
      <Route path="/privacy" component={LazyPrivacy} />
      <Route path="/refund" component={LazyRefund} />
      <Route path="/ai-policy" component={LazyAIPolicy} />
      <Route path="/performance-policy" component={LazyPerformancePolicy} />
      <Route path="/multi-app-policy" component={LazyMultiAppPolicy} />
      <Route path="/visual-identity" component={LazyVisualIdentity} />
      <Route path="/icon-management" component={LazyIconManagement} />
      <Route path="/contact" component={LazyContact} />
      <Route path="/auth" component={Auth} />
      <Route path="/builder" component={LazyBuilder} />
      <Route path="/builder/:id" component={LazyBuilder} />
      <Route path="/conversations" component={LazyConversationHistory} />
      <Route path="/projects" component={LazyProjects} />
      <Route path="/templates" component={LazyTemplates} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/sovereign" component={Sovereign} />
      <Route path="/chatbot-builder" component={LazyChatbotBuilder} />
      <Route path="/analytics" component={LazyAnalytics} />
      <Route path="/seo-optimizer" component={LazySEOOptimizer} />
      <Route path="/white-label" component={LazyWhiteLabel} />
      <Route path="/owner" component={LazyOwnerDashboard} />
      <Route path="/owner/command" component={LazyOwnerCommand} />
      <Route path="/owner/nova-sovereign" component={LazyNovaSovereignDashboard} />
      <Route path="/owner/notifications" component={LazyOwnerNotifications} />
      <Route path="/owner/infrastructure" component={LazyOwnerInfrastructure} />
      <Route path="/owner/integrations" component={LazyOwnerIntegrations} />
      <Route path="/owner/ai-sovereignty" component={LazyOwnerAISovereignty} />
      <Route path="/owner/ai-capability-control" component={LazyOwnerAICapabilityControl} />
      <Route path="/owner/assistant-governance" component={LazyAssistantGovernancePage} />
      <Route path="/owner/dynamic-control" component={LazyDynamicControlPage} />
      <Route path="/owner/nova-permissions" component={LazyNovaPermissionsPage} />
      <Route path="/owner/email-settings" component={LazyOwnerEmailSettings} />
      <Route path="/owner/ai-settings" component={LazyAISettings} />
      <Route path="/owner/ai-model-registry" component={LazyAIModelRegistry} />
      <Route path="/owner/infera-intelligence" component={LazyInferaIntelligenceModels} />
      <Route path="/owner/infera-agent" component={LazyInferaAgent} />
      <Route path="/ai-builder" component={LazyAiAppBuilder} />
      <Route path="/ide" component={LazyIDEProjects} />
      <Route path="/ide/:id" component={LazyCloudIDE} />
      <Route path="/sovereign-control" component={LazySovereignControlCenter} />
      <Route path="/sovereign/command-center" component={LazySovereignCommandCenter} />
      <Route path="/sovereign/ai-governance" component={LazyAIGovernanceEngine} />
      <Route path="/sovereign/digital-borders" component={LazyDigitalBorders} />
      <Route path="/sovereign/policy-engine" component={LazyPolicyEngine} />
      <Route path="/sovereign/trust-compliance" component={LazyTrustCompliance} />
      <Route path="/sovereign/strategic-forecast" component={LazyStrategicForecast} />
      <Route path="/domains" component={LazyDomains} />
      <Route path="/domain-search" component={LazyDomainSearch} />
      <Route path="/settings" component={LazySettings} />
      <Route path="/platform-generator" component={LazyPlatformGenerator} />
      <Route path="/api-keys" component={LazyApiKeys} />
      <Route path="/payments" component={LazyPaymentsDashboard} />
      <Route path="/payment/success" component={PaymentSuccess} />
      <Route path="/payment/cancel" component={PaymentCancel} />
      <Route path="/subscription" component={LazySubscription} />
      <Route path="/notifications" component={LazyNotifications} />
      <Route path="/marketing" component={LazyMarketing} />
      <Route path="/invoices" component={LazyInvoices} />
      <Route path="/integrations" component={LazyIntegrations} />
      <Route path="/smart-suggestions" component={LazySmartSuggestions} />
      <Route path="/deploy" component={LazyOneClickDeploy} />
      <Route path="/ssl" component={LazySSLCertificates} />
      <Route path="/ssl-certificates" component={LazySSLCertificates} />
      <Route path="/ssh-vault" component={LazySSHVault} />
      <Route path="/github" component={LazyGitHubManager} />
      <Route path="/sovereign-plans" component={LazySovereignPlans} />
      <Route path="/sovereign-workspace" component={LazySovereignWorkspace} />
      <Route path="/logo-factory" component={LazyLogoFactory} />
      <Route path="/government-compliance" component={LazyGovernmentCompliance} />
      <Route path="/owner/policies" component={LazyOwnerPolicies} />
      <Route path="/departments" component={LazyDepartmentsPage} />
      <Route path="/tasks" component={LazyTasksPage} />
      <Route path="/employee-dashboard" component={LazyEmployeeDashboard} />
      <Route path="/backend-generator" component={LazyBackendGenerator} />
      <Route path="/git" component={LazyGitControl} />
      <Route path="/ai-copilot" component={LazyAICopilot} />
      <Route path="/infera-agent" component={LazyInferaAgentV2} />
      <Route path="/infera-agent-old" component={LazyInferaAgent} />
      <Route path="/agent" component={LazyAgentStandalone} />
      <Route path="/testing" component={LazyTestingGenerator} />
      <Route path="/marketplace" component={LazyMarketplace} />
      <Route path="/extensions" component={LazyMarketplace} />
      <Route path="/collaboration" component={LazyCollaboration} />
      <Route path="/console" component={LazyConsolePage} />
      <Route path="/support" component={LazySupport} />
      <Route path="/support/agent" component={LazySupportAgentDashboard} />
      <Route path="/support/command-center" component={LazyAgentCommandCenter} />
      <Route path="/admin/subscriptions" component={LazyAdminSubscriptions} />
      <Route path="/owner/deletion-management" component={LazyDeletionManagement} />
      <Route path="/owner/isds" component={LazyISDSPage} />
      <Route path="/owner/spom" component={LazySpomPage} />
      <Route path="/owner/quality" component={LazyQualityDashboard} />
      <Route path="/owner/sidebar-manager" component={LazySidebarManager} />
      <Route path="/owner/platform-maps" component={LazyPlatformMaps} />
      <Route path="/sovereign-chat" component={LazySovereignChat} />
      <Route path="/owner/platform-registry" component={LazyPlatformRegistry} />
      <Route path="/nova" component={LazyNovaChat} />
      <Route path="/nova/dashboard" component={LazyNovaAIDashboard} />
      <Route path="/nova/operations" component={LazyOperationsDashboard} />
      <Route path="/page-performance" component={LazyPagePerformanceMonitor} />
      <Route path="/pages-completion" component={LazyPagesCompletionTracker} />
      <Route path="/nova/builds" component={LazyBuildManager} />
      <Route path="/mobile-builder" component={LazyMobileAppBuilder} />
      <Route path="/desktop-builder" component={LazyDesktopAppBuilder} />
      <Route path="/maps" component={LazyMapsPage} />
      <Route path="/cicd" component={LazyCICDPipeline} />
      <Route path="/military-security" component={LazyMilitarySecurity} />
      <Route path="/device-testing" component={LazyDeviceTesting} />
      <Route path="/permissions" component={LazyPermissionControl} />
      <Route path="/sovereign/compliance" component={LazySovereignCompliance} />
      <Route path="/owner/staff" component={LazyStaffManagement} />
      <Route path="/owner/sovereign-permissions" component={LazySovereignPermissions} />
      <Route path="/owner/content-moderation" component={LazyContentModeration} />
      <Route path="/owner/control-center" component={LazyOwnerControlCenter} />
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
  const { isAuthenticated, user } = useAuth();
  
  // Load and apply platform branding dynamically
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
      
      {/* Sovereign Analytics Panel - لوحة التحليلات السيادية */}
      <Suspense fallback={null}>
        <LazySovereignIndicator />
      </Suspense>
      
      {/* Sovereign Access Summary - ملخص صلاحيات الوصول */}
      <SovereignAccessSummaryWrapper />
      
      {/* Nova AI Floating Button - زر نوفا العائم */}
      <NovaFloatingButton />
      
      {/* Real Performance Tracking - تتبع الأداء الحقيقي */}
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
