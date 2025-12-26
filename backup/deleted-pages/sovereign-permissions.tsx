import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { 
  Shield, Crown, Users, Key, Lock, Unlock, Settings,
  CheckCircle2, XCircle, AlertTriangle, RefreshCw, Loader2,
  Building2, Zap, Eye, UserCog, ChevronRight
} from "lucide-react";
import type { User } from "@shared/schema";

const PERMISSION_CATEGORIES = {
  system: { en: "System", ar: "النظام", icon: Settings },
  users: { en: "Users", ar: "المستخدمين", icon: Users },
  projects: { en: "Projects", ar: "المشاريع", icon: Building2 },
  ai: { en: "AI", ar: "الذكاء الاصطناعي", icon: Zap },
  infra: { en: "Infrastructure", ar: "البنية التحتية", icon: Shield },
  finance: { en: "Finance", ar: "المالية", icon: Key },
  api: { en: "API", ar: "API", icon: Lock },
  data: { en: "Data", ar: "البيانات", icon: Eye },
  owner: { en: "Owner", ar: "المالك", icon: Crown },
};

export default function SovereignPermissions() {
  const { toast } = useToast();
  const { language } = useLanguage();
  const isRtl = language === "ar";
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, boolean>>({});

  const { data: staff = [], isLoading: loadingStaff } = useQuery<User[]>({
    queryKey: ["/api/owner/staff"],
  });

  const { data: definitions } = useQuery<{
    permissions: Array<{ code: string; en: string; ar: string; category: string }>;
    categories: string[];
  }>({
    queryKey: ["/api/permissions/definitions"],
  });

  const { data: userPermissions, refetch: refetchUserPermissions } = useQuery<{
    userId: string;
    role: string;
    effectivePermissions: string[];
    overrides: { granted: string[]; revoked: string[] };
  }>({
    queryKey: ["/api/permissions/user", selectedUser?.id],
    enabled: !!selectedUser,
  });

  const grantMutation = useMutation({
    mutationFn: async (data: { targetUserId: string; permissions: string[]; reason?: string }) => {
      return apiRequest("POST", "/api/permissions/grant", data);
    },
    onSuccess: () => {
      refetchUserPermissions();
      queryClient.invalidateQueries({ queryKey: ["/api/permissions/stats"] });
      toast({ title: isRtl ? "تم منح الصلاحيات" : "Permissions granted" });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (data: { targetUserId: string; permissions: string[]; reason?: string }) => {
      return apiRequest("POST", "/api/permissions/revoke", data);
    },
    onSuccess: () => {
      refetchUserPermissions();
      queryClient.invalidateQueries({ queryKey: ["/api/permissions/stats"] });
      toast({ title: isRtl ? "تم سحب الصلاحيات" : "Permissions revoked" });
    },
  });

  const resetMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest("POST", `/api/permissions/reset/${userId}`);
    },
    onSuccess: () => {
      refetchUserPermissions();
      queryClient.invalidateQueries({ queryKey: ["/api/permissions/stats"] });
      toast({ title: isRtl ? "تم إعادة تعيين الصلاحيات" : "Permissions reset" });
    },
  });

  const sovereignUsers = staff.filter(u => u.role === "sovereign");
  const adminUsers = staff.filter(u => u.role === "admin");

  const handlePermissionToggle = (permissionCode: string, currentlyHas: boolean) => {
    if (!selectedUser) return;
    
    if (currentlyHas) {
      revokeMutation.mutate({
        targetUserId: selectedUser.id,
        permissions: [permissionCode],
        reason: "Permission revoked by owner",
      });
    } else {
      grantMutation.mutate({
        targetUserId: selectedUser.id,
        permissions: [permissionCode],
        reason: "Permission granted by owner",
      });
    }
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setShowPermissionDialog(true);
  };

  const permissionsByCategory = definitions?.permissions?.reduce((acc, perm) => {
    const cat = perm.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(perm);
    return acc;
  }, {} as Record<string, typeof definitions.permissions>) || {};

  if (loadingStaff) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/10 flex items-center justify-center border border-purple-500/30">
            <Crown className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">
              {isRtl ? "إدارة صلاحيات السياديين" : "Sovereign Permissions Management"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isRtl ? "تحكم ديناميكي في صلاحيات المساعدين السياديين" : "Dynamic control of sovereign assistant permissions"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{sovereignUsers.length}</p>
                <p className="text-xs text-muted-foreground">
                  {isRtl ? "مساعدين سياديين" : "Sovereign Assistants"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <UserCog className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{adminUsers.length}</p>
                <p className="text-xs text-muted-foreground">
                  {isRtl ? "مديرين" : "Admins"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Key className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{definitions?.permissions?.length || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {isRtl ? "صلاحية متاحة" : "Available Permissions"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sovereign" className="w-full">
        <TabsList>
          <TabsTrigger value="sovereign" className="gap-2">
            <Shield className="h-4 w-4" />
            {isRtl ? "السياديين" : "Sovereign"}
          </TabsTrigger>
          <TabsTrigger value="admin" className="gap-2">
            <UserCog className="h-4 w-4" />
            {isRtl ? "المديرين" : "Admins"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sovereign">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                {isRtl ? "المساعدين السياديين" : "Sovereign Assistants"}
              </CardTitle>
              <CardDescription>
                {isRtl 
                  ? "إدارة صلاحيات المساعدين السياديين بشكل ديناميكي" 
                  : "Dynamically manage sovereign assistant permissions"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {sovereignUsers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>{isRtl ? "لا يوجد مساعدين سياديين" : "No sovereign assistants"}</p>
                    </div>
                  ) : (
                    sovereignUsers.map((user) => (
                      <div 
                        key={user.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover-elevate cursor-pointer"
                        onClick={() => handleSelectUser(user)}
                        data-testid={`sovereign-user-${user.id}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-purple-600">
                              {user.fullName?.charAt(0) || user.email?.charAt(0) || "?"}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{user.fullName || user.email}</span>
                              <Badge className="bg-purple-500 text-white text-[10px]">
                                {isRtl ? "سيادي" : "Sovereign"}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5 text-blue-600" />
                {isRtl ? "المديرين" : "Admins"}
              </CardTitle>
              <CardDescription>
                {isRtl 
                  ? "إدارة صلاحيات المديرين بشكل ديناميكي" 
                  : "Dynamically manage admin permissions"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {adminUsers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <UserCog className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>{isRtl ? "لا يوجد مديرين" : "No admins"}</p>
                    </div>
                  ) : (
                    adminUsers.map((user) => (
                      <div 
                        key={user.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover-elevate cursor-pointer"
                        onClick={() => handleSelectUser(user)}
                        data-testid={`admin-user-${user.id}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {user.fullName?.charAt(0) || user.email?.charAt(0) || "?"}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{user.fullName || user.email}</span>
                              <Badge className="bg-blue-500 text-white text-[10px]">
                                {isRtl ? "مدير" : "Admin"}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]" dir={isRtl ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              {isRtl ? "إدارة صلاحيات" : "Manage Permissions"}: {selectedUser?.fullName || selectedUser?.email}
            </DialogTitle>
            <DialogDescription>
              {isRtl 
                ? "قم بتشغيل أو إيقاف الصلاحيات الفردية. التغييرات تُحفظ تلقائياً في قاعدة البيانات."
                : "Toggle individual permissions. Changes are automatically saved to the database."}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-6">
              {Object.entries(permissionsByCategory).map(([category, perms]) => {
                const catInfo = PERMISSION_CATEGORIES[category as keyof typeof PERMISSION_CATEGORIES];
                const CatIcon = catInfo?.icon || Settings;
                
                return (
                  <div key={category} className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <CatIcon className="h-4 w-4" />
                      {isRtl ? catInfo?.ar : catInfo?.en || category}
                    </div>
                    <div className="space-y-2">
                      {perms.map((perm) => {
                        const hasPermission = userPermissions?.effectivePermissions?.includes(perm.code) || false;
                        const isGranted = userPermissions?.overrides?.granted?.includes(perm.code) || false;
                        const isRevoked = userPermissions?.overrides?.revoked?.includes(perm.code) || false;
                        const isOwnerOnly = perm.code === "owner:full_access";
                        
                        return (
                          <div 
                            key={perm.code}
                            className="flex items-center justify-between p-3 rounded-lg border"
                          >
                            <div className="flex items-center gap-3">
                              {hasPermission ? (
                                <Unlock className="h-4 w-4 text-green-600" />
                              ) : (
                                <Lock className="h-4 w-4 text-muted-foreground" />
                              )}
                              <div>
                                <p className="text-sm font-medium">
                                  {isRtl ? perm.ar : perm.en}
                                </p>
                                <p className="text-xs text-muted-foreground font-mono">
                                  {perm.code}
                                </p>
                              </div>
                              {isGranted && (
                                <Badge variant="outline" className="text-[10px] border-green-500 text-green-600">
                                  {isRtl ? "ممنوحة" : "Granted"}
                                </Badge>
                              )}
                              {isRevoked && (
                                <Badge variant="outline" className="text-[10px] border-red-500 text-red-600">
                                  {isRtl ? "مسحوبة" : "Revoked"}
                                </Badge>
                              )}
                            </div>
                            <Switch
                              checked={hasPermission}
                              disabled={isOwnerOnly || grantMutation.isPending || revokeMutation.isPending}
                              onCheckedChange={() => handlePermissionToggle(perm.code, hasPermission)}
                              data-testid={`switch-${perm.code}`}
                            />
                          </div>
                        );
                      })}
                    </div>
                    <Separator />
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => selectedUser && resetMutation.mutate(selectedUser.id)}
              disabled={resetMutation.isPending}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {isRtl ? "إعادة تعيين للافتراضي" : "Reset to Default"}
            </Button>
            <Button onClick={() => setShowPermissionDialog(false)}>
              {isRtl ? "إغلاق" : "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
