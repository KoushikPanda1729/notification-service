import { INotificationStrategy } from "../interfaces/strategy.interface";
import { INotificationProvider } from "../interfaces/provider.interface";
import {
  EmailNotification,
  NotificationResult,
  NotificationType,
} from "../interfaces/notification.interface";

// Email Strategy - implements INotificationStrategy
export class EmailStrategy implements INotificationStrategy<EmailNotification> {
  readonly type: NotificationType = "email";
  private provider: INotificationProvider<EmailNotification> | null = null;

  // Dependency Injection - inject provider
  constructor(provider?: INotificationProvider<EmailNotification>) {
    if (provider) {
      this.provider = provider;
    }
  }

  setProvider(provider: INotificationProvider<EmailNotification>): void {
    this.provider = provider;
  }

  getProvider(): INotificationProvider<EmailNotification> | null {
    return this.provider;
  }

  validate(notification: EmailNotification): boolean {
    if (!notification.to || !this.isValidEmail(notification.to)) {
      return false;
    }
    if (!notification.subject || notification.subject.trim() === "") {
      return false;
    }
    if (!notification.body || notification.body.trim() === "") {
      return false;
    }
    return true;
  }

  async send(notification: EmailNotification): Promise<NotificationResult> {
    if (!this.provider) {
      return {
        success: false,
        provider: "none",
        error: "No email provider configured",
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
        error: "Invalid email notification payload",
        timestamp: new Date(),
      };
    }

    return this.provider.send(notification);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
