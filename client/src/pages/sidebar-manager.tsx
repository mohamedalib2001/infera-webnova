import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  GripVertical,
  Eye,
  EyeOff,
  RotateCcw,
  Save,
  Settings,
  Layout,
  Users,
  Crown,
  Loader2,
  Search,
  Filter,
  X,
} from "lucide-react";

interface PageVisibility {
  pageId: string;
  path: string;
  name: string;
  nameAr: string;
  category: string;
  icon: string;
  isVisible: boolean;
  order: number;
  requiredRole?: string;
}

interface SidebarConfig {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  pages: PageVisibility[];
  createdAt: string;
  updatedAt: string;
}

const t = {
  ar: {
    title: "إدارة الشريط الجانبي",
    subtitle: "تحكم في الصفحات المعروضة للمستخدمين",
    pages: "الصفحات",
    configs: "التكوينات",
    users: "المستخدمين",
    visible: "مرئي",
    hidden: "مخفي",
    order: "الترتيب",
    category: "الفئة",
    role: "الدور المطلوب",
    resetToDefault: "إعادة للافتراضي",
    saveChanges: "حفظ التغييرات",
    search: "بحث...",
    all: "الكل",
    core: "أساسي",
    development: "تطوير",
    ai: "ذكاء اصطناعي",
    deployment: "نشر",
    management: "إدارة",
    growth: "نمو",
    owner: "مالك",
    security: "أمان",
    extensions: "إضافات",
    team: "فريق",
    builder: "منشئ",
    dragToReorder: "اسحب لإعادة الترتيب",
    pageUpdated: "تم تحديث الصفحة",
    configReset: "تم إعادة التكوين للافتراضي",
    changesSaved: "تم حفظ التغييرات",
    visibleToAll: "مرئي للجميع",
    hiddenFromUsers: "مخفي عن المستخدمين",
    defaultConfig: "التكوين الافتراضي",
    customConfig: "تكوين مخصص",
    createConfig: "إنشاء تكوين",
    configName: "اسم التكوين",
    configDescription: "وصف التكوين",
    noResults: "لا توجد نتائج",
  },
  en: {
    title: "Sidebar Manager",
    subtitle: "Control which pages are shown to users",
    pages: "Pages",
    configs: "Configurations",
    users: "Users",
    visible: "Visible",
    hidden: "Hidden",
    order: "Order",
    category: "Category",
    role: "Required Role",
    resetToDefault: "Reset to Default",
    saveChanges: "Save Changes",
    search: "Search...",
    all: "All",
    core: "Core",
    development: "Development",
    ai: "AI",
    deployment: "Deployment",
    management: "Management",
    growth: "Growth",
    owner: "Owner",
    security: "Security",
    extensions: "Extensions",
    team: "Team",
    builder: "Builder",
    dragToReorder: "Drag to reorder",
    pageUpdated: "Page updated",
    configReset: "Configuration reset to default",
    changesSaved: "Changes saved",
    visibleToAll: "Visible to all",
    hiddenFromUsers: "Hidden from users",
    defaultConfig: "Default Configuration",
    customConfig: "Custom Configuration",
    createConfig: "Create Configuration",
    configName: "Configuration Name",
    configDescription: "Configuration Description",
    noResults: "No results found",
  },
};

export default function SidebarManager() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const txt = t[language];
  
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [localPages, setLocalPages] = useState<PageVisibility[]>([]);
  const [editingConfig, setEditingConfig] = useState<SidebarConfig | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const { data: config, isLoading } = useQuery<SidebarConfig>({
    queryKey: ['/api/platform/sidebar/config'],
  });

  const { data: allConfigs } = useQuery<{ configs: SidebarConfig[] }>({
    queryKey: ['/api/platform/sidebar/configs'],
  });

  useEffect(() => {
    if (config?.pages) {
      setLocalPages(config.pages);
    }
  }, [config?.pages]);

  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ pageId, isVisible }: { pageId: string; isVisible: boolean }) => {
      return apiRequest('PATCH', '/api/platform/sidebar/page-visibility', {
        configId: config?.id || 'default',
        pageId,
        isVisible,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/platform/sidebar/config'] });
      toast({ title: txt.pageUpdated });
    },
    onError: (error: any) => {
      toast({ title: language === 'ar' ? "خطأ" : "Error", description: error.message, variant: "destructive" });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (pageIds: string[]) => {
      return apiRequest('POST', '/api/platform/sidebar/reorder', { 
        configId: config?.id || 'default',
        pageIds 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/platform/sidebar/config'] });
      toast({ title: txt.changesSaved });
    },
    onError: (error: any) => {
      toast({ title: language === 'ar' ? "خطأ" : "Error", description: error.message, variant: "destructive" });
    },
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/platform/sidebar/reset', { 
        configId: config?.id || 'default' 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/platform/sidebar/config'] });
      toast({ title: txt.configReset });
    },
    onError: (error: any) => {
      toast({ title: language === 'ar' ? "خطأ" : "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: async ({ configId, name, description }: { configId: string; name: string; description: string }) => {
      return apiRequest('PATCH', `/api/platform/sidebar/config/${configId}`, {
        name,
        description,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/platform/sidebar/configs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/platform/sidebar/config'] });
      toast({ title: txt.changesSaved });
      setEditingConfig(null);
    },
    onError: (error: any) => {
      toast({ title: language === 'ar' ? "خطأ" : "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleEditConfig = (cfg: SidebarConfig) => {
    setEditingConfig(cfg);
    setEditName(cfg.name);
    setEditDescription(cfg.description);
  };

  const handleSaveConfig = () => {
    if (editingConfig) {
      updateConfigMutation.mutate({
        configId: editingConfig.id,
        name: editName,
        description: editDescription,
      });
    }
  };

  const pages = config?.pages || [];
  
  const filteredPages = pages.filter(page => {
    const matchesSearch = page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         page.nameAr.includes(searchQuery) ||
                         page.path.includes(searchQuery);
    const matchesCategory = categoryFilter === 'all' || page.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => a.order - b.order);

  const categories = ['all', 'core', 'development', 'ai', 'deployment', 'management', 'growth', 'owner', 'security', 'extensions', 'team', 'builder'];

  const getCategoryLabel = (cat: string) => {
    return txt[cat as keyof typeof txt] || cat;
  };

  const handleToggleVisibility = (pageId: string, currentVisible: boolean) => {
    toggleVisibilityMutation.mutate({ pageId, isVisible: !currentVisible });
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const newPages = [...filteredPages];
    [newPages[index - 1], newPages[index]] = [newPages[index], newPages[index - 1]];
    reorderMutation.mutate(newPages.map(p => p.pageId));
  };

  const handleMoveDown = (index: number) => {
    if (index >= filteredPages.length - 1) return;
    const newPages = [...filteredPages];
    [newPages[index], newPages[index + 1]] = [newPages[index + 1], newPages[index]];
    reorderMutation.mutate(newPages.map(p => p.pageId));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 md:p-6 gap-6 overflow-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-title">
            <Layout className="h-6 w-6" />
            {txt.title}
          </h1>
          <p className="text-muted-foreground">{txt.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => resetMutation.mutate()}
            disabled={resetMutation.isPending}
            data-testid="button-reset"
          >
            {resetMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
            <span className="hidden sm:inline ml-2">{txt.resetToDefault}</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="pages" className="flex-1">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="pages" className="gap-2" data-testid="tab-pages">
            <Layout className="h-4 w-4" />
            {txt.pages}
          </TabsTrigger>
          <TabsTrigger value="configs" className="gap-2" data-testid="tab-configs">
            <Settings className="h-4 w-4" />
            {txt.configs}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="mt-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={txt.search}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                    data-testid="input-search"
                  />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                  <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  {categories.map(cat => (
                    <Badge
                      key={cat}
                      variant={categoryFilter === cat ? "default" : "outline"}
                      className="cursor-pointer whitespace-nowrap"
                      onClick={() => setCategoryFilter(cat)}
                      data-testid={`filter-${cat}`}
                    >
                      {getCategoryLabel(cat)}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {filteredPages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {txt.noResults}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredPages.map((page, index) => (
                      <div
                        key={page.pageId}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-card hover-elevate transition-all"
                        data-testid={`page-row-${page.pageId}`}
                      >
                        <div className="cursor-move text-muted-foreground">
                          <GripVertical className="h-5 w-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">
                              {language === 'ar' ? page.nameAr : page.name}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {getCategoryLabel(page.category)}
                            </Badge>
                            {page.requiredRole && (
                              <Badge variant="secondary" className="text-xs gap-1">
                                <Crown className="h-3 w-3" />
                                {page.requiredRole}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {page.path}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground hidden sm:inline">
                              #{page.order + 1}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {page.isVisible ? (
                              <Eye className="h-4 w-4 text-green-500" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            )}
                            <Switch
                              checked={page.isVisible}
                              onCheckedChange={() => handleToggleVisibility(page.pageId, page.isVisible)}
                              disabled={toggleVisibilityMutation.isPending}
                              data-testid={`switch-visibility-${page.pageId}`}
                            />
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

        <TabsContent value="configs" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{txt.configs}</CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'إنشاء وإدارة تكوينات الشريط الجانبي المختلفة'
                  : 'Create and manage different sidebar configurations'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allConfigs?.configs?.map(cfg => (
                  <div
                    key={cfg.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                    data-testid={`config-${cfg.id}`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{cfg.name}</span>
                        {cfg.isDefault && (
                          <Badge variant="secondary">{txt.defaultConfig}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{cfg.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {cfg.pages.length} {txt.pages}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEditConfig(cfg)}
                      data-testid={`button-edit-${cfg.id}`}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!editingConfig} onOpenChange={(open) => !open && setEditingConfig(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {language === 'ar' ? 'تعديل التكوين' : 'Edit Configuration'}
            </DialogTitle>
            <DialogDescription>
              {language === 'ar' 
                ? 'قم بتعديل اسم ووصف التكوين'
                : 'Update the configuration name and description'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="config-name">
                {txt.configName}
              </Label>
              <Input
                id="config-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder={language === 'ar' ? 'اسم التكوين' : 'Configuration name'}
                data-testid="input-config-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="config-description">
                {txt.configDescription}
              </Label>
              <Textarea
                id="config-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder={language === 'ar' ? 'وصف التكوين' : 'Configuration description'}
                rows={3}
                data-testid="input-config-description"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setEditingConfig(null)}
              data-testid="button-cancel-edit"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              onClick={handleSaveConfig}
              disabled={updateConfigMutation.isPending || !editName.trim()}
              data-testid="button-save-config"
            >
              {updateConfigMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span className="mr-2">{txt.saveChanges}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
