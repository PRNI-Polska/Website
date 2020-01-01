import { NextRequest, NextResponse } from "next/server";
import { getMemberFromRequest } from "@/lib/member-auth";
import { getStoreProducts } from "@/lib/gelato";
import { getRetailPrice } from "@/lib/gelato-prices";

export async function GET(request: NextRequest) {
  const member = await getMemberFromRequest(request);
  if (!member) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const products = await getStoreProducts();

    const enriched = products
      .filter((p) => p.status === "active")
      .map((p) => {
        const pricing = getRetailPrice(p.id);
        return {
          id: p.id,
          name: p.title,
          description: p.description,
          preview_image: p.previewUrl || p.externalPreviewUrl || p.externalThumbnailUrl,
          variants: p.variants.length,
          variantOptions: p.productVariantOptions,
          price_from: pricing?.price || null,
          currency: pricing?.currency || "PLN",
        };
      });

    return NextResponse.json({ products: enriched });
  } catch (err) {
    console.error("Gelato products error:", err);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}
