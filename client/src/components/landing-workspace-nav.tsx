import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { ArrowLeft, ArrowRight, Crown } from "lucide-react";

interface LandingWorkspaceNavProps {
  platformName?: string;
  platformNameAr?: string;
}

export function LandingWorkspaceNav({ platformName, platformNameAr }: LandingWorkspaceNavProps) {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const displayName = isRtl ? (platformNameAr || platformName) : platformName;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between pointer-events-none">
      <Button
        variant="outline"
        size="sm"
        className="gap-2 bg-background/80 backdrop-blur-md border-border/50 shadow-lg pointer-events-auto"
        onClick={() => setLocation("/sovereign-workspace")}
        data-testid="button-back-to-workspace"
      >
        {isRtl ? (
          <>
            <Crown className="w-4 h-4 text-amber-500" />
            <span>{displayName ? `${displayName} | ` : ""}مساحة العمل السيادية</span>
            <ArrowRight className="w-4 h-4" />
          </>
        ) : (
          <>
            <ArrowLeft className="w-4 h-4" />
            <Crown className="w-4 h-4 text-amber-500" />
            <span>{displayName ? `${displayName} | ` : ""}Sovereign Workspace</span>
          </>
        )}
      </Button>
    </div>
  );
}
