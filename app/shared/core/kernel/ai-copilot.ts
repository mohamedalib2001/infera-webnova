/**
 * 🤖 AI Copilot System - Advanced Code Intelligence
 * نظام المساعد الذكي للبرمجة
 * 
 * Provides:
 * - Real-time code analysis and suggestions
 * - Intelligent autocomplete
 * - Code explanation and documentation
 * - Error detection and fixing
 * - Best practices recommendations
 * - Security vulnerability detection
 */

import Anthropic from "@anthropic-ai/sdk";

// Initialize Anthropic client
const anthropic = new Anthropic();

// ==================== TYPES ====================

export interface CodeContext {
  code: string;
  language: string;
  filename?: string;
  cursorPosition?: { line: number; column: number };
  selectedCode?: string;
  projectContext?: string;
}

export interface CodeSuggestion {
  id: string;
  type: 'completion' | 'refactor' | 'fix' | 'security' | 'performance' | 'best_practice';
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  code?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-100
  lineStart?: number;
  lineEnd?: number;
}

export interface CodeAnalysis {
  summary: string;
  summaryAr: string;
  suggestions: CodeSuggestion[];
  metrics: {
    complexity: number; // 1-10
    maintainability: number; // 1-100
    readability: number; // 1-100
    securityScore: number; // 1-100
  };
  issues: {
    errors: string[];
    warnings: string[];
    info: string[];
  };
}

export interface ExplanationResult {
  explanation: string;
  explanationAr: string;
  concepts: Array<{
    term: string;
    termAr: string;
    definition: string;
    definitionAr: string;
  }>;
  flowDiagram?: string;
}

export interface FixResult {
  fixed: boolean;
  originalCode: string;
  fixedCode: string;
  explanation: string;
  explanationAr: string;
  changes: Array<{
    line: number;
    before: string;
    after: string;
    reason: string;
    reasonAr: string;
  }>;
}

export interface AutocompleteResult {
  completions: Array<{
    text: string;
    displayText: string;
    type: 'function' | 'variable' | 'class' | 'property' | 'keyword' | 'snippet';
    documentation?: string;
    insertText: string;
  }>;
}

// ==================== AI COPILOT CLASS ====================

export class AICopilot {
  private model = "claude-sonnet-4-20250514";
  private maxTokens = 4096;

  /**
   * Analyze code and provide intelligent suggestions
   */
  async analyzeCode(context: CodeContext): Promise<CodeAnalysis> {
    const systemPrompt = `You are an expert code analyzer. Analyze the provided code and return a JSON response with:
1. A brief summary of what the code does
2. Suggestions for improvements (refactoring, performance, security, best practices)
3. Metrics for complexity, maintainability, readability, and security
4. Any issues found (errors, warnings, info)

Respond ONLY with valid JSON in this exact format:
{
  "summary": "English summary",
  "summaryAr": "Arabic summary",
  "suggestions": [
    {
      "id": "unique-id",
      "type": "completion|refactor|fix|security|performance|best_practice",
      "title": "Title in English",
      "titleAr": "Title in Arabic",
      "description": "Description in English",
      "descriptionAr": "Description in Arabic",
      "code": "suggested code if applicable",
      "priority": "low|medium|high|critical",
      "confidence": 85,
      "lineStart": 1,
      "lineEnd": 10
    }
  ],
  "metrics": {
    "complexity": 5,
    "maintainability": 75,
    "readability": 80,
    "securityScore": 90
  },
  "issues": {
    "errors": [],
    "warnings": [],
    "info": []
  }
}`;

    const userPrompt = `Analyze this ${context.language} code${context.filename ? ` from file "${context.filename}"` : ''}:

\`\`\`${context.language}
${context.code}
\`\`\`

${context.projectContext ? `Project context: ${context.projectContext}` : ''}

Provide comprehensive analysis with actionable suggestions.`;

    try {
      const response = await anthropic.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        messages: [
          { role: "user", content: userPrompt }
        ],
        system: systemPrompt,
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type');
      }

      // Parse JSON response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      return JSON.parse(jsonMatch[0]) as CodeAnalysis;
    } catch (error: any) {
      console.error('Code analysis failed:', error);
      return {
        summary: 'Analysis failed',
        summaryAr: 'فشل التحليل',
        suggestions: [],
        metrics: {
          complexity: 5,
          maintainability: 50,
          readability: 50,
          securityScore: 50,
        },
        issues: {
          errors: [error.message],
          warnings: [],
          info: [],
        },
      };
    }
  }

  /**
   * Explain code in detail
   */
  async explainCode(context: CodeContext): Promise<ExplanationResult> {
    const systemPrompt = `You are a patient coding teacher. Explain the provided code clearly for both beginners and experienced developers.

Respond ONLY with valid JSON in this exact format:
{
  "explanation": "Detailed explanation in English",
  "explanationAr": "Detailed explanation in Arabic",
  "concepts": [
    {
      "term": "Technical term",
      "termAr": "المصطلح بالعربية",
      "definition": "Definition in English",
      "definitionAr": "التعريف بالعربية"
    }
  ],
  "flowDiagram": "Optional ASCII flow diagram"
}`;

    const userPrompt = `Explain this ${context.language} code:

\`\`\`${context.language}
${context.selectedCode || context.code}
\`\`\`

Provide a clear, educational explanation with key concepts.`;

    try {
      const response = await anthropic.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        messages: [
          { role: "user", content: userPrompt }
        ],
        system: systemPrompt,
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type');
      }

      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      return JSON.parse(jsonMatch[0]) as ExplanationResult;
    } catch (error: any) {
      console.error('Code explanation failed:', error);
      return {
        explanation: 'Failed to explain code: ' + error.message,
        explanationAr: 'فشل في شرح الكود: ' + error.message,
        concepts: [],
      };
    }
  }

  /**
   * Fix code errors automatically
   */
  async fixCode(context: CodeContext, errorMessage?: string): Promise<FixResult> {
    const systemPrompt = `You are an expert debugger. Fix the provided code and explain the changes.

Respond ONLY with valid JSON in this exact format:
{
  "fixed": true,
  "originalCode": "original code",
  "fixedCode": "corrected code",
  "explanation": "What was wrong and how it was fixed (English)",
  "explanationAr": "ما كان الخطأ وكيف تم إصلاحه (Arabic)",
  "changes": [
    {
      "line": 5,
      "before": "old code",
      "after": "new code",
      "reason": "Why this change was made (English)",
      "reasonAr": "سبب هذا التغيير (Arabic)"
    }
  ]
}`;

    const userPrompt = `Fix this ${context.language} code${errorMessage ? ` which has this error: "${errorMessage}"` : ''}:

\`\`\`${context.language}
${context.code}
\`\`\`

Provide the corrected code with detailed explanations.`;

    try {
      const response = await anthropic.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        messages: [
          { role: "user", content: userPrompt }
        ],
        system: systemPrompt,
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type');
      }

      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      return JSON.parse(jsonMatch[0]) as FixResult;
    } catch (error: any) {
      console.error('Code fix failed:', error);
      return {
        fixed: false,
        originalCode: context.code,
        fixedCode: context.code,
        explanation: 'Failed to fix code: ' + error.message,
        explanationAr: 'فشل في إصلاح الكود: ' + error.message,
        changes: [],
      };
    }
  }

  /**
   * Provide intelligent autocomplete suggestions
   */
  async getAutocomplete(context: CodeContext): Promise<AutocompleteResult> {
    const systemPrompt = `You are an intelligent code completion engine. Based on the cursor position and code context, provide relevant completions.

Respond ONLY with valid JSON in this exact format:
{
  "completions": [
    {
      "text": "completion text",
      "displayText": "what to show in the menu",
      "type": "function|variable|class|property|keyword|snippet",
      "documentation": "brief documentation",
      "insertText": "text to insert"
    }
  ]
}

Provide up to 10 most relevant completions.`;

    const lines = context.code.split('\n');
    const cursorLine = context.cursorPosition?.line || lines.length;
    const precedingCode = lines.slice(0, cursorLine).join('\n');
    const followingCode = lines.slice(cursorLine).join('\n');

    const userPrompt = `Provide autocomplete suggestions for ${context.language} at the cursor position (marked with |CURSOR|):

\`\`\`${context.language}
${precedingCode}|CURSOR|${followingCode}
\`\`\`

Consider the code context and provide relevant completions.`;

    try {
      const response = await anthropic.messages.create({
        model: this.model,
        max_tokens: 2048,
        messages: [
          { role: "user", content: userPrompt }
        ],
        system: systemPrompt,
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type');
      }

      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      return JSON.parse(jsonMatch[0]) as AutocompleteResult;
    } catch (error: any) {
      console.error('Autocomplete failed:', error);
      return { completions: [] };
    }
  }

  /**
   * Generate code from natural language description
   */
  async generateCode(
    description: string,
    language: string,
    context?: string
  ): Promise<{ code: string; explanation: string; explanationAr: string }> {
    const systemPrompt = `You are an expert programmer. Generate clean, production-ready code based on the description.

Respond ONLY with valid JSON in this exact format:
{
  "code": "generated code here",
  "explanation": "Explanation of what the code does (English)",
  "explanationAr": "شرح ما يفعله الكود (Arabic)"
}

Follow best practices, add appropriate error handling, and include helpful comments.`;

    const userPrompt = `Generate ${language} code for: ${description}

${context ? `Context: ${context}` : ''}

The code should be clean, well-documented, and production-ready.`;

    try {
      const response = await anthropic.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        messages: [
          { role: "user", content: userPrompt }
        ],
        system: systemPrompt,
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type');
      }

      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error: any) {
      console.error('Code generation failed:', error);
      return {
        code: `// Failed to generate code: ${error.message}`,
        explanation: 'Code generation failed: ' + error.message,
        explanationAr: 'فشل في توليد الكود: ' + error.message,
      };
    }
  }

  /**
   * Refactor code for better quality
   */
  async refactorCode(
    context: CodeContext,
    goal: 'performance' | 'readability' | 'maintainability' | 'security' | 'all'
  ): Promise<{
    refactoredCode: string;
    changes: string[];
    changesAr: string[];
    improvement: { before: number; after: number };
  }> {
    const systemPrompt = `You are an expert code refactoring specialist. Refactor the code to improve ${goal === 'all' ? 'overall quality' : goal}.

Respond ONLY with valid JSON in this exact format:
{
  "refactoredCode": "the refactored code",
  "changes": ["List of changes made (English)"],
  "changesAr": ["قائمة التغييرات (Arabic)"],
  "improvement": {
    "before": 65,
    "after": 90
  }
}`;

    const userPrompt = `Refactor this ${context.language} code to improve ${goal}:

\`\`\`${context.language}
${context.code}
\`\`\`

Apply best practices and modern patterns.`;

    try {
      const response = await anthropic.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        messages: [
          { role: "user", content: userPrompt }
        ],
        system: systemPrompt,
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type');
      }

      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error: any) {
      console.error('Code refactoring failed:', error);
      return {
        refactoredCode: context.code,
        changes: ['Refactoring failed: ' + error.message],
        changesAr: ['فشل إعادة الهيكلة: ' + error.message],
        improvement: { before: 50, after: 50 },
      };
    }
  }

  /**
   * Detect security vulnerabilities
   */
  async scanSecurity(context: CodeContext): Promise<{
    vulnerabilities: Array<{
      id: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      type: string;
      description: string;
      descriptionAr: string;
      line?: number;
      fix?: string;
    }>;
    score: number;
    recommendation: string;
    recommendationAr: string;
  }> {
    const systemPrompt = `You are a security expert. Analyze the code for security vulnerabilities.

Respond ONLY with valid JSON in this exact format:
{
  "vulnerabilities": [
    {
      "id": "VULN-001",
      "severity": "high",
      "type": "SQL Injection",
      "description": "Description of the vulnerability (English)",
      "descriptionAr": "وصف الثغرة (Arabic)",
      "line": 15,
      "fix": "Suggested fix code"
    }
  ],
  "score": 85,
  "recommendation": "Overall security recommendation (English)",
  "recommendationAr": "التوصية الأمنية العامة (Arabic)"
}`;

    const userPrompt = `Scan this ${context.language} code for security vulnerabilities:

\`\`\`${context.language}
${context.code}
\`\`\`

Check for common vulnerabilities like injection, XSS, authentication issues, etc.`;

    try {
      const response = await anthropic.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        messages: [
          { role: "user", content: userPrompt }
        ],
        system: systemPrompt,
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type');
      }

      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error: any) {
      console.error('Security scan failed:', error);
      return {
        vulnerabilities: [],
        score: 50,
        recommendation: 'Security scan failed: ' + error.message,
        recommendationAr: 'فشل الفحص الأمني: ' + error.message,
      };
    }
  }

  /**
   * Generate unit tests for code
   */
  async generateTests(
    context: CodeContext,
    framework: 'jest' | 'vitest' | 'mocha' | 'pytest' = 'jest'
  ): Promise<{
    tests: string;
    coverage: string[];
    explanation: string;
    explanationAr: string;
  }> {
    const systemPrompt = `You are a testing expert. Generate comprehensive unit tests using ${framework}.

Respond ONLY with valid JSON in this exact format:
{
  "tests": "complete test code",
  "coverage": ["List of scenarios covered"],
  "explanation": "Explanation of test strategy (English)",
  "explanationAr": "شرح استراتيجية الاختبار (Arabic)"
}

Include edge cases, error scenarios, and mock dependencies where needed.`;

    const userPrompt = `Generate ${framework} unit tests for this ${context.language} code:

\`\`\`${context.language}
${context.code}
\`\`\`

Cover all public functions, edge cases, and error handling.`;

    try {
      const response = await anthropic.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        messages: [
          { role: "user", content: userPrompt }
        ],
        system: systemPrompt,
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type');
      }

      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error: any) {
      console.error('Test generation failed:', error);
      return {
        tests: `// Test generation failed: ${error.message}`,
        coverage: [],
        explanation: 'Test generation failed: ' + error.message,
        explanationAr: 'فشل توليد الاختبارات: ' + error.message,
      };
    }
  }

  /**
   * Chat with AI about code - Enhanced with context understanding
   */
  async chat(
    message: string,
    context?: CodeContext,
    history: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ): Promise<{ response: string; responseAr: string }> {
    const systemPrompt = `You are an expert programming assistant. Help the user with their coding questions.
Respond in both English and Arabic. Be helpful, accurate, and provide code examples when relevant.

Respond ONLY with valid JSON:
{
  "response": "Your response in English",
  "responseAr": "ردك بالعربية"
}`;

    const contextMessage = context
      ? `\n\nCode context:\n\`\`\`${context.language}\n${context.code}\n\`\`\``
      : '';

    const messages = [
      ...history.map(h => ({ role: h.role as 'user' | 'assistant', content: h.content })),
      { role: 'user' as const, content: message + contextMessage }
    ];

    try {
      const response = await anthropic.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        messages,
        system: systemPrompt,
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type');
      }

      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        // If no JSON, return raw text
        return {
          response: content.text,
          responseAr: content.text,
        };
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error: any) {
      console.error('Chat failed:', error);
      return {
        response: 'Sorry, I encountered an error: ' + error.message,
        responseAr: 'عذراً، حدث خطأ: ' + error.message,
      };
    }
  }

  /**
   * Advanced contextual chat with memory and coherent responses like Claude
   * محادثة متقدمة مع ذاكرة السياق وردود متناسقة
   */
  async contextualChat(
    message: string,
    options: {
      projectContext?: {
        projectName: string;
        projectType: string;
        techStack: string[];
        currentFiles?: string[];
        recentChanges?: string[];
      };
      conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
      codeContext?: CodeContext;
      userPreferences?: {
        language: 'ar' | 'en';
        detailLevel: 'brief' | 'detailed' | 'comprehensive';
        codeStyle?: 'functional' | 'oop' | 'mixed';
      };
      sessionMemory?: {
        topics: string[];
        decisions: string[];
        pendingActions: string[];
      };
    } = {}
  ): Promise<{
    response: string;
    responseAr: string;
    suggestedActions?: Array<{ action: string; actionAr: string; type: string }>;
    contextUpdates?: {
      newTopics?: string[];
      newDecisions?: string[];
      newPendingActions?: string[];
    };
    confidence: number;
  }> {
    const {
      projectContext,
      conversationHistory = [],
      codeContext,
      userPreferences = { language: 'en', detailLevel: 'detailed' },
      sessionMemory = { topics: [], decisions: [], pendingActions: [] }
    } = options;

    const systemPrompt = `You are an advanced AI programming assistant with contextual memory and coherent conversation capabilities.

## Your Core Traits:
1. **Context Awareness**: You remember previous conversations and maintain coherence across messages
2. **Proactive Assistance**: Suggest relevant actions based on context
3. **Adaptive Communication**: Match the user's language preference and detail level
4. **Technical Excellence**: Provide accurate, production-ready code and advice
5. **Bilingual Support**: Respond in both English and Arabic

## Current Project Context:
${projectContext ? `
- Project: ${projectContext.projectName}
- Type: ${projectContext.projectType}
- Tech Stack: ${projectContext.techStack.join(', ')}
${projectContext.currentFiles ? `- Active Files: ${projectContext.currentFiles.slice(0, 5).join(', ')}` : ''}
${projectContext.recentChanges ? `- Recent Changes: ${projectContext.recentChanges.slice(0, 3).join(', ')}` : ''}
` : 'No project context provided'}

## Session Memory:
${sessionMemory.topics.length > 0 ? `- Topics Discussed: ${sessionMemory.topics.join(', ')}` : ''}
${sessionMemory.decisions.length > 0 ? `- Decisions Made: ${sessionMemory.decisions.join(', ')}` : ''}
${sessionMemory.pendingActions.length > 0 ? `- Pending Actions: ${sessionMemory.pendingActions.join(', ')}` : ''}

## User Preferences:
- Language: ${userPreferences.language === 'ar' ? 'Arabic preferred' : 'English preferred'}
- Detail Level: ${userPreferences.detailLevel}
${userPreferences.codeStyle ? `- Code Style: ${userPreferences.codeStyle}` : ''}

## Response Guidelines:
1. Be coherent with previous messages - reference past discussions when relevant
2. Provide actionable suggestions when appropriate
3. Update context with new topics, decisions, or pending actions
4. Match the user's communication style
5. Include code examples when they would be helpful

Respond ONLY with valid JSON:
{
  "response": "Your detailed response in English",
  "responseAr": "ردك المفصل بالعربية",
  "suggestedActions": [
    {"action": "Action description", "actionAr": "وصف الإجراء", "type": "code|config|review|deploy|test"}
  ],
  "contextUpdates": {
    "newTopics": ["any new topics discussed"],
    "newDecisions": ["any decisions made"],
    "newPendingActions": ["any new action items"]
  },
  "confidence": 95
}`;

    const codeContextStr = codeContext
      ? `\n\nCode Context:\n\`\`\`${codeContext.language}\n${codeContext.code}\n\`\`\``
      : '';

    const messages = [
      ...conversationHistory.slice(-10).map(h => ({ 
        role: h.role as 'user' | 'assistant', 
        content: h.content 
      })),
      { role: 'user' as const, content: message + codeContextStr }
    ];

    try {
      const response = await anthropic.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        messages,
        system: systemPrompt,
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type');
      }

      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return {
          response: content.text,
          responseAr: content.text,
          confidence: 70,
        };
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return {
        response: parsed.response || content.text,
        responseAr: parsed.responseAr || parsed.response || content.text,
        suggestedActions: parsed.suggestedActions || [],
        contextUpdates: parsed.contextUpdates || {},
        confidence: parsed.confidence || 85,
      };
    } catch (error: any) {
      console.error('Contextual chat failed:', error);
      return {
        response: 'I apologize, I encountered an error processing your request. Please try again.',
        responseAr: 'أعتذر، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.',
        confidence: 0,
      };
    }
  }

  /**
   * Smart conversation summarizer - maintains context across sessions
   * ملخص المحادثة الذكي - يحافظ على السياق عبر الجلسات
   */
  async summarizeConversation(
    history: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<{
    summary: string;
    summaryAr: string;
    keyPoints: string[];
    keyPointsAr: string[];
    actionItems: string[];
    actionItemsAr: string[];
    topicsDiscussed: string[];
  }> {
    if (history.length === 0) {
      return {
        summary: 'No conversation to summarize.',
        summaryAr: 'لا توجد محادثة لتلخيصها.',
        keyPoints: [],
        keyPointsAr: [],
        actionItems: [],
        actionItemsAr: [],
        topicsDiscussed: [],
      };
    }

    const systemPrompt = `Summarize this programming conversation. Extract key points, action items, and topics.

Respond ONLY with valid JSON:
{
  "summary": "Brief summary in English",
  "summaryAr": "ملخص موجز بالعربية",
  "keyPoints": ["Key point 1", "Key point 2"],
  "keyPointsAr": ["النقطة الرئيسية 1", "النقطة الرئيسية 2"],
  "actionItems": ["Action 1", "Action 2"],
  "actionItemsAr": ["الإجراء 1", "الإجراء 2"],
  "topicsDiscussed": ["topic1", "topic2"]
}`;

    const conversationText = history
      .map(h => `${h.role}: ${h.content}`)
      .join('\n\n');

    try {
      const response = await anthropic.messages.create({
        model: this.model,
        max_tokens: 1024,
        messages: [{ role: 'user', content: `Summarize this conversation:\n\n${conversationText}` }],
        system: systemPrompt,
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type');
      }

      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error: any) {
      console.error('Summarization failed:', error);
      return {
        summary: 'Failed to summarize conversation.',
        summaryAr: 'فشل تلخيص المحادثة.',
        keyPoints: [],
        keyPointsAr: [],
        actionItems: [],
        actionItemsAr: [],
        topicsDiscussed: [],
      };
    }
  }
}

// Export singleton instance
export const aiCopilot = new AICopilot();
