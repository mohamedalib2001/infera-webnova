import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  Landmark, 
  Download,
  Shield,
  Clock,
  AlertTriangle,
  Lock,
  Settings,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { governmentSections, governmentPackMeta, adoptionPhases } from "@/lib/government-pack-data";

const sectionIcons: Record<string, typeof Shield> = {
  "sovereign-purpose": Landmark,
  "time-dominance-gov": Clock,
  "crisis-resilience-gov": AlertTriangle,
  "irreplaceability-national": Lock,
  "governance-control": Settings,
};

export default function GovernmentPack() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Badge variant="outline" className="px-4 py-2 border-emerald-500/50 bg-emerald-500/10">
            <Landmark className="w-4 h-4 mr-2 text-emerald-400" />
            <span className="text-emerald-400 font-medium">
              {isRtl ? "الحزمة الحكومية السرية" : "Government Confidential Pack"}
            </span>
          </Badge>
          <Button variant="outline" className="gap-2" data-testid="button-download-gov-pack">
            <Download className="w-4 h-4" />
            {isRtl ? "تحميل الحزمة" : "Download Pack"}
          </Button>
        </div>

        <section className="mb-10">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-700 to-emerald-900 text-white py-10">
              <div className="text-center">
                <Badge className="mb-4 bg-red-500/80 text-white border-red-400">
                  {isRtl ? governmentPackMeta.classificationAr : governmentPackMeta.classification}
                </Badge>
                <CardTitle className="text-3xl font-bold mb-4">
                  {isRtl ? governmentPackMeta.titleAr : governmentPackMeta.title}
                </CardTitle>
                <CardDescription className="text-white/90 max-w-3xl mx-auto text-lg">
                  {isRtl 
                    ? "تغليف INFERA كبنية تحتية رقمية سيادية مناسبة للتبني الحكومي بدون فقدان السيطرة"
                    : "Packaging INFERA as sovereign digital infrastructure suitable for government adoption without loss of control"}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {governmentPackMeta.targetAudience.map((ta, index) => (
                  <div key={index} className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                      {isRtl ? ta.audienceAr : ta.audience}
                    </span>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-lg bg-slate-500/10 border border-slate-500/20 text-center mb-4">
                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium italic">
                  "{isRtl ? governmentPackMeta.principleAr : governmentPackMeta.principle}"
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                  <h4 className="text-xs font-semibold text-red-600 mb-2">{isRtl ? "القيود" : "Restrictions"}</h4>
                  <div className="flex flex-wrap gap-1">
                    {(isRtl ? governmentPackMeta.restrictionsAr : governmentPackMeta.restrictions).map((r, i) => (
                      <Badge key={i} variant="outline" className="text-xs border-red-500/30 text-red-600">
                        {r}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <h4 className="text-xs font-semibold text-emerald-600 mb-2">{isRtl ? "نبرة الوثيقة" : "Document Tone"}</h4>
                  <div className="flex flex-wrap gap-1">
                    {(isRtl ? governmentPackMeta.toneGuidelinesAr : governmentPackMeta.toneGuidelines).map((t, i) => (
                      <Badge key={i} variant="outline" className="text-xs border-emerald-500/30 text-emerald-600">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <Tabs defaultValue="sovereign-purpose" className="space-y-6">
          <TabsList className="w-full flex-wrap h-auto gap-2 bg-transparent p-0">
            {governmentSections.map((section) => {
              const Icon = sectionIcons[section.id] || Landmark;
              return (
                <TabsTrigger
                  key={section.id}
                  value={section.id}
                  className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 border border-border"
                  data-testid={`tab-gov-${section.id}`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  <span className="hidden md:inline">{isRtl ? section.titleAr : section.title}</span>
                  <span className="md:hidden">{(isRtl ? section.titleAr : section.title).split(" – ")[0].substring(0, 12)}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {governmentSections.map((section) => {
            const Icon = sectionIcons[section.id] || Landmark;
            return (
              <TabsContent key={section.id} value={section.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardHeader className="border-b bg-muted/30">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                            <Icon className="w-7 h-7 text-emerald-600" />
                          </div>
                          <div>
                            <CardTitle className="text-2xl">{isRtl ? section.titleAr : section.title}</CardTitle>
                            <CardDescription className="text-base mt-1">
                              {isRtl ? section.subtitleAr : section.subtitle}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className="border-red-500/50 text-red-600 shrink-0">
                          {isRtl ? section.classificationAr : section.classification}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-8">
                      {section.content.map((contentBlock, cIndex) => (
                        <motion.div
                          key={cIndex}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: cIndex * 0.1 }}
                        >
                          <h3 className="text-lg font-semibold mb-4 text-emerald-700 dark:text-emerald-400 border-b pb-2">
                            {isRtl ? contentBlock.headingAr : contentBlock.heading}
                          </h3>
                          <ul className="space-y-3">
                            {(isRtl ? contentBlock.pointsAr : contentBlock.points).map((point, pIndex) => (
                              <li key={pIndex} className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                <span className="text-muted-foreground leading-relaxed">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      ))}

                      {section.assurances && section.assurances.length > 0 && (
                        <div className="p-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <h4 className="font-semibold text-emerald-700 dark:text-emerald-400 mb-4">
                            {isRtl ? "ضمانات رئيسية" : "Key Assurances"}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {section.assurances.map((a, aIndex) => (
                              <Badge key={aIndex} variant="secondary" className="text-sm py-1.5">
                                <Shield className="w-3 h-3 mr-1" />
                                {isRtl ? a.assuranceAr : a.assurance}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            );
          })}
        </Tabs>

        <section className="mt-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <ArrowRight className="w-6 h-6 text-emerald-500" />
            {isRtl ? "مراحل التبني" : "Adoption Phases"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {adoptionPhases.map((phase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-emerald-600 border-emerald-500/50">
                        {isRtl ? phase.durationAr : phase.duration}
                      </Badge>
                      <span className="text-2xl font-bold text-emerald-500">{index + 1}</span>
                    </div>
                    <CardTitle className="text-base mt-2">{isRtl ? phase.phaseAr : phase.phase}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {(isRtl ? phase.activitiesAr : phase.activities).map((activity, aIndex) => (
                        <li key={aIndex} className="text-xs flex items-start gap-2">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{activity}</span>
                        </li>
                      ))}
                    </ul>
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
