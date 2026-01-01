import { Router, Request, Response } from 'express';
import { Client, ClientChannel } from 'ssh2';
import crypto from 'crypto';

const router = Router();

const ENCRYPTION_KEY = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const IV_LENGTH = 16;

function encrypt(text: string): string {
  if (!ENCRYPTION_KEY) return text;
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text: string): string {
  if (!ENCRYPTION_KEY || !text.includes(':')) return text;
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = textParts.join(':');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function sanitizeCommand(command: string): string {
  const dangerousPatterns = [
    /;\s*rm\s+-rf/i,
    /&&\s*rm\s+-rf/i,
    /\|\s*rm\s+-rf/i,
    /`[^`]*rm[^`]*`/i,
    /\$\([^)]*rm[^)]*\)/i,
    />\s*\/dev\/sd/i,
    /mkfs\./i,
    /dd\s+if=/i,
    /:\(\)\{/,
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(command)) {
      throw new Error('Potentially dangerous command detected');
    }
  }
  
  return command;
}

function validateHost(host: string): boolean {
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  const hostnamePattern = /^[a-zA-Z0-9][a-zA-Z0-9.-]*[a-zA-Z0-9]$/;
  return ipv4Pattern.test(host) || hostnamePattern.test(host);
}

function validatePath(path: string): boolean {
  const validPathPattern = /^\/[a-zA-Z0-9._\/-]+$/;
  return validPathPattern.test(path) && !path.includes('..');
}

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW = 60000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT) {
    return false;
  }
  
  record.count++;
  return true;
}

interface DeployConfig {
  serverHost: string;
  sshPort: number;
  sshUser: string;
  repositoryPath: string;
  deployPath: string;
  privateKey: string;
  postDeployCommand: string;
  restartService: boolean;
  serviceName: string;
  type: 'quick' | 'direct';
}

interface SSHConnectionConfig {
  host: string;
  port: number;
  username: string;
  privateKey: string;
}

function executeSSHCommand(config: SSHConnectionConfig, command: string): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    let stdout = '';
    let stderr = '';

    conn.on('ready', () => {
      conn.exec(command, (err: Error | undefined, stream: ClientChannel) => {
        if (err) {
          conn.end();
          reject(err);
          return;
        }

        stream.on('close', (code: number) => {
          conn.end();
          if (code === 0) {
            resolve({ stdout, stderr });
          } else {
            reject(new Error(`Command exited with code ${code}: ${stderr || stdout}`));
          }
        });

        stream.on('data', (data: Buffer) => {
          stdout += data.toString();
        });

        stream.stderr.on('data', (data: Buffer) => {
          stderr += data.toString();
        });
      });
    });

    conn.on('error', (err: Error) => {
      reject(err);
    });

    conn.connect({
      host: config.host,
      port: config.port,
      username: config.username,
      privateKey: config.privateKey,
    });
  });
}

router.post('/test-connection', async (req: Request, res: Response) => {
  try {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. Please wait before trying again.',
      });
    }

    const { host, port, username, privateKey } = req.body;

    if (!host || !privateKey) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: host and privateKey are required',
      });
    }

    if (!validateHost(host)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid host format',
      });
    }

    const config: SSHConnectionConfig = {
      host,
      port: port || 22,
      username: username || 'root',
      privateKey,
    };

    const result = await executeSSHCommand(config, 'echo "Connection successful" && uname -a');
    
    res.json({
      success: true,
      message: 'SSH connection test passed',
      systemInfo: result.stdout.trim(),
    });
  } catch (error) {
    console.error('[Deploy] SSH connection test failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Connection failed',
    });
  }
});

router.post('/execute', async (req: Request, res: Response) => {
  try {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. Please wait before trying again.',
      });
    }

    const config: DeployConfig = req.body;

    if (!config.serverHost || !config.privateKey || !config.deployPath) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: serverHost, privateKey, and deployPath are required',
      });
    }

    if (!validateHost(config.serverHost)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid host format',
      });
    }

    if (!validatePath(config.deployPath)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid deploy path format',
      });
    }

    const sshConfig: SSHConnectionConfig = {
      host: config.serverHost,
      port: config.sshPort || 22,
      username: config.sshUser || 'root',
      privateKey: config.privateKey,
    };

    const commands: string[] = [];

    if (config.type === 'quick' && config.repositoryPath) {
      commands.push(`cd ${config.deployPath}`);
      commands.push('git fetch origin');
      commands.push('git reset --hard origin/main || git reset --hard origin/master');
    }

    if (config.postDeployCommand) {
      const sanitizedCommand = sanitizeCommand(config.postDeployCommand);
      commands.push(`cd ${config.deployPath}`);
      commands.push(sanitizedCommand);
    }

    if (config.restartService && config.serviceName) {
      const sanitizedServiceName = config.serviceName.replace(/[^a-zA-Z0-9_-]/g, '');
      commands.push(`sudo systemctl restart ${sanitizedServiceName}`);
    }

    if (commands.length === 0) {
      commands.push(`cd ${config.deployPath} && echo "Deployment path verified"`);
    }

    const fullCommand = commands.join(' && ');
    console.log('[Deploy] Executing deployment for:', config.serverHost);

    const result = await executeSSHCommand(sshConfig, fullCommand);
    
    res.json({
      success: true,
      message: 'Deployment completed successfully',
      output: result.stdout,
      type: config.type,
    });
  } catch (error) {
    console.error('[Deploy] Deployment failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Deployment failed',
    });
  }
});

router.get('/status', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'Deploy service is running',
    version: '1.0.0',
  });
});

export default router;
