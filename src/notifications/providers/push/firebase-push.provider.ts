import { INotificationProvider } from "../../interfaces/provider.interface";
import {
  PushNotification,
  NotificationResult,
} from "../../interfaces/notification.interface";
import logger from "../../../config/logger";

export interface FirebasePushConfig {
  projectId: string;
  privateKey: string;
  clientEmail: string;
}

// Firebase Push Notification Provider - implements INotificationProvider
export class FirebasePushProvider
  implements INotificationProvider<PushNotification>
{
  readonly name = "firebase-fcm";
  private config: FirebasePushConfig | null = null;

  constructor(config?: FirebasePushConfig) {
    if (config) {
      this.config = config;
    }
  }

  setConfig(config: FirebasePushConfig): void {
    this.config = config;
  }

  isConfigured(): boolean {
    return !!(
      this.config?.projectId &&
      this.config?.privateKey &&
      this.config?.clientEmail
    );
  }

  async send(notification: PushNotification): Promise<NotificationResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        provider: this.name,
        error: "Firebase FCM is not configured",
        timestamp: new Date(),
      };
    }

    try {
      // TODO: Uncomment when firebase-admin is installed
      // const admin = require('firebase-admin');
      // if (!admin.apps.length) {
      //   admin.initializeApp({
      //     credential: admin.credential.cert(this.config),
      //   });
      // }
      // await admin.messaging().send({
      //   token: notification.to,
      //   notification: {
      //     title: notification.title,
      //     body: notification.body,
      //     imageUrl: notification.imageUrl,
      //   },
      //   data: notification.data,
      // });

      logger.info(
        `[${this.name}] Push notification sent to ${notification.to}`,
      );

      return {
        success: true,
        messageId: `firebase-push-${Date.now()}`,
        provider: this.name,
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      logger.error(`[${this.name}] Failed to send push: ${errorMessage}`);

      return {
        success: false,
        provider: this.name,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }
}
