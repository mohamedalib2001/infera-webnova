import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Brain, 
  Shield, 
  AlertTriangle, 
  Settings,
  Database,
  FileCode,
  Code,
  Globe,
  Users,
  Server,
  Rocket,
  CreditCard,
  Key,
  Eye,
  Bot,
  CheckCircle,
  XCircle,
  History,
  Zap,
  Lock,
  Unlock,
  RefreshCw,
  Search,
  Filter,
  Download
} from "lucide-react";

interface NovaPermission {
  code: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  category: string;
  securityLevel: "low" | "medium" | "high" | "danger";
  isGranted?: boolean;
  grantedAt?: string;
  grantedBy?: string;
}

interface NovaPreset {
  code: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  permissions: string[];
  displayOrder: number;
}

interface PermissionAudit {
  id: string;
  userId: string;
  actorId: string;
  action: string;
  permissionCode?: string;
  permissionCodes?: string[];
  previousState?: boolean;
  newState?: boolean;
  reason?: string;
  createdAt: string;
}

const CATEGORY_CONFIG: Record<string, { icon: any; color: string; colorClass: string }> = {
  database_operations: { icon: Database, color: "text-blue-500", colorClass: "bg-blue-500/10 border-blue-500/20" },
  file_operations: { icon: FileCode, color: "text-green-500", colorClass: "bg-green-500/10 border-green-500/20" },
  code_execution: { icon: Code, color: "text-purple-500", colorClass: "bg-purple-500/10 border-purple-500/20" },
  api_integrations: { icon: Globe, color: "text-orange-500", colorClass: "bg-orange-500/10 border-orange-500/20" },
  user_management: { icon: Users, color: "text-cyan-500", colorClass: "bg-cyan-500/10 border-cyan-500/20" },
  infrastructure: { icon: Server, color: "text-red-500", colorClass: "bg-red-500/10 border-red-500/20" },
  deployment: { icon: Rocket, color: "text-indigo-500", colorClass: "bg-indigo-500/10 border-indigo-500/20" },
  payment_billing: { icon: CreditCard, color: "text-yellow-500", colorClass: "bg-yellow-500/10 border-yellow-500/20" },
  system_config: { icon: Settings, color: "text-gray-500", colorClass: "bg-gray-500/10 border-gray-500/20" },
  ai_capabilities: { icon: Bot, color: "text-pink-500", colorClass: "bg-pink-500/10 border-pink-500/20" },
};

const SECURITY_LEVEL_CONFIG: Record<string, { label: string; labelAr: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  low: { label: "Low", labelAr: "منخفض", variant: "secondary" },
  medium: { label: "Medium", labelAr: "متوسط", variant: "default" },
  high: { label: "High", labelAr: "عالي", variant: "outline" },
  danger: { label: "Danger", labelAr: "خطر", variant: "destructive" },
};

export default function NovaPermissionsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("permissions");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showPresetDialog, setShowPresetDialog] = useState(false);

  const { data: permissionsData, isLoading: permissionsLoading, refetch: refetchPermissions } = useQuery({
    queryKey: ["/api/nova/permissions"],
  });

  const { data: presetsData } = useQuery({
    queryKey: ["/api/nova/permissions/presets"],
  });

  const { data: currentUserContext } = useQuery({
    queryKey: ["/api/nova/context"],
  });

  const { data: usersData } = useQuery({
    queryKey: ["/api/users"],
  });

  const { data: userPermissionsData, refetch: refetchUserPermissions } = useQuery({
    queryKey: ["/api/nova/permissions/user", selectedUserId],
    enabled: !!selectedUserId,
  });

  const { data: auditData } = useQuery({
    queryKey: ["/api/nova/permissions/audit", selectedUserId],
    enabled: !!selectedUserId,
  });

  const grantMutation = useMutation({
    mutationFn: async ({ userId, permissionCode, reason }: { userId: string; permissionCode: string; reason?: string }) => {
      return await apiRequest("POST", "/api/nova/permissions/grant", { userId, permissionCode, reason });
    },
    onSuccess: () => {
      toast({ title: "Permission Granted / تم منح الصلاحية" });
      refetchUserPermissions();
      queryClient.invalidateQueries({ queryKey: ["/api/nova/permissions/audit", selectedUserId] });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async ({ userId, permissionCode, reason }: { userId: string; permissionCode: string; reason?: string }) => {
      return await apiRequest("POST", "/api/nova/permissions/revoke", { userId, permissionCode, reason });
    },
    onSuccess: () => {
      toast({ title: "Permission Revoked / تم إلغاء الصلاحية" });
      refetchUserPermissions();
      queryClient.invalidateQueries({ queryKey: ["/api/nova/permissions/audit", selectedUserId] });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const applyPresetMutation = useMutation({
    mutationFn: async ({ userId, presetCode }: { userId: string; presetCode: string }) => {
      return await apiRequest("POST", "/api/nova/permissions/apply-preset", { userId, presetCode });
    },
    onSuccess: () => {
      toast({ title: "Preset Applied / تم تطبيق الإعداد المسبق" });
      refetchUserPermissions();
      setShowPresetDialog(false);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const permissions: NovaPermission[] = (permissionsData as any)?.permissions || [];
  const grouped: Record<string, NovaPermission[]> = (permissionsData as any)?.grouped || {};
  const presets: NovaPreset[] = (presetsData as any)?.presets || [];
  const users = (usersData as any)?.users || usersData || [];
  const userPermissions: NovaPermission[] = (userPermissionsData as any)?.permissions || [];
  const userStats = (userPermissionsData as any)?.stats;
  const auditLogs: PermissionAudit[] = (auditData as any)?.audit || [];

  const categories = Object.keys(grouped);

  const filteredPermissions = userPermissions.filter(p => {
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nameAr.includes(searchQuery) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryConfig = (category: string) => {
    return CATEGORY_CONFIG[category] || { icon: Shield, color: "text-muted-foreground", colorClass: "bg-muted" };
  };

  const renderPermissionCard = (permission: NovaPermission) => {
    const CategoryIcon = getCategoryConfig(permission.category).icon;
    const securityConfig = SECURITY_LEVEL_CONFIG[permission.securityLevel] || SECURITY_LEVEL_CONFIG.medium;
    
    return (
      <Card 
        key={permission.code} 
        className={`border ${permission.isGranted ? 'border-green-500/30 bg-green-500/5' : 'border-border'}`}
        data-testid={`card-permission-${permission.code}`}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className={`p-2 rounded-md ${getCategoryConfig(permission.category).colorClass}`}>
                <CategoryIcon className={`h-4 w-4 ${getCategoryConfig(permission.category).color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{permission.nameEn}</span>
                  <Badge variant={securityConfig.variant} className="text-xs">
                    {securityConfig.label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate" dir="rtl">
                  {permission.nameAr}
                </p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {permission.descriptionEn}
                </p>
                <code className="text-[10px] text-muted-foreground/60 mt-1 block">
                  {permission.code}
                </code>
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              {permission.isGranted && permission.grantedAt && (
                <span className="text-[10px] text-muted-foreground">
                  {new Date(permission.grantedAt).toLocaleDateString()}
                </span>
              )}
              <Switch
                checked={permission.isGranted || false}
                disabled={!selectedUserId || grantMutation.isPending || revokeMutation.isPending}
                onCheckedChange={(checked) => {
                  if (!selectedUserId) return;
                  if (checked) {
                    grantMutation.mutate({ userId: selectedUserId, permissionCode: permission.code });
                  } else {
                    revokeMutation.mutate({ userId: selectedUserId, permissionCode: permission.code });
                  }
                }}
                data-testid={`switch-permission-${permission.code}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-primary/10">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold" data-testid="text-page-title">Nova AI Permissions</h1>
            <p className="text-sm text-muted-foreground" dir="rtl">صلاحيات مساعد نوفا الذكي</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetchPermissions()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-md bg-blue-500/10">
              <Key className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold" data-testid="text-total-permissions">{permissions.length}</p>
              <p className="text-xs text-muted-foreground">Total Permissions</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-md bg-green-500/10">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold" data-testid="text-granted-count">{userStats?.granted || 0}</p>
              <p className="text-xs text-muted-foreground">Granted</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-md bg-orange-500/10">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold" data-testid="text-high-security">
                {userStats?.bySecurityLevel?.high || 0}
              </p>
              <p className="text-xs text-muted-foreground">High Security</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-md bg-red-500/10">
              <Shield className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold" data-testid="text-danger-count">
                {userStats?.bySecurityLevel?.danger || 0}
              </p>
              <p className="text-xs text-muted-foreground">Danger Level</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="permissions" data-testid="tab-permissions">
            <Key className="h-4 w-4 mr-2" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="presets" data-testid="tab-presets">
            <Zap className="h-4 w-4 mr-2" />
            Presets
          </TabsTrigger>
          <TabsTrigger value="audit" data-testid="tab-audit">
            <History className="h-4 w-4 mr-2" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="permissions" className="flex-1 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
            <Card className="lg:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Select User</CardTitle>
                <CardDescription>Choose user to manage permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedUserId || ""} onValueChange={setSelectedUserId}>
                  <SelectTrigger data-testid="select-user">
                    <SelectValue placeholder="Select a user..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(users) && users.map((user: any) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <span>{user.fullName || user.email}</span>
                          <Badge variant="secondary" className="text-xs">{user.role}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedUserId && (
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setShowPresetDialog(true)}
                      data-testid="button-apply-preset"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Apply Preset
                    </Button>
                  </div>
                )}

                <div className="mt-4 space-y-2">
                  <Label className="text-xs text-muted-foreground">Filter by Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger data-testid="select-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(cat => {
                        const config = getCategoryConfig(cat);
                        const CategoryIcon = config.icon;
                        return (
                          <SelectItem key={cat} value={cat}>
                            <div className="flex items-center gap-2">
                              <CategoryIcon className={`h-3 w-3 ${config.color}`} />
                              <span className="capitalize">{cat.replace(/_/g, ' ')}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle className="text-sm">Permissions</CardTitle>
                    <CardDescription>
                      {selectedUserId 
                        ? `Managing permissions for selected user`
                        : "Select a user to manage their Nova permissions"
                      }
                    </CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search permissions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                      data-testid="input-search-permissions"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!selectedUserId ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">Select a user to view and manage their Nova permissions</p>
                    <p className="text-sm text-muted-foreground" dir="rtl">اختر مستخدماً لعرض وإدارة صلاحيات نوفا الخاصة به</p>
                  </div>
                ) : permissionsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3 pr-4">
                      {filteredPermissions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
                          <p className="text-muted-foreground">No permissions found matching your criteria</p>
                        </div>
                      ) : (
                        filteredPermissions.map(renderPermissionCard)
                      )}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="presets" className="flex-1 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {presets.map(preset => (
              <Card key={preset.code} data-testid={`card-preset-${preset.code}`}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    {preset.nameEn}
                  </CardTitle>
                  <CardDescription dir="rtl">{preset.nameAr}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{preset.descriptionEn}</p>
                  <div className="flex items-center justify-between gap-4">
                    <Badge variant="secondary">{preset.permissions.length} permissions</Badge>
                    {selectedUserId && (
                      <Button 
                        size="sm" 
                        onClick={() => applyPresetMutation.mutate({ userId: selectedUserId, presetCode: preset.code })}
                        disabled={applyPresetMutation.isPending}
                        data-testid={`button-apply-${preset.code}`}
                      >
                        Apply
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audit" className="flex-1 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <History className="h-5 w-5" />
                Permission Audit Log
              </CardTitle>
              <CardDescription>
                {selectedUserId 
                  ? "History of permission changes for selected user"
                  : "Select a user to view their permission audit log"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedUserId ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <History className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">Select a user to view their audit log</p>
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">No audit entries yet</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2 pr-4">
                    {auditLogs.map((log) => (
                      <div 
                        key={log.id} 
                        className="flex items-center gap-3 p-3 rounded-md bg-muted/50 border"
                        data-testid={`audit-log-${log.id}`}
                      >
                        <div className={`p-2 rounded-full ${
                          log.action === 'grant' ? 'bg-green-500/10' : 
                          log.action === 'revoke' ? 'bg-red-500/10' : 
                          'bg-blue-500/10'
                        }`}>
                          {log.action === 'grant' ? (
                            <Unlock className="h-4 w-4 text-green-500" />
                          ) : log.action === 'revoke' ? (
                            <Lock className="h-4 w-4 text-red-500" />
                          ) : (
                            <Zap className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm capitalize">{log.action.replace(/_/g, ' ')}</span>
                            {log.permissionCode && (
                              <code className="text-xs bg-muted px-1 rounded">{log.permissionCode}</code>
                            )}
                          </div>
                          {log.reason && (
                            <p className="text-xs text-muted-foreground truncate">{log.reason}</p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showPresetDialog} onOpenChange={setShowPresetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply Permission Preset</DialogTitle>
            <DialogDescription>
              This will replace all current permissions with the preset configuration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {presets.map(preset => (
              <Button
                key={preset.code}
                variant="outline"
                className="w-full justify-start h-auto py-3"
                onClick={() => {
                  if (selectedUserId) {
                    applyPresetMutation.mutate({ userId: selectedUserId, presetCode: preset.code });
                  }
                }}
                disabled={applyPresetMutation.isPending}
                data-testid={`dialog-preset-${preset.code}`}
              >
                <div className="flex flex-col items-start gap-1">
                  <span className="font-medium">{preset.nameEn}</span>
                  <span className="text-xs text-muted-foreground">{preset.permissions.length} permissions</span>
                </div>
              </Button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPresetDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
