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
  Shield, 
  Infinity, 
  Settings2,
  Sparkles,
  ArrowRight,
  Search,
  Lock,
  ChevronRight,
  Rocket,
  Building2,
  Users,
  Landmark,
  Briefcase,
  CheckCircle2,
  TrendingUp,
  Zap,
  Globe,
  Server,
  Eye,
  Activity,
  Crown,
  Network,
  ShieldCheck,
  Cpu,
  Database,
  Bot,
} from "lucide-react";

interface Platform {
  id: string;
  name: string;
  name_ar?: string;
  description?: string;
  description_ar?: string;
  platform_type?: string;
  deployment_status?: string;
}

interface ComplianceData {
  project_id: string;
  compliance_score: number;
  overall_status: string;
}

export default function InferaLanding() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [activeFeature, setActiveFeature] = useState(0);
  const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null);

  const { data: platformsData } = useQuery<Platform[]>({
    queryKey: ["/api/sovereign/workspace/projects"],
  });

  const { data: complianceData } = useQuery<ComplianceData[]>({
    queryKey: ["/api/policies/compliance-all"],
  });

  const platforms = platformsData || [];
  const totalPlatforms = platforms.length;
  const activePlatforms = platforms.filter(p => p.deployment_status === "active").length;
  const avgCompliance = complianceData?.length 
    ? Math.round(complianceData.reduce((acc, c) => acc + c.compliance_score, 0) / complianceData.length)
    : 97;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const t = {
    hero: {
      badge: isRtl ? "منظومة INFERA السيادية" : "INFERA Sovereign Ecosystem",
      title: isRtl 
        ? "منصات سيادية مدعومة بالذكاء الاصطناعي"
        : "Sovereign AI Platforms",
      subtitle: isRtl
        ? "لإدارة المستقبل... لا مجرد تشغيل الحاضر"
        : "Built for Absolute Control",
      description: isRtl
        ? "INFERA ليست برنامجاً، بل منظومة سيادية ذكية تتحكم، تتوقع، وتُدير الأنظمة والقرارات بمستوى يتجاوز كل ما هو موجود في السوق."
        : "INFERA is not software, it's a sovereign intelligent ecosystem that controls, predicts, and manages systems and decisions at a level beyond anything in the market.",
      cta: isRtl ? "اطلب الوصول السيادي" : "Request Sovereign Access",
      ctaSecondary: isRtl ? "استكشف المنظومة" : "Explore Ecosystem",
    },
    whyInfera: {
      title: isRtl ? "لماذا INFERA؟" : "Why INFERA?",
      subtitle: isRtl ? "لأن السوق متأخر... وINFERA سبقت الجميع." : "Because the market is behind... and INFERA leads the way.",
    },
    features: [
      {
        icon: Brain,
        title: isRtl ? "ذكاء حقيقي" : "Real AI",
        titleFull: isRtl ? "AI-First by Design" : "AI-First by Design",
        description: isRtl 
          ? "الذكاء الاصطناعي ليس إضافة... إنه الأساس. قرارات تنبؤية، تحليل سلوك ذكي، توصيات فورية، أتمتة ذاتية."
          : "AI is not an add-on... it's the foundation. Predictive decisions, intelligent behavior analysis, instant recommendations, self-automation.",
        color: "from-violet-500 to-purple-600",
        gradient: "bg-gradient-to-br from-violet-500/20 to-purple-600/20",
      },
      {
        icon: Shield,
        title: isRtl ? "أمن سيادي" : "Sovereign Security",
        titleFull: isRtl ? "Sovereign-Grade Security" : "Sovereign-Grade Security",
        description: isRtl
          ? "Zero-Trust Architecture، تشفير شامل، كشف تهديدات بالذكاء الاصطناعي، استجابة تلقائية فورية. منصات مصممة لتكون غير قابلة للاختراق."
          : "Zero-Trust Architecture, end-to-end encryption, AI threat detection, automatic instant response. Platforms designed to be unhackable.",
        color: "from-emerald-500 to-green-600",
        gradient: "bg-gradient-to-br from-emerald-500/20 to-green-600/20",
      },
      {
        icon: Infinity,
        title: isRtl ? "توسع لا نهائي" : "Infinite Scale",
        titleFull: isRtl ? "Infinite Scalability" : "Infinite Scalability",
        description: isRtl
          ? "منصات لا تتجمد ولا تنتهي. بنية Modular، توسع Live بدون توقف، إضافة ميزات بدون Refactoring، جاهزية للمستقبل."
          : "Platforms that never freeze or end. Modular architecture, live scaling without downtime, add features without refactoring, future-ready.",
        color: "from-cyan-500 to-blue-600",
        gradient: "bg-gradient-to-br from-cyan-500/20 to-blue-600/20",
      },
      {
        icon: Settings2,
        title: isRtl ? "تحكم مطلق" : "Absolute Control",
        titleFull: isRtl ? "Absolute Control" : "Absolute Control",
        description: isRtl
          ? "كل شيء تحت السيطرة. إدارة مركزية، سياسات حاكمة ذكية، صلاحيات ديناميكية، مراقبة لحظية شاملة."
          : "Everything under control. Centralized management, intelligent governing policies, dynamic permissions, comprehensive real-time monitoring.",
        color: "from-amber-500 to-orange-600",
        gradient: "bg-gradient-to-br from-amber-500/20 to-orange-600/20",
      },
    ],
    ecosystem: {
      title: isRtl ? "منظومة INFERA" : "The Ecosystem",
      subtitle: isRtl ? "جميعها تعمل بعقل واحد... INFERA Engine" : "All powered by one brain... INFERA Engine",
    },
    corePlatforms: [
      {
        icon: Cpu,
        name: "INFERA Engine™",
        description: isRtl ? "العقل المركزي للمنظومة" : "Central Brain of the Ecosystem",
        color: "from-violet-600 to-purple-700",
      },
      {
        icon: Crown,
        name: "Engine Control™",
        description: isRtl ? "الحساب السيادي الأعلى" : "Supreme Sovereign Account",
        color: "from-amber-500 to-orange-600",
      },
      {
        icon: Shield,
        name: "ShieldGrid™",
        description: isRtl ? "دفاع سيبراني سيادي" : "Sovereign Cyber Defense",
        color: "from-emerald-500 to-green-600",
      },
    ],
    targetAudience: {
      title: isRtl ? "لمن صُممت INFERA؟" : "Who is INFERA for?",
      items: [
        { icon: Landmark, text: isRtl ? "جهات سيادية وحكومية" : "Government & Sovereign Entities" },
        { icon: Building2, text: isRtl ? "شركات كبرى ومجموعات استثمارية" : "Large Corporations & Investment Groups" },
        { icon: Briefcase, text: isRtl ? "مؤسسات تبحث عن التفوق" : "Organizations Seeking Excellence" },
        { icon: Rocket, text: isRtl ? "روّاد يريدون قيادة السوق" : "Leaders Who Want to Lead the Market" },
      ],
    },
    trust: {
      title: isRtl ? "الثقة والحوكمة" : "Trust & Governance",
      items: [
        { label: isRtl ? "سياسات سيادية حاكمة" : "Sovereign Governing Policies" },
        { label: isRtl ? "Policy Validator AI" : "Policy Validator AI" },
        { label: isRtl ? "Compliance Scoring لحظي" : "Real-time Compliance Scoring" },
        { label: isRtl ? "محاكاة مخاطر مستقبلية" : "Future Risk Simulation" },
        { label: isRtl ? "Strategic Forecast Engine" : "Strategic Forecast Engine" },
      ],
    },
    finalCta: {
      question1: isRtl ? "هل تبحث عن برنامج؟" : "Looking for software?",
      answer1: isRtl ? "INFERA ليست لك." : "INFERA is not for you.",
      question2: isRtl ? "هل تبحث عن منصة تُدير المستقبل؟" : "Looking for a platform that manages the future?",
      answer2: isRtl ? "أنت في المكان الصحيح." : "You're in the right place.",
      cta: isRtl ? "اطلب الوصول السيادي الآن" : "Request Sovereign Access Now",
      note: isRtl ? "الوصول محدود – الاختيار دقيق" : "Limited Access – Selective Admission",
    },
    stats: {
      platforms: isRtl ? "منصة سيادية" : "Sovereign Platforms",
      active: isRtl ? "منصة نشطة" : "Active Platforms",
      compliance: isRtl ? "متوسط الامتثال" : "Avg Compliance",
      uptime: isRtl ? "وقت التشغيل" : "Uptime",
    },
    superiority: [
      "Salesforce", "SAP", "ServiceNow", "Palantir"
    ],
  };

  const currentFeature = t.features[activeFeature];
  const FeatureIcon = currentFeature.icon;

  return (
    <div className="min-h-screen bg-background overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-cyan-600/5" />
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-[10%] w-96 h-96 bg-violet-500/10 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-20 right-[10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1.5s" }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-[150px]" />
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--background))_70%)]" />
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
                className="px-6 py-2.5 text-sm border-violet-400/50 bg-violet-500/10 backdrop-blur-sm"
              >
                <Globe className="w-4 h-4 mr-2 text-violet-400" />
                <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent font-medium">
                  {t.hero.badge}
                </span>
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
              className="flex flex-wrap justify-center gap-4 pt-6"
            >
              <Button 
                size="lg"
                className="gap-3 px-8 py-7 text-lg bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 shadow-lg shadow-violet-500/25"
                onClick={() => setLocation("/auth")}
                data-testid="button-request-access"
              >
                <Rocket className="w-5 h-5" />
                {t.hero.cta}
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="gap-3 px-8 py-7 text-lg border-violet-500/30 hover:bg-violet-500/10 backdrop-blur-sm"
                onClick={() => setLocation("/sovereign-workspace")}
                data-testid="button-explore"
              >
                <Search className="w-5 h-5" />
                {t.hero.ctaSecondary}
              </Button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto"
          >
            {[
              { value: totalPlatforms || "30+", label: t.stats.platforms, icon: Network },
              { value: activePlatforms || "20+", label: t.stats.active, icon: Activity },
              { value: `${avgCompliance}%`, label: t.stats.compliance, icon: ShieldCheck },
              { value: "99.99%", label: t.stats.uptime, icon: Server },
            ].map((stat, i) => (
              <div 
                key={i} 
                className="relative group p-6 rounded-xl bg-card/30 backdrop-blur-sm border border-border/50 hover-elevate"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-cyan-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative text-center">
                  <stat.icon className="w-6 h-6 mx-auto mb-3 text-violet-400" />
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-muted/20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">{t.whyInfera.title}</h2>
            <p className="text-xl text-muted-foreground">{t.whyInfera.subtitle}</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              {t.features.map((feature, index) => {
                const Icon = feature.icon;
                const isActive = activeFeature === index;
                return (
                  <div
                    key={index}
                    className={`relative p-6 rounded-xl border cursor-pointer transition-all duration-300 ${
                      isActive 
                        ? `${feature.gradient} border-transparent shadow-lg` 
                        : "bg-card/50 border-border/50 hover:bg-card/80"
                    }`}
                    onClick={() => setActiveFeature(index)}
                    data-testid={`feature-${index}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold mb-1">{feature.titleFull}</h3>
                        <AnimatePresence mode="wait">
                          {isActive && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="text-sm text-muted-foreground"
                            >
                              {feature.description}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                      <ChevronRight className={`w-5 h-5 transition-transform ${isActive ? "rotate-90" : ""}`} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-cyan-500/20 rounded-3xl blur-3xl" />
              <Card className="relative backdrop-blur-xl bg-card/80 border-violet-500/20 overflow-hidden">
                <CardContent className="p-8">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeFeature}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${currentFeature.color} flex items-center justify-center`}>
                        <FeatureIcon className="w-10 h-10 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-3">{currentFeature.titleFull}</h3>
                        <p className="text-muted-foreground leading-relaxed">{currentFeature.description}</p>
                      </div>
                      <div className="pt-4 border-t border-border/50">
                        <div className="flex items-center gap-2 text-sm text-violet-400">
                          <Sparkles className="w-4 h-4" />
                          <span>{isRtl ? "تجربة WOW من أول دقيقة" : "WOW Experience from the first minute"}</span>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">{t.ecosystem.title}</h2>
            <p className="text-xl text-muted-foreground">{t.ecosystem.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {t.corePlatforms.map((platform, index) => {
              const Icon = platform.icon;
              return (
                <Card 
                  key={index}
                  className="group hover-elevate border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
                >
                  <CardContent className="p-8 text-center space-y-4">
                    <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${platform.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold">{platform.name}</h3>
                    <p className="text-sm text-muted-foreground">{platform.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {platforms.length > 0 && (
            <div className="mt-12">
              <h3 className="text-2xl font-semibold text-center mb-8">
                {isRtl ? "المنصات الذكية المتخصصة" : "Specialized Smart Platforms"}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {platforms.slice(0, 10).map((platform) => (
                  <div
                    key={platform.id}
                    className={`relative p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                      hoveredPlatform === platform.id
                        ? "bg-violet-500/10 border-violet-500/50 scale-105"
                        : "bg-card/30 border-border/50 hover:bg-card/50"
                    }`}
                    onMouseEnter={() => setHoveredPlatform(platform.id)}
                    onMouseLeave={() => setHoveredPlatform(null)}
                    onClick={() => setLocation("/sovereign-workspace")}
                    data-testid={`platform-${platform.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {isRtl ? platform.name_ar || platform.name : platform.name}
                        </p>
                        <Badge variant="secondary" className="text-[10px] mt-1">
                          {platform.platform_type === "root" ? (isRtl ? "جذر" : "Root") : (isRtl ? "فرعية" : "Sub")}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {platforms.length > 10 && (
                <div className="text-center mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setLocation("/sovereign-workspace")}
                    data-testid="button-view-all-platforms"
                  >
                    {isRtl ? `عرض جميع المنصات (${platforms.length})` : `View All Platforms (${platforms.length})`}
                    <ChevronRight className="w-4 h-4 ms-2" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="py-24 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl font-bold mb-8">{t.targetAudience.title}</h2>
              <div className="space-y-4">
                {t.targetAudience.items.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div 
                      key={index}
                      className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/50 hover-elevate"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-lg font-medium">{item.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="text-4xl font-bold mb-8">{t.trust.title}</h2>
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-6 space-y-4">
                  {t.trust.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-border/50">
                    <p className="text-sm text-muted-foreground">
                      {isRtl 
                        ? "كل منصة تُراجع، تُقيّم، وتُحكم ذكيًا قبل النشر."
                        : "Every platform is reviewed, evaluated, and governed by AI before deployment."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">
                  {isRtl ? "INFERA تتفوق على:" : "INFERA Outperforms:"}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {t.superiority.map((company, index) => (
                    <Badge 
                      key={index}
                      variant="outline"
                      className="px-4 py-2 text-sm border-muted-foreground/30"
                    >
                      {company}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  {isRtl ? "ليس بالتقليد... بل بتغيير قواعد اللعبة." : "Not by imitation... but by changing the rules of the game."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-cyan-600" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzIiBjeT0iMyIgcj0iMyIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="relative max-w-4xl mx-auto px-4 text-center text-white">
          <div className="space-y-6 mb-12">
            <p className="text-xl opacity-80">{t.finalCta.question1}</p>
            <p className="text-2xl font-semibold">{t.finalCta.answer1}</p>
            <div className="h-px w-24 mx-auto bg-white/30" />
            <p className="text-xl opacity-80">{t.finalCta.question2}</p>
            <p className="text-3xl font-bold">{t.finalCta.answer2}</p>
          </div>

          <Button 
            size="lg"
            variant="secondary"
            className="gap-3 px-10 py-8 text-xl shadow-2xl"
            onClick={() => setLocation("/auth")}
            data-testid="button-final-cta"
          >
            <Rocket className="w-6 h-6" />
            {t.finalCta.cta}
          </Button>

          <div className="flex items-center justify-center gap-2 mt-8 text-white/70">
            <Lock className="w-4 h-4" />
            <span className="text-sm">{t.finalCta.note}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
