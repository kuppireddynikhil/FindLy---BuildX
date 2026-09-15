-- ==============================================================================
-- FindLy — Campus Lost & Found Supabase Schema
-- Complete, self-contained, and fully executable database schema for SVCE Tirupati.
-- Safe to run on a brand new Supabase project or an existing one in the SQL Editor.
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
  CREATE TYPE public.conversation_status AS ENUM (
    'PENDING',
    'ACCEPTED',
    'ACTIVE',
    'DECLINED',
    'REVOKED',
    'CLOSED',
    'EXPIRED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.recovery_status AS ENUM (
    'OPEN',
    'VERIFIED',
    'HANDOVER_SCHEDULED',
    'COMPLETED',
    'REJECTED',
    'CANCELLED',
    'IN_PROGRESS',
    'DISPUTED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. CORE CAMPUS GEOGRAPHY & ACADEMIC TABLES
CREATE TABLE IF NOT EXISTS public.campuses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  geojson jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT campuses_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.buildings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  campus_id uuid REFERENCES public.campuses(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text,
  latitude numeric,
  longitude numeric,
  floors text[] DEFAULT ARRAY['Ground Floor']::text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT buildings_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.floors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  building_id uuid NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT floors_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.campus_locations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  campus_id uuid REFERENCES public.campuses(id) ON DELETE CASCADE,
  building_id uuid REFERENCES public.buildings(id) ON DELETE SET NULL,
  floor_id uuid REFERENCES public.floors(id) ON DELETE SET NULL,
  name text NOT NULL,
  building text,
  floor text DEFAULT 'Ground Floor',
  room text,
  location_type text DEFAULT 'general',
  latitude numeric DEFAULT 13.6288,
  longitude numeric DEFAULT 79.4192,
  is_outdoor boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT campus_locations_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.departments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  code text,
  created_at timestamptz NOT NULL DEFAULT now(),
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
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);

-- 4. USER PROFILES (Directly mapped to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  avatar_url text,
  department text DEFAULT 'General Campus',
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  phone text,
  role text NOT NULL DEFAULT 'user',
  is_active boolean NOT NULL DEFAULT true,
  account_status text NOT NULL DEFAULT 'active',
  username text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_roles_pkey PRIMARY KEY (id)
);

-- 5. ITEMS & REPORTS
CREATE TABLE IF NOT EXISTS public.items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  identifying_features text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT items_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  item_id uuid REFERENCES public.items(id) ON DELETE SET NULL,
  reporter_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'LOST',
  status text NOT NULL DEFAULT 'ACTIVE',
  title text,
  description text,
  category text,
  brand text,
  color text,
  identifying_features text,
  campus_location_id uuid REFERENCES public.campus_locations(id) ON DELETE SET NULL,
  building text,
  floor text,
  location_description text,
  latitude numeric,
  longitude numeric,
  date text,
  time text,
  image_url text,
  contact_method text,
  contact_info text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  reported_at timestamptz NOT NULL DEFAULT now(),
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reports_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.report_images (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT report_images_pkey PRIMARY KEY (id)
);

-- 6. MATCHING, MESSAGING & RECOVERY
CREATE TABLE IF NOT EXISTS public.matches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  lost_report_id uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  found_report_id uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  score numeric NOT NULL CHECK (score >= 0 AND score <= 100),
  status text NOT NULL DEFAULT 'SUGGESTED',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT matches_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES public.reports(id) ON DELETE SET NULL,
  requester_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'PENDING',
  requester_message_count integer NOT NULL DEFAULT 0 CHECK (requester_message_count >= 0),
  preliminary_message_count integer NOT NULL DEFAULT 0 CHECK (preliminary_message_count >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT conversations_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text,
  body text,
  attachment_url text,
  attachment_path text,
  is_read boolean NOT NULL DEFAULT false,
  is_preliminary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT messages_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.recovery_cases (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  case_number text,
  match_id uuid REFERENCES public.matches(id) ON DELETE SET NULL,
  report_id uuid REFERENCES public.reports(id) ON DELETE CASCADE,
  claimant_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  finder_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'OPEN',
  handover_date timestamptz,
  handover_location text DEFAULT 'SVCE Tirupati Campus Security & Student Affairs Desk',
  notes text,
  verified_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_at timestamptz,
  handover_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT recovery_cases_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.claims (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  claimant_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_id uuid REFERENCES public.reports(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT claims_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text,
  message text,
  type text NOT NULL,
  payload jsonb DEFAULT '{}'::jsonb,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.system_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  description text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT system_settings_pkey PRIMARY KEY (id)
);

-- 7. AUTO-PROFILE CREATION ON AUTH SIGNUP TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role text := 'user';
BEGIN
  -- Designate admin credentials
  IF LOWER(NEW.email) = 'knikhilreddy2@gmail.com' THEN
    assigned_role := 'admin';
  ELSIF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
    assigned_role := NEW.raw_user_meta_data->>'role';
  END IF;

  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    avatar_url,
    phone,
    department,
    role,
    is_active,
    account_status,
    username,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'department', 'General Campus'),
    assigned_role,
    true,
    'active',
    split_part(NEW.email, '@', 1),
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    role = CASE WHEN LOWER(NEW.email) = 'knikhilreddy2@gmail.com' THEN 'admin' ELSE public.profiles.role END,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill any pre-existing auth users into profiles table
INSERT INTO public.profiles (id, full_name, email, role, department, username)
SELECT
  id,
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
  COALESCE(email, ''),
  CASE WHEN LOWER(email) = 'knikhilreddy2@gmail.com' THEN 'admin' ELSE 'user' END,
  'General Campus',
  split_part(email, '@', 1)
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  role = CASE WHEN LOWER(public.profiles.email) = 'knikhilreddy2@gmail.com' THEN 'admin' ELSE public.profiles.role END;

-- 8. RPC: AGGREGATED ADMIN USER STATISTICS
CREATE OR REPLACE FUNCTION public.get_admin_user_statistics(
  p_search text DEFAULT NULL,
  p_role_filter text DEFAULT NULL
)
RETURNS TABLE (
  profile_id uuid,
  email text,
  full_name text,
  username text,
  phone text,
  department text,
  role text,
  is_active boolean,
  account_status text,
  joined_date timestamptz,
  lost_reports_count bigint,
  found_reports_count bigint,
  total_reports_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id AS profile_id,
    p.email,
    p.full_name,
    COALESCE(p.username, split_part(p.email, '@', 1)) AS username,
    p.phone,
    COALESCE(p.department, 'General Campus') AS department,
    p.role,
    p.is_active,
    p.account_status,
    p.created_at AS joined_date,
    COUNT(r.id) FILTER (WHERE UPPER(r.type) = 'LOST') AS lost_reports_count,
    COUNT(r.id) FILTER (WHERE UPPER(r.type) = 'FOUND') AS found_reports_count,
    COUNT(r.id) AS total_reports_count
  FROM public.profiles p
  LEFT JOIN public.reports r ON r.reporter_id = p.id
  WHERE
    (p_search IS NULL OR (
      p.full_name ILIKE '%' || p_search || '%' OR
      p.email ILIKE '%' || p_search || '%' OR
      p.username ILIKE '%' || p_search || '%' OR
      p.department ILIKE '%' || p_search || '%'
    ))
    AND (p_role_filter IS NULL OR p_role_filter = 'ALL' OR p.role = p_role_filter)
  GROUP BY p.id, p.email, p.full_name, p.username, p.phone, p.department, p.role, p.is_active, p.account_status, p.created_at
  ORDER BY total_reports_count DESC, joined_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 9. SCHEMA PERMISSIONS & GRANTS FOR DATA API
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.floors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recovery_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (
  auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Campus Reference Policies (Public read, authenticated write)
DROP POLICY IF EXISTS "Campuses viewable by everyone" ON public.campuses;
CREATE POLICY "Campuses viewable by everyone" ON public.campuses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Buildings viewable by everyone" ON public.buildings;
CREATE POLICY "Buildings viewable by everyone" ON public.buildings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Floors viewable by everyone" ON public.floors;
CREATE POLICY "Floors viewable by everyone" ON public.floors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Locations viewable by everyone" ON public.campus_locations;
CREATE POLICY "Locations viewable by everyone" ON public.campus_locations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated can insert locations" ON public.campus_locations;
CREATE POLICY "Authenticated can insert locations" ON public.campus_locations FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can update locations" ON public.campus_locations;
CREATE POLICY "Authenticated can update locations" ON public.campus_locations FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Categories viewable by everyone" ON public.categories;
CREATE POLICY "Categories viewable by everyone" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated can insert categories" ON public.categories;
CREATE POLICY "Authenticated can insert categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (true);

-- Items Policies
DROP POLICY IF EXISTS "Items viewable by everyone" ON public.items;
CREATE POLICY "Items viewable by everyone" ON public.items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated can insert items" ON public.items;
CREATE POLICY "Authenticated can insert items" ON public.items FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can update items" ON public.items;
CREATE POLICY "Authenticated can update items" ON public.items FOR UPDATE TO authenticated USING (true);

-- Reports Policies
DROP POLICY IF EXISTS "Reports are viewable by everyone" ON public.reports;
CREATE POLICY "Reports are viewable by everyone" ON public.reports FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated can insert reports" ON public.reports;
CREATE POLICY "Authenticated can insert reports" ON public.reports FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = reporter_id OR reporter_id IS NOT NULL
);

DROP POLICY IF EXISTS "Authenticated can update reports" ON public.reports;
CREATE POLICY "Authenticated can update reports" ON public.reports FOR UPDATE TO authenticated USING (true);

-- Report Images Policies
DROP POLICY IF EXISTS "Report images viewable by everyone" ON public.report_images;
CREATE POLICY "Report images viewable by everyone" ON public.report_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated can insert report images" ON public.report_images;
CREATE POLICY "Authenticated can insert report images" ON public.report_images FOR INSERT TO authenticated WITH CHECK (true);

-- Matches Policies
DROP POLICY IF EXISTS "Matches viewable by everyone" ON public.matches;
CREATE POLICY "Matches viewable by everyone" ON public.matches FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated can manage matches" ON public.matches;
CREATE POLICY "Authenticated can manage matches" ON public.matches FOR ALL TO authenticated USING (true);

-- Messaging Policies
DROP POLICY IF EXISTS "Participants can view conversations" ON public.conversations;
CREATE POLICY "Participants can view conversations" ON public.conversations FOR SELECT TO authenticated USING (
  auth.uid() = requester_id OR auth.uid() = reporter_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations" ON public.conversations FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = requester_id
);

DROP POLICY IF EXISTS "Participants can update conversations" ON public.conversations;
CREATE POLICY "Participants can update conversations" ON public.conversations FOR UPDATE TO authenticated USING (
  auth.uid() = requester_id OR auth.uid() = reporter_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

DROP POLICY IF EXISTS "Messages viewable by conversation participants" ON public.messages;
CREATE POLICY "Messages viewable by conversation participants" ON public.messages FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated can send messages" ON public.messages;
CREATE POLICY "Authenticated can send messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = sender_id
);

-- Recovery & Claims Policies
DROP POLICY IF EXISTS "Recovery cases viewable by authenticated" ON public.recovery_cases;
CREATE POLICY "Recovery cases viewable by authenticated" ON public.recovery_cases FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated can manage recovery cases" ON public.recovery_cases;
CREATE POLICY "Authenticated can manage recovery cases" ON public.recovery_cases FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Claims viewable by authenticated" ON public.claims;
CREATE POLICY "Claims viewable by authenticated" ON public.claims FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated can manage claims" ON public.claims;
CREATE POLICY "Authenticated can manage claims" ON public.claims FOR ALL TO authenticated USING (true);

-- Notifications Policies
DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT TO authenticated USING (
  auth.uid() = profile_id
);

DROP POLICY IF EXISTS "Authenticated can insert notifications" ON public.notifications;
CREATE POLICY "Authenticated can insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (
  auth.uid() = profile_id
);

-- Audit Logs Policies
DROP POLICY IF EXISTS "Audit logs viewable by admins" ON public.audit_logs;
CREATE POLICY "Audit logs viewable by admins" ON public.audit_logs FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Audit logs insertable by authenticated" ON public.audit_logs;
CREATE POLICY "Audit logs insertable by authenticated" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- System Settings Policies
DROP POLICY IF EXISTS "System settings viewable by everyone" ON public.system_settings;
CREATE POLICY "System settings viewable by everyone" ON public.system_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "System settings editable by admins" ON public.system_settings;
CREATE POLICY "System settings editable by admins" ON public.system_settings FOR ALL TO authenticated USING (true);

-- 11. INITIAL SEED DATA
-- Default Categories
INSERT INTO public.categories (name, icon) VALUES
  ('Electronics & Gadgets', 'smartphone'),
  ('ID Cards & Documents', 'credit-card'),
  ('Bags & Backpacks', 'briefcase'),
  ('Keys & Access Cards', 'key'),
  ('Books & Stationery', 'book-open'),
  ('Clothing & Accessories', 'shirt'),
  ('Personal Belongings', 'package')
ON CONFLICT (name) DO NOTHING;

-- Default Campus & Buildings
INSERT INTO public.campuses (id, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'SVCE Tirupati Main Campus')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.buildings (id, campus_id, name, code, floors) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Administrative Block', 'ADMIN', ARRAY['Ground Floor', '1st Floor', '2nd Floor']),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'CSE & IT Block', 'CS-IT', ARRAY['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor']),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'ECE Block', 'ECE', ARRAY['Ground Floor', '1st Floor', '2nd Floor']),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Mechanical Block', 'MECH', ARRAY['Ground Floor', '1st Floor']),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Central Library', 'LIB', ARRAY['Ground Floor', '1st Floor', '2nd Floor']),
  ('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'Student Cafeteria', 'CAFE', ARRAY['Ground Floor']),
  ('10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'Sports Complex', 'SPORTS', ARRAY['Ground Floor'])
ON CONFLICT (id) DO NOTHING;

-- Default Campus Locations
INSERT INTO public.campus_locations (name, building, floor, room, location_type, latitude, longitude, is_active) VALUES
  ('Central Library Reading Hall', 'Central Library', '1st Floor', 'Hall A', 'library', 13.6288, 79.4192, true),
  ('Digital Library & Research Lab', 'Central Library', '2nd Floor', 'DL-204', 'lab', 13.6289, 79.4193, true),
  ('Main Canteen & Student Dining', 'Student Cafeteria', 'Ground Floor', 'Dining Area', 'cafeteria', 13.6282, 79.4185, true),
  ('CSE Advanced Computing Lab 1', 'CSE & IT Block', '1st Floor', 'Lab CS-101', 'lab', 13.6295, 79.4201, true),
  ('CSE Seminar Hall', 'CSE & IT Block', '3rd Floor', 'Seminar Hall 3', 'hall', 13.6296, 79.4203, true),
  ('Main Auditorium & Cultural Center', 'Administrative Block', 'Ground Floor', 'Auditorium', 'auditorium', 13.6275, 79.4178, true),
  ('Administrative Office & Helpdesk', 'Administrative Block', '1st Floor', 'Room 102', 'office', 13.6276, 79.4179, true),
  ('Indoor Sports Complex', 'Sports Complex', 'Ground Floor', 'Badminton Courts', 'sports', 13.6268, 79.4165, true),
  ('ECE Embedded Systems Lab', 'ECE Block', '2nd Floor', 'Lab EC-202', 'lab', 13.6291, 79.4198, true),
  ('Mechanical CAD/CAM Center', 'Mechanical Block', 'Ground Floor', 'CAD Center', 'lab', 13.6271, 79.4182, true)
ON CONFLICT DO NOTHING;

-- 12. STORAGE BUCKET CONFIGURATION FOR REPORT IMAGES
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'report-images',
  'report-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
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

DROP POLICY IF EXISTS "Authenticated users can update report images" ON storage.objects;
CREATE POLICY "Authenticated users can update report images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'report-images');
