/**
 * Nova Permissions Management - إدارة صلاحيات نوفا
 * 
 * Comprehensive interface for managing Nova AI capabilities and permissions.
 * Features: Categories, search, filtering, bulk actions, and toggle switches.
 */

import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX,
  Filter,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Zap,
  Database,
  Code,
  Cloud,
  Brain,
  Settings,
  Lock,
  Unlock,
  FileCode,
  Server,
  Activity,
  GitBranch,
  Upload,
  Users,
  Key,
  Cpu,
  HardDrive,
  Wifi,
  Bell,
  RefreshCw,
  Package,
  Globe,
  CreditCard,
  Mail,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Permission {
  id?: number;
  code: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  category: string;
  securityLevel: 'high' | 'medium' | 'low' | 'danger';
  defaultEnabled: boolean;
  isGranted?: boolean;
}

interface PermissionsResponse {
  success: boolean;
  permissions: Permission[];
  grouped: Record<string, Permission[]>;
  categories: string[];
}

const CATEGORY_INFO: Record<string, { icon: any; labelEn: string; labelAr: string; color: string }> = {
  code_execution: { icon: Code, labelEn: 'Code Execution', labelAr: 'تنفيذ الكود', color: 'bg-blue-500' },
  file_operations: { icon: FileCode, labelEn: 'File Operations', labelAr: 'عمليات الملفات', color: 'bg-green-500' },
  database_operations: { icon: Database, labelEn: 'Database Operations', labelAr: 'عمليات قاعدة البيانات', color: 'bg-purple-500' },
  api_integrations: { icon: Globe, labelEn: 'API Integrations', labelAr: 'تكامل API', color: 'bg-cyan-500' },
  deployment: { icon: Cloud, labelEn: 'Deployment', labelAr: 'النشر', color: 'bg-orange-500' },
  ai_capabilities: { icon: Brain, labelEn: 'AI Capabilities', labelAr: 'قدرات الذكاء الاصطناعي', color: 'bg-pink-500' },
  ai_advanced: { icon: Zap, labelEn: 'Advanced AI', labelAr: 'الذكاء الاصطناعي المتقدم', color: 'bg-violet-500' },
  infrastructure: { icon: Server, labelEn: 'Infrastructure', labelAr: 'البنية التحتية', color: 'bg-red-500' },
  payment_billing: { icon: CreditCard, labelEn: 'Payment & Billing', labelAr: 'المدفوعات والفوترة', color: 'bg-emerald-500' },
  user_management: { icon: Users, labelEn: 'User Management', labelAr: 'إدارة المستخدمين', color: 'bg-amber-500' },
  system_config: { icon: Settings, labelEn: 'System Config', labelAr: 'إعدادات النظام', color: 'bg-slate-500' },
  navigation_access: { icon: Eye, labelEn: 'Navigation & Access', labelAr: 'التنقل والوصول', color: 'bg-indigo-500' },
  build_operations: { icon: Package, labelEn: 'Build Operations', labelAr: 'عمليات البناء', color: 'bg-teal-500' },
  blueprint_compiler: { icon: FileCode, labelEn: 'Blueprint Compiler', labelAr: 'مترجم المخططات', color: 'bg-fuchsia-500' },
  external_deployment: { icon: Cloud, labelEn: 'External Deployment', labelAr: 'النشر الخارجي', color: 'bg-rose-500' },
  monitoring: { icon: Activity, labelEn: 'Monitoring', labelAr: 'المراقبة', color: 'bg-sky-500' },
  version_control: { icon: GitBranch, labelEn: 'Version Control', labelAr: 'إدارة الإصدارات', color: 'bg-lime-500' },
  import_export: { icon: Upload, labelEn: 'Import & Export', labelAr: 'الاستيراد والتصدير', color: 'bg-yellow-500' },
  governance: { icon: Shield, labelEn: 'Governance', labelAr: 'الحوكمة', color: 'bg-stone-500' },
  integrations: { icon: Zap, labelEn: 'Integrations', labelAr: 'التكاملات', color: 'bg-cyan-600' },
  session_management: { icon: Lock, labelEn: 'Session Management', labelAr: 'إدارة الجلسات', color: 'bg-red-600' },
  system_control: { icon: Cpu, labelEn: 'System Control', labelAr: 'التحكم في النظام', color: 'bg-gray-600' },
};

const SECURITY_LEVELS = {
  high: { icon: ShieldCheck, color: 'text-green-500 bg-green-500/10', label: 'High', labelAr: 'عالي' },
  medium: { icon: Shield, color: 'text-blue-500 bg-blue-500/10', label: 'Medium', labelAr: 'متوسط' },
  low: { icon: ShieldAlert, color: 'text-yellow-500 bg-yellow-500/10', label: 'Low', labelAr: 'منخفض' },
  danger: { icon: ShieldX, color: 'text-red-500 bg-red-500/10', label: 'Danger', labelAr: 'خطير' },
};

const ITEMS_PER_PAGE = 20;

export default function NovaPermissions() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [securityFilter, setSecurityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showEnabled, setShowEnabled] = useState<'all' | 'enabled' | 'disabled'>('all');

  // Fetch permissions
  const { data: permissionsData, isLoading, error } = useQuery<PermissionsResponse>({
    queryKey: ['/api/nova/permissions'],
  });

  // Toggle permission mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ code, enabled }: { code: string; enabled: boolean }) => {
      const endpoint = enabled 
        ? '/api/nova/permissions/grant' 
        : '/api/nova/permissions/revoke';
      return apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify({ permissionCode: code }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/nova/permissions'] });
      toast({
        title: 'Permission Updated',
        description: 'Permission status has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update permission',
        variant: 'destructive',
      });
    },
  });

  // Enable all permissions
  const enableAllMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/nova/permissions/preset/full_access', { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/nova/permissions'] });
      toast({ title: 'All Permissions Enabled', description: 'All permissions have been activated.' });
    },
  });

  // Disable all permissions
  const disableAllMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/nova/permissions/preset/restrictive', { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/nova/permissions'] });
      toast({ title: 'Permissions Restricted', description: 'Permissions have been set to restrictive mode.' });
    },
  });

  // Filter and search permissions
  const filteredPermissions = useMemo(() => {
    if (!permissionsData?.permissions) return [];

    let result = [...permissionsData.permissions];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.code.toLowerCase().includes(query) ||
        p.nameEn.toLowerCase().includes(query) ||
        p.nameAr.includes(query) ||
        p.descriptionEn.toLowerCase().includes(query) ||
        p.descriptionAr.includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Security level filter
    if (securityFilter !== 'all') {
      result = result.filter(p => p.securityLevel === securityFilter);
    }

    // Enabled/Disabled filter
    if (showEnabled === 'enabled') {
      result = result.filter(p => p.defaultEnabled || p.isGranted);
    } else if (showEnabled === 'disabled') {
      result = result.filter(p => !p.defaultEnabled && !p.isGranted);
    }

    return result;
  }, [permissionsData, searchQuery, selectedCategory, securityFilter, showEnabled]);

  // Pagination
  const totalPages = Math.ceil(filteredPermissions.length / ITEMS_PER_PAGE);
  const paginatedPermissions = filteredPermissions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Stats
  const stats = useMemo(() => {
    if (!permissionsData?.permissions) return { total: 0, enabled: 0, disabled: 0, categories: 0 };
    const perms = permissionsData.permissions;
    return {
      total: perms.length,
      enabled: perms.filter(p => p.defaultEnabled || p.isGranted).length,
      disabled: perms.filter(p => !p.defaultEnabled && !p.isGranted).length,
      categories: permissionsData.categories?.length || 0,
    };
  }, [permissionsData]);

  const categories = permissionsData?.categories || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="p-6">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-center text-muted-foreground">Failed to load permissions</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 gap-4" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6" />
            صلاحيات وقدرات Nova
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            إدارة كافة صلاحيات وقدرات الذكاء الاصطناعي
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => enableAllMutation.mutate()}
            disabled={enableAllMutation.isPending}
            data-testid="button-enable-all"
          >
            <Check className="w-4 h-4 ml-1" />
            تفعيل الكل
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => disableAllMutation.mutate()}
            disabled={disableAllMutation.isPending}
            data-testid="button-disable-all"
          >
            <X className="w-4 h-4 ml-1" />
            تقييد الكل
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-primary/10">
              <Key className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">إجمالي الصلاحيات</p>
              <p className="text-xl font-bold" data-testid="text-total-permissions">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-green-500/10">
              <Unlock className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">مفعلة</p>
              <p className="text-xl font-bold text-green-500" data-testid="text-enabled-permissions">{stats.enabled}</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-red-500/10">
              <Lock className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">معطلة</p>
              <p className="text-xl font-bold text-red-500" data-testid="text-disabled-permissions">{stats.disabled}</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-blue-500/10">
              <Package className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">الفئات</p>
              <p className="text-xl font-bold text-blue-500" data-testid="text-categories-count">{stats.categories}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="البحث في الصلاحيات..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pr-10"
              data-testid="input-search-permissions"
            />
          </div>

          {/* Security Filter */}
          <select
            value={securityFilter}
            onChange={(e) => {
              setSecurityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-9 rounded-md border bg-background px-3 text-sm"
            data-testid="select-security-filter"
          >
            <option value="all">كل المستويات</option>
            <option value="high">عالي الأمان</option>
            <option value="medium">متوسط الأمان</option>
            <option value="low">منخفض الأمان</option>
            <option value="danger">خطير</option>
          </select>

          {/* Status Filter */}
          <select
            value={showEnabled}
            onChange={(e) => {
              setShowEnabled(e.target.value as any);
              setCurrentPage(1);
            }}
            className="h-9 rounded-md border bg-background px-3 text-sm"
            data-testid="select-status-filter"
          >
            <option value="all">الكل</option>
            <option value="enabled">مفعلة فقط</option>
            <option value="disabled">معطلة فقط</option>
          </select>
        </div>
      </Card>

      {/* Main Content with Categories */}
      <div className="flex-1 overflow-hidden">
        <Tabs 
          value={selectedCategory} 
          onValueChange={(v) => {
            setSelectedCategory(v);
            setCurrentPage(1);
          }}
          className="h-full flex flex-col"
        >
          {/* Category Tabs */}
          <ScrollArea className="w-full" orientation="horizontal">
            <TabsList className="w-max h-auto p-1 flex-wrap gap-1">
              <TabsTrigger value="all" className="text-xs" data-testid="tab-all">
                الكل ({permissionsData?.permissions?.length || 0})
              </TabsTrigger>
              {categories.map((cat) => {
                const info = CATEGORY_INFO[cat] || { icon: Settings, labelAr: cat, color: 'bg-gray-500' };
                const Icon = info.icon;
                const count = permissionsData?.grouped?.[cat]?.length || 0;
                return (
                  <TabsTrigger 
                    key={cat} 
                    value={cat} 
                    className="text-xs gap-1"
                    data-testid={`tab-${cat}`}
                  >
                    <Icon className="w-3 h-3" />
                    {info.labelAr} ({count})
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </ScrollArea>

          {/* Permissions List */}
          <TabsContent value={selectedCategory} className="flex-1 mt-4">
            <ScrollArea className="h-[calc(100vh-450px)]">
              <div className="grid gap-2">
                {paginatedPermissions.map((permission) => {
                  const catInfo = CATEGORY_INFO[permission.category] || { icon: Settings, labelAr: permission.category, color: 'bg-gray-500' };
                  const secInfo = SECURITY_LEVELS[permission.securityLevel];
                  const SecIcon = secInfo.icon;
                  const isEnabled = permission.defaultEnabled || permission.isGranted;

                  return (
                    <Card 
                      key={permission.code} 
                      className={`p-3 transition-all ${isEnabled ? 'border-green-500/30' : 'border-muted'}`}
                      data-testid={`card-permission-${permission.code}`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Toggle */}
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={(checked) => {
                            toggleMutation.mutate({ code: permission.code, enabled: checked });
                          }}
                          disabled={toggleMutation.isPending}
                          data-testid={`switch-${permission.code}`}
                        />

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium text-sm">{permission.nameAr}</h3>
                            <Badge variant="outline" className="text-xs">
                              {permission.code}
                            </Badge>
                            <Badge className={`text-xs ${secInfo.color}`}>
                              <SecIcon className="w-3 h-3 ml-1" />
                              {secInfo.labelAr}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {permission.descriptionAr}
                          </p>
                        </div>

                        {/* Status Icon */}
                        <div className={`p-2 rounded-full ${isEnabled ? 'bg-green-500/10' : 'bg-muted'}`}>
                          {isEnabled ? (
                            <Unlock className="w-4 h-4 text-green-500" />
                          ) : (
                            <Lock className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}

                {paginatedPermissions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>لا توجد صلاحيات مطابقة للبحث</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              عرض {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredPermissions.length)} من {filteredPermissions.length}
            </p>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                data-testid="button-prev-page"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setCurrentPage(pageNum)}
                    data-testid={`button-page-${pageNum}`}
                  >
                    {pageNum}
                  </Button>
                );
              })}

              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                data-testid="button-next-page"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
