import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { SiOpenai, SiGoogle } from "react-icons/si";
import { Brain, Sparkles, Cpu, Zap, Bot, CircuitBoard } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIProvider {
  id: string;
  name: string;
  icon: string;
  status: 'active' | 'degraded' | 'available';
  isFeeding: boolean;
  capabilities: string[];
  model: string | null;
}

interface TopbarProviderData {
  providers: AIProvider[];
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
};

export function AIProviderTopbar() {
  const { user } = useAuth();
  const { language } = useLanguage();
  
  const { data, isLoading } = useQuery<TopbarProviderData | null>({
    queryKey: ['/api/sovereign/ai-providers/topbar'],
    enabled: !!user && (user.role === 'owner' || user.role === 'sovereign'),
    refetchInterval: 120000,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  const t = {
    ar: {
      aiProviders: "مزودو الذكاء الاصطناعي",
      active: "نشط",
      degraded: "متدني",
      available: "متاح",
      feeding: "يغذي الطلبات الحالية",
      model: "النموذج",
      noProviders: "لا يوجد مزودين مُعدين",
    },
    en: {
      aiProviders: "AI Providers",
      active: "Active",
      degraded: "Degraded",
      available: "Available",
      feeding: "Feeding current requests",
      model: "Model",
      noProviders: "No providers configured",
    },
  };
  
  const text = t[language] || t.ar;

  if (!user || (user.role !== 'owner' && user.role !== 'sovereign')) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-1 px-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-5 w-5 rounded-full bg-muted animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!data || !data.providers || data.providers.length === 0) {
    return null;
  }

  return (
    <div 
      className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-background/50 border border-border/50"
      data-testid="ai-provider-topbar"
    >
      {data.providers.map((provider) => {
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
      })}
    </div>
  );
}
