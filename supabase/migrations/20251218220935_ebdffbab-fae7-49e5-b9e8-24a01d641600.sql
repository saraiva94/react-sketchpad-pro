-- Add additional_info column to projects table
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS additional_info TEXT DEFAULT NULL;

-- Make sure it's also available in the public view
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