import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY || process.env.SESSION_SECRET;
  if (!key) {
    throw new Error('[Encryption] No encryption key found. Set ENCRYPTION_KEY or SESSION_SECRET');
  }
  if (!process.env.ENCRYPTION_KEY) {
    console.warn('[Security Warning] Using SESSION_SECRET for encryption - set separate ENCRYPTION_KEY for production');
  }
  return key;
}

export function encrypt(plaintext: string): string {
  const secret = getEncryptionKey();
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const key = crypto.pbkdf2Sync(secret, salt, ITERATIONS, KEY_LENGTH, 'sha256');
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  return Buffer.concat([
    salt,
    iv,
    tag,
    Buffer.from(encrypted, 'hex')
  ]).toString('base64');
}

export function decrypt(ciphertext: string): string {
  const secret = getEncryptionKey();
  const buffer = Buffer.from(ciphertext, 'base64');
  
  const salt = buffer.subarray(0, SALT_LENGTH);
  const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = buffer.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const encrypted = buffer.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  
  const key = crypto.pbkdf2Sync(secret, salt, ITERATIONS, KEY_LENGTH, 'sha256');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  
  let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 12) return '***';
  return apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4);
}

export function getApiKeyPrefix(apiKey: string): string {
  if (!apiKey || apiKey.length < 10) return '***';
  return apiKey.substring(0, 10);
}
