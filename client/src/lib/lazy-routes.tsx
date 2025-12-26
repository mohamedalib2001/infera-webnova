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
export const LazyNovaAIDashboard = lazyPage(() => import('@/pages/nova-ai-dashboard'));
export const LazyNovaChat = lazyPage(() => import('@/pages/nova-chat'));
export const LazySupport = lazyPage(() => import('@/pages/support'));
export const LazySubscription = lazyPage(() => import('@/pages/subscription'));

// Landing Pages
export const LazyInferaLanding = lazyPage(() => import('@/pages/infera-landing'));
export const LazyEngineControlLanding = lazyPage(() => import('@/pages/engine-control-landing'));
export const LazyEngineLanding = lazyPage(() => import('@/pages/engine-landing'));
export const LazyFinanceLanding = lazyPage(() => import('@/pages/finance-landing'));
export const LazyHumanIQLanding = lazyPage(() => import('@/pages/humaniq-landing'));
export const LazyLegalLanding = lazyPage(() => import('@/pages/legal-landing'));
export const LazyAppForgeLanding = lazyPage(() => import('@/pages/appforge-landing'));
export const LazyMarketingLanding = lazyPage(() => import('@/pages/marketing-landing'));
export const LazyMarketplaceLanding = lazyPage(() => import('@/pages/marketplace-landing'));
export const LazyEducationLanding = lazyPage(() => import('@/pages/education-landing'));
export const LazyAttendLanding = lazyPage(() => import('@/pages/attend-landing'));
export const LazySmartDocsLanding = lazyPage(() => import('@/pages/smartdocs-landing'));
export const LazyHospitalityLanding = lazyPage(() => import('@/pages/hospitality-landing'));
export const LazyFeasibilityLanding = lazyPage(() => import('@/pages/feasibility-landing'));
export const LazyCVBuilderLanding = lazyPage(() => import('@/pages/cvbuilder-landing'));
export const LazyJobsLanding = lazyPage(() => import('@/pages/jobs-landing'));
export const LazyTrainAILanding = lazyPage(() => import('@/pages/trainai-landing'));
export const LazyGlobalCloudLanding = lazyPage(() => import('@/pages/globalcloud-landing'));
export const LazyShieldGridLanding = lazyPage(() => import('@/pages/shieldgrid-landing'));
export const LazySmartRemoteLanding = lazyPage(() => import('@/pages/smartremote-landing'));

// Legal Pages
export const LazyAbout = lazyPage(() => import('@/pages/about'));
export const LazyContact = lazyPage(() => import('@/pages/contact'));
export const LazyTerms = lazyPage(() => import('@/pages/terms'));
export const LazyPrivacy = lazyPage(() => import('@/pages/privacy'));
export const LazyRefund = lazyPage(() => import('@/pages/refund'));
