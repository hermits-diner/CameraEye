import { createClient, type SanityClient } from '@sanity/client';

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID ?? '';
const dataset = import.meta.env.VITE_SANITY_DATASET ?? 'production';

/**
 * True only when a Sanity project is configured. When false the app falls back
 * to local mock data, so the site keeps rendering without any CMS credentials.
 */
export const isSanityConfigured = projectId.length > 0;

/**
 * The Sanity client is created lazily: with an empty projectId `createClient`
 * throws, so we return null instead and let the content layer use mock data.
 * `useCdn: true` serves only published content — no read token is needed or
 * embedded in the client bundle.
 */
export const client: SanityClient | null = isSanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion: '2024-07-23',
      useCdn: true,
    })
  : null;
