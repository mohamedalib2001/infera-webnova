import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  Brain, 
  Shield,
  Ban,
  Eye,
} from "lucide-react";
import { 
  aiPolicyIntro,
  aiPolicySections,
  aiPolicyClosing,
  aiPolicyMeta
} from "@/lib/ai-policy-data";

export default function AIPolicy() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <section className="mb-10">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-violet-900 to-purple-900 text-white py-12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <Badge className="mb-4 bg-white/10 text-white border-white/20">
                  <Brain className="w-4 h-4 mr-2" />
                  {isRtl ? aiPolicyMeta.subtitleAr : aiPolicyMeta.subtitle}
                </Badge>
                <CardTitle className="text-3xl font-bold mb-4">
                  {isRtl ? aiPolicyMeta.titleAr : aiPolicyMeta.title}
                </CardTitle>
                <p className="text-sm text-white/60">
                  {isRtl ? `آخر تحديث: ${aiPolicyIntro.lastUpdatedAr}` : `Last Updated: ${aiPolicyIntro.lastUpdated}`}
                </p>
              </motion.div>
            </CardHeader>
          </Card>
        </section>

        <section className="mb-10">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Shield className="w-8 h-8 text-violet-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-lg font-semibold mb-2">
                    {isRtl ? aiPolicyIntro.statementAr : aiPolicyIntro.statement}
                  </p>
                  <p className="text-muted-foreground">
                    {isRtl ? aiPolicyIntro.descriptionAr : aiPolicyIntro.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4 mb-10">
          {aiPolicySections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardHeader className="border-b bg-muted/30 py-3">
                  <CardTitle className="text-lg flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-violet-500/10 text-violet-600 flex items-center justify-center text-sm font-bold">
                      {section.number}
                    </span>
                    {isRtl ? section.titleAr : section.title}
                    {section.id === "prohibited" && (
                      <Ban className="w-4 h-4 text-red-500 ml-2" />
                    )}
                    {section.id === "transparency" && (
                      <Eye className="w-4 h-4 text-violet-500 ml-2" />
                    )}
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
            <CardContent className="p-8 bg-gradient-to-r from-violet-900 to-purple-900 text-white text-center">
              <Brain className="w-8 h-8 text-violet-300 mx-auto mb-4" />
              <p className="text-lg font-medium">
                {isRtl ? aiPolicyClosing.statementAr : aiPolicyClosing.statement}
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
