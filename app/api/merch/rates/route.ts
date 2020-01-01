import { NextRequest, NextResponse } from "next/server";

const SUPPORTED_CURRENCIES = ["PLN", "EUR", "USD", "GBP", "CHF", "CZK", "SEK", "NOK", "DKK", "HUF"];

let cachedRates: { base: string; rates: Record<string, number>; ts: number } | null = null;
const CACHE_TTL = 3600_000;

async function fetchRates(base: string): Promise<Record<string, number>> {
  if (cachedRates && cachedRates.base === base && Date.now() - cachedRates.ts < CACHE_TTL) {
    return cachedRates.rates;
  }

  const res = await fetch(
    `https://api.exchangerate-api.com/v4/latest/${base}`,
    { next: { revalidate: 3600 } }
  );

  if (!res.ok) throw new Error(`Exchange rate API error: ${res.status}`);

  const data = await res.json();
  const filtered: Record<string, number> = {};
  for (const c of SUPPORTED_CURRENCIES) {
    if (data.rates[c]) filtered[c] = data.rates[c];
  }

  cachedRates = { base, rates: filtered, ts: Date.now() };
  return filtered;
}

export async function GET(request: NextRequest) {
  const base = request.nextUrl.searchParams.get("base") || "EUR";

  try {
    const rates = await fetchRates(base.toUpperCase());
    return NextResponse.json({ base: base.toUpperCase(), rates });
  } catch (err) {
    console.error("Exchange rates error:", err);
    return NextResponse.json({ error: "Failed to fetch rates" }, { status: 500 });
  }
}
