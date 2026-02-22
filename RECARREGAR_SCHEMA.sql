-- =====================================================
-- SOLUÇÕES PARA ERRO PGRST204 (Schema Cache)
-- =====================================================
-- NOTA: Este arquivo é apenas para referência histórica.
-- A solução DEFINITIVA implementada foi usar a tabela 'settings'
-- ao invés da coluna 'carousel_images' na tabela 'projects'.
-- =====================================================

-- 1. Verificar se a coluna existe
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'projects' 
  AND column_name = 'carousel_images';

-- 2. Criar a coluna se não existir
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS carousel_images TEXT[] DEFAULT ARRAY[]::TEXT[];

-- 3. Forçar reload do schema (múltiplas tentativas)
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
SELECT pg_notify('pgrst', 'reload schema');
SELECT pg_notify('pgrst', 'reload config');

-- 4. Verificar políticas RLS (se necessário)
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'projects';

-- =====================================================
-- SOLUÇÃO ALTERNATIVA IMPLEMENTADA (settings table)
-- =====================================================
-- As imagens do carousel agora são salvas na tabela 'settings'
-- com a chave: project_carousel_{project_id}
-- Exemplo de consulta:
--
-- SELECT value FROM settings WHERE key = 'project_carousel_473fd362-2017-4e85-ba0d-3d679d8c96cb';
--
-- O valor é um JSON: {"images": ["url1", "url2", "url3"]}
-- =====================================================
