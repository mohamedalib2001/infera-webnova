import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  Smartphone, 
  Target,
  Eye,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Lightbulb,
  BarChart3,
  Download,
  ChevronLeft,
  ChevronRight,
  Rocket,
  Zap,
  Blocks,
} from "lucide-react";

interface PitchSlide {
  id: string;
  title: string;
  titleAr: string;
  icon: typeof Smartphone;
  color: string;
  content: {
    heading: string;
    headingAr: string;
    points: { text: string; textAr: string }[];
  };
}

export default function PitchDeckAppForge() {
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: PitchSlide[] = [
    {
      id: "vision",
      title: "Vision",
      titleAr: "الرؤية",
      icon: Eye,
      color: "from-orange-600 to-red-700",
      content: {
        heading: "To eliminate traditional software development.",
        headingAr: "إلغاء تطوير البرمجيات التقليدي.",
        points: [
          { text: "End of traditional development", textAr: "نهاية التطوير التقليدي" },
          { text: "AI-powered app creation", textAr: "إنشاء تطبيقات بقوة الذكاء الاصطناعي" },
          { text: "Instant software delivery", textAr: "تسليم برمجيات فوري" },
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
        heading: "Building applications is slow, expensive, and rigid.",
        headingAr: "بناء التطبيقات بطيء ومكلف وجامد.",
        points: [
          { text: "Slow development cycles", textAr: "دورات تطوير بطيئة" },
          { text: "High development costs", textAr: "تكاليف تطوير عالية" },
          { text: "Rigid, inflexible systems", textAr: "أنظمة جامدة وغير مرنة" },
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
        heading: "INFERA AppForge AI™ creates apps without code, powered by AI logic.",
        headingAr: "INFERA AppForge AI™ ينشئ تطبيقات بدون كود، مدفوعة بمنطق الذكاء الاصطناعي.",
        points: [
          { text: "No-code app creation", textAr: "إنشاء تطبيقات بدون كود" },
          { text: "AI-powered logic", textAr: "منطق مدفوع بالذكاء الاصطناعي" },
          { text: "Instant deployment", textAr: "نشر فوري" },
        ],
      },
    },
    {
      id: "unique-value",
      title: "Unique Value",
      titleAr: "القيمة الفريدة",
      icon: Rocket,
      color: "from-violet-600 to-purple-700",
      content: {
        heading: "No-code sovereignty with instant deployment and built-in intelligence.",
        headingAr: "سيادة بدون كود مع نشر فوري وذكاء مدمج.",
        points: [
          { text: "No-code sovereignty", textAr: "سيادة بدون كود" },
          { text: "Instant deployment", textAr: "نشر فوري" },
          { text: "Built-in intelligence", textAr: "ذكاء مدمج" },
        ],
      },
    },
    {
      id: "how-it-works",
      title: "How It Works",
      titleAr: "كيف يعمل",
      icon: Blocks,
      color: "from-blue-600 to-indigo-700",
      content: {
        heading: "Visual logic + AI orchestration generate full applications instantly.",
        headingAr: "منطق بصري + تنسيق الذكاء الاصطناعي ينشئان تطبيقات كاملة فوراً.",
        points: [
          { text: "Visual logic builder", textAr: "بناء منطق بصري" },
          { text: "AI orchestration", textAr: "تنسيق الذكاء الاصطناعي" },
          { text: "Instant app generation", textAr: "توليد تطبيقات فوري" },
        ],
      },
    },
    {
      id: "market-advantage",
      title: "Market Advantage",
      titleAr: "الميزة السوقية",
      icon: TrendingUp,
      color: "from-amber-600 to-yellow-700",
      content: {
        heading: "Beyond no-code. AI-native application factories.",
        headingAr: "ما وراء بدون كود. مصانع تطبيقات أصلية بالذكاء الاصطناعي.",
        points: [
          { text: "Beyond traditional no-code", textAr: "ما وراء بدون كود التقليدي" },
          { text: "AI-native factories", textAr: "مصانع أصلية بالذكاء الاصطناعي" },
          { text: "Enterprise-grade output", textAr: "مخرجات بمستوى المؤسسات" },
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
        heading: "Designed for organizations requiring rapid application delivery.",
        headingAr: "مصمم للمؤسسات التي تتطلب تسليم تطبيقات سريع.",
        points: [
          { text: "Enterprise apps", textAr: "تطبيقات المؤسسات" },
          { text: "Rapid innovation", textAr: "ابتكار سريع" },
          { text: "Digital transformation", textAr: "التحول الرقمي" },
        ],
      },
    },
    {
      id: "strategic-impact",
      title: "Strategic Impact",
      titleAr: "الأثر الاستراتيجي",
      icon: Zap,
      color: "from-teal-600 to-cyan-700",
      content: {
        heading: "Development time collapses to minutes.",
        headingAr: "وقت التطوير ينهار إلى دقائق.",
        points: [
          { text: "Minutes not months", textAr: "دقائق وليس شهور" },
          { text: "Massive cost reduction", textAr: "تخفيض تكاليف هائل" },
          { text: "Unlimited innovation speed", textAr: "سرعة ابتكار غير محدودة" },
        ],
      },
    },
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const currentSlideData = slides[currentSlide];
  const SlideIcon = currentSlideData.icon;

  return (
    <div className="min-h-screen bg-background overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      <section className="relative min-h-screen flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-950/20 via-background to-red-950/20" />
        
        <div className="relative z-10 flex-1 flex flex-col max-w-7xl mx-auto px-4 py-8 w-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-4 py-2 border-orange-500/50 bg-orange-500/10">
                <Smartphone className="w-4 h-4 mr-2 text-orange-400" />
                <span className="text-orange-400 font-medium">INFERA AppForge AI™</span>
              </Badge>
              <span className="text-muted-foreground">
                {isRtl ? "عرض المستثمرين" : "Investor Pitch Deck"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{currentSlide + 1} / {slides.length}</Badge>
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
            <Button variant="outline" size="lg" onClick={prevSlide} className="gap-2" data-testid="button-prev-slide">
              <ChevronLeft className="w-5 h-5" />
              {isRtl ? "السابق" : "Previous"}
            </Button>

            <div className="flex items-center gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-primary scale-125' : 'bg-muted hover:bg-muted-foreground/50'}`}
                  data-testid={`button-slide-${index}`}
                />
              ))}
            </div>

            <Button variant="outline" size="lg" onClick={nextSlide} className="gap-2" data-testid="button-next-slide">
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
                  className={`p-3 rounded-xl transition-all ${index === currentSlide ? 'bg-primary/20 border-2 border-primary' : 'bg-muted/30 hover:bg-muted/50 border-2 border-transparent'}`}
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
