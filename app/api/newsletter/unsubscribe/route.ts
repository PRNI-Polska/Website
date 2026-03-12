import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return new NextResponse(unsubscribePage("Invalid unsubscribe link.", false), {
      status: 400,
      headers: {
        "Content-Type": "text/html",
        "Referrer-Policy": "no-referrer",
      },
    });
  }

  const subscriber = await prisma.subscriber.findUnique({
    where: { unsubscribeToken: token },
  });

  if (!subscriber) {
    return new NextResponse(
      unsubscribePage("This link is invalid or you have already been unsubscribed.", false),
      {
        status: 404,
        headers: { "Content-Type": "text/html", "Referrer-Policy": "no-referrer" },
      }
    );
  }

  return new NextResponse(
    unsubscribePage("Are you sure you want to unsubscribe from the PRNI newsletter?", true, token),
    {
      status: 200,
      headers: { "Content-Type": "text/html", "Referrer-Policy": "no-referrer" },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = body.token;

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const subscriber = await prisma.subscriber.findUnique({
      where: { unsubscribeToken: token },
    });

    if (!subscriber) {
      return NextResponse.json(
        { error: "Invalid or already unsubscribed" },
        { status: 404 }
      );
    }

    await prisma.subscriber.delete({
      where: { id: subscriber.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unsubscribe error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}

function unsubscribePage(message: string, showConfirm: boolean, token?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="referrer" content="no-referrer" />
  <title>Unsubscribe - PRNI</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: #0a0a0a;
      color: #fafafa;
    }
    .container {
      text-align: center;
      padding: 2rem;
      max-width: 480px;
    }
    h1 { font-size: 1.5rem; margin-bottom: 1rem; }
    p { color: #a1a1aa; line-height: 1.6; }
    a {
      display: inline-block;
      margin-top: 1.5rem;
      color: #fafafa;
      text-decoration: underline;
    }
    button {
      display: inline-block;
      margin-top: 1.5rem;
      padding: 0.75rem 2rem;
      background: #dc2626;
      color: #fff;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      cursor: pointer;
    }
    button:hover { background: #b91c1c; }
    button:disabled { background: #555; cursor: not-allowed; }
    .success { color: #4ade80; }
    .error { color: #f87171; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Newsletter</h1>
    <p id="message">${message}</p>
    ${showConfirm ? `
    <button id="confirm-btn" onclick="confirmUnsubscribe()">Unsubscribe</button>
    <br>
    <a href="/">← Back to website</a>
    <script>
      async function confirmUnsubscribe() {
        var btn = document.getElementById('confirm-btn');
        var msg = document.getElementById('message');
        btn.disabled = true;
        btn.textContent = 'Processing...';
        try {
          var res = await fetch('/api/newsletter/unsubscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: '${token}' })
          });
          if (res.ok) {
            msg.textContent = "You've been successfully unsubscribed. You will no longer receive our newsletter.";
            msg.className = 'success';
            btn.style.display = 'none';
          } else {
            var data = await res.json();
            msg.textContent = data.error || 'Something went wrong.';
            msg.className = 'error';
            btn.textContent = 'Try Again';
            btn.disabled = false;
          }
        } catch(e) {
          msg.textContent = 'Network error. Please try again.';
          msg.className = 'error';
          btn.textContent = 'Try Again';
          btn.disabled = false;
        }
      }
    </script>` : `
    <a href="/">← Back to website</a>`}
  </div>
</body>
</html>`;
}
