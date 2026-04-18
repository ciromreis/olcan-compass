# Relatório de Diagnóstico de Bugs: V2.5

Este documento detalha os problemas críticos relatados pelos usuários no lançamento da V2 do Olcan Compass, apresentando uma análise técnica aprofundada de suas causas-raiz e definindo passos de execução (actionable fixes) para o próximo release (**V2.5**).

---

## 1. Problema de Login: Lentidão e Falha Inicial
**Relato do Usuário:** "Tenta logar, dá mensagem de erro. Se tentar de novo, o login funciona. Também demora muito."

**Diagnóstico Técnico:**
O atraso intermitente ocorre devido a **Cold Starts** (tempo de inicialização) no servidor de banco de dados e APIs sem servidor (Vercel Serverless Functions + Neon Serverless Postgres). Quando a aplicação fica algum tempo em inatividade, a primeira requisição "acorda" o banco de dados e a infraestrutura de rede, o que frequentemente leva mais do que 10–15 segundos (limite comum da infraestrutura serverless) ou estoura o timeout de 30s do Axios (`src/lib/api.ts`). O erro é reportado no frontend. Na tentativa imediatamente subsequente, os serviços já estão aquecidos (_warm_) e a resposta ocorre rapidamente, permitindo o login normal.

**Solução Recomendada para V2.5:**
- Implementar uma lógica silenciosa de **Retry (tentativas automáticas)** com backoff exponencial dentro do cliente HTTP (`apps/web-v2/src/lib/api.ts`) especialmente em rotas críticas como Auth.
- Extender os limites máximos de tempo de execução (`maxDuration`) no arquivo `next.config.mjs` (ou `vercel.json` caso não tenha) para garantir tolerância inicial ao primeiro impacto no NeonDB.

---

## 2. Erro Crítico na Criação de Rotas
**Relato do Usuário:** "Criação de rotas no Compass não funciona, apresentando erro: 'Não foi possível criar a rota na API'."

**Diagnóstico Técnico:**
O erro visual é genérico e esconde um **Crash 500 no Backend**. 
No endpoint `GET /routes/templates` (`apps/api/app/api/routes/routes.py`), há uma lógica que tenta acessar e ordenar templates usando o atributo `.temporal_match_score` para usuários que possuem perfil psicológico. Contudo, essa propriedade não está definida no modelo Pydantic `RouteTemplateResponse` (`apps/api/app/schemas/route.py`). Isso lança um `AttributeError`, derrubando o endpoint. O arquivo `stores/routes.ts` (`addRoute`) no front pega esse crash 500 e exibe a mensagem de erro que trava a criação de qualquer Rota.

**Solução Recomendada para V2.5:**
- Adicionar a propriedade opcional `temporal_match_score: Optional[int] = None` no schema `RouteTemplateResponse`.
- Refatorar a captura de erros em `stores/routes.ts` para que receba os detalhes reais do erro do backend em vez de sobrescrever silenciosamente por "Não foi possivel...".

---

## 3. Bugs no Módulo de Entrevistas
**Resumo dos Relatos:** Timer não para após finalização; tempo de duração fixado de maneira incorreta (ex: 5916 minutos); e simulador não contabiliza as sessões para comparações no dashboard.

**Sintoma A (Memory Leak no Timer):** Em `[id]/session/page.tsx`, um `setInterval` atualiza o tempo enquanto grava a sessão. Não há nenhum comando `clearInterval` acoplado ao encerramento (booleano `isFinished = true`), o que significa que ele continua rodando infinitamente em "background" daquela tela até o desmonte completo do react node. 

**Sintoma B (Duração Estática Irreal):** A duração de uma entrevista no backend (`apps/api/app/api/routes/interview.py`) e frontend (`stores/interviews.ts`) não calcula a adição linear de *segundos* praticados (Tempo Ativo Respondendo). Em vez disso, baseia-se num delta simples de calendário (`completedAt - startedAt`). Se o usuário inicia uma entrevista na terça-feira e submete a última resposta no sábado, a duração calculada totaliza a diferença em dias corridos (e.g. 5916 minutos).
*Solução:* Somar o atributo `time_spent_seconds` (ou calcular a soma dos tempos das respostas) existente no db, descartando a diferença absoluta de cronograma `completedAt - startedAt`.

**Sintoma C (Falha na Comparação de Histórico):** A lógica no arquivo `interviews/page.tsx` está filtrando sessões com `if (remote.overall_score)`. Caso um simulador tenha dado score **ZERO** (ou se os novos scores estiverem com chaves incorretas), o filtro com `?` os interpreta com valor *falsy*, sendo brutalmente ignorados do gráfico de progressão e estatística. Adicionalmente, só ocorre a coleta inicial de paginação no GET (primeiras 20 sessões).

---

## 4. Loops de Navegação Inexistentes e Ocultos na Comunidade
**Relato do Usuário:** "Não dá a opção de verificar respostas (apenas exibe 2 links) e o link para respostas volta para a página principal Num loop."

**Diagnóstico Técnico:**
Duas falhas fundamentais de UX causam esse "loop imaginário":
1. **O componente `CommunityContextSection.tsx`** é onde cards úteis (`saves` e `respostas`) são sugeridos aos usuários, como no *Dashboard e Entrevistas*. Na tentativa de visualizar as respostas, o componente engloba todos os cards do grid inteiro com um genérico `<Link href="/community">`. O clique do usuário resulta nele caindo no topo da central ("feedão") da comunidade e não na página da postagem, fazendo-o ter a sensação de que caiu num "loop" para a página raiz.
2. **Páginas detalhadas inexistentes**: Por trás, ao encontrar no Feed uma pergunta criada por usuário que mostre um botão **"Abrir"** apontando dinamicamente para `app/community/[id]`, o arquivo **page.tsx** de rota interna detalhada desse `[id]` simplesmente não foi desenvolvido/construído no código. Isso faz com que Next.js devolva a página `404 Not Found`, forçando o usuário a voltar. A exibição restrita à propriedade de listagem inline de `.slice(0, 2)` esconde de vez qualquer chance de leitura de discussões amplas.

---

## 5. Falha de Desempenho na Criação de Sprints
**Relato do Usuário:** "A configuração do usuário do Sprint dá a mensagem 'Não foi possível criar o Sprint agora' e demora muito tempo na tela."

**Diagnóstico Técnico:**
O front-end possui uma inteligência geradora de tarefas (`buildSprintPlan` em `sprint-planner.ts`) baseada no template e num número de semanas. Quando a submissão é ativada (`handleCreate` em `new/page.tsx`), a Store Pinia/Zustand despacha a criação inicial da capa do Sprint, seguida imediatamente por um bloco **`Promise.all`** que dispara múltiplos comandos `POST /{sprint_id}/tasks` de forma concorrente, uma vez para cada nova tarefa a ser anexada. Dependendo do tamanho do sprint gerado, 10 a 20+ requisições são disparadas em milissegundos.
**O problema da infraestrutura:** Disparar 20 requisições simultâneas contra um Banco de Dados Relacional Neon e lambdas instanciados provoca exaustão instantânea da API de Pooling, resultando em estourar rapidamente o limite de duração padrão do Vercel e derrubando as últimas promessas com falha 5xx. A falha demora ("demora muito") justamente pela configuração de timeout do Serverless aguardando.

**Solução Recomendada para V2.5:**
- Criar um novo endpoint batch e schema (`SprintTaskBulkCreate`), enviando apenas **uma única** requisição HTTP POST para o Backend processar todos os subregistros de sprint (`inserts`) nas transações limpas; ou habilitar as tarefas num argumento em lista nativamente dentro da `schema/sprint.py` (i.e. em `UserSprintCreate`).

---

## 6. Descobertas Extras de Testes Automatizados (Browser)
Durante testes exploratórios na versão de produção (`compass.olcan.com.br`), os seguintes problemas adicionais foram documentados:
1. **Erro de SMTP no Cadastro:** O servidor exibe a mensagem `SMTP não configurado para envio em produção`, o que impede o envio do e-mail de verificação para novos usuários, bloqueando o funil de comunicação.
2. **UX de Nomenclatura de Sprints:** Ao selecionar um template de Sprint (ex: "Sprint Financeiro"), o nome do template preenche o input. Se o usuário começa a digitar sem apagar (comportamento comum), o nome fica concatenado (ex: `Sprint FinanceiroMeu Teste`). Sugere-se limpar o input ao focar (onFocus) ou selecionar o texto automaticamente.
3. **Dropdown "Prazo desejado" instável:** Na criação de Rotas, o dropdown Customizado aparenta instabilidade visual de estado quando opções são selecionadas.
4. O erro genérico **"Não foi possível criar a rota na API"** foi confirmado ao vivo no ambiente de produção.
