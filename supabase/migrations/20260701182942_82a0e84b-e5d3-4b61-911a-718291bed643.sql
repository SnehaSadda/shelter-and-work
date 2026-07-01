
-- 1. profiles: authenticated-only SELECT
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles viewable by authenticated"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- 2. jobs: authenticated-only SELECT
DROP POLICY IF EXISTS "Jobs viewable by everyone" ON public.jobs;
CREATE POLICY "Jobs viewable by authenticated"
  ON public.jobs FOR SELECT
  TO authenticated
  USING (true);

-- 3. user_roles: prevent privilege escalation on self-insert
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;
CREATE POLICY "Users can insert own user role only"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND role = 'user'::app_role);

-- 4. Replace has_role() usages with inline EXISTS so we can revoke EXECUTE
DROP POLICY IF EXISTS "NGOs can create resources" ON public.resources;
CREATE POLICY "NGOs can create resources"
  ON public.resources FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = owner_id
    AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'ngo'::app_role)
  );

DROP POLICY IF EXISTS "NGOs can create posts" ON public.feed_posts;
CREATE POLICY "NGOs can create posts"
  ON public.feed_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'ngo'::app_role)
  );

DROP POLICY IF EXISTS "Employers can create jobs" ON public.jobs;
CREATE POLICY "Employers can create jobs"
  ON public.jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = employer_id
    AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'employer'::app_role)
  );

DROP POLICY IF EXISTS "Alerts viewable by NGOs and owner" ON public.sos_alerts;
CREATE POLICY "Alerts viewable by NGOs and owner"
  ON public.sos_alerts FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'ngo'::app_role)
  );

DROP POLICY IF EXISTS "Owner or NGO updates alerts" ON public.sos_alerts;
CREATE POLICY "Owner or NGO updates alerts"
  ON public.sos_alerts FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'ngo'::app_role)
  );

-- 5. Revoke EXECUTE on the SECURITY DEFINER helper from signed-in users
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
