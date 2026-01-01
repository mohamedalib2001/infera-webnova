import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export interface DataModelSpec {
  entities: Array<{
    name: string;
    nameAr: string;
    fields: Array<{
      name: string;
      type: string;
      required: boolean;
      description: string;
    }>;
    relationships: Array<{
      type: "oneToOne" | "oneToMany" | "manyToMany";
      target: string;
      field: string;
    }>;
  }>;
}

export interface PermissionSpec {
  roles: Array<{
    name: string;
    nameAr: string;
    level: number;
    permissions: string[];
  }>;
  resources: Array<{
    name: string;
    actions: string[];
  }>;
  rules: Array<{
    role: string;
    resource: string;
    actions: string[];
    conditions?: string[];
  }>;
}

export interface OperationSpec {
  workflows: Array<{
    name: string;
    nameAr: string;
    trigger: string;
    steps: Array<{
      name: string;
      type: "action" | "condition" | "notification";
      config: Record<string, any>;
    }>;
  }>;
  apis: Array<{
    endpoint: string;
    method: string;
    description: string;
    auth: boolean;
    permissions?: string[];
  }>;
  events: Array<{
    name: string;
    payload: Record<string, string>;
    handlers: string[];
  }>;
}

export interface ArchitectureDescription {
  overview: {
    projectName: string;
    projectNameAr: string;
    description: string;
    sector: string;
    compliance: string[];
  };
  dataModel: DataModelSpec;
  permissions: PermissionSpec;
  operations: OperationSpec;
}

export interface ProcessingResult {
  success: boolean;
  stage: "overview" | "dataModel" | "permissions" | "operations";
  data: any;
  suggestions: string[];
  warnings: string[];
}

class DescriptiveArchitectureEngine {
  async processOverview(naturalLanguage: string): Promise<ProcessingResult> {
    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{
          role: "user",
          content: `أنت محلل متطلبات خبير. حلل الوصف التالي واستخرج معلومات المشروع الأساسية.

الوصف:
${naturalLanguage}

أعد النتيجة بصيغة JSON فقط:
{
  "projectName": "اسم المشروع بالإنجليزية",
  "projectNameAr": "اسم المشروع بالعربية",
  "description": "وصف مختصر",
  "sector": "القطاع (healthcare/financial/government/education/commercial/military)",
  "compliance": ["معايير الامتثال المطلوبة"],
  "detectedFeatures": ["الميزات المكتشفة"],
  "suggestedIntegrations": ["التكاملات المقترحة"]
}`
        }]
      });

      const content = response.content[0];
      if (content.type !== "text") throw new Error("Invalid response type");
      
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");
      
      const data = JSON.parse(jsonMatch[0]);
      
      return {
        success: true,
        stage: "overview",
        data: {
          projectName: data.projectName,
          projectNameAr: data.projectNameAr,
          description: data.description,
          sector: data.sector,
          compliance: data.compliance || []
        },
        suggestions: data.suggestedIntegrations || [],
        warnings: []
      };
    } catch (error) {
      return {
        success: false,
        stage: "overview",
        data: null,
        suggestions: [],
        warnings: [(error as Error).message]
      };
    }
  }

  async processDataModel(requirements: string, context: any): Promise<ProcessingResult> {
    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [{
          role: "user",
          content: `أنت مهندس قواعد بيانات خبير. صمم نموذج البيانات بناءً على المتطلبات.

سياق المشروع:
${JSON.stringify(context, null, 2)}

متطلبات نموذج البيانات:
${requirements}

أعد النتيجة بصيغة JSON فقط:
{
  "entities": [
    {
      "name": "EntityName",
      "nameAr": "اسم الكيان",
      "fields": [
        {"name": "fieldName", "type": "string|number|boolean|date|json|reference", "required": true, "description": "وصف الحقل"}
      ],
      "relationships": [
        {"type": "oneToOne|oneToMany|manyToMany", "target": "OtherEntity", "field": "foreignKey"}
      ]
    }
  ],
  "suggestions": ["اقتراحات تحسين"],
  "warnings": ["تحذيرات أمنية أو تصميمية"]
}`
        }]
      });

      const content = response.content[0];
      if (content.type !== "text") throw new Error("Invalid response type");
      
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      
      const data = JSON.parse(jsonMatch[0]);
      
      return {
        success: true,
        stage: "dataModel",
        data: { entities: data.entities },
        suggestions: data.suggestions || [],
        warnings: data.warnings || []
      };
    } catch (error) {
      return {
        success: false,
        stage: "dataModel",
        data: null,
        suggestions: [],
        warnings: [(error as Error).message]
      };
    }
  }

  async processPermissions(requirements: string, context: any): Promise<ProcessingResult> {
    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 3000,
        messages: [{
          role: "user",
          content: `أنت خبير أمن معلومات. صمم نظام الصلاحيات بناءً على المتطلبات.

سياق المشروع:
${JSON.stringify(context, null, 2)}

متطلبات الصلاحيات:
${requirements}

أعد النتيجة بصيغة JSON فقط:
{
  "roles": [
    {"name": "RoleName", "nameAr": "اسم الدور", "level": 1, "permissions": ["permission1", "permission2"]}
  ],
  "resources": [
    {"name": "ResourceName", "actions": ["create", "read", "update", "delete"]}
  ],
  "rules": [
    {"role": "RoleName", "resource": "ResourceName", "actions": ["read", "update"], "conditions": ["own_data"]}
  ],
  "suggestions": ["اقتراحات أمنية"],
  "warnings": ["تحذيرات"]
}`
        }]
      });

      const content = response.content[0];
      if (content.type !== "text") throw new Error("Invalid response type");
      
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      
      const data = JSON.parse(jsonMatch[0]);
      
      return {
        success: true,
        stage: "permissions",
        data: {
          roles: data.roles,
          resources: data.resources,
          rules: data.rules
        },
        suggestions: data.suggestions || [],
        warnings: data.warnings || []
      };
    } catch (error) {
      return {
        success: false,
        stage: "permissions",
        data: null,
        suggestions: [],
        warnings: [(error as Error).message]
      };
    }
  }

  async processOperations(requirements: string, context: any): Promise<ProcessingResult> {
    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [{
          role: "user",
          content: `أنت مهندس برمجيات خبير. صمم العمليات وسير العمل بناءً على المتطلبات.

سياق المشروع:
${JSON.stringify(context, null, 2)}

متطلبات العمليات:
${requirements}

أعد النتيجة بصيغة JSON فقط:
{
  "workflows": [
    {
      "name": "WorkflowName",
      "nameAr": "اسم سير العمل",
      "trigger": "event|schedule|manual",
      "steps": [
        {"name": "StepName", "type": "action|condition|notification", "config": {}}
      ]
    }
  ],
  "apis": [
    {"endpoint": "/api/resource", "method": "GET|POST|PUT|DELETE", "description": "وصف", "auth": true, "permissions": ["permission"]}
  ],
  "events": [
    {"name": "EventName", "payload": {"field": "type"}, "handlers": ["handler1"]}
  ],
  "suggestions": ["اقتراحات"],
  "warnings": ["تحذيرات"]
}`
        }]
      });

      const content = response.content[0];
      if (content.type !== "text") throw new Error("Invalid response type");
      
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      
      const data = JSON.parse(jsonMatch[0]);
      
      return {
        success: true,
        stage: "operations",
        data: {
          workflows: data.workflows,
          apis: data.apis,
          events: data.events
        },
        suggestions: data.suggestions || [],
        warnings: data.warnings || []
      };
    } catch (error) {
      return {
        success: false,
        stage: "operations",
        data: null,
        suggestions: [],
        warnings: [(error as Error).message]
      };
    }
  }

  async parseDocument(content: string): Promise<{
    sections: Array<{ title: string; content: string; type: string }>;
    requirements: string[];
  }> {
    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 3000,
        messages: [{
          role: "user",
          content: `حلل المستند التالي واستخرج الأقسام والمتطلبات:

${content}

أعد النتيجة بصيغة JSON:
{
  "sections": [
    {"title": "عنوان القسم", "content": "المحتوى", "type": "overview|dataModel|permissions|operations|other"}
  ],
  "requirements": ["متطلب 1", "متطلب 2"]
}`
        }]
      });

      const responseContent = response.content[0];
      if (responseContent.type !== "text") throw new Error("Invalid response");
      
      const jsonMatch = responseContent.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      return {
        sections: [{ title: "Document", content, type: "other" }],
        requirements: []
      };
    }
  }

  async generateFullArchitecture(description: ArchitectureDescription): Promise<{
    success: boolean;
    architecture: any;
    code: any;
  }> {
    return {
      success: true,
      architecture: description,
      code: {
        ready: true,
        message: "Architecture ready for code generation"
      }
    };
  }
}

export const descriptiveArchitectureEngine = new DescriptiveArchitectureEngine();
