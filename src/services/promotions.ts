/**
 * Promotions Service
 *
 * CRUD operations for the promotions table.
 */

import { supabase } from '../lib/supabase';

// =============================================
// Types
// =============================================

export type PromotionType = 'day_of_week' | 'time_range' | 'fixed' | 'custom';

export interface Promotion {
    id: string;
    business_id: string;
    name: string;
    type: PromotionType;
    params: Record<string, any>;
    product_patterns: string[];
    is_enabled: boolean | null;
    sort_order: number | null;
    created_at: string;
    updated_at: string;
}

export interface CreatePromotionInput {
    business_id: string;
    name: string;
    type: PromotionType;
    params?: Record<string, any>;
    product_patterns?: string[];
}

// =============================================
// CRUD
// =============================================

/**
 * Get all promotions for a business
 */
export async function getPromotions(businessId: string): Promise<Promotion[]> {
    const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('business_id', businessId)
        .order('sort_order')
        .order('name');

    if (error) throw error;
    return (data || []) as unknown as Promotion[];
}

/**
 * Create a new promotion
 */
export async function createPromotion(input: CreatePromotionInput): Promise<Promotion> {
    const { data, error } = await supabase
        .from('promotions')
        .insert(input as never)
        .select()
        .single();

    if (error) throw error;
    return data as unknown as Promotion;
}

/**
 * Update a promotion
 */
export async function updatePromotion(
    promotionId: string,
    updates: Partial<Pick<Promotion, 'name' | 'type' | 'params' | 'product_patterns' | 'is_enabled' | 'sort_order'>>
): Promise<Promotion> {
    const { data, error } = await supabase
        .from('promotions')
        .update({ ...updates, updated_at: new Date().toISOString() } as never)
        .eq('id', promotionId)
        .select()
        .single();

    if (error) throw error;
    return data as unknown as Promotion;
}

/**
 * Delete a promotion
 */
export async function deletePromotion(promotionId: string): Promise<void> {
    const { error } = await supabase
        .from('promotions')
        .delete()
        .eq('id', promotionId);

    if (error) throw error;
}

/**
 * Toggle promotion enabled state
 */
export async function togglePromotion(
    promotionId: string,
    isEnabled: boolean
): Promise<Promotion> {
    return updatePromotion(promotionId, { is_enabled: isEnabled });
}
