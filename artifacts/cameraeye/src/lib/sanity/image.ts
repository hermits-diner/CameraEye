import imageUrlBuilder from '@sanity/image-url';
import { client } from './client';
import type { SanityImage } from './types';

const builder = client ? imageUrlBuilder(client) : null;

/**
 * Resolve a Sanity image reference to a CDN URL. Returns '' when Sanity is not
 * configured or the source is missing, so callers can fall back to mock images.
 */
export function urlForImage(source: SanityImage | undefined | null): string {
  if (!builder || !source?.asset) return '';
  return builder.image(source).auto('format').fit('max').url();
}
