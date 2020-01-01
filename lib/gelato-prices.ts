// Retail prices for Gelato products.
// Gelato is a fulfillment service — it charges YOU a production cost.
// These are the prices you charge your MEMBERS.
//
// Map: Gelato product ID → { currency, defaultPrice, variantPrices (optional) }
//
// After adding products in Gelato dashboard, copy their product IDs here
// and set your desired retail prices.

export interface ProductPricing {
  currency: string;
  defaultPrice: string;
  variantPrices?: Record<string, string>;
}

export const gelatoPrices: Record<string, ProductPricing> = {
  // PRNI | Heavyweight Classic T-Shirt
  "d1d0824f-9400-4312-a871-3264186d7914": {
    currency: "EUR",
    defaultPrice: "24.99",
  },

  // Add more products here as you create them in Gelato:
  // "gelato-product-id": {
  //   currency: "EUR",
  //   defaultPrice: "29.99",
  // },
};

export function getRetailPrice(productId: string, variantId?: string): { price: string; currency: string } | null {
  const pricing = gelatoPrices[productId];
  if (!pricing) return null;

  if (variantId && pricing.variantPrices?.[variantId]) {
    return { price: pricing.variantPrices[variantId], currency: pricing.currency };
  }

  return { price: pricing.defaultPrice, currency: pricing.currency };
}
