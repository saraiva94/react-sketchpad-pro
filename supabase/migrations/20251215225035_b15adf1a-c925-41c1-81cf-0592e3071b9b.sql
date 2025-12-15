-- Add awards and news fields to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS awards text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS news jsonb DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.projects.awards IS 'Array of award/recognition strings';
COMMENT ON COLUMN public.projects.news IS 'Array of news items: [{title, url?, date?}]';