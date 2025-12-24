// INFERA Launch Sequencing Plan™
// خطة تسلسل الإطلاق™

export interface LaunchPhase {
  id: string;
  phase: string;
  phaseAr: string;
  name: string;
  nameAr: string;
  visibleTo: string[];
  visibleToAr: string[];
  contentVisible: string[];
  contentVisibleAr: string[];
  hiddenContent: string[];
  hiddenContentAr: string[];
  purpose: string[];
  purposeAr: string[];
  rule?: string;
  ruleAr?: string;
  status: "active" | "upcoming" | "locked";
}

export const launchPrinciple = {
  title: "Launch Principle",
  titleAr: "مبدأ الإطلاق",
  statements: [
    {
      statement: "INFERA is NOT launched publicly.",
      statementAr: "INFERA لا يُطلق علنياً."
    },
    {
      statement: "It is revealed in controlled waves.",
      statementAr: "يُكشف عنه في موجات محكومة."
    },
    {
      statement: "Nothing appears to everyone at once.",
      statementAr: "لا شيء يظهر للجميع في وقت واحد."
    },
    {
      statement: "Timing is power.",
      statementAr: "التوقيت هو القوة."
    }
  ]
};

export const launchPhases: LaunchPhase[] = [
  {
    id: "phase-0",
    phase: "Phase 0",
    phaseAr: "المرحلة 0",
    name: "Stealth Foundation",
    nameAr: "الأساس الخفي",
    visibleTo: [
      "Founder",
      "Core leadership",
      "Strategic execution AI"
    ],
    visibleToAr: [
      "المؤسس",
      "القيادة الأساسية",
      "الذكاء الاصطناعي للتنفيذ الاستراتيجي"
    ],
    contentVisible: [
      "Full ecosystem architecture",
      "All platforms",
      "Governance, policies, validators",
      "Economic engine",
      "Crisis playbooks",
      "Time dominance logic"
    ],
    contentVisibleAr: [
      "هندسة النظام البيئي الكاملة",
      "جميع المنصات",
      "الحوكمة والسياسات والمدققين",
      "المحرك الاقتصادي",
      "كتيبات الأزمات",
      "منطق الهيمنة الزمنية"
    ],
    hiddenContent: [],
    hiddenContentAr: [],
    purpose: [
      "Absolute internal alignment",
      "No external narrative yet",
      "Zero leaks"
    ],
    purposeAr: [
      "التناسق الداخلي المطلق",
      "لا سردية خارجية بعد",
      "صفر تسريبات"
    ],
    rule: "INTERNAL ONLY",
    ruleAr: "داخلي فقط",
    status: "active"
  },
  {
    id: "phase-1",
    phase: "Phase 1",
    phaseAr: "المرحلة 1",
    name: "Board & Sovereign Capital Reveal",
    nameAr: "كشف المجلس ورأس المال السيادي",
    visibleTo: [
      "Board members",
      "Sovereign funds",
      "Strategic investors (hand-picked)"
    ],
    visibleToAr: [
      "أعضاء مجلس الإدارة",
      "صناديق السيادة",
      "المستثمرون الاستراتيجيون (مختارون)"
    ],
    contentVisible: [
      "Board-Level Documents",
      "Time Dominance (Board Version)",
      "Crisis Playbook (Board Version)",
      "Irreplaceability Proof (Board Version)",
      "Economic Engine Model"
    ],
    contentVisibleAr: [
      "وثائق مستوى مجلس الإدارة",
      "الهيمنة الزمنية (نسخة المجلس)",
      "كتيب الأزمات (نسخة المجلس)",
      "دليل عدم الاستبدالية (نسخة المجلس)",
      "نموذج المحرك الاقتصادي"
    ],
    hiddenContent: [
      "Government adoption roadmap",
      "Operational details",
      "Platform demos"
    ],
    hiddenContentAr: [
      "خارطة طريق التبني الحكومي",
      "التفاصيل التشغيلية",
      "عروض المنصة"
    ],
    purpose: [
      "Secure patience capital",
      "Align long-term vision",
      "Lock strategic backing"
    ],
    purposeAr: [
      "تأمين رأس مال الصبر",
      "مواءمة الرؤية طويلة المدى",
      "تثبيت الدعم الاستراتيجي"
    ],
    status: "upcoming"
  },
  {
    id: "phase-2",
    phase: "Phase 2",
    phaseAr: "المرحلة 2",
    name: "Government Confidential Reveal",
    nameAr: "الكشف الحكومي السري",
    visibleTo: [
      "Ministries",
      "National authorities",
      "Sovereign digital offices"
    ],
    visibleToAr: [
      "الوزارات",
      "السلطات الوطنية",
      "مكاتب الرقمنة السيادية"
    ],
    contentVisible: [
      "Government Confidential Pack",
      "Sovereign Purpose Statement",
      "Crisis Resilience (Government Version)",
      "Governance & Control Assurance"
    ],
    contentVisibleAr: [
      "الحزمة الحكومية السرية",
      "بيان الغرض السيادي",
      "مرونة الأزمات (النسخة الحكومية)",
      "ضمان الحوكمة والتحكم"
    ],
    hiddenContent: [
      "Exit strategy",
      "Revenue models",
      "Competitive kill maps"
    ],
    hiddenContentAr: [
      "استراتيجية الخروج",
      "نماذج الإيرادات",
      "خرائط القضاء على المنافسين"
    ],
    purpose: [
      "Build sovereign trust",
      "Position INFERA as infrastructure",
      "Enable pilot agreements"
    ],
    purposeAr: [
      "بناء الثقة السيادية",
      "تموضع INFERA كبنية تحتية",
      "تمكين اتفاقيات التجريب"
    ],
    status: "locked"
  },
  {
    id: "phase-3",
    phase: "Phase 3",
    phaseAr: "المرحلة 3",
    name: "Controlled Pilot Deployments",
    nameAr: "نشر تجريبي محكوم",
    visibleTo: [
      "Selected government entities",
      "Selected enterprises (non-public)"
    ],
    visibleToAr: [
      "جهات حكومية مختارة",
      "مؤسسات مختارة (غير عامة)"
    ],
    contentVisible: [
      "Limited platform scope",
      "Strict governance enforcement",
      "No full ecosystem exposure"
    ],
    contentVisibleAr: [
      "نطاق منصة محدود",
      "تطبيق حوكمة صارم",
      "لا تعرض كامل للنظام البيئي"
    ],
    hiddenContent: [
      "Full ecosystem architecture",
      "Other pilot information",
      "Internal roadmaps"
    ],
    hiddenContentAr: [
      "هندسة النظام البيئي الكاملة",
      "معلومات التجارب الأخرى",
      "خرائط الطريق الداخلية"
    ],
    purpose: [
      "Proof through operation",
      "Trust accumulation",
      "No market noise"
    ],
    purposeAr: [
      "الإثبات من خلال التشغيل",
      "تراكم الثقة",
      "لا ضوضاء سوقية"
    ],
    rule: "Each pilot sees ONLY what is required.",
    ruleAr: "كل تجربة ترى فقط ما هو مطلوب.",
    status: "locked"
  },
  {
    id: "phase-4",
    phase: "Phase 4",
    phaseAr: "المرحلة 4",
    name: "Strategic Partner Expansion",
    nameAr: "توسع الشركاء الاستراتيجيين",
    visibleTo: [
      "National champions",
      "System integrators (approved)",
      "Strategic partners"
    ],
    visibleToAr: [
      "الأبطال الوطنيون",
      "مكاملو الأنظمة (المعتمدون)",
      "الشركاء الاستراتيجيون"
    ],
    contentVisible: [
      "Integration frameworks",
      "Limited platform APIs",
      "Governance boundaries"
    ],
    contentVisibleAr: [
      "أطر التكامل",
      "واجهات برمجة محدودة",
      "حدود الحوكمة"
    ],
    hiddenContent: [
      "Core engine",
      "Policy validator internals"
    ],
    hiddenContentAr: [
      "المحرك الأساسي",
      "داخليات مدقق السياسات"
    ],
    purpose: [
      "Scale without loss of control",
      "Geographic expansion",
      "Ecosystem reinforcement"
    ],
    purposeAr: [
      "التوسع دون فقدان السيطرة",
      "التوسع الجغرافي",
      "تعزيز النظام البيئي"
    ],
    status: "locked"
  },
  {
    id: "phase-5",
    phase: "Phase 5",
    phaseAr: "المرحلة 5",
    name: "Selective Market Visibility",
    nameAr: "الظهور السوقي الانتقائي",
    visibleTo: [
      "Approved media channels",
      "Industry analysts",
      "Selected market segments"
    ],
    visibleToAr: [
      "قنوات إعلامية معتمدة",
      "محللو الصناعة",
      "شرائح سوقية مختارة"
    ],
    contentVisible: [
      "Public-facing narrative",
      "Approved case studies",
      "Controlled messaging"
    ],
    contentVisibleAr: [
      "السردية العامة",
      "دراسات حالة معتمدة",
      "رسائل محكومة"
    ],
    hiddenContent: [
      "Full strategic roadmap",
      "Internal economics",
      "Competitive intelligence"
    ],
    hiddenContentAr: [
      "خارطة الطريق الاستراتيجية الكاملة",
      "الاقتصاديات الداخلية",
      "الاستخبارات التنافسية"
    ],
    purpose: [
      "Market positioning",
      "Controlled narrative",
      "Demand generation"
    ],
    purposeAr: [
      "التموضع السوقي",
      "السردية المحكومة",
      "توليد الطلب"
    ],
    status: "locked"
  }
];

export const launchMeta = {
  title: "Launch Sequencing Plan™",
  titleAr: "خطة تسلسل الإطلاق™",
  target: "Strategic AI / Execution Office",
  targetAr: "الذكاء الاصطناعي الاستراتيجي / مكتب التنفيذ",
  objective: "Control Perception, Access, and Timing",
  objectiveAr: "التحكم في الإدراك والوصول والتوقيت",
  classification: "STRATEGIC / INTERNAL",
  classificationAr: "استراتيجي / داخلي"
};
