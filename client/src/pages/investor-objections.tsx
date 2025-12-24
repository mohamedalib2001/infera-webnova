import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  ShieldQuestion, 
  Download,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileText,
  ArrowRight,
} from "lucide-react";
import { investorObjections } from "@/lib/strategic-adoption-data";

export default function InvestorObjections() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-4 py-2 border-amber-500/50 bg-amber-500/10">
              <ShieldQuestion className="w-4 h-4 mr-2 text-amber-400" />
              <span className="text-amber-400 font-medium">
                {isRtl ? "مصفوفة اعتراضات المستثمرين" : "Investor Objection Handling Matrix"}
              </span>
            </Badge>
          </div>
          <Button variant="outline" className="gap-2" data-testid="button-download-objections">
            <Download className="w-4 h-4" />
            {isRtl ? "تحميل PDF" : "Download PDF"}
          </Button>
        </div>

        <section className="mb-10">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-amber-600 to-orange-700 text-white py-8">
              <div className="text-center">
                <CardTitle className="text-3xl font-bold mb-2">
                  {isRtl ? "تفكيك الاعتراضات قبل طرحها" : "Neutralize Objections Before They're Raised"}
                </CardTitle>
                <CardDescription className="text-white/80 max-w-2xl mx-auto">
                  {isRtl 
                    ? "لا تنكر الاعتراضات. اعترف بها، ثم فككها هيكلياً."
                    : "Don't deny objections. Acknowledge them, then structurally dismantle them."}
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </section>

        <div className="space-y-6">
          {investorObjections.map((obj, index) => (
            <motion.div
              key={obj.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden">
                <CardHeader className="bg-slate-100 dark:bg-slate-800/50 py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <span className="text-amber-500 font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <CardTitle className="text-lg text-amber-700 dark:text-amber-400">
                        "{isRtl ? obj.objectionAr : obj.objection}"
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        <h3 className="font-semibold text-amber-700 dark:text-amber-400">
                          {isRtl ? "لماذا القلق صحيح" : "Why the Concern is Valid"}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {isRtl ? obj.whyValidAr : obj.whyValid}
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <h3 className="font-semibold text-emerald-700 dark:text-emerald-400">
                          {isRtl ? "لماذا INFERA مختلفة هيكلياً" : "Why INFERA Is Structurally Different"}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {isRtl ? obj.whyDifferentAr : obj.whyDifferent}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-blue-700 dark:text-blue-400">
                        {isRtl ? "الأدلة من المعمارية / الحوكمة" : "Evidence from Architecture / Governance"}
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(isRtl ? obj.evidenceAr : obj.evidence).map((e, i) => (
                        <Badge key={i} variant="secondary" className="bg-blue-500/10 text-blue-700 dark:text-blue-400">
                          {e}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-semibold text-indigo-700 dark:text-indigo-400">
                        {isRtl ? "رسالة إعادة التأطير الاستراتيجي" : "Strategic Reframing Message"}
                      </h3>
                    </div>
                    <p className="text-base font-medium italic">
                      "{isRtl ? obj.reframingMessageAr : obj.reframingMessage}"
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
