import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  DollarSign, 
  Download,
  TrendingUp,
  Layers,
  CircleDollarSign,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { revenueStreams, valueCompounding, pricingPhilosophy } from "@/lib/sovereign-completion-data";

export default function EconomicEngine() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Badge variant="outline" className="px-4 py-2 border-emerald-500/50 bg-emerald-500/10">
            <DollarSign className="w-4 h-4 mr-2 text-emerald-400" />
            <span className="text-emerald-400 font-medium">
              {isRtl ? "نموذج المحرك الاقتصادي" : "Economic Engine Model"}
            </span>
          </Badge>
          <Button variant="outline" className="gap-2" data-testid="button-download-economic">
            <Download className="w-4 h-4" />
            {isRtl ? "تحميل PDF" : "Download PDF"}
          </Button>
        </div>

        <section className="mb-10">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white py-10">
              <div className="text-center">
                <CardTitle className="text-3xl font-bold mb-4">
                  {isRtl ? "كيف تولد INFERA وتضاعف وتحمي القيمة" : "How INFERA Generates, Compounds, and Protects Value"}
                </CardTitle>
                <CardDescription className="text-white/80 max-w-2xl mx-auto text-lg">
                  {isRtl 
                    ? "بدون تقليل السيادة"
                    : "Without Reducing Sovereignty"}
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <CircleDollarSign className="w-6 h-6 text-emerald-500" />
            {isRtl ? "مصادر الإيرادات الأساسية" : "Core Revenue Streams"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {revenueStreams.map((stream, index) => (
              <motion.div
                key={stream.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover-elevate">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{isRtl ? stream.nameAr : stream.name}</CardTitle>
                    <CardDescription>{isRtl ? stream.descriptionAr : stream.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                        {isRtl ? "محركات القيمة" : "Value Drivers"}
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {(isRtl ? stream.valueDriversAr : stream.valueDrivers).map((d, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{d}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-emerald-600">{isRtl ? "نموذج الإيرادات:" : "Revenue Model:"}</span>{" "}
                        {isRtl ? stream.revenueModelAr : stream.revenueModel}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-emerald-500" />
            {isRtl ? valueCompounding.titleAr : valueCompounding.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {valueCompounding.principles.map((p, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border-emerald-500/20">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                      <ArrowUpRight className="w-6 h-6 text-emerald-500" />
                    </div>
                    <h3 className="font-semibold text-lg mb-3">{isRtl ? p.principleAr : p.principle}</h3>
                    <p className="text-sm text-muted-foreground">{isRtl ? p.explanationAr : p.explanation}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-emerald-500" />
            {isRtl ? pricingPhilosophy.titleAr : pricingPhilosophy.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pricingPhilosophy.principles.map((p, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-3 text-emerald-700 dark:text-emerald-400">
                      {isRtl ? p.nameAr : p.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{isRtl ? p.descriptionAr : p.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
