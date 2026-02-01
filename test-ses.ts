import { createNotificationManager } from "./src/factories/notification-factory";
import logger from "./src/config/logger";

const testSes = async () => {
  try {
    const manager = createNotificationManager();
    logger.info("Notification manager created with AWS SES");

    // In sandbox mode, you can only send TO verified emails
    // So we send to the same email
    const result = await manager.sendEmail({
      to: "programmer747767@gmail.com",
      subject: "Test Email from AWS SES 🚀",
      body: "This is a test email sent using AWS SES with Strategy Pattern!",
      html: `
        <h1>AWS SES Working! 🚀</h1>
        <p>This email was sent using <strong>AWS SES</strong> via the Strategy Pattern.</p>
        <p>Your notification service is now using production-ready email delivery!</p>
      `,
    });

    if (result.success) {
      logger.info("Email sent successfully!", {
        messageId: result.messageId,
        provider: result.provider,
      });
      console.log("\n✅ Email sent successfully via AWS SES!");
      console.log(`📧 Message ID: ${result.messageId}`);
      console.log(`📬 Check your inbox: programmer747767@gmail.com`);
    } else {
      logger.error("Failed to send email", { error: result.error });
      console.log("\n❌ Failed to send email:", result.error);
    }
  } catch (error) {
    console.error("Error:", error);
  }

  process.exit(0);
};

testSes();
