import {
  NotificationType,
  NotificationResult,
  EmailNotification,
  SmsNotification,
  PushNotification,
} from "./interfaces/notification.interface";
import { INotificationStrategy } from "./interfaces/strategy.interface";
import logger from "../config/logger";

// User notification preference
export interface UserNotificationPreference {
  preferredChannel: NotificationType; // "email" | "sms" | "push"
  email?: string;
  phone?: string;
  deviceToken?: string;
}

// Generic notification content
export interface NotificationContent {
  subject: string;
  body: string;
  html?: string;
  data?: Record<string, unknown>;
}

// NotificationManager - uses Strategy Pattern with Dependency Injection
export class NotificationManager {
  private strategies: Map<NotificationType, INotificationStrategy> = new Map();

  // Dependency Injection - inject strategies
  constructor(strategies?: INotificationStrategy[]) {
    if (strategies) {
      strategies.forEach((strategy) => {
        this.registerStrategy(strategy);
      });
    }
  }

  // Register a strategy for a notification type
  registerStrategy(strategy: INotificationStrategy): void {
    this.strategies.set(strategy.type, strategy);
    logger.info(`Registered ${strategy.type} strategy`);
  }

  // Get a registered strategy
  getStrategy(type: NotificationType): INotificationStrategy | undefined {
    return this.strategies.get(type);
  }

  // Remove a strategy
  removeStrategy(type: NotificationType): void {
    this.strategies.delete(type);
    logger.info(`Removed ${type} strategy`);
  }

  // Send email notification
  async sendEmail(
    notification: EmailNotification,
  ): Promise<NotificationResult> {
    return this.send("email", notification);
  }

  // Send SMS notification
  async sendSms(notification: SmsNotification): Promise<NotificationResult> {
    return this.send("sms", notification);
  }

  // Send push notification
  async sendPush(notification: PushNotification): Promise<NotificationResult> {
    return this.send("push", notification);
  }

  // Generic send method
  private async send(
    type: NotificationType,
    notification: EmailNotification | SmsNotification | PushNotification,
  ): Promise<NotificationResult> {
    const strategy = this.strategies.get(type);

    if (!strategy) {
      logger.error(`No strategy registered for ${type}`);
      return {
        success: false,
        provider: "none",
        error: `No strategy registered for ${type}`,
        timestamp: new Date(),
      };
    }

    logger.info(
      `Sending ${type} notification using ${strategy.getProvider()?.name}`,
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return strategy.send(notification as any);
  }

  // Send to multiple channels at once
  async sendMultiple(
    notifications: {
      type: NotificationType;
      payload: EmailNotification | SmsNotification | PushNotification;
    }[],
  ): Promise<NotificationResult[]> {
    const results = await Promise.all(
      notifications.map(({ type, payload }) => this.send(type, payload)),
    );
    return results;
  }

  // Send notification based on user's preferred channel (runtime selection)
  async sendToUser(
    user: UserNotificationPreference,
    content: NotificationContent,
  ): Promise<NotificationResult> {
    const { preferredChannel, email, phone, deviceToken } = user;

    logger.info(`Sending notification to user via ${preferredChannel}`);

    switch (preferredChannel) {
      case "email":
        if (!email) {
          return {
            success: false,
            provider: "none",
            error: "User email not provided",
            timestamp: new Date(),
          };
        }
        return this.sendEmail({
          to: email,
          subject: content.subject,
          body: content.body,
          html: content.html,
        });

      case "sms":
        if (!phone) {
          return {
            success: false,
            provider: "none",
            error: "User phone not provided",
            timestamp: new Date(),
          };
        }
        return this.sendSms({
          to: phone,
          body: content.body,
        });

      case "push":
        if (!deviceToken) {
          return {
            success: false,
            provider: "none",
            error: "User device token not provided",
            timestamp: new Date(),
          };
        }
        return this.sendPush({
          to: deviceToken,
          title: content.subject,
          body: content.body,
          data: content.data,
        });

      default:
        return {
          success: false,
          provider: "none",
          error: `Unknown notification channel: ${preferredChannel}`,
          timestamp: new Date(),
        };
    }
  }
}
