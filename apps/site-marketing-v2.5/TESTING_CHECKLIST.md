# ✅ Checklist de Testes — Olcan Website

**URL de Teste:** https://site-marketing-v25.vercel.app  
**Data de Deploy:** Abril 2026  
**Status:** 🟡 Aguardando testes antes de migração DNS

---

## 📱 Testes de Navegação

### Páginas Principais
- [ ] **Home** (`/`) - Hero, produtos, manifesto, insights, blog
- [ ] **Sobre** (`/sobre`) - História, valores, milestones, seção CEO
- [ ] **CEO** (`/sobre/ceo`) - Biografia Ciro Moraes, CTA Zenklub
- [ ] **Marketplace** (`/marketplace`) - Catálogo de produtos
- [ ] **Diagnóstico** (`/diagnostico`) - Formulário diagnóstico
- [ ] **Blog** (`/blog`) - Integração Substack
- [ ] **Contato** (`/contato`) - Formulário contato
- [ ] **Privacidade** (`/privacidade`) - Política de privacidade
- [ ] **Termos** (`/termos`) - Termos de uso

### Produtos (Marketplace)
- [ ] **Sem Fronteiras** (`/marketplace/curso-cidadao-mundo`)
  - Link Hotmart: https://pay.hotmart.com/N97314230U
- [ ] **Kit Application** (`/marketplace/kit-application`)
  - Link Hotmart: https://pay.hotmart.com/X85073158P
- [ ] **Rota da Internacionalização** (`/marketplace/rota-internacionalizacao`)
  - Link Hotmart: https://pay.hotmart.com/K97966494E

### Mentoria
- [ ] **Página Ciro** (`/ciro`) - Landing page mentoria
  - Link Zenklub: https://zenklub.com.br/coaches/ciro-moraes/

---

## 🔗 Testes de Links Externos

### Produtos Hotmart
- [ ] Sem Fronteiras abre corretamente
- [ ] Kit Application abre corretamente
- [ ] Rota da Internacionalização abre corretamente

### Mentoria Zenklub
- [ ] Link Zenklub abre perfil do Ciro
- [ ] Preço R$ 275 está visível

### Plataforma
- [ ] Link para compass.olcan.com.br funciona (não deve interferir)

### Redes Sociais
- [ ] Instagram abre corretamente
- [ ] LinkedIn abre corretamente (se configurado)
- [ ] Substack abre corretamente

---

## 🎨 Testes Visuais

### Branding
- [ ] Logo Olcan carrega corretamente
- [ ] Paleta de cores está correta (navy, cream, flame suave)
- [ ] Backgrounds claros predominam
- [ ] Sem termos técnicos internos (OIOS, DAG, etc)

### Tipografia
- [ ] DM Serif Display carrega (títulos)
- [ ] DM Sans carrega (corpo de texto)
- [ ] Textos legíveis em todos os tamanhos

### Imagens
- [ ] Todas as imagens carregam
- [ ] Imagens do Substack carregam no blog
- [ ] Sem imagens quebradas (404)

---

## 📱 Testes Responsivos

### Desktop (1920x1080)
- [ ] Layout correto
- [ ] Navbar completa visível
- [ ] Cards alinhados
- [ ] Footer completo

### Tablet (768x1024)
- [ ] Layout adapta corretamente
- [ ] Menu funciona
- [ ] Imagens redimensionam

### Mobile (375x667)
- [ ] Menu hamburguer funciona
- [ ] Textos legíveis
- [ ] Botões clicáveis
- [ ] Formulários utilizáveis

---

## 🧪 Testes Funcionais

### Navegação
- [ ] Menu desktop funciona
- [ ] Menu mobile abre/fecha
- [ ] Links internos funcionam
- [ ] Links externos abrem em nova aba
- [ ] Botão "voltar" do navegador funciona

### Formulários (se houver)
- [ ] Formulário de contato envia
- [ ] Validação de campos funciona
- [ ] Mensagens de erro/sucesso aparecem
- [ ] Newsletter Mautic funciona

### Performance
- [ ] Páginas carregam em < 3 segundos
- [ ] Sem erros no console do navegador
- [ ] Sem avisos críticos
- [ ] Animações suaves

---

## 📊 Testes de SEO

### Metadata
- [ ] Título da página correto em todas as páginas
- [ ] Meta description presente
- [ ] Open Graph tags configuradas
- [ ] Favicon aparece

### Conteúdo
- [ ] Textos 100% em português
- [ ] Headings (H1, H2, H3) estruturados
- [ ] Alt text em imagens importantes
- [ ] URLs amigáveis

### Técnico
- [ ] Sitemap.xml acessível (`/sitemap.xml`)
- [ ] Robots.txt configurado (se houver)
- [ ] SSL/HTTPS ativo (cadeado verde)
- [ ] Redirecionamento HTTP → HTTPS

---

## 🔒 Testes de Segurança

### SSL/HTTPS
- [ ] Certificado SSL válido
- [ ] Cadeado verde no navegador
- [ ] Sem avisos de conteúdo misto

### Privacidade
- [ ] Política de privacidade acessível
- [ ] Termos de uso acessíveis
- [ ] CNPJ e informações legais no footer

---

## 🌍 Testes de Navegadores

### Desktop
- [ ] Chrome (última versão)
- [ ] Firefox (última versão)
- [ ] Safari (última versão)
- [ ] Edge (última versão)

### Mobile
- [ ] Safari iOS
- [ ] Chrome Android
- [ ] Samsung Internet

---

## 📧 Testes de Email (se aplicável)

### Email @olcan.com.br
- [ ] Envio funciona
- [ ] Recebimento funciona
- [ ] Não foi afetado pelo deploy

---

## 🚨 Problemas Encontrados

### Críticos (Impedem deploy)
- [ ] Nenhum encontrado

### Médios (Corrigir antes de DNS)
- [ ] Nenhum encontrado

### Baixos (Corrigir depois)
- [ ] Nenhum encontrado

---

## ✅ Aprovação Final

### Checklist de Aprovação
- [ ] Todos os testes críticos passaram
- [ ] Links de produtos funcionam
- [ ] Site responsivo em todos os dispositivos
- [ ] Performance aceitável
- [ ] SEO básico configurado
- [ ] Sem erros críticos

### Assinaturas
- [ ] **Aprovado por:** _______________
- [ ] **Data:** _______________
- [ ] **Pronto para migração DNS:** SIM / NÃO

---

## 📞 Próximos Passos Após Aprovação

1. **Configurar variáveis de ambiente na Vercel**
2. **Adicionar domínio olcan.com.br na Vercel**
3. **Obter registros DNS da Vercel**
4. **Atualizar DNS no Wix/Registro.br**
5. **Aguardar propagação (24-48h)**
6. **Monitorar durante 72h**
7. **Cancelar Wix após confirmação**

---

**Última atualização:** Abril 2026  
**Responsável:** Equipe Olcan
