import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "ar" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRtl: boolean;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // Navigation
  "nav.home": { ar: "الرئيسية", en: "Home" },
  "nav.projects": { ar: "منصاتي", en: "My Platforms" },
  "nav.templates": { ar: "النماذج السيادية", en: "Sovereign Templates" },
  "nav.newProject": { ar: "منصة جديدة", en: "New Platform" },
  "nav.blueprints": { ar: "المخططات الذكية", en: "Smart Blueprints" },
  "nav.governance": { ar: "التحكم الذاتي", en: "Autonomous Governance" },
  
  // Home page - Sovereign Platform OS
  "home.title": { ar: "نظام التشغيل الذكي للمنصات السيادية", en: "Intelligent OS for Sovereign Platforms" },
  "home.subtitle": { ar: "صِف متطلبات منصتك المستقلة وشاهد النظام الذكي يبنيها ويديرها ذاتياً", en: "Describe your sovereign platform requirements and watch the AI system build and operate it autonomously" },
  "home.placeholder": { ar: "صِف مواصفات المنصة السيادية المطلوبة...", en: "Describe your sovereign platform specifications..." },
  "home.badge": { ar: "نظام التشغيل الأساسي - INFERA Core OS", en: "Core Operating System - INFERA Core OS" },
  "home.recent": { ar: "المنصات النشطة", en: "Active Platforms" },
  "home.myProjects": { ar: "منصاتي", en: "My Platforms" },
  "home.templates": { ar: "النماذج السيادية", en: "Sovereign Templates" },
  "home.noTemplates": { ar: "لا توجد نماذج سيادية متاحة حالياً", en: "No sovereign templates available yet" },
  "home.activePlatforms": { ar: "المنصات النشطة", en: "Active Platforms" },
  "home.blueprints": { ar: "المخططات الذكية", en: "Smart Blueprints" },
  "home.autonomousOps": { ar: "التشغيل الذاتي", en: "Autonomous Operations" },
  
  // Sovereign Platform Suggestions
  "suggestion.landing": { ar: "منصة خدمات مالية رقمية متوافقة مع PCI-DSS", en: "Digital financial services platform (PCI-DSS compliant)" },
  "suggestion.portfolio": { ar: "نظام رعاية صحية ذكي متوافق مع HIPAA", en: "Smart healthcare system (HIPAA compliant)" },
  "suggestion.restaurant": { ar: "بوابة حكومية إلكترونية متوافقة مع WCAG 2.1", en: "E-Government portal (WCAG 2.1 compliant)" },
  "suggestion.ecommerce": { ar: "منصة تعليمية ذكية متعددة المستأجرين", en: "Multi-tenant smart education platform" },
  
  // Sovereign Domains
  "domain.financial": { ar: "مالي", en: "Financial" },
  "domain.healthcare": { ar: "صحي", en: "Healthcare" },
  "domain.government": { ar: "حكومي", en: "Government" },
  "domain.education": { ar: "تعليمي", en: "Education" },
  "domain.enterprise": { ar: "مؤسسي", en: "Enterprise" },
  
  // Compliance Standards
  "compliance.pcidss": { ar: "PCI-DSS", en: "PCI-DSS" },
  "compliance.hipaa": { ar: "HIPAA", en: "HIPAA" },
  "compliance.gdpr": { ar: "GDPR", en: "GDPR" },
  "compliance.wcag": { ar: "WCAG 2.1", en: "WCAG 2.1" },
  "compliance.iso27001": { ar: "ISO 27001", en: "ISO 27001" },
  
  // Platform Status
  "status.active": { ar: "نشطة", en: "Active" },
  "status.deploying": { ar: "جاري النشر", en: "Deploying" },
  "status.monitoring": { ar: "تحت المراقبة", en: "Monitoring" },
  "status.selfHealing": { ar: "شفاء ذاتي", en: "Self-Healing" },
  "status.evolving": { ar: "تطور ذاتي", en: "Self-Evolving" },
  
  // Platform Builder (Previously Website Builder)
  "builder.newProject": { ar: "منصة جديدة", en: "New Platform" },
  "builder.save": { ar: "حفظ", en: "Save" },
  "builder.saved": { ar: "تم حفظ المنصة!", en: "Platform saved!" },
  "builder.saveFailed": { ar: "فشل في حفظ المنصة", en: "Failed to save platform" },
  "builder.generateFailed": { ar: "فشل في التوليد", en: "Generation failed" },
  "builder.tryAgain": { ar: "حاول مرة أخرى", en: "Please try again" },
  "builder.describePlaceholder": { ar: "صِف متطلبات المنصة أو التعديلات المطلوبة...", en: "Describe platform requirements or modifications..." },
  "builder.startConversation": { ar: "ابدأ تصميم المنصة", en: "Start Platform Design" },
  "builder.startDescription": { ar: "صِف المنصة السيادية المطلوبة وسيقوم النظام الذكي ببنائها وتشغيلها ذاتياً", en: "Describe the sovereign platform you need and the AI system will build and operate it autonomously" },
  "builder.cancelled": { ar: "تم الإلغاء", en: "Cancelled" },
  "builder.generationCancelled": { ar: "تم إيقاف عملية التوليد", en: "Generation has been stopped" },
  
  // Orchestration Flow
  "orchestration.analyzing": { ar: "تحليل المتطلبات...", en: "Analyzing requirements..." },
  "orchestration.planning": { ar: "تخطيط البنية المعمارية...", en: "Planning architecture..." },
  "orchestration.generating": { ar: "توليد الكود السيادي...", en: "Generating sovereign code..." },
  "orchestration.deploying": { ar: "نشر وتشغيل المنصة...", en: "Deploying platform..." },
  "orchestration.monitoring": { ar: "بدء المراقبة الذاتية...", en: "Starting autonomous monitoring..." },
  
  // Empty states
  "empty.noProjects": { ar: "لا توجد منصات بعد", en: "No platforms yet" },
  "empty.noProjectsDesc": { ar: "ابدأ بتصميم منصتك السيادية الأولى. صِف متطلباتك وسيقوم النظام ببنائها وإدارتها ذاتياً!", en: "Start designing your first sovereign platform. Describe your requirements and the system will build and manage it autonomously!" },
  "empty.createProject": { ar: "تصميم منصة جديدة", en: "Design New Platform" },
  
  // Auth
  "auth.welcome": { ar: "مرحباً بك في INFERA WebNova", en: "Welcome to INFERA WebNova" },
  "auth.subtitle": { ar: "نظام التشغيل الذكي للمنصات الرقمية السيادية", en: "Intelligent Operating System for Sovereign Digital Platforms" },
  "auth.login": { ar: "تسجيل الدخول", en: "Login" },
  "auth.register": { ar: "إنشاء حساب", en: "Register" },
  "auth.email": { ar: "البريد الإلكتروني", en: "Email" },
  "auth.password": { ar: "كلمة المرور", en: "Password" },
  "auth.username": { ar: "اسم المستخدم", en: "Username" },
  "auth.fullName": { ar: "الاسم الكامل (اختياري)", en: "Full Name (optional)" },
  "auth.loginBtn": { ar: "دخول", en: "Sign In" },
  "auth.registerBtn": { ar: "إنشاء حساب جديد", en: "Create Account" },
  "auth.loginSuccess": { ar: "تم تسجيل الدخول بنجاح", en: "Login successful" },
  "auth.registerSuccess": { ar: "تم إنشاء الحساب بنجاح", en: "Account created successfully" },
  "auth.error": { ar: "حدث خطأ", en: "An error occurred" },
  "auth.logout": { ar: "تسجيل الخروج", en: "Logout" },
  "auth.or": { ar: "أو", en: "or" },
  "auth.continueWith": { ar: "المتابعة باستخدام", en: "Continue with" },
  "auth.comingSoon": { ar: "قريباً", en: "Coming Soon" },
  "auth.google": { ar: "Google", en: "Google" },
  "auth.github": { ar: "GitHub", en: "GitHub" },
  "auth.apple": { ar: "Apple", en: "Apple" },
  "auth.otp": { ar: "التحقق بخطوتين", en: "Two-Factor Auth" },
  "auth.otpSent": { ar: "تم إرسال رمز التحقق إلى بريدك الإلكتروني", en: "Verification code sent to your email" },
  "auth.enterOtp": { ar: "أدخل رمز التحقق", en: "Enter verification code" },
  "auth.verifyOtp": { ar: "تحقق", en: "Verify" },
  "auth.resendOtp": { ar: "إعادة إرسال الرمز", en: "Resend code" },
  "auth.emailOtp": { ar: "رمز البريد", en: "Email Code" },
  "auth.authenticatorApp": { ar: "تطبيق المصادقة", en: "Authenticator App" },
  "auth.authenticatorDesc": { ar: "أدخل الرمز من تطبيق Google Authenticator أو أي تطبيق مصادقة آخر", en: "Enter the code from Google Authenticator or any other authenticator app" },
  "auth.scanQr": { ar: "امسح رمز QR باستخدام تطبيق المصادقة", en: "Scan QR code with your authenticator app" },
  "auth.backToLogin": { ar: "العودة لتسجيل الدخول", en: "Back to login" },
  
  // Sidebar
  "sidebar.free": { ar: "مجاني", en: "Free" },
  
  // Common
  "common.loading": { ar: "جاري التحميل...", en: "Loading..." },
  "common.error": { ar: "حدث خطأ", en: "An error occurred" },
  "common.generating": { ar: "جاري الإنشاء", en: "Generating" },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("infera-language");
      return (saved as Language) || "ar";
    }
    return "ar";
  });

  useEffect(() => {
    localStorage.setItem("infera-language", language);
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRtl: language === "ar", t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
