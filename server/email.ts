// Email service for OTP and notifications
// Supports SMTP configuration for self-hosted deployments

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

// Get email configuration from environment
function getEmailConfig(): EmailConfig | null {
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

// Check if email service is configured
export function isEmailConfigured(): boolean {
  return getEmailConfig() !== null;
}

// Generate 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP email
export async function sendOTPEmail(
  to: string,
  code: string,
  language: "ar" | "en" = "ar"
): Promise<boolean> {
  const config = getEmailConfig();
  
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
  language: "ar" | "en" = "ar"
): Promise<boolean> {
  const config = getEmailConfig();
  
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
