import { supabase } from './supabase';

export const BUCKETS = {
  MENU_IMAGES: 'menu-images',
  BUSINESS_ASSETS: 'business-assets',
} as const;

type BucketName = typeof BUCKETS[keyof typeof BUCKETS];

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  bucket: BucketName,
  userId: string,
  file: File,
  fileName?: string
): Promise<{ url: string; path: string }> {
  const fileExt = file.name.split('.').pop();
  const finalFileName = fileName || `${Date.now()}.${fileExt}`;
  const filePath = `${userId}/${finalFileName}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return { url: publicUrl, path: filePath };
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(
  bucket: BucketName,
  filePath: string
): Promise<void> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);

  if (error) throw error;
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(bucket: BucketName, filePath: string): string {
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrl;
}

/**
 * List files in a user's folder
 */
export async function listUserFiles(
  bucket: BucketName,
  userId: string
): Promise<{ name: string; url: string }[]> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(userId);

  if (error) throw error;

  return (data || []).map((file) => ({
    name: file.name,
    url: getPublicUrl(bucket, `${userId}/${file.name}`),
  }));
}
