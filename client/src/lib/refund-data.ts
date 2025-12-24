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
  statementAr: "INFERA تعمل كبنية تحتية رقمية سيادية. وبناءً على ذلك، تُحكم سياسات الاسترداد بنوع الوصول ونطاق الخدمة والاتفاقيات التعاقدية."
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
      "INFERA لا تعمل كخدمة استهلاكية.",
      "معظم الخدمات تُوفر بناءً على الوصول المعتمد والتكوين وإعداد الحوكمة.",
      "الاسترداد لذلك محدود ومشروط."
    ]
  },
  {
    id: "non-refundable",
    number: 2,
    title: "Non-Refundable Services",
    titleAr: "الخدمات غير القابلة للاسترداد",
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
      "التالي غير قابل للاسترداد بشكل صارم:",
      "التراخيص السيادية أو المؤسسية",
      "المنصات أو الوحدات المفعّلة",
      "التكوينات أو عمليات النشر المخصصة",
      "البيئات التجريبية بمجرد تفعيلها",
      "الخدمات القائمة على الاستخدام أو الاستهلاك",
      "الخدمات التي تتضمن تهيئة أو تدريب نموذج الذكاء الاصطناعي",
      "بمجرد منح الوصول أو تفعيل النظام، تُعتبر الخدمة مُسلّمة."
    ]
  },
  {
    id: "conditional",
    number: 3,
    title: "Conditional Refunds",
    titleAr: "الاسترداد المشروط",
    content: [
      "Refunds may be considered ONLY if:",
      "Access was granted in error",
      "Payment was duplicated",
      "A technical failure on INFERA's side prevented initial access entirely",
      "Any refund request must be submitted within a defined review window and is subject to validation."
    ],
    contentAr: [
      "قد يُنظر في الاسترداد فقط إذا:",
      "تم منح الوصول عن طريق الخطأ",
      "تم تكرار الدفع",
      "فشل تقني من جانب INFERA منع الوصول الأولي بالكامل",
      "أي طلب استرداد يجب تقديمه خلال نافذة مراجعة محددة ويخضع للتحقق."
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
      "جميع طلبات الاسترداد: تُراجع يدوياً، تُقيّم وفق قواعد الحوكمة والأمن، تُوافق أو تُرفض وفق تقدير INFERA وحده.",
      "الموافقة على طلب واحد لا تُنشئ سابقة."
    ]
  },
  {
    id: "termination",
    number: 5,
    title: "Termination & Suspension",
    titleAr: "الإنهاء والتعليق",
    content: [
      "Account suspension or termination due to policy violations, security concerns, or governance decisions does not entitle the user to a refund."
    ],
    contentAr: [
      "تعليق أو إنهاء الحساب بسبب انتهاكات السياسة أو المخاوف الأمنية أو قرارات الحوكمة لا يُخوّل المستخدم الاسترداد."
    ]
  },
  {
    id: "contractual",
    number: 6,
    title: "Contractual Overrides",
    titleAr: "التجاوزات التعاقدية",
    content: [
      "If a separate written agreement exists (e.g., enterprise or government contract), refund terms in that agreement override this policy."
    ],
    contentAr: [
      "إذا وُجدت اتفاقية مكتوبة منفصلة (مثل عقد مؤسسي أو حكومي)، فإن شروط الاسترداد في تلك الاتفاقية تتجاوز هذه السياسة."
    ]
  },
  {
    id: "process",
    number: 7,
    title: "Process & Contact",
    titleAr: "العملية والتواصل",
    content: [
      "Refund requests must be submitted through: billing@infera.com",
      "Requests must include: Account identifier, Service details, Reason for request.",
      "Incomplete requests may not be reviewed."
    ],
    contentAr: [
      "طلبات الاسترداد يجب تقديمها عبر: billing@infera.com",
      "الطلبات يجب أن تتضمن: معرف الحساب، تفاصيل الخدمة، سبب الطلب.",
      "الطلبات غير المكتملة قد لا تُراجع."
    ]
  }
];

export const refundClosing = {
  statement: "INFERA prioritizes governance integrity and system stability over transactional convenience.",
  statementAr: "INFERA تُعطي الأولوية لنزاهة الحوكمة واستقرار النظام على الراحة التعاملية."
};

export const refundMeta = {
  title: "Refund Policy",
  titleAr: "سياسة الاسترداد",
  subtitle: "Sovereign Refund Policy",
  subtitleAr: "سياسة استرداد سيادية"
};
