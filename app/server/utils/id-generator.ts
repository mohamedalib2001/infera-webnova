import { randomBytes } from 'crypto';

/**
 * Generate a cryptographically secure unique ID
 * Uses crypto.randomBytes instead of Math.random (which is forbidden)
 */
export function generateSecureId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const randomPart = randomBytes(8).toString('hex');
  return prefix ? `${prefix}_${timestamp}_${randomPart}` : `${timestamp}_${randomPart}`;
}

/**
 * Generate a short secure ID (12 characters)
 */
export function generateShortId(): string {
  return randomBytes(6).toString('hex');
}

/**
 * Generate a UUID v4 using crypto
 */
export function generateUUID(): string {
  const bytes = randomBytes(16);
  // Set version to 4
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  // Set variant to RFC 4122
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  
  const hex = bytes.toString('hex');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32)
  ].join('-');
}

/**
 * Generate a secure 6-digit OTP code
 */
export function generateSecureOTP(): string {
  const buffer = randomBytes(4);
  const num = buffer.readUInt32BE(0) % 900000 + 100000;
  return num.toString();
}

/**
 * Generate a build job ID
 */
export function generateBuildId(): string {
  return generateSecureId('build');
}

/**
 * Generate a pipeline ID
 */
export function generatePipelineId(): string {
  return generateSecureId('pipeline');
}

/**
 * Generate a pipeline run ID
 */
export function generateRunId(): string {
  return generateSecureId('run');
}

/**
 * Generate a deployment ID
 */
export function generateDeploymentId(): string {
  return generateSecureId('deploy');
}
