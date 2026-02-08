/**
 * Supabase Edge Function: Sync API for Bot Events
 * 
 * Endpoint: POST /sync
 * Authorization: Bearer <api_key> (same as Config API)
 * 
 * Receives lightweight events from the bot and writes structured data
 * to Supabase (customers, orders, events). Conversation messages are
 * NOT synced — they live in Telegram forum topics.
 * 
 * Event types:
 * - customer.seen      → Upsert customer record
 * - order.created      → Insert order, update customer stats
 * - order.status       → Update order status
 * - escalation.created → Insert escalation event
 * - escalation.resolved → Insert resolution event
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
        // Only allow POST requests
        if (req.method !== 'POST') {
            return new Response(
                JSON.stringify({ error: 'Method not allowed' }),
                { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Authenticate via API key (same pattern as Config API)
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(
                JSON.stringify({ error: 'Missing or invalid Authorization header' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const apiKey = authHeader.replace('Bearer ', '');

        if (!apiKey.startsWith('iop_') || apiKey.length < 36) {
            return new Response(
                JSON.stringify({ error: 'Invalid API key format' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Create Supabase client with service role
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Hash and validate API key
        const apiKeyHash = await hashApiKey(apiKey);
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

        // Parse request body
        const body = await req.json();
        const { event, data } = body;

        if (!event || !data) {
            return new Response(
                JSON.stringify({ error: 'Missing event or data field' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Route to handler
        let result;
        switch (event) {
            case 'customer.seen':
                result = await handleCustomerSeen(supabase, businessId, data);
                break;
            case 'order.created':
                result = await handleOrderCreated(supabase, businessId, data);
                break;
            case 'order.status':
                result = await handleOrderStatus(supabase, businessId, data);
                break;
            case 'escalation.created':
                result = await handleEscalation(supabase, businessId, data, 'escalation');
                break;
            case 'escalation.resolved':
                result = await handleEscalation(supabase, businessId, data, 'resolved');
                break;
            default:
                return new Response(
                    JSON.stringify({ error: `Unknown event type: ${event}` }),
                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
        }

        return new Response(
            JSON.stringify({ success: true, ...result }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Sync API error:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});


// ============================================================================
// Event Handlers
// ============================================================================

/**
 * Handle customer.seen event — upsert customer record
 * 
 * Expected data:
 * {
 *   display_name: string,
 *   phone?: string,
 *   primary_channel: 'telegram' | 'whatsapp' | 'instagram' | 'teletype',
 *   telegram_chat_id?: string,
 *   whatsapp_phone?: string,
 *   telegram_topic_id?: number,
 *   telegram_group_id?: string,
 *   syrve_customer_id?: string,
 *   preferred_language?: string,
 *   trust_level?: string
 * }
 */
// deno-lint-ignore no-explicit-any
async function handleCustomerSeen(supabase: any, businessId: string, data: any) {
    // Build upsert payload
    const customerData: Record<string, unknown> = {
        business_id: businessId,
        display_name: data.display_name || 'Unknown',
        primary_channel: data.primary_channel,
        last_seen_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    // Optional fields
    if (data.phone) customerData.phone = data.phone;
    if (data.email) customerData.email = data.email;
    if (data.syrve_customer_id) customerData.syrve_customer_id = data.syrve_customer_id;
    if (data.telegram_chat_id) customerData.telegram_chat_id = data.telegram_chat_id;
    if (data.whatsapp_phone) customerData.whatsapp_phone = data.whatsapp_phone;
    if (data.telegram_topic_id) customerData.telegram_topic_id = data.telegram_topic_id;
    if (data.telegram_group_id) customerData.telegram_group_id = data.telegram_group_id;
    if (data.preferred_language) customerData.preferred_language = data.preferred_language;
    if (data.trust_level) customerData.trust_level = data.trust_level;

    // Determine unique constraint column for upsert
    let onConflict = '';
    if (data.telegram_chat_id) {
        onConflict = 'business_id,telegram_chat_id';
    } else if (data.whatsapp_phone) {
        onConflict = 'business_id,whatsapp_phone';
    }

    if (onConflict) {
        const { data: customer, error } = await supabase
            .from('customers')
            .upsert(customerData, { onConflict, ignoreDuplicates: false })
            .select('id')
            .single();

        if (error) {
            console.error('Customer upsert error:', error);
            throw error;
        }

        return { customer_id: customer?.id };
    } else {
        // No unique key available — just insert
        const { data: customer, error } = await supabase
            .from('customers')
            .insert(customerData)
            .select('id')
            .single();

        if (error) {
            console.error('Customer insert error:', error);
            throw error;
        }

        return { customer_id: customer?.id };
    }
}

/**
 * Handle order.created event — insert order and update customer stats
 * 
 * Expected data:
 * {
 *   customer_identifier: { telegram_chat_id?: string, whatsapp_phone?: string },
 *   syrve_order_id?: string,
 *   external_number?: string,
 *   items: Array<{ name: string, amount: number, price: number }>,
 *   total: number,
 *   delivery_address?: string,
 *   payment_method: 'cash' | 'card',
 *   restaurant?: string,
 *   channel: string
 * }
 */
// deno-lint-ignore no-explicit-any
async function handleOrderCreated(supabase: any, businessId: string, data: any) {
    // Find the customer
    const customer = await findCustomer(supabase, businessId, data.customer_identifier);
    if (!customer) {
        console.error('Customer not found for order', data.customer_identifier);
        return { error: 'Customer not found' };
    }

    // Insert order
    const { data: order, error: orderError } = await supabase
        .from('customer_orders')
        .insert({
            customer_id: customer.id,
            business_id: businessId,
            syrve_order_id: data.syrve_order_id,
            external_number: data.external_number,
            items: data.items || [],
            total: data.total || 0,
            delivery_address: data.delivery_address,
            payment_method: data.payment_method,
            restaurant: data.restaurant,
            channel: data.channel,
            status: 'created',
        })
        .select('id')
        .single();

    if (orderError) {
        console.error('Order insert error:', orderError);
        throw orderError;
    }

    // Update customer stats
    const { error: updateError } = await supabase
        .from('customers')
        .update({
            total_orders: (customer.total_orders || 0) + 1,
            total_spent: parseFloat(String(customer.total_spent || 0)) + parseFloat(String(data.total || 0)),
            last_order_at: new Date().toISOString(),
            last_seen_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq('id', customer.id);

    if (updateError) {
        console.error('Customer stats update error:', updateError);
    }

    return { order_id: order?.id };
}

/**
 * Handle order.status event — update order status
 * 
 * Expected data:
 * {
 *   syrve_order_id: string,
 *   status: 'confirmed' | 'cooking' | 'delivering' | 'delivered' | 'cancelled'
 * }
 */
// deno-lint-ignore no-explicit-any
async function handleOrderStatus(supabase: any, businessId: string, data: any) {
    const { error } = await supabase
        .from('customer_orders')
        .update({
            status: data.status,
            updated_at: new Date().toISOString(),
        })
        .eq('business_id', businessId)
        .eq('syrve_order_id', data.syrve_order_id);

    if (error) {
        console.error('Order status update error:', error);
        throw error;
    }

    return { updated: true };
}

/**
 * Handle escalation events — insert event record
 * 
 * Expected data:
 * {
 *   customer_identifier: { telegram_chat_id?: string, whatsapp_phone?: string },
 *   reason?: string,
 *   operator_name?: string,
 *   resolution_summary?: string,
 *   metadata?: object
 * }
 */
// deno-lint-ignore no-explicit-any
async function handleEscalation(supabase: any, businessId: string, data: any, eventType: string) {
    const customer = await findCustomer(supabase, businessId, data.customer_identifier);
    if (!customer) {
        console.error('Customer not found for escalation event', data.customer_identifier);
        return { error: 'Customer not found' };
    }

    const description = eventType === 'escalation'
        ? data.reason || 'Escalated to operator'
        : data.resolution_summary || 'Resolved by operator';

    const { data: event, error } = await supabase
        .from('customer_events')
        .insert({
            customer_id: customer.id,
            business_id: businessId,
            event_type: eventType,
            description,
            metadata: data.metadata || {},
        })
        .select('id')
        .single();

    if (error) {
        console.error('Event insert error:', error);
        throw error;
    }

    return { event_id: event?.id };
}


// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Find customer by telegram_chat_id or whatsapp_phone
 */
// deno-lint-ignore no-explicit-any
async function findCustomer(supabase: any, businessId: string, identifier: any) {
    if (!identifier) return null;

    let query = supabase
        .from('customers')
        .select('id, total_orders, total_spent')
        .eq('business_id', businessId);

    if (identifier.telegram_chat_id) {
        query = query.eq('telegram_chat_id', identifier.telegram_chat_id);
    } else if (identifier.whatsapp_phone) {
        query = query.eq('whatsapp_phone', identifier.whatsapp_phone);
    } else {
        return null;
    }

    const { data, error } = await query.single();
    if (error || !data) return null;
    return data;
}

/**
 * Hash API key with SHA-256 (same as Config API)
 */
async function hashApiKey(apiKey: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
