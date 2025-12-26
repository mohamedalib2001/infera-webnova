import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  MessageSquareOff, 
  AlertTriangle,
  User,
  Volume2,
  VolumeX,
  Shield,
  CheckCircle2,
  XCircle,
  Quote,
} from "lucide-react";
import { crisisLevels, crisisPrinciple, absoluteRules, crisisMatrixMeta } from "@/lib/crisis-communication-data";

export default function CrisisCommunication() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low": return "bg-blue-500/20 text-blue-600 border-blue-500/30";
      case "medium": return "bg-amber-500/20 text-amber-600 border-amber-500/30";
      case "high": return "bg-orange-500/20 text-orange-600 border-orange-500/30";
      case "critical": return "bg-red-500/20 text-red-600 border-red-500/30";
      case "extreme": return "bg-purple-500/20 text-purple-600 border-purple-500/30";
      default: return "bg-slate-500/20 text-slate-600 border-slate-500/30";
    }
  };

  const getSeverityLabel = (severity: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      low: { en: "Low", ar: "منخفض" },
      medium: { en: "Medium", ar: "متوسط" },
      high: { en: "High", ar: "عالي" },
      critical: { en: "Critical", ar: "حرج" },
      extreme: { en: "Extreme", ar: "حاد" }
    };
    return isRtl ? labels[severity]?.ar : labels[severity]?.en;
  };

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Badge variant="outline" className="px-4 py-2 border-red-500/50 bg-red-500/10">
            <MessageSquareOff className="w-4 h-4 mr-2 text-red-400" />
            <span className="text-red-400 font-medium">
              {isRtl ? crisisMatrixMeta.classificationAr : crisisMatrixMeta.classification}
            </span>
          </Badge>
        </div>

        <section className="mb-10">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-red-800 to-slate-900 text-white py-10">
              <div className="text-center">
                <Badge className="mb-4 bg-white/20 text-white border-white/30">
                  {isRtl ? crisisMatrixMeta.targetAr : crisisMatrixMeta.target}
                </Badge>
                <CardTitle className="text-3xl font-bold mb-4">
                  {isRtl ? crisisMatrixMeta.titleAr : crisisMatrixMeta.title}
                </CardTitle>
              </div>
            </CardHeader>
          </Card>
        </section>

        <section className="mb-10">
          <Card className="overflow-hidden">
            <CardContent className="p-6 bg-slate-900 text-white">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">{isRtl ? crisisPrinciple.titleAr : crisisPrinciple.title}</h3>
                <p className="text-2xl font-semibold mb-1">{isRtl ? crisisPrinciple.statementAr : crisisPrinciple.statement}</p>
                <p className="text-white/70">{isRtl ? crisisPrinciple.subStatementAr : crisisPrinciple.subStatement}</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            {isRtl ? "مستويات الأزمات" : "Crisis Levels"}
          </h2>
          <div className="space-y-4">
            {crisisLevels.map((crisis, index) => (
              <motion.div
                key={crisis.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader className="border-b bg-muted/30 py-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${getSeverityColor(crisis.severity)}`}>
                          {crisis.level}
                        </div>
                        <CardTitle className="text-lg">{isRtl ? crisis.nameAr : crisis.name}</CardTitle>
                      </div>
                      <Badge className={getSeverityColor(crisis.severity)}>
                        {getSeverityLabel(crisis.severity)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-3 rounded-lg bg-slate-500/5 border border-slate-500/20">
                        <h4 className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {isRtl ? "أمثلة" : "Examples"}
                        </h4>
                        <ul className="space-y-1">
                          {(isRtl ? crisis.examplesAr : crisis.examples).map((ex, i) => (
                            <li key={i} className="text-xs text-muted-foreground">
                              {ex}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                        <h4 className="text-xs font-semibold text-purple-600 mb-2 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {isRtl ? "المتحدث" : "Spokesperson"}
                        </h4>
                        <p className="text-sm font-medium">
                          {isRtl ? crisis.spokespersonAr : crisis.spokesperson}
                        </p>
                      </div>

                      {crisis.message ? (
                        <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                          <h4 className="text-xs font-semibold text-red-600 mb-2 flex items-center gap-1">
                            <VolumeX className="w-3 h-3" />
                            {isRtl ? "الرسالة" : "Message"}
                          </h4>
                          <p className="text-sm font-bold text-red-700 dark:text-red-400">
                            {isRtl ? crisis.messageAr : crisis.message}
                          </p>
                          {crisis.action && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {isRtl ? crisis.actionAr : crisis.action}
                            </p>
                          )}
                        </div>
                      ) : crisis.messageFrame ? (
                        <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                          <h4 className="text-xs font-semibold text-blue-600 mb-2 flex items-center gap-1">
                            <Volume2 className="w-3 h-3" />
                            {isRtl ? "إطار الرسالة" : "Message Frame"}
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {(isRtl ? crisis.messageFrameAr : crisis.messageFrame).map((frame, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {frame}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {crisis.keyPhraseStyle && (
                        <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                          <h4 className="text-xs font-semibold text-emerald-600 mb-2 flex items-center gap-1">
                            <Quote className="w-3 h-3" />
                            {isRtl ? "نمط العبارة الرئيسية" : "Key Phrase Style"}
                          </h4>
                          <p className="text-sm italic text-emerald-700 dark:text-emerald-400">
                            "{isRtl ? crisis.keyPhraseStyleAr : crisis.keyPhraseStyle}"
                          </p>
                        </div>
                      )}

                      {crisis.keyRule && (
                        <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 lg:col-span-2">
                          <h4 className="text-xs font-semibold text-red-600 mb-2 flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            {isRtl ? "القاعدة الرئيسية" : "Key Rule"}
                          </h4>
                          <p className="text-sm font-bold text-red-700 dark:text-red-400">
                            {isRtl ? crisis.keyRuleAr : crisis.keyRule}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <section>
          <Card className="overflow-hidden">
            <CardHeader className="bg-slate-900 text-white border-b">
              <CardTitle className="text-xl flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {isRtl ? absoluteRules.titleAr : absoluteRules.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-slate-900/95 text-white">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                {absoluteRules.rules.map((rule, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span className="text-sm">{isRtl ? rule.ruleAr : rule.rule}</span>
                  </motion.div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                  <p className="font-bold text-emerald-300 text-lg">
                    {isRtl ? absoluteRules.finalStatementAr : absoluteRules.finalStatement}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-center">
                  <XCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
                  <p className="font-bold text-red-300 text-lg">
                    {isRtl ? absoluteRules.warningAr : absoluteRules.warning}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
