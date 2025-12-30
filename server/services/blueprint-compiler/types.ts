/**
 * Blueprint Compiler Types - أنواع مترجم المخططات البنائية
 * 
 * Core type definitions for the Blueprint Compiler system that transforms
 * requirements into complete, deployable digital platforms.
 */

// ============ Blueprint Core Types ============

export interface Blueprint {
  id: string;
  version: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  sector: BlueprintSector;
  createdAt: Date;
  updatedAt: Date;
  status: BlueprintStatus;
  
  // Core specifications
  requirements: RequirementsSpec;
  dataModel: DataModelSpec;
  backend: BackendSpec;
  frontend: FrontendSpec;
  auth: AuthSpec;
  integrations: IntegrationSpec[];
  infrastructure: InfrastructureSpec;
  compliance: ComplianceSpec;
  
  // Generated artifacts
  artifacts?: BlueprintArtifacts;
  
  // Build state
  buildState?: BuildState;
}

export type BlueprintSector = 
  | 'financial'
  | 'healthcare'
  | 'government'
  | 'education'
  | 'enterprise'
  | 'ecommerce'
  | 'social'
  | 'custom';

export type BlueprintStatus = 
  | 'draft'
  | 'parsing'
  | 'validated'
  | 'generating'
  | 'generated'
  | 'deploying'
  | 'deployed'
  | 'failed';

// ============ Requirements Specification ============

export interface RequirementsSpec {
  // Natural language input
  rawInput?: string;
  rawInputAr?: string;
  
  // Structured requirements
  functional: FunctionalRequirement[];
  nonFunctional: NonFunctionalRequirement[];
  
  // User stories
  userStories: UserStory[];
  
  // Domain context
  domain: DomainContext;
}

export interface FunctionalRequirement {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  acceptanceCriteria: string[];
}

export interface NonFunctionalRequirement {
  id: string;
  type: 'performance' | 'security' | 'scalability' | 'availability' | 'compliance';
  description: string;
  metric?: string;
  target?: string;
}

export interface UserStory {
  id: string;
  role: string;
  action: string;
  benefit: string;
  acceptanceCriteria: string[];
}

export interface DomainContext {
  industry: string;
  targetUsers: string[];
  locale: string[];
  currencies?: string[];
  timezone?: string;
}

// ============ Data Model Specification ============

export interface DataModelSpec {
  entities: EntityDefinition[];
  relationships: RelationshipDefinition[];
  enums: EnumDefinition[];
  indexes: IndexDefinition[];
}

export interface EntityDefinition {
  name: string;
  nameAr: string;
  tableName: string;
  description: string;
  fields: FieldDefinition[];
  timestamps: boolean;
  softDelete: boolean;
  tenantIsolated: boolean;
}

export interface FieldDefinition {
  name: string;
  nameAr: string;
  type: FieldType;
  nullable: boolean;
  unique: boolean;
  indexed: boolean;
  defaultValue?: any;
  validation?: ValidationRule[];
  references?: {
    entity: string;
    field: string;
    onDelete: 'cascade' | 'restrict' | 'set null';
  };
}

export type FieldType = 
  | 'string'
  | 'text'
  | 'integer'
  | 'bigint'
  | 'decimal'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'timestamp'
  | 'json'
  | 'jsonb'
  | 'uuid'
  | 'enum'
  | 'array';

export interface ValidationRule {
  type: 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'url' | 'custom';
  value?: any;
  message: string;
  messageAr: string;
}

export interface RelationshipDefinition {
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  from: { entity: string; field: string };
  to: { entity: string; field: string };
  throughTable?: string;
}

export interface EnumDefinition {
  name: string;
  values: { value: string; label: string; labelAr: string }[];
}

export interface IndexDefinition {
  name: string;
  entity: string;
  fields: string[];
  unique: boolean;
}

// ============ Backend Specification ============

export interface BackendSpec {
  framework: 'express' | 'fastify' | 'hono';
  api: APISpec;
  services: ServiceDefinition[];
  jobs: JobDefinition[];
  events: EventDefinition[];
}

export interface APISpec {
  prefix: string;
  version: string;
  authentication: 'session' | 'jwt' | 'api-key' | 'oauth2';
  rateLimit?: {
    windowMs: number;
    maxRequests: number;
  };
  endpoints: EndpointDefinition[];
}

export interface EndpointDefinition {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  handler: string;
  description: string;
  descriptionAr: string;
  authentication: boolean;
  authorization?: string[];
  requestBody?: SchemaReference;
  responseBody?: SchemaReference;
  queryParams?: ParameterDefinition[];
  pathParams?: ParameterDefinition[];
}

export interface SchemaReference {
  type: 'entity' | 'custom';
  name: string;
  array?: boolean;
  partial?: boolean;
  pick?: string[];
  omit?: string[];
}

export interface ParameterDefinition {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface ServiceDefinition {
  name: string;
  description: string;
  methods: MethodDefinition[];
  dependencies: string[];
}

export interface MethodDefinition {
  name: string;
  description: string;
  params: ParameterDefinition[];
  returnType: string;
  async: boolean;
}

export interface JobDefinition {
  name: string;
  description: string;
  schedule?: string; // cron expression
  handler: string;
  retries: number;
  timeout: number;
}

export interface EventDefinition {
  name: string;
  description: string;
  payload: SchemaReference;
  handlers: string[];
}

// ============ Frontend Specification ============

export interface FrontendSpec {
  framework: 'react' | 'vue' | 'svelte';
  styling: 'tailwind' | 'css-modules' | 'styled-components';
  components: ComponentDefinition[];
  pages: PageDefinition[];
  layouts: LayoutDefinition[];
  navigation: NavigationSpec;
  theme: ThemeSpec;
}

export interface ComponentDefinition {
  name: string;
  type: 'ui' | 'form' | 'data-display' | 'layout' | 'navigation';
  props: PropDefinition[];
  slots?: string[];
  events?: string[];
  dataSource?: string;
}

export interface PropDefinition {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  description: string;
}

export interface PageDefinition {
  name: string;
  path: string;
  layout: string;
  components: string[];
  dataQueries: DataQueryDefinition[];
  guards?: string[];
  meta: {
    title: string;
    titleAr: string;
    description: string;
  };
}

export interface DataQueryDefinition {
  name: string;
  endpoint: string;
  method: 'GET' | 'POST';
  params?: Record<string, string>;
  transform?: string;
}

export interface LayoutDefinition {
  name: string;
  regions: string[];
  responsive: boolean;
}

export interface NavigationSpec {
  type: 'sidebar' | 'topbar' | 'hybrid';
  items: NavigationItem[];
}

export interface NavigationItem {
  label: string;
  labelAr: string;
  icon: string;
  path: string;
  children?: NavigationItem[];
  permission?: string;
}

export interface ThemeSpec {
  darkMode: boolean;
  primaryColor: string;
  accentColor: string;
  fonts: {
    latin: string;
    arabic: string;
  };
  rtlSupport: boolean;
}

// ============ Authentication Specification ============

export interface AuthSpec {
  type: 'session' | 'jwt' | 'oauth2';
  providers: AuthProvider[];
  mfa: boolean;
  passwordPolicy: PasswordPolicy;
  roles: RoleDefinition[];
  permissions: PermissionDefinition[];
}

export interface AuthProvider {
  type: 'local' | 'google' | 'github' | 'microsoft' | 'apple';
  enabled: boolean;
  config?: Record<string, any>;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  maxAge?: number; // days
}

export interface RoleDefinition {
  name: string;
  nameAr: string;
  description: string;
  permissions: string[];
  inherits?: string[];
}

export interface PermissionDefinition {
  name: string;
  nameAr: string;
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete' | 'manage')[];
}

// ============ Integration Specification ============

export interface IntegrationSpec {
  id: string;
  name: string;
  type: IntegrationType;
  config: Record<string, any>;
  secrets: string[];
  webhooks?: WebhookDefinition[];
}

export type IntegrationType = 
  | 'payment'
  | 'email'
  | 'sms'
  | 'storage'
  | 'analytics'
  | 'ai'
  | 'crm'
  | 'erp'
  | 'custom-api';

export interface WebhookDefinition {
  event: string;
  path: string;
  handler: string;
}

// ============ Infrastructure Specification ============

export interface InfrastructureSpec {
  provider: 'hetzner' | 'aws' | 'gcp' | 'azure' | 'digitalocean' | 'onprem';
  region: string;
  compute: ComputeSpec;
  database: DatabaseSpec;
  storage: StorageSpec;
  networking: NetworkingSpec;
  scaling: ScalingSpec;
}

export interface ComputeSpec {
  type: string;
  count: number;
  cpu: number;
  memory: number; // GB
  disk: number; // GB
}

export interface DatabaseSpec {
  type: 'postgresql' | 'mysql' | 'mongodb';
  version: string;
  size: string;
  replicas: number;
  backups: {
    enabled: boolean;
    retention: number; // days
  };
}

export interface StorageSpec {
  type: 'object' | 'block' | 'file';
  size: number; // GB
  tier: 'standard' | 'performance' | 'archive';
}

export interface NetworkingSpec {
  vpc: boolean;
  loadBalancer: boolean;
  cdn: boolean;
  ssl: boolean;
  domain?: string;
}

export interface ScalingSpec {
  auto: boolean;
  minInstances: number;
  maxInstances: number;
  cpuThreshold: number;
  memoryThreshold: number;
}

// ============ Compliance Specification ============

export interface ComplianceSpec {
  frameworks: ComplianceFramework[];
  dataResidency: string[];
  encryption: EncryptionSpec;
  audit: AuditSpec;
  retention: RetentionSpec;
}

export type ComplianceFramework = 
  | 'gdpr'
  | 'hipaa'
  | 'pci-dss'
  | 'soc2'
  | 'iso27001'
  | 'nca-ecc'
  | 'pdpl';

export interface EncryptionSpec {
  atRest: boolean;
  inTransit: boolean;
  algorithm: string;
  keyManagement: 'managed' | 'byok' | 'hsm';
}

export interface AuditSpec {
  enabled: boolean;
  events: string[];
  retention: number; // days
  immutable: boolean;
}

export interface RetentionSpec {
  defaultDays: number;
  policies: {
    dataType: string;
    days: number;
  }[];
}

// ============ Generated Artifacts ============

export interface BlueprintArtifacts {
  schema: GeneratedFile[];
  backend: GeneratedFile[];
  frontend: GeneratedFile[];
  infrastructure: GeneratedFile[];
  tests: GeneratedFile[];
  documentation: GeneratedFile[];
}

export interface GeneratedFile {
  path: string;
  content: string;
  type: 'typescript' | 'javascript' | 'json' | 'yaml' | 'dockerfile' | 'markdown' | 'sql';
  checksum: string;
  generatedAt: Date;
}

// ============ Build State ============

export interface BuildState {
  stage: BuildStage;
  progress: number;
  startedAt: Date;
  completedAt?: Date;
  logs: BuildLog[];
  errors: BuildError[];
  deploymentId?: string;
}

export type BuildStage = 
  | 'idle'
  | 'parsing'
  | 'validating'
  | 'generating-schema'
  | 'generating-backend'
  | 'generating-frontend'
  | 'generating-infra'
  | 'running-tests'
  | 'deploying'
  | 'completed'
  | 'failed';

export interface BuildLog {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  stage: BuildStage;
  message: string;
  messageAr?: string;
}

export interface BuildError {
  code: string;
  message: string;
  messageAr: string;
  file?: string;
  line?: number;
  suggestion?: string;
}

// ============ Blueprint Templates ============

export interface BlueprintTemplate {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  sector: BlueprintSector;
  thumbnail?: string;
  blueprint: Partial<Blueprint>;
  popularity: number;
}
