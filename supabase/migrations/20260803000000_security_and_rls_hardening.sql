-- Migration: 20260803000000_security_and_rls_hardening.sql
-- Description: Production-grade Supabase PostgreSQL Security and RLS Hardening

-- -----------------------------------------------------------------------------
-- 1. REVOKE DEFAULT PRIVILEGES FROM ANON AND PUBLIC FOR ALL TABLES
-- -----------------------------------------------------------------------------
REVOKE ALL ON public.profiles FROM PUBLIC, anon;
REVOKE ALL ON public.leads FROM PUBLIC, anon;
REVOKE ALL ON public.policies FROM PUBLIC, anon;
REVOKE ALL ON public.commission_rules FROM PUBLIC, anon;
REVOKE ALL ON public.reminder_settings FROM PUBLIC, anon;
REVOKE ALL ON public.reminder_log FROM PUBLIC, anon;
REVOKE ALL ON public.notifications FROM PUBLIC, anon;
REVOKE ALL ON public.webhook_logs FROM PUBLIC, anon;
REVOKE ALL ON public.lead_followup_log FROM PUBLIC, anon;

-- Explicitly GRANT specific operations to authenticated users and service_role
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.policies TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.commission_rules TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reminder_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reminder_log TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.webhook_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_followup_log TO authenticated;

GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.leads TO service_role;
GRANT ALL ON public.policies TO service_role;
GRANT ALL ON public.commission_rules TO service_role;
GRANT ALL ON public.reminder_settings TO service_role;
GRANT ALL ON public.reminder_log TO service_role;
GRANT ALL ON public.notifications TO service_role;
GRANT ALL ON public.webhook_logs TO service_role;
GRANT ALL ON public.lead_followup_log TO service_role;

-- -----------------------------------------------------------------------------
-- 2. ENSURE RLS IS ENABLED ON ALL TABLES
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_followup_log ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 3. SET DEFAULT auth.uid() FOR USER_ID COLUMNS TO PREVENT MANIPULATION
-- -----------------------------------------------------------------------------
ALTER TABLE public.leads ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.policies ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.commission_rules ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.reminder_settings ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.reminder_log ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.notifications ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.webhook_logs ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.lead_followup_log ALTER COLUMN user_id SET DEFAULT auth.uid();

-- -----------------------------------------------------------------------------
-- 4. REPLACE GENERIC "FOR ALL" POLICIES WITH GRANULAR PER-ACTION RLS POLICIES
-- -----------------------------------------------------------------------------

-- --- PROFILES ---
DROP POLICY IF EXISTS "own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles select policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles insert policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles delete policy" ON public.profiles;

CREATE POLICY "Profiles select policy" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Profiles insert policy" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Profiles update policy" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Profiles delete policy" ON public.profiles
  FOR DELETE TO authenticated USING (auth.uid() = id);


-- --- LEADS ---
DROP POLICY IF EXISTS "own leads" ON public.leads;
DROP POLICY IF EXISTS "Leads select policy" ON public.leads;
DROP POLICY IF EXISTS "Leads insert policy" ON public.leads;
DROP POLICY IF EXISTS "Leads update policy" ON public.leads;
DROP POLICY IF EXISTS "Leads delete policy" ON public.leads;

CREATE POLICY "Leads select policy" ON public.leads
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Leads insert policy" ON public.leads
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Leads update policy" ON public.leads
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Leads delete policy" ON public.leads
  FOR DELETE TO authenticated USING (auth.uid() = user_id);


-- --- POLICIES ---
DROP POLICY IF EXISTS "own policies" ON public.policies;
DROP POLICY IF EXISTS "Policies select policy" ON public.policies;
DROP POLICY IF EXISTS "Policies insert policy" ON public.policies;
DROP POLICY IF EXISTS "Policies update policy" ON public.policies;
DROP POLICY IF EXISTS "Policies delete policy" ON public.policies;

CREATE POLICY "Policies select policy" ON public.policies
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Policies insert policy" ON public.policies
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Policies update policy" ON public.policies
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Policies delete policy" ON public.policies
  FOR DELETE TO authenticated USING (auth.uid() = user_id);


-- --- COMMISSION RULES ---
DROP POLICY IF EXISTS "own rules" ON public.commission_rules;
DROP POLICY IF EXISTS "Commission rules select policy" ON public.commission_rules;
DROP POLICY IF EXISTS "Commission rules insert policy" ON public.commission_rules;
DROP POLICY IF EXISTS "Commission rules update policy" ON public.commission_rules;
DROP POLICY IF EXISTS "Commission rules delete policy" ON public.commission_rules;

CREATE POLICY "Commission rules select policy" ON public.commission_rules
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Commission rules insert policy" ON public.commission_rules
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Commission rules update policy" ON public.commission_rules
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Commission rules delete policy" ON public.commission_rules
  FOR DELETE TO authenticated USING (auth.uid() = user_id);


-- --- REMINDER SETTINGS ---
DROP POLICY IF EXISTS "own reminder settings" ON public.reminder_settings;
DROP POLICY IF EXISTS "Reminder settings select policy" ON public.reminder_settings;
DROP POLICY IF EXISTS "Reminder settings insert policy" ON public.reminder_settings;
DROP POLICY IF EXISTS "Reminder settings update policy" ON public.reminder_settings;
DROP POLICY IF EXISTS "Reminder settings delete policy" ON public.reminder_settings;

CREATE POLICY "Reminder settings select policy" ON public.reminder_settings
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Reminder settings insert policy" ON public.reminder_settings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Reminder settings update policy" ON public.reminder_settings
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Reminder settings delete policy" ON public.reminder_settings
  FOR DELETE TO authenticated USING (auth.uid() = user_id);


-- --- REMINDER LOG (With foreign key ownership verification) ---
DROP POLICY IF EXISTS "own reminders" ON public.reminder_log;
DROP POLICY IF EXISTS "Reminder log select policy" ON public.reminder_log;
DROP POLICY IF EXISTS "Reminder log insert policy" ON public.reminder_log;
DROP POLICY IF EXISTS "Reminder log update policy" ON public.reminder_log;
DROP POLICY IF EXISTS "Reminder log delete policy" ON public.reminder_log;

CREATE POLICY "Reminder log select policy" ON public.reminder_log
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Reminder log insert policy" ON public.reminder_log
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.policies p
      WHERE p.id = policy_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Reminder log update policy" ON public.reminder_log
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.policies p
      WHERE p.id = policy_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Reminder log delete policy" ON public.reminder_log
  FOR DELETE TO authenticated USING (auth.uid() = user_id);


-- --- NOTIFICATIONS ---
DROP POLICY IF EXISTS "own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Notifications select policy" ON public.notifications;
DROP POLICY IF EXISTS "Notifications insert policy" ON public.notifications;
DROP POLICY IF EXISTS "Notifications update policy" ON public.notifications;
DROP POLICY IF EXISTS "Notifications delete policy" ON public.notifications;

CREATE POLICY "Notifications select policy" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Notifications insert policy" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Notifications update policy" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Notifications delete policy" ON public.notifications
  FOR DELETE TO authenticated USING (auth.uid() = user_id);


-- --- WEBHOOK LOGS ---
DROP POLICY IF EXISTS "own webhook logs" ON public.webhook_logs;
DROP POLICY IF EXISTS "Webhook logs select policy" ON public.webhook_logs;
DROP POLICY IF EXISTS "Webhook logs insert policy" ON public.webhook_logs;
DROP POLICY IF EXISTS "Webhook logs update policy" ON public.webhook_logs;
DROP POLICY IF EXISTS "Webhook logs delete policy" ON public.webhook_logs;

CREATE POLICY "Webhook logs select policy" ON public.webhook_logs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Webhook logs insert policy" ON public.webhook_logs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Webhook logs update policy" ON public.webhook_logs
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Webhook logs delete policy" ON public.webhook_logs
  FOR DELETE TO authenticated USING (auth.uid() = user_id);


-- --- LEAD FOLLOWUP LOG (With foreign key ownership verification) ---
DROP POLICY IF EXISTS "own lead followups" ON public.lead_followup_log;
DROP POLICY IF EXISTS "Lead followup log select policy" ON public.lead_followup_log;
DROP POLICY IF EXISTS "Lead followup log insert policy" ON public.lead_followup_log;
DROP POLICY IF EXISTS "Lead followup log update policy" ON public.lead_followup_log;
DROP POLICY IF EXISTS "Lead followup log delete policy" ON public.lead_followup_log;

CREATE POLICY "Lead followup log select policy" ON public.lead_followup_log
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Lead followup log insert policy" ON public.lead_followup_log
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.leads l
      WHERE l.id = lead_id AND l.user_id = auth.uid()
    )
  );

CREATE POLICY "Lead followup log update policy" ON public.lead_followup_log
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.leads l
      WHERE l.id = lead_id AND l.user_id = auth.uid()
    )
  );

CREATE POLICY "Lead followup log delete policy" ON public.lead_followup_log
  FOR DELETE TO authenticated USING (auth.uid() = user_id);


-- -----------------------------------------------------------------------------
-- 5. FUNCTION SECURITY HARDENING (SET SEARCH_PATH & EXECUTE PERMISSIONS)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = pg_catalog, public;

REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.reminder_settings (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;

  INSERT INTO public.commission_rules (user_id, provider, default_rate) VALUES
    (NEW.id, 'Star Health', 15), (NEW.id, 'LIC', 25),
    (NEW.id, 'HDFC Ergo', 12), (NEW.id, 'ICICI Lombard', 12),
    (NEW.id, 'Bajaj Allianz', 12), (NEW.id, 'Tata AIG', 12),
    (NEW.id, 'Max Life', 20), (NEW.id, 'New India Assurance', 10)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END; $$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- -----------------------------------------------------------------------------
-- 6. STORAGE BUCKETS & STORAGE OBJECTS SECURITY HARDENING
-- -----------------------------------------------------------------------------

-- Ensure buckets exist and are set to public = false
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', false), ('policy-docs', 'policy-docs', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Re-create storage object policies with explicit WITH CHECK on UPDATE policies
DROP POLICY IF EXISTS "avatars own read" ON storage.objects;
DROP POLICY IF EXISTS "avatars own insert" ON storage.objects;
DROP POLICY IF EXISTS "avatars own update" ON storage.objects;
DROP POLICY IF EXISTS "avatars own delete" ON storage.objects;

CREATE POLICY "avatars own read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars own insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars own update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars own delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "docs own read" ON storage.objects;
DROP POLICY IF EXISTS "docs own insert" ON storage.objects;
DROP POLICY IF EXISTS "docs own update" ON storage.objects;
DROP POLICY IF EXISTS "docs own delete" ON storage.objects;

CREATE POLICY "docs own read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'policy-docs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "docs own insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'policy-docs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "docs own update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'policy-docs' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'policy-docs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "docs own delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'policy-docs' AND (storage.foldername(name))[1] = auth.uid()::text);
