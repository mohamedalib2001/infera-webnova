import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  Globe2, 
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
  Coins,
  Network,
} from "lucide-react";

interface PitchSlide {
  id: string;
  title: string;
  titleAr: string;
  icon: typeof Globe2;
  color: string;
  content: {
    heading: string;
    headingAr: string;
    points: { text: string; textAr: string }[];
  };
}

export default function PitchDeckGlobalCloud() {
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: PitchSlide[] = [
    {
      id: "vision",
      title: "Vision",
      titleAr: "الرؤية",
      icon: Eye,
      color: "from-blue-600 to-cyan-700",
      content: {
        heading: "To enable organizations to govern global finance with sovereign intelligence and predictive control across borders.",
        headingAr: "تمكين المؤسسات من حوكمة التمويل العالمي بذكاء سيادي وتحكم تنبؤي عبر الحدود.",
        points: [
          { text: "Global financial governance", textAr: "حوكمة مالية عالمية" },
          { text: "Sovereign intelligence", textAr: "ذكاء سيادي" },
          { text: "Predictive cross-border control", textAr: "تحكم تنبؤي عبر الحدود" },
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
        heading: "Global finance is fragmented across countries, complex to consolidate, and blind to cross-border risks.",
        headingAr: "التمويل العالمي مجزأ عبر الدول، معقد للتوحيد، وأعمى عن المخاطر عبر الحدود.",
        points: [
          { text: "Fragmented across countries", textAr: "مجزأ عبر الدول" },
          { text: "Complex to consolidate", textAr: "معقد للتوحيد" },
          { text: "Slow to adapt to changes", textAr: "بطيء في التكيف مع التغييرات" },
          { text: "Blind to cross-border risks", textAr: "أعمى عن المخاطر عبر الحدود" },
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
        heading: "INFERA GlobalCloud™ unifies multi-entity, multi-currency operations into one AI-driven governance system.",
        headingAr: "INFERA GlobalCloud™ يوحد العمليات متعددة الكيانات والعملات في نظام حوكمة واحد مدفوع بالذكاء الاصطناعي.",
        points: [
          { text: "Multi-entity unification", textAr: "توحيد متعدد الكيانات" },
          { text: "Multi-currency operations", textAr: "عمليات متعددة العملات" },
          { text: "AI-driven governance", textAr: "حوكمة مدفوعة بالذكاء الاصطناعي" },
          { text: "Visible and controllable finance", textAr: "تمويل مرئي وقابل للتحكم" },
        ],
      },
    },
    {
      id: "unique-value",
      title: "Unique Value",
      titleAr: "القيمة الفريدة",
      icon: Coins,
      color: "from-violet-600 to-purple-700",
      content: {
        heading: "Multi-entity orchestration with multi-currency intelligence and sovereign-grade international control.",
        headingAr: "تنسيق متعدد الكيانات مع ذكاء متعدد العملات وتحكم دولي بمستوى سيادي.",
        points: [
          { text: "Multi-entity orchestration", textAr: "تنسيق متعدد الكيانات" },
          { text: "Multi-currency intelligence", textAr: "ذكاء متعدد العملات" },
          { text: "Cross-border compliance", textAr: "امتثال عبر الحدود" },
          { text: "Global liquidity intelligence", textAr: "ذكاء السيولة العالمية" },
          { text: "AI-driven consolidation", textAr: "توحيد مدفوع بالذكاء الاصطناعي" },
        ],
      },
    },
    {
      id: "how-it-works",
      title: "How It Works",
      titleAr: "كيف يعمل",
      icon: Network,
      color: "from-blue-600 to-indigo-700",
      content: {
        heading: "AI analyzes financial data, currency movements, and compliance patterns to consolidate global intelligence.",
        headingAr: "الذكاء الاصطناعي يحلل البيانات المالية وحركات العملات وأنماط الامتثال لتوحيد الذكاء العالمي.",
        points: [
          { text: "Analyze data across entities", textAr: "تحليل البيانات عبر الكيانات" },
          { text: "Track currency and exchange risks", textAr: "تتبع مخاطر العملات والصرف" },
          { text: "Consolidate intelligence in real time", textAr: "توحيد الذكاء في الوقت الفعلي" },
          { text: "Support strategic global decisions", textAr: "دعم القرارات الاستراتيجية العالمية" },
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
        heading: "Beyond multinational ERP systems. Beyond regional tools. This is global financial intelligence sovereignty.",
        headingAr: "ما وراء أنظمة ERP متعددة الجنسيات. ما وراء الأدوات الإقليمية. هذه سيادة الذكاء المالي العالمي.",
        points: [
          { text: "Beyond multinational ERP", textAr: "ما وراء ERP متعدد الجنسيات" },
          { text: "Beyond regional finance tools", textAr: "ما وراء أدوات التمويل الإقليمية" },
          { text: "Global financial sovereignty", textAr: "سيادة مالية عالمية" },
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
        heading: "Designed for multinationals, investment groups, and cross-border financial governance.",
        headingAr: "مصمم للشركات متعددة الجنسيات ومجموعات الاستثمار والحوكمة المالية عبر الحدود.",
        points: [
          { text: "Multinational corporations", textAr: "الشركات متعددة الجنسيات" },
          { text: "Investment groups and holdings", textAr: "مجموعات الاستثمار والقابضة" },
          { text: "Global enterprises with subsidiaries", textAr: "المؤسسات العالمية مع الفروع" },
          { text: "Cross-border governance", textAr: "الحوكمة عبر الحدود" },
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
        heading: "Global visibility achieved, risks reduced, liquidity optimized, and sovereign control over global finance.",
        headingAr: "الرؤية العالمية تتحقق، المخاطر تقل، السيولة تُحسّن، والسيادة على التمويل العالمي.",
        points: [
          { text: "Global financial visibility", textAr: "رؤية مالية عالمية" },
          { text: "Reduced currency and regulatory risks", textAr: "مخاطر عملات وتنظيمية مخفضة" },
          { text: "Optimized worldwide liquidity", textAr: "سيولة محسنة عالمياً" },
          { text: "Sovereign control over global future", textAr: "سيادة على المستقبل العالمي" },
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
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-background to-cyan-950/20" />
        
        <div className="relative z-10 flex-1 flex flex-col max-w-7xl mx-auto px-4 py-8 w-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-4 py-2 border-blue-500/50 bg-blue-500/10">
                <Globe2 className="w-4 h-4 mr-2 text-blue-400" />
                <span className="text-blue-400 font-medium">INFERA GlobalCloud™</span>
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
