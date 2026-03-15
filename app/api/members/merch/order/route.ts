import { NextRequest, NextResponse } from "next/server";
import { getMemberFromRequest } from "@/lib/member-auth";
import { createOrder, type PrintfulRecipient, type PrintfulOrderItem } from "@/lib/printful";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const member = await getMemberFromRequest(request);
  if (!member) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { items, recipient } = body as {
      items: {
        variantId: number;
        qty: number;
        productName?: string;
        variantName?: string;
        size?: string;
        color?: string;
        price?: string;
        currency?: string;
      }[];
      recipient: {
        name: string;
        address1: string;
        address2?: string;
        city: string;
        state_code?: string;
        country_code: string;
        zip: string;
        phone?: string;
        email?: string;
      };
    };

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items" }, { status: 400 });
    }
    if (!recipient || !recipient.name || !recipient.address1 || !recipient.city || !recipient.zip || !recipient.country_code) {
      return NextResponse.json({ error: "Missing shipping info" }, { status: 400 });
    }

    const pfRecipient: PrintfulRecipient = {
      name: recipient.name,
      address1: recipient.address1,
      address2: recipient.address2 || undefined,
      city: recipient.city,
      state_code: recipient.state_code || undefined,
      country_code: recipient.country_code,
      zip: recipient.zip,
      phone: recipient.phone || undefined,
      email: recipient.email || member.email,
    };

    const pfItems: PrintfulOrderItem[] = items.map((i) => ({
      sync_variant_id: i.variantId,
      quantity: i.qty,
    }));

    const pfOrder = await createOrder(pfRecipient, pfItems);

    const totalAmount = items.reduce(
      (sum, item) => sum + parseFloat(item.price || "0") * (item.qty || 1),
      0
    );
    const currency = items[0]?.currency || "CHF";

    try {
      await prisma.merchOrder.create({
        data: {
          memberId: member.id,
          items: JSON.stringify(items),
          totalAmount: totalAmount.toFixed(2),
          currency,
          status: "DRAFT",
          note: `Printful order #${pfOrder.id}`,
        },
      });
    } catch (dbErr) {
      console.error("DB order write failed (table may not exist):", dbErr);
    }

    return NextResponse.json({
      order: {
        id: pfOrder.id,
        status: pfOrder.status,
      },
    });
  } catch (err) {
    console.error("Order creation error:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
