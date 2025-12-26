import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function PageFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8">
      <Skeleton className="w-[300px] h-[32px]" />
      <Skeleton className="w-[200px] h-[20px]" />
      <Skeleton className="w-full max-w-[600px] h-[200px]" />
    </div>
  );
}

function lazyPage(
  importFn: () => Promise<{ default: React.ComponentType }>
): React.FC {
  const LazyComponent = lazy(importFn);
  return function LazyPage() {
    return (
      <Suspense fallback={<PageFallback />}>
        <LazyComponent />
      </Suspense>
    );
  };
}

export const LazyBuilder = lazyPage(() => import('@/pages/builder'));
export const LazyCloudIDE = lazyPage(() => import('@/pages/cloud-ide'));
export const LazyAiAppBuilder = lazyPage(() => import('@/pages/ai-app-builder'));
export const LazyMobileAppBuilder = lazyPage(() => import('@/pages/mobile-app-builder'));
export const LazyDesktopAppBuilder = lazyPage(() => import('@/pages/desktop-app-builder'));
export const LazyTestingGenerator = lazyPage(() => import('@/pages/testing-generator'));
export const LazyBackendGenerator = lazyPage(() => import('@/pages/backend-generator'));
export const LazyGitControl = lazyPage(() => import('@/pages/git-control'));
export const LazyAICopilot = lazyPage(() => import('@/pages/ai-copilot'));
export const LazyMarketplace = lazyPage(() => import('@/pages/marketplace'));
export const LazyCollaboration = lazyPage(() => import('@/pages/collaboration'));
export const LazyMilitarySecurity = lazyPage(() => import('@/pages/military-security'));
export const LazyNovaAIDashboard = lazyPage(() => import('@/pages/nova-ai-dashboard'));
export const LazyNovaSovereignDashboard = lazyPage(() => import('@/pages/nova-sovereign-dashboard'));
export const LazyOwnerDashboard = lazyPage(() => import('@/pages/owner-dashboard'));
export const LazyOwnerControlCenter = lazyPage(() => import('@/pages/owner-control-center'));
export const LazySovereignWorkspace = lazyPage(() => import('@/pages/sovereign-workspace'));
export const LazySovereignPermissions = lazyPage(() => import('@/pages/sovereign-permissions'));
export const LazyPagePerformanceMonitor = lazyPage(() => import('@/pages/page-performance-monitor'));
export const LazyPagesCompletionTracker = lazyPage(() => import('@/pages/pages-completion-tracker'));
export const LazyAnalytics = lazyPage(() => import('@/pages/analytics'));
export const LazyTemplates = lazyPage(() => import('@/pages/templates'));
export const LazyProjects = lazyPage(() => import('@/pages/projects'));
export const LazyInferaAgent = lazyPage(() => import('@/pages/infera-agent'));
export const LazyInferaAgentV2 = lazyPage(() => import('@/pages/infera-agent-v2'));
export const LazyAgentStandalone = lazyPage(() => import('@/pages/agent-standalone'));
export const LazyChatbotBuilder = lazyPage(() => import('@/pages/chatbot-builder'));
export const LazySEOOptimizer = lazyPage(() => import('@/pages/seo-optimizer'));
export const LazyWhiteLabel = lazyPage(() => import('@/pages/white-label'));
export const LazyOwnerCommand = lazyPage(() => import('@/pages/owner-command'));
export const LazyOwnerNotifications = lazyPage(() => import('@/pages/owner-notifications'));
export const LazyOwnerInfrastructure = lazyPage(() => import('@/pages/owner-infrastructure'));
export const LazyOwnerIntegrations = lazyPage(() => import('@/pages/owner-integrations'));
export const LazyOwnerAISovereignty = lazyPage(() => import('@/pages/owner-ai-sovereignty'));
export const LazyOwnerEmailSettings = lazyPage(() => import('@/pages/owner-email-settings'));
export const LazyAISettings = lazyPage(() => import('@/pages/ai-settings'));
export const LazyAIModelRegistry = lazyPage(() => import('@/pages/ai-model-registry'));
export const LazyInferaIntelligenceModels = lazyPage(() => import('@/pages/infera-intelligence-models'));
export const LazyIDEProjects = lazyPage(() => import('@/pages/ide-projects'));
export const LazySovereignControlCenter = lazyPage(() => import('@/pages/sovereign-control-center'));
export const LazySovereignCommandCenter = lazyPage(() => import('@/pages/sovereign-command-center'));
export const LazyAIGovernanceEngine = lazyPage(() => import('@/pages/ai-governance-engine'));
export const LazyDigitalBorders = lazyPage(() => import('@/pages/digital-borders'));
export const LazyPolicyEngine = lazyPage(() => import('@/pages/policy-engine'));
export const LazyTrustCompliance = lazyPage(() => import('@/pages/trust-compliance'));
export const LazyStrategicForecast = lazyPage(() => import('@/pages/strategic-forecast'));
export const LazyDomains = lazyPage(() => import('@/pages/domains'));
export const LazyDomainSearch = lazyPage(() => import('@/pages/domain-search'));
export const LazySettings = lazyPage(() => import('@/pages/settings'));
export const LazyPlatformGenerator = lazyPage(() => import('@/pages/platform-generator'));
export const LazyApiKeys = lazyPage(() => import('@/pages/api-keys'));
export const LazyPaymentsDashboard = lazyPage(() => import('@/pages/payments-dashboard'));
export const LazySubscription = lazyPage(() => import('@/pages/subscription'));
export const LazyNotifications = lazyPage(() => import('@/pages/notifications'));
export const LazyMarketing = lazyPage(() => import('@/pages/marketing'));
export const LazyInvoices = lazyPage(() => import('@/pages/invoices'));
export const LazyIntegrations = lazyPage(() => import('@/pages/integrations'));
export const LazySmartSuggestions = lazyPage(() => import('@/pages/smart-suggestions'));
export const LazyOneClickDeploy = lazyPage(() => import('@/pages/one-click-deploy'));
export const LazySSLCertificates = lazyPage(() => import('@/pages/ssl-certificates'));
export const LazySSHVault = lazyPage(() => import('@/pages/ssh-vault'));
export const LazyGitHubManager = lazyPage(() => import('@/pages/github-manager'));
export const LazySovereignPlans = lazyPage(() => import('@/pages/sovereign-plans'));
export const LazyLogoFactory = lazyPage(() => import('@/pages/logo-factory'));
export const LazyGovernmentCompliance = lazyPage(() => import('@/pages/government-compliance'));
export const LazyOwnerPolicies = lazyPage(() => import('@/pages/owner-policies'));
export const LazyDepartmentsPage = lazyPage(() => import('@/pages/departments'));
export const LazyTasksPage = lazyPage(() => import('@/pages/tasks'));
export const LazyEmployeeDashboard = lazyPage(() => import('@/pages/employee-dashboard'));
export const LazyConsolePage = lazyPage(() => import('@/pages/console'));
export const LazySupport = lazyPage(() => import('@/pages/support'));
export const LazySupportAgentDashboard = lazyPage(() => import('@/pages/support-agent-dashboard'));
export const LazyAgentCommandCenter = lazyPage(() => import('@/pages/agent-command-center'));
export const LazyAdminSubscriptions = lazyPage(() => import('@/pages/admin-subscriptions'));
export const LazyDeletionManagement = lazyPage(() => import('@/pages/deletion-management'));
export const LazyISDSPage = lazyPage(() => import('@/pages/isds'));
export const LazySpomPage = lazyPage(() => import('@/pages/owner/spom'));
export const LazyQualityDashboard = lazyPage(() => import('@/pages/quality-dashboard'));
export const LazySidebarManager = lazyPage(() => import('@/pages/sidebar-manager'));
export const LazySovereignChat = lazyPage(() => import('@/pages/sovereign-chat'));
export const LazyPlatformRegistry = lazyPage(() => import('@/pages/platform-registry'));
export const LazyNovaChat = lazyPage(() => import('@/pages/nova-chat'));
export const LazyOperationsDashboard = lazyPage(() => import('@/pages/operations-dashboard'));
export const LazyBuildManager = lazyPage(() => import('@/pages/build-manager'));
export const LazyMapsPage = lazyPage(() => import('@/pages/maps'));
export const LazyConversationHistory = lazyPage(() => import('@/pages/conversation-history'));
export const LazyCICDPipeline = lazyPage(() => import('@/pages/cicd-pipeline'));
export const LazyDeviceTesting = lazyPage(() => import('@/pages/device-testing'));
export const LazyPermissionControl = lazyPage(() => import('@/pages/permission-control'));
export const LazySovereignCompliance = lazyPage(() => import('@/pages/sovereign-compliance'));
export const LazyStaffManagement = lazyPage(() => import('@/pages/staff-management'));
export const LazyContentModeration = lazyPage(() => import('@/pages/content-moderation'));
export const LazyOwnerAICapabilityControl = lazyPage(() => import('@/pages/owner/ai-capability-control'));
export const LazyAssistantGovernancePage = lazyPage(() => import('@/pages/owner/assistant-governance'));
export const LazyDynamicControlPage = lazyPage(() => import('@/pages/owner/dynamic-control'));
export const LazyNovaPermissionsPage = lazyPage(() => import('@/pages/owner/nova-permissions'));

export const LazyFinanceLanding = lazyPage(() => import('@/pages/finance-landing'));
export const LazyHumanIQLanding = lazyPage(() => import('@/pages/humaniq-landing'));
export const LazyLegalLanding = lazyPage(() => import('@/pages/legal-landing'));
export const LazyAppForgeLanding = lazyPage(() => import('@/pages/appforge-landing'));
export const LazyMarketingLanding = lazyPage(() => import('@/pages/marketing-landing'));
export const LazyMarketplaceLanding = lazyPage(() => import('@/pages/marketplace-landing'));
export const LazyEducationLanding = lazyPage(() => import('@/pages/education-landing'));
export const LazyAttendLanding = lazyPage(() => import('@/pages/attend-landing'));
export const LazySmartDocsLanding = lazyPage(() => import('@/pages/smartdocs-landing'));
export const LazyHospitalityLanding = lazyPage(() => import('@/pages/hospitality-landing'));
export const LazyFeasibilityLanding = lazyPage(() => import('@/pages/feasibility-landing'));
export const LazyCVBuilderLanding = lazyPage(() => import('@/pages/cvbuilder-landing'));
export const LazyJobsLanding = lazyPage(() => import('@/pages/jobs-landing'));
export const LazyTrainAILanding = lazyPage(() => import('@/pages/trainai-landing'));
export const LazyGlobalCloudLanding = lazyPage(() => import('@/pages/globalcloud-landing'));
export const LazyShieldGridLanding = lazyPage(() => import('@/pages/shieldgrid-landing'));
export const LazySmartRemoteLanding = lazyPage(() => import('@/pages/smartremote-landing'));
export const LazyInferaLanding = lazyPage(() => import('@/pages/infera-landing'));
export const LazyEngineControlLanding = lazyPage(() => import('@/pages/engine-control-landing'));
export const LazyEngineLanding = lazyPage(() => import('@/pages/engine-landing'));

export const LazyPitchDeck = lazyPage(() => import('@/pages/pitch-deck'));
export const LazyPitchDeckEngine = lazyPage(() => import('@/pages/pitch-deck-engine'));
export const LazyPitchDeckFinance = lazyPage(() => import('@/pages/pitch-deck-finance'));
export const LazyPitchDeckHumanIQ = lazyPage(() => import('@/pages/pitch-deck-humaniq'));
export const LazyPitchDeckLegal = lazyPage(() => import('@/pages/pitch-deck-legal'));
export const LazyPitchDeckAppForge = lazyPage(() => import('@/pages/pitch-deck-appforge'));
export const LazyPitchDeckMarketing = lazyPage(() => import('@/pages/pitch-deck-marketing'));
export const LazyPitchDeckMarketplace = lazyPage(() => import('@/pages/pitch-deck-marketplace'));
export const LazyPitchDeckEducation = lazyPage(() => import('@/pages/pitch-deck-education'));
export const LazyPitchDeckAttend = lazyPage(() => import('@/pages/pitch-deck-attend'));
export const LazyPitchDeckSmartDocs = lazyPage(() => import('@/pages/pitch-deck-smartdocs'));
export const LazyPitchDeckHospitality = lazyPage(() => import('@/pages/pitch-deck-hospitality'));
export const LazyPitchDeckSmartMemory = lazyPage(() => import('@/pages/pitch-deck-smartmemory'));
export const LazyPitchDeckVisionFeasibility = lazyPage(() => import('@/pages/pitch-deck-visionfeasibility'));
export const LazyPitchDeckCVBuilder = lazyPage(() => import('@/pages/pitch-deck-cvbuilder'));
export const LazyPitchDeckJobsAI = lazyPage(() => import('@/pages/pitch-deck-jobsai'));
export const LazyPitchDeckTrainAI = lazyPage(() => import('@/pages/pitch-deck-trainai'));
export const LazyPitchDeckSovereignFinance = lazyPage(() => import('@/pages/pitch-deck-sovereignfinance'));
export const LazyPitchDeckGlobalCloud = lazyPage(() => import('@/pages/pitch-deck-globalcloud'));
export const LazyPitchDeckShieldGrid = lazyPage(() => import('@/pages/pitch-deck-shieldgrid'));
export const LazyPitchDeckSmartRemote = lazyPage(() => import('@/pages/pitch-deck-smartremote'));
export const LazyPitchDeckMaster = lazyPage(() => import('@/pages/pitch-deck-master'));

export const LazyPlatformMaps = lazyPage(() => import('@/pages/platform-maps'));
export const LazyInvestorNarrative = lazyPage(() => import('@/pages/investor-narrative'));
export const LazyExecutiveSummaries = lazyPage(() => import('@/pages/executive-summaries'));
export const LazyDemoStoryboards = lazyPage(() => import('@/pages/demo-storyboards'));
export const LazySovereignNarrative = lazyPage(() => import('@/pages/sovereign-narrative'));
export const LazyCompetitiveKillMap = lazyPage(() => import('@/pages/competitive-kill-map'));
export const LazySovereignReadiness = lazyPage(() => import('@/pages/sovereign-readiness'));
export const LazyInvestorObjections = lazyPage(() => import('@/pages/investor-objections'));
export const LazyExitStrategy = lazyPage(() => import('@/pages/exit-strategy'));
export const LazyGovernmentAdoption = lazyPage(() => import('@/pages/government-adoption'));
export const LazyEconomicEngine = lazyPage(() => import('@/pages/economic-engine'));
export const LazyGTMPlaybook = lazyPage(() => import('@/pages/gtm-playbook'));
export const LazyTrustProof = lazyPage(() => import('@/pages/trust-proof'));
export const LazyFounderNarrative = lazyPage(() => import('@/pages/founder-narrative'));
export const LazyRedLineRules = lazyPage(() => import('@/pages/red-line-rules'));
export const LazyTimeDominance = lazyPage(() => import('@/pages/time-dominance'));
export const LazyCrisisPlaybook = lazyPage(() => import('@/pages/crisis-playbook'));
export const LazyIrreplaceabilityProof = lazyPage(() => import('@/pages/irreplaceability-proof'));
export const LazyBoardDocuments = lazyPage(() => import('@/pages/board-documents'));
export const LazyGovernmentPack = lazyPage(() => import('@/pages/government-pack'));
export const LazyDocumentGovernance = lazyPage(() => import('@/pages/document-governance'));
export const LazyLaunchSequencing = lazyPage(() => import('@/pages/launch-sequencing'));
export const LazyStakeholderAccess = lazyPage(() => import('@/pages/stakeholder-access'));
export const LazyLaunchChecklist = lazyPage(() => import('@/pages/launch-checklist'));
export const LazyCrisisCommunication = lazyPage(() => import('@/pages/crisis-communication'));
export const LazyWarRoom = lazyPage(() => import('@/pages/war-room'));
export const LazyFounderFramework = lazyPage(() => import('@/pages/founder-framework'));

export const LazyAbout = lazyPage(() => import('@/pages/about'));
export const LazyTerms = lazyPage(() => import('@/pages/terms'));
export const LazyPrivacy = lazyPage(() => import('@/pages/privacy'));
export const LazyRefund = lazyPage(() => import('@/pages/refund'));
export const LazyAIPolicy = lazyPage(() => import('@/pages/ai-policy'));
export const LazyPerformancePolicy = lazyPage(() => import('@/pages/performance-policy'));
export const LazyMultiAppPolicy = lazyPage(() => import('@/pages/multi-app-policy'));
export const LazyVisualIdentity = lazyPage(() => import('@/pages/visual-identity'));
export const LazyIconManagement = lazyPage(() => import('@/pages/icon-management'));
export const LazyContact = lazyPage(() => import('@/pages/contact'));
