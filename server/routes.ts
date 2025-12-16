import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateWebsiteCode, refineWebsiteCode } from "./openai";
import { insertProjectSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // ============ Projects Routes ============
  
  // Get all projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  // Get single project
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  // Create project
  app.post("/api/projects", async (req, res) => {
    try {
      const data = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(data);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  // Update project
  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const data = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(req.params.id, data);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  // Delete project
  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteProject(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // ============ Templates Routes ============
  
  // Get all templates
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  // Get single template
  app.get("/api/templates/:id", async (req, res) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch template" });
    }
  });

  // ============ Messages Routes ============
  
  // Get messages for a project
  app.get("/api/projects/:projectId/messages", async (req, res) => {
    try {
      const messages = await storage.getMessagesByProject(req.params.projectId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Create message
  app.post("/api/messages", async (req, res) => {
    try {
      const data = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(data);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  // ============ AI Generation Route ============
  
  const generateSchema = z.object({
    prompt: z.string().min(1, "Prompt is required"),
    projectId: z.string().optional(),
    context: z.string().optional(),
  });

  app.post("/api/generate", async (req, res) => {
    try {
      const { prompt, context } = generateSchema.parse(req.body);
      
      let result;
      if (context) {
        // Parse context to extract current code
        const htmlMatch = context.match(/Current HTML: ([\s\S]*?)(?=\nCurrent CSS:|$)/);
        const cssMatch = context.match(/Current CSS: ([\s\S]*?)(?=\nCurrent JS:|$)/);
        const jsMatch = context.match(/Current JS: ([\s\S]*?)$/);
        
        const currentHtml = htmlMatch?.[1]?.trim() || "";
        const currentCss = cssMatch?.[1]?.trim() || "";
        const currentJs = jsMatch?.[1]?.trim() || "";
        
        if (currentHtml || currentCss || currentJs) {
          result = await refineWebsiteCode(prompt, currentHtml, currentCss, currentJs);
        } else {
          result = await generateWebsiteCode(prompt);
        }
      } else {
        result = await generateWebsiteCode(prompt);
      }
      
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Generation error:", error);
      res.status(500).json({ 
        error: "Failed to generate code",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  return httpServer;
}
