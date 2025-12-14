-- Fix security vulnerabilities

-- 1. Restrict settings table INSERT/UPDATE to admins only
DROP POLICY IF EXISTS "Allow insert settings" ON public.settings;
DROP POLICY IF EXISTS "Allow update settings" ON public.settings;

CREATE POLICY "Only admins can insert settings"
ON public.settings
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update settings"
ON public.settings
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. Restrict projects UPDATE/DELETE to owners and admins
DROP POLICY IF EXISTS "Allow project updates" ON public.projects;
DROP POLICY IF EXISTS "Allow project deletes" ON public.projects;

CREATE POLICY "Project owners and admins can update projects"
ON public.projects
FOR UPDATE
USING (
  auth.uid() = user_id 
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Only admins can delete projects"
ON public.projects
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. Create or replace the projects_public view to hide sensitive contact info
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
  stage,
  categorias_tags,
  link_video,
  link_pagamento,
  impacto_cultural,
  impacto_social,
  publico_alvo,
  diferenciais,
  featured_on_homepage,
  valor_sugerido,
  created_at,
  updated_at,
  -- Only show first name to public
  split_part(responsavel_nome, ' ', 1) AS responsavel_primeiro_nome
FROM public.projects
WHERE status = 'approved';

-- Grant access to the public view
GRANT SELECT ON public.projects_public TO anon;
GRANT SELECT ON public.projects_public TO authenticated;