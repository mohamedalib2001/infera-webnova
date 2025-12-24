// INFERA Board-Level Documentation
// وثائق مستوى مجلس الإدارة

export interface BoardDocument {
  id: string;
  title: string;
  titleAr: string;
  subtitle: string;
  subtitleAr: string;
  confidentiality: string;
  confidentialityAr: string;
  sections: {
    heading: string;
    headingAr: string;
    content: string[];
    contentAr: string[];
  }[];
  keyDecisions?: {
    decision: string;
    decisionAr: string;
  }[];
}

export const boardDocuments: BoardDocument[] = [
  {
    id: "strategic-overview",
    title: "Board Strategic Overview",
    titleAr: "النظرة الاستراتيجية لمجلس الإدارة",
    subtitle: "Understanding INFERA at the System Level",
    subtitleAr: "فهم INFERA على مستوى النظام",
    confidentiality: "BOARD CONFIDENTIAL",
    confidentialityAr: "سري - مجلس الإدارة",
    sections: [
      {
        heading: "What INFERA Is",
        headingAr: "ما هي INFERA",
        content: [
          "INFERA is not a software product. It is an operating system for sovereign digital platforms.",
          "Where competitors sell applications, INFERA provides the infrastructure that generates, governs, and evolves applications autonomously.",
          "This is a platform factory—a system that creates platforms, not a platform itself."
        ],
        contentAr: [
          "INFERA ليست منتج برمجيات. إنها نظام تشغيل للمنصات الرقمية السيادية.",
          "بينما يبيع المنافسون تطبيقات، INFERA توفر البنية التحتية التي تولد وتحكم وتطور التطبيقات بشكل مستقل.",
          "هذا مصنع منصات—نظام ينشئ منصات، وليس منصة بحد ذاتها."
        ]
      },
      {
        heading: "Why the Market Is Structurally Broken",
        headingAr: "لماذا السوق مكسور هيكلياً",
        content: [
          "Organizations currently assemble digital infrastructure from dozens of incompatible vendors, each with separate governance, security models, and data silos.",
          "AI is bolted onto legacy architectures rather than built into the foundation.",
          "Sovereignty is marketed but not delivered—control remains with vendors, not customers.",
          "This fragmentation creates cost, risk, and strategic dependency that compounds over time."
        ],
        contentAr: [
          "المنظمات حالياً تجمع البنية التحتية الرقمية من عشرات الموردين غير المتوافقين، كل منهم بحوكمة منفصلة ونماذج أمان وصوامع بيانات.",
          "AI يُضاف على المعماريات القديمة بدلاً من بنائه في الأساس.",
          "السيادة تُسوّق ولكن لا تُسلّم—التحكم يبقى مع الموردين، وليس العملاء.",
          "هذا التجزؤ ينشئ تكلفة ومخاطر واعتماد استراتيجي يتراكم مع الوقت."
        ]
      },
      {
        heading: "Why INFERA's Model Is Inevitable",
        headingAr: "لماذا نموذج INFERA حتمي",
        content: [
          "The convergence of AI governance requirements, data sovereignty mandates, and digital transformation pressure creates demand that current solutions cannot address.",
          "Organizations will be forced to consolidate—the question is whether they consolidate on a sovereign platform or become permanently dependent on foreign infrastructure.",
          "INFERA is positioned at the intersection of these forces, offering the only architecture designed for this reality."
        ],
        contentAr: [
          "تقارب متطلبات حوكمة AI وتفويضات سيادة البيانات وضغط التحول الرقمي ينشئ طلباً لا تستطيع الحلول الحالية معالجته.",
          "المنظمات ستُجبر على التوحيد—السؤال هو ما إذا كانت ستتوحد على منصة سيادية أو تصبح معتمدة بشكل دائم على بنية تحتية أجنبية.",
          "INFERA موقعة عند تقاطع هذه القوى، تقدم المعمارية الوحيدة المصممة لهذا الواقع."
        ]
      },
      {
        heading: "Decisions the Board Must Protect",
        headingAr: "القرارات التي يجب أن يحميها المجلس",
        content: [
          "Sovereignty-first architecture must never be compromised for short-term revenue.",
          "AI governance standards must exceed regulatory requirements, not merely meet them.",
          "Platform factory capability must be preserved—INFERA must never become a single product company.",
          "Time advantage must be maintained through continuous investment in architecture, not features."
        ],
        contentAr: [
          "معمارية السيادة-أولاً يجب ألا تُساوم أبداً من أجل إيرادات قصيرة المدى.",
          "معايير حوكمة AI يجب أن تتجاوز المتطلبات التنظيمية، وليس فقط تلبيتها.",
          "قدرة مصنع المنصات يجب أن تُحفظ—INFERA يجب ألا تصبح أبداً شركة منتج واحد.",
          "ميزة الوقت يجب أن تُحافظ عليها من خلال الاستثمار المستمر في المعمارية، وليس الميزات."
        ]
      }
    ]
  },
  {
    id: "time-dominance-board",
    title: "Time Dominance – Board Version",
    titleAr: "السيطرة على الزمن – نسخة المجلس",
    subtitle: "Strategic Control Roadmap",
    subtitleAr: "خارطة طريق التحكم الاستراتيجي",
    confidentiality: "BOARD CONFIDENTIAL",
    confidentialityAr: "سري - مجلس الإدارة",
    sections: [
      {
        heading: "2-Year Position (2025-2027)",
        headingAr: "موقع السنتين (2025-2027)",
        content: [
          "21+ sovereign platforms operational across Financial, Healthcare, Government, Education, and Enterprise sectors.",
          "First government sovereign deployments establishing reference architectures.",
          "AI governance intelligence accumulating from production operations.",
          "Competitor response limited to marketing claims without architectural substance."
        ],
        contentAr: [
          "21+ منصة سيادية تشغيلية عبر قطاعات المالية والرعاية الصحية والحكومة والتعليم والمؤسسات.",
          "أول نشر حكومي سيادي ينشئ معماريات مرجعية.",
          "ذكاء حوكمة AI يتراكم من عمليات الإنتاج.",
          "استجابة المنافسين محدودة بادعاءات تسويقية بدون جوهر معماري."
        ]
      },
      {
        heading: "5-Year Position (2027-2030)",
        headingAr: "موقع الخمس سنوات (2027-2030)",
        content: [
          "Multiple national digital infrastructure deployments across MENA and expansion regions.",
          "Regulatory frameworks beginning to reference INFERA governance standards.",
          "Partner ecosystem delivering INFERA through global system integrator channels.",
          "Competitors 5 years behind architecturally—acquisitions create integration debt, not capability."
        ],
        contentAr: [
          "نشر متعدد للبنية التحتية الرقمية الوطنية عبر منطقة الشرق الأوسط وشمال أفريقيا ومناطق التوسع.",
          "الأطر التنظيمية تبدأ بالرجوع لمعايير حوكمة INFERA.",
          "منظومة الشركاء تقدم INFERA عبر قنوات مكاملي الأنظمة العالميين.",
          "المنافسون متأخرون 5 سنوات معمارياً—الاستحواذات تنشئ ديون تكامل، وليس قدرة."
        ]
      },
      {
        heading: "10-Year Position (2030-2035)",
        headingAr: "موقع العشر سنوات (2030-2035)",
        content: [
          "Global sovereign infrastructure standard position achieved.",
          "AI governance intelligence defining industry norms across regulated sectors.",
          "Talent pool trained on INFERA architectures—alternatives require retraining.",
          "Competitor entry requires decade of development to reach current INFERA capability."
        ],
        contentAr: [
          "موقع معيار البنية التحتية السيادية العالمية مُحقق.",
          "ذكاء حوكمة AI يحدد معايير الصناعة عبر القطاعات المنظمة.",
          "تجمع المواهب مدرب على معماريات INFERA—البدائل تتطلب إعادة تدريب.",
          "دخول المنافسين يتطلب عقداً من التطوير للوصول لقدرة INFERA الحالية."
        ]
      },
      {
        heading: "Why Competitors Cannot Close the Gap",
        headingAr: "لماذا لا يستطيع المنافسون إغلاق الفجوة",
        content: [
          "Time cannot be purchased. Capital accelerates execution, not fundamental architectural development.",
          "Trust cannot be acquired. Government and enterprise confidence is earned through years of demonstrated capability.",
          "Learning cannot be transferred. AI intelligence from production governance exists only within INFERA systems.",
          "Ecosystem effects compound daily. Each customer, partner, and deployment strengthens the position irreversibly."
        ],
        contentAr: [
          "الوقت لا يمكن شراؤه. رأس المال يسرع التنفيذ، وليس التطوير المعماري الأساسي.",
          "الثقة لا يمكن الاستحواذ عليها. ثقة الحكومات والمؤسسات تُكتسب من خلال سنوات من القدرة المُظهرة.",
          "التعلم لا يمكن نقله. ذكاء AI من حوكمة الإنتاج موجود فقط ضمن أنظمة INFERA.",
          "تأثيرات المنظومة تتراكم يومياً. كل عميل وشريك ونشر يقوي الموقع بشكل لا رجعة فيه."
        ]
      }
    ],
    keyDecisions: [
      { decision: "Maintain investment in architecture over features", decisionAr: "الحفاظ على الاستثمار في المعمارية على الميزات" },
      { decision: "Prioritize sovereign government deployments", decisionAr: "إعطاء الأولوية للنشر الحكومي السيادي" },
      { decision: "Resist pressure to fragment into single products", decisionAr: "مقاومة الضغط للتجزؤ إلى منتجات فردية" }
    ]
  },
  {
    id: "crisis-playbook-board",
    title: "Crisis Playbook – Board Version",
    titleAr: "دليل الأزمات – نسخة المجلس",
    subtitle: "Decision Principles Under Stress",
    subtitleAr: "مبادئ القرار تحت الضغط",
    confidentiality: "BOARD CONFIDENTIAL",
    confidentialityAr: "سري - مجلس الإدارة",
    sections: [
      {
        heading: "Anti-Fragility Principle",
        headingAr: "مبدأ مقاومة الهشاشة",
        content: [
          "INFERA is designed not merely to survive crisis, but to strengthen because of it.",
          "Every crisis that weakens competitors accelerates INFERA adoption.",
          "The board should view crisis as strategic opportunity, not existential threat."
        ],
        contentAr: [
          "INFERA مصممة ليس فقط للنجاة من الأزمة، ولكن للتقوي بسببها.",
          "كل أزمة تُضعف المنافسين تُسرع تبني INFERA.",
          "يجب أن ينظر المجلس للأزمة كفرصة استراتيجية، وليس تهديداً وجودياً."
        ]
      },
      {
        heading: "Economic Downturn Response",
        headingAr: "استجابة الانكماش الاقتصادي",
        content: [
          "Economic pressure drives consolidation. Organizations reduce vendor count, increasing demand for unified platforms.",
          "INFERA's value proposition strengthens during cost reduction—we replace 5-10 subscriptions with one sovereign platform.",
          "Competitors dependent on per-seat SaaS models face mass cancellations while INFERA's value-based model remains resilient."
        ],
        contentAr: [
          "الضغط الاقتصادي يدفع التوحيد. المنظمات تقلل عدد الموردين، مما يزيد الطلب على المنصات الموحدة.",
          "عرض قيمة INFERA يتقوى خلال تخفيض التكاليف—نستبدل 5-10 اشتراكات بمنصة سيادية واحدة.",
          "المنافسون المعتمدون على نماذج SaaS لكل مقعد يواجهون إلغاءات جماعية بينما نموذج INFERA القائم على القيمة يبقى مرناً."
        ]
      },
      {
        heading: "Regulatory Shift Response",
        headingAr: "استجابة التحول التنظيمي",
        content: [
          "Regulatory pressure validates INFERA's sovereign-first architecture.",
          "What was positioned as 'premium' becomes 'mandatory' under new compliance requirements.",
          "Competitors face years of re-architecture while INFERA is already compliant by design."
        ],
        contentAr: [
          "الضغط التنظيمي يُصادق على معمارية INFERA السيادة-أولاً.",
          "ما كان يُوضع كـ 'متميز' يصبح 'إلزامي' تحت متطلبات الامتثال الجديدة.",
          "المنافسون يواجهون سنوات من إعادة المعمارية بينما INFERA متوافقة بالتصميم بالفعل."
        ]
      },
      {
        heading: "Security Crisis Response",
        headingAr: "استجابة أزمة الأمان",
        content: [
          "Major security breaches at competitors drive immediate migration to proven secure platforms.",
          "INFERA's Zero-Trust architecture and AI threat detection become primary differentiators.",
          "Trust shifts to platforms with demonstrated security track records—trust that competitors cannot rebuild quickly."
        ],
        contentAr: [
          "الاختراقات الأمنية الكبرى عند المنافسين تدفع الترحيل الفوري للمنصات الآمنة المُثبتة.",
          "معمارية INFERA لانعدام الثقة واكتشاف التهديدات بـ AI تصبح مميزات رئيسية.",
          "الثقة تتحول للمنصات ذات سجلات الأمان المُظهرة—ثقة لا يستطيع المنافسون إعادة بنائها بسرعة."
        ]
      },
      {
        heading: "Board Decision Principles During Crisis",
        headingAr: "مبادئ قرار المجلس أثناء الأزمة",
        content: [
          "Never compromise sovereignty for short-term stability.",
          "View competitor distress as acquisition and market capture opportunity.",
          "Maintain investment in architecture—crisis is when differentiation matters most.",
          "Communicate confidence, not concern—customers seek stability during uncertainty."
        ],
        contentAr: [
          "لا تساوم أبداً على السيادة من أجل استقرار قصير المدى.",
          "انظر لضائقة المنافسين كفرصة استحواذ والتقاط سوق.",
          "حافظ على الاستثمار في المعمارية—الأزمة هي عندما يكون التمايز أكثر أهمية.",
          "تواصل بثقة، وليس قلق—العملاء يبحثون عن الاستقرار خلال عدم اليقين."
        ]
      }
    ]
  },
  {
    id: "irreplaceability-board",
    title: "Irreplaceability – Board Version",
    titleAr: "عدم القابلية للاستبدال – نسخة المجلس",
    subtitle: "Strategic Moat Explanation",
    subtitleAr: "شرح الخندق الاستراتيجي",
    confidentiality: "BOARD CONFIDENTIAL",
    confidentialityAr: "سري - مجلس الإدارة",
    sections: [
      {
        heading: "What Breaks If INFERA Is Removed",
        headingAr: "ما ينكسر إذا أُزيلت INFERA",
        content: [
          "Governance: All automated policy enforcement stops. Manual compliance required. Regulatory gaps emerge within hours.",
          "Intelligence: Predictive capabilities lost. Security becomes reactive. Operational efficiency drops 40-60%.",
          "Sovereignty: Data sovereignty guarantees void. Regulatory compliance at risk. Customer trust destroyed.",
          "Operations: Manual intervention required for all processes. Staff requirements increase 3-5x."
        ],
        contentAr: [
          "الحوكمة: كل تطبيق سياسات آلي يتوقف. الامتثال اليدوي مطلوب. فجوات تنظيمية تظهر خلال ساعات.",
          "الذكاء: القدرات التنبؤية تُفقد. الأمان يصبح تفاعلياً. الكفاءة التشغيلية تنخفض 40-60%.",
          "السيادة: ضمانات سيادة البيانات تبطل. الامتثال التنظيمي في خطر. ثقة العملاء مدمرة.",
          "العمليات: تدخل يدوي مطلوب لجميع العمليات. متطلبات الموظفين تزيد 3-5x."
        ]
      },
      {
        heading: "Why Replacement Fails",
        headingAr: "لماذا يفشل الاستبدال",
        content: [
          "Big Tech cannot deliver true sovereignty—their business model requires customer dependency.",
          "Legacy vendors (SAP, Oracle) cannot unwind 40+ years of architectural debt.",
          "SaaS bundles are not integrated platforms—unified governance is impossible across separate products.",
          "Startups cannot shortcut 5+ years of development and trust accumulation with capital."
        ],
        contentAr: [
          "شركات التكنولوجيا الكبرى لا تستطيع تقديم سيادة حقيقية—نموذج عملهم يتطلب اعتماد العميل.",
          "البائعون القدامى (SAP، Oracle) لا يستطيعون حل 40+ سنة من الديون المعمارية.",
          "حزم SaaS ليست منصات متكاملة—الحوكمة الموحدة مستحيلة عبر منتجات منفصلة.",
          "الشركات الناشئة لا تستطيع اختصار 5+ سنوات من التطوير وتراكم الثقة برأس المال."
        ]
      },
      {
        heading: "Long-Term Dependency Creation",
        headingAr: "إنشاء الاعتماد طويل المدى",
        content: [
          "Customer governance frameworks become structured around INFERA architecture.",
          "AI learning from production data exists only within INFERA—cannot be exported or transferred.",
          "Regulatory compliance pathways designed for INFERA governance—switching requires re-certification.",
          "Staff trained on INFERA systems—alternatives require retraining investments."
        ],
        contentAr: [
          "أطر حوكمة العملاء تصبح مهيكلة حول معمارية INFERA.",
          "تعلم AI من بيانات الإنتاج موجود فقط ضمن INFERA—لا يمكن تصديره أو نقله.",
          "مسارات الامتثال التنظيمي مصممة لحوكمة INFERA—التبديل يتطلب إعادة الشهادة.",
          "الموظفون مدربون على أنظمة INFERA—البدائل تتطلب استثمارات إعادة تدريب."
        ]
      },
      {
        heading: "Strategic Moat Summary",
        headingAr: "ملخص الخندق الاستراتيجي",
        content: [
          "This is not vendor lock-in through contracts or switching costs.",
          "This is structural necessity—INFERA provides capabilities that no alternative can replicate.",
          "Adoption is a one-way door. Organizations that enter become dependent on capabilities that cannot be replaced.",
          "The moat deepens with time. Every day of operation increases the irreplaceability."
        ],
        contentAr: [
          "هذا ليس قفل المورد من خلال العقود أو تكاليف التبديل.",
          "هذه ضرورة هيكلية—INFERA توفر قدرات لا يستطيع أي بديل تكرارها.",
          "التبني هو باب باتجاه واحد. المنظمات التي تدخل تصبح معتمدة على قدرات لا يمكن استبدالها.",
          "الخندق يعمق مع الوقت. كل يوم عمل يزيد عدم القابلية للاستبدال."
        ]
      }
    ]
  },
  {
    id: "red-line-commitment",
    title: "Board Red Line Commitment",
    titleAr: "التزام الخطوط الحمراء للمجلس",
    subtitle: "Non-Negotiables for Long-Term Success",
    subtitleAr: "غير القابل للتفاوض للنجاح طويل المدى",
    confidentiality: "BOARD CONFIDENTIAL",
    confidentialityAr: "سري - مجلس الإدارة",
    sections: [
      {
        heading: "Sovereignty Non-Negotiables",
        headingAr: "غير القابل للتفاوض في السيادة",
        content: [
          "Complete customer data control must always be preserved.",
          "No external dependencies in production operations.",
          "Customer ability to operate independently must never be compromised.",
          "Technology transfer capability must remain available for sovereign deployments."
        ],
        contentAr: [
          "التحكم الكامل في بيانات العميل يجب أن يُحفظ دائماً.",
          "لا اعتماديات خارجية في عمليات الإنتاج.",
          "قدرة العميل على التشغيل المستقل يجب ألا تُساوم أبداً.",
          "قدرة نقل التكنولوجيا يجب أن تبقى متاحة للنشر السيادي."
        ]
      },
      {
        heading: "Architecture Non-Negotiables",
        headingAr: "غير القابل للتفاوض في المعمارية",
        content: [
          "Platform factory capability must be preserved—never fragment into single products.",
          "AI-first design must remain foundational—never bolt AI onto existing systems.",
          "Zero-Trust security architecture must never be weakened for convenience.",
          "Governance automation must remain autonomous—never require manual intervention."
        ],
        contentAr: [
          "قدرة مصنع المنصات يجب أن تُحفظ—لا تتجزأ أبداً إلى منتجات فردية.",
          "تصميم AI-أولاً يجب أن يبقى أساسياً—لا تضف أبداً AI على الأنظمة الحالية.",
          "معمارية أمان انعدام الثقة يجب ألا تُضعف أبداً للراحة.",
          "أتمتة الحوكمة يجب أن تبقى مستقلة—لا تتطلب أبداً تدخلاً يدوياً."
        ]
      },
      {
        heading: "What Growth Must Never Sacrifice",
        headingAr: "ما يجب ألا يضحي به النمو أبداً",
        content: [
          "Long-term architectural integrity for short-term revenue.",
          "Customer trust for rapid market expansion.",
          "Security standards for deployment speed.",
          "Sovereign positioning for cloud provider partnerships."
        ],
        contentAr: [
          "سلامة المعمارية طويلة المدى من أجل إيرادات قصيرة المدى.",
          "ثقة العملاء من أجل توسع السوق السريع.",
          "معايير الأمان من أجل سرعة النشر.",
          "الموقع السيادي من أجل شراكات مزودي السحابة."
        ]
      },
      {
        heading: "What the Board Must Never Approve",
        headingAr: "ما يجب ألا يوافق عليه المجلس أبداً",
        content: [
          "Acquisition offers that compromise sovereignty architecture.",
          "Partnership terms that create external dependencies.",
          "Revenue models that conflict with customer control principles.",
          "Market expansion that dilutes sovereign positioning.",
          "Cost reductions that weaken security or governance capabilities."
        ],
        contentAr: [
          "عروض استحواذ تساوم على معمارية السيادة.",
          "شروط شراكة تنشئ اعتماديات خارجية.",
          "نماذج إيرادات تتعارض مع مبادئ تحكم العميل.",
          "توسع سوق يخفف الموقع السيادي.",
          "تخفيضات تكلفة تُضعف قدرات الأمان أو الحوكمة."
        ]
      }
    ],
    keyDecisions: [
      { decision: "Protect sovereignty above all other considerations", decisionAr: "حماية السيادة فوق كل الاعتبارات الأخرى" },
      { decision: "Maintain long-term architectural vision", decisionAr: "الحفاظ على رؤية المعمارية طويلة المدى" },
      { decision: "Resist short-term pressures that compromise principles", decisionAr: "مقاومة الضغوط قصيرة المدى التي تساوم على المبادئ" }
    ]
  }
];

export const boardDocumentMeta = {
  title: "INFERA Board-Level Documentation",
  titleAr: "وثائق INFERA لمستوى مجلس الإدارة",
  purpose: "Decision instruments for board members, sovereign funds, strategic investors, and executive committees.",
  purposeAr: "أدوات قرار لأعضاء مجلس الإدارة وصناديق السيادة والمستثمرين الاستراتيجيين واللجان التنفيذية.",
  disclaimer: "These documents are NOT marketing materials. They are decision instruments designed to enable decisive, long-term, high-stakes decisions.",
  disclaimerAr: "هذه الوثائق ليست مواد تسويقية. إنها أدوات قرار مصممة لتمكين قرارات حاسمة وطويلة المدى وعالية المخاطر."
};
