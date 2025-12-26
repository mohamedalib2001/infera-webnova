import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  Shield, 
  AlertTriangle,
  Activity,
  Lock,
  Eye,
  Zap,
  FileText,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Brain,
  Radio,
  ShieldCheck,
  ShieldAlert,
  Radar,
  Bug,
  Server,
  BarChart3,
} from "lucide-react";
import { LandingWorkspaceNav } from "@/components/landing-workspace-nav";

export default function ShieldGridLanding() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [threatLevel, setThreatLevel] = useState(0);
  const [shieldActive, setShieldActive] = useState(true);
  const [pulseIndex, setPulseIndex] = useState(0);

  const threats = [
    { type: isRtl ? "DDoS" : "DDoS", status: "blocked", severity: "high" },
    { type: isRtl ? "SQL Injection" : "SQL Injection", status: "blocked", severity: "critical" },
    { type: isRtl ? "Phishing" : "Phishing", status: "detected", severity: "medium" },
    { type: isRtl ? "Malware" : "Malware", status: "blocked", severity: "high" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setThreatLevel(prev => (prev + 1) % 101);
      setPulseIndex(prev => (prev + 1) % threats.length);
      setShieldActive(prev => !prev || Math.random() > 0.1);
    }, 1500);
    return () => clearInterval(interval);
  }, [threats.length]);

  const t = {
    hero: {
      badge: isRtl ? "الدفاع السيبراني" : "Cyber Defense",
      title: isRtl ? "INFERA ShieldGrid™" : "INFERA ShieldGrid™",
      subtitle: isRtl 
        ? "دفاع رقمي بلا اختراق"
        : "Impenetrable Digital Defense",
      description: isRtl
        ? "منصة دفاع سيبراني سيادي تحمي منظومة INFERA بالكامل من التهديدات والهجمات الرقمية بذكاء استباقي."
        : "A sovereign cyber defense platform designed to protect the entire INFERA ecosystem with AI-driven proactive security.",
      cta: isRtl ? "تفعيل الحماية" : "Activate Protection",
    },
    stats: [
      { label: isRtl ? "تهديدات محظورة" : "Threats Blocked", value: "12.4M", icon: ShieldCheck },
      { label: isRtl ? "وقت الاستجابة" : "Response Time", value: "<0.3s", icon: Zap },
      { label: isRtl ? "نقاط مراقبة" : "Monitoring Points", value: "850K+", icon: Radar },
      { label: isRtl ? "وقت التشغيل" : "Uptime", value: "99.99%", icon: Activity },
    ],
    sections: [
      {
        icon: Eye,
        title: isRtl ? "مراقبة التهديدات" : "Threat Monitoring",
        description: isRtl 
          ? "مراقبة مستمرة على مدار الساعة لكشف التهديدات في الوقت الفعلي."
          : "24/7 continuous monitoring for real-time threat detection.",
        features: [
          { icon: Radar, label: isRtl ? "كشف لحظي" : "Real-time Detection" },
          { icon: Activity, label: isRtl ? "مراقبة مستمرة" : "Continuous Monitoring" },
          { icon: Radio, label: isRtl ? "تنبيهات فورية" : "Instant Alerts" },
        ],
        color: "from-red-600 to-orange-700",
      },
      {
        icon: Brain,
        title: isRtl ? "تحليل المخاطر AI" : "AI Risk Analysis",
        description: isRtl
          ? "تحليل ذكي للتهديدات وتقييم المخاطر باستخدام التعلم الآلي."
          : "Intelligent threat analysis and risk assessment using machine learning.",
        features: [
          { icon: Bug, label: isRtl ? "كشف الثغرات" : "Vulnerability Detection" },
          { icon: BarChart3, label: isRtl ? "تقييم المخاطر" : "Risk Assessment" },
          { icon: Brain, label: isRtl ? "تعلم آلي" : "Machine Learning" },
        ],
        color: "from-violet-600 to-purple-700",
      },
      {
        icon: Zap,
        title: isRtl ? "الاستجابة للحوادث" : "Incident Response",
        description: isRtl
          ? "استجابة ذاتية فورية للحوادث الأمنية مع عزل التهديدات."
          : "Automatic instant response to security incidents with threat isolation.",
        features: [
          { icon: ShieldAlert, label: isRtl ? "استجابة فورية" : "Instant Response" },
          { icon: Lock, label: isRtl ? "عزل التهديد" : "Threat Isolation" },
          { icon: CheckCircle2, label: isRtl ? "معالجة تلقائية" : "Auto Remediation" },
        ],
        color: "from-blue-600 to-cyan-700",
      },
      {
        icon: FileText,
        title: isRtl ? "تقارير الأمان" : "Security Reports",
        description: isRtl
          ? "تقارير شاملة عن الوضع الأمني مع توصيات تحسين."
          : "Comprehensive security status reports with improvement recommendations.",
        features: [
          { icon: BarChart3, label: isRtl ? "تحليلات شاملة" : "Full Analytics" },
          { icon: FileText, label: isRtl ? "تقارير مفصلة" : "Detailed Reports" },
          { icon: Server, label: isRtl ? "سجل الأحداث" : "Event Logs" },
        ],
        color: "from-emerald-600 to-green-700",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      <LandingWorkspaceNav platformName="INFERA ShieldGrid™" platformNameAr="إنفيرا شيلد جريد™" />
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 via-background to-violet-950/20" />
        
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[15%] right-[8%] w-56 rounded-xl bg-card/30 backdrop-blur-sm border border-border/50 p-4">
            <div className="text-xs text-muted-foreground mb-3">{isRtl ? "سجل التهديدات" : "Threat Log"}</div>
            {threats.map((threat, index) => (
              <motion.div
                key={index}
                className={`flex items-center justify-between p-2 rounded-lg mb-2 transition-all duration-500 ${
                  pulseIndex === index 
                    ? threat.status === 'blocked' 
                      ? 'bg-emerald-500/20 border border-emerald-500/50' 
                      : 'bg-amber-500/20 border border-amber-500/50'
                    : 'bg-muted/20'
                }`}
                animate={{ scale: pulseIndex === index ? 1.02 : 1 }}
              >
                <div className="flex items-center gap-2">
                  {threat.status === 'blocked' ? (
                    <XCircle className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  )}
                  <span className="text-sm">{threat.type}</span>
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    threat.severity === 'critical' ? 'border-red-500 text-red-500' :
                    threat.severity === 'high' ? 'border-orange-500 text-orange-500' :
                    'border-amber-500 text-amber-500'
                  }`}
                >
                  {threat.severity}
                </Badge>
              </motion.div>
            ))}
          </div>

          <div className="absolute left-[8%] top-1/2 -translate-y-1/2">
            <div className="relative">
              <motion.div
                className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 ${
                  shieldActive ? 'bg-emerald-500/20' : 'bg-red-500/20'
                }`}
                animate={{ 
                  scale: [1, 1.1, 1],
                  boxShadow: shieldActive 
                    ? ['0 0 0 0 rgba(34, 197, 94, 0.4)', '0 0 0 20px rgba(34, 197, 94, 0)', '0 0 0 0 rgba(34, 197, 94, 0)']
                    : ['0 0 0 0 rgba(239, 68, 68, 0.4)', '0 0 0 20px rgba(239, 68, 68, 0)', '0 0 0 0 rgba(239, 68, 68, 0)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <motion.div
                  className={`w-28 h-28 rounded-full flex items-center justify-center ${
                    shieldActive ? 'bg-emerald-500/30' : 'bg-red-500/30'
                  }`}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                >
                  <Shield className={`w-14 h-14 ${shieldActive ? 'text-emerald-400' : 'text-red-400'}`} />
                </motion.div>
              </motion.div>
              <p className={`text-center mt-4 text-sm font-medium ${shieldActive ? 'text-emerald-400' : 'text-red-400'}`}>
                {shieldActive 
                  ? (isRtl ? "الحماية نشطة" : "Protection Active") 
                  : (isRtl ? "جاري المعالجة" : "Processing...")}
              </p>
            </div>
          </div>

          <motion.div
            className="absolute right-[10%] bottom-[20%] p-4 rounded-xl bg-card/30 backdrop-blur-sm border border-emerald-500/50"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="text-xs text-muted-foreground mb-2">{isRtl ? "مستوى الأمان" : "Security Level"}</div>
            <div className="relative w-32 h-3 bg-muted/50 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                animate={{ width: `${100 - (threatLevel % 20)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-right text-sm font-bold text-emerald-400 mt-1">{100 - (threatLevel % 20)}%</p>
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
                className="px-6 py-2.5 text-sm border-red-500/50 bg-red-500/10 backdrop-blur-sm"
              >
                <Shield className="w-4 h-4 mr-2 text-red-400" />
                <span className="text-red-400 font-medium">{t.hero.badge}</span>
              </Badge>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-4"
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-none">
                <span className="bg-gradient-to-r from-red-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
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
                className="gap-3 px-10 py-7 text-lg bg-gradient-to-r from-red-600 to-violet-600 hover:from-red-700 hover:to-violet-700 shadow-lg shadow-red-500/25"
                onClick={() => setLocation("/sovereign-workspace")}
                data-testid="button-start-shieldgrid"
              >
                <Shield className="w-5 h-5" />
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
                  <Icon className="w-6 h-6 mx-auto mb-2 text-red-400" />
                  <p className="text-2xl font-bold bg-gradient-to-r from-red-400 to-violet-400 bg-clip-text text-transparent">
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
              {isRtl ? "قدرات الدفاع السيبراني" : "Cyber Defense Capabilities"}
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

      <section className="py-24 bg-gradient-to-r from-red-600 via-violet-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzIiBjeT0iMyIgcj0iMyIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="relative max-w-4xl mx-auto px-4 text-center text-white">
          <Shield className="w-16 h-16 mx-auto mb-6 opacity-80" />
          <p className="text-2xl md:text-3xl font-bold mb-4">
            {isRtl ? "الدفاع هنا استباقي، ذكي، وذاتي الاستجابة" : "Defense here is proactive, intelligent, and self-responding"}
          </p>
          <Button 
            size="lg"
            variant="secondary"
            className="gap-3 px-10 py-8 text-xl shadow-2xl mt-8"
            onClick={() => setLocation("/sovereign-workspace")}
            data-testid="button-final-shieldgrid-cta"
          >
            <ShieldCheck className="w-6 h-6" />
            {t.hero.cta}
          </Button>
        </div>
      </section>
    </div>
  );
}
