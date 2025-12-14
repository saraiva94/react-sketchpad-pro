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