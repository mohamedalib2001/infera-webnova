import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  Hotel, 
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
  Heart,
  Sparkles,
  Users,
} from "lucide-react";

interface PitchSlide {
  id: string;
  title: string;
  titleAr: string;
  icon: typeof Hotel;
  color: string;
  content: {
    heading: string;
    headingAr: string;
    points: { text: string; textAr: string }[];
  };
}

export default function PitchDeckHospitality() {
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: PitchSlide[] = [
    {
      id: "vision",
      title: "Vision",
      titleAr: "الرؤية",
      icon: Eye,
      color: "from-rose-600 to-pink-700",
      content: {
        heading: "To redefine hospitality management through intelligent, predictive, and guest-centric systems.",
        headingAr: "إعادة تعريف إدارة الضيافة من خلال أنظمة ذكية وتنبؤية ومرتكزة على الضيوف.",
        points: [
          { text: "Intelligent hospitality systems", textAr: "أنظمة ضيافة ذكية" },
          { text: "Predictive guest services", textAr: "خدمات ضيوف تنبؤية" },
          { text: "Guest-centric experiences", textAr: "تجارب مرتكزة على الضيوف" },
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
        heading: "Hospitality operations suffer from fragmented data, reactive services, and limited guest understanding.",
        headingAr: "عمليات الضيافة تعاني من بيانات مجزأة وخدمات ردود فعل وفهم محدود للضيوف.",
        points: [
          { text: "Fragmented guest data", textAr: "بيانات ضيوف مجزأة" },
          { text: "Reactive service delivery", textAr: "تقديم خدمات ردود فعل" },
          { text: "Limited guest behavior understanding", textAr: "فهم محدود لسلوك الضيوف" },
          { text: "Decisions based on reports, not intelligence", textAr: "قرارات مبنية على تقارير وليس ذكاء" },
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
        heading: "INFERA Hospitality AI™ analyzes guest behavior and operational data for exceptional personalized experiences.",
        headingAr: "INFERA Hospitality AI™ يحلل سلوك الضيوف والبيانات التشغيلية لتجارب شخصية استثنائية.",
        points: [
          { text: "Guest behavior analysis", textAr: "تحليل سلوك الضيوف" },
          { text: "Service interaction insights", textAr: "رؤى تفاعل الخدمات" },
          { text: "Predictive guest experiences", textAr: "تجارب ضيوف تنبؤية" },
          { text: "Experience intelligence", textAr: "ذكاء التجارب" },
        ],
      },
    },
    {
      id: "unique-value",
      title: "Unique Value",
      titleAr: "القيمة الفريدة",
      icon: Heart,
      color: "from-violet-600 to-purple-700",
      content: {
        heading: "Guest behavior intelligence with predictive service needs and AI-driven optimization.",
        headingAr: "ذكاء سلوك الضيوف مع احتياجات خدمة تنبؤية وتحسين مدفوع بالذكاء الاصطناعي.",
        points: [
          { text: "Guest behavior intelligence", textAr: "ذكاء سلوك الضيوف" },
          { text: "Predictive service needs", textAr: "احتياجات خدمة تنبؤية" },
          { text: "Real-time satisfaction analysis", textAr: "تحليل الرضا في الوقت الفعلي" },
          { text: "AI-driven operational optimization", textAr: "تحسين تشغيلي مدفوع بالذكاء الاصطناعي" },
          { text: "Integrated guest journey insights", textAr: "رؤى رحلة الضيف المتكاملة" },
        ],
      },
    },
    {
      id: "how-it-works",
      title: "How It Works",
      titleAr: "كيف يعمل",
      icon: Sparkles,
      color: "from-blue-600 to-indigo-700",
      content: {
        heading: "AI analyzes guest interactions, service requests, and feedback to predict needs and optimize workflows.",
        headingAr: "الذكاء الاصطناعي يحلل تفاعلات الضيوف وطلبات الخدمة والملاحظات للتنبؤ بالاحتياجات وتحسين سير العمل.",
        points: [
          { text: "Guest interaction analysis", textAr: "تحليل تفاعلات الضيوف" },
          { text: "Service request tracking", textAr: "تتبع طلبات الخدمة" },
          { text: "Feedback and sentiment analysis", textAr: "تحليل الملاحظات والمشاعر" },
          { text: "Proactive staff alerts", textAr: "تنبيهات استباقية للموظفين" },
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
        heading: "Beyond hotel management systems. Beyond booking platforms. This is hospitality intelligence.",
        headingAr: "ما وراء أنظمة إدارة الفنادق. ما وراء منصات الحجز. هذا ذكاء الضيافة.",
        points: [
          { text: "Beyond hotel management", textAr: "ما وراء إدارة الفنادق" },
          { text: "Beyond booking platforms", textAr: "ما وراء منصات الحجز" },
          { text: "Hospitality intelligence", textAr: "ذكاء الضيافة" },
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
        heading: "Designed for hospitality organizations requiring intelligent guest experiences.",
        headingAr: "مصمم لمؤسسات الضيافة التي تتطلب تجارب ضيوف ذكية.",
        points: [
          { text: "Hotels and resorts", textAr: "الفنادق والمنتجعات" },
          { text: "Hospitality chains", textAr: "سلاسل الضيافة" },
          { text: "Luxury guest services", textAr: "خدمات الضيوف الفاخرة" },
          { text: "Experience-driven brands", textAr: "العلامات التجارية المدفوعة بالتجارب" },
        ],
      },
    },
    {
      id: "strategic-impact",
      title: "Strategic Impact",
      titleAr: "الأثر الاستراتيجي",
      icon: Users,
      color: "from-teal-600 to-cyan-700",
      content: {
        heading: "Guest satisfaction increases, operations become proactive, and hospitality gains competitive advantage.",
        headingAr: "رضا الضيوف يزداد، العمليات تصبح استباقية، والضيافة تكتسب ميزة تنافسية.",
        points: [
          { text: "Increased guest satisfaction", textAr: "زيادة رضا الضيوف" },
          { text: "Proactive operations", textAr: "عمليات استباقية" },
          { text: "Sustainable competitive advantage", textAr: "ميزة تنافسية مستدامة" },
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
        <div className="absolute inset-0 bg-gradient-to-br from-rose-950/20 via-background to-pink-950/20" />
        
        <div className="relative z-10 flex-1 flex flex-col max-w-7xl mx-auto px-4 py-8 w-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-4 py-2 border-rose-500/50 bg-rose-500/10">
                <Hotel className="w-4 h-4 mr-2 text-rose-400" />
                <span className="text-rose-400 font-medium">INFERA Hospitality AI™</span>
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
