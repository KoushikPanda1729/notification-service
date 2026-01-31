import {
  NotificationPayload,
  NotificationResult,
} from "./notification.interface";

// Interface for all providers (Twilio, SendGrid, Firebase, etc.)
export interface INotificationProvider<
  T extends NotificationPayload = NotificationPayload,
> {
  readonly name: string;

  send(notification: T): Promise<NotificationResult>;

  isConfigured(): boolean;
}
