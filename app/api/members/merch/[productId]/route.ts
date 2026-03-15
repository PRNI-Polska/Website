import { NextRequest, NextResponse } from "next/server";
import { getMemberFromRequest } from "@/lib/member-auth";
import { getStoreProduct } from "@/lib/gelato";
import { getRetailPrice } from "@/lib/gelato-prices";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const member = await getMemberFromRequest(request);
  if (!member) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { productId } = await params;
    const product = await getStoreProduct(productId);

    const variants = product.variants.map((v) => {
      const pricing = getRetailPrice(product.id, v.id);
      const parts = v.title.split(" - ");
      const color = parts[0] || "";
      const size = parts[1] || "";

      return {
        id: v.id,
        name: v.title,
        productUid: v.productUid,
        color,
        size,
        retail_price: pricing?.price || null,
        currency: pricing?.currency || "PLN",
      };
    });

    return NextResponse.json({
      product: {
        id: product.id,
        name: product.title,
        description: product.description,
        preview_image: product.previewUrl || product.externalPreviewUrl || product.externalThumbnailUrl,
        variantOptions: product.productVariantOptions,
        variants,
      },
    });
  } catch (err) {
    console.error("Gelato product detail error:", err);
    return NextResponse.json({ error: "Failed to load product" }, { status: 500 });
  }
}
