import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Smartphone,
  Monitor,
  Apple,
  Laptop,
  Globe,
  Play,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Plus,
  Settings,
  Package,
  Layers,
  RefreshCw,
  QrCode,
  Copy,
  ExternalLink,
  Zap,
} from "lucide-react";
import { SiAndroid, SiApple, SiLinux } from "react-icons/si";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  name: string;
  appName: string;
}

interface QRDialogState {
  isOpen: boolean;
  url: string;
  platform: string;
  version: string;
}

interface BuildConfig {
  id: string;
  projectId: string;
  platform: string;
  buildType: string;
  appName: string;
  appNameAr?: string;
  version: string;
  bundleId?: string;
  isActive: boolean;
  createdAt: string;
}

interface BuildJob {
  id: string;
  projectId: string;
  configId: string;
  platform: string;
  version: string;
  status: string;
  progress: number;
  currentStep?: string;
  currentStepAr?: string;
  errorMessage?: string;
  artifacts?: { type: string; url: string; size: number }[];
  queuedAt: string;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
}

const PLATFORMS = [
  { id: "web", name: "الويب", nameEn: "Web", icon: Globe, color: "text-blue-500" },
  { id: "android", name: "أندرويد", nameEn: "Android", icon: SiAndroid, color: "text-green-500" },
  { id: "ios", name: "آي أو إس", nameEn: "iOS", icon: SiApple, color: "text-gray-500" },
  { id: "windows", name: "ويندوز", nameEn: "Windows", icon: Monitor, color: "text-cyan-500" },
  { id: "macos", name: "ماك", nameEn: "macOS", icon: SiApple, color: "text-gray-500" },
  { id: "linux", name: "لينكس", nameEn: "Linux", icon: SiLinux, color: "text-orange-500" },
];

export default function BuildManager() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [showNewConfigDialog, setShowNewConfigDialog] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("web");
  const [qrDialog, setQRDialog] = useState<QRDialogState>({
    isOpen: false,
    url: "",
    platform: "",
    version: "",
  });
  const { toast } = useToast();

  const generateQRCodeSVG = (data: string) => {
    const size = 25;
    const modules: boolean[][] = [];
    
    // Simple QR-like pattern (placeholder - in production use qrcode library)
    const hash = data.split('').reduce((acc, char) => ((acc << 5) - acc) + char.charCodeAt(0), 0);
    for (let i = 0; i < size; i++) {
      modules[i] = [];
      for (let j = 0; j < size; j++) {
        // Fixed patterns for finder patterns
        const isFinderPattern = (
          (i < 7 && j < 7) || 
          (i < 7 && j >= size - 7) || 
          (i >= size - 7 && j < 7)
        );
        
        if (isFinderPattern) {
          const fi = i % (size - 7) < 7 ? i : i - (size - 7);
          const fj = j < 7 ? j : (j >= size - 7 ? j - (size - 7) : j);
          modules[i][j] = (
            (fi === 0 || fi === 6 || fj === 0 || fj === 6) ||
            (fi >= 2 && fi <= 4 && fj >= 2 && fj <= 4)
          );
        } else {
          // Data pattern based on hash
          modules[i][j] = ((hash >> ((i * size + j) % 32)) & 1) === 1;
        }
      }
    }
    
    const cellSize = 8;
    const svgSize = size * cellSize;
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}">`;
    svg += `<rect width="${svgSize}" height="${svgSize}" fill="white"/>`;
    
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (modules[i][j]) {
          svg += `<rect x="${j * cellSize}" y="${i * cellSize}" width="${cellSize}" height="${cellSize}" fill="black"/>`;
        }
      }
    }
    svg += '</svg>';
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "تم النسخ", description: "تم نسخ الرابط إلى الحافظة" });
  };

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: buildsData, isLoading: buildsLoading } = useQuery<{
    configs: BuildConfig[];
    jobs: BuildJob[];
  }>({
    queryKey: ["/api/nova/builds", selectedProjectId],
    enabled: !!selectedProjectId,
  });

  const createConfigMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", `/api/nova/builds/${selectedProjectId}/config`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nova/builds", selectedProjectId] });
      setShowNewConfigDialog(false);
      toast({ title: "تم إنشاء الإعداد", description: "Build config created" });
    },
  });

  const startBuildMutation = useMutation({
    mutationFn: async (configId: string) => {
      return apiRequest("POST", `/api/nova/builds/${selectedProjectId}/start`, { configId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nova/builds", selectedProjectId] });
      toast({ title: "بدأ البناء", description: "Build started" });
    },
  });

  const configs = buildsData?.configs || [];
  const jobs = buildsData?.jobs || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500" data-testid="badge-status-completed"><CheckCircle className="w-3 h-3 mr-1" /> مكتمل</Badge>;
      case "building":
      case "packaging":
      case "signing":
        return <Badge className="bg-blue-500" data-testid="badge-status-building"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> جاري</Badge>;
      case "failed":
        return <Badge variant="destructive" data-testid="badge-status-failed"><XCircle className="w-3 h-3 mr-1" /> فشل</Badge>;
      case "queued":
        return <Badge variant="secondary" data-testid="badge-status-queued"><Clock className="w-3 h-3 mr-1" /> في الانتظار</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPlatformIcon = (platform: string) => {
    const platformInfo = PLATFORMS.find(p => p.id === platform);
    if (!platformInfo) return <Globe className="w-5 h-5" />;
    const Icon = platformInfo.icon;
    return <Icon className={`w-5 h-5 ${platformInfo.color}`} />;
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">مدير البناء</h1>
          <p className="text-muted-foreground">Build Manager - بناء التطبيقات لجميع المنصات</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-64" data-testid="select-project">
              <SelectValue placeholder="اختر مشروعاً" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id} data-testid={`select-item-project-${project.id}`}>
                  {project.appName || project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" data-testid="button-refresh">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!selectedProjectId ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">اختر مشروعاً لإدارة عمليات البناء</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {PLATFORMS.map((platform) => {
              const platformConfigs = configs.filter(c => c.platform === platform.id);
              const platformJobs = jobs.filter(j => j.platform === platform.id);
              const lastJob = platformJobs[0];
              const Icon = platform.icon;

              return (
                <Card
                  key={platform.id}
                  className={`cursor-pointer transition-all hover-elevate ${selectedPlatform === platform.id ? "ring-2 ring-primary" : ""}`}
                  onClick={() => setSelectedPlatform(platform.id)}
                  data-testid={`card-platform-${platform.id}`}
                >
                  <CardContent className="pt-6 text-center">
                    <Icon className={`w-10 h-10 mx-auto mb-2 ${platform.color}`} />
                    <p className="font-medium">{platform.name}</p>
                    <p className="text-xs text-muted-foreground">{platform.nameEn}</p>
                    <div className="mt-2">
                      {platformConfigs.length > 0 ? (
                        <Badge variant="secondary" className="text-xs">
                          {platformConfigs.length} إعداد
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">غير مُعد</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Tabs defaultValue="builds" className="space-y-4">
            <TabsList>
              <TabsTrigger value="builds" data-testid="tab-builds">
                <Layers className="w-4 h-4 ml-2" />
                عمليات البناء
              </TabsTrigger>
              <TabsTrigger value="configs" data-testid="tab-configs">
                <Settings className="w-4 h-4 ml-2" />
                إعدادات البناء
              </TabsTrigger>
            </TabsList>

            <TabsContent value="builds" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                  <div>
                    <CardTitle>سجل عمليات البناء - {PLATFORMS.find(p => p.id === selectedPlatform)?.name}</CardTitle>
                    <CardDescription>عمليات البناء لهذه المنصة</CardDescription>
                  </div>
                  {configs.some(c => c.platform === selectedPlatform) && (
                    <Button
                      onClick={() => {
                        const config = configs.find(c => c.platform === selectedPlatform);
                        if (config) startBuildMutation.mutate(config.id);
                      }}
                      disabled={startBuildMutation.isPending}
                      data-testid="button-start-build"
                    >
                      {startBuildMutation.isPending ? (
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 ml-2" />
                      )}
                      بدء البناء
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {buildsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : jobs.filter(j => j.platform === selectedPlatform).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>لا توجد عمليات بناء لهذه المنصة</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {jobs.filter(j => j.platform === selectedPlatform).map((job) => (
                        <div key={job.id} className="border rounded-md p-4" data-testid={`build-job-${job.id}`}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {getPlatformIcon(job.platform)}
                              <div>
                                <p className="font-medium">v{job.version}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(job.queuedAt).toLocaleString("ar-SA")}
                                </p>
                              </div>
                            </div>
                            {getStatusBadge(job.status)}
                          </div>
                          
                          {(job.status === "building" || job.status === "packaging" || job.status === "signing") && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span>{job.currentStepAr || job.currentStep || "جاري البناء..."}</span>
                                <span>{job.progress}%</span>
                              </div>
                              <Progress value={job.progress} />
                            </div>
                          )}

                          {job.status === "failed" && job.errorMessage && (
                            <div className="mt-2 p-2 bg-destructive/10 rounded text-sm text-destructive">
                              {job.errorMessage}
                            </div>
                          )}

                          {job.status === "completed" && job.artifacts && job.artifacts.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {job.artifacts.map((artifact, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                                  <div className="flex items-center gap-2">
                                    <Package className="w-4 h-4" />
                                    <span className="text-sm">{artifact.type}</span>
                                    <span className="text-xs text-muted-foreground">
                                      ({formatBytes(artifact.size)})
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setQRDialog({
                                        isOpen: true,
                                        url: artifact.url,
                                        platform: job.platform,
                                        version: job.version,
                                      })}
                                      data-testid={`button-qr-${job.id}-${idx}`}
                                    >
                                      <QrCode className="w-3 h-3 ml-1" />
                                      QR
                                    </Button>
                                    <Button variant="outline" size="sm" asChild>
                                      <a href={artifact.url} download>
                                        <Download className="w-3 h-3 ml-1" />
                                        تحميل
                                      </a>
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {job.duration && (
                            <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              مدة البناء: {Math.floor(job.duration / 60)}د {job.duration % 60}ث
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="configs" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                  <div>
                    <CardTitle>إعدادات البناء - {PLATFORMS.find(p => p.id === selectedPlatform)?.name}</CardTitle>
                    <CardDescription>تكوين إعدادات البناء لهذه المنصة</CardDescription>
                  </div>
                  <Dialog open={showNewConfigDialog} onOpenChange={setShowNewConfigDialog}>
                    <DialogTrigger asChild>
                      <Button data-testid="button-new-config">
                        <Plus className="w-4 h-4 ml-2" />
                        إعداد جديد
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>إنشاء إعداد بناء جديد</DialogTitle>
                        <DialogDescription>حدد إعدادات البناء للمنصة المحددة</DialogDescription>
                      </DialogHeader>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          createConfigMutation.mutate({
                            platform: selectedPlatform,
                            name: formData.get("appName"),
                            version: formData.get("version"),
                            bundleId: formData.get("bundleId"),
                          });
                        }}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <Label>اسم التطبيق</Label>
                          <Input name="appName" placeholder="My App" required />
                        </div>
                        <div className="space-y-2">
                          <Label>الإصدار</Label>
                          <Input name="version" placeholder="1.0.0" defaultValue="1.0.0" />
                        </div>
                        {(selectedPlatform === "android" || selectedPlatform === "ios") && (
                          <div className="space-y-2">
                            <Label>Bundle ID</Label>
                            <Input name="bundleId" placeholder="com.company.app" />
                          </div>
                        )}
                        <DialogFooter>
                          <Button type="submit" disabled={createConfigMutation.isPending}>
                            {createConfigMutation.isPending && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                            إنشاء
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {configs.filter(c => c.platform === selectedPlatform).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>لا توجد إعدادات لهذه المنصة</p>
                      <p className="text-sm">أنشئ إعداداً جديداً للبدء</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {configs.filter(c => c.platform === selectedPlatform).map((config) => (
                        <div key={config.id} className="flex items-center justify-between p-4 border rounded-md" data-testid={`config-item-${config.id}`}>
                          <div className="flex items-center gap-4">
                            {getPlatformIcon(config.platform)}
                            <div>
                              <p className="font-medium">{config.appNameAr || config.appName}</p>
                              <p className="text-sm text-muted-foreground">
                                v{config.version} | {config.buildType}
                              </p>
                              {config.bundleId && (
                                <p className="text-xs text-muted-foreground">{config.bundleId}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={config.isActive ? "default" : "secondary"}>
                              {config.isActive ? "نشط" : "غير نشط"}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startBuildMutation.mutate(config.id)}
                              disabled={startBuildMutation.isPending}
                              data-testid={`button-build-${config.id}`}
                            >
                              <Play className="w-3 h-3 ml-1" />
                              بناء
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      <Dialog open={qrDialog.isOpen} onOpenChange={(open) => setQRDialog({ ...qrDialog, isOpen: open })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              رمز QR للتحميل
            </DialogTitle>
            <DialogDescription>
              امسح الرمز لتحميل التطبيق على جهازك
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="bg-white p-4 rounded-md">
              <img
                src={generateQRCodeSVG(qrDialog.url)}
                alt="QR Code"
                className="w-48 h-48"
                data-testid="img-qr-code"
              />
              <p className="text-xs text-center mt-2 text-muted-foreground">
                استخدم تطبيق الكاميرا لمسح الرمز
              </p>
            </div>
            <div className="text-center">
              <Badge className="mb-2">
                {PLATFORMS.find(p => p.id === qrDialog.platform)?.name || qrDialog.platform}
              </Badge>
              <p className="text-sm text-muted-foreground">الإصدار: {qrDialog.version}</p>
            </div>
            <div className="flex items-center gap-2 w-full">
              <Input
                value={qrDialog.url}
                readOnly
                className="text-xs"
                data-testid="input-artifact-url"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(qrDialog.url)}
                data-testid="button-copy-url"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                asChild
              >
                <a href={qrDialog.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
