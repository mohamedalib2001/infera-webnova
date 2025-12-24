import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  Smartphone, 
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
  MonitorSmartphone,
  Lock,
} from "lucide-react";

interface PitchSlide {
  id: string;
  title: string;
  titleAr: string;
  icon: typeof Smartphone;
  color: string;
  content: {
    heading: string;
    headingAr: string;
    points: { text: string; textAr: string }[];
  };
}

export default function PitchDeckSmartRemote() {
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: PitchSlide[] = [
    {
      id: "vision",
      title: "Vision",
      titleAr: "الرؤية",
      icon: Eye,
      color: "from-purple-600 to-violet-700",
      content: {
        heading: "To redefine remote device control as an intelligent, secure, and sovereign operation rather than a simple connection tool.",
        headingAr: "إعادة تعريف التحكم عن بعد في الأجهزة كعملية ذكية وآمنة وسيادية بدلاً من أداة اتصال بسيطة.",
        points: [
          { text: "Intelligent remote control", textAr: "تحكم عن بعد ذكي" },
          { text: "Secure sovereign operations", textAr: "عمليات سيادية آمنة" },
          { text: "Beyond simple connection", textAr: "ما وراء الاتصال البسيط" },
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
        heading: "Traditional remote control is focused on access only, weak in security, and difficult to manage at scale.",
        headingAr: "التحكم عن بعد التقليدي يركز على الوصول فقط، ضعيف في الأمان، وصعب الإدارة على نطاق واسع.",
        points: [
          { text: "Access-focused only", textAr: "يركز على الوصول فقط" },
          { text: "Weak session security", textAr: "أمان جلسات ضعيف" },
          { text: "Blind to user behavior", textAr: "أعمى عن سلوك المستخدم" },
          { text: "Hard to manage at scale", textAr: "صعب الإدارة على نطاق واسع" },
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
        heading: "INFERA Smart Remote AI™ enables secure, behavior-aware, and policy-governed control of all devices.",
        headingAr: "INFERA Smart Remote AI™ يمكّن التحكم الآمن والواعي للسلوك والمحكوم بالسياسات في جميع الأجهزة.",
        points: [
          { text: "Secure remote access", textAr: "وصول عن بعد آمن" },
          { text: "Behavior-aware control", textAr: "تحكم واعٍ للسلوك" },
          { text: "Policy-governed operations", textAr: "عمليات محكومة بالسياسات" },
          { text: "Intelligent sovereign access", textAr: "وصول سيادي ذكي" },
        ],
      },
    },
    {
      id: "unique-value",
      title: "Unique Value",
      titleAr: "القيمة الفريدة",
      icon: Lock,
      color: "from-violet-600 to-purple-700",
      content: {
        heading: "AI-driven behavior monitoring with sovereign-grade security and full session intelligence.",
        headingAr: "مراقبة سلوك مدفوعة بالذكاء الاصطناعي مع أمان بمستوى سيادي وذكاء جلسات كامل.",
        points: [
          { text: "AI-driven behavior monitoring", textAr: "مراقبة سلوك مدفوعة بالذكاء الاصطناعي" },
          { text: "Sovereign-grade secure access", textAr: "وصول آمن بمستوى سيادي" },
          { text: "Session anomaly detection", textAr: "كشف شذوذ الجلسات" },
          { text: "Centralized device governance", textAr: "حوكمة أجهزة مركزية" },
          { text: "Full audit trails", textAr: "مسارات تدقيق كاملة" },
        ],
      },
    },
    {
      id: "how-it-works",
      title: "How It Works",
      titleAr: "كيف يعمل",
      icon: MonitorSmartphone,
      color: "from-blue-600 to-indigo-700",
      content: {
        heading: "AI analyzes session behavior, interaction patterns, and access conditions to validate and govern remote actions.",
        headingAr: "الذكاء الاصطناعي يحلل سلوك الجلسة وأنماط التفاعل وظروف الوصول للتحقق من الإجراءات عن بعد وحوكمتها.",
        points: [
          { text: "Analyze remote session behavior", textAr: "تحليل سلوك الجلسة عن بعد" },
          { text: "Detect command anomalies", textAr: "كشف شذوذ الأوامر" },
          { text: "Enforce policies dynamically", textAr: "تطبيق السياسات ديناميكياً" },
          { text: "Auto-suspend risky sessions", textAr: "تعليق الجلسات الخطرة تلقائياً" },
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
        heading: "Beyond remote desktop tools. Beyond IT support software. This is remote control intelligence.",
        headingAr: "ما وراء أدوات سطح المكتب البعيد. ما وراء برامج دعم IT. هذا ذكاء التحكم عن بعد.",
        points: [
          { text: "Beyond remote desktop", textAr: "ما وراء سطح المكتب البعيد" },
          { text: "Beyond IT support software", textAr: "ما وراء برامج دعم IT" },
          { text: "Remote control intelligence", textAr: "ذكاء التحكم عن بعد" },
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
        heading: "Designed for enterprise IT, secure remote workforce, and high-security environments.",
        headingAr: "مصمم لـ IT المؤسسات والقوى العاملة عن بعد الآمنة والبيئات عالية الأمان.",
        points: [
          { text: "Enterprise IT remote support", textAr: "دعم IT عن بعد للمؤسسات" },
          { text: "Secure remote workforce", textAr: "قوى عاملة عن بعد آمنة" },
          { text: "Distributed team governance", textAr: "حوكمة الفرق الموزعة" },
          { text: "High-security environments", textAr: "البيئات عالية الأمان" },
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
        heading: "Remote operations become secure by design, insider risk is reduced, and sovereign control is achieved.",
        headingAr: "العمليات عن بعد تصبح آمنة بالتصميم، المخاطر الداخلية تقل، والسيادة تتحقق.",
        points: [
          { text: "Secure by design", textAr: "آمن بالتصميم" },
          { text: "Reduced insider risk", textAr: "مخاطر داخلية مخفضة" },
          { text: "Scalable IT governance", textAr: "حوكمة IT قابلة للتوسع" },
          { text: "Sovereign remote control", textAr: "تحكم عن بعد سيادي" },
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
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-background to-violet-950/20" />
        
        <div className="relative z-10 flex-1 flex flex-col max-w-7xl mx-auto px-4 py-8 w-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-4 py-2 border-purple-500/50 bg-purple-500/10">
                <Smartphone className="w-4 h-4 mr-2 text-purple-400" />
                <span className="text-purple-400 font-medium">INFERA Smart Remote AI™</span>
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
