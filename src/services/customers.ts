import { supabase } from '../lib/supabase';

// ============================================================================
// Types
// ============================================================================

export interface Customer {
    id: string;
    business_id: string;
    display_name: string;
    phone: string | null;
    email: string | null;
    syrve_customer_id: string | null;
    primary_channel: 'telegram' | 'whatsapp' | 'instagram' | 'teletype' | null;
    telegram_chat_id: string | null;
    whatsapp_phone: string | null;
    telegram_topic_id: number | null;
    telegram_group_id: string | null;
    total_orders: number;
    total_spent: number;
    last_order_at: string | null;
    trust_level: 'new' | 'verified' | 'suspicious';
    preferred_language: string | null;
    first_seen_at: string;
    last_seen_at: string;
    created_at: string;
    updated_at: string;
}

export interface CustomerOrder {
    id: string;
    customer_id: string;
    business_id: string;
    syrve_order_id: string | null;
    external_number: string | null;
    items: Array<{ name: string; amount: number; price: number }>;
    total: number;
    delivery_address: string | null;
    payment_method: 'cash' | 'card' | null;
    restaurant: string | null;
    status: 'created' | 'confirmed' | 'cooking' | 'delivering' | 'delivered' | 'cancelled';
    channel: string | null;
    ordered_at: string;
    updated_at: string;
}

export interface CustomerEvent {
    id: string;
    customer_id: string;
    business_id: string;
    event_type: 'first_contact' | 'escalation' | 'resolved' | 'order_issue' | 'channel_linked';
    description: string | null;
    metadata: Record<string, unknown>;
    created_at: string;
}

export interface CustomersFilter {
    search?: string;
    channel?: string;
    trustLevel?: string;
    sortBy?: 'last_seen_at' | 'total_orders' | 'total_spent' | 'display_name';
    sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Get all customers for a business with optional filtering
 */
export async function getCustomers(
    businessId: string,
    filter?: CustomersFilter
): Promise<Customer[]> {
    let query = supabase
        .from('customers')
        .select('*')
        .eq('business_id', businessId);

    // Search by name or phone
    if (filter?.search) {
        query = query.or(
            `display_name.ilike.%${filter.search}%,phone.ilike.%${filter.search}%`
        );
    }

    // Filter by channel
    if (filter?.channel) {
        query = query.eq('primary_channel', filter.channel);
    }

    // Filter by trust level
    if (filter?.trustLevel) {
        query = query.eq('trust_level', filter.trustLevel);
    }

    // Sorting
    const sortBy = filter?.sortBy || 'last_seen_at';
    const sortOrder = filter?.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as Customer[];
}

/**
 * Get a single customer by ID
 */
export async function getCustomerById(customerId: string): Promise<Customer | null> {
    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as Customer | null;
}

/**
 * Get orders for a customer
 */
export async function getCustomerOrders(customerId: string): Promise<CustomerOrder[]> {
    const { data, error } = await supabase
        .from('customer_orders')
        .select('*')
        .eq('customer_id', customerId)
        .order('ordered_at', { ascending: false });

    if (error) throw error;
    return (data || []) as CustomerOrder[];
}

/**
 * Get events for a customer
 */
export async function getCustomerEvents(customerId: string): Promise<CustomerEvent[]> {
    const { data, error } = await supabase
        .from('customer_events')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as CustomerEvent[];
}

/**
 * Get customer stats for a business (for overview cards)
 */
export async function getCustomerStats(businessId: string): Promise<{
    totalCustomers: number;
    activeToday: number;
    totalOrders: number;
    totalRevenue: number;
}> {
    const { data: allCustomers, error } = await supabase
        .from('customers')
        .select('id, last_seen_at, total_orders, total_spent')
        .eq('business_id', businessId);

    if (error) throw error;

    const customers = allCustomers || [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeToday = customers.filter(c => {
        const lastSeen = new Date(c.last_seen_at);
        return lastSeen >= today;
    }).length;

    const totalOrders = customers.reduce((sum, c) => sum + (c.total_orders || 0), 0);
    const totalRevenue = customers.reduce((sum, c) => sum + parseFloat(String(c.total_spent || 0)), 0);

    return {
        totalCustomers: customers.length,
        activeToday,
        totalOrders,
        totalRevenue,
    };
}

/**
 * Build a Telegram deep link for a customer's conversation topic
 */
export function buildTelegramTopicLink(
    telegramGroupId: string | null,
    telegramTopicId: number | null
): string | null {
    if (!telegramGroupId || !telegramTopicId) return null;

    // Remove the -100 prefix that Telegram adds to supergroup IDs
    let groupId = telegramGroupId;
    if (groupId.startsWith('-100')) {
        groupId = groupId.slice(4);
    } else if (groupId.startsWith('-')) {
        groupId = groupId.slice(1);
    }

    return `https://t.me/c/${groupId}/${telegramTopicId}`;
}
