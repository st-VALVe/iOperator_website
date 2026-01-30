/**
 * Integration Types for iOperator.ai Platform
 * Requirements: 1.2, 2.1
 */

// =============================================
// Base Types
// =============================================

export type IntegrationType = 'crm' | 'channel';

export type CRMProvider = 'syrve' | 'iiko' | 'bitrix24' | 'amocrm' | 'hubspot' | 'salesforce';

export type ChannelProvider = 'telegram' | 'whatsapp' | 'instagram' | 'viber' | 'vk' | 'web_widget';

export type IntegrationProvider = CRMProvider | ChannelProvider;

export type IntegrationStatus = 'active' | 'inactive' | 'error' | 'pending';

// =============================================
// Config Schema Types
// =============================================

export type ConfigFieldType = 'text' | 'password' | 'url' | 'select';

export interface ConfigFieldOption {
  value: string;
  label: string;
}

export interface ConfigField {
  key: string;
  label: string;
  type: ConfigFieldType;
  required: boolean;
  placeholder?: string;
  options?: ConfigFieldOption[];
  help_text?: string;
}

// =============================================
// Integration Registry (Available Integrations)
// =============================================

export interface IntegrationMeta {
  id: string;
  provider: string;
  type: IntegrationType;
  name: string;
  description: string | null;
  icon_url: string | null;
  config_schema: ConfigField[];
  docs_url: string | null;
  is_available: boolean;
}

// =============================================
// Connected Integration
// =============================================

export interface Integration {
  id: string;
  business_id: string;
  provider: string;
  type: IntegrationType;
  name: string;
  status: IntegrationStatus;
  config?: Record<string, unknown>; // Decrypted config (only in memory)
  last_sync_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

// =============================================
// Integration Connection
// =============================================

export interface ConnectIntegrationRequest {
  provider: string;
  config: Record<string, string>;
}

export interface TestConnectionResult {
  success: boolean;
  error?: string;
  details?: Record<string, unknown>;
}

// =============================================
// Integration with Registry Info (joined)
// =============================================

export interface IntegrationWithMeta extends Integration {
  meta: IntegrationMeta;
}

// =============================================
// Integration Log
// =============================================

export interface IntegrationLog {
  id: string;
  integration_id: string;
  event_type: string;
  payload: Record<string, unknown> | null;
  status: 'success' | 'error' | null;
  error_message: string | null;
  created_at: string;
}
