import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

interface IntegrationDetection {
  id: string;
  name: string;
  nameAr: string;
  category: "payment" | "auth" | "communication" | "storage" | "analytics" | "crm" | "erp" | "ai" | "custom";
  provider: string;
  confidence: number;
  reason: string;
  reasonAr: string;
  requiredCredentials: string[];
  dataTypes: DataClassification[];
  securityLevel: "public" | "internal" | "confidential" | "restricted";
}

interface DataClassification {
  field: string;
  type: "pii" | "financial" | "health" | "auth" | "public" | "internal";
  sensitivity: "low" | "medium" | "high" | "critical";
  encryption: "none" | "transit" | "rest" | "both";
  retention: string;
}

interface GeneratedAPI {
  id: string;
  integrationId: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  endpoint: string;
  description: string;
  descriptionAr: string;
  requestSchema: any;
  responseSchema: any;
  authentication: AuthConfig;
  rateLimit: RateLimitConfig;
  validation: ValidationRule[];
  securityHeaders: Record<string, string>;
}

interface AuthConfig {
  type: "none" | "api_key" | "bearer" | "oauth2" | "hmac" | "mtls";
  location?: "header" | "query" | "body";
  keyName?: string;
  scopes?: string[];
}

interface RateLimitConfig {
  requests: number;
  window: string;
  burst?: number;
}

interface ValidationRule {
  field: string;
  type: string;
  required: boolean;
  pattern?: string;
  min?: number;
  max?: number;
  sanitize: boolean;
}

interface SecurityPolicy {
  integrationId: string;
  dataClassifications: DataClassification[];
  accessControl: AccessControl;
  encryption: EncryptionPolicy;
  audit: AuditPolicy;
  compliance: string[];
}

interface AccessControl {
  requiredRoles: string[];
  ipWhitelist?: string[];
  timeRestrictions?: { start: string; end: string }[];
  mfaRequired: boolean;
}

interface EncryptionPolicy {
  atRest: boolean;
  inTransit: boolean;
  algorithm: string;
  keyRotation: string;
}

interface AuditPolicy {
  logRequests: boolean;
  logResponses: boolean;
  retentionDays: number;
  alertThresholds: { metric: string; threshold: number }[];
}

const INTEGRATION_CATALOG: Record<string, Partial<IntegrationDetection>> = {
  stripe: {
    name: "Stripe",
    nameAr: "سترايب",
    category: "payment",
    provider: "Stripe Inc.",
    requiredCredentials: ["STRIPE_SECRET_KEY", "STRIPE_PUBLISHABLE_KEY", "STRIPE_WEBHOOK_SECRET"],
    securityLevel: "restricted"
  },
  paypal: {
    name: "PayPal",
    nameAr: "باي بال",
    category: "payment",
    provider: "PayPal Holdings",
    requiredCredentials: ["PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET"],
    securityLevel: "restricted"
  },
  twilio: {
    name: "Twilio",
    nameAr: "تويليو",
    category: "communication",
    provider: "Twilio Inc.",
    requiredCredentials: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN"],
    securityLevel: "confidential"
  },
  sendgrid: {
    name: "SendGrid",
    nameAr: "سيند جريد",
    category: "communication",
    provider: "Twilio Inc.",
    requiredCredentials: ["SENDGRID_API_KEY"],
    securityLevel: "internal"
  },
  firebase: {
    name: "Firebase",
    nameAr: "فايربيس",
    category: "auth",
    provider: "Google",
    requiredCredentials: ["FIREBASE_PROJECT_ID", "FIREBASE_PRIVATE_KEY"],
    securityLevel: "confidential"
  },
  aws_s3: {
    name: "AWS S3",
    nameAr: "تخزين أمازون",
    category: "storage",
    provider: "Amazon Web Services",
    requiredCredentials: ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_REGION"],
    securityLevel: "confidential"
  },
  openai: {
    name: "OpenAI",
    nameAr: "أوبن إيه آي",
    category: "ai",
    provider: "OpenAI",
    requiredCredentials: ["OPENAI_API_KEY"],
    securityLevel: "internal"
  },
  google_analytics: {
    name: "Google Analytics",
    nameAr: "تحليلات جوجل",
    category: "analytics",
    provider: "Google",
    requiredCredentials: ["GA_MEASUREMENT_ID"],
    securityLevel: "public"
  },
  salesforce: {
    name: "Salesforce",
    nameAr: "سيلز فورس",
    category: "crm",
    provider: "Salesforce Inc.",
    requiredCredentials: ["SF_CLIENT_ID", "SF_CLIENT_SECRET", "SF_USERNAME", "SF_PASSWORD"],
    securityLevel: "confidential"
  },
  sap: {
    name: "SAP",
    nameAr: "ساب",
    category: "erp",
    provider: "SAP SE",
    requiredCredentials: ["SAP_HOST", "SAP_CLIENT", "SAP_USER", "SAP_PASSWORD"],
    securityLevel: "restricted"
  }
};

const DATA_SENSITIVITY_MAP: Record<string, DataClassification> = {
  email: { field: "email", type: "pii", sensitivity: "medium", encryption: "both", retention: "account_lifetime" },
  phone: { field: "phone", type: "pii", sensitivity: "medium", encryption: "both", retention: "account_lifetime" },
  password: { field: "password", type: "auth", sensitivity: "critical", encryption: "both", retention: "never_store_plain" },
  ssn: { field: "ssn", type: "pii", sensitivity: "critical", encryption: "both", retention: "minimum_required" },
  credit_card: { field: "credit_card", type: "financial", sensitivity: "critical", encryption: "both", retention: "tokenize_only" },
  bank_account: { field: "bank_account", type: "financial", sensitivity: "critical", encryption: "both", retention: "minimum_required" },
  health_record: { field: "health_record", type: "health", sensitivity: "critical", encryption: "both", retention: "hipaa_compliant" },
  address: { field: "address", type: "pii", sensitivity: "medium", encryption: "rest", retention: "account_lifetime" },
  name: { field: "name", type: "pii", sensitivity: "low", encryption: "transit", retention: "account_lifetime" },
  ip_address: { field: "ip_address", type: "internal", sensitivity: "low", encryption: "none", retention: "30_days" }
};

class SmartIntegrationHub {
  async detectIntegrations(architecture: any): Promise<IntegrationDetection[]> {
    const prompt = `Analyze this system architecture and detect required external integrations.

Architecture:
${JSON.stringify(architecture, null, 2)}

Known integration types: ${Object.keys(INTEGRATION_CATALOG).join(", ")}

For each detected integration need, provide:
1. Which known integration matches (or "custom" if none)
2. Why it's needed based on the architecture
3. What data will flow through it
4. Confidence level (0-100)

Return JSON array:
[{
  "integrationKey": "stripe|paypal|twilio|...|custom",
  "customName": "if custom, provide name",
  "reason": "why needed",
  "reasonAr": "السبب بالعربية",
  "dataFlows": ["list of data types"],
  "confidence": 85
}]`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }]
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    
    if (!jsonMatch) return [];

    const detections = JSON.parse(jsonMatch[0]);
    return detections.map((d: any, idx: number) => {
      const catalog = INTEGRATION_CATALOG[d.integrationKey] || {};
      const dataTypes = this.classifyDataTypes(d.dataFlows || []);
      
      return {
        id: `int_${Date.now()}_${idx}`,
        name: catalog.name || d.customName || d.integrationKey,
        nameAr: catalog.nameAr || d.customName || d.integrationKey,
        category: catalog.category || "custom",
        provider: catalog.provider || "Custom",
        confidence: d.confidence || 50,
        reason: d.reason,
        reasonAr: d.reasonAr,
        requiredCredentials: catalog.requiredCredentials || [],
        dataTypes,
        securityLevel: this.determineSecurityLevel(dataTypes)
      };
    });
  }

  private classifyDataTypes(dataFlows: string[]): DataClassification[] {
    return dataFlows.map(flow => {
      const normalized = flow.toLowerCase().replace(/[_\s-]/g, "_");
      return DATA_SENSITIVITY_MAP[normalized] || {
        field: flow,
        type: "internal" as const,
        sensitivity: "low" as const,
        encryption: "transit" as const,
        retention: "default"
      };
    });
  }

  private determineSecurityLevel(dataTypes: DataClassification[]): "public" | "internal" | "confidential" | "restricted" {
    const maxSensitivity = dataTypes.reduce((max, dt) => {
      const levels = { low: 1, medium: 2, high: 3, critical: 4 };
      return Math.max(max, levels[dt.sensitivity]);
    }, 0);

    if (maxSensitivity >= 4) return "restricted";
    if (maxSensitivity >= 3) return "confidential";
    if (maxSensitivity >= 2) return "internal";
    return "public";
  }

  async generateAPIs(integration: IntegrationDetection, architecture: any): Promise<GeneratedAPI[]> {
    const prompt = `Generate REST API endpoints for integrating with ${integration.name}.

Integration Details:
- Category: ${integration.category}
- Security Level: ${integration.securityLevel}
- Data Types: ${JSON.stringify(integration.dataTypes)}

Architecture Context:
${JSON.stringify(architecture, null, 2)}

Generate appropriate CRUD endpoints with:
1. OpenAPI-compatible request/response schemas
2. Appropriate authentication based on security level
3. Rate limiting based on integration category
4. Input validation rules
5. Security headers

Return JSON array:
[{
  "method": "GET|POST|PUT|PATCH|DELETE",
  "endpoint": "/api/integrations/${integration.id}/...",
  "description": "What this endpoint does",
  "descriptionAr": "الوصف بالعربية",
  "requestSchema": { "type": "object", "properties": {...} },
  "responseSchema": { "type": "object", "properties": {...} },
  "authType": "api_key|bearer|oauth2|hmac|mtls",
  "rateLimit": { "requests": 100, "window": "1m" },
  "validationRules": [{ "field": "...", "type": "string", "required": true }]
}]`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }]
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    
    if (!jsonMatch) return [];

    const apis = JSON.parse(jsonMatch[0]);
    return apis.map((api: any, idx: number) => ({
      id: `api_${Date.now()}_${idx}`,
      integrationId: integration.id,
      method: api.method,
      endpoint: api.endpoint,
      description: api.description,
      descriptionAr: api.descriptionAr,
      requestSchema: api.requestSchema || {},
      responseSchema: api.responseSchema || {},
      authentication: this.buildAuthConfig(api.authType, integration.securityLevel),
      rateLimit: api.rateLimit || this.getDefaultRateLimit(integration.category),
      validation: api.validationRules || [],
      securityHeaders: this.getSecurityHeaders(integration.securityLevel)
    }));
  }

  private buildAuthConfig(authType: string, securityLevel: string): AuthConfig {
    const configs: Record<string, AuthConfig> = {
      api_key: { type: "api_key", location: "header", keyName: "X-API-Key" },
      bearer: { type: "bearer", location: "header" },
      oauth2: { type: "oauth2", scopes: ["read", "write"] },
      hmac: { type: "hmac", location: "header", keyName: "X-Signature" },
      mtls: { type: "mtls" }
    };

    if (securityLevel === "restricted") {
      return configs.mtls || configs.hmac;
    }
    
    return configs[authType] || configs.bearer;
  }

  private getDefaultRateLimit(category: string): RateLimitConfig {
    const limits: Record<string, RateLimitConfig> = {
      payment: { requests: 50, window: "1m", burst: 10 },
      auth: { requests: 20, window: "1m", burst: 5 },
      communication: { requests: 100, window: "1m", burst: 20 },
      storage: { requests: 200, window: "1m", burst: 50 },
      analytics: { requests: 500, window: "1m", burst: 100 },
      ai: { requests: 30, window: "1m", burst: 5 },
      crm: { requests: 100, window: "1m", burst: 20 },
      erp: { requests: 50, window: "1m", burst: 10 },
      custom: { requests: 100, window: "1m", burst: 20 }
    };
    return limits[category] || limits.custom;
  }

  private getSecurityHeaders(securityLevel: string): Record<string, string> {
    const base = {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block"
    };

    if (securityLevel === "restricted" || securityLevel === "confidential") {
      return {
        ...base,
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        "Content-Security-Policy": "default-src 'self'",
        "Cache-Control": "no-store, no-cache, must-revalidate"
      };
    }

    return base;
  }

  generateSecurityPolicy(integration: IntegrationDetection): SecurityPolicy {
    const accessControl: AccessControl = {
      requiredRoles: this.getRequiredRoles(integration.securityLevel),
      mfaRequired: integration.securityLevel === "restricted"
    };

    if (integration.securityLevel === "restricted") {
      accessControl.ipWhitelist = [];
      accessControl.timeRestrictions = [{ start: "06:00", end: "22:00" }];
    }

    const encryption: EncryptionPolicy = {
      atRest: integration.securityLevel !== "public",
      inTransit: true,
      algorithm: integration.securityLevel === "restricted" ? "AES-256-GCM" : "AES-128-GCM",
      keyRotation: integration.securityLevel === "restricted" ? "30d" : "90d"
    };

    const audit: AuditPolicy = {
      logRequests: true,
      logResponses: integration.securityLevel !== "public",
      retentionDays: this.getRetentionDays(integration.securityLevel),
      alertThresholds: [
        { metric: "error_rate", threshold: 5 },
        { metric: "latency_p99", threshold: 2000 }
      ]
    };

    const compliance = this.getComplianceRequirements(integration);

    return {
      integrationId: integration.id,
      dataClassifications: integration.dataTypes,
      accessControl,
      encryption,
      audit,
      compliance
    };
  }

  private getRequiredRoles(securityLevel: string): string[] {
    const roleMap: Record<string, string[]> = {
      public: ["user"],
      internal: ["user", "staff"],
      confidential: ["admin", "manager"],
      restricted: ["ROOT_OWNER", "security_admin"]
    };
    return roleMap[securityLevel] || roleMap.internal;
  }

  private getRetentionDays(securityLevel: string): number {
    const retention: Record<string, number> = {
      public: 30,
      internal: 90,
      confidential: 365,
      restricted: 2555
    };
    return retention[securityLevel] || 90;
  }

  private getComplianceRequirements(integration: IntegrationDetection): string[] {
    const requirements: string[] = [];

    if (integration.category === "payment") {
      requirements.push("PCI-DSS");
    }

    if (integration.dataTypes.some(dt => dt.type === "health")) {
      requirements.push("HIPAA");
    }

    if (integration.dataTypes.some(dt => dt.type === "pii")) {
      requirements.push("GDPR", "CCPA");
    }

    if (integration.securityLevel === "restricted") {
      requirements.push("SOC2", "ISO27001");
    }

    return requirements;
  }

  generateOpenAPISpec(integration: IntegrationDetection, apis: GeneratedAPI[]): any {
    return {
      openapi: "3.0.3",
      info: {
        title: `${integration.name} Integration API`,
        description: `Auto-generated API for ${integration.name} integration`,
        version: "1.0.0"
      },
      servers: [
        { url: "/api/integrations", description: "Integration API Server" }
      ],
      security: this.getOpenAPISecuritySchemes(integration.securityLevel),
      paths: apis.reduce((acc, api) => {
        const path = api.endpoint.replace("/api/integrations", "");
        acc[path] = acc[path] || {};
        acc[path][api.method.toLowerCase()] = {
          summary: api.description,
          description: api.descriptionAr,
          requestBody: api.method !== "GET" ? {
            required: true,
            content: { "application/json": { schema: api.requestSchema } }
          } : undefined,
          responses: {
            "200": {
              description: "Success",
              content: { "application/json": { schema: api.responseSchema } }
            },
            "400": { description: "Bad Request" },
            "401": { description: "Unauthorized" },
            "403": { description: "Forbidden" },
            "429": { description: "Rate Limited" },
            "500": { description: "Server Error" }
          }
        };
        return acc;
      }, {} as Record<string, any>),
      components: {
        securitySchemes: {
          bearerAuth: { type: "http", scheme: "bearer" },
          apiKey: { type: "apiKey", in: "header", name: "X-API-Key" }
        }
      }
    };
  }

  private getOpenAPISecuritySchemes(securityLevel: string): any[] {
    if (securityLevel === "public") return [];
    if (securityLevel === "restricted") {
      return [{ bearerAuth: [], apiKey: [] }];
    }
    return [{ bearerAuth: [] }];
  }
}

export const smartIntegrationHub = new SmartIntegrationHub();
