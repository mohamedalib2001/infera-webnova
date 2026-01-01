/**
 * AI Status Indicator Component
 * مكون مؤشر حالة الذكاء الاصطناعي
 * 
 * Displays AI status for any page/service:
 * - Mode badge (Auto/Manual/Disabled)
 * - Active model name and type
 * - Provider icon
 * - Fallback indicator
 */

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Bot, 
  Brain, 
  Sparkles, 
  Power, 
  PowerOff, 
  Settings2,
  AlertTriangle,
  Zap,
  Info
} from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { useQuery } from "@tanstack/react-query";

interface AIStatusInfo {
  serviceId: string;
  displayName: string;
  displayNameAr: string;
  aiMode: 'auto' | 'manual' | 'disabled';
  modelName: string;
  modelNameAr: string;
  modelType: string;
  provider: string;
  providerIcon: string;
  isFallbackActive: boolean;
  isEnabled: boolean;
  statusLabel: string;
  statusLabelAr: string;
}

interface AIStatusIndicatorProps {
  serviceId: string;
  language?: 'en' | 'ar';
  variant?: 'full' | 'compact' | 'badge-only';
  className?: string;
}

const ProviderIcon = ({ provider, className = "h-4 w-4" }: { provider: string; className?: string }) => {
  switch (provider) {
    case 'replit':
      return <Sparkles className={className} />;
    case 'anthropic':
      return <Brain className={className} />;
    case 'openai':
      return <Bot className={className} />;
    case 'google':
      return <SiGoogle className={className} />;
    default:
      return <Bot className={className} />;
  }
};

const ModeIcon = ({ mode }: { mode: 'auto' | 'manual' | 'disabled' }) => {
  switch (mode) {
    case 'auto':
      return <Zap className="h-3 w-3" />;
    case 'manual':
      return <Settings2 className="h-3 w-3" />;
    case 'disabled':
      return <PowerOff className="h-3 w-3" />;
    default:
      return <Power className="h-3 w-3" />;
  }
};

const getModeBadgeVariant = (mode: 'auto' | 'manual' | 'disabled'): "default" | "secondary" | "destructive" | "outline" => {
  switch (mode) {
    case 'auto':
      return 'default';
    case 'manual':
      return 'secondary';
    case 'disabled':
      return 'destructive';
    default:
      return 'outline';
  }
};

export function AIStatusIndicator({ 
  serviceId, 
  language = 'en', 
  variant = 'full',
  className = '' 
}: AIStatusIndicatorProps) {
  const { data: status, isLoading, error } = useQuery<AIStatusInfo>({
    queryKey: ['/api/ai/status', serviceId, language],
  });

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className={`flex items-center gap-2 text-muted-foreground text-sm ${className}`}>
        <AlertTriangle className="h-4 w-4" />
        <span>{language === 'ar' ? 'غير متاح' : 'Unavailable'}</span>
      </div>
    );
  }

  const modeLabel = status.aiMode === 'auto' 
    ? (language === 'ar' ? 'تلقائي' : 'Auto')
    : status.aiMode === 'manual'
    ? (language === 'ar' ? 'يدوي' : 'Manual')
    : (language === 'ar' ? 'معطل' : 'Disabled');

  const modelName = language === 'ar' ? status.modelNameAr || status.modelName : status.modelName;
  const statusLabel = language === 'ar' ? status.statusLabelAr : status.statusLabel;

  // Badge-only variant
  if (variant === 'badge-only') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={getModeBadgeVariant(status.aiMode)} 
            className={`gap-1 ${className}`}
            data-testid={`ai-status-badge-${serviceId}`}
          >
            <ModeIcon mode={status.aiMode} />
            {modeLabel}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{statusLabel}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 text-sm ${className}`} data-testid={`ai-status-compact-${serviceId}`}>
        <Badge variant={getModeBadgeVariant(status.aiMode)} className="gap-1">
          <ModeIcon mode={status.aiMode} />
          {modeLabel}
        </Badge>
        {status.isEnabled && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-muted-foreground">
                <ProviderIcon provider={status.provider} className="h-3 w-3" />
                <span className="truncate max-w-[120px]">{modelName}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{statusLabel}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    );
  }

  // Full variant (default)
  return (
    <div 
      className={`flex items-center gap-3 px-3 py-2 rounded-md bg-muted/50 ${className}`}
      data-testid={`ai-status-full-${serviceId}`}
    >
      <Badge variant={getModeBadgeVariant(status.aiMode)} className="gap-1">
        <ModeIcon mode={status.aiMode} />
        {modeLabel}
      </Badge>
      
      {status.isEnabled && status.aiMode !== 'disabled' ? (
        <>
          <div className="flex items-center gap-2">
            <ProviderIcon provider={status.provider} className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">{modelName}</span>
              <span className="text-xs text-muted-foreground">
                {status.modelType} • {status.provider === 'replit' ? 'ModelFarm' : status.provider}
              </span>
            </div>
          </div>
          
          {status.isFallbackActive && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="gap-1 text-amber-600 border-amber-600">
                  <AlertTriangle className="h-3 w-3" />
                  {language === 'ar' ? 'احتياطي' : 'Fallback'}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{language === 'ar' ? 'النموذج الاحتياطي نشط' : 'Fallback model is active'}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </>
      ) : (
        <span className="text-sm text-muted-foreground">
          {language === 'ar' ? 'الذكاء الاصطناعي معطل لهذه الخدمة' : 'AI disabled for this service'}
        </span>
      )}
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-4 w-4 text-muted-foreground cursor-help ml-auto" />
        </TooltipTrigger>
        <TooltipContent className="max-w-[300px]">
          <p className="font-medium">{language === 'ar' ? 'معلومات الذكاء الاصطناعي' : 'AI Information'}</p>
          <p className="text-sm">{statusLabel}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

/**
 * PoweredBy Component - Simple status line for chat/page headers
 * "Powered by Claude Sonnet 4 • ModelFarm • Auto Mode"
 */
export function AIStatusPoweredBy({ 
  serviceId, 
  language = 'en',
  className = '' 
}: { serviceId: string; language?: 'en' | 'ar'; className?: string }) {
  const { data: status, isLoading } = useQuery<AIStatusInfo>({
    queryKey: ['/api/ai/status', serviceId, language],
  });

  if (isLoading) {
    return <Skeleton className="h-4 w-48" />;
  }

  if (!status || status.aiMode === 'disabled') {
    return null;
  }

  const statusLabel = language === 'ar' ? status.statusLabelAr : status.statusLabel;

  return (
    <div 
      className={`flex items-center gap-2 text-xs text-muted-foreground ${className}`}
      data-testid={`ai-powered-by-${serviceId}`}
    >
      <ProviderIcon provider={status.provider} className="h-3 w-3" />
      <span>{statusLabel}</span>
    </div>
  );
}

/**
 * Mode Toggle Badge - Quick visual indicator for sidebar items
 */
export function AIModeToggleBadge({ 
  mode, 
  size = 'sm' 
}: { 
  mode: 'auto' | 'manual' | 'disabled'; 
  size?: 'sm' | 'md' 
}) {
  const sizeClasses = size === 'sm' ? 'h-2 w-2' : 'h-3 w-3';
  
  const colorClasses = {
    auto: 'bg-green-500',
    manual: 'bg-blue-500', 
    disabled: 'bg-gray-400',
  };

  return (
    <span 
      className={`rounded-full ${sizeClasses} ${colorClasses[mode]}`}
      title={mode.charAt(0).toUpperCase() + mode.slice(1)}
    />
  );
}
