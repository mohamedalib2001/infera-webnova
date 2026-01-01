export interface PlatformLandingMapping {
  platformCode: string;
  platformName: string;
  platformNameAr: string;
  landingRoute: string;
  pitchDeckRoute?: string;
}

export const platformLandingMap: PlatformLandingMapping[] = [
  {
    platformCode: "INFERA-ENGINE-001",
    platformName: "INFERA Engine™",
    platformNameAr: "إنفيرا إنجن™",
    landingRoute: "/engine",
    pitchDeckRoute: "/pitch-deck/engine",
  },
  {
    platformCode: "INFERA-ENGINE-CONTROL-001",
    platformName: "INFERA Engine Control™",
    platformNameAr: "إنفيرا إنجن كونترول™",
    landingRoute: "/engine-control",
    pitchDeckRoute: "/pitch-deck/engine",
  },
  {
    platformCode: "INFERA-FINANCE-001",
    platformName: "INFERA Sovereign Finance AI™",
    platformNameAr: "إنفيرا سوفرين فاينانس AI™",
    landingRoute: "/finance",
    pitchDeckRoute: "/pitch-deck/sovereignfinance",
  },
  {
    platformCode: "INFERA-FINANCE-GLOBAL-001",
    platformName: "INFERA Finance AI – GlobalCloud™",
    platformNameAr: "إنفيرا فاينانس AI – جلوبال كلاود™",
    landingRoute: "/globalcloud",
    pitchDeckRoute: "/pitch-deck/globalcloud",
  },
  {
    platformCode: "INFERA-HUMANIQ-001",
    platformName: "INFERA HumanIQ™",
    platformNameAr: "إنفيرا هيومان آي كيو™",
    landingRoute: "/humaniq",
    pitchDeckRoute: "/pitch-deck/humaniq",
  },
  {
    platformCode: "INFERA-LEGAL-AI-001",
    platformName: "INFERA Legal AI™",
    platformNameAr: "إنفيرا ليجال AI™",
    landingRoute: "/legal",
    pitchDeckRoute: "/pitch-deck/legal",
  },
  {
    platformCode: "INFERA-APPFORGE-001",
    platformName: "INFERA AppForge AI™",
    platformNameAr: "إنفيرا آب فورج AI™",
    landingRoute: "/appforge",
    pitchDeckRoute: "/pitch-deck/appforge",
  },
  {
    platformCode: "INFERA-MARKETING-001",
    platformName: "INFERA Marketing AI™",
    platformNameAr: "إنفيرا ماركتنج AI™",
    landingRoute: "/marketing",
    pitchDeckRoute: "/pitch-deck/marketing",
  },
  {
    platformCode: "INFERA-MARKETPLACE-001",
    platformName: "INFERA MarketPlace AI™",
    platformNameAr: "إنفيرا ماركت بليس AI™",
    landingRoute: "/marketplace",
    pitchDeckRoute: "/pitch-deck/marketplace",
  },
  {
    platformCode: "INFERA-EDUCATION-001",
    platformName: "INFERA AI Education Hub™",
    platformNameAr: "إنفيرا إيديوكيشن هب AI™",
    landingRoute: "/education",
    pitchDeckRoute: "/pitch-deck/education",
  },
  {
    platformCode: "INFERA-ATTEND-001",
    platformName: "INFERA Attend AI™",
    platformNameAr: "إنفيرا أتند AI™",
    landingRoute: "/attend",
    pitchDeckRoute: "/pitch-deck/attend",
  },
  {
    platformCode: "INFERA-SMARTDOCS-001",
    platformName: "INFERA Smart Docs™",
    platformNameAr: "إنفيرا سمارت دوكس™",
    landingRoute: "/smartdocs",
    pitchDeckRoute: "/pitch-deck/smartdocs",
  },
  {
    platformCode: "INFERA-HOSPITALITY-001",
    platformName: "INFERA Hospitality AI™",
    platformNameAr: "إنفيرا هوسبيتاليتي AI™",
    landingRoute: "/hospitality",
    pitchDeckRoute: "/pitch-deck/hospitality",
  },
  {
    platformCode: "INFERA-VISIONFEASIBILITY-001",
    platformName: "INFERA VisionFeasibility™",
    platformNameAr: "إنفيرا فيجن فيزيبيليتي™",
    landingRoute: "/feasibility",
    pitchDeckRoute: "/pitch-deck/visionfeasibility",
  },
  {
    platformCode: "INFERA-CVBUILDER-001",
    platformName: "INFERA CV Builder™",
    platformNameAr: "إنفيرا سي في بيلدر™",
    landingRoute: "/cvbuilder",
    pitchDeckRoute: "/pitch-deck/cvbuilder",
  },
  {
    platformCode: "INFERA-JOBS-001",
    platformName: "INFERA Jobs AI™",
    platformNameAr: "إنفيرا جوبز AI™",
    landingRoute: "/jobs",
    pitchDeckRoute: "/pitch-deck/jobsai",
  },
  {
    platformCode: "INFERA-TRAIN-001",
    platformName: "INFERA TrainAI™",
    platformNameAr: "إنفيرا ترين AI™",
    landingRoute: "/trainai",
    pitchDeckRoute: "/pitch-deck/trainai",
  },
  {
    platformCode: "INFERA-SHIELDGRID-001",
    platformName: "INFERA ShieldGrid™",
    platformNameAr: "إنفيرا شيلد جريد™",
    landingRoute: "/shieldgrid",
    pitchDeckRoute: "/pitch-deck/shieldgrid",
  },
  {
    platformCode: "INFERA-SMARTREMOTE-001",
    platformName: "INFERA Smart Remote AI™",
    platformNameAr: "إنفيرا سمارت ريموت AI™",
    landingRoute: "/smartremote",
    pitchDeckRoute: "/pitch-deck/smartremote",
  },
  {
    platformCode: "SMARTMEMORY-AI-001",
    platformName: "SmartMemoryAI™",
    platformNameAr: "سمارت ميموري AI™",
    landingRoute: "/infera-group",
    pitchDeckRoute: "/pitch-deck/smartmemory",
  },
];

export function findLandingPageByPlatformCode(code: string): PlatformLandingMapping | null {
  return platformLandingMap.find(
    (p) => p.platformCode.toLowerCase() === code.toLowerCase()
  ) || null;
}

export function findLandingPageByPlatformName(name: string): PlatformLandingMapping | null {
  const normalizedName = name.toLowerCase().replace(/\s+/g, '').replace(/™/g, '');
  return platformLandingMap.find((p) => {
    const platformNameNormalized = p.platformName.toLowerCase().replace(/\s+/g, '').replace(/™/g, '');
    return platformNameNormalized.includes(normalizedName) || normalizedName.includes(platformNameNormalized);
  }) || null;
}

export function getPlatformLandingRoute(codeOrName: string): string | null {
  const byCode = findLandingPageByPlatformCode(codeOrName);
  if (byCode) return byCode.landingRoute;
  
  const byName = findLandingPageByPlatformName(codeOrName);
  return byName?.landingRoute || null;
}

export function getPlatformPitchDeckRoute(codeOrName: string): string | null {
  const byCode = findLandingPageByPlatformCode(codeOrName);
  if (byCode) return byCode.pitchDeckRoute || null;
  
  const byName = findLandingPageByPlatformName(codeOrName);
  return byName?.pitchDeckRoute || null;
}
