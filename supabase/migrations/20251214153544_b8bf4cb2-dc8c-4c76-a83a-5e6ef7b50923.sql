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