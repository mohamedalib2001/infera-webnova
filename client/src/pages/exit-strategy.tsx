import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Download,
  Building2,
  Shield,
  Globe,
  Crown,
  Clock,
  DollarSign,
  Target,
  Zap,
} from "lucide-react";
import { exitPaths, exitPositioning } from "@/lib/strategic-adoption-data";

const categoryIcons: Record<string, typeof Building2> = {
  "Strategic Acquisition": Building2,
  "Government or Sovereign Acquisition": Shield,
  "Long-Term Independent Platform": Crown,
};

export default function ExitStrategy() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-4 py-2 border-violet-500/50 bg-violet-500/10">
              <TrendingUp className="w-4 h-4 mr-2 text-violet-400" />
              <span className="text-violet-400 font-medium">
                {isRtl ? "سرد استراتيجية الخروج" : "Exit Strategy Narrative"}
              </span>
            </Badge>
          </div>
          <Button variant="outline" className="gap-2" data-testid="button-download-exit">
            <Download className="w-4 h-4" />
            {isRtl ? "تحميل PDF" : "Download PDF"}
          </Button>
        </div>

        <section className="mb-10">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-violet-600 to-purple-700 text-white py-10">
              <div className="text-center">
                <CardTitle className="text-3xl font-bold mb-4">
                  {isRtl ? exitPositioning.headlineAr : exitPositioning.headline}
                </CardTitle>
                <CardDescription className="text-white/80 max-w-2xl mx-auto text-lg">
                  {isRtl 
                    ? "INFERA مصممة لتصبح استحواذاً استراتيجياً حتمياً أو أصلاً سيادياً طويل المدى."
                    : "INFERA is designed to become an inevitable strategic acquisition or long-term sovereign asset."}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {exitPositioning.keyPoints.map((point, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full bg-violet-500/5 border-violet-500/20">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-violet-700 dark:text-violet-400 mb-2">
                          {isRtl ? point.pointAr : point.point}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {isRtl ? point.explanationAr : point.explanation}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="space-y-6">
          {exitPaths.map((path, index) => {
            const Icon = categoryIcons[path.category] || Building2;
            return (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader className="bg-slate-100 dark:bg-slate-800/50 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-violet-500" />
                        </div>
                        <div>
                          <Badge variant="secondary" className="mb-1">
                            {isRtl ? path.categoryAr : path.category}
                          </Badge>
                          <CardTitle className="text-lg">
                            {isRtl ? path.titleAr : path.title}
                          </CardTitle>
                        </div>
                      </div>
                      <Badge className="bg-emerald-500 text-white text-lg px-4 py-2">
                        {path.valuationMultiple}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <p className="text-muted-foreground">
                      {isRtl ? path.descriptionAr : path.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-emerald-600" />
                          <h4 className="font-medium text-emerald-700 dark:text-emerald-400">
                            {isRtl ? "لماذا INFERA جذابة" : "Why INFERA is Attractive"}
                          </h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {isRtl ? path.whyAttractiveAr : path.whyAttractive}
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-4 h-4 text-blue-600" />
                          <h4 className="font-medium text-blue-700 dark:text-blue-400">
                            {isRtl ? "لماذا لا يمكن تكرارها" : "Why It Cannot Be Replicated"}
                          </h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {isRtl ? path.whyUnreplicableAr : path.whyUnreplicable}
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4 text-amber-600" />
                          <h4 className="font-medium text-amber-700 dark:text-amber-400">
                            {isRtl ? "الأصل الفريد المكتسب" : "Unique Asset Gained"}
                          </h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {isRtl ? path.uniqueAssetAr : path.uniqueAsset}
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-red-600" />
                          <h4 className="font-medium text-red-700 dark:text-red-400">
                            {isRtl ? "لماذا التوقيت مهم" : "Why Timing Matters"}
                          </h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {isRtl ? path.timingImportanceAr : path.timingImportance}
                        </p>
                      </div>
                    </div>

                    {path.potentialAcquirers.length > 0 && (
                      <div className="pt-4 border-t">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          {isRtl ? "المستحوذون المحتملون" : "Potential Acquirers"}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {path.potentialAcquirers.map((acquirer, i) => (
                            <Badge key={i} variant="outline">{acquirer}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
