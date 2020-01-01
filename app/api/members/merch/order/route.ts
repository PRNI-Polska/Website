import { NextRequest, NextResponse } from "next/server";
import { getMemberFromRequest } from "@/lib/member-auth";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const member = await getMemberFromRequest(request);
  if (!member) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { items } = body as {
      items: { variantId: number; qty: number; productName?: string; variantName?: string; size?: string; color?: string; price?: string; currency?: string; image?: string }[];
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items" }, { status: 400 });
    }

    const totalAmount = items.reduce(
      (sum, item) => sum + parseFloat(item.price || "0") * (item.qty || 1),
      0
    );
    const currency = items[0]?.currency || "CHF";

    const order = await prisma.merchOrder.create({
      data: {
        memberId: member.id,
        items: JSON.stringify(items),
        totalAmount: totalAmount.toFixed(2),
        currency,
        status: "PENDING",
      },
    });

    return NextResponse.json({ order: { id: order.id, status: order.status } });
  } catch (err) {
    console.error("Order creation error:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
