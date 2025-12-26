import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  Users, 
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
  UserCheck,
  Sparkles,
} from "lucide-react";

interface PitchSlide {
  id: string;
  title: string;
  titleAr: string;
  icon: typeof Users;
  color: string;
  content: {
    heading: string;
    headingAr: string;
    points: { text: string; textAr: string }[];
  };
}

export default function PitchDeckHumanIQ() {
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: PitchSlide[] = [
    {
      id: "vision",
      title: "Vision",
      titleAr: "الرؤية",
      icon: Eye,
      color: "from-violet-600 to-purple-700",
      content: {
        heading: "To treat human capital as intelligent strategic assets.",
        headingAr: "معاملة رأس المال البشري كأصول استراتيجية ذكية.",
        points: [
          { text: "Human capital as strategic assets", textAr: "رأس المال البشري كأصول استراتيجية" },
          { text: "Intelligent workforce management", textAr: "إدارة قوى عاملة ذكية" },
          { text: "Data-driven people decisions", textAr: "قرارات بشرية مبنية على البيانات" },
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
        heading: "HR systems manage people as records, not intelligence.",
        headingAr: "أنظمة الموارد البشرية تدير الناس كسجلات وليس كذكاء.",
        points: [
          { text: "People treated as records", textAr: "الناس يعاملون كسجلات" },
          { text: "No intelligence extraction", textAr: "لا استخراج للذكاء" },
          { text: "Missed human potential", textAr: "إمكانات بشرية ضائعة" },
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
        heading: "INFERA HumanIQ™ understands performance, skills, behavior, and growth.",
        headingAr: "INFERA HumanIQ™ يفهم الأداء والمهارات والسلوك والنمو.",
        points: [
          { text: "Performance understanding", textAr: "فهم الأداء" },
          { text: "Skills analysis", textAr: "تحليل المهارات" },
          { text: "Behavioral insights", textAr: "رؤى سلوكية" },
          { text: "Growth prediction", textAr: "التنبؤ بالنمو" },
        ],
      },
    },
    {
      id: "unique-value",
      title: "Unique Value",
      titleAr: "القيمة الفريدة",
      icon: Brain,
      color: "from-violet-600 to-indigo-700",
      content: {
        heading: "Behavioral intelligence with predictive performance and skill forecasting.",
        headingAr: "ذكاء سلوكي مع أداء تنبؤي والتنبؤ بالمهارات.",
        points: [
          { text: "Behavioral intelligence", textAr: "ذكاء سلوكي" },
          { text: "Predictive performance", textAr: "أداء تنبؤي" },
          { text: "Skill forecasting", textAr: "التنبؤ بالمهارات" },
        ],
      },
    },
    {
      id: "how-it-works",
      title: "How It Works",
      titleAr: "كيف يعمل",
      icon: Sparkles,
      color: "from-blue-600 to-cyan-700",
      content: {
        heading: "AI analyzes employee data to predict, recommend, and optimize workforce decisions.",
        headingAr: "الذكاء الاصطناعي يحلل بيانات الموظفين للتنبؤ والتوصية وتحسين قرارات القوى العاملة.",
        points: [
          { text: "Employee data analysis", textAr: "تحليل بيانات الموظفين" },
          { text: "Predictive recommendations", textAr: "توصيات تنبؤية" },
          { text: "Workforce optimization", textAr: "تحسين القوى العاملة" },
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
        heading: "Beyond HR systems. Human intelligence platforms.",
        headingAr: "ما وراء أنظمة الموارد البشرية. منصات ذكاء بشري.",
        points: [
          { text: "Beyond traditional HR", textAr: "ما وراء الموارد البشرية التقليدية" },
          { text: "Human intelligence platform", textAr: "منصة ذكاء بشري" },
          { text: "Strategic people insights", textAr: "رؤى بشرية استراتيجية" },
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
        heading: "Designed for organizations requiring intelligent workforce management.",
        headingAr: "مصمم للمؤسسات التي تتطلب إدارة قوى عاملة ذكية.",
        points: [
          { text: "Corporate HR", textAr: "الموارد البشرية للشركات" },
          { text: "Talent optimization", textAr: "تحسين المواهب" },
          { text: "Workforce planning", textAr: "تخطيط القوى العاملة" },
        ],
      },
    },
    {
      id: "strategic-impact",
      title: "Strategic Impact",
      titleAr: "الأثر الاستراتيجي",
      icon: BarChart3,
      color: "from-teal-600 to-cyan-700",
      content: {
        heading: "People decisions become intelligent.",
        headingAr: "تصبح قرارات الناس ذكية.",
        points: [
          { text: "Intelligent people decisions", textAr: "قرارات بشرية ذكية" },
          { text: "Optimized workforce", textAr: "قوى عاملة محسنة" },
          { text: "Strategic HR transformation", textAr: "تحول استراتيجي للموارد البشرية" },
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
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/20 via-background to-purple-950/20" />
        
        <div className="relative z-10 flex-1 flex flex-col max-w-7xl mx-auto px-4 py-8 w-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-4 py-2 border-violet-500/50 bg-violet-500/10">
                <Users className="w-4 h-4 mr-2 text-violet-400" />
                <span className="text-violet-400 font-medium">INFERA HumanIQ™</span>
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
