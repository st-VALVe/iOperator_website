# Design Document: iOperator.ai Platform Evolution

## Overview

Трансформация одностраничного лендинга iOperator.ai в полноценную SaaS-платформу с тремя ключевыми компонентами:

1. **Публичный сайт** — современный визуал с анимациями в стиле Apple, демонстрация AI-оператора
2. **Клиентский кабинет** — B2B портал для владельцев бизнеса с подпиской и настройкой AI
3. **Админ-панель** — управление платформой, клиентами и аналитика

### Технологический стек

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Анимации**: Framer Motion + GSAP (для сложных scroll-эффектов)
- **Backend**: Supabase (Auth, PostgreSQL, Storage, Realtime)
- **Telegram Proxy**: Node.js сервис на VPS
- **Платежи**: Stripe
- **Деплой**: Vercel (frontend) + VPS (Telegram Proxy)

---

## Architecture

### Высокоуровневая архитектура

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Public Site  │  │  Dashboard   │  │    Admin Panel       │  │
│  │ (Landing +   │  │  (Client     │  │    (Platform         │  │
│  │  AI Demo)    │  │   Portal)    │  │     Management)      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SUPABASE                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │     Auth     │  │  PostgreSQL  │  │      Storage         │  │
│  │  (Users,     │  │  (Profiles,  │  │   (Menus, Images)    │  │
│  │   Sessions)  │  │   Logs, etc) │  │                      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VPS (Telegram Proxy)                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Node.js Service                                          │  │
│  │  - WebSocket server for real-time chat                    │  │
│  │  - Telegram Bot API integration                           │  │
│  │  - Audio file processing                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                            │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │   Telegram   │  │    Stripe    │                            │
│  │   Bot API    │  │   Payments   │                            │
│  └──────────────┘  └──────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

### Маршрутизация (React Router)

```
/                     → Landing Page (публичный)
/demo                 → AI Demo Widget (публичный)
/login                → Страница входа
/register             → Страница регистрации
/dashboard            → Клиентский кабинет (защищённый)
/dashboard/profile    → Профиль бизнеса
/dashboard/ai-config  → Настройка AI оператора
/dashboard/billing    → Подписка и оплата
/dashboard/analytics  → Аналитика разговоров
/admin                → Админ-панель (защищённый, только админы)
/admin/clients        → Управление клиентами
/admin/analytics      → Платформенная аналитика
/admin/demo-config    → Настройка демо-бота
```

---

## Components and Interfaces

### 1. Animation Engine

```typescript
// Типы для системы анимаций
interface AnimationConfig {
  duration: number;
  ease: string;
  delay?: number;
}

interface ScrollAnimationProps {
  children: React.ReactNode;
  animation: 'fadeIn' | 'slideUp' | 'slideLeft' | 'scale';
  threshold?: number; // 0-1, когда триггерить
}

interface ParallaxProps {
  children: React.ReactNode;
  speed: number; // -1 to 1, отрицательный = медленнее фона
  direction?: 'vertical' | 'horizontal';
}

interface MouseTrackingProps {
  children: React.ReactNode;
  intensity: number; // 0-1
  perspective?: number; // для 3D эффекта
}
```

### 2. AI Demo Widget

```typescript
// Интерфейс сообщения в чате
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  contentType: 'text' | 'image' | 'audio';
  timestamp: Date;
  status: 'sending' | 'sent' | 'error';
}

// Состояние чата
interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  isRecording: boolean;
  sessionId: string;
  error: string | null;
}

// API для Telegram Proxy
interface TelegramProxyAPI {
  sendMessage(sessionId: string, text: string): Promise<ChatMessage>;
  sendImage(sessionId: string, file: File): Promise<ChatMessage>;
  sendAudio(sessionId: string, audioBlob: Blob): Promise<ChatMessage>;
  getSession(): Promise<{ sessionId: string }>;
}
```

### 3. Voice Interface

```typescript
interface VoiceRecorderState {
  isRecording: boolean;
  audioBlob: Blob | null;
  duration: number;
  waveformData: number[]; // для визуализации
  error: string | null;
}

interface VoiceRecorderConfig {
  maxDuration: number; // секунды
  format: 'ogg' | 'webm'; // совместимость с Telegram
  sampleRate: number;
}
```

### 4. Dashboard Components

```typescript
// Профиль бизнеса
interface BusinessProfile {
  id: string;
  userId: string;
  name: string;
  type: 'restaurant' | 'cafe' | 'delivery' | 'other';
  description: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  workingHours: WorkingHours[];
  menu: MenuItem[];
  createdAt: Date;
  updatedAt: Date;
  completeness: number; // 0-100%
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'USD' | 'RUB' | 'TRY';
  category: string;
  imageUrl?: string;
  available: boolean;
}

interface WorkingHours {
  dayOfWeek: number; // 0-6
  openTime: string; // "09:00"
  closeTime: string; // "22:00"
  isClosed: boolean;
}

// Подписка
interface Subscription {
  id: string;
  userId: string;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  stripeSubscriptionId: string;
}

// Тарифные планы
interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    messagesPerMonth: number;
    integrations: number;
  };
}
```

### 5. Admin Panel Components

```typescript
// Клиент в админке
interface AdminClientView {
  id: string;
  email: string;
  businessName: string;
  subscription: Subscription | null;
  totalMessages: number;
  lastActive: Date;
  createdAt: Date;
}

// Аналитика платформы
interface PlatformAnalytics {
  totalClients: number;
  activeSubscriptions: number;
  totalRevenue: number;
  messagesProcessed: number;
  averageResponseTime: number;
  errorRate: number;
  trends: {
    date: string;
    clients: number;
    messages: number;
    revenue: number;
  }[];
}
```

---

## Data Models

### Supabase Database Schema

```sql
-- Расширение профиля пользователя
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  role TEXT DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'ru', 'tr')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Профиль бизнеса
CREATE TABLE business_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('restaurant', 'cafe', 'delivery', 'other')),
  description TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  address TEXT,
  working_hours JSONB DEFAULT '[]',
  settings JSONB DEFAULT '{}',
  completeness INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Меню
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  category TEXT,
  image_url TEXT,
  available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Подписки
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('starter', 'professional', 'enterprise')),
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Логи разговоров
CREATE TABLE conversation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES business_profiles(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  is_demo BOOLEAN DEFAULT false,
  messages JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  message_count INTEGER DEFAULT 0
);

-- Демо-конфигурация
CREATE TABLE demo_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  greeting_message TEXT,
  personality TEXT,
  menu_items JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);
```

### Row Level Security (RLS)

```sql
-- Профили: пользователь видит только свой
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Бизнес-профили: владелец + админы
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner can manage business" ON business_profiles
  FOR ALL USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Подписки: владелец + админы
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner can view subscription" ON subscriptions
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Логи: владелец бизнеса + админы
ALTER TABLE conversation_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Business owner can view logs" ON conversation_logs
  FOR SELECT USING (
    business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') OR
    is_demo = true
  );
```

---

## Error Handling

### Frontend Error Handling

```typescript
// Централизованная обработка ошибок
interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  recoverable: boolean;
}

// Коды ошибок
enum ErrorCode {
  // Сеть
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  
  // Аутентификация
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_SESSION_EXPIRED = 'AUTH_SESSION_EXPIRED',
  AUTH_EMAIL_NOT_VERIFIED = 'AUTH_EMAIL_NOT_VERIFIED',
  
  // Telegram Proxy
  TELEGRAM_CONNECTION_FAILED = 'TELEGRAM_CONNECTION_FAILED',
  TELEGRAM_MESSAGE_FAILED = 'TELEGRAM_MESSAGE_FAILED',
  
  // Голосовой ввод
  MICROPHONE_PERMISSION_DENIED = 'MICROPHONE_PERMISSION_DENIED',
  AUDIO_RECORDING_FAILED = 'AUDIO_RECORDING_FAILED',
  
  // Платежи
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  SUBSCRIPTION_EXPIRED = 'SUBSCRIPTION_EXPIRED',
  
  // Валидация
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

// Стратегии восстановления
const errorRecoveryStrategies: Record<ErrorCode, () => void> = {
  [ErrorCode.NETWORK_ERROR]: () => showRetryDialog(),
  [ErrorCode.AUTH_SESSION_EXPIRED]: () => redirectToLogin(),
  [ErrorCode.TELEGRAM_CONNECTION_FAILED]: () => reconnectTelegram(),
  // ...
};
```

### Backend Error Handling (Telegram Proxy)

```typescript
// Структура ответа API
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// Middleware для обработки ошибок
const errorHandler = (err: Error, req: Request, res: Response) => {
  console.error('Error:', err);
  
  if (err instanceof TelegramError) {
    return res.status(502).json({
      success: false,
      error: { code: 'TELEGRAM_ERROR', message: 'Telegram service unavailable' }
    });
  }
  
  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Internal server error' }
  });
};
```

---

## Testing Strategy

### Подход к тестированию

Проект использует двойной подход к тестированию:

1. **Unit Tests** — для конкретных примеров, edge cases и интеграционных точек
2. **Property-Based Tests** — для универсальных свойств, которые должны выполняться для всех входных данных

### Инструменты

- **Vitest** — тестовый фреймворк (совместим с Vite)
- **fast-check** — библиотека для property-based testing
- **React Testing Library** — тестирование компонентов
- **MSW (Mock Service Worker)** — мокирование API

### Конфигурация Property Tests

```typescript
// Минимум 100 итераций для каждого property test
import fc from 'fast-check';

fc.configureGlobal({
  numRuns: 100,
  verbose: true,
});
```


---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Message Round-Trip

*For any* valid message (text, image, or audio) sent through the Chat_Interface, the Telegram_Proxy SHALL forward it to the Telegram bot and return the bot's response to the client without data loss or corruption.

**Validates: Requirements 3.2, 3.3, 3.6, 4.5, 4.6**

### Property 2: Session Consistency

*For any* sequence of messages within a single chat session, all messages SHALL share the same session ID, and user messages SHALL appear in the Chat_Interface before the corresponding bot response.

**Validates: Requirements 3.4, 3.9**

### Property 3: Audio Format Compliance

*For any* audio recording captured by the Voice_Interface, the resulting audio file SHALL be in a format compatible with Telegram (OGG/Opus or WebM) and contain valid audio data.

**Validates: Requirements 4.3**

### Property 4: Authentication Data Integrity

*For any* valid registration data (email, password, business name), the Platform SHALL create a user account with correctly stored data. *For any* registered email, password reset SHALL be triggered. *For any* authenticated session, JWT tokens SHALL be valid and contain correct user claims.

**Validates: Requirements 5.2, 5.7, 5.8**

### Property 5: Business Profile Data Integrity

*For any* valid business profile data entered by a user, the Platform SHALL store and retrieve the data without loss or corruption. The completeness indicator SHALL accurately reflect the percentage of required fields that are filled.

**Validates: Requirements 6.2, 6.3, 6.4, 6.5, 6.6**

### Property 6: Subscription State Management

*For any* successful payment, the subscription status SHALL change to 'active'. *For any* cancellation request, the subscription status SHALL change to 'cancelled'. *For any* API key generation request, the resulting key SHALL be unique across all keys in the system.

**Validates: Requirements 7.3, 7.5, 8.5, 11.4**

### Property 7: AI Configuration Effect

*For any* custom greeting message configured by a user, the AI operator SHALL use that greeting in conversations. *For any* business hours configuration, the AI operator SHALL correctly determine availability based on current time.

**Validates: Requirements 8.2, 8.3**

### Property 8: Responsive Layout

*For any* viewport width (mobile: 320-767px, tablet: 768-1023px, desktop: 1024px+), all interactive elements SHALL be visible and usable. *For any* user with "prefers-reduced-motion" enabled, animations SHALL be disabled or minimized.

**Validates: Requirements 9.2, 9.5**

### Property 9: Keyboard Accessibility

*For any* interactive element on the Platform, it SHALL be focusable via Tab key and activatable via Enter/Space key.

**Validates: Requirements 9.3**

### Property 10: Language Consistency

*For any* supported language (EN, RU, TR), all UI text elements SHALL have a translation. *For any* language selection, the UI SHALL immediately reflect the change. The language preference SHALL persist across browser sessions.

**Validates: Requirements 10.1, 10.2, 10.3, 10.4**

### Property 11: Admin Data Access

*For any* filter criteria applied in the Admin_Panel, the resulting client list SHALL contain only clients matching those criteria. *For any* admin user, conversation logs from all businesses SHALL be accessible. *For any* error rate exceeding the configured threshold, an alert SHALL be generated.

**Validates: Requirements 11.2, 12.2, 12.4**

### Property 12: Stripe Webhook Processing

*For any* valid Stripe webhook event (payment_intent.succeeded, customer.subscription.updated, etc.), the Platform SHALL update the corresponding subscription record in the database.

**Validates: Requirements 14.8**

### Property 13: Interactive Animation Response

*For any* scroll position change, elements within the viewport SHALL receive scroll-triggered animations. *For any* mouse position on the hero section, floating elements SHALL offset proportionally. *For any* mouse position on a 3D card, the card SHALL tilt in the corresponding direction.

**Validates: Requirements 1.2, 1.4, 2.1, 2.2**

---

## Implementation Notes

### Фазы реализации

Рекомендуется разбить реализацию на фазы:

**Фаза 1: Визуальный редизайн**
- Обновление дизайна лендинга
- Добавление анимаций (Framer Motion)
- Mouse-tracking эффекты

**Фаза 2: AI Demo Widget**
- Telegram Proxy сервис
- Chat Interface компонент
- Voice Interface компонент

**Фаза 3: Аутентификация и Dashboard**
- Supabase Auth интеграция
- Базовый Dashboard
- Профиль бизнеса

**Фаза 4: Подписки и платежи**
- Stripe интеграция
- Тарифные планы
- Billing management

**Фаза 5: Админ-панель**
- Управление клиентами
- Аналитика
- Демо-конфигурация

### Зависимости между компонентами

```
Landing Page ──────────────────────────────────────────────────────┐
     │                                                              │
     ▼                                                              │
AI Demo Widget ◄──── Telegram Proxy ◄──── Telegram Bot             │
     │                     │                                        │
     │                     ▼                                        │
     │              Supabase (Logs)                                 │
     │                     │                                        │
     ▼                     ▼                                        │
Auth Flow ──────► Supabase Auth ◄──────────────────────────────────┤
     │                     │                                        │
     ▼                     ▼                                        │
Dashboard ──────► Supabase DB ◄──── Admin Panel                    │
     │                     │              │                         │
     ▼                     ▼              ▼                         │
Stripe ◄───────── Subscriptions ◄─── Admin Actions                 │
                                                                    │
                       All Components ◄─────────────────────────────┘
                            │
                            ▼
                    i18n (Translations)
```
