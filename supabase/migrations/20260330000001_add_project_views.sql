CREATE TABLE IF NOT EXISTS public.project_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id)
    ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_project_views_project_id
ON public.project_views(project_id);

ALTER TABLE public.project_views DISABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.project_views TO anon;
GRANT ALL ON TABLE public.project_views TO authenticated;
GRANT ALL ON TABLE public.project_views TO service_role;
