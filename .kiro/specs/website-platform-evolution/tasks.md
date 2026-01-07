# Implementation Plan: iOperator.ai Platform Evolution

## Overview

Поэтапная реализация эволюции платформы iOperator.ai от простого лендинга до полноценной SaaS-платформы. Реализация разбита на 5 фаз: визуальный редизайн, AI Demo Widget, аутентификация и Dashboard, подписки и платежи, админ-панель.

## Tasks

### Фаза 0: Подготовка репозитория

- [x] 0. Создать feature branch для разработки
  - [x] 0.1 Создать новую ветку `feature/platform-v2`
    - Выполнить `git checkout -b feature/platform-v2`
    - Убедиться что основная ветка (main) не затронута
    - _Requirements: Изоляция разработки_
  - [x] 0.2 Настроить preview deployment (опционально)
    - Если используется Vercel/Netlify — автоматический preview для PR
    - Для тестирования без влияния на production
    - _Requirements: Изоляция разработки_

### Фаза 1: Визуальный редизайн по референсу Alter (https://alter.framer.website/)

- [x] 1. Настройка инфраструктуры и базовых стилей
  - [x] 1.1 Установить Framer Motion
    - Добавить зависимость: `framer-motion`
    - _Requirements: 1.1, 1.2_
  - [x] 1.2 Настроить светлую тему и dark mode toggle
    - Обновить `tailwind.config.js` с поддержкой dark mode (`class` strategy)
    - Создать цветовую палитру для светлой темы (белый фон, тёмный текст, оранжевый акцент)
    - Создать цветовую палитру для тёмной темы
    - Добавить современные шрифты (Inter или аналог)
    - Создать `src/components/ui/ThemeToggle.tsx` — переключатель темы
    - Сохранять выбор темы в localStorage
    - _Requirements: 1.6, 1.7_
  - [x] 1.3 Создать переиспользуемые UI компоненты
    - Создать `src/components/ui/GradientButton.tsx` — кнопки с градиентом
    - Создать `src/components/ui/GlassCard.tsx` — карточки с glass-эффектом
    - Создать `src/components/ui/AnimatedCounter.tsx` — анимированные числа как в Alter
    - _Requirements: 1.5, 1.8_

- [x] 2. Редизайн Hero секции (по образцу Alter)
  - [x] 2.1 Создать новый Hero компонент
    - Градиентный фон с mesh-эффектом
    - Крупный заголовок с градиентным текстом
    - Подзаголовок и CTA кнопки (Get Started / Learn More)
    - Анимированные счётчики (количество клиентов, сообщений)
    - _Requirements: 1.1, 1.7, 1.8_
  - [x] 2.2 Добавить анимации Hero
    - Fade-in при загрузке страницы
    - Floating элементы с параллаксом при движении мыши
    - _Requirements: 1.1, 2.1_

- [x] 3. Создать секцию "Интеграции" (по образцу Alter)
  - [x] 3.1 Добавить логотипы партнёров/интеграций
    - Горизонтальная полоса с логотипами (Telegram, WhatsApp, etc.)
    - Бесконечная анимация прокрутки
    - _Requirements: 1.2_

- [x] 4. Редизайн Features секции (Bento Grid как в Alter)
  - [x] 4.1 Создать Bento Grid layout
    - Создать `src/components/ui/BentoGrid.tsx`
    - Карточки разных размеров с градиентными borders
    - Иконки и краткие описания возможностей
    - _Requirements: 1.5, 1.7_
  - [x] 4.2 Добавить анимации карточек
    - Scroll-triggered появление
    - Hover эффекты (scale, glow)
    - _Requirements: 1.2, 1.3, 1.5_

- [x] 5. Редизайн секции "Как это работает" (6 шагов)
  - [x] 5.1 Обновить дизайн карточек шагов
    - Нумерация с градиентным фоном
    - Glass-эффект карточек
    - Stagger анимация при скролле
    - _Requirements: 1.2, 1.5_

- [x] 6. Редизайн Pricing секции (по образцу Alter)
  - [x] 6.1 Создать новые Pricing карточки
    - Три тарифа: Starter / Pro / Enterprise
    - Toggle Monthly/Yearly
    - Выделение популярного тарифа
    - Градиентные borders и hover эффекты
    - _Requirements: 1.5, 1.7_

- [x] 7. Добавить FAQ секцию (аккордеон как в Alter)
  - [x] 7.1 Создать FAQ компонент
    - Создать `src/components/ui/Accordion.tsx`
    - Анимация раскрытия/закрытия
    - _Requirements: 1.3_

- [x] 8. Добавить Testimonials секцию
  - [x] 8.1 Создать карусель отзывов
    - Карточки с аватарами и цитатами
    - Автоматическая прокрутка
    - _Requirements: 1.2_

- [x] 9. Редизайн Footer и CTA секции
  - [x] 9.1 Обновить финальный CTA блок
    - Градиентный фон
    - Призыв к действию с кнопками
    - _Requirements: 1.7, 1.8_
  - [x] 9.2 Обновить Footer
    - Минималистичный дизайн
    - Ссылки и контакты
    - _Requirements: 1.7_

- [x] 10. Обновить Header/Navigation
  - [x] 10.1 Редизайн навигации
    - Sticky header с blur эффектом
    - Обновлённые кнопки
    - Добавить ThemeToggle в header
    - Мобильное меню
    - _Requirements: 1.6, 1.7, 9.2_

- [x] 11. Checkpoint - Визуальный редизайн
  - Сравнить с референсом Alter ✓
  - Проверить все анимации (60fps) ✓
  - Протестировать на мобильных устройствах ✓
  - Проверить responsive дизайн ✓

### Фаза 2: AI Demo Widget

- [x] 12. Создать Telegram Proxy сервис
  - [x] 5.1 Настроить Node.js проект для Telegram Proxy
    - Создать `telegram-proxy/` директорию
    - Настроить Express + WebSocket сервер
    - Добавить Telegram Bot API интеграцию
    - _Requirements: 3.2, 3.3, 14.2_
  - [x] 5.2 Реализовать API endpoints
    - POST `/api/session` - создание сессии
    - POST `/api/message` - отправка текстового сообщения
    - POST `/api/image` - отправка изображения
    - POST `/api/audio` - отправка аудио
    - _Requirements: 3.2, 3.6, 4.5_
  - [ ]* 5.3 Написать property test для Message Round-Trip
    - **Property 1: Message Round-Trip**
    - **Validates: Requirements 3.2, 3.3, 3.6, 4.5, 4.6**

- [x] 6. Создать Chat Interface компонент
  - [x] 6.1 Создать базовый Chat UI
    - Создать `src/components/chat/ChatWidget.tsx`
    - Создать `src/components/chat/MessageBubble.tsx`
    - Создать `src/components/chat/TypingIndicator.tsx`
    - _Requirements: 3.1, 3.4, 3.5_
  - [x] 6.2 Интегрировать с Telegram Proxy
    - Создать `src/services/telegramProxy.ts`
    - Реализовать WebSocket подключение
    - Обработать отправку/получение сообщений
    - _Requirements: 3.2, 3.3, 3.9_
  - [ ]* 6.3 Написать property test для Session Consistency
    - **Property 2: Session Consistency**
    - **Validates: Requirements 3.4, 3.9**

- [x] 7. Создать Voice Interface компонент
  - [x] 7.1 Реализовать запись аудио
    - Создать `src/components/chat/VoiceRecorder.tsx`
    - Использовать MediaRecorder API
    - Конвертировать в OGG/Opus формат
    - _Requirements: 4.1, 4.2, 4.3_
  - [x] 7.2 Добавить визуальную обратную связь
    - Создать waveform визуализацию
    - Добавить индикатор записи
    - _Requirements: 4.2, 4.8_
  - [ ]* 7.3 Написать property test для Audio Format
    - **Property 3: Audio Format Compliance**
    - **Validates: Requirements 4.3**

- [x] 8. Обработка ошибок и accessibility
  - [x] 8.1 Добавить обработку ошибок в Chat Widget
    - Показывать friendly error messages
    - Добавить retry функционал
    - _Requirements: 3.7, 4.7_
  - [x] 8.2 Обеспечить keyboard accessibility
    - Добавить keyboard navigation
    - Добавить ARIA атрибуты
    - _Requirements: 3.8, 9.3_
  - [ ]* 8.3 Написать property test для Keyboard Accessibility
    - **Property 9: Keyboard Accessibility**
    - **Validates: Requirements 9.3**

- [ ] 9. Checkpoint - AI Demo Widget
  - Протестировать полный цикл общения с ботом
  - Проверить работу голосовых сообщений
  - Убедиться в корректной обработке ошибок

### Фаза 3: Аутентификация и Dashboard

- [x] 10. Настроить Supabase
  - [x] 10.1 Инициализировать Supabase проект
    - Создать проект в Supabase Dashboard
    - Настроить environment variables
    - Установить `@supabase/supabase-js`
    - _Requirements: 14.1, 14.3_
  - [x] 10.2 Создать схему базы данных
    - Создать таблицы: profiles, business_profiles, menu_items, subscriptions, conversation_logs
    - Настроить Row Level Security (RLS)
    - _Requirements: 14.4_
  - [x] 10.3 Настроить Supabase Storage
    - Создать bucket для меню и изображений
    - Настроить политики доступа
    - _Requirements: 14.5_

- [x] 11. Реализовать аутентификацию
  - [x] 11.1 Создать страницы Login и Register
    - Создать `src/pages/Login.tsx`
    - Создать `src/pages/Register.tsx`
    - Интегрировать с Supabase Auth
    - _Requirements: 5.1, 5.3_
  - [x] 11.2 Добавить OAuth (Google)
    - Настроить Google OAuth в Supabase
    - Добавить кнопку "Sign in with Google"
    - _Requirements: 5.6_
  - [x] 11.3 Реализовать password reset
    - Создать страницу восстановления пароля
    - Настроить email templates в Supabase
    - _Requirements: 5.7_
  - [ ]* 11.4 Написать property test для Authentication
    - **Property 4: Authentication Data Integrity**
    - **Validates: Requirements 5.2, 5.7, 5.8**

- [x] 12. Создать базовый Dashboard
  - [x] 12.1 Настроить React Router
    - Установить `react-router-dom`
    - Создать protected routes
    - Настроить layout для Dashboard
    - _Requirements: 5.4_
  - [x] 12.2 Создать Dashboard layout
    - Создать `src/layouts/DashboardLayout.tsx`
    - Добавить sidebar navigation
    - Добавить header с user info
    - _Requirements: 6.1_

- [x] 13. Реализовать Business Profile
  - [x] 13.1 Создать форму профиля бизнеса
    - Создать `src/pages/dashboard/BusinessProfile.tsx`
    - Добавить поля: name, type, description, contacts
    - Интегрировать с Supabase
    - _Requirements: 6.2_
  - [x] 13.2 Реализовать управление меню
    - Создать `src/pages/dashboard/MenuManager.tsx`
    - Добавить CRUD для menu items
    - Добавить загрузку изображений
    - _Requirements: 6.3, 6.4_
  - [x] 13.3 Добавить индикатор completeness
    - Рассчитывать процент заполненности
    - Показывать progress bar
    - _Requirements: 6.6_
  - [ ]* 13.4 Написать property test для Business Profile
    - **Property 5: Business Profile Data Integrity**
    - **Validates: Requirements 6.2, 6.3, 6.4, 6.5, 6.6**

- [ ] 14. Checkpoint - Аутентификация и Dashboard
  - Протестировать регистрацию и логин
  - Проверить сохранение профиля бизнеса
  - Убедиться в работе RLS политик

### Фаза 4: Подписки и платежи

- [ ] 15. Интегрировать Stripe
  - [ ] 15.1 Настроить Stripe
    - Создать Stripe аккаунт и получить API keys
    - Установить `@stripe/stripe-js` и `stripe`
    - Настроить products и prices в Stripe Dashboard
    - _Requirements: 7.7_
  - [ ] 15.2 Создать страницу тарифов
    - Создать `src/pages/dashboard/Pricing.tsx`
    - Отобразить тарифные планы
    - Добавить кнопки выбора плана
    - _Requirements: 7.1_
  - [ ] 15.3 Реализовать Checkout flow
    - Создать Stripe Checkout Session
    - Обработать redirect после оплаты
    - _Requirements: 7.2, 7.3_

- [ ] 16. Реализовать Stripe Webhooks
  - [ ] 16.1 Создать webhook endpoint
    - Добавить endpoint в Telegram Proxy сервис
    - Обработать события: checkout.session.completed, customer.subscription.updated
    - Обновлять статус подписки в Supabase
    - _Requirements: 14.8_
  - [ ]* 16.2 Написать property test для Stripe Webhooks
    - **Property 12: Stripe Webhook Processing**
    - **Validates: Requirements 14.8**

- [ ] 17. Управление подпиской
  - [ ] 17.1 Создать страницу Billing
    - Создать `src/pages/dashboard/Billing.tsx`
    - Показать текущий план и статус
    - Показать дату следующего платежа
    - _Requirements: 7.4_
  - [ ] 17.2 Реализовать отмену подписки
    - Добавить кнопку отмены
    - Интегрировать с Stripe Customer Portal
    - _Requirements: 7.5_
  - [ ]* 17.3 Написать property test для Subscription State
    - **Property 6: Subscription State Management**
    - **Validates: Requirements 7.3, 7.5, 8.5, 11.4**

- [ ] 18. Настройка AI оператора
  - [ ] 18.1 Создать страницу AI Configuration
    - Создать `src/pages/dashboard/AIConfig.tsx`
    - Добавить настройку greeting messages
    - Добавить настройку business hours
    - _Requirements: 8.1, 8.2, 8.3_
  - [ ] 18.2 Добавить интеграционные инструкции
    - Показать инструкции для Telegram, WhatsApp
    - Генерация API ключей
    - _Requirements: 8.4, 8.5_
  - [ ]* 18.3 Написать property test для AI Configuration
    - **Property 7: AI Configuration Effect**
    - **Validates: Requirements 8.2, 8.3**

- [ ] 19. Аналитика для клиента
  - [ ] 19.1 Создать страницу Analytics
    - Создать `src/pages/dashboard/Analytics.tsx`
    - Показать логи разговоров
    - Добавить базовые метрики
    - _Requirements: 8.6_

- [ ] 20. Checkpoint - Подписки и платежи
  - Протестировать полный payment flow
  - Проверить webhook обработку
  - Убедиться в корректном обновлении статусов

### Фаза 5: Админ-панель

- [ ] 21. Создать Admin Layout
  - [ ] 21.1 Настроить admin routes
    - Добавить проверку роли admin
    - Создать `src/layouts/AdminLayout.tsx`
    - _Requirements: 11.1_

- [ ] 22. Управление клиентами
  - [ ] 22.1 Создать список клиентов
    - Создать `src/pages/admin/Clients.tsx`
    - Показать таблицу с клиентами
    - Добавить фильтрацию и поиск
    - _Requirements: 11.1, 11.2_
  - [ ] 22.2 Создать детальный просмотр клиента
    - Создать `src/pages/admin/ClientDetail.tsx`
    - Показать Business Profile и usage
    - Добавить управление подпиской
    - _Requirements: 11.3, 11.4_
  - [ ]* 22.3 Написать property test для Admin Filtering
    - **Property 11: Admin Data Access**
    - **Validates: Requirements 11.2, 12.2, 12.4**

- [ ] 23. Платформенная аналитика
  - [ ] 23.1 Создать Admin Dashboard
    - Создать `src/pages/admin/Dashboard.tsx`
    - Показать KPIs: revenue, clients, messages
    - Добавить графики трендов
    - _Requirements: 11.5, 12.1, 12.3_
  - [ ] 23.2 Добавить логи и алерты
    - Показать conversation logs
    - Настроить алерты по error rate
    - Показать Telegram bot health
    - _Requirements: 12.2, 12.4, 12.5_

- [ ] 24. Управление демо-ботом
  - [ ] 24.1 Создать Demo Config страницу
    - Создать `src/pages/admin/DemoConfig.tsx`
    - Настройка greeting и personality
    - Управление демо-меню
    - _Requirements: 13.1, 13.2_
  - [ ] 24.2 Добавить демо-аналитику
    - Показать демо conversation logs
    - Показать популярные запросы
    - _Requirements: 13.3_

- [ ] 25. Checkpoint - Админ-панель
  - Протестировать все admin функции
  - Проверить RLS для admin роли
  - Убедиться в корректности аналитики

### Фаза 6: Финализация

- [ ] 26. Мультиязычность
  - [ ] 26.1 Обновить систему переводов
    - Расширить `src/translations.ts`
    - Добавить переводы для всех новых компонентов
    - _Requirements: 10.1_
  - [ ] 26.2 Добавить persistence языка
    - Сохранять выбор в localStorage
    - Восстанавливать при загрузке
    - _Requirements: 10.3_
  - [ ]* 26.3 Написать property test для Language Consistency
    - **Property 10: Language Consistency**
    - **Validates: Requirements 10.1, 10.2, 10.3, 10.4**

- [ ] 27. Производительность и доступность
  - [ ] 27.1 Оптимизировать производительность
    - Добавить lazy loading для routes
    - Оптимизировать bundle size
    - Добавить image optimization
    - _Requirements: 9.1, 9.6_
  - [ ] 27.2 Обеспечить responsive design
    - Протестировать на всех breakpoints
    - Исправить layout issues
    - _Requirements: 9.2_
  - [ ] 27.3 Добавить reduced-motion support
    - Проверить prefers-reduced-motion
    - Отключать анимации при необходимости
    - _Requirements: 9.5_
  - [ ]* 27.4 Написать property test для Responsive Layout
    - **Property 8: Responsive Layout**
    - **Validates: Requirements 9.2, 9.5**

- [ ] 28. Деплой
  - [ ] 28.1 Настроить production environment
    - Настроить environment variables
    - Настроить HTTPS
    - _Requirements: 14.6, 14.7_
  - [ ] 28.2 Задеплоить Frontend
    - Настроить Vercel/Netlify
    - Настроить custom domain
    - _Requirements: 14.9_
  - [ ] 28.3 Задеплоить Telegram Proxy
    - Настроить Docker на VPS
    - Настроить Nginx reverse proxy
    - _Requirements: 14.2_

- [ ] 29. Final Checkpoint
  - Провести полное end-to-end тестирование
  - Проверить все user flows
  - Убедиться в работе всех интеграций

- [ ] 30. Merge в main
  - [ ] 30.1 Подготовить Pull Request
    - Создать PR из `feature/platform-v2` в `main`
    - Описать все изменения
    - _Requirements: Безопасный деплой_
  - [ ] 30.2 Code review и merge
    - Проверить что всё работает на preview
    - Merge в main
    - Удалить feature branch
    - _Requirements: Безопасный деплой_

## Notes

- Задачи с `*` являются опциональными (property-based тесты)
- Каждая фаза заканчивается checkpoint для валидации
- Property tests используют fast-check с минимум 100 итерациями
- Все компоненты должны поддерживать мультиязычность
