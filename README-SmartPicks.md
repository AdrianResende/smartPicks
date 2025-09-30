# SmartPicks - Frontend

Aplicação frontend desenvolvida com Quasar Framework (Vue 3 + TypeScript).

## Estrutura Simplificada

A aplicação foi simplificada e agora contém apenas:

- **Tela de Login** (`/`) - LoginPage.vue
- Estrutura básica do Quasar
- Roteamento simples
- CSS global básico

## Como executar

### Instalar dependências

```bash
npm install
```

### Executar em modo desenvolvimento

```bash
npm run dev
```

Aplicação estará disponível em: http://localhost:9000/

### Build para produção

```bash
npm run build
```

### Outros comandos

```bash
npm run lint    # Verificar código
npm run format  # Formatar código
```

## Estrutura de arquivos principal

```
src/
├── pages/
│   ├── LoginPage.vue      # Tela de login principal
│   ├── IndexPage.vue      # Página índice (não utilizada)
│   └── ErrorNotFound.vue  # Página 404
├── router/
│   ├── index.ts           # Configuração do Vue Router
│   └── routes.ts          # Definição das rotas
├── css/
│   └── app.scss           # Estilos globais
└── App.vue                # Componente raiz
```

## Tela de Login

A tela de login (`LoginPage.vue`) inclui:

- Formulário com campos de e-mail e senha
- Validação básica dos campos
- Design responsivo
- Estilo centrado na tela

## Próximos passos

1. Implemente a lógica de autenticação na `LoginPage.vue`
2. Adicione validação de formulário mais robusta
3. Configure integração com API backend
4. Crie as próximas telas da aplicação
5. Configure o estado global (Pinia) conforme necessário
6. Adicione sistema de roteamento protegido
