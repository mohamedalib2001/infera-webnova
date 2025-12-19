import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_LENGTH = 16;

function getEncryptionKey(salt: Buffer): Buffer {
  const secretKey = process.env.INFRA_CREDENTIALS_SECRET;
  
  if (!secretKey) {
    throw new Error('INFRA_CREDENTIALS_SECRET environment variable is required for credential encryption');
  }
  
  return crypto.scryptSync(secretKey, salt, KEY_LENGTH);
}

export interface EncryptedData {
  encryptedToken: string;
  tokenIv: string;
  tokenAuthTag: string;
  tokenSalt: string;
  lastFourChars: string;
  tokenHash: string;
}

export function encryptToken(plainToken: string): EncryptedData {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = getEncryptionKey(salt);
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
    tokenSalt: salt.toString('hex'),
    lastFourChars,
    tokenHash,
  };
}

export function decryptToken(encryptedData: {
  encryptedToken: string;
  tokenIv: string;
  tokenAuthTag?: string | null;
  tokenSalt?: string | null;
}): string {
  if (!encryptedData.tokenSalt) {
    throw new Error('Token salt is required for decryption');
  }
  
  const salt = Buffer.from(encryptedData.tokenSalt, 'hex');
  const key = getEncryptionKey(salt);
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
