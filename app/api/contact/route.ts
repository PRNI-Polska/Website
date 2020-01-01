// file: app/api/contact/route.ts
import { NextRequest, NextResponse } from "next/server";
import { contactFormSchema } from "@/lib/validations";
import { checkRateLimit, validateHoneypot } from "@/lib/utils";

// For production, you would use a service like Resend, SendGrid, etc.
// This is a stub that logs the message
async function sendEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  // In production, integrate with your email service:
  // 
  // import { Resend } from 'resend';
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: 'website@prni.org',
  //   to: process.env.CONTACT_EMAIL || 'info@prni.org',
  //   subject: `Contact Form: ${data.subject}`,
  //   text: `From: ${data.name} <${data.email}>\n\n${data.message}`,
  // });

  // For now, just log it
  console.log("Contact form submission:", {
    from: `${data.name} <${data.email}>`,
    subject: data.subject,
    message: data.message,
    timestamp: new Date().toISOString(),
  });

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

    // Check honeypot - if it has a value, it's likely a bot
    if (!validateHoneypot(website)) {
      // Silently reject but return success to not give away the honeypot
      console.log("Honeypot triggered, rejecting submission from:", email);
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
