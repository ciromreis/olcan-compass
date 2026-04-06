const STOREFRONT_URL =
  process.env.NEXT_PUBLIC_STOREFRONT_URL || "http://localhost:3001";

function normalizeBaseUrl(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function getStorefrontBaseUrl() {
  return normalizeBaseUrl(STOREFRONT_URL);
}

export function getStorefrontCatalogUrl() {
  return `${getStorefrontBaseUrl()}/marketplace`;
}

export function getStorefrontProductUrl(handle: string) {
  return `${getStorefrontBaseUrl()}/marketplace/${handle}`;
}
