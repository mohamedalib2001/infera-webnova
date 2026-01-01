/**
 * Replit Import Service | خدمة استيراد مشاريع Replit
 * 
 * Service for:
 * 1. Connecting to Replit account (OAuth/Token)
 * 2. Browsing user's Repls
 * 3. Importing Repl files to internal sovereign repository
 */

import { db } from '../db';
import { eq, and, desc } from 'drizzle-orm';
import { internalRepositories, internalBranches, internalCommits, repositoryFiles, replitConnections, type ReplitConnection as DBReplitConnection } from '@shared/schema';
import { sovereignGitEngine } from '../lib/sovereign-git-engine';
import { randomBytes, createHash } from 'crypto';

// Types (for API responses - hides sensitive token)
export interface ReplitConnection {
  id: string;
  userId: string;
  replitUserId: string;
  replitUsername: string;
  accessToken: string; // Will be masked in responses
  refreshToken?: string;
  expiresAt?: Date;
  isActive: boolean;
  connectedAt: Date;
}

export interface ReplInfo {
  id: string;
  slug: string;
  title: string;
  description?: string;
  language: string;
  isPrivate: boolean;
  url: string;
  iconUrl?: string;
  createdAt: string;
  updatedAt: string;
  files?: ReplFile[];
}

export interface ReplFile {
  path: string;
  content?: string;
  type: 'file' | 'directory';
  size?: number;
}

export interface ImportResult {
  success: boolean;
  repositoryId?: string;
  internalId?: string;
  sovereignId?: string;        // Internal Project ID - معرف المشروع الداخلي
  filesImported: number;
  errors: string[];
  message: string;
  messageAr: string;
  breakdown?: {
    sourceCode: number;
    configs: number;
    envTemplates: number;
    buildScripts: number;
    assets: number;
  };
  analysis?: ProjectAnalysis;   // تحليل المشروع
  sovereignty?: SovereigntyStatus; // حالة الاستقلال
}

// Project Analysis - تحليل المشروع
export interface ProjectAnalysis {
  // Language & Tech Stack - اللغة والتقنيات
  languages: { name: string; percentage: number; files: number }[];
  frameworks: string[];
  technologies: string[];
  
  // Dependencies - الاعتماديات
  dependencies: {
    total: number;
    production: DependencyInfo[];
    development: DependencyInfo[];
    outdated: number;
    vulnerable: number;
  };
  
  // Vulnerabilities & Cost - نقاط الضعف والتكلفة
  security: {
    score: number;           // 0-100
    issues: SecurityIssue[];
    replitSpecific: string[]; // Replit-specific code that needs changes
  };
  
  // Portability - قابلية النقل
  portability: {
    score: number;           // 0-100
    replitDependencies: string[];
    requiredChanges: PortabilityChange[];
    estimatedEffort: 'low' | 'medium' | 'high';
  };
  
  // Cost Estimation - تقدير التكلفة
  cost: {
    computeEstimate: string;
    storageEstimate: string;
    monthlyEstimate: string;
  };
}

export interface DependencyInfo {
  name: string;
  version: string;
  latest?: string;
  isOutdated: boolean;
  hasVulnerability: boolean;
  license?: string;
}

export interface SecurityIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: string;
  description: string;
  file?: string;
  line?: number;
  recommendation: string;
}

// Independent Runtime Configuration - تكوين بيئة التشغيل المستقلة
export interface IndependentRuntimeConfig {
  dockerfile: string;
  dockerCompose: string;
  startScript: string;
  envConfig: {
    path: string;
    template: string;
    variables: EnvVariable[];
  };
  replacements: DependencyReplacement[];
  runtimeType: 'node' | 'python' | 'go' | 'rust' | 'multi';
  portConfig: {
    main: number;
    additional: number[];
  };
}

export interface EnvVariable {
  key: string;
  description: string;
  descriptionAr: string;
  required: boolean;
  defaultValue?: string;
  sensitive: boolean;
  replitEquivalent?: string;
}

export interface DependencyReplacement {
  original: string;
  replacement: string;
  reason: string;
  reasonAr: string;
  effort: 'trivial' | 'easy' | 'moderate' | 'complex';
  instructions: string[];
}

export interface PortabilityChange {
  type: 'required' | 'recommended';
  file: string;
  description: string;
  descriptionAr: string;
  effort: 'trivial' | 'easy' | 'moderate' | 'complex';
}

// Sovereignty Status - حالة السيادة
export interface SovereigntyStatus {
  isDecoupled: boolean;          // هل تم فك الارتباط
  originalSource: 'replit';       // المصدر الأصلي
  sourceRole: 'initial-import';   // دور المصدر: استيراد أولي فقط
  internalProjectId: string;      // معرف المشروع الداخلي
  importedAt: string;
  lastSyncAt?: string;
  syncEnabled: boolean;
  independenceLevel: 'full' | 'partial' | 'linked';
}

// File categories for comprehensive import
const FILE_CATEGORIES = {
  // Config files - ملفات الإعداد
  configs: [
    '.replit', 'replit.nix', '.replit.toml',
    'package.json', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
    'tsconfig.json', 'jsconfig.json', 'vite.config.ts', 'vite.config.js',
    'webpack.config.js', 'rollup.config.js', 'esbuild.config.js',
    'tailwind.config.js', 'tailwind.config.ts', 'postcss.config.js',
    'drizzle.config.ts', 'prisma/schema.prisma',
    '.eslintrc', '.eslintrc.js', '.eslintrc.json', '.prettierrc',
    'Cargo.toml', 'Cargo.lock', 'go.mod', 'go.sum',
    'requirements.txt', 'pyproject.toml', 'setup.py', 'Pipfile',
    'Gemfile', 'Gemfile.lock', 'composer.json', 'composer.lock',
    'Makefile', 'CMakeLists.txt', 'build.gradle', 'pom.xml'
  ],
  
  // Environment templates - قوالب البيئة
  envTemplates: [
    '.env', '.env.example', '.env.sample', '.env.template',
    '.env.local', '.env.development', '.env.production', '.env.test',
    'env.example', 'sample.env', 'template.env'
  ],
  
  // Build/Run scripts - ملفات البناء والتشغيل
  buildScripts: [
    'Dockerfile', 'docker-compose.yml', 'docker-compose.yaml',
    '.dockerignore', 'Procfile', 'nixpacks.toml',
    'start.sh', 'run.sh', 'build.sh', 'deploy.sh', 'setup.sh',
    'scripts/', 'bin/', '.github/workflows/'
  ],
  
  // Assets patterns - أنماط الأصول
  assetPatterns: [
    /\.(png|jpg|jpeg|gif|svg|ico|webp)$/i,
    /\.(woff|woff2|ttf|eot|otf)$/i,
    /\.(mp3|mp4|wav|ogg|webm)$/i,
    /\.(pdf|doc|docx|xls|xlsx)$/i
  ]
};

// Database-backed connection storage
class ReplitImportService {
  private baseUrl = 'https://replit.com';
  private apiUrl = 'https://replit.com/graphql';

  /**
   * Categorize a file by its path
   * تصنيف الملف حسب مساره
   */
  private categorizeFile(filePath: string): 'sourceCode' | 'configs' | 'envTemplates' | 'buildScripts' | 'assets' {
    const fileName = filePath.split('/').pop() || filePath;
    
    // Check env templates first (most specific)
    if (FILE_CATEGORIES.envTemplates.some(env => 
      fileName === env || fileName.toLowerCase() === env.toLowerCase()
    )) {
      return 'envTemplates';
    }
    
    // Check config files
    if (FILE_CATEGORIES.configs.some(config => {
      if (config.endsWith('/')) {
        return filePath.startsWith(config) || filePath.includes('/' + config);
      }
      return fileName === config || filePath.endsWith(config);
    })) {
      return 'configs';
    }
    
    // Check build scripts
    if (FILE_CATEGORIES.buildScripts.some(script => {
      if (script.endsWith('/')) {
        return filePath.startsWith(script) || filePath.includes('/' + script);
      }
      return fileName === script || filePath.endsWith(script);
    })) {
      return 'buildScripts';
    }
    
    // Check asset patterns
    if (FILE_CATEGORIES.assetPatterns.some(pattern => pattern.test(filePath))) {
      return 'assets';
    }
    
    // Default to source code
    return 'sourceCode';
  }

  /**
   * Convert .env files to templates (strip values, keep keys)
   * تحويل ملفات .env إلى قوالب
   */
  private convertEnvToTemplate(content: string, originalPath: string): { 
    templateContent: string; 
    templatePath: string;
    varsCount: number;
  } {
    const lines = content.split('\n');
    const templateLines: string[] = [];
    let varsCount = 0;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Keep comments and empty lines
      if (trimmed.startsWith('#') || trimmed === '') {
        templateLines.push(line);
        continue;
      }
      
      // Parse KEY=VALUE
      const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/i);
      if (match) {
        const [, key, value] = match;
        varsCount++;
        
        // Create template with placeholder
        if (value.includes('secret') || value.includes('key') || value.includes('password')) {
          templateLines.push(`${key}=<YOUR_${key}_HERE>`);
        } else if (value.match(/^https?:\/\//)) {
          templateLines.push(`${key}=<URL_HERE>`);
        } else if (value.match(/^\d+$/)) {
          templateLines.push(`${key}=${value}`); // Keep numeric values
        } else {
          templateLines.push(`${key}=<VALUE_HERE>`);
        }
      } else {
        templateLines.push(line);
      }
    }
    
    // Determine template path
    let templatePath = originalPath;
    if (!originalPath.includes('template') && !originalPath.includes('example') && !originalPath.includes('sample')) {
      templatePath = originalPath.replace('.env', '.env.template');
    }
    
    return {
      templateContent: templateLines.join('\n'),
      templatePath,
      varsCount
    };
  }

  // ============ Project Analysis Engine | محرك تحليل المشروع ============

  /**
   * Analyze imported project comprehensively
   * تحليل المشروع المستورد بشكل شامل
   */
  public analyzeProject(files: ReplFile[], repl: ReplInfo): ProjectAnalysis {
    const analysis: ProjectAnalysis = {
      languages: [],
      frameworks: [],
      technologies: [],
      dependencies: {
        total: 0,
        production: [],
        development: [],
        outdated: 0,
        vulnerable: 0
      },
      security: {
        score: 100,
        issues: [],
        replitSpecific: []
      },
      portability: {
        score: 100,
        replitDependencies: [],
        requiredChanges: [],
        estimatedEffort: 'low'
      },
      cost: {
        computeEstimate: '$0',
        storageEstimate: '$0',
        monthlyEstimate: '$0'
      }
    };

    // 1. Analyze languages and technologies
    const langStats = this.analyzeLanguages(files);
    analysis.languages = langStats.languages;
    analysis.frameworks = langStats.frameworks;
    analysis.technologies = langStats.technologies;

    // 2. Analyze dependencies
    analysis.dependencies = this.analyzeDependencies(files);

    // 3. Security analysis
    analysis.security = this.analyzeSecurityIssues(files);

    // 4. Portability analysis
    analysis.portability = this.analyzePortability(files, repl);

    // 5. Cost estimation
    analysis.cost = this.estimateCost(files, analysis);

    return analysis;
  }

  /**
   * Analyze languages and technologies
   */
  private analyzeLanguages(files: ReplFile[]): {
    languages: { name: string; percentage: number; files: number }[];
    frameworks: string[];
    technologies: string[];
  } {
    const langMap: Record<string, number> = {};
    const frameworks = new Set<string>();
    const technologies = new Set<string>();
    
    const langExtensions: Record<string, string> = {
      '.js': 'JavaScript', '.jsx': 'JavaScript', '.mjs': 'JavaScript',
      '.ts': 'TypeScript', '.tsx': 'TypeScript',
      '.py': 'Python', '.pyw': 'Python',
      '.go': 'Go', '.rs': 'Rust', '.rb': 'Ruby',
      '.java': 'Java', '.kt': 'Kotlin', '.scala': 'Scala',
      '.php': 'PHP', '.cs': 'C#', '.cpp': 'C++', '.c': 'C',
      '.swift': 'Swift', '.dart': 'Dart',
      '.html': 'HTML', '.css': 'CSS', '.scss': 'SCSS', '.less': 'LESS',
      '.sql': 'SQL', '.graphql': 'GraphQL',
      '.sh': 'Shell', '.bash': 'Shell', '.zsh': 'Shell',
      '.yaml': 'YAML', '.yml': 'YAML', '.json': 'JSON', '.xml': 'XML',
      '.md': 'Markdown', '.mdx': 'MDX'
    };

    for (const file of files) {
      if (file.type !== 'file') continue;
      
      const ext = '.' + (file.path.split('.').pop() || '').toLowerCase();
      const lang = langExtensions[ext];
      if (lang) {
        langMap[lang] = (langMap[lang] || 0) + 1;
      }

      // Detect frameworks from file content and names
      const content = file.content?.toLowerCase() || '';
      const path = file.path.toLowerCase();
      
      // JavaScript/TypeScript frameworks
      if (content.includes('react') || path.includes('react')) frameworks.add('React');
      if (content.includes('next') || path.includes('next.config')) frameworks.add('Next.js');
      if (content.includes('vue') || path.includes('vue')) frameworks.add('Vue.js');
      if (content.includes('angular') || path.includes('angular')) frameworks.add('Angular');
      if (content.includes('svelte') || path.includes('svelte')) frameworks.add('Svelte');
      if (content.includes('express') || content.includes('app.listen')) frameworks.add('Express.js');
      if (content.includes('fastify')) frameworks.add('Fastify');
      if (content.includes('hono')) frameworks.add('Hono');
      
      // Python frameworks
      if (content.includes('django')) frameworks.add('Django');
      if (content.includes('flask')) frameworks.add('Flask');
      if (content.includes('fastapi')) frameworks.add('FastAPI');
      
      // Technologies
      if (content.includes('postgresql') || content.includes('pg')) technologies.add('PostgreSQL');
      if (content.includes('mongodb') || content.includes('mongoose')) technologies.add('MongoDB');
      if (content.includes('redis')) technologies.add('Redis');
      if (content.includes('docker')) technologies.add('Docker');
      if (content.includes('tailwind')) technologies.add('Tailwind CSS');
      if (content.includes('prisma')) technologies.add('Prisma');
      if (content.includes('drizzle')) technologies.add('Drizzle ORM');
      if (content.includes('stripe')) technologies.add('Stripe');
      if (content.includes('openai')) technologies.add('OpenAI');
      if (content.includes('websocket') || content.includes('socket.io')) technologies.add('WebSocket');
    }

    const totalFiles = Object.values(langMap).reduce((a, b) => a + b, 0);
    const languages = Object.entries(langMap)
      .map(([name, files]) => ({
        name,
        files,
        percentage: Math.round((files / totalFiles) * 100) || 0
      }))
      .sort((a, b) => b.files - a.files);

    return {
      languages,
      frameworks: Array.from(frameworks),
      technologies: Array.from(technologies)
    };
  }

  /**
   * Analyze dependencies from package files
   */
  private analyzeDependencies(files: ReplFile[]): ProjectAnalysis['dependencies'] {
    const result: ProjectAnalysis['dependencies'] = {
      total: 0,
      production: [],
      development: [],
      outdated: 0,
      vulnerable: 0
    };

    // Find package.json
    const packageJson = files.find(f => f.path === 'package.json' || f.path.endsWith('/package.json'));
    if (packageJson?.content) {
      try {
        const pkg = JSON.parse(packageJson.content);
        
        // Production dependencies
        if (pkg.dependencies) {
          for (const [name, version] of Object.entries(pkg.dependencies)) {
            result.production.push({
              name,
              version: String(version),
              isOutdated: false, // Would need npm registry check
              hasVulnerability: this.checkKnownVulnerability(name, String(version))
            });
          }
        }
        
        // Dev dependencies
        if (pkg.devDependencies) {
          for (const [name, version] of Object.entries(pkg.devDependencies)) {
            result.development.push({
              name,
              version: String(version),
              isOutdated: false,
              hasVulnerability: this.checkKnownVulnerability(name, String(version))
            });
          }
        }
        
        result.total = result.production.length + result.development.length;
        result.vulnerable = [...result.production, ...result.development].filter(d => d.hasVulnerability).length;
      } catch (e) {
        console.error('[ReplitImport] Failed to parse package.json');
      }
    }

    // Find requirements.txt for Python
    const requirements = files.find(f => f.path === 'requirements.txt');
    if (requirements?.content) {
      const lines = requirements.content.split('\n').filter(l => l.trim() && !l.startsWith('#'));
      for (const line of lines) {
        const match = line.match(/^([a-zA-Z0-9_-]+)([=<>]+)?(.+)?$/);
        if (match) {
          result.production.push({
            name: match[1],
            version: match[3] || 'latest',
            isOutdated: false,
            hasVulnerability: false
          });
        }
      }
      result.total = result.production.length;
    }

    return result;
  }

  /**
   * Check for known vulnerabilities (simplified)
   */
  private checkKnownVulnerability(name: string, version: string): boolean {
    // Known vulnerable packages (simplified list)
    const vulnerablePackages: Record<string, string[]> = {
      'lodash': ['<4.17.21'],
      'axios': ['<0.21.1'],
      'node-fetch': ['<2.6.7'],
      'minimist': ['<1.2.6'],
      'glob-parent': ['<5.1.2']
    };
    
    return vulnerablePackages[name]?.some(v => {
      // Simplified version check
      return version.includes(v.replace('<', '').split('.')[0]);
    }) || false;
  }

  /**
   * Analyze security issues
   */
  private analyzeSecurityIssues(files: ReplFile[]): ProjectAnalysis['security'] {
    const result: ProjectAnalysis['security'] = {
      score: 100,
      issues: [],
      replitSpecific: []
    };

    for (const file of files) {
      if (file.type !== 'file' || !file.content) continue;
      const content = file.content;
      const path = file.path;

      // Check for hardcoded secrets
      if (/['"]sk_live_[a-zA-Z0-9]+['"]/.test(content)) {
        result.issues.push({
          severity: 'critical',
          type: 'hardcoded-secret',
          description: 'Hardcoded Stripe live key detected',
          file: path,
          recommendation: 'Move to environment variables'
        });
        result.score -= 25;
      }

      if (/['"][a-zA-Z0-9]{32,}['"]/.test(content) && /api.?key|secret|token/i.test(content)) {
        result.issues.push({
          severity: 'high',
          type: 'potential-secret',
          description: 'Potential API key or secret in code',
          file: path,
          recommendation: 'Review and move sensitive data to environment variables'
        });
        result.score -= 10;
      }

      // Check for SQL injection risks
      if (/\$\{.*\}.*(?:SELECT|INSERT|UPDATE|DELETE)/i.test(content)) {
        result.issues.push({
          severity: 'high',
          type: 'sql-injection',
          description: 'Potential SQL injection vulnerability',
          file: path,
          recommendation: 'Use parameterized queries'
        });
        result.score -= 15;
      }

      // Check for Replit-specific code
      if (content.includes('process.env.REPL_') || content.includes('REPLIT_')) {
        result.replitSpecific.push(`${path}: Uses Replit environment variables`);
      }
      if (content.includes('replit.com') || content.includes('@replit/')) {
        result.replitSpecific.push(`${path}: References Replit services`);
      }
    }

    result.score = Math.max(0, result.score);
    return result;
  }

  /**
   * Analyze portability outside Replit
   */
  private analyzePortability(files: ReplFile[], repl: ReplInfo): ProjectAnalysis['portability'] {
    const result: ProjectAnalysis['portability'] = {
      score: 100,
      replitDependencies: [],
      requiredChanges: [],
      estimatedEffort: 'low'
    };

    let changesNeeded = 0;

    for (const file of files) {
      if (file.type !== 'file' || !file.content) continue;
      const content = file.content;
      const path = file.path;

      // Check for .replit file
      if (path === '.replit') {
        result.requiredChanges.push({
          type: 'recommended',
          file: path,
          description: 'Convert .replit run configuration to standard scripts',
          descriptionAr: 'تحويل إعدادات التشغيل من .replit إلى سكربتات قياسية',
          effort: 'easy'
        });
        changesNeeded++;
      }

      // Check for replit.nix
      if (path === 'replit.nix') {
        result.requiredChanges.push({
          type: 'recommended',
          file: path,
          description: 'Convert Nix dependencies to Dockerfile or standard package manager',
          descriptionAr: 'تحويل اعتماديات Nix إلى Dockerfile أو مدير حزم قياسي',
          effort: 'moderate'
        });
        changesNeeded++;
      }

      // Check for Replit-specific imports
      if (content.includes('@replit/')) {
        result.replitDependencies.push(path);
        result.requiredChanges.push({
          type: 'required',
          file: path,
          description: 'Replace @replit/* packages with alternatives',
          descriptionAr: 'استبدال حزم @replit/* ببدائل',
          effort: 'moderate'
        });
        changesNeeded++;
        result.score -= 15;
      }

      // Check for Replit DB usage
      if (content.includes('replit/database') || content.includes('REPLIT_DB')) {
        result.requiredChanges.push({
          type: 'required',
          file: path,
          description: 'Migrate from Replit Database to PostgreSQL/Redis',
          descriptionAr: 'ترحيل من قاعدة بيانات Replit إلى PostgreSQL/Redis',
          effort: 'complex'
        });
        changesNeeded++;
        result.score -= 20;
      }

      // Check for Replit Auth
      if (content.includes('replit/auth') || content.includes('REPL_OWNER')) {
        result.requiredChanges.push({
          type: 'required',
          file: path,
          description: 'Replace Replit Auth with standard authentication',
          descriptionAr: 'استبدال مصادقة Replit بمصادقة قياسية',
          effort: 'complex'
        });
        changesNeeded++;
        result.score -= 20;
      }
    }

    result.score = Math.max(0, result.score);
    result.estimatedEffort = changesNeeded > 5 ? 'high' : changesNeeded > 2 ? 'medium' : 'low';

    return result;
  }

  /**
   * Estimate hosting costs
   */
  private estimateCost(files: ReplFile[], analysis: ProjectAnalysis): ProjectAnalysis['cost'] {
    let totalSize = 0;
    for (const file of files) {
      totalSize += file.size || 0;
    }

    const sizeMB = totalSize / (1024 * 1024);
    const hasDatabase = analysis.technologies.some(t => 
      ['PostgreSQL', 'MongoDB', 'Redis'].includes(t)
    );

    // Simplified cost estimation
    let computeBase = 5; // Base $5/month for small compute
    let storageBase = sizeMB > 100 ? 5 : 1;
    let databaseCost = hasDatabase ? 15 : 0;

    return {
      computeEstimate: `$${computeBase}-$${computeBase * 4}/month`,
      storageEstimate: `$${storageBase}/month`,
      monthlyEstimate: `$${computeBase + storageBase + databaseCost}-$${(computeBase * 4) + storageBase + databaseCost}/month`
    };
  }

  /**
   * Generate unique sovereign project ID
   * إنشاء معرف مشروع سيادي فريد
   */
  private generateSovereignId(repl: ReplInfo): string {
    const timestamp = Date.now().toString(36);
    const random = randomBytes(4).toString('hex');
    const hash = createHash('sha256')
      .update(`${repl.id}-${repl.slug}-${timestamp}`)
      .digest('hex')
      .substring(0, 8);
    
    return `INF-${hash.toUpperCase()}-${timestamp.toUpperCase()}-${random.toUpperCase()}`;
  }

  /**
   * Generate import manifest documentation
   * إنشاء توثيق الاستيراد
   */
  private generateImportManifest(
    repl: ReplInfo,
    breakdown: { sourceCode: number; configs: number; envTemplates: number; buildScripts: number; assets: number },
    envVarsDiscovered: string[]
  ): string {
    const now = new Date().toISOString();
    const total = breakdown.sourceCode + breakdown.configs + breakdown.envTemplates + breakdown.buildScripts + breakdown.assets;
    
    return `# Import Manifest | وثيقة الاستيراد

## Project Information | معلومات المشروع

| Field | Value |
|-------|-------|
| **Original Name** | ${repl.title} |
| **Slug** | ${repl.slug} |
| **Language** | ${repl.language} |
| **Visibility** | ${repl.isPrivate ? 'Private' : 'Public'} |
| **Original URL** | [${repl.url}](${repl.url}) |
| **Import Date** | ${now} |
| **Original Created** | ${repl.createdAt} |
| **Original Updated** | ${repl.updatedAt} |

## Files Breakdown | تفصيل الملفات

| Category | Count | Description |
|----------|-------|-------------|
| **Source Code** | ${breakdown.sourceCode} | الكود المصدري |
| **Configurations** | ${breakdown.configs} | ملفات الإعداد |
| **Environment Templates** | ${breakdown.envTemplates} | قوالب البيئة |
| **Build Scripts** | ${breakdown.buildScripts} | سكربتات البناء |
| **Assets** | ${breakdown.assets} | الملفات الثابتة |
| **Total** | ${total} | الإجمالي |

${envVarsDiscovered.length > 0 ? `
## Environment Variables Discovered | متغيرات البيئة المكتشفة

> **Security Note**: Actual values have been replaced with placeholders in template files.
> **ملاحظة أمنية**: تم استبدال القيم الفعلية بقوالب في الملفات.

${envVarsDiscovered.map(v => `- ${v}`).join('\n')}
` : ''}

## Imported Files Structure | هيكل الملفات المستوردة

### Configuration Files | ملفات الإعداد
\`\`\`
${repl.files?.filter(f => this.categorizeFile(f.path) === 'configs').map(f => f.path).join('\n') || 'None'}
\`\`\`

### Build/Run Scripts | سكربتات البناء والتشغيل
\`\`\`
${repl.files?.filter(f => this.categorizeFile(f.path) === 'buildScripts').map(f => f.path).join('\n') || 'None'}
\`\`\`

## Sovereignty Status | حالة السيادة

- [x] **Source Code**: Fully sovereign | الكود المصدري: سيادي بالكامل
- [x] **Configurations**: Imported | الإعدادات: تم الاستيراد
- [x] **Environment Templates**: Secure templates created | قوالب البيئة: تم إنشاء قوالب آمنة
- [x] **Build Scripts**: Imported | سكربتات البناء: تم الاستيراد
- [x] **Version Control**: Internal Git | التحكم بالإصدارات: Git داخلي

## Next Steps | الخطوات التالية

1. Review and configure environment variables in \`.env.template\` files
2. Test build and run scripts locally
3. Update any hardcoded Replit-specific paths
4. Configure CI/CD for automated deployments

---

*This manifest was auto-generated by INFERA WebNova Replit Import System*
*تم إنشاء هذا التوثيق تلقائياً بواسطة نظام استيراد Replit في INFERA WebNova*
`;
  }

  /**
   * Generate comprehensive analysis report
   * إنشاء تقرير التحليل الشامل
   */
  private generateAnalysisReport(
    repl: ReplInfo,
    analysis: ProjectAnalysis,
    sovereignty: SovereigntyStatus,
    breakdown: { sourceCode: number; configs: number; envTemplates: number; buildScripts: number; assets: number }
  ): string {
    const now = new Date().toISOString();
    
    return `# Project Analysis Report | تقرير تحليل المشروع

## Sovereign Identity | الهوية السيادية

| Property | Value |
|----------|-------|
| **Sovereign ID** | \`${sovereignty.internalProjectId}\` |
| **Independence Level** | ${sovereignty.independenceLevel === 'full' ? 'Full (كامل)' : sovereignty.independenceLevel} |
| **Is Decoupled** | ${sovereignty.isDecoupled ? 'Yes - Replit is initial source only' : 'No'} |
| **Original Source** | Replit (مصدر أولي فقط) |
| **Source Role** | Initial Import Only (استيراد أولي فقط) |
| **Import Date** | ${sovereignty.importedAt} |
| **Sync Enabled** | ${sovereignty.syncEnabled ? 'Yes' : 'No (recommended)'} |

> **Important**: This project is now **fully sovereign**. Replit is considered only as the initial source, not the primary source. All future development should happen in the internal repository.
>
> **هام**: هذا المشروع الآن **سيادي بالكامل**. Replit يعتبر فقط كمصدر أولي وليس المصدر الأساسي. جميع التطوير المستقبلي يجب أن يتم في المستودع الداخلي.

---

## Language & Technology Analysis | تحليل اللغات والتقنيات

### Languages | اللغات
${analysis.languages.length > 0 
  ? analysis.languages.map(l => `| ${l.name} | ${l.percentage}% | ${l.files} files |`).join('\n') 
  : '| No languages detected | - | - |'}

### Frameworks | أطر العمل
${analysis.frameworks.length > 0 ? analysis.frameworks.map(f => `- ${f}`).join('\n') : '- None detected'}

### Technologies | التقنيات
${analysis.technologies.length > 0 ? analysis.technologies.map(t => `- ${t}`).join('\n') : '- None detected'}

---

## Dependencies Analysis | تحليل الاعتماديات

| Metric | Value |
|--------|-------|
| **Total Dependencies** | ${analysis.dependencies.total} |
| **Production** | ${analysis.dependencies.production.length} |
| **Development** | ${analysis.dependencies.development.length} |
| **Vulnerable** | ${analysis.dependencies.vulnerable} ${analysis.dependencies.vulnerable > 0 ? '⚠️' : '✅'} |

${analysis.dependencies.vulnerable > 0 ? `
### Vulnerable Dependencies | الاعتماديات المعرضة للخطر
${[...analysis.dependencies.production, ...analysis.dependencies.development]
  .filter(d => d.hasVulnerability)
  .map(d => `- \`${d.name}@${d.version}\` - Update recommended`)
  .join('\n')}
` : ''}

---

## Security Analysis | تحليل الأمان

| Metric | Score |
|--------|-------|
| **Security Score** | ${analysis.security.score}/100 ${analysis.security.score >= 80 ? '✅' : analysis.security.score >= 50 ? '⚠️' : '❌'} |
| **Issues Found** | ${analysis.security.issues.length} |
| **Replit-Specific Code** | ${analysis.security.replitSpecific.length} items |

${analysis.security.issues.length > 0 ? `
### Security Issues | مشاكل الأمان
| Severity | Type | File | Recommendation |
|----------|------|------|----------------|
${analysis.security.issues.map(i => `| ${i.severity.toUpperCase()} | ${i.type} | ${i.file || 'N/A'} | ${i.recommendation} |`).join('\n')}
` : ''}

${analysis.security.replitSpecific.length > 0 ? `
### Replit-Specific Code | كود خاص بـ Replit
${analysis.security.replitSpecific.map(s => `- ${s}`).join('\n')}
` : ''}

---

## Portability Analysis | تحليل قابلية النقل

| Metric | Value |
|--------|-------|
| **Portability Score** | ${analysis.portability.score}/100 ${analysis.portability.score >= 80 ? '✅' : analysis.portability.score >= 50 ? '⚠️' : '❌'} |
| **Estimated Effort** | ${analysis.portability.estimatedEffort === 'low' ? 'Low (منخفض)' : analysis.portability.estimatedEffort === 'medium' ? 'Medium (متوسط)' : 'High (عالي)'} |
| **Required Changes** | ${analysis.portability.requiredChanges.filter(c => c.type === 'required').length} |
| **Recommended Changes** | ${analysis.portability.requiredChanges.filter(c => c.type === 'recommended').length} |

${analysis.portability.requiredChanges.length > 0 ? `
### Required Changes for Independence | التغييرات المطلوبة للاستقلال
| Priority | File | Description | Effort |
|----------|------|-------------|--------|
${analysis.portability.requiredChanges.map(c => `| ${c.type === 'required' ? '🔴 Required' : '🟡 Recommended'} | ${c.file} | ${c.description} | ${c.effort} |`).join('\n')}
` : ''}

${analysis.portability.replitDependencies.length > 0 ? `
### Replit Dependencies to Replace | اعتماديات Replit للاستبدال
${analysis.portability.replitDependencies.map(d => `- ${d}`).join('\n')}
` : ''}

---

## Cost Estimation | تقدير التكلفة

| Category | Estimate |
|----------|----------|
| **Compute** | ${analysis.cost.computeEstimate} |
| **Storage** | ${analysis.cost.storageEstimate} |
| **Total Monthly** | ${analysis.cost.monthlyEstimate} |

> Note: These are rough estimates based on project size and technologies. Actual costs may vary based on usage.

---

## Recommendations | التوصيات

### Immediate Actions | إجراءات فورية
1. ${analysis.security.score < 100 ? 'Address security issues in the report above' : 'No security issues found'}
2. ${analysis.portability.requiredChanges.filter(c => c.type === 'required').length > 0 ? 'Complete required portability changes' : 'No required changes'}
3. Configure environment variables from \`.env.template\`
4. Test application locally before deployment

### Long-term Actions | إجراءات طويلة المدى
1. Set up CI/CD pipeline for automated testing
2. Configure monitoring and alerting
3. Implement backup strategy
4. Consider containerization with Docker

---

*Generated by INFERA WebNova Analysis Engine*
*Report Date: ${now}*
`;
  }

  // ============ Independent Runtime Engine | محرك التشغيل المستقل ============

  /**
   * Generate independent runtime configuration
   * توليد تكوين بيئة التشغيل المستقلة
   */
  public generateIndependentRuntime(
    files: ReplFile[],
    analysis: ProjectAnalysis
  ): IndependentRuntimeConfig {
    // Detect primary runtime
    const runtimeType = this.detectPrimaryRuntime(analysis);
    const portConfig = this.detectPorts(files);
    
    // Generate all configuration files
    const dockerfile = this.generateDockerfile(runtimeType, analysis, files);
    const dockerCompose = this.generateDockerCompose(runtimeType, analysis, portConfig);
    const startScript = this.generateStartScript(runtimeType, files);
    const envConfig = this.generateEnvConfig(files, analysis);
    const replacements = this.generateDependencyReplacements(files, analysis);

    return {
      dockerfile,
      dockerCompose,
      startScript,
      envConfig,
      replacements,
      runtimeType,
      portConfig
    };
  }

  /**
   * Detect primary runtime from analysis
   */
  private detectPrimaryRuntime(analysis: ProjectAnalysis): IndependentRuntimeConfig['runtimeType'] {
    const langs = analysis.languages.map(l => l.name.toLowerCase());
    
    if (langs.includes('typescript') || langs.includes('javascript')) return 'node';
    if (langs.includes('python')) return 'python';
    if (langs.includes('go')) return 'go';
    if (langs.includes('rust')) return 'rust';
    if (langs.length > 2) return 'multi';
    
    return 'node'; // Default
  }

  /**
   * Detect ports from files
   */
  private detectPorts(files: ReplFile[]): IndependentRuntimeConfig['portConfig'] {
    const ports: number[] = [];
    let mainPort = 3000;

    for (const file of files) {
      if (!file.content) continue;
      
      // Look for port patterns
      const portMatches = file.content.match(/(?:PORT|port)\s*[=:]\s*(\d{4,5})/g);
      if (portMatches) {
        for (const match of portMatches) {
          const port = parseInt(match.match(/\d+/)?.[0] || '3000');
          if (!ports.includes(port)) ports.push(port);
        }
      }
      
      // Look for listen patterns
      const listenMatches = file.content.match(/\.listen\s*\(\s*(\d{4,5})/g);
      if (listenMatches) {
        for (const match of listenMatches) {
          const port = parseInt(match.match(/\d+/)?.[0] || '3000');
          if (!ports.includes(port)) ports.push(port);
        }
      }
    }

    if (ports.length > 0) {
      mainPort = ports[0];
    }

    return {
      main: mainPort,
      additional: ports.slice(1)
    };
  }

  /**
   * Generate Dockerfile based on runtime type
   */
  private generateDockerfile(
    runtime: IndependentRuntimeConfig['runtimeType'],
    analysis: ProjectAnalysis,
    files: ReplFile[]
  ): string {
    const hasPostgres = analysis.technologies.includes('PostgreSQL');
    const hasRedis = analysis.technologies.includes('Redis');

    switch (runtime) {
      case 'node':
        return this.generateNodeDockerfile(analysis, files);
      case 'python':
        return this.generatePythonDockerfile(analysis, files);
      case 'go':
        return this.generateGoDockerfile(analysis, files);
      case 'rust':
        return this.generateRustDockerfile(analysis, files);
      default:
        return this.generateNodeDockerfile(analysis, files);
    }
  }

  private generateNodeDockerfile(analysis: ProjectAnalysis, files: ReplFile[]): string {
    const hasTypescript = analysis.languages.some(l => l.name === 'TypeScript');
    const hasPrisma = analysis.technologies.includes('Prisma');
    const packageJson = files.find(f => f.path === 'package.json');
    let hasDevScript = false;
    let hasBuildScript = false;
    
    if (packageJson?.content) {
      try {
        const pkg = JSON.parse(packageJson.content);
        hasDevScript = !!pkg.scripts?.dev;
        hasBuildScript = !!pkg.scripts?.build;
      } catch {}
    }

    return `# ============================================
# INFERA WebNova - Independent Node.js Runtime
# Generated automatically for sovereign operation
# ============================================

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
${hasPrisma ? 'COPY prisma ./prisma/' : ''}
RUN npm ci --only=production=false

# Copy source code
COPY . .

${hasBuildScript ? `# Build application
RUN npm run build` : ''}

${hasPrisma ? `# Generate Prisma client
RUN npx prisma generate` : ''}

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \\
    adduser -S nodeapp -u 1001 -G nodejs

# Copy built application
COPY --from=builder --chown=nodeapp:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodeapp:nodejs /app/package*.json ./
${hasBuildScript ? 'COPY --from=builder --chown=nodeapp:nodejs /app/dist ./dist' : 'COPY --from=builder --chown=nodeapp:nodejs /app .'}
${hasPrisma ? 'COPY --from=builder --chown=nodeapp:nodejs /app/prisma ./prisma' : ''}

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Switch to non-root user
USER nodeapp

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start application
CMD ["node", "${hasBuildScript ? 'dist/index.js' : 'index.js'}"]
`;
  }

  private generatePythonDockerfile(analysis: ProjectAnalysis, files: ReplFile[]): string {
    const hasDjango = analysis.frameworks.includes('Django');
    const hasFlask = analysis.frameworks.includes('Flask');
    const hasFastAPI = analysis.frameworks.includes('FastAPI');
    const hasRequirements = files.some(f => f.path === 'requirements.txt');
    const hasPoetry = files.some(f => f.path === 'pyproject.toml');

    return `# ============================================
# INFERA WebNova - Independent Python Runtime
# Generated automatically for sovereign operation
# ============================================

FROM python:3.11-slim AS builder

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \\
    build-essential \\
    libpq-dev \\
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install dependencies
${hasRequirements ? 'COPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt' : ''}
${hasPoetry ? 'COPY pyproject.toml poetry.lock* ./\nRUN pip install poetry && poetry config virtualenvs.create false && poetry install --no-dev' : ''}

# Production stage
FROM python:3.11-slim AS production

WORKDIR /app

# Create non-root user
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Copy virtual environment
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy application code
COPY --chown=appuser:appgroup . .

# Set environment
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PORT=8000

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Start application
${hasDjango ? 'CMD ["gunicorn", "--bind", "0.0.0.0:8000", "config.wsgi:application"]' : ''}
${hasFlask ? 'CMD ["gunicorn", "--bind", "0.0.0.0:8000", "app:app"]' : ''}
${hasFastAPI ? 'CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]' : ''}
${!hasDjango && !hasFlask && !hasFastAPI ? 'CMD ["python", "main.py"]' : ''}
`;
  }

  private generateGoDockerfile(analysis: ProjectAnalysis, files: ReplFile[]): string {
    return `# ============================================
# INFERA WebNova - Independent Go Runtime
# Generated automatically for sovereign operation
# ============================================

# Build stage
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache git ca-certificates

# Copy go mod files
COPY go.mod go.sum* ./
RUN go mod download

# Copy source code
COPY . .

# Build binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Production stage
FROM alpine:3.19 AS production

WORKDIR /app

# Add CA certificates and create non-root user
RUN apk --no-cache add ca-certificates && \\
    addgroup -g 1001 -S appgroup && \\
    adduser -S appuser -u 1001 -G appgroup

# Copy binary
COPY --from=builder --chown=appuser:appgroup /app/main .

# Set environment
ENV PORT=8080

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Start application
CMD ["./main"]
`;
  }

  private generateRustDockerfile(analysis: ProjectAnalysis, files: ReplFile[]): string {
    return `# ============================================
# INFERA WebNova - Independent Rust Runtime
# Generated automatically for sovereign operation
# ============================================

# Build stage
FROM rust:1.75-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache musl-dev

# Copy manifests
COPY Cargo.toml Cargo.lock* ./

# Create dummy source to cache dependencies
RUN mkdir src && \\
    echo "fn main() {}" > src/main.rs && \\
    cargo build --release && \\
    rm -rf src

# Copy actual source
COPY src ./src

# Build release binary
RUN cargo build --release

# Production stage
FROM alpine:3.19 AS production

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \\
    adduser -S appuser -u 1001 -G appgroup

# Copy binary
COPY --from=builder --chown=appuser:appgroup /app/target/release/app .

# Set environment
ENV PORT=8080
ENV RUST_LOG=info

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Start application
CMD ["./app"]
`;
  }

  /**
   * Generate docker-compose.yml
   */
  private generateDockerCompose(
    runtime: IndependentRuntimeConfig['runtimeType'],
    analysis: ProjectAnalysis,
    portConfig: IndependentRuntimeConfig['portConfig']
  ): string {
    const hasPostgres = analysis.technologies.includes('PostgreSQL');
    const hasRedis = analysis.technologies.includes('Redis');
    const hasMongo = analysis.technologies.includes('MongoDB');

    const services: string[] = [];
    
    // Main app service
    services.push(`  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: infera-app
    restart: unless-stopped
    ports:
      - "\${PORT:-${portConfig.main}}:${portConfig.main}"
${portConfig.additional.map(p => `      - "${p}:${p}"`).join('\n')}
    environment:
      - NODE_ENV=production
      - PORT=${portConfig.main}
${hasPostgres ? '      - DATABASE_URL=postgresql://postgres:postgres@db:5432/app' : ''}
${hasRedis ? '      - REDIS_URL=redis://redis:6379' : ''}
${hasMongo ? '      - MONGODB_URL=mongodb://mongo:27017/app' : ''}
    env_file:
      - .env
${hasPostgres || hasRedis || hasMongo ? '    depends_on:' : ''}
${hasPostgres ? '      - db' : ''}
${hasRedis ? '      - redis' : ''}
${hasMongo ? '      - mongo' : ''}
    networks:
      - infera-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:${portConfig.main}/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 10s`);

    // PostgreSQL service
    if (hasPostgres) {
      services.push(`
  db:
    image: postgres:16-alpine
    container_name: infera-postgres
    restart: unless-stopped
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=app
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - infera-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5`);
    }

    // Redis service
    if (hasRedis) {
      services.push(`
  redis:
    image: redis:7-alpine
    container_name: infera-redis
    restart: unless-stopped
    volumes:
      - redis_data:/data
    networks:
      - infera-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3`);
    }

    // MongoDB service
    if (hasMongo) {
      services.push(`
  mongo:
    image: mongo:7
    container_name: infera-mongo
    restart: unless-stopped
    volumes:
      - mongo_data:/data/db
    networks:
      - infera-network
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 3`);
    }

    // Volumes section
    const volumes: string[] = [];
    if (hasPostgres) volumes.push('  postgres_data:');
    if (hasRedis) volumes.push('  redis_data:');
    if (hasMongo) volumes.push('  mongo_data:');

    return `# ============================================
# INFERA WebNova - Independent Docker Compose
# Generated automatically for sovereign operation
# ============================================
# 
# Usage:
#   Development: docker-compose up -d
#   Production:  docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
#   Logs:        docker-compose logs -f app
#   Stop:        docker-compose down
#   Clean:       docker-compose down -v
#
# ============================================

version: '3.9'

services:
${services.join('\n')}

networks:
  infera-network:
    driver: bridge

${volumes.length > 0 ? `volumes:\n${volumes.join('\n')}` : ''}
`;
  }

  /**
   * Generate start script
   */
  private generateStartScript(runtime: IndependentRuntimeConfig['runtimeType'], files: ReplFile[]): string {
    let startCommand = '';
    
    switch (runtime) {
      case 'node':
        // Check for package.json scripts
        const packageJson = files.find(f => f.path === 'package.json');
        if (packageJson?.content) {
          try {
            const pkg = JSON.parse(packageJson.content);
            if (pkg.scripts?.start) startCommand = 'npm start';
            else if (pkg.scripts?.dev) startCommand = 'npm run dev';
          } catch {}
        }
        if (!startCommand) startCommand = 'node index.js';
        break;
      case 'python':
        if (files.some(f => f.path === 'manage.py')) startCommand = 'python manage.py runserver 0.0.0.0:8000';
        else if (files.some(f => f.path === 'app.py')) startCommand = 'python app.py';
        else startCommand = 'python main.py';
        break;
      case 'go':
        startCommand = 'go run .';
        break;
      case 'rust':
        startCommand = 'cargo run --release';
        break;
      default:
        startCommand = 'npm start';
    }

    return `#!/bin/bash
# ============================================
# INFERA WebNova - Independent Start Script
# Generated automatically for sovereign operation
# ============================================

set -e

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
NC='\\033[0m' # No Color

echo -e "\${GREEN}========================================\${NC}"
echo -e "\${GREEN}  INFERA WebNova - Starting Application \${NC}"
echo -e "\${GREEN}========================================\${NC}"

# Check for .env file
if [ ! -f .env ]; then
    if [ -f .env.template ]; then
        echo -e "\${YELLOW}Warning: .env file not found. Copying from .env.template\${NC}"
        cp .env.template .env
        echo -e "\${YELLOW}Please update .env with your actual values\${NC}"
    else
        echo -e "\${RED}Error: No .env or .env.template file found\${NC}"
        exit 1
    fi
fi

# Load environment variables
export $(grep -v '^#' .env | xargs)

# Check required environment variables
check_env() {
    if [ -z "\${!1}" ]; then
        echo -e "\${RED}Error: \$1 is not set\${NC}"
        return 1
    fi
}

# Run database migrations if needed
if [ -f "prisma/schema.prisma" ]; then
    echo -e "\${GREEN}Running Prisma migrations...\${NC}"
    npx prisma migrate deploy
fi

if [ -f "drizzle.config.ts" ] || [ -f "drizzle.config.js" ]; then
    echo -e "\${GREEN}Running Drizzle migrations...\${NC}"
    npx drizzle-kit push
fi

if [ -f "manage.py" ]; then
    echo -e "\${GREEN}Running Django migrations...\${NC}"
    python manage.py migrate
fi

# Start the application
echo -e "\${GREEN}Starting application...\${NC}"
echo -e "Command: ${startCommand}"
echo ""

${startCommand}
`;
  }

  /**
   * Generate environment configuration
   */
  private generateEnvConfig(files: ReplFile[], analysis: ProjectAnalysis): IndependentRuntimeConfig['envConfig'] {
    const variables: EnvVariable[] = [];

    // Standard variables
    variables.push({
      key: 'NODE_ENV',
      description: 'Environment mode (development/production)',
      descriptionAr: 'وضع البيئة',
      required: true,
      defaultValue: 'production',
      sensitive: false
    });

    variables.push({
      key: 'PORT',
      description: 'Application port',
      descriptionAr: 'منفذ التطبيق',
      required: true,
      defaultValue: '3000',
      sensitive: false
    });

    // Database if detected
    if (analysis.technologies.includes('PostgreSQL')) {
      variables.push({
        key: 'DATABASE_URL',
        description: 'PostgreSQL connection string',
        descriptionAr: 'رابط اتصال PostgreSQL',
        required: true,
        defaultValue: 'postgresql://user:password@localhost:5432/database',
        sensitive: true,
        replitEquivalent: 'REPLIT_DB_URL'
      });
    }

    if (analysis.technologies.includes('Redis')) {
      variables.push({
        key: 'REDIS_URL',
        description: 'Redis connection string',
        descriptionAr: 'رابط اتصال Redis',
        required: false,
        defaultValue: 'redis://localhost:6379',
        sensitive: true
      });
    }

    // Check for API keys in files
    for (const file of files) {
      if (!file.content) continue;
      
      // OpenAI
      if (file.content.includes('OPENAI_API_KEY') || file.content.includes('openai')) {
        if (!variables.some(v => v.key === 'OPENAI_API_KEY')) {
          variables.push({
            key: 'OPENAI_API_KEY',
            description: 'OpenAI API Key',
            descriptionAr: 'مفتاح OpenAI',
            required: true,
            sensitive: true
          });
        }
      }

      // Stripe
      if (file.content.includes('STRIPE') || file.content.includes('stripe')) {
        if (!variables.some(v => v.key === 'STRIPE_SECRET_KEY')) {
          variables.push({
            key: 'STRIPE_SECRET_KEY',
            description: 'Stripe Secret Key',
            descriptionAr: 'المفتاح السري لـ Stripe',
            required: true,
            sensitive: true
          });
        }
      }

      // Session secret
      if (file.content.includes('SESSION_SECRET') || file.content.includes('session')) {
        if (!variables.some(v => v.key === 'SESSION_SECRET')) {
          variables.push({
            key: 'SESSION_SECRET',
            description: 'Session encryption secret',
            descriptionAr: 'مفتاح تشفير الجلسة',
            required: true,
            sensitive: true
          });
        }
      }
    }

    // Generate template content
    const template = variables.map(v => {
      const comment = `# ${v.description} | ${v.descriptionAr}`;
      const required = v.required ? '# REQUIRED' : '# Optional';
      const value = v.sensitive ? `${v.key}=your_${v.key.toLowerCase()}_here` : `${v.key}=${v.defaultValue || ''}`;
      return `${comment}\n${required}\n${value}`;
    }).join('\n\n');

    return {
      path: '.env.template',
      template: `# ============================================
# INFERA WebNova - Environment Configuration
# Generated for Independent Operation
# ============================================
#
# Copy this file to .env and fill in your values
# cp .env.template .env
#
# NEVER commit .env to version control!
# ============================================

${template}
`,
      variables
    };
  }

  /**
   * Generate dependency replacements for Replit-specific packages
   */
  private generateDependencyReplacements(files: ReplFile[], analysis: ProjectAnalysis): DependencyReplacement[] {
    const replacements: DependencyReplacement[] = [];

    // Check for @replit packages
    const packageJson = files.find(f => f.path === 'package.json');
    if (packageJson?.content) {
      try {
        const pkg = JSON.parse(packageJson.content);
        const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
        
        for (const [name, version] of Object.entries(allDeps)) {
          if (name.startsWith('@replit/')) {
            const replacement = this.getReplitPackageReplacement(name);
            if (replacement) {
              replacements.push(replacement);
            }
          }
        }
      } catch {}
    }

    // Check for Replit DB usage
    for (const file of files) {
      if (!file.content) continue;
      
      if (file.content.includes('@replit/database') || file.content.includes('replit/database')) {
        if (!replacements.some(r => r.original.includes('database'))) {
          replacements.push({
            original: '@replit/database',
            replacement: 'Redis or PostgreSQL',
            reason: 'Replit Database is a proprietary key-value store',
            reasonAr: 'قاعدة بيانات Replit هي تخزين مفتاح-قيمة خاصة',
            effort: 'moderate',
            instructions: [
              'Install Redis: npm install redis ioredis',
              'Or use PostgreSQL with jsonb columns for key-value storage',
              'Replace Client() with Redis or pg client',
              'Migrate existing data using export/import'
            ]
          });
        }
      }

      if (file.content.includes('@replit/object-storage')) {
        if (!replacements.some(r => r.original.includes('object-storage'))) {
          replacements.push({
            original: '@replit/object-storage',
            replacement: 'AWS S3 or MinIO',
            reason: 'Replit Object Storage is S3-compatible, easy migration',
            reasonAr: 'تخزين Replit متوافق مع S3، ترحيل سهل',
            effort: 'easy',
            instructions: [
              'Install AWS SDK: npm install @aws-sdk/client-s3',
              'Configure S3 credentials in environment variables',
              'Replace object storage calls with S3 SDK calls',
              'For self-hosted: use MinIO as S3-compatible storage'
            ]
          });
        }
      }
    }

    // Add Replit Auth replacement if detected
    if (analysis.security.replitSpecific.some(s => s.includes('auth') || s.includes('REPL_OWNER'))) {
      replacements.push({
        original: 'Replit Authentication',
        replacement: 'Passport.js or NextAuth.js',
        reason: 'Replit Auth only works within Replit environment',
        reasonAr: 'مصادقة Replit تعمل فقط داخل بيئة Replit',
        effort: 'complex',
        instructions: [
          'Install Passport.js: npm install passport passport-local express-session',
          'Or use NextAuth.js for Next.js projects: npm install next-auth',
          'Create user database table with password hashing (bcrypt)',
          'Implement login/register routes',
          'Replace REPL_OWNER checks with session-based auth'
        ]
      });
    }

    return replacements;
  }

  /**
   * Get replacement for specific @replit package
   */
  private getReplitPackageReplacement(packageName: string): DependencyReplacement | null {
    const replacementMap: Record<string, DependencyReplacement> = {
      '@replit/database': {
        original: '@replit/database',
        replacement: 'ioredis or pg',
        reason: 'Replit key-value database',
        reasonAr: 'قاعدة بيانات مفتاح-قيمة Replit',
        effort: 'moderate',
        instructions: ['npm install ioredis', 'Replace Client with Redis client']
      },
      '@replit/object-storage': {
        original: '@replit/object-storage',
        replacement: '@aws-sdk/client-s3',
        reason: 'S3-compatible object storage',
        reasonAr: 'تخزين كائنات متوافق مع S3',
        effort: 'easy',
        instructions: ['npm install @aws-sdk/client-s3', 'Configure AWS credentials']
      },
      '@replit/ai': {
        original: '@replit/ai',
        replacement: 'openai or @anthropic-ai/sdk',
        reason: 'Replit AI wrapper',
        reasonAr: 'غلاف Replit AI',
        effort: 'easy',
        instructions: ['npm install openai', 'Use OpenAI SDK directly']
      }
    };

    return replacementMap[packageName] || null;
  }

  /**
   * Apply independent runtime to repository
   * تطبيق بيئة التشغيل المستقلة على المستودع
   */
  async applyIndependentRuntime(
    userId: string,
    userEmail: string,
    repositoryId: string
  ): Promise<{
    success: boolean;
    filesCreated: string[];
    replacements: DependencyReplacement[];
    message: string;
    messageAr: string;
  }> {
    try {
      const repo = await sovereignGitEngine.getRepository(repositoryId);
      if (!repo) {
        return {
          success: false,
          filesCreated: [],
          replacements: [],
          message: 'Repository not found',
          messageAr: 'المستودع غير موجود'
        };
      }

      // Get all files from repository
      const repoFiles = await sovereignGitEngine.getRepositoryFiles(repositoryId, 'main');
      const files: ReplFile[] = repoFiles.map(f => ({
        path: f.path,
        content: f.content || '',
        type: f.type === 'tree' ? 'directory' as const : 'file' as const,
        size: f.size
      }));

      // Analyze project
      const analysis = this.analyzeProject(files, {
        id: repo.id,
        slug: repo.name,
        title: repo.name,
        language: repo.language || 'javascript',
        isPrivate: repo.visibility === 'private',
        url: '',
        createdAt: repo.createdAt?.toISOString() || '',
        updatedAt: repo.updatedAt?.toISOString() || ''
      });

      // Generate independent runtime config
      const runtimeConfig = this.generateIndependentRuntime(files, analysis);

      // Create files to commit
      const filesToCommit: { path: string; content: string; action: 'add' | 'modify' }[] = [];

      // Add Dockerfile
      filesToCommit.push({
        path: 'Dockerfile',
        content: runtimeConfig.dockerfile,
        action: 'add'
      });

      // Add docker-compose.yml
      filesToCommit.push({
        path: 'docker-compose.yml',
        content: runtimeConfig.dockerCompose,
        action: 'add'
      });

      // Add start script
      filesToCommit.push({
        path: 'start.sh',
        content: runtimeConfig.startScript,
        action: 'add'
      });

      // Add .env.template
      filesToCommit.push({
        path: '.env.template',
        content: runtimeConfig.envConfig.template,
        action: 'add'
      });

      // Add .dockerignore
      filesToCommit.push({
        path: '.dockerignore',
        content: `# ============================================
# INFERA WebNova - Docker Ignore
# ============================================

node_modules
npm-debug.log
.env
.env.local
.env.*.local
.git
.gitignore
*.md
!README.md
.vscode
.idea
coverage
.nyc_output
dist
build
*.log
`,
        action: 'add'
      });

      // Add INDEPENDENCE_GUIDE.md
      const independenceGuide = this.generateIndependenceGuide(runtimeConfig, analysis);
      filesToCommit.push({
        path: 'INDEPENDENCE_GUIDE.md',
        content: independenceGuide,
        action: 'add'
      });

      // Commit all files
      await sovereignGitEngine.createCommit({
        repositoryId,
        branchName: 'main',
        message: 'Add independent runtime configuration',
        description: `Generated independent runtime for sovereign operation:\n` +
          `- Dockerfile for containerization\n` +
          `- docker-compose.yml for full stack\n` +
          `- start.sh for local development\n` +
          `- Environment configuration template`,
        authorId: userId,
        authorName: 'INFERA Independence Engine',
        authorEmail: userEmail,
        files: filesToCommit
      });

      console.log(`[ReplitImport] Applied independent runtime to repository ${repositoryId}`);

      return {
        success: true,
        filesCreated: filesToCommit.map(f => f.path),
        replacements: runtimeConfig.replacements,
        message: `Independent runtime configured. ${filesToCommit.length} files created.`,
        messageAr: `تم تكوين بيئة التشغيل المستقلة. ${filesToCommit.length} ملفات أُنشئت.`
      };
    } catch (error: any) {
      console.error('[ReplitImport] Failed to apply independent runtime:', error);
      return {
        success: false,
        filesCreated: [],
        replacements: [],
        message: error.message,
        messageAr: 'فشل في تطبيق بيئة التشغيل المستقلة'
      };
    }
  }

  /**
   * Generate independence guide
   */
  private generateIndependenceGuide(config: IndependentRuntimeConfig, analysis: ProjectAnalysis): string {
    return `# Independence Guide | دليل الاستقلال
# ============================================
# Generated by INFERA WebNova Independence Engine
# ============================================

## Overview | نظرة عامة

This project has been configured for **fully independent operation** outside of Replit.
All Replit-specific dependencies have been identified and alternatives provided.

تم تكوين هذا المشروع للعمل **بشكل مستقل تماماً** خارج Replit.
تم تحديد جميع الاعتماديات الخاصة بـ Replit وتوفير البدائل.

---

## Quick Start | البدء السريع

### Option 1: Docker (Recommended)
\`\`\`bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
\`\`\`

### Option 2: Local Development
\`\`\`bash
# Copy environment template
cp .env.template .env

# Edit .env with your values
nano .env

# Run start script
chmod +x start.sh
./start.sh
\`\`\`

---

## Runtime Configuration | تكوين بيئة التشغيل

| Property | Value |
|----------|-------|
| **Runtime Type** | ${config.runtimeType} |
| **Main Port** | ${config.portConfig.main} |
| **Additional Ports** | ${config.portConfig.additional.join(', ') || 'None'} |
| **Container Ready** | Yes |

---

## Required Changes | التغييرات المطلوبة

${config.replacements.length > 0 ? config.replacements.map(r => `
### ${r.original} → ${r.replacement}

**Reason**: ${r.reason}
**السبب**: ${r.reasonAr}
**Effort**: ${r.effort}

**Instructions**:
${r.instructions.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}
`).join('\n---\n') : 'No Replit-specific dependencies detected. Project is ready for independent operation.'}

---

## Environment Variables | متغيرات البيئة

The following environment variables need to be configured:

${config.envConfig.variables.map(v => `
### ${v.key}
- **Description**: ${v.description} | ${v.descriptionAr}
- **Required**: ${v.required ? 'Yes' : 'No'}
- **Sensitive**: ${v.sensitive ? 'Yes - Do not commit!' : 'No'}
${v.replitEquivalent ? `- **Replit Equivalent**: ${v.replitEquivalent}` : ''}
`).join('')}

---

## Deployment Options | خيارات النشر

### Cloud Providers
- **AWS**: Use ECS or EC2 with the provided Dockerfile
- **Google Cloud**: Use Cloud Run or GKE
- **Azure**: Use Container Apps or AKS
- **DigitalOcean**: Use App Platform or Kubernetes
- **Hetzner**: Use Cloud VPS with Docker

### Self-Hosted
- Use Docker Compose on any Linux server
- Minimum requirements: 1 CPU, 1GB RAM, 10GB SSD

---

## Security Checklist | قائمة الأمان

- [ ] All secrets moved to environment variables
- [ ] .env file added to .gitignore
- [ ] Non-root user configured in Docker
- [ ] Health checks enabled
- [ ] HTTPS/TLS configured for production
- [ ] Database credentials secured

---

## Support | الدعم

This project was configured by INFERA WebNova Independence Engine.
For questions about independent operation, consult the ANALYSIS_REPORT.md file.

---

*Generated by INFERA WebNova v1.0*
`;
  }

  constructor() {
    console.log("[ReplitImport] Service initialized | تم تهيئة خدمة استيراد Replit");
  }

  // ============ Connection Management (Database-backed) ============

  /**
   * Initialize connection with Replit using access token
   * يمكن الحصول على Token من إعدادات حساب Replit
   */
  async connectWithToken(userId: string, accessToken: string, tenantId: string = 'default'): Promise<{
    success: boolean;
    connection?: ReplitConnection;
    error?: string;
  }> {
    try {
      // Verify token by fetching user info
      const userInfo = await this.fetchReplitUser(accessToken);
      
      if (!userInfo) {
        return {
          success: false,
          error: "Invalid access token or unable to fetch user info"
        };
      }

      // Check if connection exists, update or insert
      const [existing] = await db.select().from(replitConnections).where(eq(replitConnections.userId, userId));
      
      let dbConnection: DBReplitConnection;
      if (existing) {
        // Update existing connection
        const [updated] = await db.update(replitConnections)
          .set({
            replitUserId: userInfo.id,
            replitUsername: userInfo.username,
            accessToken,
            isActive: true,
            lastUsedAt: new Date()
          })
          .where(eq(replitConnections.userId, userId))
          .returning();
        dbConnection = updated;
      } else {
        // Insert new connection
        const [inserted] = await db.insert(replitConnections).values({
          userId,
          tenantId,
          replitUserId: userInfo.id,
          replitUsername: userInfo.username,
          accessToken,
          isActive: true
        }).returning();
        dbConnection = inserted;
      }

      const connection: ReplitConnection = {
        id: dbConnection.id,
        userId: dbConnection.userId,
        replitUserId: dbConnection.replitUserId,
        replitUsername: dbConnection.replitUsername,
        accessToken: '***hidden***',
        isActive: dbConnection.isActive,
        connectedAt: dbConnection.connectedAt!
      };

      return {
        success: true,
        connection: {
          ...connection,
          accessToken: '***hidden***' // Don't expose token
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get OAuth URL for Replit authorization
   * رابط المصادقة عبر OAuth
   */
  getOAuthUrl(redirectUri: string, state: string): string {
    const clientId = process.env.REPLIT_CLIENT_ID;
    if (!clientId) {
      throw new Error("REPLIT_CLIENT_ID not configured");
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      state,
      scope: 'read:user read:repl write:repl'
    });

    return `${this.baseUrl}/auth/oauth?${params.toString()}`;
  }

  /**
   * Exchange OAuth code for access token
   * تبادل كود OAuth بالـ Token
   */
  async exchangeOAuthCode(code: string, redirectUri: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
  } | null> {
    const clientId = process.env.REPLIT_CLIENT_ID;
    const clientSecret = process.env.REPLIT_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("Replit OAuth credentials not configured");
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code'
        })
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in
      };
    } catch (error) {
      console.error("[ReplitImport] OAuth exchange failed:", error);
      return null;
    }
  }

  /**
   * Get current connection for user (from database)
   */
  async getConnection(userId: string): Promise<ReplitConnection | undefined> {
    const [conn] = await db.select().from(replitConnections).where(eq(replitConnections.userId, userId));
    if (!conn) return undefined;
    
    return {
      id: conn.id,
      userId: conn.userId,
      replitUserId: conn.replitUserId,
      replitUsername: conn.replitUsername,
      accessToken: '***hidden***',
      isActive: conn.isActive,
      connectedAt: conn.connectedAt!
    };
  }

  /**
   * Get connection with token (for internal use)
   */
  private async getConnectionWithToken(userId: string): Promise<DBReplitConnection | undefined> {
    const [conn] = await db.select().from(replitConnections).where(eq(replitConnections.userId, userId));
    return conn;
  }

  /**
   * Disconnect from Replit
   */
  async disconnect(userId: string): Promise<boolean> {
    await db.update(replitConnections)
      .set({ isActive: false })
      .where(eq(replitConnections.userId, userId));
    return true;
  }

  /**
   * Check if user is connected
   */
  async isConnected(userId: string): Promise<boolean> {
    const conn = await this.getConnectionWithToken(userId);
    return !!conn && conn.isActive;
  }

  // ============ Replit API Operations ============

  /**
   * Fetch Replit user info using GraphQL API
   */
  private async fetchReplitUser(accessToken: string): Promise<{
    id: string;
    username: string;
    email?: string;
    bio?: string;
    profileImage?: string;
  } | null> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          query: `
            query CurrentUser {
              currentUser {
                id
                username
                email
                bio
                image
              }
            }
          `
        })
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      if (data.errors || !data.data?.currentUser) {
        return null;
      }

      const user = data.data.currentUser;
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profileImage: user.image
      };
    } catch (error) {
      console.error("[ReplitImport] Failed to fetch user:", error);
      return null;
    }
  }

  /**
   * List user's Repls
   * استعراض مشاريع المستخدم
   */
  async listRepls(userId: string, options?: {
    limit?: number;
    search?: string;
  }): Promise<ReplInfo[]> {
    const connection = await this.getConnectionWithToken(userId);
    if (!connection || !connection.isActive) {
      throw new Error("Not connected to Replit | غير متصل بـ Replit");
    }

    try {
      const limit = options?.limit || 50;
      const searchFilter = options?.search ? `, search: "${options.search}"` : '';

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${connection.accessToken}`,
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          query: `
            query UserRepls($username: String!) {
              userByUsername(username: $username) {
                repls(count: ${limit}${searchFilter}) {
                  items {
                    id
                    slug
                    title
                    description
                    language
                    isPrivate
                    url
                    iconUrl
                    timeCreated
                    timeUpdated
                  }
                }
              }
            }
          `,
          variables: {
            username: connection.replitUsername
          }
        })
      });

      if (!response.ok) {
        throw new Error("Failed to fetch Repls");
      }

      const data = await response.json();
      if (data.errors) {
        throw new Error(data.errors[0]?.message || "GraphQL error");
      }

      const repls = data.data?.userByUsername?.repls?.items || [];
      return repls.map((repl: any) => ({
        id: repl.id,
        slug: repl.slug,
        title: repl.title,
        description: repl.description,
        language: repl.language,
        isPrivate: repl.isPrivate,
        url: repl.url,
        iconUrl: repl.iconUrl,
        createdAt: repl.timeCreated,
        updatedAt: repl.timeUpdated
      }));
    } catch (error: any) {
      console.error("[ReplitImport] Failed to list Repls:", error);
      throw error;
    }
  }

  /**
   * Get Repl details with files
   * الحصول على تفاصيل المشروع مع الملفات
   */
  async getReplDetails(userId: string, replId: string): Promise<ReplInfo | null> {
    const connection = await this.getConnectionWithToken(userId);
    if (!connection || !connection.isActive) {
      throw new Error("Not connected to Replit | غير متصل بـ Replit");
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${connection.accessToken}`,
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          query: `
            query ReplDetails($id: String!) {
              repl(id: $id) {
                id
                slug
                title
                description
                language
                isPrivate
                url
                iconUrl
                timeCreated
                timeUpdated
                files {
                  path
                  content
                }
              }
            }
          `,
          variables: { id: replId }
        })
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      if (data.errors || !data.data?.repl) {
        return null;
      }

      const repl = data.data.repl;
      return {
        id: repl.id,
        slug: repl.slug,
        title: repl.title,
        description: repl.description,
        language: repl.language,
        isPrivate: repl.isPrivate,
        url: repl.url,
        iconUrl: repl.iconUrl,
        createdAt: repl.timeCreated,
        updatedAt: repl.timeUpdated,
        files: repl.files?.map((f: any) => ({
          path: f.path,
          content: f.content,
          type: 'file' as const,
          size: f.content?.length || 0
        })) || []
      };
    } catch (error) {
      console.error("[ReplitImport] Failed to get Repl details:", error);
      return null;
    }
  }

  // ============ Import Operations ============

  /**
   * Import Repl to internal sovereign repository
   * استيراد مشروع Replit إلى المستودع الداخلي السيادي
   */
  async importRepl(
    userId: string,
    userEmail: string,
    replId: string,
    options?: {
      newName?: string;
      preserveHistory?: boolean;
    }
  ): Promise<ImportResult> {
    const errors: string[] = [];
    let filesImported = 0;

    try {
      // 1. Get Repl details with files
      const repl = await this.getReplDetails(userId, replId);
      if (!repl) {
        return {
          success: false,
          filesImported: 0,
          errors: ["Repl not found or access denied | المشروع غير موجود أو الوصول مرفوض"],
          message: "Failed to fetch Repl",
          messageAr: "فشل في جلب المشروع"
        };
      }

      // 2. Create internal repository
      const repoName = options?.newName || repl.title || repl.slug;
      const repo = await sovereignGitEngine.createRepository(
        'default',
        userId,
        userEmail,
        {
          name: repoName,
          description: repl.description || `Imported from Replit: ${repl.slug}`,
          descriptionAr: `تم الاستيراد من Replit: ${repl.slug}`,
          visibility: repl.isPrivate ? 'private' : 'public',
          language: repl.language,
          topics: ['imported-from-replit', repl.language?.toLowerCase()].filter(Boolean) as string[]
        }
      );

      // 3. Link to original Replit
      await sovereignGitEngine.linkProvider({
        repositoryId: repo.id,
        provider: 'replit',
        url: repl.url,
        externalId: repl.id,
        syncEnabled: false, // Initially disabled
        syncDirection: 'pull'
      });

      // 4. Categorize and import files with comprehensive breakdown
      const breakdown = {
        sourceCode: 0,
        configs: 0,
        envTemplates: 0,
        buildScripts: 0,
        assets: 0
      };
      
      const filesToCommit: { path: string; content: string; action: 'add' }[] = [];
      const envVarsDiscovered: string[] = [];
      
      if (repl.files && repl.files.length > 0) {
        for (const file of repl.files) {
          if (file.type !== 'file' || !file.content) continue;
          
          const category = this.categorizeFile(file.path);
          breakdown[category]++;
          
          // Handle .env files specially - convert to templates
          if (category === 'envTemplates' && file.path.includes('.env') && !file.path.includes('template') && !file.path.includes('example')) {
            const template = this.convertEnvToTemplate(file.content, file.path);
            
            // Add template version (safe to commit)
            filesToCommit.push({
              path: template.templatePath,
              content: template.templateContent,
              action: 'add'
            });
            
            // Keep track of env vars for documentation
            if (template.varsCount > 0) {
              envVarsDiscovered.push(`${file.path}: ${template.varsCount} variables`);
            }
          } else {
            // Add file as-is
            filesToCommit.push({
              path: file.path,
              content: file.content,
              action: 'add'
            });
          }
        }
        
        if (filesToCommit.length > 0) {
          // Create main import commit
          await sovereignGitEngine.createCommit({
            repositoryId: repo.id,
            branchName: 'main',
            message: `Import from Replit: ${repl.title}`,
            description: `Imported ${filesToCommit.length} files from Replit project ${repl.slug}\n\n` +
              `Breakdown:\n` +
              `- Source Code: ${breakdown.sourceCode} files\n` +
              `- Configs: ${breakdown.configs} files\n` +
              `- Env Templates: ${breakdown.envTemplates} files\n` +
              `- Build Scripts: ${breakdown.buildScripts} files\n` +
              `- Assets: ${breakdown.assets} files`,
            authorId: userId,
            authorName: 'Replit Import',
            authorEmail: userEmail,
            files: filesToCommit
          });

          filesImported = filesToCommit.length;
        }
        
        // 5. Create IMPORT_MANIFEST.md for documentation
        const manifestContent = this.generateImportManifest(repl, breakdown, envVarsDiscovered);
        await sovereignGitEngine.createCommit({
          repositoryId: repo.id,
          branchName: 'main',
          message: 'Add import manifest documentation',
          description: 'Auto-generated documentation about the imported project',
          authorId: userId,
          authorName: 'Replit Import',
          authorEmail: userEmail,
          files: [{
            path: 'IMPORT_MANIFEST.md',
            content: manifestContent,
            action: 'add'
          }]
        });
      }

      // 6. Generate Sovereign Project ID | إنشاء معرف المشروع السيادي
      const sovereignId = this.generateSovereignId(repl);
      console.log(`[ReplitImport] Generated Sovereign ID: ${sovereignId}`);

      // 7. Analyze project | تحليل المشروع
      const analysis = this.analyzeProject(repl.files || [], repl);
      console.log(`[ReplitImport] Analysis: ${analysis.languages.length} languages, ${analysis.frameworks.length} frameworks, Security=${analysis.security.score}, Portability=${analysis.portability.score}`);

      // 8. Create sovereignty status | إنشاء حالة السيادة
      const sovereignty: SovereigntyStatus = {
        isDecoupled: true,                    // مفصول عن Replit
        originalSource: 'replit',             // المصدر الأصلي
        sourceRole: 'initial-import',         // Replit مجرد مصدر أولي
        internalProjectId: sovereignId,
        importedAt: new Date().toISOString(),
        syncEnabled: false,
        independenceLevel: 'full'             // استقلال كامل
      };

      // 9. Create initial tag for import point
      const mainBranch = await sovereignGitEngine.getBranch(repo.id, 'main');
      if (mainBranch?.headCommitId) {
        await sovereignGitEngine.createTag({
          repositoryId: repo.id,
          name: 'v0.0.0-replit-import',
          message: `Initial import from Replit: ${repl.title}\n\n` +
            `Sovereign ID: ${sovereignId}\n` +
            `Total files: ${filesImported}\n` +
            `Source code: ${breakdown.sourceCode}\n` +
            `Configs: ${breakdown.configs}\n` +
            `Build scripts: ${breakdown.buildScripts}\n\n` +
            `Security Score: ${analysis.security.score}/100\n` +
            `Portability Score: ${analysis.portability.score}/100`,
          targetSha: mainBranch.headCommitId,
          taggerId: userId,
          taggerName: 'Replit Import',
          taggerEmail: userEmail,
          isRelease: false
        });
      }

      // 10. Create ANALYSIS_REPORT.md | إنشاء تقرير التحليل
      const analysisReport = this.generateAnalysisReport(repl, analysis, sovereignty, breakdown);
      await sovereignGitEngine.createCommit({
        repositoryId: repo.id,
        branchName: 'main',
        message: 'Add project analysis report',
        description: `Automated analysis: Security ${analysis.security.score}/100, Portability ${analysis.portability.score}/100`,
        authorId: userId,
        authorName: 'INFERA Analysis Engine',
        authorEmail: userEmail,
        files: [{
          path: 'ANALYSIS_REPORT.md',
          content: analysisReport,
          action: 'add'
        }]
      });

      console.log(`[ReplitImport] Successfully imported ${filesImported} files from "${repl.title}"`);
      console.log(`[ReplitImport] Sovereign ID: ${sovereignId}`);
      console.log(`[ReplitImport] Breakdown: Code=${breakdown.sourceCode}, Configs=${breakdown.configs}, Env=${breakdown.envTemplates}, Build=${breakdown.buildScripts}, Assets=${breakdown.assets}`);

      return {
        success: true,
        repositoryId: repo.id,
        internalId: repo.internalId,
        sovereignId,
        filesImported,
        errors,
        breakdown,
        analysis,
        sovereignty,
        message: `Successfully imported "${repl.title}" with ${filesImported} files. Sovereign ID: ${sovereignId}. Security: ${analysis.security.score}/100, Portability: ${analysis.portability.score}/100`,
        messageAr: `تم استيراد "${repl.title}" بنجاح: ${filesImported} ملف. معرف السيادة: ${sovereignId}. الأمان: ${analysis.security.score}/100، قابلية النقل: ${analysis.portability.score}/100`
      };

    } catch (error: any) {
      console.error("[ReplitImport] Import failed:", error);
      return {
        success: false,
        filesImported,
        errors: [error.message],
        message: "Import failed",
        messageAr: "فشل الاستيراد"
      };
    }
  }

  /**
   * Sync changes from Replit (pull)
   * مزامنة التغييرات من Replit
   */
  async pullFromReplit(userId: string, repositoryId: string): Promise<{
    success: boolean;
    filesUpdated: number;
    filesAdded: number;
    filesDeleted: number;
    message: string;
  }> {
    try {
      const repo = await sovereignGitEngine.getRepository(repositoryId);
      if (!repo || !repo.replitReplId) {
        return {
          success: false,
          filesUpdated: 0,
          filesAdded: 0,
          filesDeleted: 0,
          message: "Repository not linked to Replit"
        };
      }

      // Get current Repl state
      const repl = await this.getReplDetails(userId, repo.replitReplId);
      if (!repl) {
        return {
          success: false,
          filesUpdated: 0,
          filesAdded: 0,
          filesDeleted: 0,
          message: "Failed to fetch Repl"
        };
      }

      // Get current files in repo
      const currentFiles = await sovereignGitEngine.listFiles(repositoryId, 'main');
      const currentFileMap = new Map(currentFiles.map(f => [f.path, f]));

      // Calculate diffs
      const filesToCommit: { path: string; content: string; action: 'add' | 'modify' | 'delete' }[] = [];
      let filesUpdated = 0;
      let filesAdded = 0;
      let filesDeleted = 0;

      // Check for new/modified files
      for (const replFile of repl.files || []) {
        if (replFile.type !== 'file') continue;
        
        const existing = currentFileMap.get(replFile.path);
        if (!existing) {
          // New file
          filesToCommit.push({
            path: replFile.path,
            content: replFile.content || '',
            action: 'add'
          });
          filesAdded++;
        } else if (existing.content !== replFile.content) {
          // Modified file
          filesToCommit.push({
            path: replFile.path,
            content: replFile.content || '',
            action: 'modify'
          });
          filesUpdated++;
        }
        currentFileMap.delete(replFile.path);
      }

      // Check for deleted files
      for (const [path] of currentFileMap) {
        filesToCommit.push({
          path,
          content: '',
          action: 'delete'
        });
        filesDeleted++;
      }

      // Commit changes if any
      if (filesToCommit.length > 0) {
        await sovereignGitEngine.createCommit({
          repositoryId,
          branchName: 'main',
          message: `Sync from Replit: ${filesAdded} added, ${filesUpdated} modified, ${filesDeleted} deleted`,
          description: `Pulled latest changes from Replit`,
          authorId: userId,
          authorName: 'Replit Sync',
          authorEmail: repo.ownerEmail || 'sync@infera.io',
          files: filesToCommit
        });
      }

      return {
        success: true,
        filesUpdated,
        filesAdded,
        filesDeleted,
        message: `Synced: ${filesAdded} added, ${filesUpdated} modified, ${filesDeleted} deleted`
      };

    } catch (error: any) {
      console.error("[ReplitImport] Pull failed:", error);
      return {
        success: false,
        filesUpdated: 0,
        filesAdded: 0,
        filesDeleted: 0,
        message: error.message
      };
    }
  }

  /**
   * Get import status/history
   */
  async getImportHistory(tenantId: string): Promise<{
    imports: Array<{
      repositoryId: string;
      name: string;
      replitUrl?: string;
      importedAt: Date;
      filesCount: number;
    }>;
  }> {
    const repos = await db.select()
      .from(internalRepositories)
      .where(and(
        eq(internalRepositories.tenantId, tenantId)
      ))
      .orderBy(desc(internalRepositories.createdAt));

    const imports = repos
      .filter(r => r.replitUrl || r.replitReplId)
      .map(r => ({
        repositoryId: r.id,
        name: r.name,
        replitUrl: r.replitUrl || undefined,
        importedAt: r.createdAt!,
        filesCount: r.stats?.files || 0
      }));

    return { imports };
  }
}

export const replitImportService = new ReplitImportService();
