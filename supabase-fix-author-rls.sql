-- ====================================================================
-- Forbes Germany: Fix Articles Table RLS Permissions for Authors & Admins
-- ====================================================================

-- 1. Ensure required author tracking columns exist
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS author_email text;

CREATE INDEX IF NOT EXISTS idx_articles_author_id ON public.articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_author_email ON public.articles(author_email);

-- 2. Verify is_admin helper function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'email') = 'forbesclone09@gmail.com' OR
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'),
    false
  );
$$;

-- 3. Reset and apply clean RLS policies on public.articles
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Allow everyone (public & authenticated) to read articles
DROP POLICY IF EXISTS "Articles are viewable by everyone" ON public.articles;
CREATE POLICY "Articles are viewable by everyone"
  ON public.articles FOR SELECT
  USING (true);

-- Allow authenticated users (authors and admins) to insert new articles
DROP POLICY IF EXISTS "Authors can insert articles" ON public.articles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.articles;
CREATE POLICY "Authors can insert articles"
  ON public.articles FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' OR
    auth.uid() IS NOT NULL
  );

-- Allow authors to update own articles, admins to update any
DROP POLICY IF EXISTS "Authors can update own articles, admins can update any" ON public.articles;
DROP POLICY IF EXISTS "Enable update for authors and admins" ON public.articles;
CREATE POLICY "Authors can update own articles, admins can update any"
  ON public.articles FOR UPDATE
  USING (
    public.is_admin() OR
    auth.uid() = author_id OR
    (auth.jwt() ->> 'email') = author_email
  )
  WITH CHECK (
    public.is_admin() OR
    auth.uid() = author_id OR
    (auth.jwt() ->> 'email') = author_email
  );

-- Allow authors to delete own articles, admins to delete any
DROP POLICY IF EXISTS "Admins can delete any article, authors can delete own" ON public.articles;
DROP POLICY IF EXISTS "Enable delete for authors and admins" ON public.articles;
CREATE POLICY "Admins can delete any article, authors can delete own"
  ON public.articles FOR DELETE
  USING (
    public.is_admin() OR
    auth.uid() = author_id OR
    (auth.jwt() ->> 'email') = author_email
  );
