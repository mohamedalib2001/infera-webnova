import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type PipelineStage = 'analyzing' | 'creating' | 'setup' | 'ready';

interface LoadingPipelineProps {
  currentStage: PipelineStage;
  language?: 'ar' | 'en';
  onComplete?: () => void;
}

const stages: { key: PipelineStage; en: string; ar: string; descEn: string; descAr: string }[] = [
  { 
    key: 'analyzing', 
    en: 'Analyzing', 
    ar: 'تحليل',
    descEn: 'Analyzing platform requirements...',
    descAr: 'جاري تحليل متطلبات المنصة...'
  },
  { 
    key: 'creating', 
    en: 'Creating', 
    ar: 'إنشاء',
    descEn: 'Creating platform structure...',
    descAr: 'جاري إنشاء هيكل المنصة...'
  },
  { 
    key: 'setup', 
    en: 'Setup', 
    ar: 'إعداد',
    descEn: 'Configuring settings and services...',
    descAr: 'جاري ضبط الإعدادات والخدمات...'
  },
  { 
    key: 'ready', 
    en: 'Ready', 
    ar: 'جاهز',
    descEn: 'Platform is ready!',
    descAr: 'المنصة جاهزة!'
  },
];

export function LoadingPipeline({ currentStage, language = 'en', onComplete }: LoadingPipelineProps) {
  const currentIndex = stages.findIndex(s => s.key === currentStage);
  const progress = ((currentIndex + 1) / stages.length) * 100;
  
  useEffect(() => {
    if (currentStage === 'ready' && onComplete) {
      const timer = setTimeout(onComplete, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentStage, onComplete]);

  const currentStageData = stages[currentIndex];

  return (
    <Card className="w-full max-w-lg mx-auto" data-testid="loading-pipeline">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-lg">
          {language === 'ar' ? 'جاري تجهيز المنصة' : 'Preparing Platform'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Progress value={progress} className="h-2" data-testid="progress-bar" />
          <p className="text-sm text-muted-foreground text-center">
            {Math.round(progress)}%
          </p>
        </div>

        <div className="space-y-3">
          {stages.map((stage, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isPending = index > currentIndex;

            return (
              <div 
                key={stage.key}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-md transition-all",
                  isCompleted && "bg-green-500/10",
                  isCurrent && "bg-primary/10 border border-primary/20",
                  isPending && "opacity-50"
                )}
                data-testid={`stage-${stage.key}`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-medium text-sm",
                    isCurrent && "text-primary"
                  )}>
                    {language === 'ar' ? stage.ar : stage.en}
                  </p>
                  {isCurrent && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {language === 'ar' ? stage.descAr : stage.descEn}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {language === 'ar' ? currentStageData?.descAr : currentStageData?.descEn}
        </p>
      </CardContent>
    </Card>
  );
}

export function useLoadingPipeline(autoProgress = false) {
  const [stage, setStage] = useState<PipelineStage>('analyzing');
  const [isLoading, setIsLoading] = useState(false);

  const start = () => {
    setIsLoading(true);
    setStage('analyzing');
  };

  const nextStage = () => {
    setStage(current => {
      switch (current) {
        case 'analyzing': return 'creating';
        case 'creating': return 'setup';
        case 'setup': return 'ready';
        default: return current;
      }
    });
  };

  const complete = () => {
    setStage('ready');
    setTimeout(() => setIsLoading(false), 1500);
  };

  const reset = () => {
    setStage('analyzing');
    setIsLoading(false);
  };

  useEffect(() => {
    if (autoProgress && isLoading && stage !== 'ready') {
      const timer = setTimeout(nextStage, 2000);
      return () => clearTimeout(timer);
    }
  }, [autoProgress, isLoading, stage]);

  return { stage, isLoading, start, nextStage, complete, reset, setStage };
}
