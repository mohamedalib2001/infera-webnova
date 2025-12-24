// INFERA Contact Us - Sovereign Version
// اتصل بنا - النسخة السيادية

export interface ContactChannel {
  id: string;
  title: string;
  titleAr: string;
  email: string;
}

export const contactIntro = {
  statement: "INFERA operates under a controlled access and governance model. All communications are handled through official, validated, and purpose-specific channels.",
  statementAr: "INFERA تعمل تحت نموذج وصول وحوكمة مُتحكم به. جميع الاتصالات تُعالج عبر قنوات رسمية ومُصادق عليها ومخصصة للغرض."
};

export const contactChannels: ContactChannel[] = [
  {
    id: "general",
    title: "General Inquiries",
    titleAr: "الاستفسارات العامة",
    email: "contact@infera.com"
  },
  {
    id: "legal",
    title: "Legal & Compliance",
    titleAr: "الشؤون القانونية والامتثال",
    email: "legal@infera.com"
  },
  {
    id: "privacy",
    title: "Privacy & Data Protection",
    titleAr: "الخصوصية وحماية البيانات",
    email: "privacy@infera.com"
  },
  {
    id: "ai",
    title: "AI Governance",
    titleAr: "حوكمة الذكاء الاصطناعي",
    email: "ai-governance@infera.com"
  },
  {
    id: "billing",
    title: "Billing & Financial Matters",
    titleAr: "الفواتير والشؤون المالية",
    email: "billing@infera.com"
  }
];

export const accessPolicy = {
  title: "Access & Response Policy",
  titleAr: "سياسة الوصول والاستجابة",
  items: [
    { text: "All inquiries are logged and reviewed.", textAr: "جميع الاستفسارات مُسجلة ومُراجعة." },
    { text: "Responses are provided based on relevance, authorization, and governance priority.", textAr: "الردود تُقدم بناءً على الصلة والتفويض وأولوية الحوكمة." },
    { text: "Not all inquiries receive a response.", textAr: "ليس كل الاستفسارات تتلقى رداً." },
    { text: "Unverified, unsolicited, or non-aligned requests may be ignored without notice.", textAr: "الطلبات غير المتحقق منها أو غير المطلوبة أو غير المتوافقة قد تُتجاهل دون إشعار." }
  ]
};

export const securityNotice = {
  title: "Security Notice",
  titleAr: "إشعار أمني",
  warning: "Do NOT submit:",
  warningAr: "لا تُرسل:",
  items: [
    { text: "Sensitive personal data", textAr: "بيانات شخصية حساسة" },
    { text: "Credentials or access keys", textAr: "بيانات اعتماد أو مفاتيح وصول" },
    { text: "Confidential government information", textAr: "معلومات حكومية سرية" }
  ],
  note: "INFERA will never request such information through unsolicited communication.",
  noteAr: "INFERA لن تطلب مثل هذه المعلومات عبر اتصال غير مطلوب."
};

export const governanceNotice = {
  title: "Governance Notice",
  titleAr: "إشعار الحوكمة",
  intro: "Contacting INFERA does not:",
  introAr: "التواصل مع INFERA لا:",
  items: [
    { text: "Grant access to platforms", textAr: "يمنح الوصول للمنصات" },
    { text: "Create contractual obligations", textAr: "ينشئ التزامات تعاقدية" },
    { text: "Guarantee partnership or engagement", textAr: "يضمن شراكة أو تعامل" }
  ],
  note: "All access and engagement require formal approval.",
  noteAr: "جميع عمليات الوصول والتعامل تتطلب موافقة رسمية."
};

export const contactClosing = {
  statement: "INFERA communicates deliberately, securely, and with purpose.",
  statementAr: "INFERA تتواصل بشكل متعمد وآمن وهادف."
};

export const contactMeta = {
  title: "Contact Us",
  titleAr: "اتصل بنا",
  subtitle: "Official Contact Channels",
  subtitleAr: "قنوات التواصل الرسمية"
};
