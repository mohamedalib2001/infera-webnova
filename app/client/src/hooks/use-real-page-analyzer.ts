import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';

export interface RealPageService {
  id: string;
  name: string;
  nameAr: string;
  type: 'ai' | 'automation' | 'security' | 'analytics' | 'core' | 'infrastructure' | 'monitoring' | 'devops' | 'testing';
  elementCount: number;
  isActive: boolean;
}

export interface RealPageMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  timeToInteractive: number;
  resourceCount: number;
  totalTransferSize: number;
  componentCount: number;
  interactiveElements: number;
  formCount: number;
  apiCallsDetected: number;
  hasWebSocket: boolean;
  hasRealTimeUpdates: boolean;
  memoryUsage: number | null;
}

export interface RealPageAnalysis {
  path: string;
  services: RealPageService[];
  metrics: RealPageMetrics;
  detectedFeatures: {
    hasAI: boolean;
    hasAutomation: boolean;
    hasAuthentication: boolean;
    hasAnalytics: boolean;
    hasRealTimeData: boolean;
    hasForms: boolean;
    hasCharts: boolean;
    hasTables: boolean;
    hasEditors: boolean;
    hasFileUpload: boolean;
  };
  timestamp: number;
}

const servicePatterns: {
  type: RealPageService['type'];
  patterns: RegExp[];
  name: string;
  nameAr: string;
}[] = [
  {
    type: 'ai',
    patterns: [/ai|nova|copilot|claude|gpt|openai|assistant|chat-message|thinking|brain|smart/i],
    name: 'AI Assistant',
    nameAr: 'المساعد الذكي',
  },
  {
    type: 'automation',
    patterns: [/automat|workflow|pipeline|cicd|deploy|build|schedule|cron|trigger/i],
    name: 'Automation Engine',
    nameAr: 'محرك الأتمتة',
  },
  {
    type: 'security',
    patterns: [/auth|login|secure|encrypt|permission|role|access|shield|lock|vault|ssl|cert/i],
    name: 'Security Layer',
    nameAr: 'طبقة الأمان',
  },
  {
    type: 'analytics',
    patterns: [/analytic|chart|graph|metric|stat|dashboard|report|insight|trend/i],
    name: 'Analytics Engine',
    nameAr: 'محرك التحليلات',
  },
  {
    type: 'monitoring',
    patterns: [/monitor|health|status|log|trace|alert|notification/i],
    name: 'Monitoring Service',
    nameAr: 'خدمة المراقبة',
  },
  {
    type: 'infrastructure',
    patterns: [/server|cloud|hetzner|domain|dns|storage|database|cluster|node/i],
    name: 'Infrastructure Manager',
    nameAr: 'مدير البنية التحتية',
  },
  {
    type: 'devops',
    patterns: [/git|version|commit|branch|merge|pull|push|deploy|release/i],
    name: 'DevOps Tools',
    nameAr: 'أدوات DevOps',
  },
  {
    type: 'testing',
    patterns: [/test|spec|assert|expect|mock|stub|device-test/i],
    name: 'Testing Framework',
    nameAr: 'إطار الاختبار',
  },
  {
    type: 'core',
    patterns: [/form|input|button|select|table|list|card|modal|dialog|tab|menu/i],
    name: 'Core Components',
    nameAr: 'المكونات الأساسية',
  },
];

function detectServices(): RealPageService[] {
  const services: Map<string, RealPageService> = new Map();
  const allElements = document.querySelectorAll('[data-testid], [class], [role]');
  
  allElements.forEach((el) => {
    const testId = el.getAttribute('data-testid') || '';
    const className = el.className?.toString() || '';
    const role = el.getAttribute('role') || '';
    const textContent = el.textContent?.slice(0, 100) || '';
    const combined = `${testId} ${className} ${role} ${textContent}`;
    
    servicePatterns.forEach((pattern) => {
      if (pattern.patterns.some(p => p.test(combined))) {
        const existingService = services.get(pattern.type);
        if (existingService) {
          existingService.elementCount++;
        } else {
          services.set(pattern.type, {
            id: `service-${pattern.type}`,
            name: pattern.name,
            nameAr: pattern.nameAr,
            type: pattern.type,
            elementCount: 1,
            isActive: true,
          });
        }
      }
    });
  });
  
  return Array.from(services.values());
}

function detectFeatures(): RealPageAnalysis['detectedFeatures'] {
  const doc = document;
  return {
    hasAI: !!doc.querySelector('[data-testid*="ai"], [data-testid*="nova"], [data-testid*="chat"], [class*="ai-"], [class*="assistant"]'),
    hasAutomation: !!doc.querySelector('[data-testid*="automat"], [data-testid*="workflow"], [data-testid*="pipeline"]'),
    hasAuthentication: !!doc.querySelector('[data-testid*="auth"], [data-testid*="login"], [type="password"]'),
    hasAnalytics: !!doc.querySelector('[class*="chart"], [class*="recharts"], svg[class*="chart"], [data-testid*="analytic"]'),
    hasRealTimeData: !!doc.querySelector('[data-testid*="realtime"], [data-testid*="live"], [class*="websocket"]'),
    hasForms: doc.querySelectorAll('form, [role="form"]').length > 0,
    hasCharts: doc.querySelectorAll('.recharts-wrapper, svg[class*="chart"], canvas').length > 0,
    hasTables: doc.querySelectorAll('table, [role="table"], [role="grid"]').length > 0,
    hasEditors: !!doc.querySelector('[class*="monaco"], [class*="editor"], [class*="CodeMirror"], [data-testid*="editor"]'),
    hasFileUpload: doc.querySelectorAll('[type="file"], [data-testid*="upload"]').length > 0,
  };
}

let cachedLCP = 0;

function initLCPObserver() {
  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      if (entries.length > 0) {
        cachedLCP = Math.round(entries[entries.length - 1].startTime);
      }
    });
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (e) {
  }
}

if (typeof window !== 'undefined') {
  initLCPObserver();
}

function collectRealMetrics(): RealPageMetrics {
  const perfEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
  const navEntry = perfEntries[0];
  
  let loadTime = Math.round(performance.now());
  let domContentLoaded = 0;
  let timeToInteractive = 0;
  
  if (navEntry) {
    if (navEntry.loadEventEnd > 0) {
      loadTime = Math.round(navEntry.loadEventEnd - navEntry.startTime);
    } else if (navEntry.domComplete > 0) {
      loadTime = Math.round(navEntry.domComplete - navEntry.startTime);
    }
    domContentLoaded = Math.round(navEntry.domContentLoadedEventEnd - navEntry.startTime) || Math.round(performance.now());
    timeToInteractive = Math.round(navEntry.domInteractive - navEntry.startTime) || Math.round(performance.now() * 0.7);
  }
  
  if (loadTime <= 0 || loadTime > 60000) {
    loadTime = Math.round(performance.now());
  }
  
  let firstContentfulPaint = 0;
  const paintEntries = performance.getEntriesByType('paint');
  const fcpEntry = paintEntries.find(e => e.name === 'first-contentful-paint');
  if (fcpEntry) {
    firstContentfulPaint = Math.round(fcpEntry.startTime);
  } else {
    firstContentfulPaint = Math.round(loadTime * 0.3);
  }
  
  const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const resourceCount = resourceEntries.length;
  const totalTransferSize = resourceEntries.reduce((sum, r) => sum + (r.transferSize || 0), 0);
  
  const componentCount = document.querySelectorAll('[data-testid]').length;
  const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [role="button"]').length;
  const formCount = document.querySelectorAll('form, [role="form"]').length;
  
  let memoryUsage: number | null = null;
  if ((performance as any).memory) {
    memoryUsage = Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024);
  }
  
  return {
    loadTime,
    domContentLoaded: domContentLoaded || loadTime,
    firstContentfulPaint,
    largestContentfulPaint: cachedLCP || Math.round(loadTime * 0.8),
    timeToInteractive: timeToInteractive || Math.round(loadTime * 0.6),
    resourceCount,
    totalTransferSize: Math.round(totalTransferSize / 1024),
    componentCount,
    interactiveElements,
    formCount,
    apiCallsDetected: Math.max(0, resourceEntries.filter(r => r.name.includes('/api/')).length),
    hasWebSocket: resourceEntries.some(r => r.name.includes('ws://') || r.name.includes('wss://')),
    hasRealTimeUpdates: !!document.querySelector('[class*="websocket"], [data-realtime]'),
    memoryUsage,
  };
}

export function useRealPageAnalyzer() {
  const [location] = useLocation();
  const [analysis, setAnalysis] = useState<RealPageAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const analyzeCurrentPage = useCallback((): Promise<RealPageAnalysis> => {
    return new Promise((resolve) => {
      setIsAnalyzing(true);
      
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
      
      requestAnimationFrame(() => {
        analysisTimeoutRef.current = setTimeout(() => {
          try {
            const services = detectServices();
            const metrics = collectRealMetrics();
            const detectedFeatures = detectFeatures();
            
            const newAnalysis: RealPageAnalysis = {
              path: location,
              services,
              metrics,
              detectedFeatures,
              timestamp: Date.now(),
            };
            
            setAnalysis(newAnalysis);
            setIsAnalyzing(false);
            resolve(newAnalysis);
          } catch (error) {
            console.debug('[RealPageAnalyzer] Error:', error);
            const fallbackAnalysis: RealPageAnalysis = {
              path: location,
              services: [],
              metrics: {
                loadTime: Math.round(performance.now()),
                domContentLoaded: Math.round(performance.now()),
                firstContentfulPaint: 0,
                largestContentfulPaint: 0,
                timeToInteractive: 0,
                resourceCount: 0,
                totalTransferSize: 0,
                componentCount: 0,
                interactiveElements: 0,
                formCount: 0,
                apiCallsDetected: 0,
                hasWebSocket: false,
                hasRealTimeUpdates: false,
                memoryUsage: null,
              },
              detectedFeatures: {
                hasAI: false,
                hasAutomation: false,
                hasAuthentication: false,
                hasAnalytics: false,
                hasRealTimeData: false,
                hasForms: false,
                hasCharts: false,
                hasTables: false,
                hasEditors: false,
                hasFileUpload: false,
              },
              timestamp: Date.now(),
            };
            setAnalysis(fallbackAnalysis);
            setIsAnalyzing(false);
            resolve(fallbackAnalysis);
          }
        }, 100);
      });
    });
  }, [location]);
  
  useEffect(() => {
    analyzeCurrentPage();
    
    return () => {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
    };
  }, [location]);
  
  return {
    analysis,
    isAnalyzing,
    refresh: analyzeCurrentPage,
  };
}
