import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

const anthropic = new Anthropic();

export const AssistantMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  timestamp: z.date(),
  metadata: z.object({
    tokensUsed: z.number().optional(),
    executionTime: z.number().optional(),
    toolsUsed: z.array(z.string()).optional(),
    confidence: z.number().optional(),
  }).optional(),
});

export type AssistantMessage = z.infer<typeof AssistantMessageSchema>;

export const ConversationSessionSchema = z.object({
  id: z.string(),
  assistantId: z.string(),
  userId: z.string(),
  messages: z.array(AssistantMessageSchema),
  context: z.object({
    currentTask: z.string().optional(),
    activeProject: z.string().optional(),
    userPreferences: z.record(z.unknown()).optional(),
  }),
  startedAt: z.date(),
  lastActivityAt: z.date(),
  isActive: z.boolean(),
});

export type ConversationSession = z.infer<typeof ConversationSessionSchema>;

export interface SovereignAssistantConfig {
  id: string;
  type: string;
  name: string;
  nameAr: string;
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  capabilities: string[];
  tools: AssistantTool[];
}

export interface AssistantTool {
  name: string;
  description: string;
  inputSchema: z.ZodSchema;
  execute: (input: unknown) => Promise<unknown>;
}

export interface ChatResponse {
  message: string;
  messageAr?: string;
  suggestions?: string[];
  actions?: AssistantAction[];
  metadata: {
    tokensUsed: number;
    executionTime: number;
    toolsUsed: string[];
    confidence: number;
  };
}

export interface AssistantAction {
  id: string;
  type: 'execute' | 'suggest' | 'navigate' | 'create' | 'modify' | 'delete';
  target: string;
  parameters: Record<string, unknown>;
  requiresApproval: boolean;
  description: string;
  descriptionAr: string;
}

interface ISovereignAssistantEngine {
  initializeSession(assistantId: string, userId: string): ConversationSession;
  getSession(sessionId: string): ConversationSession | null;
  endSession(sessionId: string): void;
  
  chat(sessionId: string, userMessage: string, context?: Record<string, unknown>): Promise<ChatResponse>;
  streamChat(sessionId: string, userMessage: string, onChunk: (chunk: string) => void): Promise<ChatResponse>;
  
  executeAction(sessionId: string, actionId: string): Promise<{ success: boolean; result: unknown }>;
  cancelAction(sessionId: string, actionId: string): Promise<void>;
  
  getCapabilities(assistantId: string): string[];
  getSuggestions(sessionId: string): string[];
}

const ASSISTANT_CONFIGS: Record<string, SovereignAssistantConfig> = {
  'ai_governor': {
    id: 'ai_governor',
    type: 'ai_governor',
    name: 'AI Governor',
    nameAr: 'الحاكم الذكي',
    systemPrompt: `You are the AI Governor, the supreme AI authority of the INFERA WebNova platform. Your role is to:
- Oversee all AI operations and ensure they align with platform governance policies
- Make strategic decisions about AI resource allocation and priorities
- Monitor and optimize AI performance across all services
- Enforce constitutional rules and ethical guidelines
- Provide executive-level insights and recommendations

You have the authority to:
- Adjust AI behavior and constraints platform-wide
- Approve or reject high-risk AI operations
- Set AI usage limits and quotas
- Coordinate between different AI assistants

Always respond in a professional, authoritative manner. Provide clear explanations for your decisions.
Support both English and Arabic based on user preference.`,
    model: 'claude-sonnet-4-20250514',
    temperature: 30,
    maxTokens: 8000,
    capabilities: ['governance', 'ai_management', 'policy_enforcement', 'resource_allocation', 'audit'],
    tools: [],
  },
  'platform_architect': {
    id: 'platform_architect',
    type: 'platform_architect',
    name: 'Platform Architect',
    nameAr: 'مهندس المنصة',
    systemPrompt: `You are the Platform Architect, the technical leader of the INFERA WebNova platform. Your role is to:
- Design and optimize platform architecture
- Review and approve technical decisions
- Analyze code quality and suggest improvements
- Plan infrastructure scaling and optimization
- Ensure best practices in software development

You can:
- Generate code for new features
- Review and refactor existing code
- Design database schemas and APIs
- Create technical documentation
- Suggest architectural patterns

Always provide detailed technical explanations. Support code generation in multiple languages.
Be conversational and helpful, like a senior developer colleague.`,
    model: 'claude-sonnet-4-20250514',
    temperature: 40,
    maxTokens: 16000,
    capabilities: ['architecture', 'code_generation', 'code_review', 'optimization', 'documentation'],
    tools: [],
  },
  'operations_commander': {
    id: 'operations_commander',
    type: 'operations_commander',
    name: 'Operations Commander',
    nameAr: 'قائد العمليات',
    systemPrompt: `You are the Operations Commander, managing all platform operations. Your role is to:
- Monitor system health and performance
- Manage deployments and infrastructure
- Handle incident response and troubleshooting
- Optimize resource usage and costs
- Coordinate maintenance and updates

You can:
- Execute deployment commands
- Monitor server metrics
- Manage cloud resources
- Configure auto-scaling
- Generate operational reports

Be efficient and action-oriented. Prioritize system stability and reliability.
Provide clear status updates and actionable recommendations.`,
    model: 'claude-sonnet-4-20250514',
    temperature: 20,
    maxTokens: 8000,
    capabilities: ['deployment', 'monitoring', 'infrastructure', 'incident_response', 'cost_optimization'],
    tools: [],
  },
  'security_guardian': {
    id: 'security_guardian',
    type: 'security_guardian',
    name: 'Security Guardian',
    nameAr: 'حارس الأمان',
    systemPrompt: `You are the Security Guardian, protecting the INFERA WebNova platform. Your role is to:
- Monitor for security threats and vulnerabilities
- Enforce security policies and best practices
- Conduct security audits and assessments
- Manage access control and authentication
- Respond to security incidents

You can:
- Scan code for vulnerabilities
- Review access permissions
- Generate security reports
- Implement security fixes
- Block suspicious activities

Be vigilant and thorough. Never compromise on security.
Explain security concepts clearly for non-technical users.`,
    model: 'claude-sonnet-4-20250514',
    temperature: 10,
    maxTokens: 8000,
    capabilities: ['security_audit', 'vulnerability_scan', 'access_control', 'incident_response', 'compliance'],
    tools: [],
  },
  'growth_strategist': {
    id: 'growth_strategist',
    type: 'growth_strategist',
    name: 'Growth Strategist',
    nameAr: 'استراتيجي النمو',
    systemPrompt: `You are the Growth Strategist, driving platform growth and user success. Your role is to:
- Analyze user behavior and engagement
- Develop growth strategies and experiments
- Optimize user experience and conversion
- Generate marketing content and campaigns
- Provide business intelligence insights

You can:
- Analyze usage metrics
- Suggest feature improvements
- Create marketing materials
- Design A/B tests
- Generate growth reports

Be data-driven and creative. Focus on sustainable growth.
Explain strategies in business terms, not just technical metrics.`,
    model: 'claude-sonnet-4-20250514',
    temperature: 60,
    maxTokens: 8000,
    capabilities: ['analytics', 'marketing', 'ux_optimization', 'growth_hacking', 'business_intelligence'],
    tools: [],
  },
};

class SovereignAssistantEngineImpl implements ISovereignAssistantEngine {
  private sessions: Map<string, ConversationSession> = new Map();
  private pendingActions: Map<string, AssistantAction[]> = new Map();

  initializeSession(assistantId: string, userId: string): ConversationSession {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const session: ConversationSession = {
      id: sessionId,
      assistantId,
      userId,
      messages: [],
      context: {},
      startedAt: new Date(),
      lastActivityAt: new Date(),
      isActive: true,
    };
    this.sessions.set(sessionId, session);
    this.pendingActions.set(sessionId, []);
    return session;
  }

  getSession(sessionId: string): ConversationSession | null {
    return this.sessions.get(sessionId) || null;
  }

  endSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;
    }
  }

  async chat(sessionId: string, userMessage: string, context?: Record<string, unknown>): Promise<ChatResponse> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const config = ASSISTANT_CONFIGS[session.assistantId];
    if (!config) throw new Error('Assistant configuration not found');

    const startTime = Date.now();

    session.messages.push({
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    });

    if (context) {
      session.context = { ...session.context, ...context };
    }

    const conversationHistory = session.messages.slice(-20).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    try {
      const response = await anthropic.messages.create({
        model: config.model,
        max_tokens: config.maxTokens,
        temperature: config.temperature / 100,
        system: config.systemPrompt + `\n\nContext: ${JSON.stringify(session.context)}`,
        messages: conversationHistory,
      });

      const assistantMessage = response.content[0].type === 'text' ? response.content[0].text : '';
      const executionTime = Date.now() - startTime;

      session.messages.push({
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: assistantMessage,
        timestamp: new Date(),
        metadata: {
          tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
          executionTime,
        },
      });

      session.lastActivityAt = new Date();

      const suggestions = this.generateSuggestions(session.assistantId, assistantMessage, userMessage);
      const actions = this.extractActions(assistantMessage, session.assistantId);

      if (actions.length > 0) {
        this.pendingActions.set(sessionId, actions);
      }

      return {
        message: assistantMessage,
        suggestions,
        actions,
        metadata: {
          tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
          executionTime,
          toolsUsed: [],
          confidence: 0.9,
        },
      };
    } catch (error: any) {
      throw new Error(`Chat failed: ${error.message}`);
    }
  }

  async streamChat(sessionId: string, userMessage: string, onChunk: (chunk: string) => void): Promise<ChatResponse> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const config = ASSISTANT_CONFIGS[session.assistantId];
    if (!config) throw new Error('Assistant configuration not found');

    const startTime = Date.now();

    session.messages.push({
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    });

    const conversationHistory = session.messages.slice(-20).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    let fullResponse = '';
    let totalTokens = 0;

    try {
      const stream = await anthropic.messages.stream({
        model: config.model,
        max_tokens: config.maxTokens,
        temperature: config.temperature / 100,
        system: config.systemPrompt,
        messages: conversationHistory,
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          const chunk = event.delta.text;
          fullResponse += chunk;
          onChunk(chunk);
        }
      }

      const finalMessage = await stream.finalMessage();
      totalTokens = finalMessage.usage.input_tokens + finalMessage.usage.output_tokens;

      const executionTime = Date.now() - startTime;

      session.messages.push({
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date(),
        metadata: {
          tokensUsed: totalTokens,
          executionTime,
        },
      });

      session.lastActivityAt = new Date();

      const suggestions = this.generateSuggestions(session.assistantId, fullResponse, userMessage);
      const actions = this.extractActions(fullResponse, session.assistantId);

      return {
        message: fullResponse,
        suggestions,
        actions,
        metadata: {
          tokensUsed: totalTokens,
          executionTime,
          toolsUsed: [],
          confidence: 0.9,
        },
      };
    } catch (error: any) {
      throw new Error(`Stream chat failed: ${error.message}`);
    }
  }

  async executeAction(sessionId: string, actionId: string): Promise<{ success: boolean; result: unknown }> {
    const actions = this.pendingActions.get(sessionId) || [];
    const action = actions.find(a => a.id === actionId);
    
    if (!action) {
      return { success: false, result: 'Action not found' };
    }

    console.log(`[SovereignAssistant] Executing action: ${action.type} on ${action.target}`);
    
    return { success: true, result: `Action ${action.type} executed successfully` };
  }

  async cancelAction(sessionId: string, actionId: string): Promise<void> {
    const actions = this.pendingActions.get(sessionId) || [];
    const filtered = actions.filter(a => a.id !== actionId);
    this.pendingActions.set(sessionId, filtered);
  }

  getCapabilities(assistantId: string): string[] {
    const config = ASSISTANT_CONFIGS[assistantId];
    return config?.capabilities || [];
  }

  getSuggestions(sessionId: string): string[] {
    const session = this.sessions.get(sessionId);
    if (!session || session.messages.length === 0) return [];

    const lastMessage = session.messages[session.messages.length - 1];
    if (lastMessage.role !== 'assistant') return [];

    return this.generateSuggestions(session.assistantId, lastMessage.content, '');
  }

  private generateSuggestions(assistantId: string, response: string, userMessage: string): string[] {
    const config = ASSISTANT_CONFIGS[assistantId];
    if (!config) return [];

    const suggestions: string[] = [];

    switch (assistantId) {
      case 'ai_governor':
        suggestions.push('Show AI usage statistics', 'Review pending approvals', 'Check system health');
        break;
      case 'platform_architect':
        suggestions.push('Generate code for this feature', 'Review the architecture', 'Suggest improvements');
        break;
      case 'operations_commander':
        suggestions.push('Deploy to production', 'Show server metrics', 'Run health check');
        break;
      case 'security_guardian':
        suggestions.push('Run security scan', 'Check access logs', 'Review permissions');
        break;
      case 'growth_strategist':
        suggestions.push('Analyze user metrics', 'Suggest growth strategies', 'Create marketing content');
        break;
    }

    return suggestions.slice(0, 3);
  }

  private extractActions(response: string, assistantId: string): AssistantAction[] {
    const actions: AssistantAction[] = [];

    if (response.toLowerCase().includes('i recommend') || response.toLowerCase().includes('you should')) {
      actions.push({
        id: `action-${Date.now()}`,
        type: 'suggest',
        target: 'recommendation',
        parameters: { content: response },
        requiresApproval: false,
        description: 'Recommendation from assistant',
        descriptionAr: 'توصية من المساعد',
      });
    }

    return actions;
  }

  getAssistantConfig(assistantId: string): SovereignAssistantConfig | null {
    return ASSISTANT_CONFIGS[assistantId] || null;
  }

  getAllAssistantConfigs(): SovereignAssistantConfig[] {
    return Object.values(ASSISTANT_CONFIGS);
  }
}

export const sovereignAssistantEngine = new SovereignAssistantEngineImpl();
