import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  Lock, 
  Download,
  Network,
  XCircle,
  ArrowDown,
  Infinity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
} from "lucide-react";
import { dependencyMap, replacementFailures, regressionEffect, permanentGap, executiveSummary } from "@/lib/irreplaceability-data";

export default function IrreplaceabilityProof() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Badge variant="outline" className="px-4 py-2 border-slate-500/50 bg-slate-500/10">
            <Lock className="w-4 h-4 mr-2 text-slate-400" />
            <span className="text-slate-400 font-medium">
              {isRtl ? "إثبات عدم القابلية للاستبدال™" : "Legacy & Irreplaceability Proof™"}
            </span>
          </Badge>
          <Button variant="outline" className="gap-2" data-testid="button-download-irreplaceability">
            <Download className="w-4 h-4" />
            {isRtl ? "تحميل PDF" : "Download PDF"}
          </Button>
        </div>

        <section className="mb-10">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-900 text-white py-10">
              <div className="text-center">
                <CardTitle className="text-3xl font-bold mb-4">
                  {isRtl ? executiveSummary.titleAr : executiveSummary.title}
                </CardTitle>
                <CardDescription className="text-white/80 max-w-3xl mx-auto text-lg">
                  {isRtl 
                    ? "إثبات أن إزالة INFERA تنشئ فراغاً لا يمكن ملؤه بالبدائل"
                    : "Proving that removing INFERA creates a vacuum that cannot be filled by alternatives"}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {executiveSummary.keyPoints.map((point, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full bg-slate-500/5 border-slate-500/20">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          {isRtl ? point.pointAr : point.point}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {isRtl ? point.detailAr : point.detail}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Network className="w-6 h-6 text-blue-500" />
            {isRtl ? "خريطة الاعتمادات" : "Dependency Map"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dependencyMap.map((dep, index) => (
              <motion.div
                key={dep.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{isRtl ? dep.categoryAr : dep.category}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ul className="space-y-1">
                      {(isRtl ? dep.dependenciesAr : dep.dependencies).map((d, i) => (
                        <li key={i} className="text-xs flex items-start gap-1">
                          <CheckCircle2 className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="p-2 rounded bg-red-500/10 border border-red-500/20">
                      <div className="flex items-center gap-1 mb-1">
                        <AlertTriangle className="w-3 h-3 text-red-500" />
                        <span className="text-xs font-semibold text-red-600">{isRtl ? "تأثير الانهيار" : "Breakage Impact"}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{isRtl ? dep.breakageImpactAr : dep.breakageImpact}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <XCircle className="w-6 h-6 text-red-500" />
            {isRtl ? "تحليل فشل الاستبدال" : "Replacement Failure Analysis"}
          </h2>
          <div className="space-y-4">
            {replacementFailures.map((failure, index) => (
              <motion.div
                key={failure.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{isRtl ? failure.competitorAr : failure.competitor}</CardTitle>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {isRtl ? failure.timeToApproximateAr : failure.timeToApproximate}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>{isRtl ? failure.whatTheyAttemptAr : failure.whatTheyAttempt}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-semibold mb-2 text-red-600">{isRtl ? "لماذا يفشل" : "Why It Fails"}</h4>
                        <ul className="space-y-1">
                          {(isRtl ? failure.whyItFailsAr : failure.whyItFails).map((f, i) => (
                            <li key={i} className="text-xs flex items-start gap-1">
                              <XCircle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-3 rounded bg-amber-500/10 border border-amber-500/20">
                        <div className="flex items-center gap-1 mb-2">
                          <DollarSign className="w-4 h-4 text-amber-600" />
                          <span className="text-sm font-semibold text-amber-700">{isRtl ? "تكلفة التقريب" : "Cost to Approximate"}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{isRtl ? failure.costToApproximateAr : failure.costToApproximate}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <ArrowDown className="w-6 h-6 text-amber-500" />
            {isRtl ? "تأثير الانحدار" : "Regression Effect"}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-start p-3 font-semibold">{isRtl ? "المجال" : "Area"}</th>
                  <th className="text-start p-3 font-semibold text-emerald-600">{isRtl ? "مع INFERA" : "With INFERA"}</th>
                  <th className="text-start p-3 font-semibold text-red-600">{isRtl ? "بدون INFERA" : "Without INFERA"}</th>
                  <th className="text-start p-3 font-semibold text-amber-600">{isRtl ? "حجم النكسة" : "Setback"}</th>
                </tr>
              </thead>
              <tbody>
                {regressionEffect.map((reg, index) => (
                  <motion.tr
                    key={reg.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b"
                  >
                    <td className="p-3 font-medium">{isRtl ? reg.areaAr : reg.area}</td>
                    <td className="p-3 text-xs text-emerald-700 dark:text-emerald-400">{isRtl ? reg.withInferaAr : reg.withInfera}</td>
                    <td className="p-3 text-xs text-red-700 dark:text-red-400">{isRtl ? reg.withoutInferaAr : reg.withoutInfera}</td>
                    <td className="p-3 text-xs text-amber-700 dark:text-amber-400">{isRtl ? reg.strategicSetbackAr : reg.strategicSetback}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Infinity className="w-6 h-6 text-purple-500" />
            {isRtl ? permanentGap.titleAr : permanentGap.title}
          </h2>
          <div className="space-y-4 mb-6">
            {permanentGap.statements.map((stmt, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-purple-500/5 border-purple-500/20">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-purple-700 dark:text-purple-400 mb-2">
                      {isRtl ? stmt.statementAr : stmt.statement}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isRtl ? stmt.explanationAr : stmt.explanation}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <Card className="overflow-hidden">
            <CardContent className="p-8 bg-gradient-to-r from-purple-500/10 to-slate-500/10">
              <p className="text-lg text-center font-medium max-w-3xl mx-auto">
                {isRtl ? permanentGap.conclusion.ar : permanentGap.conclusion.en}
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
