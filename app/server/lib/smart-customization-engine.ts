import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

interface CommandResult {
  success: boolean;
  action: string;
  actionAr: string;
  changes: ModificationChange[];
  updatedArchitecture: any;
  explanation: string;
  explanationAr: string;
}

interface ModificationChange {
  type: "add" | "remove" | "modify" | "rename";
  target: "field" | "entity" | "permission" | "workflow" | "api";
  path: string;
  before?: any;
  after?: any;
  description: string;
  descriptionAr: string;
}

interface Suggestion {
  id: string;
  type: "security" | "performance" | "ux" | "data-integrity" | "best-practice";
  priority: "high" | "medium" | "low";
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  command: string;
  autoApply: boolean;
}

interface CustomizationState {
  architecture: any;
  baselineArchitecture: any;
  history: CommandResult[];
  suggestions: Suggestion[];
}

const COMMAND_PATTERNS = {
  addField: /أضف\s+(حقل|عمود|خاصية)\s+(.+?)\s+(في|إلى|لـ)\s+(.+)/i,
  removeField: /احذف\s+(حقل|عمود|خاصية)\s+(.+?)\s+(من)\s+(.+)/i,
  changeType: /غير\s+(نوع|صنف)\s+(.+?)\s+(إلى|لـ)\s+(.+)/i,
  addEntity: /أضف\s+(جدول|كيان|نموذج)\s+(.+)/i,
  addPermission: /أضف\s+(صلاحية|إذن)\s+(.+?)\s+(لـ|إلى)\s+(.+)/i,
  addValidation: /أضف\s+(تحقق|قيد)\s+(.+?)\s+(على|لـ)\s+(.+)/i,
  makeRequired: /اجعل\s+(.+?)\s+(إلزامي|مطلوب)/i,
  makeOptional: /اجعل\s+(.+?)\s+(اختياري)/i,
  addRelation: /أضف\s+(علاقة|ارتباط)\s+(بين)\s+(.+?)\s+(و)\s+(.+)/i,
  rename: /أعد\s+تسمية\s+(.+?)\s+(إلى|لـ)\s+(.+)/i,
};

class SmartCustomizationEngine {
  private states = new Map<string, CustomizationState>();

  async processCommand(
    sessionId: string,
    command: string,
    architecture: any
  ): Promise<CommandResult> {
    const state = this.getOrCreateState(sessionId, architecture);
    
    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [{
          role: "user",
          content: `أنت محرك تخصيص ذكي للمنصات الرقمية. قم بتحليل الأمر التالي وتطبيقه على البنية:

الأمر: "${command}"

البنية الحالية:
${JSON.stringify(architecture, null, 2)}

أعد النتيجة بصيغة JSON فقط:
{
  "success": true/false,
  "action": "وصف الإجراء بالإنجليزية",
  "actionAr": "وصف الإجراء بالعربية",
  "changes": [
    {
      "type": "add|remove|modify|rename",
      "target": "field|entity|permission|workflow|api",
      "path": "مسار العنصر (مثل: entities.user.fields.email)",
      "before": "القيمة السابقة إن وجدت",
      "after": "القيمة الجديدة",
      "description": "وصف التغيير بالإنجليزية",
      "descriptionAr": "وصف التغيير بالعربية"
    }
  ],
  "updatedArchitecture": { البنية المحدثة بالكامل },
  "explanation": "شرح ما تم بالإنجليزية",
  "explanationAr": "شرح ما تم بالعربية"
}

ملاحظات:
- إذا كان الأمر غامضًا، اتخذ القرار الأفضل
- حافظ على سلامة البنية
- أضف التحققات المناسبة تلقائيًا
- استخدم أسماء واضحة بالإنجليزية للحقول التقنية`
        }]
      });

      const content = response.content[0];
      if (content.type !== "text") throw new Error("Invalid response");
      
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      
      const result: CommandResult = JSON.parse(jsonMatch[0]);
      
      if (result.success) {
        state.architecture = result.updatedArchitecture;
        state.history.push(result);
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        action: "Failed to process command",
        actionAr: "فشل في معالجة الأمر",
        changes: [],
        updatedArchitecture: architecture,
        explanation: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        explanationAr: "حدث خطأ أثناء المعالجة"
      };
    }
  }

  async generateSuggestions(architecture: any): Promise<Suggestion[]> {
    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [{
          role: "user",
          content: `أنت خبير في أفضل ممارسات تصميم الأنظمة. حلل البنية التالية وقدم مقترحات تحسين:

البنية:
${JSON.stringify(architecture, null, 2)}

أعد النتيجة بصيغة JSON - قائمة مقترحات:
[
  {
    "id": "معرف فريد",
    "type": "security|performance|ux|data-integrity|best-practice",
    "priority": "high|medium|low",
    "title": "عنوان المقترح بالإنجليزية",
    "titleAr": "عنوان المقترح بالعربية",
    "description": "وصف تفصيلي بالإنجليزية",
    "descriptionAr": "وصف تفصيلي بالعربية",
    "command": "الأمر النصي لتطبيق المقترح",
    "autoApply": true/false
  }
]

فئات المقترحات:
- security: تحسينات أمنية (تشفير، صلاحيات، تحقق)
- performance: تحسينات الأداء (فهرسة، تخزين مؤقت)
- ux: تحسينات تجربة المستخدم
- data-integrity: سلامة البيانات (علاقات، قيود)
- best-practice: أفضل الممارسات العامة

قدم 5-10 مقترحات مرتبة حسب الأهمية`
        }]
      });

      const content = response.content[0];
      if (content.type !== "text") throw new Error("Invalid response");
      
      const jsonMatch = content.text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return this.getDefaultSuggestions();
      
      return JSON.parse(jsonMatch[0]);
    } catch {
      return this.getDefaultSuggestions();
    }
  }

  async applyDeepModification(
    sessionId: string,
    modification: {
      type: "restructure" | "optimize" | "secure" | "normalize" | "denormalize";
      target?: string;
      options?: Record<string, any>;
    },
    architecture: any
  ): Promise<CommandResult> {
    const prompts: Record<string, string> = {
      restructure: "أعد هيكلة البنية لتحسين التنظيم والقابلية للتوسع",
      optimize: "حسّن البنية للأداء مع الحفاظ على سلامة البيانات",
      secure: "طبق أفضل ممارسات الأمان على جميع الكيانات",
      normalize: "طبع قواعد التطبيع على نموذج البيانات",
      denormalize: "أضف حقول مكررة استراتيجية لتحسين الأداء"
    };

    const command = prompts[modification.type] || "حسّن البنية";
    return this.processCommand(sessionId, command, architecture);
  }

  async batchCommands(
    sessionId: string,
    commands: string[],
    architecture: any
  ): Promise<CommandResult[]> {
    const results: CommandResult[] = [];
    let currentArch = architecture;
    
    for (const command of commands) {
      const result = await this.processCommand(sessionId, command, currentArch);
      results.push(result);
      if (result.success) {
        currentArch = result.updatedArchitecture;
      }
    }
    
    return results;
  }

  undoLastCommand(sessionId: string): CommandResult | null {
    const state = this.states.get(sessionId);
    if (!state || state.history.length === 0) return null;
    
    const lastResult = state.history.pop();
    if (state.history.length > 0) {
      state.architecture = state.history[state.history.length - 1].updatedArchitecture;
    } else {
      state.architecture = state.baselineArchitecture || {};
    }
    return lastResult || null;
  }

  getHistory(sessionId: string): CommandResult[] {
    return this.states.get(sessionId)?.history || [];
  }

  getCurrentArchitecture(sessionId: string): any {
    return this.states.get(sessionId)?.architecture;
  }

  private getOrCreateState(sessionId: string, architecture: any): CustomizationState {
    if (!this.states.has(sessionId)) {
      this.states.set(sessionId, {
        architecture,
        baselineArchitecture: JSON.parse(JSON.stringify(architecture)),
        history: [],
        suggestions: []
      });
    }
    return this.states.get(sessionId)!;
  }

  private getDefaultSuggestions(): Suggestion[] {
    return [
      {
        id: "add-timestamps",
        type: "best-practice",
        priority: "medium",
        title: "Add timestamp fields",
        titleAr: "إضافة حقول الوقت",
        description: "Add createdAt and updatedAt fields to all entities",
        descriptionAr: "أضف حقول createdAt و updatedAt لجميع الكيانات",
        command: "أضف حقل تاريخ الإنشاء والتحديث لجميع الكيانات",
        autoApply: true
      },
      {
        id: "add-soft-delete",
        type: "data-integrity",
        priority: "medium",
        title: "Implement soft delete",
        titleAr: "تفعيل الحذف الناعم",
        description: "Add isDeleted field instead of permanent deletion",
        descriptionAr: "أضف حقل isDeleted بدلاً من الحذف النهائي",
        command: "أضف حقل isDeleted لجميع الكيانات",
        autoApply: true
      },
      {
        id: "add-audit-log",
        type: "security",
        priority: "high",
        title: "Add audit logging",
        titleAr: "إضافة سجل المراجعة",
        description: "Track all changes with user and timestamp",
        descriptionAr: "تتبع جميع التغييرات مع المستخدم والوقت",
        command: "أضف كيان سجل المراجعة مع ربطه بجميع العمليات",
        autoApply: false
      }
    ];
  }
}

export const smartCustomizationEngine = new SmartCustomizationEngine();
