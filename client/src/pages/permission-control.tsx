import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, Users, Key, Lock, Unlock, Settings, Search,
  CheckCircle2, XCircle, AlertTriangle, History, Crown,
  UserCog, Building2, Briefcase, Zap, Star, Gift, Eye,
  RefreshCw, Loader2, ChevronRight, Filter, Download
} from "lucide-react";

interface Permission {
  code: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  nameAr: string;
  level: number;
  permissions: string[];
  icon: string;
  color: string;
}

interface UserPermission {
  userId: string;
  username: string;
  email: string;
  role: string;
  permissions: string[];
  overrides: string[];
}

interface AuditEntry {
  id: string;
  action: string;
  targetUserId: string;
  targetUsername: string;
  permission: string;
  performedBy: string;
  performedByUsername: string;
  timestamp: string;
  success: boolean;
}

const roleIcons: Record<string, any> = {
  owner: Crown,
  sovereign: Shield,
  admin: UserCog,
  enterprise: Building2,
  pro: Briefcase,
  basic: Zap,
  free: Gift,
};

const roleColors: Record<string, string> = {
  owner: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  sovereign: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  admin: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  enterprise: "bg-green-500/10 text-green-600 border-green-500/30",
  pro: "bg-cyan-500/10 text-cyan-600 border-cyan-500/30",
  basic: "bg-slate-500/10 text-slate-600 border-slate-500/30",
  free: "bg-gray-500/10 text-gray-600 border-gray-500/30",
};

const categoryIcons: Record<string, any> = {
  system: Settings,
  users: Users,
  projects: Building2,
  ai: Zap,
  infra: Shield,
  finance: Briefcase,
  api: Key,
  data: Download,
  owner: Crown,
};

export default function PermissionControl() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const isRtl = language === "ar";

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<UserPermission | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);

  const { data: definitionsData, isLoading: loadingDefinitions } = useQuery<{
    permissions: Permission[];
    categories: string[];
  }>({
    queryKey: ["/api/permissions/definitions"],
  });

  const { data: rolesData, isLoading: loadingRoles } = useQuery<{
    roles: Role[];
  }>({
    queryKey: ["/api/permissions/roles"],
  });

  const { data: statsData, isLoading: loadingStats } = useQuery<{
    totalPermissions: number;
    totalRoles: number;
    usersWithOverrides: number;
    recentActions: number;
  }>({
    queryKey: ["/api/permissions/stats"],
  });

  const { data: auditData, isLoading: loadingAudit } = useQuery<{
    logs: AuditEntry[];
  }>({
    queryKey: ["/api/permissions/audit"],
  });

  const { data: myPermissions } = useQuery<{
    userId: string;
    role: string;
    permissions: string[];
    overrides: string[];
  }>({
    queryKey: ["/api/permissions/me"],
  });

  const grantMutation = useMutation({
    mutationFn: async (data: { targetUserId: string; permissions: string[] }) => {
      return apiRequest("POST", "/api/permissions/grant", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/permissions"] });
      toast({
        title: isRtl ? "تم منح الصلاحية" : "Permission Granted",
        description: isRtl ? "تم منح الصلاحية بنجاح" : "Permission granted successfully",
      });
    },
    onError: () => {
      toast({
        title: isRtl ? "فشل المنح" : "Grant Failed",
        variant: "destructive",
      });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (data: { targetUserId: string; permissions: string[] }) => {
      return apiRequest("POST", "/api/permissions/revoke", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/permissions"] });
      toast({
        title: isRtl ? "تم سحب الصلاحية" : "Permission Revoked",
        description: isRtl ? "تم سحب الصلاحية بنجاح" : "Permission revoked successfully",
      });
    },
    onError: () => {
      toast({
        title: isRtl ? "فشل السحب" : "Revoke Failed",
        variant: "destructive",
      });
    },
  });

  const permissions = definitionsData?.permissions || [];
  const categories = definitionsData?.categories || [];
  const roles = rolesData?.roles || [];
  const auditLogs = auditData?.logs || [];

  const filteredPermissions = permissions.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.nameAr.includes(searchTerm) ||
                         p.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = statsData || {
    totalPermissions: 31,
    totalRoles: 7,
    usersWithOverrides: 0,
    recentActions: 0,
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {isRtl ? "التحكم في الصلاحيات" : "Permission Control"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isRtl ? "إدارة أدوار المستخدمين وصلاحياتهم" : "Manage user roles and permissions"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Lock className="w-3 h-3" />
              {isRtl ? `دورك: ${myPermissions?.role || "---"}` : `Your Role: ${myPermissions?.role || "---"}`}
            </Badge>
            <Badge variant="secondary">
              {myPermissions?.permissions?.length || 0} {isRtl ? "صلاحية" : "permissions"}
            </Badge>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Key className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalPermissions}</p>
                  <p className="text-xs text-muted-foreground">
                    {isRtl ? "إجمالي الصلاحيات" : "Total Permissions"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalRoles}</p>
                  <p className="text-xs text-muted-foreground">
                    {isRtl ? "الأدوار المتاحة" : "Available Roles"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <UserCog className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.usersWithOverrides}</p>
                  <p className="text-xs text-muted-foreground">
                    {isRtl ? "تجاوزات مخصصة" : "Custom Overrides"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <History className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.recentActions}</p>
                  <p className="text-xs text-muted-foreground">
                    {isRtl ? "إجراءات حديثة" : "Recent Actions"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="permissions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="permissions" className="gap-2" data-testid="tab-permissions">
              <Key className="w-4 h-4" />
              {isRtl ? "الصلاحيات" : "Permissions"}
            </TabsTrigger>
            <TabsTrigger value="roles" className="gap-2" data-testid="tab-roles">
              <Shield className="w-4 h-4" />
              {isRtl ? "الأدوار" : "Roles"}
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-2" data-testid="tab-audit">
              <History className="w-4 h-4" />
              {isRtl ? "سجل التدقيق" : "Audit Log"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="permissions" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <CardTitle>{isRtl ? "قائمة الصلاحيات" : "Permission List"}</CardTitle>
                    <CardDescription>
                      {isRtl ? "جميع الصلاحيات المتاحة في النظام" : "All available permissions in the system"}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder={isRtl ? "بحث..." : "Search..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-64"
                        data-testid="input-search-permissions"
                      />
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-40" data-testid="select-category">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{isRtl ? "الكل" : "All"}</SelectItem>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingDefinitions ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-2">
                      {filteredPermissions.map((permission) => {
                        const CategoryIcon = categoryIcons[permission.category] || Key;
                        const hasPermission = myPermissions?.permissions?.includes(permission.code);
                        
                        return (
                          <div
                            key={permission.code}
                            className="flex items-center justify-between p-3 rounded-lg border hover-elevate"
                            data-testid={`permission-${permission.code}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center">
                                <CategoryIcon className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">
                                  {isRtl ? permission.nameAr : permission.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  <code className="bg-muted px-1 rounded">{permission.code}</code>
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {permission.category}
                              </Badge>
                              {hasPermission ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              ) : (
                                <XCircle className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {loadingRoles ? (
                <div className="col-span-full flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : roles.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="py-12 text-center">
                    <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {isRtl ? "لا توجد أدوار" : "No roles available"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                roles.map((role) => {
                  const RoleIcon = roleIcons[role.id] || Shield;
                  const colorClass = roleColors[role.id] || roleColors.free;
                  
                  return (
                    <Card 
                      key={role.id} 
                      className="hover-elevate"
                      data-testid={`role-${role.id}`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                              <RoleIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <CardTitle className="text-base">
                                {isRtl ? role.nameAr : role.name}
                              </CardTitle>
                              <p className="text-xs text-muted-foreground">
                                {isRtl ? `المستوى ${role.level}` : `Level ${role.level}`}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary">
                            {role.permissions.length}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground mb-2">
                            {isRtl ? "الصلاحيات المضمنة:" : "Included permissions:"}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.slice(0, 5).map((p) => (
                              <Badge key={p} variant="outline" className="text-[10px]">
                                {p.split(":")[1]}
                              </Badge>
                            ))}
                            {role.permissions.length > 5 && (
                              <Badge variant="secondary" className="text-[10px]">
                                +{role.permissions.length - 5}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  {isRtl ? "سجل التدقيق" : "Audit Log"}
                </CardTitle>
                <CardDescription>
                  {isRtl ? "تتبع جميع تغييرات الصلاحيات" : "Track all permission changes"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingAudit ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : auditLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {isRtl ? "لا توجد سجلات بعد" : "No audit logs yet"}
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {auditLogs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-center justify-between p-3 rounded-lg border"
                          data-testid={`audit-${log.id}`}
                        >
                          <div className="flex items-center gap-3">
                            {log.success ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                            <div>
                              <p className="font-medium text-sm">
                                {log.action === "grant" 
                                  ? (isRtl ? "منح صلاحية" : "Grant Permission")
                                  : (isRtl ? "سحب صلاحية" : "Revoke Permission")
                                }
                              </p>
                              <p className="text-xs text-muted-foreground">
                                <code className="bg-muted px-1 rounded">{log.permission}</code>
                                {" → "}
                                {log.targetUsername}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              {isRtl ? "بواسطة" : "by"} {log.performedByUsername}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(log.timestamp).toLocaleString(isRtl ? "ar-SA" : "en-US")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
