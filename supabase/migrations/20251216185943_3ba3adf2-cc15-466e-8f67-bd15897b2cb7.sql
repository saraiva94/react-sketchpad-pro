-- Add indice field to contrapartidas table for tags like "por episódio", "por temporada", "por projeto"
ALTER TABLE public.contrapartidas
ADD COLUMN indice text DEFAULT NULL;