import { XMLParser } from 'fast-xml-parser';

// Namecheap API Client for Domain Management
// Supports: Domain check, registration, renewal, transfer, DNS management

interface NamecheapConfig {
  apiUser: string;
  apiKey: string;
  userName: string;
  clientIp: string;
  sandbox?: boolean;
}

interface DomainCheckResult {
  domain: string;
  available: boolean;
  premium: boolean;
  premiumPrice?: number;
}

interface DnsRecord {
  hostName: string;
  recordType: string;
  address: string;
  mxPref?: number;
  ttl?: number;
}

interface DomainInfo {
  domainId: string;
  domainName: string;
  created: string;
  expires: string;
  isExpired: boolean;
  isLocked: boolean;
  autoRenew: boolean;
  whoisGuard: boolean;
  nameservers: string[];
}

interface DomainContact {
  firstName: string;
  lastName: string;
  organization?: string;
  jobTitle?: string;
  address1: string;
  address2?: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  phone: string;
  fax?: string;
  email: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
}

// Bilingual error messages
const errorMessages: Record<string, { en: string; ar: string }> = {
  INVALID_API_KEY: {
    en: 'Invalid API key or credentials',
    ar: 'مفتاح API أو بيانات الاعتماد غير صالحة'
  },
  DOMAIN_NOT_AVAILABLE: {
    en: 'Domain is not available for registration',
    ar: 'الدومين غير متاح للتسجيل'
  },
  DOMAIN_NOT_FOUND: {
    en: 'Domain not found in your account',
    ar: 'الدومين غير موجود في حسابك'
  },
  INSUFFICIENT_FUNDS: {
    en: 'Insufficient funds in account',
    ar: 'رصيد الحساب غير كافٍ'
  },
  RATE_LIMIT: {
    en: 'API rate limit exceeded, please try again later',
    ar: 'تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً'
  },
  IP_NOT_WHITELISTED: {
    en: 'Your IP address is not whitelisted',
    ar: 'عنوان IP الخاص بك غير مُدرج في القائمة البيضاء'
  },
  NETWORK_ERROR: {
    en: 'Network error connecting to Namecheap',
    ar: 'خطأ في الاتصال بـ Namecheap'
  },
  UNKNOWN_ERROR: {
    en: 'An unknown error occurred',
    ar: 'حدث خطأ غير معروف'
  }
};

export class NamecheapClient {
  private config: NamecheapConfig;
  private baseUrl: string;
  private parser: XMLParser;

  constructor(config: NamecheapConfig) {
    this.config = config;
    this.baseUrl = config.sandbox
      ? 'https://api.sandbox.namecheap.com/xml.response'
      : 'https://api.namecheap.com/xml.response';
    
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_'
    });
  }

  private buildUrl(command: string, params: Record<string, string> = {}): string {
    const urlParams = new URLSearchParams({
      ApiUser: this.config.apiUser,
      ApiKey: this.config.apiKey,
      UserName: this.config.userName,
      ClientIp: this.config.clientIp,
      Command: command,
      ...params
    });
    return `${this.baseUrl}?${urlParams.toString()}`;
  }

  private async makeRequest<T>(command: string, params: Record<string, string> = {}): Promise<ApiResponse<T>> {
    try {
      const url = this.buildUrl(command, params);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/xml'
        }
      });

      if (!response.ok) {
        return {
          success: false,
          error: errorMessages.NETWORK_ERROR.en,
          errorCode: 'NETWORK_ERROR'
        };
      }

      const xmlText = await response.text();
      const parsed = this.parser.parse(xmlText);

      const apiResponse = parsed.ApiResponse;
      
      if (apiResponse['@_Status'] === 'ERROR') {
        const errors = apiResponse.Errors?.Error;
        const errorMessage = Array.isArray(errors) ? errors[0]['#text'] : errors?.['#text'] || 'Unknown error';
        const errorNumber = Array.isArray(errors) ? errors[0]['@_Number'] : errors?.['@_Number'] || 'UNKNOWN';
        
        return {
          success: false,
          error: errorMessage,
          errorCode: this.mapErrorCode(errorNumber)
        };
      }

      return {
        success: true,
        data: apiResponse.CommandResponse as T
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorCode: 'UNKNOWN_ERROR'
      };
    }
  }

  private mapErrorCode(ncErrorCode: string): string {
    const codeMap: Record<string, string> = {
      '1011102': 'INVALID_API_KEY',
      '2030166': 'DOMAIN_NOT_AVAILABLE',
      '2019166': 'DOMAIN_NOT_FOUND',
      '2011170': 'INSUFFICIENT_FUNDS',
      '3050900': 'RATE_LIMIT',
      '1011150': 'IP_NOT_WHITELISTED'
    };
    return codeMap[ncErrorCode] || 'UNKNOWN_ERROR';
  }

  getErrorMessage(errorCode: string, language: 'en' | 'ar' = 'en'): string {
    return errorMessages[errorCode]?.[language] || errorMessages.UNKNOWN_ERROR[language];
  }

  // ==================== DOMAIN OPERATIONS ====================

  async checkDomainAvailability(domains: string[]): Promise<ApiResponse<DomainCheckResult[]>> {
    const result = await this.makeRequest<any>('namecheap.domains.check', {
      DomainList: domains.join(',')
    });

    if (!result.success) return result as ApiResponse<DomainCheckResult[]>;

    const domainResults = result.data?.DomainCheckResult;
    const results: DomainCheckResult[] = [];

    const items = Array.isArray(domainResults) ? domainResults : [domainResults];
    for (const item of items) {
      results.push({
        domain: item['@_Domain'],
        available: item['@_Available'] === 'true',
        premium: item['@_IsPremiumName'] === 'true',
        premiumPrice: item['@_PremiumRegistrationPrice'] ? parseFloat(item['@_PremiumRegistrationPrice']) : undefined
      });
    }

    return { success: true, data: results };
  }

  async getDomainList(page: number = 1, pageSize: number = 100): Promise<ApiResponse<DomainInfo[]>> {
    const result = await this.makeRequest<any>('namecheap.domains.getList', {
      Page: page.toString(),
      PageSize: pageSize.toString()
    });

    if (!result.success) return result as ApiResponse<DomainInfo[]>;

    const domainResults = result.data?.DomainGetListResult?.Domain;
    if (!domainResults) return { success: true, data: [] };

    const items = Array.isArray(domainResults) ? domainResults : [domainResults];
    const domains: DomainInfo[] = items.map((item: any) => ({
      domainId: item['@_ID'],
      domainName: item['@_Name'],
      created: item['@_Created'],
      expires: item['@_Expires'],
      isExpired: item['@_IsExpired'] === 'true',
      isLocked: item['@_IsLocked'] === 'true',
      autoRenew: item['@_AutoRenew'] === 'true',
      whoisGuard: item['@_WhoisGuard'] === 'true' || item['@_WhoisGuard'] === 'ENABLED',
      nameservers: []
    }));

    return { success: true, data: domains };
  }

  async getDomainInfo(domain: string): Promise<ApiResponse<DomainInfo>> {
    const [sld, tld] = this.splitDomain(domain);
    
    const result = await this.makeRequest<any>('namecheap.domains.getInfo', {
      DomainName: domain
    });

    if (!result.success) return result as ApiResponse<DomainInfo>;

    const info = result.data?.DomainGetInfoResult;
    const dnsDetails = info?.DnsDetails;
    
    let nameservers: string[] = [];
    if (dnsDetails?.Nameserver) {
      nameservers = Array.isArray(dnsDetails.Nameserver) 
        ? dnsDetails.Nameserver 
        : [dnsDetails.Nameserver];
    }

    return {
      success: true,
      data: {
        domainId: info['@_ID'],
        domainName: info['@_DomainName'],
        created: info['@_CreatedDate'],
        expires: info['@_ExpiredDate'],
        isExpired: info['@_IsExpired'] === 'true',
        isLocked: info['@_IsLocked'] === 'true',
        autoRenew: info?.Whoisguard?.['@_AutoRenew'] === 'true',
        whoisGuard: info?.Whoisguard?.['@_Enabled'] === 'True',
        nameservers
      }
    };
  }

  async registerDomain(
    domain: string,
    years: number,
    contact: DomainContact,
    nameservers?: string[]
  ): Promise<ApiResponse<{ domainId: string; orderId: string; chargedAmount: number }>> {
    const [sld, tld] = this.splitDomain(domain);
    
    const params: Record<string, string> = {
      DomainName: domain,
      Years: years.toString(),
      // Registrant Contact
      RegistrantFirstName: contact.firstName,
      RegistrantLastName: contact.lastName,
      RegistrantAddress1: contact.address1,
      RegistrantCity: contact.city,
      RegistrantStateProvince: contact.stateProvince,
      RegistrantPostalCode: contact.postalCode,
      RegistrantCountry: contact.country,
      RegistrantPhone: contact.phone,
      RegistrantEmailAddress: contact.email,
      // Tech Contact (same as registrant)
      TechFirstName: contact.firstName,
      TechLastName: contact.lastName,
      TechAddress1: contact.address1,
      TechCity: contact.city,
      TechStateProvince: contact.stateProvince,
      TechPostalCode: contact.postalCode,
      TechCountry: contact.country,
      TechPhone: contact.phone,
      TechEmailAddress: contact.email,
      // Admin Contact (same as registrant)
      AdminFirstName: contact.firstName,
      AdminLastName: contact.lastName,
      AdminAddress1: contact.address1,
      AdminCity: contact.city,
      AdminStateProvince: contact.stateProvince,
      AdminPostalCode: contact.postalCode,
      AdminCountry: contact.country,
      AdminPhone: contact.phone,
      AdminEmailAddress: contact.email,
      // Billing Contact (same as registrant)
      AuxBillingFirstName: contact.firstName,
      AuxBillingLastName: contact.lastName,
      AuxBillingAddress1: contact.address1,
      AuxBillingCity: contact.city,
      AuxBillingStateProvince: contact.stateProvince,
      AuxBillingPostalCode: contact.postalCode,
      AuxBillingCountry: contact.country,
      AuxBillingPhone: contact.phone,
      AuxBillingEmailAddress: contact.email,
    };

    // Add optional fields
    if (contact.organization) {
      params.RegistrantOrganizationName = contact.organization;
      params.TechOrganizationName = contact.organization;
      params.AdminOrganizationName = contact.organization;
      params.AuxBillingOrganizationName = contact.organization;
    }
    if (contact.address2) {
      params.RegistrantAddress2 = contact.address2;
      params.TechAddress2 = contact.address2;
      params.AdminAddress2 = contact.address2;
      params.AuxBillingAddress2 = contact.address2;
    }

    // Custom nameservers
    if (nameservers && nameservers.length > 0) {
      nameservers.forEach((ns, i) => {
        params[`Nameservers${i + 1}`] = ns;
      });
    }

    const result = await this.makeRequest<any>('namecheap.domains.create', params);

    if (!result.success) return result as ApiResponse<any>;

    const createResult = result.data?.DomainCreateResult;
    return {
      success: true,
      data: {
        domainId: createResult['@_DomainID'],
        orderId: createResult['@_OrderID'],
        chargedAmount: parseFloat(createResult['@_ChargedAmount'] || '0')
      }
    };
  }

  async renewDomain(domain: string, years: number = 1): Promise<ApiResponse<{ chargedAmount: number; expirationDate: string }>> {
    const [sld, tld] = this.splitDomain(domain);
    
    const result = await this.makeRequest<any>('namecheap.domains.renew', {
      DomainName: domain,
      Years: years.toString()
    });

    if (!result.success) return result as ApiResponse<any>;

    const renewResult = result.data?.DomainRenewResult;
    return {
      success: true,
      data: {
        chargedAmount: parseFloat(renewResult['@_ChargedAmount'] || '0'),
        expirationDate: renewResult['@_DomainDetails']?.['@_ExpiredDate'] || ''
      }
    };
  }

  // ==================== DNS OPERATIONS ====================

  async getDnsRecords(domain: string): Promise<ApiResponse<DnsRecord[]>> {
    const [sld, tld] = this.splitDomain(domain);
    
    const result = await this.makeRequest<any>('namecheap.domains.dns.getHosts', {
      SLD: sld,
      TLD: tld
    });

    if (!result.success) return result as ApiResponse<DnsRecord[]>;

    const hosts = result.data?.DomainDNSGetHostsResult?.host;
    if (!hosts) return { success: true, data: [] };

    const items = Array.isArray(hosts) ? hosts : [hosts];
    const records: DnsRecord[] = items.map((item: any) => ({
      hostName: item['@_Name'],
      recordType: item['@_Type'],
      address: item['@_Address'],
      mxPref: item['@_MXPref'] ? parseInt(item['@_MXPref']) : undefined,
      ttl: item['@_TTL'] ? parseInt(item['@_TTL']) : 1800
    }));

    return { success: true, data: records };
  }

  async setDnsRecords(domain: string, records: DnsRecord[]): Promise<ApiResponse<boolean>> {
    const [sld, tld] = this.splitDomain(domain);
    
    const params: Record<string, string> = {
      SLD: sld,
      TLD: tld
    };

    // Add each record
    records.forEach((record, index) => {
      const i = index + 1;
      params[`HostName${i}`] = record.hostName;
      params[`RecordType${i}`] = record.recordType;
      params[`Address${i}`] = record.address;
      params[`TTL${i}`] = (record.ttl || 1800).toString();
      if (record.mxPref && record.recordType === 'MX') {
        params[`MXPref${i}`] = record.mxPref.toString();
      }
    });

    const result = await this.makeRequest<any>('namecheap.domains.dns.setHosts', params);

    if (!result.success) return result as ApiResponse<boolean>;

    return {
      success: true,
      data: result.data?.DomainDNSSetHostsResult?.['@_IsSuccess'] === 'true'
    };
  }

  async addDnsRecord(domain: string, record: DnsRecord): Promise<ApiResponse<boolean>> {
    // Get existing records first
    const existingResult = await this.getDnsRecords(domain);
    if (!existingResult.success) return existingResult as ApiResponse<boolean>;

    const allRecords = [...(existingResult.data || []), record];
    return this.setDnsRecords(domain, allRecords);
  }

  async deleteDnsRecord(domain: string, hostName: string, recordType: string): Promise<ApiResponse<boolean>> {
    // Get existing records first
    const existingResult = await this.getDnsRecords(domain);
    if (!existingResult.success) return existingResult as ApiResponse<boolean>;

    const filteredRecords = (existingResult.data || []).filter(
      r => !(r.hostName === hostName && r.recordType === recordType)
    );

    return this.setDnsRecords(domain, filteredRecords);
  }

  // ==================== NAMESERVER OPERATIONS ====================

  async getNameservers(domain: string): Promise<ApiResponse<string[]>> {
    const [sld, tld] = this.splitDomain(domain);
    
    const result = await this.makeRequest<any>('namecheap.domains.dns.getList', {
      SLD: sld,
      TLD: tld
    });

    if (!result.success) return result as ApiResponse<string[]>;

    const nsResult = result.data?.DomainDNSGetListResult;
    let nameservers: string[] = [];
    
    if (nsResult?.Nameserver) {
      nameservers = Array.isArray(nsResult.Nameserver) 
        ? nsResult.Nameserver 
        : [nsResult.Nameserver];
    }

    return { success: true, data: nameservers };
  }

  async setCustomNameservers(domain: string, nameservers: string[]): Promise<ApiResponse<boolean>> {
    const [sld, tld] = this.splitDomain(domain);
    
    const result = await this.makeRequest<any>('namecheap.domains.dns.setCustom', {
      SLD: sld,
      TLD: tld,
      Nameservers: nameservers.join(',')
    });

    if (!result.success) return result as ApiResponse<boolean>;

    return {
      success: true,
      data: result.data?.DomainDNSSetCustomResult?.['@_Update'] === 'true'
    };
  }

  async setDefaultNameservers(domain: string): Promise<ApiResponse<boolean>> {
    const [sld, tld] = this.splitDomain(domain);
    
    const result = await this.makeRequest<any>('namecheap.domains.dns.setDefault', {
      SLD: sld,
      TLD: tld
    });

    if (!result.success) return result as ApiResponse<boolean>;

    return {
      success: true,
      data: result.data?.DomainDNSSetDefaultResult?.['@_Updated'] === 'true'
    };
  }

  // ==================== LOCK/UNLOCK ====================

  async setRegistrarLock(domain: string, lock: boolean): Promise<ApiResponse<boolean>> {
    const result = await this.makeRequest<any>('namecheap.domains.setRegistrarLock', {
      DomainName: domain,
      LockAction: lock ? 'LOCK' : 'UNLOCK'
    });

    if (!result.success) return result as ApiResponse<boolean>;

    return {
      success: true,
      data: result.data?.DomainSetRegistrarLockResult?.['@_IsSuccess'] === 'true'
    };
  }

  // ==================== PRICING ====================

  async getDomainPricing(tld: string): Promise<ApiResponse<{ registration: number; renewal: number; transfer: number }>> {
    const result = await this.makeRequest<any>('namecheap.users.getPricing', {
      ProductType: 'DOMAIN',
      ProductCategory: 'DOMAINS',
      ActionName: 'REGISTER'
    });

    if (!result.success) return result as ApiResponse<any>;

    // Parse pricing from response
    const productPrices = result.data?.UserGetPricingResult?.ProductType?.ProductCategory?.Product;
    
    // Find the specific TLD
    const items = Array.isArray(productPrices) ? productPrices : [productPrices];
    const tldProduct = items.find((p: any) => p['@_Name']?.toLowerCase() === tld.toLowerCase());

    if (!tldProduct) {
      return {
        success: false,
        error: `Pricing not found for .${tld}`,
        errorCode: 'DOMAIN_NOT_FOUND'
      };
    }

    return {
      success: true,
      data: {
        registration: parseFloat(tldProduct.Price?.['@_Price'] || '0'),
        renewal: parseFloat(tldProduct.Price?.['@_AdditionalCost'] || '0'),
        transfer: 0
      }
    };
  }

  // ==================== ACCOUNT ====================

  async getAccountBalance(): Promise<ApiResponse<{ balance: number; currency: string }>> {
    const result = await this.makeRequest<any>('namecheap.users.getBalances');

    if (!result.success) return result as ApiResponse<any>;

    const balances = result.data?.UserGetBalancesResult;
    return {
      success: true,
      data: {
        balance: parseFloat(balances['@_AvailableBalance'] || '0'),
        currency: balances['@_Currency'] || 'USD'
      }
    };
  }

  // ==================== HELPERS ====================

  private splitDomain(domain: string): [string, string] {
    const parts = domain.split('.');
    if (parts.length < 2) {
      throw new Error('Invalid domain format');
    }
    const tld = parts.pop()!;
    const sld = parts.join('.');
    return [sld, tld];
  }
}

// Factory function to create client from encrypted credentials
export async function createNamecheapClient(
  encryptedApiKey: string,
  apiUser: string,
  clientIp: string,
  sandbox: boolean = false
): Promise<NamecheapClient> {
  // Import crypto service for decryption
  const { cryptoService } = await import('./crypto-service');
  const apiKey = cryptoService.decrypt(encryptedApiKey);
  
  return new NamecheapClient({
    apiUser,
    apiKey,
    userName: apiUser,
    clientIp,
    sandbox
  });
}

export type { DomainCheckResult, DnsRecord, DomainInfo, DomainContact, ApiResponse };
