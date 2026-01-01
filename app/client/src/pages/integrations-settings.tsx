import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, MessageSquare, CreditCard, Shield, Webhook } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { IntegrationCard } from "@/components/integrations/integration-card";
import { 
  emailProviders, 
  smsProviders, 
  paymentProviders, 
  authProviders, 
  webhookProviders 
} from "@/lib/integration-providers";
import { DocLinkButton } from "@/components/doc-link-button";

export default function IntegrationsSettings() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const categories = [
    { 
      value: "email", 
      label: isRtl ? "البريد الإلكتروني" : "Email", 
      icon: Mail, 
      providers: emailProviders 
    },
    { 
      value: "sms", 
      label: isRtl ? "الرسائل النصية" : "SMS", 
      icon: MessageSquare, 
      providers: smsProviders 
    },
    { 
      value: "payments", 
      label: isRtl ? "المدفوعات" : "Payments", 
      icon: CreditCard, 
      providers: paymentProviders 
    },
    { 
      value: "auth", 
      label: isRtl ? "المصادقة" : "Auth", 
      icon: Shield, 
      providers: authProviders 
    },
    { 
      value: "webhooks", 
      label: "Webhooks", 
      icon: Webhook, 
      providers: webhookProviders 
    },
  ];

  return (
    <div className="h-full overflow-y-auto" dir={isRtl ? "rtl" : "ltr"}>
      <div className="container mx-auto p-6 pb-24 space-y-6">
        <header>
          <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-integrations-title">
            {isRtl ? "إعدادات التكاملات" : "Integration Settings"}
            <DocLinkButton pageId="integrations-settings" />
          </h1>
          <p className="text-muted-foreground" data-testid="text-integrations-description">
            {isRtl 
              ? "قم بتكوين مزودي الخدمات الخارجية للبريد والرسائل والمدفوعات والمصادقة"
              : "Configure external service providers for email, SMS, payments, and authentication"}
          </p>
        </header>

        <Tabs defaultValue="email" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 h-auto" data-testid="tabs-integration-categories">
            {categories.map((cat) => (
              <TabsTrigger 
                key={cat.value} 
                value={cat.value} 
                className="flex items-center gap-2 py-2"
                data-testid={`tab-${cat.value}`}
              >
                <cat.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{cat.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((cat) => (
            <TabsContent key={cat.value} value={cat.value} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2" data-testid={`grid-${cat.value}-providers`}>
                {cat.providers.map((provider) => (
                  <IntegrationCard key={provider.key} provider={provider} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
