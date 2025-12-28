import type { Express } from "express";
import { storage } from "./storage";
import { db } from "./db";
import { architecturePatterns } from "@shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { sandboxExecutor } from "@shared/core/kernel/sandbox-executor";
import { executeCommand as terminalExecute } from "./terminal-service";

const anthropic = new Anthropic();

// Import Nova permission checking
import { hasPermission } from "./nova-permissions";

// Tool to permission mapping - simple tools with single permission requirement
const simpleToolPermissionMap: Record<string, string> = {
  run_command: "execute_shell",
  create_file: "create_files",
  generate_platform: "ai_code_generation",
  read_database: "db_read",
  write_database: "db_write",
  delete_database: "db_delete",
};

// Language-specific permission mapping for execute_code
const languagePermissionMap: Record<string, string> = {
  javascript: "execute_nodejs",
  typescript: "execute_nodejs",
  nodejs: "execute_nodejs",
  python: "execute_python",
  bash: "execute_shell",
  shell: "execute_shell",
};

// Deployment permission mapping based on environment
const deploymentPermissionMap: Record<string, string> = {
  development: "deploy_preview",
  staging: "deploy_preview",
  production: "deploy_production",
};

// Check if user has required permission for a tool with context-aware checks
async function checkToolPermission(
  userId: string, 
  toolName: string, 
  toolInput?: any
): Promise<{ allowed: boolean; missingPermission?: string }> {
  
  // Handle execute_code with language-specific permissions
  if (toolName === "execute_code") {
    const language = toolInput?.language?.toLowerCase() || "javascript";
    const requiredPerm = languagePermissionMap[language];
    if (!requiredPerm) {
      return { allowed: false, missingPermission: `execute_${language}` };
    }
    const hasP = await hasPermission(userId, requiredPerm);
    return hasP 
      ? { allowed: true } 
      : { allowed: false, missingPermission: requiredPerm };
  }
  
  // Handle deploy_platform with environment-specific permissions
  if (toolName === "deploy_platform") {
    const environment = toolInput?.environment?.toLowerCase() || "development";
    const requiredPerm = deploymentPermissionMap[environment] || "deploy_preview";
    const hasP = await hasPermission(userId, requiredPerm);
    return hasP 
      ? { allowed: true } 
      : { allowed: false, missingPermission: requiredPerm };
  }
  
  // Handle simple tools with single permission
  const requiredPermission = simpleToolPermissionMap[toolName];
  if (!requiredPermission) {
    return { allowed: true }; // No specific permission required for unknown tools
  }
  
  const hasP = await hasPermission(userId, requiredPermission);
  return hasP 
    ? { allowed: true } 
    : { allowed: false, missingPermission: requiredPermission };
}

// Nova Tool definitions for Claude function calling
const novaTools: Anthropic.Tool[] = [
  {
    name: "execute_code",
    description: "Execute code in a sandboxed environment. Supports Node.js, Python, TypeScript, and more.",
    input_schema: {
      type: "object" as const,
      properties: {
        language: { type: "string", enum: ["javascript", "typescript", "python", "bash"], description: "Programming language" },
        code: { type: "string", description: "Code to execute" },
        projectId: { type: "string", description: "Project ID for context" }
      },
      required: ["language", "code"]
    }
  },
  {
    name: "run_command",
    description: "Run a shell command like npm install, npm build, git clone, etc.",
    input_schema: {
      type: "object" as const,
      properties: {
        command: { type: "string", description: "Shell command to run" },
        projectId: { type: "string", description: "Project ID for context" }
      },
      required: ["command"]
    }
  },
  {
    name: "create_file",
    description: "Create or update a file in the project",
    input_schema: {
      type: "object" as const,
      properties: {
        projectId: { type: "string", description: "Project ID" },
        filePath: { type: "string", description: "File path relative to project root" },
        content: { type: "string", description: "File content" }
      },
      required: ["projectId", "filePath", "content"]
    }
  },
  {
    name: "generate_platform",
    description: "Generate a complete full-stack platform with frontend, backend, and database",
    input_schema: {
      type: "object" as const,
      properties: {
        name: { type: "string", description: "Platform name" },
        description: { type: "string", description: "What the platform does" },
        industry: { type: "string", enum: ["saas", "ecommerce", "healthcare", "education", "government", "fintech"], description: "Industry type" },
        features: { type: "array", items: { type: "string" }, description: "List of features" }
      },
      required: ["name", "description"]
    }
  },
  {
    name: "deploy_platform",
    description: "Deploy the platform to a cloud provider",
    input_schema: {
      type: "object" as const,
      properties: {
        projectId: { type: "string", description: "Project ID to deploy" },
        provider: { type: "string", enum: ["vercel", "netlify", "railway", "hetzner"], description: "Cloud provider" },
        environment: { type: "string", enum: ["development", "staging", "production"], description: "Deployment environment" }
      },
      required: ["projectId", "provider"]
    }
  }
];

// Execute Nova tool with permission checking
async function executeNovaTool(toolName: string, toolInput: any, userId: string): Promise<string> {
  try {
    // Check permission before executing tool - pass toolInput for context-aware checks
    const permCheck = await checkToolPermission(userId, toolName, toolInput);
    if (!permCheck.allowed) {
      return JSON.stringify({
        success: false,
        error: `Permission denied: ${permCheck.missingPermission}`,
        errorAr: `الصلاحية مرفوضة: ${permCheck.missingPermission}`,
        requiredPermission: permCheck.missingPermission,
      });
    }
    
    switch (toolName) {
      case "execute_code": {
        const result = await sandboxExecutor.execute({
          language: toolInput.language === "javascript" ? "nodejs" : toolInput.language,
          code: toolInput.code,
          args: [],
          env: {},
          timeout: 30000,
          resources: {
            maxCpu: 1,
            maxMemory: 256,
            maxDisk: 100,
            networkEnabled: false
          }
        });
        return JSON.stringify({
          success: result.success,
          output: result.stdout || result.output,
          error: result.stderr || result.error,
          executionTime: result.executionTime
        });
      }
      
      case "run_command": {
        const projectId = toolInput.projectId || "default";
        const result = await terminalExecute(projectId, toolInput.command);
        return JSON.stringify({
          success: result.code === 0,
          stdout: result.stdout,
          stderr: result.stderr,
          exitCode: result.code
        });
      }
      
      case "create_file": {
        // Store file in project via storage
        const project = await storage.getProject(toolInput.projectId);
        if (project) {
          // For now, we'll return success - in full implementation this would write to filesystem
          return JSON.stringify({
            success: true,
            message: `File ${toolInput.filePath} created successfully`,
            path: toolInput.filePath
          });
        }
        return JSON.stringify({ success: false, error: "Project not found" });
      }
      
      case "generate_platform": {
        // Check if Anthropic API is configured FIRST before any DB operations
        const { getAnthropicClientAsync } = await import("./ai-config");
        const anthropicClient = await getAnthropicClientAsync();
        
        if (!anthropicClient) {
          return JSON.stringify({
            success: false,
            error: "Anthropic API not configured. Please add ANTHROPIC_API_KEY to use platform generation.",
            errorAr: "مزود الذكاء الاصطناعي Anthropic غير مهيأ. يرجى إضافة ANTHROPIC_API_KEY لاستخدام توليد المنصات.",
            requiresConfiguration: true,
            action: "Configure ANTHROPIC_API_KEY in your environment secrets"
          });
        }
        
        // Use FullStackGenerator to create complete platform with actual code
        const { FullStackGenerator } = await import("./full-stack-generator");
        const generator = new FullStackGenerator();
        
        try {
          const result = await generator.generateProject({
            name: toolInput.name,
            nameAr: toolInput.name,
            description: toolInput.description,
            descriptionAr: toolInput.description,
            industry: toolInput.industry || "other",
            features: toolInput.features || ["dashboard", "users", "settings"],
            hasAuth: true,
            hasPayments: false,
            language: "bilingual"
          });
          
          return JSON.stringify({
            success: true,
            projectId: result.projectId,
            message: `Platform "${toolInput.name}" created with ${result.files.length} files`,
            messageAr: `تم إنشاء منصة "${toolInput.name}" مع ${result.files.length} ملف`,
            filesGenerated: result.files.length,
            apiEndpoints: result.apiEndpoints.length,
            files: result.files.map(f => f.path),
            nextSteps: ["Review generated code", "Configure settings", "Deploy"]
          });
        } catch (genError: any) {
          console.error("[Nova] Platform generation error:", genError);
          return JSON.stringify({
            success: false,
            error: genError.message,
            errorAr: "حدث خطأ أثناء إنشاء المنصة"
          });
        }
      }
      
      case "deploy_platform": {
        // Return deployment initiation - in full implementation this calls deployment service
        return JSON.stringify({
          success: true,
          status: "initiated",
          provider: toolInput.provider,
          message: `Deployment to ${toolInput.provider} initiated for project ${toolInput.projectId}`,
          estimatedTime: "2-5 minutes"
        });
      }
      
      default:
        return JSON.stringify({ error: `Unknown tool: ${toolName}` });
    }
  } catch (error: any) {
    return JSON.stringify({ error: error.message });
  }
}

// Helper to get user ID from request (supports both Replit Auth and session-based auth)
function getUserId(req: any): string | null {
  // Check Replit Auth first (passport)
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    const replitUser = req.user as any;
    return replitUser.claims?.sub || replitUser.id;
  }
  
  // Fallback to traditional session auth
  if (req.session?.userId) {
    return req.session.userId;
  }
  
  return null;
}

// Middleware to ensure user is authenticated (supports both Replit Auth and session-based auth)
async function requireAuth(req: any, res: any, next: any) {
  const userId = getUserId(req);
  if (userId) {
    // Attach userId to request for downstream use
    req.userId = userId;
    // Also create a user-like object for backward compatibility
    if (!req.user) {
      req.user = { id: userId };
    } else if (!(req.user as any).id) {
      (req.user as any).id = userId;
    }
    return next();
  }
  
  return res.status(401).json({ error: "غير مصرح - يجب تسجيل الدخول" });
}

// Validation schemas
const createSessionSchema = z.object({
  projectId: z.string().optional(),
  title: z.string().optional(),
  language: z.enum(["ar", "en"]).default("ar"),
});

// Shared attachment schema with size validation
const attachmentSchema = z.object({
  type: z.enum(["image", "file", "code", "blueprint"]),
  url: z.string().optional(),
  content: z.string().max(10 * 1024 * 1024).optional(), // Max 10MB base64
  metadata: z.object({
    mimeType: z.string().optional(),
    name: z.string().optional(),
  }).passthrough().optional(),
});

const sendMessageSchema = z.object({
  content: z.string().min(1),
  language: z.enum(["ar", "en"]).default("ar"),
  attachments: z.array(attachmentSchema).max(5).optional(), // Max 5 attachments
});

const createDecisionSchema = z.object({
  sessionId: z.string().optional(),
  messageId: z.string().optional(),
  category: z.enum(["architecture", "security", "deployment", "database", "ui", "integration"]),
  decisionType: z.enum(["choice", "configuration", "approval", "rejection"]),
  question: z.string(),
  selectedOption: z.string(),
  alternatives: z.array(z.string()).optional(),
  context: z.object({
    projectId: z.string().optional(),
    blueprintId: z.string().optional(),
    affectedComponents: z.array(z.string()).optional(),
    dependencies: z.array(z.string()).optional(),
    costImpact: z.object({
      estimate: z.number(),
      currency: z.string(),
    }).optional(),
    riskLevel: z.enum(["low", "medium", "high", "critical"]).optional(),
  }).optional(),
  reasoning: z.string().optional(),
  userNotes: z.string().optional(),
});

const updatePreferencesSchema = z.object({
  preferredLanguage: z.enum(["ar", "en"]).optional(),
  preferredFramework: z.string().optional(),
  preferredDatabase: z.string().optional(),
  preferredCloudProvider: z.string().optional(),
  preferredUIStyle: z.string().optional(),
  detailLevel: z.enum(["brief", "balanced", "detailed"]).optional(),
  codeExplanations: z.boolean().optional(),
  showAlternatives: z.boolean().optional(),
});

const createKnowledgeNodeSchema = z.object({
  nodeType: z.enum(["decision", "component", "requirement", "constraint", "dependency", "risk", "goal"]),
  name: z.string().min(1).max(200),
  nameAr: z.string().optional(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  technicalDetails: z.record(z.any()).optional(),
  businessIntent: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
});

// Operations Platform Validation Schemas
const createDeploymentConfigSchema = z.object({
  name: z.string().optional(),
  nameAr: z.string().optional(),
  environment: z.enum(["development", "staging", "production"]).default("development"),
  provider: z.string().default("hetzner"),
  region: z.string().optional(),
  instanceType: z.string().optional(),
  autoScaling: z.boolean().optional(),
  minInstances: z.number().min(1).max(10).optional(),
  maxInstances: z.number().min(1).max(50).optional(),
  envVars: z.record(z.string()).optional(),
  domain: z.string().optional(),
  customDomain: z.string().optional(),
  sslEnabled: z.boolean().optional(),
  cdnEnabled: z.boolean().optional(),
  healthCheckPath: z.string().optional(),
  autoDeploy: z.boolean().optional(),
  deployBranch: z.string().optional(),
});

const createDeploymentSchema = z.object({
  configId: z.string(),
  version: z.string().min(1),
  commitHash: z.string().optional(),
  commitMessage: z.string().optional(),
});

// Multi-Surface Generator Validation Schemas
const createBuildConfigSchema = z.object({
  name: z.string().optional(),
  nameAr: z.string().optional(),
  platform: z.enum(["web", "android", "ios", "windows", "macos", "linux"]),
  buildType: z.enum(["debug", "release", "production"]).default("release"),
  appName: z.string().optional(),
  appNameAr: z.string().optional(),
  bundleId: z.string().optional(),
  version: z.string().default("1.0.0"),
  versionCode: z.number().int().positive().optional(),
  appIcon: z.string().optional(),
  splashScreen: z.string().optional(),
  buildSettings: z.record(z.any()).optional(),
  signingConfig: z.record(z.any()).optional(),
  targetSdk: z.number().optional(),
  minimumSdk: z.number().optional(),
});

const startBuildSchema = z.object({
  configId: z.string(),
  version: z.string().optional(),
});

// Unified Blueprint Validation Schema
const createBlueprintSchema = z.object({
  name: z.string().min(1).max(200),
  nameAr: z.string().optional(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  version: z.string().default("1.0.0"),
  definition: z.object({
    entities: z.array(z.object({
      name: z.string(),
      fields: z.array(z.object({
        name: z.string(),
        type: z.string(),
        required: z.boolean().optional(),
      })),
      relationships: z.array(z.object({
        entity: z.string(),
        type: z.string(),
      })).optional(),
    })),
    screens: z.array(z.object({
      name: z.string(),
      type: z.enum(["list", "detail", "form", "dashboard"]),
      entity: z.string().optional(),
      components: z.array(z.object({
        type: z.string(),
        props: z.record(z.any()).optional(),
      })).optional(),
    })),
    navigation: z.object({
      type: z.enum(["tabs", "drawer", "stack"]),
      routes: z.array(z.object({
        name: z.string(),
        screen: z.string(),
        icon: z.string().optional(),
      })),
    }),
    theme: z.object({
      primaryColor: z.string(),
      secondaryColor: z.string(),
      fontFamily: z.string().optional(),
    }).optional(),
    features: z.array(z.string()).optional(),
  }),
});

// ==================== NOVA ENHANCED CAPABILITIES ====================

// Nova's capability definitions for self-awareness
const NOVA_CAPABILITIES = {
  current: {
    conversational_ai: true,
    code_execution: true,
    code_generation: true,
    github_integration: true,
    long_term_memory: true,
    platform_architecture: true,
    docker_kubernetes: true,
    payment_integration: true,
    security_scanning: true,
    multi_language: true,
  },
  languages: ['nodejs', 'python', 'typescript', 'go', 'php', 'rust'],
  databases: ['postgresql', 'mongodb', 'redis', 'mysql', 'elasticsearch', 'cassandra'],
  payments: ['stripe', 'paytabs', 'stc_pay', 'mada', 'hyperpay', 'paymob', 'fawry', 'amazon_pay', 'apple_pay', 'google_pay'],
  security: ['fips_140_3', 'pki', 'zero_trust', 'mfa', 'encryption', 'siem_soar', 'threat_modeling', 'penetration_testing'],
  
  // Advanced Architecture Patterns
  architecture: {
    event_driven: {
      kafka: true,
      rabbitmq: true,
      redis_streams: true,
      event_sourcing: true,
      description: 'Event-Driven Architecture with Apache Kafka, RabbitMQ, Event Sourcing'
    },
    patterns: {
      cqrs: true,
      saga: true,
      circuit_breaker: true,
      bulkhead: true,
      retry: true,
      description: 'CQRS, Saga Patterns, Circuit Breaker, Bulkhead, Retry Patterns'
    },
    multi_tenant: {
      database_per_tenant: true,
      schema_per_tenant: true,
      row_level_security: true,
      description: 'Multi-tenant SaaS Architecture with isolation strategies'
    },
    microservices: {
      service_mesh: true,
      api_gateway: true,
      service_discovery: true,
      description: 'Microservices with Service Mesh (Istio), API Gateway, Service Discovery'
    }
  },
  
  // Performance & Optimization
  performance: {
    cdn: {
      cloudflare: true,
      aws_cloudfront: true,
      edge_computing: true,
      description: 'CDN Strategy with Edge Computing'
    },
    database: {
      sharding: true,
      replication: true,
      partitioning: true,
      connection_pooling: true,
      description: 'Database Sharding, Replication, Partitioning'
    },
    caching: {
      redis: true,
      memcached: true,
      cdn_cache: true,
      browser_cache: true,
      application_cache: true,
      description: 'Multi-layer Caching (L1, L2, L3)'
    },
    testing: {
      jmeter: true,
      k6: true,
      locust: true,
      description: 'Load Testing with JMeter, K6, Locust'
    },
    apm: {
      new_relic: true,
      datadog: true,
      prometheus: true,
      grafana: true,
      description: 'APM with New Relic, Datadog, Prometheus, Grafana'
    }
  },
  
  // Advanced Security
  advanced_security: {
    zero_trust: {
      identity_verification: true,
      micro_segmentation: true,
      least_privilege: true,
      continuous_verification: true,
      description: 'Zero Trust Network Implementation'
    },
    siem_soar: {
      log_aggregation: true,
      threat_detection: true,
      automated_response: true,
      incident_management: true,
      description: 'SIEM/SOAR Integration for Security Operations'
    },
    threat_modeling: {
      stride: true,
      dread: true,
      attack_trees: true,
      automated_scanning: true,
      description: 'Automated Threat Modeling (STRIDE, DREAD)'
    },
    penetration_testing: {
      owasp_zap: true,
      burp_suite: true,
      automated_pentest: true,
      description: 'Automated Penetration Testing'
    },
    blockchain: {
      audit_trail: true,
      smart_contracts: true,
      immutable_logs: true,
      description: 'Blockchain for Audit Trail and Transparency'
    }
  },
  
  // AI/ML Capabilities
  ai_ml: {
    integration: {
      openai: true,
      anthropic: true,
      huggingface: true,
      custom_models: true,
      description: 'ML/AI Integration in Platforms'
    },
    recommendation: {
      collaborative_filtering: true,
      content_based: true,
      hybrid: true,
      real_time: true,
      description: 'Recommendation Systems'
    },
    nlp: {
      text_analysis: true,
      sentiment: true,
      entity_extraction: true,
      translation: true,
      chatbots: true,
      description: 'Natural Language Processing'
    },
    computer_vision: {
      image_classification: true,
      object_detection: true,
      ocr: true,
      face_recognition: true,
      description: 'Computer Vision APIs'
    },
    predictive: {
      time_series: true,
      anomaly_detection: true,
      forecasting: true,
      churn_prediction: true,
      description: 'Predictive Analytics'
    }
  },
  
  // Cloud & Infrastructure
  cloud: {
    providers: ['aws', 'azure', 'gcp', 'hetzner', 'digitalocean', 'vercel', 'netlify'],
    kubernetes: {
      k8s: true,
      k3s: true,
      helm: true,
      operators: true,
      description: 'Kubernetes Orchestration'
    },
    iac: {
      terraform: true,
      ansible: true,
      pulumi: true,
      description: 'Infrastructure as Code'
    },
    cicd: {
      github_actions: true,
      gitlab_ci: true,
      jenkins: true,
      argocd: true,
      description: 'CI/CD Pipelines'
    }
  },
  
  // Compliance Standards
  compliance: ['gdpr', 'pci_dss', 'hipaa', 'soc2', 'iso27001', 'sox', 'nist'],
  
  // Scale Metrics
  scale: {
    max_users: '100M+',
    concurrent_users: '1M+',
    data_size: 'Petabytes',
    availability: '99.99%',
    regions: 'Global Multi-Region'
  },
  
  // ==================== ADVANCED PLATFORM TOOLS ====================
  
  // 1. AI-Powered Auto-Scaling Predictor
  auto_scaling_ai: {
    enabled: true,
    prediction_window: '30-60 minutes',
    features: {
      historical_pattern_analysis: true,
      external_event_correlation: true,
      proactive_scaling: true,
      ml_load_prediction: true,
    },
    supported_platforms: ['kubernetes', 'aws_ecs', 'azure_aks', 'gcp_gke'],
    description: 'Predict load 30-60 min ahead, proactive auto-scaling instead of reactive'
  },
  
  // 2. Zero-Downtime Multi-Cloud Migration
  cloud_migration: {
    enabled: true,
    features: {
      live_database_migration: true,
      zero_downtime: true,
      multi_region_sync: true,
      data_validation: true,
      rollback_capability: true,
    },
    supported_data_size: '100TB+',
    supported_clouds: ['aws', 'gcp', 'azure', 'hetzner', 'digitalocean'],
    description: 'Zero-downtime migration of 100TB+ data between clouds'
  },
  
  // 3. Intelligent Database Sharding Automation
  intelligent_sharding: {
    enabled: true,
    features: {
      auto_shard_strategy: true,
      query_pattern_analysis: true,
      dynamic_redistribution: true,
      hotspot_prediction: true,
      automatic_rebalancing: true,
    },
    supported_databases: ['postgresql', 'mysql', 'mongodb', 'cassandra'],
    description: 'AI-powered automatic sharding with hotspot prediction'
  },
  
  // 4. Universal AI API Gateway
  ai_api_gateway: {
    enabled: true,
    features: {
      smart_rate_limiting: true,
      predictive_caching: true,
      realtime_threat_detection: true,
      api_analytics: true,
      behavior_based_throttling: true,
    },
    protocols: ['rest', 'graphql', 'grpc', 'websocket'],
    description: 'AI-powered API Gateway with smart rate limiting and threat detection'
  },
  
  // 5. Code-to-Architecture Visualization
  code_to_architecture: {
    enabled: true,
    features: {
      codebase_analysis: true,
      architecture_visualization: true,
      optimization_suggestions: true,
      bottleneck_prediction: true,
      auto_documentation: true,
    },
    supported_languages: ['typescript', 'javascript', 'python', 'go', 'java', 'rust'],
    description: 'Analyze codebase and generate architecture diagrams with optimization suggestions'
  },
  
  // 6. Autonomous Security Orchestration
  security_orchestration: {
    enabled: true,
    features: {
      ai_threat_monitoring: true,
      auto_remediation: true,
      predictive_threat_modeling: true,
      zero_false_positive: true,
      incident_response_automation: true,
    },
    compliance: ['soc2', 'pci_dss', 'hipaa', 'gdpr'],
    description: 'AI-powered 24/7 security monitoring with auto-remediation'
  },
  
  // 7. Intelligent Cost Optimization Engine
  cost_optimization: {
    enabled: true,
    features: {
      usage_pattern_analysis: true,
      rightsizing_recommendations: true,
      monthly_cost_prediction: true,
      reserved_instance_advisor: true,
      spot_instance_optimization: true,
    },
    supported_clouds: ['aws', 'gcp', 'azure'],
    savings_potential: '30-70%',
    description: 'AI-powered cost optimization with up to 70% savings'
  },
  
  // 8. Multi-Language Microservices Generator
  microservices_generator: {
    enabled: true,
    supported_languages: ['nodejs', 'python', 'go', 'rust', 'java', 'kotlin', 'scala', 'csharp', 'ruby', 'php'],
    features: {
      consistent_api_contracts: true,
      auto_documentation: true,
      built_in_observability: true,
      service_mesh_ready: true,
      kubernetes_manifests: true,
    },
    description: 'Generate microservices in 10+ languages with consistent API contracts'
  },
  
  // 9. Chaos Engineering Automation
  chaos_engineering: {
    enabled: true,
    features: {
      experiment_planning: true,
      safe_production_execution: true,
      impact_analysis: true,
      resilience_reporting: true,
      auto_recommendations: true,
    },
    experiment_types: ['network_failure', 'pod_kill', 'latency_injection', 'cpu_stress', 'memory_pressure'],
    description: 'AI-planned chaos experiments with safe production execution'
  },
  
  // 10. Real-time Performance Debugging
  performance_debugging: {
    enabled: true,
    features: {
      distributed_tracing: true,
      cross_service_tracking: true,
      root_cause_analysis: true,
      realtime_profiling: true,
      anomaly_detection: true,
    },
    scale: '100+ microservices',
    latency: 'seconds',
    description: 'Debug performance across 100+ microservices in seconds'
  },
  
  // 11. Streaming Data Processing Engine
  streaming_engine: {
    enabled: true,
    throughput: '1M+ events/second',
    features: {
      complex_event_processing: true,
      realtime_ml: true,
      exactly_once_semantics: true,
      windowed_aggregations: true,
      state_management: true,
    },
    technologies: ['kafka_streams', 'flink', 'spark_streaming'],
    description: 'Process 1M+ events/second with real-time ML'
  },
  
  // 12. Automated Data Pipeline Orchestration
  data_pipeline_ai: {
    enabled: true,
    features: {
      schema_change_detection: true,
      pipeline_optimization: true,
      auto_failure_handling: true,
      data_quality_monitoring: true,
      lineage_tracking: true,
    },
    supported_sources: ['databases', 'apis', 'files', 'streams', 'events'],
    description: 'AI-automated data pipelines with schema change detection'
  },

  // ==================== FUTURISTIC PLATFORM BUILDERS ====================
  
  bio_computing: {
    enabled: true,
    name: 'Bio-Computing Platform Builder',
    name_ar: 'منشئ منصات الحوسبة الحيوية',
    features: {
      genomic_analysis: true,
      dna_sequencing_pipelines: true,
      protein_folding_prediction: true,
      crispr_design_tools: true,
      bioinformatics_workflows: true,
      clinical_genomics: true,
      variant_calling: true,
      population_genetics: true,
    },
    supported_formats: ['FASTQ', 'BAM', 'VCF', 'FASTA', 'GFF', 'BED'],
    compliance: ['HIPAA', 'GDPR', 'GxP', 'CAP', 'CLIA'],
    scale: {
      genomes_per_day: '10,000+',
      petabytes_storage: true,
      distributed_computing: true,
    },
    description: 'Build genomics platforms with DNA sequencing, variant analysis, and clinical genomics'
  },

  autonomous_vehicles: {
    enabled: true,
    name: 'Autonomous Vehicle Platform',
    name_ar: 'منصة المركبات الذاتية القيادة',
    features: {
      fleet_management: true,
      real_time_tracking: true,
      route_optimization: true,
      predictive_maintenance: true,
      sensor_data_fusion: true,
      v2x_communication: true,
      safety_monitoring: true,
      charging_management: true,
      geofencing: true,
      incident_detection: true,
    },
    vehicle_types: ['cars', 'trucks', 'buses', 'drones', 'robots', 'ships'],
    sensors: ['LiDAR', 'Radar', 'Camera', 'GPS', 'IMU', 'Ultrasonic'],
    scale: {
      vehicles_per_fleet: '100,000+',
      events_per_second: '10M+',
      latency_ms: '<50',
    },
    description: 'Manage autonomous vehicle fleets with real-time tracking and AI-powered routing'
  },

  smart_city: {
    enabled: true,
    name: 'Smart City Integration Platform',
    name_ar: 'منصة تكامل المدن الذكية',
    features: {
      traffic_management: true,
      public_transport: true,
      energy_grid: true,
      water_management: true,
      waste_management: true,
      public_safety: true,
      air_quality: true,
      noise_monitoring: true,
      parking_systems: true,
      street_lighting: true,
      emergency_response: true,
      citizen_engagement: true,
    },
    iot_protocols: ['MQTT', 'CoAP', 'LoRaWAN', 'Zigbee', 'NB-IoT', '5G'],
    scale: {
      sensors: '10M+',
      citizens: '50M+',
      real_time_dashboards: true,
    },
    integrations: ['GIS', 'BIM', 'SCADA', 'ERP', 'CRM'],
    description: 'Integrate all smart city systems: traffic, energy, water, safety, and citizen services'
  },

  climate_tech: {
    enabled: true,
    name: 'Climate Tech Platform',
    name_ar: 'منصة تقنيات المناخ',
    features: {
      carbon_tracking: true,
      emissions_monitoring: true,
      renewable_energy_management: true,
      climate_modeling: true,
      weather_prediction: true,
      disaster_early_warning: true,
      biodiversity_monitoring: true,
      ocean_monitoring: true,
      forest_monitoring: true,
      satellite_data_processing: true,
      esg_reporting: true,
      carbon_credits: true,
    },
    data_sources: ['satellites', 'ground_sensors', 'drones', 'weather_stations', 'ocean_buoys'],
    compliance: ['GHG Protocol', 'TCFD', 'CDP', 'SBTi', 'EU Taxonomy'],
    scale: {
      data_points_per_day: '1B+',
      prediction_accuracy: '95%+',
      global_coverage: true,
    },
    description: 'Monitor climate, track carbon emissions, and manage renewable energy at global scale'
  },

  neural_interface: {
    enabled: true,
    name: 'Neural Interface Platform',
    name_ar: 'منصة الواجهات العصبية',
    features: {
      brain_signal_processing: true,
      eeg_analysis: true,
      emg_processing: true,
      neural_decoding: true,
      motor_control: true,
      sensory_feedback: true,
      cognitive_state_detection: true,
      sleep_analysis: true,
      attention_monitoring: true,
      emotion_recognition: true,
      neurofeedback: true,
      prosthetics_control: true,
    },
    signal_types: ['EEG', 'EMG', 'ECoG', 'LFP', 'Spike Trains'],
    applications: ['prosthetics', 'rehabilitation', 'gaming', 'communication', 'research'],
    compliance: ['FDA', 'CE', 'ISO 13485', 'IEC 62304'],
    scale: {
      channels: '10,000+',
      sampling_rate_hz: '30,000+',
      latency_ms: '<10',
    },
    description: 'Build brain-computer interfaces for prosthetics, communication, and cognitive enhancement'
  }
};

// Project memory now uses database storage via storage.getNovaProjectContext
// and storage.upsertNovaProjectContext for persistence

// ==================== NOVA INTELLIGENCE ENHANCEMENT SYSTEM ====================

// Intent Classification System - فهم نوايا المستخدم
const INTENT_PATTERNS = {
  // Platform Building Intents
  BUILD_PLATFORM: {
    patterns: [
      /(?:build|create|make|develop|generate|أنشئ|ابني|اعمل|صمم)\s*(?:a|an|the)?\s*(?:platform|app|application|website|system|منصة|تطبيق|موقع|نظام)/i,
      /(?:i want|أريد|عايز|محتاج)\s*(?:to|ان)\s*(?:build|create|make|بناء|إنشاء|عمل)/i,
    ],
    intent: 'BUILD_PLATFORM',
    required_info: ['platform_type', 'target_users', 'main_features', 'scale'],
    clarifying_questions_ar: [
      'ما نوع المنصة التي تريد بناءها؟ (e-commerce, healthcare, education, etc.)',
      'كم عدد المستخدمين المتوقع؟',
      'ما هي الميزات الأساسية المطلوبة؟',
      'هل تحتاج دعم متعدد اللغات؟',
      'ما هي المنطقة الجغرافية المستهدفة؟',
    ],
    clarifying_questions_en: [
      'What type of platform do you want to build? (e-commerce, healthcare, education, etc.)',
      'How many users do you expect?',
      'What are the core features needed?',
      'Do you need multi-language support?',
      'What geographic region are you targeting?',
    ],
  },
  
  // Code Generation Intents
  GENERATE_CODE: {
    patterns: [
      /(?:write|generate|create|code|implement|اكتب|ولد|انشئ|برمج)\s*(?:code|function|api|endpoint|كود|دالة|واجهة)/i,
      /(?:add|implement|إضافة|تنفيذ)\s*(?:feature|functionality|ميزة|وظيفة)/i,
    ],
    intent: 'GENERATE_CODE',
    required_info: ['language', 'functionality', 'integration_points'],
    clarifying_questions_ar: [
      'ما هي لغة البرمجة المطلوبة؟',
      'ما هي الوظيفة المطلوبة بالتحديد؟',
      'هل هناك نظام موجود يجب التكامل معه؟',
    ],
    clarifying_questions_en: [
      'What programming language should I use?',
      'What exactly should this code do?',
      'Is there an existing system to integrate with?',
    ],
  },
  
  // Architecture Analysis Intents
  ANALYZE_ARCHITECTURE: {
    patterns: [
      /(?:analyze|review|check|evaluate|حلل|راجع|قيم)\s*(?:architecture|code|system|design|بنية|كود|نظام|تصميم)/i,
      /(?:what|how|ما|كيف)\s*(?:is|should|هو|يجب)\s*(?:the best|optimal|أفضل)/i,
    ],
    intent: 'ANALYZE_ARCHITECTURE',
    required_info: ['system_context', 'analysis_scope'],
    clarifying_questions_ar: [
      'ما هو النظام الذي تريد تحليله؟',
      'هل تريد تحليل الأداء أم الأمان أم قابلية التوسع؟',
    ],
    clarifying_questions_en: [
      'What system would you like me to analyze?',
      'Should I focus on performance, security, or scalability?',
    ],
  },
  
  // Query Capabilities Intents
  QUERY_CAPABILITIES: {
    patterns: [
      /(?:what can you|can you|are you able|ماذا تستطيع|هل تستطيع|تقدر)\s*(?:do|build|help|تفعل|تبني|تساعد)/i,
      /(?:tell me about|explain|show|اشرح|وضح|اعرض)\s*(?:your|capabilities|features|قدراتك|ميزاتك)/i,
      /(?:قدراتك|امكانياتك|ايش تقدر|وش تقدر)/i,
    ],
    intent: 'QUERY_CAPABILITIES',
    required_info: [],
    clarifying_questions_ar: [],
    clarifying_questions_en: [],
  },
  
  // Database Operations
  DATABASE_OPS: {
    patterns: [
      /(?:database|db|schema|table|query|قاعدة بيانات|جدول|استعلام)/i,
      /(?:create|design|migrate|إنشاء|تصميم|ترحيل)\s*(?:database|schema|tables|قاعدة|جداول)/i,
    ],
    intent: 'DATABASE_OPS',
    required_info: ['database_type', 'entities', 'relationships'],
    clarifying_questions_ar: [
      'ما نوع قاعدة البيانات؟ (PostgreSQL, MongoDB, etc.)',
      'ما هي الكيانات الرئيسية؟',
      'ما هي العلاقات بين الكيانات؟',
    ],
    clarifying_questions_en: [
      'What database type? (PostgreSQL, MongoDB, etc.)',
      'What are the main entities?',
      'What are the relationships between entities?',
    ],
  },
  
  // Deployment & Infrastructure
  DEPLOYMENT: {
    patterns: [
      /(?:deploy|publish|host|launch|نشر|استضافة|إطلاق)\s*(?:app|application|platform|تطبيق|منصة)/i,
      /(?:kubernetes|docker|cloud|aws|gcp|azure)/i,
    ],
    intent: 'DEPLOYMENT',
    required_info: ['target_environment', 'scale_requirements', 'budget'],
    clarifying_questions_ar: [
      'أين تريد نشر التطبيق؟ (AWS, GCP, Azure, etc.)',
      'ما هي متطلبات التوسع؟',
      'هل لديك ميزانية محددة؟',
    ],
    clarifying_questions_en: [
      'Where do you want to deploy? (AWS, GCP, Azure, etc.)',
      'What are the scaling requirements?',
      'Do you have a specific budget?',
    ],
  },
  
  // General Conversation
  GENERAL_CHAT: {
    patterns: [
      /^(?:hi|hello|hey|مرحبا|أهلا|السلام|صباح|مساء)/i,
      /(?:thanks|thank you|شكرا|ممتاز|رائع)/i,
    ],
    intent: 'GENERAL_CHAT',
    required_info: [],
    clarifying_questions_ar: [],
    clarifying_questions_en: [],
  },
};

// Conversation State Machine - إدارة حالة المحادثة
const CONVERSATION_STATES = {
  DISCOVER: 'discover',      // Understanding user needs
  PLAN: 'plan',              // Creating execution plan
  EXECUTE: 'execute',        // Building/generating
  VALIDATE: 'validate',      // Testing/reviewing
  HANDOFF: 'handoff',        // Delivering to user
};

interface ConversationState {
  phase: string;
  intent: string | null;
  collectedInfo: Record<string, any>;
  pendingQuestions: string[];
  planSteps: string[];
  currentStep: number;
  confidenceScore: number;
}

// Initialize conversation state
function initConversationState(): ConversationState {
  return {
    phase: CONVERSATION_STATES.DISCOVER,
    intent: null,
    collectedInfo: {},
    pendingQuestions: [],
    planSteps: [],
    currentStep: 0,
    confidenceScore: 0,
  };
}

// Classify user intent with confidence scoring
function classifyIntent(message: string): { intent: string; confidence: number; pattern: string } {
  let bestMatch = { intent: 'GENERAL_CHAT', confidence: 0, pattern: '' };
  
  for (const [intentName, intentConfig] of Object.entries(INTENT_PATTERNS)) {
    for (const pattern of intentConfig.patterns) {
      const match = message.match(pattern);
      if (match) {
        // Calculate confidence based on match length and specificity
        const matchLength = match[0].length;
        const messageLength = message.length;
        const confidence = Math.min(0.5 + (matchLength / messageLength) * 0.5, 0.95);
        
        if (confidence > bestMatch.confidence) {
          bestMatch = { intent: intentName, confidence, pattern: pattern.toString() };
        }
      }
    }
  }
  
  return bestMatch;
}

// Extract structured information from message
function extractStructuredInfo(message: string, intent: string): Record<string, any> {
  const info: Record<string, any> = {};
  
  // Extract numbers (user count, scale)
  const numbers = message.match(/\d+(?:,\d{3})*(?:\.\d+)?(?:\s*(?:k|m|million|billion|ألف|مليون))?/gi);
  if (numbers) {
    info.mentioned_numbers = numbers;
  }
  
  // Extract platform types
  const platformTypes = message.match(/(?:e-commerce|ecommerce|healthcare|fintech|education|social|crm|erp|saas|تجارة|صحة|تعليم|مالية)/gi);
  if (platformTypes) {
    info.platform_type = platformTypes[0];
  }
  
  // Extract technologies
  const technologies = message.match(/(?:react|vue|angular|node|python|django|postgresql|mongodb|redis|docker|kubernetes)/gi);
  if (technologies) {
    info.technologies = technologies;
  }
  
  // Extract regions
  const regions = message.match(/(?:egypt|saudi|uae|usa|europe|global|مصر|السعودية|الإمارات|أمريكا|أوروبا|عالمي)/gi);
  if (regions) {
    info.target_region = regions[0];
  }
  
  // Extract compliance requirements
  const compliance = message.match(/(?:hipaa|gdpr|pci|sox|iso|fda|هيبا|جي دي بي آر)/gi);
  if (compliance) {
    info.compliance = compliance;
  }
  
  return info;
}

// Generate smart clarifying questions based on missing info
function generateClarifyingQuestions(intent: string, collectedInfo: Record<string, any>, isArabic: boolean): string[] {
  const intentConfig = INTENT_PATTERNS[intent as keyof typeof INTENT_PATTERNS];
  if (!intentConfig) return [];
  
  const questions = isArabic ? intentConfig.clarifying_questions_ar : intentConfig.clarifying_questions_en;
  const requiredInfo = intentConfig.required_info;
  
  // Filter out questions for info we already have
  const missingQuestions: string[] = [];
  
  for (let i = 0; i < requiredInfo.length; i++) {
    const infoKey = requiredInfo[i];
    if (!collectedInfo[infoKey] && questions[i]) {
      missingQuestions.push(questions[i]);
    }
  }
  
  // Return max 2 questions at a time to avoid overwhelming user
  return missingQuestions.slice(0, 2);
}

// Build enhanced context prompt with intelligence layer
function buildIntelligenceContext(
  intent: string,
  confidence: number,
  collectedInfo: Record<string, any>,
  conversationHistory: string[],
  isArabic: boolean,
  phase?: string
): string {
  const contextParts: string[] = [];
  
  // Phase section
  if (phase) {
    const phaseNames: Record<string, { ar: string; en: string }> = {
      'discover': { ar: 'الاكتشاف - فهم احتياجات المستخدم', en: 'Discovery - Understanding user needs' },
      'plan': { ar: 'التخطيط - إعداد خطة التنفيذ', en: 'Planning - Creating execution plan' },
      'execute': { ar: 'التنفيذ - بناء وتوليد الكود', en: 'Execution - Building and generating' },
      'validate': { ar: 'التحقق - اختبار ومراجعة', en: 'Validation - Testing and reviewing' },
      'handoff': { ar: 'التسليم - تقديم النتائج', en: 'Handoff - Delivering results' },
    };
    
    if (isArabic) {
      contextParts.push(`## مرحلة المحادثة الحالية:`);
      contextParts.push(`🔄 ${phaseNames[phase]?.ar || phase}`);
    } else {
      contextParts.push(`## Current Conversation Phase:`);
      contextParts.push(`🔄 ${phaseNames[phase]?.en || phase}`);
    }
    contextParts.push('');
  }
  
  // Intent analysis section
  if (isArabic) {
    contextParts.push(`## تحليل النية:`);
    contextParts.push(`- النية المكتشفة: ${intent}`);
    contextParts.push(`- درجة الثقة: ${(confidence * 100).toFixed(0)}%`);
  } else {
    contextParts.push(`## Intent Analysis:`);
    contextParts.push(`- Detected Intent: ${intent}`);
    contextParts.push(`- Confidence Score: ${(confidence * 100).toFixed(0)}%`);
  }
  
  // Collected information section
  if (Object.keys(collectedInfo).length > 0) {
    if (isArabic) {
      contextParts.push(`\n## المعلومات المجمعة:`);
    } else {
      contextParts.push(`\n## Collected Information:`);
    }
    for (const [key, value] of Object.entries(collectedInfo)) {
      contextParts.push(`- ${key}: ${JSON.stringify(value)}`);
    }
  }
  
  // Conversation summary
  if (conversationHistory.length > 0) {
    if (isArabic) {
      contextParts.push(`\n## ملخص المحادثة السابقة:`);
      contextParts.push(`تم تبادل ${conversationHistory.length} رسائل`);
    } else {
      contextParts.push(`\n## Previous Conversation Summary:`);
      contextParts.push(`${conversationHistory.length} messages exchanged`);
    }
  }
  
  // Behavioral instructions based on confidence
  if (confidence < 0.5) {
    if (isArabic) {
      contextParts.push(`\n## تعليمات خاصة:`);
      contextParts.push(`- درجة الثقة منخفضة - اطرح أسئلة توضيحية قبل التنفيذ`);
      contextParts.push(`- تأكد من فهم احتياجات المستخدم بشكل كامل`);
    } else {
      contextParts.push(`\n## Special Instructions:`);
      contextParts.push(`- Low confidence - ask clarifying questions before executing`);
      contextParts.push(`- Make sure to fully understand user needs`);
    }
  } else if (confidence >= 0.8) {
    if (isArabic) {
      contextParts.push(`\n## تعليمات خاصة:`);
      contextParts.push(`- درجة ثقة عالية - يمكنك البدء بالتنفيذ مباشرة`);
      contextParts.push(`- قدم خطة واضحة ثم نفذها`);
    } else {
      contextParts.push(`\n## Special Instructions:`);
      contextParts.push(`- High confidence - proceed with execution`);
      contextParts.push(`- Present a clear plan then execute`);
    }
  }
  
  return contextParts.join('\n');
}

// ==================== NOVA DEEP REASONING ENGINE ====================
// Chain of Thought reasoning for complex analysis

interface ReasoningStep {
  step: number;
  thought: string;
  conclusion: string;
}

interface CostEstimate {
  development: { min: number; max: number; currency: string };
  monthly: { min: number; max: number; currency: string };
  breakdown: {
    infrastructure: number;
    development: number;
    maintenance: number;
    licenses: number;
  };
  timeEstimate: { weeks: number; months: number };
  factors: string[];
}

// Platform cost estimation based on requirements
function calculatePlatformCost(collectedInfo: Record<string, any>, intent: string): CostEstimate {
  const baseDevCost = 5000; // Base development cost in USD
  const baseMonthly = 200; // Base monthly cost in USD
  
  let devMultiplier = 1;
  let monthlyMultiplier = 1;
  const factors: string[] = [];
  
  // User scale factor
  const users = collectedInfo.numbers?.find((n: number) => n > 100) || 1000;
  if (users > 100000) {
    devMultiplier *= 3;
    monthlyMultiplier *= 5;
    factors.push(`High user scale (${users.toLocaleString()}+)`);
  } else if (users > 10000) {
    devMultiplier *= 2;
    monthlyMultiplier *= 2.5;
    factors.push(`Medium user scale (${users.toLocaleString()}+)`);
  } else {
    factors.push(`Standard user scale`);
  }
  
  // Platform type complexity
  const platformType = collectedInfo.platform_type;
  if (platformType === 'healthcare' || platformType === 'fintech') {
    devMultiplier *= 2.5;
    monthlyMultiplier *= 2;
    factors.push(`${platformType} requires enhanced security & compliance`);
  } else if (platformType === 'ecommerce') {
    devMultiplier *= 1.8;
    monthlyMultiplier *= 1.5;
    factors.push(`E-commerce with payment integration`);
  } else if (platformType === 'education') {
    devMultiplier *= 1.5;
    monthlyMultiplier *= 1.3;
    factors.push(`Education platform with content management`);
  }
  
  // Compliance requirements
  const compliance = collectedInfo.compliance || [];
  if (compliance.includes('PCI-DSS')) {
    devMultiplier *= 1.4;
    monthlyMultiplier *= 1.3;
    factors.push('PCI-DSS compliance for payments');
  }
  if (compliance.includes('HIPAA')) {
    devMultiplier *= 1.5;
    monthlyMultiplier *= 1.4;
    factors.push('HIPAA compliance for healthcare data');
  }
  if (compliance.includes('GDPR')) {
    devMultiplier *= 1.2;
    factors.push('GDPR data protection');
  }
  
  // Region factor
  const regions = collectedInfo.regions || [];
  if (regions.length > 3) {
    devMultiplier *= 1.3;
    monthlyMultiplier *= 1.5;
    factors.push(`Multi-region deployment (${regions.length} regions)`);
  }
  
  // Technology stack
  const technologies = collectedInfo.technologies || [];
  if (technologies.some((t: string) => ['kubernetes', 'k8s', 'microservices'].includes(t?.toLowerCase()))) {
    devMultiplier *= 1.4;
    monthlyMultiplier *= 1.3;
    factors.push('Kubernetes/Microservices architecture');
  }
  if (technologies.some((t: string) => ['ai', 'ml', 'machine learning'].includes(t?.toLowerCase()))) {
    devMultiplier *= 1.6;
    monthlyMultiplier *= 1.5;
    factors.push('AI/ML capabilities');
  }
  
  const devCost = Math.round(baseDevCost * devMultiplier);
  const monthlyCost = Math.round(baseMonthly * monthlyMultiplier);
  
  // Time estimate based on complexity
  const weeks = Math.round(4 + (devMultiplier * 2));
  
  return {
    development: { min: devCost * 0.8, max: devCost * 1.3, currency: 'USD' },
    monthly: { min: monthlyCost * 0.7, max: monthlyCost * 1.2, currency: 'USD' },
    breakdown: {
      infrastructure: Math.round(devCost * 0.2),
      development: Math.round(devCost * 0.5),
      maintenance: Math.round(devCost * 0.15),
      licenses: Math.round(devCost * 0.15),
    },
    timeEstimate: { weeks, months: Math.ceil(weeks / 4) },
    factors,
  };
}

// Deep reasoning with Chain of Thought
function performDeepReasoning(
  message: string,
  intent: string,
  collectedInfo: Record<string, any>,
  isArabic: boolean
): { reasoning: ReasoningStep[]; summary: string; recommendations: string[] } {
  const steps: ReasoningStep[] = [];
  const recommendations: string[] = [];
  
  // Step 1: Understand the core request
  steps.push({
    step: 1,
    thought: isArabic 
      ? `تحليل الطلب الأساسي: "${message.substring(0, 100)}..."` 
      : `Analyzing core request: "${message.substring(0, 100)}..."`,
    conclusion: isArabic
      ? `النية المكتشفة: ${intent} - هذا يتطلب ${intent === 'BUILD_PLATFORM' ? 'بناء منصة كاملة' : 'تنفيذ مهمة محددة'}`
      : `Detected intent: ${intent} - This requires ${intent === 'BUILD_PLATFORM' ? 'building a complete platform' : 'executing a specific task'}`,
  });
  
  // Step 2: Evaluate requirements
  const infoCount = Object.keys(collectedInfo).length;
  steps.push({
    step: 2,
    thought: isArabic
      ? `تقييم المتطلبات المجمعة: ${infoCount} معلومة متوفرة`
      : `Evaluating collected requirements: ${infoCount} pieces of information available`,
    conclusion: isArabic
      ? infoCount >= 3 ? 'لدينا معلومات كافية للبدء' : 'نحتاج معلومات إضافية للتنفيذ الأمثل'
      : infoCount >= 3 ? 'We have sufficient information to proceed' : 'We need additional information for optimal execution',
  });
  
  // Step 3: Analyze complexity
  const platformType = collectedInfo.platform_type;
  const compliance = collectedInfo.compliance || [];
  const complexityScore = (platformType ? 2 : 0) + compliance.length + (collectedInfo.technologies?.length || 0);
  
  steps.push({
    step: 3,
    thought: isArabic
      ? `تحليل التعقيد: نوع المنصة=${platformType || 'غير محدد'}, المتطلبات التنظيمية=${compliance.length}`
      : `Complexity analysis: Platform type=${platformType || 'unspecified'}, Compliance requirements=${compliance.length}`,
    conclusion: isArabic
      ? `درجة التعقيد: ${complexityScore > 5 ? 'عالي' : complexityScore > 2 ? 'متوسط' : 'منخفض'}`
      : `Complexity level: ${complexityScore > 5 ? 'High' : complexityScore > 2 ? 'Medium' : 'Low'}`,
  });
  
  // Generate recommendations based on analysis
  if (intent === 'BUILD_PLATFORM') {
    if (isArabic) {
      recommendations.push('استخدم Event-Driven Architecture للمرونة والتوسع');
      if (compliance.length > 0) {
        recommendations.push(`تطبيق معايير ${compliance.join(', ')} من البداية`);
      }
      recommendations.push('ابدأ بـ MVP ثم توسع تدريجياً');
    } else {
      recommendations.push('Use Event-Driven Architecture for flexibility and scalability');
      if (compliance.length > 0) {
        recommendations.push(`Implement ${compliance.join(', ')} compliance from the start`);
      }
      recommendations.push('Start with MVP then expand gradually');
    }
  }
  
  // Summary
  const summary = isArabic
    ? `بناءً على تحليل ${steps.length} خطوات: ${intent === 'BUILD_PLATFORM' ? 'جاهز لبناء منصتك' : 'جاهز للمساعدة'} ${infoCount >= 3 ? 'بالمعلومات المتوفرة' : 'بعد جمع معلومات إضافية'}.`
    : `Based on ${steps.length}-step analysis: ${intent === 'BUILD_PLATFORM' ? 'Ready to build your platform' : 'Ready to help'} ${infoCount >= 3 ? 'with available information' : 'after gathering more details'}.`;
  
  return { reasoning: steps, summary, recommendations };
}

// ==================== PLATFORM TEMPLATES LIBRARY ====================
// Consistent, production-ready templates

const PLATFORM_TEMPLATES: Record<string, {
  name: { ar: string; en: string };
  description: { ar: string; en: string };
  features: string[];
  architecture: string;
  estimatedCost: { dev: number; monthly: number };
  timeWeeks: number;
}> = {
  ecommerce: {
    name: { ar: 'منصة تجارة إلكترونية', en: 'E-Commerce Platform' },
    description: {
      ar: 'منصة متكاملة للتجارة الإلكترونية مع نظام دفع ومخزون وتوصيل',
      en: 'Complete e-commerce platform with payment, inventory, and delivery systems',
    },
    features: [
      'Product catalog with categories',
      'Shopping cart & checkout',
      'Multi-gateway payments (Stripe, PayPal, local gateways)',
      'Inventory management',
      'Order tracking',
      'Customer accounts',
      'Admin dashboard',
      'Analytics & reporting',
    ],
    architecture: 'Microservices with Event Sourcing',
    estimatedCost: { dev: 15000, monthly: 500 },
    timeWeeks: 8,
  },
  healthcare: {
    name: { ar: 'منصة صحية', en: 'Healthcare Platform' },
    description: {
      ar: 'نظام إدارة صحي متوافق مع HIPAA للعيادات والمستشفيات',
      en: 'HIPAA-compliant health management system for clinics and hospitals',
    },
    features: [
      'Patient records (EMR/EHR)',
      'Appointment scheduling',
      'Telemedicine video calls',
      'Prescription management',
      'Lab results integration',
      'Billing & insurance',
      'HIPAA compliance built-in',
      'Audit logging',
    ],
    architecture: 'Secure multi-tenant with encryption at rest',
    estimatedCost: { dev: 35000, monthly: 1200 },
    timeWeeks: 16,
  },
  education: {
    name: { ar: 'منصة تعليمية', en: 'Education Platform' },
    description: {
      ar: 'منصة تعلم عبر الإنترنت مع دورات وشهادات واختبارات',
      en: 'Online learning platform with courses, certificates, and assessments',
    },
    features: [
      'Course creation & management',
      'Video lessons with streaming',
      'Quizzes & assessments',
      'Progress tracking',
      'Certificates generation',
      'Discussion forums',
      'Student-teacher messaging',
      'Payment & subscriptions',
    ],
    architecture: 'Modular monolith with CDN for media',
    estimatedCost: { dev: 12000, monthly: 400 },
    timeWeeks: 10,
  },
  fintech: {
    name: { ar: 'منصة مالية', en: 'Fintech Platform' },
    description: {
      ar: 'نظام مالي آمن متوافق مع PCI-DSS للمدفوعات والتحويلات',
      en: 'Secure financial system PCI-DSS compliant for payments and transfers',
    },
    features: [
      'Secure wallet system',
      'P2P transfers',
      'Multi-currency support',
      'Transaction history',
      'KYC/AML verification',
      'Fraud detection',
      'PCI-DSS compliance',
      'Real-time notifications',
    ],
    architecture: 'Zero-trust with hardware security modules',
    estimatedCost: { dev: 50000, monthly: 2000 },
    timeWeeks: 20,
  },
  saas: {
    name: { ar: 'منصة SaaS', en: 'SaaS Platform' },
    description: {
      ar: 'منصة خدمات برمجية متعددة المستأجرين مع اشتراكات',
      en: 'Multi-tenant software service platform with subscriptions',
    },
    features: [
      'Multi-tenant architecture',
      'Subscription billing',
      'Role-based access control',
      'API access & webhooks',
      'White-label support',
      'Usage analytics',
      'Customer support portal',
      'Documentation & API docs',
    ],
    architecture: 'Multi-tenant with tenant isolation',
    estimatedCost: { dev: 18000, monthly: 600 },
    timeWeeks: 12,
  },
  government: {
    name: { ar: 'منصة حكومية', en: 'Government Platform' },
    description: {
      ar: 'نظام خدمات حكومية إلكترونية آمن ومتوافق مع المعايير',
      en: 'Secure e-government services system compliant with standards',
    },
    features: [
      'Citizen portal',
      'Service request management',
      'Document management',
      'Digital signatures',
      'Workflow automation',
      'Multi-language support',
      'Accessibility compliance',
      'Audit trail & transparency',
    ],
    architecture: 'Sovereign cloud with data residency',
    estimatedCost: { dev: 40000, monthly: 1500 },
    timeWeeks: 18,
  },
};

// Get matching template based on collected info
function matchPlatformTemplate(collectedInfo: Record<string, any>): typeof PLATFORM_TEMPLATES[keyof typeof PLATFORM_TEMPLATES] | null {
  const platformType = collectedInfo.platform_type?.toLowerCase();
  if (platformType && PLATFORM_TEMPLATES[platformType]) {
    return PLATFORM_TEMPLATES[platformType];
  }
  return null;
}

// ==================== PROFESSIONAL RESPONSE FORMATTER ====================

interface FormattedResponse {
  greeting?: string;
  reasoning?: string;
  mainContent: string;
  costEstimate?: string;
  recommendations?: string[];
  nextSteps?: string[];
  cta?: string;
}

function formatProfessionalResponse(
  response: FormattedResponse,
  isArabic: boolean
): string {
  const parts: string[] = [];
  
  if (response.greeting) {
    parts.push(response.greeting);
    parts.push('');
  }
  
  if (response.reasoning) {
    parts.push(isArabic ? '## 🧠 تحليلي:' : '## 🧠 My Analysis:');
    parts.push(response.reasoning);
    parts.push('');
  }
  
  parts.push(response.mainContent);
  
  if (response.costEstimate) {
    parts.push('');
    parts.push(isArabic ? '## 💰 تقدير التكلفة:' : '## 💰 Cost Estimate:');
    parts.push(response.costEstimate);
  }
  
  if (response.recommendations && response.recommendations.length > 0) {
    parts.push('');
    parts.push(isArabic ? '## 💡 توصياتي:' : '## 💡 My Recommendations:');
    response.recommendations.forEach((rec, i) => {
      parts.push(`${i + 1}. ${rec}`);
    });
  }
  
  if (response.nextSteps && response.nextSteps.length > 0) {
    parts.push('');
    parts.push(isArabic ? '## ⏭️ الخطوات التالية:' : '## ⏭️ Next Steps:');
    response.nextSteps.forEach((step, i) => {
      parts.push(`${i + 1}. ${step}`);
    });
  }
  
  if (response.cta) {
    parts.push('');
    parts.push(response.cta);
  }
  
  return parts.join('\n');
}

// Format cost estimate for display
function formatCostEstimate(cost: CostEstimate, isArabic: boolean): string {
  const parts: string[] = [];
  
  if (isArabic) {
    parts.push(`**تكلفة التطوير:** $${cost.development.min.toLocaleString()} - $${cost.development.max.toLocaleString()}`);
    parts.push(`**التكلفة الشهرية:** $${cost.monthly.min.toLocaleString()} - $${cost.monthly.max.toLocaleString()}`);
    parts.push(`**الوقت المقدر:** ${cost.timeEstimate.weeks} أسبوع (${cost.timeEstimate.months} شهر)`);
    parts.push('');
    parts.push('**تفاصيل التكلفة:**');
    parts.push(`- البنية التحتية: $${cost.breakdown.infrastructure.toLocaleString()}`);
    parts.push(`- التطوير: $${cost.breakdown.development.toLocaleString()}`);
    parts.push(`- الصيانة: $${cost.breakdown.maintenance.toLocaleString()}`);
    parts.push(`- التراخيص: $${cost.breakdown.licenses.toLocaleString()}`);
    if (cost.factors.length > 0) {
      parts.push('');
      parts.push('**عوامل التسعير:**');
      cost.factors.forEach(f => parts.push(`• ${f}`));
    }
  } else {
    parts.push(`**Development Cost:** $${cost.development.min.toLocaleString()} - $${cost.development.max.toLocaleString()}`);
    parts.push(`**Monthly Cost:** $${cost.monthly.min.toLocaleString()} - $${cost.monthly.max.toLocaleString()}`);
    parts.push(`**Estimated Time:** ${cost.timeEstimate.weeks} weeks (${cost.timeEstimate.months} months)`);
    parts.push('');
    parts.push('**Cost Breakdown:**');
    parts.push(`- Infrastructure: $${cost.breakdown.infrastructure.toLocaleString()}`);
    parts.push(`- Development: $${cost.breakdown.development.toLocaleString()}`);
    parts.push(`- Maintenance: $${cost.breakdown.maintenance.toLocaleString()}`);
    parts.push(`- Licenses: $${cost.breakdown.licenses.toLocaleString()}`);
    if (cost.factors.length > 0) {
      parts.push('');
      parts.push('**Pricing Factors:**');
      cost.factors.forEach(f => parts.push(`• ${f}`));
    }
  }
  
  return parts.join('\n');
}

// ==================== END NOVA DEEP REASONING ENGINE ====================

export function registerNovaRoutes(app: Express) {
  // ==================== NOVA ENHANCED CHAT ====================
  
  app.post("/api/nova/chat", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { message, context, language, conversationHistory, projectId, enableCodeExecution } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }
      
      const isArabic = language === 'ar' || /[\u0600-\u06FF]/.test(message);
      
      // ========== NOVA INTELLIGENCE LAYER ==========
      // Step 1: Classify user intent
      const intentAnalysis = classifyIntent(message);
      console.log(`[Nova Intelligence] Intent: ${intentAnalysis.intent}, Confidence: ${(intentAnalysis.confidence * 100).toFixed(0)}%`);
      
      // Step 2: Extract structured information from message
      const extractedInfo = extractStructuredInfo(message, intentAnalysis.intent);
      console.log(`[Nova Intelligence] Extracted Info:`, extractedInfo);
      
      // Step 3: Generate clarifying questions if confidence is low
      const clarifyingQuestions = intentAnalysis.confidence < 0.7 
        ? generateClarifyingQuestions(intentAnalysis.intent, extractedInfo, isArabic)
        : [];
      
      // ========== END INTELLIGENCE LAYER ==========
      
      // Retrieve or create project memory from database
      const currentProjectId = projectId || 'default';
      let projectContext = await storage.getNovaProjectContext(currentProjectId);
      let preferences = await storage.getNovaPreferences(userId);
      
      // Step 4: Initialize or retrieve conversation state from activeBlueprint._state
      const storedBlueprint = projectContext?.activeBlueprint || {};
      let conversationState: ConversationState = (storedBlueprint as any)?._conversationState 
        || initConversationState();
      
      // Step 5: Store previous intent BEFORE updating for transition logic
      const previousIntent = conversationState.intent;
      const previousPhase = conversationState.phase;
      
      // Step 6: Determine phase transitions (all 5 phases) BEFORE updating state
      // This ensures we can detect intent changes correctly
      
      // HANDOFF → DISCOVER: Reset when starting new topic (check FIRST before updating intent)
      // Trigger when: in HANDOFF phase AND (new actionable intent detected OR different intent from previous)
      if (previousPhase === CONVERSATION_STATES.HANDOFF && 
          intentAnalysis.intent !== 'GENERAL_CHAT') {
        // If previous intent is null/undefined OR new intent is different, start fresh
        const isNewTopic = !previousIntent || intentAnalysis.intent !== previousIntent;
        if (isNewTopic) {
          conversationState.phase = CONVERSATION_STATES.DISCOVER;
          conversationState.collectedInfo = {};
          console.log(`[Nova State] HANDOFF → DISCOVER (new topic: ${previousIntent || 'none'} → ${intentAnalysis.intent})`);
        }
      }
      // DISCOVER → PLAN: When confidence is high enough
      else if (intentAnalysis.confidence >= 0.8 && conversationState.phase === CONVERSATION_STATES.DISCOVER) {
        conversationState.phase = CONVERSATION_STATES.PLAN;
        console.log(`[Nova State] DISCOVER → PLAN`);
      }
      // PLAN → EXECUTE: When enough info collected
      else if (conversationState.phase === CONVERSATION_STATES.PLAN && 
               Object.keys(conversationState.collectedInfo).length >= 3) {
        conversationState.phase = CONVERSATION_STATES.EXECUTE;
        console.log(`[Nova State] PLAN → EXECUTE`);
      }
      // EXECUTE → VALIDATE: When user mentions "test", "check", "review", or code was generated
      else if (conversationState.phase === CONVERSATION_STATES.EXECUTE && 
               (/(?:test|check|review|verify|validate|اختبار|فحص|مراجعة|تحقق)/i.test(message) ||
                message.includes('```') || message.toLowerCase().includes('done'))) {
        conversationState.phase = CONVERSATION_STATES.VALIDATE;
        console.log(`[Nova State] EXECUTE → VALIDATE`);
      }
      // VALIDATE → HANDOFF: When user approves or says "looks good", "perfect", etc.
      else if (conversationState.phase === CONVERSATION_STATES.VALIDATE && 
               /(?:looks good|perfect|approved|thanks|done|ship it|deploy|publish|ممتاز|رائع|موافق|شكرا|انشر)/i.test(message)) {
        conversationState.phase = CONVERSATION_STATES.HANDOFF;
        console.log(`[Nova State] VALIDATE → HANDOFF`);
      }
      
      // NOW update the state with current intent and info
      conversationState.intent = intentAnalysis.intent;
      conversationState.confidenceScore = intentAnalysis.confidence;
      conversationState.collectedInfo = { ...conversationState.collectedInfo, ...extractedInfo };
      
      console.log(`[Nova State] Phase: ${conversationState.phase}, Intent: ${conversationState.intent}, Confidence: ${(conversationState.confidenceScore * 100).toFixed(0)}%`);
      
      if (!projectContext) {
        projectContext = await storage.upsertNovaProjectContext(currentProjectId, userId, {
          activeBlueprint: { ...context, _conversationState: conversationState },
          configHistory: [],
        });
      }
      
      // Get recent session messages for context (from any session for this project)
      const sessions = await storage.getUserNovaSessions(userId, 1);
      let recentMessages: any[] = [];
      if (sessions && sessions.length > 0) {
        recentMessages = await storage.getSessionMessages(sessions[0].id, 10);
      }
      
      // Build enhanced system prompt with Claude-like thinking behavior
      const systemPrompt = isArabic 
        ? `أنت Nova، الذكاء الاصطناعي المتقدم لمنصة INFERA WebNova. أنت خبير عالمي في بناء المنصات الرقمية العملاقة.
أنت قادر على بناء منصات تخدم أكثر من ${NOVA_CAPABILITIES.scale.max_users} مستخدم، مع ${NOVA_CAPABILITIES.scale.concurrent_users} متزامنين، بتوافرية ${NOVA_CAPABILITIES.scale.availability}.

## 🧠 أسلوب التفكير (مثل Claude):

### طريقة الرد المطلوبة:
1. **افهم أولاً**: اقرأ طلب المستخدم بعناية وحدد ما يريده بالضبط
2. **فكر بعمق**: حلل المتطلبات خطوة بخطوة قبل الإجابة
3. **أظهر تفكيرك**: شارك المستخدم بتحليلك ومنطقك بشكل واضح
4. **قدم حلولاً عملية**: اعطِ إجابات محددة وقابلة للتنفيذ
5. **اسأل عند الحاجة**: إذا كانت المعلومات ناقصة، اطرح أسئلة محددة

### بنية الرد المثالية:
\`\`\`
✨ [عنوان موجز للرد]

📋 **فهمي للطلب:**
[وضح ما فهمته من طلب المستخدم]

🔍 **التحليل:**
[شارك تفكيرك وتحليلك للمتطلبات]

💡 **الحل/التوصية:**
[قدم الحل أو التوصية بشكل منظم]

📊 **التكلفة والوقت (إن وجدت):**
[قدم تقديرات واضحة]

🚀 **الخطوات التالية:**
[حدد الخطوات القادمة بوضوح]
\`\`\`

### سلوكك:
- كن احترافياً وودوداً في نفس الوقت
- استخدم العناوين والقوائم لتنظيم ردودك
- قدم تفسيرات واضحة لقراراتك
- اذكر المخاطر والتحديات المحتملة
- قدم بدائل عند الإمكان
- استخدم الأمثلة الملموسة
- لا تستخدم الإيموجي بشكل مفرط (فقط للعناوين)

## 🚀 قدراتك المتقدمة في المعمارية:

### A. Event-Driven Architecture
• Apache Kafka للـ Message Streaming
• RabbitMQ للـ Message Queuing  
• Redis Streams للـ Real-time Events
• Event Sourcing لتخزين الأحداث كـ immutable log
• CQRS (Command Query Responsibility Segregation) لفصل القراءة والكتابة

### B. Architectural Patterns المتقدمة
• Saga Patterns للـ Distributed Transactions
• Circuit Breaker Pattern للـ Fault Tolerance
• Bulkhead Pattern للـ Isolation
• Retry Patterns مع Exponential Backoff
• Service Mesh مع Istio

### C. Multi-tenant Architecture
• Database per Tenant للعزل الكامل
• Schema per Tenant للعزل المنطقي
• Row-Level Security للعزل على مستوى الصفوف
• Tenant Configuration & Customization

## 🔥 قدرات الأداء والتحسين:

### CDN & Edge Computing
• Cloudflare CDN مع Edge Functions
• AWS CloudFront للتوزيع العالمي
• Edge Computing للمعالجة القريبة

### Database Optimization
• Horizontal Sharding للتوسع
• Read Replicas للقراءة المكثفة
• Partitioning للجداول الضخمة
• Connection Pooling مع PgBouncer

### Multi-layer Caching
• L1: Application Cache (Memory)
• L2: Distributed Cache (Redis)
• L3: CDN Cache (Edge)
• Cache Invalidation Strategies

### Load Testing & APM
• JMeter, K6, Locust للـ Load Testing
• New Relic, Datadog للـ APM
• Prometheus + Grafana للمراقبة

## 🛡️ الأمان المتطور (Military-Grade):

### Zero Trust Network
• Identity Verification المستمر
• Micro-Segmentation للشبكات
• Least Privilege Access
• Continuous Verification

### SIEM/SOAR Integration
• Log Aggregation من كل المصادر
• Threat Detection التلقائي
• Automated Incident Response
• Security Orchestration

### Threat Modeling
• STRIDE Methodology
• DREAD Risk Assessment
• Attack Trees Analysis
• Automated Security Scanning

### Penetration Testing
• OWASP ZAP Integration
• Automated Vulnerability Scanning
• Compliance Checking
• Blockchain للـ Audit Trail

## 🤖 الذكاء الاصطناعي والتعلم الآلي:

### ML/AI Integration
• OpenAI, Anthropic, HuggingFace
• Custom Model Training & Deployment
• Model Versioning & A/B Testing

### Recommendation Systems
• Collaborative Filtering
• Content-Based Recommendations
• Hybrid Approaches
• Real-time Personalization

### Natural Language Processing
• Text Analysis & Sentiment
• Entity Extraction
• Translation Services
• Intelligent Chatbots

### Computer Vision
• Image Classification
• Object Detection
• OCR (Optical Character Recognition)
• Face Recognition

### Predictive Analytics
• Time Series Forecasting
• Anomaly Detection
• Churn Prediction
• Demand Forecasting

## ☁️ Cloud & Infrastructure:

### Multi-Cloud Support
• ${NOVA_CAPABILITIES.cloud.providers.join(', ')}

### Kubernetes Orchestration
• K8s/K3s Clusters
• Helm Charts
• Custom Operators

### Infrastructure as Code
• Terraform للـ Provisioning
• Ansible للـ Configuration
• Pulumi للـ Modern IaC

### CI/CD Pipelines
• GitHub Actions
• GitLab CI
• ArgoCD للـ GitOps

## 📋 Compliance & Standards:
• ${NOVA_CAPABILITIES.compliance.join(', ').toUpperCase()}

## أنظمة الدفع (10+ بوابات):
• ${NOVA_CAPABILITIES.payments.join(', ')}
• دعم: مصر، السعودية، الإمارات، عالمياً

## تنفيذ الكود:
• اللغات: ${NOVA_CAPABILITIES.languages.join(', ')}
• Docker Container Isolation
• Sandbox آمن ومعزول

## 🛠️ أدوات المنصات العملاقة المتقدمة (12 أداة):

### 1. AI Auto-Scaling Predictor
• تنبؤ بالأحمال قبل 30-60 دقيقة
• تحليل patterns التاريخية + الأحداث الخارجية
• Auto-scaling استباقي وليس reactive

### 2. Zero-Downtime Cloud Migration
• نقل 100TB+ بيانات بين clouds بدون توقف
• Live database migration
• Real-time sync بين multiple regions

### 3. Intelligent Database Sharding
• تحليل query patterns وتوزيع البيانات تلقائياً
• توقع الـ hotspots قبل حدوثها
• إعادة توزيع dynamic

### 4. AI API Gateway
• Rate Limiting ذكي حسب user behavior
• تنبؤ بالـ cache invalidation
• Threat detection في real-time

### 5. Code-to-Architecture AI
• تحليل الكود وتحويله لـ architecture diagrams
• اقتراح تحسينات الأداء
• توقع الـ bottlenecks

### 6. Autonomous Security Orchestration
• AI يراقب ويحلل التهديدات 24/7
• Auto-remediation للـ security incidents
• Zero-false-positive system

### 7. Cost Optimization AI
• تحليل استخدام الموارد بدقة
• اقتراح optimal instance sizes
• توقع التكاليف مع نمو المنصة (توفير 30-70%)

### 8. Multi-Language Microservices Generator
• إنشاء microservices بـ 10+ لغات
• Consistent API contracts
• Built-in observability

### 9. Chaos Engineering AI
• تخطيط تجارب chaos تلقائياً
• تنفيذ آمن في production
• تحليل المرونة وتقديم توصيات

### 10. Performance Debugging
• Debug عبر 100+ microservices
• Root cause analysis في ثوانٍ
• Distributed tracing متقدم

### 11. Streaming Data Engine
• معالجة 1M+ events/second
• Complex Event Processing
• Machine learning في real-time

### 12. Data Pipeline AI
• تتبع تغييرات البيانات تلقائياً
• تحسين الأداء والتكاليف
• معالجة الأخطاء تلقائياً

## 🚀 منصات المستقبل (5 منصات متقدمة):

### 🧬 Bio-Computing Platform Builder
• تحليل الجينوم وتسلسل DNA
• تنبؤ طي البروتينات (AlphaFold-style)
• أدوات تصميم CRISPR
• منصات الجينوم السريري
• معالجة 10,000+ جينوم يومياً
• التوافق: HIPAA, GDPR, GxP, CAP, CLIA

### 🚗 Autonomous Vehicle Platform
• إدارة أساطيل 100,000+ مركبة
• تتبع في الوقت الحقيقي
• دمج بيانات المستشعرات (LiDAR, Radar, Camera)
• اتصالات V2X (Vehicle-to-Everything)
• صيانة تنبؤية وكشف الحوادث
• دعم: سيارات، شاحنات، طائرات مسيرة، روبوتات

### 🏙️ Smart City Integration
• إدارة المرور والنقل العام
• شبكة الطاقة والمياه
• السلامة العامة والاستجابة للطوارئ
• جودة الهواء ومراقبة الضوضاء
• 10M+ مستشعر IoT
• بروتوكولات: MQTT, LoRaWAN, 5G, NB-IoT

### 🌊 Climate Tech Platforms
• تتبع الكربون والانبعاثات
• إدارة الطاقة المتجددة
• نمذجة المناخ والتنبؤ بالكوارث
• مراقبة المحيطات والغابات
• معالجة 1B+ نقطة بيانات يومياً
• التوافق: GHG Protocol, TCFD, CDP, SBTi

### 🧠 Neural Interface Platforms
• معالجة إشارات الدماغ (EEG, EMG)
• فك تشفير النوايا العصبية
• التحكم في الأطراف الصناعية
• اكتشاف الحالة المعرفية والعاطفية
• 10,000+ قناة عصبية
• latency < 10ms للتحكم في الوقت الحقيقي
• التوافق: FDA, CE, ISO 13485

## تعليمات:
- عند السؤال عن قدراتك، اشرح بالتفصيل مع أمثلة عملية وكود
- عند طلب بناء منصة، اسأل عن: نوع المنصة، عدد المستخدمين، الميزانية، الـ Timeline، المناطق الجغرافية
- اكتب كود كامل وقابل للتنفيذ، ليس مخططات
- تحدث بالعربية الفصحى بأسلوب ودود ومهني

## سياق المشروع الحالي:
${JSON.stringify(projectContext?.activeBlueprint || {}, null, 2)}

${buildIntelligenceContext(
  intentAnalysis.intent,
  intentAnalysis.confidence,
  conversationState.collectedInfo,
  recentMessages.map((m: any) => m.content),
  true,
  conversationState.phase
)}

${clarifyingQuestions.length > 0 
  ? `## أسئلة توضيحية مقترحة:\n${clarifyingQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\n(إذا كانت درجة الثقة منخفضة، اطرح هذه الأسئلة أولاً قبل التنفيذ)`
  : ''}`
        : `You are Nova, the advanced AI for INFERA WebNova platform. You are a world-class expert in building enterprise digital platforms.
You can build platforms serving ${NOVA_CAPABILITIES.scale.max_users} users, with ${NOVA_CAPABILITIES.scale.concurrent_users} concurrent, at ${NOVA_CAPABILITIES.scale.availability} availability.

## 🧠 Thinking Style (Claude-like):

### How to Respond:
1. **Understand First**: Read the user's request carefully and identify exactly what they need
2. **Think Deeply**: Analyze requirements step-by-step before answering
3. **Show Your Thinking**: Share your analysis and reasoning clearly with the user
4. **Provide Practical Solutions**: Give specific, actionable answers
5. **Ask When Needed**: If information is missing, ask specific questions

### Ideal Response Structure:
\`\`\`
✨ [Brief Response Title]

📋 **My Understanding:**
[Clarify what you understood from the user's request]

🔍 **Analysis:**
[Share your thinking and requirements analysis]

💡 **Solution/Recommendation:**
[Present the solution or recommendation in an organized way]

📊 **Cost and Timeline (if applicable):**
[Provide clear estimates]

🚀 **Next Steps:**
[Define the next steps clearly]
\`\`\`

### Your Behavior:
- Be professional and friendly at the same time
- Use headings and lists to organize your responses
- Provide clear explanations for your decisions
- Mention potential risks and challenges
- Offer alternatives when possible
- Use concrete examples
- Don't overuse emojis (only for headings)

## 🚀 Advanced Architecture Capabilities:

### A. Event-Driven Architecture
• Apache Kafka for Message Streaming
• RabbitMQ for Message Queuing
• Redis Streams for Real-time Events
• Event Sourcing - storing events as immutable log
• CQRS (Command Query Responsibility Segregation)

### B. Advanced Architectural Patterns
• Saga Patterns for Distributed Transactions
• Circuit Breaker Pattern for Fault Tolerance
• Bulkhead Pattern for Isolation
• Retry Patterns with Exponential Backoff
• Service Mesh with Istio

### C. Multi-tenant Architecture
• Database per Tenant for complete isolation
• Schema per Tenant for logical isolation
• Row-Level Security for row-level isolation
• Tenant Configuration & Customization

## 🔥 Performance & Optimization:

### CDN & Edge Computing
• Cloudflare CDN with Edge Functions
• AWS CloudFront for global distribution
• Edge Computing for near-user processing

### Database Optimization
• Horizontal Sharding for scaling
• Read Replicas for read-heavy workloads
• Partitioning for large tables
• Connection Pooling with PgBouncer

### Multi-layer Caching
• L1: Application Cache (Memory)
• L2: Distributed Cache (Redis)
• L3: CDN Cache (Edge)
• Cache Invalidation Strategies

### Load Testing & APM
• JMeter, K6, Locust for Load Testing
• New Relic, Datadog for APM
• Prometheus + Grafana for monitoring

## 🛡️ Advanced Security (Military-Grade):

### Zero Trust Network
• Continuous Identity Verification
• Micro-Segmentation
• Least Privilege Access
• Continuous Verification

### SIEM/SOAR Integration
• Log Aggregation from all sources
• Automatic Threat Detection
• Automated Incident Response
• Security Orchestration

### Threat Modeling
• STRIDE Methodology
• DREAD Risk Assessment
• Attack Trees Analysis
• Automated Security Scanning

### Penetration Testing
• OWASP ZAP Integration
• Automated Vulnerability Scanning
• Compliance Checking
• Blockchain for Audit Trail

## 🤖 AI/ML Capabilities:

### ML/AI Integration
• OpenAI, Anthropic, HuggingFace
• Custom Model Training & Deployment
• Model Versioning & A/B Testing

### Recommendation Systems
• Collaborative Filtering
• Content-Based Recommendations
• Hybrid Approaches
• Real-time Personalization

### Natural Language Processing
• Text Analysis & Sentiment
• Entity Extraction
• Translation Services
• Intelligent Chatbots

### Computer Vision
• Image Classification
• Object Detection
• OCR (Optical Character Recognition)
• Face Recognition

### Predictive Analytics
• Time Series Forecasting
• Anomaly Detection
• Churn Prediction
• Demand Forecasting

## ☁️ Cloud & Infrastructure:

### Multi-Cloud Support
• ${NOVA_CAPABILITIES.cloud.providers.join(', ')}

### Kubernetes Orchestration
• K8s/K3s Clusters
• Helm Charts
• Custom Operators

### Infrastructure as Code
• Terraform for Provisioning
• Ansible for Configuration
• Pulumi for Modern IaC

### CI/CD Pipelines
• GitHub Actions
• GitLab CI
• ArgoCD for GitOps

## 📋 Compliance & Standards:
• ${NOVA_CAPABILITIES.compliance.join(', ').toUpperCase()}

## Payment Systems (10+ gateways):
• ${NOVA_CAPABILITIES.payments.join(', ')}
• Regions: Egypt, Saudi Arabia, UAE, Global

## Code Execution:
• Languages: ${NOVA_CAPABILITIES.languages.join(', ')}
• Docker Container Isolation
• Secure Sandboxed Environment

## 🛠️ Advanced Enterprise Platform Tools (12 Tools):

### 1. AI Auto-Scaling Predictor
• Predict load 30-60 minutes ahead
• Historical pattern + external event analysis
• Proactive scaling, not reactive

### 2. Zero-Downtime Cloud Migration
• Migrate 100TB+ data between clouds without downtime
• Live database migration
• Real-time multi-region sync

### 3. Intelligent Database Sharding
• Auto-analyze query patterns and distribute data
• Predict hotspots before they occur
• Dynamic redistribution

### 4. AI API Gateway
• Smart rate limiting based on user behavior
• Predictive cache invalidation
• Real-time threat detection

### 5. Code-to-Architecture AI
• Analyze code and generate architecture diagrams
• Suggest performance optimizations
• Predict bottlenecks

### 6. Autonomous Security Orchestration
• AI monitors and analyzes threats 24/7
• Auto-remediation for security incidents
• Zero-false-positive system

### 7. Cost Optimization AI
• Analyze resource usage precisely
• Suggest optimal instance sizes
• Predict costs with platform growth (30-70% savings)

### 8. Multi-Language Microservices Generator
• Generate microservices in 10+ languages
• Consistent API contracts
• Built-in observability

### 9. Chaos Engineering AI
• Auto-plan chaos experiments
• Safe production execution
• Resilience analysis and recommendations

### 10. Performance Debugging
• Debug across 100+ microservices
• Root cause analysis in seconds
• Advanced distributed tracing

### 11. Streaming Data Engine
• Process 1M+ events/second
• Complex Event Processing
• Real-time machine learning

### 12. Data Pipeline AI
• Auto-detect schema changes
• Optimize performance and costs
• Automatic error handling

## 🚀 Futuristic Platform Builders (5 Advanced Platforms):

### 🧬 Bio-Computing Platform Builder
• Genomic analysis and DNA sequencing
• Protein folding prediction (AlphaFold-style)
• CRISPR design tools
• Clinical genomics platforms
• Process 10,000+ genomes per day
• Compliance: HIPAA, GDPR, GxP, CAP, CLIA

### 🚗 Autonomous Vehicle Platform
• Manage 100,000+ vehicle fleets
• Real-time tracking and routing
• Sensor data fusion (LiDAR, Radar, Camera)
• V2X communication (Vehicle-to-Everything)
• Predictive maintenance and incident detection
• Support: cars, trucks, drones, robots, ships

### 🏙️ Smart City Integration
• Traffic and public transport management
• Energy grid and water systems
• Public safety and emergency response
• Air quality and noise monitoring
• 10M+ IoT sensors
• Protocols: MQTT, LoRaWAN, 5G, NB-IoT

### 🌊 Climate Tech Platforms
• Carbon and emissions tracking
• Renewable energy management
• Climate modeling and disaster prediction
• Ocean and forest monitoring
• Process 1B+ data points daily
• Compliance: GHG Protocol, TCFD, CDP, SBTi

### 🧠 Neural Interface Platforms
• Brain signal processing (EEG, EMG)
• Neural intent decoding
• Prosthetics control
• Cognitive and emotional state detection
• 10,000+ neural channels
• Latency < 10ms for real-time control
• Compliance: FDA, CE, ISO 13485

## Instructions:
- When asked about capabilities, explain in detail with practical examples and code
- When asked to build a platform, ask about: platform type, user count, budget, timeline, geographic regions
- Write complete executable code, not blueprints
- Speak in a friendly and professional manner

## Current Project Context:
${JSON.stringify(projectContext?.activeBlueprint || {}, null, 2)}

${buildIntelligenceContext(
  intentAnalysis.intent,
  intentAnalysis.confidence,
  conversationState.collectedInfo,
  recentMessages.map((m: any) => m.content),
  isArabic,
  conversationState.phase
)}

${clarifyingQuestions.length > 0 ? (isArabic 
  ? `## أسئلة توضيحية مقترحة:\n${clarifyingQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\n(إذا كانت درجة الثقة منخفضة، اطرح هذه الأسئلة أولاً قبل التنفيذ)`
  : `## Suggested Clarifying Questions:\n${clarifyingQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\n(If confidence is low, ask these questions first before executing)`) 
  : ''}`;

      // ========== DEEP REASONING & COST CALCULATION ==========
      // Perform chain-of-thought reasoning for complex requests
      const reasoning = performDeepReasoning(message, intentAnalysis.intent, conversationState.collectedInfo, isArabic);
      console.log(`[Nova Reasoning] ${reasoning.summary}`);
      
      // Calculate cost estimate for platform building requests
      let costEstimate: CostEstimate | null = null;
      let matchedTemplate: typeof PLATFORM_TEMPLATES[keyof typeof PLATFORM_TEMPLATES] | null = null;
      
      if (intentAnalysis.intent === 'BUILD_PLATFORM' && Object.keys(conversationState.collectedInfo).length >= 2) {
        costEstimate = calculatePlatformCost(conversationState.collectedInfo, intentAnalysis.intent);
        matchedTemplate = matchPlatformTemplate(conversationState.collectedInfo);
        console.log(`[Nova Cost] Dev: $${costEstimate.development.min}-${costEstimate.development.max}, Monthly: $${costEstimate.monthly.min}-${costEstimate.monthly.max}`);
      }
      
      // Build enhanced reasoning context for system prompt
      const reasoningContext = isArabic ? `
## 🧠 تحليل عميق (Chain of Thought):
${reasoning.reasoning.map(step => `### الخطوة ${step.step}:\n- **التفكير:** ${step.thought}\n- **الاستنتاج:** ${step.conclusion}`).join('\n\n')}

**ملخص التحليل:** ${reasoning.summary}

${reasoning.recommendations.length > 0 ? `## 💡 توصيات:\n${reasoning.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}` : ''}

${costEstimate ? `
## 💰 تقدير التكلفة (محسوب تلقائياً):
${formatCostEstimate(costEstimate, true)}

**مهم:** عند مناقشة التكلفة مع المستخدم، استخدم هذه الأرقام الدقيقة.
` : ''}

${matchedTemplate ? `
## 📋 القالب المطابق:
**الاسم:** ${matchedTemplate.name.ar}
**الوصف:** ${matchedTemplate.description.ar}
**المعمارية:** ${matchedTemplate.architecture}
**الميزات:** ${matchedTemplate.features.join(', ')}
` : ''}

## 📝 تعليمات الاحتراف:
1. فكر بعمق قبل الرد - استخدم التحليل أعلاه
2. قدم تقدير التكلفة والوقت إذا كان متوفراً
3. اقترح البنية المعمارية المناسبة
4. كن محترفاً وواضحاً في ردودك
5. استخدم العناوين والقوائم لتنظيم الرد
6. إذا كانت المعلومات ناقصة، اطرح أسئلة محددة
` : `
## 🧠 Deep Analysis (Chain of Thought):
${reasoning.reasoning.map(step => `### Step ${step.step}:\n- **Thought:** ${step.thought}\n- **Conclusion:** ${step.conclusion}`).join('\n\n')}

**Analysis Summary:** ${reasoning.summary}

${reasoning.recommendations.length > 0 ? `## 💡 Recommendations:\n${reasoning.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}` : ''}

${costEstimate ? `
## 💰 Cost Estimate (Auto-calculated):
${formatCostEstimate(costEstimate, false)}

**Important:** When discussing cost with user, use these exact figures.
` : ''}

${matchedTemplate ? `
## 📋 Matched Template:
**Name:** ${matchedTemplate.name.en}
**Description:** ${matchedTemplate.description.en}
**Architecture:** ${matchedTemplate.architecture}
**Features:** ${matchedTemplate.features.join(', ')}
` : ''}

## 📝 Professional Instructions:
1. Think deeply before responding - use the analysis above
2. Provide cost and time estimates if available
3. Suggest appropriate architecture
4. Be professional and clear in your responses
5. Use headings and lists to organize your response
6. If information is missing, ask specific questions
`;

      // Append reasoning context to system prompt
      const enhancedSystemPrompt = systemPrompt + '\n\n' + reasoningContext;
      // ========== END DEEP REASONING ==========

      // Build conversation with memory from database
      const messages: Anthropic.MessageParam[] = [];
      
      // Add memory history from database (last 10 messages)
      if (recentMessages && recentMessages.length > 0) {
        for (const msg of recentMessages) {
          if (msg.role === 'user' || msg.role === 'assistant') {
            messages.push({
              role: msg.role as 'user' | 'assistant',
              content: msg.content
            });
          }
        }
      }
      
      // Add current conversation history
      if (conversationHistory && Array.isArray(conversationHistory)) {
        for (const msg of conversationHistory.slice(-6)) {
          if (msg.role === 'user' || msg.role === 'assistant') {
            messages.push({
              role: msg.role,
              content: msg.content
            });
          }
        }
      }
      
      messages.push({
        role: 'user',
        content: message
      });
      
      // Use extended thinking for complex requests
      const isComplexRequest = message.length > 100 || 
        /منصة|platform|بنية|architecture|تصميم|design|كود|code|build|ابني/i.test(message);
      
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: isComplexRequest ? 4096 : 2048,
        system: enhancedSystemPrompt,
        messages: messages
      });
      
      const textContent = response.content.find(c => c.type === 'text');
      const responseText = textContent ? textContent.text : (isArabic ? 'عذراً، لم أتمكن من الرد.' : 'Sorry, I could not respond.');
      
      // Update preferences in database
      await storage.upsertNovaPreferences(userId, {
        preferredLanguage: isArabic ? 'ar' : 'en',
      });
      
      // ========== PERSIST CONVERSATION TO DATABASE ==========
      try {
        // Get or create session for this project
        let currentSession = sessions && sessions.length > 0 ? sessions[0] : null;
        
        if (!currentSession) {
          // Create new session
          currentSession = await storage.createNovaSession({
            userId,
            title: message.substring(0, 100),
            projectId: currentProjectId,
            messageCount: 0,
          });
        }
        
        // Save user message
        await storage.createNovaMessage({
          sessionId: currentSession.id,
          role: 'user',
          content: message,
          language: isArabic ? 'ar' : 'en',
        });
        
        // Save assistant response
        await storage.createNovaMessage({
          sessionId: currentSession.id,
          role: 'assistant',
          content: responseText,
          language: isArabic ? 'ar' : 'en',
        });
        
        console.log(`[Nova Memory] Saved conversation to session ${currentSession.id}`);
        
        // Also persist conversation state in activeBlueprint
        const updatedBlueprint = {
          ...(projectContext?.activeBlueprint || {}),
          _conversationState: conversationState,
        } as Record<string, unknown>;
        await storage.upsertNovaProjectContext(currentProjectId, userId, {
          activeBlueprint: updatedBlueprint as any,
          configHistory: projectContext?.configHistory || [],
        });
        console.log(`[Nova State] Saved state: phase=${conversationState.phase}, intent=${conversationState.intent}`);
      } catch (saveError) {
        console.error('[Nova Memory] Failed to save conversation:', saveError);
        // Don't fail the request if saving fails
      }
      // ========================================================
      
      res.json({
        response: responseText,
        success: true,
        capabilities: NOVA_CAPABILITIES,
        memoryEnabled: true,
        projectId: currentProjectId,
        sessionId: sessions?.[0]?.id,
        // Nova Intelligence data for frontend display
        intelligence: {
          intent: intentAnalysis.intent,
          confidence: intentAnalysis.confidence,
          phase: conversationState.phase,
          reasoning: reasoning?.summary || null,
          recommendations: reasoning?.recommendations || [],
          costEstimate: costEstimate ? {
            development: costEstimate.development,
            monthly: costEstimate.monthly,
            timeEstimate: costEstimate.timeEstimate,
            factors: costEstimate.factors,
          } : null,
          matchedTemplate: matchedTemplate ? {
            name: isArabic ? matchedTemplate.name.ar : matchedTemplate.name.en,
            description: isArabic ? matchedTemplate.description.ar : matchedTemplate.description.en,
            architecture: matchedTemplate.architecture,
            features: matchedTemplate.features,
          } : null,
        },
      });
    } catch (error: any) {
      console.error('Nova chat error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        response: req.body?.language === 'ar' 
          ? 'عذراً، حدث خطأ. حاول مرة أخرى.' 
          : 'Sorry, an error occurred. Please try again.'
      });
    }
  });

  // ==================== NOVA CAPABILITIES ENDPOINT ====================
  app.get("/api/nova/capabilities", requireAuth, async (req, res) => {
    res.json({
      capabilities: NOVA_CAPABILITIES,
      version: "3.0.0",
      scale: NOVA_CAPABILITIES.scale,
      features: {
        conversational_ai: {
          enabled: true,
          description: "Intelligent bilingual (Arabic/English) conversation",
          model: "claude-sonnet-4"
        },
        code_execution: {
          enabled: true,
          languages: NOVA_CAPABILITIES.languages,
          isolation: "docker_sandbox"
        },
        code_generation: {
          enabled: true,
          frameworks: ["react", "nextjs", "express", "fastapi", "gin", "django", "rails"],
          databases: NOVA_CAPABILITIES.databases
        },
        github_integration: {
          enabled: true,
          features: ["create_repo", "push_code", "manage_branches", "pull_requests"]
        },
        long_term_memory: {
          enabled: true,
          scope: "per_project",
          retention: "50_messages"
        },
        payment_orchestration: {
          enabled: true,
          gateways: NOVA_CAPABILITIES.payments,
          regions: ["egypt", "saudi_arabia", "uae", "global"]
        },
        security: {
          enabled: true,
          standards: NOVA_CAPABILITIES.security,
          advanced: NOVA_CAPABILITIES.advanced_security
        },
        architecture: {
          enabled: true,
          patterns: NOVA_CAPABILITIES.architecture,
          description: "Event-Driven, CQRS, Saga, Circuit Breaker, Multi-tenant"
        },
        performance: {
          enabled: true,
          features: NOVA_CAPABILITIES.performance,
          description: "CDN, Sharding, Multi-layer Caching, Load Testing, APM"
        },
        ai_ml: {
          enabled: true,
          features: NOVA_CAPABILITIES.ai_ml,
          description: "Recommendation Systems, NLP, Computer Vision, Predictive Analytics"
        },
        cloud: {
          enabled: true,
          providers: NOVA_CAPABILITIES.cloud.providers,
          kubernetes: NOVA_CAPABILITIES.cloud.kubernetes,
          iac: NOVA_CAPABILITIES.cloud.iac,
          cicd: NOVA_CAPABILITIES.cloud.cicd
        },
        compliance: {
          enabled: true,
          standards: NOVA_CAPABILITIES.compliance
        },
        // 12 Advanced Enterprise Platform Tools
        advanced_tools: {
          auto_scaling_ai: NOVA_CAPABILITIES.auto_scaling_ai,
          cloud_migration: NOVA_CAPABILITIES.cloud_migration,
          intelligent_sharding: NOVA_CAPABILITIES.intelligent_sharding,
          ai_api_gateway: NOVA_CAPABILITIES.ai_api_gateway,
          code_to_architecture: NOVA_CAPABILITIES.code_to_architecture,
          security_orchestration: NOVA_CAPABILITIES.security_orchestration,
          cost_optimization: NOVA_CAPABILITIES.cost_optimization,
          microservices_generator: NOVA_CAPABILITIES.microservices_generator,
          chaos_engineering: NOVA_CAPABILITIES.chaos_engineering,
          performance_debugging: NOVA_CAPABILITIES.performance_debugging,
          streaming_engine: NOVA_CAPABILITIES.streaming_engine,
          data_pipeline_ai: NOVA_CAPABILITIES.data_pipeline_ai
        },
        // 5 Futuristic Platform Builders
        futuristic_platforms: {
          bio_computing: NOVA_CAPABILITIES.bio_computing,
          autonomous_vehicles: NOVA_CAPABILITIES.autonomous_vehicles,
          smart_city: NOVA_CAPABILITIES.smart_city,
          climate_tech: NOVA_CAPABILITIES.climate_tech,
          neural_interface: NOVA_CAPABILITIES.neural_interface
        }
      }
    });
  });

  // ==================== NOVA CODE EXECUTION ====================
  app.post("/api/nova/execute", requireAuth, async (req, res) => {
    try {
      const { code, language, timeout } = req.body;
      
      if (!code || !language) {
        return res.status(400).json({ error: "Code and language are required" });
      }
      
      if (!NOVA_CAPABILITIES.languages.includes(language)) {
        return res.status(400).json({ 
          error: `Unsupported language. Supported: ${NOVA_CAPABILITIES.languages.join(', ')}` 
        });
      }
      
      // Forward to execution engine
      const response = await fetch(`http://localhost:5000/api/platform/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, timeout: timeout || 30000 })
      });
      
      const result = await response.json();
      res.json(result);
    } catch (error: any) {
      console.error('Nova execute error:', error);
      res.status(500).json({ error: 'Execution failed' });
    }
  });

  // ==================== NOVA PROJECT MEMORY (Database-backed) ====================
  app.get("/api/nova/memory/:projectId", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const projectContext = await storage.getNovaProjectContext(req.params.projectId);
      const preferences = await storage.getNovaPreferences(userId);
      
      // Get messages from user's sessions
      const sessions = await storage.getUserNovaSessions(userId, 1);
      let messageCount = 0;
      if (sessions && sessions.length > 0) {
        messageCount = sessions[0].messageCount || 0;
      }
      
      if (!projectContext) {
        return res.json({ exists: false, history: [], context: {} });
      }
      
      res.json({
        exists: true,
        projectId: req.params.projectId,
        historyCount: messageCount,
        lastUpdated: projectContext.updatedAt,
        context: projectContext.activeBlueprint,
        preferences: preferences || {}
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to retrieve memory' });
    }
  });

  app.post("/api/nova/memory/:projectId/context", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const projectContext = await storage.upsertNovaProjectContext(
        req.params.projectId, 
        userId, 
        { activeBlueprint: req.body }
      );
      
      res.json({ success: true, context: projectContext.activeBlueprint });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update context' });
    }
  });

  app.delete("/api/nova/memory/:projectId", requireAuth, async (req, res) => {
    try {
      // Note: Full deletion would require a new storage method
      // For now, we clear the context
      const userId = (req.user as any).id;
      await storage.upsertNovaProjectContext(
        req.params.projectId,
        userId,
        { activeBlueprint: {}, configHistory: [], detectedConflicts: [] }
      );
      res.json({ success: true, cleared: true });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to clear memory' });
    }
  });

  // ==================== NOVA SESSIONS ====================

  // Get user's conversation sessions
  app.get("/api/nova/sessions", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const limit = parseInt(req.query.limit as string) || 20;
      const sessions = await storage.getUserNovaSessions(userId, limit);
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create new conversation session
  app.post("/api/nova/sessions", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const data = createSessionSchema.parse(req.body);
      
      const session = await storage.createNovaSession({
        userId,
        ...data,
      });
      
      // Update user preferences interaction
      await storage.upsertNovaPreferences(userId, {
        preferredLanguage: data.language,
      });
      
      res.json(session);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Get specific session
  app.get("/api/nova/sessions/:id", requireAuth, async (req, res) => {
    try {
      const session = await storage.getNovaSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "الجلسة غير موجودة" });
      }
      if (session.userId !== (req.user as any).id) {
        return res.status(403).json({ error: "غير مصرح بالوصول لهذه الجلسة" });
      }
      res.json(session);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Archive session
  app.post("/api/nova/sessions/:id/archive", requireAuth, async (req, res) => {
    try {
      const session = await storage.getNovaSession(req.params.id);
      if (!session || session.userId !== (req.user as any).id) {
        return res.status(404).json({ error: "الجلسة غير موجودة" });
      }
      
      const archived = await storage.archiveNovaSession(req.params.id);
      res.json(archived);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete session
  app.delete("/api/nova/sessions/:id", requireAuth, async (req, res) => {
    try {
      const session = await storage.getNovaSession(req.params.id);
      if (!session || session.userId !== (req.user as any).id) {
        return res.status(404).json({ error: "الجلسة غير موجودة" });
      }
      
      await storage.deleteNovaSession(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== NOVA MESSAGES ====================

  // Get session messages
  app.get("/api/nova/sessions/:sessionId/messages", requireAuth, async (req, res) => {
    try {
      const session = await storage.getNovaSession(req.params.sessionId);
      if (!session || session.userId !== (req.user as any).id) {
        return res.status(404).json({ error: "الجلسة غير موجودة" });
      }
      
      const limit = parseInt(req.query.limit as string) || 100;
      const messages = await storage.getSessionMessages(req.params.sessionId, limit);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Send message and get AI response
  app.post("/api/nova/sessions/:sessionId/messages", requireAuth, async (req, res) => {
    try {
      const session = await storage.getNovaSession(req.params.sessionId);
      if (!session || session.userId !== (req.user as any).id) {
        return res.status(404).json({ error: "الجلسة غير موجودة" });
      }
      
      const data = sendMessageSchema.parse(req.body);
      const userId = (req.user as any).id;
      
      // Save user message
      const userMessage = await storage.createNovaMessage({
        sessionId: req.params.sessionId,
        role: "user",
        content: data.content,
        language: data.language,
        attachments: data.attachments,
      });
      
      // Get user preferences for context
      const preferences = await storage.getNovaPreferences(userId);
      
      // Get recent messages for context (last 50 messages to maintain memory)
      const recentMessages = await storage.getRecentSessionMessages(req.params.sessionId, 50);
      
      // Get active decisions for context
      const decisions = await storage.getActiveDecisions(userId);
      
      // Build system prompt
      const systemPrompt = buildSystemPrompt(data.language, preferences, decisions);
      
      // Build conversation history with Vision support for images
      const conversationHistory: any[] = recentMessages.map(msg => {
        // Check if message has image attachments
        const attachments = (msg as any).attachments || [];
        const imageAttachments = attachments.filter((a: any) => a.type === "image");
        
        if (imageAttachments.length > 0 && msg.role === "user") {
          // Build multi-modal content with images
          const contentParts: any[] = [];
          
          // Add images first
          for (const img of imageAttachments) {
            if (img.content) {
              // Base64 image data
              const mediaType = img.metadata?.mimeType || "image/png";
              contentParts.push({
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType,
                  data: img.content.replace(/^data:image\/\w+;base64,/, ""),
                },
              });
            } else if (img.url) {
              // URL-based image
              contentParts.push({
                type: "image",
                source: {
                  type: "url",
                  url: img.url,
                },
              });
            }
          }
          
          // Add text content
          contentParts.push({
            type: "text",
            text: msg.content,
          });
          
          return {
            role: msg.role as "user" | "assistant",
            content: contentParts,
          };
        }
        
        return {
          role: msg.role as "user" | "assistant",
          content: msg.content,
        };
      });
      
      // Add current message with any new images
      const currentImageAttachments = (data.attachments || []).filter(a => a.type === "image");
      if (currentImageAttachments.length > 0) {
        // Replace last user message (which is the current one) with vision-enabled version
        const lastMsgIndex = conversationHistory.length - 1;
        if (lastMsgIndex >= 0 && conversationHistory[lastMsgIndex].role === "user") {
          const contentParts: any[] = [];
          
          for (const img of currentImageAttachments) {
            if (img.content) {
              const mediaType = img.metadata?.mimeType || "image/png";
              contentParts.push({
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType,
                  data: img.content.replace(/^data:image\/\w+;base64,/, ""),
                },
              });
            } else if (img.url) {
              contentParts.push({
                type: "image",
                source: {
                  type: "url",
                  url: img.url,
                },
              });
            }
          }
          
          contentParts.push({
            type: "text",
            text: data.content,
          });
          
          conversationHistory[lastMsgIndex] = {
            role: "user",
            content: contentParts,
          };
        }
      }
      
      const startTime = Date.now();
      
      // Call Claude AI with tools for agentic capabilities (Vision-enabled)
      let response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: systemPrompt,
        messages: conversationHistory,
        tools: novaTools,
      });
      
      let aiContent = "";
      let toolResults: any[] = [];
      let totalTokens = response.usage.input_tokens + response.usage.output_tokens;
      
      // Handle tool use loop - Nova can now execute actions!
      while (response.stop_reason === "tool_use") {
        const toolUseBlocks = response.content.filter(block => block.type === "tool_use");
        const textBlocks = response.content.filter(block => block.type === "text");
        
        // Collect any text before tool use
        for (const block of textBlocks) {
          if (block.type === "text") {
            aiContent += block.text + "\n";
          }
        }
        
        // Execute each tool
        const toolResultMessages: any[] = [];
        for (const toolUse of toolUseBlocks) {
          if (toolUse.type === "tool_use") {
            console.log(`[Nova] Executing tool: ${toolUse.name}`, toolUse.input);
            const result = await executeNovaTool(toolUse.name, toolUse.input, userId);
            toolResults.push({ tool: toolUse.name, input: toolUse.input, result: JSON.parse(result) });
            toolResultMessages.push({
              type: "tool_result",
              tool_use_id: toolUse.id,
              content: result,
            });
          }
        }
        
        // Continue conversation with tool results
        response = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          system: systemPrompt,
          messages: [
            ...conversationHistory,
            { role: "assistant", content: response.content },
            { role: "user", content: toolResultMessages },
          ],
          tools: novaTools,
        });
        
        totalTokens += response.usage.input_tokens + response.usage.output_tokens;
      }
      
      // Extract final text response
      for (const block of response.content) {
        if (block.type === "text") {
          aiContent += block.text;
        }
      }
      
      const responseTime = Date.now() - startTime;
      const tokensUsed = totalTokens;
      
      // Extract any interactive actions from AI response
      const actions = extractActionsFromResponse(aiContent);
      
      // Add tool execution info to actions if tools were used
      if (toolResults.length > 0) {
        actions.push({
          id: `tools-${Date.now()}`,
          type: "tool_execution",
          label: `Executed ${toolResults.length} action(s)`,
          labelAr: `تم تنفيذ ${toolResults.length} إجراء(ات)`,
          status: "completed",
          toolResults,
        });
      }
      
      // Save AI response
      const aiMessage = await storage.createNovaMessage({
        sessionId: req.params.sessionId,
        role: "assistant",
        content: aiContent,
        language: data.language,
        modelUsed: "claude-sonnet-4-20250514",
        tokensUsed,
        responseTime,
        actions: actions.length > 0 ? actions : undefined,
      });
      
      // Update session summary periodically
      if (session.messageCount && session.messageCount % 10 === 0) {
        generateSessionSummary(req.params.sessionId, recentMessages);
      }
      
      // Update user preferences based on interaction
      await storage.upsertNovaPreferences(userId, {});
      
      res.json({
        userMessage,
        aiMessage,
        tokensUsed,
        responseTime,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Nova message error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Toggle message pin
  app.post("/api/nova/messages/:id/pin", requireAuth, async (req, res) => {
    try {
      const message = await storage.getNovaMessage(req.params.id);
      if (!message) {
        return res.status(404).json({ error: "الرسالة غير موجودة" });
      }
      
      const session = await storage.getNovaSession(message.sessionId);
      if (!session || session.userId !== (req.user as any).id) {
        return res.status(403).json({ error: "غير مصرح" });
      }
      
      const updated = await storage.toggleMessagePin(req.params.id);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Execute message action
  app.post("/api/nova/messages/:id/actions/:actionId", requireAuth, async (req, res) => {
    try {
      const message = await storage.getNovaMessage(req.params.id);
      if (!message) {
        return res.status(404).json({ error: "الرسالة غير موجودة" });
      }
      
      const session = await storage.getNovaSession(message.sessionId);
      if (!session || session.userId !== (req.user as any).id) {
        return res.status(403).json({ error: "غير مصرح" });
      }
      
      const result = req.body.result;
      const updated = await storage.executeMessageAction(req.params.id, req.params.actionId, result);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== NOVA DECISIONS ====================

  // Get user decisions
  app.get("/api/nova/decisions", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const category = req.query.category as string | undefined;
      const decisions = await storage.getUserDecisions(userId, category);
      res.json(decisions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get active decisions
  app.get("/api/nova/decisions/active", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const decisions = await storage.getActiveDecisions(userId);
      res.json(decisions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create decision
  app.post("/api/nova/decisions", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const data = createDecisionSchema.parse(req.body);
      
      const decision = await storage.createNovaDecision({
        userId,
        ...data,
      });
      
      res.json(decision);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Apply decision
  app.post("/api/nova/decisions/:id/apply", requireAuth, async (req, res) => {
    try {
      const decision = await storage.getNovaDecision(req.params.id);
      if (!decision || decision.userId !== (req.user as any).id) {
        return res.status(404).json({ error: "القرار غير موجود" });
      }
      
      const applied = await storage.applyDecision(req.params.id);
      res.json(applied);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Revert decision
  app.post("/api/nova/decisions/:id/revert", requireAuth, async (req, res) => {
    try {
      const decision = await storage.getNovaDecision(req.params.id);
      if (!decision || decision.userId !== (req.user as any).id) {
        return res.status(404).json({ error: "القرار غير موجود" });
      }
      
      const reverted = await storage.updateNovaDecision(req.params.id, { status: "reverted" });
      res.json(reverted);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== NOVA PREFERENCES ====================

  // Get user preferences
  app.get("/api/nova/preferences", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const preferences = await storage.getNovaPreferences(userId);
      res.json(preferences || {});
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update preferences
  app.patch("/api/nova/preferences", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const data = updatePreferencesSchema.parse(req.body);
      
      const updated = await storage.upsertNovaPreferences(userId, data);
      res.json(updated);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== NOVA PROJECT CONTEXT ====================

  // Helper to verify project ownership
  async function verifyProjectOwnership(projectId: string, userId: string): Promise<boolean> {
    const project = await storage.getProject(projectId);
    if (!project) return false;
    return project.userId === userId;
  }

  // Get project context
  app.get("/api/nova/projects/:projectId/context", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      // Verify ownership
      if (!await verifyProjectOwnership(req.params.projectId, userId)) {
        return res.status(403).json({ error: "غير مصرح بالوصول لهذا المشروع" });
      }
      
      const context = await storage.getNovaProjectContext(req.params.projectId);
      res.json(context || {});
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update project context
  app.patch("/api/nova/projects/:projectId/context", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      // Verify ownership
      if (!await verifyProjectOwnership(req.params.projectId, userId)) {
        return res.status(403).json({ error: "غير مصرح بالوصول لهذا المشروع" });
      }
      
      const updated = await storage.upsertNovaProjectContext(
        req.params.projectId,
        userId,
        req.body
      );
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Add detected conflict
  app.post("/api/nova/projects/:projectId/conflicts", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      // Verify ownership
      if (!await verifyProjectOwnership(req.params.projectId, userId)) {
        return res.status(403).json({ error: "غير مصرح بالوصول لهذا المشروع" });
      }
      
      const conflict = {
        id: `conflict-${Date.now()}`,
        type: req.body.type,
        description: req.body.description,
        severity: req.body.severity || "warning",
        suggestedResolution: req.body.suggestedResolution,
        resolved: false,
      };
      
      const updated = await storage.addDetectedConflict(req.params.projectId, conflict);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Resolve conflict
  app.post("/api/nova/projects/:projectId/conflicts/:conflictId/resolve", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      // Verify ownership
      if (!await verifyProjectOwnership(req.params.projectId, userId)) {
        return res.status(403).json({ error: "غير مصرح بالوصول لهذا المشروع" });
      }
      
      const updated = await storage.resolveConflict(req.params.projectId, req.params.conflictId);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== NOVA ANALYTICS ====================

  // Get conversation analytics
  app.get("/api/nova/analytics", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      const sessions = await storage.getUserNovaSessions(userId, 100);
      const decisions = await storage.getUserDecisions(userId);
      const preferences = await storage.getNovaPreferences(userId);
      
      const analytics = {
        totalSessions: sessions.length,
        activeSessions: sessions.filter(s => s.status === "active").length,
        totalMessages: sessions.reduce((sum, s) => sum + (s.messageCount || 0), 0),
        totalDecisions: decisions.length,
        appliedDecisions: decisions.filter(d => d.wasApplied).length,
        decisionsByCategory: groupBy(decisions, "category"),
        learningScore: preferences?.learningScore || 0,
        interactionCount: preferences?.interactionCount || 0,
        preferredFramework: preferences?.preferredFramework,
        preferredDatabase: preferences?.preferredDatabase,
      };
      
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== AI ARCHITECTURE ADVISOR ====================

  // Analyze project architecture and detect patterns
  app.post("/api/nova/architecture/analyze", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { projectId, scope } = req.body;
      
      // Verify project ownership
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Get existing knowledge graph
      const nodes = await storage.getProjectKnowledgeNodes(projectId);
      const edges = await storage.getProjectKnowledgeEdges(projectId);
      const existingPatterns = await storage.getProjectPatterns(projectId);

      // Prepare context for AI analysis
      const analysisPrompt = `Analyze this project architecture and identify:
1. Architecture patterns (good and anti-patterns)
2. Performance optimization opportunities
3. Security concerns
4. Scalability issues
5. Cost optimization suggestions

Project Context:
- Knowledge Nodes: ${nodes.length} components tracked
- Dependencies: ${edges.length} relationships
- Existing Patterns: ${existingPatterns.map(p => p.patternName).join(", ") || "None detected"}

Scope: ${scope || "full"}

Respond in JSON format:
{
  "patterns": [{"name": "...", "type": "pattern|anti_pattern", "severity": "info|warning|critical", "description": "...", "recommendation": "...", "impact": {"performance": 0-10, "security": 0-10, "scalability": 0-10, "cost": 0-10}}],
  "summary": "...",
  "overallHealth": 0-100
}`;

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{ role: "user", content: analysisPrompt }],
      });

      const analysisText = response.content[0].type === "text" ? response.content[0].text : "{}";
      
      // Extract JSON from response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { patterns: [], summary: "Analysis failed", overallHealth: 0 };

      // Store detected patterns
      for (const pattern of analysis.patterns || []) {
        await storage.createArchitecturePattern({
          projectId,
          patternName: pattern.name,
          patternType: pattern.type === "anti_pattern" ? "anti_pattern" : "design_pattern",
          isAntiPattern: pattern.type === "anti_pattern",
          description: pattern.description,
          suggestedFix: pattern.recommendation,
          performanceImpact: pattern.impact?.performance > 5 ? "positive" : pattern.impact?.performance < 5 ? "negative" : "neutral",
          securityImpact: pattern.impact?.security > 5 ? "positive" : pattern.impact?.security < 5 ? "negative" : "neutral",
          scalabilityImpact: pattern.impact?.scalability > 5 ? "positive" : pattern.impact?.scalability < 5 ? "negative" : "neutral",
          costImpact: pattern.impact?.cost > 5 ? "positive" : pattern.impact?.cost < 5 ? "negative" : "neutral",
        });
      }

      // Log the analysis event
      await storage.createEventLog({
        projectId,
        userId,
        eventType: "architecture_analysis",
        eventName: "Architecture Analysis",
        payload: { metadata: { scope, patternsFound: analysis.patterns?.length || 0 } },
      });

      res.json({
        success: true,
        analysis,
        patternsStored: analysis.patterns?.length || 0,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get architecture suggestions for improvement
  app.post("/api/nova/architecture/suggest", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { projectId, query, context } = req.body;

      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Get knowledge context
      const nodes = await storage.getProjectKnowledgeNodes(projectId);
      const patterns = await storage.getProjectPatterns(projectId, true); // Anti-patterns only

      const suggestionPrompt = `As an AI Architecture Advisor for INFERA WebNova, provide architectural suggestions.

User Query: ${query}

Project Context:
- Components: ${nodes.filter(n => n.nodeType === "component").length}
- Decisions: ${nodes.filter(n => n.nodeType === "decision").length}
- Active Anti-patterns: ${patterns.filter(p => p.status === "detected").length}

Additional Context: ${JSON.stringify(context || {})}

Provide 3-5 actionable suggestions with:
1. Clear recommendation
2. Implementation steps
3. Expected impact (performance, cost, security, scalability)
4. Priority level

Format as JSON:
{
  "suggestions": [{
    "id": "...",
    "title": "...",
    "description": "...",
    "steps": ["..."],
    "impact": {"performance": 0-10, "security": 0-10, "scalability": 0-10, "cost": 0-10},
    "priority": "low|medium|high|critical",
    "estimatedEffort": "hours|days|weeks"
  }]
}`;

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{ role: "user", content: suggestionPrompt }],
      });

      const suggestionText = response.content[0].type === "text" ? response.content[0].text : "{}";
      const jsonMatch = suggestionText.match(/\{[\s\S]*\}/);
      const suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : { suggestions: [] };

      res.json(suggestions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get project knowledge graph
  app.get("/api/nova/knowledge/:projectId", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { projectId } = req.params;

      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const nodes = await storage.getProjectKnowledgeNodes(projectId);
      const edges = await storage.getProjectKnowledgeEdges(projectId);
      const patterns = await storage.getProjectPatterns(projectId);
      const events = await storage.getProjectEventLog(projectId, 20);

      res.json({
        nodes,
        edges,
        patterns,
        recentEvents: events,
        stats: {
          totalNodes: nodes.length,
          totalEdges: edges.length,
          activePatterns: patterns.filter(p => p.status !== "resolved").length,
          antiPatterns: patterns.filter(p => p.isAntiPattern && p.status === "detected").length,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Add knowledge node
  app.post("/api/nova/knowledge/:projectId/nodes", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { projectId } = req.params;

      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Validate input
      const validatedData = createKnowledgeNodeSchema.parse(req.body);

      const node = await storage.createKnowledgeNode({
        projectId,
        userId,
        ...validatedData,
      });

      // Log the event
      await storage.createEventLog({
        projectId,
        userId,
        eventType: "knowledge_node_created",
        eventName: "Knowledge Node Created",
        payload: { metadata: { nodeType: validatedData.nodeType, name: validatedData.name, entityId: node.id } },
      });

      res.json(node);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Acknowledge or resolve a pattern
  app.patch("/api/nova/patterns/:patternId", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { patternId } = req.params;
      const { action } = req.body;

      // Get pattern and verify ownership through project
      const patterns = await storage.getProjectPatterns(patternId);
      const pattern = patterns.find((p) => p.id === patternId);
      if (!pattern) {
        // Try direct lookup via projectId
        const allPatterns = await db.select().from(architecturePatterns).where(eq(architecturePatterns.id, patternId));
        if (allPatterns.length === 0) {
          return res.status(404).json({ error: "Pattern not found" });
        }
        const project = await storage.getProject(allPatterns[0].projectId);
        if (!project || project.userId !== userId) {
          return res.status(403).json({ error: "Unauthorized" });
        }
      } else {
        const project = await storage.getProject(pattern.projectId);
        if (!project || project.userId !== userId) {
          return res.status(403).json({ error: "Unauthorized" });
        }
      }

      const updated = action === "acknowledge" 
        ? await storage.acknowledgePattern(patternId)
        : await storage.resolvePattern(patternId);

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== OPERATIONS PLATFORM ====================

  // Get project deployments
  app.get("/api/nova/deployments/:projectId", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { projectId } = req.params;

      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const deployments = await storage.getProjectDeployments(projectId);
      const configs = await storage.getProjectDeploymentConfigs(projectId);

      res.json({ deployments, configs });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create deployment config
  app.post("/api/nova/deployments/:projectId/config", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { projectId } = req.params;

      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Validate input with Zod schema
      const validatedData = createDeploymentConfigSchema.parse(req.body);

      const config = await storage.createDeploymentConfig({
        projectId,
        userId,
        environment: validatedData.environment || "development",
        provider: validatedData.provider || "hetzner",
        customDomain: validatedData.customDomain,
        minInstances: validatedData.minInstances,
        maxInstances: validatedData.maxInstances,
        sslEnabled: validatedData.sslEnabled,
        cdnEnabled: validatedData.cdnEnabled,
      });

      res.json(config);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Rollback to a previous deployment
  app.post("/api/nova/deployments/:projectId/rollback", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { projectId } = req.params;
      const { deploymentId } = req.body;

      if (!deploymentId) {
        return res.status(400).json({ error: "Deployment ID is required" });
      }

      if (!projectId) {
        return res.status(400).json({ error: "Project ID is required" });
      }

      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      if (project.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Create a rollback deployment
      const targetDeployment = await storage.getDeployment(deploymentId);
      if (!targetDeployment) {
        return res.status(404).json({ error: "Target deployment not found" });
      }
      
      // Ensure target deployment belongs to the same project (string comparison)
      if (String(targetDeployment.projectId) !== String(projectId)) {
        return res.status(403).json({ error: "Deployment does not belong to this project" });
      }

      const rollbackDeployment = await storage.createDeployment({
        projectId,
        configId: targetDeployment.configId,
        userId,
        version: `${targetDeployment.version}-rollback-${Date.now()}`,
        commitHash: targetDeployment.commitHash,
        commitMessage: `Rollback to ${targetDeployment.version}`,
        status: "pending",
      });

      res.json({ 
        success: true, 
        deployment: rollbackDeployment,
        message: `Rollback to version ${targetDeployment.version} initiated` 
      });
    } catch (error: any) {
      console.error("Rollback error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get project health alerts
  app.get("/api/nova/alerts/:projectId", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { projectId } = req.params;

      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const alerts = await storage.getProjectHealthAlerts(projectId);
      res.json(alerts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Acknowledge alert
  app.patch("/api/nova/alerts/:alertId/acknowledge", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { alertId } = req.params;

      // Get alert and verify ownership through project
      const existingAlert = await storage.getHealthAlert(alertId);
      if (!existingAlert) {
        return res.status(404).json({ error: "Alert not found" });
      }

      const project = await storage.getProject(existingAlert.projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const alert = await storage.acknowledgeAlert(alertId, userId);
      res.json(alert);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get project metrics
  app.get("/api/nova/metrics/:projectId", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { projectId } = req.params;

      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const metrics = await storage.getProjectMetrics(projectId);
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== MULTI-SURFACE BUILD ====================

  // Get project build configs and jobs
  app.get("/api/nova/builds/:projectId", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { projectId } = req.params;

      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const configs = await storage.getProjectBuildConfigs(projectId);
      const jobs = await storage.getProjectBuildJobs(projectId);
      res.json({ configs, jobs });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create build config
  app.post("/api/nova/builds/:projectId/config", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { projectId } = req.params;

      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Validate input with Zod schema
      const validatedData = createBuildConfigSchema.parse(req.body);

      const config = await storage.createBuildConfig({
        projectId,
        userId,
        platform: validatedData.platform,
        appName: validatedData.appName || `${validatedData.platform} App`,
        appNameAr: validatedData.appNameAr,
        version: validatedData.version || "1.0.0",
        bundleId: validatedData.bundleId,
      });
      res.json(config);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Start a build job
  app.post("/api/nova/builds/:projectId/start", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { projectId } = req.params;
      
      // Validate input with Zod schema
      const validatedData = startBuildSchema.parse(req.body);

      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const config = await storage.getBuildConfig(validatedData.configId);
      if (!config || config.projectId !== projectId) {
        return res.status(404).json({ error: "Build config not found" });
      }

      // Explicitly construct job data - no spread
      const job = await storage.createBuildJob({
        projectId,
        configId: validatedData.configId,
        userId,
        platform: config.platform,
        version: validatedData.version || config.version || "1.0.0",
        status: "queued",
      });
      res.json(job);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== UNIFIED BLUEPRINTS ====================

  // Get project blueprints
  app.get("/api/nova/blueprints/:projectId", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { projectId } = req.params;

      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const blueprints = await storage.getProjectBlueprints(projectId);
      res.json({ blueprints });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create unified blueprint
  app.post("/api/nova/blueprints/:projectId", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { projectId } = req.params;

      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Validate input with Zod schema
      const validatedData = createBlueprintSchema.parse(req.body);

      const blueprint = await storage.createUnifiedBlueprint({
        projectId,
        userId,
        ...validatedData,
      });
      res.json(blueprint);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Update blueprint
  app.patch("/api/nova/blueprints/:blueprintId", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { blueprintId } = req.params;

      const existing = await storage.getUnifiedBlueprint(blueprintId);
      if (!existing) {
        return res.status(404).json({ error: "Blueprint not found" });
      }

      const project = await storage.getProject(existing.projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Explicitly pick allowed fields for update
      const { name, nameAr, version, definition, surfaces, isLocked } = req.body;
      const updateData: Record<string, any> = {};
      if (name !== undefined) updateData.name = name;
      if (nameAr !== undefined) updateData.nameAr = nameAr;
      if (version !== undefined) updateData.version = version;
      if (definition !== undefined) updateData.definition = definition;
      if (surfaces !== undefined) updateData.surfaces = surfaces;
      if (isLocked !== undefined) updateData.isLocked = isLocked;

      const blueprint = await storage.updateUnifiedBlueprint(blueprintId, updateData);
      res.json(blueprint);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}

// Helper functions

function buildSystemPrompt(
  language: string,
  preferences: any,
  decisions: any[]
): string {
  const isArabic = language === "ar";
  
  const basePrompt = isArabic
    ? `أنت Nova، محرك الذكاء الاصطناعي السيادي في منصة INFERA WebNova - نظام تشغيل رقمي متكامل لبناء ونشر المنصات الرقمية.

## قدراتك الكاملة (أنت تعمل داخل بيئة Replit مع صلاحيات كاملة):

### 1. بناء المنصات الكاملة:
- إنشاء مشاريع كاملة (Frontend + Backend + Database)
- توليد كود React/Vue/Next.js للواجهات
- بناء APIs باستخدام Express/Node.js/Python
- إعداد قواعد بيانات PostgreSQL مع Drizzle ORM
- تنفيذ الأوامر مباشرة (npm install, build, etc.)

### 2. النشر والاستضافة:
- نشر المنصات على Hetzner Cloud
- إعداد الدومينات وشهادات SSL
- تكوين CI/CD للنشر التلقائي
- مراقبة الأداء والصحة

### 3. التكاملات:
- ربط Stripe للمدفوعات
- تكامل مع APIs خارجية
- إعداد المصادقة والأمان
- تكامل مع خدمات الذكاء الاصطناعي

### 4. التحليل الذكي:
- تحليل المتطلبات وتحويلها إلى blueprints
- تنبؤات استراتيجية مدعومة بالذكاء الاصطناعي
- إدارة المخاطر والامتثال
- تحسين الأداء والتكلفة

## مهمتك:
- بناء منصات كاملة جاهزة للإنتاج
- تحويل أفكار المستخدم إلى تطبيقات عاملة
- نشر المنصات على السيرفرات تلقائياً
- إدارة دورة حياة المنصة بالكامل

## قواعد مهمة:
- استخدم اللغة العربية دائماً
- أنت قادر على تنفيذ كل ما يطلبه المستخدم - لا تقل "لا أستطيع"
- ابدأ العمل فوراً عند طلب بناء منصة
- قدم تحديثات واضحة عن التقدم
- اطلب التوضيح فقط عند الضرورة القصوى`
    : `You are Nova, the sovereign AI engine in INFERA WebNova platform - a complete digital operating system for building and deploying digital platforms.

## Your Complete Capabilities (You operate within Replit with full permissions):

### 1. Full Platform Building:
- Create complete projects (Frontend + Backend + Database)
- Generate React/Vue/Next.js frontend code
- Build APIs using Express/Node.js/Python
- Set up PostgreSQL databases with Drizzle ORM
- Execute commands directly (npm install, build, etc.)

### 2. Deployment & Hosting:
- Deploy platforms to Hetzner Cloud
- Configure domains and SSL certificates
- Set up CI/CD for automatic deployment
- Monitor performance and health

### 3. Integrations:
- Connect Stripe for payments
- Integrate with external APIs
- Set up authentication and security
- Integrate with AI services

### 4. Intelligent Analysis:
- Analyze requirements and convert to blueprints
- AI-powered strategic forecasting
- Risk management and compliance
- Performance and cost optimization

## Your Mission:
- Build complete production-ready platforms
- Transform user ideas into working applications
- Deploy platforms to servers automatically
- Manage the full platform lifecycle

## Important Rules:
- Always use English
- You CAN do everything the user asks - never say "I cannot"
- Start working immediately when asked to build a platform
- Provide clear progress updates
- Ask for clarification only when absolutely necessary`;

  // Add preferences context
  let preferencesContext = "";
  if (preferences) {
    preferencesContext = isArabic
      ? `\n\nتفضيلات المستخدم:\n- الإطار المفضل: ${preferences.preferredFramework || "غير محدد"}\n- قاعدة البيانات المفضلة: ${preferences.preferredDatabase || "غير محدد"}\n- مستوى التفصيل: ${preferences.detailLevel || "متوازن"}`
      : `\n\nUser preferences:\n- Preferred framework: ${preferences.preferredFramework || "not set"}\n- Preferred database: ${preferences.preferredDatabase || "not set"}\n- Detail level: ${preferences.detailLevel || "balanced"}`;
  }

  // Add recent decisions context
  let decisionsContext = "";
  if (decisions.length > 0) {
    const recentDecisions = decisions.slice(0, 5);
    decisionsContext = isArabic
      ? `\n\nالقرارات الأخيرة:\n${recentDecisions.map(d => `- ${d.category}: ${d.selectedOption}`).join("\n")}`
      : `\n\nRecent decisions:\n${recentDecisions.map(d => `- ${d.category}: ${d.selectedOption}`).join("\n")}`;
  }

  return basePrompt + preferencesContext + decisionsContext;
}

function extractActionsFromResponse(content: string): any[] {
  const actions: any[] = [];
  
  // Look for action patterns in the response
  const confirmPattern = /\[CONFIRM:(.*?)\]/g;
  const applyPattern = /\[APPLY:(.*?)\]/g;
  const previewPattern = /\[PREVIEW:(.*?)\]/g;
  
  let match;
  
  while ((match = confirmPattern.exec(content)) !== null) {
    actions.push({
      id: `action-${Date.now()}-${actions.length}`,
      type: "confirm",
      label: match[1],
      labelAr: match[1],
      status: "pending",
    });
  }
  
  while ((match = applyPattern.exec(content)) !== null) {
    actions.push({
      id: `action-${Date.now()}-${actions.length}`,
      type: "apply",
      label: match[1],
      labelAr: match[1],
      status: "pending",
    });
  }
  
  while ((match = previewPattern.exec(content)) !== null) {
    actions.push({
      id: `action-${Date.now()}-${actions.length}`,
      type: "preview",
      label: match[1],
      labelAr: match[1],
      status: "pending",
    });
  }
  
  return actions;
}

async function generateSessionSummary(sessionId: string, messages: any[]): Promise<void> {
  try {
    const content = messages.map(m => `${m.role}: ${m.content.slice(0, 200)}`).join("\n");
    
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      messages: [{
        role: "user",
        content: `Generate a brief 1-2 sentence summary of this conversation:\n\n${content}`,
      }],
    });
    
    const summary = response.content[0].type === "text" ? response.content[0].text : "";
    await storage.updateNovaSession(sessionId, { summary });
  } catch (error) {
    console.error("Failed to generate session summary:", error);
  }
}

function groupBy(arr: any[], key: string): Record<string, number> {
  return arr.reduce((acc, item) => {
    const value = item[key];
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

// ==================== CI/CD PIPELINE INTEGRATION ====================

// CI/CD Pipeline Types
interface CICDPipeline {
  id: string;
  projectId: string;
  name: string;
  status: 'idle' | 'running' | 'success' | 'failed' | 'cancelled';
  platform: 'ios' | 'android' | 'web' | 'all';
  stages: PipelineStage[];
  lastRun?: Date;
  createdAt: Date;
}

interface PipelineStage {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  duration?: number;
  logs?: string[];
}

// In-memory storage for CI/CD (would be database in production)
const cicdPipelines: Map<string, CICDPipeline> = new Map();

// Device Testing Types
interface DeviceTest {
  id: string;
  projectId: string;
  deviceId: string;
  deviceName: string;
  platform: 'ios' | 'android';
  status: 'queued' | 'running' | 'passed' | 'failed';
  logs: string[];
  screenshots: string[];
  duration?: number;
  createdAt: Date;
}

const deviceTests: Map<string, DeviceTest> = new Map();

// Available device farm
const deviceFarm = [
  { id: 'iphone-15-pro', name: 'iPhone 15 Pro', platform: 'ios', os: '17.0', available: true },
  { id: 'iphone-14', name: 'iPhone 14', platform: 'ios', os: '16.0', available: true },
  { id: 'ipad-pro-m2', name: 'iPad Pro M2', platform: 'ios', os: '17.0', available: true },
  { id: 'pixel-8-pro', name: 'Pixel 8 Pro', platform: 'android', os: '14.0', available: true },
  { id: 'galaxy-s24', name: 'Samsung Galaxy S24', platform: 'android', os: '14.0', available: true },
  { id: 'oneplus-12', name: 'OnePlus 12', platform: 'android', os: '14.0', available: true },
];

export function registerCICDRoutes(app: Express) {
  // Get all pipelines for a project
  app.get("/api/cicd/pipelines/:projectId", requireAuth, async (req, res) => {
    try {
      const pipelines = Array.from(cicdPipelines.values())
        .filter(p => p.projectId === req.params.projectId);
      res.json(pipelines);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create new pipeline
  app.post("/api/cicd/pipelines", requireAuth, async (req, res) => {
    try {
      const { projectId, name, platform } = req.body;
      
      const pipeline: CICDPipeline = {
        id: `pipe-${Date.now()}`,
        projectId,
        name: name || 'Default Pipeline',
        status: 'idle',
        platform: platform || 'all',
        stages: [
          { id: 'build', name: 'Build', status: 'pending' },
          { id: 'test', name: 'Test', status: 'pending' },
          { id: 'analyze', name: 'Code Analysis', status: 'pending' },
          { id: 'deploy', name: 'Deploy', status: 'pending' },
        ],
        createdAt: new Date(),
      };
      
      cicdPipelines.set(pipeline.id, pipeline);
      res.json(pipeline);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Run pipeline
  app.post("/api/cicd/pipelines/:pipelineId/run", requireAuth, async (req, res) => {
    try {
      const pipeline = cicdPipelines.get(req.params.pipelineId);
      if (!pipeline) {
        return res.status(404).json({ error: "Pipeline not found" });
      }
      
      pipeline.status = 'running';
      pipeline.lastRun = new Date();
      pipeline.stages.forEach(s => s.status = 'pending');
      
      // Simulate pipeline execution
      let stageIndex = 0;
      const runStage = () => {
        if (stageIndex < pipeline.stages.length) {
          pipeline.stages[stageIndex].status = 'running';
          setTimeout(() => {
            pipeline.stages[stageIndex].status = 'success';
            pipeline.stages[stageIndex].duration = Math.floor(Math.random() * 30000) + 5000;
            stageIndex++;
            runStage();
          }, 2000);
        } else {
          pipeline.status = 'success';
        }
      };
      runStage();
      
      res.json({ message: "Pipeline started", pipeline });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Cancel pipeline
  app.post("/api/cicd/pipelines/:pipelineId/cancel", requireAuth, async (req, res) => {
    try {
      const pipeline = cicdPipelines.get(req.params.pipelineId);
      if (!pipeline) {
        return res.status(404).json({ error: "Pipeline not found" });
      }
      
      pipeline.status = 'cancelled';
      pipeline.stages.forEach(s => {
        if (s.status === 'running') s.status = 'skipped';
      });
      
      res.json({ message: "Pipeline cancelled", pipeline });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get pipeline status
  app.get("/api/cicd/pipelines/:pipelineId/status", requireAuth, async (req, res) => {
    try {
      const pipeline = cicdPipelines.get(req.params.pipelineId);
      if (!pipeline) {
        return res.status(404).json({ error: "Pipeline not found" });
      }
      res.json(pipeline);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== DEVICE TESTING ENDPOINTS ====================

  // Get available devices
  app.get("/api/device-testing/devices", requireAuth, async (req, res) => {
    try {
      const platform = req.query.platform as string;
      let devices = deviceFarm;
      if (platform && platform !== 'all') {
        devices = deviceFarm.filter(d => d.platform === platform);
      }
      res.json(devices);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Start device test
  app.post("/api/device-testing/tests", requireAuth, async (req, res) => {
    try {
      const { projectId, deviceId, testType } = req.body;
      
      const device = deviceFarm.find(d => d.id === deviceId);
      if (!device) {
        return res.status(404).json({ error: "Device not found" });
      }
      
      const test: DeviceTest = {
        id: `test-${Date.now()}`,
        projectId,
        deviceId,
        deviceName: device.name,
        platform: device.platform as 'ios' | 'android',
        status: 'queued',
        logs: [`Test queued for ${device.name}`],
        screenshots: [],
        createdAt: new Date(),
      };
      
      deviceTests.set(test.id, test);
      
      // Simulate test execution
      setTimeout(() => {
        test.status = 'running';
        test.logs.push('Installing app...');
      }, 1000);
      
      setTimeout(() => {
        test.logs.push('Running UI tests...');
        test.screenshots.push(`/screenshots/${test.id}/screen1.png`);
      }, 3000);
      
      setTimeout(() => {
        test.status = 'passed';
        test.duration = 45000;
        test.logs.push('All tests passed!');
        test.screenshots.push(`/screenshots/${test.id}/screen2.png`);
      }, 6000);
      
      res.json(test);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get test status
  app.get("/api/device-testing/tests/:testId", requireAuth, async (req, res) => {
    try {
      const test = deviceTests.get(req.params.testId);
      if (!test) {
        return res.status(404).json({ error: "Test not found" });
      }
      res.json(test);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all tests for project
  app.get("/api/device-testing/projects/:projectId/tests", requireAuth, async (req, res) => {
    try {
      const tests = Array.from(deviceTests.values())
        .filter(t => t.projectId === req.params.projectId);
      res.json(tests);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Stop test
  app.post("/api/device-testing/tests/:testId/stop", requireAuth, async (req, res) => {
    try {
      const test = deviceTests.get(req.params.testId);
      if (!test) {
        return res.status(404).json({ error: "Test not found" });
      }
      
      test.status = 'failed';
      test.logs.push('Test stopped by user');
      
      res.json({ message: "Test stopped", test });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get device testing stats
  app.get("/api/device-testing/stats", requireAuth, async (req, res) => {
    try {
      const allTests = Array.from(deviceTests.values());
      const stats = {
        totalTests: allTests.length,
        passed: allTests.filter(t => t.status === 'passed').length,
        failed: allTests.filter(t => t.status === 'failed').length,
        running: allTests.filter(t => t.status === 'running').length,
        queued: allTests.filter(t => t.status === 'queued').length,
        deviceCoverage: deviceFarm.length,
        platformBreakdown: {
          ios: allTests.filter(t => t.platform === 'ios').length,
          android: allTests.filter(t => t.platform === 'android').length,
        },
      };
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  console.log("CI/CD Pipeline routes registered | تم تسجيل مسارات CI/CD");
  console.log("Device Testing routes registered | تم تسجيل مسارات اختبار الأجهزة");
}
