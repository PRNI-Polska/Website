import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIP, rateLimitResponse } from "@/lib/rate-limit";
import { getMemberFromRequest } from "@/lib/member-auth";

interface TranscriptEntry {
  peerId: string;
  role: string;
  text: string;
  timestamp: number;
}

const ADMIN_EMAIL = process.env.CONTACT_EMAIL || process.env.ADMIN_EMAIL || "";
const TRANSCRIPT_RATE_LIMIT = { interval: 60 * 60 * 1000, maxRequests: 3 };

export async function POST(request: NextRequest) {
  try {
    const member = await getMemberFromRequest(request);
    if (!member) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = getClientIP(request);
    const rateCheck = checkRateLimit(`transcript:${ip}`, TRANSCRIPT_RATE_LIMIT);
    if (!rateCheck.allowed) {
      return rateLimitResponse(rateCheck.resetIn);
    }

    const body = await request.json();
    const { transcript } = body as { transcript: TranscriptEntry[] };

    if (!transcript || !Array.isArray(transcript) || transcript.length === 0) {
      return NextResponse.json({ error: "No transcript" }, { status: 400 });
    }

    if (!ADMIN_EMAIL) {
      return NextResponse.json({ success: true });
    }

    const lines = transcript.map((entry) => {
      const time = new Date(entry.timestamp).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      const speaker = entry.peerId === "local" ? "Mówca" : entry.peerId.slice(0, 6);
      const role = entry.role === "admin" ? " [Admin]" : entry.role === "speaker" ? " [Mówca]" : "";
      return `[${time}] ${speaker}${role}: ${entry.text}`;
    });

    const transcriptText = lines.join("\n");
    const date = new Date().toLocaleDateString("pl-PL", { year: "numeric", month: "long", day: "numeric" });
    const time = new Date().toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ success: true });
    }

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "PRNI Komunikator <noreply@prni.org.pl>",
      to: ADMIN_EMAIL,
      subject: `Transkrypcja spotkania — ${date}, ${time}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 640px; margin: 0 auto; color: #222;">
          <h1 style="font-size: 20px; border-bottom: 2px solid #111; padding-bottom: 12px; margin-bottom: 8px;">
            Transkrypcja spotkania PRNI
          </h1>
          <p style="color: #888; font-size: 13px; margin-bottom: 24px;">${date}, ${time} &middot; ${transcript.length} wypowiedzi</p>
          <div style="font-family: 'Courier New', monospace; font-size: 12px; line-height: 2; background: #f5f5f5; padding: 20px; border-radius: 8px; white-space: pre-wrap; color: #333;">${transcriptText.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
          <p style="margin-top: 24px; color: #bbb; font-size: 11px; font-style: italic;">
            Ta transkrypcja nie jest przechowywana na żadnym serwerze.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
