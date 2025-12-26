import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  Briefcase, 
  Users,
  Target,
  Brain,
  TrendingUp,
  Search,
  FileUser,
  CheckCircle2,
  ArrowRight,
  Star,
  BarChart3,
  Sparkles,
  Zap,
  Award,
  Building2,
  UserCheck,
  Filter,
  LineChart,
} from "lucide-react";
import { LandingWorkspaceNav } from "@/components/landing-workspace-nav";

export default function JobsLanding() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [matchingStep, setMatchingStep] = useState(0);
  const [fitScore, setFitScore] = useState(0);

  const candidates = [
    { name: isRtl ? "أحمد محمد" : "Ahmed M.", score: 95, status: "matched" },
    { name: isRtl ? "سارة علي" : "Sarah A.", score: 88, status: "reviewing" },
    { name: isRtl ? "محمد خالد" : "Mohamed K.", score: 82, status: "pending" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMatchingStep(prev => (prev + 1) % 4);
      setFitScore(prev => prev < 95 ? prev + 5 : 0);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const t = {
    hero: {
      badge: isRtl ? "التوظيف الذكي" : "Intelligent Recruitment",
      title: isRtl ? "INFERA Jobs AI™" : "INFERA Jobs AI™",
      subtitle: isRtl 
        ? "التوظيف بذكاء"
        : "Smart Hiring Starts Here",
      description: isRtl
        ? "منصة توظيف ذكية سيادية تربط بين المرشحين والوظائف باستخدام التحليل التنبؤي والمطابقة الذكية."
        : "A sovereign intelligent recruitment platform that matches candidates and jobs using predictive analysis and AI scoring.",
      cta: isRtl ? "ابدأ التوظيف الذكي" : "Start Smart Hiring",
    },
    stats: [
      { label: isRtl ? "وظائف نشطة" : "Active Jobs", value: "8,420", icon: Briefcase },
      { label: isRtl ? "مرشحون" : "Candidates", value: "124K+", icon: Users },
      { label: isRtl ? "دقة المطابقة" : "Match Accuracy", value: "96.4%", icon: Target },
      { label: isRtl ? "توظيفات ناجحة" : "Successful Hires", value: "34K", icon: UserCheck },
    ],
    sections: [
      {
        icon: Briefcase,
        title: isRtl ? "ذكاء الوظائف" : "Job Intelligence",
        description: isRtl 
          ? "قوائم وظائف ذكية مع تحليل متطلبات المهارات وتوقعات السوق."
          : "Smart job listings with skill requirement analysis and market predictions.",
        features: [
          { icon: Search, label: isRtl ? "قوائم ذكية" : "Smart Listings" },
          { icon: BarChart3, label: isRtl ? "تحليل المتطلبات" : "Requirement Analysis" },
          { icon: TrendingUp, label: isRtl ? "اتجاهات السوق" : "Market Trends" },
        ],
        color: "from-blue-600 to-cyan-700",
      },
      {
        icon: FileUser,
        title: isRtl ? "تحليل المرشحين" : "Candidate Analysis",
        description: isRtl
          ? "تقييم السير الذاتية مع مؤشر الملاءمة والتحليل التنبؤي."
          : "CV scoring with fit index and predictive analysis.",
        features: [
          { icon: Star, label: isRtl ? "تقييم CV" : "CV Scoring" },
          { icon: Target, label: isRtl ? "مؤشر الملاءمة" : "Fit Index" },
          { icon: Brain, label: isRtl ? "تحليل تنبؤي" : "Predictive Analysis" },
        ],
        color: "from-violet-600 to-purple-700",
      },
      {
        icon: Sparkles,
        title: isRtl ? "محرك المطابقة" : "Matching Engine",
        description: isRtl
          ? "توصيات ذكاء اصطناعي للمطابقة المثلى بين المرشحين والوظائف."
          : "AI recommendations for optimal matching between candidates and jobs.",
        features: [
          { icon: Zap, label: isRtl ? "توصيات AI" : "AI Recommendations" },
          { icon: Filter, label: isRtl ? "تصفية ذكية" : "Smart Filtering" },
          { icon: CheckCircle2, label: isRtl ? "مطابقة تلقائية" : "Auto Matching" },
        ],
        color: "from-emerald-600 to-green-700",
      },
      {
        icon: LineChart,
        title: isRtl ? "لوحة التوظيف" : "Hiring Dashboard",
        description: isRtl
          ? "دعم القرار مع تحليلات شاملة ومتابعة العمليات."
          : "Decision support with comprehensive analytics and process tracking.",
        features: [
          { icon: BarChart3, label: isRtl ? "دعم القرار" : "Decision Support" },
          { icon: Building2, label: isRtl ? "تكامل HR" : "HR Integration" },
          { icon: Award, label: isRtl ? "تتبع العمليات" : "Process Tracking" },
        ],
        color: "from-amber-600 to-orange-700",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      <LandingWorkspaceNav platformName="INFERA Jobs AI™" platformNameAr="إنفيرا جوبز AI™" />
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-background to-violet-950/20" />
        
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[15%] right-[8%] w-56 rounded-xl bg-card/30 backdrop-blur-sm border border-border/50 p-4">
            <div className="text-xs text-muted-foreground mb-3">{isRtl ? "المرشحون المطابقون" : "Matched Candidates"}</div>
            {candidates.map((candidate, index) => (
              <motion.div
                key={index}
                className={`flex items-center gap-3 p-2 rounded-lg mb-2 transition-all duration-500 ${
                  matchingStep === index 
                    ? 'bg-emerald-500/20 border border-emerald-500/50 scale-105' 
                    : 'bg-muted/20'
                }`}
                animate={{ x: matchingStep === index ? 5 : 0 }}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                  {candidate.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{candidate.name}</p>
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 flex-1 bg-muted/50 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-emerald-500 rounded-full"
                        animate={{ width: matchingStep >= index ? `${candidate.score}%` : '0%' }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <span className="text-xs text-emerald-400">{candidate.score}%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="absolute left-[8%] top-1/2 -translate-y-1/2">
            <div className="relative flex items-center gap-8">
              <motion.div
                className="p-4 rounded-xl bg-card/30 backdrop-blur-sm border border-border/50"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Briefcase className="w-10 h-10 text-blue-400" />
                <p className="text-xs text-center mt-2">{isRtl ? "وظيفة" : "Job"}</p>
              </motion.div>

              <div className="flex flex-col gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-12 h-0.5 bg-gradient-to-r from-blue-500 to-emerald-500"
                    animate={{ 
                      opacity: [0.3, 1, 0.3],
                      scaleX: [0.5, 1, 0.5]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      delay: i * 0.3
                    }}
                  />
                ))}
              </div>

              <motion.div
                className="p-4 rounded-xl bg-card/30 backdrop-blur-sm border border-border/50"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                <Users className="w-10 h-10 text-emerald-400" />
                <p className="text-xs text-center mt-2">{isRtl ? "مرشح" : "Candidate"}</p>
              </motion.div>
            </div>
          </div>

          <div className="absolute right-[10%] bottom-[20%] p-4 rounded-xl bg-card/30 backdrop-blur-sm border border-border/50 text-center">
            <div className="text-xs text-muted-foreground mb-2">{isRtl ? "مؤشر الملاءمة" : "Fit Score"}</div>
            <div className="relative w-20 h-20 mx-auto">
              <svg className="w-full h-full -rotate-90">
                <circle cx="40" cy="40" r="35" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                <motion.circle
                  cx="40"
                  cy="40"
                  r="35"
                  fill="none"
                  stroke="url(#fitGradient)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={220}
                  animate={{ strokeDashoffset: 220 - (fitScore / 100) * 220 }}
                  transition={{ duration: 0.5 }}
                />
                <defs>
                  <linearGradient id="fitGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(221, 83%, 53%)" />
                    <stop offset="100%" stopColor="hsl(142, 76%, 36%)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-emerald-400">{fitScore}%</span>
              </div>
            </div>
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
                <Briefcase className="w-4 h-4 mr-2 text-blue-400" />
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
                <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
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
                className="gap-3 px-10 py-7 text-lg bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 shadow-lg shadow-blue-500/25"
                onClick={() => setLocation("/sovereign-workspace")}
                data-testid="button-start-jobs"
              >
                <Briefcase className="w-5 h-5" />
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
              {isRtl ? "قدرات التوظيف الذكي" : "Smart Recruitment Capabilities"}
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

      <section className="py-24 bg-gradient-to-r from-blue-600 via-violet-600 to-emerald-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzIiBjeT0iMyIgcj0iMyIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="relative max-w-4xl mx-auto px-4 text-center text-white">
          <Briefcase className="w-16 h-16 mx-auto mb-6 opacity-80" />
          <p className="text-2xl md:text-3xl font-bold mb-4">
            {isRtl ? "التوظيف هنا لا يُدار يدويًا... بل يُؤتمت بذكاء" : "Hiring isn't managed manually here... it's automated intelligently"}
          </p>
          <Button 
            size="lg"
            variant="secondary"
            className="gap-3 px-10 py-8 text-xl shadow-2xl mt-8"
            onClick={() => setLocation("/sovereign-workspace")}
            data-testid="button-final-jobs-cta"
          >
            <UserCheck className="w-6 h-6" />
            {t.hero.cta}
          </Button>
        </div>
      </section>
    </div>
  );
}
