-- Fix the security definer view issue
DROP VIEW IF EXISTS public.projects_public;

-- Recreate view with SECURITY INVOKER (default, safe)
CREATE VIEW public.projects_public 
WITH (security_invoker = true)
AS
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