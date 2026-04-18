import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ExecArgs } from "@medusajs/framework/types";
import { Modules, ProductStatus } from "@medusajs/framework/utils";
import {
  createProductCategoriesWorkflow,
  createProductsWorkflow,
} from "@medusajs/medusa/core-flows";

type CatalogProduct = {
  id: string;
  handle: string;
  title: string;
  short_description?: string | null;
  description: string;
  product_type: string;
  category: string;
  area?: string | null;
  format?: string | null;
  language?: string | null;
  version?: string | null;
  phase?: string | null;
  status?: string | null;
  revenue_model?: string | null;
  platform_sale?: string | null;
  price_brl?: number | null;
  compare_at_price_brl?: number | null;
  checkout_mode?: string | null;
  checkout_url?: string | null;
  catalog_visibility?: string | null;
  cta_label?: string | null;
  tags?: string[];
  features?: string[];
  specifications?: string[];
  modules?: string[];
  audience?: string[];
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CATALOG_PATH = path.resolve(
  __dirname,
  "../../../../../data/commerce/olcan-products.json"
);

async function loadCatalog(): Promise<CatalogProduct[]> {
  const raw = await fs.readFile(CATALOG_PATH, "utf-8");
  return JSON.parse(raw) as CatalogProduct[];
}

function buildProductPayload(
  item: CatalogProduct,
  categoryId: string,
  salesChannelId: string,
  shippingProfileId?: string
) {
  const payload: Record<string, unknown> = {
    title: item.title,
    handle: item.handle,
    description: item.description,
    category_ids: [categoryId],
    status: ProductStatus.PUBLISHED,
    sales_channels: [{ id: salesChannelId }],
    images: [],
    variants: [
      {
        title: "Padrão",
        sku: `OLCAN-${item.handle.toUpperCase().replace(/-/g, "_")}`,
        prices:
          item.price_brl != null
            ? [
                {
                  amount: Math.round(item.price_brl * 100),
                  currency_code: "brl",
                },
              ]
            : [],
      },
    ],
    metadata: {
      olcan_product_id: item.id,
      short_description: item.short_description ?? null,
      product_type: item.product_type,
      area: item.area ?? null,
      format: item.format ?? null,
      language: item.language ?? null,
      version: item.version ?? null,
      phase: item.phase ?? null,
      status_label: item.status ?? null,
      revenue_model: item.revenue_model ?? null,
      platform_sale: item.platform_sale ?? null,
      checkout_mode: item.checkout_mode ?? null,
      checkout_url: item.checkout_url ?? null,
      catalog_visibility: item.catalog_visibility ?? "public",
      cta_label: item.cta_label ?? null,
      tags: item.tags ?? [],
      features: item.features ?? [],
      specifications: item.specifications ?? [],
      modules: item.modules ?? [],
      audience: item.audience ?? [],
    },
  };

  if (shippingProfileId) {
    payload.shipping_profile_id = shippingProfileId;
  }

  return payload;
}

export default async function syncOlcanProducts({ container }: ExecArgs) {
  const logger = container.resolve("logger");
  const productModuleService = container.resolve(Modules.PRODUCT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);

  const catalog = await loadCatalog();

  logger.info(`Syncing ${catalog.length} canonical Olcan products...`);

  const categories = Array.from(new Set(catalog.map((item) => item.category)));
  const existingCategories = await productModuleService.listProductCategories({
    name: categories,
  });
  const existingByName = new Map(existingCategories.map((item: any) => [item.name, item]));

  const missingCategoryNames = categories.filter((name) => !existingByName.has(name));
  if (missingCategoryNames.length > 0) {
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: missingCategoryNames.map((name) => ({
          name,
          is_active: true,
        })),
      },
    });

    for (const category of result) {
      existingByName.set((category as any).name, category);
    }
  }

  const [defaultSalesChannel] = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });

  if (!defaultSalesChannel) {
    throw new Error("Default Sales Channel not found. Run the base Medusa seed first.");
  }

  const [shippingProfile] = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });

  const existingProducts = await productModuleService.listProducts({
    handle: catalog.map((item) => item.handle),
  });
  const existingHandles = new Set(existingProducts.map((item: any) => item.handle));

  const missingProducts = catalog.filter((item) => !existingHandles.has(item.handle));
  if (missingProducts.length === 0) {
    logger.info("Canonical Olcan products already exist. Nothing to create.");
    return;
  }

  await createProductsWorkflow(container).run({
    input: {
      products: missingProducts.map((item) =>
        buildProductPayload(
          item,
          existingByName.get(item.category)!.id,
          defaultSalesChannel.id,
          shippingProfile?.id
        )
      ),
    },
  });

  logger.info(
    `Created ${missingProducts.length} canonical Olcan products in the marketplace engine.`
  );
}
