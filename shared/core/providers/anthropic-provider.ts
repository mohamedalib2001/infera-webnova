/**
 * INFERA WebNova - Anthropic AI Provider
 * Real AI provider implementation using Anthropic Claude
 */

import Anthropic from '@anthropic-ai/sdk';

export interface AIProviderConfig {
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface GenerationRequest {
  prompt: string;
  systemPrompt?: string;
  context?: Record<string, unknown>;
  config?: Partial<AIProviderConfig>;
}

export interface GenerationResponse {
  content: string;
  model: string;
  tokens: {
    input: number;
    output: number;
  };
  stopReason: string;
}

export interface AnalysisRequest {
  type: 'code' | 'blueprint' | 'security' | 'performance' | 'intent';
  data: unknown;
  context?: string;
  language?: 'ar' | 'en';
}

export interface AnalysisResponse {
  analysis: string;
  insights: string[];
  recommendations: string[];
  confidence: number;
  tokens: { input: number; output: number };
}

export interface IAIProvider {
  generate(request: GenerationRequest): Promise<GenerationResponse>;
  analyze(request: AnalysisRequest): Promise<AnalysisResponse>;
  generateCode(prompt: string, language: string, context?: string): Promise<{ code: string; explanation: string }>;
  reviewCode(code: string, language: string): Promise<{ issues: string[]; suggestions: string[]; score: number }>;
  extractIntent(naturalLanguage: string, language: 'ar' | 'en'): Promise<{
    intents: Array<{ type: string; description: string; priority: string; confidence: number }>;
    domain: string;
    complexity: string;
  }>;
}

const DEFAULT_CONFIG: AIProviderConfig = {
  model: 'claude-sonnet-4-20250514',
  maxTokens: 8192,
  temperature: 0.7,
};

export class AnthropicProviderError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AnthropicProviderError';
  }
}

class AnthropicProvider implements IAIProvider {
  private client: Anthropic;
  private config: AIProviderConfig;

  constructor(config: Partial<AIProviderConfig> = {}) {
    this.client = new Anthropic({
      apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
    });
    this.config = { ...DEFAULT_CONFIG, ...config };
    console.log(`[AnthropicProvider] Initialized with model: ${this.config.model}`);
  }

  async generate(request: GenerationRequest): Promise<GenerationResponse> {
    const config = { ...this.config, ...request.config };

    const messages: Anthropic.MessageParam[] = [
      { role: 'user', content: request.prompt },
    ];

    const response = await this.client.messages.create({
      model: config.model,
      max_tokens: config.maxTokens,
      system: request.systemPrompt || 'You are a helpful AI assistant.',
      messages,
    });

    const textContent = response.content.find(c => c.type === 'text');

    return {
      content: textContent?.type === 'text' ? textContent.text : '',
      model: response.model,
      tokens: {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
      },
      stopReason: response.stop_reason || 'end_turn',
    };
  }

  async analyze(request: AnalysisRequest): Promise<AnalysisResponse> {
    const systemPrompts: Record<AnalysisRequest['type'], string> = {
      code: 'You are an expert code analyzer. Analyze the provided code and return insights in JSON format with keys: analysis, insights (array), recommendations (array), confidence (0-1).',
      blueprint: 'You are an expert system architect. Analyze the provided blueprint and return insights in JSON format with keys: analysis, insights (array), recommendations (array), confidence (0-1).',
      security: 'You are a security expert. Analyze the provided data for security vulnerabilities and return findings in JSON format with keys: analysis, insights (array), recommendations (array), confidence (0-1).',
      performance: 'You are a performance optimization expert. Analyze the provided data for performance issues and return findings in JSON format with keys: analysis, insights (array), recommendations (array), confidence (0-1).',
      intent: 'You are an expert at understanding user intent. Analyze the provided text and extract the user intent in JSON format with keys: analysis, insights (array), recommendations (array), confidence (0-1).',
    };

    const languageInstruction = request.language === 'ar' 
      ? 'Respond in Arabic (العربية).' 
      : 'Respond in English.';

    const response = await this.generate({
      prompt: `Analyze this ${request.type} data:\n\n${JSON.stringify(request.data, null, 2)}\n\n${request.context || ''}`,
      systemPrompt: `${systemPrompts[request.type]} ${languageInstruction}`,
      config: { temperature: 0.3 },
    });

    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new AnthropicProviderError(
        'Failed to extract JSON from analysis response',
        'PARSE_ERROR',
        { rawContent: response.content.substring(0, 200) }
      );
    }

    try {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        analysis: parsed.analysis || '',
        insights: Array.isArray(parsed.insights) ? parsed.insights : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.8,
        tokens: response.tokens,
      };
    } catch (parseError) {
      throw new AnthropicProviderError(
        'Failed to parse JSON from analysis response',
        'JSON_PARSE_ERROR',
        { rawContent: jsonMatch[0].substring(0, 200), error: String(parseError) }
      );
    }
  }

  async generateCode(prompt: string, language: string, context?: string): Promise<{ code: string; explanation: string }> {
    const systemPrompt = `You are an expert ${language} developer. Generate clean, production-ready code based on the user's request. Return your response in JSON format with keys: code (the actual code), explanation (brief explanation of the code).`;

    const response = await this.generate({
      prompt: `${context ? `Context: ${context}\n\n` : ''}Generate ${language} code for: ${prompt}`,
      systemPrompt,
      config: { temperature: 0.2 },
    });

    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (typeof parsed.code === 'string') {
          return {
            code: parsed.code,
            explanation: parsed.explanation || 'Code generated successfully.',
          };
        }
      } catch {
        // Continue to code block extraction
      }
    }

    const codeMatch = response.content.match(/```[\w]*\n([\s\S]*?)```/);
    if (codeMatch) {
      return {
        code: codeMatch[1],
        explanation: 'Code extracted from code block.',
      };
    }

    throw new AnthropicProviderError(
      'Failed to extract code from response',
      'CODE_EXTRACTION_ERROR',
      { rawContent: response.content.substring(0, 200) }
    );
  }

  async reviewCode(code: string, language: string): Promise<{ issues: string[]; suggestions: string[]; score: number }> {
    const systemPrompt = `You are an expert code reviewer specializing in ${language}. Review the provided code for bugs, security issues, performance problems, and best practices. Return your review in JSON format with keys: issues (array of strings), suggestions (array of strings), score (0-100).`;

    const response = await this.generate({
      prompt: `Review this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``,
      systemPrompt,
      config: { temperature: 0.2 },
    });

    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new AnthropicProviderError(
        'Failed to extract JSON from code review response',
        'PARSE_ERROR',
        { rawContent: response.content.substring(0, 200) }
      );
    }

    try {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        issues: Array.isArray(parsed.issues) ? parsed.issues : [],
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
        score: typeof parsed.score === 'number' ? parsed.score : 80,
      };
    } catch (parseError) {
      throw new AnthropicProviderError(
        'Failed to parse JSON from code review response',
        'JSON_PARSE_ERROR',
        { rawContent: jsonMatch[0].substring(0, 200), error: String(parseError) }
      );
    }
  }

  async extractIntent(naturalLanguage: string, language: 'ar' | 'en'): Promise<{
    intents: Array<{ type: string; description: string; priority: string; confidence: number }>;
    domain: string;
    complexity: string;
  }> {
    const systemPrompt = language === 'ar'
      ? `أنت خبير في تحليل متطلبات المشاريع. قم بتحليل النص المقدم واستخراج النوايا والمتطلبات. أرجع النتيجة بصيغة JSON مع المفاتيح: intents (مصفوفة من الكائنات مع type, description, priority, confidence), domain (المجال), complexity (simple/moderate/complex/enterprise).`
      : `You are an expert at analyzing project requirements. Analyze the provided text and extract intents and requirements. Return the result in JSON format with keys: intents (array of objects with type, description, priority, confidence), domain (the domain/industry), complexity (simple/moderate/complex/enterprise).`;

    const response = await this.generate({
      prompt: naturalLanguage,
      systemPrompt,
      config: { temperature: 0.3 },
    });

    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new AnthropicProviderError(
        'Failed to extract JSON from intent extraction response',
        'PARSE_ERROR',
        { rawContent: response.content.substring(0, 200) }
      );
    }

    try {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        intents: Array.isArray(parsed.intents) ? parsed.intents : [],
        domain: parsed.domain || 'general',
        complexity: parsed.complexity || 'moderate',
      };
    } catch (parseError) {
      throw new AnthropicProviderError(
        'Failed to parse JSON from intent extraction response',
        'JSON_PARSE_ERROR',
        { rawContent: jsonMatch[0].substring(0, 200), error: String(parseError) }
      );
    }
  }
}

export const anthropicProvider: IAIProvider = new AnthropicProvider();

export function createAnthropicProvider(config?: Partial<AIProviderConfig>): IAIProvider {
  return new AnthropicProvider(config);
}
