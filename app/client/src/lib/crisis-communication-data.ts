// INFERA Crisis Communication Matrix™
// مصفوفة اتصالات الأزمات™

export interface CrisisLevel {
  id: string;
  level: number;
  name: string;
  nameAr: string;
  examples: string[];
  examplesAr: string[];
  spokesperson: string;
  spokespersonAr: string;
  action?: string;
  actionAr?: string;
  messageFrame?: string[];
  messageFrameAr?: string[];
  message?: string;
  messageAr?: string;
  keyPhraseStyle?: string;
  keyPhraseStyleAr?: string;
  keyRule?: string;
  keyRuleAr?: string;
  severity: "low" | "medium" | "high" | "critical" | "extreme";
}

export const crisisPrinciple = {
  title: "Crisis Principle",
  titleAr: "مبدأ الأزمات",
  statement: "In crisis, silence is a tool.",
  statementAr: "في الأزمات، الصمت أداة.",
  subStatement: "Words are deployed only when they increase control.",
  subStatementAr: "الكلمات تُنشر فقط عندما تزيد السيطرة."
};

export const crisisLevels: CrisisLevel[] = [
  {
    id: "level-1",
    level: 1,
    name: "Internal Confusion",
    nameAr: "ارتباك داخلي",
    examples: [
      "Misunderstanding",
      "Internal disagreement",
      "Minor leaks"
    ],
    examplesAr: [
      "سوء فهم",
      "خلاف داخلي",
      "تسريبات طفيفة"
    ],
    spokesperson: "NONE",
    spokespersonAr: "لا أحد",
    action: "Internal clarification only. No external communication.",
    actionAr: "توضيح داخلي فقط. لا اتصالات خارجية.",
    message: "Silence",
    messageAr: "صمت",
    severity: "low"
  },
  {
    id: "level-2",
    level: 2,
    name: "Investor / Board Concern",
    nameAr: "قلق المستثمرين / المجلس",
    examples: [
      "Doubts",
      "Pressure for speed",
      "Strategic anxiety"
    ],
    examplesAr: [
      "شكوك",
      "ضغط للتسريع",
      "قلق استراتيجي"
    ],
    spokesperson: "Founder or Board Chair ONLY",
    spokespersonAr: "المؤسس أو رئيس المجلس فقط",
    messageFrame: [
      "Calm",
      "Long-term",
      "Control-focused"
    ],
    messageFrameAr: [
      "هادئ",
      "طويل المدى",
      "مركز على السيطرة"
    ],
    keyPhraseStyle: "We are exactly where we planned to be.",
    keyPhraseStyleAr: "نحن بالضبط حيث خططنا أن نكون.",
    severity: "medium"
  },
  {
    id: "level-3",
    level: 3,
    name: "Government Questioning",
    nameAr: "تساؤلات حكومية",
    examples: [
      "Sovereignty concerns",
      "Control questions",
      "Security clarification"
    ],
    examplesAr: [
      "مخاوف السيادة",
      "أسئلة التحكم",
      "توضيح أمني"
    ],
    spokesperson: "Sovereign Liaison ONLY",
    spokespersonAr: "مسؤول الاتصال السيادي فقط",
    messageFrame: [
      "Assurance",
      "Stability",
      "Control retention"
    ],
    messageFrameAr: [
      "ضمان",
      "استقرار",
      "الاحتفاظ بالسيطرة"
    ],
    keyPhraseStyle: "Full authority remains national at all times.",
    keyPhraseStyleAr: "السلطة الكاملة تبقى وطنية في جميع الأوقات.",
    severity: "high"
  },
  {
    id: "level-4",
    level: 4,
    name: "Media / Public Noise",
    nameAr: "ضوضاء الإعلام / العامة",
    examples: [
      "Speculation",
      "Inaccurate reporting",
      "External narratives"
    ],
    examplesAr: [
      "تكهنات",
      "تقارير غير دقيقة",
      "سرديات خارجية"
    ],
    spokesperson: "NONE (by default)",
    spokespersonAr: "لا أحد (افتراضياً)",
    action: "No reaction. No correction unless strategic.",
    actionAr: "لا رد فعل. لا تصحيح إلا إذا كان استراتيجياً.",
    message: "Silence is preferred",
    messageAr: "الصمت مفضّل",
    severity: "critical"
  },
  {
    id: "level-5",
    level: 5,
    name: "Direct Attack / Accusation",
    nameAr: "هجوم مباشر / اتهام",
    examples: [
      "Security allegations",
      "Political pressure",
      "Coordinated narrative attack"
    ],
    examplesAr: [
      "ادعاءات أمنية",
      "ضغط سياسي",
      "هجوم سردي منسق"
    ],
    spokesperson: "Founder OR designated sovereign authority",
    spokespersonAr: "المؤسس أو السلطة السيادية المعينة",
    messageFrame: [
      "Factual",
      "Minimal",
      "Non-defensive"
    ],
    messageFrameAr: [
      "واقعي",
      "محدود",
      "غير دفاعي"
    ],
    keyRule: "Respond once. Never debate. Never escalate.",
    keyRuleAr: "رد مرة واحدة. لا تناقش. لا تصعّد.",
    severity: "extreme"
  }
];

export const absoluteRules = {
  title: "Absolute Communication Rules",
  titleAr: "قواعد الاتصال المطلقة",
  rules: [
    { rule: "No emotional responses", ruleAr: "لا ردود عاطفية" },
    { rule: "No reactive statements", ruleAr: "لا بيانات تفاعلية" },
    { rule: "No over-explaining", ruleAr: "لا إفراط في الشرح" },
    { rule: "No unscheduled interviews", ruleAr: "لا مقابلات غير مجدولة" },
    { rule: "No anonymous sources", ruleAr: "لا مصادر مجهولة" }
  ],
  finalStatement: "SILENCE IS ALWAYS ACCEPTABLE.",
  finalStatementAr: "الصمت مقبول دائماً.",
  warning: "LOSS OF CONTROL IS NOT.",
  warningAr: "فقدان السيطرة ليس مقبولاً."
};

export const crisisMatrixMeta = {
  title: "Crisis Communication Matrix™",
  titleAr: "مصفوفة اتصالات الأزمات™",
  target: "Strategic Communication Control",
  targetAr: "التحكم في الاتصالات الاستراتيجية",
  classification: "CRISIS / RESTRICTED",
  classificationAr: "أزمات / محدود"
};
