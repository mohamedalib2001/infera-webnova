/**
 * Independence Panel | لوحة الاستقلال
 * 
 * Interface for configuring independent runtime for projects
 * تكوين بيئة التشغيل المستقلة للمشاريع
 */

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Box, Play, FileCode, Shield, Server, Loader2, Check, 
  AlertTriangle, ExternalLink, Container, Terminal, Key, FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface IndependenceConfig {
  runtimeType: 'node' | 'python' | 'go' | 'rust' | 'multi';
  portConfig: {
    main: number;
    additional: number[];
  };
  filesToCreate: string[];
  envVariables: EnvVariable[];
  replacementsNeeded: DependencyReplacement[];
}

interface EnvVariable {
  key: string;
  description: string;
  descriptionAr: string;
  required: boolean;
  defaultValue?: string;
  sensitive: boolean;
  replitEquivalent?: string;
}

interface DependencyReplacement {
  original: string;
  replacement: string;
  reason: string;
  reasonAr: string;
  effort: 'trivial' | 'easy' | 'moderate' | 'complex';
  instructions: string[];
}

interface IndependencePanelProps {
  repositoryId: string;
  repositoryName: string;
  onComplete?: () => void;
}

export function IndependencePanel({ repositoryId, repositoryName, onComplete }: IndependencePanelProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [previewData, setPreviewData] = useState<IndependenceConfig | null>(null);
  const [applied, setApplied] = useState(false);

  const previewMutation = useMutation({
    mutationFn: () => apiRequest("GET", `/api/replit/independence/preview/${repositoryId}`),
    onSuccess: (response: any) => {
      setPreviewData(response.data);
    },
    onError: (error: any) => {
      toast({
        title: "Preview failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const applyMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/replit/independence/${repositoryId}`),
    onSuccess: (response: any) => {
      setApplied(true);
      toast({
        title: "Independence configured",
        description: `Created ${response.data?.filesCreated?.length || 0} files for independent operation`
      });
      onComplete?.();
    },
    onError: (error: any) => {
      toast({
        title: "Configuration failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const getRuntimeLabel = (runtime: string) => {
    switch (runtime) {
      case 'node': return 'Node.js';
      case 'python': return 'Python';
      case 'go': return 'Go';
      case 'rust': return 'Rust';
      default: return 'Multi';
    }
  };

  const getEffortBadge = (effort: string) => {
    switch (effort) {
      case 'trivial': return <Badge variant="outline" className="bg-green-500/10 text-green-500">Trivial</Badge>;
      case 'easy': return <Badge variant="outline" className="bg-blue-500/10 text-blue-500">Easy</Badge>;
      case 'moderate': return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">Moderate</Badge>;
      case 'complex': return <Badge variant="outline" className="bg-red-500/10 text-red-500">Complex</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card className="border-2 border-dashed">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Container className="w-6 h-6" />
            <div>
              <CardTitle>Independence Engine | محرك الاستقلال</CardTitle>
              <CardDescription>
                Configure "{repositoryName}" for independent operation
              </CardDescription>
            </div>
          </div>
          {applied && (
            <Badge className="bg-green-500">
              <Check className="w-3 h-3 mr-1" />
              Configured
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!previewData && !applied ? (
          <div className="text-center py-8">
            <Server className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Enable Independent Operation</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Generate Docker configuration, environment templates, and migration guides
              to run this project anywhere without depending on Replit services.
            </p>
            <Button
              onClick={() => previewMutation.mutate()}
              disabled={previewMutation.isPending}
              data-testid="button-preview-independence"
            >
              {previewMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Box className="w-4 h-4 mr-2" />
              )}
              Preview Configuration
            </Button>
          </div>
        ) : applied ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">Independence Configured</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The following files have been created in your repository:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="outline"><FileCode className="w-3 h-3 mr-1" /> Dockerfile</Badge>
              <Badge variant="outline"><FileCode className="w-3 h-3 mr-1" /> docker-compose.yml</Badge>
              <Badge variant="outline"><Terminal className="w-3 h-3 mr-1" /> start.sh</Badge>
              <Badge variant="outline"><Key className="w-3 h-3 mr-1" /> .env.template</Badge>
              <Badge variant="outline"><FileText className="w-3 h-3 mr-1" /> INDEPENDENCE_GUIDE.md</Badge>
            </div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="docker" data-testid="tab-docker">Docker</TabsTrigger>
              <TabsTrigger value="env" data-testid="tab-env">Environment</TabsTrigger>
              <TabsTrigger value="migration" data-testid="tab-migration">Migration</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Server className="w-5 h-5" />
                      <span className="font-medium">Runtime Type</span>
                    </div>
                    <p className="text-2xl font-semibold">
                      {getRuntimeLabel(previewData?.runtimeType || 'node')}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Play className="w-5 h-5" />
                      <span className="font-medium">Main Port</span>
                    </div>
                    <p className="text-2xl">{previewData?.portConfig?.main || 3000}</p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-3">Files to be created | الملفات التي ستُنشأ</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {previewData?.filesToCreate?.map((file) => (
                      <div key={file} className="flex items-center gap-2 text-sm">
                        <FileCode className="w-4 h-4 text-muted-foreground" />
                        <span>{file}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={() => applyMutation.mutate()}
                  disabled={applyMutation.isPending}
                  data-testid="button-apply-independence"
                >
                  {applyMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Container className="w-4 h-4 mr-2" />
                  )}
                  Apply Independence Configuration
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="docker" className="mt-4">
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-2">Docker Configuration</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    A multi-stage Dockerfile and docker-compose.yml will be generated
                    with optimized builds and security best practices.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Multi-stage build for smaller images</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Non-root user for security</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Health checks configured</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Production-ready compose file</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border">
                  <h4 className="font-medium mb-2">Quick Start Commands</h4>
                  <div className="space-y-2 font-mono text-sm bg-background p-3 rounded">
                    <p className="text-muted-foreground"># Build and run with Docker</p>
                    <p>docker-compose up -d</p>
                    <p className="text-muted-foreground mt-2"># View logs</p>
                    <p>docker-compose logs -f app</p>
                    <p className="text-muted-foreground mt-2"># Stop services</p>
                    <p>docker-compose down</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="env" className="mt-4">
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {previewData?.envVariables?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Key className="w-8 h-8 mx-auto mb-2" />
                      <p>No environment variables detected</p>
                    </div>
                  ) : (
                    previewData?.envVariables?.map((env) => (
                      <div key={env.key} className="p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between mb-1">
                          <code className="font-medium">{env.key}</code>
                          <div className="flex gap-2">
                            {env.required && (
                              <Badge variant="outline" className="text-xs">Required</Badge>
                            )}
                            {env.sensitive && (
                              <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-600">
                                <Shield className="w-3 h-3 mr-1" />
                                Sensitive
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{env.description}</p>
                        <p className="text-sm text-muted-foreground">{env.descriptionAr}</p>
                        {env.replitEquivalent && (
                          <p className="text-xs mt-1 text-blue-500">
                            Replaces: {env.replitEquivalent}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="migration" className="mt-4">
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {previewData?.replacementsNeeded?.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                        <Check className="w-6 h-6 text-green-500" />
                      </div>
                      <h3 className="font-medium">No Replit dependencies detected</h3>
                      <p className="text-sm text-muted-foreground">
                        This project is already independent and portable
                      </p>
                    </div>
                  ) : (
                    previewData?.replacementsNeeded?.map((rep, idx) => (
                      <div key={idx} className="p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                            <code className="font-medium">{rep.original}</code>
                          </div>
                          {getEffortBadge(rep.effort)}
                        </div>
                        <p className="text-sm mb-2">
                          <span className="text-muted-foreground">Replace with:</span>{' '}
                          <span className="font-medium">{rep.replacement}</span>
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">{rep.reason}</p>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Instructions:</p>
                          <ol className="list-decimal list-inside text-sm text-muted-foreground">
                            {rep.instructions.map((inst, i) => (
                              <li key={i}>{inst}</li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}

export default IndependencePanel;
