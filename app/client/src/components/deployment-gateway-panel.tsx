import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Rocket, 
  Server, 
  Activity, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Play,
  RefreshCw,
  Settings,
  Wrench,
  Bell,
  BarChart3,
  Globe,
  Cpu,
  HardDrive,
  Wifi
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DeploymentGatewayPanelProps {
  language?: "ar" | "en";
}

const statusColors: Record<string, string> = {
  active: "bg-green-500/10 text-green-700 dark:text-green-400",
  inactive: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  deploying: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  error: "bg-red-500/10 text-red-700 dark:text-red-400",
  maintenance: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
};

const severityColors: Record<string, string> = {
  info: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  warning: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  error: "bg-red-500/10 text-red-700 dark:text-red-400",
  critical: "bg-red-700/20 text-red-800 dark:text-red-300"
};

const healthColors: Record<string, string> = {
  healthy: "text-green-600",
  degraded: "text-yellow-600",
  unhealthy: "text-red-600",
  unknown: "text-gray-600"
};

export function DeploymentGatewayPanel({ language = "ar" }: DeploymentGatewayPanelProps) {
  const { toast } = useToast();
  const isArabic = language === "ar";
  const [showNewEnvDialog, setShowNewEnvDialog] = useState(false);
  const [newEnvForm, setNewEnvForm] = useState({
    name: '',
    nameAr: '',
    type: 'staging' as 'development' | 'staging' | 'production',
    domain: ''
  });

  const statsQuery = useQuery<{ stats: any }>({
    queryKey: ["/api/deployment/stats"]
  });

  const environmentsQuery = useQuery<{ environments: any[] }>({
    queryKey: ["/api/deployment/environments"]
  });

  const deploymentsQuery = useQuery<{ deployments: any[] }>({
    queryKey: ["/api/deployment/deployments"]
  });

  const alertsQuery = useQuery<{ alerts: any[] }>({
    queryKey: ["/api/deployment/alerts"]
  });

  const maintenanceQuery = useQuery<{ tasks: any[] }>({
    queryKey: ["/api/deployment/maintenance"]
  });

  const configsQuery = useQuery<{ configs: any[] }>({
    queryKey: ["/api/deployment/configs"]
  });

  const createEnvironment = useMutation({
    mutationFn: async (data: typeof newEnvForm) => {
      const res = await apiRequest("POST", "/api/deployment/environments", {
        ...data,
        configTemplate: 'config_standard'
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/deployment/environments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/deployment/stats"] });
      setShowNewEnvDialog(false);
      setNewEnvForm({ name: '', nameAr: '', type: 'staging', domain: '' });
      toast({
        title: isArabic ? "تم إنشاء البيئة" : "Environment Created",
        description: isArabic ? data.messageAr : data.message
      });
    }
  });

  const runHealthCheck = useMutation({
    mutationFn: async (environmentId: string) => {
      const res = await apiRequest("POST", `/api/deployment/environments/${environmentId}/health-check`, {});
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/deployment/environments"] });
      toast({
        title: isArabic ? "فحص الصحة" : "Health Check",
        description: isArabic ? data.messageAr : data.message
      });
    }
  });

  const acknowledgeAlert = useMutation({
    mutationFn: async (alertId: string) => {
      const res = await apiRequest("POST", `/api/deployment/alerts/${alertId}/acknowledge`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deployment/alerts"] });
    }
  });

  const stats = statsQuery.data?.stats || {};
  const environments = environmentsQuery.data?.environments || [];
  const deployments = deploymentsQuery.data?.deployments || [];
  const alerts = alertsQuery.data?.alerts || [];
  const maintenanceTasks = maintenanceQuery.data?.tasks || [];
  const configs = configsQuery.data?.configs || [];

  return (
    <div className="flex flex-col gap-4 h-full" dir={isArabic ? "rtl" : "ltr"}>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Rocket className="w-5 h-5" />
              <CardTitle>
                {isArabic ? "بوابة النشر والإدارة التلقائية" : "Auto-Deployment Gateway"}
              </CardTitle>
            </div>
            <Dialog open={showNewEnvDialog} onOpenChange={setShowNewEnvDialog}>
              <DialogTrigger asChild>
                <Button size="sm" data-testid="button-new-environment">
                  <Server className="w-4 h-4 mr-1" />
                  {isArabic ? "بيئة جديدة" : "New Environment"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {isArabic ? "إنشاء بيئة جديدة" : "Create New Environment"}
                  </DialogTitle>
                  <DialogDescription>
                    {isArabic ? "أضف بيئة نشر جديدة" : "Add a new deployment environment"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>{isArabic ? "الاسم (إنجليزي)" : "Name (English)"}</Label>
                    <Input
                      value={newEnvForm.name}
                      onChange={(e) => setNewEnvForm({ ...newEnvForm, name: e.target.value })}
                      placeholder="Production Server"
                      data-testid="input-env-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isArabic ? "الاسم (عربي)" : "Name (Arabic)"}</Label>
                    <Input
                      value={newEnvForm.nameAr}
                      onChange={(e) => setNewEnvForm({ ...newEnvForm, nameAr: e.target.value })}
                      placeholder="خادم الإنتاج"
                      data-testid="input-env-name-ar"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isArabic ? "النوع" : "Type"}</Label>
                    <Select
                      value={newEnvForm.type}
                      onValueChange={(v) => setNewEnvForm({ ...newEnvForm, type: v as any })}
                    >
                      <SelectTrigger data-testid="select-env-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="development">{isArabic ? "تطوير" : "Development"}</SelectItem>
                        <SelectItem value="staging">{isArabic ? "اختبار" : "Staging"}</SelectItem>
                        <SelectItem value="production">{isArabic ? "إنتاج" : "Production"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{isArabic ? "النطاق (اختياري)" : "Domain (Optional)"}</Label>
                    <Input
                      value={newEnvForm.domain}
                      onChange={(e) => setNewEnvForm({ ...newEnvForm, domain: e.target.value })}
                      placeholder="app.example.com"
                      data-testid="input-env-domain"
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => createEnvironment.mutate(newEnvForm)}
                    disabled={!newEnvForm.name || !newEnvForm.nameAr || createEnvironment.isPending}
                    data-testid="button-create-env"
                  >
                    {createEnvironment.isPending ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      isArabic ? "إنشاء" : "Create"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription>
            {isArabic 
              ? "نشر تلقائي، تكوينات الخادم، والمراقبة الذكية" 
              : "Auto-deployment, server configurations, and smart monitoring"}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-md bg-blue-500/10">
                <Server className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeEnvironments || 0}/{stats.totalEnvironments || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {isArabic ? "بيئات نشطة" : "Active Environments"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-md bg-green-500/10">
                <Rocket className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.successfulDeployments || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {isArabic ? "نشر ناجح" : "Successful Deploys"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-md bg-yellow-500/10">
                <Bell className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingAlerts || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {isArabic ? "تنبيهات معلقة" : "Pending Alerts"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-md bg-purple-500/10">
                <Clock className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgDeploymentTime || 0}s</p>
                <p className="text-xs text-muted-foreground">
                  {isArabic ? "متوسط وقت النشر" : "Avg Deploy Time"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 min-h-0">
        <Tabs defaultValue="environments" className="h-full flex flex-col">
          <TabsList className="w-full justify-start flex-wrap">
            <TabsTrigger value="environments" data-testid="tab-environments">
              <Server className="w-4 h-4 mr-1" />
              {isArabic ? "البيئات" : "Environments"}
            </TabsTrigger>
            <TabsTrigger value="deployments" data-testid="tab-deployments">
              <Rocket className="w-4 h-4 mr-1" />
              {isArabic ? "عمليات النشر" : "Deployments"}
            </TabsTrigger>
            <TabsTrigger value="monitoring" data-testid="tab-monitoring">
              <Activity className="w-4 h-4 mr-1" />
              {isArabic ? "المراقبة" : "Monitoring"}
            </TabsTrigger>
            <TabsTrigger value="maintenance" data-testid="tab-maintenance">
              <Wrench className="w-4 h-4 mr-1" />
              {isArabic ? "الصيانة" : "Maintenance"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="environments" className="flex-1 min-h-0 mt-2">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {isArabic ? "بيئات النشر" : "Deployment Environments"}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 min-h-0">
                <ScrollArea className="h-full">
                  {environments.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      {isArabic 
                        ? "لا توجد بيئات. أنشئ بيئة جديدة للبدء." 
                        : "No environments. Create one to get started."}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {environments.map((env: any) => (
                        <div 
                          key={env.id} 
                          className="p-4 rounded-md border"
                          data-testid={`card-environment-${env.id}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-2">
                                <span className="font-medium">
                                  {isArabic ? env.nameAr : env.name}
                                </span>
                                <Badge className={statusColors[env.status]}>
                                  {env.status}
                                </Badge>
                                <Badge variant="outline">{env.type}</Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                {env.serverIp && (
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Wifi className="w-3 h-3" />
                                    {env.serverIp}
                                  </div>
                                )}
                                {env.domain && (
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Globe className="w-3 h-3" />
                                    {env.domain}
                                  </div>
                                )}
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Cpu className="w-3 h-3" />
                                  {env.metrics?.cpuUsage || 0}%
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <HardDrive className="w-3 h-3" />
                                  {env.metrics?.diskUsage || 0}%
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => runHealthCheck.mutate(env.id)}
                                disabled={runHealthCheck.isPending}
                                data-testid={`button-health-${env.id}`}
                              >
                                <Activity className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                data-testid={`button-settings-${env.id}`}
                              >
                                <Settings className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deployments" className="flex-1 min-h-0 mt-2">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {isArabic ? "سجل عمليات النشر" : "Deployment History"}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 min-h-0">
                <ScrollArea className="h-full">
                  {deployments.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      {isArabic ? "لا توجد عمليات نشر بعد" : "No deployments yet"}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {deployments.map((deploy: any) => (
                        <div 
                          key={deploy.id} 
                          className="p-3 rounded-md border"
                          data-testid={`card-deployment-${deploy.id}`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm">{deploy.version}</span>
                              <Badge variant={
                                deploy.status === 'success' ? 'default' :
                                deploy.status === 'failed' ? 'destructive' :
                                'secondary'
                              }>
                                {deploy.status}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(deploy.startedAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {isArabic ? "بواسطة:" : "By:"} {deploy.deployedBy}
                            {deploy.gitCommit && (
                              <span className="ml-2 font-mono">
                                {deploy.gitCommit.slice(0, 7)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="flex-1 min-h-0 mt-2">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {isArabic ? "التنبيهات والمراقبة" : "Alerts & Monitoring"}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 min-h-0">
                <ScrollArea className="h-full">
                  {alerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <CheckCircle className="w-12 h-12 mb-2 text-green-500" />
                      <p>{isArabic ? "لا توجد تنبيهات" : "No alerts"}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {alerts.map((alert: any) => (
                        <div 
                          key={alert.id} 
                          className="p-3 rounded-md border"
                          data-testid={`card-alert-${alert.id}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {alert.severity === 'critical' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                                <span className="font-medium">
                                  {isArabic ? alert.titleAr : alert.title}
                                </span>
                                <Badge className={severityColors[alert.severity]}>
                                  {alert.severity}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {isArabic ? alert.messageAr : alert.message}
                              </p>
                            </div>
                            {!alert.acknowledged && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => acknowledgeAlert.mutate(alert.id)}
                                data-testid={`button-ack-${alert.id}`}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="flex-1 min-h-0 mt-2">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {isArabic ? "مهام الصيانة" : "Maintenance Tasks"}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 min-h-0">
                <ScrollArea className="h-full">
                  {maintenanceTasks.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      {isArabic ? "لا توجد مهام صيانة مجدولة" : "No scheduled maintenance"}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {maintenanceTasks.map((task: any) => (
                        <div 
                          key={task.id} 
                          className="p-3 rounded-md border"
                          data-testid={`card-task-${task.id}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Wrench className="w-4 h-4" />
                              <span className="font-medium capitalize">{task.type.replace('_', ' ')}</span>
                              <Badge variant={
                                task.status === 'completed' ? 'default' :
                                task.status === 'failed' ? 'destructive' :
                                task.status === 'running' ? 'secondary' : 'outline'
                              }>
                                {task.status}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(task.scheduledAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
