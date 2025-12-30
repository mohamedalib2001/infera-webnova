import { useState, useRef, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Particle {
  id: number;
  color: string;
  size: number;
  endX: number;
  endY: number;
}

const HOLOGRAPHIC_COLORS = [
  "#00D4FF",
  "#7B2FFF",
  "#FF2F7B",
  "#00FF88",
  "#FFD700",
  "#FF6B35",
  "#00FFFF",
  "#FF00FF",
];

export function HolographicRefresh() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { toast } = useToast();
  const particleIdRef = useRef(0);

  const createParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    const particleCount = 16;

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
      const distance = Math.random() * 50 + 30;
      newParticles.push({
        id: particleIdRef.current++,
        color: HOLOGRAPHIC_COLORS[Math.floor(Math.random() * HOLOGRAPHIC_COLORS.length)],
        size: Math.random() * 4 + 2,
        endX: Math.cos(angle) * distance,
        endY: Math.sin(angle) * distance,
      });
    }

    setParticles(prev => [...prev, ...newParticles]);

    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
    }, 800);
  }, []);

  const clearAllCache = useCallback(async () => {
    queryClient.clear();

    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }

    const keysToKeep = ['theme', 'language', 'sidebar_state'];
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && !keysToKeep.includes(key) && !key.includes('auth')) {
        localStorage.removeItem(key);
      }
    }

    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (key && !key.includes('auth')) {
        sessionStorage.removeItem(key);
      }
    }

    await queryClient.refetchQueries({ type: 'active' });
  }, []);

  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    createParticles();

    const burstInterval = setInterval(() => createParticles(), 200);

    try {
      await clearAllCache();
      await new Promise(resolve => setTimeout(resolve, 800));
      toast({
        title: "Refresh Complete",
        description: "Cache cleared successfully",
      });
    } finally {
      clearInterval(burstInterval);
      setIsRefreshing(false);
    }
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 pointer-events-none overflow-visible z-50">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute rounded-full animate-particle-burst"
            style={{
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
              left: '50%',
              top: '50%',
              '--end-x': `${particle.endX}px`,
              '--end-y': `${particle.endY}px`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        onClick={handleRefresh}
        disabled={isRefreshing}
        data-testid="button-holographic-refresh"
        className={cn(
          "relative overflow-visible",
          "before:absolute before:inset-0 before:rounded-md",
          "before:bg-gradient-to-r before:from-cyan-500/20 before:via-purple-500/20 before:to-pink-500/20",
          "before:opacity-0 before:transition-opacity before:duration-300",
          "hover:before:opacity-100",
          isRefreshing && "before:opacity-100 before:animate-pulse"
        )}
      >
        <div
          className={cn(
            "absolute inset-0 rounded-md transition-all duration-300",
            isRefreshing && "animate-holographic-pulse"
          )}
          style={{
            background: isRefreshing
              ? 'conic-gradient(from 0deg, #00D4FF, #7B2FFF, #FF2F7B, #00FF88, #FFD700, #00D4FF)'
              : 'transparent',
            opacity: isRefreshing ? 0.6 : 0,
            filter: isRefreshing ? 'blur(4px)' : 'none',
          }}
        />

        {isRefreshing && (
          <div className="absolute inset-0 rounded-md animate-light-flash bg-white/30" />
        )}

        <RefreshCw
          className={cn(
            "h-4 w-4 relative z-10 transition-colors",
            isRefreshing && "animate-spin text-cyan-400"
          )}
        />

        {isRefreshing && (
          <>
            <div className="absolute inset-[-4px] rounded-full border-2 border-cyan-400/50 animate-ping" />
            <div
              className="absolute inset-[-8px] rounded-full border border-purple-400/30 animate-ping"
              style={{ animationDelay: '0.2s' }}
            />
          </>
        )}
      </Button>
    </div>
  );
}
