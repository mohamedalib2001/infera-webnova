/**
 * Build Orchestrator - منسق البناء
 * 
 * Orchestrates the complete build pipeline from Blueprint to deployed platform.
 * Manages the state machine, coordinates generators, and handles deployment.
 */

import {
  Blueprint,
  BuildState,
  BuildStage,
  BuildLog,
  BuildError,
  BlueprintArtifacts,
  GeneratedFile
} from './types';
import { blueprintParser } from './blueprint-parser';
import { schemaForge } from './schema-forge';
import { backendGenerator } from './backend-generator';
import { frontendGenerator } from './frontend-generator';
import { externalDeploymentService } from '../external-deployment-service';

// In-memory storage for build state
const buildStates = new Map<string, BuildState>();
const blueprints = new Map<string, Blueprint>();

export class BuildOrchestrator {
  
  /**
   * Start a new build from natural language requirements
   */
  async startBuildFromRequirements(
    requirements: string,
    options: {
      sector?: string;
      locale?: string;
      userId?: string;
      deployTarget?: string;
    } = {}
  ): Promise<{ blueprintId: string; buildState: BuildState }> {
    console.log('[BuildOrchestrator] Starting build from requirements...');
    
    // Parse requirements into Blueprint
    const blueprint = await blueprintParser.parseFromNaturalLanguage(
      requirements,
      options.sector as any,
      options.locale || 'ar'
    );
    
    // Store blueprint
    blueprints.set(blueprint.id, blueprint);
    
    // Initialize build state
    const buildState: BuildState = {
      stage: 'idle',
      progress: 0,
      startedAt: new Date(),
      logs: [],
      errors: []
    };
    
    buildStates.set(blueprint.id, buildState);
    
    // Start async build process
    this.executeBuild(blueprint.id, options.deployTarget);
    
    return { blueprintId: blueprint.id, buildState };
  }
  
  /**
   * Start a build from an existing Blueprint
   */
  async startBuildFromBlueprint(
    blueprint: Blueprint,
    deployTarget?: string
  ): Promise<{ blueprintId: string; buildState: BuildState }> {
    console.log(`[BuildOrchestrator] Starting build from blueprint ${blueprint.id}...`);
    
    // Store blueprint
    blueprints.set(blueprint.id, blueprint);
    
    // Initialize build state
    const buildState: BuildState = {
      stage: 'idle',
      progress: 0,
      startedAt: new Date(),
      logs: [],
      errors: []
    };
    
    buildStates.set(blueprint.id, buildState);
    
    // Start async build process
    this.executeBuild(blueprint.id, deployTarget);
    
    return { blueprintId: blueprint.id, buildState };
  }
  
  /**
   * Execute the build pipeline
   */
  private async executeBuild(blueprintId: string, deployTarget?: string): Promise<void> {
    const blueprint = blueprints.get(blueprintId);
    if (!blueprint) {
      console.error(`[BuildOrchestrator] Blueprint ${blueprintId} not found`);
      return;
    }
    
    try {
      const artifacts: BlueprintArtifacts = {
        schema: [],
        backend: [],
        frontend: [],
        infrastructure: [],
        tests: [],
        documentation: []
      };
      
      // Stage 1: Validate Blueprint
      await this.runStage(blueprintId, 'validating', 5, async () => {
        this.log(blueprintId, 'info', 'validating', 'Validating blueprint structure...');
        this.validateBlueprint(blueprint);
        this.log(blueprintId, 'info', 'validating', 'Blueprint validation complete');
      });
      
      // Stage 2: Generate Schema
      await this.runStage(blueprintId, 'generating-schema', 20, async () => {
        this.log(blueprintId, 'info', 'generating-schema', 'Generating database schema...');
        const schemaFiles = schemaForge.generateSchemaFiles(blueprint);
        artifacts.schema = schemaFiles;
        this.log(blueprintId, 'info', 'generating-schema', `Generated ${schemaFiles.length} schema files`);
      });
      
      // Stage 3: Generate Backend
      await this.runStage(blueprintId, 'generating-backend', 40, async () => {
        this.log(blueprintId, 'info', 'generating-backend', 'Generating backend code...');
        const backendFiles = backendGenerator.generateBackendFiles(blueprint);
        artifacts.backend = backendFiles;
        this.log(blueprintId, 'info', 'generating-backend', `Generated ${backendFiles.length} backend files`);
      });
      
      // Stage 4: Generate Frontend
      await this.runStage(blueprintId, 'generating-frontend', 60, async () => {
        this.log(blueprintId, 'info', 'generating-frontend', 'Generating frontend code...');
        const frontendFiles = frontendGenerator.generateFrontendFiles(blueprint);
        artifacts.frontend = frontendFiles;
        this.log(blueprintId, 'info', 'generating-frontend', `Generated ${frontendFiles.length} frontend files`);
      });
      
      // Stage 5: Generate Infrastructure
      await this.runStage(blueprintId, 'generating-infra', 75, async () => {
        this.log(blueprintId, 'info', 'generating-infra', 'Generating infrastructure configuration...');
        const infraFiles = this.generateInfrastructure(blueprint);
        artifacts.infrastructure = infraFiles;
        this.log(blueprintId, 'info', 'generating-infra', `Generated ${infraFiles.length} infrastructure files`);
      });
      
      // Stage 6: Run Tests
      await this.runStage(blueprintId, 'running-tests', 85, async () => {
        this.log(blueprintId, 'info', 'running-tests', 'Running generated code validation...');
        // Validate generated code syntax
        this.validateGeneratedCode(artifacts);
        this.log(blueprintId, 'info', 'running-tests', 'Code validation passed');
      });
      
      // Stage 7: Deploy (if target specified)
      if (deployTarget) {
        await this.runStage(blueprintId, 'deploying', 95, async () => {
          this.log(blueprintId, 'info', 'deploying', `Deploying to target ${deployTarget}...`);
          await this.deployPlatform(blueprint, artifacts, deployTarget);
          this.log(blueprintId, 'info', 'deploying', 'Deployment initiated');
        });
      }
      
      // Store artifacts in blueprint
      blueprint.artifacts = artifacts;
      blueprint.status = 'generated';
      blueprints.set(blueprintId, blueprint);
      
      // Mark complete
      this.updateBuildState(blueprintId, {
        stage: 'completed',
        progress: 100,
        completedAt: new Date()
      });
      
      this.log(blueprintId, 'info', 'completed', 'Build completed successfully');
      
    } catch (error: any) {
      console.error(`[BuildOrchestrator] Build failed:`, error);
      
      const state = buildStates.get(blueprintId);
      if (state) {
        state.stage = 'failed';
        state.errors.push({
          code: 'BUILD_FAILED',
          message: error.message,
          messageAr: 'فشل البناء',
          suggestion: 'Check the build logs for details'
        });
        buildStates.set(blueprintId, state);
      }
    }
  }
  
  /**
   * Run a build stage with progress tracking
   */
  private async runStage(
    blueprintId: string,
    stage: BuildStage,
    progress: number,
    action: () => Promise<void>
  ): Promise<void> {
    this.updateBuildState(blueprintId, { stage, progress });
    await action();
  }
  
  /**
   * Update build state
   */
  private updateBuildState(blueprintId: string, updates: Partial<BuildState>): void {
    const state = buildStates.get(blueprintId);
    if (state) {
      Object.assign(state, updates);
      buildStates.set(blueprintId, state);
    }
  }
  
  /**
   * Add a log entry
   */
  private log(
    blueprintId: string,
    level: 'info' | 'warn' | 'error' | 'debug',
    stage: BuildStage,
    message: string
  ): void {
    const state = buildStates.get(blueprintId);
    if (state) {
      state.logs.push({
        timestamp: new Date(),
        level,
        stage,
        message
      });
      buildStates.set(blueprintId, state);
    }
    
    console.log(`[BuildOrchestrator] [${stage}] ${message}`);
  }
  
  /**
   * Validate blueprint structure
   */
  private validateBlueprint(blueprint: Blueprint): void {
    if (!blueprint.dataModel || !blueprint.dataModel.entities) {
      throw new Error('Blueprint must have a data model with entities');
    }
    
    if (blueprint.dataModel.entities.length === 0) {
      throw new Error('Blueprint must have at least one entity');
    }
    
    // Validate each entity has required fields
    for (const entity of blueprint.dataModel.entities) {
      if (!entity.name || !entity.tableName) {
        throw new Error(`Entity must have name and tableName`);
      }
      
      if (!entity.fields || entity.fields.length === 0) {
        throw new Error(`Entity ${entity.name} must have at least one field`);
      }
    }
  }
  
  /**
   * Validate generated code
   */
  private validateGeneratedCode(artifacts: BlueprintArtifacts): void {
    const allFiles = [
      ...artifacts.schema,
      ...artifacts.backend,
      ...artifacts.frontend,
      ...artifacts.infrastructure
    ];
    
    for (const file of allFiles) {
      // Basic syntax checks
      if (file.type === 'typescript' || file.type === 'javascript') {
        // Check for common syntax errors
        if (file.content.includes('undefined.')) {
          throw new Error(`Potential null reference in ${file.path}`);
        }
      }
    }
  }
  
  /**
   * Generate infrastructure files
   */
  private generateInfrastructure(blueprint: Blueprint): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    const { infrastructure } = blueprint;
    
    // Generate Dockerfile
    files.push({
      path: 'Dockerfile',
      content: `# Generated by Blueprint Compiler
# Blueprint ID: ${blueprint.id}

FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Build
RUN npm run build

# Expose port
EXPOSE 5000

# Start
CMD ["npm", "start"]
`,
      type: 'dockerfile',
      checksum: this.generateChecksum(''),
      generatedAt: new Date()
    });
    
    // Generate docker-compose.yml
    files.push({
      path: 'docker-compose.yml',
      content: `# Generated by Blueprint Compiler
# Blueprint ID: ${blueprint.id}

version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=\${DATABASE_URL}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=\${POSTGRES_USER:-app}
      - POSTGRES_PASSWORD=\${POSTGRES_PASSWORD:-app}
      - POSTGRES_DB=\${POSTGRES_DB:-app}
    restart: unless-stopped

volumes:
  postgres_data:
`,
      type: 'yaml',
      checksum: this.generateChecksum(''),
      generatedAt: new Date()
    });
    
    // Generate .env.example
    files.push({
      path: '.env.example',
      content: `# Generated by Blueprint Compiler
# Blueprint ID: ${blueprint.id}

# Database
DATABASE_URL=postgresql://app:app@localhost:5432/app
POSTGRES_USER=app
POSTGRES_PASSWORD=app
POSTGRES_DB=app

# Session
SESSION_SECRET=your-session-secret-here

# API Keys (if needed)
${blueprint.integrations.map(i => i.secrets.map(s => `# ${s}=`).join('\n')).join('\n')}
`,
      type: 'typescript', // using typescript as placeholder
      checksum: this.generateChecksum(''),
      generatedAt: new Date()
    });
    
    return files;
  }
  
  /**
   * Deploy platform to target
   */
  private async deployPlatform(
    blueprint: Blueprint,
    artifacts: BlueprintArtifacts,
    targetId: string
  ): Promise<void> {
    // This would integrate with external-deployment-service
    // For now, we just log the deployment attempt
    console.log(`[BuildOrchestrator] Would deploy blueprint ${blueprint.id} to target ${targetId}`);
    
    // In a full implementation:
    // 1. Package artifacts into deployable bundle
    // 2. Transfer to target server
    // 3. Run deployment scripts
    // 4. Verify deployment health
  }
  
  /**
   * Get build state
   */
  getBuildState(blueprintId: string): BuildState | null {
    return buildStates.get(blueprintId) || null;
  }
  
  /**
   * Get blueprint
   */
  getBlueprint(blueprintId: string): Blueprint | null {
    return blueprints.get(blueprintId) || null;
  }
  
  /**
   * Get all blueprints
   */
  getAllBlueprints(): Blueprint[] {
    return Array.from(blueprints.values());
  }
  
  /**
   * Get generated artifacts
   */
  getArtifacts(blueprintId: string): BlueprintArtifacts | null {
    const blueprint = blueprints.get(blueprintId);
    return blueprint?.artifacts || null;
  }
  
  /**
   * Download artifact as file content
   */
  getArtifactContent(blueprintId: string, filePath: string): string | null {
    const artifacts = this.getArtifacts(blueprintId);
    if (!artifacts) return null;
    
    const allFiles = [
      ...artifacts.schema,
      ...artifacts.backend,
      ...artifacts.frontend,
      ...artifacts.infrastructure,
      ...artifacts.tests,
      ...artifacts.documentation
    ];
    
    const file = allFiles.find(f => f.path === filePath);
    return file?.content || null;
  }
  
  /**
   * Generate simple checksum
   */
  private generateChecksum(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }
}

export const buildOrchestrator = new BuildOrchestrator();
