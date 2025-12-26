import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Target,
  Eye,
  TrendingUp,
  Download,
  ChevronLeft,
  ChevronRight,
  Shield,
  Globe2,
  Users,
  DollarSign,
  Rocket,
  Award,
  Lightbulb,
  CheckCircle2,
  Building2,
  Brain,
} from "lucide-react";

interface NarrativeSection {
  id: string;
  title: string;
  titleAr: string;
  icon: typeof BookOpen;
  color: string;
  content: {
    heading: string;
    headingAr: string;
    paragraphs: { text: string; textAr: string }[];
  };
}

export default function InvestorNarrative() {
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [currentSection, setCurrentSection] = useState(0);

  const sections: NarrativeSection[] = [
    {
      id: "opening",
      title: "The Story",
      titleAr: "القصة",
      icon: BookOpen,
      color: "from-indigo-600 to-purple-700",
      content: {
        heading: "A New Era of Digital Sovereignty",
        headingAr: "عصر جديد من السيادة الرقمية",
        paragraphs: [
          { 
            text: "In a world where digital transformation is no longer optional, organizations face an unprecedented challenge: how to build, operate, and govern their digital infrastructure without surrendering control to fragmented vendors and insecure systems.", 
            textAr: "في عالم لم يعد فيه التحول الرقمي اختيارياً، تواجه المؤسسات تحدياً غير مسبوق: كيف تبني وتشغل وتحكم بنيتها التحتية الرقمية دون التنازل عن السيطرة للموردين المجزأين والأنظمة غير الآمنة."
          },
          { 
            text: "INFERA was born from this challenge. We envisioned a world where organizations don't just use digital platforms—they own them. Completely. Sovereignly.", 
            textAr: "ولدت INFERA من هذا التحدي. تصورنا عالماً لا تستخدم فيه المؤسسات المنصات الرقمية فحسب—بل تمتلكها. بالكامل. بسيادة."
          },
        ],
      },
    },
    {
      id: "problem",
      title: "The Problem",
      titleAr: "المشكلة",
      icon: Target,
      color: "from-red-600 to-orange-700",
      content: {
        heading: "Digital Transformation is Broken",
        headingAr: "التحول الرقمي مكسور",
        paragraphs: [
          { 
            text: "Today's enterprises are drowning in a sea of disconnected SaaS tools, each solving one problem while creating three others. Data flows between dozens of vendors, compliance becomes a nightmare, and true digital sovereignty remains a distant dream.", 
            textAr: "مؤسسات اليوم تغرق في بحر من أدوات SaaS المنفصلة، كل منها تحل مشكلة واحدة بينما تخلق ثلاث أخرى. البيانات تتدفق بين عشرات الموردين، والامتثال يصبح كابوساً، والسيادة الرقمية الحقيقية تبقى حلماً بعيداً."
          },
          { 
            text: "The cost? Billions in inefficiency. The risk? Complete dependency on external vendors who may disappear, change terms, or compromise security at any moment.", 
            textAr: "التكلفة؟ مليارات في عدم الكفاءة. المخاطر؟ اعتماد كامل على موردين خارجيين قد يختفون أو يغيرون الشروط أو يخترقون الأمان في أي لحظة."
          },
        ],
      },
    },
    {
      id: "solution",
      title: "Our Solution",
      titleAr: "حلنا",
      icon: Lightbulb,
      color: "from-emerald-600 to-green-700",
      content: {
        heading: "INFERA: The Sovereign Platform Factory",
        headingAr: "INFERA: مصنع المنصات السيادية",
        paragraphs: [
          { 
            text: "INFERA is not another SaaS company. We are a platform factory—a complete operating system for building, deploying, and governing sovereign digital platforms. With 21+ integrated platforms powered by native AI, organizations can finally take complete control of their digital destiny.", 
            textAr: "INFERA ليست شركة SaaS أخرى. نحن مصنع منصات—نظام تشغيل كامل لبناء ونشر وحوكمة المنصات الرقمية السيادية. مع 21+ منصة متكاملة مدعومة بذكاء اصطناعي أصلي، يمكن للمؤسسات أخيراً السيطرة الكاملة على مصيرها الرقمي."
          },
          { 
            text: "From finance to HR, from security to operations, from education to healthcare—every platform works together seamlessly, sharing intelligence while maintaining complete data sovereignty.", 
            textAr: "من المالية إلى الموارد البشرية، من الأمان إلى العمليات، من التعليم إلى الرعاية الصحية—كل منصة تعمل معاً بسلاسة، تشارك الذكاء مع الحفاظ على سيادة البيانات الكاملة."
          },
        ],
      },
    },
    {
      id: "differentiation",
      title: "Why We Win",
      titleAr: "لماذا نفوز",
      icon: Award,
      color: "from-violet-600 to-purple-700",
      content: {
        heading: "Unmatched Competitive Moat",
        headingAr: "حصانة تنافسية لا مثيل لها",
        paragraphs: [
          { 
            text: "Our competitive advantage is not a single feature—it's our entire architecture. The integration between 21+ platforms creates network effects that compound over time. The more platforms an organization uses, the more valuable each one becomes.", 
            textAr: "ميزتنا التنافسية ليست ميزة واحدة—إنها معماريتنا بالكامل. التكامل بين 21+ منصة يخلق تأثيرات شبكية تتضاعف مع الوقت. كلما استخدمت المؤسسة منصات أكثر، كلما أصبحت كل واحدة أكثر قيمة."
          },
          { 
            text: "Native AI in every platform means intelligence is not bolted on—it's built in. This creates a sovereign AI layer that learns continuously while keeping all data within the organization's control.", 
            textAr: "الذكاء الاصطناعي الأصلي في كل منصة يعني أن الذكاء ليس مضافاً—إنه مبني. هذا يخلق طبقة ذكاء اصطناعي سيادية تتعلم باستمرار مع الحفاظ على جميع البيانات تحت سيطرة المؤسسة."
          },
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
        heading: "$500B+ Market with 25%+ Growth",
        headingAr: "سوق 500+ مليار دولار بنمو 25%+",
        paragraphs: [
          { 
            text: "The global digital platform market exceeds $500 billion and is growing at over 25% annually. But the real opportunity lies in the emerging demand for digital sovereignty—organizations are increasingly unwilling to trust their critical infrastructure to external vendors.", 
            textAr: "سوق المنصات الرقمية العالمي يتجاوز 500 مليار دولار وينمو بأكثر من 25% سنوياً. لكن الفرصة الحقيقية تكمن في الطلب الناشئ على السيادة الرقمية—المؤسسات تزداد عدم رغبتها في الوثوق ببنيتها التحتية الحرجة للموردين الخارجيين."
          },
          { 
            text: "Our initial focus is the MENA region—a $50B+ market with massive digital transformation initiatives and a cultural alignment with sovereignty principles. From there, we expand to Africa, Asia, and globally.", 
            textAr: "تركيزنا الأولي هو منطقة الشرق الأوسط وشمال أفريقيا—سوق 50+ مليار دولار مع مبادرات تحول رقمي ضخمة ومواءمة ثقافية مع مبادئ السيادة. ومن هناك، نتوسع إلى أفريقيا وآسيا وعالمياً."
          },
        ],
      },
    },
    {
      id: "traction",
      title: "Traction",
      titleAr: "الإنجازات",
      icon: Rocket,
      color: "from-blue-600 to-indigo-700",
      content: {
        heading: "Building the Foundation",
        headingAr: "بناء الأساس",
        paragraphs: [
          { 
            text: "We have developed 21+ fully functional platform blueprints, each with native AI integration, sovereign architecture, and compliance frameworks. The core WebNova OS is operational and capable of generating new platforms autonomously.", 
            textAr: "طورنا 21+ مخطط منصة وظيفي بالكامل، كل منها مع تكامل ذكاء اصطناعي أصلي ومعمارية سيادية وأطر امتثال. نظام WebNova الأساسي يعمل وقادر على توليد منصات جديدة بشكل مستقل."
          },
          { 
            text: "Our technology stack is production-ready, built on modern cloud-native architecture with full deployment automation. We are now seeking strategic partners to accelerate market entry.", 
            textAr: "حزمتنا التقنية جاهزة للإنتاج، مبنية على معمارية سحابية حديثة مع أتمتة نشر كاملة. نسعى الآن لشركاء استراتيجيين لتسريع دخول السوق."
          },
        ],
      },
    },
    {
      id: "team",
      title: "The Team",
      titleAr: "الفريق",
      icon: Users,
      color: "from-pink-600 to-rose-700",
      content: {
        heading: "Visionary Leadership",
        headingAr: "قيادة ذات رؤية",
        paragraphs: [
          { 
            text: "INFERA is led by Mohamed Ali Abdalla Mohamed, Founder & CEO of Infra Engine. With deep expertise in AI-powered platforms and a vision for digital sovereignty, Mohamed has assembled a team capable of executing on this ambitious mission.", 
            textAr: "تقود INFERA محمد علي عبدالله محمد، المؤسس والرئيس التنفيذي لـ Infra Engine. بخبرة عميقة في المنصات المدعومة بالذكاء الاصطناعي ورؤية للسيادة الرقمية، جمع محمد فريقاً قادراً على تنفيذ هذه المهمة الطموحة."
          },
          { 
            text: "Operating from Egypt and Saudi Arabia, we are strategically positioned to serve the MENA region while building global capability.", 
            textAr: "نعمل من مصر والسعودية، نحن في موقع استراتيجي لخدمة منطقة الشرق الأوسط وشمال أفريقيا مع بناء قدرة عالمية."
          },
        ],
      },
    },
    {
      id: "ask",
      title: "The Ask",
      titleAr: "الطلب",
      icon: DollarSign,
      color: "from-emerald-600 to-teal-700",
      content: {
        heading: "Strategic Partnership",
        headingAr: "شراكة استراتيجية",
        paragraphs: [
          { 
            text: "We are seeking strategic partners who share our vision of digital sovereignty. Partners who understand that the future of enterprise software is not about more tools—it's about fewer, better, sovereign platforms.", 
            textAr: "نسعى لشركاء استراتيجيين يشاركوننا رؤيتنا للسيادة الرقمية. شركاء يفهمون أن مستقبل برمجيات المؤسسات ليس عن المزيد من الأدوات—بل عن منصات أقل وأفضل وسيادية."
          },
          { 
            text: "Together, we can redefine how organizations build and operate in the digital age. This is not just an investment opportunity—it's a chance to shape the future of enterprise technology.", 
            textAr: "معاً، يمكننا إعادة تعريف كيفية بناء وتشغيل المؤسسات في العصر الرقمي. هذه ليست مجرد فرصة استثمارية—إنها فرصة لتشكيل مستقبل تكنولوجيا المؤسسات."
          },
        ],
      },
    },
    {
      id: "contact",
      title: "Contact",
      titleAr: "التواصل",
      icon: Globe2,
      color: "from-indigo-600 to-purple-700",
      content: {
        heading: "Let's Build the Future Together",
        headingAr: "لنبني المستقبل معاً",
        paragraphs: [
          { 
            text: "Mohamed Ali Abdalla Mohamed\nFounder & CEO - Infra Engine\n\nEmail: mohamed.ali.b2001@gmail.com\nEgypt: +201026363528\nSaudi Arabia: +966544803384", 
            textAr: "محمد علي عبدالله محمد\nالمؤسس والرئيس التنفيذي - Infra Engine\n\nالبريد: mohamed.ali.b2001@gmail.com\nمصر: +201026363528\nالسعودية: +966544803384"
          },
        ],
      },
    },
  ];

  const nextSection = () => setCurrentSection((prev) => (prev + 1) % sections.length);
  const prevSection = () => setCurrentSection((prev) => (prev - 1 + sections.length) % sections.length);

  const currentSectionData = sections[currentSection];
  const SectionIcon = currentSectionData.icon;

  return (
    <div className="min-h-screen bg-background overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      <section className="relative min-h-screen flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-background to-purple-950/20" />
        
        <div className="relative z-10 flex-1 flex flex-col max-w-7xl mx-auto px-4 py-8 w-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-4 py-2 border-indigo-500/50 bg-indigo-500/10">
                <BookOpen className="w-4 h-4 mr-2 text-indigo-400" />
                <span className="text-indigo-400 font-medium">
                  {isRtl ? "السرد الاستثماري" : "Investor Narrative"}
                </span>
              </Badge>
              <span className="text-muted-foreground">INFERA Group</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{currentSection + 1} / {sections.length}</Badge>
              <Button variant="outline" size="sm" className="gap-2" data-testid="button-export-pdf">
                <Download className="w-4 h-4" />
                {isRtl ? "تصدير PDF" : "Export PDF"}
              </Button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <motion.div
              key={currentSection}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-4xl"
            >
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className={`bg-gradient-to-r ${currentSectionData.color} text-white py-10`}>
                  <div className="flex items-center justify-center gap-4">
                    <div className="p-4 rounded-2xl bg-white/20">
                      <SectionIcon className="w-10 h-10" />
                    </div>
                    <CardTitle className="text-4xl font-bold">
                      {isRtl ? currentSectionData.titleAr : currentSectionData.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-10 space-y-6">
                  <h2 className="text-2xl font-bold text-center text-foreground">
                    {isRtl ? currentSectionData.content.headingAr : currentSectionData.content.heading}
                  </h2>
                  
                  <div className="space-y-6 mt-6">
                    {currentSectionData.content.paragraphs.map((para, index) => (
                      <motion.p
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.15 }}
                        className="text-lg leading-relaxed text-muted-foreground whitespace-pre-line"
                      >
                        {isRtl ? para.textAr : para.text}
                      </motion.p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="flex items-center justify-between mt-8">
            <Button variant="outline" size="lg" onClick={prevSection} className="gap-2" data-testid="button-prev-section">
              <ChevronLeft className="w-5 h-5" />
              {isRtl ? "السابق" : "Previous"}
            </Button>

            <div className="flex items-center gap-2">
              {sections.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSection(index)}
                  className={`w-3 h-3 rounded-full transition-all ${index === currentSection ? 'bg-primary scale-125' : 'bg-muted hover:bg-muted-foreground/50'}`}
                  data-testid={`button-section-${index}`}
                />
              ))}
            </div>

            <Button variant="outline" size="lg" onClick={nextSection} className="gap-2" data-testid="button-next-section">
              {isRtl ? "التالي" : "Next"}
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
