import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Rocket, 
  Globe, 
  Server, 
  Cloud,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ExternalLink,
  Copy,
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Link2,
  Shield,
  Zap,
  Activity,
  ArrowUpRight,
  Database,
  Code2,
  Layout,
  Cpu,
  Layers,
  GitBranch,
  Terminal,
  Sparkles,
  Brain,
  Workflow,
  Box
} from "lucide-react";

const translations = {
  ar: {
    title: "INFERA WebNova",
    subtitle: "نظام التشغيل الذاتي للمنصات الرقمية",
    tagline: "صمم • بنِي • انشر • طوّر - كل شيء تلقائياً",
    selectProject: "اختر مشروعاً للنشر",
    deploy: "نشر ذاتي",
    deploying: "جاري البناء والنشر...",
    redeploy: "إعادة النشر",
    rollback: "التراجع",
    stop: "إيقاف",
    environment: {
      development: "التطوير",
      staging: "التجريب",
      production: "الإنتاج"
    },
    status: {
      pending: "قيد الانتظار",
      building: "قيد البناء",
      deploying: "قيد النشر",
      running: "يعمل",
      failed: "فشل",
      rolled_back: "تم التراجع",
      stopped: "متوقف"
    },
    deployedAt: "تاريخ النشر",
    visitSite: "زيارة الموقع",
    copyUrl: "نسخ الرابط",
    copied: "تم النسخ!",
    noDeployments: "لا توجد عمليات نشر",
    startDeploy: "ابدأ النشر الأول",
    customDomain: "نطاق مخصص",
    autoScale: "التوسع التلقائي",
    ssl: "شهادة SSL",
    cdn: "شبكة توصيل المحتوى",
    history: "سجل النشر",
    current: "النشر الحالي",
    logs: "السجلات",
    confirmRollback: "هل أنت متأكد من التراجع إلى هذا الإصدار؟",
    deploySuccess: "تم النشر بنجاح!",
    deployFailed: "فشل النشر",
    capabilities: {
      title: "القدرات الذاتية",
      database: "قاعدة البيانات",
      databaseDesc: "إنشاء وهيكلة تلقائية",
      backend: "الباك إند",
      backendDesc: "بناء API ذاتي",
      frontend: "الواجهة الأمامية",
      frontendDesc: "تصميم وبناء تلقائي",
      deploy: "النشر",
      deployDesc: "نشر وتحديث مستمر",
      ai: "الذكاء الاصطناعي",
      aiDesc: "تحليل وتحسين ذاتي",
      selfUpdate: "التحديث الذاتي",
      selfUpdateDesc: "تطوير المنصة تلقائياً"
    },
    systemStatus: {
      title: "حالة النظام",
      aiOrchestrator: "المنسق الذكي",
      blueprintEngine: "محرك المخططات",
      codeGenerator: "مولد الأكواد",
      runtimeLayer: "طبقة التشغيل",
      online: "متصل",
      processing: "يعالج"
    },
    pipeline: {
      title: "خط الإنتاج الذاتي",
      analyze: "تحليل",
      design: "تصميم",
      generate: "توليد",
      build: "بناء",
      deploy: "نشر",
      monitor: "مراقبة"
    }
  },
  en: {
    title: "INFERA WebNova",
    subtitle: "Autonomous Digital Platform Operating System",
    tagline: "Design • Build • Deploy • Evolve - All Automatically",
    selectProject: "Select a project to deploy",
    deploy: "Autonomous Deploy",
    deploying: "Building & Deploying...",
    redeploy: "Redeploy",
    rollback: "Rollback",
    stop: "Stop",
    environment: {
      development: "Development",
      staging: "Staging",
      production: "Production"
    },
    status: {
      pending: "Pending",
      building: "Building",
      deploying: "Deploying",
      running: "Running",
      failed: "Failed",
      rolled_back: "Rolled Back",
      stopped: "Stopped"
    },
    deployedAt: "Deployed at",
    visitSite: "Visit Site",
    copyUrl: "Copy URL",
    copied: "Copied!",
    noDeployments: "No deployments yet",
    startDeploy: "Start your first deployment",
    customDomain: "Custom Domain",
    autoScale: "Auto-scaling",
    ssl: "SSL Certificate",
    cdn: "CDN",
    history: "History",
    current: "Current Deployment",
    logs: "Logs",
    confirmRollback: "Are you sure you want to rollback to this version?",
    deploySuccess: "Deployed successfully!",
    deployFailed: "Deployment failed",
    capabilities: {
      title: "Autonomous Capabilities",
      database: "Database",
      databaseDesc: "Auto structure & create",
      backend: "Backend",
      backendDesc: "Self-building APIs",
      frontend: "Frontend",
      frontendDesc: "Auto design & build",
      deploy: "Deploy",
      deployDesc: "Continuous deployment",
      ai: "AI Intelligence",
      aiDesc: "Self-analysis & optimization",
      selfUpdate: "Self-Update",
      selfUpdateDesc: "Platform auto-evolution"
    },
    systemStatus: {
      title: "System Status",
      aiOrchestrator: "AI Orchestrator",
      blueprintEngine: "Blueprint Engine",
      codeGenerator: "Code Generator",
      runtimeLayer: "Runtime Layer",
      online: "Online",
      processing: "Processing"
    },
    pipeline: {
      title: "Autonomous Pipeline",
      analyze: "Analyze",
      design: "Design",
      generate: "Generate",
      build: "Build",
      deploy: "Deploy",
      monitor: "Monitor"
    }
  }
};

const statusColors: Record<string, string> = {
  pending: "bg-gray-500",
  building: "bg-blue-500",
  deploying: "bg-yellow-500",
  running: "bg-green-500",
  failed: "bg-red-500",
  rolled_back: "bg-orange-500",
  stopped: "bg-gray-500"
};

interface DeploymentRun {
  id: string;
  projectId: string;
  status: string;
  environment: string;
  targetPlatform: string;
  deployedUrl?: string;
  buildLogs?: string;
  deployLogs?: string;
  createdAt: string;
  completedAt?: string;
}

export default function OneClickDeploy() {
  const { language, isRtl } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;
  const { toast } = useToast();
  
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [environment, setEnvironment] = useState<string>("production");
  const [customDomain, setCustomDomain] = useState<string>("");
  const [autoScale, setAutoScale] = useState(true);
  const [enableSSL, setEnableSSL] = useState(true);
  const [enableCDN, setEnableCDN] = useState(true);
  const [showLogsDialog, setShowLogsDialog] = useState(false);
  const [showRollbackDialog, setShowRollbackDialog] = useState(false);
  const [selectedDeploymentForLogs, setSelectedDeploymentForLogs] = useState<DeploymentRun | null>(null);
  const [selectedDeploymentForRollback, setSelectedDeploymentForRollback] = useState<DeploymentRun | null>(null);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [isDeploying, setIsDeploying] = useState(false);
  const pipelineIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { data: projects = [] } = useQuery<any[]>({
    queryKey: ["/api/projects"],
  });

  const { data: domains = [] } = useQuery<any[]>({
    queryKey: ["/api/domains"],
  });

  const { data: deployments = [] } = useQuery<DeploymentRun[]>({
    queryKey: ["/api/deployments"],
  });

  const currentDeployment = deployments.find(d => d.status === "running" || d.status === "deploying" || d.status === "building");

  // Pipeline animation effect
  useEffect(() => {
    if (isDeploying && pipelineStep < 6) {
      pipelineIntervalRef.current = setTimeout(() => {
        setPipelineStep(prev => prev + 1);
      }, 600);
    }
    return () => {
      if (pipelineIntervalRef.current) {
        clearTimeout(pipelineIntervalRef.current);
      }
    };
  }, [isDeploying, pipelineStep]);

  interface DeployPayload {
    projectId: string;
    environment: string;
    customDomain?: string;
    autoScale: boolean;
    enableSSL: boolean;
    enableCDN: boolean;
  }

  const deployMutation = useMutation({
    mutationFn: async (payload: DeployPayload) => {
      return apiRequest("POST", "/api/deployments", {
        ...payload,
        targetPlatform: "webnova",
      });
    },
    onMutate: () => {
      setIsDeploying(true);
      setPipelineStep(1);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deployments"] });
      toast({
        title: t.deploySuccess,
        description: language === "ar" ? "المنصة تعمل الآن بشكل ذاتي" : "Platform is now running autonomously",
      });
      setTimeout(() => {
        setPipelineStep(0);
        setIsDeploying(false);
      }, 2000);
    },
    onError: () => {
      toast({
        title: t.deployFailed,
        variant: "destructive",
      });
      setPipelineStep(0);
      setIsDeploying(false);
    },
  });

  const handleDeploy = () => {
    const payload: DeployPayload = {
      projectId: selectedProject,
      environment,
      customDomain: customDomain || undefined,
      autoScale,
      enableSSL,
      enableCDN,
    };
    deployMutation.mutate(payload);
  };

  const rollbackMutation = useMutation({
    mutationFn: async (deploymentId: string) => {
      return apiRequest("POST", `/api/deployments/${deploymentId}/rollback`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deployments"] });
      setShowRollbackDialog(false);
      toast({
        title: language === "ar" ? "تم التراجع بنجاح" : "Rollback successful",
      });
    },
  });

  const stopMutation = useMutation({
    mutationFn: async (deploymentId: string) => {
      return apiRequest("POST", `/api/deployments/${deploymentId}/stop`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deployments"] });
      toast({
        title: language === "ar" ? "تم إيقاف النشر" : "Deployment stopped",
      });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: t.copied });
  };

  const getDeploymentProgress = (status: string) => {
    switch (status) {
      case "pending": return 10;
      case "building": return 40;
      case "deploying": return 70;
      case "running": return 100;
      case "failed": return 100;
      default: return 0;
    }
  };

  const pipelineSteps = [
    { key: "analyze", icon: Brain, color: "text-purple-500" },
    { key: "design", icon: Layout, color: "text-blue-500" },
    { key: "generate", icon: Code2, color: "text-cyan-500" },
    { key: "build", icon: Box, color: "text-orange-500" },
    { key: "deploy", icon: Rocket, color: "text-green-500" },
    { key: "monitor", icon: Activity, color: "text-pink-500" }
  ];

  const capabilities = [
    { key: "database", icon: Database, color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    { key: "backend", icon: Server, color: "bg-green-500/10 text-green-500 border-green-500/20" },
    { key: "frontend", icon: Layout, color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
    { key: "deploy", icon: Rocket, color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
    { key: "ai", icon: Brain, color: "bg-pink-500/10 text-pink-500 border-pink-500/20" },
    { key: "selfUpdate", icon: RefreshCw, color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" }
  ];

  const systemComponents = [
    { key: "aiOrchestrator", icon: Brain, status: "online" },
    { key: "blueprintEngine", icon: Workflow, status: "online" },
    { key: "codeGenerator", icon: Code2, status: pipelineStep > 0 ? "processing" : "online" },
    { key: "runtimeLayer", icon: Cpu, status: "online" }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto" dir={isRtl ? "rtl" : "ltr"}>
      {/* Hero Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur-lg opacity-50" />
            <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="text-start">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" data-testid="text-deploy-title">
              {t.title}
            </h1>
            <p className="text-muted-foreground text-sm">{t.subtitle}</p>
          </div>
        </div>
        <p className="text-muted-foreground flex items-center justify-center gap-2">
          <Layers className="h-4 w-4" />
          {t.tagline}
        </p>
      </div>

      {/* Autonomous Pipeline Visualization */}
      <Card className="mb-6 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Workflow className="h-5 w-5 text-primary" />
            {t.pipeline.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-2">
            {pipelineSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = pipelineStep === index + 1;
              const isCompleted = pipelineStep > index + 1;
              return (
                <div key={step.key} className="flex-1 flex items-center">
                  <div className={`
                    flex flex-col items-center gap-2 flex-1 p-3 rounded-lg transition-all duration-300
                    ${isActive ? "bg-primary/10 scale-105" : isCompleted ? "bg-green-500/10" : "bg-muted/50"}
                  `}>
                    <div className={`
                      p-2 rounded-full transition-all duration-300
                      ${isActive ? "bg-primary text-primary-foreground animate-pulse" : 
                        isCompleted ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"}
                    `}>
                      {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <span className={`text-xs font-medium ${isActive ? "text-primary" : isCompleted ? "text-green-600" : "text-muted-foreground"}`}>
                      {t.pipeline[step.key as keyof typeof t.pipeline]}
                    </span>
                  </div>
                  {index < pipelineSteps.length - 1 && (
                    <div className={`h-0.5 w-4 transition-colors duration-300 ${isCompleted ? "bg-green-500" : "bg-muted"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Deployment Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Deploy Card */}
          <Card className="border-primary/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-primary" />
                {language === "ar" ? "النشر الذاتي المتكامل" : "Autonomous Full-Stack Deploy"}
              </CardTitle>
              <CardDescription>
                {language === "ar" 
                  ? "اختر مشروعك وسيتولى النظام كل شيء: قاعدة البيانات، الباك إند، الواجهة، والنشر"
                  : "Select your project and the system handles everything: Database, Backend, Frontend, and Deployment"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4" />
                    {t.selectProject}
                  </Label>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger data-testid="select-deploy-project" className="h-11">
                      <SelectValue placeholder={t.selectProject} />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          <div className="flex items-center gap-2">
                            <Box className="h-4 w-4" />
                            {project.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Terminal className="h-4 w-4" />
                    {language === "ar" ? "بيئة النشر" : "Environment"}
                  </Label>
                  <Select value={environment} onValueChange={setEnvironment}>
                    <SelectTrigger data-testid="select-environment" className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="development">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-yellow-500" />
                          {t.environment.development}
                        </div>
                      </SelectItem>
                      <SelectItem value="staging">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                          {t.environment.staging}
                        </div>
                      </SelectItem>
                      <SelectItem value="production">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          {t.environment.production}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {t.customDomain}
                  </Label>
                  <Select value={customDomain || "none"} onValueChange={(v) => setCustomDomain(v === "none" ? "" : v)}>
                    <SelectTrigger data-testid="select-custom-domain" className="h-11">
                      <SelectValue placeholder={language === "ar" ? "اختر نطاقاً" : "Select a domain"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          {language === "ar" ? "نطاق INFERA الافتراضي" : "Default INFERA Domain"}
                        </div>
                      </SelectItem>
                      {Array.isArray(domains) && domains.map((domain: any) => (
                        <SelectItem key={domain.id} value={domain.hostname || domain.id}>
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-primary" />
                            {domain.hostname}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Auto Features */}
              <div className="grid grid-cols-3 gap-3">
                <div className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors ${autoScale ? "bg-primary/5 border-primary/30" : "bg-muted/50 border-transparent"}`}>
                  <div className="flex items-center justify-between w-full">
                    <Zap className={`h-5 w-5 ${autoScale ? "text-primary" : "text-muted-foreground"}`} />
                    <Switch
                      checked={autoScale}
                      onCheckedChange={setAutoScale}
                      data-testid="switch-autoscale"
                    />
                  </div>
                  <span className="text-xs font-medium text-center">{t.autoScale}</span>
                </div>

                <div className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors ${enableSSL ? "bg-green-500/5 border-green-500/30" : "bg-muted/50 border-transparent"}`}>
                  <div className="flex items-center justify-between w-full">
                    <Shield className={`h-5 w-5 ${enableSSL ? "text-green-500" : "text-muted-foreground"}`} />
                    <Switch
                      checked={enableSSL}
                      onCheckedChange={setEnableSSL}
                      data-testid="switch-ssl"
                    />
                  </div>
                  <span className="text-xs font-medium text-center">{t.ssl}</span>
                </div>

                <div className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors ${enableCDN ? "bg-blue-500/5 border-blue-500/30" : "bg-muted/50 border-transparent"}`}>
                  <div className="flex items-center justify-between w-full">
                    <Cloud className={`h-5 w-5 ${enableCDN ? "text-blue-500" : "text-muted-foreground"}`} />
                    <Switch
                      checked={enableCDN}
                      onCheckedChange={setEnableCDN}
                      data-testid="switch-cdn"
                    />
                  </div>
                  <span className="text-xs font-medium text-center">{t.cdn}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={handleDeploy}
                disabled={!selectedProject || deployMutation.isPending}
                data-testid="button-deploy"
              >
                {deployMutation.isPending ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                    {t.deploying}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    {t.deploy}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Current Deployment */}
          {currentDeployment && (
            <Card className="border-green-500/30 bg-green-500/5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-500" />
                    {t.current}
                  </CardTitle>
                  <Badge className={`${statusColors[currentDeployment.status]} text-white`}>
                    {t.status[currentDeployment.status as keyof typeof t.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentDeployment.status !== "running" && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t.status[currentDeployment.status as keyof typeof t.status]}</span>
                      <span>{getDeploymentProgress(currentDeployment.status)}%</span>
                    </div>
                    <Progress value={getDeploymentProgress(currentDeployment.status)} className="h-2" />
                  </div>
                )}

                {currentDeployment.deployedUrl && (
                  <div className="flex items-center gap-2 p-3 bg-background rounded-lg border">
                    <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <code className="flex-1 text-sm truncate">{currentDeployment.deployedUrl}</code>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => copyToClipboard(currentDeployment.deployedUrl!)}
                        data-testid="button-copy-url"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => window.open(currentDeployment.deployedUrl, "_blank")}
                        data-testid="button-visit-site"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDeploy}
                    disabled={deployMutation.isPending}
                    data-testid="button-redeploy"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    {t.redeploy}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedDeploymentForRollback(currentDeployment);
                      setShowRollbackDialog(true);
                    }}
                    data-testid="button-rollback"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    {t.rollback}
                  </Button>
                  {currentDeployment.status === "running" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => stopMutation.mutate(currentDeployment.id)}
                      data-testid="button-stop"
                    >
                      <Pause className="h-4 w-4 mr-1" />
                      {t.stop}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Deployment History */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {t.history}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {deployments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Rocket className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>{t.noDeployments}</p>
                  <p className="text-sm">{t.startDeploy}</p>
                </div>
              ) : (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {deployments.slice(0, 10).map((deployment) => (
                      <div
                        key={deployment.id}
                        className="flex items-center justify-between gap-2 p-3 rounded-lg border hover-elevate cursor-pointer"
                        onClick={() => {
                          setSelectedDeploymentForLogs(deployment);
                          setShowLogsDialog(true);
                        }}
                        data-testid={`deployment-${deployment.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-2 w-2 rounded-full ${statusColors[deployment.status]}`} />
                          <div>
                            <p className="text-sm font-medium">
                              {t.environment[deployment.environment as keyof typeof t.environment]}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(deployment.createdAt).toLocaleString(language === "ar" ? "ar-SA" : "en-US")}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {t.status[deployment.status as keyof typeof t.status]}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - System Status & Capabilities */}
        <div className="space-y-6">
          {/* Autonomous Capabilities */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Layers className="h-5 w-5 text-primary" />
                {t.capabilities.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {capabilities.map((cap) => {
                const Icon = cap.icon;
                const title = t.capabilities[cap.key as keyof typeof t.capabilities];
                const desc = t.capabilities[`${cap.key}Desc` as keyof typeof t.capabilities];
                return (
                  <div
                    key={cap.key}
                    className={`p-3 rounded-lg border ${cap.color} transition-transform hover:scale-[1.02]`}
                  >
                    <Icon className="h-5 w-5 mb-2" />
                    <p className="text-sm font-medium">{title}</p>
                    <p className="text-xs opacity-70">{desc}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Cpu className="h-5 w-5 text-primary" />
                {t.systemStatus.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {systemComponents.map((comp) => {
                const Icon = comp.icon;
                const isProcessing = comp.status === "processing";
                return (
                  <div
                    key={comp.key}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${isProcessing ? "text-yellow-500 animate-pulse" : "text-muted-foreground"}`} />
                      <span className="text-sm font-medium">
                        {t.systemStatus[comp.key as keyof typeof t.systemStatus]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${isProcessing ? "bg-yellow-500 animate-pulse" : "bg-green-500"}`} />
                      <span className={`text-xs ${isProcessing ? "text-yellow-500" : "text-green-500"}`}>
                        {isProcessing ? t.systemStatus.processing : t.systemStatus.online}
                      </span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent className="pt-6 space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/ssl-certificates">
                  <Shield className="h-4 w-4 mr-2" />
                  {language === "ar" ? "إدارة شهادات SSL" : "Manage SSL Certificates"}
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/infrastructure">
                  <Server className="h-4 w-4 mr-2" />
                  {language === "ar" ? "البنية التحتية" : "Infrastructure"}
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/ai-suggestions">
                  <Brain className="h-4 w-4 mr-2" />
                  {language === "ar" ? "اقتراحات الذكاء" : "AI Suggestions"}
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Logs Dialog */}
      <Dialog open={showLogsDialog} onOpenChange={setShowLogsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              {t.logs}
            </DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="build">
            <TabsList className="w-full">
              <TabsTrigger value="build" className="flex-1">
                {language === "ar" ? "سجل البناء" : "Build Logs"}
              </TabsTrigger>
              <TabsTrigger value="deploy" className="flex-1">
                {language === "ar" ? "سجل النشر" : "Deploy Logs"}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="build">
              <ScrollArea className="h-[300px] bg-black rounded-lg p-4">
                <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                  {selectedDeploymentForLogs?.buildLogs || (language === "ar" ? "لا توجد سجلات" : "No logs available")}
                </pre>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="deploy">
              <ScrollArea className="h-[300px] bg-black rounded-lg p-4">
                <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                  {selectedDeploymentForLogs?.deployLogs || (language === "ar" ? "لا توجد سجلات" : "No logs available")}
                </pre>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Rollback Dialog */}
      <Dialog open={showRollbackDialog} onOpenChange={setShowRollbackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              {t.rollback}
            </DialogTitle>
            <DialogDescription>{t.confirmRollback}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowRollbackDialog(false)}>
              {language === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedDeploymentForRollback && rollbackMutation.mutate(selectedDeploymentForRollback.id)}
              disabled={rollbackMutation.isPending}
            >
              {rollbackMutation.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-2" />
              )}
              {t.rollback}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
