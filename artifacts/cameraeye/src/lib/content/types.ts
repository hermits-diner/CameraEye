import type { CaptureFormat, ProjectCategory } from '@/data/mockData';
import type { SanityImage } from '@/lib/sanity/types';

export type { CaptureFormat, ProjectCategory };

/**
 * Image reference that can point either at a static public asset or at a
 * Sanity asset. OptimizedImage renders both (Sanity sources get responsive
 * srcsets + auto WebP via the Sanity CDN).
 */
export type ImageSource =
  | { kind: 'url'; src: string }
  | { kind: 'sanity'; image: SanityImage };

export interface PhotoLocation {
  lat: number;
  lng: number;
  label: string;
}

export interface ProjectImage {
  source: ImageSource;
  alt: string;
  location?: PhotoLocation;
}

/**
 * Unified portfolio project shape consumed by all pages. Content comes from
 * Sanity when configured, otherwise from the bundled mock data.
 */
export interface PortfolioProject {
  id: string;
  title: string;
  slug: string;
  category: ProjectCategory;
  year: number;
  client?: string;
  description: string;
  story?: string;
  format: CaptureFormat;
  filmStock?: string;
  camera?: string;
  lenses?: string[];
  featured: boolean;
  cover: ImageSource;
  images: ProjectImage[];
}

export interface AboutContent {
  bio: string;
  portrait: ImageSource;
  skills?: string[];
  contactEmail?: string;
  instagramHandle?: string;
}

export const FORMAT_LABELS: Record<CaptureFormat, string> = {
  '35mm': '35mm Film',
  '120': 'Medium Format',
  digital: 'Digital',
};
