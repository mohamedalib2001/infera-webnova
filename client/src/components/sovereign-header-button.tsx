/**
 * Sovereign Header Button - زر لوحة التحكم السيادية
 * Professional header button for sovereign control access
 */

import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Shield, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const translations = {
  ar: {
    sovereignDashboard: "لوحة التحكم السيادية",
    ownerAccess: "وصول المالك",
  },
  en: {
    sovereignDashboard: "Sovereign Dashboard",
    ownerAccess: "Owner Access",
  },
};

export function SovereignHeaderButton() {
  const { isSovereign, isAuthenticated } = useAuth();
  const { isRtl } = useLanguage();
  const [, setLocation] = useLocation();
  const t = isRtl ? translations.ar : translations.en;

  if (!isAuthenticated || !isSovereign) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/owner")}
          className="relative group"
          data-testid="button-sovereign-dashboard"
        >
          <div className="absolute inset-0 rounded-md overflow-visible">
            <div 
              className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 rounded-md"
              style={{
                animation: "pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
              }}
            />
            <div 
              className="absolute -inset-1 bg-gradient-to-r from-emerald-400/15 via-teal-400/15 to-emerald-400/15 rounded-lg blur-md"
              style={{
                animation: "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                animationDelay: "0.3s",
              }}
            />
          </div>
          <div className="relative z-10 flex items-center justify-center">
            <Shield className="w-4 h-4 text-emerald-500" />
            <ChevronRight 
              className={cn(
                "w-3 h-3 text-teal-400 absolute",
                isRtl ? "-left-1" : "-right-1",
                isRtl && "rotate-180"
              )}
              style={{
                animation: "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
              }}
            />
          </div>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>{t.sovereignDashboard}</p>
      </TooltipContent>
    </Tooltip>
  );
}
