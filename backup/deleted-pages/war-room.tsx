import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  Shield, 
  AlertTriangle,
  User,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Power,
  PowerOff,
  Users,
  Workflow,
  MessageSquareOff,
  Lock,
} from "lucide-react";
import { 
  warRoomPurpose, 
  activationConditions, 
  warRoomMembers, 
  compositionRule,
  decisionFlow,
  communicationRules,
  failureRule,
  warRoomMeta 
} from "@/lib/war-room-data";

export default function WarRoom() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Badge variant="outline" className="px-4 py-2 border-red-600/50 bg-red-600/10">
            <Shield className="w-4 h-4 mr-2 text-red-500" />
            <span className="text-red-500 font-medium">
              {isRtl ? warRoomMeta.classificationAr : warRoomMeta.classification}
            </span>
          </Badge>
        </div>

        <section className="mb-10">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-900 to-red-900 text-white py-10">
              <div className="text-center">
                <div className="flex justify-center gap-2 mb-4">
                  <Badge className="bg-white/20 text-white border-white/30">
                    {isRtl ? warRoomMeta.targetAr : warRoomMeta.target}
                  </Badge>
                  <Badge className="bg-red-500/30 text-white border-red-500/50">
                    {isRtl ? warRoomMeta.modeAr : warRoomMeta.mode}
                  </Badge>
                </div>
                <CardTitle className="text-3xl font-bold mb-4">
                  {isRtl ? warRoomMeta.titleAr : warRoomMeta.title}
                </CardTitle>
              </div>
            </CardHeader>
          </Card>
        </section>

        <section className="mb-10">
          <Card className="overflow-hidden">
            <CardContent className="p-6 bg-slate-900 text-white">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-3">{isRtl ? warRoomPurpose.titleAr : warRoomPurpose.title}</h3>
                <p className="text-lg mb-2">{isRtl ? warRoomPurpose.statementAr : warRoomPurpose.statement}</p>
                <p className="text-white/70">{isRtl ? warRoomPurpose.activationConditionAr : warRoomPurpose.activationCondition}</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Power className="w-6 h-6 text-emerald-500" />
            {isRtl ? "شروط التفعيل" : "Activation Conditions"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="overflow-hidden">
              <CardHeader className="bg-emerald-500/10 border-b border-emerald-500/20 py-3">
                <CardTitle className="text-lg text-emerald-600 flex items-center gap-2">
                  <Power className="w-5 h-5" />
                  {isRtl ? activationConditions.activate.titleAr : activationConditions.activate.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ul className="space-y-2">
                  {activationConditions.activate.conditions.map((c, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{isRtl ? c.conditionAr : c.condition}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="bg-red-500/10 border-b border-red-500/20 py-3">
                <CardTitle className="text-lg text-red-600 flex items-center gap-2">
                  <PowerOff className="w-5 h-5" />
                  {isRtl ? activationConditions.deactivate.titleAr : activationConditions.deactivate.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ul className="space-y-2">
                  {activationConditions.deactivate.conditions.map((c, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{isRtl ? c.conditionAr : c.condition}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Users className="w-6 h-6 text-purple-500" />
            {isRtl ? "تشكيل غرفة القيادة" : "War Room Composition"}
          </h2>
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-semibold text-emerald-600 mb-3">{isRtl ? "أعضاء إلزاميون" : "Mandatory Members"}</h4>
                  <div className="space-y-2">
                    {warRoomMembers.filter(m => m.type === "mandatory").map((member, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-3"
                      >
                        <User className="w-4 h-4 text-emerald-500" />
                        <div>
                          <span className="text-sm font-medium">{isRtl ? member.roleAr : member.role}</span>
                          {member.note && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {isRtl ? member.noteAr : member.note}
                            </Badge>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-amber-600 mb-3">{isRtl ? "اختياريون (بدعوة فقط)" : "Optional (By Invite Only)"}</h4>
                  <div className="space-y-2">
                    {warRoomMembers.filter(m => m.type === "optional").map((member, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 flex items-center gap-3"
                      >
                        <User className="w-4 h-4 text-amber-500" />
                        <div>
                          <span className="text-sm font-medium">{isRtl ? member.roleAr : member.role}</span>
                          {member.note && (
                            <Badge variant="outline" className="ml-2 text-xs border-amber-500/30 text-amber-600">
                              {isRtl ? member.noteAr : member.note}
                            </Badge>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
                <Lock className="w-5 h-5 text-red-500 mx-auto mb-1" />
                <p className="font-semibold text-red-600">
                  {isRtl ? compositionRule.ruleAr : compositionRule.rule}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Workflow className="w-6 h-6 text-blue-500" />
            {isRtl ? "تدفق القرارات" : "Decision Flow"}
          </h2>
          <div className="space-y-3">
            {decisionFlow.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-1">{isRtl ? step.nameAr : step.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{isRtl ? step.descriptionAr : step.description}</p>
                        {step.substeps && (
                          <div className="flex flex-wrap gap-2">
                            {(isRtl ? step.substepsAr : step.substeps)?.map((sub, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                <ArrowRight className="w-3 h-3 mr-1" />
                                {sub}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <MessageSquareOff className="w-6 h-6 text-slate-500" />
            {isRtl ? communicationRules.titleAr : communicationRules.title}
          </h2>
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {communicationRules.rules.map((rule, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-500/5 border border-slate-500/20 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-slate-500" />
                    <span className="text-sm">{isRtl ? rule.ruleAr : rule.rule}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="overflow-hidden">
            <CardHeader className="bg-red-600 text-white border-b py-4">
              <CardTitle className="text-xl flex items-center justify-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                {isRtl ? failureRule.titleAr : failureRule.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-red-600/95 text-white text-center">
              <p className="text-lg font-medium">
                {isRtl ? failureRule.statementAr : failureRule.statement}
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
