-- Findly complete Supabase schema
-- Run this file in the Supabase SQL Editor on a new project.
-- Create Auth users through Supabase Auth; public.profiles is created automatically.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  department TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  account_status TEXT NOT NULL DEFAULT 'active' CHECK (account_status IN ('active', 'disabled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  building TEXT NOT NULL,
  floor TEXT,
  room TEXT,
  latitude NUMERIC(9, 6),
  longitude NUMERIC(9, 6),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (building, floor, room)
);

-- The existing frontend calls this table items. It is the application's reports table.
CREATE TABLE public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_code TEXT UNIQUE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('lost', 'found')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  brand TEXT,
  color TEXT,
  identifying_features TEXT,
  location TEXT NOT NULL,
  building TEXT,
  floor TEXT,
  room_area TEXT,
  date DATE NOT NULL,
  time TIME,
  image_url TEXT NOT NULL,
  contact_method TEXT,
  contact_info TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('pending', 'open', 'potential_match', 'claimed', 'resolved', 'recovered', 'closed', 'archived', 'flagged')),
  is_searchable BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  claimant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (item_id, claimant_id)
);

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.items(id) ON DELETE SET NULL,
  claim_id UUID REFERENCES public.claims(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('report_submitted', 'potential_match', 'claim_update', 'recovery_confirmation', 'admin_announcement', 'system')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.recovery_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL UNIQUE REFERENCES public.items(id) ON DELETE CASCADE,
  recovered_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  confirmed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  recovered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMPTZ
);

CREATE TABLE public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed locations used by the current report and search forms.
INSERT INTO public.locations (name, building) VALUES
  ('Library', 'Library'),
  ('Cafeteria', 'Cafeteria'),
  ('Main Building', 'Main Building'),
  ('Science Block', 'Science Block'),
  ('Engineering Block', 'Engineering Block'),
  ('Arts Building', 'Arts Building'),
  ('Sports Complex', 'Sports Complex'),
  ('Auditorium', 'Auditorium'),
  ('Parking Lot', 'Parking Lot'),
  ('Hostel', 'Hostel'),
  ('Lab', 'Lab'),
  ('Playground', 'Playground'),
  ('Bus Stop', 'Bus Stop'),
  ('Other', 'Other')
ON CONFLICT (building, floor, room) DO NOTHING;

INSERT INTO public.system_settings (key, value, description) VALUES
  ('reporting_enabled', 'true', 'Allow users to submit lost and found reports.'),
  ('claims_enabled', 'true', 'Allow authenticated users to submit item claims.'),
  ('announcement', 'null', 'Current announcement shown to users.')
ON CONFLICT (key) DO NOTHING;

-- New Auth users always receive the user role. Admin access must be assigned separately.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'phone', ''),
    'user'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    phone = COALESCE(EXCLUDED.phone, profiles.phone);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND role = 'admin'
      AND account_status = 'active'
  );
$$;

REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.assign_report_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.report_code IS NULL THEN
    NEW.report_code := CASE WHEN NEW.type = 'lost' THEN 'L-' ELSE 'F-' END || lpad((floor(random() * 90000) + 10000)::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_item_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NULLIF(btrim(NEW.title), '') IS NULL THEN RAISE EXCEPTION 'Item title is required'; END IF;
  IF NULLIF(btrim(NEW.description), '') IS NULL THEN RAISE EXCEPTION 'Item description is required'; END IF;
  IF NULLIF(btrim(NEW.category), '') IS NULL THEN RAISE EXCEPTION 'Item category is required'; END IF;
  IF NULLIF(btrim(NEW.location), '') IS NULL THEN RAISE EXCEPTION 'Item location is required'; END IF;
  IF NEW.date IS NULL THEN RAISE EXCEPTION 'Item date is required'; END IF;
  IF NULLIF(btrim(NEW.image_url), '') IS NULL THEN RAISE EXCEPTION 'Item image is required'; END IF;
  IF NULLIF(btrim(NEW.contact_info), '') IS NULL THEN RAISE EXCEPTION 'Contact information is required'; END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_report_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, item_id, title, message, type)
  VALUES (NEW.user_id, NEW.id, 'Report submitted', 'Your ' || NEW.type || ' report was submitted successfully.', 'report_submitted');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
DROP TRIGGER IF EXISTS locations_updated_at ON public.locations;
CREATE TRIGGER locations_updated_at BEFORE UPDATE ON public.locations FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
DROP TRIGGER IF EXISTS items_updated_at ON public.items;
CREATE TRIGGER items_updated_at BEFORE UPDATE ON public.items FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
DROP TRIGGER IF EXISTS claims_updated_at ON public.claims;
CREATE TRIGGER claims_updated_at BEFORE UPDATE ON public.claims FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
DROP TRIGGER IF EXISTS items_assign_report_code ON public.items;
CREATE TRIGGER items_assign_report_code BEFORE INSERT ON public.items FOR EACH ROW EXECUTE FUNCTION public.assign_report_code();
DROP TRIGGER IF EXISTS items_validate_complete ON public.items;
CREATE TRIGGER items_validate_complete BEFORE INSERT OR UPDATE ON public.items FOR EACH ROW EXECUTE FUNCTION public.validate_item_complete();
DROP TRIGGER IF EXISTS items_notify_created ON public.items;
CREATE TRIGGER items_notify_created AFTER INSERT ON public.items FOR EACH ROW EXECUTE FUNCTION public.notify_report_created();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recovery_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own profile; admins can manage all profiles.
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles FOR SELECT TO authenticated USING (id = (SELECT auth.uid()) OR (SELECT private.is_admin()));
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (id = (SELECT auth.uid())) WITH CHECK (id = (SELECT auth.uid()) AND role = 'user');
CREATE POLICY "profiles_admin_update" ON public.profiles FOR UPDATE TO authenticated USING ((SELECT private.is_admin())) WITH CHECK (true);

-- Locations are readable by signed-in users; only admins can modify them.
CREATE POLICY "locations_authenticated_read" ON public.locations FOR SELECT TO authenticated USING (active = true OR (SELECT private.is_admin()));
CREATE POLICY "locations_admin_insert" ON public.locations FOR INSERT TO authenticated WITH CHECK ((SELECT private.is_admin()));
CREATE POLICY "locations_admin_update" ON public.locations FOR UPDATE TO authenticated USING ((SELECT private.is_admin())) WITH CHECK ((SELECT private.is_admin()));
CREATE POLICY "locations_admin_delete" ON public.locations FOR DELETE TO authenticated USING ((SELECT private.is_admin()));

-- Reports are searchable by authenticated users. Mutations are owner/admin controlled.
CREATE POLICY "items_authenticated_read" ON public.items FOR SELECT TO authenticated USING (is_searchable = true OR user_id = (SELECT auth.uid()) OR (SELECT private.is_admin()));
CREATE POLICY "items_owner_insert" ON public.items FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "items_owner_update" ON public.items FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "items_admin_update" ON public.items FOR UPDATE TO authenticated USING ((SELECT private.is_admin())) WITH CHECK ((SELECT private.is_admin()));
CREATE POLICY "items_owner_delete" ON public.items FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));
CREATE POLICY "items_admin_delete" ON public.items FOR DELETE TO authenticated USING ((SELECT private.is_admin()));

-- Claims: claimants see their own claims; item owners/admins review claims.
CREATE POLICY "claims_read_claimant_or_reviewer" ON public.claims FOR SELECT TO authenticated USING (claimant_id = (SELECT auth.uid()) OR EXISTS (SELECT 1 FROM public.items WHERE id = item_id AND user_id = (SELECT auth.uid())) OR (SELECT private.is_admin()));
CREATE POLICY "claims_create_own" ON public.claims FOR INSERT TO authenticated WITH CHECK (claimant_id = (SELECT auth.uid()));
CREATE POLICY "claims_update_reviewer" ON public.claims FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.items WHERE id = item_id AND user_id = (SELECT auth.uid())) OR (SELECT private.is_admin())) WITH CHECK (EXISTS (SELECT 1 FROM public.items WHERE id = item_id AND user_id = (SELECT auth.uid())) OR (SELECT private.is_admin()));

-- Notifications belong only to their recipient, except admin announcement creation.
CREATE POLICY "notifications_read_own" ON public.notifications FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()) OR (SELECT private.is_admin()));
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "notifications_admin_insert" ON public.notifications FOR INSERT TO authenticated WITH CHECK ((SELECT private.is_admin()));

-- Recovery records are visible to the item owner, recovered user, or admins.
CREATE POLICY "recovery_read_related" ON public.recovery_records FOR SELECT TO authenticated USING (recovered_by = (SELECT auth.uid()) OR EXISTS (SELECT 1 FROM public.items WHERE id = item_id AND user_id = (SELECT auth.uid())) OR (SELECT private.is_admin()));
CREATE POLICY "recovery_create_related" ON public.recovery_records FOR INSERT TO authenticated WITH CHECK (recovered_by = (SELECT auth.uid()) OR EXISTS (SELECT 1 FROM public.items WHERE id = item_id AND user_id = (SELECT auth.uid())) OR (SELECT private.is_admin()));
CREATE POLICY "recovery_update_related" ON public.recovery_records FOR UPDATE TO authenticated USING (recovered_by = (SELECT auth.uid()) OR EXISTS (SELECT 1 FROM public.items WHERE id = item_id AND user_id = (SELECT auth.uid())) OR (SELECT private.is_admin())) WITH CHECK (recovered_by = (SELECT auth.uid()) OR EXISTS (SELECT 1 FROM public.items WHERE id = item_id AND user_id = (SELECT auth.uid())) OR (SELECT private.is_admin()));

CREATE POLICY "settings_admin_read" ON public.system_settings FOR SELECT TO authenticated USING ((SELECT private.is_admin()));
CREATE POLICY "settings_admin_update" ON public.system_settings FOR UPDATE TO authenticated USING ((SELECT private.is_admin())) WITH CHECK ((SELECT private.is_admin()));
CREATE POLICY "settings_admin_insert" ON public.system_settings FOR INSERT TO authenticated WITH CHECK ((SELECT private.is_admin()));

-- Report images are private to the bucket but publicly readable through the app's item URLs.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('item-images', 'item-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']::text[])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 5242880, allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "item_images_insert_own_folder" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'item-images' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);
CREATE POLICY "item_images_update_own_folder" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'item-images' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text)
WITH CHECK (bucket_id = 'item-images' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);
CREATE POLICY "item_images_delete_own_folder" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'item-images' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);
CREATE POLICY "item_images_read_public" ON storage.objects FOR SELECT TO public USING (bucket_id = 'item-images');

CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_status ON public.profiles(account_status);
CREATE INDEX idx_locations_building ON public.locations(building);
CREATE INDEX idx_items_type ON public.items(type);
CREATE INDEX idx_items_status ON public.items(status);
CREATE INDEX idx_items_category ON public.items(category);
CREATE INDEX idx_items_location ON public.items(location);
CREATE INDEX idx_items_user_id ON public.items(user_id);
CREATE INDEX idx_items_created_at ON public.items(created_at DESC);
CREATE INDEX idx_claims_item_id ON public.claims(item_id);
CREATE INDEX idx_claims_claimant_id ON public.claims(claimant_id);
CREATE INDEX idx_claims_status ON public.claims(status);
CREATE INDEX idx_notifications_user_id_read ON public.notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_recovery_item_id ON public.recovery_records(item_id);

GRANT USAGE ON SCHEMA private TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles, public.locations, public.items, public.claims, public.notifications, public.recovery_records, public.system_settings TO authenticated;
