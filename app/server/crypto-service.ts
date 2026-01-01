import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_LENGTH = 16;

function getEncryptionKey(salt: Buffer): Buffer {
  const secretKey = process.env.INFRA_CREDENTIALS_SECRET || process.env.SESSION_SECRET;
  
  if (!secretKey) {
    throw new Error('INFRA_CREDENTIALS_SECRET or SESSION_SECRET environment variable is required for credential encryption');
  }
  
  return crypto.scryptSync(secretKey, salt, KEY_LENGTH);
}

export function isCustomEncryptionEnabled(): boolean {
  return !!process.env.INFRA_CREDENTIALS_SECRET;
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

// ==================== NOVA AI CONVERSATION ENCRYPTION ====================
// نظام تشفير محادثات Nova AI

interface ConversationEncryptionResult {
  encryptedContent: string;
  iv: string;
  authTag: string;
  salt: string;
}

interface ConversationDecryptionInput {
  encryptedContent: string;
  iv: string;
  authTag: string;
  salt: string;
}

function getConversationKey(salt: Buffer): Buffer {
  const secretKey = process.env.SESSION_SECRET;
  if (!secretKey) {
    throw new Error('SESSION_SECRET environment variable is required for conversation encryption');
  }
  return crypto.scryptSync(secretKey, salt, KEY_LENGTH);
}

export function encryptConversationMessage(plaintext: string): ConversationEncryptionResult {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = getConversationKey(salt);
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encryptedContent: encrypted,
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    salt: salt.toString('base64'),
  };
}

export function decryptConversationMessage(input: ConversationDecryptionInput): string {
  const salt = Buffer.from(input.salt, 'base64');
  const key = getConversationKey(salt);
  const iv = Buffer.from(input.iv, 'base64');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(Buffer.from(input.authTag, 'base64'));
  
  let decrypted = decipher.update(input.encryptedContent, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

export function encryptConversationObject(obj: any): string {
  const json = JSON.stringify(obj);
  const result = encryptConversationMessage(json);
  return JSON.stringify(result);
}

export function decryptConversationObject<T>(encryptedString: string): T {
  const input = JSON.parse(encryptedString) as ConversationDecryptionInput;
  const json = decryptConversationMessage(input);
  return JSON.parse(json);
}

export function generateSessionId(): string {
  return `session_${crypto.randomBytes(16).toString('hex')}_${Date.now()}`;
}

export function generateKeyId(): string {
  return `key_${crypto.randomBytes(12).toString('hex')}_${Date.now()}`;
}

export function hashForSearch(text: string): string {
  const normalized = text.toLowerCase().trim();
  return crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 16);
}

export function extractKeywords(text: string): string[] {
  const words = text.split(/\s+/).filter(word => word.length > 2);
  const stopWords = new Set([
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'was', 'this', 'that', 'with',
    'من', 'في', 'على', 'إلى', 'عن', 'مع', 'هذا', 'هذه', 'التي', 'الذي', 'أن', 'ان', 'كان', 'وهو'
  ]);
  return words.filter(word => !stopWords.has(word.toLowerCase()));
}

export function hashKeywords(text: string): string[] {
  const keywords = extractKeywords(text);
  return keywords.map(kw => hashForSearch(kw));
}

export function detectLanguage(text: string): 'ar' | 'en' | 'mixed' {
  const arabicPattern = /[\u0600-\u06FF]/;
  const englishPattern = /[a-zA-Z]/;
  
  const hasArabic = arabicPattern.test(text);
  const hasEnglish = englishPattern.test(text);
  
  if (hasArabic && hasEnglish) return 'mixed';
  if (hasArabic) return 'ar';
  return 'en';
}

export type { ConversationEncryptionResult, ConversationDecryptionInput };
