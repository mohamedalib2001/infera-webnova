// INFERA AI Policy - Sovereign Version
// سياسة الذكاء الاصطناعي - النسخة السيادية

export interface AIPolicySection {
  id: string;
  number: number;
  title: string;
  titleAr: string;
  content: string[];
  contentAr: string[];
}

export const aiPolicyIntro = {
  lastUpdated: "December 2024",
  lastUpdatedAr: "ديسمبر 2024",
  statement: "At INFERA, Artificial Intelligence is not a feature. It is a governed capability operating under sovereign control, accountability, and policy enforcement.",
  statementAr: "في INFERA، الذكاء الاصطناعي ليس ميزة. إنه قدرة محكومة تعمل تحت السيطرة السيادية والمساءلة وتطبيق السياسات.",
  description: "This AI Policy defines how AI is designed, used, restricted, and governed across all INFERA platforms.",
  descriptionAr: "تُحدد سياسة الذكاء الاصطناعي هذه كيفية تصميم واستخدام وتقييد وحوكمة الذكاء الاصطناعي عبر جميع منصات INFERA."
};

export const aiPolicySections: AIPolicySection[] = [
  {
    id: "governance",
    number: 1,
    title: "AI Governance Principle",
    titleAr: "مبدأ حوكمة الذكاء الاصطناعي",
    content: [
      "All AI systems within INFERA operate under: Human and sovereign authority, Policy Validator AI enforcement, Non-bypassable governance rules.",
      "AI in INFERA is assistive, predictive, and analytical.",
      "It does NOT possess autonomous sovereign authority."
    ],
    contentAr: [
      "جميع أنظمة الذكاء الاصطناعي في INFERA تعمل تحت: السلطة البشرية والسيادية، تطبيق مدقق السياسات الذكي، قواعد حوكمة غير قابلة للتجاوز.",
      "الذكاء الاصطناعي في INFERA مساعد وتنبؤي وتحليلي.",
      "لا يمتلك سلطة سيادية مستقلة."
    ]
  },
  {
    id: "purpose",
    number: 2,
    title: "Purpose of AI Usage",
    titleAr: "غرض استخدام الذكاء الاصطناعي",
    content: [
      "AI is used exclusively to: Enhance decision-making, Provide predictive insights, Automate approved workflows, Detect risks, anomalies, and patterns, Improve operational efficiency and security.",
      "AI is never used to: Replace legal, governmental, or executive authority, Act outside defined policy scopes, Perform uncontrolled or opaque decision-making."
    ],
    contentAr: [
      "الذكاء الاصطناعي يُستخدم حصرياً لـ: تعزيز صنع القرار، توفير رؤى تنبؤية، أتمتة سير العمل المعتمد، اكتشاف المخاطر والشذوذ والأنماط، تحسين الكفاءة التشغيلية والأمن.",
      "الذكاء الاصطناعي لا يُستخدم أبداً لـ: استبدال السلطة القانونية أو الحكومية أو التنفيذية، التصرف خارج نطاقات السياسة المحددة، اتخاذ قرارات غير منضبطة أو غير شفافة."
    ]
  },
  {
    id: "transparency",
    number: 3,
    title: "AI Transparency & Explainability",
    titleAr: "شفافية وقابلية تفسير الذكاء الاصطناعي",
    content: [
      "INFERA enforces: Traceable AI outputs, Logged AI actions and recommendations, Explainable decision support where applicable.",
      "Users and governing authorities retain the right to review AI behavior within authorized scopes."
    ],
    contentAr: [
      "INFERA تُطبق: مخرجات ذكاء اصطناعي قابلة للتتبع، إجراءات وتوصيات مسجلة، دعم قرار قابل للتفسير حيث ينطبق.",
      "المستخدمون والسلطات الحاكمة يحتفظون بالحق في مراجعة سلوك الذكاء الاصطناعي ضمن النطاقات المصرح بها."
    ]
  },
  {
    id: "ethics",
    number: 4,
    title: "AI Data Usage & Ethics",
    titleAr: "استخدام بيانات وأخلاقيات الذكاء الاصطناعي",
    content: [
      "AI systems: Use only authorized and governed data, Respect data sovereignty and privacy, Avoid bias amplification where detectable, Do not perform unauthorized learning.",
      "AI training and adaptation are subject to: Policy validation, Data governance rules, Security constraints."
    ],
    contentAr: [
      "أنظمة الذكاء الاصطناعي: تستخدم فقط البيانات المصرح بها والمحكومة، تحترم سيادة البيانات والخصوصية، تتجنب تضخيم التحيز حيث يمكن اكتشافه، لا تقوم بتعلم غير مصرح به.",
      "تدريب وتكيف الذكاء الاصطناعي يخضع لـ: التحقق من السياسات، قواعد حوكمة البيانات، قيود الأمن."
    ]
  },
  {
    id: "override",
    number: 5,
    title: "Human Override & Control",
    titleAr: "التجاوز البشري والتحكم",
    content: [
      "All AI-generated actions or recommendations: Can be overridden by authorized users, Are subject to access permissions, May be restricted or disabled by governance rules.",
      "AI never overrides: Human decisions, Sovereign authority, Legal or regulatory requirements."
    ],
    contentAr: [
      "جميع الإجراءات أو التوصيات المولدة بالذكاء الاصطناعي: يمكن تجاوزها من المستخدمين المصرح لهم، تخضع لأذونات الوصول، قد تُقيد أو تُعطل بقواعد الحوكمة.",
      "الذكاء الاصطناعي لا يتجاوز أبداً: القرارات البشرية، السلطة السيادية، المتطلبات القانونية أو التنظيمية."
    ]
  },
  {
    id: "prohibited",
    number: 6,
    title: "Prohibited AI Uses",
    titleAr: "الاستخدامات المحظورة للذكاء الاصطناعي",
    content: [
      "The following uses of AI are strictly prohibited:",
      "Autonomous decision-making without oversight",
      "Surveillance outside approved scopes",
      "Behavioral manipulation",
      "Generation of unlawful or harmful outputs",
      "Use of AI to bypass governance or security controls",
      "Violations result in immediate enforcement actions."
    ],
    contentAr: [
      "الاستخدامات التالية للذكاء الاصطناعي محظورة بشكل صارم:",
      "اتخاذ القرارات المستقلة دون إشراف",
      "المراقبة خارج النطاقات المعتمدة",
      "التلاعب السلوكي",
      "توليد مخرجات غير قانونية أو ضارة",
      "استخدام الذكاء الاصطناعي لتجاوز ضوابط الحوكمة أو الأمن",
      "الانتهاكات تؤدي إلى إجراءات تنفيذية فورية."
    ]
  },
  {
    id: "monitoring",
    number: 7,
    title: "Continuous Monitoring & Evolution",
    titleAr: "المراقبة والتطور المستمر",
    content: [
      "AI systems are continuously: Monitored, Audited, Evaluated for risk and performance.",
      "INFERA reserves the right to: Modify AI capabilities, Restrict AI functions, Suspend AI systems to maintain safety and sovereignty."
    ],
    contentAr: [
      "أنظمة الذكاء الاصطناعي تُراقب باستمرار، تُدقق، تُقيّم للمخاطر والأداء.",
      "INFERA تحتفظ بالحق في: تعديل قدرات الذكاء الاصطناعي، تقييد وظائف الذكاء الاصطناعي، تعليق أنظمة الذكاء الاصطناعي للحفاظ على السلامة والسيادة."
    ]
  },
  {
    id: "responsibility",
    number: 8,
    title: "Responsibility & Liability",
    titleAr: "المسؤولية والمساءلة",
    content: [
      "AI outputs are provided as decision-support tools.",
      "Final responsibility for actions and decisions remains with the user or governing authority."
    ],
    contentAr: [
      "مخرجات الذكاء الاصطناعي تُقدم كأدوات دعم قرار.",
      "المسؤولية النهائية عن الإجراءات والقرارات تبقى مع المستخدم أو السلطة الحاكمة."
    ]
  },
  {
    id: "updates",
    number: 9,
    title: "Policy Updates",
    titleAr: "تحديثات السياسة",
    content: [
      "This AI Policy may be updated to reflect technological, regulatory, or governance changes.",
      "Continued use of INFERA constitutes acceptance of updated AI policies."
    ],
    contentAr: [
      "قد تُحدث سياسة الذكاء الاصطناعي هذه لتعكس التغييرات التقنية أو التنظيمية أو الحوكمية.",
      "الاستمرار في استخدام INFERA يشكل قبولاً لسياسات الذكاء الاصطناعي المحدثة."
    ]
  },
  {
    id: "contact",
    number: 10,
    title: "Contact",
    titleAr: "التواصل",
    content: [
      "For AI governance inquiries: ai-governance@infera.com"
    ],
    contentAr: [
      "لاستفسارات حوكمة الذكاء الاصطناعي: ai-governance@infera.com"
    ]
  }
];

export const aiPolicyClosing = {
  statement: "INFERA AI operates under control, transparency, and sovereign accountability.",
  statementAr: "ذكاء INFERA الاصطناعي يعمل تحت السيطرة والشفافية والمساءلة السيادية."
};

export const aiPolicyMeta = {
  title: "AI Policy",
  titleAr: "سياسة الذكاء الاصطناعي",
  subtitle: "Sovereign AI Governance",
  subtitleAr: "حوكمة الذكاء الاصطناعي السيادية"
};
