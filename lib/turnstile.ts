// file: lib/turnstile.ts
// Server-side Cloudflare Turnstile token verification.
//
// Call verifyTurnstileToken(token, ip) from any API route to validate
// a CAPTCHA token before processing the form submission.

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface TurnstileVerifyResult {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
}

/**
 * Verify a Turnstile CAPTCHA token with Cloudflare's API.
 *
 * @param token  The token from the client-side widget
 * @param ip     The client's IP address (optional, for extra validation)
 * @returns      true if the token is valid, false otherwise
 */
export async function verifyTurnstileToken(
  token: string | null | undefined,
  ip?: string,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  // If Turnstile is not configured, skip verification (graceful degradation).
  // In production, log a warning so operators know it's not enforced.
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[SECURITY] TURNSTILE_SECRET_KEY not set — CAPTCHA verification skipped. " +
          "Configure it in your environment variables for bot protection.",
      );
    }
    return true;
  }

  // If the token is missing but Turnstile IS configured, reject.
  if (!token) {
    console.warn("[TURNSTILE] Missing token — rejecting request");
    return false;
  }

  try {
    const body: Record<string, string> = {
      secret,
      response: token,
    };
    if (ip) body.remoteip = ip;

    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(body).toString(),
    });

    if (!res.ok) {
      console.error(`[TURNSTILE] Verification API returned ${res.status}`);
      return false;
    }

    const result: TurnstileVerifyResult = await res.json();

    if (!result.success) {
      console.warn(
        `[TURNSTILE] Verification failed: ${(result["error-codes"] || []).join(", ")}`,
      );
    }

    return result.success;
  } catch (err) {
    console.error("[TURNSTILE] Verification request failed:", err);
    // On network error, fail open to avoid blocking all submissions.
    // The other protections (rate limiting, honeypot, validation) still apply.
    return true;
  }
}
