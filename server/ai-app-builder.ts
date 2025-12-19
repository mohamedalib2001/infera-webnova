import Anthropic from "@anthropic-ai/sdk";
import { storage } from "./storage";
import type { AiBuildSession, InsertAiBuildSession, InsertAiBuildTask, InsertAiBuildArtifact } from "@shared/schema";

const anthropic = new Anthropic();

interface BuildPlan {
  summary: string;
  summaryAr: string;
  estimatedTime: number;
  steps: Array<{
    order: number;
    type: 'database' | 'backend' | 'frontend' | 'auth' | 'styling' | 'integration';
    title: string;
    titleAr: string;
    description: string;
    descriptionAr: string;
    estimatedTime: number;
  }>;
  features: string[];
  featuresAr: string[];
  techStack: {
    database: string;
    backend: string;
    frontend: string;
    styling: string;
  };
}

interface GeneratedCode {
  schema?: string;
  backendRoutes?: string;
  frontendComponents?: string;
  styles?: string;
}

const PLANNING_SYSTEM_PROMPT = `أنت Nova Architect، مهندس برمجيات خبير متخصص في تخطيط وبناء تطبيقات الويب الكاملة.

You are Nova Architect, an expert software architect specializing in planning and building complete web applications.

Your role is to analyze user requests and create detailed build plans for full-stack applications.

When a user describes what they want to build, you should:
1. Understand the core requirements
2. Identify the main features needed
3. Plan the database schema
4. Plan the API endpoints
5. Plan the frontend components
6. Identify any authentication needs
7. Plan the styling approach

IMPORTANT: Always respond in valid JSON format with this exact structure:
{
  "appName": "Application Name",
  "appNameAr": "اسم التطبيق",
  "appType": "hr_platform|ecommerce|blog|crm|project_management|social|other",
  "summary": "Brief description of what will be built",
  "summaryAr": "وصف موجز لما سيتم بناؤه",
  "estimatedTime": 15,
  "features": ["Feature 1", "Feature 2"],
  "featuresAr": ["ميزة 1", "ميزة 2"],
  "techStack": {
    "database": "PostgreSQL with Drizzle ORM",
    "backend": "Express.js with TypeScript",
    "frontend": "React with TypeScript",
    "styling": "Tailwind CSS with Shadcn UI"
  },
  "steps": [
    {
      "order": 1,
      "type": "database",
      "title": "Database Schema Design",
      "titleAr": "تصميم قاعدة البيانات",
      "description": "Create tables for...",
      "descriptionAr": "إنشاء جداول لـ...",
      "estimatedTime": 2
    }
  ]
}

Tech Stack Guidelines:
- Database: PostgreSQL with Drizzle ORM (always)
- Backend: Express.js with TypeScript
- Frontend: React with TypeScript and Vite
- Styling: Tailwind CSS with Shadcn UI components
- State: TanStack Query for data fetching
- Routing: Wouter for frontend routing

Always plan steps in this order:
1. database - Schema design
2. backend - API routes and storage
3. auth - Authentication (if needed)
4. frontend - React components
5. styling - Tailwind and themes
6. integration - Connect frontend to backend`;

const CODE_GENERATION_SYSTEM_PROMPT = `أنت Nova Developer، مطور برمجيات خبير متخصص في كتابة كود نظيف وفعال.

You are Nova Developer, an expert software developer specializing in writing clean, efficient code.

Your task is to generate production-ready code based on the build plan.

IMPORTANT RULES:
1. Generate TypeScript code only
2. Use Drizzle ORM for database schemas
3. Use Express.js patterns for backend routes
4. Use React functional components with hooks
5. Use Tailwind CSS for styling
6. Use Shadcn UI components
7. Include bilingual support (Arabic/English) in all user-facing text
8. Always add proper TypeScript types
9. Include data-testid attributes on interactive elements
10. Follow the existing codebase patterns

When generating database schemas, use this format:
\`\`\`typescript
import { pgTable, varchar, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tableName = pgTable("table_name", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
  // ... fields
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTableNameSchema = createInsertSchema(tableName).omit({ id: true, createdAt: true });
export type InsertTableName = z.infer<typeof insertTableNameSchema>;
export type TableName = typeof tableName.$inferSelect;
\`\`\`

When generating React components, use this format:
\`\`\`tsx
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// ... imports

export function ComponentName() {
  // Component logic
  return (
    <div data-testid="component-name">
      {/* Component JSX */}
    </div>
  );
}
\`\`\``;

export async function createBuildPlan(prompt: string, userId?: string): Promise<AiBuildSession> {
  const session = await storage.createAiBuildSession({
    prompt,
    status: "planning",
    progress: 0,
    currentStep: 0,
    totalSteps: 0,
    userId: userId || null,
    startedAt: new Date(),
  });

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      system: PLANNING_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Plan a complete web application based on this request:\n\n${prompt}\n\nRespond with a valid JSON plan.`
        }
      ]
    });

    const textContent = response.content.find(block => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error("No text response from AI");
    }

    let planJson: string = textContent.text;
    const jsonMatch = planJson.match(/```json\s*([\s\S]*?)\s*```/) || 
                      planJson.match(/```\s*([\s\S]*?)\s*```/) ||
                      planJson.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      planJson = jsonMatch[1] || jsonMatch[0];
    }

    const planData = JSON.parse(planJson);

    const plan: BuildPlan = {
      summary: planData.summary || "Building your application",
      summaryAr: planData.summaryAr || "جاري بناء تطبيقك",
      estimatedTime: planData.estimatedTime || 15,
      steps: planData.steps || [],
      features: planData.features || [],
      featuresAr: planData.featuresAr || [],
      techStack: planData.techStack || {
        database: "PostgreSQL with Drizzle ORM",
        backend: "Express.js with TypeScript",
        frontend: "React with TypeScript",
        styling: "Tailwind CSS with Shadcn UI"
      }
    };

    for (let i = 0; i < plan.steps.length; i++) {
      await storage.createAiBuildTask({
        sessionId: session.id,
        stepNumber: plan.steps[i].order,
        taskType: plan.steps[i].type,
        title: plan.steps[i].title,
        titleAr: plan.steps[i].titleAr,
        description: plan.steps[i].description,
        descriptionAr: plan.steps[i].descriptionAr,
        status: "pending",
        progress: 0,
      });
    }

    const updatedSession = await storage.updateAiBuildSession(session.id, {
      appName: planData.appName || "New Application",
      appNameAr: planData.appNameAr,
      appType: planData.appType,
      plan: plan,
      status: "building",
      totalSteps: plan.steps.length,
      progress: 10,
    });

    return updatedSession || session;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error during planning";
    await storage.updateAiBuildSession(session.id, {
      status: "failed",
      errorMessage,
    });
    throw error;
  }
}

export async function executeBuildStep(
  sessionId: string, 
  taskId: string,
  onProgress?: (progress: number, message: string) => void
): Promise<string> {
  const session = await storage.getAiBuildSession(sessionId);
  const task = await storage.getAiBuildTask(taskId);
  
  if (!session || !task) {
    throw new Error("Session or task not found");
  }

  await storage.updateAiBuildTask(taskId, {
    status: "running",
    startedAt: new Date(),
    progress: 0,
  });

  await storage.updateAiBuildSession(sessionId, {
    status: "building",
    currentStep: task.stepNumber,
  });

  onProgress?.(10, `Starting ${task.title}...`);

  try {
    const previousTasks = await storage.getAiBuildTasks(sessionId);
    const completedTasks = previousTasks.filter(t => t.status === "completed");
    
    let context = `Application: ${session.appName}\n`;
    context += `Plan Summary: ${session.plan?.summary || ''}\n\n`;
    context += `Previous completed steps:\n`;
    for (const t of completedTasks) {
      if (t.output) {
        context += `\n--- ${t.title} ---\n${t.output.substring(0, 2000)}...\n`;
      }
    }

    const prompt = buildTaskPrompt(task.taskType, task.description || "", session.plan, context);

    onProgress?.(30, `Generating ${task.taskType} code...`);

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 8192,
      system: CODE_GENERATION_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const textContent = response.content.find(block => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error("No text response from AI");
    }

    const generatedCode = textContent.text;
    const tokensUsed = response.usage?.input_tokens + response.usage?.output_tokens || 0;

    onProgress?.(70, `Saving ${task.taskType} artifacts...`);

    const codeBlocks = extractCodeBlocks(generatedCode);
    for (const block of codeBlocks) {
      await storage.createAiBuildArtifact({
        sessionId,
        taskId,
        fileName: block.fileName,
        filePath: block.filePath,
        fileType: block.fileType,
        category: task.taskType,
        content: block.content,
      });
    }

    await storage.updateAiBuildTask(taskId, {
      status: "completed",
      progress: 100,
      output: generatedCode,
      outputType: "code",
      aiResponse: generatedCode,
      tokensUsed,
      completedAt: new Date(),
    });

    const allTasks = await storage.getAiBuildTasks(sessionId);
    const completedCount = allTasks.filter(t => t.status === "completed").length;
    const overallProgress = Math.round((completedCount / allTasks.length) * 100);

    let sessionUpdate: Partial<InsertAiBuildSession> = {
      progress: overallProgress,
    };

    if (task.taskType === "database") {
      sessionUpdate.generatedSchema = generatedCode;
    } else if (task.taskType === "backend") {
      sessionUpdate.generatedBackend = generatedCode;
    } else if (task.taskType === "frontend") {
      sessionUpdate.generatedFrontend = generatedCode;
    } else if (task.taskType === "styling") {
      sessionUpdate.generatedStyles = generatedCode;
    }

    if (completedCount === allTasks.length) {
      sessionUpdate.status = "completed";
      sessionUpdate.completedAt = new Date();
    }

    await storage.updateAiBuildSession(sessionId, sessionUpdate);

    onProgress?.(100, `${task.title} completed!`);

    return generatedCode;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error during execution";
    
    await storage.updateAiBuildTask(taskId, {
      status: "failed",
      errorMessage,
    });

    await storage.updateAiBuildSession(sessionId, {
      status: "failed",
      errorMessage,
    });

    throw error;
  }
}

export async function executeFullBuild(
  sessionId: string,
  onProgress?: (progress: number, message: string, step: number) => void
): Promise<AiBuildSession> {
  const tasks = await storage.getAiBuildTasks(sessionId);
  
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    onProgress?.(
      Math.round((i / tasks.length) * 100),
      `Executing: ${task.title}`,
      i + 1
    );

    await executeBuildStep(sessionId, task.id, (p, m) => {
      const overallProgress = Math.round(((i + p / 100) / tasks.length) * 100);
      onProgress?.(overallProgress, m, i + 1);
    });
  }

  const session = await storage.getAiBuildSession(sessionId);
  return session!;
}

function buildTaskPrompt(
  taskType: string, 
  description: string, 
  plan: BuildPlan | null,
  context: string
): string {
  const features = plan?.features?.join(", ") || "";
  
  switch (taskType) {
    case "database":
      return `Generate the Drizzle ORM database schema for:
${description}

Features needed: ${features}

Context:
${context}

Requirements:
1. Use PostgreSQL with Drizzle ORM
2. Include all necessary tables
3. Add proper relationships
4. Include insert schemas and types
5. Use varchar with UUID for IDs
6. Add bilingual fields where appropriate (name/nameAr, description/descriptionAr)

Generate the complete schema.ts code:`;

    case "backend":
      return `Generate Express.js API routes for:
${description}

Features needed: ${features}

Context:
${context}

Requirements:
1. Create RESTful endpoints
2. Use the storage interface pattern
3. Include proper validation with Zod
4. Handle errors gracefully
5. Return JSON responses

Generate the complete routes.ts code:`;

    case "frontend":
      return `Generate React components for:
${description}

Features needed: ${features}

Context:
${context}

Requirements:
1. Use functional components with hooks
2. Use TanStack Query for data fetching
3. Use Shadcn UI components
4. Include bilingual support (Arabic/English)
5. Add data-testid attributes
6. Use Tailwind CSS for styling

Generate the complete React component code:`;

    case "auth":
      return `Generate authentication components and logic for:
${description}

Context:
${context}

Requirements:
1. Login and registration forms
2. Session management
3. Protected routes
4. Bilingual support

Generate the auth-related code:`;

    case "styling":
      return `Generate styling and theme configuration for:
${description}

Context:
${context}

Requirements:
1. Use Tailwind CSS
2. Include dark mode support
3. Follow the design system
4. Add any necessary CSS variables

Generate the styling code:`;

    default:
      return `Generate code for:
${description}

Context:
${context}

Generate the appropriate code:`;
  }
}

function extractCodeBlocks(text: string): Array<{
  fileName: string;
  filePath: string;
  fileType: string;
  content: string;
}> {
  const blocks: Array<{
    fileName: string;
    filePath: string;
    fileType: string;
    content: string;
  }> = [];

  const codeBlockRegex = /```(\w+)?\s*\n([\s\S]*?)```/g;
  let match;
  let blockIndex = 0;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    const language = match[1] || 'txt';
    const content = match[2].trim();
    
    let fileType = language;
    let fileName = `generated_${blockIndex}`;
    let filePath = '/generated/';

    if (language === 'typescript' || language === 'ts') {
      fileType = 'ts';
      if (content.includes('pgTable')) {
        fileName = 'schema';
        filePath = 'shared/schema.ts';
      } else if (content.includes('express') || content.includes('router')) {
        fileName = 'routes';
        filePath = 'server/routes.ts';
      } else if (content.includes('storage') || content.includes('Storage')) {
        fileName = 'storage';
        filePath = 'server/storage.ts';
      }
    } else if (language === 'tsx') {
      fileType = 'tsx';
      const componentMatch = content.match(/export (?:function|const) (\w+)/);
      if (componentMatch) {
        fileName = componentMatch[1].replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
      }
      filePath = `client/src/components/${fileName}.tsx`;
    } else if (language === 'css') {
      fileType = 'css';
      fileName = 'styles';
      filePath = 'client/src/index.css';
    }

    blocks.push({
      fileName: fileName + '.' + fileType,
      filePath,
      fileType,
      content
    });

    blockIndex++;
  }

  if (blocks.length === 0 && text.trim()) {
    blocks.push({
      fileName: 'generated_code.txt',
      filePath: '/generated/generated_code.txt',
      fileType: 'txt',
      content: text
    });
  }

  return blocks;
}

export async function getSessionWithTasks(sessionId: string) {
  const session = await storage.getAiBuildSession(sessionId);
  if (!session) return null;
  
  const tasks = await storage.getAiBuildTasks(sessionId);
  const artifacts = await storage.getAiBuildArtifacts(sessionId);
  
  return {
    session,
    tasks,
    artifacts
  };
}

export async function cancelBuild(sessionId: string): Promise<void> {
  await storage.updateAiBuildSession(sessionId, {
    status: "cancelled",
  });
}
