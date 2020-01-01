import { NextResponse } from "next/server";
import { getStoreProducts } from "@/lib/gelato";
import { getLowestRetailPrice } from "@/lib/gelato-prices";

export async function GET() {
  try {
    const products = await getStoreProducts();

    const enriched = await Promise.all(
      products.map(async (p) => {
        const productUids = p.variants.map((v) => v.productUid);
        const lowest = await getLowestRetailPrice(productUids);

        return {
          id: p.id,
          name: p.title,
          description: p.description,
          preview_image: p.previewUrl || p.externalPreviewUrl || p.externalThumbnailUrl,
          variants: p.variants.length,
          price_from: lowest?.price || null,
          currency: lowest?.currency || "EUR",
        };
      })
    );

    return NextResponse.json({ products: enriched });
  } catch (err) {
    console.error("Gelato products error:", err);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}
