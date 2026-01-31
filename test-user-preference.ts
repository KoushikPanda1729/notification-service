import { createNotificationManager } from "./src/factories/notification-factory";
import { UserNotificationPreference } from "./src/notifications/notification.manager";

const testUserPreference = async () => {
  const manager = createNotificationManager();

  // User 1 prefers EMAIL
  const user1: UserNotificationPreference = {
    preferredChannel: "email",
    email: "user1@example.com",
    phone: "+1234567890",
  };

  // User 2 prefers SMS
  const user2: UserNotificationPreference = {
    preferredChannel: "sms",
    email: "user2@example.com",
    phone: "+1234567890",
  };

  // User 3 prefers PUSH
  const user3: UserNotificationPreference = {
    preferredChannel: "push",
    email: "user3@example.com",
    deviceToken: "firebase-device-token-123",
  };

  // Same content, different channels based on user preference
  const content = {
    subject: "Order Confirmed",
    body: "Your order #12345 has been confirmed!",
    html: "<h1>Order Confirmed</h1><p>Your order #12345 has been confirmed!</p>",
  };

  console.log("\n--- Testing User Preferences ---\n");

  // Send to User 1 (will use EMAIL)
  console.log("User 1 prefers: EMAIL");
  const result1 = await manager.sendToUser(user1, content);
  console.log(
    `Result: ${result1.success ? "✅ Sent via " + result1.provider : "❌ " + result1.error}\n`,
  );

  // Send to User 2 (will use SMS)
  console.log("User 2 prefers: SMS");
  const result2 = await manager.sendToUser(user2, content);
  console.log(
    `Result: ${result2.success ? "✅ Sent via " + result2.provider : "❌ " + result2.error}\n`,
  );

  // Send to User 3 (will use PUSH)
  console.log("User 3 prefers: PUSH");
  const result3 = await manager.sendToUser(user3, content);
  console.log(
    `Result: ${result3.success ? "✅ Sent via " + result3.provider : "❌ " + result3.error}\n`,
  );

  process.exit(0);
};

testUserPreference();
