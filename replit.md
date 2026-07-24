# CameraEye

Photography portfolio + print shop: editorial/campaign/personal series with series notes, capture-format tags and shooting-location maps, plus a commerce layer for limited-edition prints and digital downloads (manual order confirmation, no online payment yet).

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/cameraeye run dev` — run the web app (needs `PORT`, `BASE_PATH` env)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/scripts run generate-sitemap` — regenerate `public/sitemap.xml`
- Required env: `DATABASE_URL` — Postgres connection string
- Optional env: `ADMIN_EMAILS` (comma-separated admin accounts), `SMTP_HOST/PORT/USER/PASS/FROM` (order emails; logged to console when unset), `INSTAGRAM_ACCESS_TOKEN` (footer feed), `DIGITAL_FILE_BASE_URL` (real digital files), `PUBLIC_SITE_URL`, `VITE_SANITY_PROJECT_ID` / `VITE_SANITY_DATASET` (live CMS content), `VITE_SITE_URL`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 (cookie sessions, scrypt password hashing)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Web: Vite + React 19, wouter, TanStack Query, Tailwind 4, GSAP/framer-motion, react-leaflet, next-themes
- CMS: Sanity (optional — falls back to bundled mock data)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/commerce` — **source of truth for the shop**: product catalog (sizes/prices/editions), shipping calculator (weight + zone based), order-status state machine. Shared by API and web.
- `lib/db/src/schema` — Drizzle tables: users, sessions, orders, order_items, download_tokens, wishlists, newsletter_subscribers
- `lib/api-spec/openapi.yaml` — API contract; `fix-zod-imports.mjs` rewrites generated zod imports to `zod/v4` after Orval runs
- `artifacts/api-server/src/routes` — auth, shop (inventory), orders, wishlist, newsletter, downloads, instagram (proxy), admin
- `artifacts/api-server/src/lib` — auth (sessions/scrypt), mailer (SMTP or log fallback), orders (order numbers, sold counts)
- `artifacts/cameraeye/src/lib/content/adapter.ts` — content adapter: Sanity when `VITE_SANITY_PROJECT_ID` set, otherwise `src/data/mockData.ts`
- `artifacts/cameraeye/src/pages` — Home, Projects, ProjectDetail (lightbox/story/map/prints), Shop, ShopProduct, Checkout, Login/Register, Account, Admin, MapPage
- `artifacts/cameraeye/sanity/schemas` — Sanity Studio schema files (mirrored into `studio/schemaTypes`)
- `studio/` — Sanity Studio app (project vh63tnwo / production, hosted at https://cameraeye.sanity.studio). `pnpm --filter @workspace/studio run deploy` redeploys it; `run seed` re-seeds the mock content (idempotent).
- `scripts/src/generate-sitemap.ts` — writes `artifacts/cameraeye/public/sitemap.xml`

## Architecture decisions

- Prices/stock rules live in the static catalog (`lib/commerce`), DB stores only transactional state; server always re-derives prices — client amounts are never trusted.
- Limited-edition stock is enforced in the order transaction via pg advisory locks + non-cancelled sold counts (no separate inventory table to drift).
- Print orders: `pending` → manual confirm → production → shipped → delivered (emails on each change). Digital-only orders complete instantly and mint expiring, download-limited tokens.
- Auth is cookie-session based (`ce_session`, 30d); admins are whitelisted via `ADMIN_EMAILS` env.
- Wishlist works logged-out (localStorage) and merges into the account on login.
- Theme: light is `:root`, dark is `.dark` via next-themes (default dark). Platform-native binary overrides in `pnpm-workspace.yaml` keep linux-x64 (Replit) and win32-x64 (local dev).

## Product

- Portfolio with per-series notes (story, camera, film stock, lenses), format badges (35mm/120/digital), fullscreen lightbox with swipe gestures, geotagged shooting-location maps (per-project + global `/map`).
- Shop: limited-edition prints with live remaining counts and sold-out state, size-based pricing, weight/zone shipping estimator (KR free threshold), digital editions with instant download links.
- Accounts: order history with status timeline, download center, wishlist; admin dashboard at `/admin` for status transitions + tracking numbers.
- Newsletter signup + Instagram strip in the footer; per-page SEO with OG/JSON-LD, sitemap.xml, robots.txt.

## User preferences

- 결제 연동(Stripe 등 온라인 결제)은 **의도적으로 제외** — 프린트는 수동 주문 확인, 디지털은 자동 다운로드 발송 방식 유지.

## Content management

- Portfolio/About content lives in Sanity (Studio: https://cameraeye.sanity.studio). The web app reads it when `VITE_SANITY_PROJECT_ID` (=vh63tnwo) is set at build time; otherwise it falls back to `src/data/mockData.ts`.
- Shop products/prices stay in code (`lib/commerce/src/catalog.ts`) by design — the server must own pricing.

## Deployment

- Replit: full stack (web + API + Postgres) via the artifact configs.
- Vercel: `vercel.json` builds **only** the static frontend (`artifacts/cameraeye`) with SPA rewrites — the Express API does not run on Vercel, so API-backed features (orders, auth, inventory, wishlist sync) are inactive there; the frontend degrades gracefully. Host the API elsewhere and point the frontend at it if full features are needed on Vercel.

## Gotchas

- After editing `lib/api-spec/openapi.yaml`, always run codegen; it also re-runs `tsc --build` for libs.
- Orval may append duplicate export lines to `lib/api-client-react/src/index.ts` — keep it deduplicated.
- Generated query hooks require an explicit `queryKey` in `query` options (TanStack Query v5 types) — use the generated `get*QueryKey()` helpers.
- `vite.config.ts` throws without `PORT` and `BASE_PATH` env vars.
- Sanity studio schema files import the `sanity` package (not installed here) and are excluded from the web app's tsconfig include — don't import them from `src/`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
