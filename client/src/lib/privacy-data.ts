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
  statementAr: "في INFERA، الخصوصية ليست ميزة. إنها مبدأ أساسي للسيادة والتحكم والثقة.",
  description: "This Privacy Policy explains how INFERA collects, uses, protects, and governs data across its sovereign AI platforms.",
  descriptionAr: "توضح سياسة الخصوصية هذه كيف تجمع INFERA وتستخدم وتحمي وتحكم البيانات عبر منصاتها السيادية للذكاء الاصطناعي."
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
      "INFERA مبنية على مبدأ أن ملكية البيانات تبقى مع المستخدم أو المنظمة أو السلطة السيادية.",
      "INFERA لا: تبيع البيانات الشخصية، تسييل البيانات عبر أطراف ثالثة، تستخدم البيانات لأغراض إعلانية.",
      "جميع معالجة البيانات مرتبطة بالغرض ومحكومة بالحوكمة."
    ]
  },
  {
    id: "collection",
    number: 2,
    title: "Data We Collect",
    titleAr: "البيانات التي نجمعها",
    content: [
      "Depending on access level and platform usage, INFERA may collect: Identity and access information, System usage and interaction data, Operational and configuration data, Security and audit logs, AI training metadata (non-identifiable by default).",
      "Data collection is always: Minimal, Contextual, Necessary for system operation."
    ],
    contentAr: [
      "اعتماداً على مستوى الوصول واستخدام المنصة، قد تجمع INFERA: معلومات الهوية والوصول، بيانات استخدام النظام والتفاعل، البيانات التشغيلية والتكوينية، سجلات الأمن والتدقيق، بيانات تدريب الذكاء الاصطناعي الوصفية (غير قابلة للتحديد افتراضياً).",
      "جمع البيانات دائماً: أقل ما يمكن، سياقي، ضروري لتشغيل النظام."
    ]
  },
  {
    id: "usage",
    number: 3,
    title: "How Data Is Used",
    titleAr: "كيف تُستخدم البيانات",
    content: [
      "Data is used exclusively to: Operate and secure the platform, Enforce governance and policies, Improve system intelligence, Generate analytics and insights, Maintain auditability and compliance.",
      "AI systems operate within strict policy boundaries and do not act outside authorized scopes."
    ],
    contentAr: [
      "البيانات تُستخدم حصرياً لـ: تشغيل وتأمين المنصة، تطبيق الحوكمة والسياسات، تحسين ذكاء النظام، توليد التحليلات والرؤى، الحفاظ على قابلية التدقيق والامتثال.",
      "أنظمة الذكاء الاصطناعي تعمل ضمن حدود سياسات صارمة ولا تتصرف خارج النطاقات المصرح بها."
    ]
  },
  {
    id: "security",
    number: 4,
    title: "Data Security & Protection",
    titleAr: "أمن وحماية البيانات",
    content: [
      "INFERA applies sovereign-grade security measures, including: End-to-end encryption, Zero-Trust architecture, Continuous monitoring, Automated threat detection, Access-based data segmentation.",
      "All data access is logged, auditable, and subject to governance review."
    ],
    contentAr: [
      "INFERA تطبق إجراءات أمنية بمستوى سيادي، تشمل: التشفير من طرف إلى طرف، هندسة الثقة الصفرية، المراقبة المستمرة، الكشف الآلي عن التهديدات، تقسيم البيانات القائم على الوصول.",
      "جميع عمليات الوصول للبيانات مسجلة وقابلة للتدقيق وتخضع لمراجعة الحوكمة."
    ]
  },
  {
    id: "residency",
    number: 5,
    title: "Data Residency & Localization",
    titleAr: "إقامة البيانات والتوطين",
    content: [
      "Where required, INFERA supports: Data residency controls, Local or national data storage, Jurisdiction-specific governance rules.",
      "INFERA does not transfer data across borders without authorization."
    ],
    contentAr: [
      "حيث يُتطلب، تدعم INFERA: ضوابط إقامة البيانات، التخزين المحلي أو الوطني للبيانات، قواعد الحوكمة الخاصة بالولاية القضائية.",
      "INFERA لا تنقل البيانات عبر الحدود دون تفويض."
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
      "INFERA لا تشارك البيانات مع أطراف ثالثة إلا عندما: مصرح به صراحة من المستخدم أو السلطة، مطلوب بموجب القانون المعمول به، ضروري لحماية سلامة النظام.",
      "أي مشاركة مصرح بها مسجلة ومحكومة."
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
      "اعتماداً على الولاية القضائية ونموذج الحوكمة، قد يكون للمستخدمين أو السلطات الحق في: الوصول إلى بياناتهم، تصحيح الأخطاء، طلب الحذف أو التقييد، مراجعة سجلات الوصول.",
      "جميع الطلبات تخضع للتحقق من الأمن والحوكمة."
    ]
  },
  {
    id: "ai-usage",
    number: 8,
    title: "AI & Data Usage",
    titleAr: "الذكاء الاصطناعي واستخدام البيانات",
    content: [
      "AI models may analyze data to provide intelligence and automation.",
      "AI systems: Do not make sovereign decisions, Do not override human authority, Operate under Policy Validator AI enforcement."
    ],
    contentAr: [
      "نماذج الذكاء الاصطناعي قد تحلل البيانات لتوفير الذكاء والأتمتة.",
      "أنظمة الذكاء الاصطناعي: لا تتخذ قرارات سيادية، لا تتجاوز السلطة البشرية، تعمل تحت تطبيق مدقق السياسات الذكي."
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
      "البيانات تُحتفظ فقط لـ: الضرورة التشغيلية، المتطلبات القانونية أو التنظيمية، أغراض الحوكمة والتدقيق.",
      "سياسات الاحتفاظ قابلة للتكوين بناءً على المتطلبات التنظيمية أو السيادية."
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
      "قد تُحدث سياسة الخصوصية هذه لتعكس تطور النظام أو التغييرات التنظيمية.",
      "الاستمرار في استخدام INFERA يشكل قبولاً للتحديثات."
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
  statementAr: "INFERA تحمي الخصوصية بالتصميم، بالحوكمة، وبالتحكم السيادي."
};

export const privacyMeta = {
  title: "Privacy Policy",
  titleAr: "سياسة الخصوصية",
  subtitle: "Sovereign Privacy",
  subtitleAr: "خصوصية سيادية"
};
