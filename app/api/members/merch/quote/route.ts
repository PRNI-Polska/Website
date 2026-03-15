import { NextRequest, NextResponse } from "next/server";
import { getMemberFromRequest } from "@/lib/member-auth";
import { getOrderQuote, type GelatoShippingAddress, type GelatoOrderItem } from "@/lib/gelato";

export async function POST(request: NextRequest) {
  const member = await getMemberFromRequest(request);
  if (!member) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
        phone?: string;
        email?: string;
      };
    };

    if (!items?.length || !recipient?.country_code || !recipient?.zip) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const nameParts = recipient.name.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || firstName;

    const shippingAddress: GelatoShippingAddress = {
      firstName,
      lastName,
      addressLine1: recipient.address1 || "TBD",
      city: recipient.city || "TBD",
      postCode: recipient.zip,
      country: recipient.country_code,
      email: recipient.email || member.email,
    };

    const gelatoItems: GelatoOrderItem[] = items.map((item, idx) => ({
      itemReferenceId: `quote-item-${idx}`,
      productUid: item.productUid,
      files: [],
      quantity: item.qty,
    }));

    const quote = await getOrderQuote(shippingAddress, gelatoItems, "EUR");

    return NextResponse.json({ quote });
  } catch (err) {
    console.error("Quote error:", err);
    return NextResponse.json({ error: "Failed to estimate costs" }, { status: 500 });
  }
}
