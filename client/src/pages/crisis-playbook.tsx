import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  ShieldAlert, 
  Download,
  TrendingDown,
  Scale,
  Shield,
  UserMinus,
  Globe,
  AlertTriangle,
  Zap,
  TrendingUp,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { crisisScenarios, crisisReadinessSummary } from "@/lib/crisis-playbook-data";

const scenarioIcons: Record<string, typeof Shield> = {
  "TrendingDown": TrendingDown,
  "Scale": Scale,
  "Shield": Shield,
  "UserMinus": UserMinus,
  "Globe": Globe,
};

export default function CrisisPlaybook() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Badge variant="outline" className="px-4 py-2 border-rose-500/50 bg-rose-500/10">
            <ShieldAlert className="w-4 h-4 mr-2 text-rose-400" />
            <span className="text-rose-400 font-medium">
              {isRtl ? "دليل سيناريوهات الأزمات™" : "Crisis Scenarios Playbook™"}
            </span>
          </Badge>
          <Button variant="outline" className="gap-2" data-testid="button-download-crisis">
            <Download className="w-4 h-4" />
            {isRtl ? "تحميل PDF" : "Download PDF"}
          </Button>
        </div>

        <section className="mb-10">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-rose-600 to-red-800 text-white py-10">
              <div className="text-center">
                <CardTitle className="text-3xl font-bold mb-4">
                  {isRtl ? crisisReadinessSummary.titleAr : crisisReadinessSummary.title}
                </CardTitle>
                <CardDescription className="text-white/90 max-w-3xl mx-auto text-lg leading-relaxed">
                  {isRtl ? crisisReadinessSummary.principle.ar : crisisReadinessSummary.principle.en}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {crisisReadinessSummary.keyAssurances.map((assurance, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full bg-rose-500/5 border-rose-500/20">
                      <CardContent className="p-4">
                        <Badge className="mb-3">{isRtl ? assurance.audienceAr : assurance.audience}</Badge>
                        <p className="text-sm text-muted-foreground">
                          {isRtl ? assurance.assuranceAr : assurance.assurance}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-8">
          {crisisScenarios.map((scenario, sIndex) => {
            const Icon = scenarioIcons[scenario.icon] || Shield;
            return (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: sIndex * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader className="bg-slate-800 text-white py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-rose-500/20 flex items-center justify-center">
                        <Icon className="w-7 h-7 text-rose-400" />
                      </div>
                      <div>
                        <Badge variant="secondary" className="mb-1">
                          {isRtl ? `السيناريو ${sIndex + 1}` : `Scenario ${sIndex + 1}`}
                        </Badge>
                        <CardTitle className="text-xl">{isRtl ? scenario.nameAr : scenario.name}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <Card className="bg-red-500/5 border-red-500/20">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            <CardTitle className="text-base text-red-700 dark:text-red-400">
                              {isRtl ? "الصدمة الأولية" : "Initial Shock"}
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                              {isRtl ? "ما يفشل في السوق" : "What Fails in Market"}
                            </h5>
                            <ul className="space-y-1">
                              {(isRtl ? scenario.initialShock.marketFailuresAr : scenario.initialShock.marketFailures).map((f, i) => (
                                <li key={i} className="text-xs flex items-start gap-1">
                                  <XCircle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                                  <span>{f}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                              {isRtl ? "ما ينكسر للمنافسين" : "What Breaks for Competitors"}
                            </h5>
                            <ul className="space-y-1">
                              {(isRtl ? scenario.initialShock.competitorBreaksAr : scenario.initialShock.competitorBreaks).map((b, i) => (
                                <li key={i} className="text-xs flex items-start gap-1">
                                  <XCircle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                                  <span>{b}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-blue-500/5 border-blue-500/20">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-blue-600" />
                            <CardTitle className="text-base text-blue-700 dark:text-blue-400">
                              {isRtl ? "استجابة INFERA" : "INFERA Response"}
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                              {isRtl ? "الطبقات المُفعلة" : "Activated Layers"}
                            </h5>
                            <ul className="space-y-1">
                              {(isRtl ? scenario.inferaResponse.activatedLayersAr : scenario.inferaResponse.activatedLayers).map((l, i) => (
                                <li key={i} className="text-xs flex items-start gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                                  <span>{l}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="p-2 rounded bg-blue-500/10 text-xs">
                            <span className="font-semibold">{isRtl ? "تكيف الحوكمة:" : "Governance:"}</span>{" "}
                            {isRtl ? scenario.inferaResponse.governanceAdaptationAr : scenario.inferaResponse.governanceAdaptation}
                          </div>
                          <div className="p-2 rounded bg-blue-500/10 text-xs">
                            <span className="font-semibold">{isRtl ? "تكيف AI:" : "AI Adaptation:"}</span>{" "}
                            {isRtl ? scenario.inferaResponse.aiAdaptationAr : scenario.inferaResponse.aiAdaptation}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-emerald-500/5 border-emerald-500/20">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                            <CardTitle className="text-base text-emerald-700 dark:text-emerald-400">
                              {isRtl ? "التحويل الاستراتيجي" : "Strategic Conversion"}
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="p-2 rounded bg-emerald-500/10 text-xs">
                            <span className="font-semibold">{isRtl ? "الأزمة تصبح رافعة:" : "Crisis to Leverage:"}</span>{" "}
                            {isRtl ? scenario.strategicConversion.crisisToLeverageAr : scenario.strategicConversion.crisisToLeverage}
                          </div>
                          <div>
                            <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                              {isRtl ? "ما تكسبه INFERA" : "INFERA Gains"}
                            </h5>
                            <ul className="space-y-1">
                              {(isRtl ? scenario.strategicConversion.inferaGainsAr : scenario.strategicConversion.inferaGains).map((g, i) => (
                                <li key={i} className="text-xs flex items-start gap-1">
                                  <TrendingUp className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                                  <span>{g}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                              {isRtl ? "ضعف المنافسين" : "Competitor Weakening"}
                            </h5>
                            <ul className="space-y-1">
                              {(isRtl ? scenario.strategicConversion.competitorWeakeningAr : scenario.strategicConversion.competitorWeakening).slice(0, 2).map((w, i) => (
                                <li key={i} className="text-xs flex items-start gap-1">
                                  <XCircle className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                                  <span>{w}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </section>
      </div>
    </div>
  );
}
