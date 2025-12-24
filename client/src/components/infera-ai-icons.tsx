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
  const coreGradId = `chatCoreGrad-${id}`;
  const outerGlowId = `chatOuterGlow-${id}`;
  const neuralFieldId = `chatNeuralField-${id}`;
  const glowOpacity = glowIntensity === 'high' ? 0.7 : glowIntensity === 'medium' ? 0.5 : 0.3;
  
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
        <radialGradient id={coreGradId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="1" />
          <stop offset="40%" stopColor={accentColor} stopOpacity="0.6" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
        </radialGradient>
        <filter id={outerGlowId} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <linearGradient id={neuralFieldId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.4" />
          <stop offset="50%" stopColor={accentColor} stopOpacity="0.1" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0.4" />
        </linearGradient>
      </defs>
      
      <rect width="32" height="32" rx="6" fill="#0A0A0F" />
      
      <circle cx="16" cy="16" r="13" fill={`url(#${coreGradId})`} opacity={glowOpacity * 0.4} />
      
      <path
        d="M 16 4 A 12 12 0 0 1 28 16"
        stroke={accentColor}
        strokeWidth="0.3"
        strokeOpacity="0.3"
        fill="none"
      />
      <path
        d="M 28 16 A 12 12 0 0 1 16 28"
        stroke={accentColor}
        strokeWidth="0.3"
        strokeOpacity="0.3"
        fill="none"
      />
      <path
        d="M 16 28 A 12 12 0 0 1 4 16"
        stroke={accentColor}
        strokeWidth="0.3"
        strokeOpacity="0.3"
        fill="none"
      />
      <path
        d="M 4 16 A 12 12 0 0 1 16 4"
        stroke={accentColor}
        strokeWidth="0.3"
        strokeOpacity="0.3"
        fill="none"
      />
      
      <ellipse cx="16" cy="16" rx="9" ry="5" stroke={accentColor} strokeWidth="0.4" strokeOpacity="0.35" fill="none" transform="rotate(0 16 16)" />
      <ellipse cx="16" cy="16" rx="9" ry="5" stroke={accentColor} strokeWidth="0.4" strokeOpacity="0.35" fill="none" transform="rotate(60 16 16)" />
      <ellipse cx="16" cy="16" rx="9" ry="5" stroke={accentColor} strokeWidth="0.4" strokeOpacity="0.35" fill="none" transform="rotate(120 16 16)" />
      
      <circle cx="16" cy="16" r="6" stroke={accentColor} strokeWidth="0.5" strokeOpacity="0.5" fill="none" />
      
      <path
        d="M 16 10 L 18.5 14 L 16 13 L 13.5 14 Z"
        fill={accentColor}
        fillOpacity="0.6"
      />
      <path
        d="M 16 22 L 18.5 18 L 16 19 L 13.5 18 Z"
        fill={accentColor}
        fillOpacity="0.6"
      />
      <path
        d="M 10 16 L 14 13.5 L 13 16 L 14 18.5 Z"
        fill={accentColor}
        fillOpacity="0.6"
      />
      <path
        d="M 22 16 L 18 13.5 L 19 16 L 18 18.5 Z"
        fill={accentColor}
        fillOpacity="0.6"
      />
      
      <circle cx="16" cy="16" r="3" fill={accentColor} opacity="0.2" />
      <circle cx="16" cy="16" r="2" fill={accentColor} opacity="0.95" filter={`url(#${outerGlowId})`} />
      
      <circle cx="16" cy="4" r="0.8" fill={accentColor} opacity="0.8" />
      <circle cx="28" cy="16" r="0.8" fill={accentColor} opacity="0.8" />
      <circle cx="16" cy="28" r="0.8" fill={accentColor} opacity="0.8" />
      <circle cx="4" cy="16" r="0.8" fill={accentColor} opacity="0.8" />
      
      <line x1="16" y1="4" x2="16" y2="8" stroke="#FFFFFF" strokeWidth="0.3" strokeOpacity="0.3" />
      <line x1="28" y1="16" x2="24" y2="16" stroke="#FFFFFF" strokeWidth="0.3" strokeOpacity="0.3" />
      <line x1="16" y1="28" x2="16" y2="24" stroke="#FFFFFF" strokeWidth="0.3" strokeOpacity="0.3" />
      <line x1="4" y1="16" x2="8" y2="16" stroke="#FFFFFF" strokeWidth="0.3" strokeOpacity="0.3" />
    </svg>
  );
}

export function InferaAnalyzeIcon({ className, size = defaultSize, accentColor = inferaAIColors.analyze.accent, glowIntensity = 'medium' }: AIIconProps) {
  const id = useId();
  const coreGradId = `analyzeCoreGrad-${id}`;
  const glowFilterId = `analyzeGlow-${id}`;
  const glowOpacity = glowIntensity === 'high' ? 0.7 : glowIntensity === 'medium' ? 0.5 : 0.3;
  
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
        <radialGradient id={coreGradId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="1" />
          <stop offset="50%" stopColor={accentColor} stopOpacity="0.4" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
        </radialGradient>
        <filter id={glowFilterId} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      <rect width="32" height="32" rx="6" fill="#0A0A0F" />
      
      <circle cx="16" cy="16" r="12" fill={`url(#${coreGradId})`} opacity={glowOpacity * 0.35} />
      
      <polygon 
        points="16,3 29,16 16,29 3,16" 
        stroke={accentColor} 
        strokeWidth="0.4" 
        strokeOpacity="0.25" 
        fill="none" 
      />
      <polygon 
        points="16,6 26,16 16,26 6,16" 
        stroke={accentColor} 
        strokeWidth="0.5" 
        strokeOpacity="0.35" 
        fill="none" 
      />
      <polygon 
        points="16,9 23,16 16,23 9,16" 
        stroke={accentColor} 
        strokeWidth="0.6" 
        strokeOpacity="0.5" 
        fill={accentColor}
        fillOpacity="0.08"
      />
      
      <path
        d="M 16 3 L 16 6 M 29 16 L 26 16 M 16 29 L 16 26 M 3 16 L 6 16"
        stroke={accentColor}
        strokeWidth="0.5"
        strokeOpacity="0.5"
      />
      
      <circle cx="16" cy="16" r="5" stroke={accentColor} strokeWidth="0.4" strokeOpacity="0.4" fill="none" />
      
      <path
        d="M 16 11 L 21 16 L 16 21 L 11 16 Z"
        stroke={accentColor}
        strokeWidth="0.6"
        strokeOpacity="0.7"
        fill={accentColor}
        fillOpacity="0.15"
      />
      
      <circle cx="16" cy="16" r="2.5" fill={accentColor} opacity="0.2" />
      <circle cx="16" cy="16" r="1.8" fill={accentColor} opacity="0.95" filter={`url(#${glowFilterId})`} />
      
      <circle cx="16" cy="3" r="1" fill={accentColor} opacity="0.9" />
      <circle cx="29" cy="16" r="1" fill={accentColor} opacity="0.9" />
      <circle cx="16" cy="29" r="1" fill={accentColor} opacity="0.9" />
      <circle cx="3" cy="16" r="1" fill={accentColor} opacity="0.9" />
      
      <circle cx="22.5" cy="9.5" r="0.6" fill="#FFFFFF" opacity="0.4" />
      <circle cx="22.5" cy="22.5" r="0.6" fill="#FFFFFF" opacity="0.4" />
      <circle cx="9.5" cy="22.5" r="0.6" fill="#FFFFFF" opacity="0.4" />
      <circle cx="9.5" cy="9.5" r="0.6" fill="#FFFFFF" opacity="0.4" />
    </svg>
  );
}

export function InferaBuildIcon({ className, size = defaultSize, accentColor = inferaAIColors.build.accent, glowIntensity = 'medium' }: AIIconProps) {
  const id = useId();
  const coreGradId = `buildCoreGrad-${id}`;
  const glowFilterId = `buildGlow-${id}`;
  const glowOpacity = glowIntensity === 'high' ? 0.7 : glowIntensity === 'medium' ? 0.5 : 0.3;
  
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
        <radialGradient id={coreGradId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="1" />
          <stop offset="50%" stopColor={accentColor} stopOpacity="0.4" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
        </radialGradient>
        <filter id={glowFilterId} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      <rect width="32" height="32" rx="6" fill="#0A0A0F" />
      
      <circle cx="16" cy="16" r="12" fill={`url(#${coreGradId})`} opacity={glowOpacity * 0.35} />
      
      <polygon 
        points="16,4 27,10 27,22 16,28 5,22 5,10" 
        stroke={accentColor} 
        strokeWidth="0.4" 
        strokeOpacity="0.3" 
        fill="none" 
      />
      
      <polygon 
        points="16,7 24,11.5 24,20.5 16,25 8,20.5 8,11.5" 
        stroke={accentColor} 
        strokeWidth="0.5" 
        strokeOpacity="0.45" 
        fill={accentColor}
        fillOpacity="0.05"
      />
      
      <line x1="16" y1="7" x2="16" y2="25" stroke={accentColor} strokeWidth="0.3" strokeOpacity="0.3" />
      <line x1="8" y1="11.5" x2="24" y2="20.5" stroke={accentColor} strokeWidth="0.3" strokeOpacity="0.3" />
      <line x1="24" y1="11.5" x2="8" y2="20.5" stroke={accentColor} strokeWidth="0.3" strokeOpacity="0.3" />
      
      <polygon 
        points="16,10 21,13 21,19 16,22 11,19 11,13" 
        stroke={accentColor} 
        strokeWidth="0.6" 
        strokeOpacity="0.6" 
        fill={accentColor}
        fillOpacity="0.12"
      />
      
      <circle cx="16" cy="16" r="3" fill={accentColor} opacity="0.2" />
      <circle cx="16" cy="16" r="2" fill={accentColor} opacity="0.95" filter={`url(#${glowFilterId})`} />
      
      <circle cx="16" cy="4" r="0.8" fill={accentColor} opacity="0.8" />
      <circle cx="27" cy="10" r="0.8" fill={accentColor} opacity="0.8" />
      <circle cx="27" cy="22" r="0.8" fill={accentColor} opacity="0.8" />
      <circle cx="16" cy="28" r="0.8" fill={accentColor} opacity="0.8" />
      <circle cx="5" cy="22" r="0.8" fill={accentColor} opacity="0.8" />
      <circle cx="5" cy="10" r="0.8" fill={accentColor} opacity="0.8" />
      
      <line x1="16" y1="4" x2="16" y2="7" stroke="#FFFFFF" strokeWidth="0.3" strokeOpacity="0.35" />
      <line x1="16" y1="28" x2="16" y2="25" stroke="#FFFFFF" strokeWidth="0.3" strokeOpacity="0.35" />
    </svg>
  );
}

export function InferaCodeIcon({ className, size = defaultSize, accentColor = inferaAIColors.code.accent, glowIntensity = 'medium' }: AIIconProps) {
  const id = useId();
  const coreGradId = `codeCoreGrad-${id}`;
  const glowFilterId = `codeGlow-${id}`;
  const glowOpacity = glowIntensity === 'high' ? 0.7 : glowIntensity === 'medium' ? 0.5 : 0.3;
  
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
        <radialGradient id={coreGradId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="1" />
          <stop offset="50%" stopColor={accentColor} stopOpacity="0.4" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
        </radialGradient>
        <filter id={glowFilterId} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      <rect width="32" height="32" rx="6" fill="#0A0A0F" />
      
      <circle cx="16" cy="16" r="12" fill={`url(#${coreGradId})`} opacity={glowOpacity * 0.35} />
      
      <circle cx="16" cy="16" r="11" stroke={accentColor} strokeWidth="0.3" strokeOpacity="0.2" fill="none" />
      <circle cx="16" cy="16" r="8" stroke={accentColor} strokeWidth="0.4" strokeOpacity="0.3" fill="none" strokeDasharray="3 2" />
      
      <path
        d="M 16 5 L 16 8 M 16 24 L 16 27 M 5 16 L 8 16 M 24 16 L 27 16"
        stroke={accentColor}
        strokeWidth="0.4"
        strokeOpacity="0.4"
      />
      
      <path 
        d="M 10 12 L 6 16 L 10 20" 
        stroke={accentColor} 
        strokeWidth="1.2" 
        strokeOpacity="0.85" 
        fill="none" 
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path 
        d="M 22 12 L 26 16 L 22 20" 
        stroke={accentColor} 
        strokeWidth="1.2" 
        strokeOpacity="0.85" 
        fill="none" 
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      <line x1="18" y1="10" x2="14" y2="22" stroke={accentColor} strokeWidth="0.8" strokeOpacity="0.6" strokeLinecap="round" />
      
      <circle cx="16" cy="16" r="3.5" stroke={accentColor} strokeWidth="0.5" strokeOpacity="0.5" fill="none" />
      <circle cx="16" cy="16" r="2" fill={accentColor} opacity="0.95" filter={`url(#${glowFilterId})`} />
      
      <circle cx="16" cy="5" r="0.7" fill={accentColor} opacity="0.7" />
      <circle cx="27" cy="16" r="0.7" fill={accentColor} opacity="0.7" />
      <circle cx="16" cy="27" r="0.7" fill={accentColor} opacity="0.7" />
      <circle cx="5" cy="16" r="0.7" fill={accentColor} opacity="0.7" />
      
      <circle cx="8.5" cy="8.5" r="0.5" fill="#FFFFFF" opacity="0.35" />
      <circle cx="23.5" cy="8.5" r="0.5" fill="#FFFFFF" opacity="0.35" />
      <circle cx="8.5" cy="23.5" r="0.5" fill="#FFFFFF" opacity="0.35" />
      <circle cx="23.5" cy="23.5" r="0.5" fill="#FFFFFF" opacity="0.35" />
    </svg>
  );
}

export function InferaConsultIcon({ className, size = defaultSize, accentColor = inferaAIColors.consult.accent, glowIntensity = 'medium' }: AIIconProps) {
  const id = useId();
  const coreGradId = `consultCoreGrad-${id}`;
  const glowFilterId = `consultGlow-${id}`;
  const orbitalGradId = `consultOrbital-${id}`;
  const glowOpacity = glowIntensity === 'high' ? 0.7 : glowIntensity === 'medium' ? 0.5 : 0.3;
  
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
        <radialGradient id={coreGradId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="1" />
          <stop offset="50%" stopColor={accentColor} stopOpacity="0.4" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
        </radialGradient>
        <filter id={glowFilterId} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <linearGradient id={orbitalGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.6" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0.2" />
        </linearGradient>
      </defs>
      
      <rect width="32" height="32" rx="6" fill="#0A0A0F" />
      
      <circle cx="16" cy="16" r="12" fill={`url(#${coreGradId})`} opacity={glowOpacity * 0.35} />
      
      <circle cx="16" cy="16" r="11" stroke={accentColor} strokeWidth="0.3" strokeOpacity="0.2" fill="none" />
      <circle cx="16" cy="16" r="9" stroke={accentColor} strokeWidth="0.35" strokeOpacity="0.25" fill="none" />
      <circle cx="16" cy="16" r="7" stroke={accentColor} strokeWidth="0.4" strokeOpacity="0.35" fill="none" strokeDasharray="1 1.5" />
      <circle cx="16" cy="16" r="5" stroke={accentColor} strokeWidth="0.5" strokeOpacity="0.5" fill="none" />
      
      <circle cx="16" cy="5" r="1.3" fill={accentColor} opacity="0.85" />
      <circle cx="25.5" cy="11" r="1.3" fill={accentColor} opacity="0.85" />
      <circle cx="25.5" cy="21" r="1.3" fill={accentColor} opacity="0.85" />
      <circle cx="16" cy="27" r="1.3" fill={accentColor} opacity="0.85" />
      <circle cx="6.5" cy="21" r="1.3" fill={accentColor} opacity="0.85" />
      <circle cx="6.5" cy="11" r="1.3" fill={accentColor} opacity="0.85" />
      
      <line x1="16" y1="5" x2="16" y2="11" stroke={accentColor} strokeWidth="0.4" strokeOpacity="0.4" />
      <line x1="25.5" y1="11" x2="20" y2="13" stroke={accentColor} strokeWidth="0.4" strokeOpacity="0.4" />
      <line x1="25.5" y1="21" x2="20" y2="19" stroke={accentColor} strokeWidth="0.4" strokeOpacity="0.4" />
      <line x1="16" y1="27" x2="16" y2="21" stroke={accentColor} strokeWidth="0.4" strokeOpacity="0.4" />
      <line x1="6.5" y1="21" x2="12" y2="19" stroke={accentColor} strokeWidth="0.4" strokeOpacity="0.4" />
      <line x1="6.5" y1="11" x2="12" y2="13" stroke={accentColor} strokeWidth="0.4" strokeOpacity="0.4" />
      
      <circle cx="16" cy="16" r="3" fill={accentColor} opacity="0.15" />
      <circle cx="16" cy="16" r="2.2" fill={accentColor} opacity="0.95" filter={`url(#${glowFilterId})`} />
      
      <circle cx="16" cy="5" r="0.5" fill="#FFFFFF" opacity="0.6" />
      <circle cx="25.5" cy="11" r="0.5" fill="#FFFFFF" opacity="0.6" />
      <circle cx="25.5" cy="21" r="0.5" fill="#FFFFFF" opacity="0.6" />
    </svg>
  );
}

export function InferaAssistIcon({ className, size = defaultSize, accentColor = inferaAIColors.assist.accent, glowIntensity = 'medium' }: AIIconProps) {
  const id = useId();
  const coreGradId = `assistCoreGrad-${id}`;
  const glowFilterId = `assistGlow-${id}`;
  const glowOpacity = glowIntensity === 'high' ? 0.7 : glowIntensity === 'medium' ? 0.5 : 0.3;
  
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
        <radialGradient id={coreGradId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="1" />
          <stop offset="50%" stopColor={accentColor} stopOpacity="0.4" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
        </radialGradient>
        <filter id={glowFilterId} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      <rect width="32" height="32" rx="6" fill="#0A0A0F" />
      
      <circle cx="16" cy="16" r="12" fill={`url(#${coreGradId})`} opacity={glowOpacity * 0.35} />
      
      <circle cx="16" cy="16" r="11" stroke={accentColor} strokeWidth="0.3" strokeOpacity="0.2" fill="none" />
      
      <path
        d="M 16 4 L 17.5 12.5 L 26 10 L 19.5 15 L 28 16 L 19.5 17 L 26 22 L 17.5 19.5 L 16 28 L 14.5 19.5 L 6 22 L 12.5 17 L 4 16 L 12.5 15 L 6 10 L 14.5 12.5 Z"
        stroke={accentColor}
        strokeWidth="0.4"
        strokeOpacity="0.4"
        fill={accentColor}
        fillOpacity="0.06"
      />
      
      <path
        d="M 16 8 L 17 13 L 22 11 L 18.5 14.5 L 24 16 L 18.5 17.5 L 22 21 L 17 19 L 16 24 L 15 19 L 10 21 L 13.5 17.5 L 8 16 L 13.5 14.5 L 10 11 L 15 13 Z"
        stroke={accentColor}
        strokeWidth="0.5"
        strokeOpacity="0.6"
        fill={accentColor}
        fillOpacity="0.1"
      />
      
      <circle cx="16" cy="16" r="4" stroke={accentColor} strokeWidth="0.4" strokeOpacity="0.4" fill="none" />
      
      <circle cx="16" cy="16" r="2.5" fill={accentColor} opacity="0.2" />
      <circle cx="16" cy="16" r="1.8" fill={accentColor} opacity="0.95" filter={`url(#${glowFilterId})`} />
      
      <circle cx="16" cy="4" r="0.7" fill={accentColor} opacity="0.8" />
      <circle cx="26" cy="10" r="0.7" fill={accentColor} opacity="0.8" />
      <circle cx="28" cy="16" r="0.7" fill={accentColor} opacity="0.8" />
      <circle cx="26" cy="22" r="0.7" fill={accentColor} opacity="0.8" />
      <circle cx="16" cy="28" r="0.7" fill={accentColor} opacity="0.8" />
      <circle cx="6" cy="22" r="0.7" fill={accentColor} opacity="0.8" />
      <circle cx="4" cy="16" r="0.7" fill={accentColor} opacity="0.8" />
      <circle cx="6" cy="10" r="0.7" fill={accentColor} opacity="0.8" />
      
      <circle cx="16" cy="4" r="0.3" fill="#FFFFFF" opacity="0.5" />
      <circle cx="28" cy="16" r="0.3" fill="#FFFFFF" opacity="0.5" />
      <circle cx="16" cy="28" r="0.3" fill="#FFFFFF" opacity="0.5" />
      <circle cx="4" cy="16" r="0.3" fill="#FFFFFF" opacity="0.5" />
    </svg>
  );
}

export function InferaCoreIcon({ className, size = defaultSize, accentColor = inferaAIColors.core.accent, glowIntensity = 'medium' }: AIIconProps) {
  const id = useId();
  const coreGradId = `mainCoreGrad-${id}`;
  const glowFilterId = `mainGlow-${id}`;
  const pulseGradId = `corePulse-${id}`;
  const glowOpacity = glowIntensity === 'high' ? 0.7 : glowIntensity === 'medium' ? 0.5 : 0.3;
  
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
        <radialGradient id={coreGradId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="1" />
          <stop offset="40%" stopColor={accentColor} stopOpacity="0.5" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
        </radialGradient>
        <filter id={glowFilterId} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <linearGradient id={pulseGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.8" />
          <stop offset="50%" stopColor={accentColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0.8" />
        </linearGradient>
      </defs>
      
      <rect width="32" height="32" rx="6" fill="#0A0A0F" />
      
      <circle cx="16" cy="16" r="14" fill={`url(#${coreGradId})`} opacity={glowOpacity * 0.4} />
      
      <circle cx="16" cy="16" r="12" stroke={accentColor} strokeWidth="0.3" strokeOpacity="0.15" fill="none" />
      <circle cx="16" cy="16" r="10" stroke={accentColor} strokeWidth="0.35" strokeOpacity="0.2" fill="none" />
      <circle cx="16" cy="16" r="8" stroke={accentColor} strokeWidth="0.4" strokeOpacity="0.3" fill="none" />
      <circle cx="16" cy="16" r="6" stroke={accentColor} strokeWidth="0.5" strokeOpacity="0.45" fill="none" />
      <circle cx="16" cy="16" r="4.5" stroke={accentColor} strokeWidth="0.6" strokeOpacity="0.6" fill={accentColor} fillOpacity="0.08" />
      
      <line x1="16" y1="4" x2="16" y2="10" stroke={accentColor} strokeWidth="0.4" strokeOpacity="0.35" />
      <line x1="16" y1="22" x2="16" y2="28" stroke={accentColor} strokeWidth="0.4" strokeOpacity="0.35" />
      <line x1="4" y1="16" x2="10" y2="16" stroke={accentColor} strokeWidth="0.4" strokeOpacity="0.35" />
      <line x1="22" y1="16" x2="28" y2="16" stroke={accentColor} strokeWidth="0.4" strokeOpacity="0.35" />
      
      <line x1="7" y1="7" x2="11" y2="11" stroke={accentColor} strokeWidth="0.3" strokeOpacity="0.25" />
      <line x1="25" y1="7" x2="21" y2="11" stroke={accentColor} strokeWidth="0.3" strokeOpacity="0.25" />
      <line x1="7" y1="25" x2="11" y2="21" stroke={accentColor} strokeWidth="0.3" strokeOpacity="0.25" />
      <line x1="25" y1="25" x2="21" y2="21" stroke={accentColor} strokeWidth="0.3" strokeOpacity="0.25" />
      
      <circle cx="16" cy="16" r="3" fill={accentColor} opacity="0.25" />
      <circle cx="16" cy="16" r="2.2" fill={accentColor} opacity="0.95" filter={`url(#${glowFilterId})`} />
      
      <circle cx="16" cy="4" r="0.9" fill={accentColor} opacity="0.85" />
      <circle cx="16" cy="28" r="0.9" fill={accentColor} opacity="0.85" />
      <circle cx="4" cy="16" r="0.9" fill={accentColor} opacity="0.85" />
      <circle cx="28" cy="16" r="0.9" fill={accentColor} opacity="0.85" />
      
      <circle cx="7" cy="7" r="0.7" fill={accentColor} opacity="0.6" />
      <circle cx="25" cy="7" r="0.7" fill={accentColor} opacity="0.6" />
      <circle cx="7" cy="25" r="0.7" fill={accentColor} opacity="0.6" />
      <circle cx="25" cy="25" r="0.7" fill={accentColor} opacity="0.6" />
      
      <circle cx="16" cy="4" r="0.4" fill="#FFFFFF" opacity="0.5" />
      <circle cx="28" cy="16" r="0.4" fill="#FFFFFF" opacity="0.5" />
      <circle cx="16" cy="28" r="0.4" fill="#FFFFFF" opacity="0.5" />
      <circle cx="4" cy="16" r="0.4" fill="#FFFFFF" opacity="0.5" />
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
