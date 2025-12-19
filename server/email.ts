// Email service for OTP and notifications
// Supports SMTP configuration from database (dynamic) or environment variables (fallback)

// ============================================
// Professional Email Template System
// ============================================

// Brand colors
const BRAND = {
  primary: '#8B5CF6',      // Purple
  primaryDark: '#7C3AED',
  secondary: '#10B981',    // Green
  secondaryDark: '#059669',
  dark: '#1F2937',
  gray: '#6B7280',
  lightGray: '#9CA3AF',
  background: '#F9FAFB',
  cardBg: '#FFFFFF',
  accent: '#F5F3FF',       // Light purple
};

// Generate email wrapper (table-based for compatibility)
function getEmailWrapper(content: string, isRTL: boolean = false): string {
  return `
<!DOCTYPE html>
<html lang="${isRTL ? 'ar' : 'en'}" dir="${isRTL ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>INFERA WebNova</title>
  <!--[if mso]>
  <style type="text/css">
    table {border-collapse: collapse;}
    .fallback-font {font-family: Arial, sans-serif;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.background}; font-family: 'Inter', 'Segoe UI', Tahoma, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BRAND.background};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
          <!-- Header with Logo -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background: linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%); padding: 12px 24px; border-radius: 12px;">
                    <span style="color: #FFFFFF; font-size: 24px; font-weight: 700; letter-spacing: 1px;">INFERA</span>
                    <span style="color: rgba(255,255,255,0.9); font-size: 24px; font-weight: 300;"> WebNova</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Main Content Card -->
          <tr>
            <td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BRAND.cardBg}; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                ${content}
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="color: ${BRAND.lightGray}; font-size: 12px; line-height: 1.6;">
                    <p style="margin: 0;">
                      ${isRTL ? 'منصة بناء المواقع بالذكاء الاصطناعي' : 'AI-Powered Platform Builder'}
                    </p>
                    <p style="margin: 8px 0 0 0;">
                      &copy; ${new Date().getFullYear()} INFERA WebNova. ${isRTL ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// OTP Email Template
function getOTPEmailContent(code: string, isRTL: boolean): string {
  const title = isRTL ? 'رمز التحقق الخاص بك' : 'Your Verification Code';
  const subtitle = isRTL ? 'استخدم الرمز أدناه لإكمال عملية التحقق' : 'Use the code below to complete your verification';
  const expiry = isRTL ? 'صالح لمدة 10 دقائق' : 'Valid for 10 minutes';
  const warning = isRTL 
    ? 'إذا لم تطلب هذا الرمز، يرجى تجاهل هذه الرسالة. حسابك آمن.'
    : "If you didn't request this code, please ignore this email. Your account is safe.";
  const securityTip = isRTL
    ? 'لا تشارك هذا الرمز مع أي شخص'
    : 'Never share this code with anyone';

  return `
    <tr>
      <td style="padding: 40px 40px 0 40px;" align="center">
        <!-- Lock Icon -->
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td style="background-color: ${BRAND.accent}; padding: 16px; border-radius: 50%;">
              <img src="https://img.icons8.com/fluency/48/lock.png" alt="Security" width="32" height="32" style="display: block;"/>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px 40px 0 40px;" align="center">
        <h1 style="margin: 0; color: ${BRAND.dark}; font-size: 24px; font-weight: 700;">${title}</h1>
        <p style="margin: 12px 0 0 0; color: ${BRAND.gray}; font-size: 16px;">${subtitle}</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px 40px;" align="center">
        <!-- OTP Code Box -->
        <table role="presentation" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%); border-radius: 12px;">
          <tr>
            <td style="padding: 24px 48px;">
              <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 700; letter-spacing: 12px; color: #FFFFFF;">${code}</span>
            </td>
          </tr>
        </table>
        <p style="margin: 16px 0 0 0; color: ${BRAND.gray}; font-size: 14px;">
          <span style="display: inline-block; width: 8px; height: 8px; background-color: ${BRAND.secondary}; border-radius: 50%; margin-${isRTL ? 'left' : 'right'}: 8px;"></span>
          ${expiry}
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 40px 40px 40px;">
        <!-- Security Notice -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BRAND.background}; border-radius: 8px;">
          <tr>
            <td style="padding: 16px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-${isRTL ? 'left' : 'right'}: 12px; vertical-align: top;">
                    <span style="color: #F59E0B; font-size: 18px;">⚠</span>
                  </td>
                  <td>
                    <p style="margin: 0; color: ${BRAND.gray}; font-size: 13px; line-height: 1.5;">
                      <strong style="color: ${BRAND.dark};">${securityTip}</strong><br/>
                      ${warning}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

// Welcome Email Template
function getWelcomeEmailContent(username: string, isRTL: boolean): string {
  const greeting = isRTL ? `مرحباً ${username}!` : `Welcome, ${username}!`;
  const intro = isRTL 
    ? 'شكراً لانضمامك إلى INFERA WebNova - منصة بناء المواقع المدعومة بالذكاء الاصطناعي'
    : 'Thank you for joining INFERA WebNova - the AI-powered platform builder';
  const stepsTitle = isRTL ? 'ابدأ في 3 خطوات بسيطة' : 'Get started in 3 simple steps';
  
  const steps = isRTL ? [
    { icon: '💬', title: 'صِف رؤيتك', desc: 'أخبرنا عن المنصة التي تريد بناءها بالعربية أو الإنجليزية' },
    { icon: '🤖', title: 'شاهد السحر', desc: 'الذكاء الاصطناعي يحول وصفك إلى منصة حقيقية' },
    { icon: '🚀', title: 'انشر للعالم', desc: 'انشر منصتك بنقرة واحدة واحصل على رابط مباشر' },
  ] : [
    { icon: '💬', title: 'Describe Your Vision', desc: 'Tell us about the platform you want to build in Arabic or English' },
    { icon: '🤖', title: 'Watch the Magic', desc: 'AI transforms your description into a real platform' },
    { icon: '🚀', title: 'Launch to the World', desc: 'Publish your platform with one click and get a live URL' },
  ];

  const ctaText = isRTL ? 'ابدأ البناء الآن' : 'Start Building Now';

  let stepsHtml = steps.map((step, i) => `
    <tr>
      <td style="padding: ${i === 0 ? '0' : '16px 0 0 0'};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="width: 48px; vertical-align: top;">
              <div style="width: 40px; height: 40px; background-color: ${BRAND.accent}; border-radius: 10px; text-align: center; line-height: 40px; font-size: 20px;">
                ${step.icon}
              </div>
            </td>
            <td style="padding-${isRTL ? 'right' : 'left'}: 16px; vertical-align: top;">
              <p style="margin: 0; color: ${BRAND.dark}; font-size: 16px; font-weight: 600;">${step.title}</p>
              <p style="margin: 4px 0 0 0; color: ${BRAND.gray}; font-size: 14px;">${step.desc}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  return `
    <tr>
      <td style="padding: 40px 40px 0 40px;" align="center">
        <!-- Welcome Icon -->
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td style="background: linear-gradient(135deg, ${BRAND.secondary} 0%, ${BRAND.secondaryDark} 100%); padding: 16px; border-radius: 50%;">
              <img src="https://img.icons8.com/fluency/48/checkmark.png" alt="Welcome" width="32" height="32" style="display: block;"/>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px 40px 0 40px;" align="center">
        <h1 style="margin: 0; color: ${BRAND.dark}; font-size: 28px; font-weight: 700;">${greeting}</h1>
        <p style="margin: 16px 0 0 0; color: ${BRAND.gray}; font-size: 16px; line-height: 1.6;">${intro}</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px 40px 0 40px;">
        <p style="margin: 0 0 20px 0; color: ${BRAND.dark}; font-size: 18px; font-weight: 600;">${stepsTitle}</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${stepsHtml}
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px 40px 40px 40px;" align="center">
        <!-- CTA Button -->
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td style="background: linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%); border-radius: 8px;">
              <a href="#" style="display: inline-block; padding: 14px 32px; color: #FFFFFF; font-size: 16px; font-weight: 600; text-decoration: none;">${ctaText}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

// Test Email Template
function getTestEmailContent(config: { host: string; port: number; secure: boolean }): string {
  return `
    <tr>
      <td style="padding: 40px 40px 0 40px;" align="center">
        <!-- Success Icon -->
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td style="background: linear-gradient(135deg, ${BRAND.secondary} 0%, ${BRAND.secondaryDark} 100%); padding: 20px; border-radius: 50%;">
              <img src="https://img.icons8.com/fluency/48/checkmark.png" alt="Success" width="40" height="40" style="display: block;"/>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px 40px 0 40px;" align="center">
        <h1 style="margin: 0; color: ${BRAND.secondary}; font-size: 24px; font-weight: 700;">
          Email Configuration Test
        </h1>
        <h2 style="margin: 8px 0 0 0; color: ${BRAND.dark}; font-size: 18px; font-weight: 500;">
          اختبار إعدادات البريد
        </h2>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px 40px;" align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" style="background-color: ${BRAND.background}; border-radius: 12px;">
          <tr>
            <td style="padding: 20px 24px;">
              <p style="margin: 0; color: ${BRAND.gray}; font-size: 16px; line-height: 1.6;">
                تم إرسال هذه الرسالة بنجاح!<br/>
                <strong style="color: ${BRAND.dark};">This email was sent successfully!</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 40px 40px 40px;">
        <!-- SMTP Configuration Details -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #E5E7EB; border-radius: 8px;">
          <tr>
            <td style="padding: 16px; border-bottom: 1px solid #E5E7EB;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color: ${BRAND.gray}; font-size: 13px;">SMTP Host</td>
                  <td align="right" style="color: ${BRAND.dark}; font-size: 13px; font-weight: 600;">${config.host}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px; border-bottom: 1px solid #E5E7EB;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color: ${BRAND.gray}; font-size: 13px;">Port</td>
                  <td align="right" style="color: ${BRAND.dark}; font-size: 13px; font-weight: 600;">${config.port}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color: ${BRAND.gray}; font-size: 13px;">Secure (SSL/TLS)</td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 12px; background-color: ${config.secure ? '#D1FAE5' : '#FEF3C7'}; color: ${config.secure ? '#065F46' : '#92400E'}; font-size: 12px; font-weight: 600; border-radius: 9999px;">
                      ${config.secure ? 'Yes' : 'No'}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <p style="margin: 16px 0 0 0; color: ${BRAND.lightGray}; font-size: 12px; text-align: center;">
          Sent at: ${new Date().toISOString()}
        </p>
      </td>
    </tr>
  `;
}

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
  
  const isRTL = language === "ar";
  const html = getEmailWrapper(getOTPEmailContent(code, isRTL), isRTL);
  
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
    
    // Format sender address properly: "Display Name <email@domain.com>"
    const fromAddress = config.from && config.from.includes('@') 
      ? config.from 
      : `${config.from || 'INFERA WebNova'} <${config.user}>`;
    
    await transporter.sendMail({
      from: fromAddress,
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
  
  const isRTL = language === "ar";
  const html = getEmailWrapper(getWelcomeEmailContent(username, isRTL), isRTL);
  
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
    
    // Format sender address properly: "Display Name <email@domain.com>"
    const fromAddress = config.from && config.from.includes('@') 
      ? config.from 
      : `${config.from || 'INFERA WebNova'} <${config.user}>`;
    
    await transporter.sendMail({
      from: fromAddress,
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
  
  const html = getEmailWrapper(getTestEmailContent({
    host: config.host,
    port: config.port,
    secure: config.secure
  }), false);
  
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
    
    // Format sender address properly: "Display Name <email@domain.com>"
    const fromAddress = config.from && config.from.includes('@') 
      ? config.from 
      : `${config.from || 'INFERA WebNova'} <${config.user}>`;
    
    await transporter.sendMail({
      from: fromAddress,
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
