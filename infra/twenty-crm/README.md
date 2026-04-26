# Twenty CRM — Olcan Self-Hosted Deployment

Self-hosted Twenty CRM on the same GCP VM as n8n, sharing Traefik for TLS.

## Topology

```
crm.olcan.com.br ──(443)──> Traefik (n8n-traefik) ──> twenty:3000
                                |
                                +──> twenty-db (Postgres 16)
                                +──> twenty-redis (Redis 7)
```

All Twenty services join `n8n_network` (the bridge created by the n8n compose
stack) so Traefik can discover them via Docker labels.

## Prerequisites

1. **VM size**: Twenty + Postgres + Redis at idle uses ~600–900 MB. The
   default `e2-micro` (1 GB) is **too small** when n8n is also running.
   Resize to `e2-small` (2 GB, ~$13/mo) minimum, `e2-medium` (4 GB, ~$24/mo)
   recommended.
2. **DNS**: `crm.olcan.com.br` A record → `35.238.150.117` (the VM external
   IP), proxied through Cloudflare. Let's Encrypt HTTP-01 challenge requires
   the orange cloud to be **off** during first cert issuance, then can be
   re-enabled.
3. **Port 80 free**: Traefik's HTTP-01 challenge needs port 80 reachable.
   The existing n8n Traefik already owns it.

## First Deploy

```bash
# 1. Resize VM (adds ~3 min downtime)
gcloud compute instances stop n8n-server --zone=us-central1-a
gcloud compute instances set-machine-type n8n-server \
  --zone=us-central1-a --machine-type=e2-small
gcloud compute instances start n8n-server --zone=us-central1-a

# 2. Add DNS in Cloudflare
#    Type: A,  Name: crm,  Content: 35.238.150.117,  Proxy: DNS-only (initial)

# 3. Copy infra files to VM
gcloud compute scp --zone=us-central1-a -r infra/twenty-crm/ n8n-server:~/

# 4. SSH in and stage to /opt
gcloud compute ssh n8n-server --zone=us-central1-a
sudo mv ~/twenty-crm /opt/twenty-crm
cd /opt/twenty-crm

# 5. Create .env from template, fill secrets
sudo cp .env.example .env
sudo nano .env
#   APP_SECRET=$(openssl rand -base64 48)
#   PG_DATABASE_PASSWORD=$(openssl rand -hex 32)

# 6. Bring up the stack
sudo docker compose up -d

# 7. Watch logs until "Server listening" + healthy
sudo docker compose logs -f twenty

# 8. Verify
curl -I https://crm.olcan.com.br
```

## Bootstrap First User

Twenty's first sign-up creates the workspace owner. Visit
`https://crm.olcan.com.br` and register with the Olcan ops email.

## Generate API Key for Compass Integration

After first login:
1. Workspace → Settings → API & Webhooks → API Keys → Create
2. Scope: full read/write (CRM bridge needs Person CRUD)
3. Copy the token — it's shown once

Save it as `TWENTY_API_KEY` on Render:

```bash
# Set on the API service (will trigger redeploy)
render services env-vars set srv-d6jjhuea2pns73f73e5g \
  TWENTY_BASE_URL=https://crm.olcan.com.br \
  TWENTY_API_KEY=<paste-token>
```

## Health Checks

```bash
# Twenty itself
curl https://crm.olcan.com.br/healthz

# Through the Compass API (admin auth required)
curl -H "Authorization: Bearer <admin-jwt>" \
  https://api.olcan.com.br/api/admin/crm/health
# Expected: {"twenty": {"ok": true, "configured": true, "latency_ms": …}, ...}
```

## Backups

The PostgreSQL volume `twenty_db_data` holds all CRM data. Quick snapshot:

```bash
sudo docker exec olcan_twenty_db \
  pg_dump -U twenty -d twenty -Fc > /opt/backups/twenty-$(date +%F).dump
```

## Rollback

```bash
cd /opt/twenty-crm
sudo docker compose down
# Twenty data is in named volumes — `down` keeps them. Use `down -v` only
# if you want to wipe state.
```
