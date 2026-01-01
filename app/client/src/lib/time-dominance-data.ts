// INFERA Time Dominance Layer™
// السيطرة على الزمن – منع اللحاق المستقبلي

export interface TimeHorizon {
  id: string;
  name: string;
  nameAr: string;
  period: string;
  periodAr: string;
  structuralPosition: {
    whatControls: string[];
    whatControlsAr: string[];
    irreversibleLayers: string[];
    irreversibleLayersAr: string[];
    lockedDecisions: string[];
    lockedDecisionsAr: string[];
  };
  marketGapCreation: {
    competitorsTrying: string[];
    competitorsTryingAr: string[];
    whyStructurallyLate: string;
    whyStructurallyLateAr: string;
    blockingDependencies: string[];
    blockingDependenciesAr: string[];
  };
  irreversibleAdvantage: {
    governanceLockIn: string;
    governanceLockInAr: string;
    dataCompounding: string;
    dataCompoundingAr: string;
    aiLearningAsymmetry: string;
    aiLearningAsymmetryAr: string;
    sovereignTrust: string;
    sovereignTrustAr: string;
  };
}

export const timeHorizons: TimeHorizon[] = [
  {
    id: "short-term",
    name: "Short Term",
    nameAr: "المدى القصير",
    period: "0–24 months",
    periodAr: "0–24 شهراً",
    structuralPosition: {
      whatControls: [
        "21+ integrated sovereign platforms operational",
        "First government sovereign deployments live",
        "AI Orchestrator learning from real production data",
        "Blueprint-first architecture validated at scale",
        "Enterprise pilot-to-expansion pipeline established"
      ],
      whatControlsAr: [
        "21+ منصة سيادية متكاملة تشغيلية",
        "أول نشر حكومي سيادي حي",
        "منسق AI يتعلم من بيانات الإنتاج الفعلية",
        "معمارية Blueprint-أولاً مُتحققة على نطاق واسع",
        "خط أنابيب التجريبي-للتوسع المؤسسي مُنشأ"
      ],
      irreversibleLayers: [
        "Sovereign governance architecture embedded in customer operations",
        "AI learning from proprietary cross-platform interactions",
        "Government trust relationships formalized"
      ],
      irreversibleLayersAr: [
        "معمارية حوكمة سيادية مدمجة في عمليات العملاء",
        "AI يتعلم من تفاعلات عبر المنصات الخاصة",
        "علاقات ثقة حكومية رسمية"
      ],
      lockedDecisions: [
        "Customers committed to sovereign-first infrastructure",
        "Data residency and control patterns established",
        "Integration architectures dependent on INFERA governance"
      ],
      lockedDecisionsAr: [
        "العملاء ملتزمون بالبنية التحتية السيادة-أولاً",
        "أنماط إقامة البيانات والتحكم مُنشأة",
        "معماريات التكامل تعتمد على حوكمة INFERA"
      ]
    },
    marketGapCreation: {
      competitorsTrying: [
        "Adding AI features to legacy architectures",
        "Marketing 'sovereign cloud' without true control transfer",
        "Building single platforms, not platform factories"
      ],
      competitorsTryingAr: [
        "إضافة ميزات AI للمعماريات القديمة",
        "تسويق 'السحابة السيادية' بدون نقل تحكم حقيقي",
        "بناء منصات فردية، وليس مصانع منصات"
      ],
      whyStructurallyLate: "Competitors cannot rebuild their architectures without destroying existing revenue. They are optimizing the old while we define the new.",
      whyStructurallyLateAr: "المنافسون لا يستطيعون إعادة بناء معماريتهم بدون تدمير الإيرادات الحالية. هم يحسنون القديم بينما نحن نحدد الجديد.",
      blockingDependencies: [
        "Legacy customer commitments requiring backwards compatibility",
        "Cloud provider revenue dependencies",
        "Shareholder expectations tied to current models"
      ],
      blockingDependenciesAr: [
        "التزامات العملاء القديمة تتطلب التوافق الخلفي",
        "اعتماديات إيرادات مزودي السحابة",
        "توقعات المساهمين مرتبطة بالنماذج الحالية"
      ]
    },
    irreversibleAdvantage: {
      governanceLockIn: "Early adopters embed INFERA governance into their compliance frameworks. Switching means regulatory re-certification.",
      governanceLockInAr: "المتبنون المبكرون يدمجون حوكمة INFERA في أطر امتثالهم. التبديل يعني إعادة الشهادة التنظيمية.",
      dataCompounding: "Every customer interaction trains AI models that improve governance, security, and efficiency for all customers.",
      dataCompoundingAr: "كل تفاعل عميل يدرب نماذج AI التي تحسن الحوكمة والأمان والكفاءة لجميع العملاء.",
      aiLearningAsymmetry: "INFERA AI learns from 21+ platform types simultaneously. Single-platform competitors learn from one.",
      aiLearningAsymmetryAr: "AI INFERA يتعلم من 21+ نوع منصة في وقت واحد. المنافسون ذوو المنصة الواحدة يتعلمون من واحدة.",
      sovereignTrust: "First government deployments create reference architectures. New governments look to early adopters for validation.",
      sovereignTrustAr: "أول نشر حكومي ينشئ معماريات مرجعية. الحكومات الجديدة تنظر للمتبنين المبكرين للتحقق."
    }
  },
  {
    id: "mid-term",
    name: "Mid Term",
    nameAr: "المدى المتوسط",
    period: "2–5 years",
    periodAr: "2–5 سنوات",
    structuralPosition: {
      whatControls: [
        "Multiple national digital infrastructure deployments",
        "Cross-platform AI intelligence creating compound insights",
        "Partner ecosystem delivering INFERA through global channels",
        "Industry-specific platform variants dominating verticals",
        "Regulatory frameworks referencing INFERA standards"
      ],
      whatControlsAr: [
        "نشر متعدد للبنية التحتية الرقمية الوطنية",
        "ذكاء AI عبر المنصات ينشئ رؤى مركبة",
        "منظومة شركاء تقدم INFERA عبر قنوات عالمية",
        "متغيرات منصة خاصة بالصناعة تهيمن على القطاعات",
        "أطر تنظيمية ترجع لمعايير INFERA"
      ],
      irreversibleLayers: [
        "National digital infrastructure dependent on INFERA architecture",
        "Partner business models built around INFERA ecosystem",
        "Regulatory compliance pathways designed for INFERA governance"
      ],
      irreversibleLayersAr: [
        "البنية التحتية الرقمية الوطنية تعتمد على معمارية INFERA",
        "نماذج أعمال الشركاء مبنية حول منظومة INFERA",
        "مسارات الامتثال التنظيمي مصممة لحوكمة INFERA"
      ],
      lockedDecisions: [
        "National technology strategies aligned with INFERA capabilities",
        "Enterprise digital transformation built on INFERA foundation",
        "Partner certifications and training investments locked in"
      ],
      lockedDecisionsAr: [
        "استراتيجيات التكنولوجيا الوطنية متوافقة مع قدرات INFERA",
        "التحول الرقمي المؤسسي مبني على أساس INFERA",
        "شهادات الشركاء واستثمارات التدريب مقفلة"
      ]
    },
    marketGapCreation: {
      competitorsTrying: [
        "Launching 'sovereign versions' of existing products",
        "Acquiring startups to bolt on AI capabilities",
        "Forming consortiums to create platform standards"
      ],
      competitorsTryingAr: [
        "إطلاق 'نسخ سيادية' من المنتجات الحالية",
        "استحواذ على شركات ناشئة لإضافة قدرات AI",
        "تشكيل تحالفات لإنشاء معايير منصات"
      ],
      whyStructurallyLate: "Competitors are 5 years behind architecturally. Their acquisitions create integration debt, not platform factories. Consortiums cannot agree on governance models.",
      whyStructurallyLateAr: "المنافسون متأخرون 5 سنوات معمارياً. استحواذاتهم تنشئ ديون تكامل، وليس مصانع منصات. التحالفات لا تستطيع الاتفاق على نماذج الحوكمة.",
      blockingDependencies: [
        "Acquired companies require years of integration",
        "Consortium members have conflicting interests",
        "Customer migrations from legacy create 3-5 year timelines"
      ],
      blockingDependenciesAr: [
        "الشركات المستحوذ عليها تتطلب سنوات من التكامل",
        "أعضاء التحالف لديهم مصالح متضاربة",
        "ترحيل العملاء من القديم ينشئ جداول زمنية 3-5 سنوات"
      ]
    },
    irreversibleAdvantage: {
      governanceLockIn: "INFERA governance becomes the reference standard. Regulators design compliance frameworks around our architecture.",
      governanceLockInAr: "حوكمة INFERA تصبح المعيار المرجعي. المنظمون يصممون أطر الامتثال حول معماريتنا.",
      dataCompounding: "5 years of cross-platform AI learning creates intelligence assets that cannot be replicated without the same time investment.",
      dataCompoundingAr: "5 سنوات من تعلم AI عبر المنصات تنشئ أصول ذكاء لا يمكن تكرارها بدون نفس استثمار الوقت.",
      aiLearningAsymmetry: "INFERA AI has processed millions of governance decisions. Competitors starting from zero cannot close this gap.",
      aiLearningAsymmetryAr: "AI INFERA عالج ملايين قرارات الحوكمة. المنافسون البادئون من الصفر لا يستطيعون إغلاق هذه الفجوة.",
      sovereignTrust: "Government case studies become the gold standard. Nations choosing digital transformation look to INFERA adopters first.",
      sovereignTrustAr: "دراسات الحالة الحكومية تصبح المعيار الذهبي. الدول التي تختار التحول الرقمي تنظر للمتبنين أولاً."
    }
  },
  {
    id: "long-term",
    name: "Long Term",
    nameAr: "المدى الطويل",
    period: "5–10 years",
    periodAr: "5–10 سنوات",
    structuralPosition: {
      whatControls: [
        "Global sovereign infrastructure standard position",
        "AI governance intelligence that defines industry norms",
        "Multi-generational platform evolution capability",
        "Ecosystem of platforms that self-reinforce value",
        "Regulatory and compliance frameworks globally aligned"
      ],
      whatControlsAr: [
        "موقع معيار البنية التحتية السيادية العالمية",
        "ذكاء حوكمة AI يحدد معايير الصناعة",
        "قدرة تطور منصة متعددة الأجيال",
        "منظومة منصات تعزز القيمة ذاتياً",
        "أطر تنظيمية وامتثال متوافقة عالمياً"
      ],
      irreversibleLayers: [
        "Digital sovereignty globally defined by INFERA standards",
        "National digital strategies dependent on INFERA evolution",
        "Global talent pool trained on INFERA architectures"
      ],
      irreversibleLayersAr: [
        "السيادة الرقمية عالمياً محددة بمعايير INFERA",
        "استراتيجيات رقمية وطنية تعتمد على تطور INFERA",
        "تجمع مواهب عالمي مدرب على معماريات INFERA"
      ],
      lockedDecisions: [
        "Global digital infrastructure built on INFERA foundation",
        "Regulatory frameworks assume INFERA-style governance",
        "Enterprise architecture standards reference INFERA patterns"
      ],
      lockedDecisionsAr: [
        "البنية التحتية الرقمية العالمية مبنية على أساس INFERA",
        "الأطر التنظيمية تفترض حوكمة على نمط INFERA",
        "معايير معمارية المؤسسات ترجع لأنماط INFERA"
      ]
    },
    marketGapCreation: {
      competitorsTrying: [
        "Building 'next generation' platforms that arrive too late",
        "Partnering with INFERA rather than competing",
        "Exiting enterprise sovereign market entirely"
      ],
      competitorsTryingAr: [
        "بناء منصات 'الجيل التالي' التي تصل متأخرة جداً",
        "الشراكة مع INFERA بدلاً من المنافسة",
        "الخروج من سوق المؤسسات السيادية بالكامل"
      ],
      whyStructurallyLate: "The time to build sovereign AI infrastructure was 10 years ago. Competitors entering now face a decade of accumulated advantage they cannot shortcut.",
      whyStructurallyLateAr: "وقت بناء البنية التحتية لـ AI السيادي كان قبل 10 سنوات. المنافسون الداخلون الآن يواجهون عقداً من الميزة المتراكمة التي لا يستطيعون اختصارها.",
      blockingDependencies: [
        "Talent trained on INFERA, not alternatives",
        "Regulatory frameworks assume INFERA standards",
        "Customer switching costs approach total rebuild"
      ],
      blockingDependenciesAr: [
        "المواهب مدربة على INFERA، وليس البدائل",
        "الأطر التنظيمية تفترض معايير INFERA",
        "تكاليف تبديل العملاء تقترب من إعادة البناء الكامل"
      ]
    },
    irreversibleAdvantage: {
      governanceLockIn: "INFERA governance IS the governance standard. Alternatives must justify deviation from established norms.",
      governanceLockInAr: "حوكمة INFERA هي معيار الحوكمة. البدائل يجب أن تبرر الانحراف عن المعايير المنشأة.",
      dataCompounding: "A decade of compound intelligence creates an insurmountable knowledge asset. Starting today means finishing in 2035.",
      dataCompoundingAr: "عقد من الذكاء المركب ينشئ أصل معرفة لا يمكن تجاوزه. البدء اليوم يعني الانتهاء في 2035.",
      aiLearningAsymmetry: "INFERA AI has evolved through multiple generations. Competitors still building version 1 while we release version N.",
      aiLearningAsymmetryAr: "AI INFERA تطور عبر أجيال متعددة. المنافسون لا يزالون يبنون النسخة 1 بينما نصدر النسخة N.",
      sovereignTrust: "Trust is not built—it is earned over time. A decade of sovereign trust cannot be purchased or accelerated.",
      sovereignTrustAr: "الثقة لا تُبنى—تُكتسب مع الوقت. عقد من الثقة السيادية لا يمكن شراؤها أو تسريعها."
    }
  }
];

export const timeDominanceNarrative = {
  title: "Why Catching Up is Impossible",
  titleAr: "لماذا اللحاق مستحيل",
  executiveSummary: {
    en: "INFERA's competitive advantage is not a feature set—it is a time position. We are not ahead because we are faster; we are ahead because we started building the right architecture years before competitors understood what was needed. Every day that passes increases this gap. Competitors cannot buy time. They cannot acquire time. They cannot shortcut time. And the compound effects of governance, AI learning, and sovereign trust accumulation cannot be replicated without investing the same years we have already invested.",
    ar: "الميزة التنافسية لـ INFERA ليست مجموعة ميزات—إنها موقع زمني. نحن لسنا متقدمين لأننا أسرع؛ نحن متقدمين لأننا بدأنا ببناء المعمارية الصحيحة قبل سنوات من فهم المنافسين لما هو مطلوب. كل يوم يمر يزيد هذه الفجوة. المنافسون لا يستطيعون شراء الوقت. لا يستطيعون الاستحواذ على الوقت. لا يستطيعون اختصار الوقت. والتأثيرات المركبة للحوكمة وتعلم AI وتراكم الثقة السيادية لا يمكن تكرارها بدون استثمار نفس السنوات التي استثمرناها بالفعل."
  },
  keyInsights: [
    {
      insight: "Time Cannot Be Purchased",
      insightAr: "الوقت لا يمكن شراؤه",
      explanation: "A competitor with $10B cannot buy the 5+ years of architectural development INFERA has completed. Money accelerates execution, not fundamental research.",
      explanationAr: "منافس بـ 10 مليار دولار لا يستطيع شراء 5+ سنوات من التطوير المعماري الذي أكملته INFERA. المال يسرع التنفيذ، وليس البحث الأساسي."
    },
    {
      insight: "Compound Effects Accelerate Daily",
      insightAr: "التأثيرات المركبة تتسارع يومياً",
      explanation: "Every customer, every deployment, every governance decision trains INFERA's AI. This learning compounds. Competitors starting today will never close a gap that grows every day.",
      explanationAr: "كل عميل، كل نشر، كل قرار حوكمة يدرب AI INFERA. هذا التعلم يتراكم. المنافسون البادئون اليوم لن يغلقوا فجوة تنمو كل يوم."
    },
    {
      insight: "Trust Is Earned, Not Declared",
      insightAr: "الثقة تُكتسب، لا تُعلن",
      explanation: "Governments and enterprises trust INFERA because of demonstrated capability over years. New entrants claiming 'sovereign' have no track record. Trust takes time.",
      explanationAr: "الحكومات والمؤسسات تثق بـ INFERA بسبب القدرة المُظهرة عبر السنوات. الداخلون الجدد الذين يدعون 'السيادة' ليس لديهم سجل. الثقة تستغرق وقتاً."
    },
    {
      insight: "Architecture Locks Future Options",
      insightAr: "المعمارية تقفل الخيارات المستقبلية",
      explanation: "Customers who adopt INFERA embed our governance into their compliance, their workflows, their strategy. Switching means rebuilding everything—a decision no rational actor makes.",
      explanationAr: "العملاء الذين يتبنون INFERA يدمجون حوكمتنا في امتثالهم وعملياتهم واستراتيجيتهم. التبديل يعني إعادة بناء كل شيء—قرار لا يتخذه أي فاعل عقلاني."
    }
  ],
  conclusion: {
    en: "INFERA does not compete on features, price, or marketing. We compete on time. And time is the one resource that cannot be acquired, accelerated, or replicated. Every day we operate is a day competitors cannot recover.",
    ar: "INFERA لا تتنافس على الميزات أو السعر أو التسويق. نحن نتنافس على الوقت. والوقت هو المورد الوحيد الذي لا يمكن الاستحواذ عليه أو تسريعه أو تكراره. كل يوم نعمل فيه هو يوم لا يستطيع المنافسون استرداده."
  }
};
