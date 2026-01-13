# Instruções de Deploy e Versioning

## Versão Atual
- **v92.0.0** - Versão ativa em desenvolvimento

## Problema: Versão não está sendo publicada em Produção

### Causas Possíveis

1. **Branch não sincronizado**
   - Verificar se a branch `develop` foi mergeada na `main`
   - Comando: `git log main --oneline | head -5`

2. **Build falhando em produção**
   - Verificar se há erros na build da Vercel
   - Acessar: https://vercel.com/parkgestor/settings/deployments

3. **Variáveis de ambiente incompletas**
   - Verificar se todas as env vars estão configuradas na Vercel
   - Necessário: SUPABASE_URL, SUPABASE_ANON_KEY, etc.

4. **Webhook não disparado**
   - GitHub pode não estar enviando eventos para Vercel
   - Verificar Settings > Integrations no repositório

### Solução Rápida

#### 1. Sincronizar Branches
```bash
# Ir para main
git checkout main

# Atualizar com develop
git merge develop

# Enviar para GitHub
git push origin main
```

#### 2. Forçar Deploy na Vercel
- Acessar https://vercel.com/parkgestor
- Clicar em "Redeploy" na versão desejada
- OU: `vercel deploy --prod`

#### 3. Verificar Variáveis de Ambiente
```
NEXT_PUBLIC_SUPABASE_URL=seu_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
```

### Versioning Strategy
- **Patch (92.0.X)**: Correções de bugs
- **Minor (92.X.0)**: Novas funcionalidades
- **Major (X.0.0)**: Mudanças significativas

### Como Fazer Deploy de Uma Versão Específica

1. Tag a versão:
```bash
git tag -a v92.0.0 -m "Release version 92.0.0"
git push origin v92.0.0
```

2. Faça merge para main:
```bash
git checkout main
git merge develop
git push origin main
```

3. Vercel detectará automaticamente e fará deploy

### Monitorar Status de Deploy
- Dashboard Vercel: https://vercel.com/parkgestor
- GitHub Actions: https://github.com/seu-usuario/parkgestor/actions
- Logs de Build: Vercel > [Projeto] > Deployments
