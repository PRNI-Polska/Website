import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return new NextResponse(unsubscribeHTML("Invalid unsubscribe link."), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  try {
    const subscriber = await prisma.subscriber.findUnique({
      where: { unsubscribeToken: token },
    });

    if (!subscriber) {
      return new NextResponse(
        unsubscribeHTML("This link is invalid or you have already been unsubscribed."),
        { status: 404, headers: { "Content-Type": "text/html" } }
      );
    }

    await prisma.subscriber.delete({
      where: { id: subscriber.id },
    });

    return new NextResponse(
      unsubscribeHTML("You've been successfully unsubscribed. You will no longer receive our newsletter."),
      { status: 200, headers: { "Content-Type": "text/html" } }
    );
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return new NextResponse(
      unsubscribeHTML("Something went wrong. Please try again later."),
      { status: 500, headers: { "Content-Type": "text/html" } }
    );
  }
}

function unsubscribeHTML(message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
  </style>
</head>
<body>
  <div class="container">
    <h1>Newsletter</h1>
    <p>${message}</p>
    <a href="/">← Back to website</a>
  </div>
</body>
</html>`;
}
