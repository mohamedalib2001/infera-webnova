import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
  Play,
  FileSignature,
  Download,
  History,
  Building2,
  Heart,
  Landmark,
  GraduationCap,
  ShoppingCart,
  Briefcase,
  Bot,
  AlertOctagon,
  Clock,
  Award,
  Timer,
  BarChart3,
  PieChart,
  Scan
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

interface ChecklistCategory {
  id: string;
  titleAr: string;
  titleEn: string;
  items: ChecklistItem[];
}

interface ChecklistItem {
  id: string;
  textAr: string;
  textEn: string;
  critical?: boolean;
}

interface PolicySignature {
  id: string;
  userId: string;
  policyVersion: string;
  signatureHash: string;
  certificateData: {
    issuer: string;
    subject: string;
    validFrom: string;
    validTo: string;
    serialNumber: string;
    fingerprint: string;
  };
  signedAt: string;
  expiresAt: string;
}

interface PolicyStats {
  totalCompliance: number;
  compliantPlatforms: number;
  partialPlatforms: number;
  nonCompliantPlatforms: number;
  averageScore: number;
  totalViolations: number;
  openViolations: number;
  criticalViolations: number;
  totalSignatures: number;
  activeSignatures: number;
}

interface PolicyViolation {
  id: string;
  policyCategory: string;
  policyItem: string;
  severity: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  status: string;
  detectedAt: string;
  detectedBy: string;
}

interface PolicyTemplate {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  sector: string;
  complianceFrameworks: string[];
  isActive: boolean;
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
    id: "ai-first",
    titleAr: "مبدأ الذكاء الاصطناعي أولاً",
    titleEn: "AI-First Principle",
    icon: <Brain className="h-5 w-5" />,
    level: "critical",
    requirements: [
      {
        textAr: "كل منصة تحتوي على: AI Core, AI Assistant, Predictive Engine, Behavioral Intelligence",
        textEn: "Every platform contains: AI Core, AI Assistant, Predictive Engine, Behavioral Intelligence",
        type: "mandatory"
      },
      {
        textAr: "يُمنع: أنظمة CRUD فقط، لوحات تحكم تقليدية، عمليات يدوية",
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
    id: "sovereign-security",
    titleAr: "الأمان السيادي المطلق",
    titleEn: "Absolute Sovereign Security",
    icon: <Lock className="h-5 w-5" />,
    level: "critical",
    requirements: [
      {
        textAr: "Zero-Trust Architecture مع تشفير End-to-End",
        textEn: "Zero-Trust Architecture with End-to-End Encryption",
        type: "mandatory"
      },
      {
        textAr: "AI Threat Detection مع مراقبة مستمرة",
        textEn: "AI Threat Detection with Continuous Monitoring",
        type: "mandatory"
      },
      {
        textAr: "استجابة تلقائية للحوادث Automated Incident Response",
        textEn: "Automated Incident Response",
        type: "mandatory"
      },
      {
        textAr: "الهدف: منصات غير قابلة للاختراق نظريًا وعمليًا",
        textEn: "Goal: Platforms theoretically and practically unhackable",
        type: "mandatory"
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
        textAr: "عدم الارتباط بمزود واحد No Vendor Lock-in",
        textEn: "No Vendor Lock-in",
        type: "mandatory"
      }
    ]
  },
  {
    id: "technology",
    titleAr: "المعايير التقنية",
    titleEn: "Technology Standards",
    icon: <Cpu className="h-5 w-5" />,
    level: "high",
    requirements: [
      {
        textAr: "استخدام أحدث Frameworks, AI Engines, Databases, Security Models",
        textEn: "Use latest Frameworks, AI Engines, Databases, Security Models",
        type: "mandatory"
      },
      {
        textAr: "تحديثات دورية إلزامية",
        textEn: "Mandatory periodic updates",
        type: "mandatory"
      },
      {
        textAr: "إزالة فورية لأي تقنية قديمة",
        textEn: "Immediate removal of outdated technology",
        type: "mandatory"
      }
    ]
  },
  {
    id: "compliance",
    titleAr: "الامتثال العالمي",
    titleEn: "Global Compliance",
    icon: <Globe className="h-5 w-5" />,
    level: "high",
    requirements: [
      {
        textAr: "ISO / NIST / SOC2 / GDPR / Zero Trust",
        textEn: "ISO / NIST / SOC2 / GDPR / Zero Trust",
        type: "mandatory"
      },
      {
        textAr: "أحدث Design Systems مع Accessibility & Performance Metrics",
        textEn: "Latest Design Systems with Accessibility & Performance Metrics",
        type: "mandatory"
      },
      {
        textAr: "Data Governance & Compliance إلزامي",
        textEn: "Data Governance & Compliance mandatory",
        type: "mandatory"
      }
    ]
  },
  {
    id: "deployment",
    titleAr: "قواعد النشر والتوزيع",
    titleEn: "Deployment Rules",
    icon: <Rocket className="h-5 w-5" />,
    level: "high",
    requirements: [
      {
        textAr: "One-Click Deploy مع Versioning, Rollback, Environment Control",
        textEn: "One-Click Deploy with Versioning, Rollback, Environment Control",
        type: "mandatory"
      },
      {
        textAr: "يُمنع النشر الخارجي أو التعديلات خارج WebNova",
        textEn: "External deployment or modifications outside WebNova prohibited",
        type: "prohibited"
      },
      {
        textAr: "تحديثات حية بدون توقف",
        textEn: "Live updates without downtime",
        type: "mandatory"
      }
    ]
  },
  {
    id: "excellence",
    titleAr: "معايير التميز",
    titleEn: "Excellence Standards",
    icon: <Target className="h-5 w-5" />,
    level: "standard",
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
      },
      {
        textAr: "ميزات فريدة غير موجودة في السوق",
        textEn: "Unique features not found in market",
        type: "mandatory"
      },
      {
        textAr: "تأثير WOW من أول استخدام",
        textEn: "WOW Effect from first use",
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
        textAr: "يُسمح بتسجيل بيانات اختبارية/تجريبية لاختبار المنصة",
        textEn: "Test/demo data registration is allowed for platform testing",
        type: "allowed"
      },
      {
        textAr: "زر تهيئة البيانات إلزامي لمسح بيانات الاختبار",
        textEn: "Data reset button mandatory to delete test data",
        type: "mandatory"
      },
      {
        textAr: "زر التهيئة يعمل مرة واحدة ويمسح كل البيانات الاختبارية",
        textEn: "Reset button works once and clears all test data",
        type: "mandatory"
      }
    ]
  },
  {
    id: "monitoring",
    titleAr: "المراقبة والتتبع",
    titleEn: "Monitoring & Tracking",
    icon: <Eye className="h-5 w-5" />,
    level: "standard",
    requirements: [
      {
        textAr: "نظام مراقبة حية لجميع المنصات المُنشأة",
        textEn: "Live monitoring system for all created platforms",
        type: "mandatory"
      },
      {
        textAr: "تتبع الأداء والأمان والتكاليف",
        textEn: "Performance, security, and cost tracking",
        type: "mandatory"
      },
      {
        textAr: "تنبيهات فورية عند الانحرافات",
        textEn: "Immediate alerts on deviations",
        type: "mandatory"
      }
    ]
  },
  {
    id: "automation",
    titleAr: "الأتمتة الشاملة",
    titleEn: "Comprehensive Automation",
    icon: <Settings2 className="h-5 w-5" />,
    level: "standard",
    requirements: [
      {
        textAr: "أتمتة كاملة للعمليات المتكررة",
        textEn: "Full automation of repetitive operations",
        type: "mandatory"
      },
      {
        textAr: "Workflow Automation بالذكاء الاصطناعي",
        textEn: "AI-powered Workflow Automation",
        type: "mandatory"
      },
      {
        textAr: "تقليل التدخل اليدوي إلى الحد الأدنى",
        textEn: "Minimize manual intervention",
        type: "mandatory"
      }
    ]
  },
  {
    id: "documentation",
    titleAr: "التوثيق والمعرفة",
    titleEn: "Documentation & Knowledge",
    icon: <BookOpen className="h-5 w-5" />,
    level: "standard",
    requirements: [
      {
        textAr: "توثيق تلقائي لكل منصة مُنشأة",
        textEn: "Automatic documentation for each created platform",
        type: "mandatory"
      },
      {
        textAr: "قاعدة معرفة ديناميكية",
        textEn: "Dynamic knowledge base",
        type: "mandatory"
      },
      {
        textAr: "API Documentation تلقائي",
        textEn: "Automatic API Documentation",
        type: "mandatory"
      }
    ]
  },
  {
    id: "unique-identity",
    titleAr: "الهوية الفريدة",
    titleEn: "Unique Identity",
    icon: <Fingerprint className="h-5 w-5" />,
    level: "standard",
    requirements: [
      {
        textAr: "كل منصة لها هوية بصرية فريدة",
        textEn: "Each platform has a unique visual identity",
        type: "mandatory"
      },
      {
        textAr: "تخصيص كامل حسب القطاع والعميل",
        textEn: "Full customization by sector and client",
        type: "mandatory"
      },
      {
        textAr: "White-Label كامل مع إمكانية التخصيص",
        textEn: "Complete White-Label with customization capability",
        type: "allowed"
      }
    ]
  }
];

const checklistCategories: ChecklistCategory[] = [
  {
    id: "database-setup",
    titleAr: "إعداد قاعدة البيانات",
    titleEn: "Database Setup",
    items: [
      { id: "db-1", textAr: "قاعدة بيانات PostgreSQL حقيقية مُعدة", textEn: "Real PostgreSQL database configured", critical: true },
      { id: "db-2", textAr: "جداول البيانات مُصممة بشكل ديناميكي", textEn: "Data tables designed dynamically", critical: true },
      { id: "db-3", textAr: "نظام النسخ الاحتياطي مُفعّل", textEn: "Backup system enabled", critical: true },
      { id: "db-4", textAr: "تشفير البيانات الحساسة", textEn: "Sensitive data encryption" },
      { id: "db-5", textAr: "فهرسة الجداول للأداء الأمثل", textEn: "Table indexing for optimal performance" }
    ]
  },
  {
    id: "auth-system",
    titleAr: "نظام المصادقة",
    titleEn: "Authentication System",
    items: [
      { id: "auth-1", textAr: "نظام تسجيل دخول فعّال", textEn: "Functional login system", critical: true },
      { id: "auth-2", textAr: "نظام تسجيل مستخدمين جديد", textEn: "New user registration system", critical: true },
      { id: "auth-3", textAr: "إدارة الجلسات والتوكنات", textEn: "Session and token management", critical: true },
      { id: "auth-4", textAr: "المصادقة الثنائية (2FA)", textEn: "Two-factor authentication (2FA)" },
      { id: "auth-5", textAr: "تكامل OAuth (Google, GitHub)", textEn: "OAuth integration (Google, GitHub)" },
      { id: "auth-6", textAr: "نظام استعادة كلمة المرور", textEn: "Password recovery system" }
    ]
  },
  {
    id: "ai-components",
    titleAr: "مكونات الذكاء الاصطناعي",
    titleEn: "AI Components",
    items: [
      { id: "ai-1", textAr: "AI Core Engine مُدمج", textEn: "AI Core Engine integrated", critical: true },
      { id: "ai-2", textAr: "مساعد ذكي (AI Assistant)", textEn: "AI Assistant", critical: true },
      { id: "ai-3", textAr: "محرك التنبؤات (Predictive Engine)", textEn: "Predictive Engine", critical: true },
      { id: "ai-4", textAr: "التحليل السلوكي (Behavioral Intelligence)", textEn: "Behavioral Intelligence" },
      { id: "ai-5", textAr: "توليد المحتوى بالذكاء الاصطناعي", textEn: "AI Content Generation" },
      { id: "ai-6", textAr: "اقتراحات ذكية تلقائية", textEn: "Automatic smart suggestions" }
    ]
  },
  {
    id: "security",
    titleAr: "الأمان والحماية",
    titleEn: "Security & Protection",
    items: [
      { id: "sec-1", textAr: "Zero-Trust Architecture مُطبق", textEn: "Zero-Trust Architecture implemented", critical: true },
      { id: "sec-2", textAr: "تشفير End-to-End للاتصالات", textEn: "End-to-End encryption for communications", critical: true },
      { id: "sec-3", textAr: "نظام كشف التهديدات بالذكاء الاصطناعي", textEn: "AI Threat Detection system", critical: true },
      { id: "sec-4", textAr: "استجابة تلقائية للحوادث الأمنية", textEn: "Automated security incident response" },
      { id: "sec-5", textAr: "سجل أحداث أمنية شامل", textEn: "Comprehensive security event log" },
      { id: "sec-6", textAr: "حماية من هجمات DDoS", textEn: "DDoS attack protection" },
      { id: "sec-7", textAr: "فحص الثغرات الأمنية التلقائي", textEn: "Automatic vulnerability scanning" }
    ]
  },
  {
    id: "dynamic-ui",
    titleAr: "واجهة المستخدم الديناميكية",
    titleEn: "Dynamic User Interface",
    items: [
      { id: "ui-1", textAr: "جميع الصفحات ديناميكية 100%", textEn: "All pages 100% dynamic", critical: true },
      { id: "ui-2", textAr: "لا يوجد صفحات ثابتة Hardcoded", textEn: "No hardcoded static pages", critical: true },
      { id: "ui-3", textAr: "دعم السمات المتعددة (Dark/Light)", textEn: "Multiple theme support (Dark/Light)" },
      { id: "ui-4", textAr: "واجهة متجاوبة لجميع الأجهزة", textEn: "Responsive interface for all devices" },
      { id: "ui-5", textAr: "دعم اللغات المتعددة (AR/EN)", textEn: "Multi-language support (AR/EN)" },
      { id: "ui-6", textAr: "تخصيص الواجهة حسب الدور", textEn: "Role-based interface customization" }
    ]
  },
  {
    id: "workflows",
    titleAr: "سير العمل والأتمتة",
    titleEn: "Workflows & Automation",
    items: [
      { id: "wf-1", textAr: "Workflows ديناميكية بالكامل", textEn: "Fully dynamic workflows", critical: true },
      { id: "wf-2", textAr: "أتمتة العمليات المتكررة", textEn: "Repetitive operations automation" },
      { id: "wf-3", textAr: "Event-Driven Architecture", textEn: "Event-Driven Architecture" },
      { id: "wf-4", textAr: "نظام إشعارات ذكي", textEn: "Smart notification system" },
      { id: "wf-5", textAr: "جدولة المهام التلقائية", textEn: "Automatic task scheduling" }
    ]
  },
  {
    id: "permissions",
    titleAr: "الصلاحيات والأدوار",
    titleEn: "Permissions & Roles",
    items: [
      { id: "perm-1", textAr: "نظام صلاحيات ديناميكي", textEn: "Dynamic permissions system", critical: true },
      { id: "perm-2", textAr: "أدوار قابلة للتخصيص", textEn: "Customizable roles", critical: true },
      { id: "perm-3", textAr: "لا أدوار ثابتة Fixed Roles", textEn: "No fixed roles", critical: true },
      { id: "perm-4", textAr: "تدرج الصلاحيات (Hierarchical)", textEn: "Hierarchical permissions" },
      { id: "perm-5", textAr: "سجل تتبع التغييرات", textEn: "Change tracking log" }
    ]
  },
  {
    id: "data-models",
    titleAr: "نماذج البيانات",
    titleEn: "Data Models",
    items: [
      { id: "dm-1", textAr: "نماذج بيانات ديناميكية", textEn: "Dynamic data models", critical: true },
      { id: "dm-2", textAr: "علاقات مرنة بين الكيانات", textEn: "Flexible entity relationships" },
      { id: "dm-3", textAr: "دعم الحقول المخصصة", textEn: "Custom fields support" },
      { id: "dm-4", textAr: "التحقق من صحة البيانات", textEn: "Data validation" },
      { id: "dm-5", textAr: "إصدار البيانات (Versioning)", textEn: "Data versioning" }
    ]
  },
  {
    id: "test-reset",
    titleAr: "بيانات الاختبار والتهيئة",
    titleEn: "Test Data & Reset",
    items: [
      { id: "test-1", textAr: "إمكانية إدخال بيانات اختبارية", textEn: "Ability to enter test data", critical: true },
      { id: "test-2", textAr: "زر تهيئة/مسح البيانات متاح", textEn: "Data reset/clear button available", critical: true },
      { id: "test-3", textAr: "تأكيد قبل المسح", textEn: "Confirmation before deletion" },
      { id: "test-4", textAr: "سجل عمليات المسح", textEn: "Deletion operations log" }
    ]
  },
  {
    id: "scalability",
    titleAr: "قابلية التوسع",
    titleEn: "Scalability",
    items: [
      { id: "scale-1", textAr: "Cloud-Native Architecture", textEn: "Cloud-Native Architecture" },
      { id: "scale-2", textAr: "Microservices / Modular Design", textEn: "Microservices / Modular Design" },
      { id: "scale-3", textAr: "Horizontal Scaling جاهز", textEn: "Horizontal Scaling ready" },
      { id: "scale-4", textAr: "Zero Downtime Expansion", textEn: "Zero Downtime Expansion" },
      { id: "scale-5", textAr: "لا ارتباط بمزود واحد", textEn: "No vendor lock-in" }
    ]
  },
  {
    id: "monitoring",
    titleAr: "المراقبة والتحليلات",
    titleEn: "Monitoring & Analytics",
    items: [
      { id: "mon-1", textAr: "لوحة مراقبة حية", textEn: "Live monitoring dashboard" },
      { id: "mon-2", textAr: "تتبع الأداء", textEn: "Performance tracking" },
      { id: "mon-3", textAr: "تحليلات استخدام المنصة", textEn: "Platform usage analytics" },
      { id: "mon-4", textAr: "تنبيهات فورية", textEn: "Instant alerts" },
      { id: "mon-5", textAr: "تقارير دورية تلقائية", textEn: "Automatic periodic reports" }
    ]
  },
  {
    id: "deployment",
    titleAr: "النشر والتوزيع",
    titleEn: "Deployment",
    items: [
      { id: "dep-1", textAr: "One-Click Deploy جاهز", textEn: "One-Click Deploy ready" },
      { id: "dep-2", textAr: "نظام Versioning", textEn: "Versioning system" },
      { id: "dep-3", textAr: "إمكانية Rollback", textEn: "Rollback capability" },
      { id: "dep-4", textAr: "Environment Control", textEn: "Environment Control" },
      { id: "dep-5", textAr: "تحديثات حية بدون توقف", textEn: "Live updates without downtime" }
    ]
  },
  {
    id: "compliance",
    titleAr: "الامتثال والمعايير",
    titleEn: "Compliance & Standards",
    items: [
      { id: "comp-1", textAr: "جاهزية ISO", textEn: "ISO readiness" },
      { id: "comp-2", textAr: "جاهزية GDPR", textEn: "GDPR readiness" },
      { id: "comp-3", textAr: "جاهزية SOC2", textEn: "SOC2 readiness" },
      { id: "comp-4", textAr: "Accessibility Standards", textEn: "Accessibility Standards" },
      { id: "comp-5", textAr: "Data Governance", textEn: "Data Governance" }
    ]
  },
  {
    id: "documentation",
    titleAr: "التوثيق",
    titleEn: "Documentation",
    items: [
      { id: "doc-1", textAr: "توثيق تلقائي للمنصة", textEn: "Automatic platform documentation" },
      { id: "doc-2", textAr: "API Documentation", textEn: "API Documentation" },
      { id: "doc-3", textAr: "دليل المستخدم", textEn: "User guide" },
      { id: "doc-4", textAr: "قاعدة معرفة ديناميكية", textEn: "Dynamic knowledge base" }
    ]
  },
  {
    id: "final-check",
    titleAr: "الفحص النهائي",
    titleEn: "Final Check",
    items: [
      { id: "final-1", textAr: "جميع الوظائف تعمل بشكل كامل", textEn: "All functions fully operational", critical: true },
      { id: "final-2", textAr: "لا توجد نماذج وهمية أو Mockups", textEn: "No mockups or simulations", critical: true },
      { id: "final-3", textAr: "لا يوجد كود يدوي في المنصة", textEn: "No manual code in platform", critical: true },
      { id: "final-4", textAr: "100% ديناميكية", textEn: "100% dynamic", critical: true },
      { id: "final-5", textAr: "AI مُدمج ويعمل", textEn: "AI integrated and working", critical: true },
      { id: "final-6", textAr: "الأمان السيادي مُفعّل", textEn: "Sovereign security enabled", critical: true },
      { id: "final-7", textAr: "جاهز للإنتاج", textEn: "Production ready", critical: true }
    ]
  }
];

const sectorTemplates = [
  { id: "financial", nameAr: "القطاع المالي", nameEn: "Financial Sector", icon: <Briefcase className="h-5 w-5" />, frameworks: ["PCI-DSS", "SOX", "GDPR"], color: "bg-blue-500/10 text-blue-500" },
  { id: "healthcare", nameAr: "القطاع الصحي", nameEn: "Healthcare Sector", icon: <Heart className="h-5 w-5" />, frameworks: ["HIPAA", "GDPR", "ISO 27001"], color: "bg-red-500/10 text-red-500" },
  { id: "government", nameAr: "القطاع الحكومي", nameEn: "Government Sector", icon: <Landmark className="h-5 w-5" />, frameworks: ["NIST", "FedRAMP", "ISO 27001"], color: "bg-purple-500/10 text-purple-500" },
  { id: "education", nameAr: "القطاع التعليمي", nameEn: "Education Sector", icon: <GraduationCap className="h-5 w-5" />, frameworks: ["FERPA", "COPPA", "GDPR"], color: "bg-green-500/10 text-green-500" },
  { id: "ecommerce", nameAr: "التجارة الإلكترونية", nameEn: "E-Commerce", icon: <ShoppingCart className="h-5 w-5" />, frameworks: ["PCI-DSS", "GDPR", "SOC2"], color: "bg-orange-500/10 text-orange-500" },
  { id: "enterprise", nameAr: "المؤسسات", nameEn: "Enterprise", icon: <Building2 className="h-5 w-5" />, frameworks: ["SOC2", "ISO 27001", "GDPR"], color: "bg-slate-500/10 text-slate-500" },
];

export default function OwnerPoliciesPage() {
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [activeTab, setActiveTab] = useState("directive");
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [signDialogOpen, setSignDialogOpen] = useState(false);
  const { toast } = useToast();

  const criticalSections = policySections.filter(s => s.level === "critical");
  const highSections = policySections.filter(s => s.level === "high");
  const standardSections = policySections.filter(s => s.level === "standard");
  
  const totalChecklistItems = checklistCategories.reduce((sum, cat) => sum + cat.items.length, 0);
  const checkedCount = checkedItems.size;
  const completionPercentage = Math.round((checkedCount / totalChecklistItems) * 100);

  const { data: signatures = [], isLoading: signaturesLoading } = useQuery<PolicySignature[]>({
    queryKey: ['/api/sovereign-workspace/policies/signatures'],
  });

  const { data: policyStats, isLoading: statsLoading } = useQuery<PolicyStats>({
    queryKey: ['/api/sovereign-workspace/policies/stats'],
  });

  const { data: violations = [], isLoading: violationsLoading } = useQuery<PolicyViolation[]>({
    queryKey: ['/api/sovereign-workspace/policies/violations'],
  });

  const { data: templates = [], isLoading: templatesLoading } = useQuery<PolicyTemplate[]>({
    queryKey: ['/api/sovereign-workspace/policies/templates'],
  });

  const signPolicyMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/sovereign-workspace/policies/sign', {
        method: 'POST',
        body: JSON.stringify({ policyVersion: "1.0", legalAcknowledgment: true }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sovereign-workspace/policies/signatures'] });
      toast({
        title: language === "ar" ? "تم التوقيع بنجاح" : "Successfully Signed",
        description: language === "ar" ? "تم توقيع السياسات السيادية رقمياً" : "Sovereign policies have been digitally signed",
      });
      setSignDialogOpen(false);
      setAcceptedPolicy(true);
    },
    onError: () => {
      toast({
        title: language === "ar" ? "فشل التوقيع" : "Signing Failed",
        description: language === "ar" ? "حدث خطأ أثناء التوقيع" : "An error occurred during signing",
        variant: "destructive",
      });
    },
  });

  const toggleCheckItem = (itemId: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(itemId)) {
      newChecked.delete(itemId);
    } else {
      newChecked.add(itemId);
    }
    setCheckedItems(newChecked);
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "critical":
        return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />{language === "ar" ? "حرج" : "Critical"}</Badge>;
      case "high":
        return <Badge className="bg-orange-500/20 text-orange-600 border-orange-500/30 gap-1"><Zap className="h-3 w-3" />{language === "ar" ? "عالي" : "High"}</Badge>;
      default:
        return <Badge variant="secondary" className="gap-1"><FileText className="h-3 w-3" />{language === "ar" ? "قياسي" : "Standard"}</Badge>;
    }
  };

  const getRequirementIcon = (type: string) => {
    switch (type) {
      case "mandatory":
        return <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />;
      case "prohibited":
        return <XCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />;
      case "allowed":
        return <CheckSquare className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />;
      default:
        return <Square className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />;
    }
  };

  const exportToPDF = () => {
    const content = `
INFERA SOVEREIGN POLICY DIRECTIVE
==================================
Version: 1.0
Date: ${new Date().toLocaleDateString()}

SUPREME PRINCIPLE
-----------------
All INFERA platforms must be created, managed, and developed according to a superior sovereign model.

CORE REQUIREMENTS
-----------------
1. No Mockups Policy - All platforms must be fully functional
2. 0-Code Compliance - No manual code in generated platforms
3. 100% Dynamic Architecture - All components must be dynamic
4. AI-First Principle - Every platform must have AI capabilities
5. Sovereign Security - Zero-Trust Architecture required

COMPLIANCE FRAMEWORKS
---------------------
- ISO 27001
- NIST Cybersecurity Framework
- SOC2 Type II
- GDPR
- PCI-DSS (for financial)
- HIPAA (for healthcare)

Signed by: ${signatures[0]?.certificateData?.subject || 'Pending'}
Signature Hash: ${signatures[0]?.signatureHash?.substring(0, 32) || 'N/A'}...
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'INFERA_Sovereign_Policy_v1.0.txt';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: language === "ar" ? "تم التصدير" : "Exported",
      description: language === "ar" ? "تم تصدير الوثيقة السيادية" : "Sovereign document exported",
    });
  };

  const currentSignature = signatures[0];

  return (
    <div className="h-full flex flex-col" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between gap-3 p-4 border-b flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-primary/10">
            <Gavel className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold" data-testid="text-page-title">
              {language === "ar" ? "السياسات السيادية" : "Sovereign Policies"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {language === "ar" ? "وثيقة INFERA الملزمة لإنشاء المنصات" : "INFERA Binding Document for Platform Creation"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
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
          <Button
            variant="outline"
            size="sm"
            onClick={exportToPDF}
            className="gap-2"
            data-testid="button-export-pdf"
          >
            <Download className="h-4 w-4" />
            {language === "ar" ? "تصدير PDF" : "Export PDF"}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6 max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start flex-wrap h-auto gap-1 p-1">
              <TabsTrigger value="directive" className="gap-2" data-testid="tab-directive">
                <FileText className="h-4 w-4" />
                {language === "ar" ? "التوجيهات السيادية" : "Sovereign Directive"}
              </TabsTrigger>
              <TabsTrigger value="checklist" className="gap-2" data-testid="tab-checklist">
                <ListChecks className="h-4 w-4" />
                {language === "ar" ? "قائمة التحقق" : "Checklist"}
                <Badge variant="secondary" className="text-xs">{completionPercentage}%</Badge>
              </TabsTrigger>
              <TabsTrigger value="compliance" className="gap-2" data-testid="tab-compliance">
                <BarChart3 className="h-4 w-4" />
                {language === "ar" ? "الامتثال" : "Compliance"}
              </TabsTrigger>
              <TabsTrigger value="violations" className="gap-2" data-testid="tab-violations">
                <AlertOctagon className="h-4 w-4" />
                {language === "ar" ? "الانتهاكات" : "Violations"}
                {(policyStats?.openViolations || 0) > 0 && (
                  <Badge variant="destructive" className="text-xs">{policyStats?.openViolations}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="templates" className="gap-2" data-testid="tab-templates">
                <Layers className="h-4 w-4" />
                {language === "ar" ? "القوالب القطاعية" : "Sector Templates"}
              </TabsTrigger>
              <TabsTrigger value="signature" className="gap-2" data-testid="tab-signature">
                <FileSignature className="h-4 w-4" />
                {language === "ar" ? "التوقيع الرقمي" : "Digital Signature"}
              </TabsTrigger>
              <TabsTrigger value="versions" className="gap-2" data-testid="tab-versions">
                <History className="h-4 w-4" />
                {language === "ar" ? "الإصدارات" : "Versions"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="compliance" className="mt-4 space-y-4">
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-6 w-6 text-primary" />
                    <div>
                      <CardTitle>{language === "ar" ? "لوحة الامتثال الحية" : "Live Compliance Dashboard"}</CardTitle>
                      <CardDescription>{language === "ar" ? "مراقبة التزام المنصات بالسياسات السيادية" : "Monitor platform adherence to sovereign policies"}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="bg-green-500/5 border-green-500/20">
                        <CardContent className="p-4 text-center">
                          <div className="text-3xl font-bold text-green-600">{policyStats?.compliantPlatforms || 0}</div>
                          <div className="text-sm text-muted-foreground">{language === "ar" ? "منصات ممتثلة" : "Compliant Platforms"}</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-yellow-500/5 border-yellow-500/20">
                        <CardContent className="p-4 text-center">
                          <div className="text-3xl font-bold text-yellow-600">{policyStats?.partialPlatforms || 0}</div>
                          <div className="text-sm text-muted-foreground">{language === "ar" ? "امتثال جزئي" : "Partial Compliance"}</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-red-500/5 border-red-500/20">
                        <CardContent className="p-4 text-center">
                          <div className="text-3xl font-bold text-red-600">{policyStats?.nonCompliantPlatforms || 0}</div>
                          <div className="text-sm text-muted-foreground">{language === "ar" ? "غير ممتثلة" : "Non-Compliant"}</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-blue-500/5 border-blue-500/20">
                        <CardContent className="p-4 text-center">
                          <div className="text-3xl font-bold text-blue-600">{policyStats?.averageScore || 0}%</div>
                          <div className="text-sm text-muted-foreground">{language === "ar" ? "متوسط النتيجة" : "Average Score"}</div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    {language === "ar" ? "فحص الامتثال بالذكاء الاصطناعي" : "AI Compliance Check"}
                  </CardTitle>
                  <CardDescription>
                    {language === "ar" ? "تحليل تلقائي للمنصات باستخدام الذكاء الاصطناعي" : "Automatic platform analysis using AI"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-8 gap-4">
                    <Scan className="h-16 w-16 text-primary/50" />
                    <p className="text-muted-foreground text-center max-w-md">
                      {language === "ar" 
                        ? "قم بتحديد منصة من قائمة المشاريع لإجراء فحص الامتثال التلقائي بالذكاء الاصطناعي" 
                        : "Select a platform from the projects list to run automatic AI compliance check"}
                    </p>
                    <Button variant="outline" className="gap-2">
                      <Bot className="h-4 w-4" />
                      {language === "ar" ? "بدء الفحص التلقائي" : "Start Auto Check"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="violations" className="mt-4 space-y-4">
              <Alert className="border-red-500/30 bg-red-500/5">
                <AlertOctagon className="h-5 w-5 text-red-600" />
                <AlertTitle className="text-red-600">
                  {language === "ar" ? "تنبيهات انتهاك السياسات" : "Policy Violation Alerts"}
                </AlertTitle>
                <AlertDescription>
                  {language === "ar" 
                    ? `يوجد ${policyStats?.openViolations || 0} انتهاك مفتوح، منها ${policyStats?.criticalViolations || 0} حرج` 
                    : `There are ${policyStats?.openViolations || 0} open violations, ${policyStats?.criticalViolations || 0} critical`}
                </AlertDescription>
              </Alert>

              <div className="grid gap-4">
                {violationsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : violations.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
                      <CheckCircle2 className="h-16 w-16 text-green-500" />
                      <div className="text-center">
                        <h3 className="font-semibold text-lg">{language === "ar" ? "لا توجد انتهاكات" : "No Violations"}</h3>
                        <p className="text-muted-foreground">{language === "ar" ? "جميع المنصات ملتزمة بالسياسات السيادية" : "All platforms comply with sovereign policies"}</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  violations.map((violation) => (
                    <Card key={violation.id} className={`border-l-4 ${
                      violation.severity === "critical" ? "border-l-red-500" :
                      violation.severity === "high" ? "border-l-orange-500" :
                      violation.severity === "medium" ? "border-l-yellow-500" : "border-l-blue-500"
                    }`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <CardTitle className="text-base">{language === "ar" ? violation.titleAr : violation.title}</CardTitle>
                            <CardDescription className="mt-1">{language === "ar" ? violation.descriptionAr : violation.description}</CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={violation.severity === "critical" ? "destructive" : "secondary"}>
                              {violation.severity}
                            </Badge>
                            <Badge variant={violation.status === "open" ? "outline" : "secondary"}>
                              {violation.status}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardFooter className="pt-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(violation.detectedAt).toLocaleDateString()}
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="templates" className="mt-4 space-y-4">
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    {language === "ar" ? "قوالب السياسات القطاعية" : "Sector Policy Templates"}
                  </CardTitle>
                  <CardDescription>
                    {language === "ar" ? "سياسات متخصصة لكل قطاع مع أطر الامتثال المطلوبة" : "Specialized policies for each sector with required compliance frameworks"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sectorTemplates.map((template) => (
                      <Card 
                        key={template.id} 
                        className={`cursor-pointer transition-all hover:shadow-md ${selectedSector === template.id ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => setSelectedSector(template.id === selectedSector ? null : template.id)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-md ${template.color}`}>
                              {template.icon}
                            </div>
                            <div>
                              <CardTitle className="text-base">{language === "ar" ? template.nameAr : template.nameEn}</CardTitle>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex flex-wrap gap-1">
                            {template.frameworks.map((fw) => (
                              <Badge key={fw} variant="outline" className="text-xs">{fw}</Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {selectedSector && (
                <Card className="border-2 border-green-500/20 bg-green-500/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-green-600" />
                      {language === "ar" ? "القالب المختار" : "Selected Template"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {language === "ar" 
                        ? `تم اختيار قالب ${sectorTemplates.find(t => t.id === selectedSector)?.nameAr}. سيتم تطبيق السياسات الإضافية الخاصة بهذا القطاع.`
                        : `${sectorTemplates.find(t => t.id === selectedSector)?.nameEn} template selected. Additional sector-specific policies will be applied.`}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="signature" className="mt-4 space-y-4">
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <FileSignature className="h-6 w-6 text-primary" />
                    <div>
                      <CardTitle>{language === "ar" ? "التوقيع الرقمي السيادي" : "Sovereign Digital Signature"}</CardTitle>
                      <CardDescription>{language === "ar" ? "شهادة رقمية مشفرة للموافقة على السياسات" : "Encrypted digital certificate for policy approval"}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentSignature ? (
                    <div className="space-y-4">
                      <Alert className="border-green-500/30 bg-green-500/5">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <AlertTitle className="text-green-600">
                          {language === "ar" ? "تم التوقيع بنجاح" : "Successfully Signed"}
                        </AlertTitle>
                        <AlertDescription>
                          {language === "ar" 
                            ? `تم التوقيع في ${new Date(currentSignature.signedAt).toLocaleString()}`
                            : `Signed on ${new Date(currentSignature.signedAt).toLocaleString()}`}
                        </AlertDescription>
                      </Alert>

                      <Card className="bg-muted/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            {language === "ar" ? "تفاصيل الشهادة" : "Certificate Details"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm font-mono">
                          <div className="grid grid-cols-2 gap-2">
                            <span className="text-muted-foreground">{language === "ar" ? "المُصدر:" : "Issuer:"}</span>
                            <span className="truncate">{currentSignature.certificateData?.issuer}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <span className="text-muted-foreground">{language === "ar" ? "الموضوع:" : "Subject:"}</span>
                            <span className="truncate">{currentSignature.certificateData?.subject}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <span className="text-muted-foreground">{language === "ar" ? "الرقم التسلسلي:" : "Serial Number:"}</span>
                            <span className="truncate">{currentSignature.certificateData?.serialNumber}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <span className="text-muted-foreground">{language === "ar" ? "صالح حتى:" : "Valid Until:"}</span>
                            <span>{new Date(currentSignature.expiresAt).toLocaleDateString()}</span>
                          </div>
                          <Separator />
                          <div className="space-y-1">
                            <span className="text-muted-foreground">{language === "ar" ? "بصمة التوقيع:" : "Signature Hash:"}</span>
                            <div className="p-2 bg-background rounded text-xs break-all">{currentSignature.signatureHash}</div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="text-center py-8 space-y-4">
                      <FileSignature className="h-16 w-16 mx-auto text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold">{language === "ar" ? "لم يتم التوقيع بعد" : "Not Signed Yet"}</h3>
                        <p className="text-muted-foreground text-sm">
                          {language === "ar" ? "يجب التوقيع رقمياً على السياسات السيادية" : "You must digitally sign the sovereign policies"}
                        </p>
                      </div>
                      <Dialog open={signDialogOpen} onOpenChange={setSignDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="gap-2">
                            <FileSignature className="h-4 w-4" />
                            {language === "ar" ? "توقيع السياسات" : "Sign Policies"}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{language === "ar" ? "التوقيع الرقمي" : "Digital Signature"}</DialogTitle>
                            <DialogDescription>
                              {language === "ar" 
                                ? "بالتوقيع، أُقر بأنني قرأت وفهمت جميع السياسات السيادية وأوافق على الالتزام بها" 
                                : "By signing, I acknowledge that I have read and understood all sovereign policies and agree to comply with them"}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <Alert>
                              <Scale className="h-4 w-4" />
                              <AlertTitle>{language === "ar" ? "إقرار قانوني" : "Legal Acknowledgment"}</AlertTitle>
                              <AlertDescription className="text-sm">
                                {language === "ar" 
                                  ? "هذا التوقيع ملزم قانونياً وتقنياً. أي انتهاك للسياسات يُعتبر مخالفة سيادية جسيمة."
                                  : "This signature is legally and technically binding. Any policy violation is considered a serious sovereign breach."}
                              </AlertDescription>
                            </Alert>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setSignDialogOpen(false)}>
                              {language === "ar" ? "إلغاء" : "Cancel"}
                            </Button>
                            <Button 
                              onClick={() => signPolicyMutation.mutate()} 
                              disabled={signPolicyMutation.isPending}
                              className="gap-2"
                            >
                              {signPolicyMutation.isPending ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Gavel className="h-4 w-4" />
                              )}
                              {language === "ar" ? "أوافق وأوقع" : "Agree & Sign"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="versions" className="mt-4 space-y-4">
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    {language === "ar" ? "سجل إصدارات السياسات" : "Policy Version History"}
                  </CardTitle>
                  <CardDescription>
                    {language === "ar" ? "تتبع التغييرات على السياسات السيادية" : "Track changes to sovereign policies"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Card className="border-green-500/30 bg-green-500/5">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-500 text-white">v1.0</Badge>
                            <span className="font-semibold">{language === "ar" ? "الإصدار الحالي" : "Current Version"}</span>
                          </div>
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            {language === "ar" ? "نشط" : "Active"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground">
                          {language === "ar" 
                            ? "الإصدار الأولي للسياسات السيادية - ديسمبر 2024"
                            : "Initial release of sovereign policies - December 2024"}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Timer className="h-3 w-3" />
                          <span>{language === "ar" ? "فعّال منذ: ديسمبر 2024" : "Effective since: December 2024"}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="checklist" className="mt-4 space-y-4">
              <Card className="border-2 border-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <ClipboardCheck className="h-6 w-6 text-primary" />
                      <div>
                        <CardTitle>{language === "ar" ? "قائمة التحقق الإلزامية" : "Mandatory Checklist"}</CardTitle>
                        <CardDescription>
                          {language === "ar" 
                            ? "يجب إكمال جميع البنود قبل نشر المنصة" 
                            : "All items must be completed before platform deployment"}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {checkedCount} / {totalChecklistItems}
                      </span>
                      <Badge variant={completionPercentage === 100 ? "default" : "secondary"}>
                        {completionPercentage}%
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Progress value={completionPercentage} className="h-3" />
                </CardContent>
              </Card>

              <div className="grid gap-4">
                {checklistCategories.map((category) => {
                  const categoryCheckedCount = category.items.filter(item => checkedItems.has(item.id)).length;
                  const categoryTotal = category.items.length;
                  const categoryPercentage = Math.round((categoryCheckedCount / categoryTotal) * 100);
                  
                  return (
                    <Card key={category.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <CardTitle className="text-base">{language === "ar" ? category.titleAr : category.titleEn}</CardTitle>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{categoryCheckedCount}/{categoryTotal}</span>
                            <Badge variant={categoryPercentage === 100 ? "default" : "secondary"} className="text-xs">
                              {categoryPercentage}%
                            </Badge>
                          </div>
                        </div>
                        <Progress value={categoryPercentage} className="h-1 mt-2" />
                      </CardHeader>
                      <CardContent className="space-y-1 pt-2">
                        {category.items.map((item) => (
                          <div 
                            key={item.id}
                            className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                            onClick={() => toggleCheckItem(item.id)}
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
            </TabsContent>

            <TabsContent value="directive" className="mt-4 space-y-4">
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
                      onClick={() => setSignDialogOpen(true)}
                      disabled={acceptedPolicy || !!currentSignature}
                      className="gap-2"
                      data-testid="button-accept-policy"
                    >
                      {acceptedPolicy || currentSignature ? (
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
                    {(acceptedPolicy || currentSignature) && (
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
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}
