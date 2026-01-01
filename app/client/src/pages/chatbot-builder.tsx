import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, MessageSquare, Sparkles, Settings, Plus } from "lucide-react";

export default function ChatbotBuilder() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const t = {
    ar: {
      title: "منشئ الروبوتات",
      subtitle: "أنشئ روبوت محادثة ذكي لموقعك",
      createBot: "إنشاء روبوت جديد",
      features: "المميزات",
      feature1: "ذكاء اصطناعي متقدم",
      feature1Desc: "ردود ذكية ومخصصة",
      feature2: "تدريب مخصص",
      feature2Desc: "درّب الروبوت على بياناتك",
      feature3: "تكامل سهل",
      feature3Desc: "أضفه لموقعك بسطر واحد",
      comingSoon: "قريبًا",
      noBots: "لا توجد روبوتات بعد",
      startBuilding: "ابدأ ببناء أول روبوت",
    },
    en: {
      title: "Chatbot Builder",
      subtitle: "Create an intelligent chatbot for your website",
      createBot: "Create New Bot",
      features: "Features",
      feature1: "Advanced AI",
      feature1Desc: "Smart and personalized responses",
      feature2: "Custom Training",
      feature2Desc: "Train the bot on your data",
      feature3: "Easy Integration",
      feature3Desc: "Add to your site with one line",
      comingSoon: "Coming Soon",
      noBots: "No chatbots yet",
      startBuilding: "Start building your first bot",
    },
  };

  const txt = t[language];

  const features = [
    { icon: Sparkles, title: txt.feature1, desc: txt.feature1Desc },
    { icon: Settings, title: txt.feature2, desc: txt.feature2Desc },
    { icon: MessageSquare, title: txt.feature3, desc: txt.feature3Desc },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto" dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-chatbot-title">
            {txt.title}
          </h1>
          <p className="text-muted-foreground mt-1">{txt.subtitle}</p>
        </div>
        <Button disabled data-testid="button-create-bot">
          <Plus className="h-4 w-4" />
          <span className={isRtl ? "mr-2" : "ml-2"}>{txt.createBot}</span>
        </Button>
      </div>

      <Card className="mb-8">
        <CardContent className="text-center py-12">
          <Bot className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{txt.noBots}</h3>
          <p className="text-muted-foreground mb-4">{txt.startBuilding}</p>
          <Badge variant="secondary" className="text-base px-4 py-2">
            {txt.comingSoon}
          </Badge>
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold mb-4">{txt.features}</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {features.map((feature, index) => (
          <Card key={index} className="hover-elevate">
            <CardContent className="text-center pt-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
