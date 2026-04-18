# 🚀 Deploy Agora - Guia Rápido

## Opção 1: Netlify (Mais Fácil) ⭐

### Via Interface Web (Drag & Drop)

1. **Acesse**: https://app.netlify.com/drop
2. **Arraste** a pasta do projeto para a área de upload
3. **Aguarde** o deploy (30-60 segundos)
4. **Pronto!** Seu site está no ar

**URL temporária**: `random-name-123.netlify.app`

### Via CLI (Linha de Comando)

```bash
# 1. Instalar Netlify CLI
npm install -g netlify-cli

# 2. Fazer login
netlify login

# 3. Deploy
netlify deploy --prod

# Ou use o script automatizado:
./deploy.sh
```

---

## Opção 2: Vercel

### Via CLI

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Fazer login
vercel login

# 3. Deploy
vercel --prod

# Ou use o script automatizado:
./deploy.sh
```

### Via Interface Web

1. **Acesse**: https://vercel.com/new
2. **Conecte** seu repositório GitHub
3. **Configure** (deixe padrão)
4. **Deploy**

---

## Opção 3: GitHub Pages

```bash
# 1. Criar repositório no GitHub
# 2. Adicionar remote
git remote add origin https://github.com/seu-usuario/olcan-landing.git

# 3. Push
git add .
git commit -m "Initial commit"
git push -u origin main

# 4. Configurar GitHub Pages
# Settings > Pages > Source: main branch / root
```

---

## Opção 4: Servidor Próprio (VPS/Shared Hosting)

### Via FTP/SFTP

1. **Conecte** ao servidor via FileZilla ou similar
2. **Faça upload** de todos os arquivos para `public_html/` ou `www/`
3. **Configure** permissões (644 para arquivos, 755 para pastas)
4. **Acesse** seu domínio

### Via SSH

```bash
# 1. Conectar ao servidor
ssh usuario@seu-servidor.com

# 2. Navegar para pasta web
cd /var/www/html

# 3. Clonar repositório (se usar Git)
git clone https://github.com/seu-usuario/olcan-landing.git .

# 4. Configurar permissões
chmod -R 755 .
```

---

## ⚙️ Configurações Pós-Deploy

### 1. Domínio Customizado

**Netlify:**
- Settings > Domain management > Add custom domain
- Configure DNS: CNAME www → seu-site.netlify.app

**Vercel:**
- Settings > Domains > Add
- Configure DNS: CNAME www → cname.vercel-dns.com

### 2. SSL/HTTPS

- **Netlify/Vercel**: Automático (Let's Encrypt)
- **Servidor próprio**: Use Certbot

```bash
# Certbot (Ubuntu/Debian)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d olcan.com.br -d www.olcan.com.br
```

### 3. Google Analytics

No `index.html`, linha ~70:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```

Substitua `G-XXXXXXXXXX` pelo seu ID real.

### 4. Google Search Console

1. Acesse: https://search.google.com/search-console
2. Adicione propriedade: https://olcan.com.br
3. Verifique via meta tag ou DNS
4. Envie sitemap: https://olcan.com.br/sitemap.xml

---

## 🧪 Testar Após Deploy

### Checklist Rápido

```bash
# 1. Acessar site
curl -I https://seu-site.com

# 2. Verificar HTTPS
# Deve retornar 200 e ter SSL

# 3. Testar performance
lighthouse https://seu-site.com --view

# 4. Validar HTML
# https://validator.w3.org/
```

### Testes Manuais

- [ ] Site carrega sem erros
- [ ] HTTPS funcionando (cadeado verde)
- [ ] Todas as imagens aparecem
- [ ] CTAs são clicáveis
- [ ] FAQ abre e fecha
- [ ] Responsivo em mobile
- [ ] Tracking funcionando (GA4 Realtime)

---

## 🐛 Troubleshooting

### "Site não carrega"
- Verifique DNS (pode levar até 48h)
- Limpe cache do navegador (Ctrl+Shift+R)
- Verifique se deploy foi bem-sucedido

### "Imagens não aparecem"
- Verifique caminhos (devem ser relativos)
- Verifique se imagens foram enviadas
- Verifique permissões (644)

### "HTTPS não funciona"
- Aguarde alguns minutos (certificado sendo gerado)
- Force HTTPS nas configurações da plataforma
- Verifique se domínio está correto

### "Tracking não funciona"
- Verifique ID do GA4
- Verifique consent banner
- Teste em aba anônima
- Verifique console do navegador

---

## 📊 Monitoramento

### Uptime

**UptimeRobot** (Gratuito):
1. Acesse: https://uptimerobot.com
2. Add New Monitor
3. URL: https://olcan.com.br
4. Configure alertas por email

### Analytics

**Google Analytics 4**:
- Realtime: Veja visitantes ao vivo
- Conversões: Configure `begin_checkout`
- Relatórios: Analise comportamento

### Performance

**PageSpeed Insights**:
- https://pagespeed.web.dev/
- Teste mobile e desktop
- Siga recomendações

---

## 🎯 Métricas de Sucesso

### Primeira Semana
- [ ] Site indexado no Google
- [ ] Lighthouse Performance > 80
- [ ] Lighthouse Accessibility > 90
- [ ] Primeiras conversões registradas

### Primeiro Mês
- [ ] Tráfego > 1000 visitantes
- [ ] Taxa de conversão > 2%
- [ ] Tempo médio > 1:30 min
- [ ] Bounce rate < 60%

---

## 📞 Suporte

### Plataformas
- **Netlify**: https://docs.netlify.com
- **Vercel**: https://vercel.com/docs
- **GitHub Pages**: https://pages.github.com

### Olcan
- 📧 Email: contato@olcan.com.br
- 💬 WhatsApp: (11) 99999-9999

---

## 🎉 Pronto!

Seu site está no ar! 🚀

**Próximos passos:**
1. Compartilhe nas redes sociais
2. Envie para sua lista de email
3. Configure campanhas de anúncios
4. Monitore métricas diariamente

**Boa sorte com o lançamento! 💪**
