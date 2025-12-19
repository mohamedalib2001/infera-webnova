import { storage } from "./storage";
import type { NamecheapClient } from "./namecheap-client";

export interface DomainRegistrarConfig {
  id: string;
  slug: string;
  name: string;
  nameAr: string;
  logo: string;
  website: string;
  docsUrl: string;
  status: 'active' | 'configured' | 'inactive' | 'coming_soon';
  tier: 1 | 2 | 3;
  capabilities: {
    domainRegistration: boolean;
    domainTransfer: boolean;
    dnsManagement: boolean;
    whoisPrivacy: boolean;
    autoRenew: boolean;
    bulkOperations: boolean;
    apiAvailable: boolean;
  };
  requiredCredentials: string[];
}

export interface DomainAvailabilityResult {
  domain: string;
  available: boolean;
  premium?: boolean;
  price?: number;
  currency?: string;
}

export interface DomainSummary {
  id: string;
  domain: string;
  registrar: string;
  status: string;
  created: string;
  expires: string;
  autoRenew: boolean;
  locked: boolean;
}

export interface DomainDetails {
  id: string;
  domain: string;
  registrar: string;
  status: string;
  created: string;
  expires: string;
  autoRenew: boolean;
  locked: boolean;
  whoisPrivacy: boolean;
  nameservers: string[];
}

export interface DnsRecordData {
  hostName: string;
  recordType: string;
  address: string;
  ttl?: number;
  mxPref?: number;
}

export interface DomainRegistrarAdapter {
  readonly registrarId: string;
  readonly config: DomainRegistrarConfig;
  
  checkAvailability(domains: string[]): Promise<DomainAvailabilityResult[]>;
  listDomains(page?: number, pageSize?: number): Promise<DomainSummary[]>;
  getDomainDetails(domain: string): Promise<DomainDetails>;
  
  registerDomain?(domain: string, years: number, contact: any): Promise<any>;
  renewDomain?(domain: string, years: number): Promise<any>;
  
  getDnsRecords?(domain: string): Promise<DnsRecordData[]>;
  setDnsRecords?(domain: string, records: DnsRecordData[]): Promise<boolean>;
  
  getNameservers?(domain: string): Promise<string[]>;
  setNameservers?(domain: string, nameservers: string[]): Promise<boolean>;
  
  setAutoRenew?(domain: string, enabled: boolean): Promise<boolean>;
  setLock?(domain: string, locked: boolean): Promise<boolean>;
  
  getAccountBalance?(): Promise<{ balance: number; currency: string }>;
  testConnection?(): Promise<{ success: boolean; message?: string }>;
}

const TIER1_PROVIDERS: DomainRegistrarConfig[] = [
  {
    id: 'namecheap',
    slug: 'namecheap',
    name: 'Namecheap',
    nameAr: 'نيم شيب',
    logo: 'namecheap',
    website: 'https://namecheap.com',
    docsUrl: 'https://www.namecheap.com/support/api/intro/',
    status: 'inactive',
    tier: 1,
    capabilities: {
      domainRegistration: true,
      domainTransfer: true,
      dnsManagement: true,
      whoisPrivacy: true,
      autoRenew: true,
      bulkOperations: true,
      apiAvailable: true,
    },
    requiredCredentials: ['apiUser', 'apiKey', 'clientIp'],
  },
  {
    id: 'godaddy',
    slug: 'godaddy',
    name: 'GoDaddy',
    nameAr: 'جو دادي',
    logo: 'godaddy',
    website: 'https://godaddy.com',
    docsUrl: 'https://developer.godaddy.com/doc',
    status: 'coming_soon',
    tier: 1,
    capabilities: {
      domainRegistration: true,
      domainTransfer: true,
      dnsManagement: true,
      whoisPrivacy: true,
      autoRenew: true,
      bulkOperations: true,
      apiAvailable: true,
    },
    requiredCredentials: ['apiKey', 'apiSecret'],
  },
  {
    id: 'cloudflare',
    slug: 'cloudflare',
    name: 'Cloudflare Registrar',
    nameAr: 'كلاود فلير',
    logo: 'cloudflare',
    website: 'https://cloudflare.com',
    docsUrl: 'https://developers.cloudflare.com/registrar/',
    status: 'coming_soon',
    tier: 1,
    capabilities: {
      domainRegistration: false,
      domainTransfer: true,
      dnsManagement: true,
      whoisPrivacy: true,
      autoRenew: true,
      bulkOperations: true,
      apiAvailable: true,
    },
    requiredCredentials: ['apiToken', 'accountId'],
  },
  {
    id: 'squarespace',
    slug: 'squarespace',
    name: 'Squarespace Domains',
    nameAr: 'سكوير سبيس',
    logo: 'squarespace',
    website: 'https://domains.squarespace.com',
    docsUrl: 'https://developers.squarespace.com/',
    status: 'coming_soon',
    tier: 1,
    capabilities: {
      domainRegistration: true,
      domainTransfer: true,
      dnsManagement: true,
      whoisPrivacy: true,
      autoRenew: true,
      bulkOperations: false,
      apiAvailable: true,
    },
    requiredCredentials: ['apiKey'],
  },
  {
    id: 'dynadot',
    slug: 'dynadot',
    name: 'Dynadot',
    nameAr: 'دينادوت',
    logo: 'dynadot',
    website: 'https://dynadot.com',
    docsUrl: 'https://www.dynadot.com/domain/api3.html',
    status: 'coming_soon',
    tier: 1,
    capabilities: {
      domainRegistration: true,
      domainTransfer: true,
      dnsManagement: true,
      whoisPrivacy: true,
      autoRenew: true,
      bulkOperations: true,
      apiAvailable: true,
    },
    requiredCredentials: ['apiKey'],
  },
  {
    id: 'porkbun',
    slug: 'porkbun',
    name: 'Porkbun',
    nameAr: 'بورك بن',
    logo: 'porkbun',
    website: 'https://porkbun.com',
    docsUrl: 'https://porkbun.com/api/json/v3/documentation',
    status: 'coming_soon',
    tier: 1,
    capabilities: {
      domainRegistration: true,
      domainTransfer: true,
      dnsManagement: true,
      whoisPrivacy: true,
      autoRenew: true,
      bulkOperations: true,
      apiAvailable: true,
    },
    requiredCredentials: ['apiKey', 'secretApiKey'],
  },
  {
    id: 'hover',
    slug: 'hover',
    name: 'Hover',
    nameAr: 'هوفر',
    logo: 'hover',
    website: 'https://hover.com',
    docsUrl: 'https://www.hover.com/api',
    status: 'coming_soon',
    tier: 1,
    capabilities: {
      domainRegistration: true,
      domainTransfer: true,
      dnsManagement: true,
      whoisPrivacy: true,
      autoRenew: true,
      bulkOperations: false,
      apiAvailable: true,
    },
    requiredCredentials: ['username', 'password'],
  },
  {
    id: 'ionos',
    slug: 'ionos',
    name: 'IONOS (1&1)',
    nameAr: 'أيونوس',
    logo: 'ionos',
    website: 'https://ionos.com',
    docsUrl: 'https://developer.hosting.ionos.com/',
    status: 'coming_soon',
    tier: 1,
    capabilities: {
      domainRegistration: true,
      domainTransfer: true,
      dnsManagement: true,
      whoisPrivacy: true,
      autoRenew: true,
      bulkOperations: true,
      apiAvailable: true,
    },
    requiredCredentials: ['apiKey', 'prefix'],
  },
  {
    id: 'gandi',
    slug: 'gandi',
    name: 'Gandi',
    nameAr: 'غاندي',
    logo: 'gandi',
    website: 'https://gandi.net',
    docsUrl: 'https://api.gandi.net/docs/',
    status: 'coming_soon',
    tier: 1,
    capabilities: {
      domainRegistration: true,
      domainTransfer: true,
      dnsManagement: true,
      whoisPrivacy: true,
      autoRenew: true,
      bulkOperations: true,
      apiAvailable: true,
    },
    requiredCredentials: ['apiKey'],
  },
  {
    id: 'enom',
    slug: 'enom',
    name: 'Enom',
    nameAr: 'إينوم',
    logo: 'enom',
    website: 'https://enom.com',
    docsUrl: 'https://www.enom.com/resellers/api-documentation/',
    status: 'coming_soon',
    tier: 1,
    capabilities: {
      domainRegistration: true,
      domainTransfer: true,
      dnsManagement: true,
      whoisPrivacy: true,
      autoRenew: true,
      bulkOperations: true,
      apiAvailable: true,
    },
    requiredCredentials: ['uid', 'pw'],
  },
  {
    id: 'opensrs',
    slug: 'opensrs',
    name: 'Tucows / OpenSRS',
    nameAr: 'أوبن إس آر إس',
    logo: 'opensrs',
    website: 'https://opensrs.com',
    docsUrl: 'https://opensrs.com/resources/documentation/',
    status: 'coming_soon',
    tier: 1,
    capabilities: {
      domainRegistration: true,
      domainTransfer: true,
      dnsManagement: true,
      whoisPrivacy: true,
      autoRenew: true,
      bulkOperations: true,
      apiAvailable: true,
    },
    requiredCredentials: ['username', 'apiKey', 'resellerIp'],
  },
  {
    id: 'namecom',
    slug: 'namecom',
    name: 'Name.com',
    nameAr: 'نيم دوت كوم',
    logo: 'namecom',
    website: 'https://name.com',
    docsUrl: 'https://www.name.com/api-docs',
    status: 'coming_soon',
    tier: 1,
    capabilities: {
      domainRegistration: true,
      domainTransfer: true,
      dnsManagement: true,
      whoisPrivacy: true,
      autoRenew: true,
      bulkOperations: true,
      apiAvailable: true,
    },
    requiredCredentials: ['username', 'token'],
  },
  {
    id: 'registercom',
    slug: 'registercom',
    name: 'Register.com',
    nameAr: 'ريجستر دوت كوم',
    logo: 'registercom',
    website: 'https://register.com',
    docsUrl: 'https://www.register.com/pro/api/',
    status: 'coming_soon',
    tier: 1,
    capabilities: {
      domainRegistration: true,
      domainTransfer: true,
      dnsManagement: true,
      whoisPrivacy: true,
      autoRenew: true,
      bulkOperations: false,
      apiAvailable: true,
    },
    requiredCredentials: ['apiKey', 'apiSecret'],
  },
  {
    id: 'networksolutions',
    slug: 'networksolutions',
    name: 'Network Solutions',
    nameAr: 'نتوورك سوليوشنز',
    logo: 'networksolutions',
    website: 'https://networksolutions.com',
    docsUrl: 'https://www.networksolutions.com/manage-it/api.jsp',
    status: 'coming_soon',
    tier: 1,
    capabilities: {
      domainRegistration: true,
      domainTransfer: true,
      dnsManagement: true,
      whoisPrivacy: true,
      autoRenew: true,
      bulkOperations: false,
      apiAvailable: true,
    },
    requiredCredentials: ['apiKey'],
  },
];

class NamecheapAdapter implements DomainRegistrarAdapter {
  readonly registrarId = 'namecheap';
  readonly config = TIER1_PROVIDERS.find(p => p.id === 'namecheap')!;
  
  private async getClient(): Promise<NamecheapClient | null> {
    const { getNamecheapClient } = await import('./domain-routes');
    return getNamecheapClient();
  }
  
  async checkAvailability(domains: string[]): Promise<DomainAvailabilityResult[]> {
    const client = await this.getClient();
    if (!client) throw new Error('Namecheap not configured');
    
    const result = await client.checkDomainAvailability(domains);
    if (!result.success || !result.data) throw new Error(result.error || 'Check failed');
    
    return result.data.map(d => ({
      domain: d.domain,
      available: d.available,
      premium: d.premium,
      price: d.premiumPrice,
      currency: 'USD',
    }));
  }
  
  async listDomains(page: number = 1, pageSize: number = 100): Promise<DomainSummary[]> {
    const client = await this.getClient();
    if (!client) throw new Error('Namecheap not configured');
    
    const result = await client.getDomainList(page, pageSize);
    if (!result.success || !result.data) throw new Error(result.error || 'List failed');
    
    return result.data.map(d => ({
      id: d.domainId,
      domain: d.domainName,
      registrar: 'namecheap',
      status: d.isExpired ? 'expired' : 'active',
      created: d.created,
      expires: d.expires,
      autoRenew: d.autoRenew,
      locked: d.isLocked,
    }));
  }
  
  async getDomainDetails(domain: string): Promise<DomainDetails> {
    const client = await this.getClient();
    if (!client) throw new Error('Namecheap not configured');
    
    const result = await client.getDomainInfo(domain);
    if (!result.success || !result.data) throw new Error(result.error || 'Info failed');
    
    const d = result.data;
    return {
      id: d.domainId,
      domain: d.domainName,
      registrar: 'namecheap',
      status: d.isExpired ? 'expired' : 'active',
      created: d.created,
      expires: d.expires,
      autoRenew: d.autoRenew,
      locked: d.isLocked,
      whoisPrivacy: d.whoisGuard,
      nameservers: d.nameservers,
    };
  }
  
  async registerDomain(domain: string, years: number, contact: any): Promise<any> {
    const client = await this.getClient();
    if (!client) throw new Error('Namecheap not configured');
    
    return client.registerDomain(domain, years, contact);
  }
  
  async renewDomain(domain: string, years: number): Promise<any> {
    const client = await this.getClient();
    if (!client) throw new Error('Namecheap not configured');
    
    return client.renewDomain(domain, years);
  }
  
  async getDnsRecords(domain: string): Promise<DnsRecordData[]> {
    const client = await this.getClient();
    if (!client) throw new Error('Namecheap not configured');
    
    const result = await client.getDnsRecords(domain);
    if (!result.success || !result.data) throw new Error(result.error || 'DNS failed');
    
    return result.data.map(r => ({
      hostName: r.hostName,
      recordType: r.recordType,
      address: r.address,
      ttl: r.ttl,
      mxPref: r.mxPref,
    }));
  }
  
  async setDnsRecords(domain: string, records: DnsRecordData[]): Promise<boolean> {
    const client = await this.getClient();
    if (!client) throw new Error('Namecheap not configured');
    
    const result = await client.setDnsRecords(domain, records);
    return result.success && result.data === true;
  }
  
  async getNameservers(domain: string): Promise<string[]> {
    const client = await this.getClient();
    if (!client) throw new Error('Namecheap not configured');
    
    const result = await client.getNameservers(domain);
    if (!result.success || !result.data) throw new Error(result.error || 'NS failed');
    
    return result.data;
  }
  
  async setNameservers(domain: string, nameservers: string[]): Promise<boolean> {
    const client = await this.getClient();
    if (!client) throw new Error('Namecheap not configured');
    
    const result = await client.setCustomNameservers(domain, nameservers);
    return result.success;
  }
  
  async setAutoRenew(domain: string, enabled: boolean): Promise<boolean> {
    const client = await this.getClient();
    if (!client) throw new Error('Namecheap not configured');
    
    const result = await client.setRegistrarLock(domain, enabled);
    return result.success;
  }
  
  async setLock(domain: string, locked: boolean): Promise<boolean> {
    const client = await this.getClient();
    if (!client) throw new Error('Namecheap not configured');
    
    const result = await client.setRegistrarLock(domain, locked);
    return result.success;
  }
  
  async getAccountBalance(): Promise<{ balance: number; currency: string }> {
    const client = await this.getClient();
    if (!client) throw new Error('Namecheap not configured');
    
    const result = await client.getAccountBalance();
    if (!result.success || !result.data) throw new Error(result.error || 'Balance failed');
    
    return {
      balance: parseFloat(String(result.data.balance)),
      currency: result.data.currency || 'USD',
    };
  }
  
  async testConnection(): Promise<{ success: boolean; message?: string }> {
    try {
      const balance = await this.getAccountBalance();
      return { 
        success: true, 
        message: `Connected. Balance: ${balance.balance} ${balance.currency}` 
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }
}

class PlaceholderAdapter implements DomainRegistrarAdapter {
  readonly registrarId: string;
  readonly config: DomainRegistrarConfig;
  
  constructor(config: DomainRegistrarConfig) {
    this.registrarId = config.id;
    this.config = config;
  }
  
  async checkAvailability(domains: string[]): Promise<DomainAvailabilityResult[]> {
    throw new Error(`${this.config.name} integration coming soon | تكامل ${this.config.nameAr} قريباً`);
  }
  
  async listDomains(): Promise<DomainSummary[]> {
    throw new Error(`${this.config.name} integration coming soon | تكامل ${this.config.nameAr} قريباً`);
  }
  
  async getDomainDetails(domain: string): Promise<DomainDetails> {
    throw new Error(`${this.config.name} integration coming soon | تكامل ${this.config.nameAr} قريباً`);
  }
}

export class DomainRegistrarRegistry {
  private adapters: Map<string, DomainRegistrarAdapter> = new Map();
  private defaultRegistrarId: string = 'namecheap';
  
  constructor() {
    this.register(new NamecheapAdapter());
    
    for (const config of TIER1_PROVIDERS) {
      if (config.id !== 'namecheap') {
        this.register(new PlaceholderAdapter(config));
      }
    }
  }
  
  register(adapter: DomainRegistrarAdapter) {
    this.adapters.set(adapter.registrarId, adapter);
  }
  
  get(registrarId: string): DomainRegistrarAdapter | undefined {
    return this.adapters.get(registrarId);
  }
  
  getDefault(): DomainRegistrarAdapter {
    return this.adapters.get(this.defaultRegistrarId)!;
  }
  
  setDefault(registrarId: string): boolean {
    if (this.adapters.has(registrarId)) {
      this.defaultRegistrarId = registrarId;
      return true;
    }
    return false;
  }
  
  listAll(): DomainRegistrarConfig[] {
    return Array.from(this.adapters.values()).map(a => a.config);
  }
  
  listActive(): DomainRegistrarConfig[] {
    return this.listAll().filter(c => c.status === 'active' || c.status === 'configured');
  }
  
  listAvailable(): DomainRegistrarConfig[] {
    return this.listAll().filter(c => c.status !== 'coming_soon');
  }
  
  getConfig(registrarId: string): DomainRegistrarConfig | undefined {
    return this.adapters.get(registrarId)?.config;
  }
  
  async initializeInDatabase(): Promise<void> {
    for (const config of TIER1_PROVIDERS) {
      const existing = await storage.getServiceProviderBySlug(config.slug);
      if (!existing) {
        await storage.createServiceProvider({
          name: config.name,
          nameAr: config.nameAr,
          slug: config.slug,
          category: 'domains',
          description: `Domain registration and DNS management via ${config.name}`,
          descriptionAr: `تسجيل النطاقات وإدارة DNS عبر ${config.nameAr}`,
          logo: config.logo,
          website: config.website,
          docsUrl: config.docsUrl,
          isBuiltIn: true,
          status: config.status === 'coming_soon' ? 'inactive' : config.status,
          metadata: {
            tier: config.tier,
            capabilities: config.capabilities,
            requiredCredentials: config.requiredCredentials,
            comingSoon: config.status === 'coming_soon',
          }
        });
      }
    }
  }
}

export const domainRegistrarRegistry = new DomainRegistrarRegistry();

export function getTier1Providers(): DomainRegistrarConfig[] {
  return TIER1_PROVIDERS;
}

export async function initializeDomainProviders(): Promise<void> {
  await domainRegistrarRegistry.initializeInDatabase();
  console.log('Domain registrar providers initialized | تم تهيئة مزودي النطاقات');
}
