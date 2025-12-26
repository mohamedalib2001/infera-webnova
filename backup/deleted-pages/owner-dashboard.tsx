import { useState, lazy, Suspense } from "react";
import { useLanguage } from "@/hooks/use-language";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw } from "lucide-react";
import type { SovereignAssistant } from "@shared/schema";

import { useDashboardData, useDashboardStats, useDashboardMutations } from "@/hooks/owner-dashboard";
import {
  DashboardHeader,
  QuickStatsCards,
  EmergencyControlsSection,
  SovereignAssistantsSection,
  RecentActivitySection,
  CommandQueueSection,
  GovernanceSection,
  UsageAnalyticsSection,
  PaymentsSection,
  AuthMethodsSection,
  UsersSection,
  dashboardTranslations,
} from "@/components/owner-dashboard";

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function OwnerDashboard() {
  const { language } = useLanguage();
  const t = dashboardTranslations[language];
  const [activeTab, setActiveTab] = useState("sovereign");

  const {
    users,
    usersLoading,
    paymentMethods,
    paymentMethodsLoading,
    authMethods,
    authMethodsLoading,
    sovereignAssistants,
    sovereignAssistantsLoading,
    sovereignCommands,
    sovereignLogs,
    platformState,
    emergencyControls,
    emergencyControlsLoading,
    aiCostAnalytics,
    aiGlobalKillSwitch,
  } = useDashboardData();

  const stats = useDashboardStats(users, paymentMethods, authMethods);
  const mutations = useDashboardMutations(language);

  const handleIssueCommand = (assistant: SovereignAssistant) => {
    console.log("Issue command to:", assistant.name);
  };

  return (
    <div className="min-h-screen bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <DashboardHeader 
          t={t} 
          language={language} 
          platformState={platformState}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <ScrollArea className="w-full">
            <TabsList className="inline-flex w-auto min-w-full gap-1 p-1" data-testid="dashboard-tabs">
              <TabsTrigger value="sovereign" data-testid="tab-sovereign">
                {t.tabs.sovereign}
              </TabsTrigger>
              <TabsTrigger value="aiSovereignty" data-testid="tab-ai-sovereignty">
                {t.tabs.aiSovereignty}
              </TabsTrigger>
              <TabsTrigger value="users" data-testid="tab-users">
                {t.tabs.users}
              </TabsTrigger>
              <TabsTrigger value="payments" data-testid="tab-payments">
                {t.tabs.payments}
              </TabsTrigger>
              <TabsTrigger value="auth" data-testid="tab-auth">
                {t.tabs.auth}
              </TabsTrigger>
              <TabsTrigger value="analytics" data-testid="tab-analytics">
                {t.tabs.analytics}
              </TabsTrigger>
            </TabsList>
          </ScrollArea>

          <TabsContent value="sovereign" className="space-y-6">
            <QuickStatsCards
              t={t}
              language={language}
              aiCostAnalytics={aiCostAnalytics}
              aiGlobalKillSwitch={aiGlobalKillSwitch}
              onToggleKillSwitch={() => mutations.toggleAIGlobalKillSwitch.mutate()}
              killSwitchPending={mutations.toggleAIGlobalKillSwitch.isPending}
            />

            <EmergencyControlsSection
              t={t}
              language={language}
              emergencyControls={emergencyControls}
              onActivateEmergency={() => mutations.activateEmergency.mutate()}
              onDeactivateEmergency={(id) => mutations.deactivateEmergency.mutate(id)}
              activatePending={mutations.activateEmergency.isPending}
              deactivatePending={mutations.deactivateEmergency.isPending}
            />

            <SovereignAssistantsSection
              t={t}
              language={language}
              sovereignAssistants={sovereignAssistants}
              isLoading={sovereignAssistantsLoading}
              onInitialize={() => mutations.initializeSovereignAssistants.mutate()}
              onToggleActive={(id, isActive) => mutations.toggleSovereignActive.mutate({ id, isActive })}
              onToggleAutonomy={(id, isAutonomous) => mutations.toggleSovereignAutonomy.mutate({ id, isAutonomous })}
              onIssueCommand={handleIssueCommand}
              onKillSwitch={(id) => mutations.killSwitchSovereign.mutate(id)}
              initializePending={mutations.initializeSovereignAssistants.isPending}
              killSwitchPending={mutations.killSwitchSovereign.isPending}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CommandQueueSection
                t={t}
                language={language}
                commands={sovereignCommands}
                onApprove={(id) => mutations.approveCommand.mutate(id)}
                onCancel={(id) => mutations.cancelCommand.mutate(id)}
                onRollback={(id) => mutations.rollbackCommand.mutate(id)}
              />
              <RecentActivitySection
                t={t}
                language={language}
                logs={sovereignLogs}
              />
            </div>
          </TabsContent>

          <TabsContent value="aiSovereignty" className="space-y-6">
            <Suspense fallback={<LoadingSpinner />}>
              <GovernanceSection t={t} language={language} />
            </Suspense>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Suspense fallback={<LoadingSpinner />}>
              <UsersSection
                t={t}
                language={language}
                users={users}
                stats={stats}
                isLoading={usersLoading}
                onSuspend={(id, reason) => mutations.suspendUser.mutate({ id, reason })}
                onBan={(id, reason) => mutations.banUser.mutate({ id, reason })}
                onReactivate={(id) => mutations.reactivateUser.mutate(id)}
                suspendPending={mutations.suspendUser.isPending}
                banPending={mutations.banUser.isPending}
                reactivatePending={mutations.reactivateUser.isPending}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Suspense fallback={<LoadingSpinner />}>
              <PaymentsSection
                t={t}
                language={language}
                paymentMethods={paymentMethods}
                isLoading={paymentMethodsLoading}
                onInitialize={() => mutations.initializePaymentMethods.mutate()}
                onToggleActive={(id, isActive) => mutations.togglePaymentMethod.mutate({ id, isActive })}
                initializePending={mutations.initializePaymentMethods.isPending}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="auth" className="space-y-6">
            <Suspense fallback={<LoadingSpinner />}>
              <AuthMethodsSection
                t={t}
                language={language}
                authMethods={authMethods}
                isLoading={authMethodsLoading}
                onInitialize={() => mutations.initializeAuthMethods.mutate()}
                onToggleActive={(id, isActive) => mutations.toggleAuthMethod.mutate({ id, isActive })}
                onToggleVisibility={(id, isVisible) => mutations.toggleAuthMethodVisibility.mutate({ id, isVisible })}
                initializePending={mutations.initializeAuthMethods.isPending}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Suspense fallback={<LoadingSpinner />}>
              <UsageAnalyticsSection t={t} language={language} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
