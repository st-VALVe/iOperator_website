/**
 * Bot Settings Service
 * 
 * CRUD operations for the bot_settings table.
 * Settings are stored as categorized key-value pairs per business.
 */

import { supabase } from '../lib/supabase';

// =============================================
// Types
// =============================================

export interface BotSetting {
    id: string;
    business_id: string;
    category: string;
    key: string;
    value: unknown;
    created_at: string;
    updated_at: string;
}

export interface SettingDefinition {
    key: string;
    label: string;
    description: string;
    type: 'text' | 'number' | 'boolean' | 'select';
    defaultValue: unknown;
    options?: { label: string; value: string }[];
    min?: number;
    max?: number;
    unit?: string;
}

export interface SettingCategory {
    id: string;
    label: string;
    icon: string;
    description: string;
    settings: SettingDefinition[];
}

// =============================================
// Setting Definitions (schema for the UI)
// =============================================

export const SETTING_CATEGORIES: SettingCategory[] = [
    {
        id: 'ai_models',
        label: 'AI Models',
        icon: '🤖',
        description: 'Language model selection and token limits',
        settings: [
            {
                key: 'default_model',
                label: 'Default Model',
                description: 'Primary model for regular conversations',
                type: 'select',
                defaultValue: 'gpt-4o-mini',
                options: [
                    { label: 'GPT-4o Mini', value: 'gpt-4o-mini' },
                    { label: 'GPT-4o', value: 'gpt-4o' },
                    { label: 'GPT-5.2', value: 'gpt-5.2' },
                ],
            },
            {
                key: 'smart_model',
                label: 'Smart Model',
                description: 'Model for complex reasoning tasks',
                type: 'select',
                defaultValue: 'gpt-4o',
                options: [
                    { label: 'GPT-4o', value: 'gpt-4o' },
                    { label: 'GPT-5.2', value: 'gpt-5.2' },
                ],
            },
            {
                key: 'fallback_max_tokens',
                label: 'Fallback Max Tokens',
                description: 'Token limit for fallback provider',
                type: 'number',
                defaultValue: 10000,
                min: 1000,
                max: 128000,
                unit: 'tokens',
            },
        ],
    },
    {
        id: 'agent',
        label: 'Agent Behavior',
        icon: '⚙️',
        description: 'Agent loop and iteration limits',
        settings: [
            {
                key: 'max_iterations',
                label: 'Max Iterations',
                description: 'Maximum tool-calling iterations per message',
                type: 'number',
                defaultValue: 5,
                min: 1,
                max: 20,
            },
        ],
    },
    {
        id: 'verification',
        label: 'Phone Verification',
        icon: '📱',
        description: 'SMS verification settings for customer identity',
        settings: [
            {
                key: 'enabled',
                label: 'Verification Enabled',
                description: 'Require phone verification before orders',
                type: 'boolean',
                defaultValue: false,
            },
            {
                key: 'provider',
                label: 'SMS Provider',
                description: 'Service used to send verification codes',
                type: 'select',
                defaultValue: 'mock',
                options: [
                    { label: 'Mock (Testing)', value: 'mock' },
                    { label: 'Twilio', value: 'twilio' },
                ],
            },
            {
                key: 'code_length',
                label: 'Code Length',
                description: 'Number of digits in verification code',
                type: 'number',
                defaultValue: 4,
                min: 4,
                max: 8,
            },
            {
                key: 'max_attempts',
                label: 'Max Attempts',
                description: 'Maximum verification attempts before lockout',
                type: 'number',
                defaultValue: 3,
                min: 1,
                max: 10,
            },
        ],
    },
    {
        id: 'rate_limits',
        label: 'Rate Limits',
        icon: '🛡️',
        description: 'Anti-fraud and abuse prevention limits',
        settings: [
            {
                key: 'messages_per_minute',
                label: 'Messages per Minute',
                description: 'Maximum messages a user can send per minute',
                type: 'number',
                defaultValue: 10,
                min: 1,
                max: 60,
                unit: 'msg/min',
            },
            {
                key: 'files_per_hour',
                label: 'Files per Hour',
                description: 'Maximum file uploads per hour',
                type: 'number',
                defaultValue: 20,
                min: 1,
                max: 100,
                unit: 'files/hr',
            },
            {
                key: 'max_text_length',
                label: 'Max Text Length',
                description: 'Maximum characters per message',
                type: 'number',
                defaultValue: 4000,
                min: 100,
                max: 32000,
                unit: 'chars',
            },
        ],
    },
    {
        id: 'session',
        label: 'Session',
        icon: '💬',
        description: 'Conversation session parameters',
        settings: [
            {
                key: 'max_messages',
                label: 'Context Window',
                description: 'Messages kept in agent context',
                type: 'number',
                defaultValue: 25,
                min: 5,
                max: 100,
            },
            {
                key: 'ttl_hours',
                label: 'Session TTL',
                description: 'Time before session expires',
                type: 'number',
                defaultValue: 168,
                min: 1,
                max: 720,
                unit: 'hours',
            },
        ],
    },
    {
        id: 'cache',
        label: 'Cache',
        icon: '📦',
        description: 'Cache time-to-live for various data',
        settings: [
            {
                key: 'catalog_ttl_hours',
                label: 'Catalog Cache TTL',
                description: 'How long catalog data is cached',
                type: 'number',
                defaultValue: 6,
                min: 1,
                max: 72,
                unit: 'hours',
            },
            {
                key: 'address_ttl_hours',
                label: 'Address Cache TTL',
                description: 'How long address lookups are cached',
                type: 'number',
                defaultValue: 24,
                min: 1,
                max: 168,
                unit: 'hours',
            },
            {
                key: 'pending_request_ttl_minutes',
                label: 'Pending Request TTL',
                description: 'How long a pending request stays active',
                type: 'number',
                defaultValue: 30,
                min: 5,
                max: 120,
                unit: 'min',
            },
        ],
    },
    {
        id: 'monitoring',
        label: 'Monitoring',
        icon: '📊',
        description: 'Usage tracking and alerting',
        settings: [
            {
                key: 'daily_token_limit',
                label: 'Daily Token Limit',
                description: 'Maximum tokens per day across all conversations',
                type: 'number',
                defaultValue: 500000,
                min: 10000,
                max: 10000000,
                unit: 'tokens',
            },
            {
                key: 'alert_threshold_percent',
                label: 'Alert Threshold',
                description: 'Send alert when usage exceeds this percentage',
                type: 'number',
                defaultValue: 80,
                min: 50,
                max: 100,
                unit: '%',
            },
        ],
    },
    {
        id: 'webhooks',
        label: 'Webhooks',
        icon: '🔗',
        description: 'External webhook configuration',
        settings: [
            {
                key: 'enabled',
                label: 'Webhooks Enabled',
                description: 'Enable incoming webhook processing',
                type: 'boolean',
                defaultValue: false,
            },
            {
                key: 'auth_token',
                label: 'Auth Token',
                description: 'Token for authenticating webhook requests',
                type: 'text',
                defaultValue: '',
            },
        ],
    },
    {
        id: 'requests',
        label: 'Order / Request',
        icon: '📋',
        description: 'Request processing settings',
        settings: [
            {
                key: 'dry_run',
                label: 'Dry Run Mode',
                description: 'Process requests without submitting to CRM (testing)',
                type: 'boolean',
                defaultValue: false,
            },
        ],
    },
];

// =============================================
// CRUD Operations
// =============================================

/**
 * Get all bot settings for a business
 */
export async function getBotSettings(businessId: string): Promise<BotSetting[]> {
    const { data, error } = await supabase
        .from('bot_settings')
        .select('*')
        .eq('business_id', businessId)
        .order('category')
        .order('key');

    if (error) throw error;
    return data || [];
}

/**
 * Get settings by category
 */
export async function getSettingsByCategory(
    businessId: string,
    category: string
): Promise<BotSetting[]> {
    const { data, error } = await supabase
        .from('bot_settings')
        .select('*')
        .eq('business_id', businessId)
        .eq('category', category);

    if (error) throw error;
    return data || [];
}

/**
 * Upsert a single setting (insert or update)
 */
export async function upsertSetting(
    businessId: string,
    category: string,
    key: string,
    value: unknown
): Promise<BotSetting> {
    const { data, error } = await supabase
        .from('bot_settings')
        .upsert(
            {
                business_id: businessId,
                category,
                key,
                value: JSON.parse(JSON.stringify(value)),
            },
            { onConflict: 'business_id,category,key' }
        )
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Upsert multiple settings at once
 */
export async function upsertSettings(
    businessId: string,
    settings: { category: string; key: string; value: unknown }[]
): Promise<BotSetting[]> {
    const rows = settings.map(({ category, key, value }) => ({
        business_id: businessId,
        category,
        key,
        value: JSON.parse(JSON.stringify(value)),
    }));

    const { data, error } = await supabase
        .from('bot_settings')
        .upsert(rows, { onConflict: 'business_id,category,key' })
        .select();

    if (error) throw error;
    return data || [];
}

/**
 * Delete a specific setting
 */
export async function deleteSetting(
    businessId: string,
    category: string,
    key: string
): Promise<void> {
    const { error } = await supabase
        .from('bot_settings')
        .delete()
        .eq('business_id', businessId)
        .eq('category', category)
        .eq('key', key);

    if (error) throw error;
}

/**
 * Reset all settings in a category to defaults
 */
export async function resetCategory(
    businessId: string,
    category: string
): Promise<void> {
    const { error } = await supabase
        .from('bot_settings')
        .delete()
        .eq('business_id', businessId)
        .eq('category', category);

    if (error) throw error;
}

// =============================================
// Helpers
// =============================================

/**
 * Build a settings map from stored settings, filling in defaults
 */
export function buildSettingsMap(
    storedSettings: BotSetting[],
    categories: SettingCategory[] = SETTING_CATEGORIES
): Record<string, Record<string, unknown>> {
    const result: Record<string, Record<string, unknown>> = {};

    // Initialize with defaults
    for (const cat of categories) {
        result[cat.id] = {};
        for (const setting of cat.settings) {
            result[cat.id][setting.key] = setting.defaultValue;
        }
    }

    // Override with stored values
    for (const stored of storedSettings) {
        if (!result[stored.category]) {
            result[stored.category] = {};
        }
        result[stored.category][stored.key] = stored.value;
    }

    return result;
}
