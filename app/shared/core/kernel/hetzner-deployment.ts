/**
 * 🚀 Hetzner Cloud Real Deployment System
 * نظام النشر الحقيقي على Hetzner Cloud
 * 
 * Provides:
 * - Real server provisioning via Hetzner API
 * - Automated deployment with SSH
 * - Server management (start, stop, restart, delete)
 * - Real-time status monitoring
 * - Cost estimation and tracking
 */

import https from 'https';

// ==================== TYPES ====================

export interface HetznerServerSpec {
  name: string;
  serverType: 'cx11' | 'cx21' | 'cx31' | 'cx41' | 'cx51' | 'cpx11' | 'cpx21' | 'cpx31' | 'cpx41' | 'cpx51';
  image: 'ubuntu-22.04' | 'ubuntu-20.04' | 'debian-12' | 'debian-11' | 'rocky-9' | 'fedora-39';
  location: 'fsn1' | 'nbg1' | 'hel1' | 'ash' | 'hil';
  sshKeys?: string[];
  labels?: Record<string, string>;
  userData?: string;
}

export interface HetznerServer {
  id: number;
  name: string;
  status: 'initializing' | 'starting' | 'running' | 'stopping' | 'off' | 'deleting' | 'rebuilding' | 'migrating' | 'unknown';
  publicNet: {
    ipv4: { ip: string };
    ipv6: { ip: string };
  };
  serverType: {
    name: string;
    description: string;
    cores: number;
    memory: number;
    disk: number;
  };
  datacenter: {
    name: string;
    location: { name: string; city: string; country: string };
  };
  image: { name: string; description: string };
  created: string;
  labels: Record<string, string>;
}

export interface DeploymentResult {
  success: boolean;
  serverId?: number;
  serverIp?: string;
  serverName?: string;
  status?: string;
  error?: string;
  deploymentId?: string;
  url?: string;
  cost?: {
    hourly: number;
    monthly: number;
    currency: string;
  };
}

export interface ServerAction {
  id: number;
  command: string;
  status: 'running' | 'success' | 'error';
  progress: number;
  started: string;
  finished?: string;
  error?: { code: string; message: string };
}

// Server type pricing (EUR/month)
const SERVER_PRICING: Record<string, { hourly: number; monthly: number }> = {
  'cx11': { hourly: 0.005, monthly: 3.29 },
  'cx21': { hourly: 0.008, monthly: 5.83 },
  'cx31': { hourly: 0.016, monthly: 10.59 },
  'cx41': { hourly: 0.030, monthly: 19.99 },
  'cx51': { hourly: 0.060, monthly: 38.56 },
  'cpx11': { hourly: 0.007, monthly: 4.49 },
  'cpx21': { hourly: 0.013, monthly: 8.49 },
  'cpx31': { hourly: 0.025, monthly: 15.99 },
  'cpx41': { hourly: 0.050, monthly: 31.99 },
  'cpx51': { hourly: 0.100, monthly: 63.99 },
};

// ==================== HETZNER CLIENT ====================

class HetznerClient {
  private apiToken: string;
  private baseUrl = 'api.hetzner.cloud';
  private apiVersion = 'v1';

  constructor() {
    this.apiToken = process.env.HETZNER_API_TOKEN || '';
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: any
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.apiToken) {
        reject(new Error('HETZNER_API_TOKEN not configured'));
        return;
      }

      const options: https.RequestOptions = {
        hostname: this.baseUrl,
        port: 443,
        path: `/${this.apiVersion}${path}`,
        method,
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const parsed = data ? JSON.parse(data) : {};
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed as T);
            } else {
              reject(new Error(parsed.error?.message || `HTTP ${res.statusCode}`));
            }
          } catch (e) {
            reject(new Error(`Invalid response: ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  }

  /**
   * List all servers
   */
  async listServers(labelSelector?: string): Promise<HetznerServer[]> {
    const query = labelSelector ? `?label_selector=${encodeURIComponent(labelSelector)}` : '';
    const response = await this.request<{ servers: HetznerServer[] }>('GET', `/servers${query}`);
    return response.servers || [];
  }

  /**
   * Get server by ID
   */
  async getServer(id: number): Promise<HetznerServer | null> {
    try {
      const response = await this.request<{ server: HetznerServer }>('GET', `/servers/${id}`);
      return response.server;
    } catch {
      return null;
    }
  }

  /**
   * Create a new server
   */
  async createServer(spec: HetznerServerSpec): Promise<{ server: HetznerServer; rootPassword?: string }> {
    const response = await this.request<{ server: HetznerServer; root_password?: string }>(
      'POST',
      '/servers',
      {
        name: spec.name,
        server_type: spec.serverType,
        image: spec.image,
        location: spec.location,
        ssh_keys: spec.sshKeys,
        labels: spec.labels || {},
        user_data: spec.userData,
        start_after_create: true,
      }
    );
    return { server: response.server, rootPassword: response.root_password };
  }

  /**
   * Delete a server
   */
  async deleteServer(id: number): Promise<void> {
    await this.request<{}>('DELETE', `/servers/${id}`);
  }

  /**
   * Power on server
   */
  async powerOn(id: number): Promise<ServerAction> {
    const response = await this.request<{ action: ServerAction }>('POST', `/servers/${id}/actions/poweron`);
    return response.action;
  }

  /**
   * Power off server
   */
  async powerOff(id: number): Promise<ServerAction> {
    const response = await this.request<{ action: ServerAction }>('POST', `/servers/${id}/actions/poweroff`);
    return response.action;
  }

  /**
   * Reboot server
   */
  async reboot(id: number): Promise<ServerAction> {
    const response = await this.request<{ action: ServerAction }>('POST', `/servers/${id}/actions/reboot`);
    return response.action;
  }

  /**
   * Get action status
   */
  async getAction(serverId: number, actionId: number): Promise<ServerAction> {
    const response = await this.request<{ action: ServerAction }>('GET', `/servers/${serverId}/actions/${actionId}`);
    return response.action;
  }

  /**
   * List SSH keys
   */
  async listSSHKeys(): Promise<Array<{ id: number; name: string; fingerprint: string }>> {
    const response = await this.request<{ ssh_keys: Array<{ id: number; name: string; fingerprint: string }> }>(
      'GET',
      '/ssh_keys'
    );
    return response.ssh_keys || [];
  }

  /**
   * Create SSH key
   */
  async createSSHKey(name: string, publicKey: string): Promise<{ id: number; name: string; fingerprint: string }> {
    const response = await this.request<{ ssh_key: { id: number; name: string; fingerprint: string } }>(
      'POST',
      '/ssh_keys',
      { name, public_key: publicKey }
    );
    return response.ssh_key;
  }
}

// ==================== DEPLOYMENT ENGINE ====================

export class HetznerDeploymentEngine {
  private client: HetznerClient;

  constructor() {
    this.client = new HetznerClient();
  }

  /**
   * Check if Hetzner API is configured
   */
  isConfigured(): boolean {
    return !!process.env.HETZNER_API_TOKEN;
  }

  /**
   * Deploy a new application server
   */
  async deploy(
    projectId: string,
    projectName: string,
    options: {
      serverType?: HetznerServerSpec['serverType'];
      location?: HetznerServerSpec['location'];
      image?: HetznerServerSpec['image'];
      sshKeyId?: string;
      setupScript?: string;
    } = {}
  ): Promise<DeploymentResult> {
    if (!this.isConfigured()) {
      return { success: false, error: 'Hetzner API not configured' };
    }

    const deploymentId = `deploy-${projectId}-${Date.now()}`;
    const serverName = `infera-${projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
    
    const serverType = options.serverType || 'cx11';
    const pricing = SERVER_PRICING[serverType] || SERVER_PRICING['cx11'];

    // Cloud-init script for auto-setup
    const userData = options.setupScript || this.getDefaultSetupScript(projectName);

    try {
      // Note: rootPassword is intentionally not returned for security
      const { server } = await this.client.createServer({
        name: serverName,
        serverType,
        image: options.image || 'ubuntu-22.04',
        location: options.location || 'fsn1',
        sshKeys: options.sshKeyId ? [options.sshKeyId] : [],
        labels: {
          'infera-project': projectId,
          'infera-deployment': deploymentId,
          'managed-by': 'infera-webnova',
        },
        userData,
      });

      return {
        success: true,
        serverId: server.id,
        serverIp: server.publicNet?.ipv4?.ip,
        serverName: server.name,
        status: server.status,
        deploymentId,
        url: `http://${server.publicNet?.ipv4?.ip}`,
        cost: {
          hourly: pricing.hourly,
          monthly: pricing.monthly,
          currency: 'EUR',
        },
      };
    } catch (error: any) {
      // Sanitize error - don't expose internal API details
      const safeError = error.message?.includes('HETZNER') 
        ? 'Cloud API configuration error'
        : 'Deployment failed. Please try again.';
      return { success: false, error: safeError, deploymentId };
    }
  }

  /**
   * Get default setup script for Node.js apps
   */
  private getDefaultSetupScript(projectName: string): string {
    return `#!/bin/bash
set -e

# Update system
apt-get update && apt-get upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Install nginx
apt-get install -y nginx

# Create app directory
mkdir -p /opt/${projectName}
cd /opt/${projectName}

# Setup basic nginx config
cat > /etc/nginx/sites-available/default << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Restart nginx
systemctl restart nginx
systemctl enable nginx

echo "Server setup complete for ${projectName}"
`;
  }

  /**
   * Get deployment status
   */
  async getStatus(serverId: number): Promise<{
    status: string;
    server?: HetznerServer;
    error?: string;
  }> {
    try {
      const server = await this.client.getServer(serverId);
      if (!server) {
        return { status: 'not_found', error: 'Server not found' };
      }
      return { status: server.status, server };
    } catch (error: any) {
      return { status: 'error', error: error.message };
    }
  }

  /**
   * List all deployments for a project
   */
  async listDeployments(projectId: string): Promise<HetznerServer[]> {
    try {
      return await this.client.listServers(`infera-project=${projectId}`);
    } catch {
      return [];
    }
  }

  /**
   * Delete deployment
   */
  async deleteDeployment(serverId: number): Promise<{ success: boolean; error?: string }> {
    try {
      await this.client.deleteServer(serverId);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Restart deployment
   */
  async restartDeployment(serverId: number): Promise<{ success: boolean; action?: ServerAction; error?: string }> {
    try {
      const action = await this.client.reboot(serverId);
      return { success: true, action };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Stop deployment
   */
  async stopDeployment(serverId: number): Promise<{ success: boolean; action?: ServerAction; error?: string }> {
    try {
      const action = await this.client.powerOff(serverId);
      return { success: true, action };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Start deployment
   */
  async startDeployment(serverId: number): Promise<{ success: boolean; action?: ServerAction; error?: string }> {
    try {
      const action = await this.client.powerOn(serverId);
      return { success: true, action };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get cost estimate
   */
  getCostEstimate(serverType: string): { hourly: number; monthly: number; currency: string } {
    const pricing = SERVER_PRICING[serverType] || SERVER_PRICING['cx11'];
    return { ...pricing, currency: 'EUR' };
  }

  /**
   * List available server types
   */
  getServerTypes(): Array<{
    id: string;
    name: string;
    cores: number;
    memory: number;
    disk: number;
    price: { hourly: number; monthly: number };
  }> {
    return [
      { id: 'cx11', name: 'CX11 (Shared)', cores: 1, memory: 2, disk: 20, price: SERVER_PRICING['cx11'] },
      { id: 'cx21', name: 'CX21 (Shared)', cores: 2, memory: 4, disk: 40, price: SERVER_PRICING['cx21'] },
      { id: 'cx31', name: 'CX31 (Shared)', cores: 2, memory: 8, disk: 80, price: SERVER_PRICING['cx31'] },
      { id: 'cx41', name: 'CX41 (Shared)', cores: 4, memory: 16, disk: 160, price: SERVER_PRICING['cx41'] },
      { id: 'cx51', name: 'CX51 (Shared)', cores: 8, memory: 32, disk: 240, price: SERVER_PRICING['cx51'] },
      { id: 'cpx11', name: 'CPX11 (Dedicated)', cores: 2, memory: 2, disk: 40, price: SERVER_PRICING['cpx11'] },
      { id: 'cpx21', name: 'CPX21 (Dedicated)', cores: 3, memory: 4, disk: 80, price: SERVER_PRICING['cpx21'] },
      { id: 'cpx31', name: 'CPX31 (Dedicated)', cores: 4, memory: 8, disk: 160, price: SERVER_PRICING['cpx31'] },
      { id: 'cpx41', name: 'CPX41 (Dedicated)', cores: 8, memory: 16, disk: 240, price: SERVER_PRICING['cpx41'] },
      { id: 'cpx51', name: 'CPX51 (Dedicated)', cores: 16, memory: 32, disk: 360, price: SERVER_PRICING['cpx51'] },
    ];
  }

  /**
   * List available locations
   */
  getLocations(): Array<{ id: string; name: string; city: string; country: string }> {
    return [
      { id: 'fsn1', name: 'Falkenstein', city: 'Falkenstein', country: 'Germany' },
      { id: 'nbg1', name: 'Nuremberg', city: 'Nuremberg', country: 'Germany' },
      { id: 'hel1', name: 'Helsinki', city: 'Helsinki', country: 'Finland' },
      { id: 'ash', name: 'Ashburn', city: 'Ashburn, VA', country: 'USA' },
      { id: 'hil', name: 'Hillsboro', city: 'Hillsboro, OR', country: 'USA' },
    ];
  }
}

// Export singleton
export const hetznerDeployment = new HetznerDeploymentEngine();
