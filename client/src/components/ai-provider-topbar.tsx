import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { SiOpenai, SiGoogle } from "react-icons/si";
import { Brain, Sparkles, Cpu, Zap, Bot, CircuitBoard, MessageCircle, Users, Code, Hammer, BarChart3, Lightbulb, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIProvider {
  id: string;
  name: string;
  nameAr?: string;
  icon: string;
  status: 'active' | 'degraded' | 'available';
  isFeeding: boolean;
  capabilities: string[];
  model: string | null;
  type?: 'external' | 'infera';
  brandColor?: string;
  serviceLevel?: string;
}

interface TopbarProviderData {
  providers: AIProvider[];
  inferaModels: AIProvider[];
  activeProvider: string | null;
}

const providerIcons: Record<string, any> = {
  claude: Brain,
  anthropic: Brain,
  openai: SiOpenai,
  gemini: SiGoogle,
  google: SiGoogle,
  llama: Bot,
  meta: Bot,
  replit: Sparkles,
  groq: Zap,
  mistral: CircuitBoard,
  cohere: Cpu,
  ai: Sparkles,
  MessageCircle: MessageCircle,
  Users: Users,
  Code: Code,
  Hammer: Hammer,
  BarChart3: BarChart3,
  Lightbulb: Lightbulb,
  Wand2: Wand2,
  chat: MessageCircle,
  consult: Users,
  code: Code,
  build: Hammer,
  analyze: BarChart3,
  assist: Lightbulb,
};

const providerColors: Record<string, string> = {
  claude: "text-orange-500",
  anthropic: "text-orange-500",
  openai: "text-green-500",
  gemini: "text-blue-500",
  google: "text-blue-500",
  llama: "text-purple-500",
  meta: "text-purple-500",
  replit: "text-amber-500",
  groq: "text-cyan-500",
  mistral: "text-indigo-500",
  cohere: "text-pink-500",
  ai: "text-muted-foreground",
  chat: "text-blue-500",
  consult: "text-purple-500",
  code: "text-emerald-500",
  build: "text-amber-500",
  analyze: "text-red-500",
  assist: "text-cyan-500",
};

const inferaGradients: Record<string, string> = {
  chat: "from-blue-500 to-blue-600",
  consult: "from-purple-500 to-purple-600",
  code: "from-emerald-500 to-emerald-600",
  build: "from-amber-500 to-amber-600",
  analyze: "from-red-500 to-red-600",
  assist: "from-cyan-500 to-cyan-600",
};

export function AIProviderTopbar() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isSovereign = user?.role === 'owner' || user?.role === 'sovereign';
  
  const { data, isLoading } = useQuery<TopbarProviderData | null>({
    queryKey: ['/api/sovereign/ai-providers/topbar'],
    enabled: !!user,
    refetchInterval: 120000,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  const t = {
    ar: {
      aiProviders: "مزودو الذكاء الاصطناعي",
      inferaModels: "نماذج INFERA",
      active: "نشط",
      degraded: "متدني",
      available: "متاح",
      feeding: "يغذي الطلبات الحالية",
      model: "النموذج",
      noProviders: "لا يوجد مزودين مُعدين",
      core: "أساسي",
      pro: "احترافي",
      elite: "نخبوي",
      enterprise: "مؤسسي",
      sovereign: "سيادي",
    },
    en: {
      aiProviders: "AI Providers",
      inferaModels: "INFERA Models",
      active: "Active",
      degraded: "Degraded",
      available: "Available",
      feeding: "Feeding current requests",
      model: "Model",
      noProviders: "No providers configured",
      core: "Core",
      pro: "Professional",
      elite: "Elite",
      enterprise: "Enterprise",
      sovereign: "Sovereign",
    },
  };
  
  const text = t[language] || t.ar;

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-1 px-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-6 w-6 rounded-md bg-muted animate-pulse"
          />
        ))}
      </div>
    );
  }

  const inferaModels = data?.inferaModels || [];
  const externalProviders = data?.providers || [];
  
  if (inferaModels.length === 0 && externalProviders.length === 0) {
    return null;
  }

  const serviceLevelColors: Record<string, string> = {
    core: "bg-blue-500/10 text-blue-600",
    pro: "bg-purple-500/10 text-purple-600",
    elite: "bg-amber-500/10 text-amber-600",
    enterprise: "bg-red-500/10 text-red-600",
    sovereign: "bg-emerald-500/10 text-emerald-600",
  };

  const renderInferaModel = (model: AIProvider) => {
    const iconKey = model.icon || (providerIcons[model.id.replace('infera-', '')] ? model.id.replace('infera-', '') : 'chat');
    const IconComponent = providerIcons[iconKey] || providerIcons[model.icon] || MessageCircle;
    const gradient = inferaGradients[iconKey] || "from-blue-500 to-blue-600";
    const colorClass = providerColors[iconKey] || "text-blue-500";
    
    return (
      <Tooltip key={model.id}>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "relative flex items-center justify-center h-7 w-7 rounded-md transition-all duration-300",
              "bg-gradient-to-br",
              gradient,
              "shadow-sm hover:shadow-md hover:scale-105",
              model.status === 'active' && "ring-1 ring-white/30",
            )}
            data-testid={`infera-model-icon-${model.id}`}
          >
            <IconComponent className="h-4 w-4 text-white drop-shadow-sm" />
            {model.status === 'active' && (
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-400 ring-1 ring-white animate-pulse" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          className="max-w-xs"
          data-testid={`infera-model-tooltip-${model.id}`}
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">{language === 'ar' && model.nameAr ? model.nameAr : model.name}</span>
              {model.serviceLevel && (
                <Badge className={cn("text-xs", serviceLevelColors[model.serviceLevel] || serviceLevelColors.core)}>
                  {text[model.serviceLevel as keyof typeof text] || model.serviceLevel}
                </Badge>
              )}
            </div>
            <Badge 
              variant={model.status === 'active' ? 'default' : 'outline'}
              className="text-xs"
            >
              {model.status === 'active' ? text.active : text.available}
            </Badge>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  };

  const renderExternalProvider = (provider: AIProvider) => {
    const IconComponent = providerIcons[provider.icon] || providerIcons.ai;
    const colorClass = provider.isFeeding 
      ? providerColors[provider.icon] || providerColors.ai
      : "text-muted-foreground/50";
    
    return (
      <Tooltip key={provider.id}>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "relative flex items-center justify-center h-7 w-7 rounded-md transition-all duration-300",
              provider.isFeeding && "ring-2 ring-offset-1 ring-offset-background",
              provider.isFeeding && provider.status === 'active' && "ring-green-500/50 bg-green-500/10",
              provider.isFeeding && provider.status === 'degraded' && "ring-yellow-500/50 bg-yellow-500/10",
              !provider.isFeeding && "opacity-40 grayscale hover:opacity-70 hover:grayscale-0",
            )}
            data-testid={`ai-provider-icon-${provider.id}`}
          >
            <IconComponent 
              className={cn(
                "h-4 w-4 transition-all duration-300",
                colorClass,
                provider.isFeeding && "drop-shadow-[0_0_8px_currentColor]"
              )} 
            />
            {provider.isFeeding && (
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          className="max-w-xs"
          data-testid={`ai-provider-tooltip-${provider.id}`}
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{provider.name}</span>
              <Badge 
                variant={
                  provider.status === 'active' ? 'default' : 
                  provider.status === 'degraded' ? 'secondary' : 'outline'
                }
                className="text-xs"
              >
                {provider.status === 'active' ? text.active : 
                 provider.status === 'degraded' ? text.degraded : text.available}
              </Badge>
            </div>
            {provider.isFeeding && (
              <p className="text-xs text-green-500 flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {text.feeding}
              </p>
            )}
            {provider.model && (
              <p className="text-xs text-muted-foreground">
                {text.model}: <code className="text-xs bg-muted px-1 rounded">{provider.model}</code>
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div 
      className="flex items-center gap-1 px-1"
      data-testid="ai-provider-topbar"
    >
      {inferaModels.length > 0 && (
        <div className="flex items-center gap-1 px-1.5 py-1 rounded-md bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
          {inferaModels.map(renderInferaModel)}
        </div>
      )}
      
      {isSovereign && externalProviders.length > 0 && (
        <>
          {inferaModels.length > 0 && (
            <div className="h-5 w-px bg-border/50 mx-1" />
          )}
          <div className="flex items-center gap-1 px-1.5 py-1 rounded-md bg-background/50 border border-border/30">
            {externalProviders.map(renderExternalProvider)}
          </div>
        </>
      )}
    </div>
  );
}
