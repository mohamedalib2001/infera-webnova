/**
 * AI-Powered Platform Build Routes
 * Uses the real BuildOrchestrator with Anthropic AI for generating HR systems
 */

import type { Express, Request, Response } from "express";
import { buildOrchestrator } from "./services/blueprint-compiler/build-orchestrator";
import { z } from "zod";
import archiver from "archiver";

const aiBuildRequestSchema = z.object({
  requirements: z.string().min(10, "Requirements must be at least 10 characters"),
  sector: z.string().optional().default("enterprise"),
  locale: z.string().optional().default("ar"),
  deployTarget: z.string().optional()
});

export function registerAIPlatformBuildRoutes(app: Express, requireAuth: any) {
  
  // Start AI-powered platform build
  app.post("/api/platforms/ai-build", requireAuth, async (req: Request, res: Response) => {
    try {
      const validated = aiBuildRequestSchema.safeParse(req.body);
      if (!validated.success) {
        return res.status(400).json({ 
          error: "Invalid request", 
          details: validated.error.flatten() 
        });
      }

      const { requirements, sector, locale, deployTarget } = validated.data;
      const userId = (req.user as any)?.id;

      console.log(`[AI-Build] Starting build for user ${userId} with requirements: ${requirements.substring(0, 100)}...`);

      const result = await buildOrchestrator.startBuildFromRequirements(requirements, {
        sector,
        locale,
        userId,
        deployTarget
      });

      res.json({
        success: true,
        blueprintId: result.blueprintId,
        buildState: result.buildState,
        message: locale === 'ar' 
          ? 'تم بدء بناء المنصة بنجاح. يتم تحليل متطلباتك الآن...'
          : 'Platform build started successfully. Analyzing your requirements...'
      });
    } catch (error) {
      console.error("[AI-Build] Error:", error);
      res.status(500).json({ 
        error: "Failed to start AI platform build",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get AI build status
  app.get("/api/platforms/ai-build/:blueprintId", requireAuth, async (req: Request, res: Response) => {
    try {
      const { blueprintId } = req.params;
      const buildState = buildOrchestrator.getBuildState(blueprintId);
      
      if (!buildState) {
        return res.status(404).json({ error: "Build not found" });
      }

      const blueprint = buildOrchestrator.getBlueprint(blueprintId);

      res.json({
        blueprintId,
        buildState,
        blueprint: blueprint ? {
          id: blueprint.id,
          name: blueprint.name,
          description: blueprint.description,
          sector: blueprint.sector,
          features: blueprint.features
        } : null
      });
    } catch (error) {
      console.error("[AI-Build] Status error:", error);
      res.status(500).json({ error: "Failed to get build status" });
    }
  });

  // Get AI build artifacts (generated files)
  app.get("/api/platforms/ai-build/:blueprintId/artifacts", requireAuth, async (req: Request, res: Response) => {
    try {
      const { blueprintId } = req.params;
      const artifacts = buildOrchestrator.getArtifacts(blueprintId);
      
      if (!artifacts) {
        return res.status(404).json({ error: "Artifacts not found" });
      }

      // Flatten all files for the frontend
      const allFiles = [
        ...artifacts.schema.map(f => ({ ...f, category: 'schema' })),
        ...artifacts.backend.map(f => ({ ...f, category: 'backend' })),
        ...artifacts.frontend.map(f => ({ ...f, category: 'frontend' })),
        ...artifacts.infrastructure.map(f => ({ ...f, category: 'infrastructure' })),
        ...artifacts.tests.map(f => ({ ...f, category: 'tests' })),
        ...artifacts.documentation.map(f => ({ ...f, category: 'documentation' }))
      ];

      res.json({
        blueprintId,
        files: allFiles,
        counts: {
          schema: artifacts.schema.length,
          backend: artifacts.backend.length,
          frontend: artifacts.frontend.length,
          infrastructure: artifacts.infrastructure.length,
          tests: artifacts.tests.length,
          documentation: artifacts.documentation.length,
          total: allFiles.length
        }
      });
    } catch (error) {
      console.error("[AI-Build] Artifacts error:", error);
      res.status(500).json({ error: "Failed to get artifacts" });
    }
  });

  // Download platform as deployable ZIP file
  app.get("/api/platforms/ai-build/:blueprintId/download", requireAuth, async (req: Request, res: Response) => {
    try {
      const { blueprintId } = req.params;
      const artifacts = buildOrchestrator.getArtifacts(blueprintId);
      const blueprint = buildOrchestrator.getBlueprint(blueprintId);
      
      if (!artifacts) {
        return res.status(404).json({ error: "Artifacts not found. Please build a platform first." });
      }

      // Get platform name for the ZIP file
      const platformName = blueprint?.name?.replace(/\s+/g, '-').toLowerCase() || `platform-${blueprintId}`;
      
      // Set response headers for ZIP download
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${platformName}.zip"`);
      
      // Create archive
      const archive = archiver('zip', { zlib: { level: 9 } });
      
      // Handle archive errors
      archive.on('error', (err) => {
        console.error('[AI-Build] Archive error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to create ZIP archive' });
        }
      });
      
      // Pipe archive to response
      archive.pipe(res);
      
      // Add all generated files to the archive
      const allFiles = [
        ...artifacts.schema,
        ...artifacts.backend,
        ...artifacts.frontend,
        ...artifacts.infrastructure,
        ...artifacts.tests,
        ...artifacts.documentation
      ];
      
      for (const file of allFiles) {
        archive.append(file.content, { name: file.path });
      }
      
      // Generate package.json if not already present
      const hasPackageJson = allFiles.some(f => f.path === 'package.json');
      if (!hasPackageJson) {
        const packageJson = {
          name: platformName,
          version: "1.0.0",
          description: blueprint?.description || "AI-Generated Platform by INFERA WebNova",
          scripts: {
            dev: "tsx server/index.ts",
            build: "tsc && vite build",
            start: "node dist/server/index.js",
            "db:push": "drizzle-kit push",
            "db:studio": "drizzle-kit studio"
          },
          dependencies: {
            "express": "^4.18.2",
            "drizzle-orm": "^0.29.3",
            "postgres": "^3.4.3",
            "zod": "^3.22.4",
            "react": "^18.2.0",
            "react-dom": "^18.2.0",
            "@tanstack/react-query": "^5.17.0"
          },
          devDependencies: {
            "typescript": "^5.3.3",
            "tsx": "^4.7.0",
            "vite": "^5.0.10",
            "@vitejs/plugin-react": "^4.2.1",
            "drizzle-kit": "^0.20.10",
            "@types/node": "^20.10.0",
            "@types/express": "^4.17.21"
          }
        };
        archive.append(JSON.stringify(packageJson, null, 2), { name: 'package.json' });
      }
      
      // Generate README.md
      const readme = `# ${blueprint?.name || 'AI-Generated Platform'}

## Description
${blueprint?.description || 'This platform was generated by INFERA WebNova AI.'}

## Generated by INFERA WebNova
This is a fully deployable platform generated automatically by AI.

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Installation

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Set up your database:
\`\`\`bash
# Create a .env file with your DATABASE_URL
echo "DATABASE_URL=postgresql://user:password@localhost:5432/mydb" > .env
\`\`\`

3. Push the database schema:
\`\`\`bash
npm run db:push
\`\`\`

4. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

## Project Structure
- \`/shared\` - Shared types and database schema
- \`/server\` - Backend API (Express.js)
- \`/client\` - Frontend (React + Vite)

## Features
${blueprint?.features?.map((f: any) => `- ${f.name}`).join('\n') || '- AI-Generated features'}

## License
Generated by INFERA WebNova - All rights reserved.
`;
      archive.append(readme, { name: 'README.md' });
      
      // Generate .env.example
      const envExample = `# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mydb

# Session
SESSION_SECRET=your-session-secret-here

# Port
PORT=5000
`;
      archive.append(envExample, { name: '.env.example' });
      
      // Generate Dockerfile
      const dockerfile = `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
`;
      archive.append(dockerfile, { name: 'Dockerfile' });
      
      // Generate docker-compose.yml
      const dockerCompose = `version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/platform
      - SESSION_SECRET=change-this-in-production
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=platform
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
`;
      archive.append(dockerCompose, { name: 'docker-compose.yml' });
      
      // Finalize the archive
      await archive.finalize();
      
      console.log(`[AI-Build] ZIP download completed for ${platformName}`);
    } catch (error) {
      console.error("[AI-Build] Download error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to create download" });
      }
    }
  });

  console.log("[AI-Build] Routes registered successfully");
}
