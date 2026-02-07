# Bot Config API Integration - Implementation Plan

## Overview

Safe integration of YOTTO-JS-bot with iOperator Dashboard Config API with fallback to local config.

## Prerequisites

- [ ] Create test Telegram bot via @BotFather (user action)
- [ ] Generate API key in Dashboard for test business (user action)

## Tasks

- [ ] 1. Deploy Supabase Edge Function
  - [ ] 1.1 Install Supabase CLI locally (if not installed)
    - Run: `npm install -g supabase`
    - _Requirements: 4.1_
  
  - [ ] 1.2 Login to Supabase
    - Run: `supabase login`
    - _Requirements: 4.1_
  
  - [ ] 1.3 Link project
    - Run: `supabase link --project-ref oltsodebfkpunanczcnx`
    - _Requirements: 4.1_
  
  - [ ] 1.4 Deploy config function
    - Run: `supabase functions deploy config`
    - Verify endpoint: `https://oltsodebfkpunanczcnx.supabase.co/functions/v1/config`
    - _Requirements: 4.2, 4.3, 4.4_

- [ ] 2. Create Config API Client in Bot
  - [ ] 2.1 Create `src/services/configApi/client.ts`
    - HTTP client to fetch config from Dashboard
    - Handle authentication with API key header
    - Return typed config response
    - _Requirements: 1.1, 1.2_
  
  - [ ] 2.2 Create `src/services/configApi/cache.ts`
    - In-memory cache with TTL (5 minutes)
    - Cache invalidation on error
    - _Requirements: 1.5_
  
  - [ ] 2.3 Create `src/services/configApi/index.ts`
    - Main entry point: `getRemoteConfig()`
    - Combine client + cache
    - _Requirements: 1.1_

- [ ] 3. Implement Fallback Config Loader
  - [ ] 3.1 Create `src/config/remoteConfig.ts`
    - Function: `loadConfig()` with fallback logic
    - If IOPERATOR_API_KEY set → try remote, fallback to local
    - If not set → use local only
    - Log config source
    - _Requirements: 1.3, 1.4, 1.6_
  
  - [ ] 3.2 Update `src/agent/prompt.ts`
    - Export function `getSystemPrompt()` instead of constant
    - Check for remote prompt first, fallback to local
    - _Requirements: 2.1, 2.2_
  
  - [ ] 3.3 Update agent to use dynamic prompt
    - Modify `src/agent/index.ts` to call `getSystemPrompt()`
    - _Requirements: 2.1_

- [ ] 4. Add Environment Variables
  - [ ] 4.1 Update `.env.example` with new variables
    - `IOPERATOR_API_KEY` - API key from Dashboard
    - `IOPERATOR_API_URL` - Edge Function URL (default: Supabase)
    - `IOPERATOR_CONFIG_CACHE_TTL` - Cache TTL in seconds (default: 300)
    - _Requirements: 1.1_

- [ ] 5. Create Dev Instance on VPS
  - [ ] 5.1 Create `docker-compose.dev.yml` for dev instance
    - Separate container: `yotto-js-bot-dev`
    - Different port mapping
    - Mount `.env.dev` file
    - _Requirements: 3.1, 3.4_
  
  - [ ] 5.2 Create `.env.dev` configuration
    - Copy from `.env`
    - Replace TELEGRAM_BOT_TOKEN with test bot token
    - Add IOPERATOR_API_KEY
    - _Requirements: 3.2, 3.3_
  
  - [ ] 5.3 Deploy dev instance
    - Run: `docker-compose -f docker-compose.dev.yml up -d`
    - Verify bot responds to test Telegram bot
    - _Requirements: 3.1_

- [ ] 6. Integration Testing
  - [ ] 6.1 Test with API key (remote config)
    - Set IOPERATOR_API_KEY in dev instance
    - Verify bot fetches config from Dashboard
    - Check logs for "Config source: remote"
  
  - [ ] 6.2 Test without API key (local fallback)
    - Remove IOPERATOR_API_KEY
    - Verify bot uses local config
    - Check logs for "Config source: local"
  
  - [ ] 6.3 Test API failure (fallback)
    - Set invalid API key
    - Verify bot falls back to local config
    - Check logs for fallback message

- [ ] 7. Production Deployment (after testing)
  - [ ] 7.1 Merge changes to main branch
    - Create PR with all changes
    - Review and merge
  
  - [ ] 7.2 Deploy to production
    - Production bot will use local config by default
    - IOPERATOR_API_KEY not set initially
    - Can be enabled later per-business

## Rollback Plan

If issues occur:
1. Remove `IOPERATOR_API_KEY` from `.env`
2. Restart bot: `docker-compose restart yotto-js-bot`
3. Bot will use local config (current behavior)

## Notes

- Production bot remains unaffected until IOPERATOR_API_KEY is explicitly set
- Dev instance allows safe testing without production risk
- Fallback ensures bot works even if Dashboard is down
