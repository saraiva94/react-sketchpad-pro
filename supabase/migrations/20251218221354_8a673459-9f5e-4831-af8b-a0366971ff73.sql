-- Fix security definer view by adding security invoker
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
  stage,
  stages,
  featured_on_homepage,
  valor_sugerido,
  is_hidden,
  presentation_document_url,
  additional_info,
  created_at,
  updated_at,
  SPLIT_PART(responsavel_nome, ' ', 1) as responsavel_primeiro_nome
FROM projects
WHERE status = 'approved' AND is_hidden = false;