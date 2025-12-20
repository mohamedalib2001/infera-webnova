import { useState } from "react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/hooks/use-language";
import type { Template } from "@shared/schema";
import {
  Sparkles,
  Brain,
  Zap,
  Clock,
  Users,
  Building2,
  Crown,
  Rocket,
  ArrowRight,
  Check,
  ShoppingCart,
  Landmark,
  BarChart3,
  Bot,
  CreditCard,
  Settings,
  Globe,
  Shield,
  Star,
  Puzzle,
  Layers,
  Code2,
  Plug,
} from "lucide-react";

interface TemplateDetailDialogProps {
  template: Template | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const intelligenceLevelConfig = {
  basic: { 
    icon: Zap, 
    color: "from-slate-500 to-slate-600",
    badgeClass: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
    label: { en: "Basic", ar: "أساسي" },
    description: { en: "Standard templates with core functionality", ar: "قوالب قياسية بوظائف أساسية" }
  },
  smart: { 
    icon: Sparkles, 
    color: "from-violet-500 to-purple-600",
    badgeClass: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    label: { en: "Smart", ar: "ذكي" },
    description: { en: "Enhanced templates with intelligent features", ar: "قوالب محسنة بميزات ذكية" }
  },
  "ai-native": { 
    icon: Brain, 
    color: "from-cyan-500 to-blue-600",
    badgeClass: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    label: { en: "AI-Native", ar: "ذكاء اصطناعي" },
    description: { en: "AI-powered templates with advanced automation", ar: "قوالب مدعومة بالذكاء الاصطناعي" }
  },
};

const categoryConfig: Record<string, { icon: any; gradient: string; label: { en: string; ar: string } }> = {
  "business-saas": { 
    icon: Building2, 
    gradient: "from-emerald-500 to-teal-600",
    label: { en: "Business & SaaS", ar: "أعمال و SaaS" }
  },
  "government-enterprise": { 
    icon: Landmark, 
    gradient: "from-blue-500 to-indigo-600",
    label: { en: "Government & Enterprise", ar: "حكومي ومؤسسي" }
  },
  "ai-native": { 
    icon: Bot, 
    gradient: "from-violet-500 to-purple-600",
    label: { en: "AI-Native", ar: "ذكاء اصطناعي" }
  },
  "e-commerce-fintech": { 
    icon: CreditCard, 
    gradient: "from-amber-500 to-orange-600",
    label: { en: "E-Commerce & FinTech", ar: "تجارة إلكترونية ومالية" }
  },
  "internal-tools": { 
    icon: Settings, 
    gradient: "from-slate-500 to-gray-600",
    label: { en: "Internal Tools", ar: "أدوات داخلية" }
  },
};

const monetizationConfig: Record<string, { icon: any; badgeClass: string; label: { en: string; ar: string } }> = {
  free: { 
    icon: Rocket, 
    badgeClass: "bg-green-500/10 text-green-600 dark:text-green-400",
    label: { en: "Free", ar: "مجاني" }
  },
  paid: { 
    icon: Crown, 
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    label: { en: "Premium", ar: "مدفوع" }
  },
  enterprise: { 
    icon: Shield, 
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    label: { en: "Enterprise", ar: "مؤسسي" }
  },
};

export function TemplateDetailDialog({ template, open, onOpenChange }: TemplateDetailDialogProps) {
  const { language, isRtl } = useLanguage();
  const [, setLocation] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<"free" | "paid">("free");

  if (!template) return null;

  const intelligenceConfig = intelligenceLevelConfig[template.intelligenceLevel as keyof typeof intelligenceLevelConfig] || intelligenceLevelConfig.basic;
  const IntelligenceIcon = intelligenceConfig.icon;
  
  const catConfig = categoryConfig[template.category as keyof typeof categoryConfig];
  const CategoryIcon = catConfig?.icon || Building2;
  
  const monConfig = monetizationConfig[template.monetizationType as keyof typeof monetizationConfig] || monetizationConfig.free;
  const MonetizationIcon = monConfig.icon;

  const name = language === "ar" && template.nameAr ? template.nameAr : template.name;
  const description = language === "ar" && template.descriptionAr ? template.descriptionAr : template.description;

  const frontendCapabilities = template.frontendCapabilities || [];
  const businessLogicModules = template.businessLogicModules || [];
  const extensibilityHooks = template.extensibilityHooks || [];
  const supportedIntegrations = template.supportedIntegrations || [];
  const freeFeatures = template.freeFeatures || [];
  const paidFeatures = template.paidFeatures || [];

  const handleUseTemplate = () => {
    const prompt = language === "ar" 
      ? `أنشئ منصة بناءً على قالب "${template.name}" مع كل الميزات والقدرات المطلوبة`
      : `Create a platform based on the "${template.name}" template with all required features and capabilities`;
    setLocation(`/builder?prompt=${encodeURIComponent(prompt)}&templateId=${template.id}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-3xl max-h-[90vh] ${isRtl ? "rtl" : "ltr"}`}>
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${catConfig?.gradient || "from-violet-500 to-purple-600"} flex items-center justify-center shrink-0`}>
              <CategoryIcon className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-semibold mb-2">{name}</DialogTitle>
              <div className="flex flex-wrap gap-2">
                <Badge className={intelligenceConfig.badgeClass}>
                  <IntelligenceIcon className="h-3 w-3 mr-1" />
                  {intelligenceConfig.label[language as "en" | "ar"]}
                </Badge>
                <Badge className={monConfig.badgeClass}>
                  <MonetizationIcon className="h-3 w-3 mr-1" />
                  {monConfig.label[language as "en" | "ar"]}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {template.setupTimeMinutes || 30} {language === "ar" ? "دقيقة" : "min"}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] mt-4">
          <div className="space-y-6 pr-4">
            <p className="text-muted-foreground leading-relaxed">{description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-muted/30 rounded-lg">
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">
                  {language === "ar" ? "الجمهور المستهدف" : "Target Audience"}
                </div>
                <Badge variant="secondary" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  {template.targetAudience === "startup" ? (language === "ar" ? "شركات ناشئة" : "Startups") :
                   template.targetAudience === "enterprise" ? (language === "ar" ? "مؤسسات" : "Enterprise") :
                   template.targetAudience === "government" ? (language === "ar" ? "حكومي" : "Government") :
                   (language === "ar" ? "أفراد" : "Individual")}
                </Badge>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">
                  {language === "ar" ? "نوع المنصة" : "Platform Type"}
                </div>
                <Badge variant="secondary" className="text-xs">
                  <Globe className="h-3 w-3 mr-1" />
                  {template.platformType || "saas"}
                </Badge>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">
                  {language === "ar" ? "مستوى الذكاء" : "Intelligence"}
                </div>
                <Badge className={intelligenceConfig.badgeClass}>
                  <IntelligenceIcon className="h-3 w-3 mr-1" />
                  {intelligenceConfig.label[language as "en" | "ar"]}
                </Badge>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">
                  {language === "ar" ? "التقييم" : "Rating"}
                </div>
                <Badge variant="outline" className="text-xs">
                  <Star className="h-3 w-3 mr-1 text-amber-500" />
                  {template.rating ? template.rating.toFixed(1) : "4.5"}
                </Badge>
              </div>
            </div>

            <p className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-md">
              {intelligenceConfig.description[language as "en" | "ar"]}
            </p>

            {frontendCapabilities.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">
                    {language === "ar" ? "قدرات الواجهة" : "Frontend Capabilities"}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {frontendCapabilities.map((cap, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {cap}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {businessLogicModules.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Code2 className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">
                    {language === "ar" ? "وحدات منطق العمل" : "Business Logic Modules"}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {businessLogicModules.map((mod, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {mod}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {extensibilityHooks.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Puzzle className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">
                    {language === "ar" ? "نقاط التوسع" : "Extensibility Hooks"}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {extensibilityHooks.map((hook, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {hook}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {supportedIntegrations.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Plug className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">
                    {language === "ar" ? "التكاملات المدعومة" : "Supported Integrations"}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {supportedIntegrations.map((integration, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs bg-muted/50">
                      {integration}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <div>
              <h3 className="font-semibold mb-4">
                {language === "ar" ? "اختر خطتك" : "Choose Your Plan"}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className={`p-4 rounded-lg border-2 text-left transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    selectedPlan === "free" 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover-elevate"
                  }`}
                  onClick={() => setSelectedPlan("free")}
                  data-testid="plan-free"
                  aria-pressed={selectedPlan === "free"}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Rocket className="h-5 w-5 text-green-600" />
                    <span className="font-semibold">{language === "ar" ? "مجاني" : "Free"}</span>
                    {selectedPlan === "free" && (
                      <Check className="h-4 w-4 text-primary ml-auto" />
                    )}
                  </div>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    {freeFeatures.slice(0, 4).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 text-green-600 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </button>

                <button
                  type="button"
                  className={`p-4 rounded-lg border-2 text-left transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    selectedPlan === "paid" 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover-elevate"
                  }`}
                  onClick={() => setSelectedPlan("paid")}
                  data-testid="plan-paid"
                  aria-pressed={selectedPlan === "paid"}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Crown className="h-5 w-5 text-amber-500" />
                    <span className="font-semibold">{language === "ar" ? "مميز" : "Premium"}</span>
                    {selectedPlan === "paid" && (
                      <Check className="h-4 w-4 text-primary ml-auto" />
                    )}
                  </div>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    {paidFeatures.slice(0, 4).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </button>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-template">
            {language === "ar" ? "إلغاء" : "Cancel"}
          </Button>
          <Button 
            onClick={handleUseTemplate}
            className="gap-2"
            data-testid="button-use-template"
          >
            <Sparkles className="h-4 w-4" />
            {language === "ar" ? "استخدم هذا القالب" : "Use This Template"}
            <ArrowRight className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
