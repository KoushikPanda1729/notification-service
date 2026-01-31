// Base notification payload that all notification types will extend
export interface BaseNotification {
  to: string;
  subject?: string;
  body: string;
  metadata?: Record<string, unknown>;
}

export interface EmailNotification extends BaseNotification {
  to: string;
  subject: string;
  body: string;
  html?: string;
  from?: string;
  cc?: string[];
  bcc?: string[];
}

export interface SmsNotification extends BaseNotification {
  to: string;
  body: string;
  from?: string;
}

export interface PushNotification extends BaseNotification {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  imageUrl?: string;
}

export type NotificationPayload =
  | EmailNotification
  | SmsNotification
  | PushNotification;

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  provider: string;
  error?: string;
  timestamp: Date;
}

export type NotificationType = "email" | "sms" | "push";
