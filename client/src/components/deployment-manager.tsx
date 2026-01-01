/**
 * Deployment Manager - مدير النشر
 * 
 * Complete UI for external deployment, monitoring, and self-updates.
 * واجهة كاملة للنشر الخارجي والمراقبة والتحديثات الذاتية
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Cloud, 
  Server, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  Package,
  DollarSign,
  Cpu,
  HardDrive,
  Wifi,
  Clock,
  Globe,
  Plus,
  Trash2,
  Settings,
  ArrowUpCircle,
  History
} from 'lucide-react';

interface DeploymentTarget {
  id: string;
  name: string;
  provider: string;
  region?: string;
  serverType?: string;
  ipAddress?: string;
  status: string;
  createdAt: string;
  lastDeployedAt?: string;
}

interface DeploymentJob {
  id: string;
  repositoryId: string;
  targetId: string;
  status: string;
  progress: number;
  logs: string[];
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
  deployedUrl?: string;
}

interface Provider {
  id: string;
  name: string;
  regions: { id: string; name: string }[];
  serverTypes: { id: string; name: string; vcpus: number; memory: number; disk: number; priceHourly: number }[];
  available: boolean;
}

interface SystemMetrics {
  cpu: { usage: number; cores: number };
  memory: { total: number; used: number; usagePercent: number };
  disk: { total: number; used: number; usagePercent: number };
  uptime: number;
  timestamp: string;
}

interface Alert {
  id: string;
  type: string;
  severity: string;
  message: string;
  value: number;
  threshold: number;
  triggeredAt: string;
  resolvedAt?: string;
  acknowledged: boolean;
}

interface UpdatePackage {
  id: string;
  repositoryId: string;
  version: string;
  createdAt: string;
  files: { path: string; action: string }[];
  changelog: string;
  size: number;
}

interface DeploymentManagerProps {
  repositoryId: string;
  repositoryName?: string;
}

export function DeploymentManager({ repositoryId, repositoryName }: DeploymentManagerProps) {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('targets');
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [showCreateTarget, setShowCreateTarget] = useState(false);
  const [showCreatePackage, setShowCreatePackage] = useState(false);
  
  // New target form state
  const [newTarget, setNewTarget] = useState({
    provider: 'hetzner',
    name: '',
    region: '',
    serverType: ''
  });
  
  // New package form state
  const [newPackage, setNewPackage] = useState({
    version: '',
    changelog: ''
  });

  // Get providers
  const { data: providersData } = useQuery<{ success: boolean; providers?: Provider[] }>({
    queryKey: ['/api/deployment/providers']
  });

  // Get targets
  const { data: targetsData, isLoading: targetsLoading } = useQuery<{ success: boolean; targets?: DeploymentTarget[] }>({
    queryKey: ['/api/deployment/targets']
  });

  // Get jobs for repository
  const { data: jobsData } = useQuery<{ success: boolean; jobs?: DeploymentJob[] }>({
    queryKey: ['/api/deployment/jobs/repository', repositoryId]
  });

  // Get alerts
  const { data: alertsData } = useQuery<{ success: boolean; alerts?: Alert[] }>({
    queryKey: ['/api/deployment/alerts'],
    refetchInterval: 30000
  });

  // Get packages
  const { data: packagesData } = useQuery<{ success: boolean; packages?: UpdatePackage[] }>({
    queryKey: ['/api/deployment/updates/packages', repositoryId]
  });

  // Get metrics for selected target
  const { data: metricsData } = useQuery<{ success: boolean; metrics?: { system: SystemMetrics } }>({
    queryKey: ['/api/deployment/metrics/current', selectedTarget],
    enabled: !!selectedTarget,
    refetchInterval: 5000
  });

  const providers = providersData?.providers || [];
  const targets = targetsData?.targets || [];
  const jobs = jobsData?.jobs || [];
  const alerts = alertsData?.alerts || [];
  const packages = packagesData?.packages || [];
  const metrics = metricsData?.metrics?.system;

  const selectedProvider = providers.find(p => p.id === newTarget.provider);

  // Create target mutation
  const createTargetMutation = useMutation({
    mutationFn: async (data: typeof newTarget) => {
      return await apiRequest('/api/deployment/targets', { method: 'POST', body: JSON.stringify(data) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/deployment/targets'] });
      setShowCreateTarget(false);
      setNewTarget({ provider: 'hetzner', name: '', region: '', serverType: '' });
      toast({ title: 'Target Created', description: 'Deployment target created successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  // Deploy mutation
  const deployMutation = useMutation({
    mutationFn: async ({ targetId }: { targetId: string }) => {
      return await apiRequest('/api/deployment/deploy', { 
        method: 'POST', 
        body: JSON.stringify({ repositoryId, targetId }) 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/deployment/jobs/repository', repositoryId] });
      toast({ title: 'Deployment Started', description: 'Deployment job started successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  // Delete target mutation
  const deleteTargetMutation = useMutation({
    mutationFn: async (targetId: string) => {
      return await apiRequest(`/api/deployment/targets/${targetId}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/deployment/targets'] });
      if (selectedTarget) setSelectedTarget(null);
      toast({ title: 'Target Deleted', description: 'Deployment target deleted' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  // Create package mutation
  const createPackageMutation = useMutation({
    mutationFn: async (data: typeof newPackage) => {
      return await apiRequest('/api/deployment/updates/package', { 
        method: 'POST', 
        body: JSON.stringify({ repositoryId, ...data }) 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/deployment/updates/packages', repositoryId] });
      setShowCreatePackage(false);
      setNewPackage({ version: '', changelog: '' });
      toast({ title: 'Package Created', description: 'Update package created successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  // Deploy update mutation
  const deployUpdateMutation = useMutation({
    mutationFn: async ({ packageId, targetId }: { packageId: string; targetId: string }) => {
      return await apiRequest('/api/deployment/updates/deploy', { 
        method: 'POST', 
        body: JSON.stringify({ packageId, targetId }) 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/deployment/updates/jobs'] });
      toast({ title: 'Update Started', description: 'Update deployment started' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  // Rollback mutation
  const rollbackMutation = useMutation({
    mutationFn: async (targetId: string) => {
      return await apiRequest('/api/deployment/updates/rollback', { 
        method: 'POST', 
        body: JSON.stringify({ targetId }) 
      });
    },
    onSuccess: () => {
      toast({ title: 'Rollback Started', description: 'Rollback process initiated' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const formatBytes = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let unitIndex = 0;
    let value = bytes;
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }
    return `${value.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatDuration = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
      case 'success':
      case 'healthy':
        return <Badge variant="default" data-testid={`badge-status-${status}`}><CheckCircle className="w-3 h-3 mr-1" />{status}</Badge>;
      case 'deploying':
      case 'pending':
      case 'in_progress':
        return <Badge variant="secondary" data-testid={`badge-status-${status}`}><RefreshCw className="w-3 h-3 mr-1 animate-spin" />{status}</Badge>;
      case 'error':
      case 'failed':
      case 'unhealthy':
        return <Badge variant="destructive" data-testid={`badge-status-${status}`}><XCircle className="w-3 h-3 mr-1" />{status}</Badge>;
      default:
        return <Badge variant="outline" data-testid={`badge-status-${status}`}>{status}</Badge>;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between gap-4 p-4 border-b">
        <div>
          <h2 className="text-lg font-semibold" data-testid="text-deployment-title">
            External Deployment
          </h2>
          <p className="text-sm text-muted-foreground">
            {repositoryName || 'Repository'} - Long-term operation without Replit
          </p>
        </div>
        <div className="flex items-center gap-2">
          {alerts.filter(a => !a.resolvedAt && a.severity === 'critical').length > 0 && (
            <Badge variant="destructive" data-testid="badge-critical-alerts">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {alerts.filter(a => !a.resolvedAt && a.severity === 'critical').length} Critical
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-4" data-testid="tabs-deployment-sections">
          <TabsTrigger value="targets" data-testid="tab-targets">
            <Server className="w-4 h-4 mr-2" />
            Targets
          </TabsTrigger>
          <TabsTrigger value="monitoring" data-testid="tab-monitoring">
            <Activity className="w-4 h-4 mr-2" />
            Monitoring
          </TabsTrigger>
          <TabsTrigger value="updates" data-testid="tab-updates">
            <ArrowUpCircle className="w-4 h-4 mr-2" />
            Updates
          </TabsTrigger>
          <TabsTrigger value="costs" data-testid="tab-costs">
            <DollarSign className="w-4 h-4 mr-2" />
            Costs
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden p-4">
          {/* Targets Tab */}
          <TabsContent value="targets" className="h-full m-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
              {/* Targets List */}
              <Card className="flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                  <div>
                    <CardTitle className="text-base">Deployment Targets</CardTitle>
                    <CardDescription>Servers for hosting your application</CardDescription>
                  </div>
                  <Dialog open={showCreateTarget} onOpenChange={setShowCreateTarget}>
                    <DialogTrigger asChild>
                      <Button size="sm" data-testid="button-create-target">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Target
                      </Button>
                    </DialogTrigger>
                    <DialogContent data-testid="dialog-create-target">
                      <DialogHeader>
                        <DialogTitle>Create Deployment Target</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Provider</Label>
                          <Select 
                            value={newTarget.provider} 
                            onValueChange={(v) => setNewTarget(prev => ({ ...prev, provider: v, region: '', serverType: '' }))}
                          >
                            <SelectTrigger data-testid="select-provider">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {providers.map(p => (
                                <SelectItem key={p.id} value={p.id} disabled={!p.available}>
                                  {p.name} {!p.available && '(Not configured)'}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input 
                            value={newTarget.name}
                            onChange={(e) => setNewTarget(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="my-production-server"
                            data-testid="input-target-name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Region</Label>
                          <Select 
                            value={newTarget.region} 
                            onValueChange={(v) => setNewTarget(prev => ({ ...prev, region: v }))}
                          >
                            <SelectTrigger data-testid="select-region">
                              <SelectValue placeholder="Select region" />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedProvider?.regions.map(r => (
                                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Server Type</Label>
                          <Select 
                            value={newTarget.serverType} 
                            onValueChange={(v) => setNewTarget(prev => ({ ...prev, serverType: v }))}
                          >
                            <SelectTrigger data-testid="select-server-type">
                              <SelectValue placeholder="Select server type" />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedProvider?.serverTypes.map(s => (
                                <SelectItem key={s.id} value={s.id}>
                                  {s.name} - {s.vcpus} vCPU, {s.memory}GB RAM (${(s.priceHourly * 730).toFixed(2)}/mo)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button 
                          className="w-full" 
                          onClick={() => createTargetMutation.mutate(newTarget)}
                          disabled={createTargetMutation.isPending || !newTarget.name || !newTarget.region || !newTarget.serverType}
                          data-testid="button-confirm-create-target"
                        >
                          {createTargetMutation.isPending ? 'Creating...' : 'Create Target'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    {targetsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : targets.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Server className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No deployment targets configured</p>
                        <p className="text-sm">Add a target to deploy your application</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {targets.map(target => (
                          <div 
                            key={target.id}
                            className={`p-3 rounded-md border cursor-pointer hover-elevate ${selectedTarget === target.id ? 'border-primary bg-accent/50' : ''}`}
                            onClick={() => setSelectedTarget(target.id)}
                            data-testid={`card-target-${target.id}`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <Cloud className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">{target.name}</span>
                              </div>
                              {getStatusBadge(target.status)}
                            </div>
                            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{target.provider}</span>
                              <span>{target.region}</span>
                              {target.ipAddress && <span>{target.ipAddress}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Target Details / Deploy */}
              <Card className="flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    {selectedTarget ? targets.find(t => t.id === selectedTarget)?.name || 'Target Details' : 'Deploy'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                  {selectedTarget ? (
                    <div className="space-y-4">
                      {/* Target Actions */}
                      <div className="flex items-center gap-2">
                        <Button 
                          onClick={() => deployMutation.mutate({ targetId: selectedTarget })}
                          disabled={deployMutation.isPending}
                          data-testid="button-deploy-to-target"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Deploy
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => rollbackMutation.mutate(selectedTarget)}
                          disabled={rollbackMutation.isPending}
                          data-testid="button-rollback"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Rollback
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon" data-testid="button-delete-target">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Target</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will delete the deployment target. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteTargetMutation.mutate(selectedTarget)}
                                data-testid="button-confirm-delete"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>

                      {/* Recent Jobs */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Recent Deployments</h4>
                        <ScrollArea className="h-[200px]">
                          {jobs.filter(j => j.targetId === selectedTarget).length === 0 ? (
                            <p className="text-sm text-muted-foreground">No deployments yet</p>
                          ) : (
                            <div className="space-y-2">
                              {jobs.filter(j => j.targetId === selectedTarget).slice(0, 5).map(job => (
                                <div key={job.id} className="p-2 border rounded-md text-sm" data-testid={`card-job-${job.id}`}>
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    {getStatusBadge(job.status)}
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(job.startedAt).toLocaleString()}
                                    </span>
                                  </div>
                                  {job.status !== 'success' && job.status !== 'failed' && (
                                    <Progress value={job.progress} className="h-1 mt-2" />
                                  )}
                                  {job.deployedUrl && (
                                    <a 
                                      href={job.deployedUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline text-xs flex items-center gap-1 mt-1"
                                    >
                                      <Globe className="w-3 h-3" />
                                      {job.deployedUrl}
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </ScrollArea>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Cloud className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Select a target to view details</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="h-full m-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
              {/* Metrics Cards */}
              <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Cpu className="w-4 h-4" />
                      CPU Usage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-cpu-usage">
                      {metrics?.cpu.usage.toFixed(1) || '0'}%
                    </div>
                    <Progress value={metrics?.cpu.usage || 0} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {metrics?.cpu.cores || 0} cores available
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <HardDrive className="w-4 h-4" />
                      Memory
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-memory-usage">
                      {metrics?.memory.usagePercent.toFixed(1) || '0'}%
                    </div>
                    <Progress value={metrics?.memory.usagePercent || 0} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatBytes(metrics?.memory.used || 0)} / {formatBytes(metrics?.memory.total || 0)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <HardDrive className="w-4 h-4" />
                      Disk
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-disk-usage">
                      {metrics?.disk.usagePercent.toFixed(1) || '0'}%
                    </div>
                    <Progress value={metrics?.disk.usagePercent || 0} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatBytes(metrics?.disk.used || 0)} / {formatBytes(metrics?.disk.total || 0)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Uptime
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-uptime">
                      {formatDuration(metrics?.uptime || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Since last restart
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Alerts Panel */}
              <Card className="flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Active Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    {alerts.filter(a => !a.resolvedAt).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50 text-green-500" />
                        <p>No active alerts</p>
                        <p className="text-sm">All systems operating normally</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {alerts.filter(a => !a.resolvedAt).map(alert => (
                          <div 
                            key={alert.id}
                            className={`p-3 rounded-md border ${
                              alert.severity === 'critical' ? 'border-destructive bg-destructive/10' :
                              alert.severity === 'warning' ? 'border-yellow-500 bg-yellow-500/10' :
                              'border-blue-500 bg-blue-500/10'
                            }`}
                            data-testid={`card-alert-${alert.id}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-medium text-sm">{alert.message}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(alert.triggeredAt).toLocaleString()}
                                </p>
                              </div>
                              <Badge 
                                variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
                                className="text-xs"
                              >
                                {alert.severity}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Updates Tab */}
          <TabsContent value="updates" className="h-full m-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
              {/* Update Packages */}
              <Card className="flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                  <div>
                    <CardTitle className="text-base">Update Packages</CardTitle>
                    <CardDescription>Version packages for deployment</CardDescription>
                  </div>
                  <Dialog open={showCreatePackage} onOpenChange={setShowCreatePackage}>
                    <DialogTrigger asChild>
                      <Button size="sm" data-testid="button-create-package">
                        <Package className="w-4 h-4 mr-2" />
                        New Package
                      </Button>
                    </DialogTrigger>
                    <DialogContent data-testid="dialog-create-package">
                      <DialogHeader>
                        <DialogTitle>Create Update Package</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Version</Label>
                          <Input 
                            value={newPackage.version}
                            onChange={(e) => setNewPackage(prev => ({ ...prev, version: e.target.value }))}
                            placeholder="1.0.0"
                            data-testid="input-package-version"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Changelog</Label>
                          <Textarea 
                            value={newPackage.changelog}
                            onChange={(e) => setNewPackage(prev => ({ ...prev, changelog: e.target.value }))}
                            placeholder="What's new in this version..."
                            data-testid="input-package-changelog"
                          />
                        </div>
                        <Button 
                          className="w-full" 
                          onClick={() => createPackageMutation.mutate(newPackage)}
                          disabled={createPackageMutation.isPending || !newPackage.version}
                          data-testid="button-confirm-create-package"
                        >
                          {createPackageMutation.isPending ? 'Creating...' : 'Create Package'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    {packages.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No update packages</p>
                        <p className="text-sm">Create a package to deploy updates</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {packages.map(pkg => (
                          <div 
                            key={pkg.id}
                            className="p-3 rounded-md border"
                            data-testid={`card-package-${pkg.id}`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">v{pkg.version}</span>
                              </div>
                              <Badge variant="outline">
                                {pkg.files.length} files
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {pkg.changelog || 'No changelog provided'}
                            </p>
                            <div className="flex items-center justify-between gap-2 mt-2">
                              <span className="text-xs text-muted-foreground">
                                {new Date(pkg.createdAt).toLocaleDateString()}
                              </span>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => selectedTarget && deployUpdateMutation.mutate({ 
                                  packageId: pkg.id, 
                                  targetId: selectedTarget 
                                })}
                                disabled={!selectedTarget || deployUpdateMutation.isPending}
                                data-testid={`button-deploy-package-${pkg.id}`}
                              >
                                Deploy
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Update Schedule */}
              <Card className="flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Update Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto-Update</Label>
                        <p className="text-xs text-muted-foreground">Automatically deploy new packages</p>
                      </div>
                      <Switch data-testid="switch-auto-update" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto-Rollback</Label>
                        <p className="text-xs text-muted-foreground">Rollback on failed deployments</p>
                      </div>
                      <Switch defaultChecked data-testid="switch-auto-rollback" />
                    </div>
                    <div className="space-y-2">
                      <Label>Update Schedule</Label>
                      <Select defaultValue="manual">
                        <SelectTrigger data-testid="select-update-schedule">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="immediate">Immediate</SelectItem>
                          <SelectItem value="daily">Daily (3:00 AM)</SelectItem>
                          <SelectItem value="weekly">Weekly (Sunday 3:00 AM)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Costs Tab */}
          <TabsContent value="costs" className="h-full m-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Cost Summary */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Cost Comparison</CardTitle>
                  <CardDescription>Monthly estimated costs by provider</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {providers.map(provider => (
                      <div key={provider.id} className="space-y-2" data-testid={`cost-provider-${provider.id}`}>
                        <h4 className="font-medium">{provider.name}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {provider.serverTypes.slice(0, 4).map(server => (
                            <div 
                              key={server.id}
                              className="p-2 border rounded-md text-sm"
                            >
                              <p className="font-medium">{server.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {server.vcpus} vCPU, {server.memory}GB
                              </p>
                              <p className="text-primary font-medium">
                                ${(server.priceHourly * 730).toFixed(2)}/mo
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Savings Calculator */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Replit Savings</CardTitle>
                  <CardDescription>Estimated monthly savings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-md text-center">
                      <p className="text-3xl font-bold text-green-600" data-testid="text-estimated-savings">
                        ~$15-25
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Estimated monthly savings
                      </p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Replit Hacker Plan</span>
                        <span>$25/mo</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Hetzner CX21</span>
                        <span>~$7/mo</span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-2">
                        <span>Savings</span>
                        <span className="text-green-600">$18/mo</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Plus: No usage limits, full control, no vendor lock-in
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
