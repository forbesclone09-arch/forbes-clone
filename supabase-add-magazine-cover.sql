-- ====================================================================
-- Migration: Support 3:4 Magazine Cover Features
-- ====================================================================

-- 1. Add aspect_ratio column to articles table ('3:4' or '4:3')
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS aspect_ratio text DEFAULT '4:3';

-- 2. Add is_cover column for explicit cover feature marking
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS is_cover boolean DEFAULT false;

-- 3. Create indexes for fast filtering
CREATE INDEX IF NOT EXISTS idx_articles_aspect_ratio ON public.articles(aspect_ratio);
CREATE INDEX IF NOT EXISTS idx_articles_is_cover ON public.articles(is_cover);
