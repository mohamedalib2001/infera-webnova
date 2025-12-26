import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  Crown, 
  Shield,
  Target,
  Zap,
  Users,
  Building2,
  Globe,
  Lock,
  Eye,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Lightbulb,
  BarChart3,
  FileText,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface PitchSlide {
  id: string;
  title: string;
  titleAr: string;
  icon: typeof Crown;
  color: string;
  content: {
    heading: string;
    headingAr: string;
    points: { text: string; textAr: string }[];
  };
}

export default function PitchDeck() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: PitchSlide[] = [
    {
      id: "vision",
      title: "Vision",
      titleAr: "الرؤية",
      icon: Eye,
      color: "from-violet-600 to-purple-700",
      content: {
        heading: "To establish absolute sovereign control over digital platforms, security, identities, and governance.",
        headingAr: "تأسيس سيطرة سيادية مطلقة على المنصات الرقمية والأمان والهويات والحوكمة.",
        points: [
          { text: "Absolute digital sovereignty", textAr: "سيادة رقمية مطلقة" },
          { text: "Unified platform governance", textAr: "حوكمة موحدة للمنصات" },
          { text: "Enterprise-grade security", textAr: "أمان بمستوى المؤسسات" },
        ],
      },
    },
    {
      id: "problem",
      title: "Problem",
      titleAr: "المشكلة",
      icon: AlertTriangle,
      color: "from-red-600 to-orange-700",
      content: {
        heading: "Organizations lack centralized sovereign control. Security, permissions, and policies are fragmented and reactive.",
        headingAr: "تفتقر المؤسسات إلى تحكم سيادي مركزي. الأمان والصلاحيات والسياسات مجزأة وردود فعل.",
        points: [
          { text: "Fragmented security systems", textAr: "أنظمة أمان مجزأة" },
          { text: "Reactive threat response", textAr: "استجابة ردود فعل للتهديدات" },
          { text: "No unified governance", textAr: "لا حوكمة موحدة" },
        ],
      },
    },
    {
      id: "solution",
      title: "Solution",
      titleAr: "الحل",
      icon: Lightbulb,
      color: "from-emerald-600 to-green-700",
      content: {
        heading: "INFERA Engine Control™ provides a sovereign command platform for identity, access, policy enforcement, and emergency control.",
        headingAr: "INFERA Engine Control™ توفر منصة قيادة سيادية للهوية والوصول وتطبيق السياسات والتحكم الطارئ.",
        points: [
          { text: "Centralized identity management", textAr: "إدارة هوية مركزية" },
          { text: "Real-time policy enforcement", textAr: "تطبيق السياسات في الوقت الفعلي" },
          { text: "Emergency control protocols", textAr: "بروتوكولات التحكم الطارئ" },
        ],
      },
    },
    {
      id: "unique-value",
      title: "Unique Value",
      titleAr: "القيمة الفريدة",
      icon: Crown,
      color: "from-amber-600 to-yellow-700",
      content: {
        heading: "Sovereign-grade security with absolute policy enforcement and non-bypassable governance.",
        headingAr: "أمان بمستوى سيادي مع تطبيق سياسات مطلق وحوكمة غير قابلة للتجاوز.",
        points: [
          { text: "Sovereign-grade security", textAr: "أمان بمستوى سيادي" },
          { text: "Absolute policy enforcement", textAr: "تطبيق سياسات مطلق" },
          { text: "Non-bypassable governance", textAr: "حوكمة غير قابلة للتجاوز" },
          { text: "Real-time threat control", textAr: "تحكم في التهديدات بالوقت الفعلي" },
        ],
      },
    },
    {
      id: "how-it-works",
      title: "How It Works",
      titleAr: "كيف يعمل",
      icon: Zap,
      color: "from-blue-600 to-cyan-700",
      content: {
        heading: "A central command layer governs identities, permissions, policies, and threats across all platforms.",
        headingAr: "طبقة قيادة مركزية تحكم الهويات والصلاحيات والسياسات والتهديدات عبر جميع المنصات.",
        points: [
          { text: "Central command layer", textAr: "طبقة قيادة مركزية" },
          { text: "Cross-platform governance", textAr: "حوكمة عبر المنصات" },
          { text: "Unified threat management", textAr: "إدارة تهديدات موحدة" },
        ],
      },
    },
    {
      id: "market-advantage",
      title: "Market Advantage",
      titleAr: "الميزة السوقية",
      icon: TrendingUp,
      color: "from-violet-600 to-indigo-700",
      content: {
        heading: "Beyond IAM, beyond security tools. This is a sovereign digital command room.",
        headingAr: "ما وراء IAM، ما وراء أدوات الأمان. هذه غرفة قيادة رقمية سيادية.",
        points: [
          { text: "Beyond traditional IAM", textAr: "ما وراء IAM التقليدي" },
          { text: "Sovereign command center", textAr: "مركز قيادة سيادي" },
          { text: "Complete digital control", textAr: "تحكم رقمي كامل" },
        ],
      },
    },
    {
      id: "use-cases",
      title: "Use Cases",
      titleAr: "حالات الاستخدام",
      icon: Target,
      color: "from-pink-600 to-rose-700",
      content: {
        heading: "Designed for organizations requiring absolute digital sovereignty.",
        headingAr: "مصمم للمؤسسات التي تتطلب سيادة رقمية مطلقة.",
        points: [
          { text: "Government digital control", textAr: "التحكم الرقمي الحكومي" },
          { text: "Enterprise sovereign security", textAr: "أمان المؤسسات السيادي" },
          { text: "Critical infrastructure governance", textAr: "حوكمة البنية التحتية الحرجة" },
        ],
      },
    },
    {
      id: "strategic-impact",
      title: "Strategic Impact",
      titleAr: "الأثر الاستراتيجي",
      icon: BarChart3,
      color: "from-teal-600 to-cyan-700",
      content: {
        heading: "Transforms control from operational to sovereign.",
        headingAr: "يحول التحكم من تشغيلي إلى سيادي.",
        points: [
          { text: "Operational to sovereign transformation", textAr: "تحول من تشغيلي إلى سيادي" },
          { text: "Complete digital autonomy", textAr: "استقلالية رقمية كاملة" },
          { text: "Future-proof governance", textAr: "حوكمة مقاومة للمستقبل" },
        ],
      },
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const currentSlideData = slides[currentSlide];
  const SlideIcon = currentSlideData.icon;

  return (
    <div className="min-h-screen bg-background overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      <section className="relative min-h-screen flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/20 via-background to-blue-950/20" />
        
        <div className="relative z-10 flex-1 flex flex-col max-w-7xl mx-auto px-4 py-8 w-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-4 py-2 border-amber-500/50 bg-amber-500/10">
                <Crown className="w-4 h-4 mr-2 text-amber-400" />
                <span className="text-amber-400 font-medium">INFERA Engine Control™</span>
              </Badge>
              <span className="text-muted-foreground">
                {isRtl ? "عرض المستثمرين" : "Investor Pitch Deck"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {currentSlide + 1} / {slides.length}
              </Badge>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                {isRtl ? "تصدير PDF" : "Export PDF"}
              </Button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-4xl"
            >
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className={`bg-gradient-to-r ${currentSlideData.color} text-white py-12`}>
                  <div className="flex items-center justify-center gap-4">
                    <div className="p-4 rounded-2xl bg-white/20">
                      <SlideIcon className="w-10 h-10" />
                    </div>
                    <CardTitle className="text-4xl font-bold">
                      {isRtl ? currentSlideData.titleAr : currentSlideData.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-12 space-y-8">
                  <p className="text-2xl text-center leading-relaxed text-muted-foreground">
                    {isRtl ? currentSlideData.content.headingAr : currentSlideData.content.heading}
                  </p>
                  
                  <div className="grid gap-4 mt-8">
                    {currentSlideData.content.points.map((point, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-4 p-4 rounded-xl bg-muted/30"
                      >
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                        <span className="text-lg">{isRtl ? point.textAr : point.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="flex items-center justify-between mt-8">
            <Button 
              variant="outline" 
              size="lg"
              onClick={prevSlide}
              className="gap-2"
              data-testid="button-prev-slide"
            >
              <ChevronLeft className="w-5 h-5" />
              {isRtl ? "السابق" : "Previous"}
            </Button>

            <div className="flex items-center gap-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentSlide 
                      ? 'bg-primary scale-125' 
                      : 'bg-muted hover:bg-muted-foreground/50'
                  }`}
                  data-testid={`button-slide-${index}`}
                />
              ))}
            </div>

            <Button 
              variant="outline" 
              size="lg"
              onClick={nextSlide}
              className="gap-2"
              data-testid="button-next-slide"
            >
              {isRtl ? "التالي" : "Next"}
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-4 md:grid-cols-8 gap-2">
            {slides.map((slide, index) => {
              const Icon = slide.icon;
              return (
                <button
                  key={slide.id}
                  onClick={() => setCurrentSlide(index)}
                  className={`p-3 rounded-xl transition-all ${
                    index === currentSlide 
                      ? 'bg-primary/20 border-2 border-primary' 
                      : 'bg-muted/30 hover:bg-muted/50 border-2 border-transparent'
                  }`}
                  data-testid={`button-slide-nav-${slide.id}`}
                >
                  <Icon className={`w-5 h-5 mx-auto ${index === currentSlide ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className={`text-xs mt-1 truncate ${index === currentSlide ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    {isRtl ? slide.titleAr : slide.title}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
