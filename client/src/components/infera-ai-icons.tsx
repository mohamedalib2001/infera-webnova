import { cn } from "@/lib/utils";
import { useId } from "react";

interface AIIconProps {
  className?: string;
  size?: number;
  accentColor?: string;
  glowIntensity?: 'low' | 'medium' | 'high';
}

const defaultSize = 24;

export const inferaAIColors = {
  chat: {
    accent: "#00D4FF",
    name: "Neural Cyan",
  },
  analyze: {
    accent: "#A855F7",
    name: "Quantum Purple",
  },
  build: {
    accent: "#3B82F6",
    name: "Sovereign Blue",
  },
  code: {
    accent: "#F59E0B",
    name: "Signal Gold",
  },
  consult: {
    accent: "#8B5CF6",
    name: "Royal Violet",
  },
  core: {
    accent: "#6366F1",
    name: "Deep Electric Blue",
  },
  assist: {
    accent: "#06B6D4",
    name: "Assist Cyan",
  },
};

export function InferaChatIcon({ className, size = defaultSize, accentColor = inferaAIColors.chat.accent, glowIntensity = 'medium' }: AIIconProps) {
  const id = useId();
  const coreId = `chatCore-${id}`;
  const glowId = `chatGlow-${id}`;
  const glowOpacity = glowIntensity === 'high' ? 0.6 : glowIntensity === 'medium' ? 0.4 : 0.2;
  
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={cn("", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id={coreId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.9" />
          <stop offset="70%" stopColor={accentColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
        </radialGradient>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      <rect width="32" height="32" rx="6" fill="#0A0A0F" />
      
      <circle cx="16" cy="16" r="10" fill={`url(#${coreId})`} opacity={glowOpacity} />
      
      <circle cx="16" cy="16" r="8" stroke={accentColor} strokeWidth="0.5" strokeOpacity="0.3" fill="none" />
      <circle cx="16" cy="16" r="6" stroke={accentColor} strokeWidth="0.8" strokeOpacity="0.5" fill="none" />
      
      <circle cx="16" cy="16" r="4" fill={accentColor} opacity="0.15" />
      <circle cx="16" cy="16" r="2.5" fill={accentColor} opacity="0.8" filter={`url(#${glowId})`} />
      
      <line x1="16" y1="6" x2="16" y2="10" stroke={accentColor} strokeWidth="0.5" strokeOpacity="0.4" />
      <line x1="16" y1="22" x2="16" y2="26" stroke={accentColor} strokeWidth="0.5" strokeOpacity="0.4" />
      <line x1="6" y1="16" x2="10" y2="16" stroke={accentColor} strokeWidth="0.5" strokeOpacity="0.4" />
      <line x1="22" y1="16" x2="26" y2="16" stroke={accentColor} strokeWidth="0.5" strokeOpacity="0.4" />
      
      <circle cx="16" cy="7" r="1" fill={accentColor} opacity="0.6" />
      <circle cx="16" cy="25" r="1" fill={accentColor} opacity="0.6" />
      <circle cx="7" cy="16" r="1" fill={accentColor} opacity="0.6" />
      <circle cx="25" cy="16" r="1" fill={accentColor} opacity="0.6" />
    </svg>
  );
}

export function InferaAnalyzeIcon({ className, size = defaultSize, accentColor = inferaAIColors.analyze.accent, glowIntensity = 'medium' }: AIIconProps) {
  const id = useId();
  const coreId = `analyzeCore-${id}`;
  const glowId = `analyzeGlow-${id}`;
  const glowOpacity = glowIntensity === 'high' ? 0.6 : glowIntensity === 'medium' ? 0.4 : 0.2;
  
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={cn("", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id={coreId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.9" />
          <stop offset="70%" stopColor={accentColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
        </radialGradient>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      <rect width="32" height="32" rx="6" fill="#0A0A0F" />
      
      <circle cx="16" cy="16" r="11" fill={`url(#${coreId})`} opacity={glowOpacity} />
      
      <polygon 
        points="16,6 24,16 16,26 8,16" 
        stroke={accentColor} 
        strokeWidth="0.6" 
        strokeOpacity="0.4" 
        fill="none" 
      />
      <polygon 
        points="16,9 21,16 16,23 11,16" 
        stroke={accentColor} 
        strokeWidth="0.8" 
        strokeOpacity="0.6" 
        fill={accentColor}
        fillOpacity="0.1"
      />
      
      <circle cx="16" cy="16" r="3" fill={accentColor} opacity="0.2" />
      <circle cx="16" cy="16" r="2" fill={accentColor} opacity="0.9" filter={`url(#${glowId})`} />
      
      <circle cx="16" cy="6" r="1.2" fill={accentColor} opacity="0.7" />
      <circle cx="24" cy="16" r="1.2" fill={accentColor} opacity="0.7" />
      <circle cx="16" cy="26" r="1.2" fill={accentColor} opacity="0.7" />
      <circle cx="8" cy="16" r="1.2" fill={accentColor} opacity="0.7" />
      
      <line x1="16" y1="6" x2="24" y2="16" stroke={accentColor} strokeWidth="0.3" strokeOpacity="0.3" />
      <line x1="24" y1="16" x2="16" y2="26" stroke={accentColor} strokeWidth="0.3" strokeOpacity="0.3" />
      <line x1="16" y1="26" x2="8" y2="16" stroke={accentColor} strokeWidth="0.3" strokeOpacity="0.3" />
      <line x1="8" y1="16" x2="16" y2="6" stroke={accentColor} strokeWidth="0.3" strokeOpacity="0.3" />
    </svg>
  );
}

export function InferaBuildIcon({ className, size = defaultSize, accentColor = inferaAIColors.build.accent, glowIntensity = 'medium' }: AIIconProps) {
  const id = useId();
  const coreId = `buildCore-${id}`;
  const glowId = `buildGlow-${id}`;
  const glowOpacity = glowIntensity === 'high' ? 0.6 : glowIntensity === 'medium' ? 0.4 : 0.2;
  
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={cn("", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id={coreId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.9" />
          <stop offset="70%" stopColor={accentColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
        </radialGradient>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      <rect width="32" height="32" rx="6" fill="#0A0A0F" />
      
      <circle cx="16" cy="16" r="10" fill={`url(#${coreId})`} opacity={glowOpacity} />
      
      <rect x="8" y="8" width="16" height="16" rx="2" stroke={accentColor} strokeWidth="0.5" strokeOpacity="0.3" fill="none" />
      <rect x="11" y="11" width="10" height="10" rx="1" stroke={accentColor} strokeWidth="0.6" strokeOpacity="0.5" fill="none" />
      
      <rect x="13" y="13" width="6" height="6" rx="1" fill={accentColor} opacity="0.15" />
      <rect x="14" y="14" width="4" height="4" rx="0.5" fill={accentColor} opacity="0.9" filter={`url(#${glowId})`} />
      
      <line x1="8" y1="8" x2="11" y2="11" stroke={accentColor} strokeWidth="0.4" strokeOpacity="0.4" />
      <line x1="24" y1="8" x2="21" y2="11" stroke={accentColor} strokeWidth="0.4" strokeOpacity="0.4" />
      <line x1="8" y1="24" x2="11" y2="21" stroke={accentColor} strokeWidth="0.4" strokeOpacity="0.4" />
      <line x1="24" y1="24" x2="21" y2="21" stroke={accentColor} strokeWidth="0.4" strokeOpacity="0.4" />
      
      <circle cx="8" cy="8" r="1" fill={accentColor} opacity="0.5" />
      <circle cx="24" cy="8" r="1" fill={accentColor} opacity="0.5" />
      <circle cx="8" cy="24" r="1" fill={accentColor} opacity="0.5" />
      <circle cx="24" cy="24" r="1" fill={accentColor} opacity="0.5" />
    </svg>
  );
}

export function InferaCodeIcon({ className, size = defaultSize, accentColor = inferaAIColors.code.accent, glowIntensity = 'medium' }: AIIconProps) {
  const id = useId();
  const coreId = `codeCore-${id}`;
  const glowId = `codeGlow-${id}`;
  const glowOpacity = glowIntensity === 'high' ? 0.6 : glowIntensity === 'medium' ? 0.4 : 0.2;
  
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={cn("", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id={coreId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.9" />
          <stop offset="70%" stopColor={accentColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
        </radialGradient>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      <rect width="32" height="32" rx="6" fill="#0A0A0F" />
      
      <circle cx="16" cy="16" r="10" fill={`url(#${coreId})`} opacity={glowOpacity} />
      
      <polygon 
        points="16,5 27,16 16,27 5,16" 
        stroke={accentColor} 
        strokeWidth="0.4" 
        strokeOpacity="0.2" 
        fill="none" 
      />
      
      <circle cx="16" cy="16" r="7" stroke={accentColor} strokeWidth="0.5" strokeOpacity="0.4" fill="none" />
      
      <path 
        d="M 12 13 L 9 16 L 12 19" 
        stroke={accentColor} 
        strokeWidth="1.5" 
        strokeOpacity="0.8" 
        fill="none" 
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path 
        d="M 20 13 L 23 16 L 20 19" 
        stroke={accentColor} 
        strokeWidth="1.5" 
        strokeOpacity="0.8" 
        fill="none" 
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      <circle cx="16" cy="16" r="2" fill={accentColor} opacity="0.9" filter={`url(#${glowId})`} />
      
      <circle cx="16" cy="5" r="0.8" fill={accentColor} opacity="0.5" />
      <circle cx="27" cy="16" r="0.8" fill={accentColor} opacity="0.5" />
      <circle cx="16" cy="27" r="0.8" fill={accentColor} opacity="0.5" />
      <circle cx="5" cy="16" r="0.8" fill={accentColor} opacity="0.5" />
    </svg>
  );
}

export function InferaConsultIcon({ className, size = defaultSize, accentColor = inferaAIColors.consult.accent, glowIntensity = 'medium' }: AIIconProps) {
  const id = useId();
  const coreId = `consultCore-${id}`;
  const glowId = `consultGlow-${id}`;
  const glowOpacity = glowIntensity === 'high' ? 0.6 : glowIntensity === 'medium' ? 0.4 : 0.2;
  
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={cn("", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id={coreId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.9" />
          <stop offset="70%" stopColor={accentColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
        </radialGradient>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      <rect width="32" height="32" rx="6" fill="#0A0A0F" />
      
      <circle cx="16" cy="16" r="11" fill={`url(#${coreId})`} opacity={glowOpacity} />
      
      <circle cx="16" cy="16" r="9" stroke={accentColor} strokeWidth="0.4" strokeOpacity="0.25" fill="none" />
      <circle cx="16" cy="16" r="7" stroke={accentColor} strokeWidth="0.5" strokeOpacity="0.35" fill="none" strokeDasharray="2 2" />
      <circle cx="16" cy="16" r="5" stroke={accentColor} strokeWidth="0.6" strokeOpacity="0.5" fill="none" />
      
      <circle cx="16" cy="16" r="2.5" fill={accentColor} opacity="0.9" filter={`url(#${glowId})`} />
      
      <circle cx="10" cy="10" r="1.5" fill={accentColor} opacity="0.6" />
      <circle cx="22" cy="10" r="1.5" fill={accentColor} opacity="0.6" />
      <circle cx="10" cy="22" r="1.5" fill={accentColor} opacity="0.6" />
      <circle cx="22" cy="22" r="1.5" fill={accentColor} opacity="0.6" />
      
      <line x1="10" y1="10" x2="14" y2="14" stroke={accentColor} strokeWidth="0.5" strokeOpacity="0.4" />
      <line x1="22" y1="10" x2="18" y2="14" stroke={accentColor} strokeWidth="0.5" strokeOpacity="0.4" />
      <line x1="10" y1="22" x2="14" y2="18" stroke={accentColor} strokeWidth="0.5" strokeOpacity="0.4" />
      <line x1="22" y1="22" x2="18" y2="18" stroke={accentColor} strokeWidth="0.5" strokeOpacity="0.4" />
    </svg>
  );
}

export function InferaAssistIcon({ className, size = defaultSize, accentColor = inferaAIColors.assist.accent, glowIntensity = 'medium' }: AIIconProps) {
  const id = useId();
  const coreId = `assistCore-${id}`;
  const glowId = `assistGlow-${id}`;
  const glowOpacity = glowIntensity === 'high' ? 0.6 : glowIntensity === 'medium' ? 0.4 : 0.2;
  
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={cn("", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id={coreId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.9" />
          <stop offset="70%" stopColor={accentColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
        </radialGradient>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      <rect width="32" height="32" rx="6" fill="#0A0A0F" />
      
      <circle cx="16" cy="16" r="10" fill={`url(#${coreId})`} opacity={glowOpacity} />
      
      <polygon 
        points="16,6 19,12 26,13 21,18 22,25 16,22 10,25 11,18 6,13 13,12" 
        stroke={accentColor} 
        strokeWidth="0.5" 
        strokeOpacity="0.4" 
        fill="none" 
      />
      
      <polygon 
        points="16,9 18,13 22,14 19,17 20,21 16,19 12,21 13,17 10,14 14,13" 
        stroke={accentColor} 
        strokeWidth="0.6" 
        strokeOpacity="0.6" 
        fill={accentColor}
        fillOpacity="0.15"
      />
      
      <circle cx="16" cy="16" r="2.5" fill={accentColor} opacity="0.9" filter={`url(#${glowId})`} />
      
      <circle cx="16" cy="6" r="0.8" fill={accentColor} opacity="0.6" />
      <circle cx="26" cy="13" r="0.8" fill={accentColor} opacity="0.6" />
      <circle cx="22" cy="25" r="0.8" fill={accentColor} opacity="0.6" />
      <circle cx="10" cy="25" r="0.8" fill={accentColor} opacity="0.6" />
      <circle cx="6" cy="13" r="0.8" fill={accentColor} opacity="0.6" />
    </svg>
  );
}

export function InferaCoreIcon({ className, size = defaultSize, accentColor = inferaAIColors.core.accent, glowIntensity = 'medium' }: AIIconProps) {
  const id = useId();
  const coreId = `mainCore-${id}`;
  const glowId = `mainGlow-${id}`;
  const glowOpacity = glowIntensity === 'high' ? 0.6 : glowIntensity === 'medium' ? 0.4 : 0.2;
  
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={cn("", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id={coreId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.9" />
          <stop offset="60%" stopColor={accentColor} stopOpacity="0.4" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
        </radialGradient>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      <rect width="32" height="32" rx="6" fill="#0A0A0F" />
      
      <circle cx="16" cy="16" r="12" fill={`url(#${coreId})`} opacity={glowOpacity} />
      
      <circle cx="16" cy="16" r="10" stroke={accentColor} strokeWidth="0.4" strokeOpacity="0.2" fill="none" />
      <circle cx="16" cy="16" r="8" stroke={accentColor} strokeWidth="0.5" strokeOpacity="0.3" fill="none" />
      <circle cx="16" cy="16" r="6" stroke={accentColor} strokeWidth="0.6" strokeOpacity="0.4" fill="none" />
      <circle cx="16" cy="16" r="4" stroke={accentColor} strokeWidth="0.8" strokeOpacity="0.6" fill="none" />
      
      <circle cx="16" cy="16" r="3" fill={accentColor} opacity="0.9" filter={`url(#${glowId})`} />
      
      <circle cx="16" cy="6" r="1" fill={accentColor} opacity="0.5" />
      <circle cx="16" cy="26" r="1" fill={accentColor} opacity="0.5" />
      <circle cx="6" cy="16" r="1" fill={accentColor} opacity="0.5" />
      <circle cx="26" cy="16" r="1" fill={accentColor} opacity="0.5" />
      
      <circle cx="9" cy="9" r="0.8" fill={accentColor} opacity="0.4" />
      <circle cx="23" cy="9" r="0.8" fill={accentColor} opacity="0.4" />
      <circle cx="9" cy="23" r="0.8" fill={accentColor} opacity="0.4" />
      <circle cx="23" cy="23" r="0.8" fill={accentColor} opacity="0.4" />
    </svg>
  );
}

export const inferaAIIcons: Record<string, (props: AIIconProps) => JSX.Element> = {
  chat: InferaChatIcon,
  analyze: InferaAnalyzeIcon,
  build: InferaBuildIcon,
  code: InferaCodeIcon,
  consult: InferaConsultIcon,
  assist: InferaAssistIcon,
  core: InferaCoreIcon,
};

export function getInferaAIIcon(modelType: string): (props: AIIconProps) => JSX.Element {
  const normalizedType = modelType.toLowerCase().replace('infera-', '').replace('infera', '');
  return inferaAIIcons[normalizedType] || InferaCoreIcon;
}
