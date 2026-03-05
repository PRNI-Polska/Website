import { NextRequest, NextResponse } from "next/server";

interface TranscriptEntry {
  peerId: string;
  role: string;
  text: string;
  timestamp: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, transcript } = body as { email: string; transcript: TranscriptEntry[] };

    if (!email || !email.includes("@") || !transcript || !Array.isArray(transcript) || transcript.length === 0) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const lines = transcript.map((entry) => {
      const time = new Date(entry.timestamp).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      const speaker = entry.peerId === "local" ? "Ty" : entry.peerId.slice(0, 6);
      const role = entry.role === "admin" ? " [Admin]" : entry.role === "speaker" ? " [Mówca]" : "";
      return `[${time}] ${speaker}${role}: ${entry.text}`;
    });

    const transcriptText = lines.join("\n");
    const date = new Date().toLocaleDateString("pl-PL", { year: "numeric", month: "long", day: "numeric" });

    if (!process.env.RESEND_API_KEY) {
      console.log("Transcript email (no RESEND_API_KEY):", { to: email, entries: transcript.length });
      return NextResponse.json({ success: true });
    }

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "PRNI Komunikator <noreply@prni.org.pl>",
      to: email,
      subject: `Transkrypcja spotkania — ${date}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #222;">
          <h1 style="font-size: 20px; border-bottom: 2px solid #111; padding-bottom: 12px;">
            Transkrypcja spotkania PRNI
          </h1>
          <p style="color: #666; font-size: 14px;">${date} &middot; ${transcript.length} wypowiedzi</p>
          <div style="margin-top: 24px; font-family: 'Courier New', monospace; font-size: 13px; line-height: 1.8; background: #f8f8f8; padding: 20px; border-radius: 8px; white-space: pre-wrap;">${transcriptText.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
          <p style="margin-top: 24px; color: #999; font-size: 12px; font-style: italic;">
            &ldquo;Naród Ponad Wszystkim&rdquo; — PRNI Komunikator
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Transcript email error:", error);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
