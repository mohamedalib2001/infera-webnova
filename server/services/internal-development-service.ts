/**
 * Internal Development Service - خدمة التطوير الداخلي
 * 
 * نظام متكامل للتطوير داخل المنصة مع:
 * - محرر أكواد متقدم
 * - تحليل الموارد والأداء
 * - إعادة الهيكلة بالذكاء الاصطناعي
 * - تحسين التكلفة
 */

import Anthropic from "@anthropic-ai/sdk";

interface FileNode {
  path: string;
  name: string;
  type: 'file' | 'directory';
  content?: string;
  size?: number;
  language?: string;
  children?: FileNode[];
}

interface ResourceMetrics {
  memoryUsage: {
    estimated: string;
    breakdown: { component: string; usage: string; percentage: number }[];
  };
  cpuUsage: {
    estimated: string;
    hotspots: { file: string; line: number; description: string }[];
  };
  bundleSize: {
    total: string;
    breakdown: { module: string; size: string; percentage: number }[];
  };
  networkCalls: {
    count: number;
    optimizable: { endpoint: string; suggestion: string }[];
  };
}

interface PerformanceIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'memory' | 'cpu' | 'network' | 'bundle' | 'rendering' | 'database';
  file: string;
  line?: number;
  description: string;
  suggestion: string;
  estimatedImpact: string;
  autoFixAvailable: boolean;
}

interface RefactoringResult {
  originalCode: string;
  refactoredCode: string;
  changes: {
    type: string;
    description: string;
    linesBefore: number;
    linesAfter: number;
  }[];
  metrics: {
    complexityReduction: string;
    performanceGain: string;
    readabilityScore: number;
  };
}

interface CostAnalysis {
  currentEstimate: {
    compute: string;
    storage: string;
    network: string;
    total: string;
  };
  optimizedEstimate: {
    compute: string;
    storage: string;
    network: string;
    total: string;
  };
  savings: string;
  recommendations: {
    category: string;
    action: string;
    impact: string;
    effort: 'low' | 'medium' | 'high';
  }[];
}

class InternalDevelopmentService {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic();
    console.log("[InternalDev] Service initialized | تم تهيئة خدمة التطوير الداخلي");
  }

  /**
   * Get project file tree
   * الحصول على شجرة ملفات المشروع
   */
  async getProjectFiles(repositoryId: string): Promise<FileNode[]> {
    const { sovereignGitEngine } = await import('../lib/sovereign-git-engine');
    
    const files = await sovereignGitEngine.getRepositoryFiles(repositoryId, 'main');
    return this.buildFileTree(files);
  }

  private buildFileTree(files: any[]): FileNode[] {
    const tree: FileNode[] = [];
    const pathMap = new Map<string, FileNode>();

    for (const file of files) {
      const parts = file.path.split('/');
      let currentPath = '';

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLast = i === parts.length - 1;
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (!pathMap.has(currentPath)) {
          const node: FileNode = {
            path: currentPath,
            name: part,
            type: isLast && file.type !== 'tree' ? 'file' : 'directory',
            language: isLast ? this.detectLanguage(part) : undefined,
            size: file.size,
            content: file.content,
            children: isLast && file.type !== 'tree' ? undefined : []
          };

          pathMap.set(currentPath, node);

          if (parentPath && pathMap.has(parentPath)) {
            pathMap.get(parentPath)!.children!.push(node);
          } else if (!parentPath) {
            tree.push(node);
          }
        }
      }
    }

    return tree;
  }

  private detectLanguage(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      'ts': 'typescript', 'tsx': 'typescript',
      'js': 'javascript', 'jsx': 'javascript',
      'py': 'python', 'pyw': 'python',
      'go': 'go',
      'rs': 'rust',
      'java': 'java',
      'cpp': 'cpp', 'cc': 'cpp', 'cxx': 'cpp',
      'c': 'c', 'h': 'c',
      'css': 'css', 'scss': 'scss', 'sass': 'sass',
      'html': 'html', 'htm': 'html',
      'json': 'json',
      'yaml': 'yaml', 'yml': 'yaml',
      'md': 'markdown',
      'sql': 'sql',
      'sh': 'shell', 'bash': 'shell',
      'dockerfile': 'dockerfile',
      'xml': 'xml'
    };
    return langMap[ext || ''] || 'plaintext';
  }

  /**
   * Read file content
   * قراءة محتوى الملف
   */
  async readFile(repositoryId: string, filePath: string): Promise<{ content: string; language: string }> {
    const { sovereignGitEngine } = await import('../lib/sovereign-git-engine');
    
    const files = await sovereignGitEngine.getRepositoryFiles(repositoryId, 'main');
    const file = files.find((f: any) => f.path === filePath);
    
    if (!file) {
      throw new Error(`File not found: ${filePath}`);
    }

    return {
      content: file.content || '',
      language: this.detectLanguage(filePath)
    };
  }

  /**
   * Save file content
   * حفظ محتوى الملف
   */
  async saveFile(repositoryId: string, filePath: string, content: string, commitMessage?: string): Promise<void> {
    const { sovereignGitEngine } = await import('../lib/sovereign-git-engine');
    
    await sovereignGitEngine.commitFiles(repositoryId, [{
      path: filePath,
      content,
      action: 'update'
    }], commitMessage || `Update ${filePath}`);
  }

  /**
   * Analyze resource usage and performance
   * تحليل استخدام الموارد والأداء
   */
  async analyzeResources(repositoryId: string): Promise<ResourceMetrics> {
    const { sovereignGitEngine } = await import('../lib/sovereign-git-engine');
    const files = await sovereignGitEngine.getRepositoryFiles(repositoryId, 'main');

    let totalSize = 0;
    const moduleBreakdown: { module: string; size: string; percentage: number }[] = [];
    const memoryBreakdown: { component: string; usage: string; percentage: number }[] = [];
    const cpuHotspots: { file: string; line: number; description: string }[] = [];
    const networkOptimizations: { endpoint: string; suggestion: string }[] = [];

    // Analyze each file
    for (const file of files) {
      if (file.type === 'tree') continue;
      totalSize += file.size || 0;

      const content = file.content || '';
      
      // Detect CPU hotspots (nested loops, recursive calls)
      const lines = content.split('\n');
      let nestedLoopDepth = 0;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Check for nested loops
        if (/\b(for|while|forEach|map|filter|reduce)\b/.test(line)) {
          nestedLoopDepth++;
          if (nestedLoopDepth >= 2) {
            cpuHotspots.push({
              file: file.path,
              line: i + 1,
              description: `Nested loop detected (depth: ${nestedLoopDepth}) - consider optimization`
            });
          }
        }
        if (/^\s*[}\]]/.test(line)) {
          nestedLoopDepth = Math.max(0, nestedLoopDepth - 1);
        }

        // Check for API calls that could be optimized
        if (/fetch\(|axios\.|\.get\(|\.post\(/.test(line)) {
          const contextLines = lines.slice(Math.max(0, i - 5), Math.min(lines.length, i + 5)).join('\n');
          if (!/Promise\.all|Promise\.allSettled/.test(contextLines)) {
            networkOptimizations.push({
              endpoint: file.path,
              suggestion: `Line ${i + 1}: Consider batching API calls with Promise.all`
            });
          }
        }
      }
    }

    // Calculate bundle breakdown by directory
    const dirSizes = new Map<string, number>();
    for (const file of files) {
      if (file.type === 'tree') continue;
      const dir = file.path.split('/')[0] || 'root';
      dirSizes.set(dir, (dirSizes.get(dir) || 0) + (file.size || 0));
    }

    for (const [dir, size] of dirSizes) {
      moduleBreakdown.push({
        module: dir,
        size: this.formatBytes(size),
        percentage: totalSize > 0 ? Math.round((size / totalSize) * 100) : 0
      });
    }

    // Estimate memory usage based on patterns
    const jsFiles = files.filter((f: any) => /\.(js|ts|jsx|tsx)$/.test(f.path));
    const totalJsSize = jsFiles.reduce((sum: number, f: any) => sum + (f.size || 0), 0);
    
    memoryBreakdown.push(
      { component: 'JavaScript Runtime', usage: this.formatBytes(totalJsSize * 2), percentage: 40 },
      { component: 'DOM & Virtual DOM', usage: this.formatBytes(totalJsSize * 1.5), percentage: 30 },
      { component: 'State Management', usage: this.formatBytes(totalJsSize * 0.5), percentage: 15 },
      { component: 'Cache & Buffers', usage: this.formatBytes(totalJsSize * 0.5), percentage: 15 }
    );

    return {
      memoryUsage: {
        estimated: this.formatBytes(totalJsSize * 4.5),
        breakdown: memoryBreakdown
      },
      cpuUsage: {
        estimated: cpuHotspots.length > 5 ? 'High' : cpuHotspots.length > 2 ? 'Medium' : 'Low',
        hotspots: cpuHotspots.slice(0, 10)
      },
      bundleSize: {
        total: this.formatBytes(totalSize),
        breakdown: moduleBreakdown.sort((a, b) => b.percentage - a.percentage)
      },
      networkCalls: {
        count: networkOptimizations.length,
        optimizable: networkOptimizations.slice(0, 10)
      }
    };
  }

  private formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }

  /**
   * Detect performance issues
   * اكتشاف مشاكل الأداء
   */
  async detectPerformanceIssues(repositoryId: string): Promise<PerformanceIssue[]> {
    const { sovereignGitEngine } = await import('../lib/sovereign-git-engine');
    const files = await sovereignGitEngine.getRepositoryFiles(repositoryId, 'main');
    const issues: PerformanceIssue[] = [];

    const patterns = [
      {
        regex: /console\.(log|debug|info|warn|error)\(/g,
        category: 'cpu' as const,
        severity: 'low' as const,
        description: 'Console statements in production code',
        suggestion: 'Remove or conditionally disable console statements',
        impact: '1-2% CPU reduction'
      },
      {
        regex: /JSON\.parse\(JSON\.stringify\(/g,
        category: 'memory' as const,
        severity: 'medium' as const,
        description: 'Deep clone using JSON - inefficient for large objects',
        suggestion: 'Use structuredClone() or lodash cloneDeep for better performance',
        impact: '10-30% memory reduction for large objects'
      },
      {
        regex: /new RegExp\(/g,
        category: 'cpu' as const,
        severity: 'medium' as const,
        description: 'Dynamic RegExp creation inside loops or functions',
        suggestion: 'Move RegExp to module scope or use regex literals',
        impact: '5-10% CPU reduction'
      },
      {
        regex: /\.map\([^)]+\)\.filter\([^)]+\)\.reduce\(/g,
        category: 'cpu' as const,
        severity: 'high' as const,
        description: 'Chained array methods creating multiple iterations',
        suggestion: 'Combine into single reduce() or use for loop',
        impact: '20-40% CPU reduction'
      },
      {
        regex: /useEffect\(\s*\(\)\s*=>\s*\{[^}]*fetch/g,
        category: 'network' as const,
        severity: 'high' as const,
        description: 'Fetch in useEffect without proper cleanup or caching',
        suggestion: 'Use React Query or SWR for data fetching with caching',
        impact: '50-70% network reduction'
      },
      {
        regex: /SELECT\s+\*/gi,
        category: 'database' as const,
        severity: 'high' as const,
        description: 'SELECT * queries fetching unnecessary columns',
        suggestion: 'Specify required columns explicitly',
        impact: '20-50% database load reduction'
      },
      {
        regex: /import\s+\{[^}]+\}\s+from\s+['"]lodash['"]/g,
        category: 'bundle' as const,
        severity: 'medium' as const,
        description: 'Importing from lodash main bundle',
        suggestion: "Use lodash-es or import specific functions: import debounce from 'lodash/debounce'",
        impact: '50-100KB bundle reduction'
      },
      {
        regex: /import\s+moment\s+from/g,
        category: 'bundle' as const,
        severity: 'high' as const,
        description: 'Using moment.js (large bundle size)',
        suggestion: 'Switch to date-fns or dayjs for smaller bundle',
        impact: '200-300KB bundle reduction'
      },
      {
        regex: /innerHTML\s*=/g,
        category: 'rendering' as const,
        severity: 'critical' as const,
        description: 'Direct innerHTML manipulation - XSS risk and performance issue',
        suggestion: 'Use React state and proper DOM APIs',
        impact: 'Security fix + 10-20% rendering improvement'
      },
      {
        regex: /document\.(getElementById|querySelector)/g,
        category: 'rendering' as const,
        severity: 'medium' as const,
        description: 'Direct DOM manipulation in React app',
        suggestion: 'Use React refs and state instead',
        impact: 'Better React reconciliation'
      }
    ];

    let issueId = 0;
    for (const file of files) {
      if (file.type === 'tree') continue;
      const content = file.content || '';
      const lines = content.split('\n');

      for (const pattern of patterns) {
        let match;
        while ((match = pattern.regex.exec(content)) !== null) {
          const lineNumber = content.slice(0, match.index).split('\n').length;
          
          issues.push({
            id: `issue-${++issueId}`,
            severity: pattern.severity,
            category: pattern.category,
            file: file.path,
            line: lineNumber,
            description: pattern.description,
            suggestion: pattern.suggestion,
            estimatedImpact: pattern.impact,
            autoFixAvailable: ['console.log', 'moment', 'lodash'].some(p => pattern.description.toLowerCase().includes(p))
          });
        }
        pattern.regex.lastIndex = 0; // Reset regex
      }
    }

    // Sort by severity
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  }

  /**
   * AI-powered code refactoring
   * إعادة هيكلة الكود بالذكاء الاصطناعي
   */
  async refactorCode(
    code: string, 
    language: string, 
    goals: ('performance' | 'readability' | 'memory' | 'security')[]
  ): Promise<RefactoringResult> {
    const goalDescriptions = {
      performance: 'Optimize for execution speed and reduce computational complexity',
      readability: 'Improve code clarity, naming, and structure',
      memory: 'Reduce memory allocations and prevent memory leaks',
      security: 'Fix security vulnerabilities and add input validation'
    };

    const selectedGoals = goals.map(g => goalDescriptions[g]).join('\n- ');

    const prompt = `You are an expert code refactoring assistant. Refactor the following ${language} code with these goals:
- ${selectedGoals}

Original code:
\`\`\`${language}
${code}
\`\`\`

Provide the refactored code and explain the changes. Format your response as JSON:
{
  "refactoredCode": "the complete refactored code",
  "changes": [
    {"type": "optimization type", "description": "what was changed and why"}
  ],
  "metrics": {
    "complexityReduction": "percentage or description",
    "performanceGain": "estimated improvement",
    "readabilityScore": 1-10
  }
}`;

    try {
      const response = await this.anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }]
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type');
      }

      // Extract JSON from response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not parse refactoring response');
      }

      const result = JSON.parse(jsonMatch[0]);

      return {
        originalCode: code,
        refactoredCode: result.refactoredCode,
        changes: result.changes.map((c: any) => ({
          type: c.type,
          description: c.description,
          linesBefore: code.split('\n').length,
          linesAfter: result.refactoredCode.split('\n').length
        })),
        metrics: {
          complexityReduction: result.metrics?.complexityReduction || 'N/A',
          performanceGain: result.metrics?.performanceGain || 'N/A',
          readabilityScore: result.metrics?.readabilityScore || 7
        }
      };
    } catch (error: any) {
      console.error('[InternalDev] Refactoring error:', error);
      throw new Error(`Refactoring failed: ${error.message}`);
    }
  }

  /**
   * AI code suggestions
   * اقتراحات الكود بالذكاء الاصطناعي
   */
  async getCodeSuggestions(
    code: string,
    cursorPosition: { line: number; column: number },
    language: string
  ): Promise<string[]> {
    const lines = code.split('\n');
    const contextStart = Math.max(0, cursorPosition.line - 10);
    const contextEnd = Math.min(lines.length, cursorPosition.line + 5);
    const context = lines.slice(contextStart, contextEnd).join('\n');

    const prompt = `Given this ${language} code context, provide 3-5 code completion suggestions for the cursor position.

Context:
\`\`\`${language}
${context}
\`\`\`

Cursor is at line ${cursorPosition.line - contextStart + 1}, column ${cursorPosition.column}.

Return only a JSON array of completion strings, no explanation:
["suggestion1", "suggestion2", ...]`;

    try {
      const response = await this.anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        messages: [{ role: "user", content: prompt }]
      });

      const content = response.content[0];
      if (content.type !== 'text') return [];

      const jsonMatch = content.text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return [];

      return JSON.parse(jsonMatch[0]);
    } catch {
      return [];
    }
  }

  /**
   * Analyze and estimate costs
   * تحليل وتقدير التكاليف
   */
  async analyzeCosts(repositoryId: string): Promise<CostAnalysis> {
    const resources = await this.analyzeResources(repositoryId);
    const issues = await this.detectPerformanceIssues(repositoryId);

    // Parse bundle size
    const bundleSizeMatch = resources.bundleSize.total.match(/([\d.]+)\s*(KB|MB|GB)/);
    const bundleSizeKB = bundleSizeMatch 
      ? parseFloat(bundleSizeMatch[1]) * (bundleSizeMatch[2] === 'GB' ? 1024 * 1024 : bundleSizeMatch[2] === 'MB' ? 1024 : 1)
      : 100;

    // Estimate current costs based on resource usage
    const computeBase = resources.cpuUsage.estimated === 'High' ? 50 : resources.cpuUsage.estimated === 'Medium' ? 30 : 15;
    const storageBase = bundleSizeKB / 1024 * 0.5; // $0.5 per GB
    const networkBase = resources.networkCalls.count * 0.1;

    // Calculate potential savings from fixing issues
    let potentialSavings = 0;
    const recommendations: CostAnalysis['recommendations'] = [];

    const criticalIssues = issues.filter(i => i.severity === 'critical' || i.severity === 'high');
    if (criticalIssues.length > 0) {
      potentialSavings += computeBase * 0.3;
      recommendations.push({
        category: 'Performance',
        action: `Fix ${criticalIssues.length} critical/high performance issues`,
        impact: `Save ~$${(computeBase * 0.3).toFixed(2)}/month`,
        effort: 'medium'
      });
    }

    const bundleIssues = issues.filter(i => i.category === 'bundle');
    if (bundleIssues.length > 0) {
      potentialSavings += storageBase * 0.5;
      recommendations.push({
        category: 'Bundle Size',
        action: 'Optimize imports and remove unused dependencies',
        impact: `Reduce bundle by ~50%, save ~$${(storageBase * 0.5).toFixed(2)}/month`,
        effort: 'low'
      });
    }

    const networkIssues = resources.networkCalls.optimizable;
    if (networkIssues.length > 0) {
      potentialSavings += networkBase * 0.5;
      recommendations.push({
        category: 'Network',
        action: 'Batch API calls and implement caching',
        impact: `Reduce API calls by ~50%, save ~$${(networkBase * 0.5).toFixed(2)}/month`,
        effort: 'medium'
      });
    }

    // Add general recommendations
    recommendations.push(
      {
        category: 'Infrastructure',
        action: 'Use edge caching (CDN) for static assets',
        impact: 'Reduce origin requests by 80%',
        effort: 'low'
      },
      {
        category: 'Database',
        action: 'Implement connection pooling and query caching',
        impact: 'Reduce database costs by 30-50%',
        effort: 'medium'
      }
    );

    const currentTotal = computeBase + storageBase + networkBase;
    const optimizedTotal = currentTotal - potentialSavings;

    return {
      currentEstimate: {
        compute: `$${computeBase.toFixed(2)}/mo`,
        storage: `$${storageBase.toFixed(2)}/mo`,
        network: `$${networkBase.toFixed(2)}/mo`,
        total: `$${currentTotal.toFixed(2)}/mo`
      },
      optimizedEstimate: {
        compute: `$${(computeBase * 0.7).toFixed(2)}/mo`,
        storage: `$${(storageBase * 0.5).toFixed(2)}/mo`,
        network: `$${(networkBase * 0.5).toFixed(2)}/mo`,
        total: `$${optimizedTotal.toFixed(2)}/mo`
      },
      savings: `$${potentialSavings.toFixed(2)}/mo (${Math.round((potentialSavings / currentTotal) * 100)}%)`,
      recommendations: recommendations.sort((a, b) => {
        const effortOrder = { low: 0, medium: 1, high: 2 };
        return effortOrder[a.effort] - effortOrder[b.effort];
      })
    };
  }

  /**
   * Apply auto-fix for an issue
   * تطبيق إصلاح تلقائي لمشكلة
   */
  async applyAutoFix(repositoryId: string, issue: PerformanceIssue): Promise<{ success: boolean; message: string }> {
    if (!issue.autoFixAvailable) {
      return { success: false, message: 'Auto-fix not available for this issue' };
    }

    const { sovereignGitEngine } = await import('../lib/sovereign-git-engine');
    const files = await sovereignGitEngine.getRepositoryFiles(repositoryId, 'main');
    const file = files.find((f: any) => f.path === issue.file);

    if (!file || !file.content) {
      return { success: false, message: 'File not found or empty' };
    }

    let newContent = file.content;
    let fixApplied = false;

    // Apply specific fixes
    if (issue.description.includes('Console statements')) {
      // Remove console.log statements
      newContent = newContent.replace(/^\s*console\.(log|debug|info)\([^)]*\);\s*$/gm, '');
      fixApplied = true;
    } else if (issue.description.includes('moment.js')) {
      // Replace moment import with date-fns suggestion (comment for manual review)
      newContent = newContent.replace(
        /import\s+moment\s+from\s+['"]moment['"]/g,
        "// TODO: Replace with date-fns\n// import { format, parseISO } from 'date-fns'"
      );
      fixApplied = true;
    } else if (issue.description.includes('lodash')) {
      // Fix lodash imports
      const lodashMatches = newContent.match(/import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]lodash['"]/);
      if (lodashMatches) {
        const functions = lodashMatches[1].split(',').map(f => f.trim());
        const newImports = functions.map(f => `import ${f} from 'lodash/${f}'`).join('\n');
        newContent = newContent.replace(lodashMatches[0], newImports);
        fixApplied = true;
      }
    }

    if (fixApplied) {
      await sovereignGitEngine.commitFiles(repositoryId, [{
        path: issue.file,
        content: newContent,
        action: 'update'
      }], `Auto-fix: ${issue.description}`);

      return { success: true, message: `Fixed: ${issue.description}` };
    }

    return { success: false, message: 'Could not apply fix automatically' };
  }
}

export const internalDevService = new InternalDevelopmentService();
