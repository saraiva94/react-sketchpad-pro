-- Add titulo column to contrapartidas table
ALTER TABLE public.contrapartidas 
ADD COLUMN IF NOT EXISTS titulo text;

-- Add comment
COMMENT ON COLUMN public.contrapartidas.titulo IS 'Nome/título do nível da contrapartida';