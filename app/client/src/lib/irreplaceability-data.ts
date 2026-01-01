// INFERA Legacy & Irreplaceability Proof™
// إثبات عدم القابلية للاستبدال

export interface DependencyCategory {
  id: string;
  category: string;
  categoryAr: string;
  dependencies: string[];
  dependenciesAr: string[];
  breakageImpact: string;
  breakageImpactAr: string;
}

export const dependencyMap: DependencyCategory[] = [
  {
    id: "governance",
    category: "Governance & Policy Systems",
    categoryAr: "أنظمة الحوكمة والسياسات",
    dependencies: [
      "Automated policy enforcement across all platforms",
      "Compliance validation and audit trail generation",
      "Role-based access control and permission hierarchies",
      "Real-time governance rule adaptation"
    ],
    dependenciesAr: [
      "تطبيق السياسات الآلي عبر جميع المنصات",
      "التحقق من الامتثال وإنشاء مسار التدقيق",
      "التحكم في الوصول القائم على الأدوار وتسلسلات الأذونات",
      "تكييف قواعد الحوكمة في الوقت الفعلي"
    ],
    breakageImpact: "IMMEDIATE: All automated governance stops. Manual policy enforcement required. Compliance gaps emerge within hours.",
    breakageImpactAr: "فوري: تتوقف جميع الحوكمة الآلية. يُطلب تطبيق السياسات يدوياً. تظهر فجوات الامتثال خلال ساعات."
  },
  {
    id: "ai-intelligence",
    category: "AI Intelligence Layer",
    categoryAr: "طبقة ذكاء AI",
    dependencies: [
      "Predictive analytics for operational decisions",
      "Autonomous threat detection and response",
      "Behavioral intelligence across user patterns",
      "Cross-platform learning and optimization"
    ],
    dependenciesAr: [
      "التحليلات التنبؤية للقرارات التشغيلية",
      "اكتشاف التهديدات والاستجابة المستقلة",
      "الذكاء السلوكي عبر أنماط المستخدمين",
      "التعلم والتحسين عبر المنصات"
    ],
    breakageImpact: "IMMEDIATE: Predictive capabilities lost. Security response becomes reactive. Operational efficiency drops 40-60%.",
    breakageImpactAr: "فوري: تُفقد القدرات التنبؤية. استجابة الأمان تصبح تفاعلية. كفاءة العمليات تنخفض 40-60%."
  },
  {
    id: "data-sovereignty",
    category: "Data Sovereignty Infrastructure",
    categoryAr: "بنية سيادة البيانات التحتية",
    dependencies: [
      "Local data residency enforcement",
      "Customer-controlled encryption key management",
      "Zero external dependency operations",
      "Complete data portability guarantees"
    ],
    dependenciesAr: [
      "تطبيق إقامة البيانات المحلية",
      "إدارة مفاتيح التشفير المتحكم بها من العميل",
      "عمليات بدون اعتمادات خارجية",
      "ضمانات قابلية نقل البيانات الكاملة"
    ],
    breakageImpact: "CRITICAL: Data sovereignty guarantees void. Regulatory compliance at risk. Customer trust destroyed.",
    breakageImpactAr: "حرج: ضمانات سيادة البيانات تبطل. الامتثال التنظيمي في خطر. ثقة العملاء مدمرة."
  },
  {
    id: "platform-ecosystem",
    category: "Platform Ecosystem Integration",
    categoryAr: "تكامل منظومة المنصات",
    dependencies: [
      "21+ platform unified governance",
      "Cross-platform data intelligence",
      "Shared security posture management",
      "Unified user experience across platforms"
    ],
    dependenciesAr: [
      "حوكمة موحدة لـ 21+ منصة",
      "ذكاء البيانات عبر المنصات",
      "إدارة الوضع الأمني المشتركة",
      "تجربة مستخدم موحدة عبر المنصات"
    ],
    breakageImpact: "SEVERE: Ecosystem fragmentation. Each platform becomes isolated. Integration value destroyed.",
    breakageImpactAr: "شديد: تفتت المنظومة. كل منصة تصبح معزولة. قيمة التكامل مدمرة."
  },
  {
    id: "operational-automation",
    category: "Operational Automation",
    categoryAr: "الأتمتة التشغيلية",
    dependencies: [
      "Autonomous workflow execution",
      "Intelligent resource allocation",
      "Self-healing system operations",
      "Predictive maintenance and optimization"
    ],
    dependenciesAr: [
      "تنفيذ سير العمل المستقل",
      "تخصيص الموارد الذكي",
      "عمليات النظام ذاتية الشفاء",
      "الصيانة والتحسين التنبؤي"
    ],
    breakageImpact: "OPERATIONAL: Manual intervention required for all processes. Staff requirements increase 3-5x. Error rates spike.",
    breakageImpactAr: "تشغيلي: تدخل يدوي مطلوب لجميع العمليات. متطلبات الموظفين تزيد 3-5x. معدلات الخطأ ترتفع."
  }
];

export interface ReplacementAttempt {
  id: string;
  competitor: string;
  competitorAr: string;
  whatTheyAttempt: string;
  whatTheyAttemptAr: string;
  whyItFails: string[];
  whyItFailsAr: string[];
  timeToApproximate: string;
  timeToApproximateAr: string;
  costToApproximate: string;
  costToApproximateAr: string;
}

export const replacementFailures: ReplacementAttempt[] = [
  {
    id: "bigtech",
    competitor: "Big Tech Cloud Providers",
    competitorAr: "مزودو السحابة من شركات التكنولوجيا الكبرى",
    whatTheyAttempt: "Offer 'sovereign cloud' versions of existing services",
    whatTheyAttemptAr: "تقديم نسخ 'سحابة سيادية' من الخدمات الحالية",
    whyItFails: [
      "Cannot transfer complete control—business model requires dependency",
      "AI models trained on centralized data, not sovereign architectures",
      "Governance is feature-level, not architecture-level",
      "No platform factory capability—only single products"
    ],
    whyItFailsAr: [
      "لا يستطيعون نقل التحكم الكامل—نموذج العمل يتطلب الاعتماد",
      "نماذج AI مدربة على بيانات مركزية، وليس معماريات سيادية",
      "الحوكمة على مستوى الميزات، وليس على مستوى المعمارية",
      "لا قدرة مصنع منصات—منتجات فردية فقط"
    ],
    timeToApproximate: "5-7 years minimum (requires complete architectural rebuild)",
    timeToApproximateAr: "5-7 سنوات كحد أدنى (يتطلب إعادة بناء معمارية كاملة)",
    costToApproximate: "$2-5 billion (and would cannibalize existing revenue)",
    costToApproximateAr: "2-5 مليار دولار (وسيأكل الإيرادات الحالية)"
  },
  {
    id: "legacy-erp",
    competitor: "Legacy ERP Vendors (SAP, Oracle)",
    competitorAr: "بائعو ERP القدامى (SAP، Oracle)",
    whatTheyAttempt: "Add sovereign modules to existing architectures",
    whatTheyAttemptAr: "إضافة وحدات سيادية للمعماريات الحالية",
    whyItFails: [
      "40+ years of architectural debt cannot be unwound",
      "AI is bolted on, not native—cannot achieve autonomous governance",
      "Customer base requires backwards compatibility forever",
      "Sovereignty requires architecture change, not module addition"
    ],
    whyItFailsAr: [
      "أكثر من 40 عاماً من الديون المعمارية لا يمكن حلها",
      "AI مضاف، وليس أصلي—لا يستطيع تحقيق حوكمة مستقلة",
      "قاعدة العملاء تتطلب التوافق الخلفي للأبد",
      "السيادة تتطلب تغيير المعمارية، وليس إضافة وحدات"
    ],
    timeToApproximate: "Impossible within existing architecture; new architecture = new company",
    timeToApproximateAr: "مستحيل ضمن المعمارية الحالية؛ معمارية جديدة = شركة جديدة",
    costToApproximate: "Would require abandoning existing customer base ($100B+ revenue at risk)",
    costToApproximateAr: "سيتطلب التخلي عن قاعدة العملاء الحالية (إيرادات 100+ مليار دولار في خطر)"
  },
  {
    id: "saas-vendors",
    competitor: "SaaS Point Solution Vendors",
    competitorAr: "بائعو حلول SaaS النقطية",
    whatTheyAttempt: "Bundle multiple products and claim 'platform'",
    whatTheyAttemptAr: "تجميع منتجات متعددة وادعاء 'منصة'",
    whyItFails: [
      "Bundled products ≠ integrated platform",
      "No unified governance across products",
      "Each product has separate AI with no cross-learning",
      "Customer data fragmented across products"
    ],
    whyItFailsAr: [
      "المنتجات المجمعة ≠ منصة متكاملة",
      "لا حوكمة موحدة عبر المنتجات",
      "كل منتج له AI منفصل بدون تعلم متبادل",
      "بيانات العملاء مجزأة عبر المنتجات"
    ],
    timeToApproximate: "3-5 years to achieve basic integration; never achieves true unification",
    timeToApproximateAr: "3-5 سنوات لتحقيق تكامل أساسي؛ لا يحقق أبداً التوحيد الحقيقي",
    costToApproximate: "$500M-1B in integration engineering; ongoing fragmentation costs",
    costToApproximateAr: "500 مليون-1 مليار دولار في هندسة التكامل؛ تكاليف تجزئة مستمرة"
  },
  {
    id: "startups",
    competitor: "Well-Funded Startups",
    competitorAr: "الشركات الناشئة الممولة جيداً",
    whatTheyAttempt: "Build sovereign AI platform from scratch",
    whatTheyAttemptAr: "بناء منصة AI سيادية من الصفر",
    whyItFails: [
      "5+ years of development cannot be shortcut with capital",
      "No production data to train AI governance models",
      "Trust must be earned over time—cannot be purchased",
      "Ecosystem effects require existing customer base"
    ],
    whyItFailsAr: [
      "أكثر من 5 سنوات من التطوير لا يمكن اختصارها بالرأسمال",
      "لا بيانات إنتاج لتدريب نماذج حوكمة AI",
      "الثقة يجب أن تُكتسب مع الوقت—لا يمكن شراؤها",
      "تأثيرات المنظومة تتطلب قاعدة عملاء حالية"
    ],
    timeToApproximate: "5-7 years minimum; likely longer without existing customer data",
    timeToApproximateAr: "5-7 سنوات كحد أدنى؛ على الأرجح أطول بدون بيانات عملاء حالية",
    costToApproximate: "$300-500M in development; survival unlikely before revenue",
    costToApproximateAr: "300-500 مليون دولار في التطوير؛ البقاء غير مرجح قبل الإيرادات"
  }
];

export interface RegressionCategory {
  id: string;
  area: string;
  areaAr: string;
  withInfera: string;
  withInferaAr: string;
  withoutInfera: string;
  withoutInferaAr: string;
  strategicSetback: string;
  strategicSetbackAr: string;
}

export const regressionEffect: RegressionCategory[] = [
  {
    id: "governance",
    area: "Governance",
    areaAr: "الحوكمة",
    withInfera: "Autonomous policy enforcement, real-time compliance, zero manual intervention",
    withInferaAr: "تطبيق سياسات مستقل، امتثال فوري، صفر تدخل يدوي",
    withoutInfera: "Manual policy management, periodic compliance checks, staff-dependent enforcement",
    withoutInferaAr: "إدارة سياسات يدوية، فحوصات امتثال دورية، تطبيق معتمد على الموظفين",
    strategicSetback: "Returns organization to 2015-era governance: reactive, error-prone, expensive",
    strategicSetbackAr: "يعيد المنظمة لحوكمة حقبة 2015: تفاعلية، عرضة للأخطاء، مكلفة"
  },
  {
    id: "intelligence",
    area: "Intelligence",
    areaAr: "الذكاء",
    withInfera: "Predictive analytics, behavioral insights, autonomous optimization",
    withInferaAr: "تحليلات تنبؤية، رؤى سلوكية، تحسين مستقل",
    withoutInfera: "Historical reporting, manual analysis, reactive decision-making",
    withoutInferaAr: "تقارير تاريخية، تحليل يدوي، اتخاذ قرارات تفاعلي",
    strategicSetback: "Loses 3-5 years of competitive intelligence advantage",
    strategicSetbackAr: "يفقد 3-5 سنوات من ميزة الاستخبارات التنافسية"
  },
  {
    id: "security",
    area: "Security",
    areaAr: "الأمان",
    withInfera: "AI threat detection, autonomous response, zero-trust enforcement",
    withInferaAr: "اكتشاف التهديدات بـ AI، استجابة مستقلة، تطبيق انعدام الثقة",
    withoutInfera: "Signature-based detection, manual incident response, perimeter security",
    withoutInferaAr: "اكتشاف قائم على التوقيع، استجابة حوادث يدوية، أمان المحيط",
    strategicSetback: "Security posture regresses to pre-AI era; vulnerability window expands 10x",
    strategicSetbackAr: "الوضع الأمني يتراجع لحقبة ما قبل AI؛ نافذة الضعف تتوسع 10x"
  },
  {
    id: "control",
    area: "Control",
    areaAr: "التحكم",
    withInfera: "Complete data sovereignty, customer-controlled operations, zero external dependencies",
    withInferaAr: "سيادة بيانات كاملة، عمليات يتحكم بها العميل، صفر اعتمادات خارجية",
    withoutInfera: "Vendor-dependent operations, shared infrastructure, external data exposure",
    withoutInferaAr: "عمليات تعتمد على البائع، بنية تحتية مشتركة، تعرض بيانات خارجي",
    strategicSetback: "Sovereignty lost; regulatory compliance questionable; strategic independence gone",
    strategicSetbackAr: "السيادة مفقودة؛ الامتثال التنظيمي مشكوك فيه؛ الاستقلال الاستراتيجي ذهب"
  },
  {
    id: "efficiency",
    area: "Operational Efficiency",
    areaAr: "الكفاءة التشغيلية",
    withInfera: "Automated workflows, self-optimizing systems, minimal staff overhead",
    withInferaAr: "سير عمل آلي، أنظمة محسنة ذاتياً، أعباء موظفين ضئيلة",
    withoutInfera: "Manual processes, static systems, significant staff requirements",
    withoutInferaAr: "عمليات يدوية، أنظمة ثابتة، متطلبات موظفين كبيرة",
    strategicSetback: "Operational costs increase 40-60%; efficiency gains of past 5 years erased",
    strategicSetbackAr: "التكاليف التشغيلية تزيد 40-60%؛ مكاسب الكفاءة للـ 5 سنوات الماضية تُمحى"
  }
];

export const permanentGap = {
  title: "Permanent Gap Statement",
  titleAr: "بيان الفجوة الدائمة",
  statements: [
    {
      statement: "Reversion to 'Before INFERA' is Impossible",
      statementAr: "العودة لـ 'قبل INFERA' مستحيلة",
      explanation: "Organizations that adopt INFERA integrate sovereign governance into their compliance frameworks, operational workflows, and strategic planning. This integration cannot be unwound without rebuilding everything from scratch.",
      explanationAr: "المنظمات التي تتبنى INFERA تدمج الحوكمة السيادية في أطر امتثالها وسير عملها التشغيلي وتخطيطها الاستراتيجي. هذا التكامل لا يمكن حله بدون إعادة بناء كل شيء من الصفر."
    },
    {
      statement: "AI Learning Cannot Be Transferred",
      statementAr: "تعلم AI لا يمكن نقله",
      explanation: "Years of AI learning from production data, governance decisions, and security patterns exist only within INFERA. This intelligence cannot be exported, replicated, or transferred to any alternative system.",
      explanationAr: "سنوات من تعلم AI من بيانات الإنتاج وقرارات الحوكمة وأنماط الأمان موجودة فقط ضمن INFERA. هذا الذكاء لا يمكن تصديره أو تكراره أو نقله لأي نظام بديل."
    },
    {
      statement: "Ecosystem Effects Compound Irreversibly",
      statementAr: "تأثيرات المنظومة تتراكم بشكل لا رجعة فيه",
      explanation: "Each additional platform, each new customer, each governance decision strengthens the ecosystem. This compound value cannot be dismantled without destroying the value itself.",
      explanationAr: "كل منصة إضافية، كل عميل جديد، كل قرار حوكمة يقوي المنظومة. هذه القيمة المركبة لا يمكن تفكيكها بدون تدمير القيمة نفسها."
    },
    {
      statement: "Trust Takes Time, Not Money",
      statementAr: "الثقة تستغرق وقتاً، وليس مالاً",
      explanation: "Sovereign trust is earned through years of demonstrated capability, security, and reliability. New entrants cannot purchase this trust; they must earn it over the same time period INFERA has invested.",
      explanationAr: "الثقة السيادية تُكتسب من خلال سنوات من القدرة والأمان والموثوقية المُظهرة. الداخلون الجدد لا يستطيعون شراء هذه الثقة؛ يجب أن يكتسبوها خلال نفس الفترة الزمنية التي استثمرتها INFERA."
    }
  ],
  conclusion: {
    en: "INFERA adoption is a one-way door. Organizations that enter become structurally dependent on capabilities that no alternative can provide. This is not lock-in through contracts or switching costs—it is lock-in through capability that cannot be replicated.",
    ar: "تبني INFERA هو باب باتجاه واحد. المنظمات التي تدخل تصبح معتمدة هيكلياً على قدرات لا يستطيع أي بديل توفيرها. هذا ليس قفلاً من خلال العقود أو تكاليف التبديل—إنه قفل من خلال قدرة لا يمكن تكرارها."
  }
};

export const executiveSummary = {
  title: "Executive Summary: Structural Necessity",
  titleAr: "ملخص تنفيذي: الضرورة الهيكلية",
  keyPoints: [
    {
      point: "INFERA is not a vendor choice—it is infrastructure",
      pointAr: "INFERA ليست خيار مورد—إنها بنية تحتية",
      detail: "Like choosing an operating system or database architecture, INFERA becomes the foundation upon which everything else is built.",
      detailAr: "مثل اختيار نظام التشغيل أو معمارية قاعدة البيانات، INFERA تصبح الأساس الذي يُبنى عليه كل شيء آخر."
    },
    {
      point: "Replacement requires rebuilding, not switching",
      pointAr: "الاستبدال يتطلب إعادة البناء، وليس التبديل",
      detail: "The integration depth means removal is not a migration—it is a complete reconstruction of governance, intelligence, and operations.",
      detailAr: "عمق التكامل يعني أن الإزالة ليست ترحيلاً—إنها إعادة بناء كاملة للحوكمة والذكاء والعمليات."
    },
    {
      point: "Competitive alternatives are years away",
      pointAr: "البدائل التنافسية تبعد سنوات",
      detail: "Even with unlimited capital, competitors cannot replicate 5+ years of architectural development and AI learning.",
      detailAr: "حتى مع رأسمال غير محدود، المنافسون لا يستطيعون تكرار أكثر من 5 سنوات من التطوير المعماري وتعلم AI."
    },
    {
      point: "Trust accumulation is time-bound",
      pointAr: "تراكم الثقة مرتبط بالوقت",
      detail: "Government and enterprise trust is earned through demonstrated capability over years. This cannot be accelerated.",
      detailAr: "ثقة الحكومات والمؤسسات تُكتسب من خلال القدرة المُظهرة عبر السنوات. هذا لا يمكن تسريعه."
    }
  ]
};
