import {
  NotificationPayload,
  NotificationResult,
  NotificationType,
} from "./notification.interface";
import { INotificationProvider } from "./provider.interface";

// Interface for all strategies (Email, SMS, Push)
export interface INotificationStrategy<
  T extends NotificationPayload = NotificationPayload,
> {
  readonly type: NotificationType;

  setProvider(provider: INotificationProvider<T>): void;

  getProvider(): INotificationProvider<T> | null;

  send(notification: T): Promise<NotificationResult>;

  validate(notification: T): boolean;
}
