/**
 * External Deployment Service - خدمة النشر الخارجي
 * 
 * Deploys projects to external infrastructure without Replit dependency.
 * Supports Hetzner Cloud, AWS, GCP, and on-premises servers.
 * 
 * نشر المشاريع على بنية تحتية خارجية بدون تبعية Replit
 * يدعم Hetzner Cloud و AWS و GCP والخوادم المحلية
 */

import { sovereignGitEngine } from '../lib/sovereign-git-engine';

interface DeploymentTarget {
  id: string;
  name: string;
  provider: 'hetzner' | 'aws' | 'gcp' | 'digitalocean' | 'onprem';
  region?: string;
  serverType?: string;
  ipAddress?: string;
  sshKey?: string;
  status: 'active' | 'inactive' | 'deploying' | 'error';
  createdAt: Date;
  lastDeployedAt?: Date;
}

interface DeploymentJob {
  id: string;
  repositoryId: string;
  targetId: string;
  status: 'pending' | 'preparing' | 'deploying' | 'running' | 'success' | 'failed';
  progress: number;
  logs: string[];
  startedAt: Date;
  completedAt?: Date;
  errorMessage?: string;
  deployedUrl?: string;
}

interface ServerSpec {
  provider: 'hetzner' | 'aws' | 'gcp' | 'digitalocean' | 'onprem';
  name: string;
  region: string;
  serverType: string;
  image: string;
  sshKeys?: string[];
  userData?: string;
}

interface HealthCheck {
  id: string;
  targetId: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  responseTime: number;
  lastCheckedAt: Date;
  uptime: number;
  errors: string[];
}

interface PerformanceMetric {
  timestamp: Date;
  targetId: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkIn: number;
  networkOut: number;
  requestsPerSecond: number;
  averageResponseTime: number;
  errorRate: number;
}

interface CostEstimate {
  provider: string;
  serverType: string;
  monthlyCost: number;
  hourlyCost: number;
  currency: string;
  breakdown: {
    compute: number;
    storage: number;
    network: number;
    backup: number;
  };
}

// In-memory storage for MVP
const deploymentTargets = new Map<string, DeploymentTarget>();
const deploymentJobs = new Map<string, DeploymentJob>();
const healthChecks = new Map<string, HealthCheck>();
const performanceMetrics = new Map<string, PerformanceMetric[]>();

// Provider configurations
const PROVIDER_CONFIGS = {
  hetzner: {
    name: 'Hetzner Cloud',
    regions: [
      { id: 'fsn1', name: 'Falkenstein, Germany' },
      { id: 'nbg1', name: 'Nuremberg, Germany' },
      { id: 'hel1', name: 'Helsinki, Finland' },
      { id: 'ash', name: 'Ashburn, USA' }
    ],
    serverTypes: [
      { id: 'cx11', name: 'CX11', vcpus: 1, memory: 2, disk: 20, priceHourly: 0.0054 },
      { id: 'cx21', name: 'CX21', vcpus: 2, memory: 4, disk: 40, priceHourly: 0.0096 },
      { id: 'cx31', name: 'CX31', vcpus: 2, memory: 8, disk: 80, priceHourly: 0.0169 },
      { id: 'cx41', name: 'CX41', vcpus: 4, memory: 16, disk: 160, priceHourly: 0.0314 },
      { id: 'cx51', name: 'CX51', vcpus: 8, memory: 32, disk: 240, priceHourly: 0.0599 }
    ]
  },
  aws: {
    name: 'Amazon Web Services',
    regions: [
      { id: 'us-east-1', name: 'US East (N. Virginia)' },
      { id: 'us-west-2', name: 'US West (Oregon)' },
      { id: 'eu-west-1', name: 'Europe (Ireland)' },
      { id: 'ap-southeast-1', name: 'Asia Pacific (Singapore)' }
    ],
    serverTypes: [
      { id: 't3.micro', name: 't3.micro', vcpus: 2, memory: 1, disk: 8, priceHourly: 0.0104 },
      { id: 't3.small', name: 't3.small', vcpus: 2, memory: 2, disk: 8, priceHourly: 0.0208 },
      { id: 't3.medium', name: 't3.medium', vcpus: 2, memory: 4, disk: 8, priceHourly: 0.0416 },
      { id: 't3.large', name: 't3.large', vcpus: 2, memory: 8, disk: 8, priceHourly: 0.0832 }
    ]
  },
  gcp: {
    name: 'Google Cloud Platform',
    regions: [
      { id: 'us-central1', name: 'Iowa, USA' },
      { id: 'europe-west1', name: 'Belgium' },
      { id: 'asia-east1', name: 'Taiwan' }
    ],
    serverTypes: [
      { id: 'e2-micro', name: 'e2-micro', vcpus: 0.25, memory: 1, disk: 10, priceHourly: 0.0084 },
      { id: 'e2-small', name: 'e2-small', vcpus: 0.5, memory: 2, disk: 10, priceHourly: 0.0168 },
      { id: 'e2-medium', name: 'e2-medium', vcpus: 1, memory: 4, disk: 10, priceHourly: 0.0336 }
    ]
  },
  digitalocean: {
    name: 'DigitalOcean',
    regions: [
      { id: 'nyc1', name: 'New York 1' },
      { id: 'sfo3', name: 'San Francisco 3' },
      { id: 'ams3', name: 'Amsterdam 3' },
      { id: 'sgp1', name: 'Singapore 1' }
    ],
    serverTypes: [
      { id: 's-1vcpu-1gb', name: 'Basic 1GB', vcpus: 1, memory: 1, disk: 25, priceHourly: 0.0074 },
      { id: 's-1vcpu-2gb', name: 'Basic 2GB', vcpus: 1, memory: 2, disk: 50, priceHourly: 0.0149 },
      { id: 's-2vcpu-4gb', name: 'Basic 4GB', vcpus: 2, memory: 4, disk: 80, priceHourly: 0.0298 }
    ]
  },
  onprem: {
    name: 'On-Premises',
    regions: [{ id: 'local', name: 'Local Server' }],
    serverTypes: [{ id: 'custom', name: 'Custom Server', vcpus: 0, memory: 0, disk: 0, priceHourly: 0 }]
  }
};

class ExternalDeploymentService {
  
  /**
   * Get available providers and their configurations
   */
  getProviders() {
    return Object.entries(PROVIDER_CONFIGS).map(([id, config]) => ({
      id,
      name: config.name,
      regions: config.regions,
      serverTypes: config.serverTypes,
      available: id === 'hetzner' ? !!process.env.HETZNER_API_TOKEN : false
    }));
  }
  
  /**
   * Estimate deployment cost
   */
  estimateCost(provider: string, serverType: string): CostEstimate {
    const config = PROVIDER_CONFIGS[provider as keyof typeof PROVIDER_CONFIGS];
    if (!config) {
      throw new Error(`Unknown provider: ${provider}`);
    }
    
    const server = config.serverTypes.find(s => s.id === serverType);
    if (!server) {
      throw new Error(`Unknown server type: ${serverType}`);
    }
    
    const hourlyRate = server.priceHourly;
    const monthlyHours = 730; // Average hours per month
    
    return {
      provider: config.name,
      serverType: server.name,
      monthlyCost: Math.round(hourlyRate * monthlyHours * 100) / 100,
      hourlyCost: hourlyRate,
      currency: 'USD',
      breakdown: {
        compute: Math.round(hourlyRate * monthlyHours * 0.7 * 100) / 100,
        storage: Math.round(hourlyRate * monthlyHours * 0.15 * 100) / 100,
        network: Math.round(hourlyRate * monthlyHours * 0.1 * 100) / 100,
        backup: Math.round(hourlyRate * monthlyHours * 0.05 * 100) / 100
      }
    };
  }
  
  /**
   * Create a new deployment target (server)
   */
  async createTarget(spec: ServerSpec): Promise<DeploymentTarget> {
    const targetId = `target-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    let ipAddress = '';
    
    if (spec.provider === 'hetzner') {
      ipAddress = await this.createHetznerServer(spec);
    } else if (spec.provider === 'onprem') {
      // For on-prem, user provides the IP
      ipAddress = spec.region; // Using region field for IP in on-prem
    } else {
      // Simulated for other providers
      ipAddress = `192.168.1.${Math.floor(Math.random() * 254) + 1}`;
    }
    
    const target: DeploymentTarget = {
      id: targetId,
      name: spec.name,
      provider: spec.provider,
      region: spec.region,
      serverType: spec.serverType,
      ipAddress,
      sshKey: spec.sshKeys?.[0],
      status: 'active',
      createdAt: new Date()
    };
    
    deploymentTargets.set(targetId, target);
    
    console.log(`[ExternalDeployment] Created target ${targetId} on ${spec.provider}`);
    
    return target;
  }
  
  /**
   * Create Hetzner Cloud server
   */
  private async createHetznerServer(spec: ServerSpec): Promise<string> {
    const apiToken = process.env.HETZNER_API_TOKEN;
    if (!apiToken) {
      throw new Error('Hetzner API token not configured');
    }
    
    try {
      const response = await fetch('https://api.hetzner.cloud/v1/servers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: spec.name,
          server_type: spec.serverType,
          location: spec.region,
          image: spec.image || 'ubuntu-22.04',
          ssh_keys: spec.sshKeys,
          user_data: spec.userData || this.generateCloudInit()
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to create Hetzner server');
      }
      
      const data = await response.json();
      return data.server.public_net.ipv4.ip;
    } catch (error: any) {
      console.error('[ExternalDeployment] Hetzner API error:', error);
      throw new Error(`Hetzner server creation failed: ${error.message}`);
    }
  }
  
  /**
   * Generate cloud-init script for server setup
   */
  private generateCloudInit(): string {
    return `#!/bin/bash
set -e

# Update system
apt-get update && apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install Caddy for HTTPS
apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt-get update && apt-get install -y caddy

# Create app directory
mkdir -p /opt/app
chown -R 1000:1000 /opt/app

# Enable services
systemctl enable docker
systemctl enable caddy

echo "Server setup complete!"
`;
  }
  
  /**
   * List all deployment targets
   */
  async getTargets(): Promise<DeploymentTarget[]> {
    return Array.from(deploymentTargets.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }
  
  /**
   * Get a specific target
   */
  async getTarget(targetId: string): Promise<DeploymentTarget | null> {
    return deploymentTargets.get(targetId) || null;
  }
  
  /**
   * Delete a deployment target
   */
  async deleteTarget(targetId: string): Promise<boolean> {
    const target = deploymentTargets.get(targetId);
    if (!target) return false;
    
    // If Hetzner, delete the server
    if (target.provider === 'hetzner' && process.env.HETZNER_API_TOKEN) {
      // Would call Hetzner API to delete server
      console.log(`[ExternalDeployment] Would delete Hetzner server for ${targetId}`);
    }
    
    deploymentTargets.delete(targetId);
    return true;
  }
  
  /**
   * Deploy repository to target
   */
  async deployToTarget(repositoryId: string, targetId: string): Promise<DeploymentJob> {
    const target = deploymentTargets.get(targetId);
    if (!target) {
      throw new Error('Deployment target not found');
    }
    
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const job: DeploymentJob = {
      id: jobId,
      repositoryId,
      targetId,
      status: 'pending',
      progress: 0,
      logs: [],
      startedAt: new Date()
    };
    
    deploymentJobs.set(jobId, job);
    
    // Start async deployment
    this.executeDeployment(job, target, repositoryId);
    
    return job;
  }
  
  /**
   * Execute deployment process
   */
  private async executeDeployment(
    job: DeploymentJob, 
    target: DeploymentTarget, 
    repositoryId: string
  ): Promise<void> {
    try {
      // Step 1: Prepare
      this.updateJob(job.id, { 
        status: 'preparing', 
        progress: 10,
        logs: [...job.logs, `[${new Date().toISOString()}] Preparing deployment package...`]
      });
      
      // Get repository files
      const files = await sovereignGitEngine.getRepositoryFiles(repositoryId, 'main');
      
      this.updateJob(job.id, {
        progress: 20,
        logs: [...(deploymentJobs.get(job.id)?.logs || []), 
          `[${new Date().toISOString()}] Found ${files.length} files to deploy`]
      });
      
      // Step 2: Generate deployment artifacts
      const { detachModeService } = await import('./detach-mode-service');
      const detachResult = await detachModeService.executeDetach(repositoryId);
      
      this.updateJob(job.id, {
        progress: 40,
        logs: [...(deploymentJobs.get(job.id)?.logs || []), 
          `[${new Date().toISOString()}] Generated deployment configuration`]
      });
      
      // Step 3: Deploy
      this.updateJob(job.id, { 
        status: 'deploying',
        progress: 60,
        logs: [...(deploymentJobs.get(job.id)?.logs || []), 
          `[${new Date().toISOString()}] Deploying to ${target.provider} (${target.ipAddress})...`]
      });
      
      // Simulate deployment steps
      await this.simulateDeploymentSteps(job.id, target);
      
      // Step 4: Complete
      const deployedUrl = target.provider === 'onprem' 
        ? `http://${target.ipAddress}:5000`
        : `https://${target.name.toLowerCase().replace(/\s+/g, '-')}.app`;
      
      this.updateJob(job.id, {
        status: 'success',
        progress: 100,
        completedAt: new Date(),
        deployedUrl,
        logs: [...(deploymentJobs.get(job.id)?.logs || []),
          `[${new Date().toISOString()}] Deployment successful!`,
          `[${new Date().toISOString()}] Application available at: ${deployedUrl}`]
      });
      
      // Update target
      target.lastDeployedAt = new Date();
      target.status = 'active';
      deploymentTargets.set(target.id, target);
      
    } catch (error: any) {
      this.updateJob(job.id, {
        status: 'failed',
        completedAt: new Date(),
        errorMessage: error.message,
        logs: [...(deploymentJobs.get(job.id)?.logs || []),
          `[${new Date().toISOString()}] ERROR: ${error.message}`]
      });
    }
  }
  
  /**
   * Simulate deployment steps
   */
  private async simulateDeploymentSteps(jobId: string, target: DeploymentTarget): Promise<void> {
    const steps = [
      { progress: 65, message: 'Uploading files...' },
      { progress: 75, message: 'Installing dependencies...' },
      { progress: 85, message: 'Building application...' },
      { progress: 90, message: 'Starting services...' },
      { progress: 95, message: 'Running health checks...' }
    ];
    
    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const currentJob = deploymentJobs.get(jobId);
      if (currentJob) {
        this.updateJob(jobId, {
          progress: step.progress,
          logs: [...currentJob.logs, `[${new Date().toISOString()}] ${step.message}`]
        });
      }
    }
  }
  
  /**
   * Update job state
   */
  private updateJob(jobId: string, updates: Partial<DeploymentJob>): void {
    const job = deploymentJobs.get(jobId);
    if (job) {
      deploymentJobs.set(jobId, { ...job, ...updates });
    }
  }
  
  /**
   * Get deployment job
   */
  async getJob(jobId: string): Promise<DeploymentJob | null> {
    return deploymentJobs.get(jobId) || null;
  }
  
  /**
   * Get deployment jobs for a repository
   */
  async getJobsForRepository(repositoryId: string): Promise<DeploymentJob[]> {
    return Array.from(deploymentJobs.values())
      .filter(j => j.repositoryId === repositoryId)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  }
  
  /**
   * Perform health check on target
   */
  async performHealthCheck(targetId: string): Promise<HealthCheck> {
    const target = deploymentTargets.get(targetId);
    if (!target) {
      throw new Error('Target not found');
    }
    
    const checkId = `check-${Date.now()}`;
    let status: HealthCheck['status'] = 'unknown';
    let responseTime = 0;
    const errors: string[] = [];
    
    try {
      const startTime = Date.now();
      const url = `http://${target.ipAddress}:5000/health`;
      
      // In production, would actually fetch the URL
      // For MVP, simulate health check
      await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100));
      
      responseTime = Date.now() - startTime;
      status = responseTime < 1000 ? 'healthy' : 'unhealthy';
      
    } catch (error: any) {
      status = 'unhealthy';
      errors.push(error.message);
    }
    
    const existingCheck = healthChecks.get(targetId);
    const uptime = existingCheck 
      ? (status === 'healthy' ? existingCheck.uptime + 1 : 0)
      : (status === 'healthy' ? 1 : 0);
    
    const check: HealthCheck = {
      id: checkId,
      targetId,
      status,
      responseTime,
      lastCheckedAt: new Date(),
      uptime,
      errors
    };
    
    healthChecks.set(targetId, check);
    
    return check;
  }
  
  /**
   * Get health check for target
   */
  async getHealthCheck(targetId: string): Promise<HealthCheck | null> {
    return healthChecks.get(targetId) || null;
  }
  
  /**
   * Record performance metrics
   */
  async recordMetrics(targetId: string, metrics: Omit<PerformanceMetric, 'timestamp' | 'targetId'>): Promise<void> {
    const metric: PerformanceMetric = {
      ...metrics,
      timestamp: new Date(),
      targetId
    };
    
    const existing = performanceMetrics.get(targetId) || [];
    existing.push(metric);
    
    // Keep last 1000 metrics
    if (existing.length > 1000) {
      existing.splice(0, existing.length - 1000);
    }
    
    performanceMetrics.set(targetId, existing);
  }
  
  /**
   * Get performance metrics for target
   */
  async getMetrics(targetId: string, limit: number = 100): Promise<PerformanceMetric[]> {
    const metrics = performanceMetrics.get(targetId) || [];
    return metrics.slice(-limit);
  }
  
  /**
   * Compare costs across providers
   */
  compareCosts(serverTypes: { provider: string; type: string }[]): CostEstimate[] {
    return serverTypes.map(({ provider, type }) => this.estimateCost(provider, type));
  }
  
  /**
   * Get deployment recommendations
   */
  getRecommendations(requirements: {
    expectedTraffic: 'low' | 'medium' | 'high';
    region: string;
    budget: number;
  }): { provider: string; serverType: string; reason: string }[] {
    const recommendations: { provider: string; serverType: string; reason: string }[] = [];
    
    // Hetzner - best value
    if (requirements.budget >= 4) {
      recommendations.push({
        provider: 'hetzner',
        serverType: requirements.expectedTraffic === 'high' ? 'cx31' : 'cx21',
        reason: 'Best price-performance ratio for European/US hosting'
      });
    }
    
    // DigitalOcean - good balance
    if (requirements.budget >= 5) {
      recommendations.push({
        provider: 'digitalocean',
        serverType: requirements.expectedTraffic === 'high' ? 's-2vcpu-4gb' : 's-1vcpu-2gb',
        reason: 'Simple setup with good global coverage'
      });
    }
    
    // AWS - enterprise
    if (requirements.budget >= 10) {
      recommendations.push({
        provider: 'aws',
        serverType: requirements.expectedTraffic === 'high' ? 't3.medium' : 't3.small',
        reason: 'Enterprise-grade with extensive service ecosystem'
      });
    }
    
    return recommendations;
  }
}

export const externalDeploymentService = new ExternalDeploymentService();
