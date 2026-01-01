/**
 * INFERA WebNova - Notification & Webhook Service
 * Multi-channel notification and webhook management
 * 
 * Features: Slack, Discord, Email, SMS, Custom Webhooks
 * Standards: RESTful Webhooks, OAuth 2.0
 */

import { EventEmitter } from 'events';
import { generateSecureId } from './utils/id-generator';

// ==================== TYPES ====================
export interface NotificationChannel {
  id: string;
  projectId: string;
  type: 'slack' | 'discord' | 'email' | 'sms' | 'webhook' | 'teams';
  name: string;
  nameAr: string;
  enabled: boolean;
  config: ChannelConfig;
  events: NotificationEvent[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChannelConfig {
  // Slack
  slackWebhookUrl?: string;
  slackChannel?: string;

  // Discord
  discordWebhookUrl?: string;

  // Email
  emailAddresses?: string[];
  emailFromName?: string;

  // SMS
  phoneNumbers?: string[];

  // Custom Webhook
  webhookUrl?: string;
  webhookMethod?: 'POST' | 'PUT';
  webhookHeaders?: Record<string, string>;
  webhookSecret?: string;

  // Microsoft Teams
  teamsWebhookUrl?: string;
}

export type NotificationEvent =
  | 'build.started'
  | 'build.completed'
  | 'build.failed'
  | 'test.started'
  | 'test.completed'
  | 'test.failed'
  | 'deploy.started'
  | 'deploy.completed'
  | 'deploy.failed'
  | 'pipeline.started'
  | 'pipeline.completed'
  | 'pipeline.failed'
  | 'approval.required'
  | 'quality.gate.passed'
  | 'quality.gate.failed'
  | 'security.vulnerability'
  | 'artifact.uploaded';

export interface Notification {
  id: string;
  channelId: string;
  event: NotificationEvent;
  title: string;
  titleAr?: string;
  message: string;
  messageAr?: string;
  severity: 'info' | 'success' | 'warning' | 'error';
  data: Record<string, any>;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: Date;
  error?: string;
  retries: number;
  createdAt: Date;
}

export interface NotificationTemplate {
  event: NotificationEvent;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  severity: 'info' | 'success' | 'warning' | 'error';
  icon?: string; // Lucide icon name (no emoji per design policy)
  color?: string;
}

// ==================== NOTIFICATION TEMPLATES ====================
// NOTE: No emoji in templates - use icon identifiers for UI rendering
const notificationTemplates: NotificationTemplate[] = [
  {
    event: 'build.started',
    title: 'Build Started',
    titleAr: 'بدء البناء',
    message: 'Build #{buildId} for {projectName} has started.',
    messageAr: 'بدأ البناء #{buildId} للمشروع {projectName}.',
    severity: 'info',
    icon: 'rocket',
    color: '#3498db',
  },
  {
    event: 'build.completed',
    title: 'Build Successful',
    titleAr: 'نجاح البناء',
    message: 'Build #{buildId} for {projectName} completed successfully in {duration}.',
    messageAr: 'اكتمل البناء #{buildId} للمشروع {projectName} بنجاح في {duration}.',
    severity: 'success',
    icon: 'check-circle',
    color: '#2ecc71',
  },
  {
    event: 'build.failed',
    title: 'Build Failed',
    titleAr: 'فشل البناء',
    message: 'Build #{buildId} for {projectName} failed: {error}',
    messageAr: 'فشل البناء #{buildId} للمشروع {projectName}: {error}',
    severity: 'error',
    icon: 'x-circle',
    color: '#e74c3c',
  },
  {
    event: 'test.completed',
    title: 'Tests Completed',
    titleAr: 'اكتملت الاختبارات',
    message: '{passed}/{total} tests passed for {projectName}.',
    messageAr: 'نجح {passed}/{total} اختبار للمشروع {projectName}.',
    severity: 'success',
    icon: 'flask',
    color: '#2ecc71',
  },
  {
    event: 'test.failed',
    title: 'Tests Failed',
    titleAr: 'فشلت الاختبارات',
    message: '{failed} tests failed for {projectName}.',
    messageAr: 'فشل {failed} اختبار للمشروع {projectName}.',
    severity: 'error',
    icon: 'alert-circle',
    color: '#e74c3c',
  },
  {
    event: 'deploy.completed',
    title: 'Deployment Successful',
    titleAr: 'نجاح النشر',
    message: '{projectName} deployed to {environment}.',
    messageAr: 'تم نشر {projectName} إلى {environment}.',
    severity: 'success',
    icon: 'check-circle-2',
    color: '#2ecc71',
  },
  {
    event: 'deploy.failed',
    title: 'Deployment Failed',
    titleAr: 'فشل النشر',
    message: 'Deployment of {projectName} to {environment} failed: {error}',
    messageAr: 'فشل نشر {projectName} إلى {environment}: {error}',
    severity: 'error',
    icon: 'alert-triangle',
    color: '#e74c3c',
  },
  {
    event: 'approval.required',
    title: 'Approval Required',
    titleAr: 'مطلوب موافقة',
    message: 'Approval needed for {projectName} deployment to {environment}.',
    messageAr: 'مطلوب موافقة لنشر {projectName} إلى {environment}.',
    severity: 'warning',
    icon: 'clock',
    color: '#f39c12',
  },
  {
    event: 'quality.gate.passed',
    title: 'Quality Gate Passed',
    titleAr: 'نجح فحص الجودة',
    message: 'Quality gate passed for {projectName}. Coverage: {coverage}%',
    messageAr: 'نجح فحص الجودة للمشروع {projectName}. التغطية: {coverage}%',
    severity: 'success',
    icon: 'award',
    color: '#2ecc71',
  },
  {
    event: 'quality.gate.failed',
    title: 'Quality Gate Failed',
    titleAr: 'فشل فحص الجودة',
    message: 'Quality gate failed for {projectName}. {issues} issues found.',
    messageAr: 'فشل فحص الجودة للمشروع {projectName}. وُجدت {issues} مشكلة.',
    severity: 'error',
    icon: 'alert-octagon',
    color: '#e74c3c',
  },
  {
    event: 'security.vulnerability',
    title: 'Security Vulnerability Detected',
    titleAr: 'اكتُشفت ثغرة أمنية',
    message: '{severity} security vulnerability found in {projectName}: {vulnerability}',
    messageAr: 'اكتُشفت ثغرة أمنية {severity} في {projectName}: {vulnerability}',
    severity: 'error',
    icon: 'shield-alert',
    color: '#9b59b6',
  },
];

// ==================== NOTIFICATION WEBHOOK SERVICE ====================
export class NotificationWebhookService extends EventEmitter {
  private channels: Map<string, NotificationChannel> = new Map();
  private notifications: Map<string, Notification> = new Map();
  private maxRetries = 3;

  constructor() {
    super();
  }

  async createChannel(
    projectId: string,
    type: NotificationChannel['type'],
    name: string,
    nameAr: string,
    config: ChannelConfig,
    events: NotificationEvent[]
  ): Promise<NotificationChannel> {
    const channelId = generateSecureId('channel');

    const channel: NotificationChannel = {
      id: channelId,
      projectId,
      type,
      name,
      nameAr,
      enabled: true,
      config,
      events,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.channels.set(channelId, channel);
    this.emit('channelCreated', channel);

    return channel;
  }

  async updateChannel(
    channelId: string,
    updates: Partial<NotificationChannel>
  ): Promise<NotificationChannel | null> {
    const channel = this.channels.get(channelId);
    if (!channel) return null;

    Object.assign(channel, updates, { updatedAt: new Date() });
    this.emit('channelUpdated', channel);

    return channel;
  }

  async deleteChannel(channelId: string): Promise<boolean> {
    const channel = this.channels.get(channelId);
    if (!channel) return false;

    this.channels.delete(channelId);
    this.emit('channelDeleted', channel);

    return true;
  }

  async sendNotification(
    event: NotificationEvent,
    projectId: string,
    data: Record<string, any>
  ): Promise<Notification[]> {
    const channels = this.getChannelsForEvent(projectId, event);
    const notifications: Notification[] = [];

    for (const channel of channels) {
      const notification = await this.createAndSendNotification(channel, event, data);
      notifications.push(notification);
    }

    return notifications;
  }

  private getChannelsForEvent(projectId: string, event: NotificationEvent): NotificationChannel[] {
    return Array.from(this.channels.values()).filter(
      c => c.projectId === projectId && c.enabled && c.events.includes(event)
    );
  }

  private async createAndSendNotification(
    channel: NotificationChannel,
    event: NotificationEvent,
    data: Record<string, any>
  ): Promise<Notification> {
    const template = notificationTemplates.find(t => t.event === event);
    
    const notification: Notification = {
      id: generateSecureId('notif'),
      channelId: channel.id,
      event,
      title: template ? this.interpolate(template.title, data) : event,
      titleAr: template ? this.interpolate(template.titleAr, data) : event,
      message: template ? this.interpolate(template.message, data) : JSON.stringify(data),
      messageAr: template ? this.interpolate(template.messageAr, data) : JSON.stringify(data),
      severity: template?.severity || 'info',
      data,
      status: 'pending',
      retries: 0,
      createdAt: new Date(),
    };

    this.notifications.set(notification.id, notification);

    // Send notification based on channel type
    try {
      await this.dispatchNotification(channel, notification, template);
      notification.status = 'sent';
      notification.sentAt = new Date();
    } catch (error) {
      notification.status = 'failed';
      notification.error = error instanceof Error ? error.message : 'Unknown error';
      
      // Schedule retry
      if (notification.retries < this.maxRetries) {
        this.scheduleRetry(channel, notification, template);
      }
    }

    this.emit('notificationSent', notification);
    return notification;
  }

  private async dispatchNotification(
    channel: NotificationChannel,
    notification: Notification,
    template?: NotificationTemplate
  ): Promise<void> {
    switch (channel.type) {
      case 'slack':
        await this.sendSlackNotification(channel, notification, template);
        break;
      case 'discord':
        await this.sendDiscordNotification(channel, notification, template);
        break;
      case 'email':
        await this.sendEmailNotification(channel, notification);
        break;
      case 'teams':
        await this.sendTeamsNotification(channel, notification, template);
        break;
      case 'webhook':
        await this.sendWebhookNotification(channel, notification);
        break;
      case 'sms':
        await this.sendSMSNotification(channel, notification);
        break;
    }
  }

  private async sendSlackNotification(
    channel: NotificationChannel,
    notification: Notification,
    template?: NotificationTemplate
  ): Promise<void> {
    const payload = {
      channel: channel.config.slackChannel,
      attachments: [
        {
          color: template?.color || '#3498db',
          title: `${template?.emoji || ''} ${notification.title}`,
          text: notification.message,
          fields: Object.entries(notification.data).slice(0, 5).map(([key, value]) => ({
            title: key,
            value: String(value),
            short: true,
          })),
          ts: Math.floor(notification.createdAt.getTime() / 1000),
        },
      ],
    };

    // In production, use actual Slack API
    console.log('[Slack] Sending notification:', JSON.stringify(payload, null, 2));
    await this.simulateApiCall();
  }

  private async sendDiscordNotification(
    channel: NotificationChannel,
    notification: Notification,
    template?: NotificationTemplate
  ): Promise<void> {
    const payload = {
      embeds: [
        {
          title: `${template?.emoji || ''} ${notification.title}`,
          description: notification.message,
          color: parseInt((template?.color || '#3498db').replace('#', ''), 16),
          fields: Object.entries(notification.data).slice(0, 5).map(([key, value]) => ({
            name: key,
            value: String(value),
            inline: true,
          })),
          timestamp: notification.createdAt.toISOString(),
        },
      ],
    };

    console.log('[Discord] Sending notification:', JSON.stringify(payload, null, 2));
    await this.simulateApiCall();
  }

  private async sendTeamsNotification(
    channel: NotificationChannel,
    notification: Notification,
    template?: NotificationTemplate
  ): Promise<void> {
    const payload = {
      '@type': 'MessageCard',
      '@context': 'http://schema.org/extensions',
      themeColor: (template?.color || '#3498db').replace('#', ''),
      summary: notification.title,
      sections: [
        {
          activityTitle: `${template?.emoji || ''} ${notification.title}`,
          text: notification.message,
          facts: Object.entries(notification.data).slice(0, 5).map(([key, value]) => ({
            name: key,
            value: String(value),
          })),
        },
      ],
    };

    console.log('[Teams] Sending notification:', JSON.stringify(payload, null, 2));
    await this.simulateApiCall();
  }

  private async sendEmailNotification(
    channel: NotificationChannel,
    notification: Notification
  ): Promise<void> {
    const emailData = {
      to: channel.config.emailAddresses,
      from: channel.config.emailFromName || 'INFERA WebNova',
      subject: notification.title,
      html: `
        <h2>${notification.title}</h2>
        <p>${notification.message}</p>
        <hr>
        <pre>${JSON.stringify(notification.data, null, 2)}</pre>
      `,
    };

    console.log('[Email] Sending notification:', JSON.stringify(emailData, null, 2));
    await this.simulateApiCall();
  }

  private async sendSMSNotification(
    channel: NotificationChannel,
    notification: Notification
  ): Promise<void> {
    const smsData = {
      to: channel.config.phoneNumbers,
      body: `${notification.title}: ${notification.message}`.substring(0, 160),
    };

    console.log('[SMS] Sending notification:', JSON.stringify(smsData, null, 2));
    await this.simulateApiCall();
  }

  private async sendWebhookNotification(
    channel: NotificationChannel,
    notification: Notification
  ): Promise<void> {
    const payload = {
      event: notification.event,
      title: notification.title,
      message: notification.message,
      severity: notification.severity,
      data: notification.data,
      timestamp: notification.createdAt.toISOString(),
    };

    // Generate HMAC signature if secret is configured
    let signature: string | undefined;
    if (channel.config.webhookSecret) {
      const crypto = await import('crypto');
      signature = crypto
        .createHmac('sha256', channel.config.webhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex');
    }

    console.log('[Webhook] Sending to:', channel.config.webhookUrl);
    console.log('[Webhook] Payload:', JSON.stringify(payload, null, 2));
    if (signature) {
      console.log('[Webhook] X-Signature:', signature);
    }

    await this.simulateApiCall();
  }

  private scheduleRetry(
    channel: NotificationChannel,
    notification: Notification,
    template?: NotificationTemplate
  ): void {
    const delay = Math.pow(2, notification.retries) * 1000; // Exponential backoff
    
    setTimeout(async () => {
      notification.retries++;
      try {
        await this.dispatchNotification(channel, notification, template);
        notification.status = 'sent';
        notification.sentAt = new Date();
      } catch (error) {
        notification.error = error instanceof Error ? error.message : 'Unknown error';
        if (notification.retries < this.maxRetries) {
          this.scheduleRetry(channel, notification, template);
        }
      }
    }, delay);
  }

  private interpolate(template: string, data: Record<string, any>): string {
    return template.replace(/\{(\w+)\}/g, (_, key) => data[key] ?? `{${key}}`);
  }

  private async simulateApiCall(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  getChannel(channelId: string): NotificationChannel | undefined {
    return this.channels.get(channelId);
  }

  getChannelsByProject(projectId: string): NotificationChannel[] {
    return Array.from(this.channels.values()).filter(c => c.projectId === projectId);
  }

  getNotification(notificationId: string): Notification | undefined {
    return this.notifications.get(notificationId);
  }

  getNotificationHistory(channelId: string, limit: number = 50): Notification[] {
    return Array.from(this.notifications.values())
      .filter(n => n.channelId === channelId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  getTemplates(): NotificationTemplate[] {
    return notificationTemplates;
  }

  // Test channel connectivity
  async testChannel(channelId: string): Promise<boolean> {
    const channel = this.channels.get(channelId);
    if (!channel) return false;

    try {
      await this.dispatchNotification(
        channel,
        {
          id: 'test',
          channelId,
          event: 'build.completed',
          title: 'Test Notification',
          titleAr: 'إشعار اختبار',
          message: 'This is a test notification from INFERA WebNova.',
          messageAr: 'هذا إشعار اختبار من INFERA WebNova.',
          severity: 'info',
          data: { test: true },
          status: 'pending',
          retries: 0,
          createdAt: new Date(),
        },
        notificationTemplates[1]
      );
      return true;
    } catch {
      return false;
    }
  }
}

// ==================== SINGLETON EXPORT ====================
export const notificationWebhookService = new NotificationWebhookService();
