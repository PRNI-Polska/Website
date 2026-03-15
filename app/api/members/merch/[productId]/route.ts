import { NextRequest, NextResponse } from "next/server";
import { getMemberFromRequest } from "@/lib/member-auth";
import { getProduct } from "@/lib/printful";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const member = await getMemberFromRequest(request);
  if (!member) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId } = await params;
  const id = parseInt(productId, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
  }

  try {
    const product = await getProduct(id);
    return NextResponse.json({ product });
  } catch (err) {
    console.error("Printful product detail error:", err);
    return NextResponse.json({ error: "Failed to load product" }, { status: 500 });
  }
}
