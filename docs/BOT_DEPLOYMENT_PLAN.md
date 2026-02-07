# Bot-Dashboard Connection Deployment Plan

## Goal

Make the Yotto bot appear as **connected** in the iOperator Dashboard by:
1. Generating a Bot API Key in the Dashboard
2. Connecting Syrve CRM via the Dashboard UI
3. Configuring the bot to use the Config API
4. Redeploying the bot

---

## Current State

| Component | Status |
|-----------|--------|
| Config API Edge Function (`/functions/v1/config`) | ✅ Deployed on Supabase |
| `integrations` table + `integration_registry` seed | ✅ Migrated, Syrve is in registry |
| Bot `ConfigService` + `ConfigApiClient` | ✅ Code exists, accepts `IOPERATOR_API_KEY` / `IOPERATOR_API_URL` |
| `useCRMStatus` hook (Dashboard UI) | ✅ Reads `integrations` table `type='crm'`, `status='active'` |
| CRM-aware tabs (Locations, Promotions, Restrictions, BusinessProfile) | ✅ Lock when `isConnected` |
| Bot env vars on VPS | ❌ `IOPERATOR_API_KEY` and `IOPERATOR_API_URL` not set |
| Syrve integration row in `integrations` table | ❌ Not created yet |

---

## Phase 1: Dashboard Setup (Manual, via UI)

### 1.1 Generate Bot API Key

1. Go to the Dashboard → **Bot Settings** tab
2. Navigate to the **API Keys** section
3. Click **"Generate API Key"**
4. Copy the generated key (format: `iop_...`, 36+ chars)
5. Save it securely — it's shown only once

> [!IMPORTANT]
> The key is hashed with SHA-256 and stored in `bot_api_keys` table. The Config API authenticates using this hash. If the key is lost, revoke it and generate a new one.

### 1.2 Connect Syrve CRM

1. Go to Dashboard → **Agent** → **CRM** tab
2. Find **"Syrve (iiko Cloud)"** in the available integrations list
3. Click **"Connect"**
4. Fill in the required fields:
   - **API Login**: the Syrve API login key (currently in bot's `SYRVE_API_LOGIN_KEY` env var)
   - **Organization ID**: the Syrve organization ID (currently in bot's `SYRVE_ORGANIZATION_ID` env var)
5. Click **Save**
6. The integration row will be created in `integrations` table with `status = 'active'`

After this step, the Dashboard will show the CRM-managed banner on Locations, Promotions, Restrictions, and BusinessProfile (partially).

---

## Phase 2: Configure Bot Env Vars on VPS

SSH into the VPS and add the Config API credentials to the bot's `.env` file:

```bash
ssh vds-mcp

# Edit the bot's .env file
nano /home/ubuntu/YOTTO-JS-bot/.env
```

Add these lines:

```env
# iOperator Dashboard Config API
IOPERATOR_API_URL=https://<SUPABASE_PROJECT_REF>.supabase.co/functions/v1/config
IOPERATOR_API_KEY=iop_<the_key_from_step_1.1>
IOPERATOR_CACHE_TTL_MS=300000
```

> [!NOTE]
> `IOPERATOR_CACHE_TTL_MS=300000` = 5min cache. The bot uses the fallback chain: **Remote API → Cache → Local config**, so a 5min TTL balances freshness vs API load.

> [!IMPORTANT]
> Replace `<SUPABASE_PROJECT_REF>` with the actual Supabase project reference (visible in the Supabase dashboard URL: `https://supabase.com/dashboard/project/<ref>`).

---

## Phase 3: Redeploy the Bot

### Option A: Push to `main` (CI/CD)

```bash
# Any commit to main triggers GitHub Actions deploy
cd /path/to/YOTTO-JS-bot
git add .env  # if .env is already in .gitignore, skip this
git commit -m "feat: connect to iOperator Dashboard Config API"
git push origin main
```

### Option B: Manual deploy on VPS

```bash
ssh vds-mcp

cd /home/ubuntu/YOTTO-JS-bot
git pull origin main

cd /opt/infrastructure
docker-compose up -d --build yotto-js-bot
```

### Option C: Just restart the container (if only env vars changed)

```bash
ssh vds-mcp
cd /opt/infrastructure
docker-compose restart yotto-js-bot
```

---

## Phase 4: Verification

### 4.1 Bot Logs — Config API Connection

```bash
ssh vds-mcp
docker logs yotto-js-bot --tail=20 | grep -i "config"
```

**Expected log entries:**

```
ConfigService initialized with remote API { apiUrl: "https://.../**" }
Remote config fetched successfully { promptVersion: 1, promptLength: ... hasBusinessProfile: true }
```

**If connection fails, expect:**

```
Remote config fetch failed, trying fallback { error: "..." }
Using local config { promptLength: ... }
```

### 4.2 Dashboard — CRM Status

1. Open Dashboard → **Agent** → **CRM** tab
2. Verify: Syrve is shown as "Connected" with a green card
3. Verify: the **"CRM-managed sections"** summary lists Locations, Promotions, Restrictions, Business Profile (partial)

### 4.3 Dashboard — Tab Lock

Check the following tabs show the CRM banner and locked states:

| Tab | Expected |
|-----|----------|
| Locations | 🔒 Banner shown, "Add Location" hidden, fields disabled |
| Promotions | 🔒 Banner shown, "Add Promotion" hidden, cards read-only |
| Restrictions | 🔒 Banner shown, "Add Restriction" hidden, cards read-only |
| Business Profile | 🔒 Name, phone, address, hours locked. Type, description, email editable |

### 4.4 Config API Direct Test

```bash
curl -s -H "Authorization: Bearer iop_<KEY>" \
  "https://<PROJECT_REF>.supabase.co/functions/v1/config" | jq '.crm'
```

**Expected output:**

```json
{
  "provider": "syrve",
  "settings": {}
}
```

---

## Rollback

If something goes wrong:

1. **Remove env vars** from `/home/ubuntu/YOTTO-JS-bot/.env` (delete the 3 `IOPERATOR_*` lines)
2. **Restart the bot**: `docker-compose restart yotto-js-bot`
3. The bot falls back to local config automatically (the `ConfigService` switches to local-only mode when no API credentials are present)
4. Dashboard CRM integration can be disconnected from the CRM tab

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Bot logs: `ConfigService running in local-only mode` | Missing `IOPERATOR_API_KEY` or `IOPERATOR_API_URL` | Check `.env` file, restart container |
| Bot logs: `Config API authentication failed { status: 401 }` | Wrong API key or key revoked | Generate new key in Dashboard, update `.env` |
| Bot logs: `No active prompt found { status: 404 }` | No active prompt template in Dashboard | Create and activate a prompt in Dashboard → Prompt tab |
| Dashboard: CRM not showing as connected | Integration row missing or `status != 'active'` | Reconnect via CRM tab UI |
| Dashboard: tabs not locked despite CRM connected | `useCRMStatus` cache | Hard-refresh the page (Ctrl+Shift+R) |
