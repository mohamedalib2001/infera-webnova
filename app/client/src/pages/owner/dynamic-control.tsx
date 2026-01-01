import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Settings, 
  Sliders, 
  LayoutGrid, 
  Component, 
  Workflow, 
  Globe, 
  CheckCircle2, 
  AlertTriangle, 
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Crown,
  Zap,
  Shield,
  Database,
  Cpu,
  Search,
  RefreshCw,
  Save
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function DynamicControlPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("summary");

  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = useQuery<{
    summary: {
      totalSettings: number;
      totalFeatures: number;
      enabledFeatures: number;
      totalPages: number;
      enabledPages: number;
      totalComponents: number;
      enabledComponents: number;
      totalEndpoints: number;
      enabledEndpoints: number;
      totalWorkflows: number;
      enabledWorkflows: number;
      dynamicScore: number;
      dynamicLevel: string;
    };
    categories: {
      settings: string[];
      features: string[];
      pages: string[];
      components: string[];
      workflows: string[];
    };
  }>({
    queryKey: ["/api/dynamic/summary"],
  });

  const { data: settings, isLoading: settingsLoading, refetch: refetchSettings } = useQuery<any[]>({
    queryKey: ["/api/dynamic/settings"],
  });

  const { data: features, isLoading: featuresLoading, refetch: refetchFeatures } = useQuery<any[]>({
    queryKey: ["/api/dynamic/features"],
  });

  const { data: pages, isLoading: pagesLoading, refetch: refetchPages } = useQuery<any[]>({
    queryKey: ["/api/dynamic/pages"],
  });

  const { data: components, isLoading: componentsLoading, refetch: refetchComponents } = useQuery<any[]>({
    queryKey: ["/api/dynamic/components"],
  });

  const { data: workflows, isLoading: workflowsLoading, refetch: refetchWorkflows } = useQuery<any[]>({
    queryKey: ["/api/dynamic/workflows"],
  });

  const toggleFeatureMutation = useMutation({
    mutationFn: async ({ code, isEnabled }: { code: string; isEnabled: boolean }) => {
      return apiRequest("POST", `/api/dynamic/features/${code}/toggle`, { isEnabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dynamic/features"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dynamic/summary"] });
      toast({ title: "Feature updated", description: "Feature toggle saved successfully" });
    }
  });

  const togglePageMutation = useMutation({
    mutationFn: async ({ pathname, isEnabled }: { pathname: string; isEnabled: boolean }) => {
      return apiRequest("POST", `/api/dynamic/pages/${encodeURIComponent(pathname)}/toggle`, { isEnabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dynamic/pages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dynamic/summary"] });
      toast({ title: "Page updated", description: "Page visibility saved successfully" });
    }
  });

  const toggleComponentMutation = useMutation({
    mutationFn: async ({ code, isEnabled }: { code: string; isEnabled: boolean }) => {
      return apiRequest("POST", `/api/dynamic/components/${code}/toggle`, { isEnabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dynamic/components"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dynamic/summary"] });
      toast({ title: "Component updated", description: "Component visibility saved successfully" });
    }
  });

  const toggleWorkflowMutation = useMutation({
    mutationFn: async ({ code, isEnabled }: { code: string; isEnabled: boolean }) => {
      return apiRequest("POST", `/api/dynamic/workflows/${code}/toggle`, { isEnabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dynamic/workflows"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dynamic/summary"] });
      toast({ title: "Workflow updated", description: "Workflow status saved successfully" });
    }
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: string }) => {
      return apiRequest("PATCH", `/api/dynamic/settings/${id}`, { value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dynamic/settings"] });
      toast({ title: "Setting updated", description: "Setting saved successfully" });
    }
  });

  const refreshAll = () => {
    refetchSummary();
    refetchSettings();
    refetchFeatures();
    refetchPages();
    refetchComponents();
    refetchWorkflows();
    toast({ title: "Refreshed", description: "All configurations reloaded" });
  };

  const getDynamicLevelColor = (level: string) => {
    switch (level) {
      case 'zero-code': return 'bg-green-500/10 text-green-600 border-green-500/30';
      case 'low-code': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30';
      default: return 'bg-red-500/10 text-red-600 border-red-500/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'core': return <Cpu className="h-4 w-4" />;
      case 'ai': return <Zap className="h-4 w-4" />;
      case 'devops': return <Workflow className="h-4 w-4" />;
      case 'governance': return <Shield className="h-4 w-4" />;
      case 'collaboration': return <Globe className="h-4 w-4" />;
      case 'branding': return <Crown className="h-4 w-4" />;
      case 'system': return <Settings className="h-4 w-4" />;
      case 'security': return <Lock className="h-4 w-4" />;
      case 'dashboard': return <LayoutGrid className="h-4 w-4" />;
      case 'owner': return <Crown className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  const filterItems = <T extends { name?: string; name_ar?: string; code?: string; key?: string; category?: string }>(items: T[] | undefined) => {
    if (!items) return [];
    if (!searchTerm) return items;
    const term = searchTerm.toLowerCase();
    return items.filter(item => 
      item.name?.toLowerCase().includes(term) ||
      item.name_ar?.includes(searchTerm) ||
      item.code?.toLowerCase().includes(term) ||
      item.key?.toLowerCase().includes(term) ||
      item.category?.toLowerCase().includes(term)
    );
  };

  if (summaryLoading) {
    return (
      <div className="flex items-center justify-center h-96" data-testid="loading-dynamic-control">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="page-dynamic-control">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="title-dynamic-control">
            <Sliders className="h-6 w-6 text-primary" />
            Dynamic Control Center
          </h1>
          <p className="text-muted-foreground">
            100% Dynamic Configuration - Zero Hardcoded Values
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            className={`${getDynamicLevelColor(summary?.summary.dynamicLevel || 'high-code')} px-3 py-1`}
            data-testid="badge-dynamic-level"
          >
            {summary?.summary.dynamicLevel === 'zero-code' ? 'ZERO-CODE' : 
             summary?.summary.dynamicLevel === 'low-code' ? 'LOW-CODE' : 'HIGH-CODE'}
          </Badge>
          <Button variant="outline" size="sm" onClick={refreshAll} data-testid="button-refresh-all">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full" data-testid="tabs-dynamic-control">
          <TabsTrigger value="summary" data-testid="tab-summary">
            <LayoutGrid className="h-4 w-4 mr-2" />
            Summary
          </TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="features" data-testid="tab-features">
            <Zap className="h-4 w-4 mr-2" />
            Features
          </TabsTrigger>
          <TabsTrigger value="pages" data-testid="tab-pages">
            <Globe className="h-4 w-4 mr-2" />
            Pages
          </TabsTrigger>
          <TabsTrigger value="components" data-testid="tab-components">
            <Component className="h-4 w-4 mr-2" />
            Components
          </TabsTrigger>
          <TabsTrigger value="workflows" data-testid="tab-workflows">
            <Workflow className="h-4 w-4 mr-2" />
            Workflows
          </TabsTrigger>
        </TabsList>

        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search configurations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-configs"
            />
          </div>
        </div>

        <TabsContent value="summary" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card data-testid="card-dynamic-score">
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                <CardTitle className="text-sm font-medium">Dynamic Score</CardTitle>
                <Zap className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.summary.dynamicScore || 0}%</div>
                <Progress value={summary?.summary.dynamicScore || 0} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Target: 100% Zero-Code
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-features-count">
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                <CardTitle className="text-sm font-medium">Features</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary?.summary.enabledFeatures || 0}/{summary?.summary.totalFeatures || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active features
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-pages-count">
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                <CardTitle className="text-sm font-medium">Pages</CardTitle>
                <Globe className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary?.summary.enabledPages || 0}/{summary?.summary.totalPages || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Visible pages
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-workflows-count">
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                <CardTitle className="text-sm font-medium">Workflows</CardTitle>
                <Workflow className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary?.summary.enabledWorkflows || 0}/{summary?.summary.totalWorkflows || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active automations
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card data-testid="card-categories-overview">
              <CardHeader>
                <CardTitle className="text-lg">Configuration Categories</CardTitle>
                <CardDescription>All dynamic configuration areas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span>Platform Settings</span>
                  </div>
                  <Badge variant="secondary">{summary?.summary.totalSettings || 0}</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    <span>Feature Flags</span>
                  </div>
                  <Badge variant="secondary">{summary?.summary.totalFeatures || 0}</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Component className="h-4 w-4 text-muted-foreground" />
                    <span>UI Components</span>
                  </div>
                  <Badge variant="secondary">{summary?.summary.totalComponents || 0}</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>API Endpoints</span>
                  </div>
                  <Badge variant="secondary">{summary?.summary.totalEndpoints || 0}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-dynamic-principles">
              <CardHeader>
                <CardTitle className="text-lg">Zero-Code Principles</CardTitle>
                <CardDescription>100% dynamic configuration rules</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">No Hardcoded Values</p>
                    <p className="text-sm text-muted-foreground">All settings stored in database</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Owner Control</p>
                    <p className="text-sm text-muted-foreground">Change everything from dashboard</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Real-time Updates</p>
                    <p className="text-sm text-muted-foreground">Changes apply immediately</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Audit Trail</p>
                    <p className="text-sm text-muted-foreground">All changes logged with history</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>Configure all platform-wide settings dynamically</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {Object.entries(
                    filterItems(settings)?.reduce((acc: Record<string, any[]>, setting) => {
                      const cat = setting.category || 'general';
                      if (!acc[cat]) acc[cat] = [];
                      acc[cat].push(setting);
                      return acc;
                    }, {}) || {}
                  ).map(([category, categorySettings]) => (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center gap-2 py-2">
                        {getCategoryIcon(category)}
                        <h3 className="font-semibold capitalize">{category}</h3>
                        <Badge variant="outline" className="ml-auto">{(categorySettings as any[]).length}</Badge>
                      </div>
                      <div className="grid gap-3">
                        {(categorySettings as any[]).map((setting) => (
                          <div 
                            key={setting.id} 
                            className="flex items-center justify-between p-3 rounded-lg border bg-card"
                            data-testid={`setting-${setting.key}`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{setting.name}</span>
                                {setting.is_system_locked && (
                                  <Lock className="h-3 w-3 text-muted-foreground" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {setting.description}
                              </p>
                              <code className="text-xs text-muted-foreground">{setting.key}</code>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              {setting.value_type === 'boolean' ? (
                                <Switch
                                  checked={setting.value === 'true'}
                                  disabled={setting.is_system_locked}
                                  onCheckedChange={(checked) => {
                                    updateSettingMutation.mutate({ id: setting.id, value: String(checked) });
                                  }}
                                />
                              ) : (
                                <Input
                                  type={setting.value_type === 'number' ? 'number' : 'text'}
                                  value={setting.value}
                                  disabled={setting.is_system_locked}
                                  className="w-48"
                                  onChange={(e) => {
                                    updateSettingMutation.mutate({ id: setting.id, value: e.target.value });
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <Separator className="my-4" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Flags</CardTitle>
              <CardDescription>Enable or disable platform features dynamically</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {Object.entries(
                    filterItems(features)?.reduce((acc: Record<string, any[]>, feature) => {
                      const cat = feature.category || 'general';
                      if (!acc[cat]) acc[cat] = [];
                      acc[cat].push(feature);
                      return acc;
                    }, {}) || {}
                  ).map(([category, categoryFeatures]) => (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center gap-2 py-2">
                        {getCategoryIcon(category)}
                        <h3 className="font-semibold capitalize">{category}</h3>
                        <Badge variant="outline" className="ml-auto">{(categoryFeatures as any[]).length}</Badge>
                      </div>
                      <div className="grid gap-3">
                        {(categoryFeatures as any[]).map((feature) => (
                          <div 
                            key={feature.id} 
                            className="flex items-center justify-between p-3 rounded-lg border bg-card"
                            data-testid={`feature-${feature.code}`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium">{feature.name}</span>
                                {feature.is_beta && (
                                  <Badge variant="secondary" className="text-xs">BETA</Badge>
                                )}
                                {feature.is_owner_only && (
                                  <Badge variant="outline" className="text-xs">
                                    <Crown className="h-3 w-3 mr-1" />
                                    Owner
                                  </Badge>
                                )}
                                {feature.rollout_percentage < 100 && (
                                  <Badge variant="outline" className="text-xs">
                                    {feature.rollout_percentage}% Rollout
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {feature.description}
                              </p>
                            </div>
                            <Switch
                              checked={feature.is_enabled}
                              onCheckedChange={(checked) => {
                                toggleFeatureMutation.mutate({ code: feature.code, isEnabled: checked });
                              }}
                              data-testid={`switch-feature-${feature.code}`}
                            />
                          </div>
                        ))}
                      </div>
                      <Separator className="my-4" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Page Configuration</CardTitle>
              <CardDescription>Control page visibility and access</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {Object.entries(
                    filterItems(pages)?.reduce((acc: Record<string, any[]>, page) => {
                      const cat = page.category || 'general';
                      if (!acc[cat]) acc[cat] = [];
                      acc[cat].push(page);
                      return acc;
                    }, {}) || {}
                  ).map(([category, categoryPages]) => (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center gap-2 py-2">
                        {getCategoryIcon(category)}
                        <h3 className="font-semibold capitalize">{category}</h3>
                        <Badge variant="outline" className="ml-auto">{(categoryPages as any[]).length}</Badge>
                      </div>
                      <div className="grid gap-3">
                        {(categoryPages as any[]).map((page) => (
                          <div 
                            key={page.id} 
                            className="flex items-center justify-between p-3 rounded-lg border bg-card"
                            data-testid={`page-${page.pathname.replace(/\//g, '-')}`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium">{page.name}</span>
                                {page.is_owner_only && (
                                  <Badge variant="outline" className="text-xs">
                                    <Crown className="h-3 w-3 mr-1" />
                                    Owner
                                  </Badge>
                                )}
                                {page.is_sovereign_only && (
                                  <Badge variant="outline" className="text-xs">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Sovereign
                                  </Badge>
                                )}
                                <Badge variant="secondary" className="text-xs">
                                  {page.dynamic_score}% Dynamic
                                </Badge>
                              </div>
                              <code className="text-sm text-muted-foreground">{page.pathname}</code>
                            </div>
                            <div className="flex items-center gap-2">
                              {page.is_enabled ? (
                                <Eye className="h-4 w-4 text-green-500" />
                              ) : (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              )}
                              <Switch
                                checked={page.is_enabled}
                                onCheckedChange={(checked) => {
                                  togglePageMutation.mutate({ pathname: page.pathname, isEnabled: checked });
                                }}
                                data-testid={`switch-page-${page.pathname.replace(/\//g, '-')}`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <Separator className="my-4" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>UI Components</CardTitle>
              <CardDescription>Configure dashboard components dynamically</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="grid gap-3">
                  {filterItems(components)?.map((component) => (
                    <div 
                      key={component.id} 
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                      data-testid={`component-${component.code}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{component.name}</span>
                          <Badge variant="secondary" className="text-xs">{component.type}</Badge>
                          <Badge variant="outline" className="text-xs">{component.category}</Badge>
                          {component.is_owner_only && (
                            <Badge variant="outline" className="text-xs">
                              <Crown className="h-3 w-3 mr-1" />
                              Owner
                            </Badge>
                          )}
                        </div>
                        {component.data_source && (
                          <code className="text-sm text-muted-foreground">{component.data_source}</code>
                        )}
                        {component.refresh_interval > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Refreshes every {component.refresh_interval}s
                          </p>
                        )}
                      </div>
                      <Switch
                        checked={component.is_enabled}
                        onCheckedChange={(checked) => {
                          toggleComponentMutation.mutate({ code: component.code, isEnabled: checked });
                        }}
                        data-testid={`switch-component-${component.code}`}
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automated Workflows</CardTitle>
              <CardDescription>Configure automation pipelines dynamically</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {Object.entries(
                    filterItems(workflows)?.reduce((acc: Record<string, any[]>, workflow) => {
                      const cat = workflow.category || 'general';
                      if (!acc[cat]) acc[cat] = [];
                      acc[cat].push(workflow);
                      return acc;
                    }, {}) || {}
                  ).map(([category, categoryWorkflows]) => (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center gap-2 py-2">
                        {getCategoryIcon(category)}
                        <h3 className="font-semibold capitalize">{category}</h3>
                        <Badge variant="outline" className="ml-auto">{(categoryWorkflows as any[]).length}</Badge>
                      </div>
                      <div className="grid gap-3">
                        {(categoryWorkflows as any[]).map((workflow) => (
                          <div 
                            key={workflow.id} 
                            className="flex items-center justify-between p-3 rounded-lg border bg-card"
                            data-testid={`workflow-${workflow.code}`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium">{workflow.name}</span>
                                <Badge variant="secondary" className="text-xs">{workflow.trigger}</Badge>
                                {workflow.is_autonomous && (
                                  <Badge variant="outline" className="text-xs">
                                    <Cpu className="h-3 w-3 mr-1" />
                                    Autonomous
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {workflow.description}
                              </p>
                              {workflow.steps && (
                                <p className="text-xs text-muted-foreground">
                                  {(Array.isArray(workflow.steps) ? workflow.steps : JSON.parse(String(workflow.steps) || '[]')).length} steps
                                </p>
                              )}
                            </div>
                            <Switch
                              checked={workflow.is_enabled}
                              onCheckedChange={(checked) => {
                                toggleWorkflowMutation.mutate({ code: workflow.code, isEnabled: checked });
                              }}
                              data-testid={`switch-workflow-${workflow.code}`}
                            />
                          </div>
                        ))}
                      </div>
                      <Separator className="my-4" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
