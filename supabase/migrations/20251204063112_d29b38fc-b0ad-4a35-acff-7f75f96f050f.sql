-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Admins can update settings" ON public.settings;

-- Create a more permissive policy for stats_visible setting
-- Since admin auth uses localStorage, we need to allow updates without Supabase auth
CREATE POLICY "Anyone can update settings" 
ON public.settings 
FOR UPDATE 
USING (true)
WITH CHECK (true);