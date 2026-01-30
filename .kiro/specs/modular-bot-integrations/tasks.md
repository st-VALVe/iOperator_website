# План реализации: Модульная архитектура интеграций бота (MVP)

## Обзор

MVP-версия модульной системы интеграций для платформы iOperator.ai. Фокус на ключевом функционале: подключение каналов связи, CRM и редактор промтов.

**Scope MVP:**
- ✅ ИИ Агент (каналы, CRM, промты)
- ✅ Настройки (API-ключи)
- ❌ Заказы, Контакты, Аналитика — Фаза 2
- ❌ Звонки, Биллинг — Фаза 3

## Задачи

- [x] 1. Настройка базы данных и миграции
  - [x] 1.1 Создать миграцию для таблицы integration_registry
    - Создать файл `supabase/migrations/003_integrations_schema.sql`
    - Определить таблицу с полями: provider, type, name, description, icon_url, config_schema, docs_url, is_available
    - _Requirements: 4.1_
  
  - [x] 1.2 Создать миграцию для таблицы integrations (подключенные интеграции клиентов)
    - Поля: business_id, provider, type, name, status, config_encrypted, last_sync_at, error_message
    - Добавить RLS-политики для изоляции данных по business_id
    - _Requirements: 4.2, 7.2_
  
  - [x] 1.3 Создать миграцию для таблиц prompt_templates и prompt_history
    - prompt_templates: business_id, name, content, variables, is_active, version
    - prompt_history: prompt_id, content, version, changed_by
    - Добавить RLS-политики
    - _Requirements: 3.8_
  
  - [x] 1.4 Создать миграцию для таблицы bot_api_keys
    - Поля: business_id, api_key_hash, last_used_at, revoked_at
    - Добавить RLS-политики
    - _Requirements: 5.1, 7.1_
  
  - [x] 1.5 Заполнить integration_registry начальными данными
    - CRM: Syrve (основная), iiko, Bitrix24
    - Каналы: Telegram, WhatsApp, Instagram
    - _Requirements: 1.1, 2.1_

- [x] 2. Создать TypeScript типы и интерфейсы
  - [x] 2.1 Обновить src/lib/database.types.ts
    - Добавить типы для новых таблиц: integration_registry, integrations, prompt_templates, prompt_history, bot_api_keys
    - _Requirements: 4.1, 4.2_
  
  - [x] 2.2 Создать src/types/integrations.ts
    - Интерфейсы: Integration, IntegrationMeta, ConfigField, IntegrationStatus
    - Типы: IntegrationType, CRMProvider, ChannelProvider
    - _Requirements: 1.2, 2.1_
  
  - [x] 2.3 Создать src/types/prompts.ts
    - Интерфейсы: PromptTemplate, PromptVariable, PromptHistory
    - _Requirements: 3.1, 3.7_
  
  - [x] 2.4 Создать src/types/botConfig.ts
    - Интерфейсы: BotConfig, ChannelConfig, CRMConfig, BotSettings
    - _Requirements: 5.2_

- [x] 3. Реализовать сервисы для работы с интеграциями
  - [x] 3.1 Создать src/services/integrations.ts
    - getAvailableIntegrations(): получение списка из integration_registry
    - getBusinessIntegrations(businessId): получение подключенных интеграций
    - connectIntegration(): подключение новой интеграции
    - disconnectIntegration(): отключение интеграции
    - updateIntegration(): обновление конфигурации
    - _Requirements: 1.1, 1.3, 1.6, 4.4_
  
  - [x] 3.2 Создать src/services/integrationValidation.ts
    - testConnection(): проверка подключения к CRM/каналу
    - validateConfig(): валидация конфигурации по схеме
    - _Requirements: 1.3, 1.4, 2.3_

- [x] 4. Реализовать сервис для работы с промтами
  - [x] 4.1 Создать src/services/prompts.ts
    - getActivePrompt(businessId): получение активного промта
    - savePrompt(): сохранение с созданием записи в истории
    - getPromptHistory(): получение истории версий
    - restoreVersion(): восстановление версии из истории
    - _Requirements: 3.1, 3.3, 3.8_
  
  - [x] 4.2 Создать src/services/promptValidation.ts
    - validatePrompt(): валидация на обязательные секции
    - substituteVariables(): подстановка переменных
    - _Requirements: 3.3, 3.7_

- [x] 5. Реализовать Config API для Bot Engine
  - [x] 5.1 Создать src/services/configApi.ts
    - generateApiKey(): генерация API-ключа для бизнеса
    - revokeApiKey(): отзыв API-ключа
    - getBotConfig(): получение полной конфигурации по API-ключу
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [x] 5.2 Создать Supabase Edge Function для Config API
    - Эндпоинт GET /config с авторизацией по API-ключу
    - Возврат: промт, каналы, CRM, каталог, настройки
    - _Requirements: 5.1, 5.2, 5.5_

- [x] 6. Создать UI: Страница ИИ Агент (интеграции)
  - [x] 6.1 Создать src/pages/dashboard/agent/AgentPage.tsx
    - Главная страница раздела "ИИ Агент"
    - Табы: Каналы, CRM, Промты
    - _Requirements: 8.1, 8.3_
  
  - [x] 6.2 Создать src/pages/dashboard/agent/ChannelsTab.tsx
    - Список каналов (Telegram, WhatsApp, Instagram)
    - Карточки с статусом подключения
    - Кнопки подключения/отключения
    - _Requirements: 2.1, 2.5_
  
  - [x] 6.3 Создать src/pages/dashboard/agent/CRMTab.tsx
    - Список CRM (Syrve, iiko, Bitrix24)
    - Статус подключения и последней синхронизации
    - _Requirements: 1.1, 1.5_
  
  - [x] 6.4 Создать src/pages/dashboard/agent/IntegrationSetupModal.tsx
    - Модальное окно настройки интеграции
    - Динамическая форма на основе config_schema
    - Кнопка "Проверить подключение"
    - _Requirements: 1.2, 1.3, 2.2, 2.3_

- [x] 7. Создать UI: Редактор промтов
  - [x] 7.1 Создать src/pages/dashboard/agent/PromptsTab.tsx
    - Текстовый редактор промта
    - Панель переменных справа
    - Кнопки: Сохранить, История
    - _Requirements: 3.1, 3.2_
  
  - [x] 7.2 Создать src/components/PromptVariables.tsx
    - Список доступных переменных
    - Вставка по клику
    - _Requirements: 3.7_
  
  - [x] 7.3 Создать src/components/PromptHistoryModal.tsx
    - Список версий с датами
    - Кнопка восстановления
    - _Requirements: 3.8_

- [x] 8. Создать UI: Страница настроек (API-ключи)
  - [x] 8.1 Создать src/pages/dashboard/settings/SettingsPage.tsx
    - Раздел API-ключей для Bot Engine
    - Отображение маскированного ключа
    - Кнопки: Сгенерировать, Отозвать
    - Инструкция по использованию
    - _Requirements: 5.1, 5.5_

- [x] 9. Интегрировать в Dashboard
  - [x] 9.1 Обновить src/layouts/DashboardLayout.tsx
    - Добавить пункт меню "ИИ Агент" с иконкой
    - Добавить пункт "Настройки" в секцию НАСТРОЙКИ
    - _Requirements: 8.3, 8.4_
  
  - [x] 9.2 Обновить src/App.tsx
    - Добавить роуты: /dashboard/agent, /dashboard/settings
    - _Requirements: 8.4_

- [x] 10. Финальная проверка MVP
  - Проверить подключение Telegram канала
  - Проверить сохранение и загрузку промта
  - Проверить генерацию API-ключа
  - Проверить работу Config API

## Отложено на Фазу 2

- Страница клиентов и переписок (Требования 9)
- Страница заказов (Требования 10)
- Страница аналитики (Требования 11)
- Логирование событий интеграций
- Property-based тесты

## Примечания

- MVP фокусируется на core-функционале для запуска модульного бота
- После MVP можно добавлять функционал итеративно
- Каждая задача ссылается на требования для трассируемости
