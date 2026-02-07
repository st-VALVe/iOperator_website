/**
 * Service Area Restrictions Service
 *
 * CRUD operations for the service_area_restrictions table.
 */

import { supabase } from '../lib/supabase';

// =============================================
// Types
// =============================================

export type RestrictionType = 'location_closed' | 'area_excluded' | 'capacity_limited' | 'custom';

export interface Restriction {
    id: string;
    business_id: string;
    type: RestrictionType;
    affected_location_id: string | null;
    reason: string | null;
    excluded_areas: Record<string, any> | null;
    start_date: string | null;
    end_date: string | null;
    customer_message: string | null;
    alternatives: any[] | null;
    is_active: boolean | null;
    created_at: string;
    updated_at: string;
}

export interface CreateRestrictionInput {
    business_id: string;
    type: RestrictionType;
    reason?: string;
    affected_location_id?: string;
    start_date?: string;
    end_date?: string;
    customer_message?: string;
}

// =============================================
// CRUD
// =============================================

/**
 * Get all restrictions for a business
 */
export async function getRestrictions(businessId: string): Promise<Restriction[]> {
    const { data, error } = await supabase
        .from('service_area_restrictions')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as unknown as Restriction[];
}

/**
 * Create a new restriction
 */
export async function createRestriction(input: CreateRestrictionInput): Promise<Restriction> {
    const { data, error } = await supabase
        .from('service_area_restrictions')
        .insert(input as never)
        .select()
        .single();

    if (error) throw error;
    return data as unknown as Restriction;
}

/**
 * Update a restriction
 */
export async function updateRestriction(
    restrictionId: string,
    updates: Partial<Pick<Restriction, 'type' | 'reason' | 'affected_location_id' | 'excluded_areas' | 'start_date' | 'end_date' | 'customer_message' | 'alternatives' | 'is_active'>>
): Promise<Restriction> {
    const { data, error } = await supabase
        .from('service_area_restrictions')
        .update({ ...updates, updated_at: new Date().toISOString() } as never)
        .eq('id', restrictionId)
        .select()
        .single();

    if (error) throw error;
    return data as unknown as Restriction;
}

/**
 * Delete a restriction
 */
export async function deleteRestriction(restrictionId: string): Promise<void> {
    const { error } = await supabase
        .from('service_area_restrictions')
        .delete()
        .eq('id', restrictionId);

    if (error) throw error;
}

/**
 * Toggle restriction active state
 */
export async function toggleRestriction(
    restrictionId: string,
    isActive: boolean
): Promise<Restriction> {
    return updateRestriction(restrictionId, { is_active: isActive });
}
