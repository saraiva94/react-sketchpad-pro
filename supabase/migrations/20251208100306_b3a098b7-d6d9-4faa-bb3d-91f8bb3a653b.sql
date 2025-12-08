-- Add stage column to projects table
ALTER TABLE public.projects 
ADD COLUMN stage text DEFAULT 'development' CHECK (stage IN ('development', 'production', 'distribution'));

-- Add comment for documentation
COMMENT ON COLUMN public.projects.stage IS 'Project stage: development, production, or distribution';