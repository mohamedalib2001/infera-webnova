import { Router, Request, Response, NextFunction } from "express";
import { db } from "./db";
import { sshVault, vaultAccessSessions, vaultAuditLog, users } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { authenticator } from "otplib";

const router = Router();

const ENCRYPTION_ALGORITHM = "aes-256-gcm";
const SALT_LENGTH = 32;
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const VAULT_SESSION_DURATION = 15 * 60 * 1000; // 15 minutes

function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, 100000, 32, "sha512");
}

function encrypt(text: string, masterPassword: string): { encrypted: string; salt: string; iv: string } {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = deriveKey(masterPassword, salt);
  
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted: encrypted + ":" + authTag.toString("base64"),
    salt: salt.toString("base64"),
    iv: iv.toString("base64"),
  };
}

function decrypt(encryptedData: string, salt: string, iv: string, masterPassword: string): string {
  const [encrypted, authTagBase64] = encryptedData.split(":");
  const saltBuffer = Buffer.from(salt, "base64");
  const ivBuffer = Buffer.from(iv, "base64");
  const key = deriveKey(masterPassword, saltBuffer);
  const authTag = Buffer.from(authTagBase64, "base64");
  
  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, ivBuffer);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, "base64", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}

function generateFingerprint(publicKey: string): string {
  const hash = crypto.createHash("sha256").update(publicKey).digest();
  return "SHA256:" + hash.toString("base64").replace(/=+$/, "");
}

async function requireSovereignRole(req: Request, res: Response, next: NextFunction) {
  // Check session-based auth first (used by main app)
  const userId = (req.session as any)?.userId;
  
  if (!userId) {
    console.log("[SSH Vault] No userId in session");
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  // Fetch user from database to get role
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  
  if (!user) {
    console.log("[SSH Vault] User not found in database");
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  const role = user.role;
  console.log(`[SSH Vault] User ${user.username} with role ${role} accessing vault`);
  
  if (!["sovereign", "owner"].includes(role || "")) {
    return res.status(403).json({ error: "Sovereign access required" });
  }
  
  // Attach user to request for downstream use
  (req as any).user = user;
  next();
}

async function requireVaultSession(req: Request, res: Response, next: NextFunction) {
  // Session token must be passed via secure header only
  const sessionToken = req.headers["x-vault-session"] as string;
  if (!sessionToken) {
    return res.status(401).json({ error: "Vault session required", requireAuth: true });
  }
  
  const hashedToken = crypto.createHash("sha256").update(sessionToken).digest("hex");
  const session = await db.select().from(vaultAccessSessions)
    .where(and(
      eq(vaultAccessSessions.sessionToken, hashedToken),
      eq(vaultAccessSessions.isActive, true),
      eq(vaultAccessSessions.isFullyAuthenticated, true)
    ))
    .limit(1);
  
  if (!session.length || new Date(session[0].expiresAt) < new Date()) {
    return res.status(401).json({ error: "Vault session expired", requireAuth: true });
  }
  
  (req as any).vaultSession = session[0];
  await db.update(vaultAccessSessions)
    .set({ lastActivityAt: new Date() })
    .where(eq(vaultAccessSessions.id, session[0].id));
  
  next();
}

async function logVaultAction(
  userId: string, 
  action: string, 
  success: boolean, 
  req: Request,
  keyId?: string,
  sessionId?: string,
  errorMessage?: string
) {
  await db.insert(vaultAuditLog).values({
    userId,
    keyId,
    sessionId,
    action,
    actionDetail: `${req.method} ${req.path}`,
    ipAddress: req.ip || req.socket.remoteAddress,
    userAgent: req.headers["user-agent"],
    success,
    errorMessage,
  });
}

router.post("/auth/start", requireSovereignRole, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { password } = req.body;
    
    console.log(`[SSH Vault] Auth attempt for user ${userId}`);
    
    if (!password) {
      console.log(`[SSH Vault] No password provided`);
      return res.status(400).json({ error: "Password required" });
    }
    
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user.length || !user[0].password) {
      console.log(`[SSH Vault] User not found or no password set for ${userId}`);
      return res.status(400).json({ error: "User not found or no password set" });
    }
    
    console.log(`[SSH Vault] Comparing password for user ${user[0].username}, has stored password: ${!!user[0].password}`);
    const passwordValid = await bcrypt.compare(password, user[0].password);
    console.log(`[SSH Vault] Password valid: ${passwordValid}`);
    
    if (!passwordValid) {
      await logVaultAction(userId, "auth_attempt", false, req, undefined, undefined, "Invalid password");
      return res.status(401).json({ error: "Invalid password" });
    }
    
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    const emailCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedEmailCode = crypto.createHash("sha256").update(emailCode).digest("hex");
    
    const [session] = await db.insert(vaultAccessSessions).values({
      userId,
      sessionToken: hashedToken,
      passwordVerified: true,
      passwordVerifiedAt: new Date(),
      emailCode: hashedEmailCode,
      emailCodeExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      expiresAt: new Date(Date.now() + VAULT_SESSION_DURATION),
    }).returning();
    
    // Note: In production, send email code via secure email service
    // console.log for development only - NEVER log sensitive codes in production
    
    await logVaultAction(userId, "auth_password", true, req, undefined, session.id);
    
    const hasTOTP = user[0].twoFactorEnabled;
    
    res.json({
      sessionToken: rawToken,
      nextStep: hasTOTP ? "totp" : "email_code",
      emailHint: user[0].email ? user[0].email.replace(/(.{2})(.*)(@.*)/, "$1***$3") : undefined,
    });
  } catch (error) {
    console.error("Vault auth start error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
});

router.post("/auth/verify-totp", requireSovereignRole, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { sessionToken, totpCode } = req.body;
    
    if (!sessionToken || !totpCode) {
      return res.status(400).json({ error: "Session token and TOTP code required" });
    }
    
    const hashedToken = crypto.createHash("sha256").update(sessionToken).digest("hex");
    const session = await db.select().from(vaultAccessSessions)
      .where(and(
        eq(vaultAccessSessions.sessionToken, hashedToken),
        eq(vaultAccessSessions.userId, userId),
        eq(vaultAccessSessions.isActive, true)
      ))
      .limit(1);
    
    if (!session.length) {
      return res.status(401).json({ error: "Invalid session" });
    }
    
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user.length || !user[0].twoFactorSecret) {
      return res.status(400).json({ error: "2FA not configured" });
    }
    
    const isValid = authenticator.verify({ token: totpCode, secret: user[0].twoFactorSecret });
    if (!isValid) {
      await logVaultAction(userId, "auth_totp", false, req, undefined, session[0].id, "Invalid TOTP");
      return res.status(401).json({ error: "Invalid TOTP code" });
    }
    
    await db.update(vaultAccessSessions)
      .set({ 
        totpVerified: true,
        totpVerifiedAt: new Date()
      })
      .where(eq(vaultAccessSessions.id, session[0].id));
    
    await logVaultAction(userId, "auth_totp", true, req, undefined, session[0].id);
    
    res.json({ nextStep: "email_code" });
  } catch (error) {
    console.error("Vault TOTP verify error:", error);
    res.status(500).json({ error: "Verification failed" });
  }
});

router.post("/auth/verify-email", requireSovereignRole, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { sessionToken, emailCode } = req.body;
    
    if (!sessionToken || !emailCode) {
      return res.status(400).json({ error: "Session token and email code required" });
    }
    
    const hashedToken = crypto.createHash("sha256").update(sessionToken).digest("hex");
    const hashedEmailCode = crypto.createHash("sha256").update(emailCode).digest("hex");
    
    const session = await db.select().from(vaultAccessSessions)
      .where(and(
        eq(vaultAccessSessions.sessionToken, hashedToken),
        eq(vaultAccessSessions.userId, userId),
        eq(vaultAccessSessions.isActive, true)
      ))
      .limit(1);
    
    if (!session.length) {
      return res.status(401).json({ error: "Invalid session" });
    }
    
    if (session[0].emailCode !== hashedEmailCode) {
      await logVaultAction(userId, "auth_email", false, req, undefined, session[0].id, "Invalid email code");
      return res.status(401).json({ error: "Invalid email code" });
    }
    
    if (session[0].emailCodeExpiresAt && new Date(session[0].emailCodeExpiresAt) < new Date()) {
      return res.status(401).json({ error: "Email code expired" });
    }
    
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const hasTOTP = user[0]?.twoFactorEnabled;
    
    if (hasTOTP && !session[0].totpVerified) {
      return res.status(400).json({ error: "TOTP verification required first" });
    }
    
    await db.update(vaultAccessSessions)
      .set({ 
        emailCodeVerified: true,
        emailCodeVerifiedAt: new Date(),
        isFullyAuthenticated: true,
        expiresAt: new Date(Date.now() + VAULT_SESSION_DURATION)
      })
      .where(eq(vaultAccessSessions.id, session[0].id));
    
    await logVaultAction(userId, "auth_complete", true, req, undefined, session[0].id);
    
    res.json({ authenticated: true, expiresIn: VAULT_SESSION_DURATION / 1000 });
  } catch (error) {
    console.error("Vault email verify error:", error);
    res.status(500).json({ error: "Verification failed" });
  }
});

router.post("/auth/logout", requireSovereignRole, async (req, res) => {
  try {
    const sessionToken = (req.headers["x-vault-session"] as string) || req.body?.sessionToken;
    if (sessionToken) {
      const hashedToken = crypto.createHash("sha256").update(sessionToken).digest("hex");
      await db.update(vaultAccessSessions)
        .set({ isActive: false })
        .where(eq(vaultAccessSessions.sessionToken, hashedToken));
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Logout failed" });
  }
});

router.get("/keys", requireSovereignRole, requireVaultSession, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const keys = await db.select({
      id: sshVault.id,
      name: sshVault.name,
      description: sshVault.description,
      serverHost: sshVault.serverHost,
      serverPort: sshVault.serverPort,
      serverUsername: sshVault.serverUsername,
      keyType: sshVault.keyType,
      keyFingerprint: sshVault.keyFingerprint,
      accessLevel: sshVault.accessLevel,
      lastUsedAt: sshVault.lastUsedAt,
      usageCount: sshVault.usageCount,
      expiresAt: sshVault.expiresAt,
      isActive: sshVault.isActive,
      isRevoked: sshVault.isRevoked,
      tags: sshVault.tags,
      createdAt: sshVault.createdAt,
    }).from(sshVault)
      .where(eq(sshVault.userId, userId))
      .orderBy(desc(sshVault.createdAt));
    
    await logVaultAction(userId, "list_keys", true, req, undefined, (req as any).vaultSession?.id);
    
    res.json({ keys });
  } catch (error) {
    console.error("List keys error:", error);
    res.status(500).json({ error: "Failed to list keys" });
  }
});

router.post("/keys", requireSovereignRole, requireVaultSession, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { 
      name, description, serverHost, serverPort, serverUsername,
      privateKey, publicKey, passphrase, keyType, tags, expiresAt,
      masterPassword
    } = req.body;
    
    if (!name || !privateKey || !masterPassword) {
      return res.status(400).json({ error: "Name, private key, and master password required" });
    }
    
    const encryptedPrivate = encrypt(privateKey, masterPassword);
    const encryptedPublic = publicKey ? encrypt(publicKey, masterPassword) : null;
    const encryptedPass = passphrase ? encrypt(passphrase, masterPassword) : null;
    
    const fingerprint = publicKey ? generateFingerprint(publicKey) : null;
    
    const [newKey] = await db.insert(sshVault).values({
      userId,
      name,
      description,
      serverHost,
      serverPort: serverPort || 22,
      serverUsername,
      keyType: keyType || "ed25519",
      keyFingerprint: fingerprint,
      encryptedPrivateKey: encryptedPrivate.encrypted,
      encryptedPublicKey: encryptedPublic?.encrypted,
      encryptedPassphrase: encryptedPass?.encrypted,
      encryptionSalt: encryptedPrivate.salt,
      encryptionIV: encryptedPrivate.iv,
      tags: tags || [],
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    }).returning();
    
    await logVaultAction(userId, "create_key", true, req, newKey.id, (req as any).vaultSession?.id);
    
    res.json({ 
      key: {
        id: newKey.id,
        name: newKey.name,
        keyFingerprint: newKey.keyFingerprint,
        createdAt: newKey.createdAt,
      }
    });
  } catch (error) {
    console.error("Create key error:", error);
    res.status(500).json({ error: "Failed to create key" });
  }
});

router.get("/keys/:id", requireSovereignRole, requireVaultSession, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { id } = req.params;
    const { masterPassword, includePrivate } = req.query;
    
    const key = await db.select().from(sshVault)
      .where(and(eq(sshVault.id, id), eq(sshVault.userId, userId)))
      .limit(1);
    
    if (!key.length) {
      return res.status(404).json({ error: "Key not found" });
    }
    
    const keyData = key[0];
    let decryptedPrivate = undefined;
    let decryptedPublic = undefined;
    let decryptedPassphrase = undefined;
    
    if (includePrivate === "true" && masterPassword) {
      try {
        decryptedPrivate = decrypt(
          keyData.encryptedPrivateKey,
          keyData.encryptionSalt,
          keyData.encryptionIV,
          masterPassword as string
        );
        if (keyData.encryptedPublicKey) {
          decryptedPublic = decrypt(
            keyData.encryptedPublicKey,
            keyData.encryptionSalt,
            keyData.encryptionIV,
            masterPassword as string
          );
        }
        if (keyData.encryptedPassphrase) {
          decryptedPassphrase = decrypt(
            keyData.encryptedPassphrase,
            keyData.encryptionSalt,
            keyData.encryptionIV,
            masterPassword as string
          );
        }
      } catch (e) {
        await logVaultAction(userId, "decrypt_key", false, req, id, (req as any).vaultSession?.id, "Decryption failed");
        return res.status(401).json({ error: "Invalid master password" });
      }
    }
    
    await db.update(sshVault)
      .set({ 
        lastUsedAt: new Date(),
        usageCount: (keyData.usageCount || 0) + 1
      })
      .where(eq(sshVault.id, id));
    
    await logVaultAction(userId, includePrivate === "true" ? "view_private_key" : "view_key", true, req, id, (req as any).vaultSession?.id);
    
    res.json({
      key: {
        id: keyData.id,
        name: keyData.name,
        description: keyData.description,
        serverHost: keyData.serverHost,
        serverPort: keyData.serverPort,
        serverUsername: keyData.serverUsername,
        keyType: keyData.keyType,
        keyFingerprint: keyData.keyFingerprint,
        accessLevel: keyData.accessLevel,
        lastUsedAt: keyData.lastUsedAt,
        usageCount: keyData.usageCount,
        expiresAt: keyData.expiresAt,
        isActive: keyData.isActive,
        isRevoked: keyData.isRevoked,
        tags: keyData.tags,
        createdAt: keyData.createdAt,
        ...(decryptedPrivate && { privateKey: decryptedPrivate }),
        ...(decryptedPublic && { publicKey: decryptedPublic }),
        ...(decryptedPassphrase && { passphrase: decryptedPassphrase }),
      }
    });
  } catch (error) {
    console.error("Get key error:", error);
    res.status(500).json({ error: "Failed to get key" });
  }
});

router.delete("/keys/:id", requireSovereignRole, requireVaultSession, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { id } = req.params;
    
    const key = await db.select().from(sshVault)
      .where(and(eq(sshVault.id, id), eq(sshVault.userId, userId)))
      .limit(1);
    
    if (!key.length) {
      return res.status(404).json({ error: "Key not found" });
    }
    
    await db.delete(sshVault).where(eq(sshVault.id, id));
    
    await logVaultAction(userId, "delete_key", true, req, id, (req as any).vaultSession?.id);
    
    res.json({ success: true });
  } catch (error) {
    console.error("Delete key error:", error);
    res.status(500).json({ error: "Failed to delete key" });
  }
});

router.post("/keys/:id/revoke", requireSovereignRole, requireVaultSession, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { id } = req.params;
    const { reason } = req.body;
    
    const key = await db.select().from(sshVault)
      .where(and(eq(sshVault.id, id), eq(sshVault.userId, userId)))
      .limit(1);
    
    if (!key.length) {
      return res.status(404).json({ error: "Key not found" });
    }
    
    await db.update(sshVault)
      .set({
        isRevoked: true,
        isActive: false,
        revokedAt: new Date(),
        revokedBy: userId,
        revokedReason: reason,
      })
      .where(eq(sshVault.id, id));
    
    await logVaultAction(userId, "revoke_key", true, req, id, (req as any).vaultSession?.id);
    
    res.json({ success: true });
  } catch (error) {
    console.error("Revoke key error:", error);
    res.status(500).json({ error: "Failed to revoke key" });
  }
});

router.get("/audit", requireSovereignRole, requireVaultSession, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { limit = 50 } = req.query;
    
    const logs = await db.select().from(vaultAuditLog)
      .where(eq(vaultAuditLog.userId, userId))
      .orderBy(desc(vaultAuditLog.createdAt))
      .limit(Number(limit));
    
    res.json({ logs });
  } catch (error) {
    console.error("Get audit log error:", error);
    res.status(500).json({ error: "Failed to get audit log" });
  }
});

router.post("/generate", requireSovereignRole, requireVaultSession, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { category, keyType = "ed25519", keyName } = req.body;
    
    const validCategories = ["sovereign", "production", "development", "deployment", "infrastructure", "maintenance", "emergency"];
    if (category && !validCategories.includes(category)) {
      return res.status(400).json({ error: "Invalid key category" });
    }
    
    const cryptoModule = await import("crypto");
    const { generateKeyPairSync, createPublicKey } = cryptoModule;
    
    const { publicKey, privateKey } = generateKeyPairSync("ed25519");
    
    const privateKeyPem = privateKey.export({ type: "pkcs8", format: "pem" }) as string;
    
    const publicKeyDer = publicKey.export({ type: "spki", format: "der" }) as Buffer;
    const ed25519RawPublicKey = publicKeyDer.slice(-32);
    
    const keyTypeBuffer = Buffer.from([0, 0, 0, 11]);
    const keyTypeString = Buffer.from("ssh-ed25519");
    const keyLengthBuffer = Buffer.alloc(4);
    keyLengthBuffer.writeUInt32BE(32, 0);
    
    const sshPublicKeyBlob = Buffer.concat([
      keyTypeBuffer,
      keyTypeString,
      keyLengthBuffer,
      ed25519RawPublicKey
    ]);
    
    const sshPublicKeyBase64 = sshPublicKeyBlob.toString("base64");
    const comment = `${keyName || category || "infera"}-key@infera-webnova`;
    const sshPublicKey = `ssh-ed25519 ${sshPublicKeyBase64} ${comment}`;
    
    const fingerprint = generateFingerprint(sshPublicKeyBase64);
    
    await logVaultAction(userId, "generate_key", true, req, undefined, (req as any).vaultSession?.id);
    
    res.json({
      success: true,
      publicKey: sshPublicKey,
      privateKey: privateKeyPem,
      fingerprint,
      category: category || "general",
      keyType,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Generate key error:", error);
    const userId = (req.user as any)?.id;
    if (userId) {
      await logVaultAction(userId, "generate_key", false, req, undefined, (req as any).vaultSession?.id, (error as Error).message);
    }
    res.status(500).json({ error: "Failed to generate SSH key pair" });
  }
});

export default router;
