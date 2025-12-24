import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  Users, 
  UserCheck,
  Brain,
  Target,
  TrendingUp,
  Award,
  BookOpen,
  Clock,
  Calendar,
  Wallet,
  Star,
  Heart,
  Zap,
  BarChart3,
  PieChart,
  Activity,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Briefcase,
  Network,
  CheckCircle2,
} from "lucide-react";

export default function HumanIQLanding() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [activeNode, setActiveNode] = useState(0);
  const [pulseIndex, setPulseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNode(prev => (prev + 1) % 6);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseIndex(prev => (prev + 1) % 4);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const t = {
    hero: {
      badge: isRtl ? "ذكاء رأس المال البشري" : "Human Capital Intelligence",
      title: isRtl ? "INFERA HumanIQ™" : "INFERA HumanIQ™",
      subtitle: isRtl 
        ? "موظفون أذكى. قرارات أدق."
        : "Smarter People Management",
      description: isRtl
        ? "منصة ذكاء سيادي لإدارة رأس المال البشري تعامل الموظفين كأصول استراتيجية ذكية وليس كأرقام أو سجلات. HumanIQ لا يدير الموارد البشرية... بل يفهمها."
        : "A sovereign human capital intelligence platform that treats people as strategic intelligent assets, not static records. HumanIQ doesn't manage HR... it understands it.",
      cta: isRtl ? "ابدأ إدارة الذكاء البشري" : "Start Human Intelligence",
    },
    stats: [
      { label: isRtl ? "الموظفين النشطين" : "Active Employees", value: "2,847", icon: Users },
      { label: isRtl ? "معدل الأداء" : "Performance Rate", value: "94%", icon: TrendingUp },
      { label: isRtl ? "ساعات التدريب" : "Training Hours", value: "12.4K", icon: BookOpen },
      { label: isRtl ? "معدل الرضا" : "Satisfaction Rate", value: "92%", icon: Heart },
    ],
    sections: [
      {
        icon: Brain,
        title: isRtl ? "مركز ذكاء الموظفين" : "Employee Intelligence Hub",
        description: isRtl 
          ? "ملفات شخصية ذكية مع تحليل المهارات والرؤى السلوكية لكل موظف."
          : "Smart profiles with skills analysis and behavioral insights for every employee.",
        features: [
          { icon: UserCheck, label: isRtl ? "الملفات الشخصية" : "Profiles" },
          { icon: Star, label: isRtl ? "المهارات" : "Skills" },
          { icon: Activity, label: isRtl ? "الرؤى السلوكية" : "Behavioral Insights" },
        ],
        color: "from-violet-600 to-purple-700",
      },
      {
        icon: Target,
        title: isRtl ? "الأداء والتقييم" : "Performance & Evaluation",
        description: isRtl
          ? "تقييم ذكي بالـ AI مع مؤشرات النمو وتتبع التطور المهني."
          : "AI-powered scoring with growth indicators and career development tracking.",
        features: [
          { icon: Award, label: isRtl ? "تقييم AI" : "AI Scoring" },
          { icon: TrendingUp, label: isRtl ? "مؤشرات النمو" : "Growth Indicators" },
          { icon: BarChart3, label: isRtl ? "تحليل الأداء" : "Performance Analytics" },
        ],
        color: "from-cyan-600 to-blue-700",
      },
      {
        icon: Wallet,
        title: isRtl ? "الرواتب والحضور" : "Payroll & Attendance",
        description: isRtl
          ? "نظام رواتب ذكي مع مزامنة حية للحضور والانصراف."
          : "Smart payroll system with live attendance synchronization.",
        features: [
          { icon: Wallet, label: isRtl ? "الرواتب الذكية" : "Smart Payroll" },
          { icon: Clock, label: isRtl ? "الحضور المباشر" : "Live Attendance" },
          { icon: Calendar, label: isRtl ? "إدارة الإجازات" : "Leave Management" },
        ],
        color: "from-emerald-600 to-green-700",
      },
      {
        icon: GraduationCap,
        title: isRtl ? "التعلم والنمو" : "Learning & Growth",
        description: isRtl
          ? "تكامل مع منصات التدريب وتوقع المهارات المستقبلية."
          : "Training integration with future skills forecasting.",
        features: [
          { icon: BookOpen, label: isRtl ? "تكامل التدريب" : "Training Integration" },
          { icon: Zap, label: isRtl ? "توقع المهارات" : "Skill Forecast" },
          { icon: Sparkles, label: isRtl ? "مسارات النمو" : "Growth Paths" },
        ],
        color: "from-amber-600 to-orange-700",
      },
    ],
    network: [
      { id: 1, name: isRtl ? "مدير" : "Manager", x: 50, y: 30 },
      { id: 2, name: isRtl ? "مهندس" : "Engineer", x: 20, y: 60 },
      { id: 3, name: isRtl ? "مصمم" : "Designer", x: 80, y: 60 },
      { id: 4, name: isRtl ? "محلل" : "Analyst", x: 35, y: 85 },
      { id: 5, name: isRtl ? "مطور" : "Developer", x: 65, y: 85 },
      { id: 6, name: isRtl ? "قائد" : "Lead", x: 50, y: 55 },
    ],
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/30 via-background to-cyan-950/20" />
        
        <div className="absolute inset-0 overflow-hidden">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {t.network.map((node, i) => 
              t.network.slice(i + 1).map((target, j) => (
                <motion.line
                  key={`${node.id}-${target.id}`}
                  x1={`${node.x}%`}
                  y1={`${node.y}%`}
                  x2={`${target.x}%`}
                  y2={`${target.y}%`}
                  stroke="url(#networkGradient)"
                  strokeWidth="0.2"
                  opacity={activeNode === i || activeNode === i + j + 1 ? 0.8 : 0.2}
                  className="transition-opacity duration-500"
                />
              ))
            )}
            <defs>
              <linearGradient id="networkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
          </svg>
          
          {t.network.map((node, index) => (
            <motion.div
              key={node.id}
              className={`absolute w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                activeNode === index 
                  ? 'bg-gradient-to-br from-violet-500 to-cyan-500 scale-125 shadow-lg shadow-violet-500/30' 
                  : 'bg-muted/30 border border-border/50'
              }`}
              style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
              animate={{ scale: activeNode === index ? 1.2 : 1 }}
            >
              <Users className={`w-5 h-5 ${activeNode === index ? 'text-white' : 'text-muted-foreground'}`} />
            </motion.div>
          ))}
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
                className="px-6 py-2.5 text-sm border-violet-500/50 bg-violet-500/10 backdrop-blur-sm"
              >
                <Users className="w-4 h-4 mr-2 text-violet-400" />
                <span className="text-violet-400 font-medium">{t.hero.badge}</span>
              </Badge>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-4"
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-none">
                <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
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
                className="gap-3 px-10 py-7 text-lg bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 shadow-lg shadow-violet-500/25"
                onClick={() => setLocation("/sovereign-workspace")}
                data-testid="button-start-humaniq"
              >
                <Brain className="w-5 h-5" />
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
                  <Icon className="w-6 h-6 mx-auto mb-2 text-violet-400" />
                  <p className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
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
              {isRtl ? "قدرات ذكاء الموارد البشرية" : "HR Intelligence Capabilities"}
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

      <section className="py-24 bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzIiBjeT0iMyIgcj0iMyIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="relative max-w-4xl mx-auto px-4 text-center text-white">
          <Users className="w-16 h-16 mx-auto mb-6 opacity-80" />
          <p className="text-2xl md:text-3xl font-bold mb-4">
            {isRtl ? "HumanIQ لا يدير الموارد البشرية... بل يفهمها" : "HumanIQ doesn't manage HR... it understands it"}
          </p>
          <Button 
            size="lg"
            variant="secondary"
            className="gap-3 px-10 py-8 text-xl shadow-2xl mt-8"
            onClick={() => setLocation("/sovereign-workspace")}
            data-testid="button-final-humaniq-cta"
          >
            <Brain className="w-6 h-6" />
            {t.hero.cta}
          </Button>
        </div>
      </section>
    </div>
  );
}
