import { useLanguage } from "@/hooks/use-language";

interface ThinkingIndicatorProps {
  isActive: boolean;
}

export function ThinkingIndicator({ isActive }: ThinkingIndicatorProps) {
  const { isRtl } = useLanguage();
  
  if (!isActive) return null;
  
  return (
    <div 
      className="flex items-center justify-center gap-3 py-4 px-6"
      data-testid="status-generating"
      aria-live="polite"
    >
      <div className="thinking-container">
        <div className="thinking-orb" />
        <div className="thinking-ring" />
        <div className="thinking-ring thinking-ring-2" />
        <div className="thinking-particles">
          <span /><span /><span /><span /><span /><span />
        </div>
      </div>
      
      <div className={`flex flex-col ${isRtl ? 'items-end' : 'items-start'}`}>
        <span className="text-sm font-medium bg-gradient-to-r from-violet-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent animate-pulse">
          {isRtl ? "ذكاء المنصة يعمل..." : "AI is crafting your code..."}
        </span>
        <span className="text-xs text-muted-foreground">
          {isRtl ? "يستغرق ٥-١٠ ثوانٍ" : "Usually 5-10 seconds"}
        </span>
      </div>
    </div>
  );
}
