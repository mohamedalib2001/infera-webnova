/**
 * INFERA WebNova - Pre-Build Simulation Panel
 * لوحة محاكاة قبل البناء
 */

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Activity,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Server,
  Cpu,
  Database,
  Globe,
  Shield,
  Loader2,
  Play,
  BarChart3,
  Target,
  Clock,
  Users,
  Gauge,
  AlertOctagon,
  Lightbulb
} from "lucide-react";

interface PreBuildSimulationPanelProps {
  language?: "en" | "ar";
  isOwner?: boolean;
}

export function PreBuildSimulationPanel({ language = "en", isOwner = false }: PreBuildSimulationPanelProps) {
  const { toast } = useToast();
  const isAr = language === "ar";

  const [activeTab, setActiveTab] = useState("quick");
  const [platformName, setPlatformName] = useState("");
  const [sector, setSector] = useState<string>("enterprise");
  const [tier, setTier] = useState<string>("professional");
  const [expectedUsers, setExpectedUsers] = useState(1000);
  const [peakUsers, setPeakUsers] = useState(500);
  const [featureCount, setFeatureCount] = useState(5);
  const [integrationCount, setIntegrationCount] = useState(2);
  const [dataVolume, setDataVolume] = useState<string>("medium");
  const [securityLevel, setSecurityLevel] = useState<string>("enhanced");
  const [autoScaling, setAutoScaling] = useState(true);
  const [redundancy, setRedundancy] = useState(false);
  const [cdnEnabled, setCdnEnabled] = useState(true);

  const { data: sectorsData } = useQuery({ queryKey: ["/api/simulation/config/sectors"] });
  const { data: infraData } = useQuery({ queryKey: ["/api/simulation/config/infrastructure"] });
  const { data: simulationsData } = useQuery({ queryKey: ["/api/simulation/simulations"] });

  const quickEstimateMutation = useMutation({
    mutationFn: async (params: any) => {
      const response = await apiRequest("POST", "/api/simulation/quick-estimate", params);
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: isAr ? "تم التقدير" : "Estimate Complete", description: data.message });
    },
    onError: (error: any) => {
      toast({ title: isAr ? "خطأ" : "Error", description: error.message, variant: "destructive" });
    }
  });

  const runSimulationMutation = useMutation({
    mutationFn: async (params: any) => {
      const response = await apiRequest("POST", "/api/simulation/run", params);
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: isAr ? "اكتملت المحاكاة" : "Simulation Complete", description: data.message });
      queryClient.invalidateQueries({ queryKey: ["/api/simulation/simulations"] });
    },
    onError: (error: any) => {
      toast({ title: isAr ? "خطأ" : "Error", description: error.message, variant: "destructive" });
    }
  });

  const sectors = sectorsData?.data || [];
  const infrastructure = infraData?.data || {};
  const simulations = simulationsData?.data || [];
  const quickEstimate = quickEstimateMutation.data?.data;
  const fullSimulation = runSimulationMutation.data?.data;

  const handleQuickEstimate = () => {
    quickEstimateMutation.mutate({
      featureCount,
      integrationCount,
      expectedUsers,
      tier,
      sector
    });
  };

  const handleRunSimulation = () => {
    if (!platformName) {
      toast({ title: isAr ? "خطأ" : "Error", description: isAr ? "أدخل اسم المنصة" : "Enter platform name", variant: "destructive" });
      return;
    }

    runSimulationMutation.mutate({
      platformSpec: {
        name: platformName,
        sector,
        features: Array.from({ length: featureCount }, (_, i) => ({
          id: `feature-${i}`,
          name: `Feature ${i + 1}`,
          type: 'crud',
          complexity: i < 2 ? 'low' : i < 4 ? 'medium' : 'high',
          expectedRequestsPerMinute: Math.round(100 + Math.random() * 200),
          dataIntensive: i % 3 === 0
        })),
        integrations: Array.from({ length: integrationCount }, (_, i) => ({
          id: `integration-${i}`,
          name: `Integration ${i + 1}`,
          type: ['api', 'database', 'auth', 'storage'][i % 4],
          latencyMs: 100 + i * 50,
          failureRate: 0.005 + i * 0.002
        })),
        infrastructure: {
          tier: tier as any,
          regions: tier === 'dedicated' ? 3 : tier === 'enterprise' ? 2 : 1,
          redundancy,
          autoScaling,
          cdnEnabled
        },
        expectedUsers,
        peakConcurrentUsers: peakUsers,
        dataVolume: dataVolume as any,
        securityLevel: securityLevel as any
      },
      simulationType: 'comprehensive'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    if (score >= 40) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return "bg-green-500/20 text-green-700 dark:text-green-400";
    if (score >= 60) return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400";
    if (score >= 40) return "bg-orange-500/20 text-orange-700 dark:text-orange-400";
    return "bg-red-500/20 text-red-700 dark:text-red-400";
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500/20 text-red-700 dark:text-red-400";
      case "high": return "bg-orange-500/20 text-orange-700 dark:text-orange-400";
      case "medium": return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400";
      default: return "bg-blue-500/20 text-blue-700 dark:text-blue-400";
    }
  };

  return (
    <div className="space-y-6" dir={isAr ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-primary/10">
            <Activity className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold" data-testid="text-panel-title">
              {isAr ? "محرك محاكاة قبل البناء" : "Pre-Build Simulation Engine"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isAr ? "محاكاة الأداء والضغط واكتشاف نقاط الفشل" : "Simulate performance, load, and detect failure points"}
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="quick" className="gap-2" data-testid="tab-quick">
            <Zap className="w-4 h-4" />
            {isAr ? "تقدير سريع" : "Quick Estimate"}
          </TabsTrigger>
          <TabsTrigger value="full" className="gap-2" data-testid="tab-full">
            <BarChart3 className="w-4 h-4" />
            {isAr ? "محاكاة كاملة" : "Full Simulation"}
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2" data-testid="tab-history">
            <Clock className="w-4 h-4" />
            {isAr ? "السجل" : "History"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quick" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{isAr ? "تقدير سريع للأداء" : "Quick Performance Estimate"}</CardTitle>
              <CardDescription>{isAr ? "احصل على تقدير سريع لأداء منصتك" : "Get a quick estimate of your platform's performance"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>{isAr ? "القطاع" : "Sector"}</Label>
                  <Select value={sector} onValueChange={setSector}>
                    <SelectTrigger data-testid="select-sector"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {sectors.map((s: any) => (
                        <SelectItem key={s.id} value={s.id}>{isAr ? s.nameAr : s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{isAr ? "البنية التحتية" : "Infrastructure"}</Label>
                  <Select value={tier} onValueChange={setTier}>
                    <SelectTrigger data-testid="select-tier"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {infrastructure.tiers?.map((t: any) => (
                        <SelectItem key={t.id} value={t.id}>{isAr ? t.nameAr : t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{isAr ? "عدد الميزات" : "Features"}: {featureCount}</Label>
                  <Slider min={1} max={20} value={[featureCount]} onValueChange={(v) => setFeatureCount(v[0])} data-testid="slider-features" />
                </div>
                <div className="space-y-2">
                  <Label>{isAr ? "عدد التكاملات" : "Integrations"}: {integrationCount}</Label>
                  <Slider min={0} max={10} value={[integrationCount]} onValueChange={(v) => setIntegrationCount(v[0])} data-testid="slider-integrations" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{isAr ? "المستخدمين المتوقعين" : "Expected Users"}: {expectedUsers.toLocaleString()}</Label>
                <Slider min={100} max={100000} step={100} value={[expectedUsers]} onValueChange={(v) => setExpectedUsers(v[0])} data-testid="slider-users" />
              </div>

              <Button onClick={handleQuickEstimate} disabled={!isOwner || quickEstimateMutation.isPending} className="w-full" data-testid="button-quick-estimate" title={!isOwner ? (isAr ? "صلاحية المالك مطلوبة" : "Owner access required") : ""}>
                {quickEstimateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin me-2" /> : <Zap className="w-4 h-4 me-2" />}
                {isAr ? "حساب التقدير" : "Calculate Estimate"}
              </Button>

              {quickEstimate && (
                <Card className="bg-muted/30">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${getScoreColor(quickEstimate.score)}`} data-testid="text-quick-score">
                          {quickEstimate.score}
                        </div>
                        <p className="text-sm text-muted-foreground">{isAr ? "الدرجة" : "Score"}</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold" data-testid="text-quick-max-users">
                          {quickEstimate.maxUsers.toLocaleString()}
                        </div>
                        <p className="text-sm text-muted-foreground">{isAr ? "أقصى مستخدمين" : "Max Users"}</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold" data-testid="text-quick-response">
                          {quickEstimate.responseTime}ms
                        </div>
                        <p className="text-sm text-muted-foreground">{isAr ? "زمن الاستجابة" : "Response Time"}</p>
                      </div>
                    </div>
                    {quickEstimate.warnings.length > 0 && (
                      <div className="space-y-2">
                        {quickEstimate.warnings.map((w: string, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-400">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                            <span data-testid={`text-quick-warning-${i}`}>{w}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="full" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{isAr ? "محاكاة شاملة للمنصة" : "Comprehensive Platform Simulation"}</CardTitle>
              <CardDescription>{isAr ? "محاكاة كاملة للأداء والضغط ونقاط الفشل" : "Full simulation of performance, stress, and failure points"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isAr ? "اسم المنصة" : "Platform Name"}</Label>
                  <Input value={platformName} onChange={(e) => setPlatformName(e.target.value)} placeholder={isAr ? "أدخل اسم المنصة" : "Enter platform name"} data-testid="input-platform-name" />
                </div>
                <div className="space-y-2">
                  <Label>{isAr ? "القطاع" : "Sector"}</Label>
                  <Select value={sector} onValueChange={setSector}>
                    <SelectTrigger data-testid="select-full-sector"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {sectors.map((s: any) => (
                        <SelectItem key={s.id} value={s.id}>{isAr ? s.nameAr : s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>{isAr ? "المستوى" : "Tier"}</Label>
                  <Select value={tier} onValueChange={setTier}>
                    <SelectTrigger data-testid="select-full-tier"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {infrastructure.tiers?.map((t: any) => (
                        <SelectItem key={t.id} value={t.id}>{isAr ? t.nameAr : t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{isAr ? "حجم البيانات" : "Data Volume"}</Label>
                  <Select value={dataVolume} onValueChange={setDataVolume}>
                    <SelectTrigger data-testid="select-data-volume"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {infrastructure.dataVolumes?.map((d: any) => (
                        <SelectItem key={d.id} value={d.id}>{isAr ? d.nameAr : d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{isAr ? "مستوى الأمان" : "Security Level"}</Label>
                  <Select value={securityLevel} onValueChange={setSecurityLevel}>
                    <SelectTrigger data-testid="select-security-level"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {infrastructure.securityLevels?.map((s: any) => (
                        <SelectItem key={s.id} value={s.id}>{isAr ? s.nameAr : s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{isAr ? "الميزات" : "Features"}: {featureCount}</Label>
                  <Slider min={1} max={20} value={[featureCount]} onValueChange={(v) => setFeatureCount(v[0])} data-testid="slider-full-features" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isAr ? "المستخدمين المتوقعين" : "Expected Users"}: {expectedUsers.toLocaleString()}</Label>
                  <Slider min={100} max={100000} step={100} value={[expectedUsers]} onValueChange={(v) => setExpectedUsers(v[0])} data-testid="slider-full-users" />
                </div>
                <div className="space-y-2">
                  <Label>{isAr ? "الذروة المتزامنة" : "Peak Concurrent"}: {peakUsers.toLocaleString()}</Label>
                  <Slider min={10} max={10000} step={10} value={[peakUsers]} onValueChange={(v) => setPeakUsers(v[0])} data-testid="slider-peak-users" />
                </div>
              </div>

              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Switch checked={autoScaling} onCheckedChange={setAutoScaling} data-testid="switch-auto-scaling" />
                  <Label>{isAr ? "توسع تلقائي" : "Auto Scaling"}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={redundancy} onCheckedChange={setRedundancy} data-testid="switch-redundancy" />
                  <Label>{isAr ? "تكرار جغرافي" : "Redundancy"}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={cdnEnabled} onCheckedChange={setCdnEnabled} data-testid="switch-cdn" />
                  <Label>{isAr ? "CDN مفعّل" : "CDN Enabled"}</Label>
                </div>
              </div>

              <Button onClick={handleRunSimulation} disabled={!isOwner || runSimulationMutation.isPending} className="w-full" data-testid="button-run-simulation" title={!isOwner ? (isAr ? "صلاحية المالك مطلوبة" : "Owner access required") : ""}>
                {runSimulationMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin me-2" /> : <Play className="w-4 h-4 me-2" />}
                {isAr ? "تشغيل المحاكاة" : "Run Simulation"}
              </Button>
            </CardContent>
          </Card>

          {fullSimulation && (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <CardTitle className="text-lg">{isAr ? "نتائج المحاكاة" : "Simulation Results"}</CardTitle>
                    <Badge className={getScoreBadge(fullSimulation.overallScore)} data-testid="badge-overall-score">
                      {isAr ? "الدرجة الكلية" : "Overall Score"}: {fullSimulation.overallScore}/100
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Progress value={fullSimulation.overallScore} className="h-3" data-testid="progress-overall-score" />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 rounded-md bg-muted/50">
                      <Gauge className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                      <div className="text-xl font-bold" data-testid="text-avg-response">{fullSimulation.performanceMetrics.averageResponseTime}ms</div>
                      <p className="text-xs text-muted-foreground">{isAr ? "زمن الاستجابة" : "Avg Response"}</p>
                    </div>
                    <div className="text-center p-3 rounded-md bg-muted/50">
                      <TrendingUp className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                      <div className="text-xl font-bold" data-testid="text-throughput">{fullSimulation.performanceMetrics.throughput}/min</div>
                      <p className="text-xs text-muted-foreground">{isAr ? "الإنتاجية" : "Throughput"}</p>
                    </div>
                    <div className="text-center p-3 rounded-md bg-muted/50">
                      <Users className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                      <div className="text-xl font-bold" data-testid="text-max-users">{fullSimulation.loadTestResults.maxConcurrentUsers}</div>
                      <p className="text-xs text-muted-foreground">{isAr ? "أقصى مستخدمين" : "Max Users"}</p>
                    </div>
                    <div className="text-center p-3 rounded-md bg-muted/50">
                      <Target className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                      <div className="text-xl font-bold" data-testid="text-breaking-point">{fullSimulation.stressTestResults.breakingPoint}</div>
                      <p className="text-xs text-muted-foreground">{isAr ? "نقطة الانهيار" : "Breaking Point"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-muted-foreground" />
                      <span>CPU: {fullSimulation.performanceMetrics.cpuUtilization}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-muted-foreground" />
                      <span>Memory: {fullSimulation.performanceMetrics.memoryUtilization}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-muted-foreground" />
                      <span>DB Conn: {fullSimulation.performanceMetrics.databaseConnections}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <span>Cache: {fullSimulation.performanceMetrics.cacheHitRate}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {fullSimulation.failurePoints.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertOctagon className="w-5 h-5 text-red-500" />
                      {isAr ? "نقاط الفشل المكتشفة" : "Detected Failure Points"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-48">
                      <div className="space-y-3">
                        {fullSimulation.failurePoints.map((fp: any, i: number) => (
                          <Card key={fp.id} className="bg-muted/30">
                            <CardContent className="pt-3 pb-3">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div>
                                  <h4 className="font-medium" data-testid={`text-failure-component-${i}`}>{isAr ? fp.componentAr : fp.component}</h4>
                                  <p className="text-sm text-muted-foreground">{isAr ? fp.triggerConditionAr : fp.triggerCondition}</p>
                                </div>
                                <Badge className={getSeverityColor(fp.severity)} data-testid={`badge-failure-severity-${i}`}>
                                  {fp.severity}
                                </Badge>
                              </div>
                              <p className="text-sm"><strong>{isAr ? "التخفيف:" : "Mitigation:"}</strong> {isAr ? fp.mitigationAr : fp.mitigation}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {fullSimulation.recommendations.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-500" />
                      {isAr ? "التوصيات" : "Recommendations"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-48">
                      <div className="space-y-3">
                        {fullSimulation.recommendations.map((rec: any, i: number) => (
                          <Card key={rec.id} className="bg-muted/30">
                            <CardContent className="pt-3 pb-3">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div>
                                  <h4 className="font-medium" data-testid={`text-rec-title-${i}`}>{isAr ? rec.titleAr : rec.title}</h4>
                                  <p className="text-sm text-muted-foreground">{isAr ? rec.descriptionAr : rec.description}</p>
                                </div>
                                <Badge className={getSeverityColor(rec.priority)} data-testid={`badge-rec-priority-${i}`}>
                                  {rec.priority}
                                </Badge>
                              </div>
                              <p className="text-sm"><strong>{isAr ? "التأثير:" : "Impact:"}</strong> {isAr ? rec.impactAr : rec.impact}</p>
                              {rec.performanceGain && <Badge variant="outline" className="mt-1" data-testid={`badge-rec-gain-${i}`}>+{rec.performanceGain}% {isAr ? "أداء" : "Performance"}</Badge>}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {simulations.length === 0 ? (
            <Card className="bg-muted/30">
              <CardContent className="py-12 text-center">
                <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{isAr ? "لا توجد محاكاات سابقة" : "No previous simulations"}</p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {simulations.map((sim: any) => (
                  <Card key={sim.id} className="hover-elevate">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium" data-testid={`text-sim-name-${sim.id}`}>{sim.platformSpec.name}</h4>
                          <Badge variant="outline" data-testid={`badge-sim-type-${sim.id}`}>{sim.simulationType}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getScoreBadge(sim.overallScore)} data-testid={`badge-sim-score-${sim.id}`}>
                            {sim.overallScore}/100
                          </Badge>
                          {sim.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                          {sim.status === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                          {sim.status === 'failed' && <XCircle className="w-4 h-4 text-red-500" />}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{new Date(sim.startedAt).toLocaleString()}</span>
                        <span>{sim.failurePoints.length} {isAr ? "نقاط فشل" : "failure points"}</span>
                        <span>{sim.recommendations.length} {isAr ? "توصيات" : "recommendations"}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
