import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Globe, 
  Terminal, 
  Sparkles,
  Maximize2,
  Minimize2,
  RotateCcw,
  ExternalLink,
  RefreshCw,
  ChevronDown,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type ViewportMode = 'desktop' | 'tablet' | 'mobile' | 'responsive';
export type ActivePanel = 'ai' | 'preview' | 'terminal' | 'browser' | null;

interface NovaToolbarProps {
  activePanel: ActivePanel;
  onPanelChange: (panel: ActivePanel) => void;
  viewportMode: ViewportMode;
  onViewportChange: (mode: ViewportMode) => void;
  isFullscreen?: boolean;
  onFullscreenToggle?: () => void;
  onRefresh?: () => void;
  onOpenExternal?: () => void;
  previewUrl?: string;
  isGenerating?: boolean;
  language?: 'ar' | 'en';
}

const t = {
  ar: {
    desktop: "سطح المكتب",
    tablet: "جهاز لوحي",
    mobile: "جوال",
    responsive: "متجاوب",
    ai: "الذكاء الاصطناعي",
    preview: "المعاينة",
    terminal: "الطرفية",
    browser: "المتصفح",
    permissions: "الصلاحيات",
    fullscreen: "ملء الشاشة",
    exitFullscreen: "الخروج من ملء الشاشة",
    refresh: "تحديث",
    openExternal: "فتح في نافذة جديدة",
    viewports: "أحجام العرض",
  },
  en: {
    desktop: "Desktop",
    tablet: "Tablet",
    mobile: "Mobile",
    responsive: "Responsive",
    ai: "AI",
    preview: "Preview",
    terminal: "Terminal",
    browser: "Browser",
    permissions: "Permissions",
    fullscreen: "Fullscreen",
    exitFullscreen: "Exit Fullscreen",
    refresh: "Refresh",
    openExternal: "Open External",
    viewports: "Viewports",
  },
};

export function NovaToolbar({
  activePanel,
  onPanelChange,
  viewportMode,
  onViewportChange,
  isFullscreen = false,
  onFullscreenToggle,
  onRefresh,
  onOpenExternal,
  previewUrl,
  isGenerating = false,
  language = 'en',
}: NovaToolbarProps) {
  const txt = t[language];
  const [isMobile, setIsMobile] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const viewportOptions = [
    { mode: 'desktop' as const, icon: Monitor, label: txt.desktop, width: '100%' },
    { mode: 'tablet' as const, icon: Tablet, label: txt.tablet, width: '768px' },
    { mode: 'mobile' as const, icon: Smartphone, label: txt.mobile, width: '375px' },
  ];

  const panelOptions = [
    { panel: 'ai' as const, icon: Sparkles, label: txt.ai },
    { panel: 'preview' as const, icon: Globe, label: txt.preview },
    { panel: 'terminal' as const, icon: Terminal, label: txt.terminal },
  ];

  return (
    <div 
      className={cn(
        "flex items-center justify-between gap-2 px-3 py-2 bg-background/95 backdrop-blur-sm border-b",
        "sticky top-0 z-50"
      )}
      data-testid="nova-toolbar"
    >
      <div className="flex items-center gap-2">
        <div 
          className="flex items-center bg-muted rounded-lg p-1 gap-0.5"
          data-testid="viewport-switcher"
        >
          {isMobile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 px-2">
                  {viewportOptions.find(v => v.mode === viewportMode)?.icon && (
                    <Monitor className="h-4 w-4" />
                  )}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {viewportOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.mode}
                    onClick={() => onViewportChange(option.mode)}
                    className="gap-2"
                    data-testid={`viewport-${option.mode}-dropdown`}
                  >
                    <option.icon className="h-4 w-4" />
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            viewportOptions.map((option) => (
              <Tooltip key={option.mode}>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewportMode === option.mode ? "secondary" : "ghost"}
                    size="icon"
                    className={cn(
                      "h-8 w-8 transition-all",
                      viewportMode === option.mode && "bg-background shadow-sm"
                    )}
                    onClick={() => onViewportChange(option.mode)}
                    data-testid={`viewport-${option.mode}`}
                  >
                    <option.icon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">{option.label}</TooltipContent>
              </Tooltip>
            ))
          )}
        </div>

        <div className="h-6 w-px bg-border mx-1" />

        <div 
          className="flex items-center bg-muted rounded-lg p-1 gap-0.5"
          data-testid="panel-switcher"
        >
          {panelOptions.map((option) => (
            <Tooltip key={option.panel}>
              <TooltipTrigger asChild>
                <Button
                  variant={activePanel === option.panel ? "secondary" : "ghost"}
                  size="icon"
                  className={cn(
                    "h-8 w-8 transition-all relative",
                    activePanel === option.panel && "bg-background shadow-sm",
                    option.panel === 'ai' && isGenerating && "animate-pulse"
                  )}
                  onClick={() => onPanelChange(option.panel)}
                  data-testid={`panel-${option.panel}`}
                >
                  <option.icon className={cn(
                    "h-4 w-4",
                    option.panel === 'ai' && "text-violet-500"
                  )} />
                  {option.panel === 'ai' && isGenerating && (
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-violet-500 rounded-full animate-ping" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">{option.label}</TooltipContent>
            </Tooltip>
          ))}
        </div>

        <div className="h-6 w-px bg-border mx-1" />

        {/* Permissions Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setLocation('/nova/permissions')}
              data-testid="button-nova-permissions"
            >
              <Shield className="h-4 w-4 text-amber-500" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{txt.permissions}</TooltipContent>
        </Tooltip>
      </div>

      <div className="flex items-center gap-1">
        {activePanel === 'preview' && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onRefresh}
                  data-testid="button-refresh-preview"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">{txt.refresh}</TooltipContent>
            </Tooltip>

            {previewUrl && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={onOpenExternal}
                    data-testid="button-open-external"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">{txt.openExternal}</TooltipContent>
              </Tooltip>
            )}
          </>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onFullscreenToggle}
              data-testid="button-fullscreen"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {isFullscreen ? txt.exitFullscreen : txt.fullscreen}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

export function ViewportFrame({
  children,
  mode,
  className,
}: {
  children: React.ReactNode;
  mode: ViewportMode;
  className?: string;
}) {
  const getFrameStyles = () => {
    switch (mode) {
      case 'mobile':
        return { maxWidth: '375px', margin: '0 auto' };
      case 'tablet':
        return { maxWidth: '768px', margin: '0 auto' };
      default:
        return { width: '100%' };
    }
  };

  return (
    <div 
      className={cn(
        "transition-all duration-300 h-full overflow-auto",
        mode !== 'desktop' && "bg-muted/30 p-4",
        className
      )}
    >
      <div 
        style={getFrameStyles()}
        className={cn(
          "h-full bg-background transition-all duration-300",
          mode !== 'desktop' && "rounded-lg shadow-lg border overflow-hidden"
        )}
      >
        {children}
      </div>
    </div>
  );
}
