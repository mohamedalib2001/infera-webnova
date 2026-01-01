/**
 * Internal IDE Component - محرر التطوير الداخلي
 * 
 * محرر أكواد متكامل مع:
 * - Monaco Editor
 * - تحليل الموارد والأداء
 * - إعادة الهيكلة بالذكاء الاصطناعي
 * - تقدير التكلفة والتحسين
 */

import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Editor from "@monaco-editor/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  FolderOpen,
  File,
  FileCode,
  Save,
  Play,
  RefreshCw,
  Zap,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Cpu,
  HardDrive,
  Network,
  Package,
  ChevronRight,
  ChevronDown,
  Wand2,
  Settings,
  TrendingDown,
  Shield,
  Eye,
  Wrench,
  BarChart3
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface FileNode {
  path: string;
  name: string;
  type: 'file' | 'directory';
  content?: string;
  size?: number;
  language?: string;
  children?: FileNode[];
}

interface PerformanceIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  file: string;
  line?: number;
  description: string;
  suggestion: string;
  estimatedImpact: string;
  autoFixAvailable: boolean;
}

interface InternalIDEProps {
  repositoryId: string;
  repositoryName: string;
}

export function InternalIDE({ repositoryId, repositoryName }: InternalIDEProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("editor");
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [editorContent, setEditorContent] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [refactorGoals, setRefactorGoals] = useState<string[]>(["performance", "readability"]);

  // Fetch file tree
  const { data: filesData, isLoading: filesLoading } = useQuery({
    queryKey: ['/api/dev/files', repositoryId],
    enabled: !!repositoryId
  });

  // Fetch resources analysis
  const { data: resourcesData, isLoading: resourcesLoading, refetch: refetchResources } = useQuery({
    queryKey: ['/api/dev/resources', repositoryId],
    enabled: !!repositoryId && activeTab === "resources"
  });

  // Fetch performance issues
  const { data: performanceData, isLoading: performanceLoading, refetch: refetchPerformance } = useQuery({
    queryKey: ['/api/dev/performance', repositoryId],
    enabled: !!repositoryId && activeTab === "performance"
  });

  // Fetch costs analysis
  const { data: costsData, isLoading: costsLoading, refetch: refetchCosts } = useQuery({
    queryKey: ['/api/dev/costs', repositoryId],
    enabled: !!repositoryId && activeTab === "costs"
  });

  // Save file mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) throw new Error("No file selected");
      return apiRequest(`/api/dev/file/${repositoryId}/${selectedFile.path}`, {
        method: "PUT",
        body: JSON.stringify({ content: editorContent })
      });
    },
    onSuccess: () => {
      setHasChanges(false);
      toast({ title: "File saved | تم حفظ الملف" });
      queryClient.invalidateQueries({ queryKey: ['/api/dev/files', repositoryId] });
    },
    onError: (error: any) => {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    }
  });

  // Refactor mutation
  const refactorMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) throw new Error("No file selected");
      return apiRequest("/api/dev/refactor", {
        method: "POST",
        body: JSON.stringify({
          code: editorContent,
          language: selectedFile.language || "javascript",
          goals: refactorGoals
        })
      });
    },
    onSuccess: (data: any) => {
      if (data.data?.refactoredCode) {
        setEditorContent(data.data.refactoredCode);
        setHasChanges(true);
        toast({ 
          title: "Refactoring complete | اكتملت إعادة الهيكلة",
          description: `${data.data.changes?.length || 0} improvements applied`
        });
      }
    },
    onError: (error: any) => {
      toast({ title: "Refactoring failed", description: error.message, variant: "destructive" });
    }
  });

  // Auto-fix mutation
  const autoFixMutation = useMutation({
    mutationFn: async (issue: PerformanceIssue) => {
      return apiRequest(`/api/dev/autofix/${repositoryId}`, {
        method: "POST",
        body: JSON.stringify({ issue })
      });
    },
    onSuccess: () => {
      toast({ title: "Fix applied | تم تطبيق الإصلاح" });
      refetchPerformance();
      queryClient.invalidateQueries({ queryKey: ['/api/dev/files', repositoryId] });
    },
    onError: (error: any) => {
      toast({ title: "Fix failed", description: error.message, variant: "destructive" });
    }
  });

  // Fix all mutation
  const fixAllMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/dev/fix-all/${repositoryId}`, {
        method: "POST"
      });
    },
    onSuccess: (data: any) => {
      toast({ 
        title: "Auto-fix complete | اكتمل الإصلاح التلقائي",
        description: `Fixed ${data.data?.fixed || 0} issues`
      });
      refetchPerformance();
      queryClient.invalidateQueries({ queryKey: ['/api/dev/files', repositoryId] });
    },
    onError: (error: any) => {
      toast({ title: "Fix all failed", description: error.message, variant: "destructive" });
    }
  });

  // Load file content when selected
  useEffect(() => {
    if (selectedFile && selectedFile.type === 'file') {
      fetch(`/api/dev/file/${repositoryId}/${selectedFile.path}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setEditorContent(data.data.content);
            setHasChanges(false);
          }
        });
    }
  }, [selectedFile, repositoryId]);

  const toggleDir = useCallback((path: string) => {
    setExpandedDirs(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const renderFileTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map(node => {
      const isExpanded = expandedDirs.has(node.path);
      const isSelected = selectedFile?.path === node.path;

      if (node.type === 'directory') {
        return (
          <Collapsible 
            key={node.path} 
            open={isExpanded} 
            onOpenChange={() => toggleDir(node.path)}
          >
            <CollapsibleTrigger asChild>
              <div
                className={`flex items-center gap-1 py-1 px-2 cursor-pointer hover-elevate rounded-md`}
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
                data-testid={`folder-${node.name}`}
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <FolderOpen className="w-4 h-4 text-amber-500" />
                <span className="text-sm truncate">{node.name}</span>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              {node.children && renderFileTree(node.children, depth + 1)}
            </CollapsibleContent>
          </Collapsible>
        );
      }

      return (
        <div
          key={node.path}
          className={`flex items-center gap-2 py-1 px-2 cursor-pointer rounded-md ${
            isSelected ? 'bg-accent' : 'hover-elevate'
          }`}
          style={{ paddingLeft: `${depth * 12 + 24}px` }}
          onClick={() => setSelectedFile(node)}
          data-testid={`file-${node.name}`}
        >
          <FileCode className="w-4 h-4 text-blue-500" />
          <span className="text-sm truncate">{node.name}</span>
        </div>
      );
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'low': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cpu': return <Cpu className="w-4 h-4" />;
      case 'memory': return <HardDrive className="w-4 h-4" />;
      case 'network': return <Network className="w-4 h-4" />;
      case 'bundle': return <Package className="w-4 h-4" />;
      case 'database': return <HardDrive className="w-4 h-4" />;
      case 'rendering': return <Eye className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const files = filesData?.data || [];
  const resources = resourcesData?.data;
  const performance = performanceData?.data;
  const costs = costsData?.data;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 p-4 border-b">
        <div className="flex items-center gap-2">
          <FileCode className="w-5 h-5" />
          <h2 className="font-semibold">{repositoryName}</h2>
          <Badge variant="outline">Internal IDE</Badge>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="secondary">Unsaved changes</Badge>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => saveMutation.mutate()}
            disabled={!hasChanges || saveMutation.isPending}
            data-testid="button-save"
          >
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* File Explorer */}
        <div className="w-64 border-r flex flex-col">
          <div className="p-2 border-b">
            <span className="text-sm font-medium text-muted-foreground">Files</span>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2">
              {filesLoading ? (
                <div className="flex items-center justify-center p-4">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                </div>
              ) : (
                renderFileTree(files)
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Editor & Analysis Tabs */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="mx-4 mt-2 justify-start w-fit">
              <TabsTrigger value="editor" data-testid="tab-editor">
                <FileCode className="w-4 h-4 mr-1" />
                Editor
              </TabsTrigger>
              <TabsTrigger value="resources" data-testid="tab-resources">
                <BarChart3 className="w-4 h-4 mr-1" />
                Resources
              </TabsTrigger>
              <TabsTrigger value="performance" data-testid="tab-performance">
                <Zap className="w-4 h-4 mr-1" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="costs" data-testid="tab-costs">
                <DollarSign className="w-4 h-4 mr-1" />
                Costs
              </TabsTrigger>
            </TabsList>

            {/* Editor Tab */}
            <TabsContent value="editor" className="flex-1 flex flex-col mt-0 p-4 pt-2">
              {selectedFile ? (
                <div className="flex-1 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{selectedFile.language || 'text'}</Badge>
                      <span className="text-sm text-muted-foreground">{selectedFile.path}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select 
                        value={refactorGoals.join(',')}
                        onValueChange={(v) => setRefactorGoals(v.split(','))}
                      >
                        <SelectTrigger className="w-48" data-testid="select-refactor-goals">
                          <SelectValue placeholder="Refactor goals" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="performance,readability">Performance + Readability</SelectItem>
                          <SelectItem value="performance,memory">Performance + Memory</SelectItem>
                          <SelectItem value="security,readability">Security + Readability</SelectItem>
                          <SelectItem value="performance,security,memory">All Optimizations</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => refactorMutation.mutate()}
                        disabled={refactorMutation.isPending}
                        data-testid="button-refactor"
                      >
                        {refactorMutation.isPending ? (
                          <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <Wand2 className="w-4 h-4 mr-1" />
                        )}
                        AI Refactor
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 border rounded-md overflow-hidden">
                    <Editor
                      height="100%"
                      language={selectedFile.language || 'javascript'}
                      value={editorContent}
                      onChange={(value) => {
                        setEditorContent(value || '');
                        setHasChanges(true);
                      }}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: true },
                        fontSize: 14,
                        wordWrap: 'on',
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <File className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a file to edit</p>
                    <p className="text-sm">اختر ملفاً للتحرير</p>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Resources Tab */}
            <TabsContent value="resources" className="flex-1 mt-0 p-4 pt-2 overflow-auto">
              {resourcesLoading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
              ) : resources ? (
                <div className="space-y-6">
                  {/* Memory Usage */}
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <HardDrive className="w-5 h-5" />
                          <CardTitle className="text-base">Memory Usage</CardTitle>
                        </div>
                        <Badge variant="outline">{resources.memoryUsage?.estimated}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {resources.memoryUsage?.breakdown?.map((item: any, i: number) => (
                          <div key={i}>
                            <div className="flex justify-between text-sm mb-1">
                              <span>{item.component}</span>
                              <span className="text-muted-foreground">{item.usage} ({item.percentage}%)</span>
                            </div>
                            <Progress value={item.percentage} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* CPU Hotspots */}
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Cpu className="w-5 h-5" />
                          <CardTitle className="text-base">CPU Hotspots</CardTitle>
                        </div>
                        <Badge variant={resources.cpuUsage?.estimated === 'High' ? 'destructive' : 'secondary'}>
                          {resources.cpuUsage?.estimated}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {resources.cpuUsage?.hotspots?.length > 0 ? (
                        <div className="space-y-2">
                          {resources.cpuUsage.hotspots.map((hotspot: any, i: number) => (
                            <div key={i} className="flex items-start gap-2 p-2 bg-muted/50 rounded-md">
                              <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm font-medium">{hotspot.file}:{hotspot.line}</p>
                                <p className="text-sm text-muted-foreground">{hotspot.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No CPU hotspots detected</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Bundle Size */}
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Package className="w-5 h-5" />
                          <CardTitle className="text-base">Bundle Size</CardTitle>
                        </div>
                        <Badge variant="outline">{resources.bundleSize?.total}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {resources.bundleSize?.breakdown?.slice(0, 5).map((item: any, i: number) => (
                          <div key={i}>
                            <div className="flex justify-between text-sm mb-1">
                              <span>{item.module}</span>
                              <span className="text-muted-foreground">{item.size} ({item.percentage}%)</span>
                            </div>
                            <Progress value={item.percentage} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  <Button variant="outline" onClick={() => refetchResources()}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Load Analysis
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="flex-1 mt-0 p-4 pt-2 overflow-auto">
              {performanceLoading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
              ) : performance ? (
                <div className="space-y-4">
                  {/* Summary */}
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <span className="text-sm">Critical: {performance.summary?.critical}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-orange-500" />
                            <span className="text-sm">High: {performance.summary?.high}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-500" />
                            <span className="text-sm">Medium: {performance.summary?.medium}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                            <span className="text-sm">Low: {performance.summary?.low}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {performance.summary?.autoFixable} auto-fixable
                          </Badge>
                          <Button
                            size="sm"
                            onClick={() => fixAllMutation.mutate()}
                            disabled={fixAllMutation.isPending || performance.summary?.autoFixable === 0}
                            data-testid="button-fix-all"
                          >
                            {fixAllMutation.isPending ? (
                              <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <Wrench className="w-4 h-4 mr-1" />
                            )}
                            Fix All
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Issues List */}
                  <div className="space-y-3">
                    {performance.issues?.map((issue: PerformanceIssue) => (
                      <Card key={issue.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-md ${getSeverityColor(issue.severity)}`}>
                              {getCategoryIcon(issue.category)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge className={getSeverityColor(issue.severity)}>
                                  {issue.severity}
                                </Badge>
                                <Badge variant="outline">{issue.category}</Badge>
                                <span className="text-sm text-muted-foreground">
                                  {issue.file}{issue.line ? `:${issue.line}` : ''}
                                </span>
                              </div>
                              <p className="mt-2 text-sm font-medium">{issue.description}</p>
                              <p className="mt-1 text-sm text-muted-foreground">{issue.suggestion}</p>
                              <div className="mt-2 flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  Impact: {issue.estimatedImpact}
                                </Badge>
                                {issue.autoFixAvailable && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => autoFixMutation.mutate(issue)}
                                    disabled={autoFixMutation.isPending}
                                    data-testid={`button-fix-${issue.id}`}
                                  >
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Auto-fix
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  <Button variant="outline" onClick={() => refetchPerformance()}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Analyze Performance
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Costs Tab */}
            <TabsContent value="costs" className="flex-1 mt-0 p-4 pt-2 overflow-auto">
              {costsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
              ) : costs ? (
                <div className="space-y-6">
                  {/* Cost Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Current Estimate</CardTitle>
                        <CardDescription>Before optimization</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">{costs.currentEstimate?.total}</p>
                        <div className="mt-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Compute</span>
                            <span>{costs.currentEstimate?.compute}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Storage</span>
                            <span>{costs.currentEstimate?.storage}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Network</span>
                            <span>{costs.currentEstimate?.network}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-green-500/30">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">Optimized Estimate</CardTitle>
                            <CardDescription>After recommendations</CardDescription>
                          </div>
                          <TrendingDown className="w-5 h-5 text-green-500" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-green-500">{costs.optimizedEstimate?.total}</p>
                        <div className="mt-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Compute</span>
                            <span>{costs.optimizedEstimate?.compute}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Storage</span>
                            <span>{costs.optimizedEstimate?.storage}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Network</span>
                            <span>{costs.optimizedEstimate?.network}</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Potential Savings</span>
                            <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                              {costs.savings}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recommendations */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Optimization Recommendations</CardTitle>
                      <CardDescription>Sorted by effort (easiest first)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {costs.recommendations?.map((rec: any, i: number) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-muted/50 rounded-md">
                            <div className={`p-2 rounded-md ${
                              rec.effort === 'low' ? 'bg-green-500/10 text-green-500' :
                              rec.effort === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                              'bg-red-500/10 text-red-500'
                            }`}>
                              {rec.category === 'Infrastructure' ? <Settings className="w-4 h-4" /> :
                               rec.category === 'Database' ? <HardDrive className="w-4 h-4" /> :
                               rec.category === 'Network' ? <Network className="w-4 h-4" /> :
                               rec.category === 'Bundle Size' ? <Package className="w-4 h-4" /> :
                               <Zap className="w-4 h-4" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{rec.category}</span>
                                <Badge variant="outline" className="text-xs">
                                  {rec.effort} effort
                                </Badge>
                              </div>
                              <p className="text-sm mt-1">{rec.action}</p>
                              <p className="text-sm text-muted-foreground mt-1">{rec.impact}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  <Button variant="outline" onClick={() => refetchCosts()}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Analyze Costs
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
