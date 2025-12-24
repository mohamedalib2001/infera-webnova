// INFERA Visual Identity - Core Rules
// الهوية البصرية لـ INFERA - القواعد الأساسية

export interface VisualRule {
  id: string;
  label: string;
  labelAr: string;
  value: string;
  valueAr: string;
}

export interface VisualIdentitySection {
  id: string;
  title: string;
  titleAr: string;
  items: VisualRule[];
}

export const visualIdentityMeta = {
  title: "Visual Identity",
  titleAr: "الهوية البصرية",
  subtitle: "INFERA Global Visual Identity Rules",
  subtitleAr: "قواعد الهوية البصرية العالمية لـ INFERA"
};

export const visualIdentityIntro = {
  statement: "Mandatory framework before any icon, visual element, or design asset creation within the INFERA ecosystem.",
  statementAr: "الإطار العام الإلزامي قبل أي أيقونة أو عنصر بصري أو تصميم ضمن منظومة INFERA."
};

export const coreStyle = {
  title: "Core Style",
  titleAr: "النمط الأساسي",
  values: [
    { en: "Sovereign", ar: "سيادي" },
    { en: "Futuristic", ar: "مستقبلي" },
    { en: "Minimal", ar: "بسيط" },
    { en: "Timeless", ar: "خالد" }
  ]
};

export const avoidStyles = {
  title: "Styles to Avoid",
  titleAr: "الأنماط المحظورة",
  values: [
    { en: "Cartoon", ar: "كرتوني" },
    { en: "Playful", ar: "مرح" },
    { en: "Over-detailed", ar: "مفرط التفاصيل" },
    { en: "Trendy", ar: "موضة مؤقتة" }
  ]
};

export const visualRules: VisualRule[] = [
  {
    id: "geometry",
    label: "Geometry",
    labelAr: "الهندسة",
    value: "Clean, symmetric, confident shapes",
    valueAr: "أشكال نظيفة، متناظرة، واثقة"
  },
  {
    id: "feeling",
    label: "Feeling",
    labelAr: "الشعور",
    value: "Authority, Intelligence, Control, Trust",
    valueAr: "السلطة، الذكاء، التحكم، الثقة"
  },
  {
    id: "complexity",
    label: "Complexity",
    labelAr: "التعقيد",
    value: "Medium–Low (icons must work at 16px)",
    valueAr: "متوسط–منخفض (الأيقونات تعمل عند 16px)"
  },
  {
    id: "3d-effects",
    label: "3D Effects",
    labelAr: "تأثيرات ثلاثية الأبعاد",
    value: "Allowed but subtle (no gloss, no plastic)",
    valueAr: "مسموحة لكن بشكل خفيف (بدون لمعان، بدون بلاستيك)"
  },
  {
    id: "gradients",
    label: "Gradients",
    labelAr: "التدرجات اللونية",
    value: "Dark-tech gradients only",
    valueAr: "تدرجات تقنية داكنة فقط"
  },
  {
    id: "typography",
    label: "Typography in Icons",
    labelAr: "النصوص في الأيقونات",
    value: "Forbidden",
    valueAr: "محظور"
  }
];

export const colorPalette = {
  title: "Color Palette",
  titleAr: "لوحة الألوان",
  primary: {
    name: "Electric Orange",
    nameAr: "البرتقالي الكهربائي",
    hex: "#FF6B35",
    usage: "Primary accent, CTAs, highlights",
    usageAr: "اللون الأساسي، الأزرار، التمييز"
  },
  secondary: {
    name: "Dark Navy",
    nameAr: "الكحلي الداكن",
    hex: "#0A1628",
    usage: "Backgrounds, depth, authority",
    usageAr: "الخلفيات، العمق، السلطة"
  },
  accent: {
    name: "Sovereign Blue",
    nameAr: "الأزرق السيادي",
    hex: "#1E3A5F",
    usage: "Secondary elements, borders",
    usageAr: "العناصر الثانوية، الحدود"
  },
  neutral: {
    name: "Steel Gray",
    nameAr: "الرمادي الفولاذي",
    hex: "#4A5568",
    usage: "Text, subtle elements",
    usageAr: "النصوص، العناصر الخفيفة"
  }
};

export const iconGuidelines = {
  title: "Icon Guidelines",
  titleAr: "إرشادات الأيقونات",
  rules: [
    {
      rule: "Must work at 16px minimum",
      ruleAr: "يجب أن تعمل عند 16 بكسل كحد أدنى"
    },
    {
      rule: "Consistent stroke width across all icons",
      ruleAr: "سماكة خط ثابتة عبر جميع الأيقونات"
    },
    {
      rule: "No decorative elements",
      ruleAr: "بدون عناصر زخرفية"
    },
    {
      rule: "Optical alignment over mathematical",
      ruleAr: "المحاذاة البصرية فوق الرياضية"
    },
    {
      rule: "Single color or approved gradients only",
      ruleAr: "لون واحد أو تدرجات معتمدة فقط"
    }
  ]
};

export const brandPersonality = {
  title: "Brand Personality",
  titleAr: "شخصية العلامة",
  traits: [
    { trait: "Authoritative", traitAr: "موثوقة" },
    { trait: "Intelligent", traitAr: "ذكية" },
    { trait: "Controlled", traitAr: "منضبطة" },
    { trait: "Trustworthy", traitAr: "جديرة بالثقة" },
    { trait: "Futuristic", traitAr: "مستقبلية" },
    { trait: "Sovereign", traitAr: "سيادية" }
  ]
};
