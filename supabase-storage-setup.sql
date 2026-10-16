-- =========================================================
-- Supabase Storage Setup: article-images
-- Creates the public storage bucket for article cover & inline images
-- =========================================================

-- 1. Create article-images bucket if it doesn't already exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop any prior conflicting policies on storage.objects for article-images
DROP POLICY IF EXISTS "Public can view article images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload article images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update article images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete article images" ON storage.objects;

-- 3. Public read policy: Anyone can view images
CREATE POLICY "Public can view article images"
ON storage.objects FOR SELECT
USING (bucket_id = 'article-images');

-- 4. Authenticated upload policy: Logged-in authors can upload images
CREATE POLICY "Authenticated users can upload article images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'article-images');

-- 5. Authenticated update/delete policy
CREATE POLICY "Authenticated users can update article images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'article-images');

CREATE POLICY "Authenticated users can delete article images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'article-images');
