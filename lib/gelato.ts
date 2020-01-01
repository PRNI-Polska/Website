const GELATO_ECOMMERCE = "https://ecommerce.gelatoapis.com";
const GELATO_ORDERS = "https://order.gelatoapis.com";
const GELATO_CATALOG = "https://product.gelatoapis.com";

function getApiKey(): string {
  const key = process.env.GELATO_API_KEY;
  if (!key) throw new Error("GELATO_API_KEY is not set");
  return key;
}

export type GelatoStore = "pl" | "int";

function getStoreId(store?: GelatoStore): string {
  if (store === "int") {
    const id = process.env.GELATO_STORE_ID_INT;
    if (id) return id;
  }
  if (store === "pl") {
    const id = process.env.GELATO_STORE_ID_PL;
    if (id) return id;
  }
  const id = process.env.GELATO_STORE_ID_PL || process.env.GELATO_STORE_ID;
  if (!id) throw new Error("GELATO_STORE_ID_PL (or GELATO_STORE_ID) is not set");
  return id;
}

function headers(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "X-API-KEY": getApiKey(),
  };
}

// ── Ecommerce Store API (product listing) ──

export interface GelatoVariant {
  id: string;
  productId: string;
  title: string;
  externalId: string;
  connectionStatus: string;
  productUid: string;
  previewUrl?: string;
  [key: string]: unknown;
}

export interface GelatoVariantOption {
  name: string;
  values: string[];
}

export interface GelatoProduct {
  id: string;
  storeId: string;
  title: string;
  description: string;
  previewUrl: string;
  externalPreviewUrl: string;
  externalThumbnailUrl: string;
  status: string;
  variants: GelatoVariant[];
  productVariantOptions: GelatoVariantOption[];
  createdAt: string;
  updatedAt: string;
  productPreviews?: { url: string; [key: string]: unknown }[];
  images?: { src: string; [key: string]: unknown }[];
  mockups?: { url: string; [key: string]: unknown }[];
  [key: string]: unknown;
}

/**
 * Extracts all unique image URLs from a Gelato product response,
 * checking documented and undocumented fields.
 */
export function extractAllProductImages(product: GelatoProduct): string[] {
  const urls = new Set<string>();

  if (product.previewUrl) urls.add(product.previewUrl);
  if (product.externalPreviewUrl) urls.add(product.externalPreviewUrl);
  if (product.externalThumbnailUrl) urls.add(product.externalThumbnailUrl);

  if (Array.isArray(product.productPreviews)) {
    for (const p of product.productPreviews) {
      if (typeof p === "string") urls.add(p);
      else if (p?.url) urls.add(p.url);
    }
  }

  if (Array.isArray(product.images)) {
    for (const img of product.images) {
      if (typeof img === "string") urls.add(img);
      else if (img?.src) urls.add(img.src);
      else if ((img as Record<string, unknown>)?.url) urls.add((img as Record<string, unknown>).url as string);
    }
  }

  if (Array.isArray(product.mockups)) {
    for (const m of product.mockups) {
      if (typeof m === "string") urls.add(m);
      else if (m?.url) urls.add(m.url);
    }
  }

  for (const v of product.variants) {
    if (v.previewUrl && typeof v.previewUrl === "string") urls.add(v.previewUrl);
  }

  for (const [key, value] of Object.entries(product)) {
    if (
      typeof value === "string" &&
      value.startsWith("http") &&
      /\.(png|jpg|jpeg|webp|gif)/i.test(value) &&
      !urls.has(value)
    ) {
      urls.add(value);
    }
    if (Array.isArray(value) && key !== "variants" && key !== "productVariantOptions") {
      for (const item of value) {
        if (typeof item === "string" && item.startsWith("http") && /\.(png|jpg|jpeg|webp)/i.test(item)) {
          urls.add(item);
        }
        if (item && typeof item === "object") {
          for (const v of Object.values(item as Record<string, unknown>)) {
            if (typeof v === "string" && v.startsWith("http") && /\.(png|jpg|jpeg|webp)/i.test(v)) {
              urls.add(v);
            }
          }
        }
      }
    }
  }

  return Array.from(urls).filter(Boolean);
}

export async function getStoreProducts(store?: GelatoStore): Promise<GelatoProduct[]> {
  const res = await fetch(
    `${GELATO_ECOMMERCE}/v1/stores/${getStoreId(store)}/products`,
    { headers: headers(), next: { revalidate: 300 } }
  );
  if (!res.ok) {
    throw new Error(`Gelato products error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : data.products || [];
}

export async function getStoreProduct(productId: string, store?: GelatoStore): Promise<GelatoProduct> {
  const res = await fetch(
    `${GELATO_ECOMMERCE}/v1/stores/${getStoreId(store)}/products/${productId}`,
    { headers: headers(), next: { revalidate: 300 } }
  );
  if (!res.ok) {
    throw new Error(`Gelato product error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// ── Orders API ──

export interface GelatoShippingAddress {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postCode: string;
  country: string;
  email: string;
  phone?: string;
}

export interface GelatoOrderItem {
  itemReferenceId: string;
  productUid: string;
  files: { type: string; url: string }[];
  quantity: number;
}

export interface GelatoOrderResponse {
  id: string;
  orderReferenceId: string;
  fulfillmentStatus: string;
}

export async function createOrder(
  orderReferenceId: string,
  customerReferenceId: string,
  shippingAddress: GelatoShippingAddress,
  items: GelatoOrderItem[],
  currency: string = "PLN"
): Promise<GelatoOrderResponse> {
  const res = await fetch(`${GELATO_ORDERS}/v4/orders`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      orderType: "order",
      orderReferenceId,
      customerReferenceId,
      currency,
      items,
      shipmentMethodUid: "normal",
      shippingAddress,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error("Gelato create order error:", res.status, errorBody);
    throw new Error(`Gelato order error: ${res.status}`);
  }

  return res.json();
}

// ── Catalog Pricing API ──

export interface GelatoCatalogPrice {
  country: string;
  currency: string;
  productUid: string;
  quantity: number;
  price: number;
}

const priceCache = new Map<string, { price: number; ts: number }>();
const PRICE_TTL = 1000 * 60 * 60; // 1 hour

export async function getCatalogPrice(
  productUid: string,
  currency: string = "EUR",
  country: string = "PL"
): Promise<number | null> {
  const cacheKey = `${productUid}:${currency}:${country}`;
  const cached = priceCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < PRICE_TTL) return cached.price;

  try {
    const res = await fetch(
      `${GELATO_CATALOG}/v3/products/${productUid}/prices?currency=${currency}&country=${country}`,
      { headers: headers() }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const items = data.value || data;
    const price = Array.isArray(items) && items.length > 0 ? items[0].price : null;
    if (price != null) {
      priceCache.set(cacheKey, { price, ts: Date.now() });
    }
    return price;
  } catch {
    return null;
  }
}

export async function getCatalogPricesBatch(
  productUids: string[],
  currency: string = "EUR",
  country: string = "PL"
): Promise<Map<string, number>> {
  const results = new Map<string, number>();
  const toFetch: string[] = [];

  for (const uid of productUids) {
    const cacheKey = `${uid}:${currency}:${country}`;
    const cached = priceCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < PRICE_TTL) {
      results.set(uid, cached.price);
    } else {
      toFetch.push(uid);
    }
  }

  if (toFetch.length > 0) {
    const fetched = await Promise.all(
      toFetch.map((uid) => getCatalogPrice(uid, currency, country))
    );
    toFetch.forEach((uid, i) => {
      if (fetched[i] != null) results.set(uid, fetched[i]!);
    });
  }

  return results;
}

export interface GelatoQuoteRecipient {
  country: string;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postCode: string;
  state?: string;
  email: string;
  phone?: string;
}

export interface GelatoQuoteProduct {
  itemReferenceId: string;
  productUid: string;
  quantity: number;
  files?: { type: string; url: string }[];
}

export interface GelatoShipmentMethod {
  name: string;
  shipmentMethodUid: string;
  price: number;
  currency: string;
  minDeliveryDays: number;
  maxDeliveryDays: number;
  type: string;
}

export interface GelatoQuoteResponse {
  orderReferenceId: string;
  quotes: {
    id: string;
    fulfillmentCountry: string;
    shipmentMethods: GelatoShipmentMethod[];
    products: { itemReferenceId: string; productUid: string; quantity: number; price: number; currency: string }[];
  }[];
}

export async function getOrderQuote(
  recipient: GelatoQuoteRecipient,
  products: GelatoQuoteProduct[],
  currency: string = "EUR"
): Promise<GelatoQuoteResponse> {
  const res = await fetch(`${GELATO_ORDERS}/v4/orders:quote`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      orderReferenceId: `quote-${Date.now()}`,
      customerReferenceId: "quote",
      currency,
      recipient,
      products,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error("Gelato quote error:", res.status, errorBody);
    throw new Error(`Gelato quote error: ${res.status}`);
  }

  return res.json();
}
