import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  Lock,
  Users,
  Brain,
  Database,
  Server,
  Accessibility,
  Rocket,
  FileText,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Landmark,
  Award,
  Globe,
  ShieldCheck,
  FileCheck,
  Building2,
} from "lucide-react";

// Government Compliance Checklist Data Structure
interface ChecklistItem {
  id: string;
  titleEn: string;
  titleAr: string;
  status: "completed" | "in_progress" | "pending";
}

interface ChecklistSubsection {
  id: string;
  titleEn: string;
  titleAr: string;
  items: ChecklistItem[];
}

interface ChecklistSection {
  id: string;
  number: string;
  titleEn: string;
  titleAr: string;
  icon: LucideIcon;
  color: string;
  subsections: ChecklistSubsection[];
}

// Complete Government Readiness Checklist - قائمة التحقق الكاملة للجاهزية الحكومية
const governmentChecklist: ChecklistSection[] = [
  {
    id: "governance",
    number: "1",
    titleEn: "Governance & Compliance",
    titleAr: "الحوكمة والامتثال",
    icon: Landmark,
    color: "purple",
    subsections: [
      {
        id: "policies",
        titleEn: "Official Documented Policies",
        titleAr: "سياسات رسمية موثقة",
        items: [
          { id: "gov-1-1", titleEn: "Information Security Policy", titleAr: "سياسة أمن المعلومات", status: "completed" },
          { id: "gov-1-2", titleEn: "Privacy & Data Protection Policy", titleAr: "سياسة الخصوصية وحماية البيانات", status: "completed" },
          { id: "gov-1-3", titleEn: "Data Retention Policy", titleAr: "سياسة الاحتفاظ بالبيانات", status: "completed" },
          { id: "gov-1-4", titleEn: "Risk Management Policy", titleAr: "سياسة إدارة المخاطر", status: "in_progress" },
        ]
      },
      {
        id: "regulatory",
        titleEn: "Regulatory Compliance",
        titleAr: "الامتثال التنظيمي",
        items: [
          { id: "gov-2-1", titleEn: "GDPR / Local Privacy Laws Compliance", titleAr: "توافق GDPR / قوانين الخصوصية المحلية", status: "completed" },
          { id: "gov-2-2", titleEn: "Apple App Store & Google Play Policies", titleAr: "التزام بسياسات Apple App Store & Google Play", status: "completed" },
          { id: "gov-2-3", titleEn: "ISO/IEC 27001 Compliance (Certifiable)", titleAr: "توافق مع ISO/IEC 27001 (قابل للاعتماد)", status: "in_progress" },
          { id: "gov-2-4", titleEn: "ISO/IEC 23894 (AI Risk Management)", titleAr: "توافق مع ISO/IEC 23894 (إدارة مخاطر الذكاء الاصطناعي)", status: "in_progress" },
        ]
      }
    ]
  },
  {
    id: "cybersecurity",
    number: "2",
    titleEn: "Cybersecurity",
    titleAr: "الأمن السيبراني",
    icon: Shield,
    color: "red",
    subsections: [
      {
        id: "security-arch",
        titleEn: "Security Architecture",
        titleAr: "بنية أمنية",
        items: [
          { id: "sec-1-1", titleEn: "Data Encryption in Transit (TLS 1.3)", titleAr: "تشفير البيانات أثناء النقل (TLS 1.3)", status: "completed" },
          { id: "sec-1-2", titleEn: "Data Encryption at Rest (AES-256)", titleAr: "تشفير البيانات المخزنة (AES-256)", status: "completed" },
          { id: "sec-1-3", titleEn: "Secure Key Management", titleAr: "إدارة المفاتيح الآمنة", status: "completed" },
          { id: "sec-1-4", titleEn: "Secrets Management", titleAr: "إدارة الأسرار", status: "completed" },
        ]
      },
      {
        id: "access-control",
        titleEn: "Access Control",
        titleAr: "التحكم بالوصول",
        items: [
          { id: "sec-2-1", titleEn: "Role-Based Access Control (RBAC)", titleAr: "التحكم بالوصول المبني على الأدوار", status: "completed" },
          { id: "sec-2-2", titleEn: "Attribute-Based Access Control (ABAC)", titleAr: "التحكم بالوصول المبني على السمات", status: "completed" },
          { id: "sec-2-3", titleEn: "Least Privilege Principle", titleAr: "مبدأ أقل الصلاحيات", status: "completed" },
          { id: "sec-2-4", titleEn: "Multi-Factor Authentication (MFA)", titleAr: "المصادقة متعددة العوامل", status: "in_progress" },
        ]
      },
      {
        id: "security-standards",
        titleEn: "Security Standards",
        titleAr: "المعايير الأمنية",
        items: [
          { id: "sec-3-1", titleEn: "OWASP MASVS Compliance", titleAr: "التوافق مع OWASP MASVS", status: "completed" },
          { id: "sec-3-2", titleEn: "OWASP MASTG Compliance", titleAr: "التوافق مع OWASP MASTG", status: "completed" },
          { id: "sec-3-3", titleEn: "Automated Vulnerability Scanning (SAST/DAST)", titleAr: "فحص ثغرات تلقائي (SAST / DAST)", status: "in_progress" },
        ]
      }
    ]
  },
  {
    id: "iam",
    number: "3",
    titleEn: "Identity & Access Management",
    titleAr: "إدارة الهوية والصلاحيات",
    icon: Users,
    color: "blue",
    subsections: [
      {
        id: "identity",
        titleEn: "Identity",
        titleAr: "الهوية",
        items: [
          { id: "iam-1-1", titleEn: "OAuth 2.0 / OpenID Connect", titleAr: "OAuth 2.0 / OpenID Connect", status: "completed" },
          { id: "iam-1-2", titleEn: "SSO Support for Government Entities", titleAr: "دعم SSO للجهات الحكومية", status: "in_progress" },
          { id: "iam-1-3", titleEn: "Secure Session Management", titleAr: "إدارة الجلسات الآمنة", status: "completed" },
        ]
      },
      {
        id: "permissions",
        titleEn: "Permissions",
        titleAr: "الصلاحيات",
        items: [
          { id: "iam-2-1", titleEn: "User Management", titleAr: "إدارة المستخدمين", status: "completed" },
          { id: "iam-2-2", titleEn: "Role Management", titleAr: "إدارة الأدوار", status: "completed" },
          { id: "iam-2-3", titleEn: "Department Management", titleAr: "إدارة الإدارات", status: "completed" },
          { id: "iam-2-4", titleEn: "Permission Change Audit Trail", titleAr: "سجلات تغييرات الصلاحيات", status: "completed" },
        ]
      }
    ]
  },
  {
    id: "responsible-ai",
    number: "4",
    titleEn: "Responsible AI",
    titleAr: "الذكاء الاصطناعي المسؤول",
    icon: Brain,
    color: "pink",
    subsections: [
      {
        id: "transparency",
        titleEn: "Transparency",
        titleAr: "الشفافية",
        items: [
          { id: "ai-1-1", titleEn: "AI Model Documentation", titleAr: "توثيق نماذج الذكاء الاصطناعي", status: "completed" },
          { id: "ai-1-2", titleEn: "Explainable AI (XAI)", titleAr: "الذكاء الاصطناعي القابل للتفسير", status: "completed" },
          { id: "ai-1-3", titleEn: "AI Decision Explanation to Users", titleAr: "توضيح قرارات الذكاء الاصطناعي للمستخدم", status: "completed" },
        ]
      },
      {
        id: "ethics",
        titleEn: "Ethics",
        titleAr: "الأخلاقيات",
        items: [
          { id: "ai-2-1", titleEn: "User Explicit Consent", titleAr: "موافقة المستخدم الصريحة", status: "completed" },
          { id: "ai-2-2", titleEn: "Bias Detection & Prevention", titleAr: "منع التحيّز واكتشافه", status: "in_progress" },
          { id: "ai-2-3", titleEn: "Fairness Auditing", titleAr: "تدقيق العدالة", status: "in_progress" },
          { id: "ai-2-4", titleEn: "Human-in-the-Loop", titleAr: "الإنسان في الحلقة", status: "completed" },
        ]
      },
      {
        id: "ai-privacy",
        titleEn: "AI Privacy",
        titleAr: "خصوصية الذكاء الاصطناعي",
        items: [
          { id: "ai-3-1", titleEn: "No Biometric Data Storage Without Consent", titleAr: "عدم تخزين بيانات بيومترية دون موافقة", status: "completed" },
          { id: "ai-3-2", titleEn: "On-Device Processing Support", titleAr: "دعم المعالجة على الجهاز", status: "in_progress" },
          { id: "ai-3-3", titleEn: "Data Residency Specification", titleAr: "تحديد موقع معالجة البيانات", status: "completed" },
        ]
      }
    ]
  },
  {
    id: "data-auditing",
    number: "5",
    titleEn: "Data & Auditing",
    titleAr: "البيانات والتدقيق",
    icon: Database,
    color: "green",
    subsections: [
      {
        id: "data-management",
        titleEn: "Data Management",
        titleAr: "إدارة البيانات",
        items: [
          { id: "data-1-1", titleEn: "Data Classification (Public/Internal/Confidential)", titleAr: "تصنيف البيانات (عام / داخلي / سري)", status: "completed" },
          { id: "data-1-2", titleEn: "Encrypted Backups", titleAr: "النسخ الاحتياطي المشفر", status: "completed" },
          { id: "data-1-3", titleEn: "Disaster Recovery Plans (DRP)", titleAr: "خطط التعافي من الكوارث", status: "in_progress" },
        ]
      },
      {
        id: "audit-monitoring",
        titleEn: "Auditing & Monitoring",
        titleAr: "التدقيق والمراقبة",
        items: [
          { id: "data-2-1", titleEn: "Immutable Audit Logs", titleAr: "سجلات تدقيق غير قابلة للتعديل", status: "completed" },
          { id: "data-2-2", titleEn: "Real-time Monitoring", titleAr: "المراقبة في الوقت الحقيقي", status: "completed" },
          { id: "data-2-3", titleEn: "Incident Response Plan", titleAr: "خطة الاستجابة للحوادث", status: "in_progress" },
        ]
      }
    ]
  },
  {
    id: "technical-arch",
    number: "6",
    titleEn: "Technical Architecture",
    titleAr: "البنية التقنية",
    icon: Server,
    color: "cyan",
    subsections: [
      {
        id: "architecture",
        titleEn: "Architecture",
        titleAr: "البنية",
        items: [
          { id: "tech-1-1", titleEn: "Microservices Architecture", titleAr: "بنية الخدمات المصغرة", status: "completed" },
          { id: "tech-1-2", titleEn: "API Gateway", titleAr: "بوابة API", status: "completed" },
          { id: "tech-1-3", titleEn: "OpenAPI 3.1 Documentation", titleAr: "توثيق OpenAPI 3.1", status: "completed" },
          { id: "tech-1-4", titleEn: "Versioned APIs", titleAr: "APIs مع إصدارات", status: "completed" },
        ]
      },
      {
        id: "scalability",
        titleEn: "Scalability & Stability",
        titleAr: "التوسع والاستقرار",
        items: [
          { id: "tech-2-1", titleEn: "Auto-Scaling", titleAr: "التوسع التلقائي", status: "completed" },
          { id: "tech-2-2", titleEn: "Load Balancing", titleAr: "موازنة الحمل", status: "completed" },
          { id: "tech-2-3", titleEn: "High Availability", titleAr: "التوفر العالي", status: "completed" },
          { id: "tech-2-4", titleEn: "Performance SLAs", titleAr: "اتفاقيات مستوى الأداء", status: "in_progress" },
        ]
      }
    ]
  },
  {
    id: "gov-ux",
    number: "7",
    titleEn: "Government UX",
    titleAr: "تجربة المستخدم الحكومية",
    icon: Accessibility,
    color: "orange",
    subsections: [
      {
        id: "usability",
        titleEn: "Usability",
        titleAr: "سهولة الاستخدام",
        items: [
          { id: "ux-1-1", titleEn: "WCAG 2.1 Compliant Interfaces", titleAr: "واجهات متوافقة مع WCAG 2.1", status: "completed" },
          { id: "ux-1-2", titleEn: "Bilingual Support (Arabic/English)", titleAr: "دعم اللغتين (عربي / إنجليزي)", status: "completed" },
          { id: "ux-1-3", titleEn: "Accessibility Support", titleAr: "دعم ذوي الإعاقة", status: "in_progress" },
        ]
      },
      {
        id: "smart-interaction",
        titleEn: "Smart Interaction",
        titleAr: "التفاعل الذكي",
        items: [
          { id: "ux-2-1", titleEn: "AI Onboarding", titleAr: "تأهيل بالذكاء الاصطناعي", status: "completed" },
          { id: "ux-2-2", titleEn: "Context-Aware AI Assistant", titleAr: "مساعد ذكي مدرك للسياق", status: "completed" },
          { id: "ux-2-3", titleEn: "Official Guidance Messages", titleAr: "رسائل إرشادية رسمية", status: "completed" },
        ]
      }
    ]
  },
  {
    id: "deployment",
    number: "8",
    titleEn: "Deployment & Operations",
    titleAr: "النشر والتشغيل",
    icon: Rocket,
    color: "indigo",
    subsections: [
      {
        id: "deployment-env",
        titleEn: "Deployment",
        titleAr: "النشر",
        items: [
          { id: "dep-1-1", titleEn: "Separate Environments (Dev/Test/Prod)", titleAr: "بيئات منفصلة (Dev / Test / Prod)", status: "completed" },
          { id: "dep-1-2", titleEn: "Secure CI/CD Pipeline", titleAr: "خط أنابيب CI/CD آمن", status: "completed" },
          { id: "dep-1-3", titleEn: "On-Prem / Gov Cloud Deployment", titleAr: "إمكانية النشر داخل الدولة", status: "in_progress" },
        ]
      },
      {
        id: "operations",
        titleEn: "Operations",
        titleAr: "التشغيل",
        items: [
          { id: "dep-2-1", titleEn: "Service Level Agreement (SLA)", titleAr: "اتفاقية مستوى الخدمة", status: "in_progress" },
          { id: "dep-2-2", titleEn: "Official Technical Support", titleAr: "دعم فني رسمي", status: "completed" },
          { id: "dep-2-3", titleEn: "Business Continuity Plans (BCP)", titleAr: "خطط استمرارية الأعمال", status: "in_progress" },
        ]
      }
    ]
  },
  {
    id: "documentation",
    number: "9",
    titleEn: "Official Documentation",
    titleAr: "التوثيق الرسمي",
    icon: FileText,
    color: "amber",
    subsections: [
      {
        id: "mandatory-docs",
        titleEn: "Mandatory Documents",
        titleAr: "مستندات إلزامية",
        items: [
          { id: "doc-1-1", titleEn: "System Architecture Document", titleAr: "وثيقة بنية النظام", status: "completed" },
          { id: "doc-1-2", titleEn: "Security Architecture Document", titleAr: "وثيقة البنية الأمنية", status: "completed" },
          { id: "doc-1-3", titleEn: "AI Governance Document", titleAr: "وثيقة حوكمة الذكاء الاصطناعي", status: "completed" },
          { id: "doc-1-4", titleEn: "Data Flow Diagrams", titleAr: "مخططات تدفق البيانات", status: "completed" },
          { id: "doc-1-5", titleEn: "Threat Modeling Report", titleAr: "تقرير نمذجة التهديدات", status: "in_progress" },
        ]
      }
    ]
  }
];

// Calculate statistics
function calculateStats(sections: ChecklistSection[]) {
  let total = 0;
  let completed = 0;
  let inProgress = 0;
  let pending = 0;

  sections.forEach(section => {
    section.subsections.forEach(sub => {
      sub.items.forEach(item => {
        total++;
        if (item.status === "completed") completed++;
        else if (item.status === "in_progress") inProgress++;
        else pending++;
      });
    });
  });

  return { total, completed, inProgress, pending, percentage: Math.round((completed / total) * 100) };
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const config = {
    completed: { icon: CheckCircle2, label: "Completed | مكتمل", className: "bg-green-500/20 text-green-600 border-green-500/30" },
    in_progress: { icon: Clock, label: "In Progress | قيد التنفيذ", className: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30" },
    pending: { icon: AlertCircle, label: "Pending | معلق", className: "bg-gray-500/20 text-gray-500 border-gray-500/30" },
  };
  const { icon: Icon, label, className } = config[status as keyof typeof config] || config.pending;
  return (
    <Badge variant="outline" className={cn("gap-1 text-[10px]", className)}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}

// Color helper
function getColorClasses(color: string) {
  const colors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    purple: { bg: "from-purple-500/10 to-purple-600/5", border: "border-purple-500/30", text: "text-purple-600", icon: "bg-purple-500" },
    red: { bg: "from-red-500/10 to-red-600/5", border: "border-red-500/30", text: "text-red-600", icon: "bg-red-500" },
    blue: { bg: "from-blue-500/10 to-blue-600/5", border: "border-blue-500/30", text: "text-blue-600", icon: "bg-blue-500" },
    pink: { bg: "from-pink-500/10 to-pink-600/5", border: "border-pink-500/30", text: "text-pink-600", icon: "bg-pink-500" },
    green: { bg: "from-green-500/10 to-green-600/5", border: "border-green-500/30", text: "text-green-600", icon: "bg-green-500" },
    cyan: { bg: "from-cyan-500/10 to-cyan-600/5", border: "border-cyan-500/30", text: "text-cyan-600", icon: "bg-cyan-500" },
    orange: { bg: "from-orange-500/10 to-orange-600/5", border: "border-orange-500/30", text: "text-orange-600", icon: "bg-orange-500" },
    indigo: { bg: "from-indigo-500/10 to-indigo-600/5", border: "border-indigo-500/30", text: "text-indigo-600", icon: "bg-indigo-500" },
    amber: { bg: "from-amber-500/10 to-amber-600/5", border: "border-amber-500/30", text: "text-amber-600", icon: "bg-amber-500" },
  };
  return colors[color] || colors.purple;
}

export default function GovernmentCompliancePage() {
  const { toast } = useToast();
  const [checklistData, setChecklistData] = useState(governmentChecklist);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const stats = calculateStats(checklistData);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const toggleItemStatus = (sectionId: string, subsectionId: string, itemId: string) => {
    setChecklistData(prev => prev.map(section => {
      if (section.id !== sectionId) return section;
      return {
        ...section,
        subsections: section.subsections.map(sub => {
          if (sub.id !== subsectionId) return sub;
          return {
            ...sub,
            items: sub.items.map(item => {
              if (item.id !== itemId) return item;
              const newStatus = item.status === "completed" ? "pending" : 
                               item.status === "pending" ? "in_progress" : "completed";
              return { ...item, status: newStatus as any };
            })
          };
        })
      };
    }));
    toast({
      title: "Status Updated | تم تحديث الحالة",
      description: "Item status has been updated successfully. | تم تحديث حالة البند بنجاح.",
    });
  };

  const getSectionStats = (section: ChecklistSection) => {
    let total = 0, completed = 0;
    section.subsections.forEach(sub => {
      sub.items.forEach(item => {
        total++;
        if (item.status === "completed") completed++;
      });
    });
    return { total, completed, percentage: Math.round((completed / total) * 100) };
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
              <Landmark className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Government Readiness Checklist
              </h1>
              <p className="text-sm text-muted-foreground">
                قائمة الجاهزية للاعتماد الحكومي | INFRA Platform
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" data-testid="button-export-checklist">
            <Download className="h-4 w-4" />
            Export PDF | تصدير PDF
          </Button>
          <Button className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500" data-testid="button-generate-report">
            <FileCheck className="h-4 w-4" />
            Generate Report | إنشاء تقرير
          </Button>
        </div>
      </div>

      {/* Overall Progress */}
      <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-purple-500" />
              <div>
                <CardTitle>Overall Compliance Progress | التقدم الكلي للامتثال</CardTitle>
                <CardDescription>
                  AI-Driven Mobile Application Platform - INFRA
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-purple-600">{stats.percentage}%</div>
              <p className="text-sm text-muted-foreground">{stats.completed} / {stats.total} items</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={stats.percentage} className="h-3 mb-4" />
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">Completed | مكتمل</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground">In Progress | قيد التنفيذ</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-500/10 border border-gray-500/20">
              <div className="text-2xl font-bold text-gray-500">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Pending | معلق</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Government Ready Badge */}
      {stats.percentage === 100 && (
        <Card className="border-green-500/50 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
          <CardContent className="py-6">
            <div className="flex items-center justify-center gap-4">
              <ShieldCheck className="h-12 w-12 text-green-500" />
              <div className="text-center">
                <h2 className="text-xl font-bold text-green-600">
                  INFRA is Government-Ready | إنفيرا جاهزة للاعتماد الحكومي
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Qualified for government certification and ministry contracts
                </p>
              </div>
              <ShieldCheck className="h-12 w-12 text-green-500" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Checklist Sections */}
      <ScrollArea className="h-[calc(100vh-400px)]">
        <div className="grid gap-4">
          {checklistData.map((section) => {
            const sectionStats = getSectionStats(section);
            const colors = getColorClasses(section.color);
            const isExpanded = expandedSections[section.id] ?? true;

            return (
              <Collapsible key={section.id} open={isExpanded} onOpenChange={() => toggleSection(section.id)}>
                <Card className={cn("transition-all", colors.border, `bg-gradient-to-br ${colors.bg}`)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover-elevate">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("flex items-center justify-center w-10 h-10 rounded-lg", colors.icon)}>
                            <section.icon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="flex items-center gap-2 text-base">
                              <Badge variant="outline" className={cn("text-[10px]", colors.text, colors.border)}>
                                {section.number}
                              </Badge>
                              {section.titleEn}
                            </CardTitle>
                            <CardDescription>{section.titleAr}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right hidden sm:block">
                            <div className={cn("text-lg font-bold", colors.text)}>{sectionStats.percentage}%</div>
                            <p className="text-xs text-muted-foreground">{sectionStats.completed}/{sectionStats.total}</p>
                          </div>
                          <Progress value={sectionStats.percentage} className="w-24 h-2 hidden sm:block" />
                          {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="grid gap-4">
                        {section.subsections.map((subsection) => (
                          <div key={subsection.id} className="space-y-2">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                              {subsection.titleEn} | {subsection.titleAr}
                            </h4>
                            <div className="grid gap-2 ml-6">
                              {subsection.items.map((item) => (
                                <div 
                                  key={item.id}
                                  className={cn(
                                    "flex items-center justify-between gap-4 p-3 rounded-lg border transition-all cursor-pointer",
                                    item.status === "completed" && "bg-green-500/5 border-green-500/20",
                                    item.status === "in_progress" && "bg-yellow-500/5 border-yellow-500/20",
                                    item.status === "pending" && "bg-muted/50 border-muted"
                                  )}
                                  onClick={() => toggleItemStatus(section.id, subsection.id, item.id)}
                                  data-testid={`checklist-item-${item.id}`}
                                >
                                  <div className="flex items-center gap-3">
                                    <Checkbox 
                                      checked={item.status === "completed"} 
                                      className="pointer-events-none"
                                    />
                                    <div>
                                      <p className="text-sm font-medium">{item.titleEn}</p>
                                      <p className="text-xs text-muted-foreground">{item.titleAr}</p>
                                    </div>
                                  </div>
                                  <StatusBadge status={item.status} />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>
      </ScrollArea>

      {/* Final Result Section */}
      <Card className="border-2 border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-purple-500" />
            Final Result | النتيجة النهائية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className={cn(
              "p-4 rounded-lg border text-center transition-all",
              stats.percentage === 100 ? "bg-green-500/10 border-green-500/30" : "bg-muted/50"
            )}>
              <CheckCircle2 className={cn("h-8 w-8 mx-auto mb-2", stats.percentage === 100 ? "text-green-500" : "text-muted-foreground")} />
              <p className="text-sm font-medium">Government Certified</p>
              <p className="text-xs text-muted-foreground">مؤهلة للاعتماد الحكومي</p>
            </div>
            <div className={cn(
              "p-4 rounded-lg border text-center transition-all",
              stats.percentage === 100 ? "bg-green-500/10 border-green-500/30" : "bg-muted/50"
            )}>
              <Landmark className={cn("h-8 w-8 mx-auto mb-2", stats.percentage === 100 ? "text-green-500" : "text-muted-foreground")} />
              <p className="text-sm font-medium">Ministry Contracts Ready</p>
              <p className="text-xs text-muted-foreground">جاهزة للتعاقد مع الوزارات</p>
            </div>
            <div className={cn(
              "p-4 rounded-lg border text-center transition-all",
              stats.percentage === 100 ? "bg-green-500/10 border-green-500/30" : "bg-muted/50"
            )}>
              <Globe className={cn("h-8 w-8 mx-auto mb-2", stats.percentage === 100 ? "text-green-500" : "text-muted-foreground")} />
              <p className="text-sm font-medium">International Best Practices</p>
              <p className="text-xs text-muted-foreground">متوافقة مع أفضل الممارسات الدولية</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
