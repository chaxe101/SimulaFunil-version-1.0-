# SimulaFunil - Organize e Apresente Projetos Visuais 🚀

SimulaFunil é uma aplicação web moderna e interativa construída com Next.js, projetada para transformar a maneira como você organiza, visualiza e apresenta seus projetos. A plataforma oferece um canvas visual flexível onde usuários podem mapear ideias e fluxos de trabalho, além de um sistema completo para gestão de tarefas.

## Principais Funcionalidades

- **Canvas Visual Interativo:** Crie mapas de projetos arrastando e soltando blocos de diversos tipos: notas, links da web, imagens, vídeos, áudios e PDFs. Conecte-os para visualizar fluxos e dar vida às suas ideias.
- **Gestão de Tarefas Integrada:** Um conjunto completo de ferramentas para gerenciar o trabalho:
  - **Hub Central:** Um painel com widgets que centralizam e resumem o status do seu projeto (Kanban, Calendário, Anotações).
  - **Quadro Kanban:** Organize tarefas de forma ágil com colunas personalizáveis.
  - **Múltiplas Visualizações:** Gerencie suas tarefas também em formato de Calendário e Linha do Tempo (Timeline).
- **Modo Apresentação:** Transforme seu canvas e módulos em uma apresentação de slides interativa com um único clique. Ideal para apresentar propostas, relatórios ou aulas.
- **Exportação Profissional:** Exporte seus projetos para **PDF** para criar documentos profissionais ou para **JSON** para fazer backups e compartilhar.

## Tecnologias Utilizadas

- **Framework:** [Next.js](https://nextjs.org/) (com App Router)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes UI:** [Shadcn/ui](https://ui.shadcn.com/)
- **Backend e Autenticação:** [Supabase](https://supabase.io/)
- **Processamento de Pagamentos:** [Stripe](https://stripe.com/)
- **IA (Geração de Vídeo):** [Google AI (Genkit)](https://firebase.google.com/docs/genkit)

## Como Rodar o Projeto Localmente

Siga os passos abaixo para configurar e executar a aplicação no seu ambiente de desenvolvimento.

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 20 ou superior)
- `npm` ou `yarn`
- [Git](https://git-scm.com/)

### 1. Clone o Repositório

```bash
git clone https://github.com/fabricio2fb/SimulaFunil--PRO.git
cd SimulaFunil--PRO
```

### 2. Configure a Versão do Node.js (Recomendado)

Se você utiliza o `nvm` (Node Version Manager), execute o comando abaixo para usar a versão correta do Node.js:
```bash
nvm use
```

### 3. Instale as Dependências

```bash
npm install
```

### 4. Configure as Variáveis de Ambiente

Crie um arquivo chamado `.env` na raiz do projeto, copiando o conteúdo de `.env.example`. Você precisará preencher com as suas chaves do Supabase, Stripe e Google AI.

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="SUA_URL_SUPABASE_AQUI"
NEXT_PUBLIC_SUPABASE_ANON_KEY="SUA_CHAVE_ANON_SUPABASE_AQUI"
SUPABASE_SERVICE_ROLE_KEY="SUA_CHAVE_SERVICE_ROLE_SUPABASE_AQUI"

# Stripe
STRIPE_SECRET_KEY="SUA_CHAVE_SECRETA_STRIPE_AQUI"
STRIPE_WEBHOOK_SECRET="SEU_SEGREDO_WEBHOOK_STRIPE_AQUI"
STRIPE_PRICE_ID_MENSAL="SEU_PRICE_ID_DO_PLANO_MENSAL"

# Google AI
GEMINI_API_KEY="SUA_API_KEY_GEMINI_AQUI"

# Bunny.net (para upload de arquivos)
BUNNY_STORAGE_ZONE_NAME="SEU_STORAGE_ZONE_NAME"
BUNNY_ACCESS_KEY="SUA_ACCESS_KEY_DO_STORAGE_ZONE"

# URL do seu site (para os webhooks do Stripe)
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 5. Configure o Banco de Dados com Supabase

1.  Crie um projeto no [Supabase](https://supabase.com/).
2.  Vá para o **SQL Editor** no seu painel do Supabase.
3.  Execute o script SQL localizado em `supabase/schema.sql` para criar todas as tabelas e políticas de segurança necessárias.
4.  Certifique-se de que a autenticação de usuários (Auth) está habilitada no seu projeto Supabase.

### 6. Inicie o Servidor de Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em [http://localhost:3000](http://localhost:3000).
