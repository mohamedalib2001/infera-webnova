import type { Express, Request, Response } from "express";
import { z } from "zod";

// ==================== نظام تكامل النشر ====================
// Deployment Integration API for INFERA WebNova
// Supports: Vercel, Netlify, GitHub, Railway

// Deployment provider types
type DeploymentProvider = "vercel" | "netlify" | "github" | "railway";

// Environment variable schema
const envVarSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
  target: z.enum(["production", "preview", "development"]).optional(),
});

// Deployment request schema
const deploymentRequestSchema = z.object({
  provider: z.enum(["vercel", "netlify", "github", "railway"]),
  projectName: z.string().min(1),
  framework: z.enum(["nextjs", "react", "vue", "svelte", "static", "nodejs", "python"]).optional(),
  buildCommand: z.string().optional(),
  outputDirectory: z.string().optional(),
  installCommand: z.string().optional(),
  envVars: z.array(envVarSchema).optional(),
  files: z.record(z.string()).optional(), // filename -> content
  gitRepo: z.string().optional(),
  gitBranch: z.string().default("main"),
});

// GitHub repository schema
const githubRepoSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  isPrivate: z.boolean().default(false),
  autoInit: z.boolean().default(true),
});

// GitHub push schema
const githubPushSchema = z.object({
  repoName: z.string().min(1),
  branch: z.string().default("main"),
  message: z.string().min(1),
  files: z.record(z.string()), // path -> content
});

// Provider API wrappers
class VercelAPI {
  private token: string;
  private baseUrl = "https://api.vercel.com";
  
  constructor(token: string) {
    this.token = token;
  }
  
  private async request(path: string, options: RequestInit = {}): Promise<any> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        "Authorization": `Bearer ${this.token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `Vercel API error: ${response.status}`);
    }
    
    return response.json();
  }
  
  async createProject(name: string, framework?: string): Promise<any> {
    return this.request("/v10/projects", {
      method: "POST",
      body: JSON.stringify({ name, framework }),
    });
  }
  
  async deploy(projectId: string, files: Record<string, string>): Promise<any> {
    const fileEntries = Object.entries(files).map(([file, data]) => ({
      file,
      data,
    }));
    
    return this.request("/v13/deployments", {
      method: "POST",
      body: JSON.stringify({
        name: projectId,
        files: fileEntries,
        projectSettings: {
          framework: null,
        },
      }),
    });
  }
  
  async getDeployment(deploymentId: string): Promise<any> {
    return this.request(`/v13/deployments/${deploymentId}`);
  }
  
  async setEnvVars(projectId: string, envVars: Array<{ key: string; value: string; target?: string[] }>): Promise<void> {
    for (const env of envVars) {
      await this.request(`/v10/projects/${projectId}/env`, {
        method: "POST",
        body: JSON.stringify({
          key: env.key,
          value: env.value,
          target: env.target || ["production", "preview", "development"],
          type: "encrypted",
        }),
      });
    }
  }
}

class NetlifyAPI {
  private token: string;
  private baseUrl = "https://api.netlify.com/api/v1";
  
  constructor(token: string) {
    this.token = token;
  }
  
  private async request(path: string, options: RequestInit = {}): Promise<any> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        "Authorization": `Bearer ${this.token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Netlify API error: ${response.status}`);
    }
    
    return response.json();
  }
  
  async createSite(name: string): Promise<any> {
    return this.request("/sites", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  }
  
  async deployFiles(siteId: string, files: Record<string, string>): Promise<any> {
    // Calculate file hashes
    const fileDigests: Record<string, string> = {};
    for (const [path, content] of Object.entries(files)) {
      const hash = await this.sha1(content);
      fileDigests[`/${path}`] = hash;
    }
    
    // Create deploy
    const deploy = await this.request(`/sites/${siteId}/deploys`, {
      method: "POST",
      body: JSON.stringify({
        files: fileDigests,
      }),
    });
    
    // Upload required files
    for (const [path, content] of Object.entries(files)) {
      const hash = await this.sha1(content);
      if (deploy.required?.includes(hash)) {
        await fetch(`${this.baseUrl}/deploys/${deploy.id}/files/${encodeURIComponent(`/${path}`)}`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${this.token}`,
            "Content-Type": "application/octet-stream",
          },
          body: content,
        });
      }
    }
    
    return deploy;
  }
  
  private async sha1(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  }
  
  async setEnvVars(siteId: string, envVars: Array<{ key: string; value: string }>): Promise<void> {
    for (const env of envVars) {
      await this.request(`/sites/${siteId}/env/${env.key}`, {
        method: "PATCH",
        body: JSON.stringify({
          values: [{ value: env.value, context: "all" }],
        }),
      });
    }
  }
}

class GitHubAPI {
  private token: string;
  private baseUrl = "https://api.github.com";
  
  constructor(token: string) {
    this.token = token;
  }
  
  private async request(path: string, options: RequestInit = {}): Promise<any> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        "Authorization": `Bearer ${this.token}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `GitHub API error: ${response.status}`);
    }
    
    return response.json();
  }
  
  async getUser(): Promise<any> {
    return this.request("/user");
  }
  
  async createRepo(name: string, description?: string, isPrivate: boolean = false, autoInit: boolean = true): Promise<any> {
    return this.request("/user/repos", {
      method: "POST",
      body: JSON.stringify({
        name,
        description,
        private: isPrivate,
        auto_init: autoInit,
      }),
    });
  }
  
  async pushFiles(owner: string, repo: string, branch: string, message: string, files: Record<string, string>): Promise<any> {
    // Get latest commit
    const ref = await this.request(`/repos/${owner}/${repo}/git/ref/heads/${branch}`);
    const latestCommit = await this.request(`/repos/${owner}/${repo}/git/commits/${ref.object.sha}`);
    
    // Create blobs for each file
    const blobs = await Promise.all(
      Object.entries(files).map(async ([path, content]) => {
        const blob = await this.request(`/repos/${owner}/${repo}/git/blobs`, {
          method: "POST",
          body: JSON.stringify({
            content: Buffer.from(content).toString("base64"),
            encoding: "base64",
          }),
        });
        return { path, sha: blob.sha };
      })
    );
    
    // Create tree
    const tree = await this.request(`/repos/${owner}/${repo}/git/trees`, {
      method: "POST",
      body: JSON.stringify({
        base_tree: latestCommit.tree.sha,
        tree: blobs.map(b => ({
          path: b.path,
          mode: "100644",
          type: "blob",
          sha: b.sha,
        })),
      }),
    });
    
    // Create commit
    const commit = await this.request(`/repos/${owner}/${repo}/git/commits`, {
      method: "POST",
      body: JSON.stringify({
        message,
        tree: tree.sha,
        parents: [latestCommit.sha],
      }),
    });
    
    // Update reference
    await this.request(`/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
      method: "PATCH",
      body: JSON.stringify({
        sha: commit.sha,
      }),
    });
    
    return commit;
  }
  
  async getRepos(): Promise<any[]> {
    return this.request("/user/repos?per_page=100&sort=updated");
  }
}

// Deployment status tracking
interface DeploymentStatus {
  id: string;
  provider: DeploymentProvider;
  projectName: string;
  status: "pending" | "building" | "ready" | "error";
  url?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const deployments: Map<string, DeploymentStatus> = new Map();

// Register deployment routes
export function registerDeploymentRoutes(app: Express): void {
  
  // ==================== حالة خدمات النشر ====================
  // Get deployment services status
  app.get("/api/deployment/status", async (req: Request, res: Response) => {
    try {
      const providers: Record<string, { available: boolean; configured: boolean }> = {};
      
      // Check each provider's configuration
      providers.vercel = {
        available: true,
        configured: !!process.env.VERCEL_TOKEN,
      };
      
      providers.netlify = {
        available: true,
        configured: !!process.env.NETLIFY_TOKEN,
      };
      
      providers.github = {
        available: true,
        configured: !!process.env.GITHUB_TOKEN,
      };
      
      providers.railway = {
        available: true,
        configured: !!process.env.RAILWAY_TOKEN,
      };
      
      res.json({
        status: "operational",
        statusAr: "يعمل",
        providers,
        activeDeployments: deployments.size,
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to get deployment status",
        errorAr: "فشل في الحصول على حالة النشر",
      });
    }
  });
  
  // ==================== نشر المشروع ====================
  // Deploy project
  app.post("/api/deployment/deploy", async (req: Request, res: Response) => {
    try {
      const data = deploymentRequestSchema.parse(req.body);
      
      const deploymentId = `deploy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create deployment status
      const status: DeploymentStatus = {
        id: deploymentId,
        provider: data.provider,
        projectName: data.projectName,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      deployments.set(deploymentId, status);
      
      // Get provider token
      const tokenMap: Record<DeploymentProvider, string | undefined> = {
        vercel: process.env.VERCEL_TOKEN,
        netlify: process.env.NETLIFY_TOKEN,
        github: process.env.GITHUB_TOKEN,
        railway: process.env.RAILWAY_TOKEN,
      };
      
      const token = tokenMap[data.provider];
      if (!token) {
        status.status = "error";
        status.error = `${data.provider} API token not configured`;
        status.updatedAt = new Date();
        
        return res.status(400).json({
          success: false,
          error: `${data.provider} API token not configured`,
          errorAr: `لم يتم تكوين مفتاح ${data.provider}`,
          deploymentId,
        });
      }
      
      // Start deployment asynchronously
      res.json({
        success: true,
        message: "Deployment started",
        messageAr: "بدأ النشر",
        deploymentId,
        status: status.status,
      });
      
      // Process deployment in background
      processDeployment(deploymentId, data, token).catch(error => {
        console.error(`[Deployment] Error for ${deploymentId}:`, error);
        status.status = "error";
        status.error = error.message;
        status.updatedAt = new Date();
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: error.errors.map(e => e.message).join(", "),
        });
      }
      console.error("[Deployment] Error:", error);
      res.status(500).json({
        success: false,
        error: "Deployment failed",
        errorAr: "فشل النشر",
      });
    }
  });
  
  // ==================== حالة النشر ====================
  // Get deployment status
  app.get("/api/deployment/:deploymentId", async (req: Request, res: Response) => {
    try {
      const { deploymentId } = req.params;
      const status = deployments.get(deploymentId);
      
      if (!status) {
        return res.status(404).json({
          error: "Deployment not found",
          errorAr: "لم يتم العثور على النشر",
        });
      }
      
      res.json(status);
    } catch (error) {
      res.status(500).json({
        error: "Failed to get deployment status",
      });
    }
  });
  
  // ==================== إنشاء مستودع GitHub ====================
  // Create GitHub repository
  app.post("/api/deployment/github/repo", async (req: Request, res: Response) => {
    try {
      const data = githubRepoSchema.parse(req.body);
      
      const token = process.env.GITHUB_TOKEN;
      if (!token) {
        return res.status(400).json({
          success: false,
          error: "GitHub token not configured",
          errorAr: "لم يتم تكوين مفتاح GitHub",
        });
      }
      
      const github = new GitHubAPI(token);
      const repo = await github.createRepo(data.name, data.description, data.isPrivate, data.autoInit);
      
      res.json({
        success: true,
        repo: {
          id: repo.id,
          name: repo.name,
          fullName: repo.full_name,
          url: repo.html_url,
          cloneUrl: repo.clone_url,
          private: repo.private,
        },
      });
    } catch (error: any) {
      console.error("[GitHub] Create repo error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to create repository",
        errorAr: "فشل إنشاء المستودع",
      });
    }
  });
  
  // ==================== رفع الملفات إلى GitHub ====================
  // Push files to GitHub
  app.post("/api/deployment/github/push", async (req: Request, res: Response) => {
    try {
      const data = githubPushSchema.parse(req.body);
      
      const token = process.env.GITHUB_TOKEN;
      if (!token) {
        return res.status(400).json({
          success: false,
          error: "GitHub token not configured",
          errorAr: "لم يتم تكوين مفتاح GitHub",
        });
      }
      
      const github = new GitHubAPI(token);
      const user = await github.getUser();
      
      const commit = await github.pushFiles(
        user.login,
        data.repoName,
        data.branch,
        data.message,
        data.files
      );
      
      res.json({
        success: true,
        commit: {
          sha: commit.sha,
          message: commit.message,
          url: commit.html_url,
        },
      });
    } catch (error: any) {
      console.error("[GitHub] Push error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to push files",
        errorAr: "فشل رفع الملفات",
      });
    }
  });
  
  // ==================== قائمة المستودعات ====================
  // List GitHub repositories
  app.get("/api/deployment/github/repos", async (req: Request, res: Response) => {
    try {
      const token = process.env.GITHUB_TOKEN;
      if (!token) {
        return res.status(400).json({
          success: false,
          error: "GitHub token not configured",
          errorAr: "لم يتم تكوين مفتاح GitHub",
        });
      }
      
      const github = new GitHubAPI(token);
      const repos = await github.getRepos();
      
      res.json({
        success: true,
        repos: repos.map(r => ({
          id: r.id,
          name: r.name,
          fullName: r.full_name,
          url: r.html_url,
          description: r.description,
          private: r.private,
          updatedAt: r.updated_at,
        })),
      });
    } catch (error: any) {
      console.error("[GitHub] List repos error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to list repositories",
        errorAr: "فشل عرض المستودعات",
      });
    }
  });
  
  console.log("[Deployment Integration] Routes registered at /api/deployment/*");
}

// Process deployment asynchronously
async function processDeployment(
  deploymentId: string, 
  data: z.infer<typeof deploymentRequestSchema>,
  token: string
): Promise<void> {
  const status = deployments.get(deploymentId);
  if (!status) return;
  
  status.status = "building";
  status.updatedAt = new Date();
  
  try {
    switch (data.provider) {
      case "vercel": {
        const vercel = new VercelAPI(token);
        
        // Create project if needed
        const project = await vercel.createProject(data.projectName, data.framework);
        
        // Set environment variables
        if (data.envVars?.length) {
          await vercel.setEnvVars(project.id, data.envVars.map(e => ({
            key: e.key,
            value: e.value,
            target: e.target ? [e.target] : undefined,
          })));
        }
        
        // Deploy files
        if (data.files) {
          const deployment = await vercel.deploy(data.projectName, data.files);
          status.url = `https://${deployment.url}`;
        }
        
        status.status = "ready";
        break;
      }
      
      case "netlify": {
        const netlify = new NetlifyAPI(token);
        
        // Create site
        const site = await netlify.createSite(data.projectName);
        
        // Set environment variables
        if (data.envVars?.length) {
          await netlify.setEnvVars(site.id, data.envVars);
        }
        
        // Deploy files
        if (data.files) {
          const deploy = await netlify.deployFiles(site.id, data.files);
          status.url = `https://${site.subdomain}.netlify.app`;
        }
        
        status.status = "ready";
        break;
      }
      
      case "github": {
        const github = new GitHubAPI(token);
        const user = await github.getUser();
        
        // Create repository
        const repo = await github.createRepo(data.projectName);
        
        // Push files
        if (data.files && Object.keys(data.files).length > 0) {
          await github.pushFiles(
            user.login,
            data.projectName,
            data.gitBranch,
            "Initial commit from INFERA WebNova",
            data.files
          );
        }
        
        status.url = repo.html_url;
        status.status = "ready";
        break;
      }
      
      default:
        throw new Error(`Unsupported provider: ${data.provider}`);
    }
  } catch (error: any) {
    status.status = "error";
    status.error = error.message;
  }
  
  status.updatedAt = new Date();
}
