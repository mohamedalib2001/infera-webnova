// INFERA Stakeholder Access Matrix™
// مصفوفة وصول أصحاب المصلحة™

export interface StakeholderCategory {
  id: string;
  level: number;
  name: string;
  nameAr: string;
  accessItems: string[];
  accessItemsAr: string[];
  noAccessItems: string[];
  noAccessItemsAr: string[];
  decisionPower: string[];
  decisionPowerAr: string[];
  riskLevel: "none" | "low" | "medium" | "high" | "absolute";
}

export const stakeholderCategories: StakeholderCategory[] = [
  {
    id: "founder",
    level: 1,
    name: "Founder / Sovereign Leadership",
    nameAr: "المؤسس / القيادة السيادية",
    accessItems: [
      "Full ecosystem",
      "All platforms",
      "All policies",
      "All narratives",
      "All override rights"
    ],
    accessItemsAr: [
      "النظام البيئي الكامل",
      "جميع المنصات",
      "جميع السياسات",
      "جميع السرديات",
      "جميع حقوق التجاوز"
    ],
    noAccessItems: [],
    noAccessItemsAr: [],
    decisionPower: ["Absolute"],
    decisionPowerAr: ["مطلقة"],
    riskLevel: "absolute"
  },
  {
    id: "board",
    level: 2,
    name: "Board Members",
    nameAr: "أعضاء مجلس الإدارة",
    accessItems: [
      "Board-Level Documents",
      "Economic Engine",
      "Time Dominance (Board)",
      "Crisis Playbook (Board)"
    ],
    accessItemsAr: [
      "وثائق مستوى مجلس الإدارة",
      "المحرك الاقتصادي",
      "الهيمنة الزمنية (المجلس)",
      "كتيب الأزمات (المجلس)"
    ],
    noAccessItems: [
      "Government adoption internals",
      "Operational execution details"
    ],
    noAccessItemsAr: [
      "داخليات التبني الحكومي",
      "تفاصيل التنفيذ التشغيلي"
    ],
    decisionPower: [
      "Strategic direction",
      "Capital patience",
      "Red line enforcement"
    ],
    decisionPowerAr: [
      "الاتجاه الاستراتيجي",
      "صبر رأس المال",
      "تطبيق الخطوط الحمراء"
    ],
    riskLevel: "high"
  },
  {
    id: "sovereign-funds",
    level: 3,
    name: "Sovereign Funds / Strategic Investors",
    nameAr: "صناديق السيادة / المستثمرون الاستراتيجيون",
    accessItems: [
      "Board Strategic Overview",
      "Select platform vision",
      "Long-term positioning"
    ],
    accessItemsAr: [
      "النظرة الاستراتيجية للمجلس",
      "رؤية منصات مختارة",
      "التموضع طويل المدى"
    ],
    noAccessItems: [
      "Government confidential material",
      "Technical internals"
    ],
    noAccessItemsAr: [
      "المواد الحكومية السرية",
      "الداخليات التقنية"
    ],
    decisionPower: [
      "Capital allocation",
      "Strategic support"
    ],
    decisionPowerAr: [
      "تخصيص رأس المال",
      "الدعم الاستراتيجي"
    ],
    riskLevel: "high"
  },
  {
    id: "government",
    level: 4,
    name: "Government / National Authorities",
    nameAr: "الحكومة / السلطات الوطنية",
    accessItems: [
      "Government Confidential Pack",
      "Governance & Control Assurance",
      "Crisis Resilience (Gov)"
    ],
    accessItemsAr: [
      "الحزمة الحكومية السرية",
      "ضمان الحوكمة والتحكم",
      "مرونة الأزمات (الحكومية)"
    ],
    noAccessItems: [
      "Exit strategy",
      "Revenue models",
      "Board narratives"
    ],
    noAccessItemsAr: [
      "استراتيجية الخروج",
      "نماذج الإيرادات",
      "سرديات المجلس"
    ],
    decisionPower: [
      "Adoption",
      "Regulation alignment",
      "National deployment scope"
    ],
    decisionPowerAr: [
      "التبني",
      "مواءمة التنظيمات",
      "نطاق النشر الوطني"
    ],
    riskLevel: "medium"
  },
  {
    id: "partners",
    level: 5,
    name: "Strategic Partners",
    nameAr: "الشركاء الاستراتيجيون",
    accessItems: [
      "Integration scope only",
      "Limited platform interaction",
      "Governance boundaries"
    ],
    accessItemsAr: [
      "نطاق التكامل فقط",
      "تفاعل محدود مع المنصة",
      "حدود الحوكمة"
    ],
    noAccessItems: [
      "Core engine",
      "Policy validator",
      "Strategic narratives"
    ],
    noAccessItemsAr: [
      "المحرك الأساسي",
      "مدقق السياسات",
      "السرديات الاستراتيجية"
    ],
    decisionPower: [
      "Delivery within limits only"
    ],
    decisionPowerAr: [
      "التسليم ضمن الحدود فقط"
    ],
    riskLevel: "low"
  },
  {
    id: "enterprise",
    level: 6,
    name: "Enterprise Customers",
    nameAr: "عملاء المؤسسات",
    accessItems: [
      "Platform-specific functionality",
      "Operational dashboards"
    ],
    accessItemsAr: [
      "وظائف خاصة بالمنصة",
      "لوحات تحكم تشغيلية"
    ],
    noAccessItems: [
      "Ecosystem strategy",
      "Other platforms",
      "Governance internals"
    ],
    noAccessItemsAr: [
      "استراتيجية النظام البيئي",
      "المنصات الأخرى",
      "داخليات الحوكمة"
    ],
    decisionPower: [
      "Usage only"
    ],
    decisionPowerAr: [
      "الاستخدام فقط"
    ],
    riskLevel: "low"
  },
  {
    id: "public",
    level: 7,
    name: "Public / Media",
    nameAr: "العامة / الإعلام",
    accessItems: [
      "Vision statements",
      "High-level positioning"
    ],
    accessItemsAr: [
      "بيانات الرؤية",
      "التموضع العام"
    ],
    noAccessItems: [
      "Anything operational or strategic"
    ],
    noAccessItemsAr: [
      "أي شيء تشغيلي أو استراتيجي"
    ],
    decisionPower: [
      "None"
    ],
    decisionPowerAr: [
      "لا شيء"
    ],
    riskLevel: "none"
  }
];

export const accessRules = {
  title: "Access Rules",
  titleAr: "قواعد الوصول",
  rules: [
    {
      rule: "Access is role-based, not relationship-based",
      ruleAr: "الوصول قائم على الدور، ليس على العلاقة"
    },
    {
      rule: "No exceptions under pressure",
      ruleAr: "لا استثناءات تحت الضغط"
    },
    {
      rule: "Temporary access expires automatically",
      ruleAr: "الوصول المؤقت ينتهي تلقائياً"
    },
    {
      rule: "All access logged and auditable",
      ruleAr: "جميع عمليات الوصول مسجلة وقابلة للتدقيق"
    }
  ],
  violationRule: "Unauthorized visibility = strategic breach.",
  violationRuleAr: "الرؤية غير المصرح بها = خرق استراتيجي."
};

export const accessMatrixMeta = {
  title: "Stakeholder Access Matrix™",
  titleAr: "مصفوفة وصول أصحاب المصلحة™",
  target: "Governance AI / Strategic Office",
  targetAr: "الذكاء الاصطناعي للحوكمة / المكتب الاستراتيجي",
  objective: "Enforce strict access control based on role, risk, and strategic value",
  objectiveAr: "تطبيق تحكم صارم بالوصول بناءً على الدور والمخاطر والقيمة الاستراتيجية",
  classification: "GOVERNANCE / RESTRICTED",
  classificationAr: "حوكمة / محدود"
};
