import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, Scale, Gavel, Shield, CheckCircle2, XCircle,
  Clock, AlertTriangle, Plus, Settings, Eye, Lock,
  Play, Pause, RefreshCw, Edit, Trash2, Copy,
  Brain, Lightbulb, Target, Activity, Crown, Radio,
  ArrowUpRight, Timer, Sparkles, Workflow, Layers
} from "lucide-react";

interface Policy {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: 'security' | 'access' | 'data' | 'resource' | 'compliance';
  status: 'draft' | 'pending_approval' | 'active' | 'enforcing' | 'suspended';
  scope: string[];
  rules: PolicyRule[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  approvedBy?: string;
  enforcementMode: 'manual' | 'auto' | 'ai_assisted';
  aiConfidence?: number;
}

interface PolicyRule {
  id: string;
  condition: string;
  conditionAr: string;
  action: string;
  actionAr: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export default function PolicyEngine() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const policies: Policy[] = [
    {
      id: "1",
      name: "API Authentication Policy",
      nameAr: "سياسة مصادقة API",
      description: "Enforce OAuth 2.0 and API key authentication for all endpoints",
      descriptionAr: "فرض مصادقة OAuth 2.0 ومفتاح API لجميع نقاط النهاية",
      category: "security",
      status: "enforcing",
      scope: ["api-gateway", "backend-services"],
      rules: [
        { id: "r1", condition: "Request without valid token", conditionAr: "طلب بدون رمز صالح", action: "Block and log", actionAr: "حظر وتسجيل", severity: "high" },
        { id: "r2", condition: "Token expired", conditionAr: "انتهت صلاحية الرمز", action: "Refresh or re-authenticate", actionAr: "تحديث أو إعادة المصادقة", severity: "medium" },
      ],
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "system",
      approvedBy: "admin",
      enforcementMode: "auto",
      aiConfidence: 95,
    },
    {
      id: "2",
      name: "Data Encryption Policy",
      nameAr: "سياسة تشفير البيانات",
      description: "Ensure all sensitive data is encrypted at rest and in transit",
      descriptionAr: "ضمان تشفير جميع البيانات الحساسة في حالة السكون والنقل",
      category: "data",
      status: "active",
      scope: ["database", "storage", "network"],
      rules: [
        { id: "r3", condition: "Unencrypted data detected", conditionAr: "تم اكتشاف بيانات غير مشفرة", action: "Encrypt immediately", actionAr: "تشفير فوري", severity: "critical" },
      ],
      createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "security-team",
      approvedBy: "admin",
      enforcementMode: "ai_assisted",
      aiConfidence: 98,
    },
    {
      id: "3",
      name: "Resource Usage Limits",
      nameAr: "حدود استخدام الموارد",
      description: "Set and enforce resource consumption limits per tenant",
      descriptionAr: "تعيين وفرض حدود استهلاك الموارد لكل مستأجر",
      category: "resource",
      status: "pending_approval",
      scope: ["compute", "storage", "bandwidth"],
      rules: [
        { id: "r4", condition: "CPU usage > 80%", conditionAr: "استخدام المعالج > 80%", action: "Throttle or scale", actionAr: "خنق أو توسيع", severity: "medium" },
        { id: "r5", condition: "Storage quota exceeded", conditionAr: "تجاوز حصة التخزين", action: "Block new writes", actionAr: "حظر الكتابات الجديدة", severity: "high" },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "ops-team",
      enforcementMode: "manual",
    },
    {
      id: "4",
      name: "Compliance Audit Policy",
      nameAr: "سياسة تدقيق الامتثال",
      description: "Automated compliance checks and reporting",
      descriptionAr: "فحوصات الامتثال والتقارير الآلية",
      category: "compliance",
      status: "draft",
      scope: ["all-systems"],
      rules: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "compliance-team",
      enforcementMode: "auto",
    },
  ];

  const categoryConfig: Record<string, { color: string; icon: any; label: { en: string; ar: string } }> = {
    security: { color: "text-red-500 bg-red-500/10 border-red-500/30", icon: Shield, label: { en: "Security", ar: "الأمان" } },
    access: { color: "text-blue-500 bg-blue-500/10 border-blue-500/30", icon: Lock, label: { en: "Access", ar: "الوصول" } },
    data: { color: "text-purple-500 bg-purple-500/10 border-purple-500/30", icon: Layers, label: { en: "Data", ar: "البيانات" } },
    resource: { color: "text-amber-500 bg-amber-500/10 border-amber-500/30", icon: Activity, label: { en: "Resource", ar: "الموارد" } },
    compliance: { color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30", icon: Scale, label: { en: "Compliance", ar: "الامتثال" } },
  };

  const statusConfig: Record<string, { color: string; label: { en: string; ar: string } }> = {
    draft: { color: "bg-slate-600", label: { en: "Draft", ar: "مسودة" } },
    pending_approval: { color: "bg-amber-600", label: { en: "Pending Approval", ar: "بانتظار الموافقة" } },
    active: { color: "bg-blue-600", label: { en: "Active", ar: "نشط" } },
    enforcing: { color: "bg-emerald-600", label: { en: "Enforcing", ar: "قيد التنفيذ" } },
    suspended: { color: "bg-red-600", label: { en: "Suspended", ar: "معلق" } },
  };

  const severityColors: Record<string, string> = {
    low: "text-emerald-500 border-emerald-500/30",
    medium: "text-yellow-500 border-yellow-500/30",
    high: "text-orange-500 border-orange-500/30",
    critical: "text-red-500 border-red-500/30",
  };

  const filteredPolicies = activeTab === "all" 
    ? policies 
    : policies.filter(p => p.status === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="flex flex-col h-screen">
        <header className="px-6 py-4 border-b border-slate-800/50 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30">
                <Gavel className="w-7 h-7 text-amber-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white" data-testid="text-policy-engine-title">
                  {language === "ar" ? "محرك السياسات الوطنية/المؤسسية" : "National/Enterprise Policy Engine"}
                </h1>
                <p className="text-sm text-slate-400">
                  {language === "ar" ? "تشريع وإنفاذ السياسات السيادية" : "Legislate & Enforce Sovereign Policies"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button onClick={() => setShowCreateDialog(true)} className="bg-amber-600 hover:bg-amber-700" data-testid="button-create-policy">
                <Plus className="w-4 h-4 mr-2" />
                {language === "ar" ? "إنشاء سياسة" : "Create Policy"}
              </Button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-5 gap-3 p-4 bg-slate-900/50 border-b border-slate-800/30">
          <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
            <CardContent className="p-3 text-center">
              <FileText className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-blue-500">{policies.length}</p>
              <p className="text-[10px] text-slate-400">{language === "ar" ? "إجمالي السياسات" : "Total Policies"}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
            <CardContent className="p-3 text-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-emerald-500">{policies.filter(p => p.status === 'enforcing').length}</p>
              <p className="text-[10px] text-slate-400">{language === "ar" ? "قيد التنفيذ" : "Enforcing"}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
            <CardContent className="p-3 text-center">
              <Clock className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-amber-500">{policies.filter(p => p.status === 'pending_approval').length}</p>
              <p className="text-[10px] text-slate-400">{language === "ar" ? "بانتظار الموافقة" : "Pending"}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
            <CardContent className="p-3 text-center">
              <Brain className="w-5 h-5 text-purple-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-purple-500">{policies.filter(p => p.enforcementMode === 'ai_assisted').length}</p>
              <p className="text-[10px] text-slate-400">{language === "ar" ? "بمساعدة AI" : "AI-Assisted"}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-slate-500/10 to-transparent border-slate-500/20">
            <CardContent className="p-3 text-center">
              <Edit className="w-5 h-5 text-slate-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-slate-500">{policies.filter(p => p.status === 'draft').length}</p>
              <p className="text-[10px] text-slate-400">{language === "ar" ? "مسودات" : "Drafts"}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-80 border-r border-slate-800/50 flex flex-col bg-slate-900/30">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="p-3 border-b border-slate-800/50">
              <TabsList className="w-full bg-slate-800/50">
                <TabsTrigger value="all" className="flex-1 text-xs" data-testid="tab-all-policies">{language === "ar" ? "الكل" : "All"}</TabsTrigger>
                <TabsTrigger value="enforcing" className="flex-1 text-xs" data-testid="tab-enforcing">{language === "ar" ? "نشط" : "Active"}</TabsTrigger>
                <TabsTrigger value="pending_approval" className="flex-1 text-xs" data-testid="tab-pending">{language === "ar" ? "معلق" : "Pending"}</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {filteredPolicies.map((policy) => {
                  const category = categoryConfig[policy.category];
                  const CategoryIcon = category.icon;
                  return (
                    <button
                      key={policy.id}
                      onClick={() => setSelectedPolicy(policy)}
                      className={`w-full p-3 rounded-lg text-left transition-all hover-elevate ${
                        selectedPolicy?.id === policy.id 
                          ? "bg-amber-500/10 border border-amber-500/30" 
                          : "bg-slate-800/30 border border-transparent"
                      }`}
                      data-testid={`button-policy-${policy.id}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white truncate">
                          {language === "ar" ? policy.nameAr : policy.name}
                        </span>
                        <Badge className={`text-[9px] ${statusConfig[policy.status].color}`}>
                          {statusConfig[policy.status].label[language === "ar" ? "ar" : "en"]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[9px] ${category.color}`}>
                          <CategoryIcon className="w-2.5 h-2.5 mr-0.5" />
                          {category.label[language === "ar" ? "ar" : "en"]}
                        </Badge>
                        {policy.aiConfidence && (
                          <Badge variant="outline" className="text-[9px] text-purple-500 border-purple-500/30">
                            <Brain className="w-2.5 h-2.5 mr-0.5" />
                            {policy.aiConfidence}%
                          </Badge>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          <div className="flex-1 p-6 overflow-auto">
            {selectedPolicy ? (
              <div className="space-y-6">
                <Card className="bg-slate-900/50 border-slate-800/50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg text-white flex items-center gap-2">
                          <Gavel className="w-5 h-5 text-amber-500" />
                          {language === "ar" ? selectedPolicy.nameAr : selectedPolicy.name}
                        </CardTitle>
                        <CardDescription className="text-slate-400 mt-1">
                          {language === "ar" ? selectedPolicy.descriptionAr : selectedPolicy.description}
                        </CardDescription>
                      </div>
                      <Badge className={`${statusConfig[selectedPolicy.status].color}`}>
                        {statusConfig[selectedPolicy.status].label[language === "ar" ? "ar" : "en"]}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30 text-center">
                        <p className="text-lg font-bold text-white">{selectedPolicy.rules.length}</p>
                        <p className="text-[10px] text-slate-400">{language === "ar" ? "القواعد" : "Rules"}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30 text-center">
                        <p className="text-lg font-bold text-white">{selectedPolicy.scope.length}</p>
                        <p className="text-[10px] text-slate-400">{language === "ar" ? "النطاق" : "Scope"}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30 text-center">
                        <p className="text-lg font-bold text-white capitalize">{selectedPolicy.enforcementMode.replace('_', ' ')}</p>
                        <p className="text-[10px] text-slate-400">{language === "ar" ? "وضع التنفيذ" : "Mode"}</p>
                      </div>
                      {selectedPolicy.aiConfidence && (
                        <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center">
                          <p className="text-lg font-bold text-purple-500">{selectedPolicy.aiConfidence}%</p>
                          <p className="text-[10px] text-slate-400">{language === "ar" ? "ثقة AI" : "AI Confidence"}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      {selectedPolicy.status === 'pending_approval' && (
                        <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" data-testid="button-approve-policy">
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          {language === "ar" ? "الموافقة والتفعيل" : "Approve & Activate"}
                        </Button>
                      )}
                      {selectedPolicy.status === 'active' && (
                        <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" data-testid="button-enforce-policy">
                          <Play className="w-4 h-4 mr-2" />
                          {language === "ar" ? "بدء التنفيذ" : "Start Enforcement"}
                        </Button>
                      )}
                      {selectedPolicy.status === 'enforcing' && (
                        <Button variant="outline" className="flex-1 border-amber-500/30 text-amber-500" data-testid="button-pause-enforcement">
                          <Pause className="w-4 h-4 mr-2" />
                          {language === "ar" ? "إيقاف مؤقت" : "Pause Enforcement"}
                        </Button>
                      )}
                      <Button variant="outline" className="flex-1 border-slate-600" data-testid="button-simulate-policy">
                        <Lightbulb className="w-4 h-4 mr-2" />
                        {language === "ar" ? "محاكاة التأثير" : "Simulate Impact"}
                      </Button>
                      <Button variant="outline" className="border-slate-600" data-testid="button-edit-policy">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800/50">
                  <CardHeader>
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <Workflow className="w-4 h-4 text-blue-500" />
                      {language === "ar" ? "قواعد السياسة" : "Policy Rules"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedPolicy.rules.length > 0 ? (
                      <div className="space-y-3">
                        {selectedPolicy.rules.map((rule) => (
                          <div key={rule.id} className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
                            <div className="flex items-start justify-between mb-2">
                              <Badge variant="outline" className={`text-[9px] ${severityColors[rule.severity]}`}>
                                {rule.severity.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-[10px] text-slate-500 mb-1">{language === "ar" ? "الشرط" : "CONDITION"}</p>
                                <p className="text-sm text-white">{language === "ar" ? rule.conditionAr : rule.condition}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-slate-500 mb-1">{language === "ar" ? "الإجراء" : "ACTION"}</p>
                                <p className="text-sm text-white">{language === "ar" ? rule.actionAr : rule.action}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-400">
                        <Workflow className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>{language === "ar" ? "لا توجد قواعد محددة" : "No rules defined"}</p>
                        <Button variant="outline" size="sm" className="mt-3 border-slate-600" data-testid="button-add-rule">
                          <Plus className="w-3 h-3 mr-1" />
                          {language === "ar" ? "إضافة قاعدة" : "Add Rule"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="p-4 rounded-full bg-slate-800/50 inline-block mb-4">
                    <Gavel className="w-12 h-12 text-slate-500" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-1">
                    {language === "ar" ? "اختر سياسة" : "Select a Policy"}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {language === "ar" ? "اختر سياسة لعرض التفاصيل وإدارتها" : "Choose a policy to view details and manage"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-500" />
              {language === "ar" ? "إنشاء سياسة جديدة" : "Create New Policy"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {language === "ar" ? "حدد تفاصيل السياسة الجديدة" : "Define the new policy details"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-300">{language === "ar" ? "اسم السياسة" : "Policy Name"}</Label>
              <Input placeholder={language === "ar" ? "أدخل اسم السياسة" : "Enter policy name"} className="bg-slate-800 border-slate-700" data-testid="input-policy-name" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">{language === "ar" ? "الفئة" : "Category"}</Label>
              <Select>
                <SelectTrigger className="bg-slate-800 border-slate-700" data-testid="select-policy-category">
                  <SelectValue placeholder={language === "ar" ? "اختر الفئة" : "Select category"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="security">{language === "ar" ? "الأمان" : "Security"}</SelectItem>
                  <SelectItem value="access">{language === "ar" ? "الوصول" : "Access"}</SelectItem>
                  <SelectItem value="data">{language === "ar" ? "البيانات" : "Data"}</SelectItem>
                  <SelectItem value="resource">{language === "ar" ? "الموارد" : "Resource"}</SelectItem>
                  <SelectItem value="compliance">{language === "ar" ? "الامتثال" : "Compliance"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">{language === "ar" ? "الوصف" : "Description"}</Label>
              <Textarea placeholder={language === "ar" ? "وصف السياسة" : "Policy description"} className="bg-slate-800 border-slate-700 min-h-[80px]" data-testid="input-policy-description" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">{language === "ar" ? "وضع التنفيذ" : "Enforcement Mode"}</Label>
              <Select>
                <SelectTrigger className="bg-slate-800 border-slate-700" data-testid="select-enforcement-mode">
                  <SelectValue placeholder={language === "ar" ? "اختر الوضع" : "Select mode"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">{language === "ar" ? "يدوي" : "Manual"}</SelectItem>
                  <SelectItem value="auto">{language === "ar" ? "تلقائي" : "Automatic"}</SelectItem>
                  <SelectItem value="ai_assisted">{language === "ar" ? "بمساعدة AI" : "AI-Assisted"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="border-slate-600" data-testid="button-cancel-create">
              {language === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button className="bg-amber-600 hover:bg-amber-700" data-testid="button-save-policy">
              {language === "ar" ? "إنشاء السياسة" : "Create Policy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
