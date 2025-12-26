import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  User, 
  Download,
  Quote,
  BookOpen,
} from "lucide-react";
import { founderNarrative } from "@/lib/sovereign-completion-data";

export default function FounderNarrative() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Badge variant="outline" className="px-4 py-2 border-indigo-500/50 bg-indigo-500/10">
            <User className="w-4 h-4 mr-2 text-indigo-400" />
            <span className="text-indigo-400 font-medium">
              {isRtl ? "سرد المؤسس / القيادة" : "Founder / Leadership Narrative"}
            </span>
          </Badge>
          <Button variant="outline" className="gap-2" data-testid="button-download-founder">
            <Download className="w-4 h-4" />
            {isRtl ? "تحميل PDF" : "Download PDF"}
          </Button>
        </div>

        <section className="mb-10">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-violet-700 text-white py-10">
              <div className="text-center">
                <CardTitle className="text-3xl font-bold mb-4">
                  {isRtl ? founderNarrative.shortVersion.titleAr : founderNarrative.shortVersion.title}
                </CardTitle>
                <CardDescription className="text-white/80 max-w-3xl mx-auto text-lg leading-relaxed">
                  {isRtl ? founderNarrative.shortVersion.contentAr : founderNarrative.shortVersion.content}
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-6 h-6 text-indigo-500" />
            <h2 className="text-2xl font-bold">
              {isRtl ? founderNarrative.longVersion.titleAr : founderNarrative.longVersion.title}
            </h2>
          </div>
          <div className="space-y-6">
            {founderNarrative.longVersion.sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-indigo-700 dark:text-indigo-400">
                      {isRtl ? section.headingAr : section.heading}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {isRtl ? section.contentAr : section.content}
                    </p>
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
