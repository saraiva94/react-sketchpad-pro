-- Add hero and card image columns to projects table
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS hero_image_url text,
ADD COLUMN IF NOT EXISTS card_image_url text;

-- Copy existing image_url to both new columns as initial value
UPDATE public.projects 
SET hero_image_url = image_url, 
    card_image_url = image_url 
WHERE image_url IS NOT NULL 
  AND (hero_image_url IS NULL OR card_image_url IS NULL);

-- Update the public view to include new columns
DROP VIEW IF EXISTS public.projects_public;

CREATE VIEW public.projects_public AS
SELECT 
  id,
  title,
  project_type,
  synopsis,
  description,
  image_url,
  hero_image_url,
  card_image_url,
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
  split_part(responsavel_nome, ' ', 1) AS responsavel_primeiro_nome
FROM public.projects
WHERE status = 'approved' AND is_hidden = false;