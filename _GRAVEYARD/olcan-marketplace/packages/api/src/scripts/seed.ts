import {
  CreateInventoryLevelInput,
  ExecArgs,
  IAuthModuleService,
} from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresStep,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import { ApiKey } from "../../.medusa/types/query-entry-points";
import { MercurModules } from "@mercurjs/types";

const updateStoreCurrencies = createWorkflow(
  "update-store-currencies",
  (input: {
    supported_currencies: { currency_code: string; is_default?: boolean }[];
    store_id: string;
  }) => {
    const normalizedInput = transform({ input }, (data) => {
      return {
        selector: { id: data.input.store_id },
        update: {
          supported_currencies: data.input.supported_currencies.map(
            (currency) => {
              return {
                currency_code: currency.currency_code,
                is_default: currency.is_default ?? false,
              };
            }
          ),
        },
      };
    });

    const stores = updateStoresStep(normalizedInput);

    return new WorkflowResponse(stores);
  }
);

export default async function seedDemoData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService = container.resolve(Modules.STORE);

  // Brazil is the primary market; keep Europe for future expansion
  const brazilCountries = ["br"];
  const europeCountries = ["gb", "de", "dk", "se", "fr", "es", "it"];
  const allCountries = [...brazilCountries, ...europeCountries];

  logger.info("Seeding store data...");
  const [store] = await storeModuleService.listStores();
  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });

  if (!defaultSalesChannel.length) {
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(
      container
    ).run({
      input: {
        salesChannelsData: [
          {
            name: "Default Sales Channel",
          },
        ],
      },
    });
    defaultSalesChannel = salesChannelResult;
  }

  await updateStoreCurrencies(container).run({
    input: {
      store_id: store.id,
      supported_currencies: [
        {
          currency_code: "brl",
          is_default: true,
        },
        {
          currency_code: "eur",
        },
        {
          currency_code: "usd",
        },
      ],
    },
  });

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_sales_channel_id: defaultSalesChannel[0].id,
      },
    },
  });

  // --- Regions ---
  logger.info("Seeding region data...");
  const regionModuleService = container.resolve(Modules.REGION);

  const existingRegions = await regionModuleService.listRegions({}, {
    relations: ["countries"],
  });

  const assignedCountries = new Set<string>();
  for (const r of existingRegions) {
    for (const c of r.countries || []) {
      assignedCountries.add(c.iso_2);
    }
  }

  // Create Brazil region if br is not assigned
  let brazilRegion;
  if (!assignedCountries.has("br")) {
    const { result: brResult } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "Brazil",
            currency_code: "brl",
            countries: ["br"],
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    });
    brazilRegion = brResult[0];
  } else {
    brazilRegion = existingRegions.find(r =>
      r.countries?.some(c => c.iso_2 === "br")
    );
    logger.info("Brazil region already exists, skipping.");
  }

  // Create Europe region for unassigned European countries
  const unassignedEurope = europeCountries.filter(c => !assignedCountries.has(c));
  let europeRegion;

  if (unassignedEurope.length > 0) {
    const { result: euResult } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "Europe",
            currency_code: "eur",
            countries: unassignedEurope,
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    });
    europeRegion = euResult[0];
  } else {
    europeRegion = existingRegions.find(r =>
      r.countries?.some(c => europeCountries.includes(c.iso_2))
    ) || existingRegions[0];
    logger.info("Europe countries already assigned, skipping.");
  }
  logger.info("Finished seeding regions.");

  // --- Tax regions ---
  logger.info("Seeding tax regions...");
  const taxModuleService = container.resolve(Modules.TAX);
  const existingTaxRegions = await taxModuleService.listTaxRegions();
  const existingCountryCodes = new Set(existingTaxRegions.map((tr) => tr.country_code));
  const countriesToCreate = allCountries.filter((c) => !existingCountryCodes.has(c));

  if (countriesToCreate.length > 0) {
    await createTaxRegionsWorkflow(container).run({
      input: countriesToCreate.map((country_code) => ({
        country_code,
        provider_id: "tp_system",
      })),
    });
  } else {
    logger.info("Tax regions already exist, skipping.");
  }
  logger.info("Finished seeding tax regions.");

  // --- Stock location ---
  logger.info("Seeding stock location data...");
  const stockLocationModule = container.resolve(Modules.STOCK_LOCATION);
  const existingStockLocations = await stockLocationModule.listStockLocations({
    name: "Olcan Digital Warehouse",
  });

  let stockLocation;
  if (existingStockLocations.length) {
    stockLocation = existingStockLocations[0];
    logger.info("Stock location already exists, skipping.");
  } else {
    const { result: stockLocationResult } = await createStockLocationsWorkflow(
      container
    ).run({
      input: {
        locations: [
          {
            name: "Olcan Digital Warehouse",
            address: {
              city: "São Paulo",
              country_code: "BR",
              address_1: "",
            },
          },
        ],
      },
    });
    stockLocation = stockLocationResult[0];
  }

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_location_id: stockLocation.id,
      },
    },
  });

  try {
    await link.create({
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stockLocation.id,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_provider_id: "manual_manual",
      },
    });
  } catch (error: unknown) {
    if (!(error instanceof Error && error.message.includes("already exists"))) {
      throw error;
    }
    logger.info("Stock location already linked to fulfillment provider, skipping.");
  }

  // --- Fulfillment ---
  logger.info("Seeding fulfillment data...");
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });
  let shippingProfile = shippingProfiles.length ? shippingProfiles[0] : null;

  if (!shippingProfile) {
    const { result: shippingProfileResult } =
      await createShippingProfilesWorkflow(container).run({
        input: {
          data: [
            {
              name: "Default Shipping Profile",
              type: "default",
            },
          ],
        },
      });
    shippingProfile = shippingProfileResult[0];
  }

  const existingFulfillmentSets = await fulfillmentModuleService.listFulfillmentSets({
    name: "Digital Delivery",
  });

  let fulfillmentSet;
  if (existingFulfillmentSets.length) {
    fulfillmentSet = existingFulfillmentSets[0];
    logger.info("Fulfillment set already exists, skipping.");
  } else {
    fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
      name: "Digital Delivery",
      type: "shipping",
      service_zones: [
        {
          name: "Brazil",
          geo_zones: [
            {
              country_code: "br",
              type: "country",
            },
          ],
        },
        {
          name: "Europe",
          geo_zones: europeCountries.map((cc) => ({
            country_code: cc,
            type: "country" as const,
          })),
        },
      ],
    });

    try {
      await link.create({
        [Modules.STOCK_LOCATION]: {
          stock_location_id: stockLocation.id,
        },
        [Modules.FULFILLMENT]: {
          fulfillment_set_id: fulfillmentSet.id,
        },
      });
    } catch (error: unknown) {
      if (!(error instanceof Error && error.message.includes("already exists"))) {
        throw error;
      }
    }

    const shippingPrices = [
      { currency_code: "brl", amount: 0 },
      { currency_code: "eur", amount: 0 },
      { currency_code: "usd", amount: 0 },
    ];

    // Free digital delivery for all zones
    for (const zone of fulfillmentSet.service_zones) {
      await createShippingOptionsWorkflow(container).run({
        input: [
          {
            name: "Digital Delivery — Instant Access",
            price_type: "flat",
            provider_id: "manual_manual",
            service_zone_id: zone.id,
            shipping_profile_id: shippingProfile.id,
            type: {
              label: "Digital",
              description: "Instant access after purchase.",
              code: "digital",
            },
            prices: shippingPrices,
            rules: [
              {
                attribute: "enabled_in_store",
                value: "true",
                operator: "eq",
              },
              {
                attribute: "is_return",
                value: "false",
                operator: "eq",
              },
            ],
          },
        ],
      });
    }
  }
  logger.info("Finished seeding fulfillment data.");

  // Link sales channel to stock location
  try {
    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: {
        id: stockLocation.id,
        add: [defaultSalesChannel[0].id],
      },
    });
  } catch (error: unknown) {
    if (!(error instanceof Error && error.message.includes("already"))) {
      throw error;
    }
    logger.info("Sales channel already linked to stock location, skipping.");
  }
  logger.info("Finished seeding stock location data.");

  // --- API Key ---
  logger.info("Seeding publishable API key data...");
  let publishableApiKey: ApiKey | null = null;
  const { data } = await query.graph({
    entity: "api_key",
    fields: ["id"],
    filters: {
      type: "publishable",
    },
  });

  publishableApiKey = data?.[0];

  if (!publishableApiKey) {
    const {
      result: [publishableApiKeyResult],
    } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          {
            title: "Olcan Storefront",
            type: "publishable",
            created_by: "",
          },
        ],
      },
    });

    publishableApiKey = publishableApiKeyResult as ApiKey;
  }

  try {
    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: {
        id: publishableApiKey.id,
        add: [defaultSalesChannel[0].id],
      },
    });
  } catch (error: unknown) {
    if (!(error instanceof Error && error.message.includes("already"))) {
      throw error;
    }
    logger.info("Sales channel already linked to API key, skipping.");
  }
  logger.info("Finished seeding publishable API key data.");

  // --- Product categories ---
  logger.info("Seeding product data...");

  const productCategoryModule = container.resolve(Modules.PRODUCT);
  const categoryNames = [
    "Ferramentas & Modelos",
    "Educação & Formação",
    "Serviços de Coaching & Consultoria",
    "Plataforma SaaS",
  ];
  const existingCategories = await productCategoryModule.listProductCategories({
    name: categoryNames,
  });

  let categoryResult;
  if (existingCategories.length === categoryNames.length) {
    categoryResult = existingCategories;
    logger.info("Product categories already exist, skipping.");
  } else {
    const categoriesToCreate = categoryNames.filter(
      (name) => !existingCategories.find((c) => c.name === name)
    );
    const { result: newCategories } = await createProductCategoriesWorkflow(
      container
    ).run({
      input: {
        product_categories: categoriesToCreate.map((name) => ({
          name,
          is_active: true,
        })),
      },
    });
    categoryResult = [...existingCategories, ...newCategories];
  }

  // --- Olcan products ---
  const olcanProductHandles = [
    "rota-internacionalizacao",
    "kit-application",
    "sem-fronteiras",
    "mentorias-olcan",
    "compass-by-olcan",
  ];

  const existingProducts = await productCategoryModule.listProducts({
    handle: olcanProductHandles,
  });

  if (existingProducts.length === olcanProductHandles.length) {
    logger.info("Olcan products already exist, skipping.");
  } else {
    const findCategory = (name: string) =>
      categoryResult.find((cat: { name: string }) => cat.name === name)!.id;

    await createProductsWorkflow(container).run({
      input: {
        products: [
          {
            title: "Rota da Internacionalização",
            category_ids: [findCategory("Ferramentas & Modelos")],
            description:
              "Board interativo no Miro para organizar sua jornada de internacionalização. Reúne planejamento financeiro, documentação, oportunidades, tarefas e referências num só sistema visual.",
            handle: "rota-internacionalizacao",
            weight: 0,
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: shippingProfile.id,
            images: [],
            options: [
              {
                title: "Formato",
                values: ["Board Miro"],
              },
            ],
            variants: [
              {
                title: "Acesso ao Board",
                sku: "OLCAN-ROTA-MIRO",
                options: { Formato: "Board Miro" },
                prices: [
                  { amount: 3500, currency_code: "brl" },
                ],
              },
            ],
            metadata: {
              checkout_mode: "external",
              checkout_url: "https://pay.hotmart.com/K97966494E",
              format: "Board Miro",
              language: "pt",
              olcan_official: true,
            },
            sales_channels: [{ id: defaultSalesChannel[0].id }],
          },
          {
            title: "Kit Application",
            category_ids: [findCategory("Ferramentas & Modelos")],
            description:
              "Template Notion com banco de oportunidades, pipeline de candidaturas, calendário de prazos e modelos de documentos para aplicações internacionais.",
            handle: "kit-application",
            weight: 0,
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: shippingProfile.id,
            images: [],
            options: [
              {
                title: "Formato",
                values: ["Template Notion"],
              },
            ],
            variants: [
              {
                title: "Acesso ao Template",
                sku: "OLCAN-KIT-NOTION",
                options: { Formato: "Template Notion" },
                prices: [
                  { amount: 7500, currency_code: "brl" },
                ],
              },
            ],
            metadata: {
              checkout_mode: "external",
              checkout_url: "https://pay.hotmart.com/X85073158P",
              format: "Template Notion",
              language: "pt",
              olcan_official: true,
            },
            sales_channels: [{ id: defaultSalesChannel[0].id }],
          },
          {
            title: "Sem Fronteiras",
            category_ids: [findCategory("Educação & Formação")],
            description:
              "Programa online com 9 módulos e mais de 30 aulas curtas para quem quer transformar intenção em preparação concreta. Trabalha visão estratégica, organização financeira, documentação, adaptação emocional e tomada de decisão.",
            handle: "sem-fronteiras",
            weight: 0,
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: shippingProfile.id,
            images: [],
            options: [
              {
                title: "Formato",
                values: ["Curso Online"],
              },
            ],
            variants: [
              {
                title: "Acesso ao Curso",
                sku: "OLCAN-CURSO-SF",
                options: { Formato: "Curso Online" },
                prices: [
                  { amount: 49700, currency_code: "brl" },
                ],
              },
            ],
            metadata: {
              checkout_mode: "external",
              checkout_url: "https://pay.hotmart.com/N97314230U",
              format: "Curso online",
              language: "pt",
              olcan_official: true,
              legacy_title: "Curso Cidadão do Mundo",
            },
            sales_channels: [{ id: defaultSalesChannel[0].id }],
          },
          {
            title: "Mentorias Olcan",
            category_ids: [findCategory("Serviços de Coaching & Consultoria")],
            description:
              "Mentoria estratégica em sessões online para quem quer combinar direção prática com leitura mais personalizada do próprio caminho. Complementa o Kit Application.",
            handle: "mentorias-olcan",
            weight: 0,
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: shippingProfile.id,
            images: [],
            options: [
              {
                title: "Formato",
                values: ["Sessão avulsa", "Pacote 6 sessões"],
              },
            ],
            variants: [
              {
                title: "Sessão avulsa (60 min)",
                sku: "OLCAN-MENTORIA-1",
                options: { Formato: "Sessão avulsa" },
                prices: [
                  { amount: 22500, currency_code: "brl" },
                ],
              },
              {
                title: "Pacote 6 sessões",
                sku: "OLCAN-MENTORIA-6",
                options: { Formato: "Pacote 6 sessões" },
                prices: [
                  { amount: 270000, currency_code: "brl" },
                ],
              },
            ],
            metadata: {
              checkout_mode: "catalog_only",
              format: "Sessões 1:1 online",
              language: "pt",
              olcan_official: true,
              scheduling_url: "https://zenklub.com.br/coaches/ciro-moraes/",
            },
            sales_channels: [{ id: defaultSalesChannel[0].id }],
          },
          {
            title: "Compass by Olcan",
            category_ids: [findCategory("Plataforma SaaS")],
            description:
              "Plataforma SaaS da Olcan para internacionalização profissional e acadêmica. Conecta diagnóstico, rotas, construção de documentos e preparação para entrevistas.",
            handle: "compass-by-olcan",
            weight: 0,
            status: ProductStatus.DRAFT,
            shipping_profile_id: shippingProfile.id,
            images: [],
            options: [
              {
                title: "Plano",
                values: ["Lite", "Compass", "Compass Pro"],
              },
            ],
            variants: [
              {
                title: "Compass Lite (Free)",
                sku: "OLCAN-COMPASS-FREE",
                options: { Plano: "Lite" },
                prices: [
                  { amount: 0, currency_code: "brl" },
                ],
              },
              {
                title: "Compass (Core)",
                sku: "OLCAN-COMPASS-CORE",
                options: { Plano: "Compass" },
                prices: [
                  { amount: 7900, currency_code: "brl" },
                ],
              },
              {
                title: "Compass Pro",
                sku: "OLCAN-COMPASS-PRO",
                options: { Plano: "Compass Pro" },
                prices: [
                  { amount: 14900, currency_code: "brl" },
                ],
              },
            ],
            metadata: {
              checkout_mode: "internal",
              format: "Aplicação web",
              language: "pt-en",
              olcan_official: true,
              phase: "internal_testing",
            },
            sales_channels: [{ id: defaultSalesChannel[0].id }],
          },
        ],
      },
    });
  }
  logger.info("Finished seeding product data.");

  const { data: seededProducts } = await query.graph({
    entity: "product",
    fields: ["id"],
    filters: {
      handle: olcanProductHandles,
    },
  });

  logger.info("Seeding inventory levels.");

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  const inventoryModule = container.resolve(Modules.INVENTORY);
  const existingLevels = await inventoryModule.listInventoryLevels({
    location_id: stockLocation.id,
  });
  const existingItemIds = new Set(existingLevels.map((l) => l.inventory_item_id));

  const inventoryLevels: CreateInventoryLevelInput[] = [];
  for (const inventoryItem of inventoryItems) {
    if (!existingItemIds.has(inventoryItem.id)) {
      inventoryLevels.push({
        location_id: stockLocation.id,
        stocked_quantity: 999999,
        inventory_item_id: inventoryItem.id,
      });
    }
  }

  if (inventoryLevels.length > 0) {
    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: inventoryLevels,
      },
    });
  } else {
    logger.info("Inventory levels already exist, skipping.");
  }

  logger.info("Finished seeding inventory levels data.");

  // --- Seller (Olcan Official) ---
  logger.info("Seeding seller data...");
  const sellerEmail = "vendas@olcan.com.br";
  const sellerModule = container.resolve(MercurModules.SELLER)
  const authModule: IAuthModuleService = container.resolve(Modules.AUTH);

  const existingSellers = await sellerModule.listSellers({
    email: sellerEmail,
  });

  let seller;
  if (existingSellers.length) {
    seller = existingSellers[0];
    logger.info("Seller already exists, skipping creation.");
  } else {
    seller = await sellerModule.createSellers({
      name: "Olcan",
      email: sellerEmail,
    });

    const authResult = await authModule.register("emailpass", {
      body: { email: sellerEmail, password: "supersecret" },
    });

    if (!authResult.success || !authResult.authIdentity) {
      throw new Error(
        `Failed to register seller auth identity: ${authResult.error}`
      );
    }

    await authModule.updateAuthIdentities({
      id: authResult.authIdentity.id,
      app_metadata: {
        seller_id: seller.id,
      },
    });

    logger.info(`Seller created: ${sellerEmail}`);
  }

  // Link entities to seller
  logger.info("Linking products to seller...");
  for (const product of seededProducts) {
    try {
      await link.create({
        [Modules.PRODUCT]: {
          product_id: product.id,
        },
        [MercurModules.SELLER]: {
          seller_id: seller.id,
        },
      });
    } catch (error: unknown) {
      if (!(error instanceof Error && error.message.includes("already exists"))) {
        throw error;
      }
    }
  }

  logger.info("Linking stock location to seller...");
  try {
    await link.create({
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stockLocation.id,
      },
      [MercurModules.SELLER]: {
        seller_id: seller.id,
      },
    });
  } catch (error: unknown) {
    if (!(error instanceof Error && error.message.includes("already exists"))) {
      throw error;
    }
  }

  logger.info("Linking fulfillment set to seller...");
  try {
    await link.create({
      [MercurModules.SELLER]: {
        seller_id: seller.id,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_set_id: fulfillmentSet.id,
      },
    });
  } catch (error: unknown) {
    if (!(error instanceof Error && error.message.includes("already exists"))) {
      throw error;
    }
  }

  logger.info("Linking service zones to seller...");
  const fulfillmentSetWithZones = await fulfillmentModuleService.retrieveFulfillmentSet(
    fulfillmentSet.id,
    { relations: ["service_zones"] }
  );
  for (const zone of fulfillmentSetWithZones.service_zones) {
    try {
      await link.create({
        [MercurModules.SELLER]: {
          seller_id: seller.id,
        },
        [Modules.FULFILLMENT]: {
          service_zone_id: zone.id,
        },
      });
    } catch (error: unknown) {
      if (!(error instanceof Error && error.message.includes("already exists"))) {
        throw error;
      }
    }
  }

  logger.info("Linking shipping profile to seller...");
  try {
    await link.create({
      [Modules.FULFILLMENT]: {
        shipping_profile_id: shippingProfile.id,
      },
      [MercurModules.SELLER]: {
        seller_id: seller.id,
      },
    });
  } catch (error: unknown) {
    if (!(error instanceof Error && error.message.includes("already exists"))) {
      throw error;
    }
  }

  logger.info("Linking shipping options to seller...");
  const shippingOptions = await fulfillmentModuleService.listShippingOptions({
    service_zone: { id: fulfillmentSetWithZones.service_zones.map((z) => z.id) },
  });
  for (const option of shippingOptions) {
    try {
      await link.create({
        [Modules.FULFILLMENT]: {
          shipping_option_id: option.id,
        },
        [MercurModules.SELLER]: {
          seller_id: seller.id,
        },
      });
    } catch (error: unknown) {
      if (!(error instanceof Error && error.message.includes("already exists"))) {
        throw error;
      }
    }
  }

  logger.info("Finished seeding seller data.");
}
