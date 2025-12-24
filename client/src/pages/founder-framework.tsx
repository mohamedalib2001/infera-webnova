import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  Crown, 
  Filter,
  Target,
  Shield,
  Battery,
  ClipboardList,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { 
  frameworkPurpose, 
  decisionFilters, 
  priorityRule,
  energyProtection,
  dailyReview,
  absoluteRules,
  founderFrameworkMeta 
} from "@/lib/founder-framework-data";

export default function FounderFramework() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Badge variant="outline" className="px-4 py-2 border-purple-600/50 bg-purple-600/10">
            <Crown className="w-4 h-4 mr-2 text-purple-500" />
            <span className="text-purple-500 font-medium">
              {isRtl ? founderFrameworkMeta.classificationAr : founderFrameworkMeta.classification}
            </span>
          </Badge>
        </div>

        <section className="mb-10">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white py-10">
              <div className="text-center">
                <div className="flex justify-center gap-2 mb-4">
                  <Badge className="bg-white/20 text-white border-white/30">
                    {isRtl ? founderFrameworkMeta.targetAr : founderFrameworkMeta.target}
                  </Badge>
                  <Badge className="bg-purple-500/30 text-white border-purple-500/50">
                    {isRtl ? founderFrameworkMeta.modeAr : founderFrameworkMeta.mode}
                  </Badge>
                </div>
                <CardTitle className="text-3xl font-bold mb-4">
                  {isRtl ? founderFrameworkMeta.titleAr : founderFrameworkMeta.title}
                </CardTitle>
              </div>
            </CardHeader>
          </Card>
        </section>

        <section className="mb-10">
          <Card className="overflow-hidden">
            <CardContent className="p-6 bg-purple-900/90 text-white">
              <h3 className="text-xl font-bold mb-4 text-center">{isRtl ? frameworkPurpose.titleAr : frameworkPurpose.title}</h3>
              <div className="flex flex-wrap justify-center gap-4">
                {frameworkPurpose.goals.map((g, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-3 rounded-lg bg-white/10 border border-white/20"
                  >
                    <CheckCircle2 className="w-5 h-5 text-purple-300 mx-auto mb-2" />
                    <span className="text-sm">{isRtl ? g.goalAr : g.goal}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Filter className="w-6 h-6 text-blue-500" />
            {isRtl ? "فلتر القرارات اليومي (استخدم كل صباح)" : "Daily Decision Filter (Use Every Morning)"}
          </h2>
          <div className="space-y-3">
            {decisionFilters.map((filter, index) => (
              <motion.div
                key={filter.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                        {filter.id}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-2">{isRtl ? filter.questionAr : filter.question}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-amber-500/30 text-amber-600">
                            {isRtl ? filter.conditionAr : filter.condition}
                          </Badge>
                          <span className="text-muted-foreground">→</span>
                          <Badge className="bg-red-500/20 text-red-600 border-red-500/30">
                            <XCircle className="w-3 h-3 mr-1" />
                            {isRtl ? filter.actionAr : filter.action}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <Card className="overflow-hidden">
            <CardContent className="p-6 bg-slate-900 text-white text-center">
              <Target className="w-8 h-8 text-amber-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-2">{isRtl ? priorityRule.titleAr : priorityRule.title}</h3>
              <p className="text-2xl font-bold text-amber-400 mb-1">{isRtl ? priorityRule.statementAr : priorityRule.statement}</p>
              <p className="text-white/70">{isRtl ? priorityRule.subStatementAr : priorityRule.subStatement}</p>
            </CardContent>
          </Card>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Battery className="w-6 h-6 text-emerald-500" />
            {isRtl ? energyProtection.titleAr : energyProtection.title}
          </h2>
          <Card>
            <CardContent className="p-6">
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-red-600 mb-3">{isRtl ? "لا قرارات تحت:" : "No decisions under:"}</h4>
                <div className="flex flex-wrap gap-2">
                  {energyProtection.noDecisionUnder.map((c, i) => (
                    <Badge key={i} variant="outline" className="border-red-500/30 text-red-600">
                      <XCircle className="w-3 h-3 mr-1" />
                      {isRtl ? c.conditionAr : c.condition}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {energyProtection.rules.map((r, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-center"
                  >
                    <Zap className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm font-medium">{isRtl ? r.ruleAr : r.rule}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <ClipboardList className="w-6 h-6 text-blue-500" />
            {isRtl ? dailyReview.titleAr : dailyReview.title}
          </h2>
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {dailyReview.questions.map((q, i) => (
                  <div key={i} className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="text-sm">{isRtl ? q.questionAr : q.question}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                <p className="font-semibold text-amber-600">{isRtl ? dailyReview.noteAr : dailyReview.note}</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="overflow-hidden">
            <CardHeader className="bg-purple-600 text-white border-b py-4">
              <CardTitle className="text-xl flex items-center justify-center gap-2">
                <Shield className="w-5 h-5" />
                {isRtl ? absoluteRules.titleAr : absoluteRules.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-purple-600/95 text-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {absoluteRules.rules.map((rule, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-3 rounded-lg bg-white/10 border border-white/20 flex items-center gap-2"
                  >
                    <Crown className="w-4 h-4 text-amber-300 flex-shrink-0" />
                    <span className="text-sm">{isRtl ? rule.ruleAr : rule.rule}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
