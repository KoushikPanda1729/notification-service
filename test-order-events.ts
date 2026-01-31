import { createNotificationManager } from "./src/factories/notification-factory";
import { handleMessage } from "./src/config/messageHandler";
import { ConsumedMessage } from "./src/types/broker";

// Initialize notification manager first
createNotificationManager();

// Helper to create mock Kafka message
const createMockMessage = (event: string, data: object): ConsumedMessage => ({
  topic: "order",
  partition: 0,
  offset: "1",
  key: null,
  value: JSON.stringify({ event, data }),
});

const testOrderEvents = async () => {
  console.log("\n=== Testing Order Event Notifications ===\n");

  // Test 1: Order Created
  console.log("📦 Test 1: Order Created");
  await handleMessage(
    createMockMessage("order-created", {
      _id: "ORD-12345",
      customerName: "John Doe",
      email: "john@example.com",
      preferredChannel: "email",
      totalAmount: 99.99,
    }),
  );
  console.log("---\n");

  // Test 2: Order Status Updated
  console.log("🔄 Test 2: Order Status Updated");
  await handleMessage(
    createMockMessage("order-status-updated", {
      _id: "ORD-12345",
      customerName: "John Doe",
      email: "john@example.com",
      preferredChannel: "email",
      status: "Shipped",
    }),
  );
  console.log("---\n");

  // Test 3: Payment Completed
  console.log("💳 Test 3: Payment Completed");
  await handleMessage(
    createMockMessage("order-payment-completed", {
      _id: "ORD-12345",
      customerName: "John Doe",
      email: "john@example.com",
      preferredChannel: "email",
      totalAmount: 99.99,
    }),
  );
  console.log("---\n");

  // Test 4: Payment Refunded
  console.log("💰 Test 4: Payment Refunded");
  await handleMessage(
    createMockMessage("order-payment-refunded", {
      _id: "ORD-67890",
      customerName: "Jane Smith",
      email: "jane@example.com",
      preferredChannel: "email",
      totalAmount: 50.0,
    }),
  );
  console.log("---\n");

  console.log("✅ All tests completed!");
  console.log("📧 Check emails at: https://ethereal.email/login");
  console.log("   Username: zachery.beahan26@ethereal.email\n");

  process.exit(0);
};

testOrderEvents();
