import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  Hotel, 
  Users,
  Star,
  Heart,
  TrendingUp,
  Bell,
  Coffee,
  Utensils,
  Bed,
  Sparkles,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Smile,
  ThumbsUp,
  Activity,
  Clock,
  Zap,
  Target,
} from "lucide-react";
import { LandingWorkspaceNav } from "@/components/landing-workspace-nav";

export default function HospitalityLanding() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [satisfactionWave, setSatisfactionWave] = useState(0);
  const [serviceIndex, setServiceIndex] = useState(0);

  const services = [
    { icon: Bed, label: isRtl ? "الغرف" : "Rooms", status: "active" },
    { icon: Utensils, label: isRtl ? "المطاعم" : "Dining", status: "busy" },
    { icon: Coffee, label: isRtl ? "الخدمة" : "Service", status: "active" },
    { icon: Sparkles, label: isRtl ? "النظافة" : "Housekeeping", status: "active" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setSatisfactionWave(prev => (prev + 1) % 100);
      setServiceIndex(prev => (prev + 1) % services.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [services.length]);

  const t = {
    hero: {
      badge: isRtl ? "ذكاء الضيافة" : "Hospitality Intelligence",
      title: isRtl ? "INFERA Hospitality AI™" : "INFERA Hospitality AI™",
      subtitle: isRtl 
        ? "ضيافة تفهم النزيل"
        : "Hospitality That Understands Guests",
      description: isRtl
        ? "منصة ذكاء سيادي لإدارة الفنادق والضيافة تركّز على تجربة النزيل، كفاءة التشغيل، واتخاذ قرارات فورية قائمة على التحليل الذكي."
        : "A sovereign hospitality intelligence platform focused on guest experience, operational efficiency, and AI-driven decision-making.",
      cta: isRtl ? "ابدأ الضيافة الذكية" : "Start Smart Hospitality",
    },
    stats: [
      { label: isRtl ? "نزلاء سعداء" : "Happy Guests", value: "98.7%", icon: Smile },
      { label: isRtl ? "غرف نشطة" : "Active Rooms", value: "2,450", icon: Bed },
      { label: isRtl ? "وقت الاستجابة" : "Response Time", value: "< 3min", icon: Clock },
      { label: isRtl ? "تقييم النزلاء" : "Guest Rating", value: "4.9/5", icon: Star },
    ],
    sections: [
      {
        icon: Users,
        title: isRtl ? "ذكاء النزلاء" : "Guest Intelligence",
        description: isRtl 
          ? "تحليل سلوك النزلاء مع مقاييس رضا دقيقة وتوقعات ذكية."
          : "Guest behavior analysis with precise satisfaction metrics and smart predictions.",
        features: [
          { icon: Activity, label: isRtl ? "تحليل السلوك" : "Behavior Analysis" },
          { icon: Heart, label: isRtl ? "مقاييس الرضا" : "Satisfaction Metrics" },
          { icon: Target, label: isRtl ? "توقعات ذكية" : "Smart Predictions" },
        ],
        color: "from-amber-600 to-orange-700",
      },
      {
        icon: Bell,
        title: isRtl ? "التحكم بالعمليات" : "Operations Control",
        description: isRtl
          ? "مراقبة الخدمات في الوقت الفعلي مع تنسيق ذكي للموظفين."
          : "Real-time service monitoring with intelligent staff coordination.",
        features: [
          { icon: BarChart3, label: isRtl ? "مراقبة الخدمات" : "Service Monitoring" },
          { icon: Users, label: isRtl ? "تنسيق الموظفين" : "Staff Coordination" },
          { icon: Zap, label: isRtl ? "استجابة فورية" : "Instant Response" },
        ],
        color: "from-cyan-600 to-blue-700",
      },
      {
        icon: TrendingUp,
        title: isRtl ? "تحليلات الأداء" : "Performance Analytics",
        description: isRtl
          ? "مؤشرات الأداء الرئيسية مع تحليل الاتجاهات والتوقعات المستقبلية."
          : "Key performance indicators with trend analysis and future forecasting.",
        features: [
          { icon: BarChart3, label: isRtl ? "مؤشرات الأداء" : "KPIs" },
          { icon: TrendingUp, label: isRtl ? "تحليل الاتجاهات" : "Trend Analysis" },
          { icon: Target, label: isRtl ? "التوقعات" : "Forecasting" },
        ],
        color: "from-emerald-600 to-green-700",
      },
      {
        icon: Sparkles,
        title: isRtl ? "التوصيات الذكية" : "Smart Recommendations",
        description: isRtl
          ? "اقتراحات لتحسين تجربة النزلاء وزيادة الكفاءة التشغيلية."
          : "Suggestions to improve guest experience and increase operational efficiency.",
        features: [
          { icon: ThumbsUp, label: isRtl ? "تحسين التجربة" : "Experience Improvements" },
          { icon: Zap, label: isRtl ? "كفاءة العمليات" : "Ops Efficiency" },
          { icon: Star, label: isRtl ? "زيادة التقييمات" : "Rating Boost" },
        ],
        color: "from-violet-600 to-purple-700",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      <LandingWorkspaceNav platformName="INFERA Hospitality AI™" platformNameAr="إنفيرا هوسبيتاليتي AI™" />
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/30 via-background to-orange-950/20" />
        
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[20%] right-[8%] w-56 rounded-xl bg-card/30 backdrop-blur-sm border border-border/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">{isRtl ? "رضا النزلاء" : "Guest Satisfaction"}</span>
              <Smile className="w-4 h-4 text-amber-400" />
            </div>
            <div className="relative h-3 bg-muted/50 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full"
                animate={{ width: `${85 + (satisfactionWave % 15)}%` }}
                transition={{ duration: 1 }}
              />
            </div>
            <p className="text-right mt-2 text-xl font-bold text-emerald-400">98.7%</p>
          </div>

          <div className="absolute left-[8%] top-1/2 -translate-y-1/2 space-y-3">
            {services.map((service, index) => {
              const Icon = service.icon;
              const isActive = serviceIndex === index;
              return (
                <motion.div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-xl backdrop-blur-sm border transition-all duration-500 ${
                    isActive 
                      ? 'bg-amber-500/20 border-amber-500/50 scale-105' 
                      : 'bg-card/20 border-border/30'
                  }`}
                  animate={{ x: isActive ? 10 : 0 }}
                >
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-amber-500' : 'bg-muted/50'}`}>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
                  </div>
                  <span className={`text-sm ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    {service.label}
                  </span>
                  <div className={`w-2 h-2 rounded-full ml-auto ${
                    service.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`} />
                </motion.div>
              );
            })}
          </div>

          <div className="absolute right-[10%] bottom-[20%] flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.div
                key={star}
                animate={{ scale: star <= 4 + (satisfactionWave % 2) ? 1.2 : 1 }}
                transition={{ duration: 0.3 }}
              >
                <Star className={`w-6 h-6 ${star <= 5 ? 'text-amber-400 fill-amber-400' : 'text-muted/50'}`} />
              </motion.div>
            ))}
            <span className="text-lg font-bold text-amber-400 ml-2">4.9</span>
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
                className="px-6 py-2.5 text-sm border-amber-500/50 bg-amber-500/10 backdrop-blur-sm"
              >
                <Hotel className="w-4 h-4 mr-2 text-amber-400" />
                <span className="text-amber-400 font-medium">{t.hero.badge}</span>
              </Badge>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-4"
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-none">
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
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
                className="gap-3 px-10 py-7 text-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg shadow-amber-500/25"
                onClick={() => setLocation("/sovereign-workspace")}
                data-testid="button-start-hospitality"
              >
                <Hotel className="w-5 h-5" />
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
                  <Icon className="w-6 h-6 mx-auto mb-2 text-amber-400" />
                  <p className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
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
              {isRtl ? "قدرات الضيافة الذكية" : "Smart Hospitality Capabilities"}
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

      <section className="py-24 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzIiBjeT0iMyIgcj0iMyIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="relative max-w-4xl mx-auto px-4 text-center text-white">
          <Hotel className="w-16 h-16 mx-auto mb-6 opacity-80" />
          <p className="text-2xl md:text-3xl font-bold mb-4">
            {isRtl ? "الضيافة هنا لا تُدار... بل تُصمَّم بذكاء" : "Hospitality isn't managed here... it's designed intelligently"}
          </p>
          <Button 
            size="lg"
            variant="secondary"
            className="gap-3 px-10 py-8 text-xl shadow-2xl mt-8"
            onClick={() => setLocation("/sovereign-workspace")}
            data-testid="button-final-hospitality-cta"
          >
            <Star className="w-6 h-6" />
            {t.hero.cta}
          </Button>
        </div>
      </section>
    </div>
  );
}
