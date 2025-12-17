import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Users, Crown, Shield, Activity, BarChart3, Settings, 
  UserCheck, UserX, Search, RefreshCw, Loader2, 
  TrendingUp, Globe, Zap, Database, Server, Cpu
} from "lucide-react";
import { Redirect } from "wouter";
import type { User, SubscriptionPlan } from "@shared/schema";

type UserWithoutPassword = Omit<User, "password">;

export default function Sovereign() {
  const { language, isRtl } = useLanguage();
  const { user, isSovereign, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWithoutPassword | null>(null);
  const [activateDialog, setActivateDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [billingCycle, setBillingCycle] = useState("monthly");

  const tr = (ar: string, en: string) => language === "ar" ? ar : en;

  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = useQuery<UserWithoutPassword[]>({
    queryKey: ["/api/sovereign/users"],
    enabled: isSovereign,
  });

  const { data: plans } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/plans"],
  });

  const { data: stats } = useQuery<{
    totalUsers: number;
    activeUsers: number;
    totalProjects: number;
    aiGenerations: number;
  }>({
    queryKey: ["/api/sovereign/stats"],
    enabled: isSovereign,
  });

  const activateMutation = useMutation({
    mutationFn: async (data: { userId: string; planId: string; billingCycle: string }) => {
      return apiRequest("POST", "/api/sovereign/activate-subscription", data);
    },
    onSuccess: () => {
      toast({ title: tr("تم تفعيل الاشتراك بنجاح", "Subscription activated successfully") });
      queryClient.invalidateQueries({ queryKey: ["/api/sovereign/users"] });
      setActivateDialog(false);
      setSelectedUser(null);
    },
    onError: () => {
      toast({ title: tr("فشل في تفعيل الاشتراك", "Failed to activate subscription"), variant: "destructive" });
    },
  });

  const toggleUserMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      return apiRequest("POST", `/api/sovereign/users/${userId}/toggle`, { isActive });
    },
    onSuccess: () => {
      toast({ title: tr("تم تحديث حالة المستخدم", "User status updated") });
      queryClient.invalidateQueries({ queryKey: ["/api/sovereign/users"] });
    },
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isSovereign) {
    return <Redirect to="/" />;
  }

  const filteredUsers = users?.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.fullName && u.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const roleColors: Record<string, "secondary" | "default" | "destructive"> = {
    free: "secondary",
    basic: "secondary",
    pro: "default",
    enterprise: "default",
    sovereign: "destructive",
  };

  const statCards = [
    { 
      title: tr("إجمالي المستخدمين", "Total Users"), 
      value: stats?.totalUsers || users?.length || 0, 
      icon: Users, 
      color: "from-blue-500 to-blue-600" 
    },
    { 
      title: tr("المستخدمون النشطون", "Active Users"), 
      value: stats?.activeUsers || users?.filter(u => u.isActive).length || 0, 
      icon: UserCheck, 
      color: "from-green-500 to-green-600" 
    },
    { 
      title: tr("إجمالي المشاريع", "Total Projects"), 
      value: stats?.totalProjects || 0, 
      icon: Globe, 
      color: "from-violet-500 to-purple-600" 
    },
    { 
      title: tr("توليدات AI", "AI Generations"), 
      value: stats?.aiGenerations || 0, 
      icon: Zap, 
      color: "from-amber-500 to-orange-600" 
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6" dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center">
          <Crown className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" data-testid="sovereign-title">
            {tr("لوحة التحكم السيادية", "Sovereign Dashboard")}
          </h1>
          <p className="text-muted-foreground">
            {tr("إدارة كاملة للمنظومة", "Complete System Management")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value.toLocaleString()}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            {tr("المستخدمون", "Users")}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            {tr("التحليلات", "Analytics")}
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <Server className="h-4 w-4" />
            {tr("النظام", "System")}
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            {tr("الإعدادات", "Settings")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>{tr("إدارة المستخدمين", "User Management")}</CardTitle>
                  <CardDescription>
                    {tr("عرض وإدارة جميع مستخدمي المنصة", "View and manage all platform users")}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={tr("بحث...", "Search...")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="ps-9 w-[200px]"
                      data-testid="input-user-search"
                    />
                  </div>
                  <Button variant="outline" size="icon" onClick={() => refetchUsers()}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{tr("المستخدم", "User")}</TableHead>
                        <TableHead>{tr("البريد الإلكتروني", "Email")}</TableHead>
                        <TableHead>{tr("الدور", "Role")}</TableHead>
                        <TableHead>{tr("الحالة", "Status")}</TableHead>
                        <TableHead>{tr("اللغة", "Language")}</TableHead>
                        <TableHead className="text-end">{tr("الإجراءات", "Actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers?.map((u) => (
                        <TableRow key={u.id} data-testid={`user-row-${u.id}`}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
                                {(u.fullName || u.username).charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium">{u.fullName || u.username}</p>
                                <p className="text-xs text-muted-foreground">@{u.username}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>
                            <Badge variant={roleColors[u.role] || "secondary"}>
                              {u.role === "sovereign" && <Shield className="h-3 w-3 me-1" />}
                              {u.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={u.isActive ? "default" : "secondary"}>
                              {u.isActive ? tr("نشط", "Active") : tr("معطل", "Disabled")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {u.language === "ar" ? "العربية" : "English"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(u);
                                  setActivateDialog(true);
                                }}
                                data-testid={`button-activate-${u.id}`}
                              >
                                {tr("تفعيل اشتراك", "Activate Plan")}
                              </Button>
                              <Button
                                variant={u.isActive ? "destructive" : "default"}
                                size="sm"
                                onClick={() => toggleUserMutation.mutate({ userId: u.id, isActive: !u.isActive })}
                                data-testid={`button-toggle-${u.id}`}
                              >
                                {u.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {tr("نمو المستخدمين", "User Growth")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  {tr("الرسم البياني سيظهر هنا", "Chart will appear here")}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  {tr("استخدام AI", "AI Usage")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  {tr("الرسم البياني سيظهر هنا", "Chart will appear here")}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  {tr("حالة الخادم", "Server Status")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{tr("وحدة المعالجة", "CPU")}</span>
                    <Badge variant="default">{tr("طبيعي", "Normal")}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{tr("الذاكرة", "Memory")}</span>
                    <Badge variant="default">{tr("طبيعي", "Normal")}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{tr("التخزين", "Storage")}</span>
                    <Badge variant="default">{tr("طبيعي", "Normal")}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  {tr("قاعدة البيانات", "Database")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{tr("الحالة", "Status")}</span>
                    <Badge variant="default">{tr("متصل", "Connected")}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{tr("الاتصالات", "Connections")}</span>
                    <span>5 / 100</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  {tr("خدمات AI", "AI Services")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">OpenAI</span>
                    <Badge variant="default">{tr("نشط", "Active")}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Anthropic</span>
                    <Badge variant="default">{tr("نشط", "Active")}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>{tr("إعدادات النظام", "System Settings")}</CardTitle>
              <CardDescription>
                {tr("تكوين إعدادات المنصة الأساسية", "Configure core platform settings")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>{tr("تفعيل التسجيل", "Enable Registration")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {tr("السماح للمستخدمين الجدد بالتسجيل", "Allow new users to register")}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>{tr("وضع الصيانة", "Maintenance Mode")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {tr("تعطيل الوصول للمستخدمين مؤقتاً", "Temporarily disable user access")}
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>{tr("إشعارات البريد", "Email Notifications")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {tr("إرسال إشعارات بريدية للأحداث", "Send email notifications for events")}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={activateDialog} onOpenChange={setActivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tr("تفعيل اشتراك", "Activate Subscription")}</DialogTitle>
            <DialogDescription>
              {tr("تفعيل خطة اشتراك للمستخدم", "Activate a subscription plan for user")}: {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{tr("الخطة", "Plan")}</Label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger data-testid="select-plan">
                  <SelectValue placeholder={tr("اختر خطة", "Select a plan")} />
                </SelectTrigger>
                <SelectContent>
                  {plans?.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {language === "ar" ? plan.nameAr : plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{tr("دورة الفوترة", "Billing Cycle")}</Label>
              <Select value={billingCycle} onValueChange={setBillingCycle}>
                <SelectTrigger data-testid="select-billing">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">{tr("شهري", "Monthly")}</SelectItem>
                  <SelectItem value="quarterly">{tr("ربع سنوي", "Quarterly")}</SelectItem>
                  <SelectItem value="semi_annual">{tr("نصف سنوي", "Semi-Annual")}</SelectItem>
                  <SelectItem value="yearly">{tr("سنوي", "Yearly")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActivateDialog(false)}>
              {tr("إلغاء", "Cancel")}
            </Button>
            <Button
              onClick={() => {
                if (selectedUser && selectedPlan) {
                  activateMutation.mutate({
                    userId: selectedUser.id,
                    planId: selectedPlan,
                    billingCycle,
                  });
                }
              }}
              disabled={!selectedPlan || activateMutation.isPending}
              data-testid="button-confirm-activate"
            >
              {activateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : tr("تفعيل", "Activate")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
