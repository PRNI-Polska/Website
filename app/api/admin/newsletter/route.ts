import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { validateCsrf, csrfErrorResponse } from "@/lib/csrf";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://prni.org.pl";

export async function GET() {
  try {
    await requireAdmin();

    const [subscribers, count] = await Promise.all([
      prisma.subscriber.findMany({
        where: { confirmed: true },
        orderBy: { createdAt: "desc" },
        select: { id: true, email: true, createdAt: true },
      }),
      prisma.subscriber.count({ where: { confirmed: true } }),
    ]);

    return NextResponse.json({ subscribers, count });
  } catch (error) {
    console.error("GET newsletter error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscribers" },
      {
        status:
          error instanceof Error && error.message.includes("Unauthorized")
            ? 401
            : 500,
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    if (!validateCsrf(request)) {
      return csrfErrorResponse();
    }

    const body = await request.json();
    const { subject, content } = body;

    if (!subject?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: "Subject and content are required." },
        { status: 400 }
      );
    }

    const sanitizedContent = content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/on\w+\s*=\s*"[^"]*"/gi, "")
      .replace(/on\w+\s*=\s*'[^']*'/gi, "")
      .replace(/javascript:/gi, "");

    const subscribers = await prisma.subscriber.findMany({
      where: { confirmed: true },
      select: { email: true, unsubscribeToken: true },
    });

    if (subscribers.length === 0) {
      return NextResponse.json(
        { error: "No subscribers to send to." },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      console.log("Newsletter send logged (no API key):", {
        recipientCount: subscribers.length,
      });
      return NextResponse.json({
        success: true,
        sent: subscribers.length,
        message: "Newsletter logged (no email API key configured).",
      });
    }

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    let sent = 0;
    let failed = 0;

    for (const subscriber of subscribers) {
      const unsubscribeUrl = `${BASE_URL}/api/newsletter/unsubscribe?token=${subscriber.unsubscribeToken}`;

      const htmlWithFooter = `${sanitizedContent}
<hr style="margin: 32px 0; border: none; border-top: 1px solid #333;" />
<p style="font-size: 12px; color: #888;">
  You received this email because you subscribed to the PRNI newsletter.<br />
  <a href="${unsubscribeUrl}" style="color: #888; text-decoration: underline;">Unsubscribe</a>
</p>`;

      try {
        const { error } = await resend.emails.send({
          from: "PRNI <noreply@prni.org.pl>",
          to: subscriber.email,
          subject: subject.trim(),
          html: htmlWithFooter,
        });

        if (error) {
          console.error("Failed to send newsletter to subscriber:", error?.message || "Unknown error");
          failed++;
        } else {
          sent++;
        }
      } catch (err) {
        console.error("Error sending newsletter to subscriber:", err instanceof Error ? err.message : "Unknown error");
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      failed,
      total: subscribers.length,
    });
  } catch (error) {
    console.error("POST newsletter error:", error);
    return NextResponse.json(
      { error: "Failed to send newsletter" },
      {
        status:
          error instanceof Error && error.message.includes("Unauthorized")
            ? 401
            : 500,
      }
    );
  }
}
