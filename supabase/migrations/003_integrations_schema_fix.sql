-- =============================================
-- iOperator.ai Platform - Integrations Schema FIX
-- Исправление: удаление существующих политик перед созданием
-- =============================================

-- Удаляем существующие политики если они есть
DROP POLICY IF EXISTS "Owner manages integrations" ON integrations;
DROP POLICY IF EXISTS "Owner manages prompts" ON prompt_templates;
DROP POLICY IF EXISTS "Owner views prompt history" ON prompt_history;
DROP POLICY IF EXISTS "System inserts prompt history" ON prompt_history;
DROP POLICY IF EXISTS "Owner manages api keys" ON bot_api_keys;
DROP POLICY IF EXISTS "Owner views integration logs" ON integration_logs;
DROP POLICY IF EXISTS "System inserts integration logs" ON integration_logs;

-- Удаляем существующие триггеры если они есть
DROP TRIGGER IF EXISTS update_integrations_updated_at ON integrations;
DROP TRIGGER IF EXISTS update_prompt_templates_updated_at ON prompt_templates;

-- =============================================
-- 1. Integration Registry Table
-- =============================================
CREATE TABLE IF NOT EXISTS integration_registry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('crm', 'channel')),
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  config_schema JSONB NOT NULL DEFAULT '[]',
  docs_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_integration_registry_type ON integration_registry(type);
CREATE INDEX IF NOT EXISTS idx_integration_registry_provider ON integration_registry(provider);

-- =============================================
-- 2. Integrations Table
-- =============================================
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE NOT NULL,
  provider TEXT REFERENCES integration_registry(provider) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('crm', 'channel')),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'error', 'pending')),
  config_encrypted BYTEA,
  last_sync_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, provider)
);

ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages integrations" ON integrations
  FOR ALL USING (
    business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX IF NOT EXISTS idx_integrations_business_id ON integrations(business_id);
CREATE INDEX IF NOT EXISTS idx_integrations_provider ON integrations(provider);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON integrations(status);

CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 3. Prompt Templates Table
-- =============================================
CREATE TABLE IF NOT EXISTS prompt_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT DEFAULT 'Основной промт',
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages prompts" ON prompt_templates
  FOR ALL USING (
    business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX IF NOT EXISTS idx_prompt_templates_business_id ON prompt_templates(business_id);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_is_active ON prompt_templates(is_active);

CREATE TRIGGER update_prompt_templates_updated_at
  BEFORE UPDATE ON prompt_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 4. Prompt History Table
-- =============================================
CREATE TABLE IF NOT EXISTS prompt_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_id UUID REFERENCES prompt_templates(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  version INTEGER NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE prompt_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner views prompt history" ON prompt_history
  FOR SELECT USING (
    prompt_id IN (
      SELECT id FROM prompt_templates 
      WHERE business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid())
    ) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "System inserts prompt history" ON prompt_history
  FOR INSERT WITH CHECK (
    prompt_id IN (
      SELECT id FROM prompt_templates 
      WHERE business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid())
    ) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX IF NOT EXISTS idx_prompt_history_prompt_id ON prompt_history(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_history_version ON prompt_history(version);

-- =============================================
-- 5. Bot API Keys Table
-- =============================================
CREATE TABLE IF NOT EXISTS bot_api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  api_key_hash TEXT NOT NULL,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

ALTER TABLE bot_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages api keys" ON bot_api_keys
  FOR ALL USING (
    business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX IF NOT EXISTS idx_bot_api_keys_business_id ON bot_api_keys(business_id);
CREATE INDEX IF NOT EXISTS idx_bot_api_keys_api_key_hash ON bot_api_keys(api_key_hash);

-- =============================================
-- 6. Seed Data: Integration Registry
-- =============================================
INSERT INTO integration_registry (provider, type, name, description, icon_url, config_schema, docs_url, is_available) VALUES
('syrve', 'crm', 'Syrve (iiko Cloud)', 'Интеграция с Syrve для ресторанов и кафе', '/icons/syrve.svg',
  '[{"key": "api_login", "label": "API Login", "type": "text", "required": true, "help_text": "Логин для API Syrve"},
    {"key": "organization_id", "label": "Organization ID", "type": "text", "required": true, "help_text": "ID организации в Syrve"}]'::jsonb,
  'https://api-ru.syrve.live/swagger/ui/index', true),
('iiko', 'crm', 'iiko', 'Интеграция с iiko для ресторанного бизнеса', '/icons/iiko.svg',
  '[{"key": "api_login", "label": "API Login", "type": "text", "required": true, "help_text": "Логин для API iiko"}]'::jsonb,
  'https://api-ru.iiko.services/', true),
('bitrix24', 'crm', 'Bitrix24', 'Интеграция с Bitrix24 CRM', '/icons/bitrix24.svg', 
  '[{"key": "webhook_url", "label": "Webhook URL", "type": "url", "required": true, "help_text": "URL вебхука из настроек Bitrix24"}]'::jsonb,
  'https://dev.1c-bitrix.ru/rest_help/', true)
ON CONFLICT (provider) DO NOTHING;

INSERT INTO integration_registry (provider, type, name, description, icon_url, config_schema, docs_url, is_available) VALUES
('telegram', 'channel', 'Telegram', 'Подключение Telegram бота', '/icons/telegram.svg',
  '[{"key": "bot_token", "label": "Bot Token", "type": "password", "required": true, "help_text": "Токен от @BotFather"}]'::jsonb,
  'https://core.telegram.org/bots', true),
('whatsapp', 'channel', 'WhatsApp', 'Интеграция с WhatsApp Business API', '/icons/whatsapp.svg',
  '[{"key": "phone_number_id", "label": "Phone Number ID", "type": "text", "required": true},
    {"key": "access_token", "label": "Access Token", "type": "password", "required": true},
    {"key": "webhook_verify_token", "label": "Webhook Verify Token", "type": "text", "required": true}]'::jsonb,
  'https://developers.facebook.com/docs/whatsapp', true),
('instagram', 'channel', 'Instagram Direct', 'Интеграция с Instagram Direct Messages', '/icons/instagram.svg',
  '[{"key": "page_id", "label": "Facebook Page ID", "type": "text", "required": true},
    {"key": "access_token", "label": "Access Token", "type": "password", "required": true}]'::jsonb,
  'https://developers.facebook.com/docs/messenger-platform', true)
ON CONFLICT (provider) DO NOTHING;

-- =============================================
-- 7. Integration Logs Table
-- =============================================
CREATE TABLE IF NOT EXISTS integration_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB,
  status TEXT CHECK (status IN ('success', 'error')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE integration_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner views integration logs" ON integration_logs
  FOR SELECT USING (
    integration_id IN (
      SELECT id FROM integrations 
      WHERE business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid())
    ) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "System inserts integration logs" ON integration_logs
  FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_integration_logs_integration_id ON integration_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_created_at ON integration_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_integration_logs_event_type ON integration_logs(event_type);
