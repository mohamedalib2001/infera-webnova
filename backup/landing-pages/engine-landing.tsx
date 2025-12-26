import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, 
  Cpu,
  Network,
  Activity,
  Zap,
  Eye,
  Target,
  LineChart,
  Workflow,
  Globe,
  Server,
  Database,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  BarChart3,
  Gauge,
  Radio,
  Layers,
  GitBranch,
} from "lucide-react";
import { LandingWorkspaceNav } from "@/components/landing-workspace-nav";

interface Platform {
  id: string;
  name: string;
  name_ar?: string;
  deployment_status?: string;
}

export default function EngineLanding() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [activeOrbit, setActiveOrbit] = useState(0);
  const [pulseWave, setPulseWave] = useState(0);

  const { data: platformsData } = useQuery<Platform[]>({
    queryKey: ["/api/sovereign/workspace/projects"],
  });

  const platforms = platformsData || [];
  const activePlatforms = platforms.filter(p => p.deployment_status === "active").length;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveOrbit(prev => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseWave(prev => (prev + 1) % 4);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const t = {
    hero: {
      badge: isRtl ? "العقل المركزي السيادي" : "Sovereign Central Intelligence",
      title: isRtl ? "INFERA Engine™" : "INFERA Engine™",
      subtitle: isRtl 
        ? "العقل الذي يدير كل شيء"
        : "The Brain Behind Everything",
      description: isRtl
        ? "العقل المركزي لمنظومة INFERA بالكامل. منصة سيادية عليا تتحكم في جميع المنصات الفرعية، الحسابات والخدمات، تدفقات البيانات، الذكاء المترابط، والقرارات الاستراتيجية."
        : "The sovereign central intelligence core of the entire INFERA ecosystem. It orchestrates all sub-platforms, accounts and services, data flows, interconnected intelligence, and strategic decision-making.",
      cta: isRtl ? "استكشف المنظومة" : "Explore Ecosystem",
      tagline: isRtl ? "ذكاء سيادي بلا مركزية... وسيطرة كاملة" : "Sovereign intelligence. Total orchestration.",
    },
    stats: [
      { label: isRtl ? "منصات متصلة" : "Connected Platforms", value: activePlatforms || "30+", icon: Network },
      { label: isRtl ? "قرارات/ثانية" : "Decisions/sec", value: "1.2K", icon: Zap },
      { label: isRtl ? "دقة التنبؤ" : "Forecast Accuracy", value: "99.7%", icon: Target },
      { label: isRtl ? "صحة النظام" : "System Health", value: "100%", icon: Activity },
    ],
    capabilities: [
      {
        icon: Workflow,
        title: isRtl ? "تنسيق المنصات" : "Platform Orchestration",
        description: isRtl 
          ? "إدارة وتنسيق جميع المنصات الفرعية من نقطة تحكم مركزية واحدة."
          : "Manage and coordinate all sub-platforms from a single central control point.",
        color: "from-violet-600 to-purple-700",
      },
      {
        icon: Brain,
        title: isRtl ? "مركز القرار الذكي" : "AI Decision Center",
        description: isRtl
          ? "تحليلات تنبؤية ومحرك توصيات ذكي لاتخاذ القرارات الاستراتيجية."
          : "Predictive analytics and intelligent recommendation engine for strategic decisions.",
        color: "from-cyan-600 to-blue-700",
      },
      {
        icon: Eye,
        title: isRtl ? "جدار المراقبة العالمي" : "Global Monitoring Wall",
        description: isRtl
          ? "مراقبة حالة الصحة ومقاييس الأداء لجميع الأنظمة في الوقت الفعلي."
          : "Real-time health status and performance metrics monitoring for all systems.",
        color: "from-emerald-600 to-green-700",
      },
      {
        icon: Target,
        title: isRtl ? "التحكم الاستراتيجي" : "Strategic Control",
        description: isRtl
          ? "إنفاذ السياسات وأدوات التنبؤ للتحكم الاستراتيجي الكامل."
          : "Policy enforcement and forecasting tools for complete strategic control.",
        color: "from-amber-600 to-orange-700",
      },
    ],
    orchestration: {
      title: isRtl ? "نظرة عامة على التنسيق" : "Orchestration Overview",
      subtitle: isRtl ? "خريطة المنصات وعلاقات النظام" : "Platforms Map & System Relationships",
    },
    aiCenter: {
      title: isRtl ? "مركز القرار الذكي" : "AI Decision Center",
      insights: [
        { label: isRtl ? "رؤى تنبؤية" : "Predictive Insights", value: "Active", status: "success" },
        { label: isRtl ? "محرك التوصيات" : "Recommendation Engine", value: "Running", status: "success" },
        { label: isRtl ? "تحليل السلوك" : "Behavior Analysis", value: "Learning", status: "info" },
        { label: isRtl ? "تحسين الأداء" : "Performance Optimization", value: "Optimizing", status: "warning" },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      <LandingWorkspaceNav platformName="INFERA Engine™" platformNameAr="إنفيرا إنجن™" />
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/30 via-background to-cyan-950/20" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-[500px] h-[500px]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-violet-500/30">
                <Brain className="w-12 h-12 text-white" />
              </div>
            </div>
            
            {[0, 1, 2, 3].map((ring) => (
              <div
                key={ring}
                className={`absolute inset-0 rounded-full border ${
                  pulseWave === ring ? 'border-violet-400/60' : 'border-violet-500/20'
                } transition-all duration-500`}
                style={{
                  margin: `${ring * 50}px`,
                  animation: pulseWave === ring ? 'ping 1.5s ease-out' : 'none',
                }}
              />
            ))}
            
            {platforms.slice(0, 8).map((platform, index) => {
              const angle = (index * 45 + activeOrbit) * (Math.PI / 180);
              const radius = 180;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              
              return (
                <motion.div
                  key={platform.id}
                  className="absolute w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/80 to-violet-500/80 flex items-center justify-center shadow-lg"
                  style={{
                    left: `calc(50% + ${x}px - 20px)`,
                    top: `calc(50% + ${y}px - 20px)`,
                  }}
                  whileHover={{ scale: 1.2 }}
                >
                  <Server className="w-5 h-5 text-white" />
                </motion.div>
              );
            })}
            
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {platforms.slice(0, 8).map((_, index) => {
                const angle = (index * 45 + activeOrbit) * (Math.PI / 180);
                const radius = 180;
                const x = Math.cos(angle) * radius + 250;
                const y = Math.sin(angle) * radius + 250;
                
                return (
                  <line
                    key={index}
                    x1="250"
                    y1="250"
                    x2={x}
                    y2={y}
                    stroke="url(#gradient)"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                    opacity="0.4"
                  />
                );
              })}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
            </svg>
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
                <Brain className="w-4 h-4 mr-2 text-violet-400" />
                <span className="text-violet-400 font-medium">{t.hero.badge}</span>
              </Badge>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-4"
            >
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-none">
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
                data-testid="button-explore-engine"
              >
                <Sparkles className="w-5 h-5" />
                {t.hero.cta}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-sm text-muted-foreground italic"
            >
              {t.hero.tagline}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-4xl mx-auto"
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
              {isRtl ? "القدرات الأساسية" : "Core Capabilities"}
            </h2>
            <p className="text-xl text-muted-foreground">
              {isRtl ? "نظام تشغيل سيادي متكامل" : "Complete Sovereign Operating System"}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.capabilities.map((cap, index) => {
              const Icon = cap.icon;
              return (
                <Card 
                  key={index}
                  className="group hover-elevate border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
                >
                  <CardContent className="p-6 space-y-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cap.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold">{cap.title}</h3>
                    <p className="text-sm text-muted-foreground">{cap.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">{t.aiCenter.title}</h2>
              <div className="space-y-4">
                {t.aiCenter.insights.map((insight, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-4 rounded-xl bg-card/50 border border-border/50"
                  >
                    <span className="font-medium">{insight.label}</span>
                    <Badge 
                      variant={insight.status === "success" ? "default" : insight.status === "warning" ? "secondary" : "outline"}
                      className={
                        insight.status === "success" ? "bg-emerald-500" :
                        insight.status === "warning" ? "bg-amber-500" : ""
                      }
                    >
                      {insight.value}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <Card className="bg-gradient-to-br from-violet-600/10 to-cyan-600/10 border-violet-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-violet-400" />
                  {isRtl ? "مقاييس الأداء" : "Performance Metrics"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: isRtl ? "استجابة API" : "API Response", value: 98, color: "bg-violet-500" },
                  { label: isRtl ? "استخدام الموارد" : "Resource Usage", value: 72, color: "bg-cyan-500" },
                  { label: isRtl ? "كفاءة المعالجة" : "Processing Efficiency", value: 95, color: "bg-emerald-500" },
                  { label: isRtl ? "دقة التنبؤ" : "Prediction Accuracy", value: 99, color: "bg-amber-500" },
                ].map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{metric.label}</span>
                      <span className="font-medium">{metric.value}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${metric.color} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${metric.value}%` }}
                        transition={{ duration: 1, delay: index * 0.2 }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzIiBjeT0iMyIgcj0iMyIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="relative max-w-4xl mx-auto px-4 text-center text-white">
          <Brain className="w-16 h-16 mx-auto mb-6 opacity-80" />
          <p className="text-2xl md:text-3xl font-bold mb-4">
            {isRtl ? "INFERA Engine ليس برنامجاً" : "INFERA Engine is not software"}
          </p>
          <p className="text-xl opacity-80 mb-8">
            {isRtl ? "إنه نظام تشغيل سيادي" : "It is a sovereign operating system"}
          </p>
          <Button 
            size="lg"
            variant="secondary"
            className="gap-3 px-10 py-8 text-xl shadow-2xl"
            onClick={() => setLocation("/sovereign-workspace")}
            data-testid="button-final-engine-cta"
          >
            <Cpu className="w-6 h-6" />
            {t.hero.cta}
          </Button>
        </div>
      </section>
    </div>
  );
}
