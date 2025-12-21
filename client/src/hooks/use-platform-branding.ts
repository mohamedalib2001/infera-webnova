import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface PlatformBranding {
  brandName: string;
  brandNameAr: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  customCss: string;
  isActive: boolean;
}

const DEFAULT_BRANDING: PlatformBranding = {
  brandName: 'INFERA WebNova',
  brandNameAr: 'إنفيرا ويب نوفا',
  logoUrl: '/assets/generated_images/infera_webnova_professional_logo.png',
  faviconUrl: '/assets/generated_images/infera_webnova_professional_logo.png',
  primaryColor: '#8B5CF6',
  secondaryColor: '#EC4899',
  customCss: '',
  isActive: true,
};

export function usePlatformBranding() {
  const { data: branding, isLoading } = useQuery<PlatformBranding>({
    queryKey: ['/api/platform/branding'],
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const activeBranding = branding?.isActive ? branding : DEFAULT_BRANDING;

  useEffect(() => {
    if (!activeBranding) return;

    updateFavicon(activeBranding.faviconUrl);
    updateTitle(activeBranding.brandName);
    applyCustomColors(activeBranding.primaryColor, activeBranding.secondaryColor);
    applyCustomCss(activeBranding.customCss);
  }, [activeBranding]);

  return {
    branding: activeBranding,
    isLoading,
  };
}

function updateFavicon(faviconUrl: string) {
  if (!faviconUrl) return;

  let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = faviconUrl;

  let appleLink = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
  if (!appleLink) {
    appleLink = document.createElement('link');
    appleLink.rel = 'apple-touch-icon';
    document.head.appendChild(appleLink);
  }
  appleLink.href = faviconUrl;
}

function updateTitle(brandName: string) {
  if (!brandName) return;
  const currentTitle = document.title;
  const separator = ' - ';
  const parts = currentTitle.split(separator);
  
  if (parts.length > 1) {
    parts[parts.length - 1] = brandName;
    document.title = parts.join(separator);
  }
}

function applyCustomColors(primary: string, secondary: string) {
  if (primary) {
    document.documentElement.style.setProperty('--brand-primary', primary);
  }
  if (secondary) {
    document.documentElement.style.setProperty('--brand-secondary', secondary);
  }
}

function applyCustomCss(css: string) {
  const styleId = 'platform-custom-css';
  let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
  
  if (!css) {
    styleEl?.remove();
    return;
  }

  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = css;
}

export function useUpdateBranding() {
  const updateBrandingLocal = (branding: Partial<PlatformBranding>) => {
    if (branding.faviconUrl) updateFavicon(branding.faviconUrl);
    if (branding.brandName) updateTitle(branding.brandName);
    if (branding.primaryColor || branding.secondaryColor) {
      applyCustomColors(branding.primaryColor || '', branding.secondaryColor || '');
    }
    if (branding.customCss !== undefined) applyCustomCss(branding.customCss);
  };

  return { updateBrandingLocal };
}
