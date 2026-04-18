---
title: Estratégia Mautic e Newsletter
type: drawer
layer: 1
status: active
last_seen: 2026-04-17
backlinks:
  - Olcan_Master_PRD_v2_5
  - Verdade_do_Produto
  - Carta_do_Projeto_Olcan_v2_5
---

# Estratégia Mautic e Automação de Marketing

**Resumo**: Guia de configuração, integração e campanhas do Mautic para o ecossistema Olcan, focando em nutrição de leads e conversão automatizada.
**Importância**: Médio
**Status**: Ativo
**Camada (Layer)**: Marketing / Growth
**Tags**: #mautic #marketing-automation #newsletter #crm #email-marketing
**Criado**: 05/04/2026
**Atualizado**: 15/04/2026

---

## 📧 Visão Geral da Integração
O Mautic é o "Cérebro de Marketing" da Olcan. Ele rastreia o comportamento do usuário no site e dispara jornadas de e-mail personalizadas com base no interesse demonstrado.

### Fluxos Principais
1. **Newsletter Welcome**: Boas-vindas imediato + entrega de recurso gratuito.
2. **Abandoned Checkout**: Recuperação de usuários que iniciaram o pagamento no Forge mas não concluíram.
3. **Product Nurture**: Sequência de e-mails detalhando benefícios específicos dos produtos Olcan.

---

## 🛠️ Configuração Técnica

### Rastreamento (Tracking)
O script de acompanhamento deve estar presente em todas as páginas:
```javascript
(function(w,d,t,u,n,a,m){w['MauticTrackingObject']=n;
  w[n]=w[n]||function(){(w[n].q=w[n].q||[]).push(arguments)},a=d.createElement(t),
  m=d.getElementsByTagName(t)[0];a.async=1;a.src=u;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://mautic.olcan.com.br/mtc.js','mt');
mt('send', 'pageview');
```

### Lead Scoring
- **Visita à página de produto**: +10 pontos.
- **Download de material**: +20 pontos.
- **Abertura de e-mail**: +2 pontos.
- **Clique em link de e-mail**: +5 pontos.
- **Inatividade (30 dias)**: -10 pontos.

---

## 📈 Campanhas Ativas

| Campanha | Gatilho | Objetivo |
|----------|---------|----------|
| Boas-vindas | Cadastro na Newsletter | Engajamento inicial e entrega de valor. |
| Recuperação | Abandono de Formulário | Converter dúvidas em vendas. |
| Upsell Aura | Evolução de Nível | Oferecer recursos premium do companheiro virtual. |

---

## 🔗 Referências Relacionadas
- [[00_Onboarding_Inicio/Checklist_Producao_Marketing.md]]
- [[01_Visao_Estrategica/Estrategia_de_Copywriting.md]]
