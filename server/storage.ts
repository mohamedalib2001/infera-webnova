import {
  type User,
  type InsertUser,
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
  type InsertAiBuildTask,
  type AiBuildArtifact,
  type InsertAiBuildArtifact,
  type DevProject,
  type InsertDevProject,
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
  devProjects,
  projectFiles,
  runtimeInstances,
  consoleLogs,
  devDatabaseTables,
  devDatabaseColumns,
  devDatabaseRelationships,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, gt } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  upsertUser(userData: UpsertUser): Promise<User>; // For OAuth/Replit Auth
  
  // Subscription Plans
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlan(id: string): Promise<SubscriptionPlan | undefined>;
  getSubscriptionPlanByRole(role: string): Promise<SubscriptionPlan | undefined>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  
  // User Subscriptions
  getUserSubscription(userId: string): Promise<UserSubscription | undefined>;
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
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeSubscriptionPlans();
    this.initializeTemplates();
    this.initializeComponents();
  }

  // Initialize subscription plans
  private async initializeSubscriptionPlans() {
    const existingPlans = await db.select().from(subscriptionPlans);
    if (existingPlans.length > 0) return;

    const plans: InsertSubscriptionPlan[] = [
      {
        name: "Free",
        nameAr: "مجاني",
        description: "Get started with basic features",
        descriptionAr: "ابدأ مع الميزات الأساسية",
        role: "free",
        priceMonthly: 0,
        priceQuarterly: 0,
        priceSemiAnnual: 0,
        priceYearly: 0,
        currency: "USD",
        features: ["1 Project", "5 Pages per Project", "10 AI Generations/month", "Basic Templates"],
        featuresAr: ["مشروع واحد", "5 صفحات لكل مشروع", "10 توليدات AI شهرياً", "قوالب أساسية"],
        maxProjects: 1,
        maxPagesPerProject: 5,
        aiGenerationsPerMonth: 10,
        customDomain: false,
        whiteLabel: false,
        prioritySupport: false,
        analyticsAccess: false,
        chatbotBuilder: false,
        teamMembers: 1,
        sortOrder: 0,
      },
      {
        name: "Basic",
        nameAr: "أساسي",
        description: "Perfect for individuals",
        descriptionAr: "مثالي للأفراد",
        role: "basic",
        priceMonthly: 999, // $9.99
        priceQuarterly: 2499, // $24.99 (save ~17%)
        priceSemiAnnual: 4499, // $44.99 (save ~25%)
        priceYearly: 7999, // $79.99 (save ~33%)
        currency: "USD",
        features: ["5 Projects", "20 Pages per Project", "50 AI Generations/month", "All Templates", "Export Code"],
        featuresAr: ["5 مشاريع", "20 صفحة لكل مشروع", "50 توليد AI شهرياً", "جميع القوالب", "تصدير الكود"],
        maxProjects: 5,
        maxPagesPerProject: 20,
        aiGenerationsPerMonth: 50,
        customDomain: false,
        whiteLabel: false,
        prioritySupport: false,
        analyticsAccess: true,
        chatbotBuilder: false,
        teamMembers: 1,
        sortOrder: 1,
      },
      {
        name: "Pro",
        nameAr: "احترافي",
        description: "For professionals and small businesses",
        descriptionAr: "للمحترفين والشركات الصغيرة",
        role: "pro",
        priceMonthly: 2999, // $29.99
        priceQuarterly: 7499, // $74.99
        priceSemiAnnual: 13499, // $134.99
        priceYearly: 23999, // $239.99
        currency: "USD",
        features: ["Unlimited Projects", "Unlimited Pages", "200 AI Generations/month", "Custom Domain", "Analytics Dashboard", "ChatBot Builder", "Priority Support"],
        featuresAr: ["مشاريع غير محدودة", "صفحات غير محدودة", "200 توليد AI شهرياً", "نطاق مخصص", "لوحة تحليلات", "منشئ الشات بوت", "دعم أولوية"],
        maxProjects: -1, // unlimited
        maxPagesPerProject: -1,
        aiGenerationsPerMonth: 200,
        customDomain: true,
        whiteLabel: false,
        prioritySupport: true,
        analyticsAccess: true,
        chatbotBuilder: true,
        teamMembers: 3,
        sortOrder: 2,
      },
      {
        name: "Enterprise",
        nameAr: "مؤسسي",
        description: "For agencies and large teams",
        descriptionAr: "للوكالات والفرق الكبيرة",
        role: "enterprise",
        priceMonthly: 9999, // $99.99
        priceQuarterly: 24999,
        priceSemiAnnual: 44999,
        priceYearly: 79999,
        currency: "USD",
        features: ["Everything in Pro", "White Label Mode", "Team Management", "API Access", "Dedicated Support", "Custom Integrations"],
        featuresAr: ["كل ميزات Pro", "وضع White Label", "إدارة الفريق", "الوصول لـ API", "دعم مخصص", "تكاملات مخصصة"],
        maxProjects: -1,
        maxPagesPerProject: -1,
        aiGenerationsPerMonth: 1000,
        customDomain: true,
        whiteLabel: true,
        prioritySupport: true,
        analyticsAccess: true,
        chatbotBuilder: true,
        teamMembers: 10,
        sortOrder: 3,
      },
      {
        name: "Sovereign",
        nameAr: "سيادي",
        description: "Complete control for government and enterprises",
        descriptionAr: "تحكم كامل للحكومات والمؤسسات الكبرى",
        role: "sovereign",
        priceMonthly: 49999, // $499.99
        priceQuarterly: 124999,
        priceSemiAnnual: 224999,
        priceYearly: 399999,
        currency: "USD",
        features: ["Everything in Enterprise", "Sovereign Dashboard", "Emergency Stop Button", "Global Analytics", "Multi-tenant Management", "Custom Deployment"],
        featuresAr: ["كل ميزات Enterprise", "لوحة تحكم سيادية", "زر إيقاف طوارئ", "تحليلات عالمية", "إدارة متعددة المستأجرين", "نشر مخصص"],
        maxProjects: -1,
        maxPagesPerProject: -1,
        aiGenerationsPerMonth: -1, // unlimited
        customDomain: true,
        whiteLabel: true,
        prioritySupport: true,
        analyticsAccess: true,
        chatbotBuilder: true,
        teamMembers: -1, // unlimited
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
      await db.insert(templates).values(template);
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

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
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

  // User Subscriptions methods
  async getUserSubscription(userId: string): Promise<UserSubscription | undefined> {
    const [subscription] = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId))
      .orderBy(desc(userSubscriptions.createdAt));
    return subscription || undefined;
  }

  async createUserSubscription(subscription: InsertUserSubscription): Promise<UserSubscription> {
    const [created] = await db.insert(userSubscriptions).values(subscription).returning();
    return created;
  }

  async updateUserSubscription(id: string, updates: Partial<InsertUserSubscription>): Promise<UserSubscription | undefined> {
    const [subscription] = await db
      .update(userSubscriptions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userSubscriptions.id, id))
      .returning();
    return subscription || undefined;
  }

  // Payments methods
  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    return db.select().from(payments).where(eq(payments.userId, userId)).orderBy(desc(payments.createdAt));
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [created] = await db.insert(payments).values(payment).returning();
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
    const [created] = await db.insert(aiUsage).values(usage).returning();
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
    return db.select().from(projects).orderBy(desc(projects.updatedAt));
  }

  async getProjectsByUser(userId: string): Promise<Project[]> {
    return db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.updatedAt));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(insertProject).returning();
    return project;
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project || undefined;
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return (result.rowCount ?? 0) > 0;
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
    const [message] = await db.insert(messages).values(insertMessage).returning();
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
    const [template] = await db.insert(templates).values(insertTemplate).returning();
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
    const [version] = await db.insert(projectVersions).values(insertVersion).returning();
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
    const [link] = await db.insert(shareLinks).values(insertLink).returning();
    return link;
  }

  async deactivateShareLink(id: string): Promise<boolean> {
    const result = await db
      .update(shareLinks)
      .set({ isActive: "false" })
      .where(eq(shareLinks.id, id));
    return (result.rowCount ?? 0) > 0;
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
    const [component] = await db.insert(components).values(insertComponent).returning();
    return component;
  }

  // OTP methods
  async createOtpCode(insertOtp: InsertOtpCode): Promise<OtpCode> {
    const [otp] = await db.insert(otpCodes).values(insertOtp).returning();
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
    await db.update(otpCodes).set({ isUsed: true }).where(eq(otpCodes.id, id));
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
    const [chatbot] = await db.insert(chatbots).values(insertChatbot).returning();
    return chatbot;
  }

  async updateChatbot(id: string, updateData: Partial<InsertChatbot>): Promise<Chatbot | undefined> {
    const [chatbot] = await db.update(chatbots).set(updateData).where(eq(chatbots.id, id)).returning();
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
    const [created] = await db.insert(aiAssistants).values(assistant).returning();
    return created;
  }

  async updateAiAssistant(id: string, updateData: Partial<InsertAiAssistant>): Promise<AiAssistant | undefined> {
    const [updated] = await db.update(aiAssistants).set(updateData).where(eq(aiAssistants.id, id)).returning();
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
    const [created] = await db.insert(assistantInstructions).values(instruction).returning();
    return created;
  }

  async updateInstruction(id: string, updateData: Partial<InsertAssistantInstruction>): Promise<AssistantInstruction | undefined> {
    const [updated] = await db.update(assistantInstructions).set(updateData).where(eq(assistantInstructions.id, id)).returning();
    return updated || undefined;
  }

  // Owner Settings methods
  async getOwnerSettings(userId: string): Promise<OwnerSettings | undefined> {
    const [settings] = await db.select().from(ownerSettings).where(eq(ownerSettings.userId, userId));
    return settings || undefined;
  }

  async createOwnerSettings(settings: InsertOwnerSettings): Promise<OwnerSettings> {
    const [created] = await db.insert(ownerSettings).values(settings).returning();
    return created;
  }

  async updateOwnerSettings(userId: string, updateData: Partial<InsertOwnerSettings>): Promise<OwnerSettings | undefined> {
    const [updated] = await db.update(ownerSettings).set(updateData).where(eq(ownerSettings.userId, userId)).returning();
    return updated || undefined;
  }

  // Audit Logs methods
  async getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
    return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
  }

  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [created] = await db.insert(auditLogs).values(log).returning();
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
    const [created] = await db.insert(paymentMethods).values(method).returning();
    return created;
  }

  async updatePaymentMethod(id: string, updateData: Partial<InsertPaymentMethod>): Promise<PaymentMethod | undefined> {
    const [updated] = await db.update(paymentMethods)
      .set({ ...updateData, updatedAt: new Date() })
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
    const [created] = await db.insert(paymentTransactions).values(transaction).returning();
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
    const [created] = await db.insert(authMethods).values(method).returning();
    return created;
  }

  async updateAuthMethod(id: string, updateData: Partial<InsertAuthMethod>): Promise<AuthMethod | undefined> {
    const [updated] = await db.update(authMethods)
      .set({ ...updateData, updatedAt: new Date() })
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
    const [created] = await db.insert(aiModels).values(model).returning();
    return created;
  }

  async updateAiModel(id: string, updateData: Partial<InsertAiModel>): Promise<AiModel | undefined> {
    const [updated] = await db.update(aiModels)
      .set({ ...updateData, updatedAt: new Date() })
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
    const [created] = await db.insert(aiUsagePolicies).values(policy).returning();
    return created;
  }

  async updateAiUsagePolicy(id: string, updateData: Partial<InsertAiUsagePolicy>): Promise<AiUsagePolicy | undefined> {
    const [updated] = await db.update(aiUsagePolicies)
      .set({ ...updateData, updatedAt: new Date() })
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
    const [created] = await db.insert(aiCostTracking).values(tracking).returning();
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
    const [created] = await db.insert(emergencyControls).values(control).returning();
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
    const [created] = await db.insert(featureFlags).values(flag).returning();
    return created;
  }

  async updateFeatureFlag(id: string, updateData: Partial<InsertFeatureFlag>): Promise<FeatureFlag | undefined> {
    const [updated] = await db.update(featureFlags)
      .set({ ...updateData, updatedAt: new Date() })
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
    const [created] = await db.insert(systemAnnouncements).values(announcement).returning();
    return created;
  }

  async updateSystemAnnouncement(id: string, updateData: Partial<InsertSystemAnnouncement>): Promise<SystemAnnouncement | undefined> {
    const [updated] = await db.update(systemAnnouncements)
      .set({ ...updateData, updatedAt: new Date() })
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
    const [created] = await db.insert(adminRoles).values(role).returning();
    return created;
  }

  async updateAdminRole(id: string, updateData: Partial<InsertAdminRole>): Promise<AdminRole | undefined> {
    const role = await this.getAdminRole(id);
    if (!role) return undefined;
    if (role.isSystem) {
      throw new Error("Cannot modify system roles");
    }
    const [updated] = await db.update(adminRoles)
      .set({ ...updateData, updatedAt: new Date() })
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
    const [created] = await db.insert(userAdminRoles).values(assignment).returning();
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
    const [created] = await db.insert(platformMetrics).values(metrics).returning();
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
    const [created] = await db.insert(subscriptionEvents).values(event).returning();
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
    const [created] = await db.insert(sovereignAssistants).values(assistant).returning();
    return created;
  }

  async updateSovereignAssistant(id: string, data: Partial<InsertSovereignAssistant>): Promise<SovereignAssistant | undefined> {
    const [updated] = await db.update(sovereignAssistants)
      .set({ ...data, updatedAt: new Date() })
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
    const [created] = await db.insert(sovereignCommands).values(command).returning();
    return created;
  }

  async updateSovereignCommand(id: string, data: Partial<InsertSovereignCommand>): Promise<SovereignCommand | undefined> {
    const [updated] = await db.update(sovereignCommands)
      .set(data)
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
    const [created] = await db.insert(sovereignActions).values(action).returning();
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
    const [created] = await db.insert(sovereignActionLogs).values(log).returning();
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
    const [created] = await db.insert(sovereignPolicies).values(policy).returning();
    return created;
  }

  async updateSovereignPolicy(id: string, data: Partial<InsertSovereignPolicy>): Promise<SovereignPolicy | undefined> {
    const [updated] = await db.update(sovereignPolicies)
      .set({ ...data, updatedAt: new Date() })
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
    const [created] = await db.insert(aiBuildSessions).values(session).returning();
    return created;
  }

  async updateAiBuildSession(id: string, data: Partial<InsertAiBuildSession>): Promise<AiBuildSession | undefined> {
    const [updated] = await db.update(aiBuildSessions)
      .set(data)
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
    const [created] = await db.insert(aiBuildTasks).values(task).returning();
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
    const [created] = await db.insert(aiBuildArtifacts).values(artifact).returning();
    return created;
  }

  async updateAiBuildArtifact(id: string, data: Partial<InsertAiBuildArtifact>): Promise<AiBuildArtifact | undefined> {
    const [updated] = await db.update(aiBuildArtifacts)
      .set(data)
      .where(eq(aiBuildArtifacts.id, id))
      .returning();
    return updated || undefined;
  }

  // ============ Cloud Development Projects Implementation ============
  
  async getDevProjects(userId?: string): Promise<DevProject[]> {
    if (userId) {
      return db.select().from(devProjects)
        .where(eq(devProjects.userId, userId))
        .orderBy(desc(devProjects.updatedAt));
    }
    return db.select().from(devProjects).orderBy(desc(devProjects.updatedAt));
  }

  async getDevProject(id: string): Promise<DevProject | undefined> {
    const [project] = await db.select().from(devProjects).where(eq(devProjects.id, id));
    return project || undefined;
  }

  async createDevProject(project: InsertDevProject): Promise<DevProject> {
    const [created] = await db.insert(devProjects).values(project).returning();
    return created;
  }

  async updateDevProject(id: string, data: Partial<InsertDevProject>): Promise<DevProject | undefined> {
    const [updated] = await db.update(devProjects)
      .set({ ...data, updatedAt: new Date() })
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
    const [created] = await db.insert(projectFiles).values(file).returning();
    return created;
  }

  async updateProjectFile(id: string, data: Partial<InsertProjectFile>): Promise<ProjectFile | undefined> {
    const [updated] = await db.update(projectFiles)
      .set({ ...data, updatedAt: new Date() })
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
    const [created] = await db.insert(runtimeInstances).values(instance).returning();
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
    const [created] = await db.insert(consoleLogs).values(log).returning();
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
    const [created] = await db.insert(devDatabaseTables).values(table).returning();
    return created;
  }

  async updateDevDatabaseTable(id: string, data: Partial<InsertDevDatabaseTable>): Promise<DevDatabaseTable | undefined> {
    const [updated] = await db.update(devDatabaseTables)
      .set({ ...data, updatedAt: new Date() })
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
    const [created] = await db.insert(devDatabaseColumns).values(column).returning();
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
    const [created] = await db.insert(devDatabaseRelationships).values(rel).returning();
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
}

export const storage = new DatabaseStorage();
