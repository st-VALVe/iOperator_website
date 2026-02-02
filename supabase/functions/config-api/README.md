# Config API Edge Function

Provides bot configuration to authenticated YOTTO-JS-bot instances.

## Endpoint

```
POST https://oltsodebfkpunanccznx.supabase.co/functions/v1/config-api
```

## Authentication

Use Bearer token with API key:

```bash
curl -X POST \
  https://oltsodebfkpunanccznx.supabase.co/functions/v1/config-api \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

## Response

```json
{
  "systemPrompt": "You are Yotto...",
  "promptVersion": 1,
  "promptUpdatedAt": "2026-02-02T14:59:44.088512+00:00",
  "businessProfile": {
    "name": "YOTTO Sushi & Wok",
    "workingHours": [],
    "settings": {
      "region": "Antalya",
      "bot_name": "Yotto",
      "timezone": "Europe/Istanbul"
    }
  }
}
```

## Error Responses

| Status | Description |
|--------|-------------|
| 401 | Invalid or missing API key |
| 404 | No active prompt for business |
| 500 | Internal server error |

## Database Tables Used

- `bot_api_keys` - API key authentication (keys stored as SHA-256 hash)
- `prompt_templates` - System prompts with versioning
- `business_profiles` - Business settings

## Deployment

```bash
supabase functions deploy config-api --project-ref oltsodebfkpunanccznx
```

## Security Notes

- API keys are stored as SHA-256 hashes, never in plain text
- `verify_jwt` is disabled - function uses custom API key auth
- Keys can be revoked by setting `revoked_at` in `bot_api_keys`
