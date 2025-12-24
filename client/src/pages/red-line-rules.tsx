import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  AlertOctagon, 
  Download,
  Ban,
  Shield,
  Crown,
} from "lucide-react";
import { redLineRules, sovereignDeclaration } from "@/lib/sovereign-completion-data";

export default function RedLineRules() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const groupedRules = redLineRules.reduce((acc, rule) => {
    const key = rule.category;
    if (!acc[key]) acc[key] = [];
    acc[key].push(rule);
    return acc;
  }, {} as Record<string, typeof redLineRules>);

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Badge variant="outline" className="px-4 py-2 border-red-500/50 bg-red-500/10">
            <AlertOctagon className="w-4 h-4 mr-2 text-red-400" />
            <span className="text-red-400 font-medium">
              {isRtl ? "قواعد الخطوط الحمراء" : "Red Line Rules"}
            </span>
          </Badge>
          <Button variant="outline" className="gap-2" data-testid="button-download-redlines">
            <Download className="w-4 h-4" />
            {isRtl ? "تحميل PDF" : "Download PDF"}
          </Button>
        </div>

        <section className="mb-10">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-red-600 to-rose-700 text-white py-10">
              <div className="text-center">
                <CardTitle className="text-3xl font-bold mb-4">
                  {isRtl ? "حماية INFERA من التنازل المستقبلي" : "Protecting INFERA from Future Compromise"}
                </CardTitle>
                <CardDescription className="text-white/80 max-w-2xl mx-auto text-lg">
                  {isRtl 
                    ? "ضمان النزاهة طويلة المدى على المكاسب قصيرة المدى"
                    : "Ensuring long-term integrity over short-term gain"}
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </section>

        <section className="mb-10 space-y-6">
          {Object.entries(groupedRules).map(([category, rules], groupIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIndex * 0.1 }}
            >
              <Card>
                <CardHeader className="bg-red-500/5 border-b py-4">
                  <div className="flex items-center gap-3">
                    <Ban className="w-5 h-5 text-red-500" />
                    <CardTitle className="text-lg text-red-700 dark:text-red-400">
                      {isRtl ? rules[0].categoryAr : category}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0 divide-y">
                  {rules.map((rule, index) => (
                    <div key={rule.id} className="p-4">
                      <h4 className="font-semibold mb-2">{isRtl ? rule.ruleAr : rule.rule}</h4>
                      <p className="text-sm text-muted-foreground">{isRtl ? rule.rationaleAr : rule.rationale}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </section>

        <section>
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Crown className="w-8 h-8 text-amber-400" />
                <CardTitle className="text-2xl">
                  {isRtl ? sovereignDeclaration.titleAr : sovereignDeclaration.title}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {sovereignDeclaration.statements.map((stmt, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.2 }}
                  className="p-6 border-b last:border-b-0 text-center"
                >
                  <h3 className="text-xl font-bold mb-2">{isRtl ? stmt.statementAr : stmt.statement}</h3>
                  <p className="text-muted-foreground">{isRtl ? stmt.expansionAr : stmt.expansion}</p>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
