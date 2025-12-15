-- Drop existing UPDATE policies that require auth.uid()
DROP POLICY IF EXISTS "Users can update their own pending projects" ON public.projects;
DROP POLICY IF EXISTS "Project owners and admins can update projects" ON public.projects;

-- Create permissive UPDATE policy to allow localStorage-based admin workflow
CREATE POLICY "Allow update projects" 
ON public.projects 
FOR UPDATE 
USING (true)
WITH CHECK (true);