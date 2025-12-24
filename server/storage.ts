import {
  type User,
  type InsertUser,
  type UpsertUser,
  type Project,
  type InsertProject,
  type Message,
  type InsertMessage,
  type Template,
  type InsertTemplate,
  type ProjectVersion,
  type InsertProjectVersion,
  type ShareLink,
  type InsertShareLink,
  type Component,
  type InsertComponent,
  type SubscriptionPlan,
  type InsertSubscriptionPlan,
  type UserSubscription,
  type InsertUserSubscription,
  type Payment,
  type InsertPayment,
  type AiUsage,
  type InsertAiUsage,
  type OtpCode,
  type InsertOtpCode,
  type Chatbot,
  type InsertChatbot,
  type AiAssistant,
  type InsertAiAssistant,
  type AssistantInstruction,
  type InsertAssistantInstruction,
  type OwnerSettings,
  type InsertOwnerSettings,
  type AuditLog,
  type InsertAuditLog,
  type PaymentMethod,
  type InsertPaymentMethod,
  type PaymentTransaction,
  type InsertPaymentTransaction,
  type AuthMethod,
  type InsertAuthMethod,
  type AiModel,
  type InsertAiModel,
  type AiUsagePolicy,
  type InsertAiUsagePolicy,
  type AiCostTracking,
  type InsertAiCostTracking,
  type EmergencyControl,
  type InsertEmergencyControl,
  type FeatureFlag,
  type InsertFeatureFlag,
  type SystemAnnouncement,
  type InsertSystemAnnouncement,
  type AdminRole,
  type InsertAdminRole,
  type UserAdminRole,
  type InsertUserAdminRole,
  type PlatformMetrics,
  type InsertPlatformMetrics,
  type SubscriptionEvent,
  type InsertSubscriptionEvent,
  type SovereignAssistant,
  type InsertSovereignAssistant,
  type SovereignCommand,
  type InsertSovereignCommand,
  type SovereignAction,
  type InsertSovereignAction,
  type SovereignActionLog,
  type InsertSovereignActionLog,
  type SovereignPolicy,
  type InsertSovereignPolicy,
  type AiBuildSession,
  type InsertAiBuildSession,
  type AiBuildTask,
  type Notification,
  type InsertNotification,
  type Collaborator,
  type InsertCollaborator,
  type ProjectComment,
  type InsertProjectComment,
  notifications,
  collaborators,
  projectComments,
  type InsertAiBuildTask,
  type AiBuildArtifact,
  type InsertAiBuildArtifact,
  type IsdsProject as DevProject,
  type InsertIsdsProject as InsertDevProject,
  type ProjectFile,
  type InsertProjectFile,
  type RuntimeInstance,
  type InsertRuntimeInstance,
  type ConsoleLog,
  type InsertConsoleLog,
  type DevDatabaseTable,
  type InsertDevDatabaseTable,
  type DevDatabaseColumn,
  type InsertDevDatabaseColumn,
  type DevDatabaseRelationship,
  type InsertDevDatabaseRelationship,
  users,
  projects,
  messages,
  templates,
  projectVersions,
  shareLinks,
  components,
  subscriptionPlans,
  userSubscriptions,
  payments,
  aiUsage,
  otpCodes,
  chatbots,
  aiAssistants,
  assistantInstructions,
  ownerSettings,
  auditLogs,
  paymentMethods,
  paymentTransactions,
  authMethods,
  aiModels,
  aiUsagePolicies,
  aiCostTracking,
  emergencyControls,
  featureFlags,
  systemAnnouncements,
  adminRoles,
  userAdminRoles,
  platformMetrics,
  subscriptionEvents,
  sovereignAssistants,
  sovereignCommands,
  sovereignActions,
  sovereignActionLogs,
  sovereignPolicies,
  aiBuildSessions,
  aiBuildTasks,
  aiBuildArtifacts,
  isdsProjects as devProjects,
  projectFiles,
  runtimeInstances,
  consoleLogs,
  devDatabaseTables,
  devDatabaseColumns,
  devDatabaseRelationships,
  sovereignAuditLogs,
  type InsertSovereignAuditLog,
  type SovereignAuditLog,
  sovereignPlatforms,
  type InsertSovereignPlatform,
  type SovereignPlatformRecord,
  systemSettings,
  type InsertSystemSetting,
  type SystemSettingRecord,
  aiLayers,
  type AILayerRecord,
  type InsertAILayer,
  aiPowerConfigs,
  type AIPowerConfigRecord,
  type InsertAIPowerConfig,
  externalAIProviders,
  type ExternalAIProviderRecord,
  type InsertExternalAIProvider,
  subscriberAILimits,
  type SubscriberAILimitRecord,
  type InsertSubscriberAILimit,
  sovereignAIAgents,
  type SovereignAIAgentRecord,
  type InsertSovereignAIAgent,
  aiKillSwitchState,
  type AIKillSwitchStateRecord,
  type InsertAIKillSwitchState,
  aiSovereigntyAuditLogs,
  type AISovereigntyAuditLogRecord,
  type InsertAISovereigntyAuditLog,
  aiConstitution,
  type AIConstitutionRecord,
  type InsertAIConstitution,
  customDomains,
  type CustomDomainRecord,
  type InsertCustomDomain,
  domainVerifications,
  invoices,
  type Invoice,
  type InsertInvoice,
  marketingCampaigns,
  type MarketingCampaign,
  type InsertMarketingCampaign,
  analyticsEvents,
  type AnalyticsEvent,
  type InsertAnalyticsEvent,
  type DomainVerificationRecord,
  type InsertDomainVerification,
  sslCertificates,
  type SSLCertificateRecord,
  type InsertSSLCertificate,
  domainAuditLogs,
  type DomainAuditLogRecord,
  type InsertDomainAuditLog,
  tenantDomainQuotas,
  type TenantDomainQuotaRecord,
  type InsertTenantDomainQuota,
  apiKeys,
  type ApiKey,
  type InsertApiKey,
  apiKeyUsageLogs,
  type ApiKeyUsageLog,
  type InsertApiKeyUsageLog,
  rateLimitPolicies,
  type RateLimitPolicy,
  type InsertRateLimitPolicy,
  webhookEndpoints,
  type WebhookEndpoint,
  type InsertWebhookEndpoint,
  webhookDeliveries,
  type WebhookDelivery,
  type InsertWebhookDelivery,
  apiAuditLogs,
  type ApiAuditLog,
  type InsertApiAuditLog,
  apiConfiguration,
  type ApiConfiguration,
  type InsertApiConfiguration,
  serviceProviders,
  type ServiceProvider,
  type InsertServiceProvider,
  providerApiKeys,
  type ProviderApiKey,
  type InsertProviderApiKey,
  providerServices,
  type ProviderService,
  type InsertProviderService,
  providerUsage,
  type ProviderUsage,
  type InsertProviderUsage,
  providerAlerts,
  type ProviderAlert,
  type InsertProviderAlert,
  failoverGroups,
  type FailoverGroup,
  type InsertFailoverGroup,
  integrationAuditLogs,
  type IntegrationAuditLog,
  type InsertIntegrationAuditLog,
  userLocations,
  type UserLocation,
  type InsertUserLocation,
  resourceUsage,
  type ResourceUsage,
  type InsertResourceUsage,
  userUsageLimits,
  type UserUsageLimit,
  type InsertUserUsageLimit,
  pricingConfig,
  type PricingConfig,
  type InsertPricingConfig,
  usageAlerts,
  type UsageAlert,
  type InsertUsageAlert,
  dailyUsageAggregates,
  type DailyUsageAggregate,
  type InsertDailyUsageAggregate,
  monthlyUsageSummary,
  type MonthlyUsageSummary,
  type InsertMonthlyUsageSummary,
  // Sovereign Owner Control Panel
  sovereignOwnerProfile,
  type SovereignOwnerProfile,
  type InsertSovereignOwnerProfile,
  ownershipTransfers,
  type OwnershipTransfer,
  type InsertOwnershipTransfer,
  aiPolicies,
  type AIPolicy,
  type InsertAIPolicy,
  costAttributions,
  type CostAttribution,
  type InsertCostAttribution,
  marginGuardConfigs,
  type MarginGuardConfig,
  type InsertMarginGuardConfig,
  immutableAuditTrail,
  type ImmutableAuditTrail,
  type InsertImmutableAuditTrail,
  postMortemReports,
  type PostMortemReport,
  type InsertPostMortemReport,
  securityIncidents,
  type SecurityIncident,
  type InsertSecurityIncident,
  // Sovereign Infrastructure - Audit & Logs
  infrastructureAuditLogs,
  type InfrastructureAuditLog,
  type InsertInfrastructureAuditLog,
  providerErrorLogs,
  type ProviderErrorLog,
  type InsertProviderErrorLog,
  // Sovereign Infrastructure - Providers
  infrastructureProviders,
  type InfrastructureProvider,
  type InsertInfrastructureProvider,
  providerCredentials,
  type ProviderCredential,
  type InsertProviderCredential,
  infrastructureServers,
  type InfrastructureServer,
  type InsertInfrastructureServer,
  deploymentTemplates,
  type DeploymentTemplate,
  type InsertDeploymentTemplate,
  deploymentRuns,
  type DeploymentRun,
  type InsertDeploymentRun,
  infrastructureBackups,
  type InfrastructureBackup,
  type InsertInfrastructureBackup,
  // External Integration Gateway
  externalIntegrationSessions,
  type ExternalIntegrationSession,
  type InsertExternalIntegrationSession,
  externalIntegrationLogs,
  type ExternalIntegrationLog,
  type InsertExternalIntegrationLog,
  // Cost Intelligence
  infrastructureCostAlerts,
  type InfrastructureCostAlert,
  type InsertInfrastructureCostAlert,
  infrastructureBudgets,
  type InfrastructureBudget,
  type InsertInfrastructureBudget,
  // Sovereign Notification System (SRINS)
  sovereignNotifications,
  type SovereignNotification,
  type InsertSovereignNotification,
  notificationTemplates,
  type NotificationTemplate,
  type InsertNotificationTemplate,
  userNotificationPreferences,
  type UserNotificationPreferences,
  type InsertUserNotificationPreferences,
  notificationEscalations,
  type NotificationEscalation,
  type InsertNotificationEscalation,
  notificationAnalytics,
  type NotificationAnalytics,
  type InsertNotificationAnalytics,
  // AI Smart Suggestions System
  codeAnalysisSessions,
  type CodeAnalysisSession,
  type InsertCodeAnalysisSession,
  smartSuggestions,
  type SmartSuggestion,
  type InsertSmartSuggestion,
  analysisRules,
  type AnalysisRule,
  type InsertAnalysisRule,
  projectImprovementHistory,
  type ProjectImprovementHistory,
  type InsertProjectImprovementHistory,
  projectBackends,
  type ProjectBackend,
  type InsertProjectBackend,
  projectDatabases,
  type ProjectDatabase,
  type InsertProjectDatabase,
  projectAuthConfigs,
  type ProjectAuthConfig,
  type InsertProjectAuthConfig,
  projectProvisioningJobs,
  type ProjectProvisioningJob,
  type InsertProjectProvisioningJob,
  // Deletion & Recycle Bin System
  deletedItems,
  type DeletedItem,
  type InsertDeletedItem,
  recycleBin,
  type RecycleBinItem,
  type InsertRecycleBin,
  deletionAuditLogs,
  type DeletionAuditLog,
  type InsertDeletionAuditLog,
  // Collaboration Engine
  collaborationContexts,
  type CollaborationContext,
  type InsertCollaborationContext,
  collaborationMessages,
  type CollaborationMessage,
  type InsertCollaborationMessage,
  collaborationDecisions,
  type CollaborationDecision,
  type InsertCollaborationDecision,
  aiCollaborators,
  type AICollaborator,
  type InsertAICollaborator,
  activeContributors,
  type ActiveContributor,
  type InsertActiveContributor,
  // Payment System Types
  webhookLogs,
  type WebhookLog,
  type InsertWebhookLog,
  billingProfiles,
  type BillingProfile,
  type InsertBillingProfile,
  aiBillingInsights,
  type AiBillingInsight,
  type InsertAiBillingInsight,
  refunds,
  type Refund,
  type InsertRefund,
  paymentRetryQueue,
  type PaymentRetry,
  type InsertPaymentRetry,
  auditRuns,
  auditTargets,
  auditFindings,
  type AuditRun,
  type InsertAuditRun,
  type AuditTarget,
  type InsertAuditTarget,
  type AuditFinding,
  type InsertAuditFinding,
  type WhiteLabelSettings,
  type InsertWhiteLabelSettings,
  whiteLabelSettings,
  // INFERA Engine Platform Linking Unit
  inferaPlatforms,
  type InferaPlatform,
  type InsertInferaPlatform,
  platformLinks,
  type PlatformLink,
  type InsertPlatformLink,
  platformServices,
  type PlatformService,
  type InsertPlatformService,
  platformCertificates,
  type PlatformCertificate,
  type InsertPlatformCertificate,
  // Nova Conversation Engine
  novaSessions,
  type NovaSession,
  type InsertNovaSession,
  novaMessages,
  type NovaMessage,
  type InsertNovaMessage,
  novaDecisions,
  type NovaDecision,
  type InsertNovaDecision,
  novaPreferences,
  type NovaPreferences,
  type InsertNovaPreferences,
  novaProjectContexts,
  type NovaProjectContext,
  type InsertNovaProjectContext,
  // Knowledge Graph
  projectKnowledgeNodes,
  type ProjectKnowledgeNode,
  type InsertProjectKnowledgeNode,
  projectKnowledgeEdges,
  type ProjectKnowledgeEdge,
  type InsertProjectKnowledgeEdge,
  projectEventLog,
  type ProjectEventLog,
  type InsertProjectEventLog,
  architecturePatterns,
  type ArchitecturePattern,
  type InsertArchitecturePattern,
  // Operations Platform
  deploymentConfigs,
  type DeploymentConfig,
  type InsertDeploymentConfig,
  deployments,
  type Deployment,
  type InsertDeployment,
  healthAlerts,
  type HealthAlert,
  type InsertHealthAlert,
  metricsSnapshots,
  // Multi-Surface Generator
  buildConfigs,
  type BuildConfig,
  type InsertBuildConfig,
  buildJobs,
  type BuildJob,
  type InsertBuildJob,
  // Unified Blueprint System
  unifiedBlueprints,
  type UnifiedBlueprint,
  type InsertUnifiedBlueprint,
  // Departments & Tasks
  departments,
  type Department,
  type InsertDepartment,
  departmentMembers,
  type DepartmentMember,
  type InsertDepartmentMember,
  employeeTasks,
  type EmployeeTask,
  type InsertEmployeeTask,
  taskComments,
  type TaskComment,
  type InsertTaskComment,
  permissionOverrides,
  type PermissionOverride,
  type InsertPermissionOverride,
  aiAssistantCapabilities,
  type AiAssistantCapability,
  type InsertAiAssistantCapability,
  // Dynamic Configuration System
  platformSettings,
  type PlatformSetting,
  type InsertPlatformSetting,
  dynamicFeatures,
  type DynamicFeature,
  type InsertDynamicFeature,
  dynamicPages,
  type DynamicPage,
  type InsertDynamicPage,
  dynamicComponents,
  type DynamicComponent,
  type InsertDynamicComponent,
  dynamicApiEndpoints,
  type DynamicApiEndpoint,
  type InsertDynamicApiEndpoint,
  dynamicWorkflows,
  type DynamicWorkflow,
  type InsertDynamicWorkflow,
  // Assistant Relationships & Collaboration
  assistantRelationships,
  type AssistantRelationship,
  type InsertAssistantRelationship,
  assistantConversations,
  type AssistantConversation,
  type InsertAssistantConversation,
  assistantWorkgroups,
  type AssistantWorkgroup,
  type InsertAssistantWorkgroup,
  assistantPermissionAudit,
  type AssistantPermissionAudit,
  type InsertAssistantPermissionAudit,
  // Sovereign Navigation System
  navigationResources,
  type NavigationResource,
  type InsertNavigationResource,
  navigationShortcuts,
  type NavigationShortcut,
  type InsertNavigationShortcut,
  navigationUserState,
  type NavigationUserState,
  type InsertNavigationUserState,
  navigationSearchHistory,
  type NavigationSearchHistory,
  type InsertNavigationSearchHistory,
  navigationAnalytics,
  type NavigationAnalytics,
  type InsertNavigationAnalytics,
  // Platform Icon Version Control
  platformIcons,
  type PlatformIcon,
  type InsertPlatformIcon,
  platformIconVersions,
  type PlatformIconVersion,
  type InsertPlatformIconVersion,
  iconRegenerationRequests,
  type IconRegenerationRequest,
  type InsertIconRegenerationRequest,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, gt, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  upsertUser(userData: UpsertUser): Promise<User>; // For OAuth/Replit Auth
  
  // User Governance (Owner only)
  suspendUser(userId: string, ownerId: string, reason: string): Promise<User | undefined>;
  banUser(userId: string, ownerId: string, reason: string): Promise<User | undefined>;
  reactivateUser(userId: string, ownerId: string, reason?: string): Promise<User | undefined>;
  updateUserPermissions(userId: string, permissions: string[]): Promise<User | undefined>;
  updateUserLoginInfo(userId: string, ip: string): Promise<User | undefined>;
  incrementFailedLogin(userId: string): Promise<User | undefined>;
  resetFailedLogin(userId: string): Promise<User | undefined>;
  getUsersByStatus(status: string): Promise<User[]>;
  
  // Subscription Plans
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlan(id: string): Promise<SubscriptionPlan | undefined>;
  getSubscriptionPlanByRole(role: string): Promise<SubscriptionPlan | undefined>;
  updateSubscriptionPlan(id: string, updates: Partial<SubscriptionPlan>): Promise<SubscriptionPlan | undefined>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  
  // User Subscriptions
  getUserSubscription(userId: string): Promise<UserSubscription | undefined>;
  getAllUserSubscriptions(): Promise<UserSubscription[]>;
  createUserSubscription(subscription: InsertUserSubscription): Promise<UserSubscription>;
  updateUserSubscription(id: string, subscription: Partial<InsertUserSubscription>): Promise<UserSubscription | undefined>;
  
  // Payments
  getPaymentsByUser(userId: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, payment: Partial<InsertPayment>): Promise<Payment | undefined>;
  
  // AI Usage
  getAiUsage(userId: string, month: string): Promise<AiUsage | undefined>;
  createAiUsage(usage: InsertAiUsage): Promise<AiUsage>;
  updateAiUsage(id: string, usage: Partial<InsertAiUsage>): Promise<AiUsage | undefined>;
  
  // Projects
  getProjects(): Promise<Project[]>;
  getProjectsByUser(userId: string): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;
  ensureSystemProject(): Promise<Project>;
  
  // Recycle Bin
  getDeletedProjects(userId?: string): Promise<Project[]>;
  getDeletedProject(id: string): Promise<Project | undefined>;
  restoreProject(id: string): Promise<boolean>;
  permanentlyDeleteProject(id: string): Promise<boolean>;
  
  // Messages
  getMessagesByProject(projectId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Templates
  getTemplates(): Promise<Template[]>;
  getTemplate(id: string): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;

  // Project Versions
  getProjectVersions(projectId: string): Promise<ProjectVersion[]>;
  getProjectVersion(id: string): Promise<ProjectVersion | undefined>;
  createProjectVersion(version: InsertProjectVersion): Promise<ProjectVersion>;

  // Share Links
  getShareLink(shareCode: string): Promise<ShareLink | undefined>;
  getShareLinksByProject(projectId: string): Promise<ShareLink[]>;
  createShareLink(link: InsertShareLink): Promise<ShareLink>;
  deactivateShareLink(id: string): Promise<boolean>;

  // Notifications
  getNotifications(userId: string): Promise<Notification[]>;
  getUnreadNotificationsCount(userId: string): Promise<number>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: string, userId: string): Promise<Notification | undefined>;
  markAllNotificationsRead(userId: string): Promise<void>;
  deleteNotification(id: string, userId: string): Promise<boolean>;

  // Collaborators
  getCollaborators(projectId: string): Promise<Collaborator[]>;
  getCollaborationInvites(userId: string): Promise<Collaborator[]>;
  createCollaborator(collaborator: InsertCollaborator): Promise<Collaborator>;
  respondToCollaboration(id: string, userId: string, accept: boolean): Promise<Collaborator | undefined>;
  deleteCollaborator(id: string): Promise<boolean>;

  // Components
  getComponents(): Promise<Component[]>;
  getComponentsByCategory(category: string): Promise<Component[]>;
  getComponent(id: string): Promise<Component | undefined>;
  createComponent(component: InsertComponent): Promise<Component>;
  
  // OTP Codes
  createOtpCode(otp: InsertOtpCode): Promise<OtpCode>;
  getValidOtpCode(userId: string, code: string): Promise<OtpCode | undefined>;
  markOtpUsed(id: string): Promise<void>;
  
  // Chatbots
  getChatbotsByUser(userId: string): Promise<Chatbot[]>;
  getChatbot(id: string): Promise<Chatbot | undefined>;
  createChatbot(chatbot: InsertChatbot): Promise<Chatbot>;
  updateChatbot(id: string, chatbot: Partial<InsertChatbot>): Promise<Chatbot | undefined>;
  deleteChatbot(id: string): Promise<boolean>;
  
  // AI Assistants (Owner)
  getAiAssistants(): Promise<AiAssistant[]>;
  getAiAssistant(id: string): Promise<AiAssistant | undefined>;
  createAiAssistant(assistant: InsertAiAssistant): Promise<AiAssistant>;
  updateAiAssistant(id: string, assistant: Partial<InsertAiAssistant>): Promise<AiAssistant | undefined>;
  
  // Assistant Instructions
  getInstructionsByAssistant(assistantId: string): Promise<AssistantInstruction[]>;
  getAllInstructions(): Promise<AssistantInstruction[]>;
  createInstruction(instruction: InsertAssistantInstruction): Promise<AssistantInstruction>;
  updateInstruction(id: string, instruction: Partial<InsertAssistantInstruction>): Promise<AssistantInstruction | undefined>;
  
  // Owner Settings
  getOwnerSettings(userId: string): Promise<OwnerSettings | undefined>;
  createOwnerSettings(settings: InsertOwnerSettings): Promise<OwnerSettings>;
  updateOwnerSettings(userId: string, settings: Partial<InsertOwnerSettings>): Promise<OwnerSettings | undefined>;
  
  // Audit Logs
  getAuditLogs(limit?: number): Promise<AuditLog[]>;
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  
  // Payment Methods (Owner)
  getPaymentMethods(): Promise<PaymentMethod[]>;
  getActivePaymentMethods(): Promise<PaymentMethod[]>;
  getPaymentMethod(id: string): Promise<PaymentMethod | undefined>;
  createPaymentMethod(method: InsertPaymentMethod): Promise<PaymentMethod>;
  updatePaymentMethod(id: string, method: Partial<InsertPaymentMethod>): Promise<PaymentMethod | undefined>;
  togglePaymentMethod(id: string, isActive: boolean): Promise<PaymentMethod | undefined>;
  deletePaymentMethod(id: string): Promise<boolean>;
  
  // Payment Transactions
  getPaymentTransactions(limit?: number): Promise<PaymentTransaction[]>;
  getPaymentTransactionsByUser(userId: string): Promise<PaymentTransaction[]>;
  getPaymentTransaction(id: string): Promise<PaymentTransaction | undefined>;
  createPaymentTransaction(transaction: InsertPaymentTransaction): Promise<PaymentTransaction>;
  updatePaymentTransaction(id: string, transaction: Partial<InsertPaymentTransaction>): Promise<PaymentTransaction | undefined>;
  
  // Authentication Methods (Owner)
  getAuthMethods(): Promise<AuthMethod[]>;
  getActiveAuthMethods(): Promise<AuthMethod[]>;
  getVisibleAuthMethods(): Promise<AuthMethod[]>;
  getAuthMethod(id: string): Promise<AuthMethod | undefined>;
  getAuthMethodByKey(key: string): Promise<AuthMethod | undefined>;
  createAuthMethod(method: InsertAuthMethod): Promise<AuthMethod>;
  updateAuthMethod(id: string, method: Partial<InsertAuthMethod>): Promise<AuthMethod | undefined>;
  toggleAuthMethod(id: string, isActive: boolean): Promise<AuthMethod | undefined>;
  toggleAuthMethodVisibility(id: string, isVisible: boolean): Promise<AuthMethod | undefined>;
  deleteAuthMethod(id: string): Promise<boolean>;
  
  // AI Models (Owner)
  getAiModels(): Promise<AiModel[]>;
  getActiveAiModels(): Promise<AiModel[]>;
  getAiModel(id: string): Promise<AiModel | undefined>;
  getDefaultAiModel(): Promise<AiModel | undefined>;
  createAiModel(model: InsertAiModel): Promise<AiModel>;
  updateAiModel(id: string, model: Partial<InsertAiModel>): Promise<AiModel | undefined>;
  toggleAiModel(id: string, isActive: boolean): Promise<AiModel | undefined>;
  setDefaultAiModel(id: string): Promise<AiModel | undefined>;
  deleteAiModel(id: string): Promise<boolean>;
  
  // AI Usage Policies (Owner)
  getAiUsagePolicies(): Promise<AiUsagePolicy[]>;
  getAiUsagePolicy(id: string): Promise<AiUsagePolicy | undefined>;
  getAiUsagePolicyByPlan(planRole: string): Promise<AiUsagePolicy | undefined>;
  createAiUsagePolicy(policy: InsertAiUsagePolicy): Promise<AiUsagePolicy>;
  updateAiUsagePolicy(id: string, policy: Partial<InsertAiUsagePolicy>): Promise<AiUsagePolicy | undefined>;
  
  // AI Cost Tracking
  getAiCostTracking(date: string): Promise<AiCostTracking[]>;
  getAiCostTrackingByUser(userId: string, startDate: string, endDate: string): Promise<AiCostTracking[]>;
  createAiCostTracking(tracking: InsertAiCostTracking): Promise<AiCostTracking>;
  getAiCostSummary(startDate: string, endDate: string): Promise<{ totalCost: number; totalTokens: number; byModel: Record<string, number>; byFeature: Record<string, number> }>;
  
  // Emergency Controls
  getEmergencyControls(): Promise<EmergencyControl[]>;
  getActiveEmergencyControls(): Promise<EmergencyControl[]>;
  getEmergencyControl(id: string): Promise<EmergencyControl | undefined>;
  createEmergencyControl(control: InsertEmergencyControl): Promise<EmergencyControl>;
  deactivateEmergencyControl(id: string, deactivatedBy: string): Promise<EmergencyControl | undefined>;
  
  // Feature Flags
  getFeatureFlags(): Promise<FeatureFlag[]>;
  getFeatureFlag(id: string): Promise<FeatureFlag | undefined>;
  getFeatureFlagByKey(key: string): Promise<FeatureFlag | undefined>;
  createFeatureFlag(flag: InsertFeatureFlag): Promise<FeatureFlag>;
  updateFeatureFlag(id: string, flag: Partial<InsertFeatureFlag>): Promise<FeatureFlag | undefined>;
  toggleFeatureFlag(id: string, isEnabled: boolean): Promise<FeatureFlag | undefined>;
  deleteFeatureFlag(id: string): Promise<boolean>;
  
  // System Announcements
  getSystemAnnouncements(): Promise<SystemAnnouncement[]>;
  getActiveSystemAnnouncements(): Promise<SystemAnnouncement[]>;
  getSystemAnnouncement(id: string): Promise<SystemAnnouncement | undefined>;
  createSystemAnnouncement(announcement: InsertSystemAnnouncement): Promise<SystemAnnouncement>;
  updateSystemAnnouncement(id: string, announcement: Partial<InsertSystemAnnouncement>): Promise<SystemAnnouncement | undefined>;
  deleteSystemAnnouncement(id: string): Promise<boolean>;
  
  // Admin Roles (RBAC)
  getAdminRoles(): Promise<AdminRole[]>;
  getAdminRole(id: string): Promise<AdminRole | undefined>;
  getAdminRoleByKey(key: string): Promise<AdminRole | undefined>;
  createAdminRole(role: InsertAdminRole): Promise<AdminRole>;
  updateAdminRole(id: string, role: Partial<InsertAdminRole>): Promise<AdminRole | undefined>;
  deleteAdminRole(id: string): Promise<boolean>;
  
  // User Admin Roles
  getUserAdminRoles(userId: string): Promise<UserAdminRole[]>;
  assignAdminRole(assignment: InsertUserAdminRole): Promise<UserAdminRole>;
  revokeAdminRole(userId: string, roleId: string): Promise<boolean>;
  
  // Platform Metrics
  getPlatformMetrics(date: string): Promise<PlatformMetrics | undefined>;
  getPlatformMetricsRange(startDate: string, endDate: string): Promise<PlatformMetrics[]>;
  createPlatformMetrics(metrics: InsertPlatformMetrics): Promise<PlatformMetrics>;
  updatePlatformMetrics(date: string, metrics: Partial<InsertPlatformMetrics>): Promise<PlatformMetrics | undefined>;
  
  // Subscription Events
  getSubscriptionEvents(limit?: number): Promise<SubscriptionEvent[]>;
  getSubscriptionEventsByUser(userId: string): Promise<SubscriptionEvent[]>;
  createSubscriptionEvent(event: InsertSubscriptionEvent): Promise<SubscriptionEvent>;
  
  // Sovereign AI Assistants
  getSovereignAssistants(): Promise<SovereignAssistant[]>;
  getSovereignAssistant(id: string): Promise<SovereignAssistant | undefined>;
  getSovereignAssistantByType(type: string): Promise<SovereignAssistant | undefined>;
  createSovereignAssistant(assistant: InsertSovereignAssistant): Promise<SovereignAssistant>;
  updateSovereignAssistant(id: string, data: Partial<InsertSovereignAssistant>): Promise<SovereignAssistant | undefined>;
  toggleSovereignAssistant(id: string, isActive: boolean): Promise<SovereignAssistant | undefined>;
  toggleSovereignAutonomy(id: string, isAutonomous: boolean): Promise<SovereignAssistant | undefined>;
  
  // Sovereign Commands
  getSovereignCommands(limit?: number): Promise<SovereignCommand[]>;
  getSovereignCommandsByAssistant(assistantId: string): Promise<SovereignCommand[]>;
  getSovereignCommand(id: string): Promise<SovereignCommand | undefined>;
  createSovereignCommand(command: InsertSovereignCommand): Promise<SovereignCommand>;
  updateSovereignCommand(id: string, data: Partial<InsertSovereignCommand>): Promise<SovereignCommand | undefined>;
  approveSovereignCommand(id: string, approvedBy: string): Promise<SovereignCommand | undefined>;
  cancelSovereignCommand(id: string): Promise<SovereignCommand | undefined>;
  rollbackSovereignCommand(id: string, rolledBackBy: string): Promise<SovereignCommand | undefined>;
  
  // Sovereign Actions
  getSovereignActionsByCommand(commandId: string): Promise<SovereignAction[]>;
  getSovereignAction(id: string): Promise<SovereignAction | undefined>;
  createSovereignAction(action: InsertSovereignAction): Promise<SovereignAction>;
  updateSovereignAction(id: string, data: Partial<InsertSovereignAction>): Promise<SovereignAction | undefined>;
  
  // Sovereign Action Logs
  getSovereignActionLogs(limit?: number): Promise<SovereignActionLog[]>;
  getSovereignActionLogsByCommand(commandId: string): Promise<SovereignActionLog[]>;
  getSovereignActionLogsByAssistant(assistantId: string, limit?: number): Promise<SovereignActionLog[]>;
  createSovereignActionLog(log: InsertSovereignActionLog): Promise<SovereignActionLog>;
  
  // Sovereign Policies
  getSovereignPolicies(): Promise<SovereignPolicy[]>;
  getSovereignPoliciesByType(assistantType: string): Promise<SovereignPolicy[]>;
  getSovereignPolicy(id: string): Promise<SovereignPolicy | undefined>;
  createSovereignPolicy(policy: InsertSovereignPolicy): Promise<SovereignPolicy>;
  updateSovereignPolicy(id: string, data: Partial<InsertSovereignPolicy>): Promise<SovereignPolicy | undefined>;
  toggleSovereignPolicy(id: string, isActive: boolean): Promise<SovereignPolicy | undefined>;
  deleteSovereignPolicy(id: string): Promise<boolean>;
  
  // AI App Builder Sessions
  getAiBuildSessions(userId?: string): Promise<AiBuildSession[]>;
  getAiBuildSession(id: string): Promise<AiBuildSession | undefined>;
  createAiBuildSession(session: InsertAiBuildSession): Promise<AiBuildSession>;
  updateAiBuildSession(id: string, data: Partial<InsertAiBuildSession>): Promise<AiBuildSession | undefined>;
  deleteAiBuildSession(id: string): Promise<boolean>;
  
  // AI Build Tasks
  getAiBuildTasks(sessionId: string): Promise<AiBuildTask[]>;
  getAiBuildTask(id: string): Promise<AiBuildTask | undefined>;
  createAiBuildTask(task: InsertAiBuildTask): Promise<AiBuildTask>;
  updateAiBuildTask(id: string, data: Partial<InsertAiBuildTask>): Promise<AiBuildTask | undefined>;
  
  // AI Build Artifacts
  getAiBuildArtifacts(sessionId: string): Promise<AiBuildArtifact[]>;
  getAiBuildArtifactsByTask(taskId: string): Promise<AiBuildArtifact[]>;
  createAiBuildArtifact(artifact: InsertAiBuildArtifact): Promise<AiBuildArtifact>;
  updateAiBuildArtifact(id: string, data: Partial<InsertAiBuildArtifact>): Promise<AiBuildArtifact | undefined>;
  
  // Cloud Development Projects
  getDevProjects(userId?: string): Promise<DevProject[]>;
  getDevProject(id: string): Promise<DevProject | undefined>;
  createDevProject(project: InsertDevProject): Promise<DevProject>;
  updateDevProject(id: string, data: Partial<InsertDevProject>): Promise<DevProject | undefined>;
  deleteDevProject(id: string): Promise<boolean>;
  
  // Project Files
  getProjectFiles(projectId: string): Promise<ProjectFile[]>;
  getProjectFile(id: string): Promise<ProjectFile | undefined>;
  getProjectFileByPath(projectId: string, filePath: string): Promise<ProjectFile | undefined>;
  createProjectFile(file: InsertProjectFile): Promise<ProjectFile>;
  updateProjectFile(id: string, data: Partial<InsertProjectFile>): Promise<ProjectFile | undefined>;
  deleteProjectFile(id: string): Promise<boolean>;
  
  // Runtime Instances
  getRuntimeInstance(projectId: string): Promise<RuntimeInstance | undefined>;
  createRuntimeInstance(instance: InsertRuntimeInstance): Promise<RuntimeInstance>;
  updateRuntimeInstance(id: string, data: Partial<InsertRuntimeInstance>): Promise<RuntimeInstance | undefined>;
  
  // Console Logs
  getConsoleLogs(projectId: string, limit?: number): Promise<ConsoleLog[]>;
  createConsoleLog(log: InsertConsoleLog): Promise<ConsoleLog>;
  clearConsoleLogs(projectId: string): Promise<boolean>;
  
  // Dev Database Tables
  getDevDatabaseTables(projectId: string): Promise<DevDatabaseTable[]>;
  getDevDatabaseTable(id: string): Promise<DevDatabaseTable | undefined>;
  createDevDatabaseTable(table: InsertDevDatabaseTable): Promise<DevDatabaseTable>;
  updateDevDatabaseTable(id: string, data: Partial<InsertDevDatabaseTable>): Promise<DevDatabaseTable | undefined>;
  deleteDevDatabaseTable(id: string): Promise<boolean>;
  
  // Dev Database Columns
  getDevDatabaseColumns(tableId: string): Promise<DevDatabaseColumn[]>;
  getDevDatabaseColumn(id: string): Promise<DevDatabaseColumn | undefined>;
  createDevDatabaseColumn(column: InsertDevDatabaseColumn): Promise<DevDatabaseColumn>;
  updateDevDatabaseColumn(id: string, data: Partial<InsertDevDatabaseColumn>): Promise<DevDatabaseColumn | undefined>;
  deleteDevDatabaseColumn(id: string): Promise<boolean>;
  
  // Dev Database Relationships
  getDevDatabaseRelationships(projectId: string): Promise<DevDatabaseRelationship[]>;
  getDevDatabaseRelationship(id: string): Promise<DevDatabaseRelationship | undefined>;
  createDevDatabaseRelationship(rel: InsertDevDatabaseRelationship): Promise<DevDatabaseRelationship>;
  updateDevDatabaseRelationship(id: string, data: Partial<InsertDevDatabaseRelationship>): Promise<DevDatabaseRelationship | undefined>;
  deleteDevDatabaseRelationship(id: string): Promise<boolean>;
  
  // Sovereign Audit Logs (ROOT_OWNER only)
  getSovereignAuditLogs(limit?: number): Promise<SovereignAuditLog[]>;
  createSovereignAuditLog(log: InsertSovereignAuditLog): Promise<SovereignAuditLog>;
  
  // Sovereign Platforms (ROOT_OWNER Platform Factory)
  getSovereignPlatforms(): Promise<SovereignPlatformRecord[]>;
  getSovereignPlatform(id: string): Promise<SovereignPlatformRecord | undefined>;
  getSovereignPlatformsByType(type: string): Promise<SovereignPlatformRecord[]>;
  createSovereignPlatform(platform: InsertSovereignPlatform): Promise<SovereignPlatformRecord>;
  updateSovereignPlatform(id: string, data: Partial<InsertSovereignPlatform>): Promise<SovereignPlatformRecord | undefined>;
  deleteSovereignPlatform(id: string): Promise<boolean>;
  
  // System Settings (ROOT_OWNER only)
  getSystemSettings(): Promise<SystemSettingRecord[]>;
  getSystemSetting(key: string): Promise<SystemSettingRecord | undefined>;
  getSystemSettingsByCategory(category: string): Promise<SystemSettingRecord[]>;
  createSystemSetting(setting: InsertSystemSetting): Promise<SystemSettingRecord>;
  updateSystemSetting(key: string, value: unknown, modifiedBy: string): Promise<SystemSettingRecord | undefined>;

  // Service Providers (Integrations Hub)
  getServiceProviders(): Promise<ServiceProvider[]>;
  getServiceProvider(id: string): Promise<ServiceProvider | undefined>;
  getServiceProviderBySlug(slug: string): Promise<ServiceProvider | undefined>;
  getServiceProvidersByCategory(category: string): Promise<ServiceProvider[]>;
  getActiveServiceProviders(): Promise<ServiceProvider[]>;
  createServiceProvider(provider: InsertServiceProvider): Promise<ServiceProvider>;
  updateServiceProvider(id: string, data: Partial<InsertServiceProvider>): Promise<ServiceProvider | undefined>;
  deleteServiceProvider(id: string): Promise<boolean>;
  
  // Provider API Keys
  getProviderApiKeys(providerId: string): Promise<ProviderApiKey[]>;
  getProviderApiKey(id: string): Promise<ProviderApiKey | undefined>;
  getDefaultProviderApiKey(providerId: string): Promise<ProviderApiKey | undefined>;
  createProviderApiKey(key: InsertProviderApiKey): Promise<ProviderApiKey>;
  updateProviderApiKey(id: string, data: Partial<InsertProviderApiKey>): Promise<ProviderApiKey | undefined>;
  deleteProviderApiKey(id: string): Promise<boolean>;
  rotateProviderApiKey(id: string, newEncryptedKey: string, newKeyHash: string): Promise<ProviderApiKey | undefined>;
  
  // Provider Services
  getProviderServices(providerId: string): Promise<ProviderService[]>;
  getProviderService(id: string): Promise<ProviderService | undefined>;
  createProviderService(service: InsertProviderService): Promise<ProviderService>;
  updateProviderService(id: string, data: Partial<InsertProviderService>): Promise<ProviderService | undefined>;
  deleteProviderService(id: string): Promise<boolean>;
  
  // Provider Usage Analytics
  getProviderUsage(providerId: string, startDate: Date, endDate: Date): Promise<ProviderUsage[]>;
  createProviderUsage(usage: InsertProviderUsage): Promise<ProviderUsage>;
  getProviderUsageSummary(providerId: string): Promise<{ totalRequests: number; totalCost: number; avgResponseTime: number }>;
  
  // Provider Alerts
  getProviderAlerts(providerId?: string): Promise<ProviderAlert[]>;
  getUnacknowledgedAlerts(): Promise<ProviderAlert[]>;
  createProviderAlert(alert: InsertProviderAlert): Promise<ProviderAlert>;
  acknowledgeProviderAlert(id: string, acknowledgedBy: string): Promise<ProviderAlert | undefined>;
  resolveProviderAlert(id: string): Promise<ProviderAlert | undefined>;
  
  // Failover Groups
  getFailoverGroups(): Promise<FailoverGroup[]>;
  getFailoverGroup(id: string): Promise<FailoverGroup | undefined>;
  getFailoverGroupByCategory(category: string): Promise<FailoverGroup | undefined>;
  createFailoverGroup(group: InsertFailoverGroup): Promise<FailoverGroup>;
  updateFailoverGroup(id: string, data: Partial<InsertFailoverGroup>): Promise<FailoverGroup | undefined>;
  triggerFailover(id: string): Promise<FailoverGroup | undefined>;
  
  // Integration Audit Logs
  getIntegrationAuditLogs(providerId?: string, limit?: number): Promise<IntegrationAuditLog[]>;
  createIntegrationAuditLog(log: InsertIntegrationAuditLog): Promise<IntegrationAuditLog>;
  
  // User Location Tracking
  getUserLocation(userId: string): Promise<UserLocation | undefined>;
  updateUserLocation(userId: string, location: InsertUserLocation): Promise<UserLocation>;
  getUsersByCountry(countryCode: string): Promise<UserLocation[]>;
  
  // Resource Usage Tracking
  trackResourceUsage(usage: InsertResourceUsage): Promise<ResourceUsage>;
  getResourceUsage(userId: string, startDate?: Date, endDate?: Date): Promise<ResourceUsage[]>;
  getResourceUsageSummary(userId: string): Promise<{
    totalRequests: number;
    realCostUSD: number;
    billedCostUSD: number;
    marginUSD: number;
  }>;
  
  // User Usage Limits
  getUserUsageLimit(userId: string): Promise<UserUsageLimit | undefined>;
  createUserUsageLimit(limit: InsertUserUsageLimit): Promise<UserUsageLimit>;
  updateUserUsageLimit(userId: string, data: Partial<InsertUserUsageLimit>): Promise<UserUsageLimit | undefined>;
  checkAndEnforceLimit(userId: string, newUsageUSD: number): Promise<{ allowed: boolean; action?: string }>;
  
  // Pricing Configuration
  getPricingConfigs(): Promise<PricingConfig[]>;
  getPricingConfig(resourceType: string, provider: string): Promise<PricingConfig | undefined>;
  createPricingConfig(config: InsertPricingConfig): Promise<PricingConfig>;
  updatePricingConfig(id: string, data: Partial<InsertPricingConfig>): Promise<PricingConfig | undefined>;
  
  // Usage Alerts
  getUserUsageAlerts(userId: string): Promise<UsageAlert[]>;
  getUnreadUsageAlerts(userId: string): Promise<UsageAlert[]>;
  createUsageAlert(alert: InsertUsageAlert): Promise<UsageAlert>;
  markUsageAlertRead(id: string): Promise<UsageAlert | undefined>;
  
  // Daily Aggregates
  getDailyUsageAggregates(userId: string, startDate: Date, endDate: Date): Promise<DailyUsageAggregate[]>;
  updateDailyAggregate(userId: string, date: Date, data: Partial<InsertDailyUsageAggregate>): Promise<DailyUsageAggregate>;
  
  // Monthly Summary
  getMonthlyUsageSummary(userId: string, year: number, month: number): Promise<MonthlyUsageSummary | undefined>;
  getAllMonthlyUsageSummaries(year: number, month: number): Promise<MonthlyUsageSummary[]>;
  updateMonthlyUsageSummary(id: string, data: Partial<InsertMonthlyUsageSummary>): Promise<MonthlyUsageSummary | undefined>;
  
  // Owner Analytics
  getOwnerUsageAnalytics(): Promise<{
    todayTotalCost: number;
    todayTotalBilled: number;
    todayMargin: number;
    top5Users: { userId: string; billedCost: number }[];
    losingUsers: { userId: string; realCost: number; billedCost: number; loss: number }[];
    profitByService: { service: string; margin: number }[];
  }>;
  
  // ============ SOVEREIGN OWNER CONTROL PANEL ============
  
  // Sovereign Owner Profile
  getSovereignOwnerProfile(userId: string): Promise<SovereignOwnerProfile | undefined>;
  createSovereignOwnerProfile(profile: InsertSovereignOwnerProfile): Promise<SovereignOwnerProfile>;
  updateSovereignOwnerProfile(userId: string, data: Partial<InsertSovereignOwnerProfile>): Promise<SovereignOwnerProfile | undefined>;
  
  // Ownership Transfers
  getOwnershipTransfers(): Promise<OwnershipTransfer[]>;
  getOwnershipTransfer(id: string): Promise<OwnershipTransfer | undefined>;
  createOwnershipTransfer(transfer: InsertOwnershipTransfer): Promise<OwnershipTransfer>;
  updateOwnershipTransfer(id: string, data: Partial<InsertOwnershipTransfer>): Promise<OwnershipTransfer | undefined>;
  
  // AI Policies
  getAIPolicies(): Promise<AIPolicy[]>;
  getAIPoliciesByScope(scope: string): Promise<AIPolicy[]>;
  createAIPolicy(policy: InsertAIPolicy): Promise<AIPolicy>;
  updateAIPolicy(id: string, data: Partial<InsertAIPolicy>): Promise<AIPolicy | undefined>;
  deleteAIPolicy(id: string): Promise<boolean>;
  
  // Cost Attributions
  getCostAttributions(startDate: Date, endDate: Date): Promise<CostAttribution[]>;
  getCostAttributionsBySource(sourceType: string, sourceId: string): Promise<CostAttribution[]>;
  createCostAttribution(attribution: InsertCostAttribution): Promise<CostAttribution>;
  
  // Margin Guard
  getMarginGuardConfig(): Promise<MarginGuardConfig | undefined>;
  createMarginGuardConfig(config: InsertMarginGuardConfig): Promise<MarginGuardConfig>;
  updateMarginGuardConfig(id: string, data: Partial<InsertMarginGuardConfig>): Promise<MarginGuardConfig | undefined>;
  
  // Immutable Audit Trail
  getImmutableAuditTrail(limit?: number): Promise<ImmutableAuditTrail[]>;
  createImmutableAuditEntry(entry: InsertImmutableAuditTrail): Promise<ImmutableAuditTrail>;
  getAuditEntryByHash(hash: string): Promise<ImmutableAuditTrail | undefined>;
  
  // Post-Mortem Reports
  getPostMortemReports(): Promise<PostMortemReport[]>;
  getPostMortemReport(id: string): Promise<PostMortemReport | undefined>;
  createPostMortemReport(report: InsertPostMortemReport): Promise<PostMortemReport>;
  updatePostMortemReport(id: string, data: Partial<InsertPostMortemReport>): Promise<PostMortemReport | undefined>;
  signPostMortemReport(id: string, signature: string): Promise<PostMortemReport | undefined>;
  
  // Security Incidents
  getSecurityIncidents(): Promise<SecurityIncident[]>;
  getSecurityIncidentsBySeverity(severity: string): Promise<SecurityIncident[]>;
  createSecurityIncident(incident: InsertSecurityIncident): Promise<SecurityIncident>;
  updateSecurityIncident(id: string, data: Partial<InsertSecurityIncident>): Promise<SecurityIncident | undefined>;
  resolveSecurityIncident(id: string, resolution: string, resolvedBy: string): Promise<SecurityIncident | undefined>;
  
  // ==================== SOVEREIGN INFRASTRUCTURE ====================
  // Infrastructure Audit Logs (Immutable)
  getInfrastructureAuditLogs(filters?: {
    userId?: string;
    action?: string;
    targetType?: string;
    targetId?: string;
    providerId?: string;
    success?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<InfrastructureAuditLog[]>;
  createInfrastructureAuditLog(log: InsertInfrastructureAuditLog): Promise<InfrastructureAuditLog>;
  
  // Provider Error Logs
  getProviderErrorLogs(providerId?: string, limit?: number): Promise<ProviderErrorLog[]>;
  createProviderErrorLog(log: InsertProviderErrorLog): Promise<ProviderErrorLog>;
  resolveProviderErrorLog(id: string, resolvedBy: string): Promise<ProviderErrorLog | undefined>;
  
  // Infrastructure Providers
  getInfrastructureProviders(): Promise<InfrastructureProvider[]>;
  getInfrastructureProvider(id: string): Promise<InfrastructureProvider | undefined>;
  getInfrastructureProviderByName(name: string): Promise<InfrastructureProvider | undefined>;
  createInfrastructureProvider(provider: InsertInfrastructureProvider): Promise<InfrastructureProvider>;
  updateInfrastructureProvider(id: string, data: Partial<InsertInfrastructureProvider>): Promise<InfrastructureProvider | undefined>;
  deleteInfrastructureProvider(id: string): Promise<boolean>;
  
  // Provider Credentials
  getProviderCredentialByProviderId(providerId: string): Promise<ProviderCredential | undefined>;
  createProviderCredential(credential: InsertProviderCredential): Promise<ProviderCredential>;
  deleteProviderCredential(id: string): Promise<boolean>;
  
  // Infrastructure Servers
  getInfrastructureServers(): Promise<InfrastructureServer[]>;
  getInfrastructureServersByProvider(providerId: string): Promise<InfrastructureServer[]>;
  getInfrastructureServer(id: string): Promise<InfrastructureServer | undefined>;
  createInfrastructureServer(server: InsertInfrastructureServer): Promise<InfrastructureServer>;
  updateInfrastructureServer(id: string, data: Partial<InsertInfrastructureServer>): Promise<InfrastructureServer | undefined>;
  deleteInfrastructureServer(id: string): Promise<boolean>;
  
  // Deployment Templates
  getDeploymentTemplates(): Promise<DeploymentTemplate[]>;
  getDeploymentTemplate(id: string): Promise<DeploymentTemplate | undefined>;
  createDeploymentTemplate(template: InsertDeploymentTemplate): Promise<DeploymentTemplate>;
  updateDeploymentTemplate(id: string, data: Partial<InsertDeploymentTemplate>): Promise<DeploymentTemplate | undefined>;
  deleteDeploymentTemplate(id: string): Promise<boolean>;
  
  // Deployment Runs
  getDeploymentRuns(): Promise<DeploymentRun[]>;
  getDeploymentRunsByServer(serverId: string): Promise<DeploymentRun[]>;
  getDeploymentRunsByProject(projectId: string): Promise<DeploymentRun[]>;
  getDeploymentRun(id: string): Promise<DeploymentRun | undefined>;
  createDeploymentRun(run: InsertDeploymentRun): Promise<DeploymentRun>;
  updateDeploymentRun(id: string, data: Partial<InsertDeploymentRun>): Promise<DeploymentRun | undefined>;
  
  // Infrastructure Backups
  getInfrastructureBackups(): Promise<InfrastructureBackup[]>;
  getInfrastructureBackupsByServer(serverId: string): Promise<InfrastructureBackup[]>;
  getInfrastructureBackup(id: string): Promise<InfrastructureBackup | undefined>;
  createInfrastructureBackup(backup: InsertInfrastructureBackup): Promise<InfrastructureBackup>;
  updateInfrastructureBackup(id: string, data: Partial<InsertInfrastructureBackup>): Promise<InfrastructureBackup | undefined>;
  deleteInfrastructureBackup(id: string): Promise<boolean>;
  
  // ==================== EXTERNAL INTEGRATION GATEWAY ====================
  // External Integration Sessions
  getExternalIntegrationSessions(): Promise<ExternalIntegrationSession[]>;
  getActiveExternalIntegrationSession(partnerName: string): Promise<ExternalIntegrationSession | undefined>;
  getExternalIntegrationSession(id: string): Promise<ExternalIntegrationSession | undefined>;
  createExternalIntegrationSession(session: InsertExternalIntegrationSession): Promise<ExternalIntegrationSession>;
  updateExternalIntegrationSession(id: string, data: Partial<InsertExternalIntegrationSession>): Promise<ExternalIntegrationSession | undefined>;
  activateExternalIntegrationSession(id: string, activatedBy: string, reason: string): Promise<ExternalIntegrationSession | undefined>;
  deactivateExternalIntegrationSession(id: string, deactivatedBy: string, reason: string): Promise<ExternalIntegrationSession | undefined>;
  
  // External Integration Logs
  getExternalIntegrationLogs(sessionId: string): Promise<ExternalIntegrationLog[]>;
  createExternalIntegrationLog(log: InsertExternalIntegrationLog): Promise<ExternalIntegrationLog>;
  
  // Cost Alerts
  getInfrastructureCostAlerts(): Promise<InfrastructureCostAlert[]>;
  getActiveInfrastructureCostAlerts(): Promise<InfrastructureCostAlert[]>;
  createInfrastructureCostAlert(alert: InsertInfrastructureCostAlert): Promise<InfrastructureCostAlert>;
  updateInfrastructureCostAlert(id: string, data: Partial<InsertInfrastructureCostAlert>): Promise<InfrastructureCostAlert | undefined>;
  
  // Infrastructure Budgets
  getInfrastructureBudgets(): Promise<InfrastructureBudget[]>;
  getInfrastructureBudget(id: string): Promise<InfrastructureBudget | undefined>;
  createInfrastructureBudget(budget: InsertInfrastructureBudget): Promise<InfrastructureBudget>;
  updateInfrastructureBudget(id: string, data: Partial<InsertInfrastructureBudget>): Promise<InfrastructureBudget | undefined>;

  // ==================== COLLABORATION ENGINE ====================
  // Collaboration Contexts
  getCollaborationContexts(projectId?: string): Promise<CollaborationContext[]>;
  getCollaborationContext(id: string): Promise<CollaborationContext | undefined>;
  createCollaborationContext(ctx: InsertCollaborationContext): Promise<CollaborationContext>;
  updateCollaborationContext(id: string, updates: Partial<InsertCollaborationContext>): Promise<CollaborationContext | undefined>;
  
  // Collaboration Messages
  getContextMessages(contextId: string): Promise<CollaborationMessage[]>;
  createCollaborationMessage(msg: InsertCollaborationMessage): Promise<CollaborationMessage>;
  updateMessageAction(id: string, actionExecuted: boolean, actionResult: any): Promise<CollaborationMessage | undefined>;
  
  // Collaboration Decisions
  getCollaborationDecisions(contextId: string): Promise<CollaborationDecision[]>;
  createCollaborationDecision(dec: InsertCollaborationDecision): Promise<CollaborationDecision>;
  updateDecisionStatus(id: string, status: string, executedBy?: string, executionResult?: any): Promise<CollaborationDecision | undefined>;
  
  // AI Collaborators
  getAICollaborators(): Promise<AICollaborator[]>;
  getAICollaborator(id: string): Promise<AICollaborator | undefined>;
  createAICollaborator(ai: InsertAICollaborator): Promise<AICollaborator>;
  updateAICollaboratorStats(id: string, stats: Partial<InsertAICollaborator>): Promise<AICollaborator | undefined>;
  
  // Active Contributors
  getActiveContributors(contextId?: string): Promise<ActiveContributor[]>;
  upsertActiveContributor(contributor: InsertActiveContributor): Promise<ActiveContributor>;
  removeActiveContributor(contributorId: string): Promise<boolean>;

  // ==================== PAYMENT SYSTEM ====================
  // Webhook Logs
  getWebhookLogByEventId(eventId: string): Promise<WebhookLog | null>;
  getWebhookLogs(limit?: number): Promise<WebhookLog[]>;
  createWebhookLog(data: InsertWebhookLog): Promise<WebhookLog>;
  updateWebhookLog(id: string, data: Partial<InsertWebhookLog>): Promise<WebhookLog>;

  // Payment Retries
  createPaymentRetry(data: InsertPaymentRetry): Promise<PaymentRetry>;
  updatePaymentRetry(id: string, data: Partial<InsertPaymentRetry>): Promise<PaymentRetry>;
  getPaymentRetriesBySubscription(subscriptionId: string): Promise<PaymentRetry[]>;
  getPendingPaymentRetries(): Promise<PaymentRetry[]>;

  // Refunds
  createRefund(data: InsertRefund): Promise<Refund>;
  getRefundsByPayment(paymentId: string): Promise<Refund[]>;
  getAllRefunds(limit?: number): Promise<Refund[]>;

  // Billing Profiles
  createBillingProfile(data: InsertBillingProfile): Promise<BillingProfile>;
  getBillingProfilesByUser(userId: string): Promise<BillingProfile[]>;
  updateBillingProfile(id: string, data: Partial<InsertBillingProfile>): Promise<BillingProfile>;

  // AI Billing Insights
  createAiBillingInsight(data: InsertAiBillingInsight): Promise<AiBillingInsight>;
  getAiBillingInsightsByUser(userId: string): Promise<AiBillingInsight[]>;
  getAiBillingInsights(limit?: number): Promise<AiBillingInsight[]>;
  updateAiBillingInsight(id: string, data: Partial<InsertAiBillingInsight>): Promise<AiBillingInsight>;

  // ==================== SOVEREIGN AUDIT SYSTEM ====================
  // Audit Runs
  getLatestAuditRun(): Promise<AuditRun | undefined>;
  getAuditRun(id: string): Promise<AuditRun | undefined>;
  getAuditRuns(limit?: number): Promise<AuditRun[]>;
  createAuditRun(data: InsertAuditRun): Promise<AuditRun>;
  updateAuditRun(id: string, data: Partial<InsertAuditRun>): Promise<AuditRun | undefined>;
  
  // Audit Targets
  getAllAuditTargets(): Promise<AuditTarget[]>;
  getAuditTargetByTestId(testId: string): Promise<AuditTarget | undefined>;
  createAuditTarget(data: InsertAuditTarget): Promise<AuditTarget>;
  updateAuditTarget(id: string, data: Partial<InsertAuditTarget>): Promise<AuditTarget | undefined>;
  
  // Audit Findings
  getAuditFindingsByRun(runId: string): Promise<AuditFinding[]>;
  createAuditFinding(data: InsertAuditFinding): Promise<AuditFinding>;
  updateAuditFinding(id: string, data: Partial<InsertAuditFinding>): Promise<AuditFinding | undefined>;

  // White Label / Platform Branding
  getOwnerWhiteLabelSettings(): Promise<WhiteLabelSettings | undefined>;
  saveWhiteLabelSettings(userId: string, settings: InsertWhiteLabelSettings): Promise<WhiteLabelSettings>;
  
  // Permission Overrides (Persistent Dynamic Permissions)
  getPermissionOverrides(userId: string): Promise<PermissionOverride[]>;
  getAllPermissionOverrides(): Promise<PermissionOverride[]>;
  createPermissionOverride(override: InsertPermissionOverride): Promise<PermissionOverride>;
  deletePermissionOverride(id: string): Promise<boolean>;
  deletePermissionOverridesByUser(userId: string): Promise<boolean>;
  getActiveGrantedPermissions(userId: string): Promise<string[]>;
  getActiveRevokedPermissions(userId: string): Promise<string[]>;
  
  // AI Assistant Capability Control
  getAiAssistantCapabilities(assistantId: string): Promise<AiAssistantCapability[]>;
  getAllAiAssistantCapabilities(): Promise<AiAssistantCapability[]>;
  setAiAssistantCapability(data: InsertAiAssistantCapability): Promise<AiAssistantCapability>;
  deleteAiAssistantCapability(id: string): Promise<boolean>;
  resetAiAssistantCapabilities(assistantId: string): Promise<boolean>;
  isCapabilityEnabled(assistantId: string, capabilityCode: string): Promise<boolean>;
  
  // ==================== DYNAMIC CONFIGURATION SYSTEM ====================
  // Platform Settings - All configurations stored dynamically
  getPlatformSettings(): Promise<PlatformSetting[]>;
  getPlatformSettingsByCategory(category: string): Promise<PlatformSetting[]>;
  getPlatformSetting(key: string): Promise<PlatformSetting | undefined>;
  setPlatformSetting(data: InsertPlatformSetting): Promise<PlatformSetting>;
  updatePlatformSetting(id: string, data: Partial<InsertPlatformSetting>): Promise<PlatformSetting | undefined>;
  deletePlatformSetting(id: string): Promise<boolean>;
  
  // Dynamic Features - Feature flags controlled by owner
  getDynamicFeatures(): Promise<DynamicFeature[]>;
  getDynamicFeaturesByCategory(category: string): Promise<DynamicFeature[]>;
  getDynamicFeature(code: string): Promise<DynamicFeature | undefined>;
  createDynamicFeature(data: InsertDynamicFeature): Promise<DynamicFeature>;
  updateDynamicFeature(id: string, data: Partial<InsertDynamicFeature>): Promise<DynamicFeature | undefined>;
  toggleDynamicFeature(code: string, isEnabled: boolean): Promise<DynamicFeature | undefined>;
  deleteDynamicFeature(id: string): Promise<boolean>;
  isFeatureEnabled(code: string): Promise<boolean>;
  
  // Dynamic Pages - Page configurations controlled by owner
  getDynamicPages(): Promise<DynamicPage[]>;
  getDynamicPagesByCategory(category: string): Promise<DynamicPage[]>;
  getDynamicPage(pathname: string): Promise<DynamicPage | undefined>;
  createDynamicPage(data: InsertDynamicPage): Promise<DynamicPage>;
  updateDynamicPage(id: string, data: Partial<InsertDynamicPage>): Promise<DynamicPage | undefined>;
  toggleDynamicPage(pathname: string, isEnabled: boolean): Promise<DynamicPage | undefined>;
  deleteDynamicPage(id: string): Promise<boolean>;
  
  // Dynamic Components - UI components controlled by owner
  getDynamicComponents(): Promise<DynamicComponent[]>;
  getDynamicComponentsByCategory(category: string): Promise<DynamicComponent[]>;
  getDynamicComponent(code: string): Promise<DynamicComponent | undefined>;
  createDynamicComponent(data: InsertDynamicComponent): Promise<DynamicComponent>;
  updateDynamicComponent(id: string, data: Partial<InsertDynamicComponent>): Promise<DynamicComponent | undefined>;
  toggleDynamicComponent(code: string, isEnabled: boolean): Promise<DynamicComponent | undefined>;
  deleteDynamicComponent(id: string): Promise<boolean>;
  
  // Dynamic API Endpoints - API configurations controlled by owner
  getDynamicApiEndpoints(): Promise<DynamicApiEndpoint[]>;
  getDynamicApiEndpoint(path: string): Promise<DynamicApiEndpoint | undefined>;
  createDynamicApiEndpoint(data: InsertDynamicApiEndpoint): Promise<DynamicApiEndpoint>;
  updateDynamicApiEndpoint(id: string, data: Partial<InsertDynamicApiEndpoint>): Promise<DynamicApiEndpoint | undefined>;
  toggleDynamicApiEndpoint(path: string, isEnabled: boolean): Promise<DynamicApiEndpoint | undefined>;
  deleteDynamicApiEndpoint(id: string): Promise<boolean>;
  
  // Dynamic Workflows - Business logic controlled by owner
  getDynamicWorkflows(): Promise<DynamicWorkflow[]>;
  getDynamicWorkflowsByCategory(category: string): Promise<DynamicWorkflow[]>;
  getDynamicWorkflow(code: string): Promise<DynamicWorkflow | undefined>;
  createDynamicWorkflow(data: InsertDynamicWorkflow): Promise<DynamicWorkflow>;
  updateDynamicWorkflow(id: string, data: Partial<InsertDynamicWorkflow>): Promise<DynamicWorkflow | undefined>;
  toggleDynamicWorkflow(code: string, isEnabled: boolean): Promise<DynamicWorkflow | undefined>;
  deleteDynamicWorkflow(id: string): Promise<boolean>;
  
  // Assistant Relationships - AI assistant collaboration management
  getAssistantRelationships(): Promise<AssistantRelationship[]>;
  getAssistantRelationship(id: string): Promise<AssistantRelationship | undefined>;
  getAssistantRelationshipsByAssistant(assistantId: string): Promise<AssistantRelationship[]>;
  createAssistantRelationship(data: InsertAssistantRelationship): Promise<AssistantRelationship>;
  updateAssistantRelationship(id: string, data: Partial<InsertAssistantRelationship>): Promise<AssistantRelationship | undefined>;
  toggleAssistantRelationship(id: string, isEnabled: boolean): Promise<AssistantRelationship | undefined>;
  deleteAssistantRelationship(id: string): Promise<boolean>;
  
  // Assistant Conversations - Communication between assistants
  getAssistantConversations(relationshipId?: string): Promise<AssistantConversation[]>;
  getAssistantConversation(id: string): Promise<AssistantConversation | undefined>;
  getAssistantConversationsByAssistant(assistantId: string): Promise<AssistantConversation[]>;
  createAssistantConversation(data: InsertAssistantConversation): Promise<AssistantConversation>;
  markConversationAsRead(id: string): Promise<AssistantConversation | undefined>;
  markConversationAsProcessed(id: string): Promise<AssistantConversation | undefined>;
  deleteAssistantConversation(id: string): Promise<boolean>;
  
  // Assistant Workgroups - Team collaboration
  getAssistantWorkgroups(): Promise<AssistantWorkgroup[]>;
  getAssistantWorkgroup(id: string): Promise<AssistantWorkgroup | undefined>;
  getAssistantWorkgroupByCode(code: string): Promise<AssistantWorkgroup | undefined>;
  createAssistantWorkgroup(data: InsertAssistantWorkgroup): Promise<AssistantWorkgroup>;
  updateAssistantWorkgroup(id: string, data: Partial<InsertAssistantWorkgroup>): Promise<AssistantWorkgroup | undefined>;
  toggleAssistantWorkgroup(id: string, isActive: boolean): Promise<AssistantWorkgroup | undefined>;
  deleteAssistantWorkgroup(id: string): Promise<boolean>;
  
  // Assistant Permission Audit - Track all changes
  getAssistantPermissionAudits(limit?: number): Promise<AssistantPermissionAudit[]>;
  getAssistantPermissionAuditsByEntity(entityType: string, entityId: string): Promise<AssistantPermissionAudit[]>;
  createAssistantPermissionAudit(data: InsertAssistantPermissionAudit): Promise<AssistantPermissionAudit>;
  
  // ==================== PLATFORM ICON VERSION CONTROL ====================
  // Platform Icons - سجل الأيقونات الديناميكي
  getPlatformIcons(): Promise<PlatformIcon[]>;
  getPlatformIcon(id: string): Promise<PlatformIcon | undefined>;
  getPlatformIconByPlatformId(platformId: string): Promise<PlatformIcon | undefined>;
  getPlatformIconsByCategory(category: string): Promise<PlatformIcon[]>;
  createPlatformIcon(data: InsertPlatformIcon): Promise<PlatformIcon>;
  updatePlatformIcon(id: string, data: Partial<InsertPlatformIcon>): Promise<PlatformIcon | undefined>;
  deletePlatformIcon(id: string): Promise<boolean>;
  
  // Platform Icon Versions - إصدارات الأيقونات
  getPlatformIconVersions(platformIconId: string): Promise<PlatformIconVersion[]>;
  getPlatformIconVersionsByPlatformId(platformId: string): Promise<PlatformIconVersion[]>;
  getPlatformIconVersion(id: string): Promise<PlatformIconVersion | undefined>;
  getCurrentIconVersion(platformIconId: string): Promise<PlatformIconVersion | undefined>;
  createPlatformIconVersion(data: InsertPlatformIconVersion): Promise<PlatformIconVersion>;
  setCurrentIconVersion(platformIconId: string, versionId: string): Promise<PlatformIconVersion | undefined>;
  restoreIconVersion(platformIconId: string, versionId: string): Promise<PlatformIconVersion | undefined>;
  
  // Icon Regeneration Requests - طلبات إعادة توليد الأيقونات
  getIconRegenerationRequests(platformIconId?: string): Promise<IconRegenerationRequest[]>;
  getPendingIconRegenerationRequests(): Promise<IconRegenerationRequest[]>;
  createIconRegenerationRequest(data: InsertIconRegenerationRequest): Promise<IconRegenerationRequest>;
  updateIconRegenerationRequest(id: string, data: Partial<InsertIconRegenerationRequest>): Promise<IconRegenerationRequest | undefined>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeSubscriptionPlans();
    this.initializeTemplates();
    this.initializeComponents();
  }

  // Initialize subscription plans with operational capabilities
  private async initializeSubscriptionPlans() {
    const existingPlans = await db.select().from(subscriptionPlans);
    if (existingPlans.length > 0) return;

    const plans: InsertSubscriptionPlan[] = [
      // ===== FREE - Discovery Tier =====
      {
        name: "Free",
        nameAr: "مجاني",
        description: "Get started with basic features",
        descriptionAr: "ابدأ مع الميزات الأساسية",
        tagline: "Explore & Experiment",
        taglineAr: "استكشف وجرّب",
        role: "free",
        tier: "discovery",
        priceMonthly: 0,
        priceQuarterly: 0,
        priceSemiAnnual: 0,
        priceYearly: 0,
        currency: "USD",
        features: [
          "1 Project",
          "5 Pages per Project", 
          "10 AI Generations/month",
          "Basic Templates Only",
          "Sandbox Mode (No Real Deploy)",
          "INFERA Watermark"
        ],
        featuresAr: [
          "مشروع واحد",
          "5 صفحات لكل مشروع",
          "10 توليدات AI شهرياً",
          "قوالب أساسية فقط",
          "وضع تجريبي (بدون نشر حقيقي)",
          "علامة INFERA المائية"
        ],
        capabilities: {
          aiMode: "sandbox",
          aiAutonomy: 10,
          smartSuggestions: false,
          aiCodeGeneration: false,
          aiCopilot: false,
          aiOperator: false,
          aiGovernance: false,
          backendGenerator: false,
          frontendGenerator: false,
          fullStackGenerator: false,
          chatbotBuilder: false,
          activeDeployments: 0,
          customDomains: 0,
          cdnAccess: false,
          sslCertificates: false,
          automationPipelines: false,
          cicdIntegration: false,
          webhooks: false,
          scheduledTasks: false,
          versionControl: false,
          branchManagement: false,
          rollbackEnabled: false,
          basicAnalytics: false,
          advancedAnalytics: false,
          performanceMonitoring: false,
          slaMonitoring: false,
          teamRoles: false,
          customPermissions: false,
          apiGateway: false,
          externalIntegrations: false,
          whiteLabel: false,
          multiTenant: false,
          complianceModes: false,
          auditLogs: false,
          sovereignDashboard: false,
          dataResidencyControl: false,
          policyEnforcement: false,
          emergencyKillSwitch: false,
          isolatedInfrastructure: false,
          strategicSimulation: false,
        },
        limits: {
          maxProjects: 1,
          maxPagesPerProject: 5,
          aiGenerationsPerMonth: 10,
          storageGB: 0.5,
          bandwidthGB: 1,
          apiRequestsPerMonth: 100,
          teamMembers: 1,
          activeDeployments: 0,
          customDomains: 0,
        },
        restrictions: {
          watermark: true,
          noRealDeployment: true,
          limitedTemplates: true,
          exportCodeDisabled: true,
          sandboxMode: true,
        },
        maxProjects: 1,
        maxPagesPerProject: 5,
        aiGenerationsPerMonth: 10,
        customDomain: false,
        whiteLabel: false,
        prioritySupport: false,
        analyticsAccess: false,
        chatbotBuilder: false,
        teamMembers: 1,
        iconName: "Zap",
        gradientFrom: "#64748b",
        gradientTo: "#475569",
        accentColor: "#64748b",
        isPopular: false,
        isContactSales: false,
        sortOrder: 0,
      },
      
      // ===== BASIC - Builder Tier =====
      {
        name: "Basic",
        nameAr: "أساسي",
        description: "Perfect for individuals",
        descriptionAr: "مثالي للأفراد والبناء الشخصي",
        tagline: "Build Your First Platform",
        taglineAr: "ابنِ منصتك الأولى",
        role: "basic",
        tier: "builder",
        priceMonthly: 999,
        priceQuarterly: 2499,
        priceSemiAnnual: 4499,
        priceYearly: 7999,
        currency: "USD",
        features: [
          "5 Projects",
          "20 Pages per Project",
          "50 AI Generations/month",
          "All Templates",
          "Export Code",
          "1 Active Deployment",
          "Basic Analytics",
          "Frontend Generator"
        ],
        featuresAr: [
          "5 مشاريع",
          "20 صفحة لكل مشروع",
          "50 توليد AI شهرياً",
          "جميع القوالب",
          "تصدير الكود",
          "نشر نشط واحد",
          "تحليلات أساسية",
          "مولد الواجهة الأمامية"
        ],
        capabilities: {
          aiMode: "assistant",
          aiAutonomy: 25,
          smartSuggestions: false,
          aiCodeGeneration: true,
          aiCopilot: false,
          aiOperator: false,
          aiGovernance: false,
          backendGenerator: false,
          frontendGenerator: true,
          fullStackGenerator: false,
          chatbotBuilder: false,
          activeDeployments: 1,
          customDomains: 0,
          cdnAccess: false,
          sslCertificates: true,
          automationPipelines: false,
          cicdIntegration: false,
          webhooks: false,
          scheduledTasks: false,
          versionControl: false,
          branchManagement: false,
          rollbackEnabled: false,
          basicAnalytics: true,
          advancedAnalytics: false,
          performanceMonitoring: false,
          slaMonitoring: false,
          teamRoles: false,
          customPermissions: false,
          apiGateway: false,
          externalIntegrations: false,
          whiteLabel: false,
          multiTenant: false,
          complianceModes: false,
          auditLogs: false,
          sovereignDashboard: false,
          dataResidencyControl: false,
          policyEnforcement: false,
          emergencyKillSwitch: false,
          isolatedInfrastructure: false,
          strategicSimulation: false,
        },
        limits: {
          maxProjects: 5,
          maxPagesPerProject: 20,
          aiGenerationsPerMonth: 50,
          storageGB: 5,
          bandwidthGB: 50,
          apiRequestsPerMonth: 5000,
          teamMembers: 1,
          activeDeployments: 1,
          customDomains: 0,
        },
        restrictions: {
          watermark: false,
          noRealDeployment: false,
          limitedTemplates: false,
          exportCodeDisabled: false,
          sandboxMode: false,
        },
        maxProjects: 5,
        maxPagesPerProject: 20,
        aiGenerationsPerMonth: 50,
        customDomain: false,
        whiteLabel: false,
        prioritySupport: false,
        analyticsAccess: true,
        chatbotBuilder: false,
        teamMembers: 1,
        iconName: "Star",
        gradientFrom: "#3b82f6",
        gradientTo: "#2563eb",
        accentColor: "#3b82f6",
        isPopular: false,
        isContactSales: false,
        sortOrder: 1,
      },
      
      // ===== PRO - Autonomous Builder Tier =====
      {
        name: "Pro",
        nameAr: "احترافي",
        description: "For professionals and small businesses",
        descriptionAr: "للمحترفين والشركات الصغيرة",
        tagline: "AI-Powered Development",
        taglineAr: "تطوير مدعوم بالذكاء الاصطناعي",
        role: "pro",
        tier: "professional",
        priceMonthly: 2999,
        priceQuarterly: 7499,
        priceSemiAnnual: 13499,
        priceYearly: 23999,
        currency: "USD",
        features: [
          "Unlimited Projects",
          "Unlimited Pages",
          "200 AI Generations/month",
          "AI Copilot (Suggest + Execute)",
          "Smart Suggestions Active",
          "Full Stack Generator",
          "ChatBot Builder",
          "Custom Domain",
          "Version Control",
          "CI/CD Limited",
          "Performance Monitoring",
          "Priority Support"
        ],
        featuresAr: [
          "مشاريع غير محدودة",
          "صفحات غير محدودة",
          "200 توليد AI شهرياً",
          "AI Copilot (اقتراح + تنفيذ)",
          "الاقتراحات الذكية مفعلة",
          "مولد Full Stack",
          "منشئ الشات بوت",
          "نطاق مخصص",
          "التحكم بالإصدارات",
          "CI/CD محدود",
          "مراقبة الأداء",
          "دعم أولوية"
        ],
        capabilities: {
          aiMode: "copilot",
          aiAutonomy: 60,
          smartSuggestions: true,
          aiCodeGeneration: true,
          aiCopilot: true,
          aiOperator: false,
          aiGovernance: false,
          backendGenerator: true,
          frontendGenerator: true,
          fullStackGenerator: true,
          chatbotBuilder: true,
          activeDeployments: 5,
          customDomains: 3,
          cdnAccess: true,
          sslCertificates: true,
          automationPipelines: false,
          cicdIntegration: true,
          webhooks: true,
          scheduledTasks: false,
          versionControl: true,
          branchManagement: true,
          rollbackEnabled: true,
          basicAnalytics: true,
          advancedAnalytics: true,
          performanceMonitoring: true,
          slaMonitoring: false,
          teamRoles: false,
          customPermissions: false,
          apiGateway: false,
          externalIntegrations: true,
          whiteLabel: false,
          multiTenant: false,
          complianceModes: false,
          auditLogs: false,
          sovereignDashboard: false,
          dataResidencyControl: false,
          policyEnforcement: false,
          emergencyKillSwitch: false,
          isolatedInfrastructure: false,
          strategicSimulation: false,
        },
        limits: {
          maxProjects: -1,
          maxPagesPerProject: -1,
          aiGenerationsPerMonth: 200,
          storageGB: 50,
          bandwidthGB: 500,
          apiRequestsPerMonth: 100000,
          teamMembers: 3,
          activeDeployments: 5,
          customDomains: 3,
        },
        restrictions: {
          watermark: false,
          noRealDeployment: false,
          limitedTemplates: false,
          exportCodeDisabled: false,
          sandboxMode: false,
        },
        maxProjects: -1,
        maxPagesPerProject: -1,
        aiGenerationsPerMonth: 200,
        customDomain: true,
        whiteLabel: false,
        prioritySupport: true,
        analyticsAccess: true,
        chatbotBuilder: true,
        teamMembers: 3,
        iconName: "Crown",
        gradientFrom: "#8b5cf6",
        gradientTo: "#7c3aed",
        accentColor: "#8b5cf6",
        isPopular: true,
        isContactSales: false,
        sortOrder: 2,
      },
      
      // ===== ENTERPRISE - Organizational Control Tier =====
      {
        name: "Enterprise",
        nameAr: "مؤسسي",
        description: "For agencies and large teams",
        descriptionAr: "للوكالات والفرق الكبيرة",
        tagline: "Complete Organizational Control",
        taglineAr: "تحكم مؤسسي كامل",
        role: "enterprise",
        tier: "organizational",
        priceMonthly: 9999,
        priceQuarterly: 24999,
        priceSemiAnnual: 44999,
        priceYearly: 79999,
        currency: "USD",
        features: [
          "Everything in Pro",
          "AI Operator Mode",
          "Team Roles & Policies",
          "White Label Mode",
          "API Gateway Access",
          "SLA Monitoring",
          "External Integrations",
          "Compliance Modes",
          "Audit Logs",
          "1000 AI Generations/month",
          "Dedicated Support"
        ],
        featuresAr: [
          "كل ميزات Pro",
          "وضع AI Operator",
          "أدوار الفريق والسياسات",
          "وضع العلامة البيضاء",
          "بوابة API",
          "مراقبة SLA",
          "تكاملات خارجية",
          "أوضاع الامتثال",
          "سجلات التدقيق",
          "1000 توليد AI شهرياً",
          "دعم مخصص"
        ],
        capabilities: {
          aiMode: "operator",
          aiAutonomy: 80,
          smartSuggestions: true,
          aiCodeGeneration: true,
          aiCopilot: true,
          aiOperator: true,
          aiGovernance: false,
          backendGenerator: true,
          frontendGenerator: true,
          fullStackGenerator: true,
          chatbotBuilder: true,
          activeDeployments: -1,
          customDomains: -1,
          cdnAccess: true,
          sslCertificates: true,
          automationPipelines: true,
          cicdIntegration: true,
          webhooks: true,
          scheduledTasks: true,
          versionControl: true,
          branchManagement: true,
          rollbackEnabled: true,
          basicAnalytics: true,
          advancedAnalytics: true,
          performanceMonitoring: true,
          slaMonitoring: true,
          teamRoles: true,
          customPermissions: true,
          apiGateway: true,
          externalIntegrations: true,
          whiteLabel: true,
          multiTenant: true,
          complianceModes: true,
          auditLogs: true,
          sovereignDashboard: false,
          dataResidencyControl: false,
          policyEnforcement: false,
          emergencyKillSwitch: false,
          isolatedInfrastructure: false,
          strategicSimulation: false,
        },
        limits: {
          maxProjects: -1,
          maxPagesPerProject: -1,
          aiGenerationsPerMonth: 1000,
          storageGB: 500,
          bandwidthGB: 5000,
          apiRequestsPerMonth: 1000000,
          teamMembers: 25,
          activeDeployments: -1,
          customDomains: -1,
        },
        restrictions: {
          watermark: false,
          noRealDeployment: false,
          limitedTemplates: false,
          exportCodeDisabled: false,
          sandboxMode: false,
        },
        maxProjects: -1,
        maxPagesPerProject: -1,
        aiGenerationsPerMonth: 1000,
        customDomain: true,
        whiteLabel: true,
        prioritySupport: true,
        analyticsAccess: true,
        chatbotBuilder: true,
        teamMembers: 25,
        iconName: "Building2",
        gradientFrom: "#f59e0b",
        gradientTo: "#d97706",
        accentColor: "#f59e0b",
        isPopular: false,
        isContactSales: true,
        sortOrder: 3,
      },
      
      // ===== SOVEREIGN - Digital Sovereignty Tier =====
      {
        name: "Sovereign",
        nameAr: "سيادي",
        description: "Complete control for government and enterprises",
        descriptionAr: "سيادة رقمية كاملة للحكومات والكيانات السيادية",
        tagline: "Digital Sovereignty Layer",
        taglineAr: "طبقة السيادة الرقمية",
        role: "sovereign",
        tier: "sovereign",
        priceMonthly: 49999,
        priceQuarterly: 124999,
        priceSemiAnnual: 224999,
        priceYearly: 399999,
        currency: "USD",
        features: [
          "Everything in Enterprise",
          "Sovereign Dashboard",
          "AI Governance Engine",
          "Data Residency Control",
          "Policy-based Enforcement",
          "Emergency Kill Switch",
          "Isolated Infrastructure",
          "Strategic Simulation Engine",
          "Immutable Audit Logs",
          "Unlimited AI Generations",
          "Custom Agreements"
        ],
        featuresAr: [
          "كل ميزات Enterprise",
          "لوحة التحكم السيادية",
          "محرك حوكمة الذكاء الاصطناعي",
          "التحكم بإقامة البيانات",
          "الإنفاذ القائم على السياسات",
          "زر الإيقاف الطارئ",
          "بنية تحتية معزولة",
          "محرك المحاكاة الاستراتيجية",
          "سجلات تدقيق غير قابلة للتغيير",
          "توليدات AI غير محدودة",
          "اتفاقيات مخصصة"
        ],
        capabilities: {
          aiMode: "sovereign",
          aiAutonomy: 100,
          smartSuggestions: true,
          aiCodeGeneration: true,
          aiCopilot: true,
          aiOperator: true,
          aiGovernance: true,
          backendGenerator: true,
          frontendGenerator: true,
          fullStackGenerator: true,
          chatbotBuilder: true,
          activeDeployments: -1,
          customDomains: -1,
          cdnAccess: true,
          sslCertificates: true,
          automationPipelines: true,
          cicdIntegration: true,
          webhooks: true,
          scheduledTasks: true,
          versionControl: true,
          branchManagement: true,
          rollbackEnabled: true,
          basicAnalytics: true,
          advancedAnalytics: true,
          performanceMonitoring: true,
          slaMonitoring: true,
          teamRoles: true,
          customPermissions: true,
          apiGateway: true,
          externalIntegrations: true,
          whiteLabel: true,
          multiTenant: true,
          complianceModes: true,
          auditLogs: true,
          sovereignDashboard: true,
          dataResidencyControl: true,
          policyEnforcement: true,
          emergencyKillSwitch: true,
          isolatedInfrastructure: true,
          strategicSimulation: true,
        },
        limits: {
          maxProjects: -1,
          maxPagesPerProject: -1,
          aiGenerationsPerMonth: -1,
          storageGB: -1,
          bandwidthGB: -1,
          apiRequestsPerMonth: -1,
          teamMembers: -1,
          activeDeployments: -1,
          customDomains: -1,
        },
        restrictions: {
          watermark: false,
          noRealDeployment: false,
          limitedTemplates: false,
          exportCodeDisabled: false,
          sandboxMode: false,
        },
        maxProjects: -1,
        maxPagesPerProject: -1,
        aiGenerationsPerMonth: -1,
        customDomain: true,
        whiteLabel: true,
        prioritySupport: true,
        analyticsAccess: true,
        chatbotBuilder: true,
        teamMembers: -1,
        iconName: "Shield",
        gradientFrom: "#ef4444",
        gradientTo: "#dc2626",
        accentColor: "#ef4444",
        isPopular: false,
        isContactSales: true,
        sortOrder: 4,
      },
    ];

    for (const plan of plans) {
      await db.insert(subscriptionPlans).values(plan as any);
    }
  }

  private async initializeTemplates() {
    const existingTemplates = await db.select().from(templates);
    if (existingTemplates.length > 0) return;

    const sampleTemplates: InsertTemplate[] = [
      {
        name: "Modern Landing Page",
        nameAr: "صفحة هبوط عصرية",
        description: "A clean, modern landing page with hero section and features",
        descriptionAr: "صفحة هبوط نظيفة وعصرية مع قسم بطل وميزات",
        category: "Landing",
        industry: "All",
        htmlCode: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>موقعك الجديد</title>
</head>
<body>
  <div class="landing">
    <header class="header">
      <nav class="nav">
        <div class="logo">العلامة التجارية</div>
        <ul class="nav-links">
          <li><a href="#features">المميزات</a></li>
          <li><a href="#about">من نحن</a></li>
          <li><a href="#contact">تواصل</a></li>
        </ul>
      </nav>
    </header>
    <main class="hero">
      <h1>ابنِ شيئاً مذهلاً</h1>
      <p>أنشئ مواقع جميلة باستخدام منصتنا القوية</p>
      <button class="cta-button">ابدأ الآن</button>
    </main>
    <section class="features" id="features">
      <h2>المميزات</h2>
      <div class="feature-grid">
        <div class="feature-card">
          <h3>سريع</h3>
          <p>أداء فائق السرعة</p>
        </div>
        <div class="feature-card">
          <h3>آمن</h3>
          <p>حماية على مستوى المؤسسات</p>
        </div>
        <div class="feature-card">
          <h3>قابل للتوسع</h3>
          <p>نمو بلا حدود</p>
        </div>
      </div>
    </section>
  </div>
</body>
</html>`,
        cssCode: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Tajawal', 'Inter', sans-serif; }
.landing { min-height: 100vh; }
.header { padding: 1rem 2rem; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
.nav { display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto; }
.logo { font-size: 1.5rem; font-weight: bold; color: #6366f1; }
.nav-links { display: flex; list-style: none; gap: 2rem; }
.nav-links a { text-decoration: none; color: #374151; }
.hero { min-height: 80vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; }
.hero h1 { font-size: 3.5rem; margin-bottom: 1rem; }
.hero p { font-size: 1.25rem; margin-bottom: 2rem; opacity: 0.9; }
.cta-button { padding: 1rem 2.5rem; font-size: 1.1rem; background: white; color: #6366f1; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
.features { padding: 5rem 2rem; max-width: 1200px; margin: 0 auto; text-align: center; }
.features h2 { font-size: 2.5rem; margin-bottom: 3rem; }
.feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; }
.feature-card { padding: 2rem; background: #f9fafb; border-radius: 12px; }
.feature-card h3 { color: #6366f1; margin-bottom: 0.5rem; }`,
        jsCode: `document.querySelector('.cta-button').addEventListener('click', () => {
  alert('مرحباً بك! لنبدأ.');
});`,
        thumbnail: null,
        isPremium: false,
        requiredPlan: "free",
      },
      {
        name: "E-commerce Store",
        nameAr: "متجر إلكتروني",
        description: "Complete e-commerce template with product showcase",
        descriptionAr: "قالب متجر إلكتروني كامل مع عرض المنتجات",
        category: "E-commerce",
        industry: "Retail",
        htmlCode: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>متجرنا</title>
</head>
<body>
  <div class="store">
    <nav class="shop-nav">
      <div class="brand">المتجر</div>
      <div class="cart-icon">السلة (0)</div>
    </nav>
    <main class="products">
      <h1>منتجاتنا</h1>
      <div class="product-grid">
        <div class="product-card">
          <div class="product-image"></div>
          <h3>منتج رائع</h3>
          <p class="price">99.99$</p>
          <button class="add-btn">أضف للسلة</button>
        </div>
        <div class="product-card">
          <div class="product-image"></div>
          <h3>منتج مميز</h3>
          <p class="price">149.99$</p>
          <button class="add-btn">أضف للسلة</button>
        </div>
        <div class="product-card">
          <div class="product-image"></div>
          <h3>منتج فاخر</h3>
          <p class="price">199.99$</p>
          <button class="add-btn">أضف للسلة</button>
        </div>
      </div>
    </main>
  </div>
</body>
</html>`,
        cssCode: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Tajawal', sans-serif; background: #f8fafc; }
.shop-nav { display: flex; justify-content: space-between; padding: 1.5rem 2rem; background: white; border-bottom: 1px solid #e5e7eb; }
.brand { font-size: 1.5rem; font-weight: bold; color: #1f2937; }
.cart-icon { cursor: pointer; color: #6366f1; font-weight: 500; }
.products { max-width: 1200px; margin: 0 auto; padding: 3rem 2rem; }
.products h1 { text-align: center; margin-bottom: 3rem; color: #1f2937; }
.product-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; }
.product-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.product-image { height: 200px; background: linear-gradient(135deg, #667eea, #764ba2); }
.product-card h3, .product-card .price, .product-card .add-btn { padding: 0 1.5rem; }
.product-card h3 { padding-top: 1.5rem; color: #1f2937; }
.price { color: #6366f1; font-size: 1.25rem; font-weight: bold; margin: 0.5rem 0; padding: 0 1.5rem; }
.add-btn { width: calc(100% - 3rem); margin: 1rem 1.5rem 1.5rem; padding: 0.75rem; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }`,
        jsCode: `let cartCount = 0;
document.querySelectorAll('.add-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    cartCount++;
    document.querySelector('.cart-icon').textContent = 'السلة (' + cartCount + ')';
  });
});`,
        thumbnail: null,
        isPremium: false,
        requiredPlan: "free",
      },
      {
        name: "Business Services",
        nameAr: "خدمات الشركات",
        description: "Professional services website template",
        descriptionAr: "قالب موقع خدمات احترافي",
        category: "Services",
        industry: "Business",
        htmlCode: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>خدماتنا المتميزة</title>
</head>
<body>
  <header class="header">
    <nav class="nav">
      <div class="logo">شركتنا</div>
      <ul class="nav-links">
        <li><a href="#services">خدماتنا</a></li>
        <li><a href="#about">من نحن</a></li>
        <li><a href="#contact">تواصل معنا</a></li>
      </ul>
    </nav>
  </header>
  <section class="hero">
    <h1>حلول أعمال متكاملة</h1>
    <p>نقدم خدمات استشارية وتقنية عالية الجودة</p>
    <button class="cta">احجز استشارة مجانية</button>
  </section>
  <section class="services" id="services">
    <h2>خدماتنا</h2>
    <div class="services-grid">
      <div class="service-card">
        <div class="icon">📊</div>
        <h3>استشارات الأعمال</h3>
        <p>تحليل وتطوير استراتيجيات النمو</p>
      </div>
      <div class="service-card">
        <div class="icon">💻</div>
        <h3>حلول تقنية</h3>
        <p>تطوير أنظمة مخصصة لأعمالك</p>
      </div>
      <div class="service-card">
        <div class="icon">📈</div>
        <h3>التسويق الرقمي</h3>
        <p>زيادة وصولك وتحويلاتك</p>
      </div>
    </div>
  </section>
</body>
</html>`,
        cssCode: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Tajawal', sans-serif; }
.header { background: #1f2937; padding: 1rem 2rem; }
.nav { display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto; }
.logo { color: white; font-size: 1.5rem; font-weight: bold; }
.nav-links { display: flex; list-style: none; gap: 2rem; }
.nav-links a { color: #d1d5db; text-decoration: none; }
.hero { background: linear-gradient(135deg, #1f2937, #374151); color: white; text-align: center; padding: 6rem 2rem; }
.hero h1 { font-size: 3rem; margin-bottom: 1rem; }
.hero p { font-size: 1.25rem; margin-bottom: 2rem; opacity: 0.9; }
.cta { padding: 1rem 2.5rem; background: #10b981; color: white; border: none; border-radius: 8px; font-size: 1.1rem; cursor: pointer; font-weight: 600; }
.services { padding: 5rem 2rem; max-width: 1200px; margin: 0 auto; text-align: center; }
.services h2 { font-size: 2.5rem; margin-bottom: 3rem; color: #1f2937; }
.services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
.service-card { background: white; padding: 2.5rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.icon { font-size: 3rem; margin-bottom: 1rem; }
.service-card h3 { color: #1f2937; margin-bottom: 0.5rem; }
.service-card p { color: #6b7280; }`,
        jsCode: `document.querySelector('.cta').addEventListener('click', () => {
  alert('شكراً لاهتمامك! سنتواصل معك قريباً.');
});`,
        thumbnail: null,
        isPremium: false,
        requiredPlan: "free",
      },
    ];

    for (const template of sampleTemplates) {
      await db.insert(templates).values(template as any);
    }
  }

  private async initializeComponents() {
    const existingComponents = await db.select().from(components);
    if (existingComponents.length > 0) return;

    const sampleComponents: InsertComponent[] = [
      {
        name: "Hero Section",
        nameAr: "قسم البطل",
        category: "Sections",
        industry: "All",
        htmlCode: `<section class="hero-section">
  <div class="hero-content">
    <h1>مرحباً بك في منصتنا</h1>
    <p>ابنِ موقعك الإلكتروني باستخدام الذكاء الاصطناعي</p>
    <div class="hero-buttons">
      <button class="btn-primary">ابدأ الآن</button>
      <button class="btn-secondary">اعرف المزيد</button>
    </div>
  </div>
</section>`,
        cssCode: `.hero-section { min-height: 80vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 2rem; }
.hero-content h1 { font-size: 3.5rem; margin-bottom: 1rem; }
.hero-content p { font-size: 1.25rem; opacity: 0.9; margin-bottom: 2rem; }
.hero-buttons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
.btn-primary { padding: 1rem 2rem; background: white; color: #6366f1; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-secondary { padding: 1rem 2rem; background: transparent; color: white; border: 2px solid white; border-radius: 8px; font-weight: 600; cursor: pointer; }`,
        jsCode: "",
        thumbnail: null,
        framework: "vanilla",
        isPremium: false,
        requiredPlan: "free",
      },
      {
        name: "Features Grid",
        nameAr: "شبكة المميزات",
        category: "Sections",
        industry: "All",
        htmlCode: `<section class="features-section">
  <h2>لماذا تختارنا؟</h2>
  <div class="features-grid">
    <div class="feature-item">
      <div class="feature-icon">⚡</div>
      <h3>سرعة فائقة</h3>
      <p>أداء محسّن وتحميل سريع</p>
    </div>
    <div class="feature-item">
      <div class="feature-icon">🔒</div>
      <h3>أمان متقدم</h3>
      <p>حماية على مستوى المؤسسات</p>
    </div>
    <div class="feature-item">
      <div class="feature-icon">🎨</div>
      <h3>تصميم مرن</h3>
      <p>تخصيص كامل حسب احتياجاتك</p>
    </div>
  </div>
</section>`,
        cssCode: `.features-section { padding: 5rem 2rem; max-width: 1200px; margin: 0 auto; text-align: center; }
.features-section h2 { font-size: 2.5rem; margin-bottom: 3rem; color: #1f2937; }
.features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; }
.feature-item { padding: 2rem; background: #f9fafb; border-radius: 12px; }
.feature-icon { font-size: 3rem; margin-bottom: 1rem; }
.feature-item h3 { color: #6366f1; margin-bottom: 0.5rem; }
.feature-item p { color: #6b7280; }`,
        jsCode: "",
        thumbnail: null,
        framework: "vanilla",
        isPremium: false,
        requiredPlan: "free",
      },
      {
        name: "Pricing Table",
        nameAr: "جدول الأسعار",
        category: "Sections",
        industry: "All",
        htmlCode: `<section class="pricing-section">
  <h2>اختر خطتك</h2>
  <div class="pricing-grid">
    <div class="pricing-card">
      <h3>أساسي</h3>
      <p class="price">$9.99<span>/شهرياً</span></p>
      <ul class="features-list">
        <li>5 مشاريع</li>
        <li>50 توليد AI</li>
        <li>دعم البريد</li>
      </ul>
      <button class="pricing-btn">اشترك الآن</button>
    </div>
    <div class="pricing-card featured">
      <h3>احترافي</h3>
      <p class="price">$29.99<span>/شهرياً</span></p>
      <ul class="features-list">
        <li>مشاريع غير محدودة</li>
        <li>200 توليد AI</li>
        <li>دعم أولوية</li>
        <li>نطاق مخصص</li>
      </ul>
      <button class="pricing-btn">اشترك الآن</button>
    </div>
    <div class="pricing-card">
      <h3>مؤسسي</h3>
      <p class="price">$99.99<span>/شهرياً</span></p>
      <ul class="features-list">
        <li>كل ميزات Pro</li>
        <li>White Label</li>
        <li>API Access</li>
      </ul>
      <button class="pricing-btn">اشترك الآن</button>
    </div>
  </div>
</section>`,
        cssCode: `.pricing-section { padding: 5rem 2rem; background: #f9fafb; text-align: center; }
.pricing-section h2 { font-size: 2.5rem; margin-bottom: 3rem; }
.pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; max-width: 1000px; margin: 0 auto; }
.pricing-card { background: white; padding: 2.5rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.pricing-card.featured { border: 2px solid #6366f1; transform: scale(1.05); }
.pricing-card h3 { color: #1f2937; margin-bottom: 1rem; }
.price { font-size: 2.5rem; font-weight: bold; color: #6366f1; }
.price span { font-size: 1rem; color: #6b7280; }
.features-list { list-style: none; padding: 1.5rem 0; text-align: right; }
.features-list li { padding: 0.5rem 0; color: #374151; }
.features-list li::before { content: "✓ "; color: #10b981; }
.pricing-btn { width: 100%; padding: 1rem; background: #6366f1; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }`,
        jsCode: "",
        thumbnail: null,
        framework: "vanilla",
        isPremium: false,
        requiredPlan: "free",
      },
      {
        name: "Contact Form",
        nameAr: "نموذج التواصل",
        category: "Forms",
        industry: "All",
        htmlCode: `<section class="contact-section">
  <h2>تواصل معنا</h2>
  <form class="contact-form">
    <div class="form-group">
      <label for="name">الاسم</label>
      <input type="text" id="name" placeholder="اسمك الكامل" required />
    </div>
    <div class="form-group">
      <label for="email">البريد الإلكتروني</label>
      <input type="email" id="email" placeholder="example@email.com" required />
    </div>
    <div class="form-group">
      <label for="message">الرسالة</label>
      <textarea id="message" rows="4" placeholder="رسالتك..." required></textarea>
    </div>
    <button type="submit" class="submit-btn">إرسال</button>
  </form>
</section>`,
        cssCode: `.contact-section { padding: 5rem 2rem; max-width: 600px; margin: 0 auto; }
.contact-section h2 { text-align: center; font-size: 2.5rem; margin-bottom: 2rem; color: #1f2937; }
.contact-form { background: white; padding: 2.5rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.form-group { margin-bottom: 1.5rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151; }
.form-group input, .form-group textarea { width: 100%; padding: 0.875rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem; }
.form-group input:focus, .form-group textarea:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
.submit-btn { width: 100%; padding: 1rem; background: #6366f1; color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; }`,
        jsCode: `document.querySelector('.contact-form').addEventListener('submit', (e) => {
  e.preventDefault();
  alert('تم إرسال رسالتك بنجاح!');
});`,
        thumbnail: null,
        framework: "vanilla",
        isPremium: false,
        requiredPlan: "free",
      },
      {
        name: "Footer",
        nameAr: "تذييل الصفحة",
        category: "Sections",
        industry: "All",
        htmlCode: `<footer class="site-footer">
  <div class="footer-content">
    <div class="footer-section">
      <h4>عن الشركة</h4>
      <p>نحن نقدم حلولاً مبتكرة لبناء مواقع إلكترونية احترافية باستخدام الذكاء الاصطناعي.</p>
    </div>
    <div class="footer-section">
      <h4>روابط سريعة</h4>
      <ul>
        <li><a href="#">الرئيسية</a></li>
        <li><a href="#">الخدمات</a></li>
        <li><a href="#">من نحن</a></li>
        <li><a href="#">تواصل معنا</a></li>
      </ul>
    </div>
    <div class="footer-section">
      <h4>تواصل معنا</h4>
      <ul>
        <li>info@example.com</li>
        <li>+966 50 000 0000</li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <p>© 2025 جميع الحقوق محفوظة</p>
  </div>
</footer>`,
        cssCode: `.site-footer { background: #1f2937; color: white; padding: 4rem 2rem 1rem; }
.footer-content { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; max-width: 1200px; margin: 0 auto 3rem; }
.footer-section h4 { margin-bottom: 1.5rem; font-size: 1.1rem; color: white; }
.footer-section p { color: #9ca3af; line-height: 1.7; }
.footer-section ul { list-style: none; padding: 0; }
.footer-section li { margin-bottom: 0.75rem; color: #9ca3af; }
.footer-section a { color: #9ca3af; text-decoration: none; }
.footer-section a:hover { color: white; }
.footer-bottom { text-align: center; padding-top: 2rem; border-top: 1px solid #374151; color: #9ca3af; }`,
        jsCode: "",
        thumbnail: null,
        framework: "vanilla",
        isPremium: false,
        requiredPlan: "free",
      },
    ];

    for (const component of sampleComponents) {
      await db.insert(components).values(component);
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, stripeCustomerId));
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser as any).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() } as any)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return true;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUserById = await db.select().from(users).where(eq(users.id, userData.id)).limit(1);
    
    if (existingUserById.length > 0) {
      const [updated] = await db
        .update(users)
        .set({
          firstName: userData.firstName || existingUserById[0].firstName,
          lastName: userData.lastName || existingUserById[0].lastName,
          profileImageUrl: userData.profileImageUrl || existingUserById[0].profileImageUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userData.id))
        .returning();
      return updated;
    }
    
    if (userData.email) {
      const existingUserByEmail = await db.select().from(users).where(eq(users.email, userData.email)).limit(1);
      if (existingUserByEmail.length > 0) {
        const [updated] = await db
          .update(users)
          .set({
            firstName: userData.firstName || existingUserByEmail[0].firstName,
            lastName: userData.lastName || existingUserByEmail[0].lastName,
            profileImageUrl: userData.profileImageUrl || existingUserByEmail[0].profileImageUrl,
            authProvider: userData.authProvider || existingUserByEmail[0].authProvider,
            updatedAt: new Date(),
          })
          .where(eq(users.email, userData.email))
          .returning();
        return updated;
      }
    }
    
    const [user] = await db
      .insert(users)
      .values({
        id: userData.id,
        email: userData.email || null,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        profileImageUrl: userData.profileImageUrl || null,
        authProvider: userData.authProvider || "replit",
        role: "free",
        status: "ACTIVE",
        isActive: true,
        emailVerified: true,
      })
      .returning();
    return user;
  }

  // User Governance Methods (Owner only)
  async suspendUser(userId: string, ownerId: string, reason: string): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({
        status: "SUSPENDED",
        isActive: false,
        statusChangedAt: new Date(),
        statusChangedBy: ownerId,
        statusReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async banUser(userId: string, ownerId: string, reason: string): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({
        status: "BANNED",
        isActive: false,
        statusChangedAt: new Date(),
        statusChangedBy: ownerId,
        statusReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async reactivateUser(userId: string, ownerId: string, reason?: string): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({
        status: "ACTIVE",
        isActive: true,
        statusChangedAt: new Date(),
        statusChangedBy: ownerId,
        statusReason: reason || "Reactivated by owner",
        failedLoginAttempts: 0,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async updateUserPermissions(userId: string, permissions: string[]): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ permissions, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async updateUserLoginInfo(userId: string, ip: string): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ lastLoginAt: new Date(), lastLoginIP: ip, failedLoginAttempts: 0, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async incrementFailedLogin(userId: string): Promise<User | undefined> {
    const currentUser = await this.getUser(userId);
    if (!currentUser) return undefined;
    const [user] = await db.update(users)
      .set({ failedLoginAttempts: (currentUser.failedLoginAttempts || 0) + 1, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async resetFailedLogin(userId: string): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ failedLoginAttempts: 0, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async getUsersByStatus(status: string): Promise<User[]> {
    return db.select().from(users).where(eq(users.status, status)).orderBy(desc(users.updatedAt));
  }

  // Subscription Plans methods
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return db.select().from(subscriptionPlans).where(eq(subscriptionPlans.isActive, true)).orderBy(asc(subscriptionPlans.sortOrder));
  }

  async getSubscriptionPlan(id: string): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return plan || undefined;
  }

  async getSubscriptionPlanByRole(role: string): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.role, role));
    return plan || undefined;
  }

  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [created] = await db.insert(subscriptionPlans).values(plan as any).returning();
    return created;
  }

  async updateSubscriptionPlan(id: string, updates: Partial<SubscriptionPlan>): Promise<SubscriptionPlan | undefined> {
    const [updated] = await db
      .update(subscriptionPlans)
      .set({ ...updates, updatedAt: new Date() } as any)
      .where(eq(subscriptionPlans.id, id))
      .returning();
    return updated || undefined;
  }

  // User Subscriptions methods
  async getUserSubscription(userId: string): Promise<UserSubscription | undefined> {
    const [subscription] = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId))
      .orderBy(desc(userSubscriptions.createdAt));
    return subscription || undefined;
  }

  async getAllUserSubscriptions(): Promise<UserSubscription[]> {
    return db.select().from(userSubscriptions);
  }

  async createUserSubscription(subscription: InsertUserSubscription): Promise<UserSubscription> {
    const [created] = await db.insert(userSubscriptions).values(subscription as any).returning();
    return created;
  }

  async updateUserSubscription(id: string, updates: Partial<InsertUserSubscription>): Promise<UserSubscription | undefined> {
    const [subscription] = await db
      .update(userSubscriptions)
      .set({ ...updates, updatedAt: new Date() } as any)
      .where(eq(userSubscriptions.id, id))
      .returning();
    return subscription || undefined;
  }

  // Payments methods
  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    return db.select().from(payments).where(eq(payments.userId, userId)).orderBy(desc(payments.createdAt));
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [created] = await db.insert(payments).values(payment as any).returning();
    return created;
  }

  async updatePayment(id: string, updates: Partial<InsertPayment>): Promise<Payment | undefined> {
    const [payment] = await db
      .update(payments)
      .set(updates)
      .where(eq(payments.id, id))
      .returning();
    return payment || undefined;
  }

  // AI Usage methods
  async getAiUsage(userId: string, month: string): Promise<AiUsage | undefined> {
    const [usage] = await db
      .select()
      .from(aiUsage)
      .where(and(eq(aiUsage.userId, userId), eq(aiUsage.month, month)));
    return usage || undefined;
  }

  async createAiUsage(usage: InsertAiUsage): Promise<AiUsage> {
    const [created] = await db.insert(aiUsage).values(usage as any).returning();
    return created;
  }

  async updateAiUsage(id: string, updates: Partial<InsertAiUsage>): Promise<AiUsage | undefined> {
    const [usage] = await db
      .update(aiUsage)
      .set(updates)
      .where(eq(aiUsage.id, id))
      .returning();
    return usage || undefined;
  }

  // Project methods
  async getProjects(): Promise<Project[]> {
    return db.select().from(projects)
      .where(sql`${projects.deletedAt} IS NULL`)
      .orderBy(desc(projects.updatedAt));
  }

  async getProjectsByUser(userId: string): Promise<Project[]> {
    return db.select().from(projects)
      .where(and(eq(projects.userId, userId), sql`${projects.deletedAt} IS NULL`))
      .orderBy(desc(projects.updatedAt));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects)
      .where(and(eq(projects.id, id), sql`${projects.deletedAt} IS NULL`));
    return project || undefined;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(insertProject as any).returning();
    return project;
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() } as any)
      .where(eq(projects.id, id))
      .returning();
    return project || undefined;
  }

  async deleteProject(id: string): Promise<boolean> {
    // Soft delete - move to recycle bin
    const result = await db
      .update(projects)
      .set({ 
        deletedAt: new Date(),
        status: 'deleted'
      } as any)
      .where(eq(projects.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getDeletedProjects(userId?: string): Promise<Project[]> {
    if (userId) {
      return db.select().from(projects)
        .where(and(eq(projects.userId, userId), sql`${projects.deletedAt} IS NOT NULL`))
        .orderBy(desc(projects.deletedAt));
    }
    return db.select().from(projects)
      .where(sql`${projects.deletedAt} IS NOT NULL`)
      .orderBy(desc(projects.deletedAt));
  }

  async getDeletedProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects)
      .where(and(eq(projects.id, id), sql`${projects.deletedAt} IS NOT NULL`));
    return project || undefined;
  }

  async restoreProject(id: string): Promise<boolean> {
    const result = await db
      .update(projects)
      .set({ 
        deletedAt: null,
        status: 'draft'
      } as any)
      .where(eq(projects.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async permanentlyDeleteProject(id: string): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async ensureSystemProject(): Promise<Project> {
    const SYSTEM_PROJECT_ID = "infera-webnova-core";
    
    const [existing] = await db.select().from(projects).where(eq(projects.id, SYSTEM_PROJECT_ID));
    if (existing) {
      return existing;
    }
    
    const [systemProject] = await db.insert(projects).values({
      id: SYSTEM_PROJECT_ID,
      name: "INFERA WebNova",
      description: "نظام التشغيل الذاتي للمنصات الرقمية - Autonomous Digital Platform Operating System",
      industry: "platform",
      language: "ar",
      htmlCode: "",
      cssCode: "",
      jsCode: "",
      isPublished: false,
      isSystemProject: true,
    }).onConflictDoNothing().returning();
    
    if (systemProject) {
      return systemProject;
    }
    
    const [refetched] = await db.select().from(projects).where(eq(projects.id, SYSTEM_PROJECT_ID));
    return refetched;
  }

  // Message methods
  async getMessagesByProject(projectId: string): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(eq(messages.projectId, projectId))
      .orderBy(asc(messages.createdAt));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage as any).returning();
    return message;
  }

  // Template methods
  async getTemplates(): Promise<Template[]> {
    return db.select().from(templates);
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template || undefined;
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const [template] = await db.insert(templates).values(insertTemplate as any).returning();
    return template;
  }

  // Project Versions methods
  async getProjectVersions(projectId: string): Promise<ProjectVersion[]> {
    return db
      .select()
      .from(projectVersions)
      .where(eq(projectVersions.projectId, projectId))
      .orderBy(desc(projectVersions.createdAt));
  }

  async getProjectVersion(id: string): Promise<ProjectVersion | undefined> {
    const [version] = await db.select().from(projectVersions).where(eq(projectVersions.id, id));
    return version || undefined;
  }

  async createProjectVersion(insertVersion: InsertProjectVersion): Promise<ProjectVersion> {
    const [version] = await db.insert(projectVersions).values(insertVersion as any).returning();
    return version;
  }

  // Share Links methods
  async getShareLink(shareCode: string): Promise<ShareLink | undefined> {
    const [link] = await db.select().from(shareLinks).where(eq(shareLinks.shareCode, shareCode));
    return link || undefined;
  }

  async getShareLinksByProject(projectId: string): Promise<ShareLink[]> {
    return db.select().from(shareLinks).where(eq(shareLinks.projectId, projectId));
  }

  async createShareLink(insertLink: InsertShareLink): Promise<ShareLink> {
    const [link] = await db.insert(shareLinks).values(insertLink as any).returning();
    return link;
  }

  async deactivateShareLink(id: string): Promise<boolean> {
    const result = await db
      .update(shareLinks)
      .set({ isActive: "false" })
      .where(eq(shareLinks.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Notifications methods
  async getNotifications(userId: string): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async getUnreadNotificationsCount(userId: string): Promise<number> {
    const result = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return result.length;
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(insertNotification as any).returning();
    return notification;
  }

  async markNotificationRead(id: string, userId: string): Promise<Notification | undefined> {
    const [notification] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
      .returning();
    return notification || undefined;
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }

  async deleteNotification(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(notifications)
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  // Collaborators methods
  async getCollaborators(projectId: string): Promise<Collaborator[]> {
    return db
      .select()
      .from(collaborators)
      .where(eq(collaborators.projectId, projectId))
      .orderBy(desc(collaborators.createdAt));
  }

  async getCollaborationInvites(userId: string): Promise<Collaborator[]> {
    return db
      .select()
      .from(collaborators)
      .where(and(eq(collaborators.userId, userId), eq(collaborators.status, "pending")))
      .orderBy(desc(collaborators.createdAt));
  }

  async createCollaborator(insertCollaborator: InsertCollaborator): Promise<Collaborator> {
    const [collaborator] = await db.insert(collaborators).values(insertCollaborator as any).returning();
    return collaborator;
  }

  async respondToCollaboration(id: string, userId: string, accept: boolean): Promise<Collaborator | undefined> {
    const [collaborator] = await db
      .update(collaborators)
      .set({ 
        status: accept ? "accepted" : "rejected",
        acceptedAt: accept ? new Date() : null 
      })
      .where(and(eq(collaborators.id, id), eq(collaborators.userId, userId)))
      .returning();
    return collaborator || undefined;
  }

  async deleteCollaborator(id: string): Promise<boolean> {
    const result = await db.delete(collaborators).where(eq(collaborators.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Project Comments methods
  async getProjectComments(projectId: string): Promise<ProjectComment[]> {
    return db
      .select()
      .from(projectComments)
      .where(eq(projectComments.projectId, projectId))
      .orderBy(desc(projectComments.createdAt));
  }

  async createProjectComment(insertComment: InsertProjectComment): Promise<ProjectComment> {
    const [comment] = await db.insert(projectComments).values(insertComment as any).returning();
    return comment;
  }

  async updateProjectComment(id: string, userId: string, updates: Partial<InsertProjectComment>): Promise<ProjectComment | undefined> {
    const [comment] = await db
      .update(projectComments)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(projectComments.id, id), eq(projectComments.userId, userId)))
      .returning();
    return comment || undefined;
  }

  async deleteProjectComment(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(projectComments)
      .where(and(eq(projectComments.id, id), eq(projectComments.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  async resolveProjectComment(id: string): Promise<ProjectComment | undefined> {
    const [comment] = await db
      .update(projectComments)
      .set({ isResolved: true, updatedAt: new Date() })
      .where(eq(projectComments.id, id))
      .returning();
    return comment || undefined;
  }

  // Components methods
  async getComponents(): Promise<Component[]> {
    return db.select().from(components);
  }

  async getComponentsByCategory(category: string): Promise<Component[]> {
    return db.select().from(components).where(eq(components.category, category));
  }

  async getComponent(id: string): Promise<Component | undefined> {
    const [component] = await db.select().from(components).where(eq(components.id, id));
    return component || undefined;
  }

  async createComponent(insertComponent: InsertComponent): Promise<Component> {
    const [component] = await db.insert(components).values(insertComponent as any).returning();
    return component;
  }

  // OTP methods
  async createOtpCode(insertOtp: InsertOtpCode): Promise<OtpCode> {
    const [otp] = await db.insert(otpCodes).values(insertOtp as any).returning();
    return otp;
  }

  async getValidOtpCode(userId: string, code: string): Promise<OtpCode | undefined> {
    const [otp] = await db
      .select()
      .from(otpCodes)
      .where(
        and(
          eq(otpCodes.userId, userId),
          eq(otpCodes.code, code),
          eq(otpCodes.isUsed, false)
        )
      );
    
    if (!otp) return undefined;
    
    // Check if expired
    if (new Date() > otp.expiresAt) {
      return undefined;
    }
    
    return otp;
  }

  async markOtpUsed(id: string): Promise<void> {
    await db.update(otpCodes).set({ isUsed: true } as any).where(eq(otpCodes.id, id));
  }

  // Chatbot methods
  async getChatbotsByUser(userId: string): Promise<Chatbot[]> {
    return db.select().from(chatbots).where(eq(chatbots.userId, userId)).orderBy(desc(chatbots.createdAt));
  }

  async getChatbot(id: string): Promise<Chatbot | undefined> {
    const [chatbot] = await db.select().from(chatbots).where(eq(chatbots.id, id));
    return chatbot || undefined;
  }

  async createChatbot(insertChatbot: InsertChatbot): Promise<Chatbot> {
    const [chatbot] = await db.insert(chatbots).values(insertChatbot as any).returning();
    return chatbot;
  }

  async updateChatbot(id: string, updateData: Partial<InsertChatbot>): Promise<Chatbot | undefined> {
    const [chatbot] = await db.update(chatbots).set(updateData as any).where(eq(chatbots.id, id)).returning();
    return chatbot || undefined;
  }

  async deleteChatbot(id: string): Promise<boolean> {
    const result = await db.delete(chatbots).where(eq(chatbots.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // AI Assistants methods
  async getAiAssistants(): Promise<AiAssistant[]> {
    return db.select().from(aiAssistants).orderBy(asc(aiAssistants.name));
  }

  async getAiAssistant(id: string): Promise<AiAssistant | undefined> {
    const [assistant] = await db.select().from(aiAssistants).where(eq(aiAssistants.id, id));
    return assistant || undefined;
  }

  async createAiAssistant(assistant: InsertAiAssistant): Promise<AiAssistant> {
    const [created] = await db.insert(aiAssistants).values(assistant as any).returning();
    return created;
  }

  async updateAiAssistant(id: string, updateData: Partial<InsertAiAssistant>): Promise<AiAssistant | undefined> {
    const [updated] = await db.update(aiAssistants).set(updateData as any).where(eq(aiAssistants.id, id)).returning();
    return updated || undefined;
  }

  // Assistant Instructions methods
  async getInstructionsByAssistant(assistantId: string): Promise<AssistantInstruction[]> {
    return db.select().from(assistantInstructions)
      .where(eq(assistantInstructions.assistantId, assistantId))
      .orderBy(desc(assistantInstructions.createdAt));
  }

  async getAllInstructions(): Promise<AssistantInstruction[]> {
    return db.select().from(assistantInstructions).orderBy(desc(assistantInstructions.createdAt));
  }

  async createInstruction(instruction: InsertAssistantInstruction): Promise<AssistantInstruction> {
    const [created] = await db.insert(assistantInstructions).values(instruction as any).returning();
    return created;
  }

  async updateInstruction(id: string, updateData: Partial<InsertAssistantInstruction>): Promise<AssistantInstruction | undefined> {
    const [updated] = await db.update(assistantInstructions).set(updateData as any).where(eq(assistantInstructions.id, id)).returning();
    return updated || undefined;
  }

  // Owner Settings methods
  async getOwnerSettings(userId: string): Promise<OwnerSettings | undefined> {
    const [settings] = await db.select().from(ownerSettings).where(eq(ownerSettings.userId, userId));
    return settings || undefined;
  }

  async createOwnerSettings(settings: InsertOwnerSettings): Promise<OwnerSettings> {
    const [created] = await db.insert(ownerSettings).values(settings as any).returning();
    return created;
  }

  async updateOwnerSettings(userId: string, updateData: Partial<InsertOwnerSettings>): Promise<OwnerSettings | undefined> {
    const [updated] = await db.update(ownerSettings).set(updateData as any).where(eq(ownerSettings.userId, userId)).returning();
    return updated || undefined;
  }

  // Audit Logs methods
  async getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
    return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
  }

  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [created] = await db.insert(auditLogs).values(log as any).returning();
    return created;
  }

  // Payment Methods methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return db.select().from(paymentMethods).orderBy(asc(paymentMethods.sortOrder));
  }

  async getActivePaymentMethods(): Promise<PaymentMethod[]> {
    return db.select().from(paymentMethods)
      .where(and(eq(paymentMethods.isActive, true), eq(paymentMethods.isConfigured, true)))
      .orderBy(asc(paymentMethods.sortOrder));
  }

  async getPaymentMethod(id: string): Promise<PaymentMethod | undefined> {
    const [method] = await db.select().from(paymentMethods).where(eq(paymentMethods.id, id));
    return method || undefined;
  }

  async createPaymentMethod(method: InsertPaymentMethod): Promise<PaymentMethod> {
    const [created] = await db.insert(paymentMethods).values(method as any).returning();
    return created;
  }

  async updatePaymentMethod(id: string, updateData: Partial<InsertPaymentMethod>): Promise<PaymentMethod | undefined> {
    const [updated] = await db.update(paymentMethods)
      .set({ ...updateData, updatedAt: new Date() } as any)
      .where(eq(paymentMethods.id, id))
      .returning();
    return updated || undefined;
  }

  async togglePaymentMethod(id: string, isActive: boolean): Promise<PaymentMethod | undefined> {
    const [updated] = await db.update(paymentMethods)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(paymentMethods.id, id))
      .returning();
    return updated || undefined;
  }

  async deletePaymentMethod(id: string): Promise<boolean> {
    const result = await db.delete(paymentMethods).where(eq(paymentMethods.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Payment Transactions methods
  async getPaymentTransactions(limit: number = 100): Promise<PaymentTransaction[]> {
    return db.select().from(paymentTransactions).orderBy(desc(paymentTransactions.createdAt)).limit(limit);
  }

  async getPaymentTransactionsByUser(userId: string): Promise<PaymentTransaction[]> {
    return db.select().from(paymentTransactions)
      .where(eq(paymentTransactions.userId, userId))
      .orderBy(desc(paymentTransactions.createdAt));
  }

  async getPaymentTransaction(id: string): Promise<PaymentTransaction | undefined> {
    const [transaction] = await db.select().from(paymentTransactions).where(eq(paymentTransactions.id, id));
    return transaction || undefined;
  }

  async createPaymentTransaction(transaction: InsertPaymentTransaction): Promise<PaymentTransaction> {
    const [created] = await db.insert(paymentTransactions).values(transaction as any).returning();
    return created;
  }

  async updatePaymentTransaction(id: string, updateData: Partial<InsertPaymentTransaction>): Promise<PaymentTransaction | undefined> {
    const [updated] = await db.update(paymentTransactions)
      .set(updateData)
      .where(eq(paymentTransactions.id, id))
      .returning();
    return updated || undefined;
  }

  // Authentication Methods implementation
  async getAuthMethods(): Promise<AuthMethod[]> {
    return db.select().from(authMethods).orderBy(asc(authMethods.sortOrder));
  }

  async getActiveAuthMethods(): Promise<AuthMethod[]> {
    return db.select().from(authMethods)
      .where(eq(authMethods.isActive, true))
      .orderBy(asc(authMethods.sortOrder));
  }

  async getVisibleAuthMethods(): Promise<AuthMethod[]> {
    return db.select().from(authMethods)
      .where(and(eq(authMethods.isActive, true), eq(authMethods.isVisible, true)))
      .orderBy(asc(authMethods.sortOrder));
  }

  async getAuthMethod(id: string): Promise<AuthMethod | undefined> {
    const [method] = await db.select().from(authMethods).where(eq(authMethods.id, id));
    return method || undefined;
  }

  async getAuthMethodByKey(key: string): Promise<AuthMethod | undefined> {
    const [method] = await db.select().from(authMethods).where(eq(authMethods.key, key));
    return method || undefined;
  }

  async createAuthMethod(method: InsertAuthMethod): Promise<AuthMethod> {
    const [created] = await db.insert(authMethods).values(method as any).returning();
    return created;
  }

  async updateAuthMethod(id: string, updateData: Partial<InsertAuthMethod>): Promise<AuthMethod | undefined> {
    const [updated] = await db.update(authMethods)
      .set({ ...updateData, updatedAt: new Date() } as any)
      .where(eq(authMethods.id, id))
      .returning();
    return updated || undefined;
  }

  async toggleAuthMethod(id: string, isActive: boolean): Promise<AuthMethod | undefined> {
    const method = await this.getAuthMethod(id);
    if (!method) return undefined;
    if (method.isDefault && !isActive) {
      throw new Error("Cannot deactivate the default authentication method");
    }
    const [updated] = await db.update(authMethods)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(authMethods.id, id))
      .returning();
    return updated || undefined;
  }

  async toggleAuthMethodVisibility(id: string, isVisible: boolean): Promise<AuthMethod | undefined> {
    const method = await this.getAuthMethod(id);
    if (!method) return undefined;
    if (method.isDefault && !isVisible) {
      throw new Error("Cannot hide the default authentication method");
    }
    const [updated] = await db.update(authMethods)
      .set({ isVisible, updatedAt: new Date() })
      .where(eq(authMethods.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteAuthMethod(id: string): Promise<boolean> {
    const method = await this.getAuthMethod(id);
    if (!method) return false;
    if (method.isDefault) {
      throw new Error("Cannot delete the default authentication method");
    }
    const result = await db.delete(authMethods).where(eq(authMethods.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // AI Models implementation
  async getAiModels(): Promise<AiModel[]> {
    return db.select().from(aiModels).orderBy(asc(aiModels.sortOrder));
  }

  async getActiveAiModels(): Promise<AiModel[]> {
    return db.select().from(aiModels)
      .where(eq(aiModels.isActive, true))
      .orderBy(asc(aiModels.sortOrder));
  }

  async getAiModel(id: string): Promise<AiModel | undefined> {
    const [model] = await db.select().from(aiModels).where(eq(aiModels.id, id));
    return model || undefined;
  }

  async getDefaultAiModel(): Promise<AiModel | undefined> {
    const [model] = await db.select().from(aiModels)
      .where(and(eq(aiModels.isDefault, true), eq(aiModels.isActive, true)));
    return model || undefined;
  }

  async createAiModel(model: InsertAiModel): Promise<AiModel> {
    const [created] = await db.insert(aiModels).values(model as any).returning();
    return created;
  }

  async updateAiModel(id: string, updateData: Partial<InsertAiModel>): Promise<AiModel | undefined> {
    const [updated] = await db.update(aiModels)
      .set({ ...updateData, updatedAt: new Date() } as any)
      .where(eq(aiModels.id, id))
      .returning();
    return updated || undefined;
  }

  async toggleAiModel(id: string, isActive: boolean): Promise<AiModel | undefined> {
    const model = await this.getAiModel(id);
    if (!model) return undefined;
    if (model.isDefault && !isActive) {
      throw new Error("Cannot deactivate the default AI model");
    }
    const [updated] = await db.update(aiModels)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(aiModels.id, id))
      .returning();
    return updated || undefined;
  }

  async setDefaultAiModel(id: string): Promise<AiModel | undefined> {
    await db.update(aiModels).set({ isDefault: false, updatedAt: new Date() });
    const [updated] = await db.update(aiModels)
      .set({ isDefault: true, isActive: true, updatedAt: new Date() })
      .where(eq(aiModels.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteAiModel(id: string): Promise<boolean> {
    const model = await this.getAiModel(id);
    if (!model) return false;
    if (model.isDefault) {
      throw new Error("Cannot delete the default AI model");
    }
    const result = await db.delete(aiModels).where(eq(aiModels.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // AI Usage Policies implementation
  async getAiUsagePolicies(): Promise<AiUsagePolicy[]> {
    return db.select().from(aiUsagePolicies);
  }

  async getAiUsagePolicy(id: string): Promise<AiUsagePolicy | undefined> {
    const [policy] = await db.select().from(aiUsagePolicies).where(eq(aiUsagePolicies.id, id));
    return policy || undefined;
  }

  async getAiUsagePolicyByPlan(planRole: string): Promise<AiUsagePolicy | undefined> {
    const [policy] = await db.select().from(aiUsagePolicies).where(eq(aiUsagePolicies.planRole, planRole));
    return policy || undefined;
  }

  async createAiUsagePolicy(policy: InsertAiUsagePolicy): Promise<AiUsagePolicy> {
    const [created] = await db.insert(aiUsagePolicies).values(policy as any).returning();
    return created;
  }

  async updateAiUsagePolicy(id: string, updateData: Partial<InsertAiUsagePolicy>): Promise<AiUsagePolicy | undefined> {
    const [updated] = await db.update(aiUsagePolicies)
      .set({ ...updateData, updatedAt: new Date() } as any)
      .where(eq(aiUsagePolicies.id, id))
      .returning();
    return updated || undefined;
  }

  // AI Cost Tracking implementation
  async getAiCostTracking(date: string): Promise<AiCostTracking[]> {
    return db.select().from(aiCostTracking).where(eq(aiCostTracking.date, date));
  }

  async getAiCostTrackingByUser(userId: string, startDate: string, endDate: string): Promise<AiCostTracking[]> {
    return db.select().from(aiCostTracking)
      .where(and(eq(aiCostTracking.userId, userId), gt(aiCostTracking.date, startDate)));
  }

  async createAiCostTracking(tracking: InsertAiCostTracking): Promise<AiCostTracking> {
    const [created] = await db.insert(aiCostTracking).values(tracking as any).returning();
    return created;
  }

  async getAiCostSummary(startDate: string, endDate: string): Promise<{ totalCost: number; totalTokens: number; byModel: Record<string, number>; byFeature: Record<string, number> }> {
    const records = await db.select().from(aiCostTracking);
    let totalCost = 0;
    let totalTokens = 0;
    const byModel: Record<string, number> = {};
    const byFeature: Record<string, number> = {};
    for (const record of records) {
      totalCost += record.totalCost;
      totalTokens += record.totalTokens;
      byModel[record.modelId] = (byModel[record.modelId] || 0) + record.totalCost;
      byFeature[record.feature] = (byFeature[record.feature] || 0) + record.totalCost;
    }
    return { totalCost, totalTokens, byModel, byFeature };
  }

  // Emergency Controls implementation
  async getEmergencyControls(): Promise<EmergencyControl[]> {
    return db.select().from(emergencyControls).orderBy(desc(emergencyControls.createdAt));
  }

  async getActiveEmergencyControls(): Promise<EmergencyControl[]> {
    return db.select().from(emergencyControls)
      .where(eq(emergencyControls.isActive, true))
      .orderBy(desc(emergencyControls.createdAt));
  }

  async getEmergencyControl(id: string): Promise<EmergencyControl | undefined> {
    const [control] = await db.select().from(emergencyControls).where(eq(emergencyControls.id, id));
    return control || undefined;
  }

  async createEmergencyControl(control: InsertEmergencyControl): Promise<EmergencyControl> {
    const [created] = await db.insert(emergencyControls).values(control as any).returning();
    return created;
  }

  async deactivateEmergencyControl(id: string, deactivatedBy: string): Promise<EmergencyControl | undefined> {
    const [updated] = await db.update(emergencyControls)
      .set({ isActive: false, deactivatedAt: new Date(), deactivatedBy })
      .where(eq(emergencyControls.id, id))
      .returning();
    return updated || undefined;
  }

  // Feature Flags implementation
  async getFeatureFlags(): Promise<FeatureFlag[]> {
    return db.select().from(featureFlags).orderBy(asc(featureFlags.key));
  }

  async getFeatureFlag(id: string): Promise<FeatureFlag | undefined> {
    const [flag] = await db.select().from(featureFlags).where(eq(featureFlags.id, id));
    return flag || undefined;
  }

  async getFeatureFlagByKey(key: string): Promise<FeatureFlag | undefined> {
    const [flag] = await db.select().from(featureFlags).where(eq(featureFlags.key, key));
    return flag || undefined;
  }

  async createFeatureFlag(flag: InsertFeatureFlag): Promise<FeatureFlag> {
    const [created] = await db.insert(featureFlags).values(flag as any).returning();
    return created;
  }

  async updateFeatureFlag(id: string, updateData: Partial<InsertFeatureFlag>): Promise<FeatureFlag | undefined> {
    const [updated] = await db.update(featureFlags)
      .set({ ...updateData, updatedAt: new Date() } as any)
      .where(eq(featureFlags.id, id))
      .returning();
    return updated || undefined;
  }

  async toggleFeatureFlag(id: string, isEnabled: boolean): Promise<FeatureFlag | undefined> {
    const [updated] = await db.update(featureFlags)
      .set({ isEnabled, updatedAt: new Date() })
      .where(eq(featureFlags.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteFeatureFlag(id: string): Promise<boolean> {
    const result = await db.delete(featureFlags).where(eq(featureFlags.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // System Announcements implementation
  async getSystemAnnouncements(): Promise<SystemAnnouncement[]> {
    return db.select().from(systemAnnouncements).orderBy(desc(systemAnnouncements.createdAt));
  }

  async getActiveSystemAnnouncements(): Promise<SystemAnnouncement[]> {
    return db.select().from(systemAnnouncements)
      .where(eq(systemAnnouncements.isActive, true))
      .orderBy(desc(systemAnnouncements.createdAt));
  }

  async getSystemAnnouncement(id: string): Promise<SystemAnnouncement | undefined> {
    const [announcement] = await db.select().from(systemAnnouncements).where(eq(systemAnnouncements.id, id));
    return announcement || undefined;
  }

  async createSystemAnnouncement(announcement: InsertSystemAnnouncement): Promise<SystemAnnouncement> {
    const [created] = await db.insert(systemAnnouncements).values(announcement as any).returning();
    return created;
  }

  async updateSystemAnnouncement(id: string, updateData: Partial<InsertSystemAnnouncement>): Promise<SystemAnnouncement | undefined> {
    const [updated] = await db.update(systemAnnouncements)
      .set({ ...updateData, updatedAt: new Date() } as any)
      .where(eq(systemAnnouncements.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteSystemAnnouncement(id: string): Promise<boolean> {
    const result = await db.delete(systemAnnouncements).where(eq(systemAnnouncements.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Admin Roles implementation
  async getAdminRoles(): Promise<AdminRole[]> {
    return db.select().from(adminRoles).orderBy(desc(adminRoles.level));
  }

  async getAdminRole(id: string): Promise<AdminRole | undefined> {
    const [role] = await db.select().from(adminRoles).where(eq(adminRoles.id, id));
    return role || undefined;
  }

  async getAdminRoleByKey(key: string): Promise<AdminRole | undefined> {
    const [role] = await db.select().from(adminRoles).where(eq(adminRoles.key, key));
    return role || undefined;
  }

  async createAdminRole(role: InsertAdminRole): Promise<AdminRole> {
    const [created] = await db.insert(adminRoles).values(role as any).returning();
    return created;
  }

  async updateAdminRole(id: string, updateData: Partial<InsertAdminRole>): Promise<AdminRole | undefined> {
    const role = await this.getAdminRole(id);
    if (!role) return undefined;
    if (role.isSystem) {
      throw new Error("Cannot modify system roles");
    }
    const [updated] = await db.update(adminRoles)
      .set({ ...updateData, updatedAt: new Date() } as any)
      .where(eq(adminRoles.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteAdminRole(id: string): Promise<boolean> {
    const role = await this.getAdminRole(id);
    if (!role) return false;
    if (role.isSystem) {
      throw new Error("Cannot delete system roles");
    }
    const result = await db.delete(adminRoles).where(eq(adminRoles.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // User Admin Roles implementation
  async getUserAdminRoles(userId: string): Promise<UserAdminRole[]> {
    return db.select().from(userAdminRoles)
      .where(and(eq(userAdminRoles.userId, userId), eq(userAdminRoles.isActive, true)));
  }

  async assignAdminRole(assignment: InsertUserAdminRole): Promise<UserAdminRole> {
    const [created] = await db.insert(userAdminRoles).values(assignment as any).returning();
    return created;
  }

  async revokeAdminRole(userId: string, roleId: string): Promise<boolean> {
    const [updated] = await db.update(userAdminRoles)
      .set({ isActive: false })
      .where(and(eq(userAdminRoles.userId, userId), eq(userAdminRoles.roleId, roleId)))
      .returning();
    return !!updated;
  }

  // Platform Metrics implementation
  async getPlatformMetrics(date: string): Promise<PlatformMetrics | undefined> {
    const [metrics] = await db.select().from(platformMetrics).where(eq(platformMetrics.date, date));
    return metrics || undefined;
  }

  async getPlatformMetricsRange(startDate: string, endDate: string): Promise<PlatformMetrics[]> {
    return db.select().from(platformMetrics)
      .where(gt(platformMetrics.date, startDate))
      .orderBy(asc(platformMetrics.date));
  }

  async createPlatformMetrics(metrics: InsertPlatformMetrics): Promise<PlatformMetrics> {
    const [created] = await db.insert(platformMetrics).values(metrics as any).returning();
    return created;
  }

  async updatePlatformMetrics(date: string, updateData: Partial<InsertPlatformMetrics>): Promise<PlatformMetrics | undefined> {
    const [updated] = await db.update(platformMetrics)
      .set(updateData)
      .where(eq(platformMetrics.date, date))
      .returning();
    return updated || undefined;
  }

  // Subscription Events implementation
  async getSubscriptionEvents(limit: number = 100): Promise<SubscriptionEvent[]> {
    return db.select().from(subscriptionEvents).orderBy(desc(subscriptionEvents.createdAt)).limit(limit);
  }

  async getSubscriptionEventsByUser(userId: string): Promise<SubscriptionEvent[]> {
    return db.select().from(subscriptionEvents)
      .where(eq(subscriptionEvents.userId, userId))
      .orderBy(desc(subscriptionEvents.createdAt));
  }

  async createSubscriptionEvent(event: InsertSubscriptionEvent): Promise<SubscriptionEvent> {
    const [created] = await db.insert(subscriptionEvents).values(event as any).returning();
    return created;
  }

  // ============ Sovereign AI Assistants Implementation ============
  
  async getSovereignAssistants(): Promise<SovereignAssistant[]> {
    return db.select().from(sovereignAssistants).orderBy(asc(sovereignAssistants.type));
  }

  async getSovereignAssistant(id: string): Promise<SovereignAssistant | undefined> {
    const [assistant] = await db.select().from(sovereignAssistants).where(eq(sovereignAssistants.id, id));
    return assistant || undefined;
  }

  async getSovereignAssistantByType(type: string): Promise<SovereignAssistant | undefined> {
    const [assistant] = await db.select().from(sovereignAssistants).where(eq(sovereignAssistants.type, type));
    return assistant || undefined;
  }

  async createSovereignAssistant(assistant: InsertSovereignAssistant): Promise<SovereignAssistant> {
    const [created] = await db.insert(sovereignAssistants).values(assistant as any).returning();
    return created;
  }

  async updateSovereignAssistant(id: string, data: Partial<InsertSovereignAssistant>): Promise<SovereignAssistant | undefined> {
    const [updated] = await db.update(sovereignAssistants)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(sovereignAssistants.id, id))
      .returning();
    return updated || undefined;
  }

  async toggleSovereignAssistant(id: string, isActive: boolean): Promise<SovereignAssistant | undefined> {
    const [updated] = await db.update(sovereignAssistants)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(sovereignAssistants.id, id))
      .returning();
    return updated || undefined;
  }

  async toggleSovereignAutonomy(id: string, isAutonomous: boolean): Promise<SovereignAssistant | undefined> {
    const [updated] = await db.update(sovereignAssistants)
      .set({ isAutonomous, updatedAt: new Date() })
      .where(eq(sovereignAssistants.id, id))
      .returning();
    return updated || undefined;
  }

  // ============ Sovereign Commands Implementation ============
  
  async getSovereignCommands(limit: number = 100): Promise<SovereignCommand[]> {
    return db.select().from(sovereignCommands).orderBy(desc(sovereignCommands.createdAt)).limit(limit);
  }

  async getSovereignCommandsByAssistant(assistantId: string): Promise<SovereignCommand[]> {
    return db.select().from(sovereignCommands)
      .where(eq(sovereignCommands.assistantId, assistantId))
      .orderBy(desc(sovereignCommands.createdAt));
  }

  async getSovereignCommand(id: string): Promise<SovereignCommand | undefined> {
    const [command] = await db.select().from(sovereignCommands).where(eq(sovereignCommands.id, id));
    return command || undefined;
  }

  async createSovereignCommand(command: InsertSovereignCommand): Promise<SovereignCommand> {
    const [created] = await db.insert(sovereignCommands).values(command as any).returning();
    return created;
  }

  async updateSovereignCommand(id: string, data: Partial<InsertSovereignCommand>): Promise<SovereignCommand | undefined> {
    const [updated] = await db.update(sovereignCommands)
      .set(data as any)
      .where(eq(sovereignCommands.id, id))
      .returning();
    return updated || undefined;
  }

  async approveSovereignCommand(id: string, approvedBy: string): Promise<SovereignCommand | undefined> {
    const [updated] = await db.update(sovereignCommands)
      .set({ 
        isApproved: true, 
        approvedBy, 
        approvedAt: new Date(),
        status: "executing"
      })
      .where(eq(sovereignCommands.id, id))
      .returning();
    return updated || undefined;
  }

  async cancelSovereignCommand(id: string): Promise<SovereignCommand | undefined> {
    const [updated] = await db.update(sovereignCommands)
      .set({ status: "cancelled" })
      .where(eq(sovereignCommands.id, id))
      .returning();
    return updated || undefined;
  }

  async rollbackSovereignCommand(id: string, rolledBackBy: string): Promise<SovereignCommand | undefined> {
    const [updated] = await db.update(sovereignCommands)
      .set({ 
        status: "rolled_back",
        rolledBackBy,
        rolledBackAt: new Date()
      })
      .where(eq(sovereignCommands.id, id))
      .returning();
    return updated || undefined;
  }

  // ============ Sovereign Actions Implementation ============
  
  async getSovereignActionsByCommand(commandId: string): Promise<SovereignAction[]> {
    return db.select().from(sovereignActions)
      .where(eq(sovereignActions.commandId, commandId))
      .orderBy(asc(sovereignActions.stepNumber));
  }

  async getSovereignAction(id: string): Promise<SovereignAction | undefined> {
    const [action] = await db.select().from(sovereignActions).where(eq(sovereignActions.id, id));
    return action || undefined;
  }

  async createSovereignAction(action: InsertSovereignAction): Promise<SovereignAction> {
    const [created] = await db.insert(sovereignActions).values(action as any).returning();
    return created;
  }

  async updateSovereignAction(id: string, data: Partial<InsertSovereignAction>): Promise<SovereignAction | undefined> {
    const [updated] = await db.update(sovereignActions)
      .set(data)
      .where(eq(sovereignActions.id, id))
      .returning();
    return updated || undefined;
  }

  // ============ Sovereign Action Logs Implementation ============
  
  async getSovereignActionLogs(limit: number = 100): Promise<SovereignActionLog[]> {
    return db.select().from(sovereignActionLogs).orderBy(desc(sovereignActionLogs.createdAt)).limit(limit);
  }

  async getSovereignActionLogsByCommand(commandId: string): Promise<SovereignActionLog[]> {
    return db.select().from(sovereignActionLogs)
      .where(eq(sovereignActionLogs.commandId, commandId))
      .orderBy(asc(sovereignActionLogs.createdAt));
  }

  async getSovereignActionLogsByAssistant(assistantId: string, limit: number = 100): Promise<SovereignActionLog[]> {
    return db.select().from(sovereignActionLogs)
      .where(eq(sovereignActionLogs.assistantId, assistantId))
      .orderBy(desc(sovereignActionLogs.createdAt))
      .limit(limit);
  }

  async createSovereignActionLog(log: InsertSovereignActionLog): Promise<SovereignActionLog> {
    const [created] = await db.insert(sovereignActionLogs).values(log as any).returning();
    return created;
  }

  // ============ Sovereign Policies Implementation ============
  
  async getSovereignPolicies(): Promise<SovereignPolicy[]> {
    return db.select().from(sovereignPolicies).orderBy(asc(sovereignPolicies.assistantType));
  }

  async getSovereignPoliciesByType(assistantType: string): Promise<SovereignPolicy[]> {
    return db.select().from(sovereignPolicies)
      .where(eq(sovereignPolicies.assistantType, assistantType));
  }

  async getSovereignPolicy(id: string): Promise<SovereignPolicy | undefined> {
    const [policy] = await db.select().from(sovereignPolicies).where(eq(sovereignPolicies.id, id));
    return policy || undefined;
  }

  async createSovereignPolicy(policy: InsertSovereignPolicy): Promise<SovereignPolicy> {
    const [created] = await db.insert(sovereignPolicies).values(policy as any).returning();
    return created;
  }

  async updateSovereignPolicy(id: string, data: Partial<InsertSovereignPolicy>): Promise<SovereignPolicy | undefined> {
    const [updated] = await db.update(sovereignPolicies)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(sovereignPolicies.id, id))
      .returning();
    return updated || undefined;
  }

  async toggleSovereignPolicy(id: string, isActive: boolean): Promise<SovereignPolicy | undefined> {
    const [updated] = await db.update(sovereignPolicies)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(sovereignPolicies.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteSovereignPolicy(id: string): Promise<boolean> {
    const result = await db.delete(sovereignPolicies).where(eq(sovereignPolicies.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ============ AI App Builder Sessions Implementation ============
  
  async getAiBuildSessions(userId?: string): Promise<AiBuildSession[]> {
    if (userId) {
      return db.select().from(aiBuildSessions)
        .where(eq(aiBuildSessions.userId, userId))
        .orderBy(desc(aiBuildSessions.createdAt));
    }
    return db.select().from(aiBuildSessions).orderBy(desc(aiBuildSessions.createdAt));
  }

  async getAiBuildSession(id: string): Promise<AiBuildSession | undefined> {
    const [session] = await db.select().from(aiBuildSessions).where(eq(aiBuildSessions.id, id));
    return session || undefined;
  }

  async createAiBuildSession(session: InsertAiBuildSession): Promise<AiBuildSession> {
    const [created] = await db.insert(aiBuildSessions).values(session as any).returning();
    return created;
  }

  async updateAiBuildSession(id: string, data: Partial<InsertAiBuildSession>): Promise<AiBuildSession | undefined> {
    const [updated] = await db.update(aiBuildSessions)
      .set(data as any)
      .where(eq(aiBuildSessions.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteAiBuildSession(id: string): Promise<boolean> {
    const result = await db.delete(aiBuildSessions).where(eq(aiBuildSessions.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ============ AI Build Tasks Implementation ============
  
  async getAiBuildTasks(sessionId: string): Promise<AiBuildTask[]> {
    return db.select().from(aiBuildTasks)
      .where(eq(aiBuildTasks.sessionId, sessionId))
      .orderBy(asc(aiBuildTasks.stepNumber));
  }

  async getAiBuildTask(id: string): Promise<AiBuildTask | undefined> {
    const [task] = await db.select().from(aiBuildTasks).where(eq(aiBuildTasks.id, id));
    return task || undefined;
  }

  async createAiBuildTask(task: InsertAiBuildTask): Promise<AiBuildTask> {
    const [created] = await db.insert(aiBuildTasks).values(task as any).returning();
    return created;
  }

  async updateAiBuildTask(id: string, data: Partial<InsertAiBuildTask>): Promise<AiBuildTask | undefined> {
    const [updated] = await db.update(aiBuildTasks)
      .set(data)
      .where(eq(aiBuildTasks.id, id))
      .returning();
    return updated || undefined;
  }

  // ============ AI Build Artifacts Implementation ============
  
  async getAiBuildArtifacts(sessionId: string): Promise<AiBuildArtifact[]> {
    return db.select().from(aiBuildArtifacts)
      .where(eq(aiBuildArtifacts.sessionId, sessionId))
      .orderBy(asc(aiBuildArtifacts.fileName));
  }

  async getAiBuildArtifactsByTask(taskId: string): Promise<AiBuildArtifact[]> {
    return db.select().from(aiBuildArtifacts)
      .where(eq(aiBuildArtifacts.taskId, taskId))
      .orderBy(asc(aiBuildArtifacts.fileName));
  }

  async createAiBuildArtifact(artifact: InsertAiBuildArtifact): Promise<AiBuildArtifact> {
    const [created] = await db.insert(aiBuildArtifacts).values(artifact as any).returning();
    return created;
  }

  async updateAiBuildArtifact(id: string, data: Partial<InsertAiBuildArtifact>): Promise<AiBuildArtifact | undefined> {
    const [updated] = await db.update(aiBuildArtifacts)
      .set(data as any)
      .where(eq(aiBuildArtifacts.id, id))
      .returning();
    return updated || undefined;
  }

  // ============ Cloud Development Projects Implementation ============
  
  async getDevProjects(userId?: string): Promise<DevProject[]> {
    if (userId) {
      return db.select().from(devProjects)
        .where(eq((devProjects as any).userId, userId))
        .orderBy(desc(devProjects.updatedAt));
    }
    return db.select().from(devProjects).orderBy(desc(devProjects.updatedAt));
  }

  async getDevProject(id: string): Promise<DevProject | undefined> {
    const [project] = await db.select().from(devProjects).where(eq(devProjects.id, id));
    return project || undefined;
  }

  async createDevProject(project: InsertDevProject): Promise<DevProject> {
    const [created] = await db.insert(devProjects).values(project as any).returning();
    return created;
  }

  async updateDevProject(id: string, data: Partial<InsertDevProject>): Promise<DevProject | undefined> {
    const [updated] = await db.update(devProjects)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(devProjects.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteDevProject(id: string): Promise<boolean> {
    const result = await db.delete(devProjects).where(eq(devProjects.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ============ Project Files Implementation ============
  
  async getProjectFiles(projectId: string): Promise<ProjectFile[]> {
    return db.select().from(projectFiles)
      .where(eq(projectFiles.projectId, projectId))
      .orderBy(asc(projectFiles.filePath));
  }

  async getProjectFile(id: string): Promise<ProjectFile | undefined> {
    const [file] = await db.select().from(projectFiles).where(eq(projectFiles.id, id));
    return file || undefined;
  }

  async getProjectFileByPath(projectId: string, filePath: string): Promise<ProjectFile | undefined> {
    const [file] = await db.select().from(projectFiles)
      .where(and(eq(projectFiles.projectId, projectId), eq(projectFiles.filePath, filePath)));
    return file || undefined;
  }

  async createProjectFile(file: InsertProjectFile): Promise<ProjectFile> {
    const [created] = await db.insert(projectFiles).values(file as any).returning();
    return created;
  }

  async updateProjectFile(id: string, data: Partial<InsertProjectFile>): Promise<ProjectFile | undefined> {
    const [updated] = await db.update(projectFiles)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(projectFiles.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteProjectFile(id: string): Promise<boolean> {
    const result = await db.delete(projectFiles).where(eq(projectFiles.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ============ Runtime Instances Implementation ============
  
  async getRuntimeInstance(projectId: string): Promise<RuntimeInstance | undefined> {
    const [instance] = await db.select().from(runtimeInstances)
      .where(eq(runtimeInstances.projectId, projectId));
    return instance || undefined;
  }

  async createRuntimeInstance(instance: InsertRuntimeInstance): Promise<RuntimeInstance> {
    const [created] = await db.insert(runtimeInstances).values(instance as any).returning();
    return created;
  }

  async updateRuntimeInstance(id: string, data: Partial<InsertRuntimeInstance>): Promise<RuntimeInstance | undefined> {
    const [updated] = await db.update(runtimeInstances)
      .set(data)
      .where(eq(runtimeInstances.id, id))
      .returning();
    return updated || undefined;
  }

  // ============ Console Logs Implementation ============
  
  async getConsoleLogs(projectId: string, limit: number = 100): Promise<ConsoleLog[]> {
    return db.select().from(consoleLogs)
      .where(eq(consoleLogs.projectId, projectId))
      .orderBy(desc(consoleLogs.timestamp))
      .limit(limit);
  }

  async createConsoleLog(log: InsertConsoleLog): Promise<ConsoleLog> {
    const [created] = await db.insert(consoleLogs).values(log as any).returning();
    return created;
  }

  async clearConsoleLogs(projectId: string): Promise<boolean> {
    const result = await db.delete(consoleLogs).where(eq(consoleLogs.projectId, projectId));
    return (result.rowCount ?? 0) >= 0;
  }

  // ============ Dev Database Tables Implementation ============
  
  async getDevDatabaseTables(projectId: string): Promise<DevDatabaseTable[]> {
    return db.select().from(devDatabaseTables)
      .where(eq(devDatabaseTables.projectId, projectId))
      .orderBy(asc(devDatabaseTables.tableName));
  }

  async getDevDatabaseTable(id: string): Promise<DevDatabaseTable | undefined> {
    const [table] = await db.select().from(devDatabaseTables).where(eq(devDatabaseTables.id, id));
    return table || undefined;
  }

  async createDevDatabaseTable(table: InsertDevDatabaseTable): Promise<DevDatabaseTable> {
    const [created] = await db.insert(devDatabaseTables).values(table as any).returning();
    return created;
  }

  async updateDevDatabaseTable(id: string, data: Partial<InsertDevDatabaseTable>): Promise<DevDatabaseTable | undefined> {
    const [updated] = await db.update(devDatabaseTables)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(devDatabaseTables.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteDevDatabaseTable(id: string): Promise<boolean> {
    // Delete columns first
    await db.delete(devDatabaseColumns).where(eq(devDatabaseColumns.tableId, id));
    // Delete relationships involving this table
    const table = await this.getDevDatabaseTable(id);
    if (table) {
      await db.delete(devDatabaseRelationships)
        .where(eq(devDatabaseRelationships.sourceTableId, id));
      await db.delete(devDatabaseRelationships)
        .where(eq(devDatabaseRelationships.targetTableId, id));
    }
    // Delete the table
    const result = await db.delete(devDatabaseTables).where(eq(devDatabaseTables.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ============ Dev Database Columns Implementation ============
  
  async getDevDatabaseColumns(tableId: string): Promise<DevDatabaseColumn[]> {
    return db.select().from(devDatabaseColumns)
      .where(eq(devDatabaseColumns.tableId, tableId))
      .orderBy(asc(devDatabaseColumns.displayOrder));
  }

  async getDevDatabaseColumn(id: string): Promise<DevDatabaseColumn | undefined> {
    const [column] = await db.select().from(devDatabaseColumns).where(eq(devDatabaseColumns.id, id));
    return column || undefined;
  }

  async createDevDatabaseColumn(column: InsertDevDatabaseColumn): Promise<DevDatabaseColumn> {
    const [created] = await db.insert(devDatabaseColumns).values(column as any).returning();
    return created;
  }

  async updateDevDatabaseColumn(id: string, data: Partial<InsertDevDatabaseColumn>): Promise<DevDatabaseColumn | undefined> {
    const [updated] = await db.update(devDatabaseColumns)
      .set(data)
      .where(eq(devDatabaseColumns.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteDevDatabaseColumn(id: string): Promise<boolean> {
    const result = await db.delete(devDatabaseColumns).where(eq(devDatabaseColumns.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ============ Dev Database Relationships Implementation ============
  
  async getDevDatabaseRelationships(projectId: string): Promise<DevDatabaseRelationship[]> {
    return db.select().from(devDatabaseRelationships)
      .where(eq(devDatabaseRelationships.projectId, projectId))
      .orderBy(asc(devDatabaseRelationships.relationshipName));
  }

  async getDevDatabaseRelationship(id: string): Promise<DevDatabaseRelationship | undefined> {
    const [rel] = await db.select().from(devDatabaseRelationships).where(eq(devDatabaseRelationships.id, id));
    return rel || undefined;
  }

  async createDevDatabaseRelationship(rel: InsertDevDatabaseRelationship): Promise<DevDatabaseRelationship> {
    const [created] = await db.insert(devDatabaseRelationships).values(rel as any).returning();
    return created;
  }

  async updateDevDatabaseRelationship(id: string, data: Partial<InsertDevDatabaseRelationship>): Promise<DevDatabaseRelationship | undefined> {
    const [updated] = await db.update(devDatabaseRelationships)
      .set(data)
      .where(eq(devDatabaseRelationships.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteDevDatabaseRelationship(id: string): Promise<boolean> {
    const result = await db.delete(devDatabaseRelationships).where(eq(devDatabaseRelationships.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ============ Sovereign Audit Logs Implementation ============
  
  async getSovereignAuditLogs(limit: number = 100): Promise<SovereignAuditLog[]> {
    return db.select().from(sovereignAuditLogs)
      .orderBy(desc(sovereignAuditLogs.timestamp))
      .limit(limit);
  }

  async createSovereignAuditLog(log: InsertSovereignAuditLog): Promise<SovereignAuditLog> {
    const [created] = await db.insert(sovereignAuditLogs).values(log as any).returning();
    return created;
  }

  // ============ Sovereign Platforms Implementation ============
  
  async getSovereignPlatforms(): Promise<SovereignPlatformRecord[]> {
    return db.select().from(sovereignPlatforms)
      .orderBy(desc(sovereignPlatforms.createdAt));
  }

  async getSovereignPlatform(id: string): Promise<SovereignPlatformRecord | undefined> {
    const [platform] = await db.select().from(sovereignPlatforms)
      .where(eq(sovereignPlatforms.id, id));
    return platform || undefined;
  }

  async getSovereignPlatformsByType(type: string): Promise<SovereignPlatformRecord[]> {
    return db.select().from(sovereignPlatforms)
      .where(eq(sovereignPlatforms.type, type))
      .orderBy(desc(sovereignPlatforms.createdAt));
  }

  async createSovereignPlatform(platform: InsertSovereignPlatform): Promise<SovereignPlatformRecord> {
    const [created] = await db.insert(sovereignPlatforms).values(platform as any).returning();
    return created;
  }

  async updateSovereignPlatform(id: string, data: Partial<InsertSovereignPlatform>): Promise<SovereignPlatformRecord | undefined> {
    const [updated] = await db.update(sovereignPlatforms)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(sovereignPlatforms.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteSovereignPlatform(id: string): Promise<boolean> {
    const result = await db.delete(sovereignPlatforms).where(eq(sovereignPlatforms.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ============ System Settings Implementation ============
  
  async getSystemSettings(): Promise<SystemSettingRecord[]> {
    return db.select().from(systemSettings)
      .orderBy(asc(systemSettings.category), asc(systemSettings.key));
  }

  async getSystemSetting(key: string): Promise<SystemSettingRecord | undefined> {
    const [setting] = await db.select().from(systemSettings)
      .where(eq(systemSettings.key, key));
    return setting || undefined;
  }

  async getSystemSettingsByCategory(category: string): Promise<SystemSettingRecord[]> {
    return db.select().from(systemSettings)
      .where(eq(systemSettings.category, category))
      .orderBy(asc(systemSettings.key));
  }

  async createSystemSetting(setting: InsertSystemSetting): Promise<SystemSettingRecord> {
    const [created] = await db.insert(systemSettings).values(setting as any).returning();
    return created;
  }

  async updateSystemSetting(key: string, value: unknown, modifiedBy: string): Promise<SystemSettingRecord | undefined> {
    const [updated] = await db.update(systemSettings)
      .set({ value, lastModifiedBy: modifiedBy, lastModifiedAt: new Date() })
      .where(eq(systemSettings.key, key))
      .returning();
    return updated || undefined;
  }

  // ============ AI SOVEREIGNTY LAYER - طبقة سيادة الذكاء ============
  
  // AI Layers - طبقات الذكاء
  async getAILayers(): Promise<AILayerRecord[]> {
    return db.select().from(aiLayers).orderBy(desc(aiLayers.priority), desc(aiLayers.createdAt));
  }

  async getAILayer(id: string): Promise<AILayerRecord | undefined> {
    const [layer] = await db.select().from(aiLayers).where(eq(aiLayers.id, id));
    return layer || undefined;
  }

  async getAILayersByType(type: string): Promise<AILayerRecord[]> {
    return db.select().from(aiLayers).where(eq(aiLayers.type, type)).orderBy(desc(aiLayers.priority));
  }

  async getActiveAILayers(): Promise<AILayerRecord[]> {
    return db.select().from(aiLayers).where(eq(aiLayers.status, 'active')).orderBy(desc(aiLayers.priority));
  }

  async createAILayer(layer: InsertAILayer): Promise<AILayerRecord> {
    const [created] = await db.insert(aiLayers).values(layer as any).returning();
    return created;
  }

  async updateAILayer(id: string, data: Partial<InsertAILayer>): Promise<AILayerRecord | undefined> {
    const [updated] = await db.update(aiLayers)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(aiLayers.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteAILayer(id: string): Promise<boolean> {
    const result = await db.delete(aiLayers).where(eq(aiLayers.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // AI Power Configs - تكوين قوة الذكاء
  async getAIPowerConfig(layerId: string): Promise<AIPowerConfigRecord | undefined> {
    const [config] = await db.select().from(aiPowerConfigs).where(eq(aiPowerConfigs.layerId, layerId));
    return config || undefined;
  }

  async getAllAIPowerConfigs(): Promise<AIPowerConfigRecord[]> {
    return db.select().from(aiPowerConfigs);
  }

  async createAIPowerConfig(config: InsertAIPowerConfig): Promise<AIPowerConfigRecord> {
    const [created] = await db.insert(aiPowerConfigs).values(config as any).returning();
    return created;
  }

  async updateAIPowerConfig(layerId: string, data: Partial<InsertAIPowerConfig>): Promise<AIPowerConfigRecord | undefined> {
    const [updated] = await db.update(aiPowerConfigs)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(aiPowerConfigs.layerId, layerId))
      .returning();
    return updated || undefined;
  }

  // External AI Providers - مزودي الذكاء الخارجيين
  async getExternalAIProviders(): Promise<ExternalAIProviderRecord[]> {
    return db.select().from(externalAIProviders).orderBy(desc(externalAIProviders.createdAt));
  }

  async getExternalAIProvider(id: string): Promise<ExternalAIProviderRecord | undefined> {
    const [provider] = await db.select().from(externalAIProviders).where(eq(externalAIProviders.id, id));
    return provider || undefined;
  }

  async getActiveExternalAIProviders(): Promise<ExternalAIProviderRecord[]> {
    return db.select().from(externalAIProviders).where(eq(externalAIProviders.isActive, true));
  }

  async createExternalAIProvider(provider: InsertExternalAIProvider): Promise<ExternalAIProviderRecord> {
    const [created] = await db.insert(externalAIProviders).values(provider as any).returning();
    return created;
  }

  async updateExternalAIProvider(id: string, data: Partial<InsertExternalAIProvider>): Promise<ExternalAIProviderRecord | undefined> {
    const [updated] = await db.update(externalAIProviders)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(externalAIProviders.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteExternalAIProvider(id: string): Promise<boolean> {
    const result = await db.delete(externalAIProviders).where(eq(externalAIProviders.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Subscriber AI Limits - حدود المشتركين للذكاء
  async getSubscriberAILimits(): Promise<SubscriberAILimitRecord[]> {
    return db.select().from(subscriberAILimits).orderBy(asc(subscriberAILimits.role));
  }

  async getSubscriberAILimitByRole(role: string): Promise<SubscriberAILimitRecord | undefined> {
    const [limit] = await db.select().from(subscriberAILimits).where(eq(subscriberAILimits.role, role));
    return limit || undefined;
  }

  async createSubscriberAILimit(limit: InsertSubscriberAILimit): Promise<SubscriberAILimitRecord> {
    const [created] = await db.insert(subscriberAILimits).values(limit as any).returning();
    return created;
  }

  async updateSubscriberAILimit(role: string, data: Partial<InsertSubscriberAILimit>): Promise<SubscriberAILimitRecord | undefined> {
    const [updated] = await db.update(subscriberAILimits)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(subscriberAILimits.role, role))
      .returning();
    return updated || undefined;
  }

  // Sovereign AI Agents - وكلاء الذكاء السيادي
  async getSovereignAIAgents(): Promise<SovereignAIAgentRecord[]> {
    return db.select().from(sovereignAIAgents).orderBy(desc(sovereignAIAgents.createdAt));
  }

  async getSovereignAIAgent(id: string): Promise<SovereignAIAgentRecord | undefined> {
    const [agent] = await db.select().from(sovereignAIAgents).where(eq(sovereignAIAgents.id, id));
    return agent || undefined;
  }

  async getSovereignAIAgentsByLayer(layerId: string): Promise<SovereignAIAgentRecord[]> {
    return db.select().from(sovereignAIAgents).where(eq(sovereignAIAgents.layerId, layerId));
  }

  async createSovereignAIAgent(agent: InsertSovereignAIAgent): Promise<SovereignAIAgentRecord> {
    const [created] = await db.insert(sovereignAIAgents).values(agent as any).returning();
    return created;
  }

  async updateSovereignAIAgent(id: string, data: Partial<InsertSovereignAIAgent>): Promise<SovereignAIAgentRecord | undefined> {
    const [updated] = await db.update(sovereignAIAgents)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(sovereignAIAgents.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteSovereignAIAgent(id: string): Promise<boolean> {
    const result = await db.delete(sovereignAIAgents).where(eq(sovereignAIAgents.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // AI Kill Switch - زر الطوارئ
  async getAIKillSwitchStates(): Promise<AIKillSwitchStateRecord[]> {
    return db.select().from(aiKillSwitchState).orderBy(desc(aiKillSwitchState.updatedAt));
  }

  async getActiveAIKillSwitches(): Promise<AIKillSwitchStateRecord[]> {
    return db.select().from(aiKillSwitchState).where(eq(aiKillSwitchState.isActivated, true));
  }

  async getAIKillSwitchByScope(scope: string): Promise<AIKillSwitchStateRecord | undefined> {
    const [state] = await db.select().from(aiKillSwitchState).where(eq(aiKillSwitchState.scope, scope));
    return state || undefined;
  }

  async createAIKillSwitchState(state: InsertAIKillSwitchState): Promise<AIKillSwitchStateRecord> {
    const [created] = await db.insert(aiKillSwitchState).values(state as any).returning();
    return created;
  }

  async updateAIKillSwitchState(id: string, data: Partial<InsertAIKillSwitchState>): Promise<AIKillSwitchStateRecord | undefined> {
    const [updated] = await db.update(aiKillSwitchState)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(aiKillSwitchState.id, id))
      .returning();
    return updated || undefined;
  }

  async activateKillSwitch(scope: string, activatedBy: string, reason: string, reasonAr: string, targetLayerId?: string): Promise<AIKillSwitchStateRecord> {
    const existing = await this.getAIKillSwitchByScope(scope);
    if (existing) {
      const [updated] = await db.update(aiKillSwitchState)
        .set({
          isActivated: true,
          activatedBy,
          activatedAt: new Date(),
          reason,
          reasonAr,
          targetLayerId: targetLayerId || null,
          updatedAt: new Date(),
        })
        .where(eq(aiKillSwitchState.scope, scope))
        .returning();
      return updated;
    }
    return this.createAIKillSwitchState({
      scope,
      isActivated: true,
      activatedBy,
      activatedAt: new Date(),
      reason,
      reasonAr,
      targetLayerId: targetLayerId || null,
      canSubscriberDeactivate: false,
    });
  }

  async deactivateKillSwitch(scope: string): Promise<AIKillSwitchStateRecord | undefined> {
    const [updated] = await db.update(aiKillSwitchState)
      .set({ isActivated: false, updatedAt: new Date() })
      .where(eq(aiKillSwitchState.scope, scope))
      .returning();
    return updated || undefined;
  }

  // Alias functions for routes compatibility
  async getAILayerById(id: string): Promise<AILayerRecord | undefined> {
    return this.getAILayer(id);
  }

  async getAIPowerConfigs(): Promise<AIPowerConfigRecord[]> {
    return this.getAllAIPowerConfigs();
  }

  async getAIKillSwitchState(): Promise<AIKillSwitchStateRecord[]> {
    return this.getAIKillSwitchStates();
  }

  async activateAIKillSwitch(data: InsertAIKillSwitchState): Promise<AIKillSwitchStateRecord> {
    return this.createAIKillSwitchState(data);
  }

  async deactivateAIKillSwitch(userId: string): Promise<AIKillSwitchStateRecord | undefined> {
    const active = await this.getActiveAIKillSwitches();
    if (active.length > 0) {
      return this.deactivateKillSwitch(active[0].scope);
    }
    return undefined;
  }

  // AI Sovereignty Audit Logs - سجل سيادة الذكاء
  async getAISovereigntyAuditLogs(options: {
    limit?: number;
    offset?: number;
    eventType?: string;
    resourceType?: string;
    isViolation?: boolean;
    isEmergency?: boolean;
  } = {}): Promise<AISovereigntyAuditLogRecord[]> {
    const { limit = 100, offset = 0 } = options;
    return db.select().from(aiSovereigntyAuditLogs)
      .orderBy(desc(aiSovereigntyAuditLogs.timestamp))
      .limit(limit)
      .offset(offset);
  }

  async getAISovereigntyAuditLogsByAction(action: string): Promise<AISovereigntyAuditLogRecord[]> {
    return db.select().from(aiSovereigntyAuditLogs)
      .where(eq(aiSovereigntyAuditLogs.action, action))
      .orderBy(desc(aiSovereigntyAuditLogs.timestamp));
  }

  async createAISovereigntyAuditLog(log: InsertAISovereigntyAuditLog): Promise<AISovereigntyAuditLogRecord> {
    const [created] = await db.insert(aiSovereigntyAuditLogs).values(log as any).returning();
    return created;
  }

  // AI Constitution - دستور الذكاء
  async getAIConstitution(): Promise<AIConstitutionRecord | undefined> {
    const [constitution] = await db.select().from(aiConstitution).where(eq(aiConstitution.isActive, true));
    return constitution || undefined;
  }

  async createAIConstitution(constitution: InsertAIConstitution): Promise<AIConstitutionRecord> {
    const [created] = await db.insert(aiConstitution).values(constitution as any).returning();
    return created;
  }

  async updateAIConstitution(id: string, data: Partial<InsertAIConstitution>): Promise<AIConstitutionRecord | undefined> {
    const [updated] = await db.update(aiConstitution)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(aiConstitution.id, id))
      .returning();
    return updated || undefined;
  }

  // ============ CUSTOM DOMAINS SYSTEM - نظام النطاقات المخصصة ============

  // Custom Domains - النطاقات المخصصة
  async getCustomDomains(): Promise<CustomDomainRecord[]> {
    return db.select().from(customDomains).orderBy(desc(customDomains.createdAt));
  }

  async getCustomDomainsByTenant(tenantId: string): Promise<CustomDomainRecord[]> {
    return db.select().from(customDomains)
      .where(eq(customDomains.tenantId, tenantId))
      .orderBy(desc(customDomains.createdAt));
  }

  async getCustomDomain(id: string): Promise<CustomDomainRecord | undefined> {
    const [domain] = await db.select().from(customDomains).where(eq(customDomains.id, id));
    return domain || undefined;
  }

  async getCustomDomainByHostname(hostname: string): Promise<CustomDomainRecord | undefined> {
    const [domain] = await db.select().from(customDomains).where(eq(customDomains.hostname, hostname));
    return domain || undefined;
  }

  async getCustomDomainsByStatus(status: string): Promise<CustomDomainRecord[]> {
    return db.select().from(customDomains).where(eq(customDomains.status, status));
  }

  async createCustomDomain(domain: InsertCustomDomain): Promise<CustomDomainRecord> {
    const [created] = await db.insert(customDomains).values(domain as any).returning();
    return created;
  }

  async updateCustomDomain(id: string, data: Partial<InsertCustomDomain>): Promise<CustomDomainRecord | undefined> {
    const [updated] = await db.update(customDomains)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(customDomains.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteCustomDomain(id: string): Promise<boolean> {
    const result = await db.delete(customDomains).where(eq(customDomains.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Domain Verifications - سجل التحقق
  async getDomainVerifications(domainId: string): Promise<DomainVerificationRecord[]> {
    return db.select().from(domainVerifications)
      .where(eq(domainVerifications.domainId, domainId))
      .orderBy(desc(domainVerifications.createdAt));
  }

  async getLatestDomainVerification(domainId: string): Promise<DomainVerificationRecord | undefined> {
    const [verification] = await db.select().from(domainVerifications)
      .where(eq(domainVerifications.domainId, domainId))
      .orderBy(desc(domainVerifications.createdAt))
      .limit(1);
    return verification || undefined;
  }

  async createDomainVerification(verification: InsertDomainVerification): Promise<DomainVerificationRecord> {
    const [created] = await db.insert(domainVerifications).values(verification as any).returning();
    return created;
  }

  async updateDomainVerification(id: string, data: Partial<InsertDomainVerification>): Promise<DomainVerificationRecord | undefined> {
    const [updated] = await db.update(domainVerifications)
      .set(data)
      .where(eq(domainVerifications.id, id))
      .returning();
    return updated || undefined;
  }

  // SSL Certificates - شهادات SSL
  async getSSLCertificate(domainId: string): Promise<SSLCertificateRecord | undefined> {
    const [cert] = await db.select().from(sslCertificates).where(eq(sslCertificates.domainId, domainId));
    return cert || undefined;
  }

  async getExpiringSSLCertificates(beforeDate: Date): Promise<SSLCertificateRecord[]> {
    return db.select().from(sslCertificates)
      .where(and(eq(sslCertificates.autoRenew, true), gt(sslCertificates.renewAfter, beforeDate)));
  }

  async createSSLCertificate(cert: InsertSSLCertificate): Promise<SSLCertificateRecord> {
    const [created] = await db.insert(sslCertificates).values(cert as any).returning();
    return created;
  }

  async updateSSLCertificate(domainId: string, data: Partial<InsertSSLCertificate>): Promise<SSLCertificateRecord | undefined> {
    const [updated] = await db.update(sslCertificates)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(sslCertificates.domainId, domainId))
      .returning();
    return updated || undefined;
  }

  // Domain Audit Logs - سجل تدقيق النطاقات
  async getDomainAuditLogs(domainId: string): Promise<DomainAuditLogRecord[]> {
    return db.select().from(domainAuditLogs)
      .where(eq(domainAuditLogs.domainId, domainId))
      .orderBy(desc(domainAuditLogs.timestamp));
  }

  async getTenantDomainAuditLogs(tenantId: string, limit: number = 100): Promise<DomainAuditLogRecord[]> {
    return db.select().from(domainAuditLogs)
      .where(eq(domainAuditLogs.tenantId, tenantId))
      .orderBy(desc(domainAuditLogs.timestamp))
      .limit(limit);
  }

  async createDomainAuditLog(log: InsertDomainAuditLog): Promise<DomainAuditLogRecord> {
    const [created] = await db.insert(domainAuditLogs).values(log as any).returning();
    return created;
  }

  // Tenant Domain Quotas - حصص النطاقات
  async getTenantDomainQuota(tenantId: string): Promise<TenantDomainQuotaRecord | undefined> {
    const [quota] = await db.select().from(tenantDomainQuotas).where(eq(tenantDomainQuotas.tenantId, tenantId));
    return quota || undefined;
  }

  async createTenantDomainQuota(quota: InsertTenantDomainQuota): Promise<TenantDomainQuotaRecord> {
    const [created] = await db.insert(tenantDomainQuotas).values(quota as any).returning();
    return created;
  }

  async updateTenantDomainQuota(tenantId: string, data: Partial<InsertTenantDomainQuota>): Promise<TenantDomainQuotaRecord | undefined> {
    const [updated] = await db.update(tenantDomainQuotas)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(tenantDomainQuotas.tenantId, tenantId))
      .returning();
    return updated || undefined;
  }

  async incrementTenantDomainUsage(tenantId: string): Promise<TenantDomainQuotaRecord | undefined> {
    const quota = await this.getTenantDomainQuota(tenantId);
    if (quota) {
      return this.updateTenantDomainQuota(tenantId, { usedDomains: quota.usedDomains + 1 });
    }
    return undefined;
  }

  async decrementTenantDomainUsage(tenantId: string): Promise<TenantDomainQuotaRecord | undefined> {
    const quota = await this.getTenantDomainQuota(tenantId);
    if (quota && quota.usedDomains > 0) {
      return this.updateTenantDomainQuota(tenantId, { usedDomains: quota.usedDomains - 1 });
    }
    return undefined;
  }

  // ==================== SOVEREIGN API KEYS SYSTEM ====================

  // API Keys
  async getApiKey(id: string): Promise<ApiKey | undefined> {
    const [key] = await db.select().from(apiKeys).where(eq(apiKeys.id, id));
    return key || undefined;
  }

  async getApiKeysByTenant(tenantId: string): Promise<ApiKey[]> {
    return db.select().from(apiKeys)
      .where(eq(apiKeys.tenantId, tenantId))
      .orderBy(desc(apiKeys.createdAt));
  }

  async getApiKeysByUser(userId: string): Promise<ApiKey[]> {
    return db.select().from(apiKeys)
      .where(eq(apiKeys.userId, userId))
      .orderBy(desc(apiKeys.createdAt));
  }

  async getApiKeysByPrefix(prefix: string): Promise<ApiKey[]> {
    return db.select().from(apiKeys)
      .where(eq(apiKeys.prefix, prefix));
  }

  async createApiKey(key: InsertApiKey): Promise<ApiKey> {
    const [created] = await db.insert(apiKeys).values(key as any).returning();
    return created;
  }

  async updateApiKey(id: string, data: Partial<InsertApiKey>): Promise<ApiKey | undefined> {
    const [updated] = await db.update(apiKeys)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(apiKeys.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteApiKey(id: string): Promise<boolean> {
    const result = await db.delete(apiKeys).where(eq(apiKeys.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async countApiKeysByTenant(tenantId: string): Promise<number> {
    const keys = await db.select().from(apiKeys)
      .where(and(eq(apiKeys.tenantId, tenantId), eq(apiKeys.status, 'active')));
    return keys.length;
  }

  // API Key Usage Logs
  async getApiKeyUsageLogs(apiKeyId: string, limit: number = 100): Promise<ApiKeyUsageLog[]> {
    return db.select().from(apiKeyUsageLogs)
      .where(eq(apiKeyUsageLogs.apiKeyId, apiKeyId))
      .orderBy(desc(apiKeyUsageLogs.timestamp))
      .limit(limit);
  }

  async getTenantApiUsageLogs(tenantId: string, limit: number = 100): Promise<ApiKeyUsageLog[]> {
    return db.select().from(apiKeyUsageLogs)
      .where(eq(apiKeyUsageLogs.tenantId, tenantId))
      .orderBy(desc(apiKeyUsageLogs.timestamp))
      .limit(limit);
  }

  async createApiKeyUsageLog(log: InsertApiKeyUsageLog): Promise<ApiKeyUsageLog> {
    const [created] = await db.insert(apiKeyUsageLogs).values(log as any).returning();
    return created;
  }

  // Rate Limit Policies
  async getRateLimitPolicies(): Promise<RateLimitPolicy[]> {
    return db.select().from(rateLimitPolicies).where(eq(rateLimitPolicies.isActive, true));
  }

  async getRateLimitPolicy(tier: string): Promise<RateLimitPolicy | undefined> {
    const [policy] = await db.select().from(rateLimitPolicies).where(eq(rateLimitPolicies.tier, tier));
    return policy || undefined;
  }

  async createRateLimitPolicy(policy: InsertRateLimitPolicy): Promise<RateLimitPolicy> {
    const [created] = await db.insert(rateLimitPolicies).values(policy as any).returning();
    return created;
  }

  async updateRateLimitPolicy(tier: string, data: Partial<InsertRateLimitPolicy>): Promise<RateLimitPolicy | undefined> {
    const [updated] = await db.update(rateLimitPolicies)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(rateLimitPolicies.tier, tier))
      .returning();
    return updated || undefined;
  }

  // Webhook Endpoints
  async getWebhookEndpoint(id: string): Promise<WebhookEndpoint | undefined> {
    const [endpoint] = await db.select().from(webhookEndpoints).where(eq(webhookEndpoints.id, id));
    return endpoint || undefined;
  }

  async getWebhookEndpointsByTenant(tenantId: string): Promise<WebhookEndpoint[]> {
    return db.select().from(webhookEndpoints)
      .where(eq(webhookEndpoints.tenantId, tenantId))
      .orderBy(desc(webhookEndpoints.createdAt));
  }

  async createWebhookEndpoint(endpoint: InsertWebhookEndpoint): Promise<WebhookEndpoint> {
    const [created] = await db.insert(webhookEndpoints).values(endpoint as any).returning();
    return created;
  }

  async updateWebhookEndpoint(id: string, data: Partial<InsertWebhookEndpoint>): Promise<WebhookEndpoint | undefined> {
    const [updated] = await db.update(webhookEndpoints)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(webhookEndpoints.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteWebhookEndpoint(id: string): Promise<boolean> {
    const result = await db.delete(webhookEndpoints).where(eq(webhookEndpoints.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Webhook Deliveries
  async getWebhookDelivery(id: string): Promise<WebhookDelivery | undefined> {
    const [delivery] = await db.select().from(webhookDeliveries).where(eq(webhookDeliveries.id, id));
    return delivery || undefined;
  }

  async getWebhookDeliveriesByEndpoint(endpointId: string, limit: number = 50): Promise<WebhookDelivery[]> {
    return db.select().from(webhookDeliveries)
      .where(eq(webhookDeliveries.endpointId, endpointId))
      .orderBy(desc(webhookDeliveries.createdAt))
      .limit(limit);
  }

  async createWebhookDelivery(delivery: InsertWebhookDelivery): Promise<WebhookDelivery> {
    const [created] = await db.insert(webhookDeliveries).values(delivery as any).returning();
    return created;
  }

  async updateWebhookDelivery(id: string, data: Partial<InsertWebhookDelivery>): Promise<WebhookDelivery | undefined> {
    const [updated] = await db.update(webhookDeliveries)
      .set(data)
      .where(eq(webhookDeliveries.id, id))
      .returning();
    return updated || undefined;
  }

  // API Audit Logs (Immutable - no update/delete)
  async getApiAuditLogs(tenantId: string, limit: number = 100): Promise<ApiAuditLog[]> {
    return db.select().from(apiAuditLogs)
      .where(eq(apiAuditLogs.tenantId, tenantId))
      .orderBy(desc(apiAuditLogs.timestamp))
      .limit(limit);
  }

  async getApiAuditLogsByApiKey(apiKeyId: string, limit: number = 100): Promise<ApiAuditLog[]> {
    return db.select().from(apiAuditLogs)
      .where(eq(apiAuditLogs.apiKeyId, apiKeyId))
      .orderBy(desc(apiAuditLogs.timestamp))
      .limit(limit);
  }

  async createApiAuditLog(log: InsertApiAuditLog): Promise<ApiAuditLog> {
    const [created] = await db.insert(apiAuditLogs).values(log as any).returning();
    return created;
  }

  // API Configuration
  async getApiConfiguration(tenantId: string): Promise<ApiConfiguration | undefined> {
    const [config] = await db.select().from(apiConfiguration).where(eq(apiConfiguration.tenantId, tenantId));
    return config || undefined;
  }

  async createApiConfiguration(config: InsertApiConfiguration): Promise<ApiConfiguration> {
    const [created] = await db.insert(apiConfiguration).values(config as any).returning();
    return created;
  }

  async updateApiConfiguration(tenantId: string, data: Partial<InsertApiConfiguration>): Promise<ApiConfiguration | undefined> {
    const [updated] = await db.update(apiConfiguration)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(apiConfiguration.tenantId, tenantId))
      .returning();
    return updated || undefined;
  }

  async getOrCreateApiConfiguration(tenantId: string): Promise<ApiConfiguration> {
    let config = await this.getApiConfiguration(tenantId);
    if (!config) {
      config = await this.createApiConfiguration({ tenantId });
    }
    return config;
  }

  // ==================== INVOICES ====================
  async getInvoices(userId: string): Promise<Invoice[]> {
    return db.select().from(invoices)
      .where(eq(invoices.userId, userId))
      .orderBy(desc(invoices.date));
  }

  async getInvoice(id: string): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice || undefined;
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [created] = await db.insert(invoices).values(invoice as any).returning();
    return created;
  }

  async updateInvoice(id: string, data: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const [updated] = await db.update(invoices)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(invoices.id, id))
      .returning();
    return updated || undefined;
  }

  async getInvoiceStats(userId: string): Promise<{ totalPaid: number; totalPending: number; thisMonth: number }> {
    const userInvoices = await this.getInvoices(userId);
    const now = new Date();
    const thisMonth = now.toISOString().slice(0, 7);
    
    return {
      totalPaid: userInvoices.filter(i => i.status === "paid").reduce((acc, i) => acc + i.amount, 0),
      totalPending: userInvoices.filter(i => i.status === "pending").reduce((acc, i) => acc + i.amount, 0),
      thisMonth: userInvoices.filter(i => i.date.toISOString().startsWith(thisMonth)).reduce((acc, i) => acc + i.amount, 0),
    };
  }

  // ==================== MARKETING CAMPAIGNS ====================
  async getCampaigns(userId: string): Promise<MarketingCampaign[]> {
    return db.select().from(marketingCampaigns)
      .where(eq(marketingCampaigns.userId, userId))
      .orderBy(desc(marketingCampaigns.createdAt));
  }

  async getCampaign(id: string): Promise<MarketingCampaign | undefined> {
    const [campaign] = await db.select().from(marketingCampaigns).where(eq(marketingCampaigns.id, id));
    return campaign || undefined;
  }

  async createCampaign(campaign: InsertMarketingCampaign): Promise<MarketingCampaign> {
    const [created] = await db.insert(marketingCampaigns).values(campaign as any).returning();
    return created;
  }

  async updateCampaign(id: string, data: Partial<InsertMarketingCampaign>): Promise<MarketingCampaign | undefined> {
    const [updated] = await db.update(marketingCampaigns)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(marketingCampaigns.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteCampaign(id: string): Promise<void> {
    await db.delete(marketingCampaigns).where(eq(marketingCampaigns.id, id));
  }

  async getCampaignStats(userId: string): Promise<{ totalReach: number; activeCampaigns: number; conversions: number }> {
    const userCampaigns = await this.getCampaigns(userId);
    return {
      totalReach: userCampaigns.reduce((acc, c) => acc + c.audience, 0),
      activeCampaigns: userCampaigns.filter(c => c.status === "active").length,
      conversions: userCampaigns.reduce((acc, c) => acc + c.converted, 0),
    };
  }

  // ==================== ANALYTICS EVENTS ====================
  async createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent> {
    const [created] = await db.insert(analyticsEvents).values(event as any).returning();
    return created;
  }

  async getAnalyticsOverview(userId: string): Promise<{
    totalViews: number;
    uniqueVisitors: number;
    avgSessionDuration: string;
    bounceRate: number;
    viewsChange: number;
    visitorsChange: number;
  }> {
    const events = await db.select().from(analyticsEvents)
      .where(eq(analyticsEvents.userId, userId))
      .orderBy(desc(analyticsEvents.createdAt))
      .limit(1000);
    
    const pageViews = events.filter(e => e.eventType === "page_view");
    const uniqueSessions = new Set(events.map(e => e.sessionId).filter(Boolean));
    
    return {
      totalViews: pageViews.length,
      uniqueVisitors: uniqueSessions.size,
      avgSessionDuration: "4:32",
      bounceRate: 34.2,
      viewsChange: 12.5,
      visitorsChange: 8.3,
    };
  }

  async getTopCountries(userId: string): Promise<{ country: string; visitors: number; percentage: number }[]> {
    const events = await db.select().from(analyticsEvents)
      .where(eq(analyticsEvents.userId, userId))
      .limit(1000);
    
    const countryMap = new Map<string, number>();
    events.forEach(e => {
      if (e.country) {
        countryMap.set(e.country, (countryMap.get(e.country) || 0) + 1);
      }
    });
    
    const total = Array.from(countryMap.values()).reduce((a, b) => a + b, 0) || 1;
    return Array.from(countryMap.entries())
      .map(([country, visitors]) => ({
        country,
        visitors,
        percentage: Math.round((visitors / total) * 1000) / 10,
      }))
      .sort((a, b) => b.visitors - a.visitors)
      .slice(0, 5);
  }

  async getProjectAnalytics(projectId: string): Promise<{ views: number; visitors: number; engagement: number }> {
    const events = await db.select().from(analyticsEvents)
      .where(eq(analyticsEvents.projectId, projectId))
      .limit(5000);
    
    const pageViews = events.filter(e => e.eventType === "page_view").length;
    const uniqueSessions = new Set(events.map(e => e.sessionId).filter(Boolean)).size;
    const interactions = events.filter(e => ["click", "signup", "conversion"].includes(e.eventType)).length;
    const engagement = pageViews > 0 ? Math.min(100, Math.round((interactions / pageViews) * 100 + 50)) : 0;
    
    return {
      views: pageViews,
      visitors: uniqueSessions,
      engagement,
    };
  }

  async getUserTotalAiUsage(userId: string): Promise<{ totalGenerations: number; tokensUsed: number }> {
    const usageRecords = await db.select().from(aiUsage)
      .where(eq(aiUsage.userId, userId));
    
    return {
      totalGenerations: usageRecords.reduce((sum, r) => sum + r.requestCount, 0),
      tokensUsed: usageRecords.reduce((sum, r) => sum + r.tokensUsed, 0),
    };
  }

  // ==================== SERVICE PROVIDER INTEGRATIONS HUB ====================
  
  async getServiceProviders(): Promise<ServiceProvider[]> {
    return db.select().from(serviceProviders).orderBy(asc(serviceProviders.category), asc(serviceProviders.name));
  }

  async getServiceProvider(id: string): Promise<ServiceProvider | undefined> {
    const [provider] = await db.select().from(serviceProviders).where(eq(serviceProviders.id, id));
    return provider || undefined;
  }

  async getServiceProviderBySlug(slug: string): Promise<ServiceProvider | undefined> {
    const [provider] = await db.select().from(serviceProviders).where(eq(serviceProviders.slug, slug));
    return provider || undefined;
  }

  async getServiceProvidersByCategory(category: string): Promise<ServiceProvider[]> {
    return db.select().from(serviceProviders)
      .where(eq(serviceProviders.category, category))
      .orderBy(desc(serviceProviders.priority), asc(serviceProviders.name));
  }

  async getActiveServiceProviders(): Promise<ServiceProvider[]> {
    return db.select().from(serviceProviders)
      .where(eq(serviceProviders.status, "active"))
      .orderBy(asc(serviceProviders.category), desc(serviceProviders.priority));
  }

  async createServiceProvider(provider: InsertServiceProvider): Promise<ServiceProvider> {
    const [created] = await db.insert(serviceProviders).values(provider as any).returning();
    return created;
  }

  async updateServiceProvider(id: string, data: Partial<InsertServiceProvider>): Promise<ServiceProvider | undefined> {
    const [updated] = await db.update(serviceProviders)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(serviceProviders.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteServiceProvider(id: string): Promise<boolean> {
    const result = await db.delete(serviceProviders).where(eq(serviceProviders.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Provider API Keys
  async getProviderApiKeys(providerId: string): Promise<ProviderApiKey[]> {
    return db.select().from(providerApiKeys)
      .where(eq(providerApiKeys.providerId, providerId))
      .orderBy(desc(providerApiKeys.isDefault), desc(providerApiKeys.createdAt));
  }

  async getProviderApiKey(id: string): Promise<ProviderApiKey | undefined> {
    const [key] = await db.select().from(providerApiKeys).where(eq(providerApiKeys.id, id));
    return key || undefined;
  }

  async getDefaultProviderApiKey(providerId: string): Promise<ProviderApiKey | undefined> {
    const [key] = await db.select().from(providerApiKeys)
      .where(and(eq(providerApiKeys.providerId, providerId), eq(providerApiKeys.isDefault, true)));
    return key || undefined;
  }

  async createProviderApiKey(key: InsertProviderApiKey): Promise<ProviderApiKey> {
    const [created] = await db.insert(providerApiKeys).values(key as any).returning();
    return created;
  }

  async updateProviderApiKey(id: string, data: Partial<InsertProviderApiKey>): Promise<ProviderApiKey | undefined> {
    const [updated] = await db.update(providerApiKeys)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(providerApiKeys.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteProviderApiKey(id: string): Promise<boolean> {
    const result = await db.delete(providerApiKeys).where(eq(providerApiKeys.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async rotateProviderApiKey(id: string, newEncryptedKey: string, newKeyHash: string): Promise<ProviderApiKey | undefined> {
    const [updated] = await db.update(providerApiKeys)
      .set({ 
        encryptedKey: newEncryptedKey, 
        keyHash: newKeyHash,
        lastRotatedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(providerApiKeys.id, id))
      .returning();
    return updated || undefined;
  }

  // Provider Services
  async getProviderServices(providerId: string): Promise<ProviderService[]> {
    return db.select().from(providerServices)
      .where(eq(providerServices.providerId, providerId))
      .orderBy(asc(providerServices.name));
  }

  async getProviderService(id: string): Promise<ProviderService | undefined> {
    const [service] = await db.select().from(providerServices).where(eq(providerServices.id, id));
    return service || undefined;
  }

  async createProviderService(service: InsertProviderService): Promise<ProviderService> {
    const [created] = await db.insert(providerServices).values(service as any).returning();
    return created;
  }

  async updateProviderService(id: string, data: Partial<InsertProviderService>): Promise<ProviderService | undefined> {
    const [updated] = await db.update(providerServices)
      .set(data)
      .where(eq(providerServices.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteProviderService(id: string): Promise<boolean> {
    const result = await db.delete(providerServices).where(eq(providerServices.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Provider Usage Analytics
  async getProviderUsage(providerId: string, startDate: Date, endDate: Date): Promise<ProviderUsage[]> {
    return db.select().from(providerUsage)
      .where(and(
        eq(providerUsage.providerId, providerId),
        gt(providerUsage.date, startDate)
      ))
      .orderBy(desc(providerUsage.date));
  }

  async createProviderUsage(usage: InsertProviderUsage): Promise<ProviderUsage> {
    const [created] = await db.insert(providerUsage).values(usage as any).returning();
    return created;
  }

  async getProviderUsageSummary(providerId: string): Promise<{ totalRequests: number; totalCost: number; avgResponseTime: number }> {
    const usage = await db.select().from(providerUsage)
      .where(eq(providerUsage.providerId, providerId));
    
    const totalRequests = usage.reduce((sum, u) => sum + u.requestCount, 0);
    const totalCost = usage.reduce((sum, u) => sum + u.totalCost, 0);
    const responseTimes = usage.filter(u => u.avgResponseTime).map(u => u.avgResponseTime!);
    const avgResponseTime = responseTimes.length > 0 
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0;
    
    return { totalRequests, totalCost, avgResponseTime };
  }

  // Provider Alerts
  async getProviderAlerts(providerId?: string): Promise<ProviderAlert[]> {
    if (providerId) {
      return db.select().from(providerAlerts)
        .where(eq(providerAlerts.providerId, providerId))
        .orderBy(desc(providerAlerts.createdAt));
    }
    return db.select().from(providerAlerts).orderBy(desc(providerAlerts.createdAt));
  }

  async getUnacknowledgedAlerts(): Promise<ProviderAlert[]> {
    return db.select().from(providerAlerts)
      .where(eq(providerAlerts.isAcknowledged, false))
      .orderBy(desc(providerAlerts.createdAt));
  }

  async createProviderAlert(alert: InsertProviderAlert): Promise<ProviderAlert> {
    const [created] = await db.insert(providerAlerts).values(alert as any).returning();
    return created;
  }

  async acknowledgeProviderAlert(id: string, acknowledgedBy: string): Promise<ProviderAlert | undefined> {
    const [updated] = await db.update(providerAlerts)
      .set({ isAcknowledged: true, acknowledgedBy, acknowledgedAt: new Date() })
      .where(eq(providerAlerts.id, id))
      .returning();
    return updated || undefined;
  }

  async resolveProviderAlert(id: string): Promise<ProviderAlert | undefined> {
    const [updated] = await db.update(providerAlerts)
      .set({ resolvedAt: new Date() })
      .where(eq(providerAlerts.id, id))
      .returning();
    return updated || undefined;
  }

  // Failover Groups
  async getFailoverGroups(): Promise<FailoverGroup[]> {
    return db.select().from(failoverGroups).orderBy(asc(failoverGroups.category));
  }

  async getFailoverGroup(id: string): Promise<FailoverGroup | undefined> {
    const [group] = await db.select().from(failoverGroups).where(eq(failoverGroups.id, id));
    return group || undefined;
  }

  async getFailoverGroupByCategory(category: string): Promise<FailoverGroup | undefined> {
    const [group] = await db.select().from(failoverGroups).where(eq(failoverGroups.category, category));
    return group || undefined;
  }

  async createFailoverGroup(group: InsertFailoverGroup): Promise<FailoverGroup> {
    const [created] = await db.insert(failoverGroups).values(group as any).returning();
    return created;
  }

  async updateFailoverGroup(id: string, data: Partial<InsertFailoverGroup>): Promise<FailoverGroup | undefined> {
    const [updated] = await db.update(failoverGroups)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(failoverGroups.id, id))
      .returning();
    return updated || undefined;
  }

  async triggerFailover(id: string): Promise<FailoverGroup | undefined> {
    const group = await this.getFailoverGroup(id);
    if (!group || !group.fallbackProviderIds || group.fallbackProviderIds.length === 0) {
      return undefined;
    }
    
    const [updated] = await db.update(failoverGroups)
      .set({ 
        primaryProviderId: group.fallbackProviderIds[0],
        fallbackProviderIds: [...group.fallbackProviderIds.slice(1), group.primaryProviderId].filter(Boolean) as string[],
        lastFailoverAt: new Date(),
        failoverCount: (group.failoverCount || 0) + 1,
        updatedAt: new Date()
      })
      .where(eq(failoverGroups.id, id))
      .returning();
    return updated || undefined;
  }

  // Integration Audit Logs
  async getIntegrationAuditLogs(providerId?: string, limit: number = 100): Promise<IntegrationAuditLog[]> {
    if (providerId) {
      return db.select().from(integrationAuditLogs)
        .where(eq(integrationAuditLogs.providerId, providerId))
        .orderBy(desc(integrationAuditLogs.createdAt))
        .limit(limit);
    }
    return db.select().from(integrationAuditLogs)
      .orderBy(desc(integrationAuditLogs.createdAt))
      .limit(limit);
  }

  async createIntegrationAuditLog(log: InsertIntegrationAuditLog): Promise<IntegrationAuditLog> {
    const [created] = await db.insert(integrationAuditLogs).values(log as any).returning();
    return created;
  }

  // ==================== RESOURCE USAGE & COST TRACKING ====================

  // User Location Tracking
  async getUserLocation(userId: string): Promise<UserLocation | undefined> {
    const [location] = await db.select().from(userLocations)
      .where(eq(userLocations.userId, userId));
    return location || undefined;
  }

  async updateUserLocation(userId: string, location: InsertUserLocation): Promise<UserLocation> {
    const existing = await this.getUserLocation(userId);
    if (existing) {
      const [updated] = await db.update(userLocations)
        .set({ ...location, lastUpdated: new Date() } as any)
        .where(eq(userLocations.userId, userId))
        .returning();
      return updated;
    }
    const [created] = await db.insert(userLocations).values(location as any).returning();
    return created;
  }

  async getUsersByCountry(countryCode: string): Promise<UserLocation[]> {
    return db.select().from(userLocations)
      .where(eq(userLocations.countryCode, countryCode));
  }

  // Resource Usage Tracking
  async trackResourceUsage(usage: InsertResourceUsage): Promise<ResourceUsage> {
    const [created] = await db.insert(resourceUsage).values(usage as any).returning();
    return created;
  }

  async getResourceUsage(userId: string, startDate?: Date, endDate?: Date): Promise<ResourceUsage[]> {
    if (startDate && endDate) {
      return db.select().from(resourceUsage)
        .where(and(
          eq(resourceUsage.userId, userId),
          gt(resourceUsage.timestamp, startDate)
        ))
        .orderBy(desc(resourceUsage.timestamp))
        .limit(1000);
    }
    return db.select().from(resourceUsage)
      .where(eq(resourceUsage.userId, userId))
      .orderBy(desc(resourceUsage.timestamp))
      .limit(100);
  }

  async getResourceUsageSummary(userId: string): Promise<{
    totalRequests: number;
    realCostUSD: number;
    billedCostUSD: number;
    marginUSD: number;
  }> {
    const usage = await db.select().from(resourceUsage)
      .where(eq(resourceUsage.userId, userId));
    
    const totalRequests = usage.length;
    const realCostUSD = usage.reduce((sum, u) => sum + (u.realCostUSD || 0), 0);
    const billedCostUSD = usage.reduce((sum, u) => sum + (u.billedCostUSD || 0), 0);
    const marginUSD = billedCostUSD - realCostUSD;
    
    return { totalRequests, realCostUSD, billedCostUSD, marginUSD };
  }

  // User Usage Limits
  async getUserUsageLimit(userId: string): Promise<UserUsageLimit | undefined> {
    const [limit] = await db.select().from(userUsageLimits)
      .where(eq(userUsageLimits.userId, userId));
    return limit || undefined;
  }

  async createUserUsageLimit(limit: InsertUserUsageLimit): Promise<UserUsageLimit> {
    const [created] = await db.insert(userUsageLimits).values(limit as any).returning();
    return created;
  }

  async updateUserUsageLimit(userId: string, data: Partial<InsertUserUsageLimit>): Promise<UserUsageLimit | undefined> {
    const [updated] = await db.update(userUsageLimits)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(userUsageLimits.userId, userId))
      .returning();
    return updated || undefined;
  }

  async checkAndEnforceLimit(userId: string, newUsageUSD: number): Promise<{ allowed: boolean; action?: string }> {
    const limit = await this.getUserUsageLimit(userId);
    if (!limit || !limit.isActive) {
      return { allowed: true };
    }

    const newTotal = (limit.currentMonthUsageUSD || 0) + newUsageUSD;
    const monthlyLimit = limit.monthlyLimitUSD || 50;
    const notifyAt = limit.notifyAtPercent || 80;
    
    // Check if exceeding limit
    if (newTotal >= monthlyLimit && limit.autoSuspend) {
      // Suspend the user
      await this.suspendUser(userId, 'SYSTEM', 'Monthly usage limit exceeded');
      return { allowed: false, action: 'suspended' };
    }
    
    // Check if nearing limit
    const percentUsed = (newTotal / monthlyLimit) * 100;
    if (percentUsed >= notifyAt) {
      return { allowed: true, action: 'notify_limit_approaching' };
    }
    
    return { allowed: true };
  }

  // Pricing Configuration
  async getPricingConfigs(): Promise<PricingConfig[]> {
    return db.select().from(pricingConfig).orderBy(asc(pricingConfig.resourceType));
  }

  async getPricingConfig(resourceType: string, provider: string): Promise<PricingConfig | undefined> {
    const [config] = await db.select().from(pricingConfig)
      .where(and(
        eq(pricingConfig.resourceType, resourceType),
        eq(pricingConfig.provider, provider)
      ));
    return config || undefined;
  }

  async createPricingConfig(config: InsertPricingConfig): Promise<PricingConfig> {
    const [created] = await db.insert(pricingConfig).values(config as any).returning();
    return created;
  }

  async updatePricingConfig(id: string, data: Partial<InsertPricingConfig>): Promise<PricingConfig | undefined> {
    const [updated] = await db.update(pricingConfig)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(pricingConfig.id, id))
      .returning();
    return updated || undefined;
  }

  // Usage Alerts
  async getUserUsageAlerts(userId: string): Promise<UsageAlert[]> {
    return db.select().from(usageAlerts)
      .where(eq(usageAlerts.userId, userId))
      .orderBy(desc(usageAlerts.createdAt));
  }

  async getUnreadUsageAlerts(userId: string): Promise<UsageAlert[]> {
    return db.select().from(usageAlerts)
      .where(and(
        eq(usageAlerts.userId, userId),
        eq(usageAlerts.isRead, false)
      ))
      .orderBy(desc(usageAlerts.createdAt));
  }

  async createUsageAlert(alert: InsertUsageAlert): Promise<UsageAlert> {
    const [created] = await db.insert(usageAlerts).values(alert as any).returning();
    return created;
  }

  async markUsageAlertRead(id: string): Promise<UsageAlert | undefined> {
    const [updated] = await db.update(usageAlerts)
      .set({ isRead: true })
      .where(eq(usageAlerts.id, id))
      .returning();
    return updated || undefined;
  }

  // Daily Aggregates
  async getDailyUsageAggregates(userId: string, startDate: Date, endDate: Date): Promise<DailyUsageAggregate[]> {
    return db.select().from(dailyUsageAggregates)
      .where(and(
        eq(dailyUsageAggregates.userId, userId),
        gt(dailyUsageAggregates.date, startDate)
      ))
      .orderBy(desc(dailyUsageAggregates.date));
  }

  async updateDailyAggregate(userId: string, date: Date, data: Partial<InsertDailyUsageAggregate>): Promise<DailyUsageAggregate> {
    // Try to find existing record for this day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const existing = await db.select().from(dailyUsageAggregates)
      .where(and(
        eq(dailyUsageAggregates.userId, userId),
        eq(dailyUsageAggregates.date, startOfDay)
      ));
    
    if (existing.length > 0) {
      const [updated] = await db.update(dailyUsageAggregates)
        .set({ ...data, updatedAt: new Date() } as any)
        .where(eq(dailyUsageAggregates.id, existing[0].id))
        .returning();
      return updated;
    }
    
    const [created] = await db.insert(dailyUsageAggregates)
      .values({ userId, date: startOfDay, ...data } as InsertDailyUsageAggregate)
      .returning();
    return created;
  }

  // Monthly Summary
  async getMonthlyUsageSummary(userId: string, year: number, month: number): Promise<MonthlyUsageSummary | undefined> {
    const [summary] = await db.select().from(monthlyUsageSummary)
      .where(and(
        eq(monthlyUsageSummary.userId, userId),
        eq(monthlyUsageSummary.year, year),
        eq(monthlyUsageSummary.month, month)
      ));
    return summary || undefined;
  }

  async getAllMonthlyUsageSummaries(year: number, month: number): Promise<MonthlyUsageSummary[]> {
    return db.select().from(monthlyUsageSummary)
      .where(and(
        eq(monthlyUsageSummary.year, year),
        eq(monthlyUsageSummary.month, month)
      ))
      .orderBy(desc(monthlyUsageSummary.billedCostUSD));
  }

  async updateMonthlyUsageSummary(id: string, data: Partial<InsertMonthlyUsageSummary>): Promise<MonthlyUsageSummary | undefined> {
    const [updated] = await db.update(monthlyUsageSummary)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(monthlyUsageSummary.id, id))
      .returning();
    return updated || undefined;
  }

  // Owner Analytics
  async getOwnerUsageAnalytics(): Promise<{
    todayTotalCost: number;
    todayTotalBilled: number;
    todayMargin: number;
    top5Users: { userId: string; billedCost: number }[];
    losingUsers: { userId: string; realCost: number; billedCost: number; loss: number }[];
    profitByService: { service: string; margin: number }[];
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayUsage = await db.select().from(resourceUsage)
      .where(gt(resourceUsage.timestamp, today));
    
    const todayTotalCost = todayUsage.reduce((sum, u) => sum + (u.realCostUSD || 0), 0);
    const todayTotalBilled = todayUsage.reduce((sum, u) => sum + (u.billedCostUSD || 0), 0);
    const todayMargin = todayTotalBilled - todayTotalCost;
    
    // Aggregate by user
    const userTotals: Record<string, { realCost: number; billedCost: number }> = {};
    for (const u of todayUsage) {
      if (!userTotals[u.userId]) {
        userTotals[u.userId] = { realCost: 0, billedCost: 0 };
      }
      userTotals[u.userId].realCost += u.realCostUSD || 0;
      userTotals[u.userId].billedCost += u.billedCostUSD || 0;
    }
    
    // Top 5 users by billed cost
    const top5Users = Object.entries(userTotals)
      .map(([userId, data]) => ({ userId, billedCost: data.billedCost }))
      .sort((a, b) => b.billedCost - a.billedCost)
      .slice(0, 5);
    
    // Users where cost > billed (losing money)
    const losingUsers = Object.entries(userTotals)
      .filter(([_, data]) => data.realCost > data.billedCost)
      .map(([userId, data]) => ({
        userId,
        realCost: data.realCost,
        billedCost: data.billedCost,
        loss: data.realCost - data.billedCost
      }))
      .sort((a, b) => b.loss - a.loss);
    
    // Profit by service
    const serviceTotals: Record<string, { realCost: number; billedCost: number }> = {};
    for (const u of todayUsage) {
      const service = u.service || 'unknown';
      if (!serviceTotals[service]) {
        serviceTotals[service] = { realCost: 0, billedCost: 0 };
      }
      serviceTotals[service].realCost += u.realCostUSD || 0;
      serviceTotals[service].billedCost += u.billedCostUSD || 0;
    }
    
    const profitByService = Object.entries(serviceTotals)
      .map(([service, data]) => ({
        service,
        margin: data.billedCost - data.realCost
      }))
      .sort((a, b) => b.margin - a.margin);
    
    return {
      todayTotalCost,
      todayTotalBilled,
      todayMargin,
      top5Users,
      losingUsers,
      profitByService
    };
  }
  
  // ============ SOVEREIGN OWNER CONTROL PANEL ============
  
  // Sovereign Owner Profile
  async getSovereignOwnerProfile(userId: string): Promise<SovereignOwnerProfile | undefined> {
    const [profile] = await db.select().from(sovereignOwnerProfile)
      .where(eq(sovereignOwnerProfile.userId, userId));
    return profile || undefined;
  }
  
  async createSovereignOwnerProfile(profile: InsertSovereignOwnerProfile): Promise<SovereignOwnerProfile> {
    const [created] = await db.insert(sovereignOwnerProfile).values(profile as any).returning();
    return created;
  }
  
  async updateSovereignOwnerProfile(userId: string, data: Partial<InsertSovereignOwnerProfile>): Promise<SovereignOwnerProfile | undefined> {
    const [updated] = await db.update(sovereignOwnerProfile)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(sovereignOwnerProfile.userId, userId))
      .returning();
    return updated || undefined;
  }
  
  // Ownership Transfers
  async getOwnershipTransfers(): Promise<OwnershipTransfer[]> {
    return db.select().from(ownershipTransfers).orderBy(desc(ownershipTransfers.createdAt));
  }
  
  async getOwnershipTransfer(id: string): Promise<OwnershipTransfer | undefined> {
    const [transfer] = await db.select().from(ownershipTransfers)
      .where(eq(ownershipTransfers.id, id));
    return transfer || undefined;
  }
  
  async createOwnershipTransfer(transfer: InsertOwnershipTransfer): Promise<OwnershipTransfer> {
    const [created] = await db.insert(ownershipTransfers).values(transfer as any).returning();
    return created;
  }
  
  async updateOwnershipTransfer(id: string, data: Partial<InsertOwnershipTransfer>): Promise<OwnershipTransfer | undefined> {
    const [updated] = await db.update(ownershipTransfers)
      .set(data as any)
      .where(eq(ownershipTransfers.id, id))
      .returning();
    return updated || undefined;
  }
  
  // AI Policies
  async getAIPolicies(): Promise<AIPolicy[]> {
    return db.select().from(aiPolicies).orderBy(desc(aiPolicies.priority));
  }
  
  async getAIPoliciesByScope(scope: string): Promise<AIPolicy[]> {
    return db.select().from(aiPolicies)
      .where(eq(aiPolicies.scope, scope))
      .orderBy(desc(aiPolicies.priority));
  }
  
  async createAIPolicy(policy: InsertAIPolicy): Promise<AIPolicy> {
    const [created] = await db.insert(aiPolicies).values(policy as any).returning();
    return created;
  }
  
  async updateAIPolicy(id: string, data: Partial<InsertAIPolicy>): Promise<AIPolicy | undefined> {
    const [updated] = await db.update(aiPolicies)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(aiPolicies.id, id))
      .returning();
    return updated || undefined;
  }
  
  async deleteAIPolicy(id: string): Promise<boolean> {
    const result = await db.delete(aiPolicies).where(eq(aiPolicies.id, id));
    return true;
  }
  
  // Cost Attributions
  async getCostAttributions(startDate: Date, endDate: Date): Promise<CostAttribution[]> {
    return db.select().from(costAttributions)
      .where(and(
        gte(costAttributions.periodStart, startDate),
        lte(costAttributions.periodEnd, endDate)
      ))
      .orderBy(desc(costAttributions.createdAt));
  }
  
  async getCostAttributionsBySource(sourceType: string, sourceId: string): Promise<CostAttribution[]> {
    return db.select().from(costAttributions)
      .where(and(
        eq(costAttributions.sourceType, sourceType),
        eq(costAttributions.sourceId, sourceId)
      ))
      .orderBy(desc(costAttributions.createdAt));
  }
  
  async createCostAttribution(attribution: InsertCostAttribution): Promise<CostAttribution> {
    const [created] = await db.insert(costAttributions).values(attribution as any).returning();
    return created;
  }
  
  // Margin Guard
  async getMarginGuardConfig(): Promise<MarginGuardConfig | undefined> {
    const [config] = await db.select().from(marginGuardConfigs)
      .where(eq(marginGuardConfigs.isActive, true))
      .limit(1);
    return config || undefined;
  }
  
  async createMarginGuardConfig(config: InsertMarginGuardConfig): Promise<MarginGuardConfig> {
    const [created] = await db.insert(marginGuardConfigs).values(config as any).returning();
    return created;
  }
  
  async updateMarginGuardConfig(id: string, data: Partial<InsertMarginGuardConfig>): Promise<MarginGuardConfig | undefined> {
    const [updated] = await db.update(marginGuardConfigs)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(marginGuardConfigs.id, id))
      .returning();
    return updated || undefined;
  }
  
  // Immutable Audit Trail
  async getImmutableAuditTrail(limit: number = 100): Promise<ImmutableAuditTrail[]> {
    return db.select().from(immutableAuditTrail)
      .orderBy(desc(immutableAuditTrail.createdAt))
      .limit(limit);
  }
  
  async createImmutableAuditEntry(entry: InsertImmutableAuditTrail): Promise<ImmutableAuditTrail> {
    const [created] = await db.insert(immutableAuditTrail).values(entry as any).returning();
    return created;
  }
  
  async getAuditEntryByHash(hash: string): Promise<ImmutableAuditTrail | undefined> {
    const [entry] = await db.select().from(immutableAuditTrail)
      .where(eq(immutableAuditTrail.currentHash, hash));
    return entry || undefined;
  }
  
  // Post-Mortem Reports
  async getPostMortemReports(): Promise<PostMortemReport[]> {
    return db.select().from(postMortemReports).orderBy(desc(postMortemReports.createdAt));
  }
  
  async getPostMortemReport(id: string): Promise<PostMortemReport | undefined> {
    const [report] = await db.select().from(postMortemReports)
      .where(eq(postMortemReports.id, id));
    return report || undefined;
  }
  
  async createPostMortemReport(report: InsertPostMortemReport): Promise<PostMortemReport> {
    const [created] = await db.insert(postMortemReports).values(report as any).returning();
    return created;
  }
  
  async updatePostMortemReport(id: string, data: Partial<InsertPostMortemReport>): Promise<PostMortemReport | undefined> {
    const [updated] = await db.update(postMortemReports)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(postMortemReports.id, id))
      .returning();
    return updated || undefined;
  }
  
  async signPostMortemReport(id: string, signature: string): Promise<PostMortemReport | undefined> {
    const [updated] = await db.update(postMortemReports)
      .set({ 
        ownerSignature: signature, 
        signedAt: new Date(), 
        status: 'SIGNED',
        updatedAt: new Date() 
      })
      .where(eq(postMortemReports.id, id))
      .returning();
    return updated || undefined;
  }
  
  // Security Incidents
  async getSecurityIncidents(): Promise<SecurityIncident[]> {
    return db.select().from(securityIncidents).orderBy(desc(securityIncidents.createdAt));
  }
  
  async getSecurityIncidentsBySeverity(severity: string): Promise<SecurityIncident[]> {
    return db.select().from(securityIncidents)
      .where(eq(securityIncidents.severity, severity))
      .orderBy(desc(securityIncidents.createdAt));
  }
  
  async createSecurityIncident(incident: InsertSecurityIncident): Promise<SecurityIncident> {
    const [created] = await db.insert(securityIncidents).values(incident as any).returning();
    return created;
  }
  
  async updateSecurityIncident(id: string, data: Partial<InsertSecurityIncident>): Promise<SecurityIncident | undefined> {
    const [updated] = await db.update(securityIncidents)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(securityIncidents.id, id))
      .returning();
    return updated || undefined;
  }
  
  async resolveSecurityIncident(id: string, resolution: string, resolvedBy: string): Promise<SecurityIncident | undefined> {
    const [updated] = await db.update(securityIncidents)
      .set({ 
        resolution, 
        resolvedBy, 
        resolvedAt: new Date(), 
        status: 'RESOLVED',
        updatedAt: new Date() 
      })
      .where(eq(securityIncidents.id, id))
      .returning();
    return updated || undefined;
  }
  
  // ==================== SOVEREIGN INFRASTRUCTURE ====================
  
  // Infrastructure Audit Logs (Immutable - No delete/update methods!)
  async getInfrastructureAuditLogs(filters?: {
    userId?: string;
    action?: string;
    targetType?: string;
    targetId?: string;
    providerId?: string;
    success?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<InfrastructureAuditLog[]> {
    let query = db.select().from(infrastructureAuditLogs);
    const conditions: any[] = [];
    
    if (filters?.userId) {
      conditions.push(eq(infrastructureAuditLogs.userId, filters.userId));
    }
    if (filters?.action) {
      conditions.push(eq(infrastructureAuditLogs.action, filters.action));
    }
    if (filters?.targetType) {
      conditions.push(eq(infrastructureAuditLogs.targetType, filters.targetType));
    }
    if (filters?.targetId) {
      conditions.push(eq(infrastructureAuditLogs.targetId, filters.targetId));
    }
    if (filters?.providerId) {
      conditions.push(eq(infrastructureAuditLogs.providerId, filters.providerId));
    }
    if (filters?.success !== undefined) {
      conditions.push(eq(infrastructureAuditLogs.success, filters.success));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return query
      .orderBy(desc(infrastructureAuditLogs.createdAt))
      .limit(filters?.limit || 100)
      .offset(filters?.offset || 0);
  }
  
  async createInfrastructureAuditLog(log: InsertInfrastructureAuditLog): Promise<InfrastructureAuditLog> {
    const [created] = await db.insert(infrastructureAuditLogs).values(log as any).returning();
    return created;
  }
  
  // Provider Error Logs
  async getProviderErrorLogs(providerId?: string, limit: number = 100): Promise<ProviderErrorLog[]> {
    let query = db.select().from(providerErrorLogs);
    
    if (providerId) {
      query = query.where(eq(providerErrorLogs.providerId, providerId)) as any;
    }
    
    return query
      .orderBy(desc(providerErrorLogs.createdAt))
      .limit(limit);
  }
  
  async createProviderErrorLog(log: InsertProviderErrorLog): Promise<ProviderErrorLog> {
    const [created] = await db.insert(providerErrorLogs).values(log as any).returning();
    return created;
  }
  
  async resolveProviderErrorLog(id: string, resolvedBy: string): Promise<ProviderErrorLog | undefined> {
    const [updated] = await db.update(providerErrorLogs)
      .set({ 
        resolved: true, 
        resolvedAt: new Date(), 
        resolvedBy 
      })
      .where(eq(providerErrorLogs.id, id))
      .returning();
    return updated || undefined;
  }
  
  // Infrastructure Providers
  async getInfrastructureProviders(): Promise<InfrastructureProvider[]> {
    return db.select().from(infrastructureProviders).orderBy(desc(infrastructureProviders.createdAt));
  }
  
  async getInfrastructureProvider(id: string): Promise<InfrastructureProvider | undefined> {
    const [provider] = await db.select().from(infrastructureProviders)
      .where(eq(infrastructureProviders.id, id));
    return provider || undefined;
  }
  
  async getInfrastructureProviderByName(name: string): Promise<InfrastructureProvider | undefined> {
    const [provider] = await db.select().from(infrastructureProviders)
      .where(eq(infrastructureProviders.name, name));
    return provider || undefined;
  }
  
  async createInfrastructureProvider(provider: InsertInfrastructureProvider): Promise<InfrastructureProvider> {
    const [created] = await db.insert(infrastructureProviders).values(provider as any).returning();
    return created;
  }
  
  async updateInfrastructureProvider(id: string, data: Partial<InsertInfrastructureProvider>): Promise<InfrastructureProvider | undefined> {
    const [updated] = await db.update(infrastructureProviders)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(infrastructureProviders.id, id))
      .returning();
    return updated || undefined;
  }
  
  async deleteInfrastructureProvider(id: string): Promise<boolean> {
    const result = await db.delete(infrastructureProviders).where(eq(infrastructureProviders.id, id));
    return true;
  }
  
  // Provider Credentials
  async getProviderCredentialByProviderId(providerId: string): Promise<ProviderCredential | undefined> {
    const [credential] = await db.select().from(providerCredentials)
      .where(eq(providerCredentials.providerId, providerId));
    return credential || undefined;
  }
  
  async createProviderCredential(credential: InsertProviderCredential): Promise<ProviderCredential> {
    const [created] = await db.insert(providerCredentials).values(credential as any).returning();
    return created;
  }
  
  async deleteProviderCredential(id: string): Promise<boolean> {
    await db.delete(providerCredentials).where(eq(providerCredentials.id, id));
    return true;
  }
  
  // Infrastructure Servers
  async getInfrastructureServers(): Promise<InfrastructureServer[]> {
    return db.select().from(infrastructureServers).orderBy(desc(infrastructureServers.createdAt));
  }
  
  async getInfrastructureServersByProvider(providerId: string): Promise<InfrastructureServer[]> {
    return db.select().from(infrastructureServers)
      .where(eq(infrastructureServers.providerId, providerId))
      .orderBy(desc(infrastructureServers.createdAt));
  }
  
  async getInfrastructureServer(id: string): Promise<InfrastructureServer | undefined> {
    const [server] = await db.select().from(infrastructureServers)
      .where(eq(infrastructureServers.id, id));
    return server || undefined;
  }
  
  async createInfrastructureServer(server: InsertInfrastructureServer): Promise<InfrastructureServer> {
    const [created] = await db.insert(infrastructureServers).values(server as any).returning();
    return created;
  }
  
  async updateInfrastructureServer(id: string, data: Partial<InsertInfrastructureServer>): Promise<InfrastructureServer | undefined> {
    const [updated] = await db.update(infrastructureServers)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(infrastructureServers.id, id))
      .returning();
    return updated || undefined;
  }
  
  async deleteInfrastructureServer(id: string): Promise<boolean> {
    await db.delete(infrastructureServers).where(eq(infrastructureServers.id, id));
    return true;
  }
  
  // Deployment Templates
  async getDeploymentTemplates(): Promise<DeploymentTemplate[]> {
    return db.select().from(deploymentTemplates).orderBy(desc(deploymentTemplates.createdAt));
  }
  
  async getDeploymentTemplate(id: string): Promise<DeploymentTemplate | undefined> {
    const [template] = await db.select().from(deploymentTemplates)
      .where(eq(deploymentTemplates.id, id));
    return template || undefined;
  }
  
  async createDeploymentTemplate(template: InsertDeploymentTemplate): Promise<DeploymentTemplate> {
    const [created] = await db.insert(deploymentTemplates).values(template as any).returning();
    return created;
  }
  
  async updateDeploymentTemplate(id: string, data: Partial<InsertDeploymentTemplate>): Promise<DeploymentTemplate | undefined> {
    const [updated] = await db.update(deploymentTemplates)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(deploymentTemplates.id, id))
      .returning();
    return updated || undefined;
  }
  
  async deleteDeploymentTemplate(id: string): Promise<boolean> {
    await db.delete(deploymentTemplates).where(eq(deploymentTemplates.id, id));
    return true;
  }
  
  // Deployment Runs
  async getDeploymentRuns(): Promise<DeploymentRun[]> {
    return db.select().from(deploymentRuns).orderBy(desc(deploymentRuns.createdAt));
  }
  
  async getDeploymentRunsByServer(serverId: string): Promise<DeploymentRun[]> {
    return db.select().from(deploymentRuns)
      .where(eq(deploymentRuns.serverId, serverId))
      .orderBy(desc(deploymentRuns.createdAt));
  }
  
  async getDeploymentRunsByProject(projectId: string): Promise<DeploymentRun[]> {
    return db.select().from(deploymentRuns)
      .where(eq(deploymentRuns.projectId, projectId))
      .orderBy(desc(deploymentRuns.createdAt));
  }
  
  async getDeploymentRun(id: string): Promise<DeploymentRun | undefined> {
    const [run] = await db.select().from(deploymentRuns)
      .where(eq(deploymentRuns.id, id));
    return run || undefined;
  }
  
  async createDeploymentRun(run: InsertDeploymentRun): Promise<DeploymentRun> {
    const [created] = await db.insert(deploymentRuns).values(run as any).returning();
    return created;
  }
  
  async updateDeploymentRun(id: string, data: Partial<InsertDeploymentRun>): Promise<DeploymentRun | undefined> {
    const [updated] = await db.update(deploymentRuns)
      .set(data as any)
      .where(eq(deploymentRuns.id, id))
      .returning();
    return updated || undefined;
  }
  
  // Infrastructure Backups
  async getInfrastructureBackups(): Promise<InfrastructureBackup[]> {
    return db.select().from(infrastructureBackups).orderBy(desc(infrastructureBackups.createdAt));
  }
  
  async getInfrastructureBackupsByServer(serverId: string): Promise<InfrastructureBackup[]> {
    return db.select().from(infrastructureBackups)
      .where(eq(infrastructureBackups.serverId, serverId))
      .orderBy(desc(infrastructureBackups.createdAt));
  }
  
  async getInfrastructureBackup(id: string): Promise<InfrastructureBackup | undefined> {
    const [backup] = await db.select().from(infrastructureBackups)
      .where(eq(infrastructureBackups.id, id));
    return backup || undefined;
  }
  
  async createInfrastructureBackup(backup: InsertInfrastructureBackup): Promise<InfrastructureBackup> {
    const [created] = await db.insert(infrastructureBackups).values(backup as any).returning();
    return created;
  }
  
  async updateInfrastructureBackup(id: string, data: Partial<InsertInfrastructureBackup>): Promise<InfrastructureBackup | undefined> {
    const [updated] = await db.update(infrastructureBackups)
      .set(data as any)
      .where(eq(infrastructureBackups.id, id))
      .returning();
    return updated || undefined;
  }
  
  async deleteInfrastructureBackup(id: string): Promise<boolean> {
    await db.delete(infrastructureBackups).where(eq(infrastructureBackups.id, id));
    return true;
  }
  
  // ==================== EXTERNAL INTEGRATION GATEWAY ====================
  
  // External Integration Sessions
  async getExternalIntegrationSessions(): Promise<ExternalIntegrationSession[]> {
    return db.select().from(externalIntegrationSessions).orderBy(desc(externalIntegrationSessions.createdAt));
  }
  
  async getActiveExternalIntegrationSession(partnerName: string): Promise<ExternalIntegrationSession | undefined> {
    const [session] = await db.select().from(externalIntegrationSessions)
      .where(and(
        eq(externalIntegrationSessions.partnerName, partnerName),
        eq(externalIntegrationSessions.status, 'active')
      ));
    return session || undefined;
  }
  
  async getExternalIntegrationSession(id: string): Promise<ExternalIntegrationSession | undefined> {
    const [session] = await db.select().from(externalIntegrationSessions)
      .where(eq(externalIntegrationSessions.id, id));
    return session || undefined;
  }
  
  async createExternalIntegrationSession(session: InsertExternalIntegrationSession): Promise<ExternalIntegrationSession> {
    const [created] = await db.insert(externalIntegrationSessions).values(session as any).returning();
    return created;
  }
  
  async updateExternalIntegrationSession(id: string, data: Partial<InsertExternalIntegrationSession>): Promise<ExternalIntegrationSession | undefined> {
    const [updated] = await db.update(externalIntegrationSessions)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(externalIntegrationSessions.id, id))
      .returning();
    return updated || undefined;
  }
  
  async activateExternalIntegrationSession(id: string, activatedBy: string, reason: string): Promise<ExternalIntegrationSession | undefined> {
    const [updated] = await db.update(externalIntegrationSessions)
      .set({ 
        status: 'active',
        activatedAt: new Date(),
        activatedBy,
        activationReason: reason,
        updatedAt: new Date()
      })
      .where(eq(externalIntegrationSessions.id, id))
      .returning();
    return updated || undefined;
  }
  
  async deactivateExternalIntegrationSession(id: string, deactivatedBy: string, reason: string): Promise<ExternalIntegrationSession | undefined> {
    const [updated] = await db.update(externalIntegrationSessions)
      .set({ 
        status: 'expired',
        deactivatedAt: new Date(),
        deactivatedBy,
        deactivationReason: reason,
        updatedAt: new Date()
      })
      .where(eq(externalIntegrationSessions.id, id))
      .returning();
    return updated || undefined;
  }
  
  // External Integration Logs
  async getExternalIntegrationLogs(sessionId: string): Promise<ExternalIntegrationLog[]> {
    return db.select().from(externalIntegrationLogs)
      .where(eq(externalIntegrationLogs.sessionId, sessionId))
      .orderBy(desc(externalIntegrationLogs.createdAt));
  }
  
  async createExternalIntegrationLog(log: InsertExternalIntegrationLog): Promise<ExternalIntegrationLog> {
    const [created] = await db.insert(externalIntegrationLogs).values(log as any).returning();
    return created;
  }
  
  // Cost Alerts
  async getInfrastructureCostAlerts(): Promise<InfrastructureCostAlert[]> {
    return db.select().from(infrastructureCostAlerts).orderBy(desc(infrastructureCostAlerts.createdAt));
  }
  
  async getActiveInfrastructureCostAlerts(): Promise<InfrastructureCostAlert[]> {
    return db.select().from(infrastructureCostAlerts)
      .where(eq(infrastructureCostAlerts.status, 'active'))
      .orderBy(desc(infrastructureCostAlerts.createdAt));
  }
  
  async createInfrastructureCostAlert(alert: InsertInfrastructureCostAlert): Promise<InfrastructureCostAlert> {
    const [created] = await db.insert(infrastructureCostAlerts).values(alert as any).returning();
    return created;
  }
  
  async updateInfrastructureCostAlert(id: string, data: Partial<InsertInfrastructureCostAlert>): Promise<InfrastructureCostAlert | undefined> {
    const [updated] = await db.update(infrastructureCostAlerts)
      .set(data)
      .where(eq(infrastructureCostAlerts.id, id))
      .returning();
    return updated || undefined;
  }
  
  // Infrastructure Budgets
  async getInfrastructureBudgets(): Promise<InfrastructureBudget[]> {
    return db.select().from(infrastructureBudgets).orderBy(desc(infrastructureBudgets.createdAt));
  }
  
  async getInfrastructureBudget(id: string): Promise<InfrastructureBudget | undefined> {
    const [budget] = await db.select().from(infrastructureBudgets)
      .where(eq(infrastructureBudgets.id, id));
    return budget || undefined;
  }
  
  async createInfrastructureBudget(budget: InsertInfrastructureBudget): Promise<InfrastructureBudget> {
    const [created] = await db.insert(infrastructureBudgets).values(budget as any).returning();
    return created;
  }
  
  async updateInfrastructureBudget(id: string, data: Partial<InsertInfrastructureBudget>): Promise<InfrastructureBudget | undefined> {
    const [updated] = await db.update(infrastructureBudgets)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(infrastructureBudgets.id, id))
      .returning();
    return updated || undefined;
  }
  
  // ==================== SOVEREIGN NOTIFICATION SYSTEM (SRINS) ====================
  
  // Sovereign Notifications
  async getSovereignNotifications(limit: number = 100): Promise<SovereignNotification[]> {
    return db.select().from(sovereignNotifications)
      .orderBy(desc(sovereignNotifications.createdAt))
      .limit(limit);
  }
  
  async getSovereignNotificationsByUser(userId: string): Promise<SovereignNotification[]> {
    return db.select().from(sovereignNotifications)
      .where(eq(sovereignNotifications.targetUserId, userId))
      .orderBy(desc(sovereignNotifications.createdAt));
  }
  
  async getOwnerNotifications(): Promise<SovereignNotification[]> {
    return db.select().from(sovereignNotifications)
      .where(eq(sovereignNotifications.isOwnerOnly, true))
      .orderBy(desc(sovereignNotifications.createdAt));
  }
  
  async getUnreadNotifications(userId: string): Promise<SovereignNotification[]> {
    return db.select().from(sovereignNotifications)
      .where(and(
        eq(sovereignNotifications.targetUserId, userId),
        eq(sovereignNotifications.status, 'sent')
      ))
      .orderBy(desc(sovereignNotifications.createdAt));
  }
  
  async getPendingEscalationNotifications(): Promise<SovereignNotification[]> {
    return db.select().from(sovereignNotifications)
      .where(and(
        eq(sovereignNotifications.requiresAcknowledgment, true),
        eq(sovereignNotifications.status, 'sent')
      ))
      .orderBy(desc(sovereignNotifications.createdAt));
  }
  
  async getSovereignNotification(id: string): Promise<SovereignNotification | undefined> {
    const [notification] = await db.select().from(sovereignNotifications)
      .where(eq(sovereignNotifications.id, id));
    return notification || undefined;
  }
  
  async createSovereignNotification(notification: InsertSovereignNotification): Promise<SovereignNotification> {
    const [created] = await db.insert(sovereignNotifications).values(notification as any).returning();
    return created;
  }
  
  async updateSovereignNotification(id: string, data: Partial<InsertSovereignNotification>): Promise<SovereignNotification | undefined> {
    const [updated] = await db.update(sovereignNotifications)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(sovereignNotifications.id, id))
      .returning();
    return updated || undefined;
  }
  
  async markNotificationAsRead(id: string): Promise<SovereignNotification | undefined> {
    const [updated] = await db.update(sovereignNotifications)
      .set({ 
        status: 'read',
        readAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(sovereignNotifications.id, id))
      .returning();
    return updated || undefined;
  }
  
  async acknowledgeNotification(id: string, acknowledgedBy: string): Promise<SovereignNotification | undefined> {
    const [updated] = await db.update(sovereignNotifications)
      .set({ 
        status: 'acknowledged',
        acknowledgedAt: new Date(),
        acknowledgedBy,
        updatedAt: new Date()
      })
      .where(eq(sovereignNotifications.id, id))
      .returning();
    return updated || undefined;
  }
  
  async escalateNotification(id: string, newLevel: number, newChannel: string): Promise<SovereignNotification | undefined> {
    const notification = await this.getSovereignNotification(id);
    if (!notification) return undefined;
    
    const history = notification.escalationHistory || [];
    history.push({
      level: newLevel,
      channel: newChannel,
      timestamp: new Date().toISOString(),
      reason: 'no_response'
    });
    
    const [updated] = await db.update(sovereignNotifications)
      .set({ 
        escalationLevel: newLevel,
        escalationHistory: history,
        updatedAt: new Date()
      })
      .where(eq(sovereignNotifications.id, id))
      .returning();
    return updated || undefined;
  }
  
  // Notification Templates
  async getNotificationTemplates(): Promise<NotificationTemplate[]> {
    return db.select().from(notificationTemplates).orderBy(desc(notificationTemplates.createdAt));
  }
  
  async getActiveNotificationTemplates(): Promise<NotificationTemplate[]> {
    return db.select().from(notificationTemplates)
      .where(eq(notificationTemplates.isActive, true))
      .orderBy(desc(notificationTemplates.createdAt));
  }
  
  async getNotificationTemplateByTrigger(eventTrigger: string): Promise<NotificationTemplate | undefined> {
    const [template] = await db.select().from(notificationTemplates)
      .where(eq(notificationTemplates.eventTrigger, eventTrigger));
    return template || undefined;
  }
  
  async getNotificationTemplate(id: string): Promise<NotificationTemplate | undefined> {
    const [template] = await db.select().from(notificationTemplates)
      .where(eq(notificationTemplates.id, id));
    return template || undefined;
  }
  
  async createNotificationTemplate(template: InsertNotificationTemplate): Promise<NotificationTemplate> {
    const [created] = await db.insert(notificationTemplates).values(template as any).returning();
    return created;
  }
  
  async updateNotificationTemplate(id: string, data: Partial<InsertNotificationTemplate>): Promise<NotificationTemplate | undefined> {
    const [updated] = await db.update(notificationTemplates)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(notificationTemplates.id, id))
      .returning();
    return updated || undefined;
  }
  
  async deleteNotificationTemplate(id: string): Promise<boolean> {
    await db.delete(notificationTemplates).where(eq(notificationTemplates.id, id));
    return true;
  }
  
  // User Notification Preferences
  async getUserNotificationPreferences(userId: string): Promise<UserNotificationPreferences | undefined> {
    const [prefs] = await db.select().from(userNotificationPreferences)
      .where(eq(userNotificationPreferences.userId, userId));
    return prefs || undefined;
  }
  
  async createUserNotificationPreferences(prefs: InsertUserNotificationPreferences): Promise<UserNotificationPreferences> {
    const [created] = await db.insert(userNotificationPreferences).values(prefs as any).returning();
    return created;
  }
  
  async updateUserNotificationPreferences(userId: string, data: Partial<InsertUserNotificationPreferences>): Promise<UserNotificationPreferences | undefined> {
    const [updated] = await db.update(userNotificationPreferences)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(userNotificationPreferences.userId, userId))
      .returning();
    return updated || undefined;
  }
  
  // Notification Escalations
  async getNotificationEscalations(notificationId: string): Promise<NotificationEscalation[]> {
    return db.select().from(notificationEscalations)
      .where(eq(notificationEscalations.notificationId, notificationId))
      .orderBy(desc(notificationEscalations.createdAt));
  }
  
  async createNotificationEscalation(escalation: InsertNotificationEscalation): Promise<NotificationEscalation> {
    const [created] = await db.insert(notificationEscalations).values(escalation as any).returning();
    return created;
  }
  
  async updateNotificationEscalation(id: string, data: Partial<InsertNotificationEscalation>): Promise<NotificationEscalation | undefined> {
    const [updated] = await db.update(notificationEscalations)
      .set(data)
      .where(eq(notificationEscalations.id, id))
      .returning();
    return updated || undefined;
  }
  
  // Notification Analytics
  async getNotificationAnalytics(periodType: string, limit: number = 30): Promise<NotificationAnalytics[]> {
    return db.select().from(notificationAnalytics)
      .where(eq(notificationAnalytics.periodType, periodType))
      .orderBy(desc(notificationAnalytics.periodStart))
      .limit(limit);
  }
  
  async createNotificationAnalytics(analytics: InsertNotificationAnalytics): Promise<NotificationAnalytics> {
    const [created] = await db.insert(notificationAnalytics).values(analytics as any).returning();
    return created;
  }
  
  async updateNotificationAnalytics(id: string, data: Partial<InsertNotificationAnalytics>): Promise<NotificationAnalytics | undefined> {
    const [updated] = await db.update(notificationAnalytics)
      .set(data)
      .where(eq(notificationAnalytics.id, id))
      .returning();
    return updated || undefined;
  }

  // ==================== AI Smart Suggestions ====================
  
  // Code Analysis Sessions
  async createCodeAnalysisSession(data: InsertCodeAnalysisSession): Promise<CodeAnalysisSession> {
    const [created] = await db.insert(codeAnalysisSessions).values(data as any).returning();
    return created;
  }

  async getCodeAnalysisSession(id: string): Promise<CodeAnalysisSession | undefined> {
    const [session] = await db.select().from(codeAnalysisSessions)
      .where(eq(codeAnalysisSessions.id, id));
    return session || undefined;
  }

  async getCodeAnalysisSessionsByProject(projectId: string): Promise<CodeAnalysisSession[]> {
    return db.select().from(codeAnalysisSessions)
      .where(eq(codeAnalysisSessions.projectId, projectId))
      .orderBy(desc(codeAnalysisSessions.createdAt));
  }

  async getCodeAnalysisSessionsByUser(userId: string): Promise<CodeAnalysisSession[]> {
    return db.select().from(codeAnalysisSessions)
      .where(eq(codeAnalysisSessions.userId, userId))
      .orderBy(desc(codeAnalysisSessions.createdAt));
  }

  async updateCodeAnalysisSession(id: string, data: Partial<InsertCodeAnalysisSession>): Promise<CodeAnalysisSession | undefined> {
    const [updated] = await db.update(codeAnalysisSessions)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(codeAnalysisSessions.id, id))
      .returning();
    return updated || undefined;
  }

  // Smart Suggestions
  async createSmartSuggestion(data: InsertSmartSuggestion): Promise<SmartSuggestion> {
    const [created] = await db.insert(smartSuggestions).values(data as any).returning();
    return created;
  }

  async getSmartSuggestionById(id: string): Promise<SmartSuggestion | undefined> {
    const [suggestion] = await db.select().from(smartSuggestions)
      .where(eq(smartSuggestions.id, id));
    return suggestion || undefined;
  }

  async getSmartSuggestionsBySession(sessionId: string): Promise<SmartSuggestion[]> {
    return db.select().from(smartSuggestions)
      .where(eq(smartSuggestions.sessionId, sessionId))
      .orderBy(desc(smartSuggestions.createdAt));
  }

  async getSmartSuggestionsByProject(projectId: string): Promise<SmartSuggestion[]> {
    return db.select().from(smartSuggestions)
      .where(eq(smartSuggestions.projectId, projectId))
      .orderBy(desc(smartSuggestions.createdAt));
  }

  async getPendingSuggestionsByProject(projectId: string): Promise<SmartSuggestion[]> {
    return db.select().from(smartSuggestions)
      .where(and(
        eq(smartSuggestions.projectId, projectId),
        eq(smartSuggestions.status, "pending")
      ))
      .orderBy(desc(smartSuggestions.createdAt));
  }

  async updateSmartSuggestion(id: string, data: Partial<InsertSmartSuggestion>): Promise<SmartSuggestion | undefined> {
    const [updated] = await db.update(smartSuggestions)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(smartSuggestions.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteSmartSuggestion(id: string): Promise<boolean> {
    await db.delete(smartSuggestions).where(eq(smartSuggestions.id, id));
    return true;
  }

  // Analysis Rules
  async getAnalysisRules(): Promise<AnalysisRule[]> {
    return db.select().from(analysisRules)
      .orderBy(desc(analysisRules.createdAt));
  }

  async getActiveAnalysisRules(): Promise<AnalysisRule[]> {
    return db.select().from(analysisRules)
      .where(eq(analysisRules.isActive, true))
      .orderBy(desc(analysisRules.createdAt));
  }

  async getAnalysisRuleById(id: string): Promise<AnalysisRule | undefined> {
    const [rule] = await db.select().from(analysisRules)
      .where(eq(analysisRules.id, id));
    return rule || undefined;
  }

  async createAnalysisRule(data: InsertAnalysisRule): Promise<AnalysisRule> {
    const [created] = await db.insert(analysisRules).values(data as any).returning();
    return created;
  }

  async updateAnalysisRule(id: string, data: Partial<InsertAnalysisRule>): Promise<AnalysisRule | undefined> {
    const [updated] = await db.update(analysisRules)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(analysisRules.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteAnalysisRule(id: string): Promise<boolean> {
    await db.delete(analysisRules).where(eq(analysisRules.id, id));
    return true;
  }

  // Project Improvement History
  async createProjectImprovementHistory(data: InsertProjectImprovementHistory): Promise<ProjectImprovementHistory> {
    const [created] = await db.insert(projectImprovementHistory).values(data as any).returning();
    return created;
  }

  async getProjectImprovementHistory(projectId: string): Promise<ProjectImprovementHistory[]> {
    return db.select().from(projectImprovementHistory)
      .where(eq(projectImprovementHistory.projectId, projectId))
      .orderBy(desc(projectImprovementHistory.createdAt));
  }

  // ==================== PROJECT INFRASTRUCTURE (Auto-Provisioning) ====================

  // Project Backends
  async getProjectBackend(projectId: string): Promise<ProjectBackend | undefined> {
    const [backend] = await db.select().from(projectBackends)
      .where(eq(projectBackends.projectId, projectId));
    return backend || undefined;
  }

  async createProjectBackend(data: InsertProjectBackend): Promise<ProjectBackend> {
    const [backend] = await db.insert(projectBackends).values(data as any).returning();
    return backend;
  }

  async updateProjectBackend(id: string, data: Partial<InsertProjectBackend>): Promise<ProjectBackend | undefined> {
    const [backend] = await db.update(projectBackends)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(projectBackends.id, id))
      .returning();
    return backend || undefined;
  }

  // Project Databases
  async getProjectDatabase(projectId: string): Promise<ProjectDatabase | undefined> {
    const [database] = await db.select().from(projectDatabases)
      .where(eq(projectDatabases.projectId, projectId));
    return database || undefined;
  }

  async createProjectDatabase(data: InsertProjectDatabase): Promise<ProjectDatabase> {
    const [database] = await db.insert(projectDatabases).values(data as any).returning();
    return database;
  }

  async updateProjectDatabase(id: string, data: Partial<InsertProjectDatabase>): Promise<ProjectDatabase | undefined> {
    const [database] = await db.update(projectDatabases)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(projectDatabases.id, id))
      .returning();
    return database || undefined;
  }

  // Project Auth Configs
  async getProjectAuthConfig(projectId: string): Promise<ProjectAuthConfig | undefined> {
    const [config] = await db.select().from(projectAuthConfigs)
      .where(eq(projectAuthConfigs.projectId, projectId));
    return config || undefined;
  }

  async createProjectAuthConfig(data: InsertProjectAuthConfig): Promise<ProjectAuthConfig> {
    const [config] = await db.insert(projectAuthConfigs).values(data as any).returning();
    return config;
  }

  async updateProjectAuthConfig(id: string, data: Partial<InsertProjectAuthConfig>): Promise<ProjectAuthConfig | undefined> {
    const [config] = await db.update(projectAuthConfigs)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(projectAuthConfigs.id, id))
      .returning();
    return config || undefined;
  }

  // Project Provisioning Jobs
  async getProjectProvisioningJob(id: string): Promise<ProjectProvisioningJob | undefined> {
    const [job] = await db.select().from(projectProvisioningJobs)
      .where(eq(projectProvisioningJobs.id, id));
    return job || undefined;
  }

  async getProjectProvisioningJobs(projectId: string): Promise<ProjectProvisioningJob[]> {
    return db.select().from(projectProvisioningJobs)
      .where(eq(projectProvisioningJobs.projectId, projectId))
      .orderBy(desc(projectProvisioningJobs.createdAt));
  }

  async createProjectProvisioningJob(data: InsertProjectProvisioningJob): Promise<ProjectProvisioningJob> {
    const [job] = await db.insert(projectProvisioningJobs).values(data as any).returning();
    return job;
  }

  async updateProjectProvisioningJob(id: string, data: Partial<InsertProjectProvisioningJob>): Promise<ProjectProvisioningJob | undefined> {
    const [job] = await db.update(projectProvisioningJobs)
      .set(data as any)
      .where(eq(projectProvisioningJobs.id, id))
      .returning();
    return job || undefined;
  }

  async getRecentImprovements(projectId: string, limit: number = 10): Promise<ProjectImprovementHistory[]> {
    return db.select().from(projectImprovementHistory)
      .where(eq(projectImprovementHistory.projectId, projectId))
      .orderBy(desc(projectImprovementHistory.createdAt))
      .limit(limit);
  }

  // ==================== DELETION & RECYCLE BIN SYSTEM ====================

  async getDeletedItems(filters?: {
    entityType?: string;
    status?: string;
    deletedBy?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<DeletedItem[]> {
    let query = db.select().from(deletedItems);
    const conditions: any[] = [];

    if (filters?.entityType) {
      conditions.push(eq(deletedItems.entityType, filters.entityType));
    }
    if (filters?.status) {
      conditions.push(eq(deletedItems.status, filters.status));
    }
    if (filters?.deletedBy) {
      conditions.push(eq(deletedItems.deletedBy, filters.deletedBy));
    }
    if (filters?.startDate) {
      conditions.push(gte(deletedItems.deletedAt, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(deletedItems.deletedAt, filters.endDate));
    }

    if (conditions.length > 0) {
      return db.select().from(deletedItems)
        .where(and(...conditions))
        .orderBy(desc(deletedItems.deletedAt));
    }
    return db.select().from(deletedItems).orderBy(desc(deletedItems.deletedAt));
  }

  async getDeletedItem(id: string): Promise<DeletedItem | undefined> {
    const [item] = await db.select().from(deletedItems)
      .where(eq(deletedItems.id, id));
    return item || undefined;
  }

  async createDeletedItem(item: InsertDeletedItem): Promise<DeletedItem> {
    const [created] = await db.insert(deletedItems).values(item as any).returning();
    return created;
  }

  async updateDeletedItem(id: string, updates: Partial<InsertDeletedItem>): Promise<DeletedItem | undefined> {
    const [updated] = await db.update(deletedItems)
      .set(updates as any)
      .where(eq(deletedItems.id, id))
      .returning();
    return updated || undefined;
  }

  async permanentlyDeleteItem(id: string): Promise<boolean> {
    const result = await db.delete(deletedItems)
      .where(eq(deletedItems.id, id))
      .returning();
    return result.length > 0;
  }

  async getRecycleBinItems(ownerId: string): Promise<RecycleBinItem[]> {
    return db.select().from(recycleBin)
      .where(eq(recycleBin.ownerId, ownerId))
      .orderBy(desc(recycleBin.movedToRecycleAt));
  }

  async addToRecycleBin(item: InsertRecycleBin): Promise<RecycleBinItem> {
    const [created] = await db.insert(recycleBin).values(item as any).returning();
    return created;
  }

  async removeFromRecycleBin(id: string): Promise<boolean> {
    const result = await db.delete(recycleBin)
      .where(eq(recycleBin.id, id))
      .returning();
    return result.length > 0;
  }

  async getRecycleBinItem(id: string): Promise<RecycleBinItem | undefined> {
    const [item] = await db.select().from(recycleBin)
      .where(eq(recycleBin.id, id));
    return item || undefined;
  }

  async updateRecycleBinItem(id: string, updates: Partial<InsertRecycleBin>): Promise<RecycleBinItem | undefined> {
    const [updated] = await db.update(recycleBin)
      .set(updates as any)
      .where(eq(recycleBin.id, id))
      .returning();
    return updated || undefined;
  }

  async getDeletionStats(ownerId?: string): Promise<{
    total: number;
    recoverable: number;
    expired: number;
    byType: Record<string, number>;
  }> {
    let items: DeletedItem[];
    
    if (ownerId) {
      items = await db.select().from(deletedItems)
        .where(eq(deletedItems.deletedBy, ownerId));
    } else {
      items = await db.select().from(deletedItems);
    }

    const stats = {
      total: items.length,
      recoverable: items.filter(i => i.status === 'recoverable').length,
      expired: items.filter(i => i.status === 'expired').length,
      byType: {} as Record<string, number>,
    };

    for (const item of items) {
      const type = item.entityType;
      stats.byType[type] = (stats.byType[type] || 0) + 1;
    }

    return stats;
  }

  async createDeletionAuditLog(log: InsertDeletionAuditLog): Promise<DeletionAuditLog> {
    const [created] = await db.insert(deletionAuditLogs).values(log as any).returning();
    return created;
  }

  async getDeletionAuditLogs(targetId: string): Promise<DeletionAuditLog[]> {
    return db.select().from(deletionAuditLogs)
      .where(eq(deletionAuditLogs.targetId, targetId))
      .orderBy(desc(deletionAuditLogs.createdAt));
  }

  // ==================== COLLABORATION ENGINE ====================

  async getCollaborationContexts(projectId?: string): Promise<CollaborationContext[]> {
    if (projectId) {
      return db.select().from(collaborationContexts)
        .where(eq(collaborationContexts.projectId, projectId))
        .orderBy(desc(collaborationContexts.lastActivityAt));
    }
    return db.select().from(collaborationContexts)
      .orderBy(desc(collaborationContexts.lastActivityAt));
  }

  async getCollaborationContext(id: string): Promise<CollaborationContext | undefined> {
    const [context] = await db.select().from(collaborationContexts)
      .where(eq(collaborationContexts.id, id));
    return context || undefined;
  }

  async createCollaborationContext(ctx: InsertCollaborationContext): Promise<CollaborationContext> {
    const [created] = await db.insert(collaborationContexts).values(ctx as any).returning();
    return created;
  }

  async updateCollaborationContext(id: string, updates: Partial<InsertCollaborationContext>): Promise<CollaborationContext | undefined> {
    const [updated] = await db.update(collaborationContexts)
      .set({ ...updates, lastActivityAt: new Date() } as any)
      .where(eq(collaborationContexts.id, id))
      .returning();
    return updated || undefined;
  }

  async getContextMessages(contextId: string): Promise<CollaborationMessage[]> {
    return db.select().from(collaborationMessages)
      .where(eq(collaborationMessages.contextId, contextId))
      .orderBy(asc(collaborationMessages.createdAt));
  }

  async createCollaborationMessage(msg: InsertCollaborationMessage): Promise<CollaborationMessage> {
    const [created] = await db.insert(collaborationMessages).values(msg as any).returning();
    await db.update(collaborationContexts)
      .set({ 
        messageCount: sql`${collaborationContexts.messageCount} + 1`,
        lastActivityAt: new Date()
      })
      .where(eq(collaborationContexts.id, msg.contextId));
    return created;
  }

  async updateMessageAction(id: string, actionExecuted: boolean, actionResult: any): Promise<CollaborationMessage | undefined> {
    const [updated] = await db.update(collaborationMessages)
      .set({ actionExecuted, actionResult })
      .where(eq(collaborationMessages.id, id))
      .returning();
    return updated || undefined;
  }

  async getCollaborationDecisions(contextId: string): Promise<CollaborationDecision[]> {
    return db.select().from(collaborationDecisions)
      .where(eq(collaborationDecisions.contextId, contextId))
      .orderBy(desc(collaborationDecisions.proposedAt));
  }

  async createCollaborationDecision(dec: InsertCollaborationDecision): Promise<CollaborationDecision> {
    const [created] = await db.insert(collaborationDecisions).values(dec as any).returning();
    return created;
  }

  async updateDecisionStatus(id: string, status: string, executedBy?: string, executionResult?: any): Promise<CollaborationDecision | undefined> {
    const updates: any = { status };
    if (executedBy) {
      updates.executedAt = new Date();
      updates.executedBy = executedBy;
    }
    if (executionResult) {
      updates.executionResult = executionResult;
    }
    const [updated] = await db.update(collaborationDecisions)
      .set(updates)
      .where(eq(collaborationDecisions.id, id))
      .returning();
    return updated || undefined;
  }

  async getAICollaborators(): Promise<AICollaborator[]> {
    return db.select().from(aiCollaborators)
      .orderBy(desc(aiCollaborators.lastActiveAt));
  }

  async getAICollaborator(id: string): Promise<AICollaborator | undefined> {
    const [collaborator] = await db.select().from(aiCollaborators)
      .where(eq(aiCollaborators.id, id));
    return collaborator || undefined;
  }

  async createAICollaborator(ai: InsertAICollaborator): Promise<AICollaborator> {
    const [created] = await db.insert(aiCollaborators).values(ai as any).returning();
    return created;
  }

  async updateAICollaboratorStats(id: string, stats: Partial<InsertAICollaborator>): Promise<AICollaborator | undefined> {
    const [updated] = await db.update(aiCollaborators)
      .set({ ...stats, lastActiveAt: new Date() } as any)
      .where(eq(aiCollaborators.id, id))
      .returning();
    return updated || undefined;
  }

  async getActiveContributors(contextId?: string): Promise<ActiveContributor[]> {
    if (contextId) {
      return db.select().from(activeContributors)
        .where(eq(activeContributors.contextId, contextId))
        .orderBy(desc(activeContributors.lastActiveAt));
    }
    return db.select().from(activeContributors)
      .orderBy(desc(activeContributors.lastActiveAt));
  }

  async upsertActiveContributor(contributor: InsertActiveContributor): Promise<ActiveContributor> {
    const existing = await db.select().from(activeContributors)
      .where(eq(activeContributors.contributorId, contributor.contributorId));
    
    if (existing.length > 0) {
      const [updated] = await db.update(activeContributors)
        .set({ ...contributor, lastActiveAt: new Date() } as any)
        .where(eq(activeContributors.contributorId, contributor.contributorId))
        .returning();
      return updated;
    }
    
    const [created] = await db.insert(activeContributors).values(contributor as any).returning();
    return created;
  }

  async removeActiveContributor(contributorId: string): Promise<boolean> {
    const result = await db.delete(activeContributors)
      .where(eq(activeContributors.contributorId, contributorId))
      .returning();
    return result.length > 0;
  }

  // ==================== PAYMENT SYSTEM IMPLEMENTATIONS ====================

  // Webhook Logs
  async getWebhookLogByEventId(eventId: string): Promise<WebhookLog | null> {
    const [log] = await db.select().from(webhookLogs)
      .where(eq(webhookLogs.eventId, eventId));
    return log || null;
  }

  async createWebhookLog(data: InsertWebhookLog): Promise<WebhookLog> {
    const [created] = await db.insert(webhookLogs).values(data as any).returning();
    return created;
  }

  async updateWebhookLog(id: string, data: Partial<InsertWebhookLog>): Promise<WebhookLog> {
    const [updated] = await db.update(webhookLogs)
      .set(data as any)
      .where(eq(webhookLogs.id, id))
      .returning();
    return updated;
  }

  async getWebhookLogs(limit = 50): Promise<WebhookLog[]> {
    return db.select().from(webhookLogs)
      .orderBy(desc(webhookLogs.createdAt))
      .limit(limit);
  }

  // Payment Retries
  async createPaymentRetry(data: InsertPaymentRetry): Promise<PaymentRetry> {
    const [created] = await db.insert(paymentRetryQueue).values(data as any).returning();
    return created;
  }

  async updatePaymentRetry(id: string, data: Partial<InsertPaymentRetry>): Promise<PaymentRetry> {
    const [updated] = await db.update(paymentRetryQueue)
      .set(data as any)
      .where(eq(paymentRetryQueue.id, id))
      .returning();
    return updated;
  }

  async getPaymentRetriesBySubscription(subscriptionId: string): Promise<PaymentRetry[]> {
    return db.select().from(paymentRetryQueue)
      .where(eq(paymentRetryQueue.subscriptionId, subscriptionId))
      .orderBy(desc(paymentRetryQueue.createdAt));
  }

  async getPendingPaymentRetries(): Promise<PaymentRetry[]> {
    return db.select().from(paymentRetryQueue)
      .where(eq(paymentRetryQueue.status, 'pending'))
      .orderBy(paymentRetryQueue.nextRetryAt);
  }

  // Refunds
  async createRefund(data: InsertRefund): Promise<Refund> {
    const [created] = await db.insert(refunds).values(data as any).returning();
    return created;
  }

  async getRefundsByPayment(paymentId: string): Promise<Refund[]> {
    return db.select().from(refunds)
      .where(eq(refunds.paymentId, paymentId))
      .orderBy(desc(refunds.createdAt));
  }

  async getAllRefunds(limit = 50): Promise<Refund[]> {
    return db.select().from(refunds)
      .orderBy(desc(refunds.createdAt))
      .limit(limit);
  }

  // Billing Profiles
  async createBillingProfile(data: InsertBillingProfile): Promise<BillingProfile> {
    const [created] = await db.insert(billingProfiles).values(data as any).returning();
    return created;
  }

  async getBillingProfilesByUser(userId: string): Promise<BillingProfile[]> {
    return db.select().from(billingProfiles)
      .where(eq(billingProfiles.userId, userId))
      .orderBy(desc(billingProfiles.createdAt));
  }

  async updateBillingProfile(id: string, data: Partial<InsertBillingProfile>): Promise<BillingProfile> {
    const [updated] = await db.update(billingProfiles)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(billingProfiles.id, id))
      .returning();
    return updated;
  }

  // AI Billing Insights
  async createAiBillingInsight(data: InsertAiBillingInsight): Promise<AiBillingInsight> {
    const [created] = await db.insert(aiBillingInsights).values(data as any).returning();
    return created;
  }

  async getAiBillingInsightsByUser(userId: string): Promise<AiBillingInsight[]> {
    return db.select().from(aiBillingInsights)
      .where(eq(aiBillingInsights.userId, userId))
      .orderBy(desc(aiBillingInsights.createdAt));
  }

  async getAiBillingInsights(limit = 20): Promise<AiBillingInsight[]> {
    return db.select().from(aiBillingInsights)
      .orderBy(desc(aiBillingInsights.createdAt))
      .limit(limit);
  }

  async updateAiBillingInsight(id: string, data: Partial<InsertAiBillingInsight>): Promise<AiBillingInsight> {
    const [updated] = await db.update(aiBillingInsights)
      .set(data as any)
      .where(eq(aiBillingInsights.id, id))
      .returning();
    return updated;
  }

  // ==================== SOVEREIGN AUDIT SYSTEM ====================
  
  // Audit Runs
  async getLatestAuditRun(): Promise<AuditRun | undefined> {
    const [run] = await db.select().from(auditRuns)
      .orderBy(desc(auditRuns.createdAt))
      .limit(1);
    return run;
  }

  async getAuditRun(id: string): Promise<AuditRun | undefined> {
    const [run] = await db.select().from(auditRuns)
      .where(eq(auditRuns.id, id));
    return run;
  }

  async getAuditRuns(limit = 20): Promise<AuditRun[]> {
    return db.select().from(auditRuns)
      .orderBy(desc(auditRuns.createdAt))
      .limit(limit);
  }

  async createAuditRun(data: InsertAuditRun): Promise<AuditRun> {
    const [created] = await db.insert(auditRuns).values(data as any).returning();
    return created;
  }

  async updateAuditRun(id: string, data: Partial<InsertAuditRun>): Promise<AuditRun | undefined> {
    const [updated] = await db.update(auditRuns)
      .set(data as any)
      .where(eq(auditRuns.id, id))
      .returning();
    return updated;
  }

  // Audit Targets
  async getAllAuditTargets(): Promise<AuditTarget[]> {
    return db.select().from(auditTargets)
      .where(eq(auditTargets.isActive, true))
      .orderBy(auditTargets.type, auditTargets.name);
  }

  async getAuditTargetByTestId(testId: string): Promise<AuditTarget | undefined> {
    const [target] = await db.select().from(auditTargets)
      .where(eq(auditTargets.testId, testId));
    return target;
  }

  async createAuditTarget(data: InsertAuditTarget): Promise<AuditTarget> {
    const [created] = await db.insert(auditTargets).values(data as any).returning();
    return created;
  }

  async updateAuditTarget(id: string, data: Partial<InsertAuditTarget>): Promise<AuditTarget | undefined> {
    const [updated] = await db.update(auditTargets)
      .set(data as any)
      .where(eq(auditTargets.id, id))
      .returning();
    return updated;
  }

  // Audit Findings
  async getAuditFindingsByRun(runId: string): Promise<AuditFinding[]> {
    return db.select().from(auditFindings)
      .where(eq(auditFindings.runId, runId))
      .orderBy(auditFindings.priority, auditFindings.classification);
  }

  async createAuditFinding(data: InsertAuditFinding): Promise<AuditFinding> {
    const [created] = await db.insert(auditFindings).values(data as any).returning();
    return created;
  }

  async updateAuditFinding(id: string, data: Partial<InsertAuditFinding>): Promise<AuditFinding | undefined> {
    const [updated] = await db.update(auditFindings)
      .set(data as any)
      .where(eq(auditFindings.id, id))
      .returning();
    return updated;
  }

  // ==================== WHITE LABEL / PLATFORM BRANDING ====================
  
  async getOwnerWhiteLabelSettings(): Promise<WhiteLabelSettings | undefined> {
    // Get the owner's white label settings (owner role user)
    const ownerUser = await db.select().from(users).where(eq(users.role, 'owner')).limit(1);
    if (!ownerUser.length) return undefined;

    const [settings] = await db.select()
      .from(whiteLabelSettings)
      .where(eq(whiteLabelSettings.userId, ownerUser[0].id))
      .limit(1);
    
    return settings;
  }

  async saveWhiteLabelSettings(userId: string, settings: InsertWhiteLabelSettings): Promise<WhiteLabelSettings> {
    // Check if settings exist for this user
    const [existing] = await db.select()
      .from(whiteLabelSettings)
      .where(eq(whiteLabelSettings.userId, userId))
      .limit(1);

    if (existing) {
      // Update existing
      const [updated] = await db.update(whiteLabelSettings)
        .set({
          ...settings,
          updatedAt: new Date(),
        } as any)
        .where(eq(whiteLabelSettings.userId, userId))
        .returning();
      return updated;
    } else {
      // Create new
      const [created] = await db.insert(whiteLabelSettings)
        .values({
          ...settings,
          userId,
        } as any)
        .returning();
      return created;
    }
  }

  // ==================== INFERA ENGINE PLATFORM LINKING UNIT ====================
  // وحدة ربط منصات مجموعة انفرا انجن

  // Platform Registry - سجل المنصات
  async getAllInferaPlatforms(): Promise<InferaPlatform[]> {
    return db.select().from(inferaPlatforms).orderBy(desc(inferaPlatforms.createdAt));
  }

  async getInferaPlatform(id: string): Promise<InferaPlatform | undefined> {
    const [platform] = await db.select().from(inferaPlatforms).where(eq(inferaPlatforms.id, id));
    return platform;
  }

  async getInferaPlatformByCode(code: string): Promise<InferaPlatform | undefined> {
    const [platform] = await db.select().from(inferaPlatforms).where(eq(inferaPlatforms.code, code));
    return platform;
  }

  async getInferaPlatformsByType(platformType: string): Promise<InferaPlatform[]> {
    return db.select().from(inferaPlatforms)
      .where(eq(inferaPlatforms.platformType, platformType))
      .orderBy(inferaPlatforms.name);
  }

  async getActivePlatforms(): Promise<InferaPlatform[]> {
    return db.select().from(inferaPlatforms)
      .where(eq(inferaPlatforms.status, 'active'))
      .orderBy(inferaPlatforms.name);
  }

  async createInferaPlatform(data: InsertInferaPlatform): Promise<InferaPlatform> {
    const [created] = await db.insert(inferaPlatforms).values(data as any).returning();
    return created;
  }

  async updateInferaPlatform(id: string, data: Partial<InsertInferaPlatform>): Promise<InferaPlatform | undefined> {
    const [updated] = await db.update(inferaPlatforms)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(inferaPlatforms.id, id))
      .returning();
    return updated;
  }

  async deleteInferaPlatform(id: string): Promise<boolean> {
    const result = await db.delete(inferaPlatforms).where(eq(inferaPlatforms.id, id));
    return true;
  }

  // Platform Links - روابط المنصات
  async getAllPlatformLinks(): Promise<PlatformLink[]> {
    return db.select().from(platformLinks).orderBy(desc(platformLinks.createdAt));
  }

  async getPlatformLink(id: string): Promise<PlatformLink | undefined> {
    const [link] = await db.select().from(platformLinks).where(eq(platformLinks.id, id));
    return link;
  }

  async getPlatformLinksBySource(sourcePlatformId: string): Promise<PlatformLink[]> {
    return db.select().from(platformLinks)
      .where(eq(platformLinks.sourcePlatformId, sourcePlatformId))
      .orderBy(platformLinks.linkType);
  }

  async getPlatformLinksByTarget(targetPlatformId: string): Promise<PlatformLink[]> {
    return db.select().from(platformLinks)
      .where(eq(platformLinks.targetPlatformId, targetPlatformId))
      .orderBy(platformLinks.linkType);
  }

  async getActivePlatformLinks(): Promise<PlatformLink[]> {
    return db.select().from(platformLinks)
      .where(eq(platformLinks.isActive, true))
      .orderBy(platformLinks.linkType);
  }

  async createPlatformLink(data: InsertPlatformLink): Promise<PlatformLink> {
    const [created] = await db.insert(platformLinks).values(data as any).returning();
    return created;
  }

  async updatePlatformLink(id: string, data: Partial<InsertPlatformLink>): Promise<PlatformLink | undefined> {
    const [updated] = await db.update(platformLinks)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(platformLinks.id, id))
      .returning();
    return updated;
  }

  async activatePlatformLink(id: string): Promise<PlatformLink | undefined> {
    const [updated] = await db.update(platformLinks)
      .set({ isActive: true, status: 'active', establishedAt: new Date(), updatedAt: new Date() } as any)
      .where(eq(platformLinks.id, id))
      .returning();
    return updated;
  }

  async deactivatePlatformLink(id: string): Promise<PlatformLink | undefined> {
    const [updated] = await db.update(platformLinks)
      .set({ isActive: false, status: 'suspended', updatedAt: new Date() } as any)
      .where(eq(platformLinks.id, id))
      .returning();
    return updated;
  }

  async deletePlatformLink(id: string): Promise<boolean> {
    await db.delete(platformLinks).where(eq(platformLinks.id, id));
    return true;
  }

  // Platform Services - خدمات المنصات
  async getAllPlatformServices(): Promise<PlatformService[]> {
    return db.select().from(platformServices).orderBy(desc(platformServices.createdAt));
  }

  async getPlatformService(id: string): Promise<PlatformService | undefined> {
    const [service] = await db.select().from(platformServices).where(eq(platformServices.id, id));
    return service;
  }

  async getPlatformServicesByPlatform(platformId: string): Promise<PlatformService[]> {
    return db.select().from(platformServices)
      .where(eq(platformServices.platformId, platformId))
      .orderBy(platformServices.serviceKind);
  }

  async getActiveServices(): Promise<PlatformService[]> {
    return db.select().from(platformServices)
      .where(eq(platformServices.status, 'active'))
      .orderBy(platformServices.serviceKind);
  }

  async createPlatformService(data: InsertPlatformService): Promise<PlatformService> {
    const [created] = await db.insert(platformServices).values(data as any).returning();
    return created;
  }

  async updatePlatformService(id: string, data: Partial<InsertPlatformService>): Promise<PlatformService | undefined> {
    const [updated] = await db.update(platformServices)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(platformServices.id, id))
      .returning();
    return updated;
  }

  async deletePlatformService(id: string): Promise<boolean> {
    await db.delete(platformServices).where(eq(platformServices.id, id));
    return true;
  }

  // Platform Certificates - شهادات المنصات
  async getAllPlatformCertificates(): Promise<PlatformCertificate[]> {
    return db.select().from(platformCertificates).orderBy(desc(platformCertificates.createdAt));
  }

  async getPlatformCertificate(id: string): Promise<PlatformCertificate | undefined> {
    const [cert] = await db.select().from(platformCertificates).where(eq(platformCertificates.id, id));
    return cert;
  }

  async getPlatformCertificateBySerial(serialNumber: string): Promise<PlatformCertificate | undefined> {
    const [cert] = await db.select().from(platformCertificates)
      .where(eq(platformCertificates.serialNumber, serialNumber));
    return cert;
  }

  async getCertificatesByHierarchy(hierarchyRole: string): Promise<PlatformCertificate[]> {
    return db.select().from(platformCertificates)
      .where(eq(platformCertificates.hierarchyRole, hierarchyRole))
      .orderBy(desc(platformCertificates.createdAt));
  }

  async getOwnerCertificates(): Promise<PlatformCertificate[]> {
    return db.select().from(platformCertificates)
      .where(eq(platformCertificates.isOwnerCertificate, true))
      .orderBy(desc(platformCertificates.createdAt));
  }

  async getUserCertificates(userId: string): Promise<PlatformCertificate[]> {
    return db.select().from(platformCertificates)
      .where(and(
        eq(platformCertificates.userId, userId),
        eq(platformCertificates.isRevoked, false)
      ))
      .orderBy(desc(platformCertificates.createdAt));
  }

  async getPlatformCertificatesByPlatform(platformId: string): Promise<PlatformCertificate[]> {
    return db.select().from(platformCertificates)
      .where(eq(platformCertificates.platformId, platformId))
      .orderBy(desc(platformCertificates.createdAt));
  }

  async getValidCertificates(): Promise<PlatformCertificate[]> {
    return db.select().from(platformCertificates)
      .where(and(
        eq(platformCertificates.isRevoked, false),
        gt(platformCertificates.validUntil, new Date())
      ))
      .orderBy(platformCertificates.hierarchyRole);
  }

  async createPlatformCertificate(data: InsertPlatformCertificate): Promise<PlatformCertificate> {
    const [created] = await db.insert(platformCertificates).values(data as any).returning();
    return created;
  }

  async updatePlatformCertificate(id: string, data: Partial<InsertPlatformCertificate>): Promise<PlatformCertificate | undefined> {
    const [updated] = await db.update(platformCertificates)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(platformCertificates.id, id))
      .returning();
    return updated;
  }

  async revokeCertificate(id: string, reason: string): Promise<PlatformCertificate | undefined> {
    const [updated] = await db.update(platformCertificates)
      .set({
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: reason,
        updatedAt: new Date(),
      } as any)
      .where(eq(platformCertificates.id, id))
      .returning();
    return updated;
  }

  async incrementCertificateUsage(id: string): Promise<PlatformCertificate | undefined> {
    const cert = await this.getPlatformCertificate(id);
    if (!cert) return undefined;
    
    const [updated] = await db.update(platformCertificates)
      .set({
        usageCount: (cert.usageCount || 0) + 1,
        lastUsedAt: new Date(),
        updatedAt: new Date(),
      } as any)
      .where(eq(platformCertificates.id, id))
      .returning();
    return updated;
  }

  async deletePlatformCertificate(id: string): Promise<boolean> {
    await db.delete(platformCertificates).where(eq(platformCertificates.id, id));
    return true;
  }

  // ==================== NOVA CONVERSATION ENGINE ====================

  // Nova Sessions
  async createNovaSession(data: InsertNovaSession): Promise<NovaSession> {
    const [created] = await db.insert(novaSessions).values(data as any).returning();
    return created;
  }

  async getNovaSession(id: string): Promise<NovaSession | undefined> {
    const [session] = await db.select().from(novaSessions).where(eq(novaSessions.id, id));
    return session;
  }

  async getUserNovaSessions(userId: string, limit = 20): Promise<NovaSession[]> {
    return db.select().from(novaSessions)
      .where(and(
        eq(novaSessions.userId, userId),
        sql`${novaSessions.status} != 'deleted'`
      ))
      .orderBy(desc(novaSessions.lastMessageAt))
      .limit(limit);
  }

  async updateNovaSession(id: string, data: Partial<InsertNovaSession>): Promise<NovaSession | undefined> {
    const [updated] = await db.update(novaSessions)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(novaSessions.id, id))
      .returning();
    return updated;
  }

  async archiveNovaSession(id: string): Promise<NovaSession | undefined> {
    return this.updateNovaSession(id, { status: 'archived' });
  }

  async deleteNovaSession(id: string): Promise<boolean> {
    await db.delete(novaSessions).where(eq(novaSessions.id, id));
    return true;
  }

  // Nova Messages
  async createNovaMessage(data: InsertNovaMessage): Promise<NovaMessage> {
    const [created] = await db.insert(novaMessages).values(data as any).returning();
    
    // Update session message count and last message time
    await db.update(novaSessions)
      .set({
        messageCount: sql`${novaSessions.messageCount} + 1`,
        lastMessageAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(novaSessions.id, data.sessionId));
    
    return created;
  }

  async getNovaMessage(id: string): Promise<NovaMessage | undefined> {
    const [message] = await db.select().from(novaMessages).where(eq(novaMessages.id, id));
    return message;
  }

  async getSessionMessages(sessionId: string, limit = 100): Promise<NovaMessage[]> {
    return db.select().from(novaMessages)
      .where(eq(novaMessages.sessionId, sessionId))
      .orderBy(novaMessages.createdAt)
      .limit(limit);
  }

  async getRecentSessionMessages(sessionId: string, limit = 50): Promise<NovaMessage[]> {
    // Get most recent messages (ordered by createdAt desc), then reverse for chronological order
    const messages = await db.select().from(novaMessages)
      .where(eq(novaMessages.sessionId, sessionId))
      .orderBy(desc(novaMessages.createdAt))
      .limit(limit);
    return messages.reverse();
  }

  async updateNovaMessage(id: string, data: Partial<InsertNovaMessage>): Promise<NovaMessage | undefined> {
    const [updated] = await db.update(novaMessages)
      .set({ ...data, isEdited: true, updatedAt: new Date() } as any)
      .where(eq(novaMessages.id, id))
      .returning();
    return updated;
  }

  async toggleMessagePin(id: string): Promise<NovaMessage | undefined> {
    const message = await this.getNovaMessage(id);
    if (!message) return undefined;
    
    // Update pin without marking as edited
    const [updated] = await db.update(novaMessages)
      .set({ isPinned: !message.isPinned, updatedAt: new Date() })
      .where(eq(novaMessages.id, id))
      .returning();
    return updated;
  }

  async executeMessageAction(messageId: string, actionId: string, result?: any): Promise<NovaMessage | undefined> {
    const message = await this.getNovaMessage(messageId);
    if (!message || !message.actions) return undefined;
    
    const updatedActions = (message.actions as any[]).map(action => {
      if (action.id === actionId) {
        return { ...action, status: 'executed', executedAt: new Date().toISOString(), result };
      }
      return action;
    });
    
    // Update actions without marking as edited
    const [updated] = await db.update(novaMessages)
      .set({ actions: updatedActions, updatedAt: new Date() })
      .where(eq(novaMessages.id, messageId))
      .returning();
    return updated;
  }

  // Nova Decisions
  async createNovaDecision(data: InsertNovaDecision): Promise<NovaDecision> {
    const [created] = await db.insert(novaDecisions).values(data as any).returning();
    return created;
  }

  async getNovaDecision(id: string): Promise<NovaDecision | undefined> {
    const [decision] = await db.select().from(novaDecisions).where(eq(novaDecisions.id, id));
    return decision;
  }

  async getUserDecisions(userId: string, category?: string): Promise<NovaDecision[]> {
    const conditions = [eq(novaDecisions.userId, userId)];
    if (category) conditions.push(eq(novaDecisions.category, category));
    
    return db.select().from(novaDecisions)
      .where(and(...conditions))
      .orderBy(desc(novaDecisions.createdAt));
  }

  async getActiveDecisions(userId: string): Promise<NovaDecision[]> {
    return db.select().from(novaDecisions)
      .where(and(
        eq(novaDecisions.userId, userId),
        eq(novaDecisions.status, 'active')
      ))
      .orderBy(desc(novaDecisions.createdAt));
  }

  async updateNovaDecision(id: string, data: Partial<InsertNovaDecision>): Promise<NovaDecision | undefined> {
    const [updated] = await db.update(novaDecisions)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(novaDecisions.id, id))
      .returning();
    return updated;
  }

  async applyDecision(id: string): Promise<NovaDecision | undefined> {
    return this.updateNovaDecision(id, { wasApplied: true, appliedAt: new Date() });
  }

  async supersededDecision(id: string, newDecisionId: string): Promise<NovaDecision | undefined> {
    return this.updateNovaDecision(id, { status: 'superseded', supersededBy: newDecisionId });
  }

  // Nova Preferences
  async getNovaPreferences(userId: string): Promise<NovaPreferences | undefined> {
    const [prefs] = await db.select().from(novaPreferences).where(eq(novaPreferences.userId, userId));
    return prefs;
  }

  async upsertNovaPreferences(userId: string, data: Partial<InsertNovaPreferences>): Promise<NovaPreferences> {
    const existing = await this.getNovaPreferences(userId);
    
    if (existing) {
      const [updated] = await db.update(novaPreferences)
        .set({
          ...data,
          interactionCount: (existing.interactionCount || 0) + 1,
          lastInteraction: new Date(),
          updatedAt: new Date(),
        } as any)
        .where(eq(novaPreferences.userId, userId))
        .returning();
      return updated;
    }
    
    const [created] = await db.insert(novaPreferences)
      .values({ ...data, userId, interactionCount: 1, lastInteraction: new Date() } as any)
      .returning();
    return created;
  }

  async updateLearningScore(userId: string, score: number): Promise<NovaPreferences | undefined> {
    const [updated] = await db.update(novaPreferences)
      .set({ learningScore: score, updatedAt: new Date() } as any)
      .where(eq(novaPreferences.userId, userId))
      .returning();
    return updated;
  }

  // Nova Project Contexts
  async getNovaProjectContext(projectId: string): Promise<NovaProjectContext | undefined> {
    const [context] = await db.select().from(novaProjectContexts).where(eq(novaProjectContexts.projectId, projectId));
    return context;
  }

  async upsertNovaProjectContext(projectId: string, userId: string, data: Partial<InsertNovaProjectContext>): Promise<NovaProjectContext> {
    const existing = await this.getNovaProjectContext(projectId);
    
    if (existing) {
      const [updated] = await db.update(novaProjectContexts)
        .set({ ...data, updatedAt: new Date() } as any)
        .where(eq(novaProjectContexts.projectId, projectId))
        .returning();
      return updated;
    }
    
    const [created] = await db.insert(novaProjectContexts)
      .values({ ...data, projectId, userId } as any)
      .returning();
    return created;
  }

  async addConfigChange(projectId: string, change: { timestamp: string; change: string; previousValue: any; newValue: any }): Promise<NovaProjectContext | undefined> {
    const context = await this.getNovaProjectContext(projectId);
    if (!context) return undefined;
    
    const history = (context.configHistory as any[]) || [];
    history.push(change);
    
    const [updated] = await db.update(novaProjectContexts)
      .set({ configHistory: history, updatedAt: new Date() } as any)
      .where(eq(novaProjectContexts.projectId, projectId))
      .returning();
    return updated;
  }

  async addDetectedConflict(projectId: string, conflict: { id: string; type: string; description: string; severity: 'warning' | 'error'; suggestedResolution?: string; resolved: boolean }): Promise<NovaProjectContext | undefined> {
    const context = await this.getNovaProjectContext(projectId);
    if (!context) return undefined;
    
    const conflicts = (context.detectedConflicts as any[]) || [];
    conflicts.push(conflict);
    
    const [updated] = await db.update(novaProjectContexts)
      .set({ detectedConflicts: conflicts, updatedAt: new Date() } as any)
      .where(eq(novaProjectContexts.projectId, projectId))
      .returning();
    return updated;
  }

  async resolveConflict(projectId: string, conflictId: string): Promise<NovaProjectContext | undefined> {
    const context = await this.getNovaProjectContext(projectId);
    if (!context || !context.detectedConflicts) return undefined;
    
    const conflicts = (context.detectedConflicts as any[]).map(c =>
      c.id === conflictId ? { ...c, resolved: true } : c
    );
    
    const [updated] = await db.update(novaProjectContexts)
      .set({ detectedConflicts: conflicts, updatedAt: new Date() } as any)
      .where(eq(novaProjectContexts.projectId, projectId))
      .returning();
    return updated;
  }

  // ==================== KNOWLEDGE GRAPH ====================

  // Knowledge Nodes
  async createKnowledgeNode(data: InsertProjectKnowledgeNode): Promise<ProjectKnowledgeNode> {
    const [created] = await db.insert(projectKnowledgeNodes).values(data as any).returning();
    return created;
  }

  async getKnowledgeNode(id: string): Promise<ProjectKnowledgeNode | undefined> {
    const [node] = await db.select().from(projectKnowledgeNodes).where(eq(projectKnowledgeNodes.id, id));
    return node;
  }

  async getProjectKnowledgeNodes(projectId: string, nodeType?: string): Promise<ProjectKnowledgeNode[]> {
    const conditions = [
      eq(projectKnowledgeNodes.projectId, projectId),
      eq(projectKnowledgeNodes.isActive, true)
    ];
    if (nodeType) conditions.push(eq(projectKnowledgeNodes.nodeType, nodeType));
    
    return db.select().from(projectKnowledgeNodes)
      .where(and(...conditions))
      .orderBy(desc(projectKnowledgeNodes.createdAt));
  }

  async updateKnowledgeNode(id: string, data: Partial<InsertProjectKnowledgeNode>): Promise<ProjectKnowledgeNode | undefined> {
    const [updated] = await db.update(projectKnowledgeNodes)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(projectKnowledgeNodes.id, id))
      .returning();
    return updated;
  }

  async supersedKnowledgeNode(id: string, newNodeId: string): Promise<ProjectKnowledgeNode | undefined> {
    return this.updateKnowledgeNode(id, { isActive: false, supersededBy: newNodeId });
  }

  // Knowledge Edges
  async createKnowledgeEdge(data: InsertProjectKnowledgeEdge): Promise<ProjectKnowledgeEdge> {
    const [created] = await db.insert(projectKnowledgeEdges).values(data as any).returning();
    return created;
  }

  async getProjectKnowledgeEdges(projectId: string): Promise<ProjectKnowledgeEdge[]> {
    return db.select().from(projectKnowledgeEdges)
      .where(and(
        eq(projectKnowledgeEdges.projectId, projectId),
        eq(projectKnowledgeEdges.isActive, true)
      ));
  }

  async getNodeConnections(nodeId: string): Promise<{ incoming: ProjectKnowledgeEdge[]; outgoing: ProjectKnowledgeEdge[] }> {
    const incoming = await db.select().from(projectKnowledgeEdges)
      .where(and(eq(projectKnowledgeEdges.targetNodeId, nodeId), eq(projectKnowledgeEdges.isActive, true)));
    const outgoing = await db.select().from(projectKnowledgeEdges)
      .where(and(eq(projectKnowledgeEdges.sourceNodeId, nodeId), eq(projectKnowledgeEdges.isActive, true)));
    return { incoming, outgoing };
  }

  // Event Log
  async createEventLog(data: InsertProjectEventLog): Promise<ProjectEventLog> {
    const [created] = await db.insert(projectEventLog).values(data as any).returning();
    return created;
  }

  async getProjectEventLog(projectId: string, limit = 50): Promise<ProjectEventLog[]> {
    return db.select().from(projectEventLog)
      .where(eq(projectEventLog.projectId, projectId))
      .orderBy(desc(projectEventLog.createdAt))
      .limit(limit);
  }

  async rollbackEvent(eventId: string, userId: string): Promise<ProjectEventLog | undefined> {
    const [updated] = await db.update(projectEventLog)
      .set({ rolledBackAt: new Date(), rolledBackBy: userId })
      .where(eq(projectEventLog.id, eventId))
      .returning();
    return updated;
  }

  // Architecture Patterns
  async createArchitecturePattern(data: InsertArchitecturePattern): Promise<ArchitecturePattern> {
    const [created] = await db.insert(architecturePatterns).values(data as any).returning();
    return created;
  }

  async getProjectPatterns(projectId: string, antiPatternsOnly = false): Promise<ArchitecturePattern[]> {
    const conditions = [eq(architecturePatterns.projectId, projectId)];
    if (antiPatternsOnly) conditions.push(eq(architecturePatterns.isAntiPattern, true));
    
    return db.select().from(architecturePatterns)
      .where(and(...conditions))
      .orderBy(desc(architecturePatterns.createdAt));
  }

  async updateArchitecturePattern(id: string, data: Partial<InsertArchitecturePattern>): Promise<ArchitecturePattern | undefined> {
    const [updated] = await db.update(architecturePatterns)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(architecturePatterns.id, id))
      .returning();
    return updated;
  }

  async acknowledgePattern(id: string): Promise<ArchitecturePattern | undefined> {
    return this.updateArchitecturePattern(id, { status: 'acknowledged' });
  }

  async resolvePattern(id: string): Promise<ArchitecturePattern | undefined> {
    return this.updateArchitecturePattern(id, { status: 'resolved', resolvedAt: new Date() });
  }

  // ==================== OPERATIONS PLATFORM ====================

  // Deployment Configs
  async createDeploymentConfig(data: InsertDeploymentConfig): Promise<DeploymentConfig> {
    const [created] = await db.insert(deploymentConfigs).values(data as any).returning();
    return created;
  }

  async getDeploymentConfig(id: string): Promise<DeploymentConfig | undefined> {
    const [config] = await db.select().from(deploymentConfigs).where(eq(deploymentConfigs.id, id));
    return config;
  }

  async getProjectDeploymentConfigs(projectId: string): Promise<DeploymentConfig[]> {
    return db.select().from(deploymentConfigs)
      .where(and(eq(deploymentConfigs.projectId, projectId), eq(deploymentConfigs.isActive, true)));
  }

  async updateDeploymentConfig(id: string, data: Partial<InsertDeploymentConfig>): Promise<DeploymentConfig | undefined> {
    const [updated] = await db.update(deploymentConfigs)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(deploymentConfigs.id, id))
      .returning();
    return updated;
  }

  // Deployments
  async createDeployment(data: InsertDeployment): Promise<Deployment> {
    const [created] = await db.insert(deployments).values(data as any).returning();
    return created;
  }

  async getDeployment(id: string): Promise<Deployment | undefined> {
    const [deployment] = await db.select().from(deployments).where(eq(deployments.id, id));
    return deployment;
  }

  async getProjectDeployments(projectId: string, limit = 20): Promise<Deployment[]> {
    return db.select().from(deployments)
      .where(eq(deployments.projectId, projectId))
      .orderBy(desc(deployments.startedAt))
      .limit(limit);
  }

  async updateDeployment(id: string, data: Partial<InsertDeployment>): Promise<Deployment | undefined> {
    const [updated] = await db.update(deployments)
      .set(data as any)
      .where(eq(deployments.id, id))
      .returning();
    return updated;
  }

  // Health Alerts
  async createHealthAlert(data: InsertHealthAlert): Promise<HealthAlert> {
    const [created] = await db.insert(healthAlerts).values(data as any).returning();
    return created;
  }

  async getProjectHealthAlerts(projectId: string, status?: string): Promise<HealthAlert[]> {
    const conditions = [eq(healthAlerts.projectId, projectId)];
    if (status) conditions.push(eq(healthAlerts.status, status));
    
    return db.select().from(healthAlerts)
      .where(and(...conditions))
      .orderBy(desc(healthAlerts.createdAt));
  }

  async updateHealthAlert(id: string, data: Partial<InsertHealthAlert>): Promise<HealthAlert | undefined> {
    const [updated] = await db.update(healthAlerts)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(healthAlerts.id, id))
      .returning();
    return updated;
  }

  async acknowledgeAlert(id: string, userId: string): Promise<HealthAlert | undefined> {
    return this.updateHealthAlert(id, { status: 'acknowledged', acknowledgedAt: new Date(), acknowledgedBy: userId } as any);
  }

  async resolveAlert(id: string): Promise<HealthAlert | undefined> {
    return this.updateHealthAlert(id, { status: 'resolved', resolvedAt: new Date() } as any);
  }

  // Metrics Snapshots
  async createMetricsSnapshot(data: any): Promise<any> {
    const [created] = await db.insert(metricsSnapshots).values(data).returning();
    return created;
  }

  async getProjectMetrics(projectId: string, limit = 100): Promise<any[]> {
    return db.select().from(metricsSnapshots)
      .where(eq(metricsSnapshots.projectId, projectId))
      .orderBy(desc(metricsSnapshots.timestamp))
      .limit(limit);
  }

  async getHealthAlert(id: string): Promise<HealthAlert | undefined> {
    const [alert] = await db.select().from(healthAlerts).where(eq(healthAlerts.id, id));
    return alert;
  }

  // ==================== MULTI-SURFACE GENERATOR ====================

  // Build Configs
  async createBuildConfig(data: InsertBuildConfig): Promise<BuildConfig> {
    const [created] = await db.insert(buildConfigs).values(data as any).returning();
    return created;
  }

  async getBuildConfig(id: string): Promise<BuildConfig | undefined> {
    const [config] = await db.select().from(buildConfigs).where(eq(buildConfigs.id, id));
    return config;
  }

  async getProjectBuildConfigs(projectId: string): Promise<BuildConfig[]> {
    return db.select().from(buildConfigs)
      .where(and(eq(buildConfigs.projectId, projectId), eq(buildConfigs.isActive, true)));
  }

  async updateBuildConfig(id: string, data: Partial<InsertBuildConfig>): Promise<BuildConfig | undefined> {
    const [updated] = await db.update(buildConfigs)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(buildConfigs.id, id))
      .returning();
    return updated;
  }

  // Build Jobs
  async createBuildJob(data: InsertBuildJob): Promise<BuildJob> {
    const [created] = await db.insert(buildJobs).values(data as any).returning();
    return created;
  }

  async getBuildJob(id: string): Promise<BuildJob | undefined> {
    const [job] = await db.select().from(buildJobs).where(eq(buildJobs.id, id));
    return job;
  }

  async getProjectBuildJobs(projectId: string, limit = 20): Promise<BuildJob[]> {
    return db.select().from(buildJobs)
      .where(eq(buildJobs.projectId, projectId))
      .orderBy(desc(buildJobs.queuedAt))
      .limit(limit);
  }

  async updateBuildJob(id: string, data: Partial<InsertBuildJob>): Promise<BuildJob | undefined> {
    const [updated] = await db.update(buildJobs)
      .set(data as any)
      .where(eq(buildJobs.id, id))
      .returning();
    return updated;
  }

  // ==================== UNIFIED BLUEPRINT SYSTEM ====================

  async createUnifiedBlueprint(data: InsertUnifiedBlueprint): Promise<UnifiedBlueprint> {
    const [created] = await db.insert(unifiedBlueprints).values(data as any).returning();
    return created;
  }

  async getUnifiedBlueprint(id: string): Promise<UnifiedBlueprint | undefined> {
    const [blueprint] = await db.select().from(unifiedBlueprints).where(eq(unifiedBlueprints.id, id));
    return blueprint;
  }

  async getProjectBlueprints(projectId: string): Promise<UnifiedBlueprint[]> {
    return db.select().from(unifiedBlueprints)
      .where(eq(unifiedBlueprints.projectId, projectId))
      .orderBy(desc(unifiedBlueprints.updatedAt));
  }

  async updateUnifiedBlueprint(id: string, data: Partial<InsertUnifiedBlueprint>): Promise<UnifiedBlueprint | undefined> {
    const [updated] = await db.update(unifiedBlueprints)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(unifiedBlueprints.id, id))
      .returning();
    return updated;
  }

  // Seed WebNova as the first platform - تهيئة WebNova كأول منصة
  async seedWebNovaPlatform(): Promise<InferaPlatform> {
    const existing = await this.getInferaPlatformByCode('INFERA-WEBNOVA-001');
    if (existing) return existing;

    return this.createInferaPlatform({
      code: 'INFERA-WEBNOVA-001',
      name: 'INFERA WebNova',
      nameAr: 'انفرا ويب نوفا',
      description: 'The Core Operating System for building sovereign digital platforms',
      descriptionAr: 'نظام التشغيل الأساسي لبناء المنصات الرقمية السيادية',
      platformType: 'builder',
      sovereigntyTier: 'root',
      category: 'sovereign',
      version: '1.0.0',
      capabilities: {
        canBuildPlatforms: true,
        canManageDomains: true,
        canDeployServices: true,
        canProcessPayments: true,
        canManageUsers: true,
        canAccessAI: true,
        customCapabilities: ['platform_generation', 'ai_orchestration', 'multi_cloud_deployment'],
      },
      status: 'active',
      isPublished: true,
      isSystemPlatform: true,
    });
  }

  // ==================== DEPARTMENTS MANAGEMENT (إدارة الأقسام) ====================

  async getDepartments(): Promise<Department[]> {
    return db.select().from(departments).orderBy(departments.name);
  }

  async getDepartment(id: string): Promise<Department | undefined> {
    const [dept] = await db.select().from(departments).where(eq(departments.id, id));
    return dept;
  }

  async createDepartment(data: InsertDepartment): Promise<Department> {
    const [created] = await db.insert(departments).values(data as any).returning();
    return created;
  }

  async updateDepartment(id: string, data: Partial<InsertDepartment>): Promise<Department | undefined> {
    const [updated] = await db.update(departments)
      .set(data as any)
      .where(eq(departments.id, id))
      .returning();
    return updated;
  }

  async deleteDepartment(id: string): Promise<void> {
    await db.delete(departments).where(eq(departments.id, id));
  }

  // Department Members
  async getDepartmentMembers(departmentId: string): Promise<DepartmentMember[]> {
    return db.select().from(departmentMembers)
      .where(eq(departmentMembers.departmentId, departmentId));
  }

  async getDepartmentMember(id: string): Promise<DepartmentMember | undefined> {
    const [member] = await db.select().from(departmentMembers).where(eq(departmentMembers.id, id));
    return member;
  }

  async addDepartmentMember(data: InsertDepartmentMember): Promise<DepartmentMember> {
    const [created] = await db.insert(departmentMembers).values(data as any).returning();
    return created;
  }

  async removeDepartmentMember(id: string): Promise<void> {
    await db.delete(departmentMembers).where(eq(departmentMembers.id, id));
  }

  async getUserDepartments(userId: string): Promise<DepartmentMember[]> {
    return db.select().from(departmentMembers)
      .where(and(eq(departmentMembers.userId, userId), eq(departmentMembers.isActive, true)));
  }

  // ==================== EMPLOYEE TASKS (مهام الموظفين) ====================

  async getAllTasks(): Promise<EmployeeTask[]> {
    return db.select().from(employeeTasks).orderBy(desc(employeeTasks.createdAt));
  }

  async getTask(id: string): Promise<EmployeeTask | undefined> {
    const [task] = await db.select().from(employeeTasks).where(eq(employeeTasks.id, id));
    return task;
  }

  async createTask(data: InsertEmployeeTask): Promise<EmployeeTask> {
    const [created] = await db.insert(employeeTasks).values(data as any).returning();
    return created;
  }

  async updateTask(id: string, data: Partial<InsertEmployeeTask>): Promise<EmployeeTask | undefined> {
    const [updated] = await db.update(employeeTasks)
      .set(data as any)
      .where(eq(employeeTasks.id, id))
      .returning();
    return updated;
  }

  async deleteTask(id: string): Promise<void> {
    await db.delete(employeeTasks).where(eq(employeeTasks.id, id));
  }

  async getTasksByEmployee(userId: string): Promise<EmployeeTask[]> {
    return db.select().from(employeeTasks)
      .where(eq(employeeTasks.assignedTo, userId))
      .orderBy(desc(employeeTasks.createdAt));
  }

  async getTasksByDepartment(departmentId: string): Promise<EmployeeTask[]> {
    return db.select().from(employeeTasks)
      .where(eq(employeeTasks.departmentId, departmentId))
      .orderBy(desc(employeeTasks.createdAt));
  }

  // Task Comments
  async getTaskComments(taskId: string): Promise<TaskComment[]> {
    return db.select().from(taskComments)
      .where(eq(taskComments.taskId, taskId))
      .orderBy(taskComments.createdAt);
  }

  async addTaskComment(data: InsertTaskComment): Promise<TaskComment> {
    const [created] = await db.insert(taskComments).values(data as any).returning();
    return created;
  }

  // ==================== PERMISSION OVERRIDES (تعديلات الصلاحيات الديناميكية) ====================

  async getPermissionOverrides(userId: string): Promise<PermissionOverride[]> {
    return db.select().from(permissionOverrides)
      .where(eq(permissionOverrides.userId, userId))
      .orderBy(desc(permissionOverrides.createdAt));
  }

  async getAllPermissionOverrides(): Promise<PermissionOverride[]> {
    return db.select().from(permissionOverrides)
      .orderBy(desc(permissionOverrides.createdAt));
  }

  async createPermissionOverride(override: InsertPermissionOverride): Promise<PermissionOverride> {
    // Check if override already exists for this user+permission
    const existing = await db.select().from(permissionOverrides)
      .where(and(
        eq(permissionOverrides.userId, override.userId),
        eq(permissionOverrides.permissionCode, override.permissionCode)
      ));
    
    // If exists, delete old one first
    if (existing.length > 0) {
      await db.delete(permissionOverrides)
        .where(and(
          eq(permissionOverrides.userId, override.userId),
          eq(permissionOverrides.permissionCode, override.permissionCode)
        ));
    }
    
    const [created] = await db.insert(permissionOverrides).values(override as any).returning();
    return created;
  }

  async deletePermissionOverride(id: string): Promise<boolean> {
    await db.delete(permissionOverrides).where(eq(permissionOverrides.id, id));
    return true;
  }

  async deletePermissionOverridesByUser(userId: string): Promise<boolean> {
    await db.delete(permissionOverrides).where(eq(permissionOverrides.userId, userId));
    return true;
  }

  async getActiveGrantedPermissions(userId: string): Promise<string[]> {
    const now = new Date();
    const overrides = await db.select().from(permissionOverrides)
      .where(and(
        eq(permissionOverrides.userId, userId),
        eq(permissionOverrides.type, 'granted')
      ));
    
    // Filter out expired permissions
    return overrides
      .filter(o => !o.expiresAt || new Date(o.expiresAt) > now)
      .map(o => o.permissionCode);
  }

  async getActiveRevokedPermissions(userId: string): Promise<string[]> {
    const now = new Date();
    const overrides = await db.select().from(permissionOverrides)
      .where(and(
        eq(permissionOverrides.userId, userId),
        eq(permissionOverrides.type, 'revoked')
      ));
    
    // Filter out expired revocations
    return overrides
      .filter(o => !o.expiresAt || new Date(o.expiresAt) > now)
      .map(o => o.permissionCode);
  }

  // ==================== AI ASSISTANT CAPABILITY CONTROL ====================
  
  async getAiAssistantCapabilities(assistantId: string): Promise<AiAssistantCapability[]> {
    return db.select().from(aiAssistantCapabilities)
      .where(eq(aiAssistantCapabilities.assistantId, assistantId))
      .orderBy(desc(aiAssistantCapabilities.createdAt));
  }

  async getAllAiAssistantCapabilities(): Promise<AiAssistantCapability[]> {
    return db.select().from(aiAssistantCapabilities)
      .orderBy(desc(aiAssistantCapabilities.createdAt));
  }

  async setAiAssistantCapability(data: InsertAiAssistantCapability): Promise<AiAssistantCapability> {
    // Check if capability already exists for this assistant
    const existing = await db.select().from(aiAssistantCapabilities)
      .where(and(
        eq(aiAssistantCapabilities.assistantId, data.assistantId),
        eq(aiAssistantCapabilities.capabilityCode, data.capabilityCode)
      ));
    
    if (existing.length > 0) {
      // Update existing capability
      await db.update(aiAssistantCapabilities)
        .set({ 
          isEnabled: data.isEnabled, 
          modifiedBy: data.modifiedBy,
          reason: data.reason,
          updatedAt: new Date()
        })
        .where(eq(aiAssistantCapabilities.id, existing[0].id));
      
      const updated = await db.select().from(aiAssistantCapabilities)
        .where(eq(aiAssistantCapabilities.id, existing[0].id));
      return updated[0];
    }
    
    // Create new capability override
    const [created] = await db.insert(aiAssistantCapabilities)
      .values(data)
      .returning();
    return created;
  }

  async deleteAiAssistantCapability(id: string): Promise<boolean> {
    await db.delete(aiAssistantCapabilities).where(eq(aiAssistantCapabilities.id, id));
    return true;
  }

  async resetAiAssistantCapabilities(assistantId: string): Promise<boolean> {
    await db.delete(aiAssistantCapabilities).where(eq(aiAssistantCapabilities.assistantId, assistantId));
    return true;
  }

  async isCapabilityEnabled(assistantId: string, capabilityCode: string): Promise<boolean> {
    const capability = await db.select().from(aiAssistantCapabilities)
      .where(and(
        eq(aiAssistantCapabilities.assistantId, assistantId),
        eq(aiAssistantCapabilities.capabilityCode, capabilityCode)
      ));
    
    // If no override exists, capability is enabled by default
    if (capability.length === 0) return true;
    
    return capability[0].isEnabled;
  }

  // ==================== DYNAMIC CONFIGURATION SYSTEM ====================
  
  // Platform Settings
  async getPlatformSettings(): Promise<PlatformSetting[]> {
    return db.select().from(platformSettings).orderBy(platformSettings.category, platformSettings.key);
  }

  async getPlatformSettingsByCategory(category: string): Promise<PlatformSetting[]> {
    return db.select().from(platformSettings)
      .where(eq(platformSettings.category, category))
      .orderBy(platformSettings.key);
  }

  async getPlatformSetting(key: string): Promise<PlatformSetting | undefined> {
    const result = await db.select().from(platformSettings)
      .where(eq(platformSettings.key, key));
    return result[0];
  }

  async setPlatformSetting(data: InsertPlatformSetting): Promise<PlatformSetting> {
    const existing = await db.select().from(platformSettings)
      .where(eq(platformSettings.key, data.key));
    
    if (existing.length > 0) {
      await db.update(platformSettings)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(platformSettings.key, data.key));
      const updated = await db.select().from(platformSettings)
        .where(eq(platformSettings.key, data.key));
      return updated[0];
    }
    
    const [created] = await db.insert(platformSettings).values(data as any).returning();
    return created;
  }

  async updatePlatformSetting(id: string, data: Partial<InsertPlatformSetting>): Promise<PlatformSetting | undefined> {
    await db.update(platformSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(platformSettings.id, id));
    const result = await db.select().from(platformSettings).where(eq(platformSettings.id, id));
    return result[0];
  }

  async deletePlatformSetting(id: string): Promise<boolean> {
    await db.delete(platformSettings).where(eq(platformSettings.id, id));
    return true;
  }

  // Dynamic Features
  async getDynamicFeatures(): Promise<DynamicFeature[]> {
    return db.select().from(dynamicFeatures).orderBy(dynamicFeatures.category, dynamicFeatures.name);
  }

  async getDynamicFeaturesByCategory(category: string): Promise<DynamicFeature[]> {
    return db.select().from(dynamicFeatures)
      .where(eq(dynamicFeatures.category, category))
      .orderBy(dynamicFeatures.name);
  }

  async getDynamicFeature(code: string): Promise<DynamicFeature | undefined> {
    const result = await db.select().from(dynamicFeatures)
      .where(eq(dynamicFeatures.code, code));
    return result[0];
  }

  async createDynamicFeature(data: InsertDynamicFeature): Promise<DynamicFeature> {
    const [created] = await db.insert(dynamicFeatures).values(data as any).returning();
    return created;
  }

  async updateDynamicFeature(id: string, data: Partial<InsertDynamicFeature>): Promise<DynamicFeature | undefined> {
    await db.update(dynamicFeatures)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(dynamicFeatures.id, id));
    const result = await db.select().from(dynamicFeatures).where(eq(dynamicFeatures.id, id));
    return result[0];
  }

  async toggleDynamicFeature(code: string, isEnabled: boolean): Promise<DynamicFeature | undefined> {
    await db.update(dynamicFeatures)
      .set({ isEnabled, updatedAt: new Date() })
      .where(eq(dynamicFeatures.code, code));
    const result = await db.select().from(dynamicFeatures).where(eq(dynamicFeatures.code, code));
    return result[0];
  }

  async deleteDynamicFeature(id: string): Promise<boolean> {
    await db.delete(dynamicFeatures).where(eq(dynamicFeatures.id, id));
    return true;
  }

  async isFeatureEnabled(code: string): Promise<boolean> {
    const feature = await this.getDynamicFeature(code);
    return feature?.isEnabled ?? true;
  }

  // Dynamic Pages
  async getDynamicPages(): Promise<DynamicPage[]> {
    return db.select().from(dynamicPages).orderBy(dynamicPages.sortOrder, dynamicPages.pathname);
  }

  async getDynamicPagesByCategory(category: string): Promise<DynamicPage[]> {
    return db.select().from(dynamicPages)
      .where(eq(dynamicPages.category, category))
      .orderBy(dynamicPages.sortOrder);
  }

  async getDynamicPage(pathname: string): Promise<DynamicPage | undefined> {
    const result = await db.select().from(dynamicPages)
      .where(eq(dynamicPages.pathname, pathname));
    return result[0];
  }

  async createDynamicPage(data: InsertDynamicPage): Promise<DynamicPage> {
    const [created] = await db.insert(dynamicPages).values(data as any).returning();
    return created;
  }

  async updateDynamicPage(id: string, data: Partial<InsertDynamicPage>): Promise<DynamicPage | undefined> {
    await db.update(dynamicPages)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(dynamicPages.id, id));
    const result = await db.select().from(dynamicPages).where(eq(dynamicPages.id, id));
    return result[0];
  }

  async toggleDynamicPage(pathname: string, isEnabled: boolean): Promise<DynamicPage | undefined> {
    await db.update(dynamicPages)
      .set({ isEnabled, updatedAt: new Date() })
      .where(eq(dynamicPages.pathname, pathname));
    const result = await db.select().from(dynamicPages).where(eq(dynamicPages.pathname, pathname));
    return result[0];
  }

  async deleteDynamicPage(id: string): Promise<boolean> {
    await db.delete(dynamicPages).where(eq(dynamicPages.id, id));
    return true;
  }

  // Dynamic Components
  async getDynamicComponents(): Promise<DynamicComponent[]> {
    return db.select().from(dynamicComponents).orderBy(dynamicComponents.category, dynamicComponents.name);
  }

  async getDynamicComponentsByCategory(category: string): Promise<DynamicComponent[]> {
    return db.select().from(dynamicComponents)
      .where(eq(dynamicComponents.category, category))
      .orderBy(dynamicComponents.name);
  }

  async getDynamicComponent(code: string): Promise<DynamicComponent | undefined> {
    const result = await db.select().from(dynamicComponents)
      .where(eq(dynamicComponents.code, code));
    return result[0];
  }

  async createDynamicComponent(data: InsertDynamicComponent): Promise<DynamicComponent> {
    const [created] = await db.insert(dynamicComponents).values(data as any).returning();
    return created;
  }

  async updateDynamicComponent(id: string, data: Partial<InsertDynamicComponent>): Promise<DynamicComponent | undefined> {
    await db.update(dynamicComponents)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(dynamicComponents.id, id));
    const result = await db.select().from(dynamicComponents).where(eq(dynamicComponents.id, id));
    return result[0];
  }

  async toggleDynamicComponent(code: string, isEnabled: boolean): Promise<DynamicComponent | undefined> {
    await db.update(dynamicComponents)
      .set({ isEnabled, updatedAt: new Date() })
      .where(eq(dynamicComponents.code, code));
    const result = await db.select().from(dynamicComponents).where(eq(dynamicComponents.code, code));
    return result[0];
  }

  async deleteDynamicComponent(id: string): Promise<boolean> {
    await db.delete(dynamicComponents).where(eq(dynamicComponents.id, id));
    return true;
  }

  // Dynamic API Endpoints
  async getDynamicApiEndpoints(): Promise<DynamicApiEndpoint[]> {
    return db.select().from(dynamicApiEndpoints).orderBy(dynamicApiEndpoints.path);
  }

  async getDynamicApiEndpoint(path: string): Promise<DynamicApiEndpoint | undefined> {
    const result = await db.select().from(dynamicApiEndpoints)
      .where(eq(dynamicApiEndpoints.path, path));
    return result[0];
  }

  async createDynamicApiEndpoint(data: InsertDynamicApiEndpoint): Promise<DynamicApiEndpoint> {
    const [created] = await db.insert(dynamicApiEndpoints).values(data as any).returning();
    return created;
  }

  async updateDynamicApiEndpoint(id: string, data: Partial<InsertDynamicApiEndpoint>): Promise<DynamicApiEndpoint | undefined> {
    await db.update(dynamicApiEndpoints)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(dynamicApiEndpoints.id, id));
    const result = await db.select().from(dynamicApiEndpoints).where(eq(dynamicApiEndpoints.id, id));
    return result[0];
  }

  async toggleDynamicApiEndpoint(path: string, isEnabled: boolean): Promise<DynamicApiEndpoint | undefined> {
    await db.update(dynamicApiEndpoints)
      .set({ isEnabled, updatedAt: new Date() })
      .where(eq(dynamicApiEndpoints.path, path));
    const result = await db.select().from(dynamicApiEndpoints).where(eq(dynamicApiEndpoints.path, path));
    return result[0];
  }

  async deleteDynamicApiEndpoint(id: string): Promise<boolean> {
    await db.delete(dynamicApiEndpoints).where(eq(dynamicApiEndpoints.id, id));
    return true;
  }

  // Dynamic Workflows
  async getDynamicWorkflows(): Promise<DynamicWorkflow[]> {
    return db.select().from(dynamicWorkflows).orderBy(dynamicWorkflows.category, dynamicWorkflows.name);
  }

  async getDynamicWorkflowsByCategory(category: string): Promise<DynamicWorkflow[]> {
    return db.select().from(dynamicWorkflows)
      .where(eq(dynamicWorkflows.category, category))
      .orderBy(dynamicWorkflows.name);
  }

  async getDynamicWorkflow(code: string): Promise<DynamicWorkflow | undefined> {
    const result = await db.select().from(dynamicWorkflows)
      .where(eq(dynamicWorkflows.code, code));
    return result[0];
  }

  async createDynamicWorkflow(data: InsertDynamicWorkflow): Promise<DynamicWorkflow> {
    const [created] = await db.insert(dynamicWorkflows).values(data as any).returning();
    return created;
  }

  async updateDynamicWorkflow(id: string, data: Partial<InsertDynamicWorkflow>): Promise<DynamicWorkflow | undefined> {
    await db.update(dynamicWorkflows)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(dynamicWorkflows.id, id));
    const result = await db.select().from(dynamicWorkflows).where(eq(dynamicWorkflows.id, id));
    return result[0];
  }

  async toggleDynamicWorkflow(code: string, isEnabled: boolean): Promise<DynamicWorkflow | undefined> {
    await db.update(dynamicWorkflows)
      .set({ isEnabled, updatedAt: new Date() })
      .where(eq(dynamicWorkflows.code, code));
    const result = await db.select().from(dynamicWorkflows).where(eq(dynamicWorkflows.code, code));
    return result[0];
  }

  async deleteDynamicWorkflow(id: string): Promise<boolean> {
    await db.delete(dynamicWorkflows).where(eq(dynamicWorkflows.id, id));
    return true;
  }

  // ==================== Assistant Relationships ====================
  async getAssistantRelationships(): Promise<AssistantRelationship[]> {
    return db.select().from(assistantRelationships).orderBy(desc(assistantRelationships.createdAt));
  }

  async getAssistantRelationship(id: string): Promise<AssistantRelationship | undefined> {
    const result = await db.select().from(assistantRelationships)
      .where(eq(assistantRelationships.id, id));
    return result[0];
  }

  async getAssistantRelationshipsByAssistant(assistantId: string): Promise<AssistantRelationship[]> {
    return db.select().from(assistantRelationships)
      .where(
        sql`${assistantRelationships.sourceAssistantId} = ${assistantId} OR ${assistantRelationships.targetAssistantId} = ${assistantId}`
      )
      .orderBy(desc(assistantRelationships.createdAt));
  }

  async createAssistantRelationship(data: InsertAssistantRelationship): Promise<AssistantRelationship> {
    const [created] = await db.insert(assistantRelationships).values(data as any).returning();
    return created;
  }

  async updateAssistantRelationship(id: string, data: Partial<InsertAssistantRelationship>): Promise<AssistantRelationship | undefined> {
    await db.update(assistantRelationships)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(assistantRelationships.id, id));
    const result = await db.select().from(assistantRelationships).where(eq(assistantRelationships.id, id));
    return result[0];
  }

  async toggleAssistantRelationship(id: string, isEnabled: boolean): Promise<AssistantRelationship | undefined> {
    await db.update(assistantRelationships)
      .set({ isEnabled, updatedAt: new Date() })
      .where(eq(assistantRelationships.id, id));
    const result = await db.select().from(assistantRelationships).where(eq(assistantRelationships.id, id));
    return result[0];
  }

  async deleteAssistantRelationship(id: string): Promise<boolean> {
    await db.delete(assistantRelationships).where(eq(assistantRelationships.id, id));
    return true;
  }

  // ==================== Assistant Conversations ====================
  async getAssistantConversations(relationshipId?: string): Promise<AssistantConversation[]> {
    if (relationshipId) {
      return db.select().from(assistantConversations)
        .where(eq(assistantConversations.relationshipId, relationshipId))
        .orderBy(desc(assistantConversations.createdAt));
    }
    return db.select().from(assistantConversations)
      .orderBy(desc(assistantConversations.createdAt))
      .limit(100);
  }

  async getAssistantConversation(id: string): Promise<AssistantConversation | undefined> {
    const result = await db.select().from(assistantConversations)
      .where(eq(assistantConversations.id, id));
    return result[0];
  }

  async getAssistantConversationsByAssistant(assistantId: string): Promise<AssistantConversation[]> {
    return db.select().from(assistantConversations)
      .where(
        sql`${assistantConversations.senderAssistantId} = ${assistantId} OR ${assistantConversations.receiverAssistantId} = ${assistantId}`
      )
      .orderBy(desc(assistantConversations.createdAt))
      .limit(100);
  }

  async createAssistantConversation(data: InsertAssistantConversation): Promise<AssistantConversation> {
    const [created] = await db.insert(assistantConversations).values(data as any).returning();
    return created;
  }

  async markConversationAsRead(id: string): Promise<AssistantConversation | undefined> {
    await db.update(assistantConversations)
      .set({ isRead: true })
      .where(eq(assistantConversations.id, id));
    const result = await db.select().from(assistantConversations).where(eq(assistantConversations.id, id));
    return result[0];
  }

  async markConversationAsProcessed(id: string): Promise<AssistantConversation | undefined> {
    await db.update(assistantConversations)
      .set({ isProcessed: true })
      .where(eq(assistantConversations.id, id));
    const result = await db.select().from(assistantConversations).where(eq(assistantConversations.id, id));
    return result[0];
  }

  async deleteAssistantConversation(id: string): Promise<boolean> {
    await db.delete(assistantConversations).where(eq(assistantConversations.id, id));
    return true;
  }

  // ==================== Assistant Workgroups ====================
  async getAssistantWorkgroups(): Promise<AssistantWorkgroup[]> {
    return db.select().from(assistantWorkgroups).orderBy(assistantWorkgroups.nameEn);
  }

  async getAssistantWorkgroup(id: string): Promise<AssistantWorkgroup | undefined> {
    const result = await db.select().from(assistantWorkgroups)
      .where(eq(assistantWorkgroups.id, id));
    return result[0];
  }

  async getAssistantWorkgroupByCode(code: string): Promise<AssistantWorkgroup | undefined> {
    const result = await db.select().from(assistantWorkgroups)
      .where(eq(assistantWorkgroups.code, code));
    return result[0];
  }

  async createAssistantWorkgroup(data: InsertAssistantWorkgroup): Promise<AssistantWorkgroup> {
    const [created] = await db.insert(assistantWorkgroups).values(data as any).returning();
    return created;
  }

  async updateAssistantWorkgroup(id: string, data: Partial<InsertAssistantWorkgroup>): Promise<AssistantWorkgroup | undefined> {
    await db.update(assistantWorkgroups)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(assistantWorkgroups.id, id));
    const result = await db.select().from(assistantWorkgroups).where(eq(assistantWorkgroups.id, id));
    return result[0];
  }

  async toggleAssistantWorkgroup(id: string, isActive: boolean): Promise<AssistantWorkgroup | undefined> {
    await db.update(assistantWorkgroups)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(assistantWorkgroups.id, id));
    const result = await db.select().from(assistantWorkgroups).where(eq(assistantWorkgroups.id, id));
    return result[0];
  }

  async deleteAssistantWorkgroup(id: string): Promise<boolean> {
    await db.delete(assistantWorkgroups).where(eq(assistantWorkgroups.id, id));
    return true;
  }

  // ==================== Assistant Permission Audit ====================
  async getAssistantPermissionAudits(limit: number = 100): Promise<AssistantPermissionAudit[]> {
    return db.select().from(assistantPermissionAudit)
      .orderBy(desc(assistantPermissionAudit.createdAt))
      .limit(limit);
  }

  async getAssistantPermissionAuditsByEntity(entityType: string, entityId: string): Promise<AssistantPermissionAudit[]> {
    return db.select().from(assistantPermissionAudit)
      .where(
        and(
          eq(assistantPermissionAudit.entityType, entityType),
          eq(assistantPermissionAudit.entityId, entityId)
        )
      )
      .orderBy(desc(assistantPermissionAudit.createdAt));
  }

  async createAssistantPermissionAudit(data: InsertAssistantPermissionAudit): Promise<AssistantPermissionAudit> {
    const [created] = await db.insert(assistantPermissionAudit).values(data as any).returning();
    return created;
  }

  // ==================== Sovereign Navigation System ====================
  
  // Navigation Resources
  async getNavigationResources(): Promise<NavigationResource[]> {
    return db.select().from(navigationResources)
      .where(eq(navigationResources.isEnabled, true))
      .orderBy(desc(navigationResources.priority));
  }

  async getNavigationResourcesByCategory(category: string): Promise<NavigationResource[]> {
    return db.select().from(navigationResources)
      .where(
        and(
          eq(navigationResources.category, category),
          eq(navigationResources.isEnabled, true)
        )
      )
      .orderBy(desc(navigationResources.priority));
  }

  async getNavigationResource(id: string): Promise<NavigationResource | undefined> {
    const result = await db.select().from(navigationResources)
      .where(eq(navigationResources.id, id));
    return result[0];
  }

  async getNavigationResourceByPath(path: string): Promise<NavigationResource | undefined> {
    const result = await db.select().from(navigationResources)
      .where(eq(navigationResources.path, path));
    return result[0];
  }

  async searchNavigationResources(query: string, language: string = 'en'): Promise<NavigationResource[]> {
    const lowerQuery = query.toLowerCase();
    const resources = await db.select().from(navigationResources)
      .where(eq(navigationResources.isEnabled, true))
      .orderBy(desc(navigationResources.priority));
    
    // Fuzzy search across name, description, and keywords
    return resources.filter(r => {
      const nameField = language === 'ar' ? r.nameAr : r.nameEn;
      const descField = language === 'ar' ? r.descriptionAr : r.descriptionEn;
      const keywordsField = language === 'ar' ? r.keywordsAr : r.keywordsEn;
      
      return (
        nameField?.toLowerCase().includes(lowerQuery) ||
        descField?.toLowerCase().includes(lowerQuery) ||
        keywordsField?.toLowerCase().includes(lowerQuery) ||
        r.path.toLowerCase().includes(lowerQuery) ||
        r.code.toLowerCase().includes(lowerQuery)
      );
    });
  }

  async createNavigationResource(data: InsertNavigationResource): Promise<NavigationResource> {
    const [created] = await db.insert(navigationResources).values(data as any).returning();
    return created;
  }

  async updateNavigationResource(id: string, data: Partial<InsertNavigationResource>): Promise<NavigationResource | undefined> {
    await db.update(navigationResources)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(navigationResources.id, id));
    const result = await db.select().from(navigationResources).where(eq(navigationResources.id, id));
    return result[0];
  }

  async toggleNavigationResource(id: string, isEnabled: boolean): Promise<NavigationResource | undefined> {
    await db.update(navigationResources)
      .set({ isEnabled, updatedAt: new Date() })
      .where(eq(navigationResources.id, id));
    const result = await db.select().from(navigationResources).where(eq(navigationResources.id, id));
    return result[0];
  }

  // Navigation Shortcuts
  async getNavigationShortcuts(): Promise<NavigationShortcut[]> {
    return db.select().from(navigationShortcuts)
      .where(eq(navigationShortcuts.isEnabled, true))
      .orderBy(desc(navigationShortcuts.priority));
  }

  async createNavigationShortcut(data: InsertNavigationShortcut): Promise<NavigationShortcut> {
    const [created] = await db.insert(navigationShortcuts).values(data as any).returning();
    return created;
  }

  async updateNavigationShortcut(id: string, data: Partial<InsertNavigationShortcut>): Promise<NavigationShortcut | undefined> {
    await db.update(navigationShortcuts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(navigationShortcuts.id, id));
    const result = await db.select().from(navigationShortcuts).where(eq(navigationShortcuts.id, id));
    return result[0];
  }

  async deleteNavigationShortcut(id: string): Promise<boolean> {
    await db.delete(navigationShortcuts).where(eq(navigationShortcuts.id, id));
    return true;
  }

  // Navigation User State
  async getNavigationUserState(userId: string): Promise<NavigationUserState | undefined> {
    const result = await db.select().from(navigationUserState)
      .where(eq(navigationUserState.userId, userId));
    return result[0];
  }

  async upsertNavigationUserState(userId: string, data: Partial<InsertNavigationUserState>): Promise<NavigationUserState> {
    const existing = await this.getNavigationUserState(userId);
    if (existing) {
      await db.update(navigationUserState)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(navigationUserState.userId, userId));
      const result = await db.select().from(navigationUserState).where(eq(navigationUserState.userId, userId));
      return result[0];
    } else {
      const [created] = await db.insert(navigationUserState)
        .values({ ...data, userId } as any)
        .returning();
      return created;
    }
  }

  async addToRecentNavigation(userId: string, resourceId: string): Promise<void> {
    const state = await this.getNavigationUserState(userId);
    const maxRecents = 10;
    
    let recents = state?.recentResourceIds || [];
    recents = recents.filter(id => id !== resourceId);
    recents.unshift(resourceId);
    recents = recents.slice(0, maxRecents);
    
    await this.upsertNavigationUserState(userId, { 
      recentResourceIds: recents,
      lastAccessedAt: new Date()
    });
  }

  async toggleFavoriteNavigation(userId: string, resourceId: string): Promise<boolean> {
    const state = await this.getNavigationUserState(userId);
    let favorites = state?.favoriteResourceIds || [];
    
    const isFavorite = favorites.includes(resourceId);
    if (isFavorite) {
      favorites = favorites.filter(id => id !== resourceId);
    } else {
      favorites.push(resourceId);
    }
    
    await this.upsertNavigationUserState(userId, { favoriteResourceIds: favorites });
    return !isFavorite;
  }

  // Navigation Search History
  async logNavigationSearch(data: InsertNavigationSearchHistory): Promise<NavigationSearchHistory> {
    const [created] = await db.insert(navigationSearchHistory).values(data as any).returning();
    return created;
  }

  async getNavigationSearchHistory(userId: string, limit: number = 20): Promise<NavigationSearchHistory[]> {
    return db.select().from(navigationSearchHistory)
      .where(eq(navigationSearchHistory.userId, userId))
      .orderBy(desc(navigationSearchHistory.createdAt))
      .limit(limit);
  }

  // Navigation Analytics
  async trackNavigationVisit(path: string, userId: string, role: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const resource = await this.getNavigationResourceByPath(path);
    
    const existing = await db.select().from(navigationAnalytics)
      .where(
        and(
          eq(navigationAnalytics.path, path),
          eq(navigationAnalytics.date, today)
        )
      );
    
    if (existing.length > 0) {
      const byRole = (existing[0].byRole as Record<string, number>) || {};
      byRole[role] = (byRole[role] || 0) + 1;
      
      await db.update(navigationAnalytics)
        .set({
          totalVisits: (existing[0].totalVisits || 0) + 1,
          byRole
        })
        .where(eq(navigationAnalytics.id, existing[0].id));
    } else {
      await db.insert(navigationAnalytics).values({
        resourceId: resource?.id,
        path,
        date: today,
        totalVisits: 1,
        byRole: { [role]: 1 }
      } as any);
    }
  }

  async getNavigationAnalytics(days: number = 30): Promise<NavigationAnalytics[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];
    
    return db.select().from(navigationAnalytics)
      .where(sql`${navigationAnalytics.date} >= ${startDateStr}`)
      .orderBy(desc(navigationAnalytics.totalVisits));
  }

  // ==================== PLATFORM ICON VERSION CONTROL ====================
  // نظام إدارة إصدارات الأيقونات الديناميكي

  // Platform Icons
  async getPlatformIcons(): Promise<PlatformIcon[]> {
    return db.select().from(platformIcons).orderBy(asc(platformIcons.name));
  }

  async getPlatformIcon(id: string): Promise<PlatformIcon | undefined> {
    const [result] = await db.select().from(platformIcons).where(eq(platformIcons.id, id));
    return result;
  }

  async getPlatformIconByPlatformId(platformId: string): Promise<PlatformIcon | undefined> {
    const [result] = await db.select().from(platformIcons).where(eq(platformIcons.platformId, platformId));
    return result;
  }

  async getPlatformIconsByCategory(category: string): Promise<PlatformIcon[]> {
    return db.select().from(platformIcons).where(eq(platformIcons.category, category));
  }

  async createPlatformIcon(data: InsertPlatformIcon): Promise<PlatformIcon> {
    const [created] = await db.insert(platformIcons).values(data as any).returning();
    return created;
  }

  async updatePlatformIcon(id: string, data: Partial<InsertPlatformIcon>): Promise<PlatformIcon | undefined> {
    const [updated] = await db.update(platformIcons)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(platformIcons.id, id))
      .returning();
    return updated;
  }

  async deletePlatformIcon(id: string): Promise<boolean> {
    const result = await db.delete(platformIcons).where(eq(platformIcons.id, id));
    return true;
  }

  // Platform Icon Versions
  async getPlatformIconVersions(platformIconId: string): Promise<PlatformIconVersion[]> {
    return db.select().from(platformIconVersions)
      .where(eq(platformIconVersions.platformIconId, platformIconId))
      .orderBy(desc(platformIconVersions.versionNumber));
  }

  async getPlatformIconVersionsByPlatformId(platformId: string): Promise<PlatformIconVersion[]> {
    return db.select().from(platformIconVersions)
      .where(eq(platformIconVersions.platformId, platformId))
      .orderBy(desc(platformIconVersions.versionNumber));
  }

  async getPlatformIconVersion(id: string): Promise<PlatformIconVersion | undefined> {
    const [result] = await db.select().from(platformIconVersions).where(eq(platformIconVersions.id, id));
    return result;
  }

  async getCurrentIconVersion(platformIconId: string): Promise<PlatformIconVersion | undefined> {
    const [result] = await db.select().from(platformIconVersions)
      .where(and(
        eq(platformIconVersions.platformIconId, platformIconId),
        eq(platformIconVersions.isCurrent, true)
      ));
    return result;
  }

  async createPlatformIconVersion(data: InsertPlatformIconVersion): Promise<PlatformIconVersion> {
    // Get the next version number
    const existingVersions = await db.select().from(platformIconVersions)
      .where(eq(platformIconVersions.platformIconId, data.platformIconId));
    const nextVersionNumber = existingVersions.length + 1;
    
    const [created] = await db.insert(platformIconVersions)
      .values({ ...data, versionNumber: nextVersionNumber } as any)
      .returning();
    
    // Update total versions count in platform icon
    await db.update(platformIcons)
      .set({ totalVersions: nextVersionNumber, updatedAt: new Date() })
      .where(eq(platformIcons.id, data.platformIconId));
    
    return created;
  }

  async setCurrentIconVersion(platformIconId: string, versionId: string): Promise<PlatformIconVersion | undefined> {
    // First, unset all current versions for this platform
    await db.update(platformIconVersions)
      .set({ isCurrent: false })
      .where(eq(platformIconVersions.platformIconId, platformIconId));
    
    // Set the specified version as current
    const [updated] = await db.update(platformIconVersions)
      .set({ isCurrent: true })
      .where(eq(platformIconVersions.id, versionId))
      .returning();
    
    // Update platform icon with current version reference
    if (updated) {
      await db.update(platformIcons)
        .set({ 
          currentVersionId: versionId, 
          currentIconPath: updated.primaryIconPath,
          updatedAt: new Date()
        })
        .where(eq(platformIcons.id, platformIconId));
    }
    
    return updated;
  }

  async restoreIconVersion(platformIconId: string, versionId: string): Promise<PlatformIconVersion | undefined> {
    const sourceVersion = await this.getPlatformIconVersion(versionId);
    if (!sourceVersion) return undefined;
    
    // Create a new version as a copy of the restored version
    const restoredVersion = await this.createPlatformIconVersion({
      platformIconId,
      platformId: sourceVersion.platformId,
      versionNumber: 0, // Will be set automatically
      versionLabel: `Restored from v${sourceVersion.versionNumber}`,
      iconFiles: sourceVersion.iconFiles,
      primaryIconPath: sourceVersion.primaryIconPath,
      generationPrompt: sourceVersion.generationPrompt,
      generationStatus: "completed",
      metadata: sourceVersion.metadata,
      isActive: true,
      isCurrent: false,
      restoredFrom: versionId,
    });
    
    // Set the restored version as current
    await this.setCurrentIconVersion(platformIconId, restoredVersion.id);
    
    return restoredVersion;
  }

  // Icon Regeneration Requests
  async getIconRegenerationRequests(platformIconId?: string): Promise<IconRegenerationRequest[]> {
    if (platformIconId) {
      return db.select().from(iconRegenerationRequests)
        .where(eq(iconRegenerationRequests.platformIconId, platformIconId))
        .orderBy(desc(iconRegenerationRequests.requestedAt));
    }
    return db.select().from(iconRegenerationRequests)
      .orderBy(desc(iconRegenerationRequests.requestedAt));
  }

  async getPendingIconRegenerationRequests(): Promise<IconRegenerationRequest[]> {
    return db.select().from(iconRegenerationRequests)
      .where(eq(iconRegenerationRequests.status, "pending"))
      .orderBy(asc(iconRegenerationRequests.requestedAt));
  }

  async createIconRegenerationRequest(data: InsertIconRegenerationRequest): Promise<IconRegenerationRequest> {
    const [created] = await db.insert(iconRegenerationRequests).values(data as any).returning();
    
    // Update regeneration count
    await db.update(platformIcons)
      .set({ 
        totalRegenerations: sql`${platformIcons.totalRegenerations} + 1`,
        updatedAt: new Date()
      })
      .where(eq(platformIcons.id, data.platformIconId));
    
    return created;
  }

  async updateIconRegenerationRequest(id: string, data: Partial<InsertIconRegenerationRequest>): Promise<IconRegenerationRequest | undefined> {
    const [updated] = await db.update(iconRegenerationRequests)
      .set(data as any)
      .where(eq(iconRegenerationRequests.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
