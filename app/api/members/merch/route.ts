import { NextRequest, NextResponse } from "next/server";
import { getMemberFromRequest } from "@/lib/member-auth";
import { getProducts } from "@/lib/printful";

export async function GET(request: NextRequest) {
  const member = await getMemberFromRequest(request);
  if (!member) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const products = await getProducts();
    return NextResponse.json({ products });
  } catch (err) {
    console.error("Printful products error:", err);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}
