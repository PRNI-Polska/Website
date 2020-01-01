import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/?newsletter=invalid", request.url));
  }

  try {
    const subscriber = await prisma.subscriber.findUnique({
      where: { confirmToken: token },
    });

    if (!subscriber) {
      return NextResponse.redirect(new URL("/?newsletter=invalid", request.url));
    }

    if (subscriber.confirmed) {
      return NextResponse.redirect(new URL("/?newsletter=already", request.url));
    }

    await prisma.subscriber.update({
      where: { id: subscriber.id },
      data: { confirmed: true, confirmToken: null },
    });

    return NextResponse.redirect(new URL("/?newsletter=confirmed", request.url));
  } catch (error) {
    console.error("Newsletter confirm error:", error);
    return NextResponse.redirect(new URL("/?newsletter=error", request.url));
  }
}
