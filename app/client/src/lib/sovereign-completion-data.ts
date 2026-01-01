// INFERA Final Sovereign Completion Directive
// Section 1: Economic Engine Model
// Section 2: Go-To-Market Sovereign Playbook
// Section 3: Trust Proof Layer
// Section 4: Founder / Leadership Narrative
// Section 5: Red Line Rules

// =====================================================================
// SECTION 1: ECONOMIC ENGINE MODEL
// =====================================================================

export interface RevenueStream {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  valueDrivers: string[];
  valueDriversAr: string[];
  revenueModel: string;
  revenueModelAr: string;
}

export const revenueStreams: RevenueStream[] = [
  {
    id: "sovereign-licensing",
    name: "Sovereign Licensing",
    nameAr: "الترخيص السيادي",
    description: "National and government-level licensing for complete digital infrastructure control.",
    descriptionAr: "ترخيص على المستوى الوطني والحكومي للتحكم الكامل في البنية التحتية الرقمية.",
    valueDrivers: [
      "Complete digital sovereignty",
      "National security infrastructure",
      "Technology transfer included",
      "Independent evolution capability"
    ],
    valueDriversAr: [
      "سيادة رقمية كاملة",
      "بنية تحتية للأمن القومي",
      "نقل تكنولوجي متضمن",
      "قدرة تطور مستقلة"
    ],
    revenueModel: "Multi-year sovereign agreements with perpetual usage rights and optional support",
    revenueModelAr: "اتفاقيات سيادية متعددة السنوات مع حقوق استخدام دائمة ودعم اختياري"
  },
  {
    id: "enterprise-subscriptions",
    name: "Enterprise Subscriptions",
    nameAr: "اشتراكات المؤسسات",
    description: "Tiered subscription model for enterprise organizations with progressive capability access.",
    descriptionAr: "نموذج اشتراك متدرج للمؤسسات مع وصول تدريجي للقدرات.",
    valueDrivers: [
      "Scalable platform access",
      "AI governance automation",
      "Cross-platform intelligence",
      "Enterprise-grade security"
    ],
    valueDriversAr: [
      "وصول منصة قابل للتوسع",
      "أتمتة حوكمة AI",
      "ذكاء عبر المنصات",
      "أمان بمستوى المؤسسات"
    ],
    revenueModel: "Annual recurring revenue with usage-based scaling",
    revenueModelAr: "إيرادات سنوية متكررة مع تدرج قائم على الاستخدام"
  },
  {
    id: "platform-intelligence",
    name: "Platform Usage Intelligence",
    nameAr: "ذكاء استخدام المنصة",
    description: "AI-driven insights and intelligence services that compound value through usage.",
    descriptionAr: "رؤى وخدمات ذكاء مدعومة بـ AI تضاعف القيمة من خلال الاستخدام.",
    valueDrivers: [
      "Predictive analytics",
      "Behavioral intelligence",
      "Optimization recommendations",
      "Autonomous improvement"
    ],
    valueDriversAr: [
      "تحليلات تنبؤية",
      "ذكاء سلوكي",
      "توصيات تحسين",
      "تحسين ذاتي"
    ],
    revenueModel: "Value-capture pricing based on measurable outcomes and efficiency gains",
    revenueModelAr: "تسعير قائم على استيعاب القيمة بناءً على نتائج قابلة للقياس ومكاسب الكفاءة"
  },
  {
    id: "cross-platform-bundles",
    name: "Cross-Platform Value Bundles",
    nameAr: "حزم القيمة عبر المنصات",
    description: "Bundled platform packages that deliver compound value through integration.",
    descriptionAr: "حزم منصات مجمعة توفر قيمة مركبة من خلال التكامل.",
    valueDrivers: [
      "Unified governance",
      "Shared AI capabilities",
      "Integrated data layer",
      "Ecosystem synergies"
    ],
    valueDriversAr: [
      "حوكمة موحدة",
      "قدرات AI مشتركة",
      "طبقة بيانات متكاملة",
      "تآزر المنظومة"
    ],
    revenueModel: "Bundle pricing with significant discount vs. individual platforms, increasing adoption",
    revenueModelAr: "تسعير الحزم مع خصم كبير مقارنة بالمنصات الفردية، مما يزيد التبني"
  },
  {
    id: "integration-fees",
    name: "Strategic Integration Fees",
    nameAr: "رسوم التكامل الاستراتيجي",
    description: "Custom integration services for enterprise and government deployments.",
    descriptionAr: "خدمات تكامل مخصصة لنشر المؤسسات والحكومات.",
    valueDrivers: [
      "Custom implementation",
      "Legacy system integration",
      "Migration services",
      "Training and enablement"
    ],
    valueDriversAr: [
      "تنفيذ مخصص",
      "تكامل الأنظمة القديمة",
      "خدمات الترحيل",
      "التدريب والتمكين"
    ],
    revenueModel: "Project-based fees with optional ongoing support contracts",
    revenueModelAr: "رسوم قائمة على المشروع مع عقود دعم مستمرة اختيارية"
  }
];

export const valueCompounding = {
  title: "Value Compounding Logic",
  titleAr: "منطق تضاعف القيمة",
  principles: [
    {
      principle: "Each platform increases the value of others",
      principleAr: "كل منصة تزيد من قيمة الأخرى",
      explanation: "21+ platforms share governance, AI, and security. Adding one platform makes all others more valuable through shared intelligence.",
      explanationAr: "21+ منصة تتشارك الحوكمة والذكاء الاصطناعي والأمان. إضافة منصة واحدة تجعل جميع الأخرى أكثر قيمة من خلال الذكاء المشترك."
    },
    {
      principle: "Governance, AI, and Security are shared assets",
      principleAr: "الحوكمة والذكاء الاصطناعي والأمان أصول مشتركة",
      explanation: "Core infrastructure improves across all platforms simultaneously. One security upgrade protects everything. One AI improvement enhances everything.",
      explanationAr: "البنية التحتية الأساسية تتحسن عبر جميع المنصات في وقت واحد. ترقية أمان واحدة تحمي كل شيء. تحسين AI واحد يعزز كل شيء."
    },
    {
      principle: "Switching cost increases over time structurally",
      principleAr: "تكلفة التبديل تزداد بمرور الوقت هيكلياً",
      explanation: "The more platforms adopted, the more integrated the ecosystem becomes. Data, workflows, and governance become unified—switching means rebuilding everything.",
      explanationAr: "كلما زادت المنصات المتبناة، أصبحت المنظومة أكثر تكاملاً. البيانات والعمليات والحوكمة تصبح موحدة—التبديل يعني إعادة بناء كل شيء."
    }
  ]
};

export const pricingPhilosophy = {
  title: "Pricing Philosophy",
  titleAr: "فلسفة التسعير",
  principles: [
    {
      name: "Value-Based, Not Feature-Based",
      nameAr: "قائم على القيمة، وليس على الميزات",
      description: "Pricing reflects outcomes and sovereignty delivered, not feature checklists. Customers pay for capability, not complexity.",
      descriptionAr: "التسعير يعكس النتائج والسيادة المقدمة، وليس قوائم الميزات. العملاء يدفعون للقدرة، وليس للتعقيد."
    },
    {
      name: "Sovereign Premium Justified",
      nameAr: "علاوة السيادة مبررة",
      description: "Premium pricing is justified by complete control, data sovereignty, and strategic independence that no competitor can offer.",
      descriptionAr: "التسعير المتميز مبرر بالتحكم الكامل وسيادة البيانات والاستقلال الاستراتيجي الذي لا يستطيع أي منافس تقديمه."
    },
    {
      name: "No Race-to-Bottom",
      nameAr: "لا سباق نحو القاع",
      description: "INFERA never competes on price. Value justifies premium. Discounting devalues sovereignty.",
      descriptionAr: "INFERA لا تتنافس أبداً على السعر. القيمة تبرر العلاوة. التخفيض يقلل قيمة السيادة."
    }
  ]
};

// =====================================================================
// SECTION 2: GO-TO-MARKET SOVEREIGN PLAYBOOK
// =====================================================================

export interface GTMTrack {
  id: string;
  name: string;
  nameAr: string;
  target: string;
  targetAr: string;
  entry: string;
  entryAr: string;
  strategy: string;
  strategyAr: string;
  keyActivities: string[];
  keyActivitiesAr: string[];
  successMetrics: string[];
  successMetricsAr: string[];
}

export const gtmTracks: GTMTrack[] = [
  {
    id: "enterprise",
    name: "Enterprise Track",
    nameAr: "مسار المؤسسات",
    target: "Large organizations with complex systems",
    targetAr: "المنظمات الكبيرة ذات الأنظمة المعقدة",
    entry: "Single platform → ecosystem expansion",
    entryAr: "منصة واحدة → توسع المنظومة",
    strategy: "Intelligence wedge, not replacement",
    strategyAr: "إسفين الذكاء، وليس الاستبدال",
    keyActivities: [
      "Identify high-pain integration points",
      "Deploy single platform with clear ROI",
      "Demonstrate AI governance value",
      "Expand to adjacent platforms",
      "Full ecosystem adoption"
    ],
    keyActivitiesAr: [
      "تحديد نقاط التكامل عالية الألم",
      "نشر منصة واحدة مع عائد استثمار واضح",
      "إظهار قيمة حوكمة AI",
      "التوسع للمنصات المجاورة",
      "تبني كامل للمنظومة"
    ],
    successMetrics: [
      "Time to first value < 30 days",
      "Platform expansion rate > 2x annually",
      "NRR > 140%"
    ],
    successMetricsAr: [
      "وقت أول قيمة < 30 يوماً",
      "معدل توسع المنصة > 2x سنوياً",
      "NRR > 140%"
    ]
  },
  {
    id: "government",
    name: "Government / Sovereign Track",
    nameAr: "مسار الحكومات / السيادة",
    target: "Ministries, authorities, national entities",
    targetAr: "الوزارات والهيئات والكيانات الوطنية",
    entry: "Pilot with full control retained by government",
    entryAr: "تجريبي مع احتفاظ الحكومة بالتحكم الكامل",
    strategy: "Infrastructure mindset, not SaaS",
    strategyAr: "عقلية البنية التحتية، وليس SaaS",
    keyActivities: [
      "Establish sovereign trust positioning",
      "Pilot with single agency/ministry",
      "Technology transfer and training",
      "Cross-ministry expansion",
      "National infrastructure status"
    ],
    keyActivitiesAr: [
      "تأسيس موقع الثقة السيادي",
      "تجريبي مع وكالة/وزارة واحدة",
      "نقل التكنولوجيا والتدريب",
      "توسع عبر الوزارات",
      "وضع البنية التحتية الوطنية"
    ],
    successMetrics: [
      "Pilot to expansion conversion > 80%",
      "Government team independence < 12 months",
      "Multi-ministry adoption within 24 months"
    ],
    successMetricsAr: [
      "تحويل التجريبي للتوسع > 80%",
      "استقلال الفريق الحكومي < 12 شهراً",
      "تبني متعدد الوزارات خلال 24 شهراً"
    ]
  },
  {
    id: "partners",
    name: "Strategic Partners Track",
    nameAr: "مسار الشركاء الاستراتيجيين",
    target: "System integrators, national champions",
    targetAr: "مكاملو الأنظمة والأبطال الوطنيون",
    entry: "Controlled partnerships",
    entryAr: "شراكات متحكم بها",
    strategy: "Scale without operational overload",
    strategyAr: "التوسع بدون عبء تشغيلي زائد",
    keyActivities: [
      "Identify regional/vertical partners",
      "Enable with training and certification",
      "Co-sell with maintained control",
      "Expand partner network strategically",
      "Create partner ecosystem"
    ],
    keyActivitiesAr: [
      "تحديد شركاء إقليميين/قطاعيين",
      "تمكين بالتدريب والشهادات",
      "بيع مشترك مع الحفاظ على التحكم",
      "توسيع شبكة الشركاء استراتيجياً",
      "إنشاء منظومة شركاء"
    ],
    successMetrics: [
      "Partner-sourced revenue > 30%",
      "Partner satisfaction > 90%",
      "Partner retention > 95%"
    ],
    successMetricsAr: [
      "إيرادات من الشركاء > 30%",
      "رضا الشركاء > 90%",
      "احتفاظ الشركاء > 95%"
    ]
  }
];

export interface StrategicCustomer {
  id: string;
  profile: string;
  profileAr: string;
  characteristics: string[];
  characteristicsAr: string[];
  entryPlatform: string;
  entryPlatformAr: string;
  expansionPath: string;
  expansionPathAr: string;
}

export const strategicCustomers: StrategicCustomer[] = [
  {
    id: "1",
    profile: "National Financial Authority",
    profileAr: "هيئة مالية وطنية",
    characteristics: ["Regulatory mandate", "Data sovereignty critical", "Complex compliance"],
    characteristicsAr: ["تفويض تنظيمي", "سيادة بيانات حرجة", "امتثال معقد"],
    entryPlatform: "INFERA Finance + ShieldGrid",
    entryPlatformAr: "INFERA Finance + ShieldGrid",
    expansionPath: "Full sovereign financial infrastructure",
    expansionPathAr: "بنية تحتية مالية سيادية كاملة"
  },
  {
    id: "2",
    profile: "Ministry of Digital Transformation",
    profileAr: "وزارة التحول الرقمي",
    characteristics: ["National mandate", "Citizen services", "Multi-agency coordination"],
    characteristicsAr: ["تفويض وطني", "خدمات المواطنين", "تنسيق متعدد الوكالات"],
    entryPlatform: "INFERA Engine + WebNova",
    entryPlatformAr: "INFERA Engine + WebNova",
    expansionPath: "National digital infrastructure",
    expansionPathAr: "بنية تحتية رقمية وطنية"
  },
  {
    id: "3",
    profile: "Regional Healthcare Authority",
    profileAr: "هيئة صحية إقليمية",
    characteristics: ["HIPAA/regulatory compliance", "Patient data sovereignty", "Complex workflows"],
    characteristicsAr: ["امتثال HIPAA/تنظيمي", "سيادة بيانات المرضى", "عمليات معقدة"],
    entryPlatform: "INFERA Healthcare Platform",
    entryPlatformAr: "منصة INFERA الصحية",
    expansionPath: "Integrated health ecosystem",
    expansionPathAr: "منظومة صحية متكاملة"
  },
  {
    id: "4",
    profile: "Large Enterprise Conglomerate",
    profileAr: "تكتل مؤسسي كبير",
    characteristics: ["Multiple business units", "Complex integration needs", "Global operations"],
    characteristicsAr: ["وحدات أعمال متعددة", "احتياجات تكامل معقدة", "عمليات عالمية"],
    entryPlatform: "INFERA Engine + HumanIQ",
    entryPlatformAr: "INFERA Engine + HumanIQ",
    expansionPath: "Enterprise-wide sovereign platform",
    expansionPathAr: "منصة سيادية على مستوى المؤسسة"
  },
  {
    id: "5",
    profile: "National Education Authority",
    profileAr: "هيئة تعليم وطنية",
    characteristics: ["Student data protection", "Scalable infrastructure", "Teacher enablement"],
    characteristicsAr: ["حماية بيانات الطلاب", "بنية تحتية قابلة للتوسع", "تمكين المعلمين"],
    entryPlatform: "INFERA Education + TrainAI",
    entryPlatformAr: "INFERA Education + TrainAI",
    expansionPath: "National learning infrastructure",
    expansionPathAr: "بنية تحتية تعليمية وطنية"
  }
];

// =====================================================================
// SECTION 3: TRUST PROOF LAYER
// =====================================================================

export interface TrustArtifact {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  elements: string[];
  elementsAr: string[];
}

export const trustArtifacts: TrustArtifact[] = [
  {
    id: "governance",
    name: "Governance Architecture Map",
    nameAr: "خريطة معمارية الحوكمة",
    description: "Complete governance structure showing how control is maintained and decisions are made.",
    descriptionAr: "هيكل حوكمة كامل يوضح كيفية الحفاظ على التحكم واتخاذ القرارات.",
    elements: [
      "ROOT_OWNER authority hierarchy",
      "AI Sovereignty Layer with owner-only control",
      "Policy Validator AI enforcement",
      "Human-in-the-loop decision points",
      "Immutable audit logging"
    ],
    elementsAr: [
      "تسلسل سلطة ROOT_OWNER",
      "طبقة سيادة AI بتحكم المالك فقط",
      "تطبيق AI مُصادق السياسات",
      "نقاط قرار الإنسان في الحلقة",
      "تسجيل تدقيق غير قابل للتغيير"
    ]
  },
  {
    id: "security",
    name: "Security Posture Summary",
    nameAr: "ملخص الوضع الأمني",
    description: "AI-powered Zero-Trust security architecture with continuous monitoring and autonomous response.",
    descriptionAr: "معمارية أمان انعدام الثقة مدعومة بـ AI مع مراقبة مستمرة واستجابة مستقلة.",
    elements: [
      "Zero-Trust Architecture (verify everything)",
      "AI Threat Detection (real-time, continuous)",
      "Autonomous Incident Response",
      "AES-256-GCM encryption at rest and transit",
      "HMAC-SHA256 service authentication"
    ],
    elementsAr: [
      "معمارية انعدام الثقة (تحقق من كل شيء)",
      "اكتشاف التهديدات بـ AI (فوري، مستمر)",
      "استجابة الحوادث المستقلة",
      "تشفير AES-256-GCM في السكون والنقل",
      "مصادقة الخدمة HMAC-SHA256"
    ]
  },
  {
    id: "sovereignty",
    name: "Data Sovereignty Philosophy",
    nameAr: "فلسفة سيادة البيانات",
    description: "Complete customer control over data with no external dependencies or foreign access.",
    descriptionAr: "تحكم كامل للعميل في البيانات بدون اعتمادات خارجية أو وصول أجنبي.",
    elements: [
      "Data never leaves customer control",
      "Local data residency guaranteed",
      "Customer-controlled encryption keys",
      "Complete data portability",
      "No foreign access or dependencies"
    ],
    elementsAr: [
      "البيانات لا تغادر أبداً تحكم العميل",
      "إقامة بيانات محلية مضمونة",
      "مفاتيح تشفير يتحكم بها العميل",
      "قابلية نقل بيانات كاملة",
      "لا وصول أو اعتمادات أجنبية"
    ]
  },
  {
    id: "auditability",
    name: "Auditability & Transparency Model",
    nameAr: "نموذج قابلية التدقيق والشفافية",
    description: "Complete visibility into all system actions, decisions, and data access.",
    descriptionAr: "رؤية كاملة لجميع إجراءات النظام والقرارات والوصول للبيانات.",
    elements: [
      "Immutable audit trails",
      "All AI decisions logged with reasoning",
      "Real-time compliance monitoring",
      "Third-party audit support",
      "Transparent governance reporting"
    ],
    elementsAr: [
      "مسارات تدقيق غير قابلة للتغيير",
      "جميع قرارات AI مسجلة مع التفسير",
      "مراقبة امتثال فورية",
      "دعم تدقيق الطرف الثالث",
      "تقارير حوكمة شفافة"
    ]
  },
  {
    id: "risk",
    name: "Risk Management Approach",
    nameAr: "نهج إدارة المخاطر",
    description: "Proactive risk identification and mitigation with continuous improvement.",
    descriptionAr: "تحديد المخاطر والتخفيف منها بشكل استباقي مع تحسين مستمر.",
    elements: [
      "AI-powered risk prediction",
      "Automated threat response",
      "Continuous security improvement",
      "Zero-day vulnerability management",
      "Incident recovery automation"
    ],
    elementsAr: [
      "توقع المخاطر بـ AI",
      "استجابة تهديدات مؤتمتة",
      "تحسين أمان مستمر",
      "إدارة ثغرات اليوم الصفري",
      "أتمتة التعافي من الحوادث"
    ]
  }
];

// =====================================================================
// SECTION 4: FOUNDER / LEADERSHIP NARRATIVE
// =====================================================================

export const founderNarrative = {
  shortVersion: {
    title: "Why INFERA Had to Be Built",
    titleAr: "لماذا كان لابد من بناء INFERA",
    content: "The digital market is structurally broken. Enterprise software vendors have created dependency, not capability. They sell products that lock customers in, extract value out, and leave organizations less capable than before. INFERA exists to reverse this. We build sovereign infrastructure that makes organizations more capable, more independent, and more intelligent—not less. Sovereignty combined with AI is not a feature; it is the inevitable future of digital infrastructure. We built it first because we understood the problem deeply enough to solve it completely.",
    contentAr: "السوق الرقمي مكسور هيكلياً. بائعو برمجيات المؤسسات أنشأوا الاعتماد، وليس القدرة. يبيعون منتجات تقفل العملاء، تستخرج القيمة، وتترك المنظمات أقل قدرة من ذي قبل. INFERA موجودة لعكس هذا. نحن نبني بنية تحتية سيادية تجعل المنظمات أكثر قدرة وأكثر استقلالاً وأكثر ذكاءً—وليس أقل. السيادة مع AI ليست ميزة؛ إنها المستقبل الحتمي للبنية التحتية الرقمية. بنيناها أولاً لأننا فهمنا المشكلة بعمق كافٍ لحلها بالكامل."
  },
  longVersion: {
    title: "The INFERA Vision: A Complete Narrative",
    titleAr: "رؤية INFERA: سرد كامل",
    sections: [
      {
        heading: "Why the Current Digital Market is Structurally Broken",
        headingAr: "لماذا السوق الرقمي الحالي مكسور هيكلياً",
        content: "Enterprise software was supposed to empower organizations. Instead, it created a dependency economy. Salesforce, SAP, Microsoft—these vendors don't sell capability; they rent access to capability they control. Customers pay perpetually for software they never own, data they cannot fully control, and roadmaps they cannot influence. The result: organizations are less sovereign today than before the digital transformation began. This is not a bug—it is the business model. INFERA was built to break this model.",
        contentAr: "كان من المفترض أن تمكّن برمجيات المؤسسات المنظمات. بدلاً من ذلك، أنشأت اقتصاد اعتماد. Salesforce و SAP و Microsoft—هؤلاء البائعون لا يبيعون القدرة؛ يؤجرون الوصول لقدرة يتحكمون بها. العملاء يدفعون باستمرار لبرمجيات لا يملكونها أبداً، بيانات لا يستطيعون التحكم بها بالكامل، وخرائط طريق لا يستطيعون التأثير فيها. النتيجة: المنظمات أقل سيادة اليوم من قبل بدء التحول الرقمي. هذا ليس خطأ—إنه نموذج العمل. INFERA بُنيت لكسر هذا النموذج."
      },
      {
        heading: "Why Incremental Software Will Fail",
        headingAr: "لماذا ستفشل البرمجيات التدريجية",
        content: "Adding AI to broken architecture doesn't fix it—it accelerates the problem. AI without sovereignty means more efficient dependency. AI without governance means uncontrolled risk. The industry is racing to add AI features while ignoring the structural problems underneath. This approach will collapse under its own weight. Organizations need platforms built AI-first with sovereignty at the foundation—not AI bolted onto legacy debt.",
        contentAr: "إضافة AI للمعمارية المكسورة لا تصلحها—تسرع المشكلة. AI بدون سيادة يعني اعتماداً أكثر كفاءة. AI بدون حوكمة يعني مخاطر غير متحكم بها. الصناعة تتسابق لإضافة ميزات AI بينما تتجاهل المشاكل الهيكلية تحتها. هذا النهج سينهار تحت ثقله. المنظمات تحتاج منصات مبنية AI-أولاً مع السيادة في الأساس—وليس AI مضافاً لديون قديمة."
      },
      {
        heading: "Why Sovereignty + AI is Inevitable",
        headingAr: "لماذا السيادة + AI حتمية",
        content: "Governments are waking up to digital dependency. Enterprises are recognizing the cost of vendor lock-in. The next decade belongs to platforms that deliver capability without creating dependency. AI makes this possible—but only if AI itself is sovereign. INFERA combines autonomous intelligence with complete customer control. This is not one option among many—it is where all serious digital infrastructure will eventually arrive. We simply got there first.",
        contentAr: "الحكومات تستيقظ على الاعتماد الرقمي. المؤسسات تدرك تكلفة قفل البائع. العقد القادم ينتمي للمنصات التي تقدم القدرة بدون خلق اعتماد. AI يجعل هذا ممكناً—لكن فقط إذا كان AI نفسه سيادياً. INFERA تجمع بين الذكاء المستقل والتحكم الكامل للعميل. هذا ليس خياراً واحداً من بين كثير—إنه حيث ستصل كل البنية التحتية الرقمية الجادة في النهاية. نحن ببساطة وصلنا أولاً."
      },
      {
        heading: "Why INFERA Had to Be Built Now",
        headingAr: "لماذا كان لابد من بناء INFERA الآن",
        content: "The window for sovereign infrastructure is narrow. In five years, the market will consolidate around whoever established the standard. Legacy vendors cannot transform themselves—their business models prevent it. New entrants will copy features but miss the architecture. INFERA was built during this window specifically because the opportunity is time-limited. The question is not whether sovereign AI infrastructure will dominate—but who will own it.",
        contentAr: "نافذة البنية التحتية السيادية ضيقة. في خمس سنوات، سيتوحد السوق حول من أنشأ المعيار. البائعون القدامى لا يستطيعون تحويل أنفسهم—نماذج أعمالهم تمنع ذلك. الداخلون الجدد سينسخون الميزات لكن سيفقدون المعمارية. INFERA بُنيت خلال هذه النافذة تحديداً لأن الفرصة محدودة بالوقت. السؤال ليس ما إذا كانت البنية التحتية لـ AI السيادي ستهيمن—ولكن من سيملكها."
      },
      {
        heading: "Why This Leadership Understands the Problem Deeply",
        headingAr: "لماذا هذه القيادة تفهم المشكلة بعمق",
        content: "INFERA's leadership experienced the broken digital market firsthand—as builders, operators, and strategists. We saw organizations trapped by vendor dependency, security compromised by architectural shortcuts, and AI treated as a marketing checkbox rather than a governance system. This deep understanding shaped every INFERA design decision. We didn't build another product—we built the infrastructure that makes better products possible.",
        contentAr: "قيادة INFERA عايشت السوق الرقمي المكسور مباشرة—كبناة ومشغلين واستراتيجيين. رأينا منظمات محتجزة باعتماد البائع، أمان مُخترق باختصارات معمارية، وAI يُعامل كعلامة تسويقية بدلاً من نظام حوكمة. هذا الفهم العميق شكّل كل قرار تصميم في INFERA. لم نبنِ منتجاً آخر—بنينا البنية التحتية التي تجعل المنتجات الأفضل ممكنة."
      }
    ]
  }
};

// =====================================================================
// SECTION 5: RED LINE RULES
// =====================================================================

export interface RedLineRule {
  id: string;
  category: string;
  categoryAr: string;
  rule: string;
  ruleAr: string;
  rationale: string;
  rationaleAr: string;
}

export const redLineRules: RedLineRule[] = [
  {
    id: "never-sell-1",
    category: "What INFERA Will NEVER Sell",
    categoryAr: "ما لن تبيعه INFERA أبداً",
    rule: "Customer data access or analytics",
    ruleAr: "الوصول لبيانات العملاء أو تحليلاتها",
    rationale: "Customer data belongs to customers. Monetizing customer data violates the sovereignty promise.",
    rationaleAr: "بيانات العميل ملك للعملاء. تسييل بيانات العميل ينتهك وعد السيادة."
  },
  {
    id: "never-sell-2",
    category: "What INFERA Will NEVER Sell",
    categoryAr: "ما لن تبيعه INFERA أبداً",
    rule: "Exclusive access to hostile acquirers",
    ruleAr: "وصول حصري للمستحوذين العدائيين",
    rationale: "INFERA serves customer interests. Selling to entities that would harm customers is forbidden.",
    rationaleAr: "INFERA تخدم مصالح العملاء. البيع لكيانات ستضر العملاء ممنوع."
  },
  {
    id: "never-build-1",
    category: "What INFERA Will NEVER Build",
    categoryAr: "ما لن تبنيه INFERA أبداً",
    rule: "Surveillance or monitoring tools for governments against citizens",
    ruleAr: "أدوات مراقبة للحكومات ضد المواطنين",
    rationale: "Sovereign infrastructure empowers citizens, not oppresses them. We build for sovereignty, not surveillance.",
    rationaleAr: "البنية التحتية السيادية تمكّن المواطنين، لا تقمعهم. نحن نبني للسيادة، وليس للمراقبة."
  },
  {
    id: "never-build-2",
    category: "What INFERA Will NEVER Build",
    categoryAr: "ما لن تبنيه INFERA أبداً",
    rule: "Vendor lock-in mechanisms or switching costs",
    ruleAr: "آليات قفل البائع أو تكاليف التبديل",
    rationale: "Our value comes from capability, not captivity. Customers stay because we deliver value, not because they cannot leave.",
    rationaleAr: "قيمتنا تأتي من القدرة، وليس الأسر. العملاء يبقون لأننا نقدم قيمة، وليس لأنهم لا يستطيعون المغادرة."
  },
  {
    id: "never-compromise-1",
    category: "What INFERA Will NEVER Compromise",
    categoryAr: "ما لن تتنازل عنه INFERA أبداً",
    rule: "Security architecture for speed or convenience",
    ruleAr: "معمارية الأمان من أجل السرعة أو الراحة",
    rationale: "Security is foundational. Shortcuts in security are permanent vulnerabilities.",
    rationaleAr: "الأمان أساسي. الاختصارات في الأمان هي نقاط ضعف دائمة."
  },
  {
    id: "never-compromise-2",
    category: "What INFERA Will NEVER Compromise",
    categoryAr: "ما لن تتنازل عنه INFERA أبداً",
    rule: "Customer sovereignty for easier sales",
    ruleAr: "سيادة العميل من أجل مبيعات أسهل",
    rationale: "Sovereignty is our core promise. Every compromise dilutes what makes INFERA essential.",
    rationaleAr: "السيادة هي وعدنا الأساسي. كل تنازل يخفف ما يجعل INFERA ضرورية."
  },
  {
    id: "forbidden-partnerships",
    category: "Forbidden Partnerships",
    categoryAr: "الشراكات الممنوعة",
    rule: "Partnerships requiring customer data sharing or sovereignty reduction",
    ruleAr: "شراكات تتطلب مشاركة بيانات العملاء أو تقليل السيادة",
    rationale: "Partnerships must enhance customer value, not extract it. Any partnership that weakens customer sovereignty is rejected.",
    rationaleAr: "الشراكات يجب أن تعزز قيمة العميل، لا تستخرجها. أي شراكة تضعف سيادة العميل مرفوضة."
  },
  {
    id: "rejected-revenue",
    category: "Revenue We Reject",
    categoryAr: "الإيرادات التي نرفضها",
    rule: "Revenue from contracts that require compromising other customers",
    ruleAr: "إيرادات من عقود تتطلب المساومة على عملاء آخرين",
    rationale: "No single customer's revenue justifies harming others. Platform integrity protects all customers equally.",
    rationaleAr: "لا إيرادات عميل واحد تبرر إيذاء الآخرين. نزاهة المنصة تحمي جميع العملاء بالتساوي."
  }
];

export const sovereignDeclaration = {
  title: "Final Sovereign Declaration",
  titleAr: "الإعلان السيادي النهائي",
  statements: [
    {
      statement: "INFERA IS NOT A PRODUCT COMPANY.",
      statementAr: "INFERA ليست شركة منتجات.",
      expansion: "IT IS A SOVEREIGN INTELLIGENCE INFRASTRUCTURE.",
      expansionAr: "إنها بنية تحتية للذكاء السيادي."
    },
    {
      statement: "GROWTH MUST NEVER WEAKEN CONTROL.",
      statementAr: "النمو يجب ألا يُضعف التحكم أبداً.",
      expansion: "Scale without sovereignty is surrender.",
      expansionAr: "التوسع بدون سيادة هو استسلام."
    },
    {
      statement: "REVENUE MUST NEVER OVERRIDE SOVEREIGNTY.",
      statementAr: "الإيرادات يجب ألا تتجاوز السيادة أبداً.",
      expansion: "Profitable compromise is still compromise.",
      expansionAr: "التنازل المربح لا يزال تنازلاً."
    },
    {
      statement: "SCALE MUST NEVER BREAK GOVERNANCE.",
      statementAr: "التوسع يجب ألا يكسر الحوكمة أبداً.",
      expansion: "Every customer receives the same sovereignty guarantees.",
      expansionAr: "كل عميل يحصل على نفس ضمانات السيادة."
    }
  ]
};
