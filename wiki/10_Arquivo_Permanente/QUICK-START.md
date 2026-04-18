# ⚡ Quick Start - Visualize a Landing Page em 2 Minutos

## 🚀 Opção 1: Abrir Diretamente no Navegador (Mais Rápido)

1. **Localize o arquivo `index.html`** na pasta do projeto
2. **Clique duas vezes** no arquivo
3. **Pronto!** A página abrirá no seu navegador padrão

⚠️ **Nota**: Algumas funcionalidades (como tracking) podem não funcionar sem um servidor local.

---

## 🌐 Opção 2: Servidor Local (Recomendado)

### Com Python (se você tem Python instalado)

```bash
# Navegue até a pasta do projeto
cd caminho/para/olcan-landing-page

# Inicie o servidor
python -m http.server 8000

# Ou, se você usa Python 2:
python -m SimpleHTTPServer 8000
```

**Acesse**: http://localhost:8000

---

### Com Node.js (se você tem Node instalado)

```bash
# Navegue até a pasta do projeto
cd caminho/para/olcan-landing-page

# Inicie o servidor (sem instalar nada)
npx http-server -p 8000
```

**Acesse**: http://localhost:8000

---

### Com VS Code (se você usa VS Code)

1. **Instale a extensão "Live Server"**
   - Abra VS Code
   - Vá em Extensions (Ctrl+Shift+X)
   - Procure por "Live Server"
   - Clique em "Install"

2. **Abra o projeto no VS Code**
   - File > Open Folder
   - Selecione a pasta do projeto

3. **Inicie o Live Server**
   - Clique com botão direito em `index.html`
   - Selecione "Open with Live Server"

**Acesse**: http://127.0.0.1:5500

---

## 📱 Testar em Mobile

### Opção 1: DevTools (Simulação)

1. Abra a página no Chrome
2. Pressione **F12** (ou Ctrl+Shift+I)
3. Clique no ícone de **dispositivo móvel** (ou Ctrl+Shift+M)
4. Selecione um dispositivo (iPhone, iPad, etc.)

### Opção 2: Dispositivo Real

1. Certifique-se de que seu computador e celular estão na **mesma rede Wi-Fi**
2. Inicie o servidor local (Python ou Node)
3. Descubra o IP do seu computador:
   - **Windows**: `ipconfig` no CMD
   - **Mac/Linux**: `ifconfig` no Terminal
4. No celular, acesse: `http://SEU-IP:8000`
   - Exemplo: `http://192.168.1.100:8000`

---

## 🎨 O Que Você Verá

### Hero Section (Topo)
- Headline impactante: "Você entrega resultado. Agora vão enxergar."
- Dois CTAs: "Começar agora" e "Como funciona"
- Mockup do Kit Notion (placeholder se você ainda não adicionou a imagem)

### Seções Principais
1. **Solução** - 4 componentes do Sistema Olcan
2. **Pain Points** - 3 dores do público-alvo
3. **Timeline** - Plano 30/60/90 dias
4. **Prova Social** - Cases e depoimentos
5. **Oferta** - Preço e condições
6. **FAQ** - Perguntas frequentes
7. **Footer** - Contatos e links

### Funcionalidades Interativas
- ✅ Scroll suave ao clicar nos CTAs
- ✅ FAQ accordion (clique para abrir/fechar)
- ✅ Animações fade-in ao rolar a página
- ✅ Sticky CTA em mobile (aparece ao rolar)

---

## 🔧 Configurações Rápidas (Opcional)

### Desabilitar Consent Banner (para testes)

Comente as linhas no `index.html`:

```html
<!-- Consent Banner (LGPD) -->
<!-- <div id="consent-banner" ...> ... </div> -->
```

### Desabilitar A/B Testing (para testes)

Comente no `index.html`:

```html
<!-- <script src="assets/js/ab-testing.js"></script> -->
```

### Desabilitar Tracking (para testes)

Comente no `index.html`:

```html
<!-- <script src="assets/js/tracking.js"></script> -->
```

---

## 🐛 Problemas Comuns

### "Imagens não aparecem"
- **Causa**: Imagens ainda não foram adicionadas
- **Solução**: Adicione imagens em `assets/images/` ou ignore por enquanto

### "Estilos não aplicam"
- **Causa**: Cache do navegador
- **Solução**: Pressione **Ctrl+Shift+R** (hard refresh)

### "Servidor não inicia"
- **Causa**: Porta 8000 já está em uso
- **Solução**: Use outra porta: `python -m http.server 8080`

### "Página em branco"
- **Causa**: JavaScript com erro
- **Solução**: Abra o Console (F12) e veja os erros

---

## 📊 Verificar Funcionalidades

### Checklist Rápido

- [ ] Página carrega sem erros
- [ ] Hero section aparece com headline
- [ ] Todas as seções estão visíveis
- [ ] CTAs são clicáveis
- [ ] FAQ abre e fecha
- [ ] Scroll suave funciona
- [ ] Responsivo em mobile (DevTools)

### Console do Navegador

Abra o Console (F12) e você deve ver:

```
Olcan Landing Page loaded successfully
Tracking initialized
Forms initialized
A/B Testing initialized: {headline: "A", cta: "A"}
```

Se houver erros em vermelho, verifique os arquivos JavaScript.

---

## 🎯 Próximos Passos

Depois de visualizar a página:

1. **Adicionar imagens reais** → `assets/images/`
2. **Configurar Google Analytics** → `index.html` linha ~70
3. **Atualizar contatos** → Footer
4. **Testar em diferentes navegadores**
5. **Fazer deploy** → Ver [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 📚 Documentação Completa

- **[README.md](README.md)** - Visão geral técnica
- **[GETTING-STARTED.md](GETTING-STARTED.md)** - Guia detalhado
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Como fazer deploy
- **[LAUNCH-CHECKLIST.md](LAUNCH-CHECKLIST.md)** - Checklist completo
- **[PAGE-STRUCTURE.md](PAGE-STRUCTURE.md)** - Estrutura visual

---

## 💡 Dica Pro

Use o **Live Server** do VS Code para desenvolvimento. Ele atualiza automaticamente a página quando você salva alterações nos arquivos!

---

**Aproveite sua landing page! 🚀**
