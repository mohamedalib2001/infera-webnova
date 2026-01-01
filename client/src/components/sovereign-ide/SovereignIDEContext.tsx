import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";

type SecurityPosture = "secure" | "elevated" | "restricted";
type SovereignPhase = "analysis" | "planning" | "execution";

interface AuditLogEntry {
  timestamp: Date;
  action: string;
  phase: SovereignPhase;
  actor: string;
  metadata?: Record<string, unknown>;
}

interface SovereignIDEState {
  sessionId: string;
  sessionStartTime: Date;
  securityPosture: SecurityPosture;
  currentPhase: SovereignPhase;
  auditLog: AuditLogEntry[];
  showSidebar: boolean;
  showRightPanel: boolean;
  showBottomPanel: boolean;
  activeTab: "chat" | "code" | "preview" | "terminal";
  viewport: "desktop" | "tablet" | "mobile";
  selectedPlatformId: string | null;
  isRtl: boolean;
}

interface SovereignIDEActions {
  setSecurityPosture: (posture: SecurityPosture) => void;
  transitionPhase: (phase: SovereignPhase) => void;
  logSovereignAction: (action: string, metadata?: Record<string, unknown>) => void;
  setShowSidebar: (show: boolean) => void;
  setShowRightPanel: (show: boolean) => void;
  setShowBottomPanel: (show: boolean) => void;
  setActiveTab: (tab: "chat" | "code" | "preview" | "terminal") => void;
  setViewport: (viewport: "desktop" | "tablet" | "mobile") => void;
  setSelectedPlatformId: (id: string | null) => void;
}

interface SovereignIDEContextType extends SovereignIDEState, SovereignIDEActions {}

const SovereignIDEContext = createContext<SovereignIDEContextType | null>(null);

export function SovereignIDEProvider({ children, workspaceId }: { children: ReactNode; workspaceId: string }) {
  const { toast } = useToast();
  const { isRtl } = useLanguage();
  
  const [sessionId] = useState(() => `SOV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const [sessionStartTime] = useState(() => new Date());
  const [securityPosture, setSecurityPosture] = useState<SecurityPosture>("secure");
  const [currentPhase, setCurrentPhase] = useState<SovereignPhase>("analysis");
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  
  const [showSidebar, setShowSidebar] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [showBottomPanel, setShowBottomPanel] = useState(true);
  const [activeTab, setActiveTab] = useState<"chat" | "code" | "preview" | "terminal">("chat");
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [selectedPlatformId, setSelectedPlatformId] = useState<string | null>(null);
  
  const logSovereignAction = useCallback((action: string, metadata?: Record<string, unknown>) => {
    setAuditLog(prev => [...prev, {
      timestamp: new Date(),
      action,
      phase: currentPhase,
      actor: "ROOT_OWNER",
      metadata
    }]);
  }, [currentPhase]);
  
  const transitionPhase = useCallback((newPhase: SovereignPhase) => {
    const phaseOrder: SovereignPhase[] = ["analysis", "planning", "execution"];
    const currentIndex = phaseOrder.indexOf(currentPhase);
    const newIndex = phaseOrder.indexOf(newPhase);
    
    if (newIndex > currentIndex) {
      setSecurityPosture("elevated");
      setTimeout(() => setSecurityPosture("secure"), 3000);
    }
    
    logSovereignAction(`PHASE_TRANSITION: ${currentPhase} → ${newPhase}`, { 
      previousPhase: currentPhase, 
      newPhase 
    });
    
    setCurrentPhase(newPhase);
    
    toast({
      title: isRtl ? "تغيير المرحلة" : "Phase Transition",
      description: isRtl 
        ? `تم الانتقال إلى مرحلة ${newPhase === "analysis" ? "التحليل" : newPhase === "planning" ? "التخطيط" : "التنفيذ"}`
        : `Transitioned to ${newPhase.charAt(0).toUpperCase() + newPhase.slice(1)} phase`,
    });
  }, [currentPhase, isRtl, logSovereignAction, toast]);
  
  const value: SovereignIDEContextType = {
    sessionId,
    sessionStartTime,
    securityPosture,
    currentPhase,
    auditLog,
    showSidebar,
    showRightPanel,
    showBottomPanel,
    activeTab,
    viewport,
    selectedPlatformId,
    isRtl,
    setSecurityPosture,
    transitionPhase,
    logSovereignAction,
    setShowSidebar,
    setShowRightPanel,
    setShowBottomPanel,
    setActiveTab,
    setViewport,
    setSelectedPlatformId,
  };
  
  return (
    <SovereignIDEContext.Provider value={value}>
      {children}
    </SovereignIDEContext.Provider>
  );
}

export function useSovereignIDE() {
  const context = useContext(SovereignIDEContext);
  if (!context) {
    throw new Error("useSovereignIDE must be used within SovereignIDEProvider");
  }
  return context;
}

export type { SecurityPosture, SovereignPhase, AuditLogEntry };
