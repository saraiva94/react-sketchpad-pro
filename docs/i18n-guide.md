# 🌍 Guia de Internacionalização (i18n)

## Sistema de Tradução

O projeto usa um sistema híbrido de tradução:

1. **Estático** (`src/lib/i18n.ts`): Para textos de interface (botões, labels, mensagens)
2. **Dinâmico** (API + Cache): Para conteúdo do banco de dados (projetos, membros, contrapartidas)

---

## Regras Obrigatórias

### 1. Textos Estáticos (interface)

Use o objeto `translations` via hook `useLanguage`:

```tsx
import { useLanguage } from "@/hooks/useLanguage";

const { t } = useLanguage();

<button>{t.common.save}</button>
<h1>{t.home.title}</h1>
```

Se uma chave não existir, adicione em `src/lib/i18n.ts` para PT, EN e ES.

### 2. Dados do Banco (conteúdo dinâmico)

Use `<TranslatedText>` ou `useAutoTranslate`:

```tsx
import { TranslatedText } from "@/components/TranslatedText";

<TranslatedText 
  namespace="project_full_{id}_title"
  value={project.title}
/>
```

Ou com hook (para lógica condicional):

```tsx
import { useAutoTranslate } from "@/hooks/useAutoTranslate";

const { translated: translatedTitle, isTranslating } = useAutoTranslate(
  `project_full_${project.id}_title`,
  project.title
);

const displayTitle = language === "pt" ? project.title : (translatedTitle || project.title);
```

---

## Padrão de Namespaces

SEMPRE use estes prefixos padronizados para garantir cache hit e evitar traduções duplicadas:

### Projetos
```
project_full_{projectId}_title
project_full_{projectId}_synopsis
project_full_{projectId}_description
project_full_{projectId}_location
project_full_{projectId}_category
project_full_{projectId}_impacto_cultural
project_full_{projectId}_impacto_social
project_full_{projectId}_publico_alvo
project_full_{projectId}_diferenciais
project_full_{projectId}_additional_info
```

### Tipos de Projeto (global, reutilizável)
```
project_type              # O valor do tipo é usado como hash
```

### Membros da Equipe (global, reutilizável por conteúdo)
```
member_funcao             # Hash diferencia por conteúdo
member_detalhes           # Hash diferencia por conteúdo
```

### Contrapartidas
```
contrapartida_titulo_{contrapartidaId}
contrapartida_beneficios_{contrapartidaId}
```

### Localizações
```
location_{projectId}      # Localização específica do projeto
```

### Categorias/Tags (global)
```
category_{categoryName}
```

### Lei de Incentivo (global)
```
incentive_law_label       # Hash diferencia por conteúdo
```

---

## Componentes Disponíveis

| Componente | Uso |
|------------|-----|
| `TranslatedText` | Texto simples com loading automático |
| `TranslatedBadge` | Badge com tradução |
| `TranslatedSelect` | Select com opções traduzidas |
| `TranslatedMemberCard` | Card de membro da equipe |
| `TranslatedContrapartidaCard` | Card de contrapartida |
| `TranslatedServiceCard` | Card de serviço |
| `TranslatedProjectCard` | Card de projeto |

---

## Preload de Traduções

Para otimizar performance, use `usePreloadTranslations` para carregar traduções antecipadamente:

```tsx
import { usePreloadTranslations, createTranslationItems } from "@/hooks/usePreloadTranslations";

// Criar lista de itens para traduzir
const preloadItems = [
  ...createTranslationItems.forProject(projectId, project),
  ...createTranslationItems.forMembers(projectId, members),
  ...createTranslationItems.forContrapartidas(contrapartidas),
];

// Executar preload quando dados estiverem disponíveis
usePreloadTranslations(preloadItems, !loading && !!project);
```

---

## Novos Componentes

NUNCA use textos hardcoded em português. Sempre:

1. **Para UI estática**: Adicione em `src/lib/i18n.ts`
2. **Para dados dinâmicos**: Use `TranslatedText` ou `useAutoTranslate`

### Exemplo Correto

```tsx
// ✅ CORRETO
const { t } = useLanguage();
<button>{t.common.save}</button>

// ✅ CORRETO
<TranslatedText namespace={`project_full_${id}_title`} value={project.title} />

// ❌ ERRADO - Texto hardcoded
<button>Salvar</button>

// ❌ ERRADO - Renderização direta
<h1>{project.title}</h1>
```

---

## Cache de Traduções

O sistema usa cache de 3 camadas:

1. **Memória** (mais rápido, volátil)
2. **localStorage** (persistente no navegador)
3. **Supabase DB** (persistente, compartilhado entre usuários)

### Limpar Cache

Para debug, use no console:

```js
// Limpar todo o cache
translationManager.clearCache();

// Limpar cache de um idioma específico
translationManager.clearCacheForLanguage('en');
```

---

## Rate Limiting

A API de tradução tem rate limiting. O sistema gerencia automaticamente com:

- **Fila de requisições**: Processadas em lotes
- **Retry com backoff**: Tentativas automáticas com delay crescente
- **Fallback**: Em caso de erro, exibe texto original

Configuração atual:
- `batchSize`: 2 traduções por lote
- `batchDelay`: 800ms entre lotes
- `maxRetries`: 4 tentativas
- `retryDelay`: 1500ms base (aumenta exponencialmente)

---

## Checklist para Novos Recursos

- [ ] Textos de UI adicionados em `src/lib/i18n.ts` (PT, EN, ES)
- [ ] Dados dinâmicos envolvidos em `TranslatedText` ou `useAutoTranslate`
- [ ] Namespaces seguindo padrão `*_full_*` quando aplicável
- [ ] Preload configurado para páginas com muitos dados
- [ ] Teste em todos os 3 idiomas (PT, EN, ES)
