import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  Landmark, 
  Download,
  Shield,
  CheckCircle2,
  ArrowRight,
  Lock,
  Eye,
  FileSearch,
  Settings,
  MessageSquareQuote,
} from "lucide-react";
import { governmentConcerns, adoptionPhases, governmentKeyMessages, governanceRequirements } from "@/lib/strategic-adoption-data";

export default function GovernmentAdoption() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-4 py-2 border-blue-500/50 bg-blue-500/10">
              <Landmark className="w-4 h-4 mr-2 text-blue-400" />
              <span className="text-blue-400 font-medium">
                {isRtl ? "سرد تبني الحكومات" : "Government Adoption Narrative"}
              </span>
            </Badge>
          </div>
          <Button variant="outline" className="gap-2" data-testid="button-download-government">
            <Download className="w-4 h-4" />
            {isRtl ? "تحميل PDF" : "Download PDF"}
          </Button>
        </div>

        <section className="mb-10">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white py-10">
              <div className="text-center">
                <CardTitle className="text-3xl font-bold mb-4">
                  {isRtl ? "تمكين الحكومات من الثقة والتبني والسيطرة" : "Enabling Governments to Understand, Trust, and Adopt"}
                </CardTitle>
                <CardDescription className="text-white/80 max-w-2xl mx-auto text-lg">
                  {isRtl 
                    ? "INFERA توفر للكيانات الحكومية والسيادية السيادة الرقمية الكاملة بدون خوف من فقدان السيطرة."
                    : "INFERA provides government and sovereign entities complete digital sovereignty without fear of loss of control."}
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <MessageSquareQuote className="w-6 h-6 text-blue-500" />
            {isRtl ? "الرسائل الأساسية" : "Key Messages"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {governmentKeyMessages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg text-blue-700 dark:text-blue-400 mb-3">
                      {isRtl ? msg.messageAr : msg.message}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isRtl ? msg.explanationAr : msg.explanation}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-500" />
            {isRtl ? "معالجة مخاوف الحكومات الأساسية" : "Addressing Core Government Concerns"}
          </h2>
          <div className="space-y-4">
            {governmentConcerns.map((concern, index) => (
              <motion.div
                key={concern.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-red-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-red-700 dark:text-red-400 mb-2">
                          {isRtl ? concern.concernAr : concern.concern}
                        </h3>
                        <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span className="font-medium text-emerald-700 dark:text-emerald-400">
                              {isRtl ? "كيف تعالج INFERA هذا" : "How INFERA Addresses This"}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {isRtl ? concern.howAddressedAr : concern.howAddressed}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(isRtl ? concern.evidenceAr : concern.evidence).map((e, i) => (
                            <Badge key={i} variant="secondary">{e}</Badge>
                          ))}
                        </div>
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
            <ArrowRight className="w-6 h-6 text-blue-500" />
            {isRtl ? "مراحل التبني" : "Adoption Phases"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {adoptionPhases.map((phase, index) => (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <Badge className="w-fit mb-2">{phase.phase} - {phase.phaseAr}</Badge>
                    <CardTitle className="text-lg">{isRtl ? phase.nameAr : phase.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {isRtl ? phase.durationAr : phase.duration}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <p className="text-sm text-muted-foreground mb-4">
                      {isRtl ? phase.descriptionAr : phase.description}
                    </p>
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                          {isRtl ? "الأهداف" : "Objectives"}
                        </h4>
                        <ul className="space-y-1">
                          {(isRtl ? phase.objectivesAr : phase.objectives).map((obj, i) => (
                            <li key={i} className="text-xs flex items-start gap-2">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                              <span>{obj}</span>
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
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Settings className="w-6 h-6 text-blue-500" />
            {isRtl ? "متطلبات الحوكمة" : "Governance Requirements"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {governanceRequirements.map((req, index) => {
              const icons = [Lock, Shield, Eye, FileSearch];
              const Icon = icons[index] || Lock;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover-elevate">
                    <CardContent className="p-6 text-center">
                      <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-7 h-7 text-blue-500" />
                      </div>
                      <h3 className="font-semibold mb-2">{isRtl ? req.requirementAr : req.requirement}</h3>
                      <p className="text-sm text-muted-foreground">{isRtl ? req.descriptionAr : req.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
