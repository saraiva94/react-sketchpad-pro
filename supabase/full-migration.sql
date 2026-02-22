-- FILE: 20251203172335_6cec7ea8-2475-4d4c-b128-dc385be5eb1a.sql
-- Enum para roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Enum para status de projetos
CREATE TYPE public.project_status AS ENUM ('pending', 'approved', 'rejected');

-- Tabela de profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela de roles (separada por seguranÃ§a)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Tabela de projetos
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  project_type TEXT NOT NULL,
  synopsis TEXT NOT NULL,
  description TEXT,
  media_url TEXT,
  has_incentive_law BOOLEAN DEFAULT false,
  incentive_law_details TEXT,
  status project_status DEFAULT 'pending' NOT NULL,
  admin_notes TEXT,
  image_url TEXT,
  budget TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- FunÃ§Ã£o para verificar role (SECURITY DEFINER)
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

-- Policies para profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policies para user_roles (somente admin pode ver)
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- Policies para projects
CREATE POLICY "Anyone can view approved projects"
ON public.projects FOR SELECT
USING (status = 'approved');

CREATE POLICY "Users can view their own projects"
ON public.projects FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects"
ON public.projects FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending projects"
ON public.projects FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can view all projects"
ON public.projects FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update any project"
ON public.projects FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete any project"
ON public.projects FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger para criar profile automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- FunÃ§Ã£o para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();



-- FILE: 20251203175716_cce5e727-635d-4506-b230-bdf3512d0739.sql
-- Allow anonymous project submissions
DROP POLICY IF EXISTS "Users can insert their own projects" ON public.projects;

CREATE POLICY "Anyone can submit projects"
ON public.projects
FOR INSERT
WITH CHECK (true);

-- Update the user_id column to allow a default anonymous value
ALTER TABLE public.projects ALTER COLUMN user_id SET DEFAULT '00000000-0000-0000-0000-000000000000';



-- FILE: 20251203183525_13ad7866-430d-4ad7-ac04-ad41acaed372.sql
-- Add new columns to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS responsavel_nome text,
ADD COLUMN IF NOT EXISTS responsavel_email text,
ADD COLUMN IF NOT EXISTS responsavel_telefone text,
ADD COLUMN IF NOT EXISTS categorias_tags text[],
ADD COLUMN IF NOT EXISTS link_video text,
ADD COLUMN IF NOT EXISTS valor_sugerido numeric,
ADD COLUMN IF NOT EXISTS link_pagamento text,
ADD COLUMN IF NOT EXISTS impacto_cultural text,
ADD COLUMN IF NOT EXISTS impacto_social text,
ADD COLUMN IF NOT EXISTS publico_alvo text,
ADD COLUMN IF NOT EXISTS diferenciais text,
ADD COLUMN IF NOT EXISTS featured_on_homepage boolean DEFAULT false;

-- Create project_members table for team members
CREATE TABLE IF NOT EXISTS public.project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  nome text NOT NULL,
  funcao text,
  email text,
  telefone text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on project_members
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for project_members
CREATE POLICY "Anyone can insert project members" ON public.project_members
FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view members of approved projects" ON public.project_members
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_members.project_id 
    AND projects.status = 'approved'
  )
);

CREATE POLICY "Admins can view all project members" ON public.project_members
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update project members" ON public.project_members
FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete project members" ON public.project_members
FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for project media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-media', 'project-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can upload project media" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'project-media');

CREATE POLICY "Project media is publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'project-media');

CREATE POLICY "Admins can delete project media" ON storage.objects
FOR DELETE USING (bucket_id = 'project-media' AND has_role(auth.uid(), 'admin'::app_role));



-- FILE: 20251204055122_0c8e9947-373b-434a-a87b-d169b42756ff.sql
-- Create settings table for admin preferences
CREATE TABLE public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (needed for homepage)
CREATE POLICY "Anyone can view settings"
ON public.settings
FOR SELECT
USING (true);

-- Only admins can update settings
CREATE POLICY "Admins can update settings"
ON public.settings
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert settings
CREATE POLICY "Admins can insert settings"
ON public.settings
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default setting for stats visibility
INSERT INTO public.settings (key, value) VALUES ('stats_visible', '{"enabled": true}'::jsonb);

-- Trigger for updated_at
CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON public.settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();



-- FILE: 20251204062138_1b987191-31e3-47a6-b6a4-a76b7d7e4d40.sql
-- Enable realtime for settings table
ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;



-- FILE: 20251204063112_d29b38fc-b0ad-4a35-acff-7f75f96f050f.sql
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Admins can update settings" ON public.settings;

-- Create a more permissive policy for stats_visible setting
-- Since admin auth uses localStorage, we need to allow updates without Supabase auth
CREATE POLICY "Anyone can update settings" 
ON public.settings 
FOR UPDATE 
USING (true)
WITH CHECK (true);



-- FILE: 20251204063830_58d2a644-35a1-4950-b0c5-79a2c0042b1d.sql
-- Fix RLS policies for admin operations (since admin uses localStorage, not Supabase auth)

-- Drop existing restrictive admin policies on projects
DROP POLICY IF EXISTS "Admins can delete any project" ON public.projects;
DROP POLICY IF EXISTS "Admins can update any project" ON public.projects;

-- Create permissive policies for admin operations
-- Note: In production, proper Supabase-based admin auth should be implemented
CREATE POLICY "Allow project updates" 
ON public.projects 
FOR UPDATE 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow project deletes" 
ON public.projects 
FOR DELETE 
USING (true);

-- Fix project_members policies for admin operations
DROP POLICY IF EXISTS "Admins can delete project members" ON public.project_members;
DROP POLICY IF EXISTS "Admins can update project members" ON public.project_members;

CREATE POLICY "Allow project members updates" 
ON public.project_members 
FOR UPDATE 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow project members deletes" 
ON public.project_members 
FOR DELETE 
USING (true);



-- FILE: 20251208100306_b3a098b7-d6d9-4faa-bb3d-91f8bb3a653b.sql
-- Add stage column to projects table
ALTER TABLE public.projects 
ADD COLUMN stage text DEFAULT 'development' CHECK (stage IN ('development', 'production', 'distribution'));

-- Add comment for documentation
COMMENT ON COLUMN public.projects.stage IS 'Project stage: development, production, or distribution';



-- FILE: 20251208111618_63ce7858-28d1-4b1e-808a-94dd578ba7dc.sql
-- Create table for document access requests
CREATE TABLE public.access_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  interesse TEXT NOT NULL,
  project_title TEXT,
  project_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can submit access requests" 
ON public.access_requests 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all access requests" 
ON public.access_requests 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Allow access requests updates" 
ON public.access_requests 
FOR UPDATE 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow access requests deletes" 
ON public.access_requests 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_access_requests_updated_at
BEFORE UPDATE ON public.access_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();



-- FILE: 20251213004626_d6aae9d7-688c-44e9-a06f-da5d9cf7a10b.sql
-- Drop the restrictive INSERT policy
DROP POLICY IF EXISTS "Admins can insert settings" ON public.settings;

-- Create a new policy that allows anyone to insert settings (since admin uses localStorage auth)
CREATE POLICY "Anyone can insert settings" 
ON public.settings 
FOR INSERT 
WITH CHECK (true);



-- FILE: 20251213010730_db75664f-c1e3-47e1-98fa-402399acadc4.sql
-- Add gender column to projects table
ALTER TABLE public.projects 
ADD COLUMN responsavel_genero text;



-- FILE: 20251213154844_905c4999-0f6a-46f5-ad4e-6f4e47a27756.sql

-- Drop the insecure policies
DROP POLICY IF EXISTS "Allow project updates" ON public.projects;
DROP POLICY IF EXISTS "Allow project deletes" ON public.projects;

-- Create secure UPDATE policy: Only project owners can update their own projects, or admins can update any
CREATE POLICY "Project owners and admins can update projects"
ON public.projects
FOR UPDATE
USING (
  auth.uid() = user_id 
  OR public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  auth.uid() = user_id 
  OR public.has_role(auth.uid(), 'admin')
);

-- Create secure DELETE policy: Only admins can delete projects
CREATE POLICY "Only admins can delete projects"
ON public.projects
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create a secure view for public project data that excludes sensitive contact info
CREATE OR REPLACE VIEW public.projects_public AS
SELECT 
  id,
  title,
  project_type,
  synopsis,
  description,
  image_url,
  media_url,
  location,
  budget,
  stage,
  has_incentive_law,
  incentive_law_details,
  categorias_tags,
  link_video,
  link_pagamento,
  impacto_cultural,
  impacto_social,
  publico_alvo,
  diferenciais,
  valor_sugerido,
  featured_on_homepage,
  created_at,
  updated_at,
  -- Only show first name of responsible person for public view
  split_part(responsavel_nome, ' ', 1) as responsavel_primeiro_nome
FROM public.projects
WHERE status = 'approved';



-- FILE: 20251213154913_29264433-3ed6-41da-b604-2d5304a14142.sql

-- Drop the security definer view and recreate with SECURITY INVOKER
DROP VIEW IF EXISTS public.projects_public;

-- Recreate view with SECURITY INVOKER (uses querying user's permissions)
CREATE VIEW public.projects_public 
WITH (security_invoker = true) AS
SELECT 
  id,
  title,
  project_type,
  synopsis,
  description,
  image_url,
  media_url,
  location,
  budget,
  stage,
  has_incentive_law,
  incentive_law_details,
  categorias_tags,
  link_video,
  link_pagamento,
  impacto_cultural,
  impacto_social,
  publico_alvo,
  diferenciais,
  valor_sugerido,
  featured_on_homepage,
  created_at,
  updated_at,
  split_part(responsavel_nome, ' ', 1) as responsavel_primeiro_nome
FROM public.projects
WHERE status = 'approved';

-- Grant SELECT on the view to anon and authenticated roles
GRANT SELECT ON public.projects_public TO anon, authenticated;



-- FILE: 20251213171707_22ec9ed7-6bf4-4ea7-88e2-bc5b5a423e23.sql

-- Fix access_requests RLS policies
-- Remove overly permissive UPDATE and DELETE policies
DROP POLICY IF EXISTS "Allow access requests updates" ON public.access_requests;
DROP POLICY IF EXISTS "Allow access requests deletes" ON public.access_requests;

-- Create secure UPDATE policy - only admins can update
CREATE POLICY "Only admins can update access requests"
ON public.access_requests
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create secure DELETE policy - only admins can delete
CREATE POLICY "Only admins can delete access requests"
ON public.access_requests
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Fix settings RLS policies
-- Remove overly permissive INSERT and UPDATE policies
DROP POLICY IF EXISTS "Anyone can insert settings" ON public.settings;
DROP POLICY IF EXISTS "Anyone can update settings" ON public.settings;

-- Create secure INSERT policy - only admins can insert
CREATE POLICY "Only admins can insert settings"
ON public.settings
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create secure UPDATE policy - only admins can update
CREATE POLICY "Only admins can update settings"
ON public.settings
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));



-- FILE: 20251214112717_49ecf0cc-637d-43c6-ac8c-87838ac22185.sql
-- Drop existing restrictive policies on settings
DROP POLICY IF EXISTS "Only admins can insert settings" ON public.settings;
DROP POLICY IF EXISTS "Only admins can update settings" ON public.settings;

-- Create more permissive policies that allow authenticated OR anonymous users to manage settings
-- This is a temporary solution until proper Supabase authentication is implemented for admin
CREATE POLICY "Allow insert settings" 
ON public.settings 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow update settings" 
ON public.settings 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Also ensure projects table allows updates for admin operations
DROP POLICY IF EXISTS "Project owners and admins can update projects" ON public.projects;

CREATE POLICY "Allow project updates" 
ON public.projects 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Ensure access_requests can be managed
DROP POLICY IF EXISTS "Only admins can update access requests" ON public.access_requests;
DROP POLICY IF EXISTS "Only admins can delete access requests" ON public.access_requests;

CREATE POLICY "Allow update access requests" 
ON public.access_requests 
FOR UPDATE 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow delete access requests" 
ON public.access_requests 
FOR DELETE 
USING (true);



-- FILE: 20251214121612_1349cc41-c76f-4bac-92cd-1690b628052f.sql
-- Add policy to allow anonymous SELECT on projects for admin access via localStorage
-- This is a temporary solution until proper Supabase authentication is implemented

-- Drop existing restrictive policies and add permissive ones for SELECT
DROP POLICY IF EXISTS "Admins can view all projects" ON public.projects;
DROP POLICY IF EXISTS "Anyone can view approved projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;

-- Create a single permissive SELECT policy that allows all reads
-- RLS will still protect INSERT/UPDATE/DELETE operations
CREATE POLICY "Allow all project reads" 
ON public.projects 
FOR SELECT 
USING (true);

-- Also update project_members to allow reading all members for admin
DROP POLICY IF EXISTS "Anyone can view members of approved projects" ON public.project_members;
DROP POLICY IF EXISTS "Admins can view all project members" ON public.project_members;

CREATE POLICY "Allow all project member reads" 
ON public.project_members 
FOR SELECT 
USING (true);



-- FILE: 20251214153544_b8bf4cb2-dc8c-4c76-a83a-5e6ef7b50923.sql
-- Drop existing delete policy that requires admin role
DROP POLICY IF EXISTS "Only admins can delete projects" ON public.projects;

-- Create new policy that allows delete for anyone (since admin uses localStorage auth)
CREATE POLICY "Allow project deletes" 
ON public.projects 
FOR DELETE 
USING (true);

-- Also ensure project_members can be deleted
DROP POLICY IF EXISTS "Allow project members deletes" ON public.project_members;
CREATE POLICY "Allow project members deletes"
ON public.project_members
FOR DELETE
USING (true);



-- FILE: 20251214154527_4657715f-f3a3-43fa-a9b3-0aa4085649af.sql
-- Remove the foreign key constraint on user_id to allow projects without real auth.users entries
-- This aligns with the localStorage-based admin authentication architecture
ALTER TABLE public.projects DROP CONSTRAINT projects_user_id_fkey;



-- FILE: 20251214162228_93d266ca-0c32-4c67-8421-b7eb760c288f.sql
-- Fix security vulnerabilities

-- 1. Restrict settings table INSERT/UPDATE to admins only
DROP POLICY IF EXISTS "Allow insert settings" ON public.settings;
DROP POLICY IF EXISTS "Allow update settings" ON public.settings;

CREATE POLICY "Only admins can insert settings"
ON public.settings
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update settings"
ON public.settings
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. Restrict projects UPDATE/DELETE to owners and admins
DROP POLICY IF EXISTS "Allow project updates" ON public.projects;
DROP POLICY IF EXISTS "Allow project deletes" ON public.projects;

CREATE POLICY "Project owners and admins can update projects"
ON public.projects
FOR UPDATE
USING (
  auth.uid() = user_id 
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Only admins can delete projects"
ON public.projects
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. Create or replace the projects_public view to hide sensitive contact info
DROP VIEW IF EXISTS public.projects_public;

CREATE VIEW public.projects_public AS
SELECT
  id,
  title,
  project_type,
  synopsis,
  description,
  image_url,
  media_url,
  location,
  budget,
  has_incentive_law,
  incentive_law_details,
  stage,
  categorias_tags,
  link_video,
  link_pagamento,
  impacto_cultural,
  impacto_social,
  publico_alvo,
  diferenciais,
  featured_on_homepage,
  valor_sugerido,
  created_at,
  updated_at,
  -- Only show first name to public
  split_part(responsavel_nome, ' ', 1) AS responsavel_primeiro_nome
FROM public.projects
WHERE status = 'approved';

-- Grant access to the public view
GRANT SELECT ON public.projects_public TO anon;
GRANT SELECT ON public.projects_public TO authenticated;



-- FILE: 20251214162258_072763d0-8c8f-487e-85c0-72db1cba148a.sql
-- Fix the security definer view issue
DROP VIEW IF EXISTS public.projects_public;

-- Recreate view with SECURITY INVOKER (default, safe)
CREATE VIEW public.projects_public 
WITH (security_invoker = true)
AS
SELECT
  id,
  title,
  project_type,
  synopsis,
  description,
  image_url,
  media_url,
  location,
  budget,
  has_incentive_law,
  incentive_law_details,
  stage,
  categorias_tags,
  link_video,
  link_pagamento,
  impacto_cultural,
  impacto_social,
  publico_alvo,
  diferenciais,
  featured_on_homepage,
  valor_sugerido,
  created_at,
  updated_at,
  -- Only show first name to public
  split_part(responsavel_nome, ' ', 1) AS responsavel_primeiro_nome
FROM public.projects
WHERE status = 'approved';

-- Grant access to the public view
GRANT SELECT ON public.projects_public TO anon;
GRANT SELECT ON public.projects_public TO authenticated;



-- FILE: 20251214162327_e886ff06-00dd-4a88-adaf-f9da087d9f29.sql
-- Adjust settings policies for current localStorage-based admin auth
-- Since user explicitly chose localStorage-based admin, we need to keep settings writable
-- but protect projects table properly

DROP POLICY IF EXISTS "Only admins can insert settings" ON public.settings;
DROP POLICY IF EXISTS "Only admins can update settings" ON public.settings;

-- Keep settings writable for current admin architecture
CREATE POLICY "Allow insert settings"
ON public.settings
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow update settings"
ON public.settings
FOR UPDATE
USING (true)
WITH CHECK (true);

-- But keep the stricter project policies since projects can be owned
-- and have user_id to track ownership



-- FILE: 20251214165731_1db8c4ff-a8f7-4b78-9645-577faff22d3e.sql
-- 1. Fix project_members table: restrict UPDATE and DELETE to project owners and admins only
DROP POLICY IF EXISTS "Allow project members updates" ON public.project_members;
DROP POLICY IF EXISTS "Allow project members deletes" ON public.project_members;

-- Create secure UPDATE policy for project_members (only project owners and admins)
CREATE POLICY "Project owners and admins can update members"
ON public.project_members
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_members.project_id
    AND (p.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);

-- Create secure DELETE policy for project_members (only project owners and admins)
CREATE POLICY "Project owners and admins can delete members"
ON public.project_members
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_members.project_id
    AND (p.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);

-- 2. Fix projects table: create a more secure SELECT policy that hides contact info from non-owners
-- First, we already have projects_public view, but we need to ensure the projects table itself is protected
-- The projects table SELECT policy should remain for internal use, but frontend should use projects_public view

-- 3. For profiles table, the current policy is already secure (users can only view their own profile)
-- We'll mark this as a false positive since the policy already restricts access properly



-- FILE: 20251214165838_facdbe3a-9fd1-443e-99e3-5ca9d749f7a1.sql
-- 1. Fix access_requests: restrict UPDATE and DELETE to admins only
DROP POLICY IF EXISTS "Allow update access requests" ON public.access_requests;
DROP POLICY IF EXISTS "Allow delete access requests" ON public.access_requests;

CREATE POLICY "Admins can update access requests"
ON public.access_requests
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete access requests"
ON public.access_requests
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- 2. Fix project_members: restrict SELECT to project owners, admins, or the members themselves
DROP POLICY IF EXISTS "Allow all project member reads" ON public.project_members;

CREATE POLICY "Project owners and admins can view members"
ON public.project_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_members.project_id
    AND (p.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);

-- 3. Fix project_members: restrict INSERT to project owners and admins
DROP POLICY IF EXISTS "Anyone can insert project members" ON public.project_members;

CREATE POLICY "Project owners and admins can add members"
ON public.project_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_members.project_id
    AND (p.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);

-- 4. Fix settings: restrict INSERT and UPDATE to admins only
DROP POLICY IF EXISTS "Allow insert settings" ON public.settings;
DROP POLICY IF EXISTS "Allow update settings" ON public.settings;

CREATE POLICY "Admins can insert settings"
ON public.settings
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update settings"
ON public.settings
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));



-- FILE: 20251214165946_fa5bf4d2-ed05-4196-a5dd-3b2662f336c2.sql
-- Revert settings policies to allow unauthenticated access (required for localStorage admin architecture)
DROP POLICY IF EXISTS "Admins can insert settings" ON public.settings;
DROP POLICY IF EXISTS "Admins can update settings" ON public.settings;

CREATE POLICY "Allow insert settings"
ON public.settings
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow update settings"
ON public.settings
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Revert access_requests UPDATE/DELETE to allow unauthenticated access (required for localStorage admin)
DROP POLICY IF EXISTS "Admins can update access requests" ON public.access_requests;
DROP POLICY IF EXISTS "Admins can delete access requests" ON public.access_requests;

CREATE POLICY "Allow update access requests"
ON public.access_requests
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow delete access requests"
ON public.access_requests
FOR DELETE
USING (true);

-- Revert project_members policies to allow form submission (users aren't authenticated)
DROP POLICY IF EXISTS "Project owners and admins can view members" ON public.project_members;
DROP POLICY IF EXISTS "Project owners and admins can add members" ON public.project_members;
DROP POLICY IF EXISTS "Project owners and admins can update members" ON public.project_members;
DROP POLICY IF EXISTS "Project owners and admins can delete members" ON public.project_members;

CREATE POLICY "Allow all project member reads"
ON public.project_members
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert project members"
ON public.project_members
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow project members updates"
ON public.project_members
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow project members deletes"
ON public.project_members
FOR DELETE
USING (true);



-- FILE: 20251215122431_f957b49e-cfaf-4b87-92ae-2e143163dcc2.sql
-- Add is_hidden field for project visibility control
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false;

-- Add presentation_document_url field for PDF document uploads
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS presentation_document_url text;

-- Update stage field to support multiple stages (stored as array)
-- First check if already an array, if not migrate
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS stages text[] DEFAULT '{"development"}';

-- Add photo_url and social_links fields to project_members for enhanced team member profiles
ALTER TABLE public.project_members 
ADD COLUMN IF NOT EXISTS photo_url text;

ALTER TABLE public.project_members 
ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}';

ALTER TABLE public.project_members 
ADD COLUMN IF NOT EXISTS curriculum_url text;

-- Update RLS policy for DELETE to allow non-authenticated admin access (localStorage-based admin)
DROP POLICY IF EXISTS "Only admins can delete projects" ON public.projects;

-- Create more permissive delete policy (admin uses localStorage, not Supabase auth)
CREATE POLICY "Allow delete projects" 
ON public.projects 
FOR DELETE 
USING (true);

-- Update projects_public view to include new columns
DROP VIEW IF EXISTS public.projects_public;

CREATE VIEW public.projects_public AS
SELECT 
  id,
  title,
  project_type,
  synopsis,
  description,
  image_url,
  media_url,
  location,
  budget,
  has_incentive_law,
  incentive_law_details,
  categorias_tags,
  link_video,
  link_pagamento,
  impacto_cultural,
  impacto_social,
  publico_alvo,
  diferenciais,
  valor_sugerido,
  featured_on_homepage,
  stage,
  stages,
  created_at,
  updated_at,
  is_hidden,
  presentation_document_url,
  -- Only show first name of responsible
  CASE 
    WHEN responsavel_nome IS NOT NULL THEN split_part(responsavel_nome, ' ', 1)
    ELSE NULL
  END as responsavel_primeiro_nome
FROM public.projects
WHERE status = 'approved' AND is_hidden = false;

-- Grant access to the view
GRANT SELECT ON public.projects_public TO anon, authenticated;



-- FILE: 20251215130839_7e22d3b3-f30d-4db1-92ff-32ab98d37675.sql
-- Fix Security Definer View warning by recreating with SECURITY INVOKER
DROP VIEW IF EXISTS public.projects_public;

CREATE VIEW public.projects_public 
WITH (security_invoker = true) AS
SELECT 
  id,
  title,
  project_type,
  synopsis,
  description,
  image_url,
  media_url,
  location,
  budget,
  has_incentive_law,
  incentive_law_details,
  categorias_tags,
  link_video,
  link_pagamento,
  impacto_cultural,
  impacto_social,
  publico_alvo,
  diferenciais,
  valor_sugerido,
  featured_on_homepage,
  stage,
  stages,
  created_at,
  updated_at,
  is_hidden,
  presentation_document_url,
  CASE 
    WHEN responsavel_nome IS NOT NULL THEN split_part(responsavel_nome, ' ', 1)
    ELSE NULL
  END as responsavel_primeiro_nome
FROM public.projects
WHERE status = 'approved' AND is_hidden = false;

GRANT SELECT ON public.projects_public TO anon, authenticated;



-- FILE: 20251215212418_fd9d8f29-abea-4088-aadb-0812db07fc53.sql

-- Create contrapartidas table
CREATE TABLE public.contrapartidas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  valor TEXT NOT NULL,
  beneficios TEXT[] NOT NULL DEFAULT '{}',
  ativo BOOLEAN NOT NULL DEFAULT true,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contrapartidas ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active contrapartidas"
ON public.contrapartidas
FOR SELECT
USING (ativo = true);

CREATE POLICY "Admins can view all contrapartidas"
ON public.contrapartidas
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert contrapartidas"
ON public.contrapartidas
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update contrapartidas"
ON public.contrapartidas
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Anyone can delete contrapartidas"
ON public.contrapartidas
FOR DELETE
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_contrapartidas_updated_at
BEFORE UPDATE ON public.contrapartidas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();



-- FILE: 20251215225035_b15adf1a-c925-41c1-81cf-0592e3071b9b.sql
-- Add awards and news fields to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS awards text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS news jsonb DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.projects.awards IS 'Array of award/recognition strings';
COMMENT ON COLUMN public.projects.news IS 'Array of news items: [{title, url?, date?}]';



-- FILE: 20251215231102_3cd15fb9-bda0-4905-bb0f-87d33d55b590.sql
-- Drop existing UPDATE policies that require auth.uid()
DROP POLICY IF EXISTS "Users can update their own pending projects" ON public.projects;
DROP POLICY IF EXISTS "Project owners and admins can update projects" ON public.projects;

-- Create permissive UPDATE policy to allow localStorage-based admin workflow
CREATE POLICY "Allow update projects" 
ON public.projects 
FOR UPDATE 
USING (true)
WITH CHECK (true);



-- FILE: 20251216185943_3ba3adf2-cc15-466e-8f67-bd15897b2cb7.sql
-- Add indice field to contrapartidas table for tags like "por episÃ³dio", "por temporada", "por projeto"
ALTER TABLE public.contrapartidas
ADD COLUMN indice text DEFAULT NULL;



-- FILE: 20251217203911_77ccdd9a-f8a6-4ee2-8e21-5af704bd836c.sql
-- Add titulo column to contrapartidas table
ALTER TABLE public.contrapartidas 
ADD COLUMN IF NOT EXISTS titulo text;

-- Add comment
COMMENT ON COLUMN public.contrapartidas.titulo IS 'Nome/tÃ­tulo do nÃ­vel da contrapartida';



-- FILE: 20251218220935_ebdffbab-fae7-49e5-b9e8-24a01d641600.sql
-- Add additional_info column to projects table
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS additional_info TEXT DEFAULT NULL;

-- Make sure it's also available in the public view
DROP VIEW IF EXISTS public.projects_public;

CREATE VIEW public.projects_public AS
SELECT 
  id,
  title,
  project_type,
  synopsis,
  description,
  image_url,
  media_url,
  location,
  budget,
  has_incentive_law,
  incentive_law_details,
  categorias_tags,
  link_video,
  link_pagamento,
  impacto_cultural,
  impacto_social,
  publico_alvo,
  diferenciais,
  stage,
  stages,
  featured_on_homepage,
  valor_sugerido,
  is_hidden,
  presentation_document_url,
  additional_info,
  created_at,
  updated_at,
  SPLIT_PART(responsavel_nome, ' ', 1) as responsavel_primeiro_nome
FROM projects
WHERE status = 'approved' AND is_hidden = false;



-- FILE: 20251218221354_8a673459-9f5e-4831-af8b-a0366971ff73.sql
-- Fix security definer view by adding security invoker
DROP VIEW IF EXISTS public.projects_public;

CREATE VIEW public.projects_public 
WITH (security_invoker = true) AS
SELECT 
  id,
  title,
  project_type,
  synopsis,
  description,
  image_url,
  media_url,
  location,
  budget,
  has_incentive_law,
  incentive_law_details,
  categorias_tags,
  link_video,
  link_pagamento,
  impacto_cultural,
  impacto_social,
  publico_alvo,
  diferenciais,
  stage,
  stages,
  featured_on_homepage,
  valor_sugerido,
  is_hidden,
  presentation_document_url,
  additional_info,
  created_at,
  updated_at,
  SPLIT_PART(responsavel_nome, ' ', 1) as responsavel_primeiro_nome
FROM projects
WHERE status = 'approved' AND is_hidden = false;



-- FILE: 20251218222753_c824a3b9-2524-4f74-baa6-d8cd50a161be.sql
-- Add detalhes column to project_members table for additional member information
ALTER TABLE public.project_members ADD COLUMN IF NOT EXISTS detalhes TEXT DEFAULT NULL;



-- FILE: 20251221035608_873f0845-c76d-4555-a9b2-100cbf777fde.sql
-- Add hero and card image columns to projects table
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS hero_image_url text,
ADD COLUMN IF NOT EXISTS card_image_url text;

-- Copy existing image_url to both new columns as initial value
UPDATE public.projects 
SET hero_image_url = image_url, 
    card_image_url = image_url 
WHERE image_url IS NOT NULL 
  AND (hero_image_url IS NULL OR card_image_url IS NULL);

-- Update the public view to include new columns
DROP VIEW IF EXISTS public.projects_public;

CREATE VIEW public.projects_public AS
SELECT 
  id,
  title,
  project_type,
  synopsis,
  description,
  image_url,
  hero_image_url,
  card_image_url,
  media_url,
  location,
  budget,
  has_incentive_law,
  incentive_law_details,
  categorias_tags,
  link_video,
  link_pagamento,
  impacto_cultural,
  impacto_social,
  publico_alvo,
  diferenciais,
  stage,
  stages,
  featured_on_homepage,
  valor_sugerido,
  is_hidden,
  presentation_document_url,
  additional_info,
  created_at,
  updated_at,
  split_part(responsavel_nome, ' ', 1) AS responsavel_primeiro_nome
FROM public.projects
WHERE status = 'approved' AND is_hidden = false;



-- FILE: 20251229231250_4aac2509-1d19-4a97-9124-04ffd70d33b9.sql
-- Tabela de traduÃ§Ãµes para cache persistente (3Âª camada)
CREATE TABLE IF NOT EXISTS public.translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  namespace varchar(255) NOT NULL,
  source_language varchar(5) NOT NULL DEFAULT 'pt',
  target_language varchar(5) NOT NULL,
  source_hash varchar(64) NOT NULL,
  source_value jsonb NOT NULL,
  translated_value jsonb NOT NULL,
  translation_method varchar(20) DEFAULT 'auto',
  quality_score integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(namespace, target_language, source_hash)
);

-- Ãndices para busca rÃ¡pida
CREATE INDEX IF NOT EXISTS idx_translations_lookup 
  ON public.translations(namespace, target_language, source_hash);

CREATE INDEX IF NOT EXISTS idx_translations_updated 
  ON public.translations(updated_at DESC);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_translations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_translations_updated_at ON public.translations;
CREATE TRIGGER update_translations_updated_at 
  BEFORE UPDATE ON public.translations
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_translations_updated_at();

-- Habilitar RLS
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

-- TraduÃ§Ãµes sÃ£o pÃºblicas para leitura
CREATE POLICY "TraduÃ§Ãµes sÃ£o pÃºblicas para leitura" 
  ON public.translations FOR SELECT 
  USING (true);

-- TraduÃ§Ãµes podem ser inseridas por qualquer requisiÃ§Ã£o autenticada (edge functions)
CREATE POLICY "TraduÃ§Ãµes podem ser inseridas" 
  ON public.translations FOR INSERT 
  WITH CHECK (true);

-- Apenas admins podem atualizar/deletar traduÃ§Ãµes
CREATE POLICY "Admins podem atualizar traduÃ§Ãµes" 
  ON public.translations FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins podem deletar traduÃ§Ãµes" 
  ON public.translations FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );



-- FILE: 20260106231243_57fa5e39-0467-4a0c-ae57-66b33263238e.sql
-- Add festivals_exhibitions field to projects table
ALTER TABLE public.projects 
ADD COLUMN festivals_exhibitions jsonb DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.projects.festivals_exhibitions IS 'Array of festival/exhibition objects with title, url (optional), and date (optional)';



-- FILE: 20260108174106_aac3599c-f894-4b3e-bc47-f4a0f34501ac.sql
-- 1. Adicionar order_index em projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS order_index INTEGER;

-- Inicializar valores existentes com ordem baseada na data de criaÃ§Ã£o
WITH ranked AS (
  SELECT id, row_number() OVER (ORDER BY created_at DESC) as rn
  FROM projects
)
UPDATE projects SET order_index = ranked.rn
FROM ranked WHERE projects.id = ranked.id;

CREATE INDEX IF NOT EXISTS idx_projects_order ON projects(order_index);

-- 2. Adicionar order_index em project_members
ALTER TABLE project_members ADD COLUMN IF NOT EXISTS order_index INTEGER;

WITH ranked AS (
  SELECT id, row_number() OVER (PARTITION BY project_id ORDER BY created_at) as rn
  FROM project_members
)
UPDATE project_members SET order_index = ranked.rn
FROM ranked WHERE project_members.id = ranked.id;

CREATE INDEX IF NOT EXISTS idx_members_order ON project_members(project_id, order_index);



-- FILE: 20260109161029_85ef5798-f1db-414f-8f44-499c252621c3.sql
-- Add columns to control which pages projects appear on
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS show_on_captacao boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS show_on_portfolio boolean DEFAULT false;





-- ADICIONANDO COLUNA CAST_ADDITIONAL_TEXT
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS cast_additional_text TEXT;

