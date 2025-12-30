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
  private analyzeProject(files: ReplFile[], repl: ReplInfo): ProjectAnalysis {
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
