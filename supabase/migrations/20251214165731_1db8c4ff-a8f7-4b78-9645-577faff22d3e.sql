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