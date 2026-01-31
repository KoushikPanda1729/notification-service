# Notification Service

A flexible notification service built with **Strategy Pattern** and **Dependency Injection**. Easily switch between notification types (Email, SMS, Push) and providers (Nodemailer, Twilio, Firebase) without changing core code.

## Architecture

```
src/notifications/
├── interfaces/                        # Interfaces
│   ├── notification.interface.ts      # Notification types & payloads
│   ├── provider.interface.ts          # INotificationProvider
│   └── strategy.interface.ts          # INotificationStrategy
├── providers/                         # Provider implementations
│   ├── email/nodemailer.provider.ts   # Nodemailer (Ethereal for dev)
│   ├── sms/twilio-sms.provider.ts     # Twilio SMS
│   └── push/firebase-push.provider.ts # Firebase FCM
├── strategies/                        # Strategy implementations
│   ├── email.strategy.ts
│   ├── sms.strategy.ts
│   └── push.strategy.ts
└── notification.manager.ts            # Main manager (uses DI)
```

## Installation

```bash
npm install
```

## Configuration

Edit `config/development.yaml`:

```yaml
notifications:
  email:
    provider: "nodemailer"
    nodemailer:
      host: "smtp.ethereal.email" # Use Ethereal for testing
      port: 587
      secure: false
      auth:
        user: "your-ethereal-user"
        pass: "your-ethereal-pass"
      fromEmail: "noreply@ethereal.email"

  sms:
    provider: "twilio"
    twilio:
      accountSid: "your-account-sid"
      authToken: "your-auth-token"
      fromNumber: "+1234567890"

  push:
    provider: "firebase"
    firebase:
      projectId: "your-project-id"
      privateKey: "your-private-key"
      clientEmail: "your-client-email"
```

## Usage

### Basic Usage

```typescript
import { createNotificationManager } from "./src/factories/notification-factory";

const manager = createNotificationManager();

// Send Email
await manager.sendEmail({
  to: "user@example.com",
  subject: "Hello",
  body: "This is a test email",
});

// Send SMS
await manager.sendSms({
  to: "+1234567890",
  body: "This is a test SMS",
});

// Send Push Notification
await manager.sendPush({
  to: "device-token",
  title: "Hello",
  body: "This is a test push notification",
});
```

### Send Multiple Notifications

```typescript
await manager.sendMultiple([
  {
    type: "email",
    payload: { to: "user@example.com", subject: "Hi", body: "Email" },
  },
  { type: "sms", payload: { to: "+1234567890", body: "SMS" } },
]);
```

## Adding a New Provider

**Example: Add Vonage SMS Provider**

1. Create the provider class implementing `INotificationProvider`:

```typescript
// src/notifications/providers/sms/vonage-sms.provider.ts
import { INotificationProvider } from "../../interfaces/provider.interface";
import {
  SmsNotification,
  NotificationResult,
} from "../../interfaces/notification.interface";

export interface VonageConfig {
  apiKey: string;
  apiSecret: string;
  fromNumber: string;
}

export class VonageSmsProvider
  implements INotificationProvider<SmsNotification>
{
  readonly name = "vonage-sms";
  private config: VonageConfig | null = null;

  constructor(config?: VonageConfig) {
    if (config) this.config = config;
  }

  isConfigured(): boolean {
    return !!(this.config?.apiKey && this.config?.apiSecret);
  }

  async send(notification: SmsNotification): Promise<NotificationResult> {
    // Implement Vonage API call here
    return {
      success: true,
      messageId: `vonage-${Date.now()}`,
      provider: this.name,
      timestamp: new Date(),
    };
  }
}
```

2. Swap the provider in the factory:

```typescript
// src/factories/notification-factory.ts
import { VonageSmsProvider } from "../notifications/providers/sms/vonage-sms.provider";

// Change from:
const smsProvider = new TwilioSmsProvider(config);

// To:
const smsProvider = new VonageSmsProvider(config);
```

No changes needed in strategies or core code!

## Adding a New Notification Type

**Example: Add WhatsApp Strategy**

1. Add interface:

```typescript
// In notification.interface.ts
export interface WhatsAppNotification extends BaseNotification {
  to: string;
  body: string;
  mediaUrl?: string;
}

export type NotificationType = "email" | "sms" | "push" | "whatsapp";
```

2. Create provider:

```typescript
// src/notifications/providers/whatsapp/twilio-whatsapp.provider.ts
export class TwilioWhatsAppProvider
  implements INotificationProvider<WhatsAppNotification> {
  // Implementation
}
```

3. Create strategy:

```typescript
// src/notifications/strategies/whatsapp.strategy.ts
export class WhatsAppStrategy
  implements INotificationStrategy<WhatsAppNotification> {
  // Implementation
}
```

4. Register in factory:

```typescript
const whatsappStrategy = new WhatsAppStrategy(
  new TwilioWhatsAppProvider(config),
);
notificationManager = new NotificationManager([
  emailStrategy,
  smsStrategy,
  pushStrategy,
  whatsappStrategy, // Add here
]);
```

## Running the Service

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## Project Structure

```
├── config/
│   └── development.yaml      # Configuration
├── src/
│   ├── config/               # App config, logger, Kafka
│   ├── factories/            # Factory functions (DI setup)
│   ├── notifications/        # Strategy Pattern implementation
│   └── types/                # TypeScript types
├── server.ts                 # Entry point
└── package.json
```

## Design Patterns Used

- **Strategy Pattern**: Swap notification types/providers at runtime
- **Dependency Injection**: Providers injected into strategies, strategies into manager
- **Factory Pattern**: Centralized creation of notification manager
- **Singleton Pattern**: Single instance of notification manager

## License

MIT
