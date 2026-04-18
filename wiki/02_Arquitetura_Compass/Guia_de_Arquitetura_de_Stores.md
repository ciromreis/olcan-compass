---
title: Guia de Arquitetura de Stores
type: drawer
layer: 2
status: active
last_seen: 2026-04-17
backlinks:
  - Arquitetura_v2_5_Compass
  - Verdade_do_Produto
---

# Guia de Arquitetura de Stores (Zustand)

**Resumo**: Padrões e regras para criação e manutenção de stores de estado no frontend utilizando Zustand, garantindo performance e legibilidade.
**Importância**: Alto
**Status**: Ativo
**Camada (Layer)**: Execução
**Tags**: #zustand #frontend #estado #arquitetura #padrões
**Criado**: 11/04/2026
**Atualizado**: 15/04/2026

---

## 🧠 Contexto BMAD
A arquitetura de stores é o "Nexus" do gerenciamento de dados no frontend. No BMAD, stores limpas e bem delimitadas permitem que a IA entenda o estado da aplicação sem ambiguidade, facilitando a automação de novas features.

## Conteúdo

### Regras de Ouro
1. **Atômica, não Monolítica**: Cada store deve ter uma responsabilidade clara (ex: `useAuthStore`, `useCompanionStore`).
2. **Persistência Seletiva**: Apenas dados críticos (tokens, perfil) devem ser persistidos no localStorage.
3. **Imutabilidade**: Sempre use o padrão de atualização funcional do Zustand.

### Estrutura de uma Store Canônica
- `state`: Dados brutos.
- `actions`: Funções que modificam o estado.
- `computed` (opcional): Seletores para facilitar o uso no React.

### Exemplo de Limpeza (v2.5)
Durante o refactor, removemos stores redundantes como `useUserStore` (agora consolidada em `useAuthStore`) para evitar dessincronização de dados.

## 🔗 Referências Relacionadas
- [[02_Arquitetura_Compass/Arquitetura_v2_5_Compass]]
- [[00_Onboarding_Inicio/Guia_de_Desenvolvimento]]
