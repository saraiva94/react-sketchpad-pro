-- Add columns to control which pages projects appear on
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS show_on_captacao boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS show_on_portfolio boolean DEFAULT false;