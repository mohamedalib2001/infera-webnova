// Email service for OTP and notifications
// Supports SMTP configuration from database (dynamic) or environment variables (fallback)

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Cached database config
let cachedDbConfig: EmailConfig | null = null;
let lastCacheTime = 0;
const CACHE_TTL = 60000; // 1 minute cache

// Get email configuration from database
export async function getEmailConfigFromDb(storage: any): Promise<EmailConfig | null> {
  try {
    // Check cache first
    if (cachedDbConfig && Date.now() - lastCacheTime < CACHE_TTL) {
      return cachedDbConfig;
    }

    const setting = await storage.getSystemSetting("smtp_config");
    if (!setting || !setting.value) {
      return null;
    }
    
    const config = setting.value as {
      host?: string;
      port?: number;
      secure?: boolean;
      user?: string;
      pass?: string;
      from?: string;
      enabled?: boolean;
    };
    
    if (!config.enabled || !config.host || !config.user || !config.pass) {
      return null;
    }
    
    cachedDbConfig = {
      host: config.host,
      port: config.port || 587,
      secure: config.secure || false,
      user: config.user,
      pass: config.pass,
      from: config.from || config.user,
    };
    lastCacheTime = Date.now();
    
    return cachedDbConfig;
  } catch (error) {
    console.error("Failed to get email config from database:", error);
    return null;
  }
}

// Clear the cache (call when settings are updated)
export function clearEmailConfigCache(): void {
  cachedDbConfig = null;
  lastCacheTime = 0;
}

// Get email configuration from environment (fallback)
function getEmailConfigFromEnv(): EmailConfig | null {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  
  if (!host || !user || !pass) {
    return null;
  }
  
  return {
    host,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    user,
    pass,
    from: process.env.SMTP_FROM || user,
  };
}

// Get email configuration - tries database first, then environment
async function getEmailConfig(storage?: any): Promise<EmailConfig | null> {
  // Try database config first if storage is provided
  if (storage) {
    const dbConfig = await getEmailConfigFromDb(storage);
    if (dbConfig) {
      return dbConfig;
    }
  }
  
  // Fallback to environment variables
  return getEmailConfigFromEnv();
}

// Check if email service is configured (sync check - env only)
export function isEmailConfigured(): boolean {
  return getEmailConfigFromEnv() !== null;
}

// Async check including database config
export async function isEmailConfiguredAsync(storage?: any): Promise<boolean> {
  const config = await getEmailConfig(storage);
  return config !== null;
}

// Generate 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP email
export async function sendOTPEmail(
  to: string,
  code: string,
  language: "ar" | "en" = "ar",
  storage?: any
): Promise<boolean> {
  const config = await getEmailConfig(storage);
  
  // If email is not configured, log and return success (for development)
  if (!config) {
    console.log(`[DEV MODE] OTP for ${to}: ${code}`);
    return true;
  }
  
  const subject = language === "ar" 
    ? "رمز التحقق - INFERA WebNova" 
    : "Verification Code - INFERA WebNova";
    
  const html = language === "ar" 
    ? `
      <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #8b5cf6;">INFERA WebNova</h1>
        </div>
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 30px; text-align: center;">
          <h2 style="color: white; margin-bottom: 20px;">رمز التحقق الخاص بك</h2>
          <div style="background: white; border-radius: 8px; padding: 20px; display: inline-block;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1f2937;">${code}</span>
          </div>
          <p style="color: rgba(255,255,255,0.9); margin-top: 20px;">
            هذا الرمز صالح لمدة 10 دقائق فقط
          </p>
        </div>
        <p style="color: #6b7280; text-align: center; margin-top: 20px; font-size: 14px;">
          إذا لم تطلب هذا الرمز، يرجى تجاهل هذه الرسالة
        </p>
      </div>
    `
    : `
      <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #8b5cf6;">INFERA WebNova</h1>
        </div>
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 30px; text-align: center;">
          <h2 style="color: white; margin-bottom: 20px;">Your Verification Code</h2>
          <div style="background: white; border-radius: 8px; padding: 20px; display: inline-block;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1f2937;">${code}</span>
          </div>
          <p style="color: rgba(255,255,255,0.9); margin-top: 20px;">
            This code is valid for 10 minutes only
          </p>
        </div>
        <p style="color: #6b7280; text-align: center; margin-top: 20px; font-size: 14px;">
          If you didn't request this code, please ignore this email
        </p>
      </div>
    `;
  
  try {
    // Dynamic import for nodemailer (only when needed)
    const nodemailer = await import("nodemailer");
    
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
    
    await transporter.sendMail({
      from: config.from,
      to,
      subject,
      html,
      text: `Your verification code is: ${code}`,
    });
    
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

// Send welcome email
export async function sendWelcomeEmail(
  to: string,
  username: string,
  language: "ar" | "en" = "ar",
  storage?: any
): Promise<boolean> {
  const config = await getEmailConfig(storage);
  
  if (!config) {
    console.log(`[DEV MODE] Welcome email for ${to}`);
    return true;
  }
  
  const subject = language === "ar" 
    ? "مرحباً بك في INFERA WebNova!" 
    : "Welcome to INFERA WebNova!";
    
  const html = language === "ar"
    ? `
      <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #8b5cf6; text-align: center;">مرحباً ${username}!</h1>
        <p style="font-size: 18px; text-align: center;">أهلاً بك في منصة INFERA WebNova لبناء المواقع بالذكاء الاصطناعي</p>
        <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <h3>ابدأ الآن:</h3>
          <ul style="line-height: 2;">
            <li>صِف موقعك بالعربية أو الإنجليزية</li>
            <li>شاهد الذكاء الاصطناعي يبني موقعك</li>
            <li>عدّل وحسّن حتى تصل للنتيجة المثالية</li>
          </ul>
        </div>
      </div>
    `
    : `
      <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #8b5cf6; text-align: center;">Welcome ${username}!</h1>
        <p style="font-size: 18px; text-align: center;">Welcome to INFERA WebNova - AI-powered website builder</p>
        <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <h3>Get Started:</h3>
          <ul style="line-height: 2;">
            <li>Describe your website in Arabic or English</li>
            <li>Watch AI build your website</li>
            <li>Refine and improve until perfect</li>
          </ul>
        </div>
      </div>
    `;
  
  try {
    const nodemailer = await import("nodemailer");
    
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
    
    await transporter.sendMail({
      from: config.from,
      to,
      subject,
      html,
    });
    
    return true;
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return false;
  }
}

// Send test email to verify SMTP configuration
export async function sendTestEmail(
  to: string,
  storage?: any
): Promise<{ success: boolean; error?: string }> {
  const config = await getEmailConfig(storage);
  
  if (!config) {
    return { 
      success: false, 
      error: "لم يتم تكوين إعدادات البريد / Email settings not configured" 
    };
  }
  
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #8b5cf6;">INFERA WebNova</h1>
      </div>
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; padding: 30px; text-align: center;">
        <h2 style="color: white; margin-bottom: 20px;">Email Configuration Test</h2>
        <p style="color: rgba(255,255,255,0.9);">
          تم إرسال هذه الرسالة بنجاح!<br/>
          This email was sent successfully!
        </p>
        <p style="color: rgba(255,255,255,0.7); margin-top: 20px; font-size: 14px;">
          SMTP Host: ${config.host}<br/>
          Port: ${config.port}<br/>
          Secure: ${config.secure ? 'Yes' : 'No'}
        </p>
      </div>
      <p style="color: #6b7280; text-align: center; margin-top: 20px; font-size: 14px;">
        Sent at: ${new Date().toISOString()}
      </p>
    </div>
  `;
  
  try {
    const nodemailer = await import("nodemailer");
    
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
    
    await transporter.sendMail({
      from: config.from,
      to,
      subject: "INFERA WebNova - Email Test / اختبار البريد",
      html,
    });
    
    return { success: true };
  } catch (error: any) {
    console.error("Failed to send test email:", error);
    return { 
      success: false, 
      error: error.message || "فشل في إرسال البريد التجريبي / Failed to send test email"
    };
  }
}
