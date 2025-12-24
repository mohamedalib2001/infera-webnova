import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  GraduationCap, 
  Target,
  TrendingUp,
  Award,
  BookOpen,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Star,
  Sparkles,
  Zap,
  Brain,
  Users,
  Clock,
  Play,
  Trophy,
} from "lucide-react";

export default function TrainAILanding() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [skillLevel, setSkillLevel] = useState(0);
  const [courseStep, setCourseStep] = useState(0);

  const skills = [
    { name: isRtl ? "القيادة" : "Leadership", level: 85, color: "from-blue-500 to-cyan-500" },
    { name: isRtl ? "التواصل" : "Communication", level: 72, color: "from-violet-500 to-purple-500" },
    { name: isRtl ? "التقنية" : "Technical", level: 90, color: "from-emerald-500 to-green-500" },
  ];

  const trainingPath = [
    { icon: Target, label: isRtl ? "التقييم" : "Assessment" },
    { icon: BookOpen, label: isRtl ? "الدورة" : "Course" },
    { icon: Play, label: isRtl ? "التطبيق" : "Practice" },
    { icon: Trophy, label: isRtl ? "الشهادة" : "Certificate" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setSkillLevel(prev => (prev + 1) % 101);
      setCourseStep(prev => (prev + 1) % trainingPath.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [trainingPath.length]);

  const t = {
    hero: {
      badge: isRtl ? "التدريب الذكي" : "Intelligent Training",
      title: isRtl ? "INFERA TrainAI™" : "INFERA TrainAI™",
      subtitle: isRtl 
        ? "تدريب يصنع الفارق"
        : "Training That Makes Impact",
      description: isRtl
        ? "منصة تدريب ذكي سيادي مصممة لتطوير مهارات موظفي الشركات بناءً على الأداء والاحتياجات الفعلية."
        : "A sovereign intelligent training platform designed to upskill employees based on performance and real needs.",
      cta: isRtl ? "ابدأ التدريب الذكي" : "Start Smart Training",
    },
    stats: [
      { label: isRtl ? "دورات متاحة" : "Available Courses", value: "2,450+", icon: BookOpen },
      { label: isRtl ? "متدربين" : "Trainees", value: "89K+", icon: Users },
      { label: isRtl ? "شهادات" : "Certificates", value: "45K+", icon: Award },
      { label: isRtl ? "نسبة الإكمال" : "Completion Rate", value: "94%", icon: TrendingUp },
    ],
    sections: [
      {
        icon: Target,
        title: isRtl ? "تقييم المهارات" : "Skill Assessment",
        description: isRtl 
          ? "تحليل فجوات المهارات وتحديد احتياجات التطوير بدقة."
          : "Gap analysis and precise identification of development needs.",
        features: [
          { icon: BarChart3, label: isRtl ? "تحليل الفجوات" : "Gap Analysis" },
          { icon: Brain, label: isRtl ? "تقييم ذكي" : "Smart Assessment" },
          { icon: Target, label: isRtl ? "أهداف مخصصة" : "Custom Goals" },
        ],
        color: "from-blue-600 to-cyan-700",
      },
      {
        icon: BookOpen,
        title: isRtl ? "محرك الدورات" : "Course Engine",
        description: isRtl
          ? "إنشاء دورات ذكية مخصصة بناءً على احتياجات كل موظف."
          : "Create smart customized courses based on each employee's needs.",
        features: [
          { icon: Sparkles, label: isRtl ? "دورات ذكية" : "Smart Courses" },
          { icon: Zap, label: isRtl ? "محتوى تفاعلي" : "Interactive Content" },
          { icon: Clock, label: isRtl ? "تعلم مرن" : "Flexible Learning" },
        ],
        color: "from-violet-600 to-purple-700",
      },
      {
        icon: TrendingUp,
        title: isRtl ? "تتبع التقدم" : "Progress Tracking",
        description: isRtl
          ? "مقاييس أداء شاملة ومتابعة مستمرة للتطور."
          : "Comprehensive performance metrics and continuous progress monitoring.",
        features: [
          { icon: BarChart3, label: isRtl ? "مقاييس الأداء" : "Performance Metrics" },
          { icon: Star, label: isRtl ? "إنجازات" : "Achievements" },
          { icon: TrendingUp, label: isRtl ? "تحليل التقدم" : "Progress Analysis" },
        ],
        color: "from-emerald-600 to-green-700",
      },
      {
        icon: Award,
        title: isRtl ? "الشهادات" : "Certification",
        description: isRtl
          ? "شهادات موثقة ومعترف بها تثبت الكفاءة المهنية."
          : "Verified and recognized certificates proving professional competence.",
        features: [
          { icon: Trophy, label: isRtl ? "شهادات موثقة" : "Verified Certs" },
          { icon: CheckCircle2, label: isRtl ? "اعتماد مهني" : "Pro Accreditation" },
          { icon: Award, label: isRtl ? "إنجازات رقمية" : "Digital Badges" },
        ],
        color: "from-amber-600 to-orange-700",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-background to-emerald-950/20" />
        
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[15%] right-[8%] w-56 rounded-xl bg-card/30 backdrop-blur-sm border border-border/50 p-4">
            <div className="text-xs text-muted-foreground mb-3">{isRtl ? "تطور المهارات" : "Skill Growth"}</div>
            {skills.map((skill, index) => (
              <div key={index} className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>{skill.name}</span>
                  <motion.span
                    className="text-emerald-400"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                  >
                    {skill.level}%
                  </motion.span>
                </div>
                <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${skill.color} rounded-full`}
                    animate={{ width: [`${skill.level - 20}%`, `${skill.level}%`] }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="absolute left-[8%] top-1/2 -translate-y-1/2">
            <div className="flex flex-col gap-3">
              {trainingPath.map((step, index) => {
                const Icon = step.icon;
                const isActive = courseStep >= index;
                const isCurrent = courseStep === index;
                return (
                  <motion.div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-500 ${
                      isActive 
                        ? 'bg-emerald-500/20 border border-emerald-500/50' 
                        : 'bg-card/30 border border-border/50'
                    } ${isCurrent ? 'scale-110' : ''}`}
                    animate={{ x: isCurrent ? 10 : 0 }}
                  >
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-emerald-500' : 'bg-muted/50'}`}>
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
                    </div>
                    <span className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.label}
                    </span>
                    {isActive && !isCurrent && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          <motion.div
            className="absolute right-[10%] bottom-[20%] p-5 rounded-xl bg-card/30 backdrop-blur-sm border border-emerald-500/50"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Award className="w-12 h-12 text-amber-400 mx-auto" />
            <p className="text-sm text-center mt-2 font-medium">{isRtl ? "شهادة معتمدة" : "Certified"}</p>
            <motion.div
              className="mt-2 flex justify-center gap-1"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {[1, 2, 3].map((i) => (
                <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
              ))}
            </motion.div>
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
                className="px-6 py-2.5 text-sm border-emerald-500/50 bg-emerald-500/10 backdrop-blur-sm"
              >
                <GraduationCap className="w-4 h-4 mr-2 text-emerald-400" />
                <span className="text-emerald-400 font-medium">{t.hero.badge}</span>
              </Badge>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-4"
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-none">
                <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
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
                className="gap-3 px-10 py-7 text-lg bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 shadow-lg shadow-emerald-500/25"
                onClick={() => setLocation("/sovereign-workspace")}
                data-testid="button-start-trainai"
              >
                <GraduationCap className="w-5 h-5" />
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
                  <Icon className="w-6 h-6 mx-auto mb-2 text-emerald-400" />
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
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
              {isRtl ? "قدرات التدريب الذكي" : "Smart Training Capabilities"}
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

      <section className="py-24 bg-gradient-to-r from-blue-600 via-emerald-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzIiBjeT0iMyIgcj0iMyIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="relative max-w-4xl mx-auto px-4 text-center text-white">
          <GraduationCap className="w-16 h-16 mx-auto mb-6 opacity-80" />
          <p className="text-2xl md:text-3xl font-bold mb-4">
            {isRtl ? "التدريب هنا لا يكون عامًا... بل موجّهًا بذكاء" : "Training here isn't generic... it's intelligently targeted"}
          </p>
          <Button 
            size="lg"
            variant="secondary"
            className="gap-3 px-10 py-8 text-xl shadow-2xl mt-8"
            onClick={() => setLocation("/sovereign-workspace")}
            data-testid="button-final-trainai-cta"
          >
            <Award className="w-6 h-6" />
            {t.hero.cta}
          </Button>
        </div>
      </section>
    </div>
  );
}
