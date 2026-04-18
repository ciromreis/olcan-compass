---
title: Guia Mestre Design System Liquid-Glass
type: drawer
layer: 2
status: active
last_seen: 2026-04-17
backlinks:
  - Arquitetura_v2_5_Compass
  - PRD_Geral_Olcan
  - Guia_de_Design_Visual_Liquid_Glass
---

# Guia Mestre: Design System Liquid-Glass (Master Spec)

**Resumo**: Especificação definitiva do sistema de design "Liquid-Glass" para o Olcan Compass v2.5, integrando filosofia metamoderna, tokens, motion e integração com o sistema OIOS.
**Importância**: Crítico
**Status**: Ativo
**Camada (Layer)**: Apresentação
**Tags**: #design-system #liquid-glass #ux #ui #metamodern #tokens
**Criado**: 12/03/2026
**Atualizado**: 17/04/2026

---

## 🧠 Filosofia Visual: Metamodernismo Liquid-Glass

O design do Olcan Compass não é apenas uma interface; é um material. O framework **Metamodern** oscila entre a seriedade funcional e o deleite lúdico (game-like).

### Pilares Estéticos
1. **Translucidez (Glassmorphism)**: Superfícies em camadas com opacidade variável, criando uma hierarquia espacial profunda.
2. **Profundidade Eixo-Z**: O uso de sombras suaves e desfoque (blur) para denotar prioridade e foco.
3. **Refração e Luz**: Interações de luz difusa que reagem ao movimento do usuário.
4. **Fluididade**: Transições suaves que fazem a interface parecer "viva" e responsiva.

---

## 🎨 Sistema de Materiais

### O Material "Glass"
O "vidro" do Olcan é definido por quatro propriedades CSS fundamentais:
- `backdrop-filter: blur(20px)`
- `background: rgba(255, 255, 255, 0.05)`
- `border: 1px solid rgba(255, 255, 255, 0.1)`
- `box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37)`

---

## 🕹️ Interações Game-Like

A interface deve "responder" como um jogo de alta fidelidade:
- **Feedback Imediato**: Cada clique gera uma micro-reação visual.
- **Micro-Momentos Satisfatórios**: Som e movimento coordenados para ações bem-sucedidas.
- **Divulgação Progressiva**: Complexidade revelada apenas quando necessária, evitando a sobrecarga cognitiva (anti-AI Slop).

---

## 🧩 Biblioteca de Componentes

### Primitivos
- **Glass Card**: O container base para todo o conteúdo.
- **Refraction Button**: Botões que parecem dobrar a luz ao passar o mouse (hover).
- **Glint Badge**: Indicadores de status com brilho dinâmico.

### Organismos
- **Navigation Mirror**: Menu superior translúcido que reflete as cores da seção.
- **Dashboard Nexus**: Visualização central de métricas com widgets em camadas.

---

## 🧬 Integração OIOS e Arquétipos

O sistema visual muda dinamicamente conforme o arquétipo OIOS do usuário:
- **Arquiteto**: Tons de azul profundo, linhas técnicas, precisão matemática.
- **Explorador**: Tons de âmbar/ouro, movimento fluido, foco em descoberta.
- **Estrategista**: Tons de esmeralda, foco em dados e conexões.

---

## 🛠️ Implementação Técnica

### Stack de Design
- **Framer Motion**: Para orquestração de animações complexas.
- **Tailwind CSS v4**: Utilitários de design flexíveis.
- **Radix UI**: Primitivos acessíveis como base para componentes customizados.

### Anti-Padrões (O que EVITAR)
- ❌ **AI Slop**: Layouts genéricos de cartões sem profundidade.
- ❌ **Emoji Overload**: Uso excessivo de ícones infantis que degradam a sofisticação.
- ❌ **Flat Design**: Interfaces sem sombras ou camadas que parecem "mortas".

---

## 🔗 Referências Relacionadas
- [[02_Arquitetura_Compass/Arquitetura_v2_5_Compass.md]]
- [[03_Produto_Forge/Biblioteca_de_Componentes_UI_MVP.md]]
- [[00_Onboarding_Inicio/Padroes_de_Codigo.md]]
