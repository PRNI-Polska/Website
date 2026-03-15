import { NextRequest, NextResponse } from "next/server";
import { getMemberFromRequest } from "@/lib/member-auth";
import { getStripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const member = await getMemberFromRequest(request);
  if (!member) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { items, recipient, shippingCost, currency } = body as {
      items: {
        variantId: string;
        productUid: string;
        productName: string;
        variantName: string;
        size: string;
        color: string;
        price: string;
        qty: number;
        image?: string;
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
      shippingCost: number;
      currency: string;
    };

    if (!items?.length || !recipient?.name) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const stripe = getStripe();
    const cur = (currency || "EUR").toLowerCase();

    const lineItems = items.map((item) => ({
      price_data: {
        currency: cur,
        product_data: {
          name: item.productName,
          description: `${item.size} / ${item.color}`,
        },
        unit_amount: Math.round(parseFloat(item.price) * 100),
      },
      quantity: item.qty,
    }));

    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: cur,
          product_data: {
            name: "Shipping",
            description: "Delivery to your address",
          },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      });
    }

    const origin = request.nextUrl.origin;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      customer_email: recipient.email || member.email,
      metadata: {
        memberId: member.id,
        memberEmail: member.email,
        items: JSON.stringify(items.map((i) => ({
          variantId: i.variantId,
          productUid: i.productUid,
          productName: i.productName,
          size: i.size,
          color: i.color,
          qty: i.qty,
          price: i.price,
        }))),
        recipientName: recipient.name,
        recipientAddress1: recipient.address1,
        recipientAddress2: recipient.address2 || "",
        recipientCity: recipient.city,
        recipientState: recipient.state_code || "",
        recipientCountry: recipient.country_code,
        recipientZip: recipient.zip,
        recipientPhone: recipient.phone || "",
        recipientEmail: recipient.email || member.email,
        currency: currency || "EUR",
      },
      success_url: `${origin}/members/merch?order=success`,
      cancel_url: `${origin}/members/merch?order=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
  }
}
