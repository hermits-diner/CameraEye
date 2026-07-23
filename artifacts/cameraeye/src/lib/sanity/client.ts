import { createClient } from '@sanity/client';

export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID || '',
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2024-07-23',
  useCdn: true,
});

export const previewClient = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID || '',
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2024-07-23',
  useCdn: false,
  token: import.meta.env.VITE_SANITY_READ_TOKEN,
});
