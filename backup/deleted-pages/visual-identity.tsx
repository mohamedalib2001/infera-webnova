import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  Palette, 
  Ban,
  Check,
  Hexagon,
  Eye,
  Sparkles,
} from "lucide-react";
import { 
  visualIdentityMeta,
  visualIdentityIntro,
  coreStyle,
  avoidStyles,
  visualRules,
  colorPalette,
  iconGuidelines,
  brandPersonality
} from "@/lib/visual-identity-data";

export default function VisualIdentity() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <section className="mb-10">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <Badge className="mb-4 bg-white/10 text-white border-white/20">
                  <Palette className="w-4 h-4 mr-2" />
                  {isRtl ? visualIdentityMeta.subtitleAr : visualIdentityMeta.subtitle}
                </Badge>
                <CardTitle className="text-3xl font-bold mb-4">
                  {isRtl ? visualIdentityMeta.titleAr : visualIdentityMeta.title}
                </CardTitle>
                <p className="text-sm text-white/70 max-w-xl mx-auto">
                  {isRtl ? visualIdentityIntro.statementAr : visualIdentityIntro.statement}
                </p>
              </motion.div>
            </CardHeader>
          </Card>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <Card className="border-green-500/30">
            <CardHeader className="border-b bg-green-500/5 py-3">
              <CardTitle className="text-base flex items-center gap-2 text-green-600">
                <Check className="w-5 h-5" />
                {isRtl ? coreStyle.titleAr : coreStyle.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                {coreStyle.values.map((style, index) => (
                  <Badge key={index} variant="outline" className="border-green-500/30 text-green-600">
                    {isRtl ? style.ar : style.en}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-500/30">
            <CardHeader className="border-b bg-red-500/5 py-3">
              <CardTitle className="text-base flex items-center gap-2 text-red-600">
                <Ban className="w-5 h-5" />
                {isRtl ? avoidStyles.titleAr : avoidStyles.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                {avoidStyles.values.map((style, index) => (
                  <Badge key={index} variant="outline" className="border-red-500/30 text-red-600">
                    {isRtl ? style.ar : style.en}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-10">
          <Card>
            <CardHeader className="border-b bg-muted/30 py-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Hexagon className="w-5 h-5 text-slate-600" />
                {isRtl ? "القواعد البصرية الأساسية" : "Core Visual Rules"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {visualRules.map((rule) => (
                  <div key={rule.id} className="flex justify-between items-start gap-4 p-3 rounded-md bg-muted/30">
                    <span className="font-medium text-sm min-w-[120px]">
                      {isRtl ? rule.labelAr : rule.label}
                    </span>
                    <span className="text-sm text-muted-foreground text-right flex-1">
                      {isRtl ? rule.valueAr : rule.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-10">
          <Card>
            <CardHeader className="border-b bg-muted/30 py-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="w-5 h-5 text-orange-500" />
                {isRtl ? colorPalette.titleAr : colorPalette.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-md border" style={{ borderColor: colorPalette.primary.hex }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-md" style={{ backgroundColor: colorPalette.primary.hex }} />
                    <div>
                      <p className="font-medium text-sm">{isRtl ? colorPalette.primary.nameAr : colorPalette.primary.name}</p>
                      <p className="text-xs text-muted-foreground">{colorPalette.primary.hex}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{isRtl ? colorPalette.primary.usageAr : colorPalette.primary.usage}</p>
                </div>

                <div className="p-4 rounded-md border" style={{ borderColor: colorPalette.secondary.hex }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-md" style={{ backgroundColor: colorPalette.secondary.hex }} />
                    <div>
                      <p className="font-medium text-sm">{isRtl ? colorPalette.secondary.nameAr : colorPalette.secondary.name}</p>
                      <p className="text-xs text-muted-foreground">{colorPalette.secondary.hex}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{isRtl ? colorPalette.secondary.usageAr : colorPalette.secondary.usage}</p>
                </div>

                <div className="p-4 rounded-md border" style={{ borderColor: colorPalette.accent.hex }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-md" style={{ backgroundColor: colorPalette.accent.hex }} />
                    <div>
                      <p className="font-medium text-sm">{isRtl ? colorPalette.accent.nameAr : colorPalette.accent.name}</p>
                      <p className="text-xs text-muted-foreground">{colorPalette.accent.hex}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{isRtl ? colorPalette.accent.usageAr : colorPalette.accent.usage}</p>
                </div>

                <div className="p-4 rounded-md border" style={{ borderColor: colorPalette.neutral.hex }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-md" style={{ backgroundColor: colorPalette.neutral.hex }} />
                    <div>
                      <p className="font-medium text-sm">{isRtl ? colorPalette.neutral.nameAr : colorPalette.neutral.name}</p>
                      <p className="text-xs text-muted-foreground">{colorPalette.neutral.hex}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{isRtl ? colorPalette.neutral.usageAr : colorPalette.neutral.usage}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <Card>
            <CardHeader className="border-b bg-muted/30 py-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-500" />
                {isRtl ? iconGuidelines.titleAr : iconGuidelines.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ul className="space-y-2">
                {iconGuidelines.rules.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                    {isRtl ? item.ruleAr : item.rule}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b bg-muted/30 py-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                {isRtl ? brandPersonality.titleAr : brandPersonality.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                {brandPersonality.traits.map((item, index) => (
                  <Badge key={index} variant="secondary">
                    {isRtl ? item.traitAr : item.trait}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="overflow-hidden">
            <CardContent className="p-8 bg-gradient-to-r from-slate-900 to-slate-800 text-white text-center">
              <Palette className="w-8 h-8 text-orange-400 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">
                {isRtl ? "الهوية البصرية هي السيادة المرئية" : "Visual Identity is Visual Sovereignty"}
              </p>
              <p className="text-sm text-white/60">
                {isRtl ? "كل عنصر بصري يعكس السلطة والذكاء والتحكم" : "Every visual element reflects authority, intelligence, and control"}
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
