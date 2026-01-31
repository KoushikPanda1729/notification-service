import { INotificationProvider } from "../../interfaces/provider.interface";
import {
  SmsNotification,
  NotificationResult,
} from "../../interfaces/notification.interface";
import logger from "../../../config/logger";

export interface TwilioSmsConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

// Twilio SMS Provider - implements INotificationProvider
export class TwilioSmsProvider
  implements INotificationProvider<SmsNotification>
{
  readonly name = "twilio-sms";
  private config: TwilioSmsConfig | null = null;

  constructor(config?: TwilioSmsConfig) {
    if (config) {
      this.config = config;
    }
  }

  setConfig(config: TwilioSmsConfig): void {
    this.config = config;
  }

  isConfigured(): boolean {
    return !!(
      this.config?.accountSid &&
      this.config?.authToken &&
      this.config?.fromNumber
    );
  }

  async send(notification: SmsNotification): Promise<NotificationResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        provider: this.name,
        error: "Twilio SMS is not configured",
        timestamp: new Date(),
      };
    }

    try {
      // TODO: Uncomment when twilio is installed
      // const twilio = require('twilio')(this.config!.accountSid, this.config!.authToken);
      // const message = await twilio.messages.create({
      //   body: notification.body,
      //   from: notification.from || this.config!.fromNumber,
      //   to: notification.to,
      // });

      logger.info(`[${this.name}] SMS sent to ${notification.to}`);

      return {
        success: true,
        messageId: `twilio-sms-${Date.now()}`,
        provider: this.name,
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      logger.error(`[${this.name}] Failed to send SMS: ${errorMessage}`);

      return {
        success: false,
        provider: this.name,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }
}
