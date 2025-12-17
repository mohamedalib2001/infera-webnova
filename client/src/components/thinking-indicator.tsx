import { useLanguage } from "@/hooks/use-language";
import { useState, useEffect } from "react";

interface ThinkingIndicatorProps {
  isActive: boolean;
}

export function ThinkingIndicator({ isActive }: ThinkingIndicatorProps) {
  const { isRtl } = useLanguage();
  const [seconds, setSeconds] = useState(0);
  const [phase, setPhase] = useState(0);
  
  const phases = isRtl 
    ? ["جاري التحليل...", "بناء الهيكل...", "تصميم الواجهة...", "إضافة التفاعلات...", "المراجعة النهائية..."]
    : ["Analyzing request...", "Building structure...", "Designing interface...", "Adding interactions...", "Final review..."];
  
  useEffect(() => {
    if (!isActive) {
      setSeconds(0);
      setPhase(0);
      return;
    }
    
    const timer = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    
    const phaseTimer = setInterval(() => {
      setPhase(prev => (prev + 1) % phases.length);
    }, 2500);
    
    return () => {
      clearInterval(timer);
      clearInterval(phaseTimer);
    };
  }, [isActive, phases.length]);
  
  if (!isActive) return null;
  
  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    if (mins > 0) {
      return isRtl ? `${mins}:${secs.toString().padStart(2, '0')} دقيقة` : `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return isRtl ? `${secs} ثانية` : `${secs}s`;
  };
  
  return (
    <div 
      className="flex items-center justify-center gap-4 py-5 px-6"
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
      
      <div className={`flex flex-col gap-1 ${isRtl ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold bg-gradient-to-r from-violet-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
            {phases[phase]}
          </span>
          <span className="inline-flex items-center justify-center min-w-[3rem] px-2 py-0.5 text-xs font-mono font-bold rounded-full bg-gradient-to-r from-violet-500/20 to-cyan-500/20 text-violet-300 border border-violet-500/30 tabular-nums">
            {formatTime(seconds)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-xs text-muted-foreground">
            {isRtl ? "الذكاء الاصطناعي يبني موقعك" : "AI is building your website"}
          </span>
        </div>
      </div>
    </div>
  );
}
