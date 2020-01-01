import { NextRequest, NextResponse } from "next/server";
import { getStoreProduct } from "@/lib/gelato";
import { getVariantRetailPrices } from "@/lib/gelato-prices";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const product = await getStoreProduct(productId);

    const productUids = product.variants.map((v) => v.productUid);
    const retailPrices = await getVariantRetailPrices(productUids);

    const variants = product.variants.map((v) => {
      const pricing = retailPrices.get(v.productUid);
      const parts = v.title.split(" - ");
      const color = parts[0]?.trim() || "";
      const size = parts[1]?.trim() || "";

      return {
        id: v.id,
        name: v.title,
        productUid: v.productUid,
        color,
        size,
        retail_price: pricing?.price || null,
        currency: pricing?.currency || "EUR",
      };
    });

    return NextResponse.json({
      product: {
        id: product.id,
        name: product.title,
        description: product.description,
        preview_image: product.previewUrl || product.externalPreviewUrl || product.externalThumbnailUrl,
        variants,
      },
    });
  } catch (err) {
    console.error("Gelato product detail error:", err);
    return NextResponse.json({ error: "Failed to load product" }, { status: 500 });
  }
}
