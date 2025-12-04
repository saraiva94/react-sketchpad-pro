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