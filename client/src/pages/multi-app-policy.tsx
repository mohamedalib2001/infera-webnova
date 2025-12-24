import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  Smartphone, 
  Monitor,
  Tablet,
  RefreshCw,
  Ban,
  Shield,
  Layers,
} from "lucide-react";
import { 
  multiAppPolicyIntro,
  multiAppPolicySections,
  multiAppPolicyClosing,
  multiAppPolicyMeta,
  multiAppPlatformTypes
} from "@/lib/multi-app-policy-data";

export default function MultiAppPolicy() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const getSectionIcon = (sectionId: string) => {
    switch (sectionId) {
      case "prohibited":
        return <Ban className="w-4 h-4 text-red-500" />;
      case "sync":
        return <RefreshCw className="w-4 h-4 text-green-500" />;
      case "auto-generation":
        return <Layers className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getPlatformIcon = (icon: string) => {
    switch (icon) {
      case "smartphone":
        return <Smartphone className="w-5 h-5" />;
      case "monitor":
        return <Monitor className="w-5 h-5" />;
      case "tablet":
        return <Tablet className="w-5 h-5" />;
      default:
        return <Smartphone className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <section className="mb-10">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <Badge className="mb-4 bg-white/10 text-white border-white/20">
                  <Smartphone className="w-4 h-4 mr-2" />
                  {isRtl ? multiAppPolicyMeta.subtitleAr : multiAppPolicyMeta.subtitle}
                </Badge>
                <CardTitle className="text-3xl font-bold mb-4">
                  {isRtl ? multiAppPolicyMeta.titleAr : multiAppPolicyMeta.title}
                </CardTitle>
                <p className="text-sm text-white/60">
                  {isRtl ? `آخر تحديث: ${multiAppPolicyIntro.lastUpdatedAr}` : `Last Updated: ${multiAppPolicyIntro.lastUpdated}`}
                </p>
                <div className="flex justify-center gap-3 mt-6">
                  <Badge variant="secondary" className="bg-white/20">
                    <Smartphone className="w-3 h-3 mr-1" /> Mobile
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20">
                    <Monitor className="w-3 h-3 mr-1" /> Desktop
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20">
                    <Tablet className="w-3 h-3 mr-1" /> Tablet
                  </Badge>
                </div>
              </motion.div>
            </CardHeader>
          </Card>
        </section>

        <section className="mb-10">
          <Card className="border-blue-500/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Shield className="w-8 h-8 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-lg font-semibold mb-2">
                    {isRtl ? multiAppPolicyIntro.statementAr : multiAppPolicyIntro.statement}
                  </p>
                  <p className="text-destructive font-medium text-sm">
                    {isRtl ? multiAppPolicyIntro.warningAr : multiAppPolicyIntro.warning}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-10">
          <Card className="bg-muted/30">
            <CardHeader className="border-b py-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-500" />
                {isRtl ? multiAppPlatformTypes.titleAr : multiAppPlatformTypes.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {multiAppPlatformTypes.platforms.map((platform, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 rounded-md bg-background border">
                    <span className="text-blue-500">
                      {getPlatformIcon(platform.icon)}
                    </span>
                    <span className="text-sm font-medium">
                      {isRtl ? platform.nameAr : platform.name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4 mb-10">
          {multiAppPolicySections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={section.id === "prohibited" ? "border-red-500/30" : section.id === "sync" ? "border-green-500/30" : ""}>
                <CardHeader className="border-b bg-muted/30 py-3">
                  <CardTitle className="text-lg flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      section.id === "prohibited" ? "bg-red-500/10 text-red-600" : 
                      section.id === "sync" ? "bg-green-500/10 text-green-600" :
                      "bg-blue-500/10 text-blue-600"
                    }`}>
                      {section.number}
                    </span>
                    {isRtl ? section.titleAr : section.title}
                    {getSectionIcon(section.id)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ul className="space-y-2">
                    {(isRtl ? section.contentAr : section.content).map((item, i) => (
                      <li key={i} className={`text-sm ${
                        section.id === "prohibited" && i > 0 ? "text-red-500 font-medium" :
                        "text-muted-foreground"
                      }`}>
                        {section.id === "prohibited" && i > 0 ? (
                          <span className="flex items-center gap-2">
                            <Ban className="w-3 h-3" />
                            {item}
                          </span>
                        ) : item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </section>

        <section>
          <Card className="overflow-hidden">
            <CardContent className="p-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center">
              <div className="flex justify-center gap-3 mb-4">
                <Smartphone className="w-6 h-6 text-blue-200" />
                <Monitor className="w-6 h-6 text-blue-200" />
                <Tablet className="w-6 h-6 text-blue-200" />
              </div>
              <p className="text-lg font-medium mb-3">
                {isRtl ? multiAppPolicyClosing.statementAr : multiAppPolicyClosing.statement}
              </p>
              <p className="text-xl font-bold text-blue-200">
                {isRtl ? multiAppPolicyClosing.principleAr : multiAppPolicyClosing.principle}
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
