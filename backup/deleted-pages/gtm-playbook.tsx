import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  Rocket, 
  Download,
  Building2,
  Landmark,
  Users,
  Target,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { gtmTracks, strategicCustomers } from "@/lib/sovereign-completion-data";

const trackIcons = [Building2, Landmark, Users];

export default function GTMPlaybook() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Badge variant="outline" className="px-4 py-2 border-orange-500/50 bg-orange-500/10">
            <Rocket className="w-4 h-4 mr-2 text-orange-400" />
            <span className="text-orange-400 font-medium">
              {isRtl ? "دليل الذهاب للسوق السيادي" : "Go-To-Market Sovereign Playbook"}
            </span>
          </Badge>
          <Button variant="outline" className="gap-2" data-testid="button-download-gtm">
            <Download className="w-4 h-4" />
            {isRtl ? "تحميل PDF" : "Download PDF"}
          </Button>
        </div>

        <section className="mb-10">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-orange-600 to-amber-700 text-white py-10">
              <div className="text-center">
                <CardTitle className="text-3xl font-bold mb-4">
                  {isRtl ? "كيف تدخل INFERA الأسواق بدون فقدان السيطرة" : "How INFERA Enters Markets Without Losing Control"}
                </CardTitle>
                <CardDescription className="text-white/80 max-w-2xl mx-auto text-lg">
                  {isRtl 
                    ? "ثلاث مسارات استراتيجية للذهاب للسوق"
                    : "Three Strategic Go-To-Market Tracks"}
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <ArrowRight className="w-6 h-6 text-orange-500" />
            {isRtl ? "مسارات الذهاب للسوق" : "Go-To-Market Tracks"}
          </h2>
          <div className="space-y-6">
            {gtmTracks.map((track, index) => {
              const Icon = trackIcons[index];
              return (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardHeader className="bg-slate-100 dark:bg-slate-800/50 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-orange-500" />
                        </div>
                        <div>
                          <Badge className="mb-1">Track {index + 1}</Badge>
                          <CardTitle className="text-xl">{isRtl ? track.nameAr : track.name}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/20">
                          <h4 className="font-medium text-orange-700 dark:text-orange-400 mb-2">
                            {isRtl ? "الهدف" : "Target"}
                          </h4>
                          <p className="text-sm text-muted-foreground">{isRtl ? track.targetAr : track.target}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                          <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2">
                            {isRtl ? "الدخول" : "Entry"}
                          </h4>
                          <p className="text-sm text-muted-foreground">{isRtl ? track.entryAr : track.entry}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                          <h4 className="font-medium text-emerald-700 dark:text-emerald-400 mb-2">
                            {isRtl ? "الاستراتيجية" : "Strategy"}
                          </h4>
                          <p className="text-sm text-muted-foreground">{isRtl ? track.strategyAr : track.strategy}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-3">{isRtl ? "الأنشطة الرئيسية" : "Key Activities"}</h4>
                          <ul className="space-y-2">
                            {(isRtl ? track.keyActivitiesAr : track.keyActivities).map((a, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <span className="w-5 h-5 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0 text-xs text-orange-600">{i + 1}</span>
                                <span>{a}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-3">{isRtl ? "مقاييس النجاح" : "Success Metrics"}</h4>
                          <div className="space-y-2">
                            {(isRtl ? track.successMetricsAr : track.successMetrics).map((m, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span className="text-sm">{m}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Target className="w-6 h-6 text-orange-500" />
            {isRtl ? "أول 5 عملاء استراتيجيين" : "First 5 Strategic Customer Profiles"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {strategicCustomers.map((customer, index) => (
              <motion.div
                key={customer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover-elevate">
                  <CardHeader className="pb-2">
                    <Badge className="w-fit mb-2">#{customer.id}</Badge>
                    <CardTitle className="text-lg">{isRtl ? customer.profileAr : customer.profile}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-1">
                      {(isRtl ? customer.characteristicsAr : customer.characteristics).map((c, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{c}</Badge>
                      ))}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-orange-600">{isRtl ? "منصة الدخول:" : "Entry:"}</span>{" "}
                        {isRtl ? customer.entryPlatformAr : customer.entryPlatform}
                      </div>
                      <div>
                        <span className="font-medium text-emerald-600">{isRtl ? "مسار التوسع:" : "Expansion:"}</span>{" "}
                        {isRtl ? customer.expansionPathAr : customer.expansionPath}
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
