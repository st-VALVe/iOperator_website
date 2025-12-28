# Requirements Document

## Introduction

Эволюция веб-сайта iOperator.ai из простого одностраничного лендинга в полноценную интерактивную платформу с современным визуальным дизайном, демонстрацией AI-операторов и личным кабинетом для клиентов. Проект включает три ключевых направления: визуальный редизайн в стиле Apple/современных tech-стартапов, интерактивную демонстрацию AI-операторов и систему личного кабинета с подпиской.

## Glossary

- **Platform**: Веб-приложение iOperator.ai
- **Animation_Engine**: Система анимаций на базе Framer Motion/GSAP
- **AI_Demo_Widget**: Интерактивный виджет для демонстрации AI-оператора
- **Voice_Interface**: Голосовой интерфейс для общения с AI
- **Chat_Interface**: Текстовый чат-интерфейс для общения с AI
- **Telegram_Proxy**: Серверный компонент, пересылающий сообщения между веб-интерфейсом и существующим Telegram-ботом
- **Dashboard**: Личный кабинет пользователя (клиента B2B)
- **Admin_Panel**: Административная панель для владельца платформы
- **Business_Profile**: Профиль бизнеса клиента в системе
- **Subscription_Plan**: Тарифный план подписки
- **Scroll_Animation**: Анимация, привязанная к прокрутке страницы
- **Mouse_Tracking**: Отслеживание движения мыши для интерактивных эффектов
- **Parallax_Effect**: Эффект параллакса при прокрутке
- **Micro_Interaction**: Мелкие анимации при взаимодействии с элементами
- **Backend_API**: Легковесный серверный компонент на VPS для Telegram Proxy
- **VPS**: Виртуальный приватный сервер для хостинга Telegram Proxy
- **Supabase**: BaaS платформа для базы данных, аутентификации и хранения файлов

---

## Requirements

### Requirement 1: Визуальный редизайн и анимации

**User Story:** As a visitor, I want to experience a visually stunning, modern website with smooth animations, so that I perceive iOperator.ai as a premium, trustworthy technology company.

#### Acceptance Criteria

1. WHEN a visitor loads the page, THE Platform SHALL display a hero section with smooth fade-in animations within 500ms
2. WHEN a visitor scrolls the page, THE Animation_Engine SHALL trigger Scroll_Animation effects on sections as they enter the viewport
3. WHEN a visitor moves the mouse over interactive elements, THE Platform SHALL respond with Micro_Interaction animations within 100ms
4. WHILE the visitor scrolls, THE Animation_Engine SHALL apply Parallax_Effect to background elements at different scroll speeds
5. WHEN a visitor hovers over cards or buttons, THE Platform SHALL display smooth scale and shadow transitions
6. THE Platform SHALL use a light theme by default with accent colors (orange brand identity), and provide a dark/light mode toggle
7. THE Platform SHALL persist the user's theme preference across sessions
7. THE Platform SHALL implement a minimalist, Apple-style design with generous whitespace and clean typography
8. WHEN the page loads, THE Platform SHALL display a subtle gradient mesh or animated background effect

### Requirement 2: Mouse-tracking интерактивность

**User Story:** As a visitor, I want the website to respond to my mouse movements, so that I feel engaged and impressed by the interactive experience.

#### Acceptance Criteria

1. WHEN a visitor moves the mouse across the hero section, THE Platform SHALL apply subtle Mouse_Tracking parallax to floating elements
2. WHEN a visitor hovers over 3D-like cards, THE Platform SHALL tilt the card in the direction of the mouse position
3. WHEN a visitor moves the mouse, THE Platform SHALL optionally display a custom cursor or cursor trail effect
4. THE Platform SHALL ensure Mouse_Tracking effects do not degrade performance below 60fps

### Requirement 3: AI Demo Widget - прокси к Telegram-боту

**User Story:** As a potential customer, I want to interact with the AI operator demo directly on the website, so that I can experience the product without leaving the page.

#### Acceptance Criteria

1. WHEN a visitor clicks the demo button, THE AI_Demo_Widget SHALL open a Chat_Interface overlay or embedded section
2. WHEN a visitor sends a text message, THE Telegram_Proxy SHALL forward the message to the existing Telegram bot
3. WHEN the Telegram bot responds, THE Telegram_Proxy SHALL return the response to the Chat_Interface
4. THE Chat_Interface SHALL display user messages immediately and show a typing indicator while waiting for bot response
5. THE Chat_Interface SHALL display bot responses with a typing animation effect
6. WHEN a visitor sends an image, THE Telegram_Proxy SHALL forward the image to the Telegram bot
7. IF the Telegram_Proxy encounters a connection error, THEN THE Platform SHALL display a friendly error message and offer to retry
8. THE Chat_Interface SHALL be accessible via keyboard navigation and screen readers
9. THE Platform SHALL maintain session context so the Telegram bot can track conversation history

### Requirement 4: AI Demo Widget - голосовой ввод

**User Story:** As a potential customer, I want to speak to the AI operator using my voice on the website, so that I can experience voice-based interaction.

#### Acceptance Criteria

1. WHEN a visitor clicks the voice input button, THE Voice_Interface SHALL request microphone permission
2. WHEN microphone access is granted, THE Voice_Interface SHALL display a visual indicator that it is recording
3. WHEN the visitor speaks, THE Voice_Interface SHALL record the audio in a format compatible with Telegram (OGG/Opus or similar)
4. WHEN the visitor releases the record button or stops speaking, THE Voice_Interface SHALL send the audio file to the Telegram_Proxy
5. THE Telegram_Proxy SHALL forward the audio message to the Telegram bot for processing
6. WHEN the Telegram bot responds, THE Telegram_Proxy SHALL return the response (text or audio) to the Chat_Interface
7. IF microphone access is denied, THEN THE Platform SHALL display a message suggesting text input instead
8. THE Voice_Interface SHALL display a waveform or visual feedback while recording

### Requirement 5: Личный кабинет - регистрация и аутентификация

**User Story:** As a business owner, I want to create an account and log in securely, so that I can access my personal dashboard.

#### Acceptance Criteria

1. WHEN a visitor clicks "Sign Up", THE Platform SHALL display a registration form with email, password, and business name fields
2. WHEN a user submits valid registration data, THE Platform SHALL create an account and send email verification
3. WHEN a user clicks "Log In", THE Platform SHALL display a login form with email and password fields
4. WHEN a user enters valid credentials, THE Dashboard SHALL load within 2 seconds
5. IF login credentials are invalid, THEN THE Platform SHALL display an error message without revealing which field is incorrect
6. THE Platform SHALL support OAuth login via Google
7. WHEN a user requests password reset, THE Platform SHALL send a reset link to the registered email
8. THE Platform SHALL implement secure session management with JWT tokens

### Requirement 6: Личный кабинет - профиль бизнеса

**User Story:** As a business owner, I want to configure my business profile, so that the AI operator understands my specific business context.

#### Acceptance Criteria

1. WHEN a user accesses the Dashboard, THE Platform SHALL display a Business_Profile configuration section
2. WHEN a user enters business information, THE Business_Profile SHALL store business name, type, description, and contact details
3. WHEN a user uploads a menu or product catalog, THE Business_Profile SHALL parse and store the items
4. THE Business_Profile SHALL support manual entry of menu items with name, description, price, and category
5. WHEN a user saves the Business_Profile, THE Platform SHALL validate all required fields before saving
6. THE Dashboard SHALL display a completeness indicator for the Business_Profile

### Requirement 7: Личный кабинет - подписка и оплата

**User Story:** As a business owner, I want to subscribe to a plan and manage my billing, so that I can use the AI operator service for my business.

#### Acceptance Criteria

1. WHEN a user views subscription options, THE Platform SHALL display available Subscription_Plan tiers with features and pricing
2. WHEN a user selects a plan, THE Platform SHALL redirect to a secure payment page
3. WHEN payment is successful, THE Platform SHALL activate the subscription immediately
4. THE Dashboard SHALL display current subscription status, next billing date, and usage statistics
5. WHEN a user requests to cancel subscription, THE Platform SHALL process cancellation and confirm via email
6. IF payment fails, THEN THE Platform SHALL notify the user and provide retry options
7. THE Platform SHALL support credit card payments via Stripe

### Requirement 8: Личный кабинет - AI оператор для бизнеса

**User Story:** As a subscribed business owner, I want to deploy and customize my AI operator, so that it can handle customer inquiries for my business.

#### Acceptance Criteria

1. WHEN a subscribed user accesses the AI configuration, THE Dashboard SHALL display customization options
2. WHEN a user configures greeting messages, THE AI operator SHALL use the custom greetings
3. WHEN a user sets business hours, THE AI operator SHALL adjust responses based on availability
4. THE Dashboard SHALL provide integration instructions for Telegram, WhatsApp, and website widget
5. WHEN a user generates an API key, THE Platform SHALL create a unique key for external integrations
6. THE Dashboard SHALL display conversation logs and analytics for the AI operator

### Requirement 9: Производительность и доступность

**User Story:** As any user, I want the website to load quickly and be accessible, so that I can use it regardless of my device or abilities.

#### Acceptance Criteria

1. THE Platform SHALL achieve a Lighthouse performance score of at least 90
2. THE Platform SHALL be fully responsive on mobile, tablet, and desktop devices
3. THE Platform SHALL support keyboard navigation for all interactive elements
4. THE Platform SHALL meet WCAG 2.1 AA accessibility standards
5. WHEN animations are enabled, THE Platform SHALL respect the user's "prefers-reduced-motion" system setting
6. THE Platform SHALL load the initial view within 3 seconds on a 3G connection

### Requirement 10: Мультиязычность

**User Story:** As an international visitor, I want to view the website in my preferred language, so that I can understand the content and use the service.

#### Acceptance Criteria

1. THE Platform SHALL support English, Russian, and Turkish languages
2. WHEN a visitor selects a language, THE Platform SHALL immediately switch all UI text to the selected language
3. THE Platform SHALL persist the language preference across sessions
4. THE AI_Demo_Widget SHALL respond in the same language as the selected UI language

### Requirement 11: Админ-панель - управление клиентами

**User Story:** As a platform administrator, I want to view and manage all registered clients, so that I can monitor the platform usage and provide support.

#### Acceptance Criteria

1. WHEN an admin logs in, THE Admin_Panel SHALL display a list of all registered clients with their subscription status
2. THE Admin_Panel SHALL allow filtering clients by subscription status, registration date, and activity level
3. WHEN an admin selects a client, THE Admin_Panel SHALL display detailed information about their Business_Profile and usage
4. THE Admin_Panel SHALL allow an admin to manually activate or deactivate a client's subscription
5. THE Admin_Panel SHALL display total revenue, active subscriptions, and growth metrics on a dashboard

### Requirement 12: Админ-панель - аналитика и мониторинг

**User Story:** As a platform administrator, I want to monitor AI operator performance and platform health, so that I can ensure quality service.

#### Acceptance Criteria

1. THE Admin_Panel SHALL display real-time statistics on total conversations, messages processed, and response times
2. THE Admin_Panel SHALL show conversation logs across all demo and client AI operators
3. WHEN an admin views analytics, THE Admin_Panel SHALL display charts for daily/weekly/monthly usage trends
4. THE Admin_Panel SHALL alert the admin when error rates exceed a configurable threshold
5. THE Admin_Panel SHALL display Telegram bot health status and connection metrics

### Requirement 13: Админ-панель - управление демо-ботом

**User Story:** As a platform administrator, I want to configure the demo AI operator, so that I can showcase the best capabilities to potential customers.

#### Acceptance Criteria

1. THE Admin_Panel SHALL allow configuration of the demo bot's greeting messages and personality
2. THE Admin_Panel SHALL allow uploading and managing the demo restaurant menu
3. THE Admin_Panel SHALL display demo conversation logs and popular user queries
4. WHEN an admin updates demo configuration, THE changes SHALL take effect within 1 minute

### Requirement 14: Инфраструктура и деплой

**User Story:** As a platform administrator, I want the platform deployed with proper backend infrastructure, so that all features requiring server-side logic can function properly.

#### Acceptance Criteria

1. THE Platform SHALL use Supabase for database, authentication, and file storage
2. THE Platform SHALL deploy a lightweight Backend_API on VPS for Telegram_Proxy functionality
3. THE Platform SHALL use Supabase Auth for user registration, login, and session management
4. THE Platform SHALL use Supabase PostgreSQL for storing Business_Profiles, subscriptions, and conversation logs
5. THE Platform SHALL use Supabase Storage for menu files and images
6. THE Platform SHALL implement HTTPS with valid SSL certificates
7. THE Platform SHALL support environment-based configuration for development and production
8. WHEN the backend receives a webhook from Stripe, THE Platform SHALL process payment events securely
9. THE Frontend SHALL be deployable as static files (Vercel, Netlify, or VPS with Nginx)
