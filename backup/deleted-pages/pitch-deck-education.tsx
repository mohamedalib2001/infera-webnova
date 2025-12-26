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
  BarChart3,
  Download,
  ChevronLeft,
  ChevronRight,
  Brain,
  BookOpen,
  Zap,
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

export default function PitchDeckEducation() {
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: PitchSlide[] = [
    {
      id: "vision",
      title: "Vision",
      titleAr: "الرؤية",
      icon: Eye,
      color: "from-blue-600 to-indigo-700",
      content: {
        heading: "To personalize education intelligently.",
        headingAr: "تخصيص التعليم بذكاء.",
        points: [
          { text: "Personalized learning paths", textAr: "مسارات تعلم مخصصة" },
          { text: "Intelligent adaptation", textAr: "تكيف ذكي" },
          { text: "Individual-focused education", textAr: "تعليم يركز على الفرد" },
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
        heading: "Traditional education is static and generic.",
        headingAr: "التعليم التقليدي ثابت وعام.",
        points: [
          { text: "One-size-fits-all approach", textAr: "نهج واحد يناسب الجميع" },
          { text: "Static content delivery", textAr: "تقديم محتوى ثابت" },
          { text: "No personalization", textAr: "لا تخصيص" },
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
        heading: "INFERA AI Education Hub™ adapts learning paths to each learner.",
        headingAr: "INFERA AI Education Hub™ يكيف مسارات التعلم لكل متعلم.",
        points: [
          { text: "Adaptive learning paths", textAr: "مسارات تعلم متكيفة" },
          { text: "Personalized content", textAr: "محتوى مخصص" },
          { text: "Individual progress tracking", textAr: "تتبع التقدم الفردي" },
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
        heading: "Adaptive learning with skill intelligence and progress prediction.",
        headingAr: "تعلم متكيف مع ذكاء المهارات والتنبؤ بالتقدم.",
        points: [
          { text: "Adaptive learning", textAr: "تعلم متكيف" },
          { text: "Skill intelligence", textAr: "ذكاء المهارات" },
          { text: "Progress prediction", textAr: "التنبؤ بالتقدم" },
        ],
      },
    },
    {
      id: "how-it-works",
      title: "How It Works",
      titleAr: "كيف يعمل",
      icon: BookOpen,
      color: "from-blue-600 to-cyan-700",
      content: {
        heading: "AI analyzes learner behavior and adapts content in real-time.",
        headingAr: "الذكاء الاصطناعي يحلل سلوك المتعلم ويكيف المحتوى في الوقت الفعلي.",
        points: [
          { text: "Behavior analysis", textAr: "تحليل السلوك" },
          { text: "Real-time adaptation", textAr: "تكيف في الوقت الفعلي" },
          { text: "Continuous optimization", textAr: "تحسين مستمر" },
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
        heading: "Beyond LMS platforms. Intelligent education systems.",
        headingAr: "ما وراء منصات LMS. أنظمة تعليم ذكية.",
        points: [
          { text: "Beyond traditional LMS", textAr: "ما وراء LMS التقليدي" },
          { text: "Intelligent education systems", textAr: "أنظمة تعليم ذكية" },
          { text: "Measurable outcomes", textAr: "نتائج قابلة للقياس" },
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
        heading: "Designed for organizations requiring intelligent education.",
        headingAr: "مصمم للمؤسسات التي تتطلب تعليم ذكي.",
        points: [
          { text: "Corporate training", textAr: "التدريب المؤسسي" },
          { text: "Academic institutions", textAr: "المؤسسات الأكاديمية" },
          { text: "Professional development", textAr: "التطوير المهني" },
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
        heading: "Learning becomes effective and measurable.",
        headingAr: "التعلم يصبح فعالاً وقابلاً للقياس.",
        points: [
          { text: "Effective learning outcomes", textAr: "نتائج تعلم فعالة" },
          { text: "Measurable progress", textAr: "تقدم قابل للقياس" },
          { text: "ROI on education", textAr: "عائد الاستثمار على التعليم" },
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
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-background to-indigo-950/20" />
        
        <div className="relative z-10 flex-1 flex flex-col max-w-7xl mx-auto px-4 py-8 w-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-4 py-2 border-blue-500/50 bg-blue-500/10">
                <GraduationCap className="w-4 h-4 mr-2 text-blue-400" />
                <span className="text-blue-400 font-medium">INFERA AI Education Hub™</span>
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
