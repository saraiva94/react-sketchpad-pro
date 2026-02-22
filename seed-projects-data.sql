-- ============================================
-- SEED DATA - PORTO BELLO PROJECTS
-- ============================================
-- Este arquivo contém dados de exemplo para alimentar um novo Supabase
-- Execute no SQL Editor do Supabase ou via migration
-- ============================================

-- ============================================
-- 1. PROJETOS (projects table)
-- ============================================

INSERT INTO projects (
  id,
  title,
  synopsis,
  description,
  project_type,
  budget,
  location,
  categorias_tags,
  stages,
  has_incentive_law,
  incentive_law_details,
  awards,
  news,
  festivals_exhibitions,
  impacto_cultural,
  impacto_social,
  publico_alvo,
  diferenciais,
  additional_info,
  link_video,
  link_pagamento,
  valor_sugerido,
  responsavel_primeiro_nome,
  image_url,
  hero_image_url,
  card_image_url,
  media_url,
  presentation_document_url,
  created_at,
  updated_at
) VALUES

-- Projeto 1: Cores no Breu
(
  '550e8400-e29b-41d4-a716-446655440001',
  'Cores no Breu',
  'Um espetáculo inovador que explora as fronteiras entre luz, cor e escuridão através da dança contemporânea e performance audiovisual.',
  'Cores no Breu é uma experiência sensorial única que combina dança contemporânea, instalações visuais interativas e tecnologia de ponta. O espetáculo questiona nossa percepção de cor e luz através de performances que ocorrem em ambientes de completa escuridão, intercalados com explosões visuais de cores vibrantes.

A obra explora temas como identidade, memória e transformação através da linguagem corporal e visual. Cada apresentação é única, com elementos de improvisação que respondem ao espaço e ao público presente.',
  'Dança',
  'R$ 350.000,00',
  'São Paulo, SP',
  ARRAY['danca_contemporanea', 'performance', 'arte_digital'],
  ARRAY['pre_producao', 'financiamento'],
  true,
  'lei_rouanet,proac',
  ARRAY[
    'Prêmio Melhor Coreografia - Festival de Dança Contemporânea 2023',
    'Seleção Oficial - Mostra Internacional de Performance 2024'
  ],
  JSONB_BUILD_ARRAY(
    JSONB_BUILD_OBJECT('title', 'Cores no Breu estreia com sucesso em São Paulo', 'url', 'https://example.com/news1', 'date', '2024-01-15'),
    JSONB_BUILD_OBJECT('title', 'Espetáculo inovador une dança e tecnologia', 'url', 'https://example.com/news2', 'date', '2024-02-20')
  ),
  JSONB_BUILD_ARRAY(
    JSONB_BUILD_OBJECT('title', 'Festival Internacional de Dança - São Paulo', 'url', 'https://example.com/festival1', 'date', '2023-11-10'),
    JSONB_BUILD_OBJECT('title', 'Mostra de Performance Contemporânea - Rio de Janeiro', 'date', '2024-03-15')
  ),
  'Promove o acesso à dança contemporânea experimental, estimulando reflexões sobre percepção sensorial e identidade cultural através de uma linguagem artística inovadora.',
  'Realiza oficinas gratuitas em comunidades periféricas, democratizando o acesso às artes cênicas e desenvolvendo talentos locais.',
  'Jovens e adultos interessados em arte contemporânea, dança experimental e tecnologia. Público universitário e frequentadores de festivais culturais.',
  'Primeira experiência brasileira que combina dança contemporânea com tecnologia de sensores de movimento em ambientes de escuridão controlada. Equipe multidisciplinar premiada internacionalmente.',
  'Projeto contemplado pela Lei Rouanet (Processo: 210000/2023-45)',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://www.example.com/apoie/cores-no-breu',
  150000.00,
  'Marina',
  'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800',
  'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=1920',
  'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=600',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  NULL,
  '2024-01-10 10:00:00',
  '2024-01-22 15:30:00'
),

-- Projeto 2: Memórias da Várzea
(
  '550e8400-e29b-41d4-a716-446655440002',
  'Memórias da Várzea',
  'Documentário que resgata a história do futebol de várzea paulistano através de entrevistas, imagens de arquivo e depoimentos emocionantes.',
  'Memórias da Várzea é um documentário de longa-metragem que mergulha no universo do futebol de várzea da cidade de São Paulo, explorando sua importância cultural, social e histórica.

Através de entrevistas com jogadores, ex-atletas profissionais que começaram na várzea, torcedores e moradores das regiões onde os campos resistem, o filme constrói um panorama rico e emocionante deste patrimônio cultural imaterial paulistano.

O projeto inclui pesquisa de imagens históricas, captação de jogos atuais e depoimentos que revelam como o futebol de várzea foi fundamental na formação de identidades comunitárias e no desenvolvimento de talentos do futebol brasileiro.',
  'Documentário',
  'R$ 450.000,00',
  'São Paulo, SP',
  ARRAY['documentario', 'esporte', 'memoria'],
  ARRAY['producao', 'pos_producao'],
  true,
  'lei_rouanet',
  ARRAY[
    'Prêmio de Melhor Documentário Brasileiro - Festival É Tudo Verdade 2024'
  ],
  JSONB_BUILD_ARRAY(
    JSONB_BUILD_OBJECT('title', 'Documentário resgata memórias do futebol de várzea', 'url', 'https://example.com/news3', 'date', '2024-03-01')
  ),
  JSONB_BUILD_ARRAY(
    JSONB_BUILD_OBJECT('title', 'Festival É Tudo Verdade', 'url', 'https://example.com/festival2', 'date', '2024-04-05')
  ),
  'Preserva e valoriza a memória cultural do futebol de várzea, patrimônio imaterial das periferias paulistanas, resgatando histórias e identidades locais.',
  'Promove inclusão social através do esporte, destacando o papel dos campos de várzea como espaços de convivência e formação cidadã nas comunidades.',
  'Amantes de futebol, moradores de periferias urbanas, interessados em documentários sociais e história de São Paulo.',
  'Primeiro documentário a mapear sistematicamente os campos de várzea ativos em São Paulo. Acervo inédito de imagens históricas dos anos 1950-1980.',
  NULL,
  'https://vimeo.com/123456789',
  NULL,
  80000.00,
  'Roberto',
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1920',
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600',
  'https://vimeo.com/123456789',
  NULL,
  '2023-11-15 14:20:00',
  '2024-01-20 09:15:00'
),

-- Projeto 3: Sarau das Margens
(
  '550e8400-e29b-41d4-a716-446655440003',
  'Sarau das Margens',
  'Série de saraus literários que celebra a produção poética das periferias brasileiras, dando voz a poetas e escritores marginalizados.',
  'Sarau das Margens é um projeto cultural continuado que promove encontros mensais de literatura nas periferias de São Paulo, Rio de Janeiro e Salvador. O projeto busca democratizar o acesso à literatura e criar espaços de expressão para poetas e escritores das comunidades.

Cada encontro conta com apresentações de poesia falada, slams, lançamentos de livros independentes, oficinas de escrita criativa e debates sobre literatura periférica. O projeto também mantém uma biblioteca comunitária itinerante e publica uma antologia anual com os melhores textos apresentados.

Além das apresentações presenciais, o Sarau das Margens mantém canal no YouTube com transmissões ao vivo e arquivo de performances, alcançando público nacional e internacional.',
  'Literatura',
  'R$ 180.000,00',
  'São Paulo, Rio de Janeiro, Salvador',
  ARRAY['literatura', 'poesia', 'sarau'],
  ARRAY['realizacao'],
  true,
  'lei_aldir_blanc',
  NULL,
  JSONB_BUILD_ARRAY(
    JSONB_BUILD_OBJECT('title', 'Sarau das Margens completa 100 edições', 'url', 'https://example.com/news4', 'date', '2024-01-10')
  ),
  NULL,
  'Fortalece a literatura periférica brasileira, promovendo visibilidade para autores marginalizados e democratizando o acesso à produção cultural literária.',
  'Cria espaços de expressão e convivência comunitária, fortalecendo identidades locais e estimulando a formação de leitores e escritores nas periferias.',
  'Moradores de periferias urbanas, jovens escritores, amantes de poesia e literatura marginal.',
  'Rede consolidada de 50+ saraus em 3 estados. Biblioteca itinerante com 2.000+ títulos. Publicação anual de antologia com distribuição gratuita.',
  'Projeto aprovado pela Lei Aldir Blanc São Paulo',
  NULL,
  'https://www.apoia.se/saraudasmargens',
  30000.00,
  'Tatiana',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1920',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600',
  NULL,
  NULL,
  '2023-10-01 16:00:00',
  '2024-01-18 11:00:00'
);

-- ============================================
-- 2. MEMBROS DO PROJETO (project_members table)
-- ============================================

INSERT INTO project_members (project_id, nome, funcao, link_imdb, foto_url, ordem, created_at) VALUES

-- Cores no Breu - Equipe
('550e8400-e29b-41d4-a716-446655440001', 'Marina Silva', 'Diretora e Coreógrafa', NULL, 'https://i.pravatar.cc/150?img=1', 1, NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'Carlos Eduardo', 'Designer de Luz', NULL, 'https://i.pravatar.cc/150?img=2', 2, NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'Ana Beatriz', 'Bailarina Principal', NULL, 'https://i.pravatar.cc/150?img=3', 3, NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'Rafael Santana', 'Compositor e Sound Designer', NULL, 'https://i.pravatar.cc/150?img=4', 4, NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'Juliana Mendes', 'Bailarina', NULL, 'https://i.pravatar.cc/150?img=5', 5, NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'Pedro Oliveira', 'Programador Visual', NULL, 'https://i.pravatar.cc/150?img=6', 6, NOW()),

-- Memórias da Várzea - Equipe
('550e8400-e29b-41d4-a716-446655440002', 'Roberto Costa', 'Diretor', 'https://www.imdb.com/name/nm0000000/', 'https://i.pravatar.cc/150?img=7', 1, NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Fernanda Lima', 'Produtora Executiva', NULL, 'https://i.pravatar.cc/150?img=8', 2, NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'João Pereira', 'Diretor de Fotografia', NULL, 'https://i.pravatar.cc/150?img=9', 3, NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Marcela Santos', 'Roteirista', NULL, 'https://i.pravatar.cc/150?img=10', 4, NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Lucas Almeida', 'Editor', NULL, 'https://i.pravatar.cc/150?img=11', 5, NOW()),

-- Sarau das Margens - Equipe
('550e8400-e29b-41d4-a716-446655440003', 'Tatiana Nascimento', 'Idealizadora e Curadora', NULL, 'https://i.pravatar.cc/150?img=12', 1, NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'André Capilé', 'Poeta e MC', NULL, 'https://i.pravatar.cc/150?img=13', 2, NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Roberta Estrela', 'Coordenadora Pedagógica', NULL, 'https://i.pravatar.cc/150?img=14', 3, NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Thiago Correia', 'Produtor Cultural', NULL, 'https://i.pravatar.cc/150?img=15', 4, NOW());

-- ============================================
-- 3. CONTRAPARTIDAS (contrapartidas table)
-- ============================================

INSERT INTO contrapartidas (project_id, valor, titulo, descricao, itens, ordem, created_at) VALUES

-- Cores no Breu - Contrapartidas
('550e8400-e29b-41d4-a716-446655440001', 'R$ 100', 'Apoiador Digital', 'Ajude o projeto e receba conteúdos exclusivos', ARRAY['Nome nos créditos digitais', 'Acesso a ensaios gravados', 'Newsletter mensal com bastidores'], 1, NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'R$ 300', 'Amigo da Arte', 'Tenha uma experiência mais próxima do projeto', ARRAY['Tudo do nível anterior', '2 ingressos para estreia', 'Pôster autografado pela equipe', 'Convite para ensaio aberto'], 2, NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'R$ 1.000', 'Patrono Cultural', 'Seja parte essencial desta obra', ARRAY['Tudo do nível anterior', '4 ingressos VIP', 'Livro com registro fotográfico', 'Encontro com a diretora', 'Destaque especial nos créditos'], 3, NOW()),

-- Memórias da Várzea - Contrapartidas
('550e8400-e29b-41d4-a716-446655440002', 'R$ 80', 'Torcedor', 'Entre no time!', ARRAY['Nome nos créditos do filme', 'Link para streaming do documentário', 'Wallpapers exclusivos'], 1, NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'R$ 250', 'Craque', 'Apoio especial ao projeto', ARRAY['Tudo do nível anterior', 'DVD autografado', 'Foto oficial da equipe', 'Acesso antecipado ao filme'], 2, NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'R$ 800', 'Camisa 10', 'MVP do projeto', ARRAY['Tudo do nível anterior', 'Convite para pré-estreia em cinema', 'Livro com making-of do filme', 'Sessão comentada com o diretor'], 3, NOW()),

-- Sarau das Margens - Contrapartidas
('550e8400-e29b-41d4-a716-446655440003', 'R$ 50', 'Leitor', 'Apoie a literatura periférica', ARRAY['Nome no site do projeto', 'E-book da antologia 2024', 'Certificado digital de apoiador'], 1, NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'R$ 150', 'Poeta', 'Seja parte da comunidade', ARRAY['Tudo do nível anterior', 'Livro físico da antologia', '1 camiseta do projeto', 'Participação em oficina online'], 2, NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'R$ 500', 'Mecenas', 'Transforme vidas com a literatura', ARRAY['Tudo do nível anterior', 'Kit completo de 3 livros', 'Convite para sarau especial', 'Certificado impresso personalizado', 'Destaque como apoiador em evento'], 3, NOW());

-- ============================================
-- 4. SETTINGS (Configurações do site)
-- ============================================

INSERT INTO settings (key, value, created_at, updated_at) VALUES

-- Headers das páginas
('portfolio_header', '{"title": "Nosso Portfólio", "description": "Conheça os projetos culturais que transformam realidades e celebram a diversidade artística brasileira."}', NOW(), NOW()),
('porto_ideias_header', '{"title": "Porto de Ideias", "description": "Apoie projetos culturais inovadores e seja parte da transformação pela arte e cultura."}', NOW(), NOW()),
('quem_somos_content', '{"title": "Quem Somos", "content": "A Porto Bello é uma plataforma que conecta projetos culturais com investidores e apoiadores, promovendo o desenvolvimento artístico e cultural do Brasil."}', NOW(), NOW()),

-- Botões de contato
('contact_buttons', '[
  {"id": "1", "name": "WhatsApp", "link": "https://wa.me/5511999999999", "order": 1},
  {"id": "2", "name": "E-mail", "link": "mailto:contato@portobello.com.br", "order": 2}
]', NOW(), NOW()),

-- Texto do ecossistema
('ecossistema_text', '{"content": "Fazemos parte de um ecossistema cultural vibrante, conectando artistas, produtores, investidores e o público em uma rede colaborativa de fomento à cultura brasileira."}', NOW(), NOW());

-- ============================================
-- FINALIZAÇÃO
-- ============================================

-- Atualizar sequências (se necessário)
SELECT setval('project_members_id_seq', (SELECT MAX(id) FROM project_members));
SELECT setval('contrapartidas_id_seq', (SELECT MAX(id) FROM contrapartidas));
SELECT setval('settings_id_seq', (SELECT MAX(id) FROM settings));

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ Seed data inserido com sucesso!';
  RAISE NOTICE '📊 3 projetos criados';
  RAISE NOTICE '👥 15 membros de equipe adicionados';
  RAISE NOTICE '🎁 9 contrapartidas configuradas';
  RAISE NOTICE '⚙️ 5 configurações do site definidas';
END $$;
