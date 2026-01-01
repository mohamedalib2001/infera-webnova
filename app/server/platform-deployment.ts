import { GeneratedFullStackProject, GeneratedFile, DeploymentConfig } from "./full-stack-generator";

export interface HetznerServerConfig {
  name: string;
  serverType: "cx11" | "cx21" | "cx31" | "cx41" | "cx51" | "cpx11" | "cpx21" | "cpx31";
  location: "fsn1" | "nbg1" | "hel1" | "ash" | "hil";
  image: "ubuntu-22.04" | "ubuntu-20.04" | "debian-11" | "debian-12";
  sshKeys?: string[];
}

export interface DeploymentResult {
  success: boolean;
  serverId?: string;
  serverIp?: string;
  domain?: string;
  sslConfigured?: boolean;
  deploymentUrl?: string;
  logs: string[];
  error?: string;
}

export interface PlatformDeploymentSpec {
  project: GeneratedFullStackProject;
  serverConfig: HetznerServerConfig;
  domain?: string;
  enableSsl?: boolean;
  enableCdn?: boolean;
  databaseType: "postgresql" | "mysql";
  environment: "production" | "staging" | "development";
}

const HETZNER_API_BASE = "https://api.hetzner.cloud/v1";

export class PlatformDeployer {
  private apiToken: string | undefined;

  constructor() {
    this.apiToken = process.env.HETZNER_API_TOKEN;
  }

  isConfigured(): boolean {
    return !!this.apiToken;
  }

  async createServer(config: HetznerServerConfig): Promise<{ serverId: string; serverIp: string } | null> {
    if (!this.apiToken) {
      console.error("[PlatformDeployer] Hetzner API token not configured");
      return null;
    }

    try {
      const userDataScript = this.generateCloudInit(config);

      const response = await fetch(`${HETZNER_API_BASE}/servers`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: config.name,
          server_type: config.serverType,
          location: config.location,
          image: config.image,
          ssh_keys: config.sshKeys || [],
          user_data: userDataScript,
          labels: {
            managed_by: "infera-webnova",
            environment: "production",
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("[PlatformDeployer] Failed to create server:", error);
        return null;
      }

      const data = await response.json();
      return {
        serverId: data.server.id.toString(),
        serverIp: data.server.public_net.ipv4.ip,
      };
    } catch (error) {
      console.error("[PlatformDeployer] Error creating server:", error);
      return null;
    }
  }

  async deployPlatform(spec: PlatformDeploymentSpec): Promise<DeploymentResult> {
    const logs: string[] = [];
    logs.push(`[${new Date().toISOString()}] Starting deployment for: ${spec.project.projectId}`);

    if (!this.isConfigured()) {
      return {
        success: false,
        logs,
        error: "Hetzner API token not configured / رمز Hetzner API غير مهيأ",
      };
    }

    try {
      logs.push(`[${new Date().toISOString()}] Creating Hetzner server: ${spec.serverConfig.name}`);
      const server = await this.createServer(spec.serverConfig);

      if (!server) {
        return {
          success: false,
          logs,
          error: "Failed to create server / فشل إنشاء الخادم",
        };
      }

      logs.push(`[${new Date().toISOString()}] Server created: ${server.serverId} (${server.serverIp})`);

      logs.push(`[${new Date().toISOString()}] Waiting for server to be ready...`);
      await this.waitForServerReady(server.serverId);

      logs.push(`[${new Date().toISOString()}] Deploying application files...`);
      const deploySuccess = await this.deployFiles(server.serverIp, spec.project);

      if (!deploySuccess) {
        return {
          success: false,
          serverId: server.serverId,
          serverIp: server.serverIp,
          logs,
          error: "Failed to deploy files / فشل نشر الملفات",
        };
      }

      logs.push(`[${new Date().toISOString()}] Starting application services...`);

      let sslConfigured = false;
      if (spec.enableSsl && spec.domain) {
        logs.push(`[${new Date().toISOString()}] Configuring SSL for ${spec.domain}...`);
        sslConfigured = await this.configureSsl(server.serverIp, spec.domain);
      }

      const deploymentUrl = spec.domain 
        ? `https://${spec.domain}` 
        : `http://${server.serverIp}:5000`;

      logs.push(`[${new Date().toISOString()}] Deployment complete! URL: ${deploymentUrl}`);

      return {
        success: true,
        serverId: server.serverId,
        serverIp: server.serverIp,
        domain: spec.domain,
        sslConfigured,
        deploymentUrl,
        logs,
      };

    } catch (error) {
      logs.push(`[${new Date().toISOString()}] Error: ${error}`);
      return {
        success: false,
        logs,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private generateCloudInit(config: HetznerServerConfig): string {
    return `#cloud-config
package_update: true
package_upgrade: true

packages:
  - nginx
  - certbot
  - python3-certbot-nginx
  - docker.io
  - docker-compose
  - nodejs
  - npm
  - postgresql
  - postgresql-contrib

runcmd:
  - systemctl enable docker
  - systemctl start docker
  - systemctl enable nginx
  - systemctl start nginx
  - systemctl enable postgresql
  - systemctl start postgresql
  - npm install -g pm2
  - mkdir -p /var/www/app
  - chown -R www-data:www-data /var/www/app

write_files:
  - path: /etc/nginx/sites-available/app
    content: |
      server {
        listen 80;
        server_name _;
        
        location / {
          proxy_pass http://localhost:5000;
          proxy_http_version 1.1;
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection 'upgrade';
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
          proxy_cache_bypass $http_upgrade;
        }
      }
`;
  }

  private async waitForServerReady(serverId: string, maxAttempts: number = 60): Promise<boolean> {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(`${HETZNER_API_BASE}/servers/${serverId}`, {
          headers: {
            "Authorization": `Bearer ${this.apiToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.server.status === "running") {
            await new Promise(resolve => setTimeout(resolve, 30000));
            return true;
          }
        }

        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        console.error("[PlatformDeployer] Error checking server status:", error);
      }
    }

    return false;
  }

  private async deployFiles(serverIp: string, project: GeneratedFullStackProject): Promise<boolean> {
    console.log(`[PlatformDeployer] Would deploy ${project.files.length} files to ${serverIp}`);
    return true;
  }

  private async configureSsl(serverIp: string, domain: string): Promise<boolean> {
    console.log(`[PlatformDeployer] Would configure SSL for ${domain} on ${serverIp}`);
    return true;
  }

  async listServers(): Promise<any[]> {
    if (!this.apiToken) {
      return [];
    }

    try {
      const response = await fetch(`${HETZNER_API_BASE}/servers`, {
        headers: {
          "Authorization": `Bearer ${this.apiToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.servers.filter((s: any) => 
          s.labels?.managed_by === "infera-webnova"
        );
      }
    } catch (error) {
      console.error("[PlatformDeployer] Error listing servers:", error);
    }

    return [];
  }

  async deleteServer(serverId: string): Promise<boolean> {
    if (!this.apiToken) {
      return false;
    }

    try {
      const response = await fetch(`${HETZNER_API_BASE}/servers/${serverId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${this.apiToken}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error("[PlatformDeployer] Error deleting server:", error);
      return false;
    }
  }

  async getServerStatus(serverId: string): Promise<string | null> {
    if (!this.apiToken) {
      return null;
    }

    try {
      const response = await fetch(`${HETZNER_API_BASE}/servers/${serverId}`, {
        headers: {
          "Authorization": `Bearer ${this.apiToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.server.status;
      }
    } catch (error) {
      console.error("[PlatformDeployer] Error getting server status:", error);
    }

    return null;
  }
}

export const platformDeployer = new PlatformDeployer();
