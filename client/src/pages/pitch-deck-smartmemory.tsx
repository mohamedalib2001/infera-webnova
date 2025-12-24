import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  Brain, 
  Target,
  Eye,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Lightbulb,
  Download,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Link2,
  Bell,
} from "lucide-react";

interface PitchSlide {
  id: string;
  title: string;
  titleAr: string;
  icon: typeof Brain;
  color: string;
  content: {
    heading: string;
    headingAr: string;
    points: { text: string; textAr: string }[];
  };
}

export default function PitchDeckSmartMemory() {
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: PitchSlide[] = [
    {
      id: "vision",
      title: "Vision",
      titleAr: "الرؤية",
      icon: Eye,
      color: "from-indigo-600 to-purple-700",
      content: {
        heading: "To create a living institutional memory that never forgets, understands context, and supports decision-making intelligently.",
        headingAr: "إنشاء ذاكرة مؤسسية حية لا تنسى أبداً، تفهم السياق، وتدعم اتخاذ القرارات بذكاء.",
        points: [
          { text: "Living institutional memory", textAr: "ذاكرة مؤسسية حية" },
          { text: "Context understanding", textAr: "فهم السياق" },
          { text: "Intelligent decision support", textAr: "دعم قرارات ذكي" },
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
        heading: "Organizations lose critical knowledge due to scattered documents and memory that disappears with people.",
        headingAr: "المؤسسات تفقد المعرفة الحرجة بسبب المستندات المتناثرة والذاكرة التي تختفي مع الأشخاص.",
        points: [
          { text: "Documents are scattered", textAr: "المستندات متناثرة" },
          { text: "Contracts are disconnected", textAr: "العقود منفصلة" },
          { text: "Reminders depend on humans", textAr: "التذكيرات تعتمد على البشر" },
          { text: "Institutional memory disappears", textAr: "الذاكرة المؤسسية تختفي" },
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
        heading: "SmartMemoryAI™ intelligently archives, understands, links, and recalls documents as contextual intelligence.",
        headingAr: "SmartMemoryAI™ يؤرشف بذكاء ويفهم ويربط ويستدعي المستندات كذكاء سياقي.",
        points: [
          { text: "Intelligent archiving", textAr: "أرشفة ذكية" },
          { text: "Contextual understanding", textAr: "فهم سياقي" },
          { text: "Document linking", textAr: "ربط المستندات" },
          { text: "Transform information to memory", textAr: "تحويل المعلومات إلى ذاكرة" },
        ],
      },
    },
    {
      id: "unique-value",
      title: "Unique Value",
      titleAr: "القيمة الفريدة",
      icon: BookOpen,
      color: "from-violet-600 to-purple-700",
      content: {
        heading: "AI-powered semantic archiving with intelligent linking and smart reminders.",
        headingAr: "أرشفة دلالية مدعومة بالذكاء الاصطناعي مع ربط ذكي وتذكيرات ذكية.",
        points: [
          { text: "AI-powered semantic archiving", textAr: "أرشفة دلالية بالذكاء الاصطناعي" },
          { text: "Intelligent linking", textAr: "ربط ذكي" },
          { text: "Smart reminders and obligation tracking", textAr: "تذكيرات ذكية وتتبع الالتزامات" },
          { text: "Monthly intelligence reports", textAr: "تقارير ذكاء شهرية" },
          { text: "Digital signatures and verification", textAr: "توقيعات رقمية وتحقق" },
        ],
      },
    },
    {
      id: "how-it-works",
      title: "How It Works",
      titleAr: "كيف يعمل",
      icon: Link2,
      color: "from-blue-600 to-indigo-700",
      content: {
        heading: "AI analyzes documents, contracts, and obligations to build a living knowledge graph.",
        headingAr: "الذكاء الاصطناعي يحلل المستندات والعقود والالتزامات لبناء رسم بياني معرفي حي.",
        points: [
          { text: "Analyze uploaded documents", textAr: "تحليل المستندات المرفوعة" },
          { text: "Track contracts and communications", textAr: "تتبع العقود والاتصالات" },
          { text: "Build living knowledge graph", textAr: "بناء رسم بياني معرفي حي" },
          { text: "Alert proactively", textAr: "تنبيه استباقي" },
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
        heading: "Beyond document storage. Beyond reminders. This is institutional memory intelligence.",
        headingAr: "ما وراء تخزين المستندات. ما وراء التذكيرات. هذا ذكاء الذاكرة المؤسسية.",
        points: [
          { text: "Beyond document storage", textAr: "ما وراء تخزين المستندات" },
          { text: "Beyond reminders", textAr: "ما وراء التذكيرات" },
          { text: "Institutional memory intelligence", textAr: "ذكاء الذاكرة المؤسسية" },
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
        heading: "Designed for organizations requiring permanent institutional knowledge.",
        headingAr: "مصمم للمؤسسات التي تتطلب معرفة مؤسسية دائمة.",
        points: [
          { text: "Corporate knowledge management", textAr: "إدارة معرفة الشركات" },
          { text: "Legal and contract memory", textAr: "ذاكرة قانونية وعقود" },
          { text: "Executive decision support", textAr: "دعم قرارات التنفيذيين" },
          { text: "Long-term organizational archiving", textAr: "أرشفة تنظيمية طويلة المدى" },
        ],
      },
    },
    {
      id: "strategic-impact",
      title: "Strategic Impact",
      titleAr: "الأثر الاستراتيجي",
      icon: Bell,
      color: "from-teal-600 to-cyan-700",
      content: {
        heading: "Organizations stop losing knowledge, decisions become faster, and institutional intelligence becomes permanent.",
        headingAr: "المؤسسات تتوقف عن فقدان المعرفة، القرارات تصبح أسرع، والذكاء المؤسسي يصبح دائماً.",
        points: [
          { text: "Stop losing knowledge", textAr: "توقف عن فقدان المعرفة" },
          { text: "Faster and safer decisions", textAr: "قرارات أسرع وأكثر أماناً" },
          { text: "Permanent institutional intelligence", textAr: "ذكاء مؤسسي دائم" },
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
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-background to-purple-950/20" />
        
        <div className="relative z-10 flex-1 flex flex-col max-w-7xl mx-auto px-4 py-8 w-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-4 py-2 border-indigo-500/50 bg-indigo-500/10">
                <Brain className="w-4 h-4 mr-2 text-indigo-400" />
                <span className="text-indigo-400 font-medium">SmartMemoryAI™</span>
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
