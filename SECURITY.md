# Funcionalidades de Segurança - SmartPicks

Este documento descreve as funcionalidades de segurança implementadas no projeto SmartPicks, seguindo as melhores práticas para aplicações web modernas.

## 🔐 Funcionalidades Implementadas

### 1. **Autenticação com JWT**

- ✅ Tokens JWT para autenticação segura
- ✅ Expiração automática de tokens (24h por padrão)
- ✅ Validação de tokens no backend
- ✅ Regeneração de ID de sessão após login

### 2. **Controle de Tentativas de Login**

- ✅ Bloqueio após 5 tentativas falhadas
- ✅ Bloqueio temporário de 15 minutos
- ✅ Identificação por email + fingerprint do cliente
- ✅ Mensagens de erro amigáveis
- ✅ Contador de tempo restante para desbloqueio

### 3. **Guards de Rota (Proteção de Páginas)**

- ✅ `requireAuth`: Protege rotas que precisam de autenticação
- ✅ `requireGuest`: Protege rotas para usuários não logados
- ✅ `initializeAuth`: Inicialização global da autenticação
- ✅ Redirecionamento automático para login quando não autenticado
- ✅ Redirecionamento para página solicitada após login

### 4. **Sanitização de Dados**

- ✅ Sanitização de HTML para prevenir XSS
- ✅ Remoção de caracteres de controle perigosos
- ✅ Limitação de tamanho de inputs
- ✅ Sanitização de emails
- ✅ Validação de força de senha

### 5. **Validações de Formulário Aprimoradas**

- ✅ Campos obrigatórios com mensagens claras
- ✅ Validação de email em tempo real
- ✅ Validação de CPF brasileiro
- ✅ Validação de data de nascimento (maior de idade)
- ✅ Confirmação de senha
- ✅ Prevenção de submissão quando bloqueado

### 6. **Fluxo de Segurança Completo**

- ✅ Login → Autentica → Cria sessão → Regenera ID → Dashboard
- ✅ Acesso direto a páginas restritas → Redirect para login
- ✅ Logout limpa sessão e tokens
- ✅ Validação automática de tokens expirados

## 🛡️ Arquivos de Segurança

### Frontend (`src/`)

```
stores/
├── auth.ts              # Store principal de autenticação
utils/
├── sanitization.ts      # Utilitários de sanitização
router/
├── guards.ts           # Guards de proteção de rotas
pages/
├── DashboardPage.vue   # Página restrita protegida
├── LoginPage.vue       # Login com controle de tentativas
└── CadastroPage.vue    # Cadastro com sanitização
```

### Backend

Este frontend está configurado para se conectar com um **backend em Go** rodando na porta 8080.

**Integração de Segurança**: O frontend envia requisições para endpoints seguros do backend Go que implementa:

- Autenticação JWT
- Hash de senhas
- Validação de dados
- Controle de sessões

## 🔧 Configuração de Segurança

### Frontend → Backend Integration

O frontend faz chamadas para:

```
POST /api/auth/login    - Autenticação
POST /api/auth/register - Cadastro
GET  /api/user/profile  - Dados do usuário
```

**Configuração no axios**: `http://localhost:8080/api`

### Configurações de Segurança Aplicadas

#### Controle de Tentativas de Login

- **Máximo**: 5 tentativas por email/cliente
- **Bloqueio**: 15 minutos
- **Identificação**: Email + fingerprint do navegador

#### JWT Tokens

- **Algoritmo**: HS256
- **Expiração**: 24 horas (configurável)
- **Armazenamento**: localStorage (com limpeza automática)

#### Sanitização

- **XSS**: Escape de caracteres HTML perigosos
- **Tamanho**: Limitação de 1000 caracteres por input
- **Controle**: Remoção de caracteres de controle

## 🚀 Como Testar as Funcionalidades

### 1. Controle de Tentativas de Login

```bash
# Tente fazer login 5 vezes com senha errada
# Observe o bloqueio temporário
# Aguarde 15 minutos ou limpe localStorage para resetar
```

### 2. Proteção de Rotas

```bash
# Tente acessar /dashboard sem estar logado
# Deve redirecionar para login
# Após login, deve voltar para /dashboard
```

### 3. Sanitização

```bash
# Tente inserir HTML no nome: <script>alert('xss')</script>
# Observe que é sanitizado na exibição
```

### 4. Validação de Token

```bash
# Faça login e observe o token no localStorage
# Altere o token manualmente
# Tente acessar página protegida - deve falhar
```

## ⚠️ Considerações de Produção

### Implementar Adicionalmente:

1. **HTTPS obrigatório** em produção
2. **Rate limiting** no servidor
3. **CORS específico** (não usar `*`)
4. **Headers de segurança** (CSP, HSTS, etc.)
5. **Logs de segurança** para auditoria
6. **Blacklist de tokens JWT** para logout forçado
7. **2FA (autenticação de dois fatores)**
8. **Criptografia de dados sensíveis no banco**

### Banco de Dados:

```sql
-- Criar usuário com permissões mínimas
CREATE USER 'smartpicks_user'@'localhost' IDENTIFIED BY 'senha_forte';
GRANT SELECT, INSERT, UPDATE ON smartpicks_db.users TO 'smartpicks_user'@'localhost';
FLUSH PRIVILEGES;
```

### Nginx/Apache:

```nginx
# Headers de segurança
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
```

## 📋 Checklist de Segurança

- [x] **Campos obrigatórios** com validação
- [x] **Mensagens de erro amigáveis**
- [x] **Bloqueio após tentativas falhadas** (5 tentativas / 15 min)
- [x] **Sanitização/escape ao exibir dados**
- [x] **Fluxo de autenticação completo**
- [x] **Proteção de rotas restritas**
- [x] **Regeneração de ID de sessão**
- [x] **Tokens JWT com expiração**
- [x] **Logout seguro**
- [x] **Validação de inputs no frontend e backend**

## 🎯 Próximos Passos Recomendados

1. **Implementar HTTPS** em produção
2. **Configurar rate limiting** (ex: express-rate-limit)
3. **Adicionar logs de auditoria**
4. **Implementar refresh tokens**
5. **Adicionar testes automatizados de segurança**
6. **Configurar monitoramento de tentativas de ataques**

---

✨ **SmartPicks agora possui um sistema de segurança robusto seguindo as melhores práticas da indústria!**
