# 🚀 Launch Checklist - Olcan Landing Page

Use este checklist para garantir que tudo está pronto antes do lançamento!

## ⚙️ Configurações Técnicas

### Google Analytics 4
- [ ] Criar propriedade GA4 em https://analytics.google.com
- [ ] Copiar ID de medição (formato: G-XXXXXXXXXX)
- [ ] Substituir em `index.html` linha ~70
- [ ] Testar eventos no Realtime após deploy

### Mautic (CRM)
- [ ] Configurar conta Mautic
- [ ] Criar formulário de captura
- [ ] Copiar URL da API e ID do formulário
- [ ] Atualizar `assets/js/forms.js` linhas 4-10
- [ ] Testar submissão de formulário

### Domínio e Hospedagem
- [ ] Registrar domínio (ex: olcan.com.br)
- [ ] Escolher plataforma de hospedagem (Netlify recomendado)
- [ ] Configurar DNS
- [ ] Configurar SSL/HTTPS
- [ ] Testar acesso ao domínio

## 🎨 Conteúdo e Imagens

### Imagens Obrigatórias
- [ ] `assets/images/hero/kit-mockup.jpg` (800x600px)
- [ ] `assets/images/hero/kit-mockup.webp` (versão otimizada)
- [ ] `assets/images/testimonials/avatar-placeholder.jpg` (200x200px)
- [ ] `assets/images/testimonials/avatar-placeholder.webp`
- [ ] `assets/images/og-image.jpg` (1200x630px para redes sociais)

**Dica**: Use https://squoosh.app/ para converter para WebP

### Textos e Contatos
- [ ] Atualizar email no footer (linha ~290 do index.html)
- [ ] Atualizar WhatsApp no footer (linha ~291)
- [ ] Revisar todos os textos (ortografia e gramática)
- [ ] Verificar preços e condições de pagamento
- [ ] Atualizar depoimentos com nomes e cargos reais

### SEO
- [ ] Atualizar meta description (linha ~3)
- [ ] Atualizar Open Graph image URL (linha ~18)
- [ ] Atualizar canonical URL (linha ~7)
- [ ] Atualizar sitemap.xml com domínio real
- [ ] Verificar structured data (JSON-LD)

## 🧪 Testes Locais

### Funcionalidade
- [ ] Testar scroll suave (clicar em "Como funciona")
- [ ] Testar FAQ accordion (abrir/fechar perguntas)
- [ ] Testar sticky CTA em mobile (scroll para baixo)
- [ ] Verificar animações fade-in
- [ ] Testar todos os links (não devem dar 404)

### Responsividade
- [ ] Mobile (375px) - iPhone SE
- [ ] Mobile (414px) - iPhone Pro Max
- [ ] Tablet (768px) - iPad
- [ ] Desktop (1024px)
- [ ] Large Desktop (1440px)

### Navegadores
- [ ] Chrome (desktop e mobile)
- [ ] Firefox
- [ ] Safari (desktop e iOS)
- [ ] Edge
- [ ] Samsung Internet (Android)

### Performance
```bash
# Rodar Lighthouse
lighthouse http://localhost:8000 --view

# Targets:
# Performance: > 80
# Accessibility: > 90
# Best Practices: > 90
# SEO: > 90
```

- [ ] Performance score > 80
- [ ] Accessibility score > 90
- [ ] Best Practices score > 90
- [ ] SEO score > 90

### Acessibilidade
- [ ] Contraste de cores adequado (WCAG AA)
- [ ] Textos alternativos em todas as imagens
- [ ] Navegação por teclado funciona (Tab, Enter, Space)
- [ ] Focus indicators visíveis
- [ ] Testar com leitor de tela (NVDA, VoiceOver)

## 🚀 Deploy

### Pré-Deploy
- [ ] Minificar CSS (opcional mas recomendado)
- [ ] Minificar JavaScript (opcional mas recomendado)
- [ ] Comprimir imagens
- [ ] Validar HTML em https://validator.w3.org/
- [ ] Fazer backup do código

### Deploy (Netlify)
- [ ] Criar conta em https://netlify.com
- [ ] Fazer upload via drag & drop ou conectar Git
- [ ] Configurar domínio customizado
- [ ] Verificar SSL automático
- [ ] Testar site no domínio de produção

### Pós-Deploy
- [ ] Testar site em produção (todos os links)
- [ ] Verificar imagens carregando
- [ ] Testar formulários (se implementados)
- [ ] Verificar tracking no GA4 Realtime
- [ ] Testar em diferentes dispositivos reais

## 📊 Monitoramento e Analytics

### Google Search Console
- [ ] Adicionar propriedade em https://search.google.com/search-console
- [ ] Verificar propriedade (via meta tag ou DNS)
- [ ] Enviar sitemap: https://olcan.com.br/sitemap.xml
- [ ] Aguardar indexação (24-48 horas)

### Google Analytics 4
- [ ] Verificar eventos no Realtime
- [ ] Configurar conversões:
  - [ ] `begin_checkout` como conversão principal
  - [ ] `view_offer` como micro-conversão
- [ ] Criar relatórios customizados
- [ ] Configurar alertas

### Uptime Monitoring
- [ ] Criar conta em https://uptimerobot.com (gratuito)
- [ ] Adicionar monitor para https://olcan.com.br
- [ ] Configurar alertas por email
- [ ] Testar notificações

## 🔒 Segurança e Compliance

### LGPD
- [ ] Consent banner funcionando
- [ ] Tracking bloqueado até consentimento
- [ ] Política de privacidade publicada
- [ ] Termos de uso publicados
- [ ] Cookie policy (se necessário)

### Segurança
- [ ] HTTPS configurado (SSL)
- [ ] Headers de segurança configurados
- [ ] Formulários com validação
- [ ] Proteção contra XSS
- [ ] Proteção contra CSRF (se formulários)

## 📈 Marketing e Lançamento

### Pré-Lançamento
- [ ] Preparar posts para redes sociais
- [ ] Criar campanha de email marketing
- [ ] Configurar pixels (Meta, Google Ads)
- [ ] Preparar anúncios pagos
- [ ] Definir budget de marketing

### Lançamento
- [ ] Publicar posts nas redes sociais
- [ ] Enviar email para lista
- [ ] Ativar campanhas de anúncios
- [ ] Monitorar métricas em tempo real
- [ ] Responder comentários e mensagens

### Pós-Lançamento (Primeira Semana)
- [ ] Monitorar taxa de conversão diariamente
- [ ] Analisar heatmaps (Hotjar, Clarity)
- [ ] Coletar feedback de usuários
- [ ] Identificar pontos de fricção
- [ ] Fazer ajustes baseados em dados

## 🎯 Métricas de Sucesso

### Semana 1
- [ ] Tráfego: > 1000 visitantes
- [ ] Taxa de conversão: > 2%
- [ ] Tempo médio: > 1:30 min
- [ ] Bounce rate: < 60%

### Mês 1
- [ ] Tráfego: > 5000 visitantes
- [ ] Taxa de conversão: > 3%
- [ ] Tempo médio: > 2:00 min
- [ ] Bounce rate: < 50%

### Trimestre 1
- [ ] Tráfego: > 20000 visitantes
- [ ] Taxa de conversão: > 4%
- [ ] ROI positivo
- [ ] Posicionamento SEO Top 10

## 🔄 Otimização Contínua

### Testes A/B
- [ ] Testar headline (já implementado)
- [ ] Testar CTA copy (já implementado)
- [ ] Testar cores de botões
- [ ] Testar ordem das seções
- [ ] Testar diferentes ofertas

### Melhorias Futuras
- [ ] Adicionar vídeo no hero
- [ ] Implementar chat ao vivo
- [ ] Criar blog para SEO
- [ ] Adicionar calculadora de ROI
- [ ] Implementar remarketing

## ✅ Aprovação Final

### Stakeholders
- [ ] Aprovação do time de marketing
- [ ] Aprovação do time de vendas
- [ ] Aprovação da diretoria
- [ ] Aprovação jurídica (termos e políticas)

### Documentação
- [ ] README.md atualizado
- [ ] DEPLOYMENT.md revisado
- [ ] Credenciais documentadas (seguras)
- [ ] Processo de atualização documentado

---

## 🎉 Pronto para Lançar!

Quando todos os itens estiverem marcados, você está pronto para lançar! 🚀

**Última revisão**: _________  
**Responsável**: _________  
**Data de lançamento**: _________

---

**Boa sorte com o lançamento da Olcan Landing Page!** 💪
