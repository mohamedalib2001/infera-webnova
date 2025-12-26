import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  Gauge, 
  Download,
  Brain,
  Shield,
  Settings,
  Zap,
  Building2,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { sovereignReadinessFramework, inferaReadinessScores, marketBenchmarks, inferaGroupScore } from "@/lib/strategic-dominance-data";

const categoryIcons: Record<string, typeof Brain> = {
  "ai-maturity": Brain,
  "security-sovereignty": Shield,
  "governance-control": Settings,
  "scalability": Zap,
  "legacy-independence": Building2,
};

function ScoreGauge({ score, label, labelAr, isRtl }: { score: number; label: string; labelAr: string; isRtl: boolean }) {
  const getScoreColor = (s: number) => {
    if (s >= 90) return "text-emerald-500";
    if (s >= 70) return "text-amber-500";
    if (s >= 50) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="text-center">
      <div className="relative w-24 h-24 mx-auto mb-2">
        <svg className="w-24 h-24 transform -rotate-90">
          <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted/20" />
          <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="none" className={getScoreColor(score)} strokeDasharray={`${score * 2.51} 251`} strokeLinecap="round" />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-2xl font-bold ${getScoreColor(score)}`}>{score}</span>
      </div>
      <p className="text-sm text-muted-foreground">{isRtl ? labelAr : label}</p>
    </div>
  );
}

export default function SovereignReadiness() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-4 py-2 border-emerald-500/50 bg-emerald-500/10">
              <Gauge className="w-4 h-4 mr-2 text-emerald-400" />
              <span className="text-emerald-400 font-medium">
                {isRtl ? sovereignReadinessFramework.titleAr : sovereignReadinessFramework.title}
              </span>
            </Badge>
          </div>
          <Button variant="outline" className="gap-2" data-testid="button-download-readiness">
            <Download className="w-4 h-4" />
            {isRtl ? "تحميل PDF" : "Download PDF"}
          </Button>
        </div>

        <section className="mb-12">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white py-10">
              <div className="text-center">
                <div className="text-7xl font-bold mb-4">{inferaGroupScore.overallScore}</div>
                <CardTitle className="text-2xl mb-2">
                  {isRtl ? "مؤشر الجاهزية السيادية لـ INFERA" : "INFERA Sovereign Readiness Index"}
                </CardTitle>
                <CardDescription className="text-white/80 max-w-2xl mx-auto">
                  {isRtl ? inferaGroupScore.statementAr : inferaGroupScore.statement}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <ScoreGauge score={inferaGroupScore.breakdown.aiMaturity} label="AI Maturity" labelAr="نضج AI" isRtl={isRtl} />
                <ScoreGauge score={inferaGroupScore.breakdown.securitySovereignty} label="Security" labelAr="الأمان" isRtl={isRtl} />
                <ScoreGauge score={inferaGroupScore.breakdown.governanceControl} label="Governance" labelAr="الحوكمة" isRtl={isRtl} />
                <ScoreGauge score={inferaGroupScore.breakdown.scalability} label="Scalability" labelAr="قابلية التوسع" isRtl={isRtl} />
                <ScoreGauge score={inferaGroupScore.breakdown.legacyIndependence} label="Independence" labelAr="الاستقلال" isRtl={isRtl} />
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-emerald-500" />
            {isRtl ? "مقارنة السوق" : "Market Comparison"}
          </h2>
          <Card>
            <CardContent className="p-6 space-y-4">
              {marketBenchmarks.scores.map((benchmark, index) => {
                const isInfera = benchmark.name.includes("INFERA");
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-48 text-sm font-medium">{isRtl ? benchmark.nameAr : benchmark.name}</div>
                    <div className="flex-1">
                      <Progress value={benchmark.score} className={isInfera ? "[&>div]:bg-emerald-500" : "[&>div]:bg-slate-400"} />
                    </div>
                    <div className={`w-12 text-right font-bold ${isInfera ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                      {benchmark.score}
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Gauge className="w-6 h-6 text-emerald-500" />
            {isRtl ? "إطار عمل الجاهزية السيادية" : "Sovereign Readiness Framework"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {sovereignReadinessFramework.categories.map((category, index) => {
              const Icon = categoryIcons[category.id] || Brain;
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-emerald-500" />
                        </div>
                        <Badge variant="secondary">{category.weight}%</Badge>
                      </div>
                      <h3 className="font-semibold mb-2">{isRtl ? category.nameAr : category.name}</h3>
                      <p className="text-xs text-muted-foreground mb-3">{isRtl ? category.descriptionAr : category.description}</p>
                      <div className="space-y-1">
                        {category.metrics.map((metric, i) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">{isRtl ? metric.metricAr : metric.metric}</span>
                            <span className="font-medium">{metric.maxScore}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            {isRtl ? "درجات منصات INFERA" : "INFERA Platform Scores"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inferaReadinessScores.map((platform, index) => (
              <motion.div
                key={platform.platformId}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover-elevate">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">{isRtl ? platform.platformNameAr : platform.platformName}</h3>
                      <div className="text-2xl font-bold text-emerald-500">{platform.overallScore}</div>
                    </div>
                    <div className="space-y-2">
                      {platform.categoryScores.map((cat) => {
                        const category = sovereignReadinessFramework.categories.find(c => c.id === cat.categoryId);
                        return (
                          <div key={cat.categoryId} className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-24 truncate">
                              {isRtl ? category?.nameAr : category?.name}
                            </span>
                            <Progress value={(cat.score / cat.maxScore) * 100} className="flex-1 h-2 [&>div]:bg-emerald-500" />
                            <span className="text-xs font-medium w-10 text-right">{cat.score}/{cat.maxScore}</span>
                          </div>
                        );
                      })}
                    </div>
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
