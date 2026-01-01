/**
 * usePageSovereignAnalysis Hook
 * Hook مركزي لتحليل الصفحات عند التنقل
 * 
 * يُفعّل عند:
 * - Route Change
 * - Page Mount
 * 
 * يعيد:
 * - Reset المؤشرات
 * - بدء تحليل جديد
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';
import { sovereignAnalyzer, PageAnalysis } from '../engine/sovereignAnalyzer';

export interface PageAnalysisState {
  isAnalyzing: boolean;
  analysis: PageAnalysis | null;
  error: string | null;
  startTime: number;
}

export function usePageSovereignAnalysis() {
  const [location] = useLocation();
  const [state, setState] = useState<PageAnalysisState>({
    isAnalyzing: false,
    analysis: null,
    error: null,
    startTime: 0,
  });
  
  const previousPath = useRef<string>('');
  const mounted = useRef(true);

  const startAnalysis = useCallback(async (path: string) => {
    if (!mounted.current) return;

    setState(prev => ({
      ...prev,
      isAnalyzing: true,
      error: null,
      startTime: performance.now(),
    }));

    try {
      await sovereignAnalyzer.startPageAnalysis(path);
      
      if (mounted.current) {
        const analysis = sovereignAnalyzer.getCurrentAnalysis();
        setState(prev => ({
          ...prev,
          isAnalyzing: false,
          analysis,
        }));
      }
    } catch (error) {
      if (mounted.current) {
        setState(prev => ({
          ...prev,
          isAnalyzing: false,
          error: error instanceof Error ? error.message : 'Analysis failed',
        }));
      }
    }
  }, []);

  // Subscribe to analyzer updates
  useEffect(() => {
    const unsubscribe = sovereignAnalyzer.subscribe((analysis) => {
      if (mounted.current) {
        setState(prev => ({
          ...prev,
          analysis,
          isAnalyzing: !analysis.isStable,
        }));
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Trigger analysis on route change
  useEffect(() => {
    if (location !== previousPath.current) {
      previousPath.current = location;
      startAnalysis(location);
    }
  }, [location, startAnalysis]);

  // Cleanup on unmount
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const refreshAnalysis = useCallback(() => {
    startAnalysis(location);
  }, [location, startAnalysis]);

  return {
    ...state,
    refreshAnalysis,
    currentPath: location,
  };
}

export default usePageSovereignAnalysis;
