# QA Completo - Implementação i18n

**Data:** 2025-12-29  
**Framework:** React + Vite + TypeScript

---

## 1. Estrutura Atual de Pastas e Arquivos de Tradução

```
src/
├── lib/
│   ├── i18n.ts                    # Traduções estáticas (772 linhas)
│   ├── translationCache.ts        # Cache centralizado de traduções
│   └── autoTranslate.ts           # Helper para tradução automática
├── hooks/
│   ├── useLanguage.tsx            # Provider e hook de idioma
│   ├── useAutoTranslate.ts        # Hook para tradução de conteúdo dinâmico
│   └── usePreloadTranslations.ts  # Hook para pré-carregar traduções
├── components/
│   ├── TranslatedText.tsx         # Componente para texto traduzido
│   ├── TranslatedProjectCard.tsx  # Card de projeto com tradução
│   ├── TranslatedMemberCard.tsx   # Card de membro com tradução
│   ├── TranslatedContrapartidaCard.tsx # Card de contrapartida traduzido
│   └── LanguageSelector.tsx       # Seletor de idioma no navbar
supabase/
└── functions/
    └── translate/
        └── index.ts               # Edge Function para tradução via IA
```

---

## 2. Bibliotecas/Packages Utilizados

**NÃO utiliza bibliotecas externas de i18n** como `react-i18next` ou `next-intl`.

A implementação é **100% customizada** usando:
- React Context API (para estado global do idioma)
- Lovable AI Gateway (para traduções automáticas via Gemini)
- localStorage (para cache persistente)
- Supabase Edge Functions (para processamento de tradução)

---

## 3. Configurações de i18n

### 3.1 Provider de Idioma (`src/hooks/useLanguage.tsx`)

```typescript
// Idiomas suportados
type Language = 'pt' | 'en' | 'es';

// Detecção automática do idioma do navegador
const detectBrowserLanguage = (): Language => {
  const browserLang = navigator.language.split('-')[0];
  if (browserLang === 'pt') return 'pt';
  if (browserLang === 'es') return 'es';
  if (browserLang === 'en') return 'en';
  return 'pt'; // default
};

// Persistência em localStorage
const STORAGE_KEY = 'preferred-language';
```

### 3.2 Arquivo de Traduções Estáticas (`src/lib/i18n.ts`)

```typescript
export const translations = {
  pt: {
    nav: { home: 'Início', projects: 'Projetos', ... },
    home: { title: 'Bem-vindo', heroTitle: 'Produtora Cultural', ... },
    projects: { ... },
    projectDetails: { ... },
    portoDeIdeias: { ... },
    submit: { ... },
    admin: { ... },
    login: { ... },
    footer: { ... },
    common: { ... },
  },
  en: { /* mesma estrutura */ },
  es: { /* mesma estrutura */ },
};

export type Language = 'pt' | 'en' | 'es';
export type Translations = typeof translations['pt'];
```

### 3.3 Cache de Traduções (`src/lib/translationCache.ts`)

```typescript
// Configurações do cache
const CACHE_PREFIX = "i18n:v2:";
const BATCH_SIZE = 5;  // Traduções por lote
const DELAY_BETWEEN_BATCHES = 200; // ms

// Armazenamento
- memoryCache: Map<string, unknown>  // Cache em memória (rápido)
- localStorage: persistent storage   // Cache persistente
- pendingRequests: Map<string, Promise> // Deduplicação de requisições
```

### 3.4 Edge Function de Tradução (`supabase/functions/translate/index.ts`)

```typescript
// Modelo utilizado: google/gemini-2.5-flash
// Idiomas suportados: pt (origem) -> en | es (destino)
// API: Lovable AI Gateway

// System prompt do modelo:
"You are a professional translator.
Translate Brazilian Portuguese (pt-BR) into the requested language.
Translate ONLY string VALUES, never change keys, numbers, booleans.
Do NOT translate URLs, emails, phones, or handle-like strings.
Return VALID JSON only, no markdown, no explanations."
```

---

## 4. Exemplos de Uso nos Componentes

### 4.1 Traduções Estáticas (UI)

```tsx
// src/pages/HomePage.tsx
import { useLanguage } from "@/hooks/useLanguage";

const HomePage = () => {
  const { t, language } = useLanguage();
  
  return (
    <h1>{t.home.heroTitle}</h1>
    <p>{t.home.heroSubtitle}</p>
    <Link to="/projects">{t.home.exploreProjects}</Link>
  );
};
```

### 4.2 Tradução de Conteúdo Dinâmico (Backend)

```tsx
// src/pages/HomePage.tsx
import { useAutoTranslate } from "@/hooks/useAutoTranslate";

const HomePage = () => {
  const { language } = useLanguage();
  const [quemSomosContent, setQuemSomosContent] = useState(/*...*/);
  
  // Traduz automaticamente quando idioma != 'pt'
  const { translated: translatedQuemSomos } = useAutoTranslate(
    'quem_somos', 
    quemSomosContent
  );
  
  // Exibe conteúdo original em PT ou traduzido em outros idiomas
  const displayQuemSomos = language === 'pt' 
    ? quemSomosContent 
    : (translatedQuemSomos || quemSomosContent);
  
  return <div>{displayQuemSomos.paragraphs.map(p => <p>{p}</p>)}</div>;
};
```

### 4.3 Componente TranslatedText

```tsx
// Uso simples para strings
<TranslatedText
  namespace="project_title"
  value={project.title}
  as="h1"
  className="text-2xl font-bold"
/>
```

### 4.4 Preload de Traduções

```tsx
// src/pages/HomePage.tsx
import { usePreloadTranslations, createTranslationItems } from "@/hooks/usePreloadTranslations";

const preloadItems = [
  ...createTranslationItems.forProjectList(featuredProjects),
  ...createTranslationItems.forSettings('quem_somos', quemSomosContent),
  ...createTranslationItems.forSettings('nossos_servicos', servicosContent),
];

usePreloadTranslations(preloadItems, !loadingProjects);
```

---

## 5. Estrutura do Banco de Dados para Conteúdo Dinâmico

### 5.1 Tabela `settings` (conteúdo editável)

| key | value (JSON) |
|-----|--------------|
| `quem_somos_content` | `{ paragraphs: string[], cards: [...] }` |
| `nossos_servicos_content` | `{ title: string, services: [...] }` |
| `institutional_videos` | `{ videos: [...] }` |
| `stats_visible` | `{ enabled: boolean }` |

### 5.2 Tabela `projects` (projetos culturais)

Campos traduzíveis:
- `title` (string)
- `synopsis` (string)
- `description` (string)
- `project_type` (string)
- `impacto_cultural` (string)
- `impacto_social` (string)
- `publico_alvo` (string)
- `diferenciais` (string)

### 5.3 Tabela `project_members`

Campos traduzíveis:
- `funcao` (função/cargo)
- `detalhes` (bio/descrição)

### 5.4 Tabela `contrapartidas`

Campos traduzíveis:
- `titulo` (título do nível)
- `beneficios` (array de strings)

---

## 6. Problemas Identificados

### 6.1 🔴 CRÍTICO: Rate Limiting da API

**Problema:** A API de tradução (Lovable AI Gateway) retorna HTTP 429 quando muitas requisições são feitas simultaneamente.

**Impacto:** 
- Traduções falham silenciosamente
- Fallback para português exibido
- Usuário vê conteúdo não traduzido

**Mitigação Atual:**
- Cache local (memory + localStorage)
- Deduplicação de requisições pendentes
- Batches de 5 traduções com delay de 200ms

**Recomendação:**
- Implementar retry com exponential backoff
- Aumentar delay entre batches para 500ms
- Considerar cache em Supabase (tabela de traduções)

### 6.2 🟡 MÉDIO: Traduções Incompletas em Primeira Visita

**Problema:** Quando usuário acessa página pela primeira vez em idioma não-PT, algumas traduções podem não aparecer imediatamente devido ao tempo de resposta da API.

**Impacto:**
- UX inconsistente (mix de idiomas)
- Elementos carregam em PT e depois "piscam" para tradução

**Recomendação:**
- Adicionar skeleton/loading state para conteúdo traduzível
- Implementar SSR ou pré-renderização de traduções

### 6.3 🟡 MÉDIO: Não há Fallback de Tradução Manual

**Problema:** Se a API falhar, não há traduções manuais de fallback para conteúdo dinâmico.

**Recomendação:**
- Criar tabela `translations` no Supabase com traduções manuais
- Usar traduções manuais como fallback quando API falhar

### 6.4 🟢 MENOR: Cache Key Collision (Teórico)

**Problema:** O hash usado para payloads longos pode, teoricamente, ter colisões.

**Mitigação:** Usar algoritmo de hash mais robusto (SHA-256).

---

## 7. Componentes com Tradução Funcionando

| Componente | Status | Observações |
|------------|--------|-------------|
| `Navbar` | ✅ OK | Traduções estáticas |
| `Footer` | ✅ OK | Traduções estáticas |
| `HomePage` - Hero | ✅ OK | Traduções estáticas |
| `HomePage` - Quem Somos | ✅ OK* | Dinâmico (depende da API) |
| `HomePage` - Nossos Serviços | ✅ OK* | Dinâmico (depende da API) |
| `HomePage` - Projetos em Destaque | ✅ OK* | Dinâmico (TranslatedProjectCard) |
| `ProjectPage` | ✅ OK* | Tradução de detalhes do projeto |
| `PortoDeIdeiasPage` | ✅ OK* | Tradução de lista de projetos |
| `ProjectsPortfolioPage` | ✅ OK* | Tradução de lista de projetos |
| `SubmitProjectPage` | ✅ OK | Traduções estáticas do formulário |
| `LoginPage` | ✅ OK | Traduções estáticas |
| `AdminDashboard` | ✅ OK | Traduções estáticas |

*Dependem da API de tradução funcionar corretamente

---

## 8. Framework e Stack Técnica

| Tecnologia | Versão |
|------------|--------|
| React | 18.3.1 |
| Vite | (bundler) |
| TypeScript | (tipagem) |
| Tailwind CSS | (estilos) |
| Supabase | Edge Functions |
| Lovable AI Gateway | Gemini 2.5 Flash |

---

## 9. Fluxo de Tradução

```
┌─────────────────────────────────────────────────────────────────┐
│                     FLUXO DE TRADUÇÃO                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐     ┌─────────────┐     ┌──────────────────────┐ │
│  │  Usuário │────▶│ Seleciona   │────▶│ LanguageProvider     │ │
│  │          │     │ Idioma (EN) │     │ atualiza state       │ │
│  └──────────┘     └─────────────┘     └──────────────────────┘ │
│                                                │                │
│                                                ▼                │
│  ┌────────────────────────────────────────────────────────────┐│
│  │                    CONTEÚDO ESTÁTICO                       ││
│  │  • t.home.heroTitle → "Cultural Producer"                  ││
│  │  • Instantâneo, sem API                                    ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐│
│  │                   CONTEÚDO DINÂMICO                        ││
│  │                                                             ││
│  │  1. useAutoTranslate('quem_somos', data)                   ││
│  │           │                                                 ││
│  │           ▼                                                 ││
│  │  2. Verifica Cache (memory → localStorage)                 ││
│  │           │                                                 ││
│  │     ┌─────┴─────┐                                          ││
│  │     │ Cache Hit │ → Retorna tradução imediata              ││
│  │     └───────────┘                                          ││
│  │           │                                                 ││
│  │     ┌─────┴─────┐                                          ││
│  │     │Cache Miss │                                          ││
│  │     └───────────┘                                          ││
│  │           │                                                 ││
│  │           ▼                                                 ││
│  │  3. Verifica pendingRequests (deduplicação)                ││
│  │           │                                                 ││
│  │           ▼                                                 ││
│  │  4. Chama Edge Function 'translate'                        ││
│  │           │                                                 ││
│  │           ▼                                                 ││
│  │  5. Lovable AI Gateway (Gemini 2.5 Flash)                  ││
│  │           │                                                 ││
│  │           ▼                                                 ││
│  │  6. Retorna JSON traduzido                                 ││
│  │           │                                                 ││
│  │           ▼                                                 ││
│  │  7. Salva em Cache (memory + localStorage)                 ││
│  │           │                                                 ││
│  │           ▼                                                 ││
│  │  8. Componente re-renderiza com tradução                   ││
│  │                                                             ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10. Recomendações de Melhoria

1. **Implementar tabela de traduções no Supabase** para cache persistente e fallbacks manuais

2. **Adicionar indicador visual** de "traduzindo..." para melhor UX

3. **Aumentar delay entre batches** de 200ms para 500ms

4. **Implementar retry com backoff** para erros de rate limiting

5. **Pré-traduzir conteúdo popular** via job agendado

6. **Monitorar erros de tradução** com logs estruturados

---

## 11. Checklist de QA

- [x] Idiomas suportados: PT, EN, ES
- [x] Detecção automática de idioma do navegador
- [x] Persistência de preferência de idioma
- [x] Traduções estáticas funcionando
- [x] Traduções dinâmicas funcionando (com limitações)
- [x] Cache em memória implementado
- [x] Cache em localStorage implementado
- [x] Deduplicação de requisições implementada
- [x] Preload de traduções implementado
- [ ] Indicador de loading para traduções pendentes
- [ ] Retry automático para rate limiting
- [ ] Fallback manual para traduções
- [ ] Monitoramento de erros de tradução
