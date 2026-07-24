import imageUrlBuilder from '@sanity/image-url';
import { client } from './client';

const builder = client ? imageUrlBuilder(client) : null;

// Chainable no-op stub so accidental calls without a configured Sanity
// project degrade to an empty URL instead of crashing.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stub: any = new Proxy(() => stub, {
  get: (_target, prop) => (prop === 'url' ? () => '' : () => stub),
  apply: () => stub,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function urlFor(source: any) {
  if (!builder) return stub;
  return builder.image(source);
}
