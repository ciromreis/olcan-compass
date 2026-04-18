---
title: Checklist Produção Marketing
type: drawer
layer: 8
status: active
last_seen: 2026-04-17
backlinks:
  - Verdade_do_Produto
  - Padroes_de_Codigo
---

# Checklist de Produção: Site Marketing

**Resumo**: Lista exaustiva de verificações para garantir que o site de marketing da Olcan esteja impecável antes de cada deployment em produção.
**Importância**: Alto
**Status**: Ativo
**Camada (Layer)**: Marketing / Execução
**Tags**: #marketing #checklist #produção #qa #performance #seo
**Criado**: 08/04/2026
**Atualizado**: 15/04/2026

---

## 🚀 Verificação Pré-Deploy

### UI / UX (Aparência e Design)
- [ ] **Liquid-Glass**: Efeitos de borrão e transparência funcionando corretamente em todos os navegadores.
- [ ] **Imagens**: Sem placeholders. Todas as imagens são de alta resolução e otimizadas (WebP/AVIF).
- [ ] **Responsividade**: Menu mobile funcionando e layout sem scroll horizontal em iPhone/Android.
- [ ] **Favicon e Logos**: SVGs corretos em todos os headers e footers.

### SEO e Performance
- [ ] **Lighthouse**: Score mínimo de 90+ em Performance, Acessibilidade e SEO.
- [ ] **Meta Tags**: Título e descrição únicos em cada página.
- [ ] **Sitemap/Robots**: Arquivos gerados e apontando para a URL final.
- [ ] **Alt Text**: Todas as imagens possuem descrições para leitores de tela.

### Tracking e Marketing
- [ ] **Google Analytics (GA4)**: Tag instalada e eventos de clique sendo registrados.
- [ ] **Mautic**: Script de tracking ativo e formulários capturando leads corretamente.
- [ ] **Links Sociais**: Todos os ícones apontam para os perfis corretos.
- [ ] **LGPD**: Banner de consentimento de cookies funcional e salvando preferência.

### Funcionalidade (Links e Formulários)
- [ ] **Links Internos**: Nenhum erro 404.
- [ ] **Formulários**: Sucesso de envio testado (testar envio real).
- [ ] **Velocidade**: Tempo de carregamento da página Home abaixo de 1.5s (FCP).

---

## 🔗 Referências Relacionadas
- [[01_Visao_Estrategica/Estrategia_Mautic_e_Newsletter.md]]
- [[00_Onboarding_Inicio/Relatorio_de_Audit_Portugues.md]]
