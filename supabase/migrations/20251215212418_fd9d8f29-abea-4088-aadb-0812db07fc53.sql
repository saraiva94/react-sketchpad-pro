
-- Create contrapartidas table
CREATE TABLE public.contrapartidas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  valor TEXT NOT NULL,
  beneficios TEXT[] NOT NULL DEFAULT '{}',
  ativo BOOLEAN NOT NULL DEFAULT true,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contrapartidas ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active contrapartidas"
ON public.contrapartidas
FOR SELECT
USING (ativo = true);

CREATE POLICY "Admins can view all contrapartidas"
ON public.contrapartidas
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert contrapartidas"
ON public.contrapartidas
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update contrapartidas"
ON public.contrapartidas
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Anyone can delete contrapartidas"
ON public.contrapartidas
FOR DELETE
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_contrapartidas_updated_at
BEFORE UPDATE ON public.contrapartidas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
