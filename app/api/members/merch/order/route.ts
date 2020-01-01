import { NextRequest, NextResponse } from "next/server";
import { getMemberFromRequest } from "@/lib/member-auth";
import { createOrder, type GelatoShippingAddress, type GelatoOrderItem } from "@/lib/gelato";
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
        variantId: string;
        productUid: string;
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
    if (!recipient?.name || !recipient?.address1 || !recipient?.city || !recipient?.zip || !recipient?.country_code) {
      return NextResponse.json({ error: "Missing shipping info" }, { status: 400 });
    }

    const nameParts = recipient.name.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || firstName;

    const shippingAddress: GelatoShippingAddress = {
      firstName,
      lastName,
      addressLine1: recipient.address1,
      addressLine2: recipient.address2 || undefined,
      city: recipient.city,
      state: recipient.state_code || undefined,
      postCode: recipient.zip,
      country: recipient.country_code,
      email: recipient.email || member.email,
      phone: recipient.phone || undefined,
    };

    const orderRefId = `order-${member.id}-${Date.now()}`;

    // Build Gelato order items — each needs a productUid and design files.
    // The design files come from the product's files stored in Gelato,
    // so we pass the productUid and Gelato handles the rest.
    const gelatoItems: GelatoOrderItem[] = items.map((item, idx) => ({
      itemReferenceId: `item-${idx}-${item.variantId}`,
      productUid: item.productUid,
      files: [],
      quantity: item.qty,
    }));

    const currency = items[0]?.currency || "PLN";

    const gelatoOrder = await createOrder(
      orderRefId,
      member.id,
      shippingAddress,
      gelatoItems,
      currency
    );

    const totalAmount = items.reduce(
      (sum, item) => sum + parseFloat(item.price || "0") * (item.qty || 1),
      0
    );

    try {
      await prisma.merchOrder.create({
        data: {
          memberId: member.id,
          items: JSON.stringify(items),
          totalAmount: totalAmount.toFixed(2),
          currency,
          status: "DRAFT",
          note: `Gelato order ${gelatoOrder.id}`,
        },
      });
    } catch (dbErr) {
      console.error("DB order write failed:", dbErr);
    }

    return NextResponse.json({
      order: {
        id: gelatoOrder.id,
        status: gelatoOrder.fulfillmentStatus || "created",
      },
    });
  } catch (err) {
    console.error("Order creation error:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
