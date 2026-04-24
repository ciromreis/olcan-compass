# Briefing Gabriel — Delta vs SSOT Atual

> **Data:** 22/abr/2026  
> **Escopo:** Backend, Infraestrutura e Automação (VPS + n8n + OpenClaw)  
> **Status:** ⚠️ Blockers em sistemas críticos

---

## O que Mudou (vs SSOT 2026-04-15)

### Alterações Confirmadas

| Sistema | Mudança | Evidence |
|---------|---------|----------|
| **Render API** | continua online | `olcan-compass-api.onrender.com/api/health` → ok |
| **Database** | migrations 0027+0028 aplicadas | alembic head: `0028_seed_psychology_questions` |
| **Mautic** | OFFLINE (era para estar up) | `mautic.olcan.com.br` → HTTP 404 |
| **DNS** | migrado para Cloudflare | 19/abr/2026 |
| **n8n** | responde 200 via proxy | mas não acessível diretamente |

### Novas Informações

1. **Auth fix deployado:** Colunas `username`, `bio`, `preferences` criadas na migrate 0027
2. **Mautic offline:** Precisa debug urgente
3. **Import circular:** tasks.py:186 — resolvido com importlazy

---

## Estado dos Sistemas (Conforme Auditoria)

### Hostinger VPS
- **Status:** ❓ DESCONHECIDO
- **Blocker:** Sem acesso SSH
- **Evidence:** nenhuma — impossível verificar localmente

### GCP VM n8n
- **Status:** ✅ ONLINE (via Cloudflare)
- **Blocker:** Sem acesso direto SSH
- **Evidence:** `curl -I https://n8n.olcan.com.br` → HTTP 200
- **IP documentado:** 35.238.150.117 (não acessível)

### Mautic
- **Status:** ❌ OFFLINE
- **HTTP:** 404
- **DNS:** apontando para Cloudflare
- **Blocker:** Container down ou mal configurado

### OpenClaw
- **Status:** ❓ DESCONHECIDO
- **Blocker:** Repositório não encontrado

---

## Perguntas Críticas para Gabriel

### Acesso
1. **Tens acesso SSH à VPS Hostinger via hPanel?** (sem isso, não tem como verificar Mautic)
2. **Tens acesso ao GCP Console? billing 0105D9-45B581-C656D3**
3. **Tens credenciais Cloudflare API?**

### Decisões de Arquitetura
4. **Prioridade: estabilizar Mautic ou configurar OpenClaw?**
5. **Migrar tudo para VPS Hostinger ou manter distribuídos?**
6. **Backup strategy: local (rsync/B2) ou cloud (S3)?**

### Cronograma e Orçamento
7. **Estimado: R$ 3.000+ — aceita pagamento parcelado?**
   - Ex: 50% no início, 50% na conclusão
8. **Prazo estimado: 2-4 semanas?**

---

## Tarefas Potenciais (baseadas no SSOT + auditoria)

### Alta Prioridade
1. 🔴 **Restaurar Mautic** — está offline desde_UNKNOWN
2. 🔴 **Aumentar RAM VPS** — KVM 2 (8GB) pode não suportar Mautic + outros
3. 🟡 **Configurar backups** — hoje não há rotina automatizada

### Média Prioridade
4. 🟡 **n8n workflows backup** — exportar JSON
5. 🟡 **Verificar GCP costs** — ultimos 3 meses
6. 🟢 **Cleanup** — remover serviços legados

### Baixa Prioridade
7. 🟢 **OpenClaw setup** (se decides usar)
8. 🟢 **Monitoramento** — alerts para VPS/n8n

---

## Informações Faltando no SSOT

| Info | Precisa de |
|------|-----------|
| VPS plan atual | SSH ou hPanel |
| Containers rodando | `docker ps` |
| RAM/disco usage | `free -h`, `df -h` |
| n8n workflows | Export JSON |
| GCP custos | Console billing |
| Mautic logs | `docker logs mautic` |

---

## Próximos Passos

1. **Gabriel confirma acesso SSH + GCP**
2. **Ciro aprova escopo + orçamento**
3. **Agendar kickoff call**

---

*Atualizar este documento após kickoff call.*