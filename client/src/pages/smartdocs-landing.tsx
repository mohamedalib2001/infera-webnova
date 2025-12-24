import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  FileText, 
  Upload,
  Search,
  Link2,
  Pen,
  Shield,
  Sparkles,
  FolderOpen,
  CheckCircle2,
  Brain,
  Zap,
  ArrowRight,
  Tag,
  Eye,
  FileSearch,
  FilePlus,
  Files,
  Archive,
} from "lucide-react";

export default function SmartDocsLanding() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [analyzeStep, setAnalyzeStep] = useState(0);
  const [signPulse, setSignPulse] = useState(false);

  const docTypes = [
    { icon: FileText, label: isRtl ? "عقد" : "Contract", color: "bg-blue-500" },
    { icon: Files, label: isRtl ? "تقرير" : "Report", color: "bg-violet-500" },
    { icon: FilePlus, label: isRtl ? "فاتورة" : "Invoice", color: "bg-emerald-500" },
    { icon: Archive, label: isRtl ? "سجل" : "Record", color: "bg-amber-500" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setAnalyzeStep(prev => (prev + 1) % 4);
      if (analyzeStep === 2) {
        setSignPulse(true);
        setTimeout(() => setSignPulse(false), 800);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [analyzeStep]);

  const t = {
    hero: {
      badge: isRtl ? "إدارة الوثائق الذكية" : "Intelligent Document Management",
      title: isRtl ? "INFERA Smart Docs™" : "INFERA Smart Docs™",
      subtitle: isRtl 
        ? "وثائق تفهم سياقها"
        : "Documents That Understand Context",
      description: isRtl
        ? "منصة سيادية لإدارة الوثائق الرسمية تعتمد على التحليل الذكي، الأرشفة التلقائية، والربط العميق بين المستندات والعقود والقرارات."
        : "A sovereign intelligent document management platform that analyzes, organizes, signs, and links documents within a smart institutional context.",
      cta: isRtl ? "ابدأ إدارة الوثائق" : "Start Document Management",
    },
    stats: [
      { label: isRtl ? "وثائق معالجة" : "Processed Docs", value: "2.4M", icon: FileText },
      { label: isRtl ? "توقيعات رقمية" : "Digital Signatures", value: "847K", icon: Pen },
      { label: isRtl ? "دقة التحليل" : "Analysis Accuracy", value: "99.7%", icon: Brain },
      { label: isRtl ? "استرجاع فوري" : "Instant Retrieval", value: "0.3s", icon: Search },
    ],
    sections: [
      {
        icon: Upload,
        title: isRtl ? "الرفع والتحليل الذكي" : "Smart Upload & Analysis",
        description: isRtl 
          ? "تصنيف تلقائي للوثائق مع استخراج رؤى المحتوى والبيانات الوصفية."
          : "Automatic document classification with content insights and metadata extraction.",
        features: [
          { icon: Tag, label: isRtl ? "تصنيف تلقائي" : "Auto Classification" },
          { icon: Brain, label: isRtl ? "رؤى المحتوى" : "Content Insights" },
          { icon: Sparkles, label: isRtl ? "استخراج البيانات" : "Data Extraction" },
        ],
        color: "from-blue-600 to-cyan-700",
      },
      {
        icon: Pen,
        title: isRtl ? "التوقيع الرقمي" : "Digital Signature",
        description: isRtl
          ? "توقيع آمن مع التحقق والتشفير والامتثال القانوني."
          : "Secure signing with verification, encryption, and legal compliance.",
        features: [
          { icon: Shield, label: isRtl ? "توقيع آمن" : "Secure Signing" },
          { icon: CheckCircle2, label: isRtl ? "التحقق" : "Verification" },
          { icon: Zap, label: isRtl ? "تشفير" : "Encryption" },
        ],
        color: "from-violet-600 to-purple-700",
      },
      {
        icon: Link2,
        title: isRtl ? "ربط الوثائق" : "Document Linking",
        description: isRtl
          ? "ربط العقود والسجلات مع خريطة سياق مؤسسية شاملة."
          : "Link contracts and records with comprehensive institutional context mapping.",
        features: [
          { icon: Files, label: isRtl ? "العقود والسجلات" : "Contracts & Records" },
          { icon: Link2, label: isRtl ? "خريطة السياق" : "Context Mapping" },
          { icon: FolderOpen, label: isRtl ? "الأرشفة الذكية" : "Smart Archiving" },
        ],
        color: "from-emerald-600 to-green-700",
      },
      {
        icon: FileSearch,
        title: isRtl ? "البحث والاسترجاع" : "Search & Retrieval",
        description: isRtl
          ? "بحث دلالي مع وصول فوري لأي وثيقة في النظام."
          : "Semantic search with instant access to any document in the system.",
        features: [
          { icon: Search, label: isRtl ? "بحث دلالي" : "Semantic Search" },
          { icon: Eye, label: isRtl ? "وصول فوري" : "Instant Access" },
          { icon: Zap, label: isRtl ? "نتائج ذكية" : "Smart Results" },
        ],
        color: "from-amber-600 to-orange-700",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-background to-violet-950/20" />
        
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[20%] right-[8%] flex flex-col gap-3">
            {docTypes.map((doc, index) => {
              const Icon = doc.icon;
              const isActive = analyzeStep >= index;
              return (
                <motion.div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-xl backdrop-blur-sm border transition-all duration-500 ${
                    isActive 
                      ? 'bg-card/60 border-blue-500/50 shadow-lg' 
                      : 'bg-card/20 border-border/30'
                  }`}
                  animate={{ x: analyzeStep === index ? 10 : 0, scale: analyzeStep === index ? 1.05 : 1 }}
                >
                  <div className={`p-2 rounded-lg ${isActive ? doc.color : 'bg-muted/50'}`}>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
                  </div>
                  <span className={`text-sm ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {doc.label}
                  </span>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          <motion.div
            className={`absolute left-[10%] top-1/3 p-6 rounded-xl backdrop-blur-sm border transition-all duration-500 ${
              signPulse ? 'bg-violet-500/20 border-violet-500/50 scale-105' : 'bg-card/30 border-border/50'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <Pen className={`w-6 h-6 ${signPulse ? 'text-violet-400' : 'text-muted-foreground'}`} />
              <span className="text-sm">{isRtl ? "التوقيع الرقمي" : "Digital Signature"}</span>
            </div>
            <div className="w-32 h-10 rounded-lg bg-muted/30 flex items-center justify-center">
              {signPulse ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              ) : (
                <span className="text-xs text-muted-foreground italic">Mohamed Ali</span>
              )}
            </div>
          </motion.div>

          <div className="absolute right-[10%] bottom-[20%] w-44 h-24 rounded-xl bg-card/30 backdrop-blur-sm border border-border/50 p-3">
            <div className="text-xs text-muted-foreground mb-2">{isRtl ? "وثائق اليوم" : "Today's Docs"}</div>
            <p className="text-2xl font-bold text-blue-400">1,847</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
                  animate={{ width: ['0%', '87%'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <span className="text-xs text-muted-foreground">87%</span>
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
                className="px-6 py-2.5 text-sm border-blue-500/50 bg-blue-500/10 backdrop-blur-sm"
              >
                <FileText className="w-4 h-4 mr-2 text-blue-400" />
                <span className="text-blue-400 font-medium">{t.hero.badge}</span>
              </Badge>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-4"
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-none">
                <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
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
                className="gap-3 px-10 py-7 text-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 shadow-lg shadow-blue-500/25"
                onClick={() => setLocation("/sovereign-workspace")}
                data-testid="button-start-smartdocs"
              >
                <FileText className="w-5 h-5" />
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
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
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
              {isRtl ? "قدرات إدارة الوثائق" : "Document Management Capabilities"}
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

      <section className="py-24 bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzIiBjeT0iMyIgcj0iMyIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="relative max-w-4xl mx-auto px-4 text-center text-white">
          <FileText className="w-16 h-16 mx-auto mb-6 opacity-80" />
          <p className="text-2xl md:text-3xl font-bold mb-4">
            {isRtl ? "الوثائق هنا لا تُخزَّن... بل تُفهم" : "Documents aren't stored here... they're understood"}
          </p>
          <Button 
            size="lg"
            variant="secondary"
            className="gap-3 px-10 py-8 text-xl shadow-2xl mt-8"
            onClick={() => setLocation("/sovereign-workspace")}
            data-testid="button-final-smartdocs-cta"
          >
            <FolderOpen className="w-6 h-6" />
            {t.hero.cta}
          </Button>
        </div>
      </section>
    </div>
  );
}
