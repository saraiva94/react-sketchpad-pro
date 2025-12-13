
-- Drop the insecure policies
DROP POLICY IF EXISTS "Allow project updates" ON public.projects;
DROP POLICY IF EXISTS "Allow project deletes" ON public.projects;

-- Create secure UPDATE policy: Only project owners can update their own projects, or admins can update any
CREATE POLICY "Project owners and admins can update projects"
ON public.projects
FOR UPDATE
USING (
  auth.uid() = user_id 
  OR public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  auth.uid() = user_id 
  OR public.has_role(auth.uid(), 'admin')
);

-- Create secure DELETE policy: Only admins can delete projects
CREATE POLICY "Only admins can delete projects"
ON public.projects
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create a secure view for public project data that excludes sensitive contact info
CREATE OR REPLACE VIEW public.projects_public AS
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
  stage,
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
  created_at,
  updated_at,
  -- Only show first name of responsible person for public view
  split_part(responsavel_nome, ' ', 1) as responsavel_primeiro_nome
FROM public.projects
WHERE status = 'approved';
