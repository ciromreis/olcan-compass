# Olcan Edge VPS — Deploy & Migration Runbook

Single-host edge stack: Traefik + n8n + Twenty CRM.

> **Target host**: Hostinger VPS 4 (4 vCPU / 16 GB RAM / 200 GB NVMe / Ubuntu 24.04).
> Same compose runs on any 2 GB+ Linux box — Hostinger is just the chosen
> production target.

---

## Topology

```
                       crm.olcan.com.br        n8n.olcan.com.br
                                │                    │
                          [Cloudflare DNS]
                                │
                              :443
                          ┌──────────┐
                          │ Traefik  │  ← Let's Encrypt HTTP-01
                          └─────┬────┘
                  ┌─────────────┼─────────────┐
              twenty:3000   n8n:5678    (future Mautic)
                  │             │
            twenty-postgres  n8n-postgres
            twenty-redis
```

All services share the `edge` Docker network. Traefik discovers them via
labels — no app-specific nginx/reverse-proxy config to maintain.

---

## A. Fresh Install (no existing data to preserve)

### 1. Provision the VPS

- Hostinger VPS 4, Ubuntu 24.04 LTS, root SSH key uploaded
- Open ports: 22 (SSH from your IP only), 80, 443
- Set hostname: `olcan-edge`

### 2. Install Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER  # log out + back in for group to take effect
```

### 3. Stage the stack

```bash
sudo mkdir -p /opt/olcan-edge
sudo chown $USER /opt/olcan-edge
cd /opt/olcan-edge

# Pull files from the repo
git clone --depth 1 https://github.com/ciromreis/olcan-compass.git /tmp/olcan
cp -r /tmp/olcan/infra/vps/* .
rm -rf /tmp/olcan
```

### 4. Generate secrets and fill .env

```bash
cp .env.example .env
chmod 600 .env

cat <<EOF >> /tmp/.secrets
N8N_ENCRYPTION_KEY=$(openssl rand -base64 24 | tr -d '=+/' | head -c 32)
N8N_DB_PASSWORD=$(openssl rand -hex 32)
TWENTY_APP_SECRET=$(openssl rand -base64 48 | tr -d '\n')
TWENTY_DB_PASSWORD=$(openssl rand -hex 32)
EOF
nano .env   # paste values from /tmp/.secrets, then shred -u /tmp/.secrets
```

### 5. Add DNS records (Cloudflare)

| Type | Name | Content              | Proxy        |
| ---- | ---- | -------------------- | ------------ |
| A    | n8n  | `<VPS public IP>`    | DNS only ⚠️ |
| A    | crm  | `<VPS public IP>`    | DNS only ⚠️ |

Proxy must be **DNS only** for the first cert issuance (Let's Encrypt
HTTP-01 needs the unproxied origin reachable on port 80). Once the
certs are in `traefik_data` volume, you can flip both to **Proxied**.

### 6. Bring it up

```bash
cd /opt/olcan-edge
docker compose up -d
docker compose logs -f traefik n8n twenty
```

Watch for:
- `traefik` — `Server configuration reloaded`
- `n8n` — `Editor is now accessible via:` (then 200 on `/healthz`)
- `twenty` — first run does DB migrations (~30–60 s); then `/healthz` 200

### 7. Bootstrap

- Browse to `https://n8n.olcan.com.br` → set up owner account
- Browse to `https://crm.olcan.com.br` → register first user (workspace owner)
- In Twenty: Settings → API & Webhooks → API Keys → create one with full
  scope. Copy the token (shown once).

### 8. Wire the Compass API to Twenty

```bash
# Local machine
render services env-vars set srv-d6jjhuea2pns73f73e5g \
  TWENTY_BASE_URL=https://crm.olcan.com.br \
  TWENTY_API_KEY=<paste-token>
```

Render auto-redeploys. After ~2 min:

```bash
# Verify (admin JWT required)
curl -H "Authorization: Bearer <admin-jwt>" \
  https://api.olcan.com.br/api/admin/crm/health
# Expect: {"twenty":{"ok":true,"latency_ms":<n>},"mautic":{...}}
```

---

## B. Migration from current GCP VM (35.238.150.117)

Current GCP VM runs n8n only (Twenty isn't deployed there yet — the new VPS
is its first home). So migration is **only n8n state**.

### Critical: do NOT lose the encryption key

The source VM has `N8N_ENCRYPTION_KEY=UTm/dOCgC+kjYVUbHIiHA5WPBo+tXx/8`
hard-coded in `/opt/n8n-simple/docker-compose.yml`. Every credential
stored in n8n (API keys, OAuth tokens, etc.) is AES-encrypted with this
key. **Copy it verbatim into the new `.env`.** No exceptions.

### Step-by-step

#### 1. On the new VPS

Complete sections A.1 through A.4 above, but in `.env`:

```bash
N8N_ENCRYPTION_KEY=UTm/dOCgC+kjYVUbHIiHA5WPBo+tXx/8
N8N_DB_PASSWORD=OlcanDB_2026_Secure!
```

(Same DB password lets you restore the dump without rewriting Postgres
roles. You can rotate after migration.)

Bring up only the n8n side first:

```bash
docker compose up -d traefik n8n-postgres
# DON'T start n8n yet — we want to restore the DB first
```

#### 2. On the source GCP VM — dump everything

```bash
gcloud compute ssh n8n-server --zone=us-central1-a

# Stop n8n so we get a consistent snapshot (keep postgres up for the dump)
sudo docker stop n8n-app

# Dump n8n's postgres
sudo docker exec n8n-postgres \
  pg_dump -U n8n -d n8n -Fc -f /tmp/n8n.dump
sudo docker cp n8n-postgres:/tmp/n8n.dump /tmp/n8n.dump

# Tar n8n's data volume (workflows, encryption salt, etc.)
sudo docker run --rm \
  -v n8n-simple_n8n_data:/from \
  -v /tmp:/to \
  alpine tar czf /to/n8n_data.tar.gz -C /from .

ls -lh /tmp/n8n.dump /tmp/n8n_data.tar.gz
```

#### 3. Transfer to the new VPS

```bash
# From local machine
gcloud compute scp --zone=us-central1-a \
  n8n-server:/tmp/n8n.dump \
  n8n-server:/tmp/n8n_data.tar.gz \
  ./

scp n8n.dump n8n_data.tar.gz <user>@<new-vps-ip>:/tmp/
```

#### 4. Restore on the new VPS

```bash
ssh <user>@<new-vps-ip>
cd /opt/olcan-edge

# Restore Postgres dump
docker cp /tmp/n8n.dump olcan-n8n-postgres:/tmp/n8n.dump
docker exec olcan-n8n-postgres \
  pg_restore -U n8n -d n8n --clean --if-exists /tmp/n8n.dump

# Restore n8n data volume
docker run --rm \
  -v olcan-edge_n8n_data:/to \
  -v /tmp:/from \
  alpine sh -c "cd /to && tar xzf /from/n8n_data.tar.gz"

# Now start n8n
docker compose up -d n8n
docker compose logs -f n8n
```

#### 5. DNS cutover

In Cloudflare, change the `n8n` A record from `35.238.150.117` to the
new VPS IP. Set proxy to **DNS only** until Traefik issues the cert
(check `docker compose logs traefik | grep -i certificate`), then flip
to **Proxied**.

#### 6. Bring up Twenty (fresh)

Twenty has no source data — generate `TWENTY_APP_SECRET` and
`TWENTY_DB_PASSWORD` fresh per section A.4. Then:

```bash
docker compose up -d twenty-postgres twenty-redis twenty
```

Continue with A.7 and A.8.

#### 7. Decommission the GCP VM

After 24 h of stable operation on the new VPS:

```bash
gcloud compute instances stop n8n-server --zone=us-central1-a
# Wait another week before deleting — easy fallback if you find a regression
gcloud compute instances delete n8n-server --zone=us-central1-a
```

---

## Operations

### Backups

Add to root crontab on the VPS (daily at 03:00 BRT):

```cron
0 3 * * * cd /opt/olcan-edge && /opt/olcan-edge/bin/backup.sh
```

Recommended: a `bin/backup.sh` script that `pg_dump`s both Postgres
instances and tars the named volumes to a path the host backups up
(Hostinger snapshot plan, or rclone to a B2/R2 bucket).

### Updating an image

```bash
# Edit .env to bump *_TAG, then:
docker compose pull <service>
docker compose up -d <service>
```

For Twenty: read the [release notes](https://github.com/twentyhq/twenty/releases) —
some versions have manual migration steps.

### Tail a service

```bash
docker compose logs -f --tail=200 twenty
```

### Recreate Traefik (refreshes labels)

```bash
docker compose up -d --force-recreate traefik
```

---

## Sizing

| Service        | RAM idle | RAM under load |
| -------------- | -------- | -------------- |
| traefik        | 30 MB    | 50 MB          |
| n8n            | 200 MB   | 500 MB         |
| n8n-postgres   | 30 MB    | 100 MB         |
| twenty         | 600 MB   | 1.5 GB         |
| twenty-postgres| 30 MB    | 200 MB         |
| twenty-redis   | 20 MB    | 50 MB          |
| **Total**      | **~900 MB** | **~2.4 GB** |

Hostinger VPS 4 (16 GB) leaves ~13 GB for OS, future services, kernel
cache. Plenty of headroom for adding Mautic and a self-hosted email
relay later.

---

## When something is wrong

- **Cert not issued**: `docker compose logs traefik | grep -iE "acme|certificate"`. Common causes: DNS not pointing here, port 80 blocked at the firewall, Cloudflare proxy on (must be DNS-only at first).
- **Twenty 502**: Twenty takes 60–90 s on first start (migrations). Check `docker compose logs twenty`.
- **n8n shows "Cannot decrypt credential"**: encryption key mismatch. Stop n8n, fix `N8N_ENCRYPTION_KEY` in `.env`, restart.
- **OOM kills**: `dmesg | grep -i killed`. If it happens, scale up the VPS.
