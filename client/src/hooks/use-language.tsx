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
  "nav.projects": { ar: "مشاريعي", en: "My Projects" },
  "nav.templates": { ar: "القوالب", en: "Templates" },
  "nav.newProject": { ar: "مشروع جديد", en: "New Project" },
  
  // Home page
  "home.title": { ar: "ابنِ موقعك الآن بالذكاء الاصطناعي", en: "Build Your Website with AI" },
  "home.subtitle": { ar: "صِف موقعك وشاهد الذكاء الاصطناعي يحوله إلى حقيقة", en: "Describe your website and watch AI bring it to life" },
  "home.placeholder": { ar: "اطلب من الذكاء الاصطناعي بناء موقعك...", en: "Ask AI to build your website..." },
  "home.badge": { ar: "المنصة الأولى في منظومة INFERA", en: "The First Platform in INFERA Ecosystem" },
  "home.recent": { ar: "الأخيرة", en: "Recent" },
  "home.myProjects": { ar: "مشاريعي", en: "My Projects" },
  "home.templates": { ar: "القوالب", en: "Templates" },
  "home.noTemplates": { ar: "لا توجد قوالب متاحة حالياً", en: "No templates available yet" },
  
  // Suggestions
  "suggestion.landing": { ar: "أنشئ صفحة هبوط لمنتج تقني", en: "Create a landing page for a tech product" },
  "suggestion.portfolio": { ar: "صمم موقع شخصي احترافي", en: "Build a professional portfolio" },
  "suggestion.restaurant": { ar: "أنشئ صفحة مطعم مع القائمة", en: "Design a restaurant menu page" },
  "suggestion.ecommerce": { ar: "صمم متجر إلكتروني", en: "Create an e-commerce store" },
  
  // Builder
  "builder.newProject": { ar: "مشروع جديد", en: "New Project" },
  "builder.save": { ar: "حفظ", en: "Save" },
  "builder.saved": { ar: "تم حفظ المشروع!", en: "Project saved!" },
  "builder.saveFailed": { ar: "فشل في حفظ المشروع", en: "Failed to save project" },
  "builder.generateFailed": { ar: "فشل في التوليد", en: "Generation failed" },
  "builder.tryAgain": { ar: "حاول مرة أخرى", en: "Please try again" },
  "builder.describePlaceholder": { ar: "صِف ما تريد تغييره...", en: "Describe what you want to change..." },
  "builder.startConversation": { ar: "ابدأ محادثة", en: "Start a conversation" },
  "builder.startDescription": { ar: "صِف الموقع الذي تريد بناءه وسيساعدك الذكاء الاصطناعي في إنشائه", en: "Describe the website you want to build and AI will help you create it" },
  
  // Empty states
  "empty.noProjects": { ar: "لا توجد مشاريع بعد", en: "No projects yet" },
  "empty.noProjectsDesc": { ar: "ابدأ بناء موقعك الأول بمساعدة الذكاء الاصطناعي. فقط صِف ما تريد!", en: "Start building your first website with AI assistance. Just describe what you want!" },
  "empty.createProject": { ar: "إنشاء مشروع جديد", en: "Create New Project" },
  
  // Auth
  "auth.welcome": { ar: "مرحباً بك في INFERA WebNova", en: "Welcome to INFERA WebNova" },
  "auth.subtitle": { ar: "منصة بناء المواقع الذكية بالذكاء الاصطناعي", en: "The intelligent AI-powered website builder" },
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
