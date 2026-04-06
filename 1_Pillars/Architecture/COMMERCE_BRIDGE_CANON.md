# Commerce Bridge Canon

## Decisão

O Medusa/Mercur é o motor comercial do ecossistema, mas não deve aparecer como superfície principal de autenticação ou navegação para o usuário do Compass.

O contrato canônico passa a ser:

1. `api-core-v2.5` expõe `/api/commerce/public/*`
2. `site-marketing-v2.5` consome esse contrato para páginas públicas de produto
3. `app-compass-v2.5` consome o mesmo contrato para catálogo autenticado
4. O modo de compra de cada oferta é explícito:
   - `external`: checkout oficial externo temporário
   - `catalog_only`: catálogo disponível, compra ainda não habilitada
   - `internal`: reservado para futura compra nativa

## Motivo

- Evitar que site e app implementem clientes diferentes para o mesmo catálogo
- Tirar o acoplamento direto entre UX Olcan e detalhes do Medusa
- Permitir trocar o fluxo de pagamento depois sem quebrar rotas, cards e páginas de produto
- Impedir a proliferação de placeholders contraditórios

## Estado Atual

- O catálogo público já pode ser resolvido pelo `commerce bridge`
- As três ofertas flagship carregam metadados Olcan e fallback de checkout oficial
- O app deixou de depender conceitualmente de `iframe` como falsa integração
- O backend já expõe a primeira camada protegida `commerce/me/*` para contexto autenticado e geração de `checkout intent`
- O app v2.5 passou a usar o mesmo contrato público do site para catálogo, em vez de misturar bridge nova com endpoints antigos de marketplace

## Próxima Iteração

1. Persistir intents, carrinho e pedidos Olcan no backend canônico
2. Sincronizar identidade comercial do usuário Olcan com customer/profile do motor Medusa, sem expor login separado
3. Fazer o site ler o mesmo estado de sessão para CTAs de compra contextual quando o usuário já estiver autenticado
4. Trocar os links externos por checkout interno quando pagamentos estiverem prontos
