# Bot → Dashboard Sync Integration Plan

## Overview

Add a `DashboardSyncService` to the bot that sends lightweight events to the
iOperator Dashboard via the `/functions/v1/sync` edge function. This enables
the Customers section of the dashboard to display real-time customer data,
order history, and key events.

**Architecture**: fire-and-forget HTTP calls. Sync failures are logged but
never block bot operations.

---

## Prerequisites

- Dashboard sync edge function is deployed (`/functions/v1/sync`)
- Bot already has `IOPERATOR_API_KEY` and `IOPERATOR_API_URL` in config
- The same API key used for Config API is used for Sync API authentication

---

## Step 1: Add Sync URL to Config

**File**: `src/config/index.ts`

Add `syncUrl` alongside existing `ioperator` config:

```typescript
ioperator: {
  apiKey: process.env.IOPERATOR_API_KEY,
  apiUrl: process.env.IOPERATOR_API_URL,
  syncUrl: process.env.IOPERATOR_SYNC_URL, // NEW
  cacheTtlMs: process.env.IOPERATOR_CACHE_TTL_MS
}
```

**File**: `.env`

```
IOPERATOR_SYNC_URL=https://oltsodebfkpunanccznx.supabase.co/functions/v1/sync
```

Update the Zod schema to include `syncUrl` as an optional string.

---

## Step 2: Create DashboardSyncService

**File**: `src/services/dashboardSync.ts`

```typescript
/**
 * DashboardSyncService
 *
 * Fire-and-forget event sender to iOperator Dashboard.
 * Failures are logged but never block bot operations.
 */

import { getConfig } from '../config/index.js';
import { getLogger } from '../utils/logger.js';

const logger = getLogger();
const TIMEOUT_MS = 3000;

type SyncEvent =
  | 'customer.seen'
  | 'order.created'
  | 'order.status'
  | 'escalation.created'
  | 'escalation.resolved';

class DashboardSyncService {
  private syncUrl: string | null;
  private apiKey: string | null;

  constructor() {
    const config = getConfig();
    this.syncUrl = config.ioperator?.syncUrl || null;
    this.apiKey = config.ioperator?.apiKey || null;
  }

  get isEnabled(): boolean {
    return !!(this.syncUrl && this.apiKey);
  }

  /**
   * Send an event to the dashboard (fire-and-forget).
   * Never throws — all errors are caught and logged.
   */
  async send(event: SyncEvent, data: Record<string, unknown>): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch(this.syncUrl!, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event, data }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        logger.warn('Dashboard sync failed', {
          event,
          status: response.status,
        });
      }
    } catch (error) {
      logger.debug('Dashboard sync error (non-blocking)', {
        event,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

// Singleton
export const dashboardSync = new DashboardSyncService();
```

---

## Step 3: Integrate Sync Calls

### 3a. Customer Seen — on every incoming message

**File**: `src/channels/router.ts` — in `processIncomingMessage()`, after
session is retrieved/created:

```typescript
import { dashboardSync } from '../services/dashboardSync.js';

// After session lookup, fire customer.seen
dashboardSync.send('customer.seen', {
  display_name: session.clientName || message.senderName,
  phone: cached?.phone,
  primary_channel: message.channelType,
  telegram_chat_id: message.channelType === 'telegram' ? message.senderId : undefined,
  whatsapp_phone: message.channelType === 'whatsapp' ? message.senderId : undefined,
  telegram_topic_id: session.topicId,
  telegram_group_id: String(config.telegram.operatorGroupId),
  syrve_customer_id: cached?.syrveCustomerId,
  preferred_language: session.language,
  trust_level: cached?.trustLevel,
});
```

**Optimization**: Debounce per chatId to avoid flooding on every message.
A simple approach is to track `lastSyncedAt` per chatId and only send if
>5 minutes have passed:

```typescript
private customerSyncTimestamps = new Map<string, number>();
private SYNC_DEBOUNCE_MS = 5 * 60 * 1000; // 5 minutes

private shouldSyncCustomer(chatId: string): boolean {
  const lastSync = this.customerSyncTimestamps.get(chatId);
  if (!lastSync || Date.now() - lastSync > this.SYNC_DEBOUNCE_MS) {
    this.customerSyncTimestamps.set(chatId, Date.now());
    return true;
  }
  return false;
}
```

### 3b. Order Created — after successful order submission

**File**: `src/services/order/createOrder.ts` — at the end of
`createOrderFromPending()`, after Syrve confirms the order:

```typescript
import { dashboardSync } from '../dashboardSync.js';

// After successful order creation
dashboardSync.send('order.created', {
  customer_identifier: {
    telegram_chat_id: channelType === 'telegram' ? chatId : undefined,
    whatsapp_phone: channelType === 'whatsapp' ? chatId : undefined,
  },
  syrve_order_id: orderResult.orderId,
  external_number: orderResult.externalNumber,
  items: pendingOrder.items.map(item => ({
    name: item.name,
    amount: item.amount,
    price: item.price,
  })),
  total: pendingOrder.total,
  delivery_address: pendingOrder.address,
  payment_method: pendingOrder.paymentMethod,
  restaurant: pendingOrder.restaurantName,
  channel: channelType,
});
```

### 3c. Order Status — on webhook status updates

**File**: `src/services/order/statusNotification.ts` — when a status
webhook is received and the order status changes:

```typescript
import { dashboardSync } from '../dashboardSync.js';

// After processing status webhook
dashboardSync.send('order.status', {
  syrve_order_id: orderId,
  status: mapSyrveStatus(newStatus), // Map to: confirmed|cooking|delivering|delivered|cancelled
});
```

Create a mapping function:

```typescript
function mapSyrveStatus(syrveStatus: string): string {
  const statusMap: Record<string, string> = {
    'Confirmed': 'confirmed',
    'CookingStarted': 'cooking',
    'OnWay': 'delivering',
    'Delivered': 'delivered',
    'Closed': 'delivered',
    'Cancelled': 'cancelled',
  };
  return statusMap[syrveStatus] || 'confirmed';
}
```

### 3d. Escalation Created — when bot transfers to operator

**File**: `src/channels/router.ts` — in `handleEscalation()`:

```typescript
// After setting escalation status
dashboardSync.send('escalation.created', {
  customer_identifier: {
    telegram_chat_id: message.channelType === 'telegram' ? message.senderId : undefined,
    whatsapp_phone: message.channelType === 'whatsapp' ? message.senderId : undefined,
  },
  reason: reason || 'Customer requested human support',
  metadata: { channel: message.channelType },
});
```

### 3e. Escalation Resolved — when operator returns control to bot

**File**: `src/channels/router.ts` — in `handleOperatorReply()`, when
the `/done` or `/back` command is used:

```typescript
dashboardSync.send('escalation.resolved', {
  customer_identifier: {
    telegram_chat_id: session.channelType === 'telegram' ? session.id : undefined,
    whatsapp_phone: session.channelType === 'whatsapp' ? session.id : undefined,
  },
  resolution_summary: 'Resolved by operator',
  metadata: { operator_name: operatorName },
});
```

---

## Step 4: Environment Variables

Add to `.env` on the VPS:

```
IOPERATOR_SYNC_URL=https://oltsodebfkpunanccznx.supabase.co/functions/v1/sync
```

`IOPERATOR_API_KEY` is already configured and shared with Config API.

---

## Step 5: Testing

1. **Unit test**: Mock `fetch` and verify `DashboardSyncService.send()` calls
   the correct URL with proper headers and body
2. **Integration test**: Start bot locally, send a test message, verify that
   a customer record appears in Supabase `customers` table
3. **Resilience test**: Set `IOPERATOR_SYNC_URL` to an invalid URL, verify
   bot continues to operate normally without errors

---

## File Checklist

| Action | File | Description |
|--------|------|-------------|
| Modify | `src/config/index.ts` | Add `syncUrl` to ioperator config |
| Modify | `src/config/schema.ts` | Add `syncUrl` to Zod schema |
| Create | `src/services/dashboardSync.ts` | Fire-and-forget sync service |
| Modify | `src/channels/router.ts` | Add customer.seen + escalation sync calls |
| Modify | `src/services/order/createOrder.ts` | Add order.created sync call |
| Modify | `src/services/order/statusNotification.ts` | Add order.status sync call |
| Modify | `.env` | Add `IOPERATOR_SYNC_URL` |

---

## Important Notes

- **Fire-and-forget**: Sync calls must NEVER block or crash the bot
- **Debounce customer.seen**: Send at most once per 5 minutes per customer
- **Memory**: The `customerSyncTimestamps` map should be cleaned periodically
  (e.g., remove entries older than 1 hour) to prevent memory leaks
- **No new dependencies**: Uses built-in `fetch` (Node 18+), no npm packages needed
