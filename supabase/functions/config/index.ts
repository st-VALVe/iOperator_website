/**
 * Supabase Edge Function: Config API for Bot Engine
 * Requirements: 5.1, 5.2, 5.5
 * 
 * Endpoint: GET /config
 * Authorization: Bearer <api_key>
 * 
 * Returns full bot configuration for the authenticated business
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Only allow GET requests
    if (req.method !== 'GET') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get API key from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = authHeader.replace('Bearer ', '');
    
    // Validate API key format
    if (!apiKey.startsWith('iop_') || apiKey.length < 36) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key format' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Hash API key
    const apiKeyHash = await hashApiKey(apiKey);

    // Validate API key and get business_id
    const { data: keyData, error: keyError } = await supabase
      .from('bot_api_keys')
      .select('business_id')
      .eq('api_key_hash', apiKeyHash)
      .is('revoked_at', null)
      .single();

    if (keyError || !keyData) {
      return new Response(
        JSON.stringify({ error: 'Invalid or revoked API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const businessId = keyData.business_id;

    // Get business profile
    const { data: business, error: businessError } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('id', businessId)
      .single();

    if (businessError || !business) {
      return new Response(
        JSON.stringify({ error: 'Business not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get active prompt
    const { data: prompt } = await supabase
      .from('prompt_templates')
      .select('content')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .single();

    // Get active integrations
    const { data: integrations } = await supabase
      .from('integrations')
      .select('*')
      .eq('business_id', businessId)
      .eq('status', 'active');

    // Get menu items (catalog)
    const { data: menuItems } = await supabase
      .from('menu_items')
      .select('*')
      .eq('business_id', businessId)
      .eq('available', true)
      .order('sort_order', { ascending: true });

    // Build channels config
    const channels = (integrations || [])
      .filter(i => i.type === 'channel')
      .map(i => ({
        provider: i.provider,
        enabled: true,
        // Note: credentials are decrypted on Bot Engine side
        credentials_encrypted: i.config_encrypted,
      }));

    // Build CRM config
    const crmIntegration = (integrations || []).find(i => i.type === 'crm');
    const crm = crmIntegration
      ? {
          provider: crmIntegration.provider,
          credentials_encrypted: crmIntegration.config_encrypted,
          sync_contacts: true,
          sync_orders: true,
        }
      : null;

    // Build catalog
    const catalog = (menuItems || []).map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      currency: item.currency,
      category: item.category,
      image_url: item.image_url,
      available: item.available,
    }));

    // Substitute variables in prompt
    const promptContent = prompt?.content || '';
    const processedPrompt = substituteVariables(promptContent, {
      business_name: business.name,
      business_type: business.type || '',
      address: business.address || '',
      contact_phone: business.contact_phone || '',
      working_hours: formatWorkingHours(business.working_hours),
      catalog_summary: formatCatalogSummary(catalog),
    });

    // Update last_used_at
    await supabase
      .from('bot_api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('business_id', businessId)
      .is('revoked_at', null);

    // Build response
    const config = {
      business_id: businessId,
      business_name: business.name,
      business_type: business.type || 'other',
      prompt: processedPrompt,
      channels,
      crm,
      catalog,
      settings: {
        language: 'ru',
        timezone: 'Europe/Moscow',
        working_hours: business.working_hours || [],
      },
    };

    return new Response(
      JSON.stringify({ success: true, config }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Config API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper functions
async function hashApiKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function substituteVariables(content: string, values: Record<string, string>): string {
  return content.replace(/\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g, (match, varName) => {
    return values[varName] || '';
  });
}

function formatWorkingHours(hours: unknown): string {
  if (!Array.isArray(hours) || hours.length === 0) return 'Не указано';
  return hours
    .filter((h: { is_closed?: boolean }) => !h.is_closed)
    .map((h: { day?: string; open?: string; close?: string }) => `${h.day}: ${h.open}-${h.close}`)
    .join(', ');
}

function formatCatalogSummary(catalog: Array<{ name: string; price: number; currency: string; category?: string | null }>): string {
  if (catalog.length === 0) return 'Каталог пуст';
  return catalog.map(i => `- ${i.name}: ${i.price} ${i.currency}`).join('\n');
}
