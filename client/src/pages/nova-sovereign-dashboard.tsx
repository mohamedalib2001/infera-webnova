/**
 * INFERA WebNova - Nova AI Sovereign Dashboard
 * لوحة التحكم السيادية لنوفا
 * 
 * "Sovereign Decision Governor - Not Just an Assistant"
 * "حاكم القرارات السيادي - ليس مجرد مساعد"
 */

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Crown, Shield, Brain, AlertTriangle, CheckCircle, Clock,
  Activity, Zap, Lock, Eye, Target, FileCheck, Scale,
  Network, Cpu, Database, RefreshCw, XCircle
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { OwnerLayout, OwnerDashboardHeader } from "@/components/owner-layout";

interface DashboardSummary {
  totalDecisions: number;
  pendingApprovals: number;
  criticalDecisions: number;
  activePolicies: number;
  approvalChains: number;
  killSwitchActive: boolean;
  recentDecisions: Array<{
    id: string;
    type: string;
    title: string;
    titleAr: string;
    phase: string;
    riskLevel: string;
    createdAt: string;
  }>;
}

interface ComplianceDashboard {
  totalFrameworks: number;
  certifiedFrameworks: number;
  averageComplianceScore: number;
  totalControls: number;
  compliantControls: number;
  nonCompliantControls: number;
  partialControls: number;
  expiringCertifications: number;
  frameworksSummary: Array<{
    id: string;
    framework: string;
    name: string;
    status: string;
    score: number;
    certified: boolean;
  }>;
}

export default function NovaSovereignDashboard() {
  const { isRtl } = useLanguage();

  const { data: dashboardData, isLoading: isDashboardLoading, refetch: refetchDashboard } = useQuery<{
    success: boolean;
    data: DashboardSummary;
  }>({
    queryKey: ['/api/nova-sovereign/dashboard/summary'],
  });

  const { data: complianceData, isLoading: isComplianceLoading, refetch: refetchCompliance } = useQuery<{
    success: boolean;
    data: ComplianceDashboard;
  }>({
    queryKey: ['/api/nova-sovereign/compliance/dashboard'],
  });

  const { data: killSwitchData, isLoading: isKillSwitchLoading } = useQuery<{
    success: boolean;
    data: Array<{
      id: string;
      scope: string;
      triggeredBy: string;
      triggeredAt: string;
    }>;
  }>({
    queryKey: ['/api/nova-sovereign/kill-switch/status'],
  });

  const dashboard = dashboardData?.data;
  const compliance = complianceData?.data;
  const killSwitches = killSwitchData?.data || [];

  const handleRefresh = () => {
    refetchDashboard();
    refetchCompliance();
  };

  const getRiskBadge = (level: string) => {
    const colors: Record<string, string> = {
      low: "bg-green-500/20 text-green-400",
      medium: "bg-yellow-500/20 text-yellow-400",
      high: "bg-orange-500/20 text-orange-400",
      critical: "bg-red-500/20 text-red-400",
      sovereign: "bg-purple-500/20 text-purple-400",
    };
    return colors[level] || "bg-muted text-muted-foreground";
  };

  const getPhaseBadge = (phase: string) => {
    const colors: Record<string, string> = {
      analysis: "bg-blue-500/20 text-blue-400",
      decision: "bg-violet-500/20 text-violet-400",
      pending_approval: "bg-amber-500/20 text-amber-400",
      approved: "bg-green-500/20 text-green-400",
      rejected: "bg-red-500/20 text-red-400",
      execution: "bg-cyan-500/20 text-cyan-400",
      completed: "bg-emerald-500/20 text-emerald-400",
    };
    return colors[phase] || "bg-muted text-muted-foreground";
  };

  const isLoading = isDashboardLoading || isComplianceLoading;

  return (
    <OwnerLayout>
      <OwnerDashboardHeader
        title="Nova Sovereign Dashboard"
        titleAr="لوحة التحكم السيادية لنوفا"
        description="AI Decision Governor - Full Sovereignty & Traceability"
        descriptionAr="حاكم القرارات الذكية - السيادة الكاملة والتتبع"
        icon={Crown}
      />

      <div className="p-6 space-y-6">
        <div className={`flex ${isRtl ? 'flex-row-reverse' : 'flex-row'} items-center justify-between gap-4`}>
          <div className={`flex ${isRtl ? 'flex-row-reverse' : 'flex-row'} items-center gap-2`}>
            <Brain className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">
              {isRtl ? 'آخر تحديث: الآن' : 'Last Updated: Now'}
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
            data-testid="button-refresh-dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${isRtl ? 'ml-2' : 'mr-2'} ${isLoading ? 'animate-spin' : ''}`} />
            {isRtl ? 'تحديث' : 'Refresh'}
          </Button>
        </div>

        {killSwitches.length > 0 && (
          <Card className="border-red-500/50 bg-red-500/10">
            <CardContent className="p-4">
              <div className={`flex ${isRtl ? 'flex-row-reverse' : 'flex-row'} items-center gap-3`}>
                <XCircle className="w-6 h-6 text-red-500" />
                <div>
                  <h3 className="font-semibold text-red-500">
                    {isRtl ? 'مفتاح الإيقاف الطارئ مفعّل' : 'Emergency Kill Switch Active'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isRtl 
                      ? `${killSwitches.length} نطاق متأثر - تم الإيقاف بواسطة ${killSwitches[0]?.triggeredBy}`
                      : `${killSwitches.length} scope(s) affected - Triggered by ${killSwitches[0]?.triggeredBy}`
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card data-testid="stat-total-decisions">
            <CardContent className="p-4">
              <div className={`flex ${isRtl ? 'flex-row-reverse' : 'flex-row'} items-center justify-between gap-4`}>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isRtl ? 'إجمالي القرارات' : 'Total Decisions'}
                  </p>
                  <p className="text-2xl font-bold">{dashboard?.totalDecisions || 0}</p>
                </div>
                <Brain className="w-8 h-8 text-primary opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-pending-approvals">
            <CardContent className="p-4">
              <div className={`flex ${isRtl ? 'flex-row-reverse' : 'flex-row'} items-center justify-between gap-4`}>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isRtl ? 'بانتظار الموافقة' : 'Pending Approvals'}
                  </p>
                  <p className="text-2xl font-bold text-amber-500">{dashboard?.pendingApprovals || 0}</p>
                </div>
                <Clock className="w-8 h-8 text-amber-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-critical-decisions">
            <CardContent className="p-4">
              <div className={`flex ${isRtl ? 'flex-row-reverse' : 'flex-row'} items-center justify-between gap-4`}>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isRtl ? 'قرارات حرجة' : 'Critical Decisions'}
                  </p>
                  <p className="text-2xl font-bold text-red-500">{dashboard?.criticalDecisions || 0}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-compliance-score">
            <CardContent className="p-4">
              <div className={`flex ${isRtl ? 'flex-row-reverse' : 'flex-row'} items-center justify-between gap-4`}>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isRtl ? 'درجة الامتثال' : 'Compliance Score'}
                  </p>
                  <p className="text-2xl font-bold text-green-500">{compliance?.averageComplianceScore || 0}%</p>
                </div>
                <Shield className="w-8 h-8 text-green-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="decisions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="decisions" data-testid="tab-decisions">
              {isRtl ? 'القرارات' : 'Decisions'}
            </TabsTrigger>
            <TabsTrigger value="compliance" data-testid="tab-compliance">
              {isRtl ? 'الامتثال' : 'Compliance'}
            </TabsTrigger>
            <TabsTrigger value="governance" data-testid="tab-governance">
              {isRtl ? 'الحوكمة' : 'Governance'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="decisions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className={`flex ${isRtl ? 'flex-row-reverse' : 'flex-row'} items-center gap-2`}>
                  <Brain className="w-5 h-5" />
                  {isRtl ? 'آخر القرارات السيادية' : 'Recent Sovereign Decisions'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {dashboard?.recentDecisions?.length ? (
                    <div className="space-y-3">
                      {dashboard.recentDecisions.map((decision) => (
                        <div
                          key={decision.id}
                          className={`p-3 rounded-lg border bg-card hover-elevate ${isRtl ? 'text-right' : 'text-left'}`}
                          data-testid={`decision-item-${decision.id}`}
                        >
                          <div className={`flex ${isRtl ? 'flex-row-reverse' : 'flex-row'} items-start justify-between gap-2`}>
                            <div>
                              <h4 className="font-medium">
                                {isRtl ? decision.titleAr : decision.title}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                ID: {decision.id}
                              </p>
                            </div>
                            <div className={`flex ${isRtl ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
                              <Badge className={getRiskBadge(decision.riskLevel)} variant="secondary">
                                {decision.riskLevel}
                              </Badge>
                              <Badge className={getPhaseBadge(decision.phase)} variant="secondary">
                                {decision.phase}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      {isRtl ? 'لا توجد قرارات حتى الآن' : 'No decisions yet'}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className={`flex ${isRtl ? 'flex-row-reverse' : 'flex-row'} items-center gap-3`}>
                    <FileCheck className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {isRtl ? 'أطر الامتثال' : 'Frameworks'}
                      </p>
                      <p className="text-xl font-bold">{compliance?.totalFrameworks || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className={`flex ${isRtl ? 'flex-row-reverse' : 'flex-row'} items-center gap-3`}>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {isRtl ? 'معتمدة' : 'Certified'}
                      </p>
                      <p className="text-xl font-bold text-green-500">{compliance?.certifiedFrameworks || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className={`flex ${isRtl ? 'flex-row-reverse' : 'flex-row'} items-center gap-3`}>
                    <AlertTriangle className="w-8 h-8 text-amber-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {isRtl ? 'تنتهي قريباً' : 'Expiring Soon'}
                      </p>
                      <p className="text-xl font-bold text-amber-500">{compliance?.expiringCertifications || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className={`flex ${isRtl ? 'flex-row-reverse' : 'flex-row'} items-center gap-2`}>
                  <Scale className="w-5 h-5" />
                  {isRtl ? 'حالة الضوابط' : 'Controls Status'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className={`flex ${isRtl ? 'flex-row-reverse' : 'flex-row'} items-center justify-between gap-4`}>
                    <span className="text-sm">{isRtl ? 'ممتثل' : 'Compliant'}</span>
                    <div className="flex-1 mx-4">
                      <Progress 
                        value={compliance?.totalControls 
                          ? (compliance.compliantControls / compliance.totalControls) * 100 
                          : 0
                        } 
                        className="h-2"
                      />
                    </div>
                    <span className="text-sm font-medium text-green-500">
                      {compliance?.compliantControls || 0}
                    </span>
                  </div>

                  <div className={`flex ${isRtl ? 'flex-row-reverse' : 'flex-row'} items-center justify-between gap-4`}>
                    <span className="text-sm">{isRtl ? 'جزئي' : 'Partial'}</span>
                    <div className="flex-1 mx-4">
                      <Progress 
                        value={compliance?.totalControls 
                          ? (compliance.partialControls / compliance.totalControls) * 100 
                          : 0
                        } 
                        className="h-2"
                      />
                    </div>
                    <span className="text-sm font-medium text-amber-500">
                      {compliance?.partialControls || 0}
                    </span>
                  </div>

                  <div className={`flex ${isRtl ? 'flex-row-reverse' : 'flex-row'} items-center justify-between gap-4`}>
                    <span className="text-sm">{isRtl ? 'غير ممتثل' : 'Non-Compliant'}</span>
                    <div className="flex-1 mx-4">
                      <Progress 
                        value={compliance?.totalControls 
                          ? (compliance.nonCompliantControls / compliance.totalControls) * 100 
                          : 0
                        } 
                        className="h-2"
                      />
                    </div>
                    <span className="text-sm font-medium text-red-500">
                      {compliance?.nonCompliantControls || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="governance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className={`flex ${isRtl ? 'flex-row-reverse' : 'flex-row'} items-center gap-2`}>
                    <Network className="w-5 h-5" />
                    {isRtl ? 'سلاسل الموافقة' : 'Approval Chains'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <p className="text-3xl font-bold">{dashboard?.approvalChains || 0}</p>
                    <p className="text-sm text-muted-foreground">
                      {isRtl ? 'سلسلة موافقة نشطة' : 'Active Approval Chains'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className={`flex ${isRtl ? 'flex-row-reverse' : 'flex-row'} items-center gap-2`}>
                    <Lock className="w-5 h-5" />
                    {isRtl ? 'السياسات النشطة' : 'Active Policies'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <p className="text-3xl font-bold">{dashboard?.activePolicies || 0}</p>
                    <p className="text-sm text-muted-foreground">
                      {isRtl ? 'سياسة حوكمة نشطة' : 'Active Governance Policies'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className={`flex ${isRtl ? 'flex-row-reverse' : 'flex-row'} items-center gap-2`}>
                  <Eye className="w-5 h-5" />
                  {isRtl ? 'مبادئ الحوكمة السيادية' : 'Sovereign Governance Principles'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg bg-muted/50 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <div className={`flex ${isRtl ? 'flex-row-reverse' : 'flex-row'} items-center gap-2 mb-2`}>
                      <Target className="w-4 h-4 text-primary" />
                      <span className="font-medium">
                        {isRtl ? 'التحليل → القرار → التنفيذ' : 'Analysis → Decision → Execution'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {isRtl 
                        ? 'فصل صارم بين مراحل القرار'
                        : 'Strict separation between decision phases'
                      }
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg bg-muted/50 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <div className={`flex ${isRtl ? 'flex-row-reverse' : 'flex-row'} items-center gap-2 mb-2`}>
                      <Crown className="w-4 h-4 text-amber-500" />
                      <span className="font-medium">
                        {isRtl ? 'سلطة المالك المطلقة' : 'Owner Root Authority'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {isRtl 
                        ? 'المالك لديه السيطرة الكاملة'
                        : 'Owner has absolute control'
                      }
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg bg-muted/50 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <div className={`flex ${isRtl ? 'flex-row-reverse' : 'flex-row'} items-center gap-2 mb-2`}>
                      <Activity className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">
                        {isRtl ? 'التتبع الكامل' : 'Full Traceability'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {isRtl 
                        ? 'لماذا، كيف، من، متى'
                        : 'WHY, HOW, WHO, WHEN'
                      }
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg bg-muted/50 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <div className={`flex ${isRtl ? 'flex-row-reverse' : 'flex-row'} items-center gap-2 mb-2`}>
                      <Zap className="w-4 h-4 text-red-500" />
                      <span className="font-medium">
                        {isRtl ? 'مفتاح الإيقاف الطارئ' : 'Emergency Kill Switch'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {isRtl 
                        ? 'إيقاف فوري لأي عملية'
                        : 'Immediate halt of any operation'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </OwnerLayout>
  );
}
