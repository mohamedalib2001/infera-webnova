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
  statementAr: "في INFERA، لا يُعد الذكاء الاصطناعي ميزة تقنية، بل قدرة محكومة تعمل ضمن أطر السيادة، والمساءلة، والحوكمة الصارمة.",
  description: "This AI Policy defines how AI is designed, used, restricted, and governed across all INFERA platforms.",
  descriptionAr: "تحدد هذه السياسة كيفية تصميم واستخدام وتقييد وحوكمة أنظمة الذكاء الاصطناعي عبر جميع منصات INFERA."
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
      "تعمل جميع أنظمة الذكاء الاصطناعي داخل INFERA تحت: السلطة البشرية والسيادية، إنفاذ Policy Validator AI، سياسات غير قابلة للتجاوز.",
      "يُستخدم الذكاء الاصطناعي للدعم والتحليل والتنبؤ.",
      "ولا يمتلك أي سلطة سيادية مستقلة."
    ]
  },
  {
    id: "purpose",
    number: 2,
    title: "Purpose of AI Usage",
    titleAr: "أغراض استخدام الذكاء الاصطناعي",
    content: [
      "AI is used exclusively to: Enhance decision-making, Provide predictive insights, Automate approved workflows, Detect risks, anomalies, and patterns, Improve operational efficiency and security.",
      "AI is never used to: Replace legal, governmental, or executive authority, Act outside defined policy scopes, Perform uncontrolled or opaque decision-making."
    ],
    contentAr: [
      "يُستخدم الذكاء الاصطناعي حصريًا من أجل: دعم اتخاذ القرار، تقديم تحليلات وتوقعات ذكية، أتمتة سير عمل معتمدة، كشف المخاطر والأنماط والشذوذ، تحسين الكفاءة التشغيلية والأمنية.",
      "ولا يُستخدم الذكاء الاصطناعي من أجل: استبدال القرار البشري أو السيادي، العمل خارج نطاق السياسات المعتمدة، اتخاذ قرارات غير خاضعة للإشراف."
    ]
  },
  {
    id: "transparency",
    number: 3,
    title: "AI Transparency & Explainability",
    titleAr: "الشفافية وقابلية التفسير",
    content: [
      "INFERA enforces: Traceable AI outputs, Logged AI actions and recommendations, Explainable decision support where applicable.",
      "Users and governing authorities retain the right to review AI behavior within authorized scopes."
    ],
    contentAr: [
      "تلتزم INFERA بما يلي: تتبع مخرجات الذكاء الاصطناعي، تسجيل جميع التوصيات والإجراءات الذكية، تمكين التفسير عند الاقتضاء.",
      "ويحق للجهات المخوّلة مراجعة سلوك الذكاء الاصطناعي ضمن النطاقات المصرح بها."
    ]
  },
  {
    id: "ethics",
    number: 4,
    title: "AI Data Usage & Ethics",
    titleAr: "البيانات وأخلاقيات الذكاء الاصطناعي",
    content: [
      "AI systems: Use only authorized and governed data, Respect data sovereignty and privacy, Avoid bias amplification where detectable, Do not perform unauthorized learning.",
      "AI training and adaptation are subject to: Policy validation, Data governance rules, Security constraints."
    ],
    contentAr: [
      "تلتزم أنظمة الذكاء الاصطناعي بما يلي: استخدام بيانات مصرح بها فقط، احترام سيادة البيانات والخصوصية، تقليل الانحيازات قدر الإمكان، الامتناع عن التعلم غير المصرح به.",
      "تخضع عمليات التدريب أو التكيّف للسياسات الأمنية والحوكمية المعتمدة."
    ]
  },
  {
    id: "override",
    number: 5,
    title: "Human Override & Control",
    titleAr: "التحكم البشري وإمكانية التعطيل",
    content: [
      "All AI-generated actions or recommendations: Can be overridden by authorized users, Are subject to access permissions, May be restricted or disabled by governance rules.",
      "AI never overrides: Human decisions, Sovereign authority, Legal or regulatory requirements."
    ],
    contentAr: [
      "جميع مخرجات الذكاء الاصطناعي: قابلة للتجاوز من المستخدمين المخولين، خاضعة للصلاحيات، يمكن تقييدها أو تعطيلها حوكميًا.",
      "ولا يجوز للذكاء الاصطناعي: تجاوز القرار البشري، تعطيل السلطة السيادية، مخالفة المتطلبات القانونية أو التنظيمية."
    ]
  },
  {
    id: "prohibited",
    number: 6,
    title: "Prohibited AI Uses",
    titleAr: "الاستخدامات المحظورة",
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
      "يُحظر حظرًا تامًا استخدام الذكاء الاصطناعي في:",
      "اتخاذ قرارات مستقلة دون إشراف",
      "المراقبة خارج النطاقات المعتمدة",
      "التلاعب السلوكي",
      "توليد مخرجات غير قانونية أو ضارة",
      "تجاوز أنظمة الحوكمة أو الأمان",
      "تؤدي أي مخالفة إلى إجراءات إنفاذ فورية."
    ]
  },
  {
    id: "monitoring",
    number: 7,
    title: "Continuous Monitoring & Evolution",
    titleAr: "المراقبة المستمرة والتطوير",
    content: [
      "AI systems are continuously: Monitored, Audited, Evaluated for risk and performance.",
      "INFERA reserves the right to: Modify AI capabilities, Restrict AI functions, Suspend AI systems to maintain safety and sovereignty."
    ],
    contentAr: [
      "تخضع أنظمة الذكاء الاصطناعي إلى: مراقبة مستمرة، تدقيق دوري، تقييم مخاطر وأداء منتظم.",
      "وتحتفظ INFERA بالحق في: تعديل قدرات الذكاء الاصطناعي، تقييد أو تعليق وظائفه حفاظًا على السلامة والسيادة."
    ]
  },
  {
    id: "responsibility",
    number: 8,
    title: "Responsibility & Liability",
    titleAr: "المسؤولية",
    content: [
      "AI outputs are provided as decision-support tools.",
      "Final responsibility for actions and decisions remains with the user or governing authority."
    ],
    contentAr: [
      "تُقدّم مخرجات الذكاء الاصطناعي كأدوات دعم للقرار.",
      "وتبقى المسؤولية النهائية عن القرارات والإجراءات على عاتق المستخدم أو الجهة الحاكمة."
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
      "يجوز تحديث هذه السياسة لمواكبة التطورات التقنية أو التنظيمية.",
      "ويُعد الاستمرار في استخدام المنصات موافقة صريحة على أي تحديثات."
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
      "للاستفسارات المتعلقة بحوكمة الذكاء الاصطناعي: ai-governance@infera.com"
    ]
  }
];

export const aiPolicyClosing = {
  statement: "INFERA AI operates under control, transparency, and sovereign accountability.",
  statementAr: "يعمل الذكاء الاصطناعي في INFERA تحت السيطرة، وبالشفافية، وبالمساءلة السيادية."
};

export const aiPolicyMeta = {
  title: "AI Policy",
  titleAr: "سياسة الذكاء الاصطناعي",
  subtitle: "Sovereign AI Governance",
  subtitleAr: "حوكمة الذكاء الاصطناعي السيادية"
};
