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

    // Fetch all data in parallel
    const [
      { data: business, error: businessError },
      { data: prompt },
      { data: integrations },
      { data: menuItems },
      { data: locations },
      { data: promotions },
      { data: restrictions },
      { data: botSettings },
    ] = await Promise.all([
      // Business profile
      supabase
        .from('business_profiles')
        .select('*')
        .eq('id', businessId)
        .single(),

      // Active prompt
      supabase
        .from('prompt_templates')
        .select('content, version, updated_at')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .single(),

      // Active integrations
      supabase
        .from('integrations')
        .select('*')
        .eq('business_id', businessId)
        .eq('status', 'active'),

      // Catalog items
      supabase
        .from('menu_items')
        .select('*')
        .eq('business_id', businessId)
        .eq('available', true)
        .order('sort_order', { ascending: true }),

      // Locations with service areas
      supabase
        .from('locations')
        .select('*, service_areas(*)')
        .eq('business_id', businessId)
        .order('sort_order', { ascending: true }),

      // Enabled promotions
      supabase
        .from('promotions')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_enabled', true)
        .order('sort_order', { ascending: true }),

      // Active restrictions
      supabase
        .from('service_area_restrictions')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true),

      // All bot settings
      supabase
        .from('bot_settings')
        .select('category, key, value')
        .eq('business_id', businessId),
    ]);

    if (businessError || !business) {
      return new Response(
        JSON.stringify({ error: 'Business not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build channels config
    const channelIntegrations = (integrations || []).filter((i: any) => i.type === 'channel');
    const channelsMap: Record<string, { enabled: boolean; settings?: Record<string, unknown> }> = {};
    for (const ch of channelIntegrations) {
      channelsMap[ch.provider] = { enabled: true };
    }

    // Build CRM config
    const crmIntegration = (integrations || []).find((i: any) => i.type === 'crm');
    const crm = crmIntegration
      ? { provider: crmIntegration.provider, settings: {} }
      : undefined;

    // Build catalog for variable substitution
    const catalog = (menuItems || []).map((item: any) => ({
      name: item.name,
      price: item.price,
      currency: item.currency,
      category: item.category,
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

    // Build locations array with nested service areas
    const locationsData = (locations || []).map((loc: any) => ({
      id: loc.id,
      name: loc.name,
      address: loc.address,
      lat: loc.lat,
      lng: loc.lng,
      isActive: loc.is_active,
      credentials: loc.credentials,
      settings: loc.settings,
      serviceArea: loc.service_areas?.[0]
        ? {
          hexes: loc.service_areas[0].hexes,
          resolution: loc.service_areas[0].resolution,
          geojson: loc.service_areas[0].geojson,
        }
        : undefined,
    }));

    // Build promotions array
    const promotionsData = (promotions || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      params: p.params,
      productPatterns: p.product_patterns,
    }));

    // Build restrictions array
    const restrictionsData = (restrictions || []).map((r: any) => ({
      id: r.id,
      type: r.type,
      affectedLocationId: r.affected_location_id,
      reason: r.reason,
      excludedAreas: r.excluded_areas,
      startDate: r.start_date,
      endDate: r.end_date,
      customerMessage: r.customer_message,
      alternatives: r.alternatives,
    }));

    // Build bot settings map (category.key → value)
    const settingsMap: Record<string, Record<string, unknown>> = {};
    for (const s of botSettings || []) {
      const setting = s as any;
      if (!settingsMap[setting.category]) {
        settingsMap[setting.category] = {};
      }
      settingsMap[setting.category][setting.key] = setting.value;
    }

    // Update last_used_at
    await supabase
      .from('bot_api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('business_id', businessId)
      .is('revoked_at', null);

    // Build response matching RemoteConfig type expected by bot engine
    const responseBody = {
      systemPrompt: processedPrompt,
      promptVersion: prompt?.version ?? 1,
      promptUpdatedAt: prompt?.updated_at ?? new Date().toISOString(),
      businessProfile: {
        name: business.name,
        workingHours: business.working_hours || [],
        settings: {
          type: business.type || 'other',
          timezone: business.timezone || 'Europe/Istanbul',
        },
      },
      channels: Object.keys(channelsMap).length > 0 ? channelsMap : undefined,
      crm,
      // New fields from Phase B/C/D
      locations: locationsData.length > 0 ? locationsData : undefined,
      promotions: promotionsData.length > 0 ? promotionsData : undefined,
      restrictions: restrictionsData.length > 0 ? restrictionsData : undefined,
      botSettings: Object.keys(settingsMap).length > 0 ? settingsMap : undefined,
    };

    return new Response(
      JSON.stringify(responseBody),
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
  if (!Array.isArray(hours) || hours.length === 0) return 'Not specified';
  return hours
    .filter((h: { is_closed?: boolean }) => !h.is_closed)
    .map((h: { day?: string; open?: string; close?: string }) => `${h.day}: ${h.open}-${h.close}`)
    .join(', ');
}

function formatCatalogSummary(catalog: Array<{ name: string; price: number; currency: string; category?: string | null }>): string {
  if (catalog.length === 0) return 'Catalog is empty';
  return catalog.map(i => `- ${i.name}: ${i.price} ${i.currency}`).join('\n');
}
