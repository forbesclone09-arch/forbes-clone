-- ====================================================================
-- Forbes Germany: Add 30-Day Trash & Story Restore System
-- ====================================================================

-- 1. Add deleted_at column to articles table if it doesn't already exist
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;

-- 2. Create index on deleted_at for fast query performance (filtering active vs trashed stories)
CREATE INDEX IF NOT EXISTS idx_articles_deleted_at ON public.articles(deleted_at);

-- 3. Update or ensure RLS policies allow updating deleted_at (soft delete / restore)
-- Authors can soft-delete / restore their own articles, admins can soft-delete / restore any
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'articles'
  ) THEN
    -- Ensure UPDATE policy covers deleted_at
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

    -- Ensure DELETE policy allows permanent deletion from trash if requested
    DROP POLICY IF EXISTS "Admins can delete any article, authors can delete own" ON public.articles;
    DROP POLICY IF EXISTS "Enable delete for authors and admins" ON public.articles;
    CREATE POLICY "Admins can delete any article, authors can delete own"
      ON public.articles FOR DELETE
      USING (
        public.is_admin() OR
        auth.uid() = author_id OR
        (auth.jwt() ->> 'email') = author_email
      );
  END IF;
END $$;

-- 4. Automated maintenance function to permanently purge items in trash older than 30 days
CREATE OR REPLACE FUNCTION public.purge_expired_trash_articles()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.articles
  WHERE deleted_at IS NOT NULL
    AND deleted_at < NOW() - INTERVAL '30 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Comment for documentation
COMMENT ON COLUMN public.articles.deleted_at IS 'Timestamp when the article was moved to trash. NULL indicates active story. Retained for 30 days for restoration.';
