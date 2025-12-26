import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  GraduationCap, 
  BookOpen,
  Brain,
  Target,
  TrendingUp,
  Award,
  CheckCircle2,
  Play,
  FileText,
  BarChart3,
  Lightbulb,
  Sparkles,
  Users,
  Clock,
  Zap,
  ArrowRight,
  Star,
  Trophy,
} from "lucide-react";
import { LandingWorkspaceNav } from "@/components/landing-workspace-nav";

export default function EducationLanding() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [pathStep, setPathStep] = useState(0);
  const [skillProgress, setSkillProgress] = useState([30, 45, 60, 75]);

  const pathNodes = [
    { icon: BookOpen, label: isRtl ? "أساسيات" : "Fundamentals", color: "bg-blue-500" },
    { icon: Brain, label: isRtl ? "متوسط" : "Intermediate", color: "bg-violet-500" },
    { icon: Zap, label: isRtl ? "متقدم" : "Advanced", color: "bg-amber-500" },
    { icon: Trophy, label: isRtl ? "خبير" : "Expert", color: "bg-emerald-500" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPathStep(prev => (prev + 1) % pathNodes.length);
      setSkillProgress(prev => prev.map(p => Math.min(p + 5, 100)));
    }, 2500);
    return () => clearInterval(interval);
  }, [pathNodes.length]);

  const t = {
    hero: {
      badge: isRtl ? "التعليم الذكي التكيفي" : "Adaptive Intelligent Learning",
      title: isRtl ? "INFERA AI Education Hub™" : "INFERA AI Education Hub™",
      subtitle: isRtl 
        ? "تعليم يفهم المتعلّم"
        : "Learning That Understands You",
      description: isRtl
        ? "منصة تعليم ذكي سيادي تصمّم المحتوى والمسارات التعليمية وفق قدرات المتعلّم وسلوكه واحتياجاته الفعلية. التعليم هنا لا يُلقَّن... بل يُبنى بذكاء."
        : "A sovereign intelligent learning platform that adapts content, courses, and assessments to each learner's behavior and capabilities.",
      cta: isRtl ? "ابدأ رحلة التعلم" : "Start Learning Journey",
    },
    stats: [
      { label: isRtl ? "دورات نشطة" : "Active Courses", value: "5,420", icon: BookOpen },
      { label: isRtl ? "متعلمون" : "Learners", value: "89K+", icon: Users },
      { label: isRtl ? "معدل الإكمال" : "Completion Rate", value: "94.7%", icon: CheckCircle2 },
      { label: isRtl ? "شهادات ممنوحة" : "Certificates Issued", value: "34K", icon: Award },
    ],
    sections: [
      {
        icon: Sparkles,
        title: isRtl ? "ذكاء الدورات" : "Course Intelligence",
        description: isRtl 
          ? "إنشاء دورات تلقائياً مع محتوى تكيفي يتناسب مع مستوى كل متعلم."
          : "AI-powered course generation with adaptive content that matches each learner's level.",
        features: [
          { icon: Brain, label: isRtl ? "منشئ الدورات AI" : "AI Course Generator" },
          { icon: Zap, label: isRtl ? "محتوى تكيفي" : "Adaptive Content" },
          { icon: Play, label: isRtl ? "تعلم تفاعلي" : "Interactive Learning" },
        ],
        color: "from-blue-600 to-cyan-700",
      },
      {
        icon: Target,
        title: isRtl ? "محرك التقييم" : "Assessment Engine",
        description: isRtl
          ? "اختبارات ذكية مع تقييم مهارات دقيق وتحليل نقاط القوة والضعف."
          : "Smart tests with precise skill evaluation and strength/weakness analysis.",
        features: [
          { icon: FileText, label: isRtl ? "اختبارات ذكية" : "Smart Tests" },
          { icon: BarChart3, label: isRtl ? "تقييم المهارات" : "Skill Evaluation" },
          { icon: Target, label: isRtl ? "تحليل الفجوات" : "Gap Analysis" },
        ],
        color: "from-violet-600 to-purple-700",
      },
      {
        icon: TrendingUp,
        title: isRtl ? "تحليلات التقدم" : "Progress Analytics",
        description: isRtl
          ? "تقارير تعلم تفصيلية مع تتبع النمو والإنجازات في الوقت الفعلي."
          : "Detailed learning reports with real-time growth and achievement tracking.",
        features: [
          { icon: BarChart3, label: isRtl ? "تقارير التعلم" : "Learning Reports" },
          { icon: TrendingUp, label: isRtl ? "تتبع النمو" : "Growth Tracking" },
          { icon: Trophy, label: isRtl ? "الإنجازات" : "Achievements" },
        ],
        color: "from-emerald-600 to-green-700",
      },
      {
        icon: Lightbulb,
        title: isRtl ? "نظام التوصيات" : "Recommendation System",
        description: isRtl
          ? "اقتراحات الخطوة التالية مع مسارات تعلم مخصصة لكل متعلم."
          : "Next-step suggestions with personalized learning paths for each learner.",
        features: [
          { icon: Lightbulb, label: isRtl ? "اقتراحات ذكية" : "Smart Suggestions" },
          { icon: Sparkles, label: isRtl ? "مسارات مخصصة" : "Personalized Paths" },
          { icon: Star, label: isRtl ? "أهداف التعلم" : "Learning Goals" },
        ],
        color: "from-amber-600 to-orange-700",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      <LandingWorkspaceNav platformName="INFERA AI Education Hub™" platformNameAr="إنفيرا إيديوكيشن هب AI™" />
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-background to-violet-950/20" />
        
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 right-[8%] flex flex-col items-center gap-2">
            {pathNodes.map((node, index) => {
              const Icon = node.icon;
              const isActive = pathStep >= index;
              const isCurrent = pathStep === index;
              return (
                <div key={index} className="flex flex-col items-center">
                  <motion.div
                    className={`p-4 rounded-xl transition-all duration-500 ${
                      isActive 
                        ? `${node.color} shadow-lg` 
                        : 'bg-muted/30 border border-border/50'
                    } ${isCurrent ? 'scale-110' : ''}`}
                    animate={{ scale: isCurrent ? 1.1 : 1 }}
                  >
                    <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
                  </motion.div>
                  <span className={`text-xs mt-1 ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {node.label}
                  </span>
                  {index < pathNodes.length - 1 && (
                    <div className={`w-0.5 h-6 transition-all duration-500 ${
                      pathStep > index ? 'bg-gradient-to-b from-blue-500 to-violet-500' : 'bg-muted/30'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>

          <div className="absolute left-[8%] top-1/2 -translate-y-1/2 w-56 rounded-xl bg-card/30 backdrop-blur-sm border border-border/50 p-4">
            <div className="text-xs text-muted-foreground mb-3">{isRtl ? "تقدم المهارات" : "Skill Progress"}</div>
            {[
              { name: isRtl ? "البرمجة" : "Programming", color: "bg-blue-500" },
              { name: isRtl ? "التصميم" : "Design", color: "bg-violet-500" },
              { name: isRtl ? "التحليل" : "Analytics", color: "bg-emerald-500" },
              { name: isRtl ? "القيادة" : "Leadership", color: "bg-amber-500" },
            ].map((skill, i) => (
              <div key={i} className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>{skill.name}</span>
                  <span className="text-muted-foreground">{skillProgress[i]}%</span>
                </div>
                <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${skill.color} rounded-full`}
                    animate={{ width: `${skillProgress[i]}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            ))}
          </div>
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
                <GraduationCap className="w-4 h-4 mr-2 text-blue-400" />
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
                data-testid="button-start-education"
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
              {isRtl ? "قدرات التعليم الذكي" : "Smart Education Capabilities"}
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
          <GraduationCap className="w-16 h-16 mx-auto mb-6 opacity-80" />
          <p className="text-2xl md:text-3xl font-bold mb-4">
            {isRtl ? "التعليم هنا لا يُلقَّن... بل يُبنى بذكاء" : "Learning isn't taught here... it's intelligently built"}
          </p>
          <Button 
            size="lg"
            variant="secondary"
            className="gap-3 px-10 py-8 text-xl shadow-2xl mt-8"
            onClick={() => setLocation("/sovereign-workspace")}
            data-testid="button-final-education-cta"
          >
            <BookOpen className="w-6 h-6" />
            {t.hero.cta}
          </Button>
        </div>
      </section>
    </div>
  );
}
