import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { checkRateLimit, getClientIP, RATE_LIMITS } from "@/lib/rate-limit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const rateCheck = checkRateLimit(`newsletter:${ip}`, RATE_LIMITS.contact);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(rateCheck.resetIn / 1000).toString(),
          },
        }
      );
    }

    const body = await request.json();
    const email = body.email?.trim()?.toLowerCase();

    if (!email || !EMAIL_REGEX.test(email) || email.length > 320) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const existing = await prisma.subscriber.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "You're already subscribed!",
      });
    }

    await prisma.subscriber.create({
      data: {
        email,
        confirmed: true,
        unsubscribeToken: crypto.randomUUID(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to the newsletter!",
    });
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again." },
      { status: 500 }
    );
  }
}
