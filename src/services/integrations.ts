/**
 * Integration Service for iOperator.ai Platform
 * Requirements: 1.1, 1.3, 1.6, 4.4
 */

import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import type { 
  Integration, 
  IntegrationMeta, 
  IntegrationWithMeta,
  ConnectIntegrationRequest 
} from '../types/integrations';

type IntegrationRow = Database['public']['Tables']['integrations']['Row'];
type IntegrationInsert = Database['public']['Tables']['integrations']['Insert'];
type IntegrationUpdate = Database['public']['Tables']['integrations']['Update'];
type IntegrationRegistryRow = Database['public']['Tables']['integration_registry']['Row'];

// =============================================
// Get Available Integrations (from registry)
// =============================================

/**
 * Get all available integrations from the registry
 */
export async function getAvailableIntegrations(): Promise<IntegrationMeta[]> {
  const { data, error } = await supabase
    .from('integration_registry')
    .select('*')
    .eq('is_available', true)
    .order('type', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;

  return (data || []).map(mapRegistryToMeta);
}

/**
 * Get available integrations by type
 */
export async function getAvailableIntegrationsByType(
  type: 'crm' | 'channel'
): Promise<IntegrationMeta[]> {
  const { data, error } = await supabase
    .from('integration_registry')
    .select('*')
    .eq('type', type)
    .eq('is_available', true)
    .order('name', { ascending: true });

  if (error) throw error;

  return (data || []).map(mapRegistryToMeta);
}

/**
 * Get integration meta by provider
 */
export async function getIntegrationMeta(provider: string): Promise<IntegrationMeta | null> {
  const { data, error } = await supabase
    .from('integration_registry')
    .select('*')
    .eq('provider', provider)
    .single();

  if (error && error.code !== 'PGRST116') throw error;

  return data ? mapRegistryToMeta(data) : null;
}

// =============================================
// Get Business Integrations (connected)
// =============================================

/**
 * Get all connected integrations for a business
 */
export async function getBusinessIntegrations(businessId: string): Promise<Integration[]> {
  const { data, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('business_id', businessId)
    .order('type', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;

  return (data || []).map(mapRowToIntegration);
}

/**
 * Get connected integrations by type
 */
export async function getBusinessIntegrationsByType(
  businessId: string,
  type: 'crm' | 'channel'
): Promise<Integration[]> {
  const { data, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('business_id', businessId)
    .eq('type', type)
    .order('name', { ascending: true });

  if (error) throw error;

  return (data || []).map(mapRowToIntegration);
}

/**
 * Get a specific integration by ID
 */
export async function getIntegrationById(integrationId: string): Promise<Integration | null> {
  const { data, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('id', integrationId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;

  return data ? mapRowToIntegration(data) : null;
}

/**
 * Get integration by provider for a business
 */
export async function getIntegrationByProvider(
  businessId: string,
  provider: string
): Promise<Integration | null> {
  const { data, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('business_id', businessId)
    .eq('provider', provider)
    .single();

  if (error && error.code !== 'PGRST116') throw error;

  return data ? mapRowToIntegration(data) : null;
}


// =============================================
// Connect / Disconnect Integrations
// =============================================

/**
 * Connect a new integration
 */
export async function connectIntegration(
  businessId: string,
  request: ConnectIntegrationRequest
): Promise<Integration> {
  // Get integration meta to get the name and type
  const meta = await getIntegrationMeta(request.provider);
  if (!meta) {
    throw new Error(`Integration provider "${request.provider}" not found`);
  }

  // Encrypt config (in production, use proper encryption)
  const configEncrypted = encryptConfig(request.config);

  const insertData: IntegrationInsert = {
    business_id: businessId,
    provider: request.provider,
    type: meta.type,
    name: meta.name,
    status: 'pending',
    config_encrypted: configEncrypted,
  };

  const { data, error } = await supabase
    .from('integrations')
    .insert(insertData)
    .select()
    .single();

  if (error) throw error;

  return mapRowToIntegration(data);
}

/**
 * Disconnect (delete) an integration
 */
export async function disconnectIntegration(integrationId: string): Promise<void> {
  const { error } = await supabase
    .from('integrations')
    .delete()
    .eq('id', integrationId);

  if (error) throw error;
}

/**
 * Update integration configuration
 */
export async function updateIntegration(
  integrationId: string,
  config: Record<string, string>
): Promise<Integration> {
  const configEncrypted = encryptConfig(config);

  const updateData: IntegrationUpdate = {
    config_encrypted: configEncrypted,
    status: 'pending',
    error_message: null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('integrations')
    .update(updateData)
    .eq('id', integrationId)
    .select()
    .single();

  if (error) throw error;

  return mapRowToIntegration(data);
}

/**
 * Update integration status
 */
export async function updateIntegrationStatus(
  integrationId: string,
  status: 'active' | 'inactive' | 'error' | 'pending',
  errorMessage?: string
): Promise<Integration> {
  const updateData: IntegrationUpdate = {
    status,
    error_message: errorMessage || null,
    updated_at: new Date().toISOString(),
    ...(status === 'active' ? { last_sync_at: new Date().toISOString() } : {}),
  };

  const { data, error } = await supabase
    .from('integrations')
    .update(updateData)
    .eq('id', integrationId)
    .select()
    .single();

  if (error) throw error;

  return mapRowToIntegration(data);
}

// =============================================
// Get Integrations with Meta (joined data)
// =============================================

/**
 * Get all integrations with their registry metadata
 */
export async function getIntegrationsWithMeta(businessId: string): Promise<IntegrationWithMeta[]> {
  const [integrations, registry] = await Promise.all([
    getBusinessIntegrations(businessId),
    getAvailableIntegrations(),
  ]);

  const registryMap = new Map(registry.map(r => [r.provider, r]));

  return integrations
    .filter(i => registryMap.has(i.provider))
    .map(i => ({
      ...i,
      meta: registryMap.get(i.provider)!,
    }));
}

// =============================================
// Helper Functions
// =============================================

function mapRegistryToMeta(row: IntegrationRegistryRow): IntegrationMeta {
  return {
    id: row.id,
    provider: row.provider,
    type: row.type as 'crm' | 'channel',
    name: row.name,
    description: row.description,
    icon_url: row.icon_url,
    config_schema: Array.isArray(row.config_schema) ? row.config_schema : [],
    docs_url: row.docs_url,
    is_available: row.is_available,
  };
}

function mapRowToIntegration(row: IntegrationRow): Integration {
  return {
    id: row.id,
    business_id: row.business_id,
    provider: row.provider,
    type: row.type as 'crm' | 'channel',
    name: row.name,
    status: row.status as 'active' | 'inactive' | 'error' | 'pending',
    last_sync_at: row.last_sync_at,
    error_message: row.error_message,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Simple config encryption (placeholder - use proper encryption in production)
 * In production, use Supabase Vault or external KMS
 */
function encryptConfig(config: Record<string, string>): string {
  // TODO: Implement proper encryption using Supabase Vault or external KMS
  // For now, just base64 encode (NOT SECURE - placeholder only)
  return btoa(JSON.stringify(config));
}

/**
 * Decrypt config (placeholder)
 */
export function decryptConfig(encrypted: string): Record<string, string> {
  // TODO: Implement proper decryption
  try {
    return JSON.parse(atob(encrypted));
  } catch {
    return {};
  }
}
