import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  Rocket, 
  Eye,
  EyeOff,
  Target,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  Shield,
  Users,
  FileText,
} from "lucide-react";
import { launchPhases, launchPrinciple, launchMeta } from "@/lib/launch-sequencing-data";

export default function LaunchSequencing() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <Unlock className="w-4 h-4 text-emerald-500" />;
      case "upcoming": return <Clock className="w-4 h-4 text-amber-500" />;
      case "locked": return <Lock className="w-4 h-4 text-red-500" />;
      default: return <Lock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">{isRtl ? "نشط" : "Active"}</Badge>;
      case "upcoming":
        return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">{isRtl ? "قادم" : "Upcoming"}</Badge>;
      case "locked":
        return <Badge className="bg-red-500/20 text-red-600 border-red-500/30">{isRtl ? "مقفل" : "Locked"}</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Badge variant="outline" className="px-4 py-2 border-purple-500/50 bg-purple-500/10">
            <Rocket className="w-4 h-4 mr-2 text-purple-400" />
            <span className="text-purple-400 font-medium">
              {isRtl ? launchMeta.classificationAr : launchMeta.classification}
            </span>
          </Badge>
        </div>

        <section className="mb-10">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-700 to-indigo-900 text-white py-10">
              <div className="text-center">
                <Badge className="mb-4 bg-white/20 text-white border-white/30">
                  {isRtl ? launchMeta.targetAr : launchMeta.target}
                </Badge>
                <CardTitle className="text-3xl font-bold mb-4">
                  {isRtl ? launchMeta.titleAr : launchMeta.title}
                </CardTitle>
                <CardDescription className="text-white/90 max-w-3xl mx-auto text-lg">
                  {isRtl ? launchMeta.objectiveAr : launchMeta.objective}
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </section>

        <section className="mb-10">
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-slate-900 text-white">
              <CardTitle className="text-center text-xl">{isRtl ? launchPrinciple.titleAr : launchPrinciple.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-slate-900/95 text-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {launchPrinciple.statements.map((s, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg bg-white/5 border border-white/10 text-center"
                  >
                    <p className="font-semibold text-lg">
                      {isRtl ? s.statementAr : s.statement}
                    </p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Target className="w-6 h-6 text-purple-500" />
            {isRtl ? "مراحل الإطلاق" : "Launch Phases"}
          </h2>
          <div className="space-y-6">
            {launchPhases.map((phase, index) => (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`overflow-hidden ${phase.status === "active" ? "ring-2 ring-emerald-500/50" : ""}`}>
                  <CardHeader className="border-b bg-muted/30">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(phase.status)}
                        <div>
                          <Badge variant="outline" className="mb-1">
                            {isRtl ? phase.phaseAr : phase.phase}
                          </Badge>
                          <CardTitle className="text-xl">{isRtl ? phase.nameAr : phase.name}</CardTitle>
                        </div>
                      </div>
                      {getStatusBadge(phase.status)}
                    </div>
                    {phase.rule && (
                      <div className="mt-3 p-2 rounded bg-amber-500/10 border border-amber-500/20">
                        <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                          <Shield className="w-4 h-4 inline mr-1" />
                          {isRtl ? phase.ruleAr : phase.rule}
                        </p>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                        <h4 className="text-xs font-semibold text-blue-600 mb-2 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {isRtl ? "مرئي لـ" : "Visible To"}
                        </h4>
                        <ul className="space-y-1">
                          {(isRtl ? phase.visibleToAr : phase.visibleTo).map((v, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                              <CheckCircle2 className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                              {v}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                        <h4 className="text-xs font-semibold text-emerald-600 mb-2 flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {isRtl ? "المحتوى المرئي" : "Content Visible"}
                        </h4>
                        <ul className="space-y-1">
                          {(isRtl ? phase.contentVisibleAr : phase.contentVisible).map((c, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                              <FileText className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {phase.hiddenContent.length > 0 && (
                        <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                          <h4 className="text-xs font-semibold text-red-600 mb-2 flex items-center gap-1">
                            <EyeOff className="w-3 h-3" />
                            {isRtl ? "المحتوى المخفي" : "Hidden Content"}
                          </h4>
                          <ul className="space-y-1">
                            {(isRtl ? phase.hiddenContentAr : phase.hiddenContent).map((h, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                                <Lock className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                                {h}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                        <h4 className="text-xs font-semibold text-purple-600 mb-2 flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {isRtl ? "الغرض" : "Purpose"}
                        </h4>
                        <ul className="space-y-1">
                          {(isRtl ? phase.purposeAr : phase.purpose).map((p, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                              <CheckCircle2 className="w-3 h-3 text-purple-500 mt-0.5 flex-shrink-0" />
                              {p}
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
      </div>
    </div>
  );
}
