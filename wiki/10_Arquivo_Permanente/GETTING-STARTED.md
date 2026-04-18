# 🚀 Getting Started - Olcan Landing Page

## Início Rápido

### 1. Abrir a Landing Page Localmente

```bash
# Opção 1: Servidor Python (se tiver Python instalado)
python -m http.server 8000

# Opção 2: Servidor Node.js (se tiver Node instalado)
npx http-server -p 8000

# Opção 3: Live Server (VS Code Extension)
# Instale a extensão "Live Server" e clique com botão direito em index.html > "Open with Live Server"
```

Acesse: http://localhost:8000

### 2. Configurações Essenciais

#### Google Analytics 4

No arquivo `index.html`, linha ~70:

```html
<!-- Substituir G-XXXXXXXXXX pelo seu ID real -->
<script async src="https://www.googletagmanager.com/gtag/js?id=SEU-GA4-ID"></script>
```

#### Mautic (CRM)

No arquivo `assets/js/forms.js`, linha ~4:

```javascript
const mauticConfig = {
  baseUrl: 'https://seu-mautic.com.br',  // Sua URL do Mautic
  endpoint: '/api/forms/1/submit',        // ID do seu formulário
  // ...
};
```

#### Contatos

No arquivo `index.html`, seção Footer:

```html
<p>Contato: <a href="mailto:SEU-EMAIL@olcan.com.br">SEU-EMAIL@olcan.com.br</a></p>
<p>WhatsApp: <a href="https://wa.me/5511XXXXXXXXX">(11) XXXXX-XXXX</a></p>
```

### 3. Adicionar Imagens

Coloque suas imagens nos diretórios:

```
assets/images/
├── hero/
│   ├── kit-mockup.jpg          # Mockup do Kit Notion (recomendado: 800x600px)
│   ├── kit-mockup.webp         # Versão WebP (melhor performance)
│   └── video-fallback.jpg      # Fallback se vídeo não carregar
├── testimonials/
│   ├── avatar-placeholder.jpg  # Fotos dos clientes (recomendado: 200x200px)
│   └── avatar-placeholder.webp # Versão WebP
└── og-image.jpg                # Imagem para redes sociais (1200x630px)
```

**Dica**: Use ferramentas online para converter para WebP:
- https://squoosh.app/
- https://cloudconvert.com/jpg-to-webp

## 📝 Personalizações Comuns

### Alterar Cores da Marca

Edite `assets/css/variables.css`:

```css
:root {
  --color-primary: #001338;      /* Azul principal */
  --color-accent: #F26522;       /* Laranja de destaque */
  /* ... */
}
```

### Alterar Textos

Todos os textos estão no `index.html`. Principais seções:

- **Hero**: Linha ~100
- **Pain Points**: Linha ~120
- **Solução**: Linha ~140
- **Timeline**: Linha ~180
- **Oferta**: Linha ~220
- **FAQ**: Linha ~260

### Alterar Preços

No `index.html`, seção Oferta (linha ~220):

```html
<span class="offer__bundle-amount">497</span>  <!-- Preço principal -->
<p>12x de R$ 41,42 sem juros</p>               <!-- Parcelamento -->
<p class="offer__discount">ou R$ 447 no PIX (10% OFF)</p>  <!-- Desconto PIX -->
```

### Adicionar/Remover Seções

As seções estão organizadas no `index.html`:

```html
<!-- Hero Section -->
<section id="hero" class="hero">...</section>

<!-- Solution Section -->
<section id="solucao" class="solution">...</section>

<!-- Pain Points Section -->
<section id="dores" class="pain-points">...</section>

<!-- Timeline Section -->
<section id="como-funciona" class="timeline">...</section>

<!-- Social Proof Section -->
<section id="provas" class="social-proof">...</section>

<!-- Offer Section -->
<section id="oferta" class="offer">...</section>

<!-- FAQ Section -->
<section id="faq" class="faq">...</section>

<!-- Footer -->
<footer class="footer">...</footer>
```

## 🎨 Customização Avançada

### Adicionar Vídeo no Hero

Substitua a imagem por vídeo no `index.html`:

```html
<div class="hero__media">
  <video class="hero__video" autoplay muted loop playsinline>
    <source src="assets/videos/vsl-hero.webm" type="video/webm">
    <source src="assets/videos/vsl-hero.mp4" type="video/mp4">
    <track kind="captions" src="assets/videos/vsl-hero-pt.vtt" srclang="pt" label="Português">
  </video>
</div>
```

### Adicionar Formulário de Captura

Adicione antes da seção de Oferta:

```html
<section class="lead-capture">
  <div class="container">
    <h2>Receba o guia gratuito</h2>
    <form class="lead-form">
      <input type="email" name="email" placeholder="Seu melhor email" required>
      <span class="error-message"></span>
      <button type="submit" class="btn btn--primary">Quero receber</button>
    </form>
  </div>
</section>
```

### Desabilitar A/B Testing

Remova ou comente no `index.html`:

```html
<!-- <script src="assets/js/ab-testing.js"></script> -->
```

## 🧪 Testes

### Testar Tracking

1. Abra o Console do navegador (F12)
2. Vá para a aba "Network"
3. Filtre por "gtag" ou "analytics"
4. Navegue pela página e veja os eventos sendo disparados

### Testar Responsividade

1. Abra DevTools (F12)
2. Clique no ícone de dispositivo móvel (Ctrl+Shift+M)
3. Teste em diferentes resoluções:
   - iPhone SE (375px)
   - iPad (768px)
   - Desktop (1440px)

### Testar Acessibilidade

1. Instale a extensão "axe DevTools" no Chrome
2. Abra a página
3. Clique no ícone da extensão
4. Execute "Scan All of My Page"

## 📚 Recursos Úteis

### Documentação
- [README.md](README.md) - Visão geral do projeto
- [DEPLOYMENT.md](DEPLOYMENT.md) - Guia completo de deploy
- [.kiro/specs/olcan-landing-page/](./kiro/specs/olcan-landing-page/) - Especificações técnicas

### Ferramentas Recomendadas
- **Editor**: VS Code com extensões:
  - Live Server
  - Prettier
  - ESLint
- **Design**: Figma, Adobe XD
- **Imagens**: Squoosh, TinyPNG
- **Performance**: Lighthouse, PageSpeed Insights

### Inspiração
- https://www.awwwards.com/
- https://www.landingfolio.com/
- https://saaslandingpage.com/

## 🆘 Problemas Comuns

### "Imagens não aparecem"
- Verifique se os caminhos estão corretos
- Verifique se as imagens existem nos diretórios
- Use caminhos relativos (sem `/` no início)

### "Estilos não aplicam"
- Limpe o cache do navegador (Ctrl+Shift+R)
- Verifique se os arquivos CSS estão linkados corretamente
- Verifique o console por erros

### "JavaScript não funciona"
- Abra o Console (F12) e veja os erros
- Verifique se os scripts estão no final do `<body>`
- Verifique se os IDs dos elementos estão corretos

## 📞 Suporte

Precisa de ajuda?
- 📧 Email: contato@olcan.com.br
- 💬 WhatsApp: (11) 99999-9999
- 📖 Documentação completa: README.md

---

**Boa sorte com sua landing page! 🚀**
