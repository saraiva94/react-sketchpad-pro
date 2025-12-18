-- Add detalhes column to project_members table for additional member information
ALTER TABLE public.project_members ADD COLUMN IF NOT EXISTS detalhes TEXT DEFAULT NULL;