import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  Globe, 
  Building2,
  Landmark,
  TrendingUp,
  Shield,
  BarChart3,
  ArrowRight,
  DollarSign,
  ArrowRightLeft,
  CheckCircle2,
  Sparkles,
  Zap,
  Scale,
  FileCheck,
  Wallet,
  PieChart,
} from "lucide-react";

export default function GlobalCloudLanding() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [flowStep, setFlowStep] = useState(0);
  const [activeRegion, setActiveRegion] = useState(0);

  const currencies = [
    { code: "USD", symbol: "$", amount: "12.4M" },
    { code: "EUR", symbol: "€", amount: "8.7M" },
    { code: "SAR", symbol: "﷼", amount: "45.2M" },
    { code: "GBP", symbol: "£", amount: "5.1M" },
  ];

  const regions = [
    { name: isRtl ? "أمريكا الشمالية" : "North America", entities: 12 },
    { name: isRtl ? "أوروبا" : "Europe", entities: 8 },
    { name: isRtl ? "الشرق الأوسط" : "Middle East", entities: 15 },
    { name: isRtl ? "آسيا" : "Asia Pacific", entities: 6 },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setFlowStep(prev => (prev + 1) % currencies.length);
      setActiveRegion(prev => (prev + 1) % regions.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [currencies.length, regions.length]);

  const t = {
    hero: {
      badge: isRtl ? "التحكم المالي العالمي" : "Global Financial Control",
      title: isRtl ? "INFERA Finance AI – GlobalCloud™" : "INFERA Finance AI – GlobalCloud™",
      subtitle: isRtl 
        ? "تحكم مالي عالمي بذكاء"
        : "Intelligent Global Financial Control",
      description: isRtl
        ? "منصة تحكم مالي عالمي سيادي لإدارة كيانات متعددة، عملات متعددة، وتدفقات مالية عابرة للحدود."
        : "A global sovereign financial control platform for managing multi-entity, multi-currency, cross-border financial operations.",
      cta: isRtl ? "ابدأ التحكم العالمي" : "Start Global Control",
    },
    stats: [
      { label: isRtl ? "كيانات مُدارة" : "Entities Managed", value: "2,450+", icon: Building2 },
      { label: isRtl ? "عملات مدعومة" : "Currencies", value: "180+", icon: DollarSign },
      { label: isRtl ? "معاملات يومية" : "Daily Transactions", value: "$2.8B", icon: ArrowRightLeft },
      { label: isRtl ? "دول نشطة" : "Active Countries", value: "85+", icon: Globe },
    ],
    sections: [
      {
        icon: Building2,
        title: isRtl ? "تحكم متعدد الكيانات" : "Multi-Entity Control",
        description: isRtl 
          ? "إدارة مركزية لجميع الكيانات المالية عبر المناطق الجغرافية."
          : "Centralized management of all financial entities across geographic regions.",
        features: [
          { icon: Landmark, label: isRtl ? "كيانات متعددة" : "Multi-Entity" },
          { icon: Globe, label: isRtl ? "عبر المناطق" : "Cross-Regional" },
          { icon: PieChart, label: isRtl ? "توحيد مالي" : "Financial Consolidation" },
        ],
        color: "from-blue-600 to-cyan-700",
      },
      {
        icon: DollarSign,
        title: isRtl ? "ذكاء العملات" : "Currency Intelligence",
        description: isRtl
          ? "تحويل وإدارة عملات متعددة مع تحليل مخاطر الصرف."
          : "Multi-currency conversion and management with exchange risk analysis.",
        features: [
          { icon: ArrowRightLeft, label: isRtl ? "تحويل لحظي" : "Real-time FX" },
          { icon: TrendingUp, label: isRtl ? "تحليل المخاطر" : "Risk Analysis" },
          { icon: Wallet, label: isRtl ? "تحوط ذكي" : "Smart Hedging" },
        ],
        color: "from-emerald-600 to-green-700",
      },
      {
        icon: Shield,
        title: isRtl ? "الامتثال العالمي" : "Global Compliance",
        description: isRtl
          ? "التزام تلقائي بالأنظمة المالية الدولية والمحلية."
          : "Automatic compliance with international and local financial regulations.",
        features: [
          { icon: Scale, label: isRtl ? "أنظمة دولية" : "International Regs" },
          { icon: FileCheck, label: isRtl ? "تقارير تلقائية" : "Auto Reporting" },
          { icon: CheckCircle2, label: isRtl ? "تدقيق مستمر" : "Continuous Audit" },
        ],
        color: "from-violet-600 to-purple-700",
      },
      {
        icon: BarChart3,
        title: isRtl ? "لوحة التحكم الاستراتيجية" : "Strategic Dashboard",
        description: isRtl
          ? "رؤية شاملة للوضع المالي العالمي مع تحليلات استراتيجية."
          : "Comprehensive view of global financial status with strategic analytics.",
        features: [
          { icon: PieChart, label: isRtl ? "تحليلات شاملة" : "Full Analytics" },
          { icon: Zap, label: isRtl ? "قرارات لحظية" : "Real-time Decisions" },
          { icon: Sparkles, label: isRtl ? "توقعات AI" : "AI Forecasts" },
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
            <div className="text-xs text-muted-foreground mb-3">{isRtl ? "تدفق العملات" : "Currency Flow"}</div>
            {currencies.map((currency, index) => (
              <motion.div
                key={index}
                className={`flex items-center justify-between p-2 rounded-lg mb-2 transition-all duration-500 ${
                  flowStep === index 
                    ? 'bg-emerald-500/20 border border-emerald-500/50 scale-105' 
                    : 'bg-muted/20'
                }`}
                animate={{ x: flowStep === index ? 5 : 0 }}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    flowStep === index ? 'bg-emerald-500 text-white' : 'bg-muted/50'
                  }`}>
                    {currency.symbol}
                  </div>
                  <span className="text-sm font-medium">{currency.code}</span>
                </div>
                <span className={`text-sm font-bold ${flowStep === index ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                  {currency.amount}
                </span>
              </motion.div>
            ))}
          </div>

          <div className="absolute left-[8%] top-1/2 -translate-y-1/2">
            <div className="relative">
              <motion.div
                className="w-40 h-40 rounded-full border-2 border-blue-500/30 flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                {regions.map((region, index) => {
                  const angle = (index / regions.length) * 360;
                  const isActive = activeRegion === index;
                  return (
                    <motion.div
                      key={index}
                      className={`absolute w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isActive ? 'bg-blue-500 text-white scale-125' : 'bg-muted/50'
                      }`}
                      style={{
                        transform: `rotate(${angle}deg) translateX(70px) rotate(-${angle}deg)`,
                      }}
                    >
                      {region.entities}
                    </motion.div>
                  );
                })}
                <Globe className="w-12 h-12 text-blue-400" />
              </motion.div>
              <p className="text-center mt-4 text-sm text-muted-foreground">
                {regions[activeRegion]?.name}
              </p>
            </div>
          </div>

          <motion.div
            className="absolute right-[10%] bottom-[20%] p-4 rounded-xl bg-card/30 backdrop-blur-sm border border-blue-500/50"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="flex items-center gap-2 mb-2">
              <ArrowRightLeft className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-medium">{isRtl ? "تحويل عابر للحدود" : "Cross-Border"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-emerald-400">$2.4M</span>
              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <ArrowRight className="w-4 h-4 text-blue-400" />
              </motion.div>
              <span className="text-lg font-bold text-blue-400">€2.2M</span>
            </div>
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
                <Globe className="w-4 h-4 mr-2 text-blue-400" />
                <span className="text-blue-400 font-medium">{t.hero.badge}</span>
              </Badge>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-4"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-none">
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
                className="gap-3 px-10 py-7 text-lg bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 shadow-lg shadow-blue-500/25"
                onClick={() => setLocation("/sovereign-workspace")}
                data-testid="button-start-globalcloud"
              >
                <Globe className="w-5 h-5" />
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
              {isRtl ? "قدرات التحكم المالي العالمي" : "Global Financial Control Capabilities"}
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

      <section className="py-24 bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzIiBjeT0iMyIgcj0iMyIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="relative max-w-4xl mx-auto px-4 text-center text-white">
          <Globe className="w-16 h-16 mx-auto mb-6 opacity-80" />
          <p className="text-2xl md:text-3xl font-bold mb-4">
            {isRtl ? "تحكم مالي عالمي بذكاء سيادي" : "Global financial control with sovereign intelligence"}
          </p>
          <Button 
            size="lg"
            variant="secondary"
            className="gap-3 px-10 py-8 text-xl shadow-2xl mt-8"
            onClick={() => setLocation("/sovereign-workspace")}
            data-testid="button-final-globalcloud-cta"
          >
            <Landmark className="w-6 h-6" />
            {t.hero.cta}
          </Button>
        </div>
      </section>
    </div>
  );
}
