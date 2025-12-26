import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  Target, 
  Download,
  ChevronRight,
  Shield,
  Brain,
  Lock,
  Zap,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Building2,
} from "lucide-react";
import { competitiveKillMaps, groupKillMap } from "@/lib/strategic-dominance-data";

export default function CompetitiveKillMap() {
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>("webnova");

  const selectedKillMap = competitiveKillMaps.find(k => k.platformId === selectedPlatform);

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-4 py-2 border-red-500/50 bg-red-500/10">
              <Target className="w-4 h-4 mr-2 text-red-400" />
              <span className="text-red-400 font-medium">
                {isRtl ? "خريطة القضاء على المنافسين" : "Competitive Kill Map"}
              </span>
            </Badge>
          </div>
          <Button variant="outline" className="gap-2" data-testid="button-download-killmap">
            <Download className="w-4 h-4" />
            {isRtl ? "تحميل PDF" : "Download PDF"}
          </Button>
        </div>

        <section className="mb-12">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-red-600 to-orange-700 text-white py-8">
              <div className="text-center">
                <CardTitle className="text-3xl font-bold mb-2">
                  {isRtl ? groupKillMap.headlineAr : groupKillMap.headline}
                </CardTitle>
                <CardDescription className="text-white/80">
                  {isRtl ? "التفوق الهيكلي على كل منافس" : "Structural Superiority Over Every Competitor"}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupKillMap.keyDifferentiators.map((diff, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full bg-red-500/5 border-red-500/20">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-red-700 dark:text-red-400 mb-2">
                          {isRtl ? diff.differentiatorAr : diff.differentiator}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {isRtl ? diff.explanationAr : diff.explanation}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-semibold mb-4">
              {isRtl ? "اختر منصة" : "Select Platform"}
            </h2>
            <div className="space-y-2">
              {competitiveKillMaps.map((killMap) => {
                const isSelected = selectedPlatform === killMap.platformId;
                return (
                  <button
                    key={killMap.platformId}
                    onClick={() => setSelectedPlatform(killMap.platformId)}
                    className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                      isSelected 
                        ? 'bg-red-500/10 border-2 border-red-500' 
                        : 'bg-muted/30 hover:bg-muted/50 border-2 border-transparent'
                    }`}
                    data-testid={`button-select-${killMap.platformId}`}
                  >
                    <Target className={`w-5 h-5 ${isSelected ? 'text-red-500' : 'text-muted-foreground'}`} />
                    <span className={`text-sm ${isSelected ? 'font-medium text-red-500' : 'text-muted-foreground'}`}>
                      {isRtl ? killMap.platformNameAr : killMap.platformName}
                    </span>
                    {isSelected && <ChevronRight className="w-4 h-4 text-red-500 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-3">
            {selectedKillMap ? (
              <motion.div
                key={selectedKillMap.platformId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <Card className="bg-emerald-500/5 border-emerald-500/20">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      {isRtl ? "بيان التفوق" : "Superiority Statement"}
                    </h3>
                    <p className="text-muted-foreground">
                      {isRtl ? selectedKillMap.superiorityStatementAr : selectedKillMap.superiorityStatement}
                    </p>
                  </CardContent>
                </Card>

                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  {isRtl ? "تحليل المنافسين" : "Competitor Analysis"}
                </h3>

                <div className="space-y-4">
                  {selectedKillMap.competitors.map((competitor, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden">
                        <CardHeader className="bg-slate-100 dark:bg-slate-800/50 py-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">{competitor.name}</CardTitle>
                              <CardDescription>{isRtl ? competitor.categoryAr : competitor.category}</CardDescription>
                            </div>
                            <Badge variant="destructive">{isRtl ? "لا يستطيع التطور" : "Cannot Evolve"}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3 rounded-lg bg-red-500/5">
                              <div className="flex items-center gap-2 mb-2">
                                <Building2 className="w-4 h-4 text-red-500" />
                                <span className="text-sm font-medium text-red-700 dark:text-red-400">
                                  {isRtl ? "ضعف المعمارية" : "Architectural Weakness"}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {isRtl ? competitor.architecturalWeaknessAr : competitor.architecturalWeakness}
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-red-500/5">
                              <div className="flex items-center gap-2 mb-2">
                                <Shield className="w-4 h-4 text-red-500" />
                                <span className="text-sm font-medium text-red-700 dark:text-red-400">
                                  {isRtl ? "فجوة الحوكمة" : "Governance Gap"}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {isRtl ? competitor.governanceGapAr : competitor.governanceGap}
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-red-500/5">
                              <div className="flex items-center gap-2 mb-2">
                                <Brain className="w-4 h-4 text-red-500" />
                                <span className="text-sm font-medium text-red-700 dark:text-red-400">
                                  {isRtl ? "قيود AI" : "AI Limitation"}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {isRtl ? competitor.aiLimitationAr : competitor.aiLimitation}
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-red-500/5">
                              <div className="flex items-center gap-2 mb-2">
                                <Lock className="w-4 h-4 text-red-500" />
                                <span className="text-sm font-medium text-red-700 dark:text-red-400">
                                  {isRtl ? "فشل السيادة" : "Sovereignty Failure"}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {isRtl ? competitor.sovereigntyFailureAr : competitor.sovereigntyFailure}
                              </p>
                            </div>
                          </div>
                          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="w-4 h-4 text-amber-600" />
                              <span className="font-medium text-amber-700 dark:text-amber-400">
                                {isRtl ? "لماذا لا يستطيعون التطور" : "Why They Cannot Evolve"}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {isRtl ? competitor.whyCannotEvolveAr : competitor.whyCannotEvolve}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Target className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg">
                    {isRtl ? "اختر منصة لعرض تحليل المنافسين" : "Select a platform to view competitor analysis"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
