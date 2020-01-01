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

export function formatPrice(price: string, currency: string): string {
  const num = parseFloat(price);
  return new Intl.NumberFormat("en-CH", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(num);
}
