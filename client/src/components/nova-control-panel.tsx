import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Brain,
  Shield,
  Zap,
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  BarChart3,
  Beaker,
  Sparkles,
  Crown,
  Lock,
  Activity,
  Gauge,
  FlaskConical,
  Lightbulb,
  Search,
  Play,
  RefreshCw,
  FileText,
  Globe,
  Award,
} from "lucide-react";

interface NovaControlPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isRtl: boolean;
}

interface SovereignCapability {
  id: string;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  icon: React.ReactNode;
  enabled: boolean;
  status: "active" | "partial" | "disabled";
}

interface ComplianceMetric {
  id: string;
  nameAr: string;
  nameEn: string;
  score: number;
  status: "excellent" | "good" | "warning" | "critical";
}

interface StrengthItem {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  amplificationAr: string;
  amplificationEn: string;
  score: number;
}

interface WeaknessItem {
  id: string;
  titleAr: string;
  titleEn: string;
  typeAr: string;
  typeEn: string;
  costAr: string;
  costEn: string;
  planAr: string;
  planEn: string;
  severity: "low" | "medium" | "high";
}

interface LabScenario {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  status: "ready" | "running" | "completed";
}

export function NovaControlPanel({ isOpen, onClose, isRtl }: NovaControlPanelProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("capabilities");
  const [sovereignIndex, setSovereignIndex] = useState(78);
  const [capabilities, setCapabilities] = useState<SovereignCapability[]>([
    {
      id: "strategic-planning",
      nameAr: "التخطيط الاستراتيجي",
      nameEn: "Strategic Planning",
      descAr: "بناء منصات رقمية سيادية",
      descEn: "Building sovereign digital platforms",
      icon: <Brain className="w-4 h-4" />,
      enabled: true,
      status: "active",
    },
    {
      id: "sovereign-governance",
      nameAr: "الحوكمة السيادية",
      nameEn: "Sovereign Governance",
      descAr: "الالتزام والسيطرة الكاملة",
      descEn: "Full compliance and control",
      icon: <Shield className="w-4 h-4" />,
      enabled: true,
      status: "active",
    },
    {
      id: "code-analysis",
      nameAr: "التحليل البرمجي",
      nameEn: "Code Analysis",
      descAr: "مراجعة وتحسين الكود",
      descEn: "Code review and optimization",
      icon: <Settings className="w-4 h-4" />,
      enabled: false,
      status: "disabled",
    },
    {
      id: "market-analysis",
      nameAr: "التحليل السوقي",
      nameEn: "Market Analysis",
      descAr: "تحليل المنافسين والفرص",
      descEn: "Competitor and opportunity analysis",
      icon: <BarChart3 className="w-4 h-4" />,
      enabled: true,
      status: "active",
    },
    {
      id: "self-learning",
      nameAr: "التعلم الذاتي",
      nameEn: "Self Learning",
      descAr: "تحسين الأداء تلقائياً",
      descEn: "Automatic performance improvement",
      icon: <Sparkles className="w-4 h-4" />,
      enabled: true,
      status: "partial",
    },
    {
      id: "predictive-engine",
      nameAr: "المحرك التنبؤي",
      nameEn: "Predictive Engine",
      descAr: "التنبؤ بالاتجاهات والمخاطر",
      descEn: "Trend and risk prediction",
      icon: <Target className="w-4 h-4" />,
      enabled: true,
      status: "active",
    },
    {
      id: "decision-automation",
      nameAr: "أتمتة القرارات",
      nameEn: "Decision Automation",
      descAr: "اتخاذ قرارات ذكية تلقائية",
      descEn: "Automatic intelligent decisions",
      icon: <Zap className="w-4 h-4" />,
      enabled: true,
      status: "partial",
    },
  ]);

  const [complianceMetrics] = useState<ComplianceMetric[]>([
    { id: "iso-23894", nameAr: "ISO/IEC 23894", nameEn: "ISO/IEC 23894", score: 92, status: "excellent" },
    { id: "nist-ai-rmf", nameAr: "NIST AI RMF", nameEn: "NIST AI RMF", score: 88, status: "good" },
    { id: "enterprise-arch", nameAr: "معايير الهندسة المؤسسية", nameEn: "Enterprise Architecture", score: 95, status: "excellent" },
    { id: "digital-sovereignty", nameAr: "السيادة الرقمية", nameEn: "Digital Sovereignty", score: 97, status: "excellent" },
    { id: "contextual-intelligence", nameAr: "الذكاء السياقي", nameEn: "Contextual Intelligence", score: 85, status: "good" },
    { id: "engineering-depth", nameAr: "عمق الفهم الهندسي", nameEn: "Engineering Depth", score: 78, status: "good" },
    { id: "response-speed", nameAr: "سرعة الاستجابة", nameEn: "Response Speed", score: 94, status: "excellent" },
    { id: "decision-autonomy", nameAr: "استقلالية القرار", nameEn: "Decision Autonomy", score: 72, status: "warning" },
    { id: "industrial-scalability", nameAr: "قابلية التوسع الصناعي", nameEn: "Industrial Scalability", score: 89, status: "good" },
  ]);

  const [strengths] = useState<StrengthItem[]>([
    {
      id: "architectural-planning",
      titleAr: "التخطيط المعماري",
      titleEn: "Architectural Planning",
      descAr: "قدرة فائقة على تصميم بنى تحتية معقدة",
      descEn: "Superior ability to design complex infrastructures",
      amplificationAr: "ربطها مباشرة بقرارات النشر والتوسع التلقائي",
      amplificationEn: "Link directly to deployment and auto-scaling decisions",
      score: 95,
    },
    {
      id: "sovereign-compliance",
      titleAr: "الامتثال السيادي",
      titleEn: "Sovereign Compliance",
      descAr: "التزام كامل بمعايير الحوكمة الرقمية",
      descEn: "Full compliance with digital governance standards",
      amplificationAr: "توسيع نطاق التدقيق الآلي لجميع المنصات المولدة",
      amplificationEn: "Expand automated auditing to all generated platforms",
      score: 97,
    },
    {
      id: "bilingual-processing",
      titleAr: "المعالجة ثنائية اللغة",
      titleEn: "Bilingual Processing",
      descAr: "فهم متقدم للعربية والإنجليزية",
      descEn: "Advanced Arabic and English understanding",
      amplificationAr: "إضافة دعم للهجات العربية المحلية",
      amplificationEn: "Add support for local Arabic dialects",
      score: 92,
    },
  ]);

  const [weaknesses] = useState<WeaknessItem[]>([
    {
      id: "decision-autonomy",
      titleAr: "استقلالية القرار",
      titleEn: "Decision Autonomy",
      typeAr: "تقني + معرفي",
      typeEn: "Technical + Knowledge",
      costAr: "بطء في اتخاذ القرارات الحرجة",
      costEn: "Slowdown in critical decision making",
      planAr: "تدريب على سيناريوهات حرجة + تفويض محدود",
      planEn: "Training on critical scenarios + limited delegation",
      severity: "medium",
    },
    {
      id: "real-time-learning",
      titleAr: "التعلم الآني",
      titleEn: "Real-time Learning",
      typeAr: "تقني",
      typeEn: "Technical",
      costAr: "عدم التكيف السريع مع البيانات الجديدة",
      costEn: "Slow adaptation to new data",
      planAr: "تطوير نظام Incremental Learning",
      planEn: "Develop Incremental Learning system",
      severity: "high",
    },
  ]);

  const [labScenarios] = useState<LabScenario[]>([
    {
      id: "market-entry",
      titleAr: "دخول سوق جديد",
      titleEn: "New Market Entry",
      descAr: "ماذا لو دخلنا سوق الشرق الأوسط؟",
      descEn: "What if we enter the Middle East market?",
      status: "ready",
    },
    {
      id: "competition-surge",
      titleAr: "زيادة المنافسة",
      titleEn: "Competition Surge",
      descAr: "ماذا لو زادت المنافسة 300%؟",
      descEn: "What if competition increases 300%?",
      status: "ready",
    },
    {
      id: "scale-test",
      titleAr: "اختبار التوسع",
      titleEn: "Scale Test",
      descAr: "محاكاة 10,000 مستخدم متزامن",
      descEn: "Simulate 10,000 concurrent users",
      status: "completed",
    },
  ]);

  const toggleCapability = (id: string) => {
    setCapabilities(prev => prev.map(cap => {
      if (cap.id === id) {
        const newEnabled = !cap.enabled;
        toast({
          title: isRtl ? "تحديث القدرة" : "Capability Updated",
          description: isRtl 
            ? `${cap.nameAr} ${newEnabled ? "مفعّلة" : "معطّلة"}`
            : `${cap.nameEn} ${newEnabled ? "enabled" : "disabled"}`,
        });
        return {
          ...cap,
          enabled: newEnabled,
          status: newEnabled ? "active" : "disabled",
        };
      }
      return cap;
    }));
  };

  const enableAllCapabilities = () => {
    setCapabilities(prev => prev.map(cap => ({ ...cap, enabled: true, status: "active" })));
    toast({
      title: isRtl ? "تفعيل الكل" : "All Enabled",
      description: isRtl ? "تم تفعيل جميع القدرات السيادية" : "All sovereign capabilities enabled",
    });
  };

  const disableAllCapabilities = () => {
    setCapabilities(prev => prev.map(cap => ({ ...cap, enabled: false, status: "disabled" })));
    toast({
      title: isRtl ? "إلغاء تفعيل الكل" : "All Disabled",
      description: isRtl ? "تم إلغاء تفعيل جميع القدرات" : "All capabilities disabled",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">{isRtl ? "مفعّل" : "Active"}</Badge>;
      case "partial":
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">{isRtl ? "جزئي" : "Partial"}</Badge>;
      case "disabled":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">{isRtl ? "معطّل" : "Disabled"}</Badge>;
      default:
        return null;
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case "excellent": return "text-green-400";
      case "good": return "text-blue-400";
      case "warning": return "text-amber-400";
      case "critical": return "text-red-400";
      default: return "text-muted-foreground";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low": return "border-green-500/30 bg-green-500/10";
      case "medium": return "border-amber-500/30 bg-amber-500/10";
      case "high": return "border-red-500/30 bg-red-500/10";
      default: return "";
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setSovereignIndex(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        return Math.max(0, Math.min(100, prev + change));
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const t = {
    ar: {
      title: "لوحة تحكم Nova السيادية",
      subtitle: "العقل التنفيذي والتحليلي لمنظومة INFRA Engine",
      capabilities: "القدرات السيادية",
      audit: "التدقيق العالمي",
      strengths: "نقاط القوة",
      weaknesses: "نقاط الضعف",
      index: "مؤشر الذكاء",
      lab: "مختبر التطوير",
      enableAll: "تفعيل الكل",
      disableAll: "إلغاء الكل",
      capability: "القدرة",
      description: "الوصف",
      status: "الحالة",
      control: "تحكم",
      standard: "المعيار",
      score: "النتيجة",
      amplify: "تعزيز ×10",
      type: "النوع",
      cost: "تكلفة التجاهل",
      plan: "خطة التقوية",
      scenario: "السيناريو",
      run: "تشغيل",
      sovereignIndex: "مؤشر الذكاء السيادي",
      indexDesc: "قياس شامل لقدرات وأداء Nova",
    },
    en: {
      title: "Nova Sovereign Control Panel",
      subtitle: "Executive & Analytical Core of INFRA Engine",
      capabilities: "Sovereign Capabilities",
      audit: "Global Audit",
      strengths: "Strengths",
      weaknesses: "Weaknesses",
      index: "Intelligence Index",
      lab: "Development Lab",
      enableAll: "Enable All",
      disableAll: "Disable All",
      capability: "Capability",
      description: "Description",
      status: "Status",
      control: "Control",
      standard: "Standard",
      score: "Score",
      amplify: "Amplify ×10",
      type: "Type",
      cost: "Ignore Cost",
      plan: "Strengthening Plan",
      scenario: "Scenario",
      run: "Run",
      sovereignIndex: "Sovereign Intelligence Index",
      indexDesc: "Comprehensive measure of Nova capabilities and performance",
    },
  };

  const text = isRtl ? t.ar : t.en;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[85vh] p-0 bg-gradient-to-br from-slate-950 via-violet-950/20 to-slate-950 border-violet-500/30" dir={isRtl ? "rtl" : "ltr"}>
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-violet-500/20">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/20">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent flex items-center gap-2">
                {text.title}
                <Crown className="w-5 h-5 text-amber-400" />
              </DialogTitle>
              <p className="text-sm text-muted-foreground">{text.subtitle}</p>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-full">
          <TabsList className="mx-6 mt-4 grid grid-cols-6 bg-violet-950/50 border border-violet-500/20">
            <TabsTrigger value="capabilities" className="data-[state=active]:bg-violet-600/30 text-xs" data-testid="tab-capabilities">
              <Shield className="w-3 h-3 mr-1" />
              {text.capabilities}
            </TabsTrigger>
            <TabsTrigger value="audit" className="data-[state=active]:bg-violet-600/30 text-xs" data-testid="tab-audit">
              <Globe className="w-3 h-3 mr-1" />
              {text.audit}
            </TabsTrigger>
            <TabsTrigger value="strengths" className="data-[state=active]:bg-violet-600/30 text-xs" data-testid="tab-strengths">
              <TrendingUp className="w-3 h-3 mr-1" />
              {text.strengths}
            </TabsTrigger>
            <TabsTrigger value="weaknesses" className="data-[state=active]:bg-violet-600/30 text-xs" data-testid="tab-weaknesses">
              <TrendingDown className="w-3 h-3 mr-1" />
              {text.weaknesses}
            </TabsTrigger>
            <TabsTrigger value="index" className="data-[state=active]:bg-violet-600/30 text-xs" data-testid="tab-index">
              <Gauge className="w-3 h-3 mr-1" />
              {text.index}
            </TabsTrigger>
            <TabsTrigger value="lab" className="data-[state=active]:bg-violet-600/30 text-xs" data-testid="tab-lab">
              <FlaskConical className="w-3 h-3 mr-1" />
              {text.lab}
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 px-6 py-4">
            <TabsContent value="capabilities" className="mt-0 space-y-4">
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={enableAllCapabilities} className="border-green-500/30 text-green-400" data-testid="btn-enable-all">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {text.enableAll}
                </Button>
                <Button size="sm" variant="outline" onClick={disableAllCapabilities} className="border-red-500/30 text-red-400" data-testid="btn-disable-all">
                  <XCircle className="w-4 h-4 mr-1" />
                  {text.disableAll}
                </Button>
              </div>
              <div className="space-y-3">
                {capabilities.map((cap) => (
                  <Card key={cap.id} className="bg-slate-900/50 border-violet-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${cap.enabled ? "bg-violet-600/30" : "bg-slate-700/50"}`}>
                            {cap.icon}
                          </div>
                          <div>
                            <h4 className="font-medium">{isRtl ? cap.nameAr : cap.nameEn}</h4>
                            <p className="text-xs text-muted-foreground">{isRtl ? cap.descAr : cap.descEn}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {getStatusBadge(cap.status)}
                          <Switch
                            checked={cap.enabled}
                            onCheckedChange={() => toggleCapability(cap.id)}
                            data-testid={`switch-${cap.id}`}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="audit" className="mt-0 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {complianceMetrics.map((metric) => (
                  <Card key={metric.id} className="bg-slate-900/50 border-violet-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{isRtl ? metric.nameAr : metric.nameEn}</span>
                        <span className={`text-lg font-bold ${getComplianceColor(metric.status)}`}>{metric.score}%</span>
                      </div>
                      <Progress value={metric.score} className="h-2" />
                      <div className="mt-2 flex justify-end">
                        {metric.status === "excellent" && <Badge className="bg-green-500/20 text-green-400">{isRtl ? "ممتاز" : "Excellent"}</Badge>}
                        {metric.status === "good" && <Badge className="bg-blue-500/20 text-blue-400">{isRtl ? "جيد" : "Good"}</Badge>}
                        {metric.status === "warning" && <Badge className="bg-amber-500/20 text-amber-400">{isRtl ? "يحتاج تعزيز" : "Needs Improvement"}</Badge>}
                        {metric.status === "critical" && <Badge className="bg-red-500/20 text-red-400">{isRtl ? "حرج" : "Critical"}</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="strengths" className="mt-0 space-y-4">
              {strengths.map((strength) => (
                <Card key={strength.id} className="bg-slate-900/50 border-green-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-green-400" />
                          <h4 className="font-medium text-green-400">{isRtl ? strength.titleAr : strength.titleEn}</h4>
                          <Badge className="bg-green-500/20 text-green-400">{strength.score}%</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{isRtl ? strength.descAr : strength.descEn}</p>
                        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                          <div className="flex items-center gap-2 mb-1">
                            <Lightbulb className="w-4 h-4 text-amber-400" />
                            <span className="text-xs font-medium text-amber-400">{text.amplify}</span>
                          </div>
                          <p className="text-sm">{isRtl ? strength.amplificationAr : strength.amplificationEn}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="weaknesses" className="mt-0 space-y-4">
              {weaknesses.map((weakness) => (
                <Card key={weakness.id} className={`bg-slate-900/50 ${getSeverityColor(weakness.severity)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className={`w-4 h-4 ${weakness.severity === "high" ? "text-red-400" : "text-amber-400"}`} />
                      <h4 className="font-medium">{isRtl ? weakness.titleAr : weakness.titleEn}</h4>
                      <Badge variant="outline" className={weakness.severity === "high" ? "border-red-500/30 text-red-400" : "border-amber-500/30 text-amber-400"}>
                        {weakness.severity === "high" ? (isRtl ? "حرج" : "Critical") : (isRtl ? "متوسط" : "Medium")}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-xs text-muted-foreground">{text.type}</span>
                        <p>{isRtl ? weakness.typeAr : weakness.typeEn}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">{text.cost}</span>
                        <p>{isRtl ? weakness.costAr : weakness.costEn}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">{text.plan}</span>
                        <p className="text-green-400">{isRtl ? weakness.planAr : weakness.planEn}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="index" className="mt-0">
              <Card className="bg-gradient-to-br from-violet-950/50 to-fuchsia-950/50 border-violet-500/30">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-2">{text.sovereignIndex}</h3>
                    <p className="text-muted-foreground">{text.indexDesc}</p>
                  </div>
                  <div className="relative w-48 h-48 mx-auto mb-8">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 animate-pulse" />
                    <div className="absolute inset-4 rounded-full bg-slate-900 flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-5xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                          {sovereignIndex}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">/100</p>
                      </div>
                    </div>
                  </div>
                  <Progress value={sovereignIndex} className="h-3 mb-4" />
                  <div className="grid grid-cols-4 gap-4 mt-8">
                    <div className="text-center p-4 rounded-lg bg-slate-800/50">
                      <Brain className="w-6 h-6 mx-auto mb-2 text-violet-400" />
                      <p className="text-lg font-bold">92%</p>
                      <p className="text-xs text-muted-foreground">{isRtl ? "القدرات" : "Capabilities"}</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-slate-800/50">
                      <Activity className="w-6 h-6 mx-auto mb-2 text-green-400" />
                      <p className="text-lg font-bold">88%</p>
                      <p className="text-xs text-muted-foreground">{isRtl ? "الأداء" : "Performance"}</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-slate-800/50">
                      <Target className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                      <p className="text-lg font-bold">85%</p>
                      <p className="text-xs text-muted-foreground">{isRtl ? "القرارات" : "Decisions"}</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-slate-800/50">
                      <Award className="w-6 h-6 mx-auto mb-2 text-amber-400" />
                      <p className="text-lg font-bold">94%</p>
                      <p className="text-xs text-muted-foreground">{isRtl ? "السوق" : "Market"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="lab" className="mt-0 space-y-4">
              <Card className="bg-slate-900/50 border-violet-500/20 mb-4">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FlaskConical className="w-5 h-5 text-violet-400" />
                    Nova Lab - {isRtl ? "مختبر المحاكاة والتطوير" : "Simulation & Development Lab"}
                  </CardTitle>
                </CardHeader>
              </Card>
              {labScenarios.map((scenario) => (
                <Card key={scenario.id} className="bg-slate-900/50 border-violet-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-violet-600/30">
                          <Beaker className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-medium">{isRtl ? scenario.titleAr : scenario.titleEn}</h4>
                          <p className="text-xs text-muted-foreground">{isRtl ? scenario.descAr : scenario.descEn}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {scenario.status === "completed" && (
                          <Badge className="bg-green-500/20 text-green-400">{isRtl ? "مكتمل" : "Completed"}</Badge>
                        )}
                        {scenario.status === "running" && (
                          <Badge className="bg-blue-500/20 text-blue-400 animate-pulse">{isRtl ? "قيد التشغيل" : "Running"}</Badge>
                        )}
                        {scenario.status === "ready" && (
                          <Button size="sm" variant="outline" className="border-violet-500/30" data-testid={`run-${scenario.id}`}>
                            <Play className="w-4 h-4 mr-1" />
                            {text.run}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export type NovaWindowMode = "docked" | "floating" | "fullscreen";

interface NovaFullscreenState {
  mode: NovaWindowMode;
  previousMode: NovaWindowMode;
}

export function useNovaFullscreen() {
  const [state, setState] = useState<NovaFullscreenState>({
    mode: "docked",
    previousMode: "docked",
  });

  const setMode = (mode: NovaWindowMode) => {
    setState(prev => ({
      mode,
      previousMode: prev.mode,
    }));
  };

  const maximize = () => setMode("fullscreen");
  const minimize = () => setMode("docked");
  const toggleFloating = () => setMode(state.mode === "floating" ? "docked" : "floating");
  const restore = () => setMode(state.previousMode);

  return {
    mode: state.mode,
    isFullscreen: state.mode === "fullscreen",
    isFloating: state.mode === "floating",
    isDocked: state.mode === "docked",
    maximize,
    minimize,
    toggleFloating,
    restore,
    setMode,
  };
}
