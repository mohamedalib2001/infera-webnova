export interface ApiEndpoint {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  description: string;
  descriptionAr: string;
}

export interface PageDoc {
  id: string;
  name: string;
  nameAr: string;
  filePath: string;
  description: string;
  descriptionAr: string;
  category: string;
  icon: string;
  features: string[];
  featuresAr: string[];
  apiEndpoints: ApiEndpoint[];
  dataModels: string[];
  dependencies: string[];
  accessLevel: string;
}

export const technicalDocs: PageDoc[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    nameAr: "لوحة التحكم",
    filePath: "client/src/pages/dashboard.tsx",
    description: "Main analytics dashboard with KPIs and metrics",
    descriptionAr: "لوحة التحليلات الرئيسية مع مؤشرات الأداء",
    category: "core",
    icon: "LayoutDashboard",
    features: [
      "Real-time employee statistics",
      "Attendance overview cards",
      "Department breakdown chart",
      "Recent activities feed"
    ],
    featuresAr: [
      "إحصائيات الموظفين الفورية",
      "بطاقات نظرة عامة على الحضور",
      "مخطط توزيع الأقسام",
      "آخر الأنشطة"
    ],
    apiEndpoints: [
      {
        method: "GET",
        path: "/api/dashboard/stats",
        description: "Get dashboard statistics",
        descriptionAr: "الحصول على إحصائيات لوحة التحكم"
      }
    ],
    dataModels: ["Employee", "Attendance", "Department"],
    dependencies: ["recharts", "@tanstack/react-query", "lucide-react"],
    accessLevel: "all"
  },
  {
    id: "platform-builder",
    name: "Platform Builder",
    nameAr: "مُنشئ المنصات",
    filePath: "client/src/pages/platform-builder.tsx",
    description: "AI-powered sovereign platform generator with Nova AI",
    descriptionAr: "مُنشئ المنصات السيادية المدعوم بالذكاء الاصطناعي Nova",
    category: "core",
    icon: "Layers",
    features: [
      "Natural language platform description",
      "AI architecture analysis",
      "Microservices generation",
      "Docker/Kubernetes file export",
      "Live preview",
      "Arabic conversation support"
    ],
    featuresAr: [
      "وصف المنصة باللغة الطبيعية",
      "تحليل البنية بالذكاء الاصطناعي",
      "توليد الخدمات المصغرة",
      "تصدير ملفات Docker/Kubernetes",
      "معاينة مباشرة",
      "دعم المحادثة بالعربية"
    ],
    apiEndpoints: [
      {
        method: "POST",
        path: "/api/nova/analyze",
        description: "Analyze platform requirements with AI",
        descriptionAr: "تحليل متطلبات المنصة بالذكاء الاصطناعي"
      },
      {
        method: "POST",
        path: "/api/nova/generate",
        description: "Generate platform architecture",
        descriptionAr: "توليد بنية المنصة"
      }
    ],
    dataModels: ["Platform", "Architecture", "Microservice"],
    dependencies: ["@anthropic-ai/sdk", "lucide-react", "framer-motion"],
    accessLevel: "owner"
  },
  {
    id: "integrations-settings",
    name: "Integration Settings",
    nameAr: "إعدادات التكاملات",
    filePath: "client/src/pages/integrations-settings.tsx",
    description: "Configure 36 external service providers with AES-256-GCM encryption",
    descriptionAr: "إعدادات 36 مزود خدمة خارجي مع تشفير AES-256-GCM",
    category: "admin",
    icon: "Plug",
    features: [
      "36 providers across 5 categories",
      "AES-256-GCM credential encryption",
      "Masked credential display",
      "Connection testing",
      "Regional MENA providers"
    ],
    featuresAr: [
      "36 مزود في 5 فئات",
      "تشفير بيانات الاعتماد AES-256-GCM",
      "عرض مُقنّع للبيانات",
      "اختبار الاتصال",
      "مزودين إقليميين للشرق الأوسط"
    ],
    apiEndpoints: [
      {
        method: "GET",
        path: "/api/integrations",
        description: "Get all integration configurations",
        descriptionAr: "الحصول على إعدادات جميع التكاملات"
      },
      {
        method: "POST",
        path: "/api/integrations/:id",
        description: "Save integration credentials (encrypted)",
        descriptionAr: "حفظ بيانات الاعتماد (مشفرة)"
      },
      {
        method: "POST",
        path: "/api/integrations/:id/test",
        description: "Test integration connection",
        descriptionAr: "اختبار اتصال التكامل"
      }
    ],
    dataModels: ["IntegrationConfig", "IntegrationCredential"],
    dependencies: ["crypto", "lucide-react"],
    accessLevel: "owner"
  },
  {
    id: "audit-logs",
    name: "Audit Logs",
    nameAr: "سجلات التدقيق",
    filePath: "client/src/pages/audit-logs.tsx",
    description: "Military-grade security audit logging with classification levels",
    descriptionAr: "سجلات تدقيق أمني بمستوى عسكري مع مستويات تصنيف",
    category: "security",
    icon: "Shield",
    features: [
      "Real-time event logging",
      "Classification levels (unclassified to top_secret)",
      "User action tracking",
      "Export capabilities",
      "Advanced filtering"
    ],
    featuresAr: [
      "تسجيل الأحداث الفوري",
      "مستويات تصنيف (غير مصنف إلى سري للغاية)",
      "تتبع إجراءات المستخدم",
      "قدرات التصدير",
      "تصفية متقدمة"
    ],
    apiEndpoints: [
      {
        method: "GET",
        path: "/api/audit-logs",
        description: "Get audit log entries",
        descriptionAr: "الحصول على سجلات التدقيق"
      }
    ],
    dataModels: ["SecurityAuditLog"],
    dependencies: ["date-fns", "lucide-react"],
    accessLevel: "owner"
  },
  {
    id: "permissions",
    name: "Permissions Management",
    nameAr: "إدارة الصلاحيات",
    filePath: "client/src/pages/permissions.tsx",
    description: "64-permission RBAC system with granular access control",
    descriptionAr: "نظام 64 صلاحية مع تحكم دقيق بالوصول",
    category: "security",
    icon: "Key",
    features: [
      "64 granular permissions",
      "Role-based access control",
      "Permission inheritance",
      "Real-time validation",
      "Audit trail"
    ],
    featuresAr: [
      "64 صلاحية دقيقة",
      "تحكم بالوصول حسب الدور",
      "توريث الصلاحيات",
      "التحقق الفوري",
      "سجل التدقيق"
    ],
    apiEndpoints: [
      {
        method: "GET",
        path: "/api/permissions",
        description: "Get all permissions",
        descriptionAr: "الحصول على جميع الصلاحيات"
      },
      {
        method: "PATCH",
        path: "/api/permissions/:roleId",
        description: "Update role permissions",
        descriptionAr: "تحديث صلاحيات الدور"
      }
    ],
    dataModels: ["Permission", "Role", "UserRole"],
    dependencies: ["lucide-react"],
    accessLevel: "owner"
  },
  {
    id: "secrets-vault",
    name: "Secrets Vault",
    nameAr: "خزنة الأسرار",
    filePath: "client/src/pages/secrets-vault.tsx",
    description: "AES-256-GCM encrypted secret management with versioning",
    descriptionAr: "إدارة الأسرار المشفرة AES-256-GCM مع الإصدارات",
    category: "security",
    icon: "Lock",
    features: [
      "AES-256-GCM encryption",
      "Version history",
      "Access logging",
      "Secret rotation",
      "Environment separation"
    ],
    featuresAr: [
      "تشفير AES-256-GCM",
      "تاريخ الإصدارات",
      "تسجيل الوصول",
      "تدوير الأسرار",
      "فصل البيئات"
    ],
    apiEndpoints: [
      {
        method: "GET",
        path: "/api/secrets",
        description: "List all secrets (metadata only)",
        descriptionAr: "عرض جميع الأسرار (البيانات الوصفية فقط)"
      },
      {
        method: "POST",
        path: "/api/secrets",
        description: "Create new secret",
        descriptionAr: "إنشاء سر جديد"
      }
    ],
    dataModels: ["Secret", "SecretVersion"],
    dependencies: ["crypto", "lucide-react"],
    accessLevel: "owner"
  }
];

export const categoryLabels: Record<string, { en: string; ar: string }> = {
  core: { en: "Core", ar: "الأساسية" },
  admin: { en: "Administration", ar: "الإدارة" },
  security: { en: "Security", ar: "الأمان" },
  analytics: { en: "Analytics", ar: "التحليلات" },
  settings: { en: "Settings", ar: "الإعدادات" }
};
