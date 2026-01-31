import logger from "./logger";
import { Config } from "./index";
import { ConsumedMessage } from "../types/broker";
import { getNotificationManager } from "../factories/notification-factory";
import {
  UserNotificationPreference,
  NotificationContent,
} from "../notifications/notification.manager";

// Order event payload from Kafka
interface OrderEventPayload {
  event: string;
  data: {
    _id: string;
    customerId?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    preferredChannel?: "email" | "sms" | "push";
    status?: string;
    total?: number;
    finalTotal?: number;
  };
}

// Build order link for frontend
const getOrderLink = (orderId: string): string => {
  return `${Config.FRONTEND.URL}${Config.FRONTEND.ORDER_PATH}/${orderId}`;
};

export const handleMessage = async (message: ConsumedMessage) => {
  logger.info("Received message:", {
    topic: message.topic,
    partition: message.partition,
    offset: message.offset,
    key: message.key,
  });

  if (!message.value) {
    logger.warn("Empty message value");
    return;
  }

  const payload = JSON.parse(message.value) as OrderEventPayload;
  const notificationManager = getNotificationManager();

  if (!notificationManager) {
    logger.error("Notification manager not initialized");
    return;
  }

  const { data } = payload;

  // Build user preference from event data
  const user: UserNotificationPreference = {
    preferredChannel: data.preferredChannel || "email",
    email: data.customerEmail,
    phone: data.customerPhone,
  };

  // Check if user has required contact info
  if (!data.customerEmail && !data.customerPhone) {
    logger.warn("No contact info provided for notification", {
      orderId: data._id,
    });
    return;
  }

  // Get total amount and order link
  const totalAmount = data.finalTotal || data.total || 0;
  const orderLink = getOrderLink(data._id);

  let content: NotificationContent;

  switch (payload.event) {
    case "order-created":
      logger.info("Order created:", { id: data._id });
      content = {
        subject: "Order Confirmed! 🎉",
        body: `Hi ${data.customerName || "Customer"},\n\nYour order #${data._id} has been created successfully.\n\nTotal: ₹${totalAmount}\n\nView your order: ${orderLink}\n\nThank you for shopping with us!`,
        html: `
          <h2>Order Confirmed! 🎉</h2>
          <p>Hi ${data.customerName || "Customer"},</p>
          <p>Your order <strong>#${data._id}</strong> has been created successfully.</p>
          <p><strong>Total:</strong> ₹${totalAmount}</p>
          <p><a href="${orderLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">View Order</a></p>
          <p>Thank you for shopping with us!</p>
        `,
      };
      await notificationManager.sendToUser(user, content);
      break;

    case "order-status-updated":
      logger.info("Order status updated:", {
        id: data._id,
        status: data.status,
      });
      content = {
        subject: `Order Status: ${data.status || "Updated"}`,
        body: `Hi ${data.customerName || "Customer"},\n\nYour order #${data._id} status has been updated to: ${data.status}\n\nTrack your order: ${orderLink}`,
        html: `
          <h2>Order Status Updated</h2>
          <p>Hi ${data.customerName || "Customer"},</p>
          <p>Your order <strong>#${data._id}</strong> status has been updated to:</p>
          <h3 style="color: #4CAF50;">${data.status || "Updated"}</h3>
          <p><a href="${orderLink}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Track Order</a></p>
        `,
      };
      await notificationManager.sendToUser(user, content);
      break;

    case "order-payment-completed":
      logger.info("Order payment completed:", { id: data._id });
      content = {
        subject: "Payment Successful! ✅",
        body: `Hi ${data.customerName || "Customer"},\n\nPayment for order #${data._id} has been completed successfully.\n\nAmount Paid: ₹${totalAmount}\n\nView your order: ${orderLink}\n\nYour order is being processed.`,
        html: `
          <h2>Payment Successful! ✅</h2>
          <p>Hi ${data.customerName || "Customer"},</p>
          <p>Payment for order <strong>#${data._id}</strong> has been completed successfully.</p>
          <p><strong>Amount Paid:</strong> ₹${totalAmount}</p>
          <p>Your order is being processed and will be shipped soon.</p>
          <p><a href="${orderLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">View Order</a></p>
        `,
      };
      await notificationManager.sendToUser(user, content);
      break;

    case "order-payment-refunded":
      logger.info("Order payment refunded:", { id: data._id });
      content = {
        subject: "Refund Processed 💰",
        body: `Hi ${data.customerName || "Customer"},\n\nYour refund for order #${data._id} has been processed.\n\nRefund Amount: ₹${totalAmount}\n\nView details: ${orderLink}\n\nThe amount will be credited within 5-7 business days.`,
        html: `
          <h2>Refund Processed 💰</h2>
          <p>Hi ${data.customerName || "Customer"},</p>
          <p>Your refund for order <strong>#${data._id}</strong> has been processed.</p>
          <p><strong>Refund Amount:</strong> ₹${totalAmount}</p>
          <p>The amount will be credited to your account within 5-7 business days.</p>
          <p><a href="${orderLink}" style="background-color: #FF9800; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">View Details</a></p>
        `,
      };
      await notificationManager.sendToUser(user, content);
      break;

    case "order-deleted":
      logger.info("Order deleted:", { id: data._id });
      content = {
        subject: "Order Cancelled",
        body: `Hi ${data.customerName || "Customer"},\n\nYour order #${data._id} has been cancelled.\n\nIf you did not request this, please contact support.`,
        html: `
          <h2>Order Cancelled</h2>
          <p>Hi ${data.customerName || "Customer"},</p>
          <p>Your order <strong>#${data._id}</strong> has been cancelled.</p>
          <p>If you did not request this cancellation, please contact our support team.</p>
        `,
      };
      await notificationManager.sendToUser(user, content);
      break;

    default:
      logger.warn("Unknown event:", { event: payload.event });
  }
};
