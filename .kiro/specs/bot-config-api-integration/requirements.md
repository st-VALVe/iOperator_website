# Bot Engine Config API Integration

## Overview

Safe integration of YOTTO-JS-bot with iOperator Dashboard Config API. The bot will fetch configuration (prompts, channel settings, CRM config) from Dashboard while maintaining full backward compatibility with existing local configuration.

## Architecture

```
┌─────────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│   iOperator.ai      │────▶│  Supabase Edge       │────▶│  YOTTO-JS-bot   │
│   Dashboard         │     │  Function /config    │     │  (Bot Engine)   │
└─────────────────────┘     └──────────────────────┘     └─────────────────┘
         │                           │                           │
         │ User manages:             │ Returns:                  │ Uses:
         │ - Prompts                 │ - System prompt           │ - Prompt from API
         │ - Channels                │ - Channel configs         │ - OR local fallback
         │ - CRM settings            │ - CRM settings            │
         │ - API keys                │ - Business info           │
         └───────────────────────────┴───────────────────────────┘
```

## Safety Strategy: Fallback Mode

The integration uses a "fail-safe" approach:
1. If `IOPERATOR_API_KEY` is set → try to fetch config from Dashboard
2. If fetch fails OR API key not set → use local config (current behavior)
3. Production bot continues working even if Dashboard is down

## Requirements

### Requirement 1: Config API Client in Bot

**User Story:** As Bot Engine, I need to fetch configuration from Dashboard API to use customer-specific settings.

#### Acceptance Criteria

1. WHEN `IOPERATOR_API_KEY` env variable is set THEN bot SHALL attempt to fetch config from Dashboard
2. WHEN Dashboard API returns valid config THEN bot SHALL use the fetched prompt and settings
3. WHEN Dashboard API is unavailable THEN bot SHALL fall back to local configuration
4. WHEN `IOPERATOR_API_KEY` is not set THEN bot SHALL use local configuration (current behavior)
5. THE bot SHALL cache fetched config for 5 minutes to reduce API calls
6. THE bot SHALL log config source (API vs local) for debugging

### Requirement 2: Prompt Override

**User Story:** As a business owner, I want my custom prompt from Dashboard to be used by the bot.

#### Acceptance Criteria

1. WHEN Dashboard returns a prompt THEN bot SHALL use it instead of hardcoded SYSTEM_PROMPT
2. WHEN Dashboard prompt is empty/null THEN bot SHALL use local SYSTEM_PROMPT
3. THE bot SHALL support variable substitution in prompts (business name, menu, etc.)

### Requirement 3: Dev Instance for Testing

**User Story:** As a developer, I need a separate bot instance to test integration without affecting production.

#### Acceptance Criteria

1. THE dev instance SHALL run as separate Docker container `yotto-js-bot-dev`
2. THE dev instance SHALL use a different Telegram bot token (test bot)
3. THE dev instance SHALL connect to the same Supabase project
4. THE dev instance SHALL have its own `.env.dev` configuration

### Requirement 4: Deploy Edge Function

**User Story:** As the system, I need the Config API endpoint deployed to Supabase.

#### Acceptance Criteria

1. THE Edge Function SHALL be deployed at `/config` endpoint
2. THE Edge Function SHALL authenticate requests via API key header
3. THE Edge Function SHALL return 401 for invalid API keys
4. THE Edge Function SHALL return business config for valid API keys

## Out of Scope (Phase 2)

- Real-time config updates via webhooks
- Multi-tenant bot serving multiple businesses
- Channel-specific prompt variations
