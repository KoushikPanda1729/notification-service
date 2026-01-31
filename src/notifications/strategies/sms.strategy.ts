import { INotificationStrategy } from "../interfaces/strategy.interface";
import { INotificationProvider } from "../interfaces/provider.interface";
import {
  SmsNotification,
  NotificationResult,
  NotificationType,
} from "../interfaces/notification.interface";

// SMS Strategy - implements INotificationStrategy
export class SmsStrategy implements INotificationStrategy<SmsNotification> {
  readonly type: NotificationType = "sms";
  private provider: INotificationProvider<SmsNotification> | null = null;

  // Dependency Injection - inject provider
  constructor(provider?: INotificationProvider<SmsNotification>) {
    if (provider) {
      this.provider = provider;
    }
  }

  setProvider(provider: INotificationProvider<SmsNotification>): void {
    this.provider = provider;
  }

  getProvider(): INotificationProvider<SmsNotification> | null {
    return this.provider;
  }

  validate(notification: SmsNotification): boolean {
    if (!notification.to || !this.isValidPhone(notification.to)) {
      return false;
    }
    if (!notification.body || notification.body.trim() === "") {
      return false;
    }
    return true;
  }

  async send(notification: SmsNotification): Promise<NotificationResult> {
    if (!this.provider) {
      return {
        success: false,
        provider: "none",
        error: "No SMS provider configured",
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
        error: "Invalid SMS notification payload",
        timestamp: new Date(),
      };
    }

    return this.provider.send(notification);
  }

  private isValidPhone(phone: string): boolean {
    // Basic phone validation - starts with + and has 10-15 digits
    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ""));
  }
}
