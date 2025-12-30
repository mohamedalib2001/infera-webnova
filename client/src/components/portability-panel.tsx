/**
 * Portability & Independence Panel | لوحة قابلية النقل والاستقلال
 */

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Package, Cloud, WifiOff, ArrowRightLeft, Download, Shield,
  Server, Database, HardDrive, CheckCircle, XCircle, Clock,
  RefreshCw, Play, Square, AlertTriangle, Globe, Lock
} from "lucide-react";

interface ExportPackage {
  id: string;
  platformName: string;
  version: string;
  format: string;
  targetProvider: string;
  networkMode: string;
  status: string;
  size: number;
  checksum: string;
  createdAt: string;
  completedAt?: string;
}

interface Provider {
  id: string;
  name: string;
  nameAr: string;
  type: string;
  capabilities: { name: string; supported: boolean; alternative?: string }[];
  limitations: string[];
  costEstimate: { monthly: number; annual: number; currency: string };
  migrationComplexity: string;
  offlineSupport: boolean;
  certifications: string[];
}

interface AirGappedConfig {
  id: string;
  platformId: string;
  enabled: boolean;
  mode: string;
  securityLevel: string;
  localServices: { name: string; nameAr: string; status: string; port: number }[];
  lastSyncAt?: string;
}

interface MigrationPlan {
  id: string;
  platformId: string;
  sourceProvider: string;
  targetProvider: string;
  steps: { name: string; nameAr: string; status: string; duration: number }[];
  estimatedDuration: number;
  estimatedCost: number;
  riskLevel: string;
  status: string;
}

interface Stats {
  exports: { total: number; completed: number; pending: number; failed: number; totalSize: number };
  airGapped: { total: number; enabled: number; lastSync?: string };
  migrations: { total: number; draft: number; inProgress: number; completed: number };
  providers: { available: number; offlineSupported: number };
}

const statusColors: Record<string, string> = {
  pending: "bg-gray-500/10 text-gray-500",
  preparing: "bg-blue-500/10 text-blue-500",
  packaging: "bg-purple-500/10 text-purple-500",
  encrypting: "bg-yellow-500/10 text-yellow-500",
  completed: "bg-green-500/10 text-green-500",
  failed: "bg-red-500/10 text-red-500"
};

const riskColors: Record<string, string> = {
  low: "bg-green-500/10 text-green-500",
  medium: "bg-yellow-500/10 text-yellow-500",
  high: "bg-red-500/10 text-red-500"
};

export function PortabilityPanel() {
  const [activeTab, setActiveTab] = useState("exports");
  const [selectedFormat, setSelectedFormat] = useState("docker");
  const [selectedProvider, setSelectedProvider] = useState("hetzner");
  const [networkMode, setNetworkMode] = useState("online");

  const { data: statsData, isLoading } = useQuery<{ data: Stats }>({
    queryKey: ["/api/portability/stats"]
  });

  const { data: exportsData } = useQuery<{ data: ExportPackage[] }>({
    queryKey: ["/api/portability/exports"]
  });

  const { data: providersData } = useQuery<{ data: Provider[] }>({
    queryKey: ["/api/portability/providers"]
  });

  const { data: airGappedData } = useQuery<{ data: AirGappedConfig[] }>({
    queryKey: ["/api/portability/air-gapped"]
  });

  const { data: migrationsData } = useQuery<{ data: MigrationPlan[] }>({
    queryKey: ["/api/portability/migrations"]
  });

  const createExportMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/portability/exports", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/portability/exports"] })
  });

  const enableAirGappedMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/portability/air-gapped/${id}/enable`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/portability/air-gapped"] })
  });

  const disableAirGappedMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/portability/air-gapped/${id}/disable`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/portability/air-gapped"] })
  });

  const stats = statsData?.data;
  const exports = exportsData?.data || [];
  const providers = providersData?.data || [];
  const airGappedConfigs = airGappedData?.data || [];
  const migrations = migrationsData?.data || [];

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" data-testid="portability-panel">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6" />
            Portability & Independence
          </h2>
          <p className="text-muted-foreground">قابلية النقل والاستقلال</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Cloud className="w-3 h-3" />
            {stats?.providers.available || 0} Providers
          </Badge>
          <Badge variant="outline" className="gap-1">
            <WifiOff className="w-3 h-3" />
            {stats?.airGapped.enabled || 0} Air-Gapped
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Package className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.exports.completed || 0}</p>
                <p className="text-xs text-muted-foreground">Exports | التصديرات</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <HardDrive className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatSize(stats?.exports.totalSize || 0)}</p>
                <p className="text-xs text-muted-foreground">Total Size | الحجم الكلي</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <WifiOff className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.airGapped.enabled || 0}</p>
                <p className="text-xs text-muted-foreground">Air-Gapped | معزول</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <ArrowRightLeft className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.migrations.completed || 0}</p>
                <p className="text-xs text-muted-foreground">Migrations | الترحيلات</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="exports" data-testid="tab-exports">
            <Package className="w-4 h-4 mr-1" />
            Exports
          </TabsTrigger>
          <TabsTrigger value="providers" data-testid="tab-providers">
            <Cloud className="w-4 h-4 mr-1" />
            Providers
          </TabsTrigger>
          <TabsTrigger value="air-gapped" data-testid="tab-air-gapped">
            <WifiOff className="w-4 h-4 mr-1" />
            Air-Gapped
          </TabsTrigger>
          <TabsTrigger value="migrations" data-testid="tab-migrations">
            <ArrowRightLeft className="w-4 h-4 mr-1" />
            Migrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="exports" className="mt-4">
          <div className="space-y-4">
            {/* Create Export Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Create Export Package | إنشاء حزمة تصدير</CardTitle>
                <CardDescription>Export your platform as an independent package</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Format | التنسيق</Label>
                    <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                      <SelectTrigger data-testid="select-format">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="docker">Docker Compose</SelectItem>
                        <SelectItem value="kubernetes">Kubernetes</SelectItem>
                        <SelectItem value="terraform">Terraform</SelectItem>
                        <SelectItem value="ansible">Ansible</SelectItem>
                        <SelectItem value="standalone">Standalone</SelectItem>
                        <SelectItem value="vm-image">VM Image</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Target Provider | المزود المستهدف</Label>
                    <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                      <SelectTrigger data-testid="select-provider">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aws">AWS</SelectItem>
                        <SelectItem value="azure">Azure</SelectItem>
                        <SelectItem value="gcp">GCP</SelectItem>
                        <SelectItem value="hetzner">Hetzner</SelectItem>
                        <SelectItem value="on-premise">On-Premise</SelectItem>
                        <SelectItem value="air-gapped">Air-Gapped</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Network Mode | وضع الشبكة</Label>
                    <Select value={networkMode} onValueChange={setNetworkMode}>
                      <SelectTrigger data-testid="select-network">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                        <SelectItem value="air-gapped">Air-Gapped</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={() => createExportMutation.mutate({
                    platformId: 'current',
                    platformName: 'WebNova Platform',
                    version: '1.0.0',
                    format: selectedFormat,
                    targetProvider: selectedProvider,
                    networkMode
                  })}
                  disabled={createExportMutation.isPending}
                  data-testid="button-create-export"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Create Export | إنشاء التصدير
                </Button>
              </CardContent>
            </Card>

            {/* Export List */}
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {exports.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="font-medium">No Exports Yet</p>
                      <p className="text-sm text-muted-foreground">لا توجد تصديرات بعد</p>
                    </CardContent>
                  </Card>
                ) : (
                  exports.map((exp) => (
                    <Card key={exp.id} data-testid={`export-${exp.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-muted">
                              {exp.status === 'completed' ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : exp.status === 'failed' ? (
                                <XCircle className="w-5 h-5 text-red-500" />
                              ) : (
                                <Clock className="w-5 h-5 text-blue-500" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{exp.platformName}</h4>
                                <Badge variant="outline">v{exp.version}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {exp.format} | {exp.targetProvider} | {exp.networkMode}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={statusColors[exp.status]}>{exp.status}</Badge>
                            {exp.status === 'completed' && (
                              <>
                                <span className="text-sm text-muted-foreground">{formatSize(exp.size)}</span>
                                <Button size="sm" variant="outline" data-testid={`download-${exp.id}`}>
                                  <Download className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="providers" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {providers.map((provider) => (
              <Card key={provider.id} data-testid={`provider-${provider.id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cloud className="w-5 h-5" />
                      <CardTitle className="text-lg">{provider.name}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      {provider.offlineSupport && (
                        <Badge variant="outline" className="gap-1">
                          <WifiOff className="w-3 h-3" />
                          Offline
                        </Badge>
                      )}
                      <Badge className={riskColors[provider.migrationComplexity]}>
                        {provider.migrationComplexity} complexity
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{provider.nameAr}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Capabilities | القدرات</p>
                    <div className="flex flex-wrap gap-1">
                      {provider.capabilities.map((cap, i) => (
                        <Badge 
                          key={i} 
                          variant={cap.supported ? "default" : "outline"}
                          className="text-xs"
                        >
                          {cap.supported ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          {cap.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Cost Estimate:</span>
                    <span className="font-medium">${provider.costEstimate.monthly}/mo</span>
                  </div>

                  {provider.certifications.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {provider.certifications.slice(0, 4).map((cert, i) => (
                        <Badge key={i} variant="outline" className="text-xs gap-1">
                          <Shield className="w-3 h-3" />
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="air-gapped" className="mt-4">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <WifiOff className="w-5 h-5" />
                  Air-Gapped Mode | الوضع المعزول
                </CardTitle>
                <CardDescription>
                  Isolated environment for sensitive organizations | بيئة معزولة للجهات الحساسة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Full Isolation</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Complete network isolation with no external connectivity
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Local Services</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Self-hosted alternatives for all cloud dependencies
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Military-Grade</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      FIPS 140-3 compliant encryption and security
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {airGappedConfigs.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <WifiOff className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="font-medium">No Air-Gapped Configurations</p>
                  <p className="text-sm text-muted-foreground">لا توجد إعدادات للوضع المعزول</p>
                </CardContent>
              </Card>
            ) : (
              airGappedConfigs.map((config) => (
                <Card key={config.id} data-testid={`airgapped-${config.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${config.enabled ? 'bg-green-500/10' : 'bg-muted'}`}>
                          {config.enabled ? (
                            <Play className="w-5 h-5 text-green-500" />
                          ) : (
                            <Square className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">Platform: {config.platformId}</h4>
                          <p className="text-sm text-muted-foreground">
                            Mode: {config.mode} | Security: {config.securityLevel}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={config.enabled ? "default" : "outline"}>
                          {config.enabled ? "Active" : "Inactive"}
                        </Badge>
                        <Switch
                          checked={config.enabled}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              enableAirGappedMutation.mutate(config.id);
                            } else {
                              disableAirGappedMutation.mutate(config.id);
                            }
                          }}
                          data-testid={`toggle-${config.id}`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {config.localServices.map((service, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                          <div className={`w-2 h-2 rounded-full ${
                            service.status === 'running' ? 'bg-green-500' : 
                            service.status === 'error' ? 'bg-red-500' : 'bg-gray-400'
                          }`} />
                          <span className="text-sm">{service.name}</span>
                          <span className="text-xs text-muted-foreground">:{service.port}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="migrations" className="mt-4">
          <div className="space-y-4">
            {migrations.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <ArrowRightLeft className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="font-medium">No Migration Plans</p>
                  <p className="text-sm text-muted-foreground">لا توجد خطط ترحيل</p>
                </CardContent>
              </Card>
            ) : (
              migrations.map((plan) => (
                <Card key={plan.id} data-testid={`migration-${plan.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        <CardTitle className="text-lg">
                          {plan.sourceProvider} → {plan.targetProvider}
                        </CardTitle>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={riskColors[plan.riskLevel]}>{plan.riskLevel} risk</Badge>
                        <Badge variant="outline">{plan.status}</Badge>
                      </div>
                    </div>
                    <CardDescription>
                      Estimated: {plan.estimatedDuration}h | Cost: ${plan.estimatedCost}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {plan.steps.map((step, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                            step.status === 'completed' ? 'bg-green-500 text-white' :
                            step.status === 'in_progress' ? 'bg-blue-500 text-white' :
                            step.status === 'failed' ? 'bg-red-500 text-white' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <span className="text-sm">{step.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">({step.duration}h)</span>
                          </div>
                          <Badge variant="outline" className="text-xs">{step.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PortabilityPanel;
