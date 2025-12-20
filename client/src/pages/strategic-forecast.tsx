import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, TrendingDown, BarChart3, LineChart, PieChart,
  AreaChart, Target, Brain, Lightbulb, Sparkles, Activity,
  Clock, Calendar, Timer, Play, Pause, RefreshCw, Settings,
  AlertTriangle, CheckCircle2, XCircle, ArrowUpRight, ArrowDownRight,
  Gauge, Scale, Shield, Crown, Radio, Eye, Cpu, Zap
} from "lucide-react";

interface Scenario {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  type: 'growth' | 'risk' | 'cost' | 'policy';
  probability: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  timeline: string;
  status: 'simulating' | 'completed' | 'pending';
}

interface Forecast {
  id: string;
  metric: string;
  metricAr: string;
  current: number;
  predicted: number;
  change: number;
  confidence: number;
  timeframe: string;
}

export default function StrategicForecast() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState("forecasts");
  const [simulationParams, setSimulationParams] = useState({
    userGrowth: 15,
    resourceDemand: 20,
    policyStrictness: 75,
    aiAutonomy: 80,
  });

  const scenarios: Scenario[] = [
    { id: "1", name: "High Growth Scenario", nameAr: "سيناريو النمو العالي", description: "50% user increase over 6 months", descriptionAr: "زيادة 50% في المستخدمين خلال 6 أشهر", type: "growth", probability: 35, impact: "high", timeline: "6 months", status: "completed" },
    { id: "2", name: "Security Breach Response", nameAr: "الاستجابة لخرق أمني", description: "Simulate major security incident", descriptionAr: "محاكاة حادث أمني كبير", type: "risk", probability: 15, impact: "critical", timeline: "Immediate", status: "completed" },
    { id: "3", name: "Cost Optimization", nameAr: "تحسين التكاليف", description: "30% infrastructure cost reduction", descriptionAr: "تخفيض 30% في تكلفة البنية التحتية", type: "cost", probability: 60, impact: "medium", timeline: "3 months", status: "simulating" },
    { id: "4", name: "Strict Compliance Mode", nameAr: "وضع الامتثال الصارم", description: "Full PDPL/GDPR enforcement", descriptionAr: "تطبيق كامل لـ PDPL/GDPR", type: "policy", probability: 80, impact: "high", timeline: "1 month", status: "pending" },
  ];

  const forecasts: Forecast[] = [
    { id: "1", metric: "Active Users", metricAr: "المستخدمون النشطون", current: 28470, predicted: 34500, change: 21, confidence: 87, timeframe: "3 months" },
    { id: "2", metric: "Platform Revenue", metricAr: "إيرادات المنصة", current: 125000, predicted: 158000, change: 26, confidence: 82, timeframe: "3 months" },
    { id: "3", metric: "API Requests", metricAr: "طلبات API", current: 2400000, predicted: 3100000, change: 29, confidence: 91, timeframe: "3 months" },
    { id: "4", metric: "Storage Usage", metricAr: "استخدام التخزين", current: 8.3, predicted: 11.2, change: 35, confidence: 94, timeframe: "3 months" },
    { id: "5", metric: "Compliance Score", metricAr: "درجة الامتثال", current: 92, predicted: 96, change: 4, confidence: 78, timeframe: "3 months" },
    { id: "6", metric: "Security Posture", metricAr: "الوضع الأمني", current: 91, predicted: 94, change: 3, confidence: 85, timeframe: "3 months" },
  ];

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="flex flex-col h-screen">
        <header className="px-6 py-4 border-b border-slate-800/50 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-purple-500/30">
                <LineChart className="w-7 h-7 text-purple-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white" data-testid="text-forecast-title">
                  {language === "ar" ? "التنبؤ الاستراتيجي والمحاكاة" : "Strategic Forecast & Simulation"}
                </h1>
                <p className="text-sm text-slate-400">
                  {language === "ar" ? "تحليل تنبؤي ومحاكاة السيناريوهات" : "Predictive Analysis & Scenario Modeling"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-purple-500 border-purple-500/30 bg-purple-500/5">
                <Brain className="w-3 h-3 mr-1" />
                {language === "ar" ? "مدعوم بـ AI" : "AI-POWERED"}
              </Badge>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-4 gap-3 p-4 bg-slate-900/50 border-b border-slate-800/30">
          <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
            <CardContent className="p-3 text-center">
              <TrendingUp className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-emerald-500">+21%</p>
              <p className="text-[10px] text-slate-400">{language === "ar" ? "توقع النمو" : "Growth Forecast"}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
            <CardContent className="p-3 text-center">
              <Target className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-blue-500">87%</p>
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
              <Zap className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-amber-500">{scenarios.filter(s => s.status === 'simulating').length}</p>
              <p className="text-[10px] text-slate-400">{language === "ar" ? "جاري المحاكاة" : "Simulating"}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-80 border-r border-slate-800/50 flex flex-col bg-slate-900/30">
            <div className="p-4 border-b border-slate-800/50">
              <h3 className="text-sm font-medium text-white mb-4">
                {language === "ar" ? "معلمات المحاكاة" : "Simulation Parameters"}
              </h3>
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
              <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700" data-testid="button-run-simulation">
                <Play className="w-4 h-4 mr-2" />
                {language === "ar" ? "تشغيل المحاكاة" : "Run Simulation"}
              </Button>
            </div>
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
                <TabsTrigger value="insights" className="text-xs gap-1.5" data-testid="tab-insights">
                  <Lightbulb className="w-3.5 h-3.5" />
                  {language === "ar" ? "الرؤى" : "Insights"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="forecasts" className="mt-0 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  {forecasts.map((forecast) => (
                    <Card key={forecast.id} className="bg-slate-900/50 border-slate-800/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-slate-400">
                            {language === "ar" ? forecast.metricAr : forecast.metric}
                          </span>
                          <Badge variant="outline" className="text-[9px] text-purple-500 border-purple-500/30">
                            {forecast.confidence}% {language === "ar" ? "ثقة" : "conf"}
                          </Badge>
                        </div>
                        <div className="flex items-end gap-2 mb-2">
                          <span className="text-2xl font-bold text-white">
                            {typeof forecast.predicted === 'number' && forecast.predicted >= 1000 
                              ? `${(forecast.predicted / 1000).toFixed(1)}K` 
                              : forecast.predicted}
                          </span>
                          <div className={`flex items-center text-sm ${forecast.change > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {forecast.change > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {Math.abs(forecast.change)}%
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          {language === "ar" ? `الحالي: ${forecast.current}` : `Current: ${forecast.current}`} | {forecast.timeframe}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="scenarios" className="mt-0">
                <div className="grid grid-cols-2 gap-4">
                  {scenarios.map((scenario) => (
                    <Card key={scenario.id} className="bg-slate-900/50 border-slate-800/50">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base text-white">
                              {language === "ar" ? scenario.nameAr : scenario.name}
                            </CardTitle>
                            <CardDescription className="text-slate-400 text-xs mt-1">
                              {language === "ar" ? scenario.descriptionAr : scenario.description}
                            </CardDescription>
                          </div>
                          <Badge className={`text-[9px] ${
                            scenario.status === 'completed' ? 'bg-emerald-600' :
                            scenario.status === 'simulating' ? 'bg-blue-600' : 'bg-slate-600'
                          }`}>
                            {scenario.status === 'completed' ? (language === "ar" ? "مكتمل" : "COMPLETED") :
                             scenario.status === 'simulating' ? (language === "ar" ? "جاري" : "RUNNING") :
                             (language === "ar" ? "معلق" : "PENDING")}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant="outline" className={`text-[9px] ${typeColors[scenario.type]}`}>
                            {scenario.type.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className={`text-[9px] ${impactColors[scenario.impact]}`}>
                            {scenario.impact.toUpperCase()} IMPACT
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                          <span>{language === "ar" ? "الاحتمالية" : "Probability"}: {scenario.probability}%</span>
                          <span>{scenario.timeline}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1 h-8 text-xs border-slate-600" data-testid={`button-view-scenario-${scenario.id}`}>
                            <Eye className="w-3 h-3 mr-1" />
                            {language === "ar" ? "عرض" : "View"}
                          </Button>
                          {scenario.status !== 'simulating' && (
                            <Button size="sm" className="flex-1 h-8 text-xs bg-purple-600 hover:bg-purple-700" data-testid={`button-run-scenario-${scenario.id}`}>
                              <Play className="w-3 h-3 mr-1" />
                              {language === "ar" ? "تشغيل" : "Run"}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="insights" className="mt-0">
                <Card className="bg-slate-900/50 border-slate-800/50">
                  <CardHeader>
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      {language === "ar" ? "رؤى AI الاستراتيجية" : "AI Strategic Insights"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { insight: "User growth trajectory suggests need for infrastructure scaling in Q2", insightAr: "مسار نمو المستخدمين يشير إلى الحاجة لتوسيع البنية التحتية في الربع الثاني", priority: "high" },
                        { insight: "Current compliance score trajectory will achieve PDPL certification by March", insightAr: "مسار درجة الامتثال الحالي سيحقق شهادة PDPL بحلول مارس", priority: "medium" },
                        { insight: "API request patterns indicate opportunity for caching optimization", insightAr: "أنماط طلبات API تشير إلى فرصة لتحسين التخزين المؤقت", priority: "low" },
                        { insight: "Risk of resource exhaustion if current growth continues without scaling", insightAr: "خطر استنفاد الموارد إذا استمر النمو الحالي بدون توسيع", priority: "critical" },
                      ].map((item, i) => (
                        <div key={i} className={`p-4 rounded-lg border ${
                          item.priority === 'critical' ? 'bg-red-500/10 border-red-500/20' :
                          item.priority === 'high' ? 'bg-orange-500/10 border-orange-500/20' :
                          item.priority === 'medium' ? 'bg-amber-500/10 border-amber-500/20' :
                          'bg-slate-800/30 border-slate-700/30'
                        }`}>
                          <div className="flex items-start gap-3">
                            <Sparkles className={`w-4 h-4 shrink-0 mt-0.5 ${
                              item.priority === 'critical' ? 'text-red-500' :
                              item.priority === 'high' ? 'text-orange-500' :
                              item.priority === 'medium' ? 'text-amber-500' :
                              'text-slate-400'
                            }`} />
                            <p className="text-sm text-white">
                              {language === "ar" ? item.insightAr : item.insight}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
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
