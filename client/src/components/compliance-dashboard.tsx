import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Layers,
  Target,
  Activity,
  BarChart3,
  Play,
  Pause,
  Calendar,
  AlertOctagon,
  Scale,
  Gauge,
  Timer
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
    weightedScores: {
      aiIntelligence: { score: number; weight: number; weighted: number };
      cyberSecurity: { score: number; weight: number; weighted: number };
      scalability: { score: number; weight: number; weighted: number };
      governance: { score: number; weight: number; weighted: number };
    };
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
    isPlatformLocked: boolean;
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
  forecast: {
    day30: { riskLevel: string; score: number; threats: string[] };
    day90: { riskLevel: string; score: number; threats: string[] };
    day180: { riskLevel: string; score: number; threats: string[] };
    sustainabilityScore: number;
    evolutionForecast: string;
    weaknessAlerts: string[];
  } | null;
  summary: {
    totalChecks: number;
    latestScore: number;
    avgScore: number;
    openViolationCount: number;
    trend: string;
  };
}

interface SimulationResult {
  scenarioName: string;
  predictedScore: number;
  riskEscalation: string;
  timeToFailure: string;
  recommendations: string[];
  impactLevel: string;
}

const translations = {
  en: {
    complianceDashboard: "Policy Validator AI",
    sovereignGovernance: "Sovereign Governance Dashboard",
    complianceScore: "Global Compliance Score",
    riskIndex: "Risk Index",
    evolutionReadiness: "Evolution Readiness",
    decisionStatus: "Decision Status",
    approved: "Sovereign Grade",
    conditional: "Conditional",
    rejected: "At Risk",
    blocked: "Blocked",
    pending: "Pending",
    runValidation: "Run Validation",
    validating: "Validating...",
    noData: "No compliance data available",
    runFirst: "Run validation to check compliance",
    openViolations: "Open Violations",
    categoryBreakdown: "Policy Category Breakdown",
    architecture: "Architecture",
    aiIntelligence: "AI Intelligence",
    cyberSecurity: "Cyber Security",
    dynamics: "Dynamics",
    policyCoverage: "Policy Coverage",
    scalability: "Scalability & Evolution",
    governance: "Governance & Zero-Code",
    aiAnalysis: "AI Analysis",
    recommendations: "Recommendations",
    trend: "Trend",
    improving: "Improving",
    declining: "Declining",
    stable: "Stable",
    canDeploy: "Ready for Deployment",
    cannotDeploy: "Deployment Blocked",
    platformLocked: "Platform Locked",
    lastCheck: "Last Validation",
    fixRequired: "Fix Required",
    estimatedTime: "Estimated Fix Time",
    weightedScoring: "Weighted Scoring",
    weight: "Weight",
    simulationMode: "Violation Simulation",
    strategicForecast: "Strategic Forecast",
    runSimulation: "Run Simulation",
    selectScenario: "Select Scenario",
    predictedScore: "Predicted Score",
    riskEscalation: "Risk Escalation",
    timeToFailure: "Time to Failure",
    impactLevel: "Impact Level",
    day30Outlook: "30-Day Risk Outlook",
    day90Outlook: "90-Day Risk Outlook",
    day180Outlook: "180-Day Risk Outlook",
    sustainabilityScore: "Platform Sustainability",
    evolutionForecast: "Evolution Readiness Forecast",
    weaknessAlerts: "Strategic Weakness Alerts",
    simulateAIRemoval: "Simulate AI Core Removal",
    simulateSecurityBreach: "Simulate Security Breach",
    simulateVendorLock: "Simulate Vendor Lock-in",
    simulateStaticInjection: "Simulate Static Component",
    simulateScaleExplosion: "Simulate 100x Scale",
    simulateCyberAttack: "Simulate Cyber Attack",
    overview: "Overview",
    violations: "Violations",
    simulation: "Simulation",
    forecast: "Forecast",
    colorLegend: "Score Legend",
    sovereignGrade: "95-100: Sovereign Grade",
    conditionalGrade: "85-94: Conditional",
    atRiskGrade: "70-84: At Risk",
    blockedGrade: "<70: Blocked",
  },
  ar: {
    complianceDashboard: "مدقق السياسات الذكي",
    sovereignGovernance: "لوحة الحوكمة السيادية",
    complianceScore: "درجة الامتثال العالمية",
    riskIndex: "مؤشر المخاطر",
    evolutionReadiness: "جاهزية التطور",
    decisionStatus: "حالة القرار",
    approved: "درجة سيادية",
    conditional: "مشروط",
    rejected: "معرض للخطر",
    blocked: "محظور",
    pending: "قيد الانتظار",
    runValidation: "تشغيل التحقق",
    validating: "جاري التحقق...",
    noData: "لا توجد بيانات امتثال",
    runFirst: "قم بتشغيل التحقق لفحص الامتثال",
    openViolations: "المخالفات المفتوحة",
    categoryBreakdown: "تفصيل فئات السياسات",
    architecture: "البنية",
    aiIntelligence: "الذكاء الاصطناعي",
    cyberSecurity: "الأمن السيبراني",
    dynamics: "الديناميكية",
    policyCoverage: "تغطية السياسات",
    scalability: "قابلية التوسع والتطور",
    governance: "الحوكمة و Zero-Code",
    aiAnalysis: "تحليل الذكاء الاصطناعي",
    recommendations: "التوصيات",
    trend: "الاتجاه",
    improving: "تحسن",
    declining: "تراجع",
    stable: "مستقر",
    canDeploy: "جاهز للنشر",
    cannotDeploy: "النشر محظور",
    platformLocked: "المنصة مقفلة",
    lastCheck: "آخر تحقق",
    fixRequired: "يتطلب الإصلاح",
    estimatedTime: "الوقت المقدر للإصلاح",
    weightedScoring: "التقييم الموزون",
    weight: "الوزن",
    simulationMode: "محاكاة الانتهاكات",
    strategicForecast: "التوقعات الاستراتيجية",
    runSimulation: "تشغيل المحاكاة",
    selectScenario: "اختر السيناريو",
    predictedScore: "الدرجة المتوقعة",
    riskEscalation: "تصاعد المخاطر",
    timeToFailure: "الوقت حتى الفشل",
    impactLevel: "مستوى التأثير",
    day30Outlook: "توقعات 30 يوم",
    day90Outlook: "توقعات 90 يوم",
    day180Outlook: "توقعات 180 يوم",
    sustainabilityScore: "استدامة المنصة",
    evolutionForecast: "توقعات جاهزية التطور",
    weaknessAlerts: "تنبيهات نقاط الضعف",
    simulateAIRemoval: "محاكاة إزالة الذكاء الاصطناعي",
    simulateSecurityBreach: "محاكاة اختراق أمني",
    simulateVendorLock: "محاكاة قفل المورد",
    simulateStaticInjection: "محاكاة مكون ثابت",
    simulateScaleExplosion: "محاكاة توسع 100x",
    simulateCyberAttack: "محاكاة هجوم سيبراني",
    overview: "نظرة عامة",
    violations: "المخالفات",
    simulation: "المحاكاة",
    forecast: "التوقعات",
    colorLegend: "دليل الدرجات",
    sovereignGrade: "95-100: درجة سيادية",
    conditionalGrade: "85-94: مشروط",
    atRiskGrade: "70-84: معرض للخطر",
    blockedGrade: "<70: محظور",
  },
};

const simulationScenarios = [
  { id: "ai_removal", icon: Brain, severity: "critical" },
  { id: "security_breach", icon: Lock, severity: "critical" },
  { id: "vendor_lock", icon: AlertOctagon, severity: "high" },
  { id: "static_injection", icon: Layers, severity: "high" },
  { id: "scale_explosion", icon: Activity, severity: "medium" },
  { id: "cyber_attack", icon: ShieldX, severity: "critical" },
];

function getScoreColor(score: number): string {
  if (score >= 95) return "text-green-500";
  if (score >= 85) return "text-yellow-500";
  if (score >= 70) return "text-orange-500";
  return "text-red-500";
}

function getScoreBackground(score: number): string {
  if (score >= 95) return "bg-green-500/10 border-green-500/20";
  if (score >= 85) return "bg-yellow-500/10 border-yellow-500/20";
  if (score >= 70) return "bg-orange-500/10 border-orange-500/20";
  return "bg-red-500/10 border-red-500/20";
}

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
    case "scalability": return <Activity className="h-4 w-4" />;
    case "governance": return <Scale className="h-4 w-4" />;
    default: return <CheckCircle2 className="h-4 w-4" />;
  }
}

export function ComplianceDashboard({ platformId, platformName, language = "en", onValidate }: ComplianceDashboardProps) {
  const t = translations[language];
  const isRTL = language === "ar";
  const [activeTab, setActiveTab] = useState("overview");
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  const { data, isLoading } = useQuery<ComplianceDashboardData>({
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

  const simulateMutation = useMutation({
    mutationFn: async (scenario: string) => {
      return apiRequest("POST", `/api/sovereign-workspace/policies/simulate-violation`, {
        platformId,
        scenario,
      });
    },
    onSuccess: (result: SimulationResult) => {
      setSimulationResult(result);
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
  const forecast = data?.forecast;
  const summary = data?.summary;

  const getScenarioName = (id: string) => {
    switch (id) {
      case "ai_removal": return language === "ar" ? t.simulateAIRemoval : "AI Core Removal";
      case "security_breach": return language === "ar" ? t.simulateSecurityBreach : "Security Breach";
      case "vendor_lock": return language === "ar" ? t.simulateVendorLock : "Vendor Lock-in";
      case "static_injection": return language === "ar" ? t.simulateStaticInjection : "Static Component Injection";
      case "scale_explosion": return language === "ar" ? t.simulateScaleExplosion : "100x Scale Explosion";
      case "cyber_attack": return language === "ar" ? t.simulateCyberAttack : "Cyber Attack";
      default: return id;
    }
  };

  return (
    <div className={`space-y-4 ${isRTL ? "text-right" : "text-left"}`} dir={isRTL ? "rtl" : "ltr"}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-primary/10">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle data-testid="text-dashboard-title">{t.complianceDashboard}</CardTitle>
              <CardDescription>{t.sovereignGovernance} - {platformName}</CardDescription>
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="gap-2" data-testid="tab-overview">
                  <Gauge className="h-4 w-4" />
                  {t.overview}
                </TabsTrigger>
                <TabsTrigger value="violations" className="gap-2" data-testid="tab-violations">
                  <AlertTriangle className="h-4 w-4" />
                  {t.violations}
                  {violations.length > 0 && (
                    <Badge variant="destructive" className="text-xs">{violations.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="simulation" className="gap-2" data-testid="tab-simulation">
                  <Play className="h-4 w-4" />
                  {t.simulation}
                </TabsTrigger>
                <TabsTrigger value="forecast" className="gap-2" data-testid="tab-forecast">
                  <BarChart3 className="h-4 w-4" />
                  {t.forecast}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
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
                      <div className="mt-2 flex flex-wrap gap-1">
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
                        {current.isPlatformLocked && (
                          <Badge variant="destructive" className="gap-1">
                            <Lock className="h-3 w-3" />
                            {t.platformLocked}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={`border ${getScoreBackground(current.complianceScore)}`}>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">{t.complianceScore}</p>
                      <div className="flex items-end gap-2">
                        <span className={`text-3xl font-bold ${getScoreColor(current.complianceScore)}`} data-testid="text-compliance-score">
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

                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      {t.colorLegend}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span>{t.sovereignGrade}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span>{t.conditionalGrade}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500" />
                        <span>{t.atRiskGrade}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span>{t.blockedGrade}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {current.weightedScores && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Scale className="h-4 w-4" />
                        {t.weightedScoring}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        {Object.entries(current.weightedScores).map(([key, value]) => (
                          <Card key={key} className="overflow-visible">
                            <CardContent className="p-3">
                              <div className="flex items-center gap-2 mb-2">
                                {getCategoryIcon(key)}
                                <span className="text-sm font-medium">
                                  {t[key as keyof typeof t] || key}
                                </span>
                              </div>
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-2xl font-bold ${getScoreColor(value.score)}`}>
                                  {value.score}%
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {t.weight}: {value.weight}%
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Weighted: {value.weighted.toFixed(1)}
                              </div>
                              <Progress value={value.score} className="mt-2 h-1" />
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </>
                )}

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
                                <span className={`text-2xl font-bold ${getScoreColor(value.score)}`}>
                                  {value.score}%
                                </span>
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
                                {current.aiAnalysis.recommendations.slice(0, 5).map((rec, i) => (
                                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-primary">•</span>
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Timer className="h-3 w-3" />
                              {t.estimatedTime}: {current.aiAnalysis.estimatedFixTime}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}

                {summary && (
                  <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
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
              </TabsContent>

              <TabsContent value="violations" className="space-y-4">
                {violations.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                      <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                      <p className="font-medium text-green-600">No Open Violations</p>
                      <p className="text-sm text-muted-foreground">Platform is compliant with all policies</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {violations.map((v) => (
                      <Card key={v.id} className="overflow-visible">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                {getSeverityBadge(v.severity)}
                                <Badge variant="outline">{v.category}</Badge>
                                <span className="font-medium">
                                  {language === "ar" ? v.titleAr : v.title}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {language === "ar" ? v.descriptionAr : v.description}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                Detected: {new Date(v.detectedAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="simulation" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Play className="h-5 w-5" />
                      {t.simulationMode}
                    </CardTitle>
                    <CardDescription>
                      {language === "ar" 
                        ? "محاكاة سيناريوهات الانتهاك لتوقع التأثير على درجة الامتثال"
                        : "Simulate violation scenarios to predict impact on compliance score"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {simulationScenarios.map((scenario) => {
                        const Icon = scenario.icon;
                        return (
                          <Button
                            key={scenario.id}
                            variant={selectedScenario === scenario.id ? "default" : "outline"}
                            className="h-auto py-3 flex flex-col items-center gap-2"
                            onClick={() => setSelectedScenario(scenario.id)}
                            data-testid={`button-scenario-${scenario.id}`}
                          >
                            <Icon className="h-5 w-5" />
                            <span className="text-xs text-center">{getScenarioName(scenario.id)}</span>
                            {getSeverityBadge(scenario.severity)}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      className="w-full"
                      disabled={!selectedScenario || simulateMutation.isPending}
                      onClick={() => selectedScenario && simulateMutation.mutate(selectedScenario)}
                      data-testid="button-run-simulation"
                    >
                      {simulateMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="mx-2">Running Simulation...</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          <span className="mx-2">{t.runSimulation}</span>
                        </>
                      )}
                    </Button>

                    {simulationResult && (
                      <Card className="border-2 border-dashed border-yellow-500/50 bg-yellow-500/5">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              Simulation Result: {simulationResult.scenarioName}
                            </h4>
                            <Badge variant="outline" className="gap-1">
                              <Activity className="h-3 w-3" />
                              {simulationResult.impactLevel}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">{t.predictedScore}</p>
                              <p className={`text-2xl font-bold ${getScoreColor(simulationResult.predictedScore)}`}>
                                {simulationResult.predictedScore}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">{t.riskEscalation}</p>
                              <p className="text-lg font-semibold text-orange-500">
                                {simulationResult.riskEscalation}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">{t.timeToFailure}</p>
                              <p className="text-lg font-semibold text-red-500">
                                {simulationResult.timeToFailure}
                              </p>
                            </div>
                          </div>

                          {simulationResult.recommendations.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-1">{t.recommendations}:</p>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {simulationResult.recommendations.map((rec, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <CheckCircle2 className="h-3 w-3 mt-1 text-green-500" />
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="forecast" className="space-y-4">
                {!forecast ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                      <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                      <p className="font-medium">No Forecast Data Available</p>
                      <p className="text-sm text-muted-foreground">Run validation to generate strategic forecast</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{t.day30Outlook}</span>
                          </div>
                          <div className={`text-3xl font-bold mb-2 ${getScoreColor(forecast.day30.score)}`}>
                            {forecast.day30.score}
                          </div>
                          <Badge variant={forecast.day30.riskLevel === "low" ? "secondary" : forecast.day30.riskLevel === "medium" ? "outline" : "destructive"}>
                            Risk: {forecast.day30.riskLevel}
                          </Badge>
                          {forecast.day30.threats.length > 0 && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              {forecast.day30.threats.slice(0, 2).map((t, i) => (
                                <div key={i} className="flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3 text-yellow-500" />
                                  {t}
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{t.day90Outlook}</span>
                          </div>
                          <div className={`text-3xl font-bold mb-2 ${getScoreColor(forecast.day90.score)}`}>
                            {forecast.day90.score}
                          </div>
                          <Badge variant={forecast.day90.riskLevel === "low" ? "secondary" : forecast.day90.riskLevel === "medium" ? "outline" : "destructive"}>
                            Risk: {forecast.day90.riskLevel}
                          </Badge>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{t.day180Outlook}</span>
                          </div>
                          <div className={`text-3xl font-bold mb-2 ${getScoreColor(forecast.day180.score)}`}>
                            {forecast.day180.score}
                          </div>
                          <Badge variant={forecast.day180.riskLevel === "low" ? "secondary" : forecast.day180.riskLevel === "medium" ? "outline" : "destructive"}>
                            Risk: {forecast.day180.riskLevel}
                          </Badge>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Activity className="h-4 w-4" />
                            <span className="font-medium">{t.sustainabilityScore}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-4xl font-bold ${getScoreColor(forecast.sustainabilityScore)}`}>
                              {forecast.sustainabilityScore}
                            </span>
                            <Progress value={forecast.sustainabilityScore} className="flex-1" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="h-4 w-4" />
                            <span className="font-medium">{t.evolutionForecast}</span>
                          </div>
                          <p className="text-sm">{forecast.evolutionForecast}</p>
                        </CardContent>
                      </Card>
                    </div>

                    {forecast.weaknessAlerts.length > 0 && (
                      <Card className="border-orange-500/30 bg-orange-500/5">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <AlertOctagon className="h-4 w-4 text-orange-500" />
                            <span className="font-medium">{t.weaknessAlerts}</span>
                          </div>
                          <ul className="space-y-2">
                            {forecast.weaknessAlerts.map((alert, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                                {alert}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ComplianceDashboard;
