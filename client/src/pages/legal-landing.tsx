import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  Scale, 
  FileText,
  AlertTriangle,
  Shield,
  Clock,
  Calendar,
  Bell,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  Gavel,
  FileSearch,
  AlertCircle,
  TrendingUp,
  BarChart3,
  ArrowRight,
  Sparkles,
  Bookmark,
  Target,
  Zap,
  Brain,
} from "lucide-react";

export default function LegalLanding() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [radarAngle, setRadarAngle] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHighlightIndex(prev => (prev + 1) % 5);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setRadarAngle(prev => (prev + 2) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const t = {
    hero: {
      badge: isRtl ? "الذكاء القانوني السيادي" : "Sovereign Legal Intelligence",
      title: isRtl ? "INFERA Legal AI™" : "INFERA Legal AI™",
      subtitle: isRtl 
        ? "قانون يفكّر قبل أن يُخطئ"
        : "Legal Intelligence That Thinks Ahead",
      description: isRtl
        ? "منصة ذكاء قانوني سيادي تحوّل العقود والمستندات القانونية من عبء تشغيلي إلى نظام استباقي ذكي. القانون هنا لا يُراجع... بل يُدار بذكاء."
        : "A sovereign legal intelligence platform that transforms contracts and legal documents into proactive, predictive systems. Legal operations move from reaction to prediction.",
      cta: isRtl ? "ابدأ التحليل القانوني" : "Start Legal Analysis",
    },
    stats: [
      { label: isRtl ? "عقود نشطة" : "Active Contracts", value: "1,247", icon: FileText },
      { label: isRtl ? "بنود مستخرجة" : "Extracted Clauses", value: "45.2K", icon: Bookmark },
      { label: isRtl ? "تنبيهات مرسلة" : "Alerts Sent", value: "892", icon: Bell },
      { label: isRtl ? "نسبة الامتثال" : "Compliance Rate", value: "98.7%", icon: Shield },
    ],
    clauses: [
      { text: isRtl ? "شرط السرية - ينتهي في 30 يوم" : "Confidentiality Clause - Expires in 30 days", risk: "medium" },
      { text: isRtl ? "شرط الدفع - مستحق اليوم" : "Payment Clause - Due Today", risk: "high" },
      { text: isRtl ? "شرط التجديد - تلقائي" : "Renewal Clause - Automatic", risk: "low" },
      { text: isRtl ? "شرط الإنهاء - 90 يوم إشعار" : "Termination Clause - 90 days notice", risk: "low" },
      { text: isRtl ? "شرط التعويض - يحتاج مراجعة" : "Indemnity Clause - Needs Review", risk: "high" },
    ],
    sections: [
      {
        icon: FileSearch,
        title: isRtl ? "محلل العقود الذكي" : "Smart Contract Analyzer",
        description: isRtl 
          ? "استخراج تلقائي للبنود والتواريخ والالتزامات من أي مستند قانوني."
          : "Automatic extraction of clauses, dates, and obligations from any legal document.",
        features: [
          { icon: Search, label: isRtl ? "استخراج البنود" : "Clause Extraction" },
          { icon: Calendar, label: isRtl ? "تتبع التواريخ" : "Date Mapping" },
          { icon: Target, label: isRtl ? "رصد الالتزامات" : "Obligation Tracking" },
        ],
        color: "from-amber-600 to-orange-700",
      },
      {
        icon: Shield,
        title: isRtl ? "رادار المخاطر والامتثال" : "Risk & Compliance Radar",
        description: isRtl
          ? "تقييم مستمر للمخاطر القانونية مع حالة الامتثال في الوقت الفعلي."
          : "Continuous legal risk assessment with real-time compliance status.",
        features: [
          { icon: AlertTriangle, label: isRtl ? "تقييم المخاطر" : "Risk Scores" },
          { icon: CheckCircle2, label: isRtl ? "حالة الامتثال" : "Compliance Status" },
          { icon: Eye, label: isRtl ? "المراقبة المستمرة" : "Continuous Monitoring" },
        ],
        color: "from-red-600 to-rose-700",
      },
      {
        icon: Bell,
        title: isRtl ? "التنبيهات والإشعارات" : "Alerts & Notifications",
        description: isRtl
          ? "تذكيرات ذكية وتصعيد تلقائي قبل حدوث المشاكل."
          : "Smart reminders and automatic escalation before issues occur.",
        features: [
          { icon: Clock, label: isRtl ? "تذكيرات ذكية" : "Smart Reminders" },
          { icon: Zap, label: isRtl ? "تصعيد تلقائي" : "Escalation Flow" },
          { icon: Bell, label: isRtl ? "إشعارات فورية" : "Instant Notifications" },
        ],
        color: "from-violet-600 to-purple-700",
      },
      {
        icon: Brain,
        title: isRtl ? "تقارير الذكاء القانوني" : "Legal Intelligence Reports",
        description: isRtl
          ? "رؤى قانونية تنبؤية مع تحليلات متقدمة وتوصيات ذكية."
          : "Predictive legal insights with advanced analytics and smart recommendations.",
        features: [
          { icon: BarChart3, label: isRtl ? "تحليلات متقدمة" : "Advanced Analytics" },
          { icon: TrendingUp, label: isRtl ? "رؤى تنبؤية" : "Predictive Insights" },
          { icon: Sparkles, label: isRtl ? "توصيات AI" : "AI Recommendations" },
        ],
        color: "from-cyan-600 to-blue-700",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/30 via-background to-red-950/20" />
        
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 right-[15%] -translate-y-1/2 w-80 h-80">
            <div className="absolute inset-0 rounded-full border-2 border-amber-500/20" />
            <div className="absolute inset-4 rounded-full border border-orange-500/30" />
            <div className="absolute inset-8 rounded-full border border-red-500/40" />
            <div 
              className="absolute top-1/2 left-1/2 w-1 h-32 bg-gradient-to-t from-red-500 to-transparent origin-bottom"
              style={{ transform: `translate(-50%, -100%) rotate(${radarAngle}deg)` }}
            />
            <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-amber-500 rounded-full -translate-x-1/2 -translate-y-1/2" />
          </div>

          <div className="absolute left-[10%] top-[20%] w-96 space-y-2">
            {t.clauses.map((clause, index) => (
              <motion.div
                key={index}
                className={`p-3 rounded-lg backdrop-blur-sm border transition-all duration-500 ${
                  highlightIndex === index 
                    ? clause.risk === 'high' 
                      ? 'bg-red-500/20 border-red-500/50 scale-105' 
                      : clause.risk === 'medium'
                        ? 'bg-amber-500/20 border-amber-500/50 scale-105'
                        : 'bg-emerald-500/20 border-emerald-500/50 scale-105'
                    : 'bg-card/20 border-border/30'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    clause.risk === 'high' ? 'bg-red-500' : 
                    clause.risk === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />
                  <span className="text-xs text-muted-foreground">{clause.text}</span>
                </div>
              </motion.div>
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
                className="px-6 py-2.5 text-sm border-amber-500/50 bg-amber-500/10 backdrop-blur-sm"
              >
                <Scale className="w-4 h-4 mr-2 text-amber-400" />
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
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
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
                data-testid="button-start-legal"
              >
                <Gavel className="w-5 h-5" />
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
              {isRtl ? "قدرات الذكاء القانوني" : "Legal Intelligence Capabilities"}
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

      <section className="py-24 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzIiBjeT0iMyIgcj0iMyIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="relative max-w-4xl mx-auto px-4 text-center text-white">
          <Scale className="w-16 h-16 mx-auto mb-6 opacity-80" />
          <p className="text-2xl md:text-3xl font-bold mb-4">
            {isRtl ? "القانون هنا لا يُراجع... بل يُدار بذكاء" : "Legal operations move from reaction to prediction"}
          </p>
          <Button 
            size="lg"
            variant="secondary"
            className="gap-3 px-10 py-8 text-xl shadow-2xl mt-8"
            onClick={() => setLocation("/sovereign-workspace")}
            data-testid="button-final-legal-cta"
          >
            <Gavel className="w-6 h-6" />
            {t.hero.cta}
          </Button>
        </div>
      </section>
    </div>
  );
}
