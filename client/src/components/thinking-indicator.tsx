import { useLanguage } from "@/hooks/use-language";
import { useState, useEffect, useRef } from "react";
import { Check, Loader2, Clock, Sparkles, Code, Palette, Wand2, FileCode, Bug, Zap } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LogEntry {
  id: string;
  message: string;
  messageEn: string;
  status: 'pending' | 'active' | 'completed';
  timestamp: Date;
  icon: 'analyze' | 'structure' | 'design' | 'code' | 'review' | 'optimize';
}

interface ThinkingIndicatorProps {
  isActive: boolean;
  currentStep?: string;
  logs?: string[];
}

const GENERATION_STEPS = [
  { id: 'analyze', message: 'تحليل مواصفات المنصة السيادية', messageEn: 'Analyzing sovereign platform specifications', icon: 'analyze' as const, duration: 2000 },
  { id: 'blueprint', message: 'إنشاء المخطط الذكي (Blueprint)', messageEn: 'Creating Smart Blueprint', icon: 'structure' as const, duration: 3000 },
  { id: 'compliance', message: 'إعداد متطلبات الامتثال والحوكمة', messageEn: 'Configuring compliance & governance requirements', icon: 'design' as const, duration: 4000 },
  { id: 'codegen', message: 'توليد الكود السيادي', messageEn: 'Generating sovereign codebase', icon: 'code' as const, duration: 8000 },
  { id: 'runtime', message: 'تهيئة طبقة التشغيل (Runtime)', messageEn: 'Initializing Runtime Layer', icon: 'code' as const, duration: 5000 },
  { id: 'deploy', message: 'نشر المنصة وتفعيل المراقبة', messageEn: 'Deploying platform & enabling monitoring', icon: 'optimize' as const, duration: 4000 },
  { id: 'autonomous', message: 'تفعيل التشغيل الذاتي والشفاء الذاتي', messageEn: 'Activating autonomous operation & self-healing', icon: 'review' as const, duration: 3000 },
];

export function ThinkingIndicator({ isActive, currentStep, logs }: ThinkingIndicatorProps) {
  const { isRtl } = useLanguage();
  const [seconds, setSeconds] = useState(0);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isActive) {
      setSeconds(0);
      setLogEntries([]);
      setCurrentStepIndex(0);
      return;
    }
    
    const timer = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;
    
    let timeoutId: NodeJS.Timeout;
    let accumulated = 0;
    
    const addStep = (index: number) => {
      if (index >= GENERATION_STEPS.length || !isActive) return;
      
      const step = GENERATION_STEPS[index];
      
      setLogEntries(prev => {
        const updated = prev.map(entry => ({
          ...entry,
          status: 'completed' as const
        }));
        
        return [...updated, {
          id: step.id,
          message: step.message,
          messageEn: step.messageEn,
          status: 'active' as const,
          timestamp: new Date(),
          icon: step.icon
        }];
      });
      
      setCurrentStepIndex(index);
      
      if (index < GENERATION_STEPS.length - 1) {
        timeoutId = setTimeout(() => addStep(index + 1), step.duration);
      }
    };
    
    addStep(0);
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isActive]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logEntries]);
  
  if (!isActive) return null;
  
  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    if (mins > 0) {
      return isRtl ? `${mins}:${secs.toString().padStart(2, '0')} دقيقة` : `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return isRtl ? `${secs} ثانية` : `${secs}s`;
  };

  const getIcon = (iconType: string, status: string) => {
    const baseClass = "w-4 h-4";
    const activeClass = status === 'active' ? "text-violet-400 animate-pulse" : 
                        status === 'completed' ? "text-green-400" : "text-muted-foreground";
    
    const iconMap: Record<string, JSX.Element> = {
      analyze: <Sparkles className={`${baseClass} ${activeClass}`} />,
      structure: <FileCode className={`${baseClass} ${activeClass}`} />,
      design: <Palette className={`${baseClass} ${activeClass}`} />,
      code: <Code className={`${baseClass} ${activeClass}`} />,
      review: <Bug className={`${baseClass} ${activeClass}`} />,
      optimize: <Zap className={`${baseClass} ${activeClass}`} />,
    };
    
    return iconMap[iconType] || <Wand2 className={`${baseClass} ${activeClass}`} />;
  };

  const currentPhase = GENERATION_STEPS[currentStepIndex];
  
  return (
    <div 
      className="flex flex-col gap-4 py-4 px-4 max-w-md mx-auto"
      data-testid="status-generating"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="thinking-container">
            <div className="thinking-orb" />
            <div className="thinking-ring" />
            <div className="thinking-ring thinking-ring-2" />
            <div className="thinking-particles">
              <span /><span /><span /><span /><span /><span />
            </div>
          </div>
          
          <div className={`flex flex-col gap-0.5 ${isRtl ? 'items-end' : 'items-start'}`}>
            <span className="text-sm font-semibold bg-gradient-to-r from-violet-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              {isRtl ? currentPhase?.message : currentPhase?.messageEn}
            </span>
            <span className="text-xs text-muted-foreground">
              {isRtl ? "الذكاء الاصطناعي يبني منصتك السيادية" : "AI is building your sovereign platform"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-violet-400" />
          <span className="inline-flex items-center justify-center min-w-[3rem] px-2 py-0.5 text-xs font-mono font-bold rounded-full bg-gradient-to-r from-violet-500/20 to-cyan-500/20 text-violet-300 border border-violet-500/30 tabular-nums">
            {formatTime(seconds)}
          </span>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="bg-black/40 rounded-lg border border-violet-500/20 overflow-hidden"
      >
        <div className="flex items-center justify-between px-3 py-1.5 bg-violet-500/10 border-b border-violet-500/20">
          <span className="text-[10px] font-medium text-violet-400 uppercase tracking-wider">
            {isRtl ? "سجل العمليات" : "Activity Log"}
          </span>
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500/60" />
            <span className="w-2 h-2 rounded-full bg-yellow-500/60" />
            <span className="w-2 h-2 rounded-full bg-green-500/60" />
          </div>
        </div>
        
        <ScrollArea className="h-32">
          <div className="p-2 space-y-1.5 font-mono text-xs">
            {logEntries.map((entry, index) => (
              <div 
                key={entry.id + index}
                className={`flex items-start gap-2 py-1 px-2 rounded transition-all duration-300 ${
                  entry.status === 'active' 
                    ? 'bg-violet-500/10 border-l-2 border-violet-500' 
                    : entry.status === 'completed'
                    ? 'opacity-70'
                    : 'opacity-40'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {entry.status === 'active' ? (
                    <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin" />
                  ) : entry.status === 'completed' ? (
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    getIcon(entry.icon, entry.status)
                  )}
                </div>
                <div className={`flex-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                  <span className={`${
                    entry.status === 'active' 
                      ? 'text-violet-300' 
                      : entry.status === 'completed'
                      ? 'text-green-300/80'
                      : 'text-muted-foreground'
                  }`}>
                    {isRtl ? entry.message : entry.messageEn}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground/60 tabular-nums flex-shrink-0">
                  {entry.timestamp.toLocaleTimeString('en-US', { 
                    hour12: false, 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </span>
              </div>
            ))}
            
            {logEntries.length > 0 && logEntries[logEntries.length - 1].status === 'active' && (
              <div className="flex items-center gap-1.5 py-1 px-2 text-violet-400/60">
                <span className="w-1 h-1 rounded-full bg-violet-400 animate-pulse" />
                <span className="w-1 h-1 rounded-full bg-violet-400 animate-pulse" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-1 rounded-full bg-violet-400 animate-pulse" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="flex items-center justify-center gap-2">
        <div className="flex-1 h-1.5 bg-violet-500/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-cyan-500 rounded-full transition-all duration-500"
            style={{ 
              width: `${((currentStepIndex + 1) / GENERATION_STEPS.length) * 100}%` 
            }}
          />
        </div>
        <span className="text-[10px] text-muted-foreground tabular-nums">
          {currentStepIndex + 1}/{GENERATION_STEPS.length}
        </span>
      </div>
    </div>
  );
}
