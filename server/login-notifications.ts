// Login/Logout Notification System - نظام إشعارات تسجيل الدخول والخروج
// Enterprise-grade professional email notifications with geolocation and device tracking

import { db } from "./db";
import { loginSessions, users } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

// ============================================
// Brand colors for email templates
// ============================================
const BRAND = {
  primary: '#8B5CF6',
  primaryDark: '#7C3AED',
  secondary: '#10B981',
  secondaryDark: '#059669',
  warning: '#F59E0B',
  danger: '#EF4444',
  dark: '#1F2937',
  gray: '#6B7280',
  lightGray: '#9CA3AF',
  background: '#F9FAFB',
  cardBg: '#FFFFFF',
  accent: '#F5F3FF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
};

// ============================================
// Types
// ============================================
interface GeoLocation {
  ip: string;
  country: string;
  countryCode: string;
  city: string;
  region: string;
  timezone: string;
  isp: string;
}

interface DeviceInfo {
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  userAgent: string;
}

interface SessionActivity {
  action: string;
  timestamp: string;
  details?: string;
  ipAddress?: string;
}

// ============================================
// Geolocation Service (using ip-api.com - free)
// ============================================
export async function getGeolocation(ip: string): Promise<GeoLocation> {
  try {
    // Skip for localhost/private IPs
    if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      return {
        ip,
        country: 'Local Network',
        countryCode: 'LO',
        city: 'localhost',
        region: 'Local',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        isp: 'Local Network',
      };
    }

    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,city,region,timezone,isp,query`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return {
        ip: data.query || ip,
        country: data.country || 'Unknown',
        countryCode: data.countryCode || 'XX',
        city: data.city || 'Unknown',
        region: data.region || 'Unknown',
        timezone: data.timezone || 'UTC',
        isp: data.isp || 'Unknown',
      };
    }
    
    return {
      ip,
      country: 'Unknown',
      countryCode: 'XX',
      city: 'Unknown',
      region: 'Unknown',
      timezone: 'UTC',
      isp: 'Unknown',
    };
  } catch (error) {
    console.error('Geolocation lookup failed:', error);
    return {
      ip,
      country: 'Unknown',
      countryCode: 'XX',
      city: 'Unknown',
      region: 'Unknown',
      timezone: 'UTC',
      isp: 'Unknown',
    };
  }
}

// ============================================
// Device Detection from User Agent
// ============================================
export function parseUserAgent(userAgent: string): DeviceInfo {
  const ua = userAgent.toLowerCase();
  
  // Device type detection
  let deviceType: DeviceInfo['deviceType'] = 'unknown';
  if (/mobile|android.*mobile|iphone|ipod|blackberry|windows phone/i.test(ua)) {
    deviceType = 'mobile';
  } else if (/tablet|ipad|android(?!.*mobile)/i.test(ua)) {
    deviceType = 'tablet';
  } else if (/windows|macintosh|linux|ubuntu/i.test(ua)) {
    deviceType = 'desktop';
  }
  
  // Browser detection
  let browser = 'Unknown';
  let browserVersion = '';
  
  if (/edg\//i.test(ua)) {
    browser = 'Microsoft Edge';
    browserVersion = ua.match(/edg\/([\d.]+)/i)?.[1] || '';
  } else if (/chrome/i.test(ua) && !/chromium/i.test(ua)) {
    browser = 'Google Chrome';
    browserVersion = ua.match(/chrome\/([\d.]+)/i)?.[1] || '';
  } else if (/firefox/i.test(ua)) {
    browser = 'Mozilla Firefox';
    browserVersion = ua.match(/firefox\/([\d.]+)/i)?.[1] || '';
  } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
    browser = 'Apple Safari';
    browserVersion = ua.match(/version\/([\d.]+)/i)?.[1] || '';
  } else if (/opera|opr/i.test(ua)) {
    browser = 'Opera';
    browserVersion = ua.match(/(?:opera|opr)\/([\d.]+)/i)?.[1] || '';
  }
  
  // OS detection
  let os = 'Unknown';
  let osVersion = '';
  
  if (/windows nt 10/i.test(ua)) {
    os = 'Windows';
    osVersion = '10/11';
  } else if (/windows nt 6.3/i.test(ua)) {
    os = 'Windows';
    osVersion = '8.1';
  } else if (/windows nt 6.2/i.test(ua)) {
    os = 'Windows';
    osVersion = '8';
  } else if (/windows nt 6.1/i.test(ua)) {
    os = 'Windows';
    osVersion = '7';
  } else if (/mac os x ([\d_]+)/i.test(ua)) {
    os = 'macOS';
    osVersion = ua.match(/mac os x ([\d_]+)/i)?.[1]?.replace(/_/g, '.') || '';
  } else if (/iphone os ([\d_]+)/i.test(ua)) {
    os = 'iOS';
    osVersion = ua.match(/iphone os ([\d_]+)/i)?.[1]?.replace(/_/g, '.') || '';
  } else if (/android ([\d.]+)/i.test(ua)) {
    os = 'Android';
    osVersion = ua.match(/android ([\d.]+)/i)?.[1] || '';
  } else if (/linux/i.test(ua)) {
    os = 'Linux';
  }
  
  return {
    deviceType,
    browser,
    browserVersion,
    os,
    osVersion,
    userAgent,
  };
}

// ============================================
// Email Wrapper Template
// ============================================
function getEmailWrapper(content: string, isRTL: boolean = false): string {
  return `
<!DOCTYPE html>
<html lang="${isRTL ? 'ar' : 'en'}" dir="${isRTL ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>INFERA WebNova</title>
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
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(196, 181, 253, 0.12) 50%, rgba(139, 92, 246, 0.08) 100%); border-radius: 12px; border: 1px solid rgba(139, 92, 246, 0.15);">
                <tr>
                  <td style="padding: 16px 24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <span style="display: inline-block; width: 10px; height: 10px; background: radial-gradient(circle, ${BRAND.primary} 0%, rgba(139, 92, 246, 0.3) 70%); border-radius: 50%; margin-right: 12px; box-shadow: 0 0 8px ${BRAND.primary}; vertical-align: middle;"></span>
                          <span style="font-size: 12px; color: ${BRAND.dark}; font-weight: 600; vertical-align: middle;">INFERA Engine</span>
                          <span style="color: ${BRAND.lightGray}; margin: 0 12px; vertical-align: middle;">|</span>
                          <span style="font-size: 11px; color: ${BRAND.lightGray}; vertical-align: middle;">&copy; ${new Date().getFullYear()} INFERA Engine</span>
                        </td>
                      </tr>
                    </table>
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

// ============================================
// Format DateTime for emails
// ============================================
function formatDateTime(date: Date, timezone: string, isRTL: boolean): string {
  try {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: timezone,
      hour12: true,
    };
    return new Intl.DateTimeFormat(isRTL ? 'ar-SA' : 'en-US', options).format(date);
  } catch {
    return date.toISOString();
  }
}

// ============================================
// Get Device Icon
// ============================================
function getDeviceIcon(deviceType: string): string {
  switch (deviceType) {
    case 'mobile':
      return 'https://img.icons8.com/fluency/48/iphone.png';
    case 'tablet':
      return 'https://img.icons8.com/fluency/48/ipad.png';
    case 'desktop':
      return 'https://img.icons8.com/fluency/48/monitor.png';
    default:
      return 'https://img.icons8.com/fluency/48/multiple-devices.png';
  }
}

// ============================================
// Login Notification Email Template
// ============================================
function getLoginEmailContent(
  username: string,
  geo: GeoLocation,
  device: DeviceInfo,
  loginTime: Date,
  authMethod: string,
  isRTL: boolean
): string {
  const title = isRTL ? 'تسجيل دخول جديد إلى حسابك' : 'New Login to Your Account';
  const greeting = isRTL ? `مرحباً ${username}،` : `Hello ${username},`;
  const intro = isRTL 
    ? 'تم تسجيل الدخول إلى حسابك للتو. إليك تفاصيل الجلسة:'
    : 'A new login to your account was just detected. Here are the session details:';
  
  const securityNotice = isRTL
    ? 'إذا لم تكن أنت من قام بتسجيل الدخول، يرجى تغيير كلمة المرور فوراً وتفعيل المصادقة الثنائية.'
    : "If this wasn't you, please change your password immediately and enable two-factor authentication.";

  const deviceTypeAr: Record<string, string> = {
    mobile: 'هاتف محمول',
    tablet: 'جهاز لوحي',
    desktop: 'كمبيوتر مكتبي',
    unknown: 'جهاز غير معروف'
  };

  const authMethodAr: Record<string, string> = {
    password: 'كلمة المرور',
    google: 'Google',
    github: 'GitHub',
    '2fa': 'المصادقة الثنائية',
    recovery: 'رمز الاسترداد'
  };

  const formattedTime = formatDateTime(loginTime, geo.timezone, isRTL);

  return `
    <tr>
      <td style="padding: 40px 40px 0 40px;" align="center">
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td style="background: linear-gradient(135deg, ${BRAND.secondary} 0%, ${BRAND.secondaryDark} 100%); padding: 16px; border-radius: 50%;">
              <img src="https://img.icons8.com/fluency/48/login-rounded-right.png" alt="Login" width="32" height="32" style="display: block;"/>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px 40px 0 40px;" align="center">
        <h1 style="margin: 0; color: ${BRAND.secondary}; font-size: 24px; font-weight: 700;">${title}</h1>
        <p style="margin: 16px 0 0 0; color: ${BRAND.dark}; font-size: 16px;">${greeting}</p>
        <p style="margin: 8px 0 0 0; color: ${BRAND.gray}; font-size: 14px;">${intro}</p>
      </td>
    </tr>
    
    <!-- Session Details Card -->
    <tr>
      <td style="padding: 24px 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BRAND.background}; border-radius: 12px; border: 1px solid #E5E7EB;">
          
          <!-- Time & Date -->
          <tr>
            <td style="padding: 16px; border-bottom: 1px solid #E5E7EB;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width: 40px; vertical-align: top;">
                    <img src="https://img.icons8.com/fluency/32/clock.png" alt="" width="24" height="24"/>
                  </td>
                  <td style="padding-${isRTL ? 'right' : 'left'}: 12px;">
                    <p style="margin: 0; color: ${BRAND.gray}; font-size: 12px;">${isRTL ? 'وقت الدخول' : 'Login Time'}</p>
                    <p style="margin: 4px 0 0 0; color: ${BRAND.dark}; font-size: 14px; font-weight: 600;">${formattedTime}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Location -->
          <tr>
            <td style="padding: 16px; border-bottom: 1px solid #E5E7EB;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width: 40px; vertical-align: top;">
                    <img src="https://img.icons8.com/fluency/32/marker.png" alt="" width="24" height="24"/>
                  </td>
                  <td style="padding-${isRTL ? 'right' : 'left'}: 12px;">
                    <p style="margin: 0; color: ${BRAND.gray}; font-size: 12px;">${isRTL ? 'الموقع' : 'Location'}</p>
                    <p style="margin: 4px 0 0 0; color: ${BRAND.dark}; font-size: 14px; font-weight: 600;">
                      ${geo.city}, ${geo.region}
                    </p>
                    <p style="margin: 2px 0 0 0; color: ${BRAND.gray}; font-size: 13px;">
                      ${geo.country} (${geo.countryCode})
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Device -->
          <tr>
            <td style="padding: 16px; border-bottom: 1px solid #E5E7EB;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width: 40px; vertical-align: top;">
                    <img src="${getDeviceIcon(device.deviceType)}" alt="" width="24" height="24"/>
                  </td>
                  <td style="padding-${isRTL ? 'right' : 'left'}: 12px;">
                    <p style="margin: 0; color: ${BRAND.gray}; font-size: 12px;">${isRTL ? 'الجهاز' : 'Device'}</p>
                    <p style="margin: 4px 0 0 0; color: ${BRAND.dark}; font-size: 14px; font-weight: 600;">
                      ${isRTL ? deviceTypeAr[device.deviceType] : device.deviceType.charAt(0).toUpperCase() + device.deviceType.slice(1)}
                    </p>
                    <p style="margin: 2px 0 0 0; color: ${BRAND.gray}; font-size: 13px;">
                      ${device.os} ${device.osVersion}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Browser -->
          <tr>
            <td style="padding: 16px; border-bottom: 1px solid #E5E7EB;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width: 40px; vertical-align: top;">
                    <img src="https://img.icons8.com/fluency/32/internet-browser.png" alt="" width="24" height="24"/>
                  </td>
                  <td style="padding-${isRTL ? 'right' : 'left'}: 12px;">
                    <p style="margin: 0; color: ${BRAND.gray}; font-size: 12px;">${isRTL ? 'المتصفح' : 'Browser'}</p>
                    <p style="margin: 4px 0 0 0; color: ${BRAND.dark}; font-size: 14px; font-weight: 600;">
                      ${device.browser} ${device.browserVersion}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- IP Address -->
          <tr>
            <td style="padding: 16px; border-bottom: 1px solid #E5E7EB;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width: 40px; vertical-align: top;">
                    <img src="https://img.icons8.com/fluency/32/ip-address.png" alt="" width="24" height="24"/>
                  </td>
                  <td style="padding-${isRTL ? 'right' : 'left'}: 12px;">
                    <p style="margin: 0; color: ${BRAND.gray}; font-size: 12px;">${isRTL ? 'عنوان IP' : 'IP Address'}</p>
                    <p style="margin: 4px 0 0 0; color: ${BRAND.dark}; font-size: 14px; font-weight: 600; font-family: monospace;">
                      ${geo.ip}
                    </p>
                    <p style="margin: 2px 0 0 0; color: ${BRAND.gray}; font-size: 13px;">
                      ${geo.isp}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Auth Method -->
          <tr>
            <td style="padding: 16px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width: 40px; vertical-align: top;">
                    <img src="https://img.icons8.com/fluency/32/key.png" alt="" width="24" height="24"/>
                  </td>
                  <td style="padding-${isRTL ? 'right' : 'left'}: 12px;">
                    <p style="margin: 0; color: ${BRAND.gray}; font-size: 12px;">${isRTL ? 'طريقة المصادقة' : 'Auth Method'}</p>
                    <p style="margin: 4px 0 0 0; color: ${BRAND.dark}; font-size: 14px; font-weight: 600;">
                      ${isRTL ? (authMethodAr[authMethod] || authMethod) : authMethod}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
    
    <!-- Security Notice -->
    <tr>
      <td style="padding: 0 40px 40px 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FEF3C7; border-radius: 8px; border: 1px solid #FCD34D;">
          <tr>
            <td style="padding: 16px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-${isRTL ? 'left' : 'right'}: 12px; vertical-align: top;">
                    <img src="https://img.icons8.com/fluency/32/error.png" alt="" width="20" height="20"/>
                  </td>
                  <td>
                    <p style="margin: 0; color: #92400E; font-size: 13px; line-height: 1.5;">
                      ${securityNotice}
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

// ============================================
// Logout Notification Email Template
// ============================================
function getLogoutEmailContent(
  username: string,
  geo: GeoLocation,
  device: DeviceInfo,
  loginTime: Date,
  logoutTime: Date,
  activities: SessionActivity[],
  isRTL: boolean
): string {
  const title = isRTL ? 'تم تسجيل الخروج من حسابك' : 'Logged Out of Your Account';
  const greeting = isRTL ? `مرحباً ${username}،` : `Hello ${username},`;
  const intro = isRTL 
    ? 'تم تسجيل الخروج من جلستك. إليك ملخص الجلسة:'
    : 'Your session has ended. Here is a summary of your session:';

  const deviceTypeAr: Record<string, string> = {
    mobile: 'هاتف محمول',
    tablet: 'جهاز لوحي',
    desktop: 'كمبيوتر مكتبي',
    unknown: 'جهاز غير معروف'
  };

  const formattedLoginTime = formatDateTime(loginTime, geo.timezone, isRTL);
  const formattedLogoutTime = formatDateTime(logoutTime, geo.timezone, isRTL);
  
  // Calculate session duration
  const durationMs = logoutTime.getTime() - loginTime.getTime();
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  const durationText = isRTL 
    ? `${hours > 0 ? hours + ' ساعة و ' : ''}${minutes} دقيقة`
    : `${hours > 0 ? hours + ' hour(s) and ' : ''}${minutes} minute(s)`;

  // Build activities HTML
  let activitiesHtml = '';
  if (activities && activities.length > 0) {
    const recentActivities = activities.slice(-10); // Last 10 activities
    activitiesHtml = `
      <tr>
        <td style="padding: 16px; border-bottom: 1px solid #E5E7EB;">
          <p style="margin: 0 0 12px 0; color: ${BRAND.dark}; font-size: 14px; font-weight: 600;">
            ${isRTL ? 'سجل النشاط' : 'Activity Log'}
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 8px; border: 1px solid #E5E7EB;">
            ${recentActivities.map((activity, index) => `
              <tr>
                <td style="padding: 10px 12px; ${index < recentActivities.length - 1 ? 'border-bottom: 1px solid #E5E7EB;' : ''}">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width: 8px; vertical-align: top; padding-top: 4px;">
                        <div style="width: 8px; height: 8px; background-color: ${BRAND.primary}; border-radius: 50%;"></div>
                      </td>
                      <td style="padding-${isRTL ? 'right' : 'left'}: 10px;">
                        <p style="margin: 0; color: ${BRAND.dark}; font-size: 13px;">${activity.action}</p>
                        <p style="margin: 2px 0 0 0; color: ${BRAND.lightGray}; font-size: 11px;">
                          ${new Date(activity.timestamp).toLocaleTimeString(isRTL ? 'ar-SA' : 'en-US')}
                          ${activity.details ? ` - ${activity.details}` : ''}
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            `).join('')}
          </table>
        </td>
      </tr>
    `;
  }

  return `
    <tr>
      <td style="padding: 40px 40px 0 40px;" align="center">
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td style="background: linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%); padding: 16px; border-radius: 50%;">
              <img src="https://img.icons8.com/fluency/48/logout-rounded.png" alt="Logout" width="32" height="32" style="display: block;"/>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px 40px 0 40px;" align="center">
        <h1 style="margin: 0; color: ${BRAND.primary}; font-size: 24px; font-weight: 700;">${title}</h1>
        <p style="margin: 16px 0 0 0; color: ${BRAND.dark}; font-size: 16px;">${greeting}</p>
        <p style="margin: 8px 0 0 0; color: ${BRAND.gray}; font-size: 14px;">${intro}</p>
      </td>
    </tr>
    
    <!-- Session Summary Card -->
    <tr>
      <td style="padding: 24px 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BRAND.background}; border-radius: 12px; border: 1px solid #E5E7EB;">
          
          <!-- Session Duration -->
          <tr>
            <td style="padding: 16px; border-bottom: 1px solid #E5E7EB;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width: 40px; vertical-align: top;">
                    <img src="https://img.icons8.com/fluency/32/time.png" alt="" width="24" height="24"/>
                  </td>
                  <td style="padding-${isRTL ? 'right' : 'left'}: 12px;">
                    <p style="margin: 0; color: ${BRAND.gray}; font-size: 12px;">${isRTL ? 'مدة الجلسة' : 'Session Duration'}</p>
                    <p style="margin: 4px 0 0 0; color: ${BRAND.primary}; font-size: 18px; font-weight: 700;">${durationText}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Login Time -->
          <tr>
            <td style="padding: 16px; border-bottom: 1px solid #E5E7EB;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width: 40px; vertical-align: top;">
                    <img src="https://img.icons8.com/fluency/32/login-rounded-right.png" alt="" width="24" height="24"/>
                  </td>
                  <td style="padding-${isRTL ? 'right' : 'left'}: 12px;">
                    <p style="margin: 0; color: ${BRAND.gray}; font-size: 12px;">${isRTL ? 'وقت الدخول' : 'Login Time'}</p>
                    <p style="margin: 4px 0 0 0; color: ${BRAND.dark}; font-size: 14px; font-weight: 600;">${formattedLoginTime}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Logout Time -->
          <tr>
            <td style="padding: 16px; border-bottom: 1px solid #E5E7EB;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width: 40px; vertical-align: top;">
                    <img src="https://img.icons8.com/fluency/32/logout-rounded.png" alt="" width="24" height="24"/>
                  </td>
                  <td style="padding-${isRTL ? 'right' : 'left'}: 12px;">
                    <p style="margin: 0; color: ${BRAND.gray}; font-size: 12px;">${isRTL ? 'وقت الخروج' : 'Logout Time'}</p>
                    <p style="margin: 4px 0 0 0; color: ${BRAND.dark}; font-size: 14px; font-weight: 600;">${formattedLogoutTime}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Location -->
          <tr>
            <td style="padding: 16px; border-bottom: 1px solid #E5E7EB;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width: 40px; vertical-align: top;">
                    <img src="https://img.icons8.com/fluency/32/marker.png" alt="" width="24" height="24"/>
                  </td>
                  <td style="padding-${isRTL ? 'right' : 'left'}: 12px;">
                    <p style="margin: 0; color: ${BRAND.gray}; font-size: 12px;">${isRTL ? 'الموقع' : 'Location'}</p>
                    <p style="margin: 4px 0 0 0; color: ${BRAND.dark}; font-size: 14px; font-weight: 600;">
                      ${geo.city}, ${geo.country}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Device -->
          <tr>
            <td style="padding: 16px; border-bottom: 1px solid #E5E7EB;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width: 40px; vertical-align: top;">
                    <img src="${getDeviceIcon(device.deviceType)}" alt="" width="24" height="24"/>
                  </td>
                  <td style="padding-${isRTL ? 'right' : 'left'}: 12px;">
                    <p style="margin: 0; color: ${BRAND.gray}; font-size: 12px;">${isRTL ? 'الجهاز' : 'Device'}</p>
                    <p style="margin: 4px 0 0 0; color: ${BRAND.dark}; font-size: 14px; font-weight: 600;">
                      ${isRTL ? deviceTypeAr[device.deviceType] : device.deviceType.charAt(0).toUpperCase() + device.deviceType.slice(1)} - ${device.browser}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          ${activitiesHtml}
          
        </table>
      </td>
    </tr>
    
    <!-- Security Footer -->
    <tr>
      <td style="padding: 0 40px 40px 40px;" align="center">
        <p style="margin: 0; color: ${BRAND.lightGray}; font-size: 12px;">
          ${isRTL ? 'تم إرسال هذا الإشعار لأغراض أمنية' : 'This notification was sent for security purposes'}
        </p>
      </td>
    </tr>
  `;
}

// ============================================
// Send Login Notification Email
// ============================================
export async function sendLoginNotification(
  userEmail: string,
  username: string,
  geo: GeoLocation,
  device: DeviceInfo,
  loginTime: Date,
  authMethod: string,
  language: 'ar' | 'en',
  storage?: any
): Promise<boolean> {
  try {
    // Dynamic import for email service
    const { sendOTPEmail } = await import('./email');
    const nodemailer = await import('nodemailer');
    
    // Get email config
    const { getEmailConfigFromDb } = await import('./email');
    let config = storage ? await getEmailConfigFromDb(storage) : null;
    
    if (!config) {
      // Try environment variables
      const host = process.env.SMTP_HOST;
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;
      
      if (!host || !user || !pass) {
        console.log(`[DEV MODE] Login notification for ${userEmail}`);
        return true;
      }
      
      config = {
        host,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        user,
        pass,
        from: process.env.SMTP_FROM_EMAIL || user,
      };
    }
    
    const isRTL = language === 'ar';
    const subject = isRTL 
      ? `تنبيه أمني: تسجيل دخول جديد - ${geo.city}, ${geo.country}` 
      : `Security Alert: New Login - ${geo.city}, ${geo.country}`;
    
    const html = getEmailWrapper(
      getLoginEmailContent(username, geo, device, loginTime, authMethod, isRTL),
      isRTL
    );
    
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
    
    const fromAddress = config.from && config.from.includes('@') 
      ? config.from 
      : `INFERA WebNova <${config.user}>`;
    
    await transporter.sendMail({
      from: fromAddress,
      to: userEmail,
      subject,
      html,
    });
    
    return true;
  } catch (error) {
    console.error('Failed to send login notification:', error);
    return false;
  }
}

// ============================================
// Send Logout Notification Email
// ============================================
export async function sendLogoutNotification(
  userEmail: string,
  username: string,
  geo: GeoLocation,
  device: DeviceInfo,
  loginTime: Date,
  logoutTime: Date,
  activities: SessionActivity[],
  language: 'ar' | 'en',
  storage?: any
): Promise<boolean> {
  try {
    const nodemailer = await import('nodemailer');
    const { getEmailConfigFromDb } = await import('./email');
    
    let config = storage ? await getEmailConfigFromDb(storage) : null;
    
    if (!config) {
      const host = process.env.SMTP_HOST;
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;
      
      if (!host || !user || !pass) {
        console.log(`[DEV MODE] Logout notification for ${userEmail}`);
        return true;
      }
      
      config = {
        host,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        user,
        pass,
        from: process.env.SMTP_FROM_EMAIL || user,
      };
    }
    
    const isRTL = language === 'ar';
    const subject = isRTL 
      ? `تم تسجيل الخروج من حسابك - INFERA WebNova` 
      : `Session Ended - INFERA WebNova`;
    
    const html = getEmailWrapper(
      getLogoutEmailContent(username, geo, device, loginTime, logoutTime, activities, isRTL),
      isRTL
    );
    
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
    
    const fromAddress = config.from && config.from.includes('@') 
      ? config.from 
      : `INFERA WebNova <${config.user}>`;
    
    await transporter.sendMail({
      from: fromAddress,
      to: userEmail,
      subject,
      html,
    });
    
    return true;
  } catch (error) {
    console.error('Failed to send logout notification:', error);
    return false;
  }
}

// ============================================
// Create Login Session Record
// ============================================
export async function createLoginSession(
  userId: string,
  sessionId: string,
  ipAddress: string,
  userAgent: string,
  authMethod: string = 'password'
): Promise<string | null> {
  try {
    const geo = await getGeolocation(ipAddress);
    const device = parseUserAgent(userAgent);
    
    const result = await db.insert(loginSessions).values({
      userId,
      sessionId,
      ipAddress: geo.ip,
      country: geo.country,
      countryCode: geo.countryCode,
      city: geo.city,
      region: geo.region,
      timezone: geo.timezone,
      isp: geo.isp,
      deviceType: device.deviceType,
      browser: device.browser,
      browserVersion: device.browserVersion,
      os: device.os,
      osVersion: device.osVersion,
      userAgent: device.userAgent,
      authMethod,
      activities: [{
        action: 'login',
        timestamp: new Date().toISOString(),
        details: `${device.browser} on ${device.os}`,
        ipAddress: geo.ip,
      }],
    }).returning({ id: loginSessions.id });
    
    return result[0]?.id || null;
  } catch (error) {
    console.error('Failed to create login session:', error);
    return null;
  }
}

// ============================================
// End Login Session (on logout)
// ============================================
export async function endLoginSession(
  sessionId: string
): Promise<{ session: any; geo: GeoLocation; device: DeviceInfo } | null> {
  try {
    const sessions = await db.select().from(loginSessions)
      .where(and(
        eq(loginSessions.sessionId, sessionId),
        eq(loginSessions.isActive, true)
      ))
      .limit(1);
    
    if (sessions.length === 0) return null;
    
    const session = sessions[0];
    
    // Add logout activity
    const activities = (session.activities || []) as SessionActivity[];
    activities.push({
      action: 'logout',
      timestamp: new Date().toISOString(),
      details: 'User logged out',
    });
    
    // Update session
    await db.update(loginSessions)
      .set({
        isActive: false,
        logoutAt: new Date(),
        activities,
      })
      .where(eq(loginSessions.id, session.id));
    
    // Reconstruct geo and device info
    const geo: GeoLocation = {
      ip: session.ipAddress || '',
      country: session.country || 'Unknown',
      countryCode: session.countryCode || 'XX',
      city: session.city || 'Unknown',
      region: session.region || 'Unknown',
      timezone: session.timezone || 'UTC',
      isp: session.isp || 'Unknown',
    };
    
    const device: DeviceInfo = {
      deviceType: (session.deviceType as DeviceInfo['deviceType']) || 'unknown',
      browser: session.browser || 'Unknown',
      browserVersion: session.browserVersion || '',
      os: session.os || 'Unknown',
      osVersion: session.osVersion || '',
      userAgent: session.userAgent || '',
    };
    
    return { session: { ...session, activities }, geo, device };
  } catch (error) {
    console.error('Failed to end login session:', error);
    return null;
  }
}

// ============================================
// Add Activity to Session
// ============================================
export async function addSessionActivity(
  sessionId: string,
  action: string,
  details?: string,
  ipAddress?: string
): Promise<boolean> {
  try {
    const sessions = await db.select().from(loginSessions)
      .where(and(
        eq(loginSessions.sessionId, sessionId),
        eq(loginSessions.isActive, true)
      ))
      .limit(1);
    
    if (sessions.length === 0) return false;
    
    const session = sessions[0];
    const activities = (session.activities || []) as SessionActivity[];
    
    activities.push({
      action,
      timestamp: new Date().toISOString(),
      details,
      ipAddress,
    });
    
    await db.update(loginSessions)
      .set({
        activities,
        lastActivityAt: new Date(),
      })
      .where(eq(loginSessions.id, session.id));
    
    return true;
  } catch (error) {
    console.error('Failed to add session activity:', error);
    return false;
  }
}

// ============================================
// Get User's Active Sessions
// ============================================
export async function getUserActiveSessions(userId: string) {
  try {
    return await db.select().from(loginSessions)
      .where(and(
        eq(loginSessions.userId, userId),
        eq(loginSessions.isActive, true)
      ))
      .orderBy(desc(loginSessions.loginAt));
  } catch (error) {
    console.error('Failed to get user sessions:', error);
    return [];
  }
}

// ============================================
// Get User's Recent Sessions (for history)
// ============================================
export async function getUserRecentSessions(userId: string, limit: number = 20) {
  try {
    return await db.select().from(loginSessions)
      .where(eq(loginSessions.userId, userId))
      .orderBy(desc(loginSessions.loginAt))
      .limit(limit);
  } catch (error) {
    console.error('Failed to get recent sessions:', error);
    return [];
  }
}

// ============================================
// Send Deletion Notification Email
// ============================================
export async function sendDeletionNotificationEmail(
  user: { email: string | null; fullName?: string | null; username?: string | null; preferredLanguage?: string | null },
  wasSuccessful: boolean,
  entityType: string,
  entityDetails: { name?: string },
  ipAddress: string,
  userAgent: string,
  storage?: any
): Promise<boolean> {
  try {
    if (!user.email) {
      console.log('[Deletion Email] No email for user, skipping notification');
      return false;
    }

    const nodemailer = await import('nodemailer');
    const { getEmailConfigFromDb } = await import('./email');
    
    let config = storage ? await getEmailConfigFromDb(storage) : null;
    
    if (!config) {
      const host = process.env.SMTP_HOST;
      const smtpUser = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;
      
      if (!host || !smtpUser || !pass) {
        console.log(`[DEV MODE] Deletion notification for ${user.email}`);
        console.log(`  Entity: ${entityType} - ${entityDetails?.name}`);
        console.log(`  Success: ${wasSuccessful}`);
        return true;
      }
      
      config = {
        host,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        user: smtpUser,
        pass,
        from: process.env.SMTP_FROM_EMAIL || smtpUser,
      };
    }

    const isRTL = user.preferredLanguage === 'ar';
    const userName = user.fullName || user.username || 'User';
    const entityName = entityDetails?.name || entityType;
    const device = parseUserAgent(userAgent);
    const geo = await getGeolocation(ipAddress);
    const now = new Date();
    const formattedTime = formatDateTime(now, geo.timezone, isRTL);

    const entityTypeAr: Record<string, string> = {
      platform: 'منصة',
      project: 'مشروع',
      file: 'ملف',
      user: 'مستخدم',
      domain: 'نطاق',
    };

    const subject = isRTL 
      ? (wasSuccessful 
        ? `تم حذف ${entityTypeAr[entityType] || entityType}: ${entityName} - INFERA WebNova`
        : `فشل في حذف ${entityTypeAr[entityType] || entityType} - INFERA WebNova`)
      : (wasSuccessful 
        ? `${entityType} Deleted: ${entityName} - INFERA WebNova`
        : `Failed to Delete ${entityType} - INFERA WebNova`);

    const title = isRTL 
      ? (wasSuccessful ? 'تم حذف عنصر من حسابك' : 'فشلت عملية الحذف')
      : (wasSuccessful ? 'An Item Was Deleted' : 'Deletion Failed');
    
    const greeting = isRTL ? `مرحباً ${userName}،` : `Hello ${userName},`;
    
    const intro = isRTL 
      ? (wasSuccessful 
        ? `تم حذف ${entityTypeAr[entityType] || entityType} "${entityName}" من حسابك. سيبقى في سلة المحذوفات لمدة 30 يوماً.`
        : `فشلت محاولة حذف ${entityTypeAr[entityType] || entityType} "${entityName}" من حسابك.`)
      : (wasSuccessful 
        ? `The ${entityType} "${entityName}" has been deleted from your account. It will remain in the recycle bin for 30 days.`
        : `An attempt to delete the ${entityType} "${entityName}" from your account has failed.`);

    const securityNotice = isRTL
      ? 'إذا لم تكن أنت من قام بهذا الإجراء، يرجى تغيير كلمة المرور فوراً والتواصل مع الدعم.'
      : "If this wasn't you, please change your password immediately and contact support.";

    const trashIcon = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
    const alertIcon = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;

    const content = `
      <tr>
        <td style="padding: 40px 40px 0 40px;" align="center">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="background: ${wasSuccessful ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'}; padding: 16px; border-radius: 50%;">
                ${wasSuccessful ? trashIcon : alertIcon}
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 24px 40px 0 40px;" align="center">
          <h1 style="margin: 0; color: ${BRAND.text}; font-size: 24px; font-weight: 700;">${title}</h1>
        </td>
      </tr>
      <tr>
        <td style="padding: 16px 40px 0 40px;">
          <p style="margin: 0; color: ${BRAND.text}; font-size: 16px; line-height: 1.6;">${greeting}</p>
          <p style="margin: 16px 0 0 0; color: ${BRAND.textSecondary}; font-size: 15px; line-height: 1.6;">${intro}</p>
        </td>
      </tr>
      <tr>
        <td style="padding: 24px 40px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BRAND.background}; border-radius: 12px; border: 1px solid ${BRAND.border};">
            <tr>
              <td style="padding: 20px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: ${BRAND.textSecondary}; font-size: 13px;">${isRTL ? 'العنصر المحذوف' : 'Deleted Item'}</span>
                      <p style="margin: 4px 0 0 0; color: ${BRAND.text}; font-size: 15px; font-weight: 600;">${entityName}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: ${BRAND.textSecondary}; font-size: 13px;">${isRTL ? 'النوع' : 'Type'}</span>
                      <p style="margin: 4px 0 0 0; color: ${BRAND.text}; font-size: 15px; font-weight: 600;">${entityTypeAr[entityType] || entityType}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: ${BRAND.textSecondary}; font-size: 13px;">${isRTL ? 'الوقت' : 'Time'}</span>
                      <p style="margin: 4px 0 0 0; color: ${BRAND.text}; font-size: 15px; font-weight: 600;">${formattedTime}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: ${BRAND.textSecondary}; font-size: 13px;">${isRTL ? 'الموقع' : 'Location'}</span>
                      <p style="margin: 4px 0 0 0; color: ${BRAND.text}; font-size: 15px; font-weight: 600;">${geo.city}, ${geo.country}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: ${BRAND.textSecondary}; font-size: 13px;">${isRTL ? 'الجهاز' : 'Device'}</span>
                      <p style="margin: 4px 0 0 0; color: ${BRAND.text}; font-size: 15px; font-weight: 600;">${device.browser} on ${device.os}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: ${BRAND.textSecondary}; font-size: 13px;">${isRTL ? 'عنوان IP' : 'IP Address'}</span>
                      <p style="margin: 4px 0 0 0; color: ${BRAND.text}; font-size: 15px; font-weight: 600;">${geo.ip}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 0 40px 40px 40px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: rgba(245, 158, 11, 0.1); border-radius: 12px; border: 1px solid rgba(245, 158, 11, 0.3);">
            <tr>
              <td style="padding: 16px;">
                <p style="margin: 0; color: #d97706; font-size: 14px; line-height: 1.6;">${securityNotice}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `;

    const html = getEmailWrapper(content, isRTL);

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    const fromAddress = config.from && config.from.includes('@') 
      ? config.from 
      : `INFERA WebNova <${config.user}>`;

    await transporter.sendMail({
      from: fromAddress,
      to: user.email,
      subject,
      html,
    });

    console.log(`[Deletion Email] Sent to ${user.email} for ${entityType}: ${entityName}`);
    return true;
  } catch (error) {
    console.error('Failed to send deletion notification:', error);
    return false;
  }
}
