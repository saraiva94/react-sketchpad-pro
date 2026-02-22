-- Add carousel_images column to projects table
-- This allows projects to have multiple images displayed in a carousel on the project page

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS carousel_images TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add comment to explain the column
COMMENT ON COLUMN public.projects.carousel_images IS 'Array of image URLs to display in carousel on project detail page';
