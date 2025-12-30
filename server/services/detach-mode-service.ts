/**
 * Detach Mode Service - خدمة وضع الاستقلال
 * 
 * Analyzes and removes all Replit dependencies,
 * generating a completely standalone deployment package.
 * 
 * تحليل وإزالة جميع تبعيات Replit وتوليد حزمة نشر مستقلة تماماً
 */

import { sovereignGitEngine } from '../lib/sovereign-git-engine';

interface ReplitDependency {
  type: 'file' | 'env' | 'config' | 'package' | 'script';
  name: string;
  path?: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  replacement?: string;
}

interface DetachAnalysis {
  repositoryId: string;
  analyzedAt: Date;
  totalDependencies: number;
  criticalCount: number;
  dependencies: ReplitDependency[];
  readyToDetach: boolean;
  replacementPlan: ReplacementPlan;
}

interface ReplacementPlan {
  filesToRemove: string[];
  filesToReplace: { path: string; content: string; reason: string }[];
  filesToAdd: { path: string; content: string; reason: string }[];
  envVarsToReplace: { key: string; defaultValue: string; description: string }[];
  packagesToRemove: string[];
  packagesToAdd: { name: string; version: string; reason: string }[];
}

interface DetachResult {
  success: boolean;
  repositoryId: string;
  detachedAt: Date;
  filesModified: number;
  filesRemoved: number;
  filesAdded: number;
  newPackageJson: any;
  deploymentConfig: DeploymentConfig;
}

interface DeploymentConfig {
  runtime: string;
  nodeVersion: string;
  buildCommand: string;
  startCommand: string;
  envVars: { key: string; required: boolean; description: string }[];
  ports: { port: number; protocol: string; description: string }[];
  dockerfileContent: string;
  dockerComposeContent: string;
  systemdServiceContent: string;
  nginxConfigContent: string;
}

const REPLIT_SPECIFIC_FILES = [
  '.replit',
  'replit.nix',
  '.replit.nix',
  '.breakpoints',
  '.upm',
  '.cache',
  '.config/configstore',
  'replit.md',
  '.replitignore'
];

const REPLIT_ENV_VARS = [
  'REPL_ID',
  'REPL_SLUG',
  'REPL_OWNER',
  'REPLIT_DB_URL',
  'REPLIT_CLUSTER',
  'REPLIT_DEPLOYMENT'
];

const REPLIT_PACKAGES = [
  '@replit/database',
  '@replit/object-storage',
  '@replit/auth',
  '@replit/vite-plugin-cartographer',
  '@replit/vite-plugin-dev-banner',
  '@replit/vite-plugin-runtime-error-modal',
  'replit-db'
];

class DetachModeService {
  
  /**
   * Analyze repository for Replit dependencies
   * تحليل المستودع للعثور على تبعيات Replit
   */
  async analyzeReplitDependencies(repositoryId: string): Promise<DetachAnalysis> {
    const dependencies: ReplitDependency[] = [];
    
    try {
      const files = await sovereignGitEngine.getRepositoryFiles(repositoryId, 'main');
      
      // Check for Replit-specific files
      for (const file of files) {
        if (REPLIT_SPECIFIC_FILES.some(rf => file.path.includes(rf) || file.path === rf)) {
          dependencies.push({
            type: 'file',
            name: file.path,
            path: file.path,
            description: `Replit configuration file - ملف تهيئة Replit`,
            severity: file.path === '.replit' ? 'critical' : 'medium',
            replacement: 'Remove file'
          });
        }
      }
      
      // Check package.json for Replit packages
      const packageJsonFile = files.find(f => f.path === 'package.json');
      if (packageJsonFile) {
        try {
          const packageJson = JSON.parse(packageJsonFile.content || '{}');
          const allDeps = {
            ...packageJson.dependencies,
            ...packageJson.devDependencies
          };
          
          for (const pkg of REPLIT_PACKAGES) {
            if (allDeps[pkg]) {
              dependencies.push({
                type: 'package',
                name: pkg,
                description: `Replit-specific package - حزمة خاصة بـ Replit`,
                severity: pkg.includes('database') ? 'critical' : 'high',
                replacement: this.getPackageReplacement(pkg)
              });
            }
          }
          
          // Check scripts for Replit-specific commands
          if (packageJson.scripts) {
            for (const [scriptName, scriptCmd] of Object.entries(packageJson.scripts)) {
              if (typeof scriptCmd === 'string' && scriptCmd.includes('replit')) {
                dependencies.push({
                  type: 'script',
                  name: scriptName,
                  description: `Script references Replit - السكريبت يشير إلى Replit`,
                  severity: 'medium',
                  replacement: 'Update script command'
                });
              }
            }
          }
        } catch (e) {
          console.error('[DetachMode] Error parsing package.json:', e);
        }
      }
      
      // Check for Replit environment variable usage
      for (const file of files) {
        if (file.type === 'tree' || !file.content) continue;
        
        for (const envVar of REPLIT_ENV_VARS) {
          if (file.content.includes(envVar)) {
            dependencies.push({
              type: 'env',
              name: envVar,
              path: file.path,
              description: `Uses Replit environment variable - يستخدم متغير بيئة Replit`,
              severity: envVar === 'REPLIT_DB_URL' ? 'critical' : 'medium',
              replacement: this.getEnvReplacement(envVar)
            });
          }
        }
        
        // Check for @replit imports
        if (file.content.includes('@replit/') || file.content.includes('replit-db')) {
          const matches = file.content.match(/@replit\/[\w-]+|replit-db/g) || [];
          for (const match of [...new Set(matches)]) {
            if (!dependencies.some(d => d.type === 'config' && d.name === match && d.path === file.path)) {
              dependencies.push({
                type: 'config',
                name: match,
                path: file.path,
                description: `Code imports Replit module - الكود يستورد وحدة Replit`,
                severity: 'high',
                replacement: 'Replace with standard alternative'
              });
            }
          }
        }
      }
      
      const criticalCount = dependencies.filter(d => d.severity === 'critical').length;
      const replacementPlan = this.generateReplacementPlan(dependencies, files);
      
      return {
        repositoryId,
        analyzedAt: new Date(),
        totalDependencies: dependencies.length,
        criticalCount,
        dependencies,
        readyToDetach: dependencies.length === 0,
        replacementPlan
      };
    } catch (error: any) {
      console.error('[DetachMode] Analysis error:', error);
      throw new Error(`Failed to analyze dependencies: ${error.message}`);
    }
  }
  
  /**
   * Generate replacement plan for all dependencies
   * توليد خطة الاستبدال لجميع التبعيات
   */
  private generateReplacementPlan(dependencies: ReplitDependency[], files: any[]): ReplacementPlan {
    const plan: ReplacementPlan = {
      filesToRemove: [],
      filesToReplace: [],
      filesToAdd: [],
      envVarsToReplace: [],
      packagesToRemove: [],
      packagesToAdd: []
    };
    
    for (const dep of dependencies) {
      switch (dep.type) {
        case 'file':
          if (REPLIT_SPECIFIC_FILES.some(rf => dep.name.includes(rf))) {
            plan.filesToRemove.push(dep.name);
          }
          break;
          
        case 'package':
          plan.packagesToRemove.push(dep.name);
          const replacement = this.getPackageReplacementDetails(dep.name);
          if (replacement) {
            plan.packagesToAdd.push(replacement);
          }
          break;
          
        case 'env':
          plan.envVarsToReplace.push({
            key: dep.name,
            defaultValue: this.getEnvDefaultValue(dep.name),
            description: this.getEnvDescription(dep.name)
          });
          break;
      }
    }
    
    // Add standard deployment files
    plan.filesToAdd.push({
      path: 'Dockerfile',
      content: this.generateDockerfile(files),
      reason: 'Standard containerization - حاوية قياسية'
    });
    
    plan.filesToAdd.push({
      path: 'docker-compose.yml',
      content: this.generateDockerCompose(),
      reason: 'Container orchestration - تنسيق الحاويات'
    });
    
    plan.filesToAdd.push({
      path: '.env.example',
      content: this.generateEnvExample(plan.envVarsToReplace),
      reason: 'Environment template - قالب المتغيرات البيئية'
    });
    
    plan.filesToAdd.push({
      path: 'deploy.sh',
      content: this.generateDeployScript(),
      reason: 'Deployment automation - أتمتة النشر'
    });
    
    return plan;
  }
  
  /**
   * Execute detach - remove all Replit dependencies
   * تنفيذ الفصل - إزالة جميع تبعيات Replit
   */
  async executeDetach(
    repositoryId: string,
    analysis: DetachAnalysis,
    author: string
  ): Promise<DetachResult> {
    const plan = analysis.replacementPlan;
    const filesToCommit: { path: string; content: string; action: 'update' | 'delete' }[] = [];
    
    // Remove Replit-specific files
    for (const filePath of plan.filesToRemove) {
      filesToCommit.push({
        path: filePath,
        content: '',
        action: 'delete'
      });
    }
    
    // Add new deployment files
    for (const file of plan.filesToAdd) {
      filesToCommit.push({
        path: file.path,
        content: file.content,
        action: 'update'
      });
    }
    
    // Update package.json
    const files = await sovereignGitEngine.getRepositoryFiles(repositoryId, 'main');
    const packageJsonFile = files.find(f => f.path === 'package.json');
    let newPackageJson = {};
    
    if (packageJsonFile?.content) {
      try {
        newPackageJson = JSON.parse(packageJsonFile.content);
        
        // Remove Replit packages
        for (const pkg of plan.packagesToRemove) {
          if ((newPackageJson as any).dependencies?.[pkg]) {
            delete (newPackageJson as any).dependencies[pkg];
          }
          if ((newPackageJson as any).devDependencies?.[pkg]) {
            delete (newPackageJson as any).devDependencies[pkg];
          }
        }
        
        // Add replacement packages
        for (const pkg of plan.packagesToAdd) {
          if (!(newPackageJson as any).dependencies) {
            (newPackageJson as any).dependencies = {};
          }
          (newPackageJson as any).dependencies[pkg.name] = pkg.version;
        }
        
        // Update scripts for production
        if (!(newPackageJson as any).scripts) {
          (newPackageJson as any).scripts = {};
        }
        (newPackageJson as any).scripts['start:prod'] = 'NODE_ENV=production node dist/index.js';
        (newPackageJson as any).scripts['build'] = 'tsc -p tsconfig.json';
        (newPackageJson as any).scripts['docker:build'] = 'docker build -t app .';
        (newPackageJson as any).scripts['docker:run'] = 'docker run -p 3000:3000 app';
        
        filesToCommit.push({
          path: 'package.json',
          content: JSON.stringify(newPackageJson, null, 2),
          action: 'update'
        });
      } catch (e) {
        console.error('[DetachMode] Error updating package.json:', e);
      }
    }
    
    // Process code files to replace Replit imports
    for (const dep of analysis.dependencies) {
      if (dep.type === 'config' && dep.path) {
        const file = files.find(f => f.path === dep.path);
        if (file?.content) {
          const updatedContent = this.replaceReplitImports(file.content, dep.name);
          if (updatedContent !== file.content) {
            const existingCommit = filesToCommit.find(f => f.path === file.path);
            if (existingCommit) {
              existingCommit.content = updatedContent;
            } else {
              filesToCommit.push({
                path: file.path,
                content: updatedContent,
                action: 'update'
              });
            }
          }
        }
      }
    }
    
    // Commit all changes
    if (filesToCommit.length > 0) {
      await sovereignGitEngine.commitFiles(
        repositoryId,
        filesToCommit,
        `Detach from Replit - Full independence | الاستقلال الكامل عن Replit`
      );
    }
    
    // Generate deployment config
    const deploymentConfig = this.generateDeploymentConfig(files, plan);
    
    console.log(`[DetachMode] Repository ${repositoryId} detached successfully`);
    
    return {
      success: true,
      repositoryId,
      detachedAt: new Date(),
      filesModified: plan.filesToReplace.length,
      filesRemoved: plan.filesToRemove.length,
      filesAdded: plan.filesToAdd.length,
      newPackageJson,
      deploymentConfig
    };
  }
  
  /**
   * Generate standalone deployment package
   * توليد حزمة النشر المستقلة
   */
  async generateDeploymentPackage(repositoryId: string): Promise<{
    dockerfile: string;
    dockerCompose: string;
    systemdService: string;
    nginxConfig: string;
    envExample: string;
    deployScript: string;
    k8sManifests: string;
  }> {
    const files = await sovereignGitEngine.getRepositoryFiles(repositoryId, 'main');
    const analysis = await this.analyzeReplitDependencies(repositoryId);
    
    return {
      dockerfile: this.generateDockerfile(files),
      dockerCompose: this.generateDockerCompose(),
      systemdService: this.generateSystemdService(),
      nginxConfig: this.generateNginxConfig(),
      envExample: this.generateEnvExample(analysis.replacementPlan.envVarsToReplace),
      deployScript: this.generateDeployScript(),
      k8sManifests: this.generateK8sManifests()
    };
  }
  
  // ============ Helper Methods ============
  
  private getPackageReplacement(pkg: string): string {
    const replacements: Record<string, string> = {
      '@replit/database': 'Use PostgreSQL or Redis',
      '@replit/object-storage': 'Use S3, GCS, or MinIO',
      '@replit/auth': 'Use Passport.js or Auth0',
      '@replit/vite-plugin-cartographer': 'Remove (development only)',
      '@replit/vite-plugin-dev-banner': 'Remove (development only)',
      '@replit/vite-plugin-runtime-error-modal': 'Remove (development only)',
      'replit-db': 'Use PostgreSQL or Redis'
    };
    return replacements[pkg] || 'Remove package';
  }
  
  private getPackageReplacementDetails(pkg: string): { name: string; version: string; reason: string } | null {
    const replacements: Record<string, { name: string; version: string; reason: string }> = {
      '@replit/database': { name: 'ioredis', version: '^5.3.0', reason: 'Redis for key-value storage' },
      'replit-db': { name: 'ioredis', version: '^5.3.0', reason: 'Redis for key-value storage' }
    };
    return replacements[pkg] || null;
  }
  
  private getEnvReplacement(envVar: string): string {
    const replacements: Record<string, string> = {
      'REPL_ID': 'APP_ID (custom identifier)',
      'REPL_SLUG': 'APP_NAME',
      'REPL_OWNER': 'APP_OWNER',
      'REPLIT_DB_URL': 'DATABASE_URL (PostgreSQL/Redis)',
      'REPLIT_CLUSTER': 'CLUSTER_NAME',
      'REPLIT_DEPLOYMENT': 'DEPLOYMENT_ENV'
    };
    return replacements[envVar] || 'Custom environment variable';
  }
  
  private getEnvDefaultValue(envVar: string): string {
    const defaults: Record<string, string> = {
      'REPL_ID': '${APP_ID}',
      'REPL_SLUG': '${APP_NAME}',
      'REPL_OWNER': '${APP_OWNER}',
      'REPLIT_DB_URL': 'redis://localhost:6379',
      'REPLIT_CLUSTER': 'default',
      'REPLIT_DEPLOYMENT': 'production'
    };
    return defaults[envVar] || '';
  }
  
  private getEnvDescription(envVar: string): string {
    const descriptions: Record<string, string> = {
      'REPL_ID': 'Unique application identifier | معرف التطبيق الفريد',
      'REPL_SLUG': 'Application name | اسم التطبيق',
      'REPL_OWNER': 'Application owner | مالك التطبيق',
      'REPLIT_DB_URL': 'Database connection URL | رابط اتصال قاعدة البيانات',
      'REPLIT_CLUSTER': 'Cluster name for deployment | اسم العنقود للنشر',
      'REPLIT_DEPLOYMENT': 'Deployment environment | بيئة النشر'
    };
    return descriptions[envVar] || 'Environment variable | متغير بيئي';
  }
  
  private replaceReplitImports(content: string, importName: string): string {
    let updated = content;
    
    // Remove @replit imports
    updated = updated.replace(
      new RegExp(`import\\s+.*from\\s+['"]${importName.replace('/', '\\/')}['"];?\\n?`, 'g'),
      '// Removed Replit import - replaced with standard alternative\n'
    );
    
    // Remove require statements
    updated = updated.replace(
      new RegExp(`(const|let|var)\\s+\\w+\\s*=\\s*require\\(['"]${importName.replace('/', '\\/')}['"]\\);?\\n?`, 'g'),
      '// Removed Replit require - replaced with standard alternative\n'
    );
    
    return updated;
  }
  
  private generateDockerfile(files: any[]): string {
    const hasTypescript = files.some(f => f.path.endsWith('.ts'));
    
    return `# Dockerfile - Generated by INFERA WebNova Detach Mode
# ملف Docker - تم توليده بواسطة وضع الاستقلال

FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

${hasTypescript ? `# Build TypeScript
RUN npm run build
` : ''}

# Production image
FROM node:20-alpine AS production

WORKDIR /app

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
${hasTypescript ? 'COPY --from=builder /app/dist ./dist' : 'COPY --from=builder /app .'}

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Run application
${hasTypescript ? 'CMD ["node", "dist/index.js"]' : 'CMD ["node", "index.js"]'}
`;
  }
  
  private generateDockerCompose(): string {
    return `# Docker Compose - Generated by INFERA WebNova
# تم توليده بواسطة INFERA WebNova

version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=\${DATABASE_URL}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    restart: unless-stopped
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=\${DB_USER:-app}
      - POSTGRES_PASSWORD=\${DB_PASSWORD:-secret}
      - POSTGRES_DB=\${DB_NAME:-appdb}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    networks:
      - app-network
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    networks:
      - app-network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:

networks:
  app-network:
    driver: bridge
`;
  }
  
  private generateSystemdService(): string {
    return `# SystemD Service - Generated by INFERA WebNova
# تم توليده بواسطة INFERA WebNova
# Save as: /etc/systemd/system/app.service

[Unit]
Description=WebNova Application
Documentation=https://github.com/your-org/your-app
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=app
Group=app
WorkingDirectory=/opt/app
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=app

# Environment
Environment=NODE_ENV=production
Environment=PORT=3000
EnvironmentFile=/opt/app/.env

# Security
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/app/data

# Resource limits
MemoryMax=1G
CPUQuota=80%

[Install]
WantedBy=multi-user.target
`;
  }
  
  private generateNginxConfig(): string {
    return `# Nginx Configuration - Generated by INFERA WebNova
# تم توليده بواسطة INFERA WebNova

events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;
    
    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    # Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    
    # Upstream
    upstream app {
        server app:3000;
        keepalive 32;
    }
    
    server {
        listen 80;
        server_name _;
        
        # Redirect to HTTPS
        return 301 https://$host$request_uri;
    }
    
    server {
        listen 443 ssl http2;
        server_name _;
        
        # SSL
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_session_timeout 1d;
        ssl_session_cache shared:SSL:50m;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
        ssl_prefer_server_ciphers off;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        
        # Static files
        location /static/ {
            alias /opt/app/static/;
            expires 30d;
            add_header Cache-Control "public, immutable";
        }
        
        # API
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
        
        # Root
        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
        
        # Health check
        location /health {
            access_log off;
            proxy_pass http://app;
        }
    }
}
`;
  }
  
  private generateEnvExample(envVars: { key: string; defaultValue: string; description: string }[]): string {
    let content = `# Environment Variables - Generated by INFERA WebNova
# المتغيرات البيئية - تم توليدها بواسطة INFERA WebNova
# Copy this file to .env and fill in the values
# انسخ هذا الملف إلى .env واملأ القيم

# Application
NODE_ENV=production
PORT=3000
APP_NAME=my-app
APP_ID=\${unique-id}
APP_SECRET=\${generate-secure-secret}

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
REDIS_URL=redis://localhost:6379

# Security
SESSION_SECRET=\${generate-secure-secret}
JWT_SECRET=\${generate-secure-secret}

`;
    
    if (envVars.length > 0) {
      content += `# Replaced Replit Variables - متغيرات Replit المستبدلة\n`;
      for (const env of envVars) {
        content += `# ${env.description}\n`;
        content += `${env.key.replace('REPLIT_', '')}=${env.defaultValue}\n\n`;
      }
    }
    
    return content;
  }
  
  private generateDeployScript(): string {
    return `#!/bin/bash
# Deploy Script - Generated by INFERA WebNova
# سكريبت النشر - تم توليده بواسطة INFERA WebNova

set -e

echo "=== INFERA WebNova Deployment ==="
echo "=== نشر INFERA WebNova ==="

# Configuration
APP_NAME="\${APP_NAME:-my-app}"
DEPLOY_DIR="/opt/\${APP_NAME}"
BACKUP_DIR="/opt/backups/\${APP_NAME}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup
echo "[1/5] Creating backup... | إنشاء نسخة احتياطية..."
mkdir -p "\${BACKUP_DIR}"
if [ -d "\${DEPLOY_DIR}" ]; then
    tar -czf "\${BACKUP_DIR}/backup_\${TIMESTAMP}.tar.gz" -C "\${DEPLOY_DIR}" .
fi

# Pull latest code
echo "[2/5] Pulling latest code... | سحب أحدث كود..."
cd "\${DEPLOY_DIR}"
git pull origin main

# Install dependencies
echo "[3/5] Installing dependencies... | تثبيت التبعيات..."
npm ci --only=production

# Build application
echo "[4/5] Building application... | بناء التطبيق..."
npm run build 2>/dev/null || echo "No build step defined"

# Restart service
echo "[5/5] Restarting service... | إعادة تشغيل الخدمة..."
if command -v systemctl &> /dev/null; then
    sudo systemctl restart \${APP_NAME}
    sudo systemctl status \${APP_NAME}
elif command -v docker &> /dev/null; then
    docker-compose down
    docker-compose up -d
fi

echo "=== Deployment Complete ==="
echo "=== تم النشر بنجاح ==="
`;
  }
  
  private generateK8sManifests(): string {
    return `# Kubernetes Manifests - Generated by INFERA WebNova
# ملفات Kubernetes - تم توليدها بواسطة INFERA WebNova

---
apiVersion: v1
kind: Namespace
metadata:
  name: app

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: app
data:
  NODE_ENV: "production"
  PORT: "3000"

---
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: app
type: Opaque
stringData:
  DATABASE_URL: "postgresql://user:password@postgres:5432/db"
  SESSION_SECRET: "your-secret-here"

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
  namespace: app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: app
  template:
    metadata:
      labels:
        app: app
    spec:
      containers:
      - name: app
        image: your-registry/app:latest
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: app-config
        - secretRef:
            name: app-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: app-service
  namespace: app
spec:
  selector:
    app: app
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  namespace: app
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - app.example.com
    secretName: app-tls
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: app-service
            port:
              number: 80

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: app-hpa
  namespace: app
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: app
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
`;
  }
  
  private generateDeploymentConfig(files: any[], plan: ReplacementPlan): DeploymentConfig {
    const hasTypescript = files.some(f => f.path.endsWith('.ts'));
    
    return {
      runtime: 'Node.js',
      nodeVersion: '20',
      buildCommand: hasTypescript ? 'npm run build' : 'npm install',
      startCommand: hasTypescript ? 'node dist/index.js' : 'node index.js',
      envVars: [
        { key: 'NODE_ENV', required: true, description: 'Environment (production/development)' },
        { key: 'PORT', required: false, description: 'Server port (default: 3000)' },
        { key: 'DATABASE_URL', required: true, description: 'PostgreSQL connection string' },
        ...plan.envVarsToReplace.map(e => ({
          key: e.key.replace('REPLIT_', ''),
          required: true,
          description: e.description
        }))
      ],
      ports: [
        { port: 3000, protocol: 'http', description: 'Application port' }
      ],
      dockerfileContent: this.generateDockerfile(files),
      dockerComposeContent: this.generateDockerCompose(),
      systemdServiceContent: this.generateSystemdService(),
      nginxConfigContent: this.generateNginxConfig()
    };
  }
}

export const detachModeService = new DetachModeService();
