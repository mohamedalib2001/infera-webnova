// INFERA Crisis Scenarios Playbook™
// التحول من الصمود إلى الهيمنة أثناء الأزمات

export interface CrisisScenario {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  initialShock: {
    marketFailures: string[];
    marketFailuresAr: string[];
    competitorBreaks: string[];
    competitorBreaksAr: string[];
  };
  inferaResponse: {
    activatedLayers: string[];
    activatedLayersAr: string[];
    governanceAdaptation: string;
    governanceAdaptationAr: string;
    aiAdaptation: string;
    aiAdaptationAr: string;
    containmentActions: string[];
    containmentActionsAr: string[];
  };
  strategicConversion: {
    crisisToLeverage: string;
    crisisToLeverageAr: string;
    inferaGains: string[];
    inferaGainsAr: string[];
    competitorWeakening: string[];
    competitorWeakeningAr: string[];
  };
}

export const crisisScenarios: CrisisScenario[] = [
  {
    id: "economic-downturn",
    name: "Global Economic Downturn",
    nameAr: "الانكماش الاقتصادي العالمي",
    icon: "TrendingDown",
    initialShock: {
      marketFailures: [
        "Enterprise software budgets cut 30-50%",
        "SaaS subscriptions become cost-cutting targets",
        "Venture funding freezes, startups collapse",
        "Digital transformation projects paused or cancelled"
      ],
      marketFailuresAr: [
        "ميزانيات برمجيات المؤسسات تُخفض 30-50%",
        "اشتراكات SaaS تصبح أهدافاً لخفض التكاليف",
        "تجميد التمويل الاستثماري، انهيار الشركات الناشئة",
        "مشاريع التحول الرقمي موقوفة أو ملغاة"
      ],
      competitorBreaks: [
        "SaaS vendors face mass subscription cancellations",
        "Cloud providers see revenue collapse from enterprise pullback",
        "Startups without runway shut down, fragmenting integrations",
        "Legacy vendors cannot reduce prices without destroying margins"
      ],
      competitorBreaksAr: [
        "بائعو SaaS يواجهون إلغاءات اشتراكات جماعية",
        "مزودو السحابة يرون انهيار الإيرادات من تراجع المؤسسات",
        "الشركات الناشئة بدون مدرج تغلق، تفتت التكاملات",
        "البائعون القدامى لا يستطيعون تخفيض الأسعار بدون تدمير الهوامش"
      ]
    },
    inferaResponse: {
      activatedLayers: [
        "Sovereign Licensing model activates (perpetual, not subscription)",
        "Value-based pricing demonstrates clear ROI",
        "Platform consolidation offers cost reduction",
        "AI automation reduces operational headcount needs"
      ],
      activatedLayersAr: [
        "نموذج الترخيص السيادي يُفعل (دائم، وليس اشتراك)",
        "التسعير القائم على القيمة يوضح عائد استثمار واضح",
        "توحيد المنصات يوفر تخفيض تكاليف",
        "أتمتة AI تقلل احتياجات العمالة التشغيلية"
      ],
      governanceAdaptation: "Autonomous cost optimization identifies efficiency opportunities across all platforms without human analysis.",
      governanceAdaptationAr: "تحسين التكاليف المستقل يحدد فرص الكفاءة عبر جميع المنصات بدون تحليل بشري.",
      aiAdaptation: "AI shifts focus to cost reduction, efficiency gains, and consolidation recommendations.",
      aiAdaptationAr: "AI يحول التركيز لتخفيض التكاليف ومكاسب الكفاءة وتوصيات التوحيد.",
      containmentActions: [
        "Flexible payment terms for strategic customers",
        "Consolidation packages replacing 5-10 vendor subscriptions",
        "Efficiency guarantees with measurable outcomes"
      ],
      containmentActionsAr: [
        "شروط دفع مرنة للعملاء الاستراتيجيين",
        "حزم توحيد تستبدل 5-10 اشتراكات موردين",
        "ضمانات كفاءة مع نتائج قابلة للقياس"
      ]
    },
    strategicConversion: {
      crisisToLeverage: "Economic crisis becomes consolidation opportunity. Organizations seeking cost reduction adopt INFERA to eliminate vendor sprawl.",
      crisisToLeverageAr: "الأزمة الاقتصادية تصبح فرصة توحيد. المنظمات التي تسعى لتخفيض التكاليف تتبنى INFERA للقضاء على تشتت الموردين.",
      inferaGains: [
        "Customers consolidating 5-10 vendors onto INFERA platform",
        "Competitors' churned customers seeking alternatives",
        "Government adoption accelerates as sovereignty reduces foreign dependencies",
        "Strategic acquisitions of distressed competitors at discount"
      ],
      inferaGainsAr: [
        "العملاء يوحدون 5-10 موردين على منصة INFERA",
        "عملاء المنافسين المتسربون يبحثون عن بدائل",
        "تبني الحكومات يتسارع مع تقليل السيادة للاعتماديات الأجنبية",
        "استحواذات استراتيجية على منافسين متعثرين بخصم"
      ],
      competitorWeakening: [
        "SaaS vendors lose 30-40% of customer base",
        "Startups without runway exit market permanently",
        "Legacy vendors forced into desperate price wars",
        "Cloud providers face margin compression"
      ],
      competitorWeakeningAr: [
        "بائعو SaaS يخسرون 30-40% من قاعدة العملاء",
        "الشركات الناشئة بدون مدرج تخرج من السوق نهائياً",
        "البائعون القدامى يُجبرون على حروب أسعار يائسة",
        "مزودو السحابة يواجهون ضغط الهوامش"
      ]
    }
  },
  {
    id: "regulatory-shift",
    name: "Major Regulatory or Legal Shift",
    nameAr: "تحول تنظيمي أو قانوني كبير",
    icon: "Scale",
    initialShock: {
      marketFailures: [
        "New data sovereignty laws enacted globally",
        "AI governance regulations require compliance within 12-18 months",
        "Cross-border data transfer restrictions tighten",
        "Personal data protection laws expand scope dramatically"
      ],
      marketFailuresAr: [
        "قوانين سيادة بيانات جديدة تُسن عالمياً",
        "لوائح حوكمة AI تتطلب الامتثال خلال 12-18 شهراً",
        "قيود نقل البيانات عبر الحدود تشتد",
        "قوانين حماية البيانات الشخصية توسع النطاق بشكل كبير"
      ],
      competitorBreaks: [
        "Cloud providers must restructure for data localization",
        "SaaS vendors face compliance costs exceeding development budgets",
        "Legacy systems require fundamental architectural changes",
        "AI vendors cannot explain their models for regulatory approval"
      ],
      competitorBreaksAr: [
        "مزودو السحابة يجب أن يعيدوا الهيكلة لتوطين البيانات",
        "بائعو SaaS يواجهون تكاليف امتثال تتجاوز ميزانيات التطوير",
        "الأنظمة القديمة تتطلب تغييرات معمارية جوهرية",
        "بائعو AI لا يستطيعون شرح نماذجهم للموافقة التنظيمية"
      ]
    },
    inferaResponse: {
      activatedLayers: [
        "Sovereign-first architecture already compliant by design",
        "Local data residency built into core platform",
        "AI governance with full explainability and audit trails",
        "Policy Validator AI automatically adapts to new regulations"
      ],
      activatedLayersAr: [
        "معمارية السيادة-أولاً متوافقة بالتصميم بالفعل",
        "إقامة البيانات المحلية مدمجة في المنصة الأساسية",
        "حوكمة AI مع قابلية شرح كاملة ومسارات تدقيق",
        "AI مُصادق السياسات يتكيف تلقائياً مع اللوائح الجديدة"
      ],
      governanceAdaptation: "Policy Validator AI ingests new regulations and automatically updates governance rules across all platforms within hours.",
      governanceAdaptationAr: "AI مُصادق السياسات يستوعب اللوائح الجديدة ويحدث تلقائياً قواعد الحوكمة عبر جميع المنصات خلال ساعات.",
      aiAdaptation: "AI reasoning becomes fully transparent, with decision explanations available for regulatory audit on demand.",
      aiAdaptationAr: "تفكير AI يصبح شفافاً بالكامل، مع شروحات القرارات متاحة للتدقيق التنظيمي عند الطلب.",
      containmentActions: [
        "Compliance certification packages for rapid adoption",
        "Regulatory transition assistance for existing customers",
        "Government liaison for regulatory framework alignment"
      ],
      containmentActionsAr: [
        "حزم شهادات امتثال للتبني السريع",
        "مساعدة انتقال تنظيمي للعملاء الحاليين",
        "اتصال حكومي لمواءمة الإطار التنظيمي"
      ]
    },
    strategicConversion: {
      crisisToLeverage: "Regulatory crisis validates INFERA's sovereign-first architecture. What was 'premium' becomes 'mandatory'.",
      crisisToLeverageAr: "الأزمة التنظيمية تُصادق على معمارية INFERA السيادة-أولاً. ما كان 'متميزاً' يصبح 'إلزامياً'.",
      inferaGains: [
        "Competitors' non-compliant customers must migrate immediately",
        "Regulatory bodies reference INFERA as compliance standard",
        "Premium pricing justified by compliance guarantee",
        "Government adoption accelerates as only compliant option"
      ],
      inferaGainsAr: [
        "عملاء المنافسين غير المتوافقين يجب أن يهاجروا فوراً",
        "الجهات التنظيمية ترجع لـ INFERA كمعيار امتثال",
        "التسعير المتميز مبرر بضمان الامتثال",
        "تبني الحكومات يتسارع كخيار متوافق وحيد"
      ],
      competitorWeakening: [
        "Cloud vendors face 2-3 year re-architecture projects",
        "SaaS vendors cannot afford compliance engineering",
        "Legacy vendors structurally incapable of adaptation",
        "AI vendors without explainability banned from regulated sectors"
      ],
      competitorWeakeningAr: [
        "موردو السحابة يواجهون مشاريع إعادة معمارية 2-3 سنوات",
        "بائعو SaaS لا يستطيعون تحمل هندسة الامتثال",
        "البائعون القدامى عاجزون هيكلياً عن التكيف",
        "بائعو AI بدون قابلية شرح محظورون من القطاعات المنظمة"
      ]
    }
  },
  {
    id: "cyber-attack",
    name: "Coordinated Cyber Attack or Digital Warfare",
    nameAr: "هجوم سيبراني منسق أو حرب رقمية",
    icon: "Shield",
    initialShock: {
      marketFailures: [
        "Major cloud provider experiences catastrophic breach",
        "Supply chain attacks compromise multiple vendors simultaneously",
        "Critical infrastructure targeted by state-sponsored actors",
        "Enterprise trust in digital platforms collapses"
      ],
      marketFailuresAr: [
        "مزود سحابة رئيسي يعاني من اختراق كارثي",
        "هجمات سلسلة التوريد تخترق موردين متعددين في وقت واحد",
        "البنية التحتية الحرجة مستهدفة من جهات راعية للدولة",
        "ثقة المؤسسات في المنصات الرقمية تنهار"
      ],
      competitorBreaks: [
        "Cloud-dependent vendors have no alternative infrastructure",
        "SaaS vendors cannot isolate customer data during breach",
        "Legacy security proves inadequate against advanced threats",
        "Shared infrastructure means one breach affects all customers"
      ],
      competitorBreaksAr: [
        "الموردون المعتمدون على السحابة ليس لديهم بنية تحتية بديلة",
        "بائعو SaaS لا يستطيعون عزل بيانات العملاء أثناء الاختراق",
        "الأمان القديم يثبت عدم كفايته ضد التهديدات المتقدمة",
        "البنية التحتية المشتركة تعني اختراق واحد يؤثر على جميع العملاء"
      ]
    },
    inferaResponse: {
      activatedLayers: [
        "Zero-Trust Architecture prevents lateral movement",
        "AI Threat Detection identifies attack vectors in real-time",
        "Autonomous Incident Response isolates affected systems instantly",
        "Sovereign deployment means no external dependencies during attack"
      ],
      activatedLayersAr: [
        "معمارية انعدام الثقة تمنع الحركة الجانبية",
        "اكتشاف التهديدات بـ AI يحدد نقاط الهجوم في الوقت الفعلي",
        "استجابة الحوادث المستقلة تعزل الأنظمة المتأثرة فوراً",
        "النشر السيادي يعني لا اعتماديات خارجية أثناء الهجوم"
      ],
      governanceAdaptation: "Security posture automatically elevates across all platforms, implementing stricter authentication and access controls without human intervention.",
      governanceAdaptationAr: "الوضع الأمني يرتفع تلقائياً عبر جميع المنصات، يطبق مصادقة أكثر صرامة وضوابط وصول بدون تدخل بشري.",
      aiAdaptation: "AI shifts to defensive mode, prioritizing threat detection, pattern recognition, and predictive defense across the ecosystem.",
      aiAdaptationAr: "AI يتحول لوضع الدفاع، يعطي الأولوية لاكتشاف التهديدات والتعرف على الأنماط والدفاع التنبؤي عبر المنظومة.",
      containmentActions: [
        "Instant isolation of potentially compromised components",
        "Automated backup and recovery procedures activated",
        "Real-time threat intelligence sharing with customers"
      ],
      containmentActionsAr: [
        "عزل فوري للمكونات المحتمل اختراقها",
        "إجراءات نسخ احتياطي واستعادة آلية مُفعلة",
        "مشاركة استخبارات التهديدات في الوقت الفعلي مع العملاء"
      ]
    },
    strategicConversion: {
      crisisToLeverage: "Cyber crisis proves INFERA's security architecture is not marketing—it is survival. Trust shifts to proven platforms.",
      crisisToLeverageAr: "الأزمة السيبرانية تثبت أن معمارية INFERA الأمنية ليست تسويقاً—إنها بقاء. الثقة تتحول للمنصات المُثبتة.",
      inferaGains: [
        "Customers fleeing breached competitors adopt INFERA immediately",
        "Security-conscious enterprises accelerate INFERA deployment",
        "Government agencies mandate sovereign infrastructure",
        "INFERA's incident-free record becomes primary sales argument"
      ],
      inferaGainsAr: [
        "العملاء الفارون من المنافسين المخترقين يتبنون INFERA فوراً",
        "المؤسسات الحريصة على الأمان تسرع نشر INFERA",
        "الوكالات الحكومية تفرض البنية التحتية السيادية",
        "سجل INFERA الخالي من الحوادث يصبح حجة المبيعات الرئيسية"
      ],
      competitorWeakening: [
        "Breached vendors lose customer trust permanently",
        "Cloud providers face regulatory investigations",
        "SaaS vendors cannot prove data integrity post-breach",
        "Insurance and liability costs make some competitors unviable"
      ],
      competitorWeakeningAr: [
        "الموردون المخترقون يخسرون ثقة العملاء نهائياً",
        "مزودو السحابة يواجهون تحقيقات تنظيمية",
        "بائعو SaaS لا يستطيعون إثبات سلامة البيانات بعد الاختراق",
        "تكاليف التأمين والمسؤولية تجعل بعض المنافسين غير قابلين للاستمرار"
      ]
    }
  },
  {
    id: "partner-loss",
    name: "Loss of a Major Partner or Market",
    nameAr: "فقدان شريك أو سوق رئيسي",
    icon: "UserMinus",
    initialShock: {
      marketFailures: [
        "Key market becomes inaccessible due to trade restrictions",
        "Major system integrator partnership dissolves",
        "Strategic customer exits due to acquisition or bankruptcy",
        "Critical supplier or technology partner fails"
      ],
      marketFailuresAr: [
        "سوق رئيسي يصبح غير قابل للوصول بسبب قيود التجارة",
        "شراكة مكامل أنظمة رئيسي تنحل",
        "عميل استراتيجي يخرج بسبب استحواذ أو إفلاس",
        "مورد حرج أو شريك تكنولوجي يفشل"
      ],
      competitorBreaks: [
        "Single-market vendors lose majority of revenue",
        "Partner-dependent vendors cannot deliver without integrator",
        "Supply chain concentration creates existential risk",
        "Customer concentration means major account loss is catastrophic"
      ],
      competitorBreaksAr: [
        "الموردون ذوو السوق الواحد يخسرون غالبية الإيرادات",
        "الموردون المعتمدون على الشركاء لا يستطيعون التسليم بدون المكامل",
        "تركز سلسلة التوريد ينشئ مخاطر وجودية",
        "تركز العملاء يعني خسارة حساب رئيسي كارثية"
      ]
    },
    inferaResponse: {
      activatedLayers: [
        "Multi-market presence provides geographic diversification",
        "Partner ecosystem means no single integrator dependency",
        "Platform factory model enables rapid market pivot",
        "Sovereign licensing creates direct government relationships"
      ],
      activatedLayersAr: [
        "التواجد في أسواق متعددة يوفر تنويعاً جغرافياً",
        "منظومة الشركاء تعني لا اعتماد على مكامل واحد",
        "نموذج مصنع المنصات يمكّن التحول السريع للأسواق",
        "الترخيص السيادي ينشئ علاقات حكومية مباشرة"
      ],
      governanceAdaptation: "Risk distribution algorithms automatically rebalance resource allocation away from affected markets or partners.",
      governanceAdaptationAr: "خوارزميات توزيع المخاطر تعيد توازن تخصيص الموارد تلقائياً بعيداً عن الأسواق أو الشركاء المتأثرين.",
      aiAdaptation: "AI identifies alternative markets, partners, and customer segments with highest conversion probability.",
      aiAdaptationAr: "AI يحدد الأسواق والشركاء وشرائح العملاء البديلة ذات أعلى احتمال تحويل.",
      containmentActions: [
        "Accelerated engagement with alternative partners",
        "Market expansion into adjacent regions",
        "Direct enterprise sales to reduce partner dependency"
      ],
      containmentActionsAr: [
        "تسريع التواصل مع شركاء بديلين",
        "توسع السوق للمناطق المجاورة",
        "مبيعات مؤسسية مباشرة لتقليل الاعتماد على الشركاء"
      ]
    },
    strategicConversion: {
      crisisToLeverage: "Partner or market loss reveals competitor fragility while demonstrating INFERA's diversification strength.",
      crisisToLeverageAr: "فقدان الشريك أو السوق يكشف هشاشة المنافسين بينما يوضح قوة تنويع INFERA.",
      inferaGains: [
        "Competitors' orphaned customers in affected market seek alternatives",
        "Failed partners' customers become direct INFERA accounts",
        "Market exit creates acquisition opportunities",
        "Diversification story strengthens investor confidence"
      ],
      inferaGainsAr: [
        "عملاء المنافسين اليتامى في السوق المتأثر يبحثون عن بدائل",
        "عملاء الشركاء الفاشلين يصبحون حسابات INFERA مباشرة",
        "خروج السوق ينشئ فرص استحواذ",
        "قصة التنويع تعزز ثقة المستثمرين"
      ],
      competitorWeakening: [
        "Single-market competitors face existential revenue loss",
        "Partner-dependent vendors cannot fulfill obligations",
        "Concentrated vendors lose customer confidence",
        "Recovery time for competitors measured in years"
      ],
      competitorWeakeningAr: [
        "المنافسون ذوو السوق الواحد يواجهون خسارة إيرادات وجودية",
        "الموردون المعتمدون على الشركاء لا يستطيعون الوفاء بالالتزامات",
        "الموردون المركزون يخسرون ثقة العملاء",
        "وقت التعافي للمنافسين يُقاس بالسنوات"
      ]
    }
  },
  {
    id: "geopolitical-pressure",
    name: "Sudden Geopolitical or Sovereignty Pressure",
    nameAr: "ضغط جيوسياسي أو سيادي مفاجئ",
    icon: "Globe",
    initialShock: {
      marketFailures: [
        "Governments mandate local data sovereignty overnight",
        "Trade sanctions restrict technology transfers",
        "Foreign technology vendors banned from critical sectors",
        "National security reviews block foreign acquisitions"
      ],
      marketFailuresAr: [
        "الحكومات تفرض سيادة البيانات المحلية بين عشية وضحاها",
        "عقوبات التجارة تقيد نقل التكنولوجيا",
        "بائعو التكنولوجيا الأجانب محظورون من القطاعات الحرجة",
        "مراجعات الأمن القومي تمنع الاستحواذات الأجنبية"
      ],
      competitorBreaks: [
        "US cloud vendors lose access to sovereign markets",
        "Foreign SaaS vendors must exit government sectors",
        "Technology dependencies become national security risks",
        "Multinational vendors face fragmented compliance requirements"
      ],
      competitorBreaksAr: [
        "موردو السحابة الأمريكيون يفقدون الوصول للأسواق السيادية",
        "بائعو SaaS الأجانب يجب أن يخرجوا من القطاعات الحكومية",
        "اعتماديات التكنولوجيا تصبح مخاطر أمن قومي",
        "الموردون متعددو الجنسيات يواجهون متطلبات امتثال مجزأة"
      ]
    },
    inferaResponse: {
      activatedLayers: [
        "Sovereign-first architecture designed for this scenario",
        "Local deployment with full technology transfer available",
        "No foreign dependencies in core operations",
        "Government relationships already established"
      ],
      activatedLayersAr: [
        "معمارية السيادة-أولاً مصممة لهذا السيناريو",
        "نشر محلي مع نقل تكنولوجي كامل متاح",
        "لا اعتماديات أجنبية في العمليات الأساسية",
        "علاقات حكومية مُنشأة بالفعل"
      ],
      governanceAdaptation: "Sovereignty controls activate fully, ensuring complete local operation with zero external data flows or dependencies.",
      governanceAdaptationAr: "ضوابط السيادة تُفعل بالكامل، تضمن تشغيلاً محلياً كاملاً مع صفر تدفقات بيانات أو اعتماديات خارجية.",
      aiAdaptation: "AI models operate entirely within sovereign boundaries, with all training and inference contained locally.",
      aiAdaptationAr: "نماذج AI تعمل بالكامل ضمن الحدود السيادية، مع جميع التدريب والاستدلال محتوى محلياً.",
      containmentActions: [
        "Rapid deployment of sovereign infrastructure packages",
        "Government-specific compliance acceleration",
        "Local partner enablement for in-country delivery"
      ],
      containmentActionsAr: [
        "نشر سريع لحزم البنية التحتية السيادية",
        "تسريع امتثال خاص بالحكومات",
        "تمكين شركاء محليين للتسليم داخل البلد"
      ]
    },
    strategicConversion: {
      crisisToLeverage: "Geopolitical crisis validates INFERA's existence. Sovereignty is no longer optional—it is mandated. INFERA is the only ready solution.",
      crisisToLeverageAr: "الأزمة الجيوسياسية تُصادق على وجود INFERA. السيادة لم تعد اختيارية—إنها إلزامية. INFERA هي الحل الجاهز الوحيد.",
      inferaGains: [
        "Governments mandate INFERA as compliant infrastructure",
        "Foreign vendors' customers forced to migrate immediately",
        "Sovereign premium pricing fully justified by mandate",
        "First-mover advantage in newly sovereign markets"
      ],
      inferaGainsAr: [
        "الحكومات تفرض INFERA كبنية تحتية متوافقة",
        "عملاء الموردين الأجانب يُجبرون على الهجرة فوراً",
        "تسعير علاوة السيادة مبرر بالكامل بالتفويض",
        "ميزة الرائد الأول في الأسواق السيادية حديثاً"
      ],
      competitorWeakening: [
        "Foreign vendors banned from critical infrastructure",
        "Cloud providers lose access to sovereign markets permanently",
        "Multinational vendors face years of restructuring",
        "Competitors without local presence cannot compete"
      ],
      competitorWeakeningAr: [
        "الموردون الأجانب محظورون من البنية التحتية الحرجة",
        "مزودو السحابة يفقدون الوصول للأسواق السيادية نهائياً",
        "الموردون متعددو الجنسيات يواجهون سنوات من إعادة الهيكلة",
        "المنافسون بدون تواجد محلي لا يستطيعون المنافسة"
      ]
    }
  }
];

export const crisisReadinessSummary = {
  title: "INFERA Anti-Fragility Principle",
  titleAr: "مبدأ مقاومة الهشاشة في INFERA",
  principle: {
    en: "INFERA is not designed to survive crisis. It is designed to become stronger because of crisis. Every crisis that weakens competitors strengthens INFERA's market position, validates our architecture, and accelerates customer adoption.",
    ar: "INFERA ليست مصممة للنجاة من الأزمات. إنها مصممة لتصبح أقوى بسبب الأزمات. كل أزمة تُضعف المنافسين تُقوي موقع INFERA في السوق، وتُصادق على معماريتنا، وتُسرع تبني العملاء."
  },
  keyAssurances: [
    {
      audience: "Investors",
      audienceAr: "المستثمرون",
      assurance: "Crisis is not risk—it is opportunity. INFERA's anti-fragile architecture means market disruption accelerates our growth while eliminating competitors.",
      assuranceAr: "الأزمة ليست مخاطرة—إنها فرصة. معمارية INFERA المقاومة للهشاشة تعني أن اضطراب السوق يسرع نمونا بينما يقضي على المنافسين."
    },
    {
      audience: "Governments",
      audienceAr: "الحكومات",
      assurance: "INFERA is designed for the exact scenarios governments fear most. When crisis comes, INFERA is the infrastructure that remains operational.",
      assuranceAr: "INFERA مصممة للسيناريوهات بالضبط التي تخشاها الحكومات أكثر. عندما تأتي الأزمة، INFERA هي البنية التحتية التي تبقى تشغيلية."
    },
    {
      audience: "Enterprises",
      audienceAr: "المؤسسات",
      assurance: "Adopting INFERA is crisis insurance. Every crisis scenario we've analyzed shows INFERA customers gaining advantage while competitors' customers suffer.",
      assuranceAr: "تبني INFERA هو تأمين ضد الأزمات. كل سيناريو أزمة حللناه يظهر عملاء INFERA يكتسبون ميزة بينما يعاني عملاء المنافسين."
    }
  ]
};
