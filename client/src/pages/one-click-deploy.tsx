import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
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
  Settings,
  Smartphone,
  Monitor,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Link2,
  Shield,
  Zap,
  Activity,
  ArrowUpRight
} from "lucide-react";

const translations = {
  ar: {
    title: "النشر بنقرة واحدة",
    subtitle: "انشر تطبيقك للعالم بضغطة زر",
    selectProject: "اختر مشروعاً",
    deploy: "نشر",
    deploying: "جاري النشر...",
    redeploy: "إعادة النشر",
    rollback: "التراجع",
    stop: "إيقاف",
    platforms: {
      web: "الويب",
      mobile: "الجوال",
      desktop: "سطح المكتب",
      all: "جميع المنصات"
    },
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
    analytics: "التحليلات",
    history: "سجل النشر",
    settings: "الإعدادات",
    current: "الحالي",
    logs: "السجلات",
    confirmRollback: "هل أنت متأكد من التراجع إلى هذا الإصدار؟",
    deploySuccess: "تم النشر بنجاح!",
    deployFailed: "فشل النشر"
  },
  en: {
    title: "One-Click Deploy",
    subtitle: "Deploy your app to the world with a single click",
    selectProject: "Select a project",
    deploy: "Deploy",
    deploying: "Deploying...",
    redeploy: "Redeploy",
    rollback: "Rollback",
    stop: "Stop",
    platforms: {
      web: "Web",
      mobile: "Mobile",
      desktop: "Desktop",
      all: "All Platforms"
    },
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
    analytics: "Analytics",
    history: "History",
    settings: "Settings",
    current: "Current",
    logs: "Logs",
    confirmRollback: "Are you sure you want to rollback to this version?",
    deploySuccess: "Deployed successfully!",
    deployFailed: "Deployment failed"
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
  const [targetPlatform, setTargetPlatform] = useState<string>("web");
  const [environment, setEnvironment] = useState<string>("production");
  const [customDomain, setCustomDomain] = useState<string>("");
  const [autoScale, setAutoScale] = useState(true);
  const [enableSSL, setEnableSSL] = useState(true);
  const [enableCDN, setEnableCDN] = useState(true);
  const [showRollbackDialog, setShowRollbackDialog] = useState(false);
  const [selectedDeployment, setSelectedDeployment] = useState<DeploymentRun | null>(null);

  const { data: projectsData } = useQuery<{ success: boolean; projects: any[] }>({
    queryKey: ["/api/projects"],
  });
  const projects = projectsData?.projects || [];

  const { data: deploymentsData, isLoading: deploymentsLoading } = useQuery<{ success: boolean; deployments: DeploymentRun[] }>({
    queryKey: ["/api/deployments", selectedProject],
    enabled: !!selectedProject,
    refetchInterval: 5000,
  });
  const deployments = deploymentsData?.deployments || [];

  const currentDeployment = deployments.find(d => d.status === "running");
  const deploymentHistory = deployments.filter(d => d.status !== "running");

  const deployMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/deployments/deploy`, {
        projectId: selectedProject,
        targetPlatform,
        environment,
        customDomain: customDomain || undefined,
        autoScale,
        enableSSL,
        enableCDN
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deployments"] });
      toast({
        title: t.deploySuccess,
      });
    },
    onError: () => {
      toast({
        title: t.deployFailed,
        variant: "destructive",
      });
    },
  });

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
    toast({
      title: t.copied,
    });
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

  return (
    <div className="p-6 max-w-7xl mx-auto" dir={isRtl ? "rtl" : "ltr"}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3" data-testid="text-deploy-title">
          <Rocket className="h-8 w-8 text-blue-500" />
          {t.title}
        </h1>
        <p className="text-muted-foreground mt-1">{t.subtitle}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {language === "ar" ? "إعدادات النشر" : "Deployment Settings"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.selectProject}</Label>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger data-testid="select-deploy-project">
                      <SelectValue placeholder={t.selectProject} />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{language === "ar" ? "المنصة المستهدفة" : "Target Platform"}</Label>
                  <Select value={targetPlatform} onValueChange={setTargetPlatform}>
                    <SelectTrigger data-testid="select-platform">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          {t.platforms.web}
                        </div>
                      </SelectItem>
                      <SelectItem value="mobile">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4" />
                          {t.platforms.mobile}
                        </div>
                      </SelectItem>
                      <SelectItem value="desktop">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          {t.platforms.desktop}
                        </div>
                      </SelectItem>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <Server className="h-4 w-4" />
                          {t.platforms.all}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{language === "ar" ? "البيئة" : "Environment"}</Label>
                  <Select value={environment} onValueChange={setEnvironment}>
                    <SelectTrigger data-testid="select-environment">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="development">{t.environment.development}</SelectItem>
                      <SelectItem value="staging">{t.environment.staging}</SelectItem>
                      <SelectItem value="production">{t.environment.production}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t.customDomain}</Label>
                  <Input
                    placeholder="example.com"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    data-testid="input-custom-domain"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <Label>{t.autoScale}</Label>
                  </div>
                  <Switch
                    checked={autoScale}
                    onCheckedChange={setAutoScale}
                    data-testid="switch-autoscale"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <Label>{t.ssl}</Label>
                  </div>
                  <Switch
                    checked={enableSSL}
                    onCheckedChange={setEnableSSL}
                    data-testid="switch-ssl"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cloud className="h-4 w-4 text-blue-500" />
                    <Label>{t.cdn}</Label>
                  </div>
                  <Switch
                    checked={enableCDN}
                    onCheckedChange={setEnableCDN}
                    data-testid="switch-cdn"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                onClick={() => deployMutation.mutate()}
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
                    <Rocket className="h-5 w-5 mr-2" />
                    {t.deploy}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {currentDeployment && (
            <Card className="border-green-500/50">
              <CardHeader>
                <div className="flex items-center justify-between">
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
                    <Progress value={getDeploymentProgress(currentDeployment.status)} />
                  </div>
                )}

                {currentDeployment.deployedUrl && (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Link2 className="h-4 w-4 text-muted-foreground" />
                    <code className="flex-1 text-sm">{currentDeployment.deployedUrl}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(currentDeployment.deployedUrl!)}
                      data-testid="button-copy-url"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      asChild
                    >
                      <a href={currentDeployment.deployedUrl} target="_blank" rel="noopener noreferrer" data-testid="link-visit-site">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => deployMutation.mutate()}
                    disabled={deployMutation.isPending}
                    data-testid="button-redeploy"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {t.redeploy}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => stopMutation.mutate(currentDeployment.id)}
                    disabled={stopMutation.isPending}
                    data-testid="button-stop"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    {t.stop}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {t.history}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedProject ? (
                <div className="text-center py-8">
                  <Server className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t.selectProject}</p>
                </div>
              ) : deploymentsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : deployments.length === 0 ? (
                <div className="text-center py-8">
                  <Rocket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t.noDeployments}</p>
                  <Button
                    className="mt-4"
                    onClick={() => deployMutation.mutate()}
                    disabled={!selectedProject}
                    data-testid="button-first-deploy"
                  >
                    {t.startDeploy}
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-80">
                  <div className="space-y-3">
                    {deployments.map((deployment) => (
                      <div
                        key={deployment.id}
                        className="p-3 border rounded-lg hover-elevate"
                        data-testid={`card-deployment-${deployment.id}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={`${statusColors[deployment.status]} text-white text-xs`}>
                            {t.status[deployment.status as keyof typeof t.status]}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(deployment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>{t.environment[deployment.environment as keyof typeof t.environment]}</span>
                          {deployment.status !== "running" && deployment.status !== "failed" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedDeployment(deployment);
                                setShowRollbackDialog(true);
                              }}
                              data-testid={`button-rollback-${deployment.id}`}
                            >
                              <RotateCcw className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {language === "ar" ? "حالة النظام" : "System Status"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">{language === "ar" ? "الخوادم" : "Servers"}</span>
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {language === "ar" ? "متصل" : "Online"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{language === "ar" ? "شبكة CDN" : "CDN"}</span>
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {language === "ar" ? "نشط" : "Active"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{language === "ar" ? "شهادات SSL" : "SSL Certs"}</span>
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  <Shield className="h-3 w-3 mr-1" />
                  {language === "ar" ? "صالحة" : "Valid"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showRollbackDialog} onOpenChange={setShowRollbackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.rollback}</DialogTitle>
            <DialogDescription>{t.confirmRollback}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRollbackDialog(false)}>
              {language === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              onClick={() => {
                if (selectedDeployment) {
                  rollbackMutation.mutate(selectedDeployment.id);
                }
              }}
              disabled={rollbackMutation.isPending}
              data-testid="button-confirm-rollback"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {t.rollback}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
