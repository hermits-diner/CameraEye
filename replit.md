# CameraEye

A photography portfolio single-page app (Vite + React), with optional Sanity CMS content and a local mock-data fallback. See `README.md` for full setup.

## Run & Operate

- `pnpm dev` — run the CameraEye dev server (http://localhost:5173)
- `pnpm build` — typecheck + production build
- `pnpm typecheck` — typecheck all packages
- `pnpm lint` — ESLint
- `pnpm format` — Prettier write
- Env: all optional (see `.env.example`). With no `VITE_SANITY_PROJECT_ID`, the app renders mock data.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- App: Vite 7, React 19, wouter, Tailwind CSS 4
- Data: TanStack Query + Sanity client (optional), falling back to `src/data/mockData.ts`
- Motion: Framer Motion, GSAP, Lenis

## Where things live

- App: `artifacts/cameraeye` (the only workspace package)
- Content layer / source of truth for data shape: `artifacts/cameraeye/src/lib/content.ts` and `src/lib/sanity/types.ts`
- Theme: `artifacts/cameraeye/src/index.css`
- Fallback content: `artifacts/cameraeye/src/data/mockData.ts`

## Architecture decisions

- **No backend.** The frontend talks to Sanity directly; the previous Express API server, OpenAPI/Orval codegen packages, and Drizzle DB layer were removed as unused.
- **Graceful data fallback.** Pages consume a normalized view model, so a missing/empty/erroring Sanity config transparently renders mock data — the site always works.
- **Only published Sanity content is read** (`useCdn: true`); no read token is embedded in the client bundle.
- **shadcn/ui is trimmed** to the components actually used (button, form, input, label, textarea, toast, toaster, tooltip); re-add others with the shadcn CLI as needed.

## Product

Editorial/portrait/campaign photography portfolio: a hero + horizontal film-strip home, a filterable archive, project detail pages with parallax imagery, an about page, and a contact form that opens the visitor's mail client.

## Gotchas

- `PORT`/`BASE_PATH` are injected by Replit in production; locally they default to `5173` / `/`.
- Never expose a Sanity token via a `VITE_`-prefixed env var — it would be inlined into the browser bundle.
