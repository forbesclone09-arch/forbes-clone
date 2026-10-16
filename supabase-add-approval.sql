-- =========================================================
-- Migration: Add Admin Approval for New Author Registrations
-- =========================================================

-- 1. Add is_approved column to public.profiles if not present
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT false NOT NULL;

-- 2. Ensure current admin & existing accounts are approved
UPDATE public.profiles
SET is_approved = true
WHERE email IN ('forbesclone09@gmail.com', 'contacttaisirayath@gmail.com')
   OR role = 'admin';

-- 3. Update the handle_new_user_profile trigger function so new signups start as is_approved = false (except admin)
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, is_approved)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    CASE WHEN new.email = 'forbesclone09@gmail.com' THEN 'admin' ELSE 'author' END,
    CASE WHEN new.email = 'forbesclone09@gmail.com' THEN true ELSE false END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = CASE WHEN EXCLUDED.email = 'forbesclone09@gmail.com' THEN 'admin' ELSE profiles.role END,
    is_approved = CASE WHEN EXCLUDED.email = 'forbesclone09@gmail.com' THEN true ELSE profiles.is_approved END;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    new.id,
    CASE WHEN new.email = 'forbesclone09@gmail.com' THEN 'admin' ELSE 'author' END
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_profile();
