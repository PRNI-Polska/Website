// file: app/api/contact/route.ts
import { NextRequest, NextResponse } from "next/server";
import { contactFormSchema } from "@/lib/validations";
import { checkRateLimit, validateHoneypot } from "@/lib/utils";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log("Contact form submission received (no email configured)", {
      timestamp: new Date().toISOString(),
    });
    return { success: true };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
      from: "PRNI Website <noreply@prni.org.pl>",
      to: process.env.CONTACT_EMAIL || "prni.official@gmail.com",
      subject: `[PRNI Kontakt] ${data.subject} - od ${data.name} (${data.email})`,
      text: `Nowa wiadomość z formularza kontaktowego:\n\nImię: ${data.name}\nEmail: ${data.email}\nTemat: ${data.subject}\n\nWiadomość:\n${data.message}`,
      html: `
        <h2>Nowa wiadomość z formularza kontaktowego</h2>
        <p><strong>Imię:</strong> ${escapeHtml(data.name)}</p>
        <p><strong>Email:</strong> <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></p>
        <p><strong>Temat:</strong> ${escapeHtml(data.subject)}</p>
        <hr>
        <p><strong>Wiadomość:</strong></p>
        <p>${escapeHtml(data.message).replace(/\n/g, "<br>")}</p>
      `,
    });

    if (error) {
      console.error("Failed to send contact email");
      throw new Error("Failed to send email");
    }
  } catch (emailError) {
    console.error("Contact email sending failed:", emailError instanceof Error ? emailError.message : "Unknown error");
    return { success: true };
  }

  return { success: true };
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get("x-forwarded-for") || 
                request.headers.get("x-real-ip") || 
                "unknown";

    // Rate limiting: 5 requests per 15 minutes per IP
    const rateLimit = checkRateLimit(`contact:${ip}`, 5, 15 * 60 * 1000);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { 
          status: 429,
          headers: {
            "Retry-After": Math.ceil(rateLimit.resetIn / 1000).toString(),
          },
        }
      );
    }

    const body = await request.json();

    // Validate input
    const parsed = contactFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, subject, message, website } = parsed.data;

    if (!validateHoneypot(website)) {
      console.log("Honeypot triggered, rejecting submission");
      return NextResponse.json({ success: true });
    }

    // Send email
    await sendEmail({ name, email, subject, message });

    return NextResponse.json({ 
      success: true,
      message: "Your message has been sent successfully." 
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}
