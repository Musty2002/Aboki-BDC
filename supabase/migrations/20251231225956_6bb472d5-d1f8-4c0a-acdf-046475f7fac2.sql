
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'branch_admin');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create currencies master table
CREATE TABLE public.currencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  flag_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;

-- Create cities table
CREATE TABLE public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

-- Create branches table
CREATE TABLE public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES public.cities(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  whatsapp_number TEXT,
  operating_hours TEXT NOT NULL DEFAULT '8:00 AM - 5:00 PM',
  rating NUMERIC(2,1) NOT NULL DEFAULT 4.0,
  review_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- Create branch_rates table
CREATE TABLE public.branch_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE NOT NULL,
  currency_id UUID REFERENCES public.currencies(id) ON DELETE CASCADE NOT NULL,
  denomination TEXT,
  buy_rate NUMERIC(12,2) NOT NULL,
  sell_rate NUMERIC(12,2) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE (branch_id, currency_id, denomination)
);

ALTER TABLE public.branch_rates ENABLE ROW LEVEL SECURITY;

-- Create branch_admins assignment table
CREATE TABLE public.branch_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE (user_id, branch_id)
);

ALTER TABLE public.branch_admins ENABLE ROW LEVEL SECURITY;

-- Create notification_logs table
CREATE TABLE public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  target_type TEXT NOT NULL DEFAULT 'all',
  target_city_id UUID REFERENCES public.cities(id),
  sent_count INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  failure_count INTEGER NOT NULL DEFAULT 0,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Function to check if user is branch admin for a specific branch
CREATE OR REPLACE FUNCTION public.is_branch_admin(_user_id UUID, _branch_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.branch_admins
    WHERE user_id = _user_id
      AND branch_id = _branch_id
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for currencies (public read, admin write)
CREATE POLICY "Anyone can view active currencies" ON public.currencies
  FOR SELECT USING (is_active = true);

CREATE POLICY "Super admins can manage currencies" ON public.currencies
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for cities (public read, admin write)
CREATE POLICY "Anyone can view active cities" ON public.cities
  FOR SELECT USING (is_active = true);

CREATE POLICY "Super admins can manage cities" ON public.cities
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for branches (public read, admin write)
CREATE POLICY "Anyone can view active branches" ON public.branches
  FOR SELECT USING (is_active = true);

CREATE POLICY "Super admins can manage all branches" ON public.branches
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for branch_rates (public read, admin/branch admin write)
CREATE POLICY "Anyone can view branch rates" ON public.branch_rates
  FOR SELECT USING (true);

CREATE POLICY "Super admins can manage all rates" ON public.branch_rates
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Branch admins can manage their branch rates" ON public.branch_rates
  FOR ALL TO authenticated
  USING (public.is_branch_admin(auth.uid(), branch_id))
  WITH CHECK (public.is_branch_admin(auth.uid(), branch_id));

-- RLS Policies for branch_admins
CREATE POLICY "Super admins can manage branch admins" ON public.branch_admins
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can view own branch assignments" ON public.branch_admins
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for notification_logs
CREATE POLICY "Super admins can manage notifications" ON public.notification_logs
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_branches_updated_at
  BEFORE UPDATE ON public.branches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_branch_rates_updated_at
  BEFORE UPDATE ON public.branch_rates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed currencies with flag URLs
INSERT INTO public.currencies (code, name, flag_url) VALUES
  ('USD', 'US Dollar', 'https://flagcdn.com/w40/us.png'),
  ('EUR', 'Euro', 'https://flagcdn.com/w40/eu.png'),
  ('GBP', 'British Pound', 'https://flagcdn.com/w40/gb.png'),
  ('CAD', 'Canadian Dollar', 'https://flagcdn.com/w40/ca.png'),
  ('AED', 'UAE Dirham', 'https://flagcdn.com/w40/ae.png'),
  ('CHF', 'Swiss Franc', 'https://flagcdn.com/w40/ch.png'),
  ('CNY', 'Chinese Yuan', 'https://flagcdn.com/w40/cn.png'),
  ('SAR', 'Saudi Riyal', 'https://flagcdn.com/w40/sa.png'),
  ('AUD', 'Australian Dollar', 'https://flagcdn.com/w40/au.png'),
  ('JPY', 'Japanese Yen', 'https://flagcdn.com/w40/jp.png'),
  ('INR', 'Indian Rupee', 'https://flagcdn.com/w40/in.png'),
  ('ZAR', 'South African Rand', 'https://flagcdn.com/w40/za.png'),
  ('GHS', 'Ghanaian Cedi', 'https://flagcdn.com/w40/gh.png'),
  ('KES', 'Kenyan Shilling', 'https://flagcdn.com/w40/ke.png'),
  ('XOF', 'West African CFA', 'https://flagcdn.com/w40/sn.png');

-- Seed cities from existing data
INSERT INTO public.cities (name) VALUES
  ('Lagos'),
  ('Abuja'),
  ('Port Harcourt'),
  ('Kano');
