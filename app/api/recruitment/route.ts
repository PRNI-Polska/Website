import { NextRequest, NextResponse } from "next/server";
import { recruitmentFormSchema } from "@/lib/validations";
import { validateHoneypot } from "@/lib/utils";
import { escapeHtml, trackHoneypotTrigger } from "@/lib/security-alerts";
import { rateLimit, getClientIP, validateOrigin, RATE_LIMITS } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";

async function sendEmail(data: { name: string; email: string; location?: string; message: string }) {
  // If no API key configured, log minimally
  if (!process.env.RESEND_API_KEY) {
    if (process.env.NODE_ENV === "production") {
      console.log("Recruitment submission received (no email service configured)");
    } else {
      console.log("Recruitment submission (no email configured):", {
        from: `${data.name} <${data.email}>`,
        location: data.location || "",
        timestamp: new Date().toISOString(),
      });
    }
    return { success: true };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Sanitize subject line to prevent email header injection
    const safeName = data.name.replace(/[\r\n]/g, "").slice(0, 50);
    const safeEmail = data.email.replace(/[\r\n]/g, "").slice(0, 80);
    const safeLocation = data.location ? data.location.replace(/[\r\n]/g, "").slice(0, 40) : "";
    const subjectBits = [
      "[PRNI Recruitment]",
      safeName,
      `(${safeEmail})`,
      safeLocation ? `— ${safeLocation}` : "",
    ].filter(Boolean);

    const { error } = await resend.emails.send({
      from: "PRNI Website <noreply@prni.org.pl>",
      to: process.env.CONTACT_EMAIL || "prni.official@gmail.com",
      subject: subjectBits.join(" "),
      text: `New recruitment interest:\n\nName: ${data.name}\nEmail: ${data.email}\nLocation: ${data.location || "Not provided"}\n\nMessage:\n${data.message}\n\n---\nSubmitted: ${new Date().toISOString()}`,
      html: `
        <h2>New recruitment interest</h2>
        <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
        <p><strong>Email:</strong> <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></p>
        <p><strong>Location:</strong> ${data.location ? escapeHtml(data.location) : "<em>Not provided</em>"}</p>
        <hr>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(data.message).replace(/\n/g, "<br>")}</p>
        <hr>
        <p style="color:#666;font-size:12px;">Submitted: ${new Date().toISOString()}</p>
      `,
    });

    if (error) {
      console.error("Failed to send recruitment email:", error);
      throw new Error("Failed to send email");
    }
  } catch (emailError) {
    console.error("Recruitment email sending failed:", emailError);
    // Don't throw: still allow the form to succeed
    if (process.env.NODE_ENV !== "production") {
      console.log("Recruitment submission (email exception):", {
        from: `${data.name} <${data.email}>`,
        location: data.location || "",
        timestamp: new Date().toISOString(),
      });
    }
    return { success: true };
  }

  return { success: true };
}

// SECURITY: Hide this route from browsers — return 404 for non-POST
export async function GET() {
  return NextResponse.json(null, { status: 404 });
}

export async function POST(request: NextRequest) {
  try {
    // Origin validation (CSRF protection)
    if (!validateOrigin(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const ip = getClientIP(request);

    // Rate limiting: 2 requests per hour per IP (Redis-backed)
    const rl = await rateLimit(ip, "recruitment", RATE_LIMITS.recruitment.maxRequests, RATE_LIMITS.recruitment.windowMs, RATE_LIMITS.recruitment.blockDuration);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(rl.resetIn / 1000).toString(),
          },
        }
      );
    }

    const body = await request.json();

    // Verify CAPTCHA token
    const isCaptchaValid = await verifyTurnstileToken(body.turnstileToken, ip);
    if (!isCaptchaValid) {
      return NextResponse.json(
        { error: "CAPTCHA verification failed. Please try again." },
        { status: 403 }
      );
    }

    const parsed = recruitmentFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid form data",
          ...(process.env.NODE_ENV !== "production" && { details: parsed.error.flatten() }),
        },
        { status: 400 }
      );
    }

    const { name, email, location, message, website } = parsed.data;

    if (!validateHoneypot(website)) {
      trackHoneypotTrigger(ip, "/api/recruitment", email);
      return NextResponse.json({ success: true });
    }

    await sendEmail({ name, email, location, message });

    return NextResponse.json({
      success: true,
      message: "Your request has been sent successfully.",
    });
  } catch (error) {
    console.error("Recruitment form error:", error);
    return NextResponse.json(
      { error: "Failed to send request. Please try again." },
      { status: 500 }
    );
  }
}

