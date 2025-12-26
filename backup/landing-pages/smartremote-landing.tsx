import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  Monitor, 
  Smartphone,
  Tablet,
  Wifi,
  Lock,
  Eye,
  Activity,
  ArrowRight,
  CheckCircle2,
  Brain,
  Zap,
  BarChart3,
  Settings,
  Shield,
  Radio,
  MousePointer,
  Keyboard,
} from "lucide-react";
import { LandingWorkspaceNav } from "@/components/landing-workspace-nav";

export default function SmartRemoteLanding() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [activeDevice, setActiveDevice] = useState(0);
  const [connectionPulse, setConnectionPulse] = useState(0);

  const devices = [
    { icon: Monitor, name: isRtl ? "كمبيوتر" : "Computer", status: "connected", os: "Windows 11" },
    { icon: Smartphone, name: isRtl ? "جوال" : "Mobile", status: "connected", os: "iOS 17" },
    { icon: Tablet, name: isRtl ? "تابلت" : "Tablet", status: "idle", os: "Android 14" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDevice(prev => (prev + 1) % devices.length);
      setConnectionPulse(prev => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, [devices.length]);

  const t = {
    hero: {
      badge: isRtl ? "التحكم الذكي عن بُعد" : "Intelligent Remote Control",
      title: isRtl ? "INFERA Smart Remote AI™" : "INFERA Smart Remote AI™",
      subtitle: isRtl 
        ? "تحكم ذكي عن بُعد"
        : "Smart Remote Control",
      description: isRtl
        ? "منصة تحكم ذكي سيادي عن بُعد لإدارة أجهزة الكمبيوتر والجوال والتابلت بأمان وتحليل سلوكي متقدم."
        : "A sovereign intelligent remote control platform for managing computers, mobiles, and tablets with advanced security and behavioral intelligence.",
      cta: isRtl ? "ابدأ التحكم الذكي" : "Start Smart Control",
    },
    stats: [
      { label: isRtl ? "أجهزة مُدارة" : "Devices Managed", value: "245K+", icon: Monitor },
      { label: isRtl ? "جلسات آمنة" : "Secure Sessions", value: "1.2M", icon: Lock },
      { label: isRtl ? "وقت الاستجابة" : "Response Time", value: "<50ms", icon: Zap },
      { label: isRtl ? "تشفير" : "Encryption", value: "AES-256", icon: Shield },
    ],
    sections: [
      {
        icon: Monitor,
        title: isRtl ? "إدارة الأجهزة" : "Device Management",
        description: isRtl 
          ? "إدارة مركزية لجميع الأجهزة المتصلة مع مراقبة حالتها."
          : "Centralized management of all connected devices with status monitoring.",
        features: [
          { icon: Smartphone, label: isRtl ? "متعدد الأجهزة" : "Multi-Device" },
          { icon: Settings, label: isRtl ? "إعدادات مركزية" : "Central Config" },
          { icon: Activity, label: isRtl ? "مراقبة الحالة" : "Status Monitoring" },
        ],
        color: "from-violet-600 to-purple-700",
      },
      {
        icon: Lock,
        title: isRtl ? "جلسات آمنة" : "Secure Remote Sessions",
        description: isRtl
          ? "اتصال مشفر وآمن مع مصادقة متعددة العوامل."
          : "Encrypted and secure connection with multi-factor authentication.",
        features: [
          { icon: Shield, label: isRtl ? "تشفير كامل" : "Full Encryption" },
          { icon: Lock, label: isRtl ? "مصادقة MFA" : "MFA Auth" },
          { icon: Radio, label: isRtl ? "اتصال آمن" : "Secure Connection" },
        ],
        color: "from-blue-600 to-cyan-700",
      },
      {
        icon: Brain,
        title: isRtl ? "مراقبة السلوك" : "Behavior Monitoring",
        description: isRtl
          ? "تحليل سلوكي متقدم للكشف عن الأنماط غير الطبيعية."
          : "Advanced behavioral analysis to detect abnormal patterns.",
        features: [
          { icon: Eye, label: isRtl ? "تحليل السلوك" : "Behavior Analysis" },
          { icon: BarChart3, label: isRtl ? "أنماط الاستخدام" : "Usage Patterns" },
          { icon: Brain, label: isRtl ? "ذكاء تنبؤي" : "Predictive AI" },
        ],
        color: "from-emerald-600 to-green-700",
      },
      {
        icon: Settings,
        title: isRtl ? "لوحة التحكم" : "Control Dashboard",
        description: isRtl
          ? "لوحة تحكم شاملة لإدارة جميع العمليات عن بُعد."
          : "Comprehensive dashboard for managing all remote operations.",
        features: [
          { icon: MousePointer, label: isRtl ? "تحكم مباشر" : "Direct Control" },
          { icon: Keyboard, label: isRtl ? "أوامر عن بُعد" : "Remote Commands" },
          { icon: Zap, label: isRtl ? "استجابة فورية" : "Instant Response" },
        ],
        color: "from-amber-600 to-orange-700",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      <LandingWorkspaceNav platformName="INFERA Smart Remote AI™" platformNameAr="إنفيرا سمارت ريموت AI™" />
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/30 via-background to-blue-950/20" />
        
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[15%] right-[8%] w-56 rounded-xl bg-card/30 backdrop-blur-sm border border-border/50 p-4">
            <div className="text-xs text-muted-foreground mb-3">{isRtl ? "الأجهزة المتصلة" : "Connected Devices"}</div>
            {devices.map((device, index) => {
              const DeviceIcon = device.icon;
              const isActive = activeDevice === index;
              return (
                <motion.div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg mb-2 transition-all duration-500 ${
                    isActive 
                      ? 'bg-violet-500/20 border border-violet-500/50 scale-105' 
                      : 'bg-muted/20'
                  }`}
                  animate={{ x: isActive ? 5 : 0 }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-violet-500' : 'bg-muted/50'}`}>
                      <DeviceIcon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{device.name}</p>
                      <p className="text-xs text-muted-foreground">{device.os}</p>
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    device.status === 'connected' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`} />
                </motion.div>
              );
            })}
          </div>

          <div className="absolute left-[8%] top-1/2 -translate-y-1/2">
            <div className="relative flex items-center gap-6">
              <motion.div
                className="p-5 rounded-xl bg-card/30 backdrop-blur-sm border border-violet-500/50"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Monitor className="w-12 h-12 text-violet-400" />
              </motion.div>

              <div className="flex flex-col gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-1"
                  >
                    {[0, 1, 2, 3].map((j) => (
                      <motion.div
                        key={j}
                        className={`w-3 h-1 rounded-full ${
                          connectionPulse >= j ? 'bg-violet-500' : 'bg-muted/30'
                        }`}
                        animate={{ 
                          opacity: connectionPulse === j ? [0.5, 1, 0.5] : 1 
                        }}
                        transition={{ duration: 0.5 }}
                      />
                    ))}
                  </motion.div>
                ))}
              </div>

              <motion.div
                className="p-4 rounded-xl bg-card/30 backdrop-blur-sm border border-blue-500/50"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                <Wifi className="w-8 h-8 text-blue-400" />
              </motion.div>
            </div>
            <p className="text-center mt-4 text-sm text-violet-400 font-medium">
              {isRtl ? "اتصال آمن ومشفر" : "Secure Encrypted Connection"}
            </p>
          </div>

          <motion.div
            className="absolute right-[10%] bottom-[20%] p-4 rounded-xl bg-card/30 backdrop-blur-sm border border-emerald-500/50"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-medium">{isRtl ? "جلسة نشطة" : "Active Session"}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="w-3 h-3" />
              <span>AES-256</span>
              <span className="text-emerald-400">|</span>
              <span>TLS 1.3</span>
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
                className="px-6 py-2.5 text-sm border-violet-500/50 bg-violet-500/10 backdrop-blur-sm"
              >
                <Monitor className="w-4 h-4 mr-2 text-violet-400" />
                <span className="text-violet-400 font-medium">{t.hero.badge}</span>
              </Badge>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-4"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-none">
                <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
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
                className="gap-3 px-10 py-7 text-lg bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 shadow-lg shadow-violet-500/25"
                onClick={() => setLocation("/sovereign-workspace")}
                data-testid="button-start-smartremote"
              >
                <Monitor className="w-5 h-5" />
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
                  <p className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
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
              {isRtl ? "قدرات التحكم الذكي" : "Smart Control Capabilities"}
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

      <section className="py-24 bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzIiBjeT0iMyIgcj0iMyIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="relative max-w-4xl mx-auto px-4 text-center text-white">
          <Monitor className="w-16 h-16 mx-auto mb-6 opacity-80" />
          <p className="text-2xl md:text-3xl font-bold mb-4">
            {isRtl ? "التحكم هنا لا يكون أعمى... بل واعيًا ذكيًا" : "Control here isn't blind... it's intelligently aware"}
          </p>
          <Button 
            size="lg"
            variant="secondary"
            className="gap-3 px-10 py-8 text-xl shadow-2xl mt-8"
            onClick={() => setLocation("/sovereign-workspace")}
            data-testid="button-final-smartremote-cta"
          >
            <Wifi className="w-6 h-6" />
            {t.hero.cta}
          </Button>
        </div>
      </section>
    </div>
  );
}
