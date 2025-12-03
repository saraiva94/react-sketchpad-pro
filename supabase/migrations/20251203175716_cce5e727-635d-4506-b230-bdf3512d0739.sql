-- Allow anonymous project submissions
DROP POLICY IF EXISTS "Users can insert their own projects" ON public.projects;

CREATE POLICY "Anyone can submit projects"
ON public.projects
FOR INSERT
WITH CHECK (true);

-- Update the user_id column to allow a default anonymous value
ALTER TABLE public.projects ALTER COLUMN user_id SET DEFAULT '00000000-0000-0000-0000-000000000000';