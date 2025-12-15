-- Fix Security Definer View warning by recreating with SECURITY INVOKER
DROP VIEW IF EXISTS public.projects_public;

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
  CASE 
    WHEN responsavel_nome IS NOT NULL THEN split_part(responsavel_nome, ' ', 1)
    ELSE NULL
  END as responsavel_primeiro_nome
FROM public.projects
WHERE status = 'approved' AND is_hidden = false;

GRANT SELECT ON public.projects_public TO anon, authenticated;