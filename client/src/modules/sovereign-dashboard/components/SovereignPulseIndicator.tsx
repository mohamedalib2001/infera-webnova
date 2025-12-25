/**
 * Sovereign Pulse Indicator - مؤشر النبض السيادي
 * 
 * قلب عصبي يراقب صحة النظام لحظيًا
 * يظهر فقط للمالك السيادي
 * 
 * Features:
 * - Visual holographic pulse
 * - GPU-friendly CSS animations
 * - Updates every 3-5 seconds
 * - Read-only, no side effects
 */

import { useState, useEffect, useCallback, memo } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '@/hooks/use-language';
import './sovereign-pulse.css';

interface PulseState {
  score: number;
  platformSpeed: 'slow' | 'moderate' | 'fast' | 'excellent';
  pageStability: 'unstable' | 'moderate' | 'stable' | 'excellent';
  lastUpdate: number;
}

interface SovereignPulseIndicatorProps {
  isSovereignOwner?: boolean;
  sovereignMode?: boolean;
}

function SovereignPulseIndicatorComponent({ 
  isSovereignOwner = true, 
  sovereignMode = true 
}: SovereignPulseIndicatorProps) {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  
  const [pulseState, setPulseState] = useState<PulseState>({
    score: 75,
    platformSpeed: 'fast',
    pageStability: 'stable',
    lastUpdate: Date.now(),
  });

  const calculatePulseScore = useCallback((): PulseState => {
    const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    let loadScore = 80;
    if (timing) {
      const loadTime = timing.loadEventEnd - timing.startTime;
      loadScore = Math.max(0, Math.min(100, 100 - (loadTime / 100)));
    }

    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(e => e.name === 'first-contentful-paint');
    let fcpScore = 80;
    if (fcpEntry) {
      fcpScore = Math.max(0, Math.min(100, 100 - (fcpEntry.startTime / 50)));
    }

    let memoryScore = 75;
    if ((performance as any).memory) {
      const usedHeap = (performance as any).memory.usedJSHeapSize;
      const totalHeap = (performance as any).memory.totalJSHeapSize;
      memoryScore = Math.max(0, Math.min(100, 100 - ((usedHeap / totalHeap) * 100)));
    }

    const domElements = document.querySelectorAll('*').length;
    const domScore = Math.max(0, Math.min(100, 100 - (domElements / 50)));

    const finalScore = Math.round(
      (loadScore * 0.3) +
      (fcpScore * 0.25) +
      (memoryScore * 0.25) +
      (domScore * 0.2)
    );

    let platformSpeed: PulseState['platformSpeed'];
    if (finalScore <= 40) platformSpeed = 'slow';
    else if (finalScore <= 70) platformSpeed = 'moderate';
    else if (finalScore <= 90) platformSpeed = 'fast';
    else platformSpeed = 'excellent';

    let pageStability: PulseState['pageStability'];
    if (domScore <= 40) pageStability = 'unstable';
    else if (domScore <= 60) pageStability = 'moderate';
    else if (domScore <= 85) pageStability = 'stable';
    else pageStability = 'excellent';

    return {
      score: finalScore,
      platformSpeed,
      pageStability,
      lastUpdate: Date.now(),
    };
  }, []);

  useEffect(() => {
    if (!isSovereignOwner && !sovereignMode) return;

    const initialState = calculatePulseScore();
    setPulseState(initialState);

    const intervalId = setInterval(() => {
      const newState = calculatePulseScore();
      setPulseState(newState);
    }, 4000);

    const handlePageChange = () => {
      setTimeout(() => {
        const newState = calculatePulseScore();
        setPulseState(newState);
      }, 1000);
    };

    window.addEventListener('popstate', handlePageChange);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('popstate', handlePageChange);
    };
  }, [isSovereignOwner, sovereignMode, calculatePulseScore]);

  if (!isSovereignOwner && !sovereignMode) {
    return null;
  }

  const getPulseClass = (): string => {
    const { score } = pulseState;
    if (score <= 40) return 'pulse-slow';
    if (score <= 70) return 'pulse-moderate';
    if (score <= 90) return 'pulse-fast';
    return 'pulse-excellent';
  };

  const getSpeedLabel = (): string => {
    const labels = {
      slow: { en: 'Slow', ar: 'بطيئة' },
      moderate: { en: 'Moderate', ar: 'متوسطة' },
      fast: { en: 'Fast', ar: 'سريعة' },
      excellent: { en: 'Excellent', ar: 'ممتازة' },
    };
    return isAr ? labels[pulseState.platformSpeed].ar : labels[pulseState.platformSpeed].en;
  };

  const getStabilityLabel = (): string => {
    const labels = {
      unstable: { en: 'Unstable', ar: 'غير مستقرة' },
      moderate: { en: 'Moderate', ar: 'متوسطة' },
      stable: { en: 'Stable', ar: 'مستقرة' },
      excellent: { en: 'Excellent', ar: 'ممتازة' },
    };
    return isAr ? labels[pulseState.pageStability].ar : labels[pulseState.pageStability].en;
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div 
          className={`sovereign-pulse-container ${getPulseClass()}`}
          data-testid="sovereign-pulse-indicator"
        >
          <div className="sovereign-pulse-core" />
          <div className="sovereign-pulse-aura" />
          <div className="sovereign-pulse-ring" />
        </div>
      </TooltipTrigger>
      <TooltipContent 
        side="bottom" 
        className="sovereign-pulse-tooltip"
      >
        <div className="text-xs space-y-1">
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">
              {isAr ? 'سرعة المنصة:' : 'Platform Speed:'}
            </span>
            <span className="font-medium">{getSpeedLabel()}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">
              {isAr ? 'الصفحة الحالية:' : 'Current Page:'}
            </span>
            <span className="font-medium">{getStabilityLabel()}</span>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

export const SovereignPulseIndicator = memo(SovereignPulseIndicatorComponent);
export default SovereignPulseIndicator;
