import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export interface BackendGenerationRequest {
  projectName: string;
  description: string;
  framework: "express" | "fastify" | "koa" | "hapi";
  database: "postgresql" | "mongodb" | "mysql" | "sqlite";
  features: string[];
  language: "typescript" | "javascript";
  authentication?: boolean;
  apiStyle?: "rest" | "graphql";
}

export interface GeneratedBackendFile {
  path: string;
  content: string;
  type: "server" | "route" | "model" | "middleware" | "config" | "schema" | "migration";
}

export interface BackendGenerationResult {
  success: boolean;
  files: GeneratedBackendFile[];
  setupCommands: string[];
  dependencies: string[];
  devDependencies: string[];
  envVariables: Record<string, string>;
  documentation: {
    ar: string;
    en: string;
  };
}

export async function generateBackend(request: BackendGenerationRequest): Promise<BackendGenerationResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log("AI key not configured, using default backend template");
    return getDefaultBackend(request);
  }
  
  const prompt = `Generate a complete backend application with the following specifications:

PROJECT: ${request.projectName}
DESCRIPTION: ${request.description}
FRAMEWORK: ${request.framework}
DATABASE: ${request.database}
LANGUAGE: ${request.language}
AUTHENTICATION: ${request.authentication ? "Yes (JWT-based)" : "No"}
API STYLE: ${request.apiStyle || "rest"}
FEATURES: ${request.features.join(", ")}

Generate a production-ready backend with:
1. Main server entry point with proper configuration
2. Database connection and models/schemas
3. API routes for all features
4. Middleware (error handling, validation, auth if needed)
5. Environment configuration
6. Type definitions (if TypeScript)

Return ONLY valid JSON in this exact format:
{
  "files": [
    {
      "path": "src/index.ts",
      "content": "// Full file content here",
      "type": "server"
    },
    {
      "path": "src/routes/api.ts",
      "content": "// Routes content",
      "type": "route"
    }
  ],
  "dependencies": ["express", "pg", "dotenv"],
  "devDependencies": ["typescript", "@types/express", "@types/node"],
  "setupCommands": ["npm install", "npm run build"],
  "envVariables": {
    "DATABASE_URL": "postgresql://user:password@localhost:5432/dbname",
    "PORT": "3000",
    "JWT_SECRET": "your-secret-key"
  },
  "documentation": {
    "ar": "توثيق كيفية تشغيل واستخدام الباك إند",
    "en": "Documentation on how to run and use the backend"
  }
}`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 16000,
      messages: [{ role: "user", content: prompt }],
    });

    const textContent = response.content.find(c => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No content generated");
    }

    let jsonStr = textContent.text.trim();
    if (jsonStr.startsWith("```json")) jsonStr = jsonStr.slice(7);
    if (jsonStr.startsWith("```")) jsonStr = jsonStr.slice(3);
    if (jsonStr.endsWith("```")) jsonStr = jsonStr.slice(0, -3);
    jsonStr = jsonStr.trim();

    const startIdx = jsonStr.indexOf("{");
    const endIdx = jsonStr.lastIndexOf("}");
    if (startIdx !== -1 && endIdx !== -1) {
      jsonStr = jsonStr.substring(startIdx, endIdx + 1);
    }

    const result = JSON.parse(jsonStr);
    
    return {
      success: true,
      files: result.files || [],
      setupCommands: result.setupCommands || ["npm install", "npm run dev"],
      dependencies: result.dependencies || [],
      devDependencies: result.devDependencies || [],
      envVariables: result.envVariables || {},
      documentation: result.documentation || {
        ar: "تم توليد الباك إند بنجاح",
        en: "Backend generated successfully"
      },
    };
  } catch (error) {
    console.error("Backend generation error:", error);
    return getDefaultBackend(request);
  }
}

function getDefaultBackend(request: BackendGenerationRequest): BackendGenerationResult {
  const isTs = request.language === "typescript";
  const ext = isTs ? "ts" : "js";
  
  const serverContent = isTs ? `
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api", require("./routes/api"));

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});

export default app;
` : `
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api", require("./routes/api"));

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});

module.exports = app;
`;

  const routesContent = isTs ? `
import { Router } from "express";

const router = Router();

// GET all items
router.get("/items", async (req, res) => {
  try {
    res.json({ items: [], message: "Items retrieved successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

// POST new item
router.post("/items", async (req, res) => {
  try {
    const item = req.body;
    res.status(201).json({ item, message: "Item created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to create item" });
  }
});

export default router;
` : `
const { Router } = require("express");

const router = Router();

// GET all items
router.get("/items", async (req, res) => {
  try {
    res.json({ items: [], message: "Items retrieved successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

// POST new item
router.post("/items", async (req, res) => {
  try {
    const item = req.body;
    res.status(201).json({ item, message: "Item created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to create item" });
  }
});

module.exports = router;
`;

  return {
    success: true,
    files: [
      { path: `src/index.${ext}`, content: serverContent.trim(), type: "server" },
      { path: `src/routes/api.${ext}`, content: routesContent.trim(), type: "route" },
      { path: ".env.example", content: `PORT=3000\nDATABASE_URL=postgresql://localhost:5432/${request.projectName}`, type: "config" },
    ],
    setupCommands: ["npm install", "npm run dev"],
    dependencies: ["express", "cors", "dotenv"],
    devDependencies: isTs ? ["typescript", "@types/express", "@types/node", "ts-node", "nodemon"] : ["nodemon"],
    envVariables: {
      PORT: "3000",
      DATABASE_URL: `postgresql://localhost:5432/${request.projectName}`,
    },
    documentation: {
      ar: `## كيفية تشغيل الباك إند\n1. قم بتثبيت الحزم: npm install\n2. قم بتعديل ملف .env\n3. شغّل الخادم: npm run dev`,
      en: `## How to run the backend\n1. Install packages: npm install\n2. Configure .env file\n3. Start server: npm run dev`,
    },
  };
}
