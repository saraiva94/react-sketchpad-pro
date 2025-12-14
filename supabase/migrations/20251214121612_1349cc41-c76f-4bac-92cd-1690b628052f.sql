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