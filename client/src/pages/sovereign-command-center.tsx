import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Crown, Shield, Globe, Activity, AlertTriangle, CheckCircle2,
  TrendingUp, TrendingDown, Zap, Brain, Lock, Eye, Target,
  Gauge, Server, Database, Users, CreditCard, Bell, Radio,
  Settings, BarChart3, PieChart, ArrowUpRight, ArrowDownRight,
  Layers, GitBranch, Terminal, Cpu, HardDrive, Network,
  ShieldCheck, ShieldAlert, FileText, Scale, Gavel, Landmark,
  Flag, MapPin, Building, Fingerprint, Key, AlertOctagon,
  RefreshCw, Play, Pause, Clock, Calendar, Timer, Sparkles,
  Bot, Lightbulb, LineChart, AreaChart, Workflow, Boxes
} from "lucide-react";

interface SovereignMetrics {
  platformHealth: number;
  riskIndex: number;
  aiAutonomyLevel: number;
  complianceDrift: number;
  sovereigntyScore: number;
  activeUsers: number;
  activeProjects: number;
  activePolicies: number;
  pendingApprovals: number;
  enforcementActions: number;
  dataResidencyCompliance: number;
  securityPosture: number;
  costEfficiency: number;
  systemUptime: number;
  lastUpdated?: string;
  metrics?: {
    totalUsers: number;
    totalAiCalls: number;
    recentAuditEvents: number;
  };
}

interface SovereignAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  timestamp: string;
  acknowledged: boolean;
  category: string;
}

interface PolicyDecision {
  id: string;
  title: string;
  titleAr: string;
  status: 'pending' | 'approved' | 'rejected' | 'enforced';
  impact: 'low' | 'medium' | 'high' | 'critical';
  aiRecommendation: string;
  aiRecommendationAr: string;
  affectedSystems: string[];
  createdAt: string;
}

const healthColors: Record<string, string> = {
  excellent: "text-emerald-600",
  good: "text-green-600",
  moderate: "text-yellow-600",
  poor: "text-orange-600",
  critical: "text-red-600",
};

const getHealthStatus = (value: number) => {
  if (value >= 90) return { status: "excellent", label: { en: "Excellent", ar: "ممتاز" } };
  if (value >= 75) return { status: "good", label: { en: "Good", ar: "جيد" } };
  if (value >= 50) return { status: "moderate", label: { en: "Moderate", ar: "متوسط" } };
  if (value >= 25) return { status: "poor", label: { en: "Poor", ar: "ضعيف" } };
  return { status: "critical", label: { en: "Critical", ar: "حرج" } };
};

export default function SovereignCommandCenter() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [aiAutonomyEnabled, setAiAutonomyEnabled] = useState(true);
  const [autoEnforcement, setAutoEnforcement] = useState(false);

  const { data: metricsData, isLoading: loadingMetrics } = useQuery<SovereignMetrics>({
    queryKey: ["/api/sovereign/metrics"],
    refetchInterval: 15000,
  });

  const { data: alertsData } = useQuery<{ alerts: SovereignAlert[] }>({
    queryKey: ["/api/sovereign/alerts"],
    refetchInterval: 30000,
  });

  const { data: decisionsData } = useQuery<{ decisions: PolicyDecision[] }>({
    queryKey: ["/api/sovereign/decisions"],
  });

  const metrics = metricsData || {
    platformHealth: 0,
    riskIndex: 0,
    aiAutonomyLevel: 0,
    complianceDrift: 0,
    sovereigntyScore: 0,
    activeUsers: 0,
    activeProjects: 0,
    activePolicies: 0,
    pendingApprovals: 0,
    enforcementActions: 0,
    dataResidencyCompliance: 0,
    securityPosture: 0,
    costEfficiency: 0,
    systemUptime: 0,
    metrics: { totalUsers: 0, totalAiCalls: 0, recentAuditEvents: 0 }
  };

  const alerts = alertsData?.alerts || [];
  const decisions = decisionsData?.decisions || [];

  const platformHealthStatus = getHealthStatus(metrics.platformHealth);
  const securityStatus = getHealthStatus(metrics.securityPosture);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="flex flex-col h-screen">
        <header className="px-6 py-4 border-b border-slate-800/50 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30">
                <Crown className="w-7 h-7 text-amber-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white" data-testid="text-sovereign-title">
                  {language === "ar" ? "مركز القيادة السيادية" : "Sovereign Command Center"}
                </h1>
                <p className="text-sm text-slate-400">
                  {language === "ar" ? "نظام التشغيل الرقمي السيادي" : "Digital Sovereign Operating System"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
                  <span className="text-xs text-slate-300">{language === "ar" ? "مباشر" : "LIVE"}</span>
                </div>
                <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/5">
                  <Crown className="w-3 h-3 mr-1" />
                  {language === "ar" ? "وضع السيادة" : "SOVEREIGN MODE"}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Label htmlFor="ai-autonomy" className="text-xs text-slate-400">
                  {language === "ar" ? "حوكمة AI" : "AI Governance"}
                </Label>
                <Switch 
                  id="ai-autonomy" 
                  checked={aiAutonomyEnabled} 
                  onCheckedChange={setAiAutonomyEnabled}
                  data-testid="switch-ai-autonomy"
                />
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-7 gap-3 p-4 bg-slate-900/50 border-b border-slate-800/30">
          <Card className="col-span-1 bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20" data-testid="metric-platform-health">
            <CardContent className="p-3 text-center">
              <Activity className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
              <p className={`text-2xl font-bold ${healthColors[platformHealthStatus.status]}`} data-testid="value-platform-health">
                {metrics.platformHealth}%
              </p>
              <p className="text-[10px] text-slate-400">{language === "ar" ? "صحة المنصة" : "Platform Health"}</p>
            </CardContent>
          </Card>
          
          <Card className="col-span-1 bg-gradient-to-br from-red-500/10 to-transparent border-red-500/20" data-testid="metric-risk-index">
            <CardContent className="p-3 text-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-red-500" data-testid="value-risk-index">{metrics.riskIndex}</p>
              <p className="text-[10px] text-slate-400">{language === "ar" ? "مؤشر المخاطر" : "Risk Index"}</p>
            </CardContent>
          </Card>
          
          <Card className="col-span-1 bg-gradient-to-br from-violet-500/10 to-transparent border-violet-500/20" data-testid="metric-ai-autonomy">
            <CardContent className="p-3 text-center">
              <Brain className="w-5 h-5 text-violet-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-violet-500" data-testid="value-ai-autonomy">{metrics.aiAutonomyLevel}%</p>
              <p className="text-[10px] text-slate-400">{language === "ar" ? "استقلالية AI" : "AI Autonomy"}</p>
            </CardContent>
          </Card>
          
          <Card className="col-span-1 bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20" data-testid="metric-compliance">
            <CardContent className="p-3 text-center">
              <Scale className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-amber-500" data-testid="value-compliance">{100 - metrics.complianceDrift}%</p>
              <p className="text-[10px] text-slate-400">{language === "ar" ? "الامتثال" : "Compliance"}</p>
            </CardContent>
          </Card>
          
          <Card className="col-span-1 bg-gradient-to-br from-cyan-500/10 to-transparent border-cyan-500/20" data-testid="metric-sovereignty">
            <CardContent className="p-3 text-center">
              <Shield className="w-5 h-5 text-cyan-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-cyan-500" data-testid="value-sovereignty">{metrics.sovereigntyScore}%</p>
              <p className="text-[10px] text-slate-400">{language === "ar" ? "درجة السيادة" : "Sovereignty"}</p>
            </CardContent>
          </Card>
          
          <Card className="col-span-1 bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20" data-testid="metric-security">
            <CardContent className="p-3 text-center">
              <ShieldCheck className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-blue-500" data-testid="value-security">{metrics.securityPosture}%</p>
              <p className="text-[10px] text-slate-400">{language === "ar" ? "الأمان" : "Security"}</p>
            </CardContent>
          </Card>
          
          <Card className="col-span-1 bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20" data-testid="metric-uptime">
            <CardContent className="p-3 text-center">
              <Server className="w-5 h-5 text-green-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-green-500" data-testid="value-uptime">{metrics.systemUptime}%</p>
              <p className="text-[10px] text-slate-400">{language === "ar" ? "وقت التشغيل" : "Uptime"}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 p-6 overflow-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="mb-6 bg-slate-800/50 border border-slate-700/50">
                <TabsTrigger value="overview" className="text-xs gap-1.5" data-testid="tab-overview">
                  <Gauge className="w-3.5 h-3.5" />
                  {language === "ar" ? "نظرة عامة" : "Overview"}
                </TabsTrigger>
                <TabsTrigger value="governance" className="text-xs gap-1.5" data-testid="tab-governance">
                  <Gavel className="w-3.5 h-3.5" />
                  {language === "ar" ? "الحوكمة" : "Governance"}
                </TabsTrigger>
                <TabsTrigger value="intelligence" className="text-xs gap-1.5" data-testid="tab-intelligence">
                  <Brain className="w-3.5 h-3.5" />
                  {language === "ar" ? "الذكاء" : "Intelligence"}
                </TabsTrigger>
                <TabsTrigger value="enforcement" className="text-xs gap-1.5" data-testid="tab-enforcement">
                  <Shield className="w-3.5 h-3.5" />
                  {language === "ar" ? "التنفيذ" : "Enforcement"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-0 space-y-6">
                <div className="grid grid-cols-3 gap-6">
                  <Card className="col-span-2 bg-slate-900/50 border-slate-800/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base text-white flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-500" />
                        {language === "ar" ? "نبض المنصة السيادية" : "Sovereign Platform Pulse"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
                          <div className="flex items-center justify-between mb-2">
                            <Users className="w-5 h-5 text-blue-500" />
                            <Badge variant="outline" className="text-[9px] text-emerald-500 border-emerald-500/30">
                              <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" />+12%
                            </Badge>
                          </div>
                          <p className="text-2xl font-bold text-white">{formatNumber(metrics.activeUsers)}</p>
                          <p className="text-xs text-slate-400">{language === "ar" ? "المستخدمون النشطون" : "Active Users"}</p>
                        </div>
                        
                        <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
                          <div className="flex items-center justify-between mb-2">
                            <Boxes className="w-5 h-5 text-purple-500" />
                            <Badge variant="outline" className="text-[9px] text-emerald-500 border-emerald-500/30">
                              <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" />+8%
                            </Badge>
                          </div>
                          <p className="text-2xl font-bold text-white">{metrics.activeProjects}</p>
                          <p className="text-xs text-slate-400">{language === "ar" ? "المشاريع النشطة" : "Active Projects"}</p>
                        </div>
                        
                        <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
                          <div className="flex items-center justify-between mb-2">
                            <FileText className="w-5 h-5 text-amber-500" />
                            <Badge variant="outline" className="text-[9px] text-blue-500 border-blue-500/30">
                              {metrics.activePolicies}
                            </Badge>
                          </div>
                          <p className="text-2xl font-bold text-white">{metrics.activePolicies}</p>
                          <p className="text-xs text-slate-400">{language === "ar" ? "السياسات النشطة" : "Active Policies"}</p>
                        </div>
                        
                        <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
                          <div className="flex items-center justify-between mb-2">
                            <Clock className="w-5 h-5 text-orange-500" />
                            <Badge variant="outline" className={`text-[9px] ${metrics.pendingApprovals > 5 ? 'text-red-500 border-red-500/30' : 'text-yellow-500 border-yellow-500/30'}`}>
                              {language === "ar" ? "معلق" : "Pending"}
                            </Badge>
                          </div>
                          <p className="text-2xl font-bold text-white">{metrics.pendingApprovals}</p>
                          <p className="text-xs text-slate-400">{language === "ar" ? "بانتظار الموافقة" : "Pending Approvals"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900/50 border-slate-800/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base text-white flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        {language === "ar" ? "التنبيهات الاستراتيجية" : "Strategic Alerts"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[200px]">
                        <div className="space-y-2">
                          {alerts.map((alert) => (
                            <div 
                              key={alert.id}
                              className={`p-3 rounded-lg border ${
                                alert.type === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                                alert.type === 'warning' ? 'bg-amber-500/10 border-amber-500/30' :
                                'bg-blue-500/10 border-blue-500/30'
                              }`}
                              data-testid={`alert-${alert.id}`}
                            >
                              <div className="flex items-start gap-2">
                                {alert.type === 'critical' ? <AlertOctagon className="w-4 h-4 text-red-500 shrink-0 mt-0.5" /> :
                                 alert.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /> :
                                 <Bell className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-white truncate">
                                    {language === "ar" ? alert.titleAr : alert.title}
                                  </p>
                                  <p className="text-xs text-slate-400 truncate">
                                    {language === "ar" ? alert.descriptionAr : alert.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <Card className="bg-slate-900/50 border-slate-800/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base text-white flex items-center gap-2">
                        <Globe className="w-4 h-4 text-cyan-500" />
                        {language === "ar" ? "إقامة البيانات" : "Data Residency"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-300">{language === "ar" ? "الامتثال" : "Compliance"}</span>
                          <span className="text-sm font-bold text-emerald-500">{metrics.dataResidencyCompliance}%</span>
                        </div>
                        <Progress value={metrics.dataResidencyCompliance} className="h-2" />
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          <div className="p-2 rounded bg-slate-800/50 text-center">
                            <p className="text-lg font-bold text-white">1</p>
                            <p className="text-[10px] text-slate-400">{language === "ar" ? "مناطق نشطة" : "Active Regions"}</p>
                          </div>
                          <div className="p-2 rounded bg-slate-800/50 text-center">
                            <p className="text-lg font-bold text-emerald-500">{metrics.riskIndex > 0 ? Math.ceil(metrics.riskIndex / 20) : 0}</p>
                            <p className="text-[10px] text-slate-400">{language === "ar" ? "انتهاكات" : "Violations"}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900/50 border-slate-800/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base text-white flex items-center gap-2">
                        <Brain className="w-4 h-4 text-violet-500" />
                        {language === "ar" ? "محرك قرارات AI" : "AI Decision Engine"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-300">{language === "ar" ? "مستوى الاستقلالية" : "Autonomy Level"}</span>
                          <Badge variant="outline" className="text-violet-500 border-violet-500/30">
                            {language === "ar" ? "متقدم" : "Advanced"}
                          </Badge>
                        </div>
                        <Progress value={metrics.aiAutonomyLevel} className="h-2" />
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          <div className="p-2 rounded bg-slate-800/50 text-center">
                            <p className="text-lg font-bold text-white">{decisions.length}</p>
                            <p className="text-[10px] text-slate-400">{language === "ar" ? "قرارات اليوم" : "Today's Decisions"}</p>
                          </div>
                          <div className="p-2 rounded bg-slate-800/50 text-center">
                            <p className="text-lg font-bold text-violet-500">{Math.max(70, 100 - metrics.riskIndex)}%</p>
                            <p className="text-[10px] text-slate-400">{language === "ar" ? "دقة التنبؤ" : "Accuracy"}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900/50 border-slate-800/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base text-white flex items-center gap-2">
                        <Gavel className="w-4 h-4 text-amber-500" />
                        {language === "ar" ? "إنفاذ السياسات" : "Policy Enforcement"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Switch 
                            id="auto-enforce"
                            checked={autoEnforcement}
                            onCheckedChange={setAutoEnforcement}
                            data-testid="switch-auto-enforcement"
                          />
                          <Label htmlFor="auto-enforce" className="text-sm text-slate-300">
                            {language === "ar" ? "التنفيذ التلقائي" : "Auto-Enforcement"}
                          </Label>
                        </div>
                        <Separator className="bg-slate-700/50" />
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-center">
                            <p className="text-lg font-bold text-emerald-500">{metrics.enforcementActions}</p>
                            <p className="text-[10px] text-slate-400">{language === "ar" ? "نشط" : "Active"}</p>
                          </div>
                          <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-center">
                            <p className="text-lg font-bold text-amber-500">{metrics.pendingApprovals}</p>
                            <p className="text-[10px] text-slate-400">{language === "ar" ? "معلق" : "Pending"}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="governance" className="mt-0 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <Card className="bg-slate-900/50 border-slate-800/50">
                    <CardHeader>
                      <CardTitle className="text-base text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-500" />
                        {language === "ar" ? "قرارات السياسات المعلقة" : "Pending Policy Decisions"}
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        {language === "ar" ? "قرارات تحتاج موافقتك" : "Decisions requiring your approval"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-3">
                          {decisions.filter(d => d.status === 'pending').map((decision) => (
                            <div 
                              key={decision.id}
                              className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30"
                              data-testid={`decision-${decision.id}`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="text-sm font-medium text-white">
                                  {language === "ar" ? decision.titleAr : decision.title}
                                </h4>
                                <Badge variant="outline" className={`text-[9px] ${
                                  decision.impact === 'critical' ? 'text-red-500 border-red-500/30' :
                                  decision.impact === 'high' ? 'text-orange-500 border-orange-500/30' :
                                  decision.impact === 'medium' ? 'text-yellow-500 border-yellow-500/30' :
                                  'text-green-500 border-green-500/30'
                                }`}>
                                  {decision.impact.toUpperCase()}
                                </Badge>
                              </div>
                              <div className="p-2 rounded bg-violet-500/10 border border-violet-500/20 mb-3">
                                <div className="flex items-center gap-1 mb-1">
                                  <Brain className="w-3 h-3 text-violet-500" />
                                  <span className="text-[10px] text-violet-400">{language === "ar" ? "توصية AI" : "AI Recommendation"}</span>
                                </div>
                                <p className="text-xs text-slate-300">
                                  {language === "ar" ? decision.aiRecommendationAr : decision.aiRecommendation}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" className="flex-1 h-8 text-xs bg-emerald-600 hover:bg-emerald-700" data-testid={`button-approve-${decision.id}`}>
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  {language === "ar" ? "موافقة" : "Approve"}
                                </Button>
                                <Button size="sm" variant="outline" className="flex-1 h-8 text-xs border-slate-600" data-testid={`button-simulate-${decision.id}`}>
                                  <Lightbulb className="w-3 h-3 mr-1" />
                                  {language === "ar" ? "محاكاة" : "Simulate"}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900/50 border-slate-800/50">
                    <CardHeader>
                      <CardTitle className="text-base text-white flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-500" />
                        {language === "ar" ? "السياسات المنفذة" : "Enforced Policies"}
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        {language === "ar" ? "سياسات نشطة ومفعلة" : "Active and enforced policies"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-3">
                          {decisions.filter(d => d.status === 'enforced' || d.status === 'approved').map((decision) => (
                            <div 
                              key={decision.id}
                              className={`p-4 rounded-lg border ${
                                decision.status === 'enforced' 
                                  ? 'bg-emerald-500/10 border-emerald-500/20' 
                                  : 'bg-blue-500/10 border-blue-500/20'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="text-sm font-medium text-white">
                                  {language === "ar" ? decision.titleAr : decision.title}
                                </h4>
                                <Badge className={`text-[9px] ${
                                  decision.status === 'enforced' 
                                    ? 'bg-emerald-600 text-white' 
                                    : 'bg-blue-600 text-white'
                                }`}>
                                  {decision.status === 'enforced' 
                                    ? (language === "ar" ? "مُنفذ" : "ENFORCED")
                                    : (language === "ar" ? "موافق عليه" : "APPROVED")}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {decision.affectedSystems.map((system, i) => (
                                  <Badge key={i} variant="outline" className="text-[9px] text-slate-400 border-slate-600">
                                    {system}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="intelligence" className="mt-0 space-y-6">
                <Card className="bg-slate-900/50 border-slate-800/50">
                  <CardHeader>
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <Brain className="w-4 h-4 text-violet-500" />
                      {language === "ar" ? "محرك الذكاء السيادي" : "Sovereign Intelligence Engine"}
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      {language === "ar" ? "تحليل مستمر واقتراحات ذكية للحوكمة" : "Continuous analysis and intelligent governance suggestions"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      <div className="p-4 rounded-lg bg-violet-500/10 border border-violet-500/20 text-center">
                        <Sparkles className="w-6 h-6 text-violet-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-white">{metrics.metrics?.totalAiCalls || 0}</p>
                        <p className="text-xs text-slate-400">{language === "ar" ? "رؤى مُولدة" : "Insights Generated"}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-white">{decisions.filter(d => d.status === 'enforced').length}</p>
                        <p className="text-xs text-slate-400">{language === "ar" ? "تم تطبيقها" : "Applied"}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                        <Clock className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-white">{decisions.filter(d => d.status === 'pending').length}</p>
                        <p className="text-xs text-slate-400">{language === "ar" ? "بانتظار المراجعة" : "Awaiting Review"}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
                        <Target className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-white">{Math.max(70, 100 - metrics.riskIndex)}%</p>
                        <p className="text-xs text-slate-400">{language === "ar" ? "معدل الدقة" : "Accuracy Rate"}</p>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Bot className="w-5 h-5 text-violet-500" />
                        <h4 className="text-sm font-medium text-white">
                          {language === "ar" ? "توصيات AI الحالية" : "Current AI Recommendations"}
                        </h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-2 rounded bg-slate-800/50">
                          <Lightbulb className="w-4 h-4 text-amber-500" />
                          <p className="text-sm text-slate-300">
                            {language === "ar" 
                              ? "يُوصى بتفعيل التشفير من النهاية إلى النهاية لجميع اتصالات API"
                              : "Recommend enabling end-to-end encryption for all API communications"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded bg-slate-800/50">
                          <Lightbulb className="w-4 h-4 text-amber-500" />
                          <p className="text-sm text-slate-300">
                            {language === "ar"
                              ? "تحسين سياسات الوصول للمستخدمين في المنطقة الأوروبية"
                              : "Optimize access policies for users in the European region"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="enforcement" className="mt-0 space-y-6">
                <Card className="bg-slate-900/50 border-slate-800/50">
                  <CardHeader>
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-500" />
                      {language === "ar" ? "سجل التنفيذ التلقائي" : "Autonomous Enforcement Log"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-2">
                        {[
                          { action: "Blocked unauthorized API access attempt", actionAr: "تم حظر محاولة وصول غير مصرح بها لـ API", severity: "high", time: "2 mins ago" },
                          { action: "Auto-scaled resources for high traffic", actionAr: "تم تحجيم الموارد تلقائياً لحركة المرور العالية", severity: "info", time: "15 mins ago" },
                          { action: "Enforced rate limiting on tenant #1247", actionAr: "تم فرض تحديد المعدل على المستأجر #1247", severity: "medium", time: "1 hour ago" },
                          { action: "Rotated API keys as per policy", actionAr: "تم تدوير مفاتيح API وفقاً للسياسة", severity: "info", time: "3 hours ago" },
                          { action: "Quarantined suspicious data transfer", actionAr: "تم عزل نقل بيانات مشبوه", severity: "critical", time: "5 hours ago" },
                        ].map((log, i) => (
                          <div 
                            key={i}
                            className={`p-3 rounded-lg border flex items-center gap-3 ${
                              log.severity === 'critical' ? 'bg-red-500/10 border-red-500/20' :
                              log.severity === 'high' ? 'bg-orange-500/10 border-orange-500/20' :
                              log.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-500/20' :
                              'bg-slate-800/30 border-slate-700/30'
                            }`}
                          >
                            <Shield className={`w-4 h-4 ${
                              log.severity === 'critical' ? 'text-red-500' :
                              log.severity === 'high' ? 'text-orange-500' :
                              log.severity === 'medium' ? 'text-yellow-500' :
                              'text-slate-400'
                            }`} />
                            <div className="flex-1">
                              <p className="text-sm text-white">
                                {language === "ar" ? log.actionAr : log.action}
                              </p>
                              <p className="text-[10px] text-slate-500">{log.time}</p>
                            </div>
                            <Badge variant="outline" className={`text-[9px] ${
                              log.severity === 'critical' ? 'text-red-500 border-red-500/30' :
                              log.severity === 'high' ? 'text-orange-500 border-orange-500/30' :
                              log.severity === 'medium' ? 'text-yellow-500 border-yellow-500/30' :
                              'text-slate-400 border-slate-600'
                            }`}>
                              {log.severity.toUpperCase()}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
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
