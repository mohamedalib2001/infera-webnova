// INFERA Founder Daily Decision Framework™
// إطار قرارات المؤسس اليومية™

export interface DecisionFilter {
  id: number;
  question: string;
  questionAr: string;
  condition: string;
  conditionAr: string;
  action: string;
  actionAr: string;
}

export const frameworkPurpose = {
  title: "Purpose",
  titleAr: "الغرض",
  goals: [
    { goal: "Reduce cognitive load", goalAr: "تقليل الحمل المعرفي" },
    { goal: "Prevent reactive decisions", goalAr: "منع القرارات التفاعلية" },
    { goal: "Protect long-term vision", goalAr: "حماية الرؤية طويلة المدى" }
  ]
};

export const decisionFilters: DecisionFilter[] = [
  {
    id: 1,
    question: "Does this increase or decrease sovereign control?",
    questionAr: "هل هذا يزيد أو يقلل السيطرة السيادية؟",
    condition: "If decrease",
    conditionAr: "إذا قلّل",
    action: "Reject",
    actionAr: "ارفض"
  },
  {
    id: 2,
    question: "Does this align with Time Dominance?",
    questionAr: "هل هذا يتوافق مع الهيمنة الزمنية؟",
    condition: "If short-term gain harms long-term position",
    conditionAr: "إذا المكسب قصير المدى يضر بالموقع طويل المدى",
    action: "Reject",
    actionAr: "ارفض"
  },
  {
    id: 3,
    question: "Does this break a Red Line?",
    questionAr: "هل هذا يكسر خطاً أحمر؟",
    condition: "If yes",
    conditionAr: "إذا نعم",
    action: "Reject immediately",
    actionAr: "ارفض فوراً"
  },
  {
    id: 4,
    question: "Does this require me personally?",
    questionAr: "هل هذا يتطلبني شخصياً؟",
    condition: "If no",
    conditionAr: "إذا لا",
    action: "Delegate",
    actionAr: "فوّض"
  },
  {
    id: 5,
    question: "Will this matter in 12 months?",
    questionAr: "هل هذا سيهم بعد 12 شهراً؟",
    condition: "If no",
    conditionAr: "إذا لا",
    action: "Deprioritize",
    actionAr: "قلل أولويته"
  }
];

export const priorityRule = {
  title: "Daily Priority Rule",
  titleAr: "قاعدة الأولوية اليومية",
  statement: "ONLY 3 DECISIONS PER DAY ARE STRATEGIC.",
  statementAr: "3 قرارات فقط يومياً استراتيجية.",
  subStatement: "Everything else is noise.",
  subStatementAr: "كل شيء آخر ضوضاء."
};

export const energyProtection = {
  title: "Daily Energy Protection",
  titleAr: "حماية الطاقة اليومية",
  noDecisionUnder: [
    { condition: "Fatigue", conditionAr: "الإرهاق" },
    { condition: "Pressure", conditionAr: "الضغط" },
    { condition: "Emotional spikes", conditionAr: "الارتفاعات العاطفية" }
  ],
  rules: [
    { rule: "If emotional → Delay.", ruleAr: "إذا عاطفي → أجّل." },
    { rule: "If unclear → Ask War Room.", ruleAr: "إذا غير واضح → اسأل غرفة القيادة." },
    { rule: "If rushed → Slow down.", ruleAr: "إذا مستعجل → أبطئ." }
  ]
};

export const dailyReview = {
  title: "Daily Review (End of Day)",
  titleAr: "المراجعة اليومية (نهاية اليوم)",
  questions: [
    { question: "What decisions were made?", questionAr: "ما القرارات التي اتُخذت؟" },
    { question: "Did any reduce control?", questionAr: "هل أي منها قلل السيطرة؟" },
    { question: "Did any accelerate incorrectly?", questionAr: "هل أي منها سرّع بشكل خاطئ؟" },
    { question: "What can be delegated tomorrow?", questionAr: "ما الذي يمكن تفويضه غداً؟" }
  ],
  note: "LOG ONLY INSIGHTS, NOT DETAILS.",
  noteAr: "سجّل الرؤى فقط، ليس التفاصيل."
};

export const absoluteRules = {
  title: "Absolute Founder Rules",
  titleAr: "قواعد المؤسس المطلقة",
  rules: [
    { rule: "You do not explain yourself repeatedly", ruleAr: "لا تفسر نفسك مراراً" },
    { rule: "You do not debate your authority", ruleAr: "لا تناقش سلطتك" },
    { rule: "You do not rush for approval", ruleAr: "لا تستعجل للحصول على موافقة" },
    { rule: "You protect the vision, not the comfort", ruleAr: "تحمي الرؤية، ليس الراحة" }
  ]
};

export const founderFrameworkMeta = {
  title: "Founder Daily Decision Framework™",
  titleAr: "إطار قرارات المؤسس اليومية™",
  target: "Founder Only",
  targetAr: "المؤسس فقط",
  mode: "Daily Use",
  modeAr: "استخدام يومي",
  classification: "FOUNDER / PRIVATE",
  classificationAr: "المؤسس / خاص"
};
