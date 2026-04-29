-- SOS alerts table
CREATE TABLE public.sos_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  latitude numeric,
  longitude numeric,
  message text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE public.sos_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users create own alerts" ON public.sos_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Alerts viewable by NGOs and owner" ON public.sos_alerts
  FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'ngo'::app_role));

CREATE POLICY "Owner or NGO updates alerts" ON public.sos_alerts
  FOR UPDATE USING (auth.uid() = user_id OR has_role(auth.uid(), 'ngo'::app_role));

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.sos_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.feed_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.resources;

-- Verified badge column on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- Impact view: counts of contributions per user
CREATE OR REPLACE VIEW public.user_impact AS
SELECT
  p.id AS user_id,
  p.name,
  p.org_name,
  p.verified,
  COALESCE((SELECT count(*) FROM public.feed_posts WHERE author_id = p.id), 0) AS posts_count,
  COALESCE((SELECT count(*) FROM public.resources WHERE owner_id = p.id), 0) AS resources_count,
  COALESCE((SELECT count(*) FROM public.jobs WHERE employer_id = p.id), 0) AS jobs_count,
  COALESCE((SELECT count(*) FROM public.post_helpful ph JOIN public.feed_posts fp ON fp.id = ph.post_id WHERE fp.author_id = p.id), 0) AS helpful_received
FROM public.profiles p;

GRANT SELECT ON public.user_impact TO anon, authenticated;