/**
 * AI-Powered Platform Build Routes
 * Uses the real BuildOrchestrator with Anthropic AI for generating HR systems
 */

import type { Express, Request, Response } from "express";
import { buildOrchestrator } from "./services/blueprint-compiler/build-orchestrator";
import { z } from "zod";

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

  console.log("[AI-Build] Routes registered successfully");
}
