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
