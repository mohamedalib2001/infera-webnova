import type { Express, Request, Response, NextFunction } from "express";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { 
  appProjects, appBuildHistory, appAiGenerations,
  insertAppProjectSchema, type AppProject, type User
} from "@shared/schema";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const anthropic = new Anthropic();

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    user?: Omit<User, 'password'>;
  }
}

const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  if (req.session?.userId) {
    return next();
  }
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    return next();
  }
  return res.status(401).json({ error: "Authentication required" });
};

const getUserId = (req: Request): string | null => {
  if (req.session?.userId) return req.session.userId;
  if (req.user) return (req.user as any).claims?.sub || (req.user as any).id;
  return null;
};

export function registerAppBuilderRoutes(app: Express) {
  
  // ========== CRUD: App Projects ==========
  
  // List all projects for current user
  app.get("/api/app-projects", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "User not found" });

      const type = req.query.type as string | undefined;
      
      let projects;
      if (type && (type === 'mobile' || type === 'desktop')) {
        projects = await db.select().from(appProjects)
          .where(and(eq(appProjects.userId, userId), eq(appProjects.type, type)))
          .orderBy(desc(appProjects.updatedAt));
      } else {
        projects = await db.select().from(appProjects)
          .where(eq(appProjects.userId, userId))
          .orderBy(desc(appProjects.updatedAt));
      }
      
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  // Get single project
  app.get("/api/app-projects/:id", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "User not found" });

      const [project] = await db.select().from(appProjects)
        .where(and(eq(appProjects.id, req.params.id), eq(appProjects.userId, userId)));
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  // Create new project
  app.post("/api/app-projects", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "User not found" });

      const validatedData = insertAppProjectSchema.parse({
        ...req.body,
        userId
      });

      const [project] = await db.insert(appProjects).values(validatedData as typeof appProjects.$inferInsert).returning();
      
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error creating project:", error);
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  // Update project
  app.patch("/api/app-projects/:id", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "User not found" });

      const [existing] = await db.select().from(appProjects)
        .where(and(eq(appProjects.id, req.params.id), eq(appProjects.userId, userId)));
      
      if (!existing) {
        return res.status(404).json({ error: "Project not found" });
      }

      const allowedFields = ['name', 'description', 'platform', 'framework', 'appIcon', 
        'primaryColor', 'features', 'windowSettings', 'status', 'buildProgress'];
      const updateData: Record<string, unknown> = { updatedAt: new Date() };
      
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }

      const [updated] = await db.update(appProjects)
        .set(updateData)
        .where(eq(appProjects.id, req.params.id))
        .returning();
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  // Delete project
  app.delete("/api/app-projects/:id", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "User not found" });

      const [existing] = await db.select().from(appProjects)
        .where(and(eq(appProjects.id, req.params.id), eq(appProjects.userId, userId)));
      
      if (!existing) {
        return res.status(404).json({ error: "Project not found" });
      }

      await db.delete(appProjects).where(eq(appProjects.id, req.params.id));
      
      res.json({ success: true, message: "Project deleted" });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // ========== AI Generation with Claude ==========

  // Generate app specifications with AI
  app.post("/api/app-projects/:id/generate", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "User not found" });

      const [project] = await db.select().from(appProjects)
        .where(and(eq(appProjects.id, req.params.id), eq(appProjects.userId, userId)));
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const { prompt, generationType } = req.body;
      if (!prompt || !generationType) {
        return res.status(400).json({ error: "prompt and generationType required" });
      }

      const startTime = Date.now();

      // Update status to generating
      await db.update(appProjects)
        .set({ status: 'generating', buildProgress: 10 })
        .where(eq(appProjects.id, project.id));

      // Build AI prompt based on type
      let systemPrompt = "";
      if (project.type === 'mobile') {
        systemPrompt = `You are an expert mobile app developer specializing in ${project.framework === 'react-native' ? 'React Native' : project.framework === 'flutter' ? 'Flutter' : 'Native'} development for ${project.platform} platforms.
        
Generate detailed, production-ready specifications and code for the app. Return JSON with this structure:
{
  "screens": [{ "name": "string", "description": "string", "components": ["string"] }],
  "dataModels": [{ "name": "string", "fields": ["string"] }],
  "apiEndpoints": [{ "method": "string", "path": "string", "description": "string" }],
  "codeFiles": [{ "path": "string", "content": "string", "language": "string" }]
}`;
      } else {
        systemPrompt = `You are an expert desktop app developer specializing in ${project.framework === 'electron' ? 'Electron.js' : project.framework === 'tauri' ? 'Tauri (Rust + Web)' : 'PyQt'} development for ${project.platform} platforms.
        
Generate detailed, production-ready specifications and code for the app. Return JSON with this structure:
{
  "screens": [{ "name": "string", "description": "string", "components": ["string"] }],
  "dataModels": [{ "name": "string", "fields": ["string"] }],
  "apiEndpoints": [{ "method": "string", "path": "string", "description": "string" }],
  "codeFiles": [{ "path": "string", "content": "string", "language": "string" }]
}`;
      }

      const userPrompt = `App Name: ${project.name}
Description: ${project.description || 'No description'}
Features: ${JSON.stringify(project.features || {})}
Primary Color: ${project.primaryColor}
${project.windowSettings ? `Window Settings: ${JSON.stringify(project.windowSettings)}` : ''}

User Request: ${prompt}

Generation Type: ${generationType}
${generationType === 'ui' ? 'Focus on generating the UI screens, layouts, and components.' : ''}
${generationType === 'code' ? 'Focus on generating the core application code and logic.' : ''}
${generationType === 'optimize' ? 'Focus on optimizing the existing code for performance.' : ''}
${generationType === 'security' ? 'Focus on security analysis and generating secure code patterns.' : ''}

Please generate detailed specifications and code.`;

      // Call Claude AI
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8192,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }]
      });

      const durationMs = Date.now() - startTime;
      const tokensUsed = response.usage?.input_tokens + response.usage?.output_tokens;

      // Parse AI response
      let generatedContent: unknown = null;
      const textContent = response.content.find(c => c.type === 'text');
      if (textContent && textContent.type === 'text') {
        try {
          // Try to extract JSON from the response
          const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            generatedContent = JSON.parse(jsonMatch[0]);
          } else {
            generatedContent = { rawText: textContent.text };
          }
        } catch {
          generatedContent = { rawText: textContent.text };
        }
      }

      // Save generation record
      await db.insert(appAiGenerations).values({
        projectId: project.id,
        userId,
        prompt,
        generationType,
        result: {
          success: true,
          generatedContent,
          suggestions: []
        },
        tokensUsed,
        modelUsed: "claude-sonnet-4-20250514",
        durationMs
      });

      // Update project with generated specs
      await db.update(appProjects)
        .set({ 
          status: 'ready',
          buildProgress: 100,
          aiGeneratedSpecs: generatedContent as any,
          updatedAt: new Date()
        })
        .where(eq(appProjects.id, project.id));

      res.json({
        success: true,
        generatedContent,
        tokensUsed,
        durationMs
      });

    } catch (error) {
      console.error("Error generating with AI:", error);
      
      // Update status to failed
      if (req.params.id) {
        await db.update(appProjects)
          .set({ status: 'failed', buildProgress: 0 })
          .where(eq(appProjects.id, req.params.id));
      }
      
      res.status(500).json({ error: "AI generation failed", details: String(error) });
    }
  });

  // ========== Build History ==========

  // Get build history for a project
  app.get("/api/app-projects/:id/builds", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "User not found" });

      const [project] = await db.select().from(appProjects)
        .where(and(eq(appProjects.id, req.params.id), eq(appProjects.userId, userId)));
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const builds = await db.select().from(appBuildHistory)
        .where(eq(appBuildHistory.projectId, project.id))
        .orderBy(desc(appBuildHistory.createdAt));
      
      res.json(builds);
    } catch (error) {
      console.error("Error fetching builds:", error);
      res.status(500).json({ error: "Failed to fetch builds" });
    }
  });

  // Start a build
  app.post("/api/app-projects/:id/build", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "User not found" });

      const [project] = await db.select().from(appProjects)
        .where(and(eq(appProjects.id, req.params.id), eq(appProjects.userId, userId)));
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const { platform, version } = req.body;
      
      // Create build record
      const [build] = await db.insert(appBuildHistory).values({
        projectId: project.id,
        platform: platform || project.platform,
        version: version || "1.0.0",
        status: "building",
        startedAt: new Date()
      }).returning();

      // Update project status
      await db.update(appProjects)
        .set({ status: 'building', buildProgress: 10 })
        .where(eq(appProjects.id, project.id));

      // Simulate build process (in real implementation, this would trigger actual build)
      // For now, we'll complete it after a short delay
      setTimeout(async () => {
        try {
          const completedAt = new Date();
          const durationSeconds = Math.round((completedAt.getTime() - build.startedAt.getTime()) / 1000);
          
          await db.update(appBuildHistory)
            .set({
              status: "success",
              completedAt,
              durationSeconds,
              logs: `Build completed successfully for ${platform || project.platform}`
            })
            .where(eq(appBuildHistory.id, build.id));

          await db.update(appProjects)
            .set({ 
              status: 'ready', 
              buildProgress: 100,
              lastBuildAt: completedAt
            })
            .where(eq(appProjects.id, project.id));
        } catch (err) {
          console.error("Build completion error:", err);
        }
      }, 5000);

      res.json({ 
        success: true, 
        build,
        message: "Build started"
      });
    } catch (error) {
      console.error("Error starting build:", error);
      res.status(500).json({ error: "Failed to start build" });
    }
  });

  // ========== AI Generation History ==========

  app.get("/api/app-projects/:id/ai-generations", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "User not found" });

      const [project] = await db.select().from(appProjects)
        .where(and(eq(appProjects.id, req.params.id), eq(appProjects.userId, userId)));
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const generations = await db.select().from(appAiGenerations)
        .where(eq(appAiGenerations.projectId, project.id))
        .orderBy(desc(appAiGenerations.createdAt));
      
      res.json(generations);
    } catch (error) {
      console.error("Error fetching generations:", error);
      res.status(500).json({ error: "Failed to fetch generations" });
    }
  });

  console.log("✓ App Builder routes registered");
}
