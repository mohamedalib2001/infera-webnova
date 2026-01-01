import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Palette, Globe, Building2, Lock } from "lucide-react";

export default function WhiteLabel() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const features = [
    {
      icon: Palette,
      title: isRtl ? "تخصيص العلامة التجارية" : "Brand Customization",
      description: isRtl 
        ? "قم بتخصيص الألوان والشعارات والخطوط لتتناسب مع هوية علامتك التجارية"
        : "Customize colors, logos, and fonts to match your brand identity"
    },
    {
      icon: Globe,
      title: isRtl ? "نطاق مخصص" : "Custom Domain",
      description: isRtl
        ? "استخدم نطاقك الخاص بدلاً من نطاق INFERA"
        : "Use your own domain instead of INFERA domain"
    },
    {
      icon: Building2,
      title: isRtl ? "إزالة شعار INFERA" : "Remove INFERA Branding",
      description: isRtl
        ? "أزل جميع إشارات INFERA من منصتك"
        : "Remove all INFERA references from your platform"
    },
    {
      icon: Lock,
      title: isRtl ? "ملكية كاملة" : "Full Ownership",
      description: isRtl
        ? "احصل على ملكية كاملة لمنصتك مع تحكم سيادي"
        : "Get full ownership of your platform with sovereign control"
    }
  ];

  return (
    <div className={`p-6 space-y-6 ${isRtl ? "text-right" : "text-left"}`} dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">
            {isRtl ? "العلامة البيضاء" : "White Label"}
          </h1>
          <p className="text-muted-foreground">
            {isRtl 
              ? "قم بتخصيص منصتك بالكامل تحت علامتك التجارية الخاصة"
              : "Fully customize your platform under your own brand"}
          </p>
        </div>
        <Badge variant="secondary" data-testid="badge-coming-soon">
          {isRtl ? "قريباً" : "Coming Soon"}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {features.map((feature, index) => (
          <Card key={index} data-testid={`card-feature-${index}`}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card data-testid="card-enterprise-notice">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            {isRtl 
              ? "العلامة البيضاء متاحة لباقات Enterprise و Sovereign فقط. تواصل معنا للحصول على عرض سعر مخصص."
              : "White Label is available for Enterprise and Sovereign plans only. Contact us for a custom quote."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
