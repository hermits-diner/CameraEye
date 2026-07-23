# CameraEye

A photography portfolio — a Vite + React single-page app with a cinematic, high-contrast editorial design. Content comes from [Sanity](https://www.sanity.io/) when configured, and falls back to bundled mock data so the site runs with zero setup.

## Stack

- **App:** Vite 7, React 19, TypeScript 5.9
- **Routing:** wouter
- **Data:** TanStack Query + Sanity client (optional), with a local mock-data fallback
- **Styling:** Tailwind CSS 4, a small set of shadcn/ui components
- **Motion:** Framer Motion, GSAP, Lenis smooth scroll
- **Monorepo:** pnpm workspaces (`artifacts/cameraeye` is the only app)

## Prerequisites

- Node.js 24+
- pnpm (via Corepack): `corepack enable`

## Setup

```bash
corepack enable
pnpm install
```

## Run

```bash
pnpm dev            # start the CameraEye dev server (http://localhost:5173)
pnpm build          # typecheck + production build
pnpm typecheck      # typecheck only
pnpm lint           # ESLint
pnpm format         # Prettier write
```

The app also runs directly from its package:

```bash
pnpm --filter @workspace/cameraeye run dev
```

## Environment variables

Copy `.env.example` to `.env` (git-ignored) and fill in what you need. All are optional — with none set, the site renders the built-in mock data.

| Variable                 | Default        | Purpose                                                             |
| ------------------------ | -------------- | ------------------------------------------------------------------- |
| `PORT`                   | `5173`         | Dev/preview server port (injected by Replit in production).         |
| `BASE_PATH`              | `/`            | Base path for the app (injected by Replit in production).           |
| `VITE_SANITY_PROJECT_ID` | _(empty)_      | Sanity project ID. When empty, the app uses mock data.              |
| `VITE_SANITY_DATASET`    | `production`   | Sanity dataset name.                                                |

> Only published Sanity content is read (`useCdn: true`), so **no read token is required or embedded in the client bundle**. Never expose a Sanity write/read token via a `VITE_`-prefixed variable — those are inlined into the browser bundle.

## Data sources

Pages read through a small content layer (`src/lib/content.ts`) that normalizes both sources into one view model:

- **Sanity configured** (`VITE_SANITY_PROJECT_ID` set) → fetches projects/about via GROQ queries in `src/lib/sanity/queries.ts`.
- **Not configured, empty, or a fetch error** → falls back to `src/data/mockData.ts`.

To model your Sanity content, mirror the `project` and `about` document shapes in `src/lib/sanity/types.ts`.

## Contact form

`src/pages/Contact.tsx` opens the visitor's mail client via a `mailto:` link. Set `CONTACT_EMAIL` in that file (or wire a form service such as Formspree) before going live.

## Project structure

```
artifacts/cameraeye/
├── index.html
├── vite.config.ts
└── src/
    ├── pages/            # Home, Projects, ProjectDetail, About, Contact, not-found
    ├── components/       # Navigation, PageTransition, ui/ (shadcn subset)
    ├── hooks/            # use-toast, use-smooth-scroll, use-document-title
    ├── lib/
    │   ├── content.ts    # data hooks + Sanity→view-model mapping + mock fallback
    │   └── sanity/       # client, queries, image, types
    └── data/mockData.ts  # fallback content
```
