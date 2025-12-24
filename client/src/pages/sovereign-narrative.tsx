import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  Lock, 
  Download,
  Shield,
  Brain,
  Settings,
  Factory,
  Network,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import { sovereignNarrativeLock } from "@/lib/strategic-dominance-data";

const pillarIcons: Record<string, typeof Shield> = {
  "Shield": Shield,
  "Brain": Brain,
  "Settings": Settings,
  "Factory": Factory,
  "Network": Network,
};

export default function SovereignNarrative() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-4 py-2 border-indigo-500/50 bg-indigo-500/10">
              <Lock className="w-4 h-4 mr-2 text-indigo-400" />
              <span className="text-indigo-400 font-medium">
                {isRtl ? "قفل السرد السيادي" : "Sovereign Narrative Lock"}
              </span>
            </Badge>
          </div>
          <Button variant="outline" className="gap-2" data-testid="button-download-narrative">
            <Download className="w-4 h-4" />
            {isRtl ? "تحميل PDF" : "Download PDF"}
          </Button>
        </div>

        <section className="mb-12">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-10">
              <div className="text-center">
                <CardTitle className="text-4xl font-bold mb-4">
                  {isRtl ? sovereignNarrativeLock.coreNarrative.headlineAr : sovereignNarrativeLock.coreNarrative.headline}
                </CardTitle>
                <CardDescription className="text-2xl text-white/90">
                  {isRtl ? sovereignNarrativeLock.coreNarrative.subheadlineAr : sovereignNarrativeLock.coreNarrative.subheadline}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-lg text-center text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                {isRtl ? sovereignNarrativeLock.coreNarrative.essenceAr : sovereignNarrativeLock.coreNarrative.essence}
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Shield className="w-6 h-6 text-indigo-500" />
            {isRtl ? "أعمدة السرد الخمسة" : "The Five Narrative Pillars"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {sovereignNarrativeLock.pillars.map((pillar, index) => {
              const Icon = pillarIcons[pillar.icon] || Shield;
              return (
                <motion.div
                  key={pillar.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full text-center hover-elevate">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-6 h-6 text-indigo-500" />
                      </div>
                      <h3 className="font-semibold mb-2">{isRtl ? pillar.nameAr : pillar.name}</h3>
                      <p className="text-sm text-muted-foreground">{isRtl ? pillar.descriptionAr : pillar.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-indigo-500" />
            {isRtl ? "قواعد السرد الإلزامية" : "Mandatory Narrative Rules"}
          </h2>
          <div className="space-y-4">
            {sovereignNarrativeLock.rules.map((rule, index) => (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                        <span className="text-indigo-500 font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{isRtl ? rule.ruleAr : rule.rule}</h3>
                        <p className="text-muted-foreground mb-3">{isRtl ? rule.enforcementAr : rule.enforcement}</p>
                        <div className="flex flex-wrap gap-2">
                          {(isRtl ? rule.examplesAr : rule.examples).map((example, i) => (
                            <Badge key={i} variant="secondary">{example}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              {isRtl ? "العبارات الإلزامية" : "Mandatory Phrases"}
            </h2>
            <Card>
              <CardContent className="p-6 space-y-4">
                {sovereignNarrativeLock.mandatoryPhrases.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10">
                    <div>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">{isRtl ? item.phraseAr : item.phrase}</span>
                      <p className="text-sm text-muted-foreground mt-1">{isRtl ? item.contextAr : item.context}</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <XCircle className="w-6 h-6 text-red-500" />
              {isRtl ? "العبارات المحظورة" : "Forbidden Phrases"}
            </h2>
            <Card>
              <CardContent className="p-6 space-y-4">
                {sovereignNarrativeLock.forbiddenPhrases.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-red-500/10">
                    <div>
                      <span className="font-semibold text-red-700 dark:text-red-400 line-through">{isRtl ? item.phraseAr : item.phrase}</span>
                      <p className="text-sm text-muted-foreground mt-1">{isRtl ? item.reasonAr : item.reason}</p>
                    </div>
                    <XCircle className="w-5 h-5 text-red-500" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
