import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  PiggyBank,
  CreditCard,
  Wallet,
  Receipt,
  LineChart,
  BarChart3,
  PieChart,
  Target,
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Banknote,
  Coins,
  Building2,
  Calculator,
  Percent,
  Clock,
  Brain,
} from "lucide-react";

export default function FinanceLanding() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [activeMetric, setActiveMetric] = useState(0);
  const [chartData, setChartData] = useState<number[]>([]);

  useEffect(() => {
    const generateData = () => {
      const data = [];
      for (let i = 0; i < 12; i++) {
        data.push(Math.floor(Math.random() * 50) + 50);
      }
      setChartData(data);
    };
    generateData();
    const interval = setInterval(generateData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMetric(prev => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const t = {
    hero: {
      badge: isRtl ? "الذكاء المالي السيادي" : "Sovereign Financial Intelligence",
      title: isRtl ? "INFERA Sovereign Finance AI™" : "INFERA Sovereign Finance AI™",
      subtitle: isRtl 
        ? "ذكاء مالي يفكر قبل أن تصرف"
        : "Finance That Thinks Ahead",
      description: isRtl
        ? "منصة ذكاء مالي سيادي لإدارة المال، التحليلات، التوقعات، والقرارات المالية بمستوى مؤسسي متقدم. المال هنا لا يُدار... بل يُفهم ويُتوقع."
        : "A sovereign financial intelligence platform designed to manage, analyze, predict, and optimize financial operations at enterprise level. It transforms finance from accounting into strategic intelligence.",
      cta: isRtl ? "ابدأ التحليل المالي" : "Start Financial Analysis",
    },
    liveMetrics: [
      { label: isRtl ? "إجمالي الإيرادات" : "Total Revenue", value: "$2.4M", change: "+12.5%", up: true, icon: TrendingUp },
      { label: isRtl ? "التدفق النقدي" : "Cash Flow", value: "$847K", change: "+8.3%", up: true, icon: Wallet },
      { label: isRtl ? "الفواتير المعلقة" : "Pending Invoices", value: "23", change: "-15%", up: true, icon: Receipt },
      { label: isRtl ? "مؤشر المخاطر" : "Risk Index", value: "Low", change: "Stable", up: true, icon: Shield },
    ],
    sections: [
      {
        icon: Building2,
        title: isRtl ? "مركز التحكم المالي" : "Financial Control Center",
        description: isRtl 
          ? "إدارة شاملة للحسابات والتدفقات النقدية والفواتير من لوحة تحكم واحدة."
          : "Comprehensive management of accounts, cash flow, and invoices from a single dashboard.",
        features: [
          { icon: Wallet, label: isRtl ? "الحسابات" : "Accounts" },
          { icon: TrendingUp, label: isRtl ? "التدفق النقدي" : "Cash Flow" },
          { icon: Receipt, label: isRtl ? "الفواتير" : "Invoices" },
        ],
        color: "from-emerald-600 to-green-700",
      },
      {
        icon: LineChart,
        title: isRtl ? "التحليلات التنبؤية" : "Predictive Analytics",
        description: isRtl
          ? "رسوم بيانية للتنبؤات مع إشارات المخاطر وتحليل السيناريوهات المستقبلية."
          : "Forecast charts with risk signals and future scenario analysis.",
        features: [
          { icon: BarChart3, label: isRtl ? "رسوم التنبؤ" : "Forecast Charts" },
          { icon: AlertTriangle, label: isRtl ? "إشارات المخاطر" : "Risk Signals" },
          { icon: Target, label: isRtl ? "تحليل السيناريوهات" : "Scenario Analysis" },
        ],
        color: "from-blue-600 to-cyan-700",
      },
      {
        icon: Shield,
        title: isRtl ? "الامتثال والتقارير" : "Compliance & Reporting",
        description: isRtl
          ? "تقارير ذكية مع سجلات تدقيق كاملة لضمان الامتثال التنظيمي."
          : "Smart reports with complete audit trails ensuring regulatory compliance.",
        features: [
          { icon: FileText, label: isRtl ? "تقارير ذكية" : "Smart Reports" },
          { icon: CheckCircle2, label: isRtl ? "سجلات التدقيق" : "Audit Trails" },
          { icon: Shield, label: isRtl ? "الامتثال" : "Compliance" },
        ],
        color: "from-violet-600 to-purple-700",
      },
      {
        icon: Brain,
        title: isRtl ? "الرؤى الاستراتيجية" : "Strategic Insights",
        description: isRtl
          ? "توصيات ذكية مدعومة بالذكاء الاصطناعي مع تحليل السيناريوهات المتعددة."
          : "AI-powered recommendations with multi-scenario analysis.",
        features: [
          { icon: Sparkles, label: isRtl ? "توصيات AI" : "AI Recommendations" },
          { icon: PieChart, label: isRtl ? "تحليل السيناريوهات" : "Scenario Analysis" },
          { icon: TrendingUp, label: isRtl ? "التحسين المستمر" : "Continuous Optimization" },
        ],
        color: "from-amber-600 to-orange-700",
      },
    ],
    forecast: {
      title: isRtl ? "توقعات الأداء المالي" : "Financial Performance Forecast",
      months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    },
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/30 via-background to-blue-950/20" />
        
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 bg-gradient-to-t from-emerald-500/40 to-transparent"
              style={{
                left: `${5 + i * 5}%`,
                bottom: 0,
                height: `${chartData[i % 12] || 50}%`,
              }}
              initial={{ height: 0 }}
              animate={{ height: `${chartData[i % 12] || 50}%` }}
              transition={{ duration: 1, delay: i * 0.1 }}
            />
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
                className="px-6 py-2.5 text-sm border-emerald-500/50 bg-emerald-500/10 backdrop-blur-sm"
              >
                <DollarSign className="w-4 h-4 mr-2 text-emerald-400" />
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
                <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-cyan-400 bg-clip-text text-transparent">
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
                className="gap-3 px-10 py-7 text-lg bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 shadow-lg shadow-emerald-500/25"
                onClick={() => setLocation("/sovereign-workspace")}
                data-testid="button-start-finance"
              >
                <LineChart className="w-5 h-5" />
                {t.hero.cta}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-5xl mx-auto"
          >
            {t.liveMetrics.map((metric, i) => {
              const Icon = metric.icon;
              const isActive = activeMetric === i;
              return (
                <div 
                  key={i}
                  className={`relative p-5 rounded-xl backdrop-blur-sm border transition-all duration-300 ${
                    isActive 
                      ? 'bg-emerald-500/20 border-emerald-500/50 scale-105' 
                      : 'bg-card/30 border-border/50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-muted-foreground'}`} />
                    <span className="text-sm text-muted-foreground">{metric.label}</span>
                  </div>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <p className={`text-sm ${metric.up ? 'text-emerald-500' : 'text-red-500'}`}>
                    {metric.change}
                  </p>
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
              {isRtl ? "القدرات المالية الذكية" : "Intelligent Financial Capabilities"}
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

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <Card className="bg-gradient-to-br from-emerald-600/10 to-cyan-600/10 border-emerald-500/20 overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <BarChart3 className="w-7 h-7 text-emerald-400" />
                {t.forecast.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-64 flex items-end justify-between gap-2">
                {chartData.map((value, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div
                      className="w-full bg-gradient-to-t from-emerald-500 to-cyan-500 rounded-t-md"
                      initial={{ height: 0 }}
                      animate={{ height: `${value}%` }}
                      transition={{ duration: 0.8, delay: index * 0.05 }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {t.forecast.months[index]}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-r from-emerald-600 via-green-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzIiBjeT0iMyIgcj0iMyIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="relative max-w-4xl mx-auto px-4 text-center text-white">
          <DollarSign className="w-16 h-16 mx-auto mb-6 opacity-80" />
          <p className="text-2xl md:text-3xl font-bold mb-4">
            {isRtl ? "المال هنا لا يُدار... بل يُفهم ويُتوقع" : "Finance is not managed here... it's understood and predicted"}
          </p>
          <Button 
            size="lg"
            variant="secondary"
            className="gap-3 px-10 py-8 text-xl shadow-2xl mt-8"
            onClick={() => setLocation("/sovereign-workspace")}
            data-testid="button-final-finance-cta"
          >
            <TrendingUp className="w-6 h-6" />
            {t.hero.cta}
          </Button>
        </div>
      </section>
    </div>
  );
}
