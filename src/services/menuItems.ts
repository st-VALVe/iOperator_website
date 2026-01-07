import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type MenuItem = Database['public']['Tables']['menu_items']['Row'];
type MenuItemInsert = Database['public']['Tables']['menu_items']['Insert'];
type MenuItemUpdate = Database['public']['Tables']['menu_items']['Update'];

/**
 * Get all menu items for a business
 */
export async function getMenuItems(businessId: string): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('business_id', businessId)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Create a new menu item
 */
export async function createMenuItem(item: MenuItemInsert): Promise<MenuItem> {
  const { data, error } = await supabase
    .from('menu_items')
    .insert(item)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a menu item
 */
export async function updateMenuItem(id: string, updates: MenuItemUpdate): Promise<MenuItem> {
  const { data, error } = await supabase
    .from('menu_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a menu item
 */
export async function deleteMenuItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Reorder menu items
 */
export async function reorderMenuItems(items: { id: string; sort_order: number }[]): Promise<void> {
  const updates = items.map(item =>
    supabase
      .from('menu_items')
      .update({ sort_order: item.sort_order })
      .eq('id', item.id)
  );

  await Promise.all(updates);
}

/**
 * Get unique categories from menu items
 */
export async function getCategories(businessId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('category')
    .eq('business_id', businessId)
    .not('category', 'is', null);

  if (error) throw error;
  
  const categories = [...new Set(data?.map(item => item.category).filter(Boolean) as string[])];
  return categories.sort();
}
