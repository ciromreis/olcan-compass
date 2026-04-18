# Data to be inserted on the databases

{  
  "olcan\_compass\_seeding\_data": {  
    "identity\_psychological\_domain": {  
      "psych\_questions": \[  
        {  
          "id": "q\_loss\_aversion\_1",  
          "block": "LOSS\_SENSITIVITY",  
          "text": "Eu prefiro manter minha estabilidade atual do que arriscar uma vaga júnior em um mercado mais forte.",  
          "scale": "LIKERT\_1\_5",  
          "system\_trigger": "If \> 3, prioritize D7/Academic 'Safe' Routes"  
        },  
        {  
          "id": "q\_risk\_orientation\_1",  
          "block": "RISK\_TOLERANCE",  
          "text": "Sinto-me confortável em investir mais de 50% das minhas economias sem garantia de emprego imediata.",  
          "scale": "LIKERT\_1\_5",  
          "system\_trigger": "Determines Aggressive vs. Conservative Route filtering"  
        },  
        {  
          "id": "q\_action\_discipline\_1",  
          "block": "DISCIPLINE",  
          "text": "Consigo manter uma rotina de 5h/semana de preparação mesmo sem feedbacks positivos em 3 meses.",  
          "scale": "LIKERT\_1\_5",  
          "system\_trigger": "If \< 3, activate Micro-Sprints (\<2h chunking)"  
        },  
        {  
          "id": "q\_goal\_clarity\_1",  
          "block": "GOAL\_CLARITY",  
          "text": "Minha prioridade é o estilo de vida (lifestyle) mais do que a ascensão na hierarquia corporativa.",  
          "scale": "LIKERT\_1\_5",  
          "system\_trigger": "Differentiates Nomad vs. Corporate pathways"  
        },  
        {  
          "id": "q\_interview\_anxiety\_1",  
          "block": "INTERVIEW\_ANXIETY",  
          "text": "Meu desempenho em entrevistas cai drasticamente quando percebo que sou o candidato menos experiente.",  
          "scale": "LIKERT\_1\_5",  
          "system\_trigger": "Sets initial mock interview difficulty to Level 1 or 2"  
        },  
        {  
          "id": "q\_narrative\_efficacy\_1",  
          "block": "NARRATIVE\_STRENGTH",  
          "text": "Sinto que minhas habilidades são únicas e competitivas em qualquer mercado global.",  
          "scale": "LIKERT\_1\_5",  
          "system\_trigger": "Initializes Narrative Engine baseline confidence"  
        }  
      \],  
      "archetypes\_matrix": \[  
        {"id": "arch\_01", "name": "O Desenvolvedor Técnico Travado", "fear\_cluster": "COMPETENCE", "route\_affinity": "CORPORATE"},  
        {"id": "arch\_02", "name": "A Servidora Pública Presa", "fear\_cluster": "IRREVERSIBILITY", "route\_affinity": "ACADEMIC"},  
        {"id": "arch\_03", "name": "O Jovem FOMO Sem Direção", "fear\_cluster": "REJECTION", "route\_affinity": "EXCHANGE"},  
        {"id": "arch\_04", "name": "O Executivo Sênior Tarde Demais", "fear\_cluster": "COMPETENCE", "route\_affinity": "CORPORATE"},  
        {"id": "arch\_05", "name": "A Mãe Solo Exausta", "fear\_cluster": "IRREVERSIBILITY", "route\_affinity": "SCHOLARSHIP"},  
        {"id": "arch\_06", "name": "O Nômade Digital Inseguro", "fear\_cluster": "COMPETENCE", "route\_affinity": "NOMAD"},  
        {"id": "arch\_07", "name": "O Acadêmico Provinciano", "fear\_cluster": "REJECTION", "route\_affinity": "ACADEMIC"},  
        {"id": "arch\_08", "name": "O Casal LGBT+ Com Receio", "fear\_cluster": "REJECTION", "route\_affinity": "CORPORATE"},  
        {"id": "arch\_09", "name": "O Profissional de Saúde Dividido", "fear\_cluster": "LOSS", "route\_affinity": "CORPORATE"},  
        {"id": "arch\_10", "name": "O Empreendedor Falido", "fear\_cluster": "IRREVERSIBILITY", "route\_affinity": "STARTUP"},  
        {"id": "arch\_11", "name": "O Profissional de Humanas Desvalorizado", "fear\_cluster": "COMPETENCE", "route\_affinity": "SCHOLARSHIP"},  
        {"id": "arch\_12", "name": "O Neuroatípico Exausto", "fear\_cluster": "COMPETENCE", "route\_affinity": "CORPORATE"}  
      \],  
      "fear\_reframe\_cards": \[  
        {  
          "cluster": "COMPETENCE",  
          "reframe\_text": "A preparação excessiva é frequentemente uma forma sofisticada de procrastinação. Sua dúvida atual é um sinal de que você está operando na fronteira da sua habilidade. Recrutadores buscam potencial de aprendizado, não apenas conhecimento enciclopédico."  
        },  
        {  
          "cluster": "REJECTION",  
          "reframe\_text": "A rejeição não é um veredito sobre seu valor, mas um desajuste momentâneo de 'fit'. No mercado global, o 'não' é apenas um dado a ser iterado. Sistemas ATS usam filtros algorítmicos; não leve para o lado pessoal, leve para a estratégia."  
        },  
        {  
          "cluster": "LOSS",  
          "reframe\_text": "Compare o custo de ficar onde está (estagnação, perda de potencial) com o risco da mudança. Antecipar a perda dói 6x mais que imaginar o ganho, mas o ganho é o que permanece."  
        },  
        {  
          "cluster": "IRREVERSIBILITY",  
          "reframe\_text": "Você não está pulando no abismo; estamos construindo um experimento controlado. Você pode testar hipóteses, obter licenças, e manter caminhos de volta. A internacionalização é reversível."  
        }  
      \]  
    },  
    "route\_lifecycle\_domain": {  
      "route\_templates": \[  
        {  
          "id": "rt\_academic",  
          "route\_type": "SCHOLARSHIP",  
          "display\_name": "Rota Acadêmica e Bolsas",  
          "interview\_likelihood\_score": 70,  
          "competitiveness\_index": 85,  
          "readiness\_weights": {"academic": 0.40, "language": 0.30, "documents": 0.20, "financial": 0.10}  
        },  
        {  
          "id": "rt\_corporate",  
          "route\_type": "JOB",  
          "display\_name": "Relocação Corporativa (Job Sponsorship)",  
          "interview\_likelihood\_score": 95,  
          "competitiveness\_index": 80,  
          "readiness\_weights": {"experience": 0.40, "interview": 0.30, "language": 0.20, "documents": 0.10}  
        },  
        {  
          "id": "rt\_nomad",  
          "route\_type": "STARTUP",  
          "display\_name": "Visto Nômade / Renda Passiva",  
          "interview\_likelihood\_score": 20,  
          "competitiveness\_index": 40,  
          "readiness\_weights": {"financial": 0.70, "documents": 0.20, "momentum": 0.10}  
        }  
      \],  
      "route\_template\_milestones": \[  
        {  
          "route\_template\_id": "rt\_nomad",  
          "milestones": \[  
            {"order": 1, "title": "Obtenção do NIF (Tax ID)", "dimension": "DOCUMENT", "weight": 5, "mandatory": true, "dependencies": \[\]},  
            {"order": 2, "title": "Abertura de Conta Bancária PT", "dimension": "FINANCIAL", "weight": 5, "mandatory": true, "dependencies":},  
            {"order": 3, "title": "Prova de Renda Ativa (€3.680/mês)", "dimension": "FINANCIAL", "weight": 50, "mandatory": true, "dependencies":},  
            {"order": 4, "title": "Alojamento (12 meses)", "dimension": "DOCUMENT", "weight": 15, "mandatory": true, "dependencies":},  
            {"order": 5, "title": "Visto Consular", "dimension": "APPLICATION", "weight": 10, "mandatory": true, "dependencies":},  
            {"order": 6, "title": "Agendamento AIMA", "dimension": "APPLICATION", "weight": 15, "mandatory": true, "dependencies":}  
          \]  
        },  
        {  
          "route\_template\_id": "rt\_corporate",  
          "milestones": \[  
            {"order": 1, "title": "Atualização CV Global (ATS-friendly)", "dimension": "NARRATIVE", "weight": 15, "mandatory": true, "dependencies": \[\]},  
            {"order": 2, "title": "English Proficiency (B2 CEFR)", "dimension": "TEST", "weight": 15, "mandatory": true, "dependencies": \[\]},  
            {"order": 3, "title": "Mock Interview Technical", "dimension": "INTERVIEW", "weight": 20, "mandatory": true, "dependencies":},  
            {"order": 4, "title": "Job Offer & CoS (Sponsorship)", "dimension": "FINANCIAL", "weight": 40, "mandatory": true, "dependencies":},  
            {"order": 5, "title": "Visa Application (Home Office)", "dimension": "APPLICATION", "weight": 10, "mandatory": true, "dependencies":}  
          \]  
        }  
      \]  
    },  
    "application\_management\_domain": {  
      "opportunities\_seed": \[  
        {  
          "id": "opp\_uk\_skilled\_worker",  
          "title": "UK Skilled Worker Visa (Tech)",  
          "organization\_name": "UK Home Office",  
          "country": "Reino Unido",  
          "route\_type": "JOB",  
          "competitiveness\_index": 70,  
          "document\_requirements\_json": {"language": "B2 CEFR", "degree": "RQF Level 6+"},  
          "hard\_constraints": {"min\_salary\_gbp": 49430, "sponsor\_license\_required": true}  
        },  
        {  
          "id": "opp\_pt\_d8\_nomad",  
          "title": "Portugal Digital Nomad Visa (D8)",  
          "organization\_name": "Governo de Portugal",  
          "country": "Portugal",  
          "route\_type": "STARTUP",  
          "competitiveness\_index": 30,  
          "document\_requirements\_json": {"nif\_required": true, "pt\_bank\_account": true},  
          "hard\_constraints": {"min\_monthly\_income\_eur": 3680}  
        },  
        {  
          "id": "opp\_uk\_hpi",  
          "title": "UK High Potential Individual (HPI) Visa",  
          "organization\_name": "UK Home Office",  
          "country": "Reino Unido",  
          "route\_type": "JOB",  
          "competitiveness\_index": 80,  
          "document\_requirements\_json": {"language": "B2 CEFR"},  
          "hard\_constraints": {"min\_savings\_gbp": 1270, "global\_top\_50\_university": true, "quota\_limit": 8000}  
        },  
        {  
          "id": "opp\_chevening",  
          "title": "Chevening Scholarship (UK)",  
          "organization\_name": "FCDO",  
          "country": "Reino Unido",  
          "route\_type": "SCHOLARSHIP",  
          "competitiveness\_index": 95,  
          "deadline": "2026-10-07T00:00:00Z",  
          "hard\_constraints": {"min\_work\_experience\_hours": 2800, "return\_home\_2\_years\_required": true}  
        },  
        {  
          "id": "opp\_fulbright\_br",  
          "title": "Fulbright Brazil (EUA)",  
          "organization\_name": "Fulbright Commission",  
          "country": "EUA",  
          "route\_type": "RESEARCH",  
          "competitiveness\_index": 90,  
          "deadline": "2026-08-03T00:00:00Z",  
          "hard\_constraints": {"phd\_or\_active\_faculty": true, "min\_toefl\_ibt": 81}  
        }  
      \],  
      "sponsoring\_companies\_seed": \[  
        {"name": "Amazon", "industry": "Tech & Supply Chain", "h1b\_approvals\_estimate": 2600},  
        {"name": "Google LLC", "industry": "IT & Marketing", "h1b\_approvals\_estimate": 5500},  
        {"name": "Microsoft Corp", "industry": "Software & Business", "h1b\_approvals\_estimate": 6200},  
        {"name": "Novo Nordisk", "industry": "Pharma", "hiring\_location": "Denmark"}  
      \]  
    },  
    "interview\_engine\_domain": {  
      "interview\_questions\_seed": \[  
        {  
          "question\_type": "MOTIVATION",  
          "difficulty\_level": 1,  
          "route\_type": "SCHOLARSHIP",  
          "text": "Por que este país especificamente agora? O que você pesquisou sobre o estilo de vida local e o sistema acadêmico?"  
        },  
        {  
          "question\_type": "BEHAVIORAL",  
          "difficulty\_level": 3,  
          "route\_type": "JOB",  
          "text": "Conte sobre um desentendimento cultural ou técnico que você teve em um time diverso e como você o resolveu (Use o método STAR)."  
        },  
        {  
          "question\_type": "TECHNICAL",  
          "difficulty\_level": 4,  
          "route\_type": "JOB",  
          "text": "Como você quantificou o retorno sobre investimento (ROI) da sua última grande entrega tecnológica em termos de valor comercial?"  
        },  
        {  
          "question\_type": "STRESS\_TEST",  
          "difficulty\_level": 5,  
          "route\_type": "CORPORATE",  
          "text": "Você percebe que seu gestor está tomando uma decisão ética questionável (ou subvertendo compliance) para acelerar um projeto crítico. Como você procede sob alta pressão de entrega?"  
        }  
      \]  
    },  
    "ai\_governance\_domain": {  
      "ai\_prompts\_seed": \[  
        {  
          "task\_type": "NARRATIVE\_ANALYSIS",  
          "version": 1,  
          "system\_prompt": "Você é o Motor de Inteligência Olcan, atuando como um Consultor de Mobilidade Global de Elite e Coach de Escrita. Sua voz é concisa, executiva e focada em resultados. Não atue como corretor ortográfico genérico. Avalie o texto do usuário focado em Persuasão Estratégica, Trajetória de Crescimento (Slope positivo) e Fit Cultural do país destino. Penalize clichês agressivamente (-0.5 pontos para frases como 'sempre foi meu sonho'). Responda ESTRITAMENTE usando o JSON Schema fornecido.",  
          "output\_schema\_json": {  
            "type": "object",  
            "properties": {  
              "clarity\_score": {"type": "integer", "minimum": 0, "maximum": 100},  
              "coherence\_score": {"type": "integer", "minimum": 0, "maximum": 100},  
              "authenticity\_risk": {"type": "integer", "minimum": 0, "maximum": 100},  
              "cliche\_density\_score": {"type": "integer", "minimum": 0, "maximum": 100},  
              "improvement\_actions": {  
                "type": "array",  
                "items": {"type": "string", "description": "Specific, segment-based action. E.g., 'Rewrite paragraph 3 to clarify how your research connects...'}  
              }  
            },  
            "required": \["clarity\_score", "coherence\_score", "authenticity\_risk", "cliche\_density\_score", "improvement\_actions"\]  
          }  
        },  
        {  
          "task\_type": "INTERVIEW\_EVALUATION",  
          "version": 1,  
          "system\_prompt": "Você é o Motor de Simulação de Entrevistas Olcan. Avalie a transcrição da resposta do candidato com base na metodologia STAR. Identifique hesitações, falta de especificidade e avalie a projeção de confiança. Se o usuário demonstrar defensividade em perguntas de stress-test, reduza o resilience\_index. Retorne apenas JSON.",  
          "output\_schema\_json": {  
            "type": "object",  
            "properties": {  
              "delivery\_score": {"type": "integer", "minimum": 0, "maximum": 100},  
              "structure\_score": {"type": "integer", "minimum": 0, "maximum": 100},  
              "confidence\_projection\_score": {"type": "integer", "minimum": 0, "maximum": 100},  
              "resilience\_index": {"type": "integer", "minimum": 0, "maximum": 100},  
              "improvement\_actions": {"type": "array", "items": {"type": "string"}}  
            },  
            "required": \["delivery\_score", "structure\_score", "confidence\_projection\_score", "resilience\_index", "improvement\_actions"\]  
          }  
        }  
      \]  
    },  
    "monetization\_marketplace\_domain": {  
      "subscriptions\_tiers": \[  
        {"plan\_type": "FREE", "name": "Compass Lite", "price": 0.00, "features": \["1 Route (Find Only)", "Diagnostic Card", "1 Narrative Analysis", "1 Mock Interview"\]},  
        {"plan\_type": "PRO", "name": "Compass Core", "price": 79.00, "features": \["Full 1 Route", "Unlimited AI Narrative", "Unlimited Mock Interviews", "Marketplace Access", "PDF Exports"\]},  
        {"plan\_type": "PREMIUM", "name": "Compass Pro", "price": 149.00, "features": \["All 4 Routes", "Scenario Builder", "Priority AI", "2 Mentorship Credits/mo"\]}  
      \],  
      "digital\_products": \[  
        {"id": "dp\_rota", "name": "Rota da Internacionalização (Miro)", "price": 35.00, "route\_type": null},  
        {"id": "dp\_kit", "name": "Kit Application (Notion)", "price": 75.00, "route\_type": "ALL"},  
        {"id": "dp\_course", "name": "Curso Sem Fronteiras", "price": 497.00, "route\_type": "ALL"}  
      \],  
      "provider\_services\_seed": \[  
        {"service\_type": "GENERAL\_MENTORSHIP", "name": "Mentoria Personalizada Olcan (1h)", "base\_price": 225.00, "delivery\_mode": "ONLINE", "commission\_percentage": 0.0},  
        {"service\_type": "CV\_REVIEW", "name": "Revisão de Portfólio / CV Assíncrona", "base\_price": 180.00, "delivery\_mode": "ONLINE", "commission\_percentage": 0.15},  
        {"service\_type": "INTERVIEW\_COACHING", "name": "Mock Interview Human-in-the-Loop", "base\_price": 225.00, "delivery\_mode": "ONLINE", "commission\_percentage": 0.15},  
        {"service\_type": "GENERAL\_MENTORSHIP", "name": "Pacote VIP Application (5 Sessões)", "base\_price": 2500.00, "delivery\_mode": "ONLINE", "commission\_percentage": 0.0}  
      \]  
    }  
  }  
}

