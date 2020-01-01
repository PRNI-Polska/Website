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
  // Example — replace with your real Gelato product IDs:
  //
  // "2e856a12-2f83-4a1f-ac50-4d63c57bc233": {
  //   currency: "PLN",
  //   defaultPrice: "89.99",
  //   variantPrices: {
  //     "70dbc3c5-5ca7-48f9-8b2f-b928b3d7cd19": "89.99",  // Navy - S
  //     "4c87c248-71d5-451c-810e-a0ecbc1ef04d": "89.99",  // Navy - M
  //   },
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
