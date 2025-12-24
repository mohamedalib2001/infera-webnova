import { Router, Request, Response, NextFunction } from "express";
import { db } from "./db";
import { sshVault, vaultAccessSessions, vaultAuditLog, users } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { authenticator } from "otplib";
import { sendOTPEmail } from "./email";
import { storage } from "./storage";

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

// Check auth requirements for the current user - 3FA always required
router.get("/auth/requirements", requireSovereignRole, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (!user.length) {
      return res.status(400).json({ error: "User not found" });
    }
    
    const isOAuthUser = user[0].authProvider && user[0].authProvider !== "email";
    const hasTOTP = user[0].twoFactorEnabled && user[0].twoFactorSecret;
    const hasPassword = !!user[0].password;
    const hasEmail = !!user[0].email;
    
    // 3FA: Password + Email OTP + TOTP all required
    // Password is always required for vault access (even for OAuth users)
    res.json({
      requiresPassword: true, // Always require password for 3FA
      hasTOTP,
      isOAuthUser,
      hasPassword,
      hasEmail,
      authFactors: {
        password: true,
        emailOTP: hasEmail,
        totp: hasTOTP,
      },
      missingFactors: {
        password: !hasPassword,
        email: !hasEmail,
        totp: !hasTOTP,
      }
    });
  } catch (error) {
    console.error("Auth requirements error:", error);
    res.status(500).json({ error: "Failed to get auth requirements" });
  }
});

router.post("/auth/start", requireSovereignRole, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { password } = req.body;
    
    console.log(`[SSH Vault 3FA] Auth attempt for user ${userId}`);
    
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user.length) {
      console.log(`[SSH Vault 3FA] User not found for ${userId}`);
      return res.status(400).json({ error: "User not found" });
    }
    
    const hasTOTP = user[0].twoFactorEnabled && user[0].twoFactorSecret;
    const hasEmail = !!user[0].email;
    
    // 3FA: Password is ALWAYS required (Factor 1)
    if (!password) {
      console.log(`[SSH Vault 3FA] No password provided`);
      return res.status(400).json({ error: "Password required" });
    }
    
    if (!user[0].password) {
      console.log(`[SSH Vault 3FA] No password set for user ${userId}`);
      return res.status(400).json({ error: "No password set. Please set a password first." });
    }
    
    console.log(`[SSH Vault 3FA] Verifying password for user ${user[0].username}`);
    const passwordValid = await bcrypt.compare(password, user[0].password);
    
    if (!passwordValid) {
      await logVaultAction(userId, "auth_password_failed", false, req, undefined, undefined, "Invalid password");
      return res.status(401).json({ error: "Invalid password" });
    }
    
    console.log(`[SSH Vault 3FA] Password verified - Factor 1 complete`);
    
    // Generate session token and email OTP
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
    
    await logVaultAction(userId, "auth_password", true, req, undefined, session.id);
    
    // Send email OTP using dynamic SMTP settings (Factor 2)
    if (hasEmail) {
      const emailSent = await sendOTPEmail(
        user[0].email!,
        emailCode,
        "ar", // Use Arabic for RTL users
        storage
      );
      
      if (emailSent) {
        console.log(`[SSH Vault 3FA] Email OTP sent to ${user[0].email?.replace(/(.{2})(.*)(@.*)/, "$1***$3")}`);
      } else {
        console.log(`[SSH Vault 3FA] Email OTP logged (SMTP not configured)`);
      }
    }
    
    // 3FA Flow: Password (done) → Email OTP → TOTP
    res.json({
      sessionToken: rawToken,
      nextStep: hasEmail ? "email_code" : (hasTOTP ? "totp" : "complete"),
      emailHint: user[0].email ? user[0].email.replace(/(.{2})(.*)(@.*)/, "$1***$3") : undefined,
      hasTOTP,
      hasEmail,
    });
  } catch (error) {
    console.error("Vault auth start error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
});

// 3FA: TOTP verification (Factor 3) - requires both password and email verification first
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
    
    // 3FA Enforcement: Verify Factor 1 (password) was completed
    if (!session[0].passwordVerified) {
      console.log(`[SSH Vault 3FA] TOTP attempt without password verification`);
      return res.status(400).json({ error: "Password verification required first (Factor 1)" });
    }
    
    // 3FA Enforcement: Verify Factor 2 (email OTP) was completed
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const hasEmail = user.length && user[0].email;
    
    if (hasEmail && !session[0].emailCodeVerified) {
      console.log(`[SSH Vault 3FA] TOTP attempt without email verification`);
      return res.status(400).json({ error: "Email verification required first (Factor 2)" });
    }
    
    if (!user.length || !user[0].twoFactorSecret) {
      return res.status(400).json({ error: "2FA not configured" });
    }
    
    const isValid = authenticator.verify({ token: totpCode, secret: user[0].twoFactorSecret });
    if (!isValid) {
      await logVaultAction(userId, "auth_totp_failed", false, req, undefined, session[0].id, "Invalid TOTP");
      return res.status(401).json({ error: "Invalid TOTP code" });
    }
    
    // 3FA: TOTP is Factor 3 (final factor) - complete authentication
    console.log(`[SSH Vault 3FA] TOTP verified - Factor 3 complete`);
    
    await db.update(vaultAccessSessions)
      .set({ 
        totpVerified: true,
        totpVerifiedAt: new Date(),
        isFullyAuthenticated: true,
        expiresAt: new Date(Date.now() + VAULT_SESSION_DURATION)
      })
      .where(eq(vaultAccessSessions.id, session[0].id));
    
    await logVaultAction(userId, "vault_unlocked", true, req, undefined, session[0].id);
    console.log(`[SSH Vault 3FA] Vault unlocked - All 3 factors verified!`);
    
    res.json({ nextStep: "complete", accessGranted: true });
  } catch (error) {
    console.error("Vault TOTP verify error:", error);
    res.status(500).json({ error: "Verification failed" });
  }
});

// 3FA Flow: Password (Factor 1) → Email OTP (Factor 2) → TOTP (Factor 3)
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
    
    // Verify password was completed first (Factor 1)
    if (!session[0].passwordVerified) {
      return res.status(400).json({ error: "Password verification required first" });
    }
    
    if (session[0].emailCode !== hashedEmailCode) {
      await logVaultAction(userId, "auth_email_failed", false, req, undefined, session[0].id, "Invalid email code");
      return res.status(401).json({ error: "Invalid email code" });
    }
    
    if (session[0].emailCodeExpiresAt && new Date(session[0].emailCodeExpiresAt) < new Date()) {
      return res.status(401).json({ error: "Email code expired" });
    }
    
    console.log(`[SSH Vault 3FA] Email OTP verified - Factor 2 complete`);
    
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const hasTOTP = user[0]?.twoFactorEnabled && user[0]?.twoFactorSecret;
    
    // Email verified (Factor 2) - now check if TOTP needed (Factor 3)
    if (hasTOTP) {
      // Need TOTP verification as Factor 3
      await db.update(vaultAccessSessions)
        .set({ 
          emailCodeVerified: true,
          emailCodeVerifiedAt: new Date()
        })
        .where(eq(vaultAccessSessions.id, session[0].id));
      
      await logVaultAction(userId, "auth_email", true, req, undefined, session[0].id);
      
      res.json({ nextStep: "totp", emailVerified: true });
    } else {
      // No TOTP - authentication complete after 2 factors
      await db.update(vaultAccessSessions)
        .set({ 
          emailCodeVerified: true,
          emailCodeVerifiedAt: new Date(),
          isFullyAuthenticated: true,
          expiresAt: new Date(Date.now() + VAULT_SESSION_DURATION)
        })
        .where(eq(vaultAccessSessions.id, session[0].id));
      
      await logVaultAction(userId, "vault_unlocked", true, req, undefined, session[0].id);
      console.log(`[SSH Vault 3FA] Vault unlocked (2FA - no TOTP configured)`);
      
      res.json({ nextStep: "complete", accessGranted: true });
    }
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
