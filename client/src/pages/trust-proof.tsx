import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Download,
  Lock,
  Eye,
  FileSearch,
  AlertTriangle,
  Settings,
  CheckCircle2,
} from "lucide-react";
import { trustArtifacts } from "@/lib/sovereign-completion-data";

const artifactIcons = [Settings, Lock, Eye, FileSearch, AlertTriangle];

export default function TrustProof() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Badge variant="outline" className="px-4 py-2 border-cyan-500/50 bg-cyan-500/10">
            <ShieldCheck className="w-4 h-4 mr-2 text-cyan-400" />
            <span className="text-cyan-400 font-medium">
              {isRtl ? "طبقة إثبات الثقة" : "Trust Proof Layer"}
            </span>
          </Badge>
          <Button variant="outline" className="gap-2" data-testid="button-download-trust">
            <Download className="w-4 h-4" />
            {isRtl ? "تحميل PDF" : "Download PDF"}
          </Button>
        </div>

        <section className="mb-10">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white py-10">
              <div className="text-center">
                <CardTitle className="text-3xl font-bold mb-4">
                  {isRtl ? "استبدال ادعاءات الثقة بإثبات هيكلي للثقة" : "Replace Trust Claims with Structured Trust Proof"}
                </CardTitle>
                <CardDescription className="text-white/80 max-w-2xl mx-auto text-lg">
                  {isRtl 
                    ? "لا لغة تسويقية. فقط هيكل ونية وآليات تحكم."
                    : "No marketing language. Only structure, intent, and control mechanisms."}
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </section>

        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trustArtifacts.map((artifact, index) => {
              const Icon = artifactIcons[index];
              return (
                <motion.div
                  key={artifact.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-cyan-500" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{isRtl ? artifact.nameAr : artifact.name}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{isRtl ? artifact.descriptionAr : artifact.description}</p>
                      <div className="space-y-2">
                        {(isRtl ? artifact.elementsAr : artifact.elements).map((el, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{el}</span>
                          </div>
                        ))}
                      </div>
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
