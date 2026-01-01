/**
 * Detach Mode Component - مكون وضع الاستقلال
 * 
 * UI for analyzing and executing Replit detachment
 * واجهة تحليل وتنفيذ الفصل عن Replit
 */

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Unlink,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileCode,
  Package,
  Settings,
  Terminal,
  Download,
  Server,
  Shield,
  Copy,
  RefreshCw,
  Loader2
} from 'lucide-react';

interface ReplitDependency {
  type: 'file' | 'env' | 'config' | 'package' | 'script';
  name: string;
  path?: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  replacement?: string;
}

interface DetachAnalysis {
  repositoryId: string;
  analyzedAt: string;
  totalDependencies: number;
  criticalCount: number;
  dependencies: ReplitDependency[];
  readyToDetach: boolean;
  replacementPlan: {
    filesToRemove: string[];
    filesToReplace: { path: string; content: string; reason: string }[];
    filesToAdd: { path: string; content: string; reason: string }[];
    envVarsToReplace: { key: string; defaultValue: string; description: string }[];
    packagesToRemove: string[];
    packagesToAdd: { name: string; version: string; reason: string }[];
  };
}

interface DetachResult {
  success: boolean;
  repositoryId: string;
  detachedAt: string;
  filesModified: number;
  filesRemoved: number;
  filesAdded: number;
  deploymentConfig: any;
}

interface DeploymentPackage {
  dockerfile: string;
  dockerCompose: string;
  systemdService: string;
  nginxConfig: string;
  envExample: string;
  deployScript: string;
  k8sManifests: string;
}

interface DetachModeProps {
  repositoryId: string;
  repositoryName?: string;
}

export function DetachMode({ repositoryId, repositoryName }: DetachModeProps) {
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<DetachAnalysis | null>(null);
  const [result, setResult] = useState<DetachResult | null>(null);
  const [deploymentPackage, setDeploymentPackage] = useState<DeploymentPackage | null>(null);
  const [activeConfigTab, setActiveConfigTab] = useState('dockerfile');

  // Analyze mutation
  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/detach/analyze', { repositoryId });
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysis(data.analysis);
      toast({
        title: 'Analysis Complete | اكتمل التحليل',
        description: `Found ${data.analysis.totalDependencies} dependencies`
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Analysis Failed | فشل التحليل',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Execute detach mutation
  const detachMutation = useMutation({
    mutationFn: async () => {
      // Note: Server re-analyzes for security - we only send repositoryId
      const response = await apiRequest('POST', '/api/detach/execute', { 
        repositoryId
      });
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data.result);
      setAnalysis(null);
      toast({
        title: 'Detach Complete | اكتمل الفصل',
        description: 'Repository is now independent from Replit'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Detach Failed | فشل الفصل',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Get deployment package mutation
  const packageMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('GET', `/api/detach/deployment-package/${repositoryId}`);
      return response.json();
    },
    onSuccess: (data) => {
      setDeploymentPackage(data.package);
    },
    onError: (error: any) => {
      toast({
        title: 'Package Generation Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'file': return <FileCode className="h-4 w-4" />;
      case 'package': return <Package className="h-4 w-4" />;
      case 'env': return <Settings className="h-4 w-4" />;
      case 'config': return <Terminal className="h-4 w-4" />;
      case 'script': return <Terminal className="h-4 w-4" />;
      default: return <FileCode className="h-4 w-4" />;
    }
  };

  const copyToClipboard = (content: string, name: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: 'Copied | تم النسخ',
      description: `${name} copied to clipboard`
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Unlink className="h-5 w-5 text-primary" />
              <CardTitle>Detach Mode | وضع الاستقلال</CardTitle>
            </div>
            <Badge variant={result ? 'default' : analysis ? 'secondary' : 'outline'}>
              {result ? 'Detached' : analysis ? 'Analyzed' : 'Ready'}
            </Badge>
          </div>
          <CardDescription>
            Remove all Replit dependencies and generate standalone deployment
            <br />
            إزالة جميع تبعيات Replit وتوليد نشر مستقل
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => analyzeMutation.mutate()}
              disabled={analyzeMutation.isPending}
              data-testid="button-analyze-dependencies"
            >
              {analyzeMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Analyze Dependencies | تحليل التبعيات
            </Button>
            
            {analysis && !result && (
              <Button
                onClick={() => detachMutation.mutate()}
                disabled={detachMutation.isPending}
                variant="destructive"
                data-testid="button-execute-detach"
              >
                {detachMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Unlink className="h-4 w-4 mr-2" />
                )}
                Execute Detach | تنفيذ الفصل
              </Button>
            )}
            
            <Button
              onClick={() => packageMutation.mutate()}
              disabled={packageMutation.isPending}
              variant="outline"
              data-testid="button-generate-package"
            >
              {packageMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Deployment Package | حزمة النشر
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Replit Dependencies Found | تبعيات Replit المكتشفة
            </CardTitle>
            <CardDescription>
              {analysis.totalDependencies} dependencies found, {analysis.criticalCount} critical
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted rounded-md">
                  <div className="text-2xl font-bold">{analysis.totalDependencies}</div>
                  <div className="text-sm text-muted-foreground">Total | الإجمالي</div>
                </div>
                <div className="text-center p-3 bg-destructive/10 rounded-md">
                  <div className="text-2xl font-bold text-destructive">{analysis.criticalCount}</div>
                  <div className="text-sm text-muted-foreground">Critical | حرج</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-md">
                  <div className="text-2xl font-bold">{analysis.replacementPlan.filesToRemove.length}</div>
                  <div className="text-sm text-muted-foreground">To Remove | للحذف</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-md">
                  <div className="text-2xl font-bold">{analysis.replacementPlan.filesToAdd.length}</div>
                  <div className="text-sm text-muted-foreground">To Add | للإضافة</div>
                </div>
              </div>

              <Separator />

              {/* Dependencies List */}
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {analysis.dependencies.map((dep, index) => (
                    <div
                      key={`${dep.type}-${dep.name}-${index}`}
                      className="flex items-center justify-between p-3 bg-muted rounded-md gap-2"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {getTypeIcon(dep.type)}
                        <div className="min-w-0 flex-1">
                          <div className="font-mono text-sm truncate">{dep.name}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {dep.path && <span>{dep.path} - </span>}
                            {dep.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getSeverityColor(dep.severity)} className="text-xs">
                          {dep.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Replacement Plan */}
              {analysis.replacementPlan.filesToAdd.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Files to Add | الملفات المضافة
                    </h4>
                    <div className="space-y-1">
                      {analysis.replacementPlan.filesToAdd.map((file, i) => (
                        <div key={i} className="text-sm flex items-center gap-2">
                          <FileCode className="h-3 w-3" />
                          <span className="font-mono">{file.path}</span>
                          <span className="text-muted-foreground">- {file.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detach Result */}
      {result && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Detachment Complete | اكتمل الفصل</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-1 text-sm">
              <div>Files modified: {result.filesModified}</div>
              <div>Files removed: {result.filesRemoved}</div>
              <div>Files added: {result.filesAdded}</div>
              <div>Completed at: {new Date(result.detachedAt).toLocaleString()}</div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Deployment Package */}
      {deploymentPackage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Deployment Package | حزمة النشر
            </CardTitle>
            <CardDescription>
              Ready-to-use deployment configurations for your infrastructure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeConfigTab} onValueChange={setActiveConfigTab}>
              <TabsList className="flex flex-wrap h-auto gap-1">
                <TabsTrigger value="dockerfile" data-testid="tab-dockerfile">
                  Dockerfile
                </TabsTrigger>
                <TabsTrigger value="docker-compose" data-testid="tab-docker-compose">
                  Docker Compose
                </TabsTrigger>
                <TabsTrigger value="systemd" data-testid="tab-systemd">
                  SystemD
                </TabsTrigger>
                <TabsTrigger value="nginx" data-testid="tab-nginx">
                  Nginx
                </TabsTrigger>
                <TabsTrigger value="k8s" data-testid="tab-k8s">
                  Kubernetes
                </TabsTrigger>
                <TabsTrigger value="env" data-testid="tab-env">
                  Environment
                </TabsTrigger>
                <TabsTrigger value="deploy" data-testid="tab-deploy">
                  Deploy Script
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dockerfile" className="mt-4">
                <div className="relative">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(deploymentPackage.dockerfile, 'Dockerfile')}
                    data-testid="button-copy-dockerfile"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <ScrollArea className="h-96 rounded-md border">
                    <pre className="p-4 text-sm font-mono whitespace-pre-wrap">
                      {deploymentPackage.dockerfile}
                    </pre>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="docker-compose" className="mt-4">
                <div className="relative">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(deploymentPackage.dockerCompose, 'Docker Compose')}
                    data-testid="button-copy-docker-compose"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <ScrollArea className="h-96 rounded-md border">
                    <pre className="p-4 text-sm font-mono whitespace-pre-wrap">
                      {deploymentPackage.dockerCompose}
                    </pre>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="systemd" className="mt-4">
                <div className="relative">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(deploymentPackage.systemdService, 'SystemD Service')}
                    data-testid="button-copy-systemd"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <ScrollArea className="h-96 rounded-md border">
                    <pre className="p-4 text-sm font-mono whitespace-pre-wrap">
                      {deploymentPackage.systemdService}
                    </pre>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="nginx" className="mt-4">
                <div className="relative">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(deploymentPackage.nginxConfig, 'Nginx Config')}
                    data-testid="button-copy-nginx"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <ScrollArea className="h-96 rounded-md border">
                    <pre className="p-4 text-sm font-mono whitespace-pre-wrap">
                      {deploymentPackage.nginxConfig}
                    </pre>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="k8s" className="mt-4">
                <div className="relative">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(deploymentPackage.k8sManifests, 'Kubernetes Manifests')}
                    data-testid="button-copy-k8s"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <ScrollArea className="h-96 rounded-md border">
                    <pre className="p-4 text-sm font-mono whitespace-pre-wrap">
                      {deploymentPackage.k8sManifests}
                    </pre>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="env" className="mt-4">
                <div className="relative">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(deploymentPackage.envExample, '.env.example')}
                    data-testid="button-copy-env"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <ScrollArea className="h-96 rounded-md border">
                    <pre className="p-4 text-sm font-mono whitespace-pre-wrap">
                      {deploymentPackage.envExample}
                    </pre>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="deploy" className="mt-4">
                <div className="relative">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(deploymentPackage.deployScript, 'deploy.sh')}
                    data-testid="button-copy-deploy"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <ScrollArea className="h-96 rounded-md border">
                    <pre className="p-4 text-sm font-mono whitespace-pre-wrap">
                      {deploymentPackage.deployScript}
                    </pre>
                  </ScrollArea>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Independence Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Independence Status | حالة الاستقلال
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {result ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : analysis?.totalDependencies === 0 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : analysis ? (
                <XCircle className="h-5 w-5 text-red-500" />
              ) : (
                <RefreshCw className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <div className="font-medium">
                  {result
                    ? 'Fully Independent | مستقل بالكامل'
                    : analysis?.totalDependencies === 0
                    ? 'Already Independent | مستقل مسبقاً'
                    : analysis
                    ? 'Has Dependencies | لديه تبعيات'
                    : 'Status Unknown | الحالة غير معروفة'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {result
                    ? 'Repository can run independently on any infrastructure'
                    : analysis?.totalDependencies === 0
                    ? 'No Replit dependencies detected'
                    : analysis
                    ? `${analysis.totalDependencies} Replit dependencies need removal`
                    : 'Run analysis to check independence status'}
                </div>
              </div>
            </div>
            
            {(result || analysis?.totalDependencies === 0) && (
              <div className="p-4 bg-muted rounded-md">
                <h4 className="font-medium mb-2">Supported Deployment Targets:</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Docker</Badge>
                  <Badge variant="outline">Kubernetes</Badge>
                  <Badge variant="outline">AWS EC2</Badge>
                  <Badge variant="outline">Google Cloud</Badge>
                  <Badge variant="outline">Azure</Badge>
                  <Badge variant="outline">DigitalOcean</Badge>
                  <Badge variant="outline">Hetzner</Badge>
                  <Badge variant="outline">VPS/Bare Metal</Badge>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
