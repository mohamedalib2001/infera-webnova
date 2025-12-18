import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Brain, 
  Layers, 
  Zap, 
  Shield, 
  AlertTriangle, 
  Power, 
  Settings, 
  Users, 
  Activity, 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  RefreshCw,
  Bot,
  Server,
  Lock,
  Unlock,
  History,
  Scale
} from "lucide-react";

export default function OwnerAISovereignty() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showAddLayerDialog, setShowAddLayerDialog] = useState(false);
  const [showAddProviderDialog, setShowAddProviderDialog] = useState(false);
  const [newLayer, setNewLayer] = useState({
    name: "",
    nameAr: "",
    purpose: "",
    purposeAr: "",
    type: "INTERNAL_SOVEREIGN",
    priority: 5,
    allowedForSubscribers: false,
    subscriberVisibility: "hidden"
  });
  const [newProvider, setNewProvider] = useState({
    name: "",
    nameAr: "",
    provider: "openai",
    apiEndpoint: "",
    apiKeySecretName: "",
    allowedForSubscribers: false,
    requiresOwnerApproval: true,
    rateLimit: 100,
    monthlyBudget: 0
  });

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ["/api/owner/ai-sovereignty/dashboard"],
  });

  const { data: auditLogsData, isLoading: auditLoading } = useQuery({
    queryKey: ["/api/owner/ai-sovereignty/audit-logs"],
  });

  const { data: subscriberLimitsData } = useQuery({
    queryKey: ["/api/owner/ai-sovereignty/subscriber-limits"],
  });

  const createLayerMutation = useMutation({
    mutationFn: async (data: typeof newLayer) => {
      return apiRequest("POST", "/api/owner/ai-sovereignty/layers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/ai-sovereignty/dashboard"] });
      setShowAddLayerDialog(false);
      setNewLayer({
        name: "",
        nameAr: "",
        purpose: "",
        purposeAr: "",
        type: "INTERNAL_SOVEREIGN",
        priority: 5,
        allowedForSubscribers: false,
        subscriberVisibility: "hidden"
      });
      toast({ title: "Layer Created", description: "AI layer created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const createProviderMutation = useMutation({
    mutationFn: async (data: typeof newProvider) => {
      return apiRequest("POST", "/api/owner/ai-sovereignty/external-providers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/ai-sovereignty/dashboard"] });
      setShowAddProviderDialog(false);
      toast({ title: "Provider Added", description: "External AI provider added successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const activateKillSwitchMutation = useMutation({
    mutationFn: async (data: { scope: string; reason: string; targetLayerId?: string }) => {
      return apiRequest("POST", "/api/owner/ai-sovereignty/kill-switch/activate", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/ai-sovereignty/dashboard"] });
      toast({ 
        title: "Kill Switch Activated", 
        description: "AI systems have been stopped",
        variant: "destructive"
      });
    }
  });

  const deactivateKillSwitchMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/owner/ai-sovereignty/kill-switch/deactivate", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/ai-sovereignty/dashboard"] });
      toast({ title: "Kill Switch Deactivated", description: "AI systems resumed" });
    }
  });

  const dashboard = dashboardData?.data;
  const auditLogs = auditLogsData?.data || [];
  const subscriberLimits = subscriberLimitsData?.data || [];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      suspended: "secondary",
      disabled: "outline",
      emergency_stopped: "destructive"
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      INTERNAL_SOVEREIGN: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      EXTERNAL_MANAGED: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      HYBRID: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      SUBSCRIBER_RESTRICTED: "bg-red-500/10 text-red-500 border-red-500/20"
    };
    return <Badge className={colors[type] || ""} variant="outline">{type.replace(/_/g, " ")}</Badge>;
  };

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">سيادة الذكاء الاصطناعي</h1>
            <p className="text-muted-foreground text-sm">التحكم الكامل في طبقات ومزودي الذكاء</p>
          </div>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant={dashboard?.killSwitchActive ? "default" : "destructive"} 
              size="lg"
              className="gap-2"
              data-testid="button-kill-switch"
            >
              {dashboard?.killSwitchActive ? (
                <>
                  <Unlock className="w-5 h-5" />
                  إعادة التشغيل
                </>
              ) : (
                <>
                  <Power className="w-5 h-5" />
                  زر الطوارئ
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                {dashboard?.killSwitchActive ? "إعادة تشغيل الذكاء" : "تفعيل زر الطوارئ"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {dashboard?.killSwitchActive 
                  ? "سيتم إعادة تشغيل جميع أنظمة الذكاء الاصطناعي. هل أنت متأكد؟"
                  : "سيتم إيقاف جميع أنظمة الذكاء الاصطناعي فوراً. هذا الإجراء للطوارئ فقط."
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (dashboard?.killSwitchActive) {
                    deactivateKillSwitchMutation.mutate();
                  } else {
                    activateKillSwitchMutation.mutate({ 
                      scope: "global", 
                      reason: "Emergency stop by owner" 
                    });
                  }
                }}
                className={dashboard?.killSwitchActive ? "" : "bg-destructive hover:bg-destructive/90"}
              >
                {dashboard?.killSwitchActive ? "إعادة التشغيل" : "إيقاف الآن"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Layers className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{dashboard?.activeLayers || 0}/{dashboard?.totalLayers || 0}</p>
                <p className="text-sm text-muted-foreground">طبقات نشطة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/10">
                <Server className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{dashboard?.activeProviders || 0}/{dashboard?.totalProviders || 0}</p>
                <p className="text-sm text-muted-foreground">مزودين خارجيين</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <Bot className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{dashboard?.activeAgents || 0}/{dashboard?.totalAgents || 0}</p>
                <p className="text-sm text-muted-foreground">وكلاء نشطين</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${dashboard?.killSwitchActive ? "bg-red-500/10" : "bg-green-500/10"}`}>
                <Shield className={`w-6 h-6 ${dashboard?.killSwitchActive ? "text-red-500" : "text-green-500"}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{dashboard?.killSwitchActive ? "متوقف" : "يعمل"}</p>
                <p className="text-sm text-muted-foreground">حالة النظام</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="dashboard" className="gap-2" data-testid="tab-dashboard">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">لوحة التحكم</span>
          </TabsTrigger>
          <TabsTrigger value="layers" className="gap-2" data-testid="tab-layers">
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">الطبقات</span>
          </TabsTrigger>
          <TabsTrigger value="providers" className="gap-2" data-testid="tab-providers">
            <Server className="w-4 h-4" />
            <span className="hidden sm:inline">المزودين</span>
          </TabsTrigger>
          <TabsTrigger value="limits" className="gap-2" data-testid="tab-limits">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">حدود المشتركين</span>
          </TabsTrigger>
          <TabsTrigger value="constitution" className="gap-2" data-testid="tab-constitution">
            <Scale className="w-4 h-4" />
            <span className="hidden sm:inline">الدستور</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2" data-testid="tab-audit">
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">السجل</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  طبقات الذكاء
                </CardTitle>
                <CardDescription>جميع طبقات الذكاء المسجلة</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {(dashboard?.layers || []).map((layer: any) => (
                      <div key={layer.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="space-y-1">
                          <p className="font-medium">{layer.nameAr || layer.name}</p>
                          <div className="flex items-center gap-2">
                            {getTypeBadge(layer.type)}
                            {getStatusBadge(layer.status)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">قوة: {layer.priority}</Badge>
                          {layer.allowedForSubscribers ? (
                            <Eye className="w-4 h-4 text-green-500" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    ))}
                    {(!dashboard?.layers || dashboard.layers.length === 0) && (
                      <p className="text-center text-muted-foreground py-8">لا توجد طبقات</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  المزودين الخارجيين
                </CardTitle>
                <CardDescription>مزودي الذكاء المرتبطين</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {(dashboard?.providers || []).map((provider: any) => (
                      <div key={provider.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="space-y-1">
                          <p className="font-medium">{provider.nameAr || provider.name}</p>
                          <Badge variant="outline">{provider.provider}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={provider.isActive ? "default" : "secondary"}>
                            {provider.isActive ? "نشط" : "معطل"}
                          </Badge>
                          {provider.requiresOwnerApproval && <Lock className="w-4 h-4 text-amber-500" />}
                        </div>
                      </div>
                    ))}
                    {(!dashboard?.providers || dashboard.providers.length === 0) && (
                      <p className="text-center text-muted-foreground py-8">لا يوجد مزودين</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="layers" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">إدارة طبقات الذكاء</h2>
            <Dialog open={showAddLayerDialog} onOpenChange={setShowAddLayerDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2" data-testid="button-add-layer">
                  <Plus className="w-4 h-4" />
                  إضافة طبقة
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg" dir="rtl">
                <DialogHeader>
                  <DialogTitle>إضافة طبقة ذكاء جديدة</DialogTitle>
                  <DialogDescription>أنشئ طبقة جديدة للتحكم في الذكاء</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>الاسم (إنجليزي)</Label>
                      <Input
                        value={newLayer.name}
                        onChange={(e) => setNewLayer({ ...newLayer, name: e.target.value })}
                        placeholder="Layer Name"
                        data-testid="input-layer-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>الاسم (عربي)</Label>
                      <Input
                        value={newLayer.nameAr}
                        onChange={(e) => setNewLayer({ ...newLayer, nameAr: e.target.value })}
                        placeholder="اسم الطبقة"
                        data-testid="input-layer-name-ar"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>الغرض</Label>
                    <Textarea
                      value={newLayer.purpose}
                      onChange={(e) => setNewLayer({ ...newLayer, purpose: e.target.value })}
                      placeholder="Purpose of this layer..."
                      data-testid="input-layer-purpose"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>النوع</Label>
                    <Select
                      value={newLayer.type}
                      onValueChange={(value) => setNewLayer({ ...newLayer, type: value })}
                    >
                      <SelectTrigger data-testid="select-layer-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INTERNAL_SOVEREIGN">سيادي داخلي</SelectItem>
                        <SelectItem value="EXTERNAL_MANAGED">خارجي مُدار</SelectItem>
                        <SelectItem value="HYBRID">هجين</SelectItem>
                        <SelectItem value="SUBSCRIBER_RESTRICTED">مقيد للمشتركين</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>الأولوية: {newLayer.priority}</Label>
                    <Slider
                      value={[newLayer.priority]}
                      onValueChange={([value]) => setNewLayer({ ...newLayer, priority: value })}
                      min={1}
                      max={10}
                      step={1}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>متاح للمشتركين</Label>
                    <Switch
                      checked={newLayer.allowedForSubscribers}
                      onCheckedChange={(checked) => setNewLayer({ ...newLayer, allowedForSubscribers: checked })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddLayerDialog(false)}>
                    إلغاء
                  </Button>
                  <Button 
                    onClick={() => createLayerMutation.mutate(newLayer)}
                    disabled={createLayerMutation.isPending || !newLayer.name || !newLayer.purpose}
                    data-testid="button-save-layer"
                  >
                    {createLayerMutation.isPending ? "جاري الإنشاء..." : "إنشاء"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {(dashboard?.layers || []).map((layer: any) => (
              <Card key={layer.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{layer.nameAr || layer.name}</h3>
                        {getTypeBadge(layer.type)}
                        {getStatusBadge(layer.status)}
                      </div>
                      <p className="text-muted-foreground">{layer.purposeAr || layer.purpose}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Zap className="w-4 h-4" />
                          قوة: {layer.priority}/10
                        </span>
                        <span className="flex items-center gap-1">
                          {layer.allowedForSubscribers ? (
                            <>
                              <Eye className="w-4 h-4 text-green-500" />
                              متاح للمشتركين
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-4 h-4" />
                              للمالك فقط
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">المزودين الخارجيين</h2>
            <Dialog open={showAddProviderDialog} onOpenChange={setShowAddProviderDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2" data-testid="button-add-provider">
                  <Plus className="w-4 h-4" />
                  إضافة مزود
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg" dir="rtl">
                <DialogHeader>
                  <DialogTitle>إضافة مزود ذكاء خارجي</DialogTitle>
                  <DialogDescription>اربط مزود ذكاء خارجي جديد</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>الاسم</Label>
                      <Input
                        value={newProvider.name}
                        onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
                        placeholder="Provider Name"
                        data-testid="input-provider-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>المزود</Label>
                      <Select
                        value={newProvider.provider}
                        onValueChange={(value) => setNewProvider({ ...newProvider, provider: value })}
                      >
                        <SelectTrigger data-testid="select-provider-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="openai">OpenAI</SelectItem>
                          <SelectItem value="anthropic">Anthropic</SelectItem>
                          <SelectItem value="google">Google AI</SelectItem>
                          <SelectItem value="azure">Azure OpenAI</SelectItem>
                          <SelectItem value="custom">مخصص</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>اسم السر (API Key Secret)</Label>
                    <Input
                      value={newProvider.apiKeySecretName}
                      onChange={(e) => setNewProvider({ ...newProvider, apiKeySecretName: e.target.value })}
                      placeholder="SECRET_NAME"
                      data-testid="input-provider-secret"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>حد الطلبات/دقيقة</Label>
                      <Input
                        type="number"
                        value={newProvider.rateLimit}
                        onChange={(e) => setNewProvider({ ...newProvider, rateLimit: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>الميزانية الشهرية ($)</Label>
                      <Input
                        type="number"
                        value={newProvider.monthlyBudget}
                        onChange={(e) => setNewProvider({ ...newProvider, monthlyBudget: parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>يتطلب موافقة المالك</Label>
                    <Switch
                      checked={newProvider.requiresOwnerApproval}
                      onCheckedChange={(checked) => setNewProvider({ ...newProvider, requiresOwnerApproval: checked })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddProviderDialog(false)}>
                    إلغاء
                  </Button>
                  <Button 
                    onClick={() => createProviderMutation.mutate(newProvider)}
                    disabled={createProviderMutation.isPending || !newProvider.name}
                    data-testid="button-save-provider"
                  >
                    {createProviderMutation.isPending ? "جاري الإضافة..." : "إضافة"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {(dashboard?.providers || []).map((provider: any) => (
              <Card key={provider.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{provider.nameAr || provider.name}</h3>
                        <Badge variant="outline">{provider.provider}</Badge>
                        <Badge variant={provider.isActive ? "default" : "secondary"}>
                          {provider.isActive ? "نشط" : "معطل"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>حد: {provider.rateLimit} طلب/دقيقة</span>
                        {provider.monthlyBudget > 0 && (
                          <span>ميزانية: ${provider.monthlyBudget}</span>
                        )}
                        {provider.requiresOwnerApproval && (
                          <span className="flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            يتطلب موافقة
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={provider.isActive} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {(!dashboard?.providers || dashboard.providers.length === 0) && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Server className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">لا يوجد مزودين خارجيين</p>
                  <Button className="mt-4" onClick={() => setShowAddProviderDialog(true)}>
                    إضافة مزود
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="limits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                حدود المشتركين للذكاء
              </CardTitle>
              <CardDescription>تحديد ما يمكن لكل فئة من المشتركين الوصول إليه</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["free", "basic", "pro", "enterprise", "sovereign"].map((role) => {
                  const limit = subscriberLimits.find((l: any) => l.role === role);
                  return (
                    <div key={role} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="space-y-1">
                        <Badge>{role.toUpperCase()}</Badge>
                        <p className="text-sm text-muted-foreground">
                          {limit ? `قوة: ${limit.maxPowerLevel}, طلبات/يوم: ${limit.maxRequestsPerDay}` : "غير محدد"}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">تعديل</Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="constitution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5" />
                دستور الذكاء الاصطناعي
              </CardTitle>
              <CardDescription>القواعد والحدود الأساسية التي تحكم سلوك الذكاء</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">الإصدار الحالي</h3>
                    <p className="text-sm text-muted-foreground">{dashboard?.constitution?.version || "1.0.0"}</p>
                  </div>
                  <Badge variant={dashboard?.constitution?.isActive ? "default" : "outline"}>
                    {dashboard?.constitution?.isActive ? "نشط" : "مسودة"}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">القواعد الأساسية</h4>
                    <div className="space-y-2">
                      {(dashboard?.constitution?.rules || []).map((rule: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded border">
                          <span>{rule.nameAr || rule.name}</span>
                          <Badge variant="outline">{rule.type}</Badge>
                        </div>
                      ))}
                      {(!dashboard?.constitution?.rules || dashboard.constitution.rules.length === 0) && (
                        <p className="text-muted-foreground text-sm">لا توجد قواعد محددة</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">الحدود العامة</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-2 rounded border">
                        <span className="text-muted-foreground">أقصى قوة:</span>
                        <span className="font-medium mr-2">{dashboard?.constitution?.globalLimits?.maxPowerLevel || 10}</span>
                      </div>
                      <div className="p-2 rounded border">
                        <span className="text-muted-foreground">أقصى ذكاء متزامن:</span>
                        <span className="font-medium mr-2">{dashboard?.constitution?.globalLimits?.maxConcurrentAI || 10}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Button className="gap-2">
                <Edit className="w-4 h-4" />
                تعديل الدستور
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                سجل سيادة الذكاء
              </CardTitle>
              <CardDescription>سجل غير قابل للتعديل لجميع الإجراءات</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {auditLogs.map((log: any) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border">
                      <div className={`p-2 rounded ${log.isEmergency ? "bg-red-500/10" : "bg-muted"}`}>
                        {log.isEmergency ? (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{log.action}</span>
                          <Badge variant="outline" className="text-xs">{log.resourceType}</Badge>
                          {log.isViolation && <Badge variant="destructive" className="text-xs">تجاوز</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(log.timestamp || log.createdAt).toLocaleString("ar-SA")}
                        </p>
                      </div>
                    </div>
                  ))}
                  {auditLogs.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">لا توجد سجلات</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
