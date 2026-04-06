-- Create Olcan Products

-- 1. Curso Cidadão do Mundo
INSERT INTO product (id, title, handle, description, status, created_at, updated_at)
VALUES (
  'prod_curso_cidadao',
  'Curso Cidadão do Mundo',
  'curso-cidadao-mundo',
  'Mapeamento estratégico e preparatório mental para a vida transnacional sem fronteiras',
  'published',
  NOW(),
  NOW()
);

INSERT INTO product_variant (id, title, sku, product_id, created_at, updated_at)
VALUES (
  'variant_curso_cidadao',
  'Default',
  'CURSO-001',
  'prod_curso_cidadao',
  NOW(),
  NOW()
);

-- 2. Kit Application
INSERT INTO product (id, title, handle, description, status, created_at, updated_at)
VALUES (
  'prod_kit_app',
  'Kit Application',
  'kit-application',
  'Templates e documentos essenciais para sua candidatura internacional',
  'published',
  NOW(),
  NOW()
);

INSERT INTO product_variant (id, title, sku, product_id, created_at, updated_at)
VALUES (
  'variant_kit_app',
  'Default',
  'KIT-001',
  'prod_kit_app',
  NOW(),
  NOW()
);

-- 3. Rota de Internacionalização
INSERT INTO product (id, title, handle, description, status, created_at, updated_at)
VALUES (
  'prod_rota_inter',
  'Rota de Internacionalização',
  'rota-internacionalizacao',
  'Mentoria individualizada de 12 semanas para sua jornada internacional',
  'published',
  NOW(),
  NOW()
);

INSERT INTO product_variant (id, title, sku, product_id, created_at, updated_at)
VALUES (
  'variant_rota_inter',
  'Default',
  'ROTA-001',
  'prod_rota_inter',
  NOW(),
  NOW()
);
