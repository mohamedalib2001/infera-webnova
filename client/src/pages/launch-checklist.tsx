import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  ClipboardCheck, 
  CheckCircle2,
  Circle,
  Target,
  Lock,
  Unlock,
  Clock,
  AlertTriangle,
  Calendar,
  Shield,
} from "lucide-react";
import { launchPhases, launchPrinciple, finalRule, checklistMeta } from "@/lib/launch-checklist-data";

export default function LaunchChecklist() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case "active": return <Clock className="w-5 h-5 text-amber-500" />;
      case "upcoming": return <Unlock className="w-5 h-5 text-blue-500" />;
      case "locked": return <Lock className="w-5 h-5 text-slate-500" />;
      default: return <Lock className="w-5 h-5 text-slate-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">{isRtl ? "مكتمل" : "Completed"}</Badge>;
      case "active":
        return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">{isRtl ? "نشط" : "Active"}</Badge>;
      case "upcoming":
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">{isRtl ? "قادم" : "Upcoming"}</Badge>;
      case "locked":
        return <Badge className="bg-slate-500/20 text-slate-600 border-slate-500/30">{isRtl ? "مقفل" : "Locked"}</Badge>;
      default:
        return null;
    }
  };

  const getPhaseColor = (status: string) => {
    switch (status) {
      case "completed": return "border-emerald-500/30";
      case "active": return "ring-2 ring-amber-500/50";
      case "upcoming": return "border-blue-500/30";
      default: return "border-slate-500/20 opacity-75";
    }
  };

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Badge variant="outline" className="px-4 py-2 border-orange-500/50 bg-orange-500/10">
            <ClipboardCheck className="w-4 h-4 mr-2 text-orange-400" />
            <span className="text-orange-400 font-medium">
              {isRtl ? checklistMeta.classificationAr : checklistMeta.classification}
            </span>
          </Badge>
        </div>

        <section className="mb-10">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-orange-700 to-red-900 text-white py-10">
              <div className="text-center">
                <div className="flex justify-center gap-2 mb-4">
                  <Badge className="bg-white/20 text-white border-white/30">
                    {isRtl ? checklistMeta.targetAr : checklistMeta.target}
                  </Badge>
                  <Badge className="bg-white/20 text-white border-white/30">
                    {isRtl ? checklistMeta.modeAr : checklistMeta.mode}
                  </Badge>
                </div>
                <CardTitle className="text-3xl font-bold mb-4">
                  {isRtl ? checklistMeta.titleAr : checklistMeta.title}
                </CardTitle>
              </div>
            </CardHeader>
          </Card>
        </section>

        <section className="mb-10">
          <Card className="overflow-hidden">
            <CardContent className="p-6 bg-slate-900 text-white">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">{isRtl ? launchPrinciple.titleAr : launchPrinciple.title}</h3>
                <p className="text-2xl font-semibold mb-1">{isRtl ? launchPrinciple.statementAr : launchPrinciple.statement}</p>
                <p className="text-white/70">{isRtl ? launchPrinciple.subStatementAr : launchPrinciple.subStatement}</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Calendar className="w-6 h-6 text-orange-500" />
            {isRtl ? "مراحل الإطلاق يوماً بيوم" : "Day-by-Day Launch Phases"}
          </h2>
          <div className="space-y-4">
            {launchPhases.map((phase, index) => (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`overflow-hidden ${getPhaseColor(phase.status)}`}>
                  <CardHeader className="border-b bg-muted/30 py-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(phase.status)}
                        <div>
                          <Badge variant="outline" className="mb-1 text-xs">
                            {isRtl ? phase.daysAr : phase.days}
                          </Badge>
                          <CardTitle className="text-lg">{isRtl ? phase.nameAr : phase.name}</CardTitle>
                        </div>
                      </div>
                      {getStatusBadge(phase.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="lg:col-span-2">
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                          <ClipboardCheck className="w-3 h-3" />
                          {isRtl ? "قائمة المهام" : "Task Checklist"}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {phase.items.map((item, i) => (
                            <div key={i} className="flex items-start gap-2 p-2 rounded bg-muted/30">
                              {item.completed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                              ) : (
                                <Circle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                              )}
                              <span className={`text-xs ${item.completed ? "line-through text-muted-foreground" : ""}`}>
                                {isRtl ? item.taskAr : item.task}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 h-fit">
                        <h4 className="text-xs font-semibold text-emerald-600 mb-2 flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {isRtl ? "شرط النجاح" : "Success Condition"}
                        </h4>
                        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                          {isRtl ? phase.successConditionAr : phase.successCondition}
                        </p>
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
            <CardHeader className="bg-red-600 text-white border-b">
              <CardTitle className="text-xl flex items-center justify-center gap-2">
                <Shield className="w-5 h-5" />
                {isRtl ? "القاعدة النهائية" : "Final Rule"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-red-600/95 text-white text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <AlertTriangle className="w-6 h-6 text-yellow-300" />
                <p className="text-xl font-semibold">{isRtl ? finalRule.conditionAr : finalRule.condition}</p>
              </div>
              <p className="text-2xl font-bold text-yellow-300">{isRtl ? finalRule.statementAr : finalRule.statement}</p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
