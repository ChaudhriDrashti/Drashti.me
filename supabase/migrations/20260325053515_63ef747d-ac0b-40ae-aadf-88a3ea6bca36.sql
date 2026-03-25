
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'editor');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS for user_roles
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

-- Projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  tools TEXT[] DEFAULT '{}',
  repo_link TEXT,
  live_link TEXT,
  featured BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Projects viewable by everyone" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Admins manage projects" ON public.projects FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Experience table
CREATE TABLE public.experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  location TEXT,
  details TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.experience ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Experience viewable by everyone" ON public.experience FOR SELECT USING (true);
CREATE POLICY "Admins manage experience" ON public.experience FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE TRIGGER update_experience_updated_at BEFORE UPDATE ON public.experience FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Education table
CREATE TABLE public.education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  start_year INT,
  end_year INT,
  gpa TEXT,
  details TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Education viewable by everyone" ON public.education FOR SELECT USING (true);
CREATE POLICY "Admins manage education" ON public.education FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE TRIGGER update_education_updated_at BEFORE UPDATE ON public.education FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Skills table
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  proficiency INT DEFAULT 0,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Skills viewable by everyone" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Admins manage skills" ON public.skills FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

-- Certifications table
CREATE TABLE public.certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  issuer TEXT,
  date DATE,
  credential_link TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Certifications viewable by everyone" ON public.certifications FOR SELECT USING (true);
CREATE POLICY "Admins manage certifications" ON public.certifications FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE TRIGGER update_certifications_updated_at BEFORE UPDATE ON public.certifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Blog posts table
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  tags TEXT[] DEFAULT '{}',
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published posts viewable by everyone" ON public.blog_posts FOR SELECT USING (published = true OR (auth.uid() IS NOT NULL AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))));
CREATE POLICY "Admins manage posts" ON public.blog_posts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Contact messages table
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit contact message" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view messages" ON public.contact_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update messages" ON public.contact_messages FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete messages" ON public.contact_messages FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Site settings table
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings viewable by everyone" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage settings" ON public.site_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', true);

-- Storage policies
CREATE POLICY "Media publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Admins upload media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Resumes publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'resumes');
CREATE POLICY "Admins upload resumes" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'resumes' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update resumes" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'resumes' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete resumes" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'resumes' AND public.has_role(auth.uid(), 'admin'));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
