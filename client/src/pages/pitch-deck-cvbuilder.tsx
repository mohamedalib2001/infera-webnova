import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  FileUser, 
  Target,
  Eye,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Lightbulb,
  Download,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Globe,
  QrCode,
} from "lucide-react";

interface PitchSlide {
  id: string;
  title: string;
  titleAr: string;
  icon: typeof FileUser;
  color: string;
  content: {
    heading: string;
    headingAr: string;
    points: { text: string; textAr: string }[];
  };
}

export default function PitchDeckCVBuilder() {
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: PitchSlide[] = [
    {
      id: "vision",
      title: "Vision",
      titleAr: "الرؤية",
      icon: Eye,
      color: "from-sky-600 to-blue-700",
      content: {
        heading: "To redefine how individuals and organizations present professional identity in the modern job market.",
        headingAr: "إعادة تعريف كيفية تقديم الأفراد والمؤسسات للهوية المهنية في سوق العمل الحديث.",
        points: [
          { text: "Redefine professional identity", textAr: "إعادة تعريف الهوية المهنية" },
          { text: "Modern job market optimization", textAr: "تحسين لسوق العمل الحديث" },
          { text: "Strategic positioning", textAr: "التموضع الاستراتيجي" },
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
        heading: "Traditional CV creation is manual, generic, and poorly optimized for recruiters and ATS systems.",
        headingAr: "إنشاء السيرة الذاتية التقليدي يدوي وعام وغير محسن للمجندين وأنظمة ATS.",
        points: [
          { text: "Manual and time-consuming", textAr: "يدوي ويستهلك الوقت" },
          { text: "Generic and non-competitive", textAr: "عام وغير تنافسي" },
          { text: "Poorly optimized for ATS", textAr: "غير محسن لأنظمة ATS" },
          { text: "Disconnected from career goals", textAr: "منفصل عن الأهداف المهنية" },
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
        heading: "INFERA CV Builder™ builds professional resumes using AI, optimized for roles, industries, and global standards.",
        headingAr: "INFERA CV Builder™ يبني سير ذاتية مهنية باستخدام الذكاء الاصطناعي، محسنة للأدوار والصناعات والمعايير العالمية.",
        points: [
          { text: "AI-powered CV generation", textAr: "إنشاء سيرة ذاتية بالذكاء الاصطناعي" },
          { text: "Role-specific optimization", textAr: "تحسين خاص بالدور" },
          { text: "Industry standards compliance", textAr: "امتثال لمعايير الصناعة" },
          { text: "Intelligently constructed CVs", textAr: "سير ذاتية مبنية بذكاء" },
        ],
      },
    },
    {
      id: "unique-value",
      title: "Unique Value",
      titleAr: "القيمة الفريدة",
      icon: Sparkles,
      color: "from-violet-600 to-purple-700",
      content: {
        heading: "AI-powered CV generation with multi-language support and QR-linked digital identity.",
        headingAr: "إنشاء سيرة ذاتية بالذكاء الاصطناعي مع دعم متعدد اللغات وهوية رقمية مربوطة بـ QR.",
        points: [
          { text: "AI-powered CV generation", textAr: "إنشاء سيرة ذاتية بالذكاء الاصطناعي" },
          { text: "Role and industry optimization", textAr: "تحسين للدور والصناعة" },
          { text: "Multi-language support", textAr: "دعم متعدد اللغات" },
          { text: "Professional smart templates", textAr: "قوالب ذكية احترافية" },
          { text: "Voice-based CV creation", textAr: "إنشاء سيرة ذاتية بالصوت" },
          { text: "QR-linked digital identity", textAr: "هوية رقمية مربوطة بـ QR" },
        ],
      },
    },
    {
      id: "how-it-works",
      title: "How It Works",
      titleAr: "كيف يعمل",
      icon: Globe,
      color: "from-blue-600 to-indigo-700",
      content: {
        heading: "AI analyzes user profile, target roles, and market demand to generate tailored CVs.",
        headingAr: "الذكاء الاصطناعي يحلل ملف المستخدم والأدوار المستهدفة وطلب السوق لإنشاء سير ذاتية مخصصة.",
        points: [
          { text: "Analyze user profile and experience", textAr: "تحليل ملف المستخدم والخبرة" },
          { text: "Target roles and industries", textAr: "الأدوار والصناعات المستهدفة" },
          { text: "Generate tailored CV", textAr: "إنشاء سيرة ذاتية مخصصة" },
          { text: "Continuous positioning improvement", textAr: "تحسين التموضع المستمر" },
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
        heading: "Beyond resume builders. Beyond templates. This is professional identity intelligence.",
        headingAr: "ما وراء بناء السير الذاتية. ما وراء القوالب. هذا ذكاء الهوية المهنية.",
        points: [
          { text: "Beyond resume builders", textAr: "ما وراء بناء السير الذاتية" },
          { text: "Beyond templates", textAr: "ما وراء القوالب" },
          { text: "Professional identity intelligence", textAr: "ذكاء الهوية المهنية" },
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
        heading: "Designed for professionals, graduates, enterprises, and recruitment agencies.",
        headingAr: "مصمم للمحترفين والخريجين والمؤسسات ووكالات التوظيف.",
        points: [
          { text: "Job seekers and professionals", textAr: "الباحثون عن عمل والمحترفون" },
          { text: "Graduates and career switchers", textAr: "الخريجون ومغيرو المسار المهني" },
          { text: "Enterprises managing talent branding", textAr: "المؤسسات التي تدير العلامة التجارية للمواهب" },
          { text: "Recruitment agencies", textAr: "وكالات التوظيف" },
        ],
      },
    },
    {
      id: "strategic-impact",
      title: "Strategic Impact",
      titleAr: "الأثر الاستراتيجي",
      icon: QrCode,
      color: "from-teal-600 to-cyan-700",
      content: {
        heading: "Candidates stand out, recruitment becomes faster, and professional identity becomes strategic.",
        headingAr: "المرشحون يتميزون، التوظيف يصبح أسرع، والهوية المهنية تصبح استراتيجية.",
        points: [
          { text: "Candidates stand out", textAr: "المرشحون يتميزون" },
          { text: "Faster recruitment", textAr: "توظيف أسرع" },
          { text: "Strategic professional identity", textAr: "هوية مهنية استراتيجية" },
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
        <div className="absolute inset-0 bg-gradient-to-br from-sky-950/20 via-background to-blue-950/20" />
        
        <div className="relative z-10 flex-1 flex flex-col max-w-7xl mx-auto px-4 py-8 w-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-4 py-2 border-sky-500/50 bg-sky-500/10">
                <FileUser className="w-4 h-4 mr-2 text-sky-400" />
                <span className="text-sky-400 font-medium">INFERA CV Builder™</span>
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
