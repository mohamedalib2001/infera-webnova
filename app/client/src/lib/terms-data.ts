// INFERA Terms & Conditions - Sovereign Version
// الشروط والأحكام - النسخة السيادية

export interface TermsSection {
  id: string;
  number: number;
  title: string;
  titleAr: string;
  content: string[];
  contentAr: string[];
}

export const termsIntro = {
  lastUpdated: "December 2024",
  lastUpdatedAr: "ديسمبر 2024",
  welcome: "Welcome to INFERA.",
  welcomeAr: "مرحبًا بكم في INFERA.",
  statement: "By accessing or using any INFERA platform, service, or system, you agree to be bound by the following Terms & Conditions.",
  statementAr: "بدخولك أو استخدامك لأي منصة أو خدمة أو نظام تابع لـ INFERA، فإنك تقرّ وتوافق على الالتزام الكامل بهذه الشروط والأحكام.",
  warning: "If you do not agree with these terms, you are not authorized to access or use INFERA.",
  warningAr: "في حال عدم موافقتك على هذه الشروط، فأنت غير مخوّل بالوصول إلى أو استخدام أي من خدمات INFERA."
};

export const termsSections: TermsSection[] = [
  {
    id: "nature",
    number: 1,
    title: "Nature of the Platform",
    titleAr: "طبيعة المنصة",
    content: [
      "INFERA provides sovereign, AI-driven digital infrastructure.",
      "INFERA is not a consumer application, not an open SaaS product, and not a public marketplace.",
      "Access to INFERA is granted selectively and may be revoked at any time to preserve security, sovereignty, and governance."
    ],
    contentAr: [
      "توفر INFERA بنية تحتية رقمية سيادية مدعومة بالذكاء الاصطناعي.",
      "ولا تُعد INFERA: تطبيقًا استهلاكيًا، خدمة SaaS عامة، منصة مفتوحة أو سوقًا عامًا.",
      "يتم منح الوصول إلى INFERA بشكل انتقائي، ويجوز سحبه في أي وقت للحفاظ على الأمن والسيادة والحوكمة."
    ]
  },
  {
    id: "eligibility",
    number: 2,
    title: "Eligibility & Access",
    titleAr: "الأهلية ومنح الوصول",
    content: [
      "Access to INFERA may require: Explicit approval, Identity verification, Compliance with internal governance policies.",
      "INFERA reserves the right to: Approve or reject access without justification, Suspend or terminate accounts, Modify access levels dynamically.",
      "No user has an inherent or permanent right of access."
    ],
    contentAr: [
      "قد يتطلب الوصول إلى INFERA: موافقة صريحة، التحقق من الهوية، الامتثال لسياسات الحوكمة الداخلية.",
      "تحتفظ INFERA بالحق الكامل في: قبول أو رفض أي طلب وصول دون إبداء الأسباب، تعليق أو إنهاء الحسابات، تعديل مستويات الوصول بشكل ديناميكي.",
      "لا يملك أي مستخدم حقًا دائمًا أو مكتسبًا في الوصول."
    ]
  },
  {
    id: "acceptable-use",
    number: 3,
    title: "Acceptable Use",
    titleAr: "الاستخدام المقبول",
    content: [
      "You agree NOT to: Attempt to bypass governance or security controls.",
      "Reverse engineer, replicate, or extract system logic.",
      "Use INFERA for unlawful, unethical, or hostile purposes.",
      "Interfere with platform integrity or availability.",
      "Any violation may result in immediate suspension without notice."
    ],
    contentAr: [
      "يُحظر عليك القيام بما يلي:",
      "محاولة تجاوز أنظمة الحوكمة أو الأمان.",
      "الهندسة العكسية أو نسخ أو استخراج منطق النظام.",
      "استخدام المنصة لأغراض غير قانونية أو غير أخلاقية أو عدائية.",
      "التأثير على سلامة أو توافر المنصة.",
      "أي مخالفة قد تؤدي إلى تعليق فوري للخدمة دون إشعار مسبق."
    ]
  },
  {
    id: "ai-disclaimer",
    number: 4,
    title: "AI & Automation Disclaimer",
    titleAr: "إخلاء مسؤولية الذكاء الاصطناعي",
    content: [
      "INFERA platforms may provide AI-generated insights, recommendations, or automated actions.",
      "Such outputs: Are decision-support mechanisms, Do not replace human or sovereign authority, May evolve over time as models learn.",
      "Final responsibility for decisions always remains with the user or governing authority."
    ],
    contentAr: [
      "قد توفّر منصات INFERA مخرجات أو توصيات أو أتمتة مدعومة بالذكاء الاصطناعي.",
      "وتُعد هذه المخرجات: أدوات دعم لاتخاذ القرار، غير بديلة للسلطة البشرية أو السيادية، قابلة للتطور مع تعلم النماذج.",
      "تظل المسؤولية النهائية عن القرارات على عاتق المستخدم أو الجهة الحاكمة."
    ]
  },
  {
    id: "ip",
    number: 5,
    title: "Intellectual Property",
    titleAr: "الملكية الفكرية",
    content: [
      "All platforms, systems, architectures, policies, and underlying intelligence within INFERA are the exclusive intellectual property of INFERA.",
      "No license is granted except the limited right to use the platform as explicitly authorized."
    ],
    contentAr: [
      "تُعد جميع المنصات والأنظمة والهياكل والسياسات والذكاء الكامن داخل INFERA ملكية فكرية حصرية لـ INFERA.",
      "ولا يُمنح أي ترخيص سوى الحق المحدود في استخدام المنصة وفق ما هو مصرح به صراحة."
    ]
  },
  {
    id: "security",
    number: 6,
    title: "Security & Governance",
    titleAr: "الأمان والحوكمة",
    content: [
      "Users acknowledge that: All activities may be monitored and logged.",
      "Access is governed by Policy Validator AI.",
      "Governance decisions are final and non-negotiable.",
      "Security enforcement may occur automatically without prior notice."
    ],
    contentAr: [
      "يُقر المستخدم بأن: جميع الأنشطة قد تكون خاضعة للمراقبة والتسجيل.",
      "الوصول محكوم بأنظمة تحقق وسياسات صارمة.",
      "قرارات الحوكمة نهائية وغير قابلة للتفاوض.",
      "قد يتم تطبيق إجراءات الأمان تلقائيًا دون إشعار مسبق."
    ]
  },
  {
    id: "liability",
    number: 7,
    title: "Limitation of Liability",
    titleAr: "تحديد المسؤولية",
    content: [
      "INFERA is provided \"as is\" and \"as available.\"",
      "INFERA shall not be liable for: Indirect or consequential damages, Loss of data due to user actions, Decisions made based on platform outputs."
    ],
    contentAr: [
      "تُقدّم INFERA \"كما هي\" و\"حسب التوافر\".",
      "ولا تتحمل INFERA أي مسؤولية عن: الأضرار غير المباشرة أو التبعية، فقدان البيانات الناتج عن تصرفات المستخدم، القرارات المتخذة بناءً على مخرجات النظام."
    ]
  },
  {
    id: "termination",
    number: 8,
    title: "Termination",
    titleAr: "الإنهاء",
    content: [
      "INFERA may suspend or terminate access at any time to protect: Sovereignty, Security, Compliance, Strategic integrity.",
      "Termination does not waive any rights or protections."
    ],
    contentAr: [
      "يجوز لـ INFERA تعليق أو إنهاء الوصول في أي وقت لحماية: السيادة، الأمن، الامتثال، السلامة الاستراتيجية.",
      "ولا يؤدي الإنهاء إلى التنازل عن أي حقوق أو التزامات قائمة."
    ]
  },
  {
    id: "governing",
    number: 9,
    title: "Governing Principle",
    titleAr: "المبدأ الحاكم",
    content: [
      "These Terms are governed by the principle of digital sovereignty and control, not consumer convenience.",
      "INFERA operates under private governance frameworks, not public service obligations."
    ],
    contentAr: [
      "تخضع هذه الشروط لمبدأ السيادة الرقمية والتحكم المؤسسي، وليس لمبدأ راحة المستخدم أو الخدمة العامة.",
      "تعمل INFERA ضمن أطر حوكمة خاصة، وليست ملزمة بالتزامات الخدمات العامة."
    ]
  },
  {
    id: "modifications",
    number: 10,
    title: "Modifications",
    titleAr: "التعديلات",
    content: [
      "INFERA may update these Terms at any time.",
      "Continued use constitutes acceptance of the updated Terms."
    ],
    contentAr: [
      "يجوز لـ INFERA تعديل هذه الشروط في أي وقت.",
      "ويُعد الاستمرار في استخدام المنصة موافقة صريحة على التعديلات."
    ]
  },
  {
    id: "contact",
    number: 11,
    title: "Contact",
    titleAr: "التواصل",
    content: [
      "For official inquiries regarding these Terms, contact: legal@infera.com"
    ],
    contentAr: [
      "للاستفسارات الرسمية بخصوص هذه الشروط، تواصل مع: legal@infera.com"
    ]
  }
];

export const termsClosing = {
  statement: "By using INFERA, you acknowledge that control, governance, and long-term integrity take precedence over unrestricted access.",
  statementAr: "باستخدامك لمنصات INFERA، فأنت تقر بأن التحكم والحوكمة والسلامة طويلة الأمد تتقدم على الوصول غير المقيّد."
};

export const termsMeta = {
  title: "Terms & Conditions",
  titleAr: "الشروط والأحكام",
  subtitle: "Sovereign Terms",
  subtitleAr: "شروط سيادية"
};
