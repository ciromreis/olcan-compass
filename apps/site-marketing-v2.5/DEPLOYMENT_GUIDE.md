# 🚀 Guia de Deployment Seguro — Olcan Website

**Objetivo:** Migrar olcan.com.br do Wix para Vercel (gratuito) sem downtime  
**Estratégia:** Deploy em URL temporária → Testes → Migração DNS  
**Data:** Abril 2026

---

## ✅ Pré-requisitos Verificados

- [x] Build de produção testado e funcionando
- [x] 18 páginas estáticas geradas com sucesso
- [x] Todas as dependências instaladas
- [x] Configuração Next.js otimizada
- [x] Variáveis de ambiente documentadas

---

## 📦 Fase 1: Deploy na Vercel (Gratuito)

### Opção A: Deploy via CLI (Recomendado)

1. **Instalar Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login na Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy do Projeto:**
   ```bash
   cd /Users/ciromoraes/Documents/THE-Code-Base/01_Olcan_Active/olcan-compass/apps/site-marketing-v2.5
   vercel
   ```

4. **Responder às perguntas:**
   - Set up and deploy? → **Yes**
   - Which scope? → Sua conta pessoal
   - Link to existing project? → **No**
   - Project name? → **olcan-website** (ou outro nome)
   - Directory? → **./** (pressione Enter)
   - Override settings? → **No**

5. **Aguardar deploy:**
   - Vercel vai fazer build e deploy automaticamente
   - Você receberá uma URL temporária: `https://olcan-website-xxx.vercel.app`

### Opção B: Deploy via Dashboard (Mais Visual)

1. **Acessar:** https://vercel.com/new
2. **Importar repositório Git** ou **fazer upload manual**
3. **Configurar projeto:**
   - Framework Preset: **Next.js**
   - Root Directory: `apps/site-marketing-v2.5`
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. **Deploy**

---

## 🔧 Fase 2: Configurar Variáveis de Ambiente na Vercel

Após o deploy, configure as variáveis de ambiente no dashboard da Vercel:

1. **Acessar:** https://vercel.com/[seu-projeto]/settings/environment-variables

2. **Adicionar variáveis:**

| Nome | Valor | Ambiente |
|------|-------|----------|
| `NEXT_PUBLIC_SITE_URL` | `https://www.olcan.com.br` | Production |
| `NEXT_PUBLIC_GA_ID` | (seu Google Analytics ID) | Production |
| `NEXT_PUBLIC_META_PIXEL_ID` | (seu Meta Pixel ID) | Production |
| `NEXT_PUBLIC_MAUTIC_URL` | (sua URL do Mautic) | Production |
| `EMAIL_FROM` | `contato@olcan.com.br` | Production |

3. **Redeploy** após adicionar variáveis:
   ```bash
   vercel --prod
   ```

---

## 🧪 Fase 3: Testar URL Temporária

**URL de teste:** `https://olcan-website-xxx.vercel.app`

### Checklist de Testes:

#### Desktop (Chrome, Firefox, Safari)
- [ ] Página inicial carrega corretamente
- [ ] Todas as imagens aparecem
- [ ] Links de navegação funcionam
- [ ] Links de produtos (Hotmart/Zenklub) abrem corretamente
- [ ] Formulários funcionam (se houver)
- [ ] Blog carrega posts do Substack
- [ ] Footer com CNPJ e informações legais

#### Mobile (iOS e Android)
- [ ] Layout responsivo funciona
- [ ] Menu mobile abre/fecha
- [ ] Botões são clicáveis
- [ ] Textos legíveis
- [ ] Performance aceitável

#### Links Críticos para Testar:
- [ ] `/` - Home
- [ ] `/sobre` - Sobre a Olcan
- [ ] `/sobre/ceo` - Página do Ciro (acessível via /sobre)
- [ ] `/marketplace` - Produtos
- [ ] `/marketplace/curso-cidadao-mundo` → Hotmart
- [ ] `/marketplace/kit-application` → Hotmart
- [ ] `/marketplace/rota-internacionalizacao` → Hotmart
- [ ] `/ciro` → Zenklub
- [ ] `/blog` - Blog
- [ ] `/diagnostico` - Diagnóstico
- [ ] `/contato` - Contato

---

## 🌐 Fase 4: Adicionar Domínio Personalizado na Vercel

**IMPORTANTE:** Faça isso ANTES de mexer no DNS do Wix!

1. **No dashboard da Vercel:**
   - Vá em Settings → Domains
   - Clique em "Add Domain"
   - Digite: `olcan.com.br`
   - Digite: `www.olcan.com.br`

2. **Vercel vai fornecer os registros DNS:**
   ```
   Tipo A:
   Host: @
   Value: 76.76.21.21 (exemplo - use o IP que a Vercel fornecer)
   
   Tipo CNAME:
   Host: www
   Value: cname.vercel-dns.com (exemplo - use o que a Vercel fornecer)
   ```

3. **Anotar esses valores** - você vai precisar deles na próxima fase

---

## 🔄 Fase 5: Migração DNS (O Momento Crítico)

### Descobrir onde seu domínio está registrado:

1. **Verificar no Wix:**
   - Login em wix.com
   - Vá em "Meus Sites" → "Domínios"
   - Clique em `olcan.com.br`
   - Verifique se diz "Registrado na Wix" ou "Conectado de outro lugar"

### Cenário A: Domínio registrado na Wix

1. **No painel Wix:**
   - Domínios → olcan.com.br → "Gerenciar DNS"
   
2. **Atualizar registros:**
   - **Deletar** o registro A existente que aponta para Wix
   - **Adicionar** novo registro A com IP da Vercel
   - **Atualizar** registro CNAME de `www` para apontar para Vercel

3. **Preservar MX Records (EMAIL):**
   - ⚠️ **NÃO DELETAR** registros MX
   - Se você tem email `@olcan.com.br`, mantenha os registros MX intactos

### Cenário B: Domínio registrado em Registro.br

1. **Login em registro.br**
2. **Meus Domínios → olcan.com.br → DNS**
3. **Alterar nameservers** ou **editar zona DNS:**
   - Adicionar registro A: `@` → IP da Vercel
   - Adicionar CNAME: `www` → `cname.vercel-dns.com`
   - **Manter registros MX** se tiver email

---

## ⏱️ Fase 6: Propagação DNS (24-48 horas)

### O que acontece:

- **Primeiras horas:** Algumas pessoas veem site novo, outras veem Wix
- **6-12 horas:** Maioria já vê site novo
- **24-48 horas:** 100% dos usuários veem site novo

### Verificar propagação:

1. **Ferramenta online:**
   - https://www.whatsmydns.net
   - Digite: `olcan.com.br`
   - Tipo: A
   - Deve mostrar o IP da Vercel

2. **Comando terminal:**
   ```bash
   dig olcan.com.br
   nslookup olcan.com.br
   ```

### Durante a propagação:

- ✅ **Mantenha Wix ativo** por 48h
- ✅ **Não cancele assinatura Wix** ainda
- ✅ **Monitore erros** no dashboard Vercel
- ✅ **Teste periodicamente** olcan.com.br

---

## 🔒 Fase 7: SSL/HTTPS Automático

A Vercel configura SSL automaticamente:

1. **Após DNS propagar**, Vercel detecta o domínio
2. **Certificado SSL** é gerado automaticamente (Let's Encrypt)
3. **HTTPS ativado** em ~10 minutos
4. **Redirecionamento HTTP → HTTPS** configurado automaticamente

Você verá o cadeado 🔒 no navegador quando estiver pronto.

---

## ✅ Fase 8: Verificação Pós-Deploy

### Após 48h de propagação:

- [ ] Site acessível em `https://olcan.com.br`
- [ ] Site acessível em `https://www.olcan.com.br`
- [ ] Certificado SSL válido (cadeado verde)
- [ ] Todos os links funcionando
- [ ] Formulários enviando
- [ ] Analytics funcionando (se configurado)
- [ ] Email `@olcan.com.br` funcionando (se aplicável)

### Cancelar Wix:

**Somente após confirmar que tudo funciona por 48-72h:**

1. Login no Wix
2. Meus Sites → Configurações → Assinatura
3. Cancelar assinatura do site
4. **Manter domínio** se registrado no Wix (ou transferir para outro registrar)

---

## 🆘 Troubleshooting

### Site não carrega após mudar DNS:

1. **Verificar propagação:** Use whatsmydns.net
2. **Limpar cache DNS local:**
   ```bash
   # Mac
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
   
   # Windows
   ipconfig /flushdns
   ```
3. **Testar em modo anônimo** do navegador

### Certificado SSL não ativa:

1. Aguardar 1-2 horas após DNS propagar
2. No Vercel: Settings → Domains → Renew Certificate
3. Verificar se DNS está correto

### Email parou de funcionar:

1. **Verificar registros MX** no DNS
2. **Restaurar registros MX** se foram deletados acidentalmente
3. Contatar suporte do provedor de email

### Reverter para Wix (emergência):

1. **No DNS**, mudar registros A e CNAME de volta para Wix
2. Aguardar propagação (1-6 horas)
3. Site volta a funcionar no Wix

---

## 📊 Monitoramento Contínuo

### Dashboard Vercel:

- **Analytics:** Visualizações, performance
- **Logs:** Erros e avisos
- **Deployments:** Histórico de deploys

### Ferramentas Recomendadas:

- **Google Analytics:** Tráfego e conversões
- **Google Search Console:** SEO e indexação
- **Uptime Robot:** Monitorar disponibilidade (gratuito)

---

## 💰 Custos

### Vercel Free Tier:
- ✅ **100 GB bandwidth/mês** (suficiente para ~100k visitantes)
- ✅ **Builds ilimitados**
- ✅ **SSL gratuito**
- ✅ **CDN global**
- ✅ **Preview deployments**

### Quando upgrade é necessário:
- Mais de 100 GB/mês de tráfego
- Mais de 100 deployments/dia
- Precisa de analytics avançado

**Para Olcan:** Free tier é mais que suficiente inicialmente.

---

## 🎯 Comandos Rápidos

```bash
# Deploy para produção
vercel --prod

# Ver logs em tempo real
vercel logs

# Listar deployments
vercel ls

# Remover deployment antigo
vercel rm [deployment-url]

# Ver domínios configurados
vercel domains ls
```

---

## 📞 Suporte

- **Vercel Docs:** https://vercel.com/docs
- **Vercel Support:** support@vercel.com
- **Community:** https://github.com/vercel/vercel/discussions

---

**Última atualização:** Abril 2026  
**Status:** ✅ Pronto para deployment  
**Próximo passo:** Executar `vercel` no terminal
