-- Tabela de traduções para cache persistente (3ª camada)
CREATE TABLE IF NOT EXISTS public.translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  namespace varchar(255) NOT NULL,
  source_language varchar(5) NOT NULL DEFAULT 'pt',
  target_language varchar(5) NOT NULL,
  source_hash varchar(64) NOT NULL,
  source_value jsonb NOT NULL,
  translated_value jsonb NOT NULL,
  translation_method varchar(20) DEFAULT 'auto',
  quality_score integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(namespace, target_language, source_hash)
);

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_translations_lookup 
  ON public.translations(namespace, target_language, source_hash);

CREATE INDEX IF NOT EXISTS idx_translations_updated 
  ON public.translations(updated_at DESC);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_translations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_translations_updated_at ON public.translations;
CREATE TRIGGER update_translations_updated_at 
  BEFORE UPDATE ON public.translations
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_translations_updated_at();

-- Habilitar RLS
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

-- Traduções são públicas para leitura
CREATE POLICY "Traduções são públicas para leitura" 
  ON public.translations FOR SELECT 
  USING (true);

-- Traduções podem ser inseridas por qualquer requisição autenticada (edge functions)
CREATE POLICY "Traduções podem ser inseridas" 
  ON public.translations FOR INSERT 
  WITH CHECK (true);

-- Apenas admins podem atualizar/deletar traduções
CREATE POLICY "Admins podem atualizar traduções" 
  ON public.translations FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins podem deletar traduções" 
  ON public.translations FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );