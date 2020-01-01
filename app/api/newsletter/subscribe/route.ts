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

    const confirmToken = crypto.randomUUID();

    await prisma.subscriber.create({
      data: {
        email,
        confirmed: false,
        unsubscribeToken: crypto.randomUUID(),
        confirmToken,
      },
    });

    try {
      const { sendEmail } = await import("@/lib/email");
      await sendEmail({
        to: email,
        subject: "PRNI — Potwierdź subskrypcję / Confirm subscription",
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2>PRNI — Polski Ruch Narodowo-Integralistyczny</h2>
            <p>Dziękujemy za zapisanie się do naszego newslettera!</p>
            <p>Kliknij poniższy link, aby potwierdzić subskrypcję:</p>
            <p><a href="https://www.prni.org.pl/api/newsletter/confirm?token=${confirmToken}" style="display:inline-block;padding:10px 24px;background:#dc2626;color:#fff;text-decoration:none;border-radius:6px;">Potwierdź subskrypcję</a></p>
            <p style="color:#888;font-size:12px;">Jeśli nie zapisywałeś/aś się do newslettera PRNI, zignoruj tę wiadomość.</p>
          </div>
        `,
      });
    } catch (err) {
      console.error("Failed to send confirmation email:", err);
    }

    return NextResponse.json({
      success: true,
      message: "Check your email to confirm your subscription!",
    });
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again." },
      { status: 500 }
    );
  }
}
