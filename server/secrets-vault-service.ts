/**
 * INFERA WebNova - Secrets Vault Service
 * خدمة خزنة الأسرار
 * 
 * Secure secrets management with encryption at rest,
 * access control, and comprehensive audit logging.
 */

import { db } from "./db";
import { eq, and, desc, like, or } from "drizzle-orm";
import { 
  secretsVaultEntries, 
  vaultAuditLog,
  type SecretsVaultEntry,
} from "@shared/schema";
import { randomBytes, createCipheriv, createDecipheriv, scryptSync } from "crypto";

// Encryption configuration
const ENCRYPTION_ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_LENGTH = 32;

// Derive encryption key from master secret
function deriveKey(masterSecret: string, salt: Buffer): Buffer {
  return scryptSync(masterSecret, salt, KEY_LENGTH);
}

// Get master encryption key from environment
function getMasterKey(): string {
  const key = process.env.VAULT_MASTER_KEY || process.env.SESSION_SECRET;
  if (!key) {
    throw new Error("VAULT_MASTER_KEY or SESSION_SECRET must be set");
  }
  return key;
}

// Encrypt secret value - returns encrypted string with embedded IV/salt/authTag
function encryptSecret(plaintext: string): string {
  const salt = randomBytes(SALT_LENGTH);
  const key = deriveKey(getMasterKey(), salt);
  const iv = randomBytes(IV_LENGTH);
  
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, "utf8", "base64");
  encrypted += cipher.final("base64");
  const authTag = cipher.getAuthTag();
  
  // Format: salt:iv:authTag:encrypted
  return `${salt.toString("base64")}:${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted}`;
}

// Decrypt secret value
function decryptSecret(encryptedData: string): string | null {
  try {
    const parts = encryptedData.split(":");
    if (parts.length !== 4) {
      console.error("Invalid encrypted data format");
      return null;
    }
    
    const [saltB64, ivB64, authTagB64, encrypted] = parts;
    const salt = Buffer.from(saltB64, "base64");
    const iv = Buffer.from(ivB64, "base64");
    const authTag = Buffer.from(authTagB64, "base64");
    
    const key = deriveKey(getMasterKey(), salt);
    const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("Failed to decrypt secret:", error);
    return null;
  }
}

// Secret types
type SecretScope = "global" | "organization" | "project" | "environment";
type SecretType = "generic" | "api-key" | "password" | "certificate" | "token";
type RotationPolicy = "none" | "weekly" | "monthly" | "quarterly" | "yearly";

export interface CreateSecretInput {
  name: string;
  path: string;
  value: string;
  scope?: SecretScope;
  secretType?: SecretType;
  projectId?: string;
  environment?: string;
  description?: string;
  rotationPolicy?: RotationPolicy;
  tags?: Record<string, string>;
  allowedServices?: string[];
  allowedRoles?: string[];
  ownerId?: string;
}

export interface UpdateSecretInput {
  value?: string;
  description?: string;
  rotationPolicy?: RotationPolicy;
  rotationEnabled?: boolean;
  tags?: Record<string, string>;
  allowedServices?: string[];
  allowedRoles?: string[];
}

interface AuditContext {
  userId: string;
  userRole?: string;
  serviceId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
}

// Check if user has access to a secret based on allowedRoles
function checkSecretAccess(
  secret: SecretsVaultEntry, 
  context: AuditContext,
  serviceId?: string
): boolean {
  // Owner always has access
  if (secret.ownerId === context.userId) return true;
  
  // ROOT_OWNER, sovereign, owner, and admin roles have full access
  if (context.userRole && ["ROOT_OWNER", "sovereign", "owner", "admin"].includes(context.userRole)) {
    return true;
  }
  
  // Check if user's role is in allowedRoles
  const allowedRoles = secret.allowedRoles || [];
  if (context.userRole && allowedRoles.includes(context.userRole)) {
    return true;
  }
  
  // Check if service is in allowedServices
  if (serviceId) {
    const allowedServices = secret.allowedServices || [];
    if (allowedServices.includes(serviceId)) {
      return true;
    }
  }
  
  return false;
}

// Audit action logging
async function logVaultAction(
  action: string,
  keyId: string | null,
  context: AuditContext,
  success: boolean,
  actionDetail?: string,
  error?: string
): Promise<void> {
  try {
    await db.insert(vaultAuditLog).values({
      userId: context.userId,
      keyId: keyId,
      sessionId: context.sessionId,
      action,
      actionDetail,
      success,
      errorMessage: error,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
  } catch (err) {
    console.error("Failed to log vault audit action:", err);
  }
}

export class SecretsVaultService {
  
  /**
   * Create a new secret
   */
  async createSecret(input: CreateSecretInput, context: AuditContext): Promise<SecretsVaultEntry> {
    // Check for duplicate path
    const existing = await db.query.secretsVaultEntries.findFirst({
      where: eq(secretsVaultEntries.path, input.path),
    });
    
    if (existing) {
      await logVaultAction("create", null, context, false, `Path: ${input.path}`, "Secret path already exists");
      throw new Error(`Secret already exists at path: ${input.path}`);
    }
    
    // Encrypt the secret value
    const encryptedValue = encryptSecret(input.value);
    
    const [secret] = await db.insert(secretsVaultEntries).values({
      name: input.name,
      path: input.path,
      encryptedValue,
      encryptionMethod: ENCRYPTION_ALGORITHM,
      scope: input.scope || "project",
      secretType: input.secretType || "generic",
      projectId: input.projectId,
      environment: input.environment,
      description: input.description,
      rotationPolicy: input.rotationPolicy || "none",
      rotationEnabled: false,
      tags: input.tags || {},
      allowedServices: input.allowedServices || [],
      allowedRoles: input.allowedRoles || [],
      ownerId: input.ownerId || context.userId,
      version: 1,
      accessCount: 0,
    }).returning();
    
    await logVaultAction("create", secret.id, context, true, `Created secret at ${input.path}`);
    
    return secret;
  }
  
  /**
   * Get a secret by path (metadata only)
   */
  async getSecretMetadata(path: string, context: AuditContext): Promise<SecretsVaultEntry | null> {
    const secret = await db.query.secretsVaultEntries.findFirst({
      where: eq(secretsVaultEntries.path, path),
    });
    
    if (!secret) {
      await logVaultAction("view", null, context, false, `Path: ${path}`, "Secret not found");
      return null;
    }
    
    // Check access control
    if (!checkSecretAccess(secret, context, context.serviceId)) {
      await logVaultAction("view", secret.id, context, false, `Path: ${path}`, "Access denied");
      throw new Error("Access denied: insufficient permissions to view this secret");
    }
    
    await logVaultAction("view", secret.id, context, true, `Viewed metadata for ${path}`);
    
    return secret;
  }
  
  /**
   * Get and decrypt a secret value
   */
  async getSecretValue(path: string, context: AuditContext): Promise<string | null> {
    const secret = await db.query.secretsVaultEntries.findFirst({
      where: eq(secretsVaultEntries.path, path),
    });
    
    if (!secret) {
      await logVaultAction("use", null, context, false, `Path: ${path}`, "Secret not found");
      return null;
    }
    
    // Check access control
    if (!checkSecretAccess(secret, context, context.serviceId)) {
      await logVaultAction("use", secret.id, context, false, `Path: ${path}`, "Access denied");
      throw new Error("Access denied: insufficient permissions to read this secret");
    }
    
    const decrypted = decryptSecret(secret.encryptedValue);
    
    if (!decrypted) {
      await logVaultAction("use", secret.id, context, false, `Path: ${path}`, "Decryption failed");
      throw new Error("Failed to decrypt secret");
    }
    
    // Update last accessed
    await db.update(secretsVaultEntries)
      .set({ 
        lastAccessedAt: new Date(),
        lastAccessedBy: context.userId,
        accessCount: (secret.accessCount || 0) + 1 
      })
      .where(eq(secretsVaultEntries.id, secret.id));
    
    await logVaultAction("use", secret.id, context, true, `Accessed secret at ${path}`);
    
    return decrypted;
  }
  
  /**
   * Update a secret
   */
  async updateSecret(path: string, input: UpdateSecretInput, context: AuditContext): Promise<SecretsVaultEntry> {
    const existing = await db.query.secretsVaultEntries.findFirst({
      where: eq(secretsVaultEntries.path, path),
    });
    
    if (!existing) {
      await logVaultAction("update", null, context, false, `Path: ${path}`, "Secret not found");
      throw new Error(`Secret not found at path: ${path}`);
    }
    
    // Check access control
    if (!checkSecretAccess(existing, context, context.serviceId)) {
      await logVaultAction("update", existing.id, context, false, `Path: ${path}`, "Access denied");
      throw new Error("Access denied: insufficient permissions to update this secret");
    }
    
    const updateData: Partial<SecretsVaultEntry> = {
      updatedAt: new Date(),
    };
    
    // Re-encrypt if value is being updated
    if (input.value) {
      const encryptedValue = encryptSecret(input.value);
      
      // Store previous version
      const previousVersions = existing.previousVersions || [];
      previousVersions.push({
        version: existing.version || 1,
        encryptedValue: existing.encryptedValue,
        createdAt: new Date().toISOString(),
      });
      
      Object.assign(updateData, {
        encryptedValue,
        version: (existing.version || 1) + 1,
        previousVersions: previousVersions.slice(-5), // Keep last 5 versions
        lastRotatedAt: new Date(),
      });
    }
    
    if (input.description !== undefined) updateData.description = input.description;
    if (input.rotationPolicy !== undefined) updateData.rotationPolicy = input.rotationPolicy;
    if (input.rotationEnabled !== undefined) updateData.rotationEnabled = input.rotationEnabled;
    if (input.tags !== undefined) updateData.tags = input.tags;
    if (input.allowedServices !== undefined) updateData.allowedServices = input.allowedServices;
    if (input.allowedRoles !== undefined) updateData.allowedRoles = input.allowedRoles;
    
    const [updated] = await db.update(secretsVaultEntries)
      .set(updateData)
      .where(eq(secretsVaultEntries.id, existing.id))
      .returning();
    
    await logVaultAction("update", existing.id, context, true, 
      `Updated secret at ${path}${input.value ? " (rotated)" : ""}`);
    
    return updated;
  }
  
  /**
   * Rotate a secret (create new version)
   */
  async rotateSecret(path: string, newValue: string, context: AuditContext): Promise<SecretsVaultEntry> {
    const result = await this.updateSecret(path, { value: newValue }, context);
    return result;
  }
  
  /**
   * Delete a secret
   */
  async deleteSecret(path: string, context: AuditContext): Promise<boolean> {
    const existing = await db.query.secretsVaultEntries.findFirst({
      where: eq(secretsVaultEntries.path, path),
    });
    
    if (!existing) {
      await logVaultAction("delete", null, context, false, `Path: ${path}`, "Secret not found");
      return false;
    }
    
    // Check access control - only owner or sovereign roles can delete
    if (!checkSecretAccess(existing, context, context.serviceId)) {
      await logVaultAction("delete", existing.id, context, false, `Path: ${path}`, "Access denied");
      throw new Error("Access denied: insufficient permissions to delete this secret");
    }
    
    await db.delete(secretsVaultEntries).where(eq(secretsVaultEntries.id, existing.id));
    
    await logVaultAction("delete", existing.id, context, true, `Deleted secret at ${path}`);
    
    return true;
  }
  
  /**
   * List secrets by scope/project (filtered by access control)
   */
  async listSecrets(
    filters: {
      scope?: SecretScope;
      projectId?: string;
      environment?: string;
      secretType?: SecretType;
      search?: string;
    },
    context: AuditContext
  ): Promise<Omit<SecretsVaultEntry, "encryptedValue" | "previousVersions">[]> {
    const conditions = [];
    
    if (filters.scope) conditions.push(eq(secretsVaultEntries.scope, filters.scope));
    if (filters.projectId) conditions.push(eq(secretsVaultEntries.projectId, filters.projectId));
    if (filters.environment) conditions.push(eq(secretsVaultEntries.environment, filters.environment));
    if (filters.secretType) conditions.push(eq(secretsVaultEntries.secretType, filters.secretType));
    if (filters.search) {
      conditions.push(
        or(
          like(secretsVaultEntries.name, `%${filters.search}%`),
          like(secretsVaultEntries.path, `%${filters.search}%`)
        )!
      );
    }
    
    const allSecrets = await db.query.secretsVaultEntries.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(secretsVaultEntries.createdAt)],
    });
    
    // Filter by access control - only return secrets user has permission to see
    const accessibleSecrets = allSecrets.filter(secret => checkSecretAccess(secret, context, context.serviceId));
    
    await logVaultAction("view", null, context, true, `Listed ${accessibleSecrets.length} secrets (filtered from ${allSecrets.length})`);
    
    // Remove sensitive fields
    return accessibleSecrets.map(({ encryptedValue, previousVersions, ...rest }) => rest);
  }
  
  /**
   * Get secrets requiring rotation
   */
  async getSecretsNeedingRotation(): Promise<SecretsVaultEntry[]> {
    const now = new Date();
    
    const secrets = await db.query.secretsVaultEntries.findMany({
      where: eq(secretsVaultEntries.rotationEnabled, true),
    });
    
    return secrets.filter(secret => {
      if (!secret.rotationPolicy || secret.rotationPolicy === "none") return false;
      if (!secret.lastRotatedAt) return true;
      
      const rotationDue = new Date(secret.lastRotatedAt);
      switch (secret.rotationPolicy) {
        case "weekly": rotationDue.setDate(rotationDue.getDate() + 7); break;
        case "monthly": rotationDue.setMonth(rotationDue.getMonth() + 1); break;
        case "quarterly": rotationDue.setMonth(rotationDue.getMonth() + 3); break;
        case "yearly": rotationDue.setFullYear(rotationDue.getFullYear() + 1); break;
        default: return false;
      }
      
      return rotationDue < now;
    });
  }
  
  /**
   * Get vault statistics
   */
  async getVaultStats(): Promise<{
    totalSecrets: number;
    byScope: Record<string, number>;
    byType: Record<string, number>;
    needingRotation: number;
  }> {
    const secrets = await db.query.secretsVaultEntries.findMany();
    
    const byScope: Record<string, number> = {};
    const byType: Record<string, number> = {};
    
    for (const secret of secrets) {
      const scope = secret.scope || "project";
      const secretType = secret.secretType || "generic";
      byScope[scope] = (byScope[scope] || 0) + 1;
      byType[secretType] = (byType[secretType] || 0) + 1;
    }
    
    const needingRotation = (await this.getSecretsNeedingRotation()).length;
    
    return {
      totalSecrets: secrets.length,
      byScope,
      byType,
      needingRotation,
    };
  }
}

export const secretsVaultService = new SecretsVaultService();
