// =====================================================================
// INFERA MANDATORY DYNAMIC ICON & LOGO BINDING FRAMEWORK
// محرك الربط الديناميكي للشعارات والأيقونات - إلزامي
// =====================================================================

import { platformIconsRegistry, type PlatformIconConfig } from "./platform-icons-registry";

// Storage key for synced logos
const LOGO_STORAGE_KEY = "infera_synced_logos";
const LOGO_HISTORY_KEY = "infera_logo_history";

// Logo variant types
export type LogoVariantType = 
  | "app-icon-1024" 
  | "app-icon-512" 
  | "favicon-32" 
  | "favicon-16" 
  | "tab-icon" 
  | "mono-svg" 
  | "light-bg" 
  | "dark-bg";

// Synced logo data structure
export interface SyncedLogo {
  platformId: string;
  variant: LogoVariantType;
  svg: string;
  timestamp: number;
  version: number;
  boundBy: string;
  isActive: boolean;
}

// Logo history entry for rollback
export interface LogoHistoryEntry {
  platformId: string;
  variant: LogoVariantType;
  svg: string;
  timestamp: number;
  version: number;
  archivedAt: number;
  replacedBy: number;
}

// Platform logo state
export interface PlatformLogoState {
  platformId: string;
  platformName: string;
  platformNameAr: string;
  logos: Record<LogoVariantType, SyncedLogo | null>;
  lastSync: number;
  syncStatus: "synced" | "pending" | "error";
  complianceStatus: "compliant" | "non-compliant" | "partial";
}

// Get all synced logos from storage
export function getSyncedLogos(): Record<string, Record<LogoVariantType, SyncedLogo | null>> {
  try {
    const stored = localStorage.getItem(LOGO_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

// Get logo history for rollback
export function getLogoHistory(): LogoHistoryEntry[] {
  try {
    const stored = localStorage.getItem(LOGO_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save synced logos to storage
function saveSyncedLogos(logos: Record<string, Record<LogoVariantType, SyncedLogo | null>>): void {
  localStorage.setItem(LOGO_STORAGE_KEY, JSON.stringify(logos));
  window.dispatchEvent(new CustomEvent("infera-logo-sync", { detail: logos }));
}

// Save logo history
function saveLogoHistory(history: LogoHistoryEntry[]): void {
  localStorage.setItem(LOGO_HISTORY_KEY, JSON.stringify(history.slice(-100)));
}

// Get platform logo state
export function getPlatformLogoState(platformId: string): PlatformLogoState | null {
  const platform = platformIconsRegistry.find(p => p.id === platformId);
  if (!platform) return null;

  const syncedLogos = getSyncedLogos();
  const platformLogos = syncedLogos[platformId] || {};

  const variants: LogoVariantType[] = [
    "app-icon-1024", "app-icon-512", "favicon-32", "favicon-16", 
    "tab-icon", "mono-svg", "light-bg", "dark-bg"
  ];

  const logos: Record<LogoVariantType, SyncedLogo | null> = {} as Record<LogoVariantType, SyncedLogo | null>;
  let syncedCount = 0;

  variants.forEach(v => {
    logos[v] = platformLogos[v] || null;
    if (logos[v]) syncedCount++;
  });

  const complianceStatus: PlatformLogoState["complianceStatus"] = 
    syncedCount === 0 ? "non-compliant" :
    syncedCount < variants.length ? "partial" : "compliant";

  return {
    platformId,
    platformName: platform.name,
    platformNameAr: platform.nameAr,
    logos,
    lastSync: Math.max(...Object.values(platformLogos).filter(Boolean).map((l: SyncedLogo | null) => l?.timestamp || 0), 0),
    syncStatus: "synced",
    complianceStatus
  };
}

// Bind logo to platform (CORE BINDING ENGINE)
export function bindLogoToPlatform(
  platformId: string,
  variant: LogoVariantType,
  svg: string,
  boundBy: string = "system"
): { success: boolean; version: number; message: string } {
  const platform = platformIconsRegistry.find(p => p.id === platformId);
  if (!platform) {
    return { success: false, version: 0, message: "Platform not found" };
  }

  const syncedLogos = getSyncedLogos();
  const history = getLogoHistory();
  
  // Initialize platform logos if not exists
  if (!syncedLogos[platformId]) {
    syncedLogos[platformId] = {} as Record<LogoVariantType, SyncedLogo | null>;
  }

  // Archive existing logo if present
  const existingLogo = syncedLogos[platformId][variant];
  const newVersion = existingLogo ? existingLogo.version + 1 : 1;

  if (existingLogo) {
    history.push({
      platformId,
      variant,
      svg: existingLogo.svg,
      timestamp: existingLogo.timestamp,
      version: existingLogo.version,
      archivedAt: Date.now(),
      replacedBy: newVersion
    });
    saveLogoHistory(history);
  }

  // Create new synced logo
  const newLogo: SyncedLogo = {
    platformId,
    variant,
    svg,
    timestamp: Date.now(),
    version: newVersion,
    boundBy,
    isActive: true
  };

  syncedLogos[platformId][variant] = newLogo;
  saveSyncedLogos(syncedLogos);

  return { 
    success: true, 
    version: newVersion, 
    message: `Logo bound to ${platform.name} (v${newVersion})` 
  };
}

// Bind all logo variants at once
export function bindAllVariantsToPlatform(
  platformId: string,
  baseSvg: string,
  monoSvg: string,
  boundBy: string = "system"
): { success: boolean; message: string; versions: Record<LogoVariantType, number> } {
  const variants: LogoVariantType[] = [
    "app-icon-1024", "app-icon-512", "favicon-32", "favicon-16", 
    "tab-icon", "mono-svg", "light-bg", "dark-bg"
  ];

  const versions: Record<LogoVariantType, number> = {} as Record<LogoVariantType, number>;
  let allSuccess = true;

  variants.forEach(variant => {
    const svg = variant === "mono-svg" ? monoSvg : baseSvg;
    const result = bindLogoToPlatform(platformId, variant, svg, boundBy);
    versions[variant] = result.version;
    if (!result.success) allSuccess = false;
  });

  return {
    success: allSuccess,
    message: allSuccess ? "All variants bound successfully" : "Some variants failed",
    versions
  };
}

// Rollback to previous version
export function rollbackLogo(
  platformId: string,
  variant: LogoVariantType,
  targetVersion: number
): { success: boolean; message: string } {
  const history = getLogoHistory();
  const targetEntry = history.find(
    h => h.platformId === platformId && h.variant === variant && h.version === targetVersion
  );

  if (!targetEntry) {
    return { success: false, message: "Version not found in history" };
  }

  const result = bindLogoToPlatform(platformId, variant, targetEntry.svg, "rollback");
  return {
    success: result.success,
    message: result.success ? `Rolled back to v${targetVersion}` : "Rollback failed"
  };
}

// Get logo for a specific platform and variant
export function getPlatformLogo(platformId: string, variant: LogoVariantType): SyncedLogo | null {
  const syncedLogos = getSyncedLogos();
  return syncedLogos[platformId]?.[variant] || null;
}

// Check compliance status for all platforms
export function checkGlobalCompliance(): {
  totalPlatforms: number;
  compliant: number;
  partial: number;
  nonCompliant: number;
  platforms: Array<{ id: string; name: string; status: PlatformLogoState["complianceStatus"] }>;
} {
  const platforms: Array<{ id: string; name: string; status: PlatformLogoState["complianceStatus"] }> = [];
  let compliant = 0;
  let partial = 0;
  let nonCompliant = 0;

  platformIconsRegistry.forEach(platform => {
    const state = getPlatformLogoState(platform.id);
    if (state) {
      platforms.push({
        id: platform.id,
        name: platform.name,
        status: state.complianceStatus
      });
      if (state.complianceStatus === "compliant") compliant++;
      else if (state.complianceStatus === "partial") partial++;
      else nonCompliant++;
    }
  });

  return {
    totalPlatforms: platforms.length,
    compliant,
    partial,
    nonCompliant,
    platforms
  };
}

// Subscribe to logo sync events
export function subscribeToLogoSync(
  callback: (logos: Record<string, Record<LogoVariantType, SyncedLogo | null>>) => void
): () => void {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<Record<string, Record<LogoVariantType, SyncedLogo | null>>>;
    callback(customEvent.detail);
  };
  window.addEventListener("infera-logo-sync", handler);
  return () => {
    window.removeEventListener("infera-logo-sync", handler);
  };
}

// Get all platforms for dropdown
export function getAllPlatformsForBinding(): Array<{ id: string; name: string; nameAr: string; category: string }> {
  return platformIconsRegistry.map(p => ({
    id: p.id,
    name: p.name,
    nameAr: p.nameAr,
    category: p.category
  }));
}
