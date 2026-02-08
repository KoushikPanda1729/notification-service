import { Config } from "../config";
import { NotificationManager } from "../notifications/notification.manager";
import { EmailStrategy } from "../notifications/strategies/email.strategy";
import { SmsStrategy } from "../notifications/strategies/sms.strategy";
import { PushStrategy } from "../notifications/strategies/push.strategy";
import { INotificationProvider } from "../notifications/interfaces/provider.interface";
import {
  EmailNotification,
  SmsNotification,
  PushNotification,
} from "../notifications/interfaces/notification.interface";

// Email Provider
import { NodemailerProvider } from "../notifications/providers/email/nodemailer.provider";
import { SesProvider } from "../notifications/providers/email/ses.provider";

// SMS Providers
import { TwilioSmsProvider } from "../notifications/providers/sms/twilio-sms.provider";
// Add more SMS providers here: import { VonageProvider } from "...";

// Push Providers
import { FirebasePushProvider } from "../notifications/providers/push/firebase-push.provider";
// Add more push providers here: import { OneSignalProvider } from "...";

let notificationManager: NotificationManager | null = null;

// Factory function to create Email Provider based on config
function createEmailProvider(): INotificationProvider<EmailNotification> {
  switch (Config.EMAIL_PROVIDER) {
    case "nodemailer":
      return new NodemailerProvider({
        host: Config.NODEMAILER.HOST,
        port: Config.NODEMAILER.PORT,
        secure: Config.NODEMAILER.SECURE,
        auth: {
          user: Config.NODEMAILER.AUTH.USER,
          pass: Config.NODEMAILER.AUTH.PASS,
        },
        fromEmail: Config.NODEMAILER.FROM_EMAIL,
      });

    case "ses":
      return new SesProvider({
        host: Config.SES.HOST,
        port: Config.SES.PORT,
        secure: Config.SES.SECURE,
        region: Config.SES.REGION,
        auth: {
          user: Config.SES.AUTH.USER,
          pass: Config.SES.AUTH.PASS,
        },
        fromEmail: Config.SES.FROM_EMAIL,
      });

    default:
      throw new Error(`Unknown email provider: ${Config.EMAIL_PROVIDER}`);
  }
}

// Factory function to create SMS Provider based on config
function createSmsProvider(): INotificationProvider<SmsNotification> {
  switch (Config.SMS_PROVIDER) {
    case "twilio":
      return new TwilioSmsProvider({
        accountSid: Config.TWILIO.ACCOUNT_SID,
        authToken: Config.TWILIO.AUTH_TOKEN,
        fromNumber: Config.TWILIO.FROM_NUMBER,
      });

    // Add more cases when you add new providers:
    // case "vonage":
    //   return new VonageProvider({ apiKey: Config.VONAGE.API_KEY });

    default:
      throw new Error(`Unknown SMS provider: ${Config.SMS_PROVIDER}`);
  }
}

// Factory function to create Push Provider based on config
function createPushProvider(): INotificationProvider<PushNotification> {
  switch (Config.PUSH_PROVIDER) {
    case "firebase":
      return new FirebasePushProvider({
        projectId: Config.FIREBASE.PROJECT_ID,
        privateKey: Config.FIREBASE.PRIVATE_KEY,
        clientEmail: Config.FIREBASE.CLIENT_EMAIL,
      });

    // Add more cases when you add new providers:
    // case "onesignal":
    //   return new OneSignalProvider({ appId: Config.ONESIGNAL.APP_ID });

    default:
      throw new Error(`Unknown push provider: ${Config.PUSH_PROVIDER}`);
  }
}

// Factory to create NotificationManager with dependency injection
export function createNotificationManager(): NotificationManager {
  if (notificationManager) {
    return notificationManager;
  }

  // Create providers based on config (switch case)
  const emailProvider = createEmailProvider();
  const smsProvider = createSmsProvider();
  const pushProvider = createPushProvider();

  // Create strategies with injected providers
  const emailStrategy = new EmailStrategy(emailProvider);
  const smsStrategy = new SmsStrategy(smsProvider);
  const pushStrategy = new PushStrategy(pushProvider);

  // Create manager with injected strategies
  notificationManager = new NotificationManager([
    emailStrategy,
    smsStrategy,
    pushStrategy,
  ]);

  return notificationManager;
}

// Get existing manager instance
export function getNotificationManager(): NotificationManager | null {
  return notificationManager;
}
