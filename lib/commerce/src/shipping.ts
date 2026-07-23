import { getProductById, getSize } from "./catalog";
import type { OrderItemInput } from "./types";

/**
 * Shipping is calculated from the packed weight of all print items.
 * Digital items never contribute to shipping.
 *
 * Domestic (KR) uses a flat base + per-kg surcharge; international is
 * zoned (roughly Asia / EU+Americas / rest of world).
 */

export type ShippingZone = "domestic" | "zone1" | "zone2" | "zone3";

export interface ShippingCountry {
  code: string;
  label: string;
  zone: ShippingZone;
}

export const SHIPPING_COUNTRIES: ShippingCountry[] = [
  { code: "KR", label: "South Korea", zone: "domestic" },
  { code: "JP", label: "Japan", zone: "zone1" },
  { code: "CN", label: "China", zone: "zone1" },
  { code: "TW", label: "Taiwan", zone: "zone1" },
  { code: "HK", label: "Hong Kong", zone: "zone1" },
  { code: "SG", label: "Singapore", zone: "zone1" },
  { code: "US", label: "United States", zone: "zone2" },
  { code: "CA", label: "Canada", zone: "zone2" },
  { code: "GB", label: "United Kingdom", zone: "zone2" },
  { code: "DE", label: "Germany", zone: "zone2" },
  { code: "FR", label: "France", zone: "zone2" },
  { code: "NL", label: "Netherlands", zone: "zone2" },
  { code: "AU", label: "Australia", zone: "zone2" },
  { code: "OTHER", label: "Other / Rest of world", zone: "zone3" },
];

/** Orders at or above this subtotal ship free within Korea (KRW). */
export const FREE_DOMESTIC_SHIPPING_THRESHOLD = 300_000;

/** Packaging overhead added once per shipment, in grams. */
const PACKAGING_WEIGHT_G = 400;

interface RateTable {
  /** Base fee covering the first kilogram (KRW). */
  base: number;
  /** Fee per additional kilogram, rounded up (KRW). */
  perExtraKg: number;
}

const RATES: Record<ShippingZone, RateTable> = {
  domestic: { base: 4_000, perExtraKg: 1_000 },
  zone1: { base: 24_000, perExtraKg: 6_000 },
  zone2: { base: 38_000, perExtraKg: 9_000 },
  zone3: { base: 46_000, perExtraKg: 12_000 },
};

export interface ShippingQuote {
  zone: ShippingZone;
  /** Total packed weight in grams (0 for digital-only orders). */
  weightG: number;
  /** Shipping fee in KRW. */
  fee: number;
  /** True when the domestic free-shipping threshold waived the fee. */
  freeShippingApplied: boolean;
}

export function zoneForCountry(countryCode: string): ShippingZone {
  const country = SHIPPING_COUNTRIES.find((c) => c.code === countryCode);
  return country?.zone ?? "zone3";
}

/**
 * Compute the shipping quote for a set of order items.
 *
 * @param items order lines (unknown product ids are ignored)
 * @param countryCode ISO-ish country code from {@link SHIPPING_COUNTRIES}
 * @param subtotal order subtotal in KRW, used for the free-shipping threshold
 */
export function calcShipping(
  items: OrderItemInput[],
  countryCode: string,
  subtotal: number,
): ShippingQuote {
  const zone = zoneForCountry(countryCode);

  let printWeight = 0;
  for (const item of items) {
    const product = getProductById(item.productId);
    if (!product || product.type !== "print") continue;
    const size = getSize(product, item.sizeId);
    if (!size) continue;
    printWeight += size.weightG * item.quantity;
  }

  if (printWeight === 0) {
    return { zone, weightG: 0, fee: 0, freeShippingApplied: false };
  }

  const weightG = printWeight + PACKAGING_WEIGHT_G;

  if (zone === "domestic" && subtotal >= FREE_DOMESTIC_SHIPPING_THRESHOLD) {
    return { zone, weightG, fee: 0, freeShippingApplied: true };
  }

  const rate = RATES[zone];
  const extraKg = Math.max(0, Math.ceil(weightG / 1000) - 1);
  const fee = rate.base + extraKg * rate.perExtraKg;

  return { zone, weightG, fee, freeShippingApplied: false };
}
