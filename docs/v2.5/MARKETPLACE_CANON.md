# Marketplace Canon

## Workspace canônico

- `olcan-marketplace/` é a instância operacional e customizada do marketplace da Olcan.
- `mercur/` permanece apenas como referência upstream do framework Mercur para consulta técnica e comparação.

## Regra de produto

- O usuário final não deve ver marca `Mercur` ou `Medusa` na jornada comercial.
- A experiência deve ser apresentada como uma única camada Olcan entre site, app e operação comercial.

## Regra de desenvolvimento

- Toda customização de runtime, seed, tema, credenciais e integração deve acontecer em `olcan-marketplace/`.
- `mercur/` não deve receber customizações de produto da Olcan; ele serve como espelho de referência.

## Regra de experiência

- Site: vitrine pública e aquisição.
- App v2.5: operação do usuário, descoberta contextual e compra sem ruptura perceptível.
- Backend comercial: motor invisível para catálogo e pedidos.
