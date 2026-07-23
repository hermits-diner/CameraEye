export type ProductType = "print" | "digital";

export interface PrintSize {
  id: string;
  /** Human readable label, e.g. "A3 — 29.7 × 42 cm" */
  label: string;
  widthCm: number;
  heightCm: number;
  /** Weight of the packed print in grams (print + tube/flat packaging share). */
  weightG: number;
  /** Price in KRW (integer, no decimals). */
  price: number;
}

export interface DigitalOffer {
  /** Price in KRW. */
  price: number;
  /** e.g. "JPEG, 6000px long edge, sRGB" */
  fileSpec: string;
  /** Short licence summary shown at checkout. */
  licence: string;
}

export interface ShopProduct {
  /** Stable catalog id, referenced by orders and inventory. */
  id: string;
  slug: string;
  title: string;
  /** Portfolio project this product belongs to (for cross-linking). */
  projectSlug: string;
  type: ProductType;
  /** Public image path served by the web app. */
  imageUrl: string;
  description: string;
  /** Total edition size for limited prints. Undefined = open edition. */
  editionSize?: number;
  /** Available sizes; required for prints. */
  sizes?: PrintSize[];
  /** Digital download offer; required for digital products. */
  digital?: DigitalOffer;
}

export interface OrderItemInput {
  productId: string;
  sizeId?: string;
  quantity: number;
}
