import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Server,
  Cpu,
  HardDrive,
  MemoryStick,
  Rocket,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Brain,
  Layers,
  Plus,
  ArrowRight,
  Zap,
  Shield,
  Globe,
  Printer,
} from "lucide-react";

interface SovereignPlan {
  id: string;
  planCode: string;
  planName: string;
  planNameAr?: string;
  phase: string;
  status: string;
  budgetMonthly: number;
  budgetCurrency: string;
  budgetMonthlyLocal?: number;
  localCurrency?: string;
  serverProvider: string;
  serverType: string;
  serverSpecs: {
    cpu: string;
    ram: string;
    storage: string;
    gpu?: string;
  };
  aiConfig?: {
    inferenceType: string;
    tools: string[];
    models: string[];
    quantization?: string;
  };
  additionalServices?: {
    objectStorage?: { size: string; cost: number };
    backups?: { type: string; cost: number };
    traffic?: { included: string; cost: number };
    domain?: { cost: number };
  };
  costBreakdown?: {
    server: number;
    storage: number;
    backups: number;
    traffic: number;
    domain: number;
    other: number;
    total: number;
  };
  scalingRoadmap?: Array<{
    nextPhase?: string;
    triggerConditions?: string[];
    estimatedCost?: number;
    capabilities?: string[];
  }>;
  description?: string;
  descriptionAr?: string;
  launchedAt?: string;
  createdAt: string;
  milestones?: Array<{
    id: number;
    title: string;
    titleAr?: string;
    isCompleted: boolean;
  }>;
}

export default function SovereignPlansPage() {
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newPlan, setNewPlan] = useState({
    planName: "",
    planNameAr: "",
    phase: "phase_1",
    serverProvider: "hetzner",
    serverType: "",
    budgetMonthly: 0,
    description: "",
    descriptionAr: "",
    cpu: "",
    ram: "",
    storage: "",
  });

  const { data: plans = [], isLoading } = useQuery<SovereignPlan[]>({
    queryKey: ["/api/sovereign-plans"],
  });

  const { data: activePlan } = useQuery<SovereignPlan | null>({
    queryKey: ["/api/sovereign-plans/active/current"],
  });

  const createPlanMutation = useMutation({
    mutationFn: async (planData: typeof newPlan) => {
      const planCode = `PLAN-${String(plans.length + 1).padStart(3, "0")}-${planData.serverType.toUpperCase()}`;
      return apiRequest("/api/sovereign-plans", {
        method: "POST",
        body: JSON.stringify({
          planCode,
          planName: planData.planName,
          planNameAr: planData.planNameAr,
          phase: planData.phase,
          status: "draft",
          budgetMonthly: planData.budgetMonthly,
          budgetCurrency: "EUR",
          serverProvider: planData.serverProvider,
          serverType: planData.serverType,
          serverSpecs: {
            cpu: planData.cpu,
            ram: planData.ram,
            storage: planData.storage,
          },
          description: planData.description,
          descriptionAr: planData.descriptionAr,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sovereign-plans"] });
      setShowAddDialog(false);
      setNewPlan({
        planName: "",
        planNameAr: "",
        phase: "phase_1",
        serverProvider: "hetzner",
        serverType: "",
        budgetMonthly: 0,
        description: "",
        descriptionAr: "",
        cpu: "",
        ram: "",
        storage: "",
      });
      toast({
        title: "تم إنشاء الخطة",
        description: "تمت إضافة الخطة الجديدة بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في إنشاء الخطة",
        variant: "destructive",
      });
    },
  });

  const handlePrintPlan = (plan: SovereignPlan) => {
    const printContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>${plan.planNameAr || plan.planName} - INFERA WebNova</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 40px; direction: rtl; }
    h1 { color: #1a1a2e; border-bottom: 3px solid #4f46e5; padding-bottom: 10px; }
    h2 { color: #4f46e5; margin-top: 30px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #4f46e5; }
    .date { color: #666; }
    .section { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
    .item { padding: 10px; background: white; border-radius: 4px; }
    .label { color: #666; font-size: 12px; }
    .value { font-weight: bold; font-size: 16px; margin-top: 5px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; }
    .active { background: #dcfce7; color: #166534; }
    .draft { background: #f3f4f6; color: #374151; }
    .cost-breakdown { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px; }
    .cost-item { background: #e0e7ff; padding: 10px 15px; border-radius: 8px; text-align: center; }
    .footer { margin-top: 40px; text-align: center; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">INFERA WebNova</div>
    <div class="date">${new Date().toLocaleDateString("ar-SA")}</div>
  </div>
  
  <h1>${plan.planNameAr || plan.planName}</h1>
  <p><span class="badge ${plan.status}">${plan.status === "active" ? "نشطة" : "مسودة"}</span> | ${plan.planCode}</p>
  
  <div class="section">
    <h2>مواصفات السيرفر</h2>
    <div class="grid">
      <div class="item"><div class="label">المزود</div><div class="value">${plan.serverProvider.toUpperCase()}</div></div>
      <div class="item"><div class="label">النوع</div><div class="value">${plan.serverType}</div></div>
      <div class="item"><div class="label">المعالج</div><div class="value">${plan.serverSpecs.cpu}</div></div>
      <div class="item"><div class="label">الذاكرة</div><div class="value">${plan.serverSpecs.ram}</div></div>
      <div class="item"><div class="label">التخزين</div><div class="value">${plan.serverSpecs.storage}</div></div>
      ${plan.serverSpecs.gpu ? `<div class="item"><div class="label">GPU</div><div class="value">${plan.serverSpecs.gpu}</div></div>` : ""}
    </div>
  </div>
  
  ${plan.aiConfig ? `
  <div class="section">
    <h2>تكوين الذكاء الاصطناعي</h2>
    <div class="grid">
      <div class="item"><div class="label">نوع المعالجة</div><div class="value">${plan.aiConfig.inferenceType}</div></div>
      <div class="item"><div class="label">الأدوات</div><div class="value">${plan.aiConfig.tools.join(", ")}</div></div>
      <div class="item"><div class="label">النماذج</div><div class="value">${plan.aiConfig.models.join(", ")}</div></div>
      ${plan.aiConfig.quantization ? `<div class="item"><div class="label">Quantization</div><div class="value">${plan.aiConfig.quantization}</div></div>` : ""}
    </div>
  </div>
  ` : ""}
  
  ${plan.costBreakdown ? `
  <div class="section">
    <h2>تفاصيل التكلفة</h2>
    <div class="cost-breakdown">
      <div class="cost-item"><div class="label">السيرفر</div><div class="value">€${plan.costBreakdown.server}</div></div>
      <div class="cost-item"><div class="label">التخزين</div><div class="value">€${plan.costBreakdown.storage}</div></div>
      <div class="cost-item"><div class="label">النسخ الاحتياطي</div><div class="value">€${plan.costBreakdown.backups}</div></div>
      <div class="cost-item"><div class="label">الإجمالي</div><div class="value" style="color: #4f46e5; font-size: 20px;">€${plan.costBreakdown.total}/شهر</div></div>
    </div>
  </div>
  ` : `
  <div class="section">
    <h2>التكلفة الشهرية</h2>
    <div class="value" style="font-size: 24px; color: #4f46e5;">€${plan.budgetMonthly}/شهر</div>
  </div>
  `}
  
  <div class="footer">
    <p>INFERA WebNova - Sovereign Infrastructure Management</p>
    <p>تاريخ الطباعة: ${new Date().toLocaleString("ar-SA")}</p>
  </div>
</body>
</html>
    `;
    
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const launchPlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      return apiRequest(`/api/sovereign-plans/${planId}/launch`, {
        method: "PATCH",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sovereign-plans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sovereign-plans/active/current"] });
      toast({
        title: "تم إطلاق الخطة",
        description: "تم تفعيل الخطة بنجاح",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "outline"; label: string }> = {
      draft: { variant: "secondary", label: "مسودة" },
      active: { variant: "default", label: "نشطة" },
      completed: { variant: "outline", label: "مكتملة" },
      suspended: { variant: "secondary", label: "معلقة" },
    };
    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPhaseLabel = (phase: string) => {
    const phases: Record<string, string> = {
      phase_1: "المرحلة 1 - البداية",
      phase_2: "المرحلة 2 - التوسع",
      phase_3: "المرحلة 3 - المؤسسي",
    };
    return phases[phase] || phase;
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <ScrollArea className="h-screen">
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold" data-testid="text-page-title">
                الخطط السيادية
              </h1>
              <p className="text-muted-foreground mt-1">
                إدارة ومتابعة خطط البنية التحتية
              </p>
            </div>
            <Button data-testid="button-add-plan" onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 ml-2" />
              خطة جديدة
            </Button>
          </div>

          {activePlan && (
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardHeader>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-primary/10">
                      <Rocket className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl" data-testid="text-active-plan-name">
                        {activePlan.planNameAr || activePlan.planName}
                      </CardTitle>
                      <CardDescription>{activePlan.planCode}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(activePlan.status)}
                    <Badge variant="outline">{getPhaseLabel(activePlan.phase)}</Badge>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handlePrintPlan(activePlan)}
                      data-testid="button-print-active-plan"
                    >
                      <Printer className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3">
                        <Server className="w-8 h-8 text-blue-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">السيرفر</p>
                          <p className="font-semibold" data-testid="text-server-type">
                            {activePlan.serverProvider.toUpperCase()} {activePlan.serverType}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3">
                        <Cpu className="w-8 h-8 text-green-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">المعالج</p>
                          <p className="font-semibold">{activePlan.serverSpecs.cpu}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3">
                        <MemoryStick className="w-8 h-8 text-purple-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">الذاكرة</p>
                          <p className="font-semibold">{activePlan.serverSpecs.ram}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-8 h-8 text-yellow-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">التكلفة الشهرية</p>
                          <p className="font-semibold" data-testid="text-monthly-cost">
                            {activePlan.budgetMonthlyLocal
                              ? `${activePlan.budgetMonthlyLocal} ${activePlan.localCurrency}`
                              : `€${activePlan.budgetMonthly}`}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {activePlan.aiConfig && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      تكوين الذكاء الاصطناعي
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground mb-1">نوع المعالجة</p>
                        <p className="font-medium capitalize">{activePlan.aiConfig.inferenceType}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground mb-1">الأدوات</p>
                        <div className="flex flex-wrap gap-1">
                          {activePlan.aiConfig.tools.map((tool) => (
                            <Badge key={tool} variant="secondary" className="text-xs">
                              {tool}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground mb-1">النماذج</p>
                        <div className="flex flex-wrap gap-1">
                          {activePlan.aiConfig.models.map((model) => (
                            <Badge key={model} variant="outline" className="text-xs">
                              {model}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activePlan.costBreakdown && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Layers className="w-5 h-5" />
                      تفاصيل التكلفة
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                      {[
                        { label: "السيرفر", value: activePlan.costBreakdown.server },
                        { label: "التخزين", value: activePlan.costBreakdown.storage },
                        { label: "النسخ الاحتياطي", value: activePlan.costBreakdown.backups },
                        { label: "حركة البيانات", value: activePlan.costBreakdown.traffic },
                        { label: "الدومين", value: activePlan.costBreakdown.domain },
                        { label: "الإجمالي", value: activePlan.costBreakdown.total, highlight: true },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className={`p-3 rounded-lg text-center ${
                            item.highlight ? "bg-primary/10 border border-primary/20" : "bg-muted/50"
                          }`}
                        >
                          <p className="text-xs text-muted-foreground">{item.label}</p>
                          <p className={`font-semibold ${item.highlight ? "text-primary" : ""}`}>
                            €{item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activePlan.scalingRoadmap && activePlan.scalingRoadmap.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      خطة التوسع
                    </h3>
                    <div className="flex items-center gap-4 overflow-x-auto pb-2">
                      {activePlan.scalingRoadmap.map((stage, index) => (
                        <div key={index} className="flex items-center gap-2 flex-shrink-0">
                          <div className="p-4 rounded-lg bg-muted/50 min-w-[200px]">
                            <p className="font-medium">{stage.nextPhase}</p>
                            <p className="text-sm text-muted-foreground">
                              ~€{stage.estimatedCost}/شهر
                            </p>
                            {stage.capabilities && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {stage.capabilities.map((cap) => (
                                  <Badge key={cap} variant="outline" className="text-xs">
                                    {cap}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          {index < activePlan.scalingRoadmap!.length - 1 && (
                            <ArrowRight className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Separator />

          <div>
            <h2 className="text-xl font-semibold mb-4">جميع الخطط</h2>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                    </CardHeader>
                    <CardContent>
                      <div className="h-20 bg-muted rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : plans.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Server className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">لا توجد خطط</h3>
                  <p className="text-muted-foreground mb-4">
                    لم يتم إنشاء أي خطط بنية تحتية بعد
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={plan.status === "active" ? "border-primary/50" : ""}
                    data-testid={`card-plan-${plan.planCode}`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-lg">
                          {plan.planNameAr || plan.planName}
                        </CardTitle>
                        {getStatusBadge(plan.status)}
                      </div>
                      <CardDescription>{plan.planCode}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">السيرفر:</span>
                        <span className="font-medium">
                          {plan.serverProvider.toUpperCase()} {plan.serverType}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">الذاكرة:</span>
                        <span className="font-medium">{plan.serverSpecs.ram}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">التكلفة:</span>
                        <span className="font-medium text-primary">
                          €{plan.budgetMonthly}/شهر
                        </span>
                      </div>
                      {plan.aiConfig && (
                        <div className="flex items-center gap-2 text-sm">
                          <Brain className="w-4 h-4 text-muted-foreground" />
                          <span>{plan.aiConfig.inferenceType.toUpperCase()} AI</span>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      {plan.status === "draft" && (
                        <Button
                          className="w-full"
                          onClick={() => launchPlanMutation.mutate(plan.id)}
                          disabled={launchPlanMutation.isPending}
                          data-testid={`button-launch-${plan.planCode}`}
                        >
                          <Rocket className="w-4 h-4 ml-2" />
                          إطلاق الخطة
                        </Button>
                      )}
                      {plan.status === "active" && (
                        <div className="w-full flex items-center justify-center gap-2 text-primary">
                          <CheckCircle className="w-5 h-5" />
                          <span>نشطة</span>
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <Shield className="w-10 h-10 mx-auto text-green-500 mb-3" />
                <h3 className="font-semibold mb-1">آمن</h3>
                <p className="text-sm text-muted-foreground">
                  جميع الخطط موثقة ومحمية
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Zap className="w-10 h-10 mx-auto text-yellow-500 mb-3" />
                <h3 className="font-semibold mb-1">قابل للتوسع</h3>
                <p className="text-sm text-muted-foreground">
                  توسع تدريجي بدون صدمات
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Globe className="w-10 h-10 mx-auto text-blue-500 mb-3" />
                <h3 className="font-semibold mb-1">سيادي</h3>
                <p className="text-sm text-muted-foreground">
                  تحكم كامل في البنية التحتية
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollArea>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة خطة جديدة</DialogTitle>
            <DialogDescription>
              أدخل تفاصيل خطة البنية التحتية الجديدة
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="planName">اسم الخطة (إنجليزي)</Label>
                <Input
                  id="planName"
                  value={newPlan.planName}
                  onChange={(e) => setNewPlan({ ...newPlan, planName: e.target.value })}
                  placeholder="Infrastructure Plan"
                  data-testid="input-plan-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="planNameAr">اسم الخطة (عربي)</Label>
                <Input
                  id="planNameAr"
                  value={newPlan.planNameAr}
                  onChange={(e) => setNewPlan({ ...newPlan, planNameAr: e.target.value })}
                  placeholder="خطة البنية التحتية"
                  data-testid="input-plan-name-ar"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serverProvider">مزود الخدمة</Label>
                <Select
                  value={newPlan.serverProvider}
                  onValueChange={(value) => setNewPlan({ ...newPlan, serverProvider: value })}
                >
                  <SelectTrigger data-testid="select-server-provider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hetzner">Hetzner</SelectItem>
                    <SelectItem value="aws">AWS</SelectItem>
                    <SelectItem value="gcp">Google Cloud</SelectItem>
                    <SelectItem value="azure">Microsoft Azure</SelectItem>
                    <SelectItem value="digitalocean">DigitalOcean</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="serverType">نوع السيرفر</Label>
                <Input
                  id="serverType"
                  value={newPlan.serverType}
                  onChange={(e) => setNewPlan({ ...newPlan, serverType: e.target.value })}
                  placeholder="AX52"
                  data-testid="input-server-type"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cpu">المعالج</Label>
                <Input
                  id="cpu"
                  value={newPlan.cpu}
                  onChange={(e) => setNewPlan({ ...newPlan, cpu: e.target.value })}
                  placeholder="AMD Ryzen 7 5800X"
                  data-testid="input-cpu"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ram">الذاكرة</Label>
                <Input
                  id="ram"
                  value={newPlan.ram}
                  onChange={(e) => setNewPlan({ ...newPlan, ram: e.target.value })}
                  placeholder="128GB DDR4"
                  data-testid="input-ram"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storage">التخزين</Label>
                <Input
                  id="storage"
                  value={newPlan.storage}
                  onChange={(e) => setNewPlan({ ...newPlan, storage: e.target.value })}
                  placeholder="2×1TB NVMe"
                  data-testid="input-storage"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phase">المرحلة</Label>
                <Select
                  value={newPlan.phase}
                  onValueChange={(value) => setNewPlan({ ...newPlan, phase: value })}
                >
                  <SelectTrigger data-testid="select-phase">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phase_1">المرحلة 1 - البداية</SelectItem>
                    <SelectItem value="phase_2">المرحلة 2 - التوسع</SelectItem>
                    <SelectItem value="phase_3">المرحلة 3 - المؤسسي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="budgetMonthly">التكلفة الشهرية (€)</Label>
                <Input
                  id="budgetMonthly"
                  type="number"
                  value={newPlan.budgetMonthly}
                  onChange={(e) => setNewPlan({ ...newPlan, budgetMonthly: Number(e.target.value) })}
                  placeholder="105"
                  data-testid="input-budget"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                value={newPlan.descriptionAr}
                onChange={(e) => setNewPlan({ ...newPlan, descriptionAr: e.target.value })}
                placeholder="وصف الخطة..."
                data-testid="input-description"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              إلغاء
            </Button>
            <Button
              onClick={() => createPlanMutation.mutate(newPlan)}
              disabled={createPlanMutation.isPending || !newPlan.planName || !newPlan.serverType}
              data-testid="button-submit-plan"
            >
              {createPlanMutation.isPending ? "جاري الإنشاء..." : "إنشاء الخطة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
