import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  ShoppingBag, 
  ShoppingCart,
  Store,
  TrendingUp,
  Users,
  Package,
  Search,
  Heart,
  Star,
  BarChart3,
  PieChart,
  Sparkles,
  Brain,
  Zap,
  DollarSign,
  ArrowRight,
  Eye,
  Target,
  Tag,
  Truck,
} from "lucide-react";

export default function MarketplaceLanding() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [activeProduct, setActiveProduct] = useState(0);
  const [cartPulse, setCartPulse] = useState(false);

  const products = [
    { name: isRtl ? "منتج ذكي" : "Smart Product", price: "$299", rating: 4.9, color: "bg-violet-500" },
    { name: isRtl ? "جهاز متطور" : "Advanced Device", price: "$499", rating: 4.8, color: "bg-cyan-500" },
    { name: isRtl ? "حل مبتكر" : "Innovative Solution", price: "$199", rating: 4.7, color: "bg-emerald-500" },
    { name: isRtl ? "خدمة مميزة" : "Premium Service", price: "$99", rating: 5.0, color: "bg-amber-500" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveProduct(prev => (prev + 1) % products.length);
      setCartPulse(true);
      setTimeout(() => setCartPulse(false), 500);
    }, 3000);
    return () => clearInterval(interval);
  }, [products.length]);

  const t = {
    hero: {
      badge: isRtl ? "السوق الرقمي الذكي" : "Intelligent Digital Marketplace",
      title: isRtl ? "INFERA Marketplace AI™" : "INFERA Marketplace AI™",
      subtitle: isRtl 
        ? "سوق يفهم المشتري"
        : "A Marketplace That Understands Buyers",
      description: isRtl
        ? "منصة سوق رقمي سيادي مدعومة بالذكاء الاصطناعي تعيد تعريف التجارة الإلكترونية من عرض منتجات إلى تجربة شراء ذكية متكاملة."
        : "A sovereign AI-powered digital marketplace that transforms e-commerce into an intelligent buying and selling experience.",
      cta: isRtl ? "استكشف السوق الذكي" : "Explore Smart Marketplace",
    },
    stats: [
      { label: isRtl ? "منتجات نشطة" : "Active Products", value: "125K+", icon: Package },
      { label: isRtl ? "بائعون موثوقون" : "Trusted Sellers", value: "8,400", icon: Store },
      { label: isRtl ? "معاملات يومية" : "Daily Transactions", value: "47K", icon: ShoppingCart },
      { label: isRtl ? "رضا العملاء" : "Customer Satisfaction", value: "98.5%", icon: Heart },
    ],
    sections: [
      {
        icon: Users,
        title: isRtl ? "تجربة المشتري" : "Buyer Experience",
        description: isRtl 
          ? "توصيات مخصصة مع بحث ذكي يفهم ما تبحث عنه حقاً."
          : "Personalized recommendations with smart search that understands what you really want.",
        features: [
          { icon: Sparkles, label: isRtl ? "توصيات مخصصة" : "Personalized Recommendations" },
          { icon: Search, label: isRtl ? "بحث ذكي" : "Smart Search" },
          { icon: Heart, label: isRtl ? "قوائم الرغبات" : "Wishlists" },
        ],
        color: "from-violet-600 to-purple-700",
      },
      {
        icon: Store,
        title: isRtl ? "ذكاء البائع" : "Seller Intelligence",
        description: isRtl
          ? "تحليلات مبيعات متقدمة مع مؤشرات أداء المنتجات في الوقت الفعلي."
          : "Advanced sales analytics with real-time product performance indicators.",
        features: [
          { icon: BarChart3, label: isRtl ? "تحليلات المبيعات" : "Sales Analytics" },
          { icon: TrendingUp, label: isRtl ? "أداء المنتجات" : "Product Performance" },
          { icon: Target, label: isRtl ? "رؤى السوق" : "Market Insights" },
        ],
        color: "from-cyan-600 to-blue-700",
      },
      {
        icon: Tag,
        title: isRtl ? "التسويق والعروض" : "Marketing & Promotions",
        description: isRtl
          ? "أدوات حملات متكاملة مع إدارة ذكية للعروض والخصومات."
          : "Integrated campaign tools with intelligent offers and discount management.",
        features: [
          { icon: Zap, label: isRtl ? "أدوات الحملات" : "Campaign Tools" },
          { icon: Tag, label: isRtl ? "إدارة العروض" : "Offers Management" },
          { icon: Brain, label: isRtl ? "تحسين تلقائي" : "Auto Optimization" },
        ],
        color: "from-pink-600 to-rose-700",
      },
      {
        icon: PieChart,
        title: isRtl ? "رؤى الأداء" : "Performance Insights",
        description: isRtl
          ? "لوحات إيرادات شاملة مع مؤشرات نمو وتوقعات ذكية."
          : "Comprehensive revenue dashboards with growth indicators and smart forecasts.",
        features: [
          { icon: DollarSign, label: isRtl ? "لوحات الإيرادات" : "Revenue Dashboards" },
          { icon: TrendingUp, label: isRtl ? "مؤشرات النمو" : "Growth Indicators" },
          { icon: Eye, label: isRtl ? "توقعات ذكية" : "Smart Forecasts" },
        ],
        color: "from-emerald-600 to-green-700",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/30 via-background to-pink-950/20" />
        
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[15%] right-[10%] flex items-center gap-4">
            <motion.div
              className={`p-3 rounded-full ${cartPulse ? 'bg-emerald-500 scale-110' : 'bg-muted/50'} transition-all duration-300`}
            >
              <ShoppingCart className={`w-6 h-6 ${cartPulse ? 'text-white' : 'text-muted-foreground'}`} />
            </motion.div>
            <Badge className="bg-emerald-500">{isRtl ? "تمت الإضافة" : "Added!"}</Badge>
          </div>

          <div className="absolute left-[8%] top-1/2 -translate-y-1/2 space-y-4">
            {products.map((product, index) => (
              <motion.div
                key={index}
                className={`flex items-center gap-4 p-4 rounded-xl backdrop-blur-sm border transition-all duration-500 ${
                  activeProduct === index 
                    ? 'bg-card/80 border-violet-500/50 scale-105 shadow-lg' 
                    : 'bg-card/30 border-border/30'
                }`}
                animate={{ x: activeProduct === index ? 10 : 0 }}
              >
                <div className={`w-12 h-12 rounded-lg ${product.color} flex items-center justify-center`}>
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-medium text-sm">{product.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{product.price}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs text-muted-foreground">{product.rating}</span>
                    </div>
                  </div>
                </div>
                {activeProduct === index && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto"
                  >
                    <Sparkles className="w-5 h-5 text-violet-400" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="absolute right-[8%] bottom-[20%] w-48 h-24 rounded-xl bg-card/30 backdrop-blur-sm border border-border/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{isRtl ? "المبيعات اليوم" : "Sales Today"}</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400">$47,892</p>
            <p className="text-xs text-emerald-400">+23.5%</p>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
          <div className="text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge 
                variant="outline" 
                className="px-6 py-2.5 text-sm border-violet-500/50 bg-violet-500/10 backdrop-blur-sm"
              >
                <ShoppingBag className="w-4 h-4 mr-2 text-violet-400" />
                <span className="text-violet-400 font-medium">{t.hero.badge}</span>
              </Badge>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-4"
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-none">
                <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  {t.hero.title}
                </span>
              </h1>
              <p className="text-2xl md:text-3xl lg:text-4xl font-light text-muted-foreground">
                {t.hero.subtitle}
              </p>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed"
            >
              {t.hero.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Button 
                size="lg"
                className="gap-3 px-10 py-7 text-lg bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 shadow-lg shadow-violet-500/25"
                onClick={() => setLocation("/sovereign-workspace")}
                data-testid="button-start-marketplace"
              >
                <ShoppingBag className="w-5 h-5" />
                {t.hero.cta}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto"
          >
            {t.stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={i}
                  className="relative p-4 rounded-xl bg-card/30 backdrop-blur-sm border border-border/50 text-center"
                >
                  <Icon className="w-6 h-6 mx-auto mb-2 text-violet-400" />
                  <p className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {isRtl ? "قدرات السوق الذكي" : "Smart Marketplace Capabilities"}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {t.sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <Card 
                  key={index}
                  className="group hover-elevate border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
                >
                  <CardHeader className={`bg-gradient-to-r ${section.color} text-white`}>
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-white/20">
                        <Icon className="w-7 h-7" />
                      </div>
                      <CardTitle className="text-xl">{section.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <p className="text-muted-foreground">{section.description}</p>
                    <div className="flex flex-wrap gap-3">
                      {section.features.map((feature, fi) => {
                        const FeatureIcon = feature.icon;
                        return (
                          <div 
                            key={fi}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50"
                          >
                            <FeatureIcon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{feature.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-r from-violet-600 via-pink-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzIiBjeT0iMyIgcj0iMyIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="relative max-w-4xl mx-auto px-4 text-center text-white">
          <ShoppingBag className="w-16 h-16 mx-auto mb-6 opacity-80" />
          <p className="text-2xl md:text-3xl font-bold mb-4">
            {isRtl ? "التجارة هنا لا تُعرض... بل تُدار بذكاء" : "Commerce isn't displayed here... it's intelligently managed"}
          </p>
          <Button 
            size="lg"
            variant="secondary"
            className="gap-3 px-10 py-8 text-xl shadow-2xl mt-8"
            onClick={() => setLocation("/sovereign-workspace")}
            data-testid="button-final-marketplace-cta"
          >
            <Store className="w-6 h-6" />
            {t.hero.cta}
          </Button>
        </div>
      </section>
    </div>
  );
}
