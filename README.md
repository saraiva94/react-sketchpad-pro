# Plataforma Digital — Produtora Audiovisual

Sistema web completo para gestao de portfolio, captacao de recursos e administracao de projetos audiovisuais.

## Sobre

Plataforma construida para centralizar a presenca digital de uma produtora audiovisual brasileira. O sistema unifica portfolio publico, hub de submissao de projetos, vitrine para investidores e painel administrativo em uma unica aplicacao. O problema resolvido e a fragmentacao entre ferramentas: planilhas para gestao de projetos, sites estaticos para portfolio e comunicacao manual com patrocinadores.

O publico-alvo se divide em tres perfis: visitantes que exploram o portfolio e filtram projetos por tipo, localizacao ou estagio; proponentes que submetem projetos via formulario publico configuravel; e administradores que gerenciam todo o conteudo, aprovam submissoes, editam reconhecimentos e acompanham metricas de engajamento por projeto.

## Stack

| Camada | Tecnologia | Proposito |
|--------|-----------|-----------|
| Framework | React 18 + TypeScript | Componentes tipados com JSX |
| Build | Vite 5 (SWC) | Dev server com HMR e build otimizado |
| Estilo | Tailwind CSS 3 + shadcn/ui | Utility-first com componentes Radix acessiveis |
| Estado servidor | TanStack React Query 5 | Cache, invalidacao e refetch automatico |
| Estado global | React Context | Providers de idioma, tema e autenticacao |
| Backend | Supabase (PostgreSQL) | Banco, storage, realtime subscriptions e edge functions |
| Formularios | React Hook Form + Zod | Validacao declarativa com schema |
| Drag-and-drop | dnd-kit | Reordenacao de projetos, equipe e carrossel |
| i18n | Sistema proprio com cache em 3 camadas | Traducao automatica PT/EN/ES via edge function |
| PDF | jsPDF | Exportacao client-side sem dependencia externa |
| Graficos | Recharts | Dashboard de metricas e engajamento |
| Carrossel | Embla Carousel | Carrosseis de imagens e parceiros |
| Icones | Lucide React | Biblioteca de icones SVG consistente |
| Tema | next-themes | Alternancia claro/escuro persistente |

## Funcionalidades

**Publico**
- Portfolio de projetos com filtros por tipo, localizacao, estagio, lei de incentivo e orcamento
- Paginas individuais de projeto com slug amigavel para SEO
- Secao de captacao de recursos com grid configuravel (2-5 projetos)
- Formulario publico de submissao com campos e secoes ativaveis pelo admin
- Suporte trilíngue (PT/EN/ES) com traducao automatica e fallback para idioma original
- Carrossel de videos com autoplay na hero da homepage
- Cards de servicos com modal detalhado e integracao com contato
- Carrossel de empresas parceiras com auto-advance por hover
- Exportacao de projeto em PDF
- Tema claro/escuro com animacoes de fundo opcionais

**Administracao**
- Painel centralizado com abas para projetos, equipe, conteudo e configuracoes
- Aprovacao e rejeicao de projetos submetidos com notas administrativas
- Drag-and-drop para reordenar projetos em destaque, membros da equipe e carrossel
- Editor de reconhecimentos (premios, cobertura de midia, festivais) inline
- Editor de contrapartidas/niveis de patrocinio por projeto
- Editor de carrossel de imagens com crop dual (banner 21:4 e card 16:9)
- Configuracao dinamica de tipos de projeto, localizacoes, estagios e categorias
- Metricas de engajamento por projeto (visualizacoes, cliques em contato, downloads)
- Edicao de conteudo da homepage (quem somos, servicos, rodape, botoes de contato)
- Configuracao de formulario de submissao (secoes e campos por tipo de projeto)
- Sincronizacao em tempo real de configuracoes via Supabase Realtime

## Arquitetura

O estado do servidor e gerenciado pelo TanStack React Query, que centraliza cache, invalidacao e sincronizacao. Configuracoes administrativas sao armazenadas em uma tabela `settings` no Supabase e propagadas em tempo real para todos os clientes via `postgres_changes` subscriptions, eliminando a necessidade de reload. O sistema de internacionalizacao usa um `TranslationManager` com cache em 3 camadas (memoria, localStorage e banco de dados), fila com rate limiting e deduplicacao de requests para evitar chamadas duplicadas a edge function de traducao. Drag-and-drop e implementado com dnd-kit usando delay de ativacao de 100ms e tolerancia de 5px para prevenir drags acidentais em cliques. A autenticacao combina validacao por chave/senha com estado persistido em localStorage e sincronizado entre abas via `StorageEvent`. Componentes pesados como animacoes de fundo sao carregados com `React.lazy` + `requestIdleCallback` para nao impactar metricas de carregamento.

## Como rodar localmente

**Pre-requisitos:** Node.js 18+ e npm.

```bash
# Clonar e instalar dependencias
git clone <url-do-repositorio>
cd <nome-do-diretorio>
npm install

# Configurar variaveis de ambiente
cp .env.example .env
# Preencher as variaveis no arquivo .env (ver secao abaixo)

# Iniciar servidor de desenvolvimento
npm run dev
# Acesse http://localhost:8080
```

**Outros comandos:**

```bash
npm run build       # Build de producao
npm run build:dev   # Build em modo desenvolvimento
npm run preview     # Preview do build
npm run lint        # Linting com ESLint
```

## Variaveis de ambiente

| Variavel | Descricao |
|----------|-----------|
| `VITE_SUPABASE_PROJECT_ID` | ID do projeto no Supabase |
| `VITE_SUPABASE_URL` | URL da instancia Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave publica (anon key) do Supabase |
| `VITE_ADMIN_KEY` | Chave de acesso ao painel administrativo |
| `VITE_ADMIN_PASSWORD` | Senha do painel administrativo |

A edge function de traducao (`supabase/functions/translate`) requer as variaveis `TRANSLATION_API_KEY` e `TRANSLATION_API_URL` configuradas no ambiente do Supabase.
