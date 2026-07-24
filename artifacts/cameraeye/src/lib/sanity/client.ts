import { createClient, type SanityClient } from '@sanity/client';

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID as string | undefined;
const dataset = (import.meta.env.VITE_SANITY_DATASET as string | undefined) || 'production';

/**
 * Clients are null when VITE_SANITY_PROJECT_ID is not configured — creating
 * a client with an empty projectId throws at module load and white-screens
 * the whole app. Callers must guard (the content adapter already gates all
 * queries on `sanityConfigured`).
 */
export const client: SanityClient | null = projectId
  ? createClient({
      projectId,
      dataset,
      apiVersion: '2024-07-23',
      useCdn: true,
    })
  : null;

export const previewClient: SanityClient | null = projectId
  ? createClient({
      projectId,
      dataset,
      apiVersion: '2024-07-23',
      useCdn: false,
      token: import.meta.env.VITE_SANITY_READ_TOKEN,
    })
  : null;
