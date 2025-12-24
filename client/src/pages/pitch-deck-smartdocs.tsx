import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  FileText, 
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
  Search,
  Link2,
} from "lucide-react";

interface PitchSlide {
  id: string;
  title: string;
  titleAr: string;
  icon: typeof FileText;
  color: string;
  content: {
    heading: string;
    headingAr: string;
    points: { text: string; textAr: string }[];
  };
}

export default function PitchDeckSmartDocs() {
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: PitchSlide[] = [
    {
      id: "vision",
      title: "Vision",
      titleAr: "الرؤية",
      icon: Eye,
      color: "from-amber-600 to-orange-700",
      content: {
        heading: "To transform documents from static files into intelligent, connected, and decision-ready assets.",
        headingAr: "تحويل المستندات من ملفات ثابتة إلى أصول ذكية ومتصلة وجاهزة للقرارات.",
        points: [
          { text: "Intelligent document assets", textAr: "أصول مستندات ذكية" },
          { text: "Connected knowledge network", textAr: "شبكة معرفة متصلة" },
          { text: "Decision-ready information", textAr: "معلومات جاهزة للقرارات" },
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
        heading: "Organizations drown in documents that are scattered, difficult to search, and disconnected from decisions.",
        headingAr: "المؤسسات تغرق في مستندات متناثرة وصعبة البحث ومنفصلة عن القرارات.",
        points: [
          { text: "Scattered across systems", textAr: "متناثرة عبر الأنظمة" },
          { text: "Difficult to search", textAr: "صعبة البحث" },
          { text: "Disconnected from decisions", textAr: "منفصلة عن القرارات" },
          { text: "Manually reviewed and error-prone", textAr: "مراجعة يدوية وعرضة للأخطاء" },
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
        heading: "INFERA Smart Docs™ analyzes, understands, organizes, and links documents within their full institutional context.",
        headingAr: "INFERA Smart Docs™ يحلل ويفهم وينظم ويربط المستندات ضمن سياقها المؤسسي الكامل.",
        points: [
          { text: "AI document analysis", textAr: "تحليل مستندات بالذكاء الاصطناعي" },
          { text: "Automatic organization", textAr: "تنظيم تلقائي" },
          { text: "Contextual linking", textAr: "ربط سياقي" },
          { text: "Active knowledge conversion", textAr: "تحويل إلى معرفة نشطة" },
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
        heading: "AI-powered document understanding with automatic classification and semantic search.",
        headingAr: "فهم مستندات مدفوع بالذكاء الاصطناعي مع تصنيف تلقائي وبحث دلالي.",
        points: [
          { text: "AI-powered understanding", textAr: "فهم مدفوع بالذكاء الاصطناعي" },
          { text: "Automatic classification", textAr: "تصنيف تلقائي" },
          { text: "Contextual linking", textAr: "ربط سياقي" },
          { text: "Secure digital signatures", textAr: "توقيعات رقمية آمنة" },
          { text: "Semantic search", textAr: "بحث دلالي" },
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
        heading: "AI analyzes documents to extract meaning, classify content, and link to contracts and decisions.",
        headingAr: "الذكاء الاصطناعي يحلل المستندات لاستخراج المعنى وتصنيف المحتوى والربط بالعقود والقرارات.",
        points: [
          { text: "Extract meaning and key data", textAr: "استخراج المعنى والبيانات الرئيسية" },
          { text: "Classify content automatically", textAr: "تصنيف المحتوى تلقائياً" },
          { text: "Link to contracts and decisions", textAr: "الربط بالعقود والقرارات" },
          { text: "Enable instant semantic retrieval", textAr: "تمكين الاسترجاع الدلالي الفوري" },
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
        heading: "Beyond document storage. Beyond DMS systems. This is document intelligence.",
        headingAr: "ما وراء تخزين المستندات. ما وراء أنظمة DMS. هذا ذكاء المستندات.",
        points: [
          { text: "Beyond document storage", textAr: "ما وراء تخزين المستندات" },
          { text: "Beyond DMS systems", textAr: "ما وراء أنظمة DMS" },
          { text: "Document intelligence", textAr: "ذكاء المستندات" },
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
        heading: "Designed for organizations requiring intelligent document management.",
        headingAr: "مصمم للمؤسسات التي تتطلب إدارة مستندات ذكية.",
        points: [
          { text: "Corporate document management", textAr: "إدارة مستندات الشركات" },
          { text: "Legal and compliance archives", textAr: "أرشيفات قانونية وامتثال" },
          { text: "Government and institutional records", textAr: "سجلات حكومية ومؤسسية" },
          { text: "Contract and policy documentation", textAr: "توثيق العقود والسياسات" },
        ],
      },
    },
    {
      id: "strategic-impact",
      title: "Strategic Impact",
      titleAr: "الأثر الاستراتيجي",
      icon: Search,
      color: "from-teal-600 to-cyan-700",
      content: {
        heading: "Documents become searchable intelligence, decisions become faster, institutional memory becomes permanent.",
        headingAr: "المستندات تصبح ذكاء قابل للبحث، القرارات تصبح أسرع، الذاكرة المؤسسية تصبح دائمة.",
        points: [
          { text: "Searchable intelligence", textAr: "ذكاء قابل للبحث" },
          { text: "Faster decisions", textAr: "قرارات أسرع" },
          { text: "Reliable institutional memory", textAr: "ذاكرة مؤسسية موثوقة" },
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
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/20 via-background to-orange-950/20" />
        
        <div className="relative z-10 flex-1 flex flex-col max-w-7xl mx-auto px-4 py-8 w-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-4 py-2 border-amber-500/50 bg-amber-500/10">
                <FileText className="w-4 h-4 mr-2 text-amber-400" />
                <span className="text-amber-400 font-medium">INFERA Smart Docs™</span>
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
