import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  Landmark, 
  Target,
  Eye,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Lightbulb,
  Download,
  ChevronLeft,
  ChevronRight,
  Shield,
  BarChart3,
  Wallet,
} from "lucide-react";

interface PitchSlide {
  id: string;
  title: string;
  titleAr: string;
  icon: typeof Landmark;
  color: string;
  content: {
    heading: string;
    headingAr: string;
    points: { text: string; textAr: string }[];
  };
}

export default function PitchDeckSovereignFinance() {
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
        heading: "To establish sovereign-grade financial intelligence that governs money with prediction, control, and clarity.",
        headingAr: "تأسيس ذكاء مالي بمستوى سيادي يحكم المال بالتنبؤ والتحكم والوضوح.",
        points: [
          { text: "Sovereign-grade financial intelligence", textAr: "ذكاء مالي بمستوى سيادي" },
          { text: "Predictive governance", textAr: "حوكمة تنبؤية" },
          { text: "Full financial clarity", textAr: "وضوح مالي كامل" },
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
        heading: "Financial systems are reactive, fragmented, and focused on reporting instead of decision-making.",
        headingAr: "الأنظمة المالية ردود فعل ومجزأة ومركزة على التقارير بدلاً من اتخاذ القرارات.",
        points: [
          { text: "Reactive instead of predictive", textAr: "ردود فعل بدلاً من تنبؤية" },
          { text: "Fragmented across tools", textAr: "مجزأة عبر الأدوات" },
          { text: "Reporting-focused, not decision-driven", textAr: "مركزة على التقارير وليس القرارات" },
          { text: "Weak risk anticipation", textAr: "توقع مخاطر ضعيف" },
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
        heading: "INFERA Sovereign Finance AI™ unifies accounting, billing, analytics, and forecasting into one AI-driven control system.",
        headingAr: "INFERA Sovereign Finance AI™ يوحد المحاسبة والفوترة والتحليلات والتوقعات في نظام تحكم واحد مدفوع بالذكاء الاصطناعي.",
        points: [
          { text: "Unified financial control", textAr: "تحكم مالي موحد" },
          { text: "AI-driven analytics", textAr: "تحليلات مدفوعة بالذكاء الاصطناعي" },
          { text: "Predictive forecasting", textAr: "توقعات تنبؤية" },
          { text: "Intelligent and strategic finance", textAr: "تمويل ذكي واستراتيجي" },
        ],
      },
    },
    {
      id: "unique-value",
      title: "Unique Value",
      titleAr: "القيمة الفريدة",
      icon: Wallet,
      color: "from-violet-600 to-purple-700",
      content: {
        heading: "AI-powered forecasting with real-time cash flow intelligence and sovereign-grade governance.",
        headingAr: "توقعات مدعومة بالذكاء الاصطناعي مع ذكاء تدفق نقدي في الوقت الفعلي وحوكمة بمستوى سيادي.",
        points: [
          { text: "AI-powered financial forecasting", textAr: "توقعات مالية بالذكاء الاصطناعي" },
          { text: "Real-time cash flow intelligence", textAr: "ذكاء تدفق نقدي في الوقت الفعلي" },
          { text: "Predictive risk detection", textAr: "كشف مخاطر تنبؤي" },
          { text: "Automated financial insights", textAr: "رؤى مالية آلية" },
          { text: "Sovereign-grade governance", textAr: "حوكمة بمستوى سيادي" },
        ],
      },
    },
    {
      id: "how-it-works",
      title: "How It Works",
      titleAr: "كيف يعمل",
      icon: BarChart3,
      color: "from-blue-600 to-indigo-700",
      content: {
        heading: "AI analyzes transactions, cash flows, trends, and risk indicators to generate forecasts and recommendations.",
        headingAr: "الذكاء الاصطناعي يحلل المعاملات والتدفقات النقدية والاتجاهات ومؤشرات المخاطر لتوليد التوقعات والتوصيات.",
        points: [
          { text: "Analyze financial transactions", textAr: "تحليل المعاملات المالية" },
          { text: "Track revenue and expense patterns", textAr: "تتبع أنماط الإيرادات والمصروفات" },
          { text: "Generate forecasts and alerts", textAr: "توليد التوقعات والتنبيهات" },
          { text: "Support proactive governance", textAr: "دعم الحوكمة الاستباقية" },
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
        heading: "Beyond accounting software. Beyond ERP finance modules. This is financial intelligence sovereignty.",
        headingAr: "ما وراء برامج المحاسبة. ما وراء وحدات تمويل ERP. هذه سيادة الذكاء المالي.",
        points: [
          { text: "Beyond accounting software", textAr: "ما وراء برامج المحاسبة" },
          { text: "Beyond ERP finance modules", textAr: "ما وراء وحدات تمويل ERP" },
          { text: "Financial intelligence sovereignty", textAr: "سيادة الذكاء المالي" },
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
        heading: "Designed for enterprise, group-level, and sovereign financial management.",
        headingAr: "مصمم للإدارة المالية على مستوى المؤسسات والمجموعات والسيادية.",
        points: [
          { text: "Enterprise financial management", textAr: "الإدارة المالية للمؤسسات" },
          { text: "Group-level governance", textAr: "حوكمة على مستوى المجموعة" },
          { text: "Sovereign finance oversight", textAr: "الرقابة المالية السيادية" },
          { text: "Multi-entity financial control", textAr: "التحكم المالي متعدد الكيانات" },
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
        heading: "Proactive decisions, reduced risk, optimized cash flow, and full financial sovereignty.",
        headingAr: "قرارات استباقية، مخاطر مخفضة، تدفق نقدي محسن، وسيادة مالية كاملة.",
        points: [
          { text: "Proactive financial decisions", textAr: "قرارات مالية استباقية" },
          { text: "Reduced risk exposure", textAr: "تعرض مخاطر مخفض" },
          { text: "Optimized cash flow", textAr: "تدفق نقدي محسن" },
          { text: "Full financial sovereignty", textAr: "سيادة مالية كاملة" },
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
                <Landmark className="w-4 h-4 mr-2 text-emerald-400" />
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
