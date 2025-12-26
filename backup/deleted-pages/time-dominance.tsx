import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  Clock, 
  Download,
  Lock,
  TrendingUp,
  Shield,
  Brain,
  Crown,
  Target,
  AlertTriangle,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { timeHorizons, timeDominanceNarrative } from "@/lib/time-dominance-data";

export default function TimeDominance() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Badge variant="outline" className="px-4 py-2 border-purple-500/50 bg-purple-500/10">
            <Clock className="w-4 h-4 mr-2 text-purple-400" />
            <span className="text-purple-400 font-medium">
              {isRtl ? "طبقة السيطرة على الزمن™" : "Time Dominance Layer™"}
            </span>
          </Badge>
          <Button variant="outline" className="gap-2" data-testid="button-download-time">
            <Download className="w-4 h-4" />
            {isRtl ? "تحميل PDF" : "Download PDF"}
          </Button>
        </div>

        <section className="mb-10">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-violet-800 text-white py-10">
              <div className="text-center">
                <CardTitle className="text-3xl font-bold mb-4">
                  {isRtl ? timeDominanceNarrative.titleAr : timeDominanceNarrative.title}
                </CardTitle>
                <CardDescription className="text-white/90 max-w-3xl mx-auto text-lg leading-relaxed">
                  {isRtl ? timeDominanceNarrative.executiveSummary.ar : timeDominanceNarrative.executiveSummary.en}
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Zap className="w-6 h-6 text-purple-500" />
            {isRtl ? "رؤى رئيسية" : "Key Insights"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {timeDominanceNarrative.keyInsights.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full bg-gradient-to-br from-purple-500/5 to-violet-500/5 border-purple-500/20">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg text-purple-700 dark:text-purple-400 mb-3">
                      {isRtl ? item.insightAr : item.insight}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isRtl ? item.explanationAr : item.explanation}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Clock className="w-6 h-6 text-purple-500" />
            {isRtl ? "آفاق الزمن" : "Time Horizons"}
          </h2>
          <div className="space-y-8">
            {timeHorizons.map((horizon, hIndex) => (
              <motion.div
                key={horizon.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: hIndex * 0.2 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-purple-500/20 flex items-center justify-center">
                        <Clock className="w-8 h-8 text-purple-400" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">{isRtl ? horizon.nameAr : horizon.name}</CardTitle>
                        <CardDescription className="text-purple-300 text-lg">
                          {isRtl ? horizon.periodAr : horizon.period}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <Card className="bg-emerald-500/5 border-emerald-500/20">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <Crown className="w-5 h-5 text-emerald-600" />
                            <CardTitle className="text-base text-emerald-700 dark:text-emerald-400">
                              {isRtl ? "الموقع الهيكلي" : "Structural Position"}
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                              {isRtl ? "ما تتحكم به INFERA" : "What INFERA Controls"}
                            </h5>
                            <ul className="space-y-1">
                              {(isRtl ? horizon.structuralPosition.whatControlsAr : horizon.structuralPosition.whatControls).map((c, i) => (
                                <li key={i} className="text-xs flex items-start gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                                  <span>{c}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                              {isRtl ? "الطبقات التي لا رجعة عنها" : "Irreversible Layers"}
                            </h5>
                            <ul className="space-y-1">
                              {(isRtl ? horizon.structuralPosition.irreversibleLayersAr : horizon.structuralPosition.irreversibleLayers).map((l, i) => (
                                <li key={i} className="text-xs flex items-start gap-1">
                                  <Lock className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                                  <span>{l}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-amber-500/5 border-amber-500/20">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-amber-600" />
                            <CardTitle className="text-base text-amber-700 dark:text-amber-400">
                              {isRtl ? "إنشاء فجوة السوق" : "Market Gap Creation"}
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                              {isRtl ? "ما يحاول المنافسون بناءه" : "What Competitors Are Trying"}
                            </h5>
                            <ul className="space-y-1">
                              {(isRtl ? horizon.marketGapCreation.competitorsTryingAr : horizon.marketGapCreation.competitorsTrying).map((c, i) => (
                                <li key={i} className="text-xs flex items-start gap-1">
                                  <AlertTriangle className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                                  <span>{c}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="p-2 rounded bg-amber-500/10">
                            <h5 className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
                              {isRtl ? "لماذا هم متأخرون هيكلياً" : "Why Structurally Late"}
                            </h5>
                            <p className="text-xs text-muted-foreground">
                              {isRtl ? horizon.marketGapCreation.whyStructurallyLateAr : horizon.marketGapCreation.whyStructurallyLate}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-purple-500/5 border-purple-500/20">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-purple-600" />
                            <CardTitle className="text-base text-purple-700 dark:text-purple-400">
                              {isRtl ? "الميزة التي لا رجعة عنها" : "Irreversible Advantage"}
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="p-2 rounded bg-purple-500/10">
                            <div className="flex items-center gap-1 mb-1">
                              <Lock className="w-3 h-3 text-purple-500" />
                              <span className="text-xs font-semibold">{isRtl ? "قفل الحوكمة" : "Governance Lock-In"}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{isRtl ? horizon.irreversibleAdvantage.governanceLockInAr : horizon.irreversibleAdvantage.governanceLockIn}</p>
                          </div>
                          <div className="p-2 rounded bg-purple-500/10">
                            <div className="flex items-center gap-1 mb-1">
                              <TrendingUp className="w-3 h-3 text-purple-500" />
                              <span className="text-xs font-semibold">{isRtl ? "تراكم البيانات" : "Data Compounding"}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{isRtl ? horizon.irreversibleAdvantage.dataCompoundingAr : horizon.irreversibleAdvantage.dataCompounding}</p>
                          </div>
                          <div className="p-2 rounded bg-purple-500/10">
                            <div className="flex items-center gap-1 mb-1">
                              <Brain className="w-3 h-3 text-purple-500" />
                              <span className="text-xs font-semibold">{isRtl ? "عدم تماثل تعلم AI" : "AI Learning Asymmetry"}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{isRtl ? horizon.irreversibleAdvantage.aiLearningAsymmetryAr : horizon.irreversibleAdvantage.aiLearningAsymmetry}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <section>
          <Card className="overflow-hidden">
            <CardContent className="p-8 bg-gradient-to-r from-purple-500/10 to-violet-500/10">
              <p className="text-lg text-center font-medium max-w-3xl mx-auto">
                {isRtl ? timeDominanceNarrative.conclusion.ar : timeDominanceNarrative.conclusion.en}
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
