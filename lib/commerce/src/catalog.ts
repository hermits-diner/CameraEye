import type { PrintSize, ShopProduct } from "./types";

/**
 * Print sizes shared across editions. Weights include packaging share
 * (shipping tube / flat mailer) so the shipping calculator can work
 * directly from the catalog.
 */
const SIZES: Record<"a4" | "a3" | "a2", PrintSize> = {
  a4: {
    id: "a4",
    label: "A4 — 21 × 29.7 cm",
    widthCm: 21,
    heightCm: 29.7,
    weightG: 350,
    price: 180_000,
  },
  a3: {
    id: "a3",
    label: "A3 — 29.7 × 42 cm",
    widthCm: 29.7,
    heightCm: 42,
    weightG: 550,
    price: 280_000,
  },
  a2: {
    id: "a2",
    label: "A2 — 42 × 59.4 cm",
    widthCm: 42,
    heightCm: 59.4,
    weightG: 900,
    price: 420_000,
  },
};

/**
 * Source of truth for everything purchasable. Static on purpose: the
 * catalog is content (like the portfolio itself), while the database only
 * tracks transactional state (orders, sold counts).
 */
export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: "print-shadows-and-light",
    slug: "shadows-and-light-print",
    title: "Shadows & Light — Fine Art Print",
    projectSlug: "shadows-and-light",
    type: "print",
    imageUrl: "/images/editorial-1.jpg",
    description:
      "Museum-grade giclée print on Hahnemühle Photo Rag 308gsm. Each print is signed and numbered. Limited edition of 50.",
    editionSize: 50,
    sizes: [SIZES.a4, SIZES.a3, SIZES.a2],
  },
  {
    id: "print-urban-desolation",
    slug: "urban-desolation-print",
    title: "Urban Desolation — Fine Art Print",
    projectSlug: "urban-desolation",
    type: "print",
    imageUrl: "/images/urban-1.jpg",
    description:
      "Cinematic dusk cityscape printed on baryta paper for deep blacks. Signed and numbered. Limited edition of 50.",
    editionSize: 50,
    sizes: [SIZES.a4, SIZES.a3, SIZES.a2],
  },
  {
    id: "print-brutalism",
    slug: "brutalism-print",
    title: "Brutalism — Fine Art Print",
    projectSlug: "brutalism-campaign",
    type: "print",
    imageUrl: "/images/campaign-1.jpg",
    description:
      "Stark architectural study from the Y-3 campaign. Archival pigment print. Limited edition of 50.",
    editionSize: 50,
    sizes: [SIZES.a4, SIZES.a3, SIZES.a2],
  },
  {
    id: "print-form-and-void",
    slug: "form-and-void-print",
    title: "Form & Void — Collector's Print",
    projectSlug: "form-and-void",
    type: "print",
    imageUrl: "/images/still-1.jpg",
    description:
      "High-contrast still life in a small collector's edition. Signed, numbered and delivered with a certificate of authenticity. Limited edition of 25.",
    editionSize: 25,
    sizes: [SIZES.a3, SIZES.a2],
  },
  {
    id: "print-quiet-hours",
    slug: "quiet-hours-print",
    title: "Quiet Hours — Open Edition Print",
    projectSlug: "quiet-hours",
    type: "print",
    imageUrl: "/images/portrait-1.jpg",
    description:
      "Soft window-light portrait shot on 35mm film. Open edition giclée print on matte cotton paper.",
    sizes: [SIZES.a4, SIZES.a3],
  },
  {
    id: "digital-urban-desolation",
    slug: "urban-desolation-digital",
    title: "Urban Desolation — Digital Edition",
    projectSlug: "urban-desolation",
    type: "digital",
    imageUrl: "/images/urban-1.jpg",
    description:
      "Full-resolution digital file for personal display and screen use. Delivered instantly after checkout.",
    digital: {
      price: 90_000,
      fileSpec: "JPEG · 6000px long edge · sRGB",
      licence: "Personal, non-commercial licence. No redistribution.",
    },
  },
  {
    id: "digital-shadows-and-light",
    slug: "shadows-and-light-digital",
    title: "Shadows & Light — Digital Edition",
    projectSlug: "shadows-and-light",
    type: "digital",
    imageUrl: "/images/editorial-1.jpg",
    description:
      "Full-resolution digital file of the signature frame from Shadows & Light. Delivered instantly after checkout.",
    digital: {
      price: 90_000,
      fileSpec: "JPEG · 6000px long edge · sRGB",
      licence: "Personal, non-commercial licence. No redistribution.",
    },
  },
];

export function getProductById(id: string): ShopProduct | undefined {
  return SHOP_PRODUCTS.find((p) => p.id === id);
}

export function getProductBySlug(slug: string): ShopProduct | undefined {
  return SHOP_PRODUCTS.find((p) => p.slug === slug);
}

export function getProductsForProject(projectSlug: string): ShopProduct[] {
  return SHOP_PRODUCTS.filter((p) => p.projectSlug === projectSlug);
}

export function getSize(
  product: ShopProduct,
  sizeId: string | undefined,
): PrintSize | undefined {
  if (!product.sizes || !sizeId) return undefined;
  return product.sizes.find((s) => s.id === sizeId);
}

/** Unit price for a product (+ size for prints). Returns undefined when invalid. */
export function getUnitPrice(
  product: ShopProduct,
  sizeId: string | undefined,
): number | undefined {
  if (product.type === "digital") return product.digital?.price;
  return getSize(product, sizeId)?.price;
}
