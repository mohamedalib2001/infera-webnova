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
  statementAr: "تعمل INFERA وفق نموذج تواصل خاضع للحوكمة والوصول المصرّح به فقط. تتم معالجة جميع الاتصالات من خلال قنوات رسمية ومعتمدة وبحسب الأولوية والاختصاص."
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
    titleAr: "الشؤون المالية والفوترة",
    email: "billing@infera.com"
  }
];

export const accessPolicy = {
  title: "Response Policy",
  titleAr: "سياسة الاستجابة",
  items: [
    { text: "All inquiries are logged and reviewed.", textAr: "يتم تسجيل جميع المراسلات ومراجعتها." },
    { text: "Responses are provided based on relevance, authorization, and governance priority.", textAr: "تُقدّم الردود بناءً على الصلة، ومستوى التفويض، وأولوية الحوكمة." },
    { text: "Not all inquiries receive a response.", textAr: "لا تلتزم INFERA بالرد على جميع الطلبات." },
    { text: "Unverified, unsolicited, or non-aligned requests may be ignored without notice.", textAr: "قد يتم تجاهل الطلبات غير المصرّح بها أو غير المتوافقة مع توجه المنظومة دون إشعار مسبق." }
  ]
};

export const securityNotice = {
  title: "Security Notice",
  titleAr: "تنبيه أمني",
  warning: "Do NOT submit:",
  warningAr: "يُحظر إرسال:",
  items: [
    { text: "Sensitive personal data", textAr: "بيانات شخصية حساسة" },
    { text: "Credentials or access keys", textAr: "بيانات دخول أو مفاتيح وصول" },
    { text: "Confidential government information", textAr: "معلومات حكومية أو سيادية سرية" }
  ],
  note: "INFERA will never request such information through unsolicited communication.",
  noteAr: "لن تطلب INFERA هذه المعلومات عبر أي تواصل غير مُبادَر به رسميًا."
};

export const governanceNotice = {
  title: "Governance Notice",
  titleAr: "تنويه حوكمي",
  intro: "Contacting INFERA does not:",
  introAr: "إن التواصل مع INFERA لا يعني:",
  items: [
    { text: "Grant access to platforms", textAr: "منح حق الوصول إلى أي منصة" },
    { text: "Create contractual obligations", textAr: "إنشاء التزام تعاقدي" },
    { text: "Guarantee partnership or engagement", textAr: "ضمان شراكة أو تعاون" }
  ],
  note: "All access and engagement require formal approval.",
  noteAr: "يخضع أي تعامل لموافقات رسمية وإجراءات معتمدة."
};

export const contactClosing = {
  statement: "INFERA communicates deliberately, securely, and with purpose.",
  statementAr: "تتواصل INFERA بهدوء، وبأمان، وبغرض واضح فقط."
};

export const contactMeta = {
  title: "Contact Us",
  titleAr: "تواصل معنا",
  subtitle: "Official Contact Channels",
  subtitleAr: "قنوات التواصل الرسمية"
};
