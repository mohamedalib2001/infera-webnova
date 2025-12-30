/**
 * Blueprint Parser - محلل المخططات البنائية
 * 
 * Parses natural language requirements and structured inputs into
 * a standardized Blueprint specification that can be compiled into
 * a complete digital platform.
 */

import Anthropic from '@anthropic-ai/sdk';
import {
  Blueprint,
  BlueprintSector,
  RequirementsSpec,
  DataModelSpec,
  BackendSpec,
  FrontendSpec,
  AuthSpec,
  InfrastructureSpec,
  ComplianceSpec,
  EntityDefinition,
  FieldDefinition,
  EndpointDefinition,
  PageDefinition,
  RoleDefinition,
  FunctionalRequirement,
  UserStory,
  IntegrationSpec
} from './types';

const anthropic = new Anthropic();

export class BlueprintParser {
  
  /**
   * Parse natural language requirements into a Blueprint
   */
  async parseFromNaturalLanguage(
    input: string,
    sector?: BlueprintSector,
    locale: string = 'ar'
  ): Promise<Blueprint> {
    console.log('[BlueprintParser] Parsing natural language input...');
    
    const blueprintId = `bp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Step 1: Extract requirements and domain context
    const requirements = await this.extractRequirements(input, locale);
    
    // Step 2: Generate data model from requirements
    const dataModel = await this.generateDataModel(requirements, sector);
    
    // Step 3: Generate backend specification
    const backend = await this.generateBackendSpec(dataModel, requirements);
    
    // Step 4: Generate frontend specification
    const frontend = await this.generateFrontendSpec(dataModel, requirements, locale);
    
    // Step 5: Generate auth specification
    const auth = await this.generateAuthSpec(requirements, sector);
    
    // Step 6: Detect required integrations
    const integrations = await this.detectIntegrations(requirements);
    
    // Step 7: Generate infrastructure specification
    const infrastructure = this.generateInfrastructureSpec(sector);
    
    // Step 8: Generate compliance specification
    const compliance = this.generateComplianceSpec(sector);
    
    const blueprint: Blueprint = {
      id: blueprintId,
      version: '1.0.0',
      name: requirements.domain.industry || 'New Platform',
      nameAr: requirements.domain.industry || 'منصة جديدة',
      description: input.substring(0, 200),
      descriptionAr: input.substring(0, 200),
      sector: sector || this.detectSector(requirements),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'validated',
      requirements,
      dataModel,
      backend,
      frontend,
      auth,
      integrations,
      infrastructure,
      compliance
    };
    
    console.log(`[BlueprintParser] Blueprint ${blueprintId} created with ${dataModel.entities.length} entities`);
    
    return blueprint;
  }
  
  /**
   * Extract structured requirements from natural language
   */
  private async extractRequirements(input: string, locale: string): Promise<RequirementsSpec> {
    const prompt = `You are a requirements analyst for a digital platform factory. Analyze the following requirements and extract structured information.

Input (${locale === 'ar' ? 'Arabic' : 'English'}):
${input}

Extract and return a JSON object with:
1. functional: Array of functional requirements with id, title, titleAr, description, priority, category, acceptanceCriteria
2. nonFunctional: Array of non-functional requirements (performance, security, scalability)
3. userStories: Array of user stories with role, action, benefit
4. domain: Object with industry, targetUsers (array), locale (array), currencies (optional), timezone (optional)

Return ONLY valid JSON, no markdown or explanation.`;

    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      });
      
      const content = response.content[0];
      if (content.type === 'text') {
        const parsed = JSON.parse(content.text);
        return {
          rawInput: input,
          rawInputAr: locale === 'ar' ? input : undefined,
          functional: parsed.functional || [],
          nonFunctional: parsed.nonFunctional || [],
          userStories: parsed.userStories || [],
          domain: parsed.domain || { industry: 'General', targetUsers: ['users'], locale: [locale] }
        };
      }
    } catch (error) {
      console.error('[BlueprintParser] Error extracting requirements:', error);
    }
    
    // Fallback
    return {
      rawInput: input,
      functional: [],
      nonFunctional: [],
      userStories: [],
      domain: { industry: 'General', targetUsers: ['users'], locale: [locale] }
    };
  }
  
  /**
   * Generate data model from requirements
   */
  private async generateDataModel(
    requirements: RequirementsSpec,
    sector?: BlueprintSector
  ): Promise<DataModelSpec> {
    const prompt = `You are a database architect. Based on the following requirements, design a PostgreSQL data model.

Requirements:
${JSON.stringify(requirements, null, 2)}

Sector: ${sector || 'general'}

Design entities with proper relationships. For each entity include:
- name (PascalCase, English)
- nameAr (Arabic name)
- tableName (snake_case)
- description
- fields: Array of field definitions with name, nameAr, type (string|text|integer|bigint|decimal|boolean|date|datetime|timestamp|json|jsonb|uuid|enum|array), nullable, unique, indexed, defaultValue, validation rules
- timestamps: boolean
- softDelete: boolean
- tenantIsolated: boolean

Include relationships (one-to-one, one-to-many, many-to-many) and enums.

Return ONLY valid JSON with: { entities: [], relationships: [], enums: [], indexes: [] }`;

    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 6000,
        messages: [{ role: 'user', content: prompt }]
      });
      
      const content = response.content[0];
      if (content.type === 'text') {
        const parsed = JSON.parse(content.text);
        return {
          entities: parsed.entities || [],
          relationships: parsed.relationships || [],
          enums: parsed.enums || [],
          indexes: parsed.indexes || []
        };
      }
    } catch (error) {
      console.error('[BlueprintParser] Error generating data model:', error);
    }
    
    // Return minimal model
    return {
      entities: this.getDefaultEntities(sector),
      relationships: [],
      enums: [],
      indexes: []
    };
  }
  
  /**
   * Generate backend specification
   */
  private async generateBackendSpec(
    dataModel: DataModelSpec,
    requirements: RequirementsSpec
  ): Promise<BackendSpec> {
    const endpoints: EndpointDefinition[] = [];
    
    // Generate CRUD endpoints for each entity
    for (const entity of dataModel.entities) {
      const basePath = `/${entity.tableName}`;
      
      endpoints.push({
        method: 'GET',
        path: basePath,
        handler: `${entity.name}Controller.list`,
        description: `List all ${entity.name} records`,
        descriptionAr: `عرض جميع سجلات ${entity.nameAr}`,
        authentication: true,
        authorization: [`read:${entity.tableName}`],
        responseBody: { type: 'entity', name: entity.name, array: true }
      });
      
      endpoints.push({
        method: 'GET',
        path: `${basePath}/:id`,
        handler: `${entity.name}Controller.get`,
        description: `Get ${entity.name} by ID`,
        descriptionAr: `الحصول على ${entity.nameAr} بالمعرف`,
        authentication: true,
        authorization: [`read:${entity.tableName}`],
        pathParams: [{ name: 'id', type: 'string', required: true, description: 'Record ID' }],
        responseBody: { type: 'entity', name: entity.name }
      });
      
      endpoints.push({
        method: 'POST',
        path: basePath,
        handler: `${entity.name}Controller.create`,
        description: `Create new ${entity.name}`,
        descriptionAr: `إنشاء ${entity.nameAr} جديد`,
        authentication: true,
        authorization: [`create:${entity.tableName}`],
        requestBody: { type: 'entity', name: entity.name, omit: ['id', 'createdAt', 'updatedAt'] },
        responseBody: { type: 'entity', name: entity.name }
      });
      
      endpoints.push({
        method: 'PUT',
        path: `${basePath}/:id`,
        handler: `${entity.name}Controller.update`,
        description: `Update ${entity.name}`,
        descriptionAr: `تحديث ${entity.nameAr}`,
        authentication: true,
        authorization: [`update:${entity.tableName}`],
        pathParams: [{ name: 'id', type: 'string', required: true, description: 'Record ID' }],
        requestBody: { type: 'entity', name: entity.name, partial: true },
        responseBody: { type: 'entity', name: entity.name }
      });
      
      endpoints.push({
        method: 'DELETE',
        path: `${basePath}/:id`,
        handler: `${entity.name}Controller.delete`,
        description: `Delete ${entity.name}`,
        descriptionAr: `حذف ${entity.nameAr}`,
        authentication: true,
        authorization: [`delete:${entity.tableName}`],
        pathParams: [{ name: 'id', type: 'string', required: true, description: 'Record ID' }]
      });
    }
    
    return {
      framework: 'express',
      api: {
        prefix: '/api',
        version: 'v1',
        authentication: 'session',
        rateLimit: {
          windowMs: 60000,
          maxRequests: 100
        },
        endpoints
      },
      services: dataModel.entities.map(e => ({
        name: `${e.name}Service`,
        description: `Service for ${e.name} operations`,
        methods: [
          { name: 'findAll', description: 'Find all records', params: [], returnType: `${e.name}[]`, async: true },
          { name: 'findById', description: 'Find by ID', params: [{ name: 'id', type: 'string', required: true, description: 'Record ID' }], returnType: `${e.name} | null`, async: true },
          { name: 'create', description: 'Create record', params: [{ name: 'data', type: `Insert${e.name}`, required: true, description: 'Record data' }], returnType: e.name, async: true },
          { name: 'update', description: 'Update record', params: [{ name: 'id', type: 'string', required: true, description: 'Record ID' }, { name: 'data', type: `Partial<Insert${e.name}>`, required: true, description: 'Update data' }], returnType: `${e.name} | null`, async: true },
          { name: 'delete', description: 'Delete record', params: [{ name: 'id', type: 'string', required: true, description: 'Record ID' }], returnType: 'boolean', async: true }
        ],
        dependencies: []
      })),
      jobs: [],
      events: []
    };
  }
  
  /**
   * Generate frontend specification
   */
  private async generateFrontendSpec(
    dataModel: DataModelSpec,
    requirements: RequirementsSpec,
    locale: string
  ): Promise<FrontendSpec> {
    const pages: PageDefinition[] = [];
    
    // Dashboard page
    pages.push({
      name: 'Dashboard',
      path: '/',
      layout: 'MainLayout',
      components: ['StatCards', 'RecentActivity', 'QuickActions'],
      dataQueries: [],
      meta: {
        title: 'Dashboard',
        titleAr: 'لوحة التحكم',
        description: 'Overview of platform activity'
      }
    });
    
    // Generate pages for each entity
    for (const entity of dataModel.entities) {
      const pathBase = entity.tableName.replace(/_/g, '-');
      
      // List page
      pages.push({
        name: `${entity.name}List`,
        path: `/${pathBase}`,
        layout: 'MainLayout',
        components: [`${entity.name}Table`, `${entity.name}Filters`, 'Pagination'],
        dataQueries: [{
          name: `${entity.name.toLowerCase()}List`,
          endpoint: `/api/${entity.tableName}`,
          method: 'GET'
        }],
        meta: {
          title: entity.name,
          titleAr: entity.nameAr,
          description: `Manage ${entity.name} records`
        }
      });
      
      // Create/Edit page
      pages.push({
        name: `${entity.name}Form`,
        path: `/${pathBase}/:id?`,
        layout: 'MainLayout',
        components: [`${entity.name}Form`],
        dataQueries: [{
          name: `${entity.name.toLowerCase()}Detail`,
          endpoint: `/api/${entity.tableName}/:id`,
          method: 'GET'
        }],
        meta: {
          title: `Edit ${entity.name}`,
          titleAr: `تعديل ${entity.nameAr}`,
          description: `Create or edit ${entity.name}`
        }
      });
    }
    
    // Settings page
    pages.push({
      name: 'Settings',
      path: '/settings',
      layout: 'MainLayout',
      components: ['ProfileSettings', 'NotificationSettings', 'SecuritySettings'],
      dataQueries: [],
      guards: ['authenticated'],
      meta: {
        title: 'Settings',
        titleAr: 'الإعدادات',
        description: 'Platform settings'
      }
    });
    
    return {
      framework: 'react',
      styling: 'tailwind',
      components: [],
      pages,
      layouts: [
        {
          name: 'MainLayout',
          regions: ['sidebar', 'header', 'main', 'footer'],
          responsive: true
        },
        {
          name: 'AuthLayout',
          regions: ['main'],
          responsive: true
        }
      ],
      navigation: {
        type: 'sidebar',
        items: [
          { label: 'Dashboard', labelAr: 'لوحة التحكم', icon: 'LayoutDashboard', path: '/' },
          ...dataModel.entities.map(e => ({
            label: e.name,
            labelAr: e.nameAr,
            icon: 'Database',
            path: `/${e.tableName.replace(/_/g, '-')}`
          })),
          { label: 'Settings', labelAr: 'الإعدادات', icon: 'Settings', path: '/settings' }
        ]
      },
      theme: {
        darkMode: true,
        primaryColor: '#3B82F6',
        accentColor: '#8B5CF6',
        fonts: {
          latin: 'Inter',
          arabic: 'IBM Plex Sans Arabic'
        },
        rtlSupport: locale === 'ar'
      }
    };
  }
  
  /**
   * Generate authentication specification
   */
  private async generateAuthSpec(
    requirements: RequirementsSpec,
    sector?: BlueprintSector
  ): Promise<AuthSpec> {
    const roles: RoleDefinition[] = [
      {
        name: 'admin',
        nameAr: 'مدير النظام',
        description: 'Full system access',
        permissions: ['*']
      },
      {
        name: 'manager',
        nameAr: 'مدير',
        description: 'Management access',
        permissions: ['read:*', 'create:*', 'update:*']
      },
      {
        name: 'user',
        nameAr: 'مستخدم',
        description: 'Standard user access',
        permissions: ['read:own', 'create:own', 'update:own']
      }
    ];
    
    // Add sector-specific roles
    if (sector === 'healthcare') {
      roles.push(
        { name: 'doctor', nameAr: 'طبيب', description: 'Healthcare provider', permissions: ['read:patients', 'create:appointments', 'update:medical_records'] },
        { name: 'nurse', nameAr: 'ممرض', description: 'Nursing staff', permissions: ['read:patients', 'read:appointments'] },
        { name: 'patient', nameAr: 'مريض', description: 'Patient access', permissions: ['read:own', 'create:appointments'] }
      );
    } else if (sector === 'financial') {
      roles.push(
        { name: 'accountant', nameAr: 'محاسب', description: 'Financial operations', permissions: ['read:transactions', 'create:transactions', 'read:reports'] },
        { name: 'auditor', nameAr: 'مدقق', description: 'Audit access', permissions: ['read:*', 'read:audit_logs'] }
      );
    } else if (sector === 'education') {
      roles.push(
        { name: 'teacher', nameAr: 'معلم', description: 'Teaching staff', permissions: ['read:students', 'create:assignments', 'update:grades'] },
        { name: 'student', nameAr: 'طالب', description: 'Student access', permissions: ['read:own', 'create:submissions'] }
      );
    }
    
    return {
      type: 'session',
      providers: [
        { type: 'local', enabled: true },
        { type: 'google', enabled: false },
        { type: 'github', enabled: false }
      ],
      mfa: sector === 'financial' || sector === 'healthcare' || sector === 'government',
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: sector === 'financial' || sector === 'government',
        maxAge: sector === 'government' ? 90 : undefined
      },
      roles,
      permissions: []
    };
  }
  
  /**
   * Detect required integrations
   */
  private async detectIntegrations(requirements: RequirementsSpec): Promise<IntegrationSpec[]> {
    const integrations: IntegrationSpec[] = [];
    const rawInput = (requirements.rawInput || '').toLowerCase();
    
    // Payment detection
    if (rawInput.includes('payment') || rawInput.includes('دفع') || rawInput.includes('شراء') || rawInput.includes('اشتراك')) {
      integrations.push({
        id: 'stripe',
        name: 'Stripe Payments',
        type: 'payment',
        config: { currency: 'USD' },
        secrets: ['STRIPE_SECRET_KEY', 'STRIPE_PUBLISHABLE_KEY', 'STRIPE_WEBHOOK_SECRET']
      });
    }
    
    // Email detection
    if (rawInput.includes('email') || rawInput.includes('بريد') || rawInput.includes('إشعار') || rawInput.includes('notification')) {
      integrations.push({
        id: 'sendgrid',
        name: 'SendGrid Email',
        type: 'email',
        config: {},
        secrets: ['SENDGRID_API_KEY']
      });
    }
    
    // AI detection
    if (rawInput.includes('ai') || rawInput.includes('ذكاء') || rawInput.includes('chatbot') || rawInput.includes('assistant')) {
      integrations.push({
        id: 'anthropic',
        name: 'Anthropic Claude',
        type: 'ai',
        config: { model: 'claude-sonnet-4-20250514' },
        secrets: ['ANTHROPIC_API_KEY']
      });
    }
    
    // Storage detection
    if (rawInput.includes('upload') || rawInput.includes('رفع') || rawInput.includes('file') || rawInput.includes('ملف') || rawInput.includes('image') || rawInput.includes('صور')) {
      integrations.push({
        id: 'object-storage',
        name: 'Object Storage',
        type: 'storage',
        config: {},
        secrets: []
      });
    }
    
    return integrations;
  }
  
  /**
   * Generate infrastructure specification
   */
  private generateInfrastructureSpec(sector?: BlueprintSector): InfrastructureSpec {
    // Default to Hetzner for cost efficiency
    return {
      provider: 'hetzner',
      region: 'fsn1',
      compute: {
        type: 'cx21',
        count: 1,
        cpu: 2,
        memory: 4,
        disk: 40
      },
      database: {
        type: 'postgresql',
        version: '15',
        size: 'small',
        replicas: 0,
        backups: {
          enabled: true,
          retention: 7
        }
      },
      storage: {
        type: 'object',
        size: 10,
        tier: 'standard'
      },
      networking: {
        vpc: true,
        loadBalancer: false,
        cdn: false,
        ssl: true
      },
      scaling: {
        auto: false,
        minInstances: 1,
        maxInstances: 3,
        cpuThreshold: 80,
        memoryThreshold: 80
      }
    };
  }
  
  /**
   * Generate compliance specification
   */
  private generateComplianceSpec(sector?: BlueprintSector): ComplianceSpec {
    const frameworks: ('gdpr' | 'hipaa' | 'pci-dss' | 'soc2' | 'iso27001' | 'nca-ecc' | 'pdpl')[] = [];
    
    if (sector === 'healthcare') {
      frameworks.push('hipaa', 'gdpr');
    } else if (sector === 'financial') {
      frameworks.push('pci-dss', 'soc2', 'gdpr');
    } else if (sector === 'government') {
      frameworks.push('iso27001', 'nca-ecc');
    } else {
      frameworks.push('gdpr');
    }
    
    return {
      frameworks,
      dataResidency: ['EU', 'ME'],
      encryption: {
        atRest: true,
        inTransit: true,
        algorithm: 'AES-256-GCM',
        keyManagement: sector === 'financial' || sector === 'government' ? 'hsm' : 'managed'
      },
      audit: {
        enabled: true,
        events: ['login', 'logout', 'create', 'update', 'delete', 'export'],
        retention: sector === 'financial' ? 365 * 7 : 365,
        immutable: sector === 'financial' || sector === 'government'
      },
      retention: {
        defaultDays: 365,
        policies: []
      }
    };
  }
  
  /**
   * Detect sector from requirements
   */
  private detectSector(requirements: RequirementsSpec): BlueprintSector {
    const input = (requirements.rawInput || '').toLowerCase();
    
    if (input.includes('hospital') || input.includes('مستشفى') || input.includes('clinic') || input.includes('عيادة') || input.includes('patient') || input.includes('مريض')) {
      return 'healthcare';
    }
    if (input.includes('bank') || input.includes('بنك') || input.includes('financial') || input.includes('مالي') || input.includes('payment') || input.includes('دفع')) {
      return 'financial';
    }
    if (input.includes('government') || input.includes('حكوم') || input.includes('ministry') || input.includes('وزارة')) {
      return 'government';
    }
    if (input.includes('school') || input.includes('مدرسة') || input.includes('university') || input.includes('جامعة') || input.includes('student') || input.includes('طالب')) {
      return 'education';
    }
    if (input.includes('shop') || input.includes('متجر') || input.includes('ecommerce') || input.includes('product') || input.includes('منتج')) {
      return 'ecommerce';
    }
    
    return 'enterprise';
  }
  
  /**
   * Get default entities for a sector
   */
  private getDefaultEntities(sector?: BlueprintSector): EntityDefinition[] {
    const baseEntities: EntityDefinition[] = [
      {
        name: 'User',
        nameAr: 'مستخدم',
        tableName: 'users',
        description: 'System users',
        fields: [
          { name: 'id', nameAr: 'المعرف', type: 'uuid', nullable: false, unique: true, indexed: true },
          { name: 'email', nameAr: 'البريد الإلكتروني', type: 'string', nullable: false, unique: true, indexed: true },
          { name: 'name', nameAr: 'الاسم', type: 'string', nullable: false, unique: false, indexed: false },
          { name: 'role', nameAr: 'الدور', type: 'string', nullable: false, unique: false, indexed: true },
          { name: 'status', nameAr: 'الحالة', type: 'string', nullable: false, unique: false, indexed: true, defaultValue: 'active' }
        ],
        timestamps: true,
        softDelete: true,
        tenantIsolated: true
      }
    ];
    
    return baseEntities;
  }
}

export const blueprintParser = new BlueprintParser();
