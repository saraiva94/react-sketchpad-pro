# Porto de Ideias

**Plataforma de conexão entre projetos culturais e investidores**

Desenvolvido por: **[Seu Nome]**  
Tecnologias: React, TypeScript, Vite, Tailwind CSS, Supabase

---

## 📋 Instruções de Uso Geral

### Navegação Pública

1. **Página Inicial** (`/`) - Exibe projetos culturais em destaque, estatísticas da plataforma e informações sobre a missão
2. **Portfólio de Projetos** (`/projetos`) - Lista todos os projetos aprovados com filtros por categoria
3. **Submeter Projeto** (`/submit`) - Formulário público para envio de novos projetos culturais
4. **Visualização de Projeto** (`/project/:id`) - Detalhes completos de um projeto específico

### Como Submeter um Projeto

1. Acesse `/submit`
2. Preencha os dados do responsável (nome, email, telefone)
3. Adicione informações do projeto (título, categoria, descrição)
4. Faça upload de mídia (vídeo, documentos)
5. Adicione membros da equipe
6. Informe dados de financiamento e impacto
7. Clique em "Enviar Projeto"

---

## 🔐 Instruções de Uso do Administrador

### Acesso ao Painel

- **URL**: `/auth`
- **Usuário**: `Admin2025`
- **Senha**: `administradorpi2025`

### Funcionalidades do Admin (`/admin`)

| Função | Descrição |
|--------|-----------|
| **Aprovar/Rejeitar** | Moderar projetos pendentes |
| **Destacar na Home** | Marcar projetos para exibição na página inicial |
| **Editar Projeto** | Alterar imagem, orçamento, localização e notas |
| **Excluir Projeto** | Remover projetos permanentemente |
| **Baixar CSV** | Exportar contatos dos responsáveis em planilha |
| **Limpar Cadastros** | Limpar dados de contato após backup |
| **Mostrar/Ocultar Stats** | Controlar visibilidade das estatísticas na home |

### Adicionar Projeto Manualmente

- Acesse `/admin/add-project` para cadastrar projetos diretamente como aprovados

---

## 🔍 Auditoria do Sistema

### Estrutura de Dados

| Tabela | Função |
|--------|--------|
| `projects` | Projetos com status (pending/approved/rejected) |
| `project_members` | Membros da equipe de cada projeto |
| `profiles` | Perfis de usuários |
| `user_roles` | Controle de permissões (admin/user) |
| `settings` | Configurações da aplicação |

### Políticas de Segurança (RLS)

- ✅ Leitura pública de projetos aprovados
- ✅ Inserção pública para submissões
- ✅ Atualização/exclusão restrita a admins
- ✅ Configurações editáveis apenas por admins

### Funcionalidades Testadas

- [x] Submissão de projetos (público)
- [x] Aprovação/rejeição de projetos
- [x] Destaque na homepage
- [x] Edição e exclusão de projetos
- [x] Upload de arquivos (vídeo/documentos)
- [x] Export CSV de contatos
- [x] Limpeza de cadastros
- [x] Toggle de estatísticas
- [x] Tema claro/escuro
- [x] Menu responsivo mobile

---

## 🚀 Desenvolvimento Local

```bash
# Clonar repositório
git clone <URL_DO_REPOSITORIO>

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

---

## 📄 Licença

Projeto desenvolvido para fins de gestão de projetos culturais.
