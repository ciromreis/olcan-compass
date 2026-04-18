---
title: Guia de Deployment Compass
type: drawer
layer: 2
status: active
last_seen: 2026-04-17
backlinks:
  - Arquitetura_v2_5_Compass
  - Verdade_do_Produto
---

# Guia de Deployment e Infraestrutura

**Resumo**: Protocolo técnico para deployment das aplicações Olcan (Compass e Marketing) na Vercel, configuração de domínios e gestão de infraestrutura.
**Importância**: Alto
**Status**: Ativo
**Camada (Layer)**: DevOps / Infra
**Tags**: #deployment #vercel #infraestrutura #dns #cicd #ops
**Criado**: 09/04/2026
**Atualizado**: 15/04/2026

---

## 🚀 Pipeline de Deployment (Vercel)

Nosso deployment é automatizado via Vercel, integrado com o GitHub.

### Configurações de Root
- **Site Marketing**: `/apps/site-marketing-v2.5`
- **App Compass**: `/apps/app-compass-v2.5`

### Variáveis de Ambiente Críticas
| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_API_URL` | URL base do backend (Nexus API) |
| `MAUTIC_URL` | Endpoint do Mautic para tracking |
| `DATABASE_URL` | String de conexão com Supabase/Postgres |
| `NEXTAUTH_SECRET` | Chave para criptografia de sessões |

---

## 🌐 Gestão de Domínios (GoDaddy)

O domínio principal é `olcan.com.br`.

### Registros DNS
- **A Record**: `76.76.21.21` (Direciona para Vercel)
- **CNAME (www)**: `cname.vercel-dns.com`
- **CNAME (mautic)**: Aponta para a instância dedicada do Mautic.

---

## 🛠️ Procedimento de Rollback
Em caso de falha crítica em produção:
1. Acesse o dashboard da Vercel.
2. Vá em **Deployments**.
3. Identifique o último deployment estável.
4. Clique em **Instant Rollback**.
5. Notifique a divisão SRE via canal de incidentes.

---

## 🔗 Referências Relacionadas
- [[00_Onboarding_Inicio/Checklist_Producao_Marketing.md]]
- [[00_Onboarding_Inicio/Checklist_Seguranca_Compass.md]]
- [[02_Arquitetura_Compass/Scripts_de_Automacao]]
