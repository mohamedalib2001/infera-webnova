import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Crown, Zap, Building2, Shield, Loader2 } from "lucide-react";
import { Link } from "wouter";
import type { SubscriptionPlan } from "@shared/schema";

export default function Pricing() {
  const { t, language, isRtl } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: plans, isLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/plans"],
  });

  const checkoutMutation = useMutation({
    mutationFn: async (planId: number) => {
      const response = await apiRequest("POST", "/api/payments/checkout", { planId });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: Error) => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const translations = {
    title: { ar: "خطط الاشتراك", en: "Subscription Plans" },
    subtitle: { ar: "اختر الخطة المناسبة لاحتياجاتك", en: "Choose the plan that fits your needs" },
    monthly: { ar: "شهري", en: "Monthly" },
    yearly: { ar: "سنوي", en: "Yearly" },
    currentPlan: { ar: "خطتك الحالية", en: "Your Current Plan" },
    selectPlan: { ar: "اختر هذه الخطة", en: "Select Plan" },
    contactUs: { ar: "تواصل معنا", en: "Contact Us" },
    loginFirst: { ar: "سجل دخول أولاً", en: "Login First" },
    perMonth: { ar: "/ شهر", en: "/ month" },
    popular: { ar: "الأكثر شعبية", en: "Most Popular" },
    features: { ar: "المميزات", en: "Features" },
  };

  const tr = (key: keyof typeof translations) => translations[key][language];

  const getPlanIcon = (role: string) => {
    switch (role) {
      case "free": return Zap;
      case "basic": return Star;
      case "pro": return Crown;
      case "enterprise": return Building2;
      case "sovereign": return Shield;
      default: return Zap;
    }
  };

  const getPlanColor = (role: string) => {
    switch (role) {
      case "free": return "from-gray-500 to-gray-600";
      case "basic": return "from-blue-500 to-blue-600";
      case "pro": return "from-violet-500 to-purple-600";
      case "enterprise": return "from-amber-500 to-orange-600";
      case "sovereign": return "from-rose-500 to-red-600";
      default: return "from-gray-500 to-gray-600";
    }
  };

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return language === "ar" ? "مجاني" : "Free";
    const formatted = (price / 100).toFixed(2);
    return currency === "USD" ? `$${formatted}` : `${formatted} ${currency}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" dir={isRtl ? "rtl" : "ltr"}>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4" data-testid="pricing-title">
          {tr("title")}
        </h1>
        <p className="text-xl text-muted-foreground" data-testid="pricing-subtitle">
          {tr("subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {plans?.sort((a, b) => a.sortOrder - b.sortOrder).map((plan) => {
          const Icon = getPlanIcon(plan.role);
          const isCurrentPlan = user?.role === plan.role;
          const isPopular = plan.role === "pro";
          const features = language === "ar" ? plan.featuresAr : plan.features;

          return (
            <Card 
              key={plan.id} 
              className={`relative flex flex-col ${isPopular ? "border-primary shadow-lg scale-105" : ""} ${isCurrentPlan ? "ring-2 ring-primary" : ""}`}
              data-testid={`plan-card-${plan.role}`}
            >
              {isPopular && (
                <Badge className="absolute -top-3 start-1/2 -translate-x-1/2" variant="default">
                  {tr("popular")}
                </Badge>
              )}

              <CardHeader className="text-center pb-2">
                <div className={`mx-auto w-14 h-14 rounded-xl bg-gradient-to-br ${getPlanColor(plan.role)} flex items-center justify-center mb-4`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">
                  {language === "ar" ? plan.nameAr : plan.name}
                </CardTitle>
                <CardDescription className="text-sm min-h-[40px]">
                  {language === "ar" ? plan.descriptionAr : plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="text-center mb-6">
                  <span className="text-3xl font-bold">
                    {formatPrice(plan.priceMonthly, plan.currency)}
                  </span>
                  {plan.priceMonthly > 0 && (
                    <span className="text-muted-foreground text-sm">
                      {tr("perMonth")}
                    </span>
                  )}
                </div>

                <ul className="space-y-3">
                  {(features as string[])?.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 pt-4 border-t space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between gap-2">
                    <span>{language === "ar" ? "المشاريع" : "Projects"}:</span>
                    <span className="font-medium">{plan.maxProjects === -1 ? "∞" : plan.maxProjects}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span>{language === "ar" ? "توليدات AI" : "AI Generations"}:</span>
                    <span className="font-medium">{plan.aiGenerationsPerMonth === -1 ? "∞" : plan.aiGenerationsPerMonth}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                {isCurrentPlan ? (
                  <Button variant="secondary" className="w-full" disabled>
                    {tr("currentPlan")}
                  </Button>
                ) : isAuthenticated ? (
                  plan.role === "sovereign" || plan.role === "enterprise" ? (
                    <Button variant="outline" className="w-full" asChild>
                      <a href="mailto:contact@infera.ai">{tr("contactUs")}</a>
                    </Button>
                  ) : plan.priceMonthly === 0 ? (
                    <Button variant="secondary" className="w-full" disabled>
                      {tr("currentPlan")}
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      data-testid={`select-plan-${plan.role}`}
                      onClick={() => checkoutMutation.mutate(plan.id)}
                      disabled={checkoutMutation.isPending}
                    >
                      {checkoutMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        tr("selectPlan")
                      )}
                    </Button>
                  )
                ) : (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/auth">{tr("loginFirst")}</Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 text-center text-muted-foreground">
        <p className="text-sm">
          {language === "ar" 
            ? "جميع الخطط تشمل تحديثات مجانية ودعم فني. للخطط المؤسسية والسيادية، تواصل معنا للحصول على عرض مخصص."
            : "All plans include free updates and technical support. For Enterprise and Sovereign plans, contact us for custom pricing."
          }
        </p>
      </div>
    </div>
  );
}
