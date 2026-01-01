// INFERA Strategic Dominance Extension Data
// Step 6: Sovereign Narrative Lock
// Step 7: Competitive Kill Map
// Step 8: Sovereign Readiness Index

// =====================================================================
// STEP 6: SOVEREIGN NARRATIVE LOCK
// =====================================================================

export interface NarrativeRule {
  id: string;
  rule: string;
  ruleAr: string;
  enforcement: string;
  enforcementAr: string;
  examples: string[];
  examplesAr: string[];
}

export interface SovereignNarrativeLock {
  coreNarrative: {
    headline: string;
    headlineAr: string;
    subheadline: string;
    subheadlineAr: string;
    essence: string;
    essenceAr: string;
  };
  pillars: {
    id: string;
    name: string;
    nameAr: string;
    description: string;
    descriptionAr: string;
    icon: string;
  }[];
  rules: NarrativeRule[];
  mandatoryPhrases: {
    phrase: string;
    phraseAr: string;
    context: string;
    contextAr: string;
  }[];
  forbiddenPhrases: {
    phrase: string;
    phraseAr: string;
    reason: string;
    reasonAr: string;
  }[];
}

export const sovereignNarrativeLock: SovereignNarrativeLock = {
  coreNarrative: {
    headline: "INFERA: The Sovereign Platform Factory",
    headlineAr: "INFERA: مصنع المنصات السيادية",
    subheadline: "Build. Own. Govern. Evolve.",
    subheadlineAr: "ابنِ. امتلك. احكم. تطور.",
    essence: "INFERA is not a product—it is a platform factory. We don't sell software; we enable organizations to achieve complete digital sovereignty through AI-powered autonomous platforms that they own, control, and evolve without external dependencies.",
    essenceAr: "INFERA ليس منتجاً—إنه مصنع منصات. نحن لا نبيع برمجيات؛ بل نمكّن المؤسسات من تحقيق سيادة رقمية كاملة من خلال منصات مستقلة مدعومة بالذكاء الاصطناعي يمتلكونها ويتحكمون بها ويطورونها دون اعتمادات خارجية.",
  },
  pillars: [
    {
      id: "sovereignty",
      name: "Complete Sovereignty",
      nameAr: "السيادة الكاملة",
      description: "100% ownership and control of data, code, and operations. Zero vendor lock-in. Zero external dependencies.",
      descriptionAr: "ملكية وتحكم 100% في البيانات والكود والعمليات. صفر قفل على الموردين. صفر اعتمادات خارجية.",
      icon: "Shield",
    },
    {
      id: "ai-first",
      name: "AI-First Architecture",
      nameAr: "معمارية AI-أولاً",
      description: "Native AI in every platform. Not bolted on—built in. Intelligence that learns, predicts, and acts autonomously.",
      descriptionAr: "ذكاء اصطناعي أصلي في كل منصة. ليس مضافاً—مبني. ذكاء يتعلم ويتنبأ ويتصرف باستقلالية.",
      icon: "Brain",
    },
    {
      id: "autonomous-governance",
      name: "Autonomous Governance",
      nameAr: "الحوكمة المستقلة",
      description: "AI that doesn't just alert—it governs. Policies enforced automatically. Compliance guaranteed continuously.",
      descriptionAr: "ذكاء اصطناعي لا ينبه فقط—بل يحكم. سياسات تُطبق تلقائياً. امتثال مضمون باستمرار.",
      icon: "Settings",
    },
    {
      id: "platform-factory",
      name: "Platform Factory Model",
      nameAr: "نموذج مصنع المنصات",
      description: "We don't build one platform—we build the factory that creates unlimited platforms. Generate, deploy, govern automatically.",
      descriptionAr: "نحن لا نبني منصة واحدة—نبني المصنع الذي ينشئ منصات غير محدودة. إنشاء ونشر وحوكمة تلقائياً.",
      icon: "Factory",
    },
    {
      id: "ecosystem-integration",
      name: "Ecosystem Integration",
      nameAr: "تكامل المنظومة",
      description: "21+ platforms that work together seamlessly. Shared intelligence. Unified governance. Compound value.",
      descriptionAr: "21+ منصة تعمل معاً بسلاسة. ذكاء مشترك. حوكمة موحدة. قيمة مركبة.",
      icon: "Network",
    },
  ],
  rules: [
    {
      id: "rule-1",
      rule: "Always lead with sovereignty, not features",
      ruleAr: "دائماً ابدأ بالسيادة، وليس الميزات",
      enforcement: "Every pitch must open with the sovereignty value proposition before discussing any features",
      enforcementAr: "كل عرض يجب أن يبدأ بقيمة السيادة المقترحة قبل مناقشة أي ميزات",
      examples: ["We enable complete digital sovereignty", "Own your digital destiny"],
      examplesAr: ["نمكّن السيادة الرقمية الكاملة", "امتلك مصيرك الرقمي"],
    },
    {
      id: "rule-2",
      rule: "Position as platform factory, not software vendor",
      ruleAr: "موضع كمصنع منصات، وليس بائع برمجيات",
      enforcement: "Never describe INFERA as software or SaaS. Always as a platform factory or ecosystem",
      enforcementAr: "لا تصف INFERA أبداً كبرمجيات أو SaaS. دائماً كمصنع منصات أو منظومة",
      examples: ["Platform factory", "Ecosystem", "Digital infrastructure"],
      examplesAr: ["مصنع منصات", "منظومة", "بنية تحتية رقمية"],
    },
    {
      id: "rule-3",
      rule: "AI is native, not added",
      ruleAr: "AI أصلي، وليس مضافاً",
      enforcement: "Always emphasize that AI is built into the architecture, not an add-on feature",
      enforcementAr: "دائماً أكد أن AI مبني في المعمارية، وليس ميزة إضافية",
      examples: ["Native AI", "AI-first architecture", "Built-in intelligence"],
      examplesAr: ["ذكاء اصطناعي أصلي", "معمارية AI-أولاً", "ذكاء مدمج"],
    },
    {
      id: "rule-4",
      rule: "Governance is autonomous, not manual",
      ruleAr: "الحوكمة مستقلة، وليست يدوية",
      enforcement: "Present all governance as AI-driven and automatic, never requiring human intervention for routine operations",
      enforcementAr: "قدم كل الحوكمة كمدفوعة بالذكاء الاصطناعي وتلقائية، لا تتطلب أبداً تدخلاً بشرياً للعمليات الروتينية",
      examples: ["Autonomous governance", "Self-governing", "AI-enforced policies"],
      examplesAr: ["حوكمة مستقلة", "حكم ذاتي", "سياسات يطبقها AI"],
    },
    {
      id: "rule-5",
      rule: "Competitors are structurally inferior, not just different",
      ruleAr: "المنافسون أدنى هيكلياً، وليسوا مختلفين فقط",
      enforcement: "When comparing to competitors, focus on architectural impossibility, not just feature gaps",
      enforcementAr: "عند المقارنة مع المنافسين، ركز على الاستحالة المعمارية، وليس فقط فجوات الميزات",
      examples: ["Cannot evolve", "Architectural limitation", "Legacy constraints"],
      examplesAr: ["لا يستطيعون التطور", "قيود معمارية", "قيود تقليدية"],
    },
  ],
  mandatoryPhrases: [
    { phrase: "Sovereign", phraseAr: "سيادي", context: "All content describing ownership and control", contextAr: "كل المحتوى الذي يصف الملكية والتحكم" },
    { phrase: "AI-First", phraseAr: "AI-أولاً", context: "All content describing architecture", contextAr: "كل المحتوى الذي يصف المعمارية" },
    { phrase: "Platform Factory", phraseAr: "مصنع المنصات", context: "When describing what INFERA is", contextAr: "عند وصف ما هي INFERA" },
    { phrase: "Autonomous Governance", phraseAr: "الحوكمة المستقلة", context: "When describing how platforms are managed", contextAr: "عند وصف كيفية إدارة المنصات" },
    { phrase: "Zero Vendor Lock-in", phraseAr: "صفر قفل على الموردين", context: "When discussing competitive advantages", contextAr: "عند مناقشة المزايا التنافسية" },
  ],
  forbiddenPhrases: [
    { phrase: "SaaS platform", phraseAr: "منصة SaaS", reason: "Undermines sovereignty positioning", reasonAr: "يقوض موقع السيادة" },
    { phrase: "Cloud software", phraseAr: "برمجيات سحابية", reason: "Too generic, loses differentiation", reasonAr: "عام جداً، يفقد التميز" },
    { phrase: "Similar to...", phraseAr: "مشابه لـ...", reason: "Never position as similar to anything", reasonAr: "لا تضع أبداً كمشابه لأي شيء" },
    { phrase: "Like Salesforce but...", phraseAr: "مثل Salesforce لكن...", reason: "Never use competitor comparisons that suggest similarity", reasonAr: "لا تستخدم أبداً مقارنات المنافسين التي توحي بالتشابه" },
    { phrase: "Integration with...", phraseAr: "التكامل مع...", reason: "Suggests dependency on external systems", reasonAr: "يوحي بالاعتماد على أنظمة خارجية" },
  ],
};

// =====================================================================
// STEP 7: COMPETITIVE KILL MAP
// =====================================================================

export interface CompetitorAnalysis {
  name: string;
  category: string;
  categoryAr: string;
  architecturalWeakness: string;
  architecturalWeaknessAr: string;
  governanceGap: string;
  governanceGapAr: string;
  aiLimitation: string;
  aiLimitationAr: string;
  sovereigntyFailure: string;
  sovereigntyFailureAr: string;
  whyCannotEvolve: string;
  whyCannotEvolveAr: string;
}

export interface PlatformKillMap {
  platformId: string;
  platformName: string;
  platformNameAr: string;
  competitors: CompetitorAnalysis[];
  superiorityStatement: string;
  superiorityStatementAr: string;
}

export const competitiveKillMaps: PlatformKillMap[] = [
  {
    platformId: "webnova",
    platformName: "INFERA WebNova",
    platformNameAr: "إنفيرا ويب نوفا",
    competitors: [
      {
        name: "Salesforce Platform",
        category: "Enterprise CRM/Platform",
        categoryAr: "منصة CRM للمؤسسات",
        architecturalWeakness: "Multi-tenant shared infrastructure with limited customization depth",
        architecturalWeaknessAr: "بنية تحتية مشتركة متعددة المستأجرين مع عمق تخصيص محدود",
        governanceGap: "Governance is policy-based, not AI-driven autonomous enforcement",
        governanceGapAr: "الحوكمة قائمة على السياسات، وليست تطبيقاً مستقلاً مدفوعاً بالذكاء الاصطناعي",
        aiLimitation: "Einstein AI is bolted-on, not native to architecture",
        aiLimitationAr: "Einstein AI مضاف، وليس أصلياً في المعمارية",
        sovereigntyFailure: "Complete vendor dependency, data in Salesforce cloud only",
        sovereigntyFailureAr: "اعتماد كامل على المورد، البيانات في سحابة Salesforce فقط",
        whyCannotEvolve: "10,000+ enterprise customers locked into current architecture. Any fundamental change would break existing deployments.",
        whyCannotEvolveAr: "أكثر من 10,000 عميل مؤسسي مقفلين في المعمارية الحالية. أي تغيير جوهري سيكسر التطبيقات الموجودة.",
      },
      {
        name: "ServiceNow",
        category: "Enterprise Workflow",
        categoryAr: "سير عمل المؤسسات",
        architecturalWeakness: "Workflow-centric, not platform-centric. Limited to IT service management expansion.",
        architecturalWeaknessAr: "مركز على سير العمل، وليس على المنصة. محدود بتوسيع إدارة خدمات تكنولوجيا المعلومات.",
        governanceGap: "No autonomous governance—all policies require manual configuration and maintenance",
        governanceGapAr: "لا حوكمة مستقلة—كل السياسات تتطلب تكويناً وصيانة يدوية",
        aiLimitation: "Now Intelligence is analytics-focused, not action-oriented AI",
        aiLimitationAr: "Now Intelligence مركز على التحليلات، وليس ذكاء اصطناعي موجه للعمل",
        sovereigntyFailure: "Cloud-only deployment with no sovereign option",
        sovereigntyFailureAr: "نشر سحابي فقط بدون خيار سيادي",
        whyCannotEvolve: "Fundamental architecture designed for ITSM, not platform generation. Would require complete rebuild.",
        whyCannotEvolveAr: "معمارية أساسية مصممة لإدارة خدمات تكنولوجيا المعلومات، وليس توليد المنصات. ستتطلب إعادة بناء كاملة.",
      },
      {
        name: "SAP Business Technology Platform",
        category: "Enterprise ERP Extension",
        categoryAr: "امتداد ERP للمؤسسات",
        architecturalWeakness: "Built on top of legacy ERP architecture with 30+ years of technical debt",
        architecturalWeaknessAr: "مبني فوق معمارية ERP قديمة مع أكثر من 30 عاماً من الديون التقنية",
        governanceGap: "Governance fragmented across multiple SAP products, no unified AI governance",
        governanceGapAr: "الحوكمة مجزأة عبر منتجات SAP متعددة، لا حوكمة AI موحدة",
        aiLimitation: "SAP AI is embedded in specific modules, not platform-wide native intelligence",
        aiLimitationAr: "SAP AI مدمج في وحدات محددة، وليس ذكاء أصلي على مستوى المنصة",
        sovereigntyFailure: "Deep SAP dependency for any enterprise deployment",
        sovereigntyFailureAr: "اعتماد عميق على SAP لأي نشر مؤسسي",
        whyCannotEvolve: "Legacy ERP customer base of 400,000+ cannot be migrated without breaking contracts and implementations.",
        whyCannotEvolveAr: "قاعدة عملاء ERP القديمة من أكثر من 400,000 لا يمكن ترحيلها دون كسر العقود والتطبيقات.",
      },
    ],
    superiorityStatement: "WebNova is the only platform that creates platforms. Salesforce, ServiceNow, and SAP create applications within fixed architectures. INFERA generates entire sovereign ecosystems autonomously.",
    superiorityStatementAr: "WebNova هي المنصة الوحيدة التي تنشئ منصات. Salesforce و ServiceNow و SAP ينشئون تطبيقات ضمن معماريات ثابتة. INFERA تنشئ منظومات سيادية كاملة بشكل مستقل.",
  },
  {
    platformId: "finance",
    platformName: "INFERA Finance AI",
    platformNameAr: "إنفيرا المالية AI",
    competitors: [
      {
        name: "SAP S/4HANA Finance",
        category: "Enterprise Finance",
        categoryAr: "مالية المؤسسات",
        architecturalWeakness: "Legacy ERP architecture retrofitted for cloud, not cloud-native",
        architecturalWeaknessAr: "معمارية ERP قديمة معدلة للسحابة، وليست سحابية أصلية",
        governanceGap: "Manual compliance configuration with periodic audits, no continuous AI governance",
        governanceGapAr: "تكوين امتثال يدوي مع تدقيقات دورية، لا حوكمة AI مستمرة",
        aiLimitation: "Joule AI assistant is conversational, not decision-making autonomous AI",
        aiLimitationAr: "مساعد Joule AI محادثي، وليس ذكاء اصطناعي مستقل لاتخاذ القرارات",
        sovereigntyFailure: "Deep dependency on SAP infrastructure and licensing",
        sovereigntyFailureAr: "اعتماد عميق على بنية SAP التحتية والترخيص",
        whyCannotEvolve: "S/4HANA is the 'final' migration for SAP customers. Another architecture change would destroy customer trust.",
        whyCannotEvolveAr: "S/4HANA هو الترحيل 'النهائي' لعملاء SAP. تغيير معماري آخر سيدمر ثقة العملاء.",
      },
      {
        name: "Oracle Cloud Financials",
        category: "Cloud Finance",
        categoryAr: "مالية سحابية",
        architecturalWeakness: "Database-centric architecture that creates performance bottlenecks at scale",
        architecturalWeaknessAr: "معمارية مركزة على قاعدة البيانات تخلق اختناقات أداء على النطاق",
        governanceGap: "Governance is rule-based, not AI-driven adaptive enforcement",
        governanceGapAr: "الحوكمة قائمة على القواعد، وليست تطبيقاً تكيفياً مدفوعاً بالذكاء الاصطناعي",
        aiLimitation: "AI features are analytics overlays, not embedded decision intelligence",
        aiLimitationAr: "ميزات AI هي طبقات تحليلية، وليست ذكاء قرارات مدمج",
        sovereigntyFailure: "Oracle cloud lock-in with proprietary database requirements",
        sovereigntyFailureAr: "قفل على سحابة Oracle مع متطلبات قاعدة بيانات خاصة",
        whyCannotEvolve: "Oracle's revenue model depends on database licensing. Moving to truly sovereign architecture would cannibalize core business.",
        whyCannotEvolveAr: "نموذج إيرادات Oracle يعتمد على ترخيص قاعدة البيانات. الانتقال إلى معمارية سيادية حقيقية سيأكل الأعمال الأساسية.",
      },
      {
        name: "Workday Financials",
        category: "HCM-Centric Finance",
        categoryAr: "مالية مركزة على HCM",
        architecturalWeakness: "HCM-first architecture that treats finance as secondary, not core",
        architecturalWeaknessAr: "معمارية HCM-أولاً تعامل المالية كثانوية، وليست أساسية",
        governanceGap: "Limited to HR-adjacent financial processes, no comprehensive financial governance",
        governanceGapAr: "محدودة بالعمليات المالية المجاورة للموارد البشرية، لا حوكمة مالية شاملة",
        aiLimitation: "Prism Analytics is reporting-focused, not predictive financial AI",
        aiLimitationAr: "Prism Analytics مركز على التقارير، وليس ذكاء اصطناعي مالي تنبؤي",
        sovereigntyFailure: "Single-tenant cloud but still Workday-controlled infrastructure",
        sovereigntyFailureAr: "سحابة مستأجر واحد لكن لا تزال بنية تحتية يتحكم بها Workday",
        whyCannotEvolve: "Core competency is HCM. Deep finance capabilities would require complete platform rebuild.",
        whyCannotEvolveAr: "الكفاءة الأساسية هي HCM. القدرات المالية العميقة ستتطلب إعادة بناء منصة كاملة.",
      },
    ],
    superiorityStatement: "INFERA Finance AI is AI-native from day one with predictive intelligence that doesn't just report—it recommends and acts. SAP, Oracle, and Workday offer analytics on top of transactions. INFERA offers financial intelligence that transforms decision-making.",
    superiorityStatementAr: "INFERA Finance AI أصلي في AI من اليوم الأول مع ذكاء تنبؤي لا يقدم تقارير فقط—بل يوصي ويتصرف. SAP و Oracle و Workday يقدمون تحليلات فوق المعاملات. INFERA تقدم ذكاء مالي يحول اتخاذ القرارات.",
  },
  {
    platformId: "humaniq",
    platformName: "INFERA HumanIQ",
    platformNameAr: "إنفيرا الموارد البشرية IQ",
    competitors: [
      {
        name: "Workday HCM",
        category: "Enterprise HR",
        categoryAr: "موارد بشرية المؤسسات",
        architecturalWeakness: "Monolithic HCM with limited extensibility for specialized talent intelligence",
        architecturalWeaknessAr: "HCM وحدوي مع قابلية توسيع محدودة لذكاء المواهب المتخصص",
        governanceGap: "Policy enforcement is rule-based, no adaptive AI governance",
        governanceGapAr: "تطبيق السياسات قائم على القواعد، لا حوكمة AI تكيفية",
        aiLimitation: "AI is used for matching and recommendations, not autonomous workforce optimization",
        aiLimitationAr: "AI يستخدم للمطابقة والتوصيات، وليس تحسين القوى العاملة المستقل",
        sovereigntyFailure: "Complete Workday platform dependency",
        sovereigntyFailureAr: "اعتماد كامل على منصة Workday",
        whyCannotEvolve: "Workday's entire value proposition is integrated HCM. Breaking it apart for specialized AI would fragment their offering.",
        whyCannotEvolveAr: "قيمة Workday المقترحة بالكامل هي HCM المتكامل. تفكيكه لذكاء اصطناعي متخصص سيفتت عرضهم.",
      },
      {
        name: "SAP SuccessFactors",
        category: "Cloud HR",
        categoryAr: "موارد بشرية سحابية",
        architecturalWeakness: "Acquired product integrated into SAP ecosystem, not native architecture",
        architecturalWeaknessAr: "منتج مستحوذ عليه متكامل في منظومة SAP، وليس معمارية أصلية",
        governanceGap: "Governance fragmented between SuccessFactors and core SAP systems",
        governanceGapAr: "الحوكمة مجزأة بين SuccessFactors وأنظمة SAP الأساسية",
        aiLimitation: "Joule assistant focused on conversational AI, not predictive talent intelligence",
        aiLimitationAr: "مساعد Joule مركز على AI المحادثي، وليس ذكاء المواهب التنبؤي",
        sovereigntyFailure: "SAP ecosystem lock-in required for full functionality",
        sovereigntyFailureAr: "قفل على منظومة SAP مطلوب للوظائف الكاملة",
        whyCannotEvolve: "SuccessFactors acquisition happened 12+ years ago. Deep integration with SAP prevents independent evolution.",
        whyCannotEvolveAr: "استحواذ SuccessFactors حدث قبل أكثر من 12 عاماً. التكامل العميق مع SAP يمنع التطور المستقل.",
      },
      {
        name: "Oracle HCM Cloud",
        category: "Enterprise HR",
        categoryAr: "موارد بشرية المؤسسات",
        architecturalWeakness: "Database-first architecture limiting real-time talent analytics",
        architecturalWeaknessAr: "معمارية قاعدة البيانات أولاً تحد من تحليلات المواهب في الوقت الفعلي",
        governanceGap: "Compliance is audit-trail focused, not proactive AI enforcement",
        governanceGapAr: "الامتثال مركز على مسار التدقيق، وليس تطبيق AI استباقي",
        aiLimitation: "AI is embedded in specific modules, not unified talent intelligence layer",
        aiLimitationAr: "AI مدمج في وحدات محددة، وليس طبقة ذكاء مواهب موحدة",
        sovereigntyFailure: "Oracle cloud and database dependency",
        sovereigntyFailureAr: "اعتماد على سحابة وقاعدة بيانات Oracle",
        whyCannotEvolve: "Oracle's value is data management. True AI-first HR would diminish database centrality.",
        whyCannotEvolveAr: "قيمة Oracle هي إدارة البيانات. الموارد البشرية AI-أولاً الحقيقية ستقلل مركزية قاعدة البيانات.",
      },
    ],
    superiorityStatement: "HumanIQ is the only HR platform that predicts, not just reports. While Workday, SuccessFactors, and Oracle HCM manage employee records, INFERA manages employee potential—predicting performance, flight risk, and optimal interventions before problems occur.",
    superiorityStatementAr: "HumanIQ هي منصة الموارد البشرية الوحيدة التي تتنبأ، لا تقدم تقارير فقط. بينما Workday و SuccessFactors و Oracle HCM تدير سجلات الموظفين، INFERA تدير إمكانات الموظفين—تتنبأ بالأداء ومخاطر المغادرة والتدخلات المثلى قبل حدوث المشاكل.",
  },
  {
    platformId: "shieldgrid",
    platformName: "INFERA ShieldGrid",
    platformNameAr: "إنفيرا شبكة الدفاع",
    competitors: [
      {
        name: "CrowdStrike",
        category: "Endpoint Security",
        categoryAr: "أمن نقاط النهاية",
        architecturalWeakness: "Endpoint-focused, not holistic sovereign security architecture",
        architecturalWeaknessAr: "مركز على نقاط النهاية، وليس معمارية أمن سيادي شامل",
        governanceGap: "Threat response requires SOC teams, not autonomous governance",
        governanceGapAr: "الاستجابة للتهديدات تتطلب فرق SOC، وليست حوكمة مستقلة",
        aiLimitation: "AI focused on threat detection, not autonomous remediation",
        aiLimitationAr: "AI مركز على اكتشاف التهديدات، وليس المعالجة المستقلة",
        sovereigntyFailure: "Cloud-delivered protection with CrowdStrike data processing",
        sovereigntyFailureAr: "حماية مقدمة سحابياً مع معالجة بيانات CrowdStrike",
        whyCannotEvolve: "Business model is endpoint agents + cloud analysis. Sovereign architecture would eliminate cloud dependency that drives their value.",
        whyCannotEvolveAr: "نموذج العمل هو وكلاء نقاط النهاية + تحليل سحابي. المعمارية السيادية ستلغي الاعتماد السحابي الذي يدفع قيمتهم.",
      },
      {
        name: "Palo Alto Networks",
        category: "Network Security",
        categoryAr: "أمن الشبكات",
        architecturalWeakness: "Network-perimeter focus increasingly irrelevant in cloud-native world",
        architecturalWeaknessAr: "التركيز على محيط الشبكة يصبح غير ذي صلة بشكل متزايد في العالم السحابي الأصلي",
        governanceGap: "Security policies are configured, not learned and adapted by AI",
        governanceGapAr: "سياسات الأمان مكونة، وليست متعلمة ومتكيفة بواسطة AI",
        aiLimitation: "Cortex XSOAR requires human orchestration, not truly autonomous",
        aiLimitationAr: "Cortex XSOAR يتطلب تنسيقاً بشرياً، وليس مستقلاً حقاً",
        sovereigntyFailure: "Multi-vendor security fabric increases attack surface",
        sovereigntyFailureAr: "نسيج أمان متعدد الموردين يزيد سطح الهجوم",
        whyCannotEvolve: "Hardware appliance legacy and multi-product portfolio prevents unified AI-first security architecture.",
        whyCannotEvolveAr: "إرث أجهزة الأجهزة ومحفظة المنتجات المتعددة يمنع معمارية أمان AI-أولاً موحدة.",
      },
      {
        name: "Microsoft Defender",
        category: "Enterprise Security",
        categoryAr: "أمن المؤسسات",
        architecturalWeakness: "Windows-centric design limits protection in heterogeneous environments",
        architecturalWeaknessAr: "التصميم المتمحور حول Windows يحد الحماية في البيئات غير المتجانسة",
        governanceGap: "Security governance tied to Microsoft 365 admin, not sovereign AI control",
        governanceGapAr: "حوكمة الأمان مرتبطة بمسؤول Microsoft 365، وليست تحكم AI سيادي",
        aiLimitation: "Copilot for Security assists analysts, not autonomous defense",
        aiLimitationAr: "Copilot for Security يساعد المحللين، وليس دفاعاً مستقلاً",
        sovereigntyFailure: "Complete Microsoft ecosystem dependency",
        sovereigntyFailureAr: "اعتماد كامل على منظومة Microsoft",
        whyCannotEvolve: "Microsoft security is designed to protect Microsoft ecosystem. Truly platform-agnostic security contradicts core business strategy.",
        whyCannotEvolveAr: "أمان Microsoft مصمم لحماية منظومة Microsoft. الأمان غير المتحيز للمنصة حقاً يتناقض مع استراتيجية العمل الأساسية.",
      },
    ],
    superiorityStatement: "ShieldGrid is the only security platform that governs, not just protects. While CrowdStrike, Palo Alto, and Microsoft Defender detect and alert, INFERA detects, responds, and learns autonomously—with complete sovereign control over all security operations.",
    superiorityStatementAr: "ShieldGrid هي منصة الأمان الوحيدة التي تحكم، لا تحمي فقط. بينما CrowdStrike و Palo Alto و Microsoft Defender يكتشفون وينبهون، INFERA تكتشف وتستجيب وتتعلم بشكل مستقل—مع تحكم سيادي كامل على جميع عمليات الأمان.",
  },
];

// Group-level kill map
export const groupKillMap = {
  headline: "Why No Competitor Can Match INFERA",
  headlineAr: "لماذا لا يستطيع أي منافس مضاهاة INFERA",
  keyDifferentiators: [
    {
      differentiator: "Platform Factory vs. Single Products",
      differentiatorAr: "مصنع منصات مقابل منتجات فردية",
      explanation: "Competitors sell products. INFERA sells the factory that creates unlimited products.",
      explanationAr: "المنافسون يبيعون منتجات. INFERA تبيع المصنع الذي ينشئ منتجات غير محدودة.",
    },
    {
      differentiator: "Native AI vs. Bolted-On AI",
      differentiatorAr: "ذكاء اصطناعي أصلي مقابل ذكاء اصطناعي مضاف",
      explanation: "Every competitor added AI after their architecture was built. INFERA was designed AI-first.",
      explanationAr: "كل منافس أضاف AI بعد بناء معماريتهم. INFERA صُممت AI-أولاً.",
    },
    {
      differentiator: "True Sovereignty vs. Vendor Dependency",
      differentiatorAr: "سيادة حقيقية مقابل الاعتماد على الموردين",
      explanation: "Every competitor requires their cloud, their license, their support. INFERA enables complete independence.",
      explanationAr: "كل منافس يتطلب سحابتهم وترخيصهم ودعمهم. INFERA تمكن الاستقلال الكامل.",
    },
    {
      differentiator: "Autonomous Governance vs. Manual Configuration",
      differentiatorAr: "حوكمة مستقلة مقابل تكوين يدوي",
      explanation: "Competitors require IT teams to configure and maintain policies. INFERA AI governs automatically.",
      explanationAr: "المنافسون يتطلبون فرق تكنولوجيا المعلومات لتكوين وصيانة السياسات. AI INFERA يحكم تلقائياً.",
    },
    {
      differentiator: "Ecosystem Integration vs. Best-of-Breed Fragmentation",
      differentiatorAr: "تكامل المنظومة مقابل تجزئة أفضل السلالات",
      explanation: "21+ integrated platforms vs. dozens of disconnected point solutions requiring custom integrations.",
      explanationAr: "21+ منصة متكاملة مقابل عشرات الحلول النقطية المنفصلة التي تتطلب تكاملات مخصصة.",
    },
  ],
};

// =====================================================================
// STEP 8: SOVEREIGN READINESS INDEX
// =====================================================================

export interface ReadinessCategory {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  weight: number;
  metrics: {
    metric: string;
    metricAr: string;
    maxScore: number;
  }[];
}

export interface PlatformReadinessScore {
  platformId: string;
  platformName: string;
  platformNameAr: string;
  overallScore: number;
  categoryScores: {
    categoryId: string;
    score: number;
    maxScore: number;
  }[];
}

export const sovereignReadinessFramework = {
  title: "Sovereign Readiness Index",
  titleAr: "مؤشر الجاهزية السيادية",
  description: "A comprehensive measure of an organization's readiness for digital sovereignty, scored 0-100",
  descriptionAr: "مقياس شامل لجاهزية المؤسسة للسيادة الرقمية، يُسجل من 0 إلى 100",
  categories: [
    {
      id: "ai-maturity",
      name: "AI Maturity",
      nameAr: "نضج الذكاء الاصطناعي",
      description: "Level of native AI integration and autonomous decision-making capability",
      descriptionAr: "مستوى تكامل AI الأصلي وقدرة اتخاذ القرارات المستقلة",
      weight: 25,
      metrics: [
        { metric: "Native AI Architecture", metricAr: "معمارية AI أصلية", maxScore: 10 },
        { metric: "Autonomous Decision-Making", metricAr: "اتخاذ قرارات مستقل", maxScore: 10 },
        { metric: "Predictive Intelligence", metricAr: "ذكاء تنبؤي", maxScore: 5 },
      ],
    },
    {
      id: "security-sovereignty",
      name: "Security Sovereignty",
      nameAr: "سيادة الأمان",
      description: "Degree of independent security control and threat governance",
      descriptionAr: "درجة التحكم الأمني المستقل وحوكمة التهديدات",
      weight: 25,
      metrics: [
        { metric: "Zero-Trust Architecture", metricAr: "معمارية انعدام الثقة", maxScore: 10 },
        { metric: "Autonomous Threat Response", metricAr: "استجابة تهديدات مستقلة", maxScore: 10 },
        { metric: "Data Sovereignty", metricAr: "سيادة البيانات", maxScore: 5 },
      ],
    },
    {
      id: "governance-control",
      name: "Governance Control",
      nameAr: "التحكم في الحوكمة",
      description: "Level of automated policy enforcement and compliance governance",
      descriptionAr: "مستوى تطبيق السياسات الآلي وحوكمة الامتثال",
      weight: 20,
      metrics: [
        { metric: "AI-Driven Policy Enforcement", metricAr: "تطبيق سياسات مدفوع بـ AI", maxScore: 10 },
        { metric: "Continuous Compliance", metricAr: "امتثال مستمر", maxScore: 5 },
        { metric: "Audit Automation", metricAr: "أتمتة التدقيق", maxScore: 5 },
      ],
    },
    {
      id: "scalability",
      name: "Scalability",
      nameAr: "قابلية التوسع",
      description: "Ability to scale infinitely without architectural constraints",
      descriptionAr: "القدرة على التوسع اللانهائي بدون قيود معمارية",
      weight: 15,
      metrics: [
        { metric: "Cloud-Native Architecture", metricAr: "معمارية سحابية أصلية", maxScore: 5 },
        { metric: "Auto-Scaling Capability", metricAr: "قدرة التوسع التلقائي", maxScore: 5 },
        { metric: "Multi-Region Deployment", metricAr: "نشر متعدد المناطق", maxScore: 5 },
      ],
    },
    {
      id: "legacy-independence",
      name: "Legacy Independence",
      nameAr: "الاستقلال عن الأنظمة القديمة",
      description: "Freedom from legacy system dependencies and vendor lock-in",
      descriptionAr: "التحرر من الاعتمادات على الأنظمة القديمة وقفل الموردين",
      weight: 15,
      metrics: [
        { metric: "Zero Vendor Lock-In", metricAr: "صفر قفل على الموردين", maxScore: 5 },
        { metric: "Modern Architecture", metricAr: "معمارية حديثة", maxScore: 5 },
        { metric: "API-First Design", metricAr: "تصميم API-أولاً", maxScore: 5 },
      ],
    },
  ] as ReadinessCategory[],
};

// INFERA Platform Scores
export const inferaReadinessScores: PlatformReadinessScore[] = [
  { platformId: "webnova", platformName: "INFERA WebNova", platformNameAr: "إنفيرا ويب نوفا", overallScore: 98, categoryScores: [{ categoryId: "ai-maturity", score: 25, maxScore: 25 }, { categoryId: "security-sovereignty", score: 24, maxScore: 25 }, { categoryId: "governance-control", score: 20, maxScore: 20 }, { categoryId: "scalability", score: 14, maxScore: 15 }, { categoryId: "legacy-independence", score: 15, maxScore: 15 }] },
  { platformId: "engine-control", platformName: "INFERA Engine Control", platformNameAr: "إنفيرا محرك التحكم", overallScore: 96, categoryScores: [{ categoryId: "ai-maturity", score: 24, maxScore: 25 }, { categoryId: "security-sovereignty", score: 24, maxScore: 25 }, { categoryId: "governance-control", score: 20, maxScore: 20 }, { categoryId: "scalability", score: 14, maxScore: 15 }, { categoryId: "legacy-independence", score: 14, maxScore: 15 }] },
  { platformId: "finance", platformName: "INFERA Finance AI", platformNameAr: "إنفيرا المالية AI", overallScore: 95, categoryScores: [{ categoryId: "ai-maturity", score: 24, maxScore: 25 }, { categoryId: "security-sovereignty", score: 23, maxScore: 25 }, { categoryId: "governance-control", score: 20, maxScore: 20 }, { categoryId: "scalability", score: 14, maxScore: 15 }, { categoryId: "legacy-independence", score: 14, maxScore: 15 }] },
  { platformId: "humaniq", platformName: "INFERA HumanIQ", platformNameAr: "إنفيرا الموارد البشرية IQ", overallScore: 94, categoryScores: [{ categoryId: "ai-maturity", score: 24, maxScore: 25 }, { categoryId: "security-sovereignty", score: 22, maxScore: 25 }, { categoryId: "governance-control", score: 19, maxScore: 20 }, { categoryId: "scalability", score: 14, maxScore: 15 }, { categoryId: "legacy-independence", score: 15, maxScore: 15 }] },
  { platformId: "shieldgrid", platformName: "INFERA ShieldGrid", platformNameAr: "إنفيرا شبكة الدفاع", overallScore: 97, categoryScores: [{ categoryId: "ai-maturity", score: 24, maxScore: 25 }, { categoryId: "security-sovereignty", score: 25, maxScore: 25 }, { categoryId: "governance-control", score: 20, maxScore: 20 }, { categoryId: "scalability", score: 14, maxScore: 15 }, { categoryId: "legacy-independence", score: 14, maxScore: 15 }] },
];

// Market Benchmarks
export const marketBenchmarks = {
  title: "Market Comparison",
  titleAr: "مقارنة السوق",
  scores: [
    { name: "INFERA Group Average", nameAr: "متوسط مجموعة INFERA", score: 96 },
    { name: "Salesforce Ecosystem", nameAr: "منظومة Salesforce", score: 42 },
    { name: "SAP Ecosystem", nameAr: "منظومة SAP", score: 38 },
    { name: "Microsoft Ecosystem", nameAr: "منظومة Microsoft", score: 45 },
    { name: "Oracle Cloud", nameAr: "سحابة Oracle", score: 40 },
    { name: "ServiceNow", nameAr: "ServiceNow", score: 44 },
    { name: "Workday", nameAr: "Workday", score: 46 },
    { name: "Market Average", nameAr: "متوسط السوق", score: 35 },
  ],
};

// Group-level score
export const inferaGroupScore = {
  overallScore: 96,
  breakdown: {
    aiMaturity: 96,
    securitySovereignty: 95,
    governanceControl: 98,
    scalability: 94,
    legacyIndependence: 97,
  },
  statement: "INFERA achieves a Sovereign Readiness Index of 96/100, making it 2.7x more sovereign-ready than the market average and the only platform ecosystem to exceed 90 in every category.",
  statementAr: "INFERA تحقق مؤشر جاهزية سيادية 96/100، مما يجعلها أكثر جاهزية للسيادة بـ 2.7 مرة من متوسط السوق والمنظومة الوحيدة التي تتجاوز 90 في كل فئة.",
};
