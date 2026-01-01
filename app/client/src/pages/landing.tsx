import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { 
  Sparkles, 
  Shield, 
  Zap, 
  Globe, 
  Brain, 
  Rocket,
  Building2,
  HeartPulse,
  Landmark,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  Play,
  Star,
  Lock,
  Server,
  Code,
  Cpu,
  Activity,
  ChevronRight,
} from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();

  const t = {
    hero: {
      badge: language === "ar" ? "نظام التشغيل الذكي للمنصات الرقمية" : "Intelligent OS for Digital Platforms",
      title: language === "ar" 
        ? "ابنِ منصات رقمية سيادية بقوة الذكاء الاصطناعي"
        : "Build Sovereign Digital Platforms with AI Power",
      subtitle: language === "ar"
        ? "حوّل أفكارك إلى منصات رقمية كاملة في دقائق. الذكاء الاصطناعي يكتب الكود، يصمم الواجهات، ويدير البنية التحتية تلقائياً."
        : "Transform your ideas into complete digital platforms in minutes. AI writes code, designs interfaces, and manages infrastructure automatically.",
      cta: language === "ar" ? "ابدأ مجاناً" : "Start Free",
      ctaSecondary: language === "ar" ? "شاهد العرض" : "Watch Demo",
    },
    stats: [
      { value: "10x", label: language === "ar" ? "أسرع في التطوير" : "Faster Development" },
      { value: "99.9%", label: language === "ar" ? "وقت التشغيل" : "Uptime Guarantee" },
      { value: "50+", label: language === "ar" ? "قالب جاهز" : "Ready Templates" },
      { value: "24/7", label: language === "ar" ? "دعم متواصل" : "Support" },
    ],
    aiShowcase: {
      title: language === "ar" ? "شاهد قوة الذكاء الاصطناعي" : "Experience AI Power",
      subtitle: language === "ar" 
        ? "اكتب ما تريد، واترك الباقي للذكاء الاصطناعي"
        : "Describe what you want, let AI handle the rest",
      demo: language === "ar" 
        ? "أريد منصة تجارة إلكترونية مع نظام دفع وإدارة مخزون..."
        : "I want an e-commerce platform with payment system and inventory management...",
    },
    features: [
      {
        icon: Brain,
        title: language === "ar" ? "ذكاء اصطناعي متقدم" : "Advanced AI Engine",
        description: language === "ar" 
          ? "Claude Sonnet 4 يفهم متطلباتك ويحولها لكود احترافي"
          : "Claude Sonnet 4 understands your requirements and transforms them into professional code",
        color: "from-violet-500 to-purple-600",
      },
      {
        icon: Rocket,
        title: language === "ar" ? "نشر بنقرة واحدة" : "One-Click Deploy",
        description: language === "ar"
          ? "انشر تطبيقك على السحابة فوراً مع SSL و CDN تلقائياً"
          : "Deploy your app to the cloud instantly with automatic SSL and CDN",
        color: "from-cyan-500 to-blue-600",
      },
      {
        icon: Shield,
        title: language === "ar" ? "أمان مؤسسي" : "Enterprise Security",
        description: language === "ar"
          ? "تشفير كامل، مصادقة ثنائية، وامتثال للمعايير الدولية"
          : "Full encryption, 2FA authentication, and international compliance",
        color: "from-emerald-500 to-green-600",
      },
      {
        icon: Globe,
        title: language === "ar" ? "سيادة البيانات" : "Data Sovereignty",
        description: language === "ar"
          ? "تحكم كامل في بياناتك مع خيارات استضافة متعددة"
          : "Complete control over your data with multiple hosting options",
        color: "from-amber-500 to-orange-600",
      },
    ],
    domains: [
      { 
        icon: Building2, 
        title: language === "ar" ? "منصة خدمات مالية" : "Financial Services",
        compliance: "PCI-DSS",
        color: "from-emerald-500 to-teal-500",
      },
      { 
        icon: HeartPulse, 
        title: language === "ar" ? "نظام رعاية صحية" : "Healthcare System",
        compliance: "HIPAA",
        color: "from-rose-500 to-pink-500",
      },
      { 
        icon: Landmark, 
        title: language === "ar" ? "بوابة حكومية" : "Government Portal",
        compliance: "WCAG 2.1",
        color: "from-blue-500 to-indigo-500",
      },
      { 
        icon: GraduationCap, 
        title: language === "ar" ? "منصة تعليمية" : "Education Platform",
        compliance: "FERPA",
        color: "from-amber-500 to-orange-500",
      },
    ],
    testimonials: [
      {
        text: language === "ar" 
          ? "وفرت علينا 6 أشهر من التطوير. منصتنا جاهزة بالكامل في أسبوع واحد!"
          : "Saved us 6 months of development. Our platform was ready in just one week!",
        author: language === "ar" ? "أحمد المالكي" : "Ahmed Al-Malki",
        role: language === "ar" ? "مؤسس شركة تقنية" : "Tech Startup Founder",
      },
      {
        text: language === "ar"
          ? "الذكاء الاصطناعي يفهم ما نريده تماماً. النتائج تفوق التوقعات."
          : "The AI understands exactly what we need. Results exceed expectations.",
        author: language === "ar" ? "سارة العتيبي" : "Sara Al-Otaibi",
        role: language === "ar" ? "مديرة منتجات" : "Product Manager",
      },
      {
        text: language === "ar"
          ? "أفضل منصة لبناء التطبيقات. الأمان والسرعة لا مثيل لهما."
          : "Best platform for building apps. Security and speed are unmatched.",
        author: language === "ar" ? "خالد الراشد" : "Khaled Al-Rashid",
        role: language === "ar" ? "مهندس برمجيات" : "Software Engineer",
      },
    ],
    pricing: {
      title: language === "ar" ? "ابدأ مجاناً، ادفع عند النمو" : "Start Free, Pay as You Grow",
      subtitle: language === "ar" 
        ? "تجربة مجانية لمدة 14 يوماً بدون بطاقة ائتمان"
        : "14-day free trial, no credit card required",
    },
    cta: {
      title: language === "ar" ? "جاهز لبناء منصتك الرقمية؟" : "Ready to Build Your Digital Platform?",
      subtitle: language === "ar"
        ? "انضم لآلاف المطورين الذين يبنون المستقبل مع INFERA WebNova"
        : "Join thousands of developers building the future with INFERA WebNova",
      button: language === "ar" ? "ابدأ الآن مجاناً" : "Start Now for Free",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-500/10" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 pt-20 pb-32">
          <div className="text-center space-y-8">
            <Badge variant="outline" className="px-4 py-2 text-sm border-violet-300 dark:border-violet-700 bg-violet-500/10">
              <Sparkles className="w-4 h-4 mr-2 text-violet-500" />
              {t.hero.badge}
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-5xl mx-auto leading-tight">
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                {t.hero.title}
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t.hero.subtitle}
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Button 
                size="lg" 
                className="gap-2 px-8 py-6 text-lg bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700"
                onClick={() => setLocation("/auth")}
                data-testid="button-start-free"
              >
                {t.hero.cta}
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="gap-2 px-8 py-6 text-lg backdrop-blur-sm"
                onClick={() => setLocation("/pricing")}
                data-testid="button-watch-demo"
              >
                <Play className="w-5 h-5" />
                {t.hero.ctaSecondary}
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto">
            {t.stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Showcase Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.aiShowcase.title}</h2>
            <p className="text-xl text-muted-foreground">{t.aiShowcase.subtitle}</p>
          </div>
          
          <div className="relative max-w-4xl mx-auto">
            <Card className="backdrop-blur-xl bg-card/80 border-violet-500/20 overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-violet-600/10 to-cyan-600/10 p-6 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium">INFERA AI Assistant</span>
                    <Badge variant="secondary" className="ml-auto">Claude Sonnet 4</Badge>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <span className="text-sm font-medium">U</span>
                    </div>
                    <div className="bg-muted rounded-2xl px-4 py-3 max-w-lg">
                      <p className="text-sm">{t.aiShowcase.demo}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{language === "ar" ? "تحليل المتطلبات..." : "Analyzing requirements..."}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{language === "ar" ? "إنشاء قاعدة البيانات..." : "Creating database schema..."}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{language === "ar" ? "بناء واجهة المستخدم..." : "Building user interface..."}</span>
                      </div>
                      <div className="flex items-center gap-2 text-violet-500">
                        <Activity className="w-4 h-4 animate-pulse" />
                        <span className="text-sm">{language === "ar" ? "تطبيق نظام الدفع..." : "Implementing payment system..."}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-violet-500/30 to-cyan-500/30 rounded-full blur-2xl" />
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-violet-500/20 rounded-full blur-2xl" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {language === "ar" ? "كل ما تحتاجه لبناء المنصات" : "Everything You Need to Build Platforms"}
            </h2>
            <p className="text-xl text-muted-foreground">
              {language === "ar" ? "أدوات متكاملة لتحويل أفكارك إلى واقع" : "Integrated tools to turn your ideas into reality"}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <Card key={i} className="group hover-elevate border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-6 space-y-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sovereign Domains */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {language === "ar" ? "منصات لجميع القطاعات" : "Platforms for Every Sector"}
            </h2>
            <p className="text-xl text-muted-foreground">
              {language === "ar" ? "متوافق مع المعايير الدولية للأمان والخصوصية" : "Compliant with international security and privacy standards"}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.domains.map((domain, i) => {
              const Icon = domain.icon;
              return (
                <Card 
                  key={i} 
                  className="group hover-elevate cursor-pointer border-border/50 bg-card/50 backdrop-blur-sm"
                  onClick={() => setLocation("/auth")}
                >
                  <CardContent className="p-6 text-center space-y-4">
                    <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${domain.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold">{domain.title}</h3>
                    <Badge variant="secondary" className="text-xs">
                      <Lock className="w-3 h-3 mr-1" />
                      {domain.compliance}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {language === "ar" ? "ماذا يقول عملاؤنا" : "What Our Customers Say"}
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {t.testimonials.map((testimonial, i) => (
              <Card key={i} className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic">"{testimonial.text}"</p>
                  <div className="flex items-center gap-3 pt-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                      {testimonial.author[0]}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{testimonial.author}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-violet-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzIiBjeT0iMyIgcj0iMyIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t.cta.title}</h2>
          <p className="text-xl text-white/80 mb-8">{t.cta.subtitle}</p>
          <Button 
            size="lg" 
            variant="secondary"
            className="gap-2 px-8 py-6 text-lg"
            onClick={() => setLocation("/auth")}
            data-testid="button-cta-final"
          >
            {t.cta.button}
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold">INFERA</span>
                <span className="text-muted-foreground ml-1">WebNova</span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} INFERA Engine. {language === "ar" ? "جميع الحقوق محفوظة" : "All rights reserved"}.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
