-- ====================================================================
-- Migration: Add author tracking to articles & sync admin capabilities
-- ====================================================================

-- 1. Ensure author_id and author_email columns exist in articles table
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS author_email text;

-- 2. Create indexes on author_id and author_email for efficient lookups
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON public.articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_author_email ON public.articles(author_email);

-- 3. Link existing articles to primary admin if matching author identifier
UPDATE public.articles
SET author_email = 'forbesclone09@gmail.com'
WHERE author IN ('forbesclone09', 'forbesclone09@gmail.com') AND author_email IS NULL;

-- 4. Update is_admin function to verify role from both user_roles and profiles
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

-- 5. RLS policies on articles for editorial permission control
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'articles'
  ) THEN
    ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Articles are viewable by everyone" ON public.articles;
    CREATE POLICY "Articles are viewable by everyone"
      ON public.articles FOR SELECT
      USING (true);

    DROP POLICY IF EXISTS "Authors can insert articles" ON public.articles;
    CREATE POLICY "Authors can insert articles"
      ON public.articles FOR INSERT
      WITH CHECK (
        public.is_admin() OR 
        auth.uid() IS NOT NULL
      );

    DROP POLICY IF EXISTS "Authors can update own articles, admins can update any" ON public.articles;
    CREATE POLICY "Authors can update own articles, admins can update any"
      ON public.articles FOR UPDATE
      USING (
        public.is_admin() OR
        auth.uid() = author_id OR
        (auth.jwt() ->> 'email') = author_email
      );

    DROP POLICY IF EXISTS "Admins can delete any article, authors can delete own" ON public.articles;
    CREATE POLICY "Admins can delete any article, authors can delete own"
      ON public.articles FOR DELETE
      USING (
        public.is_admin() OR
        auth.uid() = author_id OR
        (auth.jwt() ->> 'email') = author_email
      );
  END IF;
END $$;
