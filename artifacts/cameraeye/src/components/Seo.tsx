import { useEffect } from 'react';

export const SITE_URL = (
  import.meta.env.VITE_SITE_URL ?? 'https://camera-eye-v2-two.vercel.app'
).replace(/\/$/, '');

const SITE_NAME = 'Walden View';
const DEFAULT_DESCRIPTION =
  'Walden View — street photography from South Korea. 거리에서 마주친 장면들을 기록합니다. Fine art prints and digital editions available.';

interface SeoProps {
  /** Page title; rendered as `<title> · CameraEye`. */
  title?: string;
  description?: string;
  /** Absolute or site-relative URL of the social sharing image. */
  image?: string;
  /** Site-relative canonical path, e.g. `/projects/foo`. */
  path?: string;
  type?: 'website' | 'article' | 'product';
  /** Optional JSON-LD payload for structured data. */
  jsonLd?: Record<string, unknown>;
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Per-page SEO metadata: title, description, canonical URL, Open Graph /
 * Twitter cards and optional JSON-LD. SPA-style (mutates document.head).
 */
export function Seo({ title, description, image, path, type = 'website', jsonLd }: SeoProps) {
  useEffect(() => {
    const fullTitle = title ? `${title} · ${SITE_NAME}` : `${SITE_NAME} — Street Photography, South Korea`;
    const desc = description ?? DEFAULT_DESCRIPTION;
    const url = path ? `${SITE_URL}${path}` : SITE_URL;
    const img = image
      ? image.startsWith('http')
        ? image
        : `${SITE_URL}${image}`
      : `${SITE_URL}/images/editorial-1.jpg`;

    document.title = fullTitle;
    upsertMeta('name', 'description', desc);
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', desc);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', img);
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', desc);
    upsertMeta('name', 'twitter:image', img);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    const scriptId = 'seo-json-ld';
    document.getElementById(scriptId)?.remove();
    if (jsonLd) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
  }, [title, description, image, path, type, jsonLd]);

  return null;
}
