# 🧠 SmartPicks Frontend

> Sistema inteligente de recomendações construído com Vue 3, Quasar Framework e TypeScript

[![Quasar](https://img.shields.io/badge/Quasar-v2.18.5-1976D2?style=flat&logo=quasar)](https://quasar.dev/)
[![Vue.js](https://img.shields.io/badge/Vue.js-v3-4FC08D?style=flat&logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Pinia](https://img.shields.io/badge/Pinia-Store-FFD859?style=flat)](https://pinia.vuejs.org/)

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Fluxo da Aplicação](#-fluxo-da-aplicação)
- [Arquitetura](#-arquitetura)
- [Instalação](#-instalação)
- [Comandos Úteis](#-comandos-úteis)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Guia de Desenvolvimento](#-guia-de-desenvolvimento)
- [Autenticação](#-autenticação)
- [Componentes Principais](#-componentes-principais)
- [Troubleshooting](#-troubleshooting)
- [Contribuindo](#-contribuindo)

## 🎯 Sobre o Projeto

SmartPicks é uma aplicação web moderna que oferece recomendações inteligentes através de uma interface amigável e responsiva. Construída com as melhores práticas de desenvolvimento frontend.

### Tecnologias Principais

- **Framework UI**: Quasar Framework v2.18.5
- **Framework JavaScript**: Vue 3 (Composition API)
- **Linguagem**: TypeScript (strict mode)
- **Gerenciamento de Estado**: Pinia
- **Roteamento**: Vue Router com guards personalizados
- **HTTP Client**: Axios com interceptors
- **Notificações**: Vue3-Toastify
- **Build Tool**: Vite
- **Linting**: ESLint 9
- **Internacionalização**: Vue I18n

### Fluxo de Autenticação Detalhado

1. **Acesso Inicial** → Guard `initializeAuth` valida token no localStorage
2. **Login** → `POST /auth/login` → Token + User salvos → Redirect `/dashboard`
3. **Cadastro** → `POST /auth/cadastro` → Mensagem de sucesso → Redirect `/login`
4. **Dashboard** → Guard `requireAuth` valida autenticação → Mostra conteúdo
5. **Logout** → Limpa state + localStorage → Redirect `/login`

### Fluxo de Guards (Router)

```
Navegação Iniciada
    ↓
initializeAuth (global)
    ↓
requireAuth (rotas protegidas) OU requireGuest (login/cadastro)
    ↓
Componente Renderizado
```

## 🏗️ Arquitetura

### Camadas da Aplicação

```
┌─────────────────────────────────────┐
│         Components (UI)              │
│  Componentes Vue reutilizáveis       │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│       Pages (Views)                  │
│  LoginPage, CadastroPage, Dashboard  │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│      Router + Guards                 │
│  Proteção de rotas e navegação       │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│      Store (Pinia)                   │
│  Estado global da aplicação          │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│      API Layer (Axios)               │
│  Comunicação com backend             │
└─────────────────────────────────────┘
```

### Padrões Utilizados

- **Composition API**: Lógica reutilizável e tipagem forte
- **Store Modules**: Separação de concerns (auth, etc.)
- **Route Guards**: Proteção de rotas com validação assíncrona
- **Utility Classes**: Quasar classes para estilização
- **Error Handling**: Tratamento centralizado com toast notifications
- **Type Safety**: TypeScript strict mode em toda aplicação

## 🚀 Instalação

### Pré-requisitos

- Node.js >= 18.x
- npm >= 9.x ou yarn >= 1.22

### Passo a Passo

```bash
# 1. Clone o repositório
git clone https://github.com/AdrianResende/smartPicks.git
cd smartPicks/FrontEnd/smartPicks

# 2. Instale as dependências
npm install

# 3. Configure variáveis de ambiente (se necessário)
# Edite src/boot/axios.ts para alterar baseURL da API

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:9000`

## 📦 Comandos Úteis

### Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev
# ou
quasar dev

# Rodar em modo PWA
quasar dev -m pwa

# Rodar em modo Electron
quasar dev -m electron
```

### Qualidade de Código

```bash
# Executar linter
npm run lint

# Executar linter e corrigir automaticamente
npm run lint -- --fix

# Formatar código
npm run format
```

### Build

```bash
# Build para produção (SPA)
npm run build
# ou
quasar build

# Build para PWA
quasar build -m pwa

# Build para Electron
quasar build -m electron
```

### Utilitários

```bash
# Limpar cache e node_modules
npx quasar clean

# Informações sobre Quasar
quasar info

# Criar componente
quasar new component NomeDoComponente

# Criar página
quasar new page NomeDaPagina
```

## 📁 Estrutura de Pastas

```
smartPicks/
├── public/                    # Arquivos estáticos
│   └── icons/                 # Ícones da aplicação
├── src/
│   ├── assets/                # Recursos estáticos (imagens, etc.)
│   ├── boot/                  # Arquivos de boot do Quasar
│   │   ├── axios.ts           # Configuração Axios (baseURL, withCredentials)
│   │   ├── i18n.ts            # Configuração internacionalização
│   │   └── toastify.ts        # Configuração toast notifications
│   ├── components/            # Componentes reutilizáveis
│   │   └── Header.vue     # Layout principal (header condicional)
│   │   └── UseAvatar.vue     # Layout principal (header condicional)
│   ├── css/                   # Estilos globais
│   │   ├── app.scss           # Estilos customizados
│   │   └── quasar.variables.scss
│   ├── i18n/                  # Traduções
│   │   └── en-US/             # Inglês (padrão)
│   ├── pages/                 # Páginas/Views
│   │   ├── LoginPage.vue      # Página de login
│   │   ├── CadastroPage.vue   # Página de cadastro
│   │   ├── DashboardPage.vue  # Dashboard principal
│   │   └── ErrorNotFound.vue  # Página 404
│   ├── router/                # Configuração de rotas
│   │   ├── index.ts           # Setup do router
│   │   ├── routes.ts          # Definição de rotas
│   │   └── guards.ts          # Guards de navegação
│   ├── stores/                # Stores Pinia
│   │   ├── index.ts           # Setup do Pinia
│   │   └── auth.ts            # Store de autenticação
│   ├── utils/                 # Utilitários
│   │   └── sanitization.ts    # Funções de sanitização
│   ├── App.vue                # Componente raiz
│   └── env.d.ts               # Declarações TypeScript
├── eslint.config.js           # Configuração ESLint
├── tsconfig.json              # Configuração TypeScript
├── quasar.config.ts           # Configuração Quasar
└── package.json               # Dependências do projeto
```

## 🛠️ Guia de Desenvolvimento

### Criando uma Nova Página

1. **Criar componente** em `src/pages/`:

```vue
<template>
  <q-page class="flex flex-center">
    <h1>Minha Nova Página</h1>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'MinhaNovaPage',
  setup() {
    return {};
  },
});
</script>
```

2. **Adicionar rota** em `src/router/routes.ts`:

```typescript
{
  path: '/minha-pagina',
  component: () => import('pages/MinhaNovaPage.vue'),
  meta: { requiresAuth: true }, // se precisar de autenticação
}
```

### Adicionando um Guard

Em `src/router/guards.ts`:

```typescript
export const meuGuard: NavigationGuard = async (to, from, next) => {
  // Sua lógica aqui
  if (condicao) {
    next();
  } else {
    next({ name: 'login' });
  }
};
```

Registre em `src/router/index.ts`:

```typescript
router.beforeEach(meuGuard);
```

### Usando a Store de Auth

```typescript
import { useAuthStore } from 'src/stores/auth';

const authStore = useAuthStore();

// Verificar autenticação
if (authStore.isAuthenticated) {
  // Usuário logado
}

// Verificar se é admin
if (authStore.isAdmin) {
  // Usuário é admin
}

// Fazer login
await authStore.login(email, senha);

// Fazer logout
await authStore.logout();

// Validar token
const isValid = await authStore.validateToken();
```

### Exibindo Notificações

```typescript
import { toast } from 'vue3-toastify';

// Sucesso
toast.success('Operação realizada com sucesso!');

// Erro
toast.error('Ocorreu um erro!');

// Info
toast.info('Informação importante');

// Warning
toast.warning('Atenção!');
```

### Usando Classes do Quasar

```vue
<template>
  <!-- Layout Flex -->
  <div class="flex flex-center q-pa-md">
    <!-- Texto -->
    <h1 class="text-h4 text-weight-bold text-primary q-mb-md">Título</h1>

    <!-- Espaçamento -->
    <div class="q-mt-lg q-px-md">
      <!-- Cores -->
      <p class="text-grey-7 bg-grey-1 q-pa-sm">Conteúdo</p>
    </div>

    <!-- Grid Responsivo -->
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">Coluna 1</div>
      <div class="col-12 col-md-6">Coluna 2</div>
    </div>
  </div>
</template>
```

## 🔐 Autenticação

### Fluxo de Token

A aplicação suporta **dois métodos de autenticação**:

1. **Bearer Token** (localStorage):
   - Token salvo após login
   - Enviado no header `Authorization: Bearer {token}`
   - Usado para validação de rotas

2. **Session Cookie**:
   - Cookie httpOnly definido pelo backend
   - Axios configurado com `withCredentials: true`
   - Usado como fallback se token não existir

### Estrutura da Store Auth

```typescript
interface User {
  id: string;
  nome: string;
  email: string;
  perfil: string; // 'administrador' | 'comum'
}

interface AuthState {
  user: User | null;
  token: string | null;
}
```

### Guards Implementados

- **`initializeAuth`**: Valida token no load inicial
- **`requireAuth`**: Protege rotas que precisam de login
- **`requireGuest`**: Redireciona usuários logados (login/cadastro)

### Endpoints de Auth

```typescript
// Login
POST /auth/login
Body: { email: string, senha: string }
Response: { token: string, nome: string, email: string, perfil: string }

// Validar Token
POST /auth/validate
Headers: { Authorization: Bearer {token} }
Response: { valido: boolean, usuario: User }

// Verificar Permissões (fallback cookie)
POST /auth/checkUserPermissions
Response: { nome: string, email: string, perfil: string }
```

## 🎨 Componentes Principais

### Header.vue

Header condicional que aparece apenas quando usuário está autenticado:

- Logo SmartPicks (link para dashboard)
- Badge de perfil (Admin/Usuário)
- Email do usuário
- Botão de logout

### LoginPage.vue

- Formulário de login com validação
- Email e senha obrigatórios
- Link para cadastro
- Toast notifications para feedback
- Redirecionamento após login bem-sucedido

### CadastroPage.vue

- Formulário completo de cadastro
- Validações frontend
- Exibição de erros do backend em toast
- Redirecionamento para login após sucesso

### DashboardPage.vue

- Página inicial após login
- Mensagem de boas-vindas personalizada
- Ícone do SmartPicks
- Indicador de perfil (Admin/Usuário)
- Design minimalista com Quasar utilities

## 🐛 Troubleshooting

### Problema: Login retorna 200 mas não redireciona

**Solução**: Verificar se formulário tem `@submit.prevent`:

```vue
<form @submit.prevent="handleLogin"></form>
```

### Problema: Token inválido mesmo após login

**Solução**: Verificar ordem dos guards no router:

```typescript
// Correto: initializeAuth antes de outras guards
router.beforeEach(initializeAuth);
router.beforeEach(requireAuth);
```

### Problema: Header aparece em páginas de login

**Solução**: Header.vue deve ter `v-if`:

```vue
<q-header v-if="authStore.isAuthenticated"></q-header>
```

### Problema: Erros do backend não aparecem

**Solução**: Verificar estrutura do catch:

```typescript
try {
  await api.post('/endpoint');
} catch (error: any) {
  const errorMessages = extractErrorMessages(error);
  errorMessages.forEach((msg) => toast.error(msg));
}
```

### Problema: Build falha com erros de lint

**Solução**: Executar lint antes do build:

```bash
npm run lint -- --fix
npm run build
```

### Problema: Componente não atualiza após mudança no store

**Solução**: Usar computed para reatividade:

```typescript
import { computed } from 'vue';

const isAdmin = computed(() => authStore.isAdmin);
```

### Problema: Erro de CORS

**Solução**: Backend deve configurar CORS corretamente e frontend usar `withCredentials`:

```typescript
// boot/axios.ts
api.defaults.withCredentials = true;
```

## 📝 Boas Práticas

### TypeScript

- ✅ Sempre tipar props e emits
- ✅ Usar interfaces para objetos complexos
- ✅ Evitar `any`, preferir `unknown`
- ✅ Usar strict mode

### Vue/Quasar

- ✅ Preferir Composition API
- ✅ Usar classes do Quasar em vez de CSS customizado
- ✅ Componentizar código reutilizável
- ✅ Usar `computed` para valores derivados
- ✅ Usar `ref` para valores reativos simples

### Estado

- ✅ Stores Pinia para estado global
- ✅ `ref`/`reactive` para estado local
- ✅ Evitar mutação direta do estado
- ✅ Actions para lógica assíncrona

### Segurança

- ✅ Sanitizar inputs do usuário
- ✅ Validar dados no frontend E backend
- ✅ Não expor tokens em logs
- ✅ Usar HTTPS em produção
- ✅ Implementar rate limiting

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Padrão de Commits

```
feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação
style: formatação de código
refactor: refatoração sem alterar funcionalidade
test: adiciona ou corrige testes
chore: tarefas de manutenção
```

## 📄 Licença

Este projeto está sob licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Time

- **Desenvolvedor Principal**: Adrian Resende

## 🔗 Links Úteis

- [Documentação Quasar](https://quasar.dev/)
- [Vue 3 Documentation](https://vuejs.org/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vue Router](https://router.vuejs.org/)

---

⭐ **Feito com Vue 3 + Quasar Framework**
