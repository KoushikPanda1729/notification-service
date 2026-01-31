import { INotificationStrategy } from "../interfaces/strategy.interface";
import { INotificationProvider } from "../interfaces/provider.interface";
import {
  PushNotification,
  NotificationResult,
  NotificationType,
} from "../interfaces/notification.interface";

// Push Notification Strategy - implements INotificationStrategy
export class PushStrategy implements INotificationStrategy<PushNotification> {
  readonly type: NotificationType = "push";
  private provider: INotificationProvider<PushNotification> | null = null;

  // Dependency Injection - inject provider
  constructor(provider?: INotificationProvider<PushNotification>) {
    if (provider) {
      this.provider = provider;
    }
  }

  setProvider(provider: INotificationProvider<PushNotification>): void {
    this.provider = provider;
  }

  getProvider(): INotificationProvider<PushNotification> | null {
    return this.provider;
  }

  validate(notification: PushNotification): boolean {
    if (!notification.to || notification.to.trim() === "") {
      return false;
    }
    if (!notification.title || notification.title.trim() === "") {
      return false;
    }
    if (!notification.body || notification.body.trim() === "") {
      return false;
    }
    return true;
  }

  async send(notification: PushNotification): Promise<NotificationResult> {
    if (!this.provider) {
      return {
        success: false,
        provider: "none",
        error: "No push notification provider configured",
        timestamp: new Date(),
      };
    }

    if (!this.provider.isConfigured()) {
      return {
        success: false,
        provider: this.provider.name,
        error: `Provider ${this.provider.name} is not configured`,
        timestamp: new Date(),
      };
    }

    if (!this.validate(notification)) {
      return {
        success: false,
        provider: this.provider.name,
        error: "Invalid push notification payload",
        timestamp: new Date(),
      };
    }

    return this.provider.send(notification);
  }
}
