import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  GraduationCap, 
  Target,
  Eye,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Lightbulb,
  Download,
  ChevronLeft,
  ChevronRight,
  Brain,
  Award,
  BarChart3,
} from "lucide-react";

interface PitchSlide {
  id: string;
  title: string;
  titleAr: string;
  icon: typeof GraduationCap;
  color: string;
  content: {
    heading: string;
    headingAr: string;
    points: { text: string; textAr: string }[];
  };
}

export default function PitchDeckTrainAI() {
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: PitchSlide[] = [
    {
      id: "vision",
      title: "Vision",
      titleAr: "الرؤية",
      icon: Eye,
      color: "from-orange-600 to-amber-700",
      content: {
        heading: "To transform corporate training from generic courses into intelligent, performance-driven skill development.",
        headingAr: "تحويل التدريب المؤسسي من دورات عامة إلى تطوير مهارات ذكي مدفوع بالأداء.",
        points: [
          { text: "Intelligent skill development", textAr: "تطوير مهارات ذكي" },
          { text: "Performance-driven training", textAr: "تدريب مدفوع بالأداء" },
          { text: "Targeted learning paths", textAr: "مسارات تعلم مستهدفة" },
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
        heading: "Traditional training delivers generic content, disconnected from performance and skill impact.",
        headingAr: "التدريب التقليدي يقدم محتوى عام، منفصل عن الأداء وتأثير المهارات.",
        points: [
          { text: "Same content for everyone", textAr: "نفس المحتوى للجميع" },
          { text: "Disconnected from job performance", textAr: "منفصل عن الأداء الوظيفي" },
          { text: "No skill impact measurement", textAr: "لا قياس لتأثير المهارات" },
          { text: "Wasted training budgets", textAr: "ميزانيات تدريب مهدرة" },
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
        heading: "INFERA TrainAI™ designs and adapts training based on performance, skill gaps, and organizational objectives.",
        headingAr: "INFERA TrainAI™ يصمم ويكيف التدريب بناءً على الأداء وفجوات المهارات وأهداف المؤسسة.",
        points: [
          { text: "Performance-based training design", textAr: "تصميم تدريب قائم على الأداء" },
          { text: "Skill gap analysis", textAr: "تحليل فجوات المهارات" },
          { text: "Adaptive learning programs", textAr: "برامج تعلم تكيفية" },
          { text: "Targeted and measurable training", textAr: "تدريب مستهدف وقابل للقياس" },
        ],
      },
    },
    {
      id: "unique-value",
      title: "Unique Value",
      titleAr: "القيمة الفريدة",
      icon: Brain,
      color: "from-violet-600 to-purple-700",
      content: {
        heading: "AI-driven skill gap analysis with personalized paths and verified certifications.",
        headingAr: "تحليل فجوات مهارات بالذكاء الاصطناعي مع مسارات شخصية وشهادات موثقة.",
        points: [
          { text: "AI-driven skill gap analysis", textAr: "تحليل فجوات مهارات بالذكاء الاصطناعي" },
          { text: "Personalized training paths", textAr: "مسارات تدريب شخصية" },
          { text: "Performance-linked learning", textAr: "تعلم مرتبط بالأداء" },
          { text: "Smart assessments", textAr: "تقييمات ذكية" },
          { text: "Verified digital certifications", textAr: "شهادات رقمية موثقة" },
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
        heading: "AI analyzes roles, performance, and skills to generate adaptive learning paths.",
        headingAr: "الذكاء الاصطناعي يحلل الأدوار والأداء والمهارات لتوليد مسارات تعلم تكيفية.",
        points: [
          { text: "Analyze employee roles and performance", textAr: "تحليل أدوار الموظفين والأداء" },
          { text: "Identify required and missing skills", textAr: "تحديد المهارات المطلوبة والناقصة" },
          { text: "Generate adaptive learning paths", textAr: "توليد مسارات تعلم تكيفية" },
          { text: "Measure real skill improvement", textAr: "قياس تحسن المهارات الفعلي" },
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
        heading: "Beyond learning management systems. Beyond course libraries. This is skills intelligence.",
        headingAr: "ما وراء أنظمة إدارة التعلم. ما وراء مكتبات الدورات. هذا ذكاء المهارات.",
        points: [
          { text: "Beyond LMS systems", textAr: "ما وراء أنظمة LMS" },
          { text: "Beyond course libraries", textAr: "ما وراء مكتبات الدورات" },
          { text: "Skills intelligence", textAr: "ذكاء المهارات" },
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
        heading: "Designed for corporate training, leadership programs, and workforce transformation.",
        headingAr: "مصمم للتدريب المؤسسي وبرامج القيادة وتحول القوى العاملة.",
        points: [
          { text: "Corporate employee training", textAr: "تدريب موظفي الشركات" },
          { text: "Leadership and upskilling", textAr: "القيادة ورفع المهارات" },
          { text: "Compliance training", textAr: "تدريب الامتثال" },
          { text: "Workforce transformation", textAr: "تحول القوى العاملة" },
        ],
      },
    },
    {
      id: "strategic-impact",
      title: "Strategic Impact",
      titleAr: "الأثر الاستراتيجي",
      icon: Award,
      color: "from-teal-600 to-cyan-700",
      content: {
        heading: "Training budgets are optimized, performance improves, and organizations build future-ready teams.",
        headingAr: "ميزانيات التدريب تُحسّن، الأداء يتحسن، والمؤسسات تبني فرق جاهزة للمستقبل.",
        points: [
          { text: "Optimized training budgets", textAr: "ميزانيات تدريب محسنة" },
          { text: "Measurable performance improvement", textAr: "تحسن أداء قابل للقياس" },
          { text: "Skills aligned with strategy", textAr: "مهارات متوافقة مع الاستراتيجية" },
          { text: "Future-ready teams", textAr: "فرق جاهزة للمستقبل" },
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
        <div className="absolute inset-0 bg-gradient-to-br from-orange-950/20 via-background to-amber-950/20" />
        
        <div className="relative z-10 flex-1 flex flex-col max-w-7xl mx-auto px-4 py-8 w-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-4 py-2 border-orange-500/50 bg-orange-500/10">
                <GraduationCap className="w-4 h-4 mr-2 text-orange-400" />
                <span className="text-orange-400 font-medium">INFERA TrainAI™</span>
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
