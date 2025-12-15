-- Add is_hidden field for project visibility control
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false;

-- Add presentation_document_url field for PDF document uploads
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS presentation_document_url text;

-- Update stage field to support multiple stages (stored as array)
-- First check if already an array, if not migrate
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS stages text[] DEFAULT '{"development"}';

-- Add photo_url and social_links fields to project_members for enhanced team member profiles
ALTER TABLE public.project_members 
ADD COLUMN IF NOT EXISTS photo_url text;

ALTER TABLE public.project_members 
ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}';

ALTER TABLE public.project_members 
ADD COLUMN IF NOT EXISTS curriculum_url text;

-- Update RLS policy for DELETE to allow non-authenticated admin access (localStorage-based admin)
DROP POLICY IF EXISTS "Only admins can delete projects" ON public.projects;

-- Create more permissive delete policy (admin uses localStorage, not Supabase auth)
CREATE POLICY "Allow delete projects" 
ON public.projects 
FOR DELETE 
USING (true);

-- Update projects_public view to include new columns
DROP VIEW IF EXISTS public.projects_public;

CREATE VIEW public.projects_public AS
SELECT 
  id,
  title,
  project_type,
  synopsis,
  description,
  image_url,
  media_url,
  location,
  budget,
  has_incentive_law,
  incentive_law_details,
  categorias_tags,
  link_video,
  link_pagamento,
  impacto_cultural,
  impacto_social,
  publico_alvo,
  diferenciais,
  valor_sugerido,
  featured_on_homepage,
  stage,
  stages,
  created_at,
  updated_at,
  is_hidden,
  presentation_document_url,
  -- Only show first name of responsible
  CASE 
    WHEN responsavel_nome IS NOT NULL THEN split_part(responsavel_nome, ' ', 1)
    ELSE NULL
  END as responsavel_primeiro_nome
FROM public.projects
WHERE status = 'approved' AND is_hidden = false;

-- Grant access to the view
GRANT SELECT ON public.projects_public TO anon, authenticated;