// INFERA Privacy Policy - Sovereign Version
// سياسة الخصوصية - النسخة السيادية

export interface PrivacySection {
  id: string;
  number: number;
  title: string;
  titleAr: string;
  content: string[];
  contentAr: string[];
}

export const privacyIntro = {
  lastUpdated: "December 2024",
  lastUpdatedAr: "ديسمبر 2024",
  statement: "At INFERA, privacy is not a feature. It is a core principle of sovereignty, control, and trust.",
  statementAr: "في INFERA، الخصوصية ليست ميزة إضافية، بل مبدأ سيادي أساسي قائم على التحكم والثقة والحوكمة.",
  description: "This Privacy Policy explains how INFERA collects, uses, protects, and governs data across its sovereign AI platforms.",
  descriptionAr: "توضح هذه السياسة كيفية جمع البيانات واستخدامها وحمايتها وإدارتها عبر جميع منصات INFERA المدعومة بالذكاء الاصطناعي."
};

export const privacySections: PrivacySection[] = [
  {
    id: "sovereignty",
    number: 1,
    title: "Data Sovereignty Principle",
    titleAr: "مبدأ سيادة البيانات",
    content: [
      "INFERA is built on the principle that data ownership remains with the user, organization, or sovereign authority.",
      "INFERA does NOT: Sell personal data, Monetize data through third parties, Use data for advertising purposes.",
      "All data processing is purpose-bound and governance-controlled."
    ],
    contentAr: [
      "تُبنى INFERA على مبدأ أن ملكية البيانات تعود إلى المستخدم أو المؤسسة أو الجهة السيادية المعنية.",
      "لا تقوم INFERA بما يلي: بيع البيانات الشخصية، المتاجرة بالبيانات مع أطراف ثالثة، استخدام البيانات لأغراض إعلانية.",
      "تتم جميع عمليات معالجة البيانات ضمن أغراض محددة وتحت أطر حوكمة صارمة."
    ]
  },
  {
    id: "collection",
    number: 2,
    title: "Data We Collect",
    titleAr: "أنواع البيانات التي نجمعها",
    content: [
      "Depending on access level and platform usage, INFERA may collect: Identity and access information, System usage and interaction data, Operational and configuration data, Security and audit logs, AI training metadata (non-identifiable by default).",
      "Data collection is always: Minimal, Contextual, Necessary for system operation."
    ],
    contentAr: [
      "بحسب مستوى الوصول واستخدام المنصة، قد تقوم INFERA بجمع: بيانات الهوية والتحقق والصلاحيات، بيانات الاستخدام والتفاعل مع النظام، بيانات تشغيلية وإعدادات المنصة، سجلات الأمان والتدقيق، بيانات وصفية لتدريب الذكاء الاصطناعي (غير مُعرِّفة بالهوية افتراضيًا).",
      "يتم جمع البيانات دائمًا بشكل: محدود، مرتبط بالغرض، ضروري لتشغيل النظام."
    ]
  },
  {
    id: "usage",
    number: 3,
    title: "How Data Is Used",
    titleAr: "كيفية استخدام البيانات",
    content: [
      "Data is used exclusively to: Operate and secure the platform, Enforce governance and policies, Improve system intelligence, Generate analytics and insights, Maintain auditability and compliance.",
      "AI systems operate within strict policy boundaries and do not act outside authorized scopes."
    ],
    contentAr: [
      "تُستخدم البيانات حصريًا من أجل: تشغيل المنصات وتأمينها، فرض السياسات والحوكمة، تحسين الذكاء والتحليلات، توليد التقارير والرؤى، ضمان التتبع والتدقيق والامتثال.",
      "تعمل أنظمة الذكاء الاصطناعي ضمن حدود سياسات معتمدة ولا تتجاوز الصلاحيات الممنوحة."
    ]
  },
  {
    id: "security",
    number: 4,
    title: "Data Security & Protection",
    titleAr: "حماية البيانات وأمنها",
    content: [
      "INFERA applies sovereign-grade security measures, including: End-to-end encryption, Zero-Trust architecture, Continuous monitoring, Automated threat detection, Access-based data segmentation.",
      "All data access is logged, auditable, and subject to governance review."
    ],
    contentAr: [
      "تطبّق INFERA إجراءات أمان سيادية تشمل: تشفير شامل للبيانات، بنية عدم الثقة (Zero-Trust)، مراقبة مستمرة، كشف تهديدات تلقائي، تقسيم البيانات حسب الصلاحيات.",
      "يتم تسجيل جميع عمليات الوصول وهي قابلة للتدقيق والمراجعة الحوكمية."
    ]
  },
  {
    id: "residency",
    number: 5,
    title: "Data Residency & Localization",
    titleAr: "توطين البيانات ونطاقها الجغرافي",
    content: [
      "Where required, INFERA supports: Data residency controls, Local or national data storage, Jurisdiction-specific governance rules.",
      "INFERA does not transfer data across borders without authorization."
    ],
    contentAr: [
      "عند الاقتضاء، تدعم INFERA: توطين البيانات محليًا أو وطنيًا، تخزين البيانات ضمن نطاقات محددة، تطبيق قواعد اختصاص قضائي مخصصة.",
      "ولا يتم نقل البيانات عبر الحدود دون تفويض صريح ومُوثّق."
    ]
  },
  {
    id: "sharing",
    number: 6,
    title: "Data Sharing",
    titleAr: "مشاركة البيانات",
    content: [
      "INFERA does NOT share data with third parties except when: Explicitly authorized by the user or authority, Required by applicable law, Necessary to protect system integrity.",
      "Any authorized sharing is logged and governed."
    ],
    contentAr: [
      "لا تشارك INFERA البيانات مع أطراف ثالثة إلا في الحالات التالية: وجود تفويض صريح من الجهة المالكة للبيانات، الالتزام بمتطلبات قانونية ملزمة، حماية سلامة النظام أو الأمن العام.",
      "تخضع أي مشاركة مصرح بها للتسجيل والحوكمة الكاملة."
    ]
  },
  {
    id: "rights",
    number: 7,
    title: "User Rights & Control",
    titleAr: "حقوق المستخدم والتحكم",
    content: [
      "Depending on jurisdiction and governance model, users or authorities may have the right to: Access their data, Correct inaccuracies, Request deletion or restriction, Review access logs.",
      "All requests are subject to security and governance validation."
    ],
    contentAr: [
      "وفقًا للاختصاص القضائي ونموذج الحوكمة، قد يحق للمستخدم أو الجهة المعنية: الوصول إلى بياناته، تصحيح الأخطاء، طلب التقييد أو الحذف، مراجعة سجلات الوصول.",
      "تخضع جميع الطلبات للتحقق الأمني والحوكمة المعتمدة."
    ]
  },
  {
    id: "ai-usage",
    number: 8,
    title: "AI & Data Usage",
    titleAr: "استخدام البيانات في الذكاء الاصطناعي",
    content: [
      "AI models may analyze data to provide intelligence and automation.",
      "AI systems: Do not make sovereign decisions, Do not override human authority, Operate under Policy Validator AI enforcement."
    ],
    contentAr: [
      "قد تقوم أنظمة الذكاء الاصطناعي بتحليل البيانات لتقديم دعم القرار والأتمتة.",
      "وتلتزم هذه الأنظمة بما يلي: عدم اتخاذ قرارات سيادية، عدم تجاوز السلطة البشرية، الالتزام الصارم بسياسات الحوكمة."
    ]
  },
  {
    id: "retention",
    number: 9,
    title: "Data Retention",
    titleAr: "الاحتفاظ بالبيانات",
    content: [
      "Data is retained only for: Operational necessity, Legal or regulatory requirements, Governance and audit purposes.",
      "Retention policies are configurable based on organizational or sovereign requirements."
    ],
    contentAr: [
      "يتم الاحتفاظ بالبيانات فقط للمدة اللازمة من أجل: التشغيل، المتطلبات القانونية والتنظيمية، أغراض التدقيق والحوكمة.",
      "تُعد سياسات الاحتفاظ قابلة للتخصيص وفق متطلبات الجهات السيادية أو المؤسسية."
    ]
  },
  {
    id: "updates",
    number: 10,
    title: "Policy Updates",
    titleAr: "تحديثات السياسة",
    content: [
      "This Privacy Policy may be updated to reflect system evolution or regulatory changes.",
      "Continued use of INFERA constitutes acceptance of updates."
    ],
    contentAr: [
      "يجوز لـ INFERA تحديث هذه السياسة لمواكبة التطورات التقنية أو التنظيمية.",
      "ويُعد الاستمرار في استخدام المنصات موافقة صريحة على التحديثات."
    ]
  },
  {
    id: "contact",
    number: 11,
    title: "Contact",
    titleAr: "التواصل",
    content: [
      "For privacy-related inquiries or requests: privacy@infera.com"
    ],
    contentAr: [
      "للاستفسارات أو الطلبات المتعلقة بالخصوصية: privacy@infera.com"
    ]
  }
];

export const privacyClosing = {
  statement: "INFERA protects privacy by design, by governance, and by sovereign control.",
  statementAr: "تحمي INFERA الخصوصية بالتصميم، وبالحوكمة، وبالسيادة الرقمية."
};

export const privacyMeta = {
  title: "Privacy Policy",
  titleAr: "سياسة الخصوصية",
  subtitle: "Sovereign Privacy",
  subtitleAr: "خصوصية سيادية"
};
