import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  Clock, 
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
  MapPin,
  Fingerprint,
  Shield,
} from "lucide-react";

interface PitchSlide {
  id: string;
  title: string;
  titleAr: string;
  icon: typeof Clock;
  color: string;
  content: {
    heading: string;
    headingAr: string;
    points: { text: string; textAr: string }[];
  };
}

export default function PitchDeckAttend() {
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: PitchSlide[] = [
    {
      id: "vision",
      title: "Vision",
      titleAr: "الرؤية",
      icon: Eye,
      color: "from-cyan-600 to-teal-700",
      content: {
        heading: "To redefine attendance and presence as intelligent, transparent, and tamper-proof systems.",
        headingAr: "إعادة تعريف الحضور والتواجد كأنظمة ذكية وشفافة ومقاومة للتلاعب.",
        points: [
          { text: "Intelligent attendance systems", textAr: "أنظمة حضور ذكية" },
          { text: "Transparent presence tracking", textAr: "تتبع تواجد شفاف" },
          { text: "Tamper-proof records", textAr: "سجلات مقاومة للتلاعب" },
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
        heading: "Traditional attendance systems are easy to manipulate, location-blind, and disconnected from performance.",
        headingAr: "أنظمة الحضور التقليدية سهلة التلاعب وعمياء عن الموقع ومنفصلة عن الأداء.",
        points: [
          { text: "Easy to manipulate", textAr: "سهلة التلاعب" },
          { text: "Location-blind systems", textAr: "أنظمة عمياء عن الموقع" },
          { text: "Disconnected from payroll", textAr: "منفصلة عن الرواتب" },
          { text: "Reactive instead of intelligent", textAr: "ردود فعل بدلاً من ذكية" },
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
        heading: "INFERA Attend AI™ combines location intelligence, biometrics, and behavioral analysis for accurate presence tracking.",
        headingAr: "INFERA Attend AI™ يجمع ذكاء الموقع والبيومترية وتحليل السلوك لتتبع تواجد دقيق.",
        points: [
          { text: "Location intelligence", textAr: "ذكاء الموقع" },
          { text: "Biometric verification", textAr: "التحقق البيومتري" },
          { text: "Behavioral analysis", textAr: "تحليل السلوك" },
        ],
      },
    },
    {
      id: "unique-value",
      title: "Unique Value",
      titleAr: "القيمة الفريدة",
      icon: Fingerprint,
      color: "from-violet-600 to-purple-700",
      content: {
        heading: "Location-based intelligence with biometric verification and tamper-resistant records.",
        headingAr: "ذكاء قائم على الموقع مع تحقق بيومتري وسجلات مقاومة للتلاعب.",
        points: [
          { text: "Location-based intelligence", textAr: "ذكاء قائم على الموقع" },
          { text: "Biometric verification", textAr: "تحقق بيومتري" },
          { text: "Behavioral pattern analysis", textAr: "تحليل أنماط السلوك" },
          { text: "Real-time HR & payroll integration", textAr: "تكامل HR والرواتب في الوقت الفعلي" },
          { text: "Tamper-resistant records", textAr: "سجلات مقاومة للتلاعب" },
        ],
      },
    },
    {
      id: "how-it-works",
      title: "How It Works",
      titleAr: "كيف يعمل",
      icon: MapPin,
      color: "from-blue-600 to-indigo-700",
      content: {
        heading: "AI validates presence through geolocation, biometrics, and behavioral consistency checks.",
        headingAr: "الذكاء الاصطناعي يتحقق من التواجد عبر الموقع الجغرافي والبيومترية وفحوصات اتساق السلوك.",
        points: [
          { text: "Geolocation signals", textAr: "إشارات الموقع الجغرافي" },
          { text: "Biometric confirmation", textAr: "تأكيد بيومتري" },
          { text: "Behavioral consistency checks", textAr: "فحوصات اتساق السلوك" },
          { text: "Real-time sync with HR systems", textAr: "مزامنة في الوقت الفعلي مع أنظمة HR" },
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
        heading: "Beyond time clocks. Beyond check-in apps. This is attendance intelligence.",
        headingAr: "ما وراء ساعات الدوام. ما وراء تطبيقات تسجيل الحضور. هذا ذكاء حضور.",
        points: [
          { text: "Beyond time clocks", textAr: "ما وراء ساعات الدوام" },
          { text: "Beyond check-in apps", textAr: "ما وراء تطبيقات تسجيل الحضور" },
          { text: "Attendance intelligence", textAr: "ذكاء الحضور" },
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
        heading: "Designed for organizations requiring trusted presence tracking.",
        headingAr: "مصمم للمؤسسات التي تتطلب تتبع تواجد موثوق.",
        points: [
          { text: "Corporate workforce attendance", textAr: "حضور القوى العاملة للشركات" },
          { text: "Remote & hybrid teams", textAr: "الفرق عن بعد والهجينة" },
          { text: "Field operations", textAr: "العمليات الميدانية" },
          { text: "Compliance-driven organizations", textAr: "المؤسسات المدفوعة بالامتثال" },
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
        heading: "Attendance becomes a trusted data source for payroll accuracy and performance evaluation.",
        headingAr: "الحضور يصبح مصدر بيانات موثوق لدقة الرواتب وتقييم الأداء.",
        points: [
          { text: "Trusted data source", textAr: "مصدر بيانات موثوق" },
          { text: "Payroll accuracy", textAr: "دقة الرواتب" },
          { text: "Performance evaluation", textAr: "تقييم الأداء" },
          { text: "Operational discipline", textAr: "الانضباط التشغيلي" },
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
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/20 via-background to-teal-950/20" />
        
        <div className="relative z-10 flex-1 flex flex-col max-w-7xl mx-auto px-4 py-8 w-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-4 py-2 border-cyan-500/50 bg-cyan-500/10">
                <Clock className="w-4 h-4 mr-2 text-cyan-400" />
                <span className="text-cyan-400 font-medium">INFERA Attend AI™</span>
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
