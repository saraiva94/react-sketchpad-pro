-- Revert settings policies to allow unauthenticated access (required for localStorage admin architecture)
DROP POLICY IF EXISTS "Admins can insert settings" ON public.settings;
DROP POLICY IF EXISTS "Admins can update settings" ON public.settings;

CREATE POLICY "Allow insert settings"
ON public.settings
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow update settings"
ON public.settings
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Revert access_requests UPDATE/DELETE to allow unauthenticated access (required for localStorage admin)
DROP POLICY IF EXISTS "Admins can update access requests" ON public.access_requests;
DROP POLICY IF EXISTS "Admins can delete access requests" ON public.access_requests;

CREATE POLICY "Allow update access requests"
ON public.access_requests
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow delete access requests"
ON public.access_requests
FOR DELETE
USING (true);

-- Revert project_members policies to allow form submission (users aren't authenticated)
DROP POLICY IF EXISTS "Project owners and admins can view members" ON public.project_members;
DROP POLICY IF EXISTS "Project owners and admins can add members" ON public.project_members;
DROP POLICY IF EXISTS "Project owners and admins can update members" ON public.project_members;
DROP POLICY IF EXISTS "Project owners and admins can delete members" ON public.project_members;

CREATE POLICY "Allow all project member reads"
ON public.project_members
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert project members"
ON public.project_members
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow project members updates"
ON public.project_members
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow project members deletes"
ON public.project_members
FOR DELETE
USING (true);