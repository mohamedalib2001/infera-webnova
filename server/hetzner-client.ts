import { storage } from "./storage";
import { cryptoService } from "./crypto-service";
import type { InsertInfrastructureAuditLog, InsertProviderErrorLog } from "@shared/schema";

interface HetznerServer {
  id: number;
  name: string;
  status: string;
  public_net: {
    ipv4: { ip: string } | null;
    ipv6: { ip: string } | null;
  };
  private_net: Array<{ ip: string }>;
  datacenter: {
    name: string;
    location: { name: string; city: string; country: string };
  };
  server_type: {
    name: string;
    cores: number;
    memory: number;
    disk: number;
    prices: Array<{ price_monthly: { gross: string } }>;
  };
  created: string;
}

interface HetznerAction {
  id: number;
  command: string;
  status: string;
  started: string;
  finished: string | null;
  error?: { code: string; message: string };
}

interface HetznerApiError {
  error: {
    code: string;
    message: string;
  };
}

type HetznerErrorType = 'api_error' | 'rate_limit' | 'invalid_token' | 'network_failure' | 'timeout' | 'not_found';

export class HetznerClient {
  private baseUrl = 'https://api.hetzner.cloud/v1';
  private maxRetries = 3;
  private retryDelayMs = 1000;

  constructor(
    private apiToken: string,
    private providerId: string,
    private userId: string,
    private userEmail?: string,
    private userRole: string = 'owner',
    private userIp?: string
  ) {}

  private async request<T>(
    method: string,
    endpoint: string,
    body?: Record<string, any>,
    retryCount = 0
  ): Promise<{ data: T | null; error: HetznerApiError | null; status: number }> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const duration = Date.now() - startTime;
      const data = await response.json();

      if (!response.ok) {
        const errorType = this.mapErrorType(response.status, data);
        await this.logProviderError(errorType, response.status, data?.error?.message || 'Unknown error', endpoint, method);
        
        if (response.status === 429 && retryCount < this.maxRetries) {
          await this.delay(this.retryDelayMs * Math.pow(2, retryCount));
          return this.request(method, endpoint, body, retryCount + 1);
        }
        
        return { data: null, error: data as HetznerApiError, status: response.status };
      }

      return { data: data as T, error: null, status: response.status };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      if (retryCount < this.maxRetries) {
        await this.delay(this.retryDelayMs * Math.pow(2, retryCount));
        return this.request(method, endpoint, body, retryCount + 1);
      }
      
      await this.logProviderError('network_failure', 0, error.message || 'Network error', endpoint, method);
      
      return { 
        data: null, 
        error: { error: { code: 'network_error', message: error.message } }, 
        status: 0 
      };
    }
  }

  private mapErrorType(status: number, data: any): HetznerErrorType {
    if (status === 401 || status === 403) return 'invalid_token';
    if (status === 429) return 'rate_limit';
    if (status === 404) return 'not_found';
    return 'api_error';
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async logProviderError(
    errorType: HetznerErrorType,
    httpStatus: number,
    message: string,
    endpoint: string,
    method: string
  ): Promise<void> {
    try {
      await storage.createProviderErrorLog({
        providerId: this.providerId,
        providerType: 'hetzner',
        errorType,
        errorCode: errorType,
        errorMessage: message,
        httpStatus,
        endpoint,
        method,
        resolved: false,
      });
    } catch (e) {
      console.error('Failed to log provider error:', e);
    }
  }

  private async logAuditAction(
    action: string,
    actionCategory: string,
    targetType: string,
    targetId: string | undefined,
    targetName: string | undefined,
    success: boolean,
    stateBefore?: Record<string, any>,
    stateAfter?: Record<string, any>,
    errorMessage?: string,
    requestDuration?: number
  ): Promise<void> {
    try {
      await storage.createInfrastructureAuditLog({
        userId: this.userId,
        userEmail: this.userEmail,
        userRole: this.userRole,
        userIp: this.userIp,
        action,
        actionCategory,
        targetType,
        targetId,
        targetName,
        success,
        stateBefore,
        stateAfter,
        errorMessage,
        providerId: this.providerId,
        providerType: 'hetzner',
        requestDuration,
      });
    } catch (e) {
      console.error('Failed to log audit action:', e);
    }
  }

  async listServers(): Promise<{ servers: HetznerServer[]; error?: string }> {
    const startTime = Date.now();
    const { data, error, status } = await this.request<{ servers: HetznerServer[] }>('GET', '/servers');
    
    await this.logAuditAction(
      'server:list',
      'server',
      'provider',
      this.providerId,
      'Hetzner',
      !error,
      undefined,
      data ? { serverCount: data.servers.length } : undefined,
      error?.error?.message,
      Date.now() - startTime
    );
    
    if (error) {
      return { servers: [], error: error.error.message };
    }
    
    return { servers: data!.servers };
  }

  async getServer(serverId: number): Promise<{ server: HetznerServer | null; error?: string }> {
    const startTime = Date.now();
    const { data, error } = await this.request<{ server: HetznerServer }>('GET', `/servers/${serverId}`);
    
    await this.logAuditAction(
      'server:get',
      'server',
      'server',
      String(serverId),
      undefined,
      !error,
      undefined,
      data ? { status: data.server.status } : undefined,
      error?.error?.message,
      Date.now() - startTime
    );
    
    if (error) {
      return { server: null, error: error.error.message };
    }
    
    return { server: data!.server };
  }

  async powerOn(serverId: number, serverName?: string): Promise<{ success: boolean; action?: HetznerAction; error?: string }> {
    const startTime = Date.now();
    const stateBefore = { status: 'off' };
    
    const { data, error } = await this.request<{ action: HetznerAction }>('POST', `/servers/${serverId}/actions/poweron`);
    
    await this.logAuditAction(
      'server:power_on',
      'server',
      'server',
      String(serverId),
      serverName,
      !error,
      stateBefore,
      data ? { status: 'starting', actionId: data.action.id } : undefined,
      error?.error?.message,
      Date.now() - startTime
    );
    
    if (error) {
      return { success: false, error: error.error.message };
    }
    
    return { success: true, action: data!.action };
  }

  async powerOff(serverId: number, serverName?: string): Promise<{ success: boolean; action?: HetznerAction; error?: string }> {
    const startTime = Date.now();
    const stateBefore = { status: 'running' };
    
    const { data, error } = await this.request<{ action: HetznerAction }>('POST', `/servers/${serverId}/actions/poweroff`);
    
    await this.logAuditAction(
      'server:power_off',
      'server',
      'server',
      String(serverId),
      serverName,
      !error,
      stateBefore,
      data ? { status: 'stopping', actionId: data.action.id } : undefined,
      error?.error?.message,
      Date.now() - startTime
    );
    
    if (error) {
      return { success: false, error: error.error.message };
    }
    
    return { success: true, action: data!.action };
  }

  async shutdown(serverId: number, serverName?: string): Promise<{ success: boolean; action?: HetznerAction; error?: string }> {
    const startTime = Date.now();
    const stateBefore = { status: 'running' };
    
    const { data, error } = await this.request<{ action: HetznerAction }>('POST', `/servers/${serverId}/actions/shutdown`);
    
    await this.logAuditAction(
      'server:shutdown',
      'server',
      'server',
      String(serverId),
      serverName,
      !error,
      stateBefore,
      data ? { status: 'shutting_down', actionId: data.action.id } : undefined,
      error?.error?.message,
      Date.now() - startTime
    );
    
    if (error) {
      return { success: false, error: error.error.message };
    }
    
    return { success: true, action: data!.action };
  }

  async reboot(serverId: number, serverName?: string): Promise<{ success: boolean; action?: HetznerAction; error?: string }> {
    const startTime = Date.now();
    const stateBefore = { status: 'running' };
    
    const { data, error } = await this.request<{ action: HetznerAction }>('POST', `/servers/${serverId}/actions/reboot`);
    
    await this.logAuditAction(
      'server:reboot',
      'server',
      'server',
      String(serverId),
      serverName,
      !error,
      stateBefore,
      data ? { status: 'rebooting', actionId: data.action.id } : undefined,
      error?.error?.message,
      Date.now() - startTime
    );
    
    if (error) {
      return { success: false, error: error.error.message };
    }
    
    return { success: true, action: data!.action };
  }

  async reset(serverId: number, serverName?: string): Promise<{ success: boolean; action?: HetznerAction; error?: string }> {
    const startTime = Date.now();
    const stateBefore = { status: 'any' };
    
    const { data, error } = await this.request<{ action: HetznerAction }>('POST', `/servers/${serverId}/actions/reset`);
    
    await this.logAuditAction(
      'server:reset',
      'server',
      'server',
      String(serverId),
      serverName,
      !error,
      stateBefore,
      data ? { status: 'resetting', actionId: data.action.id } : undefined,
      error?.error?.message,
      Date.now() - startTime
    );
    
    if (error) {
      return { success: false, error: error.error.message };
    }
    
    return { success: true, action: data!.action };
  }

  async getMetrics(serverId: number, type: 'cpu' | 'disk' | 'network' = 'cpu', start?: string, end?: string): Promise<{
    metrics: Record<string, any> | null;
    error?: string;
  }> {
    const now = new Date();
    const startDate = start || new Date(now.getTime() - 3600000).toISOString();
    const endDate = end || now.toISOString();
    
    const { data, error } = await this.request<{ metrics: Record<string, any> }>(
      'GET',
      `/servers/${serverId}/metrics?type=${type}&start=${startDate}&end=${endDate}`
    );
    
    if (error) {
      return { metrics: null, error: error.error.message };
    }
    
    return { metrics: data!.metrics };
  }
}

export async function createHetznerClient(
  providerId: string,
  userId: string,
  userEmail?: string,
  userRole: string = 'owner',
  userIp?: string
): Promise<HetznerClient | null> {
  const credential = await storage.getProviderCredentialByProviderId(providerId);
  if (!credential) {
    return null;
  }

  const decryptedToken = cryptoService.decrypt(credential.encryptedToken, credential.salt);
  if (!decryptedToken) {
    return null;
  }

  return new HetznerClient(decryptedToken, providerId, userId, userEmail, userRole, userIp);
}
