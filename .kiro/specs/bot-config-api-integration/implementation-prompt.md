# Bot Config API Integration - Implementation Prompt

## Context

You are working on the iOperator.ai platform - a SaaS solution for AI-powered restaurant operators. The platform consists of:

1. **Dashboard (Frontend)** - React/TypeScript web application at https://dev.ioperator.ai
   - Already deployed and working
   - Users can manage business profiles, menus, integrations, prompts
   - Has API key generation in Settings page
   - Supabase project: `oltsodebfkpunanczcnx`

2. **YOTTO-JS-bot (Bot Engine)** - Node.js/TypeScript Telegram bot
   - Currently uses hardcoded local configuration
   - Located in separate repository (not this one)
   - Deployed on VPS via Docker: `yotto-js-bot` container
   - Needs to fetch configuration from Dashboard

3. **Supabase Edge Function** - Config API endpoint
   - Already implemented in `supabase/functions/config/index.ts`
   - NOT YET DEPLOYED to Supabase
   - Endpoint: `GET /functions/v1/config`
   - Authentication: `Bearer <api_key>`

## What's Already Done

✅ **Dashboard Implementation (100% complete):**
- Database schema with tables: `business_profiles`, `menu_items`, `integrations`, `prompt_templates`, `bot_api_keys`
- UI pages: Agent (Channels/CRM/Prompts), Settings (API keys), Business Profile, Menu Manager
- Services: `configApi.ts`, `integrations.ts`, `prompts.ts`, `businessProfile.ts`, `menuItems.ts`
- API key generation and management working in Dashboard

✅ **Edge Function Code (written but not deployed):**
- `supabase/functions/config/index.ts` - complete implementation
- Authenticates via API key
- Returns full bot config: prompt, channels, CRM, catalog, settings
- Variable substitution in prompts

❌ **Bot Engine Integration (NOT STARTED):**
- Bot still uses local config files
- No API client to fetch from Dashboard
- No fallback logic implemented
- No dev instance for testing

## Your Task

Implement the Bot Config API Integration to connect YOTTO-JS-bot with the Dashboard. This will allow businesses to manage bot configuration through the web interface instead of editing code.

## Implementation Steps

### Step 1: Deploy Supabase Edge Function

**Prerequisites:**
- Supabase CLI must be installed: `npm install -g supabase`
- Must be logged in: `supabase login`
- Project must be linked: `supabase link --project-ref oltsodebfkpunanczcnx`

**Actions:**
1. Deploy the config function:
   ```bash
   supabase functions deploy config
   ```

2. Verify deployment:
   - Endpoint should be: `https://oltsodebfkpunanczcnx.supabase.co/functions/v1/config`
   - Test with curl (use API key from Dashboard Settings):
   ```bash
   curl -H "Authorization: Bearer iop_xxxxx..." \
        https://oltsodebfkpunanczcnx.supabase.co/functions/v1/config
   ```

3. Expected response:
   ```json
   {
     "success": true,
     "config": {
       "business_id": "...",
       "business_name": "...",
       "prompt": "...",
       "channels": [...],
       "crm": {...},
       "catalog": [...],
       "settings": {...}
     }
   }
   ```

**Note:** This step requires access to the Supabase project. If you don't have access, ask the user to deploy it manually or provide credentials.

---

### Step 2: Create Config API Client in Bot

**Location:** YOTTO-JS-bot repository (separate from this repo)

**Files to create:**

#### `src/services/configApi/client.ts`
```typescript
/**
 * Config API Client - fetches configuration from Dashboard
 */

import axios from 'axios';

export interface BotConfig {
  business_id: string;
  business_name: string;
  business_type: string;
  prompt: string;
  channels: Array<{
    provider: string;
    enabled: boolean;
    credentials_encrypted: string;
  }>;
  crm: {
    provider: string;
    credentials_encrypted: string;
    sync_contacts: boolean;
    sync_orders: boolean;
  } | null;
  catalog: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    category: string | null;
    image_url: string | null;
    available: boolean;
  }>;
  settings: {
    language: string;
    timezone: string;
    working_hours: Array<{
      day: string;
      open: string;
      close: string;
      is_closed: boolean;
    }>;
  };
}

export interface ConfigApiResponse {
  success: boolean;
  config: BotConfig;
}

export class ConfigApiClient {
  private apiUrl: string;
  private apiKey: string;

  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  async fetchConfig(): Promise<BotConfig> {
    try {
      const response = await axios.get<ConfigApiResponse>(
        `${this.apiUrl}/config`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
          timeout: 10000, // 10 second timeout
        }
      );

      if (!response.data.success) {
        throw new Error('API returned success: false');
      }

      return response.data.config;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Invalid or revoked API key');
        }
        if (error.response?.status === 404) {
          throw new Error('Business not found');
        }
      }
      throw new Error(`Failed to fetch config: ${error.message}`);
    }
  }
}
```

#### `src/services/configApi/cache.ts`
```typescript
/**
 * Config Cache - in-memory cache with TTL
 */

import type { BotConfig } from './client';

interface CacheEntry {
  config: BotConfig;
  timestamp: number;
}

export class ConfigCache {
  private cache: CacheEntry | null = null;
  private ttlMs: number;

  constructor(ttlSeconds: number = 300) {
    this.ttlMs = ttlSeconds * 1000;
  }

  get(): BotConfig | null {
    if (!this.cache) return null;

    const now = Date.now();
    if (now - this.cache.timestamp > this.ttlMs) {
      // Cache expired
      this.cache = null;
      return null;
    }

    return this.cache.config;
  }

  set(config: BotConfig): void {
    this.cache = {
      config,
      timestamp: Date.now(),
    };
  }

  invalidate(): void {
    this.cache = null;
  }
}
```

#### `src/services/configApi/index.ts`
```typescript
/**
 * Config API Service - main entry point
 */

import { ConfigApiClient, type BotConfig } from './client';
import { ConfigCache } from './cache';

let client: ConfigApiClient | null = null;
let cache: ConfigCache | null = null;

export function initConfigApi(apiUrl: string, apiKey: string, cacheTtl: number = 300): void {
  client = new ConfigApiClient(apiUrl, apiKey);
  cache = new ConfigCache(cacheTtl);
}

export async function getRemoteConfig(): Promise<BotConfig | null> {
  if (!client || !cache) {
    throw new Error('Config API not initialized. Call initConfigApi() first.');
  }

  // Try cache first
  const cached = cache.get();
  if (cached) {
    console.log('[ConfigAPI] Using cached config');
    return cached;
  }

  // Fetch from API
  try {
    console.log('[ConfigAPI] Fetching config from Dashboard...');
    const config = await client.fetchConfig();
    cache.set(config);
    console.log('[ConfigAPI] Config fetched successfully');
    return config;
  } catch (error) {
    console.error('[ConfigAPI] Failed to fetch config:', error.message);
    cache.invalidate();
    return null;
  }
}

export { type BotConfig } from './client';
```

---

### Step 3: Implement Fallback Config Loader

**Location:** YOTTO-JS-bot repository

#### `src/config/remoteConfig.ts`
```typescript
/**
 * Remote Config Loader with Fallback
 */

import { getRemoteConfig, initConfigApi, type BotConfig } from '../services/configApi';
import { SYSTEM_PROMPT } from '../agent/prompt'; // existing local prompt

export interface LoadedConfig {
  prompt: string;
  source: 'remote' | 'local';
  businessId?: string;
  businessName?: string;
}

let configInitialized = false;

export async function loadConfig(): Promise<LoadedConfig> {
  const apiKey = process.env.IOPERATOR_API_KEY;
  const apiUrl = process.env.IOPERATOR_API_URL || 'https://oltsodebfkpunanczcnx.supabase.co/functions/v1';
  const cacheTtl = parseInt(process.env.IOPERATOR_CONFIG_CACHE_TTL || '300', 10);

  // If no API key, use local config
  if (!apiKey) {
    console.log('[Config] IOPERATOR_API_KEY not set, using local config');
    return {
      prompt: SYSTEM_PROMPT,
      source: 'local',
    };
  }

  // Initialize API client (only once)
  if (!configInitialized) {
    initConfigApi(apiUrl, apiKey, cacheTtl);
    configInitialized = true;
  }

  // Try to fetch remote config
  try {
    const remoteConfig = await getRemoteConfig();
    
    if (remoteConfig) {
      console.log(`[Config] Using remote config for business: ${remoteConfig.business_name}`);
      return {
        prompt: remoteConfig.prompt,
        source: 'remote',
        businessId: remoteConfig.business_id,
        businessName: remoteConfig.business_name,
      };
    }
  } catch (error) {
    console.error('[Config] Error fetching remote config:', error);
  }

  // Fallback to local config
  console.log('[Config] Falling back to local config');
  return {
    prompt: SYSTEM_PROMPT,
    source: 'local',
  };
}
```

---

### Step 4: Update Agent to Use Dynamic Prompt

**Location:** YOTTO-JS-bot repository

#### Update `src/agent/prompt.ts`
```typescript
/**
 * System Prompt - now supports dynamic loading
 */

import { loadConfig } from '../config/remoteConfig';

// Local fallback prompt (existing)
export const SYSTEM_PROMPT = `Ты — AI-оператор ресторана...`;

// New: Dynamic prompt loader
let cachedPrompt: string | null = null;
let lastLoadTime = 0;
const RELOAD_INTERVAL = 5 * 60 * 1000; // 5 minutes

export async function getSystemPrompt(): Promise<string> {
  const now = Date.now();
  
  // Reload if cache expired
  if (!cachedPrompt || now - lastLoadTime > RELOAD_INTERVAL) {
    const config = await loadConfig();
    cachedPrompt = config.prompt;
    lastLoadTime = now;
    
    console.log(`[Prompt] Loaded ${config.source} prompt`);
  }

  return cachedPrompt;
}
```

#### Update `src/agent/index.ts`
```typescript
/**
 * Agent - main AI agent logic
 */

import { getSystemPrompt } from './prompt'; // Updated import

// ... existing code ...

export async function createAgent() {
  const systemPrompt = await getSystemPrompt(); // Changed from constant to function call
  
  // ... rest of agent initialization using systemPrompt ...
}
```

---

### Step 5: Add Environment Variables

**Location:** YOTTO-JS-bot repository

#### Update `.env.example`
```bash
# Existing variables
TELEGRAM_BOT_TOKEN=your_bot_token
OPENAI_API_KEY=your_openai_key

# New: iOperator Dashboard Integration (optional)
# If not set, bot will use local configuration
IOPERATOR_API_KEY=
IOPERATOR_API_URL=https://oltsodebfkpunanczcnx.supabase.co/functions/v1
IOPERATOR_CONFIG_CACHE_TTL=300
```

---

### Step 6: Create Dev Instance on VPS

**Location:** VPS server (ssh vds-mcp)

#### Create `docker-compose.dev.yml`
```yaml
version: '3.8'

services:
  yotto-js-bot-dev:
    build: .
    container_name: yotto-js-bot-dev
    restart: unless-stopped
    env_file:
      - .env.dev
    volumes:
      - ./data-dev:/app/data
    ports:
      - "3001:3000"  # Different port from production
    networks:
      - bot-network

networks:
  bot-network:
    driver: bridge
```

#### Create `.env.dev`
```bash
# Copy from .env and modify:
TELEGRAM_BOT_TOKEN=<TEST_BOT_TOKEN>  # From @BotFather
OPENAI_API_KEY=<same_as_production>

# Dashboard Integration
IOPERATOR_API_KEY=<generated_from_dashboard>
IOPERATOR_API_URL=https://oltsodebfkpunanczcnx.supabase.co/functions/v1
IOPERATOR_CONFIG_CACHE_TTL=300
```

#### Deploy dev instance
```bash
# SSH to VPS
ssh vds-mcp

# Navigate to bot directory
cd /path/to/yotto-js-bot

# Build and start dev instance
docker-compose -f docker-compose.dev.yml up -d --build

# Check logs
docker logs -f yotto-js-bot-dev
```

---

### Step 7: Integration Testing

#### Test 1: Remote Config (with API key)
1. Generate API key in Dashboard Settings
2. Add to `.env.dev`: `IOPERATOR_API_KEY=iop_xxxxx...`
3. Restart dev bot: `docker-compose -f docker-compose.dev.yml restart`
4. Check logs: should see "Config source: remote"
5. Send message to test bot - should use Dashboard prompt

#### Test 2: Local Fallback (without API key)
1. Remove `IOPERATOR_API_KEY` from `.env.dev`
2. Restart dev bot
3. Check logs: should see "Config source: local"
4. Bot should work with hardcoded prompt

#### Test 3: API Failure (invalid key)
1. Set invalid API key: `IOPERATOR_API_KEY=iop_invalid`
2. Restart dev bot
3. Check logs: should see fallback message
4. Bot should work with local config

#### Test 4: Prompt Update
1. Update prompt in Dashboard (Agent → Prompts tab)
2. Wait 5 minutes (cache TTL) or restart bot
3. Send message to bot
4. Verify bot uses new prompt

---

## Success Criteria

✅ Edge Function deployed and accessible
✅ Bot can fetch config from Dashboard with valid API key
✅ Bot falls back to local config when API key missing/invalid
✅ Bot caches config for 5 minutes
✅ Dev instance runs separately from production
✅ Production bot unaffected (no API key set)
✅ Logs clearly show config source (remote/local)

## Rollback Plan

If issues occur:
1. Remove `IOPERATOR_API_KEY` from `.env` or `.env.dev`
2. Restart bot: `docker-compose restart yotto-js-bot`
3. Bot will use local config (current behavior)
4. No data loss, no downtime

## Important Notes

1. **Production Safety:** Production bot (`yotto-js-bot`) continues using local config until you explicitly set `IOPERATOR_API_KEY`

2. **Separate Repositories:** Dashboard code is in this repo (`iOperator_website`), bot code is in separate repo (`yotto-js-bot`)

3. **VPS Access:** Use `ssh vds-mcp` to access server (configured in SSH config)

4. **Supabase Project:** All services use project `oltsodebfkpunanczcnx`

5. **Test Bot:** Create new bot via @BotFather for dev instance testing

## Questions to Ask User

Before starting implementation:

1. Do you have access to the YOTTO-JS-bot repository? (Need to modify bot code)
2. Do you have Supabase CLI installed and logged in?
3. Have you created a test Telegram bot via @BotFather?
4. Do you want me to deploy the Edge Function, or will you do it manually?
5. Should I create the bot integration code, or just provide instructions?

## Next Steps After Implementation

Once this integration is complete, you can:
- Manage bot prompts through Dashboard UI
- Add channel integrations (WhatsApp, Instagram)
- Configure CRM sync (Syrve, iiko)
- Monitor bot usage and API key activity
- Roll out to production by setting API key

---

**Ready to implement? Let me know which steps you want me to execute!**
