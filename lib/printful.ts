const PRINTFUL_API = "https://api.printful.com";

function getToken(): string {
  const token = process.env.PRINTFUL_API_KEY;
  if (!token) throw new Error("PRINTFUL_API_KEY is not set");
  return token;
}

async function pf<T>(path: string): Promise<T> {
  const res = await fetch(`${PRINTFUL_API}${path}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    throw new Error(`Printful API error: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  return json.result;
}

export interface PrintfulProduct {
  id: number;
  external_id: string;
  name: string;
  variants: number;
  synced: number;
  thumbnail_url: string;
  is_ignored: boolean;
}

export interface PrintfulVariantFile {
  id: number;
  type: string;
  hash: string;
  filename: string;
  mime_type: string;
  size: number;
  width: number;
  height: number;
  thumbnail_url: string;
  preview_url: string;
  visible: boolean;
}

export interface PrintfulVariant {
  id: number;
  external_id: string;
  sync_product_id: number;
  name: string;
  synced: boolean;
  variant_id: number;
  retail_price: string;
  sku: string;
  currency: string;
  product: {
    variant_id: number;
    product_id: number;
    image: string;
    name: string;
  };
  files: PrintfulVariantFile[];
  size: string;
  color: string;
  availability_status: string;
}

export interface PrintfulProductDetail {
  sync_product: PrintfulProduct;
  sync_variants: PrintfulVariant[];
}

export async function getProducts(): Promise<PrintfulProduct[]> {
  return pf<PrintfulProduct[]>("/store/products");
}

export async function getProduct(id: number): Promise<PrintfulProductDetail> {
  return pf<PrintfulProductDetail>(`/store/products/${id}`);
}

export function getPreviewImage(variant: PrintfulVariant): string {
  const preview = variant.files.find((f) => f.type === "preview" && f.visible === false);
  if (preview) return preview.preview_url;
  const defaultFile = variant.files.find((f) => f.type === "default");
  if (defaultFile) return defaultFile.preview_url;
  return variant.product.image;
}

export interface PrintfulRecipient {
  name: string;
  address1: string;
  address2?: string;
  city: string;
  state_code?: string;
  country_code: string;
  zip: string;
  phone?: string;
  email?: string;
}

export interface PrintfulOrderItem {
  sync_variant_id: number;
  quantity: number;
}

export interface PrintfulOrder {
  id: number;
  external_id: string;
  status: string;
  shipping: string;
  created: number;
  recipient: PrintfulRecipient;
  items: { id: number; quantity: number; name: string; retail_price: string }[];
  retail_costs: { subtotal: string; shipping: string; tax: string; total: string };
}

export async function createOrder(
  recipient: PrintfulRecipient,
  items: PrintfulOrderItem[]
): Promise<PrintfulOrder> {
  const res = await fetch(`${PRINTFUL_API}/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ recipient, items }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error("Printful create order error:", res.status, errorBody);
    throw new Error(`Printful order error: ${res.status}`);
  }

  const json = await res.json();
  return json.result;
}

export async function estimateOrderCosts(
  recipient: PrintfulRecipient,
  items: PrintfulOrderItem[]
): Promise<{ subtotal: string; shipping: string; tax: string; total: string }> {
  const res = await fetch(`${PRINTFUL_API}/orders/estimate-costs`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ recipient, items }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error("Printful estimate error:", res.status, errorBody);
    throw new Error(`Printful estimate error: ${res.status}`);
  }

  const json = await res.json();
  return json.result.costs;
}

const CURRENCY_LOCALES: Record<string, string> = {
  PLN: "pl-PL",
  EUR: "de-DE",
  USD: "en-US",
  GBP: "en-GB",
  CHF: "de-CH",
};

export function formatPrice(price: string, currency: string): string {
  const locale = CURRENCY_LOCALES[currency] || "pl-PL";
  const num = parseFloat(price);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(num);
}
