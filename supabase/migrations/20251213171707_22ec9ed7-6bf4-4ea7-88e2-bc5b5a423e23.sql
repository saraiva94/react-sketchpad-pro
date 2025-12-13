
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
