import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  FileText, 
  Download,
  ArrowRight,
  Cpu,
  DollarSign,
  Users,
  Shield,
  GraduationCap,
  Briefcase,
  Building2,
  Globe2,
  Brain,
  Lock,
  Smartphone,
  FileSearch,
  Hotel,
  Target,
  Sparkles,
} from "lucide-react";
import { inferaPlatforms } from "@/lib/pitch-deck-data";

const platformIcons: Record<string, typeof Cpu> = {
  "webnova": Cpu,
  "engine-control": Building2,
  "engine": Cpu,
  "finance": DollarSign,
  "humaniq": Users,
  "legal": FileText,
  "appforge": Sparkles,
  "marketing": Target,
  "marketplace": Building2,
  "education": GraduationCap,
  "attend": Users,
  "smartdocs": FileSearch,
  "hospitality": Hotel,
  "smartmemory": Brain,
  "visionfeasibility": Target,
  "cvbuilder": FileText,
  "jobsai": Briefcase,
  "trainai": GraduationCap,
  "sovereignfinance": DollarSign,
  "globalcloud": Globe2,
  "shieldgrid": Shield,
  "smartremote": Smartphone,
};

const platformColors: Record<string, string> = {
  "webnova": "from-indigo-600 to-purple-700",
  "engine-control": "from-amber-600 to-violet-700",
  "engine": "from-blue-600 to-indigo-700",
  "finance": "from-emerald-600 to-green-700",
  "humaniq": "from-rose-600 to-pink-700",
  "legal": "from-slate-600 to-gray-700",
  "appforge": "from-orange-600 to-red-700",
  "marketing": "from-pink-600 to-rose-700",
  "marketplace": "from-teal-600 to-cyan-700",
  "education": "from-violet-600 to-purple-700",
  "attend": "from-cyan-600 to-blue-700",
  "smartdocs": "from-sky-600 to-blue-700",
  "hospitality": "from-amber-600 to-orange-700",
  "smartmemory": "from-purple-600 to-violet-700",
  "visionfeasibility": "from-lime-600 to-green-700",
  "cvbuilder": "from-indigo-600 to-blue-700",
  "jobsai": "from-green-600 to-emerald-700",
  "trainai": "from-yellow-600 to-amber-700",
  "sovereignfinance": "from-emerald-600 to-teal-700",
  "globalcloud": "from-blue-600 to-cyan-700",
  "shieldgrid": "from-slate-600 to-zinc-700",
  "smartremote": "from-purple-600 to-violet-700",
};

export default function ExecutiveSummaries() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-4 py-2 border-indigo-500/50 bg-indigo-500/10">
              <FileText className="w-4 h-4 mr-2 text-indigo-400" />
              <span className="text-indigo-400 font-medium">
                {isRtl ? "الملخصات التنفيذية" : "Executive Summaries"}
              </span>
            </Badge>
            <span className="text-muted-foreground">
              {isRtl ? `${inferaPlatforms.length} منصة` : `${inferaPlatforms.length} Platforms`}
            </span>
          </div>
          <Button variant="outline" className="gap-2" data-testid="button-download-all">
            <Download className="w-4 h-4" />
            {isRtl ? "تحميل الكل PDF" : "Download All PDF"}
          </Button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            {isRtl ? "الملخصات التنفيذية لمنظومة INFERA" : "INFERA Ecosystem Executive Summaries"}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {isRtl 
              ? "ملخص تنفيذي شامل لكل منصة في منظومة INFERA السيادية، يتضمن نظرة عامة والميزات الرئيسية والسوق المستهدف والميزة التنافسية."
              : "Comprehensive executive summary for each platform in the INFERA sovereign ecosystem, including overview, key features, target market, and competitive advantage."
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inferaPlatforms.map((platform, index) => {
            const Icon = platformIcons[platform.id] || Cpu;
            const gradient = platformColors[platform.id] || "from-indigo-600 to-purple-700";
            
            return (
              <motion.div
                key={platform.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full hover-elevate cursor-pointer group overflow-hidden">
                  <CardHeader className={`bg-gradient-to-r ${gradient} text-white`}>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white/20">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {isRtl ? platform.nameAr : platform.name}
                        </CardTitle>
                        <CardDescription className="text-white/80 text-sm">
                          {isRtl ? platform.taglineAr : platform.tagline}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        {isRtl ? "نظرة عامة" : "Overview"}
                      </h4>
                      <p className="text-sm line-clamp-2">
                        {isRtl ? platform.executiveSummary.overviewAr : platform.executiveSummary.overview}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        {isRtl ? "الميزات الرئيسية" : "Key Features"}
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {(isRtl ? platform.executiveSummary.keyFeaturesAr : platform.executiveSummary.keyFeatures).slice(0, 3).map((feature, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <Link href={platform.route}>
                        <Button variant="ghost" size="sm" className="gap-1" data-testid={`button-view-pitch-${platform.id}`}>
                          {isRtl ? "عرض العرض" : "View Pitch"}
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" className="gap-1" data-testid={`button-download-summary-${platform.id}`}>
                        <Download className="w-4 h-4" />
                        PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
