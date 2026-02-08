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

// Premium email template wrapper
const getEmailTemplate = (content: {
  title: string;
  greeting: string;
  body: string;
  buttonText?: string;
  buttonUrl?: string;
  buttonColor?: string;
  footerNote?: string;
}): string => {
  const {
    title,
    greeting,
    body,
    buttonText,
    buttonUrl,
    buttonColor = "#FF6B35",
    footerNote,
  } = content;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #FF6B35 0%, #FF8C5A 100%); padding: 32px 40px; text-align: center;">
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td align="center">
                    <div style="width: 60px; height: 60px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; display: inline-block; line-height: 60px;">
                      <span style="font-size: 28px;">🍕</span>
                    </div>
                    <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 16px 0 0 0; letter-spacing: -0.5px;">Pizza Palace</h1>
                    <p style="color: rgba(255, 255, 255, 0.9); font-size: 14px; margin: 4px 0 0 0;">Delicious moments, delivered</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Title Banner -->
          <tr>
            <td style="background-color: #1a1a2e; padding: 24px 40px; text-align: center;">
              <h2 style="color: #ffffff; font-size: 22px; font-weight: 600; margin: 0;">${title}</h2>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #1a1a2e; font-size: 18px; font-weight: 600; margin: 0 0 20px 0;">${greeting}</p>

              <div style="color: #4a4a4a; font-size: 15px; line-height: 1.7;">
                ${body}
              </div>

              ${
                buttonText && buttonUrl
                  ? `
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; margin-top: 32px;">
                <tr>
                  <td align="center">
                    <a href="${buttonUrl}" style="display: inline-block; background-color: ${buttonColor}; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 50px; box-shadow: 0 4px 16px rgba(255, 107, 53, 0.3);">${buttonText}</a>
                  </td>
                </tr>
              </table>
              `
                  : ""
              }

              ${
                footerNote
                  ? `
              <div style="margin-top: 32px; padding: 20px; background-color: #f8f9fa; border-radius: 12px; border-left: 4px solid #FF6B35;">
                <p style="color: #666666; font-size: 14px; margin: 0; line-height: 1.6;">${footerNote}</p>
              </div>
              `
                  : ""
              }
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <hr style="border: none; border-top: 1px solid #eaeaea; margin: 0;">
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background-color: #fafafa;">
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td align="center">
                    <p style="color: #888888; font-size: 13px; margin: 0 0 16px 0;">Need help? We're here for you</p>
                    <table role="presentation">
                      <tr>
                        <td style="padding: 0 12px;">
                          <a href="mailto:support@koushikpanda.online" style="color: #FF6B35; text-decoration: none; font-size: 13px;">Email Support</a>
                        </td>
                        <td style="color: #dddddd;">|</td>
                        <td style="padding: 0 12px;">
                          <a href="${Config.FRONTEND.URL}" style="color: #FF6B35; text-decoration: none; font-size: 13px;">Visit Website</a>
                        </td>
                      </tr>
                    </table>
                    <p style="color: #aaaaaa; font-size: 12px; margin: 24px 0 0 0;">&copy; ${new Date().getFullYear()} Pizza Palace. All rights reserved.</p>
                    <p style="color: #cccccc; font-size: 11px; margin: 8px 0 0 0;">This is an automated message. Please do not reply directly to this email.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

// Status badge HTML
const getStatusBadge = (status: string): string => {
  const statusColors: Record<string, { bg: string; text: string }> = {
    confirmed: { bg: "#e8f5e9", text: "#2e7d32" },
    preparing: { bg: "#fff3e0", text: "#ef6c00" },
    out_for_delivery: { bg: "#e3f2fd", text: "#1565c0" },
    delivered: { bg: "#e8f5e9", text: "#2e7d32" },
    cancelled: { bg: "#ffebee", text: "#c62828" },
    refunded: { bg: "#fce4ec", text: "#ad1457" },
  };

  const colors = statusColors[status.toLowerCase()] || {
    bg: "#f5f5f5",
    text: "#616161",
  };
  const displayStatus = status.replace(/_/g, " ").toUpperCase();

  return `<span style="display: inline-block; background-color: ${colors.bg}; color: ${colors.text}; font-size: 14px; font-weight: 600; padding: 8px 20px; border-radius: 20px; letter-spacing: 0.5px;">${displayStatus}</span>`;
};

// Format order ID for display
const formatOrderId = (orderId: string): string => {
  return orderId.slice(-8).toUpperCase();
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
  const customerName = data.customerName || "Valued Customer";
  const orderId = formatOrderId(data._id);

  let content: NotificationContent;

  switch (payload.event) {
    case "order-created":
      logger.info("Order created:", { id: data._id });
      content = {
        subject: `Order Confirmed! #${orderId}`,
        body: `Hi ${customerName},\n\nYour order #${orderId} has been confirmed.\n\nTotal: ₹${totalAmount}\n\nView your order: ${orderLink}\n\nThank you for choosing Pizza Palace!`,
        html: getEmailTemplate({
          title: "Order Confirmed! ✓",
          greeting: `Hello ${customerName}!`,
          body: `
            <p style="margin: 0 0 16px 0;">Great news! Your order has been <strong>confirmed</strong> and is being processed.</p>

            <table role="presentation" style="width: 100%; background-color: #f8f9fa; border-radius: 12px; padding: 24px; margin: 24px 0;">
              <tr>
                <td>
                  <p style="color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0;">Order Number</p>
                  <p style="color: #1a1a2e; font-size: 20px; font-weight: 700; margin: 0;">#${orderId}</p>
                </td>
                <td align="right">
                  <p style="color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0;">Total Amount</p>
                  <p style="color: #FF6B35; font-size: 24px; font-weight: 700; margin: 0;">₹${totalAmount}</p>
                </td>
              </tr>
            </table>

            <p style="margin: 0;">We'll notify you when your order is being prepared.</p>
          `,
          buttonText: "Track Your Order",
          buttonUrl: orderLink,
          footerNote:
            "Your delicious pizza is on its way! Thank you for choosing Pizza Palace.",
        }),
      };
      await notificationManager.sendToUser(user, content);
      break;

    case "order-status-updated": {
      logger.info("Order status updated:", {
        id: data._id,
        status: data.status,
      });
      const status = data.status || "updated";
      content = {
        subject: `Order Update: ${status.replace(/_/g, " ")} - #${orderId}`,
        body: `Hi ${customerName},\n\nYour order #${orderId} status: ${status}\n\nTrack your order: ${orderLink}`,
        html: getEmailTemplate({
          title: "Order Status Update",
          greeting: `Hello ${customerName}!`,
          body: `
            <p style="margin: 0 0 24px 0;">Your order status has been updated.</p>

            <table role="presentation" style="width: 100%; background-color: #f8f9fa; border-radius: 12px; padding: 24px; margin: 24px 0;">
              <tr>
                <td>
                  <p style="color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0;">Order Number</p>
                  <p style="color: #1a1a2e; font-size: 18px; font-weight: 700; margin: 0 0 16px 0;">#${orderId}</p>

                  <p style="color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">Current Status</p>
                  ${getStatusBadge(status)}
                </td>
              </tr>
            </table>

            <p style="margin: 0;">Click below to track your order in real-time.</p>
          `,
          buttonText: "Track Order",
          buttonUrl: orderLink,
          buttonColor: "#1a1a2e",
        }),
      };
      await notificationManager.sendToUser(user, content);
      break;
    }

    case "order-payment-completed":
      logger.info("Order payment completed:", { id: data._id });
      content = {
        subject: `Payment Successful - #${orderId}`,
        body: `Hi ${customerName},\n\nPayment for order #${orderId} is complete.\n\nAmount: ₹${totalAmount}\n\nView order: ${orderLink}`,
        html: getEmailTemplate({
          title: "Payment Successful! ✓",
          greeting: `Hello ${customerName}!`,
          body: `
            <p style="margin: 0 0 16px 0;">Your payment has been <strong>successfully processed</strong>.</p>

            <table role="presentation" style="width: 100%; background-color: #e8f5e9; border-radius: 12px; padding: 24px; margin: 24px 0;">
              <tr>
                <td align="center">
                  <div style="width: 64px; height: 64px; background-color: #4caf50; border-radius: 50%; display: inline-block; line-height: 64px; margin-bottom: 16px;">
                    <span style="color: #ffffff; font-size: 32px;">✓</span>
                  </div>
                  <p style="color: #2e7d32; font-size: 14px; font-weight: 600; margin: 0;">PAYMENT CONFIRMED</p>
                </td>
              </tr>
            </table>

            <table role="presentation" style="width: 100%; margin: 24px 0;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eaeaea;">
                  <span style="color: #888888;">Order Number</span>
                </td>
                <td align="right" style="padding: 12px 0; border-bottom: 1px solid #eaeaea;">
                  <strong style="color: #1a1a2e;">#${orderId}</strong>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eaeaea;">
                  <span style="color: #888888;">Amount Paid</span>
                </td>
                <td align="right" style="padding: 12px 0; border-bottom: 1px solid #eaeaea;">
                  <strong style="color: #FF6B35; font-size: 18px;">₹${totalAmount}</strong>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0;">
                  <span style="color: #888888;">Payment Status</span>
                </td>
                <td align="right" style="padding: 12px 0;">
                  <span style="color: #4caf50; font-weight: 600;">Completed</span>
                </td>
              </tr>
            </table>

            <p style="margin: 0;">Your order is now being prepared with love!</p>
          `,
          buttonText: "View Order Details",
          buttonUrl: orderLink,
          buttonColor: "#4caf50",
          footerNote:
            "A receipt has been sent to your email. Keep it for your records.",
        }),
      };
      await notificationManager.sendToUser(user, content);
      break;

    case "order-payment-refunded":
      logger.info("Order payment refunded:", { id: data._id });
      content = {
        subject: `Refund Processed - #${orderId}`,
        body: `Hi ${customerName},\n\nRefund for order #${orderId} has been processed.\n\nAmount: ₹${totalAmount}\n\nDetails: ${orderLink}`,
        html: getEmailTemplate({
          title: "Refund Processed",
          greeting: `Hello ${customerName}!`,
          body: `
            <p style="margin: 0 0 16px 0;">Your refund has been <strong>successfully processed</strong>.</p>

            <table role="presentation" style="width: 100%; background-color: #fff3e0; border-radius: 12px; padding: 24px; margin: 24px 0;">
              <tr>
                <td align="center">
                  <div style="width: 64px; height: 64px; background-color: #ff9800; border-radius: 50%; display: inline-block; line-height: 64px; margin-bottom: 16px;">
                    <span style="color: #ffffff; font-size: 28px;">↩</span>
                  </div>
                  <p style="color: #e65100; font-size: 14px; font-weight: 600; margin: 0;">REFUND INITIATED</p>
                </td>
              </tr>
            </table>

            <table role="presentation" style="width: 100%; margin: 24px 0;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eaeaea;">
                  <span style="color: #888888;">Order Number</span>
                </td>
                <td align="right" style="padding: 12px 0; border-bottom: 1px solid #eaeaea;">
                  <strong style="color: #1a1a2e;">#${orderId}</strong>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eaeaea;">
                  <span style="color: #888888;">Refund Amount</span>
                </td>
                <td align="right" style="padding: 12px 0; border-bottom: 1px solid #eaeaea;">
                  <strong style="color: #FF6B35; font-size: 18px;">₹${totalAmount}</strong>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0;">
                  <span style="color: #888888;">Expected By</span>
                </td>
                <td align="right" style="padding: 12px 0;">
                  <strong style="color: #1a1a2e;">5-7 Business Days</strong>
                </td>
              </tr>
            </table>

            <p style="margin: 0;">The refund will be credited to your original payment method.</p>
          `,
          buttonText: "View Details",
          buttonUrl: orderLink,
          buttonColor: "#ff9800",
          footerNote:
            "Refunds typically take 5-7 business days to reflect in your account, depending on your bank.",
        }),
      };
      await notificationManager.sendToUser(user, content);
      break;

    case "order-deleted":
      logger.info("Order deleted:", { id: data._id });
      content = {
        subject: `Order Cancelled - #${orderId}`,
        body: `Hi ${customerName},\n\nYour order #${orderId} has been cancelled.\n\nIf you didn't request this, please contact support.`,
        html: getEmailTemplate({
          title: "Order Cancelled",
          greeting: `Hello ${customerName},`,
          body: `
            <p style="margin: 0 0 16px 0;">Your order has been <strong>cancelled</strong> as requested.</p>

            <table role="presentation" style="width: 100%; background-color: #ffebee; border-radius: 12px; padding: 24px; margin: 24px 0;">
              <tr>
                <td>
                  <p style="color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0;">Order Number</p>
                  <p style="color: #c62828; font-size: 18px; font-weight: 700; margin: 0;">#${orderId}</p>
                  <p style="color: #888888; font-size: 14px; margin: 12px 0 0 0;">Status: <span style="color: #c62828; font-weight: 600;">Cancelled</span></p>
                </td>
              </tr>
            </table>

            <p style="margin: 0;">If you didn't request this cancellation or have any questions, please reach out to our support team.</p>
          `,
          buttonText: "Contact Support",
          buttonUrl: `mailto:support@koushikpanda.online`,
          buttonColor: "#c62828",
          footerNote:
            "If a payment was made, it will be refunded within 5-7 business days.",
        }),
      };
      await notificationManager.sendToUser(user, content);
      break;

    default:
      logger.warn("Unknown event:", { event: payload.event });
  }
};
