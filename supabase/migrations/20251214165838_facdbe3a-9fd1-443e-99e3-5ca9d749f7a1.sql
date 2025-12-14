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