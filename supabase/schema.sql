-- ==============================================================================
-- FindLy — Campus Lost & Found Supabase Schema
-- Complete and fully executable schema for SVCE Tirupati campus ecosystem.
-- Paste and run this script in the Supabase SQL Editor.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CUSTOM ENUM TYPES
DO $$ BEGIN
  CREATE TYPE public.report_type AS ENUM ('LOST', 'FOUND');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.report_status AS ENUM (
    'PENDING_REVIEW',
    'ACTIVE',
    'MATCHED',
    'RECOVERED',
    'WITHDRAWN',
    'REJECTED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.match_status AS ENUM ('SUGGESTED', 'CONFIRMED', 'DISMISSED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.conversation_status AS ENUM ('PENDING', 'ACCEPTED', 'CLOSED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.recovery_status AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'DISPUTED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. CORE CAMPUS GEOGRAPHY & ACADEMIC TABLES
CREATE TABLE IF NOT EXISTS public.campuses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  geojson jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT campuses_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.buildings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  campus_id uuid REFERENCES public.campuses(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text,
  latitude numeric,
  longitude numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT buildings_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.floors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  building_id uuid NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT floors_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.campus_locations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  campus_id uuid REFERENCES public.campuses(id) ON DELETE CASCADE,
  building_id uuid REFERENCES public.buildings(id) ON DELETE CASCADE,
  floor_id uuid REFERENCES public.floors(id) ON DELETE CASCADE,
  name text NOT NULL,
  latitude numeric,
  longitude numeric,
  is_outdoor boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT campus_locations_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.departments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT departments_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  CONSTRAINT roles_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  icon text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);

-- 4. USER PROFILES (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  avatar_url text,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  phone text,
  role text NOT NULL DEFAULT 'user',
  is_active boolean NOT NULL DEFAULT true,
  account_status text NOT NULL DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_roles_pkey PRIMARY KEY (id)
);

-- 5. ITEMS & REPORTS
CREATE TABLE IF NOT EXISTS public.items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  identifying_features text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT items_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  item_id uuid REFERENCES public.items(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type public.report_type NOT NULL,
  status public.report_status NOT NULL DEFAULT 'ACTIVE'::public.report_status,
  campus_location_id uuid REFERENCES public.campus_locations(id) ON DELETE SET NULL,
  latitude numeric,
  longitude numeric,
  occurred_at timestamp with time zone NOT NULL DEFAULT now(),
  reported_at timestamp with time zone NOT NULL DEFAULT now(),
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT reports_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.report_images (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  uploaded_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT report_images_pkey PRIMARY KEY (id)
);

-- 6. MATCHING, MESSAGING & RECOVERY
CREATE TABLE IF NOT EXISTS public.matches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  lost_report_id uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  found_report_id uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  score numeric NOT NULL CHECK (score >= 0 AND score <= 100),
  status public.match_status NOT NULL DEFAULT 'SUGGESTED'::public.match_status,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT matches_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  requester_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status public.conversation_status NOT NULL DEFAULT 'PENDING'::public.conversation_status,
  preliminary_message_count integer NOT NULL DEFAULT 0 CHECK (preliminary_message_count >= 0),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT conversations_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.conversation_participants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_in_conversation text NOT NULL CHECK (role_in_conversation IN ('requester', 'reporter')),
  last_read_at timestamp with time zone,
  CONSTRAINT conversation_participants_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body text,
  attachment_path text,
  is_preliminary boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT messages_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.recovery_cases (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL UNIQUE REFERENCES public.matches(id) ON DELETE CASCADE,
  status public.recovery_status NOT NULL DEFAULT 'OPEN'::public.recovery_status,
  verified_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_at timestamp with time zone,
  handover_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT recovery_cases_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  payload jsonb,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id uuid,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id)
);

-- 7. AUTO-PROFILE CREATION ON AUTH SIGNUP TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'phone',
    'user'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    email = COALESCE(EXCLUDED.email, public.profiles.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also backfill any existing auth users into profiles table
INSERT INTO public.profiles (id, full_name, email, role)
SELECT
  id,
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
  COALESCE(email, ''),
  'user'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.floors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recovery_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Categories Policies
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert categories" ON public.categories;
CREATE POLICY "Authenticated users can insert categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (true);

-- Campus & Locations Policies
DROP POLICY IF EXISTS "Locations viewable by everyone" ON public.campus_locations;
CREATE POLICY "Locations viewable by everyone" ON public.campus_locations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Buildings viewable by everyone" ON public.buildings;
CREATE POLICY "Buildings viewable by everyone" ON public.buildings FOR SELECT USING (true);

-- Items Policies
DROP POLICY IF EXISTS "Items are viewable by everyone" ON public.items;
CREATE POLICY "Items are viewable by everyone" ON public.items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert items" ON public.items;
CREATE POLICY "Authenticated users can insert items" ON public.items FOR INSERT TO authenticated WITH CHECK (true);

-- Reports Policies
DROP POLICY IF EXISTS "Reports are viewable by everyone" ON public.reports;
CREATE POLICY "Reports are viewable by everyone" ON public.reports FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert reports" ON public.reports;
CREATE POLICY "Authenticated users can insert reports" ON public.reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Users can update own reports" ON public.reports;
CREATE POLICY "Users can update own reports" ON public.reports FOR UPDATE TO authenticated USING (auth.uid() = reporter_id);

-- Report Images Policies
DROP POLICY IF EXISTS "Report images viewable by everyone" ON public.report_images;
CREATE POLICY "Report images viewable by everyone" ON public.report_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert report images" ON public.report_images;
CREATE POLICY "Authenticated users can insert report images" ON public.report_images FOR INSERT TO authenticated WITH CHECK (true);

-- Matches Policies
DROP POLICY IF EXISTS "Matches viewable by everyone" ON public.matches;
CREATE POLICY "Matches viewable by everyone" ON public.matches FOR SELECT USING (true);

-- Messages & Conversations Policies
DROP POLICY IF EXISTS "Participants can view conversations" ON public.conversations;
CREATE POLICY "Participants can view conversations" ON public.conversations FOR SELECT TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations" ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Participants can view messages" ON public.messages;
CREATE POLICY "Participants can view messages" ON public.messages FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Participants can insert messages" ON public.messages;
CREATE POLICY "Participants can insert messages" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Notifications Policies
DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = profile_id);

-- 9. INITIAL SEED CATEGORIES
INSERT INTO public.categories (name, icon) VALUES
  ('Electronics & Gadgets', 'smartphone'),
  ('ID Cards & Documents', 'credit-card'),
  ('Bags & Backpacks', 'briefcase'),
  ('Keys & Access Cards', 'key'),
  ('Books & Stationery', 'book-open'),
  ('Clothing & Accessories', 'shirt'),
  ('Personal Belongings', 'package')
ON CONFLICT (name) DO NOTHING;

-- 10. STORAGE BUCKET CREATION FOR REPORT IMAGES
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'report-images',
  'report-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public can view report images" ON storage.objects;
CREATE POLICY "Public can view report images" ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'report-images');

DROP POLICY IF EXISTS "Authenticated users can upload report images" ON storage.objects;
CREATE POLICY "Authenticated users can upload report images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'report-images');
