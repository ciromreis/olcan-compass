# Celery Background Jobs - Economics Intelligence

Este documento descreve a infraestrutura de jobs em background implementada para as funcionalidades de inteligência econômica.

## Arquitetura

### Componentes

1. **Redis** - Broker e backend de resultados
2. **Celery Worker** - Processa tarefas assíncronas
3. **Celery Beat** - Scheduler para tarefas periódicas

### Configuração

**Arquivo**: `app/core/celery_app.py`
- Broker: Redis (configurado via `REDIS_URL` no `.env`)
- Serialização: JSON
- Timeout: 5 minutos (hard), 4 minutos (soft)
- Queue: `economics` (dedicada para tarefas de inteligência econômica)

**Arquivo**: `app/core/celery_beat.py`
- Define schedule de tarefas periódicas
- 3 tarefas agendadas (ver abaixo)

## Tarefas Implementadas

### 1. Credentials Tasks (`app/tasks/credentials.py`)

#### `generate_credential_task`
- **Trigger**: Quando `ReadinessAssessment.overall_readiness >= 80`
- **Função**: Gera credencial de verificação criptográfica
- **Retry**: 3 tentativas com backoff exponencial
- **Queue**: `economics`

#### `expire_old_credentials_task`
- **Schedule**: Diariamente às 01:00 UTC
- **Função**: Marca credenciais expiradas como inativas
- **Queue**: `economics`

### 2. Temporal Matching Tasks (`app/tasks/temporal_matching.py`)

#### `recalculate_temporal_matches_task`
- **Trigger**: Quando usuário completa avaliação psicológica
- **Função**: Recalcula preferência temporal e recomendações de rotas
- **Retry**: 3 tentativas com backoff exponencial
- **Queue**: `economics`

### 3. Opportunity Cost Tasks (`app/tasks/opportunity_cost.py`)

#### `calculate_opportunity_costs_daily_task`
- **Schedule**: Diariamente às 00:00 UTC
- **Função**: Calcula custos de oportunidade para todos os usuários com aplicações ativas
- **Queue**: `economics`

#### `check_momentum_and_trigger_widget_task`
- **Trigger**: Quando usuário completa marco ou tarefa
- **Função**: Verifica momentum e determina se deve mostrar widget
- **Retry**: 3 tentativas com backoff exponencial
- **Queue**: `economics`

### 4. Escrow Tasks (`app/tasks/escrow.py`)

#### `resolve_escrow_task`
- **Trigger**: Quando reserva performance-bound é marcada como completa
- **Função**: Resolve escrow baseado em melhoria de prontidão
- **Retry**: 3 tentativas com backoff exponencial
- **Queue**: `economics`

#### `check_escrow_timeouts_task`
- **Schedule**: A cada 30 minutos
- **Função**: Verifica escrows pendentes que excederam timeout (90 dias)
- **Queue**: `economics`

### 5. Scenario Optimization Tasks (`app/tasks/scenario_optimization.py`)

#### `calculate_feasible_frontier_task`
- **Trigger**: Quando usuário acessa Simulador de Cenários
- **Função**: Calcula fronteira viável de oportunidades Pareto-ótimas
- **Retry**: 3 tentativas com backoff exponencial
- **Queue**: `economics`

## Schedule de Tarefas Periódicas

| Tarefa | Frequência | Horário (UTC) | Descrição |
|--------|-----------|---------------|-----------|
| `calculate_opportunity_costs_daily_task` | Diária | 00:00 | Calcula custos de oportunidade |
| `expire_old_credentials_task` | Diária | 01:00 | Expira credenciais antigas |
| `check_escrow_timeouts_task` | A cada 30 min | - | Verifica timeouts de escrow |

## Executando Localmente

### Com Docker Compose (Recomendado)

```bash
# Iniciar todos os serviços
docker compose up --build

# Serviços incluídos:
# - db (PostgreSQL)
# - redis (Redis)
# - api (FastAPI)
# - celery_worker (Celery Worker)
# - celery_beat (Celery Beat Scheduler)
```

### Manualmente (Desenvolvimento)

```bash
# Terminal 1: Redis
redis-server

# Terminal 2: Celery Worker
cd apps/api
celery -A app.core.celery_app worker --loglevel=info --queues=economics

# Terminal 3: Celery Beat
cd apps/api
celery -A app.core.celery_app beat --loglevel=info

# Terminal 4: FastAPI
cd apps/api
uvicorn app.main:app --reload
```

## Monitoramento

### Flower (Web UI para Celery)

```bash
# Instalar Flower
pip install flower

# Executar
celery -A app.core.celery_app flower
```

Acesse: http://localhost:5555

### Logs

```bash
# Logs do worker
docker compose logs -f celery_worker

# Logs do beat
docker compose logs -f celery_beat
```

## Variáveis de Ambiente

Adicione ao `.env`:

```env
# Redis and Celery
REDIS_URL=redis://redis:6379/0
```

## Integração com Engines Existentes

As tarefas são acionadas automaticamente pelos seguintes endpoints:

1. **Psychology Engine** (`/api/psych/assessments/{id}/complete`)
   - Trigger: `recalculate_temporal_matches_task`
   - Trigger: `generate_credential_task` (se score >= 80)

2. **Routes Engine** (`/api/routes/milestones/{id}/complete`)
   - Trigger: `check_momentum_and_trigger_widget_task`

3. **Sprints Engine** (`/api/sprints/tasks/{id}/complete`)
   - Trigger: `check_momentum_and_trigger_widget_task`
   - Trigger: `generate_credential_task` (se readiness >= 80)

4. **Marketplace Engine** (`/api/marketplace/bookings/{id}/complete`)
   - Trigger: `resolve_escrow_task` (se performance-bound)

5. **Applications Engine** (`/api/scenarios/calculate-frontier`)
   - Trigger: `calculate_feasible_frontier_task`

## Tratamento de Erros

- **Retry automático**: 3 tentativas com backoff exponencial (60s, 120s, 240s)
- **Logging estruturado**: Todos os erros são logados com contexto completo
- **Validação**: Erros de validação não são retentados
- **Rollback**: Transações de banco são revertidas em caso de erro

## Performance

- **Timeout**: 5 minutos máximo por tarefa
- **Prefetch**: 1 tarefa por worker (evita sobrecarga)
- **Acks late**: Tarefas só são confirmadas após conclusão
- **Queue dedicada**: `economics` para isolamento

## Próximos Passos

1. Adicionar monitoramento com Prometheus/Grafana
2. Implementar alertas para falhas críticas
3. Adicionar rate limiting para tarefas de alta frequência
4. Implementar circuit breaker para serviços externos (Stripe)
5. Adicionar testes de integração para tarefas Celery
