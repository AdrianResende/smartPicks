# SmartPicks Backend (MySQL)

API mínima em Node.js + Express para conectar o projeto SmartPicks a um banco de dados MySQL.

## Pré-requisitos

- Node.js 20 ou superior (mesmo usado no front-end)
- Banco MySQL acessível

## Configuração

1. Faça uma cópia do arquivo de variáveis de ambiente:

```powershell
Copy-Item .env.example .env
```

2. Edite o arquivo `.env` e preencha com as credenciais reais do seu banco.

## Instalação

```powershell
npm install
```

> Execute o comando acima dentro da pasta `server/`.

## Execução em modo desenvolvimento

```powershell
npm run dev
```

A API ficará disponível por padrão em `http://localhost:3000`.

## Endpoints iniciais

- `GET /health`: verifica se a conexão com o MySQL está funcionando.
- `GET /users`: exemplo de consulta à tabela `users` (ajuste o nome/colunas conforme seu esquema real).
- `POST /auth/register`: cadastra um usuário novo aplicando hash de senha com bcrypt.
- `POST /auth/login`: valida o e-mail/senha comparando com o hash salvo no banco.

## Dicas

- Defina as permissões do usuário MySQL apenas para as tabelas necessárias.
- Ajuste a tabela `users` para conter as colunas `name`, `email`, `password_hash`, `cpf` e `birth_date` (além do `id`).
- Use migrations ou ferramentas como Prisma/Knex para evoluir o schema conforme o projeto crescer.
- Configure HTTPS e autenticação quando publicar em produção.
