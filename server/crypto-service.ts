import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const secretKey = process.env.INFRA_CREDENTIALS_SECRET || process.env.SESSION_SECRET || 'default-secret-key-change-in-production';
  return crypto.scryptSync(secretKey, 'salt', KEY_LENGTH);
}

export interface EncryptedData {
  encryptedToken: string;
  tokenIv: string;
  tokenAuthTag: string;
  lastFourChars: string;
  tokenHash: string;
}

export function encryptToken(plainToken: string): EncryptedData {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plainToken, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  const lastFourChars = plainToken.length >= 4 
    ? plainToken.slice(-4) 
    : plainToken;
  
  const tokenHash = crypto.createHash('sha256').update(plainToken).digest('hex');
  
  return {
    encryptedToken: encrypted,
    tokenIv: iv.toString('hex'),
    tokenAuthTag: authTag.toString('hex'),
    lastFourChars,
    tokenHash,
  };
}

export function decryptToken(encryptedData: {
  encryptedToken: string;
  tokenIv: string;
  tokenAuthTag?: string | null;
}): string {
  const key = getEncryptionKey();
  const iv = Buffer.from(encryptedData.tokenIv, 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  
  if (encryptedData.tokenAuthTag) {
    decipher.setAuthTag(Buffer.from(encryptedData.tokenAuthTag, 'hex'));
  }
  
  let decrypted = decipher.update(encryptedData.encryptedToken, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

export function maskToken(lastFourChars: string | null): string {
  if (!lastFourChars) return '********';
  return `****${lastFourChars}`;
}
