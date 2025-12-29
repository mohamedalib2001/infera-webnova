import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rocket, Globe, Cloud, Zap, CheckCircle } from "lucide-react";
import { DocLinkButton } from "@/components/doc-link-button";

export default function Deploy() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const t = {
    ar: {
      title: "النشر بنقرة واحدة",
      subtitle: "انشر مشروعك للعالم بنقرة واحدة",
      selectProject: "اختر مشروعًا للنشر",
      features: "مميزات النشر",
      feature1: "نطاق مخصص",
      feature1Desc: "احصل على نطاق خاص بك",
      feature2: "شهادة SSL",
      feature2Desc: "حماية تلقائية مجانية",
      feature3: "CDN عالمي",
      feature3Desc: "سرعة تحميل فائقة",
      feature4: "نسخ احتياطي",
      feature4Desc: "حماية بياناتك تلقائيًا",
      deploy: "نشر الآن",
      comingSoon: "قريبًا",
    },
    en: {
      title: "One-Click Deploy",
      subtitle: "Deploy your project to the world with one click",
      selectProject: "Select a project to deploy",
      features: "Deployment Features",
      feature1: "Custom Domain",
      feature1Desc: "Get your own domain",
      feature2: "SSL Certificate",
      feature2Desc: "Free automatic protection",
      feature3: "Global CDN",
      feature3Desc: "Ultra-fast loading speed",
      feature4: "Auto Backup",
      feature4Desc: "Protect your data automatically",
      deploy: "Deploy Now",
      comingSoon: "Coming Soon",
    },
  };

  const txt = t[language];

  const features = [
    { icon: Globe, title: txt.feature1, desc: txt.feature1Desc },
    { icon: CheckCircle, title: txt.feature2, desc: txt.feature2Desc },
    { icon: Zap, title: txt.feature3, desc: txt.feature3Desc },
    { icon: Cloud, title: txt.feature4, desc: txt.feature4Desc },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto" dir={isRtl ? "rtl" : "ltr"}>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
          <Rocket className="h-8 w-8 text-primary" />
        </div>
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-3xl font-bold" data-testid="text-deploy-title">
            {txt.title}
          </h1>
          <DocLinkButton pageId="deploy" />
        </div>
        <p className="text-muted-foreground mt-2">{txt.subtitle}</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{txt.selectProject}</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Badge variant="secondary" className="text-base px-4 py-2">
            {txt.comingSoon}
          </Badge>
          <p className="text-muted-foreground mt-4">
            {language === "ar" 
              ? "سيتم إضافة خاصية النشر قريبًا. ابدأ ببناء مشروعك الآن!"
              : "Deployment feature coming soon. Start building your project now!"}
          </p>
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold mb-4">{txt.features}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {features.map((feature, index) => (
          <Card key={index} className="hover-elevate">
            <CardContent className="flex items-start gap-4 pt-6">
              <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
