// Central data store for all INFERA pitch decks
export interface PitchSlide {
  id: string;
  title: string;
  titleAr: string;
  content: {
    heading: string;
    headingAr: string;
    points: { text: string; textAr: string }[];
  };
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
  };
  demoStoryboard: {
    scenes: {
      title: string;
      titleAr: string;
      description: string;
      descriptionAr: string;
      duration: string;
    }[];
  };
}

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
      { id: "vision", title: "Vision", titleAr: "الرؤية", content: { heading: "Build sovereign digital platforms autonomously", headingAr: "بناء منصات رقمية سيادية بشكل مستقل", points: [] } },
    ],
    executiveSummary: {
      overview: "INFERA WebNova is the foundational Core OS that powers the entire INFERA ecosystem, enabling autonomous generation and management of sovereign digital platforms.",
      overviewAr: "INFERA WebNova هو نظام التشغيل الأساسي الذي يشغل منظومة INFERA بأكملها، مما يتيح الإنشاء والإدارة المستقلة للمنصات الرقمية السيادية.",
      keyFeatures: ["Blueprint-First Architecture", "AI Orchestration", "Multi-Tenant Isolation", "Policy Validator AI"],
      keyFeaturesAr: ["معمارية Blueprint-First", "تنسيق الذكاء الاصطناعي", "عزل متعدد المستأجرين", "مدقق السياسات AI"],
      targetMarket: "Enterprise organizations, Government agencies, Financial institutions",
      targetMarketAr: "المؤسسات الكبرى، الجهات الحكومية، المؤسسات المالية",
      competitiveAdvantage: "First sovereign platform factory with AI-driven autonomous governance",
      competitiveAdvantageAr: "أول مصنع منصات سيادي مع حوكمة مستقلة مدفوعة بالذكاء الاصطناعي",
    },
    demoStoryboard: {
      scenes: [
        { title: "Platform Creation", titleAr: "إنشاء المنصة", description: "Show AI creating a new platform from blueprint", descriptionAr: "عرض الذكاء الاصطناعي ينشئ منصة جديدة من المخطط", duration: "2 min" },
        { title: "Governance Dashboard", titleAr: "لوحة الحوكمة", description: "Navigate the sovereign control center", descriptionAr: "التنقل في مركز التحكم السيادي", duration: "3 min" },
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
    slides: [],
    executiveSummary: {
      overview: "Central command platform for sovereign operational control across all INFERA platforms.",
      overviewAr: "منصة قيادة مركزية للتحكم التشغيلي السيادي عبر جميع منصات INFERA.",
      keyFeatures: ["Real-time Monitoring", "Cross-platform Orchestration", "Autonomous Response", "Predictive Operations"],
      keyFeaturesAr: ["المراقبة في الوقت الفعلي", "التنسيق عبر المنصات", "الاستجابة المستقلة", "العمليات التنبؤية"],
      targetMarket: "Enterprise COOs, Operations Directors, Platform Managers",
      targetMarketAr: "مديرو العمليات التنفيذيون، مديرو العمليات، مديرو المنصات",
      competitiveAdvantage: "Unified sovereign control across unlimited digital platforms",
      competitiveAdvantageAr: "تحكم سيادي موحد عبر منصات رقمية غير محدودة",
    },
    demoStoryboard: {
      scenes: [
        { title: "Control Dashboard", titleAr: "لوحة التحكم", description: "Overview of all platform operations", descriptionAr: "نظرة عامة على جميع عمليات المنصات", duration: "2 min" },
        { title: "Incident Response", titleAr: "الاستجابة للحوادث", description: "AI-driven automatic incident handling", descriptionAr: "معالجة الحوادث التلقائية المدفوعة بالذكاء الاصطناعي", duration: "3 min" },
      ],
    },
  },
  {
    id: "engine",
    name: "INFERA Engine",
    nameAr: "إنفيرا المحرك",
    tagline: "AI-Powered Digital Platform Engine",
    taglineAr: "محرك المنصات الرقمية المدعوم بالذكاء الاصطناعي",
    color: "blue",
    gradient: "from-blue-600 to-indigo-700",
    route: "/pitch-deck/engine",
    slides: [],
    executiveSummary: {
      overview: "Core engine powering AI-driven platform generation and management.",
      overviewAr: "المحرك الأساسي الذي يشغل إنشاء وإدارة المنصات المدفوعة بالذكاء الاصطناعي.",
      keyFeatures: ["AI Code Generation", "Blueprint Processing", "Runtime Management", "Auto-scaling"],
      keyFeaturesAr: ["توليد الكود بالذكاء الاصطناعي", "معالجة المخططات", "إدارة وقت التشغيل", "التوسع التلقائي"],
      targetMarket: "Platform Developers, CTOs, Technical Architects",
      targetMarketAr: "مطورو المنصات، المدراء التقنيون، المعماريون التقنيون",
      competitiveAdvantage: "Autonomous platform engine with sovereign AI orchestration",
      competitiveAdvantageAr: "محرك منصات مستقل مع تنسيق ذكاء اصطناعي سيادي",
    },
    demoStoryboard: {
      scenes: [
        { title: "Code Generation", titleAr: "توليد الكود", description: "AI generating platform code from requirements", descriptionAr: "الذكاء الاصطناعي يولد كود المنصة من المتطلبات", duration: "3 min" },
        { title: "Deployment", titleAr: "النشر", description: "One-click sovereign deployment", descriptionAr: "نشر سيادي بنقرة واحدة", duration: "2 min" },
      ],
    },
  },
  {
    id: "finance",
    name: "INFERA Finance AI",
    nameAr: "إنفيرا المالية AI",
    tagline: "Sovereign Financial Intelligence Platform",
    taglineAr: "منصة الذكاء المالي السيادي",
    color: "emerald",
    gradient: "from-emerald-600 to-green-700",
    route: "/pitch-deck/finance",
    slides: [],
    executiveSummary: {
      overview: "AI-powered financial management with predictive analytics and sovereign control.",
      overviewAr: "إدارة مالية مدعومة بالذكاء الاصطناعي مع تحليلات تنبؤية وتحكم سيادي.",
      keyFeatures: ["Predictive Analytics", "Automated Reporting", "Risk Intelligence", "Compliance Automation"],
      keyFeaturesAr: ["التحليلات التنبؤية", "التقارير الآلية", "ذكاء المخاطر", "أتمتة الامتثال"],
      targetMarket: "CFOs, Financial Directors, Treasury Managers",
      targetMarketAr: "المدراء الماليون، مديرو الشؤون المالية، مديرو الخزينة",
      competitiveAdvantage: "AI-first financial intelligence with sovereign data governance",
      competitiveAdvantageAr: "ذكاء مالي AI-أولاً مع حوكمة بيانات سيادية",
    },
    demoStoryboard: {
      scenes: [
        { title: "Financial Dashboard", titleAr: "لوحة المالية", description: "Real-time financial intelligence overview", descriptionAr: "نظرة عامة على الذكاء المالي في الوقت الفعلي", duration: "2 min" },
        { title: "Predictive Analysis", titleAr: "التحليل التنبؤي", description: "AI forecasting and recommendations", descriptionAr: "التنبؤ والتوصيات بالذكاء الاصطناعي", duration: "3 min" },
      ],
    },
  },
  {
    id: "humaniq",
    name: "INFERA HumanIQ",
    nameAr: "إنفيرا الموارد البشرية IQ",
    tagline: "Sovereign HR Intelligence Platform",
    taglineAr: "منصة ذكاء الموارد البشرية السيادية",
    color: "rose",
    gradient: "from-rose-600 to-pink-700",
    route: "/pitch-deck/humaniq",
    slides: [],
    executiveSummary: {
      overview: "AI-driven HR platform for intelligent talent management and workforce optimization.",
      overviewAr: "منصة موارد بشرية مدفوعة بالذكاء الاصطناعي لإدارة المواهب الذكية وتحسين القوى العاملة.",
      keyFeatures: ["Talent Intelligence", "Performance AI", "Workforce Analytics", "Engagement Prediction"],
      keyFeaturesAr: ["ذكاء المواهب", "أداء AI", "تحليلات القوى العاملة", "توقع المشاركة"],
      targetMarket: "CHROs, HR Directors, Talent Managers",
      targetMarketAr: "مدراء الموارد البشرية التنفيذيون، مديرو الموارد البشرية، مديرو المواهب",
      competitiveAdvantage: "Predictive HR intelligence with autonomous talent optimization",
      competitiveAdvantageAr: "ذكاء موارد بشرية تنبؤي مع تحسين مواهب مستقل",
    },
    demoStoryboard: {
      scenes: [
        { title: "Talent Dashboard", titleAr: "لوحة المواهب", description: "AI-powered talent insights", descriptionAr: "رؤى المواهب المدعومة بالذكاء الاصطناعي", duration: "2 min" },
        { title: "Performance Analysis", titleAr: "تحليل الأداء", description: "Predictive performance management", descriptionAr: "إدارة أداء تنبؤية", duration: "3 min" },
      ],
    },
  },
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
    executiveSummary: {
      overview: "AI-powered legal operations with contract intelligence and compliance automation.",
      overviewAr: "عمليات قانونية مدعومة بالذكاء الاصطناعي مع ذكاء العقود وأتمتة الامتثال.",
      keyFeatures: ["Contract AI", "Compliance Automation", "Legal Analytics", "Risk Assessment"],
      keyFeaturesAr: ["عقود AI", "أتمتة الامتثال", "تحليلات قانونية", "تقييم المخاطر"],
      targetMarket: "General Counsels, Legal Directors, Compliance Officers",
      targetMarketAr: "المستشارون القانونيون، مديرو الشؤون القانونية، مسؤولو الامتثال",
      competitiveAdvantage: "AI-first legal intelligence with sovereign contract governance",
      competitiveAdvantageAr: "ذكاء قانوني AI-أولاً مع حوكمة عقود سيادية",
    },
    demoStoryboard: {
      scenes: [
        { title: "Contract Analysis", titleAr: "تحليل العقود", description: "AI analyzing contract risks", descriptionAr: "الذكاء الاصطناعي يحلل مخاطر العقود", duration: "3 min" },
        { title: "Compliance Check", titleAr: "فحص الامتثال", description: "Automated compliance verification", descriptionAr: "التحقق من الامتثال الآلي", duration: "2 min" },
      ],
    },
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
    executiveSummary: {
      overview: "No-code/low-code platform for building sovereign applications with AI assistance.",
      overviewAr: "منصة بدون كود/قليلة الكود لبناء تطبيقات سيادية مع مساعدة الذكاء الاصطناعي.",
      keyFeatures: ["Visual Builder", "AI Code Generation", "Component Library", "One-Click Deploy"],
      keyFeaturesAr: ["منشئ مرئي", "توليد كود AI", "مكتبة المكونات", "نشر بنقرة واحدة"],
      targetMarket: "Business Analysts, Citizen Developers, IT Teams",
      targetMarketAr: "محللو الأعمال، المطورون المواطنون، فرق تكنولوجيا المعلومات",
      competitiveAdvantage: "AI-powered app creation with sovereign deployment",
      competitiveAdvantageAr: "إنشاء تطبيقات مدعوم بالذكاء الاصطناعي مع نشر سيادي",
    },
    demoStoryboard: {
      scenes: [
        { title: "Visual Design", titleAr: "التصميم المرئي", description: "Drag-and-drop app building", descriptionAr: "بناء تطبيقات بالسحب والإفلات", duration: "3 min" },
        { title: "AI Generation", titleAr: "توليد AI", description: "AI generating app components", descriptionAr: "الذكاء الاصطناعي يولد مكونات التطبيق", duration: "2 min" },
      ],
    },
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
    executiveSummary: {
      overview: "AI-driven marketing automation with predictive campaign intelligence.",
      overviewAr: "أتمتة تسويقية مدفوعة بالذكاء الاصطناعي مع ذكاء حملات تنبؤي.",
      keyFeatures: ["Campaign AI", "Audience Intelligence", "Content Optimization", "ROI Prediction"],
      keyFeaturesAr: ["حملات AI", "ذكاء الجمهور", "تحسين المحتوى", "توقع العائد"],
      targetMarket: "CMOs, Marketing Directors, Growth Managers",
      targetMarketAr: "مدراء التسويق التنفيذيون، مديرو التسويق، مديرو النمو",
      competitiveAdvantage: "Predictive marketing with AI-driven optimization",
      competitiveAdvantageAr: "تسويق تنبؤي مع تحسين مدفوع بالذكاء الاصطناعي",
    },
    demoStoryboard: {
      scenes: [
        { title: "Campaign Dashboard", titleAr: "لوحة الحملات", description: "AI-powered campaign insights", descriptionAr: "رؤى الحملات المدعومة بالذكاء الاصطناعي", duration: "2 min" },
        { title: "Audience Analysis", titleAr: "تحليل الجمهور", description: "Predictive audience segmentation", descriptionAr: "تقسيم الجمهور التنبؤي", duration: "3 min" },
      ],
    },
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
    executiveSummary: {
      overview: "AI-powered marketplace platform for sovereign digital commerce.",
      overviewAr: "منصة سوق مدعومة بالذكاء الاصطناعي للتجارة الرقمية السيادية.",
      keyFeatures: ["Multi-vendor Management", "AI Recommendations", "Transaction Intelligence", "Fraud Prevention"],
      keyFeaturesAr: ["إدارة متعددة البائعين", "توصيات AI", "ذكاء المعاملات", "منع الاحتيال"],
      targetMarket: "E-commerce Directors, Marketplace Operators, Digital Commerce Teams",
      targetMarketAr: "مديرو التجارة الإلكترونية، مشغلو الأسواق، فرق التجارة الرقمية",
      competitiveAdvantage: "AI-first marketplace with sovereign transaction governance",
      competitiveAdvantageAr: "سوق AI-أولاً مع حوكمة معاملات سيادية",
    },
    demoStoryboard: {
      scenes: [
        { title: "Vendor Dashboard", titleAr: "لوحة البائعين", description: "AI-powered vendor management", descriptionAr: "إدارة البائعين المدعومة بالذكاء الاصطناعي", duration: "2 min" },
        { title: "Transaction Flow", titleAr: "تدفق المعاملات", description: "Secure sovereign transactions", descriptionAr: "معاملات سيادية آمنة", duration: "3 min" },
      ],
    },
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
    executiveSummary: {
      overview: "AI-powered learning platform with personalized education and sovereign data control.",
      overviewAr: "منصة تعلم مدعومة بالذكاء الاصطناعي مع تعليم مخصص وتحكم سيادي في البيانات.",
      keyFeatures: ["Adaptive Learning", "AI Tutoring", "Progress Analytics", "Content Generation"],
      keyFeaturesAr: ["التعلم التكيفي", "التدريس AI", "تحليلات التقدم", "توليد المحتوى"],
      targetMarket: "Educational Institutions, Corporate Training, EdTech Companies",
      targetMarketAr: "المؤسسات التعليمية، التدريب المؤسسي، شركات تكنولوجيا التعليم",
      competitiveAdvantage: "AI-first education with sovereign learning governance",
      competitiveAdvantageAr: "تعليم AI-أولاً مع حوكمة تعلم سيادية",
    },
    demoStoryboard: {
      scenes: [
        { title: "Learning Dashboard", titleAr: "لوحة التعلم", description: "Personalized learning paths", descriptionAr: "مسارات تعلم مخصصة", duration: "2 min" },
        { title: "AI Tutoring", titleAr: "التدريس AI", description: "Interactive AI-powered tutoring", descriptionAr: "تدريس تفاعلي مدعوم بالذكاء الاصطناعي", duration: "3 min" },
      ],
    },
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
    executiveSummary: {
      overview: "AI-powered attendance and workforce management with biometric intelligence.",
      overviewAr: "إدارة الحضور والقوى العاملة المدعومة بالذكاء الاصطناعي مع ذكاء بيومتري.",
      keyFeatures: ["Biometric AI", "Shift Intelligence", "Absence Prediction", "Workforce Analytics"],
      keyFeaturesAr: ["بيومتري AI", "ذكاء الورديات", "توقع الغياب", "تحليلات القوى العاملة"],
      targetMarket: "HR Managers, Operations Directors, Workforce Planners",
      targetMarketAr: "مديرو الموارد البشرية، مديرو العمليات، مخططو القوى العاملة",
      competitiveAdvantage: "Predictive workforce management with sovereign biometric control",
      competitiveAdvantageAr: "إدارة قوى عاملة تنبؤية مع تحكم بيومتري سيادي",
    },
    demoStoryboard: {
      scenes: [
        { title: "Attendance Dashboard", titleAr: "لوحة الحضور", description: "Real-time attendance tracking", descriptionAr: "تتبع الحضور في الوقت الفعلي", duration: "2 min" },
        { title: "Workforce Planning", titleAr: "تخطيط القوى العاملة", description: "AI-powered shift optimization", descriptionAr: "تحسين الورديات المدعوم بالذكاء الاصطناعي", duration: "3 min" },
      ],
    },
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
    executiveSummary: {
      overview: "AI-powered document management with intelligent extraction and sovereign storage.",
      overviewAr: "إدارة مستندات مدعومة بالذكاء الاصطناعي مع استخراج ذكي وتخزين سيادي.",
      keyFeatures: ["Document AI", "Intelligent Search", "Auto-classification", "Version Control"],
      keyFeaturesAr: ["مستندات AI", "بحث ذكي", "تصنيف تلقائي", "التحكم بالإصدارات"],
      targetMarket: "Document Managers, Compliance Teams, Legal Departments",
      targetMarketAr: "مديرو المستندات، فرق الامتثال، الأقسام القانونية",
      competitiveAdvantage: "AI-first document intelligence with sovereign data governance",
      competitiveAdvantageAr: "ذكاء مستندات AI-أولاً مع حوكمة بيانات سيادية",
    },
    demoStoryboard: {
      scenes: [
        { title: "Document Upload", titleAr: "رفع المستندات", description: "AI auto-classification on upload", descriptionAr: "التصنيف التلقائي AI عند الرفع", duration: "2 min" },
        { title: "Intelligent Search", titleAr: "البحث الذكي", description: "Semantic document search", descriptionAr: "بحث مستندات دلالي", duration: "2 min" },
      ],
    },
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
    executiveSummary: {
      overview: "AI-powered hospitality management with guest intelligence and operational optimization.",
      overviewAr: "إدارة ضيافة مدعومة بالذكاء الاصطناعي مع ذكاء الضيوف وتحسين العمليات.",
      keyFeatures: ["Guest AI", "Revenue Optimization", "Service Intelligence", "Experience Personalization"],
      keyFeaturesAr: ["ضيوف AI", "تحسين الإيرادات", "ذكاء الخدمة", "تخصيص التجربة"],
      targetMarket: "Hotel Chains, Resort Operators, Hospitality Groups",
      targetMarketAr: "سلاسل الفنادق، مشغلو المنتجعات، مجموعات الضيافة",
      competitiveAdvantage: "AI-first hospitality with sovereign guest data governance",
      competitiveAdvantageAr: "ضيافة AI-أولاً مع حوكمة بيانات ضيوف سيادية",
    },
    demoStoryboard: {
      scenes: [
        { title: "Guest Dashboard", titleAr: "لوحة الضيوف", description: "360° guest intelligence", descriptionAr: "ذكاء ضيوف 360 درجة", duration: "2 min" },
        { title: "Revenue Management", titleAr: "إدارة الإيرادات", description: "AI-powered pricing optimization", descriptionAr: "تحسين التسعير المدعوم بالذكاء الاصطناعي", duration: "3 min" },
      ],
    },
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
    executiveSummary: {
      overview: "AI-powered knowledge management with institutional memory and semantic search.",
      overviewAr: "إدارة معرفة مدعومة بالذكاء الاصطناعي مع ذاكرة مؤسسية وبحث دلالي.",
      keyFeatures: ["Knowledge AI", "Semantic Search", "Memory Networks", "Insight Generation"],
      keyFeaturesAr: ["معرفة AI", "بحث دلالي", "شبكات الذاكرة", "توليد الرؤى"],
      targetMarket: "Knowledge Managers, Research Teams, Innovation Departments",
      targetMarketAr: "مديرو المعرفة، فرق البحث، أقسام الابتكار",
      competitiveAdvantage: "AI-first institutional memory with sovereign knowledge governance",
      competitiveAdvantageAr: "ذاكرة مؤسسية AI-أولاً مع حوكمة معرفة سيادية",
    },
    demoStoryboard: {
      scenes: [
        { title: "Knowledge Graph", titleAr: "رسم المعرفة", description: "Visualize institutional knowledge", descriptionAr: "تصور المعرفة المؤسسية", duration: "2 min" },
        { title: "Insight Discovery", titleAr: "اكتشاف الرؤى", description: "AI-powered knowledge discovery", descriptionAr: "اكتشاف المعرفة المدعوم بالذكاء الاصطناعي", duration: "3 min" },
      ],
    },
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
    executiveSummary: {
      overview: "AI-powered feasibility analysis with predictive project intelligence.",
      overviewAr: "تحليل جدوى مدعوم بالذكاء الاصطناعي مع ذكاء مشاريع تنبؤي.",
      keyFeatures: ["Feasibility AI", "Risk Prediction", "ROI Modeling", "Scenario Analysis"],
      keyFeaturesAr: ["جدوى AI", "توقع المخاطر", "نمذجة العائد", "تحليل السيناريوهات"],
      targetMarket: "Project Managers, Investment Analysts, Strategy Teams",
      targetMarketAr: "مديرو المشاريع، محللو الاستثمار، فرق الاستراتيجية",
      competitiveAdvantage: "AI-first feasibility with sovereign project governance",
      competitiveAdvantageAr: "جدوى AI-أولاً مع حوكمة مشاريع سيادية",
    },
    demoStoryboard: {
      scenes: [
        { title: "Project Analysis", titleAr: "تحليل المشروع", description: "AI feasibility assessment", descriptionAr: "تقييم جدوى AI", duration: "3 min" },
        { title: "Risk Modeling", titleAr: "نمذجة المخاطر", description: "Predictive risk scenarios", descriptionAr: "سيناريوهات مخاطر تنبؤية", duration: "2 min" },
      ],
    },
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
    executiveSummary: {
      overview: "AI-powered CV creation with career intelligence and job matching.",
      overviewAr: "إنشاء سيرة ذاتية مدعوم بالذكاء الاصطناعي مع ذكاء مهني ومطابقة وظائف.",
      keyFeatures: ["CV AI", "Skills Analysis", "Job Matching", "Career Insights"],
      keyFeaturesAr: ["سيرة ذاتية AI", "تحليل المهارات", "مطابقة الوظائف", "رؤى مهنية"],
      targetMarket: "Job Seekers, Career Coaches, HR Departments",
      targetMarketAr: "الباحثون عن عمل، مدربو المسيرة المهنية، أقسام الموارد البشرية",
      competitiveAdvantage: "AI-first career platform with sovereign data control",
      competitiveAdvantageAr: "منصة مهنية AI-أولاً مع تحكم سيادي في البيانات",
    },
    demoStoryboard: {
      scenes: [
        { title: "CV Creation", titleAr: "إنشاء السيرة", description: "AI-powered CV generation", descriptionAr: "توليد سيرة ذاتية بالذكاء الاصطناعي", duration: "2 min" },
        { title: "Job Matching", titleAr: "مطابقة الوظائف", description: "Intelligent job recommendations", descriptionAr: "توصيات وظائف ذكية", duration: "2 min" },
      ],
    },
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
    executiveSummary: {
      overview: "AI-powered job marketplace with intelligent matching and talent analytics.",
      overviewAr: "سوق وظائف مدعوم بالذكاء الاصطناعي مع مطابقة ذكية وتحليلات المواهب.",
      keyFeatures: ["Talent AI", "Smart Matching", "Hiring Analytics", "Candidate Intelligence"],
      keyFeaturesAr: ["مواهب AI", "مطابقة ذكية", "تحليلات التوظيف", "ذكاء المرشحين"],
      targetMarket: "Recruiters, HR Teams, Staffing Agencies",
      targetMarketAr: "المجندون، فرق الموارد البشرية، وكالات التوظيف",
      competitiveAdvantage: "AI-first talent marketplace with sovereign hiring governance",
      competitiveAdvantageAr: "سوق مواهب AI-أولاً مع حوكمة توظيف سيادية",
    },
    demoStoryboard: {
      scenes: [
        { title: "Job Posting", titleAr: "نشر الوظيفة", description: "AI-optimized job creation", descriptionAr: "إنشاء وظائف محسن بالذكاء الاصطناعي", duration: "2 min" },
        { title: "Candidate Matching", titleAr: "مطابقة المرشحين", description: "Intelligent candidate ranking", descriptionAr: "ترتيب المرشحين الذكي", duration: "3 min" },
      ],
    },
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
    executiveSummary: {
      overview: "AI-powered corporate training with adaptive learning and skill tracking.",
      overviewAr: "تدريب مؤسسي مدعوم بالذكاء الاصطناعي مع تعلم تكيفي وتتبع المهارات.",
      keyFeatures: ["Adaptive Learning", "Skill Tracking", "Content AI", "Performance Analytics"],
      keyFeaturesAr: ["تعلم تكيفي", "تتبع المهارات", "محتوى AI", "تحليلات الأداء"],
      targetMarket: "L&D Teams, Corporate Training, Educational Institutions",
      targetMarketAr: "فرق التعلم والتطوير، التدريب المؤسسي، المؤسسات التعليمية",
      competitiveAdvantage: "AI-first training with sovereign learning data governance",
      competitiveAdvantageAr: "تدريب AI-أولاً مع حوكمة بيانات تعلم سيادية",
    },
    demoStoryboard: {
      scenes: [
        { title: "Course Creation", titleAr: "إنشاء الدورات", description: "AI-powered course design", descriptionAr: "تصميم دورات مدعوم بالذكاء الاصطناعي", duration: "2 min" },
        { title: "Skill Assessment", titleAr: "تقييم المهارات", description: "Adaptive skill evaluation", descriptionAr: "تقييم مهارات تكيفي", duration: "3 min" },
      ],
    },
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
    executiveSummary: {
      overview: "Complete sovereign financial governance with AI-driven treasury and compliance.",
      overviewAr: "حوكمة مالية سيادية كاملة مع خزينة وامتثال مدفوعين بالذكاء الاصطناعي.",
      keyFeatures: ["Treasury AI", "Compliance Automation", "Risk Intelligence", "Sovereign Reporting"],
      keyFeaturesAr: ["خزينة AI", "أتمتة الامتثال", "ذكاء المخاطر", "تقارير سيادية"],
      targetMarket: "CFOs, Treasury Directors, Financial Controllers",
      targetMarketAr: "المدراء الماليون، مديرو الخزينة، المراقبون الماليون",
      competitiveAdvantage: "Complete sovereign financial control with AI governance",
      competitiveAdvantageAr: "تحكم مالي سيادي كامل مع حوكمة AI",
    },
    demoStoryboard: {
      scenes: [
        { title: "Treasury Dashboard", titleAr: "لوحة الخزينة", description: "Real-time treasury intelligence", descriptionAr: "ذكاء خزينة في الوقت الفعلي", duration: "2 min" },
        { title: "Compliance Center", titleAr: "مركز الامتثال", description: "Automated compliance monitoring", descriptionAr: "مراقبة الامتثال الآلية", duration: "3 min" },
      ],
    },
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
    executiveSummary: {
      overview: "Global multi-entity, multi-currency financial orchestration with AI intelligence.",
      overviewAr: "تنسيق مالي عالمي متعدد الكيانات والعملات مع ذكاء AI.",
      keyFeatures: ["Multi-entity Control", "Currency Intelligence", "Cross-border Compliance", "Global Consolidation"],
      keyFeaturesAr: ["تحكم متعدد الكيانات", "ذكاء العملات", "امتثال عبر الحدود", "توحيد عالمي"],
      targetMarket: "Multinational CFOs, Global Controllers, International Finance Teams",
      targetMarketAr: "المدراء الماليون متعددو الجنسيات، المراقبون العالميون، فرق التمويل الدولي",
      competitiveAdvantage: "Global financial intelligence sovereignty",
      competitiveAdvantageAr: "سيادة الذكاء المالي العالمي",
    },
    demoStoryboard: {
      scenes: [
        { title: "Global Overview", titleAr: "النظرة العالمية", description: "Multi-entity financial view", descriptionAr: "نظرة مالية متعددة الكيانات", duration: "2 min" },
        { title: "Currency Management", titleAr: "إدارة العملات", description: "AI-powered currency optimization", descriptionAr: "تحسين العملات المدعوم بالذكاء الاصطناعي", duration: "3 min" },
      ],
    },
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
    executiveSummary: {
      overview: "AI-driven cyber defense with threat prediction and automated incident response.",
      overviewAr: "دفاع سيبراني مدفوع بالذكاء الاصطناعي مع تنبؤ بالتهديدات واستجابة آلية للحوادث.",
      keyFeatures: ["Threat AI", "Zero-Trust Architecture", "Automated Response", "Behavioral Analysis"],
      keyFeaturesAr: ["تهديدات AI", "معمارية Zero-Trust", "استجابة آلية", "تحليل سلوكي"],
      targetMarket: "CISOs, Security Directors, IT Security Teams",
      targetMarketAr: "مدراء أمن المعلومات التنفيذيون، مديرو الأمن، فرق أمن تكنولوجيا المعلومات",
      competitiveAdvantage: "Sovereign cyber immunity with AI-driven defense",
      competitiveAdvantageAr: "مناعة سيبرانية سيادية مع دفاع مدفوع بالذكاء الاصطناعي",
    },
    demoStoryboard: {
      scenes: [
        { title: "Threat Dashboard", titleAr: "لوحة التهديدات", description: "Real-time threat intelligence", descriptionAr: "ذكاء تهديدات في الوقت الفعلي", duration: "2 min" },
        { title: "Incident Response", titleAr: "الاستجابة للحوادث", description: "Automated threat containment", descriptionAr: "احتواء التهديدات الآلي", duration: "3 min" },
      ],
    },
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
    executiveSummary: {
      overview: "AI-powered remote device control with behavioral monitoring and policy governance.",
      overviewAr: "تحكم عن بعد في الأجهزة مدعوم بالذكاء الاصطناعي مع مراقبة سلوكية وحوكمة سياسات.",
      keyFeatures: ["Session AI", "Behavioral Monitoring", "Policy Enforcement", "Full Audit Trails"],
      keyFeaturesAr: ["جلسات AI", "مراقبة سلوكية", "تطبيق السياسات", "مسارات تدقيق كاملة"],
      targetMarket: "IT Directors, Remote Workforce Managers, Security Teams",
      targetMarketAr: "مديرو تكنولوجيا المعلومات، مديرو القوى العاملة عن بعد، فرق الأمن",
      competitiveAdvantage: "Sovereign remote control intelligence",
      competitiveAdvantageAr: "ذكاء تحكم عن بعد سيادي",
    },
    demoStoryboard: {
      scenes: [
        { title: "Remote Session", titleAr: "الجلسة عن بعد", description: "Secure remote connection", descriptionAr: "اتصال آمن عن بعد", duration: "2 min" },
        { title: "Session Monitoring", titleAr: "مراقبة الجلسة", description: "AI behavioral analysis", descriptionAr: "تحليل سلوكي AI", duration: "3 min" },
      ],
    },
  },
];

export function getPlatformById(id: string): PitchDeckData | undefined {
  return inferaPlatforms.find(p => p.id === id);
}

export function getAllPlatforms(): PitchDeckData[] {
  return inferaPlatforms;
}
