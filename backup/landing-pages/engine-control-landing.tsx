import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  Lock,
  Fingerprint,
  Eye,
  AlertTriangle,
  Activity,
  Zap,
  Crown,
  Server,
  Network,
  ShieldCheck,
  ShieldAlert,
  Key,
  UserCheck,
  FileWarning,
  Radio,
  Target,
  Siren,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Globe,
  Cpu,
} from "lucide-react";
import { LandingWorkspaceNav } from "@/components/landing-workspace-nav";

export default function EngineControlLanding() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [threatLevel, setThreatLevel] = useState<"low" | "medium" | "high">("low");
  const [activeSection, setActiveSection] = useState(0);
  const [pulseActive, setPulseActive] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseActive(prev => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSection(prev => (prev + 1) % 5);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const t = {
    hero: {
      badge: isRtl ? "غرفة القيادة السيادية" : "Sovereign Command Room",
      title: isRtl ? "INFERA Engine Control™" : "INFERA Engine Control™",
      subtitle: isRtl 
        ? "الحساب السيادي الأعلى"
        : "Supreme Sovereign Account",
      description: isRtl
        ? "منصة الحساب السيادي الأعلى لإدارة الأمن، الصلاحيات، والتحكم المطلق في جميع منصات وخدمات منظومة INFERA. هذه ليست لوحة تحكم، بل غرفة قيادة سيادية رقمية."
        : "The supreme sovereign account platform for security governance, identity control, and absolute authority over all INFERA platforms. This is not a dashboard - it is a sovereign digital command room.",
      cta: isRtl ? "طلب الوصول السيادي" : "Request Sovereign Access",
    },
    stats: [
      { label: isRtl ? "حالة الأمان" : "Security Status", value: isRtl ? "آمن" : "Secure", color: "text-emerald-500", icon: ShieldCheck },
      { label: isRtl ? "مستوى التهديد" : "Threat Level", value: isRtl ? "منخفض" : "Low", color: "text-emerald-500", icon: Target },
      { label: isRtl ? "جلسات نشطة" : "Active Sessions", value: "24", color: "text-blue-500", icon: Activity },
      { label: isRtl ? "سياسات مُفعّلة" : "Active Policies", value: "156", color: "text-violet-500", icon: FileWarning },
    ],
    sections: [
      {
        id: "identity",
        icon: Fingerprint,
        title: isRtl ? "الهوية السيادية" : "Sovereign Identity",
        description: isRtl 
          ? "إدارة شاملة للهويات السيادية مع مستويات وصول ديناميكية وتحقق متعدد الطبقات."
          : "Comprehensive sovereign identity management with dynamic access levels and multi-layer verification.",
        features: [
          isRtl ? "التحقق البيومتري" : "Biometric Verification",
          isRtl ? "مستويات الوصول الديناميكية" : "Dynamic Access Levels",
          isRtl ? "المصادقة متعددة العوامل" : "Multi-Factor Authentication",
        ],
        color: "from-violet-600 to-purple-700",
      },
      {
        id: "security",
        icon: Shield,
        title: isRtl ? "مركز الأمان" : "Security Command",
        description: isRtl
          ? "رادار تهديدات حي مع مؤشرات مخاطر لحظية واستجابة تلقائية للحوادث."
          : "Live threat radar with real-time risk indicators and automatic incident response.",
        features: [
          isRtl ? "رادار التهديدات" : "Threat Radar",
          isRtl ? "مؤشرات المخاطر" : "Risk Indicators",
          isRtl ? "سجلات حية" : "Live Audit Logs",
        ],
        color: "from-emerald-600 to-green-700",
      },
      {
        id: "policy",
        icon: FileWarning,
        title: isRtl ? "حوكمة السياسات" : "Policy Governance",
        description: isRtl
          ? "تطبيق السياسات الحاكمة بالذكاء الاصطناعي مع تقييم امتثال لحظي."
          : "AI-powered policy enforcement with real-time compliance scoring.",
        features: [
          isRtl ? "Policy Validator AI" : "Policy Validator AI",
          isRtl ? "تدفق الإنفاذ" : "Enforcement Flow",
          isRtl ? "تقييم الامتثال" : "Compliance Scoring",
        ],
        color: "from-amber-600 to-orange-700",
      },
      {
        id: "emergency",
        icon: Siren,
        title: isRtl ? "التحكم الطارئ" : "Emergency Control",
        description: isRtl
          ? "بروتوكولات الطوارئ السيادية للإغلاق الفوري والتجاوز المصرح."
          : "Sovereign emergency protocols for immediate lockdown and authorized override.",
        features: [
          isRtl ? "وضع الإغلاق" : "Lockdown Mode",
          isRtl ? "بروتوكول التجاوز" : "Override Protocol",
          isRtl ? "الأوامر السيادية" : "Sovereign Commands",
        ],
        color: "from-red-600 to-rose-700",
      },
      {
        id: "authority",
        icon: Crown,
        title: isRtl ? "السلطة المطلقة" : "Absolute Authority",
        description: isRtl
          ? "تحكم مركزي كامل مع صلاحيات ديناميكية ومراقبة شاملة."
          : "Complete centralized control with dynamic permissions and comprehensive monitoring.",
        features: [
          isRtl ? "إدارة مركزية" : "Centralized Management",
          isRtl ? "صلاحيات ديناميكية" : "Dynamic Permissions",
          isRtl ? "مراقبة لحظية" : "Real-time Monitoring",
        ],
        color: "from-cyan-600 to-blue-700",
      },
    ],
    accessLevels: [
      { level: "ROOT", label: isRtl ? "المالك الأعلى" : "Supreme Owner", color: "bg-red-500" },
      { level: "SOVEREIGN", label: isRtl ? "سيادي" : "Sovereign", color: "bg-amber-500" },
      { level: "ADMIN", label: isRtl ? "مدير" : "Administrator", color: "bg-blue-500" },
      { level: "OPERATOR", label: isRtl ? "مشغّل" : "Operator", color: "bg-emerald-500" },
      { level: "VIEWER", label: isRtl ? "مشاهد" : "Viewer", color: "bg-gray-500" },
    ],
    tagline: {
      short: isRtl 
        ? "السيطرة الكاملة تبدأ من هنا. حساب سيادي. أمن مطلق. تحكم بلا حدود."
        : "Absolute control starts here. Sovereign account. Total security. Full authority.",
    },
  };

  const currentSection = t.sections[activeSection];
  const SectionIcon = currentSection.icon;

  return (
    <div className="min-h-screen bg-background overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      <LandingWorkspaceNav platformName="INFERA Engine Control™" platformNameAr="إنفيرا إنجن كونترول™" />
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/30 via-background to-amber-950/20" />
        
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]">
            <div className={`absolute inset-0 rounded-full border-2 border-red-500/20 ${pulseActive ? 'animate-ping' : ''}`} style={{ animationDuration: '3s' }} />
            <div className={`absolute inset-8 rounded-full border border-amber-500/30 ${pulseActive ? 'animate-ping' : ''}`} style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
            <div className={`absolute inset-16 rounded-full border border-emerald-500/40 ${pulseActive ? 'animate-ping' : ''}`} style={{ animationDuration: '2s', animationDelay: '1s' }} />
          </div>
          
          <div className="absolute top-20 left-[15%] w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
          <div className="absolute top-40 right-[20%] w-2 h-2 bg-amber-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-40 left-[25%] w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-20 right-[30%] w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
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
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-none">
                <span className="bg-gradient-to-r from-red-400 via-amber-400 to-orange-400 bg-clip-text text-transparent">
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
                className="gap-3 px-10 py-7 text-lg bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 shadow-lg shadow-red-500/25"
                onClick={() => setLocation("/owner/control-center")}
                data-testid="button-request-control-access"
              >
                <Lock className="w-5 h-5" />
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
                  className="relative p-4 rounded-xl bg-card/30 backdrop-blur-sm border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-muted/50`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {isRtl ? "مستويات الوصول السيادية" : "Sovereign Access Levels"}
            </h2>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {t.accessLevels.map((level, index) => (
              <motion.div
                key={level.level}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 px-6 py-3 rounded-full bg-card/50 border border-border/50 backdrop-blur-sm"
              >
                <div className={`w-3 h-3 rounded-full ${level.color}`} />
                <span className="font-mono text-sm font-medium">{level.level}</span>
                <span className="text-sm text-muted-foreground">|</span>
                <span className="text-sm">{level.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              {t.sections.map((section, index) => {
                const Icon = section.icon;
                const isActive = activeSection === index;
                return (
                  <div
                    key={section.id}
                    className={`relative p-6 rounded-xl border cursor-pointer transition-all duration-300 ${
                      isActive 
                        ? `bg-gradient-to-br ${section.color} border-transparent shadow-lg` 
                        : "bg-card/50 border-border/50 hover:bg-card/80"
                    }`}
                    onClick={() => setActiveSection(index)}
                    data-testid={`section-${section.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${isActive ? 'bg-white/20' : `bg-gradient-to-br ${section.color}`} shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-lg font-semibold ${isActive ? 'text-white' : ''}`}>
                          {section.title}
                        </h3>
                        <AnimatePresence mode="wait">
                          {isActive && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="text-sm text-white/80 mt-1"
                            >
                              {section.description}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${currentSection.color} rounded-3xl blur-3xl opacity-30`} />
              <Card className="relative backdrop-blur-xl bg-card/80 border-red-500/20 overflow-hidden">
                <CardHeader className={`bg-gradient-to-r ${currentSection.color} text-white`}>
                  <div className="flex items-center gap-3">
                    <SectionIcon className="w-8 h-8" />
                    <CardTitle className="text-2xl">{currentSection.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <p className="text-muted-foreground leading-relaxed">
                    {currentSection.description}
                  </p>
                  <div className="space-y-3">
                    {currentSection.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-r from-red-600 via-amber-600 to-orange-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzIiBjeT0iMyIgcj0iMyIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="relative max-w-4xl mx-auto px-4 text-center text-white">
          <Lock className="w-16 h-16 mx-auto mb-6 opacity-80" />
          <p className="text-2xl md:text-3xl font-bold mb-8">
            {t.tagline.short}
          </p>
          <Button 
            size="lg"
            variant="secondary"
            className="gap-3 px-10 py-8 text-xl shadow-2xl"
            onClick={() => setLocation("/owner/control-center")}
            data-testid="button-final-control-cta"
          >
            <Shield className="w-6 h-6" />
            {t.hero.cta}
          </Button>
        </div>
      </section>
    </div>
  );
}
