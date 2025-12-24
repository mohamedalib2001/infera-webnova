import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  Building2, 
  Download,
  Shield,
  Clock,
  AlertTriangle,
  Lock,
  FileWarning,
  CheckCircle2,
} from "lucide-react";
import { boardDocuments, boardDocumentMeta } from "@/lib/board-documents-data";

const documentIcons: Record<string, typeof Shield> = {
  "strategic-overview": Building2,
  "time-dominance-board": Clock,
  "crisis-playbook-board": AlertTriangle,
  "irreplaceability-board": Lock,
  "red-line-commitment": FileWarning,
};

export default function BoardDocuments() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Badge variant="outline" className="px-4 py-2 border-amber-500/50 bg-amber-500/10">
            <Building2 className="w-4 h-4 mr-2 text-amber-400" />
            <span className="text-amber-400 font-medium">
              {isRtl ? "وثائق مستوى مجلس الإدارة" : "Board-Level Documents"}
            </span>
          </Badge>
          <Button variant="outline" className="gap-2" data-testid="button-download-board-docs">
            <Download className="w-4 h-4" />
            {isRtl ? "تحميل جميع الوثائق" : "Download All Documents"}
          </Button>
        </div>

        <section className="mb-10">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-amber-700 to-amber-900 text-white py-10">
              <div className="text-center">
                <Badge className="mb-4 bg-white/20 text-white border-white/30">
                  {isRtl ? "سري - مجلس الإدارة فقط" : "BOARD CONFIDENTIAL"}
                </Badge>
                <CardTitle className="text-3xl font-bold mb-4">
                  {isRtl ? boardDocumentMeta.titleAr : boardDocumentMeta.title}
                </CardTitle>
                <CardDescription className="text-white/90 max-w-3xl mx-auto text-lg">
                  {isRtl ? boardDocumentMeta.purposeAr : boardDocumentMeta.purpose}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center mb-4">
                <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                  {isRtl ? boardDocumentMeta.disclaimerAr : boardDocumentMeta.disclaimer}
                </p>
              </div>
              <div className="flex justify-center gap-4 flex-wrap">
                {(isRtl ? boardDocumentMeta.restrictionsAr : boardDocumentMeta.restrictions).map((r, i) => (
                  <Badge key={i} variant="outline" className="border-red-500/30 text-red-600">
                    {r}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <Tabs defaultValue="strategic-overview" className="space-y-6">
          <TabsList className="w-full flex-wrap h-auto gap-2 bg-transparent p-0">
            {boardDocuments.map((doc) => {
              const Icon = documentIcons[doc.id] || Building2;
              return (
                <TabsTrigger
                  key={doc.id}
                  value={doc.id}
                  className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-700 dark:data-[state=active]:text-amber-400 border border-border"
                  data-testid={`tab-${doc.id}`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">{isRtl ? doc.titleAr : doc.title}</span>
                  <span className="sm:hidden">{(isRtl ? doc.titleAr : doc.title).split(" – ")[0]}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {boardDocuments.map((doc) => {
            const Icon = documentIcons[doc.id] || Building2;
            return (
              <TabsContent key={doc.id} value={doc.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardHeader className="border-b bg-muted/30">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center">
                            <Icon className="w-7 h-7 text-amber-600" />
                          </div>
                          <div>
                            <CardTitle className="text-2xl">{isRtl ? doc.titleAr : doc.title}</CardTitle>
                            <CardDescription className="text-base mt-1">
                              {isRtl ? doc.subtitleAr : doc.subtitle}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className="border-red-500/50 text-red-600 shrink-0">
                          {isRtl ? doc.confidentialityAr : doc.confidentiality}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-8">
                      {doc.sections.map((section, sIndex) => (
                        <motion.div
                          key={sIndex}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: sIndex * 0.1 }}
                        >
                          <h3 className="text-lg font-semibold mb-4 text-amber-700 dark:text-amber-400 border-b pb-2">
                            {isRtl ? section.headingAr : section.heading}
                          </h3>
                          <ul className="space-y-3">
                            {(isRtl ? section.contentAr : section.content).map((item, iIndex) => (
                              <li key={iIndex} className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                                <span className="text-muted-foreground leading-relaxed">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      ))}

                      {doc.keyDecisions && doc.keyDecisions.length > 0 && (
                        <div className="p-6 rounded-lg bg-amber-500/10 border border-amber-500/20">
                          <h4 className="font-semibold text-amber-700 dark:text-amber-400 mb-4">
                            {isRtl ? "قرارات رئيسية للمجلس" : "Key Board Decisions"}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {doc.keyDecisions.map((kd, kdIndex) => (
                              <Badge key={kdIndex} variant="secondary" className="text-sm py-1.5">
                                {isRtl ? kd.decisionAr : kd.decision}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end pt-4 border-t">
                        <Button variant="outline" className="gap-2" data-testid={`button-download-${doc.id}`}>
                          <Download className="w-4 h-4" />
                          {isRtl ? "تحميل هذه الوثيقة" : "Download This Document"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
}
