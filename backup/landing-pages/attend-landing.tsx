import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  Clock, 
  MapPin,
  Fingerprint,
  Users,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Bell,
  BarChart3,
  TrendingUp,
  Shield,
  Zap,
  ArrowRight,
  UserCheck,
  Timer,
  Activity,
  FileText,
  DollarSign,
  Eye,
} from "lucide-react";
import { LandingWorkspaceNav } from "@/components/landing-workspace-nav";

export default function AttendLanding() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [checkInPulse, setCheckInPulse] = useState(false);
  const [timelineStep, setTimelineStep] = useState(0);

  const timeline = [
    { time: "08:00", status: "in", name: isRtl ? "أحمد" : "Ahmed" },
    { time: "08:15", status: "in", name: isRtl ? "سارة" : "Sarah" },
    { time: "08:45", status: "late", name: isRtl ? "محمد" : "Mohamed" },
    { time: "09:00", status: "in", name: isRtl ? "ليلى" : "Layla" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCheckInPulse(true);
      setTimeout(() => setCheckInPulse(false), 1000);
      setTimelineStep(prev => (prev + 1) % timeline.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [timeline.length]);

  const t = {
    hero: {
      badge: isRtl ? "الحضور الذكي والحضور" : "Smart Attendance & Presence",
      title: isRtl ? "INFERA Attend AI™" : "INFERA Attend AI™",
      subtitle: isRtl 
        ? "حضور ذكي بلا تلاعب"
        : "Smart Attendance. Zero Manipulation.",
      description: isRtl
        ? "نظام حضور وانصراف ذكي سيادي يعتمد على الموقع، البصمة، والتحليل السلوكي لضمان الدقة والشفافية والالتزام."
        : "A sovereign smart attendance system based on location intelligence, biometrics, and behavioral analysis.",
      cta: isRtl ? "ابدأ نظام الحضور" : "Start Attendance System",
    },
    stats: [
      { label: isRtl ? "موظفون نشطون" : "Active Employees", value: "12,450", icon: Users },
      { label: isRtl ? "معدل الحضور" : "Attendance Rate", value: "97.8%", icon: CheckCircle2 },
      { label: isRtl ? "تسجيلات اليوم" : "Today's Check-ins", value: "8,932", icon: UserCheck },
      { label: isRtl ? "دقة التتبع" : "Tracking Accuracy", value: "99.9%", icon: MapPin },
    ],
    sections: [
      {
        icon: MapPin,
        title: isRtl ? "طرق التسجيل" : "Check-In Methods",
        description: isRtl 
          ? "تسجيل حضور متعدد الطرق: الموقع الجغرافي، البصمة، والتعرف على الوجه."
          : "Multi-method check-in: geolocation, biometrics, and facial recognition.",
        features: [
          { icon: MapPin, label: isRtl ? "الموقع الجغرافي" : "Geolocation" },
          { icon: Fingerprint, label: isRtl ? "البصمة" : "Biometrics" },
          { icon: Eye, label: isRtl ? "التعرف على الوجه" : "Face Recognition" },
        ],
        color: "from-cyan-600 to-blue-700",
      },
      {
        icon: BarChart3,
        title: isRtl ? "تحليلات الحضور" : "Attendance Analytics",
        description: isRtl
          ? "تحليل أنماط التأخير واتجاهات الحضور مع رؤى قابلة للتنفيذ."
          : "Analyze delay patterns and presence trends with actionable insights.",
        features: [
          { icon: Timer, label: isRtl ? "أنماط التأخير" : "Delay Patterns" },
          { icon: TrendingUp, label: isRtl ? "اتجاهات الحضور" : "Presence Trends" },
          { icon: Activity, label: isRtl ? "رؤى السلوك" : "Behavior Insights" },
        ],
        color: "from-violet-600 to-purple-700",
      },
      {
        icon: Users,
        title: isRtl ? "تكامل الموارد البشرية" : "HR Integration",
        description: isRtl
          ? "مزامنة تلقائية مع الرواتب والتقييمات وأنظمة الموارد البشرية."
          : "Automatic sync with payroll, evaluations, and HR systems.",
        features: [
          { icon: DollarSign, label: isRtl ? "مزامنة الرواتب" : "Payroll Sync" },
          { icon: FileText, label: isRtl ? "التقارير" : "Reports" },
          { icon: BarChart3, label: isRtl ? "التقييمات" : "Evaluations" },
        ],
        color: "from-emerald-600 to-green-700",
      },
      {
        icon: Bell,
        title: isRtl ? "التنبيهات والإشعارات" : "Alerts & Notifications",
        description: isRtl
          ? "تحذيرات ذكية وتنبيهات امتثال في الوقت الفعلي."
          : "Smart warnings and real-time compliance alerts.",
        features: [
          { icon: AlertTriangle, label: isRtl ? "تحذيرات ذكية" : "Smart Warnings" },
          { icon: Shield, label: isRtl ? "تنبيهات الامتثال" : "Compliance Alerts" },
          { icon: Zap, label: isRtl ? "إشعارات فورية" : "Instant Notifications" },
        ],
        color: "from-amber-600 to-orange-700",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      <LandingWorkspaceNav platformName="INFERA Attend AI™" platformNameAr="إنفيرا أتند AI™" />
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/30 via-background to-blue-950/20" />
        
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-1/3 right-[10%] w-32 h-32 rounded-full border-4 border-cyan-500/50"
            animate={{ scale: checkInPulse ? [1, 1.5, 1] : 1, opacity: checkInPulse ? [1, 0.3, 1] : 0.5 }}
            transition={{ duration: 1 }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <MapPin className="w-10 h-10 text-cyan-400" />
            </div>
          </motion.div>

          <div className="absolute left-[8%] top-1/2 -translate-y-1/2 w-56 rounded-xl bg-card/30 backdrop-blur-sm border border-border/50 p-4">
            <div className="text-xs text-muted-foreground mb-3">{isRtl ? "سجل الحضور" : "Attendance Log"}</div>
            {timeline.map((entry, index) => (
              <motion.div
                key={index}
                className={`flex items-center gap-3 p-2 rounded-lg mb-2 transition-all duration-500 ${
                  timelineStep === index 
                    ? 'bg-cyan-500/20 border border-cyan-500/50' 
                    : 'bg-muted/20'
                }`}
                animate={{ x: timelineStep === index ? 5 : 0 }}
              >
                <div className={`w-2 h-2 rounded-full ${
                  entry.status === 'in' ? 'bg-emerald-500' : 'bg-amber-500'
                }`} />
                <span className="text-sm font-medium">{entry.time}</span>
                <span className="text-xs text-muted-foreground flex-1">{entry.name}</span>
                {entry.status === 'late' && (
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                )}
                {entry.status === 'in' && (
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                )}
              </motion.div>
            ))}
          </div>

          <div className="absolute right-[8%] bottom-[20%] w-40 h-20 rounded-xl bg-card/30 backdrop-blur-sm border border-border/50 p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">{isRtl ? "الحضور اليوم" : "Today's Presence"}</div>
            <p className="text-2xl font-bold text-emerald-400">97.8%</p>
            <div className="flex justify-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span className="text-xs text-emerald-400">+2.3%</span>
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
                className="px-6 py-2.5 text-sm border-cyan-500/50 bg-cyan-500/10 backdrop-blur-sm"
              >
                <Clock className="w-4 h-4 mr-2 text-cyan-400" />
                <span className="text-cyan-400 font-medium">{t.hero.badge}</span>
              </Badge>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-4"
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-none">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
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
                className="gap-3 px-10 py-7 text-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-lg shadow-cyan-500/25"
                onClick={() => setLocation("/sovereign-workspace")}
                data-testid="button-start-attend"
              >
                <Clock className="w-5 h-5" />
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
                  <Icon className="w-6 h-6 mx-auto mb-2 text-cyan-400" />
                  <p className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
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
              {isRtl ? "قدرات الحضور الذكي" : "Smart Attendance Capabilities"}
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

      <section className="py-24 bg-gradient-to-r from-cyan-600 via-blue-600 to-violet-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzIiBjeT0iMyIgcj0iMyIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="relative max-w-4xl mx-auto px-4 text-center text-white">
          <Clock className="w-16 h-16 mx-auto mb-6 opacity-80" />
          <p className="text-2xl md:text-3xl font-bold mb-4">
            {isRtl ? "الحضور هنا لا يُسجّل فقط... بل يُحلّل ويُفهم" : "Attendance isn't just recorded here... it's analyzed and understood"}
          </p>
          <Button 
            size="lg"
            variant="secondary"
            className="gap-3 px-10 py-8 text-xl shadow-2xl mt-8"
            onClick={() => setLocation("/sovereign-workspace")}
            data-testid="button-final-attend-cta"
          >
            <UserCheck className="w-6 h-6" />
            {t.hero.cta}
          </Button>
        </div>
      </section>
    </div>
  );
}
