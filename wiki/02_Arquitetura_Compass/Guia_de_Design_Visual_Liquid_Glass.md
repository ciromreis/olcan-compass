---
title: Guia Design Visual Liquid Glass
type: drawer
layer: 2
status: active
last_seen: 2026-04-17
backlinks:
  - Guia_Mestre_Design_System_Master
  - PRD_Master_Ethereal_Glass
  - Arquitetura_v2_5_Compass
---

# Guia de Design Visual: Liquid Glass (Olcan Style)

**Resumo**: Manual de identidade visual e padrões de UI para o Olcan Compass v2.5, focando na estética "Liquid Glass", transparências e animações premium.
**Importância**: Alto
**Status**: Ativo
**Camada (Layer)**: Social
**Tags**: #design #UI #liquidglass #frontend #framer-motion #estilização
**Criado**: 31/03/2026
**Atualizado**: 17/04/2026

---

## 🧠 Contexto BMAD
O design "Liquid Glass" é a representação visual do breakthrough. No BMAD, a clareza da interface deve espelhar a clareza que o produto traz para a carreira do usuário. Este guia assegura que qualquer novo componente mantenha o nível de fidelidade "Premium" exigido pela marca.

## Conteúdo

### Fundamentos Visuais
- **Transparência e Blur**: Uso de `backdrop-filter: blur()` para criar profundidade.
- **Gradientes**: Transições suaves entre cores de marca (Brand 500 para Brand 700).
- **Sombras Coloridas**: Sombras que carregam a matiz do objeto para um efeito de iluminação natural.

### Padrões de Componentes
- **Cards**: Bordas finas (`border-cream-200/50`) e fundos translúcidos.
- **Botões**: Gradientes vibrantes e `hover lift` (elevação ao passar o mouse).
- **Animações (Framer Motion)**: Entradas suaves de baixo para cima (`opacity: 0, y: 20 -> opacity: 1, y: 0`).

### Implementação (Tailwind)
```tsx
// Exemplo de Glass Card
<div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-xl">
  ...
</div>
```

## 🔗 Referências Relacionadas
- [[03_Produto_Forge/Mapeamento_Design_para_Funcionalidade]]
- [[02_Arquitetura_Compass/Arquitetura_v2_5_Compass]]
