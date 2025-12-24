import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Loader2,
  Brain,
  Lock,
  Zap,
  Layers
} from "lucide-react";

interface ComplianceDashboardProps {
  platformId: string;
  platformName: string;
  language?: "en" | "ar";
  onValidate?: () => void;
}

interface ComplianceDashboardData {
  current: {
    complianceScore: number;
    decisionStatus: string;
    decisionLabel: { en: string; ar: string; color: string };
    riskIndex: number;
    evolutionReadiness: number;
    categoryScores: Record<string, { score: number; status: string; checkedItems: number; totalItems: number }>;
    aiAnalysis?: {
      summary: string;
      summaryAr: string;
      recommendations: string[];
      riskLevel: string;
      estimatedFixTime: string;
    };
    lastCheckAt: string;
    lastCheckType: string;
    canDeploy: boolean;
  } | null;
  openViolations: Array<{
    id: string;
    title: string;
    titleAr: string;
    severity: string;
    category: string;
    description: string;
    descriptionAr: string;
    detectedAt: string;
  }>;
  history: Array<{
    id: string;
    score: number;
    status: string;
    checkedAt: string;
    checkType: string;
  }>;
  summary: {
    totalChecks: number;
    latestScore: number;
    avgScore: number;
    openViolationCount: number;
    trend: string;
  };
}

const translations = {
  en: {
    complianceDashboard: "Policy Validator AI",
    complianceScore: "Compliance Score",
    riskIndex: "Risk Index",
    evolutionReadiness: "Evolution Readiness",
    decisionStatus: "Decision Status",
    approved: "Approved",
    conditional: "Conditional",
    rejected: "Rejected",
    blocked: "Blocked",
    pending: "Pending",
    runValidation: "Run Validation",
    validating: "Validating...",
    noData: "No compliance data available",
    runFirst: "Run validation to check compliance",
    openViolations: "Open Violations",
    categoryBreakdown: "Category Breakdown",
    architecture: "Architecture",
    aiIntelligence: "AI Intelligence",
    cyberSecurity: "Cyber Security",
    dynamics: "Dynamics",
    policyCoverage: "Policy Coverage",
    aiAnalysis: "AI Analysis",
    recommendations: "Recommendations",
    trend: "Trend",
    improving: "Improving",
    declining: "Declining",
    stable: "Stable",
    canDeploy: "Ready for Deployment",
    cannotDeploy: "Deployment Blocked",
    lastCheck: "Last Check",
    fixRequired: "Fix Required",
    estimatedTime: "Estimated Fix Time",
  },
  ar: {
    complianceDashboard: "مدقق السياسات الذكي",
    complianceScore: "درجة الامتثال",
    riskIndex: "مؤشر المخاطر",
    evolutionReadiness: "جاهزية التطور",
    decisionStatus: "حالة القرار",
    approved: "معتمد",
    conditional: "مشروط",
    rejected: "مرفوض",
    blocked: "محظور",
    pending: "قيد الانتظار",
    runValidation: "تشغيل التحقق",
    validating: "جاري التحقق...",
    noData: "لا توجد بيانات امتثال",
    runFirst: "قم بتشغيل التحقق لفحص الامتثال",
    openViolations: "المخالفات المفتوحة",
    categoryBreakdown: "تفصيل الفئات",
    architecture: "البنية",
    aiIntelligence: "الذكاء الاصطناعي",
    cyberSecurity: "الأمن السيبراني",
    dynamics: "الديناميكية",
    policyCoverage: "تغطية السياسات",
    aiAnalysis: "تحليل الذكاء الاصطناعي",
    recommendations: "التوصيات",
    trend: "الاتجاه",
    improving: "تحسن",
    declining: "تراجع",
    stable: "مستقر",
    canDeploy: "جاهز للنشر",
    cannotDeploy: "النشر محظور",
    lastCheck: "آخر فحص",
    fixRequired: "يتطلب الإصلاح",
    estimatedTime: "الوقت المقدر للإصلاح",
  },
};

function getDecisionIcon(status: string) {
  switch (status) {
    case "approved": return <ShieldCheck className="h-6 w-6 text-green-500" />;
    case "conditional": return <Shield className="h-6 w-6 text-yellow-500" />;
    case "rejected": return <ShieldAlert className="h-6 w-6 text-orange-500" />;
    case "blocked": return <ShieldX className="h-6 w-6 text-red-500" />;
    default: return <Clock className="h-6 w-6 text-muted-foreground" />;
  }
}

function getDecisionColor(status: string) {
  switch (status) {
    case "approved": return "bg-green-500/10 text-green-600 border-green-500/20";
    case "conditional": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
    case "rejected": return "bg-orange-500/10 text-orange-600 border-orange-500/20";
    case "blocked": return "bg-red-500/10 text-red-600 border-red-500/20";
    default: return "bg-muted text-muted-foreground";
  }
}

function getSeverityBadge(severity: string) {
  switch (severity) {
    case "critical": return <Badge variant="destructive">Critical</Badge>;
    case "high": return <Badge className="bg-orange-500 text-white">High</Badge>;
    case "medium": return <Badge className="bg-yellow-500 text-black">Medium</Badge>;
    case "low": return <Badge variant="secondary">Low</Badge>;
    default: return <Badge variant="outline">{severity}</Badge>;
  }
}

function getCategoryIcon(category: string) {
  switch (category) {
    case "architecture": return <Layers className="h-4 w-4" />;
    case "aiIntelligence": return <Brain className="h-4 w-4" />;
    case "cyberSecurity": return <Lock className="h-4 w-4" />;
    case "dynamics": return <Zap className="h-4 w-4" />;
    case "policyCoverage": return <Shield className="h-4 w-4" />;
    default: return <CheckCircle2 className="h-4 w-4" />;
  }
}

export function ComplianceDashboard({ platformId, platformName, language = "en", onValidate }: ComplianceDashboardProps) {
  const t = translations[language];
  const isRTL = language === "ar";

  const { data, isLoading, refetch } = useQuery<ComplianceDashboardData>({
    queryKey: ["/api/sovereign-workspace/policies/compliance-dashboard", platformId],
    enabled: !!platformId,
  });

  const validateMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/sovereign-workspace/policies/validate-platform`, {
        platformId,
        platformName,
        context: {},
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sovereign-workspace/policies/compliance-dashboard", platformId] });
      onValidate?.();
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const current = data?.current;
  const violations = data?.openViolations || [];
  const summary = data?.summary;

  return (
    <div className={`space-y-4 ${isRTL ? "text-right" : "text-left"}`} dir={isRTL ? "rtl" : "ltr"}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-primary" />
            <div>
              <CardTitle data-testid="text-dashboard-title">{t.complianceDashboard}</CardTitle>
              <CardDescription>{platformName}</CardDescription>
            </div>
          </div>
          <Button
            onClick={() => validateMutation.mutate()}
            disabled={validateMutation.isPending}
            data-testid="button-run-validation"
          >
            {validateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="mx-2">{t.validating}</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                <span className="mx-2">{t.runValidation}</span>
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent>
          {!current ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShieldAlert className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">{t.noData}</p>
              <p className="text-sm">{t.runFirst}</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className={`${getDecisionColor(current.decisionStatus)} border`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium opacity-80">{t.decisionStatus}</p>
                        <p className="text-2xl font-bold" data-testid="text-decision-status">
                          {current.decisionLabel[language]}
                        </p>
                      </div>
                      {getDecisionIcon(current.decisionStatus)}
                    </div>
                    <div className="mt-2">
                      {current.canDeploy ? (
                        <Badge variant="outline" className="gap-1 border-green-500 text-green-600">
                          <CheckCircle2 className="h-3 w-3" />
                          {t.canDeploy}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 border-red-500 text-red-600">
                          <XCircle className="h-3 w-3" />
                          {t.cannotDeploy}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">{t.complianceScore}</p>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold" data-testid="text-compliance-score">
                        {current.complianceScore}
                      </span>
                      <span className="text-muted-foreground mb-1">/ 100</span>
                    </div>
                    <Progress value={current.complianceScore} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">{t.riskIndex}</p>
                    <div className="flex items-end gap-2">
                      <span className={`text-3xl font-bold ${current.riskIndex > 50 ? "text-red-500" : current.riskIndex > 25 ? "text-yellow-500" : "text-green-500"}`} data-testid="text-risk-index">
                        {current.riskIndex}
                      </span>
                      <span className="text-muted-foreground mb-1">/ 100</span>
                    </div>
                    <Progress 
                      value={current.riskIndex} 
                      className={`mt-2 ${current.riskIndex > 50 ? "[&>div]:bg-red-500" : current.riskIndex > 25 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-green-500"}`} 
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">{t.evolutionReadiness}</p>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold text-primary" data-testid="text-evolution-readiness">
                        {current.evolutionReadiness}
                      </span>
                      <span className="text-muted-foreground mb-1">/ 100</span>
                    </div>
                    <Progress value={current.evolutionReadiness} className="mt-2" />
                  </CardContent>
                </Card>
              </div>

              {current.categoryScores && Object.keys(current.categoryScores).length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3">{t.categoryBreakdown}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      {Object.entries(current.categoryScores).map(([key, value]) => (
                        <Card key={key} className="overflow-visible">
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                              {getCategoryIcon(key)}
                              <span className="text-sm font-medium capitalize">
                                {t[key as keyof typeof t] || key.replace(/([A-Z])/g, " $1").trim()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-bold">{value.score}%</span>
                              <span className="text-xs text-muted-foreground">
                                {value.checkedItems}/{value.totalItems}
                              </span>
                            </div>
                            <Progress value={value.score} className="mt-2 h-1" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {current.aiAnalysis && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      {t.aiAnalysis}
                    </h3>
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <p className="text-sm">
                          {language === "ar" ? current.aiAnalysis.summaryAr : current.aiAnalysis.summary}
                        </p>
                        {current.aiAnalysis.recommendations.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">{t.recommendations}:</p>
                            <ul className="space-y-1">
                              {current.aiAnalysis.recommendations.slice(0, 3).map((rec, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-primary">•</span>
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{t.estimatedTime}: {current.aiAnalysis.estimatedFixTime}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}

              {violations.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      {t.openViolations} ({violations.length})
                    </h3>
                    <div className="space-y-2">
                      {violations.slice(0, 5).map((v) => (
                        <Card key={v.id} className="overflow-visible">
                          <CardContent className="p-3 flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                {getSeverityBadge(v.severity)}
                                <span className="font-medium">
                                  {language === "ar" ? v.titleAr : v.title}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {language === "ar" ? v.descriptionAr : v.description}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {summary && (
                <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
                  <span>
                    {t.lastCheck}: {current.lastCheckAt ? new Date(current.lastCheckAt).toLocaleString() : "N/A"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span>{t.trend}:</span>
                    {summary.trend === "improving" && (
                      <span className="flex items-center text-green-500">
                        <TrendingUp className="h-4 w-4" /> {t.improving}
                      </span>
                    )}
                    {summary.trend === "declining" && (
                      <span className="flex items-center text-red-500">
                        <TrendingDown className="h-4 w-4" /> {t.declining}
                      </span>
                    )}
                    {summary.trend === "stable" && (
                      <span className="flex items-center">
                        <Minus className="h-4 w-4" /> {t.stable}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ComplianceDashboard;
