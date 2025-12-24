import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  FileUser, 
  Sparkles,
  Download,
  QrCode,
  Languages,
  Mic,
  Palette,
  Star,
  Briefcase,
  GraduationCap,
  Award,
  CheckCircle2,
  ArrowRight,
  User,
  FileText,
  Zap,
  Brain,
  Layout,
} from "lucide-react";

export default function CVBuilderLanding() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [buildStep, setBuildStep] = useState(0);
  const [templateIndex, setTemplateIndex] = useState(0);

  const buildSteps = [
    { icon: User, label: isRtl ? "المعلومات الشخصية" : "Personal Info" },
    { icon: Briefcase, label: isRtl ? "الخبرات" : "Experience" },
    { icon: GraduationCap, label: isRtl ? "التعليم" : "Education" },
    { icon: Star, label: isRtl ? "المهارات" : "Skills" },
  ];

  const templates = ["modern", "classic", "creative", "minimal"];

  useEffect(() => {
    const interval = setInterval(() => {
      setBuildStep(prev => (prev + 1) % buildSteps.length);
      if (buildStep === buildSteps.length - 1) {
        setTemplateIndex(prev => (prev + 1) % templates.length);
      }
    }, 1800);
    return () => clearInterval(interval);
  }, [buildStep, buildSteps.length, templates.length]);

  const t = {
    hero: {
      badge: isRtl ? "إنشاء السير الذاتية الذكي" : "Intelligent CV Creation",
      title: isRtl ? "INFERA CV Builder™" : "INFERA CV Builder™",
      subtitle: isRtl 
        ? "سيرتك الذاتية... بذكاء"
        : "Your CV. Built Intelligently.",
      description: isRtl
        ? "منصة ذكية سيادية لإنشاء السير الذاتية بمستوى احترافي عالمي مع دعم الذكاء الاصطناعي ومعايير عالمية."
        : "A sovereign intelligent CV creation platform that builds professional resumes with AI assistance and global standards.",
      cta: isRtl ? "ابدأ بناء سيرتك" : "Start Building Your CV",
    },
    stats: [
      { label: isRtl ? "سير ذاتية منشأة" : "CVs Created", value: "245K+", icon: FileUser },
      { label: isRtl ? "قوالب احترافية" : "Pro Templates", value: "50+", icon: Layout },
      { label: isRtl ? "لغات مدعومة" : "Languages", value: "25+", icon: Languages },
      { label: isRtl ? "معدل النجاح" : "Success Rate", value: "94%", icon: Award },
    ],
    sections: [
      {
        icon: User,
        title: isRtl ? "بناء الملف الشخصي" : "Profile Builder",
        description: isRtl 
          ? "أدخل مهاراتك وخبراتك واتركنا نبني سيرتك الذاتية تلقائياً."
          : "Enter your skills and experience and let us build your CV automatically.",
        features: [
          { icon: Briefcase, label: isRtl ? "الخبرات العملية" : "Work Experience" },
          { icon: Star, label: isRtl ? "المهارات" : "Skills & Abilities" },
          { icon: GraduationCap, label: isRtl ? "التعليم" : "Education" },
        ],
        color: "from-blue-600 to-cyan-700",
      },
      {
        icon: Palette,
        title: isRtl ? "اختيار القوالب" : "Template Selection",
        description: isRtl
          ? "اختر من بين قوالب احترافية متعددة تناسب مجالك."
          : "Choose from multiple professional templates that suit your field.",
        features: [
          { icon: Layout, label: isRtl ? "تصاميم احترافية" : "Professional Designs" },
          { icon: Sparkles, label: isRtl ? "قوالب حديثة" : "Modern Templates" },
          { icon: FileText, label: isRtl ? "تنسيقات متعددة" : "Multiple Formats" },
        ],
        color: "from-violet-600 to-purple-700",
      },
      {
        icon: Brain,
        title: isRtl ? "تحسين AI" : "AI Optimization",
        description: isRtl
          ? "تحسين المحتوى تلقائياً باستخدام الذكاء الاصطناعي."
          : "Automatic content enhancement using artificial intelligence.",
        features: [
          { icon: Sparkles, label: isRtl ? "تحسين المحتوى" : "Content Enhancement" },
          { icon: Mic, label: isRtl ? "أوامر صوتية" : "Voice Commands" },
          { icon: Zap, label: isRtl ? "اقتراحات ذكية" : "Smart Suggestions" },
        ],
        color: "from-emerald-600 to-green-700",
      },
      {
        icon: Download,
        title: isRtl ? "التصدير والمشاركة" : "Export & Share",
        description: isRtl
          ? "صدّر سيرتك بصيغة PDF أو شاركها عبر رمز QR."
          : "Export your CV as PDF or share it via QR code.",
        features: [
          { icon: FileText, label: isRtl ? "تصدير PDF" : "PDF Export" },
          { icon: QrCode, label: isRtl ? "رمز QR" : "QR Code" },
          { icon: Languages, label: isRtl ? "متعدد اللغات" : "Multi-language" },
        ],
        color: "from-amber-600 to-orange-700",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-background to-violet-950/20" />
        
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[15%] right-[8%] w-56 rounded-xl bg-card/30 backdrop-blur-sm border border-border/50 p-4">
            <div className="text-xs text-muted-foreground mb-3">{isRtl ? "بناء السيرة الذاتية" : "CV Building"}</div>
            {buildSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = buildStep >= index;
              const isCurrent = buildStep === index;
              return (
                <motion.div
                  key={index}
                  className={`flex items-center gap-3 p-2 rounded-lg mb-2 transition-all duration-500 ${
                    isActive 
                      ? 'bg-blue-500/20 border border-blue-500/50' 
                      : 'bg-muted/20'
                  } ${isCurrent ? 'scale-105' : ''}`}
                  animate={{ x: isCurrent ? 5 : 0 }}
                >
                  <div className={`p-1.5 rounded-lg ${isActive ? 'bg-blue-500' : 'bg-muted/50'}`}>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
                  </div>
                  <span className={`text-sm ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                  {isActive && !isCurrent && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />
                  )}
                </motion.div>
              );
            })}
          </div>

          <div className="absolute left-[8%] top-1/2 -translate-y-1/2">
            <div className="relative">
              <motion.div
                className="w-40 h-56 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 p-3 shadow-xl"
                animate={{ 
                  borderColor: ['hsl(var(--border))', 'hsl(221, 83%, 53%)', 'hsl(var(--border))']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 mx-auto mb-2" />
                <div className="h-2 bg-muted/50 rounded w-3/4 mx-auto mb-1" />
                <div className="h-1.5 bg-muted/30 rounded w-1/2 mx-auto mb-3" />
                <div className="space-y-1">
                  {[1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      className="h-1.5 bg-muted/40 rounded"
                      animate={{ width: buildStep >= i - 1 ? '100%' : '0%' }}
                      transition={{ duration: 0.5 }}
                    />
                  ))}
                </div>
                <div className="absolute bottom-2 right-2 text-xs font-medium text-blue-400">
                  {templates[templateIndex]}
                </div>
              </motion.div>
            </div>
          </div>

          <motion.div
            className="absolute right-[10%] bottom-[20%] p-4 rounded-xl bg-card/30 backdrop-blur-sm border border-border/50"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <QrCode className="w-16 h-16 text-violet-400" />
            <p className="text-xs text-center mt-2 text-muted-foreground">{isRtl ? "مشاركة QR" : "QR Share"}</p>
          </motion.div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
          <div className="text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge 
                variant="outline" 
                className="px-6 py-2.5 text-sm border-blue-500/50 bg-blue-500/10 backdrop-blur-sm"
              >
                <FileUser className="w-4 h-4 mr-2 text-blue-400" />
                <span className="text-blue-400 font-medium">{t.hero.badge}</span>
              </Badge>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-4"
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-none">
                <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  {t.hero.title}
                </span>
              </h1>
              <p className="text-2xl md:text-3xl lg:text-4xl font-light text-muted-foreground">
                {t.hero.subtitle}
              </p>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed"
            >
              {t.hero.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Button 
                size="lg"
                className="gap-3 px-10 py-7 text-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 shadow-lg shadow-blue-500/25"
                onClick={() => setLocation("/sovereign-workspace")}
                data-testid="button-start-cvbuilder"
              >
                <FileUser className="w-5 h-5" />
                {t.hero.cta}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto"
          >
            {t.stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={i}
                  className="relative p-4 rounded-xl bg-card/30 backdrop-blur-sm border border-border/50 text-center"
                >
                  <Icon className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {isRtl ? "قدرات بناء السيرة الذاتية" : "CV Building Capabilities"}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {t.sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <Card 
                  key={index}
                  className="group hover-elevate border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
                >
                  <CardHeader className={`bg-gradient-to-r ${section.color} text-white`}>
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-white/20">
                        <Icon className="w-7 h-7" />
                      </div>
                      <CardTitle className="text-xl">{section.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <p className="text-muted-foreground">{section.description}</p>
                    <div className="flex flex-wrap gap-3">
                      {section.features.map((feature, fi) => {
                        const FeatureIcon = feature.icon;
                        return (
                          <div 
                            key={fi}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50"
                          >
                            <FeatureIcon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{feature.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzIiBjeT0iMyIgcj0iMyIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="relative max-w-4xl mx-auto px-4 text-center text-white">
          <FileUser className="w-16 h-16 mx-auto mb-6 opacity-80" />
          <p className="text-2xl md:text-3xl font-bold mb-4">
            {isRtl ? "السيرة الذاتية هنا لا تُكتب... بل تُبنى بذكاء" : "CVs aren't written here... they're built intelligently"}
          </p>
          <Button 
            size="lg"
            variant="secondary"
            className="gap-3 px-10 py-8 text-xl shadow-2xl mt-8"
            onClick={() => setLocation("/sovereign-workspace")}
            data-testid="button-final-cvbuilder-cta"
          >
            <Sparkles className="w-6 h-6" />
            {t.hero.cta}
          </Button>
        </div>
      </section>
    </div>
  );
}
