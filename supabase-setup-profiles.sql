-- 1. Create profiles table with is_approved column
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'author',
  phone text,
  address text,
  city text,
  bio text,
  avatar_url text,
  is_approved boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure column exists if table was previously created
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT false NOT NULL;

-- 2. Create is_admin helper function with SECURITY DEFINER to prevent RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'email') = 'forbesclone09@gmail.com' OR
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'),
    false
  );
$$;

-- 3. Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;

-- Everyone can view author profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins (or forbesclone09@gmail.com) have full access to create/update/delete any profile
CREATE POLICY "Admins have full access to profiles"
  ON public.profiles FOR ALL
  USING (public.is_admin());

-- 4. Fix user_roles policies so admin can see and edit ALL authors
DROP POLICY IF EXISTS "Admins can view all user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update all user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users and admins can view user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user_roles" ON public.user_roles;

CREATE POLICY "Users and admins can view user_roles"
  ON public.user_roles FOR SELECT
  USING (
    auth.uid() = user_id OR
    public.is_admin()
  );

CREATE POLICY "Admins can manage user_roles"
  ON public.user_roles FOR ALL
  USING (
    public.is_admin()
  );

-- 5. Backfill existing users from auth.users into profiles and user_roles
INSERT INTO public.profiles (id, email, full_name, role, is_approved)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
  CASE WHEN email = 'forbesclone09@gmail.com' THEN 'admin' ELSE 'author' END,
  CASE WHEN email IN ('forbesclone09@gmail.com', 'contacttaisirayath@gmail.com') THEN true ELSE false END
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = CASE WHEN EXCLUDED.email = 'forbesclone09@gmail.com' THEN 'admin' ELSE profiles.role END,
  is_approved = CASE WHEN EXCLUDED.email IN ('forbesclone09@gmail.com', 'contacttaisirayath@gmail.com') THEN true ELSE profiles.is_approved END;

-- Ensure user_roles also has all current users
INSERT INTO public.user_roles (user_id, role)
SELECT 
  id,
  CASE WHEN email = 'forbesclone09@gmail.com' THEN 'admin' ELSE 'author' END
FROM auth.users
ON CONFLICT (user_id) DO UPDATE SET
  role = CASE WHEN EXCLUDED.role = 'admin' THEN 'admin' ELSE user_roles.role END;

-- 6. Auto-sync trigger for new user signups
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
