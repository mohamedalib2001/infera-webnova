/**
 * INFERA WebNova - Context Understanding Engine
 * ===============================================
 * Deep contextual analysis for intelligent platform building
 * 
 * Features:
 * - Database schema analyzer
 * - Project structure analyzer
 * - Development history tracker
 * - Dependency analyzer
 * - Architecture pattern detector
 */

import crypto from 'crypto';
import { db } from './db';
import { sql } from 'drizzle-orm';

// ==================== DATABASE ANALYZER ====================

interface DatabaseSchema {
  tables: TableSchema[];
  relationships: Relationship[];
  indexes: IndexSchema[];
  views: ViewSchema[];
  statistics: DatabaseStatistics;
}

interface TableSchema {
  name: string;
  columns: ColumnSchema[];
  primaryKey: string[];
  foreignKeys: ForeignKeySchema[];
  indexes: string[];
  rowCount?: number;
  sizeBytes?: number;
}

interface ColumnSchema {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: any;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isUnique: boolean;
  description?: string;
}

interface ForeignKeySchema {
  columns: string[];
  referencedTable: string;
  referencedColumns: string[];
  onDelete?: string;
  onUpdate?: string;
}

interface Relationship {
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  from: { table: string; column: string };
  to: { table: string; column: string };
  name?: string;
}

interface IndexSchema {
  name: string;
  table: string;
  columns: string[];
  unique: boolean;
  type: string;
}

interface ViewSchema {
  name: string;
  definition: string;
  columns: string[];
}

interface DatabaseStatistics {
  totalTables: number;
  totalColumns: number;
  totalRelationships: number;
  totalIndexes: number;
  estimatedSize: string;
  lastAnalyzed: Date;
}

class DatabaseAnalyzer {
  private static instance: DatabaseAnalyzer;
  private cachedSchema: DatabaseSchema | null = null;
  private lastAnalysis: Date | null = null;

  private constructor() {}

  static getInstance(): DatabaseAnalyzer {
    if (!DatabaseAnalyzer.instance) {
      DatabaseAnalyzer.instance = new DatabaseAnalyzer();
    }
    return DatabaseAnalyzer.instance;
  }

  // Analyze database schema
  async analyzeSchema(): Promise<DatabaseSchema> {
    try {
      // Get all tables
      const tablesResult = await db.execute(sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `);

      const tables: TableSchema[] = [];
      const relationships: Relationship[] = [];
      const indexes: IndexSchema[] = [];

      for (const row of tablesResult.rows) {
        const tableName = row.table_name as string;
        const tableSchema = await this.analyzeTable(tableName);
        tables.push(tableSchema);

        // Extract relationships from foreign keys
        for (const fk of tableSchema.foreignKeys) {
          relationships.push({
            type: 'one-to-many',
            from: { table: tableName, column: fk.columns[0] },
            to: { table: fk.referencedTable, column: fk.referencedColumns[0] }
          });
        }

        // Get indexes
        const tableIndexes = await this.getTableIndexes(tableName);
        indexes.push(...tableIndexes);
      }

      // Get views
      const viewsResult = await db.execute(sql`
        SELECT table_name, view_definition
        FROM information_schema.views
        WHERE table_schema = 'public'
      `);

      const views: ViewSchema[] = viewsResult.rows.map((row: any) => ({
        name: row.table_name,
        definition: row.view_definition || '',
        columns: []
      }));

      const schema: DatabaseSchema = {
        tables,
        relationships,
        indexes,
        views,
        statistics: {
          totalTables: tables.length,
          totalColumns: tables.reduce((sum, t) => sum + t.columns.length, 0),
          totalRelationships: relationships.length,
          totalIndexes: indexes.length,
          estimatedSize: await this.getDatabaseSize(),
          lastAnalyzed: new Date()
        }
      };

      this.cachedSchema = schema;
      this.lastAnalysis = new Date();

      return schema;

    } catch (error: any) {
      console.error('[DB Analyzer] Error:', error.message);
      return {
        tables: [],
        relationships: [],
        indexes: [],
        views: [],
        statistics: {
          totalTables: 0,
          totalColumns: 0,
          totalRelationships: 0,
          totalIndexes: 0,
          estimatedSize: '0',
          lastAnalyzed: new Date()
        }
      };
    }
  }

  private async analyzeTable(tableName: string): Promise<TableSchema> {
    // Get columns
    const columnsResult = await db.execute(sql`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = ${tableName}
      ORDER BY ordinal_position
    `);

    // Get primary keys
    const pkResult = await db.execute(sql`
      SELECT a.attname as column_name
      FROM pg_index i
      JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
      WHERE i.indrelid = ${tableName}::regclass AND i.indisprimary
    `);

    const primaryKeys = pkResult.rows.map((r: any) => r.column_name);

    // Get foreign keys
    const fkResult = await db.execute(sql`
      SELECT
        kcu.column_name,
        ccu.table_name AS referenced_table,
        ccu.column_name AS referenced_column,
        rc.delete_rule,
        rc.update_rule
      FROM information_schema.key_column_usage kcu
      JOIN information_schema.constraint_column_usage ccu
        ON kcu.constraint_name = ccu.constraint_name
      JOIN information_schema.referential_constraints rc
        ON kcu.constraint_name = rc.constraint_name
      WHERE kcu.table_schema = 'public' AND kcu.table_name = ${tableName}
    `);

    const foreignKeys: ForeignKeySchema[] = fkResult.rows.map((r: any) => ({
      columns: [r.column_name],
      referencedTable: r.referenced_table,
      referencedColumns: [r.referenced_column],
      onDelete: r.delete_rule,
      onUpdate: r.update_rule
    }));

    const fkColumns = new Set(foreignKeys.flatMap(fk => fk.columns));

    const columns: ColumnSchema[] = columnsResult.rows.map((r: any) => ({
      name: r.column_name,
      type: r.data_type + (r.character_maximum_length ? `(${r.character_maximum_length})` : ''),
      nullable: r.is_nullable === 'YES',
      defaultValue: r.column_default,
      isPrimaryKey: primaryKeys.includes(r.column_name),
      isForeignKey: fkColumns.has(r.column_name),
      isUnique: false
    }));

    // Get row count estimate
    let rowCount = 0;
    try {
      const countResult = await db.execute(sql`
        SELECT reltuples::bigint AS estimate
        FROM pg_class
        WHERE relname = ${tableName}
      `);
      rowCount = parseInt(countResult.rows[0]?.estimate as string) || 0;
    } catch (e) {}

    return {
      name: tableName,
      columns,
      primaryKey: primaryKeys,
      foreignKeys,
      indexes: [],
      rowCount
    };
  }

  private async getTableIndexes(tableName: string): Promise<IndexSchema[]> {
    try {
      const result = await db.execute(sql`
        SELECT
          i.relname as index_name,
          a.attname as column_name,
          ix.indisunique as is_unique,
          am.amname as index_type
        FROM pg_class t
        JOIN pg_index ix ON t.oid = ix.indrelid
        JOIN pg_class i ON i.oid = ix.indexrelid
        JOIN pg_am am ON i.relam = am.oid
        JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
        WHERE t.relname = ${tableName}
        AND t.relkind = 'r'
      `);

      const indexMap = new Map<string, IndexSchema>();
      
      for (const row of result.rows as any[]) {
        const existing = indexMap.get(row.index_name);
        if (existing) {
          existing.columns.push(row.column_name);
        } else {
          indexMap.set(row.index_name, {
            name: row.index_name,
            table: tableName,
            columns: [row.column_name],
            unique: row.is_unique,
            type: row.index_type
          });
        }
      }

      return Array.from(indexMap.values());
    } catch (e) {
      return [];
    }
  }

  private async getDatabaseSize(): Promise<string> {
    try {
      const result = await db.execute(sql`
        SELECT pg_size_pretty(pg_database_size(current_database())) as size
      `);
      return (result.rows[0] as any)?.size || '0';
    } catch (e) {
      return 'Unknown';
    }
  }

  // Generate ERD data
  generateERD(): { nodes: any[]; edges: any[] } {
    if (!this.cachedSchema) {
      return { nodes: [], edges: [] };
    }

    const nodes = this.cachedSchema.tables.map(table => ({
      id: table.name,
      label: table.name,
      columns: table.columns.map(c => ({
        name: c.name,
        type: c.type,
        pk: c.isPrimaryKey,
        fk: c.isForeignKey
      }))
    }));

    const edges = this.cachedSchema.relationships.map((rel, i) => ({
      id: `edge_${i}`,
      source: rel.from.table,
      target: rel.to.table,
      sourceColumn: rel.from.column,
      targetColumn: rel.to.column,
      type: rel.type
    }));

    return { nodes, edges };
  }

  // Suggest optimizations
  suggestOptimizations(): string[] {
    if (!this.cachedSchema) return [];
    
    const suggestions: string[] = [];

    for (const table of this.cachedSchema.tables) {
      // Check for missing indexes on foreign keys
      for (const fk of table.foreignKeys) {
        const hasIndex = this.cachedSchema.indexes.some(
          idx => idx.table === table.name && idx.columns.includes(fk.columns[0])
        );
        if (!hasIndex) {
          suggestions.push(`Consider adding index on ${table.name}.${fk.columns[0]} (foreign key column)`);
        }
      }

      // Check for tables without primary key
      if (table.primaryKey.length === 0) {
        suggestions.push(`Table ${table.name} has no primary key - consider adding one`);
      }

      // Check for large tables without indexes
      if ((table.rowCount || 0) > 10000 && this.cachedSchema.indexes.filter(i => i.table === table.name).length < 2) {
        suggestions.push(`Large table ${table.name} may benefit from additional indexes`);
      }
    }

    return suggestions;
  }

  getCachedSchema(): DatabaseSchema | null {
    return this.cachedSchema;
  }
}

// ==================== PROJECT STRUCTURE ANALYZER ====================

interface ProjectStructure {
  rootPath: string;
  type: 'monorepo' | 'fullstack' | 'frontend' | 'backend' | 'library' | 'unknown';
  framework?: string;
  language: string;
  directories: DirectoryNode[];
  files: FileNode[];
  entryPoints: string[];
  config: ProjectConfig;
  dependencies: DependencyInfo;
  statistics: ProjectStatistics;
}

interface DirectoryNode {
  name: string;
  path: string;
  type: 'source' | 'config' | 'test' | 'assets' | 'build' | 'docs' | 'other';
  children: (DirectoryNode | FileNode)[];
  fileCount: number;
}

interface FileNode {
  name: string;
  path: string;
  extension: string;
  size: number;
  type: 'source' | 'config' | 'test' | 'asset' | 'documentation' | 'other';
  language?: string;
}

interface ProjectConfig {
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun' | 'unknown';
  buildTool?: string;
  testFramework?: string;
  linter?: string;
  formatter?: string;
  typescript: boolean;
  docker: boolean;
  ci: boolean;
}

interface DependencyInfo {
  total: number;
  production: number;
  development: number;
  outdated: number;
  vulnerable: number;
  byCategory: Record<string, string[]>;
}

interface ProjectStatistics {
  totalFiles: number;
  totalDirectories: number;
  totalLines: number;
  byLanguage: Record<string, number>;
  byType: Record<string, number>;
  averageFileSize: number;
  largestFiles: { path: string; size: number }[];
}

class ProjectAnalyzer {
  private static instance: ProjectAnalyzer;
  private cachedStructure: ProjectStructure | null = null;

  private constructor() {}

  static getInstance(): ProjectAnalyzer {
    if (!ProjectAnalyzer.instance) {
      ProjectAnalyzer.instance = new ProjectAnalyzer();
    }
    return ProjectAnalyzer.instance;
  }

  // Analyze project structure
  async analyzeProject(rootPath: string = '.'): Promise<ProjectStructure> {
    const fs = await import('fs');
    const path = await import('path');

    const structure: ProjectStructure = {
      rootPath,
      type: 'unknown',
      language: 'unknown',
      directories: [],
      files: [],
      entryPoints: [],
      config: await this.detectConfig(rootPath),
      dependencies: await this.analyzeDependencies(rootPath),
      statistics: {
        totalFiles: 0,
        totalDirectories: 0,
        totalLines: 0,
        byLanguage: {},
        byType: {},
        averageFileSize: 0,
        largestFiles: []
      }
    };

    // Detect project type and framework
    const detection = await this.detectProjectType(rootPath);
    structure.type = detection.type;
    structure.framework = detection.framework;
    structure.language = detection.language;

    // Scan directory structure
    const scanResult = await this.scanDirectory(rootPath, rootPath);
    structure.directories = scanResult.directories;
    structure.files = scanResult.files;

    // Calculate statistics
    structure.statistics = this.calculateStatistics(scanResult.files);

    // Detect entry points
    structure.entryPoints = this.detectEntryPoints(rootPath, structure);

    this.cachedStructure = structure;
    return structure;
  }

  private async detectProjectType(rootPath: string): Promise<{
    type: ProjectStructure['type'];
    framework?: string;
    language: string;
  }> {
    const fs = await import('fs');
    const path = await import('path');

    let type: ProjectStructure['type'] = 'unknown';
    let framework: string | undefined;
    let language = 'javascript';

    try {
      // Check package.json
      const pkgPath = path.join(rootPath, 'package.json');
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };

        // Detect framework
        if (deps['next']) { framework = 'Next.js'; type = 'fullstack'; }
        else if (deps['nuxt']) { framework = 'Nuxt'; type = 'fullstack'; }
        else if (deps['react']) { framework = 'React'; type = 'frontend'; }
        else if (deps['vue']) { framework = 'Vue'; type = 'frontend'; }
        else if (deps['express']) { framework = 'Express'; type = 'backend'; }
        else if (deps['fastify']) { framework = 'Fastify'; type = 'backend'; }
        else if (deps['nestjs']) { framework = 'NestJS'; type = 'backend'; }

        // Check for TypeScript
        if (deps['typescript']) language = 'typescript';
      }

      // Check for monorepo
      if (fs.existsSync(path.join(rootPath, 'packages')) || 
          fs.existsSync(path.join(rootPath, 'apps'))) {
        type = 'monorepo';
      }

      // Check for Python
      if (fs.existsSync(path.join(rootPath, 'requirements.txt')) ||
          fs.existsSync(path.join(rootPath, 'pyproject.toml'))) {
        language = 'python';
        if (fs.existsSync(path.join(rootPath, 'manage.py'))) framework = 'Django';
        else if (fs.existsSync(path.join(rootPath, 'app.py'))) framework = 'Flask';
      }

      // Check for Go
      if (fs.existsSync(path.join(rootPath, 'go.mod'))) {
        language = 'go';
        type = 'backend';
      }

      // Check for Rust
      if (fs.existsSync(path.join(rootPath, 'Cargo.toml'))) {
        language = 'rust';
      }

    } catch (e) {}

    return { type, framework, language };
  }

  private async detectConfig(rootPath: string): Promise<ProjectConfig> {
    const fs = await import('fs');
    const path = await import('path');

    const config: ProjectConfig = {
      packageManager: 'npm',
      typescript: false,
      docker: false,
      ci: false
    };

    try {
      // Package manager
      if (fs.existsSync(path.join(rootPath, 'yarn.lock'))) config.packageManager = 'yarn';
      else if (fs.existsSync(path.join(rootPath, 'pnpm-lock.yaml'))) config.packageManager = 'pnpm';
      else if (fs.existsSync(path.join(rootPath, 'bun.lockb'))) config.packageManager = 'bun';

      // TypeScript
      config.typescript = fs.existsSync(path.join(rootPath, 'tsconfig.json'));

      // Docker
      config.docker = fs.existsSync(path.join(rootPath, 'Dockerfile')) ||
                      fs.existsSync(path.join(rootPath, 'docker-compose.yml'));

      // CI
      config.ci = fs.existsSync(path.join(rootPath, '.github/workflows')) ||
                  fs.existsSync(path.join(rootPath, '.gitlab-ci.yml'));

      // Build tool
      if (fs.existsSync(path.join(rootPath, 'vite.config.ts'))) config.buildTool = 'Vite';
      else if (fs.existsSync(path.join(rootPath, 'webpack.config.js'))) config.buildTool = 'Webpack';
      else if (fs.existsSync(path.join(rootPath, 'esbuild.config.js'))) config.buildTool = 'esbuild';

      // Test framework
      if (fs.existsSync(path.join(rootPath, 'jest.config.js'))) config.testFramework = 'Jest';
      else if (fs.existsSync(path.join(rootPath, 'vitest.config.ts'))) config.testFramework = 'Vitest';

      // Linter
      if (fs.existsSync(path.join(rootPath, '.eslintrc.js')) ||
          fs.existsSync(path.join(rootPath, '.eslintrc.json'))) config.linter = 'ESLint';

    } catch (e) {}

    return config;
  }

  private async analyzeDependencies(rootPath: string): Promise<DependencyInfo> {
    const fs = await import('fs');
    const path = await import('path');

    const info: DependencyInfo = {
      total: 0,
      production: 0,
      development: 0,
      outdated: 0,
      vulnerable: 0,
      byCategory: {}
    };

    try {
      const pkgPath = path.join(rootPath, 'package.json');
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        
        const prodDeps = Object.keys(pkg.dependencies || {});
        const devDeps = Object.keys(pkg.devDependencies || {});

        info.production = prodDeps.length;
        info.development = devDeps.length;
        info.total = prodDeps.length + devDeps.length;

        // Categorize dependencies
        const categories: Record<string, string[]> = {
          'UI Framework': [],
          'State Management': [],
          'Testing': [],
          'Build Tools': [],
          'Database': [],
          'Authentication': [],
          'API': [],
          'Utilities': []
        };

        const allDeps = [...prodDeps, ...devDeps];
        
        for (const dep of allDeps) {
          if (['react', 'vue', 'angular', 'svelte'].includes(dep)) {
            categories['UI Framework'].push(dep);
          } else if (['redux', 'zustand', 'mobx', 'recoil'].includes(dep)) {
            categories['State Management'].push(dep);
          } else if (['jest', 'vitest', 'mocha', 'cypress'].includes(dep)) {
            categories['Testing'].push(dep);
          } else if (['webpack', 'vite', 'esbuild', 'rollup'].includes(dep)) {
            categories['Build Tools'].push(dep);
          } else if (['pg', 'mysql', 'mongodb', 'prisma', 'drizzle-orm'].includes(dep)) {
            categories['Database'].push(dep);
          } else if (['passport', 'next-auth', 'jsonwebtoken'].includes(dep)) {
            categories['Authentication'].push(dep);
          } else if (['express', 'fastify', 'axios', 'fetch'].includes(dep)) {
            categories['API'].push(dep);
          }
        }

        info.byCategory = categories;
      }
    } catch (e) {}

    return info;
  }

  private async scanDirectory(dirPath: string, rootPath: string): Promise<{
    directories: DirectoryNode[];
    files: FileNode[];
  }> {
    const fs = await import('fs');
    const path = await import('path');

    const directories: DirectoryNode[] = [];
    const files: FileNode[] = [];
    const ignoreDirs = ['node_modules', '.git', 'dist', 'build', '.next', '__pycache__'];

    try {
      const entries = fs.readdirSync(dirPath);

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry);
        const relativePath = path.relative(rootPath, fullPath);
        
        try {
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            if (!ignoreDirs.includes(entry) && !entry.startsWith('.')) {
              const subScan = await this.scanDirectory(fullPath, rootPath);
              directories.push({
                name: entry,
                path: relativePath,
                type: this.classifyDirectory(entry),
                children: [...subScan.directories, ...subScan.files],
                fileCount: subScan.files.length
              });
              files.push(...subScan.files);
            }
          } else if (stat.isFile()) {
            const ext = path.extname(entry);
            files.push({
              name: entry,
              path: relativePath,
              extension: ext,
              size: stat.size,
              type: this.classifyFile(entry, ext),
              language: this.detectLanguage(ext)
            });
          }
        } catch (e) {}
      }
    } catch (e) {}

    return { directories, files };
  }

  private classifyDirectory(name: string): DirectoryNode['type'] {
    const sourceNames = ['src', 'lib', 'app', 'pages', 'components', 'server', 'client'];
    const testNames = ['test', 'tests', '__tests__', 'spec'];
    const configNames = ['config', 'configs', '.config'];
    const assetNames = ['assets', 'public', 'static', 'images', 'styles'];
    const buildNames = ['dist', 'build', 'out', '.next'];
    const docNames = ['docs', 'documentation', 'doc'];

    if (sourceNames.includes(name)) return 'source';
    if (testNames.includes(name)) return 'test';
    if (configNames.includes(name)) return 'config';
    if (assetNames.includes(name)) return 'assets';
    if (buildNames.includes(name)) return 'build';
    if (docNames.includes(name)) return 'docs';
    return 'other';
  }

  private classifyFile(name: string, ext: string): FileNode['type'] {
    const sourceExts = ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '.java'];
    const configFiles = ['package.json', 'tsconfig.json', '.eslintrc', 'vite.config'];
    const testPatterns = ['.test.', '.spec.', '_test.'];
    const assetExts = ['.png', '.jpg', '.svg', '.css', '.scss', '.woff'];
    const docExts = ['.md', '.txt', '.rst'];

    if (testPatterns.some(p => name.includes(p))) return 'test';
    if (configFiles.some(c => name.includes(c))) return 'config';
    if (sourceExts.includes(ext)) return 'source';
    if (assetExts.includes(ext)) return 'asset';
    if (docExts.includes(ext)) return 'documentation';
    return 'other';
  }

  private detectLanguage(ext: string): string | undefined {
    const langMap: Record<string, string> = {
      '.ts': 'TypeScript', '.tsx': 'TypeScript',
      '.js': 'JavaScript', '.jsx': 'JavaScript',
      '.py': 'Python', '.go': 'Go', '.rs': 'Rust',
      '.java': 'Java', '.rb': 'Ruby', '.php': 'PHP',
      '.css': 'CSS', '.scss': 'SCSS', '.html': 'HTML'
    };
    return langMap[ext];
  }

  private calculateStatistics(files: FileNode[]): ProjectStatistics {
    const byLanguage: Record<string, number> = {};
    const byType: Record<string, number> = {};
    const fileSizes: { path: string; size: number }[] = [];
    let totalSize = 0;

    for (const file of files) {
      // By language
      if (file.language) {
        byLanguage[file.language] = (byLanguage[file.language] || 0) + 1;
      }

      // By type
      byType[file.type] = (byType[file.type] || 0) + 1;

      // Sizes
      totalSize += file.size;
      fileSizes.push({ path: file.path, size: file.size });
    }

    // Sort by size for largest files
    fileSizes.sort((a, b) => b.size - a.size);

    return {
      totalFiles: files.length,
      totalDirectories: 0, // Calculated separately
      totalLines: 0, // Would need file reading
      byLanguage,
      byType,
      averageFileSize: files.length > 0 ? Math.round(totalSize / files.length) : 0,
      largestFiles: fileSizes.slice(0, 10)
    };
  }

  private detectEntryPoints(rootPath: string, structure: ProjectStructure): string[] {
    const entryPoints: string[] = [];

    // Common entry points
    const commonEntries = [
      'src/index.ts', 'src/index.js', 'src/main.ts', 'src/main.js',
      'src/App.tsx', 'src/App.jsx', 'app/page.tsx',
      'server/index.ts', 'server/main.ts',
      'index.ts', 'index.js', 'main.ts', 'main.js',
      'app.py', 'main.py', 'manage.py',
      'main.go', 'cmd/main.go',
      'src/main.rs', 'src/lib.rs'
    ];

    for (const entry of commonEntries) {
      if (structure.files.some(f => f.path === entry)) {
        entryPoints.push(entry);
      }
    }

    return entryPoints;
  }

  getCachedStructure(): ProjectStructure | null {
    return this.cachedStructure;
  }
}

// ==================== DEVELOPMENT HISTORY TRACKER ====================

interface DevelopmentEvent {
  id: string;
  type: 'commit' | 'branch' | 'merge' | 'release' | 'deploy' | 'incident' | 'feature' | 'bugfix';
  timestamp: Date;
  author: string;
  description: string;
  descriptionAr: string;
  metadata: Record<string, any>;
  impact: 'major' | 'minor' | 'patch' | 'none';
  files?: string[];
}

interface DevelopmentTimeline {
  projectId: string;
  events: DevelopmentEvent[];
  statistics: {
    totalCommits: number;
    totalContributors: number;
    activeContributors: number;
    commitsByMonth: Record<string, number>;
    commitsByAuthor: Record<string, number>;
    averageCommitsPerDay: number;
    lastActivity: Date;
  };
  milestones: Milestone[];
}

interface Milestone {
  id: string;
  name: string;
  nameAr: string;
  type: 'release' | 'feature' | 'deadline' | 'achievement';
  date: Date;
  description: string;
  achieved: boolean;
}

class DevelopmentHistoryTracker {
  private static instance: DevelopmentHistoryTracker;
  private timelines: Map<string, DevelopmentTimeline> = new Map();

  private constructor() {}

  static getInstance(): DevelopmentHistoryTracker {
    if (!DevelopmentHistoryTracker.instance) {
      DevelopmentHistoryTracker.instance = new DevelopmentHistoryTracker();
    }
    return DevelopmentHistoryTracker.instance;
  }

  // Record event
  recordEvent(projectId: string, event: Omit<DevelopmentEvent, 'id'>): DevelopmentEvent {
    const id = `event_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const fullEvent: DevelopmentEvent = { id, ...event };

    let timeline = this.timelines.get(projectId);
    if (!timeline) {
      timeline = {
        projectId,
        events: [],
        statistics: {
          totalCommits: 0,
          totalContributors: 0,
          activeContributors: 0,
          commitsByMonth: {},
          commitsByAuthor: {},
          averageCommitsPerDay: 0,
          lastActivity: new Date()
        },
        milestones: []
      };
      this.timelines.set(projectId, timeline);
    }

    timeline.events.push(fullEvent);
    this.updateStatistics(timeline);

    return fullEvent;
  }

  // Get git history (simulated - would use actual git commands in production)
  async analyzeGitHistory(projectId: string, repoPath: string = '.'): Promise<DevelopmentTimeline> {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    let timeline = this.timelines.get(projectId);
    if (!timeline) {
      timeline = {
        projectId,
        events: [],
        statistics: {
          totalCommits: 0,
          totalContributors: 0,
          activeContributors: 0,
          commitsByMonth: {},
          commitsByAuthor: {},
          averageCommitsPerDay: 0,
          lastActivity: new Date()
        },
        milestones: []
      };
      this.timelines.set(projectId, timeline);
    }

    try {
      // Get recent commits
      const { stdout } = await execAsync(
        `cd ${repoPath} && git log --oneline -100 --format="%H|%an|%ad|%s" --date=iso`,
        { timeout: 5000 }
      );

      const commits = stdout.trim().split('\n').filter(Boolean);
      
      for (const line of commits) {
        const [hash, author, date, ...messageParts] = line.split('|');
        const message = messageParts.join('|');

        const eventType: DevelopmentEvent['type'] = 
          message.toLowerCase().includes('merge') ? 'merge' :
          message.toLowerCase().includes('fix') ? 'bugfix' :
          message.toLowerCase().includes('feat') ? 'feature' : 'commit';

        timeline.events.push({
          id: hash?.substring(0, 8) || crypto.randomBytes(4).toString('hex'),
          type: eventType,
          timestamp: new Date(date),
          author: author || 'Unknown',
          description: message || 'No message',
          descriptionAr: message || 'بدون رسالة',
          metadata: { sha: hash },
          impact: eventType === 'feature' ? 'minor' : 'patch'
        });
      }

      this.updateStatistics(timeline);

    } catch (error) {
      console.log('[History] Could not analyze git history');
    }

    return timeline;
  }

  private updateStatistics(timeline: DevelopmentTimeline): void {
    const events = timeline.events;
    const commits = events.filter(e => ['commit', 'merge', 'feature', 'bugfix'].includes(e.type));

    // Count by author
    const byAuthor: Record<string, number> = {};
    const byMonth: Record<string, number> = {};

    for (const commit of commits) {
      byAuthor[commit.author] = (byAuthor[commit.author] || 0) + 1;
      
      const month = commit.timestamp.toISOString().substring(0, 7);
      byMonth[month] = (byMonth[month] || 0) + 1;
    }

    // Calculate days since first commit
    const sortedDates = commits.map(c => c.timestamp).sort((a, b) => a.getTime() - b.getTime());
    const daysSinceFirst = sortedDates.length > 0 
      ? Math.ceil((Date.now() - sortedDates[0].getTime()) / (1000 * 60 * 60 * 24))
      : 1;

    timeline.statistics = {
      totalCommits: commits.length,
      totalContributors: Object.keys(byAuthor).length,
      activeContributors: Object.keys(byAuthor).filter(a => byAuthor[a] >= 5).length,
      commitsByMonth: byMonth,
      commitsByAuthor: byAuthor,
      averageCommitsPerDay: Math.round((commits.length / daysSinceFirst) * 10) / 10,
      lastActivity: sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : new Date()
    };
  }

  // Add milestone
  addMilestone(projectId: string, milestone: Omit<Milestone, 'id'>): Milestone {
    const id = `ms_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const fullMilestone: Milestone = { id, ...milestone };

    const timeline = this.timelines.get(projectId);
    if (timeline) {
      timeline.milestones.push(fullMilestone);
    }

    return fullMilestone;
  }

  getTimeline(projectId: string): DevelopmentTimeline | undefined {
    return this.timelines.get(projectId);
  }

  getRecentEvents(projectId: string, limit: number = 20): DevelopmentEvent[] {
    const timeline = this.timelines.get(projectId);
    if (!timeline) return [];
    
    return timeline.events
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
}

// ==================== ARCHITECTURE PATTERN DETECTOR ====================

interface ArchitecturePattern {
  name: string;
  nameAr: string;
  detected: boolean;
  confidence: number; // 0-100
  evidence: string[];
  recommendations: string[];
}

interface ArchitectureAnalysis {
  patterns: ArchitecturePattern[];
  overallArchitecture: string;
  quality: {
    modularity: number;
    cohesion: number;
    coupling: number;
    testability: number;
  };
  suggestions: string[];
}

class ArchitectureAnalyzer {
  private static instance: ArchitectureAnalyzer;

  private constructor() {}

  static getInstance(): ArchitectureAnalyzer {
    if (!ArchitectureAnalyzer.instance) {
      ArchitectureAnalyzer.instance = new ArchitectureAnalyzer();
    }
    return ArchitectureAnalyzer.instance;
  }

  // Analyze architecture patterns
  analyzePatterns(structure: ProjectStructure): ArchitectureAnalysis {
    const patterns: ArchitecturePattern[] = [];

    // Check for MVC pattern
    patterns.push(this.detectMVC(structure));

    // Check for Clean Architecture
    patterns.push(this.detectCleanArchitecture(structure));

    // Check for Microservices
    patterns.push(this.detectMicroservices(structure));

    // Check for Modular Monolith
    patterns.push(this.detectModularMonolith(structure));

    // Check for Repository Pattern
    patterns.push(this.detectRepositoryPattern(structure));

    // Determine overall architecture
    const detectedPatterns = patterns.filter(p => p.detected);
    const overallArchitecture = detectedPatterns.length > 0
      ? detectedPatterns.sort((a, b) => b.confidence - a.confidence)[0].name
      : 'Unstructured';

    return {
      patterns,
      overallArchitecture,
      quality: this.calculateQualityMetrics(structure, patterns),
      suggestions: this.generateArchitectureSuggestions(patterns, structure)
    };
  }

  private detectMVC(structure: ProjectStructure): ArchitecturePattern {
    const evidence: string[] = [];
    let confidence = 0;

    const hasModels = structure.directories.some(d => d.name === 'models' || d.name === 'entities');
    const hasViews = structure.directories.some(d => d.name === 'views' || d.name === 'templates' || d.name === 'pages');
    const hasControllers = structure.directories.some(d => d.name === 'controllers' || d.name === 'routes');

    if (hasModels) { evidence.push('Found models directory'); confidence += 30; }
    if (hasViews) { evidence.push('Found views/templates directory'); confidence += 30; }
    if (hasControllers) { evidence.push('Found controllers/routes directory'); confidence += 40; }

    return {
      name: 'MVC',
      nameAr: 'نموذج-عرض-تحكم',
      detected: confidence >= 60,
      confidence,
      evidence,
      recommendations: confidence < 60 ? ['Consider separating concerns into Models, Views, and Controllers'] : []
    };
  }

  private detectCleanArchitecture(structure: ProjectStructure): ArchitecturePattern {
    const evidence: string[] = [];
    let confidence = 0;

    const hasDomain = structure.directories.some(d => ['domain', 'entities', 'core'].includes(d.name));
    const hasUseCases = structure.directories.some(d => ['usecases', 'use-cases', 'application'].includes(d.name));
    const hasInfra = structure.directories.some(d => ['infrastructure', 'infra', 'adapters'].includes(d.name));

    if (hasDomain) { evidence.push('Found domain layer'); confidence += 35; }
    if (hasUseCases) { evidence.push('Found use cases layer'); confidence += 35; }
    if (hasInfra) { evidence.push('Found infrastructure layer'); confidence += 30; }

    return {
      name: 'Clean Architecture',
      nameAr: 'العمارة النظيفة',
      detected: confidence >= 70,
      confidence,
      evidence,
      recommendations: confidence < 70 ? ['Consider implementing dependency inversion with clear layer boundaries'] : []
    };
  }

  private detectMicroservices(structure: ProjectStructure): ArchitecturePattern {
    const evidence: string[] = [];
    let confidence = 0;

    const hasServices = structure.directories.some(d => d.name === 'services' && d.fileCount > 5);
    const hasPackages = structure.directories.some(d => d.name === 'packages');
    const hasApps = structure.directories.some(d => d.name === 'apps');
    const hasDocker = structure.config.docker;

    if (hasServices) { evidence.push('Found services directory'); confidence += 25; }
    if (hasPackages || hasApps) { evidence.push('Found monorepo structure'); confidence += 25; }
    if (hasDocker) { evidence.push('Docker configuration present'); confidence += 25; }
    if (structure.type === 'monorepo') { evidence.push('Monorepo detected'); confidence += 25; }

    return {
      name: 'Microservices',
      nameAr: 'الخدمات المصغرة',
      detected: confidence >= 50,
      confidence,
      evidence,
      recommendations: confidence < 50 ? ['Consider breaking down into smaller, deployable services'] : []
    };
  }

  private detectModularMonolith(structure: ProjectStructure): ArchitecturePattern {
    const evidence: string[] = [];
    let confidence = 0;

    const hasModules = structure.directories.some(d => d.name === 'modules' && d.fileCount > 3);
    const hasFeatures = structure.directories.some(d => d.name === 'features');
    const singleEntry = structure.entryPoints.length === 1;

    if (hasModules) { evidence.push('Found modules directory'); confidence += 40; }
    if (hasFeatures) { evidence.push('Found features directory'); confidence += 30; }
    if (singleEntry) { evidence.push('Single entry point (monolith)'); confidence += 30; }

    return {
      name: 'Modular Monolith',
      nameAr: 'المونوليث المعياري',
      detected: confidence >= 60,
      confidence,
      evidence,
      recommendations: confidence < 60 ? ['Consider organizing code into self-contained modules'] : []
    };
  }

  private detectRepositoryPattern(structure: ProjectStructure): ArchitecturePattern {
    const evidence: string[] = [];
    let confidence = 0;

    const hasRepositories = structure.files.some(f => f.name.includes('repository') || f.name.includes('Repository'));
    const hasStorage = structure.files.some(f => f.name.includes('storage') || f.name.includes('Storage'));

    if (hasRepositories) { evidence.push('Found repository files'); confidence += 60; }
    if (hasStorage) { evidence.push('Found storage abstraction'); confidence += 40; }

    return {
      name: 'Repository Pattern',
      nameAr: 'نمط المستودع',
      detected: confidence >= 50,
      confidence,
      evidence,
      recommendations: confidence < 50 ? ['Consider abstracting data access behind repository interfaces'] : []
    };
  }

  private calculateQualityMetrics(structure: ProjectStructure, patterns: ArchitecturePattern[]): {
    modularity: number;
    cohesion: number;
    coupling: number;
    testability: number;
  } {
    const hasTests = structure.directories.some(d => d.type === 'test');
    const hasModules = patterns.some(p => p.detected && p.name.includes('Modular'));
    const sourceFiles = structure.files.filter(f => f.type === 'source').length;
    const testFiles = structure.files.filter(f => f.type === 'test').length;

    return {
      modularity: hasModules ? 80 : 50,
      cohesion: patterns.filter(p => p.detected).length > 0 ? 70 : 40,
      coupling: hasModules ? 30 : 60, // Lower is better
      testability: sourceFiles > 0 ? Math.min(100, (testFiles / sourceFiles) * 100) : 0
    };
  }

  private generateArchitectureSuggestions(patterns: ArchitecturePattern[], structure: ProjectStructure): string[] {
    const suggestions: string[] = [];

    // Collect all recommendations from patterns
    for (const pattern of patterns) {
      if (!pattern.detected && pattern.confidence > 30) {
        suggestions.push(...pattern.recommendations);
      }
    }

    // General suggestions
    if (!structure.config.typescript) {
      suggestions.push('Consider adopting TypeScript for better type safety');
    }

    if (!structure.config.testFramework) {
      suggestions.push('Add a testing framework like Jest or Vitest');
    }

    if (!structure.config.linter) {
      suggestions.push('Add ESLint for code quality enforcement');
    }

    return [...new Set(suggestions)]; // Remove duplicates
  }
}

// ==================== EXPORTS ====================

export const databaseAnalyzer = DatabaseAnalyzer.getInstance();
export const projectAnalyzer = ProjectAnalyzer.getInstance();
export const historyTracker = DevelopmentHistoryTracker.getInstance();
export const architectureAnalyzer = ArchitectureAnalyzer.getInstance();

export const contextEngine = {
  database: databaseAnalyzer,
  project: projectAnalyzer,
  history: historyTracker,
  architecture: architectureAnalyzer,

  // Full context analysis
  async analyzeFullContext(projectPath: string = '.') {
    const [dbSchema, projectStructure] = await Promise.all([
      databaseAnalyzer.analyzeSchema(),
      projectAnalyzer.analyzeProject(projectPath)
    ]);

    const architecture = architectureAnalyzer.analyzePatterns(projectStructure);

    return {
      database: dbSchema,
      project: projectStructure,
      architecture,
      summary: {
        projectType: projectStructure.type,
        framework: projectStructure.framework,
        language: projectStructure.language,
        architecturePattern: architecture.overallArchitecture,
        tables: dbSchema.statistics.totalTables,
        files: projectStructure.statistics.totalFiles,
        healthScore: Math.round(
          (architecture.quality.modularity + 
           architecture.quality.cohesion + 
           (100 - architecture.quality.coupling) + 
           architecture.quality.testability) / 4
        )
      }
    };
  }
};

console.log('[Context Engine] Initialized - Database, Project, History, Architecture Analyzers');
