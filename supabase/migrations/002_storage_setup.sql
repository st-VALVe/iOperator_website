-- =============================================
-- iOperator.ai Platform - Storage Setup
-- =============================================

-- Create bucket for menu images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'menu-images',
  'menu-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create bucket for business assets (logos, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-assets',
  'business-assets',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- =============================================
-- Storage Policies for menu-images bucket
-- =============================================

-- Anyone can view menu images (public)
CREATE POLICY "Public can view menu images"
ON storage.objects FOR SELECT
USING (bucket_id = 'menu-images');

-- Authenticated users can upload to their business folder
CREATE POLICY "Users can upload menu images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'menu-images' AND
  auth.role() = 'authenticated'
);

-- Users can update their own uploads
CREATE POLICY "Users can update own menu images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'menu-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own uploads
CREATE POLICY "Users can delete own menu images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'menu-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- =============================================
-- Storage Policies for business-assets bucket
-- =============================================

-- Anyone can view business assets (public)
CREATE POLICY "Public can view business assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'business-assets');

-- Authenticated users can upload to their folder
CREATE POLICY "Users can upload business assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'business-assets' AND
  auth.role() = 'authenticated'
);

-- Users can update their own uploads
CREATE POLICY "Users can update own business assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'business-assets' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own uploads
CREATE POLICY "Users can delete own business assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'business-assets' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
