import { getCatalogPricesBatch } from "./gelato";

// Markup multiplier applied to Gelato's production cost to get retail price.
// e.g. 2.5 means you sell at 2.5× the cost Gelato charges you.
const MARKUP_MULTIPLIER = 2.5;

// Minimum retail price (EUR) — floor so tiny items don't end up too cheap
const MIN_PRICE_EUR = 19.99;

// Round to .99 for clean retail pricing
function roundToNine(n: number): number {
  return Math.floor(n) + 0.99;
}

export function applyMarkup(costEur: number): number {
  const raw = costEur * MARKUP_MULTIPLIER;
  return Math.max(roundToNine(raw), MIN_PRICE_EUR);
}

/**
 * Given a list of variant productUids, fetches their Gelato production costs
 * and returns a map of productUid → retail price string.
 */
export async function getVariantRetailPrices(
  productUids: string[],
  currency: string = "EUR",
  country: string = "PL"
): Promise<Map<string, { price: string; currency: string }>> {
  const costs = await getCatalogPricesBatch(productUids, currency, country);
  const result = new Map<string, { price: string; currency: string }>();

  for (const uid of productUids) {
    const cost = costs.get(uid);
    if (cost != null) {
      result.set(uid, {
        price: applyMarkup(cost).toFixed(2),
        currency,
      });
    }
  }

  return result;
}

/**
 * Gets the lowest retail price across a set of variant productUids.
 * Used for "from €XX.XX" display on the product listing page.
 */
export async function getLowestRetailPrice(
  productUids: string[],
  currency: string = "EUR",
  country: string = "PL"
): Promise<{ price: string; currency: string } | null> {
  const prices = await getVariantRetailPrices(productUids, currency, country);
  let lowest: number | null = null;

  for (const { price } of prices.values()) {
    const num = parseFloat(price);
    if (lowest === null || num < lowest) lowest = num;
  }

  return lowest !== null ? { price: lowest.toFixed(2), currency } : null;
}
