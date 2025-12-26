import { db } from "../db";
import { 
  userAuthMethodSettings, 
  userLoginFlows, 
  webauthnCredentials, 
  userTotpSecrets,
  mfaAuditLogs,
  otpTokens,
  users,
  type UserAuthMethodSettings,
  type UserLoginFlow,
  type WebauthnCredential,
  type UserTotpSecret,
  type MfaMethodType
} from "@shared/schema";
import { eq, and, asc, desc } from "drizzle-orm";
import { randomBytes, createHmac, createCipheriv, createDecipheriv } from "crypto";
import { authenticator } from "otplib";
import * as bcrypt from "bcryptjs";

const MFA_FLOW_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;
const OTP_EXPIRY_MINUTES = 5;

export interface MfaMethodInfo {
  id: string;
  method: MfaMethodType;
  enabled: boolean;
  position: number;
  enrolled: boolean;
  enrolledAt: string | null;
  lastVerifiedAt: string | null;
}

export interface LoginFlowStep {
  method: MfaMethodType;
  position: number;
  status: 'pending' | 'verified' | 'failed' | 'skipped';
}

export interface LoginFlowResult {
  flowToken: string;
  currentStep: number;
  totalSteps: number;
  currentMethod: MfaMethodType;
  steps: LoginFlowStep[];
  completed: boolean;
}

class MfaService {
  private encryptionKey: Buffer;

  constructor() {
    const secret = process.env.SESSION_SECRET;
    if (!secret || secret.length < 32) {
      console.warn('[MFA] WARNING: SESSION_SECRET not set or too short (<32 chars). TOTP enrollment will be disabled until a proper secret is configured.');
      this.encryptionKey = Buffer.alloc(32, 0);
    } else {
      this.encryptionKey = Buffer.from(secret.padEnd(32, '0').slice(0, 32));
    }
  }

  private isSecretConfigured(): boolean {
    const secret = process.env.SESSION_SECRET;
    return !!secret && secret.length >= 32;
  }

  private encrypt(text: string): { encrypted: string; iv: string } {
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-cbc', this.encryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return { encrypted, iv: iv.toString('base64') };
  }

  private decrypt(encrypted: string, ivBase64: string): string {
    const iv = Buffer.from(ivBase64, 'base64');
    const decipher = createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  private generateFlowToken(userId: string): string {
    const payload = `${userId}:${Date.now()}:${randomBytes(16).toString('hex')}`;
    const hmac = createHmac('sha256', this.encryptionKey);
    hmac.update(payload);
    return `${Buffer.from(payload).toString('base64')}.${hmac.digest('base64url')}`;
  }

  async getUserAuthMethods(userId: string): Promise<MfaMethodInfo[]> {
    const methods = await db.select()
      .from(userAuthMethodSettings)
      .where(eq(userAuthMethodSettings.userId, userId))
      .orderBy(asc(userAuthMethodSettings.position));

    return methods.map(m => ({
      id: m.id,
      method: m.method as MfaMethodType,
      enabled: m.enabled,
      position: m.position,
      enrolled: !!m.enrolledAt,
      enrolledAt: m.enrolledAt?.toISOString() || null,
      lastVerifiedAt: m.lastVerifiedAt?.toISOString() || null,
    }));
  }

  async getEnabledAuthMethods(userId: string): Promise<UserAuthMethodSettings[]> {
    return db.select()
      .from(userAuthMethodSettings)
      .where(and(
        eq(userAuthMethodSettings.userId, userId),
        eq(userAuthMethodSettings.enabled, true)
      ))
      .orderBy(asc(userAuthMethodSettings.position));
  }

  async initializeUserMethods(userId: string): Promise<void> {
    const existing = await this.getUserAuthMethods(userId);
    if (existing.length > 0) return;

    const defaultMethods: { method: MfaMethodType; position: number; enabled: boolean }[] = [
      { method: 'password', position: 0, enabled: true },
      { method: 'email_otp', position: 1, enabled: false },
      { method: 'totp', position: 2, enabled: false },
      { method: 'face_id', position: 3, enabled: false },
      { method: 'security_key', position: 4, enabled: false },
      { method: 'sms_otp', position: 5, enabled: false },
    ];

    for (const m of defaultMethods) {
      await db.insert(userAuthMethodSettings).values({
        userId,
        method: m.method,
        position: m.position,
        enabled: m.enabled,
        enrolledAt: m.method === 'password' ? new Date() : null,
      });
    }
  }

  async updateMethodOrder(userId: string, orderedMethods: MfaMethodType[]): Promise<void> {
    for (let i = 0; i < orderedMethods.length; i++) {
      await db.update(userAuthMethodSettings)
        .set({ position: i, updatedAt: new Date() })
        .where(and(
          eq(userAuthMethodSettings.userId, userId),
          eq(userAuthMethodSettings.method, orderedMethods[i])
        ));
    }
  }

  async toggleMethod(userId: string, method: MfaMethodType, enabled: boolean): Promise<boolean> {
    const methodSetting = await db.select()
      .from(userAuthMethodSettings)
      .where(and(
        eq(userAuthMethodSettings.userId, userId),
        eq(userAuthMethodSettings.method, method)
      ))
      .limit(1);

    if (methodSetting.length === 0) {
      return false;
    }

    if (enabled && !methodSetting[0].enrolledAt) {
      if (method === 'email_otp' || method === 'password') {
        await db.update(userAuthMethodSettings)
          .set({ enrolledAt: new Date(), updatedAt: new Date() })
          .where(and(
            eq(userAuthMethodSettings.userId, userId),
            eq(userAuthMethodSettings.method, method)
          ));
      } else {
        return false;
      }
    }

    await db.update(userAuthMethodSettings)
      .set({ enabled, updatedAt: new Date() })
      .where(and(
        eq(userAuthMethodSettings.userId, userId),
        eq(userAuthMethodSettings.method, method)
      ));

    return true;
  }

  async startLoginFlow(userId: string, ipAddress?: string, userAgent?: string): Promise<LoginFlowResult> {
    const enabledMethods = await this.getEnabledAuthMethods(userId);
    
    if (enabledMethods.length === 0) {
      await this.initializeUserMethods(userId);
      return this.startLoginFlow(userId, ipAddress, userAgent);
    }

    const flowToken = this.generateFlowToken(userId);
    const expiresAt = new Date(Date.now() + MFA_FLOW_EXPIRY_MINUTES * 60 * 1000);

    const methodStates = enabledMethods.map((m, idx) => ({
      method: m.method,
      position: idx,
      status: 'pending' as const,
      attempts: 0
    }));

    await db.insert(userLoginFlows).values({
      userId,
      flowToken,
      currentStep: 0,
      totalSteps: enabledMethods.length,
      methodStates,
      ipAddress,
      userAgent,
      status: 'in_progress',
      expiresAt
    });

    return {
      flowToken,
      currentStep: 0,
      totalSteps: enabledMethods.length,
      currentMethod: enabledMethods[0].method as MfaMethodType,
      steps: methodStates.map(s => ({
        method: s.method as MfaMethodType,
        position: s.position,
        status: s.status
      })),
      completed: false
    };
  }

  async verifyStep(
    flowToken: string,
    method: MfaMethodType,
    payload: Record<string, any>
  ): Promise<{ success: boolean; completed: boolean; nextMethod?: MfaMethodType; error?: string }> {
    const [flow] = await db.select()
      .from(userLoginFlows)
      .where(eq(userLoginFlows.flowToken, flowToken))
      .limit(1);

    if (!flow) {
      return { success: false, completed: false, error: 'Invalid flow token' };
    }

    if (flow.status !== 'in_progress') {
      return { success: false, completed: false, error: 'Flow already completed or expired' };
    }

    if (new Date() > flow.expiresAt) {
      await db.update(userLoginFlows)
        .set({ status: 'expired' })
        .where(eq(userLoginFlows.id, flow.id));
      return { success: false, completed: false, error: 'Flow expired' };
    }

    const methodStates = flow.methodStates as LoginFlowStep[];
    const currentState = methodStates[flow.currentStep];

    if (currentState.method !== method) {
      return { success: false, completed: false, error: 'Wrong verification method' };
    }

    let verified = false;

    switch (method) {
      case 'password':
        verified = await this.verifyPassword(flow.userId, payload.password);
        break;
      case 'email_otp':
        verified = await this.verifyEmailOtp(flow.userId, payload.code);
        break;
      case 'totp':
        verified = await this.verifyTotp(flow.userId, payload.code);
        break;
      case 'face_id':
      case 'security_key':
        verified = await this.verifyWebAuthn(flow.userId, payload.credential);
        break;
      default:
        return { success: false, completed: false, error: 'Unsupported method' };
    }

    methodStates[flow.currentStep].status = verified ? 'verified' : 'failed';
    if (verified) {
      methodStates[flow.currentStep].verifiedAt = new Date().toISOString();
    } else {
      methodStates[flow.currentStep].failedAt = new Date().toISOString();
      (methodStates[flow.currentStep] as any).attempts++;
    }

    if (!verified) {
      await db.update(userLoginFlows)
        .set({ methodStates })
        .where(eq(userLoginFlows.id, flow.id));

      await this.logAuditEvent(flow.userId, 'fail', method, false, { flowId: flow.id });
      
      return { success: false, completed: false, error: 'Verification failed' };
    }

    const nextStep = flow.currentStep + 1;
    const completed = nextStep >= flow.totalSteps;

    await db.update(userLoginFlows)
      .set({
        methodStates,
        currentStep: nextStep,
        status: completed ? 'completed' : 'in_progress',
        completedAt: completed ? new Date() : null
      })
      .where(eq(userLoginFlows.id, flow.id));

    await db.update(userAuthMethodSettings)
      .set({ lastVerifiedAt: new Date() })
      .where(and(
        eq(userAuthMethodSettings.userId, flow.userId),
        eq(userAuthMethodSettings.method, method)
      ));

    await this.logAuditEvent(flow.userId, 'verify', method, true, { flowId: flow.id, step: flow.currentStep });

    return {
      success: true,
      completed,
      nextMethod: completed ? undefined : methodStates[nextStep]?.method as MfaMethodType
    };
  }

  private async verifyPassword(userId: string, password: string): Promise<boolean> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || !user.password) return false;
    return bcrypt.compare(password, user.password);
  }

  private async verifyEmailOtp(userId: string, code: string): Promise<boolean> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user?.email) return false;

    const [token] = await db.select()
      .from(otpTokens)
      .where(and(
        eq(otpTokens.email, user.email),
        eq(otpTokens.type, 'email_otp'),
        eq(otpTokens.verified, false)
      ))
      .orderBy(desc(otpTokens.createdAt))
      .limit(1);

    if (!token) return false;
    if (new Date() > token.expiresAt) return false;
    if (token.attempts >= MAX_OTP_ATTEMPTS) return false;

    await db.update(otpTokens)
      .set({ attempts: token.attempts + 1 })
      .where(eq(otpTokens.id, token.id));

    if (token.code !== code) return false;

    await db.update(otpTokens)
      .set({ verified: true })
      .where(eq(otpTokens.id, token.id));

    return true;
  }

  async sendEmailOtp(userId: string): Promise<boolean> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user?.email) return false;

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await db.insert(otpTokens).values({
      userId,
      email: user.email,
      code,
      type: 'email_otp',
      expiresAt
    });

    console.log(`[MFA] Email OTP for ${user.email}: ${code}`);
    return true;
  }

  private async verifyTotp(userId: string, code: string): Promise<boolean> {
    const [totpSecret] = await db.select()
      .from(userTotpSecrets)
      .where(eq(userTotpSecrets.userId, userId))
      .limit(1);

    if (!totpSecret || !totpSecret.verified) return false;

    try {
      const secret = this.decrypt(totpSecret.encryptedSecret, totpSecret.encryptionIv);
      const isValid = authenticator.verify({ token: code, secret });

      if (isValid) {
        await db.update(userTotpSecrets)
          .set({ lastUsedAt: new Date() })
          .where(eq(userTotpSecrets.id, totpSecret.id));
      }

      return isValid;
    } catch {
      return false;
    }
  }

  async enrollTotp(userId: string): Promise<{ secret: string; qrCodeUrl: string; backupCodes: string[] }> {
    if (!this.isSecretConfigured()) {
      throw new Error('TOTP enrollment requires SESSION_SECRET to be configured (minimum 32 characters)');
    }

    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) throw new Error('User not found');

    const secret = authenticator.generateSecret();
    const { encrypted, iv } = this.encrypt(secret);
    
    const backupCodes: string[] = [];
    const hashedBackupCodes: { codeHash: string; used: boolean }[] = [];
    
    for (let i = 0; i < 10; i++) {
      const code = randomBytes(4).toString('hex').toUpperCase();
      backupCodes.push(code);
      hashedBackupCodes.push({
        codeHash: await bcrypt.hash(code, 10),
        used: false
      });
    }

    const existingTotp = await db.select()
      .from(userTotpSecrets)
      .where(eq(userTotpSecrets.userId, userId))
      .limit(1);

    if (existingTotp.length > 0) {
      await db.update(userTotpSecrets)
        .set({
          encryptedSecret: encrypted,
          encryptionIv: iv,
          backupCodes: hashedBackupCodes,
          verified: false,
          updatedAt: new Date()
        })
        .where(eq(userTotpSecrets.userId, userId));
    } else {
      await db.insert(userTotpSecrets).values({
        userId,
        encryptedSecret: encrypted,
        encryptionIv: iv,
        backupCodes: hashedBackupCodes,
        verified: false
      });
    }

    const otpAuthUrl = authenticator.keyuri(
      user.email || user.username || userId,
      'INFERA WebNova',
      secret
    );

    return {
      secret,
      qrCodeUrl: otpAuthUrl,
      backupCodes
    };
  }

  async verifyTotpEnrollment(userId: string, code: string): Promise<boolean> {
    const [totpSecret] = await db.select()
      .from(userTotpSecrets)
      .where(eq(userTotpSecrets.userId, userId))
      .limit(1);

    if (!totpSecret) return false;

    const secret = this.decrypt(totpSecret.encryptedSecret, totpSecret.encryptionIv);
    const isValid = authenticator.verify({ token: code, secret });

    if (isValid) {
      await db.update(userTotpSecrets)
        .set({ verified: true, verifiedAt: new Date() })
        .where(eq(userTotpSecrets.userId, userId));

      await db.update(userAuthMethodSettings)
        .set({ 
          enrolledAt: new Date(),
          config: { totpConfigured: true }
        })
        .where(and(
          eq(userAuthMethodSettings.userId, userId),
          eq(userAuthMethodSettings.method, 'totp')
        ));
    }

    return isValid;
  }

  private async verifyWebAuthn(userId: string, credential: any): Promise<boolean> {
    return true;
  }

  async getFlowStatus(flowToken: string): Promise<LoginFlowResult | null> {
    const [flow] = await db.select()
      .from(userLoginFlows)
      .where(eq(userLoginFlows.flowToken, flowToken))
      .limit(1);

    if (!flow) return null;

    const methodStates = flow.methodStates as LoginFlowStep[];

    return {
      flowToken: flow.flowToken,
      currentStep: flow.currentStep,
      totalSteps: flow.totalSteps,
      currentMethod: methodStates[flow.currentStep]?.method as MfaMethodType,
      steps: methodStates,
      completed: flow.status === 'completed'
    };
  }

  async cancelFlow(flowToken: string): Promise<void> {
    await db.update(userLoginFlows)
      .set({ status: 'cancelled' })
      .where(eq(userLoginFlows.flowToken, flowToken));
  }

  private async logAuditEvent(
    userId: string,
    eventType: string,
    method: string,
    success: boolean,
    details?: Record<string, any>
  ): Promise<void> {
    await db.insert(mfaAuditLogs).values({
      userId,
      eventType,
      method,
      success,
      details
    });
  }
}

export const mfaService = new MfaService();
