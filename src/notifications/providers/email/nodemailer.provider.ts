import { INotificationProvider } from "../../interfaces/provider.interface";
import {
  EmailNotification,
  NotificationResult,
} from "../../interfaces/notification.interface";
import logger from "../../../config/logger";
import nodemailer, { Transporter } from "nodemailer";

export interface NodemailerConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  fromEmail: string;
}

// Nodemailer Email Provider - implements INotificationProvider
export class NodemailerProvider
  implements INotificationProvider<EmailNotification>
{
  readonly name = "nodemailer";
  private config: NodemailerConfig | null = null;
  private transporter: Transporter | null = null;

  constructor(config?: NodemailerConfig) {
    if (config) {
      this.setConfig(config);
    }
  }

  setConfig(config: NodemailerConfig): void {
    this.config = config;
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.auth.user,
        pass: config.auth.pass,
      },
    });
  }

  isConfigured(): boolean {
    return !!(this.config && this.transporter);
  }

  async send(notification: EmailNotification): Promise<NotificationResult> {
    if (!this.isConfigured() || !this.transporter) {
      return {
        success: false,
        provider: this.name,
        error: "Nodemailer is not configured",
        timestamp: new Date(),
      };
    }

    try {
      const info = await this.transporter.sendMail({
        from: notification.from || this.config!.fromEmail,
        to: notification.to,
        cc: notification.cc?.join(", "),
        bcc: notification.bcc?.join(", "),
        subject: notification.subject,
        text: notification.body,
        html: notification.html,
      });

      logger.info(`[${this.name}] Email sent to ${notification.to}`);

      return {
        success: true,
        messageId: info.messageId,
        provider: this.name,
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      logger.error(`[${this.name}] Failed to send email: ${errorMessage}`);

      return {
        success: false,
        provider: this.name,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }
}
