import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  Zap, 
  Shield,
  Ban,
  Gauge,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { 
  performancePolicyIntro,
  performancePolicySections,
  performancePolicyClosing,
  performancePolicyMeta,
  performancePolicyUsage
} from "@/lib/performance-policy-data";

export default function PerformancePolicy() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const getSectionIcon = (sectionId: string) => {
    switch (sectionId) {
      case "prohibited":
        return <Ban className="w-4 h-4 text-red-500" />;
      case "monitoring":
        return <Gauge className="w-4 h-4 text-orange-500" />;
      case "enforcement":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <section className="mb-10">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <Badge className="mb-4 bg-white/10 text-white border-white/20">
                  <Zap className="w-4 h-4 mr-2" />
                  {isRtl ? performancePolicyMeta.subtitleAr : performancePolicyMeta.subtitle}
                </Badge>
                <CardTitle className="text-3xl font-bold mb-4">
                  {isRtl ? performancePolicyMeta.titleAr : performancePolicyMeta.title}
                </CardTitle>
                <p className="text-sm text-white/60">
                  {isRtl ? `آخر تحديث: ${performancePolicyIntro.lastUpdatedAr}` : `Last Updated: ${performancePolicyIntro.lastUpdated}`}
                </p>
                <Badge variant="destructive" className="mt-4">
                  Zero Tolerance Policy
                </Badge>
              </motion.div>
            </CardHeader>
          </Card>
        </section>

        <section className="mb-10">
          <Card className="border-orange-500/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Shield className="w-8 h-8 text-orange-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-lg font-semibold mb-2">
                    {isRtl ? performancePolicyIntro.statementAr : performancePolicyIntro.statement}
                  </p>
                  <p className="text-destructive font-medium">
                    {isRtl ? performancePolicyIntro.warningAr : performancePolicyIntro.warning}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-10">
          <Card className="bg-muted/30">
            <CardHeader className="border-b py-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                {isRtl ? performancePolicyUsage.titleAr : performancePolicyUsage.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {performancePolicyUsage.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      {isRtl ? item.textAr : item.text}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4 mb-10">
          {performancePolicySections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={section.id === "prohibited" ? "border-red-500/30" : section.id === "enforcement" ? "border-yellow-500/30" : ""}>
                <CardHeader className="border-b bg-muted/30 py-3">
                  <CardTitle className="text-lg flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      section.id === "prohibited" ? "bg-red-500/10 text-red-600" : 
                      section.id === "enforcement" ? "bg-yellow-500/10 text-yellow-600" :
                      "bg-orange-500/10 text-orange-600"
                    }`}>
                      {section.number}
                    </span>
                    {isRtl ? section.titleAr : section.title}
                    {getSectionIcon(section.id)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ul className="space-y-2">
                    {(isRtl ? section.contentAr : section.content).map((item, i) => (
                      <li key={i} className={`text-sm ${
                        section.id === "prohibited" && i > 0 && i < 6 ? "text-red-500 font-medium" :
                        "text-muted-foreground"
                      }`}>
                        {section.id === "prohibited" && i > 0 && i < 6 ? (
                          <span className="flex items-center gap-2">
                            <Ban className="w-3 h-3" />
                            {item}
                          </span>
                        ) : item}
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
            <CardContent className="p-8 bg-gradient-to-r from-orange-600 to-red-600 text-white text-center">
              <Zap className="w-8 h-8 text-yellow-300 mx-auto mb-4" />
              <p className="text-lg font-medium mb-3">
                {isRtl ? performancePolicyClosing.statementAr : performancePolicyClosing.statement}
              </p>
              <p className="text-xl font-bold text-yellow-300">
                {isRtl ? performancePolicyClosing.principleAr : performancePolicyClosing.principle}
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
