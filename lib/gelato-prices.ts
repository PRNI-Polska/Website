import { getCatalogPricesBatch } from "./gelato";

// Small fixed margin on top of Gelato's production cost to cover
// payment processing fees (Stripe ~3%) and rounding.
const FIXED_MARGIN_EUR = 1.5;

function roundUp50(n: number): number {
  return Math.ceil(n * 2) / 2; // round up to nearest €0.50
}

export function applyMarkup(costEur: number): number {
  return roundUp50(costEur + FIXED_MARGIN_EUR);
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
