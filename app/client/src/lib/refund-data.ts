// INFERA Refund Policy - Sovereign Version
// سياسة الاسترداد - النسخة السيادية

export interface RefundSection {
  id: string;
  number: number;
  title: string;
  titleAr: string;
  content: string[];
  contentAr: string[];
}

export const refundIntro = {
  lastUpdated: "December 2024",
  lastUpdatedAr: "ديسمبر 2024",
  statement: "INFERA operates as a sovereign digital infrastructure. Accordingly, refund policies are governed by access type, service scope, and contractual agreements.",
  statementAr: "تعمل INFERA كبنية تحتية رقمية سيادية، وبناءً عليه تخضع سياسات الاسترجاع لطبيعة الوصول، ونطاق الخدمة، والاتفاقيات التعاقدية المعتمدة."
};

export const refundSections: RefundSection[] = [
  {
    id: "general",
    number: 1,
    title: "General Principle",
    titleAr: "المبدأ العام",
    content: [
      "INFERA does not operate as a consumer service.",
      "Most services are provisioned based on approved access, configuration, and governance setup.",
      "Refunds are therefore limited and conditional."
    ],
    contentAr: [
      "لا تُعد INFERA خدمة استهلاكية عامة.",
      "يتم توفير معظم الخدمات بناءً على موافقات مسبقة وتهيئة حوكمية وتقنية خاصة.",
      "وبالتالي، فإن عمليات الاسترجاع محدودة وتخضع لشروط صارمة."
    ]
  },
  {
    id: "non-refundable",
    number: 2,
    title: "Non-Refundable Services",
    titleAr: "الخدمات غير القابلة للاسترجاع",
    content: [
      "The following are strictly non-refundable:",
      "Sovereign or enterprise licenses",
      "Activated platforms or modules",
      "Custom configurations or deployments",
      "Pilot environments once activated",
      "Usage-based or consumption-based services",
      "Services involving AI model initialization or training",
      "Once access is granted or a system is activated, the service is considered delivered."
    ],
    contentAr: [
      "تُعد الخدمات التالية غير قابلة للاسترجاع بشكل نهائي:",
      "التراخيص السيادية أو المؤسسية",
      "الوحدات أو المنصات التي تم تفعيلها",
      "الإعدادات أو التخصيصات الخاصة",
      "بيئات التشغيل التجريبية بعد تفعيلها",
      "الخدمات القائمة على الاستهلاك أو الاستخدام",
      "أي خدمة تتضمن تهيئة أو تدريب نماذج ذكاء اصطناعي",
      "بمجرد منح الوصول أو تفعيل النظام، تُعد الخدمة مقدّمة بالكامل."
    ]
  },
  {
    id: "conditional",
    number: 3,
    title: "Conditional Refunds",
    titleAr: "حالات الاسترجاع المشروط",
    content: [
      "Refunds may be considered ONLY if:",
      "Access was granted in error",
      "Payment was duplicated",
      "A technical failure on INFERA's side prevented initial access entirely",
      "Any refund request must be submitted within a defined review window and is subject to validation."
    ],
    contentAr: [
      "قد يتم النظر في طلبات الاسترجاع فقط في الحالات التالية:",
      "منح الوصول عن طريق الخطأ",
      "تكرار عملية الدفع",
      "وجود خلل تقني من جانب INFERA حال دون الوصول الأولي للخدمة بشكل كامل",
      "يجب تقديم طلب الاسترجاع خلال فترة مراجعة محددة ويخضع الطلب للتدقيق والتحقق."
    ]
  },
  {
    id: "review",
    number: 4,
    title: "Review & Approval",
    titleAr: "المراجعة والموافقة",
    content: [
      "All refund requests are: Reviewed manually, Assessed under governance and security rules, Approved or rejected at INFERA's sole discretion.",
      "Approval of one request does not establish precedent."
    ],
    contentAr: [
      "تخضع جميع طلبات الاسترجاع لما يلي: مراجعة يدوية، تقييم وفق سياسات الحوكمة والأمن، قبول أو رفض حسب تقدير INFERA المطلق.",
      "ولا يُعد قبول أي طلب سابقة أو التزامًا مستقبليًا."
    ]
  },
  {
    id: "termination",
    number: 5,
    title: "Termination & Suspension",
    titleAr: "التعليق أو الإنهاء",
    content: [
      "Account suspension or termination due to policy violations, security concerns, or governance decisions does not entitle the user to a refund."
    ],
    contentAr: [
      "لا يترتب على تعليق أو إنهاء الحساب بسبب مخالفة السياسات أو المخاطر الأمنية أو قرارات الحوكمة أي حق في الاسترجاع."
    ]
  },
  {
    id: "contractual",
    number: 6,
    title: "Contractual Overrides",
    titleAr: "أولوية الاتفاقيات التعاقدية",
    content: [
      "If a separate written agreement exists (e.g., enterprise or government contract), refund terms in that agreement override this policy."
    ],
    contentAr: [
      "في حال وجود اتفاقية مكتوبة منفصلة (مثل عقود الجهات الحكومية أو المؤسسات)، تسري شروط الاسترجاع الواردة فيها بدلًا من هذه السياسة."
    ]
  },
  {
    id: "process",
    number: 7,
    title: "Process & Contact",
    titleAr: "آلية تقديم الطلبات",
    content: [
      "Refund requests must be submitted through: billing@infera.com",
      "Requests must include: Account identifier, Service details, Reason for request.",
      "Incomplete requests may not be reviewed."
    ],
    contentAr: [
      "يجب إرسال طلبات الاسترجاع إلى: billing@infera.com",
      "ويجب أن يتضمن الطلب: معرف الحساب، تفاصيل الخدمة، سبب طلب الاسترجاع.",
      "قد لا يتم النظر في الطلبات غير المكتملة."
    ]
  }
];

export const refundClosing = {
  statement: "INFERA prioritizes governance integrity and system stability over transactional convenience.",
  statementAr: "تعطي INFERA الأولوية لسلامة الحوكمة واستقرار المنظومة على حساب الراحة الإجرائية."
};

export const refundMeta = {
  title: "Refund Policy",
  titleAr: "سياسة الاسترجاع",
  subtitle: "Sovereign Refund Policy",
  subtitleAr: "سياسة استرجاع سيادية"
};
