# 🚀 SmartPicks - Workflow de Branches

## 📋 Estrutura de Branches

### 🔧 **Development** (`development`)
- **Propósito:** Desenvolvimento local
- **Backend:** `http://localhost:8080/api`
- **Uso:** Para desenvolvimento e testes locais

### 🌐 **Production** (`production`) 
- **Propósito:** Produção/Deploy
- **Backend:** `https://backend-smart-picks.vercel.app/api`
- **Deploy:** Automático para Firebase via GitHub Actions

### 📚 **Master** (`master`)
- **Propósito:** Branch principal
- **Status:** Sincronizada com production

## 🔄 Workflow Recomendado

### Para Desenvolvimento:
```bash
# Mudar para branch de desenvolvimento
git checkout development

# Desenvolver suas funcionalidades
# O backend local deve estar rodando em localhost:8080

# Fazer commit das mudanças
git add .
git commit -m "feat: nova funcionalidade"
git push origin development
```

### Para Deploy em Produção:
```bash
# Após testar em development, fazer merge para production
git checkout production
git merge development

# Push para production (deploy automático)
git push origin production
```

### Sincronizar Master:
```bash
# Manter master atualizada com production
git checkout master
git merge production
git push origin master
```

## 🏗️ Configuração Local

### Desenvolvimento:
1. `git checkout development`
2. Inicie seu backend local na porta 8080
3. `npm run dev`

### Produção:
1. `git checkout production`  
2. `npm run build` (para testar)
3. Deploy automático via GitHub Actions

## 🔗 URLs

- **Local:** http://localhost:9000
- **Produção:** https://smartpicks-88709.web.app
- **Backend Prod:** https://backend-smart-picks.vercel.app

## 🛠️ Scripts Disponíveis

```bash
npm run dev      # Desenvolvimento local
npm run build    # Build para produção
npm run lint     # Verificar código
```