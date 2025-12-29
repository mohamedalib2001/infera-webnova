/**
 * Sovereign Legal Compliance Engine | محرك التوافق القانوني السيادي
 * 
 * Features:
 * - Digital Sovereignty (Data Residency)
 * - Geographic Restrictions by Country
 * - Special Modes for Military/Security Sectors
 * - Compliance Framework Support (GDPR, HIPAA, PCI-DSS, SOC2)
 * - Audit Trail for Compliance Actions
 */

import crypto from 'crypto';

export type ComplianceFramework = 'GDPR' | 'HIPAA' | 'PCI-DSS' | 'SOC2' | 'ISO27001' | 'NIST' | 'CCPA' | 'PDPA' | 'MILITARY' | 'GOVERNMENT';

export type DataResidencyRegion = 
  | 'MENA' | 'GCC' | 'EU' | 'US' | 'APAC' | 'LATAM' | 'AFRICA'
  | 'SAUDI_ARABIA' | 'UAE' | 'EGYPT' | 'QATAR' | 'KUWAIT' | 'BAHRAIN' | 'OMAN' | 'JORDAN';

export type SectorMode = 'civilian' | 'government' | 'military' | 'security' | 'critical-infrastructure';

export type RestrictionLevel = 'none' | 'limited' | 'restricted' | 'prohibited';

export interface DataResidencyPolicy {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  region: DataResidencyRegion;
  allowedCountries: string[];
  blockedCountries: string[];
  dataTypes: string[];
  encryptionRequired: boolean;
  localStorageOnly: boolean;
  crossBorderTransferAllowed: boolean;
  crossBorderConditions?: string[];
  frameworks: ComplianceFramework[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GeoRestriction {
  id: string;
  name: string;
  nameAr: string;
  countryCode: string;
  countryName: string;
  countryNameAr: string;
  restrictionLevel: RestrictionLevel;
  allowedOperations: string[];
  blockedOperations: string[];
  requiresApproval: string[];
  sectorModes: SectorMode[];
  specialConditions: string[];
  specialConditionsAr: string[];
  enabled: boolean;
  createdAt: string;
}

export interface SectorModeConfig {
  id: string;
  mode: SectorMode;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  securityLevel: 'standard' | 'elevated' | 'high' | 'critical' | 'top-secret';
  requiredFrameworks: ComplianceFramework[];
  additionalRestrictions: string[];
  auditLevel: 'basic' | 'detailed' | 'comprehensive' | 'forensic';
  accessControlLevel: 'role-based' | 'attribute-based' | 'mandatory' | 'multi-level';
  encryptionStandard: 'AES-128' | 'AES-256' | 'AES-256-GCM' | 'FIPS-140-3';
  dataRetentionYears: number;
  enabled: boolean;
  createdAt: string;
}

export interface ComplianceCheck {
  id: string;
  tenantId: string;
  operation: string;
  sourceCountry: string;
  targetCountry?: string;
  dataTypes: string[];
  sectorMode: SectorMode;
  result: 'allowed' | 'denied' | 'conditional' | 'pending-approval';
  violations: ComplianceViolation[];
  conditions: string[];
  conditionsAr: string[];
  checkedAt: string;
  checkedBy: string;
}

export interface ComplianceViolation {
  code: string;
  framework: ComplianceFramework;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  messageAr: string;
  remediation: string;
  remediationAr: string;
}

export interface ComplianceAuditLog {
  id: string;
  tenantId: string;
  action: string;
  actionAr: string;
  actor: string;
  actorEmail: string;
  targetResource: string;
  complianceCheckId?: string;
  result: 'success' | 'failure' | 'blocked';
  details: Record<string, any>;
  timestamp: string;
}

export interface ComplianceStats {
  totalPolicies: number;
  activePolicies: number;
  totalChecks: number;
  checksAllowed: number;
  checksDenied: number;
  checksPending: number;
  violationsBySeverity: Record<string, number>;
  checksByFramework: Record<string, number>;
  checksBySector: Record<string, number>;
}

const OWNER_EMAIL = "mohamed.ali.b2001@gmail.com";

class SovereignComplianceEngine {
  private residencyPolicies: Map<string, DataResidencyPolicy> = new Map();
  private geoRestrictions: Map<string, GeoRestriction> = new Map();
  private sectorModes: Map<string, SectorModeConfig> = new Map();
  private complianceChecks: Map<string, ComplianceCheck> = new Map();
  private auditLogs: Map<string, ComplianceAuditLog> = new Map();

  constructor() {
    this.initializeDefaultPolicies();
    this.initializeDefaultSectorModes();
    this.initializeDefaultGeoRestrictions();
    console.log('[SovereignCompliance] Engine initialized | تم تهيئة محرك التوافق السيادي');
  }

  private initializeDefaultPolicies(): void {
    const defaults: Omit<DataResidencyPolicy, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'GCC Data Sovereignty',
        nameAr: 'سيادة بيانات دول الخليج',
        description: 'Data must remain within GCC member states',
        descriptionAr: 'يجب أن تبقى البيانات داخل دول مجلس التعاون الخليجي',
        region: 'GCC',
        allowedCountries: ['SA', 'AE', 'QA', 'KW', 'BH', 'OM'],
        blockedCountries: [],
        dataTypes: ['personal', 'financial', 'government', 'health'],
        encryptionRequired: true,
        localStorageOnly: true,
        crossBorderTransferAllowed: true,
        crossBorderConditions: ['Within GCC only', 'Encryption required'],
        frameworks: ['PDPA', 'ISO27001'],
        enabled: true
      },
      {
        name: 'Saudi Arabia Data Localization',
        nameAr: 'توطين البيانات السعودية',
        description: 'Critical data must be stored in Saudi Arabia',
        descriptionAr: 'يجب تخزين البيانات الحساسة داخل المملكة العربية السعودية',
        region: 'SAUDI_ARABIA',
        allowedCountries: ['SA'],
        blockedCountries: [],
        dataTypes: ['government', 'military', 'critical-infrastructure', 'citizen-data'],
        encryptionRequired: true,
        localStorageOnly: true,
        crossBorderTransferAllowed: false,
        frameworks: ['PDPA', 'ISO27001', 'NIST'],
        enabled: true
      },
      {
        name: 'Egypt Data Protection',
        nameAr: 'حماية البيانات المصرية',
        description: 'Egyptian citizen data protection compliance',
        descriptionAr: 'الامتثال لحماية بيانات المواطنين المصريين',
        region: 'EGYPT',
        allowedCountries: ['EG', 'SA', 'AE'],
        blockedCountries: [],
        dataTypes: ['personal', 'financial', 'health'],
        encryptionRequired: true,
        localStorageOnly: false,
        crossBorderTransferAllowed: true,
        crossBorderConditions: ['Consent required', 'Adequate protection'],
        frameworks: ['PDPA', 'ISO27001'],
        enabled: true
      },
      {
        name: 'EU GDPR Compliance',
        nameAr: 'الامتثال للائحة العامة لحماية البيانات',
        description: 'European Union GDPR compliance requirements',
        descriptionAr: 'متطلبات الامتثال للائحة العامة لحماية البيانات الأوروبية',
        region: 'EU',
        allowedCountries: [],
        blockedCountries: [],
        dataTypes: ['personal', 'health', 'biometric'],
        encryptionRequired: true,
        localStorageOnly: false,
        crossBorderTransferAllowed: true,
        crossBorderConditions: ['Adequacy decision', 'Standard contractual clauses', 'Binding corporate rules'],
        frameworks: ['GDPR'],
        enabled: true
      }
    ];

    defaults.forEach((policy, index) => {
      const id = `residency-${index + 1}`;
      this.residencyPolicies.set(id, {
        ...policy,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });
  }

  private initializeDefaultSectorModes(): void {
    const modes: Omit<SectorModeConfig, 'id' | 'createdAt'>[] = [
      {
        mode: 'civilian',
        name: 'Civilian Mode',
        nameAr: 'الوضع المدني',
        description: 'Standard operations for civilian applications',
        descriptionAr: 'العمليات القياسية للتطبيقات المدنية',
        securityLevel: 'standard',
        requiredFrameworks: ['ISO27001'],
        additionalRestrictions: [],
        auditLevel: 'basic',
        accessControlLevel: 'role-based',
        encryptionStandard: 'AES-256',
        dataRetentionYears: 5,
        enabled: true
      },
      {
        mode: 'government',
        name: 'Government Mode',
        nameAr: 'الوضع الحكومي',
        description: 'Enhanced security for government operations',
        descriptionAr: 'أمان معزز للعمليات الحكومية',
        securityLevel: 'elevated',
        requiredFrameworks: ['ISO27001', 'NIST', 'GOVERNMENT'],
        additionalRestrictions: ['No foreign access', 'Citizen data only'],
        auditLevel: 'detailed',
        accessControlLevel: 'attribute-based',
        encryptionStandard: 'AES-256-GCM',
        dataRetentionYears: 10,
        enabled: true
      },
      {
        mode: 'military',
        name: 'Military Mode',
        nameAr: 'الوضع العسكري',
        description: 'Maximum security for military operations',
        descriptionAr: 'أقصى درجات الأمان للعمليات العسكرية',
        securityLevel: 'top-secret',
        requiredFrameworks: ['ISO27001', 'NIST', 'MILITARY'],
        additionalRestrictions: [
          'Classified personnel only',
          'Air-gapped networks',
          'No cloud storage',
          'Hardware encryption required'
        ],
        auditLevel: 'forensic',
        accessControlLevel: 'multi-level',
        encryptionStandard: 'FIPS-140-3',
        dataRetentionYears: 25,
        enabled: true
      },
      {
        mode: 'security',
        name: 'Security Mode',
        nameAr: 'الوضع الأمني',
        description: 'High security for security agencies',
        descriptionAr: 'أمان عالي للأجهزة الأمنية',
        securityLevel: 'critical',
        requiredFrameworks: ['ISO27001', 'NIST', 'GOVERNMENT'],
        additionalRestrictions: [
          'Vetted personnel only',
          'Secure facilities',
          'No external access'
        ],
        auditLevel: 'forensic',
        accessControlLevel: 'multi-level',
        encryptionStandard: 'FIPS-140-3',
        dataRetentionYears: 20,
        enabled: true
      },
      {
        mode: 'critical-infrastructure',
        name: 'Critical Infrastructure Mode',
        nameAr: 'وضع البنية التحتية الحرجة',
        description: 'Protection for critical national infrastructure',
        descriptionAr: 'حماية البنية التحتية الوطنية الحرجة',
        securityLevel: 'high',
        requiredFrameworks: ['ISO27001', 'NIST', 'SOC2'],
        additionalRestrictions: [
          'Redundant systems',
          'Fail-safe operations',
          '24/7 monitoring'
        ],
        auditLevel: 'comprehensive',
        accessControlLevel: 'mandatory',
        encryptionStandard: 'AES-256-GCM',
        dataRetentionYears: 15,
        enabled: true
      }
    ];

    modes.forEach((mode, index) => {
      const id = `sector-${mode.mode}`;
      this.sectorModes.set(id, {
        ...mode,
        id,
        createdAt: new Date().toISOString()
      });
    });
  }

  private initializeDefaultGeoRestrictions(): void {
    const restrictions: Omit<GeoRestriction, 'id' | 'createdAt'>[] = [
      {
        name: 'Saudi Arabia',
        nameAr: 'المملكة العربية السعودية',
        countryCode: 'SA',
        countryName: 'Saudi Arabia',
        countryNameAr: 'المملكة العربية السعودية',
        restrictionLevel: 'none',
        allowedOperations: ['all'],
        blockedOperations: [],
        requiresApproval: ['military', 'government'],
        sectorModes: ['civilian', 'government', 'military', 'security', 'critical-infrastructure'],
        specialConditions: [],
        specialConditionsAr: [],
        enabled: true
      },
      {
        name: 'United Arab Emirates',
        nameAr: 'الإمارات العربية المتحدة',
        countryCode: 'AE',
        countryName: 'United Arab Emirates',
        countryNameAr: 'الإمارات العربية المتحدة',
        restrictionLevel: 'none',
        allowedOperations: ['all'],
        blockedOperations: [],
        requiresApproval: ['military'],
        sectorModes: ['civilian', 'government', 'security'],
        specialConditions: [],
        specialConditionsAr: [],
        enabled: true
      },
      {
        name: 'Egypt',
        nameAr: 'مصر',
        countryCode: 'EG',
        countryName: 'Egypt',
        countryNameAr: 'مصر',
        restrictionLevel: 'none',
        allowedOperations: ['all'],
        blockedOperations: [],
        requiresApproval: ['military', 'government'],
        sectorModes: ['civilian', 'government', 'military', 'security'],
        specialConditions: [],
        specialConditionsAr: [],
        enabled: true
      }
    ];

    restrictions.forEach((restriction, index) => {
      const id = `geo-${restriction.countryCode.toLowerCase()}`;
      this.geoRestrictions.set(id, {
        ...restriction,
        id,
        createdAt: new Date().toISOString()
      });
    });
  }

  checkCompliance(
    tenantId: string,
    operation: string,
    sourceCountry: string,
    targetCountry: string | undefined,
    dataTypes: string[],
    sectorMode: SectorMode,
    checkedBy: string
  ): ComplianceCheck {
    const id = `check-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const violations: ComplianceViolation[] = [];
    const conditions: string[] = [];
    const conditionsAr: string[] = [];

    const sourceRestriction = Array.from(this.geoRestrictions.values())
      .find(r => r.countryCode === sourceCountry);
    
    if (sourceRestriction) {
      if (sourceRestriction.restrictionLevel === 'prohibited') {
        violations.push({
          code: 'GEO_PROHIBITED',
          framework: 'GOVERNMENT',
          severity: 'critical',
          message: `Operations from ${sourceCountry} are prohibited`,
          messageAr: `العمليات من ${sourceRestriction.countryNameAr} محظورة`,
          remediation: 'Request special authorization',
          remediationAr: 'اطلب تصريح خاص'
        });
      }

      if (!sourceRestriction.sectorModes.includes(sectorMode)) {
        violations.push({
          code: 'SECTOR_NOT_ALLOWED',
          framework: 'GOVERNMENT',
          severity: 'high',
          message: `Sector mode ${sectorMode} not allowed in ${sourceCountry}`,
          messageAr: `الوضع ${sectorMode} غير مسموح في ${sourceRestriction.countryNameAr}`,
          remediation: 'Change sector mode or request authorization',
          remediationAr: 'غير الوضع أو اطلب تصريح'
        });
      }

      if (sourceRestriction.requiresApproval.includes(sectorMode)) {
        conditions.push(`Requires approval for ${sectorMode} operations`);
        conditionsAr.push(`يتطلب موافقة لعمليات ${sectorMode}`);
      }
    }

    if (targetCountry && targetCountry !== sourceCountry) {
      for (const policy of this.residencyPolicies.values()) {
        if (!policy.enabled) continue;
        
        const hasMatchingDataType = dataTypes.some(dt => policy.dataTypes.includes(dt));
        if (!hasMatchingDataType) continue;

        if (policy.localStorageOnly) {
          violations.push({
            code: 'LOCAL_STORAGE_ONLY',
            framework: policy.frameworks[0] || 'ISO27001',
            severity: 'high',
            message: `Data type requires local storage only - cross-border transfer prohibited`,
            messageAr: 'نوع البيانات يتطلب التخزين المحلي فقط - نقل البيانات عبر الحدود محظور',
            remediation: 'Store data in source country only',
            remediationAr: 'قم بتخزين البيانات في بلد المصدر فقط'
          });
        } else if (!policy.crossBorderTransferAllowed) {
          violations.push({
            code: 'CROSS_BORDER_PROHIBITED',
            framework: policy.frameworks[0] || 'ISO27001',
            severity: 'high',
            message: `Cross-border data transfer not allowed for this policy`,
            messageAr: 'نقل البيانات عبر الحدود غير مسموح لهذه السياسة',
            remediation: 'Keep data within region',
            remediationAr: 'احتفظ بالبيانات داخل المنطقة'
          });
        } else if (policy.crossBorderConditions) {
          conditions.push(...policy.crossBorderConditions);
          conditionsAr.push(...policy.crossBorderConditions.map(c => `شرط: ${c}`));
        }

        if (policy.blockedCountries.includes(targetCountry)) {
          violations.push({
            code: 'BLOCKED_DESTINATION',
            framework: policy.frameworks[0] || 'ISO27001',
            severity: 'critical',
            message: `Transfer to ${targetCountry} is blocked`,
            messageAr: `النقل إلى ${targetCountry} محظور`,
            remediation: 'Choose different destination',
            remediationAr: 'اختر وجهة مختلفة'
          });
        }
      }
    }

    const sectorConfig = this.sectorModes.get(`sector-${sectorMode}`);
    if (sectorConfig) {
      if (sectorConfig.securityLevel === 'top-secret' || sectorConfig.securityLevel === 'critical') {
        conditions.push(`Requires ${sectorConfig.encryptionStandard} encryption`);
        conditionsAr.push(`يتطلب تشفير ${sectorConfig.encryptionStandard}`);
        
        conditions.push(...sectorConfig.additionalRestrictions);
        conditionsAr.push(...sectorConfig.additionalRestrictions.map(r => `قيد: ${r}`));
      }
    }

    let result: ComplianceCheck['result'];
    const criticalViolations = violations.filter(v => v.severity === 'critical').length;
    const highViolations = violations.filter(v => v.severity === 'high').length;

    if (criticalViolations > 0) {
      result = 'denied';
    } else if (highViolations > 0 || conditions.length > 0) {
      result = conditions.length > 0 && highViolations === 0 ? 'conditional' : 'pending-approval';
    } else {
      result = 'allowed';
    }

    const check: ComplianceCheck = {
      id,
      tenantId,
      operation,
      sourceCountry,
      targetCountry,
      dataTypes,
      sectorMode,
      result,
      violations,
      conditions,
      conditionsAr,
      checkedAt: new Date().toISOString(),
      checkedBy
    };

    this.complianceChecks.set(id, check);
    this.logAudit(tenantId, 'compliance_check', 'فحص الامتثال', checkedBy, checkedBy, operation, id, result === 'allowed' ? 'success' : result === 'denied' ? 'blocked' : 'success', { violations: violations.length });

    console.log(`[SovereignCompliance] Check ${id}: ${result} | Violations: ${violations.length}`);
    return check;
  }

  private logAudit(
    tenantId: string,
    action: string,
    actionAr: string,
    actor: string,
    actorEmail: string,
    targetResource: string,
    complianceCheckId: string | undefined,
    result: ComplianceAuditLog['result'],
    details: Record<string, any>
  ): void {
    const id = `audit-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const log: ComplianceAuditLog = {
      id,
      tenantId,
      action,
      actionAr,
      actor,
      actorEmail,
      targetResource,
      complianceCheckId,
      result,
      details,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.set(id, log);
  }

  getResidencyPolicies(): DataResidencyPolicy[] {
    return Array.from(this.residencyPolicies.values());
  }

  getGeoRestrictions(): GeoRestriction[] {
    return Array.from(this.geoRestrictions.values());
  }

  getSectorModes(): SectorModeConfig[] {
    return Array.from(this.sectorModes.values());
  }

  getComplianceChecks(tenantId?: string): ComplianceCheck[] {
    const checks = Array.from(this.complianceChecks.values());
    if (tenantId) {
      return checks.filter(c => c.tenantId === tenantId);
    }
    return checks.sort((a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime());
  }

  getAuditLogs(tenantId?: string): ComplianceAuditLog[] {
    const logs = Array.from(this.auditLogs.values());
    if (tenantId) {
      return logs.filter(l => l.tenantId === tenantId);
    }
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getStats(): ComplianceStats {
    const policies = Array.from(this.residencyPolicies.values());
    const checks = Array.from(this.complianceChecks.values());

    const violationsBySeverity: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
    const checksByFramework: Record<string, number> = {};
    const checksBySector: Record<string, number> = {};

    for (const check of checks) {
      checksBySector[check.sectorMode] = (checksBySector[check.sectorMode] || 0) + 1;
      
      for (const violation of check.violations) {
        violationsBySeverity[violation.severity]++;
        checksByFramework[violation.framework] = (checksByFramework[violation.framework] || 0) + 1;
      }
    }

    return {
      totalPolicies: policies.length,
      activePolicies: policies.filter(p => p.enabled).length,
      totalChecks: checks.length,
      checksAllowed: checks.filter(c => c.result === 'allowed').length,
      checksDenied: checks.filter(c => c.result === 'denied').length,
      checksPending: checks.filter(c => c.result === 'pending-approval' || c.result === 'conditional').length,
      violationsBySeverity,
      checksByFramework,
      checksBySector
    };
  }

  createResidencyPolicy(policy: Omit<DataResidencyPolicy, 'id' | 'createdAt' | 'updatedAt'>): DataResidencyPolicy {
    const id = `residency-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const newPolicy: DataResidencyPolicy = {
      ...policy,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.residencyPolicies.set(id, newPolicy);
    console.log(`[SovereignCompliance] Created residency policy: ${policy.name}`);
    return newPolicy;
  }

  createGeoRestriction(restriction: Omit<GeoRestriction, 'id' | 'createdAt'>): GeoRestriction {
    const id = `geo-${restriction.countryCode.toLowerCase()}-${Date.now()}`;
    const newRestriction: GeoRestriction = {
      ...restriction,
      id,
      createdAt: new Date().toISOString()
    };
    this.geoRestrictions.set(id, newRestriction);
    console.log(`[SovereignCompliance] Created geo restriction: ${restriction.countryName}`);
    return newRestriction;
  }

  updateResidencyPolicy(id: string, updates: Partial<DataResidencyPolicy>): DataResidencyPolicy | null {
    const policy = this.residencyPolicies.get(id);
    if (!policy) return null;
    
    const updated = { ...policy, ...updates, updatedAt: new Date().toISOString() };
    this.residencyPolicies.set(id, updated);
    return updated;
  }

  updateSectorMode(id: string, updates: Partial<SectorModeConfig>): SectorModeConfig | null {
    const mode = this.sectorModes.get(id);
    if (!mode) return null;
    
    const updated = { ...mode, ...updates };
    this.sectorModes.set(id, updated);
    return updated;
  }
}

export const sovereignComplianceEngine = new SovereignComplianceEngine();
