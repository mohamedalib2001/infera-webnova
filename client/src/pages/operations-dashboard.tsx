import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  Cloud,
  Server,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  RefreshCw,
  Bell,
  BellOff,
  Rocket,
  Globe,
  Shield,
  TrendingUp,
  XCircle,
  Loader2,
  Plus,
} from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  name: string;
  appName: string;
}

interface DeploymentConfig {
  id: string;
  projectId: string;
  environment: string;
  provider: string;
  domain?: string;
  customDomain?: string;
  sslEnabled: boolean;
  cdnEnabled: boolean;
  autoScale: boolean;
  minInstances: number;
  maxInstances: number;
  isActive: boolean;
}

interface Deployment {
  id: string;
  projectId: string;
  version: string;
  status: string;
  deploymentUrl?: string;
  startedAt: string;
  completedAt?: string;
  duration?: number;
}

interface HealthAlert {
  id: string;
  projectId: string;
  alertType: string;
  severity: string;
  title: string;
  titleAr?: string;
  message: string;
  status: string;
  createdAt: string;
}

interface MetricsSnapshot {
  id: string;
  responseTimeAvg?: number;
  responseTimeP95?: number;
  errorRate?: number;
  successRate?: number;
  requestsPerMinute?: number;
  cpuUsage?: number;
  memoryUsage?: number;
  diskUsage?: number;
  isHealthy: boolean;
  timestamp: string;
}

export default function OperationsDashboard() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [showNewConfigDialog, setShowNewConfigDialog] = useState(false);
  const { toast } = useToast();

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: operationsData, isLoading: operationsLoading } = useQuery<{
    deployments: Deployment[];
    configs: DeploymentConfig[];
  }>({
    queryKey: ["/api/nova/deployments", selectedProjectId],
    enabled: !!selectedProjectId,
  });

  const { data: alerts = [], isLoading: alertsLoading } = useQuery<HealthAlert[]>({
    queryKey: ["/api/nova/alerts", selectedProjectId],
    enabled: !!selectedProjectId,
  });

  const { data: metrics = [], isLoading: metricsLoading } = useQuery<MetricsSnapshot[]>({
    queryKey: ["/api/nova/metrics", selectedProjectId],
    enabled: !!selectedProjectId,
  });

  const acknowledgeAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      return apiRequest("PATCH", `/api/nova/alerts/${alertId}/acknowledge`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nova/alerts", selectedProjectId] });
      toast({ title: "تم تأكيد التنبيه", description: "Alert acknowledged" });
    },
  });

  const createConfigMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", `/api/nova/deployments/${selectedProjectId}/config`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nova/deployments", selectedProjectId] });
      setShowNewConfigDialog(false);
      toast({ title: "تم إنشاء الإعداد", description: "Config created successfully" });
    },
  });

  const latestMetric = metrics[0];
  const activeAlerts = alerts.filter(a => a.status === "active");
  const deployments = operationsData?.deployments || [];
  const configs = operationsData?.configs || [];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500";
      case "warning": return "bg-yellow-500";
      default: return "bg-blue-500";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return <Badge className="bg-green-500" data-testid="badge-status-live"><CheckCircle className="w-3 h-3 mr-1" /> Live</Badge>;
      case "building":
        return <Badge className="bg-blue-500" data-testid="badge-status-building"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Building</Badge>;
      case "failed":
        return <Badge variant="destructive" data-testid="badge-status-failed"><XCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
      case "pending":
        return <Badge variant="secondary" data-testid="badge-status-pending"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      default:
        return <Badge variant="outline" data-testid="badge-status-default">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">مركز العمليات</h1>
          <p className="text-muted-foreground">Operations Dashboard - مراقبة وإدارة النشر</p>
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
            <Server className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">اختر مشروعاً لعرض بيانات العمليات</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card data-testid="card-health-status">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">حالة الصحة</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {latestMetric?.isHealthy ? (
                    <span className="text-green-500">صحي</span>
                  ) : (
                    <span className="text-red-500">يحتاج انتباه</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {activeAlerts.length} تنبيهات نشطة
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-response-time">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">وقت الاستجابة</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {latestMetric?.responseTimeAvg?.toFixed(0) || "--"} ms
                </div>
                <p className="text-xs text-muted-foreground">
                  P95: {latestMetric?.responseTimeP95?.toFixed(0) || "--"} ms
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-success-rate">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">معدل النجاح</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {latestMetric?.successRate?.toFixed(1) || "--"}%
                </div>
                <Progress value={latestMetric?.successRate || 0} className="mt-2" />
              </CardContent>
            </Card>

            <Card data-testid="card-cpu-usage">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">استخدام CPU</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {latestMetric?.cpuUsage?.toFixed(1) || "--"}%
                </div>
                <Progress value={latestMetric?.cpuUsage || 0} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="deployments" className="space-y-4">
            <TabsList>
              <TabsTrigger value="deployments" data-testid="tab-deployments">
                <Rocket className="w-4 h-4 ml-2" />
                عمليات النشر
              </TabsTrigger>
              <TabsTrigger value="alerts" data-testid="tab-alerts">
                <Bell className="w-4 h-4 ml-2" />
                التنبيهات
                {activeAlerts.length > 0 && (
                  <Badge variant="destructive" className="mr-2">{activeAlerts.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="configs" data-testid="tab-configs">
                <Server className="w-4 h-4 ml-2" />
                إعدادات النشر
              </TabsTrigger>
            </TabsList>

            <TabsContent value="deployments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>سجل عمليات النشر</CardTitle>
                  <CardDescription>آخر عمليات النشر للمشروع</CardDescription>
                </CardHeader>
                <CardContent>
                  {operationsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : deployments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Rocket className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>لا توجد عمليات نشر بعد</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {deployments.map((deployment) => (
                        <div key={deployment.id} className="flex items-center justify-between p-4 border rounded-md" data-testid={`deployment-item-${deployment.id}`}>
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="font-medium">v{deployment.version}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(deployment.startedAt).toLocaleString("ar-SA")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {deployment.deploymentUrl && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={deployment.deploymentUrl} target="_blank" rel="noopener noreferrer">
                                  <Globe className="w-3 h-3 ml-1" />
                                  فتح
                                </a>
                              </Button>
                            )}
                            {getStatusBadge(deployment.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>التنبيهات الصحية</CardTitle>
                  <CardDescription>مراقبة حالة التطبيق والأداء</CardDescription>
                </CardHeader>
                <CardContent>
                  {alertsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : alerts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                      <p>لا توجد تنبيهات - كل شيء يعمل بشكل جيد</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {alerts.map((alert) => (
                        <div key={alert.id} className="flex items-start justify-between p-4 border rounded-md" data-testid={`alert-item-${alert.id}`}>
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${getSeverityColor(alert.severity)}`} />
                            <div>
                              <p className="font-medium">{alert.titleAr || alert.title}</p>
                              <p className="text-sm text-muted-foreground">{alert.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(alert.createdAt).toLocaleString("ar-SA")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={alert.status === "active" ? "destructive" : "secondary"}>
                              {alert.status === "active" ? "نشط" : alert.status === "acknowledged" ? "تم التأكيد" : "محلول"}
                            </Badge>
                            {alert.status === "active" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => acknowledgeAlertMutation.mutate(alert.id)}
                                disabled={acknowledgeAlertMutation.isPending}
                                data-testid={`button-acknowledge-${alert.id}`}
                              >
                                <BellOff className="w-3 h-3 ml-1" />
                                تأكيد
                              </Button>
                            )}
                          </div>
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
                    <CardTitle>إعدادات النشر</CardTitle>
                    <CardDescription>إعدادات البيئات المختلفة</CardDescription>
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
                        <DialogTitle>إنشاء إعداد نشر جديد</DialogTitle>
                        <DialogDescription>حدد إعدادات البيئة والمزود</DialogDescription>
                      </DialogHeader>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          createConfigMutation.mutate({
                            name: formData.get("name"),
                            environment: formData.get("environment"),
                            provider: formData.get("provider"),
                          });
                        }}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <Label>الاسم</Label>
                          <Input name="name" placeholder="Production Config" required />
                        </div>
                        <div className="space-y-2">
                          <Label>البيئة</Label>
                          <Select name="environment" defaultValue="production">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="development">تطوير</SelectItem>
                              <SelectItem value="staging">اختبار</SelectItem>
                              <SelectItem value="production">إنتاج</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>المزود</Label>
                          <Select name="provider" defaultValue="hetzner">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hetzner">Hetzner</SelectItem>
                              <SelectItem value="aws">AWS</SelectItem>
                              <SelectItem value="vercel">Vercel</SelectItem>
                              <SelectItem value="netlify">Netlify</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
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
                  {configs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Server className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>لا توجد إعدادات نشر بعد</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {configs.map((config) => (
                        <div key={config.id} className="flex items-center justify-between p-4 border rounded-md" data-testid={`config-item-${config.id}`}>
                          <div className="flex items-center gap-4">
                            <Cloud className="w-8 h-8 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{config.environment}</p>
                              <p className="text-sm text-muted-foreground">{config.provider}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {config.sslEnabled && (
                              <Badge variant="outline"><Shield className="w-3 h-3 ml-1" /> SSL</Badge>
                            )}
                            {config.cdnEnabled && (
                              <Badge variant="outline"><Globe className="w-3 h-3 ml-1" /> CDN</Badge>
                            )}
                            {config.autoScale && (
                              <Badge variant="outline"><TrendingUp className="w-3 h-3 ml-1" /> Auto-Scale</Badge>
                            )}
                            <Badge variant={config.isActive ? "default" : "secondary"}>
                              {config.isActive ? "نشط" : "غير نشط"}
                            </Badge>
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
    </div>
  );
}
