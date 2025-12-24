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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  GitBranch, Play, Pause, CheckCircle2, XCircle, Clock,
  Terminal, Rocket, RefreshCw, Settings, Workflow, Boxes,
  Server, Cloud, Shield, FileText, AlertTriangle, Activity,
  Loader2, ChevronRight, Package, Smartphone, Monitor, Globe
} from "lucide-react";

interface Pipeline {
  id: string;
  name: string;
  nameAr: string;
  status: 'running' | 'success' | 'failed' | 'pending' | 'cancelled';
  branch: string;
  commit: string;
  commitMessage: string;
  author: string;
  startedAt: string;
  duration: string;
  stages: PipelineStage[];
}

interface PipelineStage {
  name: string;
  nameAr: string;
  status: 'running' | 'success' | 'failed' | 'pending' | 'skipped';
  duration: string;
  logs?: string[];
}

interface DeploymentTarget {
  id: string;
  name: string;
  nameAr: string;
  type: 'web' | 'ios' | 'android' | 'desktop';
  environment: 'production' | 'staging' | 'development';
  status: 'active' | 'deploying' | 'failed' | 'inactive';
  lastDeployment: string;
  version: string;
  url?: string;
}

const mockPipelines: Pipeline[] = [
  {
    id: "1",
    name: "Production Deploy",
    nameAr: "نشر الإنتاج",
    status: "success",
    branch: "main",
    commit: "a1b2c3d",
    commitMessage: "feat: Add new dashboard widgets",
    author: "Ahmed Al-Malki",
    startedAt: "2025-12-22T10:30:00Z",
    duration: "4m 32s",
    stages: [
      { name: "Build", nameAr: "البناء", status: "success", duration: "1m 15s" },
      { name: "Test", nameAr: "الاختبار", status: "success", duration: "2m 05s" },
      { name: "Security Scan", nameAr: "فحص الأمان", status: "success", duration: "45s" },
      { name: "Deploy", nameAr: "النشر", status: "success", duration: "27s" },
    ]
  },
  {
    id: "2",
    name: "Feature Branch CI",
    nameAr: "فرع الميزة CI",
    status: "running",
    branch: "feature/user-analytics",
    commit: "e4f5g6h",
    commitMessage: "wip: User analytics dashboard",
    author: "Sara Hassan",
    startedAt: "2025-12-22T11:15:00Z",
    duration: "2m 18s",
    stages: [
      { name: "Build", nameAr: "البناء", status: "success", duration: "1m 20s" },
      { name: "Test", nameAr: "الاختبار", status: "running", duration: "58s" },
      { name: "Security Scan", nameAr: "فحص الأمان", status: "pending", duration: "-" },
      { name: "Deploy", nameAr: "النشر", status: "pending", duration: "-" },
    ]
  },
  {
    id: "3",
    name: "Hotfix Deploy",
    nameAr: "نشر الإصلاح العاجل",
    status: "failed",
    branch: "hotfix/auth-fix",
    commit: "i7j8k9l",
    commitMessage: "fix: Authentication token refresh",
    author: "Mohammed Ali",
    startedAt: "2025-12-22T09:45:00Z",
    duration: "1m 47s",
    stages: [
      { name: "Build", nameAr: "البناء", status: "success", duration: "1m 12s" },
      { name: "Test", nameAr: "الاختبار", status: "failed", duration: "35s" },
      { name: "Security Scan", nameAr: "فحص الأمان", status: "skipped", duration: "-" },
      { name: "Deploy", nameAr: "النشر", status: "skipped", duration: "-" },
    ]
  },
];

const mockDeploymentTargets: DeploymentTarget[] = [
  {
    id: "1",
    name: "Web Application",
    nameAr: "تطبيق الويب",
    type: "web",
    environment: "production",
    status: "active",
    lastDeployment: "2025-12-22T10:34:32Z",
    version: "2.4.1",
    url: "https://app.infera.io"
  },
  {
    id: "2",
    name: "iOS App",
    nameAr: "تطبيق iOS",
    type: "ios",
    environment: "production",
    status: "active",
    lastDeployment: "2025-12-20T14:22:00Z",
    version: "2.4.0",
  },
  {
    id: "3",
    name: "Android App",
    nameAr: "تطبيق Android",
    type: "android",
    environment: "production",
    status: "active",
    lastDeployment: "2025-12-20T14:22:00Z",
    version: "2.4.0",
  },
  {
    id: "4",
    name: "Staging Environment",
    nameAr: "بيئة التجريب",
    type: "web",
    environment: "staging",
    status: "deploying",
    lastDeployment: "2025-12-22T11:15:00Z",
    version: "2.5.0-beta",
    url: "https://staging.infera.io"
  },
];

interface HetznerConfig {
  githubRepo: string;
  serverIp: string;
  serverUser: string;
  appDirectory: string;
}

interface DeploymentStatus {
  status: 'idle' | 'deploying' | 'success' | 'failed';
  message: string;
  timestamp?: string;
  logs: string[];
}

export default function CICDPipeline() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pipelines");
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const isRtl = language === "ar";
  
  const [hetznerConfig, setHetznerConfig] = useState<HetznerConfig>({
    githubRepo: "mohamedalib2001/infera-webnova",
    serverIp: "",
    serverUser: "root",
    appDirectory: "/var/www/infera-webnova"
  });
  
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus>({
    status: 'idle',
    message: '',
    logs: []
  });
  
  const [showConfigDialog, setShowConfigDialog] = useState(false);

  const triggerPipelineMutation = useMutation({
    mutationFn: async (branch: string) => {
      return apiRequest('POST', '/api/cicd/trigger', { branch });
    },
    onSuccess: () => {
      toast({
        title: isRtl ? "تم بدء Pipeline" : "Pipeline Triggered",
        description: isRtl ? "بدأ تشغيل خط الأنابيب بنجاح" : "Pipeline started successfully"
      });
    },
    onError: () => {
      toast({
        title: isRtl ? "خطأ" : "Error",
        description: isRtl ? "فشل في بدء Pipeline" : "Failed to trigger pipeline",
        variant: "destructive"
      });
    }
  });

  const deployMutation = useMutation({
    mutationFn: async (targetId: string) => {
      return apiRequest('POST', `/api/cicd/deploy/${targetId}`);
    },
    onSuccess: () => {
      toast({
        title: isRtl ? "بدأ النشر" : "Deployment Started",
        description: isRtl ? "جاري نشر التطبيق..." : "Deploying application..."
      });
    },
  });

  const hetznerDeployMutation = useMutation({
    mutationFn: async () => {
      setDeploymentStatus({
        status: 'deploying',
        message: isRtl ? 'جاري النشر على السيرفر...' : 'Deploying to server...',
        logs: [
          `[${new Date().toLocaleTimeString()}] Starting deployment to Hetzner server...`,
          `[${new Date().toLocaleTimeString()}] Target: ${hetznerConfig.serverIp}`,
        ]
      });
      return apiRequest('POST', '/api/deployment/hetzner', hetznerConfig);
    },
    onSuccess: (data: any) => {
      const serverLogs = data?.logs || [];
      const serverMessage = data?.message || (isRtl ? 'تم النشر بنجاح!' : 'Deployment successful!');
      const serverInstructions = data?.instructions || [];
      
      setDeploymentStatus(prev => ({
        status: data?.status === 'pending_setup' ? 'idle' : 'success',
        message: serverMessage,
        timestamp: new Date().toISOString(),
        logs: [
          ...prev.logs,
          ...serverLogs,
          ...serverInstructions.map((i: string) => `[INFO] ${i}`),
          `[${new Date().toLocaleTimeString()}] Process completed`
        ]
      }));
      toast({
        title: isRtl ? "تم النشر" : "Deployment Triggered",
        description: serverMessage
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.message || (isRtl ? 'فشل النشر' : 'Deployment failed');
      setDeploymentStatus(prev => ({
        status: 'failed',
        message: errorMessage,
        logs: [
          ...prev.logs,
          `[${new Date().toLocaleTimeString()}] ERROR: ${errorMessage}`
        ]
      }));
      toast({
        title: isRtl ? "فشل النشر" : "Deployment Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });

  const saveHetznerConfig = () => {
    localStorage.setItem('hetzner_config', JSON.stringify(hetznerConfig));
    setShowConfigDialog(false);
    toast({
      title: isRtl ? "تم الحفظ" : "Saved",
      description: isRtl ? "تم حفظ إعدادات السيرفر" : "Server configuration saved"
    });
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { className: string; icon: React.ReactNode; label: string; labelAr: string }> = {
      running: { 
        className: "bg-blue-500/20 text-blue-600 border-blue-500/30", 
        icon: <Loader2 className="w-3 h-3 animate-spin" />,
        label: "Running",
        labelAr: "قيد التشغيل"
      },
      success: { 
        className: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30", 
        icon: <CheckCircle2 className="w-3 h-3" />,
        label: "Success",
        labelAr: "نجاح"
      },
      failed: { 
        className: "bg-red-500/20 text-red-600 border-red-500/30", 
        icon: <XCircle className="w-3 h-3" />,
        label: "Failed",
        labelAr: "فشل"
      },
      pending: { 
        className: "bg-slate-500/20 text-slate-600 border-slate-500/30", 
        icon: <Clock className="w-3 h-3" />,
        label: "Pending",
        labelAr: "في الانتظار"
      },
      skipped: { 
        className: "bg-slate-500/20 text-slate-500 border-slate-500/30", 
        icon: <ChevronRight className="w-3 h-3" />,
        label: "Skipped",
        labelAr: "تم تخطيه"
      },
      active: { 
        className: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30", 
        icon: <CheckCircle2 className="w-3 h-3" />,
        label: "Active",
        labelAr: "نشط"
      },
      deploying: { 
        className: "bg-blue-500/20 text-blue-600 border-blue-500/30", 
        icon: <Loader2 className="w-3 h-3 animate-spin" />,
        label: "Deploying",
        labelAr: "جاري النشر"
      },
      inactive: { 
        className: "bg-slate-500/20 text-slate-500 border-slate-500/30", 
        icon: <Pause className="w-3 h-3" />,
        label: "Inactive",
        labelAr: "غير نشط"
      },
    };
    const config = configs[status] || configs.pending;
    return (
      <Badge className={config.className}>
        {config.icon}
        <span className="ml-1">{isRtl ? config.labelAr : config.label}</span>
      </Badge>
    );
  };

  const getTargetIcon = (type: string) => {
    switch (type) {
      case 'web': return <Globe className="w-5 h-5" />;
      case 'ios': return <Smartphone className="w-5 h-5" />;
      case 'android': return <Smartphone className="w-5 h-5" />;
      case 'desktop': return <Monitor className="w-5 h-5" />;
      default: return <Server className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex flex-col h-screen">
        <header className="px-6 py-4 border-b border-slate-800/50 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/10 border border-violet-500/30">
                <Workflow className="w-7 h-7 text-violet-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white" data-testid="text-cicd-title">
                  {isRtl ? "خط أنابيب CI/CD" : "CI/CD Pipeline"}
                </h1>
                <p className="text-sm text-slate-400">
                  {isRtl ? "أتمتة البناء والاختبار والنشر" : "Automated build, test, and deployment"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => triggerPipelineMutation.mutate('main')}
                disabled={triggerPipelineMutation.isPending}
                data-testid="button-trigger-pipeline"
              >
                {triggerPipelineMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {isRtl ? "تشغيل Pipeline" : "Trigger Pipeline"}
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden p-6">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">{mockPipelines.filter(p => p.status === 'success').length}</p>
                    <p className="text-xs text-slate-400">{isRtl ? "ناجحة" : "Successful"}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-500/20">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">{mockPipelines.filter(p => p.status === 'running').length}</p>
                    <p className="text-xs text-slate-400">{isRtl ? "قيد التشغيل" : "Running"}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Activity className="w-5 h-5 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">{mockPipelines.filter(p => p.status === 'failed').length}</p>
                    <p className="text-xs text-slate-400">{isRtl ? "فاشلة" : "Failed"}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-red-500/20">
                    <XCircle className="w-5 h-5 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">{mockDeploymentTargets.filter(t => t.status === 'active').length}</p>
                    <p className="text-xs text-slate-400">{isRtl ? "بيئات نشطة" : "Active Environments"}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-violet-500/20">
                    <Cloud className="w-5 h-5 text-violet-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-800/50 border-slate-700/50 mb-4">
              <TabsTrigger value="pipelines" className="gap-2">
                <Workflow className="w-4 h-4" />
                {isRtl ? "خطوط الأنابيب" : "Pipelines"}
              </TabsTrigger>
              <TabsTrigger value="deployments" className="gap-2">
                <Rocket className="w-4 h-4" />
                {isRtl ? "عمليات النشر" : "Deployments"}
              </TabsTrigger>
              <TabsTrigger value="fastlane" className="gap-2">
                <Smartphone className="w-4 h-4" />
                {isRtl ? "Fastlane" : "Fastlane"}
              </TabsTrigger>
              <TabsTrigger value="hetzner" className="gap-2">
                <Server className="w-4 h-4" />
                {isRtl ? "سيرفر Hetzner" : "Hetzner Server"}
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[calc(100vh-320px)]">
              <TabsContent value="pipelines" className="mt-0">
                <div className="space-y-4">
                  {mockPipelines.map((pipeline) => (
                    <Card 
                      key={pipeline.id} 
                      className="bg-slate-800/50 border-slate-700/50 hover-elevate cursor-pointer"
                      onClick={() => setSelectedPipeline(pipeline)}
                      data-testid={`card-pipeline-${pipeline.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-slate-700/50">
                              <GitBranch className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-white">{isRtl ? pipeline.nameAr : pipeline.name}</h3>
                              <p className="text-sm text-slate-400">
                                {pipeline.branch} • {pipeline.commit}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {getStatusBadge(pipeline.status)}
                            <span className="text-sm text-slate-400 flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {pipeline.duration}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {pipeline.stages.map((stage, i) => (
                            <div key={i} className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-slate-400">{isRtl ? stage.nameAr : stage.name}</span>
                                {stage.status === 'success' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                                {stage.status === 'failed' && <XCircle className="w-3 h-3 text-red-500" />}
                                {stage.status === 'running' && <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />}
                              </div>
                              <Progress 
                                value={stage.status === 'success' ? 100 : stage.status === 'running' ? 60 : stage.status === 'failed' ? 100 : 0} 
                                className={`h-1 ${stage.status === 'failed' ? '[&>div]:bg-red-500' : stage.status === 'running' ? '[&>div]:bg-blue-500' : ''}`}
                              />
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-slate-500 mt-3">
                          {pipeline.commitMessage} • {pipeline.author}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="deployments" className="mt-0">
                <div className="grid grid-cols-2 gap-4">
                  {mockDeploymentTargets.map((target) => (
                    <Card 
                      key={target.id} 
                      className="bg-slate-800/50 border-slate-700/50"
                      data-testid={`card-deployment-${target.id}`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-slate-700/50">
                              {getTargetIcon(target.type)}
                            </div>
                            <div>
                              <CardTitle className="text-base text-white">{isRtl ? target.nameAr : target.name}</CardTitle>
                              <p className="text-xs text-slate-400 capitalize">{target.environment}</p>
                            </div>
                          </div>
                          {getStatusBadge(target.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-slate-400">{isRtl ? "الإصدار" : "Version"}</span>
                          <Badge variant="outline" className="border-slate-600 text-slate-300">{target.version}</Badge>
                        </div>
                        {target.url && (
                          <a 
                            href={target.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-violet-400 hover:underline"
                          >
                            {target.url}
                          </a>
                        )}
                        <div className="flex gap-2 mt-4">
                          <Button 
                            size="sm" 
                            className="flex-1 gap-2"
                            onClick={() => deployMutation.mutate(target.id)}
                            disabled={deployMutation.isPending || target.status === 'deploying'}
                          >
                            <Rocket className="w-4 h-4" />
                            {isRtl ? "نشر" : "Deploy"}
                          </Button>
                          <Button size="sm" variant="outline" className="gap-2">
                            <RefreshCw className="w-4 h-4" />
                            {isRtl ? "تراجع" : "Rollback"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="fastlane" className="mt-0">
                <Card className="bg-slate-800/50 border-slate-700/50 mb-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-white">
                      <Smartphone className="w-5 h-5 text-violet-500" />
                      {isRtl ? "تكوين Fastlane" : "Fastlane Configuration"}
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      {isRtl ? "أتمتة نشر تطبيقات iOS و Android" : "Automate iOS and Android app deployment"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="bg-slate-700/30 border-slate-600/50">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-blue-500/20">
                              <Smartphone className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">iOS - App Store</h4>
                              <p className="text-xs text-slate-400">TestFlight & App Store Connect</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              <span>{isRtl ? "توقيع الكود مُكوّن" : "Code signing configured"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              <span>{isRtl ? "TestFlight متصل" : "TestFlight connected"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              <span>{isRtl ? "لقطات الشاشة آلية" : "Screenshots automated"}</span>
                            </div>
                          </div>
                          <Button size="sm" className="w-full mt-4 gap-2" data-testid="button-deploy-ios">
                            <Rocket className="w-4 h-4" />
                            {isRtl ? "نشر إلى TestFlight" : "Deploy to TestFlight"}
                          </Button>
                        </CardContent>
                      </Card>
                      <Card className="bg-slate-700/30 border-slate-600/50">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-emerald-500/20">
                              <Smartphone className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">Android - Play Store</h4>
                              <p className="text-xs text-slate-400">Internal & Production Tracks</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              <span>{isRtl ? "توقيع APK مُكوّن" : "APK signing configured"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              <span>{isRtl ? "Play Console متصل" : "Play Console connected"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              <span>{isRtl ? "AAB مُفعّل" : "AAB bundle enabled"}</span>
                            </div>
                          </div>
                          <Button size="sm" className="w-full mt-4 gap-2" data-testid="button-deploy-android">
                            <Rocket className="w-4 h-4" />
                            {isRtl ? "نشر إلى Internal" : "Deploy to Internal"}
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-white">
                      <Terminal className="w-5 h-5 text-amber-500" />
                      {isRtl ? "Fastlane Lanes" : "Fastlane Lanes"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { name: "ios beta", desc: "Build and upload to TestFlight", descAr: "بناء ورفع إلى TestFlight" },
                        { name: "ios release", desc: "Submit to App Store review", descAr: "تقديم لمراجعة App Store" },
                        { name: "android beta", desc: "Build and upload to internal track", descAr: "بناء ورفع إلى المسار الداخلي" },
                        { name: "android release", desc: "Promote to production", descAr: "ترقية للإنتاج" },
                      ].map((lane, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30">
                          <div className="flex items-center gap-3">
                            <code className="px-2 py-1 rounded bg-slate-900 text-violet-400 text-sm font-mono">
                              fastlane {lane.name}
                            </code>
                            <span className="text-sm text-slate-400">{isRtl ? lane.descAr : lane.desc}</span>
                          </div>
                          <Button size="sm" variant="ghost" className="gap-2">
                            <Play className="w-4 h-4" />
                            {isRtl ? "تشغيل" : "Run"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="hetzner" className="mt-0">
                <div className="space-y-6">
                  <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-500/20">
                            <Server className="w-6 h-6 text-blue-500" />
                          </div>
                          <div>
                            <CardTitle className="text-white">
                              {isRtl ? "النشر على سيرفر Hetzner" : "Hetzner Server Deployment"}
                            </CardTitle>
                            <CardDescription>
                              {isRtl ? "نشر التطبيق مباشرة على السيرفر" : "Deploy application directly to your server"}
                            </CardDescription>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setShowConfigDialog(true)}
                          data-testid="button-hetzner-settings"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          {isRtl ? "الإعدادات" : "Settings"}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 rounded-lg bg-slate-700/30">
                          <p className="text-sm text-slate-400 mb-1">{isRtl ? "المستودع" : "Repository"}</p>
                          <p className="text-white font-mono text-sm">{hetznerConfig.githubRepo || "Not configured"}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-slate-700/30">
                          <p className="text-sm text-slate-400 mb-1">{isRtl ? "السيرفر" : "Server"}</p>
                          <p className="text-white font-mono text-sm">{hetznerConfig.serverIp || "Not configured"}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Button
                          onClick={() => hetznerDeployMutation.mutate()}
                          disabled={hetznerDeployMutation.isPending || !hetznerConfig.serverIp}
                          className="gap-2"
                          data-testid="button-deploy-hetzner"
                        >
                          {hetznerDeployMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Rocket className="w-4 h-4" />
                          )}
                          {isRtl ? "نشر الآن" : "Deploy Now"}
                        </Button>
                        
                        {!hetznerConfig.serverIp && (
                          <p className="text-sm text-amber-500 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            {isRtl ? "يرجى إعداد السيرفر أولاً" : "Please configure server first"}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {deploymentStatus.status !== 'idle' && (
                    <Card className="bg-slate-800/50 border-slate-700/50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-white">
                          <Activity className="w-5 h-5 text-blue-500" />
                          {isRtl ? "حالة النشر" : "Deployment Status"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-3 mb-4">
                          {deploymentStatus.status === 'deploying' && (
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                              <Loader2 className="w-3 h-3 animate-spin mr-1" />
                              {isRtl ? "جاري النشر..." : "Deploying..."}
                            </Badge>
                          )}
                          {deploymentStatus.status === 'success' && (
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              {isRtl ? "تم النشر بنجاح" : "Deployed Successfully"}
                            </Badge>
                          )}
                          {deploymentStatus.status === 'failed' && (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                              <XCircle className="w-3 h-3 mr-1" />
                              {isRtl ? "فشل النشر" : "Deployment Failed"}
                            </Badge>
                          )}
                          <span className="text-sm text-slate-400">{deploymentStatus.message}</span>
                        </div>
                        
                        <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm max-h-60 overflow-auto">
                          {deploymentStatus.logs.map((log, i) => (
                            <div key={i} className="text-slate-300">{log}</div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-white">
                        <FileText className="w-5 h-5 text-amber-500" />
                        {isRtl ? "دليل الإعداد" : "Setup Guide"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 text-slate-300">
                        <div className="flex items-start gap-3">
                          <Badge variant="outline" className="mt-0.5">1</Badge>
                          <div>
                            <p className="font-medium">{isRtl ? "أدخل عنوان IP السيرفر" : "Enter Server IP Address"}</p>
                            <p className="text-sm text-slate-400">{isRtl ? "اضغط على الإعدادات وأدخل عنوان IP" : "Click Settings and enter your server IP"}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Badge variant="outline" className="mt-0.5">2</Badge>
                          <div>
                            <p className="font-medium">{isRtl ? "أعد SSH Key" : "Setup SSH Key"}</p>
                            <p className="text-sm text-slate-400">{isRtl ? "أضف مفتاح SSH في GitHub Secrets" : "Add SSH key in GitHub Secrets"}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Badge variant="outline" className="mt-0.5">3</Badge>
                          <div>
                            <p className="font-medium">{isRtl ? "اضغط نشر الآن" : "Click Deploy Now"}</p>
                            <p className="text-sm text-slate-400">{isRtl ? "سيتم نشر التطبيق تلقائياً" : "Application will be deployed automatically"}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </main>
      </div>

      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              {isRtl ? "إعدادات سيرفر Hetzner" : "Hetzner Server Settings"}
            </DialogTitle>
            <DialogDescription>
              {isRtl ? "أدخل بيانات السيرفر للنشر التلقائي" : "Enter server details for automatic deployment"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="githubRepo" className="text-slate-300">
                {isRtl ? "مستودع GitHub" : "GitHub Repository"}
              </Label>
              <Input
                id="githubRepo"
                value={hetznerConfig.githubRepo}
                onChange={(e) => setHetznerConfig({...hetznerConfig, githubRepo: e.target.value})}
                placeholder="username/repository"
                className="bg-slate-700 border-slate-600 text-white"
                data-testid="input-github-repo"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="serverIp" className="text-slate-300">
                {isRtl ? "عنوان IP السيرفر" : "Server IP Address"}
              </Label>
              <Input
                id="serverIp"
                value={hetznerConfig.serverIp}
                onChange={(e) => setHetznerConfig({...hetznerConfig, serverIp: e.target.value})}
                placeholder="123.45.67.89"
                className="bg-slate-700 border-slate-600 text-white"
                data-testid="input-server-ip"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="serverUser" className="text-slate-300">
                {isRtl ? "اسم المستخدم" : "Server User"}
              </Label>
              <Input
                id="serverUser"
                value={hetznerConfig.serverUser}
                onChange={(e) => setHetznerConfig({...hetznerConfig, serverUser: e.target.value})}
                placeholder="root"
                className="bg-slate-700 border-slate-600 text-white"
                data-testid="input-server-user"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="appDirectory" className="text-slate-300">
                {isRtl ? "مجلد التطبيق" : "Application Directory"}
              </Label>
              <Input
                id="appDirectory"
                value={hetznerConfig.appDirectory}
                onChange={(e) => setHetznerConfig({...hetznerConfig, appDirectory: e.target.value})}
                placeholder="/var/www/myapp"
                className="bg-slate-700 border-slate-600 text-white"
                data-testid="input-app-directory"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
              {isRtl ? "إلغاء" : "Cancel"}
            </Button>
            <Button onClick={saveHetznerConfig} data-testid="button-save-config">
              {isRtl ? "حفظ" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
