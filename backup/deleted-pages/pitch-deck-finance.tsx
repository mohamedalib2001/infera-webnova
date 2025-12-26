import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  DollarSign, 
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
  LineChart,
  PiggyBank,
  Wallet,
} from "lucide-react";

interface PitchSlide {
  id: string;
  title: string;
  titleAr: string;
  icon: typeof DollarSign;
  color: string;
  content: {
    heading: string;
    headingAr: string;
    points: { text: string; textAr: string }[];
  };
}

export default function PitchDeckFinance() {
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: PitchSlide[] = [
    {
      id: "vision",
      title: "Vision",
      titleAr: "الرؤية",
      icon: Eye,
      color: "from-emerald-600 to-green-700",
      content: {
        heading: "To transform finance from accounting into predictive sovereign intelligence.",
        headingAr: "تحويل المالية من المحاسبة إلى ذكاء سيادي تنبؤي.",
        points: [
          { text: "Beyond traditional accounting", textAr: "ما وراء المحاسبة التقليدية" },
          { text: "Predictive financial intelligence", textAr: "ذكاء مالي تنبؤي" },
          { text: "Sovereign financial control", textAr: "تحكم مالي سيادي" },
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
        heading: "Financial systems are reactive, fragmented, and blind to future risks.",
        headingAr: "الأنظمة المالية ردود فعل ومجزأة وعمياء عن المخاطر المستقبلية.",
        points: [
          { text: "Reactive financial systems", textAr: "أنظمة مالية ردود فعل" },
          { text: "Fragmented data and processes", textAr: "بيانات وعمليات مجزأة" },
          { text: "Blind to future risks", textAr: "عمياء عن المخاطر المستقبلية" },
        ],
      },
    },
    {
      id: "solution",
      title: "Solution",
      titleAr: "الحل",
      icon: Lightbulb,
      color: "from-emerald-600 to-teal-700",
      content: {
        heading: "INFERA Sovereign Finance AI™ predicts, analyzes, and optimizes financial decisions.",
        headingAr: "INFERA Sovereign Finance AI™ يتنبأ ويحلل ويحسن القرارات المالية.",
        points: [
          { text: "Predictive financial analysis", textAr: "تحليل مالي تنبؤي" },
          { text: "AI-powered optimization", textAr: "تحسين مدفوع بالذكاء الاصطناعي" },
          { text: "Real-time decision support", textAr: "دعم القرار في الوقت الفعلي" },
        ],
      },
    },
    {
      id: "unique-value",
      title: "Unique Value",
      titleAr: "القيمة الفريدة",
      icon: DollarSign,
      color: "from-green-600 to-emerald-700",
      content: {
        heading: "Predictive finance with AI-driven compliance and strategic forecasting.",
        headingAr: "مالية تنبؤية مع امتثال مدفوع بالذكاء الاصطناعي وتوقعات استراتيجية.",
        points: [
          { text: "Predictive finance", textAr: "مالية تنبؤية" },
          { text: "AI-driven compliance", textAr: "امتثال مدفوع بالذكاء الاصطناعي" },
          { text: "Strategic forecasting", textAr: "توقعات استراتيجية" },
        ],
      },
    },
    {
      id: "how-it-works",
      title: "How It Works",
      titleAr: "كيف يعمل",
      icon: LineChart,
      color: "from-blue-600 to-indigo-700",
      content: {
        heading: "AI analyzes financial flows, risks, and trends to guide decisions before outcomes occur.",
        headingAr: "الذكاء الاصطناعي يحلل التدفقات المالية والمخاطر والاتجاهات لتوجيه القرارات قبل حدوث النتائج.",
        points: [
          { text: "Financial flow analysis", textAr: "تحليل التدفقات المالية" },
          { text: "Risk prediction", textAr: "التنبؤ بالمخاطر" },
          { text: "Proactive decision guidance", textAr: "توجيه القرارات الاستباقي" },
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
        heading: "Beyond ERP. Beyond accounting. Finance that thinks ahead.",
        headingAr: "ما وراء ERP. ما وراء المحاسبة. مالية تفكر مسبقاً.",
        points: [
          { text: "Beyond traditional ERP", textAr: "ما وراء ERP التقليدي" },
          { text: "Beyond basic accounting", textAr: "ما وراء المحاسبة الأساسية" },
          { text: "Forward-thinking finance", textAr: "مالية تفكر للأمام" },
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
        heading: "Designed for organizations requiring intelligent financial governance.",
        headingAr: "مصمم للمؤسسات التي تتطلب حوكمة مالية ذكية.",
        points: [
          { text: "Enterprise finance", textAr: "مالية المؤسسات" },
          { text: "Sovereign financial oversight", textAr: "الرقابة المالية السيادية" },
          { text: "Investment governance", textAr: "حوكمة الاستثمار" },
        ],
      },
    },
    {
      id: "strategic-impact",
      title: "Strategic Impact",
      titleAr: "الأثر الاستراتيجي",
      icon: BarChart3,
      color: "from-violet-600 to-purple-700",
      content: {
        heading: "Finance becomes a strategic weapon.",
        headingAr: "تصبح المالية سلاحاً استراتيجياً.",
        points: [
          { text: "Strategic financial power", textAr: "قوة مالية استراتيجية" },
          { text: "Competitive advantage", textAr: "ميزة تنافسية" },
          { text: "Future-proof decisions", textAr: "قرارات مقاومة للمستقبل" },
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
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 via-background to-green-950/20" />
        
        <div className="relative z-10 flex-1 flex flex-col max-w-7xl mx-auto px-4 py-8 w-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-4 py-2 border-emerald-500/50 bg-emerald-500/10">
                <DollarSign className="w-4 h-4 mr-2 text-emerald-400" />
                <span className="text-emerald-400 font-medium">INFERA Sovereign Finance AI™</span>
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
