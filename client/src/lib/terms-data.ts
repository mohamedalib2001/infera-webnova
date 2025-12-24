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
  welcomeAr: "مرحباً بك في INFERA.",
  statement: "By accessing or using any INFERA platform, service, or system, you agree to be bound by the following Terms & Conditions.",
  statementAr: "بوصولك أو استخدامك لأي منصة أو خدمة أو نظام من INFERA، فإنك توافق على الالتزام بالشروط والأحكام التالية.",
  warning: "If you do not agree with these terms, you are not authorized to access or use INFERA.",
  warningAr: "إذا كنت لا توافق على هذه الشروط، فأنت غير مصرح لك بالوصول أو استخدام INFERA."
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
      "INFERA توفر بنية تحتية رقمية سيادية مدفوعة بالذكاء الاصطناعي.",
      "INFERA ليست تطبيقاً استهلاكياً، وليست منتج SaaS مفتوحاً، وليست سوقاً عامة.",
      "الوصول إلى INFERA يُمنح بشكل انتقائي وقد يُلغى في أي وقت للحفاظ على الأمن والسيادة والحوكمة."
    ]
  },
  {
    id: "eligibility",
    number: 2,
    title: "Eligibility & Access",
    titleAr: "الأهلية والوصول",
    content: [
      "Access to INFERA may require: Explicit approval, Identity verification, Compliance with internal governance policies.",
      "INFERA reserves the right to: Approve or reject access without justification, Suspend or terminate accounts, Modify access levels dynamically.",
      "No user has an inherent or permanent right of access."
    ],
    contentAr: [
      "الوصول إلى INFERA قد يتطلب: موافقة صريحة، التحقق من الهوية، الامتثال لسياسات الحوكمة الداخلية.",
      "INFERA تحتفظ بالحق في: الموافقة أو رفض الوصول دون تبرير، تعليق أو إنهاء الحسابات، تعديل مستويات الوصول ديناميكياً.",
      "لا يملك أي مستخدم حقاً متأصلاً أو دائماً في الوصول."
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
      "أنت توافق على عدم: محاولة تجاوز ضوابط الحوكمة أو الأمن.",
      "الهندسة العكسية أو النسخ أو استخراج منطق النظام.",
      "استخدام INFERA لأغراض غير قانونية أو غير أخلاقية أو معادية.",
      "التدخل في سلامة المنصة أو توفرها.",
      "أي انتهاك قد يؤدي إلى تعليق فوري دون إشعار."
    ]
  },
  {
    id: "ai-disclaimer",
    number: 4,
    title: "AI & Automation Disclaimer",
    titleAr: "إخلاء مسؤولية الذكاء الاصطناعي والأتمتة",
    content: [
      "INFERA platforms may provide AI-generated insights, recommendations, or automated actions.",
      "Such outputs: Are decision-support mechanisms, Do not replace human or sovereign authority, May evolve over time as models learn.",
      "Final responsibility for decisions always remains with the user or governing authority."
    ],
    contentAr: [
      "منصات INFERA قد توفر رؤى مولدة بالذكاء الاصطناعي، توصيات، أو إجراءات آلية.",
      "هذه المخرجات: هي آليات دعم القرار، لا تحل محل السلطة البشرية أو السيادية، قد تتطور مع الوقت مع تعلم النماذج.",
      "المسؤولية النهائية عن القرارات تبقى دائماً مع المستخدم أو السلطة الحاكمة."
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
      "جميع المنصات والأنظمة والهندسات والسياسات والذكاء الأساسي داخل INFERA هي ملكية فكرية حصرية لـ INFERA.",
      "لا يُمنح أي ترخيص باستثناء الحق المحدود في استخدام المنصة كما هو مصرح به صراحة."
    ]
  },
  {
    id: "security",
    number: 6,
    title: "Security & Governance",
    titleAr: "الأمن والحوكمة",
    content: [
      "Users acknowledge that: All activities may be monitored and logged.",
      "Access is governed by Policy Validator AI.",
      "Governance decisions are final and non-negotiable.",
      "Security enforcement may occur automatically without prior notice."
    ],
    contentAr: [
      "يقر المستخدمون بأن: جميع الأنشطة قد تُراقب وتُسجل.",
      "الوصول يُحكم بواسطة مدقق السياسات الذكي.",
      "قرارات الحوكمة نهائية وغير قابلة للتفاوض.",
      "تطبيق الأمن قد يحدث تلقائياً دون إشعار مسبق."
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
      "INFERA تُقدم \"كما هي\" و\"حسب التوفر\".",
      "INFERA لن تكون مسؤولة عن: الأضرار غير المباشرة أو التبعية، فقدان البيانات بسبب إجراءات المستخدم، القرارات المتخذة بناءً على مخرجات المنصة."
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
      "INFERA قد تعلق أو تنهي الوصول في أي وقت لحماية: السيادة، الأمن، الامتثال، النزاهة الاستراتيجية.",
      "الإنهاء لا يتنازل عن أي حقوق أو حماية."
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
      "هذه الشروط تحكمها مبادئ السيادة الرقمية والتحكم، ليس راحة المستهلك.",
      "INFERA تعمل تحت أطر حوكمة خاصة، ليس التزامات الخدمة العامة."
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
      "INFERA قد تحدث هذه الشروط في أي وقت.",
      "الاستمرار في الاستخدام يشكل قبولاً للشروط المحدثة."
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
  statementAr: "باستخدامك INFERA، فإنك تقر بأن السيطرة والحوكمة والنزاهة طويلة المدى تأخذ الأسبقية على الوصول غير المقيد."
};

export const termsMeta = {
  title: "Terms & Conditions",
  titleAr: "الشروط والأحكام",
  subtitle: "Sovereign Terms",
  subtitleAr: "شروط سيادية"
};
