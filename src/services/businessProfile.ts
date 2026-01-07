import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type BusinessProfile = Database['public']['Tables']['business_profiles']['Row'];
type BusinessProfileInsert = Database['public']['Tables']['business_profiles']['Insert'];
type BusinessProfileUpdate = Database['public']['Tables']['business_profiles']['Update'];

export interface WorkingHours {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

const DEFAULT_WORKING_HOURS: WorkingHours[] = [
  { dayOfWeek: 0, openTime: '10:00', closeTime: '22:00', isClosed: true }, // Sunday
  { dayOfWeek: 1, openTime: '09:00', closeTime: '22:00', isClosed: false },
  { dayOfWeek: 2, openTime: '09:00', closeTime: '22:00', isClosed: false },
  { dayOfWeek: 3, openTime: '09:00', closeTime: '22:00', isClosed: false },
  { dayOfWeek: 4, openTime: '09:00', closeTime: '22:00', isClosed: false },
  { dayOfWeek: 5, openTime: '09:00', closeTime: '23:00', isClosed: false },
  { dayOfWeek: 6, openTime: '10:00', closeTime: '23:00', isClosed: false }, // Saturday
];

/**
 * Get business profile for current user
 */
export async function getBusinessProfile(userId: string): Promise<BusinessProfile | null> {
  const { data, error } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data;
}

/**
 * Create a new business profile
 */
export async function createBusinessProfile(
  profile: Omit<BusinessProfileInsert, 'id' | 'created_at' | 'updated_at'>
): Promise<BusinessProfile> {
  const { data, error } = await supabase
    .from('business_profiles')
    .insert({
      ...profile,
      working_hours: profile.working_hours || DEFAULT_WORKING_HOURS,
      completeness: calculateCompleteness(profile),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update business profile
 */
export async function updateBusinessProfile(
  id: string,
  updates: BusinessProfileUpdate
): Promise<BusinessProfile> {
  const completeness = calculateCompleteness(updates);
  
  const { data, error } = await supabase
    .from('business_profiles')
    .update({
      ...updates,
      completeness,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Calculate profile completeness percentage
 */
export function calculateCompleteness(profile: Partial<BusinessProfileInsert | BusinessProfileUpdate>): number {
  const requiredFields = [
    'name',
    'type',
    'description',
    'contact_phone',
    'contact_email',
    'address',
  ];

  const optionalFields = [
    'working_hours',
  ];

  let filled = 0;
  const total = requiredFields.length + optionalFields.length;

  for (const field of requiredFields) {
    const value = profile[field as keyof typeof profile];
    if (value && String(value).trim() !== '') {
      filled++;
    }
  }

  for (const field of optionalFields) {
    const value = profile[field as keyof typeof profile];
    if (value && (Array.isArray(value) ? value.length > 0 : true)) {
      filled++;
    }
  }

  return Math.round((filled / total) * 100);
}

/**
 * Get or create business profile for user
 */
export async function getOrCreateBusinessProfile(
  userId: string,
  defaultName: string = 'My Business'
): Promise<BusinessProfile> {
  let profile = await getBusinessProfile(userId);
  
  if (!profile) {
    profile = await createBusinessProfile({
      user_id: userId,
      name: defaultName,
      working_hours: DEFAULT_WORKING_HOURS,
    });
  }
  
  return profile;
}
