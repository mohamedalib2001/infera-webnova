export interface PlatformDeploymentConfig {
  name: string;
  nameAr?: string;
  port: number;
  path: string;
  service: string;
  domain: string;
}

export const INFERA_PLATFORMS: PlatformDeploymentConfig[] = [
  {
    name: "INFERA Engine AI Core",
    port: 4100,
    path: "/var/www/platforms/infera-engine-ai-core",
    service: "infera-infera-engine-ai-core.service",
    domain: "www.inferaaicore.com",
  },
  {
    name: "INFERA Engine Control",
    port: 4101,
    path: "/var/www/platforms/infera-engine-control",
    service: "infera-infera-engine-control.service",
    domain: "inferaenginecontrol.com",
  },
  {
    name: "INFERA Engine",
    port: 4102,
    path: "/var/www/platforms/infera-engine",
    service: "infera-infera-engine.service",
    domain: "www.inferaengine.com",
  },
  {
    name: "SmartMemoryAI",
    port: 4103,
    path: "/var/www/platforms/smartmemoryai",
    service: "infera-smartmemoryai.service",
    domain: "www.smartmemoryai.com",
  },
  {
    name: "INFERA HumanIQ",
    port: 4104,
    path: "/var/www/platforms/infera-humaniq",
    service: "infera-infera-humaniq.service",
    domain: "www.inferahumaniqai.com",
  },
  {
    name: "INFERA Legal AI",
    port: 4105,
    path: "/var/www/platforms/infera-legal-ai",
    service: "infera-infera-legal-ai.service",
    domain: "www.inferalegal.com",
  },
  {
    name: "INFERA AppForge AI",
    port: 4106,
    path: "/var/www/platforms/infera-appforge-ai",
    service: "infera-appforge-ai.service",
    domain: "www.inferaappforge.com",
  },
  {
    name: "INFERA Marketing AI",
    port: 4107,
    path: "/var/www/platforms/infera-marketing-ai",
    service: "infera-infera-marketing-ai.service",
    domain: "www.inferamarketing.com",
  },
  {
    name: "INFERA Marketplace AI",
    port: 4108,
    path: "/var/www/platforms/infera-marketplace-ai",
    service: "infera-infera-marketplace-ai.service",
    domain: "www.inferamarketplace.com",
  },
  {
    name: "INFERA AI Education Hub",
    port: 4109,
    path: "/var/www/platforms/infera-ai-education-hub",
    service: "infera-infera-ai-education-hub.service",
    domain: "www.inferaeducation.com",
  },
  {
    name: "INFERA Attend AI",
    port: 4110,
    path: "/var/www/platforms/infera-attend-ai",
    service: "infera-infera-attend-ai.service",
    domain: "www.inferaattend.com",
  },
  {
    name: "INFERA Smart Docs",
    port: 4111,
    path: "/var/www/platforms/infera-smart-docs",
    service: "infera-infera-smart-docs.service",
    domain: "www.inferasmartdocs.com",
  },
  {
    name: "INFERA Hospitality AI",
    port: 4112,
    path: "/var/www/platforms/infera-hospitality-ai",
    service: "infera-infera-hospitality-ai.service",
    domain: "www.inferahospitality.com",
  },
  {
    name: "INFERA VisionFeasibility",
    port: 4114,
    path: "/var/www/platforms/infera-visionfeasibility",
    service: "infera-infera-visionfeasibility.service",
    domain: "www.inferavisionfeasibility.com",
  },
  {
    name: "INFERA CV Builder",
    port: 4115,
    path: "/var/www/platforms/infera-cv-builder",
    service: "infera-infera-cv-builder.service",
    domain: "www.inferacvBuilder.com",
  },
  {
    name: "INFERA Jobs AI",
    port: 4116,
    path: "/var/www/platforms/infera-jobs-ai",
    service: "infera-infera-jobs-ai.service",
    domain: "www.inferajobs.com",
  },
  {
    name: "INFERA TrainAI",
    port: 4117,
    path: "/var/www/platforms/infera-trainai",
    service: "infera-infera-trainai.service",
    domain: "www.inferatrain.com",
  },
  {
    name: "INFERA Sovereign Finance AI",
    port: 4118,
    path: "/var/www/platforms/infera-sovereign-finance-ai",
    service: "infera-infera-sovereign-finance-ai.service",
    domain: "www.inferafinance.com",
  },
  {
    name: "INFERA Finance AI Global",
    port: 4119,
    path: "/var/www/platforms/infera-finance-ai-global",
    service: "infera-infera-finance-ai-global.service",
    domain: "www.InferaFinanceGlobal.com",
  },
  {
    name: "INFERA ShieldGrid",
    port: 4120,
    path: "/var/www/platforms/infera-shieldgrid",
    service: "infera-infera-shieldgrid.service",
    domain: "www.inferashieldgrid.com",
  },
  {
    name: "INFERA Smart Remote AI",
    port: 4121,
    path: "/var/www/platforms/infera-smart-remote-ai",
    service: "infera-infera-smart-remote-ai.service",
    domain: "www.inferasmartremoteai.com",
  },
  {
    name: "INFERA WebNova",
    port: 4113,
    path: "/var/www/platforms/infera-webnova",
    service: "infera-infera-webnova.service",
    domain: "www.inferawebnova.com",
  },
];

export function getPlatformByName(name: string): PlatformDeploymentConfig | undefined {
  return INFERA_PLATFORMS.find(p => p.name.toLowerCase() === name.toLowerCase());
}

export function getPlatformByPort(port: number): PlatformDeploymentConfig | undefined {
  return INFERA_PLATFORMS.find(p => p.port === port);
}

export function getPlatformByDomain(domain: string): PlatformDeploymentConfig | undefined {
  return INFERA_PLATFORMS.find(p => 
    p.domain.toLowerCase() === domain.toLowerCase() ||
    p.domain.toLowerCase().replace('www.', '') === domain.toLowerCase().replace('www.', '')
  );
}

export function getNextAvailablePort(): number {
  const usedPorts = INFERA_PLATFORMS.map(p => p.port);
  let port = 4100;
  while (usedPorts.includes(port)) {
    port++;
  }
  return port;
}
