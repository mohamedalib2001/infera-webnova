import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  FileText, 
  Shield,
  AlertTriangle,
} from "lucide-react";
import { 
  termsIntro,
  termsSections,
  termsClosing,
  termsMeta
} from "@/lib/terms-data";

export default function Terms() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <section className="mb-10">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <Badge className="mb-4 bg-white/10 text-white border-white/20">
                  <FileText className="w-4 h-4 mr-2" />
                  {isRtl ? termsMeta.subtitleAr : termsMeta.subtitle}
                </Badge>
                <CardTitle className="text-3xl font-bold mb-4">
                  {isRtl ? termsMeta.titleAr : termsMeta.title}
                </CardTitle>
                <p className="text-sm text-white/60">
                  {isRtl ? `آخر تحديث: ${termsIntro.lastUpdatedAr}` : `Last Updated: ${termsIntro.lastUpdated}`}
                </p>
              </motion.div>
            </CardHeader>
          </Card>
        </section>

        <section className="mb-10">
          <Card>
            <CardContent className="p-6">
              <p className="text-lg font-semibold mb-2">
                {isRtl ? termsIntro.welcomeAr : termsIntro.welcome}
              </p>
              <p className="text-muted-foreground mb-4">
                {isRtl ? termsIntro.statementAr : termsIntro.statement}
              </p>
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">
                    {isRtl ? termsIntro.warningAr : termsIntro.warning}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4 mb-10">
          {termsSections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardHeader className="border-b bg-muted/30 py-3">
                  <CardTitle className="text-lg flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                      {section.number}
                    </span>
                    {isRtl ? section.titleAr : section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ul className="space-y-2">
                    {(isRtl ? section.contentAr : section.content).map((item, i) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </section>

        <section>
          <Card className="overflow-hidden">
            <CardContent className="p-8 bg-gradient-to-r from-slate-900 to-slate-800 text-white text-center">
              <Shield className="w-8 h-8 text-primary mx-auto mb-4" />
              <p className="text-lg font-medium">
                {isRtl ? termsClosing.statementAr : termsClosing.statement}
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
