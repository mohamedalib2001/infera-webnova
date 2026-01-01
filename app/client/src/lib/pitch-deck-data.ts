// Complete data store for all INFERA pitch decks with 8-slide structure
export interface PitchSlide {
  id: string;
  title: string;
  titleAr: string;
  heading: string;
  headingAr: string;
  points: { text: string; textAr: string }[];
}

export interface PitchDeckData {
  id: string;
  name: string;
  nameAr: string;
  tagline: string;
  taglineAr: string;
  color: string;
  gradient: string;
  route: string;
  slides: PitchSlide[];
  executiveSummary: {
    overview: string;
    overviewAr: string;
    keyFeatures: string[];
    keyFeaturesAr: string[];
    targetMarket: string;
    targetMarketAr: string;
    competitiveAdvantage: string;
    competitiveAdvantageAr: string;
    strategicValue: string;
    strategicValueAr: string;
  };
  demoStoryboard: {
    scenes: {
      title: string;
      titleAr: string;
      description: string;
      descriptionAr: string;
      presenterSays: string;
      presenterSaysAr: string;
      onScreen: string;
      onScreenAr: string;
      wowMoment: string;
      wowMomentAr: string;
      duration: string;
    }[];
  };
}

// Complete 21 INFERA platforms with full 8-slide structure
export const inferaPlatforms: PitchDeckData[] = [
  {
    id: "webnova",
    name: "INFERA WebNova",
    nameAr: "إنفيرا ويب نوفا",
    tagline: "Core Operating System for Sovereign Digital Platforms",
    taglineAr: "نظام التشغيل الأساسي للمنصات الرقمية السيادية",
    color: "indigo",
    gradient: "from-indigo-600 to-purple-700",
    route: "/pitch-deck",
    slides: [
      { id: "vision", title: "Vision", titleAr: "الرؤية", heading: "To become the world's first autonomous platform factory that generates and governs sovereign digital ecosystems.", headingAr: "أن نصبح أول مصنع منصات مستقل في العالم ينشئ ويحكم منظومات رقمية سيادية.", points: [{ text: "Autonomous platform generation", textAr: "إنشاء منصات مستقل" }, { text: "Complete digital sovereignty", textAr: "سيادة رقمية كاملة" }, { text: "AI-first governance", textAr: "حوكمة AI-أولاً" }] },
      { id: "problem", title: "Problem", titleAr: "المشكلة", heading: "Organizations are trapped in fragmented SaaS ecosystems with no control over their digital destiny.", headingAr: "المؤسسات محاصرة في منظومات SaaS مجزأة بدون سيطرة على مصيرها الرقمي.", points: [{ text: "Vendor lock-in and dependencies", textAr: "الاعتماد والقفل على الموردين" }, { text: "Data scattered across systems", textAr: "البيانات مبعثرة عبر الأنظمة" }, { text: "No unified governance", textAr: "لا حوكمة موحدة" }, { text: "Complex compliance requirements", textAr: "متطلبات امتثال معقدة" }] },
      { id: "solution", title: "Solution", titleAr: "الحل", heading: "A sovereign Core OS that autonomously generates, deploys, and governs unlimited digital platforms.", headingAr: "نظام تشغيل سيادي ينشئ وينشر ويحكم منصات رقمية غير محدودة بشكل مستقل.", points: [{ text: "Blueprint-First Architecture", textAr: "معمارية Blueprint-First" }, { text: "AI Orchestration Engine", textAr: "محرك تنسيق الذكاء الاصطناعي" }, { text: "Policy Validator AI", textAr: "مدقق السياسات AI" }, { text: "Multi-tenant isolation", textAr: "عزل متعدد المستأجرين" }] },
      { id: "unique-value", title: "Unique Value", titleAr: "القيمة الفريدة", heading: "The only platform that creates platforms. A factory, not a product.", headingAr: "المنصة الوحيدة التي تنشئ منصات. مصنع، وليس منتج.", points: [{ text: "Platform factory model", textAr: "نموذج مصنع المنصات" }, { text: "Autonomous governance", textAr: "حوكمة مستقلة" }, { text: "Native AI in everything", textAr: "ذكاء اصطناعي أصلي في كل شيء" }] },
      { id: "how-it-works", title: "How It Works", titleAr: "كيف يعمل", heading: "Define blueprint → AI generates platform → Deploy sovereignly → Govern automatically.", headingAr: "تحديد المخطط → AI ينشئ المنصة → نشر سيادي → حوكمة تلقائية.", points: [{ text: "Visual blueprint designer", textAr: "مصمم مخططات مرئي" }, { text: "AI code generation", textAr: "توليد كود AI" }, { text: "One-click deployment", textAr: "نشر بنقرة واحدة" }, { text: "Continuous AI governance", textAr: "حوكمة AI مستمرة" }] },
      { id: "market-advantage", title: "Market Advantage", titleAr: "الميزة السوقية", heading: "Beyond Salesforce. Beyond SAP. Beyond ServiceNow. This is platform creation intelligence.", headingAr: "ما وراء Salesforce. ما وراء SAP. ما وراء ServiceNow. هذا ذكاء إنشاء المنصات.", points: [{ text: "Creates platforms, not just apps", textAr: "ينشئ منصات، وليس تطبيقات فقط" }, { text: "No code required", textAr: "لا حاجة لكود" }, { text: "Sovereign by design", textAr: "سيادي بالتصميم" }] },
      { id: "use-cases", title: "Use Cases", titleAr: "حالات الاستخدام", heading: "For enterprises, governments, financial institutions, and any organization seeking digital sovereignty.", headingAr: "للمؤسسات والحكومات والمؤسسات المالية وأي منظمة تسعى للسيادة الرقمية.", points: [{ text: "Enterprise digital transformation", textAr: "التحول الرقمي للمؤسسات" }, { text: "Government sovereign platforms", textAr: "منصات حكومية سيادية" }, { text: "Financial compliance systems", textAr: "أنظمة امتثال مالية" }] },
      { id: "strategic-impact", title: "Strategic Impact", titleAr: "الأثر الاستراتيجي", heading: "Organizations achieve complete digital sovereignty with 80% faster deployment and 60% cost reduction.", headingAr: "المؤسسات تحقق سيادة رقمية كاملة مع نشر أسرع بـ 80% وتخفيض تكاليف بـ 60%.", points: [{ text: "80% faster time-to-deploy", textAr: "وقت نشر أسرع بـ 80%" }, { text: "60% cost reduction", textAr: "تخفيض تكاليف بـ 60%" }, { text: "100% data sovereignty", textAr: "سيادة بيانات 100%" }] },
    ],
    executiveSummary: {
      overview: "INFERA WebNova is the foundational Core OS that powers the entire INFERA ecosystem, enabling autonomous generation and management of sovereign digital platforms without code.",
      overviewAr: "INFERA WebNova هو نظام التشغيل الأساسي الذي يشغل منظومة INFERA بأكملها، مما يتيح الإنشاء والإدارة المستقلة للمنصات الرقمية السيادية بدون كود.",
      keyFeatures: ["Blueprint-First Architecture", "AI Orchestration", "Multi-Tenant Isolation", "Policy Validator AI", "Autonomous Governance"],
      keyFeaturesAr: ["معمارية Blueprint-First", "تنسيق الذكاء الاصطناعي", "عزل متعدد المستأجرين", "مدقق السياسات AI", "حوكمة مستقلة"],
      targetMarket: "Enterprise organizations, Government agencies, Financial institutions seeking complete digital sovereignty",
      targetMarketAr: "المؤسسات الكبرى، الجهات الحكومية، المؤسسات المالية التي تسعى لسيادة رقمية كاملة",
      competitiveAdvantage: "First sovereign platform factory with AI-driven autonomous governance - creates platforms, not just applications",
      competitiveAdvantageAr: "أول مصنع منصات سيادي مع حوكمة مستقلة مدفوعة بالذكاء الاصطناعي - ينشئ منصات، وليس تطبيقات فقط",
      strategicValue: "Complete digital sovereignty with 80% faster deployment, 60% cost reduction, and zero vendor lock-in",
      strategicValueAr: "سيادة رقمية كاملة مع نشر أسرع بـ 80%، تخفيض تكاليف بـ 60%، وصفر اعتماد على الموردين",
    },
    demoStoryboard: {
      scenes: [
        { title: "Opening Context", titleAr: "السياق الافتتاحي", description: "Introduce the problem of fragmented digital ecosystems", descriptionAr: "تقديم مشكلة المنظومات الرقمية المجزأة", presenterSays: "Every enterprise today is drowning in disconnected SaaS tools. They've lost control of their digital destiny.", presenterSaysAr: "كل مؤسسة اليوم تغرق في أدوات SaaS منفصلة. لقد فقدوا السيطرة على مصيرهم الرقمي.", onScreen: "Visual showing tangled web of vendor logos and data flows", onScreenAr: "صورة تظهر شبكة متشابكة من شعارات الموردين وتدفقات البيانات", wowMoment: "Statistics: 78% of enterprises can't access their own data", wowMomentAr: "إحصائيات: 78% من المؤسسات لا تستطيع الوصول لبياناتها الخاصة", duration: "2 min" },
        { title: "Platform Introduction", titleAr: "تقديم المنصة", description: "Reveal WebNova as the sovereign platform factory", descriptionAr: "الكشف عن WebNova كمصنع المنصات السيادية", presenterSays: "What if you could generate complete digital platforms from a single blueprint? Sovereign. Intelligent. Autonomous.", presenterSaysAr: "ماذا لو استطعت إنشاء منصات رقمية كاملة من مخطط واحد؟ سيادية. ذكية. مستقلة.", onScreen: "WebNova dashboard with blueprint designer", onScreenAr: "لوحة تحكم WebNova مع مصمم المخططات", wowMoment: "Live creation of a platform in 30 seconds", wowMomentAr: "إنشاء منصة مباشر في 30 ثانية", duration: "3 min" },
        { title: "AI Intelligence Moment", titleAr: "لحظة الذكاء AI", description: "Show AI governance in action", descriptionAr: "عرض حوكمة AI في العمل", presenterSays: "Watch as Policy Validator AI automatically ensures compliance across all platforms.", presenterSaysAr: "شاهد كيف يضمن مدقق السياسات AI الامتثال تلقائياً عبر جميع المنصات.", onScreen: "Real-time policy validation dashboard with AI recommendations", onScreenAr: "لوحة تحقق السياسات في الوقت الفعلي مع توصيات AI", wowMoment: "AI detects and resolves a compliance issue automatically", wowMomentAr: "AI يكتشف ويحل مشكلة امتثال تلقائياً", duration: "3 min" },
        { title: "Outcome & Impact", titleAr: "النتيجة والأثر", description: "Show transformation results", descriptionAr: "عرض نتائج التحول", presenterSays: "In 90 days, this enterprise went from 47 vendors to one sovereign ecosystem. 60% cost reduction. 100% data control.", presenterSaysAr: "في 90 يوماً، انتقلت هذه المؤسسة من 47 مورداً إلى منظومة سيادية واحدة. تخفيض تكاليف 60%. سيطرة بيانات 100%.", onScreen: "Before/after comparison with metrics", onScreenAr: "مقارنة قبل/بعد مع المقاييس", wowMoment: "ROI calculator showing 300% return in first year", wowMomentAr: "حاسبة العائد تظهر 300% عائد في السنة الأولى", duration: "2 min" },
      ],
    },
  },
  {
    id: "engine-control",
    name: "INFERA Engine Control",
    nameAr: "إنفيرا محرك التحكم",
    tagline: "Sovereign Operation Command Center",
    taglineAr: "مركز قيادة العمليات السيادية",
    color: "amber",
    gradient: "from-amber-600 to-violet-700",
    route: "/pitch-deck/engine-control",
    slides: [
      { id: "vision", title: "Vision", titleAr: "الرؤية", heading: "To unify all digital operations under one sovereign command center with AI-driven orchestration.", headingAr: "توحيد جميع العمليات الرقمية تحت مركز قيادة سيادي واحد مع تنسيق مدفوع بالذكاء الاصطناعي.", points: [{ text: "Unified command center", textAr: "مركز قيادة موحد" }, { text: "Real-time orchestration", textAr: "تنسيق في الوقت الفعلي" }, { text: "Cross-platform control", textAr: "تحكم عبر المنصات" }] },
      { id: "problem", title: "Problem", titleAr: "المشكلة", heading: "Operations teams are blind across platforms, reactive instead of predictive, and unable to respond at scale.", headingAr: "فرق العمليات عمياء عبر المنصات، تتفاعل بدلاً من التنبؤ، وغير قادرة على الاستجابة على نطاق واسع.", points: [{ text: "No unified visibility", textAr: "لا رؤية موحدة" }, { text: "Reactive operations", textAr: "عمليات تفاعلية" }, { text: "Manual incident response", textAr: "استجابة يدوية للحوادث" }] },
      { id: "solution", title: "Solution", titleAr: "الحل", heading: "A sovereign command center that sees everything, predicts issues, and responds autonomously.", headingAr: "مركز قيادة سيادي يرى كل شيء، يتنبأ بالمشاكل، ويستجيب بشكل مستقل.", points: [{ text: "360° operational visibility", textAr: "رؤية تشغيلية 360°" }, { text: "Predictive intelligence", textAr: "ذكاء تنبؤي" }, { text: "Autonomous response", textAr: "استجابة مستقلة" }] },
      { id: "unique-value", title: "Unique Value", titleAr: "القيمة الفريدة", heading: "Not just monitoring—orchestrating. AI that doesn't just alert, but acts.", headingAr: "ليس مجرد مراقبة—بل تنسيق. ذكاء اصطناعي لا ينبه فقط، بل يتصرف.", points: [{ text: "Autonomous orchestration", textAr: "تنسيق مستقل" }, { text: "Self-healing systems", textAr: "أنظمة تصلح نفسها" }, { text: "Predictive operations", textAr: "عمليات تنبؤية" }] },
      { id: "how-it-works", title: "How It Works", titleAr: "كيف يعمل", heading: "Collect signals → AI analyzes patterns → Predict issues → Auto-remediate → Learn and improve.", headingAr: "جمع الإشارات → AI يحلل الأنماط → التنبؤ بالمشاكل → المعالجة التلقائية → التعلم والتحسين.", points: [{ text: "Real-time signal collection", textAr: "جمع إشارات في الوقت الفعلي" }, { text: "Pattern analysis", textAr: "تحليل الأنماط" }, { text: "Automated remediation", textAr: "معالجة آلية" }] },
      { id: "market-advantage", title: "Market Advantage", titleAr: "الميزة السوقية", heading: "Beyond Datadog. Beyond Splunk. Beyond ServiceNow. This is operational intelligence.", headingAr: "ما وراء Datadog. ما وراء Splunk. ما وراء ServiceNow. هذا ذكاء تشغيلي.", points: [{ text: "Unified sovereign control", textAr: "تحكم سيادي موحد" }, { text: "AI-driven operations", textAr: "عمليات مدفوعة بالذكاء الاصطناعي" }] },
      { id: "use-cases", title: "Use Cases", titleAr: "حالات الاستخدام", heading: "Enterprise IT, DevOps teams, Cloud operations, Multi-platform orchestration.", headingAr: "IT المؤسسات، فرق DevOps، عمليات السحابة، تنسيق متعدد المنصات.", points: [{ text: "Enterprise IT operations", textAr: "عمليات IT المؤسسات" }, { text: "Multi-cloud management", textAr: "إدارة متعددة السحابات" }] },
      { id: "strategic-impact", title: "Strategic Impact", titleAr: "الأثر الاستراتيجي", heading: "90% faster incident resolution. 70% reduction in operational overhead. Complete visibility.", headingAr: "حل حوادث أسرع بـ 90%. تخفيض 70% في العبء التشغيلي. رؤية كاملة.", points: [{ text: "90% faster resolution", textAr: "حل أسرع بـ 90%" }, { text: "70% overhead reduction", textAr: "تخفيض العبء بـ 70%" }] },
    ],
    executiveSummary: {
      overview: "Central command platform for sovereign operational control across all INFERA platforms with AI-driven orchestration and autonomous incident response.",
      overviewAr: "منصة قيادة مركزية للتحكم التشغيلي السيادي عبر جميع منصات INFERA مع تنسيق مدفوع بالذكاء الاصطناعي واستجابة مستقلة للحوادث.",
      keyFeatures: ["Real-time Monitoring", "Cross-platform Orchestration", "Autonomous Response", "Predictive Operations", "Self-healing Systems"],
      keyFeaturesAr: ["المراقبة في الوقت الفعلي", "التنسيق عبر المنصات", "الاستجابة المستقلة", "العمليات التنبؤية", "أنظمة تصلح نفسها"],
      targetMarket: "Enterprise COOs, Operations Directors, Platform Managers, DevOps Leaders",
      targetMarketAr: "مديرو العمليات التنفيذيون، مديرو العمليات، مديرو المنصات، قادة DevOps",
      competitiveAdvantage: "Unified sovereign control across unlimited digital platforms with autonomous AI-driven operations",
      competitiveAdvantageAr: "تحكم سيادي موحد عبر منصات رقمية غير محدودة مع عمليات مستقلة مدفوعة بالذكاء الاصطناعي",
      strategicValue: "90% faster incident resolution, 70% reduction in operational overhead, complete operational visibility",
      strategicValueAr: "حل حوادث أسرع بـ 90%، تخفيض 70% في العبء التشغيلي، رؤية تشغيلية كاملة",
    },
    demoStoryboard: {
      scenes: [
        { title: "Opening Context", titleAr: "السياق الافتتاحي", description: "Show the chaos of disconnected operations", descriptionAr: "عرض فوضى العمليات المنفصلة", presenterSays: "Operations teams today are flying blind. Dozens of dashboards, no unified view, always reactive.", presenterSaysAr: "فرق العمليات اليوم تطير عمياء. عشرات اللوحات، لا رؤية موحدة، دائماً تتفاعل.", onScreen: "Multiple disconnected monitoring tools", onScreenAr: "أدوات مراقبة متعددة منفصلة", wowMoment: "Stats: Average incident takes 4 hours to detect", wowMomentAr: "إحصائيات: متوسط وقت اكتشاف الحادث 4 ساعات", duration: "2 min" },
        { title: "Platform Introduction", titleAr: "تقديم المنصة", description: "Reveal the unified command center", descriptionAr: "الكشف عن مركز القيادة الموحد", presenterSays: "Engine Control gives you one sovereign view of your entire digital ecosystem.", presenterSaysAr: "Engine Control يمنحك رؤية سيادية واحدة لمنظومتك الرقمية بأكملها.", onScreen: "Unified command center dashboard", onScreenAr: "لوحة مركز القيادة الموحد", wowMoment: "All platforms visible in single view", wowMomentAr: "جميع المنصات مرئية في عرض واحد", duration: "2 min" },
        { title: "AI Intelligence Moment", titleAr: "لحظة الذكاء AI", description: "Show autonomous incident response", descriptionAr: "عرض الاستجابة المستقلة للحوادث", presenterSays: "Watch as AI detects an anomaly, diagnoses the root cause, and auto-remediates—before users notice.", presenterSaysAr: "شاهد كيف يكتشف AI شذوذاً، يشخص السبب الجذري، ويعالج تلقائياً—قبل أن يلاحظ المستخدمون.", onScreen: "Live incident detection and auto-remediation", onScreenAr: "اكتشاف حادث مباشر ومعالجة تلقائية", wowMoment: "Incident resolved in 30 seconds without human intervention", wowMomentAr: "حادث تم حله في 30 ثانية بدون تدخل بشري", duration: "3 min" },
        { title: "Outcome & Impact", titleAr: "النتيجة والأثر", description: "Show operational transformation", descriptionAr: "عرض التحول التشغيلي", presenterSays: "This enterprise reduced incident resolution time by 90% and freed their ops team for strategic work.", presenterSaysAr: "هذه المؤسسة خفضت وقت حل الحوادث بـ 90% وحررت فريق العمليات للعمل الاستراتيجي.", onScreen: "Metrics dashboard showing improvements", onScreenAr: "لوحة مقاييس تظهر التحسينات", wowMoment: "Team now spends 80% on innovation vs firefighting", wowMomentAr: "الفريق الآن يقضي 80% في الابتكار بدلاً من إطفاء الحرائق", duration: "2 min" },
      ],
    },
  },
  // Continue with remaining platforms...
  {
    id: "finance",
    name: "INFERA Finance AI",
    nameAr: "إنفيرا المالية AI",
    tagline: "Sovereign Financial Intelligence Platform",
    taglineAr: "منصة الذكاء المالي السيادي",
    color: "emerald",
    gradient: "from-emerald-600 to-green-700",
    route: "/pitch-deck/finance",
    slides: [
      { id: "vision", title: "Vision", titleAr: "الرؤية", heading: "To transform financial management from reactive accounting to predictive financial intelligence.", headingAr: "تحويل الإدارة المالية من محاسبة تفاعلية إلى ذكاء مالي تنبؤي.", points: [{ text: "Predictive financial intelligence", textAr: "ذكاء مالي تنبؤي" }, { text: "AI-driven decision making", textAr: "اتخاذ قرارات مدفوع بالذكاء الاصطناعي" }] },
      { id: "problem", title: "Problem", titleAr: "المشكلة", heading: "Finance teams drown in spreadsheets, manual reconciliation, and backward-looking reports.", headingAr: "فرق المالية تغرق في جداول البيانات والمطابقة اليدوية والتقارير الماضية.", points: [{ text: "Manual processes dominate", textAr: "العمليات اليدوية مهيمنة" }, { text: "Backward-looking only", textAr: "نظر للماضي فقط" }, { text: "No predictive capability", textAr: "لا قدرة تنبؤية" }] },
      { id: "solution", title: "Solution", titleAr: "الحل", heading: "AI-powered financial management that predicts, optimizes, and automates with sovereign control.", headingAr: "إدارة مالية مدعومة بالذكاء الاصطناعي تتنبأ وتحسّن وتؤتمت مع تحكم سيادي.", points: [{ text: "Predictive analytics", textAr: "تحليلات تنبؤية" }, { text: "Automated reporting", textAr: "تقارير آلية" }, { text: "Risk intelligence", textAr: "ذكاء المخاطر" }] },
      { id: "unique-value", title: "Unique Value", titleAr: "القيمة الفريدة", heading: "Finance that thinks ahead. AI that doesn't just report—it predicts and recommends.", headingAr: "مالية تفكر للأمام. ذكاء اصطناعي لا يقدم تقارير فقط—بل يتنبأ ويوصي.", points: [{ text: "Predictive intelligence", textAr: "ذكاء تنبؤي" }, { text: "Proactive recommendations", textAr: "توصيات استباقية" }] },
      { id: "how-it-works", title: "How It Works", titleAr: "كيف يعمل", heading: "Ingest data → AI analyzes patterns → Generate forecasts → Recommend actions → Auto-execute.", headingAr: "استيعاب البيانات → AI يحلل الأنماط → توليد التوقعات → توصية بالإجراءات → تنفيذ تلقائي.", points: [{ text: "Continuous data ingestion", textAr: "استيعاب بيانات مستمر" }, { text: "Pattern recognition", textAr: "التعرف على الأنماط" }] },
      { id: "market-advantage", title: "Market Advantage", titleAr: "الميزة السوقية", heading: "Beyond SAP. Beyond Oracle. Beyond Workday. This is financial intelligence.", headingAr: "ما وراء SAP. ما وراء Oracle. ما وراء Workday. هذا ذكاء مالي.", points: [{ text: "AI-first architecture", textAr: "معمارية AI-أولاً" }, { text: "Sovereign data control", textAr: "تحكم سيادي في البيانات" }] },
      { id: "use-cases", title: "Use Cases", titleAr: "حالات الاستخدام", heading: "CFO offices, Treasury management, Financial planning, Risk management.", headingAr: "مكاتب CFO، إدارة الخزينة، التخطيط المالي، إدارة المخاطر.", points: [{ text: "CFO strategic planning", textAr: "التخطيط الاستراتيجي لـ CFO" }, { text: "Treasury optimization", textAr: "تحسين الخزينة" }] },
      { id: "strategic-impact", title: "Strategic Impact", titleAr: "الأثر الاستراتيجي", heading: "50% faster financial close. 30% improvement in forecast accuracy. Real-time visibility.", headingAr: "إغلاق مالي أسرع بـ 50%. تحسين 30% في دقة التوقعات. رؤية في الوقت الفعلي.", points: [{ text: "50% faster close", textAr: "إغلاق أسرع بـ 50%" }, { text: "30% better forecasts", textAr: "توقعات أفضل بـ 30%" }] },
    ],
    executiveSummary: {
      overview: "AI-powered financial management with predictive analytics and sovereign control, transforming finance from reactive accounting to proactive intelligence.",
      overviewAr: "إدارة مالية مدعومة بالذكاء الاصطناعي مع تحليلات تنبؤية وتحكم سيادي، تحول المالية من محاسبة تفاعلية إلى ذكاء استباقي.",
      keyFeatures: ["Predictive Analytics", "Automated Reporting", "Risk Intelligence", "Compliance Automation", "Cash Flow Optimization"],
      keyFeaturesAr: ["التحليلات التنبؤية", "التقارير الآلية", "ذكاء المخاطر", "أتمتة الامتثال", "تحسين التدفق النقدي"],
      targetMarket: "CFOs, Financial Directors, Treasury Managers, Finance Teams",
      targetMarketAr: "المدراء الماليون، مديرو الشؤون المالية، مديرو الخزينة، فرق المالية",
      competitiveAdvantage: "AI-first financial intelligence with sovereign data governance and predictive decision support",
      competitiveAdvantageAr: "ذكاء مالي AI-أولاً مع حوكمة بيانات سيادية ودعم قرارات تنبؤي",
      strategicValue: "50% faster financial close, 30% improvement in forecast accuracy, complete financial visibility",
      strategicValueAr: "إغلاق مالي أسرع بـ 50%، تحسين 30% في دقة التوقعات، رؤية مالية كاملة",
    },
    demoStoryboard: {
      scenes: [
        { title: "Opening Context", titleAr: "السياق الافتتاحي", description: "Show traditional finance pain points", descriptionAr: "عرض نقاط الألم المالية التقليدية", presenterSays: "Finance teams spend 80% of their time on manual processes. They're always looking backward.", presenterSaysAr: "فرق المالية تقضي 80% من وقتها في عمليات يدوية. دائماً ينظرون للخلف.", onScreen: "Overworked finance team with spreadsheets", onScreenAr: "فريق مالي مرهق مع جداول البيانات", wowMoment: "Stat: Average CFO can't answer cash position in real-time", wowMomentAr: "إحصائية: متوسط CFO لا يستطيع الإجابة عن وضع النقد في الوقت الفعلي", duration: "2 min" },
        { title: "Platform Introduction", titleAr: "تقديم المنصة", description: "Reveal predictive financial intelligence", descriptionAr: "الكشف عن الذكاء المالي التنبؤي", presenterSays: "INFERA Finance AI doesn't just report—it predicts. Your financial future, visible today.", presenterSaysAr: "INFERA Finance AI لا يقدم تقارير فقط—بل يتنبأ. مستقبلك المالي، مرئي اليوم.", onScreen: "Predictive financial dashboard", onScreenAr: "لوحة مالية تنبؤية", wowMoment: "90-day cash flow forecast with 95% accuracy", wowMomentAr: "توقع تدفق نقدي لـ 90 يوماً بدقة 95%", duration: "2 min" },
        { title: "AI Intelligence Moment", titleAr: "لحظة الذكاء AI", description: "Show AI recommendations in action", descriptionAr: "عرض توصيات AI في العمل", presenterSays: "Watch as AI identifies a cash optimization opportunity and recommends action.", presenterSaysAr: "شاهد كيف يحدد AI فرصة تحسين نقدي ويوصي بإجراء.", onScreen: "AI recommendation with projected savings", onScreenAr: "توصية AI مع وفورات متوقعة", wowMoment: "AI finds $2M in working capital improvement", wowMomentAr: "AI يجد 2 مليون دولار في تحسين رأس المال العامل", duration: "3 min" },
        { title: "Outcome & Impact", titleAr: "النتيجة والأثر", description: "Show financial transformation", descriptionAr: "عرض التحول المالي", presenterSays: "This CFO now closes books in 5 days instead of 20, with real-time visibility into every metric.", presenterSaysAr: "هذا CFO الآن يغلق الدفاتر في 5 أيام بدلاً من 20، مع رؤية في الوقت الفعلي لكل مقياس.", onScreen: "Before/after metrics comparison", onScreenAr: "مقارنة مقاييس قبل/بعد", wowMoment: "Finance team now strategic partners, not number-crunchers", wowMomentAr: "فريق المالية الآن شركاء استراتيجيون، وليس محللي أرقام", duration: "2 min" },
      ],
    },
  },
  // Add remaining platforms with same detailed structure
  {
    id: "humaniq",
    name: "INFERA HumanIQ",
    nameAr: "إنفيرا الموارد البشرية IQ",
    tagline: "Sovereign HR Intelligence Platform",
    taglineAr: "منصة ذكاء الموارد البشرية السيادية",
    color: "rose",
    gradient: "from-rose-600 to-pink-700",
    route: "/pitch-deck/humaniq",
    slides: [
      { id: "vision", title: "Vision", titleAr: "الرؤية", heading: "To transform HR from administrative function to strategic talent intelligence.", headingAr: "تحويل الموارد البشرية من وظيفة إدارية إلى ذكاء مواهب استراتيجي.", points: [{ text: "Strategic talent intelligence", textAr: "ذكاء مواهب استراتيجي" }, { text: "Predictive workforce planning", textAr: "تخطيط قوى عاملة تنبؤي" }] },
      { id: "problem", title: "Problem", titleAr: "المشكلة", heading: "HR is drowning in paperwork, can't predict turnover, and struggles to identify top performers.", headingAr: "الموارد البشرية تغرق في الأوراق، لا تستطيع التنبؤ بالمغادرة، وتكافح لتحديد الأداء المتميز.", points: [{ text: "Administrative overload", textAr: "عبء إداري زائد" }, { text: "No predictive capability", textAr: "لا قدرة تنبؤية" }] },
      { id: "solution", title: "Solution", titleAr: "الحل", heading: "AI-driven HR that predicts performance, identifies flight risks, and optimizes workforce.", headingAr: "موارد بشرية مدفوعة بالذكاء الاصطناعي تتنبأ بالأداء، تحدد مخاطر المغادرة، وتحسّن القوى العاملة.", points: [{ text: "Performance prediction", textAr: "التنبؤ بالأداء" }, { text: "Flight risk identification", textAr: "تحديد مخاطر المغادرة" }] },
      { id: "unique-value", title: "Unique Value", titleAr: "القيمة الفريدة", heading: "HR that thinks ahead. AI that sees patterns humans miss.", headingAr: "موارد بشرية تفكر للأمام. ذكاء اصطناعي يرى أنماطاً يفوتها البشر.", points: [{ text: "Predictive talent analytics", textAr: "تحليلات مواهب تنبؤية" }] },
      { id: "how-it-works", title: "How It Works", titleAr: "كيف يعمل", heading: "Analyze employee data → Identify patterns → Predict outcomes → Recommend interventions.", headingAr: "تحليل بيانات الموظفين → تحديد الأنماط → التنبؤ بالنتائج → توصية بالتدخلات.", points: [{ text: "Continuous analysis", textAr: "تحليل مستمر" }] },
      { id: "market-advantage", title: "Market Advantage", titleAr: "الميزة السوقية", heading: "Beyond Workday. Beyond SAP SuccessFactors. This is talent intelligence.", headingAr: "ما وراء Workday. ما وراء SAP SuccessFactors. هذا ذكاء المواهب.", points: [{ text: "AI-first HR", textAr: "موارد بشرية AI-أولاً" }] },
      { id: "use-cases", title: "Use Cases", titleAr: "حالات الاستخدام", heading: "CHROs, Talent Management, Workforce Planning, Employee Engagement.", headingAr: "مدراء الموارد البشرية، إدارة المواهب، تخطيط القوى العاملة، مشاركة الموظفين.", points: [{ text: "Strategic workforce planning", textAr: "تخطيط قوى عاملة استراتيجي" }] },
      { id: "strategic-impact", title: "Strategic Impact", titleAr: "الأثر الاستراتيجي", heading: "40% reduction in turnover. 3x faster hiring. Predictive workforce optimization.", headingAr: "تخفيض 40% في المغادرة. توظيف أسرع 3 مرات. تحسين قوى عاملة تنبؤي.", points: [{ text: "40% less turnover", textAr: "مغادرة أقل بـ 40%" }] },
    ],
    executiveSummary: {
      overview: "AI-driven HR platform for intelligent talent management and workforce optimization with predictive analytics.",
      overviewAr: "منصة موارد بشرية مدفوعة بالذكاء الاصطناعي لإدارة المواهب الذكية وتحسين القوى العاملة مع تحليلات تنبؤية.",
      keyFeatures: ["Talent Intelligence", "Performance AI", "Workforce Analytics", "Engagement Prediction", "Skill Gap Analysis"],
      keyFeaturesAr: ["ذكاء المواهب", "أداء AI", "تحليلات القوى العاملة", "توقع المشاركة", "تحليل فجوة المهارات"],
      targetMarket: "CHROs, HR Directors, Talent Managers, People Analytics Teams",
      targetMarketAr: "مدراء الموارد البشرية التنفيذيون، مديرو الموارد البشرية، مديرو المواهب، فرق تحليلات الموظفين",
      competitiveAdvantage: "Predictive HR intelligence with autonomous talent optimization and sovereign employee data control",
      competitiveAdvantageAr: "ذكاء موارد بشرية تنبؤي مع تحسين مواهب مستقل وتحكم سيادي في بيانات الموظفين",
      strategicValue: "40% reduction in turnover, 3x faster hiring, complete workforce visibility and optimization",
      strategicValueAr: "تخفيض 40% في المغادرة، توظيف أسرع 3 مرات، رؤية وتحسين كامل للقوى العاملة",
    },
    demoStoryboard: {
      scenes: [
        { title: "Opening Context", titleAr: "السياق الافتتاحي", description: "Show HR administrative burden", descriptionAr: "عرض العبء الإداري للموارد البشرية", presenterSays: "HR teams spend 70% of time on admin. They react to resignations instead of preventing them.", presenterSaysAr: "فرق الموارد البشرية تقضي 70% من الوقت في الإدارة. يتفاعلون مع الاستقالات بدلاً من منعها.", onScreen: "Overwhelmed HR team", onScreenAr: "فريق موارد بشرية مرهق", wowMoment: "Stat: Average cost of replacing an employee is 2x salary", wowMomentAr: "إحصائية: متوسط تكلفة استبدال موظف هو ضعف الراتب", duration: "2 min" },
        { title: "Platform Introduction", titleAr: "تقديم المنصة", description: "Reveal predictive talent intelligence", descriptionAr: "الكشف عن ذكاء المواهب التنبؤي", presenterSays: "HumanIQ sees patterns you can't. It predicts who will leave, who will excel, and what they need.", presenterSaysAr: "HumanIQ يرى أنماطاً لا تستطيع رؤيتها. يتنبأ بمن سيغادر، من سيتفوق، وما يحتاجونه.", onScreen: "Predictive talent dashboard", onScreenAr: "لوحة مواهب تنبؤية", wowMoment: "Flight risk prediction 90 days in advance", wowMomentAr: "تنبؤ بمخاطر المغادرة قبل 90 يوماً", duration: "2 min" },
        { title: "AI Intelligence Moment", titleAr: "لحظة الذكاء AI", description: "Show AI intervention recommendation", descriptionAr: "عرض توصية تدخل AI", presenterSays: "Watch as AI identifies a high performer at risk and recommends specific retention actions.", presenterSaysAr: "شاهد كيف يحدد AI موظفاً متميزاً في خطر ويوصي بإجراءات احتفاظ محددة.", onScreen: "AI retention recommendation", onScreenAr: "توصية احتفاظ AI", wowMoment: "Personalized retention plan generated in seconds", wowMomentAr: "خطة احتفاظ مخصصة تُنشأ في ثوانٍ", duration: "3 min" },
        { title: "Outcome & Impact", titleAr: "النتيجة والأثر", description: "Show HR transformation", descriptionAr: "عرض تحول الموارد البشرية", presenterSays: "This company reduced turnover by 40% and now HR is a strategic partner to the C-suite.", presenterSaysAr: "هذه الشركة خفضت المغادرة بـ 40% والآن الموارد البشرية شريك استراتيجي للإدارة العليا.", onScreen: "Transformation metrics", onScreenAr: "مقاييس التحول", wowMoment: "HR now predicts, not just reports", wowMomentAr: "الموارد البشرية الآن تتنبأ، لا تقدم تقارير فقط", duration: "2 min" },
      ],
    },
  },
  // Continuing with more platforms...
  {
    id: "legal",
    name: "INFERA Legal AI",
    nameAr: "إنفيرا القانونية AI",
    tagline: "Sovereign Legal Intelligence Platform",
    taglineAr: "منصة الذكاء القانوني السيادي",
    color: "slate",
    gradient: "from-slate-600 to-gray-700",
    route: "/pitch-deck/legal",
    slides: [],
    executiveSummary: { overview: "AI-powered legal operations with contract intelligence and compliance automation.", overviewAr: "عمليات قانونية مدعومة بالذكاء الاصطناعي مع ذكاء العقود وأتمتة الامتثال.", keyFeatures: ["Contract AI", "Compliance Automation", "Legal Analytics", "Risk Assessment"], keyFeaturesAr: ["عقود AI", "أتمتة الامتثال", "تحليلات قانونية", "تقييم المخاطر"], targetMarket: "General Counsels, Legal Directors, Compliance Officers", targetMarketAr: "المستشارون القانونيون، مديرو الشؤون القانونية، مسؤولو الامتثال", competitiveAdvantage: "AI-first legal intelligence with sovereign contract governance", competitiveAdvantageAr: "ذكاء قانوني AI-أولاً مع حوكمة عقود سيادية", strategicValue: "70% faster contract review, 90% compliance automation", strategicValueAr: "مراجعة عقود أسرع بـ 70%، أتمتة امتثال 90%" },
    demoStoryboard: { scenes: [{ title: "Contract Analysis", titleAr: "تحليل العقود", description: "AI analyzing contract risks", descriptionAr: "الذكاء الاصطناعي يحلل مخاطر العقود", presenterSays: "Watch AI extract key terms and identify risks in seconds.", presenterSaysAr: "شاهد AI يستخرج الشروط الرئيسية ويحدد المخاطر في ثوانٍ.", onScreen: "Contract analysis dashboard", onScreenAr: "لوحة تحليل العقود", wowMoment: "100-page contract analyzed in 30 seconds", wowMomentAr: "عقد من 100 صفحة تم تحليله في 30 ثانية", duration: "3 min" }] },
  },
  {
    id: "appforge",
    name: "INFERA AppForge",
    nameAr: "إنفيرا أب فورج",
    tagline: "Sovereign App Development Platform",
    taglineAr: "منصة تطوير التطبيقات السيادية",
    color: "orange",
    gradient: "from-orange-600 to-red-700",
    route: "/pitch-deck/appforge",
    slides: [],
    executiveSummary: { overview: "No-code/low-code platform for building sovereign applications with AI assistance.", overviewAr: "منصة بدون كود/قليلة الكود لبناء تطبيقات سيادية مع مساعدة الذكاء الاصطناعي.", keyFeatures: ["Visual Builder", "AI Code Generation", "Component Library", "One-Click Deploy"], keyFeaturesAr: ["منشئ مرئي", "توليد كود AI", "مكتبة المكونات", "نشر بنقرة واحدة"], targetMarket: "Business Analysts, Citizen Developers, IT Teams", targetMarketAr: "محللو الأعمال، المطورون المواطنون، فرق تكنولوجيا المعلومات", competitiveAdvantage: "AI-powered app creation with sovereign deployment", competitiveAdvantageAr: "إنشاء تطبيقات مدعوم بالذكاء الاصطناعي مع نشر سيادي", strategicValue: "10x faster app development, zero coding required", strategicValueAr: "تطوير تطبيقات أسرع 10 مرات، صفر كود مطلوب" },
    demoStoryboard: { scenes: [{ title: "Visual Design", titleAr: "التصميم المرئي", description: "Drag-and-drop app building", descriptionAr: "بناء تطبيقات بالسحب والإفلات", presenterSays: "Build a complete app in minutes with no code.", presenterSaysAr: "ابنِ تطبيقاً كاملاً في دقائق بدون كود.", onScreen: "Visual app builder", onScreenAr: "منشئ التطبيقات المرئي", wowMoment: "Full app built in 5 minutes", wowMomentAr: "تطبيق كامل بُني في 5 دقائق", duration: "3 min" }] },
  },
  {
    id: "marketing",
    name: "INFERA Marketing AI",
    nameAr: "إنفيرا التسويق AI",
    tagline: "Sovereign Marketing Intelligence Platform",
    taglineAr: "منصة ذكاء التسويق السيادي",
    color: "pink",
    gradient: "from-pink-600 to-rose-700",
    route: "/pitch-deck/marketing",
    slides: [],
    executiveSummary: { overview: "AI-driven marketing automation with predictive campaign intelligence.", overviewAr: "أتمتة تسويقية مدفوعة بالذكاء الاصطناعي مع ذكاء حملات تنبؤي.", keyFeatures: ["Campaign AI", "Audience Intelligence", "Content Optimization", "ROI Prediction"], keyFeaturesAr: ["حملات AI", "ذكاء الجمهور", "تحسين المحتوى", "توقع العائد"], targetMarket: "CMOs, Marketing Directors, Growth Managers", targetMarketAr: "مدراء التسويق التنفيذيون، مديرو التسويق، مديرو النمو", competitiveAdvantage: "Predictive marketing with AI-driven optimization", competitiveAdvantageAr: "تسويق تنبؤي مع تحسين مدفوع بالذكاء الاصطناعي", strategicValue: "50% better campaign ROI, 3x faster optimization", strategicValueAr: "عائد حملات أفضل بـ 50%، تحسين أسرع 3 مرات" },
    demoStoryboard: { scenes: [{ title: "Campaign Dashboard", titleAr: "لوحة الحملات", description: "AI-powered campaign insights", descriptionAr: "رؤى الحملات المدعومة بالذكاء الاصطناعي", presenterSays: "See how AI predicts campaign performance before you spend.", presenterSaysAr: "شاهد كيف يتنبأ AI بأداء الحملة قبل الإنفاق.", onScreen: "Predictive campaign analytics", onScreenAr: "تحليلات حملات تنبؤية", wowMoment: "ROI predicted with 90% accuracy", wowMomentAr: "العائد متوقع بدقة 90%", duration: "2 min" }] },
  },
  {
    id: "marketplace",
    name: "INFERA Marketplace",
    nameAr: "إنفيرا السوق",
    tagline: "Sovereign Digital Marketplace Platform",
    taglineAr: "منصة السوق الرقمي السيادي",
    color: "teal",
    gradient: "from-teal-600 to-cyan-700",
    route: "/pitch-deck/marketplace",
    slides: [],
    executiveSummary: { overview: "AI-powered marketplace platform for sovereign digital commerce.", overviewAr: "منصة سوق مدعومة بالذكاء الاصطناعي للتجارة الرقمية السيادية.", keyFeatures: ["Multi-vendor Management", "AI Recommendations", "Transaction Intelligence", "Fraud Prevention"], keyFeaturesAr: ["إدارة متعددة البائعين", "توصيات AI", "ذكاء المعاملات", "منع الاحتيال"], targetMarket: "E-commerce Directors, Marketplace Operators", targetMarketAr: "مديرو التجارة الإلكترونية، مشغلو الأسواق", competitiveAdvantage: "AI-first marketplace with sovereign transaction governance", competitiveAdvantageAr: "سوق AI-أولاً مع حوكمة معاملات سيادية", strategicValue: "40% higher conversions, 99.9% fraud prevention", strategicValueAr: "تحويلات أعلى بـ 40%، منع احتيال 99.9%" },
    demoStoryboard: { scenes: [{ title: "Vendor Dashboard", titleAr: "لوحة البائعين", description: "AI-powered vendor management", descriptionAr: "إدارة البائعين المدعومة بالذكاء الاصطناعي", presenterSays: "Manage thousands of vendors with AI intelligence.", presenterSaysAr: "أدِر آلاف البائعين مع ذكاء اصطناعي.", onScreen: "Multi-vendor management view", onScreenAr: "عرض إدارة متعدد البائعين", wowMoment: "AI auto-curates best sellers", wowMomentAr: "AI ينظم أفضل البائعين تلقائياً", duration: "2 min" }] },
  },
  {
    id: "education",
    name: "INFERA Education AI",
    nameAr: "إنفيرا التعليم AI",
    tagline: "Sovereign Educational Intelligence Platform",
    taglineAr: "منصة الذكاء التعليمي السيادي",
    color: "violet",
    gradient: "from-violet-600 to-purple-700",
    route: "/pitch-deck/education",
    slides: [],
    executiveSummary: { overview: "AI-powered learning platform with personalized education and sovereign data control.", overviewAr: "منصة تعلم مدعومة بالذكاء الاصطناعي مع تعليم مخصص وتحكم سيادي في البيانات.", keyFeatures: ["Adaptive Learning", "AI Tutoring", "Progress Analytics", "Content Generation"], keyFeaturesAr: ["التعلم التكيفي", "التدريس AI", "تحليلات التقدم", "توليد المحتوى"], targetMarket: "Educational Institutions, Corporate Training, EdTech", targetMarketAr: "المؤسسات التعليمية، التدريب المؤسسي، شركات تكنولوجيا التعليم", competitiveAdvantage: "AI-first education with sovereign learning governance", competitiveAdvantageAr: "تعليم AI-أولاً مع حوكمة تعلم سيادية", strategicValue: "3x faster learning outcomes, personalized for each learner", strategicValueAr: "نتائج تعلم أسرع 3 مرات، مخصصة لكل متعلم" },
    demoStoryboard: { scenes: [{ title: "Learning Dashboard", titleAr: "لوحة التعلم", description: "Personalized learning paths", descriptionAr: "مسارات تعلم مخصصة", presenterSays: "Every learner gets a unique path optimized by AI.", presenterSaysAr: "كل متعلم يحصل على مسار فريد محسن بالذكاء الاصطناعي.", onScreen: "Adaptive learning interface", onScreenAr: "واجهة التعلم التكيفي", wowMoment: "AI adapts in real-time to learner progress", wowMomentAr: "AI يتكيف في الوقت الفعلي مع تقدم المتعلم", duration: "2 min" }] },
  },
  {
    id: "attend",
    name: "INFERA Attend",
    nameAr: "إنفيرا الحضور",
    tagline: "Sovereign Attendance & Workforce Management",
    taglineAr: "إدارة الحضور والقوى العاملة السيادية",
    color: "cyan",
    gradient: "from-cyan-600 to-blue-700",
    route: "/pitch-deck/attend",
    slides: [],
    executiveSummary: { overview: "AI-powered attendance and workforce management with biometric intelligence.", overviewAr: "إدارة الحضور والقوى العاملة المدعومة بالذكاء الاصطناعي مع ذكاء بيومتري.", keyFeatures: ["Biometric AI", "Shift Intelligence", "Absence Prediction", "Workforce Analytics"], keyFeaturesAr: ["بيومتري AI", "ذكاء الورديات", "توقع الغياب", "تحليلات القوى العاملة"], targetMarket: "HR Managers, Operations Directors, Workforce Planners", targetMarketAr: "مديرو الموارد البشرية، مديرو العمليات، مخططو القوى العاملة", competitiveAdvantage: "Predictive workforce management with sovereign biometric control", competitiveAdvantageAr: "إدارة قوى عاملة تنبؤية مع تحكم بيومتري سيادي", strategicValue: "30% reduction in absenteeism, optimized shift planning", strategicValueAr: "تخفيض 30% في الغياب، تخطيط ورديات محسن" },
    demoStoryboard: { scenes: [{ title: "Attendance Dashboard", titleAr: "لوحة الحضور", description: "Real-time attendance tracking", descriptionAr: "تتبع الحضور في الوقت الفعلي", presenterSays: "Know exactly who's where, when, with predictive insights.", presenterSaysAr: "اعرف بالضبط من أين، متى، مع رؤى تنبؤية.", onScreen: "Real-time workforce view", onScreenAr: "عرض القوى العاملة في الوقت الفعلي", wowMoment: "AI predicts absences 2 weeks ahead", wowMomentAr: "AI يتنبأ بالغياب قبل أسبوعين", duration: "2 min" }] },
  },
  {
    id: "smartdocs",
    name: "INFERA Smart Docs",
    nameAr: "إنفيرا المستندات الذكية",
    tagline: "Sovereign Document Intelligence Platform",
    taglineAr: "منصة ذكاء المستندات السيادية",
    color: "sky",
    gradient: "from-sky-600 to-blue-700",
    route: "/pitch-deck/smartdocs",
    slides: [],
    executiveSummary: { overview: "AI-powered document management with intelligent extraction and sovereign storage.", overviewAr: "إدارة مستندات مدعومة بالذكاء الاصطناعي مع استخراج ذكي وتخزين سيادي.", keyFeatures: ["Document AI", "Intelligent Search", "Auto-classification", "Version Control"], keyFeaturesAr: ["مستندات AI", "بحث ذكي", "تصنيف تلقائي", "التحكم بالإصدارات"], targetMarket: "Document Managers, Compliance Teams, Legal Departments", targetMarketAr: "مديرو المستندات، فرق الامتثال، الأقسام القانونية", competitiveAdvantage: "AI-first document intelligence with sovereign data governance", competitiveAdvantageAr: "ذكاء مستندات AI-أولاً مع حوكمة بيانات سيادية", strategicValue: "80% faster document retrieval, 100% searchable archive", strategicValueAr: "استرجاع مستندات أسرع بـ 80%، أرشيف قابل للبحث 100%" },
    demoStoryboard: { scenes: [{ title: "Document Upload", titleAr: "رفع المستندات", description: "AI auto-classification on upload", descriptionAr: "التصنيف التلقائي AI عند الرفع", presenterSays: "Upload any document and AI classifies, extracts, and indexes automatically.", presenterSaysAr: "ارفع أي مستند وسيصنفه ويستخرج منه ويفهرسه AI تلقائياً.", onScreen: "Drag-drop upload with AI processing", onScreenAr: "رفع بالسحب والإفلات مع معالجة AI", wowMoment: "1000 documents processed in 5 minutes", wowMomentAr: "1000 مستند تمت معالجتها في 5 دقائق", duration: "2 min" }] },
  },
  {
    id: "hospitality",
    name: "INFERA Hospitality AI",
    nameAr: "إنفيرا الضيافة AI",
    tagline: "Sovereign Hospitality Intelligence Platform",
    taglineAr: "منصة ذكاء الضيافة السيادية",
    color: "amber",
    gradient: "from-amber-600 to-orange-700",
    route: "/pitch-deck/hospitality",
    slides: [],
    executiveSummary: { overview: "AI-powered hospitality management with guest intelligence and operational optimization.", overviewAr: "إدارة ضيافة مدعومة بالذكاء الاصطناعي مع ذكاء الضيوف وتحسين العمليات.", keyFeatures: ["Guest AI", "Revenue Optimization", "Service Intelligence", "Experience Personalization"], keyFeaturesAr: ["ضيوف AI", "تحسين الإيرادات", "ذكاء الخدمة", "تخصيص التجربة"], targetMarket: "Hotel Chains, Resort Operators, Hospitality Groups", targetMarketAr: "سلاسل الفنادق، مشغلو المنتجعات، مجموعات الضيافة", competitiveAdvantage: "AI-first hospitality with sovereign guest data governance", competitiveAdvantageAr: "ضيافة AI-أولاً مع حوكمة بيانات ضيوف سيادية", strategicValue: "25% higher RevPAR, 40% improved guest satisfaction", strategicValueAr: "RevPAR أعلى بـ 25%، رضا ضيوف أفضل بـ 40%" },
    demoStoryboard: { scenes: [{ title: "Guest Dashboard", titleAr: "لوحة الضيوف", description: "360° guest intelligence", descriptionAr: "ذكاء ضيوف 360 درجة", presenterSays: "Know every guest preference before they ask.", presenterSaysAr: "اعرف كل تفضيلات الضيف قبل أن يطلب.", onScreen: "Guest profile with AI insights", onScreenAr: "ملف الضيف مع رؤى AI", wowMoment: "AI predicts guest needs and pre-arranges services", wowMomentAr: "AI يتنبأ باحتياجات الضيف ويرتب الخدمات مسبقاً", duration: "2 min" }] },
  },
  {
    id: "smartmemory",
    name: "INFERA SmartMemory",
    nameAr: "إنفيرا الذاكرة الذكية",
    tagline: "Sovereign Institutional Memory Platform",
    taglineAr: "منصة الذاكرة المؤسسية السيادية",
    color: "purple",
    gradient: "from-purple-600 to-violet-700",
    route: "/pitch-deck/smartmemory",
    slides: [],
    executiveSummary: { overview: "AI-powered knowledge management with institutional memory and semantic search.", overviewAr: "إدارة معرفة مدعومة بالذكاء الاصطناعي مع ذاكرة مؤسسية وبحث دلالي.", keyFeatures: ["Knowledge AI", "Semantic Search", "Memory Networks", "Insight Generation"], keyFeaturesAr: ["معرفة AI", "بحث دلالي", "شبكات الذاكرة", "توليد الرؤى"], targetMarket: "Knowledge Managers, Research Teams, Innovation Departments", targetMarketAr: "مديرو المعرفة، فرق البحث، أقسام الابتكار", competitiveAdvantage: "AI-first institutional memory with sovereign knowledge governance", competitiveAdvantageAr: "ذاكرة مؤسسية AI-أولاً مع حوكمة معرفة سيادية", strategicValue: "Zero knowledge loss, instant insight discovery", strategicValueAr: "صفر فقدان معرفة، اكتشاف رؤى فوري" },
    demoStoryboard: { scenes: [{ title: "Knowledge Graph", titleAr: "رسم المعرفة", description: "Visualize institutional knowledge", descriptionAr: "تصور المعرفة المؤسسية", presenterSays: "See all your organization's knowledge as a connected network.", presenterSaysAr: "شاهد كل معرفة مؤسستك كشبكة متصلة.", onScreen: "Interactive knowledge graph", onScreenAr: "رسم معرفة تفاعلي", wowMoment: "AI discovers hidden connections between projects", wowMomentAr: "AI يكتشف اتصالات مخفية بين المشاريع", duration: "2 min" }] },
  },
  {
    id: "visionfeasibility",
    name: "INFERA VisionFeasibility",
    nameAr: "إنفيرا رؤية الجدوى",
    tagline: "Sovereign Feasibility Intelligence Platform",
    taglineAr: "منصة ذكاء الجدوى السيادية",
    color: "lime",
    gradient: "from-lime-600 to-green-700",
    route: "/pitch-deck/visionfeasibility",
    slides: [],
    executiveSummary: { overview: "AI-powered feasibility analysis with predictive project intelligence.", overviewAr: "تحليل جدوى مدعوم بالذكاء الاصطناعي مع ذكاء مشاريع تنبؤي.", keyFeatures: ["Feasibility AI", "Risk Prediction", "ROI Modeling", "Scenario Analysis"], keyFeaturesAr: ["جدوى AI", "توقع المخاطر", "نمذجة العائد", "تحليل السيناريوهات"], targetMarket: "Project Managers, Investment Analysts, Strategy Teams", targetMarketAr: "مديرو المشاريع، محللو الاستثمار، فرق الاستراتيجية", competitiveAdvantage: "AI-first feasibility with sovereign project governance", competitiveAdvantageAr: "جدوى AI-أولاً مع حوكمة مشاريع سيادية", strategicValue: "90% more accurate project predictions, 50% faster analysis", strategicValueAr: "تنبؤات مشاريع أدق بـ 90%، تحليل أسرع بـ 50%" },
    demoStoryboard: { scenes: [{ title: "Project Analysis", titleAr: "تحليل المشروع", description: "AI feasibility assessment", descriptionAr: "تقييم جدوى AI", presenterSays: "Get accurate project feasibility in minutes, not months.", presenterSaysAr: "احصل على جدوى مشروع دقيقة في دقائق، ليس أشهر.", onScreen: "Feasibility analysis dashboard", onScreenAr: "لوحة تحليل الجدوى", wowMoment: "Complete feasibility study generated in 10 minutes", wowMomentAr: "دراسة جدوى كاملة تُنشأ في 10 دقائق", duration: "3 min" }] },
  },
  {
    id: "cvbuilder",
    name: "INFERA CV Builder AI",
    nameAr: "إنفيرا منشئ السيرة AI",
    tagline: "Sovereign Career Intelligence Platform",
    taglineAr: "منصة ذكاء المسيرة المهنية السيادية",
    color: "indigo",
    gradient: "from-indigo-600 to-blue-700",
    route: "/pitch-deck/cvbuilder",
    slides: [],
    executiveSummary: { overview: "AI-powered CV creation with career intelligence and job matching.", overviewAr: "إنشاء سيرة ذاتية مدعوم بالذكاء الاصطناعي مع ذكاء مهني ومطابقة وظائف.", keyFeatures: ["CV AI", "Skills Analysis", "Job Matching", "Career Insights"], keyFeaturesAr: ["سيرة ذاتية AI", "تحليل المهارات", "مطابقة الوظائف", "رؤى مهنية"], targetMarket: "Job Seekers, Career Coaches, HR Departments", targetMarketAr: "الباحثون عن عمل، مدربو المسيرة المهنية، أقسام الموارد البشرية", competitiveAdvantage: "AI-first career platform with sovereign data control", competitiveAdvantageAr: "منصة مهنية AI-أولاً مع تحكم سيادي في البيانات", strategicValue: "3x higher interview rates, optimized for ATS systems", strategicValueAr: "معدلات مقابلات أعلى 3 مرات، محسنة لأنظمة ATS" },
    demoStoryboard: { scenes: [{ title: "CV Creation", titleAr: "إنشاء السيرة", description: "AI-powered CV generation", descriptionAr: "توليد سيرة ذاتية بالذكاء الاصطناعي", presenterSays: "Create a perfect CV optimized for any job in minutes.", presenterSaysAr: "أنشئ سيرة ذاتية مثالية محسنة لأي وظيفة في دقائق.", onScreen: "CV builder with AI suggestions", onScreenAr: "منشئ السيرة مع اقتراحات AI", wowMoment: "AI rewrites bullets to match job requirements", wowMomentAr: "AI يعيد كتابة النقاط لتتوافق مع متطلبات الوظيفة", duration: "2 min" }] },
  },
  {
    id: "jobsai",
    name: "INFERA Jobs AI",
    nameAr: "إنفيرا الوظائف AI",
    tagline: "Sovereign Talent Marketplace Platform",
    taglineAr: "منصة سوق المواهب السيادي",
    color: "green",
    gradient: "from-green-600 to-emerald-700",
    route: "/pitch-deck/jobsai",
    slides: [],
    executiveSummary: { overview: "AI-powered job marketplace with intelligent matching and talent analytics.", overviewAr: "سوق وظائف مدعوم بالذكاء الاصطناعي مع مطابقة ذكية وتحليلات المواهب.", keyFeatures: ["Talent AI", "Smart Matching", "Hiring Analytics", "Candidate Intelligence"], keyFeaturesAr: ["مواهب AI", "مطابقة ذكية", "تحليلات التوظيف", "ذكاء المرشحين"], targetMarket: "Recruiters, HR Teams, Staffing Agencies", targetMarketAr: "المجندون، فرق الموارد البشرية، وكالات التوظيف", competitiveAdvantage: "AI-first talent marketplace with sovereign hiring governance", competitiveAdvantageAr: "سوق مواهب AI-أولاً مع حوكمة توظيف سيادية", strategicValue: "70% faster hiring, 50% better candidate quality", strategicValueAr: "توظيف أسرع بـ 70%، جودة مرشحين أفضل بـ 50%" },
    demoStoryboard: { scenes: [{ title: "Job Posting", titleAr: "نشر الوظيفة", description: "AI-optimized job creation", descriptionAr: "إنشاء وظائف محسن بالذكاء الاصطناعي", presenterSays: "AI writes job descriptions that attract the right talent.", presenterSaysAr: "AI يكتب أوصاف وظائف تجذب المواهب المناسبة.", onScreen: "Job creation with AI optimization", onScreenAr: "إنشاء وظائف مع تحسين AI", wowMoment: "3x more qualified applicants per posting", wowMomentAr: "متقدمين مؤهلين 3 مرات أكثر لكل وظيفة", duration: "2 min" }] },
  },
  {
    id: "trainai",
    name: "INFERA TrainAI",
    nameAr: "إنفيرا التدريب AI",
    tagline: "Sovereign Training Intelligence Platform",
    taglineAr: "منصة ذكاء التدريب السيادي",
    color: "yellow",
    gradient: "from-yellow-600 to-amber-700",
    route: "/pitch-deck/trainai",
    slides: [],
    executiveSummary: { overview: "AI-powered corporate training with adaptive learning and skill tracking.", overviewAr: "تدريب مؤسسي مدعوم بالذكاء الاصطناعي مع تعلم تكيفي وتتبع المهارات.", keyFeatures: ["Adaptive Learning", "Skill Tracking", "Content AI", "Performance Analytics"], keyFeaturesAr: ["تعلم تكيفي", "تتبع المهارات", "محتوى AI", "تحليلات الأداء"], targetMarket: "L&D Teams, Corporate Training, Educational Institutions", targetMarketAr: "فرق التعلم والتطوير، التدريب المؤسسي، المؤسسات التعليمية", competitiveAdvantage: "AI-first training with sovereign learning data governance", competitiveAdvantageAr: "تدريب AI-أولاً مع حوكمة بيانات تعلم سيادية", strategicValue: "2x faster skill development, 40% higher retention", strategicValueAr: "تطوير مهارات أسرع مرتين، احتفاظ أعلى بـ 40%" },
    demoStoryboard: { scenes: [{ title: "Course Creation", titleAr: "إنشاء الدورات", description: "AI-powered course design", descriptionAr: "تصميم دورات مدعوم بالذكاء الاصطناعي", presenterSays: "AI creates personalized training paths for every employee.", presenterSaysAr: "AI ينشئ مسارات تدريب مخصصة لكل موظف.", onScreen: "Adaptive course builder", onScreenAr: "منشئ دورات تكيفي", wowMoment: "Complete training curriculum generated in minutes", wowMomentAr: "منهج تدريب كامل يُنشأ في دقائق", duration: "2 min" }] },
  },
  {
    id: "sovereignfinance",
    name: "INFERA Sovereign Finance",
    nameAr: "إنفيرا التمويل السيادي",
    tagline: "Sovereign Financial Governance Platform",
    taglineAr: "منصة الحوكمة المالية السيادية",
    color: "emerald",
    gradient: "from-emerald-600 to-teal-700",
    route: "/pitch-deck/sovereignfinance",
    slides: [],
    executiveSummary: { overview: "Complete sovereign financial governance with AI-driven treasury and compliance.", overviewAr: "حوكمة مالية سيادية كاملة مع خزينة وامتثال مدفوعين بالذكاء الاصطناعي.", keyFeatures: ["Treasury AI", "Compliance Automation", "Risk Intelligence", "Sovereign Reporting"], keyFeaturesAr: ["خزينة AI", "أتمتة الامتثال", "ذكاء المخاطر", "تقارير سيادية"], targetMarket: "CFOs, Treasury Directors, Financial Controllers", targetMarketAr: "المدراء الماليون، مديرو الخزينة، المراقبون الماليون", competitiveAdvantage: "Complete sovereign financial control with AI governance", competitiveAdvantageAr: "تحكم مالي سيادي كامل مع حوكمة AI", strategicValue: "100% compliance automation, real-time financial control", strategicValueAr: "أتمتة امتثال 100%، تحكم مالي في الوقت الفعلي" },
    demoStoryboard: { scenes: [{ title: "Treasury Dashboard", titleAr: "لوحة الخزينة", description: "Real-time treasury intelligence", descriptionAr: "ذكاء خزينة في الوقت الفعلي", presenterSays: "Complete treasury visibility with AI-driven optimization.", presenterSaysAr: "رؤية خزينة كاملة مع تحسين مدفوع بالذكاء الاصطناعي.", onScreen: "Global treasury view", onScreenAr: "عرض الخزينة العالمي", wowMoment: "AI optimizes cash positions across entities", wowMomentAr: "AI يحسن المراكز النقدية عبر الكيانات", duration: "2 min" }] },
  },
  {
    id: "globalcloud",
    name: "INFERA GlobalCloud",
    nameAr: "إنفيرا السحابة العالمية",
    tagline: "Sovereign Global Financial Control Platform",
    taglineAr: "منصة التحكم المالي العالمي السيادي",
    color: "blue",
    gradient: "from-blue-600 to-cyan-700",
    route: "/pitch-deck/globalcloud",
    slides: [],
    executiveSummary: { overview: "Global multi-entity, multi-currency financial orchestration with AI intelligence.", overviewAr: "تنسيق مالي عالمي متعدد الكيانات والعملات مع ذكاء AI.", keyFeatures: ["Multi-entity Control", "Currency Intelligence", "Cross-border Compliance", "Global Consolidation"], keyFeaturesAr: ["تحكم متعدد الكيانات", "ذكاء العملات", "امتثال عبر الحدود", "توحيد عالمي"], targetMarket: "Multinational CFOs, Global Controllers, International Finance Teams", targetMarketAr: "المدراء الماليون متعددو الجنسيات، المراقبون العالميون، فرق التمويل الدولي", competitiveAdvantage: "Global financial intelligence sovereignty", competitiveAdvantageAr: "سيادة الذكاء المالي العالمي", strategicValue: "Real-time global financial visibility, automated compliance", strategicValueAr: "رؤية مالية عالمية في الوقت الفعلي، امتثال آلي" },
    demoStoryboard: { scenes: [{ title: "Global Overview", titleAr: "النظرة العالمية", description: "Multi-entity financial view", descriptionAr: "نظرة مالية متعددة الكيانات", presenterSays: "See every entity, every currency, every transaction in real-time.", presenterSaysAr: "شاهد كل كيان، كل عملة، كل معاملة في الوقت الفعلي.", onScreen: "Global financial dashboard", onScreenAr: "لوحة مالية عالمية", wowMoment: "Instant consolidation across 50 entities", wowMomentAr: "توحيد فوري عبر 50 كياناً", duration: "2 min" }] },
  },
  {
    id: "shieldgrid",
    name: "INFERA ShieldGrid",
    nameAr: "إنفيرا شبكة الدفاع",
    tagline: "Sovereign Cyber Defense Platform",
    taglineAr: "منصة الدفاع السيبراني السيادي",
    color: "slate",
    gradient: "from-slate-600 to-zinc-700",
    route: "/pitch-deck/shieldgrid",
    slides: [],
    executiveSummary: { overview: "AI-driven cyber defense with threat prediction and automated incident response.", overviewAr: "دفاع سيبراني مدفوع بالذكاء الاصطناعي مع تنبؤ بالتهديدات واستجابة آلية للحوادث.", keyFeatures: ["Threat AI", "Zero-Trust Architecture", "Automated Response", "Behavioral Analysis"], keyFeaturesAr: ["تهديدات AI", "معمارية Zero-Trust", "استجابة آلية", "تحليل سلوكي"], targetMarket: "CISOs, Security Directors, IT Security Teams", targetMarketAr: "مدراء أمن المعلومات التنفيذيون، مديرو الأمن، فرق أمن تكنولوجيا المعلومات", competitiveAdvantage: "Sovereign cyber immunity with AI-driven defense", competitiveAdvantageAr: "مناعة سيبرانية سيادية مع دفاع مدفوع بالذكاء الاصطناعي", strategicValue: "99.9% threat prevention, autonomous incident response", strategicValueAr: "منع تهديدات 99.9%، استجابة حوادث مستقلة" },
    demoStoryboard: { scenes: [{ title: "Threat Dashboard", titleAr: "لوحة التهديدات", description: "Real-time threat intelligence", descriptionAr: "ذكاء تهديدات في الوقت الفعلي", presenterSays: "AI detects and neutralizes threats before they impact.", presenterSaysAr: "AI يكتشف ويحيد التهديدات قبل أن تؤثر.", onScreen: "Threat detection and response view", onScreenAr: "عرض اكتشاف واستجابة التهديدات", wowMoment: "Attack blocked and traced in under 1 second", wowMomentAr: "هجوم تم حظره وتتبعه في أقل من ثانية", duration: "2 min" }] },
  },
  {
    id: "smartremote",
    name: "INFERA Smart Remote AI",
    nameAr: "إنفيرا التحكم عن بعد الذكي",
    tagline: "Sovereign Remote Control Platform",
    taglineAr: "منصة التحكم عن بعد السيادي",
    color: "purple",
    gradient: "from-purple-600 to-violet-700",
    route: "/pitch-deck/smartremote",
    slides: [],
    executiveSummary: { overview: "AI-powered remote device control with behavioral monitoring and policy governance.", overviewAr: "تحكم عن بعد في الأجهزة مدعوم بالذكاء الاصطناعي مع مراقبة سلوكية وحوكمة سياسات.", keyFeatures: ["Session AI", "Behavioral Monitoring", "Policy Enforcement", "Full Audit Trails"], keyFeaturesAr: ["جلسات AI", "مراقبة سلوكية", "تطبيق السياسات", "مسارات تدقيق كاملة"], targetMarket: "IT Directors, Remote Workforce Managers, Security Teams", targetMarketAr: "مديرو تكنولوجيا المعلومات، مديرو القوى العاملة عن بعد، فرق الأمن", competitiveAdvantage: "Sovereign remote control intelligence", competitiveAdvantageAr: "ذكاء تحكم عن بعد سيادي", strategicValue: "100% session visibility, zero unauthorized access", strategicValueAr: "رؤية جلسات 100%، صفر وصول غير مصرح" },
    demoStoryboard: { scenes: [{ title: "Remote Session", titleAr: "الجلسة عن بعد", description: "Secure remote connection", descriptionAr: "اتصال آمن عن بعد", presenterSays: "Secure, monitored remote access with AI behavioral analysis.", presenterSaysAr: "وصول عن بعد آمن ومراقب مع تحليل سلوكي AI.", onScreen: "Remote session with AI monitoring overlay", onScreenAr: "جلسة عن بعد مع طبقة مراقبة AI", wowMoment: "AI detects suspicious behavior and alerts in real-time", wowMomentAr: "AI يكتشف سلوكاً مشبوهاً وينبه في الوقت الفعلي", duration: "2 min" }] },
  },
];

export function getPlatformById(id: string): PitchDeckData | undefined {
  return inferaPlatforms.find(p => p.id === id);
}

export function getAllPlatforms(): PitchDeckData[] {
  return inferaPlatforms;
}

// Master Group Pitch structure
export const masterGroupPitch = {
  title: "INFERA Group",
  titleAr: "مجموعة INFERA",
  subtitle: "The Sovereign Digital Platform Ecosystem",
  subtitleAr: "منظومة المنصات الرقمية السيادية",
  slides: [
    { id: "group-vision", title: "Group Vision", titleAr: "رؤية المجموعة", content: "To become the world's leading sovereign digital platform factory, enabling organizations to achieve complete digital autonomy." },
    { id: "market-problem", title: "Market Problem", titleAr: "مشكلة السوق", content: "Fragmented intelligence across disconnected systems, no unified governance, vendor lock-in everywhere." },
    { id: "infera-solution", title: "INFERA Solution", titleAr: "حل INFERA", content: "21+ integrated sovereign AI platforms that work together seamlessly under unified governance." },
    { id: "ecosystem-architecture", title: "Ecosystem Architecture", titleAr: "معمارية المنظومة", content: "Core Engine + Platform Categories: Control, Finance, HR, Security, Growth, Industry." },
    { id: "platform-categories", title: "Platform Categories", titleAr: "فئات المنصات", content: "Control (2), Finance (4), HR (4), Security (2), Growth (4), Industry (5)." },
    { id: "competitive-positioning", title: "Competitive Positioning", titleAr: "الموقع التنافسي", content: "Why INFERA > Salesforce + SAP + ServiceNow combined: True sovereignty, native AI, unified governance." },
    { id: "governance-ai", title: "Governance & Policy Validator AI", titleAr: "الحوكمة ومدقق السياسات AI", content: "Every platform governed by AI that ensures compliance, security, and optimization automatically." },
    { id: "strategic-impact", title: "Strategic Impact at Scale", titleAr: "الأثر الاستراتيجي على النطاق", content: "80% faster deployment, 60% cost reduction, 100% data sovereignty, unlimited scalability." },
    { id: "expansion-vision", title: "Expansion & Future Vision", titleAr: "التوسع والرؤية المستقبلية", content: "MENA launch → Africa → Asia → Global. 50+ platforms by 2026." },
    { id: "call-to-action", title: "Call to Partnership", titleAr: "دعوة للشراكة", content: "Join us in building the future of sovereign digital platforms. Contact: mohamed.ali.b2001@gmail.com" },
  ],
};

// Investor Narrative structure
export const investorNarrative = {
  title: "Investor Narrative",
  titleAr: "السرد الاستثماري",
  sections: [
    { id: "story", title: "The Story", titleAr: "القصة", content: "In a world of fragmented digital tools, INFERA offers a sovereign alternative..." },
    { id: "market-broken", title: "Why This Market is Broken", titleAr: "لماذا هذا السوق مكسور", content: "Enterprises spend billions on disconnected tools with no unified control..." },
    { id: "players-cannot-evolve", title: "Why Players Cannot Evolve", titleAr: "لماذا اللاعبون لا يستطيعون التطور", content: "Salesforce, SAP, ServiceNow are built on legacy architectures that cannot achieve true sovereignty..." },
    { id: "structurally-superior", title: "Why INFERA is Superior", titleAr: "لماذا INFERA متفوقة", content: "Platform factory model, native AI, sovereign by design, not by bolt-on..." },
    { id: "value-compounds", title: "How Value Compounds", titleAr: "كيف تتضاعف القيمة", content: "Each platform makes others more valuable. Network effects across the ecosystem..." },
    { id: "defensible", title: "Why INFERA is Defensible", titleAr: "لماذا INFERA قابلة للدفاع", content: "Sovereign architecture, data network effects, 21+ platform integration moat..." },
    { id: "future-proof", title: "Why INFERA is Future-Proof", titleAr: "لماذا INFERA مستقبلية", content: "AI-first from day one, modular architecture, continuous autonomous evolution..." },
  ],
};
