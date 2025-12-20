/**
 * 🧠 Sovereign Real-Time Intelligent Notification System (SRINS)
 * نظام الإشعارات اللحظية الذكية السيادي
 * 
 * This engine provides:
 * - AI-powered priority scoring
 * - Smart channel routing
 * - Intelligent timing optimization
 * - Automatic escalation management
 * - Owner-grade sovereign notifications
 */

import { storage } from "./storage";
import type { 
  InsertSovereignNotification, 
  SovereignNotification,
  NotificationTemplate,
  UserNotificationPreferences 
} from "@shared/schema";
import { sendNotificationEmail } from "./email";

// Priority weights for AI scoring
const PRIORITY_WEIGHTS = {
  eventSeverity: 0.30,      // خطورة الحدث
  userImpact: 0.25,         // تأثير المستخدم
  financialImpact: 0.20,    // التأثير المالي
  repeatFrequency: 0.15,    // تكرار الحدث
  timing: 0.10              // التوقيت
};

// Channel priority matrix
const CHANNEL_MATRIX = {
  EMERGENCY: ['PUSH', 'SMS', 'DASHBOARD', 'EMAIL', 'ENCRYPTED'],
  CRITICAL: ['PUSH', 'DASHBOARD', 'EMAIL'],
  HIGH: ['DASHBOARD', 'EMAIL', 'PUSH'],
  MEDIUM: ['DASHBOARD', 'EMAIL'],
  LOW: ['DASHBOARD']
};

// Escalation timeouts (in minutes)
const ESCALATION_TIMEOUTS = {
  EMERGENCY: 1,
  CRITICAL: 3,
  HIGH: 15,
  MEDIUM: 60,
  LOW: 1440 // 24 hours
};

export interface NotificationContext {
  eventSeverity: number;        // 0-100
  userImpact: 'none' | 'low' | 'medium' | 'high' | 'critical';
  financialImpact?: number;     // USD amount
  repeatFrequency: number;      // times in last 24h
  isBusinessHours: boolean;
  isOwner: boolean;
  riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

export interface NotificationPayload {
  title: string;
  titleAr?: string;
  message: string;
  messageAr?: string;
  type: string;
  category?: string;
  targetUserId?: string;
  isOwnerOnly?: boolean;
  metadata?: Record<string, unknown>;
  sourceSystem?: string;
  sourceEventId?: string;
  actionUrl?: string;
  actionLabel?: string;
  actionLabelAr?: string;
  context?: Partial<NotificationContext>;
}

class NotificationEngine {
  private escalationTimers: Map<string, NodeJS.Timeout> = new Map();
  
  /**
   * Calculate AI-powered priority score (0-100)
   */
  calculatePriorityScore(context: NotificationContext): number {
    const userImpactScores = {
      'none': 0, 'low': 25, 'medium': 50, 'high': 75, 'critical': 100
    };
    
    const riskScores = {
      'none': 0, 'low': 20, 'medium': 50, 'high': 80, 'critical': 100
    };
    
    let score = 0;
    
    // Event severity (0-100)
    score += context.eventSeverity * PRIORITY_WEIGHTS.eventSeverity;
    
    // User impact
    score += userImpactScores[context.userImpact] * PRIORITY_WEIGHTS.userImpact;
    
    // Financial impact (capped at 100k = 100 points)
    const financialScore = Math.min((context.financialImpact || 0) / 1000, 100);
    score += financialScore * PRIORITY_WEIGHTS.financialImpact;
    
    // Repeat frequency (more = higher priority, capped at 10)
    const frequencyScore = Math.min(context.repeatFrequency * 10, 100);
    score += frequencyScore * PRIORITY_WEIGHTS.repeatFrequency;
    
    // Timing boost (outside business hours = +10 for critical)
    if (!context.isBusinessHours && context.riskLevel === 'critical') {
      score += 10 * PRIORITY_WEIGHTS.timing;
    }
    
    // Owner boost (+15 for owner notifications)
    if (context.isOwner) {
      score += 15;
    }
    
    return Math.min(Math.round(score), 100);
  }
  
  /**
   * Determine priority level from score
   */
  getPriorityLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'EMERGENCY' {
    if (score >= 90) return 'EMERGENCY';
    if (score >= 75) return 'CRITICAL';
    if (score >= 50) return 'HIGH';
    if (score >= 25) return 'MEDIUM';
    return 'LOW';
  }
  
  /**
   * Smart channel routing based on priority and user preferences
   */
  async selectChannels(
    priority: string,
    userId?: string,
    isOwner: boolean = false
  ): Promise<string[]> {
    // Get base channels from priority
    const baseChannels = CHANNEL_MATRIX[priority as keyof typeof CHANNEL_MATRIX] || ['DASHBOARD'];
    
    // Owner always gets all critical channels + encrypted
    if (isOwner && (priority === 'CRITICAL' || priority === 'EMERGENCY')) {
      return ['ENCRYPTED', 'PUSH', 'SMS', 'DASHBOARD', 'EMAIL'];
    }
    
    // Check user preferences if not owner
    if (userId && !isOwner) {
      const prefs = await storage.getUserNotificationPreferences(userId);
      if (prefs) {
        // Filter channels by user preferences
        return baseChannels.filter(ch => 
          prefs.enabledChannels?.includes(ch) ?? true
        );
      }
    }
    
    return baseChannels;
  }
  
  /**
   * Check if notification should be delayed (quiet hours, batching)
   */
  async shouldDelay(
    priority: string,
    userId?: string
  ): Promise<{ delay: boolean; minutes?: number; reason?: string }> {
    // Emergency and Critical never delay
    if (priority === 'EMERGENCY' || priority === 'CRITICAL') {
      return { delay: false };
    }
    
    if (!userId) return { delay: false };
    
    const prefs = await storage.getUserNotificationPreferences(userId);
    if (!prefs) return { delay: false };
    
    // Check quiet hours
    if (prefs.respectQuietHours && prefs.quietHoursStart && prefs.quietHoursEnd) {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM
      
      if (currentTime >= prefs.quietHoursStart || currentTime < prefs.quietHoursEnd) {
        return {
          delay: true,
          minutes: this.minutesUntilEndOfQuietHours(prefs.quietHoursEnd),
          reason: 'quiet_hours'
        };
      }
    }
    
    // Check batching for low priority
    if (priority === 'LOW' && prefs.enableBatching) {
      return {
        delay: true,
        minutes: prefs.batchIntervalMinutes || 30,
        reason: 'batching'
      };
    }
    
    return { delay: false };
  }
  
  private minutesUntilEndOfQuietHours(endTime: string): number {
    const now = new Date();
    const [endHour, endMin] = endTime.split(':').map(Number);
    const end = new Date(now);
    end.setHours(endHour, endMin, 0, 0);
    
    if (end <= now) {
      end.setDate(end.getDate() + 1);
    }
    
    return Math.ceil((end.getTime() - now.getTime()) / 60000);
  }
  
  /**
   * Create and send a notification with full AI processing
   */
  async send(payload: NotificationPayload): Promise<SovereignNotification> {
    // Build context
    const context: NotificationContext = {
      eventSeverity: payload.context?.eventSeverity ?? 50,
      userImpact: payload.context?.userImpact ?? 'medium',
      financialImpact: payload.context?.financialImpact,
      repeatFrequency: payload.context?.repeatFrequency ?? 0,
      isBusinessHours: this.isBusinessHours(),
      isOwner: payload.isOwnerOnly ?? false,
      riskLevel: payload.context?.riskLevel ?? 'medium'
    };
    
    // Calculate priority
    const priorityScore = this.calculatePriorityScore(context);
    const priority = this.getPriorityLevel(priorityScore);
    
    // Select channels
    const channels = await this.selectChannels(priority, payload.targetUserId, payload.isOwnerOnly);
    
    // Check for delays
    const delayInfo = await this.shouldDelay(priority, payload.targetUserId);
    
    // Build context analysis
    const contextAnalysis = {
      eventSeverity: context.eventSeverity,
      userImpact: context.userImpact,
      financialImpact: context.financialImpact,
      repeatFrequency: context.repeatFrequency,
      riskLevel: context.riskLevel,
      suggestedActions: this.suggestActions(payload.type, priority)
    };
    
    // Determine if acknowledgment is required
    const requiresAcknowledgment = 
      priority === 'CRITICAL' || 
      priority === 'EMERGENCY' ||
      payload.isOwnerOnly;
    
    // Create notification
    const notification: InsertSovereignNotification = {
      title: payload.title,
      titleAr: payload.titleAr,
      message: payload.message,
      messageAr: payload.messageAr,
      type: payload.type,
      category: payload.category,
      priority,
      priorityScore,
      contextAnalysis,
      targetType: payload.isOwnerOnly ? 'owner' : (payload.targetUserId ? 'user' : 'system'),
      targetUserId: payload.targetUserId,
      isOwnerOnly: payload.isOwnerOnly ?? false,
      channels,
      channelDeliveryStatus: channels.map(ch => ({
        channel: ch,
        status: 'pending'
      })),
      scheduledFor: delayInfo.delay ? new Date(Date.now() + (delayInfo.minutes! * 60000)) : undefined,
      smartTiming: delayInfo.delay ? {
        timezone: 'UTC',
        delayMinutes: delayInfo.minutes,
        batchGroup: delayInfo.reason
      } : undefined,
      status: delayInfo.delay ? 'pending' : 'sent',
      requiresAcknowledgment,
      metadata: payload.metadata,
      sourceSystem: payload.sourceSystem,
      sourceEventId: payload.sourceEventId,
      actionUrl: payload.actionUrl,
      actionLabel: payload.actionLabel,
      actionLabelAr: payload.actionLabelAr
    };
    
    const created = await storage.createSovereignNotification(notification);
    
    // Set up escalation timer if required
    if (requiresAcknowledgment && !delayInfo.delay) {
      this.setupEscalation(created.id, priority);
    }
    
    // Deliver to channels
    if (!delayInfo.delay) {
      await this.deliverToChannels(created);
    }
    
    return created;
  }
  
  /**
   * Send owner-grade sovereign notification
   */
  async sendOwnerAlert(
    title: string,
    titleAr: string,
    message: string,
    messageAr: string,
    type: string,
    metadata?: Record<string, unknown>,
    targetType: 'all' | 'specific' = 'all',
    targetUserIds: string[] = []
  ): Promise<SovereignNotification | SovereignNotification[]> {
    // If targeting specific users, create individual notifications for each
    if (targetType === 'specific') {
      if (targetUserIds.length === 0) {
        throw new Error('At least one user must be selected when targeting specific users');
      }
      const notifications: SovereignNotification[] = [];
      for (const userId of targetUserIds) {
        const notification = await this.send({
          title,
          titleAr,
          message,
          messageAr,
          type,
          targetUserId: userId,
          isOwnerOnly: false,
          metadata: { ...metadata, targetedAlert: true },
          sourceSystem: 'sovereignty',
          context: {
            eventSeverity: 80,
            userImpact: 'critical',
            riskLevel: 'high'
          }
        });
        notifications.push(notification);
      }
      return notifications;
    }
    
    // Target all users: get all users and create individual notifications
    const allUsers = await storage.getAllUsers();
    const notifications: SovereignNotification[] = [];
    for (const user of allUsers) {
      const notification = await this.send({
        title,
        titleAr,
        message,
        messageAr,
        type,
        targetUserId: user.id,
        isOwnerOnly: false,
        metadata: { ...metadata, broadcastAlert: true },
        sourceSystem: 'sovereignty',
        context: {
          eventSeverity: 80,
          userImpact: 'critical',
          riskLevel: 'high'
        }
      });
      notifications.push(notification);
    }
    return notifications;
  }
  
  private isBusinessHours(): boolean {
    const now = new Date();
    const hour = now.getUTCHours();
    const day = now.getUTCDay();
    
    // Mon-Fri, 9AM-6PM UTC
    return day >= 1 && day <= 5 && hour >= 9 && hour < 18;
  }
  
  private suggestActions(type: string, priority: string): string[] {
    const actions: Record<string, string[]> = {
      SECURITY: ['Review security logs', 'Check access patterns', 'Enable additional verification'],
      PAYMENT: ['Verify transaction', 'Check payment gateway status', 'Review billing details'],
      AI: ['Check AI usage limits', 'Review model performance', 'Verify API connectivity'],
      INFRASTRUCTURE: ['Check server status', 'Review resource usage', 'Verify backups'],
      EMERGENCY: ['Activate kill switch if needed', 'Contact support', 'Review incident details']
    };
    
    return actions[type] || ['Review notification details', 'Take appropriate action'];
  }
  
  private setupEscalation(notificationId: string, priority: string) {
    const timeout = ESCALATION_TIMEOUTS[priority as keyof typeof ESCALATION_TIMEOUTS] || 60;
    
    const timer = setTimeout(async () => {
      await this.escalate(notificationId);
    }, timeout * 60 * 1000);
    
    this.escalationTimers.set(notificationId, timer);
  }
  
  private async escalate(notificationId: string) {
    const notification = await storage.getSovereignNotification(notificationId);
    if (!notification) return;
    
    // Already acknowledged - no escalation needed
    if (notification.status === 'acknowledged' || notification.status === 'read') {
      this.escalationTimers.delete(notificationId);
      return;
    }
    
    const currentLevel = notification.escalationLevel || 0;
    const newLevel = currentLevel + 1;
    
    // Max 3 escalations
    if (newLevel > 3) {
      // Trigger auto-action if configured
      if (notification.autoActionOnNoResponse) {
        await this.triggerAutoAction(notification);
      }
      return;
    }
    
    // Escalate to next channel
    const escalationChannels = ['PUSH', 'SMS', 'ENCRYPTED'];
    const newChannel = escalationChannels[newLevel - 1] || 'ENCRYPTED';
    
    await storage.escalateNotification(notificationId, newLevel, newChannel);
    
    // Create escalation record
    await storage.createNotificationEscalation({
      notificationId,
      escalationLevel: newLevel,
      previousChannel: notification.channels?.[0] || 'DASHBOARD',
      newChannel,
      reason: 'no_response',
      status: 'sent'
    });
    
    // Set next escalation timer
    this.setupEscalation(notificationId, notification.priority);
  }
  
  private async triggerAutoAction(notification: SovereignNotification) {
    console.log(`[SRINS] Auto-action triggered for notification ${notification.id}: ${notification.autoActionOnNoResponse}`);
    // Implementation depends on the action type
  }
  
  private async deliverToChannels(notification: SovereignNotification) {
    const updates: Array<{channel: string; status: string; sentAt?: string; error?: string}> = [];
    
    for (const channel of notification.channels || []) {
      try {
        await this.deliverToChannel(notification, channel);
        updates.push({
          channel,
          status: 'sent',
          sentAt: new Date().toISOString()
        });
      } catch (error) {
        updates.push({
          channel,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    await storage.updateSovereignNotification(notification.id, {
      channelDeliveryStatus: updates
    });
  }
  
  private async deliverToChannel(notification: SovereignNotification, channel: string) {
    // Helper to safely detect user language preference with normalization
    const getLocalizedContent = (user: any) => {
      let userLang: 'ar' | 'en' = 'ar'; // Default to Arabic
      
      // Safely extract language preference with validation
      try {
        const prefs = user?.preferences;
        if (prefs && typeof prefs === 'object') {
          const rawLang = (prefs as Record<string, unknown>).language;
          if (typeof rawLang === 'string') {
            const normalized = rawLang.toLowerCase().trim();
            // Whitelist: only accept explicit 'en' variants, otherwise default to Arabic
            userLang = normalized.startsWith('en') ? 'en' : 'ar';
          }
        }
      } catch {
        // On any parse/access error, default to Arabic
        userLang = 'ar';
      }
      
      const isArabic = userLang === 'ar';
      const defaultTitle = 'INFERA Notification';
      const defaultMessage = '';
      
      // Language-aware fallback: prefer requested language, then fallback to other
      return {
        language: userLang,
        title: isArabic 
          ? (notification.titleAr || notification.title || defaultTitle)
          : (notification.title || notification.titleAr || defaultTitle),
        message: isArabic
          ? (notification.messageAr || notification.message || defaultMessage)
          : (notification.message || notification.messageAr || defaultMessage)
      };
    };

    switch (channel) {
      case 'DASHBOARD':
        // Already stored in DB, WebSocket will pick it up
        break;
      case 'EMAIL':
        // Get user email and send notification with localized content
        try {
          const targetId = notification.targetUserId;
          if (targetId) {
            const user = await storage.getUser(targetId);
            if (user?.email) {
              const { language, title, message } = getLocalizedContent(user);
              const priority = notification.priority as 'EMERGENCY' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
              await sendNotificationEmail(
                user.email,
                title,
                message,
                priority,
                language,
                storage
              );
            }
          }
        } catch (error) {
          console.error(`[SRINS] Failed to send email notification:`, error);
        }
        break;
      case 'SMS':
        // SMS requires Twilio integration - log for now
        console.log(`[SRINS] SMS notification (Twilio not configured): ${notification.title}`);
        break;
      case 'PUSH':
        // Push requires Web Push/FCM setup - log for now
        console.log(`[SRINS] Push notification (not configured): ${notification.title}`);
        break;
      case 'ENCRYPTED':
        // Special encrypted channel for owner - use secure email with localized content
        try {
          const ownerTargetId = notification.targetUserId;
          if (ownerTargetId) {
            const ownerUser = await storage.getUser(ownerTargetId);
            if (ownerUser?.email) {
              const { language, title, message } = getLocalizedContent(ownerUser);
              await sendNotificationEmail(
                ownerUser.email,
                `[ENCRYPTED] ${title}`,
                message,
                'EMERGENCY',
                language,
                storage
              );
            }
          }
        } catch (error) {
          console.error(`[SRINS] Failed to send encrypted notification:`, error);
        }
        break;
      case 'WEBHOOK':
        // Webhook delivery - log for now until webhook config is implemented
        console.log(`[SRINS] Webhook notification: ${notification.title}`);
        break;
    }
  }
  
  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<SovereignNotification | undefined> {
    // Clear escalation timer
    const timer = this.escalationTimers.get(notificationId);
    if (timer) {
      clearTimeout(timer);
      this.escalationTimers.delete(notificationId);
    }
    
    return storage.markNotificationAsRead(notificationId);
  }
  
  /**
   * Acknowledge notification (for critical ones)
   */
  async acknowledge(notificationId: string, acknowledgedBy: string): Promise<SovereignNotification | undefined> {
    // Clear escalation timer
    const timer = this.escalationTimers.get(notificationId);
    if (timer) {
      clearTimeout(timer);
      this.escalationTimers.delete(notificationId);
    }
    
    return storage.acknowledgeNotification(notificationId, acknowledgedBy);
  }
  
  /**
   * Get notification statistics
   */
  async getStats(userId?: string): Promise<{
    total: number;
    unread: number;
    critical: number;
    pendingAcknowledgment: number;
  }> {
    const notifications = userId 
      ? await storage.getSovereignNotificationsByUser(userId)
      : await storage.getSovereignNotifications(1000);
    
    return {
      total: notifications.length,
      unread: notifications.filter(n => n.status === 'sent').length,
      critical: notifications.filter(n => n.priority === 'CRITICAL' || n.priority === 'EMERGENCY').length,
      pendingAcknowledgment: notifications.filter(n => 
        n.requiresAcknowledgment && n.status !== 'acknowledged'
      ).length
    };
  }
}

export const notificationEngine = new NotificationEngine();
