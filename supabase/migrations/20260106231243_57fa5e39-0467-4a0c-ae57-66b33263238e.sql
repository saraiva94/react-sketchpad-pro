-- Add festivals_exhibitions field to projects table
ALTER TABLE public.projects 
ADD COLUMN festivals_exhibitions jsonb DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.projects.festivals_exhibitions IS 'Array of festival/exhibition objects with title, url (optional), and date (optional)';