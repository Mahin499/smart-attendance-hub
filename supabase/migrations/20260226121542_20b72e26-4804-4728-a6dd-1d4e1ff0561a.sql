
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('principal', 'faculty');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create registration_codes table
CREATE TABLE public.registration_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.registration_codes ENABLE ROW LEVEL SECURITY;

-- Create students table
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  reg_no TEXT NOT NULL UNIQUE,
  class TEXT NOT NULL,
  photo_url TEXT,
  faculty_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Create period_config table
CREATE TABLE public.period_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_number INT NOT NULL UNIQUE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_free BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.period_config ENABLE ROW LEVEL SECURITY;

-- Create attendance_records table
CREATE TABLE public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  period_number INT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'sleepy', 'talking', 'not-attentive')),
  recorded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, date, period_number)
);
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Principals can read all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'principal'));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can read own role" ON public.user_roles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Principals can read all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'principal'));
CREATE POLICY "Principals can insert faculty roles" ON public.user_roles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'principal'));
CREATE POLICY "Principals can delete roles" ON public.user_roles FOR DELETE USING (public.has_role(auth.uid(), 'principal'));

-- RLS Policies for registration_codes
CREATE POLICY "Principals can manage codes" ON public.registration_codes FOR ALL USING (public.has_role(auth.uid(), 'principal'));
CREATE POLICY "Authenticated can read active codes" ON public.registration_codes FOR SELECT TO authenticated USING (is_active = true);

-- RLS Policies for students
CREATE POLICY "Faculty can manage own students" ON public.students FOR ALL USING (faculty_id = auth.uid());
CREATE POLICY "Principals can read all students" ON public.students FOR SELECT USING (public.has_role(auth.uid(), 'principal'));

-- RLS Policies for period_config
CREATE POLICY "Authenticated can read periods" ON public.period_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "Principals can manage periods" ON public.period_config FOR ALL USING (public.has_role(auth.uid(), 'principal'));

-- RLS Policies for attendance_records
CREATE POLICY "Faculty can manage own attendance" ON public.attendance_records FOR ALL USING (recorded_by = auth.uid());
CREATE POLICY "Principals can read all attendance" ON public.attendance_records FOR SELECT USING (public.has_role(auth.uid(), 'principal'));

-- Storage bucket for student photos
INSERT INTO storage.buckets (id, name, public) VALUES ('student-photos', 'student-photos', true);

CREATE POLICY "Faculty can upload student photos" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'student-photos');

CREATE POLICY "Anyone can view student photos" ON storage.objects FOR SELECT
USING (bucket_id = 'student-photos');

-- Seed default period config
INSERT INTO public.period_config (period_number, start_time, end_time, is_free) VALUES
(1, '09:00', '09:50', false),
(2, '09:50', '10:40', false),
(3, '10:50', '11:40', false),
(4, '11:40', '12:30', false),
(5, '13:15', '14:05', false),
(6, '14:05', '14:55', false),
(7, '15:05', '15:55', false),
(8, '15:55', '16:45', true);
