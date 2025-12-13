
-- Drop the security definer view and recreate with SECURITY INVOKER
DROP VIEW IF EXISTS public.projects_public;

-- Recreate view with SECURITY INVOKER (uses querying user's permissions)
CREATE VIEW public.projects_public 
WITH (security_invoker = true) AS
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
  split_part(responsavel_nome, ' ', 1) as responsavel_primeiro_nome
FROM public.projects
WHERE status = 'approved';

-- Grant SELECT on the view to anon and authenticated roles
GRANT SELECT ON public.projects_public TO anon, authenticated;
