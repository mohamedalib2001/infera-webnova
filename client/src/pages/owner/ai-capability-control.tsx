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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Brain, 
  Shield, 
  AlertTriangle, 
  Settings, 
  RefreshCw,
  Bot,
  Lock,
  Unlock,
  Code,
  FileCode,
  Database,
  Globe,
  Server,
  Users,
  Sparkles,
  ShieldAlert,
  Rocket,
  Terminal,
  RotateCcw,
  Check,
  X,
  Cpu,
  Zap,
  Eye,
  History
} from "lucide-react";

interface AiCapability {
  id: string;
  assistantId: string;
  capabilityCode: string;
  isEnabled: boolean;
  modifiedBy?: string;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

interface SovereignAssistant {
  id: string;
  name: string;
  nameAr: string;
  type: string;
  isActive: boolean;
  isAutonomous: boolean;
  avatar?: string;
}

const AI_CAPABILITY_CATEGORIES = {
  code: {
    name: "Code Operations",
    nameAr: "عمليات الكود",
    icon: Code,
    description: "Control code generation, editing, and analysis capabilities",
    descriptionAr: "التحكم في قدرات توليد وتحرير وتحليل الكود",
    capabilities: [
      { code: "CODE_GENERATE", name: "Generate Code", nameAr: "توليد الكود", description: "Create new code files and snippets" },
      { code: "CODE_EDIT", name: "Edit Code", nameAr: "تحرير الكود", description: "Modify existing code files" },
      { code: "CODE_DELETE", name: "Delete Code", nameAr: "حذف الكود", description: "Remove code files or sections" },
      { code: "CODE_REFACTOR", name: "Refactor Code", nameAr: "إعادة هيكلة الكود", description: "Restructure and optimize existing code" },
      { code: "CODE_ANALYZE", name: "Analyze Code", nameAr: "تحليل الكود", description: "Review and analyze code for issues" },
    ]
  },
  file: {
    name: "File Operations",
    nameAr: "عمليات الملفات",
    icon: FileCode,
    description: "Control file system access and operations",
    descriptionAr: "التحكم في الوصول إلى نظام الملفات والعمليات",
    capabilities: [
      { code: "FILE_READ", name: "Read Files", nameAr: "قراءة الملفات", description: "Read file contents from the system" },
      { code: "FILE_WRITE", name: "Write Files", nameAr: "كتابة الملفات", description: "Create and write to files" },
      { code: "FILE_DELETE", name: "Delete Files", nameAr: "حذف الملفات", description: "Remove files from the system" },
      { code: "FILE_MOVE", name: "Move Files", nameAr: "نقل الملفات", description: "Move or rename files" },
    ]
  },
  api: {
    name: "API Operations",
    nameAr: "عمليات API",
    icon: Globe,
    description: "Control external API access and communication",
    descriptionAr: "التحكم في الوصول إلى واجهات برمجة التطبيقات الخارجية",
    capabilities: [
      { code: "API_CALL_INTERNAL", name: "Internal API Calls", nameAr: "مكالمات API الداخلية", description: "Make calls to internal platform APIs" },
      { code: "API_CALL_EXTERNAL", name: "External API Calls", nameAr: "مكالمات API الخارجية", description: "Make calls to third-party APIs" },
      { code: "WEBHOOK_SEND", name: "Send Webhooks", nameAr: "إرسال Webhooks", description: "Trigger webhook notifications" },
    ]
  },
  database: {
    name: "Database Operations",
    nameAr: "عمليات قاعدة البيانات",
    icon: Database,
    description: "Control database access and modifications",
    descriptionAr: "التحكم في الوصول إلى قاعدة البيانات والتعديلات",
    capabilities: [
      { code: "DB_READ", name: "Read Database", nameAr: "قراءة قاعدة البيانات", description: "Query and read database records" },
      { code: "DB_WRITE", name: "Write Database", nameAr: "كتابة قاعدة البيانات", description: "Insert or update database records" },
      { code: "DB_DELETE", name: "Delete Database Records", nameAr: "حذف سجلات قاعدة البيانات", description: "Remove database records" },
      { code: "DB_SCHEMA_MODIFY", name: "Modify Schema", nameAr: "تعديل المخطط", description: "Alter database schema and structure" },
    ]
  },
  deployment: {
    name: "Deployment Operations",
    nameAr: "عمليات النشر",
    icon: Rocket,
    description: "Control deployment and release capabilities",
    descriptionAr: "التحكم في قدرات النشر والإصدار",
    capabilities: [
      { code: "DEPLOY_PREVIEW", name: "Deploy Preview", nameAr: "نشر معاينة", description: "Deploy to preview/staging environments" },
      { code: "DEPLOY_PRODUCTION", name: "Deploy Production", nameAr: "نشر الإنتاج", description: "Deploy to production environment" },
      { code: "ROLLBACK", name: "Rollback Deployment", nameAr: "التراجع عن النشر", description: "Revert to previous deployments" },
    ]
  },
  system: {
    name: "System Operations",
    nameAr: "عمليات النظام",
    icon: Server,
    description: "Control system-level operations and configuration",
    descriptionAr: "التحكم في عمليات مستوى النظام والتكوين",
    capabilities: [
      { code: "SYSTEM_CONFIG_READ", name: "Read System Config", nameAr: "قراءة تكوين النظام", description: "View system configuration" },
      { code: "SYSTEM_CONFIG_MODIFY", name: "Modify System Config", nameAr: "تعديل تكوين النظام", description: "Change system settings" },
      { code: "SYSTEM_RESTART", name: "Restart Services", nameAr: "إعادة تشغيل الخدمات", description: "Restart system services" },
      { code: "TERMINAL_EXECUTE", name: "Execute Terminal Commands", nameAr: "تنفيذ أوامر الطرفية", description: "Run terminal/shell commands" },
    ]
  },
  user: {
    name: "User Management",
    nameAr: "إدارة المستخدمين",
    icon: Users,
    description: "Control user-related operations",
    descriptionAr: "التحكم في العمليات المتعلقة بالمستخدمين",
    capabilities: [
      { code: "USER_READ", name: "Read User Data", nameAr: "قراءة بيانات المستخدم", description: "Access user information" },
      { code: "USER_MODIFY", name: "Modify User Data", nameAr: "تعديل بيانات المستخدم", description: "Update user information" },
      { code: "USER_CREATE", name: "Create Users", nameAr: "إنشاء مستخدمين", description: "Create new user accounts" },
      { code: "USER_DELETE", name: "Delete Users", nameAr: "حذف مستخدمين", description: "Remove user accounts" },
    ]
  },
  ai: {
    name: "AI Operations",
    nameAr: "عمليات الذكاء الاصطناعي",
    icon: Sparkles,
    description: "Control AI-related capabilities and autonomy",
    descriptionAr: "التحكم في القدرات المتعلقة بالذكاء الاصطناعي والاستقلالية",
    capabilities: [
      { code: "AI_MODEL_SWITCH", name: "Switch AI Models", nameAr: "تبديل نماذج AI", description: "Change between different AI models" },
      { code: "AI_AUTONOMOUS_ACTION", name: "Autonomous Actions", nameAr: "الإجراءات المستقلة", description: "Perform actions without human approval" },
      { code: "AI_CHAIN_COMMANDS", name: "Chain Commands", nameAr: "سلسلة الأوامر", description: "Execute multiple commands in sequence" },
      { code: "AI_SPAWN_AGENTS", name: "Spawn Sub-agents", nameAr: "إنشاء وكلاء فرعيين", description: "Create and delegate to sub-agents" },
    ]
  },
  security: {
    name: "Security Operations",
    nameAr: "عمليات الأمان",
    icon: ShieldAlert,
    description: "Control security-sensitive operations",
    descriptionAr: "التحكم في العمليات الحساسة للأمان",
    capabilities: [
      { code: "SECURITY_AUDIT", name: "Security Auditing", nameAr: "التدقيق الأمني", description: "Access security audit logs" },
      { code: "SECURITY_CONFIG", name: "Security Configuration", nameAr: "تكوين الأمان", description: "Modify security settings" },
      { code: "SECRET_ACCESS", name: "Access Secrets", nameAr: "الوصول للأسرار", description: "Read encrypted secrets and keys" },
      { code: "PERMISSION_MODIFY", name: "Modify Permissions", nameAr: "تعديل الصلاحيات", description: "Change user/role permissions" },
    ]
  },
};

export default function OwnerAICapabilityControl() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedAssistant, setSelectedAssistant] = useState<string>("all");
  const [showReasonDialog, setShowReasonDialog] = useState(false);
  const [pendingChange, setPendingChange] = useState<{
    assistantId: string;
    capabilityCode: string;
    isEnabled: boolean;
  } | null>(null);
  const [reason, setReason] = useState("");

  const { data: assistantsData, isLoading: assistantsLoading } = useQuery({
    queryKey: ["/api/owner/sovereign-assistants"],
  });

  const { data: capabilitiesData, isLoading: capabilitiesLoading, refetch: refetchCapabilities } = useQuery({
    queryKey: ["/api/owner/ai-assistant-capabilities"],
  });

  const setCapabilityMutation = useMutation({
    mutationFn: async (data: { assistantId: string; capabilityCode: string; isEnabled: boolean; reason?: string }) => {
      return apiRequest("POST", "/api/owner/ai-assistant-capabilities", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/ai-assistant-capabilities"] });
      setShowReasonDialog(false);
      setPendingChange(null);
      setReason("");
      toast({ 
        title: "تم تحديث القدرة / Capability Updated", 
        description: "تم تحديث قدرة المساعد بنجاح / Assistant capability updated successfully" 
      });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const resetCapabilitiesMutation = useMutation({
    mutationFn: async (assistantId: string) => {
      return apiRequest("DELETE", `/api/owner/ai-assistant-capabilities/reset/${assistantId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/ai-assistant-capabilities"] });
      toast({ 
        title: "تم إعادة التعيين / Reset Complete", 
        description: "تم إعادة جميع القدرات للإعدادات الافتراضية / All capabilities reset to defaults" 
      });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const assistants: SovereignAssistant[] = Array.isArray(assistantsData) ? assistantsData : [];
  const capabilities: AiCapability[] = capabilitiesData?.capabilities || [];

  const getCapabilityStatus = (assistantId: string, capabilityCode: string): boolean => {
    const override = capabilities.find(
      c => c.assistantId === assistantId && c.capabilityCode === capabilityCode
    );
    return override ? override.isEnabled : true;
  };

  const handleCapabilityToggle = (assistantId: string, capabilityCode: string, newValue: boolean) => {
    setPendingChange({ assistantId, capabilityCode, isEnabled: newValue });
    setShowReasonDialog(true);
  };

  const confirmCapabilityChange = () => {
    if (pendingChange) {
      setCapabilityMutation.mutate({
        ...pendingChange,
        reason: reason || undefined,
      });
    }
  };

  const getAssistantIcon = (type: string) => {
    const icons: Record<string, any> = {
      ai_governor: Brain,
      platform_architect: Server,
      operations_commander: Shield,
      security_guardian: Lock,
      growth_strategist: Zap,
    };
    return icons[type] || Bot;
  };

  const getDisabledCapabilitiesCount = (assistantId: string): number => {
    return capabilities.filter(c => c.assistantId === assistantId && !c.isEnabled).length;
  };

  const getTotalCapabilitiesCount = (): number => {
    return Object.values(AI_CAPABILITY_CATEGORIES).reduce(
      (sum, cat) => sum + cat.capabilities.length, 0
    );
  };

  if (assistantsLoading || capabilitiesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" data-testid="loading-spinner">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="ai-capability-control-page">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="page-title">
            <Cpu className="w-8 h-8 text-primary" />
            لوحة التحكم في قدرات المساعدين AI
          </h1>
          <p className="text-muted-foreground mt-1">
            AI Assistant Capability Control Panel
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => refetchCapabilities()}
          data-testid="button-refresh"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          تحديث / Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card data-testid="card-total-assistants">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{assistants.length}</p>
                <p className="text-sm text-muted-foreground">المساعدين / Assistants</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card data-testid="card-total-capabilities">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Settings className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{getTotalCapabilitiesCount()}</p>
                <p className="text-sm text-muted-foreground">القدرات / Capabilities</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card data-testid="card-disabled-capabilities">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-amber-500/10">
                <Lock className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {capabilities.filter(c => !c.isEnabled).length}
                </p>
                <p className="text-sm text-muted-foreground">معطلة / Disabled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card data-testid="card-categories">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-500/10">
                <Check className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Object.keys(AI_CAPABILITY_CATEGORIES).length}</p>
                <p className="text-sm text-muted-foreground">الفئات / Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" data-testid="tab-overview">
            <Eye className="w-4 h-4 mr-2" />
            نظرة عامة / Overview
          </TabsTrigger>
          <TabsTrigger value="by-assistant" data-testid="tab-by-assistant">
            <Bot className="w-4 h-4 mr-2" />
            حسب المساعد / By Assistant
          </TabsTrigger>
          <TabsTrigger value="by-category" data-testid="tab-by-category">
            <Settings className="w-4 h-4 mr-2" />
            حسب الفئة / By Category
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                ملخص التحكم في القدرات / Capability Control Summary
              </CardTitle>
              <CardDescription>
                نظرة عامة سريعة على حالة قدرات جميع المساعدين
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assistants.map((assistant) => {
                  const IconComponent = getAssistantIcon(assistant.type);
                  const disabledCount = getDisabledCapabilitiesCount(assistant.id);
                  return (
                    <div 
                      key={assistant.id} 
                      className="flex items-center justify-between p-4 border rounded-lg"
                      data-testid={`assistant-summary-${assistant.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium">{assistant.name}</p>
                          <p className="text-sm text-muted-foreground">{assistant.nameAr}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {disabledCount > 0 ? (
                          <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">
                            <Lock className="w-3 h-3 mr-1" />
                            {disabledCount} معطلة / disabled
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                            <Unlock className="w-3 h-3 mr-1" />
                            جميع القدرات مفعلة / All enabled
                          </Badge>
                        )}
                        <Badge variant={assistant.isActive ? "default" : "outline"}>
                          {assistant.isActive ? "نشط / Active" : "غير نشط / Inactive"}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-assistant" className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <Label>اختر المساعد / Select Assistant:</Label>
            <Select value={selectedAssistant} onValueChange={setSelectedAssistant}>
              <SelectTrigger className="w-64" data-testid="select-assistant">
                <SelectValue placeholder="اختر مساعد..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المساعدين / All Assistants</SelectItem>
                {assistants.map((assistant) => (
                  <SelectItem key={assistant.id} value={assistant.id}>
                    {assistant.name} - {assistant.nameAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedAssistant !== "all" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" data-testid="button-reset-capabilities">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    إعادة التعيين / Reset
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>إعادة تعيين جميع القدرات؟</AlertDialogTitle>
                    <AlertDialogDescription>
                      سيؤدي هذا إلى إعادة جميع قدرات هذا المساعد إلى الإعدادات الافتراضية (جميعها مفعلة).
                      <br />
                      This will reset all capabilities for this assistant to defaults (all enabled).
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>إلغاء / Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => resetCapabilitiesMutation.mutate(selectedAssistant)}
                      data-testid="button-confirm-reset"
                    >
                      تأكيد / Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {Object.entries(AI_CAPABILITY_CATEGORIES).map(([key, category]) => {
                const CategoryIcon = category.icon;
                return (
                  <Card key={key} data-testid={`category-card-${key}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CategoryIcon className="w-5 h-5" />
                        {category.name}
                        <span className="text-muted-foreground font-normal">/ {category.nameAr}</span>
                      </CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {category.capabilities.map((capability) => {
                          const filteredAssistants = selectedAssistant === "all" 
                            ? assistants 
                            : assistants.filter(a => a.id === selectedAssistant);
                          
                          return (
                            <div key={capability.code} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-sm">{capability.name}</p>
                                  <p className="text-xs text-muted-foreground">{capability.nameAr}</p>
                                </div>
                              </div>
                              <div className="grid gap-2">
                                {filteredAssistants.map((assistant) => {
                                  const isEnabled = getCapabilityStatus(assistant.id, capability.code);
                                  const IconComponent = getAssistantIcon(assistant.type);
                                  return (
                                    <div 
                                      key={`${assistant.id}-${capability.code}`}
                                      className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                                      data-testid={`capability-toggle-${assistant.id}-${capability.code}`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <IconComponent className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm">{assistant.name}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {isEnabled ? (
                                          <Badge variant="outline" className="text-green-600 border-green-600/20">
                                            <Check className="w-3 h-3 mr-1" />
                                            مفعل
                                          </Badge>
                                        ) : (
                                          <Badge variant="outline" className="text-red-600 border-red-600/20">
                                            <X className="w-3 h-3 mr-1" />
                                            معطل
                                          </Badge>
                                        )}
                                        <Switch
                                          checked={isEnabled}
                                          onCheckedChange={(checked) => 
                                            handleCapabilityToggle(assistant.id, capability.code, checked)
                                          }
                                          data-testid={`switch-${assistant.id}-${capability.code}`}
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="by-category" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(AI_CAPABILITY_CATEGORIES).map(([key, category]) => {
              const CategoryIcon = category.icon;
              const totalInCategory = category.capabilities.length * assistants.length;
              const disabledInCategory = capabilities.filter(
                c => category.capabilities.some(cap => cap.code === c.capabilityCode) && !c.isEnabled
              ).length;
              
              return (
                <Card key={key} className="hover-elevate cursor-pointer" data-testid={`category-summary-${key}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <CategoryIcon className="w-5 h-5 text-primary" />
                      </div>
                      {category.name}
                    </CardTitle>
                    <CardDescription>{category.nameAr}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{category.capabilities.length} قدرات</span>
                      {disabledInCategory > 0 ? (
                        <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">
                          <Lock className="w-3 h-3 mr-1" />
                          {disabledInCategory} معطلة
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                          <Check className="w-3 h-3 mr-1" />
                          جميعها مفعلة
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showReasonDialog} onOpenChange={setShowReasonDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingChange?.isEnabled ? "تفعيل القدرة / Enable Capability" : "تعطيل القدرة / Disable Capability"}
            </DialogTitle>
            <DialogDescription>
              {pendingChange?.isEnabled 
                ? "أنت على وشك تفعيل هذه القدرة للمساعد. / You are about to enable this capability for the assistant."
                : "أنت على وشك تعطيل هذه القدرة للمساعد. لن يتمكن المساعد من استخدام هذه الميزة. / You are about to disable this capability. The assistant will not be able to use this feature."
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="reason">السبب (اختياري) / Reason (Optional)</Label>
              <Textarea
                id="reason"
                placeholder="أدخل سبب التغيير... / Enter reason for change..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-2"
                data-testid="input-reason"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReasonDialog(false)} data-testid="button-cancel">
              إلغاء / Cancel
            </Button>
            <Button 
              onClick={confirmCapabilityChange} 
              disabled={setCapabilityMutation.isPending}
              data-testid="button-confirm-change"
            >
              {setCapabilityMutation.isPending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : pendingChange?.isEnabled ? (
                <Unlock className="w-4 h-4 mr-2" />
              ) : (
                <Lock className="w-4 h-4 mr-2" />
              )}
              تأكيد / Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
