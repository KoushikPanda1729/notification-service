import config from "config";

export const Config = {
  KAFKA_CLIENT_ID: config.get<string>("kafka.clientId"),
  KAFKA_BROKER: config.get<string>("kafka.broker"),
  LOG_SILENT: config.get<boolean>("logging.silent"),

  // Email Provider Config
  EMAIL_PROVIDER: config.get<string>("notifications.email.provider"),
  NODEMAILER: {
    HOST: config.get<string>("notifications.email.nodemailer.host"),
    PORT: config.get<number>("notifications.email.nodemailer.port"),
    SECURE: config.get<boolean>("notifications.email.nodemailer.secure"),
    AUTH: {
      USER: config.get<string>("notifications.email.nodemailer.auth.user"),
      PASS: config.get<string>("notifications.email.nodemailer.auth.pass"),
    },
    FROM_EMAIL: config.get<string>("notifications.email.nodemailer.fromEmail"),
  },
  SES: {
    HOST: config.get<string>("notifications.email.ses.host"),
    PORT: config.get<number>("notifications.email.ses.port"),
    SECURE: config.get<boolean>("notifications.email.ses.secure"),
    REGION: config.get<string>("notifications.email.ses.region"),
    AUTH: {
      USER: config.get<string>("notifications.email.ses.auth.user"),
      PASS: config.get<string>("notifications.email.ses.auth.pass"),
    },
    FROM_EMAIL: config.get<string>("notifications.email.ses.fromEmail"),
  },

  // SMS Provider Config
  SMS_PROVIDER: config.get<string>("notifications.sms.provider"),
  TWILIO: {
    ACCOUNT_SID: config.get<string>("notifications.sms.twilio.accountSid"),
    AUTH_TOKEN: config.get<string>("notifications.sms.twilio.authToken"),
    FROM_NUMBER: config.get<string>("notifications.sms.twilio.fromNumber"),
  },

  // Push Provider Config
  PUSH_PROVIDER: config.get<string>("notifications.push.provider"),
  FIREBASE: {
    PROJECT_ID: config.get<string>("notifications.push.firebase.projectId"),
    PRIVATE_KEY: config.get<string>("notifications.push.firebase.privateKey"),
    CLIENT_EMAIL: config.get<string>("notifications.push.firebase.clientEmail"),
  },

  // Frontend Config
  FRONTEND: {
    URL: config.get<string>("frontend.url"),
    ORDER_PATH: config.get<string>("frontend.orderPath"),
  },
};
