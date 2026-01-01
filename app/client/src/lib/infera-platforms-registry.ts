/**
 * INFERA Digital Platforms Registry
 * سجل منصات INFERA الرقمية المركزي
 * 
 * Platform Linking Unit (INFERA Engine Federation)
 * Registry for 30+ INFERA group platforms with hierarchy and sovereignty tiers
 * WebNova is registered as the ROOT platform
 */

export type PlatformTier = "root" | "sovereign" | "enterprise" | "standard" | "module";
export type PlatformCategory = 
  | "sovereignty" 
  | "intelligence" 
  | "commerce" 
  | "hr-management" 
  | "legal-compliance" 
  | "marketing" 
  | "education" 
  | "finance" 
  | "hospitality" 
  | "healthcare" 
  | "government"
  | "security"
  | "infrastructure"
  | "productivity";

export interface InferaPlatform {
  id: string;
  name: string;
  nameAr: string;
  shortCode: string;
  description: string;
  descriptionAr: string;
  tier: PlatformTier;
  category: PlatformCategory;
  icon: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  capabilities: string[];
  capabilitiesAr: string[];
  status: "active" | "development" | "planned" | "beta";
  route?: string;
  parentPlatformId?: string;
  aiCapabilities: {
    hasNovaIntegration: boolean;
    aiModelTypes: string[];
    governanceLevel: "full" | "partial" | "none";
  };
}

export const INFERA_PLATFORMS_REGISTRY: InferaPlatform[] = [
  // === ROOT PLATFORM ===
  {
    id: "infera-webnova",
    name: "INFERA WebNova",
    nameAr: "ويب نوفا INFERA",
    shortCode: "WN",
    description: "Core Operating System - Digital Platform Factory",
    descriptionAr: "نظام التشغيل الأساسي - مصنع المنصات الرقمية",
    tier: "root",
    category: "sovereignty",
    icon: "Crown",
    colors: { primary: "#0A0A0A", secondary: "#1C1C1C", accent: "#00D4FF" },
    capabilities: ["Platform Generation", "AI Orchestration", "Sovereign Governance", "Blueprint Management"],
    capabilitiesAr: ["توليد المنصات", "تنسيق الذكاء", "الحوكمة السيادية", "إدارة المخططات"],
    status: "active",
    route: "/sovereign-workspace",
    aiCapabilities: { hasNovaIntegration: true, aiModelTypes: ["decision", "governance", "generation"], governanceLevel: "full" }
  },
  
  // === SOVEREIGN PLATFORMS ===
  {
    id: "infera-engine-control",
    name: "INFERA Engine Control",
    nameAr: "محرك التحكم INFERA",
    shortCode: "EC",
    description: "Central Control Core - The Mind That Controls Everything",
    descriptionAr: "نواة التحكم المركزية - العقل الذي يتحكم في كل شيء",
    tier: "sovereign",
    category: "sovereignty",
    icon: "Cpu",
    colors: { primary: "#0A0A0A", secondary: "#1C1C1C", accent: "#00D4FF" },
    capabilities: ["System Control", "Resource Management", "Process Orchestration", "Kill Switch"],
    capabilitiesAr: ["التحكم بالنظام", "إدارة الموارد", "تنسيق العمليات", "مفتاح الإيقاف"],
    status: "active",
    route: "/engine-control-landing",
    parentPlatformId: "infera-webnova",
    aiCapabilities: { hasNovaIntegration: true, aiModelTypes: ["control", "monitoring"], governanceLevel: "full" }
  },
  {
    id: "infera-engine",
    name: "INFERA Engine",
    nameAr: "محرك INFERA",
    shortCode: "IE",
    description: "The Beating Heart of the Ecosystem",
    descriptionAr: "القلب النابض للمنظومة",
    tier: "sovereign",
    category: "intelligence",
    icon: "Zap",
    colors: { primary: "#0A1628", secondary: "#6B21A8", accent: "#FFFFFF" },
    capabilities: ["Core Processing", "AI Model Hosting", "Decision Engine", "Integration Hub"],
    capabilitiesAr: ["المعالجة الأساسية", "استضافة النماذج", "محرك القرارات", "مركز التكامل"],
    status: "active",
    route: "/engine-landing",
    parentPlatformId: "infera-webnova",
    aiCapabilities: { hasNovaIntegration: true, aiModelTypes: ["processing", "decision"], governanceLevel: "full" }
  },
  {
    id: "infera-shieldgrid",
    name: "INFERA ShieldGrid",
    nameAr: "شبكة الحماية INFERA",
    shortCode: "SG",
    description: "Sovereign Security Infrastructure",
    descriptionAr: "بنية الأمان السيادية",
    tier: "sovereign",
    category: "security",
    icon: "Shield",
    colors: { primary: "#0F0F0F", secondary: "#DC2626", accent: "#FFFFFF" },
    capabilities: ["Zero Trust Security", "Threat Detection", "Access Control", "Encryption Management"],
    capabilitiesAr: ["أمان الثقة الصفرية", "كشف التهديدات", "التحكم بالوصول", "إدارة التشفير"],
    status: "active",
    route: "/shieldgrid-landing",
    parentPlatformId: "infera-webnova",
    aiCapabilities: { hasNovaIntegration: true, aiModelTypes: ["security", "detection"], governanceLevel: "full" }
  },
  {
    id: "infera-globalcloud",
    name: "INFERA GlobalCloud",
    nameAr: "السحابة العالمية INFERA",
    shortCode: "GC",
    description: "Global Infrastructure Management",
    descriptionAr: "إدارة البنية التحتية العالمية",
    tier: "sovereign",
    category: "infrastructure",
    icon: "Cloud",
    colors: { primary: "#1E3A8A", secondary: "#3B82F6", accent: "#FFFFFF" },
    capabilities: ["Multi-Cloud Management", "Auto-Scaling", "Disaster Recovery", "Edge Computing"],
    capabilitiesAr: ["إدارة السحب المتعددة", "التوسع التلقائي", "استعادة الكوارث", "الحوسبة الطرفية"],
    status: "active",
    route: "/globalcloud-landing",
    parentPlatformId: "infera-webnova",
    aiCapabilities: { hasNovaIntegration: true, aiModelTypes: ["infrastructure", "optimization"], governanceLevel: "full" }
  },
  
  // === ENTERPRISE PLATFORMS ===
  {
    id: "infera-humaniq",
    name: "INFERA HumanIQ",
    nameAr: "العقل المؤسسي INFERA",
    shortCode: "HQ",
    description: "HR Intelligence That Manages Humans Without Eliminating Humanity",
    descriptionAr: "ذكاء يدير البشر بدون أن يُلغي إنسانيتهم",
    tier: "enterprise",
    category: "hr-management",
    icon: "Users",
    colors: { primary: "#1E40AF", secondary: "#4B5563", accent: "#D4AF37" },
    capabilities: ["Talent Management", "Performance Analytics", "Workforce Planning", "Culture Intelligence"],
    capabilitiesAr: ["إدارة المواهب", "تحليلات الأداء", "تخطيط القوى العاملة", "ذكاء الثقافة"],
    status: "active",
    route: "/humaniq-landing",
    parentPlatformId: "infera-engine",
    aiCapabilities: { hasNovaIntegration: true, aiModelTypes: ["hr", "analytics"], governanceLevel: "partial" }
  },
  {
    id: "infera-legal-ai",
    name: "INFERA Legal AI",
    nameAr: "الذكاء القانوني INFERA",
    shortCode: "LA",
    description: "Law That Never Sleeps and Never Errs",
    descriptionAr: "قانون لا ينام ولا يخطئ",
    tier: "enterprise",
    category: "legal-compliance",
    icon: "Scale",
    colors: { primary: "#7C2D12", secondary: "#1F2937", accent: "#C0C0C0" },
    capabilities: ["Contract Analysis", "Compliance Monitoring", "Legal Research", "Risk Assessment"],
    capabilitiesAr: ["تحليل العقود", "مراقبة الامتثال", "البحث القانوني", "تقييم المخاطر"],
    status: "active",
    route: "/legal-landing",
    parentPlatformId: "infera-engine",
    aiCapabilities: { hasNovaIntegration: true, aiModelTypes: ["legal", "compliance"], governanceLevel: "partial" }
  },
  {
    id: "infera-finance-ai",
    name: "INFERA Finance AI",
    nameAr: "الذكاء المالي INFERA",
    shortCode: "FA",
    description: "Financial Intelligence for Strategic Decisions",
    descriptionAr: "ذكاء مالي للقرارات الاستراتيجية",
    tier: "enterprise",
    category: "finance",
    icon: "TrendingUp",
    colors: { primary: "#064E3B", secondary: "#10B981", accent: "#FFFFFF" },
    capabilities: ["Financial Analysis", "Risk Management", "Investment Intelligence", "Fraud Detection"],
    capabilitiesAr: ["التحليل المالي", "إدارة المخاطر", "ذكاء الاستثمار", "كشف الاحتيال"],
    status: "active",
    route: "/finance-landing",
    parentPlatformId: "infera-engine",
    aiCapabilities: { hasNovaIntegration: true, aiModelTypes: ["finance", "prediction"], governanceLevel: "partial" }
  },
  {
    id: "infera-marketing-ai",
    name: "INFERA Marketing AI",
    nameAr: "الذكاء التسويقي INFERA",
    shortCode: "MA",
    description: "Intelligence That Sees the Market Before It Moves",
    descriptionAr: "ذكاء يرى السوق قبل أن يتحرك",
    tier: "enterprise",
    category: "marketing",
    icon: "Target",
    colors: { primary: "#374151", secondary: "#EC4899", accent: "#F9FAFB" },
    capabilities: ["Market Analysis", "Campaign Optimization", "Customer Intelligence", "Trend Prediction"],
    capabilitiesAr: ["تحليل السوق", "تحسين الحملات", "ذكاء العملاء", "توقع الاتجاهات"],
    status: "active",
    route: "/marketing-landing",
    parentPlatformId: "infera-engine",
    aiCapabilities: { hasNovaIntegration: true, aiModelTypes: ["marketing", "analytics"], governanceLevel: "partial" }
  },
  {
    id: "infera-marketplace-ai",
    name: "INFERA Marketplace AI",
    nameAr: "السوق الذكي INFERA",
    shortCode: "MP",
    description: "A Market That Understands Before It Suggests",
    descriptionAr: "سوق يفهم قبل أن يُقترح",
    tier: "enterprise",
    category: "commerce",
    icon: "ShoppingCart",
    colors: { primary: "#0F0F0F", secondary: "#047857", accent: "#C0C0C0" },
    capabilities: ["Product Intelligence", "Dynamic Pricing", "Recommendation Engine", "Inventory Optimization"],
    capabilitiesAr: ["ذكاء المنتجات", "التسعير الديناميكي", "محرك التوصيات", "تحسين المخزون"],
    status: "active",
    route: "/marketplace-landing",
    parentPlatformId: "infera-engine",
    aiCapabilities: { hasNovaIntegration: true, aiModelTypes: ["commerce", "recommendation"], governanceLevel: "partial" }
  },
  {
    id: "infera-education-hub",
    name: "INFERA Education Hub",
    nameAr: "مركز التعليم INFERA",
    shortCode: "EH",
    description: "Education That Adapts to the Mind",
    descriptionAr: "تعليم يتكيّف مع العقل",
    tier: "enterprise",
    category: "education",
    icon: "GraduationCap",
    colors: { primary: "#312E81", secondary: "#22D3EE", accent: "#FFFFFF" },
    capabilities: ["Adaptive Learning", "Content Generation", "Progress Tracking", "Skill Assessment"],
    capabilitiesAr: ["التعلم التكيفي", "توليد المحتوى", "تتبع التقدم", "تقييم المهارات"],
    status: "active",
    route: "/education-landing",
    parentPlatformId: "infera-engine",
    aiCapabilities: { hasNovaIntegration: true, aiModelTypes: ["education", "assessment"], governanceLevel: "partial" }
  },
  {
    id: "infera-hospitality-ai",
    name: "INFERA Hospitality AI",
    nameAr: "ضيافة INFERA الذكية",
    shortCode: "HA",
    description: "Intelligent Hospitality Management",
    descriptionAr: "إدارة ضيافة ذكية",
    tier: "enterprise",
    category: "hospitality",
    icon: "Hotel",
    colors: { primary: "#1F2937", secondary: "#F59E0B", accent: "#FFFFFF" },
    capabilities: ["Guest Experience", "Revenue Management", "Operations Optimization", "Personalization"],
    capabilitiesAr: ["تجربة الضيف", "إدارة الإيرادات", "تحسين العمليات", "التخصيص"],
    status: "active",
    route: "/hospitality-landing",
    parentPlatformId: "infera-engine",
    aiCapabilities: { hasNovaIntegration: true, aiModelTypes: ["hospitality", "service"], governanceLevel: "partial" }
  },
  
  // === STANDARD PLATFORMS ===
  {
    id: "infera-attend-ai",
    name: "INFERA Attend AI",
    nameAr: "الحضور الذكي INFERA",
    shortCode: "AT",
    description: "Intelligent Attendance and Time Management",
    descriptionAr: "إدارة ذكية للحضور والوقت",
    tier: "standard",
    category: "hr-management",
    icon: "Clock",
    colors: { primary: "#111827", secondary: "#059669", accent: "#FFFFFF" },
    capabilities: ["Attendance Tracking", "Time Analytics", "Shift Management", "Compliance Reporting"],
    capabilitiesAr: ["تتبع الحضور", "تحليلات الوقت", "إدارة الورديات", "تقارير الامتثال"],
    status: "active",
    route: "/attend-landing",
    parentPlatformId: "infera-humaniq",
    aiCapabilities: { hasNovaIntegration: true, aiModelTypes: ["attendance", "analytics"], governanceLevel: "partial" }
  },
  {
    id: "infera-trainai",
    name: "INFERA TrainAI",
    nameAr: "التدريب الذكي INFERA",
    shortCode: "TA",
    description: "AI-Powered Training and Development",
    descriptionAr: "تدريب وتطوير بقوة الذكاء",
    tier: "standard",
    category: "education",
    icon: "BookOpen",
    colors: { primary: "#1E293B", secondary: "#8B5CF6", accent: "#FFFFFF" },
    capabilities: ["Training Programs", "Skill Development", "Certification", "Progress Tracking"],
    capabilitiesAr: ["برامج التدريب", "تطوير المهارات", "الشهادات", "تتبع التقدم"],
    status: "active",
    route: "/trainai-landing",
    parentPlatformId: "infera-education-hub",
    aiCapabilities: { hasNovaIntegration: true, aiModelTypes: ["training", "assessment"], governanceLevel: "partial" }
  },
  {
    id: "infera-smartdocs",
    name: "INFERA SmartDocs",
    nameAr: "المستندات الذكية INFERA",
    shortCode: "SD",
    description: "Intelligent Document Management",
    descriptionAr: "إدارة مستندات ذكية",
    tier: "standard",
    category: "productivity",
    icon: "FileText",
    colors: { primary: "#1F2937", secondary: "#3B82F6", accent: "#FFFFFF" },
    capabilities: ["Document Generation", "OCR Processing", "Smart Search", "Version Control"],
    capabilitiesAr: ["توليد المستندات", "معالجة OCR", "البحث الذكي", "التحكم بالإصدارات"],
    status: "active",
    route: "/smartdocs-landing",
    parentPlatformId: "infera-engine",
    aiCapabilities: { hasNovaIntegration: true, aiModelTypes: ["document", "search"], governanceLevel: "partial" }
  },
  {
    id: "infera-smartremote",
    name: "INFERA SmartRemote",
    nameAr: "العمل عن بعد INFERA",
    shortCode: "SR",
    description: "Remote Work Intelligence Platform",
    descriptionAr: "منصة ذكاء العمل عن بعد",
    tier: "standard",
    category: "productivity",
    icon: "Laptop",
    colors: { primary: "#0F172A", secondary: "#06B6D4", accent: "#FFFFFF" },
    capabilities: ["Remote Monitoring", "Collaboration Tools", "Productivity Analytics", "Virtual Office"],
    capabilitiesAr: ["المراقبة عن بعد", "أدوات التعاون", "تحليلات الإنتاجية", "المكتب الافتراضي"],
    status: "active",
    route: "/smartremote-landing",
    parentPlatformId: "infera-humaniq",
    aiCapabilities: { hasNovaIntegration: true, aiModelTypes: ["productivity", "collaboration"], governanceLevel: "partial" }
  },
  {
    id: "infera-appforge",
    name: "INFERA AppForge",
    nameAr: "مصنع التطبيقات INFERA",
    shortCode: "AF",
    description: "No-Code Application Builder",
    descriptionAr: "منشئ تطبيقات بدون كود",
    tier: "standard",
    category: "productivity",
    icon: "Boxes",
    colors: { primary: "#18181B", secondary: "#A855F7", accent: "#FFFFFF" },
    capabilities: ["App Generation", "Visual Builder", "API Integration", "Deployment"],
    capabilitiesAr: ["توليد التطبيقات", "البناء المرئي", "تكامل API", "النشر"],
    status: "active",
    route: "/appforge-landing",
    parentPlatformId: "infera-webnova",
    aiCapabilities: { hasNovaIntegration: true, aiModelTypes: ["generation", "design"], governanceLevel: "partial" }
  },
  {
    id: "infera-cvbuilder",
    name: "INFERA CV Builder",
    nameAr: "منشئ السيرة الذاتية INFERA",
    shortCode: "CV",
    description: "AI-Powered Resume and CV Generation",
    descriptionAr: "توليد السيرة الذاتية بقوة الذكاء",
    tier: "standard",
    category: "hr-management",
    icon: "FileUser",
    colors: { primary: "#1E293B", secondary: "#14B8A6", accent: "#FFFFFF" },
    capabilities: ["CV Generation", "ATS Optimization", "Template Library", "Career Guidance"],
    capabilitiesAr: ["توليد السيرة", "تحسين ATS", "مكتبة القوالب", "الإرشاد المهني"],
    status: "active",
    route: "/cvbuilder-landing",
    parentPlatformId: "infera-humaniq",
    aiCapabilities: { hasNovaIntegration: true, aiModelTypes: ["generation", "optimization"], governanceLevel: "partial" }
  },
  {
    id: "infera-jobs",
    name: "INFERA Jobs",
    nameAr: "وظائف INFERA",
    shortCode: "JB",
    description: "Intelligent Job Matching Platform",
    descriptionAr: "منصة التوظيف الذكية",
    tier: "standard",
    category: "hr-management",
    icon: "Briefcase",
    colors: { primary: "#0F172A", secondary: "#22C55E", accent: "#FFFFFF" },
    capabilities: ["Job Matching", "Talent Acquisition", "Skill Assessment", "Interview Intelligence"],
    capabilitiesAr: ["مطابقة الوظائف", "استقطاب المواهب", "تقييم المهارات", "ذكاء المقابلات"],
    status: "active",
    route: "/jobs-landing",
    parentPlatformId: "infera-humaniq",
    aiCapabilities: { hasNovaIntegration: true, aiModelTypes: ["matching", "assessment"], governanceLevel: "partial" }
  },
  {
    id: "infera-feasibility",
    name: "INFERA Feasibility",
    nameAr: "دراسات الجدوى INFERA",
    shortCode: "FS",
    description: "AI-Powered Feasibility Studies",
    descriptionAr: "دراسات جدوى بقوة الذكاء",
    tier: "standard",
    category: "finance",
    icon: "BarChart3",
    colors: { primary: "#1F2937", secondary: "#F59E0B", accent: "#FFFFFF" },
    capabilities: ["Market Analysis", "Financial Modeling", "Risk Assessment", "Report Generation"],
    capabilitiesAr: ["تحليل السوق", "النمذجة المالية", "تقييم المخاطر", "توليد التقارير"],
    status: "active",
    route: "/feasibility-landing",
    parentPlatformId: "infera-finance-ai",
    aiCapabilities: { hasNovaIntegration: true, aiModelTypes: ["analysis", "prediction"], governanceLevel: "partial" }
  },
  
  // === MODULES ===
  {
    id: "smart-memory-ai",
    name: "SmartMemory AI",
    nameAr: "الذاكرة الذكية",
    shortCode: "SM",
    description: "A Memory That Never Forgets and Never Errs",
    descriptionAr: "ذاكرة لا تنسى ولا تخطئ",
    tier: "module",
    category: "intelligence",
    icon: "Database",
    colors: { primary: "#1F2937", secondary: "#10B981", accent: "#FFFFFF" },
    capabilities: ["Knowledge Storage", "Contextual Retrieval", "Learning Memory", "Decision History"],
    capabilitiesAr: ["تخزين المعرفة", "الاسترجاع السياقي", "ذاكرة التعلم", "سجل القرارات"],
    status: "active",
    parentPlatformId: "infera-engine",
    aiCapabilities: { hasNovaIntegration: true, aiModelTypes: ["memory", "retrieval"], governanceLevel: "none" }
  },
  {
    id: "nova-ai",
    name: "Nova AI",
    nameAr: "نوفا الذكاء",
    shortCode: "NV",
    description: "Sovereign Decision Governor - Not Just an Assistant",
    descriptionAr: "حاكم القرارات السيادي - ليس مجرد مساعد",
    tier: "module",
    category: "sovereignty",
    icon: "Brain",
    colors: { primary: "#0A0A0A", secondary: "#8B5CF6", accent: "#22D3EE" },
    capabilities: ["Decision Governance", "Policy Enforcement", "Human-in-the-Loop", "Audit Trails"],
    capabilitiesAr: ["حوكمة القرارات", "تطبيق السياسات", "الإنسان في الحلقة", "سجلات التدقيق"],
    status: "active",
    parentPlatformId: "infera-webnova",
    aiCapabilities: { hasNovaIntegration: true, aiModelTypes: ["decision", "governance", "analysis"], governanceLevel: "full" }
  }
];

// Get platforms by tier
export function getPlatformsByTier(tier: PlatformTier): InferaPlatform[] {
  return INFERA_PLATFORMS_REGISTRY.filter(p => p.tier === tier);
}

// Get platforms by category
export function getPlatformsByCategory(category: PlatformCategory): InferaPlatform[] {
  return INFERA_PLATFORMS_REGISTRY.filter(p => p.category === category);
}

// Get child platforms
export function getChildPlatforms(parentId: string): InferaPlatform[] {
  return INFERA_PLATFORMS_REGISTRY.filter(p => p.parentPlatformId === parentId);
}

// Get platform hierarchy
export function getPlatformHierarchy(): Map<string, InferaPlatform[]> {
  const hierarchy = new Map<string, InferaPlatform[]>();
  
  const rootPlatforms = INFERA_PLATFORMS_REGISTRY.filter(p => !p.parentPlatformId);
  hierarchy.set("root", rootPlatforms);
  
  rootPlatforms.forEach(root => {
    const children = getChildPlatforms(root.id);
    if (children.length > 0) {
      hierarchy.set(root.id, children);
    }
  });
  
  return hierarchy;
}

// Get all platforms with Nova integration
export function getNovaEnabledPlatforms(): InferaPlatform[] {
  return INFERA_PLATFORMS_REGISTRY.filter(p => p.aiCapabilities.hasNovaIntegration);
}

// Get platforms by governance level
export function getPlatformsByGovernance(level: "full" | "partial" | "none"): InferaPlatform[] {
  return INFERA_PLATFORMS_REGISTRY.filter(p => p.aiCapabilities.governanceLevel === level);
}
