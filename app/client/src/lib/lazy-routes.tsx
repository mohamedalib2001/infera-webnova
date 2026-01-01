import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function PageFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8">
      <Skeleton className="w-[300px] h-[32px]" />
      <Skeleton className="w-[200px] h-[20px]" />
      <Skeleton className="w-full max-w-[600px] h-[200px]" />
    </div>
  );
}

function lazyPage(
  importFn: () => Promise<{ default: React.ComponentType }>
): React.FC {
  const LazyComponent = lazy(importFn);
  return function LazyPage() {
    return (
      <Suspense fallback={<PageFallback />}>
        <LazyComponent />
      </Suspense>
    );
  };
}

// Core Pages
export const LazySettings = lazyPage(() => import('@/pages/settings'));
export const LazySovereignWorkspace = lazyPage(() => import('@/pages/sovereign-workspace'));
export const LazyUserBuilder = lazyPage(() => import('@/pages/user-builder'));
export const LazyNovaAIDashboard = lazyPage(() => import('@/pages/nova-ai-dashboard'));
export const LazyNovaChat = lazyPage(() => import('@/pages/nova-chat'));
export const LazySupport = lazyPage(() => import('@/pages/support'));
export const LazySubscription = lazyPage(() => import('@/pages/subscription'));

// Business Pages
export const LazyWhiteLabel = lazyPage(() => import('@/pages/white-label'));

// Legal Pages
export const LazyAbout = lazyPage(() => import('@/pages/about'));
export const LazyContact = lazyPage(() => import('@/pages/contact'));
export const LazyTerms = lazyPage(() => import('@/pages/terms'));
export const LazyPrivacy = lazyPage(() => import('@/pages/privacy'));
export const LazyRefund = lazyPage(() => import('@/pages/refund'));
