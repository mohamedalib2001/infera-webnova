// INFERA Operational Launch Checklist™
// قائمة التحقق التشغيلية للإطلاق™

export interface ChecklistItem {
  task: string;
  taskAr: string;
  completed: boolean;
}

export interface LaunchPhase {
  id: string;
  days: string;
  daysAr: string;
  name: string;
  nameAr: string;
  items: ChecklistItem[];
  successCondition: string;
  successConditionAr: string;
  status: "completed" | "active" | "upcoming" | "locked";
}

export const launchPrinciple = {
  title: "Launch Principle",
  titleAr: "مبدأ الإطلاق",
  statement: "Launch is an operation, not an event.",
  statementAr: "الإطلاق عملية، ليس حدثاً.",
  subStatement: "Every day has one objective only.",
  subStatementAr: "كل يوم له هدف واحد فقط."
};

export const launchPhases: LaunchPhase[] = [
  {
    id: "lockdown",
    days: "Day -14 to Day -7",
    daysAr: "اليوم -14 إلى اليوم -7",
    name: "Final Lockdown Phase",
    nameAr: "مرحلة الإغلاق النهائي",
    items: [
      { task: "Freeze core architecture (NO changes without override)", taskAr: "تجميد الهندسة الأساسية (لا تغييرات بدون تجاوز)", completed: false },
      { task: "Finalize Governance Policies", taskAr: "إنهاء سياسات الحوكمة", completed: false },
      { task: "Activate Policy Validator AI (Hard Mode)", taskAr: "تفعيل مدقق السياسات الذكي (الوضع الصارم)", completed: false },
      { task: "Lock Board Documents", taskAr: "قفل وثائق المجلس", completed: false },
      { task: "Lock Government Confidential Pack", taskAr: "قفل الحزمة الحكومية السرية", completed: false },
      { task: "Final Access Matrix enforcement", taskAr: "تطبيق مصفوفة الوصول النهائية", completed: false },
      { task: "Dry-run crisis simulations internally", taskAr: "محاكاة أزمات تجريبية داخلياً", completed: false }
    ],
    successCondition: "No ambiguity. No open decisions.",
    successConditionAr: "لا غموض. لا قرارات مفتوحة.",
    status: "upcoming"
  },
  {
    id: "alignment",
    days: "Day -6 to Day -3",
    daysAr: "اليوم -6 إلى اليوم -3",
    name: "Internal Alignment Phase",
    nameAr: "مرحلة المواءمة الداخلية",
    items: [
      { task: "Brief Founder & Core Leadership", taskAr: "إحاطة المؤسس والقيادة الأساسية", completed: false },
      { task: "Reconfirm Red Line Rules", taskAr: "إعادة تأكيد قواعد الخطوط الحمراء", completed: false },
      { task: "Assign single spokesperson per audience", taskAr: "تعيين متحدث واحد لكل جمهور", completed: false },
      { task: "Finalize Launch Sequencing visibility rules", taskAr: "إنهاء قواعد رؤية تسلسل الإطلاق", completed: false },
      { task: "Audit all access permissions", taskAr: "تدقيق جميع أذونات الوصول", completed: false },
      { task: "Prepare secure communication channels", taskAr: "إعداد قنوات اتصال آمنة", completed: false }
    ],
    successCondition: "Everyone knows ONLY what they must know.",
    successConditionAr: "الجميع يعرف فقط ما يجب أن يعرفه.",
    status: "locked"
  },
  {
    id: "soft-signal",
    days: "Day -2",
    daysAr: "اليوم -2",
    name: "Soft Signal Day",
    nameAr: "يوم الإشارة الناعمة",
    items: [
      { task: "Private signals to Board & Sovereign Funds", taskAr: "إشارات خاصة للمجلس وصناديق السيادة", completed: false },
      { task: "No documents shared yet", taskAr: "لا مشاركة وثائق بعد", completed: false },
      { task: "Positioning conversations only", taskAr: "محادثات تموضع فقط", completed: false },
      { task: "Validate perception alignment", taskAr: "التحقق من مواءمة الإدراك", completed: false }
    ],
    successCondition: "Interest without pressure.",
    successConditionAr: "اهتمام بدون ضغط.",
    status: "locked"
  },
  {
    id: "silent-readiness",
    days: "Day -1",
    daysAr: "اليوم -1",
    name: "Silent Readiness Day",
    nameAr: "يوم الجهوزية الصامتة",
    items: [
      { task: "No outbound communication", taskAr: "لا اتصالات صادرة", completed: false },
      { task: "Systems monitored only", taskAr: "مراقبة الأنظمة فقط", completed: false },
      { task: "Crisis response team on standby", taskAr: "فريق الاستجابة للأزمات في حالة استعداد", completed: false },
      { task: "Founder unavailable publicly", taskAr: "المؤسس غير متاح علنياً", completed: false }
    ],
    successCondition: "Silence + readiness.",
    successConditionAr: "صمت + جهوزية.",
    status: "locked"
  },
  {
    id: "reveal",
    days: "Day 0",
    daysAr: "اليوم 0",
    name: "Controlled Reveal Day",
    nameAr: "يوم الكشف المحكوم",
    items: [
      { task: "Execute Phase 1 of Launch Sequencing", taskAr: "تنفيذ المرحلة 1 من تسلسل الإطلاق", completed: false },
      { task: "Share Board-Level Documents ONLY", taskAr: "مشاركة وثائق مستوى المجلس فقط", completed: false },
      { task: "No demos", taskAr: "لا عروض توضيحية", completed: false },
      { task: "No public statements", taskAr: "لا بيانات عامة", completed: false },
      { task: "No press", taskAr: "لا صحافة", completed: false }
    ],
    successCondition: "Strategic buy-in without noise.",
    successConditionAr: "دعم استراتيجي بدون ضوضاء.",
    status: "locked"
  },
  {
    id: "stability",
    days: "Day +1 to Day +7",
    daysAr: "اليوم +1 إلى اليوم +7",
    name: "Stability Window",
    nameAr: "نافذة الاستقرار",
    items: [
      { task: "Monitor reactions", taskAr: "مراقبة ردود الفعل", completed: false },
      { task: "No feature changes", taskAr: "لا تغييرات في الميزات", completed: false },
      { task: "No narrative shifts", taskAr: "لا تحولات في السردية", completed: false },
      { task: "Address questions privately", taskAr: "الرد على الأسئلة بشكل خاص", completed: false },
      { task: "Log all feedback", taskAr: "تسجيل جميع الملاحظات", completed: false }
    ],
    successCondition: "Control maintained. No escalation.",
    successConditionAr: "السيطرة مستمرة. لا تصعيد.",
    status: "locked"
  },
  {
    id: "government-window",
    days: "Day +8 to Day +21",
    daysAr: "اليوم +8 إلى اليوم +21",
    name: "Government Confidential Window",
    nameAr: "نافذة الحكومة السرية",
    items: [
      { task: "Execute Phase 2 of Launch Sequencing", taskAr: "تنفيذ المرحلة 2 من تسلسل الإطلاق", completed: false },
      { task: "Share Government Confidential Pack selectively", taskAr: "مشاركة الحزمة الحكومية السرية بشكل انتقائي", completed: false },
      { task: "Initiate pilot discussions", taskAr: "بدء مناقشات التجريب", completed: false },
      { task: "Maintain strict narrative firewall", taskAr: "الحفاظ على جدار السردية الصارم", completed: false }
    ],
    successCondition: "Trust formation without exposure.",
    successConditionAr: "تشكيل الثقة بدون انكشاف.",
    status: "locked"
  },
  {
    id: "pilot-window",
    days: "Day +22 to Day +45",
    daysAr: "اليوم +22 إلى اليوم +45",
    name: "Pilot Deployment Window",
    nameAr: "نافذة نشر التجريب",
    items: [
      { task: "Launch limited pilots", taskAr: "إطلاق تجارب محدودة", completed: false },
      { task: "Enforce minimal scope", taskAr: "تطبيق نطاق محدود", completed: false },
      { task: "Collect operational intelligence", taskAr: "جمع الاستخبارات التشغيلية", completed: false },
      { task: "No marketing activity", taskAr: "لا نشاط تسويقي", completed: false }
    ],
    successCondition: "Proof without publicity.",
    successConditionAr: "إثبات بدون دعاية.",
    status: "locked"
  }
];

export const finalRule = {
  condition: "If pressure accelerates timeline → SLOW DOWN.",
  conditionAr: "إذا سرّع الضغط الجدول الزمني → أبطئ.",
  statement: "Speed is the enemy of sovereignty.",
  statementAr: "السرعة عدو السيادة."
};

export const checklistMeta = {
  title: "Operational Launch Checklist™",
  titleAr: "قائمة التحقق التشغيلية للإطلاق™",
  target: "Execution Office / War Room",
  targetAr: "مكتب التنفيذ / غرفة العمليات",
  mode: "Day-by-Day Controlled Launch",
  modeAr: "إطلاق محكوم يوماً بيوم",
  classification: "OPERATIONAL / RESTRICTED",
  classificationAr: "تشغيلي / محدود"
};
