// INFERA Multi-App Generation & Real-Time Sync Mandatory Policy
// سياسة الإنشاء الإلزامي لتطبيقات المنصات متعددة الأجهزة

export interface MultiAppPolicySection {
  id: string;
  number: number;
  title: string;
  titleAr: string;
  content: string[];
  contentAr: string[];
}

export const multiAppPolicyIntro = {
  lastUpdated: "December 2024",
  lastUpdatedAr: "ديسمبر 2024",
  statement: "Digital applications (mobile, desktop, tablets) are a direct extension of sovereign platforms — not secondary or optional products.",
  statementAr: "تُعد التطبيقات الرقمية (الجوال، سطح المكتب، الأجهزة اللوحية) امتدادًا مباشرًا للمنصات السيادية، وليست منتجات ثانوية أو اختيارية.",
  warning: "Any platform created within the INFERA ecosystem and published without fully integrated official applications is considered governance-incomplete and in violation of mandatory INFERA standards.",
  warningAr: "أي منصة يتم إنشاؤها داخل منظومة INFERA ويتم نشرها دون تطبيقات رسمية متكاملة تُعد منصة غير مكتملة حوكميًا ومخالفة لمعايير INFERA الإلزامية."
};

export const multiAppPolicySections: MultiAppPolicySection[] = [
  {
    id: "scope",
    number: 1,
    title: "Mandatory Application Scope",
    titleAr: "نطاق التطبيق الإلزامي",
    content: [
      "This policy applies mandatorily to:",
      "All INFERA group platforms without exception",
      "Any current or future platform",
      "Any module, service, or system being published",
      "Any operating environment (production / testing / sovereign)",
      "No exceptions are permitted due to time, cost, or complexity."
    ],
    contentAr: [
      "تنطبق هذه السياسة إلزاميًا على:",
      "جميع منصات مجموعة INFERA دون استثناء",
      "أي منصة حالية أو مستقبلية",
      "أي وحدة، خدمة، أو نظام يتم نشره",
      "أي بيئة تشغيل (إنتاج / تجريب / سيادية)",
      "ولا يُسمح بأي استثناء بسبب الوقت أو التكلفة أو التعقيد."
    ]
  },
  {
    id: "auto-generation",
    number: 2,
    title: "Mandatory Automatic App Generation",
    titleAr: "الإنشاء التلقائي الإلزامي للتطبيقات",
    content: [
      "The system commits to the following when creating any new platform:",
      "Generate official mobile app (iOS / Android)",
      "Generate official desktop app (Windows / macOS / Linux)",
      "Generate tablet app (Tablets / iPads)",
      "Make apps available for direct download from within the platform",
      "Link apps to the platform without any manual setup",
      "This generation is: Automatic, Immediate, Part of the core publishing process."
    ],
    contentAr: [
      "يلتزم النظام عند إنشاء أي منصة جديدة بما يلي:",
      "إنشاء تطبيق جوال رسمي (iOS / Android)",
      "إنشاء تطبيق سطح مكتب رسمي (Windows / macOS / Linux)",
      "إنشاء تطبيق للأجهزة اللوحية (Tablets / iPads)",
      "إتاحة التطبيقات للتنزيل المباشر من داخل المنصة",
      "ربط التطبيقات بالمنصة دون أي إعداد يدوي",
      "يُعد هذا الإنشاء: تلقائيًا، فوريًا، جزءًا من عملية النشر الأساسية."
    ]
  },
  {
    id: "sync",
    number: 3,
    title: "Complete Real-Time Synchronization",
    titleAr: "التزامن اللحظي الكامل",
    content: [
      "All applications must adhere to:",
      "Real-Time Sync with the platform",
      "Complete matching in: Data, Services, Permissions, Settings",
      "No functional difference between the platform and applications",
      "Any delay or lack of synchronization is considered a serious governance violation."
    ],
    contentAr: [
      "تلتزم جميع التطبيقات بما يلي:",
      "تزامن لحظي (Real-Time Sync) مع المنصة",
      "تطابق كامل في: البيانات، الخدمات، الصلاحيات، الإعدادات",
      "عدم وجود أي فرق وظيفي بين المنصة والتطبيقات",
      "أي تأخير أو عدم تزامن يُعد خللًا حوكميًا جسيمًا."
    ]
  },
  {
    id: "standards",
    number: 4,
    title: "Global App Development Standards",
    titleAr: "المعايير العالمية لصناعة التطبيقات",
    content: [
      "All applications must comply with:",
      "Highest global UX/UI standards",
      "Instant performance and high responsiveness",
      "Operational stability without crashes",
      "First-class sovereign security",
      "Offline support when applicable",
      "Seamless updates without user disruption"
    ],
    contentAr: [
      "يجب أن تلتزم جميع التطبيقات بما يلي:",
      "أعلى معايير UX / UI العالمية",
      "أداء فوري واستجابة عالية",
      "استقرار تشغيلي دون أعطال",
      "أمان سيادي من الدرجة الأولى",
      "دعم العمل دون اتصال عند الاقتضاء",
      "تحديثات سلسة دون تعطيل المستخدم"
    ]
  },
  {
    id: "prohibited",
    number: 5,
    title: "Prohibited Practices",
    titleAr: "الممارسات المحظورة",
    content: [
      "The following are strictly prohibited:",
      "Primitive applications",
      "Low-quality hybrid applications",
      "Applications incompatible with app stores",
      "Any solution below global standards",
      "Apps without proper identity alignment",
      "Disconnected or delayed sync implementations"
    ],
    contentAr: [
      "يُحظر حظرًا تامًا:",
      "التطبيقات البدائية",
      "التطبيقات الهجينة منخفضة الجودة",
      "التطبيقات غير المتوافقة مع متاجر التطبيقات",
      "أي حل يقل عن المعايير العالمية",
      "التطبيقات بدون هوية موحدة",
      "التطبيقات بتزامن متأخر أو منفصل"
    ]
  },
  {
    id: "identity",
    number: 6,
    title: "Unified Identity & Experience",
    titleAr: "الهوية والتجربة الموحدة",
    content: [
      "Applications must reflect:",
      "The platform's visual identity",
      "Unified user experience",
      "Professional design language",
      "Intelligent device-adaptive behavior",
      "Consistent branding across all touchpoints",
      "Sovereign-grade presentation quality"
    ],
    contentAr: [
      "يجب أن تعكس التطبيقات:",
      "الهوية البصرية للمنصة",
      "تجربة استخدام موحدة",
      "لغة تصميم احترافية",
      "سلوك ذكي متكيّف مع الجهاز",
      "علامة تجارية متسقة عبر جميع نقاط الاتصال",
      "جودة عرض بمستوى سيادي"
    ]
  }
];

export const multiAppPolicyClosing = {
  statement: "Every INFERA platform launches complete — with synchronized apps across all devices, automatically and instantly.",
  statementAr: "كل منصة في INFERA تُطلق مكتملة — مع تطبيقات متزامنة عبر جميع الأجهزة، تلقائيًا وفوريًا.",
  principle: "Apps are not add-ons. Apps are sovereign extensions.",
  principleAr: "التطبيقات ليست إضافات. التطبيقات امتدادات سيادية."
};

export const multiAppPolicyMeta = {
  title: "Multi-App Policy",
  titleAr: "سياسة التطبيقات المتعددة",
  subtitle: "Mandatory Multi-App Generation & Real-Time Sync",
  subtitleAr: "سياسة الإنشاء الإلزامي للتطبيقات المتزامنة"
};

export const multiAppPlatformTypes = {
  title: "Supported Platforms",
  titleAr: "المنصات المدعومة",
  platforms: [
    { name: "iOS", nameAr: "iOS", icon: "smartphone" },
    { name: "Android", nameAr: "Android", icon: "smartphone" },
    { name: "Windows", nameAr: "Windows", icon: "monitor" },
    { name: "macOS", nameAr: "macOS", icon: "monitor" },
    { name: "Linux", nameAr: "Linux", icon: "monitor" },
    { name: "Tablets", nameAr: "الأجهزة اللوحية", icon: "tablet" },
    { name: "iPads", nameAr: "iPads", icon: "tablet" }
  ]
};
