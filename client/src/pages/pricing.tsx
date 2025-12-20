import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { 
  Check, 
  X,
  Star, 
  Crown, 
  Zap, 
  Building2, 
  Shield, 
  Loader2,
  Lock,
  Sparkles,
  Bot,
  Code,
  Server,
  GitBranch,
  BarChart3,
  Users,
  Globe,
  Cpu,
  ArrowRight,
  Info,
  Gauge
} from "lucide-react";
import { Link } from "wouter";
import type { SubscriptionPlan, PlanCapabilities, PlanLimits, PlanRestrictions } from "@shared/schema";

export default function Pricing() {
  const { language, isRtl } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const { data: plans, isLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/plans"],
  });

  const checkoutMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await apiRequest("POST", "/api/payments/checkout", { planId, billingCycle });
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

  const tr = {
    title: language === "ar" ? "خطط الاشتراك" : "Subscription Plans",
    subtitle: language === "ar" ? "اختر الخطة المناسبة لاحتياجاتك" : "Choose the plan that fits your needs",
    monthly: language === "ar" ? "شهري" : "Monthly",
    yearly: language === "ar" ? "سنوي" : "Yearly",
    currentPlan: language === "ar" ? "خطتك الحالية" : "Your Current Plan",
    selectPlan: language === "ar" ? "اختر هذه الخطة" : "Select Plan",
    contactUs: language === "ar" ? "تواصل معنا" : "Contact Us",
    loginFirst: language === "ar" ? "سجل دخول أولاً" : "Login First",
    perMonth: language === "ar" ? "/ شهر" : "/ month",
    perYear: language === "ar" ? "/ سنة" : "/ year",
    popular: language === "ar" ? "الأكثر شعبية" : "Most Popular",
    savePercent: language === "ar" ? "وفر 33%" : "Save 33%",
    unlimited: language === "ar" ? "غير محدود" : "Unlimited",
    notAvailable: language === "ar" ? "غير متاح في خطتك" : "Not available in your plan",
    upgradeToAccess: language === "ar" ? "قم بالترقية للوصول" : "Upgrade to access",
    aiMode: language === "ar" ? "وضع الذكاء الاصطناعي" : "AI Mode",
    aiAutonomy: language === "ar" ? "مستوى الاستقلالية" : "AI Autonomy Level",
    operationalCapabilities: language === "ar" ? "القدرات التشغيلية" : "Operational Capabilities",
    limits: language === "ar" ? "الحدود" : "Limits",
    footer: language === "ar" 
      ? "جميع الخطط تشمل تحديثات مجانية ودعم فني. للخطط المؤسسية والسيادية، تواصل معنا للحصول على عرض مخصص."
      : "All plans include free updates and technical support. For Enterprise and Sovereign plans, contact us for custom pricing.",
  };

  const getPlanIcon = (iconName?: string | null) => {
    switch (iconName) {
      case "Zap": return Zap;
      case "Star": return Star;
      case "Crown": return Crown;
      case "Building2": return Building2;
      case "Shield": return Shield;
      default: return Zap;
    }
  };

  const getAIModeLabel = (mode?: string) => {
    const modes: Record<string, { en: string; ar: string; color: string }> = {
      sandbox: { en: "Sandbox", ar: "تجريبي", color: "bg-gray-500" },
      assistant: { en: "Assistant", ar: "مساعد", color: "bg-blue-500" },
      copilot: { en: "Copilot", ar: "مساعد ذكي", color: "bg-violet-500" },
      operator: { en: "Operator", ar: "مشغل", color: "bg-amber-500" },
      sovereign: { en: "Sovereign", ar: "سيادي", color: "bg-red-500" },
    };
    return modes[mode || "sandbox"] || modes.sandbox;
  };

  const formatPrice = (plan: SubscriptionPlan) => {
    const price = billingCycle === "yearly" ? plan.priceYearly / 12 : plan.priceMonthly;
    if (price === 0) return language === "ar" ? "مجاني" : "Free";
    const formatted = (price / 100).toFixed(2);
    return `$${formatted}`;
  };

  const formatLimit = (value: number) => {
    if (value === -1) return tr.unlimited;
    return value.toLocaleString();
  };

  const renderCapabilityItem = (
    enabled: boolean, 
    label: string, 
    labelAr: string,
    userHasAccess: boolean,
    tooltipEn: string,
    tooltipAr: string
  ) => {
    const displayLabel = language === "ar" ? labelAr : label;
    const tooltip = language === "ar" ? tooltipAr : tooltipEn;

    if (!enabled) {
      return (
        <TooltipProvider key={label}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 text-muted-foreground/50 cursor-help">
                <X className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm line-through">{displayLabel}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <div key={label} className="flex items-center gap-2">
        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
        <span className="text-sm">{displayLabel}</span>
        {!userHasAccess && isAuthenticated && (
          <Lock className="h-3 w-3 text-amber-500" />
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const sortedPlans = plans?.sort((a, b) => a.sortOrder - b.sortOrder) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30" dir={isRtl ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-violet-500 to-pink-500 bg-clip-text text-transparent" data-testid="pricing-title">
            {tr.title}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="pricing-subtitle">
            {tr.subtitle}
          </p>
          
          {/* Billing Toggle */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <Tabs value={billingCycle} onValueChange={(v) => setBillingCycle(v as "monthly" | "yearly")} className="w-auto">
              <TabsList className="grid w-[240px] grid-cols-2">
                <TabsTrigger value="monthly" data-testid="billing-monthly">
                  {tr.monthly}
                </TabsTrigger>
                <TabsTrigger value="yearly" data-testid="billing-yearly" className="relative">
                  {tr.yearly}
                  <Badge variant="secondary" className="absolute -top-3 -end-2 text-xs bg-green-500 text-white">
                    {tr.savePercent}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
          {sortedPlans.map((plan) => {
            const Icon = getPlanIcon(plan.iconName);
            const isCurrentPlan = user?.role === plan.role;
            const aiModeInfo = getAIModeLabel((plan.capabilities as PlanCapabilities)?.aiMode);
            const capabilities = plan.capabilities as PlanCapabilities | undefined;
            const limits = plan.limits as PlanLimits | undefined;
            const restrictions = plan.restrictions as PlanRestrictions | undefined;
            const features = language === "ar" ? plan.featuresAr : plan.features;
            const tagline = language === "ar" ? plan.taglineAr : plan.tagline;
            const planName = language === "ar" ? plan.nameAr : plan.name;
            const planDesc = language === "ar" ? plan.descriptionAr : plan.description;

            return (
              <Card 
                key={plan.id} 
                className={`relative flex flex-col transition-all duration-300 ${
                  plan.isPopular ? "border-primary shadow-lg shadow-primary/20 scale-[1.02]" : ""
                } ${isCurrentPlan ? "ring-2 ring-green-500" : ""}`}
                data-testid={`plan-card-${plan.role}`}
              >
                {/* Popular Badge */}
                {plan.isPopular && (
                  <Badge className="absolute -top-3 start-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                    <Sparkles className="h-3 w-3 me-1" />
                    {tr.popular}
                  </Badge>
                )}

                {/* Current Plan Badge */}
                {isCurrentPlan && (
                  <Badge className="absolute -top-3 end-4 bg-green-500 text-white">
                    {tr.currentPlan}
                  </Badge>
                )}

                <CardHeader className="text-center pb-2">
                  {/* Icon */}
                  <div 
                    className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{ 
                      background: `linear-gradient(135deg, ${plan.gradientFrom || '#6366f1'}, ${plan.gradientTo || '#8b5cf6'})` 
                    }}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </div>

                  {/* Plan Name & Tagline */}
                  <CardTitle className="text-xl mb-1">{planName}</CardTitle>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    {tagline}
                  </p>
                  <CardDescription className="text-sm min-h-[40px] mt-2">
                    {planDesc}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 space-y-4">
                  {/* Price */}
                  <div className="text-center py-4 border-y">
                    <span className="text-4xl font-bold">
                      {formatPrice(plan)}
                    </span>
                    {plan.priceMonthly > 0 && (
                      <span className="text-muted-foreground text-sm">
                        {tr.perMonth}
                      </span>
                    )}
                    {billingCycle === "yearly" && plan.priceMonthly > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {language === "ar" ? "يدفع سنوياً" : "Billed annually"}
                      </p>
                    )}
                  </div>

                  {/* AI Mode Indicator */}
                  {capabilities && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <Bot className="h-4 w-4" />
                          {tr.aiMode}
                        </span>
                        <Badge className={`${aiModeInfo.color} text-white`}>
                          {language === "ar" ? aiModeInfo.ar : aiModeInfo.en}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Gauge className="h-3 w-3" />
                            {tr.aiAutonomy}
                          </span>
                          <span>{capabilities.aiAutonomy}%</span>
                        </div>
                        <Progress value={capabilities.aiAutonomy} className="h-1.5" />
                      </div>
                    </div>
                  )}

                  {/* Restrictions Warning */}
                  {restrictions?.sandboxMode && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                        <Info className="h-4 w-4" />
                        <span className="text-xs font-medium">
                          {language === "ar" ? "وضع تجريبي - بدون نشر حقيقي" : "Sandbox Mode - No Real Deployment"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Features List */}
                  <ul className="space-y-2">
                    {(features as string[])?.slice(0, 6).map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                    {(features as string[])?.length > 6 && (
                      <li className="text-sm text-muted-foreground text-center pt-1">
                        +{(features as string[]).length - 6} {language === "ar" ? "ميزة أخرى" : "more features"}
                      </li>
                    )}
                  </ul>

                  {/* Key Limits */}
                  {limits && (
                    <div className="pt-4 border-t space-y-2 text-sm">
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Code className="h-3 w-3" />
                          {language === "ar" ? "المشاريع" : "Projects"}
                        </span>
                        <span className="font-medium">{formatLimit(limits.maxProjects)}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          {language === "ar" ? "توليدات AI" : "AI Generations"}
                        </span>
                        <span className="font-medium">{formatLimit(limits.aiGenerationsPerMonth)}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Server className="h-3 w-3" />
                          {language === "ar" ? "النشر النشط" : "Active Deploys"}
                        </span>
                        <span className="font-medium">{formatLimit(limits.activeDeployments)}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {language === "ar" ? "أعضاء الفريق" : "Team Members"}
                        </span>
                        <span className="font-medium">{formatLimit(limits.teamMembers)}</span>
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-4">
                  {isCurrentPlan ? (
                    <Button variant="secondary" className="w-full" disabled data-testid={`btn-current-${plan.role}`}>
                      <Check className="h-4 w-4 me-2" />
                      {tr.currentPlan}
                    </Button>
                  ) : isAuthenticated ? (
                    plan.isContactSales ? (
                      <Button variant="outline" className="w-full" asChild data-testid={`btn-contact-${plan.role}`}>
                        <a href="mailto:contact@infera.ai" className="flex items-center gap-2">
                          {tr.contactUs}
                          <ArrowRight className="h-4 w-4" />
                        </a>
                      </Button>
                    ) : plan.priceMonthly === 0 ? (
                      <Button variant="secondary" className="w-full" disabled>
                        {language === "ar" ? "مفعّل تلقائياً" : "Automatically Active"}
                      </Button>
                    ) : (
                      <Button 
                        className="w-full" 
                        style={{ 
                          background: `linear-gradient(135deg, ${plan.gradientFrom || '#6366f1'}, ${plan.gradientTo || '#8b5cf6'})` 
                        }}
                        data-testid={`btn-select-${plan.role}`}
                        onClick={() => checkoutMutation.mutate(plan.id)}
                        disabled={checkoutMutation.isPending}
                      >
                        {checkoutMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            {tr.selectPlan}
                            <ArrowRight className="h-4 w-4 ms-2" />
                          </>
                        )}
                      </Button>
                    )
                  ) : (
                    <Button variant="outline" className="w-full" asChild data-testid={`btn-login-${plan.role}`}>
                      <Link href="/auth">
                        {tr.loginFirst}
                        <ArrowRight className="h-4 w-4 ms-2" />
                      </Link>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Comparison Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">
            {language === "ar" ? "مقارنة القدرات التشغيلية" : "Operational Capabilities Comparison"}
          </h2>
          
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-start p-4 font-medium min-w-[200px]">
                      {language === "ar" ? "القدرة" : "Capability"}
                    </th>
                    {sortedPlans.map((plan) => (
                      <th key={plan.id} className="p-4 text-center min-w-[120px]">
                        <span className="font-medium">{language === "ar" ? plan.nameAr : plan.name}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* AI Capabilities */}
                  <tr className="border-b bg-muted/20">
                    <td colSpan={6} className="p-3 font-semibold flex items-center gap-2">
                      <Bot className="h-4 w-4 text-violet-500" />
                      {language === "ar" ? "قدرات الذكاء الاصطناعي" : "AI Capabilities"}
                    </td>
                  </tr>
                  {[
                    { key: "smartSuggestions", en: "Smart Suggestions", ar: "الاقتراحات الذكية" },
                    { key: "aiCopilot", en: "AI Copilot", ar: "مساعد AI" },
                    { key: "aiOperator", en: "AI Operator", ar: "مشغل AI" },
                    { key: "aiGovernance", en: "AI Governance", ar: "حوكمة AI" },
                  ].map((cap) => (
                    <tr key={cap.key} className="border-b">
                      <td className="p-4 text-sm">{language === "ar" ? cap.ar : cap.en}</td>
                      {sortedPlans.map((plan) => {
                        const capabilities = plan.capabilities as PlanCapabilities | undefined;
                        const enabled = capabilities?.[cap.key as keyof PlanCapabilities];
                        return (
                          <td key={plan.id} className="p-4 text-center">
                            {enabled ? (
                              <Check className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {/* Builder Capabilities */}
                  <tr className="border-b bg-muted/20">
                    <td colSpan={6} className="p-3 font-semibold flex items-center gap-2">
                      <Code className="h-4 w-4 text-blue-500" />
                      {language === "ar" ? "قدرات البناء" : "Builder Capabilities"}
                    </td>
                  </tr>
                  {[
                    { key: "frontendGenerator", en: "Frontend Generator", ar: "مولد الواجهة" },
                    { key: "backendGenerator", en: "Backend Generator", ar: "مولد الخلفية" },
                    { key: "fullStackGenerator", en: "Full Stack Generator", ar: "مولد Full Stack" },
                    { key: "chatbotBuilder", en: "Chatbot Builder", ar: "منشئ الشات بوت" },
                  ].map((cap) => (
                    <tr key={cap.key} className="border-b">
                      <td className="p-4 text-sm">{language === "ar" ? cap.ar : cap.en}</td>
                      {sortedPlans.map((plan) => {
                        const capabilities = plan.capabilities as PlanCapabilities | undefined;
                        const enabled = capabilities?.[cap.key as keyof PlanCapabilities];
                        return (
                          <td key={plan.id} className="p-4 text-center">
                            {enabled ? (
                              <Check className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {/* Infrastructure */}
                  <tr className="border-b bg-muted/20">
                    <td colSpan={6} className="p-3 font-semibold flex items-center gap-2">
                      <Server className="h-4 w-4 text-green-500" />
                      {language === "ar" ? "البنية التحتية" : "Infrastructure"}
                    </td>
                  </tr>
                  {[
                    { key: "versionControl", en: "Version Control", ar: "التحكم بالإصدارات" },
                    { key: "cicdIntegration", en: "CI/CD Integration", ar: "تكامل CI/CD" },
                    { key: "apiGateway", en: "API Gateway", ar: "بوابة API" },
                    { key: "whiteLabel", en: "White Label", ar: "العلامة البيضاء" },
                  ].map((cap) => (
                    <tr key={cap.key} className="border-b">
                      <td className="p-4 text-sm">{language === "ar" ? cap.ar : cap.en}</td>
                      {sortedPlans.map((plan) => {
                        const capabilities = plan.capabilities as PlanCapabilities | undefined;
                        const enabled = capabilities?.[cap.key as keyof PlanCapabilities];
                        return (
                          <td key={plan.id} className="p-4 text-center">
                            {enabled ? (
                              <Check className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {/* Sovereign Features */}
                  <tr className="border-b bg-muted/20">
                    <td colSpan={6} className="p-3 font-semibold flex items-center gap-2">
                      <Shield className="h-4 w-4 text-red-500" />
                      {language === "ar" ? "ميزات السيادة" : "Sovereignty Features"}
                    </td>
                  </tr>
                  {[
                    { key: "sovereignDashboard", en: "Sovereign Dashboard", ar: "لوحة التحكم السيادية" },
                    { key: "dataResidencyControl", en: "Data Residency Control", ar: "التحكم بإقامة البيانات" },
                    { key: "policyEnforcement", en: "Policy Enforcement", ar: "إنفاذ السياسات" },
                    { key: "emergencyKillSwitch", en: "Emergency Kill Switch", ar: "زر الإيقاف الطارئ" },
                  ].map((cap) => (
                    <tr key={cap.key} className="border-b">
                      <td className="p-4 text-sm">{language === "ar" ? cap.ar : cap.en}</td>
                      {sortedPlans.map((plan) => {
                        const capabilities = plan.capabilities as PlanCapabilities | undefined;
                        const enabled = capabilities?.[cap.key as keyof PlanCapabilities];
                        return (
                          <td key={plan.id} className="p-4 text-center">
                            {enabled ? (
                              <Check className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <Lock className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            {tr.footer}
          </p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <Badge variant="outline" className="gap-1">
              <Shield className="h-3 w-3" />
              {language === "ar" ? "دفع آمن" : "Secure Payment"}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Globe className="h-3 w-3" />
              {language === "ar" ? "متعدد العملات" : "Multi-Currency"}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <BarChart3 className="h-3 w-3" />
              {language === "ar" ? "فواتير حقيقية" : "Real Invoices"}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
