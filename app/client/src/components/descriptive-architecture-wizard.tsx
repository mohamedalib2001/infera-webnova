import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, Database, Shield, Workflow, 
  ChevronRight, ChevronLeft, Check, AlertTriangle,
  Upload, Loader2, Code, Lightbulb
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface WizardStep {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  icon: typeof FileText;
  completed: boolean;
  data: any;
}

interface ArchitectureData {
  overview: any;
  dataModel: any;
  permissions: any;
  operations: any;
}

export function DescriptiveArchitectureWizard() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [inputs, setInputs] = useState({
    overview: "",
    dataModel: "",
    permissions: "",
    operations: "",
    importedDocument: ""
  });
  const [architecture, setArchitecture] = useState<ArchitectureData>({
    overview: null,
    dataModel: null,
    permissions: null,
    operations: null
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  const steps: WizardStep[] = [
    { id: "overview", title: "الوصف العام", titleEn: "Overview", description: "صف مشروعك بلغة طبيعية", icon: FileText, completed: !!architecture.overview, data: architecture.overview },
    { id: "dataModel", title: "نمذجة البيانات", titleEn: "Data Model", description: "حدد الكيانات والعلاقات", icon: Database, completed: !!architecture.dataModel, data: architecture.dataModel },
    { id: "permissions", title: "الصلاحيات", titleEn: "Permissions", description: "حدد الأدوار والصلاحيات", icon: Shield, completed: !!architecture.permissions, data: architecture.permissions },
    { id: "operations", title: "العمليات", titleEn: "Operations", description: "حدد سير العمل والـ APIs", icon: Workflow, completed: !!architecture.operations, data: architecture.operations }
  ];

  const processOverview = useMutation({
    mutationFn: async (description: string) => {
      const res = await apiRequest("POST", "/api/architecture/process-overview", { description });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setArchitecture(prev => ({ ...prev, overview: data.data }));
        setSuggestions(data.suggestions || []);
        setWarnings(data.warnings || []);
        toast({ title: "تم تحليل الوصف بنجاح", description: "يمكنك المتابعة للخطوة التالية" });
      }
    }
  });

  const processDataModel = useMutation({
    mutationFn: async (requirements: string) => {
      const res = await apiRequest("POST", "/api/architecture/process-data-model", {
        requirements,
        context: architecture.overview
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setArchitecture(prev => ({ ...prev, dataModel: data.data }));
        setSuggestions(data.suggestions || []);
        setWarnings(data.warnings || []);
        toast({ title: "تم تحليل نموذج البيانات", description: "يمكنك المتابعة للخطوة التالية" });
      }
    }
  });

  const processPermissions = useMutation({
    mutationFn: async (requirements: string) => {
      const res = await apiRequest("POST", "/api/architecture/process-permissions", {
        requirements,
        context: { overview: architecture.overview, dataModel: architecture.dataModel }
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setArchitecture(prev => ({ ...prev, permissions: data.data }));
        setSuggestions(data.suggestions || []);
        setWarnings(data.warnings || []);
        toast({ title: "تم تحليل الصلاحيات", description: "يمكنك المتابعة للخطوة التالية" });
      }
    }
  });

  const processOperations = useMutation({
    mutationFn: async (requirements: string) => {
      const res = await apiRequest("POST", "/api/architecture/process-operations", {
        requirements,
        context: { overview: architecture.overview, dataModel: architecture.dataModel, permissions: architecture.permissions }
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setArchitecture(prev => ({ ...prev, operations: data.data }));
        setSuggestions(data.suggestions || []);
        setWarnings(data.warnings || []);
        toast({ title: "تم تحليل العمليات", description: "البنية جاهزة لتوليد الكود" });
      }
    }
  });

  const importDocument = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/architecture/import-document", { content });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        const sections = data.data.sections || [];
        sections.forEach((section: any) => {
          if (section.type === "overview") {
            setInputs(prev => ({ ...prev, overview: section.content }));
          } else if (section.type === "dataModel") {
            setInputs(prev => ({ ...prev, dataModel: section.content }));
          } else if (section.type === "permissions") {
            setInputs(prev => ({ ...prev, permissions: section.content }));
          } else if (section.type === "operations") {
            setInputs(prev => ({ ...prev, operations: section.content }));
          }
        });
        toast({ title: "تم استيراد المستند", description: `تم استخراج ${sections.length} أقسام` });
      }
    }
  });

  const generateCode = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/architecture/generate-code", { architecture });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: "تم توليد الكود بنجاح", description: "يمكنك تحميل الملفات الآن" });
      }
    }
  });

  const handleProcess = () => {
    const stepId = steps[currentStep].id;
    const input = inputs[stepId as keyof typeof inputs];
    
    if (!input.trim()) {
      toast({ title: "خطأ", description: "يرجى إدخال الوصف أولاً", variant: "destructive" });
      return;
    }

    switch (stepId) {
      case "overview":
        processOverview.mutate(input);
        break;
      case "dataModel":
        processDataModel.mutate(input);
        break;
      case "permissions":
        processPermissions.mutate(input);
        break;
      case "operations":
        processOperations.mutate(input);
        break;
    }
  };

  const isProcessing = processOverview.isPending || processDataModel.isPending || 
                       processPermissions.isPending || processOperations.isPending;

  const completedSteps = steps.filter(s => s.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setInputs(prev => ({ ...prev, importedDocument: content }));
        importDocument.mutate(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 h-full" dir="rtl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold" data-testid="text-wizard-title">منصة الوصف البنائي</h2>
          <p className="text-sm text-muted-foreground">Descriptive Architecture Platform</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="cursor-pointer">
            <input type="file" accept=".txt,.md,.doc" className="hidden" onChange={handleFileUpload} data-testid="input-file-upload" />
            <Button variant="outline" size="sm" asChild>
              <span><Upload className="w-4 h-4 ml-2" />استيراد مستند</span>
            </Button>
          </label>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <Progress value={progress} className="flex-1" data-testid="progress-wizard" />
        <span className="text-sm text-muted-foreground">{completedSteps}/{steps.length}</span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 flex-wrap">
        {steps.map((step, index) => (
          <Button
            key={step.id}
            variant={currentStep === index ? "default" : step.completed ? "secondary" : "outline"}
            size="sm"
            onClick={() => setCurrentStep(index)}
            className="gap-2 whitespace-nowrap"
            data-testid={`button-step-${step.id}`}
          >
            <step.icon className="w-4 h-4" />
            <span>{step.title}</span>
            {step.completed && <Check className="w-3 h-3" />}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              {(() => { const Icon = steps[currentStep].icon; return <Icon className="w-5 h-5" />; })()}
              {steps[currentStep].title}
            </CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-3">
            <Textarea
              placeholder={getPlaceholder(steps[currentStep].id)}
              value={inputs[steps[currentStep].id as keyof typeof inputs]}
              onChange={(e) => setInputs(prev => ({ ...prev, [steps[currentStep].id]: e.target.value }))}
              className="flex-1 min-h-[200px] resize-none"
              dir="auto"
              data-testid={`textarea-${steps[currentStep].id}`}
            />
            <div className="flex gap-2 flex-wrap">
              <Button onClick={handleProcess} disabled={isProcessing} data-testid="button-process">
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                تحليل ومعالجة
              </Button>
              {currentStep > 0 && (
                <Button variant="outline" onClick={() => setCurrentStep(c => c - 1)} data-testid="button-prev">
                  <ChevronRight className="w-4 h-4 ml-1" />السابق
                </Button>
              )}
              {currentStep < steps.length - 1 && steps[currentStep].completed && (
                <Button variant="outline" onClick={() => setCurrentStep(c => c + 1)} data-testid="button-next">
                  التالي<ChevronLeft className="w-4 h-4 mr-1" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">النتائج والمعاينة</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <Tabs defaultValue="result" className="h-full flex flex-col">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="result" data-testid="tab-result">النتيجة</TabsTrigger>
                <TabsTrigger value="suggestions" data-testid="tab-suggestions">
                  <Lightbulb className="w-3 h-3 ml-1" />اقتراحات
                </TabsTrigger>
                <TabsTrigger value="warnings" data-testid="tab-warnings">
                  <AlertTriangle className="w-3 h-3 ml-1" />تحذيرات
                </TabsTrigger>
              </TabsList>
              <TabsContent value="result" className="flex-1 mt-2">
                <ScrollArea className="h-[300px]">
                  {steps[currentStep].data ? (
                    <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto" dir="ltr">
                      {JSON.stringify(steps[currentStep].data, null, 2)}
                    </pre>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      لم يتم معالجة هذه الخطوة بعد
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
              <TabsContent value="suggestions" className="flex-1 mt-2">
                <ScrollArea className="h-[300px]">
                  {suggestions.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {suggestions.map((s, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 bg-muted rounded-md">
                          <Lightbulb className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                          <span className="text-sm">{s}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">لا توجد اقتراحات</div>
                  )}
                </ScrollArea>
              </TabsContent>
              <TabsContent value="warnings" className="flex-1 mt-2">
                <ScrollArea className="h-[300px]">
                  {warnings.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {warnings.map((w, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 bg-destructive/10 rounded-md">
                          <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                          <span className="text-sm">{w}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">لا توجد تحذيرات</div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="border-t pt-3">
            <Button 
              className="w-full" 
              disabled={completedSteps < 4 || generateCode.isPending}
              onClick={() => generateCode.mutate()}
              data-testid="button-generate-code"
            >
              {generateCode.isPending ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Code className="w-4 h-4 ml-2" />}
              توليد الكود الكامل
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function getPlaceholder(stepId: string): string {
  switch (stepId) {
    case "overview":
      return `صف مشروعك بلغة طبيعية، مثال:

أريد بناء نظام إدارة مستشفى يتضمن:
1. إدارة المرضى والملفات الطبية
2. حجز المواعيد مع الأطباء
3. نظام الفوترة والتأمين
4. تقارير وإحصائيات

القطاع: صحي
الامتثال: HIPAA`;
    case "dataModel":
      return `حدد الكيانات والبيانات المطلوبة، مثال:

- المريض: الاسم، رقم الهوية، تاريخ الميلاد، معلومات التواصل
- الطبيب: الاسم، التخصص، رقم الترخيص
- الموعد: المريض، الطبيب، التاريخ والوقت، الحالة
- الفاتورة: المريض، الخدمات، المبلغ، حالة الدفع`;
    case "permissions":
      return `حدد الأدوار والصلاحيات، مثال:

الأدوار:
- مدير النظام: صلاحيات كاملة
- طبيب: عرض وتعديل الملفات الطبية، إدارة المواعيد
- ممرض: عرض الملفات الطبية، تسجيل العلامات الحيوية
- موظف استقبال: إدارة المواعيد، تسجيل المرضى الجدد
- محاسب: إدارة الفواتير والمدفوعات`;
    case "operations":
      return `حدد العمليات وسير العمل، مثال:

سير العمل:
- تسجيل مريض جديد -> إنشاء ملف طبي -> إرسال رسالة ترحيب
- حجز موعد -> إرسال تأكيد -> تذكير قبل الموعد

الإشعارات:
- تأكيد الموعد عبر SMS
- تذكير قبل الموعد بـ 24 ساعة`;
    default:
      return "";
  }
}
