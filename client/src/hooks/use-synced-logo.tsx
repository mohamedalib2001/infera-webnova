import { useState, useEffect } from 'react';
import { getPlatformLogoState, type SyncedLogo, type LogoVariantType } from '@/lib/logo-binding-engine';

interface UseSyncedLogoResult {
  logoSVG: string | null;
  isLoaded: boolean;
  lastSync: Date | null;
  platformName: string;
}

export function useSyncedLogo(platformId: string): UseSyncedLogoResult {
  const [logoSVG, setLogoSVG] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [platformName, setPlatformName] = useState('');

  useEffect(() => {
    const loadLogo = () => {
      const state = getPlatformLogoState(platformId);
      
      if (state && state.logos) {
        // Try to get app-icon-1024 first, then app-icon-512
        const appIcon = state.logos['app-icon-1024'] || state.logos['app-icon-512'];
        if (appIcon) {
          setLogoSVG(appIcon.svg);
          setLastSync(new Date(appIcon.timestamp));
          setPlatformName(state.platformName);
          setIsLoaded(true);
          return;
        }
        
        // Fallback to any available variant
        const anyVariant = Object.values(state.logos).find((v): v is SyncedLogo => v !== null);
        if (anyVariant) {
          setLogoSVG(anyVariant.svg);
          setLastSync(new Date(anyVariant.timestamp));
          setPlatformName(state.platformName);
          setIsLoaded(true);
          return;
        }
      }
      
      setIsLoaded(true);
    };

    loadLogo();

    const handleSync = () => {
      loadLogo();
    };

    window.addEventListener('infera-logo-sync', handleSync);
    return () => window.removeEventListener('infera-logo-sync', handleSync);
  }, [platformId]);

  return { logoSVG, isLoaded, lastSync, platformName };
}

export function SyncedLogoDisplay({ 
  platformId, 
  size = 56, 
  fallbackIcon: FallbackIcon,
  className = ''
}: { 
  platformId: string; 
  size?: number;
  fallbackIcon?: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  const { logoSVG, isLoaded } = useSyncedLogo(platformId);

  if (!isLoaded) {
    return (
      <div 
        className={`animate-pulse bg-muted rounded-xl ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  if (logoSVG) {
    return (
      <div 
        className={`rounded-xl overflow-hidden shadow-lg ${className}`}
        style={{ width: size, height: size }}
        dangerouslySetInnerHTML={{ __html: logoSVG }}
      />
    );
  }

  if (FallbackIcon) {
    return (
      <div 
        className={`rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg ${className}`}
        style={{ width: size, height: size }}
      >
        <FallbackIcon className="h-8 w-8 text-white" />
      </div>
    );
  }

  return null;
}
