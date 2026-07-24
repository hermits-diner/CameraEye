/**
 * Generates artifacts/cameraeye/public/sitemap.xml from the static routes,
 * the portfolio mock data and the shop catalog.
 *
 * Run: pnpm --filter @workspace/scripts run generate-sitemap
 * (Re-run whenever projects or products are added; when content moves to
 * Sanity, swap the mock import for a Sanity fetch.)
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const SITE_URL = process.env.PUBLIC_SITE_URL ?? "https://camera-eye-v2-two.vercel.app";

// Portfolio content lives in Sanity now — add real project slugs here (or
// swap for a Sanity fetch) as series are published.
const PROJECT_SLUGS: string[] = [];

// Keep in sync with lib/commerce/src/catalog.ts
const PRODUCT_SLUGS = [
  "shadows-and-light-print",
  "urban-desolation-print",
  "brutalism-print",
  "form-and-void-print",
  "quiet-hours-print",
  "urban-desolation-digital",
  "shadows-and-light-digital",
];

interface SitemapEntry {
  path: string;
  priority: number;
  changefreq: "daily" | "weekly" | "monthly";
}

const entries: SitemapEntry[] = [
  { path: "/", priority: 1.0, changefreq: "weekly" },
  { path: "/projects", priority: 0.9, changefreq: "weekly" },
  { path: "/shop", priority: 0.9, changefreq: "weekly" },
  { path: "/map", priority: 0.5, changefreq: "monthly" },
  { path: "/about", priority: 0.6, changefreq: "monthly" },
  { path: "/contact", priority: 0.6, changefreq: "monthly" },
  ...PROJECT_SLUGS.map((slug): SitemapEntry => ({
    path: `/projects/${slug}`,
    priority: 0.8,
    changefreq: "monthly",
  })),
  ...PRODUCT_SLUGS.map((slug): SitemapEntry => ({
    path: `/shop/${slug}`,
    priority: 0.7,
    changefreq: "weekly",
  })),
];

const today = new Date().toISOString().slice(0, 10);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) => `  <url>
    <loc>${SITE_URL}${e.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority.toFixed(1)}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

const outPath = resolve(
  import.meta.dirname,
  "..",
  "..",
  "artifacts",
  "cameraeye",
  "public",
  "sitemap.xml",
);
writeFileSync(outPath, xml);
console.log(`sitemap.xml written: ${outPath} (${entries.length} URLs)`);
