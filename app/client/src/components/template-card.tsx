import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Eye,
  ShoppingCart,
  Landmark,
  BarChart3,
  Bot,
  CreditCard,
  Settings,
  Globe,
  Shield,
  Star,
} from "lucide-react";

interface TemplateCardProps {
  template: Template;
  onUse: (template: Template) => void;
  onPreview?: (template: Template) => void;
}

const intelligenceLevelConfig = {
  basic: { 
    icon: Zap, 
    color: "from-slate-500 to-slate-600",
    badgeClass: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
    label: { en: "Basic", ar: "أساسي" }
  },
  smart: { 
    icon: Sparkles, 
    color: "from-violet-500 to-purple-600",
    badgeClass: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    label: { en: "Smart", ar: "ذكي" }
  },
  "ai-native": { 
    icon: Brain, 
    color: "from-cyan-500 to-blue-600",
    badgeClass: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    label: { en: "AI-Native", ar: "ذكاء اصطناعي" }
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
  "Landing": { 
    icon: Rocket, 
    gradient: "from-pink-500 to-rose-600",
    label: { en: "Landing Pages", ar: "صفحات هبوط" }
  },
  "Portfolio": { 
    icon: Globe, 
    gradient: "from-cyan-500 to-blue-600",
    label: { en: "Portfolio", ar: "معرض أعمال" }
  },
  "E-commerce": { 
    icon: ShoppingCart, 
    gradient: "from-green-500 to-emerald-600",
    label: { en: "E-Commerce", ar: "تجارة إلكترونية" }
  },
};

const targetAudienceConfig: Record<string, { label: { en: string; ar: string } }> = {
  individual: { label: { en: "Individuals", ar: "أفراد" } },
  startup: { label: { en: "Startups", ar: "شركات ناشئة" } },
  enterprise: { label: { en: "Enterprise", ar: "مؤسسات" } },
  government: { label: { en: "Government", ar: "حكومي" } },
};

const monetizationConfig: Record<string, { icon: any; badgeClass: string; label: { en: string; ar: string } }> = {
  free: { 
    icon: Rocket, 
    badgeClass: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    label: { en: "Free", ar: "مجاني" }
  },
  paid: { 
    icon: Crown, 
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    label: { en: "Premium", ar: "مدفوع" }
  },
  enterprise: { 
    icon: Shield, 
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    label: { en: "Enterprise", ar: "مؤسسي" }
  },
};

export function TemplateCard({ template, onUse, onPreview }: TemplateCardProps) {
  const { language, isRtl } = useLanguage();
  
  const intelligenceConfig = intelligenceLevelConfig[template.intelligenceLevel as keyof typeof intelligenceLevelConfig] || intelligenceLevelConfig.basic;
  const catConfig = categoryConfig[template.category] || categoryConfig["business-saas"];
  const audienceConfig = targetAudienceConfig[template.targetAudience as keyof typeof targetAudienceConfig] || targetAudienceConfig.startup;
  const monConfig = monetizationConfig[template.monetizationType as keyof typeof monetizationConfig] || monetizationConfig.free;
  
  const IntelligenceIcon = intelligenceConfig.icon;
  const CategoryIcon = catConfig.icon;
  const MonetizationIcon = monConfig.icon;

  const displayName = language === "ar" && template.nameAr ? template.nameAr : template.name;
  const displayDescription = language === "ar" && template.descriptionAr ? template.descriptionAr : template.description;

  return (
    <Card
      className="group overflow-visible cursor-pointer transition-all duration-300 hover-elevate border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm"
      data-testid={`card-template-${template.id}`}
    >
      <div className={`h-1.5 bg-gradient-to-r ${catConfig.gradient} rounded-t-lg`} />
      
      <div className="aspect-[16/10] relative overflow-hidden bg-gradient-to-br from-muted/50 to-muted">
        {template.thumbnail ? (
          <img
            src={template.thumbnail}
            alt={displayName}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${catConfig.gradient} flex items-center justify-center shadow-lg`}>
              <CategoryIcon className="h-10 w-10 text-white" />
            </div>
          </div>
        )}
        
        <div className="absolute top-3 start-3 flex flex-col gap-2">
          <Badge 
            variant="outline" 
            className={`${intelligenceConfig.badgeClass} backdrop-blur-md border text-xs font-medium`}
          >
            <IntelligenceIcon className="h-3 w-3 me-1" />
            {intelligenceConfig.label[language as "en" | "ar"]}
          </Badge>
        </div>

        <div className="absolute top-3 end-3">
          <Badge 
            variant="outline" 
            className={`${monConfig.badgeClass} backdrop-blur-md border text-xs font-medium`}
          >
            <MonetizationIcon className="h-3 w-3 me-1" />
            {monConfig.label[language as "en" | "ar"]}
          </Badge>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 inset-x-4 flex gap-2">
            {onPreview && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview(template);
                }}
                data-testid={`button-preview-template-${template.id}`}
              >
                <Eye className="h-4 w-4 me-1" />
                {language === "ar" ? "معاينة" : "Preview"}
              </Button>
            )}
            <Button
              size="sm"
              className={`flex-1 bg-gradient-to-r ${catConfig.gradient} text-white border-0`}
              onClick={(e) => {
                e.stopPropagation();
                onUse(template);
              }}
              data-testid={`button-use-template-${template.id}`}
            >
              <Rocket className="h-4 w-4 me-1" />
              {language === "ar" ? "استخدام" : "Use"}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-foreground line-clamp-1" data-testid={`text-template-name-${template.id}`}>
              {displayName}
            </h3>
            {template.rating && template.rating > 0 && (
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span className="text-xs font-medium">{template.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          {displayDescription && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {displayDescription}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{template.setupTimeMinutes || 15} {language === "ar" ? "دقيقة" : "min"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            <span>{audienceConfig.label[language as "en" | "ar"]}</span>
          </div>
          {template.usageCount > 0 && (
            <div className="flex items-center gap-1">
              <BarChart3 className="h-3.5 w-3.5" />
              <span>{template.usageCount.toLocaleString()}</span>
            </div>
          )}
        </div>

        {template.frontendCapabilities && (template.frontendCapabilities as string[]).length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {(template.frontendCapabilities as string[]).slice(0, 3).map((cap, i) => (
              <Badge 
                key={i} 
                variant="secondary" 
                className="text-[10px] px-2 py-0 h-5"
              >
                {cap}
              </Badge>
            ))}
            {(template.frontendCapabilities as string[]).length > 3 && (
              <Badge variant="secondary" className="text-[10px] px-2 py-0 h-5">
                +{(template.frontendCapabilities as string[]).length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
