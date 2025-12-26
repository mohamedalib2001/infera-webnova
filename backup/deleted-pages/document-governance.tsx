import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Lock,
  AlertTriangle,
  FileWarning,
  CheckCircle2,
  XCircle,
  ArrowLeftRight,
  Database,
} from "lucide-react";
import { documentClasses, languageFirewall, storageAccessRules, violationPolicy, governanceMeta } from "@/lib/document-governance-data";

export default function DocumentGovernance() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Badge variant="outline" className="px-4 py-2 border-red-500/50 bg-red-500/10">
            <ShieldCheck className="w-4 h-4 mr-2 text-red-400" />
            <span className="text-red-400 font-medium">
              {isRtl ? "حوكمة فصل الوثائق" : "Document Separation Governance"}
            </span>
          </Badge>
        </div>

        <section className="mb-10">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-red-700 to-red-900 text-white py-10">
              <div className="text-center">
                <Badge className="mb-4 bg-white/20 text-white border-white/30">
                  {isRtl ? "قواعد إلزامية" : "MANDATORY RULES"}
                </Badge>
                <CardTitle className="text-3xl font-bold mb-4">
                  {isRtl ? governanceMeta.titleAr : governanceMeta.title}
                </CardTitle>
                <CardDescription className="text-white/90 max-w-3xl mx-auto text-lg">
                  {isRtl ? governanceMeta.purposeAr : governanceMeta.purpose}
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Lock className="w-6 h-6 text-red-500" />
            {isRtl ? "فئات الوثائق وقواعد الفصل" : "Document Classes & Separation Rules"}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {documentClasses.map((docClass, index) => (
              <motion.div
                key={docClass.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader className="border-b bg-muted/30">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{isRtl ? docClass.nameAr : docClass.name}</CardTitle>
                      <Badge variant="outline" className="border-red-500/50 text-red-600">
                        {isRtl ? docClass.classificationAr : docClass.classification}
                      </Badge>
                    </div>
                    <CardDescription>
                      {isRtl ? "أسلوب اللغة: " : "Language Style: "}
                      <span className="font-semibold">{isRtl ? docClass.languageStyleAr : docClass.languageStyle}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold mb-2 text-emerald-600">{isRtl ? "الجمهور المستهدف" : "Target Audience"}</h4>
                      <div className="flex flex-wrap gap-1">
                        {(isRtl ? docClass.audienceAr : docClass.audience).map((a, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {a}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-2 text-red-600">{isRtl ? "لا تذكر أبداً" : "Never Mention"}</h4>
                      <ul className="space-y-1">
                        {(isRtl ? docClass.neverMentionAr : docClass.neverMention).map((n, i) => (
                          <li key={i} className="text-xs flex items-start gap-1">
                            <XCircle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{n}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-2 text-amber-600">{isRtl ? "لا تشارك مع" : "Never Share With"}</h4>
                      <div className="flex flex-wrap gap-1">
                        {(isRtl ? docClass.neverShareWithAr : docClass.neverShareWith).map((s, i) => (
                          <Badge key={i} variant="outline" className="text-xs border-amber-500/30 text-amber-600">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="p-2 rounded bg-slate-500/10">
                      <span className="text-xs font-semibold">{isRtl ? "سلطة المراجعة: " : "Review Authority: "}</span>
                      <span className="text-xs text-muted-foreground">{isRtl ? docClass.reviewAuthorityAr : docClass.reviewAuthority}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <ArrowLeftRight className="w-6 h-6 text-purple-500" />
            {isRtl ? languageFirewall.titleAr : languageFirewall.title}
          </h2>
          <Card>
            <CardHeader className="border-b">
              <CardDescription>
                {isRtl ? languageFirewall.descriptionAr : languageFirewall.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-start p-3 font-semibold text-amber-600">{isRtl ? "لغة المجلس" : "Board Language"}</th>
                      <th className="text-center p-3">
                        <ArrowLeftRight className="w-4 h-4 mx-auto text-red-500" />
                      </th>
                      <th className="text-start p-3 font-semibold text-emerald-600">{isRtl ? "لغة الحكومة" : "Government Language"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {languageFirewall.rules.map((rule, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-3 text-amber-700 dark:text-amber-400">{isRtl ? rule.boardLanguageAr : rule.boardLanguage}</td>
                        <td className="p-3 text-center">
                          <XCircle className="w-4 h-4 mx-auto text-red-500" />
                        </td>
                        <td className="p-3 text-emerald-700 dark:text-emerald-400">{isRtl ? rule.governmentLanguageAr : rule.governmentLanguage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Database className="w-6 h-6 text-blue-500" />
            {isRtl ? storageAccessRules.titleAr : storageAccessRules.title}
          </h2>
          <Card>
            <CardContent className="p-6">
              <ul className="space-y-3">
                {storageAccessRules.rules.map((rule, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{isRtl ? rule.ruleAr : rule.rule}</span>
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <FileWarning className="w-6 h-6 text-red-500" />
            {isRtl ? violationPolicy.titleAr : violationPolicy.title}
          </h2>
          <Card className="overflow-hidden">
            <CardHeader className="bg-red-500/10 border-b border-red-500/20">
              <CardTitle className="text-red-600 text-center text-lg">
                "{isRtl ? violationPolicy.statementAr : violationPolicy.statement}"
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {violationPolicy.consequences.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg bg-red-500/5 border border-red-500/20"
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-red-700 dark:text-red-400 mb-1">
                          {isRtl ? item.violationAr : item.violation}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {isRtl ? item.consequenceAr : item.consequence}
                        </p>
                      </div>
                    </div>
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
