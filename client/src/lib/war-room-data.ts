// INFERA War Room Operating Manual™
// دليل تشغيل غرفة القيادة™

export interface WarRoomMember {
  role: string;
  roleAr: string;
  type: "mandatory" | "optional";
  note?: string;
  noteAr?: string;
}

export interface DecisionStep {
  step: number;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  substeps?: string[];
  substepsAr?: string[];
}

export const warRoomPurpose = {
  title: "Purpose",
  titleAr: "الغرض",
  statement: "The War Room exists to preserve control, clarity, and sovereignty under pressure.",
  statementAr: "غرفة القيادة موجودة للحفاظ على السيطرة والوضوح والسيادة تحت الضغط.",
  activationCondition: "It is activated when stakes are high, timelines compress, or ambiguity increases.",
  activationConditionAr: "تُفعّل عندما تكون المخاطر عالية، أو الجداول الزمنية تنضغط، أو الغموض يزداد."
};

export const activationConditions = {
  activate: {
    title: "Activate War Room When",
    titleAr: "فعّل غرفة القيادة عندما",
    conditions: [
      { condition: "Strategic pressure increases", conditionAr: "يزداد الضغط الاستراتيجي" },
      { condition: "Multiple stakeholders demand decisions", conditionAr: "يطالب أصحاب مصلحة متعددون بقرارات" },
      { condition: "Crisis probability rises", conditionAr: "ترتفع احتمالية الأزمة" },
      { condition: "Launch or adoption phase is active", conditionAr: "مرحلة الإطلاق أو التبني نشطة" },
      { condition: "External noise threatens narrative control", conditionAr: "الضوضاء الخارجية تهدد السيطرة على السردية" }
    ]
  },
  deactivate: {
    title: "Deactivate Only When",
    titleAr: "أوقف التفعيل فقط عندما",
    conditions: [
      { condition: "Stability is restored", conditionAr: "يُستعاد الاستقرار" },
      { condition: "No unresolved strategic decisions exist", conditionAr: "لا توجد قرارات استراتيجية معلقة" }
    ]
  }
};

export const warRoomMembers: WarRoomMember[] = [
  { role: "Founder", roleAr: "المؤسس", type: "mandatory", note: "Final Authority", noteAr: "السلطة النهائية" },
  { role: "Strategic Intelligence Lead", roleAr: "قائد الاستخبارات الاستراتيجية", type: "mandatory" },
  { role: "Governance & Policy Lead", roleAr: "قائد الحوكمة والسياسات", type: "mandatory" },
  { role: "Security / Risk Lead", roleAr: "قائد الأمن / المخاطر", type: "mandatory" },
  { role: "Communication Control Lead", roleAr: "قائد التحكم في الاتصالات", type: "mandatory" },
  { role: "Legal Advisor", roleAr: "المستشار القانوني", type: "optional" },
  { role: "Sovereign Liaison", roleAr: "مسؤول الاتصال السيادي", type: "optional" },
  { role: "Technical Architect", roleAr: "المهندس المعماري التقني", type: "optional", note: "Silent unless asked", noteAr: "صامت إلا إذا سُئل" }
];

export const compositionRule = {
  rule: "No observers. No unnecessary participants.",
  ruleAr: "لا مراقبون. لا مشاركون غير ضروريين."
};

export const decisionFlow: DecisionStep[] = [
  {
    step: 1,
    name: "Define the Question",
    nameAr: "حدد السؤال",
    description: "What decision is required?",
    descriptionAr: "ما القرار المطلوب؟",
    substeps: ["Is it strategic, tactical, or narrative?"],
    substepsAr: ["هل هو استراتيجي، تكتيكي، أم سردي؟"]
  },
  {
    step: 2,
    name: "Classify the Risk",
    nameAr: "صنّف المخاطر",
    description: "Identify the type of risk involved",
    descriptionAr: "حدد نوع المخاطر المتضمنة",
    substeps: ["Sovereignty Risk", "Governance Risk", "Timing Risk", "Trust Risk"],
    substepsAr: ["مخاطر السيادة", "مخاطر الحوكمة", "مخاطر التوقيت", "مخاطر الثقة"]
  },
  {
    step: 3,
    name: "Filter Options",
    nameAr: "فلتر الخيارات",
    description: "Eliminate unacceptable options",
    descriptionAr: "استبعد الخيارات غير المقبولة",
    substeps: ["Eliminate any option that breaks Red Lines", "Eliminate any option that reduces control"],
    substepsAr: ["استبعد أي خيار يكسر الخطوط الحمراء", "استبعد أي خيار يقلل السيطرة"]
  },
  {
    step: 4,
    name: "Decide",
    nameAr: "قرر",
    description: "Founder decides. No voting. No consensus theater.",
    descriptionAr: "المؤسس يقرر. لا تصويت. لا مسرحية إجماع."
  },
  {
    step: 5,
    name: "Execute & Log",
    nameAr: "نفّذ وسجّل",
    description: "Decision executed immediately",
    descriptionAr: "القرار يُنفذ فوراً",
    substeps: ["Decision logged with reasoning", "No retroactive debate"],
    substepsAr: ["القرار يُسجل مع المبررات", "لا نقاش بأثر رجعي"]
  }
];

export const communicationRules = {
  title: "War Room Communication Rules",
  titleAr: "قواعد اتصالات غرفة القيادة",
  rules: [
    { rule: "One voice externally", ruleAr: "صوت واحد خارجياً" },
    { rule: "Silence is preferred over reaction", ruleAr: "الصمت مفضّل على رد الفعل" },
    { rule: "No leaks tolerated", ruleAr: "لا تسريبات مسموحة" },
    { rule: "Internal discussions stay internal", ruleAr: "النقاشات الداخلية تبقى داخلية" }
  ]
};

export const failureRule = {
  title: "Failure Rule",
  titleAr: "قاعدة الفشل",
  statement: "If confusion appears inside the War Room, the War Room pauses external actions until clarity is restored.",
  statementAr: "إذا ظهر الارتباك داخل غرفة القيادة، غرفة القيادة توقف الإجراءات الخارجية حتى يُستعاد الوضوح."
};

export const warRoomMeta = {
  title: "War Room Operating Manual™",
  titleAr: "دليل تشغيل غرفة القيادة™",
  target: "War Room Core Team",
  targetAr: "فريق غرفة القيادة الأساسي",
  mode: "Continuous Operation",
  modeAr: "عمليات مستمرة",
  classification: "WAR ROOM / RESTRICTED",
  classificationAr: "غرفة القيادة / محدود"
};
