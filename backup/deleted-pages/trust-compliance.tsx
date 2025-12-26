import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, Scale, AlertTriangle, CheckCircle2, XCircle,
  Clock, Eye, FileText, Activity, TrendingUp, TrendingDown,
  BarChart3, PieChart, Lock, Fingerprint, Key, ShieldCheck,
  ShieldAlert, AlertOctagon, Radio, Crown, Gauge, Target,
  Loader2, RefreshCw, Play
} from "lucide-react";

interface RiskAssessment {
  id: string;
  category: string;
  categoryAr: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  issues: number;
  lastUpdated: string;
}

interface ComplianceFramework {
  id: string;
  name: string;
  nameAr: string;
  code: string;
  score: number;
  status: 'compliant' | 'partial' | 'non_compliant';
  requirements: number;
  passed: number;
  failed: number;
  isCertified: boolean;
}

interface Risk {
  id: string;
  title: string;
  titleAr: string;
  category: string;
  severity: string;
  status: string;
  riskScore: number;
  remediation: string;
  remediationAr: string;
}

interface DashboardData {
  summary: {
    trustScore: number;
    complianceScore: number;
    activeIssues: number;
    criticalIssues: number;
    frameworksCount: number;
    certifiedCount: number;
  };
  riskAssessments: RiskAssessment[];
  frameworks: ComplianceFramework[];
  risks: Risk[];
}

export default function TrustCompliance() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: dashboard, isLoading, error, refetch } = useQuery<DashboardData>({
    queryKey: ['/api/trust/dashboard']
  });

  const resolveRiskMutation = useMutation({
    mutationFn: async (riskId: string) => {
      return apiRequest('POST', `/api/trust/risks/${riskId}/resolve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trust/dashboard'] });
      toast({
        title: language === "ar" ? "تم معالجة المخاطر" : "Risk Resolved",
        description: language === "ar" ? "تم تحديث حالة المخاطر بنجاح" : "Risk status updated successfully"
      });
    },
    onError: () => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "فشل في معالجة المخاطر" : "Failed to resolve risk",
        variant: "destructive"
      });
    }
  });

  const runScanMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/trust/scan');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trust/dashboard'] });
      toast({
        title: language === "ar" ? "اكتمل الفحص" : "Scan Completed",
        description: language === "ar" ? "تم تحديث مقاييس الثقة" : "Trust metrics updated"
      });
    },
    onError: () => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "فشل في تشغيل الفحص" : "Failed to run scan",
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">{language === "ar" ? "جاري تحميل بيانات الثقة والامتثال..." : "Loading trust & compliance data..."}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-white mb-4">{language === "ar" ? "فشل في تحميل البيانات" : "Failed to load data"}</p>
          <Button onClick={() => refetch()} variant="outline" data-testid="button-retry-load">
            <RefreshCw className="w-4 h-4 mr-2" />
            {language === "ar" ? "إعادة المحاولة" : "Retry"}
          </Button>
        </div>
      </div>
    );
  }

  const { summary, riskAssessments, frameworks, risks } = dashboard || { 
    summary: { trustScore: 0, complianceScore: 0, activeIssues: 0, criticalIssues: 0, frameworksCount: 0, certifiedCount: 0 },
    riskAssessments: [],
    frameworks: [],
    risks: []
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      security: { en: "Security", ar: "الأمان" },
      data_privacy: { en: "Data Privacy", ar: "خصوصية البيانات" },
      access_control: { en: "Access Control", ar: "التحكم في الوصول" },
      infrastructure: { en: "Infrastructure", ar: "البنية التحتية" },
      api_security: { en: "API Security", ar: "أمان API" }
    };
    return language === "ar" ? (labels[category]?.ar || category) : (labels[category]?.en || category);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="flex flex-col h-screen">
        <header className="px-6 py-4 border-b border-slate-800/50 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/30">
                <Scale className="w-7 h-7 text-emerald-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white" data-testid="text-trust-compliance-title">
                  {language === "ar" ? "هيئة الثقة والمخاطر والامتثال" : "Trust, Risk & Compliance Authority"}
                </h1>
                <p className="text-sm text-slate-400">
                  {language === "ar" ? "بيانات حقيقية من قاعدة البيانات - تقييم المخاطر ومراقبة الامتثال" : "Real database data - Risk Assessment & Compliance Monitoring"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => runScanMutation.mutate()}
                disabled={runScanMutation.isPending}
                data-testid="button-run-scan"
              >
                {runScanMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                {language === "ar" ? "تشغيل فحص" : "Run Scan"}
              </Button>
              <Badge variant="outline" className={`${summary.trustScore >= 85 ? 'text-emerald-500 border-emerald-500/30' : summary.trustScore >= 70 ? 'text-amber-500 border-amber-500/30' : 'text-red-500 border-red-500/30'}`}>
                <Shield className="w-3 h-3 mr-1" />
                {language === "ar" ? "درجة الثقة" : "Trust Score"}: {summary.trustScore}%
              </Badge>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-4 gap-3 p-4 bg-slate-900/50 border-b border-slate-800/30">
          <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
            <CardContent className="p-3 text-center">
              <Gauge className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-emerald-500" data-testid="text-trust-score">{summary.trustScore}%</p>
              <p className="text-[10px] text-slate-400">{language === "ar" ? "درجة الثقة" : "Trust Score"}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
            <CardContent className="p-3 text-center">
              <Scale className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-blue-500" data-testid="text-compliance-score">{summary.complianceScore}%</p>
              <p className="text-[10px] text-slate-400">{language === "ar" ? "الامتثال" : "Compliance"}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
            <CardContent className="p-3 text-center">
              <AlertTriangle className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-amber-500" data-testid="text-active-issues">{summary.activeIssues}</p>
              <p className="text-[10px] text-slate-400">{language === "ar" ? "مشكلات نشطة" : "Active Issues"}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
            <CardContent className="p-3 text-center">
              <FileText className="w-5 h-5 text-purple-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-purple-500" data-testid="text-frameworks-count">{summary.frameworksCount}</p>
              <p className="text-[10px] text-slate-400">{language === "ar" ? "أطر الامتثال" : "Frameworks"}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 p-6 overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 bg-slate-800/50 border border-slate-700/50">
              <TabsTrigger value="overview" className="text-xs gap-1.5" data-testid="tab-risk-overview">
                <Gauge className="w-3.5 h-3.5" />
                {language === "ar" ? "نظرة عامة" : "Overview"}
              </TabsTrigger>
              <TabsTrigger value="risks" className="text-xs gap-1.5" data-testid="tab-risks">
                <AlertTriangle className="w-3.5 h-3.5" />
                {language === "ar" ? "المخاطر" : "Risks"}
              </TabsTrigger>
              <TabsTrigger value="compliance" className="text-xs gap-1.5" data-testid="tab-compliance-frameworks">
                <Scale className="w-3.5 h-3.5" />
                {language === "ar" ? "الامتثال" : "Compliance"}
              </TabsTrigger>
              <TabsTrigger value="audits" className="text-xs gap-1.5" data-testid="tab-audits">
                <Eye className="w-3.5 h-3.5" />
                {language === "ar" ? "التدقيق" : "Audits"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-0 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <Card className="bg-slate-900/50 border-slate-800/50">
                  <CardHeader>
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-500" />
                      {language === "ar" ? "تقييم المخاطر" : "Risk Assessment"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {riskAssessments.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>{language === "ar" ? "لا توجد بيانات" : "No data available"}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {riskAssessments.map((assessment) => (
                          <div key={assessment.id} className="space-y-2" data-testid={`risk-assessment-${assessment.id}`}>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm text-slate-300">
                                {language === "ar" ? assessment.categoryAr : getCategoryLabel(assessment.category)}
                              </span>
                              <div className="flex items-center gap-2">
                                {assessment.trend === 'up' ? (
                                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                                ) : assessment.trend === 'down' ? (
                                  <TrendingDown className="w-3 h-3 text-red-500" />
                                ) : (
                                  <Activity className="w-3 h-3 text-slate-400" />
                                )}
                                <span className={`text-sm font-bold ${
                                  assessment.score >= 85 ? 'text-emerald-500' : 
                                  assessment.score >= 70 ? 'text-amber-500' : 'text-red-500'
                                }`}>
                                  {assessment.score}%
                                </span>
                                <Badge variant="outline" className="text-[9px] text-slate-400">
                                  {assessment.issues} {language === "ar" ? "مشكلة" : "issues"}
                                </Badge>
                              </div>
                            </div>
                            <Progress value={assessment.score} className="h-2" />
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800/50">
                  <CardHeader>
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <Scale className="w-4 h-4 text-blue-500" />
                      {language === "ar" ? "حالة الامتثال" : "Compliance Status"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {frameworks.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <Scale className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>{language === "ar" ? "لا توجد أطر" : "No frameworks available"}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {frameworks.map((framework) => (
                          <div key={framework.id} className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30" data-testid={`framework-${framework.id}`}>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="text-sm font-medium text-white">
                                {language === "ar" ? framework.nameAr : framework.name}
                              </span>
                              <div className="flex items-center gap-2">
                                {framework.isCertified && (
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                )}
                                <Badge className={`text-[9px] ${
                                  framework.status === 'compliant' ? 'bg-emerald-600' :
                                  framework.status === 'partial' ? 'bg-amber-600' : 'bg-red-600'
                                }`}>
                                  {framework.status === 'compliant' ? (language === "ar" ? "متوافق" : "COMPLIANT") :
                                   framework.status === 'partial' ? (language === "ar" ? "جزئي" : "PARTIAL") :
                                   (language === "ar" ? "غير متوافق" : "NON-COMPLIANT")}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-400">
                              <span className="text-emerald-500">{framework.passed} {language === "ar" ? "ناجح" : "passed"}</span>
                              <span className="text-red-500">{framework.failed} {language === "ar" ? "فاشل" : "failed"}</span>
                              <span>{framework.score}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="risks" className="mt-0">
              <Card className="bg-slate-900/50 border-slate-800/50">
                <CardHeader>
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    {language === "ar" ? "المخاطر المكتشفة" : "Identified Risks"}
                    <Badge variant="outline" className="ml-2 text-xs">
                      {risks.length} {language === "ar" ? "مخاطر نشطة" : "active risks"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {risks.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-emerald-500" />
                      <p className="text-lg font-medium text-white mb-2">
                        {language === "ar" ? "لا توجد مخاطر نشطة" : "No Active Risks"}
                      </p>
                      <p className="text-sm">{language === "ar" ? "جميع المخاطر تم معالجتها" : "All risks have been resolved"}</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3">
                        {risks.map((risk) => (
                          <div 
                            key={risk.id} 
                            className={`p-4 rounded-lg border ${
                              risk.severity === 'critical' ? 'bg-red-500/10 border-red-500/20' :
                              risk.severity === 'high' ? 'bg-orange-500/10 border-orange-500/20' :
                              risk.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-500/20' :
                              'bg-slate-800/30 border-slate-700/30'
                            }`}
                            data-testid={`risk-finding-${risk.id}`}
                          >
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex-1">
                                <span className="text-sm font-medium text-white">
                                  {language === "ar" ? risk.titleAr : risk.title}
                                </span>
                                <p className="text-xs text-slate-400 mt-1">
                                  {language === "ar" ? risk.remediationAr : risk.remediation}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={`text-[9px] ${
                                  risk.severity === 'critical' ? 'text-red-500 border-red-500/30' :
                                  risk.severity === 'high' ? 'text-orange-500 border-orange-500/30' :
                                  risk.severity === 'medium' ? 'text-yellow-500 border-yellow-500/30' :
                                  'text-slate-400 border-slate-600'
                                }`}>
                                  {risk.severity.toUpperCase()}
                                </Badge>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => resolveRiskMutation.mutate(risk.id)}
                                  disabled={resolveRiskMutation.isPending}
                                  data-testid={`button-resolve-risk-${risk.id}`}
                                >
                                  {resolveRiskMutation.isPending ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="w-3 h-3" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="text-[9px] text-slate-400 border-slate-600">
                                {getCategoryLabel(risk.category)}
                              </Badge>
                              <Badge variant="outline" className="text-[9px] text-slate-400 border-slate-600">
                                {language === "ar" ? "درجة المخاطر" : "Risk Score"}: {risk.riskScore}
                              </Badge>
                              <Badge variant="outline" className={`text-[9px] ${
                                risk.status === 'open' ? 'text-red-400 border-red-400/30' :
                                risk.status === 'in_progress' ? 'text-amber-400 border-amber-400/30' :
                                'text-slate-400 border-slate-600'
                              }`}>
                                {risk.status === 'open' ? (language === "ar" ? "مفتوح" : "OPEN") :
                                 risk.status === 'in_progress' ? (language === "ar" ? "قيد المعالجة" : "IN PROGRESS") :
                                 risk.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compliance" className="mt-0">
              {frameworks.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Scale className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{language === "ar" ? "لا توجد أطر امتثال" : "No compliance frameworks"}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  {frameworks.map((framework) => (
                    <Card key={framework.id} className="bg-slate-900/50 border-slate-800/50" data-testid={`framework-card-${framework.id}`}>
                      <CardHeader>
                        <div className="flex items-center justify-between gap-2">
                          <CardTitle className="text-base text-white flex items-center gap-2">
                            {framework.isCertified && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                            {language === "ar" ? framework.nameAr : framework.name}
                          </CardTitle>
                          <Badge className={`${
                            framework.status === 'compliant' ? 'bg-emerald-600' :
                            framework.status === 'partial' ? 'bg-amber-600' : 'bg-red-600'
                          }`}>
                            {framework.score}%
                          </Badge>
                        </div>
                        <CardDescription className="text-slate-400">
                          {framework.code}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <Progress value={framework.score} className="h-3" />
                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="p-2 rounded bg-slate-800/50">
                              <p className="text-lg font-bold text-white">{framework.requirements}</p>
                              <p className="text-[10px] text-slate-400">{language === "ar" ? "المتطلبات" : "Requirements"}</p>
                            </div>
                            <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                              <p className="text-lg font-bold text-emerald-500">{framework.passed}</p>
                              <p className="text-[10px] text-slate-400">{language === "ar" ? "ناجح" : "Passed"}</p>
                            </div>
                            <div className="p-2 rounded bg-red-500/10 border border-red-500/20">
                              <p className="text-lg font-bold text-red-500">{framework.failed}</p>
                              <p className="text-[10px] text-slate-400">{language === "ar" ? "فاشل" : "Failed"}</p>
                            </div>
                          </div>
                          <Button variant="outline" className="w-full border-slate-600" data-testid={`button-view-framework-${framework.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            {language === "ar" ? "عرض التفاصيل" : "View Details"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="audits" className="mt-0">
              <Card className="bg-slate-900/50 border-slate-800/50">
                <CardHeader>
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    <Eye className="w-4 h-4 text-purple-500" />
                    {language === "ar" ? "سجل التدقيق" : "Audit Log"}
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    {language === "ar" ? "سجل حقيقي من قاعدة البيانات" : "Real audit log from database"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-slate-500">
                    <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium text-white mb-2">
                      {language === "ar" ? "سجل التدقيق متصل بنظام المراجعة" : "Audit Log Connected to Review System"}
                    </p>
                    <p className="text-sm">
                      {language === "ar" ? "قم بتشغيل فحص لإنشاء سجلات جديدة" : "Run a scan to generate new audit entries"}
                    </p>
                    <Button 
                      className="mt-4" 
                      onClick={() => runScanMutation.mutate()}
                      disabled={runScanMutation.isPending}
                      data-testid="button-run-audit-scan"
                    >
                      {runScanMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      {language === "ar" ? "تشغيل فحص الأمان" : "Run Security Scan"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
