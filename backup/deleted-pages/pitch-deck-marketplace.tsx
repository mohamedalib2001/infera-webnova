import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  ShoppingBag, 
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
  Users,
  Zap,
  Store,
} from "lucide-react";

interface PitchSlide {
  id: string;
  title: string;
  titleAr: string;
  icon: typeof ShoppingBag;
  color: string;
  content: {
    heading: string;
    headingAr: string;
    points: { text: string; textAr: string }[];
  };
}

export default function PitchDeckMarketplace() {
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: PitchSlide[] = [
    {
      id: "vision",
      title: "Vision",
      titleAr: "الرؤية",
      icon: Eye,
      color: "from-indigo-600 to-violet-700",
      content: {
        heading: "To build marketplaces that understand buyers.",
        headingAr: "بناء أسواق تفهم المشترين.",
        points: [
          { text: "Buyer-centric marketplaces", textAr: "أسواق تركز على المشتري" },
          { text: "Intelligent commerce", textAr: "تجارة ذكية" },
          { text: "Personalized experiences", textAr: "تجارب شخصية" },
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
        heading: "Marketplaces list products without intelligence.",
        headingAr: "الأسواق تعرض المنتجات بدون ذكاء.",
        points: [
          { text: "Static product listings", textAr: "قوائم منتجات ثابتة" },
          { text: "No buyer understanding", textAr: "لا فهم للمشترين" },
          { text: "Missed sales opportunities", textAr: "فرص مبيعات ضائعة" },
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
        heading: "INFERA Marketplace AI™ recommends, optimizes, and predicts sales.",
        headingAr: "INFERA Marketplace AI™ يوصي ويحسن ويتنبأ بالمبيعات.",
        points: [
          { text: "Smart recommendations", textAr: "توصيات ذكية" },
          { text: "Listing optimization", textAr: "تحسين القوائم" },
          { text: "Sales prediction", textAr: "التنبؤ بالمبيعات" },
        ],
      },
    },
    {
      id: "unique-value",
      title: "Unique Value",
      titleAr: "القيمة الفريدة",
      icon: Store,
      color: "from-violet-600 to-purple-700",
      content: {
        heading: "Intelligent recommendations with seller intelligence and buyer behavior analysis.",
        headingAr: "توصيات ذكية مع ذكاء البائعين وتحليل سلوك المشترين.",
        points: [
          { text: "Intelligent recommendations", textAr: "توصيات ذكية" },
          { text: "Seller intelligence", textAr: "ذكاء البائعين" },
          { text: "Buyer behavior analysis", textAr: "تحليل سلوك المشترين" },
        ],
      },
    },
    {
      id: "how-it-works",
      title: "How It Works",
      titleAr: "كيف يعمل",
      icon: Users,
      color: "from-blue-600 to-indigo-700",
      content: {
        heading: "AI tracks and learns purchase behavior to optimize listings and pricing.",
        headingAr: "الذكاء الاصطناعي يتتبع ويتعلم سلوك الشراء لتحسين القوائم والأسعار.",
        points: [
          { text: "Purchase behavior tracking", textAr: "تتبع سلوك الشراء" },
          { text: "Listing optimization", textAr: "تحسين القوائم" },
          { text: "Dynamic pricing", textAr: "تسعير ديناميكي" },
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
        heading: "Beyond e-commerce platforms. Intelligent commerce systems.",
        headingAr: "ما وراء منصات التجارة الإلكترونية. أنظمة تجارة ذكية.",
        points: [
          { text: "Beyond traditional e-commerce", textAr: "ما وراء التجارة الإلكترونية التقليدية" },
          { text: "Intelligent commerce systems", textAr: "أنظمة تجارة ذكية" },
          { text: "Competitive advantage", textAr: "ميزة تنافسية" },
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
        heading: "Designed for marketplaces requiring intelligent commerce.",
        headingAr: "مصمم للأسواق التي تتطلب تجارة ذكية.",
        points: [
          { text: "B2B marketplaces", textAr: "أسواق B2B" },
          { text: "B2C platforms", textAr: "منصات B2C" },
          { text: "Multi-vendor stores", textAr: "متاجر متعددة البائعين" },
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
        heading: "Sales become optimized automatically.",
        headingAr: "المبيعات تصبح محسنة تلقائياً.",
        points: [
          { text: "Automatic sales optimization", textAr: "تحسين المبيعات التلقائي" },
          { text: "Increased conversions", textAr: "زيادة التحويلات" },
          { text: "Revenue maximization", textAr: "تعظيم الإيرادات" },
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
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-background to-violet-950/20" />
        
        <div className="relative z-10 flex-1 flex flex-col max-w-7xl mx-auto px-4 py-8 w-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-4 py-2 border-indigo-500/50 bg-indigo-500/10">
                <ShoppingBag className="w-4 h-4 mr-2 text-indigo-400" />
                <span className="text-indigo-400 font-medium">INFERA Marketplace AI™</span>
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
