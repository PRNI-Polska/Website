import { NextRequest, NextResponse } from "next/server";
import { getOrderQuote, type GelatoQuoteRecipient, type GelatoQuoteProduct } from "@/lib/gelato";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, recipient } = body as {
      items: { productUid: string; qty: number }[];
      recipient: {
        name: string;
        address1: string;
        address2?: string;
        city: string;
        state_code?: string;
        country_code: string;
        zip: string;
        email: string;
      };
    };

    if (!items?.length || !recipient?.country_code || !recipient?.zip || !recipient?.email) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const nameParts = recipient.name.trim().split(/\s+/);
    const firstName = nameParts[0] || "Customer";
    const lastName = nameParts.slice(1).join(" ") || firstName;

    const quoteRecipient: GelatoQuoteRecipient = {
      country: recipient.country_code,
      firstName,
      lastName,
      addressLine1: recipient.address1 || "TBD",
      addressLine2: recipient.address2,
      city: recipient.city || "TBD",
      postCode: recipient.zip,
      state: recipient.state_code,
      email: recipient.email,
    };

    const quoteProducts: GelatoQuoteProduct[] = items.map((item, idx) => ({
      itemReferenceId: `quote-item-${idx}`,
      productUid: item.productUid,
      quantity: item.qty,
    }));

    const result = await getOrderQuote(quoteRecipient, quoteProducts, "EUR");

    const allMethods = result.quotes?.flatMap((q) => q.shipmentMethods) || [];
    const normalMethods = allMethods.filter((m) => m.type === "normal" || m.type === "standard");
    const cheapest = normalMethods.length > 0
      ? normalMethods.reduce((min, m) => m.price < min.price ? m : min)
      : allMethods.length > 0
        ? allMethods.reduce((min, m) => m.price < min.price ? m : min)
        : null;

    return NextResponse.json({
      shippingMethods: allMethods.map((m) => ({
        name: m.name,
        uid: m.shipmentMethodUid,
        price: m.price,
        currency: m.currency,
        minDays: m.minDeliveryDays,
        maxDays: m.maxDeliveryDays,
        type: m.type,
      })),
      recommended: cheapest ? {
        name: cheapest.name,
        price: cheapest.price,
        currency: cheapest.currency,
        minDays: cheapest.minDeliveryDays,
        maxDays: cheapest.maxDeliveryDays,
      } : null,
    });
  } catch (err) {
    console.error("Quote error:", err);
    return NextResponse.json({ error: "Failed to estimate shipping" }, { status: 500 });
  }
}
