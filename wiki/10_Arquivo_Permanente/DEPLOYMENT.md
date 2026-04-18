# Guia de Deploy - Olcan Landing Page

## 📋 Checklist Pré-Deploy

### 1. Configurações Obrigatórias

- [ ] **Google Analytics 4**: Substituir `G-XXXXXXXXXX` no `index.html` pelo seu ID real
- [ ] **Mautic**: Configurar URL e endpoint em `assets/js/forms.js`
- [ ] **Imagens**: Adicionar imagens reais nos diretórios:
  - `assets/images/hero/kit-mockup.jpg` (e .webp)
  - `assets/images/testimonials/avatar-placeholder.jpg` (e .webp)
  - `assets/images/og-image.jpg` (1200x630px para redes sociais)
- [ ] **Contatos**: Atualizar email e WhatsApp no footer
- [ ] **URLs**: Atualizar domínio em meta tags, sitemap.xml e canonical

### 2. Otimizações de Performance

#### Minificação
```bash
# CSS (usando cssnano ou similar)
npx cssnano assets/css/main.css assets/css/main.min.css

# JavaScript (usando terser ou similar)
npx terser assets/js/main.js -o assets/js/main.min.js
```

#### Compressão de Imagens
```bash
# Converter para WebP
cwebp -q 80 input.jpg -o output.webp

# Otimizar JPEG
jpegoptim --max=85 *.jpg

# Otimizar PNG
optipng -o7 *.png
```

### 3. Testes Locais

- [ ] Testar em Chrome, Firefox, Safari, Edge
- [ ] Testar em mobile (iOS Safari, Chrome Mobile)
- [ ] Validar HTML: https://validator.w3.org/
- [ ] Testar responsividade em diferentes resoluções
- [ ] Verificar todos os links e CTAs
- [ ] Testar formulários (se implementados)
- [ ] Verificar console do navegador (sem erros)

## 🚀 Deploy em Diferentes Plataformas

### Netlify (Recomendado)

1. **Via Git**
```bash
# Conectar repositório ao Netlify
# Build settings:
# - Build command: (deixar vazio)
# - Publish directory: .
```

2. **Via Drag & Drop**
- Acesse https://app.netlify.com/drop
- Arraste a pasta do projeto
- Pronto!

3. **Configurações Netlify**
```toml
# netlify.toml
[build]
  publish = "."

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "*.jpg"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "*.webp"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy para produção
vercel --prod
```

### AWS S3 + CloudFront

```bash
# 1. Criar bucket S3
aws s3 mb s3://olcan-landing-page

# 2. Configurar como website
aws s3 website s3://olcan-landing-page --index-document index.html

# 3. Upload dos arquivos
aws s3 sync . s3://olcan-landing-page --exclude ".git/*" --exclude "node_modules/*"

# 4. Configurar CloudFront (via console AWS)
# - Origin: S3 bucket
# - Viewer Protocol Policy: Redirect HTTP to HTTPS
# - Compress Objects Automatically: Yes
```

### GitHub Pages

```bash
# 1. Criar repositório no GitHub
# 2. Push do código

# 3. Configurar GitHub Pages
# Settings > Pages > Source: main branch / root

# 4. Domínio customizado (opcional)
# Settings > Pages > Custom domain: olcan.com.br
```

## 🔧 Configurações Pós-Deploy

### 1. DNS e Domínio

```
# Configurar registros DNS:
A     @     <IP-do-servidor>
CNAME www   <dominio-principal>
```

### 2. SSL/HTTPS

- **Netlify/Vercel**: Automático
- **AWS**: Configurar via ACM (AWS Certificate Manager)
- **Outros**: Let's Encrypt (Certbot)

### 3. CDN (Opcional mas Recomendado)

- Cloudflare (gratuito)
- AWS CloudFront
- Fastly

### 4. Monitoramento

#### Google Search Console
1. Adicionar propriedade: https://search.google.com/search-console
2. Verificar propriedade (via meta tag ou DNS)
3. Enviar sitemap: https://olcan.com.br/sitemap.xml

#### Google Analytics 4
1. Verificar eventos no Realtime
2. Configurar conversões:
   - `begin_checkout` como conversão principal
   - `view_offer` como micro-conversão

#### Uptime Monitoring
- UptimeRobot (gratuito)
- Pingdom
- StatusCake

## 📊 Testes Pós-Deploy

### Performance
```bash
# Lighthouse CLI
npm install -g lighthouse
lighthouse https://olcan.com.br --view

# PageSpeed Insights
# https://pagespeed.web.dev/
```

### SEO
- Google Search Console
- Ahrefs Site Audit
- Screaming Frog

### Acessibilidade
- WAVE: https://wave.webaim.org/
- axe DevTools (extensão Chrome)

## 🔄 Atualizações Futuras

### Workflow de Deploy Contínuo

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
        with:
          args: deploy --prod
```

## 🆘 Troubleshooting

### Problema: Imagens não carregam
- Verificar caminhos relativos
- Verificar permissões de arquivo
- Verificar CORS (se CDN externo)

### Problema: Tracking não funciona
- Verificar ID do GA4
- Verificar consent banner
- Verificar console do navegador

### Problema: Formulário não envia
- Verificar URL do Mautic
- Verificar CORS
- Verificar console do navegador

### Problema: Performance baixa
- Minificar assets
- Comprimir imagens
- Habilitar cache
- Usar CDN

## 📞 Suporte

Para dúvidas sobre o deploy:
- Email: contato@olcan.com.br
- Documentação: README.md

---

**Última atualização**: Janeiro 2025
