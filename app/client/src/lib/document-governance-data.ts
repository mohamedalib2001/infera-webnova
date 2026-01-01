// INFERA Document Separation Governance
// حوكمة فصل الوثائق

export interface SeparationRule {
  id: string;
  rule: string;
  ruleAr: string;
  violations: string[];
  violationsAr: string[];
}

export interface DocumentClass {
  id: string;
  name: string;
  nameAr: string;
  classification: string;
  classificationAr: string;
  audience: string[];
  audienceAr: string[];
  languageStyle: string;
  languageStyleAr: string;
  neverMention: string[];
  neverMentionAr: string[];
  neverShareWith: string[];
  neverShareWithAr: string[];
  reviewAuthority: string;
  reviewAuthorityAr: string;
}

export const documentClasses: DocumentClass[] = [
  {
    id: "board",
    name: "Board Documents",
    nameAr: "وثائق مجلس الإدارة",
    classification: "BOARD CONFIDENTIAL",
    classificationAr: "سري - مجلس الإدارة",
    audience: ["Board of Directors", "Sovereign Funds", "Strategic Investors", "Executive Committee"],
    audienceAr: ["مجلس الإدارة", "صناديق السيادة", "المستثمرون الاستراتيجيون", "اللجنة التنفيذية"],
    languageStyle: "Strategic Dominance",
    languageStyleAr: "الهيمنة الاستراتيجية",
    neverMention: [
      "Adoption phases",
      "National control mechanisms",
      "Government-specific terminology",
      "Ministerial processes",
      "Sovereignty assurances"
    ],
    neverMentionAr: [
      "مراحل التبني",
      "آليات التحكم الوطني",
      "مصطلحات خاصة بالحكومة",
      "العمليات الوزارية",
      "ضمانات السيادة"
    ],
    neverShareWith: ["Governments", "Ministries", "National Authorities", "Public Entities"],
    neverShareWithAr: ["الحكومات", "الوزارات", "السلطات الوطنية", "الكيانات العامة"],
    reviewAuthority: "Board-level authority only",
    reviewAuthorityAr: "سلطة مستوى مجلس الإدارة فقط"
  },
  {
    id: "government",
    name: "Government Pack",
    nameAr: "الحزمة الحكومية",
    classification: "CONFIDENTIAL / RESTRICTED",
    classificationAr: "سري / محدود",
    audience: ["Ministries", "National Authorities", "Sovereign Digital Offices", "Defense/Cyber/Finance Agencies"],
    audienceAr: ["الوزارات", "السلطات الوطنية", "مكاتب الرقمنة السيادية", "وكالات الدفاع/السيبرانية/المالية"],
    languageStyle: "Stability & Sovereignty",
    languageStyleAr: "الاستقرار والسيادة",
    neverMention: [
      "Exit strategies",
      "Valuation or ROI",
      "Market competition",
      "Investor returns",
      "Revenue projections",
      "Competitive positioning"
    ],
    neverMentionAr: [
      "استراتيجيات الخروج",
      "التقييم أو العائد على الاستثمار",
      "المنافسة السوقية",
      "عوائد المستثمرين",
      "توقعات الإيرادات",
      "التموضع التنافسي"
    ],
    neverShareWith: ["Investors", "Board Members", "Venture Capital", "Private Equity"],
    neverShareWithAr: ["المستثمرون", "أعضاء مجلس الإدارة", "رأس المال المغامر", "الملكية الخاصة"],
    reviewAuthority: "Sovereign liaison authority only",
    reviewAuthorityAr: "سلطة الاتصال السيادي فقط"
  }
];

export const languageFirewall = {
  title: "Language Firewall",
  titleAr: "جدار اللغة الناري",
  description: "Strict separation of terminology and phrasing between document classes",
  descriptionAr: "فصل صارم للمصطلحات والصياغة بين فئات الوثائق",
  rules: [
    {
      boardLanguage: "Strategic dominance",
      boardLanguageAr: "الهيمنة الاستراتيجية",
      governmentLanguage: "Stability & sovereignty",
      governmentLanguageAr: "الاستقرار والسيادة"
    },
    {
      boardLanguage: "Market position",
      boardLanguageAr: "الموقع السوقي",
      governmentLanguage: "National capability",
      governmentLanguageAr: "القدرة الوطنية"
    },
    {
      boardLanguage: "Competitive advantage",
      boardLanguageAr: "الميزة التنافسية",
      governmentLanguage: "Strategic independence",
      governmentLanguageAr: "الاستقلال الاستراتيجي"
    },
    {
      boardLanguage: "Revenue growth",
      boardLanguageAr: "نمو الإيرادات",
      governmentLanguage: "Operational continuity",
      governmentLanguageAr: "استمرارية العمليات"
    },
    {
      boardLanguage: "Exit opportunity",
      boardLanguageAr: "فرصة الخروج",
      governmentLanguage: "Long-term partnership",
      governmentLanguageAr: "شراكة طويلة المدى"
    }
  ]
};

export const storageAccessRules = {
  title: "Storage & Access Control",
  titleAr: "التخزين والتحكم بالوصول",
  rules: [
    {
      rule: "Separate repositories for each document class",
      ruleAr: "مستودعات منفصلة لكل فئة وثائق"
    },
    {
      rule: "Separate access control lists",
      ruleAr: "قوائم تحكم وصول منفصلة"
    },
    {
      rule: "Separate review and approval cycles",
      ruleAr: "دورات مراجعة وموافقة منفصلة"
    },
    {
      rule: "No cross-referencing between document classes",
      ruleAr: "لا إشارات متبادلة بين فئات الوثائق"
    },
    {
      rule: "Audit trail for all access attempts",
      ruleAr: "مسار تدقيق لجميع محاولات الوصول"
    }
  ]
};

export const violationPolicy = {
  title: "Violation Policy",
  titleAr: "سياسة الانتهاك",
  statement: "Any cross-use or leakage invalidates trust.",
  statementAr: "أي استخدام متبادل أو تسريب يبطل الثقة.",
  consequences: [
    {
      violation: "Sharing board documents with government entities",
      violationAr: "مشاركة وثائق المجلس مع الكيانات الحكومية",
      consequence: "Immediate document invalidation and relationship review",
      consequenceAr: "إبطال فوري للوثيقة ومراجعة العلاقة"
    },
    {
      violation: "Sharing government pack with investors",
      violationAr: "مشاركة الحزمة الحكومية مع المستثمرين",
      consequence: "Trust breach and potential partnership termination",
      consequenceAr: "خرق الثقة وإنهاء محتمل للشراكة"
    },
    {
      violation: "Using shared phrasing between document classes",
      violationAr: "استخدام صياغة مشتركة بين فئات الوثائق",
      consequence: "Document recall and mandatory revision",
      consequenceAr: "استرجاع الوثيقة ومراجعة إلزامية"
    },
    {
      violation: "Unauthorized access to restricted documents",
      violationAr: "وصول غير مصرح للوثائق المقيدة",
      consequence: "Access revocation and security review",
      consequenceAr: "إلغاء الوصول ومراجعة أمنية"
    }
  ]
};

export const governanceMeta = {
  title: "Document Separation Governance",
  titleAr: "حوكمة فصل الوثائق",
  subtitle: "Mandatory Separation Rules for Strategic Documentation",
  subtitleAr: "قواعد فصل إلزامية للوثائق الاستراتيجية",
  purpose: "Prevent cross-contamination of messaging between stakeholder classes",
  purposeAr: "منع التلوث المتبادل للرسائل بين فئات أصحاب المصلحة"
};
