/**
 * Config API Service for iOperator Bot Engine
 * Requirements: 5.1, 5.2, 5.3
 */

import { supabase } from '../lib/supabase';
import type { BotConfig, ChannelConfig, CRMConfig, CatalogItem, BotSettings } from '../types/botConfig';
import { getBusinessIntegrations, decryptConfig } from './integrations';
import { getActivePrompt } from './prompts';
import { substituteVariables } from './promptValidation';

// =============================================
// API Key Management
// =============================================

/**
 * Generate a new API key for a business
 * Returns the plain API key (only shown once)
 */
export async function generateApiKey(businessId: string): Promise<string> {
  // Generate random API key
  const apiKey = generateRandomApiKey();
  const apiKeyHash = await hashApiKey(apiKey);

  // Check if key already exists - use type assertion for new table
  const { data: existing } = await (supabase
    .from('bot_api_keys') as any)
    .select('id')
    .eq('business_id', businessId)
    .is('revoked_at', null)
    .single();

  if (existing) {
    // Revoke existing key
    await (supabase
      .from('bot_api_keys') as any)
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', existing.id);
  }

  // Insert new key
  const { error } = await (supabase
    .from('bot_api_keys') as any)
    .insert({
      business_id: businessId,
      api_key_hash: apiKeyHash,
    });

  if (error) throw error;

  return apiKey;
}

/**
 * Revoke API key for a business
 */
export async function revokeApiKey(businessId: string): Promise<void> {
  const { error } = await (supabase
    .from('bot_api_keys') as any)
    .update({ revoked_at: new Date().toISOString() })
    .eq('business_id', businessId)
    .is('revoked_at', null);

  if (error) throw error;
}

/**
 * Check if business has an active API key
 */
export async function hasActiveApiKey(businessId: string): Promise<boolean> {
  const { data, error } = await (supabase
    .from('bot_api_keys') as any)
    .select('id')
    .eq('business_id', businessId)
    .is('revoked_at', null)
    .single();

  if (error && error.code !== 'PGRST116') throw error;

  return !!data;
}

/**
 * Get API key info (masked)
 */
export async function getApiKeyInfo(businessId: string): Promise<{
  exists: boolean;
  created_at?: string;
  last_used_at?: string | null;
} | null> {
  const { data, error } = await (supabase
    .from('bot_api_keys') as any)
    .select('created_at, last_used_at')
    .eq('business_id', businessId)
    .is('revoked_at', null)
    .single();

  if (error && error.code !== 'PGRST116') throw error;

  if (!data) return null;

  return {
    exists: true,
    created_at: data.created_at,
    last_used_at: data.last_used_at,
  };
}


// =============================================
// Bot Configuration
// =============================================

/**
 * Get full bot configuration by API key
 * This is the main endpoint for Bot Engine
 */
export async function getBotConfig(apiKey: string): Promise<BotConfig | null> {
  // Validate API key and get business_id
  const businessId = await validateApiKey(apiKey);
  if (!businessId) return null;

  // Get business profile
  const { data: businessData, error: businessError } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('id', businessId)
    .single();

  if (businessError || !businessData) return null;

  // Cast to any to access properties
  const business = businessData as any;

  // Get all data in parallel
  const [prompt, integrations, menuItems] = await Promise.all([
    getActivePrompt(businessId),
    getBusinessIntegrations(businessId),
    getMenuItems(businessId),
  ]);

  // Build channel configs
  const channels: ChannelConfig[] = integrations
    .filter(i => i.type === 'channel' && i.status === 'active')
    .map(i => ({
      provider: i.provider as ChannelConfig['provider'],
      credentials: i.config ? decryptConfig(i.config as unknown as string) : {},
      enabled: true,
    }));

  // Build CRM config
  const crmIntegration = integrations.find(i => i.type === 'crm' && i.status === 'active');
  const crm: CRMConfig | null = crmIntegration
    ? {
        provider: crmIntegration.provider as CRMConfig['provider'],
        credentials: crmIntegration.config ? decryptConfig(crmIntegration.config as unknown as string) : {},
        sync_contacts: true,
        sync_orders: true,
        last_sync_at: crmIntegration.last_sync_at || undefined,
      }
    : null;

  // Build catalog from menu items
  const catalog: CatalogItem[] = menuItems.map((item: any) => ({
    id: item.id,
    business_id: item.business_id,
    name: item.name,
    description: item.description,
    price: item.price,
    currency: item.currency,
    category: item.category,
    image_url: item.image_url,
    available: item.available,
    attributes: {},
    sort_order: item.sort_order,
  }));

  // Build settings
  const settings: BotSettings = {
    language: 'ru',
    timezone: 'Europe/Moscow',
    working_hours: parseWorkingHours(business.working_hours),
    auto_reply_outside_hours: false,
  };

  // Prepare prompt with variables
  const promptContent = prompt?.content || '';
  const promptWithVariables = substituteVariables(promptContent, {
    business_name: business.name,
    business_type: business.type || '',
    address: business.address || '',
    contact_phone: business.contact_phone || '',
    working_hours: formatWorkingHours(settings.working_hours),
    catalog_summary: formatCatalogSummary(catalog),
  });

  // Update last_used_at
  await updateApiKeyLastUsed(businessId);

  return {
    business_id: businessId,
    business_name: business.name,
    business_type: (business.type || 'other') as BotConfig['business_type'],
    prompt: promptWithVariables,
    channels,
    crm,
    catalog,
    settings,
  };
}

/**
 * Get bot config for a business (internal use, no API key validation)
 */
export async function getBotConfigForBusiness(businessId: string): Promise<BotConfig | null> {
  const { data: businessData, error: businessError } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('id', businessId)
    .single();

  if (businessError || !businessData) return null;

  // Cast to any to access properties
  const business = businessData as any;

  const [prompt, integrations, menuItems] = await Promise.all([
    getActivePrompt(businessId),
    getBusinessIntegrations(businessId),
    getMenuItems(businessId),
  ]);

  const channels: ChannelConfig[] = integrations
    .filter(i => i.type === 'channel' && i.status === 'active')
    .map(i => ({
      provider: i.provider as ChannelConfig['provider'],
      credentials: {},
      enabled: true,
    }));

  const crmIntegration = integrations.find(i => i.type === 'crm' && i.status === 'active');
  const crm: CRMConfig | null = crmIntegration
    ? {
        provider: crmIntegration.provider as CRMConfig['provider'],
        credentials: {},
        sync_contacts: true,
        sync_orders: true,
      }
    : null;

  const catalog: CatalogItem[] = menuItems.map((item: any) => ({
    id: item.id,
    business_id: item.business_id,
    name: item.name,
    description: item.description,
    price: item.price,
    currency: item.currency,
    category: item.category,
    image_url: item.image_url,
    available: item.available,
    attributes: {},
    sort_order: item.sort_order,
  }));

  const settings: BotSettings = {
    language: 'ru',
    timezone: 'Europe/Moscow',
    working_hours: parseWorkingHours(business.working_hours),
    auto_reply_outside_hours: false,
  };

  return {
    business_id: businessId,
    business_name: business.name,
    business_type: (business.type || 'other') as BotConfig['business_type'],
    prompt: prompt?.content || '',
    channels,
    crm,
    catalog,
    settings,
  };
}

// =============================================
// Helper Functions
// =============================================

function generateRandomApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const prefix = 'iop_';
  let key = prefix;
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

async function hashApiKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function validateApiKey(apiKey: string): Promise<string | null> {
  const apiKeyHash = await hashApiKey(apiKey);

  const { data, error } = await (supabase
    .from('bot_api_keys') as any)
    .select('business_id')
    .eq('api_key_hash', apiKeyHash)
    .is('revoked_at', null)
    .single();

  if (error || !data) return null;

  return data.business_id;
}

async function updateApiKeyLastUsed(businessId: string): Promise<void> {
  await (supabase
    .from('bot_api_keys') as any)
    .update({ last_used_at: new Date().toISOString() })
    .eq('business_id', businessId)
    .is('revoked_at', null);
}

async function getMenuItems(businessId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('business_id', businessId)
    .eq('available', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

function parseWorkingHours(hours: unknown): BotSettings['working_hours'] {
  if (!Array.isArray(hours)) return [];
  return hours as BotSettings['working_hours'];
}

function formatWorkingHours(hours: BotSettings['working_hours']): string {
  if (!hours || hours.length === 0) return 'Не указано';
  
  return hours
    .filter(h => !h.is_closed)
    .map(h => `${h.day}: ${h.open}-${h.close}`)
    .join(', ');
}

function formatCatalogSummary(catalog: CatalogItem[]): string {
  if (catalog.length === 0) return 'Каталог пуст';

  const categories = [...new Set(catalog.map(i => i.category).filter(Boolean))];
  
  if (categories.length === 0) {
    return catalog.map(i => `- ${i.name}: ${i.price} ${i.currency}`).join('\n');
  }

  return categories
    .map(cat => {
      const items = catalog.filter(i => i.category === cat);
      return `${cat}:\n${items.map(i => `  - ${i.name}: ${i.price} ${i.currency}`).join('\n')}`;
    })
    .join('\n\n');
}
