import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  LineChart, 
  Target,
  Eye,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Lightbulb,
  Download,
  ChevronLeft,
  ChevronRight,
  Calculator,
  Shield,
  Layers,
} from "lucide-react";

interface PitchSlide {
  id: string;
  title: string;
  titleAr: string;
  icon: typeof LineChart;
  color: string;
  content: {
    heading: string;
    headingAr: string;
    points: { text: string; textAr: string }[];
  };
}

export default function PitchDeckVisionFeasibility() {
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: PitchSlide[] = [
    {
      id: "vision",
      title: "Vision",
      titleAr: "الرؤية",
      icon: Eye,
      color: "from-emerald-600 to-teal-700",
      content: {
        heading: "To enable organizations and investors to see the future of projects before committing resources.",
        headingAr: "تمكين المؤسسات والمستثمرين من رؤية مستقبل المشاريع قبل تخصيص الموارد.",
        points: [
          { text: "See project futures clearly", textAr: "رؤية مستقبل المشاريع بوضوح" },
          { text: "Intelligent resource commitment", textAr: "تخصيص موارد ذكي" },
          { text: "Predictive investment decisions", textAr: "قرارات استثمار تنبؤية" },
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
        heading: "Investment decisions rely on static spreadsheets, manual assumptions, and late discovery of risks.",
        headingAr: "قرارات الاستثمار تعتمد على جداول بيانات ثابتة وافتراضات يدوية واكتشاف متأخر للمخاطر.",
        points: [
          { text: "Static spreadsheets", textAr: "جداول بيانات ثابتة" },
          { text: "Manual assumptions", textAr: "افتراضات يدوية" },
          { text: "Fragmented financial models", textAr: "نماذج مالية مجزأة" },
          { text: "Late risk discovery", textAr: "اكتشاف متأخر للمخاطر" },
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
        heading: "INFERA VisionFeasibility™ evaluates projects using AI-driven feasibility analysis and predictive forecasting.",
        headingAr: "INFERA VisionFeasibility™ يقيم المشاريع باستخدام تحليل جدوى مدفوع بالذكاء الاصطناعي وتوقعات تنبؤية.",
        points: [
          { text: "AI-driven feasibility analysis", textAr: "تحليل جدوى مدفوع بالذكاء الاصطناعي" },
          { text: "Risk modeling", textAr: "نمذجة المخاطر" },
          { text: "Predictive financial forecasting", textAr: "توقعات مالية تنبؤية" },
          { text: "Intelligence over intuition", textAr: "الذكاء بدلاً من الحدس" },
        ],
      },
    },
    {
      id: "unique-value",
      title: "Unique Value",
      titleAr: "القيمة الفريدة",
      icon: Calculator,
      color: "from-violet-600 to-purple-700",
      content: {
        heading: "AI-powered feasibility scoring with predictive modeling and scenario simulation.",
        headingAr: "تسجيل جدوى مدعوم بالذكاء الاصطناعي مع نمذجة تنبؤية ومحاكاة السيناريوهات.",
        points: [
          { text: "AI-powered feasibility scoring", textAr: "تسجيل جدوى بالذكاء الاصطناعي" },
          { text: "Predictive financial modeling", textAr: "نمذجة مالية تنبؤية" },
          { text: "Dynamic risk analysis", textAr: "تحليل مخاطر ديناميكي" },
          { text: "Scenario simulation", textAr: "محاكاة السيناريوهات" },
          { text: "Visual decision intelligence", textAr: "ذكاء قرارات مرئي" },
        ],
      },
    },
    {
      id: "how-it-works",
      title: "How It Works",
      titleAr: "كيف يعمل",
      icon: Layers,
      color: "from-blue-600 to-indigo-700",
      content: {
        heading: "AI analyzes project inputs, market assumptions, and risk factors to simulate future scenarios.",
        headingAr: "الذكاء الاصطناعي يحلل مدخلات المشروع وافتراضات السوق وعوامل المخاطر لمحاكاة سيناريوهات المستقبل.",
        points: [
          { text: "Analyze project inputs", textAr: "تحليل مدخلات المشروع" },
          { text: "Model cost and revenue", textAr: "نمذجة التكلفة والإيرادات" },
          { text: "Simulate multiple scenarios", textAr: "محاكاة سيناريوهات متعددة" },
          { text: "Generate recommendations", textAr: "توليد التوصيات" },
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
        heading: "Beyond feasibility studies. Beyond consulting reports. This is feasibility intelligence.",
        headingAr: "ما وراء دراسات الجدوى. ما وراء تقارير الاستشارات. هذا ذكاء الجدوى.",
        points: [
          { text: "Beyond feasibility studies", textAr: "ما وراء دراسات الجدوى" },
          { text: "Beyond consulting reports", textAr: "ما وراء تقارير الاستشارات" },
          { text: "Feasibility intelligence", textAr: "ذكاء الجدوى" },
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
        heading: "Designed for organizations requiring intelligent investment evaluation.",
        headingAr: "مصمم للمؤسسات التي تتطلب تقييم استثمار ذكي.",
        points: [
          { text: "Investment evaluation", textAr: "تقييم الاستثمار" },
          { text: "New business initiatives", textAr: "مبادرات الأعمال الجديدة" },
          { text: "Strategic expansion planning", textAr: "تخطيط التوسع الاستراتيجي" },
          { text: "Public and private projects", textAr: "المشاريع العامة والخاصة" },
        ],
      },
    },
    {
      id: "strategic-impact",
      title: "Strategic Impact",
      titleAr: "الأثر الاستراتيجي",
      icon: Shield,
      color: "from-teal-600 to-cyan-700",
      content: {
        heading: "Capital allocation becomes smarter, risk exposure decreases, and organizations invest with confidence.",
        headingAr: "تخصيص رأس المال يصبح أذكى، التعرض للمخاطر يقل، والمؤسسات تستثمر بثقة.",
        points: [
          { text: "Smarter capital allocation", textAr: "تخصيص رأس مال أذكى" },
          { text: "Decreased risk exposure", textAr: "تقليل التعرض للمخاطر" },
          { text: "Invest with confidence", textAr: "استثمر بثقة" },
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
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 via-background to-teal-950/20" />
        
        <div className="relative z-10 flex-1 flex flex-col max-w-7xl mx-auto px-4 py-8 w-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-4 py-2 border-emerald-500/50 bg-emerald-500/10">
                <LineChart className="w-4 h-4 mr-2 text-emerald-400" />
                <span className="text-emerald-400 font-medium">INFERA VisionFeasibility™</span>
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
