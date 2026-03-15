import { NextRequest, NextResponse } from "next/server";
import { getMemberFromRequest } from "@/lib/member-auth";
import { getProducts, getProduct, getPreviewImage } from "@/lib/printful";

export async function GET(request: NextRequest) {
  const member = await getMemberFromRequest(request);
  if (!member) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const products = await getProducts();

    const enriched = await Promise.all(
      products.map(async (p) => {
        try {
          const detail = await getProduct(p.id);
          const variants = detail.sync_variants;
          const firstVariant = variants[0];

          const mockupImage = firstVariant
            ? getPreviewImage(firstVariant)
            : p.thumbnail_url;

          const prices = variants.map((v) => parseFloat(v.retail_price));
          const minPrice = Math.min(...prices);
          const currency = firstVariant?.currency || "PLN";

          return {
            ...p,
            preview_image: mockupImage,
            price_from: minPrice.toFixed(2),
            currency,
          };
        } catch {
          return {
            ...p,
            preview_image: p.thumbnail_url,
            price_from: null,
            currency: "PLN",
          };
        }
      })
    );

    return NextResponse.json({ products: enriched });
  } catch (err) {
    console.error("Printful products error:", err);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}
