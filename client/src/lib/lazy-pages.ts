/**
 * Lazy Page Imports - Governance Compliant
 * All pages are loaded via React.lazy() per routing policy
 */
import { lazy } from "react";

// Core Pages - Guest
export const Landing = lazy(() => import("@/pages/landing"));
export const Auth = lazy(() => import("@/pages/auth"));
export const Pricing = lazy(() => import("@/pages/pricing"));
export const Preview = lazy(() => import("@/pages/preview"));
export const NotFound = lazy(() => import("@/pages/not-found"));

// Core Pages - Authenticated
export const Home = lazy(() => import("@/pages/home"));
export const Builder = lazy(() => import("@/pages/builder"));
export const Projects = lazy(() => import("@/pages/projects"));
export const Templates = lazy(() => import("@/pages/templates"));
export const Support = lazy(() => import("@/pages/support"));

// Owner Dashboard
export const OwnerDashboard = lazy(() => import("@/pages/owner-dashboard"));
export const OwnerCommand = lazy(() => import("@/pages/owner-command"));
export const OwnerNotifications = lazy(() => import("@/pages/owner-notifications"));
export const OwnerInfrastructure = lazy(() => import("@/pages/owner-infrastructure"));
export const OwnerIntegrations = lazy(() => import("@/pages/owner-integrations"));
export const OwnerAISovereignty = lazy(() => import("@/pages/owner-ai-sovereignty"));
export const OwnerEmailSettings = lazy(() => import("@/pages/owner-email-settings"));
export const OwnerPolicies = lazy(() => import("@/pages/owner-policies"));
export const OwnerControlCenter = lazy(() => import("@/pages/owner-control-center"));

// Owner Specialized
export const OwnerAICapabilityControl = lazy(() => import("@/pages/owner/ai-capability-control"));
export const AssistantGovernancePage = lazy(() => import("@/pages/owner/assistant-governance"));
export const DynamicControlPage = lazy(() => import("@/pages/owner/dynamic-control"));
export const NovaPermissionsPage = lazy(() => import("@/pages/owner/nova-permissions"));
export const SpomPage = lazy(() => import("@/pages/owner/spom"));

// Nova AI
export const NovaSovereignDashboard = lazy(() => import("@/pages/nova-sovereign-dashboard"));
export const NovaChat = lazy(() => import("@/pages/nova-chat"));

// Sovereign
export const Sovereign = lazy(() => import("@/pages/sovereign"));
export const SovereignControlCenter = lazy(() => import("@/pages/sovereign-control-center"));
export const SovereignCommandCenter = lazy(() => import("@/pages/sovereign-command-center"));
export const SovereignWorkspaceShell = lazy(() => import("@/pages/sovereign-workspace-shell"));
export const SovereignChat = lazy(() => import("@/pages/sovereign-chat"));
export const SovereignPlans = lazy(() => import("@/pages/sovereign-plans"));
export const SovereignCompliance = lazy(() => import("@/pages/sovereign-compliance"));
export const SovereignPermissions = lazy(() => import("@/pages/sovereign-permissions"));
export const SovereignReadiness = lazy(() => import("@/pages/sovereign-readiness"));
export const SovereignNarrative = lazy(() => import("@/pages/sovereign-narrative"));

// AI & Intelligence
export const AISettings = lazy(() => import("@/pages/ai-settings"));
export const AIModelRegistry = lazy(() => import("@/pages/ai-model-registry"));
export const InferaIntelligenceModels = lazy(() => import("@/pages/infera-intelligence-models"));
export const InferaAgent = lazy(() => import("@/pages/infera-agent"));
export const InferaAgentV2 = lazy(() => import("@/pages/infera-agent-v2"));
export const AgentStandalone = lazy(() => import("@/pages/agent-standalone"));
export const AIGovernanceEngine = lazy(() => import("@/pages/ai-governance-engine"));
export const AICopilot = lazy(() => import("@/pages/ai-copilot"));
export const AiAppBuilder = lazy(() => import("@/pages/ai-app-builder"));

// IDE & Development
export const IDEProjects = lazy(() => import("@/pages/ide-projects"));
export const CloudIDE = lazy(() => import("@/pages/cloud-ide"));
export const GitControl = lazy(() => import("@/pages/git-control"));
export const GitHubManager = lazy(() => import("@/pages/github-manager"));
export const BackendGenerator = lazy(() => import("@/pages/backend-generator"));
export const TestingGenerator = lazy(() => import("@/pages/testing-generator"));
export const CICDPipeline = lazy(() => import("@/pages/cicd-pipeline"));
export const BuildManager = lazy(() => import("@/pages/build-manager"));
export const MobileAppBuilder = lazy(() => import("@/pages/mobile-app-builder"));
export const DesktopAppBuilder = lazy(() => import("@/pages/desktop-app-builder"));

// Domains & Infrastructure
export const Domains = lazy(() => import("@/pages/domains"));
export const DomainSearch = lazy(() => import("@/pages/domain-search"));
export const SSLCertificates = lazy(() => import("@/pages/ssl-certificates"));
export const SSHVault = lazy(() => import("@/pages/ssh-vault"));
export const OneClickDeploy = lazy(() => import("@/pages/one-click-deploy"));

// Governance & Compliance
export const DigitalBorders = lazy(() => import("@/pages/digital-borders"));
export const PolicyEngine = lazy(() => import("@/pages/policy-engine"));
export const TrustCompliance = lazy(() => import("@/pages/trust-compliance"));
export const StrategicForecast = lazy(() => import("@/pages/strategic-forecast"));
export const GovernmentCompliance = lazy(() => import("@/pages/government-compliance"));
export const MilitarySecurity = lazy(() => import("@/pages/military-security"));
export const ContentModeration = lazy(() => import("@/pages/content-moderation"));
export const PermissionControl = lazy(() => import("@/pages/permission-control"));
export const DeviceTesting = lazy(() => import("@/pages/device-testing"));

// Business & Commerce
export const PaymentsDashboard = lazy(() => import("@/pages/payments-dashboard"));
export const PaymentSuccess = lazy(() => import("@/pages/payment-success"));
export const PaymentCancel = lazy(() => import("@/pages/payment-cancel"));
export const Subscription = lazy(() => import("@/pages/subscription"));
export const Invoices = lazy(() => import("@/pages/invoices"));
export const Marketplace = lazy(() => import("@/pages/marketplace"));

// Analytics & Features
export const Analytics = lazy(() => import("@/pages/analytics"));
export const SEOOptimizer = lazy(() => import("@/pages/seo-optimizer"));
export const ChatbotBuilder = lazy(() => import("@/pages/chatbot-builder"));
export const WhiteLabel = lazy(() => import("@/pages/white-label"));
export const SmartSuggestions = lazy(() => import("@/pages/smart-suggestions"));
export const Collaboration = lazy(() => import("@/pages/collaboration"));
export const LogoFactory = lazy(() => import("@/pages/logo-factory"));
export const Marketing = lazy(() => import("@/pages/marketing"));

// Settings & Config
export const Settings = lazy(() => import("@/pages/settings"));
export const ApiKeys = lazy(() => import("@/pages/api-keys"));
export const Notifications = lazy(() => import("@/pages/notifications"));
export const Integrations = lazy(() => import("@/pages/integrations"));
export const PlatformGenerator = lazy(() => import("@/pages/platform-generator"));
export const PlatformRegistry = lazy(() => import("@/pages/platform-registry"));
export const SidebarManager = lazy(() => import("@/pages/sidebar-manager"));

// Staff & Admin
export const DepartmentsPage = lazy(() => import("@/pages/departments"));
export const TasksPage = lazy(() => import("@/pages/tasks"));
export const EmployeeDashboard = lazy(() => import("@/pages/employee-dashboard"));
export const StaffManagement = lazy(() => import("@/pages/staff-management"));
export const SupportAgentDashboard = lazy(() => import("@/pages/support-agent-dashboard"));
export const AgentCommandCenter = lazy(() => import("@/pages/agent-command-center"));
export const AdminSubscriptions = lazy(() => import("@/pages/admin-subscriptions"));
export const DeletionManagement = lazy(() => import("@/pages/deletion-management"));
export const QualityDashboard = lazy(() => import("@/pages/quality-dashboard"));
export const ConsolePage = lazy(() => import("@/pages/console"));
export const OperationsDashboard = lazy(() => import("@/pages/operations-dashboard"));

// ISDS & SPOM
export const ISDSPage = lazy(() => import("@/pages/isds"));
export const ConversationHistory = lazy(() => import("@/pages/conversation-history"));
export const MapsPage = lazy(() => import("@/pages/maps"));
export const PlatformMaps = lazy(() => import("@/pages/platform-maps"));

// Platform Landing Pages
export const InferaLanding = lazy(() => import("@/pages/infera-landing"));
export const EngineControlLanding = lazy(() => import("@/pages/engine-control-landing"));
export const EngineLanding = lazy(() => import("@/pages/engine-landing"));
export const FinanceLanding = lazy(() => import("@/pages/finance-landing"));
export const HumanIQLanding = lazy(() => import("@/pages/humaniq-landing"));
export const LegalLanding = lazy(() => import("@/pages/legal-landing"));
export const AppForgeLanding = lazy(() => import("@/pages/appforge-landing"));
export const MarketingLanding = lazy(() => import("@/pages/marketing-landing"));
export const MarketplaceLanding = lazy(() => import("@/pages/marketplace-landing"));
export const EducationLanding = lazy(() => import("@/pages/education-landing"));
export const AttendLanding = lazy(() => import("@/pages/attend-landing"));
export const SmartDocsLanding = lazy(() => import("@/pages/smartdocs-landing"));
export const HospitalityLanding = lazy(() => import("@/pages/hospitality-landing"));
export const FeasibilityLanding = lazy(() => import("@/pages/feasibility-landing"));
export const CVBuilderLanding = lazy(() => import("@/pages/cvbuilder-landing"));
export const JobsLanding = lazy(() => import("@/pages/jobs-landing"));
export const TrainAILanding = lazy(() => import("@/pages/trainai-landing"));
export const GlobalCloudLanding = lazy(() => import("@/pages/globalcloud-landing"));
export const ShieldGridLanding = lazy(() => import("@/pages/shieldgrid-landing"));
export const SmartRemoteLanding = lazy(() => import("@/pages/smartremote-landing"));

// Pitch Decks
export const PitchDeck = lazy(() => import("@/pages/pitch-deck"));
export const PitchDeckEngine = lazy(() => import("@/pages/pitch-deck-engine"));
export const PitchDeckFinance = lazy(() => import("@/pages/pitch-deck-finance"));
export const PitchDeckHumanIQ = lazy(() => import("@/pages/pitch-deck-humaniq"));
export const PitchDeckLegal = lazy(() => import("@/pages/pitch-deck-legal"));
export const PitchDeckAppForge = lazy(() => import("@/pages/pitch-deck-appforge"));
export const PitchDeckMarketing = lazy(() => import("@/pages/pitch-deck-marketing"));
export const PitchDeckMarketplace = lazy(() => import("@/pages/pitch-deck-marketplace"));
export const PitchDeckEducation = lazy(() => import("@/pages/pitch-deck-education"));
export const PitchDeckAttend = lazy(() => import("@/pages/pitch-deck-attend"));
export const PitchDeckSmartDocs = lazy(() => import("@/pages/pitch-deck-smartdocs"));
export const PitchDeckHospitality = lazy(() => import("@/pages/pitch-deck-hospitality"));
export const PitchDeckSmartMemory = lazy(() => import("@/pages/pitch-deck-smartmemory"));
export const PitchDeckVisionFeasibility = lazy(() => import("@/pages/pitch-deck-visionfeasibility"));
export const PitchDeckCVBuilder = lazy(() => import("@/pages/pitch-deck-cvbuilder"));
export const PitchDeckJobsAI = lazy(() => import("@/pages/pitch-deck-jobsai"));
export const PitchDeckTrainAI = lazy(() => import("@/pages/pitch-deck-trainai"));
export const PitchDeckSovereignFinance = lazy(() => import("@/pages/pitch-deck-sovereignfinance"));
export const PitchDeckGlobalCloud = lazy(() => import("@/pages/pitch-deck-globalcloud"));
export const PitchDeckShieldGrid = lazy(() => import("@/pages/pitch-deck-shieldgrid"));
export const PitchDeckSmartRemote = lazy(() => import("@/pages/pitch-deck-smartremote"));
export const PitchDeckMaster = lazy(() => import("@/pages/pitch-deck-master"));

// Investor & Strategic
export const InvestorNarrative = lazy(() => import("@/pages/investor-narrative"));
export const ExecutiveSummaries = lazy(() => import("@/pages/executive-summaries"));
export const DemoStoryboards = lazy(() => import("@/pages/demo-storyboards"));
export const CompetitiveKillMap = lazy(() => import("@/pages/competitive-kill-map"));
export const InvestorObjections = lazy(() => import("@/pages/investor-objections"));
export const ExitStrategy = lazy(() => import("@/pages/exit-strategy"));
export const GovernmentAdoption = lazy(() => import("@/pages/government-adoption"));
export const EconomicEngine = lazy(() => import("@/pages/economic-engine"));
export const GTMPlaybook = lazy(() => import("@/pages/gtm-playbook"));
export const TrustProof = lazy(() => import("@/pages/trust-proof"));
export const FounderNarrative = lazy(() => import("@/pages/founder-narrative"));
export const RedLineRules = lazy(() => import("@/pages/red-line-rules"));
export const TimeDominance = lazy(() => import("@/pages/time-dominance"));
export const CrisisPlaybook = lazy(() => import("@/pages/crisis-playbook"));
export const IrreplaceabilityProof = lazy(() => import("@/pages/irreplaceability-proof"));
export const BoardDocuments = lazy(() => import("@/pages/board-documents"));
export const GovernmentPack = lazy(() => import("@/pages/government-pack"));
export const DocumentGovernance = lazy(() => import("@/pages/document-governance"));
export const LaunchSequencing = lazy(() => import("@/pages/launch-sequencing"));
export const StakeholderAccess = lazy(() => import("@/pages/stakeholder-access"));
export const LaunchChecklist = lazy(() => import("@/pages/launch-checklist"));
export const CrisisCommunication = lazy(() => import("@/pages/crisis-communication"));
export const WarRoom = lazy(() => import("@/pages/war-room"));
export const FounderFramework = lazy(() => import("@/pages/founder-framework"));

// Legal & Policies
export const About = lazy(() => import("@/pages/about"));
export const Terms = lazy(() => import("@/pages/terms"));
export const Privacy = lazy(() => import("@/pages/privacy"));
export const Refund = lazy(() => import("@/pages/refund"));
export const AIPolicy = lazy(() => import("@/pages/ai-policy"));
export const PerformancePolicy = lazy(() => import("@/pages/performance-policy"));
export const MultiAppPolicy = lazy(() => import("@/pages/multi-app-policy"));
export const VisualIdentity = lazy(() => import("@/pages/visual-identity"));
export const IconManagement = lazy(() => import("@/pages/icon-management"));
export const Contact = lazy(() => import("@/pages/contact"));
