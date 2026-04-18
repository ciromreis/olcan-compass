# Referências Open-Source e Micro-SaaS (Inspiração V2.5)

Este documento centraliza as referências e repositórios open-source essenciais para moldar os blocos de produto do Compass V2.5.

## 1. Geradores e Analisadores de Currículo (Resume Builders)
Ferramentas que inspiram o *Narrative Forge* e o *Dossier* da Olcan:
- **Reactive Resume** (Amjith/Amruth): Arquitetura de Builder com exportação PDF isolada do browser.
- **Resume Matcher** (srbhr/Resume-Matcher): Otimização de ATS. Referência direta para usarmos Python/Spacy + LLM comparando o currículo do Aspirante com a oportunidade (Matching).
- **OpenResume** (xitanggg/open-resume): Referência de parsing em tempo real do frontend para importação de PDFs antigos do usuário sem onerar o backend.
- **RenderCV**: Geração via YAML/LaTeX. Pode inspirar uma API de exportação determinística de perfil.

## 2. Preparação para Entrevistas (Interview Prep)
Ferramentas que inspiram o pilar do *AI Interview & Language Coach*:
- **Antriview** (codeaashu/antriview): Referência de front-end para gravação e pipeline de *Speech-to-Text* para agents de voz.
- **FoloUp** (FoloUp/FoloUp): Core arquitetural de geração de perguntas customizadas *on-the-fly* ao cruzar dados do Job Description (JD) e o Resume.
- **MockInt** (manthankhawse/Interview-Platform): Inspiração para o eventual sistema B2B2C onde o Mentor/Ecosystem Provider entra num mock real-time com o usuário de forma integrada ao portal Olcan.
- **Tech Interview Handbook** (yangshun): Curadoria do banco de dados (prompts da Gemini) de estruturação das etapas comportamentais e técnicas.

## 3. Aprendizado e Prática Linguística
- **OpenInterview** (dsdanielpark/open-interview): Funcionalidades agnósticas a língua. Referência para plugar suporte multilíngue (Espanhol, Alemão), essencial para os "Cartógrafos de Bolsas" europeus.
- **Scribe-Android**: Lógica de suporte contínuo/conjugação que pode ser incorporada como "Dicas inline" dentro do editor do *Narrative Forge*.

## 4. O Ecossistema Geral
- Referências como **Open Source SaaS Alternatives** guiando integrações secundárias (ex: Cal.com clone interno para agendamento dos mentores do Marketplace) e CRM pessoal via **Awesome Free SaaS**.
