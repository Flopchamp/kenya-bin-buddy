-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'driver', 'citizen');

-- Create enum for bin status
CREATE TYPE public.bin_status AS ENUM ('empty', 'half', 'full', 'overflow');

-- Create enum for collection status
CREATE TYPE public.collection_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create bins table
CREATE TABLE public.bins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bin_code TEXT UNIQUE NOT NULL,
  location_name TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  fill_level INTEGER DEFAULT 0 CHECK (fill_level >= 0 AND fill_level <= 100),
  status bin_status DEFAULT 'empty',
  last_collection TIMESTAMPTZ,
  next_scheduled_collection TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trucks table
CREATE TABLE public.trucks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  truck_number TEXT UNIQUE NOT NULL,
  driver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  current_latitude DECIMAL(10, 8),
  current_longitude DECIMAL(11, 8),
  capacity INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create collection_schedules table
CREATE TABLE public.collection_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  truck_id UUID REFERENCES public.trucks(id) ON DELETE CASCADE NOT NULL,
  bin_id UUID REFERENCES public.bins(id) ON DELETE CASCADE NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  status collection_status DEFAULT 'pending',
  collected_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create citizen_reports table
CREATE TABLE public.citizen_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bin_id UUID REFERENCES public.bins(id) ON DELETE SET NULL,
  report_type TEXT NOT NULL,
  description TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  status TEXT DEFAULT 'open',
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizen_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Anyone can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for bins
CREATE POLICY "Everyone can view bins"
  ON public.bins FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage bins"
  ON public.bins FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Drivers can update bins"
  ON public.bins FOR UPDATE
  USING (public.has_role(auth.uid(), 'driver'));

-- RLS Policies for trucks
CREATE POLICY "Everyone can view active trucks"
  ON public.trucks FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage trucks"
  ON public.trucks FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Drivers can update their truck"
  ON public.trucks FOR UPDATE
  USING (auth.uid() = driver_id);

-- RLS Policies for collection_schedules
CREATE POLICY "Everyone can view schedules"
  ON public.collection_schedules FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage schedules"
  ON public.collection_schedules FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Drivers can update assigned schedules"
  ON public.collection_schedules FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.trucks
      WHERE trucks.id = collection_schedules.truck_id
      AND trucks.driver_id = auth.uid()
    )
  );

-- RLS Policies for citizen_reports
CREATE POLICY "Citizens can view own reports"
  ON public.citizen_reports FOR SELECT
  USING (auth.uid() = citizen_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Citizens can create reports"
  ON public.citizen_reports FOR INSERT
  WITH CHECK (auth.uid() = citizen_id);

CREATE POLICY "Admins can manage all reports"
  ON public.citizen_reports FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_bins_updated_at
  BEFORE UPDATE ON public.bins
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_trucks_updated_at
  BEFORE UPDATE ON public.trucks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_collection_schedules_updated_at
  BEFORE UPDATE ON public.collection_schedules
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_citizen_reports_updated_at
  BEFORE UPDATE ON public.citizen_reports
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.raw_user_meta_data->>'phone'
  );
  
  -- Assign default citizen role to new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'citizen');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for bins (for live status updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.bins;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trucks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.collection_schedules;