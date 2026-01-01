/**
 * INFERA WebNova - Smart Template Bank
 * حافظة القوالب الذكية
 * 
 * Features:
 * - Automatic pattern recall from description (استدعاء تلقائي للأنماط)
 * - Component assembly from previous projects (تجميع مكونات من مشاريع سابقة)
 * - Context-aware template adaptation (تكييف القوالب حسب السياق)
 * 
 * Integration:
 * - Uses Anthropic Claude for intelligent pattern matching
 * - Persists templates with JSON file backup
 * - Integrates with Smart Code Generator for code generation
 */

import crypto from 'crypto';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), '.template-bank-data.json');

interface TemplateComponent {
  id: string;
  name: string;
  nameAr: string;
  type: 'ui' | 'logic' | 'api' | 'database' | 'integration' | 'workflow';
  category: string;
  categoryAr: string;
  code: string;
  language: 'typescript' | 'javascript' | 'sql' | 'css' | 'html' | 'json';
  dependencies: string[];
  tags: string[];
  tagsAr: string[];
  usageCount: number;
  lastUsed?: Date;
  createdAt: Date;
  projectSource?: string;
}

interface TemplatePattern {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  sector: string;
  sectorAr: string;
  components: string[];
  structure: Record<string, any>;
  examples: string[];
  matchKeywords: string[];
  matchKeywordsAr: string[];
  usageCount: number;
  rating: number;
  createdAt: Date;
}

interface ProjectTemplate {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  sector: string;
  sectorAr: string;
  patterns: string[];
  components: string[];
  schema: Record<string, any>;
  apis: Record<string, any>[];
  uiSpec: Record<string, any>;
  config: Record<string, any>;
  thumbnail?: string;
  demoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TemplateMatch {
  template: ProjectTemplate | TemplatePattern | TemplateComponent;
  type: 'project' | 'pattern' | 'component';
  score: number;
  reason: string;
  reasonAr: string;
}

interface AdaptedTemplate {
  original: ProjectTemplate | TemplatePattern;
  adapted: Record<string, any>;
  changes: Array<{ field: string; original: any; adapted: any; reason: string }>;
  confidence: number;
}

interface PersistedData {
  components: Record<string, TemplateComponent>;
  patterns: Record<string, TemplatePattern>;
  templates: Record<string, ProjectTemplate>;
}

class SmartTemplateBank {
  private components = new Map<string, TemplateComponent>();
  private patterns = new Map<string, TemplatePattern>();
  private templates = new Map<string, ProjectTemplate>();
  private anthropic: Anthropic | null = null;
  private persistTimeout: NodeJS.Timeout | null = null;

  constructor() {
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      } catch (e) {
        console.error('[SmartTemplateBank] Failed to initialize Anthropic:', e);
      }
    }
    this.loadData();
    this.initializeDefaultTemplates();
  }

  private loadData(): void {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const data: PersistedData = JSON.parse(raw);
        
        for (const [k, v] of Object.entries(data.components || {})) {
          this.components.set(k, { ...v, createdAt: new Date(v.createdAt), lastUsed: v.lastUsed ? new Date(v.lastUsed) : undefined });
        }
        for (const [k, v] of Object.entries(data.patterns || {})) {
          this.patterns.set(k, { ...v, createdAt: new Date(v.createdAt) });
        }
        for (const [k, v] of Object.entries(data.templates || {})) {
          this.templates.set(k, { ...v, createdAt: new Date(v.createdAt), updatedAt: new Date(v.updatedAt) });
        }
        console.log(`[SmartTemplateBank] Loaded ${this.components.size} components, ${this.patterns.size} patterns, ${this.templates.size} templates`);
      }
    } catch (e) {
      console.error('[SmartTemplateBank] Failed to load data:', e);
    }
  }

  private persistData(): void {
    if (this.persistTimeout) clearTimeout(this.persistTimeout);
    this.persistTimeout = setTimeout(() => {
      try {
        const data: PersistedData = {
          components: Object.fromEntries(this.components),
          patterns: Object.fromEntries(this.patterns),
          templates: Object.fromEntries(this.templates)
        };
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
      } catch (e) {
        console.error('[SmartTemplateBank] Failed to persist data:', e);
      }
    }, 1000);
  }

  private initializeDefaultTemplates(): void {
    if (this.patterns.size > 0) return;

    const defaultPatterns: Omit<TemplatePattern, 'id' | 'createdAt'>[] = [
      {
        name: 'CRUD Operations',
        nameAr: 'عمليات CRUD',
        description: 'Standard Create, Read, Update, Delete pattern for entities',
        descriptionAr: 'نمط الإنشاء والقراءة والتحديث والحذف القياسي للكيانات',
        sector: 'general',
        sectorAr: 'عام',
        components: [],
        structure: { endpoints: ['GET /', 'GET /:id', 'POST /', 'PUT /:id', 'DELETE /:id'] },
        examples: ['User management', 'Product catalog', 'Order system'],
        matchKeywords: ['crud', 'create', 'read', 'update', 'delete', 'manage', 'list', 'add', 'edit', 'remove'],
        matchKeywordsAr: ['إنشاء', 'قراءة', 'تحديث', 'حذف', 'إدارة', 'قائمة', 'إضافة', 'تعديل', 'إزالة'],
        usageCount: 0,
        rating: 4.5
      },
      {
        name: 'Authentication Flow',
        nameAr: 'تدفق المصادقة',
        description: 'Complete authentication with login, register, password reset',
        descriptionAr: 'مصادقة كاملة مع تسجيل الدخول والتسجيل وإعادة تعيين كلمة المرور',
        sector: 'security',
        sectorAr: 'الأمان',
        components: [],
        structure: { endpoints: ['POST /login', 'POST /register', 'POST /forgot-password', 'POST /reset-password'] },
        examples: ['User portal', 'Admin dashboard', 'Member area'],
        matchKeywords: ['auth', 'login', 'register', 'signup', 'password', 'session', 'token', 'jwt'],
        matchKeywordsAr: ['مصادقة', 'تسجيل الدخول', 'تسجيل', 'كلمة المرور', 'جلسة', 'رمز'],
        usageCount: 0,
        rating: 4.8
      },
      {
        name: 'Dashboard Layout',
        nameAr: 'تخطيط لوحة التحكم',
        description: 'Admin dashboard with sidebar, stats cards, charts',
        descriptionAr: 'لوحة تحكم إدارية مع شريط جانبي وبطاقات إحصائية ورسوم بيانية',
        sector: 'ui',
        sectorAr: 'واجهة المستخدم',
        components: [],
        structure: { layout: 'sidebar', sections: ['stats', 'charts', 'tables', 'actions'] },
        examples: ['Admin panel', 'Analytics dashboard', 'Control center'],
        matchKeywords: ['dashboard', 'admin', 'panel', 'stats', 'analytics', 'chart', 'overview'],
        matchKeywordsAr: ['لوحة تحكم', 'إدارة', 'إحصائيات', 'تحليلات', 'رسم بياني', 'نظرة عامة'],
        usageCount: 0,
        rating: 4.6
      },
      {
        name: 'E-commerce Cart',
        nameAr: 'سلة التسوق',
        description: 'Shopping cart with products, quantities, checkout flow',
        descriptionAr: 'سلة تسوق مع المنتجات والكميات وتدفق الدفع',
        sector: 'ecommerce',
        sectorAr: 'التجارة الإلكترونية',
        components: [],
        structure: { entities: ['cart', 'cart_items', 'products'], flow: ['add', 'update', 'remove', 'checkout'] },
        examples: ['Online store', 'Marketplace', 'Product shop'],
        matchKeywords: ['cart', 'shopping', 'checkout', 'buy', 'purchase', 'order', 'ecommerce', 'store'],
        matchKeywordsAr: ['سلة', 'تسوق', 'دفع', 'شراء', 'طلب', 'متجر'],
        usageCount: 0,
        rating: 4.7
      },
      {
        name: 'Form Builder',
        nameAr: 'منشئ النماذج',
        description: 'Dynamic form generation with validation and submission',
        descriptionAr: 'إنشاء نماذج ديناميكية مع التحقق والإرسال',
        sector: 'ui',
        sectorAr: 'واجهة المستخدم',
        components: [],
        structure: { fields: ['text', 'select', 'checkbox', 'file'], validation: true, submission: 'api' },
        examples: ['Contact form', 'Registration', 'Survey'],
        matchKeywords: ['form', 'input', 'field', 'validation', 'submit', 'survey', 'questionnaire'],
        matchKeywordsAr: ['نموذج', 'إدخال', 'حقل', 'تحقق', 'إرسال', 'استبيان'],
        usageCount: 0,
        rating: 4.4
      },
      {
        name: 'Payment Integration',
        nameAr: 'تكامل الدفع',
        description: 'Payment processing with multiple gateways support',
        descriptionAr: 'معالجة الدفع مع دعم بوابات متعددة',
        sector: 'financial',
        sectorAr: 'مالي',
        components: [],
        structure: { gateways: ['stripe', 'paypal', 'local'], webhooks: true, refunds: true },
        examples: ['Subscription service', 'Online payment', 'Donation platform'],
        matchKeywords: ['payment', 'pay', 'stripe', 'paypal', 'checkout', 'transaction', 'billing'],
        matchKeywordsAr: ['دفع', 'فاتورة', 'معاملة', 'اشتراك', 'بوابة دفع'],
        usageCount: 0,
        rating: 4.9
      },
      {
        name: 'Notification System',
        nameAr: 'نظام الإشعارات',
        description: 'Multi-channel notifications: email, SMS, push, in-app',
        descriptionAr: 'إشعارات متعددة القنوات: بريد إلكتروني، رسائل نصية، إشعارات فورية، داخل التطبيق',
        sector: 'communication',
        sectorAr: 'الاتصالات',
        components: [],
        structure: { channels: ['email', 'sms', 'push', 'in_app'], templates: true, scheduling: true },
        examples: ['Alert system', 'Marketing', 'User notifications'],
        matchKeywords: ['notification', 'notify', 'alert', 'email', 'sms', 'push', 'message'],
        matchKeywordsAr: ['إشعار', 'تنبيه', 'بريد', 'رسالة', 'إعلام'],
        usageCount: 0,
        rating: 4.5
      },
      {
        name: 'File Upload System',
        nameAr: 'نظام رفع الملفات',
        description: 'File upload with validation, storage, and preview',
        descriptionAr: 'رفع الملفات مع التحقق والتخزين والمعاينة',
        sector: 'storage',
        sectorAr: 'التخزين',
        components: [],
        structure: { types: ['image', 'document', 'video'], storage: 'cloud', preview: true },
        examples: ['Document manager', 'Gallery', 'Asset library'],
        matchKeywords: ['upload', 'file', 'image', 'document', 'attachment', 'storage', 'media'],
        matchKeywordsAr: ['رفع', 'ملف', 'صورة', 'مستند', 'مرفق', 'تخزين', 'وسائط'],
        usageCount: 0,
        rating: 4.3
      }
    ];

    for (const pattern of defaultPatterns) {
      const id = `pattern_${crypto.randomBytes(4).toString('hex')}`;
      this.patterns.set(id, { ...pattern, id, createdAt: new Date() });
    }

    const defaultComponents: Omit<TemplateComponent, 'id' | 'createdAt'>[] = [
      {
        name: 'API Route Handler',
        nameAr: 'معالج مسار API',
        type: 'api',
        category: 'Backend',
        categoryAr: 'الخلفية',
        code: `app.get('/api/resource', async (req, res) => {
  try {
    const data = await storage.getAll();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});`,
        language: 'typescript',
        dependencies: ['express'],
        tags: ['api', 'route', 'handler', 'rest'],
        tagsAr: ['واجهة برمجة', 'مسار', 'معالج'],
        usageCount: 0
      },
      {
        name: 'React Form Component',
        nameAr: 'مكون نموذج React',
        type: 'ui',
        category: 'Frontend',
        categoryAr: 'الواجهة الأمامية',
        code: `function FormComponent({ onSubmit }) {
  const form = useForm({ resolver: zodResolver(schema) });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField control={form.control} name="field" render={({ field }) => (
          <FormItem>
            <FormLabel>Field</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}`,
        language: 'typescript',
        dependencies: ['react-hook-form', 'zod', '@hookform/resolvers'],
        tags: ['form', 'react', 'validation', 'ui'],
        tagsAr: ['نموذج', 'واجهة', 'تحقق'],
        usageCount: 0
      },
      {
        name: 'Database Table Schema',
        nameAr: 'مخطط جدول قاعدة البيانات',
        type: 'database',
        category: 'Database',
        categoryAr: 'قاعدة البيانات',
        code: `export const tableName = pgTable("table_name", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});`,
        language: 'typescript',
        dependencies: ['drizzle-orm', 'pg'],
        tags: ['database', 'schema', 'table', 'drizzle'],
        tagsAr: ['قاعدة بيانات', 'مخطط', 'جدول'],
        usageCount: 0
      },
      {
        name: 'TanStack Query Hook',
        nameAr: 'خطاف TanStack Query',
        type: 'logic',
        category: 'Frontend',
        categoryAr: 'الواجهة الأمامية',
        code: `function useResource(id?: string) {
  return useQuery({
    queryKey: ['/api/resource', id],
    enabled: !!id
  });
}`,
        language: 'typescript',
        dependencies: ['@tanstack/react-query'],
        tags: ['query', 'hook', 'data', 'fetch'],
        tagsAr: ['استعلام', 'خطاف', 'بيانات'],
        usageCount: 0
      },
      {
        name: 'Authentication Middleware',
        nameAr: 'وسيط المصادقة',
        type: 'logic',
        category: 'Security',
        categoryAr: 'الأمان',
        code: `async function requireAuth(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}`,
        language: 'typescript',
        dependencies: ['passport'],
        tags: ['auth', 'middleware', 'security', 'session'],
        tagsAr: ['مصادقة', 'وسيط', 'أمان'],
        usageCount: 0
      }
    ];

    for (const component of defaultComponents) {
      const id = `comp_${crypto.randomBytes(4).toString('hex')}`;
      this.components.set(id, { ...component, id, createdAt: new Date() });
    }

    this.persistData();
    console.log('[SmartTemplateBank] Initialized with default patterns and components');
  }

  async findMatchingPatterns(description: string, limit: number = 5): Promise<TemplateMatch[]> {
    const descLower = description.toLowerCase();
    const matches: TemplateMatch[] = [];

    for (const pattern of this.patterns.values()) {
      let score = 0;
      let matchedKeywords: string[] = [];

      for (const keyword of pattern.matchKeywords) {
        if (descLower.includes(keyword.toLowerCase())) {
          score += 10;
          matchedKeywords.push(keyword);
        }
      }
      for (const keyword of pattern.matchKeywordsAr) {
        if (description.includes(keyword)) {
          score += 10;
          matchedKeywords.push(keyword);
        }
      }

      if (descLower.includes(pattern.name.toLowerCase())) score += 20;
      if (description.includes(pattern.nameAr)) score += 20;

      if (score > 0) {
        matches.push({
          template: pattern,
          type: 'pattern',
          score,
          reason: `Matched keywords: ${matchedKeywords.join(', ')}`,
          reasonAr: `الكلمات المتطابقة: ${matchedKeywords.join('، ')}`
        });
      }
    }

    if (this.anthropic && matches.length < limit) {
      try {
        const aiMatches = await this.aiPatternMatch(description);
        for (const match of aiMatches) {
          if (!matches.find(m => (m.template as TemplatePattern).id === match.template.id)) {
            matches.push(match);
          }
        }
      } catch (e) {
        console.error('[SmartTemplateBank] AI pattern match failed:', e);
      }
    }

    return matches.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  private async aiPatternMatch(description: string): Promise<TemplateMatch[]> {
    if (!this.anthropic) return [];

    const patternsInfo = Array.from(this.patterns.values()).map(p => ({
      id: p.id,
      name: p.name,
      nameAr: p.nameAr,
      description: p.description,
      keywords: p.matchKeywords
    }));

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Analyze this project description and find matching patterns.

Description: ${description}

Available patterns:
${JSON.stringify(patternsInfo, null, 2)}

Return JSON array of matches with format:
[{"id": "pattern_id", "score": 0-100, "reason": "why it matches", "reasonAr": "السبب بالعربية"}]

Only include patterns with score > 50.`
      }]
    });

    try {
      const text = (response.content[0] as any).text;
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const matches = JSON.parse(jsonMatch[0]);
        return matches.map((m: any) => {
          const pattern = this.patterns.get(m.id);
          if (!pattern) return null;
          return {
            template: pattern,
            type: 'pattern' as const,
            score: m.score,
            reason: m.reason,
            reasonAr: m.reasonAr
          };
        }).filter(Boolean);
      }
    } catch (e) {
      console.error('[SmartTemplateBank] Failed to parse AI response:', e);
    }

    return [];
  }

  async findMatchingComponents(requirements: string, type?: TemplateComponent['type']): Promise<TemplateMatch[]> {
    const reqLower = requirements.toLowerCase();
    const matches: TemplateMatch[] = [];

    for (const component of this.components.values()) {
      if (type && component.type !== type) continue;

      let score = 0;
      let matchedTags: string[] = [];

      for (const tag of component.tags) {
        if (reqLower.includes(tag.toLowerCase())) {
          score += 15;
          matchedTags.push(tag);
        }
      }

      if (reqLower.includes(component.name.toLowerCase())) score += 25;
      if (requirements.includes(component.nameAr)) score += 25;

      score += Math.min(component.usageCount * 2, 20);

      if (score > 0) {
        matches.push({
          template: component,
          type: 'component',
          score,
          reason: `Matched: ${matchedTags.join(', ')} (used ${component.usageCount} times)`,
          reasonAr: `متطابق: ${matchedTags.join('، ')} (مستخدم ${component.usageCount} مرات)`
        });
      }
    }

    return matches.sort((a, b) => b.score - a.score);
  }

  async adaptTemplateToContext(
    templateId: string,
    context: { sector: string; requirements: string; customizations?: Record<string, any> }
  ): Promise<AdaptedTemplate | null> {
    const pattern = this.patterns.get(templateId);
    const template = this.templates.get(templateId);
    const source = pattern || template;

    if (!source) return null;

    const changes: AdaptedTemplate['changes'] = [];
    let adapted: Record<string, any> = { ...source };

    if (context.sector && source.sector !== context.sector) {
      changes.push({
        field: 'sector',
        original: source.sector,
        adapted: context.sector,
        reason: 'Adapted to target sector'
      });
      adapted.sector = context.sector;
    }

    if (context.customizations) {
      for (const [key, value] of Object.entries(context.customizations)) {
        if ((source as any)[key] !== value) {
          changes.push({
            field: key,
            original: (source as any)[key],
            adapted: value,
            reason: 'User customization'
          });
          adapted[key] = value;
        }
      }
    }

    if (this.anthropic && context.requirements) {
      try {
        const aiAdaptation = await this.aiAdaptTemplate(source, context);
        if (aiAdaptation) {
          adapted = { ...adapted, ...aiAdaptation.adaptations };
          changes.push(...aiAdaptation.changes);
        }
      } catch (e) {
        console.error('[SmartTemplateBank] AI adaptation failed:', e);
      }
    }

    return {
      original: source as ProjectTemplate | TemplatePattern,
      adapted,
      changes,
      confidence: this.calculateAdaptationConfidence(changes)
    };
  }

  private async aiAdaptTemplate(
    template: TemplatePattern | ProjectTemplate,
    context: { sector: string; requirements: string }
  ): Promise<{ adaptations: Record<string, any>; changes: AdaptedTemplate['changes'] } | null> {
    if (!this.anthropic) return null;

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: `Adapt this template for the given context.

Template:
${JSON.stringify(template, null, 2)}

Target Sector: ${context.sector}
Requirements: ${context.requirements}

Return JSON with:
{
  "adaptations": { field: newValue, ... },
  "changes": [{ "field": "name", "original": "old", "adapted": "new", "reason": "why" }]
}

Only include meaningful adaptations that improve the template for this context.`
      }]
    });

    try {
      const text = (response.content[0] as any).text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('[SmartTemplateBank] Failed to parse AI adaptation:', e);
    }

    return null;
  }

  private calculateAdaptationConfidence(changes: AdaptedTemplate['changes']): number {
    if (changes.length === 0) return 1.0;
    const userChanges = changes.filter(c => c.reason === 'User customization').length;
    const aiChanges = changes.length - userChanges;
    return Math.max(0.5, 1 - (aiChanges * 0.1));
  }

  async assembleFromProjects(
    projectIds: string[],
    targetSpec: { name: string; sector: string; features: string[] }
  ): Promise<{ components: TemplateComponent[]; patterns: TemplatePattern[]; assembled: Record<string, any> }> {
    const collectedComponents: TemplateComponent[] = [];
    const collectedPatterns: TemplatePattern[] = [];

    for (const feature of targetSpec.features) {
      const patternMatches = await this.findMatchingPatterns(feature, 3);
      for (const match of patternMatches) {
        if (match.type === 'pattern' && !collectedPatterns.find(p => p.id === (match.template as TemplatePattern).id)) {
          collectedPatterns.push(match.template as TemplatePattern);
        }
      }

      const componentMatches = await this.findMatchingComponents(feature);
      for (const match of componentMatches.slice(0, 3)) {
        if (!collectedComponents.find(c => c.id === (match.template as TemplateComponent).id)) {
          collectedComponents.push(match.template as TemplateComponent);
        }
      }
    }

    const assembled = {
      name: targetSpec.name,
      sector: targetSpec.sector,
      patterns: collectedPatterns.map(p => p.id),
      components: collectedComponents.map(c => c.id),
      structure: this.mergeStructures(collectedPatterns),
      dependencies: this.collectDependencies(collectedComponents)
    };

    return { components: collectedComponents, patterns: collectedPatterns, assembled };
  }

  private mergeStructures(patterns: TemplatePattern[]): Record<string, any> {
    const merged: Record<string, any> = {};
    for (const pattern of patterns) {
      for (const [key, value] of Object.entries(pattern.structure)) {
        if (Array.isArray(value) && Array.isArray(merged[key])) {
          merged[key] = [...new Set([...merged[key], ...value])];
        } else if (typeof value === 'object' && typeof merged[key] === 'object') {
          merged[key] = { ...merged[key], ...value };
        } else {
          merged[key] = value;
        }
      }
    }
    return merged;
  }

  private collectDependencies(components: TemplateComponent[]): string[] {
    const deps = new Set<string>();
    for (const comp of components) {
      for (const dep of comp.dependencies) {
        deps.add(dep);
      }
    }
    return Array.from(deps);
  }

  addComponent(data: Omit<TemplateComponent, 'id' | 'createdAt' | 'usageCount'>): TemplateComponent {
    const id = `comp_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const component: TemplateComponent = {
      ...data,
      id,
      usageCount: 0,
      createdAt: new Date()
    };
    this.components.set(id, component);
    this.persistData();
    return component;
  }

  addPattern(data: Omit<TemplatePattern, 'id' | 'createdAt' | 'usageCount' | 'rating'>): TemplatePattern {
    const id = `pattern_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const pattern: TemplatePattern = {
      ...data,
      id,
      usageCount: 0,
      rating: 0,
      createdAt: new Date()
    };
    this.patterns.set(id, pattern);
    this.persistData();
    return pattern;
  }

  addTemplate(data: Omit<ProjectTemplate, 'id' | 'createdAt' | 'updatedAt'>): ProjectTemplate {
    const id = `template_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const template: ProjectTemplate = {
      ...data,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.templates.set(id, template);
    this.persistData();
    return template;
  }

  recordUsage(itemId: string, type: 'component' | 'pattern' | 'template'): void {
    if (type === 'component') {
      const comp = this.components.get(itemId);
      if (comp) {
        comp.usageCount++;
        comp.lastUsed = new Date();
        this.components.set(itemId, comp);
      }
    } else if (type === 'pattern') {
      const pattern = this.patterns.get(itemId);
      if (pattern) {
        pattern.usageCount++;
        this.patterns.set(itemId, pattern);
      }
    }
    this.persistData();
  }

  getComponent(id: string): TemplateComponent | undefined {
    return this.components.get(id);
  }

  getPattern(id: string): TemplatePattern | undefined {
    return this.patterns.get(id);
  }

  getTemplate(id: string): ProjectTemplate | undefined {
    return this.templates.get(id);
  }

  listComponents(type?: TemplateComponent['type']): TemplateComponent[] {
    const all = Array.from(this.components.values());
    if (type) return all.filter(c => c.type === type);
    return all.sort((a, b) => b.usageCount - a.usageCount);
  }

  listPatterns(sector?: string): TemplatePattern[] {
    const all = Array.from(this.patterns.values());
    if (sector) return all.filter(p => p.sector === sector);
    return all.sort((a, b) => b.usageCount - a.usageCount);
  }

  listTemplates(sector?: string): ProjectTemplate[] {
    const all = Array.from(this.templates.values());
    if (sector) return all.filter(t => t.sector === sector);
    return all.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  getStats(): {
    totalComponents: number;
    totalPatterns: number;
    totalTemplates: number;
    mostUsedComponents: TemplateComponent[];
    mostUsedPatterns: TemplatePattern[];
    componentsByType: Record<string, number>;
    patternsBySector: Record<string, number>;
  } {
    const components = Array.from(this.components.values());
    const patterns = Array.from(this.patterns.values());

    const componentsByType: Record<string, number> = {};
    for (const c of components) {
      componentsByType[c.type] = (componentsByType[c.type] || 0) + 1;
    }

    const patternsBySector: Record<string, number> = {};
    for (const p of patterns) {
      patternsBySector[p.sector] = (patternsBySector[p.sector] || 0) + 1;
    }

    return {
      totalComponents: components.length,
      totalPatterns: patterns.length,
      totalTemplates: this.templates.size,
      mostUsedComponents: components.sort((a, b) => b.usageCount - a.usageCount).slice(0, 5),
      mostUsedPatterns: patterns.sort((a, b) => b.usageCount - a.usageCount).slice(0, 5),
      componentsByType,
      patternsBySector
    };
  }
}

export const smartTemplateBank = new SmartTemplateBank();
