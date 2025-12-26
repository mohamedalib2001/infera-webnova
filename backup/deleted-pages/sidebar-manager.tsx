import { useState } from "react";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Eye,
  EyeOff,
  Save,
  Layout,
  Users,
  Crown,
  Loader2,
  Search,
  ChevronDown,
  ChevronRight,
  Settings,
  Shield,
  CreditCard,
  User,
  History,
  RefreshCw,
} from "lucide-react";

interface SidebarPage {
  id: number;
  pageKey: string;
  sectionKey: string;
  nameEn: string;
  nameAr: string;
  icon: string;
  iconColor?: string;
  path: string;
  isVisible: boolean;
  visibleToRoles: string[];
  displayOrder: number;
  requiresAuth: boolean;
  requiresSubscription: boolean;
  badge?: string;
}

interface SidebarSection {
  id: number;
  sectionKey: string;
  nameEn: string;
  nameAr: string;
  icon: string;
  isVisible: boolean;
  visibleToRoles: string[];
  displayOrder: number;
  isCollapsible: boolean;
  defaultExpanded: boolean;
  pages: SidebarPage[];
}

interface SidebarConfig {
  sections: SidebarSection[];
}

const roleLabels = {
  free: { en: "Free", ar: "مجاني", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
  paid: { en: "Paid", ar: "مدفوع", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  owner: { en: "Owner", ar: "مالك", color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" },
  admin: { en: "Admin", ar: "مشرف", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
  all: { en: "All", ar: "الجميع", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
};

const allRoles = ['free', 'paid', 'owner', 'admin'] as const;

export default function SidebarManager() {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [editingRoles, setEditingRoles] = useState<{ type: 'section' | 'page'; key: string; roles: string[] } | null>(null);

  const t = {
    title: language === "ar" ? "إدارة الشريط الجانبي" : "Sidebar Manager",
    subtitle: language === "ar" ? "تحكم في الأقسام والصفحات المعروضة للمستخدمين حسب أدوارهم" : "Control sections and pages visibility by user roles",
    sections: language === "ar" ? "الأقسام" : "Sections",
    pages: language === "ar" ? "الصفحات" : "Pages",
    logs: language === "ar" ? "السجلات" : "Logs",
    visible: language === "ar" ? "مرئي" : "Visible",
    hidden: language === "ar" ? "مخفي" : "Hidden",
    roles: language === "ar" ? "الأدوار" : "Roles",
    search: language === "ar" ? "بحث..." : "Search...",
    refresh: language === "ar" ? "تحديث" : "Refresh",
    save: language === "ar" ? "حفظ" : "Save",
    cancel: language === "ar" ? "إلغاء" : "Cancel",
    editRoles: language === "ar" ? "تعديل الأدوار" : "Edit Roles",
    selectRoles: language === "ar" ? "اختر الأدوار التي يمكنها رؤية هذا العنصر" : "Select roles that can see this item",
    updated: language === "ar" ? "تم التحديث" : "Updated successfully",
    freeSubscriber: language === "ar" ? "مشترك مجاني" : "Free Subscriber",
    paidSubscriber: language === "ar" ? "مشترك مدفوع" : "Paid Subscriber",
    ownerOnly: language === "ar" ? "المالك فقط" : "Owner Only",
    everyone: language === "ar" ? "الجميع" : "Everyone",
    noPages: language === "ar" ? "لا توجد صفحات في هذا القسم" : "No pages in this section",
    loading: language === "ar" ? "جاري التحميل..." : "Loading...",
    toggleSection: language === "ar" ? "إظهار/إخفاء القسم بالكامل" : "Show/hide entire section",
    togglePage: language === "ar" ? "إظهار/إخفاء الصفحة" : "Show/hide page",
    sectionDescription: language === "ar" ? "تحكم في رؤية الأقسام والصفحات للمستخدمين المختلفين" : "Control visibility of sections and pages for different users",
  };

  const { data: config, isLoading, refetch } = useQuery<SidebarConfig>({
    queryKey: ['/api/sidebar/admin/config'],
  });

  const toggleSectionMutation = useMutation({
    mutationFn: async (sectionKey: string) => {
      return apiRequest('POST', `/api/sidebar/section/${sectionKey}/toggle`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sidebar/admin/config'] });
      toast({ title: t.updated });
    },
    onError: (error: any) => {
      toast({ title: language === "ar" ? "خطأ" : "Error", description: error.message, variant: "destructive" });
    },
  });

  const togglePageMutation = useMutation({
    mutationFn: async (pageKey: string) => {
      return apiRequest('POST', `/api/sidebar/page/${pageKey}/toggle`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sidebar/admin/config'] });
      toast({ title: t.updated });
    },
    onError: (error: any) => {
      toast({ title: language === "ar" ? "خطأ" : "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateRolesMutation = useMutation({
    mutationFn: async ({ type, key, roles }: { type: 'section' | 'page'; key: string; roles: string[] }) => {
      const endpoint = type === 'section' 
        ? `/api/sidebar/section/${key}` 
        : `/api/sidebar/page/${key}`;
      return apiRequest('PATCH', endpoint, { visibleToRoles: roles });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sidebar/admin/config'] });
      toast({ title: t.updated });
      setEditingRoles(null);
    },
    onError: (error: any) => {
      toast({ title: language === "ar" ? "خطأ" : "Error", description: error.message, variant: "destructive" });
    },
  });

  const toggleSectionExpand = (sectionKey: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionKey)) {
        next.delete(sectionKey);
      } else {
        next.add(sectionKey);
      }
      return next;
    });
  };

  const getRolesBadges = (roles: string[]) => {
    if (roles.includes('all')) {
      return <Badge className={roleLabels.all.color}>{isRTL ? roleLabels.all.ar : roleLabels.all.en}</Badge>;
    }
    return roles.map(role => (
      <Badge key={role} className={roleLabels[role as keyof typeof roleLabels]?.color || ''}>
        {isRTL ? roleLabels[role as keyof typeof roleLabels]?.ar : roleLabels[role as keyof typeof roleLabels]?.en}
      </Badge>
    ));
  };

  const filteredSections = config?.sections?.filter(section => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    const matchesSection = section.nameEn.toLowerCase().includes(searchLower) || 
                          section.nameAr.includes(searchQuery);
    const matchesPages = section.pages?.some(page => 
      page.nameEn.toLowerCase().includes(searchLower) || 
      page.nameAr.includes(searchQuery) ||
      page.path.includes(searchQuery)
    );
    return matchesSection || matchesPages;
  }) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full p-4 md:p-6 gap-6 overflow-auto ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-title">
            <Layout className="h-6 w-6" />
            {t.title}
          </h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <Button variant="outline" onClick={() => refetch()} data-testid="button-refresh">
          <RefreshCw className="h-4 w-4 me-2" />
          {t.refresh}
        </Button>
      </div>

      {/* Role Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium">{t.roles}:</span>
            <div className="flex items-center gap-1">
              <User className="w-4 h-4 text-gray-500" />
              <Badge className={roleLabels.free.color}>{isRTL ? t.freeSubscriber : "Free"}</Badge>
            </div>
            <div className="flex items-center gap-1">
              <CreditCard className="w-4 h-4 text-blue-500" />
              <Badge className={roleLabels.paid.color}>{isRTL ? t.paidSubscriber : "Paid"}</Badge>
            </div>
            <div className="flex items-center gap-1">
              <Crown className="w-4 h-4 text-amber-500" />
              <Badge className={roleLabels.owner.color}>{isRTL ? roleLabels.owner.ar : "Owner"}</Badge>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-purple-500" />
              <Badge className={roleLabels.admin.color}>{isRTL ? roleLabels.admin.ar : "Admin"}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t.search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="ps-10"
          data-testid="input-search"
        />
      </div>

      {/* Sections List */}
      <div className="space-y-4">
        {filteredSections.map(section => (
          <Card key={section.sectionKey} data-testid={`section-${section.sectionKey}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleSectionExpand(section.sectionKey)}
                    data-testid={`button-expand-${section.sectionKey}`}
                  >
                    {expandedSections.has(section.sectionKey) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {isRTL ? section.nameAr : section.nameEn}
                      {!section.isVisible && (
                        <Badge variant="secondary">
                          <EyeOff className="w-3 h-3 me-1" />
                          {t.hidden}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      {section.pages?.length || 0} {t.pages}
                    </CardDescription>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Roles */}
                  <div className="flex items-center gap-1">
                    {getRolesBadges(section.visibleToRoles as string[])}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setEditingRoles({ 
                        type: 'section', 
                        key: section.sectionKey, 
                        roles: section.visibleToRoles as string[] 
                      })}
                      data-testid={`button-edit-roles-${section.sectionKey}`}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Visibility Toggle */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{t.visible}</span>
                    <Switch
                      checked={section.isVisible}
                      onCheckedChange={() => toggleSectionMutation.mutate(section.sectionKey)}
                      disabled={toggleSectionMutation.isPending}
                      data-testid={`switch-section-${section.sectionKey}`}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>

            {expandedSections.has(section.sectionKey) && (
              <CardContent>
                <div className="border-t pt-4 space-y-2">
                  {section.pages?.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">{t.noPages}</p>
                  ) : (
                    section.pages?.map(page => (
                      <div 
                        key={page.pageKey} 
                        className={`flex items-center justify-between gap-4 p-3 rounded-md border ${!page.isVisible ? 'opacity-60 bg-muted/50' : ''}`}
                        data-testid={`page-${page.pageKey}`}
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {isRTL ? page.nameAr : page.nameEn}
                              {page.badge && (
                                <Badge variant="secondary" className="text-xs">{page.badge}</Badge>
                              )}
                            </div>
                            <code className="text-xs text-muted-foreground">{page.path}</code>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                          {/* Roles */}
                          <div className="flex items-center gap-1">
                            {getRolesBadges(page.visibleToRoles as string[])}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setEditingRoles({ 
                                type: 'page', 
                                key: page.pageKey, 
                                roles: page.visibleToRoles as string[] 
                              })}
                              data-testid={`button-edit-roles-${page.pageKey}`}
                            >
                              <Settings className="w-3 h-3" />
                            </Button>
                          </div>

                          {/* Visibility Toggle */}
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={page.isVisible}
                              onCheckedChange={() => togglePageMutation.mutate(page.pageKey)}
                              disabled={togglePageMutation.isPending}
                              data-testid={`switch-page-${page.pageKey}`}
                            />
                            {page.isVisible ? (
                              <Eye className="w-4 h-4 text-green-500" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Edit Roles Dialog */}
      <Dialog open={!!editingRoles} onOpenChange={() => setEditingRoles(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.editRoles}</DialogTitle>
            <DialogDescription>{t.selectRoles}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {allRoles.map(role => (
              <div key={role} className="flex items-center gap-3">
                <Checkbox
                  id={`role-${role}`}
                  checked={editingRoles?.roles.includes(role) || editingRoles?.roles.includes('all')}
                  onCheckedChange={(checked) => {
                    if (!editingRoles) return;
                    let newRoles = [...editingRoles.roles];
                    if (checked) {
                      if (!newRoles.includes(role)) {
                        newRoles.push(role);
                      }
                      newRoles = newRoles.filter(r => r !== 'all');
                    } else {
                      newRoles = newRoles.filter(r => r !== role);
                    }
                    setEditingRoles({ ...editingRoles, roles: newRoles });
                  }}
                  data-testid={`checkbox-role-${role}`}
                />
                <Label htmlFor={`role-${role}`} className="flex items-center gap-2">
                  <Badge className={roleLabels[role].color}>
                    {isRTL ? roleLabels[role].ar : roleLabels[role].en}
                  </Badge>
                </Label>
              </div>
            ))}
            <div className="flex items-center gap-3 pt-2 border-t">
              <Checkbox
                id="role-all"
                checked={editingRoles?.roles.includes('all')}
                onCheckedChange={(checked) => {
                  if (!editingRoles) return;
                  if (checked) {
                    setEditingRoles({ ...editingRoles, roles: ['all'] });
                  } else {
                    setEditingRoles({ ...editingRoles, roles: [] });
                  }
                }}
                data-testid="checkbox-role-all"
              />
              <Label htmlFor="role-all" className="flex items-center gap-2">
                <Badge className={roleLabels.all.color}>
                  {isRTL ? roleLabels.all.ar : roleLabels.all.en}
                </Badge>
                <span className="text-sm text-muted-foreground">({t.everyone})</span>
              </Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditingRoles(null)} data-testid="button-cancel-roles">
              {t.cancel}
            </Button>
            <Button 
              onClick={() => {
                if (editingRoles) {
                  updateRolesMutation.mutate({
                    type: editingRoles.type,
                    key: editingRoles.key,
                    roles: editingRoles.roles.length === 0 ? ['all'] : editingRoles.roles,
                  });
                }
              }}
              disabled={updateRolesMutation.isPending}
              data-testid="button-save-roles"
            >
              {updateRolesMutation.isPending && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
              {t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
