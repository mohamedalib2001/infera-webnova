import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  Shield, 
  Eye,
  EyeOff,
  Gavel,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Crown,
  Users,
  Building2,
  Landmark,
  Handshake,
  Briefcase,
  Globe,
} from "lucide-react";
import { stakeholderCategories, accessRules, accessMatrixMeta } from "@/lib/stakeholder-access-data";

export default function StakeholderAccess() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const getStakeholderIcon = (id: string) => {
    switch (id) {
      case "founder": return <Crown className="w-5 h-5" />;
      case "board": return <Users className="w-5 h-5" />;
      case "sovereign-funds": return <Landmark className="w-5 h-5" />;
      case "government": return <Building2 className="w-5 h-5" />;
      case "partners": return <Handshake className="w-5 h-5" />;
      case "enterprise": return <Briefcase className="w-5 h-5" />;
      case "public": return <Globe className="w-5 h-5" />;
      default: return <Users className="w-5 h-5" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "absolute": return "bg-purple-500/20 text-purple-600 border-purple-500/30";
      case "high": return "bg-red-500/20 text-red-600 border-red-500/30";
      case "medium": return "bg-amber-500/20 text-amber-600 border-amber-500/30";
      case "low": return "bg-blue-500/20 text-blue-600 border-blue-500/30";
      case "none": return "bg-slate-500/20 text-slate-600 border-slate-500/30";
      default: return "bg-slate-500/20 text-slate-600 border-slate-500/30";
    }
  };

  const getRiskLabel = (risk: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      absolute: { en: "Absolute", ar: "مطلق" },
      high: { en: "High", ar: "عالي" },
      medium: { en: "Medium", ar: "متوسط" },
      low: { en: "Low", ar: "منخفض" },
      none: { en: "None", ar: "لا شيء" }
    };
    return isRtl ? labels[risk]?.ar : labels[risk]?.en;
  };

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Badge variant="outline" className="px-4 py-2 border-cyan-500/50 bg-cyan-500/10">
            <Shield className="w-4 h-4 mr-2 text-cyan-400" />
            <span className="text-cyan-400 font-medium">
              {isRtl ? accessMatrixMeta.classificationAr : accessMatrixMeta.classification}
            </span>
          </Badge>
        </div>

        <section className="mb-10">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-cyan-700 to-teal-900 text-white py-10">
              <div className="text-center">
                <Badge className="mb-4 bg-white/20 text-white border-white/30">
                  {isRtl ? accessMatrixMeta.targetAr : accessMatrixMeta.target}
                </Badge>
                <CardTitle className="text-3xl font-bold mb-4">
                  {isRtl ? accessMatrixMeta.titleAr : accessMatrixMeta.title}
                </CardTitle>
                <CardDescription className="text-white/90 max-w-3xl mx-auto text-lg">
                  {isRtl ? accessMatrixMeta.objectiveAr : accessMatrixMeta.objective}
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Users className="w-6 h-6 text-cyan-500" />
            {isRtl ? "فئات أصحاب المصلحة والوصول" : "Stakeholder Categories & Access"}
          </h2>
          <div className="space-y-4">
            {stakeholderCategories.map((stakeholder, index) => (
              <motion.div
                key={stakeholder.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`overflow-hidden ${stakeholder.id === "founder" ? "ring-2 ring-purple-500/50" : ""}`}>
                  <CardHeader className="border-b bg-muted/30 py-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getRiskColor(stakeholder.riskLevel)}`}>
                          {getStakeholderIcon(stakeholder.id)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {isRtl ? `المستوى ${stakeholder.level}` : `Level ${stakeholder.level}`}
                            </Badge>
                            <Badge className={getRiskColor(stakeholder.riskLevel)}>
                              {getRiskLabel(stakeholder.riskLevel)}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg">{isRtl ? stakeholder.nameAr : stakeholder.name}</CardTitle>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                        <h4 className="text-xs font-semibold text-emerald-600 mb-2 flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {isRtl ? "الوصول" : "Access"}
                        </h4>
                        <ul className="space-y-1">
                          {(isRtl ? stakeholder.accessItemsAr : stakeholder.accessItems).map((item, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {stakeholder.noAccessItems.length > 0 && (
                        <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                          <h4 className="text-xs font-semibold text-red-600 mb-2 flex items-center gap-1">
                            <EyeOff className="w-3 h-3" />
                            {isRtl ? "لا وصول إلى" : "No Access To"}
                          </h4>
                          <ul className="space-y-1">
                            {(isRtl ? stakeholder.noAccessItemsAr : stakeholder.noAccessItems).map((item, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                                <XCircle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                        <h4 className="text-xs font-semibold text-purple-600 mb-2 flex items-center gap-1">
                          <Gavel className="w-3 h-3" />
                          {isRtl ? "سلطة القرار" : "Decision Power"}
                        </h4>
                        <ul className="space-y-1">
                          {(isRtl ? stakeholder.decisionPowerAr : stakeholder.decisionPower).map((power, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                              <CheckCircle2 className="w-3 h-3 text-purple-500 mt-0.5 flex-shrink-0" />
                              {power}
                            </li>
                          ))}
                        </ul>
                      </div>
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
                {isRtl ? accessRules.titleAr : accessRules.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-slate-900/95 text-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {accessRules.rules.map((rule, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-start gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{isRtl ? rule.ruleAr : rule.rule}</span>
                  </motion.div>
                ))}
              </div>
              <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-center">
                <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
                <p className="font-semibold text-red-300">
                  {isRtl ? accessRules.violationRuleAr : accessRules.violationRule}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
