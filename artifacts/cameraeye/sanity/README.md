# Sanity schemas moved

The Sanity Studio (and the canonical schema definitions) now live in the
repo-root [`studio/`](../../../studio) package:

- Schemas: `studio/schemaTypes/`
- Hosted Studio: https://cameraeye.sanity.studio (project `vh63tnwo`, dataset `production`)
- Deploy: `pnpm --filter @workspace/studio run deploy`

The frontend types that mirror these schemas are in
[`src/lib/sanity/types.ts`](../src/lib/sanity/types.ts).
