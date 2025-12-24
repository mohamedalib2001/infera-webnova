// INFERA Government Confidential Pack
// حزمة حكومية سرية

export interface GovernmentSection {
  id: string;
  title: string;
  titleAr: string;
  subtitle: string;
  subtitleAr: string;
  classification: string;
  classificationAr: string;
  content: {
    heading: string;
    headingAr: string;
    points: string[];
    pointsAr: string[];
  }[];
  assurances?: {
    assurance: string;
    assuranceAr: string;
  }[];
}

export const governmentSections: GovernmentSection[] = [
  {
    id: "sovereign-purpose",
    title: "Sovereign Purpose Statement",
    titleAr: "بيان الغرض السيادي",
    subtitle: "Why INFERA Exists for National Digital Sovereignty",
    subtitleAr: "لماذا توجد INFERA للسيادة الرقمية الوطنية",
    classification: "CONFIDENTIAL",
    classificationAr: "سري",
    content: [
      {
        heading: "Why INFERA Exists",
        headingAr: "لماذا توجد INFERA",
        points: [
          "Nations face a critical choice: build digital infrastructure under national control, or become permanently dependent on foreign technology providers.",
          "Current solutions force governments to choose between capability and sovereignty—advanced features require surrendering control to external vendors.",
          "INFERA was created to eliminate this false choice. Advanced capability with complete national control.",
          "This is not a product purchase. This is national infrastructure investment."
        ],
        pointsAr: [
          "تواجه الدول خياراً حرجاً: بناء بنية تحتية رقمية تحت السيطرة الوطنية، أو أن تصبح معتمدة بشكل دائم على مزودي التكنولوجيا الأجانب.",
          "الحلول الحالية تجبر الحكومات على الاختيار بين القدرة والسيادة—الميزات المتقدمة تتطلب التنازل عن التحكم لموردين خارجيين.",
          "أُنشئت INFERA للقضاء على هذا الخيار الزائف. قدرة متقدمة مع تحكم وطني كامل.",
          "هذا ليس شراء منتج. هذا استثمار بنية تحتية وطنية."
        ]
      },
      {
        heading: "How INFERA Enhances National Sovereignty",
        headingAr: "كيف تعزز INFERA السيادة الوطنية",
        points: [
          "Complete data residency within national borders—no external data flows required for any operation.",
          "Full technology transfer available—nations can operate independently without INFERA involvement if desired.",
          "AI governance trained on national policies and regulations, not foreign compliance frameworks.",
          "Emergency override capabilities ensure government control supersedes all automated systems."
        ],
        pointsAr: [
          "إقامة بيانات كاملة ضمن الحدود الوطنية—لا تدفقات بيانات خارجية مطلوبة لأي عملية.",
          "نقل تكنولوجي كامل متاح—الدول يمكنها العمل بشكل مستقل بدون مشاركة INFERA إذا رغبت.",
          "حوكمة AI مدربة على السياسات واللوائح الوطنية، وليس أطر امتثال أجنبية.",
          "قدرات التجاوز الطارئ تضمن أن تحكم الحكومة يتفوق على جميع الأنظمة الآلية."
        ]
      },
      {
        heading: "Infrastructure, Not SaaS",
        headingAr: "بنية تحتية، وليس SaaS",
        points: [
          "INFERA is not rented. It is deployed as permanent national infrastructure.",
          "No subscription dependencies. No external service requirements. No foreign operational control.",
          "Licensing models designed for government procurement—perpetual, transferable, and nationally owned.",
          "Maintenance and updates available through partnership, but never required for continued operation."
        ],
        pointsAr: [
          "INFERA لا تُستأجر. تُنشر كبنية تحتية وطنية دائمة.",
          "لا اعتماديات اشتراك. لا متطلبات خدمة خارجية. لا تحكم تشغيلي أجنبي.",
          "نماذج ترخيص مصممة للمشتريات الحكومية—دائمة وقابلة للنقل ومملوكة وطنياً.",
          "الصيانة والتحديثات متاحة من خلال الشراكة، لكن ليست مطلوبة أبداً لاستمرار التشغيل."
        ]
      },
      {
        heading: "Control Remains Fully National",
        headingAr: "التحكم يبقى وطنياً بالكامل",
        points: [
          "All encryption keys held nationally. No external access possible.",
          "All data processing occurs within national infrastructure. No external computation.",
          "All governance policies defined by national authorities. No external policy enforcement.",
          "All system modifications require national authorization. No external changes possible."
        ],
        pointsAr: [
          "جميع مفاتيح التشفير محتفظ بها وطنياً. لا وصول خارجي ممكن.",
          "جميع معالجة البيانات تحدث ضمن البنية التحتية الوطنية. لا حساب خارجي.",
          "جميع سياسات الحوكمة تُحدد من السلطات الوطنية. لا تطبيق سياسة خارجي.",
          "جميع تعديلات النظام تتطلب تفويضاً وطنياً. لا تغييرات خارجية ممكنة."
        ]
      }
    ],
    assurances: [
      { assurance: "National data never leaves sovereign territory", assuranceAr: "البيانات الوطنية لا تغادر الأراضي السيادية أبداً" },
      { assurance: "Full operational independence achievable", assuranceAr: "استقلال تشغيلي كامل قابل للتحقيق" },
      { assurance: "No foreign dependencies in critical operations", assuranceAr: "لا اعتماديات أجنبية في العمليات الحرجة" }
    ]
  },
  {
    id: "time-dominance-gov",
    title: "Time Dominance – Government Version",
    titleAr: "السيطرة على الزمن – النسخة الحكومية",
    subtitle: "National Capability Growth Over Time",
    subtitleAr: "نمو القدرة الوطنية مع الوقت",
    classification: "CONFIDENTIAL",
    classificationAr: "سري",
    content: [
      {
        heading: "National Capability Growth",
        headingAr: "نمو القدرة الوطنية",
        points: [
          "Year 1-2: Core sovereign infrastructure operational. National digital services running on national platforms.",
          "Year 3-5: Cross-ministry integration complete. AI governance learning from national operations. Workforce trained on sovereign systems.",
          "Year 5-10: Regional digital leadership position. Export capability to allied nations. Complete technological independence."
        ],
        pointsAr: [
          "السنة 1-2: البنية التحتية السيادية الأساسية تشغيلية. الخدمات الرقمية الوطنية تعمل على منصات وطنية.",
          "السنة 3-5: التكامل عبر الوزارات مكتمل. حوكمة AI تتعلم من العمليات الوطنية. القوى العاملة مدربة على الأنظمة السيادية.",
          "السنة 5-10: موقع قيادة رقمية إقليمية. قدرة تصدير للدول الحليفة. استقلال تكنولوجي كامل."
        ]
      },
      {
        heading: "Independence from Foreign Vendors",
        headingAr: "الاستقلال عن الموردين الأجانب",
        points: [
          "Current state: Critical national services dependent on foreign cloud providers, SaaS vendors, and technology platforms.",
          "Risk exposure: Service termination, sanctions, pricing changes, and data access all controlled by foreign entities.",
          "INFERA transition: Systematic migration to sovereign infrastructure with maintained capability and eliminated dependency.",
          "End state: Complete operational independence. Foreign vendor relationships optional, not required."
        ],
        pointsAr: [
          "الحالة الحالية: الخدمات الوطنية الحرجة معتمدة على مزودي السحابة الأجانب وبائعي SaaS ومنصات التكنولوجيا.",
          "تعرض المخاطر: إنهاء الخدمة والعقوبات وتغييرات الأسعار والوصول للبيانات كلها يتحكم بها كيانات أجنبية.",
          "انتقال INFERA: هجرة منهجية للبنية التحتية السيادية مع قدرة محافظ عليها واعتماد مُزال.",
          "الحالة النهائية: استقلال تشغيلي كامل. علاقات الموردين الأجانب اختيارية، وليست مطلوبة."
        ]
      },
      {
        heading: "Long-Term Strategic Positioning",
        headingAr: "التموضع الاستراتيجي طويل المدى",
        points: [
          "Nations adopting sovereign infrastructure early establish regional technology leadership.",
          "Neighboring nations will seek partnership and technology sharing arrangements.",
          "National talent development creates sustainable competitive advantage in digital governance.",
          "Early adoption compounds advantage—later adopters face permanent capability gaps."
        ],
        pointsAr: [
          "الدول التي تتبنى البنية التحتية السيادية مبكراً تنشئ قيادة تكنولوجية إقليمية.",
          "الدول المجاورة ستسعى لترتيبات شراكة ومشاركة تكنولوجيا.",
          "تطوير المواهب الوطنية ينشئ ميزة تنافسية مستدامة في الحوكمة الرقمية.",
          "التبني المبكر يراكم الميزة—المتبنون اللاحقون يواجهون فجوات قدرة دائمة."
        ]
      },
      {
        heading: "Avoiding Technological Dependency",
        headingAr: "تجنب الاعتماد التكنولوجي",
        points: [
          "Foreign technology dependency is strategic vulnerability. Sanctions, conflicts, or policy changes can terminate access overnight.",
          "Dependency deepens over time. Systems built on foreign platforms become increasingly difficult to migrate.",
          "INFERA prevents dependency creation by design. Every component can be operated nationally.",
          "Technology transfer ensures long-term independence regardless of INFERA partnership status."
        ],
        pointsAr: [
          "الاعتماد التكنولوجي الأجنبي هو ضعف استراتيجي. العقوبات أو الصراعات أو تغييرات السياسة يمكن أن تنهي الوصول بين عشية وضحاها.",
          "الاعتماد يعمق مع الوقت. الأنظمة المبنية على منصات أجنبية تصبح أصعب في الترحيل بشكل متزايد.",
          "INFERA تمنع إنشاء الاعتماد بالتصميم. كل مكون يمكن تشغيله وطنياً.",
          "نقل التكنولوجيا يضمن استقلالاً طويل المدى بغض النظر عن حالة شراكة INFERA."
        ]
      }
    ],
    assurances: [
      { assurance: "Capability grows under national control", assuranceAr: "القدرة تنمو تحت السيطرة الوطنية" },
      { assurance: "Foreign dependencies systematically eliminated", assuranceAr: "الاعتماديات الأجنبية تُزال بشكل منهجي" },
      { assurance: "Regional leadership position achievable", assuranceAr: "موقع القيادة الإقليمية قابل للتحقيق" }
    ]
  },
  {
    id: "crisis-resilience-gov",
    title: "Crisis Resilience – Government Version",
    titleAr: "مرونة الأزمات – النسخة الحكومية",
    subtitle: "Stability Under National Pressure",
    subtitleAr: "الاستقرار تحت الضغط الوطني",
    classification: "CONFIDENTIAL / RESTRICTED",
    classificationAr: "سري / محدود",
    content: [
      {
        heading: "Cyber Warfare Readiness",
        headingAr: "جاهزية الحرب السيبرانية",
        points: [
          "Zero-Trust Architecture: No implicit trust. Every access verified. Lateral movement prevented by design.",
          "AI Threat Detection: Autonomous identification of attack patterns. Response faster than human coordination possible.",
          "Sovereign Isolation: National systems can operate completely disconnected from global networks if required.",
          "Incident Response: Automated containment, isolation, and recovery. Minimal human intervention required."
        ],
        pointsAr: [
          "معمارية انعدام الثقة: لا ثقة ضمنية. كل وصول يُتحقق منه. الحركة الجانبية تُمنع بالتصميم.",
          "اكتشاف التهديدات بـ AI: تحديد مستقل لأنماط الهجوم. استجابة أسرع من التنسيق البشري الممكن.",
          "العزل السيادي: الأنظمة الوطنية يمكنها العمل منفصلة تماماً عن الشبكات العالمية إذا لزم الأمر.",
          "استجابة الحوادث: احتواء وعزل واستعادة آلية. تدخل بشري ضئيل مطلوب."
        ]
      },
      {
        heading: "Economic Disruption Handling",
        headingAr: "التعامل مع الاضطراب الاقتصادي",
        points: [
          "No subscription dependencies mean economic pressure cannot terminate critical national services.",
          "Perpetual licensing ensures continued operation regardless of vendor financial status.",
          "Local operations require no foreign currency for ongoing operation.",
          "Economic sanctions cannot affect nationally-controlled infrastructure."
        ],
        pointsAr: [
          "لا اعتماديات اشتراك تعني أن الضغط الاقتصادي لا يستطيع إنهاء الخدمات الوطنية الحرجة.",
          "الترخيص الدائم يضمن استمرار التشغيل بغض النظر عن الحالة المالية للمورد.",
          "العمليات المحلية لا تتطلب عملة أجنبية للتشغيل المستمر.",
          "العقوبات الاقتصادية لا تستطيع التأثير على البنية التحتية المتحكم بها وطنياً."
        ]
      },
      {
        heading: "Sovereignty Pressure Response",
        headingAr: "استجابة ضغط السيادة",
        points: [
          "Foreign technology bans cannot affect nationally-deployed INFERA infrastructure.",
          "Data localization mandates already satisfied by default architecture.",
          "Government policy changes can be implemented immediately through Policy Validator AI.",
          "No external approval required for any national policy implementation."
        ],
        pointsAr: [
          "حظر التكنولوجيا الأجنبية لا يستطيع التأثير على بنية INFERA التحتية المنشورة وطنياً.",
          "تفويضات توطين البيانات ملباة بالفعل بالمعمارية الافتراضية.",
          "تغييرات السياسة الحكومية يمكن تنفيذها فوراً من خلال AI مُصادق السياسات.",
          "لا موافقة خارجية مطلوبة لأي تنفيذ سياسة وطنية."
        ]
      },
      {
        heading: "State Continuity Assurance",
        headingAr: "ضمان استمرارية الدولة",
        points: [
          "Critical government services remain operational during any external crisis.",
          "Citizen-facing services maintain availability regardless of international events.",
          "National security systems operate independently of global technology infrastructure.",
          "Government decision-making supported by AI that operates under national control only."
        ],
        pointsAr: [
          "الخدمات الحكومية الحرجة تبقى تشغيلية خلال أي أزمة خارجية.",
          "الخدمات الموجهة للمواطنين تحافظ على التوفر بغض النظر عن الأحداث الدولية.",
          "أنظمة الأمن الوطني تعمل بشكل مستقل عن البنية التحتية التكنولوجية العالمية.",
          "صنع القرار الحكومي مدعوم بـ AI يعمل تحت السيطرة الوطنية فقط."
        ]
      }
    ],
    assurances: [
      { assurance: "Operations continue under any external pressure", assuranceAr: "العمليات تستمر تحت أي ضغط خارجي" },
      { assurance: "No foreign entity can terminate national services", assuranceAr: "لا كيان أجنبي يستطيع إنهاء الخدمات الوطنية" },
      { assurance: "Complete cyber resilience achievable", assuranceAr: "مرونة سيبرانية كاملة قابلة للتحقيق" }
    ]
  },
  {
    id: "irreplaceability-national",
    title: "Irreplaceability – National Infrastructure View",
    titleAr: "عدم القابلية للاستبدال – نظرة البنية التحتية الوطنية",
    subtitle: "Strategic Dependency Analysis",
    subtitleAr: "تحليل الاعتماد الاستراتيجي",
    classification: "CONFIDENTIAL",
    classificationAr: "سري",
    content: [
      {
        heading: "Why INFERA Becomes Foundational",
        headingAr: "لماذا تصبح INFERA أساسية",
        points: [
          "National digital services built on INFERA architecture create deep integration that enables efficiency.",
          "Cross-ministry data intelligence becomes possible only with unified sovereign infrastructure.",
          "Governance automation reduces bureaucratic overhead while increasing compliance assurance.",
          "National AI capabilities compound as more services integrate with INFERA intelligence."
        ],
        pointsAr: [
          "الخدمات الرقمية الوطنية المبنية على معمارية INFERA تنشئ تكاملاً عميقاً يمكّن الكفاءة.",
          "ذكاء البيانات عبر الوزارات يصبح ممكناً فقط مع بنية تحتية سيادية موحدة.",
          "أتمتة الحوكمة تقلل الأعباء البيروقراطية بينما تزيد ضمان الامتثال.",
          "قدرات AI الوطنية تتراكم مع تكامل المزيد من الخدمات مع ذكاء INFERA."
        ]
      },
      {
        heading: "Systems That Depend on INFERA",
        headingAr: "الأنظمة التي تعتمد على INFERA",
        points: [
          "Citizen identity and authentication across all government services.",
          "Cross-ministry data sharing and intelligence coordination.",
          "Automated policy enforcement and compliance monitoring.",
          "National security threat detection and response coordination."
        ],
        pointsAr: [
          "هوية المواطن والمصادقة عبر جميع الخدمات الحكومية.",
          "مشاركة البيانات عبر الوزارات وتنسيق الاستخبارات.",
          "تطبيق السياسات الآلي ومراقبة الامتثال.",
          "اكتشاف تهديدات الأمن الوطني وتنسيق الاستجابة."
        ]
      },
      {
        heading: "Why Removal Creates National Risk",
        headingAr: "لماذا الإزالة تنشئ مخاطر وطنية",
        points: [
          "Removal requires rebuilding all integrated services from scratch—years of national capability lost.",
          "No alternative provides unified sovereign governance across the platform scope.",
          "AI intelligence accumulated from national operations exists only within INFERA—cannot be transferred.",
          "Staff training, compliance certifications, and integration investments would require complete replacement."
        ],
        pointsAr: [
          "الإزالة تتطلب إعادة بناء جميع الخدمات المتكاملة من الصفر—سنوات من القدرة الوطنية تُفقد.",
          "لا بديل يوفر حوكمة سيادية موحدة عبر نطاق المنصة.",
          "ذكاء AI المتراكم من العمليات الوطنية موجود فقط ضمن INFERA—لا يمكن نقله.",
          "تدريب الموظفين وشهادات الامتثال واستثمارات التكامل ستتطلب استبدالاً كاملاً."
        ]
      },
      {
        heading: "Strategic Dependency Framing",
        headingAr: "إطار الاعتماد الاستراتيجي",
        points: [
          "This is not vendor lock-in. This is strategic infrastructure investment.",
          "INFERA dependency is chosen sovereignty—dependency on foreign alternatives is imposed vulnerability.",
          "The question is not whether to depend on digital infrastructure, but which infrastructure serves national interest.",
          "Full technology transfer ensures dependency remains chosen, not imposed."
        ],
        pointsAr: [
          "هذا ليس قفل المورد. هذا استثمار بنية تحتية استراتيجية.",
          "الاعتماد على INFERA هو سيادة مختارة—الاعتماد على البدائل الأجنبية هو ضعف مفروض.",
          "السؤال ليس ما إذا كان يجب الاعتماد على البنية التحتية الرقمية، ولكن أي بنية تحتية تخدم المصلحة الوطنية.",
          "نقل التكنولوجيا الكامل يضمن أن الاعتماد يبقى مختاراً، وليس مفروضاً."
        ]
      }
    ],
    assurances: [
      { assurance: "Strategic dependency, not vendor lock-in", assuranceAr: "اعتماد استراتيجي، وليس قفل مورد" },
      { assurance: "Technology transfer always available", assuranceAr: "نقل التكنولوجيا متاح دائماً" },
      { assurance: "National interest served by chosen infrastructure", assuranceAr: "المصلحة الوطنية تُخدم بالبنية التحتية المختارة" }
    ]
  },
  {
    id: "governance-control",
    title: "Governance & Control Assurance",
    titleAr: "ضمان الحوكمة والتحكم",
    subtitle: "National Control Mechanisms",
    subtitleAr: "آليات التحكم الوطنية",
    classification: "CONFIDENTIAL",
    classificationAr: "سري",
    content: [
      {
        heading: "Policy Validator AI",
        headingAr: "AI مُصادق السياسات",
        points: [
          "All national policies encoded and automatically enforced across all platforms.",
          "Real-time compliance validation—violations detected and addressed immediately.",
          "Policy changes propagate instantly across all integrated systems.",
          "Full audit trail of all policy decisions and enforcement actions."
        ],
        pointsAr: [
          "جميع السياسات الوطنية مشفرة ومُطبقة تلقائياً عبر جميع المنصات.",
          "التحقق من الامتثال في الوقت الفعلي—الانتهاكات تُكتشف وتُعالج فوراً.",
          "تغييرات السياسة تنتشر فوراً عبر جميع الأنظمة المتكاملة.",
          "مسار تدقيق كامل لجميع قرارات السياسة وإجراءات التطبيق."
        ]
      },
      {
        heading: "Data Residency Guarantees",
        headingAr: "ضمانات إقامة البيانات",
        points: [
          "All data stored within national borders. No exceptions.",
          "No data replication to external locations for any purpose.",
          "Backup and disaster recovery within national infrastructure only.",
          "Data sovereignty legally guaranteed through contractual and technical controls."
        ],
        pointsAr: [
          "جميع البيانات مخزنة ضمن الحدود الوطنية. لا استثناءات.",
          "لا تكرار بيانات لمواقع خارجية لأي غرض.",
          "النسخ الاحتياطي واستعادة الكوارث ضمن البنية التحتية الوطنية فقط.",
          "سيادة البيانات مضمونة قانونياً من خلال ضوابط تعاقدية وتقنية."
        ]
      },
      {
        heading: "Local Control Mechanisms",
        headingAr: "آليات التحكم المحلية",
        points: [
          "National administrators have complete system control. No external override possible.",
          "All system configurations modifiable by national authorities.",
          "Security policies defined and enforced nationally.",
          "Access controls determined exclusively by national requirements."
        ],
        pointsAr: [
          "المسؤولون الوطنيون لديهم تحكم كامل بالنظام. لا تجاوز خارجي ممكن.",
          "جميع تكوينات النظام قابلة للتعديل من السلطات الوطنية.",
          "سياسات الأمان تُحدد وتُطبق وطنياً.",
          "ضوابط الوصول تُحدد حصرياً بالمتطلبات الوطنية."
        ]
      },
      {
        heading: "Auditability and Oversight",
        headingAr: "قابلية التدقيق والرقابة",
        points: [
          "Complete audit logs of all system activities available to national authorities.",
          "Third-party security audits can be conducted at any time.",
          "Full source code access available for security review.",
          "Compliance reporting automated and available on demand."
        ],
        pointsAr: [
          "سجلات تدقيق كاملة لجميع أنشطة النظام متاحة للسلطات الوطنية.",
          "تدقيقات أمان طرف ثالث يمكن إجراؤها في أي وقت.",
          "وصول كود المصدر الكامل متاح للمراجعة الأمنية.",
          "تقارير الامتثال آلية ومتاحة عند الطلب."
        ]
      },
      {
        heading: "Emergency Override Rules",
        headingAr: "قواعد التجاوز الطارئ",
        points: [
          "National authorities can override any automated decision instantly.",
          "Emergency shutdown capabilities available at all levels.",
          "Crisis mode activates enhanced national control protocols.",
          "No automated decision can supersede explicit national authority instruction."
        ],
        pointsAr: [
          "السلطات الوطنية تستطيع تجاوز أي قرار آلي فوراً.",
          "قدرات الإيقاف الطارئ متاحة على جميع المستويات.",
          "وضع الأزمة يُفعل بروتوكولات تحكم وطنية معززة.",
          "لا قرار آلي يستطيع التفوق على تعليمات السلطة الوطنية الصريحة."
        ]
      }
    ],
    assurances: [
      { assurance: "Complete national control at all times", assuranceAr: "تحكم وطني كامل في جميع الأوقات" },
      { assurance: "Full auditability and transparency", assuranceAr: "قابلية تدقيق وشفافية كاملة" },
      { assurance: "Emergency override always available", assuranceAr: "التجاوز الطارئ متاح دائماً" }
    ]
  }
];

export const governmentPackMeta = {
  title: "INFERA Government Confidential Pack",
  titleAr: "حزمة INFERA الحكومية السرية",
  classification: "CONFIDENTIAL / RESTRICTED",
  classificationAr: "سري / محدود",
  targetAudience: [
    { audience: "Ministries", audienceAr: "الوزارات" },
    { audience: "National Authorities", audienceAr: "السلطات الوطنية" },
    { audience: "Sovereign Digital Offices", audienceAr: "مكاتب الرقمنة السيادية" },
    { audience: "Defense / Cyber / Finance Agencies", audienceAr: "وكالات الدفاع / السيبرانية / المالية" }
  ],
  principle: "This pack reduces fear, not sells ambition.",
  principleAr: "هذه الحزمة تقلل الخوف، ولا تبيع الطموح.",
  restrictions: [
    "No investor language",
    "No valuation or revenue talk",
    "No competitive bragging",
    "No market leadership claims"
  ],
  restrictionsAr: [
    "لا لغة مستثمرين",
    "لا حديث عن التقييم أو الإيرادات",
    "لا تفاخر تنافسي",
    "لا ادعاءات قيادة السوق"
  ],
  toneGuidelines: [
    "Assurance-focused",
    "Stability-first",
    "Control-centric",
    "Non-commercial"
  ],
  toneGuidelinesAr: [
    "تركيز على الضمان",
    "الاستقرار أولاً",
    "تمحور حول التحكم",
    "غير تجاري"
  ]
};

export const adoptionPhases = [
  {
    phase: "Phase 1: Assessment",
    phaseAr: "المرحلة 1: التقييم",
    duration: "2-3 months",
    durationAr: "2-3 أشهر",
    activities: [
      "Current infrastructure audit",
      "Sovereignty gap analysis",
      "Pilot scope definition",
      "Stakeholder alignment"
    ],
    activitiesAr: [
      "تدقيق البنية التحتية الحالية",
      "تحليل فجوة السيادة",
      "تعريف نطاق التجريب",
      "مواءمة أصحاب المصلحة"
    ]
  },
  {
    phase: "Phase 2: Pilot Deployment",
    phaseAr: "المرحلة 2: النشر التجريبي",
    duration: "6-9 months",
    durationAr: "6-9 أشهر",
    activities: [
      "Limited scope sovereign deployment",
      "Integration with existing systems",
      "Staff training and capability building",
      "Performance and security validation"
    ],
    activitiesAr: [
      "نشر سيادي بنطاق محدود",
      "التكامل مع الأنظمة الحالية",
      "تدريب الموظفين وبناء القدرات",
      "التحقق من الأداء والأمان"
    ]
  },
  {
    phase: "Phase 3: Expansion",
    phaseAr: "المرحلة 3: التوسع",
    duration: "12-24 months",
    durationAr: "12-24 شهراً",
    activities: [
      "Cross-ministry integration",
      "Legacy system migration",
      "Full AI governance activation",
      "National capability development"
    ],
    activitiesAr: [
      "التكامل عبر الوزارات",
      "ترحيل الأنظمة القديمة",
      "تفعيل حوكمة AI الكاملة",
      "تطوير القدرة الوطنية"
    ]
  },
  {
    phase: "Phase 4: Independence",
    phaseAr: "المرحلة 4: الاستقلال",
    duration: "Ongoing",
    durationAr: "مستمر",
    activities: [
      "Complete technology transfer",
      "National team self-sufficiency",
      "Continuous capability enhancement",
      "Regional leadership positioning"
    ],
    activitiesAr: [
      "نقل تكنولوجي كامل",
      "اكتفاء ذاتي للفريق الوطني",
      "تعزيز القدرة المستمر",
      "تموضع القيادة الإقليمية"
    ]
  }
];
