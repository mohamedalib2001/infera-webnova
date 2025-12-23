import { useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

interface PerformanceMetrics {
  pathname: string;
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
  resourceCount: number;
  totalTransferSize: number;
  connectionType: string | null;
  deviceMemory: number | null;
  hardwareConcurrency: number;
  timestamp: number;
}

interface PageViewData {
  pathname: string;
  referrer: string;
  sessionId: string;
  timestamp: number;
  metrics: PerformanceMetrics;
}

function getSessionId(): string {
  let sessionId = sessionStorage.getItem('infera_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('infera_session_id', sessionId);
  }
  return sessionId;
}

function getConnectionType(): string | null {
  const nav = navigator as any;
  return nav.connection?.effectiveType || null;
}

function getDeviceMemory(): number | null {
  const nav = navigator as any;
  return nav.deviceMemory || null;
}

function collectPerformanceMetrics(pathname: string): PerformanceMetrics {
  const perfEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
  const navEntry = perfEntries[0];
  
  let loadTime = 0;
  let domContentLoaded = 0;
  let timeToInteractive = 0;
  
  if (navEntry) {
    loadTime = Math.round(navEntry.loadEventEnd - navEntry.startTime);
    domContentLoaded = Math.round(navEntry.domContentLoadedEventEnd - navEntry.startTime);
    timeToInteractive = Math.round(navEntry.domInteractive - navEntry.startTime);
  }

  let firstContentfulPaint = 0;
  let largestContentfulPaint = 0;
  
  const paintEntries = performance.getEntriesByType('paint');
  const fcpEntry = paintEntries.find(e => e.name === 'first-contentful-paint');
  if (fcpEntry) {
    firstContentfulPaint = Math.round(fcpEntry.startTime);
  }

  const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const resourceCount = resourceEntries.length;
  const totalTransferSize = resourceEntries.reduce((sum, r) => sum + (r.transferSize || 0), 0);

  return {
    pathname,
    loadTime: loadTime || Math.round(performance.now()),
    domContentLoaded,
    firstContentfulPaint,
    largestContentfulPaint,
    firstInputDelay: 0,
    cumulativeLayoutShift: 0,
    timeToInteractive,
    resourceCount,
    totalTransferSize: Math.round(totalTransferSize / 1024),
    connectionType: getConnectionType(),
    deviceMemory: getDeviceMemory(),
    hardwareConcurrency: navigator.hardwareConcurrency || 1,
    timestamp: Date.now(),
  };
}

export function usePerformanceTracker() {
  const [location] = useLocation();
  
  const trackPageView = useCallback(async (pathname: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const metrics = collectPerformanceMetrics(pathname);
      const sessionId = getSessionId();
      
      const pageViewData: PageViewData = {
        pathname,
        referrer: document.referrer,
        sessionId,
        timestamp: Date.now(),
        metrics,
      };

      await apiRequest('POST', '/api/analytics/track', {
        eventType: 'page_performance',
        eventData: pageViewData,
        sessionId,
      });
      
    } catch (error) {
      console.debug('[Performance Tracker] Failed to track:', error);
    }
  }, []);

  useEffect(() => {
    const pageLoadTime = performance.now();
    
    const trackAfterLoad = () => {
      if (document.readyState === 'complete') {
        setTimeout(() => trackPageView(location), 200);
      } else {
        window.addEventListener('load', () => {
          setTimeout(() => trackPageView(location), 200);
        }, { once: true });
      }
    };

    trackAfterLoad();
    
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          console.debug('[LCP]', Math.round(entry.startTime), 'ms');
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
    }

    return () => {
      try {
        observer.disconnect();
      } catch (e) {
      }
    };
  }, [location, trackPageView]);

  return { trackPageView };
}

export function PerformanceTracker() {
  usePerformanceTracker();
  return null;
}
