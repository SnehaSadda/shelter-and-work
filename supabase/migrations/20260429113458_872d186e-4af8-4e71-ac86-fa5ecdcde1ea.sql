
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('user', 'ngo', 'employer');
CREATE TYPE public.resource_type AS ENUM ('shelter', 'food', 'medical', 'clothing');
CREATE TYPE public.resource_status AS ENUM ('available', 'full', 'closed');
CREATE TYPE public.job_type AS ENUM ('daily', 'short-term', 'part-time', 'full-time');
CREATE TYPE public.application_status AS ENUM ('pending', 'accepted', 'rejected');

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  phone TEXT,
  org_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer to avoid recursive RLS
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Roles viewable by everyone" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "Users can insert own role" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============ AUTO-CREATE PROFILE + ROLE ON SIGNUP ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _role app_role;
BEGIN
  INSERT INTO public.profiles (id, name, phone, org_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'name',
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'org_name'
  );

  _role := COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'user'::app_role);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ updated_at helper ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ RESOURCES ============
CREATE TABLE public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type resource_type NOT NULL,
  status resource_status NOT NULL DEFAULT 'available',
  address TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  hours TEXT,
  capacity TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
CREATE INDEX resources_type_idx ON public.resources(type);
CREATE INDEX resources_owner_idx ON public.resources(owner_id);

CREATE POLICY "Resources viewable by everyone" ON public.resources FOR SELECT USING (true);
CREATE POLICY "NGOs can create resources" ON public.resources FOR INSERT
  WITH CHECK (auth.uid() = owner_id AND public.has_role(auth.uid(), 'ngo'));
CREATE POLICY "Owners can update resources" ON public.resources FOR UPDATE
  USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete resources" ON public.resources FOR DELETE
  USING (auth.uid() = owner_id);

CREATE TRIGGER resources_updated_at BEFORE UPDATE ON public.resources
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ FEED POSTS ============
CREATE TABLE public.feed_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;
CREATE INDEX feed_posts_created_idx ON public.feed_posts(created_at DESC);

CREATE POLICY "Feed viewable by everyone" ON public.feed_posts FOR SELECT USING (true);
CREATE POLICY "NGOs can create posts" ON public.feed_posts FOR INSERT
  WITH CHECK (auth.uid() = author_id AND public.has_role(auth.uid(), 'ngo'));
CREATE POLICY "Authors can update posts" ON public.feed_posts FOR UPDATE
  USING (auth.uid() = author_id);
CREATE POLICY "Authors can delete posts" ON public.feed_posts FOR DELETE
  USING (auth.uid() = author_id);

CREATE TRIGGER feed_posts_updated_at BEFORE UPDATE ON public.feed_posts
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ POST HELPFUL VOTES ============
CREATE TABLE public.post_helpful (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);
ALTER TABLE public.post_helpful ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Votes viewable by everyone" ON public.post_helpful FOR SELECT USING (true);
CREATE POLICY "Users vote as themselves" ON public.post_helpful FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users remove own votes" ON public.post_helpful FOR DELETE
  USING (auth.uid() = user_id);

-- ============ JOBS ============
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  org TEXT NOT NULL,
  type job_type NOT NULL DEFAULT 'daily',
  location TEXT NOT NULL,
  pay TEXT NOT NULL,
  contact TEXT NOT NULL,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE INDEX jobs_active_idx ON public.jobs(active, created_at DESC);
CREATE INDEX jobs_employer_idx ON public.jobs(employer_id);

CREATE POLICY "Jobs viewable by everyone" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Employers can create jobs" ON public.jobs FOR INSERT
  WITH CHECK (auth.uid() = employer_id AND public.has_role(auth.uid(), 'employer'));
CREATE POLICY "Employers update own jobs" ON public.jobs FOR UPDATE
  USING (auth.uid() = employer_id);
CREATE POLICY "Employers delete own jobs" ON public.jobs FOR DELETE
  USING (auth.uid() = employer_id);

CREATE TRIGGER jobs_updated_at BEFORE UPDATE ON public.jobs
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ JOB APPLICATIONS ============
CREATE TABLE public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT,
  status application_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (job_id, applicant_id)
);
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
CREATE INDEX job_apps_job_idx ON public.job_applications(job_id);
CREATE INDEX job_apps_applicant_idx ON public.job_applications(applicant_id);

CREATE POLICY "Applicants see own applications" ON public.job_applications FOR SELECT
  USING (auth.uid() = applicant_id
    OR EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.employer_id = auth.uid()));
CREATE POLICY "Users apply as themselves" ON public.job_applications FOR INSERT
  WITH CHECK (auth.uid() = applicant_id);
CREATE POLICY "Applicants update own application" ON public.job_applications FOR UPDATE
  USING (auth.uid() = applicant_id
    OR EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.employer_id = auth.uid()));
CREATE POLICY "Applicants delete own application" ON public.job_applications FOR DELETE
  USING (auth.uid() = applicant_id);
