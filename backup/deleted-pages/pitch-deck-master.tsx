import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  Building2, 
  Target,
  Eye,
  TrendingUp,
  Download,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers,
  Globe2,
  Cpu,
  Users,
  FileText,
  Briefcase,
  GraduationCap,
  DollarSign,
  Lock,
  Brain,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Network,
} from "lucide-react";
import { inferaPlatforms } from "@/lib/pitch-deck-data";

interface MasterSlide {
  id: string;
  title: string;
  titleAr: string;
  icon: typeof Building2;
  color: string;
  content: {
    heading: string;
    headingAr: string;
    points?: { text: string; textAr: string }[];
  };
}

export default function PitchDeckMaster() {
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: MasterSlide[] = [
    {
      id: "title",
      title: "INFERA Group",
      titleAr: "مجموعة INFERA",
      icon: Building2,
      color: "from-indigo-600 to-purple-700",
      content: {
        heading: "The Sovereign Digital Platform Ecosystem",
        headingAr: "منظومة المنصات الرقمية السيادية",
        points: [
          { text: "21+ Integrated Platforms", textAr: "21+ منصة متكاملة" },
          { text: "AI-First Architecture", textAr: "معمارية AI-أولاً" },
          { text: "Complete Digital Sovereignty", textAr: "سيادة رقمية كاملة" },
        ],
      },
    },
    {
      id: "vision",
      title: "Vision",
      titleAr: "الرؤية",
      icon: Eye,
      color: "from-violet-600 to-purple-700",
      content: {
        heading: "To become the world's leading sovereign digital platform factory, enabling organizations to build, operate, and govern their digital future with complete autonomy.",
        headingAr: "أن نصبح المصنع الرائد عالمياً للمنصات الرقمية السيادية، مما يمكّن المؤسسات من بناء وتشغيل وحوكمة مستقبلها الرقمي باستقلالية كاملة.",
      },
    },
    {
      id: "problem",
      title: "The Problem",
      titleAr: "المشكلة",
      icon: Target,
      color: "from-red-600 to-orange-700",
      content: {
        heading: "Organizations today face a critical challenge in digital transformation.",
        headingAr: "تواجه المؤسسات اليوم تحدياً حرجاً في التحول الرقمي.",
        points: [
          { text: "Fragmented tools and vendors", textAr: "أدوات وموردين مجزأين" },
          { text: "No unified data sovereignty", textAr: "لا سيادة بيانات موحدة" },
          { text: "Limited AI integration", textAr: "تكامل AI محدود" },
          { text: "Complex compliance requirements", textAr: "متطلبات امتثال معقدة" },
          { text: "Vendor lock-in and dependencies", textAr: "اعتماد وقفل على الموردين" },
        ],
      },
    },
    {
      id: "solution",
      title: "The Solution",
      titleAr: "الحل",
      icon: Sparkles,
      color: "from-emerald-600 to-green-700",
      content: {
        heading: "INFERA: A complete ecosystem of AI-powered sovereign platforms.",
        headingAr: "INFERA: منظومة كاملة من المنصات السيادية المدعومة بالذكاء الاصطناعي.",
        points: [
          { text: "One unified ecosystem", textAr: "منظومة واحدة موحدة" },
          { text: "Native AI in every platform", textAr: "ذكاء اصطناعي أصلي في كل منصة" },
          { text: "Complete data sovereignty", textAr: "سيادة بيانات كاملة" },
          { text: "Built-in compliance", textAr: "امتثال مدمج" },
          { text: "Zero vendor lock-in", textAr: "صفر اعتماد على الموردين" },
        ],
      },
    },
    {
      id: "ecosystem",
      title: "The Ecosystem",
      titleAr: "المنظومة",
      icon: Network,
      color: "from-blue-600 to-indigo-700",
      content: {
        heading: "21+ sovereign platforms across 6 strategic domains.",
        headingAr: "21+ منصة سيادية عبر 6 مجالات استراتيجية.",
        points: [
          { text: "Core OS & Engine: WebNova, Engine, Engine Control", textAr: "نظام التشغيل والمحرك: WebNova, Engine, Engine Control" },
          { text: "Finance: Finance AI, Sovereign Finance, GlobalCloud", textAr: "المالية: Finance AI, Sovereign Finance, GlobalCloud" },
          { text: "HR & Talent: HumanIQ, Jobs AI, CV Builder, Attend", textAr: "الموارد البشرية والمواهب: HumanIQ, Jobs AI, CV Builder, Attend" },
          { text: "Security: ShieldGrid, Smart Remote AI", textAr: "الأمن: ShieldGrid, Smart Remote AI" },
          { text: "Operations: Smart Docs, SmartMemory, AppForge", textAr: "العمليات: Smart Docs, SmartMemory, AppForge" },
          { text: "Industry: Education, Hospitality, Legal, Marketing", textAr: "القطاعات: Education, Hospitality, Legal, Marketing" },
        ],
      },
    },
    {
      id: "differentiation",
      title: "Differentiation",
      titleAr: "التميز",
      icon: Shield,
      color: "from-violet-600 to-purple-700",
      content: {
        heading: "What makes INFERA different from everything else in the market.",
        headingAr: "ما يجعل INFERA مختلفة عن كل شيء آخر في السوق.",
        points: [
          { text: "AI-First: Every platform has native AI intelligence", textAr: "AI-أولاً: كل منصة لديها ذكاء اصطناعي أصلي" },
          { text: "Sovereign: Complete control over data and operations", textAr: "سيادية: تحكم كامل في البيانات والعمليات" },
          { text: "Integrated: All platforms work together seamlessly", textAr: "متكاملة: جميع المنصات تعمل معاً بسلاسة" },
          { text: "Autonomous: Self-managing and self-optimizing", textAr: "مستقلة: إدارة وتحسين ذاتي" },
        ],
      },
    },
    {
      id: "market",
      title: "Market Opportunity",
      titleAr: "فرصة السوق",
      icon: TrendingUp,
      color: "from-amber-600 to-yellow-700",
      content: {
        heading: "A $500B+ global market with 25%+ annual growth.",
        headingAr: "سوق عالمي بقيمة 500+ مليار دولار بنمو سنوي 25%+.",
        points: [
          { text: "Digital platform market: $500B+", textAr: "سوق المنصات الرقمية: 500+ مليار دولار" },
          { text: "Enterprise AI market: $150B+", textAr: "سوق AI للمؤسسات: 150+ مليار دولار" },
          { text: "Digital sovereignty demand growing", textAr: "طلب متزايد على السيادة الرقمية" },
          { text: "Regional focus: MENA, Africa, Asia", textAr: "التركيز الإقليمي: الشرق الأوسط وأفريقيا وآسيا" },
        ],
      },
    },
    {
      id: "impact",
      title: "Strategic Impact",
      titleAr: "الأثر الاستراتيجي",
      icon: Brain,
      color: "from-teal-600 to-cyan-700",
      content: {
        heading: "Transforming how organizations operate in the digital age.",
        headingAr: "تحويل طريقة عمل المؤسسات في العصر الرقمي.",
        points: [
          { text: "80% reduction in time-to-deployment", textAr: "80% تخفيض في وقت النشر" },
          { text: "60% cost reduction vs. traditional solutions", textAr: "60% تخفيض في التكاليف مقارنة بالحلول التقليدية" },
          { text: "100% data sovereignty guaranteed", textAr: "100% سيادة بيانات مضمونة" },
          { text: "Continuous AI-driven optimization", textAr: "تحسين مستمر مدفوع بالذكاء الاصطناعي" },
        ],
      },
    },
    {
      id: "team",
      title: "Leadership",
      titleAr: "القيادة",
      icon: Users,
      color: "from-pink-600 to-rose-700",
      content: {
        heading: "Visionary leadership with deep technical expertise.",
        headingAr: "قيادة ذات رؤية بخبرة تقنية عميقة.",
        points: [
          { text: "Mohamed Ali Abdalla Mohamed - Founder & CEO", textAr: "محمد علي عبدالله محمد - المؤسس والرئيس التنفيذي" },
          { text: "Infra Engine - Parent Company", textAr: "Infra Engine - الشركة الأم" },
          { text: "Regional presence: Egypt & Saudi Arabia", textAr: "تواجد إقليمي: مصر والسعودية" },
        ],
      },
    },
    {
      id: "contact",
      title: "Contact Us",
      titleAr: "تواصل معنا",
      icon: Globe2,
      color: "from-indigo-600 to-purple-700",
      content: {
        heading: "Join us in building the future of sovereign digital platforms.",
        headingAr: "انضم إلينا في بناء مستقبل المنصات الرقمية السيادية.",
        points: [
          { text: "Email: mohamed.ali.b2001@gmail.com", textAr: "البريد: mohamed.ali.b2001@gmail.com" },
          { text: "Egypt: +201026363528", textAr: "مصر: +201026363528" },
          { text: "Saudi Arabia: +966544803384", textAr: "السعودية: +966544803384" },
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
                <Building2 className="w-4 h-4 mr-2 text-indigo-400" />
                <span className="text-indigo-400 font-medium">
                  {isRtl ? "عرض المجموعة الرئيسي" : "Master Group Pitch"}
                </span>
              </Badge>
              <span className="text-muted-foreground">
                {isRtl ? "21+ منصة سيادية" : "21+ Sovereign Platforms"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{currentSlide + 1} / {slides.length}</Badge>
              <Button variant="outline" size="sm" className="gap-2" data-testid="button-export-pdf">
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
                  
                  {currentSlideData.content.points && (
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
                  )}
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

          <div className="mt-8 grid grid-cols-5 md:grid-cols-10 gap-2">
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
