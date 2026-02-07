/**
 * Locations Service
 *
 * CRUD operations for the locations and service_areas tables.
 */

import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Json = Database['public']['Tables']['bot_settings']['Row']['value'];

export interface ServiceAreaRow {
    id: string;
    location_id: string;
    hexes: string[];
    resolution: number;
    geojson: any;
    created_at: string;
    updated_at: string;
}
// =============================================
// Types
// =============================================

export interface Location {
    id: string;
    business_id: string;
    name: string;
    address: string | null;
    lat: number | null;
    lng: number | null;
    is_active: boolean | null;
    credentials: Json | null;
    settings: Json | null;
    sort_order: number | null;
    created_at: string;
    updated_at: string;
    serviceArea?: ServiceAreaRow | null;
}

// =============================================
// Location CRUD
// =============================================

/**
 * Get all locations for a business with optional service areas
 */
export async function getLocations(
    businessId: string,
    includeServiceAreas = false
): Promise<Location[]> {
    const query = supabase
        .from('locations')
        .select(includeServiceAreas ? '*, service_areas(*)' : '*')
        .eq('business_id', businessId)
        .order('sort_order')
        .order('name');

    const { data, error } = await query;
    if (error) throw error;

    if (includeServiceAreas) {
        return (data || []).map((row: any) => ({
            ...row,
            serviceArea: row.service_areas?.[0] || null,
        }));
    }

    return (data || []) as Location[];
}

/**
 * Get a single location by ID
 */
export async function getLocation(locationId: string): Promise<Location | null> {
    const { data, error } = await supabase
        .from('locations')
        .select('*, service_areas(*)')
        .eq('id', locationId)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    const row = data as any;
    return {
        ...row,
        serviceArea: row.service_areas?.[0] || null,
    };
}

/**
 * Create a new location
 */
export async function createLocation(
    input: { business_id: string; name: string; address?: string; lat?: number; lng?: number }
): Promise<Location> {
    const { data, error } = await supabase
        .from('locations')
        .insert(input as any)
        .select()
        .single();

    if (error) throw error;
    return data as unknown as Location;
}

/**
 * Update a location
 */
export async function updateLocation(
    locationId: string,
    updates: Partial<Pick<Location, 'name' | 'address' | 'lat' | 'lng' | 'is_active' | 'sort_order'>>
): Promise<Location> {
    const { data, error } = await supabase
        .from('locations')
        .update({ ...updates, updated_at: new Date().toISOString() } as never)
        .eq('id', locationId)
        .select()
        .single();

    if (error) throw error;
    return data as unknown as Location;
}

/**
 * Delete a location
 */
export async function deleteLocation(locationId: string): Promise<void> {
    const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', locationId);

    if (error) throw error;
}

/**
 * Toggle location active state
 */
export async function toggleLocationActive(
    locationId: string,
    isActive: boolean
): Promise<Location> {
    return updateLocation(locationId, { is_active: isActive });
}

// =============================================
// Service Area CRUD
// =============================================

/**
 * Get or create service area for a location
 */
export async function getServiceArea(locationId: string): Promise<ServiceAreaRow | null> {
    const { data, error } = await supabase
        .from('service_areas')
        .select('*')
        .eq('location_id', locationId)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
}

/**
 * Upsert service area for a location
 */
export async function upsertServiceArea(
    locationId: string,
    hexes: string[],
    resolution: number,
    geojson?: any
): Promise<ServiceAreaRow> {
    const existing = await getServiceArea(locationId);

    if (existing) {
        const { data, error } = await supabase
            .from('service_areas')
            .update({
                hexes,
                resolution,
                geojson: geojson ?? null,
                updated_at: new Date().toISOString(),
            } as any)
            .eq('id', existing.id)
            .select()
            .single();

        if (error) throw error;
        return data as ServiceAreaRow;
    } else {
        const { data, error } = await supabase
            .from('service_areas')
            .insert({
                location_id: locationId,
                hexes,
                resolution,
                geojson: geojson ?? null,
            } as any)
            .select()
            .single();

        if (error) throw error;
        return data as ServiceAreaRow;
    }
}

/**
 * Delete service area
 */
export async function deleteServiceArea(locationId: string): Promise<void> {
    const { error } = await supabase
        .from('service_areas')
        .delete()
        .eq('location_id', locationId);

    if (error) throw error;
}
