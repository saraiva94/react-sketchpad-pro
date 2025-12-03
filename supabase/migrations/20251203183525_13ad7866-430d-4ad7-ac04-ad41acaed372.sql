-- Add new columns to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS responsavel_nome text,
ADD COLUMN IF NOT EXISTS responsavel_email text,
ADD COLUMN IF NOT EXISTS responsavel_telefone text,
ADD COLUMN IF NOT EXISTS categorias_tags text[],
ADD COLUMN IF NOT EXISTS link_video text,
ADD COLUMN IF NOT EXISTS valor_sugerido numeric,
ADD COLUMN IF NOT EXISTS link_pagamento text,
ADD COLUMN IF NOT EXISTS impacto_cultural text,
ADD COLUMN IF NOT EXISTS impacto_social text,
ADD COLUMN IF NOT EXISTS publico_alvo text,
ADD COLUMN IF NOT EXISTS diferenciais text,
ADD COLUMN IF NOT EXISTS featured_on_homepage boolean DEFAULT false;

-- Create project_members table for team members
CREATE TABLE IF NOT EXISTS public.project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  nome text NOT NULL,
  funcao text,
  email text,
  telefone text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on project_members
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for project_members
CREATE POLICY "Anyone can insert project members" ON public.project_members
FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view members of approved projects" ON public.project_members
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_members.project_id 
    AND projects.status = 'approved'
  )
);

CREATE POLICY "Admins can view all project members" ON public.project_members
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update project members" ON public.project_members
FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete project members" ON public.project_members
FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for project media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-media', 'project-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can upload project media" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'project-media');

CREATE POLICY "Project media is publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'project-media');

CREATE POLICY "Admins can delete project media" ON storage.objects
FOR DELETE USING (bucket_id = 'project-media' AND has_role(auth.uid(), 'admin'::app_role));