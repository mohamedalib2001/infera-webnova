import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

// Get encryption key from environment (SESSION_SECRET as base)
function getEncryptionKey(): Buffer {
  const secret = process.env.SESSION_SECRET || 'default-secret-key-for-development';
  // Derive a 32-byte key using SHA-256
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypt sensitive data using AES-256-GCM
 * Returns base64-encoded string containing: iv + authTag + ciphertext
 */
export function encryptCredential(plaintext: string): string {
  if (!plaintext) return '';
  
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  const authTag = cipher.getAuthTag();
  
  // Combine: iv (16 bytes) + authTag (16 bytes) + ciphertext
  const result = Buffer.concat([iv, authTag, encrypted]);
  return result.toString('base64');
}

/**
 * Decrypt sensitive data encrypted with AES-256-GCM
 */
export function decryptCredential(encryptedBase64: string): string {
  if (!encryptedBase64) return '';
  
  try {
    const key = getEncryptionKey();
    const data = Buffer.from(encryptedBase64, 'base64');
    
    // Extract: iv (16 bytes) + authTag (16 bytes) + ciphertext
    const iv = data.subarray(0, IV_LENGTH);
    const authTag = data.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const ciphertext = data.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(ciphertext);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('[Crypto] Decryption failed:', error);
    return '';
  }
}

/**
 * Check if a value is encrypted (basic validation)
 */
export function isEncrypted(value: string | null | undefined): boolean {
  if (!value) return false;
  try {
    const data = Buffer.from(value, 'base64');
    // Minimum size: IV + authTag = 32 bytes
    return data.length >= 32;
  } catch {
    return false;
  }
}
