import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  TrendingUp, TrendingDown, BarChart3, LineChart, 
  Target, Brain, Lightbulb, Sparkles, Activity,
  Play, RefreshCw, AlertTriangle, CheckCircle2, 
  ArrowUpRight, ArrowDownRight, Gauge, Shield, Cpu, Zap,
  Eye, Loader2
} from "lucide-react";

interface ForecastDashboard {
  metrics: {
    activeUsers: number;
    totalRisks: number;
    openRisks: number;
    resolvedRisks: number;
    complianceScore: number;
    securityScore: number;
    frameworks: number;
  };
  lastForecast: any;
  hasForecasts: boolean;
}

interface ForecastRunResult {
  success: boolean;
  runId: string;
  summary: string;
  summaryAr: string;
  predictions: Array<{
    metric: string;
    metricAr: string;
    current: number;
    predicted: number;
    change: number;
    confidence: number;
    reasoning: string;
    reasoningAr: string;
    recommendations: string[];
    recommendationsAr: string[];
  }>;
  scenarios: Array<{
    name: string;
    nameAr: string;
    type: string;
    probability: number;
    impact: string;
    description: string;
    descriptionAr: string;
    recommendations: string[];
    recommendationsAr: string[];
  }>;
  risks: Array<{
    type: string;
    typeAr: string;
    probability: number;
    impact: string;
    mitigation: string;
    mitigationAr: string;
  }>;
  growthForecast: number;
  riskLevel: string;
  confidenceScore: number;
  platformMetrics: any;
  completedAt: string;
}

export default function StrategicForecast() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("forecasts");
  const [simulationParams, setSimulationParams] = useState({
    userGrowth: 15,
    resourceDemand: 20,
    policyStrictness: 75,
    aiAutonomy: 80,
    timeframe: "3 months"
  });
  const [forecastResult, setForecastResult] = useState<ForecastRunResult | null>(null);

  // Fetch real dashboard data
  const { data: dashboardData, isLoading: isDashboardLoading, error: dashboardError } = useQuery<ForecastDashboard>({
    queryKey: ['/api/forecasts/dashboard']
  });

  // Fetch forecast history
  const { data: forecastHistory } = useQuery<{ forecasts: any[] }>({
    queryKey: ['/api/forecasts']
  });

  // Fetch scenarios
  const { data: scenariosData } = useQuery<{ scenarios: any[] }>({
    queryKey: ['/api/scenarios']
  });

  // Run AI forecast mutation
  const runForecastMutation = useMutation({
    mutationFn: async (params: typeof simulationParams) => {
      const response = await apiRequest('POST', '/api/forecasts/run', { parameters: params });
      return response.json();
    },
    onSuccess: (data: ForecastRunResult) => {
      setForecastResult(data);
      queryClient.invalidateQueries({ queryKey: ['/api/forecasts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/forecasts/dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/scenarios'] });
      toast({
        title: language === "ar" ? "اكتمل التحليل الذكي" : "AI Analysis Complete",
        description: language === "ar" 
          ? `تم تحليل ${data.predictions?.length || 0} مقياس وتحديد ${data.scenarios?.length || 0} سيناريو`
          : `Analyzed ${data.predictions?.length || 0} metrics and identified ${data.scenarios?.length || 0} scenarios`
      });
    },
    onError: (error) => {
      toast({
        title: language === "ar" ? "فشل التحليل" : "Analysis Failed",
        description: String(error),
        variant: "destructive"
      });
    }
  });

  const typeColors: Record<string, string> = {
    growth: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
    risk: "text-red-500 bg-red-500/10 border-red-500/30",
    cost: "text-blue-500 bg-blue-500/10 border-blue-500/30",
    policy: "text-amber-500 bg-amber-500/10 border-amber-500/30",
  };

  const impactColors: Record<string, string> = {
    low: "text-emerald-500 border-emerald-500/30",
    medium: "text-yellow-500 border-yellow-500/30",
    high: "text-orange-500 border-orange-500/30",
    critical: "text-red-500 border-red-500/30",
  };

  // Use real predictions from AI or fallback
  const predictions = forecastResult?.predictions || [];
  const scenarios = forecastResult?.scenarios || scenariosData?.scenarios || [];
  const risks = forecastResult?.risks || [];

  if (isDashboardLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
        <div className="space-y-4">
          <Skeleton className="h-12 w-64 bg-slate-800" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 bg-slate-800" />)}
          </div>
          <Skeleton className="h-96 bg-slate-800" />
        </div>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 flex items-center justify-center">
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500">{language === "ar" ? "فشل تحميل البيانات" : "Failed to load data"}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/forecasts/dashboard'] })}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {language === "ar" ? "إعادة المحاولة" : "Retry"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const metrics = dashboardData?.metrics;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="flex flex-col h-screen">
        <header className="px-6 py-4 border-b border-slate-800/50 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-purple-500/30">
                <LineChart className="w-7 h-7 text-purple-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white" data-testid="text-forecast-title">
                  {language === "ar" ? "التنبؤ الاستراتيجي الذكي" : "Intelligent Strategic Forecast"}
                </h1>
                <p className="text-sm text-slate-400">
                  {language === "ar" ? "تحليل ذكي مدعوم بـ Claude AI" : "AI-Powered Analysis with Claude AI"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-purple-500 border-purple-500/30 bg-purple-500/5">
                <Brain className="w-3 h-3 mr-1" />
                {language === "ar" ? "Claude AI" : "Claude AI"}
              </Badge>
              {forecastResult && (
                <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/5">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {language === "ar" ? `ثقة ${forecastResult.confidenceScore}%` : `${forecastResult.confidenceScore}% Confidence`}
                </Badge>
              )}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-4 gap-3 p-4 bg-slate-900/50 border-b border-slate-800/30">
          <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
            <CardContent className="p-3 text-center">
              <TrendingUp className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-emerald-500">
                {forecastResult ? `+${forecastResult.growthForecast}%` : `+${simulationParams.userGrowth}%`}
              </p>
              <p className="text-[10px] text-slate-400">{language === "ar" ? "توقع النمو" : "Growth Forecast"}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
            <CardContent className="p-3 text-center">
              <Target className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-blue-500">
                {forecastResult?.confidenceScore || metrics?.complianceScore || 0}%
              </p>
              <p className="text-[10px] text-slate-400">{language === "ar" ? "دقة التنبؤ" : "Prediction Accuracy"}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
            <CardContent className="p-3 text-center">
              <Cpu className="w-5 h-5 text-purple-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-purple-500">{scenarios.length}</p>
              <p className="text-[10px] text-slate-400">{language === "ar" ? "السيناريوهات" : "Scenarios"}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
            <CardContent className="p-3 text-center">
              <Shield className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-amber-500">{metrics?.securityScore || 0}%</p>
              <p className="text-[10px] text-slate-400">{language === "ar" ? "درجة الأمان" : "Security Score"}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-80 border-r border-slate-800/50 flex flex-col bg-slate-900/30">
            <div className="p-4 border-b border-slate-800/50">
              <h3 className="text-sm font-medium text-white mb-4">
                {language === "ar" ? "معلمات التحليل الذكي" : "AI Analysis Parameters"}
              </h3>
              
              <div className="mb-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-purple-500" />
                  <span className="text-xs text-purple-400">{language === "ar" ? "بيانات حية" : "Live Data"}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="text-slate-400">{language === "ar" ? "المستخدمون:" : "Users:"} <span className="text-white">{metrics?.activeUsers || 0}</span></div>
                  <div className="text-slate-400">{language === "ar" ? "المخاطر:" : "Risks:"} <span className="text-white">{metrics?.openRisks || 0}</span></div>
                  <div className="text-slate-400">{language === "ar" ? "الامتثال:" : "Compliance:"} <span className="text-white">{metrics?.complianceScore || 0}%</span></div>
                  <div className="text-slate-400">{language === "ar" ? "الأمان:" : "Security:"} <span className="text-white">{metrics?.securityScore || 0}%</span></div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs text-slate-400">{language === "ar" ? "نمو المستخدمين" : "User Growth"}</Label>
                    <span className="text-xs text-purple-500">{simulationParams.userGrowth}%</span>
                  </div>
                  <Slider 
                    value={[simulationParams.userGrowth]} 
                    onValueChange={(v) => setSimulationParams({...simulationParams, userGrowth: v[0]})} 
                    max={100} 
                    step={5}
                    data-testid="slider-user-growth"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs text-slate-400">{language === "ar" ? "طلب الموارد" : "Resource Demand"}</Label>
                    <span className="text-xs text-purple-500">{simulationParams.resourceDemand}%</span>
                  </div>
                  <Slider 
                    value={[simulationParams.resourceDemand]} 
                    onValueChange={(v) => setSimulationParams({...simulationParams, resourceDemand: v[0]})} 
                    max={100} 
                    step={5}
                    data-testid="slider-resource-demand"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs text-slate-400">{language === "ar" ? "صرامة السياسات" : "Policy Strictness"}</Label>
                    <span className="text-xs text-purple-500">{simulationParams.policyStrictness}%</span>
                  </div>
                  <Slider 
                    value={[simulationParams.policyStrictness]} 
                    onValueChange={(v) => setSimulationParams({...simulationParams, policyStrictness: v[0]})} 
                    max={100} 
                    step={5}
                    data-testid="slider-policy-strictness"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs text-slate-400">{language === "ar" ? "استقلالية AI" : "AI Autonomy"}</Label>
                    <span className="text-xs text-purple-500">{simulationParams.aiAutonomy}%</span>
                  </div>
                  <Slider 
                    value={[simulationParams.aiAutonomy]} 
                    onValueChange={(v) => setSimulationParams({...simulationParams, aiAutonomy: v[0]})} 
                    max={100} 
                    step={5}
                    data-testid="slider-ai-autonomy"
                  />
                </div>
              </div>
              <Button 
                className="w-full mt-4 bg-purple-600 hover:bg-purple-700" 
                data-testid="button-run-forecast"
                onClick={() => runForecastMutation.mutate(simulationParams)}
                disabled={runForecastMutation.isPending}
              >
                {runForecastMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {language === "ar" ? "جاري التحليل بواسطة Claude..." : "Analyzing with Claude..."}
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    {language === "ar" ? "تشغيل التحليل الذكي" : "Run AI Analysis"}
                  </>
                )}
              </Button>
            </div>
            
            {forecastResult?.summary && (
              <div className="p-4 border-b border-slate-800/50">
                <h4 className="text-xs font-medium text-purple-400 mb-2">
                  {language === "ar" ? "ملخص التحليل" : "Analysis Summary"}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {language === "ar" ? forecastResult.summaryAr : forecastResult.summary}
                </p>
              </div>
            )}
          </div>

          <div className="flex-1 p-6 overflow-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6 bg-slate-800/50 border border-slate-700/50">
                <TabsTrigger value="forecasts" className="text-xs gap-1.5" data-testid="tab-forecasts">
                  <LineChart className="w-3.5 h-3.5" />
                  {language === "ar" ? "التنبؤات" : "Forecasts"}
                </TabsTrigger>
                <TabsTrigger value="scenarios" className="text-xs gap-1.5" data-testid="tab-scenarios">
                  <Cpu className="w-3.5 h-3.5" />
                  {language === "ar" ? "السيناريوهات" : "Scenarios"}
                </TabsTrigger>
                <TabsTrigger value="risks" className="text-xs gap-1.5" data-testid="tab-risks">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {language === "ar" ? "المخاطر" : "Risks"}
                </TabsTrigger>
                <TabsTrigger value="insights" className="text-xs gap-1.5" data-testid="tab-insights">
                  <Lightbulb className="w-3.5 h-3.5" />
                  {language === "ar" ? "الرؤى" : "Insights"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="forecasts" className="mt-0 space-y-6">
                {predictions.length === 0 ? (
                  <Card className="bg-slate-900/50 border-slate-800/50">
                    <CardContent className="p-8 text-center">
                      <Brain className="w-12 h-12 text-purple-500/50 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">
                        {language === "ar" ? "لم يتم تشغيل التحليل بعد" : "No Analysis Run Yet"}
                      </h3>
                      <p className="text-sm text-slate-400 mb-4">
                        {language === "ar" 
                          ? "اضغط على 'تشغيل التحليل الذكي' للحصول على تنبؤات مدعومة بـ Claude AI"
                          : "Click 'Run AI Analysis' to get Claude AI-powered predictions"}
                      </p>
                      <Button 
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={() => runForecastMutation.mutate(simulationParams)}
                        disabled={runForecastMutation.isPending}
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        {language === "ar" ? "تشغيل التحليل" : "Run Analysis"}
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {predictions.map((prediction, index) => (
                      <Card key={index} className="bg-slate-900/50 border-slate-800/50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-slate-400">
                              {language === "ar" ? prediction.metricAr : prediction.metric}
                            </span>
                            <Badge variant="outline" className="text-[9px] text-purple-500 border-purple-500/30">
                              {prediction.confidence}% {language === "ar" ? "ثقة" : "conf"}
                            </Badge>
                          </div>
                          <div className="flex items-end gap-2 mb-2">
                            <span className="text-2xl font-bold text-white">
                              {typeof prediction.predicted === 'number' && prediction.predicted >= 1000 
                                ? `${(prediction.predicted / 1000).toFixed(1)}K` 
                                : prediction.predicted}
                            </span>
                            <div className={`flex items-center text-sm ${prediction.change > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                              {prediction.change > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                              {Math.abs(prediction.change)}%
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-500 mb-2">
                            {language === "ar" ? `الحالي: ${prediction.current}` : `Current: ${prediction.current}`}
                          </p>
                          <p className="text-[10px] text-slate-400 italic">
                            {language === "ar" ? prediction.reasoningAr : prediction.reasoning}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="scenarios" className="mt-0">
                {scenarios.length === 0 ? (
                  <Card className="bg-slate-900/50 border-slate-800/50">
                    <CardContent className="p-8 text-center">
                      <Cpu className="w-12 h-12 text-purple-500/50 mx-auto mb-4" />
                      <p className="text-slate-400">
                        {language === "ar" ? "سيتم إنشاء السيناريوهات بعد تشغيل التحليل" : "Scenarios will be generated after running analysis"}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {scenarios.map((scenario, index) => (
                      <Card key={index} className="bg-slate-900/50 border-slate-800/50">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <CardTitle className="text-base text-white">
                                {language === "ar" ? scenario.nameAr : scenario.name}
                              </CardTitle>
                              <CardDescription className="text-slate-400 text-xs mt-1">
                                {language === "ar" ? scenario.descriptionAr : scenario.description}
                              </CardDescription>
                            </div>
                            <Badge className={`text-[9px] ${impactColors[scenario.impact] || 'bg-slate-600'}`}>
                              {scenario.impact?.toUpperCase()}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-3 mb-3">
                            <Badge variant="outline" className={`text-[9px] ${typeColors[scenario.type] || ''}`}>
                              {scenario.type?.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>{language === "ar" ? "الاحتمالية" : "Probability"}: {scenario.probability}%</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="risks" className="mt-0">
                {risks.length === 0 ? (
                  <Card className="bg-slate-900/50 border-slate-800/50">
                    <CardContent className="p-8 text-center">
                      <Shield className="w-12 h-12 text-emerald-500/50 mx-auto mb-4" />
                      <p className="text-slate-400">
                        {language === "ar" ? "سيتم تحديد المخاطر بعد تشغيل التحليل" : "Risks will be identified after running analysis"}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {risks.map((risk, index) => (
                      <Card key={index} className={`border ${
                        risk.impact === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                        risk.impact === 'high' ? 'bg-orange-500/10 border-orange-500/30' :
                        risk.impact === 'medium' ? 'bg-amber-500/10 border-amber-500/30' :
                        'bg-slate-900/50 border-slate-800/50'
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className={`w-4 h-4 ${
                                risk.impact === 'critical' ? 'text-red-500' :
                                risk.impact === 'high' ? 'text-orange-500' :
                                risk.impact === 'medium' ? 'text-amber-500' :
                                'text-slate-400'
                              }`} />
                              <span className="text-sm font-medium text-white">
                                {language === "ar" ? risk.typeAr : risk.type}
                              </span>
                            </div>
                            <Badge variant="outline" className={impactColors[risk.impact] || ''}>
                              {risk.probability}% {language === "ar" ? "احتمال" : "probability"}
                            </Badge>
                          </div>
                          <div className="mt-3 p-3 bg-slate-800/30 rounded-lg">
                            <p className="text-xs text-slate-400 mb-1">{language === "ar" ? "التخفيف:" : "Mitigation:"}</p>
                            <p className="text-sm text-white">
                              {language === "ar" ? risk.mitigationAr : risk.mitigation}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="insights" className="mt-0">
                <Card className="bg-slate-900/50 border-slate-800/50">
                  <CardHeader>
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      {language === "ar" ? "رؤى Claude AI الاستراتيجية" : "Claude AI Strategic Insights"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {forecastResult ? (
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                          <div className="flex items-start gap-3">
                            <Brain className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-purple-400 mb-2">
                                {language === "ar" ? "تحليل Claude AI" : "Claude AI Analysis"}
                              </p>
                              <p className="text-sm text-white">
                                {language === "ar" ? forecastResult.summaryAr : forecastResult.summary}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {predictions.map((pred, i) => pred.recommendations?.length > 0 && (
                          <div key={i} className="p-4 rounded-lg border bg-slate-800/30 border-slate-700/30">
                            <p className="text-xs text-slate-400 mb-2">
                              {language === "ar" ? `توصيات لـ ${pred.metricAr}:` : `Recommendations for ${pred.metric}:`}
                            </p>
                            <ul className="space-y-1">
                              {(language === "ar" ? pred.recommendationsAr : pred.recommendations)?.map((rec, j) => (
                                <li key={j} className="flex items-start gap-2 text-sm text-white">
                                  <Sparkles className="w-3 h-3 text-amber-500 shrink-0 mt-1" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Sparkles className="w-12 h-12 text-amber-500/50 mx-auto mb-4" />
                        <p className="text-slate-400">
                          {language === "ar" 
                            ? "قم بتشغيل التحليل الذكي للحصول على رؤى Claude AI"
                            : "Run AI analysis to get Claude AI insights"}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
