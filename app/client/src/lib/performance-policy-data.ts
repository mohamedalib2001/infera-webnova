// INFERA Platform Performance & Speed Mandatory Policy
// سياسة الأداء والسرعة الإلزامية لمنصات INFERA

export interface PerformancePolicySection {
  id: string;
  number: number;
  title: string;
  titleAr: string;
  content: string[];
  contentAr: string[];
}

export const performancePolicyIntro = {
  lastUpdated: "December 2024",
  lastUpdatedAr: "ديسمبر 2024",
  statement: "Performance and platform responsiveness are integral to digital sovereignty — not optional technical features or secondary enhancements.",
  statementAr: "تُعد سرعة الأداء واستجابة المنصات جزءًا لا يتجزأ من السيادة الرقمية وليست خيارًا تقنيًا أو تحسينًا إضافيًا.",
  warning: "A slow platform is a governance failure — regardless of how feature-rich it may be.",
  warningAr: "أي منصة بطيئة تُعد منصة فاشلة حوكميًا حتى لو كانت غنية بالميزات."
};

export const performancePolicySections: PerformancePolicySection[] = [
  {
    id: "scope",
    number: 1,
    title: "Mandatory Scope of Application",
    titleAr: "النطاق الإلزامي للتطبيق",
    content: [
      "This policy applies mandatorily to:",
      "All INFERA platforms without exception",
      "Frontend interfaces",
      "Backend systems",
      "APIs and integrations",
      "Control panels and dashboards",
      "Cloud services and infrastructure",
      "No component is exempt due to complexity, scale, or usage type."
    ],
    contentAr: [
      "تنطبق هذه السياسة إلزاميًا على:",
      "جميع منصات INFERA دون استثناء",
      "الواجهات الأمامية (Frontend)",
      "الأنظمة الخلفية (Backend)",
      "واجهات البرمجة (APIs)",
      "لوحات التحكم",
      "الخدمات السحابية والبنية التحتية",
      "ولا يُستثنى أي مكوّن بسبب التعقيد أو الحجم أو طبيعة الاستخدام."
    ]
  },
  {
    id: "standards",
    number: 2,
    title: "Non-Negotiable Performance Standards",
    titleAr: "معايير الأداء غير القابلة للتفاوض",
    content: [
      "All INFERA platforms must adhere to:",
      "Initial interface loading within benchmark time",
      "Instant interaction response with no noticeable delay",
      "No prolonged or frozen loading screens",
      "No slowdowns due to poor design",
      "No sacrifice of performance for features",
      "Any user experience that creates a sense of waiting is a direct violation of this policy."
    ],
    contentAr: [
      "تلتزم جميع منصات INFERA بما يلي:",
      "تحميل الواجهة الأولى خلال زمن قياسي",
      "استجابة فورية للتفاعل دون تأخير ملحوظ",
      "عدم وجود شاشات تحميل طويلة أو مجمدة",
      "عدم قبول أي بطء ناتج عن سوء التصميم",
      "عدم التضحية بالأداء مقابل الميزات",
      "أي تجربة استخدام تُشعر المستخدم بالانتظار تُعد مخالفة مباشرة لهذه السياسة."
    ]
  },
  {
    id: "prohibited",
    number: 3,
    title: "Explicit Prohibitions",
    titleAr: "الحظر الصريح",
    content: [
      "The following are strictly prohibited:",
      "Launching or publishing any slow platform",
      "Justifying slowness due to AI processing",
      "Justifying slowness due to security or governance",
      "Accepting degraded performance as a temporary phase",
      "Postponing performance optimization to later stages",
      "Slowness is forbidden. Waiting is forbidden. Delay is forbidden."
    ],
    contentAr: [
      "يُحظر حظرًا تامًا:",
      "إطلاق أو نشر أي منصة بطيئة",
      "تبرير البطء بسبب الذكاء الاصطناعي",
      "تبرير البطء بسبب الأمان أو الحوكمة",
      "قبول الأداء المتدني كمرحلة مؤقتة",
      "تأجيل تحسين الأداء إلى مراحل لاحقة",
      "البطء ممنوع. الانتظار ممنوع. التأخير ممنوع."
    ]
  },
  {
    id: "responsibility",
    number: 4,
    title: "Responsibility & Enforcement",
    titleAr: "المسؤولية والتنفيذ",
    content: [
      "Performance is a shared responsibility across design, engineering, and infrastructure.",
      "Shifting responsibility between teams is not accepted.",
      "Any component causing slowness must be redesigned or replaced immediately.",
      "Violation of this policy is a direct breach of the sovereign governance of the ecosystem."
    ],
    contentAr: [
      "الأداء مسؤولية مشتركة بين التصميم، والهندسة، والبنية التحتية.",
      "لا يُقبل نقل المسؤولية بين الفرق.",
      "أي مكوّن يسبب بطئًا يجب إعادة تصميمه أو استبداله فورًا.",
      "يُعد الإخلال بهذه السياسة إخلالًا مباشرًا بالحوكمة السيادية للمنظومة."
    ]
  },
  {
    id: "monitoring",
    number: 5,
    title: "Monitoring & Measurement",
    titleAr: "المراقبة والقياس",
    content: [
      "INFERA commits to:",
      "Continuous performance monitoring",
      "Real-time response time measurement",
      "Performance testing before, during, and after deployment",
      "Immediate shutdown of any component causing performance degradation",
      "Preventive disabling is permitted without prior notice to protect user experience and digital sovereignty."
    ],
    contentAr: [
      "تلتزم INFERA بـ:",
      "المراقبة المستمرة للأداء",
      "القياس اللحظي لزمن الاستجابة",
      "اختبار الأداء قبل وأثناء وبعد النشر",
      "إيقاف أي مكوّن يسبب تدهورًا في الأداء",
      "يُسمح بالتعطيل الوقائي دون إشعار مسبق لحماية تجربة الاستخدام والسيادة الرقمية."
    ]
  },
  {
    id: "enforcement",
    number: 6,
    title: "Enforcement & Penalties",
    titleAr: "الإنفاذ والعقوبات",
    content: [
      "Any violation of this policy may result in:",
      "Shutdown of the violating platform or component",
      "Blocking of publishing or expansion",
      "Mandatory technical restructuring",
      "Internal governance escalation",
      "No exceptions. No excuses. No flexibility on this clause."
    ],
    contentAr: [
      "أي مخالفة لهذه السياسة قد تؤدي إلى:",
      "إيقاف المنصة أو المكوّن المخالف",
      "منع النشر أو التوسّع",
      "إعادة الهيكلة التقنية الإلزامية",
      "تصعيد حوكمي داخلي",
      "لا توجد استثناءات. لا توجد أعذار. لا توجد مرونة في هذا البند."
    ]
  }
];

export const performancePolicyClosing = {
  statement: "INFERA is built to work instantly, respond instantly, and maintain control without waiting.",
  statementAr: "INFERA تُبنى لتعمل فورًا، وتستجيب فورًا، وتحافظ على السيطرة دون انتظار.",
  principle: "Speed is not an enhancement. Speed is a sovereign commitment.",
  principleAr: "السرعة ليست تحسينًا. السرعة التزام سيادي."
};

export const performancePolicyMeta = {
  title: "Performance Policy",
  titleAr: "سياسة الأداء",
  subtitle: "Platform Performance & Speed Mandatory Policy",
  subtitleAr: "سياسة الأداء والسرعة الإلزامية"
};

export const performancePolicyUsage = {
  title: "Policy Application",
  titleAr: "استخدام السياسة",
  items: [
    { text: "As a mandatory internal policy", textAr: "كـ Policy داخلية إلزامية" },
    { text: "As part of Governance Framework", textAr: "كجزء من Governance Framework" },
    { text: "As a legal and operational reference", textAr: "كمرجع قانوني وتشغيلي" },
    { text: "As a launch and publish requirement", textAr: "كشرط إطلاق ونشر" }
  ]
};
