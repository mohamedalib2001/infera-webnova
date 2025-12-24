import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  Eye, 
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Sparkles,
  Brain,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  Calculator,
  Scale,
  Zap,
  Activity,
  Shield,
} from "lucide-react";

export default function FeasibilityLanding() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [forecastStep, setForecastStep] = useState(0);
  const [riskLevel, setRiskLevel] = useState(35);

  const forecastData = [20, 35, 45, 60, 75, 85, 95];

  useEffect(() => {
    const interval = setInterval(() => {
      setForecastStep(prev => (prev + 1) % forecastData.length);
      setRiskLevel(prev => prev < 80 ? prev + 5 : 30);
    }, 1500);
    return () => clearInterval(interval);
  }, [forecastData.length]);

  const t = {
    hero: {
      badge: isRtl ? "ذكاء الجدوى الاستثمارية" : "Investment Feasibility Intelligence",
      title: isRtl ? "INFERA VisionFeasibility™" : "INFERA VisionFeasibility™",
      subtitle: isRtl 
        ? "استثمار يرى المستقبل"
        : "Investment That Sees Ahead",
      description: isRtl
        ? "منصة سيادية لتحليل الجدوى الاستثمارية تدمج الرؤية، الأرقام، المخاطر، والتوقعات في قرار واحد ذكي."
        : "A sovereign feasibility and investment intelligence platform that unifies vision, numbers, risks, and forecasts into one AI-driven decision.",
      cta: isRtl ? "ابدأ تحليل الجدوى" : "Start Feasibility Analysis",
    },
    stats: [
      { label: isRtl ? "مشاريع محللة" : "Projects Analyzed", value: "4,280", icon: Target },
      { label: isRtl ? "دقة التوقعات" : "Forecast Accuracy", value: "94.7%", icon: TrendingUp },
      { label: isRtl ? "استثمارات موجهة" : "Guided Investments", value: "$2.8B", icon: DollarSign },
      { label: isRtl ? "مخاطر مكتشفة" : "Risks Identified", value: "12.4K", icon: AlertTriangle },
    ],
    sections: [
      {
        icon: Lightbulb,
        title: isRtl ? "تقييم الأفكار" : "Idea Evaluation",
        description: isRtl 
          ? "تسجيل المفاهيم مع مقاييس الجدوى وتقييم إمكانية التنفيذ."
          : "Concept scoring with viability metrics and implementation potential assessment.",
        features: [
          { icon: Target, label: isRtl ? "تسجيل المفاهيم" : "Concept Scoring" },
          { icon: BarChart3, label: isRtl ? "مقاييس الجدوى" : "Viability Metrics" },
          { icon: CheckCircle2, label: isRtl ? "تقييم التنفيذ" : "Implementation Assessment" },
        ],
        color: "from-violet-600 to-purple-700",
      },
      {
        icon: LineChart,
        title: isRtl ? "التوقعات المالية" : "Financial Forecast",
        description: isRtl
          ? "توقعات الإيرادات ونماذج التكلفة مع تحليل نقطة التعادل."
          : "Revenue projections and cost models with break-even analysis.",
        features: [
          { icon: TrendingUp, label: isRtl ? "توقعات الإيرادات" : "Revenue Projections" },
          { icon: Calculator, label: isRtl ? "نماذج التكلفة" : "Cost Models" },
          { icon: DollarSign, label: isRtl ? "نقطة التعادل" : "Break-Even" },
        ],
        color: "from-emerald-600 to-green-700",
      },
      {
        icon: AlertTriangle,
        title: isRtl ? "تحليل المخاطر" : "Risk Analysis",
        description: isRtl
          ? "خريطة المخاطر مع اختبار السيناريوهات وخطط التخفيف."
          : "Risk mapping with scenario testing and mitigation planning.",
        features: [
          { icon: PieChart, label: isRtl ? "خريطة المخاطر" : "Risk Mapping" },
          { icon: Activity, label: isRtl ? "اختبار السيناريوهات" : "Scenario Testing" },
          { icon: Shield, label: isRtl ? "خطط التخفيف" : "Mitigation Plans" },
        ],
        color: "from-amber-600 to-orange-700",
      },
      {
        icon: Brain,
        title: isRtl ? "لوحة القرار" : "Decision Dashboard",
        description: isRtl
          ? "توصيات الذكاء الاصطناعي مع مؤشرات الثقة ودعم القرار."
          : "AI recommendations with confidence indicators and decision support.",
        features: [
          { icon: Sparkles, label: isRtl ? "توصيات AI" : "AI Recommendations" },
          { icon: Scale, label: isRtl ? "مؤشرات الثقة" : "Confidence Indicators" },
          { icon: Zap, label: isRtl ? "دعم القرار" : "Decision Support" },
        ],
        color: "from-cyan-600 to-blue-700",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/30 via-background to-emerald-950/20" />
        
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[20%] right-[8%] w-64 rounded-xl bg-card/30 backdrop-blur-sm border border-border/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">{isRtl ? "توقع الإيرادات" : "Revenue Forecast"}</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-end h-24 gap-1">
              {forecastData.map((value, index) => (
                <motion.div
                  key={index}
                  className={`flex-1 rounded-t ${
                    index <= forecastStep 
                      ? 'bg-gradient-to-t from-emerald-500 to-cyan-500' 
                      : 'bg-muted/30'
                  }`}
                  animate={{ height: `${index <= forecastStep ? value : 20}%` }}
                  transition={{ duration: 0.5 }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Y1</span>
              <span>Y7</span>
            </div>
          </div>

          <div className="absolute left-[8%] top-1/2 -translate-y-1/2 w-48 rounded-xl bg-card/30 backdrop-blur-sm border border-border/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">{isRtl ? "مستوى المخاطر" : "Risk Level"}</span>
              <AlertTriangle className={`w-4 h-4 ${riskLevel > 60 ? 'text-red-400' : riskLevel > 40 ? 'text-amber-400' : 'text-emerald-400'}`} />
            </div>
            <div className="relative h-3 bg-muted/50 rounded-full overflow-hidden">
              <motion.div
                className={`absolute inset-y-0 left-0 rounded-full ${
                  riskLevel > 60 ? 'bg-red-500' : riskLevel > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                animate={{ width: `${riskLevel}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className={`text-right mt-2 text-xl font-bold ${
              riskLevel > 60 ? 'text-red-400' : riskLevel > 40 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {riskLevel}%
            </p>
          </div>

          <div className="absolute right-[10%] bottom-[20%] flex items-center gap-3 p-4 rounded-xl bg-card/30 backdrop-blur-sm border border-border/50">
            <div className="p-3 rounded-full bg-emerald-500/20">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium">{isRtl ? "قرار الاستثمار" : "Investment Decision"}</p>
              <p className="text-xl font-bold text-emerald-400">{isRtl ? "موصى به" : "Recommended"}</p>
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
                className="px-6 py-2.5 text-sm border-violet-500/50 bg-violet-500/10 backdrop-blur-sm"
              >
                <Eye className="w-4 h-4 mr-2 text-violet-400" />
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
                <span className="bg-gradient-to-r from-violet-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
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
                className="gap-3 px-10 py-7 text-lg bg-gradient-to-r from-violet-600 to-emerald-600 hover:from-violet-700 hover:to-emerald-700 shadow-lg shadow-violet-500/25"
                onClick={() => setLocation("/sovereign-workspace")}
                data-testid="button-start-feasibility"
              >
                <Eye className="w-5 h-5" />
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
                  <p className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">
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
              {isRtl ? "قدرات تحليل الجدوى" : "Feasibility Analysis Capabilities"}
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

      <section className="py-24 bg-gradient-to-r from-violet-600 via-emerald-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzIiBjeT0iMyIgcj0iMyIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="relative max-w-4xl mx-auto px-4 text-center text-white">
          <Eye className="w-16 h-16 mx-auto mb-6 opacity-80" />
          <p className="text-2xl md:text-3xl font-bold mb-4">
            {isRtl ? "القرار الاستثماري هنا لا يُخمَّن... بل يُحسب بذكاء" : "Investment decisions aren't guessed here... they're calculated intelligently"}
          </p>
          <Button 
            size="lg"
            variant="secondary"
            className="gap-3 px-10 py-8 text-xl shadow-2xl mt-8"
            onClick={() => setLocation("/sovereign-workspace")}
            data-testid="button-final-feasibility-cta"
          >
            <TrendingUp className="w-6 h-6" />
            {t.hero.cta}
          </Button>
        </div>
      </section>
    </div>
  );
}
