export interface ApiEndpoint {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  description: string;
  descriptionAr: string;
}

export interface PageDoc {
  id: string;
  name: string;
  nameAr: string;
  filePath: string;
  description: string;
  descriptionAr: string;
  category: string;
  icon: string;
  features: string[];
  featuresAr: string[];
  apiEndpoints: ApiEndpoint[];
  dataModels: string[];
  dependencies: string[];
  accessLevel: string;
}

export const technicalDocs: PageDoc[] = [
  {
    id: "landing",
    name: "Landing Page",
    nameAr: "الصفحة الرئيسية",
    filePath: "client/src/pages/landing.tsx",
    description: "Public landing page with hero section and features",
    descriptionAr: "الصفحة الرئيسية العامة مع قسم البطل والمميزات",
    category: "public",
    icon: "Home",
    features: ["Hero section", "Feature showcase", "CTA buttons", "Responsive design"],
    featuresAr: ["قسم البطل", "عرض المميزات", "أزرار الدعوة للعمل", "تصميم متجاوب"],
    apiEndpoints: [],
    dataModels: [],
    dependencies: ["framer-motion", "lucide-react"],
    accessLevel: "public"
  },
  {
    id: "auth",
    name: "Authentication",
    nameAr: "المصادقة",
    filePath: "client/src/pages/auth.tsx",
    description: "Login and registration with OTP and 2FA support",
    descriptionAr: "تسجيل الدخول والتسجيل مع دعم OTP والمصادقة الثنائية",
    category: "core",
    icon: "Lock",
    features: ["Email/password login", "OTP verification", "2FA support", "Social login"],
    featuresAr: ["تسجيل بالبريد/كلمة السر", "التحقق بـ OTP", "دعم المصادقة الثنائية", "تسجيل اجتماعي"],
    apiEndpoints: [
      { method: "POST", path: "/api/auth/login", description: "User login", descriptionAr: "تسجيل الدخول" },
      { method: "POST", path: "/api/auth/register", description: "User registration", descriptionAr: "تسجيل جديد" },
      { method: "POST", path: "/api/auth/verify-otp", description: "OTP verification", descriptionAr: "التحقق من OTP" }
    ],
    dataModels: ["User", "Session"],
    dependencies: ["react-hook-form", "zod"],
    accessLevel: "public"
  },
  {
    id: "platform-builder",
    name: "Platform Builder",
    nameAr: "مُنشئ المنصات",
    filePath: "client/src/pages/platform-builder.tsx",
    description: "AI-powered sovereign platform generator with Nova AI",
    descriptionAr: "مُنشئ المنصات السيادية المدعوم بالذكاء الاصطناعي Nova",
    category: "core",
    icon: "Layers",
    features: ["Natural language input", "AI architecture analysis", "Microservices generation", "Docker/K8s export", "Live preview", "Arabic support"],
    featuresAr: ["إدخال بلغة طبيعية", "تحليل البنية بـ AI", "توليد الخدمات المصغرة", "تصدير Docker/K8s", "معاينة مباشرة", "دعم العربية"],
    apiEndpoints: [
      { method: "POST", path: "/api/nova/analyze", description: "Analyze requirements", descriptionAr: "تحليل المتطلبات" },
      { method: "POST", path: "/api/nova/generate", description: "Generate platform", descriptionAr: "توليد المنصة" }
    ],
    dataModels: ["Platform", "Architecture", "Microservice"],
    dependencies: ["@anthropic-ai/sdk", "framer-motion"],
    accessLevel: "owner"
  },
  {
    id: "sovereign",
    name: "Sovereign Dashboard",
    nameAr: "لوحة التحكم السيادية",
    filePath: "client/src/pages/sovereign.tsx",
    description: "Owner control panel with full platform management",
    descriptionAr: "لوحة تحكم المالك مع إدارة كاملة للمنصة",
    category: "admin",
    icon: "Crown",
    features: ["Platform overview", "User management", "System settings", "Analytics", "AI assistants"],
    featuresAr: ["نظرة عامة على المنصة", "إدارة المستخدمين", "إعدادات النظام", "التحليلات", "مساعدي AI"],
    apiEndpoints: [
      { method: "GET", path: "/api/owner/stats", description: "Platform statistics", descriptionAr: "إحصائيات المنصة" }
    ],
    dataModels: ["User", "Platform", "Analytics"],
    dependencies: ["recharts", "lucide-react"],
    accessLevel: "owner"
  },
  {
    id: "sovereign-workspace",
    name: "Sovereign Workspace",
    nameAr: "مساحة العمل السيادية",
    filePath: "client/src/pages/sovereign-workspace.tsx",
    description: "Advanced workspace for sovereign operations",
    descriptionAr: "مساحة عمل متقدمة للعمليات السيادية",
    category: "admin",
    icon: "Briefcase",
    features: ["Multi-panel layout", "Real-time collaboration", "Advanced tools"],
    featuresAr: ["تخطيط متعدد اللوحات", "تعاون فوري", "أدوات متقدمة"],
    apiEndpoints: [],
    dataModels: ["Workspace"],
    dependencies: ["react-resizable-panels"],
    accessLevel: "owner"
  },
  {
    id: "integrations-settings",
    name: "Integration Settings",
    nameAr: "إعدادات التكاملات",
    filePath: "client/src/pages/integrations-settings.tsx",
    description: "Configure 36 external service providers with AES-256-GCM encryption",
    descriptionAr: "إعدادات 36 مزود خدمة خارجي مع تشفير AES-256-GCM",
    category: "admin",
    icon: "Plug",
    features: ["36 providers", "AES-256-GCM encryption", "Masked credentials", "Connection testing", "MENA providers"],
    featuresAr: ["36 مزود", "تشفير AES-256-GCM", "بيانات مُقنّعة", "اختبار الاتصال", "مزودين إقليميين"],
    apiEndpoints: [
      { method: "GET", path: "/api/integrations", description: "Get configurations", descriptionAr: "جلب الإعدادات" },
      { method: "POST", path: "/api/integrations/:id", description: "Save credentials", descriptionAr: "حفظ البيانات" },
      { method: "POST", path: "/api/integrations/:id/test", description: "Test connection", descriptionAr: "اختبار الاتصال" }
    ],
    dataModels: ["IntegrationConfig", "IntegrationCredential"],
    dependencies: ["crypto"],
    accessLevel: "owner"
  },
  {
    id: "projects",
    name: "Projects",
    nameAr: "المشاريع",
    filePath: "client/src/pages/projects.tsx",
    description: "Project management and listing",
    descriptionAr: "إدارة وعرض المشاريع",
    category: "build",
    icon: "FolderOpen",
    features: ["Project list", "Create/edit projects", "Search and filter", "Project cards"],
    featuresAr: ["قائمة المشاريع", "إنشاء/تعديل", "بحث وتصفية", "بطاقات المشاريع"],
    apiEndpoints: [
      { method: "GET", path: "/api/projects", description: "List projects", descriptionAr: "عرض المشاريع" },
      { method: "POST", path: "/api/projects", description: "Create project", descriptionAr: "إنشاء مشروع" }
    ],
    dataModels: ["Project"],
    dependencies: ["@tanstack/react-query"],
    accessLevel: "all"
  },
  {
    id: "templates",
    name: "Templates",
    nameAr: "القوالب",
    filePath: "client/src/pages/templates.tsx",
    description: "Pre-built platform templates",
    descriptionAr: "قوالب منصات جاهزة",
    category: "build",
    icon: "Layout",
    features: ["Template gallery", "Category filter", "Preview", "Quick start"],
    featuresAr: ["معرض القوالب", "تصفية بالفئة", "معاينة", "بدء سريع"],
    apiEndpoints: [
      { method: "GET", path: "/api/templates", description: "List templates", descriptionAr: "عرض القوالب" }
    ],
    dataModels: ["Template"],
    dependencies: [],
    accessLevel: "all"
  },
  {
    id: "deploy",
    name: "One-Click Deploy",
    nameAr: "النشر بنقرة واحدة",
    filePath: "client/src/pages/deploy.tsx",
    description: "Deploy projects with one click",
    descriptionAr: "نشر المشاريع بنقرة واحدة",
    category: "build",
    icon: "Rocket",
    features: ["One-click deployment", "Custom domain", "SSL certificate", "Global CDN"],
    featuresAr: ["نشر بنقرة", "نطاق مخصص", "شهادة SSL", "CDN عالمي"],
    apiEndpoints: [
      { method: "POST", path: "/api/deploy", description: "Deploy project", descriptionAr: "نشر المشروع" }
    ],
    dataModels: ["Deployment"],
    dependencies: [],
    accessLevel: "all"
  },
  {
    id: "chatbot-builder",
    name: "Chatbot Builder",
    nameAr: "منشئ الروبوتات",
    filePath: "client/src/pages/chatbot-builder.tsx",
    description: "Create AI chatbots for websites",
    descriptionAr: "إنشاء روبوتات محادثة ذكية للمواقع",
    category: "build",
    icon: "Bot",
    features: ["AI chatbot creation", "Custom training", "Easy integration"],
    featuresAr: ["إنشاء روبوت ذكي", "تدريب مخصص", "تكامل سهل"],
    apiEndpoints: [],
    dataModels: ["Chatbot"],
    dependencies: [],
    accessLevel: "all"
  },
  {
    id: "api-keys",
    name: "API Keys",
    nameAr: "مفاتيح API",
    filePath: "client/src/pages/api-keys.tsx",
    description: "Manage API keys with scopes and rate limits",
    descriptionAr: "إدارة مفاتيح API مع النطاقات وحدود الاستخدام",
    category: "security",
    icon: "Key",
    features: ["Key creation", "Scope management", "Rate limiting", "Audit logs", "Key rotation"],
    featuresAr: ["إنشاء المفاتيح", "إدارة النطاقات", "حدود الاستخدام", "سجلات التدقيق", "تدوير المفاتيح"],
    apiEndpoints: [
      { method: "GET", path: "/api/api-keys", description: "List keys", descriptionAr: "عرض المفاتيح" },
      { method: "POST", path: "/api/api-keys", description: "Create key", descriptionAr: "إنشاء مفتاح" },
      { method: "DELETE", path: "/api/api-keys/:id", description: "Revoke key", descriptionAr: "إلغاء مفتاح" }
    ],
    dataModels: ["ApiKey", "ApiKeyScope"],
    dependencies: ["crypto"],
    accessLevel: "owner"
  },
  {
    id: "ssh-vault",
    name: "SSH Vault",
    nameAr: "خزنة SSH",
    filePath: "client/src/pages/ssh-vault.tsx",
    description: "Secure SSH key management",
    descriptionAr: "إدارة آمنة لمفاتيح SSH",
    category: "security",
    icon: "Shield",
    features: ["SSH key storage", "Encryption", "Access control"],
    featuresAr: ["تخزين مفاتيح SSH", "التشفير", "التحكم بالوصول"],
    apiEndpoints: [
      { method: "GET", path: "/api/ssh-keys", description: "List SSH keys", descriptionAr: "عرض مفاتيح SSH" }
    ],
    dataModels: ["SSHKey"],
    dependencies: ["crypto"],
    accessLevel: "owner"
  },
  {
    id: "github-sync",
    name: "GitHub Sync",
    nameAr: "مزامنة GitHub",
    filePath: "client/src/pages/github-sync.tsx",
    description: "Sync projects with GitHub repositories",
    descriptionAr: "مزامنة المشاريع مع مستودعات GitHub",
    category: "build",
    icon: "Github",
    features: ["Repository connection", "Auto-sync", "Deployment history", "Branch management"],
    featuresAr: ["ربط المستودع", "مزامنة تلقائية", "تاريخ النشر", "إدارة الفروع"],
    apiEndpoints: [
      { method: "GET", path: "/api/github/status", description: "Connection status", descriptionAr: "حالة الاتصال" },
      { method: "POST", path: "/api/github/sync", description: "Sync repository", descriptionAr: "مزامنة المستودع" }
    ],
    dataModels: ["GitHubRepo"],
    dependencies: ["@octokit/rest"],
    accessLevel: "all"
  },
  {
    id: "nova-chat",
    name: "Nova Chat",
    nameAr: "محادثة Nova",
    filePath: "client/src/pages/nova-chat.tsx",
    description: "AI chat interface with Nova",
    descriptionAr: "واجهة محادثة مع Nova AI",
    category: "ai",
    icon: "MessageSquare",
    features: ["AI chat", "Context awareness", "Code generation", "Multi-language"],
    featuresAr: ["محادثة AI", "فهم السياق", "توليد الكود", "متعدد اللغات"],
    apiEndpoints: [
      { method: "POST", path: "/api/nova/chat", description: "Send message", descriptionAr: "إرسال رسالة" }
    ],
    dataModels: ["ChatMessage"],
    dependencies: ["@anthropic-ai/sdk"],
    accessLevel: "all"
  },
  {
    id: "nova-ai-dashboard",
    name: "Nova AI Dashboard",
    nameAr: "لوحة Nova AI",
    filePath: "client/src/pages/nova-ai-dashboard.tsx",
    description: "AI monitoring and management dashboard",
    descriptionAr: "لوحة مراقبة وإدارة الذكاء الاصطناعي",
    category: "ai",
    icon: "Brain",
    features: ["AI metrics", "Usage tracking", "Model management", "Performance monitoring"],
    featuresAr: ["مقاييس AI", "تتبع الاستخدام", "إدارة النماذج", "مراقبة الأداء"],
    apiEndpoints: [
      { method: "GET", path: "/api/nova/stats", description: "AI statistics", descriptionAr: "إحصائيات AI" }
    ],
    dataModels: ["AIModel", "AIUsage"],
    dependencies: ["recharts"],
    accessLevel: "owner"
  },
  {
    id: "nova-command",
    name: "Nova Command",
    nameAr: "أوامر Nova",
    filePath: "client/src/pages/nova-command.tsx",
    description: "Command palette for Nova AI",
    descriptionAr: "لوحة أوامر Nova AI",
    category: "ai",
    icon: "Terminal",
    features: ["Quick commands", "Keyboard shortcuts", "Command history"],
    featuresAr: ["أوامر سريعة", "اختصارات لوحة المفاتيح", "تاريخ الأوامر"],
    apiEndpoints: [],
    dataModels: [],
    dependencies: ["cmdk"],
    accessLevel: "all"
  },
  {
    id: "isds",
    name: "ISDS - AI Development System",
    nameAr: "ISDS - نظام تطوير الذكاء",
    filePath: "client/src/pages/isds/index.tsx",
    description: "Intelligent Software Development System",
    descriptionAr: "نظام تطوير البرمجيات الذكي",
    category: "ai",
    icon: "Cpu",
    features: ["AI commands", "Code execution", "Project generation", "Real-time feedback"],
    featuresAr: ["أوامر AI", "تنفيذ الكود", "توليد المشاريع", "استجابة فورية"],
    apiEndpoints: [
      { method: "POST", path: "/api/platform/ai/execute-command", description: "Execute AI command", descriptionAr: "تنفيذ أمر AI" }
    ],
    dataModels: ["ExecutionStep"],
    dependencies: ["@anthropic-ai/sdk"],
    accessLevel: "owner"
  },
  {
    id: "pricing",
    name: "Pricing",
    nameAr: "الأسعار",
    filePath: "client/src/pages/pricing.tsx",
    description: "Subscription plans and pricing",
    descriptionAr: "خطط الاشتراك والأسعار",
    category: "public",
    icon: "CreditCard",
    features: ["Plan comparison", "Feature list", "Subscription flow"],
    featuresAr: ["مقارنة الخطط", "قائمة المميزات", "تدفق الاشتراك"],
    apiEndpoints: [
      { method: "GET", path: "/api/plans", description: "Get plans", descriptionAr: "جلب الخطط" }
    ],
    dataModels: ["Plan"],
    dependencies: ["stripe"],
    accessLevel: "public"
  },
  {
    id: "subscription",
    name: "Subscription",
    nameAr: "الاشتراك",
    filePath: "client/src/pages/subscription.tsx",
    description: "Manage user subscription",
    descriptionAr: "إدارة اشتراك المستخدم",
    category: "billing",
    icon: "CreditCard",
    features: ["Current plan", "Upgrade/downgrade", "Billing history", "Cancel subscription"],
    featuresAr: ["الخطة الحالية", "ترقية/تخفيض", "تاريخ الفواتير", "إلغاء الاشتراك"],
    apiEndpoints: [
      { method: "GET", path: "/api/subscription", description: "Get subscription", descriptionAr: "جلب الاشتراك" },
      { method: "POST", path: "/api/subscription/cancel", description: "Cancel", descriptionAr: "إلغاء" }
    ],
    dataModels: ["Subscription"],
    dependencies: ["stripe"],
    accessLevel: "all"
  },
  {
    id: "invoices",
    name: "Invoices",
    nameAr: "الفواتير",
    filePath: "client/src/pages/invoices.tsx",
    description: "View and download invoices",
    descriptionAr: "عرض وتحميل الفواتير",
    category: "billing",
    icon: "Receipt",
    features: ["Invoice list", "PDF download", "Status tracking"],
    featuresAr: ["قائمة الفواتير", "تحميل PDF", "تتبع الحالة"],
    apiEndpoints: [
      { method: "GET", path: "/api/invoices", description: "List invoices", descriptionAr: "عرض الفواتير" }
    ],
    dataModels: ["Invoice"],
    dependencies: ["pdfkit"],
    accessLevel: "all"
  },
  {
    id: "payment-success",
    name: "Payment Success",
    nameAr: "نجاح الدفع",
    filePath: "client/src/pages/payment-success.tsx",
    description: "Payment confirmation page",
    descriptionAr: "صفحة تأكيد الدفع",
    category: "billing",
    icon: "CheckCircle",
    features: ["Success message", "Order details", "Next steps"],
    featuresAr: ["رسالة النجاح", "تفاصيل الطلب", "الخطوات التالية"],
    apiEndpoints: [],
    dataModels: [],
    dependencies: [],
    accessLevel: "all"
  },
  {
    id: "payment-cancel",
    name: "Payment Cancel",
    nameAr: "إلغاء الدفع",
    filePath: "client/src/pages/payment-cancel.tsx",
    description: "Payment cancellation page",
    descriptionAr: "صفحة إلغاء الدفع",
    category: "billing",
    icon: "XCircle",
    features: ["Cancel message", "Retry option"],
    featuresAr: ["رسالة الإلغاء", "خيار إعادة المحاولة"],
    apiEndpoints: [],
    dataModels: [],
    dependencies: [],
    accessLevel: "all"
  },
  {
    id: "settings",
    name: "Settings",
    nameAr: "الإعدادات",
    filePath: "client/src/pages/settings.tsx",
    description: "User account settings",
    descriptionAr: "إعدادات حساب المستخدم",
    category: "settings",
    icon: "Settings",
    features: ["Profile settings", "Security", "Notifications", "Preferences"],
    featuresAr: ["إعدادات الملف", "الأمان", "الإشعارات", "التفضيلات"],
    apiEndpoints: [
      { method: "GET", path: "/api/settings", description: "Get settings", descriptionAr: "جلب الإعدادات" },
      { method: "PATCH", path: "/api/settings", description: "Update settings", descriptionAr: "تحديث الإعدادات" }
    ],
    dataModels: ["UserSettings"],
    dependencies: [],
    accessLevel: "all"
  },
  {
    id: "user-builder",
    name: "User Builder",
    nameAr: "منشئ المستخدم",
    filePath: "client/src/pages/user-builder.tsx",
    description: "Simplified builder for regular users",
    descriptionAr: "منشئ مبسط للمستخدمين العاديين",
    category: "build",
    icon: "User",
    features: ["Simplified interface", "Quick start", "Templates"],
    featuresAr: ["واجهة مبسطة", "بدء سريع", "القوالب"],
    apiEndpoints: [],
    dataModels: [],
    dependencies: [],
    accessLevel: "all"
  },
  {
    id: "home",
    name: "Home Dashboard",
    nameAr: "لوحة التحكم الرئيسية",
    filePath: "client/src/pages/home.tsx",
    description: "Main dashboard for authenticated users",
    descriptionAr: "لوحة التحكم الرئيسية للمستخدمين",
    category: "core",
    icon: "Home",
    features: ["Project overview", "Quick actions", "Recent activity", "Templates"],
    featuresAr: ["نظرة على المشاريع", "إجراءات سريعة", "النشاط الأخير", "القوالب"],
    apiEndpoints: [],
    dataModels: ["Project"],
    dependencies: [],
    accessLevel: "all"
  },
  {
    id: "white-label",
    name: "White Label",
    nameAr: "العلامة البيضاء",
    filePath: "client/src/pages/white-label.tsx",
    description: "White label branding settings",
    descriptionAr: "إعدادات العلامة التجارية البيضاء",
    category: "admin",
    icon: "Palette",
    features: ["Custom branding", "Logo upload", "Color themes", "Domain mapping"],
    featuresAr: ["علامة تجارية مخصصة", "رفع الشعار", "سمات الألوان", "ربط النطاق"],
    apiEndpoints: [
      { method: "GET", path: "/api/white-label", description: "Get settings", descriptionAr: "جلب الإعدادات" },
      { method: "PATCH", path: "/api/white-label", description: "Update settings", descriptionAr: "تحديث الإعدادات" }
    ],
    dataModels: ["WhiteLabelConfig"],
    dependencies: [],
    accessLevel: "owner"
  },
  {
    id: "support",
    name: "Support",
    nameAr: "الدعم",
    filePath: "client/src/pages/support.tsx",
    description: "Customer support and help center",
    descriptionAr: "مركز الدعم والمساعدة",
    category: "public",
    icon: "HelpCircle",
    features: ["FAQ", "Ticket submission", "Live chat", "Documentation"],
    featuresAr: ["الأسئلة الشائعة", "إرسال تذكرة", "دردشة مباشرة", "التوثيق"],
    apiEndpoints: [
      { method: "POST", path: "/api/support/ticket", description: "Create ticket", descriptionAr: "إنشاء تذكرة" }
    ],
    dataModels: ["SupportTicket"],
    dependencies: [],
    accessLevel: "public"
  },
  {
    id: "preview",
    name: "Preview",
    nameAr: "المعاينة",
    filePath: "client/src/pages/preview.tsx",
    description: "Project preview page",
    descriptionAr: "صفحة معاينة المشروع",
    category: "build",
    icon: "Eye",
    features: ["Live preview", "Device simulation", "Share link"],
    featuresAr: ["معاينة مباشرة", "محاكاة الأجهزة", "رابط المشاركة"],
    apiEndpoints: [
      { method: "GET", path: "/api/preview/:code", description: "Get preview", descriptionAr: "جلب المعاينة" }
    ],
    dataModels: ["Project"],
    dependencies: [],
    accessLevel: "public"
  },
  {
    id: "about",
    name: "About",
    nameAr: "عن المنصة",
    filePath: "client/src/pages/about.tsx",
    description: "About INFERA WebNova",
    descriptionAr: "عن INFERA WebNova",
    category: "legal",
    icon: "Info",
    features: ["Company info", "Mission", "Team"],
    featuresAr: ["معلومات الشركة", "المهمة", "الفريق"],
    apiEndpoints: [],
    dataModels: [],
    dependencies: ["framer-motion"],
    accessLevel: "public"
  },
  {
    id: "terms",
    name: "Terms of Service",
    nameAr: "شروط الخدمة",
    filePath: "client/src/pages/terms.tsx",
    description: "Terms and conditions",
    descriptionAr: "الشروط والأحكام",
    category: "legal",
    icon: "FileText",
    features: ["Legal terms", "User agreement"],
    featuresAr: ["الشروط القانونية", "اتفاقية المستخدم"],
    apiEndpoints: [],
    dataModels: [],
    dependencies: [],
    accessLevel: "public"
  },
  {
    id: "privacy",
    name: "Privacy Policy",
    nameAr: "سياسة الخصوصية",
    filePath: "client/src/pages/privacy.tsx",
    description: "Privacy policy",
    descriptionAr: "سياسة الخصوصية",
    category: "legal",
    icon: "Shield",
    features: ["Data collection", "User rights", "GDPR compliance"],
    featuresAr: ["جمع البيانات", "حقوق المستخدم", "امتثال GDPR"],
    apiEndpoints: [],
    dataModels: [],
    dependencies: [],
    accessLevel: "public"
  },
  {
    id: "refund",
    name: "Refund Policy",
    nameAr: "سياسة الاسترداد",
    filePath: "client/src/pages/refund.tsx",
    description: "Refund and cancellation policy",
    descriptionAr: "سياسة الاسترداد والإلغاء",
    category: "legal",
    icon: "RefreshCw",
    features: ["Refund terms", "Process"],
    featuresAr: ["شروط الاسترداد", "العملية"],
    apiEndpoints: [],
    dataModels: [],
    dependencies: [],
    accessLevel: "public"
  },
  {
    id: "contact",
    name: "Contact",
    nameAr: "اتصل بنا",
    filePath: "client/src/pages/contact.tsx",
    description: "Contact information and form",
    descriptionAr: "معلومات الاتصال والنموذج",
    category: "legal",
    icon: "Mail",
    features: ["Contact form", "Email channels", "Response times"],
    featuresAr: ["نموذج الاتصال", "قنوات البريد", "أوقات الاستجابة"],
    apiEndpoints: [
      { method: "POST", path: "/api/contact", description: "Send message", descriptionAr: "إرسال رسالة" }
    ],
    dataModels: [],
    dependencies: ["framer-motion"],
    accessLevel: "public"
  },
  {
    id: "not-found",
    name: "404 Not Found",
    nameAr: "404 غير موجود",
    filePath: "client/src/pages/not-found.tsx",
    description: "Error page for missing routes",
    descriptionAr: "صفحة خطأ للمسارات المفقودة",
    category: "system",
    icon: "AlertTriangle",
    features: ["Error message", "Navigation help"],
    featuresAr: ["رسالة الخطأ", "مساعدة التنقل"],
    apiEndpoints: [],
    dataModels: [],
    dependencies: [],
    accessLevel: "public"
  },
  {
    id: "owner-spom",
    name: "SPOM - Platform Operations",
    nameAr: "SPOM - عمليات المنصة",
    filePath: "client/src/pages/owner/spom.tsx",
    description: "Sovereign Platform Operations Manager",
    descriptionAr: "مدير عمليات المنصة السيادية",
    category: "admin",
    icon: "Activity",
    features: ["Operations monitoring", "System health", "Alerts"],
    featuresAr: ["مراقبة العمليات", "صحة النظام", "التنبيهات"],
    apiEndpoints: [],
    dataModels: [],
    dependencies: [],
    accessLevel: "owner"
  },
  {
    id: "owner-ai-capability-control",
    name: "AI Capability Control",
    nameAr: "التحكم بقدرات AI",
    filePath: "client/src/pages/owner/ai-capability-control.tsx",
    description: "Control AI model capabilities and permissions",
    descriptionAr: "التحكم بقدرات وصلاحيات نماذج AI",
    category: "ai",
    icon: "Sliders",
    features: ["Model permissions", "Capability limits", "Usage controls"],
    featuresAr: ["صلاحيات النماذج", "حدود القدرات", "ضوابط الاستخدام"],
    apiEndpoints: [],
    dataModels: ["AICapability"],
    dependencies: [],
    accessLevel: "owner"
  },
  {
    id: "owner-assistant-governance",
    name: "Assistant Governance",
    nameAr: "حوكمة المساعدين",
    filePath: "client/src/pages/owner/assistant-governance.tsx",
    description: "Manage AI assistant policies and governance",
    descriptionAr: "إدارة سياسات وحوكمة مساعدي AI",
    category: "ai",
    icon: "Scale",
    features: ["Policy management", "Approval chains", "Audit trail"],
    featuresAr: ["إدارة السياسات", "سلاسل الموافقة", "سجل التدقيق"],
    apiEndpoints: [],
    dataModels: ["AssistantPolicy"],
    dependencies: [],
    accessLevel: "owner"
  },
  {
    id: "owner-nova-permissions",
    name: "Nova Permissions",
    nameAr: "صلاحيات Nova",
    filePath: "client/src/pages/owner/nova-permissions.tsx",
    description: "64-permission system for Nova AI",
    descriptionAr: "نظام 64 صلاحية لـ Nova AI",
    category: "security",
    icon: "Key",
    features: ["64 granular permissions", "Role mapping", "Permission inheritance"],
    featuresAr: ["64 صلاحية دقيقة", "ربط الأدوار", "توريث الصلاحيات"],
    apiEndpoints: [],
    dataModels: ["NovaPermission"],
    dependencies: [],
    accessLevel: "owner"
  },
  {
    id: "owner-dynamic-control",
    name: "Dynamic Control",
    nameAr: "التحكم الديناميكي",
    filePath: "client/src/pages/owner/dynamic-control.tsx",
    description: "Dynamic platform configuration",
    descriptionAr: "تكوين المنصة الديناميكي",
    category: "admin",
    icon: "Wrench",
    features: ["Feature flags", "Dynamic settings", "A/B testing"],
    featuresAr: ["أعلام الميزات", "إعدادات ديناميكية", "اختبار A/B"],
    apiEndpoints: [],
    dataModels: ["DynamicConfig"],
    dependencies: [],
    accessLevel: "owner"
  },
  {
    id: "technical-documentation",
    name: "Technical Documentation",
    nameAr: "التوثيق التقني",
    filePath: "client/src/pages/technical-documentation.tsx",
    description: "Platform technical documentation viewer",
    descriptionAr: "عارض التوثيق التقني للمنصة",
    category: "admin",
    icon: "FileText",
    features: ["Page documentation", "API endpoints", "Export to Markdown/PDF/ZIP"],
    featuresAr: ["توثيق الصفحات", "نقاط API", "تصدير Markdown/PDF/ZIP"],
    apiEndpoints: [],
    dataModels: ["PageDoc"],
    dependencies: ["jszip"],
    accessLevel: "owner"
  }
];

export const categoryLabels: Record<string, { en: string; ar: string }> = {
  core: { en: "Core", ar: "الأساسية" },
  admin: { en: "Administration", ar: "الإدارة" },
  security: { en: "Security", ar: "الأمان" },
  ai: { en: "AI & Nova", ar: "الذكاء الاصطناعي" },
  build: { en: "Build", ar: "البناء" },
  billing: { en: "Billing", ar: "الفوترة" },
  settings: { en: "Settings", ar: "الإعدادات" },
  public: { en: "Public Pages", ar: "الصفحات العامة" },
  legal: { en: "Legal", ar: "قانونية" },
  system: { en: "System", ar: "النظام" }
};
