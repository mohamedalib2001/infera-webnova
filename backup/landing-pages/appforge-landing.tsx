import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  Smartphone, 
  Monitor,
  Blocks,
  Puzzle,
  Database,
  Plug,
  Brain,
  Sparkles,
  Rocket,
  Play,
  Store,
  Layers,
  MousePointer,
  Wand2,
  Code2,
  Palette,
  ArrowRight,
  Zap,
  CheckCircle2,
  Globe,
  LayoutGrid,
} from "lucide-react";
import { LandingWorkspaceNav } from "@/components/landing-workspace-nav";

export default function AppForgeLanding() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [buildStep, setBuildStep] = useState(0);
  const [appMorph, setAppMorph] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBuildStep(prev => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setAppMorph(prev => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const t = {
    hero: {
      badge: isRtl ? "مصنع التطبيقات بدون كود" : "No-Code Application Factory",
      title: isRtl ? "INFERA AppForge AI™" : "INFERA AppForge AI™",
      subtitle: isRtl 
        ? "فكرتك... تطبيقك... فوراً"
        : "From Idea to App",
      description: isRtl
        ? "منصة سيادية لإنشاء التطبيقات بدون كود تحوّل الأفكار إلى تطبيقات ويب وموبايل مدعومة بالذكاء الاصطناعي وجاهزة للنشر. من التصميم إلى قواعد البيانات إلى النشر على المتاجر."
        : "A sovereign no-code application factory that turns ideas into fully functional web and mobile applications with AI at the core. From design to database to store deployment.",
      cta: isRtl ? "ابدأ بناء تطبيقك" : "Start Building Your App",
    },
    stats: [
      { label: isRtl ? "تطبيقات مُنشأة" : "Apps Created", value: "12.4K", icon: Smartphone },
      { label: isRtl ? "مكونات جاهزة" : "Ready Components", value: "500+", icon: Blocks },
      { label: isRtl ? "عمليات نشر" : "Deployments", value: "8.7K", icon: Rocket },
      { label: isRtl ? "تكاملات API" : "API Integrations", value: "150+", icon: Plug },
    ],
    buildSteps: [
      { icon: Wand2, label: isRtl ? "فكرة" : "Idea", color: "bg-violet-500" },
      { icon: Palette, label: isRtl ? "تصميم" : "Design", color: "bg-cyan-500" },
      { icon: Code2, label: isRtl ? "بناء" : "Build", color: "bg-emerald-500" },
      { icon: Rocket, label: isRtl ? "نشر" : "Deploy", color: "bg-amber-500" },
    ],
    appTypes: [
      { icon: Globe, label: isRtl ? "ويب" : "Web" },
      { icon: Smartphone, label: isRtl ? "موبايل" : "Mobile" },
      { icon: Monitor, label: isRtl ? "سطح المكتب" : "Desktop" },
    ],
    sections: [
      {
        icon: Palette,
        title: isRtl ? "منشئ التطبيقات المرئي" : "Visual App Builder",
        description: isRtl 
          ? "مصمم واجهات سحب وإفلات مع منشئ منطق مرئي لبناء تطبيقات كاملة."
          : "Drag-and-drop UI designer with visual logic builder to create complete applications.",
        features: [
          { icon: MousePointer, label: isRtl ? "مصمم UI" : "UI Designer" },
          { icon: Puzzle, label: isRtl ? "منشئ المنطق" : "Logic Builder" },
          { icon: LayoutGrid, label: isRtl ? "قوالب جاهزة" : "Ready Templates" },
        ],
        color: "from-violet-600 to-purple-700",
      },
      {
        icon: Database,
        title: isRtl ? "البيانات والتكامل" : "Data & Integration",
        description: isRtl
          ? "قواعد بيانات ذكية مع اتصالات API مرنة وتكاملات متعددة."
          : "Smart databases with flexible API connections and multiple integrations.",
        features: [
          { icon: Database, label: isRtl ? "قواعد بيانات ذكية" : "Smart Databases" },
          { icon: Plug, label: isRtl ? "اتصالات API" : "API Connections" },
          { icon: Layers, label: isRtl ? "تكاملات" : "Integrations" },
        ],
        color: "from-cyan-600 to-blue-700",
      },
      {
        icon: Brain,
        title: isRtl ? "ميزات الذكاء الاصطناعي" : "AI Features",
        description: isRtl
          ? "ذكاء مدمج مع كتل منطق ذكية تتعلم وتتكيف مع احتياجاتك."
          : "Built-in intelligence with smart logic blocks that learn and adapt to your needs.",
        features: [
          { icon: Sparkles, label: isRtl ? "ذكاء مدمج" : "Built-in Intelligence" },
          { icon: Zap, label: isRtl ? "كتل ذكية" : "Smart Logic Blocks" },
          { icon: Brain, label: isRtl ? "تعلم تلقائي" : "Auto Learning" },
        ],
        color: "from-emerald-600 to-green-700",
      },
      {
        icon: Rocket,
        title: isRtl ? "مركز النشر" : "Deployment Center",
        description: isRtl
          ? "نشر بنقرة واحدة مع جاهزية للمتاجر وتحديثات فورية."
          : "One-click publish with store readiness and instant updates.",
        features: [
          { icon: Play, label: isRtl ? "نشر بنقرة" : "One-Click Publish" },
          { icon: Store, label: isRtl ? "جاهز للمتاجر" : "Store Ready" },
          { icon: Globe, label: isRtl ? "نشر عالمي" : "Global Deploy" },
        ],
        color: "from-amber-600 to-orange-700",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      <LandingWorkspaceNav platformName="INFERA AppForge AI™" platformNameAr="إنفيرا آب فورج AI™" />
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/30 via-background to-cyan-950/20" />
        
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 right-[15%] -translate-y-1/2">
            <motion.div
              className="relative w-64 h-[400px] rounded-3xl border-4 border-muted overflow-hidden bg-card/50 backdrop-blur-sm"
              animate={{ 
                borderRadius: appMorph === 0 ? "24px" : appMorph === 1 ? "12px" : "8px",
                width: appMorph === 0 ? "256px" : appMorph === 1 ? "400px" : "300px",
                height: appMorph === 0 ? "400px" : appMorph === 1 ? "300px" : "200px",
              }}
              transition={{ duration: 0.8 }}
            >
              <div className="absolute top-0 left-0 right-0 h-8 bg-muted/50 flex items-center px-3 gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <div className="absolute top-10 left-3 right-3 bottom-3 space-y-2">
                <div className="h-4 bg-violet-500/30 rounded animate-pulse" />
                <div className="h-8 bg-cyan-500/30 rounded animate-pulse" />
                <div className="h-4 bg-emerald-500/30 rounded w-2/3 animate-pulse" />
                <div className="h-12 bg-amber-500/30 rounded mt-4 animate-pulse" />
              </div>
            </motion.div>
            
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {t.appTypes.map((type, i) => {
                const Icon = type.icon;
                return (
                  <div
                    key={i}
                    className={`p-2 rounded-lg backdrop-blur-sm transition-all ${
                      appMorph === i ? 'bg-violet-500 scale-110' : 'bg-muted/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${appMorph === i ? 'text-white' : 'text-muted-foreground'}`} />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="absolute left-[10%] top-1/2 -translate-y-1/2 flex flex-col gap-4">
            {t.buildSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = buildStep >= index;
              return (
                <motion.div
                  key={index}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-sm transition-all ${
                    isActive ? 'bg-card/80 border border-border/50' : 'bg-card/30'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <div className={`p-2 rounded-lg ${isActive ? step.color : 'bg-muted/50'}`}>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
                  </div>
                  <span className={`text-sm font-medium ${isActive ? '' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                  {isActive && buildStep === index && (
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </motion.div>
              );
            })}
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
                <Blocks className="w-4 h-4 mr-2 text-violet-400" />
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
                <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
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
                onClick={() => setLocation("/ai-builder")}
                data-testid="button-start-appforge"
              >
                <Blocks className="w-5 h-5" />
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
              {isRtl ? "قدرات بناء التطبيقات" : "App Building Capabilities"}
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

      <section className="py-24 bg-gradient-to-r from-violet-600 via-cyan-600 to-emerald-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzIiBjeT0iMyIgcj0iMyIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="relative max-w-4xl mx-auto px-4 text-center text-white">
          <Blocks className="w-16 h-16 mx-auto mb-6 opacity-80" />
          <p className="text-2xl md:text-3xl font-bold mb-4">
            {isRtl ? "AppForge لا يسرّع التطوير فقط... بل يلغيه بصورته التقليدية" : "AppForge doesn't just speed up development... it redefines it"}
          </p>
          <Button 
            size="lg"
            variant="secondary"
            className="gap-3 px-10 py-8 text-xl shadow-2xl mt-8"
            onClick={() => setLocation("/ai-builder")}
            data-testid="button-final-appforge-cta"
          >
            <Rocket className="w-6 h-6" />
            {t.hero.cta}
          </Button>
        </div>
      </section>
    </div>
  );
}
