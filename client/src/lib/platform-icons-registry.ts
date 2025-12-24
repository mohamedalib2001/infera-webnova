// INFERA Platform Icons Registry
// سجل أيقونات منصات INFERA

export interface PlatformIconConfig {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  symbol: string[];
  symbolAr: string[];
  meaning: string;
  meaningAr: string;
  iconPath: string;
  variants: {
    appIcon: string;
    favicon: string;
    monochrome: string;
    light: string;
    dark: string;
  };
  usageContexts: string[];
}

export const platformIconsRegistry: PlatformIconConfig[] = [
  {
    id: "infera-engine-control",
    name: "INFERA Engine Control™",
    nameAr: "محرك التحكم INFERA",
    category: "sovereignty",
    colors: {
      primary: "#0A0A0A", // Black Obsidian
      secondary: "#1C1C1C", // Dark Silver
      accent: "#00D4FF"    // Electric Cyan
    },
    symbol: ["Central Control Core", "Shielded Brain", "Control Glyph"],
    symbolAr: ["نواة تحكم مركزية", "عقل محمي", "رمز التحكم"],
    meaning: "The mind that controls everything",
    meaningAr: "العقل الذي يتحكم في كل شيء",
    iconPath: "/assets/icons/infera-engine-control/",
    variants: {
      appIcon: "app-icon-1024.png",
      favicon: "favicon-32.png",
      monochrome: "mono.svg",
      light: "light-bg.png",
      dark: "dark-bg.png"
    },
    usageContexts: ["web", "mobile", "desktop", "favicon", "store-listings"]
  },
  {
    id: "infera-engine",
    name: "INFERA Engine™",
    nameAr: "محرك INFERA",
    category: "intelligence",
    colors: {
      primary: "#0A1628", // Deep Blue
      secondary: "#6B21A8", // Neural Purple
      accent: "#FFFFFF"    // Soft White
    },
    symbol: ["Neural Core", "Interconnected Rings", "Intelligence Sphere"],
    symbolAr: ["نواة عصبية", "حلقات مترابطة", "كرة الذكاء"],
    meaning: "The beating heart of the ecosystem",
    meaningAr: "القلب النابض للمنظومة",
    iconPath: "/assets/icons/infera-engine/",
    variants: {
      appIcon: "app-icon-1024.png",
      favicon: "favicon-32.png",
      monochrome: "mono.svg",
      light: "light-bg.png",
      dark: "dark-bg.png"
    },
    usageContexts: ["web", "mobile", "desktop", "favicon", "store-listings"]
  },
  {
    id: "smart-memory-ai",
    name: "SmartMemoryAI™",
    nameAr: "الذاكرة الذكية",
    category: "memory",
    colors: {
      primary: "#1F2937", // Dark Gray
      secondary: "#10B981", // Emerald Green
      accent: "#FFFFFF"    // White lines
    },
    symbol: ["Memory Vault", "Digital Archive Cube", "Layered Data Blocks"],
    symbolAr: ["خزنة الذاكرة", "مكعب الأرشيف الرقمي", "كتل بيانات طبقية"],
    meaning: "A memory that never forgets and never errs",
    meaningAr: "ذاكرة لا تنسى ولا تخطئ",
    iconPath: "/assets/icons/smart-memory-ai/",
    variants: {
      appIcon: "app-icon-1024.png",
      favicon: "favicon-32.png",
      monochrome: "mono.svg",
      light: "light-bg.png",
      dark: "dark-bg.png"
    },
    usageContexts: ["web", "mobile", "desktop", "favicon", "store-listings"]
  },
  {
    id: "infera-humaniq",
    name: "INFERA HumanIQ™",
    nameAr: "العقل المؤسسي INFERA",
    category: "hr-intelligence",
    colors: {
      primary: "#1E40AF", // Royal Blue
      secondary: "#4B5563", // Graphite Gray
      accent: "#D4AF37"    // Soft Gold
    },
    symbol: ["Human Silhouette Abstracted into Neural Lines", "Balanced Nodes", "Authority without softness"],
    symbolAr: ["شكل بشري مجرد بخطوط عصبية", "عقد متوازنة", "سلطة بدون ليونة"],
    meaning: "Intelligence that manages humans without eliminating their humanity",
    meaningAr: "ذكاء يدير البشر بدون أن يُلغي إنسانيتهم",
    iconPath: "/assets/icons/infera-humaniq/",
    variants: {
      appIcon: "app-icon.png",
      favicon: "favicon-32.png",
      monochrome: "mono-icon.svg",
      light: "light-bg.png",
      dark: "dark-bg.png"
    },
    usageContexts: ["web", "mobile", "desktop", "favicon", "store-listings"]
  },
  {
    id: "infera-legal-ai",
    name: "INFERA Legal AI™",
    nameAr: "الذكاء القانوني INFERA",
    category: "legal-compliance",
    colors: {
      primary: "#7C2D12", // Deep Burgundy
      secondary: "#1F2937", // Charcoal Black
      accent: "#C0C0C0"    // Silver
    },
    symbol: ["Abstract Scale of Justice", "Contract Nodes", "Legal Grid / Clause Matrix"],
    symbolAr: ["ميزان عدالة مجرد", "عقد تعاقدية", "شبكة قانونية / مصفوفة بنود"],
    meaning: "Law that never sleeps and never errs",
    meaningAr: "قانون لا ينام ولا يخطئ",
    iconPath: "/assets/icons/infera-legal-ai/",
    variants: {
      appIcon: "app-icon.png",
      favicon: "favicon-32.png",
      monochrome: "mono-icon.svg",
      light: "light-bg.png",
      dark: "dark-bg.png"
    },
    usageContexts: ["web", "mobile", "desktop", "favicon", "store-listings"]
  },
  {
    id: "infera-marketing-ai",
    name: "INFERA Marketing AI™",
    nameAr: "الذكاء التسويقي INFERA",
    category: "marketing-intelligence",
    colors: {
      primary: "#374151", // Dark Graphite
      secondary: "#EC4899", // Neon Magenta
      accent: "#F9FAFB"    // Soft White
    },
    symbol: ["Predictive Signal Waves", "Abstract Growth Vector", "Data Pulse"],
    symbolAr: ["موجات إشارة تنبؤية", "متجه نمو مجرد", "نبض البيانات"],
    meaning: "Intelligence that sees the market before it moves",
    meaningAr: "ذكاء يرى السوق قبل أن يتحرك",
    iconPath: "/assets/icons/infera-marketing-ai/",
    variants: {
      appIcon: "app-icon.png",
      favicon: "favicon-32.png",
      monochrome: "mono-icon.svg",
      light: "light-bg.png",
      dark: "dark-bg.png"
    },
    usageContexts: ["web", "mobile", "desktop", "favicon", "store-listings"]
  },
  {
    id: "infera-marketplace-ai",
    name: "INFERA Marketplace AI™",
    nameAr: "السوق الذكي INFERA",
    category: "commerce-intelligence",
    colors: {
      primary: "#0F0F0F", // Deep Black
      secondary: "#047857", // Emerald Teal
      accent: "#C0C0C0"    // Silver
    },
    symbol: ["Intelligent Commerce Grid", "Product Nodes Connected by AI", "Abstract Market Network"],
    symbolAr: ["شبكة تجارة ذكية", "عقد منتجات متصلة بالذكاء", "شبكة سوق مجردة"],
    meaning: "A market that understands before it suggests",
    meaningAr: "سوق يفهم قبل أن يُقترح",
    iconPath: "/assets/icons/infera-marketplace-ai/",
    variants: {
      appIcon: "app-icon.png",
      favicon: "favicon-32.png",
      monochrome: "mono-icon.svg",
      light: "light-bg.png",
      dark: "dark-bg.png"
    },
    usageContexts: ["web", "mobile", "desktop", "favicon", "store-listings"]
  },
  {
    id: "infera-ai-education-hub",
    name: "INFERA AI Education Hub™",
    nameAr: "مركز التعليم الذكي INFERA",
    category: "education-intelligence",
    colors: {
      primary: "#312E81", // Deep Indigo
      secondary: "#22D3EE", // Soft Cyan
      accent: "#FFFFFF"    // White
    },
    symbol: ["Knowledge Core", "Adaptive Learning Layers", "Abstract Open Structure"],
    symbolAr: ["نواة المعرفة", "طبقات تعلم تكيفية", "هيكل مفتوح مجرد"],
    meaning: "Education that adapts to the mind",
    meaningAr: "تعليم يتكيّف مع العقل",
    iconPath: "/assets/icons/infera-ai-education-hub/",
    variants: {
      appIcon: "app-icon.png",
      favicon: "favicon-32.png",
      monochrome: "mono-icon.svg",
      light: "light-bg.png",
      dark: "dark-bg.png"
    },
    usageContexts: ["web", "mobile", "desktop", "favicon", "store-listings"]
  },
  {
    id: "infera-attend-ai",
    name: "INFERA Attend AI™",
    nameAr: "الحضور الذكي INFERA",
    category: "operations-intelligence",
    colors: {
      primary: "#334155", // Dark Slate Gray
      secondary: "#FACC15", // Signal Yellow
      accent: "#FFFFFF"    // White
    },
    symbol: ["Time Node", "Location Pulse", "Controlled Signal Ring"],
    symbolAr: ["عقدة زمنية", "نبض الموقع", "حلقة إشارة مُحكمة"],
    meaning: "Time managed intelligently, without argument",
    meaningAr: "الوقت مُدار بذكاء، بلا جدل",
    iconPath: "/assets/icons/infera-attend-ai/",
    variants: {
      appIcon: "app-icon.png",
      favicon: "favicon-32.png",
      monochrome: "mono-icon.svg",
      light: "light-bg.png",
      dark: "dark-bg.png"
    },
    usageContexts: ["web", "mobile", "desktop", "favicon", "store-listings"]
  },
  {
    id: "infera-train-ai",
    name: "INFERA TrainAI™",
    nameAr: "التدريب الذكي INFERA",
    category: "training-intelligence",
    colors: {
      primary: "#374151", // Dark Graphite
      secondary: "#0D9488", // Deep Teal
      accent: "#F9FAFB"    // Soft White
    },
    symbol: ["Capability Core", "Progressive Learning Rings", "Structured Growth Layers"],
    symbolAr: ["نواة القدرة", "حلقات تعلم تقدمية", "طبقات نمو منظمة"],
    meaning: "Training that builds capability, not certificates",
    meaningAr: "تدريب يصنع القدرة لا الشهادة",
    iconPath: "/assets/icons/infera-train-ai/",
    variants: {
      appIcon: "app-icon.png",
      favicon: "favicon-32.png",
      monochrome: "mono-icon.svg",
      light: "light-bg.png",
      dark: "dark-bg.png"
    },
    usageContexts: ["web", "mobile", "desktop", "favicon", "store-listings"]
  },
  {
    id: "infera-hospitality-ai",
    name: "INFERA Hospitality AI™",
    nameAr: "ضيافة INFERA الذكية",
    category: "hospitality-intelligence",
    colors: {
      primary: "#1E3A5F", // Deep Navy
      secondary: "#D4AF37", // Warm Gold
      accent: "#F9FAFB"    // Soft White
    },
    symbol: ["Experience Core", "Service Flow Lines", "Abstract Welcome Node"],
    symbolAr: ["نواة التجربة", "خطوط تدفق الخدمة", "عقدة ترحيب مجردة"],
    meaning: "Service that senses before being requested",
    meaningAr: "خدمة تشعر قبل أن تُطلب",
    iconPath: "/assets/icons/infera-hospitality-ai/",
    variants: {
      appIcon: "app-icon.png",
      favicon: "favicon-32.png",
      monochrome: "mono-icon.svg",
      light: "light-bg.png",
      dark: "dark-bg.png"
    },
    usageContexts: ["web", "mobile", "desktop", "favicon", "store-listings"]
  },
  {
    id: "infera-vision-feasibility",
    name: "INFERA VisionFeasibility™",
    nameAr: "رؤية الجدوى INFERA",
    category: "strategy-intelligence",
    colors: {
      primary: "#1E3A5F", // Midnight Blue
      secondary: "#047857", // Deep Emerald
      accent: "#C0C0C0"    // Silver
    },
    symbol: ["Strategic Vision Core", "Multi-Layer Projection", "Abstract Future Lens"],
    symbolAr: ["نواة الرؤية الاستراتيجية", "إسقاط متعدد الطبقات", "عدسة مستقبلية مجردة"],
    meaning: "Vision that sees beyond the numbers",
    meaningAr: "رؤية ترى ما قبل الأرقام",
    iconPath: "/assets/icons/infera-vision-feasibility/",
    variants: {
      appIcon: "app-icon.png",
      favicon: "favicon-32.png",
      monochrome: "mono-icon.svg",
      light: "light-bg.png",
      dark: "dark-bg.png"
    },
    usageContexts: ["web", "mobile", "desktop", "favicon", "store-listings"]
  },
  {
    id: "infera-cv-builder",
    name: "INFERA CV Builder™",
    nameAr: "منشئ السيرة الذاتية INFERA",
    category: "identity-intelligence",
    colors: {
      primary: "#6B7280", // Soft Gray
      secondary: "#1E40AF", // Royal Blue
      accent: "#FFFFFF"    // Clean White
    },
    symbol: ["Profile Card Abstract", "Structured Identity Layers", "Smart Presentation Frame"],
    symbolAr: ["بطاقة ملف تعريف مجردة", "طبقات هوية منظمة", "إطار عرض ذكي"],
    meaning: "A CV that presents itself intelligently",
    meaningAr: "سيرة تُقدّم نفسها بذكاء",
    iconPath: "/assets/icons/infera-cv-builder/",
    variants: {
      appIcon: "app-icon.png",
      favicon: "favicon-32.png",
      monochrome: "mono-icon.svg",
      light: "light-bg.png",
      dark: "dark-bg.png"
    },
    usageContexts: ["web", "mobile", "desktop", "favicon", "store-listings"]
  },
  {
    id: "infera-jobs-ai",
    name: "INFERA Jobs AI™",
    nameAr: "التوظيف الذكي INFERA",
    category: "recruitment-intelligence",
    colors: {
      primary: "#36454F", // Charcoal
      secondary: "#0891B2", // Deep Cyan
      accent: "#FFFFFF"    // White
    },
    symbol: ["Matching Nodes", "Talent Intelligence Grid", "Decision Alignment Symbol"],
    symbolAr: ["عقد المطابقة", "شبكة ذكاء المواهب", "رمز محاذاة القرار"],
    meaning: "The right job... without guessing",
    meaningAr: "الوظيفة المناسبة… بلا تخمين",
    iconPath: "/assets/icons/infera-jobs-ai/",
    variants: {
      appIcon: "app-icon.png",
      favicon: "favicon-32.png",
      monochrome: "mono-icon.svg",
      light: "light-bg.png",
      dark: "dark-bg.png"
    },
    usageContexts: ["web", "mobile", "desktop", "favicon", "store-listings"]
  },
  {
    id: "infera-sovereign-finance-ai",
    name: "INFERA Sovereign Finance AI™",
    nameAr: "المالية السيادية INFERA",
    category: "finance-intelligence",
    colors: {
      primary: "#000000", // Black Base
      secondary: "#065F46", // Dark Emerald
      accent: "#D4AF37"    // Gold
    },
    symbol: ["Financial Control Core", "Secure Value Nodes", "Sovereign Ledger Symbol"],
    symbolAr: ["نواة التحكم المالي", "عقد القيمة الآمنة", "رمز دفتر السيادة"],
    meaning: "Money under control, not under prediction",
    meaningAr: "مال تحت السيطرة لا تحت التوقع",
    iconPath: "/assets/icons/infera-sovereign-finance-ai/",
    variants: {
      appIcon: "app-icon.png",
      favicon: "favicon-32.png",
      monochrome: "mono-icon.svg",
      light: "light-bg.png",
      dark: "dark-bg.png"
    },
    usageContexts: ["web", "mobile", "desktop", "favicon", "store-listings"]
  }
];

export const iconArchiveRules = {
  title: "Dynamic Archive Rules (Mandatory)",
  titleAr: "قواعد الأرشفة الديناميكية (إلزامي)",
  basePath: "/assets/icons/{platform-slug}/",
  requiredFiles: [
    { filename: "app-icon.png", description: "Main app icon (1024x1024)", descriptionAr: "أيقونة التطبيق الرئيسية" },
    { filename: "favicon-32.png", description: "Favicon 32x32", descriptionAr: "أيقونة المتصفح 32×32" },
    { filename: "favicon-16.png", description: "Favicon 16x16", descriptionAr: "أيقونة المتصفح 16×16" },
    { filename: "tab-icon.svg", description: "Tab/browser icon SVG", descriptionAr: "أيقونة التبويب SVG" },
    { filename: "mono-icon.svg", description: "Monochrome version SVG", descriptionAr: "النسخة أحادية اللون SVG" }
  ],
  autoLinkOnCreation: true,
  rules: [
    { rule: "Store each platform icon set under /assets/icons/{platform-slug}/", ruleAr: "تخزين كل مجموعة أيقونات تحت /assets/icons/{platform-slug}/" },
    { rule: "Auto-link icons on platform creation", ruleAr: "ربط الأيقونات تلقائياً عند إنشاء المنصة" },
    { rule: "All required files must be present before publish", ruleAr: "جميع الملفات المطلوبة يجب أن تكون موجودة قبل النشر" }
  ]
};

export const iconUsageInstructions = {
  title: "Icon Usage Instructions",
  titleAr: "تعليمات استخدام الأيقونات",
  rules: [
    {
      rule: "Each icon prompt stored as JSON object",
      ruleAr: "كل بروبت أيقونة مخزن ككائن JSON"
    },
    {
      rule: "Linked to platform ID",
      ruleAr: "مرتبط بمعرف المنصة"
    },
    {
      rule: "Auto-generated on platform creation",
      ruleAr: "يُولد تلقائياً عند إنشاء المنصة"
    },
    {
      rule: "Archived under /assets/icons/{platform-name}/",
      ruleAr: "يُؤرشف تحت /assets/icons/{platform-name}/"
    }
  ],
  usageContexts: [
    { context: "Web", contextAr: "الويب" },
    { context: "Mobile", contextAr: "الجوال" },
    { context: "Desktop", contextAr: "سطح المكتب" },
    { context: "Favicon", contextAr: "أيقونة المتصفح" },
    { context: "Store Listings", contextAr: "قوائم المتاجر" }
  ]
};

export const iconGenerationRules = {
  style: {
    required: ["Sovereign", "Futuristic", "Minimal", "Timeless"],
    requiredAr: ["سيادي", "مستقبلي", "بسيط", "خالد"],
    forbidden: ["Cartoon", "Playful", "Over-detailed", "Trendy"],
    forbiddenAr: ["كرتوني", "مرح", "مفرط التفاصيل", "موضة مؤقتة"]
  },
  technical: {
    minSize: "16x16",
    maxSize: "1024x1024",
    formats: ["PNG", "SVG", "ICO"],
    colorMode: "RGB"
  },
  constraints: {
    noText: true,
    noFaces: true,
    noGloss: true,
    subtleGradients: true,
    darkTechOnly: true
  }
};

export function getIconByPlatformId(platformId: string): PlatformIconConfig | undefined {
  return platformIconsRegistry.find(icon => icon.id === platformId);
}

export function getIconsByCategory(category: string): PlatformIconConfig[] {
  return platformIconsRegistry.filter(icon => icon.category === category);
}
