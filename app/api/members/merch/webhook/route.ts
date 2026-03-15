import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createOrder, type GelatoShippingAddress, type GelatoOrderItem } from "@/lib/gelato";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Config error" }, { status: 500 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const meta = session.metadata || {};

    try {
      const items = JSON.parse(meta.items || "[]") as {
        variantId: string;
        productUid: string;
        productName: string;
        size: string;
        color: string;
        qty: number;
        price: string;
      }[];

      const nameParts = (meta.recipientName || "").trim().split(/\s+/);

      const shippingAddress: GelatoShippingAddress = {
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || nameParts[0] || "",
        addressLine1: meta.recipientAddress1 || "",
        addressLine2: meta.recipientAddress2 || undefined,
        city: meta.recipientCity || "",
        state: meta.recipientState || undefined,
        postCode: meta.recipientZip || "",
        country: meta.recipientCountry || "",
        email: meta.recipientEmail || "",
        phone: meta.recipientPhone || undefined,
      };

      const gelatoItems: GelatoOrderItem[] = items.map((item, idx) => ({
        itemReferenceId: `${session.id}-item-${idx}`,
        productUid: item.productUid,
        files: [],
        quantity: item.qty,
      }));

      const orderRefId = `stripe-${session.id}`;
      const currency = meta.currency || "EUR";

      const gelatoOrder = await createOrder(
        orderRefId,
        meta.memberId || "unknown",
        shippingAddress,
        gelatoItems,
        currency
      );

      console.log("Gelato order created:", gelatoOrder.id, "for Stripe session:", session.id);

      const totalAmount = items.reduce(
        (sum, i) => sum + parseFloat(i.price) * i.qty,
        0
      );

      try {
        await prisma.merchOrder.create({
          data: {
            memberId: meta.memberId || "unknown",
            items: JSON.stringify(items),
            totalAmount: totalAmount.toFixed(2),
            currency,
            status: "PAID",
            note: `Stripe: ${session.id} | Gelato: ${gelatoOrder.id}`,
          },
        });
      } catch (dbErr) {
        console.error("DB order write failed:", dbErr);
      }
    } catch (orderErr) {
      console.error("Failed to create Gelato order after payment:", orderErr);
    }
  }

  return NextResponse.json({ received: true });
}
