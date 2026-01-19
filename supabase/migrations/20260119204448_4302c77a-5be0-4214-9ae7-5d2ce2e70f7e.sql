-- Create an enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table to store user roles securely
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can only read their own roles
CREATE POLICY "Users can view own roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Only admins can manage roles (we'll handle initial admin setup separately)
CREATE POLICY "Admins can manage roles" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create a security definer function to check roles without RLS recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
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

-- Drop existing public write policies on settings table
DROP POLICY IF EXISTS "Allow public insert on settings" ON public.settings;
DROP POLICY IF EXISTS "Allow public update on settings" ON public.settings;

-- Add admin-only policies for settings table
CREATE POLICY "Admin only insert on settings" 
ON public.settings 
FOR INSERT 
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin only update on settings" 
ON public.settings 
FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Drop existing public write policies on sports table
DROP POLICY IF EXISTS "Allow public insert on sports" ON public.sports;
DROP POLICY IF EXISTS "Allow public update on sports" ON public.sports;
DROP POLICY IF EXISTS "Allow public delete on sports" ON public.sports;

-- Add admin-only policies for sports table
CREATE POLICY "Admin only insert on sports" 
ON public.sports 
FOR INSERT 
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin only update on sports" 
ON public.sports 
FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin only delete on sports" 
ON public.sports 
FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Drop existing public write policies on matches table
DROP POLICY IF EXISTS "Allow public insert on matches" ON public.matches;
DROP POLICY IF EXISTS "Allow public update on matches" ON public.matches;
DROP POLICY IF EXISTS "Allow public delete on matches" ON public.matches;

-- Add admin-only policies for matches table
CREATE POLICY "Admin only insert on matches" 
ON public.matches 
FOR INSERT 
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin only update on matches" 
ON public.matches 
FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin only delete on matches" 
ON public.matches 
FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Drop existing public write policies on groups table
DROP POLICY IF EXISTS "Allow public insert on groups" ON public.groups;
DROP POLICY IF EXISTS "Allow public update on groups" ON public.groups;
DROP POLICY IF EXISTS "Allow public delete on groups" ON public.groups;

-- Add admin-only policies for groups table
CREATE POLICY "Admin only insert on groups" 
ON public.groups 
FOR INSERT 
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin only update on groups" 
ON public.groups 
FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin only delete on groups" 
ON public.groups 
FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Drop existing public write policies on teams table
DROP POLICY IF EXISTS "Allow public insert on teams" ON public.teams;
DROP POLICY IF EXISTS "Allow public update on teams" ON public.teams;
DROP POLICY IF EXISTS "Allow public delete on teams" ON public.teams;

-- Add admin-only policies for teams table
CREATE POLICY "Admin only insert on teams" 
ON public.teams 
FOR INSERT 
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin only update on teams" 
ON public.teams 
FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin only delete on teams" 
ON public.teams 
FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));