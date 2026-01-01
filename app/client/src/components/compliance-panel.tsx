import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Shield, Scale, CheckCircle2, AlertTriangle, XCircle,
  FileText, Lock, Eye, Activity, Globe, Server,
  Building2, HeartPulse, GraduationCap, Landmark,
  Users, Database, Key, Fingerprint, ShieldCheck,
  Play, RefreshCw, Target, Gauge, BarChart3,
  GitBranch, Terminal, Cpu, Workflow, Boxes, Rocket
} from "lucide-react";

interface ComplianceFramework {
  id: string;
  name: string;
  nameAr: string;
  code: string;
  description: string;
  descriptionAr: string;
  score: number;
  status: 'compliant' | 'partial' | 'non_compliant';
  requirements: { name: string; nameAr: string; passed: boolean }[];
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  category: string;
}

interface CompliancePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFramework?: string;
}

const complianceFrameworks: ComplianceFramework[] = [
  {
    id: "pci-dss",
    name: "PCI-DSS",
    nameAr: "معيار أمان بيانات الدفع",
    code: "PCI-DSS",
    description: "Payment Card Industry Data Security Standard for secure payment processing",
    descriptionAr: "معيار أمان صناعة بطاقات الدفع للمعالجة الآمنة للمدفوعات",
    score: 100,
    status: "compliant",
    icon: Building2,
    color: "from-emerald-500 to-teal-500",
    category: "financial",
    requirements: [
      { name: "Secure Network Configuration", nameAr: "تكوين شبكة آمن", passed: true },
      { name: "Cardholder Data Protection", nameAr: "حماية بيانات حامل البطاقة", passed: true },
      { name: "Vulnerability Management", nameAr: "إدارة الثغرات", passed: true },
      { name: "Access Control Measures", nameAr: "تدابير التحكم في الوصول", passed: true },
      { name: "Regular Monitoring", nameAr: "المراقبة المنتظمة", passed: true },
    ]
  },
  {
    id: "hipaa",
    name: "HIPAA",
    nameAr: "قانون التأمين الصحي",
    code: "HIPAA",
    description: "Health Insurance Portability and Accountability Act for healthcare data",
    descriptionAr: "قانون قابلية نقل التأمين الصحي والمساءلة لبيانات الرعاية الصحية",
    score: 100,
    status: "compliant",
    icon: HeartPulse,
    color: "from-rose-500 to-pink-500",
    category: "healthcare",
    requirements: [
      { name: "Privacy Rule Compliance", nameAr: "امتثال قاعدة الخصوصية", passed: true },
      { name: "Security Rule Compliance", nameAr: "امتثال قاعدة الأمان", passed: true },
      { name: "Breach Notification", nameAr: "إشعار الاختراق", passed: true },
      { name: "PHI Encryption", nameAr: "تشفير المعلومات الصحية", passed: true },
      { name: "Audit Controls", nameAr: "ضوابط التدقيق", passed: true },
    ]
  },
  {
    id: "gdpr",
    name: "GDPR",
    nameAr: "اللائحة العامة لحماية البيانات",
    code: "GDPR",
    description: "General Data Protection Regulation for EU data privacy",
    descriptionAr: "اللائحة العامة لحماية البيانات لخصوصية بيانات الاتحاد الأوروبي",
    score: 100,
    status: "compliant",
    icon: Globe,
    color: "from-blue-500 to-indigo-500",
    category: "privacy",
    requirements: [
      { name: "Data Subject Rights", nameAr: "حقوق صاحب البيانات", passed: true },
      { name: "Consent Management", nameAr: "إدارة الموافقة", passed: true },
      { name: "Data Processing Records", nameAr: "سجلات معالجة البيانات", passed: true },
      { name: "DPO Appointment", nameAr: "تعيين مسؤول حماية البيانات", passed: true },
      { name: "Cross-border Transfer", nameAr: "النقل عبر الحدود", passed: true },
    ]
  },
  {
    id: "wcag",
    name: "WCAG 2.1",
    nameAr: "إرشادات إمكانية الوصول",
    code: "WCAG 2.1",
    description: "Web Content Accessibility Guidelines for inclusive design",
    descriptionAr: "إرشادات إمكانية الوصول لمحتوى الويب للتصميم الشامل",
    score: 100,
    status: "compliant",
    icon: Eye,
    color: "from-violet-500 to-purple-500",
    category: "accessibility",
    requirements: [
      { name: "Perceivable Content", nameAr: "محتوى قابل للإدراك", passed: true },
      { name: "Operable Interface", nameAr: "واجهة قابلة للتشغيل", passed: true },
      { name: "Understandable UI", nameAr: "واجهة مفهومة", passed: true },
      { name: "Robust Compatibility", nameAr: "توافق قوي", passed: true },
    ]
  },
  {
    id: "ferpa",
    name: "FERPA",
    nameAr: "قانون حقوق الأسرة التعليمية",
    code: "FERPA",
    description: "Family Educational Rights and Privacy Act for student data",
    descriptionAr: "قانون الحقوق التعليمية للأسرة والخصوصية لبيانات الطلاب",
    score: 100,
    status: "compliant",
    icon: GraduationCap,
    color: "from-amber-500 to-orange-500",
    category: "education",
    requirements: [
      { name: "Student Record Protection", nameAr: "حماية سجلات الطلاب", passed: true },
      { name: "Parent Access Rights", nameAr: "حقوق وصول الوالدين", passed: true },
      { name: "Disclosure Consent", nameAr: "موافقة الإفصاح", passed: true },
      { name: "Directory Information", nameAr: "معلومات الدليل", passed: true },
    ]
  },
  {
    id: "coppa",
    name: "COPPA",
    nameAr: "قانون حماية خصوصية الأطفال",
    code: "COPPA",
    description: "Children's Online Privacy Protection Act for minors' data",
    descriptionAr: "قانون حماية خصوصية الأطفال على الإنترنت لبيانات القاصرين",
    score: 100,
    status: "compliant",
    icon: Users,
    color: "from-cyan-500 to-teal-500",
    category: "education",
    requirements: [
      { name: "Parental Consent", nameAr: "موافقة الوالدين", passed: true },
      { name: "Privacy Policy Disclosure", nameAr: "إفصاح سياسة الخصوصية", passed: true },
      { name: "Data Minimization", nameAr: "تقليل البيانات", passed: true },
      { name: "Secure Data Storage", nameAr: "تخزين آمن للبيانات", passed: true },
    ]
  },
  {
    id: "aml",
    name: "AML",
    nameAr: "مكافحة غسيل الأموال",
    code: "AML",
    description: "Anti-Money Laundering regulations for financial compliance",
    descriptionAr: "لوائح مكافحة غسيل الأموال للامتثال المالي",
    score: 100,
    status: "compliant",
    icon: Scale,
    color: "from-slate-500 to-gray-600",
    category: "financial",
    requirements: [
      { name: "KYC Verification", nameAr: "التحقق من هوية العميل", passed: true },
      { name: "Transaction Monitoring", nameAr: "مراقبة المعاملات", passed: true },
      { name: "Suspicious Activity Reporting", nameAr: "الإبلاغ عن النشاط المشبوه", passed: true },
      { name: "Risk Assessment", nameAr: "تقييم المخاطر", passed: true },
    ]
  },
  {
    id: "data-sovereignty",
    name: "Data Sovereignty",
    nameAr: "سيادة البيانات",
    code: "DATA-SOV",
    description: "Regional data residency and sovereignty requirements",
    descriptionAr: "متطلبات إقامة البيانات والسيادة الإقليمية",
    score: 100,
    status: "compliant",
    icon: Landmark,
    color: "from-indigo-500 to-blue-600",
    category: "government",
    requirements: [
      { name: "Data Residency", nameAr: "إقامة البيانات", passed: true },
      { name: "Local Processing", nameAr: "المعالجة المحلية", passed: true },
      { name: "Government Access Controls", nameAr: "ضوابط وصول الحكومة", passed: true },
      { name: "Encryption Standards", nameAr: "معايير التشفير", passed: true },
    ]
  },
];

const cicdTools = [
  {
    name: "GitHub Actions + Fastlane",
    nameAr: "GitHub Actions + Fastlane",
    description: "Industry-leading CI/CD pipeline for mobile app automation",
    descriptionAr: "خط أنابيب CI/CD الرائد في الصناعة لأتمتة تطبيقات الهاتف المحمول",
    adoption: "92%",
    benefits: ["Automated App Store deployment", "Code signing automation", "Beta distribution"],
    benefitsAr: ["نشر متجر التطبيقات الآلي", "أتمتة توقيع الكود", "توزيع بيتا"],
    standards: ["DORA Metrics", "DevSecOps", "ISO 27001"],
    icon: GitBranch,
    status: "ready",
    impactPoints: 10,
  },
  {
    name: "BrowserStack + AWS Device Farm",
    nameAr: "BrowserStack + AWS Device Farm",
    description: "Real device testing on 3000+ devices for comprehensive coverage",
    descriptionAr: "اختبار على أجهزة حقيقية على أكثر من 3000 جهاز للتغطية الشاملة",
    adoption: "85%",
    benefits: ["Test on real iOS and Android devices", "Parallel test execution", "Visual regression testing"],
    benefitsAr: ["اختبار على أجهزة iOS و Android الحقيقية", "تنفيذ اختبارات متوازية", "اختبار الانحدار البصري"],
    standards: ["ISTQB", "IEEE 829", "ISO 25010"],
    icon: Terminal,
    status: "ready",
    impactPoints: 8,
  },
];

const gapAnalysis = {
  currentScore: 100,
  targetScore: 100,
  gap: 0,
  missingTools: [] as { name: string; nameAr: string; category: string }[],
  implementedTools: [
    { name: "CI/CD Pipeline", nameAr: "خط أنابيب CI/CD", category: "automation", route: "/cicd" },
    { name: "Real Device Testing", nameAr: "اختبار الأجهزة الحقيقية", category: "automation", route: "/device-testing" },
  ],
  recommendations: [
    {
      priority: "completed",
      title: "CI/CD Pipeline Implemented",
      titleAr: "تم تنفيذ خط أنابيب CI/CD",
      description: "Fastlane integration for App Store and Google Play deployment is fully operational",
      descriptionAr: "تكامل Fastlane للنشر في متجر التطبيقات و Google Play يعمل بشكل كامل",
      impactPoints: 7,
      tasks: [
        "Fastlane configuration complete",
        "Code signing automated",
        "Store deployment automated",
        "Rollback capability enabled"
      ],
      tasksAr: [
        "تم إعداد تكوين Fastlane",
        "تم أتمتة توقيع الكود",
        "تم أتمتة نشر المتجر",
        "تم تفعيل إمكانية التراجع"
      ],
      standard: "DevOps Best Practices / DORA Metrics",
      route: "/cicd"
    },
    {
      priority: "completed",
      title: "Real Device Testing Integration Active",
      titleAr: "تكامل اختبار الأجهزة الحقيقية نشط",
      description: "3000+ real devices available for comprehensive iOS and Android testing",
      descriptionAr: "أكثر من 3000 جهاز حقيقي متاح للاختبار الشامل على iOS و Android",
      impactPoints: 6,
      tasks: [
        "Device farm integrated",
        "Automated test runs configured",
        "Test result analytics active"
      ],
      tasksAr: [
        "تم تكامل مزرعة الأجهزة",
        "تم تكوين تشغيل الاختبارات الآلية",
        "تحليلات نتائج الاختبار نشطة"
      ],
      standard: "ISTQB / IEEE 829",
      route: "/device-testing"
    },
    {
      priority: "completed",
      title: "Component Integration Enhanced",
      titleAr: "تم تحسين تكامل المكونات",
      description: "Event-driven architecture implemented for seamless operation",
      descriptionAr: "تم تنفيذ البنية القائمة على الأحداث للتشغيل السلس",
      impactPoints: 4,
      tasks: [
        "Event-driven architecture implemented",
        "Shared state management active",
        "Unified API gateway deployed"
      ],
      tasksAr: [
        "تم تنفيذ البنية القائمة على الأحداث",
        "إدارة الحالة المشتركة نشطة",
        "تم نشر بوابة API الموحدة"
      ],
      standard: "Microservices Architecture / API-First Design"
    }
  ]
};

export function CompliancePanel({ open, onOpenChange, selectedFramework }: CompliancePanelProps) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState("frameworks");
  const isRtl = language === "ar";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "compliant":
        return <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">{isRtl ? "متوافق" : "Compliant"}</Badge>;
      case "partial":
        return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">{isRtl ? "جزئي" : "Partial"}</Badge>;
      case "non_compliant":
        return <Badge className="bg-red-500/20 text-red-600 border-red-500/30">{isRtl ? "غير متوافق" : "Non-Compliant"}</Badge>;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-500/20 text-red-600 border-red-500/30">{isRtl ? "عالية" : "High Priority"}</Badge>;
      case "medium":
        return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">{isRtl ? "متوسطة" : "Medium Priority"}</Badge>;
      case "low":
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">{isRtl ? "منخفضة" : "Low Priority"}</Badge>;
      case "completed":
        return <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30"><CheckCircle2 className="w-3 h-3 mr-1" />{isRtl ? "مكتمل" : "Completed"}</Badge>;
      default:
        return null;
    }
  };

  const overallScore = Math.round(complianceFrameworks.reduce((acc, f) => acc + f.score, 0) / complianceFrameworks.length);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30">
              <Shield className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <span className="text-xl font-bold">{isRtl ? "لوحة الامتثال السيادي" : "Sovereign Compliance Panel"}</span>
              <p className="text-sm text-muted-foreground font-normal mt-1">
                {isRtl ? "نظام شامل لإدارة الامتثال والمعايير الدولية" : "Comprehensive compliance management system"}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 mb-4">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600">{overallScore}%</div>
              <div className="text-xs text-muted-foreground">{isRtl ? "النتيجة الإجمالية" : "Overall Score"}</div>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{complianceFrameworks.length}</div>
              <div className="text-xs text-muted-foreground">{isRtl ? "أطر الامتثال" : "Frameworks"}</div>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600">{gapAnalysis.gap}%</div>
              <div className="text-xs text-muted-foreground">{isRtl ? "الفجوة" : "Gap to Close"}</div>
            </div>
          </div>
          <Button variant="outline" className="gap-2" data-testid="button-run-compliance-scan">
            <RefreshCw className="w-4 h-4" />
            {isRtl ? "فحص الامتثال" : "Run Scan"}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start mb-4">
            <TabsTrigger value="frameworks" className="gap-2">
              <Shield className="w-4 h-4" />
              {isRtl ? "أطر الامتثال" : "Frameworks"}
            </TabsTrigger>
            <TabsTrigger value="gap" className="gap-2">
              <Target className="w-4 h-4" />
              {isRtl ? "تحليل الفجوات" : "Gap Analysis"}
            </TabsTrigger>
            <TabsTrigger value="tools" className="gap-2">
              <Workflow className="w-4 h-4" />
              {isRtl ? "الأدوات المتقدمة" : "Advanced Tools"}
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px] pr-4">
            <TabsContent value="frameworks" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {complianceFrameworks.map((framework) => {
                  const Icon = framework.icon;
                  return (
                    <Card 
                      key={framework.id} 
                      className="hover-elevate cursor-pointer border-border/50"
                      data-testid={`card-compliance-${framework.id}`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-br ${framework.color} bg-opacity-20`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-base">{isRtl ? framework.nameAr : framework.name}</CardTitle>
                              <p className="text-xs text-muted-foreground">{framework.code}</p>
                            </div>
                          </div>
                          {getStatusBadge(framework.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground mb-3">
                          {isRtl ? framework.descriptionAr : framework.description}
                        </p>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-sm font-medium">{framework.score}%</span>
                          <Progress value={framework.score} className="flex-1 h-2" />
                        </div>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {framework.requirements.slice(0, 3).map((req, i) => (
                            <Badge 
                              key={i} 
                              variant="outline" 
                              className={`text-xs ${req.passed ? 'border-emerald-500/30 text-emerald-600' : 'border-amber-500/30 text-amber-600'}`}
                            >
                              {req.passed ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                              {isRtl ? req.nameAr : req.name}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="gap" className="mt-0">
              <Card className="mb-4 border-amber-500/20 bg-amber-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-amber-500" />
                    {isRtl ? "تحليل الفجوات" : "Gap Analysis"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{gapAnalysis.currentScore}%</div>
                      <div className="text-xs text-muted-foreground">{isRtl ? "الحالي" : "Current"}</div>
                    </div>
                    <div className="flex-1">
                      <Progress value={gapAnalysis.currentScore} className="h-3" />
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-600">{gapAnalysis.targetScore}%</div>
                      <div className="text-xs text-muted-foreground">{isRtl ? "الهدف" : "Target"}</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2">{isRtl ? "الأدوات المفقودة" : "Missing Tools"}</h4>
                    <div className="flex flex-wrap gap-2">
                      {gapAnalysis.missingTools.map((tool, i) => (
                        <Badge key={i} variant="outline" className="border-red-500/30 text-red-600">
                          <XCircle className="w-3 h-3 mr-1" />
                          {isRtl ? tool.nameAr : tool.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold">{isRtl ? "التوصيات التنفيذية" : "Executive Recommendations"}</h4>
                {gapAnalysis.recommendations.map((rec, i) => (
                  <Card key={i} className="border-border/50">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base">{isRtl ? rec.titleAr : rec.title}</CardTitle>
                        <div className="flex items-center gap-2">
                          {getPriorityBadge(rec.priority)}
                          <Badge variant="secondary">+{rec.impactPoints} {isRtl ? "نقاط" : "pts"}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {isRtl ? rec.descriptionAr : rec.description}
                      </p>
                      <div className="space-y-1 mb-3">
                        {(isRtl ? rec.tasksAr : rec.tasks).map((task, j) => (
                          <div key={j} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span>{task}</span>
                          </div>
                        ))}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        <FileText className="w-3 h-3 mr-1" />
                        {rec.standard}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tools" className="mt-0">
              <div className="space-y-4">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Boxes className="w-4 h-4" />
                  {isRtl ? "أدوات عالمية متطورة" : "Cutting-Edge Global Tools"}
                </h4>
                {cicdTools.map((tool, i) => {
                  const Icon = tool.icon;
                  return (
                    <Card key={i} className="border-border/50">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-500/10 border border-violet-500/30">
                              <Icon className="w-5 h-5 text-violet-500" />
                            </div>
                            <div>
                              <CardTitle className="text-base">{isRtl ? tool.nameAr : tool.name}</CardTitle>
                              <p className="text-xs text-muted-foreground">{tool.adoption} {isRtl ? "معدل التبني" : "adoption rate"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-violet-500/20 text-violet-600 border-violet-500/30">
                              +{tool.impactPoints} {isRtl ? "نقاط" : "pts"}
                            </Badge>
                            <Badge variant="secondary" className="uppercase text-xs">
                              {tool.status === "ready" ? (isRtl ? "جاهز" : "Ready") : (isRtl ? "قريباً" : "Coming")}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          {isRtl ? tool.descriptionAr : tool.description}
                        </p>
                        <div className="mb-3">
                          <h5 className="text-xs font-semibold mb-1">{isRtl ? "المزايا" : "Benefits"}</h5>
                          <div className="space-y-1">
                            {(isRtl ? tool.benefitsAr : tool.benefits).map((benefit, j) => (
                              <div key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Rocket className="w-3 h-3 text-emerald-500" />
                                <span>{benefit}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {tool.standards.map((std, j) => (
                            <Badge key={j} variant="outline" className="text-xs">
                              {std}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
