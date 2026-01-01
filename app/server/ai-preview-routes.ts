/**
 * AI Preview Routes
 * Handles preview rendering for AI-built platforms
 */

import type { Express, Request, Response } from "express";
import { buildOrchestrator } from "./services/blueprint-compiler/build-orchestrator";
import { generateLoadingPreview, generatePlatformPreview } from "./services/ai-preview-generator";

export function registerAIPreviewRoutes(app: Express) {
  
  // AI Build Preview endpoint
  app.get("/api/platforms/ai-preview/:blueprintId", async (req: Request, res: Response) => {
    try {
      const { blueprintId } = req.params;
      
      const blueprint = buildOrchestrator.getBlueprint(blueprintId);
      const buildState = buildOrchestrator.getBuildState(blueprintId);
      
      if (!blueprint || !buildState) {
        return res.status(404).send("<h1>Build not found</h1>");
      }
      
      // Show loading preview while building
      if (buildState.stage !== 'completed') {
        res.setHeader("Content-Type", "text/html");
        return res.send(generateLoadingPreview(blueprint, buildState));
      }
      
      // Get artifacts and generate full preview
      const artifacts = buildOrchestrator.getArtifacts(blueprintId);
      if (!artifacts) {
        return res.status(404).send("<h1>Artifacts not found</h1>");
      }
      
      res.setHeader("Content-Type", "text/html");
      res.send(generatePlatformPreview(blueprint, artifacts));
      
    } catch (error) {
      console.error("[AI-Preview] Error:", error);
      res.status(500).send("<h1>Preview failed</h1>");
    }
  });
  
  console.log("[AI-Preview] Routes registered");
}
