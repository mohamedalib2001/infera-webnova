import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Shield, 
  Brain, 
  Zap, 
  Lock, 
  Globe, 
  Layers, 
  RefreshCw, 
  Server,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Scale,
  Gavel,
  Crown,
  Target,
  Rocket,
  Code2,
  Database,
  Cpu,
  Eye,
  Settings2,
  BookOpen,
  Fingerprint,
  ClipboardCheck,
  ListChecks,
  CheckSquare,
  Square,
  Sparkles,
  Activity,
  TrendingUp,
  Users,
  Wrench,
  Play
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";

interface PolicySection {
  id: string;
  titleAr: string;
  titleEn: string;
  icon: React.ReactNode;
  level: "critical" | "high" | "standard";
  requirements: PolicyRequirement[];
}

interface PolicyRequirement {
  textAr: string;
  textEn: string;
  type: "mandatory" | "prohibited" | "allowed";
}

const policySections: PolicySection[] = [
  {
    id: "supreme-principle",
    titleAr: "المبدأ الأعلى السيادي",
    titleEn: "Supreme Sovereign Principle",
    icon: <Crown className="h-5 w-5" />,
    level: "critical",
    requirements: [
      {
        textAr: "جميع منصات مجموعة INFERA تُنشأ وتُدار وتُطوَّر وفق نموذج سيادي متفوق",
        textEn: "All INFERA platforms are created, managed, and developed according to a superior sovereign model",
        type: "mandatory"
      },
      {
        textAr: "لا يُقبل الحلول التقليدية أو الأنظمة المحدودة أو أي تنازل تقني أو أمني",
        textEn: "Traditional solutions, limited systems, or any technical/security compromises are not accepted",
        type: "prohibited"
      },
      {
        textAr: "كل منصة يجب أن تكون مكتملة الأركان وقابلة للتشغيل الفوري",
        textEn: "Every platform must be fully complete and immediately operational",
        type: "mandatory"
      }
    ]
  },
  {
    id: "no-mockups",
    titleAr: "حظر المحاكاة والنماذج الوهمية",
    titleEn: "Prohibition of Mockups & Simulations",
    icon: <XCircle className="h-5 w-5" />,
    level: "critical",
    requirements: [
      {
        textAr: "يُمنع منعًا باتًا إنشاء منصات محاكاة أو نماذج وهمية غير عاملة",
        textEn: "Creation of simulation platforms or non-functional mockups is strictly prohibited",
        type: "prohibited"
      },
      {
        textAr: "كل منصة يجب أن تحتوي على قاعدة بيانات حقيقية ونظام تسجيل فعّال",
        textEn: "Every platform must have a real database and functional registration system",
        type: "mandatory"
      },
      {
        textAr: "جميع الوظائف والميزات يجب أن تعمل بشكل كامل وليس للعرض فقط",
        textEn: "All functions and features must be fully operational, not just for display",
        type: "mandatory"
      },
      {
        textAr: "يُسمح بتسجيل بيانات اختبارية مع زر تهيئة لمسحها",
        textEn: "Test data registration is allowed with a reset button to clear it",
        type: "allowed"
      }
    ]
  },
  {
    id: "zero-code",
    titleAr: "الالتزام المطلق بنموذج 0-Code",
    titleEn: "Absolute Commitment to 0-Code Model",
    icon: <Code2 className="h-5 w-5" />,
    level: "critical",
    requirements: [
      {
        textAr: "يُمنع كتابة كود يدوي داخل المنصات المُنشأة",
        textEn: "Manual code writing inside created platforms is prohibited",
        type: "prohibited"
      },
      {
        textAr: "يُمنع إدراج Custom Scripts أو Plugins غير سيادية أو حلول خارج WebNova",
        textEn: "Custom scripts, non-sovereign plugins, or solutions outside WebNova are prohibited",
        type: "prohibited"
      },
      {
        textAr: "يُسمح فقط بـ No-Code / Visual Logic / AI Workflows / Declarative Config / Event Automation",
        textEn: "Only No-Code / Visual Logic / AI Workflows / Declarative Config / Event Automation allowed",
        type: "allowed"
      },
      {
        textAr: "المنصة تُبنى بالعقل والذكاء الاصطناعي لا بالكود اليدوي",
        textEn: "Platform is built with intelligence and AI, not manual code",
        type: "mandatory"
      }
    ]
  },
  {
    id: "full-dynamic",
    titleAr: "الالتزام بالديناميكية الكاملة 100%",
    titleEn: "100% Full Dynamic Commitment",
    icon: <RefreshCw className="h-5 w-5" />,
    level: "critical",
    requirements: [
      {
        textAr: "جميع مكونات المنصات (UI, Workflows, Permissions, Data Models) ديناميكية بالكامل",
        textEn: "All platform components (UI, Workflows, Permissions, Data Models) must be fully dynamic",
        type: "mandatory"
      },
      {
        textAr: "يُمنع: Hardcoded Pages, Static Flows, Fixed Roles, أي جامدات لا تتغير",
        textEn: "Prohibited: Hardcoded Pages, Static Flows, Fixed Roles, any unchangeable elements",
        type: "prohibited"
      },
      {
        textAr: "أي انحراف عن الديناميكية = مخالفة سيادية جسيمة",
        textEn: "Any deviation from dynamism = serious sovereign violation",
        type: "prohibited"
      }
    ]
  },
  {
    id: "scalability",
    titleAr: "البنية التحتية والتوسع",
    titleEn: "Infrastructure & Scalability",
    icon: <Server className="h-5 w-5" />,
    level: "high",
    requirements: [
      {
        textAr: "Cloud-Native Architecture مع Microservices / Modular Design",
        textEn: "Cloud-Native Architecture with Microservices / Modular Design",
        type: "mandatory"
      },
      {
        textAr: "Horizontal & Vertical Scaling مع Zero Downtime Expansion",
        textEn: "Horizontal & Vertical Scaling with Zero Downtime Expansion",
        type: "mandatory"
      },
      {
        textAr: "يُمنع: أنظمة لا تقبل التوسع، تصميم يقفل التطوير، قيود Vendor Lock-in",
        textEn: "Prohibited: Non-scalable systems, development-locking designs, Vendor Lock-in",
        type: "prohibited"
      }
    ]
  },
  {
    id: "latest-tech",
    titleAr: "أحدث الأدوات والتقنيات",
    titleEn: "Latest Tools & Technologies",
    icon: <Cpu className="h-5 w-5" />,
    level: "high",
    requirements: [
      {
        textAr: "اعتماد أحدث Frameworks, AI Engines, Databases, Security Models",
        textEn: "Adopt latest Frameworks, AI Engines, Databases, Security Models",
        type: "mandatory"
      },
      {
        textAr: "تحديث دوري إلزامي وإزالة أي تقنية متأخرة فورًا",
        textEn: "Mandatory periodic updates and immediate removal of outdated technology",
        type: "mandatory"
      },
      {
        textAr: "أي أداة غير حديثة = خطر استراتيجي",
        textEn: "Any outdated tool = strategic risk",
        type: "prohibited"
      }
    ]
  },
  {
    id: "ai-first",
    titleAr: "الذكاء الاصطناعي أولاً",
    titleEn: "AI First - AI Everywhere",
    icon: <Brain className="h-5 w-5" />,
    level: "critical",
    requirements: [
      {
        textAr: "كل منصة تحتوي على: AI Core, AI Assistant, Predictive Engine, Behavioral Intelligence",
        textEn: "Every platform contains: AI Core, AI Assistant, Predictive Engine, Behavioral Intelligence",
        type: "mandatory"
      },
      {
        textAr: "يُمنع: أنظمة CRUD فقط، لوحات تقليدية، عمليات يدوية",
        textEn: "Prohibited: CRUD-only systems, traditional dashboards, manual operations",
        type: "prohibited"
      },
      {
        textAr: "لا منصة بدون ذكاء = لا منصة مقبولة",
        textEn: "No platform without AI = No acceptable platform",
        type: "mandatory"
      }
    ]
  },
  {
    id: "no-legacy",
    titleAr: "حظر الأنظمة المتأخرة",
    titleEn: "Prohibition of Legacy Systems",
    icon: <AlertTriangle className="h-5 w-5" />,
    level: "high",
    requirements: [
      {
        textAr: "يُحظر: Legacy Systems, Copy-Paste SaaS, تقنيات السوق المستهلكة",
        textEn: "Prohibited: Legacy Systems, Copy-Paste SaaS, exhausted market technologies",
        type: "prohibited"
      },
      {
        textAr: "يُحظر: واجهات مملة أو متكررة",
        textEn: "Prohibited: Boring or repetitive interfaces",
        type: "prohibited"
      },
      {
        textAr: "المطلوب: أنظمة تتعلم، تتوقع، تقترح، تتصرف بذكاء",
        textEn: "Required: Systems that learn, predict, suggest, act intelligently",
        type: "mandatory"
      }
    ]
  },
  {
    id: "global-standards",
    titleAr: "المعايير العالمية",
    titleEn: "Global Standards Compliance",
    icon: <Globe className="h-5 w-5" />,
    level: "standard",
    requirements: [
      {
        textAr: "الالتزام بـ ISO / NIST / SOC2 / GDPR / Zero Trust",
        textEn: "Compliance with ISO / NIST / SOC2 / GDPR / Zero Trust",
        type: "mandatory"
      },
      {
        textAr: "UX/UI وفق أحدث Design Systems مع Accessibility & Performance Metrics",
        textEn: "UX/UI following latest Design Systems with Accessibility & Performance Metrics",
        type: "mandatory"
      },
      {
        textAr: "Data Governance & Compliance إلزامي",
        textEn: "Data Governance & Compliance is mandatory",
        type: "mandatory"
      }
    ]
  },
  {
    id: "sovereign-security",
    titleAr: "الأمن السيادي الشامل",
    titleEn: "Comprehensive Sovereign Security",
    icon: <Shield className="h-5 w-5" />,
    level: "critical",
    requirements: [
      {
        textAr: "Zero-Trust Architecture مع End-to-End Encryption",
        textEn: "Zero-Trust Architecture with End-to-End Encryption",
        type: "mandatory"
      },
      {
        textAr: "AI Threat Detection مع Continuous Penetration Monitoring",
        textEn: "AI Threat Detection with Continuous Penetration Monitoring",
        type: "mandatory"
      },
      {
        textAr: "Automated Incident Response - منصات غير قابلة للاختراق نظريًا وعمليًا",
        textEn: "Automated Incident Response - Platforms theoretically and practically unhackable",
        type: "mandatory"
      }
    ]
  },
  {
    id: "market-superiority",
    titleAr: "التفوق على المنافسين",
    titleEn: "Market Superiority",
    icon: <Target className="h-5 w-5" />,
    level: "high",
    requirements: [
      {
        textAr: "كل منصة يجب أن تتفوق على: Salesforce, SAP, ServiceNow, Palantir",
        textEn: "Every platform must surpass: Salesforce, SAP, ServiceNow, Palantir",
        type: "mandatory"
      },
      {
        textAr: "ليس بالتقليد بل بالتجاوز النوعي",
        textEn: "Not by imitation but by qualitative transcendence",
        type: "mandatory"
      }
    ]
  },
  {
    id: "unique-features",
    titleAr: "أدوات وخدمات فريدة",
    titleEn: "Unique Tools & Services",
    icon: <Zap className="h-5 w-5" />,
    level: "high",
    requirements: [
      {
        textAr: "كل منصة تحتوي على Features غير موجودة بالسوق",
        textEn: "Every platform contains features not found in the market",
        type: "mandatory"
      },
      {
        textAr: "Value فورية للمستخدم مع WOW Effect من أول استخدام",
        textEn: "Immediate value to user with WOW Effect from first use",
        type: "mandatory"
      },
      {
        textAr: "المستخدم لا يُقنع... بل ينجذب تلقائيًا",
        textEn: "User is not convinced... but automatically attracted",
        type: "mandatory"
      }
    ]
  },
  {
    id: "webnova-only",
    titleAr: "النشر عبر WebNova فقط",
    titleEn: "Deployment via WebNova Only",
    icon: <Rocket className="h-5 w-5" />,
    level: "critical",
    requirements: [
      {
        textAr: "One-Click Deploy مع Versioning, Rollback, Environment Control",
        textEn: "One-Click Deploy with Versioning, Rollback, Environment Control",
        type: "mandatory"
      },
      {
        textAr: "يُمنع: أي نشر خارجي أو تعديل خارج WebNova",
        textEn: "Prohibited: Any external deployment or modification outside WebNova",
        type: "prohibited"
      }
    ]
  },
  {
    id: "maintenance",
    titleAr: "الصيانة والتحديث",
    titleEn: "Maintenance & Updates",
    icon: <Settings2 className="h-5 w-5" />,
    level: "standard",
    requirements: [
      {
        textAr: "تحديث المنصات Live, On-Server, بدون توقف",
        textEn: "Platform updates Live, On-Server, without downtime",
        type: "mandatory"
      },
      {
        textAr: "صيانة أمنية ووظيفية وذكية مستمرة",
        textEn: "Continuous security, functional, and intelligent maintenance",
        type: "mandatory"
      }
    ]
  },
  {
    id: "future-expansion",
    titleAr: "التوسع المستقبلي",
    titleEn: "Future Expansion",
    icon: <Layers className="h-5 w-5" />,
    level: "standard",
    requirements: [
      {
        textAr: "Modular Expansion مع Plug-in AI Features",
        textEn: "Modular Expansion with Plug-in AI Features",
        type: "mandatory"
      },
      {
        textAr: "No Refactoring Required مع Forward-Compatible Design",
        textEn: "No Refactoring Required with Forward-Compatible Design",
        type: "mandatory"
      },
      {
        textAr: "المنصة لا تُغلق... بل تتطور للأبد",
        textEn: "Platform never closes... but evolves forever",
        type: "mandatory"
      }
    ]
  },
  {
    id: "test-data",
    titleAr: "بيانات الاختبار والتهيئة",
    titleEn: "Test Data & Reset",
    icon: <Database className="h-5 w-5" />,
    level: "standard",
    requirements: [
      {
        textAr: "يُسمح بتسجيل بيانات وهمية لتجربة المنصة",
        textEn: "Test/demo data registration is allowed for platform testing",
        type: "allowed"
      },
      {
        textAr: "يجب توفير زر تهيئة البيانات لحذف البيانات الوهمية",
        textEn: "A data reset button must be provided to delete test data",
        type: "mandatory"
      },
      {
        textAr: "زر التهيئة يعمل مرة واحدة ويحذف جميع البيانات الاختبارية",
        textEn: "Reset button works once and deletes all test data",
        type: "mandatory"
      }
    ]
  }
];

interface ChecklistCategory {
  id: string;
  titleAr: string;
  titleEn: string;
  icon: React.ReactNode;
  items: ChecklistItem[];
}

interface ChecklistItem {
  id: string;
  textAr: string;
  textEn: string;
  critical?: boolean;
}

const checklistCategories: ChecklistCategory[] = [
  {
    id: "sovereign-identity",
    titleAr: "التحقق من الهوية السيادية للمنصة",
    titleEn: "Sovereign Identity Verification",
    icon: <Fingerprint className="h-5 w-5" />,
    items: [
      { id: "si-1", textAr: "ربط المنصة بالحساب السيادي فقط", textEn: "Link platform to sovereign account only", critical: true },
      { id: "si-2", textAr: "منع الظهور في Marketplace أو أي حساب آخر", textEn: "Prevent appearance in Marketplace or other accounts", critical: true },
      { id: "si-3", textAr: "توقيع ملكية سيادية مشفّرة (Encrypted Ownership Signature)", textEn: "Encrypted sovereign ownership signature", critical: true },
      { id: "si-4", textAr: "تفعيل Sovereign Isolation (Data + Logic + Access)", textEn: "Enable Sovereign Isolation (Data + Logic + Access)" },
      { id: "si-5", textAr: "تفعيل Emergency Override من INFERA Engine Control", textEn: "Enable Emergency Override from INFERA Engine Control" }
    ]
  },
  {
    id: "zero-code-compliance",
    titleAr: "الالتزام المطلق بـ 0-Code",
    titleEn: "Absolute 0-Code Compliance",
    icon: <Code2 className="h-5 w-5" />,
    items: [
      { id: "zc-1", textAr: "عدم كتابة أي كود يدوي", textEn: "No manual code writing", critical: true },
      { id: "zc-2", textAr: "عدم إدراج Scripts خارج Infra Web Nova", textEn: "No external scripts outside Infra Web Nova", critical: true },
      { id: "zc-3", textAr: "استخدام Visual Logic فقط", textEn: "Use Visual Logic only" },
      { id: "zc-4", textAr: "استخدام Declarative Workflows", textEn: "Use Declarative Workflows" },
      { id: "zc-5", textAr: "استخدام Event Triggers", textEn: "Use Event Triggers" },
      { id: "zc-6", textAr: "استخدام AI Orchestration", textEn: "Use AI Orchestration" },
      { id: "zc-7", textAr: "مراجعة تلقائية تمنع أي عنصر Code-Based", textEn: "Automatic review prevents any Code-Based elements" }
    ]
  },
  {
    id: "full-dynamic",
    titleAr: "الديناميكية الكاملة 100%",
    titleEn: "100% Full Dynamic",
    icon: <RefreshCw className="h-5 w-5" />,
    items: [
      { id: "fd-1", textAr: "جميع الصفحات Dynamic", textEn: "All pages are Dynamic", critical: true },
      { id: "fd-2", textAr: "جميع الصلاحيات Dynamic", textEn: "All permissions are Dynamic", critical: true },
      { id: "fd-3", textAr: "جميع الـ Workflows قابلة للتعديل Live", textEn: "All Workflows are Live-editable" },
      { id: "fd-4", textAr: "عدم وجود Hardcoded Roles", textEn: "No Hardcoded Roles" },
      { id: "fd-5", textAr: "عدم وجود Static Pages", textEn: "No Static Pages" },
      { id: "fd-6", textAr: "عدم وجود Fixed Logic", textEn: "No Fixed Logic" },
      { id: "fd-7", textAr: "دعم التغيير بدون إعادة نشر", textEn: "Support changes without redeployment" }
    ]
  },
  {
    id: "scalability",
    titleAr: "البنية التحتية والتوسع",
    titleEn: "Infrastructure & Scalability",
    icon: <Server className="h-5 w-5" />,
    items: [
      { id: "sc-1", textAr: "Cloud-Native Architecture", textEn: "Cloud-Native Architecture" },
      { id: "sc-2", textAr: "Modular / Micro-Modules Design", textEn: "Modular / Micro-Modules Design" },
      { id: "sc-3", textAr: "Horizontal & Vertical Scaling Enabled", textEn: "Horizontal & Vertical Scaling Enabled" },
      { id: "sc-4", textAr: "No Vendor Lock-In", textEn: "No Vendor Lock-In" },
      { id: "sc-5", textAr: "Zero Downtime Expansion", textEn: "Zero Downtime Expansion" },
      { id: "sc-6", textAr: "المنصة لا تصل لنقطة تشبّع تقني", textEn: "Platform never reaches technical saturation" }
    ]
  },
  {
    id: "technology-freshness",
    titleAr: "أحدث التقنيات فقط",
    titleEn: "Latest Technologies Only",
    icon: <Sparkles className="h-5 w-5" />,
    items: [
      { id: "tf-1", textAr: "استخدام أحدث Databases", textEn: "Use latest Databases" },
      { id: "tf-2", textAr: "استخدام أحدث AI Models", textEn: "Use latest AI Models" },
      { id: "tf-3", textAr: "استخدام أحدث UI Engines", textEn: "Use latest UI Engines" },
      { id: "tf-4", textAr: "استخدام أحدث Security Frameworks", textEn: "Use latest Security Frameworks" },
      { id: "tf-5", textAr: "فحص تلقائي يمنع Legacy Tools", textEn: "Automatic check prevents Legacy Tools" },
      { id: "tf-6", textAr: "تحديث دوري إجباري", textEn: "Mandatory periodic updates" }
    ]
  },
  {
    id: "ai-core",
    titleAr: "الذكاء الاصطناعي – شرط وجودي",
    titleEn: "AI - Existential Requirement",
    icon: <Brain className="h-5 w-5" />,
    items: [
      { id: "ai-1", textAr: "AI Core مدمج", textEn: "Integrated AI Core", critical: true },
      { id: "ai-2", textAr: "AI Assistant داخل المنصة", textEn: "AI Assistant inside platform", critical: true },
      { id: "ai-3", textAr: "Predictive Engine مفعل", textEn: "Predictive Engine enabled" },
      { id: "ai-4", textAr: "Behavioral Analytics", textEn: "Behavioral Analytics" },
      { id: "ai-5", textAr: "Smart Recommendations", textEn: "Smart Recommendations" },
      { id: "ai-6", textAr: "AI يعمل في القرارات والواجهات والتنبيهات والتحليل", textEn: "AI works in decisions, interfaces, alerts, and analysis" }
    ]
  },
  {
    id: "no-legacy",
    titleAr: "حظر الأنظمة الغبية أو التقليدية",
    titleEn: "Prohibition of Legacy/Traditional Systems",
    icon: <XCircle className="h-5 w-5" />,
    items: [
      { id: "nl-1", textAr: "لا CRUD فقط", textEn: "No CRUD-only systems" },
      { id: "nl-2", textAr: "لا Dashboards تقليدية", textEn: "No traditional Dashboards" },
      { id: "nl-3", textAr: "لا عمليات يدوية", textEn: "No manual operations" },
      { id: "nl-4", textAr: "لا UX ممل أو مكرر", textEn: "No boring or repetitive UX" },
      { id: "nl-5", textAr: "المنصة: تفهم، تتوقع، تقترح، تتصرف", textEn: "Platform: understands, predicts, suggests, acts" }
    ]
  },
  {
    id: "global-standards",
    titleAr: "الالتزام بالمعايير العالمية",
    titleEn: "Global Standards Compliance",
    icon: <Globe className="h-5 w-5" />,
    items: [
      { id: "gs-1", textAr: "ISO / NIST / SOC2 Awareness", textEn: "ISO / NIST / SOC2 Awareness" },
      { id: "gs-2", textAr: "GDPR / Data Privacy", textEn: "GDPR / Data Privacy" },
      { id: "gs-3", textAr: "Zero Trust Architecture", textEn: "Zero Trust Architecture" },
      { id: "gs-4", textAr: "Accessibility Standards", textEn: "Accessibility Standards" },
      { id: "gs-5", textAr: "Performance Benchmarks (Global Grade)", textEn: "Performance Benchmarks (Global Grade)" }
    ]
  },
  {
    id: "cyber-immunity",
    titleAr: "الأمن السيادي الشامل (Cyber Immunity)",
    titleEn: "Comprehensive Sovereign Security",
    icon: <Shield className="h-5 w-5" />,
    items: [
      { id: "ci-1", textAr: "Zero-Trust Access", textEn: "Zero-Trust Access", critical: true },
      { id: "ci-2", textAr: "End-to-End Encryption", textEn: "End-to-End Encryption", critical: true },
      { id: "ci-3", textAr: "AI Threat Detection", textEn: "AI Threat Detection" },
      { id: "ci-4", textAr: "Continuous Monitoring", textEn: "Continuous Monitoring" },
      { id: "ci-5", textAr: "Automated Incident Response", textEn: "Automated Incident Response" },
      { id: "ci-6", textAr: "No Single Point of Failure", textEn: "No Single Point of Failure" }
    ]
  },
  {
    id: "benchmark-kill",
    titleAr: "التفوق على المنافسين",
    titleEn: "Benchmark Kill - Market Superiority",
    icon: <TrendingUp className="h-5 w-5" />,
    items: [
      { id: "bk-1", textAr: "مقارنة مباشرة مع Salesforce, SAP, ServiceNow, Palantir", textEn: "Direct comparison with Salesforce, SAP, ServiceNow, Palantir" },
      { id: "bk-2", textAr: "المنصة أسرع", textEn: "Platform is faster" },
      { id: "bk-3", textAr: "المنصة أذكى", textEn: "Platform is smarter" },
      { id: "bk-4", textAr: "المنصة أكثر سيطرة", textEn: "Platform has more control" },
      { id: "bk-5", textAr: "المنصة أكثر مرونة", textEn: "Platform is more flexible" },
      { id: "bk-6", textAr: "لا تقليد – فقط تجاوز", textEn: "No imitation – only transcendence" }
    ]
  },
  {
    id: "user-value",
    titleAr: "الجاذبية والقيمة الفورية للمستخدم",
    titleEn: "User Attraction & Immediate Value",
    icon: <Sparkles className="h-5 w-5" />,
    items: [
      { id: "uv-1", textAr: "Features فريدة غير موجودة بالسوق", textEn: "Unique features not found in market" },
      { id: "uv-2", textAr: "WOW Effect من أول دخول", textEn: "WOW Effect from first entry" },
      { id: "uv-3", textAr: "Value واضحة خلال أول 60 ثانية", textEn: "Clear value within first 60 seconds" },
      { id: "uv-4", textAr: "UX يجعل المستخدم يريد الاستمرار", textEn: "UX makes user want to continue" },
      { id: "uv-5", textAr: "أدوات تجعل المنصة لا تُستبدل", textEn: "Tools that make platform irreplaceable" }
    ]
  },
  {
    id: "deployment",
    titleAr: "النشر والتشغيل عبر Web Nova فقط",
    titleEn: "Deployment via Web Nova Only",
    icon: <Rocket className="h-5 w-5" />,
    items: [
      { id: "dp-1", textAr: "One-Click Deploy", textEn: "One-Click Deploy" },
      { id: "dp-2", textAr: "Version Control", textEn: "Version Control" },
      { id: "dp-3", textAr: "Rollback", textEn: "Rollback" },
      { id: "dp-4", textAr: "Environment Management", textEn: "Environment Management" },
      { id: "dp-5", textAr: "لا نشر خارجي", textEn: "No external deployment", critical: true },
      { id: "dp-6", textAr: "لا تعديل خارج Web Nova", textEn: "No modifications outside Web Nova", critical: true }
    ]
  },
  {
    id: "live-maintenance",
    titleAr: "التحديث والصيانة Live",
    titleEn: "Live Maintenance & Updates",
    icon: <Wrench className="h-5 w-5" />,
    items: [
      { id: "lm-1", textAr: "تحديث المنصة وهي تعمل", textEn: "Update platform while running" },
      { id: "lm-2", textAr: "صيانة أمنية بدون Downtime", textEn: "Security maintenance without Downtime" },
      { id: "lm-3", textAr: "تعديل Features مباشرة من Web Nova", textEn: "Modify Features directly from Web Nova" },
      { id: "lm-4", textAr: "Logs + Health Monitoring", textEn: "Logs + Health Monitoring" }
    ]
  },
  {
    id: "infinite-expansion",
    titleAr: "قابلية التطوير اللانهائي",
    titleEn: "Infinite Expansion Capability",
    icon: <Layers className="h-5 w-5" />,
    items: [
      { id: "ie-1", textAr: "إضافة Features بدون Refactoring", textEn: "Add Features without Refactoring" },
      { id: "ie-2", textAr: "Modular Feature Injection", textEn: "Modular Feature Injection" },
      { id: "ie-3", textAr: "AI Feature Plug-ins", textEn: "AI Feature Plug-ins" },
      { id: "ie-4", textAr: "Forward Compatibility", textEn: "Forward Compatibility" },
      { id: "ie-5", textAr: "المنصة لا تتقفل أبدًا", textEn: "Platform never locks down" }
    ]
  },
  {
    id: "final-verification",
    titleAr: "التحقق النهائي قبل النشر (Go / No-Go)",
    titleEn: "Final Verification Before Deployment",
    icon: <Play className="h-5 w-5" />,
    items: [
      { id: "fv-1", textAr: "جميع البنود مكتملة", textEn: "All items complete", critical: true },
      { id: "fv-2", textAr: "مراجعة سيادية من INFERA Engine", textEn: "Sovereign review by INFERA Engine", critical: true },
      { id: "fv-3", textAr: "اختبار أمان", textEn: "Security testing" },
      { id: "fv-4", textAr: "اختبار أداء", textEn: "Performance testing" },
      { id: "fv-5", textAr: "اختبار ذكاء", textEn: "AI testing" },
      { id: "fv-6", textAr: "اعتماد النشر", textEn: "Deployment approval" }
    ]
  }
];

export default function OwnerPolicies() {
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [mainTab, setMainTab] = useState<"directive" | "checklist">("directive");
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const totalChecklistItems = checklistCategories.reduce((acc, cat) => acc + cat.items.length, 0);
  const criticalChecklistItems = checklistCategories.reduce(
    (acc, cat) => acc + cat.items.filter(item => item.critical).length, 0
  );
  const checkedCount = checkedItems.size;
  const completionPercentage = totalChecklistItems > 0 ? Math.round((checkedCount / totalChecklistItems) * 100) : 0;

  const toggleCheckItem = (id: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedItems(newChecked);
  };

  const resetChecklist = () => {
    setCheckedItems(new Set());
  };

  const getLevelBadge = (level: PolicySection["level"]) => {
    switch (level) {
      case "critical":
        return <Badge variant="destructive" className="text-xs">حرج / Critical</Badge>;
      case "high":
        return <Badge className="bg-orange-500 text-white text-xs">عالي / High</Badge>;
      case "standard":
        return <Badge variant="secondary" className="text-xs">قياسي / Standard</Badge>;
    }
  };

  const getRequirementIcon = (type: PolicyRequirement["type"]) => {
    switch (type) {
      case "mandatory":
        return <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />;
      case "prohibited":
        return <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />;
      case "allowed":
        return <Eye className="h-4 w-4 text-blue-500 flex-shrink-0" />;
    }
  };

  const criticalSections = policySections.filter(s => s.level === "critical");
  const highSections = policySections.filter(s => s.level === "high");
  const standardSections = policySections.filter(s => s.level === "standard");

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4 bg-background sticky top-0 z-10">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-primary/10">
              <Gavel className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold" data-testid="text-page-title">
                {language === "ar" ? "سياسات حساب المالك" : "Owner Account Policies"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {language === "ar" 
                  ? "الوثيقة السيادية الملزمة لبناء منصات INFERA" 
                  : "Binding Sovereign Directive for INFERA Platform Creation"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={language === "ar" ? "default" : "outline"}
              size="sm"
              onClick={() => setLanguage("ar")}
              data-testid="button-lang-ar"
            >
              العربية
            </Button>
            <Button
              variant={language === "en" ? "default" : "outline"}
              size="sm"
              onClick={() => setLanguage("en")}
              data-testid="button-lang-en"
            >
              English
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6 max-w-5xl mx-auto">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={mainTab === "directive" ? "default" : "outline"}
              onClick={() => setMainTab("directive")}
              className="gap-2"
              data-testid="button-main-tab-directive"
            >
              <FileText className="h-4 w-4" />
              {language === "ar" ? "الوثيقة التوجيهية" : "Directive Document"}
            </Button>
            <Button
              variant={mainTab === "checklist" ? "default" : "outline"}
              onClick={() => setMainTab("checklist")}
              className="gap-2"
              data-testid="button-main-tab-checklist"
            >
              <ClipboardCheck className="h-4 w-4" />
              {language === "ar" ? "قائمة التحقق الإلزامية" : "Mandatory Checklist"}
              <Badge variant="secondary" className="text-xs">
                {checkedCount}/{totalChecklistItems}
              </Badge>
            </Button>
          </div>

          {mainTab === "checklist" ? (
            <>
              <Alert className="border-red-500/50 bg-red-500/5">
                <ClipboardCheck className="h-5 w-5 text-red-500" />
                <AlertTitle className="font-bold">
                  {language === "ar" 
                    ? "قائمة التحقق الإلزامية - ملزمة 100%" 
                    : "Mandatory Checklist - 100% Binding"}
                </AlertTitle>
                <AlertDescription className="mt-2">
                  {language === "ar" 
                    ? "هذه القائمة هي دستور المنصات ومعيار القبول. لا منصة تُنشر بدونها. لا استثناء. لا اجتهاد."
                    : "This checklist is the platform constitution and acceptance criteria. No platform deploys without it. No exceptions."}
                </AlertDescription>
              </Alert>

              <Card className="border-2 border-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <ListChecks className="h-6 w-6 text-primary" />
                      <div>
                        <CardTitle>
                          {language === "ar" ? "تقدم الإكمال" : "Completion Progress"}
                        </CardTitle>
                        <CardDescription>
                          {language === "ar" 
                            ? `${checkedCount} من ${totalChecklistItems} بند مكتمل (${criticalChecklistItems} بند حرج)`
                            : `${checkedCount} of ${totalChecklistItems} items complete (${criticalChecklistItems} critical items)`}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={completionPercentage === 100 ? "default" : "secondary"} className={completionPercentage === 100 ? "bg-green-500" : ""}>
                        {completionPercentage}%
                      </Badge>
                      <Button variant="outline" size="sm" onClick={resetChecklist} data-testid="button-reset-checklist">
                        <RefreshCw className="h-4 w-4 mr-1" />
                        {language === "ar" ? "إعادة تعيين" : "Reset"}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={completionPercentage} className="h-3" />
                </CardContent>
              </Card>

              <div className="space-y-4">
                {checklistCategories.map((category) => {
                  const categoryChecked = category.items.filter(item => checkedItems.has(item.id)).length;
                  const categoryTotal = category.items.length;
                  const categoryComplete = categoryChecked === categoryTotal;
                  
                  return (
                    <Card key={category.id} className={categoryComplete ? "border-green-500/30" : ""}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-md ${categoryComplete ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"}`}>
                              {category.icon}
                            </div>
                            <div>
                              <CardTitle className="text-base">
                                {language === "ar" ? category.titleAr : category.titleEn}
                              </CardTitle>
                              <CardDescription className="text-xs">
                                {categoryChecked}/{categoryTotal} {language === "ar" ? "مكتمل" : "complete"}
                              </CardDescription>
                            </div>
                          </div>
                          {categoryComplete && (
                            <Badge className="bg-green-500 text-white">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              {language === "ar" ? "مكتمل" : "Complete"}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {category.items.map((item) => (
                          <div 
                            key={item.id} 
                            className={`flex items-center gap-3 p-2 rounded-md cursor-pointer hover-elevate ${
                              checkedItems.has(item.id) ? "bg-green-500/10" : "bg-muted/30"
                            } ${item.critical ? "border-l-2 border-red-500" : ""}`}
                            onClick={() => toggleCheckItem(item.id)}
                            data-testid={`checklist-item-${item.id}`}
                          >
                            <Checkbox 
                              checked={checkedItems.has(item.id)} 
                              onCheckedChange={() => toggleCheckItem(item.id)}
                            />
                            <span className={`text-sm flex-1 ${checkedItems.has(item.id) ? "line-through text-muted-foreground" : ""}`}>
                              {language === "ar" ? item.textAr : item.textEn}
                            </span>
                            {item.critical && (
                              <Badge variant="destructive" className="text-xs">
                                {language === "ar" ? "حرج" : "Critical"}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Card className={`border-2 ${completionPercentage === 100 ? "border-green-500/50 bg-green-500/5" : "border-red-500/50 bg-red-500/5"}`}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {completionPercentage === 100 ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600" />
                    )}
                    <CardTitle>
                      {completionPercentage === 100 
                        ? (language === "ar" ? "جاهز للنشر - GO" : "Ready to Deploy - GO")
                        : (language === "ar" ? "غير جاهز للنشر - NO GO" : "Not Ready to Deploy - NO GO")}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {completionPercentage === 100 
                      ? (language === "ar" 
                          ? "جميع البنود مكتملة. المنصة جاهزة للمراجعة النهائية والنشر."
                          : "All items complete. Platform is ready for final review and deployment.")
                      : (language === "ar" 
                          ? `متبقي ${totalChecklistItems - checkedCount} بند يجب إكمالها قبل النشر. أي بند ناقص = رفض النشر.`
                          : `${totalChecklistItems - checkedCount} items remaining before deployment. Any incomplete item = deployment rejected.`)}
                  </p>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Alert className="border-primary/50 bg-primary/5">
                <Shield className="h-5 w-5" />
                <AlertTitle className="font-bold">
                  {language === "ar" 
                    ? "تحذير سيادي: هذه الوثيقة ملزمة قانونيًا وتقنيًا" 
                    : "Sovereign Warning: This document is legally and technically binding"}
                </AlertTitle>
                <AlertDescription className="mt-2">
                  {language === "ar" 
                    ? "جميع المنصات المُنشأة عبر INFERA WebNova يجب أن تلتزم التزامًا صارمًا بهذه السياسات. أي انتهاك يُعتبر مخالفة سيادية جسيمة."
                    : "All platforms created via INFERA WebNova must strictly comply with these policies. Any violation is considered a serious sovereign breach."}
                </AlertDescription>
              </Alert>

              <Card className="border-2 border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Crown className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle>
                    {language === "ar" ? "الخلاصة السيادية" : "Sovereign Summary"}
                  </CardTitle>
                  <CardDescription>
                    {language === "ar" 
                      ? "المبادئ الأساسية التي تحكم جميع منصات INFERA" 
                      : "Core principles governing all INFERA platforms"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { icon: <Shield className="h-5 w-5" />, labelAr: "سيادية", labelEn: "Sovereign" },
                  { icon: <Brain className="h-5 w-5" />, labelAr: "ذكية", labelEn: "Intelligent" },
                  { icon: <Lock className="h-5 w-5" />, labelAr: "محصنة", labelEn: "Secured" },
                  { icon: <Layers className="h-5 w-5" />, labelAr: "قابلة للتوسع", labelEn: "Scalable" },
                  { icon: <Rocket className="h-5 w-5" />, labelAr: "متفوقة", labelEn: "Superior" },
                  { icon: <Fingerprint className="h-5 w-5" />, labelAr: "فريدة", labelEn: "Unique" },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 p-3 rounded-md bg-muted/50 text-center">
                    <div className="text-primary">{item.icon}</div>
                    <span className="text-sm font-medium">
                      {language === "ar" ? item.labelAr : item.labelEn}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="critical" className="w-full">
            <TabsList className="w-full justify-start flex-wrap h-auto gap-1 p-1">
              <TabsTrigger value="critical" className="gap-2" data-testid="tab-critical">
                <AlertTriangle className="h-4 w-4" />
                {language === "ar" ? `حرجة (${criticalSections.length})` : `Critical (${criticalSections.length})`}
              </TabsTrigger>
              <TabsTrigger value="high" className="gap-2" data-testid="tab-high">
                <Zap className="h-4 w-4" />
                {language === "ar" ? `عالية (${highSections.length})` : `High (${highSections.length})`}
              </TabsTrigger>
              <TabsTrigger value="standard" className="gap-2" data-testid="tab-standard">
                <FileText className="h-4 w-4" />
                {language === "ar" ? `قياسية (${standardSections.length})` : `Standard (${standardSections.length})`}
              </TabsTrigger>
              <TabsTrigger value="all" className="gap-2" data-testid="tab-all">
                <BookOpen className="h-4 w-4" />
                {language === "ar" ? "الكل" : "All"}
              </TabsTrigger>
            </TabsList>

            {["critical", "high", "standard", "all"].map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-4 space-y-4">
                {(tab === "all" ? policySections : 
                  tab === "critical" ? criticalSections :
                  tab === "high" ? highSections : standardSections
                ).map((section) => (
                  <Card key={section.id} className={
                    section.level === "critical" ? "border-red-500/30" :
                    section.level === "high" ? "border-orange-500/30" : ""
                  }>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-md ${
                            section.level === "critical" ? "bg-red-500/10 text-red-500" :
                            section.level === "high" ? "bg-orange-500/10 text-orange-500" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {section.icon}
                          </div>
                          <div>
                            <CardTitle className="text-base">
                              {language === "ar" ? section.titleAr : section.titleEn}
                            </CardTitle>
                          </div>
                        </div>
                        {getLevelBadge(section.level)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {section.requirements.map((req, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-2 rounded-md bg-muted/30">
                          {getRequirementIcon(req.type)}
                          <span className="text-sm">
                            {language === "ar" ? req.textAr : req.textEn}
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            ))}
          </Tabs>

          <Separator />

          <Card className="border-2 border-green-500/30 bg-green-500/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Scale className="h-6 w-6 text-green-600" />
                <CardTitle>
                  {language === "ar" ? "الإقرار والموافقة" : "Acknowledgment & Agreement"}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {language === "ar" 
                  ? "بالموافقة على هذه السياسات، أُقر بأن جميع المنصات التي سيتم إنشاؤها ستلتزم التزامًا صارمًا بالمعايير السيادية المذكورة أعلاه."
                  : "By agreeing to these policies, I acknowledge that all platforms created will strictly comply with the sovereign standards mentioned above."}
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <Button 
                  onClick={() => setAcceptedPolicy(true)}
                  disabled={acceptedPolicy}
                  className="gap-2"
                  data-testid="button-accept-policy"
                >
                  {acceptedPolicy ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      {language === "ar" ? "تم القبول" : "Accepted"}
                    </>
                  ) : (
                    <>
                      <Gavel className="h-4 w-4" />
                      {language === "ar" ? "أوافق على السياسات" : "I Agree to Policies"}
                    </>
                  )}
                </Button>
                {acceptedPolicy && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    {language === "ar" ? "مُفعّل منذ اليوم" : "Active since today"}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-xs text-muted-foreground py-4">
            {language === "ar" 
              ? "وثيقة INFERA السيادية - الإصدار 1.0 - ديسمبر 2024"
              : "INFERA Sovereign Directive - Version 1.0 - December 2024"}
          </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
