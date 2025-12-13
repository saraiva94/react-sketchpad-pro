-- Drop the restrictive INSERT policy
DROP POLICY IF EXISTS "Admins can insert settings" ON public.settings;

-- Create a new policy that allows anyone to insert settings (since admin uses localStorage auth)
CREATE POLICY "Anyone can insert settings" 
ON public.settings 
FOR INSERT 
WITH CHECK (true);