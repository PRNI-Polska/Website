import { NextRequest, NextResponse } from "next/server";
import { getMemberFromRequest } from "@/lib/member-auth";
import { getStoreProducts, type GelatoStore } from "@/lib/gelato";
import { getLowestRetailPrice } from "@/lib/gelato-prices";

export async function GET(request: NextRequest) {
  const member = await getMemberFromRequest(request);
  if (!member) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const storeParam = request.nextUrl.searchParams.get("store") as GelatoStore | null;
    const store: GelatoStore = storeParam === "int" ? "int" : "pl";
    const products = await getStoreProducts(store);

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
          variantOptions: p.productVariantOptions,
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
